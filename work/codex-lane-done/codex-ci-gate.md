# codex/ci-gate

Status: Partial - the full Actions gate and public annotation read-back are verified; full local serial
equivalence is not established. The exact remaining differences are recorded below.
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
  across shards. Live full-history/Node/annotation recheck completed in run 39784695367 at 44521b7ab67c04a1adda497350c39f37c4235665: all 425 verdicts, 17 failing checks. The old mover and Linux cleanup pass. The merged artifact was downloaded and parsed. Public unauthenticated read-back of check-run 119856924058 annotations verified an overview naming all 17 failures plus detail; receipt retained outside git in work/ci-proof-39784695367/public-annotation-receipt.json.
- Full local serial comparison remains Partial. The source-bound Task 2 checkpoint at `5fbe8e4a` retains
  391 completed verdicts (376 PASS / 15 FAIL), 33 interrupted attempts and a final active profile-leaks child
  whose parent later disappeared. Last update 2026-10-22T17:46:56.650Z; parent/child were verified absent at
  19:12 UTC. The unchanged original receipt is incomplete; no verdict is inferred for that final child.
- Comparison receipt: 381 of 391 finished local verdicts match the complete Linux run; 10 differ and 34
  have no local verdict. Local PASS/cloud FAIL: cdp-recovery, small-adds, archmage-folly, tower-chase.
  Local FAIL/cloud PASS: fire-room, archmage-interrupt, fallingtower2, fallingtower2-keys, walk-controls,
  whatsnew. Five of the latter have empty output coinciding with restart; their cause is Unknown because
  the old receipt did not retain child exitCode/signal. Task 2 now retains those fields for future attempts.
  Some checker prerequisite code differs between the sources; this is not exact-source equivalence proof.
- I initially inferred other Bracken lanes were active from low free RAM. Process inspection did not
  support that inference: no other active Bracken test browsers were found. No user app or unrelated
  process was stopped. Retain the gate-comparison.json handoff as evidence of the unresolved comparison.

No Linux exceptions have been introduced. The live run must establish platform compatibility; configuration alone
does not prove it. Full equivalence and Task 1 completion must not be claimed until the comparator passes.

## QUESTIONS FOR DANIEL

- Runner count: recommend keeping 16 until live timing is available. Built 16 independent serial shards so
  startup overhead is small against the measured 14.4-minute estimate and the 45-minute job cap has margin.
- Merge/deploy: recommend the coordinator review the live proof before merging. Built only the task branch;
  no merge, deployment, permissions change or game design change is authorized or performed here.

These are recommendations, not blockers requiring a reply before routine validation continues.

## Current continuation verification (2026-10-22)

The renderer recycle threshold is 1536 MB, applied after the current successful pooled check. It is
separate from the 2816 MB emergency ceiling for one check. The earlier implementation incorrectly
used the recycle threshold as a hard kill and prevented a legitimate all-campaign canvas audit.
The corrected default remains below 3 GB; admission requires 4352 MB free, including 1024 MB browser
overhead and the unchanged 512 MB reserve. A sustained shortfall saves an incomplete checkpoint.
No game assertions, tolerances, deadlines, simulation budgets, balance or quality settings changed.

Measured causes are retained native canvas allocations during synchronous lab evaluations, wrappers
lost on raw navigation, and repeated hero-art builds. The harness reinstalls opt-out-aware collection
before navigation, yields at existing forced-GC audit boundaries and uses fresh browsers for the
original ordered boss cases and per-hero levelling cases. All unforced growth controls remain unforced.

Verified immutable-source Actions receipts:
- 39860029941, source 63cd8719: all 27 boss cases / 102 assertion lines pass in 254736 ms
  inside the original 300000 ms deadline, renderer peak 1321 MB; levelling passes 4029 passive reads
  and 234 level-up cases in 639091 ms, peak 1400 MB, inside its original 1800000 ms deadline.
- 39860788572: native bridge preserves 256 exact updates/random draws and 64 state/pixel samples,
  raw navigation/reload and the explicit gcLoads:false opt-out; no extra simulation steps.
- 39864754648, source ae573a03: all 64 levels / 47769 returned sheets freed, zero held; both original
  growth limits pass. Injecting one held sheet produces the real assertion failure (exit 1), not an
  interruption. Peaks 2526/2554 MB calibrated the separate emergency margin.
- 39865884558, source 55b757c6: a 1 MB injected soft threshold keeps both successful verdicts
  and changes the browser PID before the second check. Memory/admission/kill-resume/fault tests pass.

The prior source 2a3175b1 Linux full gate retains 382 real verdicts (364 PASS, 18 FAIL) and 43
interruptions; missing-verdict summary rows are not game failures or completion. It is not current
equivalence proof. Earlier serial snapshots are preserved with their exact identities. Final full
serial and matching-source sharded runs are required; no incomplete run is described as green.

## QUESTIONS FOR DANIEL - current

None for these reversible harness corrections. Remaining combat reds stay visible; no balance change
is authorized or proposed as a way to make the gate pass.

Planner and summary fetch only the tools directory and root package.json to avoid exhausting their existing five-minute
checkout budget. All sixteen test shards retain the entire repository and full history. The planner
was executed from that exact sparse tree and still enumerates all 425 checks. Master check.yml is unchanged.

## Stabilized full-suite continuation

The copy-of-master run39867091429 at7936d68f has422 actual verdicts:407 PASS,15 FAIL,
plus unanswered mark-integrity, no-hidden-hits and textfit-full memory interruptions. All16 shard
artifacts and the combined summary are retained. Synthetic missing-verdict rows are never counted
as game failures or completed tests.

The retained cleanup includes all original mark fights (39870079601:217915ms, renderer2804MB,
no skipped fight), and all64 hidden-hit levels plus both336-second tunnel runs (39869515850:
384729ms, renderer2730MB). The latter now exposes a real Canal bargeman visibility FAIL; its
thresholds, samples, seed, timing and known-exception list remain unchanged. Layout collection and
six-level title-card batches retain all48 title-card cases. The full strict layout check still
exceeds its original ten-minute gate budget; that actual timeout is retained as FAIL.

Shared server ownership is fixed: one page closing cannot disconnect its peer; a final close waits
for its owned server to exit before replacement. Real browser proof39871196174 verifies five pages,
two peer-close reloads, simultaneous closes and a fresh replacement. External servers are not killed.

Paint-wait and fresh-document/browser-cache experiments did not give reliable memory/time gains
and are not retained. Their positive state/pixel controls and failed long runs remain available.
The measured positive boss, levelling, load-audit, held-sheet mutation, raw-navigation and soft-recycle
proofs above remain separate immutable-source receipts.

CI permits one source-bound resume only after exit2 (unanswered checks). Saved assertion FAILs are
never rerun or discarded. Both attempts share the original40-minute shard budget; the45-minute
outer job remains unchanged. The standing-red serial proof similarly keeps its330-minute total
budget. Original check assertions, tolerances, scope deadlines, fight/step budgets and all425
registered names remain unchanged. The1536MB after-check recycle policy and separate2816MB
emergency guard remain in force. No game source is changed on this branch.

No new decision from Daniel is required for these reversible harness fixes. Remaining real game,
visibility and frame-budget failures need coordinator review; no balance or quality reduction is proposed.
