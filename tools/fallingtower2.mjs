// tools/fallingtower2.mjs - THE FALLING TOWER 2 (claude/fallingtower2; Daniel 2026-10-08, scratch/brief-fallingtower2.md; src/tower-fall2.js).
//   CHASE    the floors fall faster (fuse 1.4 s, 26 rows/s); DEBRIS comes down on the floors you climb, every stone after a shadow told
//            FT2.debris.tell s on the footing it lands on; a hero off the shadow is never hit, one on it is
//   ROOMS    THE LIBRARY's books smoulder (told) before they burn, and burn whoever stands in them; THE OBSERVATORY's telescope swings its
//            eyepiece from the failing stair's second step up to the third (its stops level with both); THE ALCHEMY LAB's syrup slows the
//            legs, its fizz is a BOUNCER, and its stones are three wide (reachcore's frame-perfect crossings 24..48 row 149 are gone);
//            THE TREASURY's floor tilts - told (a creak, then the lean), it slides you and its chests
//   LEAN     the tower leans half a degree a fallen floor, and its reading floor is buckled (slope tiles on rock)
//   OUTSIDE  the crown's stair is gone: a breach, THE OUTER FACE (planks in the storm), wind told before it shoves, lightning told on its
//            plank before it strikes, THE DROP a hazard back to safe footing; THE SNAP: the chunk tells, then carries you to the parapet
//   REACH    the shared fill climbs to his ring and the carpet with the rides; and with the outer face's planks taken away the parapet is
//            out of reach (the outside is load-bearing); with the chunk taken away, too (the snap is the way)
// usage: node tools/fallingtower2.mjs
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { TOWER } from '../src/tower-ascent.js';
import { FT2, ftUpdate, ftMover, ftReset, inOuter } from '../src/tower-fall2.js';
import { isSlope } from '../src/slopes.js';
const TS = 16, lv = LEVELS.find(l => l.id === 'fallingtower'), L = lv.build(), W = L.W, F = L.ft2, at = (x, y) => L.grid[y * W + x];
assert.ok(F, 'no L.ft2: the Falling Tower 2 is not built');
const name = k => L.towerFloors[k].name;
assert.deepEqual(L.towerFloors.map(f => f.name), ['THE LIBRARY STACKS', 'THE READING ROOM', 'THE OBSERVATORY', 'THE PENDULUM GALLERY', 'THE ALCHEMY LAB', 'THE BELL LOFT', 'THE OPEN CROWN'], 'the rooms');
// ---- a rig: the hero, a frame clock and everything the module asks for ----
function rig(P0) { const P = { x: 0, y: 0, vx: 0, vy: 0, face: 1, ground: true, dead: false, onMover: null, ...P0 }, log = { hurts: [], says: [], calls: [], sounds: [], falls: 0, push: 0, t: 0 };
  const c = { time: 0, grid: L.grid, W, T, standable: t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK || t === T.NET || isSlope(t), solid: t => t === T.SOLID, busy: false,
    hurt: (x, d, blow) => log.hurts.push({ t: log.t, d, blow, x }), fall: () => { log.falls++; }, say: (x, y, s) => log.says.push(s), callout: s => log.calls.push([log.t, s]), sound: k => log.sounds.push([log.t, k]),
    shake: () => {}, push: dx => { log.push += dx; P.x += dx; }, dust: () => {} };
  const step = (dt = 1 / 60) => { log.t += dt; c.time = log.t; ftUpdate(L, P, dt, c); };
  const run = (s, each) => { for (let i = 0; i < Math.round(s * 60); i++) { step(); if (each && each()) return true; } return false; };
  ftReset(L); return { P, log, c, step, run };
}
// ---- CHASE ----
{ const src = (await import('node:fs')).readFileSync(new URL('../src/tower-ascent.js', import.meta.url), 'utf8');
  assert.ok(/f\.last \? 0\.6 : 1\.4/.test(src) && /dt \* 26/.test(src), 'the collapse does not chase: the fuse and the fall pace are the old ones'); }
const lib = L.towerFloors[0];
{ const r = rig({ x: 30 * TS + 8, y: lib.bot * TS, face: 1 }); let seen = 0, hitOn = 0, landed = [];
  /* stand still on the library floor: every stone that falls was told on its spot first, and the one that falls on the spot he stands on hits him */
  for (let i = 0; i < 60 * 40; i++) { r.step(); for (const d of F.rt.debris) { if (d.st === 'tell' && !d.seen) { d.seen = r.log.t; seen++; d.toldFor = 0; } if (d.st === 'tell') d.toldFor += 1 / 60; if (d.st === 'land' && !d.done) { d.done = 1; landed.push(d); } } }
  assert.ok(seen >= 5, 'no debris comes down on the library floor: ' + seen);
  assert.ok(landed.every(d => d.toldFor >= FT2.debris.tell - 0.05), 'a stone fell without its shadow told for ' + FT2.debris.tell + ' s');
  assert.ok(landed.every(d => Math.abs(d.x - r.P.x) >= FT2.debris.ahead[0] - 8), 'debris falls on the hero who stands still - it should fall AHEAD of him');
  /* walk onto a shadow and stay there: hit; step off it: not */
  const q = rig({ x: 30 * TS + 8, y: lib.bot * TS, face: 1 }); q.run(FT2.debris.first + 0.05); const d = F.rt.debris[0]; assert.ok(d && d.st === 'tell', 'no told stone after ' + FT2.debris.first + ' s');
  q.P.x = d.x; q.run(FT2.debris.tell + 1); assert.ok(q.log.hurts.some(h => h.blow === 'debris'), 'standing on the shadow, the stone does not hit');
  const s = rig({ x: 30 * TS + 8, y: lib.bot * TS, face: 1 }); s.run(FT2.debris.first + 0.05); const e = F.rt.debris[0]; s.P.x = e.x + 30; s.run(FT2.debris.tell + 1); assert.ok(!s.log.hurts.some(h => h.blow === 'debris'), 'off the shadow, the stone still hits');
  const b = rig({ x: 30 * TS + 8, y: lib.bot * TS }); b.c.busy = true; b.run(20); assert.ok(!F.rt.debris.length, 'debris comes down in a boss or mini fight'); }
// ---- ROOMS ----
assert.ok(F.flares.length >= 2 && F.flares.every(q => L.towerFloors[0].top <= q.row && q.row < L.towerFloors[0].bot), 'THE LIBRARY has no burning books');
{ const q = F.flares[0], r = rig({ x: (q.x0 + 2) * TS, y: q.row * TS }); let sm = -1, burnt = -1;
  r.run(FT2.flare.period * 2, () => { if (q.st === 'smoulder' && sm < 0) sm = r.log.t; if (r.log.hurts.some(h => h.blow === 'flare')) { burnt = r.log.t; return true; } });
  assert.ok(burnt > 0, 'standing in the books, the flare does not burn'); assert.ok(sm >= 0 && burnt - sm >= FT2.flare.smoulder - 0.05, 'the books burn without smouldering first: ' + [sm, burnt]);
  assert.ok(r.log.sounds.some(([t, k]) => k === 'hiss'), 'the smoulder does not hiss'); }
{ const sc = L.moversExtra.find(m => m.role === 'scope'); assert.ok(sc, 'THE OBSERVATORY has no telescope');
  const obs = L.towerFloors[2], roof = obs.bot - 10, m = { ...sc };
  ftMover(L, m, 0, 0); const lo = { x: m.x, y: m.y }; ftMover(L, m, 0, FT2.scope.period / 2 + 0.01); const hi = { x: m.x, y: m.y };
  { const a = { ...sc }, b = { ...sc }; ftMover(L, a, 0, 0.05); ftMover(L, b, 0, FT2.scope.period * FT2.scope.hold - 0.05); assert.ok(a.y === b.y, 'the telescope does not hold at its low stop'); }
  assert.equal(lo.y, (roof - 6) * TS, 'the telescope does not come down level with the stair\'s second step'); assert.ok(Math.abs(hi.y - (roof - 15) * TS) < 1, 'nor up level with the third: ' + hi.y / TS);
  assert.ok(at(Math.floor((lo.x + m.w + 4) / TS), roof - 6) === T.ONEWAY && at(Math.floor((hi.x + m.w + 4) / TS), roof - 15) === T.ONEWAY, 'its stops are not beside the steps');
  for (let t = 0; t < FT2.scope.period; t += 0.05) { const q = { ...sc }; ftMover(L, q, 0, t); for (let x = Math.floor(q.x / TS); x <= Math.floor((q.x + q.w - 1) / TS); x++) assert.notEqual(at(x, Math.floor((q.y - 1) / TS)), T.SOLID, 'the telescope carries you into rock at t=' + t.toFixed(2)); } }
{ const lab = L.towerFloors[4], surf = lab.bot - 4, row = surf - 2, tops = []; for (let x = TOWER.X0 + 9; x < TOWER.X1 - 2; x++) if (at(x, row) === T.SOLID && at(x - 1, row) !== T.SOLID) tops.push(x);
  const gaps = []; for (let x = TOWER.X0 + 9; x < TOWER.X1 - 2; x++) if (at(x, row) !== T.SOLID && at(x, row) !== T.BOUNCER) { let x1 = x; while (at(x1 + 1, row) !== T.SOLID && x1 < TOWER.X1) x1++; gaps.push(x1 - x + 1); x = x1; }
  assert.ok(gaps.length >= 5 && gaps[0] <= 3 && gaps.slice(1).every(g => g <= 2), 'THE ALCHEMY LAB\'s poison gaps are wider than two (reachcore\'s frame-perfect crossings): ' + gaps);
  assert.ok(F.syrup.length >= 2 && F.fizz.length >= 1 && at(F.fizz[0][0], F.fizz[0][1]) === T.BOUNCER, 'the lab has no spills');
  const z = F.syrup[0], r = rig({ x: (z.x0 + 1) * TS, y: z.row * TS }); r.step(); assert.ok(r.P.syrupT > 0, 'the syrup does not hold the feet'); }
{ const Z = F.tilt; assert.ok(Z && (L.scree || []).some(q => q.ft2), 'THE TREASURY has no tilting floor');
  const r = rig({ x: (Z.x0 + 10) * TS, y: Z.row * TS }); const z = L.scree.find(q => q.ft2); let tellAt = -1, leanAt = -1, chestHit = false;
  r.run(30, () => { const Tq = F.rt.tilt; if (Tq.st === 'tell' && tellAt < 0) tellAt = r.log.t; if (Tq.st === 'lean' && leanAt < 0) leanAt = r.log.t; if (r.log.hurts.some(h => h.blow === 'chest')) chestHit = true; return leanAt > 0 && z.dir !== 0; });
  assert.ok(tellAt >= 0 && leanAt - tellAt >= FT2.tilt.tell - 0.05 && r.log.sounds.some(([, k]) => k === 'creak'), 'the floor leans without its creak told first');
  assert.ok(z.dir !== 0 && z.sp === FT2.tilt.sp, 'leaning, the floor does not slide you (the scree zone)');
  r.run(FT2.tilt.lean); const dirs = new Set(); r.run(20, () => { if (F.rt.tilt.st === 'lean') dirs.add(F.rt.tilt.dir); return dirs.size === 2; }); assert.equal(dirs.size, 2, 'the floor only ever leans one way');
  const k = rig({ x: (Z.x0 + 10) * TS, y: Z.row * TS }); let hit = false; k.run(40, () => { const ch = F.rt.chests.find(c => Math.abs(c.vx) > 30); if (ch) k.P.x = ch.x + Math.sign(ch.vx) * 4; hit = k.log.hurts.some(h => h.blow === 'chest'); return hit; });
  assert.ok(hit, 'a sliding chest does not hurt'); }
// ---- LEAN ----
{ let n = 0; for (let x = TOWER.X0; x <= TOWER.X1; x++) if (isSlope(at(x, lib.bot - 1))) { n++; assert.equal(at(x, lib.bot), T.SOLID, 'a buckled-floor slope with no rock under it'); } assert.ok(n >= 2, 'the library floor is not buckled');
  const r = rig({ x: 30 * TS, y: lib.bot * TS }); L.towerFloors[0].done = L.towerFloors[1].done = true; r.step(); assert.equal(F.lean, 2 * FT2.lean.perFloor, 'the tower does not lean as its floors fall'); L.towerFloors[0].done = L.towerFloors[1].done = false; }
// ---- OUTSIDE ----
{ const O = F.outer; assert.ok(O && O.ledges.length >= 7 && O.ledges.every(([x0, len, row]) => at(x0, row) === T.PLANK), 'no outer face of planks');
  const crown = L.towerFloors[6]; assert.ok(at(TOWER.X1 + 1, crown.bot - 4) === T.AIR && at(TOWER.X1 + 2, crown.bot - 4) === T.AIR, 'no breach in the crown\'s east wall');
  const [lx, llen, lrow] = O.ledges[3], r = rig({ x: (lx + 2) * TS, y: lrow * TS });
  let tellAt = -1, blowAt = -1; r.run(20, () => { const G = F.rt.gust; if (G.st === 'tell' && tellAt < 0) tellAt = r.log.t; if (G.st === 'blow' && r.log.push !== 0) { blowAt = r.log.t; return true; } });
  assert.ok(tellAt >= 0 && blowAt - tellAt >= FT2.gust.tell - 0.05 && r.log.calls.some(([, s]) => /WIND/.test(s)), 'the wind shoves without its tell: ' + [tellAt, blowAt]);
  const b = rig({ x: (lx + 2) * TS, y: lrow * TS }); let bt = -1; b.run(20, () => { b.P.x = (lx + 2) * TS;   /* (held where he stands: the wind would carry him off the strike) */ if (F.rt.bolt.st === 'tell' && bt < 0) bt = b.log.t; return b.log.hurts.some(h => h.blow === 'lightning'); });
  const bh = b.log.hurts.find(h => h.blow === 'lightning'); assert.ok(bh && bt >= 0 && bh.t - bt >= FT2.bolt.tell - 0.05, 'the lightning strikes untold, or never on the plank he stands on');
  const d = rig({ x: (O.x0 + 3) * TS, y: (O.drop + 1) * TS }); d.step(); assert.equal(d.log.falls, 1, 'THE DROP takes nothing (it is a hazard: a quarter, and back to safe footing)');
  assert.ok(inOuter(F, { x: (O.x0 + 3) * TS, y: (O.y0 + 4) * TS }) && !inOuter(F, { x: 30 * TS, y: 60 * TS }), 'inOuter is wrong');
  const ch = L.moversExtra.find(m => m.role === 'chunk'), m = { ...ch }; assert.ok(ch, 'no chunk for THE SNAP');
  const s = rig({ x: ch.ax + 40, y: ch.ay, onMover: m }); ftMover(L, m, 0, 0); let tellT = -1, rideT = -1;
  s.run(10, () => { ftMover(L, m, 1 / 60, s.log.t); const S = F.rt.snap; if (S.st === 'tell' && tellT < 0) tellT = s.log.t; if (S.st === 'ride' && rideT < 0) rideT = s.log.t; return S.st === 'done'; });
  ftMover(L, m, 1 / 60, s.log.t);
  assert.ok(tellT >= 0 && rideT - tellT >= FT2.snap.tell - 0.05 && s.log.calls.some(([, c]) => /BREAKS IN TWO/.test(c)), 'the snap goes untold');
  assert.ok(Math.abs(m.x - ch.bx) < 1 && Math.abs(m.y - ch.by) < 1, 'the chunk does not carry you to the parapet: ' + [m.x, m.y, ch.bx, ch.by]);
  assert.ok(m.y / TS - (TOWER.SKY + 1) <= 2 && ch.bx / TS - 43 <= 1, 'from where the chunk stops, the parapet is not a step up'); }
// ---- REACH: the outside is the way ----
{ const ring = L.ents.find(e => e.t === 'ringdoor'), R = floodReach(L, T, { rides: true });
  assert.ok(R.jumpNear(ring.x, ring.y), 'the fill does not climb to his ring');
  const noFace = { ...L, grid: L.grid.slice() }; for (const [x0, len, row] of F.outer.ledges) for (let x = x0; x < x0 + len; x++) noFace.grid[row * W + x] = T.AIR;
  assert.ok(!floodReach(noFace, T, { rides: true }).jumpNear(ring.x, ring.y), 'without the outer face his ring is still reached: the outside is not the way');
  const noSnap = { ...L, rigBands: (L.rigBands || []).filter(b => b[2] > TOWER.SKY + 6) };
  assert.ok(!floodReach(noSnap, T, { rides: true }).jumpNear(ring.x, ring.y), 'without the chunk his ring is still reached: the snap is not the way'); }
console.log('ok  fallingtower2  the collapse chases (fuse 1.4 s; debris told ' + FT2.debris.tell + ' s, ahead of you, off in a fight); the library burns (told ' + FT2.flare.smoulder + ' s), the observatory\'s telescope rides step to step, the lab\'s stones are three wide with syrup and fizz, the treasury tilts (told, both ways, its chests hurt); the lean; the breach, the outer face (wind told ' + FT2.gust.tell + ' s, lightning told ' + FT2.bolt.tell + ' s, the drop a hazard) and the snap (told ' + FT2.snap.tell + ' s, to the parapet) - load-bearing');
