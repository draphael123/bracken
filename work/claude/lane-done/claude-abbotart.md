# ABBOT ART lane (Sonnet, 11-05, code-only) - the False Abbot's building + poses (claude/falseabbot)
Merged claude/monastery3-1105 (b5263fabf) into claude/falseabbot first (clean, no conflicts). No browser opened; nothing merged to master or deployed; tools/check.mjs not run.
New: src/redraw/abbot_chapel_art.js (rect pixels only, rendered in Node by tools/abbot-art.mjs: 40 ok). Data: house.art in src/abbot-chapel.js (tiles). Hooks: main.js (import + 2 gated calls beside M3ART's), false-abbot.js (import, pealRing, kindleFlare, abbotFrame poses).
## Drawn
- WEST FRONT: a gable of dressed ashlar raking up to the bell-cote (baked once), string-course mouldings at each ledge row, 10 blind lancets, rain streaks, drip-wash under each ledge, moss; corbel caps + stepped brackets on every ledge; the buttress's two weathered set-offs; the SILL's moulded cill + dentils; two bronze bells in the bell-cote frames (swinging a hair); the aisle's lead roof (rolls, patches, birds' marks).
- BELFRY: roof truss (3 tie-beams, king-posts, raking braces) = the beam ring the peal runs under; soot tongues + scorch pads at all four braziers; the HOLE when the floor is gone: broken lips, snapped joists, a light shaft, sifting dust (whole: hairline cracks only).
- CHAPEL: two stone piers (corbelled capitals, drum joints, plinths), the rood's carved fascia + scalloped maroon valance, 3 pews, the altar (stone table, maroon frontal, gilt triptych, a goblin's red hand daubed on the saint, candles, cup); the rubble steps as broken slabs.
- ABBOT POSES (frames 23-26, only when MON3 bakes them; flag off stays 23 frames, tool proves frames 0-22 unchanged): PEAL TELL (pot wound back, bronze gleam), PEAL (swung through, bronze rings), CALL (arms flung wide, mouth open, gold lines to the pews), FLOOR GOES (fists planted, cracks, grit).
- FX: peal ring is a bronze wall on the boards (was red/gold ellipses); the brazier CATCHES in his rite tell (flare, tongues, sparks).
- Removed greybox decos that drew nothing or doubled: pew x3, shrine, candelabra (pews/altar are drawn by the art now).
## Checks (pure node, MON3=1)
abbot-art 40 ok; false-abbot3 all pass; false-abbot (old) all pass; false-abbot-art ok; mon3-art 23 ok; anchor-lint ok; architecture ok; level-quality spire ok; checkpoint-gaps all 53 levels pass.
## SHOTS OWED for a proof lane (?mon3=1; 1 and 4 seats)
1. West front at game size: wall face vs the monkArch cote facade seam (x41/42 at rows 5-13; the wall is cut there), corbel caps vs the SOLID tile art (cap overlaps the tile top by 1-2 px), bracket depth, lancets, the buttress offsets vs tile joints, bells vs the deco bellFrame posts (bell crown at frame top; guessed from the deco anchor), leads strip on the slab top.
2. The wall stands over the old background: check no old crag/cloud art peeks through the gable; the rake's top vs the sky.
3. Belfry: truss over the monkTower interior art (does it clash with its own rafters?), brazier soot tongues, hole + light shaft + lips in the fallen state, rubble slabs over the ONEWAY board tile (cover is from Y-3).
4. Chapel: piers/rood/pew heights vs the chapel interior art + hero heights; rood fascia is placed 4 px under the board top (real board thickness unverified); altar vs the gate + great-bell rope (x92); pew step.
5. Poses at game size: peal tell vs knell, peal rings width in the 80 px frame, call, floor-goes; peal ring on a bridge board vs the ground; brazier catch flare timing.
## QUESTIONS (rec first, built as rec)
1. The wall face is opaque stone over the whole climb width (x16-47). Rec: keep. Alternative: a sky/crag gap, i.e. a free-standing buttress tower.
2. Frames 23-26 are 4 more 80x66 frames only under MON3. Rec: keep (no cost with the flag off).
3. Bell-cote bells ring only visually; the sill bell (tbell) is its own prop. Rec: leave.
4. Altar sits flush to the gate side; rec: fine, the red hand daub is a Goblin-priest nod. Say if you want it clean.
