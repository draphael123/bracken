/* tools/itch-embed-page.mjs - THE ITCH BUILD, INSIDE AN EMBED (claude/batch143; headless, ONE browser; not in the suite).
   Serves the unpacked build (dist-itch/site, from tools/build-itch.mjs) on one origin and a stand-in for itch's page on ANOTHER SITE (localhost vs 127.0.0.1, so the game is a third-party
   iframe with partitioned storage, as on html-classic.itch.zone), with itch's 960x540 iframe and its `allow` list. Then: load to the title, take the real keyboard path to the first level,
   check localStorage inside the frame (written, and still there after a reload of the frame), music + sfx requests, the demo flag's menu, and count console errors / failed requests.
   usage: node tools/itch-embed-page.mjs [siteDir] [shotDir]      exit 1 when anything is red. Needs >= 1500 MB free (the caller's rule); one browser, closed at the end. */
import http from 'node:http';
import { readFileSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, normalize, resolve } from 'node:path';
import { launchBrowser } from './browser-profile.mjs';
import { browserExecutable } from './cdp.mjs';

const SITE = resolve(process.argv[2] || join(import.meta.dirname, '..', 'dist-itch', 'site')), SHOTS = process.argv[3] ? resolve(process.argv[3]) : null; if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.txt': 'text/plain' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const serve = (root, extra) => new Promise(ok => { const s = http.createServer((req, res) => { try {
  const u = decodeURIComponent(req.url.split('?')[0]); if (extra && extra[u]) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(extra[u]); return; }
  const p = normalize(join(root, u === '/' ? 'index.html' : u)); if (!p.startsWith(root)) { res.writeHead(403).end(); return; } const st = statSync(p);
  res.writeHead(200, { 'Content-Type': TYPES[extname(p).toLowerCase()] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-store' }).end(readFileSync(p)); } catch { res.writeHead(404).end('not found'); } }).listen(0, '127.0.0.1', () => ok(s)); });

const game = await serve(SITE), gamePort = game.address().port;
const embed = `<!doctype html><html><body style="margin:0;background:#222"><div style="width:960px;height:540px"><iframe id="game_drop" allowtransparency="true" msallowfullscreen="true" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" allow="autoplay; fullscreen *; geolocation; microphone; camera; midi; monetization; xr-spatial-tracking; gamepad; gyroscope; accelerometer; xr; cross-origin-isolated" scrolling="no" width="960" height="540" frameborder="0" src="http://127.0.0.1:${gamePort}/"></iframe></div></body></html>`;
const host = await serve(SITE, { '/embed.html': embed }), hostPort = host.address().port;

const exe = browserExecutable(); if (!exe) { console.error('no Chrome / Edge found'); process.exit(2); }
const run = launchBrowser(exe, ['--headless=new', '--remote-debugging-port=auto', '--mute-audio', '--no-first-run', '--window-size=1000,600', '--autoplay-policy=document-user-activation-required', '--disable-site-isolation-trials', 'about:blank'], 'headless');
const red = []; const note = (ok, msg) => { console.log((ok ? 'ok   ' : 'RED  ') + msg); if (!ok) red.push(msg); };
let ws;
try {
  const dbg = await run.devtoolsPort();
  let wsUrl = null; for (let i = 0; i < 60 && !wsUrl; i++) { try { const t = await (await fetch('http://127.0.0.1:' + dbg + '/json/list')).json(); const pg = t.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch { /* retry */ } if (!wsUrl) await sleep(200); }
  ws = new WebSocket(wsUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(), ctxs = new Map(), consoleErrors = [], failed = [], reqs = new Map(), fetched = [], exceptions = [], downloads = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.executionContextCreated') { const c = m.params.context; ctxs.set(c.id, c); }
    else if (m.method === 'Browser.downloadWillBegin') downloads.push(m.params.suggestedFilename || 'download');
    else if (m.method === 'Runtime.executionContextDestroyed') ctxs.delete(m.params.executionContextId);
    else if (m.method === 'Runtime.executionContextsCleared') ctxs.clear();
    else if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'assert')) consoleErrors.push('console.' + m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
    else if (m.method === 'Runtime.exceptionThrown') exceptions.push((m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text).slice(0, 300));
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') consoleErrors.push('log: ' + m.params.entry.text.slice(0, 200) + ' ' + (m.params.entry.url || ''));
    else if (m.method === 'Network.requestWillBeSent') reqs.set(m.params.requestId, m.params.request.url);
    else if (m.method === 'Network.responseReceived') { const u = reqs.get(m.params.requestId) || m.params.response.url; fetched.push({ u, s: m.params.response.status }); if (m.params.response.status >= 400) failed.push(m.params.response.status + ' ' + u); }
    else if (m.method === 'Network.loadingFailed' && !m.params.canceled) failed.push('FAILED ' + (reqs.get(m.params.requestId) || '') + ' ' + m.params.errorText); };
  const send = (method, params = {}, wait = 20000) => new Promise((res, rej) => { const i = ++id, t = setTimeout(() => { pending.delete(i); rej(new Error(method + ' timed out')); }, wait); pending.set(i, r => { clearTimeout(t); r.error ? rej(new Error(r.error.message)) : res(r.result || {}); }); ws.send(JSON.stringify({ id: i, method, params })); });
  const gameCtx = () => [...ctxs.values()].find(c => c.origin === 'http://127.0.0.1:' + gamePort && c.auxData && c.auxData.isDefault);
  const ev = async expr => { const c = gameCtx(); if (!c) throw new Error('no game frame context'); const r = await send('Runtime.evaluate', { expression: expr, contextId: c.id, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text); return r.result.value; };
  const shot = async n => { if (!SHOTS) return; const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(SHOTS, n + '.png'), Buffer.from(r.data, 'base64')); };
  const key = async (k, code, vk) => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk }); await sleep(120); };
  await send('Runtime.enable'); await send('Page.enable'); await send('Log.enable'); await send('Network.enable');
  const t0 = Date.now(); await send('Page.navigate', { url: 'http://localhost:' + hostPort + '/embed.html' });
  /* ---- LOAD TO THE TITLE ---- */
  let st = null; for (let i = 0; i < 240; i++) { st = await ev('typeof window.BK === "object" ? BK.state : null').catch(() => null); if (st === 'title') break; await sleep(250); }
  const tTitle = ((Date.now() - t0) / 1000).toFixed(1);
  note(st === 'title', 'loads to the title inside the 960x540 cross-site iframe in ' + tTitle + ' s (state ' + st + ')');
  const boot = await ev('(document.getElementById("boot") || {}).textContent || ""').catch(() => ''); note(!/ERROR|STILL LOADING/.test(boot), 'no boot error text ("' + boot + '")');
  await sleep(1500); await shot('01-title');
  const frameInfo = await ev('({ w: innerWidth, h: innerHeight, top: window.top !== window, ls: (() => { try { localStorage.setItem("t", "1"); localStorage.removeItem("t"); return true; } catch (e) { return e.message; } })(), demoMenu: BK.ui.titleItems().map(x => typeof x === "string" ? x : (x.label || x.name || x.t || JSON.stringify(x))).slice(0, 14) })');
  note(frameInfo.top, 'the game runs as an embedded frame (' + frameInfo.w + 'x' + frameInfo.h + ')'); note(frameInfo.ls === true, 'localStorage usable inside the frame: ' + frameInfo.ls);
  console.log('     title items: ' + frameInfo.demoMenu.join(' | ')); note(!frameInfo.demoMenu.some(x => /EDITOR|RUSH/.test(x)), 'the demo flag is on: no THE EDITOR / BOSS RUSH rows');
  /* ---- FIRST DEMO LEVEL, BY KEYBOARD ---- (click the frame first: a real player's first gesture, which also lets the audio start) */
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 480, y: 270, button: 'left', clickCount: 1 }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 480, y: 270, button: 'left', clickCount: 1 });
  const states = [await ev('BK.state')]; const press = async (k, c, v) => { await key(k, c, v); const s = await ev('BK.state'); if (s !== states[states.length - 1]) states.push(s); return s; };
  let s = null; for (let i = 0; i < 12 && s !== 'play'; i++) { s = await press('z', 'KeyZ', 90); if (s === 'map') { await sleep(600); await shot('02-map'); } if (s === 'play') break; await sleep(300); }
  if (s !== 'play') { for (let i = 0; i < 10 && s !== 'play'; i++) { s = await press('Enter', 'Enter', 13); await sleep(400); if (s === 'map') await shot('02-map'); } }
  console.log('     states: ' + states.join(' > '));
  note(s === 'play', 'the first demo level starts from the title by keys (state ' + s + ')');
  await sleep(2500); await shot('03-level');
  for (let i = 0; i < 10; i++) await key('ArrowRight', 'ArrowRight', 39);
  await ev('BK.sim ? BK.sim(60) : 0').catch(() => {});
  /* ---- SAVES INSIDE THE FRAME ---- */
  await ev('(()=>{ try { /* the game saves on events; force one through its own API when it has it */ if (typeof BK.saveNow === "function") BK.saveNow(); } catch (e) {} })()').catch(() => {});
  await sleep(500);
  const keys = await ev('Object.keys(localStorage)'); const brk = keys.filter(k => /^bracken\./.test(k));
  note(brk.length > 0, 'saves / settings written to localStorage inside the iframe: ' + brk.slice(0, 8).join(', '));
  const sizeBefore = await ev('Object.keys(localStorage).map(k => k + ":" + localStorage.getItem(k).length).join(",")');
  await send('Runtime.evaluate', { expression: '(f => { f.src = f.src.split("?")[0] + "?again=1"; })(document.getElementById("game_drop"))' });
  await sleep(500); let st2 = null; for (let i = 0; i < 240; i++) { st2 = await ev('typeof window.BK === "object" ? BK.state : null').catch(() => null); if (st2 === 'title') break; await sleep(250); }
  const sizeAfter = await ev('Object.keys(localStorage).map(k => k + ":" + localStorage.getItem(k).length).join(",")').catch(() => '');
  console.log('     reload: state ' + st2 + ' | before ' + sizeBefore + ' | after ' + sizeAfter); note(st2 === 'title' && sizeAfter.length > 0 && sizeAfter.split(',').length >= sizeBefore.split(',').length, 'after reloading the frame the title is back and the same ' + sizeAfter.split(',').length + ' storage keys are still there');
  await shot('04-after-reload');
  /* ---- KING GORM'S WIN -> THE END CARD, AND KEEP YOUR PROGRESS (a download from inside the iframe) ---- (BK.load(4) is Kingswood: WOOD_NODES level 4) */
  await send('Browser.setDownloadBehavior', { behavior: 'deny', eventsEnabled: true }).catch(() => {});
  const endc = await ev("(async()=>{ BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(4); BK.start(); BK.sim(10); BK.coopSave.win(); BK.sim(5); BK.press('confirm'); BK.sim(5); await new Promise(r => setTimeout(r, 250)); const card = document.getElementById('demoend'); if (!card) return { card: false, state: BK.state }; let blob = null; const o = URL.createObjectURL; URL.createObjectURL = b => { blob = b; return o.call(URL, b); }; document.getElementById('dekeep').click(); await new Promise(r => setTimeout(r, 300)); return { card: true, state: BK.state, blob: blob ? blob.size : 0, buttons: [...card.querySelectorAll('button')].map(b => b.id) }; })()").catch(e => ({ err: e.message }));
  await sleep(400); await shot('05-endcard');
  note(!!endc.card, 'King Gorm win -> the END CARD shows inside the frame (' + JSON.stringify(endc) + ')');
  note(endc.blob > 500, 'KEEP YOUR PROGRESS built the save file (' + endc.blob + ' bytes); browser download event: ' + (downloads.length ? downloads.join(' ') : 'none seen (headless deny mode)'));
  /* ---- WHAT WAS FETCHED ---- */
  const music = fetched.filter(f => /\/audio\/[^/]+\.(ogg|mp3)$/.test(f.u)), sfx = fetched.filter(f => /\/audio\/sfx\//.test(f.u)), js = fetched.filter(f => /\.js$/.test(f.u));
  console.log('     fetched: ' + js.length + ' js, ' + music.length + ' music (' + [...new Set(music.map(f => f.u.split('/').pop()))].join(', ') + '), ' + sfx.length + ' sfx, ' + fetched.length + ' requests in all');
  note(music.length > 0, 'a music track was requested (the first wood plays its own)'); note(failed.length === 0, failed.length + ' failed / 4xx requests' + (failed.length ? ': ' + failed.slice(0, 6).join(' | ') : ''));
  const bad = [...new Set([...consoleErrors, ...exceptions])]; note(bad.length === 0, bad.length + ' console errors / uncaught exceptions' + (bad.length ? ': ' + bad.slice(0, 6).join(' | ') : ''));
  console.log('     (console warnings are not counted)');
} catch (e) { console.log('RED  test crashed: ' + e.message); red.push(e.message); }
finally { try { ws && ws.close(); } catch { /* gone */ } await run.close(); game.close(); host.close(); }
console.log(red.length ? 'itch-embed: ' + red.length + ' RED' : 'itch-embed: all green'); process.exit(red.length ? 1 : 0);
