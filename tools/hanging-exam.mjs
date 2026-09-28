/* tools/hanging-exam.mjs - THE HANGING VILLAGE's last stretch before the Reeve, pinned (docs/level-design/wood-to-highcrown-design.md
   §7 Plan 1 "TWIST the cutter", and "GAME-WIDE PATTERNS WORTH FIXING ONCE" item 1: the last stretch before a boss must be an exam,
   not a rest). Node only: no page. Four things a later merge could silently lose:

   1. THE ROPE BRIDGE. The lantern stair (row 37, the tier right before the crown climb) carries a cuttable rope bridge with a
      cutter at his post - the level's own rule ("a rope can be cut") used against you on the road, not only in the boss. The bridge
      must be wide enough that a hero walking it at a normal pace is actually IN its cut zone for the second the rope needs
      (src/main.js: br.cutT counts up only while P.x is inside x0+24..x1-24), and the cutter must stand within the 60px the game
      checks him against (Math.abs(e.x - br.x1*TS) < 60).
   2. FAILING STONE. Two or more platforms reused from the Falling Tower's rule (src/tower-collapse.js, L.crumbles) - floors that
      give, Daniel's backlog - and none of them carries a load, relic or other thing a hero needs to still be there after it gives.
   3. THE CLIMB TO THE CROWN IS NOT SILENT. A creature stands on the last stretch before the arena's own checkpoint, so the final
      run is not "-": nothing (checkpoint-gaps.mjs and pacing.mjs measure the WAY there; this measures WHAT is on the last of it).
   4. NO CUTTER WITHOUT A ROPE IN REACH (2026-09-28, coordinator follow-up). This level had, and could quietly regrow, THREE foes
      with nothing to cut: two from GARRISON.hanging's old ['cutter', 2] (the sprinkler places by grid search, never near a bridge -
      it cannot; the fix there is to not ask it for one) and one in the "THE CLIFF HALL" ambush wave, which - worse - never even
      spawned: singleAmbush() (src/ambush.js) keeps the elite plus the FIRST three non-elites in flattened wave order, and the old
      wave order put the cutter fourth. This checks BOTH cutter kinds this level can place: a `sprig` with `cutter: true` (the
      lowercase `bridges` array, from `ent('bridge', ...)`) and the dedicated `t: 'cutter'` enemy (`L.bridges`, `src/main.js`
      updateCutter) - and it reads L.ambushes AFTER the build, the same shape the game actually spawns, not the raw source table. */
import assert from 'node:assert/strict';
import { LEVELS, T, TS } from '../src/level.js';
import { pacing } from './pacing.mjs';

const L = LEVELS.find(l => l.id === 'hanging').build();

/* ---- 1. THE ROPE BRIDGE, TWISTING THE CUTTER ---- */
const bridges = L.ents.filter(e => e.t === 'bridge');
assert(bridges.length >= 1, 'the Hanging Village has no rope bridge on its road: the level whose rule is "a rope can be cut" never uses it against you outside the boss');
const br = bridges[0];
const HERO_SPEED = 110;   /* a normal walking pace, px/s (the cutter needs about a second of it inside the mid zone) */
const midPx = (br.x1 - br.x + 1) * TS - 48;   /* the mid zone (x0+24..x1-24) in pixels */
assert(midPx / HERO_SPEED >= 0.9, 'the bridge (' + br.x + '-' + br.x1 + ') is too short for the cutter to ever finish: a hero walking it at a normal pace spends only ' + (midPx / HERO_SPEED).toFixed(2) + 's in the cut zone, and the rope needs about 1s (src/main.js, "rope bridges")');
const cutter = L.ents.find(e => e.cutter && Math.abs(e.x - br.x1) * TS < 60);
assert(cutter, 'no cutter stands within 60px of the bridge\'s far post (' + br.x1 + '): a cutter with no rope in reach is exactly the GAP the design audit found here twice');
assert(cutter.t === 'sprig', 'the cutter at the rope is a sprig with cutter:true (the proven pattern, Kingswood\'s toll bridge), not the unrelated garrison "cutter" enemy');

/* the bridge must sit on the main route, in the stretch right before the crown (between the two checkpoints that bracket the
   lantern stair, not off in some pocket nobody walks) */
const checks = L.ents.filter(e => e.t === 'check' && e.y === 37).map(e => e.x).sort((a, b) => a - b);
assert(checks.length >= 2, 'the lantern stair keeps its two checkpoints (10,37 and 96,37)');
assert(br.y === 37 || br.y === 38, 'the bridge is on the lantern stair, row 37/38, not moved off the exam');
assert(br.x > checks[0] && br.x1 < checks[checks.length - 1], 'the bridge (' + br.x + '-' + br.x1 + ') sits between the stair\'s own checkpoints (' + checks.join(',') + ')');

/* falling through is not a dead end (B4): whatever a hero the rope drops lands on is real floor, not a spike or a killzone -
   no vine straight back up, on purpose (one would just open a second, shorter way past the upper boughs' own content) */
{ let landRow = -1; const midX = Math.round((br.x + br.x1) / 2);
  for (let y = br.y + 1; y < L.H; y++) { const t = L.grid[y * L.W + midX]; if (t === T.SOLID || t === T.ONEWAY || t === T.PLANK || t === T.SHELF) { landRow = y; break; } if (t === T.SPIKE) break; }
  assert(landRow > 0, 'a cut bridge drops a hero onto a spike or nothing at ' + midX + ' (B4): the rope\'s cost must be the climb back, never the hero'); }

/* ---- 2. FAILING STONE, REUSED (Daniel's backlog: floors that give) ---- */
assert((L.crumbles || []).length >= 2, 'fewer than two failing-stone sections: the backlog asked for FAILING STONE reused as floors that give, plural');
const loadish = L.ents.filter(e => e.t === 'load' || e.t === 'relic' || e.t === 'silver' || e.t === 'stray');
for (const c of L.crumbles) {
  assert(c.row !== undefined && c.x1 >= c.x0 && c.rows >= 1 && c.count > 0, 'a crumbling section is missing its shape: ' + JSON.stringify(c));
  const stranded = loadish.find(e => e.x >= c.x0 - 1 && e.x <= c.x1 + 1 && Math.abs(e.y - (c.row - 1)) <= 1);
  assert(!stranded, 'a ' + stranded?.t + ' at ' + stranded?.x + ',' + stranded?.y + ' rests on a floor that gives (' + c.x0 + '-' + c.x1 + ',' + c.row + '): it would be stranded or lost when the stone falls');
}

/* ---- 3. THE CLIMB TO THE CROWN IS NOT SILENT (game-wide pattern 1) ---- */
/* the shaft from the lantern stair (row 37) up to the crown floor (row 20): a foe stands somewhere in it, not just a bare rope */
const shaftFoe = L.ents.find(e => e.y > 20 && e.y < 37 && e.x >= 2 && e.x <= 9 && (e.t === 'spider' || e.t === 'wasp' || e.t === 'snuffer'));
assert(shaftFoe, 'the long rope to the crown (rows 20-37, cols 2-9) has nothing on it: the last stretch before the Reeve is a rest, not an exam (game-wide pattern 1)');

/* and the pacing route agrees: the window right before the boss's own checkpoint carries at least one platforming/fight stretch
   and the level's own set-piece (the bridge), not only rest and light */
const lv = LEVELS.find(l => l.id === 'hanging');
const r = pacing(lv);
const strip = [...r.strip];   /* pacing() hands back an array of one-char stretches */
const bIdx = strip.lastIndexOf('B'); assert(bIdx > 0, 'no boss stretch found on the route');
let rIdx = bIdx - 1; while (rIdx > 0 && strip[rIdx] !== 'R') rIdx--;
const preExam = strip.slice(Math.max(0, rIdx - 10), rIdx);
const preExamStr = preExam.join('');
assert(/[PHFX]/.test(preExamStr), 'the ten stretches before the boss checkpoint (' + preExamStr + ') hold nothing but rest and light: no exam');
assert(preExam.includes('X'), 'the level\'s own set-piece (the rope bridge) does not show up in the pacing window right before the boss (' + preExamStr + ')');

/* ---- 4. NO CUTTER WITHOUT A ROPE IN REACH ---- */
/* 4a. GARRISON.hanging cannot place a 'cutter': the sprinkler picks any open floor by a grid search (src/level.js garrison()),
   never a spot near a bridge, so any 'cutter' it places is the GAP by construction. Read from the BUILT level (post-garrison,
   post-dressing), not the source table, so a regrowth is caught wherever it comes from. */
const wildCutters = L.ents.filter(e => e.t === 'cutter');
assert.equal(wildCutters.length, 0, 'a "cutter" foe stands in the built level with no bridge of its own (' + wildCutters.map(e => e.x + ',' + e.y).join(' ') + '): GARRISON.hanging must not ask for the "cutter" kind (the sprinkler cannot place one near a rope)');

/* 4b. every t:'cutter' this level's AMBUSH wave actually spawns (read post-singleAmbush, the shape the game really uses - a raw
   source entry that never survives the leader/first-three cut is not "in the level" no matter what it says) names a real bridge,
   and that bridge is a real L.bridges entry. */
const ambushCutters = (L.ambushes || []).flatMap(A => A.waves.flat()).filter(f => f[0] === 'cutter');
assert(ambushCutters.length >= 1, 'THE CLIFF HALL used to place a cutter with no bridge (dropped silently by singleAmbush\'s first-three cut, so it never even spawned); now none survives the build at all - the twist was lost, not just unwired');
for (const f of ambushCutters) { const bridgeX = f[3] && f[3].bridge;
  assert(bridgeX !== undefined, 'the ambush\'s cutter at ' + f[1] + ' has no { bridge } naming which L.bridges span is his to cut');
  const lb = (L.bridges || []).find(b => b.x === bridgeX);
  assert(lb, 'the ambush\'s cutter points at bridge ' + bridgeX + ', but L.bridges has no span starting there'); }

/* 4c. every sprig with cutter:true (the lowercase, toll-bridge-style mechanic) has a real ent('bridge', ...) within the 60px the
   game checks it against - generalized past section 1's own bridge, in case another is ever added */
const sprigCutters = L.ents.filter(e => e.t === 'sprig' && e.cutter);
for (const sc of sprigCutters) { const near = bridges.find(b => Math.abs(sc.x - b.x1) * TS < 60);
  assert(near, 'a sprig cutter at ' + sc.x + ',' + sc.y + ' has no rope bridge within the game\'s own 60px range of its far post'); }

console.log('hanging-exam  bridge ' + br.x + '-' + br.x1 + ' cut by a sprig at ' + cutter.x + ' (' + (midPx / HERO_SPEED).toFixed(2) + 's in the cut zone at a walk); ' + (L.crumbles || []).length + ' failing-stone floors; a foe on the crown climb; the ambush\'s cutter (bridge ' + ambushCutters[0][3].bridge + ') survives the build; 0 wild cutters; pacing window before the boss: ' + preExamStr + 'R');
