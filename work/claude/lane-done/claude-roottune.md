# ROOTTUNE (11-12) - branch claude/roottune (pushed; NOT merged, NOT deployed). Base master c2424c597.
Boss = THE GOBLIN HUNTMASTER (src/huntmaster.js), row `rootway`, L6, practiced bare build WITH flasks, human profile, seeds 1-12 per hero (n=36), one headless at a time.
## CAUSE (knight 0-1/12)
Measured with a new opt-in probe (HM_N=1 in tools/boss-run.mjs, prints the Huntmaster's own counters). Knight and warden OPEN him equally often (8-12 long staggers a fight; knight 8-12, warden 11-14) and both lose ~9-20% of their life to arrows. The difference is what lands INSIDE an opening: knight ~1.5 blows of ~13 raw dmg (openDmg 236-336 a fight, hit cap filled in only 4-6 of 8-12 openings); warden ~1.6 blows but heavy (openDmg 520-560, cap filled 10-11 of 12); pyro fills three pips from range. The hit cap is damage-based (hitCap 3 x blowRef 15 = 45 raw x1.5), the opening 3.1 s: warden/pyro fill it, the quick-sword knight needs 3.4 blows and has time for 1.5 (the bot reaction is 415 ms plus the walk across a 96-150 px keep). Knight then dies at 17-47% boss HP left, to arrows (66-103 of ~204 taken), knife flurry (up to 80) and jaw traps.
VERDICT: a REAL knight/boss-shape problem (the opening is paid by damage, not time, and favours heavy or ranged heroes), not a bot script bug: the bot opens him as often as the warden and takes the same arrow damage. NOT proven against a human knight (no human playtest).
## KNOBS (src/huntmaster.js, 2 lines)
- :44 stagLong 3.1 -> 3.9 (long opening, 0.8 s more time to land blows)
- :44 blowRef 15 -> 20 (hit cap 45 -> 60 raw; the pips draw from it, hitCap stays 3 so the first card 'THREE BLOWS WORTH' stays true)
- :26 hp 1095 -> 1145 (+4.6%, gives back the pooled rate that the first two raised on warden/pyro)
Resist floor untouched (guardMul 0.4, wardMul 0.4); no kit, other boss or shared constant touched.
tools/boss-run.mjs: one opt-in line (HM_N=1 adds `hmn` counters to the row). Off by default.
## RATES (n=12 per hero, seeds 1-12, deterministic per seed but chaotic across knobs, so +-15 pts per cell)
| config | knight | warden | pyro | pooled |
| master (rel165, bare WITH flasks) | 0-1 | 7 | 8-9 | 15-17/36 = 42-47% |
| stagLong 3.9 | 3 | 7 | 9 | 19/36 = 53% |
| stagLong 4.6 | 4 | 7 | 9 | 20/36 = 56% |
| stagLong 3.9 + blowRef 17 | 3 | 8 | 9 | 20/36 |
| stagLong 3.9 + blowRef 18 | 0 | 9 | 9 | 18/36 |
| stagLong 3.9 + hitCap 4 (=blowRef 20) | 8 | 10 (blowRef 20 run) | 9 | 27/36 = 75% over |
| + hp 1200 | 4 | 5 | 8 | 17/36 = 47% under |
| FINAL: stagLong 3.9, blowRef 20, hp 1145 | 6/12 | 8/12 | 9/12 | **23/36 = 64% [48-77]** |
Knight cell swings 0-8 with tiny knob moves (blowRef 18 = 0/12, 20 = 8/12): treat 6/12 as "knight 3-9". The bimodality is the finding: the knight is on the edge of a threshold.
## CHECKS (each alone)
node: rootway, first-cards (cards untouched), boss-read: green. Browser: damage-caps (10 caps hold, includes the Huntmaster cap, dynamic in HM), boss-greed, boss-openings (huntmaster open 4 s, weak point true): exit 0. No restamps needed (no pin reads these values).
## NOT VERIFIED
No full suite / QUICK gate; no demo or combat-replay checks; no human knight playtest; first / built ways not measured; CF1 flag-ON rate not re-run on this branch (CF1 was ~-5 pts on Rootway, inside noise: expect ~59% with it, re-measure at the CF1 gate); co-op not measured; page crashes at --jobs=2 with n=36 (4 knight seeds, re-run alone) - use --jobs=1.
## Questions (rec first)
1. Ship the 3 values? REC yes (flag-free, merge = live), then re-measure at n=36 with CF1 on before CF1 ships.
2. Long-term: give the knight a heavier opening blow (kit change) instead of a longer cap? REC no (kits are off limits; this boss tuning is enough).
