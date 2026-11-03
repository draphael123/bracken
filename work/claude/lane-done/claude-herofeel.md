# claude/herofeel - ROOKERY SOFTLOCK + HERO FEEL FIX (base claude/batch139 eac22ce9)
Branch claude/herofeel, worktree bracken-herofeel, tip 33e34a05 (pushed). Not merged, not deployed. Report with numbers/questions: scratch\lane-reports\herofeel.md

## TASK 0 - THE ROOKERY softlock (own commit b18129c2)
Cause: THE GALE SPIRES' gorge. Every spire is solid to the world floor, so the gorge floor between two spires (cols 369, 372-373, 376, 379-380, 383, 386-387), the pit under the nest face/relay (408-419) and the pit under the summit door (426-427) were SEALED pockets: a fall in had no way out.
Fix (src/rookery.js): a steady, never-timed UPDRAFT (ent vent, wind, period 100/on 100) in each pocket, as tall as its lower neighbour spire + a row (relay pit: vent at 408 lifts onto the upper face; door pit: lifts to the lone spire, never past the last landing, so relayRide/doorRide stay LOCKS). New tools/herofeel-rookery.mjs (Node): directed reach graph, every standable cell must reach the boss floor: 23 trapped cells -> 0. Also green: tools/rookery.mjs (static+hands), anchor-lint, reach rookery, deadends rookery (11 dead ends, all pay).

## HERO CHANGES
Warden: hold-C brace REMOVED (src/warden-brace.js deleted); HOLD C = JAVELIN THROW, 3 tiers (src/warden-throw.js numbers; main.js wthTick/wthThrow/updateWthSpears/wthDraw). Ranger: bow/knife swap removed, DOWN+C = ARROW RECALL, snare = store skill rgSetSnare, refill 8->11 s, steady shot dmg 2.0->1.85. Geomancer: air up-slash fans 3 stone shards (-60/-90/-120), earthfall = shockwave, no standing stone. Lab bot: warden hands throw the javelin (+x_wardJav_N, default 2), no brace.

## CHECKS (one at a time)
GREEN: heroblocks-b warden (javelin tiers: dmg 10/17/22, knock+stagger 0.68 s, pin 1.58 s, spear back, no brace), ranger.mjs (recall 46/102 stamina, rooted, arrows home; snare skill; no stance; trickle 11 s), plunges.mjs (earthfall shockwave), geomancer.mjs (+ up-air fan), rookery.mjs, anchor-lint, reach rookery, deadends rookery, herofeel-rookery. NOT RUN: full suite, textfit (hero cards got longer), heroblocks-b ranger+shots, geo-board, hero-trials. hint-shown.mjs fails on 18 literals that are NOT this lane's (AVALANCHE, KNOCKED UP, ...): it fails the same on the base.
