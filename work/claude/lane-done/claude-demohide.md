# DEMOHIDE (Daniel 11-07: "the demo should HIDE the other levels on the level select")
Branch claude/demohide, worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-demohide, off master 95bc267a4. Code-only lane (no browser). Not merged, not deployed.

## What changed (all gated on DS.DEMO; flag off = identical behaviour)
src/main.js
- `demoOut(nd) = DS.DEMO && nd.y < WOOD_Y` (the demo map is the WOOD sheet alone: every node on the crag/coast/inland/desert sheets, levels AND their stores, is out). `nodeSecret` now starts with `demoOut(nd) ||`, so the existing "node you have not found" machinery hides them everywhere: no node disc, no plate, no tap box, not in the side panel list (mapPanelIdx), skipped by left/right steps and mapTap, no spur/tip, no fx (nodes/fog frontier/weather lists).
- The baked map: `MAP_BAKE_ALL = !DS.DEMO`; under DEMO only the wood sheet is baked and no seam connectors, so no road/path/pad leads to anything past Kingswood. The "dotted unwalked road" overlay stops at Kingswood (WOOD_PATH.length).
- `MAP_TOP = DS.DEMO ? WOOD_Y : 0`: the map camera cannot scroll above the wood sheet (4 clamp sites); the store/overlay backdrops that drew MAPC at 0,0 draw it at -MAP_TOP.
- Plate layout is built from the visible nodes only; the boss-portrait lookup (`nd(id)` in the map draw) skips hidden nodes.
- Counts: new `sliceLv = lv => !DS.demoLocked(lv)` used by the save-slot screen (X/Y WOODS, medals), the hero card "levels", the title "SAVE n  X/Y WOODS" line. (Map header LEVELS/MEDALS counters were already slice-only, smallfix14.)
- Caption: at Kingswood only (it no longer also shows on any shut node: none of the visible nodes is a "road continues" node now).
src/demo-end-config.js: MAP_CAPTION 'THE ROAD CONTINUES...' -> 'THE ROAD ENDS HERE... FOR NOW'.
tools/demo-cut.mjs: 5 new pins (demoOut, MAP_TOP, MAP_BAKE_ALL, dotted road, sliceLv), caption assertion updated, new HIDE section (every wood-sheet node is a slice level or a store; no slice level sits on a hidden sheet; nodeSecret starts with demoOut).

## Verified (node = C:\Program Files\nodejs\node.exe, free RAM 3.5 GB, no browser)
- node --check src/main.js src/demo-end-config.js tools/demo-cut.mjs: ok
- node tools/demo-cut.mjs: all green (18 pinned uses, HIDE: 12 wood nodes, 44 hidden)
- node tools/map-grammar.mjs, map-scale.mjs, map-spacing.mjs, additional-areas.mjs, map-roads.mjs (these vm-slice main.js between `const MAPW` and `const MAPC`; the new consts sit outside that slice): all pass
- node tools/gorm-unlock.mjs, under-order.mjs: pass
- NOT run: tools/check.mjs / the suite (per brief).

## Checked, not changed (listed, risky or not a level list)
- Level select: there is no separate list; the map + its LEVELS panel is it (drawSelect "CHOOSE YOUR WOOD" has no caller).
- Boss select was already slice-only (demoend). Boss Rush row is hidden under DEMO. Arena Yard is in the slice. Co-op/online pick the level from the map node: nothing extra to hide. The hero-pick and store were already trimmed.
- BESTIARY (FOES/BOSSES tabs): lists every foe/boss slot, unseen ones as "? ? ?" with no names, so it shows a count of more things to come but names nothing. Hiding them needs a foe->level map and changes the page counts; left. Rec: leave (a teaser) unless Daniel wants them gone.
- WHAT'S NEW: free-text entries that may name past-slice content; not filtered (text, not a level list). Rec: hide it under DEMO or trim at the itch build lane if it spoils.
- Medal/silver totals elsewhere (medalCount, silverTotal) count earned only, so a demo save cannot exceed the slice; unchanged.

## OWED
- Browser stills of the demo map at ?demo=1: (a) FRESH save, (b) a FULL-GAME save (Scree and beyond cleared, mapNodeId in the crags: expect it to open at Wood, nothing above Kingswood, panel 12 rows, header LEVELS x/12). Also: walk right at Kingswood (silent buzz), TAB panel (BOSSES >), store backdrop (wood sheet, not blank), touch tap above Kingswood (nothing). Flag-off map still shows the full world.
- The suite / tools/check.mjs nightly.

## Questions (recommendations, built)
1. Caption wording: built 'THE ROAD ENDS HERE... FOR NOW' (the world now visibly stops; 'CONTINUES' contradicted it). Alternatives: 'MORE ROAD IN THE FULL GAME', 'THE ROAD ENDS HERE - FOR NOW'. Rec: keep as built.
2. Pressing forward at Kingswood buzzes with no text (caption already shows there). Rec: leave.
3. Bestiary '? ? ?' rows and What's New: see above; rec leave bestiary, review What's New at the itch build.
