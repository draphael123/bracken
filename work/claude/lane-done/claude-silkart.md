# silkart: art pass for THE SILK UNDERCROFT + THE CRYPT MOTHER (branch claude/silkart off claude/silk b2b607cb6; flag SILK_SHIPS stays false)
Status: READY (code-only, node-checked, NOT browser-seen). Not merged, not deployed.

## Drawn
- src/redraw/silk_art.js: tile kit (black cellar stone under silk drapes, silk-lined sides, drips under roofs, cocooned bodies in deep niches; STRAND = twisted silk rope shelf; the HIGH BRIDGE woven walk, slack when cut; TAUT WEB tight, 3 rails + mesh; STICKY WALL gummed sheet), backdrop (manor foundations with amber cellar grates, hanging silk sheets, silk net under pits), props (taut-web hum, knot + glint, cocoon + splat, sconce flame x3, torch in hand (gutters low), egg sac 3 pulse levels / burst / burned, goo, spitter glob, lurker thread incl. red told thread, wall burn), SPIDERLING (pale, green belly) and WEB-SPITTER (olive, yellow eyes, glob sac) as full 6-frame spider sets (hurt + corpse come free), THE SILK LURKER in 7 modes.
- src/redraw/crypt_mother_art.js: THE CRYPT MOTHER (skull-marked abdomen, fur, 8 eyes, jointed banded legs) - own pose for all 15 POSE modes (windups: spit = abdomen tipped up + spinneret, pounce = coiled + red hum, clutch = swelling green, sweep = leg cocked; release poses; fallen = pale belly + amber soft spot; lament), hit flash, anchor line, pounce shadow/thread, P2 strand flash, sweep tell.
- Wired: silk-hands.js / crypt-mother-hands.js draw through the art (greybox rects gone); main.js 3 tagged lines (import, skin bake only while skOn(), tile hook for L.silk).
## Checks (node only)
tools/silk-art-draw.mjs all ok (8020 cells tiled, 15 distinct poses); tools/silk-art-sheet.mjs -> scratch/lane-reports/silkart-sheet.png (6 real-level scenes + props + tiles + lurker + Mother); tools/silk.mjs all ok flag off+on; level-quality silk clears; architecture, comments, goblin-lint, audio-assets ok; main.js parses.
## Owed
- Browser stills: tile contrast under the 0.38 dark mask, web/tile read vs hitboxes, Mother size vs hitbox (30x20; art ~50 wide with legs), lurker scale, skins on the old spider's frame picker (anchor 7,9), torch-hole lighting.
- Not drawn: map node art/blurb, transition rows, bestiary cards (silklurker, cryptmother, skins), cellar-stair exit art, ambient bed/music (Daniel picks).
## Questions (rec = built)
1. Mother art stays at hitbox scale (no enlarge). Rec: keep; enlarge only with a hitbox change in the tune lane.
2. Silk net and foundations are screen-space backdrop. Rec: keep.
