import { admitBrowser } from './browser-admission.mjs';
// tools/check-pool.mjs - THE SAME CHECKS, WITH A SMALL NUMBER OF HANDS.
// The parent keeps every answer until that check finishes: two tools may work together, but their words never mix.
// Each hand has one port and one long-lived server. Page tools still ask cdp.mjs whether that server serves this checkout.
// A browser slot is held for the WHOLE check, not merely for launch, so a large page lab cannot crowd another off RAM.
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join, resolve } from 'node:path';
import { killTreeSync, launchBrowser } from './browser-profile.mjs';
import { browserExecutable } from './cdp.mjs';

/* Alone after the pool: measured frame rate changes when another lab has the GPU; the online test opens TWO browsers;
   recovery tests protocol deadlines over twenty page reloads; textfit-full has its own ten-minute wall budget; and a leak or
   cleanup verdict can only mean something once every earlier child is gone. */
export const SERIAL_TAIL = {
  'mobile-perf': 'frame timing must be measured without other labs on the GPU',
  'boss-music': 'its mock audio clock uses real timers to check two complete loops',
  /* These two pages rehearse long, stateful fights or a hero-by-hero climb. In the pooled borrowed browser, the court
     once failed to drain at half health and the Pyromancer began the tower climb on the wrong floor. Five --jobs=1
     reruns of each passed in fresh browser profiles. Keep their answer measured alone until the cause is understood. */
  'firsthour': 'the court half-health phase needs a fresh browser profile after a pooled-only failure',
  'fallingtower2-keys': 'the seven-hero climb needs a fresh profile after a pooled-only checkpoint failure',
  /* archmage-folly and unburied-look now pin their random streams and run in the browser pool. Their thresholds remain unchanged. */
  'online-coop': 'host and guest need two simultaneous browsers of their own',
  'cdp-recovery': 'tests protocol timeouts and twenty fresh-page reloads without pool contention',
  'textfit': 'opens many game pages and needs its own fresh browser for the picture verdict',
  'textfit-full': 'its fixed ten-minute budget and picture verdict need its own fresh browser',
  'profile-cleanup': 'must inspect completed children after the pool',
  'profile-leaks': 'must inspect the whole run after every child closes',
};

/* Follow local imports, rather than a handwritten page-name list that a new check could silently escape. If a module
   drives cdp.mjs, headless.mjs or browser-profile.mjs, the check needs a browser slot. Unknown imports are treated as
   page work; that costs a slot, never permits an extra browser. */
export function usesBrowser(name, root) {
  if (name === 'syntax') return false;
  const seen = new Set();
  const visit = p => {
    p = resolve(root, p); if (!p.startsWith(resolve(root, 'tools') + '\\') && !p.startsWith(resolve(root, 'tools') + '/')) return false;
    if (seen.has(p)) return false; seen.add(p);
    let source; try { source = readFileSync(p, 'utf8'); } catch { return true; }
    source = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '');
    if (/\b(openPage|launchBrowser)\s*\(|(?:tools\/)?(?:cdp|headless|browser-profile)\.mjs/.test(source)) return true;
    for (const m of source.matchAll(/(?:from\s*|import\s*\(|import\s*)['"](\.[^'"]+\.m?js)['"]/g)) {
      if (visit(resolve(p, '..', m[1]))) return true;
    }
    return false;
  };
  return visit('tools/' + (name === 'pixels' ? 'headless' : name === 'textfit-full' ? 'textfit' : name) + '.mjs');
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
const checkServer = async (root, port) => {
  const base = 'http://localhost:' + port + '/';
  try { const r = await fetch(base + 'src/lookpass.js', { signal: AbortSignal.timeout(2000) });
    return r.ok && await r.text() === readFileSync(join(root, 'src/lookpass.js'), 'utf8'); } catch { return false; }
};
async function startServer(root, port) {
  if (await checkServer(root, port)) return null;
  const child = spawn(process.execPath, ['serve.mjs'], { cwd: root, stdio: 'ignore', env: { ...process.env, PORT: String(port), BRACKEN_PARENT: String(process.pid) } });
  for (let i = 0; i < 60; i++) { if (await checkServer(root, port)) return child; if (child.exitCode !== null) break; await sleep(250); }
  child.kill(); throw new Error('worker server did not come up on port ' + port + ' (or that port belongs to another checkout)');
}

export async function execute(job, root, port) {
  // Synthetic supervisor self-tests use inline Node programs and allocate no browser.
  if (job.args.some(a=>/^tools[\\/].+\.mjs$/.test(a)) && !job.browserRun && !['profile-cleanup','profile-leaks','profile-sweep'].includes(job.name) && usesBrowser(job.name,root)) {
    try { await admitBrowser({onWait:r=>{console.log('[resource] '+job.name+' waiting: '+r.available+' MB free, needs '+r.required+' MB');job.onWait?.(r);}}); }
    catch(e){if(!e.resourceStop)throw e;return{name:job.name,ok:false,interrupted:true,resourceStop:true,exitCode:null,signal:null,ms:0,memory:{totalMb:0,rendererMb:0},last:e.message,out:[e.message]};}
  }
  return new Promise(resolveResult => {
    const t0 = Date.now(), attempt = randomUUID(), stdout = [], stderr = [], child = spawn(job.cmd, job.args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...job.env, BRACKEN_CHECK: job.name, BRACKEN_ATTEMPT: attempt, PORT: String(port) } });
    if (job.onStart) job.onStart(child.pid);
    let timedOut = false, error = null, done = false, outBytes = 0, errBytes = 0, forcedInterruption = null;
    /* Some checks catch a failed evaluation and keep polling readiness. A dead browser cannot satisfy that poll.
       End ONLY this recorded child and keep its attempt without a verdict, even if its own catch hides the disconnect. */
    const disconnectGuard = setInterval(() => {
      if (done || forcedInterruption) return;
      let reason = job.browserRun?.failure;
      if (!reason && process.env.BRACKEN_PROCESS_LOG) try {
        const rows = readFileSync(process.env.BRACKEN_PROCESS_LOG, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
        reason = rows.find(e => e.attempt === attempt && e.type === 'interrupted')?.reason;
      } catch {}
      if (reason) { forcedInterruption = reason; killTreeSync(child.pid); }
    }, 1000); disconnectGuard.unref();
    /* spawnSync's 1 MiB limit was part of the old verdict: a runaway tool failed instead of filling RAM. */
    child.stdout.on('data', b => { outBytes += b.length; if (outBytes > 1048576) { error = new Error('stdout maxBuffer length exceeded'); child.kill(); } else stdout.push(b); });
    child.stderr.on('data', b => { errBytes += b.length; if (errBytes > 1048576) { error = new Error('stderr maxBuffer length exceeded'); child.kill(); } else stderr.push(b); });
    const timer = job.timeout ? setTimeout(() => { timedOut = true; child.kill(); }, job.timeout) : null;
    child.on('error', e => { error = e; });
    child.on('close', (code, signal) => { if (done) return; done = true; clearInterval(disconnectGuard); if (timer) clearTimeout(timer);
      const lines = (Buffer.concat(stdout).toString('utf8') + Buffer.concat(stderr).toString('utf8') + (error ? '\n' + error.stack : '')).trim().split(/\r?\n/);
      let events = [];
      try { events = readFileSync(process.env.BRACKEN_PROCESS_LOG, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(e => e.attempt === attempt); } catch {}
      const interrupted = events.find(e => e.type === 'interrupted') || (forcedInterruption ? { reason: forcedInterruption } : null);
      const memory = { totalMb: Math.max(0, ...events.map(e => e.peak?.totalMb || 0)), rendererMb: Math.max(0, ...events.map(e => e.peak?.rendererMb || 0)) };
      resolveResult({ name: job.name, exitCode: code, signal, ok: code === 0 && !timedOut && !error && !interrupted, ms: Date.now() - t0, memory,
        ...(interrupted || (code === null && !timedOut && !error) ? { interrupted: true } : {}),
        last: interrupted ? interrupted.reason : timedOut ? 'TIMED OUT after ' + Math.round(job.timeout / 60000) + ' min' : lines.at(-1) || '', out: lines }); });
  });
}

/* One browser per occupied browser slot; cdp.mjs makes a fresh browser context for every openPage call. A worker can
   borrow the same Chrome again on its next check without borrowing the last check's storage. */
async function startBrowser() {
  await admitBrowser();
  const exe = browserExecutable(); if (!exe) throw new Error('no Chrome or Edge found (set BRACKEN_BROWSER)');
  const run = launchBrowser(exe, ['--headless=new', '--remote-debugging-port=auto', '--mute-audio', '--no-first-run',
    '--window-size=1280,720', '--autoplay-policy=no-user-gesture-required', ...(process.env.CI ? ['--no-sandbox'] : []), 'about:blank'], 'look');
  try { return { run, port: await run.devtoolsPort() }; } catch (e) { await run.close(); throw e; }
}
async function clearContexts(port) {
  const info = await (await fetch('http://127.0.0.1:' + port + '/json/version')).json();
  const ws = new WebSocket(info.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); ws.onmessage = e => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id, timer = setTimeout(() => { pending.delete(n); rej(new Error(method + ' timed out')); }, 15000);
    pending.set(n, m => { clearTimeout(timer); if (m.error) rej(new Error(m.error.message)); else res(m.result || {}); }); ws.send(JSON.stringify({ id: n, method, params })); });
  try { for (let i = 0; i < 60; i++) { const r = await send('Target.getBrowserContexts');
      if (!(r.browserContextIds || []).length) return;
      for (const browserContextId of r.browserContextIds) try { await send('Target.disposeBrowserContext', { browserContextId }); }
        catch (e) { if (!/already pending|not found|no browser context|failed to find context with id/i.test(e.message)) throw e; }
      await sleep(100); }
    throw new Error('borrowed browser kept a context after the check ended');
  } finally { ws.close(); }
}

export async function runPool(rows, { ROOT, jobs, maxBrowsers, portFor, onDone = () => {}, onStart = () => {}, recycleEvery = 12, shouldStop = () => false }) {
  const answer = new Map(rows.filter(r => 'ok' in r).map(r => [r.name, r]));
  const time = JSON.parse(readFileSync(join(ROOT, 'tools/check-timings.json'), 'utf8'));
  /* A few tools use their own CDP driver and must keep their own browser/profile. Run them after the shared browsers
     close, so even --max-browsers=1 means one real browser at a time (online-coop is the stated two-browser exception). */
  const ownBrowser = r => { const name = r.name === 'pixels' ? 'headless' : r.name === 'textfit-full' ? 'textfit' : r.name;
    try { return /\blaunchBrowser\s*\(/.test(readFileSync(join(ROOT, 'tools', name + '.mjs'), 'utf8')); } catch { return false; } };
  const regular = rows.filter(r => !('ok' in r) && !SERIAL_TAIL[r.name] && !ownBrowser(r));
  const tail = rows.filter(r => !('ok' in r) && (SERIAL_TAIL[r.name] || ownBrowser(r)));
  regular.sort((a, b) => (time[b.name] || 0) - (time[a.name] || 0) || a.name.localeCompare(b.name));
  const browser = new Map([...regular, ...tail].map(r => [r.name, usesBrowser(r.name, ROOT)]));
  const servers = new Map(), shared = new Map(), busy = new Map(), free = Array.from({ length: jobs }, (_, i) => i);
  const browserSlots = new Set();
  const serve = async slot => { if (!servers.has(slot)) servers.set(slot, await startServer(ROOT, portFor(slot))); };
  const stopServers = async () => { const children = [...servers.values()].filter(Boolean); for (const child of children) child.kill();
    await Promise.all(children.map(child => child.exitCode !== null ? null : Promise.race([new Promise(r => child.once('exit', r)), sleep(5000)])));
    servers.clear(); };
  const launch = async (job, slot, browserSlot = null) => { const page = browser.get(job.name);
    try { if (page && !['profile-cleanup', 'profile-leaks'].includes(job.name)) await serve(slot);
      let env = job.env;
      if (browserSlot !== null) {
        const prior = shared.get(browserSlot);
        if (prior && (prior.run.exited || prior.run.failure || prior.used >= recycleEvery)) { await prior.run.close(); shared.delete(browserSlot); }
        if (!shared.has(browserSlot)) shared.set(browserSlot, { ...await startBrowser(), used: 0 });
        env = { ...env, BRACKEN_BROWSER_PORT: String(shared.get(browserSlot).port) }; }
      const result = await execute({ ...job, env, browserRun: browserSlot !== null ? shared.get(browserSlot).run : null,
        onStart: pid => onStart(job.name, pid) }, ROOT, portFor(slot));
      if (browserSlot !== null) {
        const b = shared.get(browserSlot); b.used++;
        result.memory = { before: b.before || null, after: await b.run.sampleMemory(), peak: b.run.peak, browserPid: b.run.child.pid };
        if (b.run.failure || b.run.exited) { result.ok = false; result.interrupted = true; result.last = b.run.failure || 'shared browser died';
          await b.run.close(); shared.delete(browserSlot); }
        else { await clearContexts(b.port); b.before = await b.run.sampleMemory(); }
      }
      return result; }
    catch (e) { return { name: job.name, ok: false, interrupted: true, ...(e.resourceStop ? {resourceStop:true} : {}), ms: 0, last: e.message, out: [e.stack || String(e)] }; }
    finally { if (browserSlot !== null) browserSlots.delete(browserSlot); } };
  try {
    while ((!shouldStop() && regular.length) || busy.size) {
      for (let i = 0; i < free.length && regular.length && !shouldStop();) {
        const slot = free[i], k = regular.findIndex(r => !browser.get(r.name) || (slot < maxBrowsers && !browserSlots.has(slot)));
        if (k < 0) { i++; continue; }
        const job = regular.splice(k, 1)[0]; free.splice(i, 1);
        const browserSlot = browser.get(job.name) ? slot : null;
        if (browserSlot !== null) browserSlots.add(browserSlot);
        busy.set(slot, launch(job, slot, browserSlot).then(result => ({ slot, result })));
      }
      if (!busy.size) break;
      const { slot, result } = await Promise.race(busy.values()); busy.delete(slot); free.push(slot); free.sort((a, b) => a - b);
      answer.set(result.name, result); onDone(result);
    }
    for (const b of shared.values()) await b.run.close(); shared.clear();
    for (const job of tail) {
      if (shouldStop()) break;
      /* Text fit draws thousands of frames in several contexts. It reported a Weaver plate overlap once while using
         borrowed incognito Chrome; six --jobs=1 reruns with its own fresh browser passed. Keep both scopes on their original
         browser lifecycle, while the rest of the pool still reuses Chrome where that answer stays stable. */
      for (const b of shared.values()) await b.run.close(); shared.clear();
      if (job.name === 'profile-cleanup') await stopServers();
      const tr = await launch(job, 0); answer.set(job.name, tr); onDone(tr);
    }
  } finally { for (const b of shared.values()) await b.run.close(); await stopServers(); }
  return rows.filter(r => answer.has(r.name)).map(r => answer.get(r.name));
}
