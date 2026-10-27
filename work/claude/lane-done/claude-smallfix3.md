# claude-smallfix3 - SMALL FIXES 3 (lane 10-25, branch claude/smallfix3, base 1dacbb8d = BATCH121 LIVE; includes the xproad fixture 8dcbd8cf cherry-picked)
Ride-along: BATCH124 (do not merge here). Port 8793, one headless browser at a time, no suite run.

## Per item
1. RAM LORD TUNE - DONE (src/ram-lord.js): hp 3600 -> 6000, rest between his moves paceExtra [0.5,0.35,0.2] -> [0.1,0.05,0]. Stun x6 / crash x6 untouched (Daniel 10-24).
   Campaign level L9 (scree, fixture 8dcbd8cf), profile human, kit flasks, practiced, n=12 per hero:
   BEFORE (hp 3600, pace .5/.35/.2): 89% (coordinator's number; ramtune2 had 92% at L8).  AFTER: knight 5/12, warden 9/12, pyro 11/12 = 25/36 = 69% (band 60-70).
   DRY (human+dry): knight 4/12, warden 2/12, pyro 7/12 = 13/36 = 36%.  MASH bot (tools/mash-bot.mjs scree): 0/6 (all DEAD, boss left 60-99%).
   Search that led there (flasks, n=12, kn/wa/py): hp 4800 = 9/9/12 83%; 6500 = 7/9/11 75%; 5600+pace .2/.1/0 = 7/9/12 78%; 7000 = 6/11/12 81%; 7500+pace .1/.05/0: knight 3/12 (run cut off). HP alone does not bite the warden/pyro (they win longer fights with flasks); the shorter rest is what costs the knight. The pyro stays 11-12/12 (his burn runs outside the openings) - the mean is held by the knight/warden.
   Checks: tools/ram-lord.mjs ok, ram-bank ok, mash-gate = only the old oreroad stale row. Fights now ~50-120 s.
2. CROWN-DOOR COLD-VISIT HITCH - DONE (src/hanging-village.js warm(L), src/main.js level load): the hitch was NOT the ropes. A CDP profile of the first frames at the crown door (hanging@12:19, 4x CPU) put 2.7 s in faceOf -> bakeFace (the crown band's full-width cliff-face canvas, baked on first sight). All floor-band faces are now baked at the level load (HV.warm, skipped when parallax is off). mobile-perf at 4x: worst frame 733-1700 ms -> 50 ms (twice), fps 53-58. Cost: the Hanging level load is ~1 s longer at 1x (load 4.4 s at 4x total).
3. SMALL-ADDS RED (Mother's sporelings vs paladin/ranger) - DONE (src/lab-mother.js + one arg in src/lab.js): the Mother pilot's brood branch used the plain cut; it now uses the low sweep (keyVerb), and the ranger cuts from knife range (her arrow tap flew over the hoppers). spore/mother: paladin 4/11 -> 1/7 missed, ranger 5/7 -> 1/3 (2/5 on a first try, then knife range). Remaining three bosses (spire, underleaf, marsh) re-run: 31 of 240 missed (13%), worst row 33% = at the limit, passes. NOTE: the full tools/small-adds.mjs stalled once (a 30-min Runtime.evaluate on a boss row after the Mother row; not reproduced when the rows ran in two pieces) - a lab stall, not a miss-rate result.
4. TOWER-CHASE RED - NOT REPRODUCED: tools/tower-chase.mjs passes alone on this branch (stander thrown, every hero up the stair, ok). It passed alone in the BATCH121 gate too; the stander section is cast-clock sensitive under suite load (batch118/119/121 notes). No change made; if it goes red again in a gate, widen the stander's hp bar (200 -> 300) rather than the dark.
5. KSAR ZIP createRadialGradient - DONE (src/redraw/ksar_props2.js glow()): skips non-finite position/radius instead of throwing. The exact caller at zip line 1's head was not found by reading (not reproduced headless); the guard covers every glow() caller.
6. HORNET QUEEN P2 FIRST-FRAME HITCH - ALREADY FIXED (hornetsnest2 warm in warmQueen: torn combs, last comb, hall sprites). Measured at 4x with the real rAF loop: phase 2 reached (hp 219/397, phase 2), worst frame at the P2 transition 66.7 ms (batch118 saw 650-790 ms). Only hitch in the fight is the boss start backdrop re-bake (700-980 ms at 4x, ~150-250 ms at 1x; the shared setView/bakeBackdrop path every zooming boss uses) - not touched.
7. OWL ARENA FPS - NO CHANGE NEEDED: hanging@40:19 at 4x: 50.1 and 50.0 fps, worst 50 ms, busy 17.5 ms/frame (budget 40 fps).

## Commits (claude/smallfix3)
bc86e632 ksar glow guard; 34aa8076 xproad fixture (cherry-pick); 0921c619 Mother pilot sweep; (ram tune commit); 6afced67 hanging faces warm; report commit.

## Reds
None new. Not run: the full suite (lane rule), boss-fight-end, textfit.

## QUESTIONS FOR DANIEL
1. Ram Lord hp is now 6000 (was 3600) with shorter rests; flasks 69% (upper edge of band), dry 36%. Rec: keep. Built: as above. If you want ~65%, knight/warden are the lever (pace .1 -> .2 gives them a little back); the pyro stays ~92% either way (burn).
2. The crown hitch fix adds ~1 s to the Hanging Village load at 1x. Rec: fine (the alternative is a hitch the first time the crown door is reached). Built: warm at load.
