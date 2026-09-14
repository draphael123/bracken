// tools/profile.mjs — WHERE DOES THE SLOW FRAME GO?
// Walks a hero through a level in the local Chrome with the DevTools CPU profiler running, then prints the functions
// that cost the most time, and the frames that ran long. Same launcher as tools/headless.mjs: nothing to install.
//   node tools/profile.mjs lamplit            walk Lamplit Street for 900 frames
//   node tools/profile.mjs deep 1500          a longer walk
import { spawn } from 'child_process';
import { existsSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = +(process.env.PORT || 5860), URL0 = 'http://localhost:' + PORT + '/';
const BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const up = async () => { try { return (await fetch(URL0)).ok; } catch { return false; } };
const [level = 'lamplit', framesArg = '900'] = process.argv.slice(2);

let server = null;
if (!(await up())) { server = spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, stdio: 'ignore' }); for (let i = 0; i < 40 && !(await up()); i++) await sleep(250); }
const exe = BROWSERS.find(p => existsSync(p)); if (!exe) throw new Error('no Chrome or Edge found');
const dbg = 9700 + Math.floor(Math.random() * 200);
const chrome = spawn(exe, ['--headless=new', '--remote-debugging-port=' + dbg, '--user-data-dir=' + mkdtempSync(join(tmpdir(), 'bracken-prof-')), '--mute-audio', '--no-first-run', ...(process.env.CI ? ['--no-sandbox'] : []), 'about:blank'], { stdio: 'ignore' });
let wsUrl = null;
for (let i = 0; i < 60 && !wsUrl; i++) { try { const t = await (await fetch('http://127.0.0.1:' + dbg + '/json/list')).json(); const pg = t.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
const ws = new WebSocket(wsUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map();
ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalp = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: 600000 }); return r.result && r.result.result ? r.result.result.value : undefined; };
await send('Runtime.enable'); await send('Page.enable'); await send('Page.navigate', { url: URL0 });
for (let i = 0; i < 80; i++) { if (await evalp('typeof window.BK === "object" && !!window.BK.load')) break; await sleep(250); }
await evalp(`(async () => { const lvm = await import('./src/level.js'); BK.setHero('knight'); BK.state = 'play'; BK.load(lvm.LEVELS.findIndex(l => l.id === ${JSON.stringify(level)})); BK.state = 'play'; BK.god = true; BK.step(60); return 1; })()`);
await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 200 }); await send('Profiler.start');
const frames = await evalp(`(() => { const out = []; const P = BK.P; for (let f = 0; f < ${+framesArg}; f++) { BK.keys.right = true; if (f % 40 === 0) BK.press('jump'); const t0 = performance.now(); BK.step(1); out.push([Math.round((performance.now() - t0) * 10) / 10, Math.round(P.x / 16)]); } BK.keys.right = false; return out; })()`);
const { result } = await send('Profiler.stop');
const prof = result.profile, dt = (prof.endTime - prof.startTime) / Math.max(1, prof.samples.length) / 1000;
const hits = new Map(); for (const s of prof.samples) hits.set(s, (hits.get(s) || 0) + 1);
const self = new Map();
for (const n of prof.nodes) { const c = n.callFrame, name = (c.functionName || '(anon)') + ' ' + (c.url.split('/').pop() || '') + ':' + (c.lineNumber + 1); const ms = (hits.get(n.id) || 0) * dt; if (ms) self.set(name, (self.get(name) || 0) + ms); }
const top = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25);
const slow = frames.filter(f => f[0] > 20);
console.log('== ' + level + ': ' + frames.length + ' frames, median ' + [...frames].sort((a, b) => a[0] - b[0])[frames.length >> 1][0] + 'ms, ' + slow.length + ' over 20ms');
console.log('slow frames (ms @ tile): ' + slow.slice(0, 20).map(f => f[0] + '@' + f[1]).join('  '));
console.log('\ntop self time:');
for (const [n, ms] of top) console.log('  ' + ms.toFixed(0).padStart(6) + 'ms  ' + n);
ws.close(); chrome.kill(); if (server) server.kill();
process.exit(0);
