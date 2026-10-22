# claude/chief3art (sonnet): THE CHIEFTAIN'S HORN, KEG AND POWDER STORE, DRAWN

Base claude/chief3 6d1ff3d4. Art only: no gameplay number, hitbox, tile or level-data change (src/level.js untouched, so the level hash is unchanged and no stockade pilot/curve/mash row needs a re-stamp). Not merged, not deployed.
Pictures: work/claude/lane-done/chief3art-*.png (horn wind, keg throw, powder store chain blast, lookout collapse, the six new Chieftain poses).

## Drawn (vs the chief3 ART NOTES)
1. **WAR HORN** (queenchief.js frames 22-24, stockade-hands chiefFrame): 22 the WIND (the great horn drawn up the chest), 23 BLOWING (head thrown back, cheeks blown out, bell high), 24 SILENCED (bent over, choking, horn swinging from its strap, cough smoke and swimming stars). The great horn is his own: bone, three brass bands, a flared brass bell, a leather strap, bigger than the blowers' ivory horn. Note arcs run out of the bell while he blows (gold, then red). Silenced reads as a pose while the opening lasts (e.poseKind, art-side flag only).
2. **HORN DRAW BAR** (stockade2_art drawHornBar): a timber plate with iron caps, an ivory horn badge, a gold-then-red pulsing fill with quarter notches, and a bone peg per blow wanted (green when it lands). Sits above his head clear of the horn.
3. **KEG HEAVE** (frames 25 wind-up, 26 release): both hands overhead, leaning back, then thrown forward. The keg is drawn in his hands (lit fuse), the tower deck keg uses the same pose. 
4. **POWDER KEG** (drawPowderKeg): squat stave keg, two iron hoops, bone tag with the camp's red burst, bung; a fuse cord that burns down with a flickering spark and sparks; spins in flight and rolls with its roll angle. The told fuse bar is now a twisted cord with a spark at its burning end (same colours, same timings). The Stockade's camp barrels draw as powder kegs too (props 'barrel', Stockade only via SKD.drawBarrel; every other level keeps PROP.barrel).
5. **BLAST FX** (drawBlast, all blasts in the camp): flash, ragged fireball (seven lobes, four layers, drifting up), shock ring, smoke, flung stakes/hoops, a scorch on the floor. Kinds: keg, store (bigger, a second ring, bursting sacks), legs (a keg at the war tower's feet: splinters and twin flashes at the legs), door (the crew's entrance: a slit of firelight and a kick of dust, at the doors where the sprigs spawn).
6. **BLASTED** (frame 27): sat down hard, scorched and sooty, arms flung, with smoke and stars. Seated rather than flat on purpose (see Q1).
7. **LOOKOUT ON STAKES**: the kennel stilts are three heavy lashed posts under the deck with wales, X braces, a skull and a stone footing (tile kit hook in stkTile for the lookout's PALISADE cells, no tile change). Collapse: the outer posts topple from their feet, the middle one folds, the deck breaks in two and drops, splinters fly, then a heap of splintered stumps and cut rope stays.
8. **POWDER STORE** (556-564 plateau): a lashed rack under a patched hide tarp with a skull charm, four spare kegs on a shelf, sacks stacked at its feet, drawn behind the real barrels (SKD.drawBack, before the prop loop). The chain blast is the 'store' blast, and the rack blackens with every blast (scorch up to 85%).
9. **CREW'S ENTRANCE**: sprigs now arrive through a slit of firelight and dust (not "run in": that needs a spawn/placement change, left).

## Files
src/redraw/queenchief.js (frames 22-27, great horn, puffed cheeks, sit legs, soot), src/redraw/stockade2_art.js (keg, fuse, horn bar, blast, lookout, store, chief fx), src/stockade-hands.js (frames, draw hooks, fx list, store lookup, lookout fall clock), src/main.js (3 lines: PALISADE in the stkKit tile hook, the powder-keg barrel draw, SKD.drawBack).

## Checks (PORT 8793, one at a time, all GREEN)
chief3, stockade2, stockade-horns, signs, solid-islands, visible-supports (stockade 0 findings of 45), boss-read, mark-integrity (MI_ONLY=chief: every mark drawn and lands), textfit hints,bestiary,boss --strict (2314 screens, 0 issues). mobile-perf at 4x CPU, 915x412: powder store 47.9 fps, 15.1 ms busy/frame; the hall 50.3 fps, 15.1 ms busy (worst frame 583 ms at the store scene's start = scene load, hall worst 53 ms), in budget.
Not run: pose-frames (hero tool, nothing chief-specific), the full suite and the level-quality gate (level unchanged).

## Self-grade: B- (poses B-, keg and store B, blast B, lookout B+)
Weak spots: at 1x the cheek puff and the "hand at throat" read faint behind the pauldron; the wind pose's horn is small; the blasted sit is a squat lump.

## QUESTIONS FOR DANIEL
1. BLASTED is a seated slump, not lying flat: a flat sprite would sit under a standing hitbox (34 tall) and blows would pass over his body. Rec: keep. Alt: flat, with the hitbox lowered in a gameplay lane.
2. Every blast in the Stockade (including sapper bombs) now uses the new fireball, since they share main.js explode. Rec: keep.
3. Sprigs "run in" from the doors: they still spawn on the spot, with the firelight slit and dust. Rec: a gameplay lane spawns them off-edge and walks them in.
