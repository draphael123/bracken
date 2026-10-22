# codex/suite-resume

Status: Partial. Checkpoint/resume, real-browser fault injection, measured lab memory recovery and
shared-browser recycling pass. Full serial equivalence and the full allocation-growth audit remain pending.
Base: latest origin/master checked 2026-10-22, BATCH112 `5e44cddd`.
Dependency: includes Task 1's runner/receipt refactor as a prerequisite cherry-pick. Merge ci-gate first;
the task-specific changes are the commits after that prerequisite. No master merge or deployment.

## What changed

- Every check writes an atomic source-bound progress receipt and a readable combined summary, including
  its verdict, time and output. A killed parent leaves the last completed state on disk.
- --resume keeps both PASS and FAIL verdicts and runs only missing verdicts. Source, inventory, selection,
  shard and writer locks are checked. Incomplete runs exit 2 and name the unanswered checks.
- A browser disconnect rejects pending protocol requests immediately; their old timers waited up to
  30 minutes. Intentional close is separated from unexpected disconnect.
- Browser launch/close/crash PIDs and per-check renderer/total working sets are logged. Shared browsers
  recycle every 12 checks. A 1536 MB renderer ceiling and 512 MB free-memory floor interrupt only an
  owned browser attempt. They never turn an uncompleted check into PASS or a game FAIL verdict.
- Added documented fault-injection tools. No game source or assertion/tolerance/skip changed.

## Before / after excerpts and checks

Before: one dead browser could leave a pending Runtime.evaluate for up to 1,800,000 ms, and no final
result table existed until the entire parent finished. The shared pool had no count-based recycle.

After, focused validation on 2026-10-22:

```text
ok suite-progress: hard-killed writer retains saved PASS/FAIL, resumes only missing verdict,
rejects changed source/inventory and concurrent writers
[progress] ...resume-smoke.json (retaining 3 verdicts)
 ok  syntax            965ms  7 files parse
 ok  tells             509ms  ...1044 rows
 ok  comments          175ms  no swallowed code found.
3 of 423 checks pass - A SUBSET (tells, comments), NOT THE SUITE.
INCOMPLETE: recovery proof needs at least 1536 MB free; currently 945 MB. No browser started.
```

- Checkpoint hard-kill and stale/concurrent writer tests: passed.
- Real CLI run then --resume without repeating a check: passed, all 3 stored rows retained byte-for-byte.
- Gate partition/coverage/failure-format tests: passed, exact inventory still 425.
- Changed module syntax and whitespace checks: passed.
- A child that records a disconnect then ignores it is ended by the parent in under 10 seconds:
  passed (the parent guard kills only the check PID it spawned).
- Real-browser kill/resume proof: PASS at e1baecb8, 2026-10-22 12:49:20 UTC (08:49:20 EDT).
  Recorded browser PID 16840 was killed at 12:48:52 UTC. Uninterrupted suite PID 88892 exited 0,
  interrupted suite PID 6604 exited 2 with 3 saved verdicts and no fonts verdict, resumed suite PID
  85896 exited 0. All 4 combined verdicts matched; the 3 completed rows were retained exactly.
  Receipt retained outside git: suite-recovery-proof-e1baecb8/proof.json beside the worktrees.
  Peak fonts renderer was about 1049 MB, browser-tree total about 1608 MB.
- Forced resource admission denial: PASS. No browser launched, fonts was saved as interrupted with
  no game verdict, and the suite exited incomplete. Actual shared count-based recycle/cap crossing proof
  is evidenced by the standalone guards below. No browser proof started while below its admission floor.
- Shared recycling: PASS, fonts and feel-platform plus syntax. --jobs=2 --max-browsers=1
  --recycle-every=1 launched and closed distinct Chrome roots 63820 and 13444 without overlap or errors.
  Representative results: syntax 842 ms, fonts 6197 ms, feel-platform 20938 ms.
- Resource ceiling: stood up during clean-master red reproduction. Berserker renderer 1573 MB and
  levelcard 1791 MB were interrupted at the 1536 MB default; earlier receipts survived. The shared
  free-RAM guard also stopped its own root at 458 MB free; unrelated processes were untouched.
- Lab allocation recovery: collecting abandoned bake objects after boot / BK.load let Berserker finish
  at a 1066 MB renderer peak instead of crossing 1573 MB and being killed. It then exposed the true
  obsolete poise expectation, handled separately by Task 3. Existing no-forced-GC load-leak control
  explicitly opts out; a borrowed-context test verifies the opt-out and separate save storage.
- Real Chrome kill/resume repeated with collection enabled: PASS, four identical combined verdicts,
  receipt suite-recovery-proof-gc/proof.json at 2026-10-22 13:03:05 UTC. Killed browser PID 75424.
- Full uninterrupted/resumed gate equivalence and a complete ranked memory table: pending. Levelcard
  still crossed 1600 MB after collection: source inspection also found that its layout-only page
  initializes and decodes all recorded audio, and that levelcard was omitted from existing load batching.
  Those layout-harness fixes are being verified on Task 3; do not claim the whole renderer leak is fixed.

## QUESTIONS FOR DANIEL

- Memory guard: recommend retaining 1536 MB renderer / 512 MB free RAM defaults until measured heavy
  checks show a justified alternative. Built configurable guards and per-check process receipts.
- Proof timing: recommend running the bounded browser proof once other lanes free at least 1.5 GB,
  then the full serial comparison. Built the proof command and truthful incomplete-state reporting.

These recommendations do not require a reply before safe independent work continues.
