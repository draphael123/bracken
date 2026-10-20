// tools/old-tusker.mjs - OLD TUSKER's FIGHT, PURE (claude/oldtusker; src/old-tusker.js). Node only, no page.
//   B15  never invulnerable: outside his openings every blow lands at >= 0.4 (his hide; WARDED after a pin), a plunge on his back whole
//   B1   THE RULE IS THE OPENING: four strokes fell a marked pine; landing on him PINS him (x2, told) - and a pin is worth at most OT.pin.cap of him (he heaves it off)
//   B3   the ward after a pin: a pine felled on him then bounces off
//        HE RAMS A TREE: a charge stops at the first standing pine (or the wall) and he reels (DAZED); a pine is COVER from his tusk sweep
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
/* HE RAMS A TREE; cover */
{ const { S, e } = fresh(); const west = S.pines.filter(p => p.dir > 0).sort((a, b) => b.x - a.x)[0]; const st = OTM.chargeStop(S, e.x, -1);
  ok(st.pine && st.pine.id === west.id && OTM.underLine(west, st.x, OT.w / 2 - 6), 'his charge stops at the first standing pine - and the reeling boar stands under its line');
  west.st = 'spent'; const st2 = OTM.chargeStop(S, e.x, -1); ok(st2.pine && st2.pine.id !== west.id, 'a spent pine no longer stops him: the next one does');
  for (const p of S.pines) p.st = 'spent'; ok(!OTM.chargeStop(S, e.x, -1).pine, 'with none standing, the wall stops him'); }
/* B5 */
{ const { S, e } = fresh(); e.hp = OT.hp * OT.p2 - 1; OTM.stepTusker(e, S, 1 / 60, [{ x: e.x - 200, y: A.floor, ground: true, alive: true }], W); ok(S.ph === 2 && e.mode === 'stompTell', 'at half his blood is up: phase two opens on the stomp'); }
ok(OT.hp > 0 && OT.hide >= 0.4 && OT.wardMul >= 0.4 && OT.pin.mul >= 1.5 && OT.pin.mul <= 2, 'the numbers keep B15 (>= 0.4) and the opening at 1.5-2x');
console.log('old-tusker: ' + n + ' checks - B15 floor, the pine pins him (capped), the ward, the ram and the cover, phase two.');
