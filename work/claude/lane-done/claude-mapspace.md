# MAPSPACE lane (Sonnet): world-map nodes and name plates too close

## What was wrong
Plates are up to 154 px wide (6 px a letter + 10) and 17 px tall with the medal/silver/quest/relic strip, on a 320x180 sheet. The map's
own placement (greedy: below, left, right, above...) ran out of room on three sheets and fell back to drawing the plate on top of its
neighbours. Waymeet, the Fog Canal, the Theatre and the Harvest Fair sat 10 to 13 px apart.

## What changed
- src/map-plates.js (new): the plate placement as one pure function, shared by the game and the lint. A node can carry
  `plate: 'above' | 'below' | 'left' | 'right'`, the side tried first. drawMap in src/main.js now calls it once per frame (the old inline greedy
  loop is gone; same fallback order).
- tools/map-spacing.mjs (new, in tools/check.mjs): for every node, node box, plate rect (two-line worst case, every level cleared) at 1 map px = 1
  buffer px. Fails on: nodes under 16 px apart, node boxes overlapping, a plate with no free side, plate-plate / plate-node overlap, a plate more
  than 26 px from its node.
  Proof on the base (d12c0941): FAIL, 45 offences over 37 nodes. Offenders: Crags: scree/hanging, highstore/spire, moor/oreroad/storm,
  storm/crown, undercrown. Coast: lamplit, deep/keep/causeway, causeway/longwater. Inland: waymeet/canal (10 px), canal/theatre (13 px),
  theatre/fair (12.4 px), fields/witchlight, burial/witchlight/mage, unburied. Wood and Desert already passed.
- Relaid, same road ORDER, every node still in its own sheet, roads redrawn through the new coordinates (CRAG_PATH, COAST_PATH, INLAND_PATH), plate
  sides set where needed. Found by an offline search (work/claude/mapspace/solve.mjs) that also holds map-grammar's rules (no crossings, 24 px
  margins, spur band, seams fixed). Largest moves: Keep +22 x, Causeway -32 x, Theatre +30 x, Fair +34 x, Canal -22 y, Waymeet -12 x, Storm +16 y.
  Nothing moved across a sheet; the seam connectors are untouched.
- BK.mapLook(id) + tools/map-shots.mjs: capture hook (not in the suite).
- Captures: work/claude/mapspace/before-*.png and after-*.png (inland-low is Waymeet/Canal/Theatre/Fair/Fields; coast-mid; crag-mid).

## Checks (named, all green)
map-spacing (now incl. panel/header/footer), map-footer, map-grammar, additional-areas, additional-areas-runtime, architecture, dangling-paths (after committing the cited files). textfit has no map scope.

## ROUND 2 (Daniel approved the bend and the plates as is; the info panel and the footer)
- Info panel hid the Theatre and Fair plates (one showed only "THE"). Now src/map-plates.js placePanel picks, per node, a camera height (the node's
  screen height, 14 tries from 0.55 down to 0.9) and a panel spot (four corners first, then a sweep) so that the panel, the HUD bar and the footer strip cover no
  node box or board of the selected node or its road neighbours (or the node a spur hangs off). drawMap and updateMap use it (mapPanelFor): the camera eases to
  the chosen height when you stop. Every board is also now laid out once, in the worst case (two-line), so boards never shift with your progress.
- tools/map-spacing.mjs treats the panel (218x58, store 218x26), header (19) and footer (11) as BLOCKED rects for every node selected. Proof: on d52b8fd5's layout
  it FAILS, 9 offences (wood, marsh, scree, crown, longwater, burial, witchlight, mage, fallingtower). Fixed by relaying Wood, Crag, Coast and Inland a
  few pixels and re-choosing plate sides (solve.mjs now includes the panel rule; moves of up to ~30 px, order and sheets unchanged); map-grammar and additional-areas still green.
- Footer: "ARROWS MOVE  Z ENTER  TAB ALL LEVELS  X BEASTS" (about 264 px) ran into "F CO-OP OFF". Now "ARROWS  Z ENTER  TAB LEVELS  X BEASTS".
  New check tools/map-footer.mjs (in tools/check.mjs, own port slot) measures all four footer variants with the game's own textW and needs 8 px between labels
  (the intermediate wording, "TAB LEVELS" with MOVE kept, still overlapped by 6 px, so the check does catch it).
- Captures: work/claude/mapspace/after2-*.png (panel and footer clear).
- Known limit: the panel can still cover a node that is not a road neighbour (the Unburied Field's plate in after2-inland-low, a spur two stops away). Keeping
  EVERY node in view clear is not possible: the panel is 218x58 on a 320x180 screen.

## MERGE NOTE
The welltown branch (desert nodes, e.g. 206,146 and the caravan moved 4 px) and the redgorge branch add desert nodes: both must pass
`node tools/map-spacing.mjs` at merge. Expect a conflict-free merge of main.js only if they leave the INLAND/COAST/CRAG tables alone; the Desert sheet has
room (one node today). If a new node fails, give it a `plate:` side before moving it.

## UNVERIFIED
Played the map by eye in six captures only, not walked. The plate sizes assume the two-line strip on every level node.

## QUESTIONS FOR DANIEL (1 and 2 answered: keep the bend, plates as is)
3. Shrink the info panel (218 wide) so it can also clear far plates? Rec: only if you see another overlap; the road neighbours are covered now.
1. The Fog Canal now sits NORTH of Waymeet and the Theatre/Fair are back down-right of it (a hook). Rec: keep (the cluster was the problem; the hook is the
   price of 150 px plates). Alternative: shorten long names on the plate only ("THE MASKWRIGHT'S THEATRE" -> "THE THEATRE") and keep the old straighter road.
2. Plates are never smaller than their text. Rec: leave as is.
