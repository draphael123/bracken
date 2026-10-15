# claude/ksarfoesart (SONNET art) - THE FALCONER + THE PLATED BANDIT polish art, off claude/ksarfoes 91cde1b5
Art/draw code only: no number, timer, box or placement moved; level hash unchanged (no re-stamp needed).

## Drawn
- src/redraw/ksar_foes_art.js (rewritten): FALCONER (teal coat, gold-braided hem, turban + barred feather + ruby pin, veil, cross-strap, leather hood with red plume + lure on the belt, tan flared GAUNTLET held up where the hawk lands). Own B16 poses: 7 SEND windup (glove cocked back, jesses taut, hand aiming), 8 SEND release (glove flung out, fingers spread, jesses streaming, streak), 9 CALL (glove straight up, two fingers at the veil, whistle arcs); feint/slash/hurt redrawn.
- FALCONER'S HAWK (SPR.falconhawk, worn via e.skinNow on a hawk that has a falconer; frame table = hawk scout + 7): slate-blue lanner, hood-crest + red plume, gold bell, trailing jesses; frame 7 = PERCH ON THE GLOVE, hooded, jesses knotted (ksar-hands glove mode now uses frame 7, was the scout's ground frame 5). Reads apart from the free brown scouts.
- PLATED BANDIT: plated set (ridged helm + nasal + mail aventail, riveted cuirass, waist lames, layered pauldrons, vambraces, tassets, greaves, notched cleaver) and BARE set (quilted diamond-stitched coat, red skullcap, beard, wrapped limbs), heavier SLAM frame 5 (wide braced dip, two-handed downstroke, cleaver bites the floor, cracked floor, dust ring + chips).
- PLATE SHATTER FX: bakePlateShards (helm, pauldrons, breast, tassets, rivets, splinters, 4 turns each); ksar-hands strip() pushes a 'plate' fx, drawPlateFall tumbles/bounces/rests/fades them (replaces the grey sparks; a small burst remains).
- READS (src/ksar-hands.js drawOver): OPEN = shared gold double ring + 'OPEN' word + framed timer bar (fog-knight style); GUARDED = pale shell with rim + glint arc (dashed greybox stroke gone); a sagging leather JESS cord glove->hawk (fades with distance, hidden on the stoop).
- tools/ksarfoesart-sheet.mjs (contact sheets, not in suite); sheets in work/claude/ksarfoesart/*.png, live shots work/claude/ksarfoes/art/.

## Self-grade (polish scorecard): B. Poses are distinct and read at game scale; falconer's turban is blocky and the plated man is a grey mass at 1x (B, not A); the slam's cleaver is thin in the dust.

## Checks
tools/ksar.mjs 259 ok; corpses CORPSES_ONLY=ksar ok; hint-shown ok; mobile-perf (title,ksar) inside budget (ksar 58 fps, 14.3 ms/frame at 4x); scoped textfit --strict hints,bestiary 0 on every column (376 screens); live probe (ksarfoes-shots) all poses seen, guard/open/strip still behave. ability-poses is for hero skills - not applicable. Not run: full suite, unscoped textfit. Reds: none.

## QUESTIONS FOR DANIEL
1. The falconer's hawk now wears a separate lanner skin from the free scouts. Rec: keep (reads apart); alt: same brown hawk with only a bell.
2. Hood is drawn on the hawk only when perched on the glove (hooded on the glove, crest + plume in flight). Rec: keep.
