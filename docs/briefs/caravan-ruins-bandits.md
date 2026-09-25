# THE SUNKEN CARAVAN: ruins, a harsher sun, and bandits (Daniel, 2026-09-25)

Daniel's notes on the built level: "the new desert level is great, just a few things". Taller ruined buildings (towers),
more of them; a sun that punishes; no goblins, new bandits instead. Built to RULES-LEVELS-AND-BOSSES.md A-F, Q and the
new section S (S1-S8). Lane `claude/caravan2`. The geometry stays the greybox's (`src/draft/sunken-caravan.js`), measured
by `tools/caravan-level.mjs` and `tools/draft-level.mjs`; the build (`src/sunken-caravan.js`) only turns it into a level.

## 1. THE SUN, MORE PUNISHING (C1, S6)
- `SUN.fill` 9 -> **6 s** from cool to full. `SUN.cool` stays **1.2 s**. The swim (the warning) still starts at 55%.
- **At full, the harm BUILDS:** one tick a second, **3, then 5, then 8** (and 8 after that). Any shade that takes the meter
  off full starts it again at 3.
- **Told (C1):** the meter at full shows the stage (one, two, three sun pips) and says it: BURNING / HOTTER / SCORCHING; each
  tick is a sizzle that rises in pitch with the stage; the swim deepens with it.
- **The level rule:** `SUN.maxWalk` 7.5 -> **5 s** (at RUN, 92 px/s: about 29 tiles). The new ruins are where the shade
  comes from, so every walk still has shade inside 5 s. Checks: `tools/caravan.mjs` (the builds, the reset, the warning
  comes before the harm, a 5 s walk hurts nothing), `tools/caravan-level.mjs` and `tools/draft-level.mjs` (the road).

## 2. THE RUINS (B9, F2, S2, S7)
A town stood under the dunes before the caravan road. Its bones come up through the sand:
- **FOUR TALL RUINED TOWERS**, sandstone ashlar with broken crowns, each one a place: in through a door at the foot (shade),
  up inside on ledges two rows apart (E4), out through a hatch onto the roof, where a **SLINGER** stands.
  - **THE WATCHTOWER** at the end of the caravan road: the first one, alone by the road.
  - **THE TWIN TOWERS** of the ruined town in THE SINKING WAY, either side of the caravanserai: with it they make the
    **ROOFTOP ROUTE** - roof to roof over the quicksand, the hard road (S7), paid with a coin cache.
  - **THE LAST TOWER** on the hollow's rim, over the exam.
- **HALF-BURIED HOUSES AND WALLS** all along the road (a doorway you walk through, a wall with its lintel still on): shade
  between the wagons, and the reason no walk is over 5 s.
- **A SKYLINE** of far ruins (towers, domes, a broken arch) on the backdrop, between the mesas and the dunes.
- Everything built is said as `L.masonry` (tools/architecture.mjs holds it up: B9) and drawn as laid sandstone.
- The sinking way grows into the ruined town (70 -> ~95 columns) and the rim grows for the exam; F1 sizes are kept.

## 3. NO GOBLINS: THREE BANDIT KINDS (F10, E6, E9, H)
The sand goblin, the goblin thieves and the goblin archer leave this level (the sand goblin's code stays: the Buried City's
draft still plans it). The looters of the caravan are men: desert bandits in sun-bleached cloth.
- **THE CUTTHROAT** (scimitar, melee). **He FEINTS:** a half-raised blade and a stamp (told: pose and a scrape, NO mark - it
  throws nothing, rule H), a beat, then the REAL windup, distinct: the blade high and back, a white glint, the yellow `!`
  (a shield turns it), and a heavier ring. A fighter who reads the mark takes nothing; one who answers the feint is caught.
- **THE ROOFTOP SLINGER** stands on the ruins' tops. He whirls the sling (told: the sling circling and a red dotted ARC to the
  spot he has marked, the yellow `!` - a shield turns a stone) and looses; the stone flies the arc to that spot. Step off
  the mark or block. Up close he kicks (`!`). He is the reason the towers matter: climb and he is yours.
- **THE SAND-CLOAKED AMBUSHER** keeps the sand goblin's trick: buried under his sand cloak he is a mound with two eyes,
  untouchable and harmless; he rises when you pass, sand pouring off the cloak (the tell), cuts twice (`!`), and throws the
  cloak over himself to come up again ahead of you.
- Each has its own sprite (every frame on one canvas: E6), its own death and hurt voice (a man's voice from the cast
  kits, cloth under it; the ambusher dies into sand: E9), a bestiary row, its marks (`node tools/tells.mjs --write`), a
  threat weight, and `tools/bandits.mjs` proving it: each told blow fires, the feint is told and throws nothing, the real
  cut wears the mark, the ambusher is harmless and untouchable buried.
- The scorpions, the vultures, THE OLD STINGER and THE DUNE WORM stay. The camp's ambush (THE TRADERS' YARD) keeps THE
  OLD STINGER as its captain, with cutthroats and a slinger on the cargo. The rim's elite is a cutthroat captain.
- In the yard, the sun still takes the looters when the great awning rolls in: they are men, not desert things.

## 4. PLACEMENT AND THE EXAM (S1-S5, S8)
- **S1, placed not crowded:** the garrison row is scorpions, vultures and cutthroats; the slingers and ambushers are put by
  hand where they make the ground worse - a slinger over each quicksand jump the towers look down on, an ambusher at the
  landing of the slide jump, of the ribcage's swing and of a wagon-top jump, a cutthroat at the top of a tower's climb.
- **S2:** the quicksand pits the road jumps are three tiles (a real jump is ~3.2): at least six such jumps on the main road,
  all over quicksand; none wider than 3.0 except where the road is carried over it (the ribcage's spine) and the slide's own
  momentum jump (flagged).
- **S3, THE EXAM** is the rim: the last tower's shade and nothing else, two quicksand jumps under the last slinger, an
  ambusher at the landing, the cutthroat captain on the last flat, and the slide down into the hollow. A checkpoint before
  it and one outside the arena; none inside.
- **S4:** no two checkpoints closer than 40 columns (the arena door excepted); B6 still caps the gap at 100.
- **S5:** no free heart on the road except what the ambush and the elite pay; none in the exam.
- **S8:** `tools/caravan-walk.mjs` now records, per section, what the bot lost (health, deaths) and how much of the time the
  sun meter was over its warning. Before and after are in the lane report.

## Not in this brief
Music (still parked), the Level Editor and Boss Rush (parked: nothing added), the Well Town (its bandits are its own brief;
see the lane report's questions).
