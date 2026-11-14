// tools/gqmusic-s23.mjs - THE GOBLIN QUEEN TOWER-TOP MUSIC WITH THE FINAL-PLATFORM STAGES ON (S2 + S3, shipped ON 11-14). NODE ONLY, no page, no browser.
//   tools/gqmusic.mjs proves the old DECK fight with S2/S3 pinned OFF (its portal-storm step); this proves what players get now:
//   wake card -> lift(1) once; the three tiers (85 / 70 / 50 pct: tell, hold, the stand-in lift) never touch the track; the ENRAGE under 25 pct (rageTell, on the platform) is the step to lift(2);
//   no portal storm exists up there; and every way out still lets it go (her death, every hero down + revive, retry / load, fight over, stage left).
//   node tools/gqmusic-s23.mjs     (tools/gqmusic.mjs runs it too)
process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const { LEVELS, T } = await imp('src/level.js'); const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js');
const { S2 } = await imp('src/gq6s2.js'); const { S3 } = await imp('src/gq6s3.js');
const HSm = await imp('src/hero-strikes.js');
const TS = 16;
console.log('flags S2 ' + S2 + ' S3 ' + S3);
ok(S2 === true && S3 === true, 'set-up: both stages are ON in this run');

const make = (opt = {}) => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, seats = opt.seats || 1;
  const st = { time: 0, lifts: [], active: true, numbers: [] };
  const mk = x => ({ x, y: 320, hp: 1e9, maxHp: 1e9, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0, hitSet: new Set(), box: null, rgArrows: [], hatchets: [], bzAxe: null });
  const heroes = Array.from({ length: seats }, (_, i) => mk(11774 + 96 * 16 + 40 * i)); let cur = heroes[0];
  const e = { t: 'gqueen', alive: true, x: 0, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99, geodeCd: 99, throneX: 0 };
  const noop = () => {}; const embers = [], tracers = [], hammers = [], stones = [];
  /* main.js gqTiles, as far as the hands use it (same mirror as tools/gq6s2.mjs) */
  const tiles = (row, x0, x1, how) => { const A = Lw.arena, keep = A.taken || (A.taken = new Map()), laid = A.laid || (A.laid = []);
    for (let x = x0; x <= x1; x++) { const i = row * W + x;
      if (how === 'drop') { if (Lw.grid[i] !== T.AIR) { if (!keep.has(i) && !laid.includes(i)) keep.set(i, Lw.grid[i]); Lw.grid[i] = T.AIR; } }
      else if (how === 'lay') { if (Lw.grid[i] === T.AIR) { Lw.grid[i] = T.ONEWAY; if (!laid.includes(i)) laid.push(i); } }
      else if (how === 'ladder') { if (Lw.grid[i] === T.AIR) { Lw.grid[i] = T.NET; if (!laid.includes(i)) laid.push(i); } }
      else if (how === 'solid') { if (Lw.grid[i] === T.AIR) { Lw.grid[i] = T.SOLID; if (!laid.includes(i)) laid.push(i); } }
      else if (how === 'unlay') { if (Lw.grid[i] === T.ONEWAY && laid.includes(i)) { Lw.grid[i] = T.AIR; laid.splice(laid.indexOf(i), 1); } }
      else if (how === 'unsolid') { if (Lw.grid[i] === T.SOLID && laid.includes(i)) { Lw.grid[i] = T.AIR; laid.splice(laid.indexOf(i), 1); } }
      else if (how === 'unladder') { if (Lw.grid[i] === T.NET && laid.includes(i)) { Lw.grid[i] = T.AIR; laid.splice(laid.indexOf(i), 1); } }
      else if (how === 'restore') { const t0 = keep.get(i); if (t0 !== undefined) { Lw.grid[i] = t0; keep.delete(i); } } } };
  const ctx = { L: Lw, TS, T, sfx: new Proxy({}, { get: () => noop }), P: () => cur, boss: () => e, bossActive: () => st.active, enemies: () => [e], props: () => [], time: () => st.time,
    number: (x, y, t) => st.numbers.push(t), burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop, players: () => heroes, attackBox: () => cur.box,
    damage: () => { if (cur.inv > 0) return false; cur.inv = 0.8; return 'hit'; }, parries: () => 0,
    hurt: (en, d) => { en.hp -= d; }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - 14, b: cur.y }),
    endFight: noop, shutWest: noop, layEscape: noop, tiles, tilesDone: noop, spawnEnt: noop, setCheckpoint: noop, flaskMax: () => 3, music: noop, lift: n => st.lifts.push(n), hint: noop,
    enterRoof: () => { Object.assign(Lw.arena, Lw.arenaRoof); }, wave: noop, ducking: () => false,
    eachHero: fn => { for (const h of heroes) { if (h.dead) continue; cur = h; fn(h); } cur = heroes[0]; }, allHeroes: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, target: () => heroes[0] };
  const H = makeGQueenHands(ctx); H.load(); H.reset();
  HSm.configure({ eachSeat: fn => { for (const h of heroes) { if (h.dead) continue; cur = h; fn(h); } cur = heroes[0]; }, hero: () => heroes[0], attackBox: () => cur.box, overlap: (a, b) => ctx.overlap(a, b), players: () => heroes,
    embers: () => embers, tracers: () => tracers, hammers: () => hammers, scythe: () => null, stones: () => stones });
  const w = { H, st, heroes, e, ctx, Lw, lo: 9, hi: -1 };
  w.step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; e.modeT -= dt; e.anim += dt; for (const h of heroes) { if (h.inv > 0) h.inv -= dt; } H.tick(e, dt);
    if (!(H.step(e, dt))) { const v = e.stage === 'roof' ? H.roofStep(e, dt) : H.mode(e, dt); if (typeof v === 'number') e.x += v * dt; else if (v !== undefined) e.vx = 0; } H.update(dt); for (const h of heroes) h.box = null;
    if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; } };
  return w;
};
/* the fight as it starts: she is on the tower top (stage roof, her 1600 hp bar), the WAKE card is running (1.6 s), the hero is on the deck */
const roof = () => { const w = make(), { e, Lw, H } = w; e.stage = 'roof'; e.phase = 3; e.maxHp = e.hp = GQ3.hp2; Object.assign(Lw.arena, Lw.arenaRoof); H.test.begin();
  const RA = Lw.arena; const cx0 = (RA.x0 + RA.x1) / 2; e.x = cx0 + 120; e.y = RA.floor; e.crownCd = 99; e.portalCd = 99; e.mode = 'wake'; e.modeT = 1.6;
  w.heroes.forEach((h, i) => { h.x = cx0 - 160 + 30 * i; h.y = RA.floor; }); const q = H.test.q4(); if (q) q.volleyCd = q.boulderCd = q.rockCd = 99; return w; };
const last = w => w.st.lifts.length ? w.st.lifts[w.st.lifts.length - 1] : undefined;
const G2 = w => w.H.gq6s2();
/* step until fn() or secs; the music level is sampled every frame */
const upTo = (w, fn, secs) => { for (let i = 0; i < 60 * secs && !fn(); i++) { w.step(1); const l = w.H.musicLevel(); if (l < w.lo) w.lo = l; if (l > w.hi) w.hi = l; } return fn(); };
const settled = w => G2(w).phase() === 'on' && w.e.mode !== 's2Hold' && w.e.mode !== 's2Tell';
/* the fight up to the final platform at level 1: every tier's tell, hold and lift */
const toFinal = w => { w.step(60 * 2); for (const k of [0.84, 0.69, 0.49]) { w.e.hp = Math.floor(w.e.maxHp * k); upTo(w, () => w.e.mode === 's2Tell', 25); upTo(w, () => settled(w), 40); } return w; };
const toRage = w => { toFinal(w); w.e.hp = Math.floor(w.e.maxHp * 0.2); upTo(w, () => w.e.mode === 'rageTell', 30); return w; };

console.log('== the roof stage lifts the track once her wake card is done (same as the deck fight)');
{ const w = roof(); ok(!!G2(w), 'set-up: the final-platform engine is built');
  w.step(60); ok(w.st.lifts.length === 0 && w.H.musicLevel() === 0, 'during the wake card (1.6 s) the track is as it was');
  w.step(60); ok(w.st.lifts.join() === '1' && w.H.musicLevel() === 1, 'the card ends, THE TOWER TOP begins: lift(1) once');
  w.step(60 * 5); ok(w.st.lifts.join() === '1', 'it is not asked for again while the fight runs'); }

console.log('== the three tiers (85 / 70 / 50 pct) never touch the track');
{ const w = roof(); w.step(60 * 2);
  for (const [k, nm] of [[0.84, 'tier 1 (85)'], [0.69, 'tier 2 (70)'], [0.49, 'tier 3, the final platform (50)']]) {
    w.e.hp = Math.floor(w.e.maxHp * k); const sawTell = upTo(w, () => w.e.mode === 's2Tell', 25);
    ok(sawTell && w.H.musicLevel() === 1, nm + ': her climb is told (s2Tell) and the track holds at level 1');
    upTo(w, () => settled(w), 40);
    ok(settled(w) && w.st.lifts.join() === '1', nm + ': hold + the stand-in lift done, she fights on it, lifts still just 1'); }
  ok(w.lo === 1 && w.hi === 1, 'the level was 1 on every frame from the card to the final platform (never 0, never 2)');
  w.e.hp = Math.floor(w.e.maxHp * 0.3); const seen = new Set(); for (let i = 0; i < 60 * 20; i++) { w.step(1); seen.add(w.e.mode); }
  ok(w.st.lifts.join() === '1' && !seen.has('stormTell') && !seen.has('stormFire'), 'from 50 to 25 pct nothing steps it up, and the old portal storm never runs up there'); }

console.log('== the final stretch (under 25 pct): the ENRAGE on the platform is the step to lift(2)');
{ const w = toFinal(roof()); w.e.hp = Math.floor(w.e.maxHp * 0.2); const lv0 = w.H.musicLevel(); const rg = upTo(w, () => w.e.mode === 'rageTell', 30);
  ok(lv0 === 1 && rg, 'under 25% on the platform: the ENRAGE is told (MY CASTLE!)');
  ok(w.st.lifts.join() === '1,2' && w.H.musicLevel() === 2, 'the enrage begins: lift(2) (x1.10, the second stinger) - the step is on her rage, not on the old storm');
  const seen = new Set(); for (let i = 0; i < 60 * 25; i++) { w.step(1); seen.add(w.e.mode); }
  ok(w.st.lifts.join() === '1,2' && w.H.musicLevel() === 2 && !seen.has('stormTell'), 'one step up, no re-fire and no drop through the rest of the fight (rockfall, mountain, boulder...): level stays 2');
  w.e.alive = false; w.step(1); ok(last(w) === 0 && w.H.musicLevel() === 0, 'she dies: lift(0)'); }

console.log('== every hero down lets it go, a revive lifts it back (co-op, at level 1 and at 2)');
for (const lvl of [1, 2]) { const w = lvl === 2 ? toRage(roof()) : toFinal(roof());
  ok(w.H.musicLevel() === lvl, 'set-up: level ' + lvl + ' on the platform');
  w.heroes[0].dead = true; w.step(1); ok(last(w) === 0, 'level ' + lvl + ': the player dies: lift(0)');
  w.step(30); ok(w.H.musicLevel() === 0, 'and it stays down while he is');
  w.heroes[0].dead = false; w.step(1); ok(last(w) === lvl && w.H.musicLevel() === lvl, 'a revive in the same stage lifts it back to ' + lvl); }

console.log('== a death / retry (H.reset) and a level load (H.load) let it go, at level 1 and at 2, on the platform');
for (const lvl of [1, 2]) for (const way of ['reset', 'load']) {
  const w = lvl === 2 ? toRage(roof()) : toFinal(roof());
  ok(w.H.musicLevel() === lvl, 'set-up: at level ' + lvl);
  w.H[way](); ok(last(w) === 0 && w.H.musicLevel() === 0, 'H.' + way + '() at level ' + lvl + ': lift(0)'); }

console.log('== the fight ended / the stage left, from the final platform');
{ const w = toRage(roof()); w.st.active = false; w.step(1); ok(last(w) === 0, 'the fight ends (bossActive false): lift(0)');
  const v = toRage(roof()); v.e.stage = 'escape'; v.step(1); ok(last(v) === 0, 'she leaves the roof stage (escape): lift(0)'); }
console.log(fails ? '\n' + fails + ' FAIL' : '\nall ok');
process.exit(fails ? 1 : 0);
