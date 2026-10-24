// tools/trailer.mjs - THE TRAILER: shot clips recorded from the BOT PLAYING THE REAL GAME, then cut to music. (claude/trailer, 10-24)
// Nothing here is staged: every clip is the playtest walker or the boss bot (src/lab.js bossLab, profile 'human', the typical build + flasks)
// playing the live build headless; a rolling window of the 320x180 buffer is kept and the BEST window of the run is the clip (boss fights: the most
// damage dealt to the boss with the hero alive; walks: the most travel - zip lines, carts, slides, climbs - with no teleport and no heal). A clip
// never holds a teleport frame, and a boss clip is only kept when the hero WON (otherwise the next seed, at most --tries=3).
// No debug overlay: levelvideo's red STALLED/teleport strip is not drawn; the audio is unlocked by cdp.mjs (a key press) so there is no
// PRESS A KEY FOR SOUND banner; the HUD is the game's own MINIMAL one with the clock, hit numbers, tips and foe bars off.
//
//   PORT=8983 node tools/trailer.mjs record [--shots=a,b|all] [--tries=3] [--out=<dir>]   record clips -> <out>/clips/<shot>/%05d.png + <shot>.json
//   node tools/trailer.mjs sheets [--shots=..]                                              a contact sheet per clip (to look at before the cut)
//   node tools/trailer.mjs cards                                                            title / tagline / end cards drawn in the game's font (needs a page: PORT=..)
//   node tools/trailer.mjs cut [--which=main|vertical|demo]                                 cut the MP4 to the music (ffmpeg)
//   node tools/trailer.mjs list                                                             the shot list
// Outputs are NOT in git: default <out> = ../scratch/trailer next to the lanes' root. FFMPEG=<path to ffmpeg> (default: the winget build, else PATH).
import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { pacing } from './pacing.mjs';
import { fightFlasks } from './boss-run.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2), cmd = args.find(a => !a.startsWith('--')) || 'list';
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const OUT = opt('out', join(ROOT, '..', 'scratch', 'trailer')), CLIPS = join(OUT, 'clips');
const FF_WINGET = 'C:/Users/Daniel Raphael/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.0.2-full_build/bin/ffmpeg.exe';
const FFMPEG = process.env.FFMPEG || (existsSync(FF_WINGET) ? FF_WINGET : 'ffmpeg');
const FPS = 30, TRIES = +opt('tries', 3), J = JSON.stringify;
const ff = (a, o = {}) => spawnSync(FFMPEG, ['-y', '-loglevel', 'error', ...a], { encoding: 'utf8', ...o });

/* ---------------- THE SHOT LIST ---------------- */
/* kind 'boss': hero vs level's boss (or its mini); kit = three skills, in the order the bot prefers; lvl = the hero's level (20: every hero has a real kit).
   kind 'walk': the walker from route fraction `from` to `to` (the best window of that stretch). secs = the window kept (the cut trims it).
   sect: where the shot sits in the main cut. */
const KIT = {
  knight: ['swordOfRealm', 'groundSlam', 'whirlwind'], warden: ['setSpears', 'rainOfSpears', 'spearDance'], pyro: ['meteor', 'fireWall', 'flameRing'],
  paladin: ['dawnburst', 'lightLance', 'holyCharge'], pirate: ['broadside', 'powderKeg', 'keelhaul'], reaper: ['soulReap', 'gravecall', 'summonSkeleton'],
  geomancer: ['boulder', 'faultLine', 'avalanche'], berserker: ['bzCleave', 'bzRampage', 'bzStorm'], ranger: ['rgVolley', 'rgHawk', 'rgRain'],
};
const B = (id, level, hero, extra = {}) => ({ id, kind: 'boss', level, hero, lvl: 24, secs: 6, ...extra });
const W = (id, level, hero, from, to, extra = {}) => ({ id, kind: 'walk', level, hero, lvl: 12, from, to, secs: 6, ...extra });
export const SHOTS = [
  B('open_cistern', 'underwell', 'pyro', { sect: 'open', note: 'the Cistern Queen ablaze' }),
  B('hero_knight', 'kings', 'knight', { sect: 'hero', note: 'King Gorm, Kingswood 2' }),
  B('hero_warden', 'hornetsnest', 'warden', { sect: 'hero', note: "the Hornet Queen, Hornet's Nest 2 honey hall" }),
  B('hero_geomancer', 'spore', 'geomancer', { sect: 'hero', note: 'the Mother Cap, Sporewood 2' }),
  B('hero_pyro', 'fair', 'pyro', { sect: 'hero', note: 'the Wicker Queen' }),
  B('hero_paladin', 'sealedpyramid', 'paladin', { sect: 'hero', note: 'the Tomb King' }),
  B('hero_ranger', 'hanging', 'ranger', { sect: 'hero', note: 'the Owl Reeve' }),
  B('hero_reaper', 'buriedcity', 'reaper', { sect: 'hero', note: 'the Hourglass King' }),
  B('hero_berserker', 'minecart', 'berserker', { sect: 'hero', note: 'the Great Drill' }),
  B('hero_pirate', 'causeway', 'pirate', { sect: 'hero', note: 'the Kraken' }),
  { id: 'trav_ksar', kind: 'zip', level: 'ksar', hero: 'knight', lvl: 12, line: 2, secs: 5, sect: 'trav', note: 'Ksar (the zip line)' },
  W('trav_rails', 'minecart', 'warden', 0.05, 0.9, { sect: 'trav', note: 'Deep Rails (cart)' }),
  W('trav_tower', 'fallingtower', 'ranger', 0.05, 0.9, { sect: 'trav', note: 'the Falling Tower climb' }),
  W('trav_sand', 'buriedcity', 'geomancer', 0.05, 0.9, { sect: 'trav', note: 'the Buried City sand' }),
  W('trav_lock', 'towpath', 'knight', 0.05, 0.9, { sect: 'trav', note: 'the Towpath lock' }),
  W('trav_fen', 'fenroad', 'ranger', 0.05, 0.9, { sect: 'trav', note: 'Fen Road 2 boardwalk and palisade' }),
  B('boss_duneworm', 'caravan', 'knight', { sect: 'boss', note: 'the Dune Worm breach' }),
  B('boss_dk', 'unburied', 'paladin', { sect: 'boss', note: 'the Blood Knight (the Death Knight)' }),
  B('boss_colossus', 'glasssea', 'warden', { sect: 'boss', note: 'the Glass Colossus' }),
  B('final_queen', 'crown', 'knight', { sect: 'final', secs: 7, note: 'the Goblin Queen (the big finish)' }),
  /* the early-November DEMO cut: act I only (Lumber Trail, Hornet's Nest, Marsh, Fen Road, Stockade, Burning Village + the Pyromancer's duel) */
  W('demo_wood', 'wood', 'knight', 0.05, 0.9, { demo: 1, lvl: 4, note: 'the Lumber Trail' }),
  W('demo_nest', 'hornetsnest', 'warden', 0.2, 0.9, { demo: 1, lvl: 6, note: "the Hornet's Nest honey hall" }),
  B('demo_queen', 'hornetsnest', 'geomancer', { demo: 1, lvl: 10, note: 'the Hornet Queen' }),
  W('demo_marsh', 'marsh', 'ranger', 0.05, 0.9, { demo: 1, lvl: 8, note: 'Marsh Wood pads' }),
  W('demo_fen', 'fenroad', 'warden', 0.05, 0.9, { demo: 1, lvl: 8, note: 'Fen Road' }),
  B('demo_stockade', 'stockade', 'knight', { demo: 1, lvl: 12, note: 'the Goblin Chieftain' }),
  W('demo_burning', 'burning', 'pyro', 0.05, 0.9, { demo: 1, lvl: 8, note: 'the Burning Village, as the Pyromancer' }),
  B('demo_duel', 'burning', 'ranger', { demo: 1, lvl: 12, note: "the Pyromancer's duel" }),
];

/* ---------------- in the page ---------------- */
const PAGE_LIB = `(() => {
  if (window.__TR) return true;
  const T = window.__TR = {};
  const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360; const cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false;
  const step0 = BK.step, sim0 = BK.sim;
  T.sim0 = sim0;
  /* one frame, drawn on the real state, normalised to 640x360 (a boss room zooms the buffer; both sizes are whole multiples of 320x180) */
  /* TWO PASSES over the same seeded run: 'score' draws every second frame (the draw is part of the run's dice) and keeps only the numbers; 'grab' replays
     it identically and PNG-encodes just the winning window (encoding is what costs) */
  T.draw = () => { step0.call(BK, 0); };
  T.shot = () => { cx.clearRect(0, 0, 640, 360); cx.drawImage(BK.buf, 0, 0, 640, 360); return cv.toDataURL('image/png').slice(22); };
  T.begin = o => { Object.assign(T, { N: o.N, every: o.every || 2, ring: [], sum: 0, bad: 0, best: null, f: 0, accS: 0, accB: 0, warm: o.warm || 0, mode: o.mode || 'score', from: o.from || 0, to: o.to || 0, out: [], hxs: [] }); };
  T.tick = (s, bad, hx) => {
    T.f++; T.accS += s; if (bad) T.accB++;
    if (T.f % T.every) return;
    T.draw();
    if (T.mode === 'grab') { if (T.f >= T.from && T.f <= T.to) T.out.push(T.shot()); return; }
    if (T.f < T.warm) { T.accS = 0; T.accB = 0; return; }
    const rec = { s: T.accS, b: T.accB, hx }; T.accS = 0; T.accB = 0;
    T.ring.push(rec); T.sum += rec.s; if (rec.b) T.bad++;
    if (T.ring.length > T.N) { const o = T.ring.shift(); T.sum -= o.s; if (o.b) T.bad--; }
    if (T.ring.length === T.N && T.bad === 0 && (!T.best || T.sum > T.best.score)) T.best = { score: T.sum, endF: T.f, hx: T.ring.map(r => r.hx.map(q => +q.toFixed(3))) };
  };
  T.take = (i, n) => T.out.slice(i, i + n);
  T.meta = () => T.best ? { score: Math.round(T.best.score), endF: T.best.endF, hx: T.best.hx } : null;
  /* the game as the player sees it, minus what a trailer should not carry */
  T.clean = () => { Object.assign(BK.SET, { timer: false, numbers: false, tips: false, foeBars: false, hud: 'minimal', hideHud: true, fps: false, boxes: 'off', wayOn: false, wayStall: false, hints: 'none', music: false, sfx: 0 }); };
  /* the boss fight: damage dealt to the boss is the score; the hero's death is 'bad' */
  T.hookBoss = (bossT) => { let prev = null; BK.sim = function (n = 1) { for (let i = 0; i < n; i++) { sim0.call(BK, 1);
    const b = BK.enemies().find(e => e.t === bossT && e.alive), P = BK.P, v = BK.view;
    const d = b ? (prev !== null ? Math.max(0, prev - b.hp) : 0) : 0; prev = b ? b.hp : prev;
    if (T.on) T.tick(d, P.dead > 0, [(P.x - v.x) / v.VW, (P.y - 14 - v.y) / v.VH, b ? (b.x - v.x) / v.VW : (P.x - v.x) / v.VW, b ? (b.y - 14 - v.y) / v.VH : (P.y - 14 - v.y) / v.VH]); } }; };
  T.unhook = () => { BK.sim = sim0; T.on = false; };
  return true;
})()`;

/* the walker: levelvideo's loop (src/playtest.js makeBot along the pacing route) with the rolling window; no overlay is ever drawn */
async function pageWalk(o) {
  const BK = window.BK, T = window.__TR, PT = await import('/src/playtest.js'), LV = await import('/src/level.js');
  const li = LV.LEVELS.findIndex(l => l.id === o.id);
  BK.setHero(o.hero); BK.load(li); BK.state = 'play'; BK.start(); BK.god = false; BK.reset();
  const wp = o.route, P = BK.P; let bot = PT.makeBot(BK), idx = Math.round(o.from * (wp.length - 1)), best = idx, stall = 0, f = 0, tps = 0, heals = 0, lastX = 0, lastY = 0, end = null, hp = P.hp;
  if (idx > 0) { BK.tp(wp[idx][0], wp[idx][1]); BK.reset(); bot = PT.makeBot(BK); }
  lastX = P.x; lastY = P.y;
  const lastIdx = Math.round(o.to * (wp.length - 1)), nearest = (lo, hi) => { const tx = Math.floor(P.x / 16), ty = Math.round(P.y / 16) - 1; let bi = -1, bd = 1e9;
    for (let j = Math.max(0, lo); j < Math.min(wp.length, hi); j++) { const d = Math.abs(wp[j][0] - tx) + Math.abs(wp[j][1] - ty) * 1.5; if (d < bd) { bd = d; bi = j; } } return [bi, bd]; };
  while (!end) {
    const tx = Math.floor(P.x / 16), ty = Math.round(P.y / 16) - 1, jumped = Math.abs(P.x - lastX) > 90 || Math.abs(P.y - lastY) > 90;
    const [bi, bd] = jumped ? nearest(0, best + 30) : nearest(idx - 15, idx + 25); if (bi >= 0 && bd < (jumped ? 14 : 6)) idx = bi;
    lastX = P.x; lastY = P.y; if (idx > best) { best = idx; stall = 0; } else stall++;
    const A = BK.L.arena, inArena = A && P.x > A.x0 && P.x < A.x1 && Math.abs(P.y - A.floor) < 16 * 14;
    const tgt = wp[Math.min(wp.length - 1, idx + 4)], r = bot(inArena ? A.x1 - 20 : tgt[0] * 16 + 8);
    if (!inArena && tgt[1] < ty - 1 && Math.abs(tgt[0] - tx) <= 2 && P.ground && f % 24 === 0) BK.press('jump');
    let bad = false;
    if (P.hp < P.maxHp * 0.35 && !P.dead) { P.hp = P.maxHp; heals++; bad = true; }   /* the bot is topped up (no god mode); a window holding that is not kept */
    const amb = (BK.ambushes() || []).find(q => q.st && q.st !== 'done');
    if (stall > (amb ? 1e9 : 420) || (r === 'stuck' && !inArena && !amb)) { const to = Math.min(wp.length - 1, best + 6); BK.tp(wp[to][0], wp[to][1]); BK.reset(); idx = best = to; stall = 0; bot = PT.makeBot(BK); lastX = P.x; lastY = P.y; tps++; bad = true; }
    const px = P.x, py = P.y; BK.sim(1); f++;
    if (P.dead > 0) bad = true;
    const v = BK.view; T.tick(Math.abs(P.x - px) + 1.5 * Math.abs(P.y - py) + (P.ground ? 0 : 0.4), bad, [(P.x - v.x) / v.VW, (P.y - 14 - v.y) / v.VH, (P.x - v.x) / v.VW, (P.y - 14 - v.y) / v.VH]);
    if (BK.state !== 'play') end = 'state ' + BK.state; else if (idx >= lastIdx) end = 'reached'; else if (f > o.maxF) end = 'time cap';
  }
  return { end, f, idx, tps, heals, routeLen: wp.length };
}

/* a ZIP LINE ride: the hero is stood under the rope's high end (a tp BEFORE the window opens), UP is pressed, and he rides it (src/zipline.js) */
async function pageZip(o) {
  const BK = window.BK, T = window.__TR, LV = await import('/src/level.js');
  BK.setHero(o.hero); BK.load(LV.LEVELS.findIndex(l => l.id === o.id)); BK.state = 'play'; BK.start(); BK.god = false; BK.reset();
  const z = BK.L.zipLines[o.line], P = BK.P, tx = Math.round(z.x0 / 16); let ty = Math.floor(z.y0 / 16);
  while (ty < BK.L.H - 1 && BK.L.grid[ty * BK.L.W + tx] !== LV.T.SOLID) ty++;
  for (const e of BK.enemies()) if (Math.abs(e.x - z.x0) < 400) e.alive = false;
  BK.tp(tx, ty - 1); BK.reset(); BK.sim(30);
  /* he hangs where the rope is (a jump that touches it takes hold, src/zipline.js): put him at the high end, in the air, a few px under it */
  P.x = z.x0 + 6; P.y = z.y0 + z.hang + 12 + (o.dy || 0); P.vx = P.vy = 0; BK.sim(2);
  let f = 0; const px0 = P.x;
  for (; f < o.maxF; f++) { const px = P.x, py = P.y; if (f % 12 === 0 && f < 60 && !P.zip) BK.press('up'); BK.sim(1);
    const v = BK.view; T.tick(Math.abs(P.x - px) + 1.5 * Math.abs(P.y - py), P.dead > 0, [(P.x - v.x) / v.VW, (P.y - 14 - v.y) / v.VH, (P.x - v.x) / v.VW, (P.y - 14 - v.y) / v.VH]); }
  return { f, moved: Math.round(P.x - px0), line: o.line };
}

/* ---------------- the browser side, from node ---------------- */
const fightJs = ({ level, mini, hero, lvl, seed, secs }) => {
  const fk = fightFlasks(level), fkN = Object.keys(fk).filter(k => ['tonic', 'extra2', 'extra3'].includes(k)).length;
  return `(async()=>{BK.manualSimulation=true;const P0=BKT.PROG,h=${J(hero)},lvl=${lvl};BKT.setHeroLevel(h,lvl);P0.skillOwned=P0.skillOwned||{};P0.loadouts=P0.loadouts||{};P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
    const B=await import('/src/bot-profile.js'),PR=await import('/src/progression.js');P0.card[h]=B.typicalCard(lvl);
    const kit=${J(KIT[hero] || [])}.filter(id=>{const n=PR.skillFor(h,id);return n&&n.active&&n.level<=lvl;}).slice(0,PR.slotsAt(lvl));for(const id of kit)P0.skillOwned[h][id]=true;P0.loadouts[h]=kit.slice();
    P0.flaskItems=${J(fk)};P0.flaskUp=${fkN};
    BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();__TR.clean();
    const r=(await BK.bossLab({bosses:[${J(level)}],heroes:[h],maxSecs:${secs},healthMode:'normal',seed:${seed},profile:'human',skills:true${mini ? ',mini:true' : ''}})).rows[0]||{};
    return {kit,outcome:r.outcome||r.skipped,boss:r.boss,secs:r.secs,bossLeft:r.hpLeftPct,speed:BK.SET.speed};})()`;
};
async function takeFrames(pg, dir, n) {
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const got = await pg.evalp('__TR.out.length'); if (got !== n) return null;
  for (let i = 0; i < n; i += 40) { const part = await pg.evalp(`__TR.take(${i},40)`); part.forEach((b, k) => writeFileSync(join(dir, String(i + k).padStart(5, '0') + '.png'), Buffer.from(b, 'base64'))); }
  return n;
}
/* one pass of a shot on a FRESH page: mode 'score' finds the best window; mode 'grab' (with the window) replays it and keeps the frames */
async function runShot(s, seed, mode, win) {
  const lv = LEVELS.find(l => l.id === s.level); if (!lv) throw new Error('no level ' + s.level);
  const N = s.secs * FPS, pg = await openPage({ audio: true, fonts: true, seed: 1000 + seed });
  try {
    await pg.evalp(PAGE_LIB); await pg.evalp('(async()=>{BK.manualSimulation=true;__TR.clean();return true})()');
    const begin = `__TR.begin({N:${N},every:2,warm:${s.kind === 'boss' ? 0 : 45},mode:${J(mode)},from:${win ? win.endF - (N - 1) * 2 : 0},to:${win ? win.endF : 0}})`;
    if (s.kind === 'boss') {
      const bt = await pg.evalp(`(async()=>{const LV=await import('/src/level.js');BK.manualSimulation=true;BK.load(LV.LEVELS.findIndex(l=>l.id===${J(s.level)}));const A=${s.mini ? 'BK.L.mini' : 'BK.L.arena'};return A&&A.boss})()`);
      if (!bt) throw new Error('no boss in ' + s.level);
      await pg.evalp(begin + `;__TR.hookBoss(${J(bt)});__TR.on=true;true`);
      const row = await pg.evalp(fightJs({ level: s.level, mini: s.mini, hero: s.hero, lvl: s.lvl, seed, secs: 150 }), 900000);
      await pg.evalp('__TR.unhook()').catch(() => {});
      return { pg, row: { ...row, won: row.outcome === 'win' || row.outcome === 'trade' }, meta: await pg.evalp('__TR.meta()') };
    }
    if (s.kind === 'zip') {
      await pg.evalp(`(async()=>{BK.manualSimulation=true;BKT.setHeroLevel(${J(s.hero)},${s.lvl});BK.setHero(${J(s.hero)});__TR.clean();${begin};return true})()`);
      const r = await pg.evalp(`(${pageZip.toString()})(${J({ id: s.level, hero: s.hero, line: s.line, maxF: 60 * 12 })})`, 300000);
      return { pg, row: { ...r, won: true }, meta: await pg.evalp('__TR.meta()') };
    }
    const p = pacing(lv), pts = []; let next = 0;
    for (let i = 0; i < p.route.length; i++) if (p.cum[i] >= next || i === p.route.length - 1) { pts.push(p.route[i]); next = p.cum[i] + 3; }
    const from = Math.min(0.95, s.from + (seed - 1) * 0.07), o = { id: s.level, hero: s.hero, route: pts, from, to: s.to, N, maxF: 60 * 150 };
    await pg.evalp(`(async()=>{BK.manualSimulation=true;BKT.setHeroLevel(${J(s.hero)},${s.lvl});BK.setHero(${J(s.hero)});__TR.clean();${begin};return true})()`);
    const r = await pg.evalp(`(${pageWalk.toString()})(${J(o)})`, 900000);
    return { pg, row: { ...r, from, won: true }, meta: await pg.evalp('__TR.meta()') };
  } catch (e) { await pg.close(); throw e; }
}
async function recordOne(s, seed) {
  const t0 = Date.now(), N = s.secs * FPS, dir = join(CLIPS, s.id);
  const a = await runShot(s, seed, 'score'); await a.pg.close();
  if (!a.row.won || !a.meta) return { ok: false, row: a.row, wall: Math.round((Date.now() - t0) / 1000) };
  const b = await runShot(s, seed, 'grab', a.meta);
  try { const n = await takeFrames(b.pg, dir, N); return { ok: !!n, row: a.row, meta: a.meta, replay: n ? 'same' : 'DIVERGED (' + (await b.pg.evalp('__TR.out.length')) + ' frames)', wall: Math.round((Date.now() - t0) / 1000) }; } finally { await b.pg.close(); }
}
const freeMB = () => { const r = spawnSync('powershell', ['-NoProfile', '-Command', '[int]((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory/1024)'], { encoding: 'utf8' }); return +r.stdout.trim() || 0; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitRam() { for (let i = 0; i < 10 && freeMB() < 1500; i++) { console.log('free RAM ' + freeMB() + ' MB < 1500: waiting 2 min'); await sleep(120000); } }

async function record() {
  const want = opt('shots', 'all'), list = want === 'all' ? SHOTS : SHOTS.filter(s => want.split(',').includes(s.id) || want.split(',').includes(s.sect));
  mkdirSync(CLIPS, { recursive: true });
  for (const s of list) {
    let done = null;
    for (let seed = 1; seed <= TRIES && !done; seed++) {
      await waitRam();
      try { const r = await recordOne(s, seed);   /* a fresh page per pass: no state crosses a clip; audio unlocked by cdp.mjs (no PRESS A KEY banner) */ console.log(s.id.padEnd(16) + ' seed ' + seed + ' ' + (r.ok ? 'OK ' : 'no ') + (r.replay || '') + ' ' + JSON.stringify(r.row).slice(0, 220) + ' ' + r.wall + 's');
        if (r.ok) { done = { shot: s.id, level: s.level, hero: s.hero, kind: s.kind, note: s.note, seed, ...r.row, meta: r.meta, secs: s.secs, replay: r.replay }; writeFileSync(join(CLIPS, s.id + '.json'), J(done)); } }
      catch (e) { console.log(s.id + ' seed ' + seed + ' FAILED: ' + String(e.message).slice(0, 200)); }
    }
    if (!done) console.log(s.id + ': NO CLIP after ' + TRIES + ' tries');
  }
}

/* ---------------- sheets ---------------- */
function sheets() {
  const want = opt('shots', 'all');
  for (const f of readdirSync(CLIPS).filter(f => f.endsWith('.json'))) { const id = f.slice(0, -5); if (want !== 'all' && !want.split(',').includes(id)) continue;
    const r = ff(['-framerate', String(FPS), '-i', join(CLIPS, id, '%05d.png'), '-vf', 'select=not(mod(n\\,30)),scale=320:180:flags=neighbor,tile=3x2', '-frames:v', '1', join(CLIPS, id + '-sheet.png')]); console.log(id + (r.status === 0 ? ' sheet' : ' ' + r.stderr)); }
}

const main = { record, sheets, list: () => SHOTS.forEach(s => console.log(s.id.padEnd(16), s.kind.padEnd(5), s.level.padEnd(13), s.hero.padEnd(10), s.note))   };
if (!main[cmd]) { console.error('commands: ' + Object.keys(main).join(' ') + ' cards cut'); process.exit(1); }
if (process.argv[1] && /trailer.mjs$/.test(process.argv[1])) await main[cmd]();
