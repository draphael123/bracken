# claude/bogtroll2art (SONNET) - BOG TROLL 2 art pass. Off claude/bogtroll2 c05b06d1. Not merged, not deployed. ART ONLY (no numbers/collision; pins/levelHash untouched).
## DRAWN
- Poses (src/redraw/bog_troll_art.js; two art-only flags added to POSE in bog-troll-hands.js): waveTell = water pouring off the raised arms in streams (pour); waveSlap = both palms flat on the fen, spread claws, wall of foam columns + flung droplets + foam ring (palm + spray);
  pileTell/Wind/Swing = the post redrawn (oak pile, chewed top, iron strap, frayed hemp lashing, peat foot with roots/weed, drips; swing adds a 3-ghost smear + whoosh lines); PINNED = two real crossbeams in an X (iron bolts, moss, jagged broken end), boards across the crown, splinters, dust, drips.
- Overlay (bog-troll-hands drawOver): ripple line = wavelets ending in a blinking red arrow chevron; wave crest = curling swell (teal body, foam cap, curl lip) + lifted boards with dark gap, side shadows, water running off; piling-swing arc = running dashed red ellipse; stuck stars = 4-point stars, near ones larger.
- Crossing (fen_road_art drawCrossbeams): lit-edge oak X + stringer, iron plate at the crossing, moss-capped slimed piles, weed streaming, rot patches, cracks; wrecked = pale snapped cores, hanging beams with weed + dripping water.
- Props (fen_site_art): warn board redrawn (nailed planks, fat shaded red X, rag); topple now throws a ring + crown of droplets, a torch goes out in a steam puff (new steam()).
- Banks (fen_planks_art + fen-planks.js draw): empty bundle = bare sawhorses with hemp loop + stub plank; stock pips = plank glyphs, refill tick bar. A freshly laid plank under strain (fen-road-hands, arena sections only) shows hairline cracks, a lifting splinter, dust (drawStrain).
- Peat bank edge tiles: not changed (existing bank peat tile + sedge reads as a bank; revisit if the stills disagree).
## CHECKS RUN (node-only, no browser)
bog-troll 63/63 ok; fen-road 215/215 ok; foe-footing fenroad clean (other levels report-only as before); node --check + module load of every touched file ok.
## NOT RUN - COORDINATOR BROWSER HOLD (scratch/BROWSER-HOLD.flag was up from 14:30 for the whole lane; polled ~35 min)
- STILLS (before = scratch/lane-reports/bogtroll2-shots/): the drawing has NOT been looked at in a browser - expect pixel-level tuning. Helper ready: work/tmp-bt2art/shots.mjs (run: node work/tmp-bt2art/shots.mjs from the worktree; writes bogtroll2art-shots/; needs >= 1500 MB free, one at a time).
- textfit boss scope, mark-integrity (MI_ONLY=bogtroll), pixels/art checks for fenroad: not run (browser). Run after the flag clears.
## QUESTIONS FOR DANIEL
None new. SOUND placeholders (trollSlapTell/trollSlap/trollWrench*/trollSwing/propPlop/torchHiss) are still synth.
