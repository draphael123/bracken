// tools/headless.mjs — THE LABS WITHOUT A WINDOW.
// The fight and boss labs run inside the page, so they only ever ran when somebody had the game open. This starts the
// dev server if it is not up, launches the Chrome (or Edge) already installed on this machine headless, drives it over
// the DevTools protocol with Node's own WebSocket - nothing to install - and runs a lab in the page.
//   node tools/headless.mjs                      a short boss pass (knight and paladin, four bosses) and a kill-zone sweep
//   node tools/headless.mjs boss spire,reef      the boss lab on those levels, every hero
//   node tools/headless.mjs expr "BK.fightLab({ levels: ['wood'] })"
//   node tools/headless.mjs runtimefloats         the playtest bot plays every level; RUNTIMEFLOAT findings + screenshots
// Exit code 1 if a boss in the short pass goes unkilled or the page throws.
import { launchBrowser } from './browser-profile.mjs';
import { spawn } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = +(process.env.PORT || 5860), URL0 = 'http://localhost:' + PORT + '/';
const BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const up = async () => { try { const r = await fetch(URL0); return r.ok; } catch { return false; } };

async function main() {
  const [mode = 'short', arg = ''] = process.argv.slice(2);
  let server = null;
  if (!(await up())) { server = spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, stdio: 'ignore', env: { ...process.env, BRACKEN_PARENT: String(process.pid) } }); for (let i = 0; i < 40 && !(await up()); i++) await sleep(250); }
  if (!(await up())) throw new Error('dev server did not come up on ' + URL0);
  const exe = BROWSERS.find(p => existsSync(p)); if (!exe) throw new Error('no Chrome or Edge found');
  const dbg = 9300 + Math.floor(Math.random() * 400);
  const run = launchBrowser(exe, ['--headless=new', '--remote-debugging-port=' + dbg, '--mute-audio', '--no-first-run', '--autoplay-policy=no-user-gesture-required', ...(process.env.CI ? ['--no-sandbox'] : []), 'about:blank'], 'headless'), chrome = run.child;   /* a failed start or a thrown error ends in process.exit: browser-profile's exit hook takes the profile */
  let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) { try { const t = await (await fetch('http://127.0.0.1:' + dbg + '/json/list')).json(); const pg = t.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
  if (!wsUrl) throw new Error('could not reach the browser');
  const ws = new WebSocket(wsUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(), errors = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text); };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalp = async (expr, timeout = 900000) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout });
    if (r.result && r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception ? r.result.exceptionDetails.exception.description : r.result.exceptionDetails.text);
    return r.result && r.result.result ? r.result.result.value : undefined; };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Page.navigate', { url: URL0 });
  for (let i = 0; i < 80; i++) { if (await evalp('typeof window.BK === "object" && !!window.BK.bossLab').catch(() => false)) break; await sleep(250); }
  let code = 0;
  try {
    if (mode === 'expr') { console.log(JSON.stringify(await evalp('(async () => JSON.parse(JSON.stringify(await (' + arg + '))))()'), null, 1)); }
    else if (mode === 'floats') {   /* src/floatlab.js: every sprite's pixels against the tiles, and every water creature against its water */
      const r = await evalp('(async () => { const r = await BK.floatLab(' + (arg ? JSON.stringify({ levels: arg.split(',') }) : '') + '); return { levels: r.levels, sprites: r.sprites, hits: r.hits, water: r.water }; })()');
      for (const h of r.hits) console.log('  ' + h); for (const h of r.water) console.log('  WATER ' + h);
      console.log(r.levels + ' levels, ' + r.sprites + ' sprites. ' + (r.hits.length + r.water.length ? (r.hits.length + r.water.length) + ' in the air, through the ground or out of the water.' : 'nothing in the air, through the ground or out of the water.'));
      if (r.hits.length + r.water.length) code = 1; }
    else if (mode === 'runtimefloats') {   /* src/playtest.js's play pass, sampled every half second: floaters.mjs and floatLab() only look at a level at rest */
      const levels = arg ? arg.split(',') : null;
      const steps = +(process.env.RF_STEPS || 5400);   /* 90s of play per level by default */
      const expr = '(async () => { const r = await BK.playtest({ mode: "play", quiet: true, playSteps: ' + steps + (levels ? ', levels: ' + JSON.stringify(levels) : '') + ' }); ' +
        'const rf = r.findings.filter(f => f.kind === "RUNTIMEFLOAT"); ' +
        'return { perLevel: r.levels.map(l => ({ id: l.id, n: l.findings.filter(x => x.kind === "RUNTIMEFLOAT").length })), ' +
        'findings: rf.map(f => ({ level: f.level, msg: f.msg, where: f.where })), shots: rf.filter(f => f.shot).map(f => ({ level: f.level, msg: f.msg, where: f.where, shot: f.shot })) }; })()';
      const r = await evalp(expr);
      console.log('per level:');
      for (const l of r.perLevel) if (l.n) console.log('  ' + l.id.padEnd(12) + l.n + ' floating');
      const clean = r.perLevel.filter(l => !l.n).length;
      console.log('  (' + clean + ' of ' + r.perLevel.length + ' levels clean)');
      if (r.findings.length) { console.log('\nfindings:'); for (const f of r.findings) console.log('  ' + f.level.padEnd(12) + f.msg + '   @' + f.where); }
      const OUT = join(ROOT, 'tools', 'out', 'runtime-floaters');
      if (r.shots.length) { mkdirSync(OUT, { recursive: true });
        r.shots.forEach((s, n) => { const p = join(OUT, s.level + '-' + n + '.png');
          writeFileSync(p, Buffer.from(s.shot.replace(/^data:image\/png;base64,/, ''), 'base64')); console.log('  screenshot: ' + p + ' (' + s.level + ': ' + s.msg + ')'); }); }
      console.log(r.findings.length ? '\n' + r.findings.length + ' runtime floater(s).' : '\nnothing floats once the level has been played.');
      if (r.findings.length) code = 1; }
    else {
      const bosses = mode === 'boss' && arg ? arg.split(',') : ['wood', 'kings', 'waymeet', 'undercrown'];
      const heroes = mode === 'boss' ? null : ['knight', 'paladin'];
      const res = await evalp('(async () => { const r = await BK.bossLab(' + JSON.stringify(Object.assign({ bosses, maxSecs: 150 }, heroes ? { heroes } : {})) + '); return r.rows.map(x => ({ lvl: x.lvl, h: x.h, killed: x.killed, secs: x.secs, hp: x.hpLeftPct, taken: x.takenPerMin, skipped: x.skipped })); })()');
      for (const r of res) { console.log((r.lvl + '/' + r.h).padEnd(22), r.skipped ? 'skipped: ' + r.skipped : r.killed ? r.secs + 's' : 'ALIVE ' + r.hp + '%', r.taken !== undefined ? ' taken/min ' + r.taken : ''); if (!r.skipped && !r.killed && mode === 'short') code = 1; }
      if (mode === 'short') { const kz = await evalp('BK.killLab ? BK.killLab({ levels: ' + JSON.stringify(bosses) + ', every: 6 }) : null'); if (kz) { console.log('kill-zone sweep:', JSON.stringify(kz.summary)); if (kz.bad) code = 1; } }
    }
  } catch (e) { console.log('LAB FAILED: ' + e.message); code = 1; }
  if (errors.length) { console.log('page errors:\n  ' + errors.slice(0, 8).join('\n  ')); code = 1; }
  ws.close(); await run.close(); if (server) server.kill();
  process.exit(code);
}
main().catch(e => { console.error(e.message); process.exit(1); });
