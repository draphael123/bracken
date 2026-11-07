STATUS: READY (branch claude/tutorial1, code tip 89ea679dd off master 929cc4786; the report commit sits on top). Not merged, not deployed. Browser checks owed: see the end.

# TUTORIAL1 - the roadside lesson (Daniel 11-05 22:05 / 22:07)

## What was built
1. THE ROADSIDE LESSON (new hidden level `lesson`, appended after duel_pit; src/opening-tutorial.js). One layout for every hero, 8 steps, a gate after each step that has something to do:
   MOVE, JUMP (a curb and a ditch), HIGHER (a 2-row ledge only a held jump climbs), ATTACK (3 straw men; 3 in a run = heavy third), BLOCK (slow straw swordsman), DODGE (flashing straw swordsman; a roll through the swing counts), FLASK (the road "bites" you to 45% and gives a flask; you drink it for real), SHRINE (light it). Ends at a door with the plate WAYMEET'S CROSSROADS INN; E / D-UP / USE enters the inn.
   - A bottom panel shows the step in the CURRENT hero's own words (keyboard binds incl. swapped Z/X, pad buttons, touch buttons; main.js opnWords) + "SKIP: ESC, THEN SKIP LESSON" + "n OF 8".
   - NEW save: after the hero pick it starts at once (replaces the old "SEE THE ARENA YARD FIRST?" question). Existing saves: never sent there.
   - Skippable: the pause row "Return to map" reads "Skip lesson" in it; either way you end at the inn. Stall rule: 40 s in a gated station and the gate opens by itself ("ON WE GO", teaches nothing) - nobody is trapped.
   - Safe like the yard (yardSafe), but the flask is real. NO `trial` flag, so co-op works (the lesson replay takes the party). The wood's own hint lines are muted inside it (the panel is the only voice).
   - PROG.taught: jump, highjump, third (only if a heavy third blow was struck; lessonHint 'third' reads it), block, dodge, flask, shrine. PROG.lesson = 1 finished / 2 skipped.
   - Reused from git history (87cb86171, before the yard swap): the open yard's straw men / gap / steps / gated-station pattern and the trial yard's PORT gates + step panel; the foes are the arena yard's slow straw swordsmen.
   - Demo: 'lesson' added to DEMO_IDS (demo players need it); tools/demo-cut and demo-floats updated and green.
2. TAVERN REPLAY: a LESSON BOARD station (id `lesson`, x 55, in the training-yard area, plank sign "LESSON") replays it with the party and returns to the inn. First-visit glint + first-use line like every station.
3. EXPLAIN THE TAVERN:
   a. The lesson ends at the door/plate WAYMEET'S CROSSROADS INN. First arrival in the inn (any route, once per save, PROG.innTold) shows a card: "THE TAVERN: WAYMEET'S CROSSROADS INN - YOUR HOME BETWEEN ROADS: FRIENDS JOIN HERE, CHANGE YOUR LOOK, TRAIN, THEN TAKE THE ROAD." Station glints/first-visit lines untouched.
   b. Subtitles (width-limited, textfit-proven): title menu, with LOCAL CO-OP or ONLINE CO-OP selected: "INN: CO-OP, LOOK, TRAIN"; map footer "F INN: CO-OP  G ONLINE" (touch: "INN: CO-OP, TRAINING"). The approved "INN - CO-OP, WARDROBE, TRAINING" does not fit either place; it is in the card and tips instead.
   c. 3 loading tips (the inn, the Arena Yard, replay the lesson) in src/loading-screen.js via LESSON_TIPS.

## Checks (all one browser at a time, RAM 3.7-4.5 GB free each time, no GATE flag)
- tools/lesson-opening.mjs (new): pure (level geometry, gates, every prompt for kb/pad/touch words, demo slice, append order, tips) + walk for knight, ranger (ranged), paladin (heavy), berserker: all 8 steps, gates, PROG.taught, door to the inn, PROG.lesson - PASSED each (berserker/ranger legitimately teach no 'third'); skip, inn card once, lesson board with a party of 2, stall rule, save carries lesson+innTold, new-save hero pick goes straight into the lesson - PASSED.
- textfit: new scope `lesson` (every step for 9 heroes, signs, door plate, inn card, title row, map footer): 0 issues (it caught two overflows I then fixed); scopes trial/title/arena 0 issues.
- demo-cut green; demo-floats green (lesson added); level-quality, anchor-lint, dangling-paths, modulepreload, map-spacing, loading-screen, save-safety, arena-yard, hero-trials: green. tools/tavern.mjs all 10 scopes: OK (stations tool now includes the lesson board; the one earlier page crash was transient and did not repeat). tavern-menu: all ok after exempting opening-tutorial.js from the "no CROSSROADS INN string" rule (see Q1).
- NOT run: tools/check.mjs (full suite), real pad/touch device, audio/music in the lesson.

## Stills (scratch/lane-reports/)
tutorial1-lesson-move.png, tutorial1-lesson-jump.png, tutorial1-lesson-attack.png, tutorial1-lesson-block.png, tutorial1-lesson-door.png (plate + prompt), tutorial1-tavern-board.png (LESSON board), tutorial1-inn-card.png (first-arrival card). (the headless "PRESS A KEY FOR SOUND" box in them is the harness)

## Questions for Daniel (recommendation first)
1. NAMING: the level banner and all other UI say THE TAVERN (claude/tavernname), your 11-05 22:07 line says INN. I used INN on the door plate, subtitles, tips and the card ("THE TAVERN: WAYMEET'S CROSSROADS INN" bridges the two). REC: pick one word. Either rename the banner to THE CROSSROADS INN (one-line change, then drop the exemption in tools/tavern-menu.mjs) or switch my subtitles to TAVERN. 
2. SKIP lands in the inn too (rec: yes - the card explains it in one screen). Alternative: skip goes to the map.
3. The lesson starts at once after the hero pick, skip from the pause menu (rec). Alternative: a Y/N screen first (slower, easy to mash past).
4. Existing saves also get the welcome card once on their next inn visit (rec: yes; it only sets PROG.innTold).
5. Dodge / block need one success each (rec: short); two is a one-number change (STEPS need).
6. Art is the existing palette + the arena's straw swordsmen: no new art. A polish pass could dress the curb / ditch / ledge (demo-floats is clean).
