// tools/tower-chase.mjs - THE SPIRAL STAIR: THE UNDEAD ARCHMAGE CHASED UP TO HIS CARPET (src/spiral-chase.js; Daniel, 2026-09-29: "a section
// climbing up the tower after the mini boss (the Sexton) where you go through a PORTAL and CHASE THE ARCHMAGE UP A SPIRAL TOWER as he shoots
// bolts at you like the fight. You eventually reach a PORTAL with a MAGIC CARPET and the fight commences as usual.")
//   PORTAL   the crown's parapet holds HIS RING (a ringdoor) where the door into his hall stood, and it lets you out at the spiral's foot; the
//            reach fill follows it, and it is LOAD-BEARING - take its `to` away and neither the stair nor the carpet is reached
//   SPIRAL   six flights round a newel, turning at the walls; walkable with a REAL jump (tools/checkpoint-stand.mjs's model, 5 columns): the
//            fill from the foot stands on every step, every landing and the carpet. THE RULE BITES: with a jump of 3 columns it does not get
//            up - the gaps are jumps, not walks. Two checkpoints (Daniel: fewer): the middle landing and the top; no creature but him
//   SPELLS   his chase in Node: asleep until you are through; over the landing ahead of you, never within reach; he casts nothing while he
//            or you are off the screen; every spell from its fight's tell, and only what the flight teaches (the first: fire alone); fire and
//            ice turn on a shield, the death mark does not - and stepped out of it finds no one and he flinches open; a stone wall stops a
//            bolt; he moves on when you reach his landing; at the top he goes through the door and is gone. The marks are his fight's
//   HARDER   (claude/undead3, Daniel 2026-09-29: "the chase more difficult, boss music, he blocks sections until you hit him with fire walls")
//            ONE checkpoint on the stair (the middle landing; boarding the carpet sets the door one); spells closer together (CHASE.gap,
//            settle) and his firebolt in pairs from the third flight, every tell still his fight's full tell; THREE flights SEALED by his
//            ward - a column of his light the fill cannot pass, each ward alone - and he hangs over it; only a FIRE WALL breaks it: strike
//            the flight's brazier and it rolls up the stair, climbs the ward, burns him; he flinches and flees on. The first seal is taught
//            (a sign, the brazier ringed), the other two are not. Waiting does nothing, a blow on him does nothing.
//            UNDEAD4 (Daniel 2026-09-29): the brazier's fire BURNS YOU TOO - it flares first (the tell), burns once, no shield, and a jump
//            clears it; the last seal's brazier he SNUFFS as you come at it (told, once) and a second brazier behind you relights the way.
//            Every hero, no god mode, climbs past all three seals with the lab's stair bot (src/lab.js chaseClimb)
//   MUSIC    his fight's track from the first step of the stair (the ring's far side), and on into the fight without a break
//   PAGE     walk into the ring on the parapet and come out at the foot, zoomed out; climb all six flights with the game's own physics
//            (a jump at every edge, god mode); every tell begins with him on the screen; the carpet at the top starts his fight as it
//            always did (bossActive, on the carpet, in his hall); a death after the middle landing wakes you there, and him ahead of you
// usage: node tools/tower-chase.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { TOWER } from '../src/tower-ascent.js';
import { SPIRAL, FLIGHTS, TOP, CHASE, perchOf, updateMageChase } from '../src/spiral-chase.js';
import * as SC from '../src/spiral-chase.js';   /* (the seals, read off the namespace: on a stair with none, each assertion fails by name) */
import { MAGE } from '../src/undead-mage.js';
import { MARK, ANSWER } from '../src/marks.js';
import { carpetBox } from '../src/carpet.js';
import { openPage } from './cdp.mjs';

const L = LEVELS.find(l => l.id === 'fallingtower').build(), W = L.W, TS = 16, at = (x, y) => L.grid[y * W + x];
const S = L.spiral, inS = e => e.x >= S.x0 && e.x <= S.x1 && e.y >= S.top && e.y < S.floor;
const std = (x, y) => [T.SOLID, T.ONEWAY, T.PLANK].includes(at(x, y + 1)) && at(x, y) === T.AIR;   /* somewhere to stand: floor under, air in */
// ---- PORTAL ----
const rings = L.ents.filter(e => e.t === 'ringdoor'), way = rings.find(e => e.to), foot = rings.find(e => e.id === (way && way.to));
assert.ok(way && foot && rings.length === 2, 'his ring on the parapet and the one it lets you out of: ' + JSON.stringify(rings));
assert.ok(way.x === 36 && way.y === TOWER.SKY && at(way.x, way.y + 1) === T.SOLID, 'his ring stands on the parapet where the door into his hall stood: ' + way.x + ',' + way.y);
assert.ok(inS(foot) && std(foot.x, foot.y) && foot.y === S.floor - 1, 'it lets you out on the spiral stair\'s floor: ' + foot.x + ',' + foot.y);
assert.ok(W > TOWER.W && S.x0 > TOWER.W + 4, 'the stair tower stands east of the tower\'s own wall, solid rock between: ' + S.x0);
for (let y = S.top; y < S.floor; y++) for (let x = TOWER.X1 + 1; x < S.x0; x++) assert.equal(at(x, y), T.SOLID, 'rock between the tower and the stair at ' + x + ',' + y);
assert.ok(L.sanctum.rug && L.carpetAt.x === L.sanctum.in.x && L.carpetAt.y === L.sanctum.in.y, 'the carpet lies at the door into his hall');
assert.ok(L.carpetAt.x >= S.x0 * TS && L.carpetAt.x <= S.x1 * TS && L.carpetAt.y === TOP.row * TS, 'and both are at the top of the spiral stair, not on the parapet: ' + JSON.stringify(L.carpetAt));
const R = floodReach(L, T, { rides: true, across: 5 });
assert.ok(R.seen.has(foot.x + ',' + foot.y), 'the fill (a real jump) does not come through his ring to the stair\'s foot');
assert.ok(R.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the fill does not climb the stair to the carpet');
{ const shut = floodReach({ ...L, ents: L.ents.map(e => e === way ? { ...e, to: null } : e) }, T, { rides: true });
  assert.ok(![...shut.seen].some(k => { const [x, y] = k.split(',').map(Number); return inS({ x, y }); }), 'the stair is reached WITHOUT his ring: the portal is not the way in');
  assert.ok(!shut.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'the carpet is reached without his ring'); }
// ---- SPIRAL ----
assert.ok(L.interiors.some(i => i[4] === 'spiral' && i[0] === S.x0 && i[1] === S.x1), 'the stair tower is a room of its own (the newel is painted: fallen_tower.js \'spiral\')');
assert.equal(FLIGHTS.length, 6, 'six flights'); FLIGHTS.forEach((F, k) => { if (k) assert.equal(F.dir, -FLIGHTS[k - 1].dir, F.name + ' runs the same way as the flight under it: it does not wind');
  const [lx, ll] = F.land; assert.ok(lx === S.x0 || lx + ll - 1 === S.x1, F.name + '\'s landing is not against a wall');
  if (k) assert.ok(F.land[2] < FLIGHTS[k - 1].land[2], F.name + ' does not climb'); });
assert.equal(new Set(FLIGHTS.map(F => JSON.stringify(F.steps.map(s => [s[1], s[3] || ''])))).size, 6, 'two flights are the same shape (no repeated shapes in a level)');
const up = floodReach({ ...L, START: { x: foot.x, y: foot.y } }, T, { rides: true, across: 5 });
for (const F of FLIGHTS) { for (const [x0, len, row] of [...F.steps, F.land]) assert.ok([...Array(len)].some((_, i) => up.seen.has((x0 + i) + ',' + (row - 1))), F.name + ': the step at ' + x0 + ',' + row + ' is never stood on with a real jump'); }
assert.ok(up.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'from the foot, a real jump does not reach the carpet');
{ const short = floodReach({ ...L, START: { x: foot.x, y: foot.y } }, T, { rides: true, across: 3 });
  assert.ok(!short.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'THE RULE BITES: a jump of three columns climbs the whole stair - its gaps are walks, not jumps'); }
const checks = L.ents.filter(e => e.t === 'check' && inS(e)), h0 = S.floor - 1, h1 = TOP.row;
assert.equal(checks.length, 1, 'ONE checkpoint on the stair (Daniel 2026-09-29: "checkpoints 2 -> 1"): ' + checks.map(e => e.x + ',' + e.y));
assert.ok(checks.every(e => (h0 - e.y) / (h0 - h1) > 0.4 && (h0 - e.y) / (h0 - h1) < 0.7), 'it is in the middle of the climb: ' + checks.map(e => e.y));
for (const e of checks) assert.ok(std(e.x, e.y) && up.seen.has(e.x + ',' + e.y), 'a checkpoint nobody stands at: ' + e.x + ',' + e.y);
assert.ok(std(L.carpetAt.x / TS - 5, TOP.row), 'the carpet\'s retry spot (five tiles back from it) is not on the top floor');
assert.ok(L.crumbles.filter(c => c.kind === 'spiral').length >= 3, 'the tower\'s failing stone is on the stair (its last use)');
// ---- SEALS: his ward on three flights, broken only by the brazier's fire wall ----
const seals = (L.spiral && L.spiral.seals) || [];
assert.equal(seals.length, 3, 'three flights sealed by his ward: ' + seals.length);
assert.ok(typeof SC.wardOf === 'function' && typeof SC.lightBrazier === 'function' && typeof SC.updateSeals === 'function', 'the ward, the brazier and its fire are not in spiral-chase.js');
assert.ok(seals[0].teach && seals[0].k === 0 && !seals[1].teach && !seals[2].teach, 'the FIRST seal is taught and the other two are not: ' + seals.map(s => s.k + (s.teach ? 't' : '')));
assert.ok(L.ents.some(e => e.t === 'sign' && inS(e) && /BRAZIER/.test(e.text) && e.y > FLIGHTS[0].land[2]), 'no sign on the first flight teaches the brazier');
for (const s of seals) { const F = FLIGHTS[s.k], w = SC.wardOf(s.k);
  assert.ok(w && w.x === s.x && s.y1 - s.y0 + 1 >= 6, F.name + ': the ward is not a column taller than any jump: ' + JSON.stringify(w));
  for (let y = s.y0; y <= s.y1; y++) assert.equal(at(s.x, y), T.SOLID, F.name + ': the ward is open at ' + s.x + ',' + y);
  assert.ok(std(s.bx, s.by) && up.seen.has(s.bx + ',' + s.by), F.name + ': its brazier stands where nobody stands: ' + s.bx + ',' + s.by);
  const beyond = F.land[2] - 1, lx = F.dir > 0 ? F.land[0] + 1 : F.land[0] + F.land[1] - 2;
  const kept = floodReach({ ...L, START: { x: foot.x, y: foot.y }, ents: L.ents.filter(e => !(e.t === 'ward' && e.flight === s.k)) }, T, { rides: true, across: 5 });
  assert.ok(!kept.seen.has(lx + ',' + beyond) && !kept.jumpNear(L.carpetAt.x / TS, L.carpetAt.y / TS), 'THE WARD BITES: with ' + F.name + '\'s ward standing the fill still gets past it (' + lx + ',' + beyond + ')'); }
const foes = L.ents.filter(e => inS(e) && !['check', 'sign', 'coin', 'silver', 'ringdoor', 'mend', 'deco', 'ward'].includes(e.t));
assert.deepEqual(foes.map(e => e.t), ['magechase'], 'the stair is his chase and nothing else\'s: ' + foes.map(e => e.t));
// ---- SPELLS: the chase in Node ----
assert.ok(MARK['magechase|fireTell'] === '!' && MARK['magechase|iceTell'] === '!' && MARK['magechase|markTell'] === '!!', 'his marks are not his fight\'s');
assert.ok(ANSWER['magechase|fireTell'] === 'block' && ANSWER['magechase|markTell'] === 'dodge', 'the answers: guard the fire, step out of the mark');
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(/\(e\.t === 'magechase' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)\)/.test(src.split('\n').find(l => l.startsWith('const windingUp =')) || ''), 'his tells are not windups: no mark is drawn over him');
  assert.ok(/function hurtEnemy0\([^)]*\) \{[\s\S]{0,600}if\(e\.t==='magechase'\)return;/.test(src), 'a blow that reaches him does something: he is chased, not fought'); }
const rig = (o = {}) => { const P = { x: foot.x * TS + 8, y: (foot.y + 1) * TS, ground: true, dead: 0 }, hits = [], said = [];
  const e = { t: 'magechase', alive: true, mode: 'sleep', modeT: 0, x: 0, y: 0, face: -1, anim: 0 };
  const c = { P, hit: (x, y, d, hard, blow) => hits.push({ d, hard, blow }), say: m => said.push(m), sound: () => {}, onScreen: () => o.seen !== false,
    /* (the old rigs climb a stair whose wards are already burnt; the seal rigs below hand it wards that stand) */
    seals: seals.map(s => ({ ...s, broken: true })),
    solid: (x, y) => { const tx = Math.floor(x / TS), ty = Math.floor(y / TS); if (c.seals.some(s => s.broken && tx === s.x && ty >= s.y0 && ty <= s.y1)) return false; return at(tx, ty) === T.SOLID; }, inSpiral: p => p.x >= S.x0 * TS && p.x < (S.x1 + 1) * TS && p.y >= S.top * TS && p.y <= S.floor * TS };
  const run = (s, each) => { for (let i = 0; i < s * 60; i++) { updateMageChase(e, 1 / 60, c); if (each) each(); } };
  return { P, e, c, hits, said, run }; };
const stand = (P, x, row) => { P.x = x * TS + 8; P.y = row * TS; P.ground = true; };
{ const r = rig(); r.P.x = 20 * TS; r.P.y = 60 * TS; r.run(3); assert.equal(r.e.mode, 'sleep', 'he wakes before you are through his ring');
  stand(r.P, foot.x, foot.y + 1); r.run(0.1); const p = perchOf(0); assert.ok(r.e.mode === 'wake' && r.e.x === p.x && r.e.y === p.y, 'through the ring, he is not over the first landing: ' + [r.e.mode, r.e.x, r.e.y]); }
{ const r = rig({ seen: false }), tells = new Set(); stand(r.P, 96, 118); r.run(20, () => { if (/Tell$/.test(r.e.mode)) tells.add(r.e.mode); });
  assert.equal(tells.size + r.e.shots.length + r.hits.length, 0, 'he casts from off the screen: ' + [...tells]); }
{ const r = rig(), tells = new Set(), starts = []; let last = ''; stand(r.P, 96, 118);
  r.run(20, () => { if (/Tell$/.test(r.e.mode)) { tells.add(r.e.mode); if (r.e.mode !== last) starts.push(r.e.modeT); } last = r.e.mode; });
  assert.deepEqual([...tells], ['fireTell'], 'the first flight is FIRE alone, and it is cast: ' + [...tells]);
  assert.ok(starts.every(t => t >= MAGE.tell.fire - 0.02), 'the fire is told for less than his fight tells it: ' + starts);
  assert.ok(r.hits.length >= 3 && r.hits.every(h => !h.hard && h.blow === 'fire' && h.d === MAGE.dmg.fire), 'the fire lands as his fight\'s own blockable bolt: ' + JSON.stringify(r.hits.slice(0, 3)));
  const p = perchOf(0), [, , lr] = FLIGHTS[0].land; assert.ok(p.y <= (lr - CHASE.up) * TS && (lr * TS - p.y) / TS >= 4, 'he waits within reach of his landing');
  stand(r.P, FLIGHTS[0].land[0] + 1, lr); r.run(0.05); assert.equal(r.e.mode, 'fly', 'you reach his landing and he does not move on');
  r.run(3); const q = perchOf(1); assert.ok(Math.hypot(r.e.x - q.x, r.e.y - q.y) < 6, 'he does not wait over the next landing'); }
{ const r = rig(); stand(r.P, FLIGHTS[0].land[0] + 1, FLIGHTS[0].land[2]); r.run(0.1); r.e.reached = 0; stand(r.P, 92, 111); const kinds = new Set(); r.run(12, () => { for (const s of r.e.shots) kinds.add(s.kind); });
  assert.ok(kinds.has('ice') && kinds.has('fire'), 'the broken stair is fire and frost: ' + [...kinds]); assert.ok(r.hits.every(h => !h.hard), 'the frost is not blockable'); }
{ const q = rig(); stand(q.P, FLIGHTS[1].land[0] + 1, FLIGHTS[1].land[2]); q.run(0.1); stand(q.P, 94, 101); let laid = false;
  for (let i = 0; i < 600 && !q.e.deathMark; i++) updateMageChase(q.e, 1 / 60, q.c); laid = !!q.e.deathMark; assert.ok(laid, 'the failing stair has no death mark');
  q.run(CHASE.markFuse + 0.1); assert.ok(q.hits.some(h => h.blow === 'mark' && h.hard && h.d === MAGE.dmg.mark), 'left in it, the mark does not land unblockable');
  const s = rig(); stand(s.P, FLIGHTS[1].land[0] + 1, FLIGHTS[1].land[2]); s.run(0.1); stand(s.P, 94, 101);
  for (let i = 0; i < 600 && !s.e.deathMark; i++) updateMageChase(s.e, 1 / 60, s.c); stand(s.P, 99, 99); s.run(CHASE.markFuse + 0.1);
  assert.ok(!s.hits.some(h => h.blow === 'mark'), 'stepped out of, the mark still lands'); assert.equal(s.e.mode, 'gather', 'the mark that finds no one does not open him (the fight\'s opening, shown)'); }
{ const r = rig(); stand(r.P, 96, 118); r.run(0.1); r.e.shots.push({ x: (S.x1 + 0.5) * TS, y: 115 * TS, vx: 150, vy: 0, r: 5, dmg: 14, kind: 'fire', t: 4 }); r.run(0.2); assert.ok(!r.e.shots.some(q => q.x > (S.x1 + 1) * TS), 'a bolt flies on through the stone wall'); }
{ const r = rig(); stand(r.P, TOP.check, TOP.row + 1); r.run(0.1); assert.ok(!r.e.alive, 'a retry at the top finds him still on the stair: he is through his door');
  const q = rig(); stand(q.P, FLIGHTS[4].land[0] + 1, FLIGHTS[4].land[2]); q.run(0.1); stand(q.P, TOP.check + 2, TOP.row + 1); q.run(4); assert.ok(!q.e.alive, 'you reach the top and he does not go through his door'); }

/// ---- SEALS in Node: he waits over a ward, only its brazier's fire breaks it ----
assert.ok(CHASE.gap <= 0.6 && CHASE.settle <= 0.35 && CHASE.pairFrom <= 2, 'his spells are no closer together than they were (gap ' + CHASE.gap + ', settle ' + CHASE.settle + ')');
const fresh = () => seals.map(s => ({ ...s, wall: null, broken: false, doused: false, snuffing: false }));
{ const r = rig(), broke = []; r.c.seals = fresh(); r.c.breakWard = (s, quiet) => broke.push([s.k, !!quiet]); const s0 = r.c.seals[0];
  stand(r.P, 96, 118); r.run(1.5); assert.ok(Math.abs(r.e.x - (s0.x * TS + 8)) < 6 && Math.abs(r.e.y - (s0.y0 + 1) * TS) < 8, 'he does not hang over the first ward: ' + [r.e.x, r.e.y]);
  stand(r.P, 101, 116); r.run(20); assert.ok(!s0.broken && !broke.length && Math.abs(r.e.x - (s0.x * TS + 8)) < 6, 'the ward opens (or he leaves it) with no fire: waiting at it is enough');
  assert.ok(r.hits.length >= 3, 'held at the ward, he does not cast at you: ' + r.hits.length);
  assert.equal(SC.lightBrazier(s0), true, 'the brazier does not light'); assert.equal(SC.lightBrazier(s0), false, 'a lit brazier lights a second fire');
  /* IT BURNS YOU TOO (undead4): standing in its road you are burnt, once, no shield, and only after its flare */
  const n0 = r.hits.length; let t = 0, firstAt = -1; stand(r.P, 99, 116);
  for (; t < 600 && !s0.broken; t++) { updateMageChase(r.e, 1 / 60, r.c); if (firstAt < 0 && r.hits.slice(n0).some(h => h.blow === 'wardfire')) firstAt = t / 60; }
  const burns = r.hits.slice(n0).filter(h => h.blow === 'wardfire');
  assert.ok(s0.broken && broke.some(b => b[0] === 0 && !b[1]), 'the brazier\'s fire does not break the ward: ' + JSON.stringify(broke));
  assert.ok(t / 60 < 5, 'the fire takes ' + (t / 60).toFixed(1) + ' s to reach him');
  assert.ok(burns.length === 1 && burns[0].hard && burns[0].d === SC.SEAL.dmg, 'standing in its road, the brazier\'s fire does not burn you (once, unblockable): ' + JSON.stringify(burns));
  assert.ok(firstAt >= SC.SEAL.kindle, 'the brazier\'s fire burns you before its flare is done: ' + firstAt);
  assert.ok(SC.SEAL.tall + 2 < 3.2 * TS, 'the brazier\'s fire stands taller than the lowest real jump');
  assert.equal(r.e.mode, 'burnt', 'the fire reaches him and he does not flinch'); r.run(2.5); const q = perchOf(1);
  assert.ok(Math.hypot(r.e.x - q.x, r.e.y - q.y) < 8 && r.e.fled === 1, 'his ward burnt, he does not flee on up the stair: ' + [r.e.mode, r.e.x, r.e.y, q.x, q.y]);
  /* ...and JUMPED, it misses: feet over its top as it goes by */
  const j = rig(); j.c.seals = fresh(); const t0 = j.c.seals[0]; stand(j.P, 96, 118); j.run(1.5); SC.lightBrazier(t0); const m0 = j.hits.length;
  for (let i = 0; i < 600 && !t0.broken; i++) { const w = t0.wall; stand(j.P, 99, 116); if (w && !(w.kindle > 0) && Math.abs(w.x - j.P.x) < 24) { j.P.y = 116 * TS - (SC.SEAL.tall + 4); j.P.ground = false; } updateMageChase(j.e, 1 / 60, j.c); }
  assert.ok(t0.broken && !j.hits.slice(m0).some(h => h.blow === 'wardfire'), 'jumped, the brazier\'s fire still burns you'); }
/* SEAL 3 (undead4): he snuffs its brazier as you come at it - told, once - and the brazier behind you relights the way */
{ const r = rig(), broke = []; r.c.seals = fresh(); r.c.breakWard = (s, quiet) => broke.push([s.k, !!quiet]); const s5 = r.c.seals[2];
  assert.ok(s5.k === 5 && s5.rx !== null && s5.rx !== undefined && !r.c.seals[0].rx && !r.c.seals[1].rx, 'only the third seal has a second brazier: ' + r.c.seals.map(s => s.rx));
  assert.ok(std(s5.rx, s5.ry) && up.seen.has(s5.rx + ',' + s5.ry) && (s5.rx - s5.bx) * FLIGHTS[5].dir < 0, 'the second brazier does not stand behind the first, on the flight, where you stand: ' + [s5.rx, s5.ry]);
  stand(r.P, FLIGHTS[4].land[0] + 1, FLIGHTS[4].land[2]); r.run(1.5); assert.ok(Math.abs(r.e.x - (s5.x * TS + 8)) < 6, 'he is not over the last ward');
  stand(r.P, 98, 82); r.run(1); assert.ok(!s5.doused && !s5.snuffing, 'he snuffs it before you come at it');
  stand(r.P, s5.bx + 3, s5.by + 1); let tellT = 0; for (let i = 0; i < 120 && !s5.doused; i++) { updateMageChase(r.e, 1 / 60, r.c); if (r.e.mode === 'snuffTell') tellT += 1 / 60; }
  assert.ok(s5.doused && tellT >= SC.SEAL.snuff - 0.03, 'coming at it, he does not snuff the brazier - told for ' + SC.SEAL.snuff + ' s (told ' + tellT.toFixed(2) + ')');
  assert.ok(MARK['magechase|snuffTell'] === '', 'the snuff throws no blow and must wear no mark');
  assert.equal(SC.lightBrazier(s5), false, 'a snuffed brazier still lights');
  r.run(3); assert.equal(s5.doused, true, 'it lights itself again'); let snuffs = 0; for (let i = 0; i < 300; i++) { updateMageChase(r.e, 1 / 60, r.c); if (r.e.mode === 'snuffTell') snuffs++; } assert.equal(snuffs, 0, 'he snuffs more than once');
  assert.equal(SC.lightBrazier(s5, 'relight'), true, 'the brazier behind you does not light');
  assert.ok(Math.abs(s5.wall.pts[0][0] - (s5.rx * TS + 8)) < 1 && s5.wall.pts.some(p => Math.abs(p[0] - (s5.bx * TS + 8)) < 40), 'its fire does not start behind you and carry past the dark one');
  stand(r.P, 104, 83); for (let i = 0; i < 600 && !s5.broken; i++) updateMageChase(r.e, 1 / 60, r.c);
  assert.ok(s5.broken && broke.some(b => b[0] === 5 && !b[1]), 'the relit fire does not break the last ward'); }
{ const r = rig(), broke = []; r.c.seals = fresh(); r.c.breakWard = (s, quiet) => broke.push([s.k, !!quiet]);
  stand(r.P, FLIGHTS[2].land[0] + 1, FLIGHTS[2].land[2]); r.run(1.2); const s3 = r.c.seals[1];
  assert.ok(broke.some(b => b[0] === 0 && b[1]) && r.c.seals[0].broken && !s3.broken, 'waking on the middle landing, the ward under it is not burnt (quietly) and the one over it standing: ' + JSON.stringify(broke));
  assert.ok(Math.abs(r.e.x - (s3.x * TS + 8)) < 6, 'waking on the middle landing, he is not over the next ward: ' + [r.e.x, s3.x * TS + 8]);
  let pair = 0; stand(r.P, 94, 94); r.run(15, () => { const f = r.e.shots.filter(q => q.kind === 'fire' && q.t > 3.9).length; pair = Math.max(pair, f); });
  assert.equal(pair, 2, 'from the third flight his firebolt does not come in a pair: ' + pair); }
// ---- PAGE ----
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const CI = FLIGHTS.findIndex(F => F.check), CK = FLIGHTS[CI], CKX = checks.find(e => e.y === CK.land[2] - 1).x;
const pg = await openPage({ audio: false, fonts: false }); let r;
try {
  r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const SC=await import('/src/spiral-chase.js');const AU=await import('/src/audio.js');const LB=await import('/src/lab.js');BK.manualSimulation=true;const out={casts:[],offCast:0,heroes:{}};
   const boot=(h='knight',god=true)=>{BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';AU.music.play(BK.L.music||'theme');BK.god=god;BK.sim(10);};   /* (the level's own track, as a start from the map plays it: BK.load leaves the music alone) */
   const through=()=>{BK.tp(33,${TOWER.SKY});BK.sim(5);out.tune0??=AU.music.want;for(let i=0;i<90;i++){BK.keys.right=true;BK.sim(1);}BK.keys.right=false;BK.sim(20);BK.step(1);};
   const chase=()=>BK.enemies().find(e=>e.t==='magechase');
   /* 1. NO FIRE, NO WAY ON: the bot that never strikes a brazier is held at the first ward */
   boot();through();{const m=chase();out.tuneFoot=AU.music.want;LB.chaseClimb(BK,m,{secs:25,strike:false});const s=(BK.L.spiral.seals||[])[0]||{};
     out.held={x:BK.P.x,y:BK.P.y,broken:s.broken,wardX:s.x*16,m:[Math.round(m.x),Math.round(m.y)],perch:[s.x*16+8,(s.y0+1)*16]};}
   /* 2. THE CLIMB (the lab's stair bot: braziers struck, their fire jumped, the snuffed one relit from behind) */
   boot();through();
   out.foot=[Math.floor(BK.P.x/16),Math.round(BK.P.y/16)-1];out.view=BK.view.VW;
   const m=chase();out.woke=m&&m.mode!=='sleep';let last='';
   const res=LB.chaseClimb(BK,m,{secs:150,each:t=>{if(t%3===0)BK.step(1);if(m.alive&&/Tell$/.test(m.mode)&&m.mode!==last){const v=BK.view,on=m.x>v.x&&m.x<v.x+v.VW&&m.y-46>v.y&&m.y<v.y+v.VH;out.casts.push(m.mode+(BK.telling(m)?BK.markOf(m):'?'));if(!on)out.offCast++;}last=m.alive?m.mode:'gone';}});
   out.secs=Math.round(res.t/60);out.sealsBroken=(BK.L.spiral.seals||[]).filter(s=>s.broken).length;out.doused=BK.L.spiral.seals.map(s=>!!s.doused);
   BK.sim(30);const A=BK.L.arena;out.fight=!!BK.bossActive;out.carpet=!!BK.carpet();out.inHall=BK.P.x>A.x0&&BK.P.x<A.x1&&BK.P.y>A.y0&&BK.P.y<A.floor;out.chaseGone=!m.alive;
   out.tuneFight=AU.music.want;out.musicGap=BK.bossMusicT;
   /* 3. EVERY HERO GETS UP IT: no god mode (health held up, the hurt counted), every seal with its own jump */
   for(const h of ${JSON.stringify(HEROES)}){boot(h,false);through();const q=LB.chaseClimb(BK,chase(),{secs:150,refill:true});out.heroes[h]={carpet:!!BK.carpet(),secs:Math.round(q.t/60),taken:Math.round(q.taken),burnt:q.burnt,seals:BK.L.spiral.seals.filter(s=>s.broken).length};}
   boot();BK.tp(${CKX},${CK.land[2] - 1});BK.sim(30);BK.tp(${FLIGHTS[CI + 1].steps[0][0] + 1},${FLIGHTS[CI + 1].steps[0][2] - 1});BK.sim(2);BK.god=false;BK.P.hp=0;BK.P.dead=0.01;BK.sim(400);BK.god=true;BK.sim(60);
   const m2=chase();out.respawn=[Math.floor(BK.P.x/16),Math.round(BK.P.y/16)-1];out.m2=m2&&[m2.mode,Math.round(m2.x/16),Math.round(m2.y/16)];out.tuneRespawn=AU.music.want;
   out.wards=(BK.L.spiral.seals||[]).map(s=>s.broken);
   return out;})()`, 900000);
} finally { pg.close(); }
const tune = L.arena.music || 'boss';
assert.ok(Math.abs(r.foot[0] - foot.x) <= 2 && r.foot[1] === foot.y, 'walking into his ring on the parapet does not put you at the spiral\'s foot: ' + JSON.stringify(r));
assert.ok(r.woke, 'he does not wake when you come through'); assert.ok(r.view > 320, 'the stair is not seen zoomed out: ' + r.view);
assert.ok(r.tune0 !== tune && r.tuneFoot === tune, 'HIS MUSIC is not up from the first step of the stair (' + r.tune0 + ' on the parapet, ' + r.tuneFoot + ' at the foot, want ' + tune + ')');
assert.ok(r.tuneFight === tune && !(r.musicGap > 0), 'his music breaks off when the fight starts: ' + [r.tuneFight, r.musicGap]);
assert.equal(r.tuneRespawn, tune, 'a death on the stair and his music is not back on waking there');
assert.ok(!r.held.broken && !(r.held.y <= FLIGHTS[0].land[2] * TS && r.held.x >= r.held.wardX) && r.held.y > FLIGHTS[1].land[2] * TS && Math.abs(r.held.m[0] - r.held.perch[0]) < 8, 'THE SEAL: without a brazier struck the climb gets past his first ward (or he leaves it): ' + JSON.stringify(r.held));
assert.equal(r.sealsBroken, 3, 'the climb striking braziers does not burn all three wards: ' + r.sealsBroken);
assert.deepEqual(r.doused, [false, false, true], 'on the way up he does not snuff the last seal\'s brazier (and only that one): ' + r.doused);
assert.ok(r.fight && r.carpet && r.inHall && r.chaseGone, 'the climb with the game\'s own jump does not reach the carpet, or the carpet does not start his fight: ' + JSON.stringify(r));
assert.ok(r.casts.length >= 6 && r.casts.some(c => c.startsWith('fireTell')) && r.casts.some(c => c.startsWith('markTell')), 'he hardly casts on the way up: ' + r.casts);
assert.ok(r.casts.every(c => (c.startsWith('markTell') ? c.endsWith('!!') : c.startsWith('snuffTell') ? !c.endsWith('!') && !c.endsWith('?') : c.endsWith('!') && !c.endsWith('!!'))), 'a spell told with the wrong mark (or none): ' + r.casts);
assert.equal(r.offCast, 0, 'a spell begun with him off the screen');
for (const h of HEROES) { const q = r.heroes[h]; assert.ok(q && q.carpet && q.seals === 3, h + ' does not get up the stair past all three seals with its own jump: ' + JSON.stringify(q)); }
const mid = CK.land, s4 = seals.find(s => s.k === CI + 1), p4 = s4 ? SC.sealPerch(s4) : perchOf(CI + 1);
assert.ok(r.respawn[1] === mid[2] - 1 && r.respawn[0] >= mid[0] - 1 && r.respawn[0] <= mid[0] + mid[1], 'a death after the middle landing does not wake you there: ' + JSON.stringify(r.respawn));
assert.ok(r.m2 && r.m2[0] !== 'sleep' && Math.abs(r.m2[1] * TS - p4.x) < 24 && Math.abs(r.m2[2] * TS - p4.y) < 24, 'after it he is not waiting over the next flight (its ward): ' + JSON.stringify(r.m2));
assert.deepEqual(r.wards, seals.map(s => s.k <= CI), 'waking on the middle landing, the wards are not burnt under it and standing over it: ' + r.wards);
console.log(`ok  tower-chase   his ring on the parapet to a ${S.x1 - S.x0 + 1}x${S.floor - S.top}-tile spiral stair (six flights, one checkpoint, climbed with a real jump in ${r.secs} s), his music from the first step, three wards burnt only by their braziers' fire (it burns you too - jumped; the last one snuffed and relit from behind), ${r.casts.length} told casts on the way (${[...new Set(r.casts)].join(' ')}), none off the screen, every hero up it (${HEROES.map(h => h + ' ' + r.heroes[h].secs + 's/' + r.heroes[h].taken + 'hp/' + r.heroes[h].burnt + 'burnt').join(', ')}), and the carpet at the top starts his fight`);
