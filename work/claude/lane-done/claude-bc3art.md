# claude/bc3art - BURIED CITY 3 ART PASS (Sonnet, 2026-10-12) - base claude/bc3tune 8dabf422

ART ONLY: geometry, collision, timings and the level are untouched - LEVEL HASH UNCHANGED (tools/level-quality levelHash buriedcity = 9139d6b8a07b on both bc3tune and this branch).
Only frame NUMBERS moved (the construct's sweep now shows frames 6/7; the king has 26 frames) - no number in src/hourglass-king.js / construct.js timing changed.

## Drawn (new: src/redraw/buried_city_flip_art.js; cast poses in buried_city_cast.js)
1. THE SMALL HOURGLASSES: brass plinth, turned posts, two glass bulbs, live sand, a 10-cell GAUGE built into the right post (red + ticking in the last 2 s), idle/run glow, a real TURN-OVER (half-turn on a strike, sand thrown), grains lifting while it runs; the gauge over your head is a brass glass-icon + bar.
2. FLIP FX: risers (buried house top / glazed dome sliding up out of the sand, sand streaming off it, the sunk parapet tip, chalk ghost + rising arrows while you are by its glass, the warn shake + red tint + pour; the sinker goes the same way), the bank running out grain by grain, the dune fall DOWN (heavy ochre curtain, streaks, spray) vs UP (pale, rising grains, glow at the lip, gold chevrons).
3. THE SAND SEA: three ripple bands, whirls, a lit crest, blown dust; the lethal one darker with bones, skulls and a reaching hand; the buried buildings' walls (bcBuried) are plaster courses with a window and beam ends going down into the dark.
4. THE ROOFTOPS: the far buried city on the horizon (domes, minaret stubs, hazed, parallax 0.12) under the tower landmark; the 4 awnings as real striped cloth on poles; the courtyard's collapsed dome shell (stone ribs, glazed tile, hanging fragments, light shafts); dressing on the dunes/roofs (amphora, column stump, pots, cairn, washing line); sandstone ledges read as before (the city's balcony/lintel kit).
5. THE GREAT HOURGLASS (landmark scale kept): brass frame on pivot axles, gear crown, big glass, locked behind iron bars until phase three, a real half turn when struck, the column pouring UP to the roof with a gale of grains, a 14-cell gauge on its plinth.
6. THE NEW ELITE: THE SUNDIAL WARDEN (courtyard elite, swift): gilded construct, a sundial face, a red sash, speed-marks; ALSO the construct's sweep now has its own tell (6) and release (7) frames (it shared the poke's).
7. THE KING (B16, every ability its OWN windup + release, replacing greybox 14-19): 14 SURGE TELL, 15 SURGE SLAM, 16 GRASP TELL, 20 GRASP RELEASE, 17 RAIN TELL, 21 RAIN RELEASE, 18 SLIP TELL, 19 SLIP STRIKE, 8 SLIP RECOVER, 22 HOUR TELL, 23 HOUR RELEASE (+24 TIDE CALL, 25 DRAGGED INTO THE FLOW in phase three's opening). FX: the surge wave with a curl and foam, glass rain (cracks in the roof over each mark, shards), the grasp's sand hands + the held hero's sand, the violet echo, the tide warning swell + the rolling drift, the sandstone blocks, phase three's pours.
8. THE SUN TINT (Q3): the drain's "swim" overlay is now a warm edge vignette in this level (src/main.js drawCaravanHud) instead of an orange wash over the picture; the DRAIN ITSELF is untouched; rooftop tiles' golden light capped.

## Checks (PORT 8876, one at a time)
buried-city 278 green (one stated test update: B16 now asserts 26 frames incl. releases) | drawn-solids ok | pixels (headless floats) ok | corpses ok | tells ok | boss-read ok | mark-integrity ok (even the undeadmage phantom did not show) | modulepreload ok (7 unlisted, budget 15) | mobile-perf ok (generic scenes, alone). Logs: scratch/bc3art-logs/.
NOT RUN: boss rates (art only; numbers untouched), textfit (no new text).

## Polish scorecard (scratch/brief-polish.md): GRADE B (ships)
Identity /18 ~17: KIT 2 PAL 2 PLAT 2 LMK 2 SET 2 DRESS 2 LIGHT 2 AMB 1 THEME 2. Rule readable (hourglass = a drawn glass with a gauge you turn; the flip's states are all drawn, A3). B16 met for the king + the elite. Held back from an A: the dunes between the rooftops are still large plain sand slabs; the ambient bed is the city's; I did not eyeball every flip state in motion (the riser mid-rise, sinker, bank and the courtyard shell were drawn but only the stair glass, UP-fall start, sea, awning, skyline, dressing, the king's poses and great glass were looked at in shots).

## Pictures
work/claude/shots/bc3art/contact-sheet.png (12 views), king-sheet.png (17 king states), cast-king0.png / cast-constructelite.png (every frame). Tools: tools/bc3art-king-shots.mjs, bc3art-sheet.mjs.

## QUESTIONS FOR DANIEL (rec first = built)
1. Dunes on the rooftops are plain sand slabs with props. Rec: ship; alt: a follow-up pass to carve rooftop terraces (geometry - not this lane).
2. Fight moves now each have two poses; the King's tide-call pose (24) plays while the tide warns. Rec: keep.
