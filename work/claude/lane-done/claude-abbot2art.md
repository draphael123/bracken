# claude/abbot2art: THE FALSE ABBOT 2, art pass (draw only; no number or timing changes)

Base: origin/claude/abbot2 d4c51d71. Level hash: unchanged (no level data touched).

## Drawn
- Sprite (`src/redraw/false_abbot.js`): frame 8 rope windup (crouch, one open fist reaching forward clear of the mitre, other hand hauled back with the pot - no staff read); frame 9 SWINGING (hung from the sally by two fists, body trailing, hem kicked up, boots tucked; hands sit exactly 52 px above the foot line = where `drawAbbotRopes` ends the world rope; this frame is deliberately not `settle`d); 10 slam (two-fisted, cracks, dust, coals); 13 prayer (on his knees, bowed, eyes shut, joined hands + beads, censer set down smoking); 18 false light tell (pot raised in front of the face, off hand open, gold flare); 19 thrown (lunge, taut chain, light streak); 20 spoiled (mitre knocked off and tumbling, staring eye, mouth open). `cope()` got `len/flare`, `head()` got `shut/wide`, new `hand()`/`rope()` helpers.
- World (`src/false-abbot.js`): belfry ropes are level art, drawn whether he is alive or not (timber bracket with iron strap, bronze bell with clapper that swings and rings on the tell, twisted rope, striped wool sally, knotted tail; sags to his hands while he swings); sanctus bell post (stone footing, post, arm, big bronze bell, gold glow, glints); candle ring (wax stubs with drips, flames, front ones larger, gold circle); false-light mark with a tightening inner ring, orb with a glow and trail, and a gold BURST flash (new `e.flash`, art-only, decays in `stepOrb`); slam: double shock ring, dust, flecks.
- Sound: `SFX.sanctusBell` synth in `src/audio.js` (clang, hanging inharmonic ring, low sweetness); main.js strike now calls it.

## Checks (one at a time)
Green: false-abbot, false-abbot-art, belfry, tells, ability-poses (76/76), boss-read, mark-integrity MI_ONLY=abbot, audio-assets, soundtest, mobile-perf, textfit bestiary+hints (0 issues).
Red/not clean: the textfit full run timed out per scope (481 s, machine loaded by the suite; boss/plates/talk are not text I touched); bestiary+hints rerun alone is green.

## Grade: B (before D+: greybox canvas primitives, poses read as standing/staff)
Before/after sheets outside git: scratchpad before.png / after-final.png (docs/false-abbot.png re-rendered). Arena shots are 629 px wide only; I checked ropes, sally, sanctus post+glow and candles there; the orb/burst/slam were not eyeballed in motion.

## QUESTIONS FOR DANIEL
1. Frame 9 is not floor-settled so the grip lands 52 px up. Rec: keep. Built.
2. The prayer frame reads a little tent-like; rec: a later polish pass on the kneeling silhouette. Not built.
