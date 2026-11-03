# GEOMANCER DODGE (claude/geododge, off claude/batch141 828f83af)
Branch tip: see `git -C bracken-geododge log -1` (WIP f4cfd947 + report commit). Not merged, not deployed.

## 1. Ground dodge (the BURROW) ~21% longer
Distance travelled on open floor (dodge start to end, measured in the real page, tools/geododge-capture.mjs):
- before 36.4 px  (ROLL_LEN 0.30 s, burrow pace 190)
- after  44.0 px  (+21%)  (ROLL_LEN geomancer 0.30 -> 0.33 s, burrow pace 190 -> 220)
- i-frames kept proportional: 0.26 s of 0.30 before; now 0.286 s of 0.33 (same 0.044 s hittable tail). The old cap (rollInv 0.26 flat) would have grown the tail.
- Stamina cost / cooldown (0.5 s) unchanged. Knight reference on the same floor: 43.1 px, so she now matches it (she was 15% shorter).
- Side effect: ROLL_LEN geomancer also feeds her swim/ceiling roll (0.33 s) - fine.

## 2. Air dodge (THE STONE SHRUG, src/hero-pass.js) - what read odd, and the fix
Captured her air dodge beside knight, ranger, pyro (same jump, dodge pressed 6 steps in): before/air-*.gif.
Telemetry before (px / steps at 60 Hz): knight 63.9 px in 18 steps, pyro 83 px / 21, ranger -39 px (backflip) / 21, GEOMANCER 15 px in 24 steps (0.4 s).
What reads odd:
1. She is locked 0.4 s (others 0.30-0.35 s): the longest air-control lock in the game for the move that moves least.
2. Her momentum is killed (vx x0.25): from a run-jump she brakes to a quarter pace mid-air, then the lock ends with no carry - reads as a stall, not a dodge (no other hero stops).
3. The shared air-dodge code still threw the whoosh: dash streaks and the after-image ghosts, i.e. the picture said "dash" while the body hung still and the stone skin said "shrug".
Fix (keeps her identity - no grace, first blow shrugged whole, no dash attack out of it):
- shrug length 0.40 -> 0.30 s (= the knight/shared air lock; also the shrug's guard window is 0.30 s now),
- carry 0.25 -> 0.50 of the dodge pace (peak vx 63 -> 129 px/s; travel 15 -> 27 px),
- no dash streaks and no after-images during the shrug (only the stone skin, the ring and the chips).
After: geomancer 27.1 px in 18 steps, same lock as the knight (18 steps). Knight/ranger/pyro unchanged (63.9 / -39.2 / 83.1 px).

## GIFs (scratch\lane-reports\geododge\)
before\air-geomancer.gif, air-knight.gif, air-ranger.gif, air-pyro.gif, ground-geomancer.gif, ground-knight.gif
after\ (same names; knight/ranger/pyro are identical controls). All ~0.2 MB. 3x scale, 30 fps, anchored on the take-off point.
Best pair: before\air-geomancer.gif vs after\air-geomancer.gif (with air-knight.gif as the reference); ground: before\ground-geomancer.gif vs after\ground-geomancer.gif.
Telemetry: before\before-telemetry.json, after\after-telemetry.json. No side-by-side composite built (skipped to keep the browser short).
New tool: tools/geododge-capture.mjs (node tools/geododge-capture.mjs before|after <outDir>; includes a small GIF encoder).

## Checks
- tools/geomancer.mjs: PASS (all asserts, incl. burrow / swim / ceiling dodges).
- tools/one-dodge.mjs: PASS (gFloor burrow, gAir shrug: no dash, no grace).
- tools/hero-pass.mjs: PASS ("every promise holds" - shrug blocks first blow, second lands). First run crashed with a websocket error mid-run while the geomancer tool ran in parallel on the same checkout (my mistake, two browsers); rerun alone was green.
- Captures: tools/geododge-capture.mjs before + after (3 browser sessions in total, one at a time, RAM 3.3-6 GB free, closed each time).
- Not run: tools/check.mjs (forbidden), no gate. Nothing OWED beyond the full suite/gate (feel-*/combat-feel were not touched by name; grep found no other tool referencing ROLL_LEN/burrow besides those above, and the cistern/desert/etc. hits are the word "burrow" for foes).

## Questions (each with my rec; built already)
1. Is the ground dodge +21% (36 -> 44 px, now equal to the knight's 43) right? Rec: yes. For +25% set burrow pace 226.
2. Is "shrug keeps half her momentum, 0.30 s" enough, or should the air dodge actually dash (like every other hero) and drop the stone shrug? Rec: keep the shrug (it is her kit identity from heropassa); only if Daniel still dislikes it, give her a real half-distance air dash that keeps the shrug's first-blow guard. Not built.
3. I only had telemetry + frame GIFs (could not view GIFs myself); please eyeball before\air-geomancer.gif vs after\air-geomancer.gif - if the pose gShrug (hunched, stave across shoulders) is what reads odd, that is an art pass, not a numbers one.
