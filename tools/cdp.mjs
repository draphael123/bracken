// tools/cdp.mjs — THE PAGE, HEADLESS, FOR A TOOL. The same approach as tools/headless.mjs (the installed Chrome or Edge,
// driven over the DevTools protocol with Node's own WebSocket), as a helper the readability tools share.
//   const pg = await openPage();  await pg.evalp('BK.state');  pg.close();
// It starts serve.mjs on PORT (default 5892) when nothing answers there, and REFUSES a server that is serving another
// checkout: the served src/lookpass.js must be byte-for-byte this checkout's.
import { spawn } from 'child_process';
import { existsSync, mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

export async function openPage(opts = {}) {
  const PORT = +(process.env.PORT || opts.port || 5892), URL0 = 'http://localhost:' + PORT + '/';
  const up = async () => { try { const r = await fetch(URL0, {signal:AbortSignal.timeout(2000)}); return r.ok; } catch { return false; } };
  let server = null;
  if (!(await up())) { server = spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, stdio: 'ignore', env: { ...process.env, PORT: String(PORT) } }); for (let i = 0; i < 40 && !(await up()); i++) await sleep(250); }
  if (!(await up())) throw new Error('dev server did not come up on ' + URL0);
  const mine = readFileSync(join(ROOT, 'src/lookpass.js'), 'utf8');
  const served = await (await fetch(URL0 + 'src/lookpass.js', {signal:AbortSignal.timeout(5000)})).text().catch(() => '');
  if (served !== mine) { if (server) server.kill(); throw new Error('the server on ' + URL0 + ' is serving another checkout (src/lookpass.js differs): set PORT to a free port'); }
  const exe = BROWSERS.find(p => existsSync(p)); if (!exe) throw new Error('no Chrome or Edge found');
  const dbg = 9300 + Math.floor(Math.random() * 400), prof = mkdtempSync(join(tmpdir(), 'bracken-look-'));
  const chrome = spawn(exe, ['--headless=new', '--remote-debugging-port=' + dbg, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run', '--window-size=1280,720', '--autoplay-policy=no-user-gesture-required', ...(process.env.CI ? ['--no-sandbox'] : []), 'about:blank'], { stdio: 'ignore' });
  let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) { try { const t = await (await fetch('http://127.0.0.1:' + dbg + '/json/list', {signal:AbortSignal.timeout(2000)})).json(); const pg = t.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
  if (!wsUrl) throw new Error('could not reach the browser');
  const ws = new WebSocket(wsUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(), errors = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text); };
  // Navigation can destroy a context before its evaluation answers. Bound the protocol wait as well.
  const send = (method, params = {}, wait = 15000) => new Promise((res, rej) => {
    const i = ++id, timer = setTimeout(() => { pending.delete(i); rej(new Error(method + ' did not answer within ' + wait + 'ms')); }, wait);
    pending.set(i, reply => { clearTimeout(timer); if(reply.error) rej(new Error(reply.error.message || JSON.stringify(reply.error))); else res(reply); });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evalp = async (expr, timeout = 1800000) => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout }, timeout + 1000);
    if (r.error) throw new Error(r.error.message || JSON.stringify(r.error));
    if (r.result && r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception ? r.result.exceptionDetails.exception.description : r.result.exceptionDetails.text);
    return r.result && r.result.result ? r.result.result.value : undefined; };
  await send('Runtime.enable'); await send('Page.enable');
  // Physics-only audits do not need remote font stylesheets to delay every fresh document.
  // Pixel and text-layout tools keep the normal fonts unless they explicitly opt out.
  if(opts.fonts===false){await send('Network.enable');await send('Network.setBlockedURLs',{urls:['https://fonts.googleapis.com/*','https://fonts.gstatic.com/*']});}
  await send('Page.navigate', { url: URL0 });
  let ready = false;
  for (let i = 0; i < 120 && !ready; i++) { ready = await evalp('typeof window.BK === "object" && !!window.BK.lookPass', 2000).catch(() => false); if (!ready) await sleep(250); }
  if (!ready) throw new Error('the page never put up window.BK');
  /* A KEY PRESS, so the page makes its AudioContext and stops drawing PRESS A KEY FOR SOUND over every frame */
  if (opts.audio !== false) for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 });
  const port = await evalp('location.port', 10000);
  if (String(port) !== String(PORT)) throw new Error('the page is on port ' + port + ', not ' + PORT);
  const reload = async () => {
    const previousOrigin = await evalp('localStorage.clear(); window.__labReloading = true; performance.timeOrigin', 10000);
    const url = URL0 + '?labReload=' + Date.now() + '-' + id;
    await send('Page.navigate', { url });
    let ready = false;
    for (let i = 0; i < 120 && !ready; i++) {
      ready = await evalp('performance.timeOrigin !== ' + JSON.stringify(previousOrigin) + ' && location.href === ' + JSON.stringify(url) + ' && !window.__labReloading && typeof window.BK === "object" && !!window.BK.lookPass', 2000).catch(() => false);
      if (!ready) await sleep(100);
    }
    if (!ready) throw new Error('the fresh lab page did not initialize');
  };
  return { evalp, errors, PORT, reload, close() { try { ws.close(); } catch {} chrome.kill(); if (server) server.kill(); } };
}
