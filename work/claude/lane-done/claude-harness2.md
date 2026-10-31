# claude/harness2 - gate fixes from the BATCH133 release (tooling lane, sonnet, 10-31)

## Changed (repo, branch claude/harness2 off master 416af6c2)
- tools/load-leak.mjs: the all-levels audit no longer loads every level in one Runtime.evaluate. It loads 7 levels per evaluate (--chunk), each with a 120 s bound (--chunk-ms), then judges
  the weak notes in a SEPARATE evaluate (6 gc rounds on a clean stack), printing one line per chunk (sheets given back, alive, js heap, renderer MB, seconds). The renderer climbs past 2.5 GB
  over the 69 levels (the one-time caches add up; that is what hung/crashed the one-shot audit), so past --heap=2200 MB the page is judged and REPLACED by a fresh one (a restart, max --restarts=8),
  not failed. Growth/kept phases and thresholds (budget 20, kept 5) untouched. Held sheets are judged exactly as before (still alive after the clean collections = FAIL).
  Note: the level list has 69 levels now (not ~170).
- An earlier try that loaded level 0 at each chunk end to "retire" the last bake made things worse (18/11/46 held): reverted; not needed.

## Timing, load-leak
- before: master hangs (batch132: 900 s TIMEOUT; batch133 master: no output in 590 s); harnessstall branch: page CRASHED in the audit.
- after: one full run 16:02:34 -> 16:06:26 (3 m 52 s, audit phase 113 s, 10 chunks, 1 restart at chunk 8 -> 2609 MB, 51471 sheets, 0 held): "load-leak ok". Earlier runs the same hour hit "page CRASHED"
  in the growth/kept phases (twice, free RAM dipped to ~1.8 GB from other processes, before the audit started) - the same system-pressure crash class as flasks2; a re-run passed.
  Growth varied 2.8 - 13.7 MB/load across runs (budget 20): not much headroom under load, worth knowing.

## Scratch edits (outside the repo)
- scratch/release.sh (the gate scripts gateNNN.ps1 only call release.sh --resume; no FLAKES list lives in them). Backup: scratch/release.sh.harness2.bak
  - new CRASHFLAKES="flasks2 canal-tunnel-route": a failure in the alone-rerun is re-run alone ONCE MORE (first log kept as alone-<t>.1.log) before it counts red.
  - new per-check alone cap: ALONE_CAP_DEFAULT=600, ALONE_CAP_room_kills=1500 (name = ALONE_CAP_<check with - as _>). `bash -n` clean; not exercised by a real release.

## Note for a later level lane (NOT fixed)
- visible-supports-strict: spire, 32 overhang findings, red since batch132 (identical count). Fix the spire supports or restamp the strict allowance.

## Runs still needed
- release.sh edit is untested end to end (next gate will show "page-crash flake - re-running alone once more" lines if one fails).
- Not merged or deployed. tools/check.mjs not run.

## Questions
- None blocking. Optional: should load-leak's growth budget (20 MB/load) get headroom, given 13.7 observed under load?
