# codex/gatehardening — October 18, 2026

Base: `origin/master` at `e0436ee8`. No master merge or deployment was performed.

## Merge recovery

`node tools/resolve-generated-merge.mjs --merge=origin/topic` starts a no-commit merge. If `src/marks.js` conflicts, it three-way merges the authored sections with the generated MARK block removed, regenerates MARK through `tools/tells.mjs --write`, runs `tells`, and stages the result. If `tools/check.mjs` conflicts, it three-way merges the rest of the file and unions both branches' named check lists, runs syntax validation, and stages it. The helper stops on a genuine authored conflict or any other unresolved file. It can also be run without `--merge` after a merge stops. The coordinator must use this helper in its external integration script to get automatic recovery.

Validation: `node tools/resolve-generated-merge.mjs --selftest` passed (authored edits merged; check names unioned); `node --check tools/resolve-generated-merge.mjs` passed; `node tools/tells.mjs --write` and `node tools/tells.mjs` both exited 0 on current master, 1011 mark rows. The selftest did not start a real merge.

October 18 follow-up: I also ran a temporary real Git fixture outside the repository. Both `src/marks.js` and `tools/check.mjs` conflicted on `git merge --no-commit`; the helper then merged disjoint authored marks changes, regenerated MARK through the fixture's `tells --write`, unioned `alpha` and `beta` check names, and left no unmerged paths. A first fixture put authored changes on adjacent lines and correctly stopped with `STOPPED: authored content conflicts` rather than guessing. The scratch fixture was removed after verification.

## Gate receipt

`node tools/gate-watch.mjs --log=PATH -- [check flags]` runs `tools/check.mjs`, copies its output to the log, and writes a terminal line: `gate done / PASS`, `gate done / FAIL`, or `gate done / STOPPED` on an interrupt or timeout. It signals only the child it started. A short selftest wrote `gate done / PASS`; a timeout selftest wrote `gate done / STOPPED timeout 0.005 min` and exited 130. Logs are outside git at `../gatewatch-selftest.log` and `../gatewatch-stopped-selftest.log`.

An actual `tells` subset through the watcher exited 0 and the saved log ends `gate done / PASS | 1.7s | 2026-10-18T16:52:47.902Z` (`../gate-watch-real-tells.log`). This checks the child handoff and log readback in addition to the synthetic PASS/STOPPED paths.

## Remaining

The Claude coordinator must wire the merge helper and gate watcher into its release script outside this repository. Serial/parallel verdict equivalence remains on `codex/parallelproof` and is not claimed here.

## QUESTIONS FOR DANIEL

- **Recommended: have the coordinator call `resolve-generated-merge.mjs --merge=<ref>` for each batch merge.** It leaves the merge uncommitted for review and the full gate.
