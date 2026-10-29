# LANE BKBLOODART (sonnet) - Blood Knight blood art pass, 2026-10-26
Branch claude/bkbloodart off claude/bkblood 80011d30. Art only: no gameplay or number changes; reduce-motion and flashes-off kept (calm path: steady tint, no flare pulse, straight whip, no crack flash/splash flash).
## Done (art list from scratch/lane-reports/bkblood.md)
- Blood Lash pose redrawn (chars.js F.bloodLash): haul high with blood run down the fuller, snap with a smear arc, crack at full stretch with a white-hot star (frames widened so it is not clipped), drop with a wet string and floor spatter.
- Whip is now a baked sprite strip (thick/mid/thin wet body, hot tip, 2-frame crack flash), rooted on the blade point of the current frame (main.js bkWhipSprites/drawBkBlood).
- Blood stream: a dark-rimmed red ribbon with a pale thread, haloed drops (additive), splash of specks at his chest; max 8 streams. Reads in dark Stockade.
- Frenzy: plate tint (drawTinted red over the frame, ramps in/out) + flaring helm lights (halo, burning eyes, rays); ellipse aura removed; motes kept.
- Sword drip aligned to each frame's blade point (c.wp.t from the baker via bkBladePoint; idle point is ~18 px out, old offset was 9-12).
- VITAE bar has its own blood-drop icon (the sword icon is gone).
- Blood floor decals: flat 1-2 px splats on the ground under bled foes/lash/big drinks; cap 24, 4-6 s life with fade, fillRects only, culled offscreen, halved on 'few' particles.
- NOT added: armour veins (not picked).
## Checks (one headless browser at a time, PORT 6605, RAM 4.5-6.3 GB free)
GREEN: blood-kit, ability-poses (77/77), attack-animation, hero-roster, textfit hud --strict (0 issues), mobile-perf (inside budget at 4x CPU). There is no tools/pixels script in this tree (nothing to run). Rates not re-measured (art only).
## Stills (scratch/lane-reports/bkbloodart-*.png, also work/claude/lane-done/)
before: lash-before, stream-before, hud-before, frenzy-before (from bkblood). after: lash14/20/26, rally-drink22 (stream), rally-decals, frenzy-hud, frenzy-cut-b20 (tint), idle-drip2, rally-hud, pose-sheet (all bloodLash beats + idle/run with green blade-tip markers). Regenerate: PORT=<p> node tools/bkblood-shots.mjs <dir> <prefix> (extended with decals, helm, drip shots).
## QUESTIONS FOR DANIEL
1. Vitae icon is a blood drop (rec) vs a chalice - built the drop. 2. Decal life ~5 s, cap 24 - keep? rec yes.
3. Helm-flare eye position is a fixed offset (px-1, py-16); the frenzy-start still catches the ring burst, so a closer look at the helm in motion is worth one playtest glance.
