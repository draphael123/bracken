# claude/kingswood2art - KINGSWOOD 2 ART (sonnet): THE KING'S HUNTING WOOD painted
Base claude/kingswood2 d3da9c06. PORT 8793. Art only: level hash 654536209a4d unchanged (tools/level-quality levelHash, before = after). Not merged, not deployed.
## DRAWN
- src/redraw/kingswood_tiles.js: flagstone court road (Royal Road, Procession), root-cobble hunt road (Stands), bark (Grove), basalt + gold inlay (Hall); masonry faces; hunters' deck boards (iron-strapped), bark-on boughs, carved hall timber; iron portcullis (spiked foot) for gates 109/199/410.
- src/redraw/kingswood_props.js: a BOUGH (bark limb into leaves) + iron PULLEY over EVERY rope; sagging rope; PEG = carved stake, iron collar, rope turned 3x, pennant, pulsing gold target frame while it holds; CAGE (iron hoops, crowned roof, padlock; landed = dented, door sprung, straw); LOG TRAP (bark, iron bands + spikes, lashings, ringed cut ends, bark turns while rolling); LOG SPAN (lashed bundle -> plank bridge with rope rails); SPLIT LOG (two halves tumble + chips); BANNER BEARERS (3 standards), DRUMMER (drum + sticks, ring on each beat); the court's SIDE GATE at 316 (leaves swing open as the court marches); court banners/pennants/hung cages/toll posts as deco skins (decoOf, main.js deco hook).
- src/redraw/kingswood_areas.js: a back wall per area, baked in 256px chunks: Royal Road (banner poles, lantern strings, milestones, checkpoint gate frame, gatehouse towers); Stands (hunting towers, bunting, stakes/nets/hay/spear rack); Grove (great trunks, cages on chains, wasp nests, bone chimes, canopy); Procession (red-oak colonnade, hung banners, lantern chains, court-gate piers + arch); Hall (carved panels, arched sunset windows, rafters, antlers).
- src/redraw/kingswood_oak.js: THE GREAT OAK repainted (52 leaf clumps, limbs, ridged trunk + roots, the King's door with light and steps, swaying cages/pennants, smoke). Alive now; L.oakBurn (0..1) is the half-burnt seam for phase 2 (nothing sets it yet).
- Sound: new synth bed 'court' (far two-note horn, far drum run, banner snaps, chain/cage creak, boots; no files). L.ambient: court 0-122, forest 122-306, court 306-416, fire hall. Registered in AMBIENT_NAMES/SOURCES/ambTarget.
- Hooks: kingswood-hands.js drawWorld rewritten (data/logic untouched except art state: goneT, turn, gate lerp, marcher roles), main.js (tile kit, deco, marcher overlay, areas call).
## CHECKS (PORT 8793)
- level hash unchanged; tools/kingswood2.mjs ok; tools/kingswood2-probe.mjs all green (0 page errors); ambient-landmarks ok; signs ok (1004, 2 lines); dressing ok.
- mobile-perf (4x CPU, 915x412 phone): kings 53.6 fps, p95 35 ms, worst 53 ms, busy 13.7 ms/frame - inside budget (>=40).
- visible-supports kings: 1 finding (SOLID @124-130,35, the Hunters' Hide roof: no DECLARED structure) - present on the base d3da9c06 too, report-only, level data.
- textfit (TEXTFIT_LEVELS=kings talk,hints,plates): OVERFLOW/OFFSCREEN/TRUNCATED 0; COVERS 1 + COLLIDE 2 on sign@4,40 "THE ROYAL ROAD" vs the TAP C / HOLD C prompt (greybox sign placement, not art). Unscoped levelcard skipped.
- ability-poses: not touched.
## PNGs (work/claude/lane-done/)
before (greybox) kingswood2-{start,teach,checkpoint,stands,stair,procession,hall}-after.png; after kingswood2art-{start,teach,checkpoint,stands,stair,procession,hall}-art.png (same spots).
## SELF-GRADE: B+ / 17 of 20 on the recipe's kit/sound/look items. The oak is partly hidden by trunks on some screens; boughs are visible only when the pulley is on screen (several pulleys sit above the camera).
## QUESTIONS FOR DANIEL
1. Ambient drum in the procession zone is far and soft but shares the 0.62s-ish march idea with the told procession drum. Rec (built): kept; alt: use forest there.
2. Pulleys above the camera show no bough on that screen (the rope runs off the top). Rec: leave (reads as canopy); alt: raise the camera on rope rows (level lane).
3. The sign at 4,40 collides with the control prompt (textfit); rec move it 2 tiles right in the level lane.
