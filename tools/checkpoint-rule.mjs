/* tools/checkpoint-rule.mjs - THE CHECKPOINT RULE, ONE COPY (claude/checkpoints, 2026-09-29; RULES-LEVELS-AND-BOSSES.md S4).
   Daniel, 2026-09-28: "too many checkpoints is part of the problem". A level has one checkpoint per SECTION: at most MAX (200; it was 175 until Daniel widened it game-wide on 2026-09-30, claude/fairfix) walked route tiles
   apart, never two closer than MIN (80), and one right before each boss door, mini arena and ambush room. tools/checkpoint-gaps.mjs holds every level
   to it; the picker (tools/checkpoint-thin.mjs) chooses with it; a level's own exam tool that used to pin the old density (40..72, 100, 120) asks it instead. */
import assert from 'node:assert/strict';
import { CHECK_PIN } from '../src/checkpoint-thin.js';
export const MAX = 200, MIN = 80;
const TS = 16;
/* the checkpoint just outside the boss arena's near wall (B6): on the arena's floor row, within 14 columns of the wall */
export const arenaOutside = L => { const A = L.arena; if (!A) return []; const fy = A.floor / TS - 1;
  const c = L.ents.filter(e => e.t === 'check' && Math.abs(e.y - fy) <= 3 && (A.reverse ? e.x > A.wallR && e.x <= A.wallR + 14 : e.x < A.wallL && e.x >= A.wallL - 14)).sort((a, b) => A.reverse ? a.x - b.x : b.x - a.x);
  return c.slice(0, 1); };
/* judge(): one level's checkpoints along its route -> the reasons it fails.
     checks  [{x, y, at}] (at = route tile, null when off the route)      end  the route tile where the boss's trigger is
     doors   route tiles where the route first enters a boss, mini or ambush room (null = never enters: a flight fight, the door is `end`)
     exempt  [[x, y]] checkpoints that stand where the level needs them (the outside-the-arena one, an exam door a tool pins): like a door one they may stand closer than MIN */
export function judge({ checks, end, doors, exempt = [] }) {
  const bad = [], on = checks.filter(c => c.at !== null && c.at <= end + 30).map(c => ({ ...c, at: Math.min(c.at, end) })).sort((a, b) => a.at - b.at), door = new Set();
  const isEx = c => exempt.some(([x, y]) => x === c.x && y === c.y);
  for (const d of doors) { const e = d === null ? end : d, before = on.filter(c => c.at <= e);
    if (!before.length) { bad.push('NO DOOR: nothing stands before the room at route ' + e); continue; }
    const c = before[before.length - 1]; door.add(c); if (e - c.at > MAX) bad.push('NO DOOR: the room at route ' + e + ' has its checkpoint ' + (e - c.at) + ' tiles back'); }
  const stops = [0, ...on.map(c => c.at), end]; let worst = 0, worstAt = 0;
  for (let i = 1; i < stops.length; i++) { const g = stops[i] - stops[i - 1]; if (g > worst) { worst = g; worstAt = stops[i - 1]; } }
  if (worst > MAX) bad.push('TOO SPARSE: ' + worst + ' route tiles with no checkpoint, from route tile ' + worstAt);
  for (let i = 1; i < on.length; i++) { const a = on[i - 1], b = on[i], free = c => door.has(c) || isEx(c);
    if (b.at - a.at < MIN && !free(a) && !free(b)) bad.push('TOO DENSE: checkpoints at route ' + a.at + ' and ' + b.at + ', ' + (b.at - a.at) + ' apart (neither a door one)'); }
  return { bad, worst, count: on.length };
}
/* the level's checkpoints as pacing() saw them, judged: what a level's own exam tool calls in place of its old 40/72/100/120 asserts */
export function judgeLevel(lv, r, L = lv.build()) {
  const s = r.stats, exempt = [...(CHECK_PIN[lv.id] || []).map(([x, y]) => [x, y]), ...arenaOutside(L).map(e => [e.x, e.y])];
  return judge({ checks: s.checkList, end: s.endAt, doors: s.doors.map(d => d.at === null && d.c !== 'B' ? undefined : d.at).filter(d => d !== undefined), exempt });
}
/* A10b (Daniel 2026-10-07, after playing the pilot Marsh): FEWER SHRINES - about one per section and one before the boss, A10B.min-A10B.max walked
   route tiles apart (the rule above is >= MIN / <= MAX). REPORT-ONLY until the level sweep moves the shrines level by level: tools/checkpoint-gaps.mjs
   lists every level that misses, and fails none for it. judgeA10b -> { miss: [reasons], gaps: [route tiles between stops] }.
     SPARSE  a run longer than A10B.max with no shrine (start -> shrine -> ... -> the boss's trigger)
     DENSE   two shrines (or the start and the first) closer than A10B.min, neither a door one nor pinned (exempt)
     NO DOOR a boss/mini/ambush room with no shrine before it, or one more than A10B.max back */
export const A10B = { min: 140, max: 260 };
export function judgeA10b({ checks, end, doors, exempt = [] }) {
  const miss = [], on = checks.filter(c => c.at !== null && c.at <= end + 30).map(c => ({ ...c, at: Math.min(c.at, end) })).sort((a, b) => a.at - b.at), door = new Set();
  const isEx = c => exempt.some(([x, y]) => x === c.x && y === c.y), free = c => door.has(c) || isEx(c);
  for (const d of doors) { const e = d === null ? end : d, before = on.filter(c => c.at <= e);
    if (!before.length) { miss.push('NO DOOR: no shrine before the room at route ' + e); continue; }
    const c = before[before.length - 1]; door.add(c); if (e - c.at > A10B.max) miss.push('NO DOOR: the room at route ' + e + ' has its shrine ' + (e - c.at) + ' tiles back'); }
  const stops = [0, ...on.map(c => c.at), end], gaps = [];
  for (let i = 1; i < stops.length; i++) { const g = stops[i] - stops[i - 1]; gaps.push(g); if (g > A10B.max) miss.push('SPARSE: ' + g + ' tiles from route ' + stops[i - 1]); }
  for (let i = 0; i < on.length; i++) { const b = on[i], a = i ? on[i - 1] : null, gap = b.at - (a ? a.at : 0);
    if (gap < A10B.min && !free(b) && !(a && free(a))) miss.push('DENSE: the shrine at route ' + b.at + ' is ' + gap + ' from ' + (a ? 'the one at ' + a.at : 'the start')); }
  return { miss, gaps, count: on.length };
}
export function judgeLevelA10b(lv, r, L = lv.build()) {
  const s = r.stats, exempt = [...(CHECK_PIN[lv.id] || []).map(([x, y]) => [x, y]), ...arenaOutside(L).map(e => [e.x, e.y])];
  return judgeA10b({ checks: s.checkList, end: s.endAt, doors: s.doors.map(d => d.at === null && d.c !== 'B' ? undefined : d.at).filter(d => d !== undefined), exempt });
}
{ const cs = a => a.map(at => ({ x: at, y: 0, at }));
  assert.equal(judgeA10b({ checks: cs([200, 400]), end: 600, doors: [590] }).miss.length, 0, 'A10b: shrines ~200 apart with a door one pass');
  assert(judgeA10b({ checks: cs([150]), end: 600, doors: [] }).miss.some(b => /SPARSE/.test(b)), 'A10b: a 450-tile run is listed');
  assert(judgeA10b({ checks: cs([150, 250, 420]), end: 600, doors: [] }).miss.some(b => /DENSE/.test(b)), 'A10b: shrines 100 apart are listed'); }
export const assertRule = (lv, r, L) => { const j = judgeLevel(lv, r, L); assert.equal(j.bad.length, 0, 'checkpoints (RULES S4: one per section, at most ' + MAX + ' route tiles apart, at least ' + MIN + ', one before every door): ' + j.bad.join('; ')); return j; };
/* THE RULE BITES: made-up levels */
{ const cs = a => a.map(at => ({ x: at, y: 0, at }));
  assert.equal(judge({ checks: cs([140, 290, 430]), end: 450, doors: [420] }).bad.length, 0, 'a level of spaced shrines with a door one passes');
  assert(judge({ checks: cs([140, 430]), end: 450, doors: [420] }).bad.some(b => /TOO SPARSE/.test(b)), 'a 290-tile run fails');
  assert(judge({ checks: cs([50, 100, 150, 200, 250, 300, 350, 400]), end: 420, doors: [] }).bad.some(b => /TOO DENSE/.test(b)), 'a shrine every 50 tiles fails');
  assert(judge({ checks: [], end: 150, doors: [120] }).bad.some(b => /NO DOOR/.test(b)), 'a room with no shrine before it fails');
  assert(judge({ checks: cs([100]), end: 450, doors: [420] }).bad.some(b => /NO DOOR: the room/.test(b)), 'a room whose shrine is 320 back fails');
  assert(judge({ checks: cs([140, 260, 280]), end: 450, doors: [285] }).bad.every(b => !/DENSE/.test(b)), 'two shrines close together pass when one is the door one');
  assert(judge({ checks: cs([140, 260, 300, 430]), end: 450, doors: [] }).bad.some(b => /DENSE/.test(b)), 'two shrines forty apart fail...');
  assert(judge({ checks: cs([140, 260, 300, 430]), end: 450, doors: [], exempt: [[300, 0]] }).bad.every(b => !/DENSE/.test(b)), '...unless the level needs one of them where it stands'); }
