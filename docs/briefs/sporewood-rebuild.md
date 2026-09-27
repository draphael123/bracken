# SPOREWOOD — the rebuild

Daniel approved the level review's verdict, "needs work", and three chunks of work (lane `claude/sporewood`,
2026-09-25). This is the design, written before anything is built. Coordinates are **final built columns** (after
every `grow()`), because that is what the review, `node tools/map.mjs spore` and the shots all speak.

---

## 1. What is wrong, measured

`node tools/curve.mjs`, master `97dc06f`:

| level | after | cols | foes | threat | kinds | hazard | gap | INDEX |
|---|---|---|---|---|---|---|---|---|
| stockade | marsh | 494 | 36 | 90 | 11 | 2 | 57 | 73 |
| **spore** | stockade | 552 | 60 | 134 | **8** | **0** | 64 | **76** |
| kings | spore | 714 | 97 | 196 | 19 | 20 | 65 | 119 |

Kingswood is 43 harder than the level it needs: the worst wall on the road (`RAMP_WALL` is 26).

**How it got here.** Commit `288263e` ("WAKE THE ROOT AND TAKE THE SPRING", playtest item 12, 2026-09-19) simplified
the wood around light, bounce and a repeatable heart opening. It did it as a strip pass at the END of the builder, in
final coordinates, so the sections that had been built around the removed things were left standing empty:

- `R.ents.filter(... !['puffball','roller','nest','shaman','drone','gill'] ...)` and `R.sleeps = []`, `R.storm = null`.
  The sleep marsh, the spore storm, every puffball, roller, nest, shaman and drone went. `tools/spore-loop.mjs` now
  holds that line, and **this rebuild keeps it**: none of those come back.
- One regex rewrote every sign that mentioned SLEEP / SPORES / PUFFBALL / ROLLERS / GILLS / BROOD / NEST to the same
  sentence, "FOLLOW THE CAPS. BOUNCE TO THE HIGH ROAD; STRIKE GLOWBUDS TO LIGHT THE ROOTS." Seven signs (31, 41, 46,
  129, 178, 246, 474) now say it, including one inside the glade and one outside the Mother's door.
- What was left of the rule was two sprouts in the Deep Gills (449, 456), grown by the glowbuds beside them, 160
  columns after the only sign that names the rule (285, on a terrace with no sprout on it). Her room has none.

What the strip left **empty**, section by section:

| section | cols | what it was for | what is there now |
|---|---|---|---|
| the vent marsh | 175-209 | ride the vents from shelf to shelf over violet sleep | five vents lifting you off a safe floor, four snapping shelves you never need |
| the Tumble | 245-284 | a nest rolls rollers down a stepped hill | a staircase of two-row steps and one sporeling |
| the lantern terrace | 285-328 | the spore storm, a shaman raising the dead | a combat flat; the rule's only sign, with nothing to teach |
| the Puffball Bog | 329-372 | puffballs, drones and a shaman over three sinks | three bouncer sinks, three lurkers, two geysers lifting you over nothing |

## 2. The rule, and how it is said

**THE CAPS GROW INTO STEPS.** Stop on a bud and it rises under you; strike the root beside one and it rises without
you. A grown cap is a step, a ride, and a roof - and it withers back.

Said three ways (C4): the bud's own blinking arrow and the thud when it tops out; a sign at each new use; and the
Mother's room, where a grown cap is the other key to her heart.

### What changes in the sprout itself (`kind: 'growcap'`, src/main.js)

1. **It grows under a hero who STOPS on it**, not one who brushes it. Today any contact of 0.2 s grows it. A bud is a
   step you choose to take, and in the Mother's room a bud you ran across on the way to the knot must not go up behind
   you and change her fight. (The playtest bot learns to hop onto a bud and wait.)
2. **Three new, optional numbers on a sprout**: `lean` (it grows sideways as well as up, carrying you across), `growT`
   (how long the growth takes: a leaning cap grows at walking pace, not in 0.6 s) and `hold` (how long it stands before
   it withers: seven seconds as now unless a use says otherwise).
3. **A grown cap is a roof.** Whatever falls on it (a spore clump, one of her seeds) bursts on its top. Standing on it
   you are above the roof, not under it.
4. **`mother: true`** marks a sprout in her room: the root knot does not grow it (only a hero standing on it does).

The reach model (`src/reachcore.js`) rides a leaning sprout over its whole footprint.

### A new hazard skin: the spore fall

`rockfall` with `spore: true`: a clump of spores lets go of the canopy on a count - violet dust at the source, the
red ring on the ground where it will land (the existing rockfall tell, 0.9 s, only when on screen) - and bursts where
it lands, for the spore-rain damage (10), not the rock's 20. It is a rockfall: it is weighed at 2 in `src/threat.js`
already, and `AMB_KEEP` and the bot know it.

## 3. The uses, in route order

| # | where | the use | what it asks |
|---|---|---|---|
| 0 | **the glade** 34-44 | **THE ROOT STEP** - teach | a root four rows high stands across the glade before the canyon. A bud at its foot. Stop on it, it rises, step off. Nothing else is on that stretch; getting it wrong costs nothing. The rule's sign moves here, to the first screen after the start. |
| 1 | **the vent marsh** 175-209, rebuilt as **THE LEANING CAPS** | **a cap that carries you over a gap as it grows** | the floor opens into two 11-tile gaps with a stump between them (the gaps have a floor, and caps on it spring you back out - nothing is bottomless). A bud on each lip leans out over its gap as it grows, at walking pace, and sets you down by the far side. Stay on it too long and it withers back, carrying you home. A spitcap on the stump lobs at the rider. |
| 2 | **the Tumble** 245-284, rebuilt as **THE DRIPPING STAIR** | **grow a step to climb, timed under a hazard** | the hill's two-row steps become two four-row tiers, each with a bud at its foot, and a spore fall hangs over each bud. You grow the step between clumps; stand in the column as it rises and the clump finds you. |
| 3 | **the Deep Gills** 424-471 (exists) | **strike the root and the cap grows without you** | the cellar is black; a glowbud lights it and wakes the sprouts beside it. Kept as it is, and its sign says both halves. |
| 4 | **the Mother's room** 487-536 | **THE PAYOFF: a grown cap jams her fold** | see §4. |

Every sprout withers back (caps that shrink back): in the stair, a step you dawdled on is gone when you come back to
it; on a leaning cap, the withering is what carries you home.

## 4. The Mother Cap: her cap jams on yours (A11, A12)

**What her fight is today.** Strike the marked root knot (it walks between four ground anchors, -8, +10, -16 and
+17 tiles from her) and her heart opens for 8 s (6.5 s under a quarter); take a spring cap (±3) up and cut it once;
it closes, the knot rests 10 s and moves on. Between openings she draws from nine told attacks by where you stand.
One of them is **THE CAP CLAP** (`capClapTell`, red `!!`, 0.9 s): her cap folds down and hurts anyone standing
between 28 and 112 px above the floor within 110 px of her. It is the attack that punishes being HIGH near her.

**The payoff.** Two buds stand in her room, one each side of her, 5-6 tiles out: inside the clap's reach, clear of
the springs (±3), the shelves (±8..±18) and every knot anchor. Stop on one and it grows you 56 px up, into the height
she answers with the clap. **Get off before the clap lands**: if her cap folds down on a grown cap, **it jams on it**
("HER CAP JAMS"), the grown cap is crushed, and **her heart opens** exactly as the knot opens it - the same window, the
same spring, the same one cut.

- **It is caused, not waited for (A11)**: you grow the cap, you invite the clap by standing high beside her, you drop
  off during its tell. The knot is still there; this is the other key to the same lock.
- **It is the room's (A12)**: the clap assumes you might be high near her; the room now supplies the thing it can
  close on. The buds are told by their arrow, the sign at her door and the bestiary.
- **It is the same lock**: the jam opens her only when the knot could (`nodeRest` is spent), so the fight's pace is
  unchanged - what it buys you is not having to walk to the FAR knot (-16 / +17, ~300 px from the spring) for the
  window. That walk is exactly what the Death Knight could not make in time (claude/dk2).
- **Staying on the cap is still punished**: the clap's damage check is untouched; if you are on the cap when it
  folds, it hits you AND jams.
- A grown cap is a roof here too: her seed rain and the phase-three rain burst on it.

**What changes in her kit, exactly:** one branch in the clap's resolution (after the unchanged damage check: find a
fully grown `mother` sprout within 110 px of her; crush it; open the heart if the knot's rest is spent). Nothing else:
no attack added, removed, retimed or re-weighted, no health change. The pilot (`src/lab.js`) is not changed; it never
stops on a bud, so its fight is the same fight, and `tools/mother-pilot.mjs`'s 90-150 s refill window is re-run as
is.

## 5. The empty sections (chunk 2)

- **The vent marsh**: the five vents and four shelves go; the leaning caps take the section (§3.1).
- **The Tumble**: the dripping stair takes it (§3.2).
- **The Puffball Bog** 329-372: the two geysers go (they lift you over nothing). The sinks stay (fall in, plunge the
  cap at the bottom, bounce out, as its sign says) and the crossing gets shooters: a weaver over the middle sink and a
  spitcap on each bank, so it is a crossing under fire (B8's third shape) instead of three lurkers on a floor.
- **The terrace** keeps its fight and loses the rule's sign (which moves to the glade); it gets its own.
- **Signs**: every one says something different and true. Each of the seven identical ones is rewritten for what
  now stands beside it, and the pillars' sign moves from 328 (45 columns early since the bog grew) to the pillars.

## 6. The look (chunk 3): what the review flagged and levelfix did not fix

- **Orange board ledges in a violet cave**: the snapping shelves (`T.SHELF`) are drawn as the forest's planks. A
  shelf in a mushroom wood gets shelf-fungus art (`L.palette.myc`), as the one-way ledges already do (`capLedge`).
- **Borrowed identity**: the canopy is byte-identical to the Marsh's; the ambient bed is the Hornet Queen's hive buzz.
  The wood gets a canopy of its own and a bed that is not a hive.
- **Seven dead trees** in a mushroom wood: the placed ones become giant caps / root decor.
- **The REVIEW tint band stops at 504**, the width before the Deep Gills grew; it runs to the end of the level.
- (Already fixed by levelfix: the spitcap stranded past the Mother's east wall.)

## 7. How it is proved

- F9: the play bot, no god mode, start to gate, knight and warden (`tools/spore-walk.mjs`).
- The Mother, before and after: `tools/mother-pilot.mjs` (refill + normal, dice seeded per row) and
  `tools/mother-hard-pilot.mjs` (normal health, pinned salts). The jam forced in the page with a scripted hero.
- INDEX before and after (`tools/curve.mjs`).
- Real-page captures before and after, `docs/sporewood/`.
- The level checks, the boss checks, and `tools/spore-loop.mjs` extended (proved red on the old code) to hold the rule:
  a sprout in the glade before column 60, at least three distinct sprout uses on the route (a plain step, a leaning
  one, one under a spore fall), and at least one `mother` sprout inside her walls within the clap's reach.

## 8. Not done, on purpose

- No sleep, puffball, roller, nest, shaman or drone comes back (`288263e`, and spore-loop holds it).
- `AMBUSH_HEALTH.spore` is 6 where every other room is 1-3.3 (the review's item 4). It is a balance number the ambush
  lab measured; it is a question for Daniel, not a misplacement.
- The Kingswood wall. What this adds (two spore falls, three foes in the bog) moves Sporewood's INDEX a little; the
  wall is 43 and the rule's fix is not a ramp fix.
