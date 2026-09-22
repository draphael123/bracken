// tools/tide-reaver.mjs — THE TIDE REAVER (src/tide-reaver.js), in Node: every attack is told and lands as its mark says, and the
// OPENING IS CAUSED - the same cast opens him only when it finds no one (jumped or rolled through); guarded or taken, it opens nothing.
import assert from 'node:assert/strict';
import { updateTideReaver, reaverTake, reaverOpen, REAVER } from '../src/tide-reaver.js';

const A = { x0: 0, x1: 300, floor: 200 };
function rig(px, answer) {   /* answer: what the hero does when a blow reaches them - 'take' | 'block' | 'dodge' */
  const P = { x: px, y: A.floor, dead: false }, hits = [], said = [];
  const c = { P, A, rnd: () => 0.3, say: m => said.push(m), sound: () => {}, shake: () => {}, ring: () => {}, pull: x => { P.x = x; },
    hit: (x, d, hard, name) => { hits.push({ name, hard }); return answer === 'block' && !hard ? 'blocked' : answer === 'dodge' ? false : undefined; } };
  const e = { x: 150, y: A.floor, face: -1, alive: true, hp: 300, maxHp: 300, dealt: true, mode: 'stalk', cd: 0, turn: 0 };
  return { P, e, c, hits, said };
}
const run = (r, secs) => { for (let t = 0; t < secs; t += 1 / 60) updateTideReaver(r.e, 1 / 60, r.c); };
const cast = answer => { const r = rig(20, answer); r.e.mode = 'castTell'; r.e.modeT = 0; run(r, 1.2); return r; };

// 1. a cast that finds no one sticks in the wall: he is disarmed, fetches it, and every blow counts twice until he has it back
{ const r = rig(20, 'take'); r.P.y = A.floor - 60;   /* in the air over the line the whole time */
  r.e.mode = 'castTell'; r.e.modeT = 0; let open = false, twice = false;
  let openT = 0; for (let t = 0; t < 6; t += 1 / 60) { updateTideReaver(r.e, 1 / 60, r.c); if (reaverOpen(r.e)) { open = true; openT += 1 / 60; twice ||= reaverTake(r.e, 10) === 20; } }
  assert(openT > 2 && openT < REAVER.disarmMax + 1.2, 'the opening lasts ' + openT.toFixed(2) + ' s');
  assert(open && twice, 'a cast that finds no one opens him, and the opening counts twice');
  assert.equal(r.hits.length, 0, 'a jumped cast does not hit'); assert(!reaverOpen(r.e), 'he re-arms'); }
// 2. rolled through (untouchable): the same as a jump
{ const r = cast('dodge'); let open = false; for (let t = 0; t < 3; t += 1 / 60) { updateTideReaver(r.e, 1 / 60, r.c); open ||= reaverOpen(r.e); } assert(open, 'a cast rolled through opens him'); }
// 3. guarded: he hauls it back and nothing opens
{ const r = cast('block'); let open = false; for (let t = 0; t < 3; t += 1 / 60) { updateTideReaver(r.e, 1 / 60, r.c); open ||= reaverOpen(r.e); }
  assert(!open, 'a guarded cast opens nothing'); assert.equal(r.hits[0].name, 'THE CAST'); assert.equal(r.hits[0].hard, false, 'the cast is blockable'); }
// 4. taken: it bites, he reels the hero in, and the thrust comes after it - still no opening
{ const r = rig(20, 'take'); r.e.mode = 'castTell'; r.e.modeT = 0; let open = false, reeled = false, modes = new Set();
  for (let t = 0; t < 3; t += 1 / 60) { updateTideReaver(r.e, 1 / 60, r.c); open ||= reaverOpen(r.e); modes.add(r.e.mode); reeled ||= Math.abs(r.P.x - r.e.x) <= REAVER.reelTo + 1; }
  assert(!open, 'a cast that bites opens nothing'); assert(reeled, 'the hero is reeled in'); assert(modes.has('reelThrust'), 'the thrust follows the reel');
  assert.deepEqual(r.hits.map(h => h.name).slice(0, 2), ['THE CAST', 'THE THRUST']); }
// 5. the rake is unblockable and a jump clears it; the thrust is blockable
{ const r = rig(120, 'block'); r.e.mode = 'rakeTell'; r.e.modeT = 0; run(r, 0.05); assert.deepEqual(r.hits, [{ name: 'THE LOW RAKE', hard: true }]);
  const j = rig(120, 'take'); j.P.y = A.floor - 40; j.e.mode = 'rakeTell'; j.e.modeT = 0; run(j, 0.05); assert.equal(j.hits.length, 0, 'jumped');
  const t = rig(100, 'block'); t.e.mode = 'thrustTell'; t.e.modeT = 0; run(t, 0.05); assert.deepEqual(t.hits, [{ name: 'THE THRUST', hard: false }]); }
// 6. the undertow: a wave from the far wall that hits the grounded and misses the jumper; phase two brings it into his round
{ const r = rig(60, 'take'); r.e.phase = 2; r.e.mode = 'undertowTell'; r.e.modeT = 0; run(r, 2); assert.deepEqual(r.hits, [{ name: 'THE UNDERTOW', hard: true }]);
  const j = rig(60, 'take'); j.e.phase = 2; j.e.mode = 'undertowTell'; j.e.modeT = 0; j.P.y = A.floor - 40; run(j, 2); assert.equal(j.hits.length, 0, 'the wave is jumped');
  const p = rig(120, 'take'); p.e.hp = 140; let seen = false; p.e.cd = 0; for (let t = 0; t < 30 && !seen; t += 1 / 60) { updateTideReaver(p.e, 1 / 60, p.c); seen ||= p.e.mode === 'undertowTell'; if (p.P.dead) break; }
  assert(seen && p.e.phase === 2, 'under half he brings the sea'); }
// 7. no tell is shorter than half a second, and none shortens in phase two
for (const [k, v] of Object.entries(REAVER.tell)) assert(v >= 0.5, k + ' tell ' + v);
console.log('The Tide Reaver: four told attacks as marked, and the cast opens him only when it finds no one (jumped or rolled), never when guarded or taken.');
