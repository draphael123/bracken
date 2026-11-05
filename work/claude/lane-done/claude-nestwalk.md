# NESTWALK - the Hornet's Nest walker STUCK at 335,18 (lane report)

VERDICT: a WALKER problem, three of them stacked. The level is fine: a human can climb the well (the first runs after the fixes climb the pendants, cut the overhang, and reach the exit). No level change.

## Cause (all in the bot, none in the level)
1. FALSE PROGRESS CLOCK (tools/level-walk.mjs track()): the route drops from the west shelf (node 75, 303,11) to the sticky bed (node 76, 309,47). On the west shelves the straight-line nearest node was the EAST rung's node 89 (333,21), the same height: riMax jumped to 89, so the honest climb of nodes 80-88 never counted as progress and 1500 frames later it was reported "STUCK 335,18" (the node after 89) while the hero stood at 332,42. Fix: nothing within 6 tiles and the nearest node 3+ nodes ahead and 6+ tiles across = a route that drops; hold ri.
2. HINT FIRED IN MID-AIR (src/walk-hints.js hornetsNest): at the top of the jump from the row-30 rung the feet read 3 rows under the overhang, the "stand under it and cut it" hint fired in the air, the hands stopped jumping and fell (a loop at 333,28). Fix: the hint only on the ground.
3. CLIMB STEERED BACK IN THE AIR (level-walk.mjs climb executor): the bed -> row-45 rung hop overshot the node centre by 0.4 tile, steered back left, dropped through the gap column and fell to the bed, again and again (false STUCK 335,38 on the second pass). Fix: in the air an overshoot under 3/4 tile is landed, not corrected (new climbDir).

## Checks / numbers (walker, L3, human+first, typical build, PORT 8731)
Before (master): knight STUCK 335,18, 69% measured. After: no run stuck anywhere in x330-340 (knight x3, warden x3 = 6 runs).
Remaining STUCKs are elsewhere and foe-driven (not the well): knight s1 246,19 (wasp hovering at the stair), knight s2 71,53 (gallery), warden s2 85,41 (swarm); warden s3 ran out of frames (3 deaths, 39% walked).
Medal times, walker TIME TO THE BOSS (end 'boss', 96% walked): knight s1 403 s, s2 342 s, s3 376 s; warden s1 352 s, s2 388 s: mean ~372 s (fully-measured 96%: knight s3 376, warden s1 352). Add the Queen fight (~60-90 s) and the fall (~30 s): ~460-490 s for a first-run bot. Standing MEDALS 440 / 630 / 920: the bot lands between gold and silver, which is where a first run should land. MEDALS UNCHANGED. Rec: leave; the first timed human run sets them.
Pilot spot-check (tools/level1-pilot.mjs hornetsnest, 3 runs, print only): 28 hits, 0 deaths, 54 kills, 100% waypoints, 119.7% hp lost/run (142 / 108 / 109), 92 lifts. Reproduces nestpolish (120%): lift-heavy (pilot is lifted at every sticky/overhang step), the damage floor is met, no deaths.
level-walk-selftest: see below. level-quality / platforming-lint NOT run (no level data changed). tools/check.mjs NOT run.
Screenshot: scratch/lane-reports/nestwalk-shots/well-f22.png / well-f29.png (hnlook-walk teleport; shows the sticky comb wall and a shelf, NOT clearly the overhang - the tp column/row did not land on the rung; the trace log is the evidence, r5.txt/r8.txt in scratch/nestwalk).

## Owed
- The three foe-driven early STUCKs (246,19 wasp at the stair; 71,53; 85,41 swarm) and warden s3 frames-out: a second walker pass on the nest's wasps (the walker fights through a hovering wasp poorly). Not the overhang.
- A deterministic-seed note: the walker changes path after any early tweak (wasp timing), so runs differ; use >=3 seeds.
- Walk-curve row for hornetsnest not rewritten (n=6 mixed coverage: 4 runs 56-96%); write it with a clean 3-seed run once the wasp stuck is fixed.

## Questions (rec built)
1. Rewrite the hornetsnest MEDALS from the walker (~480 s for the bot)? Rec: no, leave 440/630/920 until a human timed run (built: unchanged).
2. A separate lane for the wasp/swarm walker STUCKs? Rec: yes, low priority.

Commits on claude/nestwalk: tracker hold, hint on ground, climb overshoot.
