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

## NESTWALK2 (follow-up: the four remaining STUCKs)

RESULT: all 6 runs (knight + warden x 3 seeds) now reach the Queen with 96% of the route MEASURED and no STUCK anywhere (knight: n2m run; warden: same code, --frames=60000). Every remaining stuck was a WALKER fault; the level is fine (stills: scratch/lane-reports/nestwalk-shots/spot-*.png, made with the new tools/nestshot.mjs, hero stood on the exact feet rows: stair ledge 240,22 / shaft 85,46 / gallery 62,56 / well bed 332,45 / swarm ledge 250,20 - each a plain 2-row ledge stair or a plank, clearly traversable). No level data changed (level-quality / platforming-lint not needed).

## Causes and fixes (all tools/level-walk.mjs)
1. HUNT CHASED UNREACHABLE FLYERS (246,19 stair wasp; 85,41 shaft): when a hop failed, the progress clock stalled 90 frames and the "hunt" took over, chasing a wasp hovering 3-5 rows off (over/under him, behind the way on). Fix: no hunting a flyer 3+ rows off his floor, nor one 2.2+ rows overhead and behind the way on.
2. HUNT GIVE-UP CLOCK WAS ZEROED BY FLIPS (71,53 / 62,54 gallery; ~800 frames lost): hunt and route took turns each frame and every flip reset the 360-frame clock, so the spitter was never given up. Fix: the clock is per foe and kept across flips; given up for 900 frames. Elites keep the old per-spell clock (the first try wrote off the nest-guard elite and walked into his shield).
3. FALSE STUCK AFTER A DEATH (252,19, and the "swarm" at 246,19): a death at x286 respawned at the shrine at ~x215 and the re-walk of the 70 columns already won counted for nothing (progress = a NEW best node vs the old riMax), so 1500 frames later it was reported STUCK at the node he had just reached. Fix: riMax restarts at the respawn node.
The well (335,32 warden s1) was the prior lane's fault class (the progress clock); it no longer shows with the above.

## Numbers (L3, human+first, typical build, PORT 8731)
Knight s1/s2/s3: BOSS, 2 / 0 / 1 deaths, 507 / 314 / 362 s, measured 96% x3. Warden s1/s2/s3 (frames 60000): BOSS, 3 / 1 / 4 deaths, 604 / 436 / 885 s, measured 96% x3. level-walk-selftest: ok.
Runs vary seed to seed (any tweak shifts the wasp timing) and the headless page crashed twice (infra-retry, reran fine).
REMAINING (not a stuck): the warden loses the hall duel with the VENOMOUS shield elite + honeyhornets at x150-165,y32 (NEST-GUARD / AMBER HORNET THE HUNT deaths at 145-154,32 in 4 of 5 warden deaths; 255% hp lost to honeyhornets in s3). With frames 36000 two warden runs ran out of frames there. Knight: 0-1 death at the same hall. This is combat tuning of that hall or the warden duel hands, not routing.

## Medals (hornetsnest, 440 / 630 / 920)
Walker time to the boss, clean-ish runs: knight 314-362 s (507 with 2 deaths), warden 436 s (604-885 with 3-4 deaths). Add the Queen (~60-90 s) and the fall (~30 s): a 0-1 death run ~430-490 s = gold/silver line, a 3-death bot run ~700-1000 s. MEDALS UNCHANGED: gold 440 / silver 630 still fit a good first run; bronze 920 covers the 4-death warden. Rec: leave until a timed human run.

## Walk-curve row
Not rewritten: warden times are dominated by the hall duel deaths (n=6 spread 314-885 s). Write it after the hall is tuned.

## Questions (rec built)
1. Tune the nest-guard hall (x150-165,y32: shield elite + honeyhornets) for the warden? Rec: yes, a small combat lane (fewer honeyhornets during the duel or a retreat gap); the walker's measure is 3-4 warden deaths there vs 0-1 knight.
2. Raise the walker's --frames default 36000 -> 54000 for slow-death classes? Rec: yes, but low priority (runs only end 'frames' when deaths pile up).

Commits (claude/nestwalk): no hunting unreachable flyers; hunt reach; per-foe hunt give-up (elites old clock); progress clock restarts at the shrine after a death; tools/nestshot.mjs stills tool. tools/check.mjs NOT run.
