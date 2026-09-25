# THE UNDERWATER KEEP, REWORKED (brief, 2026-09-25)

Daniel's decisions of 2026-09-25, built to RULES-LEVELS-AND-BOSSES.md A/B/C/E/F/N/Q and section S (branch
`claude/difficulty-rules`). The level review (group B) called it "one unbroken swim of 296 route tiles through rooms that
look identical", with 2 decorations in 862 columns and a swimmer who skips 12 of its 15 checkpoints.

**The one sentence (F8) stays: FOLLOW THE AIR THROUGH THE FLOODED VAULTS.** What changes is what stands between you and it.

## 1. What goes
- **THE KEEPER OF THE VAULT** (the brass-helm mini, `bellguard` + `vaultKeeper`, `src/vault-keeper.js`): "we don't need
  one". His room becomes part of the exam. Nothing else places him, so his module, his lab branch, his opening test and his
  marks go with him. The two plain Bellguards stay (they are the inner keep's divers).
- **THE LEADFOOT** ("the single scuba enemy"): nothing else places him, so his update, sprite, voice, bestiary row, threat
  weight, poise row and marks go. His brief stays as history, marked removed.
- With no mini, the level needs a gated elite (`tools/elites.mjs`): THE DROWNED CAPTAIN holds the King's door.

## 2. What comes: THE DROWNED KNIGHT and THE DROWNED CAPTAIN (the new foe, F10)
A man-at-arms of the King's court who drowned in his plate and did not stop: **he swims after you**, sword first.
- **Told sword lunge** (`lungeTell`, yellow `!`): he draws back, the blade glints, then he drives at where you were. Block it,
  or get off the line. About **three hits** to kill (60 hp).
- On a floor (the air halls) he walks and lunges along it the same way; in water he chases in all directions, slower than you.
- **THE DROWNED CAPTAIN** (`drownedcaptain`, elite, holds a gate): tougher (150 hp), a plumed helm and a torn cloak, and a
  **two-slash combo** (`comboTell`, yellow `!`: a cut and a return cut, the second only lands if you are still there).
- Own sprites (swim poses, the lunge, the combo), own voice (E9: a drowned bell-plate knock and a bubbled groan), bestiary
  rows, marks by `tools/tells.mjs --write`, threat weights. **Reusable:** any level places `drownedknight` / `drownedcaptain`
  ents; the numbers and the art live in `src/drowned-knights.js`, the behaviour in `updateDrownedKnight` (main.js, so the
  mark audit reads it). The Deep does NOT get them in this lane (a question for Daniel below).
- Placed to S1, never in crowds: one at the landing past a broken column, one by a whirlpool, one on each hall's floor, one
  at a sluice wheel you have to stand still to strike, and the captain at the door.

## 3. What comes: WHIRLPOOLS (`src/whirlpools.js`)
`L.whirlpools: [{ x, y, r, lever: [x, y] }]` (tiles). Inside `r` it drags you toward its eye and burns air faster (on top of
the water's own drain). **Entering its pull SHOWS ITS SWITCH**: a sluice lever in a wall niche just outside the pull lights
up. Strike the lever and the whirlpool winds down over a second and **stays off, through a death**.
Told three ways (C1/C4): the swirl itself, drag lines streaming into the eye, a sound while you are in it; the niche lit.
Four of them, used differently (S1): the teaching one in the Countercurrent (gentle: the low current carries you out of it);
one beside the Library's only pocket, which drags you OUT of the air (the drag works in air, the burn does not); one beside a knight in
the Bell Approach; one beside the exam's only pocket. (A fifth over the Cistern's ballast road was planned and not built.)

## 4. The level's shape (760 x 64 kept; F1 sections, F2 landmarks, F4 alternation)
| cols | section | wall | landmark |
|---|---|---|---|
| 1-63 | THE SUNKEN OUTER COURT | curtain wall, arrow slits | THE GATEHOUSE: the portcullis arch, raised |
| 64-128 | THE COUNTERCURRENT | the moat culvert, green, grilles | THE CULVERT MOUTH |
| 129-186 | THE FLOODED LIBRARY | shelved walls | THE GREAT STACK and its reading lamp |
| 187-222 | **THE DRY CLOISTER** (air hall 1) | dry cloister arcade | the cloister's broken arcade |
| 223-270 | THE SLUICE WORKS | iron-banded machine wall | THE GREAT SLUICE WHEEL, turning |
| 271-320 | THE THERMAL CISTERN | red-tiled, cracked | the cistern's tiled vault and its boiler mouth |
| 321-350 | **THE GUARDROOM** (air hall 2) | racked arms, torchlit | the arms racks and the fallen chandelier |
| 351-399 | THE BELL APPROACH | chapel masonry | THE SUNKEN CHAPEL WINDOW |
| 400-559 | the Siphon Galleries, the Blighted Cistern | (as built) | |
| 560-759 | THE INNER KEEP, the exam, the King | (as built) | |

- **Two walkable air halls** break the approach's swim: you swim up a shaft, climb out, fight on foot (a knight + two of the
  garrison), cross **collapsing pillars** (the Falling Tower's failing stone, `L.crumbles`: cracked, dust, a 3-2-1 count) and
  **told falling rocks** (`rockfall` with `tell`/`seen`), and drop back down into the water. Combat, swim, combat (F4).
- 40-60 hand-placed decorations over the six sections (the allowlist plus the keep's own castle pieces).
- **THE EXAM (S3)**: the last stretch before the King's door (the Vault Keeper's old room onward): a whirlpool across the
  way, a knight in the water, the captain at the gate, and the only air between two checkpoints behind the whirlpool. A
  checkpoint before it and the one outside the arena; none inside.

## 5. Checkpoints
- A shrine already lights from the water column over it (`shrineLights`, main.js; `tools/swim-shrines.mjs`). What was wrong
  was the MEASURE: `tools/pacing.mjs` counted a checkpoint on the route only within a few rows of it. It now also counts one the
  route swims over with open water between (the same rule `shrineLights` applies), for every swim level; the Keep leaves the
  `checkpoint-gaps` KNOWN list.
- S4: no two closer than 40 route tiles (except outside the arena); one in each air hall; B6 still the ceiling.
- The sunken tower (facade 602-613) is carried down to the bed with an arch over the passage: off the architecture list.

## 6. Rule S, item by item
S1 five+ placements with geometry (above) - S2 the halls' pillar gaps and the drop between them - S3 the exam - S4 spacing -
S5 one free heart per two checkpoints at most, none in the exam - S6 the breath meter: whirlpools burn it, and the exam's air is
behind one - S7 the hard road (the Countercurrent's siphon slot, the Library's high stack) pays a silver - S8 walked before and
after with `tools/keep-walk.mjs` (per section: blows, health lost, deaths, least breath).

## Checked by
`tools/drowned-knights.mjs` (the knight's and the captain's attacks forced, counters, footing, placement), `tools/whirlpools.mjs`
(pull, drain, lever shown on entry, off for good, off through a death, in the page), `tools/keep-rework.mjs` (sections,
landmarks, halls dry and walkable, the exam, S4/S5, no Leadfoot and no Vault Keeper anywhere), plus the level's existing checks.
