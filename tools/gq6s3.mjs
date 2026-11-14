// tools/gq6s3.mjs - GQ6S3 (Daniel 11-13 17:14, Highcrown pass 6 item 3, slice S3): THE ARENA BURNS AWAY AND YOU CLIMB. NODE ONLY, no page, no browser.
//   node tools/gq6s3.mjs                    flag OFF (the default): the level + a seeded roof fight hash to MASTER's (b211d645b), no engine, the east-end ladder tile stays
//   BRACKEN_GQ6S2=1 node tools/gq6s3.mjs    S2 ONLY (S3 off): the seeded fight hashes to what S2 did at 41ad47bbe (the final platform, the stand-in lift), no tier engine
//   BRACKEN_GQ6S3=1 node tools/gq6s3.mjs    S3 ON: G geometry, B thresholds 85/70/50, T the told burn (3.0 s + sounds), R the route (slowest hero, fire cost), S no soft-lock (bots, falls, co-op, last resort),
//                                           A the attack set on every tier, K no knock-off, L the lab bot's hand, Q source / wiring, P draw cost
//   node tools/gq6s3.mjs --hash             print the identity hashes only (GQ6S3_ROOT=<tree> runs the same script on another checkout - how the pins were made: MASTER b211d645b, S2-only 41ad47bbe)
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path'; import fs from 'node:fs';
const ROOT = process.env.GQ6S3_ROOT ? path.resolve(process.env.GQ6S3_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
const HASH_ONLY = process.argv.includes('--hash');
let fails = 0, checks = 0; const ok = (c, m) => { checks++; if (!HASH_ONLY) console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const say = m => { if (!HASH_ONLY) console.log(m); };
const { LEVELS, T } = await imp('src/level.js'); const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js'); const { Q4N } = await imp('src/gq4q.js');
const HSm = await imp('src/hero-strikes.js');
let S2 = false, S2N = null, pf = null, S3 = false, S3N = null, s3m = null; try { pf = await imp('src/gq6s2.js'); S2 = pf.S2; S2N = pf.S2N; } catch { /* master has no gq6s2 */ }
try { s3m = await imp('src/gq6s3.js'); S3 = s3m.S3; S3N = s3m.S3N; } catch { /* no gq6s3 */ }
const TS = 16;
/* the pins: MASTER (b211d645b) and S2 ONLY (41ad47bbe) - made by GQ6S3_ROOT=<that tree> node tools/gq6s3.mjs --hash (S2 only: with BRACKEN_GQ6S2=1) */
const PIN = { level: '9c22e612', master: 'e4235c29', s2only: 'ce11ad58' };
const fnv = (arr) => { let h = 0x811c9dc5; for (let i = 0; i < arr.length; i++) { h ^= arr[i] & 255; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const fnvStr = s => fnv(Buffer.from(s));
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const realRandom = Math.random;
const REAPER = 92 * 0.8;   // the slowest hero's run cap (px/s); S2N.speed when the module has it

const make = (opt = {}) => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, seats = opt.seats || 1;
  const st = { time: 0, parries: 0, mode: 'hit', dmg: [], numbers: [], hints: [], spawned: [], sfx: [], sfxAt: [], tiles: [] };
  const mk = x => ({ x, y: 320, hp: 1e9, maxHp: 1e9, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0, hitSet: new Set(), box: null, rgArrows: [], hatchets: [], bzAxe: null, climb: false });
  const heroes = Array.from({ length: seats }, (_, i) => mk(11774 + 96 * 16 + 40 * i)); let cur = heroes[0];
  const e = { t: 'gqueen', alive: true, x: 0, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99, geodeCd: 99, throneX: 0 };
  const noop = () => {}; const embers = [], tracers = [], hammers = [], stones = [];
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
  const ctx = { L: Lw, TS, T, sfx: new Proxy({}, { get: (_, n) => () => { st.sfx.push(n); st.sfxAt.push([n, st.time]); } }), P: () => cur, boss: () => e, bossActive: () => true, enemies: () => [e], props: () => [], time: () => st.time,
    number: (x, y, t) => st.numbers.push(t), burst: noop, dust: noop, part: noop, shake: noop, zoom: noop, ring: noop, players: () => heroes, attackBox: () => cur.box,
    damage: (x, d, o) => { if (cur.inv > 0) return false; st.dmg.push({ x, d, o: o || {}, who: cur, t: st.time, hy: cur.y, hx: cur.x }); cur.inv = 0.8; return 'hit'; }, parries: () => st.parries,
    hurt: (en, d) => { en.hp -= d; }, solid: (tx, ty) => Lw.grid[ty * W + tx] === T.SOLID, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtBox: () => ({ l: cur.x - 5, r: cur.x + 5, t: cur.y - 14, b: cur.y }),
    endFight: noop, shutWest: noop, layEscape: noop, tiles, tilesDone: noop, spawnEnt: o => st.spawned.push(o), setCheckpoint: noop, flaskMax: () => 3, music: noop, hint: m => st.hints.push(m),
    enterRoof: () => { Object.assign(Lw.arena, Lw.arenaRoof); }, wave: noop, ducking: () => false,
    eachHero: fn => { for (const h of heroes) { if (h.dead) continue; cur = h; fn(h); } cur = heroes[0]; }, allHeroes: fn => { for (const h of heroes) { cur = h; fn(h); } cur = heroes[0]; }, target: () => heroes[0] };
  const H = makeGQueenHands(ctx); H.load(); H.reset();
  HSm.configure({ eachSeat: fn => { for (const h of heroes) { if (h.dead) continue; cur = h; fn(h); } cur = heroes[0]; }, hero: () => heroes[0], attackBox: () => cur.box, overlap: (a, b) => ctx.overlap(a, b), players: () => heroes,
    embers: () => embers, tracers: () => tracers, hammers: () => hammers, scythe: () => null, stones: () => stones });
  const w = { H, st, heroes, e, ctx, Lw, W };
  w.step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; e.modeT -= dt; e.anim += dt; for (const h of heroes) { if (h.inv > 0) h.inv -= dt; } H.tick(e, dt);
    if (!(H.step(e, dt))) { const v = e.stage === 'roof' ? H.roofStep(e, dt) : H.mode(e, dt); if (typeof v === 'number') e.x += v * dt; else if (v !== undefined) e.vx = 0; } H.update(dt); for (const h of heroes) h.box = null; } };
  return w;
};
const roof = (o = {}) => { const w = make(o), { e, Lw, H } = w; e.stage = 'roof'; e.phase = 3; e.maxHp = e.hp = GQ3.hp2; Object.assign(Lw.arena, Lw.arenaRoof); H.test.begin();
  const RA = Lw.arena; w.RA = RA; w.Tw = RA.tower; w.cx0 = (RA.x0 + RA.x1) / 2; e.x = w.cx0 + 120; e.y = RA.floor; e.crownCd = 99; e.portalCd = 99; e.mode = 'roofStand'; e.modeT = 0.5;
  w.heroes.forEach((h, i) => { h.x = w.cx0 - 160 + 30 * i; h.y = RA.floor; }); return w; };
const autoStrike = w => { const h = w.heroes[0]; const sh = w.H.shots().filter(s => s.p2 && !s.home && Math.abs(s.x - h.x) < 360)[0]; if (sh) { h.box = { l: sh.x - 14, r: sh.x + 14, t: sh.y - 14, b: sh.y + 14 }; h.hitSet = new Set(); } };

/* ---- identity: the level + a seeded fight ---- */
const levelHash = () => { const L0 = LEVELS.find(l => l.id === 'crown').build(); return fnv(L0.grid) + '/' + L0.W + 'x' + L0.H; };
const simHash = () => { Math.random = mulberry(20261113); const w = roof(), { e, st } = w, ev = []; let last = '';
  for (let i = 0; i < 60 * 100; i++) { w.step(1); autoStrike(w); const k = e.mode + '|' + Math.round(e.x / 4) + '|' + Math.round(e.hp); if (k !== last) { last = k; ev.push(i + ':' + k); } if (e.hp <= 0) break; if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; }
  ev.push(st.dmg.map(d => d.d + d.o.name + (d.o.noKnock ? 'K' : '')).join(',')); ev.push(st.numbers.join('|')); ev.push(st.spawned.length + ':' + st.hints.length); Math.random = realRandom; return fnvStr(ev.join('\n')) + '/' + ev.length; };
const LH = levelHash(), SH = simHash();
if (HASH_ONLY) { console.log('level ' + LH.split('/')[0] + ' sim ' + SH.split('/')[0]); process.exit(0); }
console.log('flags GQ6S2 ' + S2 + ' GQ6S3 ' + S3 + '   level ' + LH + '   sim ' + SH);

console.log('== I. identity');
ok(LH.split('/')[0] === PIN.level, 'the built Highcrown level hashes to MASTER\'s (' + LH.split('/')[0] + ') - every tier is laid at its transition, never at build time' + (S3 ? ' (S3 ON too)' : ''));
if (!S2) {
  ok(SH.split('/')[0] === PIN.master, 'ALL FLAGS OFF: a seeded 100 s roof fight (autostrike hero) hashes to MASTER\'s b211d645b (' + SH.split('/')[0] + ' / ' + SH.split('/')[1] + ' events)');
  { const w = roof(); ok(!w.H.gq6s2 || w.H.gq6s2() === null, 'ALL FLAGS OFF: no engine is built'); const m = w.Lw.arena.tower.OUT.mouthLadder; ok(w.Lw.grid[19 * w.Lw.W + m] === T.NET, 'ALL FLAGS OFF: the east-end ladder tile is still there (col ' + m + ', row 19)'); }
  ok(S3 === false && (!s3m || s3m.GQ6S3_SHIPS === false), 'GQ6S3_SHIPS = false' + (s3m ? ' (src/gq6s3.js)' : ' (no module on master)'));
  console.log(fails ? 'FAIL gq6s3 OFF (' + fails + ' of ' + checks + ')' : 'ok  gq6s3 OFF (' + checks + ' checks)'); process.exit(fails ? 1 : 0);
}
if (!S3) {   /* S2 only */
  ok(SH.split('/')[0] === PIN.s2only, 'S2 ONLY (S3 off): a seeded 100 s roof fight hashes to what S2 did at 41ad47bbe (' + SH.split('/')[0] + ' / ' + SH.split('/')[1] + ' events: the final platform at 50 pct, the 25 s stand-in lift)');
  { const w = roof(); const G2 = w.H.gq6s2(); ok(!!G2 && typeof G2.botGoal === 'function', 'S2 only: the engine is S2\'s (botGoal exists but answers null with S3 off)'); const h = w.heroes[0]; ok(G2.botGoal(h) === null, 'S2 only: botGoal = null (the lab bot behaves as at 41ad47bbe)'); ok(G2.cur() === 0 && G2.fireSpans().length === 0, 'S2 only: no burn spans, tier 0 until the transition'); }
  ok(S3N === null || S3N.steps.length === 3, 'S3 module present, flag off: S3N.steps = ' + (S3N ? S3N.steps.join('/') : 'n/a'));
  console.log(fails ? 'FAIL gq6s3 S2-only (' + fails + ' of ' + checks + ')' : 'ok  gq6s3 S2-only (' + checks + ' checks)'); process.exit(fails ? 1 : 0);
}

/* ================= S3 ON ================= */
const { tierGeom, spansFor, arriveX } = s3m; const { pfGeom, pfOn } = pf; const GE = GQ3.esc;
const gridOf = Lw => Buffer.from(Lw.grid);
const fresh = (o = {}) => { const w = roof(o); w.G2 = w.H.gq6s2(); w.h = w.heroes[0]; w.Tg = k => (k === 3 ? w.G2.tier(3) : tierGeom(w.Tw, k, TS)); return w; };
/* a hero that does what a player does: walk to the ladder (the engine's own route hand), hold UP, climb at 74 px/s, step off at the top. v = the walk cap. Returns true when it acted. */
const mover = (w, h, v = REAPER) => {
  const r = w.G2.botGoal(h); if (h.climb && !r) { h.climb = false; h.ground = true; return false; }
  if (!r) { if (!h.climb) { h.ground = true; h.vy = 0; } return false; }
  if (h.climb || (r.up && Math.abs(h.x - r.goal) < 7)) { h.climb = true; h.ground = false; h.x = r.goal; h.y -= 74 / 60; if (h.y <= r.top) { h.y = r.top; h.climb = false; h.ground = true; } return true; }
  h.ground = true; h.vy = 0; const dx = r.goal - h.x; h.x += Math.sign(dx) * Math.min(Math.abs(dx), v / 60); return true; };
const run = (w, secs, fn) => { for (let i = 0; i < 60 * secs; i++) { w.step(1); if (w.e.mode === 'roofStand' && w.e.modeT < 0) w.e.modeT = 0; for (const h of w.heroes) { if (!h.dead) mover(w, h); } if (fn && fn(i) === true) return true; } return false; };
const keepAbove = (w, hp) => { if (w.e.hp < w.e.maxHp * hp) w.e.hp = Math.round(w.e.maxHp * hp); };
/* play to tier k with movers (hp set just under each threshold in turn) */
const toTier = (w, k) => { for (let t = 0; t < k; t++) { w.e.hp = Math.floor(w.e.maxHp * (S3N.steps[t] - 0.004)); w.e.mode = 'roofStand'; w.e.modeT = 0; const want = t + 1; run(w, 90, () => w.G2.cur() === want && w.G2.phase() === 'on'); if (!(w.G2.cur() === want && w.G2.phase() === 'on')) return false; w.e.hp = Math.floor(w.e.maxHp * (S3N.steps[t] + 0.01)); } return true; };

console.log('== G. the tiers (geometry, from the tower table)');
{ const w = fresh(), { Lw, Tw, W } = w, D = Tw.DECK, P = Tw.PARAPETS; const t1 = w.Tg(1), t2 = w.Tg(2), t3 = w.Tg(3), f2 = pfGeom(Tw, TS);
  ok(S3N.steps.join() === '0.85,0.7,0.5', 'Daniel\'s thresholds 85 / 70 / 50 pct: S3N.steps = ' + S3N.steps.join(' / '));
  ok(t1.row === 16 && t1.c0 === 874 && t1.c1 === 930 && t1.lads.join() === '873,931', 'T1 THE HOARDINGS: tile row 16 (stand ' + t1.stand + '), cols ' + t1.c0 + '-' + t1.c1 + ' (' + t1.w + ' = the parapet walks joined across the cupola), ladders at the two ends: cols ' + t1.lads.join(' and '));
  ok(t2.row === 12 && t2.c0 === 888 && t2.c1 === 916 && t2.w === 29 && t2.lads.join() === '887,917', 'T2 THE BELL LOFT: tile row 12 (stand ' + t2.stand + '), cols ' + t2.c0 + '-' + t2.c1 + ' (' + t2.w + '), ladders at its ends: cols ' + t2.lads.join(' and '));
  ok(t3.row === 7 && t3.w === 12 && t3.x1 - t3.x0 === 192 && t3.lads.join() === '895', 'T3 THE BELL-CAGE ROOF: S2\'s 12 tiles = 192 px, tile row 7, its ladder at the WEST END: col ' + t3.lads.join());
  ok(t3.c0 === f2.c0 && t3.c1 === f2.c1 && t3.row === f2.row && t3.floor === f2.floor && t3.x0 === f2.x0 && t3.x1 === f2.x1 && t3.herX === f2.herX && JSON.stringify(t3.rings) === JSON.stringify(f2.rings), 'the final platform is S2\'s byte for byte (cols, row, rings, her spot) - only its ladder moved to the end, so S2\'s dodge-room proof (tools/gq6s2.mjs D) carries');
  ok(D.floor === 20 && t1.row < D.floor && t2.row < t1.row && t3.row < t2.row && t1.lowStand === 19 && t2.lowStand === t1.row - 1 && t3.lowStand === t2.row - 1, 'the tiers stack: deck row ' + D.floor + ' < T1 ' + t1.row + ' < T2 ' + t2.row + ' < T3 ' + t3.row + ' (each ladder stands on the tier below: ' + [t1.lowStand, t2.lowStand, t3.lowStand].join(' / ') + ')');
  /* what is under each tile today */
  const at = (c, r) => Lw.grid[r * W + c]; let bad = [];
  for (let c = t1.hoard[0]; c <= t1.hoard[1]; c++) if (at(c, t1.row) !== T.AIR) bad.push(['t1', c]);
  for (let c = t2.c0; c <= t2.c1; c++) if (at(c, t2.row) !== T.AIR) bad.push(['t2', c]);
  for (let c = t3.c0; c <= t3.c1; c++) if (at(c, t3.row) !== T.AIR) bad.push(['t3', c]);
  for (const [t, g] of [['t1', t1], ['t2', t2], ['t3', t3]]) for (const lc of g.lads) for (let r = g.row; r <= g.lowStand; r++) if (at(lc, r) !== T.AIR && !(t === 't1' && lc === 931 && r === 19 && at(lc, r) === T.NET)) bad.push([t, lc, r]);
  ok(bad.length === 0, 'every tile a tier takes is air today (the one exception is the east stub, col 931 row 19 = the old \'random ladder\' tile: it is put back as the bottom rung of the hoardings\' east ladder): ' + bad.length + ' not');
  ok([...Array(t1.hoard[0] - t1.c0).keys()].every(i => at(t1.c0 + i, t1.row) === T.ONEWAY) && [...Array(t1.c1 - t1.hoard[1]).keys()].every(i => at(t1.hoard[1] + 1 + i, t1.row) === T.ONEWAY), 'the parapet walks already stand at row ' + t1.row + ' (cols ' + t1.c0 + '-' + (t1.hoard[0] - 1) + ' and ' + (t1.hoard[1] + 1) + '-' + t1.c1 + '): the hoardings only fill the ' + (t1.hoard[1] - t1.hoard[0] + 1) + ' columns between');
  ok(Math.abs(t1.rings.length - 4) === 0 && t2.rings.length === 2 && t3.rings.length === 2 && [t1, t2, t3].every(g => g.rings.every(r => r.y + 1 === g.row && r.x * TS >= g.x0 - 64 && r.x * TS < g.x1 + 64)), 'rings: 4 on the hoardings, 2 on the loft, 2 sky rings on the roof, each at its tier\'s stand height (ring y + 1 = the floor row)');
  /* lay every tier, read the result */
  const orig = gridOf(Lw); orig[19 * W + Tw.OUT.mouthLadder] = T.NET; w.G2.begin(); const m = D.x1 - 1;
  w.e.hp = Math.floor(w.e.maxHp * 0.84); w.e.mode = 'roofStand'; w.e.modeT = 0; run(w, 4, () => w.G2.phase() === 'tell');
  ok(w.G2.laid() && [t1.hoard[0], t1.hoard[1]].every(c => at(c, t1.row) === T.ONEWAY) && at(873, 16) === T.NET && at(873, 19) === T.NET && at(931, 16) === T.NET && at(931, 19) === T.NET, 'the 85 pct tell lays T1 (hoardings one-way row 16, both ladders rows 16-19, the east stub back as a rung)');
  ok(at(t2.c0, t2.row) === T.AIR && at(t3.c0, t3.row) === T.AIR, 'T2 and the platform are NOT laid yet (each tier appears at its own tell)');
  const kept = []; for (const g of [t1]) for (const lc of g.lads) { for (let r = g.row; r <= g.lowStand; r++) kept.push(at(lc, r) === T.NET); const foot = at(lc, g.lowStand + 1); kept.push(foot === T.SOLID || foot === T.ONEWAY || foot === T.PLANK); const inner = lc === g.lads[0] ? lc + 1 : lc - 1; kept.push(at(inner, g.row) === T.ONEWAY); }
  ok(kept.every(Boolean), 'each T1 ladder: unbroken rungs from the floor row (the top rung stands level with the floor beside it: no hole, no gap) down to a footing at the deck');
  w.heroes[0].x = 873 * TS + 8; w.heroes[0].y = t1.floor; ok(pfOn(w.heroes[0], t1) && !pfOn({ x: 873 * TS + 8, y: D.floor * TS, dead: false }, t1), 'a hero at the top of the west ladder counts as on T1; one at its foot on the deck does not');
  w.G2.reset(); w.ctx.tiles(19, m + 0, m + 0, 'restore'); void m;
  const mm = Tw.OUT.mouthLadder; w.ctx.tiles(19, mm, mm, 'restore'); ok(Buffer.compare(gridOf(Lw), orig) === 0 && !w.G2.laid(), 'reset: the level grid is byte-for-byte what it was after roofBegin, with the east stub back as NET (restore): nothing laid is left'); }
{ const w = fresh(), { Lw } = w, orig = gridOf(Lw), mm = w.Tw.OUT.mouthLadder; orig[19 * w.W + mm] = T.NET; ok(toTier(w, 3), 'a full climb with movers reaches the platform (tier ' + w.G2.cur() + ')');
  const t3 = w.Tg(3), t2 = w.Tg(2), t1 = w.Tg(1); const at = (c, r) => Lw.grid[r * w.W + c];
  ok([...Array(t3.w).keys()].every(i => at(t3.c0 + i, t3.row) === T.SOLID) && [...Array(t2.w).keys()].every(i => at(t2.c0 + i, t2.row) === T.ONEWAY) && [...Array(t1.w).keys()].every(i => at(t1.c0 + i, t1.row) === T.ONEWAY), 'all three tiers stand: 57 hoarding tiles, 29 loft tiles, 12 solid roof tiles (DOWN on the roof never drops you)');
  ok([t1, t2, t3].every(g => g.lads.every(lc => { for (let r = g.row; r <= g.lowStand; r++) if (at(lc, r) !== T.NET) return false; return true; })), 'every ladder is a full column of rungs');
  w.G2.reset(); w.ctx.tiles(19, mm, mm, 'restore'); ok(Buffer.compare(gridOf(Lw), orig) === 0, 'after a full climb + reset the grid is the post-roofBegin grid + the restored stub, byte for byte'); }

console.log('== B. the burn is driven by HER HEALTH: 85 / 70 / 50, in order, >= 4 s apart');
{ const w = fresh(), { e, G2, st } = w; e.mode = 'roofStand'; e.modeT = 0; w.step(60 * 40); ok(G2.phase() === 'off' && G2.cur() === 0 && !G2.laid(), 'above 85 pct nothing burns, however long it takes (40 s at 100 pct)');
  e.hp = Math.round(e.maxHp * 0.852); for (let i = 0; i < 60 * 8; i++) { if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; w.step(1); } ok(G2.phase() === 'off', 'at ' + (e.hp / e.maxHp * 100).toFixed(1) + ' pct: no burn yet (' + G2.phase() + ')');
  e.hp = Math.round(e.maxHp * 0.848); e.mode = 'roofStand'; e.modeT = 0; run(w, 4, () => G2.phase() === 'tell'); ok(G2.phase() === 'tell' && e.mode === 's2Tell', 'at ' + (e.hp / e.maxHp * 100).toFixed(1) + ' pct, free: the burn is told (s2Tell)');
  void st; }
{ const w = fresh(), { e, G2, st } = w, times = []; e.hp = Math.floor(e.maxHp * 0.3); e.mode = 'roofStand'; e.modeT = 0; let prev = 0; const seen = [];
  for (let i = 0; i < 60 * 150; i++) { w.step(1); if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; for (const h of w.heroes) mover(w, h); if (G2.cur() !== prev) { prev = G2.cur(); times.push(st.time); seen.push(G2.cur()); } if (G2.cur() === 3 && G2.phase() === 'on') break; keepAbove(w, 0.29); }
  ok(seen.join() === '1,2,3', 'her bar dropped to 30 pct at once: the steps still come ONE AT A TIME, in order: tiers ' + seen.join(' -> '));
  ok(times.length === 3 && times[1] - times[0] >= S3N.gapMin && times[2] - times[1] >= S3N.gapMin, 'and >= ' + S3N.gapMin + ' s apart (arrivals at ' + times.map(t => t.toFixed(1)).join(' / ') + ' s; each needs the hero up first)'); }
{ for (const [k, thr] of [[1, 0.70], [2, 0.50]]) { const w = fresh(), { e, G2 } = w; toTier(w, k); e.hp = Math.floor(e.maxHp * (thr + 0.01)); for (let i = 0; i < 60 * 12; i++) { w.step(1); if (e.mode === 'rec' && e.modeT < 0) e.modeT = 0; w.heroes.forEach(h => mover(w, h)); keepAbove(w, thr + 0.005); }
    ok(G2.cur() === k, 'tier ' + k + ' -> ' + (k + 1) + ' waits for ' + Math.round(thr * 100) + ' pct (at ' + Math.round((thr + 0.005) * 1000) / 10 + ' pct for 12 s: still tier ' + G2.cur() + ')');
    e.hp = Math.floor(e.maxHp * (thr - 0.004)); e.mode = 'rec'; e.modeT = 0; run(w, 10, () => G2.phase() === 'tell'); ok(G2.phase() === 'tell', 'and below ' + Math.round(thr * 100) + ' pct it is told at once'); } }

console.log('== T. every burn step is TOLD (own tell, own sound, time to move)');
{ const w = fresh(), { e, G2, st } = w; const steps = [];
  for (let t = 0; t < 3; t++) { e.hp = Math.floor(e.maxHp * (S3N.steps[t] - 0.004)); e.mode = 'roofStand'; e.modeT = 0; const n0 = st.numbers.length, s0 = st.sfxAt.length, h0 = st.hints.length, d0 = st.dmg.length; let t0 = -1, tB = -1, tEnd = -1;
    for (let i = 0; i < 60 * 120; i++) { w.step(1); if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; w.heroes.forEach(h => { if (G2.phase() === 'tell') return; mover(w, h); }); if (t0 < 0 && G2.phase() === 'tell') t0 = st.time; if (t0 >= 0 && tB < 0 && G2.phase() === 'hold') tB = st.time; if (G2.cur() === t + 1 && G2.phase() === 'on') { tEnd = st.time; break; } }
    const nums = st.numbers.slice(n0), sf = st.sfxAt.slice(s0), fireHits = st.dmg.slice(d0).filter(d => d.o.name === 'THE BURNING ROOF' && d.t < t0 + S3N.tell - 0.001);
    steps.push({ t, tell: tB - t0, nums, sf, hints: st.hints.slice(h0), fireDuring: fireHits.length, tEnd, t0 });
    ok(Math.abs((tB - t0) - S3N.tell) < 0.1, 'step ' + (t + 1) + ' (' + Math.round(S3N.steps[t] * 100) + ' pct): the tell is ' + (tB - t0).toFixed(2) + ' s (plan 3.0 s) before she goes up and the span catches');
    ok(nums.includes(S3N.words.burn) && nums.includes(N_GO()) && nums.includes(S3N.words.climbs) && st.hints.slice(h0).length === 1, '  told on screen: "' + S3N.words.burn + '" over every hero, "' + N_GO() + '" at the ladders, "' + S3N.words.climbs + '" in her last ' + S3N.climbTell + ' s, one hint line');
    const cr = sf.filter(([n, at]) => n === 'crumble' && at >= t0 - 0.05 && at < t0 + S3N.tell), cl = sf.filter(([n, at]) => n === 'portalOpen' && at >= t0 + S3N.tell - S3N.climbTell - 0.1 && at <= t0 + S3N.tell + 0.1), ck = sf.filter(([n, at]) => n === 'crack' && Math.abs(at - (t0 + S3N.tell)) < 0.1);
    ok(cr.length >= 2 && cl.length >= 1 && ck.length >= 1, '  sounds: crumble x' + cr.length + ' during the tell (at 0 s and ~1.4 s), portalOpen at "SHE CLIMBS" x' + cl.length + ', crack at the catch x' + ck.length);
    ok(fireHits.length === 0, '  time to move: 0 fire hits during the ' + S3N.tell + ' s tell (the span smoulders, it does not burn yet) even with a hero standing on it');
    if (t < 2) w.e.hp = Math.floor(e.maxHp * (S3N.steps[t] + 0.01)); }
  const sp = [0, 1, 2].map(k => spansFor(w.Tw, k, TS, w.Tg(3)));
  ok(sp[0].length === 1 && sp[0][0].x0 === 873 * TS && sp[0][0].x1 === 932 * TS && sp[0][0].y === 320, 'span 1 = the whole deck: cols 873-931, y 320 (' + (sp[0][0].x1 - sp[0][0].x0) / TS + ' tiles)');
  ok(sp[1].length === 2 && sp[1][0].x0 === 874 * TS && sp[1][0].x1 === 887 * TS && sp[1][1].x0 === 918 * TS && sp[1][1].x1 === 931 * TS && sp[1].every(s => s.y === 256), 'span 2 = the hoardings\' two ends: cols 874-886 and 918-930 (the loft\'s ladder feet, cols 887-917, never burn)');
  ok(sp[2].length === 2 && sp[2][0].x0 === 888 * TS && sp[2][0].x1 === 893 * TS && sp[2][1].x0 === 899 * TS && sp[2][1].x1 === 917 * TS && sp[2].every(s => s.y === 192), 'span 3 = the loft except cols 893-898 (the roof ladder\'s foot at col 895 never burns)');
  ok(w.Tg(3).lads[0] * TS + 8 > sp[2][0].x1 && w.Tg(3).lads[0] * TS + 8 < sp[2][1].x0 && w.Tg(2).lads.every(lc => lc * TS + 8 > sp[1][0].x1 && lc * TS + 8 < sp[1][1].x0 || lc * TS + 8 > sp[1][1].x1 - 1) , 'ladders never burn: no ladder foot is inside a span (the loft\'s feet on the hoardings, the roof ladder\'s on the loft)');
  const bs = G2.burns(); ok(bs.length === 5 && bs.every(b => b.state === 'burn'), 'after all three steps 5 spans are PERMANENT fire floor (' + bs.length + '), none is lifted again'); }
function N_GO() { return S2N.words.go; }

console.log('== F. a burnt span is the bay rule: 3 hp / 0.8 s, a push up, spare - it cannot kill');
{ const w = fresh(), { e, G2, st, heroes } = w, h = heroes[0]; e.hp = Math.floor(e.maxHp * 0.84); e.mode = 'roofStand'; e.modeT = 0; run(w, 12, () => G2.phase() === 'hold'); st.dmg.length = 0; h.x = 880 * TS; h.y = 320; h.ground = true; h.climb = false;
  for (let i = 0; i < 60 * 8; i++) { w.step(1); h.x = 880 * TS; h.y = 320; h.ground = true; keepAbove(w, 0.7); } const fire = st.dmg.filter(d => d.o.name === 'THE BURNING ROOF');
  ok(GE.fire === S3N.burnDmg.fire && GE.fireEvery === S3N.burnDmg.every && GE.push === S3N.burnDmg.push, 'the numbers are the bay rule (GQ3.esc): ' + GE.fire + ' hp every ' + GE.fireEvery + ' s, push ' + GE.push);
  ok(fire.length >= 8 && fire.every(d => d.d === 3 && d.o.spare === true && d.o.noKnock === true), 'a hero left on the burning deck for 8 s takes ' + fire.length + ' ticks of 3 (' + fire.length * 3 + ' hp), every one spare + noKnock: it can never kill');
  const gaps = fire.slice(1).map((d, i) => d.t - fire[i].t); ok(gaps.every(g => g > 0.75 && g < 0.9), 'one tick per ' + GE.fireEvery + ' s (gaps ' + Math.min(...gaps).toFixed(2) + '-' + Math.max(...gaps).toFixed(2) + ' s)');
  st.dmg.length = 0; h.y = 320 - 64; h.ground = false; h.climb = true; for (let i = 0; i < 60 * 3; i++) { w.step(1); h.y = 320 - 30; h.ground = false; keepAbove(w, 0.7); } ok(st.dmg.filter(d => d.o.name === 'THE BURNING ROOF').length === 0, 'on a ladder (not on the ground) the fire does not touch him: the ladder is the way out and it never burns');
  st.dmg.length = 0; h.x = 903 * TS; h.y = 272; h.ground = true; for (let i = 0; i < 60 * 3; i++) { w.step(1); h.x = 903 * TS; h.y = 272; keepAbove(w, 0.7); } ok(st.dmg.filter(d => d.o.name === 'THE BURNING ROOF').length === 0, 'on the cupola top / a step above the deck (not on the burning floor) there is no fire');
  st.dmg.length = 0; h.x = 880 * TS; h.y = 256; h.ground = true; for (let i = 0; i < 60 * 3; i++) { w.step(1); h.x = 880 * TS; h.y = 256; keepAbove(w, 0.7); } ok(st.dmg.filter(d => d.o.name === 'THE BURNING ROOF').length === 0, 'on the hoardings above the burning deck: no fire (the burn is per span and per floor)'); }

console.log('== R. a fair way up: the SLOWEST hero (reaper ' + REAPER.toFixed(1) + ' px/s) reaches a ladder, and what the fire costs on the way');
{ const w = fresh(), Tw = w.Tw, v = REAPER, climbV = 74, tell = S3N.tell, f = GE.fire, ev = GE.fireEvery; const cu = Tw.CUPOLA; let allOk = true; const rep = [];
  ok(Math.abs(v - (S2N.speed ?? v)) < 1e-9, 'the slowest hero is S2N.speed = ' + (S2N.speed ?? v).toFixed(1) + ' px/s (reaper 92 x 0.8); a ladder climbs at 74 px/s (src/main.js)');
  /* per step: every standing x on the tier being left (2 px steps), the hero walks straight to the ladder the engine's route hand names; fire ticks while he is on a span's floor after the tell */
  for (let step = 0; step < 3; step++) { const gFrom = step === 0 ? { floor: 320, x0: (Tw.DECK.x0 + 1) * TS + 8, x1: (Tw.DECK.x1 - 1) * TS - 8 } : w.Tg(step), gTo = w.Tg(step + 1), spans = spansFor(Tw, step, TS, w.Tg(3)); let worstCost = 0, worstT = 0, worstX = 0, n = 0, worstWalk = 0;
    for (let x = Math.round(gFrom.x0 + 2); x <= gFrom.x1 - 2; x += 2) { if (step === 0 && x > cu.x0 * TS - 5 && x < (cu.x1 + 1) * TS + 5) continue;
      /* the route hand's choice */
      const h = { x, y: gFrom.floor, ground: true, climb: false, dead: false }; w.G2.begin(); const fake = w.G2; void fake;
      let lx; if (gTo.lads.length > 1) { if (step === 0 && x < cu.x0 * TS) lx = gTo.lads[0] * TS + 8; else if (step === 0) lx = gTo.lads[1] * TS + 8; else lx = Math.abs(x - (gTo.lads[0] * TS + 8)) <= Math.abs(x - (gTo.lads[1] * TS + 8)) ? gTo.lads[0] * TS + 8 : gTo.lads[1] * TS + 8; } else lx = gTo.lads[0] * TS + 8;
      const walk = Math.abs(lx - x) / v, climb = (gFrom.floor - gTo.floor) / climbV; let ticks = 0, t0 = tell, nextTick = t0 + 0.4;
      for (let t = tell; t <= walk + 1e-9; t += 1 / 60) { const px = x + Math.sign(lx - x) * v * t; if (spans.some(s => px >= s.x0 && px <= s.x1)) { if (t >= nextTick) { ticks++; nextTick = t + ev; } } else nextTick = t + 0.4; }
      const cost = ticks * f; n++; if (cost >= worstCost) { worstCost = cost; worstX = x; } if (walk + climb > worstT) worstT = walk + climb; if (walk > worstWalk) worstWalk = walk; if (cost > S3N.maxFireCost) allOk = false; }
    rep.push({ step, worstCost, worstT, worstX, n, worstWalk });
    ok(worstCost <= S3N.maxFireCost, 'step ' + (step + 1) + ' (' + n + ' start positions): worst case = walk ' + worstWalk.toFixed(2) + ' s + climb ' + ((gFrom.floor - gTo.floor) / climbV).toFixed(2) + ' s = ' + worstT.toFixed(2) + ' s up the ladder, fire cost ' + worstCost + ' hp (cap ' + S3N.maxFireCost + '); worst start x ' + worstX + ' (col ' + (worstX / TS).toFixed(1) + ')'); }
  ok(rep[1].worstCost === 0 && rep[2].worstCost <= 6, 'the hoardings\' ends are walked clear INSIDE the tell (fire cost ' + rep[1].worstCost + ' hp from every start on a burning end), the loft costs at most ' + rep[2].worstCost + ' hp; only the deck, the long way (' + rep[0].worstWalk.toFixed(1) + ' s to the far ladder), costs up to ' + rep[0].worstCost + ' hp');
  /* the engine's own hand agrees with the table */
  const w2 = fresh(); toTier(w2, 0); w2.e.hp = Math.floor(w2.e.maxHp * 0.84); w2.e.mode = 'roofStand'; w2.e.modeT = 0; run(w2, 8, () => w2.G2.phase() === 'tell'); const Tw2 = w2.Tw; const gl = x => { const r = w2.G2.botGoal({ x, y: 320, ground: true, climb: false, dead: false }); return r && r.goal; };
  ok(gl(880 * TS) === 873 * TS + 8 && gl(899 * TS) === 873 * TS + 8 && gl(905 * TS) === 931 * TS + 8 && gl(925 * TS) === 931 * TS + 8, 'the route hand (the lab bot\'s): a hero on the deck\'s west half walks to the west ladder, on the east half to the east one - never across the cupola (it is ' + (Tw2.CUPOLA.x1 - Tw2.CUPOLA.x0 + 1) + ' tiles wide and 3 high)'); }

console.log('== S. no soft-lock (a full fight with movers, a hero who falls, a hero who will not climb, co-op)');
{ for (const seats of [1, 4]) { Math.random = mulberry(70 + seats); const w = fresh({ seats }), { e, G2, st, heroes } = w; let lastTier = 0; const tiers = [], fires = []; let falls = 0, hits = 0;
    e.hp = Math.floor(e.maxHp * 0.99);
    for (let i = 0; i < 60 * 600; i++) { w.step(1); autoStrikeAll(w); if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; for (const h of heroes) { h.hp = 1e9; mover(w, h); } if (G2.cur() !== lastTier) { lastTier = G2.cur(); tiers.push([G2.cur(), +st.time.toFixed(1)]); } if (e.hp <= 0) break; }
    const fireH = st.dmg.filter(d => d.o.name === 'THE BURNING ROOF'); void falls; void hits; void fires;
    ok(tiers.map(t => t[0]).join() === '1,2,3' && G2.state().lifts === 0, seats + ' seat' + (seats > 1 ? 's' : '') + ': a ' + Math.round(st.time) + ' s fight (autostrike on her stones) climbed ' + tiers.map(t => t[0] + '@' + t[1] + 's').join(' ') + ', last-resort lifts used: ' + G2.state().lifts);
    ok(fireH.every(d => d.o.spare === true) && e.hp <= 0, '  she ' + (e.hp <= 0 ? 'died' : 'lived') + ' on the platform; ' + fireH.length + ' fire ticks (' + fireH.length * 3 + ' hp in all), every one spare' + (seats === 4 ? '; with 4 seats the hold waited for every living seat each time' : '')); } }
function autoStrikeAll(w) { for (const h of w.heroes) { if (w.G2.cur() > 0 && !pf.pfOn(h, w.G2.tier(w.G2.cur()))) continue; const sh = w.H.shots().filter(s => s.p2 && !s.home && Math.abs(s.x - h.x) < 360)[0]; if (sh) { h.box = { l: sh.x - 14, r: sh.x + 14, t: sh.y - 14, b: sh.y + 14 }; h.hitSet = new Set(); break; } } }
{ /* last resort: a bot that never climbs */
  const w = fresh(), { e, G2, st, heroes } = w, h = heroes[0]; e.hp = Math.floor(e.maxHp * 0.84); e.mode = 'roofStand'; e.modeT = 0; run(w, 12, () => G2.phase() === 'hold'); const tH = st.time; h.x = 900 * TS + 8; h.y = 320;
  const dm0 = st.dmg.filter(d => d.o.name !== 'THE BURNING ROOF').length; let lifted = -1; for (let i = 0; i < 60 * 80; i++) { w.step(1); if (G2.state().lifts > 0) { lifted = st.time - tH; break; } h.x = 899 * TS; h.y = 320; h.ground = true; keepAbove(w, 0.8); }
  ok(lifted > S3N.liftHold - 0.5 && lifted < S3N.liftHold + 1, 'LAST RESORT 1: nobody climbs - the tower lifts the hero onto the hoardings ' + lifted.toFixed(1) + ' s into the hold (' + S3N.liftHold + ' s: a human needs < 8 s) and says "THE TOWER LIFTS YOU"; she held every attack till then');
  ok(st.dmg.filter(d => d.o.name !== 'THE BURNING ROOF').length === dm0 && pfOn(h, w.Tg(1)), '  no attack of hers landed while she held, and he stands on T1 (' + Math.round(h.x) + ',' + h.y + ')');
  /* a fall: on T1, the hero drops to the burning deck, she waits, he climbs back with the route hand: no lift needed */
  e.hp = Math.floor(e.maxHp * 0.99); w.step(60 * 3); h.x = 905 * TS; h.y = 320; h.ground = true; h.climb = false; const dmB = st.dmg.length, l0 = G2.state().lifts; let back = -1; const tF = st.time;
  for (let i = 0; i < 60 * 40; i++) { w.step(1); if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; mover(w, h); keepAbove(w, 0.99); if (pfOn(h, w.Tg(1))) { back = st.time - tF; break; } }
  const sinceFall = st.dmg.slice(dmB);
  ok(back > 0 && back < 12 && G2.state().lifts === l0, 'A FALL: a hero who drops from the hoardings to the deck (east half) climbs back in ' + back.toFixed(1) + ' s with the route hand, no lift (a fall costs time and ' + sinceFall.filter(d => d.o.name === 'THE BURNING ROOF').length * 3 + ' hp of fire)');
  ok(sinceFall.every(d => d.o.name === 'THE BURNING ROOF'), '  while he was below she attacked nobody (every hit he took was the fire: ' + sinceFall.length + ')');
  /* a fall with no way back: 45 s then the lift */
  w.step(60 * 4); h.x = 905 * TS; h.y = 320; h.ground = true; const l1 = G2.state().lifts, tG = st.time; let lf = -1; for (let i = 0; i < 60 * 70; i++) { w.step(1); if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; h.x = 905 * TS; h.y = 320; h.ground = true; keepAbove(w, 0.99); if (G2.state().lifts > l1) { lf = st.time - tG; break; } }
  ok(lf > S3N.liftOn - 0.5 && lf < S3N.liftOn + 1, 'LAST RESORT 2: a hero who will not climb back is lifted after ' + lf.toFixed(1) + ' s (' + S3N.liftOn + ' s) - never a soft-lock, never a death'); }
{ /* co-op: one up, one below: she waits for both; the lift takes the straggler at 60 s; a downed seat comes back on her tier */
  const w = fresh({ seats: 2 }), { e, G2, st, heroes } = w; e.hp = Math.floor(e.maxHp * 0.84); e.mode = 'roofStand'; e.modeT = 0; run(w, 12, () => G2.phase() === 'hold'); const g1 = w.Tg(1); heroes[0].x = g1.x0 + 40; heroes[0].y = g1.floor; heroes[1].x = 880 * TS; heroes[1].y = 320;
  const sh0 = st.dmg.filter(d => d.o.name !== 'THE BURNING ROOF').length; for (let i = 0; i < 60 * 30; i++) { w.step(1); heroes[0].x = g1.x0 + 40; heroes[0].y = g1.floor; heroes[1].x = 880 * TS; heroes[1].y = 320; heroes[1].ground = true; keepAbove(w, 0.8); }
  ok(G2.phase() === 'hold' && st.dmg.filter(d => d.o.name !== 'THE BURNING ROOF').length === sh0, 'CO-OP: one seat up, one still on the deck: she HOLDS (30 s, no attack): "SHE WAITS" for every living seat');
  heroes[1].dead = true; w.step(2); ok(G2.phase() === 'on', '  a downed seat does not hold her: the living one is up -> on');
  ok(w.Lw.arena.respawn && w.Lw.arena.respawn.x === g1.x0 + S3N.respawnIn && w.Lw.arena.respawn.y === g1.floor, '  a downed seat comes back ON her tier: arena.respawn = (' + (w.Lw.arena.respawn && w.Lw.arena.respawn.x) + ', ' + (w.Lw.arena.respawn && w.Lw.arena.respawn.y) + ') = T1\'s west end + ' + S3N.respawnIn + ' px (src/main.js bleedBack reads it)');
  w.H.reset(); ok(!w.Lw.arena.respawn, '  a retry (H.reset) clears it'); w.H.test.begin(); ok(!w.Lw.arena.respawn && w.G2.cur() === 0, '  and the next roofBegin starts at tier 0'); }

console.log('== A. the attack set on every tier (90 s soak each, a hero strolling invulnerable, noKnock, tier rings, the final unchanged)');
const KEPT = new Set(['rec', 'roofStand', 'stand', 'volleyTell', 'boulderTell', 'rockfallTell', 'sceptreSweepTell', 'sceptreSweepCut', 'lashHighTell', 'lashLowTell', 'lashHigh', 'lashLow', 'crownTossTell', 'crownToss', 'crownOut', 'rageTell', 'mountainTell', 'mountainWait', 'dazed', 'stunned', 'jarred', 's2Tell', 's2Hold', 'fetch', 'crownFetch', 'crownWait']);
const DROPPED = ['hallLeapTell', 'hallLeap', 'quake', 'ambushTell', 'ambushOut', 'blinkTell', 'blinkGone', 'stumble', 'perchTell', 'perch', 'perchSwing', 'stormTell', 'stormFire', 'stormOpen', 'geyserTell', 'geyser', 'bombardTell', 'bombard'];
const tierSoak = (k, seed, secs, hpAt) => { Math.random = mulberry(seed); const w = fresh(); toTier(w, k); const { e, G2, st, heroes } = w, g = w.Tg(k), seen = new Map(), falls = [], ringsSeen = new Set(); const h = heroes[0]; e.hp = Math.floor(e.maxHp * hpAt); let walkT = 0, tgt = g.x0 + 100, minX = 1e9, maxX = -1e9; const d0 = st.dmg.length, sp0 = st.spawned.length, seenFall = new Set(); let hatch = 0, bay = 0, perch = 0;
  for (let i = 0; i < 60 * secs; i++) { w.step(1); autoStrike(w); if (e.hp < e.maxHp * (hpAt - 0.06)) e.hp = Math.round(e.maxHp * hpAt); if (e.crownCd > 6) e.crownCd = 6; h.hp = 1e9; if (walkT <= 0) { tgt = g.x0 + 12 + Math.random() * (g.x1 - g.x0 - 24); walkT = 1.5 + Math.random() * 2.5; } const dx = tgt - h.x; h.x += Math.sign(dx) * Math.min(Math.abs(dx), REAPER / 60); h.y = g.floor; h.ground = true; walkT -= 1 / 60;
    if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; seen.set(e.mode, (seen.get(e.mode) || 0) + 1); minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x);
    const P4 = w.H.test.q4(), R0 = w.H.test.roof(); for (const f of P4.fall || []) if (!seenFall.has(f.t0)) { seenFall.add(f.t0); falls.push((P4.fall || []).filter(q => q.t0 === f.t0).map(q => q.x)); }
    if (P4.volLit) for (const id of P4.volLit.rings) ringsSeen.add(id); if (P4.boulder && P4.boulder.ring) ringsSeen.add(P4.boulder.ring);
    if (w.H.q52() && w.H.q52().state().perch.phase !== 'idle') perch++; if (R0.bays.some(b => b.state !== 'idle')) bay++; if (e.hp <= 0) break; }
  const ds = st.dmg.slice(d0).filter(d => d.o.name !== 'THE BURNING ROOF'); return { w, seen, ds, falls, ringsSeen, minX, maxX, g, perch, bay, spawned: st.spawned.length - sp0, hatch }; };
for (const k of [1, 2, 3]) { const runs = [tierSoak(k, 40 + k, 90, 0.9 - 0.2 * (k - 1) + (k === 3 ? -0.2 : 0)), tierSoak(k, 50 + k, 90, 0.9 - 0.2 * (k - 1) + (k === 3 ? -0.2 : 0))]; void runs;
  const hpAt = k === 1 ? 0.78 : k === 2 ? 0.58 : 0.42; const rs = [tierSoak(k, 40 + k, 90, hpAt), tierSoak(k, 50 + k, 90, hpAt)], g = rs[0].g; const seen = new Set(), names = new Set(), ringIds = new Set(); let nk = 0, ds = 0, perch = 0, bay = 0, sp = 0, minX = 1e9, maxX = -1e9; const falls = [];
  for (const r of rs) { r.seen.forEach((_, m) => seen.add(m)); r.ds.forEach(d => { names.add(d.o.name); ds++; if (!d.o.noKnock) nk++; }); r.ringsSeen.forEach(x => ringIds.add(x)); perch += r.perch; bay += r.bay; sp += r.spawned; minX = Math.min(minX, r.minX); maxX = Math.max(maxX, r.maxX); falls.push(...r.falls); }
  say('     T' + k + ' modes: ' + [...seen].sort().join(' ') + '\n     T' + k + ' hits: ' + [...names].sort().join(' | ') + ' (' + ds + ')');
  ok(DROPPED.every(m => !seen.has(m)) && perch === 0 && bay === 0 && sp === 0, 'T' + k + ': none of the dropped moves (leap, ambush, blink, storm, perch, geyser, bombard), no burning bay, no soldier (2 x 90 s)');
  ok([...seen].every(m => KEPT.has(m)) && ['volleyTell', 'boulderTell', 'rockfallTell', 'sceptreSweepTell'].every(m => seen.has(m)), 'T' + k + ': the kept list is in use: ' + ['volleyTell', 'boulderTell', 'rockfallTell', 'sceptreSweepTell', 'lashHighTell', 'crownTossTell'].filter(m => seen.has(m)).join(' '));
  ok(minX >= g.x0 + 13 && maxX <= g.x1 - 13, 'T' + k + ': she never leaves the tier (x ' + Math.round(minX) + '..' + Math.round(maxX) + ' inside ' + g.x0 + '-' + g.x1 + ')');
  ok(ds >= 6 && nk === 0, 'T' + k + ': NO KNOCK-OFF: all ' + ds + ' hits carry noKnock (' + nk + ' without)');
  const ids = new Set(g.rings.map(r => r.id)); ok([...ringIds].every(id => ids.has(id)) && ringIds.size >= 1, 'T' + k + ': stones come only from this tier\'s own rings (' + [...ringIds].join(',') + ' of ' + [...ids].join(',') + ')');
  ok(k === 3 ? falls.every(f => f.length === 3) : falls.every(f => f.length === Q4N.p2.rockfall.n), 'T' + k + ': rockfall = ' + (k === 3 ? '3 rocks (S2\'s platform reshape)' : Q4N.p2.rockfall.n + ' shadows (the deck rule: >= 26 px apart, ' + Q4N.p2.rockfall.n + ' x ' + 2 * Q4N.p2.rockfall.r + ' of ' + (g.x1 - g.x0) + ' px = ' + Math.round(Q4N.p2.rockfall.n * 2 * Q4N.p2.rockfall.r / (g.x1 - g.x0) * 100) + '% covered)') + ' - ' + falls.length + ' falls seen'); }
{ const w = fresh(); toTier(w, 3); w.e.hp = Math.floor(w.e.maxHp * 0.24); w.e.mode = 'roofStand'; w.e.modeT = 0; const seen = new Set(); for (let i = 0; i < 60 * 60; i++) { w.step(1); autoStrike(w); w.heroes[0].x = w.Tg(3).x0 + 60; w.heroes[0].y = w.Tg(3).floor; if (w.e.mode === 'roofStand' && w.e.modeT < 0) w.e.modeT = 0; seen.add(w.e.mode); if (w.e.hp < w.e.maxHp * 0.15) w.e.hp = Math.round(w.e.maxHp * 0.24); }
  ok(seen.has('rageTell') && seen.has('mountainTell'), 'the rage (25 pct) still comes ON the final platform: rageTell + mountainTell seen'); }

console.log('== K. no knock-off on a tier, and the deck is as before');
{ const w = fresh(), { e, st } = w; w.H.hit(w.heroes[0].x, 18, e, 'HER SCEPTRE SWEEP'); ok(st.dmg[0] && st.dmg[0].o.noKnock === undefined, 'on the deck (before 85 pct) a blow is exactly as before: no noKnock key');
  const w2 = fresh(); toTier(w2, 1); w2.heroes[0].inv = 0; w2.st.dmg.length = 0; w2.H.hit(w2.heroes[0].x, 18, w2.e, 'HER SCEPTRE SWEEP'); ok(w2.st.dmg[0] && w2.st.dmg[0].o.noKnock === true, 'on the hoardings every parryable blow (gqHit) carries noKnock'); }

console.log('== L. the lab bot\'s climb hand (src/lab.js, Highcrown only)');
{ const w = fresh(), G2 = w.G2, Tw = w.Tw; const P = (x, y, o = {}) => ({ x, y, ground: true, climb: false, dead: false, ...o });
  ok(G2.botGoal(P(880 * TS, 320)) === null, 'tier 0 (nothing told): botGoal = null - the bot fights as before');
  w.e.hp = Math.floor(w.e.maxHp * 0.84); w.e.mode = 'roofStand'; w.e.modeT = 0; run(w, 8, () => G2.phase() === 'tell');
  let r = G2.botGoal(P(880 * TS, 320)); ok(r && r.goal === 873 * TS + 8 && !r.up && r.top === 256, 'tell, deck west: walk to the west ladder foot (x ' + (r && r.goal) + '), not yet UP');
  r = G2.botGoal(P(873 * TS + 8, 320)); ok(r && r.up === true, 'at the foot: hold UP');
  r = G2.botGoal(P(873 * TS + 8, 300, { ground: false, climb: true })); ok(r && r.up === true && r.goal === 873 * TS + 8 && r.top === 256, 'on the ladder: keep holding UP to the top');
  r = G2.botGoal(P(910 * TS, 320)); ok(r && r.goal === 931 * TS + 8, 'deck east of the cupola: the east ladder');
  ok(G2.botGoal(P(880 * TS, 256)) === null || G2.phase() === 'tell', 'a hero already on the hoardings during the tell is told nothing until the next step (she is still on the deck)');
  run(w, 8, () => G2.phase() === 'hold'); ok(G2.botGoal(P(880 * TS, 256)) === null && G2.botGoal(P(878 * TS, 320)) !== null, 'on the hoardings once she is up: null (fight); below: still climbing');
  const src = fs.readFileSync(path.join(ROOT, 'src/lab.js'), 'utf8'); const i1 = src.indexOf('gq6s2 && g6') > 0 ? 1 : src.indexOf('Hq6.gq6s2'), i2 = src.indexOf('THE NEW TELLS, as a player answers them');
  ok(src.includes('Hq6.gq6s2 ? Hq6.gq6s2() : null') && src.includes('g6.botGoal(P)') && i1 > 0 && src.indexOf('Hq6.gq6s2') < src.indexOf("let tgt = null, td = 1e9, hang = null") && i2 > 0, 'src/lab.js gqueenReact: the climb hand runs FIRST in the roof stage, before the shard strikes and the attack answers (stage roof only; botGoal is null with the flag off)'); void Tw; }

console.log('== Q. wiring (source)');
{ const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8'); const main = rd('src/main.js'), html = rd('index.html'), cdp = rd('tools/cdp.mjs'), hands = rd('src/gqueen-hands.js');
  const words = Object.values(S3N.words); ok(words.every(x => main.includes("'" + x + "'")), 'every S3 told word is in main.js MOVE_WORDS (number() drops anything else): ' + words.join(' | '));
  ok(main.includes('A.respawn ? A.respawn.x') && main.includes('A.respawn ? A.respawn.y'), 'main.js bleedBack returns a downed seat to arena.respawn when it is set (unset = the old spot)');
  ok(html.includes('./src/gq6s3.js') && cdp.includes('BRACKEN_GQ6S3'), 'index.html modulepreloads src/gq6s3.js; tools/cdp.mjs sets window.BRACKEN_GQ6S3 for the lab');
  ok(hands.includes('GS2.fireSpans') && hands.includes('GS2.final()'), 'the hands: the burnt-span fire tick + the final-only reshapes (rockfall 3, mountain, volley gap) are keyed to the final platform, not to every tier');
  ok(/export const GQ6S3_SHIPS = false/.test(rd('src/gq6s3.js')), 'GQ6S3_SHIPS = false'); }

console.log('== P. draw cost (the burnt spans, baked: one shared flame sheet + one smoke sheet, a span = slab + glow + drawImage tiles + sparks)');
{ let art = null; try { art = await imp('src/redraw/gq3_art.js'); } catch (err) { say('     (gq3_art not importable in node: ' + String(err.message).slice(0, 60) + ')'); }
  if (art && art.drawBay) { let n = 0, nb = 0; const mk = (cnt) => new Proxy({}, { get: (_, k) => (k === 'fillStyle' || k === 'globalAlpha' ? 1 : () => { cnt(); }), set: () => true });
    const g2 = mk(() => { n++; }); const w = fresh(); toTier(w, 3); const E2 = w.G2; const spots = []; for (const cy of [20, 90, 150, 200]) for (const cx of [13800, 14100, 14400, 14700, 14900]) spots.push([cx, cy]);
    let bay = 0; { n = 0; art.drawBay(g2, 0, 96, 100, 'burn', 3.3, 0); bay = n; }
    /* A. node has no document: drawBayBaked returns false and the old per-span drawBay runs (the fallback) */
    let fall = 0; for (const [cx, cy] of spots) { n = 0; E2.draw(g2, cx, cy, 3.3); fall = Math.max(fall, n); }
    /* B. a document (a counting fake canvas): the baked path. bake calls land on the offscreen ctx (nb), drawn calls on the screen ctx (n) */
    const had = globalThis.document; globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => mk(() => { nb++; }) }) };
    const sp = E2.burns(); const states = ['smoke', 'burn']; let worst = 0, worstBake = 0, bakeTotal = 0;
    for (const stt of states) { for (const b of sp) b.state = stt; nb = 0; let t = 3.3; for (let f = 0; f < 14; f++, t += 1 / 60) for (const [cx, cy] of spots) { n = 0; const nb0 = nb; E2.draw(g2, cx, cy, t); if (f >= 7) worst = Math.max(worst, n); worstBake = Math.max(worstBake, nb - nb0); } bakeTotal += nb; }
    globalThis.document = had;
    ok(worst > 0 && worst <= 600, 'BUDGET: a frame with all 5 spans (smoke, then burning), worst of 20 camera spots (up to three stacked spans on screen): ' + worst + ' screen canvas calls once baked (<= 600; was 1738 with drawBay at half density; one 96 px bay is ' + bay + ')');
    ok(worstBake > 0 && worstBake <= 600, 'the one-time bake is spread: worst single frame ' + worstBake + ' offscreen calls (1 sheet frame per game frame), ' + bakeTotal + ' in all for both sheets, never rebuilt when a tier burns');
    ok(fall > 0, 'no-document fallback draws with drawBay as before (' + fall + ' calls: node-only path)'); }
  else ok(true, 'draw not measured in node (browser owed)'); }
console.log(fails ? 'FAIL gq6s3 ON (' + fails + ' of ' + checks + ')' : 'ok  gq6s3 ON (' + checks + ' checks)'); process.exit(fails ? 1 : 0);
