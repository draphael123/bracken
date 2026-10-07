# claude/underwell2 - THE UNDERWELL, Daniel's 10-06 live playtest notes (Opus)

Base: origin/claude/batch74 0c0b69aa (master batch73 + the boss sweeps incl. sweep3's always-vulnerable CISTERN QUEEN, djinn5, redgorge2). PORT 8684.
Brief: scratch/brief-underwell2.md items 1-9, all built. Everything below is measured on this branch unless it says otherwise.

## 1. FLOATING OIL (fixed at the cause + a check)
- The vertical oil runs (`L.lines`) were drawn down the MIDDLE of an air cell, 6 px off the wall, and several ran through open air or inside rock
  (47 cells: the hall drums' tops, the works' east pipe inside its wall, the upper works' fallen block, the sump's pipe in mid-air, the exam
  gutter's far pipe, the Queen's east streak beside the outflow, both her streaks ending in mid-wall).
- Now: a WALL STREAK is drawn flush on the rock beside it (`oilSide` in src/underwell-hands.js, `streakX` in src/redraw/underwell_art.js) and
  rests on a floor or on floor oil; where no wall is, an iron STANDPIPE (`pipe(...)` in src/underwell.js, drawn as a riveted pipe with sight slots)
  stands on the floor. The works' pipe moved 216 -> 215 (on the wall's face, not in it); the Queen's west streak runs to her floor, the east one
  rests on a stone lip over the outflow (the outflow is 3 rows high now).
- tools/underwell-aloft.mjs D (Node, in check.mjs): every floor cell is open air over a floor / a gutter slot / in a nest / over a pipe's mouth;
  every streak cell has rock on its drawn side and its foot on something; every standpipe stands; and on a canvas a streak's pixels lie against
  its wall. Red on the base (47 cells), green now.

## 2. TORCHES = PICK UP + THROW - src/carry-throw.js (the module the game-wide THROW lane reuses)
E takes a torch out of its cresset; carried it lights your way (a 78 px hole in the dark) and THE BROOD SHY FROM IT (none steps within 40 px;
near ones back off); ATTACK throws it in a TOLD ARC - dots and a pulsing landing ring drawn over the dark while you hold it; UP held = a lob,
DOWN held = a short toss. Where it lands it lights the oil (a nest it hits catches; a foe it hits is struck, x3 on the drowned dead, x2 on an oil
thief; a streak or standpipe catches; oil floating on water catches; plain water puts it out). It lies burning 8 s (E takes it up again); lying in
oil it catches in 0.6 s. A blow knocks it from your hand (it lies at your feet). Swimming puts it out. It needs a hand: no climbing with it (told;
E sets it down) - this keeps the works' and the exam's firebreaks required. Strike-to-drop is gone (a blade on a cresset says "E TAKES THE TORCH
OUT OF ITS CRESSET"). The Great Lamp stays a strike: "STRIKE THE CHAIN: THE LAMP FALLS INTO THE OIL" (sign, nudge and the line when it gives).
The phone: the action button says TAKE at a cresset / SET DOWN while carrying (BK.touchVerbs), the context button says THROW (BK.touchCtx), the
attack button throws. A pour on a boss or on burning oil in front of you wins E over a cresset beside you; on plain oil E takes the torch.

THE API (src/carry-throw.js, pure but the two draw helpers):
- `KINDS[kind]` - aims `{ low, mid, high }` as `{ vx, vy }` px/s, `g`, `r` (half-size for walls), `ring`, `dots`; `addKind(kind, def)` adds a kind.
- `aimOf(kind, face, keys)` -> `{ vx, vy, aim }` (UP = 'high', DOWN = 'low', else 'mid'); `launchOf(kind, P, keys)` -> `{ vx, vy }`.
- `predictArc(kind, x, y, v, solidAt(px, py, falling), { dt, maxT, stopAt(px, py) })` -> `{ pts, land: { x, y, t, wall, hit } | null }`.
- `stepArc(o, dt, g)` - the same integration the flight uses, so the told arc IS the flight.
- `drawArc(g2d, arc, cx, cy, time, col)`, `drawRing(g2d, x, y, r, time, col)`.
- Hooks it relies on in main.js (small, generic): a carried thing (`P.carry`) may carry `launch(P)` (throwCarry asks it for the throw's velocity)
  and `noClimb` (the climb start refuses while it is carried); src/throwables.js has a `torch` row (carry speed). A lane wiring a new throwable:
  put `{ thrKind, launch: P => CT.launchOf(kind, P, keys), state: 'held' }` in `P.carry`, step its flight with `stepArc`, draw `predictArc` + `drawArc`.

## 3. EVERY ROUTE NEED SAYS ITS VERB; THE THROW IS TAUGHT SAFE FIRST
- Every Underwell nudge rewritten with its verb (src/stuck-spots.js: "TAKE THE TORCH (E), THROW IT ON THE OIL (ATTACK)", "POUR AT THE ROPE FIRST,
  THEN THROW THE TORCH ON THE OIL", "TAKE THE TORCH, TOSS IT SHORT INTO THE OIL: DOWN + ATTACK", "LOB THE ISLAND TORCH OVER THE WATER: UP + ATTACK",
  "CLIMB THE ROPE: HOLD UP", "POUR ON THE OLD OIL FIRE: E WITH WATER IN YOUR SKIN", ...) and every sign at the point of use (src/underwell.js).
- TEACH (the dry well): the torch on the bare stone at the shaft's foot, a short run of oil to the nest, no foe near (the nest 21 -> 24, the step,
  drip, sign and old fire 3 east). TEST (the brood chamber): its oil is its own now and its torch hangs at its dry door - the Great Lamp burns the
  hall, the chamber wants a thrown torch (the brood shy from it as you carry it in). REMIX: the works' firebreak (take, step back onto the wet
  stone, throw), the sump's SHORT TOSS (its torch moved onto the bare stone: a mid throw sails past the oil, the ring shows it). TWIST: the LOB over
  the drowned cistern's deep pool. EXAM: the lamp stair, and the thieves' gallery.

## 4. THE NEW CAST (reskins of proven machines; one-new-foe still satisfied)
- THE OIL THIEF (cnSkin 'oilthief' on the sapper / dynamite bandit's machine): keeps his distance, holds a flask up (the machine's red !!) and throws
  it where you stand - it breaks into 5 cells of LAMP OIL (a direct hit splashes 6, unblockable); his coat is soaked: fire x2; his LANTERN is a light
  (bats scatter from it) and when he falls it drops into the oil he stands in. 3 of them on THE THIEVES' GALLERY (one on a high ledge over oil).
- THE CISTERN BAT (cnSkin 'cisternbat' on the bat's machine, turned round): hangs in the dark vault and DROPS on you while you stand in the dark
  (a yellow ! 0.5 s - the shield turns and swats it), and LIGHT SCATTERS IT (a torch in hand or lying, burning oil, a lit cresset, a thief's lantern):
  carry fire under its roost and none comes down. Marks: 'bat|diveTell' ! / block / high added by hand (src/marks.js; tools/tells.mjs in step).
- THE DROWNED DEAD (cnSkin 'drowneddead' on the zombie's machine, buried): lie under the standing water and rise as you wade in ("THE WATER
  STIRS"); grab as the dead do; FIRE TAKES THEM x3 (burning oil, a thrown torch). Oil floats on their water: a thrown torch sets it alight.
- Art (src/redraw/underwell_art.js): the thief's grey hood, oil-black coat, lantern, flask and scarf; the pale cave bat; the waterlogged teal dead with
  weed and water running off him; the flask in flight; the carried / thrown / lying torch. All three carded, corpsed in their own skin, named, hinted.
  tools/corpses.mjs now covers the Underwell (all nine reskins pass).
- Cast: 53 foes; no kind over ~35% (venom 25%); roles melee/ranged/runner.

## 6. THE INVISIBLE ROPE (found and fixed) + a check
- Cause: a rope hung again (the 30 s spare after a burn, or a respawn) set its cells back to NET but nulled their tile picture and nothing resolved the
  tiles again - a climbable, INVISIBLE rope. Now the hands call `ctx.retile()` (main.js resolveTiles) whenever a rope is hung again.
- Every rope (the two firebreak ropes and the Queen's two ladders) also gets a warm lit edge drawn OVER the dark pass, faint far off, bright within
  120 px (H.drawRopes).
- Check (tools/underwell.mjs, page): 12 samples - hung, every cresset empty (dark), re-hung by the timer, re-hung by a respawn - each rope column at least
  18 brighter/darker than the wall beside it (lowest 31).

## 7. A FIRST-TIME WALK ("confused where to go") - each spot fixed
Walked with real keys (tools/underwell-route.mjs, updated for take/throw and the new section) and looked at from where you stand:
1. The upper works' east end: the drop to the sump was a black gap - a WAY LAMP hung in the shaft, a sign "THE SUMP IS BELOW: DROP DOWN THE OLD SHAFT",
   a glint + nudge "DROP DOWN THE OLD SHAFT INTO THE SUMP".
2. The sump's far end: the climb onto the stone rise - a way lamp, glint + nudge "JUMP UP ONTO THE STONE: THE WAY OUT OF THE SUMP".
3. The drowned cistern's landing: the drop into the dark hall - a way lamp, glint + nudge "DROP DOWN INTO THE OLD CISTERN", a sign at its head.
4. The far nest burnt: the swim - glint + nudge "SWIM THE DEEP POOL TO THE FAR SHORE".
5. The stair room: a way lamp at its top, glint + nudge "CLIMB THE BOARDS UP TO THE GALLERY: JUMP".
6. Her corridor: a way lamp over the shaft, glint + nudge "DROP DOWN THE OLD SHAFT TO HER CISTERN", the sign says how fire and water hurt her.
(The way lamps are caged lamps on chains - lights only, nothing to take, so they never look like a verb.)

## 8. FIRE + WATER FEED THE QUEEN'S OPENINGS
- New: THE FIRE DRIVES HER UP - her burrow that runs into burning floor oil (her hall's two pools, lit by a torch you take from the wall and throw)
  comes up OPEN, the same opening as a flood (CQ.openT, openMul, her told ward after it); the bar reads "DRIVEN UP" (src/cistern-queen.js fireUp).
  Her cressets hang reachable from the floor now (taken, not jump-struck). Her corridor's sign: "FIRE ON HER FLOOR DRIVES HER UP; WATER OPENS HER."
- She LEFT THE BAND on the standard bot (boss-rates practiced, profile human, L32): this branch 7/8 4/8 8/8 = 79% beside the base 0c0b69aa's
  7/8 1/8 7/8 = 63% (both n=24). Likely cause: her cressets - a jump-strike used to drop one into the floor oil under the bot; now nothing does.
  Retuned once: hp 1050 -> 1150 -> 4/8 1/8 8/8 = 54%, in band, no hero at 0 (20 seeds a hero spent on this branch - at the cap, stopped).
  Bug found on the way: the bot's E at her mound by a cresset TOOK THE TORCH instead of pouring (42% for a while) - E now pours first on a boss.

## 9. A LONGER UNDERGROUND + FOES UP TOP
- THE DROWNED CISTERN (437-532, 96 columns; the level is 600 wide, her hall moved 96 east): the shallows (oil on the water, three drowned dead), the
  island (a pillar, its torch), the deep pool (swim; a lob over it), the far shore (its brood and THE FAR NEST at the stair room's door), the stair room
  (four boards up), THE THIEVES' GALLERY (three thieves, their spilled oil, a high ledge, a sandworm under the silt), her door.
- Up top: a sandworm under the upper works' floor (its oil burning drives it under), one on the lamp stair's gallery, one on the thieves' gallery;
  the thieves and the bats are all high. Checkpoints: four (the drowned cistern's head added at 438: spacing 95+ route tiles).

## 5. NUMBERS (all re-stamped via the tools, level THEN boss)
- level-quality underwell: CLEARS THE BAR (8 gadget kinds, 4 checkpoints one per 160 route tiles, 1.45 encounters a screen, 10 bands, 3 roles);
  every gated level clears.
- Level-1 curve (tools/level1-pilot.mjs --curve, knight, 3 runs): act 5 THE DESERT - 261% lost a run, 7 deaths: in band (150-700%, 2-12 deaths).
  Pilot row: 43 blows, 6 deaths, walked 100%.
- Mash bot (tools/mash-bot.mjs, L32, machines), level THEN boss: level knight dead (0%), warden dead (0%), pyro 15% - all fail it; boss 0/6
  (dead every time, she is left 82-96%).
- Real-keys route pilot (not in the suite): all 7 heroes walk the whole route on base movement (god, no foes, 0 lifts, 0 deaths). Level 1 with every
  foe alive and a careless hand (never blocks/dodges): the drowned cistern is where it dies (drowned dead 164-306, bats 28-151 damage a leg).

## Checks (PORT 8684; green unless said)
underwell (page + static: the torch per hero x7 keyboard + phone labels, the told arc within 1 px, no climbing, the knock, the thief, the bat, the dead,
the lob, the Queen driven up, every rope seen), underwell-aloft (+D), level-quality (all gated), mash-gate, curve-gate, cistern-queen, boss-openings,
boss-fight-end, boss-greed, boss-read, normal-health, rule-openings, corpses (+underwell), desert-foes2, welltown, redgorge, burning-village,
throwables, readability, render-layers, stuck, hint-shown, tells, answer-tags, one-new-foe, threat-holes, goblin-lint, sprinkle-cap, signs, skins,
architecture, comments, dangling-paths, floaters, frame-cost, map-grammar, map-spacing, checkpoints, ground-depth, footing-art,
ambient-landmarks, audio-assets, boss-music, npc-removal, textfit.
RED, NOT MINE: slopes-trace (kings, burial differ - identical on the base 0c0b69aa); tells (updateScalder pourTell/ladleTell - red on the base); modulepreload (17 modules other lanes added - red on the base; this lane's
src/carry-throw.js IS preloaded).

## QUESTIONS FOR DANIEL (recommendation first; the recommendation is what is built)
1. THE AIM: three heights (UP lob / plain / DOWN short), the ring shows each. Rec: keep. Alt: hold ATTACK to charge the distance.
2. A KNOCKED TORCH lies lit at your feet and catches oil there in 0.6 s (E takes it up). Rec: keep (the rule used against you, told). Alt: it gutters.
3. NO CLIMBING WITH A TORCH (E sets it down). Rec: keep - it is what keeps the two firebreaks required.
4. THE QUEEN 1050 -> 1150 hp (she rose to 79% once her torches stopped falling on a jump strike). Her new fire opening is not used by the bot, so a
   human has one more way in than the 54% shows. Rec: keep 1150 for your playtest (B9 gate). Alt: 1100 if she feels long.
5. FOUR CHECKPOINTS (one added at the drowned cistern's head). Rec: keep (else a death there walks you back past the whole exam). Alt: remove it.
6. THE DROWNED CISTERN at level 1 is the hard leg for a careless hand (three dead + bats). Rec: keep for your playtest (the level-1 curve is in band);
   if it is harsh, take out the shallows' middle dead.
7. modulepreload: 17 other lanes' modules are not preloaded (red on the base). Rec: the integrator runs `node tools/modulepreload.mjs --write` once.
Music: nothing new (the level keeps "Ossuary 6 - Air").
