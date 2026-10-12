# claude/bc2tune - THE HOURGLASS KING tune (Sonnet, 2026-10-11/12) - base claude/bc2art 9b0c0248

NUMBERS ONLY (src/hourglass-king.js HK). Standard: boss-rates buriedcity --profile=human --flasks=kit --ways=practiced (L40), 12 seeds, k/w/p. Target 60-70%, fight 90-150 s.

## Levers (build lane's rec: pressure, not hp)
- gap [0.6, 0.5, 0.42] -> [0.3, 0.2, 0.1] (the pause after each blow, per phase; phase three is the fastest)
- openCap 0.11 -> 0.09 (an opening pays less of him)
- blows +~9% on the 3500 hp base: pend 54, gear 32, stream 40, slip 43, hour 48, pour 11 (was 50/29/37/39/44/10); pourTick 0.5 -> 0.42
- hp 3500, tells, glass timers, lowAt, openT/wardT/resist (0.45), wardMul (0.4), openMul untouched. Reachability (B12) and tools/buried-city.mjs asserts unchanged.

## Rates (practiced, human, flasks kit, 12 seeds)
| config | knight | warden | pyro | all |
|---|---|---|---|---|
| before (3-seed lane report) | 3/3 | 3/3 | 3/3 | 100% (fights 96-119 s) |
| gaps + openCap only | 5/12 | 10/12 | 11/12 | 72% |
| + p3 0.3, pour 0.42 (noise run) | 8/12 | 11/12 | 11/12 | 83% |
| + blows +18% | 4/12 | 8/12 | 7/12 | 53% |
| **shipped: blows +9%** | **6/12** | **10/12** | **9/12** | **69%** |
Shipped: fights 100-140 s on the wins, deaths 80-135 s. Knight is the low hero (50%), no hero at 0. Dry (human+dry, 6 seeds): 0/6 0/6 0/6 (flasks carry him; dry is far above the target, as B6 amended intends).
12 seeds is +-13 points: the 72% / 83% reads bracket the same tune, so treat 69% as ~65-75%.

## Checks (PORT 8854)
mash boss 0/6 (re-stamped docs/mash-bot.json, arena only; the level row untouched: no level data changed) | buried-city 221 green | boss-openings, boss-read, tells, untold-told, boss-fight-end (60 fights) green | mark-integrity: the one known phantom (undeadmage|markTell) | level-quality buriedcity CLEARS (curve 233%/3 deaths, mash held).

## QUESTIONS FOR DANIEL (rec first)
1. Knight is the weakest hero at ~50% (warden 83%, pyro 75%). Rec: keep (the band is overall, no hero at 0). Alt: nerf the knight's low-window lever walk (HK.leverR) - not touched.
