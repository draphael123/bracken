# claude/bc3tune - THE HOURGLASS KING tune (Sonnet, 2026-10-12) - base claude/buriedcity3 f349480a

NUMBERS ONLY (src/hourglass-king.js HK). Standard: boss-rates buriedcity --profile=human --flasks=kit --ways=practiced (L40), 12 seeds, k/w/p, PORT 8874, jobs=2.

## Numbers changed
| | before | after |
|---|---|---|
| dmg pend / gear / stream | 54 / 32 / 40 | 34 / 24 / 30 |
| dmg surge / grasp / rain | 44 / 36 / 34 | 26 / 28 / 18 |
| dmg slip / hour / pour | 46 / 48 / 11 | 34 / 36 / 8 |
| surgeTell (jump window) | 0.8 | 0.9 |
| gap per phase | [0.3, 0.2, 0.1] | [0.45, 0.35, 0.25] |
hp 3500, tells, glass timers, openT/wardT/resist/openCap, every move and the phase design untouched. buried-city.mjs asserts unchanged (278 green).

## Rates (practiced, human, flasks kit, 12 seeds)
| config | knight | warden | pyro | all |
|---|---|---|---|---|
| before (build lane, 3 seeds) | 1/3 | 0/3 | 1/2 | 25% |
| build's rec only (rain 24, surge 34, surgeTell 0.9) | 2/12 | 3/12 | 2/12 | 19% |
| + pend 46, gap +0.15 | 2/12 | 3/12 | 7/12 | 33% |
| gap +0.3 (longer fights, no gain) | 3/12 | 1/12 | 9/12 | 36% |
| all dmg ~-30% from 54-base (pend 38...) | 4/12 | 6/12 | 11/12 | 58% |
| hp 3200 on top (no faster, noise) | 4/12 | 6/12 | 8/12 | 50% |
| gap [.35 .25 .15] (more deaths) | 2/12 | 7/12 | 9/12 | 50% |
| **shipped (table above)** | **6/12** | **7/12** | **9/12** | **61%** |
Wins 113-168 s (median ~146 s), deaths 50-200 s: fights sit at the top of 90-150 s. No hero at 0. 12 seeds is +-13 points, so read it as ~55-70%.
Dry (human+dry, 6 seeds): 0/6 0/6 0/6 (flasks carry him; as B6 amended intends).

## Damage by move (hk-probe, 2 seeds each, human)
Shipped: PENDULUM 166-235 (the biggest, the blocked one) | RAIN 63-150 | SURGE 36-144 | GEAR 66-124 | STREAM 0-116 | POURING SAND 22-66 | GRASP 0-68 | HOUR 50 when reached. Before (the 34/44-base, 2 seeds): PENDULUM 225-300, SURGE up to 246, RAIN 66-132. No single move carries a fight any more.

## Checks (PORT 8874)
- textfit --strict hints,talk,boss (6342 screens): the new words (hourglass/flip lines, King move words, rooftops signs) clean: OVERFLOW/OFFSCREEN/CLIPPED/TRUNCATED/COLLIDE/SMUDGE 0. Exit 1 only on 2 COVERS in OLD levels: fallingtower sign@34,300 and fair sign@405,12 (not this lane; present on the base).
- boss-openings ok (re-run after the numbers too). buried-city 278 green. drawn-solids ok. boss-read ok. boss-fight-end (61 fights) ok. tells ok. untold-told ok.
- mash re-stamped LEVEL then BOSS (docs/mash-bot.json): boss 0/6 (dead 33-37 s, boss left 93-99%); level row held. (Level data unchanged, so the pilot/curve row is untouched.)
- mark-integrity: the one known phantom only (undeadmage|poisonTell, not this lane).
- RED NOT MINE: tools/curve-gate.mjs fails on `wood` (5 deaths/3 runs) and `marsh` (275% hp) act-1 rows - identical on the untouched claude/buriedcity3 checkout; stamps of other levels (re-measure them in a calm suite).

## QUESTIONS FOR DANIEL
1. Fights run 113-168 s on wins (top of 90-150). Rec: ship (hp cuts did not shorten them; openings gate the time). Alt: a lower hp with a lower openCap.
2. Knight is the low hero at 50% (pyro 75%, warden 58%). Rec: keep; no hero at 0.
