# claude/unbglitch lane report (2026-10-21)

## 1. THE UNBURIED FIELD "scrambled when you move"
- Root cause: `drawHeadstoneCairn` (src/redraw/unburied_siege.js) seeded its stones from `Math.round(l)`, the structure box's SCREEN x
  (main.js drawStructures passes `z.x0*TS - cx`). drawStructures runs every frame, so as the camera moved the cairn re-dealt its
  slabs, crosses and arches - the photo's tall column of cross/arch tiles up to the top of the screen (cairns at cols 102-105 and 154-155,
  rows 28-41, claude/unbfloat 10-12, commits 2a4fd76a / 8b681f09). `drawTrestle` had the same bug (seed + Math.round(l)), only a few px.
- Fix: both seeds now use world-stable values only (the column seed passed in, the box width/height).
- Check: tools/structure-stable.mjs (registered in tools/check.mjs list) draws every 'ub' footing kind at two camera offsets and requires
  identical pictures. Red on the old code (ubheads ~17k bytes differ, ubtrestle ~20), green after.
- Screens (work/tmp-unbglitch/): cairn-before/ and cairn-after/ (x96, x99), plus walks b2/ b3/ and the first pass before/. Photo reproduced
  at x96 (cairn column on the right edge of the frame). Other levels checked while moving: wood, fields (oth/); the other
  structure drawers (buried city, sealed pyramid, burial seam/pier) seed from nothing screen-relative (grepped).
- Not touched: the headstone cairn design itself (Daniel may still find a 13-row stack heavy; that is an art call).

## 2. Two pushable blocks side by side = soft-lock (photo 2: the bailey's mantlets)
- src/push-blocks.js: a pushed block now brings every grounded block touching it on the leading side (same row, gap <= 0.6 px, transitively)
  - the row moves together at PB.speed; a wall or a non-chain block in front of ANY of them stops the whole row (no overlap, no wedge,
  hero held at the edge as before). A lone block is a chain of one, so existing behaviour is unchanged.
- tools/push-blocks.mjs: new cases - touching pair pushed right and left (lockstep, flush), three-block chain against a wall (no overlap,
  none into the wall, hero not carried). All push-blocks checks pass.
- Not run: tools/unburied-bailey.mjs (browser, heavy) - the mantlet only differs by size (20x24) which chainOf handles via x/w edges.
  Riders standing on a chained neighbour are not carried by it (same as a pushed lone block today).
