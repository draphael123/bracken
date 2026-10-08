# claude-minecartmap (Sonnet 5.5) - THE DEEP RAILS map node

## Done
- src/main.js CRAG_NODES: `minecart` moved (214,96,'left') -> (238,20,'left'). ONE node moved; no other node, path, or plate side touched.
- Before: map-grammar failed (spur 28.4px off its junction, band 4-25) and map-spacing had 7 offences (GALE MOOR / THE SKY ROAD / HIGH STORE plates and the info panel all colliding with the DEEP RAILS plate).
- After: tools/map-grammar.mjs ok, tools/map-spacing.mjs ok (44 nodes), additional-areas ok, map-footer ok, dangling-paths ok, homepaths ok, crown-route ok; tools/map-shots.mjs crag-top viewed (plate clear).
- Why there: an exhaustive in-process search (minecart on a 3-5px grid x 4 plate sides x plate sides of oreroad/skyroad/moor, then also moving moor / skyroad / storm / oreroad by up to +-18px, then simulated annealing over all five) found NO layout near the Ore Road: the right tail of the crag sheet (GALE MOOR, SKY ROAD, ORE ROAD, STORMHOLD, HIGHCROWN) is too dense for a 94px-wide plate within the 25px spur band. The only single-node fix that passes everything is the top edge, 22.8px from HIGHCROWN's road vertex.

## QUESTIONS FOR DANIEL
1. The spur now reads as hanging off HIGHCROWN (nearest road point), though it unlocks off THE ORE ROAD (`needs: 'oreroad'` unchanged). Rec/built: accept. Proper alternative: a bigger relayout of the crag tail (move SKY ROAD/ORE ROAD/STORMHOLD down-left into the empty bottom-right) or give THE DEEP RAILS a short plate label ("DEEP RAILS"). Say the word and a lane will do it.

## Not done (no time: the search ate it; the PC was starved by other suites)
- HUD speedometer for the cart; art replacement for the greybox cave-in rubble. Both still open.
- Note: no full suite run; only the map-related checks above.

## MINECARTMAP2 (Sonnet 5.5, 2026-10-08) - the bigger relayout: NO PASSING LAYOUT FOUND, nothing changed
- Brief: move SKY ROAD / ORE ROAD / STORMHOLD down-left into the empty bottom-right so THE DEEP RAILS hangs off the Ore Road. Searched in-process (real layoutPlates + the grammar spur/crossing/margin rules + the info-panel check; ~15k candidates over node positions, all 7 plate sides incl. leftup/rightup/farbelow, plus annealing, plus 'DEEP RAILS' short label, plus Burning Village plate side variants). Zero layouts pass map-grammar + map-spacing.
- Why the bottom-right is not actually empty (all measured, crag-sheet coords):
  1. THE BURNING VILLAGE (the WOOD sheet's top node, directly under the crag sheet's bottom edge) has its plate fall back to 'above', which lands at x190-314, y149-166 in crag coords. Anything whose plate reaches y>=147 fails. That removes the bottom ~35px of the sheet. Changing its plate side does not move that fallback.
  2. GALE MOOR's plate (right, x194-258, y89-106) must stay free or it flips to the left and hits HIGH STORE / MONASTERY. Any road node with x<268 and y 83-126 breaks it.
  3. That leaves a band y108-147 for three plates (82 + 82 + 94 wide, 17 tall) plus a spur within 25px of the Ore Road vertex and >1.15x nearer than the next vertex. Best anneal results always had 1-3 plate overlaps (oreroad/minecart/skyroad).
- Short plate ('DEEP RAILS', 70px) did not rescue it either (same band problem), so no label override was added.
- State left as the previous lane had it: minecart spur at (238,20) off HIGHCROWN's vertex, all map checks green (unchanged, no commit of code).
- Not done: cart HUD speedometer, greybox rubble art (the search ate the lane).

## QUESTIONS FOR DANIEL
1. To get the spur honestly off the Ore Road one of these is needed (each a small change, none done): (a) move THE BURNING VILLAGE's spur node/plate (wood sheet) so its fallback plate leaves the crag bottom - frees y147-175; (b) move GALE MOOR / HIGH STORE a little; (c) loosen map-spacing for this one pair. Rec: (a). Say go and a lane does it.
2. Meanwhile, accept the Highcrown-adjacent node, or relabel the unlock text ("opens from THE ORE ROAD") on the plate/info panel so it is not misleading? Rec: add the text in the info panel.

## MINECARTMAP3 (Sonnet 5.5, 2026-10-08) - DONE: THE DEEP RAILS now hangs off THE ORE ROAD
- (a) The Burning Village's plate fell back to 'above' because every other side hit Sporewood's box or the Stockade's. Its spur node moved (254,8) -> (304,38) wood sheet, plate 'above': it is now a 18px spur off THE STOCKADE itself (the thing that unlocks it, 'beat THE STOCKADE in 5:00'), its plate sits on the wood sheet's top edge (whole-map y 719-736), and the crag sheet's bottom band y147-175 is free. Sporewood's plate moved to a free side as a result. Commit 96f9497c.
- (b) Crag tail relaid (CRAG_NODES + CRAG_PATH, coordinates crag-sheet): GALE MOOR (190,77)->(191,90) plate below->above (auto), THE SKY ROAD (268,108)->(268,140) plate below, THE ORE ROAD (232,74)->(281,103) plate rightup, STORMHOLD plate below->leftup, THE DEEP RAILS (238,20)->(258,103) plate left, a 23px spur off the Ore Road vertex. Road order unchanged (moor, skyroad, oreroad, storm, crown), still one S climb. Found by an in-process annealing search (real layoutPlates + grammar spur/crossing/margin rules + info panel), then hand-checked against the map-shots images (after2-crag-*.png in work/claude/minecartmap3). Search time overran the 10-minute cap (about 25 min across 5 scripts: it kept finding layouts with a plate ambiguously next to another node; the last one, skyroad at y140, is the readable one).
- Checks (alone, each read pass/fail): map-grammar PASS, map-spacing PASS (44 nodes), additional-areas PASS, additional-areas-runtime PASS, map-footer PASS, dangling-paths PASS, homepaths PASS, crown-route PASS, class-spurs PASS, tools/minecart.mjs PASS (185 checks). tools/level-reach.mjs DOES NOT EXIST on this branch (the commits that add it are on other branches), so it was not run. No check loosened.
- The tip/flow of the Burning Village is untouched (src/level.js opensOn unchanged; class-spurs proves the spur walks, shuts and opens).
- Eyeballed: crag-mid/top/ore/sky/minecart sheets and the wood sheet (burning/stockade/spore). Honest note: the Deep Rails plate (under-left of its node) ends 6px from the Sky Road's node; the stub from the Deep Rails node to the Ore Road reads clearly, the plate is directly under its own node, but a reader can glance at the Sky Road node first. A shorter plate label or one more px of room would fix it; no check complains.
- ART: the cart HUD speedometer is now MCA.speedo (src/redraw/minecart_art.js): iron half-dial on a bracket, brass ring, ticks (cruise tick pale, boost tick gold), copper needle on a rivet, lamp that burns amber on boost and blue when slowed. The cave-in's crumbling low line is MCA.crumble: snapped sleepers, slumped cracked rail, rubble heaps with lit tops and ore flecks, rock falling with dust streaks, grit and a copper gleam (the greybox raw rects are gone; 'GOING' text kept). tools/minecartmap3-shots.mjs makes the zoomed pictures (work/claude/minecart-art/mm3). Not done: the speedometer needle under a live ride was only seen at v=0 (the shot script could not hold the cart's speed), the dial reads fine at rest.

## QUESTIONS FOR DANIEL
1. The Burning Village moved from the road between Stockade and Sporewood to a stub on the Stockade itself (rec/built). If you want it back between them, Sporewood's plate must go below and a short label is needed.
2. The Deep Rails plate sits near the Sky Road node (see note above). Rec: accept; alt: label 'DEEP RAILS'.
