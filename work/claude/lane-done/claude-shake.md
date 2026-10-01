# Lane SHAKE (Sonnet): the camera shakes only when you are hurt

## What changed
- New setting field `SET.shakeMode`: `off` / `hit` (default, "ON HIT") / `full`. The Settings row "Screen shake" cycles OFF / ON HIT / FULL.
- The old LOW/FULL amount is kept as its own row, "Shake strength" (LOW / FULL), right under it in the Display tab (it applies to ON HIT and FULL). Chosen over one 4-way row because the mode and the strength are two different questions and each reads plainly.
- `shakeCam(n, k, tag)` in src/main.js: ON HIT lets through only a shake tagged `'hurt'`. No other call site was edited. Exactly three are tagged: the hero taking a blow (damagePlayer0), going down in co-op (goDown), and dying (die). Every other shake in the game (landings, plunges, boss slams, explosions, foe hits, quakes, the Paladin hammer, blocks and parries) is silent in ON HIT. Shakes from other modules arrive through the untagged `shakeCam(n, k)` wrappers, so they are silent too.
- `zoomKick` (the zoom pop that rides with those shakes) is FULL-only.
- FULL is the previous behaviour: same `shakeAdd` budget, same amounts. Reduce motion and OFF are still none, even for a hurt.
- Migration (readSettings): a save with no `shakeMode` becomes ON HIT, unless it had shake OFF (`shake:false` or `shakeAmt:0`), which stays OFF. The old LOW strength is kept; an old 0 strength becomes 1 (so turning the mode back on does not give nothing). A save that already has a mode is untouched.
- `BK.shakeCam` is exposed for the check. src/settings-ui.js has the new row on the Display tab.

## Checks
- New `tools/shake-mode.mjs` (in check.mjs): static count of the three tags; in page ON HIT: landing, plunge, foe hit and a 10-size slam shake 0, a hurt shakes 5; FULL: all shake (land 1.7, plunge 3.6, foe hit 4.9, slam 10, hurt 5), LOW halves; OFF and reduce motion: all 0 including hurt; six migration cases. Proven to FAIL on master d87b209a (with only BK.shakeCam added): ON HIT shook on every event, OFF shook, old shake-off saves became ON HIT-equivalents.
- tools/juice.mjs now sets `shakeMode = 'full'` (it tests the full shake table).
- GREEN: shake-mode, settings-tabs, juice, architecture, hint-shown, frame-cost, textfit settings scope (settings screens all fit; the one COLLIDE is the pre-existing pyro controls hint at main.js ~27211, not mine), dangling-paths (see commit).

## UNVERIFIED
- Not played by hand. Boss slams were proved through the raw call, not each boss. The audit tools (audit-feel) now read 0 shake on foe hits in default mode; they are reports, not checks.

## QUESTIONS FOR DANIEL
1. Should a BLOCKED hit (guard clank / guard break, which is not damage) shake in ON HIT? Built: NO, silent (only real damage, down and death shake). Recommendation: keep silent.
2. Death by a pit/fall or drown also shakes (it is a "hurt"). Built: yes, via die(). Recommendation: keep.
3. Zoom pop: built as FULL-only. Recommendation: keep.
