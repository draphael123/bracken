# GQ6HALLSTEP2 - ease the Queen's hearth jet one step, re-measure joint n=36 (11-14 08:10)
VERDICT: TOO EASY (72 pct [56-84] at n=36, above 60-70; the CI spans the whole band). Branch claude/gq6s2, tip 31d0df244 (parent bbc98593e). Not merged/deployed; ship flags untouched (S2/S3 OFF).

## The knob
Q4N.hearth.cd (hearth jet cooldown) 12 -> 15 s, new field Q4N.hearth.cdS3 in src/gq4q.js, read in hearthStart (src/gqueen-hands.js) only when S3 is on (S3 implies S2). Flags off: cd stays 12 (byte-identical path). Previous step (throne fire every 36 s on S3) kept.

## Measurement (practiced bot, flasks kit, S2+S3 on, L22, 360 s; BRACKEN_GQ6S2=1 BRACKEN_GQ6S3=1 node tools/boss-rates.mjs crown --ways=practiced --seeds=N --jobs=1 --level=22 --secs=360)
n=6 sanity: knight 2/2, warden 1/2, pyro 2/2 = 5/6 = 83 pct [44-97].
n=36:
| hero | wins/12 | losses |
| knight | 10 | hall 2 |
| warden | 6 | hall 6 |
| pyro | 10 | hall 2 |
| POOLED | 26/36 = 72 pct [56-84] | hall 10 (all losses), S2 roof 0, S3 platform 0, timeouts 0 |
Before (gq6hallstep, fire 36 only): 19/36 = 53 pct, hall losses 16 (+1 platform). Hall losses 16 -> 10; the roof side lost nothing.
Jet cost: per hall loss 60 hp -> 49 hp (hearth jet share of damage taken); throne fire per hall loss 87 -> 92 hp (unchanged within noise). Jet per win about 32 hp. Fights are shorter in the jet's absence only slightly; hall loss times similar.
Warden is the weak hero at 6/12 (50 pct), all hall deaths; knight and pyro at 83 pct. Hero spread, not the pool, is now the gap.
Logs: scratch/lane-reports/gq6hallstep2/ (n6, n36 json+log, proofs).

## Flag-off-unchanged proof
Node proofs flags OFF all green: gq5q1 (119 ok), gq6s2 OFF (4), gq6s3 OFF (5, pins master's seeded fight hash), gq4q (62), gq5q2 (89), gqueen3 (135). Flags ON: gq6s2 ON 68, gq6s3 S2-only 6, gq6s3 ON 108, gq5q1 with S3 green (119). (The two "FAIL" grep hits in gq5q1/gq5q2 logs are the text "no FAIL above" in ok lines.) No restamps needed - nothing moved. Never ran tools/check.mjs.

## Recommendation (NOT taken)
Too easy by the point estimate: take HALF the step: cdS3 12 -> 13.5 s (or 14). Re-measure n=36; expect about 62-66. Note the CI [56-84] spans the band, so this could be noise: 36 more fights at the current knob (SEED0 offset) would tell before changing anything. Warden's 50 pct is the thing to watch.

## Questions for Daniel (rec first)
1. Half step (cdS3 13.5)? Rec: yes, but first n=36 more seeds at cdS3 15 to pool n=72 (cheap, about 10 min) and decide on the pooled number.
2. Keep everyS3 36 alongside? Rec: yes (the two steps together are what produced 72).
3. Warden lags knight/pyro by 33 points: look at warden's hall (block/ward vs throne fire) separately? Rec: only if the pooled n=72 still shows it.
