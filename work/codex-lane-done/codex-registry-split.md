# codex/registry-split

Status: Partial. Registry migration and exact source/data comparisons pass; real-page hash/pixel proof is pending.
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

## Main, tells and preload migration

- 21 main content registries (1317 entries) now come from feature-owned source expressions under
  src/registries: damage/health and existing tuned overrides, boss list, bestiary names, colours,
  common-foe step dispatch, level tiers, hero roster/loop text/teaching and boss damage modifiers.
  The compiler preserves every original expression and order. The expression/order SHA-256 before
  and after is f560d8581e5a610ea1069d2ea2411e6b1c541335f1f3a6d89bc7b85dd49d3e0d.
- Tell declarations moved to 241 feature JSON files. Exact normalized before/after dump comparison
  passed: all 1044 marks, 709 answered blows, all heights, thrown/quiet/harmless membership unchanged.
  Order-chapter expansion is retained. Existing provenance comments moved into feature notes.
- Main's generated blocks stay in the same runtime positions, so existing game code and source audits
  keep the same initialization and override semantics. No game stat, behavior, layout or art was edited.
- Build/check/server startup automatically rebuild main/tell/preload artifacts. The preload graph now
  includes the two generated tell modules: 561 listed, zero reachable modules missing.
- Generator tests reject duplicate/stale/invalid declarations, discover a new feature without a shared
  list edit, and regenerate a main block containing merge conflict markers. Existing source checks
  passed: syntax, tells, comments, homepaths, content-audit, threat-holes, one-new-foe, answer-tags,
  modulepreload. Inventory remains exactly 425 names in the original order.

## Remaining proof

The isolated real-page proof compares the pre-refactor game against this branch with the same
transport, seed and input script. It retains source SHAs, complete gameplay traces, tell/level-data
hashes and exact pixel hashes for Wood, Spire and Canal. Its result is pending; the expression hash
above is not being presented as a browser/gameplay proof. Full integration gate remains outstanding.

## QUESTIONS FOR DANIEL

- New check declarations: recommend one feature-owned JSON file and the documented default order.
  Built that collector and preserved the existing exceptional selection semantics.
- Merge conflicts: recommend regenerating marked blocks from feature declarations instead of hand
  merging table rows. Built automatic startup/build generation and a tested conflict-rebuild path.
