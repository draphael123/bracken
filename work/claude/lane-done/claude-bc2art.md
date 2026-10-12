# claude/bc2art - BURIED CITY 2 ART PASS (Sonnet lane, 2026-10-11) - continues claude/buriedcity2 (6386cea7)

ART ONLY: geometry, collision, timings, the level hash are unchanged (level-quality CLEARS with identity rows untouched; no re-stamp needed).

## The art list (10 items) - all done
1. TILE KIT src/redraw/buried_city_tiles.js (hooked in main.js beside the Ksar's): sand roof (buried tiles, beam ends, ragged sifting underside), nine districts' masonry
   (stair ashlar, bazaar painted plaster, street clay, halls ashlar + brass inlay, sluice wet stone + brass plates, quarter tide-marked clay, throne street gilded frieze, throne room
   lapis), lit paving lips, every footing kind (balcony slab+dentils, awning cloth, brass pipe, stone beam, broken lintel, fluted drum, rotten) and the SOLID kinds (glazed dome drum,
   minaret, buried house with parapet), stakes, graded light (warm near lamps, gold in shafts, cold blue elsewhere). Structures (corbels, poles, brackets, rubble) in hands drawStructure.
2. BACKDROP src/redraw/buried_city_backdrop.js: baked seamless back wall, far arcade (banner, niche lamp), roof underside strip, THE HOURGLASS TOWER drawn live (brass frame, turning gear
   crown, glass, sand emptying with progress, falling thread, warm glow), dunes' lit silhouettes. main.js no longer paints the shared plank room under the city's rooms.
3. LIGHT src/redraw/buried_city_set.js: 4 shafts (layered slanted rays, motes, lit floor patch), 6 lamps (oil lamp / wall brazier, flame, sparks; also pushed as game lights), lever lamps.
4. SINKING STREET (src/redraw/buried_city_rule.js drawDeck): one baked set - cobbled slab, house fronts, minaret stub, squat dome; sand cascades while it moves; THE ARCH (voussoirs,
   gilt keystone, stair, down-chevron, lamp).
5. FALLS: roof crack, brass chute (ribs, pivot, stops, sand flowing down it), fall curtain + splash, grate, heap as a sand body; chute levers are brass cranks with an ARROW to where the fall lands.
6. SAND ROOMS: floor-gate housings with a running slot, trap floor (riveted plates / hinged void), roof holes with streams, great grille (opens by wheel turns), wheel with its turns pegged,
   gauge tubes with graduations, lever lamps green OPEN / amber SHUT, chain levers with a ring, clockwork vault door with five gear sockets.
7. KING'S APPROACH: head in the dune, three statues, painted mural, kneeling court (4 variants), Sealed Pyramid relief with a breathing teal scarab, stalls with goods, house fronts, domes, spire, torn canopy.
8. CAST src/redraw/buried_city_cast.js on the contract of the machines they replace (same frames, ax/ay, boxes): sand-drowned, sand-folk slinger, brass scorpion, clockwork construct (clock-face head,
   escapement window), own-skin corpses (tools/corpses.mjs now lists buriedcity: green).
9. THE KING: 14 keyframed poses x 3 glass levels (crown of gears, fan collar, mask, pauldrons, framed hourglass, pendulum sceptre), the cog, and a real THRONE (dais, arched back, gear crown, glass inset).
10. Stakes: iron-shod stakes in drifted sand and bone (the SPIKE tile; the hands' placeholder stakes removed).

## Checks (PORT 8847, sequential)
buried-city 221 green | solid-islands ok | modulepreload ok (14 unlisted, budget 15) | pixels (headless floats, 46 levels) ok | corpses ok (incl. buriedcity) | level-quality buriedcity CLEARS (pilot, mash 0/6, curve 233%/3 deaths).
mark-integrity: 1 phantom, undeadmage|poisonTell - not this lane. mobile-perf: FAILED on a redgorge 784 ms frame (budget 600) while the suite shares the PC; the city is not in its scene list.
Own measure (unthrottled headless): load 1.4 s; 5 ms a step in the street/bazaar, 8-9 ms in a shaft and the king room.
Shots: work/claude/shots/bc2art/ (one per section, sheet-all.png = all 25, state-*.png = the rule in motion, cast-*.png = every frame). Tools: tools/bc2art-shots.mjs, bc2art-states.mjs, bc2art-cast-sheet.mjs.

## Identity estimate: ~14/18 (was ~8). Held back by: foes are small sprites against a big set (no per-foe lighting), no bespoke music/ambience change (brief: unchanged), the quarter is mostly under its sand in the first look.

## QUESTIONS FOR DANIEL (rec first)
1. Ship the city now (art merged)? Rec: yes after your playtest of the shafts' sun overlay (the shared sun drain tints the whole screen red-orange in a shaft: looks heavy next to the new cold palette).
2. The king is 12 rows taller on his canvas (crown); hit box unchanged. Rec: keep.
3. The minaret stub is a 2x2 solid block (collision unchanged); it reads as a glazed stub, not a tower. Rec: keep, geometry is the design lane's.
