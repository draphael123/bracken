# SCENES (lane SC, Sonnet) - the Heart of the Mountain's two scenes (branch claude/scenes)
Not merged, not deployed. Base claude/skyart 3748698e, merged claude/draketune bbef1120 (clean, no conflicts: the two touched different files except src/main.js, where git auto-merged the drake's TIER/ACTS rows and my lane's later edits are all in other hunks). The lab road drakelab -> scene A -> skylab -> scene B -> map is walkable and was walked in a real browser.

## What changed
- NEW `src/heart-scenes.js` (pure): scene A (SEAL, 11 s) and scene B (ESCAPE, 17 s) timing, cues, hero/King/drake positions, the two TABLE rows, `checkpointOf`.
- NEW `src/transitions-heart.js` (pictures): drawSealScene, drawEscapeScene, re-exported by transitions-art.js. Built from the pieces S4 drew: sealSprite, sealLight, plume, breachCrack, rimLanding, the drake sprites ('down' > 'rise' > 'walk' > 'takeoff' > 'hover'), the King's phase-1 sprite, and for B the real mount (paintDrake) over the 'ash' sky.
- `src/transitions.js`: imports the rows into TABLE; `forceSkip(tl)`. The rows are CHAIN rows (`chain: true`): when the pictures do not play (replay / NEVER / ?trans=0) they are never dropped, they start already skipped = a short fade, then the same next stop. So the road holds in every setting.
- `src/main.js` (small hooks): trnBegin (plays vs chain, a row that opens on its scene, mapOnly targets, no needs check for chain rows), trnAmbient, the scene cues from the scene clock, trnFinish keeps the map where it was for a hidden lab, scene draw dispatch, `env.text` for the card, `skyWon()` (the King's hand-off), respawn restarts the sky fight, no King HUD over a scene.
- `src/demon-king-hands.js`: `WON_AFTER` 2.6 s after his 'beaten' (the scream and the crash play) -> `ctx.won()` once; `restart()`. `src/sky-mount-hands.js`: `restart()`.
- `src/redraw/sky_layers_art.js` (S4's file): the ash lightning flash was a hard-edged 120x150 rectangle; now a soft radial glow (visible in the scene B shots).
- `tools/demo-transitions.mjs`: its generic row loops skip chain rows (pinned by the new tool). `tools/demon-king.mjs`: the HUD source check accepts the `!TRN` guard.
- NEW `tools/heart-scenes.mjs` (node check, 97 ok) and `tools/heart-scenes-shots.mjs` (walks the road in one headless Chrome, shoots, checks).

## The flow, as built
1. drakelab: hp 0 -> the drake is spared, BEATEN (draketune), the shrine is set by the split seal; `queenDies` -> bossWon -> `winLevel(); trnBegin()`: the clear is credited FIRST.
2. SCENE A "THE SEAL BREAKS": light up the cracks (white flash, +1 s of shake), the laugh, black fire, the King half-formed rises out of it, hangs and laughs, climbs out the top; the volcano erupts; the drake lifts its head, stands, kneels its neck; you climb on; it takes off. Fade. Any press skips (after 0.8 s).
3. skylab loads fresh = MOUNT-UP. The checkpoint: a death in the sky fight restarts the fight at mount-up (a fresh King, the back at phase 1, everyone back on it; respawn's deathRefill refills the flasks); it never replays the drake. (`checkpointOf`; in-browser check: King at 1500 hp -> dead -> fresh 3600/3600.)
4. The King's last return -> 'beaten' -> 2.6 s -> `skyWon()` credits the clear and starts SCENE B.
5. SCENE B "THE ESCAPE": he lies on the neck, you run up the back, the drake twists its head and blasts him off, he catches himself on smoke wings, laughs, dives; the camera tips down after him (the drake leaves the top of the frame), the crater cracks open (THE BREACH, corruption pours down the cone), the drake glides back in and lands on the rim, you walk back along it and drop onto the rim, THE BREACH card ("HE IS NOT DONE. NOR ARE YOU."), fade, THE MAP (endOnMap + mapOnly; nothing auto-loads).
6. REPLAY (transSeen set, or TRANSITIONS = NEVER): both rows still carry the road, no pictures: drakelab -> skylab, King's fall -> map (browser-checked).

## Checks run
node: heart-scenes 97 ok (rows, timelines, a skip at every moment, forceSkip, policy, endOnMap, checkpoint, the King hand-off once + restart via the REAL hands with a stub ctx, beats in story order, every cue is a real SFX and fires once, 1-4 seats stay on screen, wiring by source); demo-transitions 113 green; transition-woodmarsh 31 green; demon-king 262 ok; sky-mount 175 ok; fire-drake 78 ok; fire-drake-hands 307 ok (draketune's report said 336: the files are byte-identical to claude/draketune, so it is a counting difference, not a regression); node --check on every touched src file.
browser (one headless Chrome at a time, 2.4-6 GB free, no flags): `node tools/heart-scenes-shots.mjs` solo, and `--reduce --seats=3`: both green (scene A began by itself off the drake's defeat, the clear credited before it, the sky fight loads, the checkpoint restarts it, scene B begins by itself off the King's fall, ends ON THE MAP, replay A and B skip the pictures; page errors: none).
NOT run: tools/check.mjs / the full suite (told not to); no boss win-rate runs (not in the brief).

## Shots (scratch\lane-reports\scenes-*.png; r = reduce-motion, s3 = 3 seats)
A: a0-lies, a1-light, a2-fire, a3-king, a4-erupt, a5-stir, a6-kneel, a7-climb, a8-takeoff, a9-mounted. B: b0-neck, b1-run, b2-twist, b3-blast, b4-flung, b5-wings, b6-pan, b7-dive, b8-crack, b9-glide, b10-land, b11-stepoff, b12-card, b11-map (the map it ends on). Also scenes-rs3-* (reduce + 3 seats).

## Owed
- THE HEART LEVEL (a later lane) must: name its own ids in rows (`from`/`to` of the two rows in `heart-scenes.js` ROWS and `checkpointOf`), set its TIER/TIER_BOSS/ACTS_LATE rows, and give the drake room + sky fight their real level; `checkpointOf` already accepts 'heart-sky' as a placeholder.
- A map node for THE BREACH (the Demon act map lane): scene B's `to: 'breach'` is only a node id; until it exists the map keeps where it was. When the node exists `mapSpurLit` lights it (existing code).
- Art polish for S4: a real KNEEL pose for the drake (scene A shows its 'walk' pose with the head low), the rim reads weakly in scene B (rimLanding is a 230 px strip: it ends in a hard right edge under the drake's belly), the crater/cone in B is a flat silhouette with line-work, the King's 'dive' reuses his 'flat' swoop pose. The hero's drop onto the rim has no landing sound (cue 'pStep' only).
- Sounds are the existing synths (dkLaugh, dkBlast, dkEruption, drakeBank, drakeWing ...), placed by time; Daniel to hear it. No music cue of its own: the game plays the level theme after the boss falls and the scenes sit on that (a scene track is owed to the audio lane).
- Browser pass of the 4-seat and the AI-partner case beyond the 3-seat reduce run; the touch skip hint (existing overlay).

## Questions for Daniel (rec built)
1. Scene lengths: A 11 s, B 17 s (13.6 s of picture + 3.4 s on the card). REC keep: both skip after 0.8 s and play once per save (FIRST TIME). Trim B's glide if it drags.
2. The King hand-off is 2.6 s after his last fall (scream + crash first). REC keep.
3. Replay of the sky fight after the scene (a death) restarts at mount-up, never at the drake. REC keep (the plan's rec 2).
4. THE BREACH card text: "THE BREACH" / "HE IS NOT DONE. NOR ARE YOU." REC keep exactly (from the plan); one card only, no dialogue in either scene.
