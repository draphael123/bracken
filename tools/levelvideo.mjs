// tools/levelvideo.mjs — WATCH THE BOT PLAY IT, without sitting through it.
// The playtest bot proves a level does not crash; nobody sees what it is like to cross. This drives the same walker
// (src/playtest.js makeBot) along the MAIN ROUTE that tools/pacing.mjs finds, headless, on the real loop with the real
// art, grabs the 320x180 buffer every few frames and stitches a short MP4 per level with ffmpeg. Where the walker
// stalls it is TELEPORTED a few tiles on along the route, and the frame says so in red: a stall is evidence too.
//   PORT=5893 node tools/levelvideo.mjs --out=<dir> [levels...] [--par=3] [--every=4] [--maxsecs=420] [--secs=55]
// Writes <dir>/<level>.mp4, <dir>/<level>.json (teleports, deaths, hits by place, how far it got) and
// <dir>/<level>-sheet.png (a 4x3 contact sheet of the run).
// No god mode: the hero is topped up when low, so every hit is counted and only a pit or the sea kills it.
import { spawn, spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { LEVELS } from '../src/level.js';
import { pacing } from './pacing.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = +(process.env.PORT || 5860), URL0 = 'http://localhost:' + PORT + '/';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const OUT = opt('out', join(tmpdir(), 'bracken-videos')), PAR = +opt('par', 3), EVERY = +opt('every', 4), MAXSECS = +opt('maxsecs', 420), SECS = +opt('secs', 55);
const want = args.filter(a => !a.startsWith('--'));
const BROWSERS = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const up = async () => { try { return (await fetch(URL0)).ok; } catch { return false; } };

/* ---------------- in the page ---------------- */
async function pageInit(o) {
  const BK = window.BK, PT = await import('/src/playtest.js'), LV = await import('/src/level.js');
  const li = LV.LEVELS.findIndex(l => l.id === o.id);
  BK.SET.sfx = 0; BK.SET.music = false; BK.setHero(o.hero || 'knight');
  BK.load(li); BK.state = 'play'; BK.start(); BK.god = false; BK.reset();
  window.__V = { o, PT, bot: PT.makeBot(BK), idx: 0, best: 0, stall: 0, f: 0, shots: 0, tps: [], deaths: [], hits: [], heals: 0, assists: [], hp: BK.P.hp, lastX: BK.P.x, lastY: BK.P.y, flash: 0, arenaF: 0, deadNow: false, end: null, maxIdx: 0 };
  return { W: BK.L.W, H: BK.L.H };
}
async function pageChunk(n) {
  const BK = window.BK, V = window.__V, o = V.o, P = BK.P, wp = o.route, out = [];
  const nearest = (lo, hi) => { const tx = Math.floor(P.x / 16), ty = Math.round(P.y / 16) - 1; let bi = -1, bd = 1e9;
    for (let j = Math.max(0, lo); j < Math.min(wp.length, hi); j++) { const d = Math.abs(wp[j][0] - tx) + Math.abs(wp[j][1] - ty) * 1.5; if (d < bd) { bd = d; bi = j; } } return [bi, bd]; };
  while (out.length < n && !V.end) {
    const tx = Math.floor(P.x / 16), ty = Math.round(P.y / 16) - 1;
    /* a jump in position (a respawn, a door, a teleport) needs the whole route searched; otherwise look just ahead */
    const jumped = Math.abs(P.x - V.lastX) > 90 || Math.abs(P.y - V.lastY) > 90;
    const [bi, bd] = jumped ? nearest(0, V.best + 30) : nearest(V.idx - 15, V.idx + 25);
    if (bi >= 0 && bd < (jumped ? 14 : 6)) V.idx = bi;
    V.lastX = P.x; V.lastY = P.y;
    if (V.idx > V.best) { V.best = V.idx; V.stall = 0; } else V.stall++;
    V.maxIdx = Math.max(V.maxIdx, V.idx);
    const A = BK.L.arena, inArena = A && P.x > A.x0 && P.x < A.x1 && Math.abs(P.y - A.floor) < 16 * 14;
    if (inArena) V.arenaF++;
    const tgt = wp[Math.min(wp.length - 1, V.idx + 4)];
    const r = V.bot(inArena ? (BK.boss && BK.boss.alive ? BK.boss.x : A.x1 - 20) : tgt[0] * 16 + 8);
    if (!inArena && tgt[1] < ty - 1 && Math.abs(tgt[0] - tx) <= 2 && P.ground && V.f % 24 === 0) BK.press('jump');   /* the way on is straight up: the walker only ever steers sideways */
    /* no god mode, but no dying of blows either: every hit is counted where it landed, and the hero is topped up */
    if (P.hp < V.hp - 0.5 && !P.dead) V.hits.push([tx, ty, Math.round(V.hp - P.hp)]);
    if (P.hp < P.maxHp * 0.35 && !P.dead) { P.hp = P.maxHp; V.heals++; }
    V.hp = P.hp;
    if (P.dead > 0 && !V.deadNow) { V.deadNow = true; V.deaths.push([tx, ty, V.f]); } else if (!(P.dead > 0)) V.deadNow = false;
    /* A LOCKED AMBUSH ROOM KEEPS YOU: a teleport out is pulled straight back in. The walker cannot always clear the waves,
       so after fifteen seconds of it the room's foes are put down (and the report says so) and the gates lift as in play */
    const amb = (BK.ambushes() || []).find(q => q.st && q.st !== 'done');
    if (amb) { V.ambF = (V.ambF || 0) + 1; if (V.ambF > 900 && V.ambF % 120 === 0) { let kk = 0; for (const e of (amb.foes || [])) if (e.alive) { e.alive = false; kk++; } if (kk) V.assists.push({ room: amb.name, atSec: Math.round(V.f / 60), cleared: kk }); } } else V.ambF = 0;
    /* A MINI KEEPS YOU TOO, and the walker cannot kill the Stalker (fifty teleports at the Hunt's park gate). After
       twenty-five seconds of a mini fight it is left one blow from dead, the hero is put beside it, and after ten more
       it is put down; either way the report says so */
    const mini = BK.miniActive && BK.enemies().find(e => e.mini && e.alive);
    if (mini) { V.miniF = (V.miniF || 0) + 1;
      if (V.miniF === 1500) { mini.hp = Math.min(mini.hp, 1); BK.tp(Math.floor((mini.x - 18) / 16), Math.round(mini.y / 16) - 1); V.assists.push({ mini: mini.t, atSec: Math.round(V.f / 60) }); }
      if (V.miniF > 1500 && V.miniF % 30 === 0) { mini.hp = Math.min(mini.hp, 1); if (P.atk < 0) BK.press('atk'); }
      if (V.miniF === 2100) mini.alive = false; } else V.miniF = 0;
    const stallLimit = inArena || amb || mini ? 1e9 : (o.stallF || 420);
    /* A SHUT GATE AND A KEY THE WALKER NEVER FOUND: it walks into the house, walks out, and stands at the gate forever
       (Stormhold). Fetch the key for it, bring it to the gate, and say so in the report. */
    const shut = V.stall > stallLimit && BK.props().find(p => p.t === 'lockgate' && !p.open && Math.abs(p.x - P.x) < 200 && Math.abs(p.y - P.y) < 80);
    const key = shut && BK.props().find(p => p.t === 'key' && !p.got && p.kind === shut.needs);
    if (key) { BK.tp(Math.floor(key.x / 16), Math.round((key.y + 6) / 16) - 1); BK.sim(4); BK.tp(shut.col - 1, Math.round(shut.y / 16) - 1); BK.sim(4); BK.reset();
      V.assists.push({ key: shut.needs, gate: shut.col, atSec: Math.round(V.f / 60) }); V.stall = 0; V.bot = V.PT.makeBot(BK); V.lastX = P.x; V.lastY = P.y; V.flash = 50; }
    else if (V.stall > stallLimit || (r === 'stuck' && !inArena)) {
      const to = Math.min(wp.length - 1, V.best + 6);
      V.tps.push({ from: [tx, ty], to: wp[to], f: V.f, route: V.best }); BK.tp(wp[to][0], wp[to][1]); BK.reset();
      V.idx = V.best = to; V.maxIdx = Math.max(V.maxIdx, to); V.stall = 0; V.flash = 50; V.bot = V.PT.makeBot(BK); V.lastX = P.x; V.lastY = P.y;
    }
    BK.sim(1); V.f++; if (V.flash > 0) V.flash--;
    if (BK.state !== 'play') V.end = 'state ' + BK.state;
    else if (A && V.arenaF > (o.arenaSecs || 25) * 60) V.end = 'arena ' + (o.arenaSecs || 25) + 's';
    else if (!A && V.idx >= wp.length - 2) V.end = 'reached the end';
    else if (A && V.idx >= wp.length - 2 && V.arenaF === 0) { V.door = (V.door || 0) + 1; if (V.door > 600) V.end = 'arena never entered'; }   /* a teleport onto the last waypoint lands a frame before the arena clock starts */
    else if (V.f > (o.maxF || 25200)) V.end = 'time cap';
    if ((V.f % o.every === 0 && V.f > 24) || V.end) {   /* the first frames after a load are black */
      BK.step(0);
      const g = BK.g, mm = Math.floor(V.f / 3600), ss = String(Math.floor(V.f / 60) % 60).padStart(2, '0');
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 171, 320, 9);
      g.font = '7px monospace'; g.textBaseline = 'top'; g.fillStyle = '#e8e8e8';
      g.fillText(o.id + ' ' + mm + ':' + ss + '  x' + tx + ' y' + ty + '  route ' + Math.round(V.idx / Math.max(1, wp.length - 1) * 100) + '%  tp ' + V.tps.length + '  died ' + V.deaths.length, 2, 172);
      if (V.flash > 0) { g.fillStyle = '#ff4040'; g.fillText('STALLED: TELEPORT', 236, 172); }
      g.restore();
      out.push(BK.buf.toDataURL('image/jpeg', 0.86).slice(23));
    }
  }
  return { frames: out, end: V.end, f: V.f };
}
/* A STILL: stand on a tile, let the place wake for a second and a half, and look (the camera lags a teleport) */
/* every still starts from a fresh load: a teleport into an ambush room shuts it, and a shut room pulls every later still
   back inside it; a boss arena zooms the view out. The rooms are marked done so a still never shuts one. */
async function pageStill(x, y, label, id) { const BK = window.BK, LV = await import('/src/level.js');
  BK.load(LV.LEVELS.findIndex(l => l.id === id)); BK.state = 'play'; BK.start(); BK.god = true; BK.reset();
  for (const A of (BK.ambushes() || [])) A.st = 'done';
  for (const e of BK.enemies()) if (e.alive && Math.abs(e.x / 16 - x) < 3 && Math.abs(e.y / 16 - y) < 3) e.alive = false;
  BK.tp(x, y); BK.reset(); BK.sim(170); BK.step(0);   /* 170 frames: the level's name banner is up for 2.6 seconds after a start */ const g = BK.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(0, 171, 320, 9);
  g.font = '7px monospace'; g.textBaseline = 'top'; g.fillStyle = '#ffe070'; g.fillText(label, 2, 172); g.restore(); return BK.buf.toDataURL('image/jpeg', 0.9).slice(23); }
function pageSummary() { const V = window.__V; return { frames: V.f, end: V.end, tps: V.tps, deaths: V.deaths, hits: V.hits, heals: V.heals, assists: V.assists, reachedPct: Math.round(V.maxIdx / Math.max(1, V.o.route.length - 1) * 100) }; }

/* ---------------- the browser ---------------- */
async function browser() {
  const exe = BROWSERS.find(p => existsSync(p)); if (!exe) throw new Error('no Chrome or Edge found');
  const dbg = 9300 + Math.floor(Math.random() * 600), prof = mkdtempSync(join(tmpdir(), 'bracken-video-'));
  const chrome = spawn(exe, ['--headless=new', '--remote-debugging-port=' + dbg, '--user-data-dir=' + prof, '--mute-audio', '--no-first-run', '--window-size=1280,720', 'about:blank'], { stdio: 'ignore' });
  let wsUrl = null;
  for (let i = 0; i < 80 && !wsUrl; i++) { try { const t = await (await fetch('http://127.0.0.1:' + dbg + '/json/list')).json(); const pg = t.find(x => x.type === 'page'); if (pg) wsUrl = pg.webSocketDebuggerUrl; } catch {} if (!wsUrl) await sleep(250); }
  if (!wsUrl) throw new Error('could not reach the browser');
  const ws = new WebSocket(wsUrl); await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(), errors = [];
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception ? m.params.exceptionDetails.exception.description : m.params.exceptionDetails.text); };
  const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalp = async expr => { const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: 600000 });
    if (r.result && r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.exception ? r.result.exceptionDetails.exception.description : r.result.exceptionDetails.text);
    return r.result && r.result.result ? r.result.result.value : undefined; };
  await send('Runtime.enable'); await send('Page.enable');
  const open = async () => { if (globalThis.__ensure) await globalThis.__ensure(); await send('Page.navigate', { url: URL0 + '?v=' + Date.now() });
    for (let i = 0; i < 120; i++) { if (await evalp('typeof window.BK === "object" && !!window.BK.bossLab').catch(() => false)) break; await sleep(250); }
    await sleep(1500); };
  const close = () => { try { ws.close(); } catch {} chrome.kill(); try { rmSync(prof, { recursive: true, force: true }); } catch {} };
  return { evalp, open, close, errors };
}

async function record(B, lv, route, arena) {
  const dir = mkdtempSync(join(tmpdir(), 'bracken-frames-' + lv.id + '-'));
  await B.open();
  const o = { id: lv.id, route, every: EVERY, maxF: MAXSECS * 60, arenaSecs: 25, stallF: 420 };
  await B.evalp('(' + pageInit.toString() + ')(' + JSON.stringify(o) + ')');
  const chunkSrc = '(' + pageChunk.toString() + ')';
  let n = 0, t0 = Date.now();
  for (;;) {
    const r = await B.evalp(chunkSrc + '(120)');
    for (const b64 of r.frames) writeFileSync(join(dir, String(n++).padStart(6, '0') + '.jpg'), Buffer.from(b64, 'base64'));
    if (r.end || !r.frames.length) break;
  }
  const sum = await B.evalp('(' + pageSummary.toString() + ')()');
  /* ffmpeg: squeeze the run into SECS seconds at no less than real speed, 30fps out, doubled in size with hard pixels */
  const fps = Math.max(60 / EVERY, n / SECS), mp4 = join(OUT, lv.id + '.mp4'), sheet = join(OUT, lv.id + '-sheet.png');
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', fps.toFixed(3), '-i', join(dir, '%06d.jpg'), '-vf', 'scale=640:360:flags=neighbor', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '30', '-preset', 'veryfast', mp4], { encoding: 'utf8' });
  const every = Math.max(1, Math.floor(n / 12));
  spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(dir, '%06d.jpg'), '-vf', `select='not(mod(n\\,${every}))',scale=320:180:flags=neighbor,tile=4x3`, '-frames:v', '1', sheet], { encoding: 'utf8' });
  rmSync(dir, { recursive: true, force: true });
  /* hits by place: which eight-column stretches cost the most */
  const byPlace = {}; for (const [x, y, d] of sum.hits) { const k = Math.floor(x / 8) * 8 + ',' + Math.floor(y / 8) * 8; byPlace[k] = (byPlace[k] || 0) + d; }
  const hot = Object.entries(byPlace).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, d]) => ({ at: k, dmg: d }));
  const info = { id: lv.id, videoSecs: +(n / fps).toFixed(1), speedup: +(fps / (60 / EVERY)).toFixed(2), captured: n, gameSecs: Math.round(sum.frames / 60), end: sum.end, reachedPct: sum.reachedPct,
    teleports: sum.tps.map(t => ({ stalledAt: t.from, to: t.to, atSec: Math.round(t.f / 60) })), deaths: sum.deaths.map(([x, y, f]) => ({ at: [x, y], atSec: Math.round(f / 60) })),
    hits: sum.hits.length, damage: sum.hits.reduce((s, h) => s + h[2], 0), heals: sum.heals, ambushAssists: sum.assists, hotspots: hot, wallSecs: Math.round((Date.now() - t0) / 1000), ffmpeg: ff.status === 0 ? 'ok' : (ff.stderr || '').slice(0, 300) };
  writeFileSync(join(OUT, lv.id + '.json'), JSON.stringify(info, null, 1));
  return info;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  /* THE SERVER IS LEFT RUNNING. A run that killed the server it started pulled it out from under every other run on the
     same port (two batches and a stills pass died that way). It is started detached and left up; stop it by hand. */
  const server = null;
  const ensure = async () => { if (await up()) return; const s = spawn(process.execPath, ['serve.mjs'], { cwd: ROOT, stdio: 'ignore', detached: true, env: { ...process.env, PORT: String(PORT) } }); s.unref();
    for (let i = 0; i < 40 && !(await up()); i++) await sleep(250); if (!(await up())) throw new Error('dev server did not come up on ' + URL0); };
  await ensure(); globalThis.__ensure = ensure;
  const list = LEVELS.filter(lv => (!lv.hidden || lv.secret) && (!want.length || want.includes(lv.id)));
  /* --stills=<file.json> { level: [[x, y, "label"], ...] }: a frame at each place, and a sheet of them, instead of a video */
  const stillsFile = opt('stills', '');
  if (stillsFile) { const spec = JSON.parse((await import('fs')).readFileSync(stillsFile, 'utf8')); const B = await browser();
    try { for (const lv of list) { const pts = spec[lv.id]; if (!pts || !pts.length) continue; await B.open();
      await B.evalp('(' + pageInit.toString() + ')(' + JSON.stringify({ id: lv.id, route: [], every: 4 }) + ')');
      const dir = mkdtempSync(join(tmpdir(), 'bracken-stills-'));
      for (let i = 0; i < pts.length; i++) { const [x, y, label] = pts[i]; const b64 = await B.evalp('(' + pageStill.toString() + ')(' + x + ',' + y + ',' + JSON.stringify(lv.id + ' ' + x + ',' + y + ' ' + (label || '')) + ',' + JSON.stringify(lv.id) + ')');
        const raw = join(dir, 'raw' + i + '.jpg'); writeFileSync(raw, Buffer.from(b64, 'base64'));
        /* a boss room zooms the view out to 640x360, and a tile of mixed sizes keeps only the first: scale each one alone */
        spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-vf', 'scale=320:180:flags=neighbor', join(dir, String(i).padStart(3, '0') + '.png')]); }
      const cols = Math.min(3, pts.length), rows = Math.ceil(pts.length / cols);
      spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(dir, '%03d.png'), '-vf', `tile=${cols}x${rows}`, '-frames:v', '1', join(OUT, lv.id + '-spots.png')]);
      rmSync(dir, { recursive: true, force: true }); console.log(lv.id + ': ' + pts.length + ' stills'); } }
    finally { B.close(); if (server) server.kill(); }
    return; }
  const jobs = list.map(lv => { const p = pacing(lv); const pts = []; let next = 0;
    for (let i = 0; i < p.route.length; i++) if (p.cum[i] >= next || i === p.route.length - 1) { pts.push(p.route[i]); next = p.cum[i] + 3; }
    return { lv, route: pts }; });
  let k = 0; const results = [];
  const worker = async () => { const B = await browser();
    try { while (k < jobs.length) { const j = jobs[k++]; const t = Date.now();
      try { const r = await record(B, j.lv, j.route); results.push(r); console.log(j.lv.id.padEnd(11) + ' ' + r.end.padEnd(16) + ' route ' + String(r.reachedPct).padStart(3) + '%  tp ' + r.teleports.length + '  died ' + r.deaths.length + '  hits ' + r.hits + '  ' + r.gameSecs + 's game -> ' + r.videoSecs + 's video  (' + Math.round((Date.now() - t) / 1000) + 's)'); }
      catch (e) { console.log(j.lv.id + ' FAILED: ' + e.message); } } }
    finally { if (B.errors.length) console.log('page errors: ' + B.errors.slice(0, 4).join(' | ')); B.close(); } };
  await Promise.all(Array.from({ length: Math.min(PAR, jobs.length) }, worker));
  writeFileSync(join(OUT, 'summary.json'), JSON.stringify(results, null, 1));
  if (server) server.kill();
}
main().catch(e => { console.error(e.message); process.exit(1); });
