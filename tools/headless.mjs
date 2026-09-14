// tools/headless.mjs — THE LABS WITHOUT A WINDOW.
// The fight and boss labs run inside the page, so they only ever ran when somebody had the game open. This starts the
// dev server if it is not up, launches the Chrome (or Edge) already installed on this machine headless, drives it over
// the DevTools protocol with Node's own WebSocket - nothing to install - and runs a lab in the page.
//   node tools/headless.mjs                      a short boss pass (knight and paladin, four bosses) and a kill-zone sweep
//   node tools/headless.mjs boss spire,reef      the boss lab on those levels, every hero
//   node tools/headless.mjs expr "BK.fightLab({ levels: ['wood'] })"
// Exit code 1 if a boss in the short pass goes unkilled or the page throws.
import { spawn } from 'child_process';
import { existsSync, mkdtempSync } from 'fs';
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
  if (!(await up())) { server = spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, stdio: 'ignore' }); for (let i = 0; i < 40 && !(await up()); i++) await sleep(250); }
  if (!(await up())) throw new Error('dev server did not come up on ' + URL0);
  const exe = BROWSERS.find(p => existsSync(p)); if (!exe) throw new Error('no Chrome or Edge found');
  const dbg = 9300 + Math.floor(Math.random() * 400), prof = mkdtempSync(join(tmpdir(), 'bracken-headless-'));
  const chrome = spawn(exe, ['--headless=new', '--remote-debugging-port=' + dbg, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run', '--autoplay-policy=no-user-gesture-required', ...(process.env.CI ? ['--no-sandbox'] : []), 'about:blank'], { stdio: 'ignore' });
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
    else {
      const bosses = mode === 'boss' && arg ? arg.split(',') : ['wood', 'kings', 'waymeet', 'undercrown'];
      const heroes = mode === 'boss' ? null : ['knight', 'paladin'];
      const res = await evalp('(async () => { const r = await BK.bossLab(' + JSON.stringify(Object.assign({ bosses, maxSecs: 150 }, heroes ? { heroes } : {})) + '); return r.rows.map(x => ({ lvl: x.lvl, h: x.h, killed: x.killed, secs: x.secs, hp: x.hpLeftPct, taken: x.takenPerMin, skipped: x.skipped })); })()');
      for (const r of res) { console.log((r.lvl + '/' + r.h).padEnd(22), r.skipped ? 'skipped: ' + r.skipped : r.killed ? r.secs + 's' : 'ALIVE ' + r.hp + '%', r.taken !== undefined ? ' taken/min ' + r.taken : ''); if (!r.skipped && !r.killed && mode === 'short') code = 1; }
      if (mode === 'short') { const kz = await evalp('BK.killLab ? BK.killLab({ levels: ' + JSON.stringify(bosses) + ', every: 6 }) : null'); if (kz) { console.log('kill-zone sweep:', JSON.stringify(kz.summary)); if (kz.bad) code = 1; } }
    }
  } catch (e) { console.log('LAB FAILED: ' + e.message); code = 1; }
  if (errors.length) { console.log('page errors:\n  ' + errors.slice(0, 8).join('\n  ')); code = 1; }
  ws.close(); chrome.kill(); if (server) server.kill();
  process.exit(code);
}
main().catch(e => { console.error(e.message); process.exit(1); });
