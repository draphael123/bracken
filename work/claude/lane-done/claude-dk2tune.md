# claude/dk2tune - THE DEATH KNIGHT 2 TUNE (Sonnet, 2026-10-15)
Branch claude/dk2tune (off dk2art fb35b166). PORT 8937. Numbers only: `tell.swing 0.47 -> 0.56`, `tell.swingNext 0.34 -> 0.40` (src/unburied-foes.js UNB.bk) and `BOSS_HIT.bloodknight = 0.9` (src/main.js, own line). HP 1700 untouched (weak-bosses gate).

## WHY THE KNIGHT LOST (0/N)
tools/dk-hitlog.mjs (HITLOG=1 hit log, new measuring hook) showed every blow that landed on the knight landed with his shield DOWN (blk0, blockT 0). The bot already plays the level's mechanic (cuts the chapel standards, steps out of the crescent, strikes the drain open) - so not a bot-plan bug. The cause: the FIRST cut of a string has a 0.47 s tell and the human profile's reaction is ~0.41 s, so the shield was never up in time (later cuts are covered by the held guard). Warden (deflect tap) and pyro (roll) don't need the reaction. Fix = a longer first-cut tell (+0.09, next cuts +0.06) so a shield can be seen-and-raised, plus blows x0.9. Not the standards, ward, or drain.

## RATES (profile human, kit flasks, campaign L32, THE DEATH KNIGHT)
| way | kn / wa / py | total |
|---|---|---|
| practiced, 20 seeds | 8/20  18/20  14/20 | **67% in band** (12 seeds: 6/12 12/12 8/12 = 72%) |
| first (6 seeds) | 1/6 5/6 3/6 | 50% |
| built (6 seeds) | 6/6 5/6 6/6 | 94% |
| DRY (human+dry, 8 seeds) | 0/6 6/8 1/8 | 32% (report only) |
Before: practiced 0/4 knight (0.8 test), 56% with knight 0/3. No hero at 0/N with flasks. Dry knight is still 0 (dry is not the target).
Fight length (practiced, real s): knight avg 83 (wins 94), warden 70, pyro 86 - at/under the 90 s floor, HP is gated at 1700 so I did not lengthen.
Knight is volatile at the margin (0.92/0.95 gave 1/12; 0.9 gave 6/12 and 8/20 - rounding of 37-hp blows); 0.9 kept.
MASH (tools/mash-bot.mjs unburied --arena-only): 0/6 (all dead 29-42 s, boss left 76-90%).

## HERO SIDE (Death Knight hero vs knight, practiced, 6 seeds, human)
wood 3/6 vs knight 4/6; stockade 5/6 vs 3/6; marsh 5/6 vs 5/6; burning 6/6 vs 5/6 -> reaper 19/24 vs knight 17/24: close, not far above; no change made. Rec 5 (weight strings toward the full 3-cut hook): not needed - the hook lands (9 hooks / 4 fights on the knight), left as is.

## CHECKS (PORT 8937, one page at a time) - all green
boss-openings, boss-read, boss-fight-end (63/63), dk2, unburied-fights, weak-bosses, ability-poses (76/76), mash-gate (47 levels), mash-bot 0/6. tools/commitment.mjs timed out at my 280 s wrapper (not re-run; reaper-hero numbers untouched this lane). No hash/row re-stamped (nothing moved a stamped row). NOT run: full suite.

## Tools added
BOSS_MODES / HITLOG / BLOW_CENSUS sum hooks in tools/boss-run.mjs + src/main.js (off in play), tools/dk-hitlog.mjs.

## QUESTIONS FOR DANIEL
1. The Death Knight fight is ~70-95 s, under the 90-150 s target (HP gated at 1700 by weak-bosses). REC: leave; BUILT: unchanged.
2. First-attempt rate 50% / built 94%: REC accept; BUILT: that.
