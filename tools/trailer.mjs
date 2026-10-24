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
import { SCENES, SCENES2 } from './trailer-scenes.mjs';

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
export const SHOTS0 = [
  B('open_cistern', 'underwell', 'pyro', { lvl: 30, sect: 'open', note: 'the Cistern Queen ablaze' }),
  B('hero_knight', 'kings', 'knight', { sect: 'hero', note: 'King Gorm, Kingswood 2' }),
  B('hero_warden', 'hornetsnest', 'warden', { sect: 'hero', note: "the Hornet Queen, Hornet's Nest 2 honey hall" }),
  B('hero_geomancer', 'spore', 'geomancer', { sect: 'hero', note: 'the Mother Cap, Sporewood 2' }),
  B('hero_pyro', 'fair', 'pyro', { sect: 'hero', note: 'the Wicker Queen' }),
  B('hero_paladin', 'fields', 'paladin', { sect: 'hero', note: 'the Scarecrow King' }),
  B('hero_ranger', 'hanging', 'ranger', { sect: 'hero', note: 'the Owl Reeve' }),
  B('hero_reaper', 'buriedcity', 'reaper', { sect: 'hero', note: 'the Hourglass King' }),
  B('hero_berserker', 'minecart', 'berserker', { sect: 'hero', note: 'the Great Drill' }),
  B('hero_pirate', 'causeway', 'pirate', { sect: 'hero', note: 'the Kraken' }),
  { id: 'trav_ksar', kind: 'zip', level: 'ksar', hero: 'knight', lvl: 12, line: 2, secs: 6, sect: 'trav', note: 'Ksar (the zip line, 350 px: line 1 draws a NaN glow in ksar_props2 when stood at its head)' },
  W('trav_rails', 'minecart', 'warden', 0.05, 0.9, { sect: 'trav', note: 'Deep Rails (cart)' }),
  W('trav_tower', 'fallingtower', 'ranger', 0.05, 0.9, { sect: 'trav', note: 'the Falling Tower climb' }),
  W('trav_sand', 'buriedcity', 'geomancer', 0.05, 0.9, { sect: 'trav', note: 'the Buried City sand' }),
  W('trav_lock', 'towpath', 'knight', 0.05, 0.9, { sect: 'trav', note: 'the Towpath lock' }),
  W('coop_spore', 'spore', 'knight', 0.1, 0.6, { sect: 'coop', ally: ['warden', 'balanced'], note: 'local co-op: a knight and a warden (AI partner) through Sporewood 2' }),
  W('trav_fen', 'fenroad', 'ranger', 0.05, 0.9, { sect: 'trav', note: 'Fen Road 2 boardwalk and palisade' }),
  B('boss_duneworm', 'caravan', 'knight', { sect: 'boss', note: 'the Dune Worm breach' }),
  B('boss_dk', 'unburied', 'paladin', { sect: 'boss', note: 'the Blood Knight (the Death Knight)' }),
  B('boss_colossus', 'glasssea', 'ranger', { lvl: 30, sect: 'boss', note: 'the Glass Colossus' }),
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
/* v2 (Daniel 10-24: 'can the trailer show more than combat?'): the LEVEL VERBS and SET PIECES, walked by the bot with the hero close (zoom: a 384x216 window of the plate, x5) */
const V = (id, level, hero, from, to, extra = {}) => W(id, level, hero, from, to, { zoom: 1, lvl: 14, ...extra });
const SHOTS2 = [
  V('verb_spore', 'spore', 'knight', 0.15, 0.65, { note: 'Sporewood 2: bounce caps and leaning caps carry the road' }),
  V('verb_nest', 'hornetsnest', 'knight', 0.25, 0.75, { lvl: 8, note: "the Hornet's Nest: a struck comb drops and becomes a step" }),
  V('verb_kings', 'kings', 'knight', 0.72, 0.98, { setup: 'BK.gorm().flee()', note: "King Gorm's escape run: the burning wood behind you" }),
  V('verb_hanging', 'hanging', 'ranger', 0.2, 0.9, { note: 'the Hanging Village: the hoist and the bridges of a town on a cliff' }),
  V('verb_burning', 'burning', 'knight', 0.1, 0.9, { lvl: 8, note: 'the Burning Village: water against the fire' }),
];
for (const s of SHOTS0) if (s.kind === 'walk' || s.kind === 'zip') s.zoom = 1;   /* v2: every walk and ride frames the hero close */
export const SHOTS = [...SHOTS0, ...SHOTS2, ...SCENES.concat(SCENES2).map(c => ({ kind: 'scene', level: '', hero: '', ...c }))];

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
  /* a SCENE: scripted frames. cap(n) runs n game frames (a picture every second one = 30 fps) and keeps them with where the hero sits in the plate (for the crops) */
  T.cap = n => { for (let i = 0; i < n; i += 2) { BK.step(2); T.out.push(T.shot()); const P = BK.P, v = BK.view; T.hxs.push(BK.state === 'play' && P ? [(P.x - v.x) / v.VW, (P.y - 14 - v.y) / v.VH, (P.x - v.x) / v.VW, (P.y - 14 - v.y) / v.VH].map(q => +Math.max(0.05, Math.min(0.95, q)).toFixed(3)) : [0.5, 0.5, 0.5, 0.5]); } };
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
  if (o.ally) { BK.coopEnd(); BK.reset({ fresh: true }); await BK.allyReady(); BK.setHero(o.hero); BK.aiComp.arm([o.ally[0]], [o.ally[1]], 1); }
  else BK.setHero(o.hero);
  BK.load(li); BK.state = 'play'; BK.start(); BK.god = false; BK.reset(); if (o.ally) BK.sim(5);
  const wp = o.route, P = BK.P; let bot = PT.makeBot(BK), idx = Math.round(o.from * (wp.length - 1)), best = idx, stall = 0, f = 0, tps = 0, heals = 0, lastX = 0, lastY = 0, end = null, hp = P.hp;
  if (idx > 0) { BK.tp(wp[idx][0], wp[idx][1]); BK.reset(); bot = PT.makeBot(BK); }
  if (o.setup) (0, eval)(o.setup);   /* a state set after the tp (the escape run: BK.gorm().flee()) */
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
  BK.tp(tx, ty - 1); BK.reset(); BK.god = true; BK.sim(200); BK.god = false;   /* (the level's name card has gone by) */
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
    const begin = `__TR.begin({N:${N},every:2,warm:${s.kind === 'boss' || s.kind === 'zip' ? 0 : 240},mode:${J(mode)},from:${win ? win.endF - (N - 1) * 2 : 0},to:${win ? win.endF : 0}})`;
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
    const from = Math.min(0.95, s.from + (seed - 1) * 0.07), o = { id: s.level, hero: s.hero, route: pts, from, to: s.to, N, maxF: s.maxF || 60 * 150, ally: s.ally || null, setup: s.setup || null };
    await pg.evalp(`(async()=>{BK.manualSimulation=true;BKT.setHeroLevel(${J(s.hero)},${s.lvl});BK.setHero(${J(s.hero)});__TR.clean();${begin};return true})()`);
    const r = await pg.evalp(`(${pageWalk.toString()})(${J(o)})`, 900000);
    return { pg, row: { ...r, from, won: true }, meta: await pg.evalp('__TR.meta()') };
  } catch (e) { await pg.close(); throw e; }
}
/* a SCENE (tools/trailer-scenes.mjs): one fresh page, the script runs once and every frame it keeps is the clip */
async function recordScene(s, seed) {
  const t0 = Date.now(), dir = join(CLIPS, s.id), pg = await openPage({ audio: true, fonts: true, seed: 1000 + seed });
  try {
    await pg.evalp(PAGE_LIB); await pg.evalp('(async()=>{BK.manualSimulation=true;__TR.clean();' + (s.hud ? 'BK.SET.hideHud=false;' : '') + '__TR.begin({N:0,mode:"grab",from:1e9,to:0});return true})()');
    await pg.evalp('(async()=>{const { LEVELS } = await import("/src/level.js");const idx = id => LEVELS.findIndex(l => l.id === id), cap = n => __TR.cap(n);BK.manualSimulation=true;' + s.js + ';return true})()', 600000);
    const n = await pg.evalp('__TR.out.length'), hx = await pg.evalp('__TR.hxs'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    for (let i = 0; i < n; i += 40) { const part = await pg.evalp('__TR.take(' + i + ',40)'); part.forEach((b, k) => writeFileSync(join(dir, String(i + k).padStart(5, '0') + '.png'), Buffer.from(b, 'base64'))); }
    return { ok: n > 0, row: { frames: n, mask: s.mask, zoom: s.zoom, from: s.from }, meta: { hx }, replay: 'scene', wall: Math.round((Date.now() - t0) / 1000) };
  } finally { await pg.close(); }
}
async function recordOne(s, seed) {
  if (s.js) return recordScene(s, seed);
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
    for (let seed = 1; seed <= (s.tries || TRIES) && !done; seed++) {
      await waitRam();
      try { const r = await recordOne(s, seed);   /* a fresh page per pass: no state crosses a clip; audio unlocked by cdp.mjs (no PRESS A KEY banner) */ console.log(s.id.padEnd(16) + ' seed ' + seed + ' ' + (r.ok ? 'OK ' : 'no ') + (r.replay || '') + ' ' + JSON.stringify(r.row).slice(0, 220) + ' ' + r.wall + 's');
        if (r.ok) { done = { shot: s.id, level: s.level, hero: s.hero, kind: s.kind, note: s.note, zoom: s.zoom, mask: s.mask, from: s.from, seed, ...r.row, meta: r.meta, secs: s.secs, replay: r.replay }; writeFileSync(join(CLIPS, s.id + '.json'), J(done)); } }
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


/* ---------------- cards + the world map (one short page) ---------------- */
const CARDS = join(OUT, 'cards'), FONT = join(ROOT, 'fonts', 'PressStart2P-Regular.ttf'), BG = '0x100d18';
async function cards() {
  mkdirSync(CARDS, { recursive: true }); await waitRam();
  const pg = args.includes('--text-only') ? null : await openPage({ audio: true, fonts: true, seed: 7 });
  if (pg) try {
    await pg.evalp(PAGE_LIB); await pg.evalp('BK.manualSimulation=true;BK.step(200);true');
    /* the game's own title plaque (its font, its palette), taken off the title screen: the menu under it is left out */
    const t = await pg.evalp('BK.buf.toDataURL("image/png").slice(22)'); writeFileSync(join(CARDS, 'title-screen.png'), Buffer.from(t, 'base64'));
    /* THE WORLD MAP: every level cleared, the camera walked down the road, one frame in two kept (clips/map) */
    const dir = join(CLIPS, 'map'); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    const road = ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'kings', 'underleaf', 'scree', 'hanging', 'spire', 'moor', 'skyroad'];
    const frames = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;__TR.clean();BK.SET.hideHud=false;BK.reset({fresh:true});
      for(const l of LEVELS.slice(0,40))BKT.PROG[l.id]={cleared:true,medal:3,silver:7,quest:true};
      const out=[],road=${J(road)};BK.mapLook(road[0]);BK.step(60);
      for(let i=0;i<road.length;i++){BK.mapLook(road[i]);for(let k=0;k<10;k++){BK.step(2);out.push(__TR.shot());}}
      return out;})()`, 300000);
    frames.forEach((b, i) => writeFileSync(join(dir, String(i).padStart(5, '0') + '.png'), Buffer.from(b, 'base64')));
    writeFileSync(join(CLIPS, 'map.json'), J({ shot: 'map', kind: 'map', frames: frames.length, note: 'the world map pan' }));
    console.log('map frames ' + frames.length);
  } finally { await pg.close(); }
  /* text cards: the game's Press Start 2P on its dark purple, drawn at 320x180 and scaled 6x nearest-neighbour; the title card is the game's plaque */
  const dt = (txt, y, size, col = 'fff6e0') => `drawtext=fontfile=font.ttf:text='${txt}':fontsize=${size}:fontcolor=0x${col}:x=(w-text_w)/2:y=${y}:shadowcolor=0x000000:shadowx=1:shadowy=1`;
  const { copyFileSync } = await import('fs'); copyFileSync(FONT, join(CARDS, 'font.ttf'));
  const up = ',scale=1920:1080:flags=neighbor,format=rgb24';
  const blank = ['-f', 'lavfi', '-i', `color=c=${BG}:s=320x180`];
  const run = (name, args) => { const r = ff([...args, '-frames:v', '1', join(CARDS, name + '.png')], { cwd: CARDS }); console.log('card ' + name + (r.status === 0 ? '' : ' FAILED ' + r.stderr.slice(0, 300))); };
  run('title', ['-i', 'title-screen.png', '-filter_complex', `[0:v]crop=192:38:64:1[p];color=c=${BG}:s=320x180[b];[b][p]overlay=64:70${up}`]);
  run('end', [...blank, '-vf', [dt('BRACKEN', 52, 16, 'ffd34a'), dt('A KNIGHT, A WOOD, A MOUNTAIN', 78, 8, 'c9b27c'), dt('bracken-nine.vercel.app', 104, 8), dt('MUSIC - GREAT BOSS', 142, 8, '9aa39a'), dt('BY SPRING SPRING - CC0', 154, 8, '9aa39a')].join(',') + up]);
  run('end-demo', [...blank, '-vf', [dt('BRACKEN', 44, 16, 'ffd34a'), dt('THE ACT I DEMO', 76, 8, 'a8e06e'), dt('COMING EARLY NOVEMBER', 94, 8), dt('bracken-nine.vercel.app', 120, 8, 'c9b27c'), dt('MUSIC - GREAT BOSS', 148, 8, '9aa39a'), dt('BY SPRING SPRING - CC0', 160, 8, '9aa39a')].join(',') + up]);
}

/* ---------------- the cut ---------------- */
const TRACK = join(ROOT, 'audio', 'boss4.ogg'), BPM = 139.5, BEAT = 60 / BPM, WORK = join(OUT, 'work');
const isWide = id => {   /* a boss room draws a 640x360 buffer; every other frame is a 320x180 buffer doubled: tell them by whether every 2x2 block is one colour */
  const r = spawnSync(FFMPEG, ['-loglevel', 'error', '-i', join(CLIPS, id, '00000.png'), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 26 }); const b = r.stdout, W = 640, H = 360;
  if (!b || b.length < W * H * 3) return false; let bad = 0;
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const i = (y * W + x) * 3, j = i + 3, k = i + W * 3; for (let c = 0; c < 3; c++) if (b[i + c] !== b[j + c] || b[i + c] !== b[k + c]) { bad++; break; } }
  return bad > 30;
};
const smooth = (a, k = 15) => a.map((_, i) => { let s = 0, n = 0; for (let j = Math.max(0, i - k); j <= Math.min(a.length - 1, i + k); j++) { s += a[j]; n++; } return s / n; });
const fpath = p => p.replace(/\\/g, '/').replace(':', '\\:');
/* one clip -> an mp4, 1920x1080 (wide) or 1080x1920 (vertical). fade: [in, out] seconds */
function renderClip(id, beats, vert, fade, outFile) {
  const meta = JSON.parse(readFileSync(join(CLIPS, id + '.json'), 'utf8')), have = readdirSync(join(CLIPS, id)).filter(f => f.endsWith('.png')).length;
  const n = Math.min(have, Math.round(beats * BEAT * FPS)), start = meta.from != null ? Math.max(0, Math.min(meta.from, have - n)) : Math.max(0, Math.floor((have - n) / 2)), hx = meta.meta && meta.meta.hx;
  const wide = meta.kind === 'map' ? false : isWide(id), fl = [], boss = wide && meta.kind === 'boss';
  const fx = hx ? smooth(hx.map(q => (boss ? 0.7 * q[0] + 0.3 * q[2] : q[0]))) : null, fy = hx ? smooth(hx.map(q => (boss ? 0.7 * q[1] + 0.3 * q[3] : q[1]))) : null;
  let vf;
  if (vert) {   /* 216x360 of the 640x360 plate, followed on the hero, x5 = 1080x1800, on the game's dark purple to 1080x1920 */
    const cmdFile = join(WORK, id + '-v.cmd'), L = [];
    for (let i = 0; i < n; i++) { const cx = fx ? fx[Math.min(fx.length - 1, start + i)] : 0.5, x = Math.round(Math.max(0, Math.min(640 - 216, cx * 640 - 108))); L.push((i / FPS).toFixed(4) + ' crop x ' + x + ';'); }
    writeFileSync(cmdFile, L.join('\n')); vf = `sendcmd=f=${id}-${vert ? "v" : "w"}.cmd,crop=216:360:0:0,scale=1080:1800:flags=neighbor,pad=1080:1920:0:60:color=${BG}`;
  } else if (boss) {   /* the arena view is tiny at 3x: a 320x180 window (the game's own size), followed, x6 */
    const cmdFile = join(WORK, id + '-w.cmd'), L = [];
    for (let i = 0; i < n; i++) { const j = Math.min(fx.length - 1, start + i), x = Math.round(Math.max(0, Math.min(640 - 320, fx[j] * 640 - 160))), y = Math.round(Math.max(0, Math.min(360 - 180, fy[j] * 360 - 90))); L.push((i / FPS).toFixed(4) + ' crop x ' + x + ', crop y ' + y + ';'); }
    writeFileSync(cmdFile, L.join('\n')); vf = `sendcmd=f=${id}-${vert ? "v" : "w"}.cmd,crop=320:180:0:0,scale=1920:1080:flags=neighbor`;
  } else if (meta.zoom && hx) {   /* the hero bigger: a 384x216 window of the 640x360 plate, followed, x5 (whole-number pixels) */
    const cmdFile = join(WORK, id + '-z.cmd'), L = [];
    for (let i = 0; i < n; i++) { const j = Math.min(fx.length - 1, start + i), x = Math.round(Math.max(0, Math.min(256, fx[j] * 640 - 192))), y = Math.round(Math.max(0, Math.min(144, fy[j] * 360 - 108))); L.push((i / FPS).toFixed(4) + ' crop x ' + x + ', crop y ' + y + ';'); }
    writeFileSync(cmdFile, L.join('\n')); vf = `sendcmd=f=${id}-z.cmd,crop=384:216:0:0,scale=1920:1080:flags=neighbor`;
  } else vf = (meta.mask ? `drawbox=x=${meta.mask[0]}:y=${meta.mask[1]}:w=${meta.mask[2]}:h=${meta.mask[3]}:color=${meta.mask[4]}:t=fill,` : '') + 'scale=1920:1080:flags=neighbor';
  if (fade[0]) fl.push(`fade=t=in:st=0:d=${fade[0]}`); if (fade[1]) fl.push(`fade=t=out:st=${(n / FPS - fade[1]).toFixed(3)}:d=${fade[1]}`);
  const r = ff(['-framerate', String(FPS), '-start_number', String(start), '-i', join(CLIPS, id, '%05d.png'), '-frames:v', String(n), '-vf', [vf, ...fl, 'format=yuv420p'].join(','), '-r', String(FPS), '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', outFile], { cwd: WORK });
  if (r.status !== 0) throw new Error(id + ': ' + r.stderr.slice(0, 300));
  return { id, frames: n, start, wide };
}
function renderCard(name, beats, vert, fade, outFile) {
  const d = beats * BEAT, vf = [vert ? `scale=1080:608:flags=neighbor,pad=1080:1920:0:656:color=${BG}` : 'null', ...(fade[0] ? [`fade=t=in:st=0:d=${fade[0]}`] : []), ...(fade[1] ? [`fade=t=out:st=${(d - fade[1]).toFixed(3)}:d=${fade[1]}`] : []), 'format=yuv420p'].join(',');
  const r = ff(['-loop', '1', '-framerate', String(FPS), '-t', d.toFixed(3), '-i', join(CARDS, name + '.png'), '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-crf', '14', outFile]); if (r.status !== 0) throw new Error(name + ': ' + r.stderr.slice(0, 300));
}
/* THE TIMELINES, in beats of the track (139.5 bpm): a fade only where a section changes */
const C = (id, beats, sect) => ['clip', id, beats, sect];
/* v2 (Daniel 10-24: 'more than just combat'): about 40% fights, the rest the game's verbs, set pieces, its world and its people. sect = where a fade may fall. */
const T_MAIN = [
  C('open_cistern', 8, 'open'), ['card', 'title', 8, 'title'],
  C('verb_spore', 6, 'verbs'), C('verb_comb', 8, 'verbs'), C('verb_kings', 8, 'verbs'), C('trav_ksar', 5, 'verbs'), C('verb_hoist', 10, 'verbs'), C('trav_rails', 4, 'verbs'), C('verb_barrel', 8, 'verbs'),
  ...['hero_knight', 'hero_pyro', 'hero_paladin', 'hero_ranger', 'hero_geomancer'].map(i => C(i, 5, 'fights')), C('boss_dk', 7, 'fights'),
  C('scene_secret', 12, 'world'), C('scene_map', 10, 'world'), C('scene_act', 6, 'world'),
  C('scene_tavern', 8, 'people'), C('scene_roster', 8, 'people'), C('scene_store', 6, 'people'), C('coop_spore', 8, 'people'),
  C('boss_duneworm', 6, 'finale'), C('boss_colossus', 6, 'finale'), C('final_queen', 12, 'finale'), ['card', 'end', 12, 'end'],
];
const T_VERT = [C('open_cistern', 5, 'a'), C('verb_spore', 5, 'a'), C('verb_comb', 6, 'a'), C('verb_kings', 6, 'a'), C('trav_ksar', 5, 'a'), C('verb_hoist', 6, 'a'), C('hero_pyro', 5, 'a'), C('boss_duneworm', 5, 'a'), C('final_queen', 7, 'a'), ['card', 'end', 8, 'end']];
const T_DEMO = [
  ['card', 'title', 5, 'title'], C('demo_wood', 6, 'a'), C('verb_comb', 7, 'a'), C('demo_marsh', 6, 'a'), C('demo_fen', 6, 'a'), C('scene_tavern', 7, 'a'),
  C('demo_stockade', 6, 'a'), C('scene_store', 5, 'a'), C('verb_barrel', 7, 'a'), C('demo_duel', 8, 'a'), ['card', 'end-demo', 10, 'end'],
];
function cut() {
  const which = opt('which', 'main'), TL = { main: T_MAIN, vertical: T_VERT, demo: T_DEMO }[which], vert = which === 'vertical';
  const outName = { main: 'bracken-trailer-v2.mp4', vertical: 'bracken-trailer-vertical-v2.mp4', demo: 'bracken-demo-trailer-v2.mp4' }[which];
  mkdirSync(WORK, { recursive: true }); const parts = [], used = [], skipped = []; let t = 0;
  TL.forEach(([kind, id, beats, sect], i) => {
    const prev = TL[i - 1], next = TL[i + 1], fade = [!prev || prev[3] !== sect ? 0.25 : 0, !next || next[3] !== sect ? 0.25 : 0], file = join(WORK, which + '-' + String(i).padStart(2, '0') + '-' + id + '.mp4');
    try {
      if (kind === 'card') { if (!existsSync(join(CARDS, id + '.png'))) throw new Error('no card ' + id); renderCard(id, beats, vert, fade, file); used.push({ at: +t.toFixed(2), card: id, secs: +(beats * BEAT).toFixed(2) }); t += beats * BEAT; }
      else { if (!existsSync(join(CLIPS, id + '.json'))) throw new Error('no clip ' + id); const u = renderClip(id, beats, vert, fade, file), m = JSON.parse(readFileSync(join(CLIPS, id + '.json'), 'utf8'));
        used.push({ at: +t.toFixed(2), ...u, secs: +(u.frames / FPS).toFixed(2), level: m.level, hero: m.hero, seed: m.seed }); t += u.frames / FPS; }
      parts.push(file);
    } catch (e) { skipped.push(id + ': ' + String(e.message).slice(0, 120)); }
  });
  const list = join(WORK, which + '-list.txt'); writeFileSync(list, parts.map(p => "file '" + p.replace(/\\/g, '/') + "'").join('\n'));
  const dur = used.reduce((s, u) => s + u.secs, 0), mp4 = join(OUT, outName);
  const r = ff(['-f', 'concat', '-safe', '0', '-i', list, '-ss', '0', '-t', dur.toFixed(3), '-i', TRACK, '-af', `loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st=${(dur - 2.5).toFixed(2)}:d=2.5`, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', mp4]);
  if (r.status !== 0) throw new Error('mux: ' + r.stderr.slice(0, 400));
  const p = spawnSync(FFMPEG.replace(/ffmpeg(\.exe)?$/, 'ffprobe$1'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], { encoding: 'utf8' });
  console.log(outName + ' ' + (+p.stdout).toFixed(1) + ' s, ' + used.length + ' parts' + (skipped.length ? ', SKIPPED ' + skipped.join(' | ') : ''));
  writeFileSync(join(OUT, which + '-parts.json'), J({ which, bpm: BPM, parts: used, skipped }, null, 1));
}
/* a contact sheet of a clip AS CUT (the crops, the zoom, the mask): node tools/trailer.mjs preview --shots=a,b [--every=20] */
function preview() {
  mkdirSync(WORK, { recursive: true }); const want = opt('shots', 'all'), every = +opt('every', 20);
  for (const f of readdirSync(CLIPS).filter(f => f.endsWith('.json'))) { const id = f.slice(0, -5); if (want !== 'all' && !want.split(',').includes(id)) continue;
    try { const mp4 = join(WORK, 'prev-' + id + '.mp4'); renderClip(id, 999, args.includes('--vertical'), [0, 0], mp4);
      const r = ff(['-i', mp4, '-vf', 'select=not(mod(n\\,' + every + ')),scale=640:360:flags=neighbor,tile=3x3', '-frames:v', '1', join(CLIPS, id + '-prev.png')]); console.log(id + (r.status === 0 ? ' prev' : ' ' + r.stderr.slice(0, 200))); } catch (e) { console.log(id + ' ' + e.message); } }
}
function shotlist() {
  const rows = ['# trailer shot list (every clip is the bot playing the live build; v2; re-record on a newer build with: PORT=<p> node tools/trailer.mjs record --shots=<id>; scenes are scripted in tools/trailer-scenes.mjs)', '', 'shot | kind | level | hero | seed | note', '--- | --- | --- | --- | --- | ---'];
  for (const f of readdirSync(CLIPS).filter(f => f.endsWith('.json'))) { const m = JSON.parse(readFileSync(join(CLIPS, f), 'utf8')); rows.push([m.shot, m.kind, m.level || '', m.hero || '', m.seed ?? '', m.note || ''].join(' | ')); }
  for (const w of ['main', 'vertical', 'demo']) { const f = join(OUT, w + '-parts.json'); if (!existsSync(f)) continue; const m = JSON.parse(readFileSync(f, 'utf8')); rows.push('', '## ' + w + ' cut (timecode | part | secs)'); for (const u of m.parts) rows.push(u.at + ' s | ' + (u.id || 'card ' + u.card) + ' | ' + u.secs + (u.start != null ? ' | frames from ' + u.start : '')); }
  writeFileSync(join(OUT, 'shotlist-v2.md'), rows.join('\n') + '\n'); console.log('shotlist-v2.md');
}

const main = { record, sheets, preview, cards, cut, shotlist, list: () => SHOTS.forEach(s => console.log(s.id.padEnd(16), s.kind.padEnd(5), s.level.padEnd(13), s.hero.padEnd(10), s.note))   };
if (!main[cmd]) { console.error('commands: ' + Object.keys(main).join(' ') + ''); process.exit(1); }
if (process.argv[1] && /trailer.mjs$/.test(process.argv[1])) await main[cmd]();
