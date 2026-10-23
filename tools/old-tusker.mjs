// tools/old-tusker.mjs - OLD TUSKER's FIGHT, PURE (claude/oldtusker; src/old-tusker.js). Node only, no page.
//   B15  never invulnerable: outside his openings every blow lands at >= 0.4 (his hide; WARDED after a pin), a plunge on his back whole
//   B1   THE RULE IS THE OPENING: four strokes fell a marked pine; landing on him PINS him (x2, told) - and a pin is worth at most OT.pin.cap of him (he heaves it off)
//   B3   the ward after a pin: a pine felled on him then bounces off
//        (claude/tuskerfix) A STANDING PINE IS NO OBSTACLE (he charges past it; no cover); a FELLED trunk is: his charge RAMS it (DAZED) and it splinters, his walk stops at it
//   B5   phase two at half: the double charge (a charge that misses turns at the wall) and the stomp's waves
//   node tools/old-tusker.mjs
import assert from 'node:assert/strict';
import * as OTM from '../src/old-tusker.js';
import { LEVELS } from '../src/level.js';
const { OT } = OTM; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const L = LEVELS.find(l => l.id === 'wood').build(), A = L.arena;
ok(A.boss === 'oldtusker' && A.pines.length === 4, 'the Lumber Trail\'s boss is OLD TUSKER, with four marked pines');
const fresh = () => { const S = OTM.newFight(OTM.geom(A, 16)); const e = { t: 'oldtusker', x: (A.x0 + A.x1) / 2, y: A.floor, hp: OT.hp, maxHp: OT.hp, face: -1, mode: 'walk', modeT: 0, alive: true }; return { S, e }; };
const said = []; const W = { number: (x, y, t) => said.push(t), sound() {}, shake() {}, music() {}, mark() {}, dust() {}, fx() {}, splinter() {}, trunkBlow: d => { said.push('trunk' + d); }, hit() {}, hitHero() {} };
/* B15 */
{ const { S, e } = fresh(); const [d, w] = OTM.takeBlow(e, S, 20, false); ok(d === 8 && w === 'THICK HIDE', 'his hide: a cut lands at 0.4 and says THICK HIDE'); ok(OTM.takeBlow(e, S, 20, true)[0] === 20, 'a plunge on his back lands whole');
  S.ward = 2; ok(OTM.takeBlow(e, S, 20, false)[0] >= 8 && OTM.takeBlow(e, S, 20, false)[1] === 'WARDED', 'warded: still 0.4, never nothing (B15)');
  for (const m of ['walk', 'chargeTell', 'charge', 'sweepTell', 'sweep', 'rootTell', 'stompTell', 'recover', 'turn', 'thrash']) { const e2 = { ...e, mode: m }; S.ward = 0; ok(OTM.takeBlow(e2, S, 10, false)[0] >= 4, 'B15 floor in ' + m); } }
/* B1 + the purse */
{ const { S, e } = fresh(); const p = S.pines[0]; e.x = (OTM.lineOf(p)[0] + OTM.lineOf(p)[1]) / 2;
  for (let k = 0; k < OT.pine.strokes; k++) OTM.strokePine(S, p, W); ok(p.st === 'fall', 'four strokes fell a marked pine');
  for (let t = 0; t < OT.pine.fall + 0.05; t += 1 / 60) OTM.stepTusker(e, S, 1 / 60, [{ x: A.x0 + 4, y: A.floor, ground: true, alive: true }], W);
  ok(e.mode === 'pinned' && OTM.otOpen(e) && S.n.pinned === 1, 'the pine lands on him: PINNED, open');
  ok(OTM.takeBlow(e, S, 10, false)[0] === 20, 'pinned: x2');
  let got = 0; for (let k = 0; k < 40 && e.mode === 'pinned' && e.modeT > 0; k++) got += OTM.takeBlow(e, S, 30, false)[0];
  ok(got + 20 <= OT.hp * OT.pin.cap + 1 && e.modeT === 0, 'a pin is worth ' + OT.pin.cap + ' of him at most, then he heaves the trunk off (' + (got + 20) + ')');
  for (let t = 0; t < 1; t += 1 / 60) OTM.stepTusker(e, S, 1 / 60, [{ x: A.x0 + 4, y: A.floor, ground: true, alive: true }], W);
  ok(S.ward > 0 && p.st === 'spent', 'B3: he heaves it off into a ward; the pine is spent');
  const q = S.pines[1]; e.x = (OTM.lineOf(q)[0] + OTM.lineOf(q)[1]) / 2; e.mode = 'walk'; for (let k = 0; k < 4; k++) OTM.strokePine(S, q, W);
  for (let t = 0; t < OT.pine.fall + 0.05; t += 1 / 60) { S.ward = Math.max(S.ward, 1); OTM.stepTusker(e, S, 1 / 60, [{ x: A.x0 + 4, y: A.floor, ground: true, alive: true }], W); }
  ok(e.mode !== 'pinned' && S.n.bounced === 1, 'in his ward a pine felled on him bounces off'); }
/* (claude/tuskerfix, Daniel 10-21) A STANDING PINE IS NO OBSTACLE; A FELLED TRUNK IS: his charge rams it (DAZED) and it splinters; his walk stops at it */
{ const { S, e } = fresh(); const st = OTM.chargeStop(S, e.x, -1);
  ok(!st.pine && st.x === A.x0 + OT.w / 2 + 2, 'his charge runs past the standing pines to the wall (none of them stops or dazes him)');
  ok(!OTM.chargeStop(S, e.x, 1).pine, 'east too: no standing pine stops his charge');
  /* fell the west inner pine while he stands well east of it: it misses him and lies across the floor */
  const west = S.pines.filter(p => p.dir > 0).sort((a, b) => b.x - a.x)[0], H = [{ x: A.x0 + 4, y: A.floor, ground: true, alive: true }];
  e.x = A.x1 - 60; S.restT = 99; for (let k = 0; k < OT.pine.strokes; k++) OTM.strokePine(S, west, W);
  for (let t = 0; t < OT.pine.fall + 0.05; t += 1 / 60) { S.restT = 99; OTM.stepTusker(e, S, 1 / 60, H, W); }
  ok(west.st === 'down' && e.mode !== 'pinned', 'a pine that misses him lies across the floor as a trunk');
  for (let t = 0; t < 5; t += 1 / 60) { S.restT = 99; OTM.stepTusker(e, S, 1 / 60, H, W); }
  ok(west.st === 'down' && OT.pine.lie >= 10, 'the trunk stays down (a wall), not a beat (' + OT.pine.lie + ' s)');
  const st2 = OTM.chargeStop(S, e.x, -1); ok(st2.pine && st2.pine.id === west.id && st2.x === OTM.lineOf(west)[1] + OT.w / 2 + 3, 'his charge west now stops at the east end of the trunk');
  ok(OTM.trunkBetween(S, e.x, A.x0 + 10) && !OTM.trunkBetween(S, e.x, e.x - 10), 'the trunk lies between him and a hero beyond it (and not one in front of it)');
  /* his walk stops at it */
  const walkTo = x => { e.mode = 'walk'; S.restT = 99; for (let t = 0; t < 8; t += 1 / 60) { S.restT = 99; OTM.stepTusker(e, S, 1 / 60, [{ x, y: A.floor, ground: true, alive: true }], W); } };
  walkTo(A.x0 + 10); ok(Math.abs(e.x - st2.x) < 1, 'he walks up to the trunk and stops: he never walks over it (' + Math.round(e.x) + ' vs ' + Math.round(st2.x) + ')');
  /* the charge rams it: DAZED, and the trunk splinters (spent) */
  e.x = A.x1 - 60; e.face = -1; e.mode = 'chargeTell'; e.modeT = 0.001; let saw = null;
  for (let t = 0; t < 3 && !saw; t += 1 / 60) { OTM.stepTusker(e, S, 1 / 60, H, W); if (e.mode === 'rammed') saw = e.x; }
  ok(saw !== null && Math.abs(saw - st2.x) < 1 && OTM.otOpen(e) && said.includes(OTM.OT_SAY.dazed), 'a charge that meets the trunk RAMS it: DAZED, open, told');
  ok(west.st === 'spent' && S.n.trunkRams === 1 && west.t === OT.pine.rearm, 'the trunk splinters after one ram (spent; the treeline re-arms it later)');
  ok(OTM.takeBlow(e, S, 20, false)[0] === Math.round(20 * OT.daze.mul), 'dazed off a trunk: x' + OT.daze.mul);
  /* the same charge with nothing down runs past the standing pine to the wall */
  for (const p of S.pines) if (p.st !== 'spent') { p.st = 'stand'; p.hp = OT.pine.strokes; }
  e.x = A.x1 - 60; e.face = -1; e.mode = 'chargeTell'; e.modeT = 0.001; saw = null; const r0 = S.n.rammed;
  for (let t = 0; t < 4 && !saw; t += 1 / 60) { OTM.stepTusker(e, S, 1 / 60, H, W); if (e.mode === 'rammed') saw = e.x; }
  ok(saw !== null && saw < S.pines.filter(p => p.st === 'stand').reduce((m, p) => Math.min(m, p.x), 1e9) && S.n.rammed === r0 + 1 && said.includes(OTM.OT_SAY.dazedWall), 'with no trunk down, his charge runs past every standing pine and only the wall stops him'); }
/* no cover: his tusk sweep reaches a hero standing behind a standing pine */
{ const { S, e } = fresh(); const p = S.pines[0]; const hits = []; const W2 = { ...W, hit: (bx, d, name) => hits.push([name, bx]) };
  e.x = p.x + 40; e.face = -1; e.mode = 'sweep'; e.modeT = 0.2; OTM.stepTusker(e, S, 1 / 60, [{ x: p.x - 6, y: A.floor, ground: true, alive: true }], W2);
  const sw = hits.find(h => h[0] === 'sweep'); ok(sw && sw[1][0] < p.x - 4, 'a standing pine is no cover: his sweep reaches past it'); }
/* B5 */
{ const { S, e } = fresh(); e.hp = OT.hp * OT.p2 - 1; OTM.stepTusker(e, S, 1 / 60, [{ x: e.x - 200, y: A.floor, ground: true, alive: true }], W); ok(S.ph === 2 && e.mode === 'stompTell', 'at half his blood is up: phase two opens on the stomp'); }
ok(OT.hp > 0 && OT.hide >= 0.4 && OT.wardMul >= 0.4 && OT.pin.mul >= 1.5 && OT.pin.mul <= 2, 'the numbers keep B15 (>= 0.4) and the opening at 1.5-2x');
ok(OT.bz && OT.bz.hurt > 1 && OT.bz.hurt <= 3, 'the Berserker takes his gores and tusks at a multiple (claude/tuskerbz): ' + OT.bz.hurt);
console.log('old-tusker: ' + n + ' checks - B15 floor, the pine pins him (capped), the ward, the felled trunk he rams (and the standing pines he does not), phase two.');
