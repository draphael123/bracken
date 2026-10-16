# Task D — parallel proof (in progress)

Base: `origin/master` (`7ade0605`), which contains `claude/codexmerge`. Branch: `codex/parallelproof`. Do not merge this branch yet.

## Changes and evidence

- Added `tools/release-suite.mjs`. It forwards suite flags and check names to the unchanged `tools/check.mjs`, saves the full output at `--log=<path>` (or a named temporary file), then prints the original ` ok ` / `FAIL <name>` result lines and one `VERDICT` line with counts, exit code, wall time, and log path.
- Syntax passed. A `tells` subset returned two original ` ok ` lines and `VERDICT PASS: 2 ok, 0 FAIL`; receipt `work/release-suite-tells.log` outside this checkout. An invalid jobs flag produced `VERDICT FAIL`, exit 1; receipt `work/release-suite-invalid.log` outside this checkout. This verifies wrapper behavior, not full-suite equivalence.

## Remaining work

Investigate the scoped Weaver text overlap and the four isolated browser checks. Run one serial and three `--jobs=3 --max-browsers=1` full suites on one commit, compare verdict sets and wall times, and name any remaining cause. Task C is still awaiting a Scree curve decision, so its fixes are not in this branch's `origin/master` base.

## QUESTIONS FOR DANIEL

- Recommendation: keep the target release setting at `--jobs=3 --max-browsers=1` until the same-commit verdict sets are measured. I built the release wrapper and verified its output contract on a small subset; full equivalence remains unproved.
