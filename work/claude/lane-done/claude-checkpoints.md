# claude/checkpoints - about half as many checkpoints, game-wide

Daniel, 2026-09-28 (Salt & Sanctuary direction): "too many checkpoints is part of the problem."

## What changed
- RULES-LEVELS-AND-BOSSES.md: B6 and S4 rewritten as a RULES CHANGE (2026-09-29): one checkpoint per SECTION, about every 120-160 walked route tiles; never a run over 175, never two closer than 80, and always one right before every boss door, mini arena and ambush room. LONGGAP (playtest) moved 150 -> 200 columns. docs/LEVEL-DESIGN-GUIDE.md points at it.
- src/level.js: the filler now fills a run only past 150 columns (was 72), the two `checkRun: 100` overrides (Long Water, Burial) are gone, and `thinCheckpoints` runs after `groundCheckpoints` so it works on FINAL coordinates.
- src/checkpoint-thin.js (new): CHECK_DROP (generated) and CHECK_PIN (hand-edited, with the tool that pins each).
- tools/checkpoint-thin.mjs (new): the picker. Walks each level's main route and keeps the fewest checkpoints that meet the rule (dynamic programme, most even spacing). `--write` rewrites CHECK_DROP.
- tools/checkpoint-rule.mjs (new): the one copy of the rule (judge, assertRule, arenaOutside) with a self-test.
- tools/checkpoint-gaps.mjs: now asserts too sparse (>175), too dense (<80 unless a door/pinned one), no door checkpoint, and that no CHECK_DROP/CHECK_PIN entry names a checkpoint that is not built. Proven RED on the base e5e4052: all 32 levels fail (254 too-dense pairs).
- tools/pacing.mjs: exposes each checkpoint's route position and where the route enters each boss/mini/ambush room.
- Per-level exam tools that encoded the OLD density were retuned to the new rule (not weakened): burial2, keep-rework, longwater-river, unburied, ore-road (now call assertRule); deep-rework (ship carries 1, was 3); keep-expansion (air halls no longer need a shrine each); checkpoint-stand (wood 453,14 model-gap entry deleted, its checkpoint is gone).

## Numbers (main + secret levels, 32 measured)
Total checkpoints 428 -> 179 (58% fewer; was one per ~43 route tiles, now one per ~100). Worst gap now 170 (harbor); every level is inside 175.

| level | route tiles | checkpoints before | after | worst gap before | after |
|---|---|---|---|---|---|
| wood | 536 | 13 | 5 | 64 | 111 |
| marsh | 433 | 10 | 5 | 59 | 130 |
| stockade | 479 | 11 | 5 | 54 | 115 |
| spore | 520 | 11 | 4 | 69 | 136 |
| kings | 627 | 13 | 6 | 130 | 132 |
| scree | 519 | 10 | 5 | 96 | 137 |
| hanging | 539 | 9 | 6 | 85 | 105 |
| spire | 491 | 11 | 5 | 98 | 144 |
| moor | 681 | 14 | 6 | 110 | 141 |
| storm | 653 | 18 | 5 | 78 | 142 |
| crown | 1192 | 18 | 11 | 125 | 129 |
| longwater | 567 | 8 | 4 | 89 | 148 |
| reef | 531 | 9 | 4 | 102 | 147 |
| flotilla | 318 | 7 | 3 | 66 | 118 |
| hurricane | 699 | 17 | 6 | 67 | 136 |
| lamplit | 666 | 19 | 7 | 72 | 108 |
| underleaf | 491 | 13 | 4 | 66 | 132 |
| deep | 461 | 17 | 4 | 80 | 121 |
| keep | 747 | 11 | 6 | 100 | 148 |
| causeway | 591 | 13 | 6 | 93 | 139 |
| harbor | 1037 | 21 | 9 | 78 | 170 |
| waymeet | 725 | 15 | 6 | 84 | 154 |
| undercrown | 509 | 13 | 4 | 86 | 140 |
| fields | 740 | 16 | 6 | 87 | 146 |
| burial | 740 | 10 | 7 | 110 | 128 |
| mage | 576 | 24 | 6 | 67 | 135 |
| fallingtower | 690 | 15 | 10 | 84 | 143 |
| burning | 477 | 8 | 5 | 119 | 135 |
| witchlight | 670 | 15 | 6 | 60 | 132 |
| oreroad | 346 | 17 | 3 | 39 | 121 |
| unburied | 478 | 12 | 5 | 102 | 142 |
| caravan | 556 | 10 | 5 | 73 | 133 |

(Hidden training levels are untouched.)

## Kept on purpose (a check or mechanic pins them)
- Every boss/mini/ambush door checkpoint (the last one before the room) and the one just outside each boss arena's wall.
- hanging (10,37) and (96,37): tools/hanging-exam.mjs, the lantern stair's two exam checkpoints (S3).
- witchlight (519,26): tools/whelps.mjs, the exam's door (S3).
- keep (634,58): tools/keep-rework.mjs, the King's Door exam door. burial (369,21): tools/burial2.mjs, exam door.
- marsh (391,17): tools/raft-call.mjs, the dock shrine the raft returns to.
- fallingtower (8 pins): tools/tower-ascent.mjs wants a shrine on each of its 7 tower floors (a floor is a section) and tools/tower-chase.mjs two on the spiral stair. This is the one level that stays dense (10 in 690 tiles).

## Checks
Green: checkpoint-gaps, checkpoints, checkpoint-stand, architecture, skins, dangling-paths, boss-fight-end, slopes-trace (unchanged for every level), npc-removal, pacing, newlevel, quality; level tools burial2, deep-rework, hanging-exam, keep, keep-expansion, keep-rework, keep-passages, longwater-river, marsh-exam, spore-exam, ore-exam, ore-road, crown-exam, wood2-beats, tower-ascent, tower-chase, tower-flyers, tower-hall, unburied, whelps, burning-village, witchlight-v2, caravan-level, harbor-expansion, additional-areas, audit, content-audit, curtain-wall, elites, floaters, gob-priest, keys, moor-wind, route-breaks, stormhold2, swim-shrines, traps.
Not the whole suite (a release suite is running on this PC).

## UNVERIFIED
- No bot run: fewer shrines means longer walks after a death, and difficulty numbers (tools/curve.mjs index has a gap/20 term) moved up a little; curve.mjs shows the same 6 out-of-line steps as the base (numbers shifted by a few points).
- Browser-only tools (burial2-walk, deep-walk, keep-walk, raft-call, whelps' browser half) not run; they read checkpoints only with fallbacks or the pins above.
- Harbor's first run is 170 and Waymeet's 154 (no candidate in between): inside the 175 ceiling, no checkpoint added.

## QUESTIONS FOR DANIEL
1. Ambush-room door checkpoints stay (a death inside wakes you at the door, RULES Q5). They add about one per level to the count. Recommendation: keep (built). Alternative: drop them so a death in an ambush room sends you back a full section.
2. The Falling Tower keeps a shrine on each of its 7 floors (tool pin). Recommendation: keep it (a floor is a section and the tower is the only tall stack); alternative is one per two floors, which would need tower-ascent.mjs retuned.
3. keep-expansion no longer demands a shrine in each dry air hall (the halls kept their knight and failing stone). Recommendation: as built; say if a shrine in the halls matters as a breathing refuge.
4. 428 -> 179 is a 58% cut, a little more than "half", because 120-160 tiles between shrines was the brief's spacing. Recommendation: keep; if it feels harsh before the death-cost lane, raise PICK_MAX/IDEAL in tools/checkpoint-thin.mjs down (120) and rerun --write.
5. LONGGAP in the playtest bot is 200 columns now (rule is 175 walked tiles). Fine to leave?
