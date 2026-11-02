# GORM 3 ART (sonnet) - claude/gorm3art off claude/gorm3 767951a5
Gameplay/tuning untouched (no timing changed; every telegraph length the same). Art only.

## FRAMES BAKED (src/redraw/gorm_frames.js, poses in gorm_poses.js)
- Standing (up2): potTellUp (lit pot raised in fist, laughing), potUp (arm flung, empty), sceptreTell (club slung on back burning, sceptre cocked by the ear, other arm aiming), sceptreOut (arm flung, hand EMPTY), sceptreCatch (hand up, open), rageTell (head back, roar, claws wide, hem catching), burnChargeTell (head down, limb gripped two-handed like a ram, boot pawing), bc0-bc3 (a 4-frame run cycle timed by ground covered, replaces the clubLo frame), burnChargeEnd (skid, heels dug, limb swinging up).
- Seated on the litter (seat2): potTell, pot.
- ENRAGED set (UPR): EVERY standing frame again with the crown cracked (split spike + blue gem in shards, a chipped spike, gold chips), ember-red eyes, charred fur collar, soot on folds, hem eaten black with live embers and low flames. Drawn from the crack (rageT >= 0.9 of the 2 s rageTell) to the end; plain set before that. The greybox zigzag is gone; shoulder/crown flames moved off the face.
- Props: pot sprite (4 tumbles, fuse flame follows), sceptre sprite (8 turns, gilt shaft, ruby orb); pitch patch = glossy black pool under the flames, fire trail = scorched cracked floor with coals.
- Sounds: not touched (notes list a possible real roar/stinger; owed to a sound pass).
- warm() now bakes UPR + props at level load (cost not measured; ~ one extra pass of the standing frames).

## SHOTS: scratch/lane-reports/gorm3art-shots/ (after-*), tool tools/gorm3art-shots.mjs. Before = scratch/lane-reports/gorm3-shots/ (greybox, same names).
potTell (hero on deck in frame), pot, pot-flight, pitch-patch, sceptre-tell/out/high-back/catch, rage-tell a/b/c/wide, enraged-stand/wide, burning-charge tell/run a-c/end/trail, and sheets (plain, ENRAGED, seat, props).

## CHECKS
GREEN: tools/gorm3.mjs, gorm2.mjs, tells.mjs, answer-tags.mjs, node --check on touched files, page errors [] in every shot run. Boss sanity (boss-rates kings practiced human knight n=3): 3/3, no crashes. No text changed (textfit not run). No reds.
Not run: full art suite, other heroes.

## QUESTIONS (rec built)
1. Pre-crack first second of rageTell uses the plain-crown frame, then snaps to the cracked set. Rec: keep (reads as the crack).
2. Burning charge frames are busy with flames over the limb; trim FX if Daniel finds it too much.
3. A real roar/stinger sound for the rage is still owed.
