# claude/railsparallax - The Deep Rails background "looks weird in motion"

## Cause (src/redraw/minecart_backdrop.js drawBackdrop)
Measured with tools/railsparallax.mjs (draws the backdrop at cx, cx+1, ... and counts pixels changed per 1 px scroll):
1. ZONE POP (the main one, confirmed): the timber frames, lantern strings and goblin scaffolds were skipped by the CAMERA's zone
   (zoneOf of the screen centre). Crossing any of the 6 zone edges made a whole screenful of pillars/strings/scaffolds appear or vanish in one frame:
   the frame-to-frame change spiked 3.0-3.6x the median at every edge (edge171 3.15, 310 3.02, 472 3.56, 625 3.12, 900 1.98). After: 1.19-1.46.
2. SCAFFOLD WRAP (new find): the goblin-works scaffolds were wrapped `% 200` in y while 110 px tall on a 180 px screen: climbing/dropping, a scaffold teleported 200 px mid-screen.
3. DIAGONAL DRIFT (confirmed from code): far trestles moved x at 0.4 but y at 0.25; now both 0.4.
4. SUB-PIXEL: layers rounded their offsets separately (round(C - cx*k) vs the wall's round(cx*k), tie cases 1 px apart, and a fractional camera). Now one integer-snapped camera, every layer's offset is round(cx*k) subtracted from an integer.
(False attachment, suspect 3, not changed: it is a look call; see questions.)

## Fix (art/draw only, no geometry/numbers)
- An item's zone is the zone the camera is in when that item is at screen middle (`parZone`): frames, strings and scaffolds never appear/vanish on screen.
- Scaffolds repeat as a column 220 px apart (no wrap jump); trestle y parallax 0.4; one snapped camera (`O(k)`, `OY(k)`).
- tools/railsparallax.mjs (new, wired into tools/check.mjs): fails if any 1 px step changes >1.6x the median at an edge or climb. Optional tag arg writes strip PNGs.

## Checks (single, port 8959)
minecart 524 ok; minecart-aloft ok; level-quality minecart ok; frame-cost ok; railsparallax ok.
textfit: timed out at my 500 s cap (screens scanning, no failure seen; unrelated to a backdrop, run it in the suite).
mobile-perf: RED on wood (699 ms frame), welltown (35.5 fps, 617 ms), redgorge (39 fps) - none is the minecart; the box was loaded by a suite and another lane; minecart not flagged. Re-run in the suite.

## QUESTIONS FOR DANIEL
1. False attachment: the 0.7 background pillars sit right behind the deck's posts and still can read as holding the deck up. Rec: play it first; if still odd, darken/haze the frames a notch (not built).
2. Is the pillar drop-out at zone 3 (the lava cavern, none) acceptable as is? Rec: yes, they now simply scroll off instead of popping.
