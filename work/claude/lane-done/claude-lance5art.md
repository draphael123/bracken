# claude/lance5art - LANCE 5 ART (sonnet; stacked on claude/lance5 79b37291)

Art only. No hitbox, timing, tune number, cell or level-hash edit (the only main.js logic touched is which sprite sheet / draw call runs). Not merged, not deployed.

## Drawn
- **P2 storm sky** (src/lance-storm-art.js drawSky, hooked in main.js drawLanceSky): a void-dark ceiling and three cloud banks (violet-slate masses with lit undersides) easing in over 1.4 s; a heavy wash over the castle; three depths of SLANTED rain streaks plus faint wind sheets; wet deck sheen and splashes. LIGHTNING is the backdrop's bolt (jagged bolt + branch, the clouds lit from beneath, the castle left black against it) instead of a white full-screen frame; the trigger still waits while a tell is on screen (stormQuiet) and respects the Flashes option (boltFlash). P1 stays the lit violet dusk, so P2 reads as a different hour at a glance.
- **Rock teeth** (bakeRockTeeth -> the SPIKE tile under the bridge only): slate teeth, lit left face, wet edge, violet stain, rubble; storm spray hanging over every span.
- **Updraft column** in every gap (rising body that widens, helical streaks, flung splinters/drops, a flare at the lip, a glow at the teeth); it blazes while he (updraft) or you (P.stormLift) ride it; a wind wrap round the lifted hero.
- **Storm gust**: told = chevrons marching the way it will blow, one more row per toll, the bell rope swaying harder as it tolls; blow = a bowed leading edge running out from the bell with a rain sheet, long streaks and grit along the deck behind it.
- **Rising skewer**: braced pose set (skewerTell0, skewerTell, skewer with smear, skewerRecA/B looking up) + the told column (red rails at the hit width, rising chevrons, cap) and the strike streak.
- **Pivot**: pivotA (stamp, lance swung back, pennant lashed) and pivotB (the turn on his heels) + a gold ring arrow on the deck pointing the way he is about to face.
- **Pennant gone from P2**: two sheets. SPR.lance (P1, pennant, only the poses his first phase can take) and SPR.lanceTorn (P2+, a knot of cloth and three torn ribbons on the lance, shielded and shieldless). main.js picks by e.torn. The moment it tears: a swallow-tailed ribbon and 5 shreds fly off on the gale (drawTear, fired from the P2 turn).
- **Buffeted / tossed / updraft** poses: buffeted + buffetedB (lifted, cloak and plume flat, shield as a wind-break), tossed + tossedB (on one hand on the lip, stars while stunned), updraft (tumbling, rot -22).
- Music: no CC0 storm track is in the audio pipeline, so the current tone-up (+2 semitones) plus the rain bed stays.

## Numbers
- Poses: shielded 62 -> 74, shieldless 57 -> 69 (12 new each) = 143 pose definitions (the old cap 120 is exceeded; see Q1).
- Real baked frames: P1 sheet 49 (the rest 1x1 blanks), torn sheet 140 -> 189 real vs 119 before. Sprite memory ~36 MB -> ~55 MB (R, L, white; 14.2 + 40.6 MB), bake 99 + 223 ms at load.

## Checks (all after the drawing; one browser at a time, RAM 4.4-6.2 GB free)
- GREEN: tools/lance4.mjs (node + page: pivot, no backward charge, kb, storm, gust -> buffeted -> updraft -> tossed, hero lifted alive, skewer, P3, great bell, slam), textfit bestiary+hints --strict (341 screens, all 0), boss-read, stormhold4, mark-integrity MI_ONLY=lance (every mark seen is posed and lands). Page errors 0. tools/check.mjs not run.
- Not run: mobile-perf (sprite memory is up ~19 MB, see Q1), pixels restamp (the Lance sheet and the Long Bridge pixels changed; Stormhold bridge pixel hashes will need the coordinator's restamp).

## Pictures (scratch/lane-reports/)
lance5art-before-*.png / lance5art-after-*.png: p1-bridge, p2-arrives-a/b (the storm turn, the cloth tear), p2-bridge, p2-bridge-gap, gap-teeth-updraft, gust-told, buffeted, updraft-him, tossed, hero-lift (teeth + column from the gorge floor), pivot-a, skewer-tell/-strike/-rec. Contact sheets: lance5art-sheet.png (all poses, torn set + a P1 pennant strip) and lance5art-newposes-sheet.png (the 12 new at x4). Tool: tools/lance5art-shots.mjs <before|after> (the "before" shots came from a detached checkout of 79b37291).

## QUESTIONS FOR DANIEL (rec built)
1. Frame budget. REC (built): 12 new poses per set (143 definitions) and two sheets with unused frames blanked; +19 MB sprite memory. ALT: drop the bare walk/hop/vault duplicates, or lazy-bake the torn sheet on first P2.
2. Hero lift pose. REC (built): the existing hero sprite plus a wind wrap; ALT a per-hero tumble frame (9 heroes x 2 sheets: not worth it).
3. Storm music. REC (built): keep the pitched-up track + rain bed; ALT a CC0 storm loop (Daniel's pick, needs a download).
