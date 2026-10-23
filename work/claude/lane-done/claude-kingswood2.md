# claude/kingswood2 - KINGSWOOD 2: THE KING'S HUNTING WOOD (opus greybox, the LEVEL part)

Base: master 5e44cddd (BATCH112). Brief: scratch/brief-kingswood2-1014.md ('!! 10-14 LATE' level section), recipe scratch/review-rootway-recipe-1014.md.
PORT 8785 only, one headless Chrome at a time (5.4 GB free at start). Helpers in work/tmp-kingswood2/ (uncommitted). Not merged, not deployed.
**King Gorm's Phase-1 changes ('!! 10-15') are NOT done - left for tomorrow's opus boss lane** (the level took the day; see QUESTIONS). His hall is his
current phase-1 arena moved whole into the new level (same rows, same relative columns), so the fight plays exactly as on master.

## WHAT LANDED
- **src/kingswood.js** - the level, laid by hand (490 x 44; the old grafted builder `kingswood()` in level.js is left in place, unused, for the art lane's
  reference). **src/kingswood-hands.js** - its rule and machines. **src/redraw/kingswood_oak.js** - THE GREAT OAK.
- **Rule line (true to the code):** THE COURT HOLDS THE ROAD, AND WHAT HANGS OVER IT CAN BE DROPPED ON IT.
  - ROYAL ROPES (L.hoists, the Rootway's data shape so the guide / reach fill / play bot read it unchanged): strike the PEG (a pennant post, glints while it
    holds) and the load drops - a CAGE crushes what is under it (some land as 2x2 STEPS), a LOG SPAN lands across a gap (a BRIDGE), a **LOG TRAP** (Kingswood's
    own) drops, crushes, then ROLLS down the road through every foe on it and splits at the wall. Drawn: rope, pulley, dotted plumb line to where it lands, and a
    dotted line along the floor for a log's roll. Steps/bridges stay through a death (cells laid again).
  - The court's PLATES drop their cages (his hall has five - taught on a bough in the Cage Grove), LEVERS swing hung RAMS.
  - THE COURT HOLDS THE ROAD: its CHECKPOINT walls the road (its cage is the step over it), THE GATE CAPTAIN holds the gatehouse, THE COURT'S PROCESSION marches the
    carpet road, THE COURT GATE (its plate on the road's step).
- **Five named areas** (L.sections; an area banner draws as you enter; a sign names each; a shrine closes each exam - A10c):

| area | cols | arc | what is in it |
|---|---|---|---|
| THE ROYAL ROAD | 0-122 | TEACH | the royal box, court thieves (only here); THE FIRST ROPE (a cage over a SLEEPING brute, sign at the peg: safe); THE COURT'S CHECKPOINT (5-row wall, its guard under its cage - the cage is the REQUIRED step over it); THE LOG TRAP down the high road through a pike + 2 sprigs, splits on the stump; exam THE GATE CAPTAIN (elite brute under his own cage, shield, bow on the gatehouse roof, a lever-swung RAM in the arch, a dip at his back, elite gate 109); the gatehouse cellar (pocket); shrine 118 |
| THE HUNTING STANDS | 122-206 | TEST + A14 platforming | the King's stands on posts over the meadow where his hounds run; an archer on every deck; a cage dropped from deck A onto the pack; THE GAP no jump crosses - THE LOG SPAN (REQUIRED); a fall into the meadow walks back to stand B and climbs (no stair up C/D: the span stays a lock); THE HUNTERS' HIDE (silver, pocket); exam THE HOUND MASTER's kennel (the mini, kept); shrine 205 |
| THE CAGE GROVE | 206-306 | REMIX (teaches his fight) | THE BOUGH PLATE (stand on it: its cage falls on the patrol below - "THE KING HAS FIVE IN HIS HALL"); the wasps' boughs (wasps only here) + a cage over a shield; THE CAGE STAIR (three cages cut down = three steps up a 12-row trunk, REQUIRED); the canopy road's log trap through a hound + shield; exam THE CAGE-WARDEN (elite brute under a plate's cage, the canopy's fall at his back, a bough ladder back up); shrine 307 |
| THE COURT'S PROCESSION | 306-416 | EXAM / SET PIECE | past the shrine the court's horn: SEVEN marchers (pike, shield, sprig, brute, shield, sprig, pike, banners; the court's bow on its stand by the gate) march the carpet road toward you from off the screen. On THE BOUGHS (4 rows up, a board step at their foot) they do not see you and pass under, out by the side gate. On the road in front of them, or once one is hit, the whole court turns on you. THE AMBUSH from the boughs: a cage, a LOG that rolls into the court, a plate-cage, the arch's RAM. Then THE COURT GATE (plate on the step); silver in the boughs' crotch; shrine 414 |
| THE KING'S HALL | 416-490 | BOSS | King Gorm's phase-1 hall as on master (five plates/cages, scaffold, galleries, perches); the road out with SILVER THREE on the King's takings |

- **THE GREAT OAK** (src/redraw/kingswood_oak.js via KWH.drawSky): on the skyline from the first screen, right third, growing and warming as you come (0.42x -> 1.4x),
  cages and pennants swaying in its boughs, the court's smoke rising from its foot (foreshadows the burning wood). Greybox silhouette; Sonnet repaints.
  The route CLIMBS toward it: row 39 -> row 10 (29 rows, 8 bands; old 14 rows / 4 bands). Tints warm area by area (amber -> red-gold -> ember over his hall).
- **Fire saved for the escape**: 0 firepits / vents / braziers (old: 22). Ambient: forest to the hall, hearth in the hall.
- **Wiring**: level.js build -> buildKingswood; retired the old kings rows (REVIEW, AMBUSH "THE KING'S ROAD", GOBLIN_CAMP, CHECK_DROP, VAULT_SILVER, STUCK_SIGNS fix);
  ELITES kings = the two exam brutes; island-posts POST_LEVELS + kings (stands/boughs on timber posts); main.js: KWH wiring (reset, update, strike, draw, guide props,
  BK.kwood, the marcher hook at the top of the foe loop - before foe-pass PURSUE and the far-foe rule, the court marches from off the screen - e.kw copied onto foes);
  reachcore + playtest makeBot read L.kwood ropes like the Rootway's hoists; hint-lines KW_SAY; stuck-spots kings (checkpoint cage, stand span, the cage stair x3,
  court gate plate); level-quality GATE + kings.

## CHECKS (PORT 8785)
- NEW **tools/kingswood2.mjs** (Node, registered in check.mjs, replaces tools/kings2-beats.mjs which pinned the old wood's beats): road, rule, 5 areas, oak drawn,
  fill reaches every shrine/silver/mini/King/gate plate, every REQUIRED rope a LOCK (6), the weapons not locks, steps land on solid ground under their ropes,
  log roads end at walls with foes on them, a shrine closing each exam, elites under something hung, no fire, the procession's road open / boughs out of jump reach /
  marchers out of view, and THE HANDS IN A FAKE WORLD (cut -> crush -> step cells; span cells; log rolls through the pike line and splits; the court passes a hero on the
  boughs and leaves; a hero on the road turns all seven). **green.**
- NEW **tools/kingswood2-probe.mjs** (page): lands in play, a real blow on the first peg kills the sleeper and leaves the step, the checkpoint step and the climb over
  the wall, the log trap through the pike line, the span bridge, the cage stair's three steps, the area banners, a death keeps steps + bridge, the procession passes a
  hero on the boughs (7 out the side gate) and turns on a hero on the road (7/7), King Gorm wakes. **all green, 0 page errors.**
- green: level-quality kings **CLEARS** (static rows; see STAMPS), solid-islands (kings 103 -> 0, allowance removed), reach-heroes (**all 9 heroes, 0 crossings**),
  stuck --static, route-breaks kings --strict (0), signs, checkpoints, deadends (3 pockets, all paid), dressing, one-new-foe, spawns, floaters, killzones, collectables,
  elites, threat-holes, answer-tags (4), checkpoint-gaps (DENSE report only: 92-113 route tiles, the A10c structure), relics, hint-shown --static, gate-openers --static
  (updated for the new court gate; its runtime part pins the new gate col 410 / plate 405,11 / 10 bars / kennel floor), bridge-props (updated), slopes-trace
  (--rebase=kings only; wood/burial/canal differ on master already), ambient-landmarks, curve-shape.
- NOT run: the suite; gate-openers runtime; textfit.

## STAMPS / DIFFICULTY (final level hash; rows stamped LEVEL then carried boss/mini - the arena is unchanged)
- docs/level1-pilot.json kings: fresh L1 knight, 3 runs: 19 hits, **3 deaths**, 151% hp a run, walked 100%, 79 lifts (a rope level: the pilot's 4 s a waypoint counts rope work as lifts, as the Rootway's).
- docs/level1-curve.json kings: **164% hp a run, 2 deaths in 3** - act-I band (40-250%, 0-3).
- docs/mash-bot.json kings LEVEL: knight / warden / pyro all die (lowest hp 0%, 2-3 deaths); boss 0/6 and mini 0/6 carried (arena unchanged).
- **level-quality kings CLEARS** (gated now): bands 8 / 54% second height, mechanics 6 kinds (hoists/plates/levers/rams developed), secrets 3, checks 4 @ 112, pockets 3, ruleFight 12/24.
- **THE WALKER** (tools/level-walk.mjs, campaign L6, human+first, 2 seeds a hero, 94% of the route measured, 0 stuck after the fixes):

| hero | deaths | arrive mean/min | lost %/section | vs act-I target (0.5-1.5 deaths, arrive < 65%) |
|---|---|---|---|---|
| knight | **0.5** (the gate captain) | 56 / 42 | 53 | **on target** |
| warden | 0.0 | 56 / 39 | 24 | arrival on target, deaths low |
| pyro | 0.0 | 90 / 85 | 8 | soft (as on every act-I level: rootway 0/81, spore 0/72) |
  Before the rework (docs/walk-curve.json, old wood): knight 1 death / 79%, pyro 0 / 90%, warden not measured. Walker fixes made on the way: the gatehouse cellar
  moved west (the walker wandered into it under the road), the canopy log's peg moved past the stair's head (the rope hands walked the bot into the trunk wall).
  One pyro run timed out once (Runtime.evaluate 30 min, machine load); the rerun of both pyro seeds was clean.
- Reds outside this level (master already): mash-gate oreroad stale row; slopes-trace wood/burial/canal differ from their baseline.
- Stills (640x360, god-mode knight): work/claude/lane-done/kingswood2-{start,teach,checkpoint,stands,stair,procession,hall}-after.png and
  kingswood2-{start,road,fork,stands,court,hall}-before.png (the old wood at its own columns).

## RECIPE SELF-SCORE vs ROOTWAY (review-rootway-recipe-1014 scale, 0-2 x 10; est., greybox - the old Kingswood scored 9/20, Rootway 19/20)
| item | score | why |
|---|---|---|
| named areas | 2 | five, in the brief's order, one verb each, banner + sign at the entrance, an exam and a shrine closing each (own backdrop painter per area is the art pass: tints only now) |
| landmark + destination | 2 | THE GREAT OAK from screen one, growing/warming; the route climbs 29 rows (8 bands) toward it |
| rule as a verb, state drawn | 2 | peg (glint) -> drop; plumb line to the landing, dotted roll road for a log; helps 13 ropes + 9 plates + 2 rams vs few punishes |
| set pieces (big, verb, route-changing) | 2 | THE COURT'S PROCESSION (hide/ambush), THE CAGE STAIR (3 cages = a stair), the checkpoint step, the stands' log span |
| teach -> test -> remix -> exam, required locks | 2 | 6 REQUIRED ropes + the court-gate plate, all proven locks (tools/kingswood2.mjs); the sleeper teach is safe |
| roster bent to the verb | 1 | foes stand under ropes/logs (LQ ruleFight 12/23 - Rootway 34/39); thieves only on the road, archers on the stands, hounds in the meadow, wasps in the grove, the court on the carpet - but no area-specific NEW foe (question 3) |
| boss foreshadow | 2 | plates + cages taught ("THE KING HAS FIVE IN HIS HALL"), cages in the oak, the court marches to him, his oak on the skyline |
| pacing | 2 | shrines 118 / 205 / 307 / 414, each closing an exam, 92-113 route tiles apart |
| own kit / sound | 1 | own level track 'kingswood' + boss 'gorm'; tiles/ambient still the old autumn + forest/fire (art lane) |
| annoyance balance | 2 | 0 fire hazards (22 before), 2 thieves (13), 3 wasps (9); every threat has a drop to answer it |
| **total** | **18/20 (est.)** | target B+ / >= 15 met; the two 1s are the art lane's and question 3 |

## ART HOOKS (Sonnet; greybox now - nothing here changes the level hash)
- THE GREAT OAK (src/redraw/kingswood_oak.js): repaint the silhouette (half-burnt side ready for phase 2 / the escape), its hall-roof framing over THE KING'S HALL, the hung cages, the smoke.
- Royal ropes (src/kingswood-hands.js drawWorld): a bough or gallows beam over every PULLEY (they hang in air now), the PEG as the court's pennant post (glint kept), CAGE / LOG / LOG SPAN sprites, a split-log burst, a rolling-log animation; the plumb and roll dots kept.
- The procession: banner bearers, a drummer, horn; the court's SIDE GATE at 316 (only a banner deco now); the court gate portcullis dressing.
- Area banner (top of screen) in the game's own frame; per-area backdrops: road (banners, toll posts), stands (hunting towers, the meadow), grove (cages in the boughs, hives), procession (carpet road under great boughs), hall.
- KIT: flagstone court floor + root-cobbled road; the stands' decks/posts (island-posts timber posts now) as hunting scaffolds; the checkpoint wall as the court's palisade gate.
- Ambient bed: horn + drum for the court (forest default until the hall now); dressing kinds via src/dressing.js kings (doorway is not on the allowlist: replaced by a banner).

## QUESTIONS FOR DANIEL (each built as recommended)
1. **King Gorm phase-1 changes ('!! 10-15') not done today.** *Rec (built):* the level first; his hall is moved whole, so today's fight is unchanged. Tomorrow's opus boss lane does P1 (court throws + roof falls out, one slower grab-and-hurl, rafter archers locking the cage ropes, the HUNTING HORN boar) with the escape and phase 2. His hall already uses the level's verbs (plates, cages).
2. **Should the hall's five cages move from PLATES to ROYAL ROPES** (the level's main verb, and what the brief's rafter archers lock)? *Rec:* yes, in the boss lane - the rope data shape (L.hoists, boss: true, d.locked) is ready in src/kingswood-hands.js (cutRope / locked).
3. **One new foe for the level** (the recipe asks for an area-only foe; the brief named a COURT CAGE-WARDEN or a ROYAL BOAR). *Rec:* the ROYAL BOAR, built once in the boss lane for the HUNTING HORN and then placed in THE HUNTING STANDS' meadow (a charge you jump or bait under a dropped cage). Built: no new foe today (stock goblin court, 13 kinds).
4. **The procession pays no reward for hiding.** *Rec:* leave it (the road on is the reward; the fight is optional). Alt: a court silver dropped on the carpet by the last marcher.
5. **The walker pyro** walks the level nearly untouched (fire at range), as in every act-I level (rootway 0 deaths / 81%, spore 0 / 72%). *Rec:* a hero-wide question, not this level's.
6. Kingswood's campaign XP row (tools/fixtures/campaign-xp.json): *rec* re-stamp at integration (`boss-level.mjs --write-xp` rewrites every row on this base).
