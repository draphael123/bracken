/* tools/checkpoint-gaps.mjs - CHECKPOINTS ARE SPACED, ONE PER SECTION: NO MORE THAN 175 ROUTE TILES BETWEEN THEM, NO TWO CLOSER THAN 80, AND ONE BEFORE EVERY DOOR.
   Node only: no page.

   THE RULE CHANGED (Daniel, 2026-09-28, the Salt & Sanctuary direction: "too many checkpoints is part of the problem"). Until then this held only a
   CEILING (B6, 150 route tiles) and the filler (src/level.js checkpoints()) put one every 72 columns, so the campaign stood four hundred of them, one
   every ~45 walked tiles: a death cost a few seconds and nothing else. Now a level has one checkpoint per SECTION, about every 120-160 walked route
   tiles, and always one right before each boss door, mini arena and ambush room. This measures all three along the walked route (tools/pacing.mjs:
   the main route, start to the boss's trigger), and it fails
     TOO SPARSE  a run longer than MAX (175) with no checkpoint: the picker aims for 150 and this leaves room for the walk to differ a little
     TOO DENSE   two checkpoints closer than MIN (80) route tiles - the drift back to a shrine on every corner - unless one of the two is a DOOR
                 checkpoint (the last one before a boss, mini or ambush room, RULES Q5/S4, which stands where the room needs it)
     NO DOOR     a boss, mini or ambush room the route enters with no checkpoint before it, or one more than MAX back
   tools/checkpoint-thin.mjs picks them (fewest that meet the rule, from the walked route) and src/checkpoint-thin.js holds what it dropped.

   THE OLD NOTES, KEPT. src/level.js checkpoints() spaces checkpoints along ONE axis: x on a wide level, and on a tall one (H > 60) the ROW. THE
   HANGING VILLAGE is a switchback: ninety tiles east along a floor, a climb, ninety tiles west, so two checkpoints fourteen rows apart were 162 walked
   tiles apart and the filler, measuring fourteen, saw nothing wrong (the review, 2026-09-24). The rule is about the way you WALK, so this measures it
   along the walked route. A SWIMMER WAKES WHERE HE SWAM OVER: pacing.mjs counts a shrine the route swims over (2026-09-25,
   docs/briefs/keep-rework-2.md). The list below can only shrink: the check fails a listed level that no longer needs its entry. */
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { pacing } from './pacing.mjs';
import { THIN, CHECK_DROP, CHECK_PIN } from '../src/checkpoint-thin.js';

import { MAX, MIN, judgeLevel } from './checkpoint-rule.mjs';
export { MAX, MIN };
const KNOWN = new Map([
]);
const bad = [], stale = [], rows = []; let total = 0;
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  let r; try { r = pacing(lv); } catch (e) { bad.push(lv.id + ': the route could not be measured (' + e.message + ')'); continue; }
  const s = r.stats, j = judgeLevel(lv, r);
  rows.push([lv.id, j.worst]); total += s.checksTotal;
  if (j.bad.length && !KNOWN.has(lv.id)) bad.push(lv.id + ' (' + s.checksOnRoute + '/' + s.checksTotal + ' checkpoints on the route):\n      ' + j.bad.join('\n      '));
  if (!j.bad.length && KNOWN.has(lv.id)) stale.push(lv.id + ': now passes - delete its KNOWN line in tools/checkpoint-gaps.mjs');
}
/* A DROP THAT NAMES NOTHING IS A HOLE FOR THE NEXT CHECKPOINT PUT ON THAT TILE: every src/checkpoint-thin.js drop and pin must be a checkpoint some level still builds */
{ THIN.off = true; const gone = []; try { for (const lv of LEVELS) { if (!CHECK_DROP[lv.id] && !CHECK_PIN[lv.id]) continue; const have = lv.build().ents.filter(e => e.t === 'check'); for (const [x, y] of [...(CHECK_DROP[lv.id] || []), ...(CHECK_PIN[lv.id] || [])]) if (!have.some(e => e.x === x && e.y === y)) gone.push(lv.id + ' @' + x + ',' + y); } } finally { THIN.off = false; }
  for (const id of [...Object.keys(CHECK_DROP), ...Object.keys(CHECK_PIN)]) if (!LEVELS.some(l => l.id === id)) gone.push(id + ' (no such level)');
  assert.equal(gone.length, 0, gone.length + ' CHECK_DROP/CHECK_PIN entr(y/ies) name no checkpoint (rerun node tools/checkpoint-thin.mjs --write for a drop; a pin is hand-edited): ' + gone.join(', ')); }
for (const [id, why] of KNOWN) console.log('  known  ' + id.padEnd(8) + why);
assert.equal(stale.length, 0, 'a KNOWN level no longer needs its entry:\n  ' + stale.join('\n  '));
assert.equal(bad.length, 0, bad.length + ' level(s) break the checkpoint rule (one per section: at most ' + MAX + ' route tiles apart, at least ' + MIN + ', one before every door):\n  ' + bad.join('\n  '));
rows.sort((a, b) => b[1] - a[1]);
console.log('checkpoint-gaps  ' + rows.length + ' levels, ' + total + ' checkpoints; along the walked route none is more than ' + MAX + ' from the next (worst ' + rows[0].join(' ') + '), none closer than ' + MIN + ' except a door one, and one stands before every boss, mini and ambush room.');
