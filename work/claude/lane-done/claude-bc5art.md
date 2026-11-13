# BC5ART DONE - claude/bc5art (off claude/bc5fix 1d437c254; pushed; no merge, no deploy; BC5_SHIPS stays false)
Worktree LANES\bracken-bc5art. Code-only, node-only: no browser launched. Draw-only: src/glassblower.js, sand-grasper.js, buried-city5.js are byte-identical to base (lint checks git diff); Glassblower stays 72% (hp/dmg/timings/hitboxes untouched). Flag OFF = master (nothing here runs without L.bc5; OFF counts identical).

## Drawn
- THE GLASSBLOWER (src/redraw/buried_city_bc5_art.js, new, rect-only): outlined-mass rig (boots, vest, scorched apron with glowing hem, soot-bearded face with brow/eyes/mouth, singed cap + brass goggles, long brass blowpipe + molten gather). Poses: sleep, wake, idle, walk, GOB wind (pipe back over shoulder, gather swells) / release (swung down, glass strand), BLOWPIPE wind (pipe to mouth, cheeks puff, tip red->white, heat shimmer) / release (jet from tip), FLIP wind (hand raised, gold sparks) / release (fist down, ring), BULB wind (glowing bulb overhead in both hands) / release (smashed, shards), stagger, buried to the waist (sand mound, arms up, pipe dropped, gold ring + timer), warded (faceted glass dome), hurt flash, DEATH FALL (2.4 s: reels, drops pipe, goes down, gather shatters, fades). P2 = glowing goggles + hem. Pose name debug text removed.
- SAND GRASPER: the tell is real now - faint ripple while buried; on the boil (1.2 s) rings spread, a mound swells, a hand claws up, then a second, gold flash near the end; rise (sand streaming), walk x2, wind (both arms up and wide, eyes flare, gold bar), grab (arms thrust, streaks), hold, recover (gold bracket + OPEN), hurt.
- KIT: race door (sandstone shutter in guide slots, carved hourglass, brass foot-bar, sand off its foot, lintel keystone gold -> red), race marker (pennant waves while the glass runs + chalk start line, on the 7 race glasses), hall kiln stubs (firebrick, fire-mouth, brass cap, embers; 3-row and the 2-row), hall floor (cullet, slag, drift, glow), gob (comet + floor ring, hot spikes, cooled glass step now 16 px = the real tile), blast cone, shards, glint ring.
## Files
src/redraw/buried_city_bc5_art.js (new), src/glassblower-hands.js (drawFoe/World/Over + death record), src/buried-city-flip.js (door + marker, 2 hunks), src/buried-city-hands.js (decor kiln/gbhall), src/buried-city.js (decor rows + gbhall, decor only), tools/bc5-art-lint.mjs, tools/bc5-art-sheet.mjs.
## Proofs (before -> after, flag OFF and ON; logs scratch/lane-reports/bc5art/before.txt, after.txt)
buried-city5 157 -> 157 (ON and OFF) | buried-city 399/408 -> 399/408 | reach-heroes 0 crossings (12/13 targets) same | level-quality clears same | solid-islands, architecture (610/613), signs (1257/1262), tells, answer-tags same | homepaths +3 files | bc5-art-lint 438 ok (new) | node --check all touched files.
## Sheets (scratch/lane-reports/bc5art/)
gb-poses.png, gb-tells.png (4 moves x windup 0/.35/.7/1 + release), gb-death.png, gb-1x-vs-hero.png, grasper-tell.png, grasper-boil-strip.png, kit.png, hall-composed.png. Tool: node tools/bc5-art-sheet.mjs [outdir] [gb|tells|grasper|kit|hall].
## Weak spots (honest)
- Never seen in the page. Sheets use a placeholder hourglass and flat wall/floor in hall-composed (real hourglass/tiles use paths, node canvas cannot).
- Glassblower head is ~12 px: face reads at 3x, at 1x it is eyes + brow + beard blocks. Apron is a dark mass; gob/blast/bulb winds are distinct silhouettes, FLIP wind is the weakest (a hand + sparks).
- Grasper hands are blocky with floating nail dots; the rise draws a sand slab below the floor line that may look boxy on real tiles; hurt flash is a white silhouette.
- Death fall lying pose is crude; head/torso blocks.
- Hall kilns cover the plain stub blocks completely; the 'kiln' decor never drew before, so this is first sight of the hall dressing.
- Teach signs not re-skinned (generic sign entity, main.js); the pennant is the race marker instead. No finish-line marker (no geometry for it).
## BROWSER OWED
?bc5=1&level=buriedcity: Glassblower hall vs Mage's Folly (face at 1x, tells in motion, P2, death fall after the last hit - confirm e.alive false is what main.js leaves), race door slide/lintel colours, pennants, kiln stubs vs tiles, Grasper boil->rise in motion, cooled step = tile height, cost of live drawing per frame.
## Questions (rec first)
1 Bake Glassblower poses to sprites if the page shows cost? Rec: wait for the browser look.
2 Add a finish marker per race (needs level geometry)? Rec: later, with the walk.
3 Re-skin race teach signs as carved stone tablets (main.js change)? Rec: no, pennant is enough.
