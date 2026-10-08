# claude/floatsweep - floating geometry sweep (2026-10-08)

## What shipped
- `tools/solid-islands.mjs` (in `tools/check.mjs`, after floating-geometry): every ISLAND (4-connected non-air group not reaching the map edge; ropes join) must have a DRAWN support:
  routeSupports post, standing deco (stilt/bridgepost/pierPost/column/mastStump/...), scaffold/timber/treehouse ents, monk hangers, ropes/zip lines/cable bridges/hoists/bridge ents,
  structures/watchtowers/houses/hull+cabin+ship zones, minecart trestles/beams, fair rides, Hexed Fields trunks. A wall behind (facade / masonry / interior) carries the ROCK in it, never
  boards laid in front of it (the Monastery scaffold). `node tools/solid-islands.mjs [id ...]` prints the table / every island.
- ALLOW is a RATCHET: `id: [count, one-line reason]`; more bare islands than listed fails (new slab), fewer fails until the number is lowered (a fix must shrink it).
- `src/island-posts.js` (one 3-line hook at the end of src/level.js): for the BUILT levels in POST_LEVELS, every board run end (and every wall/tower stub hovering <= 6 rows) of an island gets a
  routeSupports post (the Marsh/Reef/Waymeet kit, drawn by src/route-art.js) down to the first thing under it (<= 16 rows; fields 24, lamplit 20). NO tile changes: route/walker/mash rows untouched
  (mash-gate, floaters, architecture, level-quality, bridge-props green; slopes + dressing fail identically on the base).
  Levels posted: storm underleaf lamplit deep causeway fields burning canal welltown redgorge underwell minecart fair caravan unburied mage fallingtower keep harbor undercrown.
  Screenshot-checked (headless): storm, burning, underleaf, lamplit, deep, caravan tower, redgorge, welltown, minecart, canal.

## The table (bare islands after the posts; every row allowed with a reason, see ALLOW)
natural kit (logs/caps/reeds/rock slabs of a natural place - screenshot-checked; the complaint is BUILT places): wood 25, marsh 14, stockade 25, spore 31, kings 103, scree 55, hanging 37, moor 25, skyroad 19, rootway 17, glasssea 29 (shards), witchlight 32 (floating stones are the level).
Small, listed for their lane: fair 4 (stage roofs/slides), mage 7 (library ledges high in the hall), undercrown 3 (pit ledges), canal 2, welltown 3, redgorge 1, fallingtower 1, minecart 1.
OWNED, TEMPORARY allowance (for those lanes - the fix is ONE WORD: add the level id to POST_LEVELS in src/island-posts.js, then lower the count in ALLOW; or hand-build hangers/posts):
- spire 90 bare (the M3/M4 planks in front of arches: the facade no longer counts as support); with POST_LEVELS it leaves 1: ONEWAY x5 @23-27,62. (M3's SOLID grass slabs are masonry-ruled, not in this table.)
- crown 53 (loose boards in the keep; leaves 1: ONEWAY x6 @660-665,44)
- ksar 25 (all board runs; opt-in leaves 0)
- hurricane 17 (the planks round the fallen mast, 60-70,11 / 232-262,11-16 ...; opt-in leaves 0 - but 20-row posts into dark water may read as scaffold: the lane may prefer lashings/rigging hangers)
- flotilla 2 (NET x38 @110-111,18-36; ONEWAY x4 @23-26,25), oreroad 11 (opt-in leaves 2: ONEWAY x3 @427-429,20; NET+ONEWAY x16 @283-294,29-33), longwater 0 bare.

## Reds / notes
- tools/slopes.mjs and tools/dressing.mjs fail on the base (pre-existing, not mine).
- PORT 8761 was occupied by another lane's stale serve.mjs (PID 31932, cwd bracken-survival2), so every page check used PORT=18761 with my own server (spawned and cleaned by cdp.mjs). I killed nothing of anyone else's.
- Probe/shot scripts: scratch/floatsweep-tools/, shots: scratch/floatsweep-shots/.

## QUESTIONS FOR DANIEL (rec first)
1. Forest/crag levels keep floating logs/slabs (NATURAL allowance, 400+ islands). Rec: keep (it is the genre grammar). Alt: a per-level "branch/trunk" support pass.
2. Auto-posts down to 16 rows read as scaffolding in tall voids (storm). Rec: accept; if too busy, lower MAX_DROP to 10 and the remainder moves to the ALLOW list.
