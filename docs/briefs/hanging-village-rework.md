# THE HANGING VILLAGE — the rework

Daniel approved the review's plan on 2026-09-24 (`level-review/group-a.md` §7, verdict *needs rework*), in four
parts. This brief is written before any of it is built. Each part is its own commit.

1. **Every tier looks like its own place**, and the cliff the village hangs from is drawn behind them.
2. **A lift you load yourself** is the level's machine. In phase two the Owl Reeve cuts its rope (A10).
3. **The Weaver's room gets a shape and a reason.**
4. **The 162-tile run with no checkpoint is closed**, and the checkpoint rules stay as they are.

The level keeps its id, its `needs: 'scree'`, its map node and its place in the campaign. No level is inserted.

---

## 0. What is measurably wrong (origin/master 52cfebb)

| | now |
|---|---|
| INDEX (`tools/curve.mjs`) | **93**. Scree before it is 113, so this is a −20 dip. The Monastery after it is 92. |
| size | 110x132 tall, 416 columns walked, 43 foes, 12 kinds |
| worst checkpoint gap (`tools/pacing.mjs`) | **162 route tiles**, from the upper boughs' west checkpoint (12,51) to the lantern stair's west one (10,37) |
| machine (F5) | **none.** The two lifts rise when you stand on them. |
| the Weaver's room | x 20–74 (**55 wide**, A7 says ~40), 13 rows tall, flat, empty. She starts 24 tiles from the door, so she is off screen. |
| look | every tier is the same two-row grass slab on a plank band with the same stilt house (11 `hangingHouse`), and pillars stamped at x 16/46/76/98 on every floor. No cliff is drawn anywhere, so the tiers read as slabs floating in the sky. |

**What works and stays:** the lanterns and snuffers (taught at the market, used on tiers 3 and 5, paid off by the
Reeve's DOUSE), the gusts, the vines, the dead-bough pegs in the Reeve's crown, and the Reeve's kit.

## 1. The one sentence (F8)

> **THE VILLAGE HANGS ON ROPES, AND A ROPE CAN BE CUT.**

The banner's rule line becomes that sentence. It is said three ways (C4):

- **You see it.** Houses hang from the cliff on ropes, the tiers are joined by rope ladders, vines and swings, the
  hoists run on rope over wheels, and the spiders hang on threads.
- **You use it.** You load a hoist and ride its rope. In the crown you cut the pegs, and the dead boughs fall.
- **It is used against you.** Spiders drop on their threads. The Weaver reels you in on hers. At half blood the
  Reeve cuts the hoist rope.

The lanterns stay the Reeve's own rule inside that sentence: she hates the light.

## 2. Seven floors, seven places (F1, F2, F6)

The tiers keep their rows and their walking direction, so the route, the reach, the checkpoints and the ambush room
keep their shape. Each floor gets four things of its own:

- its own **ground set**: a top surface, rock and the underside of the bough (`L.groundZones`, see below)
- its own **house style**
- its own **dressing kit**
- one **landmark you use**, not one you walk past

| row | floor | ground | houses | landmark (what you do there) |
|---|---|---|---|---|
| 107 | **THE ROOTS** | dark wet rock, moss, roots through the turf | root shanties with turf roofs | the split in the roots that drops into the Web Hollow; the great root arch over it |
| 93 | **THE ROPEWALK** | packed tan earth, loose hemp | rope-makers' sheds with coils on the walls | **the ropewalk frame and THE FIRST HOIST** at the west trunk (the machine is taught here) |
| 79 | **THE MARKET** | cobbles | timber market houses with shop signs; the Lamplighter's hall | the market lamps and the well (the lantern quest starts here, as now) |
| 65 | **THE MILL LEDGE** | pale chalk, wind-combed grass | millers' stone cottages, flour sacks | **the windmill.** The paddles at the trunk already turn with the gusts (`m.mill`). They get a tower, a cap and a door, so they read as a mill and not as loose sails. The Cliff Hall (ambush) is the mill's hall. |
| 51 | **THE ROOKERY** | grey granite streaked white | tall narrow houses with nest boxes | **the nest hoist** (optional, pays the spurs relic), and the rooks' dovecote tower |
| 37 | **THE LANTERN STAIR** | dark slate flags | lantern-makers' houses with warm windows | the lit stair of lanterns climbing the face behind the floor; the last lamps |
| 19 | **THE CROWN** | weathered bark and needles | none: it is the Reeve's | the great dead pine (the perches), and **THE CROWN HOIST** |

**THE CLIFF.** A rock face is drawn in world space behind the whole village, from the roots to the crown's rim. Its
strata change with height: wet black rock at the foot, ochre sandstone at the ropewalk, warm limestone at the market,
chalk at the mill, grey granite at the rookery and dark slate at the lantern stair. Over the crown there is only sky.
It has cracks, scrub, nests and a thin fall of water at the foot. Every house is roped back to the face. The
repeated pillars and struts go, because the face now holds the tiers up (B9).

**Borrowed props go.** The Scree Path's purple haze goes from the palette. The birdhouses and beehives move to the
Rookery only. The market keeps the well.

## 3. The machine: THE HOIST (F5)

**What it is.** A rope runs over a wheel fixed to the bough above. On one side of the wheel hangs a **deck**, which
is a platform you stand on. On the other side hangs a **basket**, which sits in a **well-head** on the floor beside
the deck. Both rest level.

**How it works.** Carry a load (a sack, a coil of rope or a stone) to the well-head, and it drops into the basket.
When the basket holds enough, it sinks down the well and the deck rises to the bough above. You can drop the load
in while you stand on the deck, because the well-head is at your elbow. The deck locks at the top while anyone stands
on it. Once you have stepped off, the basket tips its load out at the bottom of the well, the load goes back to its
pile, and the deck comes back down. So every ride costs one carry, and the hoist can be used any number of times.

**Carrying.** DOWN picks a load up and sets it down. (It was walking onto it, until a stone in the crown slowed every
hero who crossed it mid-fight.) You carry one at a time. You walk slowly while you carry
it; this is the game's existing `P.ballast` weight, so there is nothing new to learn. **DOWN sets it down.** A blow
that lands knocks it out of your hands. A load that falls off its floor, or is lost, goes back to its pile.
**As built,** every well stands on the FAR side of its deck from its loads. Carried the other way, a load dropped in as
you walked past the well, and the deck left without you.

**Where it is used, and how each use differs:**

1. **TAUGHT: THE ROPEWALK HOIST** (the west trunk, ropewalk → market). This replaces the stand-on lift. It needs one
   coil, and the coils lie beside it. It is the only way up, next to a checkpoint, with no foe on that stretch. The
   sign says what to do. You cannot fail it.
2. **UNDER THREAT: THE NEST HOIST** (the rookery, optional). This replaces the stand-on basket lift to the relic nest.
   It needs **two** loads. One sack lies by the hoist. The other lies at the far end of the rookery's springy bough,
   under the spiders' threads, so you walk it back slowly while things drop on you. It pays the spurs relic and a
   coin nest.
3. **CUT, NOT CARRIED: THE MILL HOIST** (the mill ledge). Here the load is a flour sack that hangs on a peg over the
   well-head. Cut the peg and the sack drops into the basket. This teaches the crown's peg-cut somewhere nothing is
   trying to kill you. The deck lifts you to the lamp ledge (the quest lamp at 71,62).
4. **PAID OFF: THE CROWN HOIST** (the Reeve's arena, §4). Two stones lie beside it. Loaded, it lifts you to her
   middle perch.

**Physics, honestly.** The basket sinks into a well that is drawn, not dug. The floor stays solid rock, so no hoist
opens a pit anyone can fall into. The basket is clipped at the floor line. The reach model already counts a `lift`
as a ride. **As built:** the playtest bot walks toward the gate's column, so a switchback level defeats it before any
hoist, and it was NOT taught to load one. `tools/hanging-hoist-walk.mjs` walks all four hoists in the page with
real keys instead, once per hero.

## 4. THE OWL REEVE: phase two cuts the hoist (A10, A11, A12)

**Phase one is unchanged,** except that the room now has the crown hoist. Riding it up puts you level with her
middle perch. There you can cut her on the branch, or light the perch lantern and drop her with the light (the
existing caused dazzle).

**At half blood she cuts the rope.** Her kit and DOUSE stay. The first thing she does in phase two is fly to the
hoist's wheel on the great bough.

- **Told.** She calls it with the narration line **THE ROPE**. There is no guard mark, because it is not a blow; it
  goes on the quiet list in `src/marks.js`. A ring of light plays on the wheel and a creak sounds. The tell lasts
  1.2 s, and it is in `windingUp()` (every `...Tell` is).
- **Fair.** If you are on the deck, it drops with you and lands. The drop is at most seven rows. It is a hard
  landing and it does **no damage**.
- **What changed, in one sentence:** *the hoist is dead, and the iron block that carried it now hangs by one lashing
  over the floor. Cut the lashing's peg while she is low under it and it drops on her.*

The hanging block is the deadfall's rule on a bigger weight. It pins her for longer (3.4 s, against the boughs'
2.6 s in phase two) and takes 8% of her blood as it lands, against their 5%. It is **used once**; nobody hauls it back
up. That is the A11 opening phase two gives you in return for the ride it took.

**A12 still holds.** The perches keep their side climbs and both vines, so the height the hoist gave is still there
the slow way after the cut. B4 holds too: the cuttable route (the hoist) was never the only way up.

## 5. THE WEAVER'S ROOM: THE LARDER HOLLOW

**The reason.** For a month the hoists' loads have been going missing. They are down here. The Weaver has been
taking them through the roots and webbing them to her ceiling. Her larder is the room.

**The shape.**

- The fight room shrinks from 55 to **38 wide** (A7). A short web tunnel leads in from the door, so she is on screen
  from the doorway.
- **Three root-nets** hang from the ceiling. They are T.NET, and you can climb them. Her own code already says
  *"Stand on a net and the line holds"*: her reel attack assumed a net, and her room never had one (A12). Now it has
  three.
- **Two web shelves** stand four rows up at either side. They are one-way ledges, and they get you off the boards she
  spits web on.
- **Cocooned sacks and a cocooned goat** hang from the roots. The larder behind her gate holds the silver and the
  lamp, as before.

**Her kit does not change.** The room now supplies what her attacks assume. I am not changing her.

## 6. THE CHECKPOINT GAP (B6)

**The rule's blind spot.** `checkpoints()` in `src/level.js` measures a tall level's runs in ROWS
(`key = tall ? e.y : e.x`). A switchback level like this one walks ninety tiles east and ninety west between two
checkpoints fourteen rows apart, so the filler never saw the gap. The same key misjudges the wide tall levels (the
Keep, the Burial Caverns).

**The fix, as a rule.** A new check, `tools/checkpoint-gaps.mjs`, measures every level along its walked route
(`tools/pacing.mjs`'s route) and fails any gap over **150 route tiles**, the playtest bot's `LONGGAP` line. It proves
red first, on this level. Two levels are over the line today and belong to other work, so they go on a named list
with a reason each. The tool fails any listed level that no longer needs its entry, so the list can only shrink.

**For this level (as built):** two hand-placed checkpoints, one at the top of the rookery climb (the lantern stair's
east end, 96,37) and one in the middle of the market (43,79). The market one closes a 103-tile run that the first one
exposed. Both stand on three tiles of floor, clear of the ambush room, and not at a landing. The worst walked gap
went from 162 to 85.

## 7. What this does not do

- **No new foe.** F10 already passes with the squirrel and the snuffer. Nothing here raises INDEX on purpose; I will
  report the before and after.
- **No music.** It is still the generic `town` track. No new audio.
- **No level editor or Boss Rush work.**

## 8. How it is proved

- Every level check, the fight checks, `owl-lamps`, the new `checkpoint-gaps`, and a new `hanging-hoist` check
  (Node, no page). That check covers the hoist's rules (load, rise, lock, tip, return), the Reeve's rope cut
  (phase two only, told, no damage) and the Weaver's room (width, nets, shelves).
- **F9:** the in-page bot walks it with the knight and the warden, no god mode.
- **Pilots:** `BK.bossLab`, dice pinned, one salt per pass, for the Reeve and the Weaver, before and after.
- **INDEX** before and after (`tools/curve.mjs`).
- Real-page captures of every floor, both rooms and the rope cut, before and after, in `docs/hanging/`.
