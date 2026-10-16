# HERO PASS A TUNE (sonnet, 10-16) - branch claude/b97base, port 8973

RESULT: no hero is an outlier, so NO DIALS CHANGED (no src change, no test change). Measured 12 seeds, boss-rates practiced, --profile=human, flasks kit, Normal, --jobs=1, L3 bosses (240 fights, 122 min).

| Boss | knight | warden | ranger | pyro | paladin | row |
|---|---|---|---|---|---|---|
| wood | 11/12 | 5/12 | 12/12 | 7/12 | 9/12 | 73% |
| stockade | 2/12 | 8/12 | 2/11 | 7/12 | 5/12 | 41% |
| marsh | 11/12 | 10/12 | 8/12 | 10/12 | 11/12 | 83% |
| burning | 9/12 | 10/12 | 11/12 | 7/12 | 11/12 | 80% |
| TOTAL | 33/48 = 69% | 33/48 = 69% | 33/47 = 70% | 31/48 = 65% | 36/48 = 75% | avg 69% |

Hero vs average: knight 0, warden 0, ranger +1, pyro -4, paladin +6. All inside +-10, so the brief's tune target is met on the base as merged. Hero Pass A did not push the knight (69%) or the ranger (70%) over; Paladin 4 sits +6 (highest, still in band; his paladintune step 1 stays).
Before = after (nothing touched). The pre-merge 3-seed sanity (heropassa: knight 11/12, warden 10/12, ranger 9/12) was noise-level; at 12 seeds the three are level.

## Observations (per-boss matchups, NOT hero-wide; no dial change)
- Stockade is LOW for everyone (41%, -19 vs the 60-70 band): knight 2/12 and ranger 2/11 are the weak cells (warden 8/12). Boss tuning is the later per-boss sweep's job (brief), noted for it.
- Wood: warden 5/12 vs ranger 12/12 / knight 11/12. Burning/marsh: pyro 7/12 and 10/12, ranger 8/12 on marsh. Matchup spread, averages level.
- Normal is +~11 over the old rates (difficulty lane) - marsh 83 and burning 80 are above band as expected; the sweep retunes bosses.
- Ranger stockade has 11 fights: one fight errored out of the page (harness, not a loss).

## Checks (all green, port 8973, one at a time)
hero-pass, one-dodge, blow-tags, commitment, hero-trials, normal-health (L1), mash-gate (47 levels), boss-openings. boss-openings first run died on a harness "Runtime.evaluate did not answer within 301000ms" (machine busy with two other lanes); re-run alone: green. No test expectation changed.

## QUESTIONS FOR DANIEL (rec first)
1. Leave all hero dials as is (rec, built): every hero is within +-6 of the average. Alt: nudge paladin down ~5 points - not recommended, within band and his step 1 already cut him from 12/12.
2. Knight bot bashes ~22 yellow wind-ups a duel (Q8): the knight's 69% shows it is not breaking the balance, so bash cd 0.55 s / 12 wind stay. A human may bash less or more than the bot.
3. Stockade (41%) wants a boss-side look in the per-boss sweep.
