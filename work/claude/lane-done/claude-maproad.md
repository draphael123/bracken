# claude/maproad - the road after THE PALISADE WOOD (Daniel 11-01)

## Cause
Two things on the wood sheet (src/main.js world map, src/art.js bakeMap):
1. The road leg that carries the wood sheet off toward the crags (first sheet connector) still started at [40,64], the OLD Kingswood spot. Kingswood now
   sits at [141,24] (end of WOOD_PATH), so the road from KINGSWOOD on to the crags' door was never baked - only the dark dotted "road not yet
   walked" overlay (which follows PATH) showed it, plus an orphan stub at x=40. 
2. The fallen-leaf heaps drawn round Kingswood are painted AFTER the road, and since UNDERLEAF/PALISADE put the road through that corner they buried
   the Underleaf -> Palisade -> Kingswood stretch under red dither.

## Fix
- src/main.js: the seam connectors are now a named const MAP_CONNECTORS; first leg is [141,24]->[40,200+CRAG_Y] (Kingswood -> crag door).
- src/art.js: Kingswood's heaps skip any spot within radius+5px of the road (rnd draws unchanged, so nothing else on the sheet moves).
- Burning Village node untouched (compatible with claude/smallfix7).
- NEW tools/map-roads.mjs (no page; vm slice like map-grammar; in tools/check.mjs list after map-grammar): every main-road level node whose gate is a
  main-road node must be joined by painted road (path segments + MAP_CONNECTORS), and no painted end may dangle. Verified RED on the old connector
  ("kings -> scree: no painted road joins them"), GREEN now (47 legs).

## Sweep
All 47 gate->level road legs in the needs chain (wood, crag, coast, inland, desert; seams included) are painted; the only gap was Kingswood -> crags.
Spurs/stores are excluded by design (dashed stub / own room). Locked/dotted styling is the existing overlay, unchanged.

## Stills (scratch\lane-reports\maproad\, copied to work/claude/maproad/)
before-store.png / after-store.png (all cleared through Palisade; road covered by heaps vs. visible; Kingswood->west road new).

## Checks
map-roads PASS (red on old), map-grammar PASS; see below for map-forks / class-spurs / title-region / map-spacing / map-scale.
Results: map-roads PASS; map-grammar PASS; map-spacing ok (56 nodes); map-forks all green; class-spurs ok. title-region: first run crashed on a CDP websocket error under RAM contention,
rerun passed forest/marsh/fungus before my 100s cap (it draws title scenes, not the world map); map-scale produced no output (same crash) - NOT confirmed, rerun in the suite.
## QUESTIONS FOR DANIEL
None. (The Kingswood -> crags leg is baked in the seam's stone style like every other sheet seam.)
