/* tools/itch-qa-lib.mjs - shared harness for the itch QA sweep (claude/qasweep; headless, ONE browser per run; not in the suite).
   Serves dist-itch/site on 127.0.0.1 (the game) and a stand-in itch page on localhost (cross-site embed), launches ONE headless Chrome/Edge over CDP,
   installs hooks before any page script runs: an AudioContext recorder (__acs) and an emulated gamepad (__pad, a standard-mapping Xbox pad). */
import http from 'node:http';
import { readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, normalize, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { launchBrowser } from './browser-profile.mjs';
import { browserExecutable } from './cdp.mjs';
export const sleep = ms => new Promise(r => setTimeout(r, ms));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.txt': 'text/plain' };
export const HOOKS = `(() => { try {
  const AC = window.AudioContext; window.__acs = [];
  if (AC) { window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__acs.push(this); } }; }
  const mk = () => ({ id: 'Xbox 360 Controller (STANDARD GAMEPAD)', index: 0, connected: true, mapping: 'standard', timestamp: 1, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })), vibrationActuator: null });
  window.__padOn = false; window.__pad = mk();
  const real = navigator.getGamepads ? navigator.getGamepads.bind(navigator) : () => [];
  navigator.getGamepads = () => (window.__padOn ? [window.__pad, null, null, null] : real());
  window.__padSet = (btn, on) => { const b = window.__pad.buttons[btn]; b.pressed = b.touched = !!on; b.value = on ? 1 : 0; window.__pad.timestamp++; };
  window.__padAxis = (i, v) => { window.__pad.axes[i] = v; window.__pad.timestamp++; };
  window.__padConnect = () => { window.__padOn = true; window.dispatchEvent(Object.assign(new Event('gamepadconnected'), { gamepad: window.__pad })); };
} catch (e) {} })();`;
export const freeMB = () => +execSync('powershell -NoProfile -Command "[math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)"').toString().trim();
export async function startSession({ siteDir, cache = false, iframe = '960x540', args = [], metrics = null, extraPages = {}, query = '' } = {}) {
  const SITE = resolve(siteDir || join(import.meta.dirname, '..', 'dist-itch', 'site'));
  const serve = (root, extra) => new Promise(ok => { const s = http.createServer((req, res) => { try {
    const u = decodeURIComponent(req.url.split('?')[0]); if (extra && extra[u]) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(typeof extra[u] === 'function' ? extra[u](req) : extra[u]); return; }
    const p = normalize(join(root, u === '/' ? 'index.html' : u)); if (!p.startsWith(root)) { res.writeHead(403).end(); return; } const st = statSync(p);
    res.writeHead(200, { 'Content-Type': TYPES[extname(p).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': cache ? 'public, max-age=3600' : 'no-store' }).end(readFileSync(p)); } catch { res.writeHead(404).end('not found'); } }).listen(0, '127.0.0.1', () => ok(s)); });
  const game = await serve(SITE), gamePort = game.address().port;
  const [iw, ih] = iframe.split('x'); const dim = v => (/%$/.test(v) ? v : v + 'px');
  const wrap = (q = '') => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><style>html,body{height:100%}</style><body style="margin:0;background:#222"><div style="width:${dim(iw)};height:${dim(ih)}"><iframe id="game_drop" allowtransparency="true" msallowfullscreen="true" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" allow="autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; cross-origin-isolated" scrolling="no" style="width:${dim(iw)};height:${dim(ih)};border:0" frameborder="0" src="http://127.0.0.1:${gamePort}/${q}"></iframe></div></body></html>`;
  const host = await serve(SITE, { '/embed.html': req => wrap((req.url.split('?')[1] ? '?' + req.url.split('?')[1] : '') || query), ...extraPages }), hostPort = host.address().port;
  const exe = browserExecutable(); if (!exe) throw new Error('no Chrome / Edge found');
  const run = launchBrowser(exe, ['--headless=new', '--remote-debugging-port=auto', '--mute-audio', '--no-first-run', '--window-size=1000,640', '--autoplay-policy=document-user-activation-required', '--disable-site-isolation-trials', ...args, 'about:blank'], 'headless');
  const dbg = await run.devtoolsPort(); let wsUrl = null;
  for (let i = 0; i < 60 && !wsUrl; i++) { try { const t = await (await fetch('http://127.0.0.1:' + dbg + '/json/list')).json(); const pg = t.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch { /* retry */ } if (!wsUrl) await sleep(200); }
  const ws = new WebSocket(wsUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(), ctxs = new Map(), S = { consoleErrors: [], failed: [], exceptions: [], fetched: [], downloads: [], reqs: new Map(), blocked: 0, warns: [] };
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    const p = m.params;
    if (m.method === 'Runtime.executionContextCreated') ctxs.set(p.context.id, p.context);
    else if (m.method === 'Browser.downloadWillBegin') S.downloads.push(p.suggestedFilename || 'download');
    else if (m.method === 'Runtime.executionContextDestroyed') ctxs.delete(p.executionContextId);
    else if (m.method === 'Runtime.executionContextsCleared') ctxs.clear();
    else if (m.method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'assert')) S.consoleErrors.push('console.' + p.type + ': ' + p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
    else if (m.method === 'Runtime.consoleAPICalled' && p.type === 'warning') S.warns.push(p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    else if (m.method === 'Runtime.exceptionThrown') S.exceptions.push((p.exceptionDetails.exception ? p.exceptionDetails.exception.description : p.exceptionDetails.text).slice(0, 300));
    else if (m.method === 'Log.entryAdded' && p.entry.level === 'error') S.consoleErrors.push('log: ' + p.entry.text.slice(0, 200) + ' ' + (p.entry.url || ''));
    else if (m.method === 'Network.requestWillBeSent') S.reqs.set(p.requestId, { u: p.request.url, t: Date.now() });
    else if (m.method === 'Network.responseReceived') { const r = S.reqs.get(p.requestId); const u = r ? r.u : p.response.url; S.fetched.push({ u, s: p.response.status, t: Date.now() }); if (p.response.status >= 400) S.failed.push(p.response.status + ' ' + u); }
    else if (m.method === 'Network.loadingFailed' && !p.canceled) { const r = S.reqs.get(p.requestId); if (p.blockedReason || /BLOCKED/.test(p.errorText)) S.blocked++; S.failed.push('FAILED ' + (r ? r.u : '') + ' ' + p.errorText); } };
  const send = (method, params = {}, wait = 30000) => new Promise((res, rej) => { const i = ++id, t = setTimeout(() => { pending.delete(i); rej(new Error(method + ' timed out')); }, wait); pending.set(i, r => { clearTimeout(t); r.error ? rej(new Error(r.error.message)) : res(r.result || {}); }); ws.send(JSON.stringify({ id: i, method, params })); });
  const gameCtx = () => [...ctxs.values()].find(c => c.origin === 'http://127.0.0.1:' + gamePort && c.auxData && c.auxData.isDefault);
  const ev = async (expr, wait = 30000) => { const c = gameCtx(); if (!c) throw new Error('no game frame context'); const r = await send('Runtime.evaluate', { expression: expr, contextId: c.id, awaitPromise: true, returnByValue: true }, wait); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text); return r.result.value; };
  const evTop = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text); return r.result.value; };
  const shotDir = process.env.QA_SHOTS ? resolve(process.env.QA_SHOTS) : null; if (shotDir) mkdirSync(shotDir, { recursive: true });
  const shot = async n => { if (!shotDir) return; const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(shotDir, n + '.png'), Buffer.from(r.data, 'base64')); };
  const key = async (k, code, vk, hold = 0) => { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: vk }); if (hold) await sleep(hold); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: vk }); await sleep(120); };
  const click = async (x, y) => { await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 }); };
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable'); await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: HOOKS });
  if (!metrics) await send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 600, deviceScaleFactor: 1, mobile: false });   /* headless's own window leaves a 978x486 viewport: the 540-tall frame would be cut off */
  if (metrics) { await send('Emulation.setDeviceMetricsOverride', { width: metrics.w, height: metrics.h, deviceScaleFactor: metrics.dpr || 2, mobile: true }); await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); }
  const waitState = async (want, ms = 60000) => { const t0 = Date.now(); let st = null; while (Date.now() - t0 < ms) { st = await ev('typeof window.BK === "object" ? BK.state : null').catch(() => null); if (st === want) return { st, secs: (Date.now() - t0) / 1000 }; await sleep(200); } return { st, secs: (Date.now() - t0) / 1000 }; };
  const close = async () => { try { ws.close(); } catch { /* gone */ } await run.close(); game.close(); host.close(); };
  return { send, ev, evTop, shot, key, click, S, gamePort, hostPort, close, waitState, embedUrl: 'http://localhost:' + hostPort + '/embed.html', gameUrl: 'http://127.0.0.1:' + gamePort + '/', wrap, ctxs, gameCtx };
}
