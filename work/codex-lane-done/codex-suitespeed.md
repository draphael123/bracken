# Task A checkpoint: suite speed

Status: **Partial, paused at Daniel's request on 2026-10-13 so this PC can shut down.** Branch `codex/suitespeed` is based on `origin/master`. Task B has not started. No game source (`src/`) was changed.

## What is saved

The runner supports `--jobs=N`, `--max-browsers=N`, and timing-balanced deterministic `--shard=i/n`. It assigns each worker a separate port block and browser profile, reuses its server and browser where safe, and uses fresh browser contexts so storage cannot cross checks. Each check's output remains together, with one original-style ` ok ` or `FAIL <name>` line and added elapsed time. The release script's literal spawn-argument text and quoted check-name list remain in `tools/check.mjs`. The committed `tools/check-timings.json` contains all 374 baseline measurements. Chrome's optional `BRACKEN_BROWSER` path override preserves the Windows default.

The serial tail covers `mobile-perf` (frame timing), `boss-music` (real-time audio), `online-coop` (two browsers), `cdp-recovery` (browser recovery), `textfit` and `textfit-full` (multi-page text audits), and `profile-cleanup` and `profile-leaks` (global profile/process inspection). Direct-browser checks are isolated as well. See `tools/check.mjs` for the executable list and reasons.

## Measurements and checks run

| Run | Wall time | Checks | Reds |
| --- | ---: | ---: | --- |
| Clean `origin/master` baseline | 3h 27m 14s | 374 | `tower-collapse`, `boss-jump`, `curve-gate`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| Exploratory `--jobs=4 --max-browsers=2` before lifecycle fix | 69m 26s | 374 | 9; four context races and one profile-cleanup lifecycle failure led to fixes |
| Same commit `e8c60f8b`, parallel #1 | 78m 00s | 374 | `curve-gate`, `mark-integrity`, `no-hidden-hits`, `textfit-full` |
| Same commit, `--jobs=1` | 3h 21m 37s | 374 | Same four |
| Same commit, parallel #2 | 72m 02s | 374 | Same four, plus `archmage-folly` and `mobile-perf` |

Full logs are beside this report: `baseline-suite.log`, `jobs4-run1.log`, `jobs4-equivalence-1.log`, `jobs1-equivalence.log`, and `jobs4-equivalence-2.log`. `archmage-folly-standalone.log` and `mobile-perf-standalone.log` show both intermittent failures passed alone. `mobile-perf` failed its unchanged 600 ms Red Gorge frame budget at 642.8 ms in parallel #2; its standalone worst frame was 35.5 ms. The third parallel full run was interrupted before results were emitted to honor the shutdown request; it is **not** counted as proof. The two shard runs and full three-run equivalence proof remain pending.

The baseline's 30 slowest checks, in descending wall time, are below. Most are page checks that paid for their own server and Chrome startup on the baseline. The long combat, travel, and text checks also simulate many frames or layouts. `boss-music` is Node-only with real timers; `profile-cleanup` deliberately exercises multiple browser shutdown paths.

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

## QUESTIONS FOR DANIEL

1. **Recommendation:** On the 16 GB, 8-core main PC while two other heavy processes run, start with `--jobs=3 --max-browsers=1`. This PC has 20 logical cores and about 32 GB RAM; its measured configuration is `--jobs=4 --max-browsers=2`. The main PC setting still needs a local memory and timing check.
2. **Recommendation:** Keep the release script's fewer-than-50 ` ok ` threshold per shard for a two-way split; each shard should contain about 187 checks. Merge the two shard logs when judging the whole release, and rerun `FAIL` checks by the existing check-name field.
3. **Recommendation:** Treat `archmage-folly` and `mobile-perf` as unresolved intermittent reds until repeated serial and parallel results establish the cause. No assertion or tolerance was changed.

## Resume point

Finish parallel full run #3, compare all verdicts against `--jobs=1`, run both shards and compare their union to the 374-name list, then finalize Task A and push. Only after Task A is complete, create `codex/geomsweep` from `origin/master` and do Task B.
