# Task D — parallel proof (in progress)

Base: `origin/master` (`7ade0605`), which contains `claude/codexmerge`. Branch: `codex/parallelproof`. Do not merge this branch yet.

## Changes and evidence

- Added `tools/release-suite.mjs`. It forwards suite flags and check names to the unchanged `tools/check.mjs`, saves the full output at `--log=<path>` (or a named temporary file), then prints the original ` ok ` / `FAIL <name>` result lines and one `VERDICT` line with counts, exit code, wall time, and log path.
- Syntax passed. A `tells` subset returned two original ` ok ` lines and `VERDICT PASS: 2 ok, 0 FAIL`; receipt `work/release-suite-tells.log` outside this checkout. An invalid jobs flag produced `VERDICT FAIL`, exit 1; receipt `work/release-suite-invalid.log` outside this checkout. This verifies wrapper behavior, not full-suite equivalence.
- The saved `proof-f002-jobs4-3.log` and its screenshot showed `THE WEAVER` intro card overlapping a `!!` mark while the Owl Reeve's boss bar was also active. The audit was teleporting from a level's arena boss to its mini in one level instance. `textfit` now reloads between those two fights. The game also resets the mini intro timer on level load, so a previous level's title cannot follow into the next one. No assertion was removed.
- The first isolated strict boss sweep after that change had no Weaver issue but exposed `OPEN` partly offscreen on a minecart gate. The gate's four-letter status is now drawn only when its full word fits in the view. Two subsequent sweeps exposed a Sexton damage number crossing a windup mark; damage popups now shift beside active marks. Before receipts: `work/parallelproof-boss-after-{1..3}.log` and their screenshots. After: three consecutive strict boss sweeps, each 1,890 screens and zero issues/pictures (`work/parallelproof-boss-final-{1..3}.log`, outside this checkout).

## Remaining work

The full scoped `textfit` run passed: `ok textfit`, zero pictures, 189.6 seconds (`work/parallelproof-scoped-textfit.log`, outside this checkout). Investigate the four isolated browser checks. Run one serial and three `--jobs=3 --max-browsers=1` full suites on one commit, compare verdict sets and wall times, and name any remaining cause. Task C is still awaiting a Scree curve decision, so its fixes are not in this branch's `origin/master` base.

## QUESTIONS FOR DANIEL

- Recommendation: keep the target release setting at `--jobs=3 --max-browsers=1` until the same-commit verdict sets are measured. I built the release wrapper and removed the Weaver harness contamination; full equivalence remains unproved.
