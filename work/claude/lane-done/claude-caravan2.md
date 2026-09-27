# Lane report: `claude/caravan2` - THE SUNKEN CARAVAN: ruins, a harsher sun, bandits

Daniel, 2026-09-25: "the new desert level is great, just a few things" - taller ruined buildings (towers), a sun that punishes, and
no goblins (new bandits instead). Design: `docs/briefs/caravan-ruins-bandits.md` (written and committed first). Built to RULES A-F,
Q and section S (S1-S8, from `claude/difficulty-rules`). Everything below is on `claude/caravan2`, merged with `origin/master`.

## Commits

| commit | what |
|---|---|
| `bfc8932` | the brief; `tools/caravan-walk.mjs` records what each section cost (S8); before captures and walk (`work/caravan2/before`, `walk-before.txt`) |
| `40c4aa6` | no goblins: three bandit kinds (state machines, sprites, voices, bestiary, marks, threat weights), `tools/bandits.mjs` (in the suite as `bandits`) |
| `c6c85e8` | the ruined town: four tall towers, four houses, three lintels, ruin faces, the far skyline; the bandits placed to S1; the exam; S1-S6 in `tools/caravan-level.mjs` |
| `80c1371` | the sun: fill 9 -> 6 s, the build 3 / 5 / 8 a second at full, maxWalk 7.5 -> 5 s; `tools/dune-worm.mjs` starts each test cool |
| `0d0551e` | the broken twin's roof is a way on (the bot died of the sun against its corner); the walk tool names each death; `tools/caravan-jumps.mjs`, `tools/caravan-probe.mjs` |
| `2eeb814` | the skyline and the ruin rooms in px.js primitives; after captures, walk, jumps, probe |
| `6865d5b` | merge `origin/master` (check.mjs: kept every name from both sides; `bandits` last; the list check greps clean) |
| `306c289` | the slinger throws only at what is under the sky, and his stone breaks on stone; `docs/desert-foes.png` with the bandits; the post-merge check log |
| (this one) | THE DUNE WORM pilot after the sun change; this report |

## What I built

**1. THE RUINS.** A town stood under the dunes before the caravan road; its bones come up through the sand. All of it is laid stone
(`L.masonry`, drawn as coursed ashlar with bitten, sun-bleached top courses - `src/redraw/caravan_ruins.js`), `tools/architecture.mjs`
holds every piece up (38 pieces, none in the air), and the garrison keeps off it (`L.calm`).
- **Four tall towers you climb** - in at a door (a doorway facade: the wall comes down to the sand either side of it), up ledges two
  rows apart (E4), out of a two-tile hatch onto the roof, where a slinger stands. Each inside is a room (violet, slit windows with a
  shaft of sun, rubble) and shade.
  - THE WATCHTOWER (col 145, 12 rows + a 4-course broken corner) alone at the end of the caravan road; its roof keeps a quest stray.
  - THE TWIN TOWERS either side of the caravanserai in the sinking way (col 399, 12 rows; col 419, 8 rows "its top fell"). With the
    caravanserai (9 rows, now laid stone too) they are **THE ROOFTOP ROUTE**: roof to roof, three tiles apart, from 12 down to 9 to 8,
    paid with a 10-coin cache on the tallest roof (S7). A cutthroat waits at the top of the caravanserai's climb.
  - THE LAST TOWER (col 479, 14 rows) over the exam on the rim.
- **Four half-buried houses** you walk through (waydown, road crest, ox line, the town's end), each with a hole in its roof where
  the beams went; **three walls with their lintels still on** (the old town's gate you start under, the town gate out of the camp,
  the rim's last shade); **three ruin faces** standing behind the play (the slide's landing, the tent, the arch).
- **The far town on the backdrop**: towers with broken tops, domes, broken arches and colonnades, pale and flat in front of the mesas.
- The level grew **505 -> 536 columns** to the hollow (F1 kept: waydown 67, road 96, ox line 79, dune sea 71, camp 69, sinking 80, rim 74).
- The quicksand the road jumps is now three tiles everywhere (S2): the ox line's four, the slide's five and the sinking way's six-wide
  fields (crossed on wagon tops) became three-tile pits with firm ground and a three-tile island (a sunk wagon's roof) between.

**2. THE SUN, MORE PUNISHING** (`src/sunstroke.js`). `SUN.fill` 9 -> **6 s**; `SUN.cool` stays **1.2 s**; at full the ticks come a
second apart and **build: 3, then 5, then 8** (and 8 after that); any shade that takes the meter off full starts it again at 3.
**Told (C1):** at full the HUD shows one, two, three pips beside the meter and says BURNING / HOTTER / SCORCHING, flashing faster and
redder as it climbs; each tick is a sizzle a step higher than the last (`SFX.sunBurn`); the glare deepens with the stage.
`SUN.maxWalk` 7.5 -> **5 s**; the ruins are the shade that makes it hold. `tools/caravan.mjs` proves the build, its reset by a moment's
shade, that the HUD's stage names each tick before it lands, and that the warning (the swim, 3.3 s) still comes 3.2 s before the harm.

**3. NO GOBLINS - THREE BANDITS** (`src/desert-foes.js`, `src/redraw/caravan_bandits.js`). The sand goblin, the goblin thieves and
the goblin archer are out of the level (the sand goblin's code stays: the Buried City's draft plans it).
- **THE CUTTHROAT** (38 hp, scimitar): every other time he comes in he FEINTS - the blade half raised and a stamp, told by its pose and
  a scrape, and it wears **no mark** because it throws nothing (rule H); then the REAL windup, distinct in every channel: blade high
  and back with a white glint, the yellow `!`, a ringing sound. `tools/bandits.mjs`: blocking on the mark takes 0; a fighter who blocks
  the first windup he sees and lowers his shield is cut 8 times in 30 s by the real one.
- **THE ROOFTOP SLINGER** (24 hp): whirls (the tell: `!`, the cord's circle over his head, a red dotted arc growing from his sling to a
  red cross on the spot you stood on), then the stone flies that arc to that spot, 1.55 s after the mark. Step off it or block it. Up
  close he kicks (`!`). He throws only where he can see: not through his own roof at you inside his tower.
- **THE SAND-CLOAKED AMBUSHER** (bestiary: THE SAND-CLOAK, 32 hp): the sand goblin's machine with his own numbers - buried, a mound with
  a hood's peak and two gold eyes, untouchable and harmless; he rises when you pass with the sand pouring off the cloak; two told cuts
  (`!`); the cloak over himself, and up again ahead of you. Dies into sand (death-fx).
- Each: sprite on one canvas (E6, the check caught three clipped frames), a man's voice from the cast kits with cloth under it (E9),
  a bestiary row that fits (textfit), its marks (`node tools/tells.mjs --write`), a threat weight, a spawn case, the hurt frame.
- The scorpions, the vultures, THE OLD STINGER and THE DUNE WORM stay. THE TRADERS' YARD: THE OLD STINGER + two cutthroats + a slinger
  on the stacked cargo (the sun takes the bandits when the great awning rolls in). The rim's elite is **THE FIRST KNIFE** (a cutthroat,
  `lunge`), in the rim lintel's shade, holding the gate at the foot of the slide into the hollow.

## Numbers, before -> after

| | before (`ab26448`) | after |
|---|---|---|
| columns to the arena / level width | 505 / 547 | 536 / 578 |
| INDEX (`tools/curve.mjs`) | 64 (foes 50, threat 127, 6 kinds, gap 48) | **81** (foes 60, threat 180, 6 kinds, gap 71) |
| foe kinds (not the boss) | scorpion, sand goblin, vulture, goblin thief, goblin archer | scorpion, vulture, cutthroat, slinger, ambusher |
| shades along the road / longest walk in the open | 19 / 7.3 s (with a 9 s fill) | 26 / **4.3 s** (rule 5 s) |
| sun: fill, harm at full | 9 s; 3 every 1.4 s | 6 s; 3, 5, 8, 8... a second |
| share of the road over the sun's warning at a steady run | 44% (fill 9) | 22% (fill 6) - see S6 |
| checkpoints (draft) | 8, gaps 80/83/21/75/51/92 | 10, gaps 57/66/67/71/57/55/40/45/70 |
| main-road jumps 2.5-3.0 / over 3.0 | 2 / 6 | 12 / 0 |
| play bot, knight, no god mode | 0 deaths; worst section the rim (51 hp) | 2 deaths (dune sea, both SUNSTROKE); worst the ox line (161 hp) |
| play bot, warden | 0 deaths; worst the road (40 hp) | 1 death (ox line, SUNSTROKE); worst the ox line (183 hp) |
| bot time, start -> the yard (knight / warden) | 167 s / 179 s | 312 s / 275 s |

Per-section tables (hp lost, deaths and where, share of time over the warning / at full): `work/caravan2/walk-before.txt` and
`walk-after.txt`. Every hero's real running jump (`work/caravan2/jumps.txt`, centre to centre): paladin 3.57, knight / warden / pirate /
geomancer 3.97, reaper 3.96, pyro 4.56 tiles - every one clears the widest pit on the road (3.0) with at least half a tile to spare.
Captures: `work/caravan2/before/` and `after/` (the same eleven places plus nine new ones), `probe/sun.png` (the HUD at SCORCHING).

## Rule S, item by item

- **S1 placement** - done. Nine foes placed with a reason each (in the draft, `placed: true`, kept by the build): a slinger on each of
  the four towers (the watchtower over the open road to its door; the first twin over two pits and the island; the second twin over
  the rooftop jump and two pits; the last tower over four exam pits), ambushers where a jump lands (the ox line's house, the slide's
  landing, the island past the town, the exam's landing), a cutthroat at the top of the caravanserai's climb. The garrison is only
  the crowd between them (scorpions, cutthroats, vultures). Checked (`caravan-level` S1).
- **S2 jumps that can fail** - done. Twelve three-tile quicksand jumps on the main road (a miss holds you in the sun, under a slinger),
  none over 3.0 (the ribcage's basin is crossed on its spine). Measured with every hero's real jump (3.57-4.56). Checked (S2).
- **S3 an exam** - done. The rim (74 columns) is the last stretch: the sun (the meter reaches 98% in a bot trace), four pits under
  THE LAST TOWER's slinger, an ambusher at the landing, THE FIRST KNIFE under the lintel, the slide into the hollow. Its checkpoint is
  at the door (col 463) and the next is outside the arena (533): none inside. Checked (S3).
- **S4 spacing** - done: 40-72 route tiles apart (72 because `checkpoints()` in src/level.js fills any longer run itself, and would
  have put one in the exam). The ox line's head checkpoint went (19 tiles from the ribcage's). Checked (S4).
- **S5 healing** - done: no free heart on the road; the yard and THE FIRST KNIFE pay theirs; the dead-end hearts are section R's. Checked.
- **S6 the meter squeezes** - PARTLY. The exam takes it to the edge, and the bot spends 41-77% of its time over the warning in most
  sections. But at a steady run with no stops the road is over the warning only 22% of its length: the new shade every ~25 tiles
  cools you fully each time (1.2 s). See question 2.
- **S7 the hard road pays** - done: the rooftop route (10 coins on the tallest roof), the watchtower's roof (a quest stray). The main
  road never needs a roof except the caravanserai's own climb (as before).
- **S8 measure it** - done: `tools/caravan-walk.mjs` per section, before and after, above. The hardest section moved from the rim
  (knight) / road (warden) to the ox line for both, and the level now kills the bot - three deaths, all to the sun.

## Checks run (after the merge with origin/master)

`caravan`, `caravan-level`, `draft-level sunken-caravan`, `bandits`, `dune-worm`, `desert-foes`, `desert-rules`, `desert-art`,
`desert-art2`, `desert-sets`, `desert-west-art`, `desert-v2`, `desert-tomb-art`, `desert-glass-art`, `desert-bosses`, `newlevel`,
`caravan-map`, `phase-two`, `skeleton-king`, `sun-priest`, `sun-priest-art`, `light`, `occluders`, `slopes`, `one-new-foe`, `tells`,
`spawns`, `floaters`, `architecture`, `audit`, `content-audit`, `traps`, `killzones`, `collectables`, `deadends`, `checkpoints`,
`checkpoint-gaps`, `signs`, `textfit`, `dressing`, `skins`, `map-grammar`, `threat-holes`, `elites`, `ambush-single`, `ambush-reach`,
`boss-openings`, `boss-fight-end`, `arena-supplies`, `readability`, `comments`, `syntax`, `homepaths`, `dangling-paths`, `keys`.
Results: `work/caravan2/checks-final.txt`. Every new assertion was run against the old code first and failed there (the sun walk,
S1-S4, the goblin check, E6 caught three clipped frames).

## UNVERIFIED

- **Nobody has played it.** The play bot cannot fight or read a tell (RULES M); its deaths are all SUNSTROKE because it dawdles.
- **THE DUNE WORM with the harsher sun**: `node tools/duneworm-pilot.mjs` (21 fights, three salts x seven heroes) went from 17/21 (81%,
  median win 95 s; the duneworm lane's number) to **14/21 (67%, median win 113 s)** - now inside the house band (60-75%, 90-150 s) it was
  above. By hero: knight 2/3, warden 3/3, pyro 2/3, paladin 1/3, pirate 3/3, reaper 1/3, geomancer 2/3 (`work/caravan2/duneworm-pilot-after.txt`).
  Scripted bots, not a person: the sun's share of it is not separated out.
- The feint reads in Node (and on the contact sheet); whether a person reads "no mark = not real" at speed is a feel question.
- The slinger's stone breaks on the stone it meets and he does not throw at a hero under cover; checked in the page for one tower
  (`inside 0 throws, the island 2 that land, by the wall 2 broken`), looked at in stills, not in motion. Standing hard against a
  tower's wall under its parapet is a dead zone for its own slinger - I think that is right (it is the shelter a player would try).
- `SUN` numbers for the Glass Sea's day half (level 4, same module) now follow the harsher sun too if it reuses `SUN` - not checked.
- The new art (towers, doorways, skyline) was looked at in page captures at 2x; not on a phone.
- The catch-up banner still says "THIS WOOD EXPECTS LEVEL 26" in the desert (the known text bug, not this lane's).

## QUESTIONS FOR DANIEL

1. **The Well Town's bandits.** Its brief has "bandits (swords)" and "bandit archers" as new foes; the Caravan now brings the cutthroat
   and the slinger first. Recommendation: the Well Town reuses them as the Bandit King's men and keeps the water-thief as its new foe
   (F10 still holds there), rather than drawing a second set of desert bandits.
2. **S6 at a steady run is 22%, not a third.** The ruins give shade every ~25 tiles and shade cools you in 1.2 s, so a runner who never
   stops reaches the warning only on the longest walks. Recommendation: leave the numbers you gave and judge it in play - the bot is
   over the warning 41-77% of its time because fights happen in the sun. If it feels soft, make the swim start at 50% (a 3.0 s warning)
   rather than taking shade out.
3. **The sun kills now.** Every bot death after the change is SUNSTROKE (three, where there were none). Recommendation: keep it - it is
   what you asked for and it is told - but play the ox line and the dune sea first; if they are too much, raise `SUN.cool`'s effect (a
   shorter walk) before softening the 8.
4. **Music.** Still `musBeach` (no desert track in audio/, and this lane downloads nothing). Recommendation: pick a CC0 desert track.
5. **The skyline and ruins' look.** Coursed pale ashlar for the ruins, the rock's strata for the arch and the rim's overhang.
   Recommendation: keep the two materials apart as they are (built vs natural), and tell me if the towers should be taller still.
6. **THE DUNE WORM got harder with the sun** (pilot 81% -> 67% wins, median win 95 -> 113 s). It is now inside the house band rather
   above it. Recommendation: keep it; if the hollow feels unfair in play, make the rim's overhang wider rather than softening the sun.
