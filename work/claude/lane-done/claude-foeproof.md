# FOEPROOF (11-05) - browser proof for claude/foevariety. VERDICT: NOT READY for the SAT 11-07 cut (UNPROVEN: no browser could be opened).

## Why
Release gate (PID 21896, scratch/GATE-RUNNING.flag, "batch145 gate (rel145) started 11-05 10:24") was still running at 13:18 (~3 h). My brief said open NO browser until the flag is gone, so I waited (Wait-Process loops from 11:05 to 13:18) and ran nothing. RAM was fine (~4 GB free at 11:05); the gate was the only blocker.

## Branch
claude/foevariety = 1ebc5073d + 550ba3575 (SMALLFIX16: foe-cast-lint registered in tools/check.mjs, already on the branch, kept) + fc91d9bb1 (mine: tools/foeproof-shots.mjs, NEW, UNTESTED - stills of firearcher/rockarcher (palisadewood), venomarcher/clubsprig (fenroad): idle / tell / after / later -> foeproof-<skin>-<phase>.png). No code fixes made.

## Evidence: none yet (no pilot, mash, stills, console check, foe-cast/textfit run in a browser).

## OWED (run in order, one headless browser at a time, >= 1500 MB free before each)
1. SHOT_OUT=scratch\lane-reports node tools/foeproof-shots.mjs  (fix the script if the enemy/tell fields differ; check shard readability, fire flames, club tell)
2. node tools/level1-pilot.mjs kingswood kitchengate fenroad stockade underleaf palisadewood --write   (note: level ids are kings, kitchengate, fenroad, stockade, underleaf, palisadewood)
3. node tools/mash-bot.mjs --level kings,kitchengate,fenroad,stockade,underleaf,palisadewood --write ; then node tools/level-quality.mjs (pilot+mash rows were STALE for all six after foecast/foevariety, so the cut needs them re-stamped)
4. node tools/foe-cast.mjs --check, foe-cast-lint, textfit (new bestiary rows: CLUB GOBLIN + 3 archers), hint-shown; 0 console errors.
5. Listen pass (voice aliases), frame time in palisade (9 variant archers), parry/reflect of variants, club knock into pit/spike fairness.
Without 2-3 the level-quality gate FAILS pilot/mash for those levels, so foevariety should not ride the 11-07 cut unless a browser lane stamps them first (they take ~1 min per level once the browser is free).

## Questions (rec first)
Same as foevariety.md; plus: ship foevariety on 11-07 only if the proof above is run by Fri 11-06 evening (rec), else hold to the next cut.
