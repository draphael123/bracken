# codex/registry-split

Status: Success. Registry migration, exact source/data comparisons, and isolated real-page gameplay/pixel equivalence passed.
Base: newest origin/master verified at BATCH112 `5e44cddd` on October 22, 2026.
Task 1 descriptor/inventory prerequisites are included; no master merge or deployment performed.

## Implemented

- Moved all 425 existing declarations, including exact arguments, port slots, timeouts and exceptional
  subset rules, into `tools/checks/*.json`. New checks need only their own file; no shared list edit.
- Runtime timestamps, node paths and run tags are resolved by the runner, never captured in manifests.
- Existing relative order is preserved; new checks sort before final profile cleanup.
- Added manifest validation and an automatic-discovery proof using a temporary feature declaration.
- MERGING.md documents feature-owned check, tell, main-table/import and generated preload workflows.

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

## Verified real-page equivalence

GitHub Actions run 39800952740 passed on source 46115d19dacf84527808be5d909251e8428b10f0
at 2026-10-22T15:03:32.492Z (11:03:32 AM EDT). The isolated pre-refactor build 5e44cddd
and this branch used the same lab transport, seed and 180-frame input script in Wood, Spire and
Canal. All built level geometry/entities/movers/ambush data, tell values, full recorded gameplay
and enemy state, and exact RGBA pixels were identical. Combined before/after SHA-256:
c4c899f061182905a4f10fbfab70059aa0d5d3d52296ddfeba1f798ab94e1627.
The receipt, before/after snapshots, PNGs and owned-process logs are retained in the run's
registry-equivalence artifact and locally outside git in work/registry-equivalence-built-cloud.
This is a bounded gameplay/visual comparison, not a claim that the separate full release gate
is green. The unchanged 425-check inventory and targeted source/generator checks also pass.

## QUESTIONS FOR DANIEL

- New check declarations: recommend one feature-owned JSON file and the documented default order.
  Built that collector and preserved the existing exceptional selection semantics.
- Merge conflicts: recommend regenerating marked blocks from feature declarations instead of hand
  merging table rows. Built automatic startup/build generation and a tested conflict-rebuild path.
