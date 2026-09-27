// tools/ground-depth.mjs — NO SEAM IN THE GROUND UNDER A STEP (level review, 2026-09-24).
//
// The ground is shaded by how far under the open air a tile lies: the dirt turns to the darker fill and the ground light
// lays a heavier shadow the deeper it goes. It was counted down each column from that column's own surface, so a block
// raised two or three rows was deeper, row for row, than the ground beside it, and every step left a darker stripe from
// the step to the bottom of the screen. main.js's groundDepth() now blends across; this reads it out of main.js and
// asks it of every built level, for both of the depths the renderer takes from it (rock, and anything solid):
//   no two tiles side by side in the same run of rock differ by more than one row of depth,
//   and (proved on a made-up pillar, below) a block a few columns wide raised over the ground has no shadow of its own
//   under it: at the ground's row and below it is exactly as deep as the ground beside it
// usage: node tools/ground-depth.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { LEVELS, T } from '../src/level.js';

const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const m = MAIN.match(/\n(function groundDepth\(W, H, solidAt, cap\) \{[\s\S]*?\n\})/);
assert(m, 'cannot read groundDepth out of src/main.js');
assert(/rockDeep\[y \* LW \+ x\]/.test(MAIN) && /groundDeep\[y \* LW \+ x\]/.test(MAIN), 'the renderer does not take its depths from groundDepth');
const groundDepth = new Function('return ' + m[1])();
const ROCK = new Set([T.SOLID]), SOLIDISH = new Set([T.SOLID, T.CRATE, T.PALISADE, T.SOFT, T.ICE, T.CLIMB, T.WEB]);   /* as solidish in main.js */

/* THE RULE BITES: ground at row 5, a three-wide pillar standing three rows over it */
{ const W = 12, H = 12, grid = new Uint8Array(W * H); for (let x = 0; x < W; x++) for (let y = 5; y < H; y++) grid[y * W + x] = 1; for (let x = 5; x <= 7; x++) for (let y = 2; y < 5; y++) grid[y * W + x] = 1;
  const D = groundDepth(W, H, (x, y) => x >= 0 && y >= 0 && x < W && y < H && grid[y * W + x] === 1, 18);
  assert.equal(D[8 * W + 6], D[8 * W + 2], 'a pillar three wide casts its own shadow into the ground under it'); }

const seams = [], per = {};
for (const lv of LEVELS) { const L = lv.build(), W = L.W, H = L.H;
  for (const [name, S, cap] of [['rock', ROCK, 18], ['solid', SOLIDISH, 9]]) {
    const at = (x, y) => x < 0 || x >= W ? true : y < 0 || y >= H ? false : S.has(L.grid[y * W + x]);   /* off the sides is rock and over the top is air, as tileAt */
    const D = groundDepth(W, H, at, cap);
    for (let y = 0; y < H; y++) for (let x = 0; x + 1 < W; x++) if (at(x, y) && at(x + 1, y) && Math.abs(D[y * W + x] - D[y * W + x + 1]) > 1) {
      (per[lv.id] ||= 0); per[lv.id]++; if (seams.length < 12) seams.push(`${lv.id} ${name} ${x}|${x + 1},${y}: ${D[y * W + x]} beside ${D[y * W + x + 1]}`); } } }
const n = Object.values(per).reduce((a, b) => a + b, 0);
assert.equal(n, 0, `${n} seam(s) in the ground's depth in ${Object.keys(per).length} level(s) - ${Object.entries(per).map(([k, v]) => k + ' ' + v).join(', ')}:\n  ` + seams.join('\n  '));
console.log(`ground-depth: ${LEVELS.length} levels, rock and solid: no seam under any step; a narrow block casts no shadow of its own.`);
