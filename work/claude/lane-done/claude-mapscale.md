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

## Reds / residuals
- map-scale carries a frozen KNOWN RESIDUAL list: Stormhold's board sits on its own node/signpost, Sporewood's on its own signpost, 3 boards touch a landmark critter - the crowded corner leaves no spot while the card also stays clear. Shrinking the card further or allowing a stripless one-line board there would fix it.
- Info cards still lie over ~171 non-neighbour boards in total (worst 8): only road neighbours + the node are guaranteed clear. The fixed compass still overlaps boards at the right edge (not touched).
- Board paths over roads not avoided (roads are not in the layout).
- Info-card thumbnail is still the postcard (not a real level thumbnail); map first-frame black left to TITLE-SCENE.

## QUESTIONS FOR DANIEL
1. "Hero 2x": built as everything on the map at 1 buffer px per art px (the hero already was); making hero/nodes literally 2x would break node spacing. OK? (rec: yes)
2. Drop the medal/silver/quest strip from non-selected boards (one-line boards would clear the residuals and most card overlaps)? Built: kept strips.
3. Plate names lose "THE" - fine?
