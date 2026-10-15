# claude/fogknightart2 - FOG KNIGHT 2 + TOWPATH 2: SECOND ART PASS (SONNET)
Base 2ce3b9ec (towpath2art). Art only: no numbers, boxes or placements.

## DONE
- FOG KNIGHT (src/redraw/fog_knight_art.js rewritten, same exports, same pose keys): three layers - mist tail behind, the plate on a scratch canvas with a 1 px dark OUTLINE (silhouette reads at game size), fx in front. Pale weathered steel ramp (5 steps) with rust accents (was rust-black on a dark ground). 24 px shoulder line, round laminated pauldrons, ridged breastplate + plackart seam, belt, four-lame skirt (tattered) that breaks up into a ghost TAIL of mist (S-curve, lit/shadowed sides, curls, pool on the stones); great helm (3 planes, cross slit, tattered pennon); broad two-tone heater with the lock sigil and a broken corner; bracers + couters + a fist ON the grip with the crossguard above it (sword hand fixed: rear arm in guards, front arm in blows, two fists on two-handed poses); blade 3 px with fuller/lit edge. PLUNGE redone (falling, head bowed, fists stacked on the pommel, arms from the pauldrons, wind streaks, no standing tail); kneel poses sink the tail; lungeTell now levelled in front.
- Comparison with the Crusader at 1x and 2x: work/claude/fogknightart2/compare-crusader.png. Pose sheet: knight-sheet.png. Bestiary card: card-sheet.png.
- FOG BANK EDGE: ends now thin out over ~7 tiles (alpha from 0, top edge sinks) - no wall where a bank stops (src/towpath-hands.js drawOver; draw only).
- HUT ROOF: brick/slate-looking course -> timber shingles (staggered split oak, ragged tails, moss, capped ridge) in towpath_tiles.js (hut only; shot hut.png).
- SHOT and reviewed: arena (lock + quay + bollards), culvert, Y lock, tower/beacon, last-lock irons in fog with/without the lantern (xfloor / xfloordim - the spot respawned the hero before; tool now drains X first), fog wraith in play (wraith1, wraitharch), bestiary card. No further defects fixed beyond the above; arena/culvert/Y read acceptably.
- Tools: tools/fogknight-compare.mjs (new), towpath-art-sheet.mjs (card, out dir), towpath-art-shots.mjs (pre/xfloorlit/wraith spots, out dir).

## CHECKS (one page at a time, PORT 8926)
GREEN: towpath.mjs 311 ok; towpath-probe; corpses; hint-shown; mobile-perf towpath (60.2 fps, inside budget); mark-integrity fogknight rows (cutTell/lashTell/lungeTell posed + landed); textfit bestiary + hints (0 issues).

## SELF-GRADE
Level B- (night set pieces + fog edge + shingle roof read; beacon sweep and culvert still modest). Knight B- / C+ : clear silhouette, correct hand/sword, readable poses at 1x, but still lighter in mass and busier in 1 px detail than the Crusader. Ship rule (>= B) arguably NOT cleanly met for the knight.

## QUESTIONS FOR DANIEL
1. Knight: ship at B-, or one more hand-tuned pass (Opus, true pixel sprite sheet instead of procedural rects)? Rec: one more pass only if you want Crusader parity; otherwise ship.
2. Palette moved from rust-black to pale steel so it reads on the night ground - keep? (rec yes)
3. Several recover/kneel poses (surgeRec, spearRec, sleep) differ mostly by the sword; distinct silhouettes would need hand-drawn frames.
