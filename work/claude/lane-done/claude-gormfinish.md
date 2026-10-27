# gormfinish - KING GORM ART FINISH (claude/gormanim)

HEAD: see `git log -1` on origin/claude/gormanim (master bf7a452f BATCH123 merged in at 75837731; then 2 WIP commits + final). NOT merged, NOT deployed. Target: THU BATCH125 integ.
Files changed vs master: src/redraw/gorm_frames.js, src/redraw/gorm_poses.js, src/main.js (7 lines: portrait/debris re-point). No level file, no hitbox, no tuning, no AI: no restamp, no level hash change.

## What changed this lane
1. Floats pass (browser, Kingswood 'kings' level + hall + glade): tools/drawn-solids.mjs kings = every solid drawn, as loaded and after respawn; tools/visible-supports.mjs kings = 1 report-only finding: SOLID @124-130 row 35 (the underside of a dark masonry overhang attached to the wall on its left, over a pit near The Hunting Stands; seen in shots/kings-lip-1.png; it reads as a ceiling/wall lip, not a shelf in air). NOT fixed: fixing means moving level tiles = hash change, which Daniel ruled out. tools/floating-geometry.mjs kings = 67 groups, all ONEWAY boughs/decks (by design, left alone); tools/floaters.mjs ok. Hall + glade viewed in the real game (kings-arenas-*.png, kings-glade-1.png): cages/boughs/hive hang from ropes and posts, nothing solid floats. Nothing fixed because nothing real was found.
2. Gorm in motion (real game, headless, sequences x3 zoom): hall litter walk with bearers (hall-walk, hall-zoom), P2 walk (hall-p2-walk), sidestep/turn (hall-p2-sidestep), held -> walk (hall-held-walk), chargeTell -> charge with bearers running (hall-charge-flee), fleeTell (hall-flee-bearers), glade club walk (glade-walk) and glade sidestep (glade-sidestep-oak). Feet plant and lift on the six-frame cycle, the cycle is keyed by distance covered (7.5 px a frame) so there is no skating at walkV 44, walkV2 54 or the toOak 1.2x; turning on a side swap keeps the cycle; bearers step with the litter and run at the charge. No fix needed.
3. Accepted recs applied:
   - Bestiary + map portrait: SPR.kingCard = new seat2 'idle'/'wake' frames on the palanquin, cropped to the old 100x48 window with the old anchor (50,48) so the layout is unchanged (bestiary-king-before-1 / -after-1, map-kings-after).
   - Death debris: the king falls as the new standing model, 'downed' frame (gorm-death-debris.png).
   - Bearers keep for the whole P1 litter (as built before).
   - Bearers SCATTER when the litter breaks (phase-2 'rise', 1.3 s): they hold their places a beat, then run outward (12 px a frame run cycle) and fade (hall-litter-break.png). Draw-side only.

## Checks (node unless noted)
gorm2 ok, kingswood2 ok, tells ok, boss-read ok, level-quality ok (every gated level clears), floaters ok (3362 things, all set down); browser: gorm2-probe all green incl. 0 page errors (kings hall flee glade, death), drawn-solids kings ok, visible-supports kings 1 report-only (above). New reds: none. Pre-existing reds seen: none. Did NOT run tools/check.mjs (the 40-min suite), boss-rates, boss-read-audit, ability-poses.
No restamp / hash change: the diff touches no level source; mash-bot rows unaffected.

## Shots (work/claude/shots-gormfinish/)
contact-sheet-gormfinish.png (all of the below), hall-walk, hall-zoom, hall-p2-walk, hall-p2-sidestep, hall-held-walk, hall-charge-flee, hall-flee-bearers, hall-litter-break, glade-walk, glade-sidestep-oak, gorm-death-debris, bestiary-king-before-1 / -after-1 (+ -0..3), map-kings-after, kings-arenas-1/2 (hall), kings-glade-1, kings-lip-1, logs vs-kings.txt ds-kings.txt gorm2-probe.txt. Capture scripts: work/claude/gf-*.mjs.
PIDs: node tool processes only (they own and close their headless Chrome): work/claude/pids-gormfinish.txt. No browser left running; no process killed.

## QUESTIONS FOR DANIEL (rec built in)
1. The one visible-supports finding (kings SOLID @124-130,35, masonry overhang on The Hunting Stands side). Rec: leave; if you want it to read as held, an art-only pillar in the foreground structure layer (no grid change, no hash change) in the next kingswood art touch.
2. The bearers' crouch frame at the break start is the lifting stoop; if you'd rather they drop the poles with a clatter prop, small follow-up. Rec: leave.
3. Map portrait/bestiary shows the litter without bearers (as the old one). Rec: leave.
