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
