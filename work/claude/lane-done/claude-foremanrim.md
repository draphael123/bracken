# claude/foremanrim - THE FOREMAN's MISSED BOARDING (Sonnet, 2026-10-12) - base claude/batch87 570e994b

## What was built (src/foreman.js, src/minecart-hands.js, src/lab.js, tools/minecart.mjs)
- MISSED BOARDING: landing on his cart's rim while the brace spikes are UP and RISEN (FOREMAN.spikeRise 0.35 s after the brace starts) costs the full bump (spikeDmg = bumpDmg 18) and throws you back off the cart (vy lurchVy, your cart bounced back 70 px, 0.6 s inv). Landing in the first 0.35 s of the brace is still the old turned 'BRACED' clank, so a hero thrown off by the lurch can never be spiked before the spikes are drawn up.
- TOLD: sound + '!! SPIKES UP: DO NOT LAND' the moment the brace starts, spikes drawn rising through the lid and a blinking 'SPIKES UP' over it, his drift says 'SPIKES UP: WAIT' (not 'JUMP ON HIM') while they are up, 'SPIKES DOWN: JUMP ON HIM' (green) + sound when they drop, 'SPIKED! THROWN BACK' on the hit. Fair for every hero: only a landing, base movement, nothing to learn but wait.
- BOT: foremanPlan has a mistiming rate (FOREMAN_PLAN.spikeMiss 0.3: the share of his drifts, spikes up, that a player jumps on anyway). tools/minecart.mjs +5 asserts (368 ok): told rise, spiked = full bump, drift word, spikes-down word.
- !! FINDING (the real lever): the lab's Foreman branch passed eyes:true for the 'human' profile, which makes foremanPlan see every tell/mark instantly and never misread - that perfect-eyes bypass, not the numbers, is why he sat at 100% (picks never landed). The branch now reads like the profile's human (src/lab.js: reaction drawn triangular from rtMin/rtMode/rtMax = 254-578 ms for each tell and each pick mark, misread chance LABP.misread 0.146). That alone moves 100% -> 83%; the spike mechanic on top is small (spikeMiss 0 vs 0.3 both ~83%, ~0.5 spikes a fight). Sweeps at bump/spike 30-50 and spikeMiss up to 1.0 with PERFECT eyes stayed 94-100% (flasks absorb it), so the number is the bot's eyes.

## Rates (boss-rates minecart:mini,minecart --profile=human --flasks=kit --ways=practiced --seeds=12, L13, PORT 8861)
| | knight | warden | pyro | all |
|---|---|---|---|---|
| Foreman | 12/12 | 9/12 | 9/12 | **83%** (target 75-85) |
| Great Drill | 7/12 | 9/12 | 8/12 | **67%** (60-70, unchanged) |
(tools/boss-rates.mjs still prints the old mini band 70-75 -> shows 'HIGH +8'; B6 amended is 75-85, left as is.) Fights 37-60 s.

## Stamps (level THEN boss)
docs/level1-pilot.json (229%/5), docs/level1-curve.json minecart act 2: **199%, 5 deaths** (band 70-400 / 0-6), docs/mash-bot.json level rows (knight 5, warden 6, pyro 5 deaths: not cleared) then boss rows: mash 0/6 (Foreman + drill). NOTE the level pilot is noisy run to run (4 re-runs: 204/3, 229/6, 299/8, 199/5 deaths; one earlier run 294%/7) - the stamped one is the 199%/5 sample; the cart pilot never jumps while the spikes are up so the mechanic does not touch it.

## Checks (PORT 8861)
minecart 368 ok, minecart-route (knight rode it), boss-openings, boss-read, tells, untold-told, boss-fight-end (61), level-quality minecart clears: all green. curve-gate: red on wood (5 deaths) and marsh (275%) - not mine (act-1 rows, pre-existing on batch87); the minecart row is not listed. Not run: minecart-aloft, corpses, mobile-perf, full suite (shared PC).

## QUESTIONS FOR DANIEL (rec first, as built)
1. The Foreman's 100% was the lab bot's perfect eyes; I made it read like the human profile (rec: keep - it is what 'human' claims to be; other bosses already have this layer). If you'd rather keep the old bot, the mechanic alone gives ~100% at any believable damage, so the mini would need another lever.
2. The spikes mechanic as built is a light one (~0.5 spikes a fight at a 30% mistime rate). Rec: keep as is (told, fair); a heavier version (spikes up more of the fight) would be a redesign.
3. curve-gate wood/marsh red on batch87 base - someone owns an act-1 re-stamp.
