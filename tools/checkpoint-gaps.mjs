/* tools/checkpoint-gaps.mjs - NO LEVEL WALKS MORE THAN 150 ROUTE TILES WITHOUT A CHECKPOINT (B6). Node only: no page.

   WHY THE FILLER DID NOT CATCH IT. src/level.js checkpoints() spaces checkpoints along ONE axis: x on a wide level, and on a tall one
   (H > 60) the ROW - `key = tall ? e.y : e.x`. THE HANGING VILLAGE is a switchback: you walk ninety tiles east along a floor, climb,
   and ninety tiles west along the next, so two checkpoints fourteen rows apart were 162 walked tiles apart and the filler, measuring
   fourteen, saw nothing wrong (the review, 2026-09-24: the worst gap in its group). Fixing that one row would have been a hand-placed
   checkpoint and a lie. The rule is about the way you WALK, so this measures it along the walked route - tools/pacing.mjs's main
   route, start to gate, rides on - and fails any level with a run longer than the playtest bot's own LONGGAP line (150).

   KNOWN, NOT FORGIVEN. Two other levels are over the line today, both tall ones the same axis rule measures by rows, and both belong to
   other work. They are named below with the number as measured; the check fails a listed level that no longer needs its entry, so the
   list can only shrink. */
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { pacing } from './pacing.mjs';

const LIMIT = 150;   /* src/playtest.js LONGGAP: "more than 150 columns with no checkpoint" */
const KNOWN = new Map([
  ['moor', 'GALE MOOR, measured 187 from route 753: the level-fixes lane (97dc06f) took the two checkpoints off the Sky Road kite ride, where dying soft-locked you on a spire over spikes; nothing safe stands in their place yet. For the Gale Moor rework (queued, cutting it to ~700 columns): one checkpoint on firm ground past the ride, then delete this line.'],
  ['keep', 'THE UNDERWATER KEEP, 760x64, measured 495: a 296-tile swim, and 12 of its 15 checkpoints are off the walked route by this measure. For the Keep\'s owner: a checkpoint on the swim, or teach pacing.mjs where a swimmer wakes.'],
  ['burial', 'THE BURIAL CAVERNS, 1140x112, measured 206 (from route 707): a wide level the filler measures by ROWS because it is taller than sixty. For the Burial rework\'s owner: one checkpoint near route 810, or make checkpoints() key a tall level on its route.'],
]);
const bad = [], stale = [], rows = [];
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  let r; try { r = pacing(lv); } catch (e) { bad.push(lv.id + ': the route could not be measured (' + e.message + ')'); continue; }
  const gap = r.stats.maxCheckGap; rows.push([lv.id, gap]);
  if (gap > LIMIT && !KNOWN.has(lv.id)) bad.push(lv.id + ': ' + gap + ' route tiles with no checkpoint, from route tile ' + r.stats.checkGapAtRoute + ' (' + r.stats.checksOnRoute + '/' + r.stats.checksTotal + ' checkpoints on the route)');
  if (gap <= LIMIT && KNOWN.has(lv.id)) stale.push(lv.id + ': now ' + gap + ' - delete its KNOWN line in tools/checkpoint-gaps.mjs');
}
for (const [id, why] of KNOWN) console.log('  known  ' + id.padEnd(8) + why);
assert.equal(stale.length, 0, 'a KNOWN level no longer needs its entry:\n  ' + stale.join('\n  '));
assert.equal(bad.length, 0, bad.length + ' level(s) walk more than ' + LIMIT + ' route tiles between checkpoints (B6):\n  ' + bad.join('\n  '));
rows.sort((a, b) => b[1] - a[1]);
console.log('checkpoint-gaps  ' + rows.length + ' levels measured along their walked route; the longest run with no checkpoint outside the known list is ' + (rows.find(([id]) => !KNOWN.has(id)) || ['-', 0]).join(' ') + ' route tiles (limit ' + LIMIT + ').');
