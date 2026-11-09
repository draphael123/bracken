# gqmusic lane report (Daniel 11-08): the Goblin Queen's tower-top music

Branch claude/gqmusic (from origin/claude/hcship 8ce638b16). Code commit 492ae374c; a report commit follows it (branch head). No Chrome used. Not merged, not deployed.

## What changed
- src/audio.js:756 `music.lift(on)`: now `on === 2 ? 1.10 : on ? 1.06 : 1`. lift(true)/lift(1)/lift(false) behave as before (Gorm's call is untouched). The stinger fires only on a step UP (lift(false) is silent, as before).
- src/gqueen-hands.js:44-49 `musicLift` / `roofMus` / `H.musicLevel` (the lift state, kept on S.roof.mus so it survives a co-op wipe and revive).
- src/gqueen-hands.js:232 roof 'wake' -> 'roofStand' (the THE TOWER TOP card ends): `roofMus(1)`. This is after bossStart's own music.play('gqjudge') at +1.1 s, which resets the rate; the wake card runs 1.6 s, so the lift lands on the live track.
- src/gqueen-hands.js:267 stormTell release (her crown starts circling her, under 30%): `roofMus(2)`. It is sticky: a parry that breaks the storm does not drop the tension.
- src/gqueen-hands.js:~613 H.update guard: lift(0) when she is dead, stage is no longer 'roof', bossActive is false, or every hero is down; re-lifts to the stored level when a hero is up again in the same roof stage.
- src/gqueen-hands.js:43,57 H.load and H.reset call lift(0).
- src/main.js:30523 makeGQueenHands ctx gets `lift: n => music.lift && music.lift(n)` (guarded in the hands, so old stubs without it still work).
- tools/gqmusic.mjs (new, 30 asserts), tools/check.mjs list: 'gqmusic' next to 'gq2mech'.

## Rates and stinger
- Step 1 x1.06 (Gorm's): low saw fifths 110/164.8/220 under a noise swell (cutoff 900).
- Step 2 x1.10: higher, tighter saw fifths 146.8/220/329.6 (0.7 s) under a brighter, shorter noise swell (cutoff 1500, gain 0.16). No filter/drive change (kept modest).

## Reset paths covered
Her death (q() null / not alive / hp <= 0), player death (all heroes down; co-op revive re-lifts), death/retry (H.reset via the level reload; also music.play resets x1 in audio.js), level load (H.load), fight ended/arena left (bossActive false: endFight, level end, quit to title paths), roof stage left (retry goes back to the escape stage). Quit-to-title and level exits also call music.play(...), which sets liftRate = 1 in audio.js regardless.

## Checks (all green, none use Chrome)
gqmusic, gq2mech, gqueen3, gorm3 (Gorm's enrage), comments, demo-cut, modulepreload (no new module). check.mjs not run.

## Notes
- Not play-heard (no browser allowed); owed: an ear check that x1.10 is not too much on gqjudge (one constant in audio.js:756).

READY
