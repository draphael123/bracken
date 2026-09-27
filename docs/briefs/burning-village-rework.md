# THE BURNING VILLAGE — the rework

Daniel approved the review's plan on 2026-09-25 (`level-review/group-b.md`, THE BURNING VILLAGE, verdict *needs work*), in
four parts. This brief is written before any of it is built; each part is its own commit, green at every push.

1. **Platforming.** Burning roofs and streets you climb around: rooftop routes over and around the fires, collapsing
   burning beams (told), smoke that rises. Fair and readable: every tell is visible through the smoke.
2. **Its own mechanic: a bucket you carry from the well.** Pick it up, walk slower while you carry it, a hit spills it.
   Douse a fire to open a way, save a villager, reach a stash. Taught safely first, used in varied ways, paid off.
3. **An ambush in the barn** (RULES Q), measured with the ambush lab against Q's window.
4. **The look.** The background fires are flat orange boxes; the Pyromancer's name is half-covered by his heat bar.

The level keeps its id (`burning`), `needs: 'stockade'`, its spur on the map, its six villagers, its three silvers, its
width (508) and its boss. No level is inserted.

---

## 0. What is measurably wrong (origin/master 391cba2)

| | now |
|---|---|
| route strip (`tools/pacing.mjs`) | `----F----F---F-F--S--F-R------F-FS--F-R---R--F-SF-R---FRBBBB`: **platforming 0**, alternations 2 in 472 route tiles |
| the route | the street, start to square, at one height. Every roof, ledge and loft is optional: the reach route never leaves row 25 |
| machine (F5) | none you carry. Troughs and the well splash where they stand |
| ambush (Q) | none. The barn's captain is an ELITE holding the far door (`ELITES.burning`) |
| INDEX (`tools/curve.mjs`) | **89** (stockade before it 73; a spur, so nothing follows it) |
| background fire | `drawBurningTown` paints "the thatch burning" as three solid 5 px bars per roof, two colours, bobbing: flat orange boxes |
| boss plate | `drawPyroHeat` puts his heat bar at `VH - 18`, inside `bossPlate`'s name band (`VH - 22` to `VH - 14`): the bar is drawn OVER the name. `npm run check`'s textfit never draws a boss plate (`hints,bestiary,store,tree,menu,hud,pick,practice`) and has no rule for a bar laid over a word |

**What works and stays:** his fire spreads and only his (`src/fire-spread.js`), the villagers and their fuses, the hot
doors and backdrafts, the troughs and the well, the flame pillars, the burning logs, the hanging beams, the barn and its
roof hatch, and the Pyromancer's kit (heat, vent, overheat, the square that burns with his bar).

## 1. The one sentence (F8)

> **THE FIRE HOLDS THE STREET. GO OVER IT, OR CARRY WATER THROUGH IT.**

Said three ways (C4):

- **You see it.** The street is blocked by what the fire has done to it: a fallen house burning across it, cellars
  fallen in and alight, beams over the gaps glowing through.
- **You use it.** You climb: gables, roofs, beams, the smoke that rises out of the cellars. Or you walk to a well, take
  its bucket, and carry the water to the fire that is in your way.
- **It is used against you.** A beam burns through a second after you step on it. His goblins light the hay you
  fight in. And in the square his heat burns the floor out from under you, unless you bring water.

The banner's rule line stays: *ONLY HIS FIRE SPREADS. WATER PUTS IT OUT. GET THE VILLAGE OUT.*

## 2. Seven sections (F1)

| cols | section | what it is for | landmark (a thing you do there) |
|---|---|---|---|
| 0–90 | **THE ROAD IN** | the burning goblin and the straw, as now | the cottage roof and its archer |
| 90–190 | **THE CROFTS** | **the bucket is taught** | **THE CROFT WELL**, and the burning root-cellar beside it |
| 190–250 | **THE LONG STREET** | a street you climb round | **THE FALLEN HOUSE** burning across the street |
| 250–320 | **THE ROOFTOPS** (new) | the street has fallen into its cellars: roofs, beams, smoke | **THE HALL**'s roof and the villager in its dormer |
| 320–400 | **THE BARN** | the ambush | **THE BARN** and its lofts, shut on you |
| 400–450 | **THE WELL YARD** | the breather, water, the last villager | the village well |
| 450–508 | **THE SQUARE** | the Pyromancer | his square, and the pump at its door |

## 3. Chunk 1 — platforming (F4)

**THE FALLEN HOUSE (Long Street, ~229–234).** A house has come down across the street: a heap of burning timber four
rows high (too high to jump), alight on top. Two ways past it:

- **Over the roofs.** Up the gable of the house before it, along its roof, and a jump down onto the next roof over
  the fire. This is the route with no water: it is the way the reach model sees.
- **Through it,** with water (chunk 2).

**THE ROOFTOPS (250–320).** The street has fallen into its cellars. Between the houses the road is gone: a pit two
rows deep with fire on its floor (fire, not death — the ember pits' rule) and a ladder at its far end so you can always
climb out (C5, B3). The way across is the roofs:

- **THE HALL** (the tallest roof, the villager in its dormer, a silver) is climbed by its gable ledges.
- The gaps between the roofs are too wide to jump. Each is spanned by a **BURNING BEAM**: a timber you can stand on
  that burns through 1.5 s after you step onto it (`deckBreaks`, the Storm Ship's and the logs' rule) and grows back
  5 s later. **It is told**: the beam flashes and carries a `!` over every tile from the moment the fuse starts, and
  sags as it goes. Run it and it holds; stop on it and you drop into the cellar.
- **THE SMOKE RISES.** Out of every cellar pit a column of smoke puffs up on a clock: thin, then thickening (the tell),
  then a rising plume for 1.6 s. Airborne inside a plume, you are carried up — hot air rises. It is a second way out of a
  cellar, and a lift onto a higher roof; it is never the only way (B4). **Tells stay readable through it:** smoke is
  drawn under the creatures, the marks and the beams' `!`, never over them.

Both are checked: `tools/pacing.mjs` must show platforming on the route, and `traps`, `killzones`, `deadends`,
`collectables`, `checkpoints`/`checkpoint-gaps` stay green.

## 4. Chunk 2 — THE BUCKET (F3, F5)

**What it is.** Every well in the village keeps a bucket on its rim (the well's own prop, drawn there). **DOWN** at the
well takes it, full. You carry it the way the game already carries a weight (`P.ballast`, the Hanging Village's hoist
loads): you walk at the load speed, and **a blow spills it** — the water goes on the ground at your feet, wasted.
**DOWN** again sets it down.

**How it is used.** Carry it **into** a fire. The first thing water puts out within a step in front of you takes the
whole bucket: a burning heap, a hot door, a patch of his fire, a burning beam. No new button: the same move that would
burn you now puts the fire out. An empty bucket goes back to its well by itself after a few seconds (a villager
fetches it), so a bucket is never lost.

**What water does that a trough cannot.** A trough splashes where it stands. The bucket takes the water to the fire:

1. **Taught safely — THE CROFT WELL (Crofts, ~96).** A sign, the well, and a root-cellar whose hatch is buried under
   burning timber beside it; no creature within a screen (a calm). Carry the bucket into the heap: it goes out, falls
   in as ash, and the cellar under it holds a stash. *Reach a stash.*
2. **Save a villager — the hot door (Crofts, 101).** The same well is seven tiles from the first hot door. Cooled by
   the bucket it opens quietly, as a trough cools it now. The trough stays; the bucket is the second way.
3. **Open a way — THE FALLEN HOUSE (Long Street).** A street well before it. Carry the bucket up the street, under
   the burning goblins and the thief, into the heap: it burns down to a step you can walk over, and the street is open.
   The roofs are still the way for a player who does not want to carry water.
4. **On the roofs — THE HALL'S RAIN BUTT.** A butt and its pail on the Hall's roof. The dormer villager's door is hot:
   the pail cools it. *Save a villager, up high.* (Or douse a beam with it: a doused beam holds.)
5. **Paid off — THE SQUARE'S PUMP.** A pump and a bucket just inside his arena door. Carried into the square's burning
   floor, the bucket puts a patch out **and holds it out for 8 s, even while his heat is high**.

**The Pyromancer, what changes and why (A-rules).** His kit, his heat, his vent and his overheat do not change. What
changes is the one thing the fight already made a choice of: *punish him (more heat, less floor) or let him vent (safe
ground, no opening)*. With the pump, a player can punish him **and** buy floor back, at the price of carrying a slow,
spillable bucket through his jet and embers. It is the room's own supply (A4, A12): the arena has the pump. It adds no
opening (A11 is his overheat, unchanged), so it does not make him easier to kill; it makes the fight about the level's
verb. If the pilot says it changed his numbers, it did not: the bot does not carry buckets, and that is reported, not
hidden.

## 5. Chunk 3 — THE BARN AMBUSH (Q)

**THE BARN** (east half, walls 358–398, floor row 25). The barn's far door is already the level's natural lock, and
its captain already stands at it: **he stops being an ELITE and leads the ambush.**

- **One captain and one crowd:** THE BARN CAPTAIN (brute, captain type distinct from the Stockade's archer and
  Sporewood's shield), a burning goblin, a sprig and an archer on the hayloft. All present at the lock.
- **The room:** the hayloft and an upper loft over the floor, hay from the floor to the rafters — the burning goblin
  lights it, and knocking them into their own fire is a legitimate kill (Q4). A hay-screen hangs from the rafters at
  the west wall (358) so the gate and the screen shut the column to the ceiling: nobody leaves over the lofts.
- **The door checkpoint** is the barn's own (341), outside the room.
- **The level still has its gated elite** (`tools/elites.mjs`: a level with no mini needs one), moved to **the
  Crofts**: a shield goblin holding the lane at the end of the crofts — not back to back with the barn (Q2).
- **Measured** with `BK.ambushLab` for all six heroes against Q's 15–35 s window; `ambush-single` and `ambush-reach`
  green.

## 6. Chunk 4 — THE LOOK

- **The fires behind the town.** `drawBurningTown`'s roof fires become flames: tongues that taper to a point, three
  colours from a white-yellow root to a red tip, each tongue on its own clock, licking up and leaning with a wind, with
  sparks lifting off them and a glow under them on the roof. Fewer boxes, more fire.
- **The Pyromancer's plate.** His heat bar moves out of the name band: the plate grows a row under the health bar for
  it, so name, health and heat each have their own line. **Fix the rule, not the row:** `tools/textfit.mjs` gains a
  check that no bar or plate is drawn over a word after the word, and the suite's textfit runs the boss plates.

## 7. How it is measured

- **F9:** the in-page play bot (`src/playtest.js`), no god mode, start to gate, knight and warden — before and after.
- **The Pyromancer:** `tools/pyromancer-pilot.mjs` (bossLab, all six heroes, dice pinned) with a salt per pass — before
  and after — and `pyre-pilot`.
- **INDEX:** `tools/curve.mjs`, before and after.
- **Captures:** real page, `docs/burning/before-*` and `after-*`.
- **Checks green at every push:** every level check (audit, traps, killzones, collectables, spawns, deadends,
  floaters, checkpoints, checkpoint-gaps, skins, dressing, signs, pixels, map-grammar, one-new-foe, threat-holes,
  elites, ambush-single, ambush-reach, occluders, ground-depth, architecture), pyre-pilot, tells, boss-openings,
  boss-fight-end, arena-supplies, textfit, comments, syntax, homepaths, dangling-paths, burning-village,
  village-stakes, and every new check.

---

## 8. As built (corrections to the plan above)

- **Gaps are three tiles, four with a drop, not five.** Walking it found the reach model's six-tile jump is not the
  game's: in the page a running jump carries the knight 4.0 tiles, the paladin 3.6, the pyromancer 3.0. THE FALLEN HOUSE
  is at 229–231 with the next roof from 232; the Hall's ledge is 250–253; the second house starts at 272.
- **The root cellar's hatch is the road itself** (smouldering timber, no flame), not a burning heap a row proud of it:
  that put a fire on the street every hero had to jump through at the croft well.
- **The Hall's dormer villager is behind a hot door** so the rain butt's pail has a job.
- **The barn's back wall is drawn** ('barn' facade), and village facades now draw after the town backdrop (they were
  painted over by it, the burning house fronts included).
- **The boss plate:** `bossPlate(nm, col, lift)`; the Pyromancer's lift is 7 rows. textfit's new `plates` screen runs in
  the suite with the new OVERDRAWN rule.
