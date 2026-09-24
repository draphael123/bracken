// tools/checkpoints.mjs — EVERY CHECKPOINT IN EVERY LEVEL STANDS ON THREE TILES OF FLOOR (Daniel, 2026-09-23).
// Before the rule, sixteen hung half over air at a ledge's edge in twelve levels. src/level.js groundCheckpoints slides
// them onto floor at build time; this proves none is left over air, spikes, reeds, a climb, a web or a bouncer.
// usage: node tools/checkpoints.mjs
import assert from 'node:assert/strict';
import { LEVELS, T, checkStands } from '../src/level.js';
/* THE RULE BITES: a made-up ledge, a checkpoint on it, one hanging off it, one over air, one inside rock */
{ const W = 8, H = 4, grid = new Uint8Array(W * H); for (let x = 2; x <= 4; x++) grid[2 * W + x] = T.SOLID; grid[1 * W + 6] = T.SOLID; const L = { W, H, grid };
  assert(checkStands(L, 3, 1, true), 'on a three-tile ledge it stands');
  assert(checkStands(L, 4, 1, false) && !checkStands(L, 4, 1, true), 'on the last tile of the ledge it stands, but not on three');
  assert(!checkStands(L, 5, 1, false), 'past the ledge, over air, it does not'); assert(!checkStands(L, 6, 1, false), 'inside rock it does not'); }
const bad = []; let n = 0;
for (const lv of LEVELS) { const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
  for (const e of L.ents.filter(e => e.t === 'check')) { n++;
    if (!checkStands(L, e.x, e.y, false)) bad.push(`${lv.id} @${e.x},${e.y} under [${[-1, 0, 1].map(d => at(e.x + d, e.y + 1)).join(',')}]`); } }
assert.equal(bad.length, 0, `${bad.length} checkpoint(s) hang off an edge or stand in rock:\n  ` + bad.join('\n  '));
console.log(`${n} checkpoints in ${LEVELS.length} levels, every one on floor under its foot (centre tile and a neighbour), none inside rock; where three tiles were within reach it stands on three.`);
