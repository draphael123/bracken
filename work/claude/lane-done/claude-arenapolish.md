# claude/arenapolish - ARENA SMALL POLISH PACK (10-28 evening)
Branch claude/arenapolish, base master 421b56e0 (BATCH125 live). NOT merged, NOT deployed. Pushed. Head commit: the last commit on the branch (this report is committed in it).
Worktree: C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-arenapolish. The gate flag was up until ~21:58; nothing browser-side ran before that (code + Node checks only); all page work after.

## What was built (all data + drawing; no collision, no tuning, no ents/grid/movers/ambushes -> level hashes UNCHANGED, verified: 68 levels, 0 diffs vs master)
1. PHASE-TINT HELPER (audit shortlist #1). src/arena-polish.js tintNow / targetTint: an arena opts in with `arena.tintFn` (name of a resolver) or the generic `arena.phaseTints: [[colour, alpha], ...]` (indexed by boss.phase). The veil eases toward the phase target (about 1 s), and snaps on a new arena or a long gap. An arena with neither draws its fixed tint EXACTLY as before (no state), so the other ~47 arenas are untouched. main.js: the one tint line now calls APL.tintNow. Any boss that already sets e.phase / e.mode can use it with one data line.
2. HEXED FIELDS (audit #4, S half). The audit said the arena had no moon: it DOES (sky moon + cloud + shadow edge are already drawn by drawFieldsSky / drawFieldsOverlay; only the gauge is hidden in a fight). Added on the existing FLD.moon clock: the veil goes warm ember -> cold blue (warning) -> near black (under the cloud); a pale MOONLIGHT POOL and two slanted shafts on the king's floor that thin with the cloud and flicker in the last 0.9 s of the warning. (Phantom planks = the M half, not built.)
3. UNDERWELL (audit #6). Re-tint lamp-oil amber (was the Well Town hall's cold #9ab0c0), phase by phase amber -> dark amber -> near black; orange while she is ablaze or thrashing; cold slate in the flood. Four caged OIL LAMPS in wall niches (drawn by the hall's drawBack): lit in the dry hall, flaring when her fire is on, dim when she is blackened, OUT in the flood with a thread of smoke. NOTE the audit missed that the hall already has two lit wall torches; the lamps are a different silhouette (caged niche lamps, not torches) on purpose: the level teaches TAKE the wall torch, so a second torch type that cannot be taken would mislead.
4. ROOTWAY LAIR (audit #9). A dim dark zone over the stand (0.28, no name banner; its lanterns are holes in it); amber -> burnt orange -> blood red veil per phase; three TROPHY STRINGS of skulls / antlers / tusks across the stand that sway; BONE CHIMES under both perches that stir when he is within 90 px; slow spore motes. The lodge frieze and cages were already there (the audit called it a bright flat run; the screenshot shows a lodge): this layers on it.
5. HARBOR (audit #10a). A sea slab past the gate seen through the portcullis bars (rises in HIGH TIDE and on a surge tell), a wet quay sheen (thicker in P2, flashes on a surge's tell), spray puffs at the walls and mid-quay (more in P2 and on a surge); veil: a high surge's tell deepens the sea, a low surge's tell brightens it, P2 deeper. The camera stops at the gate, so the sea "beyond the portcullis" is only a 16 px strip: the visible win is tint + sheen + spray.
6. WAYMEET (audit #10b). A bronze chapel BELL on an iron arm out of the right wall: rings (swing + three widening gold rings) on every glint of his sword; a lychgate LAMP on an iron post at the left, cold until the BRAND (phase 3 / brandTell), then lit with a warm pool on the floor; the veil goes warm for the brand. Visual only: no new sound (Q2).
7. ROC FLOOR FIX. EYRIE.lowK 0.25 -> 0.4 (>= the 0.4 boss resist floor), then the Roc re-measured and nudged (below).

Tests: tools/arena-polish.mjs (Node, registered in tools/check.mjs as `arena-polish`): helper compat / easing / snap, every resolver valid for every state, the five opt-ins resolve, levelHash independent of the keys, the rootway dark zone, 279 draw-state combinations on a recording canvas, main.js / hall wiring. tools/arena-polish-shots.mjs makes the pictures. BKT.fieldsState / BKT.cqState hooks added to main.js for it.

## ROC (skyroad, L15 campaign level, normal health, practiced, profile human WITH FLASKS = campaign kit; tools/boss-rates.mjs --jobs=1)
| build | knight | warden | pyro | total | band |
|---|---|---|---|---|---|
| master 421b56e0 (lowK 0.25, hp 1200, hitK 1.9, dropK 2.0), n=12 | 9/12 | 11/12 | 11/12 | 31/36 = 86% | HIGH +16 |
| lowK 0.4 only, n=12 | 9/12 | 11/12 | 11/12 | 31/36 = 86% | HIGH +16 (same seeds, same totals: her ground-guard multiplier barely touches a bot that fights her from the air) |
| + hp 1600, n=12 | 10/12 | 10/12 | 10/12 | 30/36 = 83% | HIGH +13 |
| + hitK 2.55 dropK 2.7, seeds 1-12 then 13-24 | 8/12, 11/12 | 8/12, 7/12 | 9/12, 11/12 | 69% then 81% (pooled 54/72 = 75%) | borderline then HIGH |
| FINAL: hp 1600, hitK 3.0, dropK 3.1 (+ lowK 0.4), n=24 | 17/24 | 16/24 | 17/24 | 50/72 = 69% | IN BAND, no hero near 0 |

The Roc was ALREADY outside the band (86% HIGH) before this lane; the lowK change did not move it. The nudge is Roc-only (src/roc-eyrie.js EYRIE): hp 1200 -> 1600, hitK 1.9 -> 3.0 (every talon / lightning / dead-air / chain blow), dropK 2.0 -> 3.1 (her snatch drop). Win times with the old numbers were 55-100 s (target 90-150 s); at hp 1600 they sit about 60-130 s. NOT re-measured: dry, the mash bot (more damage only makes its 0/6 safer), the other heroes, levelling XP.

## Pictures (2x of the real frame; god mode, states forced; BEFORE = master in a throwaway worktree, AFTER = this branch)
work/claude/arenapolish/before/*.png and work/claude/arenapolish/after/*.png (same names): fields-lit / warn / dark, underwell-p1-dry / p2-burning / p3-flood / lamp-wall-west, rootway-p1-stand / p2-perch / p3-stand, harbor-p1-calm / p1-high-tell / p2-high-tide / gate-east, waymeet-p1-bell-wall / glint-ring / p3-brand-lamp. (The Underwell's printed `phase` is the boss field, which the hall owns; those states are set through the hall's own S.ph.) Seen and judged fine; the Underwell and Harbor changes are subtle by design (a veil and small lights), the Rootway strings, the Waymeet bell and lamp, and the Fields moonlight shafts read clearly.

## Checks run
- node tools/arena-polish.mjs (all ok); node --check on every touched file; level hashes across all 68 levels, 0 diffs vs master.
- Node tools on touched areas: cistern-queen (162 checks), rootway, skyroad, welltown (42), harbor-expansion, waymeet-cleanup, boss-read, architecture, comments: all green.
- Page: tools/arena-polish-shots.mjs (3 passes, 17 shots each side); tools/boss-rates.mjs skyroad x6 (above). NOT run: tools/check.mjs (full or QUICK), level-quality, textfit, mobile-perf, the walker and pilots (nothing level-side changed; the one render-cost addition is the Rootway stand's dark zone inside an existing darkLocal level).
- Headless: one browser at a time, free RAM 4.0 to 6.8 GB before each, PIDs in pids.txt (uncommitted), all exited, nothing killed by name. The gate flag was respected (waited about 2.5 h).

## QUESTIONS FOR DANIEL (rec first; built = rec)
1. Roc nudge: it was at 86% before this lane. Tuned to 69% (hp 1600, damage about +55-58%). Rec: keep (in band, fight length nearer the 90-150 s target). Alternative: hold hp 1200 and raise damage only (needs another re-measure; hp moved the rate little). Built: hp 1600 + damage.
2. Waymeet bell: should it also TOLL (a soft bell sound on each glint)? Rec: no - the glint already has its own told sound and a second tone would muddy the parry read. Built: visual only.
3. Underwell lamps are decorative; tie them to gameplay (strike out / relight)? Rec: no - the wall torches already carry that verb, and a second interactive light is the confusion I avoided. Built: decorative.
4. Harbor "sea rising beyond the portcullis" is only a 16 px strip (the camera stops at the gate). Rec: leave it (tint / sheen / spray carry the surge) rather than widen the camera. Built as described.
5. Hexed Fields phantom planks (audit #4 M half: 3 of 9 planks only solid in moonlight) NOT built - it changes routes and tuning. Rec: its own lane with Fields 2.
