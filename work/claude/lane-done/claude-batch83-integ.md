# claude/batch83 INTEG lane (on ff4820cf)

Final check run (tools/check.mjs subset, alone, PORT 8806): syntax, tells, spawns, map-*, additional-areas(+runtime), boss-openings, boss-fight-end, archmage-*, sprinkle-cap, hint-shown, mash-gate, curve-gate, corpses, rootway(+probe, aloft), caravan x4, blow-tags, fallingtower2(+keys), walk-controls, welltown, textfit = ALL GREEN. level-quality RED on ONE row: minecart curve (below).

## Fixes
1. boss-openings: Huntmaster long stagger HM.stagLong 2.4 -> 3.1 s (opening measured 3.2 s). That lifted him to 97% with flasks, so hp 720 -> 900 (81%) -> 1080: WITH FLASKS (profile human, 12 seeds, campaign L5) knight 5/12, warden 8/12, pyro 11/12 = 67% (in the 60-70 band; runs: 720hp/3.1s 97%, 900hp 81%, 1080hp 67%). Mash boss row re-stamped (0/6).
   ASSERTION CHANGES: tools/rootway-probe.mjs 'his own arrow home is THE LONG STAGGER' range 2.2-2.6 -> 2.9-3.3 (reason: the 3 s opening rule of boss-openings wins over the 2.4 game-s = 4 real-s note); jaw-trap step settles 30 frames instead of 3 (same assertion; with the longer stagger the trap needs more than 3 frames to catch the standing hero - timing of the scripted setup, not the trap).
2. walk-controls: the stormtough relayout put the BRASS key on the road's own tower deck (the route climbs it, keyFirst takes it - no side trip). Re-aimed test 1 at the IRON key (299,20, four rows above the road, still a real graph side trip): walk from col 285, 3000 frames, must fetch it (got in 3.5 s). Same strictness (sub 'key' got).
3. hint-shown: the scanner counts a constant `*_LINE` / `*_LINES` array indexed in a number() call (RAM_LINE, SPARK_LINE) as number() sources; routes kept. Baseline lost two stale lines (HE TEARS FREE, TANGLED IN THE SHADE - caravan2 removed them): --write (shrinks).
4. sprinkle-cap: rootway lurker (142,30) -> (142,26) on the plank, the hunter's floor; encounter kept.
5. mash-gate + level-quality: re-stamped LEVEL THEN BOSS rootway + caravan (mash level: all heroes die 2-5x; boss 0/6), pilot + curve rootway, curve caravan 203% / 3 runs 4 deaths ok (act 5), curve minecart.
   KNOWN BORDERLINE: minecart act-1 curve measured fresh = 353% lost a run, 4 deaths (band 40-250%, 0-3). On master the row was STALE (soft pass: 223%/4 deaths), so level-quality now fails it hard. Not relaxed. One-line options: add minecart to CURVE_REPORT_ONLY in tools/rule-state.mjs (the list the level sweep shrinks) or soften Deep Rails act-1 (Daniel: later).
6. boss-fight-end: it was the Dune Worm (UNKILLABLE BY SCRIPT): the script now holds him stunned (wormTake lands only when stunned), like the Djinn mud / Warden stump lines.
7. corpses: minecart cn:gobrider - deeprails2's riders pace away from their trigger column; the test's camera follows the rider (BK.look on e.x), same assertions.
8. additional-areas: CRAG_PATH vertex 267,55 -> 264,55 (Stormhold node).
9. textfit scoped: green (the 1 was load). textfit-full 16 -> remaining: fixed the Archmage's 'STRIKE HIM' drawn off screen (fallingtower2) and the 'E: DRINK' / 'E: POUR' HUD overflow (water-skin strip widens under its verb; PRE-EXISTING on master). Still red, PRE-EXISTING on master (batch82 textfit-full had them): COVERS talk fallingtower sign@34,300 and fair sign@405,12 (the talk box vs hero rect: the picture shows a large hero rect - looks like a harness artefact; not touched). Flaky: hanging mini 'THE WEAVER' x '!!' COLLIDE/OVERDRAWN appeared in one run, not the other.
10. tools/check.mjs: caravan, caravan-level, caravan-slides, caravan-worms wired (all green, fast). minecart-route left unwired (flaky, a different hero's ride fails each run).

## Questions (rec built)
1. minecart act-1 curve (353% / 4 deaths): rec = CURVE_REPORT_ONLY entry now, soften Deep Rails later (not built - your call; level-quality stays red until then).
2. textfit-full COVERS x2 (pre-existing): rec = leave, or let a UI lane look at the harness rect.
