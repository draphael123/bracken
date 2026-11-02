# claude/pyroboss2art - PYRO BOSS 2 + FIRE MAGE ART (sonnet, Sun 11-01) - pushed, NOT merged/deployed
Base: claude/pyroboss2 2b6daecf. Art only: no numbers, boxes, hit rules or level hashes changed.

## DRAWN
- GOBLIN FIRE MAGE (src/redraw/fire_mage_art.js, same 16x21 grid + anchor as the book mage so every pick/hit box holds): redrawn - singed pointed hat with ember glints, big ear with pink inside, hooked nose, fangs, scorched robe with brass belt + ember hem, iron-shod three-claw staff. 10 frames: 0 idle, 1-2 walk, 3 LOB windup (staff back, flame swelling), 4 release, 5 raised, 6 hurt, 7 FLAME WARD (palms out, hem blown), 8 DOUSED (hunched, black smoking staff, drip), 9 DEATH (folded, staff snapped; his corpse frame, main.js spawnCorpse). Hurt frame now used (fireMageFrame).
- CINDER ACOLYTE: same 10 frames, human (ash hood, shadowed face, ember sash) - unplaced, for post-Goblin-Queen use.
- FIRE BOLT drawBolt (ball + dragged flame tail + sparks), BURNING PATCH drawFirePatch(fuel stone | grass | thatch: green/gold blades catching along the edges, tendrils, 3-tone tongues, embers, smoke as it gutters), MAGE WARD drawMageWard (the boss dome art at mage size + flame wreath, red guttering end), DOUSED steam, SPENT gold ring, WATER BUTT drawWaterButt (staves, hoops, bright water at the lip, glint, drip, bucket) - now the butt outside the village.
- BOSS (src/pyro-art.js, boss palette): phoenixTell (crouch in a rising column + red floor ring), phoenixDash (wing streaks + floor tail), fx 'land' (landing burst + flame column each side), fx 'fizzle' (sputter, smoke, falling sparks), windedSteam (gasp steam, drips, hiss ring), conflagPillar (staff-up pillar), scorch (burn mark: charred oval with glowing cracks, whitening when the eruption is told), landRing (red dashed ring where a big ball lands). Wired in main.js drawPyromancer / drawPyroMarks / the PHOENIX landing / both FIZZLED sites; the Conflagration eruption keeps pyro-art's erupt column.

## STILLS (scratch/lane-reports/pyroboss2art-shots/): sprite sheet (mage-sheet.png: goblin row 1, acolyte row 2), fx-sheet.png (all fire pieces), and the 13 in-game stills retaken (boss-*, firemage-casting/patch/ward/doused, cinderacolyte). BEFORE = scratch/lane-reports/pyroboss2-shots/. The Rootway card still hid the mage there, so the mage stills are taken in the BURNING VILLAGE (it has two fire mages; the stills script copy is work/tmp-pyroboss2art, uncommitted).

## CHECKS (gate137 beside; one browser at a time, >= 1.5 GB free each)
GREEN: goblin-lint, pyro-duel, village-water, fire-mage (static + FM_PAGE=1 game).
corpses.mjs ran 30 of 32 levels clean before my 590 s cap (the fire-mage levels not confirmed in that window; a smoke kill in the burning village drew with no page errors, corpse frame 9 not asserted). NOT RUN: textfit, mark-integrity (long, browser; no new strings, no new marks - art only), per-level pixels/art checks (no level or tile changes).

## QUESTIONS FOR DANIEL (built as rec)
1. Fire mage patch tone on grass is the same flame with green blades catching at the edge - enough, or a bigger "spreading" tell? (rec: enough.)
2. Phoenix Rise is drawn as the boss's existing roll pose + flame wings (no new body sprite - the kit's sheet is the hero's). A dedicated crouch/dash body frame would be a hero-sheet change. (rec: keep.)
