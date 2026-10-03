// tools/djinn.mjs - THE DJINN OF THE GREAT WELL, held to Daniel's brief (claude/welltown5, 2026-10-03). Node only: the pure fight (src/djinn.js) is
// stepped against a fake world, no page; and the level and the tables that wire him.
//   EVERY MOVE TOLD          his moves by phase, each told mode wearing its mark in src/marks.js (! blockable, !! not), the breath HIGH (a duck goes under)
//   EVERY CYCLE CHANGES      no two cycles of a phase play the same order
//   HE ALWAYS FIGHTS         stepped alone for minutes in each phase he is never idle longer than his longest gap, and a minute alone opens nothing
//   EVERY OPENING IS WATER   P1 a pour turns him to MUD (and whirling, after, water is flung off: told); P2 he burns, a pour DOUSES him, and he FLARES back
//                            (told); P3 the flood rises and the great bucket down the shaft BAILS him out onto a ledge; his slammed hand glints and is struck;
//                            each opening >= 3 s, x openMul, capped; OPEN_RULE.djinn is the same predicate; the lines are in src/hint-lines.js
//   THE LEVEL                THE WELL TOWN's boss is the Djinn in the old well's hall; the Queen is benched (her module and stage are still callable)
// node tools/djinn.mjs
import assert from 'node:assert/strict';
import * as DJG from '../src/djinn.js';
import { MARK, HEIGHT, BY_HAND } from '../src/marks.js';
import { OPEN_RULE } from '../src/boss-greed.js';
import { CALL_LINES } from '../src/hint-lines.js';
import { LEVELS } from '../src/level.js';
import * as CQG from '../src/cistern-queen.js';
const { DJ, CYCLES, MOVES } = DJG;
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; console.log('  ok  ' + m); };

/* THE BRIEF'S MOVES, by phase */
const SPEC = { 1: { 'sand lash': 'lash', 'sand blast': 'blast', 'dust devil': 'devil' }, 2: { 'fire lash': 'flash', 'fire breath': 'breath', 'flame pillars': 'pillars' }, 3: { 'water spout grab': 'spout', 'wave': 'wave', 'hand slam': 'slam' } };
for (const ph of [1, 2, 3]) { const used = new Set(CYCLES[ph].flat()); for (const [nm, k] of Object.entries(SPEC[ph])) ok(used.has(k), 'P' + ph + ' ' + nm + ' (' + k + ') is in his phase-' + ph + ' cycles'); }
for (const [mode, m] of Object.entries(MOVES)) { const k = 'djinn|' + mode; ok(BY_HAND[k] === m.mark && MARK[k] === m.mark, k + ' wears ' + m.mark + ' (src/marks.js agrees)'); if (m.h === 'high') ok(HEIGHT[k] === 'high', k + ' is HIGH: a duck goes under it'); }
for (const ph of [1, 2, 3]) { const keys = CYCLES[ph].map(c => c.join(',')); ok(new Set(keys).size === keys.length && keys.length >= 3, 'phase ' + ph + ': ' + keys.length + ' cycles, no two the same order'); }

/* A FAKE WORLD */
const A = { djinn: { sx: 528, F: 56, vault: 40, top: 28, lr: 48 } }, G = DJG.geom(A, 16);
const said = [];
const world = () => ({ hit() {}, band() {}, number: (x, y, t) => said.push(t), sound() {}, fx() {}, shake() {}, music() {}, mark() {}, water() {}, grab: () => null, free: () => true, holdAt() {}, release() {} });
function run(secs, o = {}) {
  const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid + 80, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'wake', modeT: 2, open: 0, alive: true };
  const hero = [{ x: o.x ?? G.mid - 60, y: G.floor, ground: true, alive: true, onLedge: o.ledge || null, pp: { snare: 0 } }], seen = new Set(); let idle = 0, maxIdle = 0, maxOpen = 0; const c = world();
  for (let t = 0; t < secs; t += 1 / 60) { if (o.hp) e.hp = o.hp(t, e); if (o.each) o.each(t, e, S, c, hero[0]); DJG.stepDjinn(e, S, 1 / 60, hero, c); seen.add(e.mode);
    if (e.mode === 'walk' || e.mode === 'hover') { idle += 1 / 60; maxIdle = Math.max(maxIdle, idle); } else idle = 0; maxOpen = Math.max(maxOpen, e.open || 0); }
  return { S, e, seen, maxIdle, maxOpen, c, hero: hero[0] };
}
{ const r = run(120); ok(r.maxOpen === 0 && r.maxIdle <= 1.0, 'P1, two minutes alone: nothing opens him and he is never idle more than ' + r.maxIdle.toFixed(2) + ' s'); ok(['lashTell', 'blastTell', 'devilTell'].every(m => r.seen.has(m)), 'P1: the lash, the blast and the dust devil come'); }
{ const r = run(120, { hp: () => 600 }); ok(r.S.ph === 2 && r.S.burn && r.maxOpen === 0 && ['flashTell', 'breathTell', 'pillarTell'].every(m => r.seen.has(m)), 'P2: he catches fire and stays alight alone; the fire lash, the breath and the pillars come');
  ok(said.includes('HE CATCHES FIRE: DOUSE HIM WITH WATER'), 'P2 is told: HE CATCHES FIRE: DOUSE HIM WITH WATER'); }
{ const r = run(120, { hp: () => 300 }); ok(r.S.ph === 3 && r.S.flood && r.S.water >= DJ.waterH - 0.5 && r.S.pose === 'column' && ['spoutTell', 'waveTell', 'slamTell'].every(m => r.seen.has(m)) && r.maxOpen === 0, 'P3: the hall floods, he rises in the shaft, the spout, the wave and the hand slam come - and alone nothing opens him');
  ok(r.S.n.hands > 0 && said.includes('HIS HAND RESTS THERE: STRIKE IT'), 'P3: his slammed hand stays on the ledge, told (HIS HAND RESTS THERE: STRIKE IT)'); }
/* THE OPENINGS */
ok(DJ.openT >= 3 && DJ.openCap > 0 && DJ.openCap <= 0.15, 'his openings last ' + DJ.openT + ' s (>= 3), and one takes no more than ' + DJ.openCap * 100 + '% of him');
{ const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 1000, maxHp: 1000, face: -1, mode: 'walk', modeT: 1, open: 0, alive: true }, c = world();
  ok(DJG.pourAim(e, S, { x: G.mid - 50, y: G.floor, face: 1 }) && !DJG.pourAim(e, S, { x: G.mid - 50, y: G.floor, face: -1 }) && !DJG.pourAim(e, S, { x: G.mid - 200, y: G.floor, face: 1 }), 'a pour reaches him only facing him, near');
  ok(DJG.pourAt(e, S, { x: G.mid - 50, y: G.floor, face: 1 }, c) === 'open' && e.mode === 'mud' && e.open >= 3 && DJG.djOpen(e) && OPEN_RULE.djinn(e), 'P1: a pour turns him to MUD - open (OPEN_RULE agrees)');
  for (let i = 0; i < 60 * 4; i++) DJG.stepDjinn(e, S, 1 / 60, [{ x: G.mid - 50, y: G.floor, ground: true, alive: true, pp: {} }], c);
  ok(!DJG.djOpen(e) && S.wary > 0 && said.includes('HE DRIES BACK TO SAND'), 'he dries back to sand (told) and WHIRLS');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'off' && !DJG.djOpen(e) && said.includes('HE WHIRLS: THE WATER IS FLUNG OFF'), 'whirling, a pour is flung off him (told)'); }
{ const S = DJG.newShow(G), e = { t: 'djinn', x: G.mid, y: G.floor, hp: 600, maxHp: 1000, face: -1, mode: 'walk', modeT: 1, open: 0, alive: true }, c = world(), H = [{ x: G.mid - 50, y: G.floor, ground: true, alive: true, pp: {} }];
  for (let i = 0; i < 90; i++) DJG.stepDjinn(e, S, 1 / 60, H, c);
  ok(S.ph === 2 && S.burn, 'into phase two: he burns');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'open' && e.mode === 'doused' && !S.burn && said.includes('DOUSED: SMOKE AND CLAY. CUT HIM'), 'P2: a pour DOUSES him - open, the fire out (told)');
  ok(DJG.pourAt(e, S, { x: e.x - 50, y: G.floor, face: 1 }, c) === 'wasted' || !DJG.pourAim(e, S, { x: e.x - 50, y: G.floor, face: 1 }), 'open, a second pour is not taken');
  let t = 0; for (; t < 20 && !S.burn; t += 1 / 60) DJG.stepDjinn(e, S, 1 / 60, H, c);
  ok(S.burn && S.n.flares === 1 && said.includes('HE FLARES UP: DOUSE HIM AGAIN') && t > DJ.openT + DJ.douseT, 'he FLARES and burns again (told) ' + t.toFixed(1) + ' s after the douse: douse him again'); }
{ const r = run(30, { hp: () => 300, each: (t, e, S, c, h) => { if (S.pose === 'column' && e.mode === 'hover' && S.bucket.st === 'up' && !S.struck) { S.struck = 1; S.bucket.who = { x: G.ledgeE[0] + 30, onLedge: 'E' }; DJG.strikeWindlass(e, S, c); } } });
  ok(r.S.n.bailed >= 1 && said.includes('THE BUCKET BAILS HIM OUT: CUT HIM'), 'P3: the great bucket down the shaft BAILS him out (told)');
  ok(r.maxOpen >= 3, 'and he lies spilled on the ledge, open ' + r.maxOpen.toFixed(1) + ' s'); }
{ const S = DJG.newShow(G); S.hand = { x: G.ledgeE[0] + 30, y: G.ledgeY - 6, stay: 1, landed: true }; ok(DJG.handOut(S) && OPEN_RULE.djinn({ mode: 'reach', open: 0, hand: 1 }) && !OPEN_RULE.djinn({ mode: 'reach', open: 0, hand: 0 }), 'his slammed hand is out (and OPEN_RULE lets a blow on it land)'); }
/* THE LINES, THE LEVEL, THE BENCH */
const lines = [...new Set(said)].filter(s => !/^!+$/.test(s)); ok(lines.every(s => CALL_LINES.has(s)), 'every line he says is a teaching line in src/hint-lines.js (' + lines.length + ')');
{ const lv = LEVELS.find(l => l.id === 'welltown'), L = lv.build(); ok(L.arena.boss === 'djinn' && L.ents.some(e => e.t === 'djinn') && !L.ents.some(e => e.t === 'cisternqueen'), "THE WELL TOWN's boss is THE DJINN in the old well's hall; the Cistern Queen is not placed");
  ok(typeof CQG.stageCisternQueen === 'function' && typeof CQG.stepQueen === 'function', 'the Cistern Queen is benched, not deleted: her stage and her fight are still callable (tools/cistern-queen.mjs holds her)'); }
console.log('djinn: ' + n + ' checks pass');
