# Task A: suite speed

Status: **Runner implemented and same-commit verification completed on 2026-10-15.** Branch `codex/suitespeed` is based on `origin/master`. No game source (`src/`) or test assertion was changed. The scoped `textfit` audit exposed an intermittent red in one of three parallel full runs, so exact verdict equivalence remains a question, documented below.

## What is saved

The runner supports `--jobs=N`, `--max-browsers=N`, and timing-balanced deterministic `--shard=i/n`. It assigns each worker a separate port block and browser profile, reuses its server and browser where safe, and uses fresh browser contexts so storage cannot cross checks. Each check's output remains together, with one original-style ` ok ` or `FAIL <name>` line and added elapsed time. The release script's literal spawn-argument text and quoted check-name list remain in `tools/check.mjs`. The committed `tools/check-timings.json` contains all 374 baseline measurements. Chrome's optional `BRACKEN_BROWSER` path override preserves the Windows default.

The serial tail covers `mobile-perf` (frame timing), `boss-music` (real-time audio), `online-coop` (two browsers), `cdp-recovery` (browser recovery), `textfit` and `textfit-full` (multi-page text audits), and `profile-cleanup` and `profile-leaks` (global profile/process inspection). Four browser checks were added after pooled-only failures: `firsthour`, `fallingtower2-keys`, `archmage-folly`, and `unburied-look`. Each now gets a fresh browser profile after the pool. Direct-browser checks are isolated as well. See `tools/check-pool.mjs` for the executable list and reasons.

## Measurements and checks run

| Run | Wall time | Checks | Reds |
| --- | ---: | ---: | --- |
| Clean `origin/master` baseline | 3h 27m 14s | 374 | `tower-collapse`, `boss-jump`, `curve-gate`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| Exploratory `--jobs=4 --max-browsers=2` before lifecycle fix | 69m 26s | 374 | 9; four context races and one profile-cleanup lifecycle failure led to fixes |
| Same commit `e8c60f8b`, parallel #1 | 78m 00s | 374 | `curve-gate`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| Same commit, `--jobs=1` | 3h 21m 37s | 374 | Same four |
| Same commit, parallel #2 | 72m 02s | 374 | Same four, plus `archmage-folly` and `mobile-perf` |
| Corrected output, before fresh-browser isolation (`accf93f9`), parallel #1 | 73m 52s | 374 | `firsthour`, `curve-gate`, `no-hidden-hits`, `fallingtower2-keys`, `textfit-full` |
| First full run at `55c33519`, before isolating `unburied-look` | 79m 34s | 374 | `unburied-look`, `curve-gate`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| `ef2f05fc` parallel #1 | 79m 48s | 374 | `curve-gate`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| `ef2f05fc` parallel #2 | 77m 07s | 374 | Same four |
| `ef2f05fc` parallel #3 | 79m 43s | 374 | Same four, plus `unburied-bailey` misreported red by a browser-context disposal race |
| `f7caf3c9` parallel #1, before textfit browser isolation | 73m 26s | 374 | Same four, plus scoped `textfit` (Weaver title/warning overlap) |
| Same commit `f00290e2`, parallel #1 | 74m 44s | 374 | `curve-gate`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| Same commit `f00290e2`, parallel #2 | 85m 53s | 374 | `curve-gate`, `mark-integrity`, `textfit-full` |
| Same commit `f00290e2`, parallel #3 | 81m 03s | 374 | `curve-gate`, `mark-integrity`, `no-hidden-hits`, scoped `textfit`, `textfit-full` |
| Same commit `f00290e2`, `--jobs=1` | 3h 11m 10s | 374 | `curve-gate`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| Same commit `f00290e2`, shard 1/2 | 39m 00s | 187 | `curve-gate`, `mark-integrity`, `no-hidden-hits` |
| Same commit `f00290e2`, shard 2/2 | 41m 49s | 187 | `textfit-full` |
Full logs are beside this report: `baseline-suite.log`, `jobs4-run1.log`, `jobs4-equivalence-1.log`, `jobs1-equivalence.log`, and `jobs4-equivalence-2.log`. `archmage-folly-standalone.log` and `mobile-perf-standalone.log` show both intermittent failures passed alone. `mobile-perf` failed its unchanged 600 ms Red Gorge frame budget at 642.8 ms in parallel #2; its standalone worst frame was 35.5 ms. The third parallel full run was interrupted before results were emitted to honor the shutdown request; it is **not** counted as proof. The later `f00290e2` runs below provide the final same-commit comparison.

The baseline's 30 slowest checks, in descending wall time, are below. Most are page checks that paid for their own server and Chrome startup on the baseline. The long combat, travel, and text checks also simulate many frames or layouts. `boss-music` is Node-only with real timers; `profile-cleanup` deliberately exercises multiple browser shutdown paths. `check-timings.md` has **all 374** checks sorted by wall time, classifies 223 page and 151 Node checks, and identifies pool and serial-tail handling.

The new red in `firsthour` was its court not draining at 47% boss health; `fallingtower2-keys` placed the Pyromancer at the wrong start and climbed only 2/9 outer-face planks. The full output is preserved in `final-jobs4-1.log`. Each of these checks and the earlier intermittent `archmage-folly` passed **five of five** `--jobs=1` subset reruns, in the individual `*-jobs1-1.log` through `*-jobs1-5.log` files. The isolated-tail subset `fresh-browser-tail.log` passed syntax and all three unchanged checks. This is a scheduling repair, so the 73m 52s run is evidence, not one of the three final same-commit equivalence passes.

The `55c33519` full run is preserved in `proof-jobs4-1.log`. It produced 369 ` ok ` and five `FAIL` summary lines, one for each check, so the output contract held. `unburied-look` reported one borderline dressing read: `fallenBanner@321`, mean luminance `12.0`, 117 pixels. The unchanged check then passed **five of five** isolated `--jobs=1` reruns (`unburied-look-serial-1.log` through `-5.log`). It is now in the fresh-browser tail; this prior run is not part of the final same-commit equivalence proof.

The four-check fresh-browser subset after that change passed `unburied-look`, `firsthour`, and `fallingtower2-keys`; `archmage-folly` failed its random blink spread because the ten samples covered only 278 px of the room against an unchanged 300 px requirement. Its first fresh `--jobs=1` rerun also failed (`archmage-serial-recheck-1.log`), demonstrating a serial red. The subset receipt is `fresh-browser-tail-2.log`. No game code, test assertion, or tolerance changed.

The three `ef2f05fc` full logs are `proof-ef2f-jobs4-1.log` through `-3.log`. Runs 1 and 2 emitted exactly 370 parseable ` ok ` and four `FAIL` summary lines. In run 3 the check `unburied-bailey` passed internally but the pool reported it failed with `Failed to find context with id ...` while tidying Chrome after the check. Chrome had disposed the context between listing and disposal. The cleanup now accepts that exact already-gone-context response, without hiding any check failure. The affected `unburied-bailey` subset and the separate consecutive-context storage self-test passed (`context-disposal-fix.log`; `context-storage-selftest.log`). This earlier run is excluded from the final proof.

The first `f7caf3c9` full run is `proof-f7ca-jobs4-1.log`: it completed 374 checks in 73m 26s. Scoped `textfit` saw `THE WEAVER` overdrawn and colliding with a `!!` mark in one of 3,316 frames; this was not in the previous full runs. Six consecutive fresh `--jobs=1 textfit` reruns passed with zero pictures (`textfit-serial-recheck-1.log` through `-6.log`). The parallel tail had been borrowing a Chrome incognito context for both text scopes; it now gives each the same own-browser lifecycle as `--jobs=1`, still serial after the pool. The targeted `--jobs=4 textfit` run passed with zero pictures (`textfit-own-browser-1.log`). However, the same Weaver collision and overdraw returned in `f00290e2` parallel #3 despite that change. Browser borrowing was therefore not shown to be the cause. No test or game source changed.

## Final same-commit comparison

The exact runner commit `f00290e2` produced three full `--jobs=4 --max-browsers=2` runs, one full `--jobs=1` run, and both `--shard=i/2` runs. The six receipts are `proof-f002-jobs4-1.log` through `-3.log`, `proof-f002-jobs1.log`, and `proof-f002-shard-1of2.log` and `-2of2.log`. All four full runs emitted exactly 374 parseable result lines, one per check. Shards emitted 187 each; their name sets have zero overlap and their 374-name union equals the full list exactly. Shard verdicts matched the serial full run. Each shard has far more than the release script's 50-` ok ` threshold (184 and 186); retain that threshold per shard, then combine both logs to judge the release.

The common four reds match the earlier serial run and clean-master reds. `no-hidden-hits` passed in parallel #2 and failed in the other three full runs, including `--jobs=1`; it is a demonstrated serial flake. The scoped `textfit` red appeared only in parallel #3; it passed the other two parallel full runs, the serial full run, and six serial subset reruns. The single two-picture Weaver finding is not yet demonstrated at `--jobs=1`. **This is the remaining equivalence limit:** the runner kept the unchanged audit and captured the discrepancy; Daniel and Claude should not treat it as a green equivalence proof. The suite speed goal is met for this PC: 74–86 minutes versus 3h27m on clean master, or 2.4–2.8 times faster. The same-commit serial run was 3h11m; the parallel median was 81m03s, 2.36 times faster than that serial run.

The exact executable trees for these runs are `tools` at `b1df84f3d2028b7171ea0e481dfcb00e125bca09` and untouched `src` at `250beb342f8e67f9e0abac2e7c981ea838a8322b`. The checkpoint commit below changes only the report and logs, so these trees remain stable even though the branch SHA advances.

| Rank | Check | Seconds |
| ---: | --- | ---: |
| 1 | profile-cleanup | 483.2 |
| 2 | textfit-full | 353.3 |
| 3 | levelling-runtime | 273.6 |
| 4 | no-hidden-hits | 269.5 |
| 5 | riposte | 251.2 |
| 6 | boss-jump | 247.1 |
| 7 | commitment | 239.6 |
| 8 | zipline | 194.4 |
| 9 | touch | 182.7 |
| 10 | harvest-fair | 163.5 |
| 11 | cdp-recovery | 163.2 |
| 12 | mark-integrity | 162.9 |
| 13 | textfit | 160.6 |
| 14 | riposte-shots | 144.2 |
| 15 | skyroad-stuck | 139.0 |
| 16 | lab-order | 138.4 |
| 17 | canal-tunnel-route | 115.5 |
| 18 | boss-fight-end | 113.0 |
| 19 | small-adds | 108.3 |
| 20 | boss-music | 106.5 |
| 21 | combat-part2 | 96.7 |
| 22 | corpses | 92.3 |
| 23 | windcaller-gusts | 90.4 |
| 24 | skill-balance-probe | 87.5 |
| 25 | wicker-man | 86.3 |
| 26 | ore-work | 86.1 |
| 27 | ability-poses | 84.9 |
| 28 | bells | 83.9 |
| 29 | store | 82.4 |
| 30 | online-coop | 82.4 |

## October 14 output-contract correction

The baseline and first comparison runs revealed a release-parser bug: a long check name could touch its time, and a failed check's own `FAIL` line could be mistaken for another check. Parallel checks also buffered their output but printed only the last line or last 30 lines. The runner now leaves a fixed separator before elapsed time and prints each parallel check's complete buffered output under an indented heading. The focused `mark-integrity` rerun produced exactly one parseable `FAIL mark-integrity ...` summary and preserved its known undeadmage phantom details; `output-contract.log` is the receipt. The check itself remains red as on the clean baseline. The final `f00290e2` logs confirm the output contract.

## QUESTIONS FOR DANIEL

1. **Recommendation:** On the 16 GB, 8-core main PC while two other heavy processes run, start with `--jobs=3 --max-browsers=1`. This PC has 20 logical cores and about 32 GB RAM; its measured configuration is `--jobs=4 --max-browsers=2`. The main PC setting still needs a local memory and timing check.
2. **Recommendation:** Keep the release script's fewer-than-50 ` ok ` threshold per shard for a two-way split; each shard should contain about 187 checks. Merge the two shard logs when judging the whole release, and rerun `FAIL` checks by the existing check-name field.
3. **Recommendation:** Keep `firsthour`, `fallingtower2-keys`, `archmage-folly`, and `unburied-look` isolated while investigating their pooled-only state or frame differences. `mobile-perf` remains an intermittent timing red even in the existing serial tail. No assertion or tolerance was changed.
4. **Recommendation:** Investigate the hanging mini-boss plate in the unchanged scoped `textfit` audit before relying on strict parallel/serial verdict equivalence. It produced `THE WEAVER` x `!!` collision and overdraw in parallel full run #3, but passed the serial full run and six serial subset reruns. Keep the check and its threshold intact; its full output is in `proof-f002-jobs4-3.log`.
