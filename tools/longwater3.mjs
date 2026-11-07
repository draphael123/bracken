/* tools/longwater3.mjs - THE LONG WATER 3 (claude/longwater3, the greybox): node proofs. Node only: no page, no port, no Chrome.
     node tools/longwater3.mjs            every check (~5 s)
     node tools/longwater3.mjs --sim=6    + toy duels with THE TIDE HERALD 2 through the real hands in a stub world (a perfect-read bot: the FLOW, NOT the win rate)
   What it proves: the flag both ways (off: master's Long Water, its tables untouched; on: master's columns 0-365 cell for cell, Saltreach after); lintLongWater3 + the kit's
   lintTide; the verbs are REQUIRED where the level says so (the race's own low is too short to walk, the wheel's hold is long enough; the harbour's likewise); the boats
   reach what they must and the pier head is out of a swimmer's reach; reach from START to both shrines, the arena and the gate with the boats as rides; the crab (told
   before every pinch, buried = untouchable, digs in on the flood); THE TIDE HERALD 2 (never under 0.4, every tell held >= 0.45 s, each opening opens and each
   non-opening does not: P1 sluice-drop on the flats / on a stone / a natural ebb / the bell's lure; P2 sluice alone dips / bell then sluice mires / bell alone recalls). */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const arg = k => { const a = process.argv.find(q => q.startsWith('--' + k)); return a ? (a.split('=')[1] ?? true) : null; };
/* the child: build the level with the flag as asked and print its hash (a fresh process: the flag is read at build time, and the module caches nothing of it) */
if (arg('child')) {
  const { LEVELS } = await import('../src/level.js');
  const L = LEVELS.find(l => l.id === 'longwater').build();
  const h = createHash('sha1').update(JSON.stringify([L.W, L.H, Array.from(L.grid), L.ents, L.pools, L.ambushes || null, (L.moversExtra || []).length])).digest('hex').slice(0, 12);
  const head = createHash('sha1').update(JSON.stringify(Array.from({ length: L.H }, (_, y) => Array.from(L.grid.slice(y * L.W, y * L.W + 366))))).digest('hex').slice(0, 12);
  console.log(JSON.stringify({ W: L.W, lw3: !!L.lw3, h, head })); process.exit(0);
}
const BASE_OFF = '67cda4d5033f';   /* the flag-off build's hash on the base (re-stamp if master's Long Water changes before the merge: node tools/longwater3.mjs --child with LW3=0) */
let ok = 0; const pass = (c, m) => { assert.ok(c, m); ok++; };
const child = env => { const r = spawnSync(process.execPath, [SELF, '--child'], { env: { ...process.env, LW3: env }, encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr); return JSON.parse(r.stdout.trim().split('\n').pop()); };

/* ---------- 1. THE FLAG ---------- */
const OFF = child('0'), ON = child('1');
pass(!OFF.lw3 && OFF.W === 570, 'flag off: master Long Water (570 columns)');
pass(OFF.h === BASE_OFF, 'flag off: the build hash is the base hash (' + OFF.h + ': claude/waterkit e08836df8 builds the same Long Water)');
pass(ON.lw3 && ON.W === 706, 'flag on: LONG WATER 3 (706 columns)');
pass(ON.head === OFF.head, 'flag on: master\'s columns 0-365 kept cell for cell (the Meltfalls, the Linn, the ferry run, the Bore Reach)');

process.env.LW3 = '1';
const { LEVELS, T } = await import('../src/level.js');
const { LW3, LW3_TABLES, lintLongWater3, lw3On, buildLongWater3 } = await import('../src/longwater3.js');
const { lintTide, tideInit, tideStep, tideStrike, gauge, floatY, kOf } = await import('../src/tide-kit.js');
const { floodReach } = await import('../src/reachcore.js');
const PCM = await import('../src/pool-crab.js');
const THM = await import('../src/tide-herald.js');
const { makeLongWater3Hands } = await import('../src/longwater3-hands.js');
const { MARK } = await import('../src/marks.js');
const { THREAT } = await import('../src/threat.js');
const TS = 16;
pass(lw3On(), 'LW3=1 turns it on for Node tools');
const L = LEVELS.find(l => l.id === 'longwater').build();
pass(L.lw3 && L.W === LW3.W, 'built on');

/* ---------- 2. THE LEVEL'S OWN LINT + THE KIT'S ---------- */
{ const bad = lintLongWater3(L, T); pass(!bad.length, 'lintLongWater3: ' + bad.join('; '));
  const badT = lintTide({ tides: L.lw3Tides, pools: L.pools, checkpoints: L.ents.filter(e => e.t === 'check') }); pass(!badT.length, 'lintTide: ' + badT.join('; ')); }
pass(L.ents.filter(e => e.t === 'check' && e.x >= LW3.X0).length === 2, 'two shrines in Saltreach (master had three in its tail)');
pass(L.ents.filter(e => e.t === 'silver').length === 3, 'three silvers (save bits): ' + L.ents.filter(e => e.t === 'silver').map(e => e.x + ',' + e.y).join(' '));
pass(!L.ents.some(e => e.x >= LW3.X0 && e.t === 'deco' && e.kind === 'tributeChest'), 'no goblin tribute chest in Saltreach');
pass((L.ambushes || []).map(a => a.name).join('|') === 'THE BORE STONES|THE LOW STREET', 'the two ambushes (the bore stones, the low street): ' + (L.ambushes || []).map(a => a.name).join('|'));
pass(L.ents.some(e => e.elite && e.t === 'tideguard' && e.x === 541), 'the elite holds the lofts\' street (gate 545)');
pass(LW3_TABLES.STASH === 'seaChest', 'the dead-end stash is a sea chest under the flag');
for (const t of ['poolcrab', 'lw3herald', 'lw3bell', 'lw3sluice', 'lw3trap', 'lw3moor']) pass(t in THREAT, 'THREAT has ' + t);
pass(MARK['poolcrab|pinchTell'] === '!', 'marks: the crab\'s pinch is a yellow !');
for (const [m, mk] of THM.TH_TELLS) pass(('herald|' + m) in MARK && MARK['herald|' + m] === mk, 'marks: herald|' + m + ' = "' + mk + '" (' + MARK['herald|' + m] + ')');

/* ---------- 3. THE TIDES: what each verb must do, by the clock ---------- */
const kitOf = () => tideInit({ tides: L.lw3Tides, pools: L.pools });
const run = (K, secs, each) => { const dt = 1 / 60; for (let t = 0; t < secs; t += dt) { tideStep(K, dt); if (each) each(t); } };
const dryWindow = (K, id, secs, k = 0.05) => { let best = 0, cur = 0; run(K, secs, () => { if (kOf(K, id) <= k) { cur += 1 / 60; best = Math.max(best, cur); } else cur = 0; }); return best; };
const RUN = 92;
/* THE MILL RACE: its own low is too short to walk under the mill; the wheel's hold is long enough */
{ const walk = (494 - 461) * TS / RUN + 0.6;
  const nat = dryWindow(kitOf(), 'race', 120); pass(nat < walk, 'the race\'s own dry window ' + nat.toFixed(2) + ' s < the walk ' + walk.toFixed(2) + ' s: the wheel is REQUIRED');
  const K = kitOf(), v = L.lw3Sluices.find(s => s.tide === 'race'); run(K, 1);
  tideStrike(K, { l: v.x * TS + 4, r: v.x * TS + 12, t: (v.y + 1) * TS - 20, b: (v.y + 1) * TS - 6 });
  const held = dryWindow(K, 'race', 30); pass(held > walk + 2, 'the wheel holds the race out ' + held.toFixed(2) + ' s > the walk + 2 s'); }
/* THE HARBOUR: crossing the crab flats from the quay to the mooring wants low water longer than the harbour gives */
{ const walk = (620 - 591) * TS / RUN + 1.2;
  const nat = dryWindow(kitOf(), 'harbour', 120, 0.1); pass(nat < walk, 'the harbour\'s own low ' + nat.toFixed(2) + ' s < quay -> mooring ' + walk.toFixed(2) + ' s: the wheel is REQUIRED');
  const K = kitOf(), v = L.lw3Sluices.find(s => s.tide === 'harbour'); run(K, 1);
  tideStrike(K, { l: v.x * TS + 4, r: v.x * TS + 12, t: (v.y + 1) * TS - 20, b: (v.y + 1) * TS - 6 });
  const held = dryWindow(K, 'harbour', 30, 0.1); pass(held > walk + 1.5, 'the harbour wheel holds the jellies out ' + held.toFixed(2) + ' s'); }
/* THE BELL: at low water the warn starts at once, three strokes, then the rise (never untold) */
{ const K = kitOf(), b = L.lw3Bells.find(q => q.tide === 'bay'); const S = K.tides.find(s => s.id === 'bay'); pass(S.ph === 'low', 'the bay starts at low');
  const ev = []; tideStrike(K, { l: b.x * TS + 4, r: b.x * TS + 12, t: (b.y + 1) * TS - 20, b: (b.y + 1) * TS - 6 }); pass(S.ph === 'warn', 'the bell at low starts the warn');
  run(K, 6, () => {}); pass(kOf(K, 'bay') > 0.95, 'the bell\'s sea is in within 6 s'); }
/* THE BOATS: the cove's at high is a hop from both quays; the harbour's lifts you to the pier head, which no swimmer reaches */
{ const K = kitOf(), S = K.tides.find(s => s.id === 'bay'); S.ph = 'high'; S.k = 1; S.t = 9; tideStep(K, 1 / 60);
  const b1 = floatY(K, 'b1'); pass(Math.abs(b1 - LW3.ST * TS) <= 16, 'the cove boat at high floats level with the street (' + b1 + ' vs ' + LW3.ST * TS + ')');
  const H2 = K.tides.find(s => s.id === 'harbour'); H2.ph = 'high'; H2.k = 1; H2.t = 9; tideStep(K, 1 / 60);
  const b4 = floatY(K, 'b4'), pier = 24 * TS, surf = L.lw3Tides.find(t => t.id === 'harbour').hi * TS;
  pass(b4 - pier > 0 && b4 - pier <= 48, 'the harbour boat at high: the pier head is ' + (b4 - pier) + ' px over her deck (a jump is 51)');
  pass(surf - pier > 56, 'the pier head is ' + (surf - pier) + ' px over high water: no swimmer climbs it');
  pass(surf - b4 <= 48, 'a swimmer can climb onto her (' + (surf - b4) + ' px)');
  const H3 = K.tides.find(s => s.id === 'harbour'); H3.ph = 'low'; H3.k = 0; H3.t = 3; tideStep(K, 1 / 60); pass(floatY(K, 'b4') === 30 * TS, 'at low she sits on the flats'); }
/* THE TIDE POOLS: the sea wall is out of reach from the flats, one row from high water */
{ pass((LW3.FL - LW3.ST) * TS > 51, 'the sea wall stands ' + (LW3.FL - LW3.ST) + ' rows over the flats: no jump'); pass((LW3.bay.hi - LW3.ST) * TS <= 32, 'from high water it is ' + (LW3.bay.hi - LW3.ST) + ' row(s): climb out'); }

/* ---------- 4. REACH (rides: the boats; the reach model swims the bay's pools at their high line) ---------- */
{ const R = floodReach(L, T, { rides: true }), has = (x, y) => [-1, 0, 1].some(dx => [0, -1, 1].some(dy => R.seen.has(R.key(x + dx, y + dy))));
  for (const c of L.ents.filter(e => e.t === 'check')) pass(has(c.x, c.y), 'reach: the shrine at ' + c.x + ',' + c.y);
  pass(has(LW3.arena.x0 + 4, LW3.arena.floor - 1), 'reach: the Herald\'s flats'); pass(has(LW3.arena.gate - 2, 24), 'reach: the gate');
  for (const s of L.ents.filter(e => e.t === 'silver')) pass(has(s.x, s.y), 'reach: the silver at ' + s.x + ',' + s.y); }

/* ---------- 5. THE CRAB ---------- */
{ const mk = (k) => { const ev = []; let K = k; const c = { k: () => K, mark: m => ev.push('mark' + m), sound: s => ev.push('snd:' + s), hit: () => { ev.push('HIT'); return 'hit'; }, say: (e, w) => ev.push('say:' + w), move: (e, dx) => { e.x += dx; return dx; } }; return { c, ev, set: v => { K = v; } }; };
  const e = PCM.spawnCrab({ x: 100, y: 200, face: -1, alive: true }, { face: -1 }); const W = mk(1);
  for (let i = 0; i < 120; i++) PCM.stepCrab(e, 1 / 60, { x: 110, y: 200, alive: true }, W.c);
  pass(e.mode === 'buried' && !W.ev.includes('HIT'), 'high water: it stays buried and hurts no one');
  pass(PCM.crabTake(e, false).k === 0, 'buried: a blade passes over it');
  W.set(0); let t = 0, firstHit = null, firstMark = null; for (let i = 0; i < 600; i++) { PCM.stepCrab(e, 1 / 60, { x: 112, y: 200, alive: true }, W.c); t += 1 / 60;
    if (firstMark === null && W.ev.includes('mark!')) firstMark = t; if (firstHit === null && W.ev.includes('HIT')) firstHit = t; }
  pass(W.ev.includes('snd:boil'), 'low water: the sand boils before it comes up');
  pass(firstMark !== null && firstHit !== null && firstHit - firstMark >= 0.45, 'the pinch is told ' + (firstHit - firstMark).toFixed(2) + ' s before it lands');
  e.mode = 'rec'; e.buried = false; pass(PCM.crabTake(e, false).k === 1.5, 'claw open after a pinch: x1.5');
  e.mode = 'walk'; pass(PCM.crabTake(e, false).k === 0.6, 'the shell: x0.6'); pass(PCM.crabTake(e, true).k === 2 && e.mode === 'flipped', 'a plunge flips it: x2');
  e.mode = 'walk'; W.set(0.6); W.ev.length = 0; PCM.stepCrab(e, 1 / 60, null, W.c); pass(e.mode === 'digTell' && W.ev.includes('say:DIGS IN'), 'the flood: it digs in, told');
  for (let i = 0; i < 60; i++) PCM.stepCrab(e, 1 / 60, null, W.c); pass(e.mode === 'buried', 'and is buried'); }

/* ---------- 6. THE TIDE HERALD 2: the resistance floor ---------- */
{ const S = THM.newFight({ x0: 0, x1: 100, floor: 0, stones: [], bellX: 0, sluiceX: 0 }); let lo = 9;
  for (const mode of ['stride', 'sweepTell', 'sweep', 'thrustTell', 'thrust', 'spearTell', 'spear', 'raise', 'wave', 'maelTell', 'mael', 'callTell', 'seize', 'rec', 'mired', 'reel', 'wake'])
    for (const ward of [0, 1]) for (const open of [0, 2]) for (const k of [0, 0.5, 1]) { S.ward = ward; const e = { mode, open }; lo = Math.min(lo, THM.takeK(e, S, k)); }
  pass(lo >= 0.4, 'never under 0.4 (lowest ' + lo + ')'); S.ward = 0; pass(THM.takeK({ mode: 'mired', open: 1 }, S, 0) === 1.5, 'mired x1.5'); }

/* ---------- 7. THE TIDE HERALD 2 through the REAL hands in a stub world ---------- */
function stubWorld(o = {}) {
  const Lw = LEVELS.find(l => l.id === 'longwater').build(), A = Lw.arena;
  const P = { x: A.x0 + 60, y: A.floor, vy: 0, dead: false, swim: false, block: false, hp: 300, ground: true };
  const hits = [], enemies = []; let boss = null; let cur = P;
  const ctx = {
    get L() { return Lw; }, get players() { return [P]; }, get boss() { return boss; }, get bossActive() { return true; }, EHP: { poolcrab: 30 },
    hero: () => cur, time: () => 0, poolLevel: (p, y) => { p.y = y; const d = p.base - y; p.dry = d <= 1; p.depth = Math.max(0, d); p.shallow = d < 18; },
    moveBody: (b, dx) => { b.x += dx; }, enemies: () => enemies, parts: () => [], isSolid: (x, y) => Lw.grid[y * Lw.W + x] === T.SOLID, VW: () => 320,
    number: () => {}, text: () => {}, burst: () => {}, shake: () => {}, ring: () => {}, turned: () => {},
    damagePlayer: (x, d, op) => { const r = P.block && !op.unblockable ? 'blocked' : 'hit'; hits.push({ d, name: op.name, r }); if (r === 'hit') P.hp -= d; return r; },
    asPlayer: (p, fn) => { cur = p; fn(); cur = P; }, upright: () => true, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: b => ({ l: b.x - 5, r: b.x + 5, t: b.y - 20, b: b.y }),
    hurtFoe: (e, d) => { e.hp -= d; if (e.hp <= 0) e.alive = false; }, coin: () => { ctx.coinN = (ctx.coinN || 0) + 1; }, sound: () => {},
  };
  const H = makeLongWater3Hands(ctx); H.clear();
  const he = Lw.ents.find(e => e.t === 'lw3herald');
  boss = H.spawnEnt({ x: he.x * TS + 8, y: (he.y + 1) * TS, vx: 0, vy: 0, face: -1, alive: true }, he); enemies.push(boss);
  boss.mode = 'wake'; boss.modeT = 1.6;
  const strikeAt = id => { const v = id === 'bell' ? { x: 659, y: 27 } : { x: 672, y: 27 }; H.strike({ l: v.x * TS + 4, r: v.x * TS + 12, t: (v.y + 1) * TS - 20, b: (v.y + 1) * TS - 6 }); };
  const step = (secs, fn) => { const dt = 1 / 60; for (let t = 0; t < secs; t += dt) { if (fn && fn(t) === false) return; H.update(dt); H.updateEnt(boss, dt); } };
  return { H, Lw, A, P, boss: () => boss, hits, enemies, coins: () => ctx.coinN || 0, step, strikeAt, Q: () => H.herald(), sq: () => H.kit().tides.find(s => s.id === 'square') };
}
const calm = W => { const b = W.boss(); if (b.mode === 'stride' || /Tell$|^raise$/.test(b.mode)) { b.mode = 'stride'; b.modeT = 99; } };   /* (a scenario holds his moves: only the tide's answer is under test) */
{ /* P1: THE SLUICE while he is out on the flats */
  const W = stubWorld(); W.step(2); const sq = W.sq(); sq.ph = 'high'; sq.k = 1; sq.t = 8; W.boss().x = 680 * TS; calm(W); W.step(0.5, () => { calm(W); W.P.x = W.boss().x + 30; });
  W.strikeAt('sluice'); let mired = false; W.step(3, () => { calm(W); W.P.x = W.boss().x + 30; if (W.boss().mode === 'mired') { mired = true; return false; } }); W.boss().modeT = Math.max(W.boss().modeT, 0);
  pass(mired, 'P1: the SLUICE pulls the sea out from under him on the flats: MIRED'); pass(W.Q().n.sluiceMire === 1, 'counted as the sluice\'s');
  pass(THM.takeK(W.boss(), W.Q(), 0) === 1.5, 'and x1.5 while he is'); }
{ /* P1: THE SLUICE while he stands on a stone: no opening */
  const W = stubWorld(); W.step(2); const sq = W.sq(); sq.ph = 'high'; sq.k = 1; sq.t = 8; W.boss().x = 687 * TS + 8; calm(W);
  W.step(0.5, () => { calm(W); W.boss().x = 687 * TS + 8; }); W.strikeAt('sluice'); let mired = false; W.step(3, () => { calm(W); W.boss().x = 687 * TS + 8; if (W.boss().mode === 'mired') mired = true; });
  pass(!mired, 'P1: the sluice while he is on a stone: no opening'); }
{ /* P1: a NATURAL ebb: he makes for the stones and reaches one */
  const W = stubWorld(); W.step(2); const sq = W.sq(); sq.ph = 'high'; sq.k = 1; sq.t = 0.5; W.boss().x = 666 * TS; W.boss().mode = 'stride'; W.boss().modeT = 99;
  let mired = false, dryOn = null; W.step(6, () => { W.boss().modeT = 99; if (W.boss().mode === 'mired') mired = true; if (dryOn === null && kOf(W.H.kit(), 'square') < 0.25) dryOn = THM.onStone(W.Q(), W.boss().x); }); pass(!mired && dryOn === true, 'P1: a natural ebb - he walks to a stone (no waiting-room opening)'); }
{ /* P1: THE BELL'S LURE: rung at low, he comes out after you, the called sea goes out fast and leaves him in the mud */
  const W = stubWorld(); W.step(2); W.boss().x = 679 * TS; W.P.x = 684 * TS; calm(W); W.step(0.2, () => calm(W));
  W.strikeAt('bell'); pass(W.Q().lured, 'P1: the bell at low water: HE COMES OUT ON IT (lured)');
  let mired = false; W.step(14, () => { const b = W.boss(); if (b.mode !== 'mired') { b.modeT = 99; if (b.mode !== 'stride') b.mode = 'stride'; } W.P.x = b.x + 30; if (b.mode === 'mired') { mired = true; return false; } });
  pass(mired && W.Q().n.bellMire === 1, 'the called sea goes out and leaves him in the mud: MIRED (the bell\'s)'); }
{ /* P2: the sea is his */
  const W = stubWorld(); W.step(2); const b = W.boss(); b.hp = b.maxHp * 0.45; b.x = 676 * TS; b.mode = 'stride'; b.modeT = 0.1; W.step(0.3);
  pass(b.mode === 'seize' && W.Q().ph === 2, 'P2 at half: THE SEA IS HIS (told, the raise)'); W.step(5, () => { if (b.mode !== 'seize') { b.mode = 'stride'; b.modeT = 99; } });
  pass(W.Q().sea === 'his' && kOf(W.H.kit(), 'square') > 0.95, 'his sea is up and held'); W.step(10, () => { b.modeT = 99; }); pass(kOf(W.H.kit(), 'square') > 0.95, 'and stays up (10 s on)');
  /* the sluice alone only dips it */
  W.strikeAt('sluice'); let mired = false; W.step(3, () => { b.modeT = 99; if (b.mode === 'mired') mired = true; }); pass(!mired && W.Q().n.dips === 1, 'P2: the sluice alone - THE SEA IS HIS, a dip, no opening');
  pass(kOf(W.H.kit(), 'square') > 0.9, 'and the sea comes back');
  /* the bell alone: he calls it back */
  W.H.kit().tides.forEach(s => s.verbs.forEach(v => v.cool = 0)); W.strikeAt('bell'); pass(b.mode === 'callTell', 'P2: the bell BREAKS HIS CALL - he stands and calls it back');
  W.step(THM.TH.recall + 0.5, () => { if (b.mode === 'mired') mired = true; }); pass(!mired && W.Q().sea === 'his', 'the bell alone: he calls the sea back, no opening');
  W.step(2, () => { if (b.mode !== 'callTell') { b.mode = 'stride'; b.modeT = 99; } });
  /* the bell, then the sluice inside his call: mired */
  W.H.kit().tides.forEach(s => s.verbs.forEach(v => v.cool = 0)); b.mode = 'stride'; b.modeT = 99; W.strikeAt('bell'); W.step(0.5); W.strikeAt('sluice');
  W.step(3, () => { if (b.mode === 'mired') { mired = true; return false; } }); pass(mired && W.Q().n.sluiceMire >= 1, 'P2: the bell, then the sluice inside his call - MIRED');
  W.step(THM.TH.mireP2 + 2, () => { if (b.mode === 'stride' || b.mode === 'rec') b.modeT = 99; }); pass(W.Q().sea === 'his', 'after the mire he calls the sea back'); }
{ /* every tell held >= 0.45 s before its blow (the moves through the real hands; one hero standing in reach) */
  const W = stubWorld(); W.step(2); const b = W.boss(); let tellAt = {}, short = [];
  const seen = new Set(); let prev = b.mode;
  let tt = 0; W.step(120, () => { tt += 1 / 60; W.P.x = b.x + [30, 90, 150][Math.floor(tt / 3) % 3]; W.P.block = false; if (b.mode !== prev) { if (THM.TH_TELLS.some(([m]) => m === b.mode)) tellAt[b.mode] = 0; if (THM.TH_TELLS.some(([m]) => m === prev) && tellAt[prev] !== undefined && tellAt[prev] < 0.45 && prev !== 'seize') short.push(prev + ' ' + tellAt[prev].toFixed(2)); seen.add(b.mode); prev = b.mode; }
    for (const k in tellAt) tellAt[k] += 1 / 60; if (b.mode === 'mired') b.modeT = 0; W.P.hp = 300; });
  pass(!short.length, 'every tell held >= 0.45 s: ' + short.join(', '));
  pass(['sweepTell', 'thrustTell', 'spearTell', 'raise'].every(m => seen.has(m)), 'his P1 moves seen: ' + [...seen].filter(m => /Tell|raise/.test(m)).join(',')); }
{ /* the traps: cut, fall, crush the crab under; the coin trap spills */
  const W = stubWorld(); W.boss().alive = false; const st = W.H.state(), tr = st.traps.find(t => t.id === 't1');
  const crab = { t: 'poolcrab', x: tr.x * TS + 8, y: 34 * TS, h: 9, hp: 30, alive: true }; W.enemies.push(crab);
  W.H.strike({ l: tr.x * TS + 2, r: tr.x * TS + 14, t: tr.py - 4, b: tr.py + 8 }); pass(tr.st === 'fall', 'a blow cuts trap t1 rope');
  for (let i = 0; i < 180 && tr.st !== 'down'; i++) W.H.update(1 / 60); pass(tr.st === 'down', 'it lands on the pool bed'); pass(!crab.alive, 'and crushes the crab under it');
  const t2 = st.traps.find(t => t.id === 't2'); W.H.strike({ l: t2.x * TS + 2, r: t2.x * TS + 14, t: t2.py - 4, b: t2.py + 8 }); for (let i = 0; i < 240 && t2.st !== 'down'; i++) W.H.update(1 / 60);
  pass(t2.st === 'down' && W.coins() === LW3.trap.coins, 'the coin trap spills its catch (' + W.coins() + ')'); }
{ /* a crab through the hands: buried at high water, out at low */
  const W = stubWorld(); W.boss().alive = false; const ce = W.Lw.ents.find(e => e.t === 'poolcrab'); const c = W.H.spawnEnt({ x: ce.x * TS + 8, y: (ce.y + 1) * TS, face: 1, alive: true }, ce); W.enemies.push(c);
  const bay = W.H.kit().tides.find(s => s.id === 'bay'); bay.ph = 'high'; bay.k = 1; bay.t = 9; for (let i = 0; i < 60; i++) { W.H.update(1 / 60); W.H.updateEnt(c, 1 / 60); } pass(c.mode === 'buried', 'hands: at high water the crab is buried');
  bay.ph = 'low'; bay.k = 0; bay.t = 6; W.P.x = c.x + 200; for (let i = 0; i < 90; i++) { W.H.update(1 / 60); W.H.updateEnt(c, 1 / 60); } pass(c.mode === 'walk', 'hands: at low water it is out (' + c.mode + ')'); }
{ /* the moored boat stays under until her rope is cut; the race carries a swimmer back */
  const W = stubWorld(); W.boss().alive = false; const m = W.Lw.moversExtra.find(q => q.fid === 'b4'), hb = W.H.kit().tides.find(s => s.id === 'harbour'); hb.ph = 'high'; hb.k = 1; hb.t = 9;
  W.H.update(1 / 60); W.H.mover(m, 1 / 60); pass(m.y === m.rest, 'moored: she is held under at her rest row at high water');
  const mo = W.Lw.lw3Moors[0]; W.H.strike({ l: mo.x * TS + 2, r: mo.x * TS + 14, t: (mo.y + 1) * TS - 20, b: (mo.y + 1) * TS - 4 }); W.H.update(1 / 60); W.H.mover(m, 1 / 60); pass(m.y < m.rest - 60, 'cut loose: she rides up (' + m.y + ')');
  W.P.swim = true; W.P.x = 475 * TS; const x0 = W.P.x; for (let i = 0; i < 30; i++) W.H.update(1 / 60); pass(W.P.x < x0 - 40, 'the race carries a swimmer back under the mill (' + Math.round(x0 - W.P.x) + ' px in 0.5 s)'); }

/* ---------- 8. TOY DUELS (--sim=N): the FLOW through the real hands, NOT the rate ---------- */
const nSim = +(arg('sim') || 0);
if (nSim) { const res = [];
  for (let i = 0; i < nSim; i++) { const W = stubWorld(), b = W.boss(), P = W.P, greedy = i % 3 === 2; let t = 0, swingT = 0, flasks = 3, dead = false; const why = {};
    const DMG = 14, SWING = 0.42;
    W.step(400, dt0 => { t = dt0; const Q = W.Q(), plan = THM.thPlan(b, Q, gauge(W.H.kit(), 'square'), W.A.bellX, W.A.sluiceX);
      if (!b.alive || b.hp <= 0) return false; if (P.hp <= 0) { if (flasks > 0) { flasks--; P.hp = 160; } else { dead = true; return false; } }
      if (P.hp < 120 && flasks > 0 && !THM.thOpen(b)) { flasks--; P.hp = Math.min(300, P.hp + 140); }
      P.block = !!plan.block; const go = x => { P.x += Math.sign(x - P.x) * Math.min(Math.abs(x - P.x), RUN / 60); };
      if (plan.go === 'bell' || plan.go === 'sluice') { if (greedy && Math.random() < 0.4) go(b.x + 24); else { go(plan.to); if (Math.abs(P.x - plan.to) < 6) W.strikeAt(plan.go); } }
      else if (plan.go === 'stone') go(THM.nearestStone(Q, P.x));
      else go(b.x + (P.x < b.x ? -22 : 22));
      swingT -= 1 / 60; if (plan.attack && Math.abs(P.x - b.x) < 30 && swingT <= 0) { swingT = SWING; const d = W.H.take(b, DMG, 'slash', false); b.hp -= d; }
      if (arg('log')) { why[plan.why] = (why[plan.why] || 0) + 1 / 60; if (Math.floor(dt0 * 60) % 600 === 0) console.log('   t' + dt0.toFixed(0) + ' hp ' + b.hp + ' ph ' + W.Q().ph + ' mode ' + b.mode + ' sea ' + W.Q().sea + ' k ' + kOf(W.H.kit(), 'square').toFixed(2) + ' P ' + (P.x / 16).toFixed(1) + ' B ' + (b.x / 16).toFixed(1)); }
      if (b.hp <= 0) { b.alive = false; return false; } });
    if (arg('log')) console.log('   why', JSON.stringify(Object.fromEntries(Object.entries(why).map(([k, v]) => [k, +v.toFixed(1)]))));
    res.push({ won: !b.alive || b.hp <= 0, t: +t.toFixed(1), flasks, mired: W.Q().n.mired, bell: W.Q().n.bellMire, sluice: W.Q().n.sluiceMire, nat: W.Q().n.natMire, reel: W.Q().n.reel, ph: W.Q().ph, hp: Math.round(P.hp), greedy }); }
  console.log('TOY DUELS (a perfect-read bot through the real hands; flow, NOT the rate):'); for (const r of res) console.log('  ' + JSON.stringify(r));
  const won = res.filter(r => r.won); console.log('  won ' + won.length + '/' + res.length + ', avg ' + (won.reduce((a, r) => a + r.t, 0) / Math.max(1, won.length)).toFixed(1) + ' s'); }

console.log('tools/longwater3.mjs: ' + ok + ' ok');
