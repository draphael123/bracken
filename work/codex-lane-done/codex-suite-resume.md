# codex/suite-resume

Status: Partial. Checkpoint/resume unit and CLI checks pass. Browser fault injection, leak attribution
and full-suite equivalence are pending adequate local memory.
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
- Real-browser kill/recycle/memory-cap proof: pending. Available memory reached 392 MB during unrelated
  lanes, then 945 MB. This task has not started a browser while below its proof's admission floor.
- Full uninterrupted/resumed gate equivalence and top-growing-check measurements: pending. Do not
  infer that the renderer leak itself is fixed from the protocol-disconnect fix or configured guards.

## QUESTIONS FOR DANIEL

- Memory guard: recommend retaining 1536 MB renderer / 512 MB free RAM defaults until measured heavy
  checks show a justified alternative. Built configurable guards and per-check process receipts.
- Proof timing: recommend running the bounded browser proof once other lanes free at least 1.5 GB,
  then the full serial comparison. Built the proof command and truthful incomplete-state reporting.

These recommendations do not require a reply before safe independent work continues.
