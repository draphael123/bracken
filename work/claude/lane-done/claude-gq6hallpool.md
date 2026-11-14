# GQ6HALLPOOL - second independent joint n=36 at cdS3 15, pooled n=72 (11-14 08:21)
VERDICT: NOT READY by the letter of the rule (pooled 43/72 = 59.7 pct [48-70], just under the 60-70 band; point estimate sits on the lower edge, the CI spans the whole band). Measure-only: no code change, no flag flip, nothing merged. Branch claude/gq6s2 tip before this report 1fcf702a0.

## Method (identical to gq6hallstep2)
Practiced bot, flasks kit, S2+S3 preview ON, L22, 360 s: BRACKEN_GQ6S2=1 BRACKEN_GQ6S3=1 SEED0=100 node tools/boss-rates.mjs crown --ways=practiced --seeds=12 --jobs=1 --level=22 --secs=360. DIFFERENT SEEDS: first 36 used seeds 1-12 per hero, this 36 used 101-112 per hero (SEED0=100). RAM 7.7 GB free before launch, one headless, closed itself.

## Second 36 on its own
| hero | wins/12 | losses |
| knight | 6 | hall 3, roof 3 (P2 deaths) |
| warden | 6 | hall 4, roof 2 (both timeouts at 360 s) |
| pyro | 5 | hall 7 |
| TOTAL | 17/36 = 47 pct [32-63] | hall 14, roof stage 5 (3 deaths + 2 timeouts) |

## First 36 (gq6hallstep2, for pooling)
knight 10, warden 6, pyro 10 = 26/36 = 72 pct; losses hall 10, roof 0, timeouts 0.

## POOLED n=72
| hero | wins/24 | pct |
| knight | 16 | 67 |
| warden | 12 | 50 |
| pyro | 15 | 63 |
| POOLED | 43/72 = 59.7 pct, Wilson 95 pct [48-70] | |
Loss locations pooled (29 losses): hall 24, roof stage 5 (3 deaths, 2 timeouts), S2/S3 split not recorded in the logs for losses (stage field says roof; s2 tally empty on losses). Timeouts 2 (both warden).
Warden alone: 12/24 = 50 pct (6/12 both batches), hall deaths 10 of 12 losses; still the weak hero as expected from the weak lab bot.

## Reading
The two batches disagree sharply (72 vs 47; difference is mostly pyro 10/12 -> 5/12 and 2 hall losses -> 7), so the first batch was a lucky draw and the true rate at cdS3 15 is likely near 55-62. Pooled sits on the lower edge of the band; the knob is not too easy. Knight 67 and pyro 63 are in band, warden 50 drags the pool.

## Recommendation (NOT taken)
Do not flip. Rule says < 60 = NOT READY, but 59.7 is within a hair of the band. Options, rec first: (1) hold cdS3 at 15 and treat as essentially in band; spend the next lane on warden hall survivability (a warden-bot or hall block/ward lever) rather than moving the shared knob; (2) if a global lever is wanted, the nearest is cdS3 15 -> 16.5 s (about a half-step back toward easier), then n=36.
Raw: scratch/lane-reports/gq6hallpool/n36b.json and n36b.log.

Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
