# ACT II TRANSITIONS - ART PASS (claude/act2trart, off claude/act2tr 0867e49d7) - 11-05
CODE-ONLY (no browser, no check.mjs). Not merged, not deployed. Art before live: this pass replaces the GREYBOX-PLUS gate recolours and the three greybox scenes. Only src/transitions-art.js changed (+ new tools/art-dump.mjs); no timing, table, main.js or level data touched.

## Art added
GATES (new KIT[kind] = rail / post / head drawers inside drawWayGate; each in its level's own materials, GATE_PAL kept so the kind lint still passes; the pine path is untouched):
- rope (hanging>spire, the Hanging Village): hemp-wrapped planks, rope coils on the posts, a pulley block + hemp lashings on the lintel, swinging rope ends.
- bell (spire>moor, Monastery): dark oak door leaves with bronze straps + rivets + ring-pull, stone jambs with bronze caps, stone lintel with a bronze bell.
- crumble (rows 5 rookery>skyroad, 9 storm>undercrown, 12 crown>longwater): rough grey blocks with cracks, chipped pillars, ragged rubble lintel.
- adit (oreroad>minecart): cribbing timbers, iron plates + rivets, ore dust, iron-banded mine props, cap timber with a mine lamp.
- arch (undercrown>kitchengate): moss-stained brick infill, dressed-stone jambs, voussoir lintel with a keystone.
- hatch (kitchengate>crown): vertical oak serving-door boards with brass hinge strap + pull, framed posts, lintel hung with a copper pan and ladle.
- Stone/hatch kits skip the pine iron straps/brace/rope-swing; rope keeps its rope ends.
SCENES (baked sprites, same maths and caption/skip/reduce paths):
- S1 daylight (minecart>storm): plated ore cart with rim, ore heap and spoked wheels; baked tunnel rock wall (strata, ore seams, drips) + timber sets (braces, iron straps, lamp hook) at two parallax speeds; dawn sky, cloud bars, far range with snow, STORMHOLD skyline (curtain wall, 4 towers, keep, gatehouse, lit windows, banners) that grows out of a soft haze band, Long Bridge span sprite, gorge cliff faces sliding past, trestle with cross-bracing, ballast.
- S2 drop (storm>undercrown): castle-underside masonry tile (courses, buttress, barred windows with flickering torch glow, wall brackets, stains), pale deck slabs that crack and fall as pieces, masonry piers, rubble sprites for loose stones/grit, layered storm sky.
- S3 descent (crown>longwater): Highcrown castle sprite (plum stone, crenels, conical-roofed towers, keep with torn crimson banner, lit windows, breach + portcullis teeth) on a baked mountain (lit face, strata, snow, gullies) with its own dark pines at the foot; cloud bars; paved stair landing tile (moss); a lashed-log raft sprite (end-grain, lashings, crate, rope coil, stern pole + lantern); sun path and gulls on the sea stage; bank rocks.
- drawArrivalRaft now uses the same raft sprite (the Long Water's first bank).

## Tools / lints
- NEW tools/art-dump.mjs: software raster (stub canvas, no browser) writing PNG stills of every gate kit (shut/open) and the scenes at chosen beats + the raft; also dry-runs every 1/20 of each scene x 1 and 4 seats x reduce on/off (no throw / NaN). Run: node tools/art-dump.mjs <dir> [gates|scenes|all]. Not wired into check.mjs.
- Ran and green: node --check (transitions-art, main), tools/demo-transitions.mjs 337/337 (incl. art kinds known, dialogue-free art, three scenes export + reduce + every seat), tools/transition-woodmarsh.mjs 31/31, tools/level-quality.mjs, anchor-lint, platforming-lint (levels untouched). SKIPPED (open a browser): textfit, goblin-lint (no new text; this pass writes none).
- Eyeballed through the software raster (my own stills): gates pine/rope/bell/adit/arch checked; S1 tunnel + out-in-dawn, S2 deck + underside, S3 mountain/raft/sea; crumble, hatch, cairn/ledge gate stills and S3 reduce not individually viewed.

## Browser stills OWED (later browser proof lane; one browser, >= 1500 MB free)
1. node tools/demo-transitions.mjs --browser --shots=<dir> --perf: the rendered gate for every row 1-5, 7, 9-11 (rope, bell, crumble, adit, arch, hatch + cairn/ledge at scree/moor) shut + open + dust, and S1/S2/S3 + raft arrival. PERF: first-frame BAKE cost of the new sprites (stormholdSky, highMountain 490x130 per-pixel, castleTile, rockWall) - the 4x CPU phone run must still be >= 40 fps and look at the first-frame hitch; if it hitches, prebake on the level load that precedes (call the sprite getters once) - not needed on desktop.
2. EYES: gate lintel/post alignment at widths w=1..5 (adit w5, crumble w2, rook), the hatch lintel pan vs rails, scene sprite scaling (nearest-neighbour Stormhold growth 0.4-1.0 and S3 mountain pull) for shimmer, S3 mountain/castle position at pull 0.3-0.6 (castle top vs screen top), mountain pines visibility, S2 piers vs wall contrast, the arrival raft vs the bank (stern pole dropped the old leaning pole).

## Questions (rec first)
Q1. Real kit art for cairn/ledge (scree, moor): kept the lane-A cairn (two stacked-stone cairns) - REC keep; Alt: add a wind-tied pennant to the moor ledge cairns.
Q2. S3 mountain is a stylised baked massif, not the map's PROP.castle: REC keep (matches the plum Goblin Queen castle in the level). Alt: swap to PROP.castle.
Q3. Prebake the scene sprites at level load to avoid a first-frame bake: REC wait for the --perf numbers.
