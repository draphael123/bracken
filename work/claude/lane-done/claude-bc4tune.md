# claude-bc4tune (SONNET tune) - THE HOURGLASS KING 12-seed tune, Buried City curve

## 1. THE KING (DIAL_EXEMPT, tools/boss-rates.mjs buriedcity --ways=practiced --seeds=12 --profile=human --flasks=kit --jobs=1, L40, knight/warden/pyro)
| step | hp | blows | withdraw every | kn | wa | py | all | avg fight s (kn/wa/py) |
|---|---|---|---|---|---|---|---|---|
| BC4 as shipped (3 seeds) | 2900 | x1.15 | 19/16 s | 2/3 | 2/3 | 2/3 | 67% | 137-191 |
| 1 | 2600 | x1.15 | 19/16 | 8/12 | 6/12 | 11/12 | 69% | 121 / 151 / 154 |
| 2 | 2400 | x1.29 | 19/16 | 8/12 | 10/12 | 12/12 | 83% HIGH | 128 / 148 / 152 |
| 3 | 2500 | x1.29 | 24/20 | 4/12 | 8/12 | 11/12 | 64% | 127 / 141 / 139 |
| **SHIPPED 4** | **2500** | **x1.08** (dmg table x0.94 of step 3) | **24/20 s** | **7/12** | **8/12** | **10/12** | **69% in band** | **119 / 150 / 142** |
- Fight length is nearly independent of hp (it is set by the withdraw/slab timers, not his hp): hp 2900 -> 2400 moved warden/pyro 151/154 -> 148/152. The cadence (24/20 s instead of
  19/16) is what trimmed the pyro (154 -> 142) and the average; warden still ~150 s (top of the 90-150 window), knight 119 s. No hero at 0/12.
- DRY (human+dry, same build, 12 seeds): knight 1/12, warden 1/12, pyro 0/12 = 6% (avg 93 / 104 / 112 s). Flasks decide this fight (B6 amended: bosses are tuned with flasks).
- Files: src/hourglass-king.js (hp 2500, dmg table, aloft.every [0,24,20,0]).

## 2. THE LEVEL CURVE - NOT MOVABLE BY THE NAMED LEVERS (left as stamped: 12 deaths / 3 runs, 506%, act-5 band 2-12 / 150-700: IN band, at the top edge)
Finding (tools/level1-pilot.mjs buriedcity --events, instrumented copy, then deleted): the pilot is DETERMINISTIC - the same 4 deaths a run at the same frames (f11700 @554,45 the
foundry elite + slinger; f13404 @632,51; f16250 @747,12 the roof sand-bound; f16671 @805,18). Tried sand-bound foeHit 5.4 -> 4.6 -> 3.6 -> 0.1 and foeHp 3.2 -> 2.6 -> 2.0 -> 0.3, then
every foeHit to 0.5 and drowned/slinger foeHp to 1.0: **deaths, frames, hits (-27% each) and the 506% row did not move at all.** The deaths are a stuck bot standing at constant hp
for ~400 frames (hp 1 / 68 / 100) and then dying to the sand rule / a one-step hazard, or a slow drain at 747 - the pilot cannot work the flip, so its curve is the level's
hazard geometry (rooftop chain, 632,51, 805,18), not foe weight. The sand-bound / courtyard elite are NOT levers on this row. No level file touched (the row's hash is unchanged -
curve-gate green, not stale). To lower the row, ease those four spots (see Q1).

## 3. SAND-BOUND AND SHADE
tools/buried-city-route.mjs (foes on, real keys): pyro 88/88 hp at the courtyard exam, 88 through the chain; the sun costs 28 hp only in the foundry clock shaft (605,32); the knight/
warden/pyro finish the route (7/9/9 lifts, deaths 21/28/24 = the known hard route), sun does not decide any leg. BC4's no-foes outdoor table (knight 97%, pyro 99% left) is unchanged
(no level edit). Margins OK.

## CHECKS (all on this branch, PORT 8913, one page at a time)
buried-city 358 green | buried-city-levers 30 pulls green | buriedcity-exit green | hk-probe ran (pyro win 151 s) | boss-openings ok | boss-fight-end (62 fights) |
weak-bosses OK | level-quality buriedcity CLEARS THE BAR | curve-gate (47 levels, 3 report-only, no buriedcity entry) | mash boss re-stamped 0/6 (docs/mash-bot.json; level mash row
untouched since the level is) | no test weakened.

## QUESTIONS FOR DANIEL (rec first = built)
1. **Curve row**: rec = leave at 12 deaths (in band, edge). The four deterministic pilot deaths are hazard spots, not foes; to hit the middle (~7) a level lane would ease
   632,51 / 805,18 (instant) and the roof chain at 747,12. Alt: I do it next lane (needs geometry edits, so art/level lane, Opus greybox rule).
2. **Warden fights ~150 s** (top of 90-150): rec keep; shortening further means shorter slab/withdraw timers (a mechanics change).
3. Dry = 6%: expected for a flask-tuned boss; say if the dry floor should be higher.
