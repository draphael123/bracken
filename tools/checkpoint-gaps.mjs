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
import { THIN, CHECK_DROP } from '../src/checkpoint-thin.js';

export const MAX = 175, MIN = 80;
const KNOWN = new Map([
]);
/* judge(): one level's checkpoints along its route -> the reasons it fails. `at` sorted route positions of the checkpoints ON the route, `end` where the route
   meets the boss's trigger, `doors` route positions where it first enters a boss, mini or ambush room (null = never enters: a flight fight). */
export function judge({ at, end, doors }) {
  const bad = [], on = at.filter(c => c < end), isDoor = new Set();
  for (const d of doors) { const e = d === null ? end : d, before = on.filter(c => c <= e);
    if (!before.length) { bad.push('NO DOOR: nothing stands before the room at route ' + e); continue; }
    const c = before[before.length - 1]; isDoor.add(c); if (e - c > MAX) bad.push('NO DOOR: the room at route ' + e + ' has its checkpoint ' + (e - c) + ' tiles back'); }
  const stops = [0, ...on, end]; let worst = 0, worstAt = 0;
  for (let i = 1; i < stops.length; i++) { const g = stops[i] - stops[i - 1]; if (g > worst) { worst = g; worstAt = stops[i - 1]; } }
  if (worst > MAX) bad.push('TOO SPARSE: ' + worst + ' route tiles with no checkpoint, from route tile ' + worstAt);
  for (let i = 1; i < on.length; i++) if (on[i] - on[i - 1] < MIN && !isDoor.has(on[i]) && !isDoor.has(on[i - 1])) bad.push('TOO DENSE: checkpoints at route ' + on[i - 1] + ' and ' + on[i] + ', ' + (on[i] - on[i - 1]) + ' apart (not a door one)');
  return { bad, worst, count: on.length };
}
/* THE RULE BITES: made-up levels */
{ const ok = { at: [140, 290, 430], end: 450, doors: [420] };
  assert.equal(judge(ok).bad.length, 0, 'a level of spaced shrines with a door one passes');
  assert(judge({ at: [140, 430], end: 450, doors: [420] }).bad.some(b => /TOO SPARSE/.test(b)), 'a 290-tile run fails');
  assert(judge({ at: [50, 100, 150, 200, 250, 300, 350, 400], end: 420, doors: [] }).bad.some(b => /TOO DENSE/.test(b)), 'a shrine every 50 tiles fails');
  assert(judge({ at: [], end: 150, doors: [120] }).bad.some(b => /NO DOOR/.test(b)), 'a room with no shrine before it fails');
  assert(judge({ at: [100], end: 450, doors: [420] }).bad.some(b => /NO DOOR: the room/.test(b)), 'a room whose shrine is 320 back fails');
  assert(judge({ at: [140, 260, 280], end: 450, doors: [285] }).bad.every(b => !/DENSE/.test(b)), 'two shrines close together pass when one is the door one'); }
const bad = [], stale = [], rows = []; let total = 0;
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  let r; try { r = pacing(lv); } catch (e) { bad.push(lv.id + ': the route could not be measured (' + e.message + ')'); continue; }
  const s = r.stats, j = judge({ at: s.checkAt, end: s.endAt, doors: s.doors.map(d => d.at === null && d.c !== 'B' ? undefined : d.at).filter(d => d !== undefined) });
  rows.push([lv.id, j.worst]); total += s.checksTotal;
  if (j.bad.length && !KNOWN.has(lv.id)) bad.push(lv.id + ' (' + s.checksOnRoute + '/' + s.checksTotal + ' checkpoints on the route):\n      ' + j.bad.join('\n      '));
  if (!j.bad.length && KNOWN.has(lv.id)) stale.push(lv.id + ': now passes - delete its KNOWN line in tools/checkpoint-gaps.mjs');
}
/* A DROP THAT NAMES NOTHING IS A HOLE FOR THE NEXT CHECKPOINT PUT ON THAT TILE: every src/checkpoint-thin.js entry must be a checkpoint some level still builds */
{ THIN.off = true; const gone = []; try { for (const lv of LEVELS) { if (!CHECK_DROP[lv.id]) continue; const have = lv.build().ents.filter(e => e.t === 'check'); for (const [x, y] of CHECK_DROP[lv.id]) if (!have.some(e => e.x === x && e.y === y)) gone.push(lv.id + ' @' + x + ',' + y); } } finally { THIN.off = false; }
  for (const id of Object.keys(CHECK_DROP)) if (!LEVELS.some(l => l.id === id)) gone.push(id + ' (no such level)');
  assert.equal(gone.length, 0, gone.length + ' CHECK_DROP entr(y/ies) name no checkpoint - rerun node tools/checkpoint-thin.mjs --write: ' + gone.join(', ')); }
for (const [id, why] of KNOWN) console.log('  known  ' + id.padEnd(8) + why);
assert.equal(stale.length, 0, 'a KNOWN level no longer needs its entry:\n  ' + stale.join('\n  '));
assert.equal(bad.length, 0, bad.length + ' level(s) break the checkpoint rule (one per section: at most ' + MAX + ' route tiles apart, at least ' + MIN + ', one before every door):\n  ' + bad.join('\n  '));
rows.sort((a, b) => b[1] - a[1]);
console.log('checkpoint-gaps  ' + rows.length + ' levels, ' + total + ' checkpoints; along the walked route none is more than ' + MAX + ' from the next (worst ' + rows[0].join(' ') + '), none closer than ' + MIN + ' except a door one, and one stands before every boss, mini and ambush room.');
