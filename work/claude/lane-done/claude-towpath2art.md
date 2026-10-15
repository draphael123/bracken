# claude/towpath2art - THE TOWPATH 2 + THE FOG KNIGHT 2: ART PASS (SONNET)
Base 0d033a17. Art only: no numbers, timers, boxes or placements; the grid is untouched (no level-hash change, no mash re-stamp). The palette moved to night (towpath.js palette/night flags).

## DRAWN
- Night: sky 'night', moon + stars, own backdrop (src/redraw/towpath_backdrop.js: Waymeet roofs to silhouette, willows, cottages, ruined arch, mist, reeds); tile kit (towpath_tiles.js: wet moonlit stone, turf banks, lock walls + weed lines, gates, timber, riveted iron trough, soot brick, ruined piers, old gate irons, mast ratlines).
- FOG BANK: pale skin over a bluer deepening body, swirls, bright rolling top edge + haze, drifting wisps, ends thin out (towpath-hands drawOver).
- Hut (room + stovepipe + sign), cottage, mill (loft, sack floor, hoist shaft + sheaves, sacks, lamp, millstones, cog, sack-door beam), hoist deck + ropes + winches, gantry rail, tower (room + beacon on the roof with a sweeping light), aqueduct (trough plate sagging through the break, torn edges, sluice posts, barge, trough water, cascade, gorge), six piers (capital, arch springers), basin far quay arches, sunken hulls + masts, crane (lattice mast, jib, chain, counterweight, hook, capstan), two warehouse fronts, net rack, last-lock floor timbers (glow only in light), arena bollards, lock gates/balance beams/gauges/punts/paddle gear/capstans/lamps/lantern/lychgate/church door/wheel/swing bridge/decor/keeper's armour.
- FOG WRAITH (src/redraw/fog_wraith_art.js): drift A/B (fog + hardened), smother windup + release, recoil, shielded recoil, 4-frame death, chill FX on the hero. Art-only state e.rel/e.shielded/e.recoil0 in fog-wraith.js.
- FOG KNIGHT (src/redraw/fog_knight_art.js): ~54 px figure, mist lower body; stances high/low/full; own windup+release for cut/lunge/lash/surge/spears/plunge (+plungeRec stuck), step, double (mist wash), empty, reel, sleep/wake, sink, death heap; chain+hook, water wall + gate crest, lances + told spots, plunge shadow.
- Tools: tools/towpath-art-shots.mjs (spots), tools/towpath-art-sheet.mjs (cast sheets). Shots in work/claude/towpath2art/.

## CHECKS (scoped, one page at a time)
GREEN: towpath.mjs 311, towpath-probe, corpses, hint-shown, mobile-perf (towpath: 60 fps, inside budget), textfit hints (0 issues; bestiary scope not separately confirmed), mark-integrity fog knight rows (cut/lash/lunge posed). RED: mark-integrity undeadmage|markTell PHANTOM (pre-existing flaky, reported by towpath2).

## SELF-GRADE: C+ / B- (honest - below the Crusader bar for the knight)
Level set pieces read well at night (B). Wraith good (B-). KNIGHT figure is muddy at game scale: stubby torso, tassets striped, sword hand placement rough, some poses (plunge, doubleTell) weak. Not yet at the Crusader bar; ship rule (>= B) NOT met for the knight. Not done: per-piece visual review of every shot (hut roof reads brick, mill wheel is huge, bestiary card unchecked), cast-poses gate not available.

## QUESTIONS FOR DANIEL
1. Knight needs a second art pass (an Opus/hand-tuned sprite sheet rather than procedural rects) before it ships: rec yes. Built: procedural.
2. Wheel radius (4 tiles) draws very large - kept as the level's geometry.
