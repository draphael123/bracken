# Task D — parallel proof (completed with named non-equivalence)

Base: `origin/master` (`7ade0605`), which contains `claude/codexmerge`. Branch: `codex/parallelproof`. Do not merge this branch yet.

## Changes and evidence

- Added `tools/release-suite.mjs`. It forwards suite flags and check names to the unchanged `tools/check.mjs`, saves the full output at `--log=<path>` (or a named temporary file), then prints the original ` ok ` / `FAIL <name>` result lines and one `VERDICT` line with counts, exit code, wall time, and log path.
- Syntax passed. A `tells` subset returned two original ` ok ` lines and `VERDICT PASS: 2 ok, 0 FAIL`; receipt `work/release-suite-tells.log` outside this checkout. An invalid jobs flag produced `VERDICT FAIL`, exit 1; receipt `work/release-suite-invalid.log` outside this checkout. This verifies wrapper behavior, not full-suite equivalence.
- The saved `proof-f002-jobs4-3.log` and its screenshot showed `THE WEAVER` intro card overlapping a `!!` mark while the Owl Reeve's boss bar was also active. The audit was teleporting from a level's arena boss to its mini in one level instance. `textfit` now reloads between those two fights. The game also resets the mini intro timer on level load, so a previous level's title cannot follow into the next one. No assertion was removed.
- The first isolated strict boss sweep after that change had no Weaver issue but exposed `OPEN` partly offscreen on a minecart gate. The gate's four-letter status is now drawn only when its full word fits in the view. Two subsequent sweeps exposed a Sexton damage number crossing a windup mark; damage popups now shift beside active marks. Before receipts: `work/parallelproof-boss-after-{1..3}.log` and their screenshots. After: three consecutive strict boss sweeps, each 1,890 screens and zero issues/pictures (`work/parallelproof-boss-final-{1..3}.log`, outside this checkout).
- `archmage-folly`: the former 10-blink spread failure was a random sample (saved failure span 278 px against 300). The audit now pins the page and simulation random streams to the repo's 1919 test seed; three standalone passes produced the identical ten positions and a 368 px span (`work/parallelproof-arch-seeded-{1..3}.log`). Its spread assertion remains 300 px.
- `unburied-look`: the former `fallenBanner@321` miss was a borderline random lighting result (printed mean 12.0, just under the existing 12 margin). The page and each simulation evaluation now use the same 1919 stream. Three standalone full look sweeps passed, including 81 decorations with zero below the unchanged margin (`work/parallelproof-unburied-seeded-{1..3}.log`). Both checks rejoined the browser pool and passed three `--jobs=3 --max-browsers=1` pooled subsets (`work/parallelproof-pool-seeded-{1..3}.log`).

## Same-commit full-suite proof, then a new fix

The full scoped `textfit` run passed: `ok textfit`, zero pictures, 189.6 seconds (`work/parallelproof-scoped-textfit.log`, outside this checkout). The requested four full runs were made on code commit `41a52d55`, without editing code between them. Each processed 386 checks:

| Run | Wall time | Pass | Fail names |
| --- | ---: | ---: | --- |
| Serial | 13,780 s | 381 | `normal-health`, `reed-island`, `mark-integrity`, `slopes-trace`, `textfit-full` |
| jobs=3, browsers=1 #1 | 7,664 s | 381 | `normal-health`, `mark-integrity`, `no-hidden-hits`, `slopes-trace`, `textfit-full` |
| jobs=3, browsers=1 #2 | 7,571 s | 381 | same five as #1 |
| jobs=3, browsers=1 #3 | 7,577 s | 382 | `normal-health`, `mark-integrity`, `slopes-trace`, `textfit-full` |

Full logs are outside this checkout at `work/parallelproof-full-serial.log` and `work/parallelproof-full-jobs3-{1,2,3}.log`. Parallel was about 1.8x faster here. Verdict sets did **not** match. `no-hidden-hits` is an intermittent pixel oracle red whose optional red-flash cause and five-pass fix are on the separate Task C branch; it failed parallel #1/#2 and passed serial/#3. `reed-island` failed serial alone. Its `ambushLab` used ambient `Math.random` unlike the seeded boss lab. Five fresh standalone reruns before correction reproduced two failures at the unchanged six-row-opened assertion. The lab now seeds each level/hero/rep row before load/start and restores the prior generator after the row. Five reruns then passed with byte-identical row output; `ambush-single`, `ambush-reach`, `reed-island`, and the Burning Village ambush pilot passed. No assertion or threshold changed. This new fix is **after** the four full-suite measurements, so equivalence must be remeasured on its commit.

The fixed scoped Weaver text audit passed in the serial and all three parallel full runs. The full strict sweep still found two sign-cover issues in all runs (Task C fixes are not on this base). Its extra issues varied: three arena prompt overflows in parallel #1, none in #2, and one minecart mini offscreen mark in #3. The check name stayed `textfit-full` in every run. `normal-health` is a pre-existing Pyro/Bullfrog red also reproduced on clean master; `mark-integrity` and `slopes-trace` have fixes on Task C's separate branch.

`firsthour` stays in the serial tail: one pooled run reached 47% Bullfrog health and phase 2 but the court had not drained after the check's 30 simulation frames; five fresh-profile reruns passed, and the cause is not isolated. `fallingtower2-keys` stays in the serial tail: one pooled run began the Pyromancer's outer-face section off its intended floor and climbed only 2/9 planks; five fresh-profile reruns passed, and the cause is not isolated. Task C is awaiting a Scree curve decision, so its fixes are not in this branch's `origin/master` base.

On the pushed seed fix `fff40350`, three pooled subsets (`archmage-folly,unburied-look,reed-island,textfit` at `--jobs=3 --max-browsers=1`) passed 5/5 each, with zero scoped text pictures and wall times 295, 277, and 281 seconds (`work/parallelproof-postseed-pool-{1,2,3}.log`, outside this checkout).

## Fresh full proof on one commit

All four fresh runs used unchanged branch head `39a2e304` (code fix `fff40350`) on October 17. Each processed 386 checks; complete logs are outside this checkout at `work/parallelproof-seed-full-serial.log` and `work/parallelproof-seed-full-jobs3-{1,2,3}.log`.

| Run | Wall time | Pass | Exact FAIL names |
| --- | ---: | ---: | --- |
| Serial | 12,089 s | 383 | `normal-health`, `slopes-trace`, `textfit-full` |
| jobs=3, browsers=1 #1 | 7,007 s | 382 | `normal-health`, `no-hidden-hits`, `slopes-trace`, `textfit-full` |
| jobs=3, browsers=1 #2 | 7,923 s | 382 | `normal-health`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| jobs=3, browsers=1 #3 | 7,743 s | 383 | `normal-health`, `mark-integrity`, `textfit-full` |

Parallel averaged 7,558 s here, about 1.60x the serial throughput (37.5% less wall time). `reed-island`, seeded by this branch, passed in all four runs. Scoped `textfit`, including the Weaver plate case, passed with zero pictures in all four. `firsthour` and `fallingtower2-keys` passed in the serial tail of all three parallel runs.

**Verdict: the exact sets still differ.** The differences are `slopes-trace` (serial and parallel #1 red), `mark-integrity` (parallel #2/#3 red), and `no-hidden-hits` (parallel #1/#2 red). The same checks fluctuated in standalone or earlier full runs, and Task C has their cause-specific fixes on `codex/standingreds`: deterministic trace clock; undead-mage spell-tell pose priority plus offscreen sprite-frame comparison; optional hit-flash disabled while checking the already unchanged visible-foe pixel assertion. Parallel #1's `no-hidden-hits` detail is the original Hurricane sailor hook `0 px` case. None is a pool-only failure. `normal-health` is the independently reproduced Pyro/Bullfrog red; `textfit-full` has layout fixes on Task C, which is not in this branch's code. No result threshold or assertion was relaxed here.

The wrapper and the scoped race/seed fixes are ready for integration. To claim exact full-suite equivalence, merge Task C's separate fixes and rerun the target proof on the combined commit. Do not claim equivalence from these four logs.

## QUESTIONS FOR DANIEL

- Recommendation: keep `--jobs=3 --max-browsers=1` provisional, merge the cause fixes from `codex/standingreds`, then rerun a combined release proof before enabling parallel by default. I built the release wrapper, removed the Weaver harness contamination, seeded the pooled audits and Reed Island ambush rows, and measured all four required full runs; the three remaining changing verdict names and their causes are above.
