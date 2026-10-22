# codex/ci-gate

Status: Partial - the live full Actions gate and focused checks are verified; setup corrections are
being rechecked and full local serial equivalence is pending.
Base: BATCH112, `5e44cddda959fb6e0e8a6b7a4d85f116f0e94e4a` (refreshed from origin on 2026-10-22).

## What changed

- Added a separate release-gate workflow for claude/batch pushes, manual branch selection, and this proof branch.
  The master/PR workflow is byte-for-byte unchanged.
- Registered the existing runner jobs before execution, allowing a side-effect-free list and exact sharding of
  the real inventory. Serial remains the default. No game code, check assertions, thresholds or skips changed.
- Sixteen serial Ubuntu shards, balanced by committed timings (about 14.4 min estimated each), pinned to one SHA.
- Per-check atomic JSON receipts, shard logs, exact-coverage merge, one local-format summary, error annotations,
  job summary and a gate-summary.txt artifact. Missing results explicitly fail; duplicate/stale receipts are rejected.
- Documented exact coordinator commands and a strict local/CI verdict comparator in docs/ci-gate.md.

## Before / after evidence

Before: master CI ran the entire suite on one 40-minute runner; batch branches had no release-gate trigger.
The local gate printed its complete result table only after all checks had finished.

After (focused local validation, 2026-10-22):

```text
PASS: exact ordered inventory identical to BATCH112: 425 checks
ok gate-results: deterministic full coverage, interrupted/missing shards fail,
stale/duplicate receipts rejected, detail format preserved; 425 registered checks
shard 1: 22 checks, estimated 14.4 min
shard 16: 27 checks, estimated 14.4 min
 ok  syntax            721ms  5 files parse
 ok  tells             503ms  ...1044 rows
 ok  comments          160ms  no swallowed code found.
 ok  homepaths        1144ms  ...1457 source and tool files...
4 of 423 checks pass - A SUBSET (tells, comments, homepaths), NOT THE SUITE.
```

## Checks run

- gate-results-selftest: passed deterministic partitioning, exact coverage, missing/interrupted artifacts,
  duplicate/stale/unexpected receipts and indented diagnostic formatting.
- Compared the list with the original BATCH112 source: exactly the same 425 names in the same order.
- tells/comments/homepaths subset including changed-file syntax: passed outside the network/process sandbox.
- Full source/tool syntax sweep: passed, 1455 files parsed at the first implementation checkpoint.
- Live Actions proof: run 39779799289 at c86682b5. The first completed shard retained all 22 verdicts,
  including the pre-existing stale oreroad mash row and a Linux-specific profile-cleanup red.
  Diagnosed the latter: a hard-killed tool's browser is reparented to init (PID 1), which the old
  ownership test mistook for a living owner. Added explicit Unix init-adoption handling; the existing
  profile-cleanup assertions remain unchanged. Ownership regression cases pass. Live Linux recheck PASS
  in run 39781848789, shard 1: 8 exit/crash cases, hard-killed profile orphaned=1/killed=1/left=0/browsers=0.
- First full Actions run 39779799289: all 425 verdicts retained, 18 reds, one gate-summary.txt artifact
  downloaded and parsed. Repository visibility verified public. Public annotation read-back found GitHub's
  per-step error cap truncated the original per-check emission. Fixed by putting every FAIL name in one
  annotation and packing detail blocks into at most 8 further annotations. Regression tests cover 30 reds.
- The same run exposed shallow history missing the slopes check's pre-swap commit 9e0e28a. Shards now
  fetch full history. Runner Node is pinned to local v24.11.1 rather than allowing different patch versions
  across shards. Live recheck of these two setup corrections and compact annotations is pending.
- Full serial baseline: pending; available physical RAM fell from 2.3 GB to 1.9 GB while other lanes were active.
  No long local browser gate started at this checkpoint. No other lane's processes were ended.

No Linux exceptions have been introduced. The live run must establish platform compatibility; configuration alone
does not prove it. Full equivalence and Task 1 completion must not be claimed until the comparator passes.

## QUESTIONS FOR DANIEL

- Runner count: recommend keeping 16 until live timing is available. Built 16 independent serial shards so
  startup overhead is small against the measured 14.4-minute estimate and the 45-minute job cap has margin.
- Merge/deploy: recommend the coordinator review the live proof before merging. Built only the task branch;
  no merge, deployment, permissions change or game design change is authorized or performed here.

These are recommendations, not blockers requiring a reply before routine validation continues.
