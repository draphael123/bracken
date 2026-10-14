# claude/buriedcity4 - BURIED CITY 4, THE LEVEL HALF (OPUS, 2026-10-14) - base origin/master 2cf3294b (BATCH91)

Brief: scratch/brief-buriedcity4.md items 1-3 and 6-10 (item 4, THE KING's rework, is the OPUS King lane on THIS branch; item 0 was fixed live; item 5 music
and item 11 art are the SONNET lanes). Greybox art on every new piece (the ART LIST below). STOPPED before boss tuning: no 12-seed loops.
PORT 8904 for every page run, one page at a time.

## THE COLUMN SHIFT (read this first, King lane)
Two new sections were laid INTO the city, so every column at or past 337 moved: **x >= 337: +72 (THE GLASS WORKS 337-408); x >= 750: +23 more (THE
ANTECHAMBER 822-844)**. W 792 -> 887. The throne room is at AX 845 (was 750); THE ROOFTOPS 702-821 (was 630-749). Everything that read the old columns was
shifted with it (src/buried-city.js, src/stuck-spots.js, src/buried-city-hands.js walk hints + glass zones, src/redraw/buried_city_tiles.js districts,
buried_city_flip_art.js dressing, buried_city_backdrop.js, tools/buried-city.mjs, tools/buried-city-route.mjs). The king's own code and his tools
(hk-probe, buried-city-levers, buriedcity-exit) read the arena, not columns: unchanged and green. Old saves: same level id, road order untouched.
Two pre-existing one-column holes in the floor at the courtyard's door and the throne room's door (old col 749: down out of the world) are floored.

## 1. THE GLASS WORKS (337-408, NEW, indoors, first half) - flip platforming, its own exam, a shrine after (A14 teach before test)
The glassblowers' hall under the sand roof, over THE GLASS PIT (the sand sea indoors - a 27% bite and back to the last footing that does not move; taught
here, before the rooftops). Five glasses:
| beat | what the flip does | |
|---|---|---|
| RISE AND SINK (works1) | strike the glass on the kiln stub: the two buried roofs you came over SINK behind you, two roofs RISE as a stair to the gallery | floors rise and sink |
| THE SAND LIFT (works2, brief 7) | a sand-fall from a roof crack: idle it beats you into the pit; turned it flows UP - step in, ride 11 rows to the upper gallery | a traversal verb |
| THE SAND-BOUND + THE TILTING DUNE (works3, briefs 2 + 8) | one glass holds both: resting, the sand holds the sand-bound (0.4, told) and the dune rises WEST (a wall); struck, the sand-bound is BURIED to the chest (stuck, whole damage) and the dune tilts EAST - a ramp to the high kiln | the flip is your weapon |
| THE RELAY - THE EXAM (works4, works5) | the high kiln's glass raises two roofs down to a chimney stub; ITS glass raises the last roof over the pit and buries the sand-bound waiting on the floor; a slinger on a balcony over the floor throws at the relay | then a shrine (408) |
REQUIRED (reach model + buried-city.mjs): without works1's, works4's or works5's roofs, without riding the lift, or with the tilting dune idle, nothing
reaches the throne room. Every glass glints + nudges (src/stuck-spots.js, 5 new spots) and the walker has its hints (GLASS_ZONES).

## 2. THE SAND-BOUND (brief 2) - a VARIANT, the level keeps one new foe (the construct)
The sand-drowned's machine (the ambusher, `cnSkin: 'sandbound'`) bound to a glass (`glass: id`): while its glass rests THE SAND HOLDS IT - every blow lands
at 0.4 (B15's floor) and is told with the B10 read (src/boss-read.js: the clank, the flash, THE SAND HOLDS IT; a shimmering sand shell drawn round it; once:
"THE SAND HOLDS IT: TURN ITS GLASS"); strike its glass and it is BURIED to the chest - its machine waits (stuck: no step, no blow), every blow lands whole
("BURIED TO THE CHEST: IT CANNOT MOVE"); it never burrows off ahead of you (bound where it rose). Own greybox sprite set (src/redraw/buried_city_cast.js
bakeSandBound, 9 frames: its own SLAM TELL / SLAM poses - B16 - and BURIED TO THE CHEST), bestiary card, corpse in its own skin (tools/corpses.mjs green),
foeHit/foeHp as the drowned. Placed where the flip is taught and tested: the glass works x2 (works3, works5), THE ROOFTOPS' high dune (bound to the chain's
first glass - bury it and go, or fight it shielded: the chain's roofs run on the same glass), the courtyard (the exam before the throne).
Code: src/buried-city-flip.js F.bound/boundTake, src/buried-city-hands.js H.hold/H.takeSandBound/H.world, main.js (the CV machine's hold, wardedDamage).

## 3. OUTDOOR SHADE (brief 3, A13 drains) - the drain is pressure, not a wall
Awnings at EVERY rooftop glass (the dome's, the chain's two, the exam's: you strike them in the shade), the courtyard's broken dome shades both sides (its
hole lets the sun in over the middle, where the elite stands), and DRIFTING CLOUD SHADOWS (L.clouds: one over the dunes, three over the rooftops, drifting
west toward you at ~1 tile/s; a cool wash over the columns, a hard band on the ground; src/buried-city-hands.js cloudAt -> noSun -> main.js cvShaded).
HP LEFT PER HERO PER OUTDOOR STRETCH (tools/buried-city-route.mjs, real keys, no foes, base movement; the route pilot now splits SUN and SAND SEA out of 'other'):
| hero (max hp) | THE DUNES (+ the stair's shaft) | THE BREACH | THE FALL + the tilting dune | THE CHAIN | THE EXAM + courtyard | THE ANTECHAMBER | LEFT |
|---|---|---|---|---|---|---|---|
| knight (100) | 100 | 100 | 100 | 100 | 97 | 97 | **97%** |
| warden (100) | 100 | 100 | 100 | 100 | 97 | 97 | **97%** |
| pyro (88) | 88 | 88 | 88 | 88 | 87 | 87 | **99%** |
| paladin (120) | 120 | 120 | 120 | 120 | 115 | 115 | **96%** |
| pirate (90) | 90 | 90 | 90 | 90 | 88 | 88 | **98%** |
| reaper (95) | 95 | 95 | 95 | 95 | 91 | 91 | **96%** |
| geomancer (95) | 95 | 95 | 95 | 95 | 92 | 92 | **97%** |
| berserker (105) | 105 | 105 | 105 | 105 | 102 | 102 | **97%** |
BEFORE (BC3's shade, same tool): knight lost 7 / 27 / 23 on the fall / chain / exam = **43% left** after the rooftops with no foes at all (pyro 45%) - the
"near-impossible" Daniel played. WITH FOES at campaign level (L40, knight/warden/pyro): the sun takes 0-10 hp of 292 over the rooftop legs; the exam leg's
sun went from 216-563 hp (the bot stood on a sunlit rib waiting out the elite) to 0 (the courtyard's sides are shade now; the light is two columns over the
elite). The drain still bites a fight in the sunlit middle, a wait out in the open, a slow chain - pressure, not a wall (Q3).

## 6. THE LANDMARK SHOWS THE FLIP (brief 6)
THE GREAT HOURGLASS on the skyline (src/redraw/buried_city_backdrop.js drawTower) TURNS OVER - half a turn about its neck, eased - while a glass near you runs,
its sand then runs UP the screen (gold marks climb beside it), and turns back when the glass runs out (L.towerFlip, eased in src/buried-city-flip.js). Its
glass is no longer see-through: a dark smoked glass (alpha 0.13 -> 0.62) with a bright rim, and no haze over the whole tower (0.8 -> 1; outside 0.5 -> 0.9).

## 7. SAND-FALL LIFTS (brief 7) - see the glass works' lift (taught) and THE ROOFTOPS' fall (remix): every hero rides both with base movement.
## 8. FLIP-REVERSING SLOPES (brief 8) - L.tilts: steep slope tiles (src/slopes.js) the hands write and MIRROR with the glass (src/buried-city-flip.js writeTilt):
taught in the glass works (works3), remixed on THE ROOFTOPS' high dune (742-746, turned by the FALL's glass - the glass that lifted you also tilts the dune
your way: keep moving). Downhill a run, uphill a crawl (the slopes engine). Drawn from the sand kit (main.js bcRetile now re-picks slope cells).

## 9. THE EXAM BEFORE THE THRONE (brief 9) - one stretch, shrine after
THE COURTYARD: its elite (the Sundial Warden, in the sun) + a SAND-BOUND bound to the courtyard's glass; then THE ANTECHAMBER (822-844, NEW, under the throne's
roof): its glass raises THREE TIMED SAND SLABS over the sand (L.tplats - each crumbles on its own timer, 3.4 / 4.6 / 5.8 s, a draining bar over each, red in
its last 0.8 s - the King's own trick, foreshadowed), then CHECKPOINT FIVE at the throne room's door. REQUIRED: without the slabs nothing crosses.

## 10. THE LOOP BACK TO A SHRINE (brief 10)
THE OLD STREET UNDER THE DUNES: the throne street runs on under the rooftops (710-810, rows 28-31) to the courtyard; its sand-gate opens only FROM THE
COURTYARD (E at its lever; L.loopDoor) and stays open (a respawn keeps it). A death past the rooftops walks back from the fourth shrine (693) under them in
~18 s instead of redoing the rooftops. The rooftops' sand seas got a floor (bottom row 26) over the street: who is in the street is not in the sea (the
swallow skips him; the sea's art is clipped to its floor; stakes under the sea keep the reach model off its floor). The mouth's sign: ITS GATE IS SHUT FROM THE FAR SIDE.

## CHECKS (PORT 8904, one page at a time)
- **tools/buried-city.mjs 334 green** (was 278/279; +48 BC4 assertions: the glass works in the first half and indoors, every new piece REQUIRED by the reach
  model, the sand-bound's binding + 0.4/1.0 in the fake world, the tilt both ways, the slabs rise and crumble in order, the loop opens from the courtyard only,
  the street under a sea is not swallowed, every rooftop glass struck in shade, clouds, the landmark turns).
- **ROUTE PILOT, real keys, base movement, god, no foes: ALL 8 HEROES walk the whole city end to end** (knight, warden, pyro, paladin, pirate, reaper,
  geomancer, berserker: 0 lifts, 0 retries, 334-415 s) - incl. the three glass works legs, the tilted high dune, the courtyard and the antechamber's slabs.
- reach-heroes (nothing new), level-reach, deadends, solid-islands, stuck (static + runtime), checkpoint-gaps (hard rule: worst 200, none closer than 80),
  checkpoints, checkpoint-stand, desert-rules, tells, signs, one-new-foe, goblin-lint, threat-holes, answer-tags, blow-tags, floaters, killzones, spawns,
  collectables, keys, relics, comments, homepaths, hint-shown, modulepreload, architecture, slopes, rule-state: **green**.
- Page: **drawn-solids green** (as built, every gate/chute/glass both ways, respawn - incl. the tilts and slabs), **buriedcity-exit green**, **buried-city-levers
  30 pulls green**, corpses (the sand-bound dies in its own skin), untold-told, boss-read: green. mark-integrity: only the known undeadmage phantom (not this lane).
- **Re-stamped LEVEL then BOSS**: pilot 12 deaths / 3 runs, 506% hp a run (act-5 band 150-700%), curve row written; **mash level 0/3 clear** (knight 5, warden
  25, pyro 3 deaths); **mash boss 0/6**. **level-quality buriedcity CLEARS** (and every gated level clears).
- **textfit SCOPED** (TEXTFIT_LEVELS=buriedcity, talk x6 heroes + bestiary, one page, --strict): 471 screens, every count 0.
- NOT RUN (by the order): the full textfit sweep, any 12-seed boss loop (the King is the next lane's).

## STATED TEST CHANGES (never weakened; each a design change)
- tools/buried-city.mjs: SECTIONS 10 -> 12 (THE GLASS WORKS, THE ANTECHAMBER); the exam's sinker found by its glass (the glass works has sinkers too); every
  column literal shifted with the level; +48 new assertions (BC4 block). 286 -> 334 green.
- tools/slopes.mjs: THE BURIED CITY joins the levels built with slopes (its tilting dunes).
- tools/buried-city-route.mjs: three GLASS WORKS legs, the courtyard + antechamber leg, the high dune's tilt; SUN / SAND SEA split out of 'other'.
- tools/textfit.mjs: TEXTFIT_LEVELS=a,b (a lane's scoped run over its own levels' pages; unset = every level, as before).
- New: tools/bc4-probe.mjs (a lane's probe, not in the suite).

## ART LIST (for the SONNET art lane - every item is GREYBOX)
1. THE GLASS WORKS ('bcWorks' interior): a glassblowers' hall - kilns and their glow, racks of blown hourglasses, cullet, pipes; the kiln stacks / chimney
   stubs / piers (the deep isles, drawn today as 'bcBuried' walls); THE GLASS PIT (it wears the rooftops' sea art today - make it the indoor pit: darker, glass
   shards, no sky dust); the sinking/rising roofs (house kit today).
2. THE SAND LIFT indoors (the dune-fall art today) and its roof crack.
3. THE TILTING DUNE x2: the slope cells (they pick the sand slope kit / masonry under them); a TILT animation (today an instant swap + a burst of sand) and a
   warn shake in the glass's last 2 s.
4. THE SAND-BOUND (bakeSandBound, greybox): a real sprite on the same 9-frame contract (0 mound, 1 rising, 2-3 walk, 4 SLAM TELL, 5 SLAM, 7 hurt, 8 BURIED TO
   THE CHEST); the SHIELDED read (today a pulsing ring) and the buried sand collar; its corpse; its bestiary card.
5. THE TIMED SAND SLABS: the slab, its rise, the timer (a bar today), the crumble.
6. THE ANTECHAMBER ('bcAnte'): the throne's outer hall; its MURAL (840-843, decor 'mural' today = the old mural) -> THE KING RAISING SLABS OF SAND TOWARD
   HIMSELF (foreshadow of his rework).
7. THE OLD STREET ('bcUnder'): a tunnel backdrop (a flat dark fill today), its SAND-GATE and lever (greybox rects), its lamps; the stakes/bones under the seas.
8. THE CLOUDS: only their shadows are drawn (a wash + a ground band) - draw the clouds in the sky over them.
9. The four new rooftop awnings (drawRoofAwning: check the poles on the dome, the stub and the far bank).
10. THE GREAT HOURGLASS: the turn-over (a rotation today) and its climbing marks - a nicer turn and frame at backdrop scale.
11. (brief 11) FORESHADOW THE KING (B8): frozen half-buried citizens along the throne street and the glass works, murals of him raising sand platforms;
    VISUAL PASS: texture/strata on the big flat sand blocks, tone down the pink-orange wash.

## QUESTIONS FOR DANIEL (rec first = what is built)
1. **A10b (report-only): THE GLASS WORKS' shrine (408) is 94 route tiles after CP2 (329)** - a DENSE note (the old 610->730 one is BC3's). Rec: keep: the hard
   rule (<= 200 route tiles between shrines) needs both - without CP2 the run from CP1 to the glass works' shrine is 262; without the glass works' shrine CP2->CP3
   is 276. Gaps now 166/168/94/182/120/176. Alt: move CP2 earlier into the halls (before their elite exam) and the glass works' shrine into the sand-fall hall.
2. **The loop's west mouth is a dead end until it is opened from the courtyard** (a sign there says the gate is shut from the far side; the reach fill puts
   gold in it). Rec: keep (it reads as the way back once you have seen it). Alt: a sand bank over the west mouth that the opened gate also clears.
3. **Shade is generous now: 0-5% hp lost over the whole rooftops at running pace with no foes (was 57%).** Rec: keep - the drain still bites fights and waits
   in the open (the courtyard's sunlit middle, the slinger on the far bank, a slow chain), and the tune lane can drop a cloud if it is too soft. Alt: drop the
   rooftops' third cloud now.
4. **The sand-bound buried takes x1.0 (whole), shielded x0.4.** Rec: keep (whole, as the brief says). Alt: x1.25 'BRITTLE' to make the flip pay more.
5. **THE ANTECHAMBER's sand under the slabs is a bite and back (27%), not a death.** Rec: keep (the exam before the throne should not cost the rooftops again;
   the loop and the last shrine sit by it). Alt: lethal, as the rooftops' exam sea.
6. **The courtyard elite follows you a few tiles into the antechamber (its leash).** Rec: keep (a fight by the slabs' glass is a fair exam). Alt: leash him
   to the courtyard.
7. **The pilot's curve sits at the top of act 5's band** (12 deaths / 3 runs, 506% hp a run; band 2-12 deaths, 150-700%) - BC3 was 9 / 374%. Rec: leave to the
   SONNET tune lane (the sand-bound's weight and the courtyard elite are the levers).
