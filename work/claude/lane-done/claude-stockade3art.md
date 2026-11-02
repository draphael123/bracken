# STOCKADE 3 ART (11-01) - lane report. Branch claude/stockade3art (f14aedc9) off claude/stockade3-1101 0fac882d. Not merged, not deployed.
## DRAWN (art only; no level/collision/number changes)
- src/redraw/stockade2_art.js: PEG (stone-footed log post, iron collar, cleat horns, rope made fast; cut = frayed tails), RAFTER BEAM (yard + broad hall one, iron straps, ring),
  GALLOWS JIB (gate pile: post, jib, knee brace, sheave, rope), LOG STAIR (lengthwise log on each step's top, end-on logs under, rope turn, chips), GATE WALK + gallows deck
  (plank tile over a stringer with end logs; lintel, braces, skull, two end posts with pennons), PINNED crew (boot/hand under a landed pile), CRUSHED logs over the Chieftain + dust fx, drawn '?' (replaces font glyph).
- src/redraw/queenchief.js: Chieftain frame 28 LURED (head back, pupils up, arm pointing at the rafters), frame 29 CRUSHED (sat, bowed, eyes shut, arms up, dust-grey). stockade-hands.js picks them; main.js tile hook now includes PLANK.
- stockade-hands.js drawTie/drawRamp/drawWorld/drawChief now call the art (drawing only; p.pinned is a draw field).
## CHECKS
- node --check on all four edited files OK. Stills (tools/stockade3art-shots.mjs; first pass in scratch/lane-reports/stockade3art-shots/after, before/ = greybox): stair, hall beam + peg, lured, crushed looked right; frame 28/29 were then reworked (hand moved off the face, log lifted off the head) and NOT re-shot.
- NOT RUN (BROWSER-HOLD, RAM <1 GB; one run crashed at 1.2 GB free): stockade2, chief3, stockade3, stockade-horns, textfit (stockade), pixels/art checks, mark-integrity (Chieftain); stills of gallows, gate walk, yard, pinned, and re-shot lured/crushed.
## LEFT
Run the checks above + `PORT=<p> node tools/stockade3art-shots.mjs` once the hold lifts; eyeball gate walk end posts vs coins at row 13 (posts sit at the ends only). Sign u40 vs stair landing not moved (art lane did not change level).
