# Recovering an interrupted check suite

Every run now writes a checkpoint after each finished check, including name, verdict, duration,
output and memory measurements. The console prints its path. A sibling summary is updated at the
same time, so a hard-killed parent still leaves the last completed answers readable.

```powershell
npm run check -- --progress ../release-progress.json
npm run check -- --resume ../release-progress.json
Get-Content ../release-progress.json.summary.txt
```

Resume preserves completed PASS **and FAIL** verdicts and runs only checks without a verdict. A
browser crash, disconnect or resource-guard interruption is recorded separately from a game
assertion failure. Exit code 2 means incomplete, 1 means completed with failing checks, and 0 means
the selected checks passed. A subset always says it is a subset. Saved source identity, selection,
shard and exact check inventory must match; concurrent checkpoint writers are refused. Keep the
same checkout and commit for recovery; changed source is a new run.

Shared browsers recycle after 12 checks by default. A standalone serial check already starts a
fresh browser. Every owned browser samples renderer working set; the default ceiling is 1536 MB.
Crossing it interrupts only that browser's active attempt, retains earlier verdicts and permits
recovery. A 512 MB free-memory floor prevents the checker from exhausting the rest of the PC.
Resource interruptions need investigation before retrying a check that repeatedly exceeds the cap.

```powershell
npm run check -- --jobs=3 --max-browsers=1 --recycle-every=8 --renderer-mb=1536
```

Equivalent environment options: BRACKEN_RECYCLE_EVERY, BRACKEN_RENDERER_MB and BRACKEN_MIN_FREE_MB.
A zero memory ceiling/floor explicitly disables that guard; routine runs should keep the defaults.
The processes receipt beside the checkpoint records launch PIDs, unexpected exits, peak total /
renderer working sets and close events. Only exact browsers launched by the runner are terminated.
Unknown memory measurements are recorded; they are not proof of a low working set.

The browser protocol now rejects pending requests immediately on disconnect and clears their
timers. Previously a dead browser could leave an evaluation waiting up to 30 minutes, and the
checker could not reach its final summary. This fixes the recovery stall; a game memory leak still
needs measured attribution and a cause-based fix in its harness.

The parent also stops its recorded check child if it swallows a disconnect and keeps polling.
Ordinary lab pages collect abandoned bake objects after boot and each BK.load, including after a
reload. The allocation-growth audit explicitly opts out of per-load collection, preserving its
no-forced-GC control and every growth assertion. BRACKEN_LAB_GC=0 disables the lab collection hook.
This is a tool-only change; the game's production loader is unchanged. Layout tools may request
audioFiles:false to initialize the sound banner state without decoding recorded audio files.

Validation tools:

```powershell
node tools/suite-progress-selftest.mjs
node tools/cdp-lifecycle-selftest.mjs
node tools/suite-recovery-proof.mjs ../recovery-proof
```

The first hard-kills its own checkpoint writer and verifies durable PASS/FAIL recovery and rejection
of stale source/inventory/concurrent writers. The second requires 1.5 GB free before starting and
runs a representative real-browser subset three ways: uninterrupted, Chrome killed by recorded
PID, then resumed. It compares every combined verdict and verifies saved checks were not rerun.
It is explicitly a subset proof, not a full-release equivalence claim.

Closing a cold lab page also removes its server exit listener and drops the server reference.
Previously each reopen retained another closure until the checker exited. The lifecycle check
opens and closes three cold pages and verifies the exit-listener count stays constant. Startup
failures use the same cleanup path, including a browser launch or debugging-port failure.
