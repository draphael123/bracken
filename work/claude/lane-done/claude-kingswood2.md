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
| THE COURT'S PROCESSION | 306-416 | EXAM / SET PIECE | past the shrine the court's horn: SIX marchers (pike, shield, sprig, brute, shield, sprig, banners) march the carpet road toward you from off the screen. On THE BOUGHS (4 rows up, a board step at their foot) they do not see you and pass under, out by the side gate. On the road in front of them, or once one is hit, the whole court turns on you. THE AMBUSH from the boughs: a cage, a LOG that rolls into the court, a plate-cage, the arch's RAM. Then THE COURT GATE (plate on the step); silver in the boughs' crotch; shrine 414 |
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
  boughs and leaves; a hero on the road turns all six). **green.**
- NEW **tools/kingswood2-probe.mjs** (page): lands in play, a real blow on the first peg kills the sleeper and leaves the step, the checkpoint step and the climb over
  the wall, the log trap through the pike line, the span bridge, the cage stair's three steps, the area banners, a death keeps steps + bridge, the procession passes a
  hero on the boughs (6 out the side gate) and turns on a hero on the road (6/6), King Gorm wakes. **all green, 0 page errors.**
- green: level-quality kings **CLEARS** (static rows; see STAMPS), solid-islands (kings 103 -> 0, allowance removed), reach-heroes (**all 9 heroes, 0 crossings**),
  stuck --static, route-breaks kings --strict (0), signs, checkpoints, deadends (3 pockets, all paid), dressing, one-new-foe, spawns, floaters, killzones, collectables,
  elites, threat-holes, answer-tags (4), checkpoint-gaps (DENSE report only: 92-113 route tiles, the A10c structure), relics, hint-shown --static, gate-openers --static
  (updated for the new court gate; its runtime part pins the new gate col 410 / plate 405,11 / 10 bars / kennel floor), bridge-props (updated), slopes-trace
  (--rebase=kings only; wood/burial/canal differ on master already), ambient-landmarks, curve-shape.
- NOT run: the suite; gate-openers runtime; textfit.

## STAMPS / DIFFICULTY
TBD

## RECIPE SELF-SCORE vs ROOTWAY (review-rootway-recipe-1014 scale, 0-2 x 10)
TBD

## ART HOOKS (Sonnet)
TBD

## QUESTIONS FOR DANIEL
TBD
