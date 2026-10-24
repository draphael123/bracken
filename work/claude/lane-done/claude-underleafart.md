# claude/underleafart - UNDERLEAF 3 + THE GRANDMOTHER 3, ART PASS (Sonnet art lane, 2026-10-24)

Base `claude/underleaf3` 3e92e4cd. **Art only: the level hash is the greybox's `3d5dd5571299`** (tools/underleafart.mjs asserts it; level-quality prints the same). Not merged, not deployed.
Self-grade: **B-** (the places, the rule's machines and her sheet all read and are one palette; held back by the thorn-beast coat being a noisy 20x22 pelt, the Grandmother's body being a hooded cone, no new sound, and the hanging-racks platforming section only checked in stills).

## DRAWN
New modules `src/redraw/underleaf3_{pal,tiles,backdrop,world,dress,foes,gran}.js`; small hooks in `src/main.js` (tile kit, backdrop/near, deco, SPR bakes, seeds loop fire-jar, bestiary rows, corpse frame), `src/potion-hands.js` (draw calls delegate; shelf refill timer, coat fire, warm-up, her frame/lantern/bubble), `src/underleaf3.js` (non-hashed `reskin` table).
- **Palette**: earthy, not gaudy - root-brown soil, moss, rush-gold, candle-amber, ONE accent = her potion-light (witch green-gold: lantern jars, cauldron steam, glow-caps); her three jar colours are the only saturated things. Six places crossfade over 14 tiles: herb garden (sage-gold), drying lofts (straw), thorn hedges (bramble dusk), cauldron yard (soot + amber), her great leaf (deep green), her cottage (plaster room).
- **Tile kit**: soil with living lip, litter, roots, buried jar-shards/bones by area; rush drying boards on bone pegs (no timber); bramble stakes with bone thorns; twine ladders; **vine ladders and vine bridges** where a seed bed grows (the tile knows a vine from a rope); bramble hedge tiles.
- **Backdrop + landmark**: giant hanging leaves, stalks, leaf-thatch huts with candle windows and chimney smoke, drying lines; **her cottage** (plaster hut under the biggest leaf, jars on the eaves, cauldron smoking, bone chime) stands on the skyline from the yard on, centring as you reach her; the arena is her room (plaster wall, jar shelves, herb bundles, sconces). Near layer: dark leaves, hanging herbs / lantern jars, witch-motes.
- **The rule, drawn**: three jars (glass, cork, twine, colour, bone tag, soft glow at rest); shelves on bone legs with a colour wax seal that show an **EMPTY CRADLE with the colour's motes gathering and the jar fading back in** (refills); brewpots (iron pot over embers, brew in the colour, churns while refilling, a jar forming); seed beds (stone ring, seedling, seed glint; bloom + shimmer up the vine when grown); thorn hedges (glints, flame climbing, charred stumps + smoke after); float wells (mossy ring, rising motes, lift column); soap-bubble; green snare / red fire patches; her marks with a glyph (flame / jar in colour / gout); fireballs with tails; her hurled jars; the great cauldron (green calm, boiling red + spitting in phase two); bone-bordered area banners.
- **Dressing** (derived from the grid at load, not level data): herb tufts, fennel, clay jars, mushrooms, bones, briars, sheaves, ash heaps, glow-caps, rushes; herb bundles / bone charms / lantern jars hung under boards and ceilings. The level's sprinkled deco kinds are redrawn in her craft (hideRack = herb rack on bone poles, barrels = clay jars, fence = wattle and bone, idol = straw charm-doll, cauldron, boneChime, cookSpit = bone tripod, lootHeap = herb sacks).
- **People** (L.reskin, theme fit, same AIs/frames): HERB GATHERER (sprig), HERB THIEF, HERB WARDEN (leaf shield), JAR-THROWER (bandolier of jars; his thrown lantern is a drawn red fire-jar), LEAF ARCHER, **THORN-BEAST** (bramble pelt; `thornbare` sheet + flames/ash when a red jar burns the coat off), HER BROOD (little witch-hatted goblins). Each has a sheet (goblin's frame count, mirrored, white flash), a bestiary card, a corpse in its own skin. The Grandmother's bestiary text was rewritten for the new fight.
- **THE GRANDMOTHER 3** (`underleaf3_gran.js`): ~1.3x (56x62 vs 42x48), bent, hooded, hooked nose, eyes of potion-light, gnarled staff, witch-fire lantern (glows live), jars on her belt. **19 poses x 2 phases**, each move its own windup + release: sleep, wake, walk x2, staffTell/staff (cocked high / swung low with smear), fireballTell/cast (ball swelling in her palm / thrown), jarTell green|red (jar raised) / hurled green|red, broodTell (arms flung, calling) / kick (staff slammed, rings), stirTell/stir (the great ladle; phase two), ward (staff crossed, palm out), floated (head back, hem drifting; drawGran draws the big bubble round her), dead (heap of shawl, staff broken). Phase two: second set, lantern red-orange, embers. Bestiary card = two walking frames.

## CHECKS
| check | result |
|---|---|
| tools/underleaf.mjs | 105 checks green |
| tools/underleafart.mjs (NEW, in check.mjs): hash, reskin table, every foe skinned, sheets, 19 distinct poses, P2 set, no page error | all green |
| level-quality underleaf | PASS, same hash; pilot 29 blows / 3 deaths, curve 208% / 3 deaths, mash 0/6 |
| corpses (`underleaf` added to its list) | every reskin dies in its own skin |
| skins, foe-pass | green |
| textfit bestiary (321 screens) / levelcard | 0 overflow, 0 truncated |
| mobile-perf 4x CPU 915x412 | level 57.6 fps (30:29), yard 48.7 (300:22), arena 48.3 (450:29); budget >= 40. (First run had a 674 ms first-frame bake: fixed by warming the backdrop/dress at the load.) |

## BEFORE / AFTER (work/claude/lane-done/underleafart/)
`before-<n>-*.png` (greybox, same coordinates) and `after-<n>-*.png` for: 1 garden teach, 2 ditch bridge, 3 float well, 4 hanging racks, 5 thorn hedge, 6 thorn-beast, 7 cauldron yard, 8 leaf bridge, 9 great leaf, 10 her stoop, 11 boss walk, 12 broodTell, 13 fireballTell, 14/15 jarTell green/red, 16 staffTell, 17 floated, 18 stirTell, 19 warded, 20 jars, 21 red fire. Sheets: `sheet-people.png`, `sheet-gran-p1.png`, `sheet-gran-p2.png`, `sheet-base.png`. Tools: tools/underleafart-shots.mjs (PREFIX=before|after), tools/underleafart-sheet.mjs (FR=frames).

## NOT DONE / HONEST
- The thorn-beast pelt and the jar-thrower are 14-20 px sprites: they read as green bramble / jar-strap but are not fine art.
- The Grandmother is a cone under a hood; the poses differ clearly but the arms are small. No animation between frames beyond the walk pair.
- No new sound (ambient bed unchanged), no music change (brief).
- The hush code (Underleaf 2) still sits in the tree unused (greybox question 1).
- Dead-frame of phase two equals phase one (no flame to differ).
- `reachExact`, tells table rows (greybox question 3) untouched.

## QUESTIONS FOR DANIEL (rec = built)
1. Jar-thrower's thrown lantern drawn as a RED fire-jar (it burns where it lands). Rec: keep; blue/green would read as the player's jars.
2. The Grandmother's old bestiary text was Underleaf 2's (sound); rewritten for the jars fight. Rec: keep.
3. Big bubble round the floated Grandmother is drawn by the module, not the small jar-bubble. Rec: keep.
