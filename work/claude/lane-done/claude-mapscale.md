# claude/mapscale - the world map at one pixel scale (art-direction fix 3)

Branch claude/mapscale off claude/fontpair. Shots: work/claude/mapscale/before-*.png and after-*.png (all 46 nodes, 4x of the 320x180 buffer; tools/mapscale-shots.mjs).

## What changed
- ONE SCALE DECISION: the map is drawn on the 320x180 buffer shown at 4x; the hero, hut, signs, text and terrain were already 1 buffer px per art px. The mismatches were fractional/anti-aliased things, now all whole pixels: landmark critters (Queen, owl, Goblin Queen, ram, frog, chief, Mother Cap, King) were boss sprites at 0.42-0.75 scale with 0.45 alpha ghosting -> shrunk by a WHOLE factor with a block-vote downsample + outline (src/map-pixel.js blockVote), cleared = dimmed not see-through; castle likewise. Node rims, selection ring, glows, medal dots, header medal: hard rasters (fillDisc/strokeRing) instead of ctx.arc; leader lines dotted by pixel; hare/gull drawn 1:1, fish not rotated.
- Clouds: alpha ellipses -> hard pixel clouds (rim solid, body ordered checker), shadows the same, 2px steps (no shimmer). Map bakes: smooth vignette/seam gradients -> ordered 4x4 Bayer dither; random snow speckle -> ordered; fog banks -> checker.
- Labels: one style (opaque wood board, 1px ink, green when selected, no article: "THE GLASS SEA" -> "GLASS SEA"). Layout (src/map-plates.js): first-free-side, then collision pass with cost (own node/sign, other nodes, signposts, landmark boxes), then a solved table src/map-plate-spots.js (seeded annealing that also keeps every info card clear; tools/map-plates-solve.mjs, ~8 min, rerun when a node is added/moved). Node coordinate tables untouched.
- Info card: 218x58 -> 208x54 (30%), placePanel now minimises the OTHER boards it lies over (cost), blurb is ONE whole line (src/map-blurbs.js shortens 7 blurbs; no more paged/cut sentences). Region banner no longer prints under a top-docked card (fixed a textfit COLLIDE).
- New lint tools/map-scale.mjs (static no-arc/rotate/gradient/fractional-scale scan, board clearance, landmark boxes, blurb widths, card height).

## Checks (alone, port 8783)
map-grammar, map-spacing, class-spurs, level-reach, modulepreload, dangling-paths, fonts, map-footer, map-scale: green. textfit hints,mapcard,menu,hud: green after the banner fix (mapcard re-run alone green; others green before it). No full suite run.

## Update (Daniel 10-09 answers)
- Boards are ONE LINE (name only); the medal/silver/quest strip is gone from the map, it lives on the selected node's info card. Table re-solved (tools/map-plates-solve.mjs). KNOWN RESIDUAL list ratcheted to ONE: Undercrown's board touches the Highcrown castle art (the castle stands on that node). Stormhold/Sporewood residuals are gone.
- "THE" dropped on map boards only; the info card, level intro cards and lists keep the full name. 1 buffer px per art px accepted.
- Checks alone: map-scale, map-grammar, map-spacing, class-spurs, level-reach, map-footer green; textfit hints,menu,hud,mapcard green (COLLIDE 0).
- Still true: cards lie over ~122 non-neighbour boards total (worst 7); compass overlaps right-edge boards; roads not avoided; postcard thumbnail; first frame black is TITLE-SCENE's.
