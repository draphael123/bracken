# codex/registry-split

Status: Partial. First green step: check registrations collected from feature-owned JSON files.
Base: newest origin/master verified at BATCH112 `5e44cddd` on October 22, 2026.
Task 1 descriptor/inventory prerequisites are included; no master merge or deployment performed.

## Implemented

- Moved all 425 existing declarations, including exact arguments, port slots, timeouts and exceptional
  subset rules, into `tools/checks/*.json`. New checks need only their own file; no shared list edit.
- Runtime timestamps, node paths and run tags are resolved by the runner, never captured in manifests.
- Existing relative order is preserved; new checks sort before final profile cleanup.
- Added manifest validation and an automatic-discovery proof using a temporary feature declaration.
- MERGING.md documents the new check workflow and explicitly identifies the registries not migrated yet.

## Verification

The descriptor capture from the unmodified runner and the collected inventory match exactly: 425 names,
identical order. Manifest tests cover duplicate rejection, dynamic new-feature discovery, subset syntax,
full-only cleanup, exact-only textfit-full, runtime values, and port slots. No existing check assertion,
timeout, game source, game data or generated tell table changed in this step.

## Remaining

Main-game registries, tell declarations and automatic preload generation, before/after tell and game-hash
proofs, and the complete integration gate remain outstanding. This first step is not Task 4 completion.

## QUESTIONS FOR DANIEL

- New check declarations: recommend one feature-owned JSON file and the documented default order.
  Built that collector and preserved the existing exceptional selection semantics.
- Remaining shared registries: recommend migrating them separately with exact dump/hash comparisons.
  No approval is needed for the authorized reversible refactor; this report retains its incomplete scope.
