# claude/beastsart - real art for the six BEASTSBONES foes (code only, flags OFF)
Branch claude/beastsart off claude/beastsbones (df1cb168a); worktree bracken-lanes/bracken-beastsart. Not merged, not deployed. No browser, no check.mjs.

## What was done
The 11-08 foesart lane (c03b4e937 on claude/foes) had already drawn all six foes to the Frog King bar (form-shader capsules, 5-step cool/warm ramps, dither, IK legs, fur tufts, rim light, silhouette tells) but on a lineage that never reached beastsbones. This lane CHERRY-PICKED it and fitted it to this build:
- src/redraw/beasts_art.js: SNOWRUNNER 13f (34x24), GREYMANE 14f (44x28), BRUIN 16f (56x50) + bakeBruinFrost (own grizzled coat). Frame lists identical to the beastsbones beastFrame map; hit boxes (18x10 / 26x15 / 28x16) unchanged. Tells are silhouettes (snap = belly-low coil, leap = reared, bite = head dropped jaws wide, pounce = hindquarters tucked, roar = full-height both paws up, charge = head down, paw dragging). Pin / winded / dazed / hurt / death all have frames.
- src/redraw/bones_art.js: SOLDIER 13f, ARCHER 12f, MAGE 14f (34x34 / 36x34 / 36x36, hit box 10x20). The art was drawn in the foes-branch order (hurt 6, heap 7, poses 8+); each bake now re-lists its frames (`remap`) to the boneFrame map in src/bones-hands.js (poses 6.., hurt then heap last). bakeSkeleton* aliases added for main.js. Soldier: red tabard, rimmed shield, thrust / rush / parried poses; archer: rust scarf, pale bow, aim / loose / volley; mage: teal robe, glowing orb, wisp / cast / grave kneel / blink out / in. Grave-brown bone with lit rim, green ember sockets (not the desert tomb guard).
- src/main.js: one line, drawTellFlash skips the six ids (NEWFOE_POSED, using this branch's BSS/BNS imports) so the tell pose shows instead of a whole white silhouette.
- tools/beasts.mjs / bones.mjs: "placeholder" wording -> "real art"; beasts.mjs also checks bakeBruinFrost bakes 16 frames.
No gameplay numbers, ids, frame counts or flags changed (BEASTS_SHIPS / BONES_SHIPS stay false).

## Checks run (node only)
beasts, bones (all ok; include frame-index-on-sheet and tell/blow pose checks), tells, blow-tags, foe-pass, death-fx, one-new-foe, comments, architecture, node --check main.js / art files. Contact sheet: scratch/lane-reports/beastsart-sheet.png (all 98 frames at 2x; per-foe 4x sheets in scratch/beastsart-node/, `node scratch/beastsart-render.mjs all 4 all 7`).

## Owed
1. Browser stills at the Frog King bar (`?dev=1&pen=all`, tools/foes-shots.mjs style): tells at 1x on dusk Stockade, release facing, soldier/archer/mage against dark trees. Bruin standing frames (6-8) are the roughest; heaps flat; snowrunner is pale on snow (may want a darker saddle).
2. Then n=6 fightLab per the beastsbones report.
3. Not built: bruinfrost wiring (cnSkin:'frost' still absent in main.js; sprite bakes but nothing spawns it), bestiary portraits, bespoke SFX, mountain placements.
## Questions (rec built)
1. Reuse foesart's art by cherry-pick + frame remap rather than redraw: rec yes (same bar, zero new risk to frame maps).
2. Skip the white opening flash for the six: rec yes, revisit after stills.
