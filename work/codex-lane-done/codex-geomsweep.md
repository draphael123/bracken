# Task B: whole-game floating and invisible geometry sweep

Branch `codex/geomsweep` starts at `origin/master` `c33c3204` (batch 93, 2026-10-15). It changes only `tools/` and `work/`; no collision, level geometry, or game behavior changed. No drawing fix was made without a confirmed theme-specific defect. The detailed [ranked 62-level report](geom-sweep.md) links a real-render crop for every finding.

## What was built

- `tools/drawn-solids.mjs --all --report-only` now checks every built `LEVELS` entry. It keeps the existing Buried City gate and its gate/chute/hourglass/respawn phases. The wider sweep checks the top four pixel rows of every standable tile sprite for a continuous three-pixel opaque run and temporarily removes each live mover to check its drawn top in the actual frame. Exact foreground painters for the Scree menhirs, Hexed Fields planks and skins, Mage/Falling Tower skins, and Canal weed mats are matched by their declared coordinates, not by a whole-level exemption. The raw per-level receipt is `geomsweep-drawn-raw.log`.
- `tools/visible-supports.mjs` applies the Unburied Field's three-pixel-row and eight-connected-path rule to overhangs in all 62 levels. It renders route posts with `drawRouteSupports`, Unburied structures with the game's `drawStructure`, other declared structures through the live page's structure layer, and short stone lips through connected solid tile art. Coordinate-keyed Unburied exceptions retain their stated frame/arch reasons. The raw receipt is `geomsweep-support-raw.log`.
- `tools/geom-shots.mjs` captured 1,807 unique PNG crops in `work/codex/shots/geomsweep/`. All 1,810 finding links in `geom-sweep.md` resolve; a shared crop is linked where two findings occupy one tile.
- Both whole-game checks were added to `tools/check.mjs` as report-only standalone names. The pre-existing `drawn-solids` Buried City gate remains a gate, honoring the rule not to weaken a test.

The sweep reported **144 tile-top findings**, **10 mover-top findings**, and **1,656 overhangs without a validated visible support or keyed exception**. It accepted 720 overhangs. These are art-review candidates; the report records the method and limits rather than asserting that all 1,810 are confirmed player-visible defects. The largest combined counts are spire 126, crown 113, hanging 97, kings 79, spore 76, sealedpyramid 74, minecart 73, hurricane 68, buriedcity 67, and keep 65. No game-source fix was made; the crops and theme-matched suggestions go to the main PC's art lanes.

## Checks and reds

| Check | Result and receipt |
| --- | --- |
| Existing `drawn-solids.mjs buriedcity` | Green in `buriedcity-gate.log`, including all runtime phases. |
| Existing `unburied-footings.mjs` | Green in `unburied-gate.log` (32 overhangs). The new tool also reports zero Unburied findings. |
| Scratch invisible tile, `drawn-solids.mjs wood --all --selftest-red` | Expected **red** in `drawn-selftest-red.log`: removing the pictured standable solid at `(287,8)` produced one undrawn cell, then the normal picture was restored in the same page. |
| Full 62-level drawn scan | Report-only, `geomsweep-drawn-raw.log`; 144 tile and 10 mover candidates. A targeted `marsh` rerun in `drawn-marsh-reed-probe.log` verified the reed artwork's eight-pixel draw offset and removed 26 false positives. |
| Full 62-level visible-support scan | Report-only, `geomsweep-support-raw.log`; 1,656 unsupported overhang candidates. |
| `node tools/check.mjs drawn-solids-sweep visible-supports` | Green in `geom-check-subset.log`: syntax plus both report-only names emitted parseable ` ok ` lines (70.4 s drawn, 59.5 s support). |
| Full `node tools/check.mjs` | Completed in **3h 16m 47.6s** on this branch (`geomsweep-full-suite.log`): 381 ` ok ` and two check-summary `FAIL` lines across 383 checks. The new `drawn-solids-sweep` and `visible-supports` entries passed as report-only checks. `slopes-trace` and `textfit-full` failed. |
| Standalone `node tools/slopes-trace.mjs` | Red again in `slopes-trace-standalone.log` (30.2 s): the `kings` trace differed at frame 715. The branch does not change `src/` or this check. |
| Standalone `node tools/textfit.mjs --strict` | Red again in `textfit-full-standalone.log` (4m 57.2s): 14 pictures, including Hurricane arena text collisions. `textfit-full` also failed on Task A's clean older-master baseline. The branch does not change the text audit or game source. |

The `slopes-trace` child's diagnostic begins `FAIL kings:` in the raw full-suite log. It is **not** a third check-summary failure; the two summary failures are `slopes-trace` and `textfit-full`. The separate `codex/suitespeed` runner buffers and indents child output to protect Daniel's release-log parser. Merge that runner before using parallel or sharded release logs; this geometry branch was deliberately cut from `origin/master`.

## QUESTIONS FOR DANIEL

1. **Recommendation:** Give the art lanes the ranked report, beginning with spire, crown, hanging, kings and spore. Keep the new whole-game checks report-only until each candidate is fixed or receives a coordinate-keyed reason visible in its crop. Keep the existing Buried City gate active.
2. **Recommendation:** Treat mover-top findings as a review queue: a custom mover may paint its seat a few pixels away from its collision top. The raw coordinate and crop remain available; do not loosen the three-pixel rule to hide it.
3. **Recommendation:** Use each level's material in the suggested fixes. Desert/crypt sections should keep stone, chain, bone or sand art already present; after the Goblin Queen use scenery or undead figures, not living goblins.
4. **Recommendation:** Let Claude's art lanes choose geometry or collision changes if a crop shows the run itself is wrong. This branch made no such changes under Task B's drawing-only limit.
5. **Recommendation:** Track the `kings` slopes trace and Hurricane `textfit-full` collisions as separate current-master check failures. Both stayed red standalone with the sweep out of the run; keep their assertions unchanged while their owners investigate.
