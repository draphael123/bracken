# Task D — parallel proof (partial; fresh full proof pending)

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

## Remaining work

Repeat the one-serial/three-parallel proof on the new Reed Island seed commit and compare exact verdict sets. If differences remain, isolate them before calling the target release setting equivalent. Do not merge this branch yet.

## QUESTIONS FOR DANIEL

- Recommendation: keep the target release setting at `--jobs=3 --max-browsers=1` provisional until fresh same-commit verdict sets match or every remaining difference is proven. I built the release wrapper, removed the Weaver harness contamination, and pinned the ambush lab's row dice; full equivalence remains unproved.
