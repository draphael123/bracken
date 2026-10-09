# claude/forestsupports - drawn supports for the forest/crag levels (2026-10-08)

Merged origin/claude/floatsweep first (solid-islands ratchet + island-posts), pushed.

## What shipped
- `src/forest-supports.js` (placement, called from `addIslandPosts`, so no level.js change) + `src/forest-supports-art.js` (drawing, dispatched from `drawRouteSupports` in src/route-art.js by `p.kind`).
  Every bare island (board run / rock slab / stone block) gets routeSupports entries: run ends (the centre for runs <= 3 wide, plus every 10 columns on long ones) down to the first tile under it (<= 16 rows), or a FREE end that tapers in the level's own manner when nothing is near.
- Kits: scree = stone pillars with corbels and strata (free end: stalactite); hanging = vine-wrapped boughs (free end: dangling vines); moor = bog-oak piles with heather; skyroad = banded cloud-stone pillars with a cloud puff at the foot/hem; rootway = gnarled roots with side roots; glasssea = faceted glass pedestals; witchlight = rune-stone pillars with violet marks.
- NO tile changes: routes, walker, pilot/mash rows untouched (levelHash does not include routeSupports, checked).
- ALLOW: scree 55, hanging 37, moor 25, skyroad 19, rootway 17, glasssea 29, witchlight 32 all lowered to 0 (entries removed). `node tools/solid-islands.mjs` passes. Nothing removed, no slab deleted.
- Not touched: wood/marsh/stockade/spore/kings (act-I remaster), spire/crown/ksar/hurricane/flotilla/oreroad.

## Checks (after merging origin/claude/batch80 a12b02f4+)
solid-islands, floaters, architecture, render-layers, frame-cost, level-quality ("every gated level clears the quality bar": the rootway/minecart stale rows were batch80's, fixed by its re-stamp that I merged) all green. levelHash does not include routeSupports, so no row needed re-stamping for this lane.
stuck: static OK; runtime has ONE red, rw-lean-2 (rootway 336,18: way arrow not handed a target) - IDENTICAL on a clean batch80 checkout (a998a005), so not this lane's; for the rootway lane.
Screenshots (headless, 8770): work/claude/forestsupports/<level>-N-x_y.png, six per level. Script: tools/forestsupports-shots.mjs.

## Notes
- Scree's 3 tall slab chains read as a pillar forest in places (high slabs over deep ground); accepted, it is what a support to the ground looks like. MAX ground distance is GROUND=16 in src/forest-supports.js if Daniel wants shorter (the remainder then ends in free tapers).
