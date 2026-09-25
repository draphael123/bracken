# Lane report: THE UNDERWATER KEEP, reworked (claude/keep2)

Branch `claude/keep2`, off master `7cca706`, merged with `origin/master` (`388fed0`) at the end. Brief: `docs/briefs/keep-rework-2.md`.
Daniel's decisions of 2026-09-25, built to RULES section S (from `claude/difficulty-rules`, now on master).

## Commits

| commit | what |
|---|---|
| `b172c16` | the brief, `tools/keep-walk.mjs` (the F9 bot's walker, costed per section, plus a capture a section), the BEFORE walk and captures |
| `3b89b3e` | chunk 1, checkpoints: `tools/pacing.mjs` counts a shrine the route SWIMS over (the rule `shrineLights` already applies), every swim level; the Keep leaves the checkpoint-gaps KNOWN list; the sunken tower (facade 602-613) carried to the bed with an arch; the Keep leaves the architecture grandfather list |
| `4dd2ad2` | chunk 2: THE DROWNED KNIGHT and THE DROWNED CAPTAIN (`src/drowned-knights.js`, `updateDrownedKnight`, full wiring, `tools/drowned-knights.mjs`); the whirlpool module wired |
| `7aa6776` | chunks 3-5: whirlpools placed; the Leadfoot and the Keeper of the Vault removed; two air halls with failing stone and told rockfalls; a wall and a landmark a section (`src/keep-looks.js`); 48 decorations; THE KING'S DOOR exam; checkpoints respaced; `tools/keep-rework.mjs`, `tools/whirlpools.mjs` |
| `0e84796` | runtime fixtures taught the new Keep (the captain's door in place of the mini; the library's swim waypoints); nothing sprinkled onto the pillars or the failing floor |
| `95fad91` | the chapel window moved into open water (it was painted behind rock); the AFTER walk and captures |
| `b54bf95` | `tools/slopes-trace.mjs --rebase=<id>`: the Keep's trace entry re-recorded on purpose (its rooms were rebuilt); wood, kings, burial keep the pre-slopes baseline |
| `55fad17` | merge `origin/master`: `check.mjs` every name from both sides; `main.js` master's DMG/EHP lines with the Leadfoot's out and the knights' in; `marks.js` hand-written part identical but the Vault Keeper's row, MARK regenerated |

## What I built

1. **Checkpoints.** The shrines already lit from the water column over them (`shrineLights`, `tools/swim-shrines.mjs`). The broken thing was the MEASURE: `pacing.mjs` only counted a checkpoint within a few rows of the route. It now also counts one the route swims over with open water between - for every swim level, not the Keep's rows. The Keep's checkpoints were then respaced to S4 (4, 60, 124, 194 hall, 259, 327 hall, 398, 488, 562, 634 exam door, 705 outside the arena).
2. **THE DROWNED KNIGHT** (`drownedknight`, 60 hp before tier; three cuts from a hero at the Keep's expected level 18, measured in the page) swims after you (58 px/s, slower than you), holds off a body's length, and LUNGES (yellow `!`): the blade drawn back with bubbles streaming along the line, then a drive at where you WERE. Guarded, he is thrown back open; off the line, it passes you. On a floor he walks and never steps off it. **THE DROWNED CAPTAIN** (`drownedcaptain`, 150 hp, elite with his own moves, gold trim, name plate) adds a told CUT and RETURN CUT (yellow `!`). Own sprites (swim, walk, tell, lunge, combo, hurt; contact sheet `work/keep2/knight-sheet.png`; no pixel off the grid, counted at bake time), own voices (die and hurt), bestiary rows, short names, colours, steel, threat 3.5 / 6, marks regenerated. Reusable: any level places the kind (`drownedKnight(x, y)` / `drownedCaptain(x, y, {gate})` helpers in `src/drowned-knights.js`).
3. **WHIRLPOOLS** (`src/whirlpools.js`, `L.whirlpools`): drag toward the eye (in a spiral) everywhere in reach, burn air (2.2/s at the eye) where there is no air; entering lights the lever's niche and says THE WHIRLPOOL / STRIKE ITS LEVER; the lever is struck with any blow, the whirlpool winds down over 1.2 s and stays down through a death (`marks`). Four placed: the teaching one in the Countercurrent (gentle - the low current carries you out of it), one beside the Library's only pocket (it drags you OUT of the air), one beside a knight in the Bell Approach, one beside the exam's only pocket.
4. **Removed:** THE KEEPER OF THE VAULT (his module `vault-keeper.js`, deleted with him, the mini and its gate, the lab branch, the boss-openings case, its BY_HAND marks, the fixture) and THE LEADFOOT (update, sprite, voices, bestiary, weight, poise, pogo, frame, marks, placements, tests; his brief kept and marked removed). Nothing else used either. Checks that named them were taught the new level (keep, keep-expansion, keep-runtime fixture, boss-openings, one-new-foe comment); mini-names now skips the Keep (no mini).
5. **Two air halls** - THE DRY CLOISTER (187-222) and THE GUARDROOM (321-350): each its own water with a surface; you swim up a shaft and climb out. The cloister has two COLLAPSING PILLARS over a flooded pit (gaps 2, 3, 2 tiles; 2.2 s count, 3-2-1 cracks and dust, then they go into the water) and two told rockfalls; the guardroom a FAILING FLOOR over its pit (1.3 s count: run it) and two rockfalls. Each has a checkpoint, a knight on the floor at the far landing, one of the garrison, and a heart after the fight. The Falling Tower's failing stone (`L.crumbles`) now runs for the Keep too (`L.keepCrumbles`; reset whole on every attempt).
6. **A castle:** eight walls of their own and eight landmarks (`src/keep-looks.js`): THE GATEHOUSE (court), THE CULVERT MOUTH (countercurrent), THE GREAT STACK with its ladder and lamp (library), THE BROKEN ARCADE (cloister), THE GREAT SLUICE WHEEL (sluice works), THE BOILER MOUTH on red tile (cistern), THE FALLEN CHANDELIER (guardroom), THE SUNKEN CHAPEL WINDOW (bell approach). 48 hand-placed decorations; the keep's allowlist takes its arms, books and fittings.
7. **THE KING'S DOOR (the exam, 634-672):** the Vault Keeper's old hall. A whirlpool beside the only pocket, a knight in the water, THE DROWNED CAPTAIN holding the door (elite gate on 669), the old inner guard thinned from nine to two past the door, the hall kept calm; a checkpoint at the door and the one outside the arena.

## Numbers, before and after

| | before | after |
|---|---|---|
| cols (curve) / grid | 862 / 760x64 | 862 / 760x64 |
| INDEX (`tools/curve.mjs`) | 141 ("14 easier than the Deep") | 150 (Deep 155) |
| foe kinds | 17 | 19 |
| decorations / 100 cols (`quality.mjs`) | 0.2 | 5.6 (48) |
| checkpoints on the route (pacing) | 3 / 15, worst gap 495 | 11 / 11, worst gap 100, closest pair 56 |
| longest unbroken swim (pacing) | 37 x W = 296 tiles | 11 x W = 88 tiles |
| alternations (pacing) | 27 | 38 |
| free hearts | 1 (a dead-end one) | 2 earned (after each hall) + the dead-end one |

**The walk (S8)**, `tools/keep-walk.mjs`, the playtest bot's own walker, knight, no god mode (`work/keep2/walk-before.json`, `walk-after.json`):

| section | before: blows / hp / deaths | after: blows / hp / deaths / lifts / least breath |
|---|---|---|
| Outer Court | 1 / 23 / 0 | 0 / 0 / 0 / 0 / 13 |
| Countercurrent | 7 / 100 / 1 | 7 / 113 / 1 / 0 / 6 |
| Flooded Library | 28 / 300 / 3 | 53 / 600 / 6 / 2 / 0 |
| Dry Cloister | (was swim) | 1 / 21 / 0 / 1 / 4.1 |
| Sluice Works | 7 / 35 / 0 | 1 / 23 / 0 / 0 / 11.8 |
| Thermal Cistern | 10 / 50 / 0 | 0 / 0 / 0 / 0 / 7.2 |
| Guardroom | (was swim) | 1 / 21 / 0 / 2 / 1.2 |
| Bell Approach | 38 / 326 / 3 | 24 / 127 / 1 / 0 / 0 |
| Siphon Galleries | 0 (lifted past) | 7 / 100 / 1 / 0 / 10.7 |

The hardest section is now the Flooded Library (the whirlpool by its one pocket drowned the bot six times); before it was the Bell Approach. Neither walk reached the King's door: the bot cannot swim well (rule M) and before the rework it was lifted from 400 to the inner keep; after, it spent 78 s and 141 s in the two halls failing to climb out of the exit shafts and was lifted. Its later deaths are booked to the last section by the walker. **By hand in the page (god mode, scripted keys) both halls were crossed end to end, and all six heroes made the jump onto the first collapsing pillar.**

Captures: `work/keep2/before-*.png`, `work/keep2/after-*.png` (13, one a section), `work/keep2/after-look-*.png` (the halls from their floors).

## Rule S, item by item

- **S1** six placements checked by `tools/keep-rework.mjs`: a knight at the landing past the court's broken column, at the cloister's pillar landing, at the first sluice wheel (you stand still to strike it three times), past the guardroom's failing floor, beside the Bell Approach whirlpool, and in the exam; the captain holding the door; two whirlpools guarding air.
- **S2** the cloister's pillar gaps are 2, 3 and 2 tiles over a flooded pit (a miss drops you into the water and back up the pit); the guardroom's failing floor must be run. NOT measured with the real jump for every hero beyond the first pillar (see UNVERIFIED).
- **S3** THE KING'S DOOR: its rule (air) under pressure with the whirlpool, a knight and the captain; a checkpoint before it and one outside the arena, none inside; checked.
- **S4** no pair under 40 route tiles (closest 56) except the arena door; checked. **B6** worst gap 100.
- **S5** 2 free hearts for 11 checkpoints, both after a hall's fight, none in the exam; checked (dead-end `stash` hearts not counted).
- **S6** the bubble stops thinned from 17 to 6 in the approach; the whirlpools burn air; the exam's only air is in a whirlpool's reach. The bot's least breath hit 0 in three sections. NOT measured as "a third of the route above the warning point" (no tool yet).
- **S7** the hard roads (the Countercurrent's siphon slot, the Library's high stack, the Cistern's high water) still pay the level's silvers (154,30 and 306,32).
- **S8** walked before and after (above).

## Checks

Run after the merge, one at a time: **51 checks, all green** (`work/keep2/check-final.log`: every check that names the Keep, the Leadfoot, the vault or a keeper, plus the list in the lane prompt, slopes/slopes-trace, burial-variety, gob-priest, levelling-runtime, ability-poses). The full suite was NOT run (lane rule). Added to the suite: `drowned-knights`, `whirlpools`, `keep-rework`. Each new assertion was seen red first: keep-rework on the Leadfoot's leftover text and on the exam's stray air; whirlpools on the pocket exemption and the current; drowned-knights on the floor-edge creep; checkpoint-gaps on the stale KNOWN line; architecture on the stale grandfather line. slopes-trace went red on the Keep's rebuilt rooms and its entry was rebased (commit `b54bf95`).

## UNVERIFIED

- Nobody has PLAYED it. The bot cannot get out of the halls' exit shafts on its own (it gets out by hand); a person should confirm the shafts read as the way on.
- The knight's lunge and the captain's combo are proved in Node and one lunge in the page; their feel (timing 0.6 s, 300 px/s) is not.
- S2 with the real jump for every hero past the first pillar; S6 as a fraction of the route.
- Node renders lie about light (lessons): the chapel window's shafts, the boiler glow and the torches were only seen in page captures, not played.
- The teaching whirlpool is weak against the Countercurrent's current (the current carries you out of it).

## QUESTIONS FOR DANIEL

1. **Should the Drowned Knights also go into THE DEEP now?** You said they will. The Deep comes before the Keep, so placing them there makes the Deep introduce them and the Keep's new foe would be only the Captain. *Recommendation:* keep them in the Keep for now; when the Deep is next reworked, give it one or two knights and give the Keep the Captain's second combo as its new idea.
2. **The Drowned Captain's health:** 150 before tier (287 at the Keep) - about seven cuts at level 18. *Recommendation:* leave it until you have fought him; if he drags, drop to 120.
3. **Air halls: one checkpoint each.** They are the only dry ground in the level, so dying anywhere nearby wakes you in a hall. *Recommendation:* keep it - it is where a swimmer would stop anyway.
4. **Breath is still three times normal here (`breathScale 3`).** I thinned the air instead of cutting the scale. *Recommendation:* play it; if the meter still never worries you, drop the scale to 2.5.
5. **The inner guard past the King's door went from nine to two.** *Recommendation:* keep it lean - the exam is the captain and the whirlpool, not a crowd.
6. **The failing floor in the Guardroom counts 1.3 s** (the Falling Tower's is 3). *Recommendation:* try it; 1.3 is meant to say "run", and 2 is the fallback if it feels unfair.
