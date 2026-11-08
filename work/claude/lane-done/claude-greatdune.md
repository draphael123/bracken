GREATDUNE DONE 11-06 11:45 READY (code-only greybox, behind its flag; browser / art / tune / music owed - listed below)

# claude/greatdune - THE GREAT DUNE + THE SHIELD-BOARD + THE SAND-SKIFF BANDIT + THE SKIFF CHIEF's race + THE ROUTE-INSERT RULE (OPUS greybox, code-only, 11-06)

Branch `claude/greatdune` off `claude/colossus4` 5f28d2603 (contains claude/desertkit). Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-greatdune`. Pushed. NOT merged, NOT deployed.
Sources: plan-desert-1105 s1.9 / s3e / s3f / s3i / s4 + Q1/Q2 recs (the 10-14 brief as written, no interview), brief-greatdune-1014. Where they differ the plan won.
Nothing has been played in a browser (none allowed during the gate). Tip: see the last line.

## FLAG / URL
`src/great-dune.js` `GD_SHIPS = false`. OFF: `src/level.js` does not append the row - LEVELS is master's array (proved in a clean child process: no row, the Sealed Pyramid still needs the Buried City).
ON: `?gd=1&level=greatdune`, `globalThis.BRACKEN_GD = true`, or `GD=1` for Node tools. The row is appended LAST and HIDDEN (no map node), needs 'buriedcity'.
The road insert (buriedcity > greatdune > sealedpyramid) is data in `src/route-insert.js`, live with GD_SHIPS (art before live).

## What was built
| file | what |
|---|---|
| `src/great-dune.js` (new) | flag, rule, the level (535 x 46, the caravan's piece grammar + soft sand / sinkhole / cliff pieces), STILL / SCARAB / OBELISK / medal numbers, `lintGreatDune` |
| `src/shield-board.js` (new, pure, GENERIC) | THE SHIELD-BOARD: mount (DOWN on a slope in a board zone), ride (downhill gathers, uphill pays, the flat bleeds, pump/brake), jump keeps it, you LAND RIDING; ends on slow / hurt / attack / block / wall / zone end. The BOWL reuses src/slide.js's classes (weak bowled, strong + minis bounce you flat, a boss chip); PLOUGH (the scarab) ploughs every non-boss. Surfaces 'sand' and **'ice' (the mountain's ice slopes reuse it: `L.boardZones = [{ x0, x1, surface: 'ice' }]` + the same main.js hunk)**. `rideProfile` = the same rules for tools |
| `src/sand-skiff.js` (new, pure) | THE SAND-SKIFF BANDIT (the one new foe): a wind-sail sledge on its bed at one speed up and down; SPEAR SWEEP `!` (0.55 s, low, block), SAND POT `!!` (0.75 s mark, 0.8 s arc, burst + a 3 s SAND TRAP that halves a board's speed). THE SKIFF CHIEF: waits at the line, rubber band (slow 120 / base 140 / catch 170 - below the board's 260), throws pots back on your line, falls off at half health (race won); reaches the obelisk first = he takes the purse. Every move has pose + sound keys |
| `src/dune-hands.js` (new) | world binding + greybox draw: the board hunk, STILL SAND (stand still 0.95 s on soft sand -> a quicksand patch carved under the feet, src/quicksand.js holds you, it refills once you are out; on a SWIRL the crust opens into its cave), scarabs (4 s: no hurt, plough on foot and board, faster), pots / traps, the obelisk (pays by height), the race (start, HUD gap, purse spill, chief stays beaten) |
| `src/route-insert.js` (new, pure) | THE ONE ROAD-INSERT RULE for carpet / greatdune / kingspyramid / airship: append + needs, the next level needs the insert once live, ONE migration per insert (a save that had the next level open keeps it: PROG.roadOpen), inert until live. (Named route-, not road-insert: 'ad-insert' is an ad-block pattern.) |
| `src/main.js` | 15 one-line hunks, all inert off the dune: import; EHP rows; MEDALS.greatdune; progDefaults `roadMigrate(PROG)`; levelLocked `!roadKept(PROG, lv)`; clear; spawn case; take; THE BOARD hunk in updatePlayer (before the butt-slide's hit); update; owned-foe update; foe draw; world draw; constructor; RSL busy `|| !!P.dBoardOn` (the running slide stands down while you ride) |
| `src/level.js` | import + the flagged hidden row + `applyInserts(LEVELS)` (rewires nothing: no insert is live) |
| `src/marks.js` | MARK / ANSWER / HEIGHT rows for sandskiff sweep/pot, skiffchief pot |
| `src/threat.js` | sandskiff 2.5, skiffchief 0 |
| `tools/level-quality.mjs` | SYSTEM_ARRAYS learns softSand / sinkholes / scarabs / boardZones; ROLES.ranged learns sandskiff |
| `tools/great-dune.mjs` (new) | **77 ok**: flag both ways, level, board rules (sand + ice), bowl, the hands on a fake world, skiff, chief, THE PACE (`--pace`) |
| `tools/route-insert.mjs` (new) | **38 ok**: THE migration test (A-F below) for all four inserts |

### The level (columns)
- **0-31 THE LAST STREET**: the rule sign, the first SOFT SAND (stand still: it shivers at 0.45 s, takes you at 0.95 s - jump, and keep jumping; never a kill), the butt-slide on a small dune.
- **32-79 THE FIRST DUNES**: the board taught on a 6-row dune ("HOLD DOWN - RIDE YOUR SHIELD. JUMP, AND IT STAYS UNDER YOU"), scorpions to bowl, a basin to jump (coin arc), soft sand on the coast.
- **80-218 THE ROLLING SEA**: vultures over basins (stomp chains), SKIFF ONE on a 20-tile flat, SINKHOLE ONE (cave: silver + 5 coins, out by a ledge + a one-way lip), SCARAB ONE + a plough run (4 foes), **CHECKPOINT ONE (202)**.
- **219-388 THE SKIFF ROAD**: the scarab chain (1b on the crest, 2, 3: each 2.8-4.9 s apart on the fast line), sand-worm beds, SKIFF TWO + SINKHOLE TWO, plough run two, SKIFF THREE, a mirage ledge + a false oasis (data), up to the crest: **CHECKPOINT TWO at the start line (382)**.
- **389-535 THE RACE**: THE SKIFF CHIEF sails from the crest; 3 basins, 2 soft-sand runs, scarab four, the race's squad (2 vultures, a scorpion, a cutthroat), the KICKER + a 3-row cliff lip, THE OBELISK (12 rows; capstone 50 / high 25 / mid 10 / low 3 coins), the gate.
- Checkpoints: start + 2 (gaps 199 / 180 / 153). Shade: five sandstone outcrops + four (static) cloud shadows. No wood, no goblins, no boss.

## Node results (one at a time, >= 1500 MB free; no browser, no tools/check.mjs)
- `node tools/great-dune.mjs` **77 ok** (~10 s). Board: sand crests a 5-row dune off a 6-row one, not 6; ice crests 6, not 7, and coasts > 2x as far. PACE (kinematic fast-line rider on the level's own surface, the game's boardStep): **fast line 58.9 s, on the board 61%, clears every basin; a walk 102.5 s**; scarab chain 4.9 / 2.8 / 4.7 s; RACE: the fast line beats the chief by 2 tiles (13.1 s), a walk loses by 51. Medals 120 / 170 / 240 (estimate).
- `node tools/route-insert.mjs` **38 ok**: A a save at every campaign level keeps every level it had open (all 4 inserts); B past `after` the insert is open + unplayed; C a fresh profile walks it; D a save that clears `after` after the migration walks it; E idempotent, and not live it writes nothing; F the main.js / level.js wiring is present (text checks).
- `GD=1 node tools/level-quality.mjs greatdune`: ok flat, mechanics (6 kinds / 3 in 3+ places), secrets 2, checks, encounters, density, slopes, ranged, roles 3, ruleFight, blocking, route. **FAIL bands** (4 bands, 10% second height - Q6), **FAIL music** (borrowed caravan - art lane). Not GATED (not added). Flag off: every gated level clears.
- GD=1 ok: one-new-foe (sandskiff counts; greatdune walks the fork off buriedcity), answer-tags (greatdune asks block/dodge/jump/duck), threat-holes, goblin-lint, checkpoints, checkpoint-stand, checkpoint-gaps, checkpoint-thin/-rule, floaters, floating-geometry, anchor-lint, platforming-lint, foe-glue, foe-pass, comments, curve (hidden levels are not listed by several of these).
- Flag OFF ok: answer-tags, dangling-paths, comments, one-new-foe, checkpoint-gaps, foe-glue, slopes, threat-holes, content-audit, level-quality (all gated clear). `node --check` every touched file. New filenames (great-dune, shield-board, sand-skiff, dune-hands, route-insert) clean vs ad / admiral / banner / track / analytics / pixel / promo.
- NOT run: `tools/mark-integrity.mjs` (opens a browser), every page tool.

## Browser owed (one at a time, >= 1500 MB, memguard first; all with ?gd=1&level=greatdune)
1. The board in the real collision: the mount on each big dune, landing riding, the downhill snap at 260 px/s (moveBodySlopes), the cliff lip launch to the obelisk, BONK (the wall check), the RSL stand-down, co-op seats; knight + reaper (slowest) + a ranged hero.
2. Still sand: the carved patch with the real hold (feet into the carved cell, the refill under a foe), the swirl drop into each cave and the ledge + lip climb out with every hero (the lip is one-way: DOWN+JUMP drops in from above).
3. Skiffs + chief: draws, sweep/pot reads, stomp off the rider, pots' arc + mark + trap; the chief's start, HUD, purse spill, his loss path; the scarab inv flicker (art: a glow).
4. mark-integrity / untold-told / hint-shown; `level1-pilot greatdune --write`, `mash-bot greatdune`, reach-heroes; the QUICK gate on the branch.

## Art owed (art before live) / music
Gold dunes + heat shimmer + the obelisk (plan s4), sandstone outcrops, soft-sand look, sinkhole swirl, caves; the HERO'S BOARD POSE (greybox draws an ellipse under the feet); THE SAND-SKIFF (hull, sail, rider: skSweepWind/Rel, skPotWind/Rel) + bestiary card; THE SKIFF CHIEF (red sail, chPotWind/Rel, chDown) + card; sand pot, sand trap, the sun scarab + its glow; map node/plate + TIER/curve rows at the road merge. Music: the caravan track borrowed - own level track + a race sting + a scarab sting.

## Questions for Daniel (recommended answer first; each built as the rec)
1. **src/slide.js already exists** (the butt-slide, claude/slide), so the plan's "NEW src/slide.js" became `src/shield-board.js`, which reuses slide.js's hit classes. REC keep. Alt: fold the board into slide.js.
2. **Mount on slopes only**: DOWN at a run on the flat stays the RUNNING SLIDE (its own verb). REC keep. Alt: `mountFlat` per surface (ice could take it).
3. **Losing the race** = he takes the purse and sails off; the level still finishes at the obelisk (no fail state, a breather). REC keep. Alt: losing restarts the race from checkpoint two.
4. **The chief's speeds** 120 / 140 / 170 (the conservative bot wins by 2 tiles; a walk loses by 51). REC the tune lane times real runs. Alt: harder (150 / 180).
5. **Cloud shadows are static**: src/sun-hands.js caches shade floor segments by the zone's coordinates (a moving shade would grow that cache every frame). REC static now. Alt: a sun-hands cache fix, then drifting clouds.
6. **level-quality bands** FAIL (4 height bands, 10% second height): a board run is one line by design (the second height is the air of the jumps and the caves below). REC list greatdune REPORT_ONLY for bands at the art merge. Alt: the fix lane adds sandstone shelves as a high line.
7. **Sinkholes open only when you stand still on the swirl** (the still-sand verb is the key; the lip lets you climb out or drop in). REC keep. Alt: they open when you land on them.
8. **Medals 120 / 170 / 240 s** (an estimate: fast line 59 s with no fights). REC the tune lane times it.
9. **The road insert** is one rule now (src/route-insert.js + tools/route-insert.mjs). REC the carpet / King's Pyramid / airship lanes flip `live` in its table instead of writing their own migration; the Heart's 'sealedpyramid' placeholder is the airship lane's. Note: tools/content-audit.mjs reads MEDALS from the literal and will list greatdune NO MEDALS (it is set by assignment) - report-only.
10. **Mirages** (plan s3c, Great Dune crests): two as inert data (a false ledge over a basin, a false oasis; lintMirages clean); drawn once claude/ksar3's mirage wiring merges. REC keep. Alt: none.

## Final tip
claude/greatdune FINAL TIP (see the commit after this file). Play: ?gd=1&level=greatdune. Proofs: node tools/great-dune.mjs (77 ok), node tools/route-insert.mjs (38 ok).
