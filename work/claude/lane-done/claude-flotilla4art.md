# claude/flotilla4 - ART PASS (Sonnet, 2026-10-27, PORT 6616)
Branch claude/flotilla4, on e28b07ad (greybox + tune). NOT merged, NOT deployed. FINAL SHA: see the last line (the report is committed with the code, so the sha is printed by git log -1 on claude/flotilla4).
Files touched: src/redraw/admiral_art.js, src/redraw/powder_monkey_art.js, src/powder-monkey.js (one draw-pose line), tools/flotilla4art-sheet.mjs (new, Node, no browser). Nothing else: src/level.js, src/flotilla-boss.js, main.js untouched.

## Hash / boss-rate proof (art does not change gameplay)
- Level hashes now (tools/level-quality.mjs levelHash): flotilla 05bf79d25d8b, hurricane 0d3ed6be8e5a = exactly the stamps in docs/level1-pilot.json and docs/mash-bot.json (the e28b07ad re-stamp). git diff e28b07ad shows no change to level.js, flotilla-boss.js, any number, hitbox or timing.
- Boss rates: not re-run, nothing that feeds them changed (flotilla-boss.js untouched; r7 74% stands).

## What was drawn
THE ADMIRAL (the flotilla3art model was already a full hand-drawn sheet; what read "prototype" was that the plates were nearly invisible in play and the openings stood frozen for 3-4 s):
- The CHEST plate is now drawn OVER the sleeve (before, his near arm hid it in most poses, so a plate coming off changed nothing you could see). Stage sheet: 3 plates / chest gone / chest+back gone / bare - each step is visible now.
- Hull iron is brighter steel (lit upper band), plus a glint that sweeps across the plates every ~3 s (armour reads as armour).
- Openings stay alive for the doubled 3-4 s windows: STAGGER sways and shudders, SOAKED shivers (fast tremor) and breathes, recover breathes. (reload/axeStuck/flat already animated: smoke, tugging, stars.)
- The pose set (cut, pistol x2, keg, whistle, grapnel, land, list, flurry, axe, stuck, flat, death) keeps its tells/timings - the pose() table's progress curves were not touched.
THE POWDER MONKEY (fully redrawn, outlined and cached; the greybox drew un-outlined rects every frame):
- navy knit cap with red band and floppy pompom, soot face with big white eyes and a grin, cream/red striped jersey, bare rolled arms, rolled canvas trousers, bare feet, bandolier with spare grenades.
- Poses: idle (breathing), scurry 0/1, holdLit (crouched, cradling the grenade, match to the fuse - first half of the 0.8 s tell), lightTell (up on his toes, arm straight up, grenade over his cap, fuse sparking live - second half), lob (arm thrown forward, empty, speed lines), flee (bent double, sweat), hurt (knocked back, cap flying, crossed eyes), dead (on his back, cap beside him; drawn, not yet wired - the corpse still uses the sheet's hurt frame).
- The GRENADE: outlined iron ball, riveted brass band (green when struck back), a tarred fuse cord from a brass collar that BURNS SHORT as the fuse runs out, a live spark, the red closing ring kept.
- src/powder-monkey.js drawFoe: the tell now picks holdLit for the first half and lightTell for the second (modeT vs PM.lightTell/2) - draw only.

## Checks
- tells.mjs: every mark agrees (1102 rows). admiral.mjs --pure + page (all 9 heroes): ok. powder-monkey.mjs: ok. textfit bestiary --strict: 0 issues (no text changed).
- level-quality flotilla + hurricane: every gated level clears (WARN hurricane blocking 32% report-only, as before).
- mobile-perf (4x CPU, 915x412): flotilla boss arena @548:24 54.2 fps, worst 53 ms (baseline e28b07ad 54.0 / 36 ms); monkey scene @403:24 55.3 fps, worst 36 ms (baseline 55.7). Two earlier runs that started with another scene in the same session showed one 470-820 ms frame on arena load - not reproducible alone (53 ms twice) and the baseline run of that two-scene order did not show it; budget >= 40 fps / worst 600. Noted, not a code fault.
- Not run: tools/check.mjs (per instruction), boss-rates, corpses (the monkey corpse is unchanged).

## Screenshots (scratch/lane-reports/)
- Admiral (Node pose sheets, 4x): flotilla4art-before-sheet-admiral_stages.png / flotilla4art-after-sheet-admiral_stages.png (plates 3 -> bare), flotilla4art-before-sheet-admiral_open_on.png / flotilla4art-after-sheet-admiral_open_on.png (stagger, reload, soaked, axe stuck, flat, recover at 3 times), flotilla4art-after-sheet-admiral_open_bare.png (phase two openings).
- Powder Monkey in the real page (6x): flotilla4art-before-monkey-{idle,holdLit,lightTell,lob,flee}.png and flotilla4art-after-monkey-*.png (the level's sign banner overlays the top of each frame). Sheets: flotilla4art-after-sheet-monkey_poses.png, flotilla4art-after-sheet-grenade.png.
- NOT captured: the Admiral live in the arena (the arena camera in manual stepping sits above the deck and I could not frame him; the sheets are the same draw calls). Needs a playtest look.

## QUESTIONS FOR DANIEL (rec first; built)
1. Admiral: he already had a full hand-drawn model; I made the plates readable and the openings alive rather than redrawing him. If he still looks wrong live, what is it - the coat colour, the size, or the plates' colour? Rec: tell me after a fight; built as above.
2. Wire the monkey's drawn "dead" pose into the corpse (main.js spawnCorpse)? Rec yes, in the next polish pass (main.js is merge-hot); built: drawn only.
3. Monkey on Siren Rocks / Stormwreck later? Rec later batch (unchanged from the greybox question).
