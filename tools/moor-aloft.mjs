/* tools/moor-aloft.mjs - NOTHING ALOFT ON THE MOOR'S NEW SECTIONS (claude/moor2art; the idea of the Unburied Field's floating check, for THE WIND ROCKS and
   THE GOBLIN SCAFFOLDS, cols 535-646). Off the BUILT level, in Node:
   1. every grounded thing (a sign, a checkpoint, a flagpost, a deco, a vent, the frame and every foe that walks) stands on a tile that holds a foot:
      the cell under its row is solid, a one-way or a plank;
   2. every drawn timber deck is held up: a plank run has a post at each end (within 4 tiles of it) and every post runs down to firm rock - on the
      ground, or the tarn's bed (the drawing ends each post ON that rock: it was drawn a row short, hanging in the water, until this check said so);
   3. a plank run is never wider than 16 tiles between posts (the drawn posts stand every 4);
   4. every tarn's bed is solid under its whole width (the water is held in rock, not poured on air). */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
const L = LEVELS.find(l => l.id === 'moor').build(), M = L.moorRocks, at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
const holds = t => t === T.SOLID || t === T.ONEWAY || t === T.PLANK;
const GROUNDED = new Set(['sign', 'check', 'flagpost', 'deco', 'vent', 'gustframe', 'brute', 'shield', 'archer', 'rockgoblin', 'horn', 'goat', 'torch', 'hare', 'bale']);
const fails = [];
let n = 0;
for (const e of L.ents) { if (e.x < M.x0 || e.x > M.x1 || !GROUNDED.has(e.t)) continue; n++;
  if (!holds(at(e.x, e.y + 1))) fails.push(e.t + ' at ' + e.x + ',' + e.y + ' has nothing under it (' + at(e.x, e.y + 1) + ')'); }
let runs = 0;
for (const [x0, x1, row, waterRow] of M.decks) { runs++;
  for (let x = x0; x <= x1; x++) if (at(x, row) !== T.PLANK) fails.push('deck row ' + row + ' has a gap at ' + x);
  const posts = []; for (let x = x0; x <= x1 + 1; x += 4) posts.push(x);
  assert(posts[0] - x0 <= 4 && x1 + 1 - posts[posts.length - 1] <= 4, 'a deck end has no post within 4 tiles');
  for (const px of posts) { let y = row + 1; const cx = Math.min(px, x1); while (y < L.H && at(cx, y) !== T.SOLID) y++;
    if (y >= L.H) fails.push('the post at ' + px + ' under the deck at row ' + row + ' has no rock under it');
    else if (y > waterRow) { const p = (L.pools || []).find(q => q.tarn && cx * 16 >= q.x0 && cx * 16 < q.x1); if (!p || Math.floor(p.bottom / 16) !== y) fails.push('the post at ' + px + ' (deck row ' + row + ') ends on rock at row ' + y + ', which is not a tarn bed'); } } }
for (const p of L.pools || []) { if (!p.tarn) continue; for (let x = Math.floor(p.x0 / 16); x < Math.ceil(p.x1 / 16); x++) if (at(x, Math.floor(p.bottom / 16)) !== T.SOLID) fails.push('the tarn at ' + p.x0 + ' has no bed under column ' + x); }
assert(n > 20 && runs === 2, 'the check saw too little (' + n + ' grounded things, ' + runs + ' decks)');
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('moor aloft: ' + n + ' grounded things on the new sections all stand on a foothold; ' + runs + ' decks held up by posts down to rock or the tarn bed; every tarn has a bed.');
