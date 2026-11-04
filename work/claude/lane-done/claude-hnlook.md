# claude/hnlook - the Hornet's Nest "looks weird when you move" (Daniel 11-03 photo)

Spot: THE SAGGING GALLERY sump (cols ~177-205, floor row 44): paper pillars, capped-cell hive wall, the grey paper mass to the east.

## Cause (plain words)
The game's SHARED near layer - a lip of green leaves over the top of the screen (scrolls at 1.35x) and grass blades along the bottom (1.5x) - was still drawn over the paper nest. Everything else in the frame (pillars, hive wall, tiles) is world-anchored at 1.0x, so the green blobs slid across the wall and past the pillars faster than the world: "the area looks weird when you move". The pillars themselves are vertical in the game (the lean in the photo is the camera angle: the screen's own right edge is vertical in it, the floor and top edges tilt). The pillar/wall/floor/block layers all move exactly with the camera (tools/hnlook-shift.mjs); the leaf blobs were the only layer at a different speed.

## Fix (render only; no tile, physics, timing, damage, level-hash change)
src/main.js drawNear(): while the camera is inside the nest (cols 80..432) the shared leaf lip / grass fade out (they ease through the existing 0.12 ramp, back in at the mouth). The nest keeps its own near layer (paper flecks, far hornets, vignette). Outside the nest nothing changed.

## Evidence
scratch/lane-reports/hnlook/before-walk.gif, after-walk.gif (+ -still.png). Tools added: tools/hnlook-walk.mjs (walk + GIF), hnlook-scout.mjs (stills at columns), hnlook-shift.mjs (per-layer px/frame vs camera).

## Checks
hornets-nest.mjs 267 ok; hornetsnest-fog.mjs 15 green; demo-floats.mjs ok; render-layers ok; tile-chunks: hornetsnest 8/8 frames identical (the full default list crashed the headless page on marsh/storm/mage/waymeet - memory, none touch this change; kings/wood passed).

## Other spots / questions (recommendation built unless noted)
1. Outside the nest (pines, cols 0-79 and 433+) the shared leaf lip is still drawn on top of the nest's own boughs (HN drawNear) - two leaf layers at different speeds. Rec: drop the shared one in the whole level (one-line change, left alone: Daniel's complaint was inside). Say go.
2. The paper wall behind the pillars outside the hive-cell rooms scrolls at 0.78x (parallax) while the hive-cell rooms (Sump, Sap Well) are 1.0x: the hand-off at the room edge is visible as the pattern changing speed. Rec: leave (reads as depth); revisit only if Daniel still sees it.
