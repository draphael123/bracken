// tools/cdp.mjs — THE PAGE, HEADLESS, FOR A TOOL. The same approach as tools/headless.mjs (the installed Chrome or Edge,
// driven over the DevTools protocol with Node's own WebSocket), as a helper the readability tools share.
//   const pg = await openPage();  await pg.evalp('BK.state');  pg.close();
// It starts serve.mjs on PORT (default: this checkout's own block, tools/ports.mjs) when nothing answers there, and
// REFUSES a server that is serving another
// checkout: the served src/lookpass.js must be byte-for-byte this checkout's.
import { spawn } from 'child_process';
import { appendFileSync, existsSync, readFileSync } from 'fs';
import { launchBrowser } from './wall-pattern-browser-profile.mjs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { PORT_BASE } from './ports.mjs';   /* a port block per checkout, so two worktrees do not fight over 5892 (tools/ports.mjs) */

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
export const browserExecutable = () => [process.env.BRACKEN_BROWSER, ...BROWSERS].filter(Boolean).find(p => existsSync(p));

/* A suite worker may lend us a browser it already paid to start. Each openPage gets a NEW Chrome browser context, not
   merely a new tab: saves, settings, cookies and localStorage cannot cross the seam. The context is disposed when the
   tool closes, and the suite parent makes a second disposal pass after each child in case that child exits abruptly. */
async function borrowedTarget(port) {
  const info = await (await fetch('http://127.0.0.1:' + port + '/json/version')).json();
  const ws = new WebSocket(info.webSocketDebuggerUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id, timer = setTimeout(() => { pending.delete(n); rej(new Error(method + ' timed out')); }, 15000);
    pending.set(n, m => { clearTimeout(timer); if (m.error) rej(new Error(m.error.message)); else res(m.result || {}); }); ws.send(JSON.stringify({ id: n, method, params })); });
  try { const { browserContextId } = await send('Target.createBrowserContext');
    const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
    let page = null; for (let i = 0; i < 40 && !page; i++) { const list = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
      page = list.find(t => t.id === targetId); if (!page) await sleep(100); }
    if (!page) throw new Error('borrowed browser did not expose its new page');
    let closing = null;
    return { wsUrl: page.webSocketDebuggerUrl, close: () => closing ||= (async () => {
      /* Many tools call pg.close() without awaiting it. The parent checks that this context has disappeared before
         lending the browser again, so an already-pending disposal is harmless here. */
      try { await send('Target.disposeBrowserContext', { browserContextId }); } catch {} finally { ws.close(); }
    })() };
  } catch (e) { ws.close(); throw e; }
}

export async function openPage(opts = {}) {
  const PORT = +(process.env.PORT || opts.port || PORT_BASE), URL0 = 'http://localhost:' + PORT + '/';
  const up = async () => { try { const r = await fetch(URL0, {signal:AbortSignal.timeout(2000)}); return r.ok; } catch { return false; } };
  let server = null;
  const stopServer = () => { process.removeListener('exit', stopServer); if (server) { try { server.kill(); } catch {} server = null; } };
  if (!(await up())) { server = spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, stdio: 'ignore', env: { ...process.env, PORT: String(PORT), BRACKEN_PARENT: String(process.pid) } }); process.once('exit', stopServer); for (let i = 0; i < 40 && !(await up()); i++) await sleep(250); }
  if (!(await up())) { stopServer(); throw new Error('dev server did not come up on ' + URL0); }
  let loan = null, run = null, closeConnection = () => {};
  try {
  const mine = readFileSync(join(ROOT, 'src/lookpass.js'), 'utf8');
  const served = await (await fetch(URL0 + 'src/lookpass.js', {signal:AbortSignal.timeout(5000)})).text().catch(() => '');
  if (served !== mine) { stopServer(); throw new Error('the server on ' + URL0 + ' is serving another checkout (src/lookpass.js differs): set PORT to a free port'); }
  const borrowedPort = opts.browserPort || process.env.BRACKEN_BROWSER_PORT;
  const exe = browserExecutable(); if (!exe && !borrowedPort) throw new Error('no Chrome or Edge found (set BRACKEN_BROWSER to its executable)');
  /* THE PROFILE IS THROWN AWAY: browser-profile.mjs makes it, kills the browser tree and removes it on close, on a failed start and on exit */
  const borrowed = !!borrowedPort;
  run = borrowed ? null : launchBrowser(exe, ['--headless=new', '--remote-debugging-port=auto', '--mute-audio', '--no-first-run', '--window-size=1280,720', '--autoplay-policy=no-user-gesture-required', ...(process.env.CI ? ['--no-sandbox'] : []), ...(opts.args || []), 'about:blank'], 'look');
  const dbg = borrowed ? +borrowedPort : await run.devtoolsPort();
  loan = borrowed ? await borrowedTarget(dbg) : null;
  let wsUrl = loan && loan.wsUrl;
  for (let i = 0; i < 60 && !wsUrl; i++) { try { const t = await (await fetch('http://127.0.0.1:' + dbg + '/json/list', {signal:AbortSignal.timeout(2000)})).json(); const pg = t.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
  if (!wsUrl) throw new Error('could not reach the browser');
  const ws = new WebSocket(wsUrl); await new Promise((res, rej) => { const timer = setTimeout(() => { ws.close(); rej(new Error('browser WebSocket did not open')); }, 15000);
    ws.onopen = () => { clearTimeout(timer); res(); }; ws.onerror = e => { clearTimeout(timer); rej(e); }; });
  let id = 0, closing = false, disconnected = false; const pending = new Map(), errors = [];
  const drain = reason => { for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error(reason)); } pending.clear(); };
  closeConnection = () => { closing = true; drain('page closed'); try { ws.close(); } catch {} };
  ws.onclose = () => { disconnected = true;
    const reason = 'BRACKEN_BROWSER_DISCONNECTED: page connection closed';
    if (!closing && process.env.BRACKEN_PROCESS_LOG) try { appendFileSync(process.env.BRACKEN_PROCESS_LOG,
      JSON.stringify({ type: 'interrupted', check: process.env.BRACKEN_CHECK, attempt: process.env.BRACKEN_ATTEMPT,
        time: Date.now(), reason }) + '\n'); } catch {}
    drain(reason);
  };
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id); clearTimeout(p.timer); pending.delete(m.id);
    if (m.error) p.reject(new Error(m.error.message || JSON.stringify(m.error))); else p.resolve(m);
  }
    if (m.method && opts.onEvent) opts.onEvent(m);   /* (a tool that wants the protocol's events, e.g. Tracing.dataCollected: tools/mobile-profile.mjs) */
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text); };
  // Navigation can destroy a context before its evaluation answers. Bound the protocol wait as well.
  const send = (method, params = {}, wait = 15000) => new Promise((res, rej) => {
    if (disconnected || closing || ws.readyState !== WebSocket.OPEN) return rej(new Error('BRACKEN_BROWSER_DISCONNECTED: connection is closed'));
    const i = ++id, timer = setTimeout(() => { pending.delete(i); rej(new Error(method + ' did not answer within ' + wait + 'ms')); }, wait);
    pending.set(i, { resolve: res, reject: rej, timer });
    try { ws.send(JSON.stringify({ id: i, method, params })); } catch (e) { clearTimeout(timer); pending.delete(i); rej(e); }
  });
  const evalp = async (expr, timeout = 1800000) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout }, timeout + 1000);
    if (r.error) throw new Error(r.error.message || JSON.stringify(r.error));
    if (r.result && r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception ? r.result.exceptionDetails.exception.description : r.result.exceptionDetails.text);
    return r.result && r.result.result ? r.result.result.value : undefined; };
  await send('Runtime.enable'); await send('Page.enable');
  // Physics-only audits do not need remote font stylesheets to delay every fresh document.
  // Pixel and text-layout tools keep the normal fonts unless they explicitly opt out.
  const blocked = [];
  if (opts.fonts === false) blocked.push('https://fonts.googleapis.com/*', 'https://fonts.gstatic.com/*');
  if (opts.audioFiles === false) blocked.push(URL0 + 'audio/*');   /* layout-only tools still initialize audio to hide its banner, but decode no clips */
  if (blocked.length) { await send('Network.enable'); await send('Network.setBlockedURLs', { urls: blocked }); }
  /* opts.seed: THE PAGE'S Math.random IS A SEEDED STREAM, from the first script of every document (so it survives pg.reload()). The sim is
     fixed-step and deterministic except for the ~850 Math.random calls in src/main.js (drops, crystal regrowth delays, foe rolls, particles),
     so a physics/ride/pose check that waits "N frames" for one of them passed or failed by the dice. Seeded, the same frames run every time. */
  if (opts.seed !== undefined) await send('Page.addScriptToEvaluateOnNewDocument', { source: '(()=>{let s=' + (opts.seed >>> 0) + ';Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})()' });
  /* THE GAME SPEED IS PINNED (Daniel 10-12: results must not change with the player's setting): every page a tool opens starts with a settings file at the speed the
     tools were calibrated at (0.6, the default until batch 92 made it 100%), already migrated (speedV3), unless the page has settings of its own. opts.speed overrides it
     (a number), opts.hints (none / low / medium / high; default HIGH: the tools were calibrated on every hint, claude/hintlevel; a NEW player gets MEDIUM from the game itself), opts.speed === false leaves the game's own default and migration alone (tools/settings-tabs.mjs tests those). A tool that sets BK.SET.speed still wins. */
  if (opts.speed !== false) await send('Page.addScriptToEvaluateOnNewDocument', { source: '(()=>{try{if(!localStorage.getItem("bracken.settings"))localStorage.setItem("bracken.settings",JSON.stringify({speed:' + (typeof opts.speed === 'number' ? opts.speed : process.env.BRACKEN_SPEED ? +process.env.BRACKEN_SPEED : 0.6) + ',speedV2:1,speedV3:1,hints:' + JSON.stringify(opts.hints || 'high') + ',hintsV1:1}));}catch(e){}})()' });
  await send('Page.navigate', { url: URL0 });
  let ready = false;
  for (let i = 0; i < 480 && !ready && !opts.noWait; i++) { ready = await evalp('typeof window.BK === "object" && !!window.BK.lookPass', 2000).catch(e => { if (disconnected) throw e; return false; }); if (!ready) await sleep(250); }
  if (!ready && !opts.noWait) throw new Error('the page never put up window.BK');   /* opts.noWait: the caller wants the page MID-BOOT (tools/loading-screen.mjs) */
  /* A lab can load a hundred complete sprite sets in one synchronous evaluation. V8 does not promptly collect their native
     backing allocations. Collect after boot and each lab BK.load, without advancing simulation or changing the game's loader.
     The load-leak audit explicitly opts out: its no-forced-GC control must remain a real no-forced-GC control. */
  const prepareLab = async () => {
    if (opts.noWait || process.env.BRACKEN_LAB_GC === '0') return;
    if (opts.gcLoads !== false) await evalp(`(()=>{
      if (typeof gc !== 'function' || !window.BK || BK.load.__labGc) return false;
      const load = BK.load;
      BK.load = function(...args) { try { return load.apply(this, args); } finally { gc(); } };
      BK.load.__labGc = true; return true;
    })()`);
    await send('HeapProfiler.collectGarbage');
  };
  await prepareLab();
  /* A KEY PRESS, so the page makes its AudioContext and stops drawing PRESS A KEY FOR SOUND over every frame */
  if (opts.audio !== false) for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 });
  const port = await evalp('location.port', 10000);
  if (String(port) !== String(PORT)) throw new Error('the page is on port ' + port + ', not ' + PORT);
  const reload = async () => {
    const previousOrigin = await evalp('localStorage.clear(); window.__labReloading = true; performance.timeOrigin', 10000);
    const url = URL0 + '?labReload=' + Date.now() + '-' + id;
    await send('Page.navigate', { url });
    let ready = false;
    /* waits on the CONDITION with a wall-clock deadline: 120 x 100 ms was ~12 s of polls when the page answered at once, and a loaded machine's boot (six lanes, 2026-10) took longer than that */
    for (const until = Date.now() + (+process.env.LAB_BOOT_MS || 90000); Date.now() < until && !ready;) {   /* LAB_BOOT_MS: a longer deadline on a machine at 100% (claude/ksar2: ten lanes, most reloads timed out) */
      ready = await evalp('performance.timeOrigin !== ' + JSON.stringify(previousOrigin) + ' && location.href === ' + JSON.stringify(url) + ' && !window.__labReloading && typeof window.BK === "object" && !!window.BK.lookPass', 2000).catch(e => { if (disconnected) throw e; return false; });
      if (!ready) await sleep(100);
    }
    if (!ready) throw new Error('the fresh lab page did not initialize');
    await prepareLab();
  };
  return { evalp, send, errors, PORT, browserPort: dbg, dbg, reload, close() { closeConnection(); stopServer(); return loan ? loan.close() : run.close(); } };
  } catch (e) { closeConnection(); stopServer(); if (loan) await loan.close(); if (run) await run.close(); throw e; }
}
