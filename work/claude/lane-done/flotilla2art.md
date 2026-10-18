# claude/flotilla2art - FLOTILLA 2 ART (Sonnet art lane, 10-17)
Base: origin/claude/flotilla2 b1619d4d. Art only: no numbers, timings, tiles or entities touched (src/level.js is unchanged, so the level hash is unchanged).
Self-grade: greybox D -> **B-** (Champion sheet B; the level pieces B-).

## DRAWN
1. THE CHAMPION (src/redraw/champion_art.js, rewritten; pose keys and exports kept): ~70 px living salt-crusted plate knight (barrel breastplate, round barnacled pauldrons, closed sallet with a salt crest, sea-green ragged surcoat and cloak, warm eye in the slit that brightens through every windup, barnacled greaves). A skeleton drawer (two-bone arms and legs), so each move is its own pose.
2. P1: comboTell/combo/comboRec, slamTell/slam/stuck/slamRec, thrustTell/thrust/thrustRec, leapTell/leap/landRec each have their own windup, release (crescent smear, deck splinters, thrust streak, crack lines) and recovery. The hands now pass progress for release/recovery modes too (TELL_T in src/admirals-champion-hands.js) so the poses animate.
3. flat (on his back, blade loose, stars, chest still lifting); getting up (one knee, rising) into the WARDED grey (whole palette goes cold steel while S.ward > 0); hit flash is a palette swap, not a white box. Death (drawDeadChampion): knees, topples on his face, blade/anchor slides loose, salt pales.
4. P2: tearTell (hauling the anchor off the rail, lashings snapping), sweepTell/sweep/sweepRec, hookTell (anchor whirled over the helm)/hook/hookRec, tiltTell (anchor two-handed over the helm)/tilt/stuckA/tiltRec; the anchor dragged on its chain at rest. Bestiary card: blade grounded, eye lit.
5. Anchor (shank, stock, ring, curved flukes with palms, rust, barnacles, weed) and chain (turned links, taut = bright). FX: slam mark (hatched strip, converging chevrons), leap mark (shrinking ring, chevrons), sweep ring (dotted told / solid released), deck tilt (running arrows, climbing deck lines, sliding gear), the LASHINGS (three laid hawsers on bollards, slack = thick and sagging, apart = bar-taut, thin, bright with fenders squashed and the harbour wrung white), HAULED OUT splash + boat-hook line (new, drawn from the hands).
6. Galley hull (src/flotilla2-art.js): benches in tarred frames with knee-braces, straps, stroke tallies and a worn thwart; oars working a thole pin; PRESSED rowers (oilskin cap, striped jersey, shackle chain to a ring-bolt, a 4-beat row cycle) and FREED (standing, chain broken on the thwart, green glint); charred deck lips over the wells (burnt plank ends, embers, smoke); the stern castle rib ladder; the mizzen's crow's nest.
7. Rigging run: yards as rigging (tarred spar, seizings, clewed-up canvas under it, footrope on stirrups, two lifts to a block and the stay running on up); masts stepped on drowned-hull ribs (keel, barnacles, weed, a hole, iron collar); the walkable hawser laid in three strands with seizings and backstays; the catch-net (knotted mesh, cork floats).
8. Powder ship: COPPER DOORS (verdigris plates, rivets, bare metal, iron frame, hinge straps, a stencilled fused keg; blown = buckled leaves, scorched lintel, smoulder); crate hatch shut (stencilled crates, iron batten) and blown (charred joist stubs, scorch); mainmast partners (round mast, hoops, woolding, fife rail, belaying pins, wedges); 'tween-deck magazine (copper-lined, kegs in tiers, lamps behind glass, a NO SPARK notice); the fighting top (hammock barricade, knee-braces, dim mast behind).
9. Lashings arena: lashing lines, fenders, bollards (see 5); the deck guns are now carriage + iron piece + shot rack + rammer, glowing red while hot (pr.cool) with smoke.
10. Spars as rigging: the rock spar, the bowsprit (tapered, gammoned, stayed to the foremast, bobstay), the galley stern boom, the hulk bow boom, all with seizings, an iron cap and stays up to a mast; none reads as a log.
Tools: tools/flotilla2art-sheet.mjs (pose sheet: p1|p2|fx|dead), tools/flotilla2art-shots.mjs (in-level shots). Before/after shots in work/claude/shots/flotilla2art/{before,a1,a2}, sheets in work/claude/flotilla2art.
Edits outside the art files: src/main.js gets 4 one-line hooks (FL2H.drawBack before the movers loop, drawDoor for 'bulkhead', drawGun for deck cannons, and 2 ctx fields tileAt/crate); src/flotilla2.js delegates drawing to flotilla2-art.js.

## CHECKS (targeted, one page at a time, all green)
tells, admirals-champion (knight/warden/pyro/ranger/paladin), frame-cost, boss-read, floaters, solid-islands. Pose sheet and in-level shots eyeballed. Logs: work/claude/flotilla2art/chk_*.log. Not run: the full suite, boss-rates (nothing numeric changed).

## NOT DONE / HONEST GRADE (B-)
- Oar looms THROUGH the hull side: the wells are open, no wall to put a port in; oars work a thole pin on each bench instead.
- Petrels (the foe sprite stays the shared one), the flagship tail/gate, and the arena hull faces beyond the lashing lines are untouched.
- Champion: poses are pixel work on one skeleton, so he is slightly stiff; the helm is small for the pauldrons; the leap/slam smears clip at the top of tall frames; hit flash/ward only checked on stills; no animated frames-per-second review in the live fight beyond a few shots.
- The ward/hit palette and death were checked on the sheet, not in a live fight.

## QUESTIONS FOR DANIEL (rec = built)
1. Champion head size: a bigger helm (more menace) or the current broad-pauldron silhouette? Rec: keep, adjust only if the live fight reads small.
2. Deck guns now glow when hot: keep? Rec: keep.
3. Petrels: give them their own sea-bird art in a later polish lane? Rec: yes.
