# claude/heartinteg - Heart of the Mountain integration branch (11-05)
Branch claude/heartinteg off master 42a1d4cdb (BATCH144), worktree bracken-heartinteg. Not pushed, not merged to master, nothing deployed.

## Merges (--no-ff, in order)
1. claude/draketune (bbef11203; drakeroom+drakeart+drakewire+heartplan): CLEAN, no conflicts.
2. claude/skytune (a809e2cb1; skyart+skymount+reflectkit+demonking): 3 conflicts.
3. claude/scenes (d25f5f84f): 2 conflicts.
4. check.mjs registration commit (see below).

## Conflicts and how solved
- src/foe-react.js ACTS_LATE act 7: drakelab row vs skylab row -> ONE row, levels: ['drakelab', 'skylab'].
- src/main.js TIER and TIER_BOSS (skytune): the two sides were identical except the lab key -> HEAD lines kept, skylab: 3.4 / 2.8 added beside drakelab (both rows, as briefed). The skytune comment line was dropped with the duplicate.
- tools/mash-bot.mjs lvOf (MASH_LEVEL): identical logic both sides -> HEAD copy kept.
- src/demon-king-hands.js return: scenes added restart(), HEAD (skytune) added impDmg -> both kept in the return object.
- src/main.js DKH = makeDemonKingHands(...) (scenes): skytune's scale (TIER_BOSS x diffNow().bhp x coopMul()) kept AND scenes' won: () => skyWon() added. Judgement call: neither side's other arguments differed.
- No other conflicts. Latest-Heart-branch rule was not needed.

## check.mjs
Registered on their own lines after kitchengate (the big one-line list untouched): fire-drake, sky-mount, demon-king, reflect-kit, heart-scenes (node) and reflect-probe, reflect-owed (browser, PORT portFor(7)). node --check ok. check.mjs itself NOT run.

## Tool results (each file called directly)
fire-drake 78 ok | fire-drake-art 26 poses bad 0 | fire-drake-hands 312 ok | sky-mount 175 ok | demon-king 262 ok | reflect-kit 183 ok | heart-scenes 97 ok | sky-art 89 checked bad 0.
Level-sweep node tools, all exit 0: architecture, one-new-foe, skins, dressing, ambush-listed, barriers-inventory, checkpoint-stand, demo-transitions (120 green).
Red, PRE-EXISTING on master 42a1d4cdb (same result there, not Heart): tools/balance.mjs ReferenceError GHM is not defined (stale boss-HP table); tools/musthave.mjs 15 "not reached without bouncing off a creature" (moor, oreroad, underwell, glasssea, ksar, minecart) - none on drakelab/skylab.
levelling-balance started but not waited on (not Heart).

## Smoke (one headless browser, 3.9 GB free, closed by its tool)
tools/heart-scenes-shots.mjs: drakelab -> scene A -> skylab -> death restart -> King down -> scene B -> map, plus replay rows; 9 ok, 0 FAIL, "errors none" (no console errors on drakelab or skylab).

## Owed before Heart can merge after the SAT 11-07 cut
- Rebase-free re-merge: if master moves after the cut, merge master INTO claude/heartinteg first (main.js TIER/ACTS lines and the DKH ctor line are the likely collision spots) and rerun the tools above.
- Full suite (check.mjs, 40 min) on this branch; browser probes reflect-probe, reflect-owed not run here.
- Still open from lane reports: other 11 heroes + verbs on the drake's back, co-op/AI partner, zoomed camera + parallax, quit-to-map cleanup (skymount Owed 1-6); Berserker hatchet vs bolt; Rimebinder/Demon Hunter/Desert Priest heroes unwired (reflectkit).
- Art-before-live: Heart levels are hidden labs only; confirm art pass status before any of it goes on the map.
- Daniel's call: fix or accept the pre-existing balance.mjs / musthave reds (rec: file a separate lane; not Heart's).
