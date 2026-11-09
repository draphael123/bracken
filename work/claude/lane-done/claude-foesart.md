# foesart - real art for the six new foes (11-08), CODE-ONLY, flags OFF
Branch `claude/foesart` (off claude/foes fcd67bd0f), worktree `bracken-lanes/bracken-foesart`, commit **c03b4e937**, pushed. Not merged, not deployed. No browser, no suite.

## What changed
- `src/redraw/beasts_art.js` rewritten: SNOWRUNNER (13 frames, 34x24), GREYMANE (14, 44x28), BRUIN (16, 56x50) and `bruinfrost` (now its OWN coat: pale grizzled ramp, dark saddle, not a tint). Same frame lists, same exports, ax/ay/w/h hit boxes unchanged.
  Shared form shader exported from this file (taper capsules lit above-front, 5-step cool-shadow/warm-light ramp, 4x4 dither, limb-tied fur noise, two-bone leg IK, fur tufts, rim light).
  Tells are built as SILHOUETTES (snap = belly-low coil, ears flat; leap = reared up on the hind legs; bite = head dropped jaws wide; pounce = hindquarters tucked; bear roar = full reared height, both paws up; charge = head down, paw dragging).
- `src/redraw/bones_art.js` rewritten (imports the shader): SOLDIER 13, ARCHER 12, MAGE 14 frames, 34x34 / 36x34 / 36x36. Fix for note 3: lightest thing in the wood, 2-bone-thick limbs, bright lit rim on top/front edges, and a colour each: soldier red tabard + rimmed iron/wood shield, archer rust scarf + quiver + pale bow, mage pale teal robe with lit hem + glowing orb.
- `src/main.js` (1 tagged line + guard): `drawTellFlash` skips the six new foe ids (`NEWFOE_POSED`). Flag-off behaviour unchanged (they spawn only from the pen/tools).
- `tools/beasts.mjs`: +6 checks, facing at release.

## Note 1 - cause of the white-silhouette tell
The whole-silhouette white is the ENGINE's windup opener `drawTellFlash` (main.js: draws the white frame when `time - e._twAt < 0.04`). `tellClock` re-zeroes `_twAt` whenever the draw has not run for 0.3 s or the mode changed, so in tools/foes-shots.mjs (sim-only frames, then ONE draw per still) every still is a "first draw" and lands inside the flash window. In real play it is a 3-frame flash. Not a wrong sprite frame (beastFrame/boneFrame index the real tell poses; verified). CAVEAT: I could not explain statically why the `!` tells (same code path via the SIG pose) stayed readable in the stills; unverified without a browser. Fix applied regardless: the six foes no longer get the white flash (amber rim + glint still mark the windup, and the poses now differ by silhouette so a whited-out frame still reads). A flash on top of a pose would also have been fine; the owed re-stills decide.
## Note 2 - facing at release
Not reproducible in the pure step: new node checks show greymane/bruin/snowrunner face the hero at the frame the tell ends and keep it through the blow, hero on either side. The stills most likely sampled after the beast had passed the hero (the pounce lands on its ring, the charge runs through). Left as is; re-still with the knight kept clear of the lane.
## Note 3 - skeleton contrast: done (above). Note 4 - snowrunner snap tell hidden at the feet: pose is now a low belly-down coil with flat ears and a frost puff at the muzzle, readable even half behind the hero; no offset added (snap range is 40 px by design).

## Node results (all exit 0)
beasts (103+6 checks), bones, tells, answer-tags, blow-tags, level-quality mage + fallingtower, architecture, comments, one-new-foe, deploy-surface, modulepreload (no new modules), foe-pass, undead-foes. `node --check` main/beasts_art/bones_art ok. No full suite.
## Sheets (node-rendered, frames in index order, 4x)
scratch\foesart-node\: snowrunner.png greymane.png bruin.png bruinfrost.png skelsoldier.png skelarcher.png skelmage.png (render.mjs there re-makes them: `node render.mjs all 4 all 6`).

## Owed (browser)
1. `node tools/foes-shots.mjs` re-stills (ONLY=a,b PIN=<tiles> for bruin / soldier) and `tools/foes-sheets.mjs`: check tells at 1x on the dusk Stockade, the !! tells without the flash, release facing, the mage/archer against the dark trees.
2. A real-draw look at weights: Snowrunner is still the palest sprite (white wolf on snow-white act VI ground may need a darker saddle/outline); Bruin standing frames (6-8) are the roughest; heaps (frame 7) are flat. Frog King bar polish pass still welcome; bestiary portraits not drawn.
## Questions (each BUILT as the rec)
1. Skip the opening white flash for the six (built) vs keep it as an overlay on the pose - rec: skip; revisit after re-stills.
2. Canvas sizes grew (hit boxes unchanged) - rec: fine, nothing keys off sheet size.
3. Snowrunner coat: keep near-white - rec: yes, with the blue-grey saddle/tail tip for separation.
