# SMALLFIX lane (Sonnet): boss-screen text and crouch weapons under the floor

Branch claude/smallfix, from master 6b12a26c.

## 1. Boss-screen text (found by `node tools/textfit.mjs --strict`)

| Screen | Cause | Fix (src/main.js) |
|---|---|---|
| Hurricane "THE WAY IS OPEN" over "SEA TO PORT / HOLD ON" | the sea-warning plate sat at y 50/70, the captain's banner at VH*0.26: they overlapped | the sea plate steps under the banner while it is up (`wy` = max of its old row and the banner's bottom + 3) |
| Hanging mini "CUT" 1500 px offscreen | the dead-bough's CUT label was drawn whenever the Reeve was under the bough's x, wherever the peg was | drawn only when the peg label is on the screen |
| Flotilla "X" at x -26 | the cannon's X was drawn while the player was near it in world x, even when the gun was off the left edge | drawn only over a gun that is on screen |
| Witchlight "-20" over "LV 0 x3" | a damage number floats up from the hero; with the hero at the top-left of a tall level it lands on the HUD plate and the level label | numbers are set just under the HUD plates (hudRects, the same rule the tells use) |
| Oreroad "THE KING'S CHAMPION" (also flagged, not in the brief) | not a text bug: the banner bar was not counted as the plate, so a 50x9 world rect behind it was read as the plate | see the textfit change below |

Before (master, `textfit bossfix --strict` with the new screen): OFFSCREEN 2 (CUT x9, X x7), COLLIDE 2 (-20 x LV 0 x3 x10; HOLD ON x THE WAY IS OPEN x2).
After: OVERFLOW 0, OFFSCREEN 0, CLIPPED 0, TRUNCATED 0, COVERS 0, COLLIDE 0, ERROR 0 (225 screens).

tools/textfit.mjs:
- new screen `bossfix`: the boss fights of hurricane, oreroad, hanging, flotilla, witchlight (about 40 s) plus a "-20" set on the HUD label in each of those five levels. Added to the textfit screen list in tools/check.mjs, so the suite's `--strict` run now holds all of these. The long `boss` screen (every level, 5 min) is unchanged and still not in the suite.
- plate rule: a full-width bar up to 40 px tall (the captain banner) now counts as the plate behind the words laid over it. Before, only plates narrower than the screen did, so the Oreroad banner's sub-line was measured against an unrelated 50x9 world rectangle. This is a fix of a false positive, not a loosened threshold: on master the new check still finds the other four (the Hurricane OVERFLOW is now reported as the COLLIDE it really is).
- Not fixed (out of the brief, pre-existing in the full `--strict` run, which is why it cannot be a suite check yet): 29 OVERFLOW (28 bestiary names +7 px, hero pick GEOMANCER +13 px), 1 TRUNCATED (bossjump "MASKWRIGHT'S THEATRE"). See QUESTIONS.

## 2. Crouch weapons under the floor

After crouchart set the crouch body 3 px lower (legsDy 3), the weapon poses stayed placed for the old body. Measured (lowest opaque row minus the boot row, seed skin):

| hero / frame | before | after |
|---|---|---|
| knight crouch | +9 | +2 |
| warden crouch | +7 | +1 |
| pirate crouch | +6 | +1 (also the holstered pistol, holster(3) to holster(0)) |
| paladin crouch / kneel | +10 / +3 | at most +2 |
| geomancer crouch / sense | +3 / +3 | at most +2 |
| reaper crouch / harvest | +10 / +7 | +1 / +1 |
| pyromancer crouch / ember ward | +5 / +5 | at most +2 (the check proves it) |

Fix (src/chars.js): the crouch weapon is placed with rest(-5) (knight sword), rest(-4) (cutlass), rest(-6) (greatsword, maul), rest(-3) (spear) and the grip hand lifted with it; staves and the harvest blade and kneeling maul are lifted 1 to 6 px; the pyromancer's staff is lifted 4. The lane's rest(-3) alone was not enough for the long weapons (it left +3 to +4).

tools/crouch-feet.mjs now also asserts the lowest opaque pixel of every crouch/duck frame (7 heroes x 18 skins, 504 frames) is at most 2 rows under the boot row (the standing hero has 1-2 for its outline).
- master: 288 of 504 frames fail, worst 10 rows below (knight/crouch +9, warden +7, pirate +6, paladin +10, geomancer +3, reaper +10 and harvest +7, pyro +5).
- after: 0 fail, worst 2.

## Checks
See the list in the final message (run named only: textfit, crouch-feet, crouch-a, crouch-b, attack-animation, ability-poses, skins, hint-shown, dangling-paths, architecture).

## UNVERIFIED
- The crouch poses were checked on a contact sheet at half size and by pixel rows, not played with a human eye in the game. A look at the knight sword (now held forward-low) and the reaper's lifted harvest blade (no longer lying on the ground, it hovers about 5 px) is worth 30 seconds.
- The HUD damage-number shift was proven with a synthetic "-20" on the HUD's level label, not a live Witchlight hit.

## QUESTIONS FOR DANIEL
1. The paladin's STANDING idle also draws its maul 5 px under the boots (probe: idle low = boot row + 5), and the geomancer, pyromancer and pirate idle 1-2. Rec: leave idle (it reads as a planted maul on the turf); say so if you want it lifted too. Built: crouch frames only.
2. The reaper's blood-harvest blade now hovers 5 px above the turf instead of lying on it (the old pose was 7 px under the floor). Rec: keep; a flatter lying blade needs a redrawn frame.
3. The full `--strict` run still fails on 28 bestiary names (+7 px), the hero pick GEOMANCER (+13 px) and the bossjump MASKWRIGHT'S THEATRE truncation. Rec: a follow-up small lane that shortens the bestiary name font/box and puts the full-run bestiary/pick/bossjump screens in the suite once they are 0.
