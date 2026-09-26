# Level design audit: Bracken Wood to Highcrown, and the side roads (2026-09-26)

Daniel, 2026-09-26: *"It doesn't seem like this pass actually changes the level content. I'm thinking layout /
uniqueness / escalating mechanics throughout the level."* This review is about content only: no new levels and no new
game systems. Every beat below uses a mechanic, machine or foe the level already has.

Read against `RULES-LEVELS-AND-BOSSES.md`: F1-F10 (the template), B8 (three encounters, not one encounter three times)
and section S (S1 placement, S2 jumps that can fail, S3 an exam before the boss, S7 the optional hard road). The earlier
reviews it builds on are `level-review/group-a.md` (09-24) and `docs/look-and-feel/wood-to-highcrown.md` on
`claude/lookfeel`. Each level is judged **as it is on master now** (eeaad91), including the 09-24/25 reworks of
Sporewood, the Hanging Village, the Monastery, Gale Moor, Highcrown's bells and pillars, and the Ore Road.

## How it was read

- **Only built data.** For every level, `src/level.js` was imported and the finished grid and ents were read, in FINAL
  columns (after every `grow()`). Those give the mechanic positions, signs, movers, gust zones and alarms.
- **Route rhythm.** `tools/pacing.mjs` (the strip, quiet runs and fight runs) and `tools/curve.mjs` (INDEX).
- **Layout shape.** Walked route y-range per 64 route tiles, from the pacing JSON.
- **Rough jump count.** Route edges of 3 or more columns with no footing under them. This is only a lower bound, and it
  also counts rides (pads, gusts), so S2 figures are marked *approx.*
- **No browser was opened** and no game code was changed.
- **Tags in the mechanic maps:**
  - **T** = teach (safe)
  - **D** = develop (under pressure)
  - **Tw** = twist (a new use)
  - **C** = combine (with another mechanic or a foe)
  - **E** = exam
  - **B** = the boss uses it
  - **GAP** = a hole in the arc
- **Scores** are 1-10 on escalation + layout variety + uniqueness together: now, then after the plan. Sizes: S (under
  a day's lane work, mostly placement), M (a section rebuilt from existing parts), L (several sections).

---

## 1. BRACKEN WOOD (`wood`): 554 cols, INDEX 76. Score 7, 8 after

**Rule:** THE HIVE FIRST. **Mechanics:**
- the plunge and pogo (wasps, drones, the helms of shield goblins)
- the lesson strips: heavy blow, down attack, parry
- the badger charge
- thorns
- spitters
- the felled pine (four strokes make a bridge)
- the hive ceiling (304-351)

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| pogo | 113-122 over stumps (T); 245-311 hive wasps (D); 439-448 wasps over the tarn, as the alternative to the pine (Tw); 485-495 helm pit, shields on posts over spikes (C/E); the Queen's drones (B) | none: the model arc in the game |
| shield goblin | 68 lesson (T), 97, 147, 342 elite (D), 489-495 (E) | none |
| badger | 217 (T), 235 (D) | **GAP: taught and dropped** after 235 |
| thorns | 161, 237, 256, 372, 390, 422, always on a flat | the "held jump is higher" sign (392) never asks for a held jump that can fail |
| felled pine | 435 once | **GAP: a one-off machine**, not in the Queen's court |

**Layout**
- 0-266: a flat run (y21). The lesson strips 53-224 are four flats in a row, each with one foe. They are right for
  level 1, but they are 30% of the level.
- 226-262: the badger-sett fork.
- 266-330: the climb to the fallen giant (a fork: over the top or through the hollow).
- 330-395: the hive plateau and the ambush.
- 395-464: the ridge and the tarn cleft.
- 464-514: the helm-pit climb, then the arena.
- **Quiet:** 136-160, 208-254, 395-412.
- **Uniqueness:** high (pollen, then dusk, then rain).
- **S2 approx:** 3 pit-jumps of 3+ tiles; 4 over a fall.

**Plan**
1. **DEVELOP the badger** (ridge 395-412, the quiet run). **S.** The badger charges along a one-tile log at the cleft's
   lip: jump it, or you are knocked into the tarn cleft and walk back.
2. **COMBINE thorns and a jump that can fail** (ridge 412-430). **S.** Two thorns on the ledges with a 3-tile gap
   between them, so the held jump the sign at 392 teaches is finally asked for.
3. **TWIST the felled pine** (the Queen's court, 517-551). **M.** A dead pine at the west wall. Fell it and it lies
   across the two combs as a third perch at drone height, so the level's machine reaches the boss.
4. **EXAM** (464-514). **Keep.** The helm pit already combines pogo, shields, spikes and wasps over falls. It is the
   one level in scope that passes S3 as built.

---

## 2. MARSH WOOD (`marsh`): 502 cols, INDEX 75. Score 6, 8 after

**Rule:** THE CHANNEL IS DEEP: PAY THE FERRYMAN, OR DRAIN IT AND WADE. **Mechanics:**
- sinking lily pads, and bud pads that bounce
- the shallows slow you
- the deep water bites
- the ferry raft (toll) against the sluice (crank 164, sluice 165)
- the grove raft with frogs (393)
- gars that throw themselves onto the bank, and told eels
- archers on stilts (reflect the arrow), and spitters (arcs)
- wisps in the fog
- the planks of the drowned village

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| sinking pads | 27-42 (T); 115-127 in the wading shallows (review noise); 226-306 the long river, 17 hops (D), with eels 234/285/300 (C); 465-474 (B) | escalation **flat-lines at 306**. The hardest pad stretch is mid-level. |
| ferry or sluice (the RULE) | 162-205 once. The grove raft 393-416 (D: frogs board it, archers 406/420). | **GAP: the rule is one choice, made once**, and it is not in the boss |
| gar | 145 (T), 340 onto the boards (D) | never combined with pads |
| spitter | 66, 136, 195 | the sign at 274 (SPITTERS THROW IN ARCS) has no spitter |
| archers | 62-104 (T), 182/194, 336/352, 406-421 over the raft (C) | none |

**Layout**
- 0-68: the bank and the lily pond.
- 68-135: the reed climb and the archer island.
- 135-205: the gar hole and the ferry channel.
- **205-306: the long river, 100 columns of the same pad hop on row 17. REPETITIVE.**
- 306-370: the drowned village (unique).
- 371-389: the reed-island ambush.
- 393-416: the grove raft.
- **420-455: the mud flats, DEAD** (`-R.-` then the boss: 56 quiet tiles, which also fails S3).
- **S2 approx:** 19 jumps, almost all of them pads.

**Plan**
1. **Break up the river** (223-306). **M.** Split it into three shapes:
   - 223-250: pads and an eel (as now);
   - 250-275: a spitter on the reed bed at 259 lobbing onto the pads ahead. This is S1, and the orphan sign at 274
     gets its spitter;
   - 275-306: bud pads bouncing up to a high reed line, with an archer covering the landing.

   Arc: D, then C.
2. **TWIST the rule** at the grove (390-416). **M.** A second crank and sluice beside the grove raft (the pair at
   164/165, reused). Drain the grove and wade it with the gar and an eel, or ride the raft under the two archers. This
   time the drained road is the harder one.
3. **Take the REVIEW pads out of the shallows** (115-127). **S.** The wading lesson then teaches wading.
4. **EXAM** (420-455, the mud flats). **M.** Sinking pads over a gar hole in biting water, a spitter on the reeds at
   452, a wisp's fog over the middle, and a hopper on the landing reed. That is pads + gar + spitter + fog before the
   King's rising pond. Move the checkpoint from 440 to about 418, so there is none inside the exam.

---

## 3. THE STOCKADE (`stockade`): 494 cols, INDEX 75. Score 6.5, 8 after

**Rule:** EVERY TOWER HAS A HORN. SILENCE THE BLOWER BEFORE IT SOUNDS. **Mechanics:**
- the horn towers
- crank gates (crank one, or roll a barrel into it, or burn it with the brazier)
- tip the brazier, roll the barrel
- cages (free the fox, the birds, the squire)
- the catapult
- the loot cart on its rail against the pikes
- sappers' powder
- two lifts, two rope bridges
- the wall walk against the ditch (a fork)

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| horn tower (the RULE) | 84-95 (T), 288 (D), 431: **the same silhouette and the same approach again** | **GAP: no twist, no exam, not in the Chieftain's fight** |
| crank gate | 138 crank or barrel (T), 207 brazier (D), 313 barrels + brazier (C) | a good arc with no exam |
| brazier | 190/209 (yard), 312, 482 (B) | none |
| catapult, loot cart | 64, and 272 against the pikes (Tw) | one-offs, fine |
| sappers | 259 (ditch), 342/354 (tunnel) | never placed with the rule |

**Layout**
- 0-69: a flat run with the catapult.
- 69-136: horn tower 1 and the ravine bridge.
- 136-209: the gate and the Kennel Yard ambush.
- 209-270: the fork (the stake-wall walk under archers, or the spiked ditch).
- 270-334: the cart lane, tower 2 and crank 3.
- 334-376: the sappers' tunnel (a corridor).
- 376-452: the lift, the high bridge, tower 3 and the lift down (vertical).
- 454-490: the hall.
- **REPETITIVE:** the three towers.
- **S2 approx:** only 2 jumps of 3+ tiles (84-88, the breach at 258-264). Weak.

**Plan**
1. **TWIST tower 3** (431). **M.**
   - The blower stands on the ground at the high bridge's end (437) and **runs for his horn when he sees you** (the
     way a Highcrown sentry runs for his bell). Catch him on the bridge, or climb the tower's net under its archer's
     fire.
   - This is the review's idea.
2. **COMBINE horn and gate** (288-313). **S.** Tower 2's horn calls the hounds out from behind crank gate 313. The
   order matters: silence him, then crank, or fight the pack in the cart lane.
3. **The horn in the boss** (the hall, 454-490). **M.**
   - A blower on the rafters, up the escape-gate climb at 472, calls a sapper wave in phase two unless you get up there
     first. This is A10 and A11 using the level's own rule.
4. **EXAM** (398-452). **M.**
   - The sagging high bridge, with a sapper at its far end, tower 3's archer covering it and the running blower, then
     the lift down to a hound on the landing.
   - Checkpoint 376 before it, 451 outside the hall.

---

## 4. SPOREWOOD (`spore`): 552 cols, INDEX 83. Score 7, 8.5 after

**Rule:** THE CAPS GROW INTO STEPS. **Mechanics:**
- growcaps: stop on a bud and it rises; leaning caps; strike a glowbud root and it grows
- the spore fall (a told rockfall)
- bouncer caps
- snapping shelves
- webs and weavers (web holds your feet)
- lurker caps
- spitcaps
- the dark cellar with glowbuds
- the Mother's cap jam

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| growcap | 37 the glade (T); 177/192 leaning over gaps, with a spitcap at 190 (Tw/C); 250/257 the dripping stair under spore falls 251/258 (D); 450/456 grown from a glowbud root (Tw); 505/516 jam her cap (B) | the rebuild's arc is right, **but there is no exam**, and nothing happens with growcaps between 260 and 450 |
| spore fall | 251, 258 | used only on the stair |
| bouncers | everywhere; the pillars 375-398; the bog sinks 336-362 | none |
| lurker | 70-87, 216-233, 294-355 on flats | "SOME CAPS ARE LURKERS" (286) never puts a lurker where caps are steps |
| weaver and webs | 211-245 (T/D), 348, 384-396, 460 | none |

**Layout**
- 0-60: the glade.
- 60-135: the canopy and the root cellar.
- 135-170: the Undercap ambush.
- 175-209: the leaning caps.
- 211-245: the webs.
- 245-285: the dripping stair.
- 285-330: the terrace (a lurker fight on a flat).
- 330-372: the bog.
- 369-398: the pillars.
- 420-471: the Deep Gills.
- 487-536: the Mother.
- **Quiet:** 377-396 and 416-434.
- **S2 approx:** 2 jumps (the bog).
- The +37 wall to Kingswood's INDEX is still there.

**Plan**
1. **TWIST the lurker** (the dripping stair, 245-285). **S.** One of the stair's "buds" is a lurker, so the sign's lesson
   lands where caps are steps. Move the sign from 286 to 244.
2. **COMBINE in the bog** (330-372). **M.** A leaning cap over the middle sink, with a spore fall over its path and the
   weaver at 348 spitting at the rider. This brings the rule back into the second half.
3. **DEVELOP the pillars** (369-398, quiet). **S.** Weavers on two pillar tops web the caps below (a webbed cap is one
   you cannot bounce from), and a lurker sits among the floor caps.
4. **EXAM** (456-486). **M.**
   - Out of the gills: strike a glowbud to grow a cap under a spore fall while the spitcap at 476 and a weaver hold the
     ledge, then take a leaning cap over the last sink to her door.
   - Growcap both ways + fall + foe. This also chips at the Kingswood wall.

---

## 5. KINGSWOOD (`kings`): 714 cols, INDEX 120. Score 7.5, 8.5 after

**Rule:** WHAT HANGS OVER IT CAN BE DROPPED ON IT. **Mechanics:**
- plate to cage
- lever to ram
- the cracked timber post (drop the deck on the patrol)
- the toll bridge
- swings, and ropes against cracked branches
- the bell and gate (80)
- fire: roof vents, the Fired Wood's vents and pits, braziers that tip, fire archers lighting the grass
- thieves (catch one and it pays)
- two forks
- the Great Hound (mini)

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| plate and cage | 172/176 (T), 446/450 (D), **both on the optional low roads**; 612-648 x5 (B) | **GAP: a high-road player meets it first in the boss** |
| lever and ram | 148/154 (T), 426/432 (D), 554/559 (D) | never twisted |
| timber post | 393 once | a one-off |
| fire | 52-72 vents (T), 310-347 Fired Wood (D/C with swings 323/340), 570 grass fire archers (Tw) | **not in the boss** (the phase-3 rockfall is `if (false…)`) |
| swings | 152/175, 268, 323/340, 376, 423/446 | none |

**Layout**
- 0-45: a flat start.
- 45-84: the hall and the roof road (through it or over it).
- 86-136: the knights' road.
- 139-198: fork one.
- 215-238: the mini.
- 240-275: the hanging roots (spikes).
- 277-308: the ambush.
- 310-347: the Fired Wood.
- 354-401: the hunting stands.
- **403-467: fork two, the same shape as fork one** (canopy over roots, lever, ram, plate and cage on the low road).
  **REPETITIVE.**
- 477-516: the toll bridge.
- 520-567: the old stone.
- 568-598: the processional.
- 599-655: the throne.
- **Quiet:** 346-388 (48 tiles, the longest) and 180-211.

**Plan**
1. **A plate and cage on fork one's high road** (160-165), over a thief or a heavy. **S.** This is the review's item.
2. **TWIST fork two** (403-467). **M.** Invert it: the plates are on the CANOPY and the patrol walks the roots, so you
   drop cages down from above. Put a second timber post in it.
3. **DEVELOP the hunting stands** (354-401, quiet). **S.**
   - A second cracked post over a patrol.
   - The stand archers (361/385) cover the rope walk (S1).
4. **EXAM** (566-598, the processional). **S/M.**
   - A plate and cage over the carpet guards (shields 579/582), while the fire archers light the grass and a brazier
     can be tipped.
   - Boss side: revive or delete the phase-3 rockfall. **S.**

---

## 6. THE SCREE PATH (`scree`): 552 cols, INDEX 117. Score 6, 8 after

**Rule:** THE SLOPE MOVES UNDER YOU AND THE CLIFF DROPS WHAT IT LIKES. **Mechanics:**
- scree strips (they slide you; block to brace)
- loose-rock ledges that snap under a standing weight
- broken stone (spikes) where the scree puts you down
- told rockfall
- the rockslide (272-340)
- the gully wind (238-245)
- the windmill sails
- the ropeway (lift 360, wheel 370, swing 379)
- climb rock
- charging goats, rock-goblin throwers, harpies, sappers, trolls
- the ewe strays

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| scree | 238-245 the gully (it drags you back over spikes, signed as wind); 279-338 the slope (D/C: loose ledges, goats, a rock goblin on a loose ledge, the slide) | **peaks mid-level, then never again**: not in the quarry, not in the fold |
| loose rock | 280-312 only | taught and examined in one place |
| rockfall | 118-142 (T), 196, 241, 274-320 (C), 358/386 on the ropeway (C), 425 | a good arc; **not in the boss** |
| climb rock | 246 (met), 427 (taught, sign 422) | taught after it is met |
| Ram Lord | a 19-wide fold (499-517), walls only, a waited opening | the boss does not use the rule |

**Layout**
- 0-60: the pasture.
- 61-108: the hamlet.
- 110-160: the terraces.
- **70-159 is REPETITIVE:** goblins, trolls and goats on flats (`FFF-F--F-F-F`).
- 161-214: the windmill rise and the ambush.
- 215-262: the cairn field and the gully. The ridge road 161-290 is a real S7 high road (silver at 285).
- 262-340: the scree slope.
- 344-399: the ropeway.
- 400-435: the crag wall.
- **436-485: the glass quarry, DEAD** (`-S----R`). Its crystal seam is left over from the removed Suncatcher. Fails S3.
- 480-517: the fold.

**Plan**
1. **Teach in order** (215-246). **S.** A short forward scree run with no spikes in the cairn field, before the gully;
   move the climb-rock sign to 244.
2. **TWIST loose rock** (the terraces, 110-160). **S.** Two loose ledges under a rock-goblin thrower, so standing still
   to fight drops you a step. It breaks up the fight-on-a-flat run.
3. **EXAM** (436-495, the quarry). **M.**
   - A scree chute from the stagings down into the quarry, loose ledges over broken stone, a rockfall on a count over
     the chute, a goat charging down it, and the rock goblin on the top staging (431).
   - Slope + loose + rockfall + goat. Checkpoint 438 before it, 496 outside.
4. **The slope in the boss** (the fold). **M.**
   - Widen it to about 30, with a scree bank on one side.
   - His wall crash shakes a rockfall down, so a ram baited into the bank-side wall buries himself: a caused opening.

---

## 7. THE HANGING VILLAGE (`hanging`): 110x132 tall, INDEX 95. Score 6.5, 8 after

**Rule:** THE VILLAGE HANGS ON ROPES, AND A ROPE CAN BE CUT. **Mechanics:**
- four hoists (carry a load in: coil, sack or stone; the mill's peg is cut instead)
- lanterns (strike twice) and snuffers
- snapping branches (they regrow)
- vines, swings, the water-wheel paddles
- the told crag gust (the mill tier)
- spiders on threads
- the squirrel knight
- deadfall pegs and perches (the crown)
- the Weaver's root-nets
- the Owl Reeve (she cuts the hoist in phase two)

**Mechanic map**

| mechanic | where it appears (row: tag) | gap |
|---|---|---|
| hoist | 93 ropewalk (T), 65 mill, cut the peg (Tw), 51 nest, two sacks under spiders (D, optional), 19 crown, cut in phase two (B) | a good arc; no main-road use after the mill |
| lantern and snuffer | 79 market (T), 65 (D), 37 the lantern stair, four snuffers (C), the Reeve's DOUSE (B) | none |
| snapping branch | 93 over spikes (T), 65 (D) | **stops at the mill tier** |
| gust | 56-66 (the mill tier) and the crown arena only | one tier |
| **cutter** | **22,37 and 88,37: placed by the garrison with no rope or bridge to cut** | **GAP: the rope-cutter never cuts a rope, in the level whose rule is "a rope can be cut"** |

**Layout**
- Seven tiers. Each tier is one flat walk (`y79..79 dy0`, `y37..37 dy0`) joined at the trunks by a climb.
- The art rework made the tiers look different, but **every tier plays as the same shape**: walk across, climb.
- **Quiet:** the roots (14-52, row 107), the market (59-89, row 79), the rookery (38-92, row 51).
- **S2 approx:** 2 jumps.

**Plan**
1. **TWIST the cutter** (the rookery, row 51, 38-92). **M.**
   - A rope bridge (the Kingswood toll bridge's `bridge`) across the rookery gap, with a cutter at its far post who
     starts chopping when you step on.
   - Vines below catch a fall (B4). The rule is used against you on the road, not only in the boss.
2. **DEVELOP branches with the gust** (the market, row 79, 59-89). **S/M.**
   - A snapping-branch run under a told crag gust (the mill tier's zone shape): stand through a gust and the branch
     goes.
   - The squirrel knight runs the branches ahead of you (catch him before the trunk).
3. **COMBINE hoist and spider** (the mill hoist, row 65). **S.** A spider drops onto the deck as it rises, so the
   ride is a fight.
4. **EXAM** (the lantern stair, row 37, 96 to 10). **M.**
   - Light the stair's lanterns across snapping branches and a cuttable bridge, while the snuffers work behind you and
     both cutters go for the ropes.
   - Checkpoint 96,37 before it, 10,37 after.

---

## 8. THE MONASTERY (`spire`): 96x222 tall, INDEX 98. Score 7, 8 after

**Rule:** WHAT THE MONKS BUILT STILL ANSWERS A BLOW. CLIMB. **Mechanics:**
- bells: strike one and what hangs from its tower comes down (a drawbridge); the guard bells crack the golem; the
  great bell against the Abbot
- prayer wheels (strike and the stair turns)
- incense vents and bellows (rise)
- the counterweight baskets
- the trapdoor
- chimneys (cling and kick)
- loose masonry that shakes and drops
- goblin priests (rite, censer, bell)
- harpies, bats, fledglings

**Mechanic map**

| mechanic | where it appears (column,row: tag) | gap |
|---|---|---|
| bell | 11,117 the drawbridge (T), 73,117 (D), 36/45,51 crack the golem (Tw), 56,29 (B) | the best arc on the road, **but nothing between row 117 and 51** |
| incense and bellows | 177-195 the herb garden (T), 109-117 the flue (D), 61-79 the bellows (Tw) | **stops at row 61; not in the exam or the boss** |
| prayer wheel | 48,171 (T), 21,99 (D) | never twisted |
| baskets, trapdoor | 135, 217 once each | one-offs, fine in a climb |
| priest | one lesson per floor (195 up to 35) | a good placement arc |

**Layout**
- A tall climb (27 of the stretches are platforming). Every storey is a wall-to-wall slab with the route zigzagging
  across it. The rework made the eleven storeys look distinct.
- **Quiet:** the bell yard, row 117, 17-65 (56 tiles: the walk over the drawbridge).
- **Exam:** the crawl and the chapel (rows 29-55: the golem, then `HPHHHP-PPPPH`). It is real, but it does not use
  incense or a wheel.

**Plan**
1. **DEVELOP the drawbridge** (bell yard, row 117, 17-40). **S.** A harpy and a fledgling over the bridge, and a priest
   at its far end whose rite blesses them.
2. **COMBINE incense and loose masonry** (the bellows, rows 61-79). **S.** Loose masonry over the bellows plume, so you
   ride up through shaking stone.
3. **TWIST the prayer wheel** (the crawl, row 35). **M.** A third wheel turns the stair between two priests' flocks.
   Flip it mid-rite and the stair goes out from under the priest.
4. **EXAM** (rows 29-40, the crawl to the belfry door). **M.** An incense vent and a bellows carry you to the belfry
   door past that wheel, while a priest blesses a troll on the landing. Incense + wheel + priest + harpy.

---

## 9. GALE MOOR (`moor`): 703 cols, INDEX 99. Score 6.5, 8 after

**Rule:** THE WIND COMES IN GUSTS, AND YOU CAN HEAR EACH ONE COMING. **Mechanics:**
- the told gust: ride it (carry), cross in the still, brace
- updraft vents and thermals
- the air rail (the wind rivers)
- the downdraft cliff
- the mill sails
- bales and hornblowers
- kite goblins and sail goblins (the gust carries them)
- hags in the bog
- the storm kite (flight)
- skybolts
- the Windcaller (brace through his howl)

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| ride the gust | 38-46 over the bog (T), 298-306 over thorns (D), 551-647 the Sky Road headwind, on the kite | none |
| cross in the still | 55-65 (T), 313-327 (D) | none |
| brace | 259-289 the bracing stones (T/D), the howl (B, caused) | **no foe ever pushes you while you brace** |
| sail goblin | 172-235 (C: gust + foe) | only in the kite field |
| air rail, downdraft cliff, mills, bales and horns, kite | 212-248, 383-389, 402-454, 495-534, 544-646 | **each once. The told shove gust is not used at all from 328 to 550.** The mills and the Tumble gusts are `alt` with no shove. |
| kite | the post at 535-550, then the ride | **the ride is still untaught** (the review's item 4) |

**Layout**
- **0-210: a flat run (y21)**: the gate, the causeway, the circle, the bothy and the kite field. That is 30% of the level
  flat.
- 210-253: the rail.
- 254-297: the bracing climb.
- 298-361: the gallery.
- 362-401: the cliff (vertical).
- 402-454: the mills.
- 455-494: the ambush.
- 495-534: the Tumble.
- 535-646: the kite and the Sky Road.
- 647-702: the landing and the summit.
- **Quiet:** 61-93, 210-246, 353-379.
- After the gallery, the level is a parade of one-off machines. It has variety, but the rule does not escalate.

**Plan**
1. **DEVELOP the mills** (402-454). **S.** The mill gust becomes told with a shove. Ride a sail up in the lull; the
   gust throws you off the top, so go as it blows and it carries you to the next mill.
2. **TWIST at the bracing stones** (259-289). **S.** A sail goblin that the gust carries at you while you brace. Block
   her and she spills into the thorns.
3. **COMBINE: the Tumble** (495-534). **S.**
   - Its gust becomes a told shove headwind.
   - Bales roll on the gust beat, and the hornblowers blow between beats.
   - Brace on the stones through a gust, and jump the bale in the still. This is the first on-foot exam of the rule
     with foes.
4. **EXAM** (535-646). **S.**
   - A 12-column kite practice at the post (kite up, land on a stone) so the Sky Road examines a taught verb.
   - One told headwind burst over the organ pipes that you dive under. Flight + gust + skybolts + harpies.

---

## 10. THE ORE ROAD (`oreroad`): 524 cols, INDEX 116. Score 7, 8.5 after

**Rule:** THE BUCKETS ARE THE FLOOR. STEP ON, STEP OFF, AND DO NOT STAND ON RUST. **Mechanics:**
- bucket rides: a loaded skip rides low, an empty one high; hold down to tip it
- the brake (shield on a bucket)
- the fast chute
- rusted buckets that give way
- the tippler (drops a skip of ore on what is under him)
- the sheargob (leaps onto your bucket and shears the hanger)
- rockfall, bats
- miners, sappers
- veins to mine
- the Winchmaster's drum (jam it with a loaded bucket)

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| ride | 68-135 span 1 (T), 204-271 the chute (D), 353-407 the steep, rust (Tw), the drum (B) | **the stretch before the boss (408-475) is on foot** |
| tip and load | 17 (T); the jam (B) | **GAP: "dumped ore falls on what is below" is never asked mid-level** |
| brake | 49 (T), bats over span 1 (D) | never used as timing |
| tippler | 60, 176, 186, 235 on the chute (C), 307, 346 on the steep (C), 428, 460 | none |
| sheargob | 194, 238 (C), 292, 380 (C), 419, 459 | none |

**Layout**
- 0-67: the yard.
- 68-135: span 1.
- 136-203: the sorting tower (vertical, with the ambush).
- 204-271: the chute.
- 272-339: the collapse (on foot, spike gaps).
- 340-407: the steep.
- 408-475: the winch house (fights on foot).
- 476-523: the drum.
- The best layout variety in scope: eight distinct places, alternating ride and foot.
- 38% of the reachable footing is optional; much of it is quiet side decks.

**Plan**
1. **TWIST the tip** (the end of span 1, 120-135, over the pylon lookouts' deck). **S.** A sapper pair on the deck under
   the line. Tip your loaded skip on them from above.
2. **DEVELOP the brake** (the steep, 353-407). **S.** A tippler's frame hangs over the line. Brake short of it and go
   after his skip drops: the brake as timing, not only as a place to fight.
3. **EXAM** (408-475). **M.**
   - Make the winch house a last ride: one short line with one rusted bucket, a sheargob who leaps on, a tippler over
     the middle and bats.
   - The foot fights (the heavy at 455, the gaffer at 462, the javelin at 466) move to the landing.
   - It rehearses the Winchmaster: buckets, cut lines and the drum.

---

## 11. STORMHOLD (`storm`): master 430 cols, INDEX 116. Score 4; 7 with the held branch; 8 after the plan

**Rule on master:** THREE GATES, AND EVERY KEY IS INDOORS. **Mechanics:**
- doors and the indoor band
- keys and lock gates (x3)
- hearth goblins asleep by the fire
- give-planks (63-74, 253-273)
- the chimneys and their sweeps (150-177)
- weights: the longhouse chandeliers 121-152, the soot-watch weight 187, the Long Bridge fire cages 313-403 (B)
- three side watchtowers, each with a zip line down (payoffs: the horn, the weight, the camp-gate lever)
- the Queen's Lance

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| keys indoors | brass 26 (T), iron 93, bone 156 "and it is full" (D) | no twist; not in the boss |
| weights | 121-152 (T), 187 (D), 313-403 (B) | the one clean arc |
| give-planks | 63-74 (T), 253-273 (D) | none |
| **sentries** | **54,27 and 226,23: no bell anywhere** | **dead foes** |
| **cutters** | **68, 117, 244, 290: no rope to cut** (every `bridge` is `cut:false`) | **dead behaviour** |

**Layout**
- 0-98: the street (flat, y33).
- 99-212: Smoke Row (the Hearth Hall ambush sits over the longhouse row, then the chimneys).
- 211-300: the Halls (flat, y29).
- 301-429: the bridge, **30% of the level**.
- **Zero platforming stretches on the pacing strip.** A corridor.

**The held branch** `origin/claude/stormhold` (5f3ede7, 2026-09-24, not merged) changes:
- **Size:** 672 columns (span 720), seven sections: the Road In, the Market Square, Smoke Row, the Bell Close, the
  Halls, the Curtain Wall, the Long Bridge.
- **The new rule:** "THREE GATES. EVERY KEY HANGS IN A WATCHTOWER". Each key is on a tower's top deck, and the tower's
  rope runs back down to its gate.
- **The climbs escalate by what is overhead:**
  - the Gate Watch: one pourer, and a landing to hide on;
  - the Bell Watch: two pourers, an archer across the gap, and a second route over the roofs;
  - the Curtain Wall: a ~20-row face with a pourer on the hoarding, archers, and a shield captain on the walk.
- **THE SCALDER**, a new foe who pours pitch down a ladder.
- **F5:** the keep-gate portcullis on the drop winch.
- **The ambush** moves to the Market Square (THE PIKE SERJEANT).
- **The look:** stone townhouses.
- **Numbers:** INDEX 120; worst checkpoint gap 57; walked by the bot with the knight and the warden.
- **It predates the 09-25 merges**, so it needs a merge with master (`level.js`, `main.js`, `marks.js` and
  `playtest.js` will conflict).

**Plan (on top of the branch)**
1. **Review and merge `claude/stormhold`.** **M** (a merge and re-verify; the content is built). It answers layout,
   uniqueness and escalation at once.
2. **TEACH Highcrown's bell here.** **S/M.**
   - Highcrown's first sign says SENTRIES RUN FOR THEIR BELLS, and no level before it teaches that.
   - Give Stormhold's sentries one bell each through the existing `L.alarms`: catch him or break the bell, or the grate
     drops and the watch turns out. The dead sentries become Highcrown's T.
3. **COMBINE the bell with a tower.** **S.** A sentry on the Bell Watch's top deck rings before you reach the key
   unless you come up the roof route.
4. **EXAM** (the Curtain Wall). **Keep, plus S.** Keep it. Add one fire-cage weight at the bridgehead over a pike line,
   so the boss's verb is rehearsed at the door.

---

## 12. HIGHCROWN (`crown`): 940x100, 1192-tile route, INDEX 126. Score 7, 8 after

**Rule:** EVERY HALL HAS A BELL, AND A GATE THAT DROPS WITH IT (now true: four alarms). **Mechanics:**
- bells and alarms
- keys and lock gates
- the winch drop-gate (228, 670)
- chandeliers and weights, and the Queen's pillars
- fire: the siege ditch, vents, the bakehouse
- hot plates
- rail carts
- the boiler
- temperers and their braziers
- javelin spears that stick in the wall (stand on one: sign 270)
- scaffolds
- the bucket swing and the hoist (the pit)
- the Forgemaster (mini)

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| bell and alarm | 304 the ward, the chase (T); 735 the hall turns on you (D); 730,19 the chapel, two sentries (Tw); 878 the leads, no run (E) | not in the boss (the Queen has her own) |
| chandelier and weight | 714 (T), 774-802 the falling lamps, 824/835 the banquet (D), 896-927 plus the pillars (B) | none |
| winch gate | 228 (T), 670 (D) | never used as a weapon |
| stuck javelin spear | 270, signed | **GAP: taught, never required** |
| fire crossing | 112-191 the siege lines; 588-657 the bakehouse, **the same scaffold-and-vent crossing again** | REPETITIVE |
| hot plates | 473-570 once | it could escalate into the bakehouse |

**Layout**
- 0-110: the crag climb.
- 112-191: the siege lines.
- **192-330: the outer ward (flat y63 for 138 columns).**
- 328-395: the crag walk (climb).
- 396-451: the pit (vertical rides; good).
- 466-585: the armoury, the furnace and the mini.
- 588-657: the bakehouse.
- 658-760: the keep (five floors, vertical).
- 762-809: the Captains Hall.
- 816-852: the banquet ambush.
- 853-889: the leads.
- 889-934: the Queen.
- **F4 break:** the keep hall, the Captains Hall and the banquet are three fight rooms back to back (`FFFFFF` 700-745,
  `FFFF` 775-799, then the ambush).

**Plan**
1. **TWIST the stuck spear** (the Captains Hall, 762-809). **M.** The balcony javelins throw at you, and their missed
   spears are the steps up to the balcony. That makes the second of the three fight rooms a climb under fire.
2. **Make the bakehouse its own place** (588-657). **S/M.** Bring the furnace line's hot plates and a temperer at a
   brazier into the burning yard, so this crossing is "fire you time", not the siege lines again.
3. **The winch as a weapon** (228). **S.** Put the road picket's hounds (284-292) on the patrol path under the gate, so
   its first use drops it on something.
4. **EXAM** (853-889, the leads). **S/M.** The race to the bell turret, with javelin spears as the only steps up to it
   and a chandelier weight over the watch that turns out. Alarm + spear + weight.

---

## 13. THE BURNING VILLAGE (`burning`, a side road off the Stockade): 508 cols, INDEX 96. Score 6, 8 after

**Rule:** ONLY HIS FIRE SPREADS. WATER PUTS IT OUT. GET THE VILLAGE OUT. **Mechanics:**
- burning goblins light the straw they walk on
- the bucket (carry water into a fire)
- troughs (strike them) and hot doors
- captives
- burning beams (they give 1.8 s after you step on)
- ember-pit logs
- smoke plumes that lift you
- the roof hatch
- the pump in the Pyromancer's square

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| bucket | the croft well 90 (T), the hot door 101 (D), the fallen house 229 (Tw), the Hall's rain butt 255 (D), the square's pump 456 (B) | a good arc; **"a doused beam holds" is never asked** |
| burning beam | 287-295 once | **a one-off** |
| smoke lift | 250-311 (the rooftops only) | one section |
| burning goblin and straw | 38-336, mostly on flats | never paired with a crossing |

**Layout**
- **0-134: a flat run (y25)** with the same "burning goblin on straw, archer on the roof" fight twice (the road in, then
  the crofts). REPETITIVE.
- 190-250: the long street.
- 250-320: the rooftops (the only vertical section).
- 320-400: the barn ambush.
- **400-450: the well yard, a breather** (`R---FR-BBB`). Fails S3.
- **S2 approx:** 1 jump.

**Plan**
1. **DEVELOP the beam** (the long street, 188-191). **S/M.** Turn the ember-pit log into a burning beam with a smoke
   plume rising from the pit, so the beam and the lift are met before the rooftops.
2. **TWIST the bucket** (the rooftops, 287-295). **S.** Make the beam gap too long to run, so dousing it with the rain
   butt's pail is the answer.
3. **COMBINE the goblin and a crossing** (the road in, 38-60). **S.** The first burning goblin walks the straw by the
   ember pit, so "kill it on bare ground" is a positioning problem next to a pit.
4. **EXAM** (400-450, the well yard). **M.**
   - The well's bucket (414) across straw a burning goblin is lighting, under an archer on the 420-432 roof, to the last
     captive's hot door (422).
   - A burning beam over the trench to the square's door.
   - Checkpoint 404 before, 446 outside the arena.

---

## 14. UNDERLEAF (`underleaf`, secret, off Kingswood): 520 cols. Score 5, 7 after

**Rule:** NOTHING HERE CAN SEE YOU. IT CAN HEAR YOU. **Mechanics:**
- materials: thatch and moss are quiet; boards and wading are loud
- the mill wheel's din (108-136)
- windows light up and wake the neighbours
- sleepers, and the assassins who are awake
- berserkers (cannot turn)
- keys in three halls (brass 112, iron 188, bone 250) and three lock gates (157, 336, 469)
- windmill sails up to the high boards (146, 248)
- the bell tower (320)
- the two wells joined below (412-462)

**Mechanic map**

| mechanic | where it appears (column: tag) | gap |
|---|---|---|
| loud boards, quiet thatch | 26 (T), 159 a street of boards (D), 340 the school: loud yard, quiet roof (D), 412 the green, nothing to hide behind (Tw) | every step is the same two-lane shape |
| din | 78-136 once | a one-off |
| assassin | 12 placements from 70 to 446 | none |
| wells joined below | 412-462 once, at the end | a natural exam, unused as one |

The sign at 340 says the bone key is on the school master's desk; the bone key stands at 250 (the dais). Check this.

**Layout**
- **The whole walked route is one flat street (y33 from start to gate).** The roofs (rows 21-28) are the quiet
  parallel road, and the halls (rows 5-16) hold the keys.
- **13 thatched houses in a row**, the same pairing each time. Pacing: 24 fight stretches, 1 platforming. REPETITIVE.

**Plan**
1. **Break the street** (262-330, "things sleep under the yew"). **M.** The street drops into a sunken lane of boards
   with a sleeper in every doorway. The roofs are the only quiet way, and their 3-tile gaps are real jumps (S2): a fall
   onto the boards wakes the lane.
2. **TWIST the din** (the windmill at 248). **S.** A din box of its own, which is the only cover for crossing the dais
   hall's loud gallery.
3. **COMBINE the berserker and a roof edge** (the school, 340-390). **S.** Wake him on purpose and let a charge he
   cannot turn carry him off the roof.
4. **EXAM** (412-468, the green). **M.** Swim the joined wells under the green quietly, with an assassin at the far
   well's mouth and a berserker walking the green above, to the last gate (469).

---

## 15. THE HIGH STORE (`shopCrag`): a 40x28 shop room

A counter, three NPCs and a door. It has no route, mechanics or sections, so none of this review's measures apply, and
adding content would make it a new level. **No design lane.** Its look (a cellar, not a mountain trading post) is the
look-and-feel lane's item 12. **Score: not applicable.**

---

## RANKING BY GAIN PER LANE (the biggest improvement for the least work first)

| # | level | now → after | work | why it ranks here |
|---|---|---|---|---|
| 1 | **STORMHOLD** | 4 → 8 | M (the content is built on `claude/stormhold`) + S | the biggest gain in scope, most of it already written; the lane is a merge, a re-verify and two placements |
| 2 | **GALE MOOR** | 6.5 → 8 | four S | every beat is a gust-zone flag, a foe move or a short practice strip; the rule then escalates past the gallery |
| 3 | **THE BURNING VILLAGE** | 6 → 8 | S, S, S/M, M | the exam slot is a breather yard with every part it needs already standing in it |
| 4 | **THE SCREE PATH** | 6 → 8 | S, S, M, M | the dead quarry becomes the exam; the Ram Lord gets the slope |
| 5 | **SPOREWOOD** | 7 → 8.5 | S, S, M, M | the rebuild did the rule; this adds the exam and the second half |
| 6 | **MARSH WOOD** | 6 → 8 | M, M, M, S | a big gain, but three M beats |
| 7 | **THE ORE ROAD** | 7 → 8.5 | S, S, M | already varied; one M exam |
| 8 | **THE STOCKADE** | 6.5 → 8 | M, S, M, M | the rule has to get a twist and reach the boss |
| 9 | **THE HANGING VILLAGE** | 6.5 → 8 | M, S/M, S, M | tall-level work is slower to verify |
| 10 | **KINGSWOOD** | 7.5 → 8.5 | S, M, S, S/M | already good |
| 11 | **BRACKEN WOOD** | 7 → 8 | S, S, M | already good; tutorial level |
| 12 | **UNDERLEAF** | 5 → 7 | M, S, S, M | a real gain, but it is a secret level few players reach |
| 13 | **THE MONASTERY** | 7 → 8 | S, S, M, M | the arc is already the best on the road |
| 14 | **HIGHCROWN** | 7 → 8 | M, S/M, S, S/M | 1192 route tiles: every change costs the most to walk and verify |
| 15 | THE HIGH STORE | n/a | none | a shop room |

## PROPOSED DESIGN LANES (one or two levels each, in ranking order)

1. **Lane STORMHOLD**: merge `claude/stormhold`, then the bell teach (it sets up Highcrown) and the bridgehead weight.
2. **Lane CRAGS: GALE MOOR + THE SCREE PATH.** Wind, scree and rockfall; both need an exam; the same crag kit and tools.
3. **Lane CAMP: THE BURNING VILLAGE + THE STOCKADE.** The camp and its branch share the goblin roster, the braziers,
   the barrels and the fire code.
4. **Lane WET WOOD: SPOREWOOD + MARSH WOOD.** Act-one pads and caps; both are an exam on top of a rule that is already
   taught.
5. **Lane ORE ROAD** (alone). It has the bucket code and the Winchmaster pilot to re-run.
6. **Lane TALL: THE HANGING VILLAGE + THE MONASTERY.** Both are tall switchback climbs, verified with the same
   tall-level walks.
7. **Lane FOREST: KINGSWOOD + BRACKEN WOOD.** Small beats plus two boss-side items (the Queen's pine, Gorm's
   rockfall).
8. **Lane UNDERLEAF** (alone, optional).
9. **Lane HIGHCROWN** (alone, last). It is the largest level, and its bells were just rebuilt; let them settle.

## GAME-WIDE PATTERNS WORTH FIXING ONCE

1. **The last stretch before the boss is a rest, not an exam (S3).**
   - The final 40-60 route tiles are quiet or light in Marsh (`-R.-BBB`), Sporewood (`FRP-BBBB`), Scree (`S----RBB`),
     Burning (`R---FR-BBB`) and Kingswood (`FSRBBBB`).
   - In the Ore Road it is foot fights; in Gale Moor it is a vehicle.
   - Only Bracken Wood's helm pit and the Monastery's crawl really examine the level.
   - **Fix once:** an `exam` check on the pacing route. The last 80 route tiles must hold at least two P/H stretches,
     one of the level's rule mechanics, and a foe placed within two tiles of a jump or landing. It gets a shrinking
     grandfather list, as `checkpoint-gaps` has.
2. **A foe placed without the thing its behaviour needs.**
   - Cutters with no rope (the Hanging Village x2, Stormhold x4).
   - Sentries with no bell (Stormhold x2; Highcrown had three until 09-25).
   - A sign with no subject (Marsh 274).
   - **Fix once:** `garrison()` and a check refuse a cutter with no cuttable `bridge` or rope within reach, and a
     sentry with no alarm.
3. **The machine is a one-off.**
   - The felled pine, the catapult, the cart, the timber post, the rockslide, the air rail, the downdraft cliff, the
     mill sails, the din, the hot plates and the burning beam each appear once.
   - One-offs are fine for set pieces, but the level's RULE mechanic must reach T, D, a twist and E.
   - Only five levels do that as built: Wood, Sporewood, the Hanging Village, the Monastery and Highcrown's bells.
   - **Fix once:** `pacing.mjs` could print each rule mechanic's appearances along the route, so a lane sees the arc
     before and after.
4. **A flat first third.**
   - Bracken Wood 0-266, the Stockade 0-69, Gale Moor 0-210, the Burning Village 0-134 and the Ore Road 0-138 open on
     one row.
   - Stormhold and Underleaf are one row start to finish.
   - For the tutorial that is right. Elsewhere the first vertical beat comes too late.
5. **Bodies on flat floor, few jumps that can fail (S1, S2).**
   - The pacing tool finds 0-5 "a creature within 2 tiles of a landing" per level.
   - The approximate count of 3+ tile pit jumps on the main route is under 6 in ten of the fourteen levels.
   - Most plan beats above are placements for exactly this reason: the same foes, moved to a worse place.
6. **Repeated shapes inside a level (B8).**
   - Kingswood's two forks.
   - Highcrown's two fire crossings.
   - The Stockade's three towers.
   - The Hanging Village's seven walk-across tiers.
   - Marsh's 17-hop river.
   - The same shape again is where "no variety" comes from, more than the art.
