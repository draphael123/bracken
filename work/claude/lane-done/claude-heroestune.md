# claude/heroestune - STARTER-HEROES TUNE (11-02) - merge base READY, rate tune NOT READY for BATCH138
Branch claude/heroestune (worktree bracken-heroestune) = claude/ults 54a5d99d + claude/wardenid ee17a461 + claude/pyrokit2 b417f0aa, conflicts resolved, then the tune commits. Not merged to master, not deployed. Tip = `git log -1` on the branch.

## Merge notes (what was kept)
- wardenid conflicts: boss-table warden rows stay DELETED (Q11, rows are 1.0); knight/geo/ranger/pyro rows keep the ults-base values (knightid already reset them). Warden's Reach (UP+C) cast, long thrust, band, desc/hint/trial names kept; hero-trials 'meter' station presses UP for the warden too.
- pyrokit2 conflicts: Meteor Fall (UP+C) kept for pyro (desc, trial name, HUD cue, lab bot); the ults registry entries for knight/geomancer/ranger untouched. Warden and pyro fire their ult through their own UP+C branches in main.js, not ultRegister, so the shared ULT cue/card row (ULT_NAMES) does not list them.
- Every edited file passes node --check.

## Win rates WITH flasks (human profile, practiced, campaign kit, n=6 per cell). BASELINE = merged branch before any tune
| boss (L) | knight | warden | geomancer | ranger | pyro | pooled |
|---|---|---|---|---|---|---|
| Lumber (wood, L3) | 6/6 | 6/6 | 2/6 | 6/6 | 6/6 | 87% |
| Hornet Queen (hornetsnest, L3) | 4/6 | 6/6 | 5/6 | 6/6 | 6/6 | 90% |
| Frog King (marsh, L3) | 4/6 | 4/6 | 3/6 | 4/6 | 6/6 | 70% |
| Bog Troll (fenroad, L3) | 5/6 | 2/6 | 4/6 | 6/6 | 4/6 | 70% |
| Chieftain (stockade, L4) | 4/6 | 6/6 | 3/6 | 3/6 | 3/6 | 63% |
| Sporewood Mother (spore, L5) | 6/6 | 6/6 | 5/6 | 5/6 | 0/6 | 73% |
| King Gorm (kings, L9) | 6/6 | 6/6 | 4/6 | 6/6 | 6/6 | 93% |
| Pyromancer (burning, L5) | 4/6 | 5/6 | 5/6 | 6/6 | 3/6 | 77% |
| hero total (n=48 each) | 39 = 81% | 41 = 85% | 31 = 65% | 42 = 88% | 34 = 71% | 187/240 = 78% |

Only Lumber, Hornet Queen and Sporewood are stable bosses on this base; Frog King, Bog Troll, Chieftain, Gorm and Pyromancer are the OLD versions (frogking3, bogtroll2, stockade3, gorm3, pyroboss2 rework them), so those rows are a hero-side read, not a boss-dial target.

## Numbers changed (final state of the branch)
1. Geomancer base blow 13 -> 14 (main.js swordDmg). She was the low hero (65% pooled; Lumber 2/6, Chieftain 3/6; near-miss deaths with the boss at 2-17%). Round 2 read geomancer 33/48 = 69%.
2. Sporewood Mother (src/mother-cap2.js): MC.heroTake { pyro: 0.6 } (her hide turns fire/blades to 0.4; pyro 0.6, still above the 0.4 floor) and MC.heroOpen { pyro: 1.6 } (her opening x2 becomes x3.2 for pyro); ctx.hero hook added in main.js. Why: pyro read 0/6 (dead with the boss at 15-38%); mother-cap2's own comment noted the pyro cut her for half the knight's share. After: pyro 3/6 (n=6, round 3).

## Tried and REVERTED (hero damage dials do not move the rate)
- Ranger blow 16 -> 14.5 -> 13 and warden 11 -> 10 -> 9.5: ranger read 46/48 then 43/48, warden 41/48 both times (baseline 42 / 41). The bot wins on survival (ranger takes ~20 dmg a fight), not kill speed; the trims were noise, so the branch is back at 16 / 11.
- Fights run: 240 baseline + 144 (R2: warden/geo/ranger x 8 bosses) + 96 (R3: warden/ranger x 8) + 12 pyro-spore = 492. Logs: scratch\lane-reports\heroestune\rates1/2/3 (.log/.json).

## What this says
The demo reads HIGH for the human-profile bot (78% pooled; band 60-70). Heroes: ranger 88, warden 85, knight 81, pyro 71 (81 without the Mother 0/6), geomancer 65. Hero dials could not pull ranger/warden down, so the remaining lever is boss-side, and five of the eight bosses are mid-rework in other lanes (their tune lanes own those dials). Stable bosses over the band for most heroes: Lumber 87%, Hornet Queen 90% (Hornet's Nest 2 is outside the freeze), Gorm 93% (Gorm 3 pending). I touched no boss dials besides the Mother pyro rows.

## Touched-area checks (browser, one at a time)
- PASS: tools/knight-chain.mjs (SHIELD CHARGE on UP+C, third-jab bash), tools/pyro-kit.mjs (Meteor Fall UP+C, Living Bomb).
- RED tools/warden-id-live.mjs: only 'the final thrust lands' (long thrust jab3 dmg 54 long:true, Reach cast true, band, phalanx, vault all green). Probable cause: the 260 px Reach knock moves foes past the 130 px final thrust.
- RED, also RED on the claude/ults tip itself (not from my merge): tools/geo-board.mjs (the test puts 3 stones 30 px apart and only 2 stand; with 48 px spacing 3 stand and UP+C hurts the foe for 32, so the Avalanche works, but the erupting/rolled probes read 0), tools/ranger.mjs (Great Arrow: 'dummy' foes take 0; with sprigs 2 of 3 straws hit, the third at 230 px is past range; she is NOT rooted if a direction is held during the 0.5 s draw), tools/hero-trials.mjs ('knight: station valiant not finished').
- Not run: textfit, mark-integrity, curve/pilot/mash restamps (tools/restamp.mjs is on claude/restamp 35d66a4b, not cherry-picked; stamps for geomancer and pyro-vs-Mother are OWED once the tune is final), full suite.
- Distinct 3rd jab green in tools: knight shield bash, warden long thrust, geomancer stone fist (ups false,false,true), ranger push kick. Pyro's distinct third hit became LIVING BOMB (the third pip bursts); there is no separate 3rd-jab animation.

## READY / NOT READY for BATCH138
NOT READY as a rate tune (demo-wide HIGH, pre-existing tool reds, restamps owed). The merge (ults + wardenid + pyrokit2) compiles and all five ultimates fire. Low-risk to take alone: geomancer 14 and the Mother pyro rows.

## QUESTIONS for Daniel (recommended option already built)
1. The human-profile bot beats the demo at 78%. Rec (built: no nerf): do not trim ranger/warden damage; let the rework tune lanes bring Bog Troll, Chieftain, Pyromancer and Gorm into the band, then re-run this table (n=6, ~80 min) on the BATCH138 sha. Alternative: one flat boss-damage dial for Lumber/Hornet/Gorm.
2. Pyro vs the Sporewood Mother still reads 3/6: rec keep heroTake 0.6 / heroOpen 1.6 and re-measure at n=12 on the final sha.
3. Great Arrow root leak (a held direction slides her): rec fix in the ults lane (zero P.vx after input); not touched here.
4. Warden's Reach: rec the final thrust reach foes the 260 px knock moved (or knock less late in the cast); not touched (wardenid's numbers).
