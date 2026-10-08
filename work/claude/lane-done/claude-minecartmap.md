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
