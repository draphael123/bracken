# Lane SLIDE (Sonnet): the butt-slide

## What was found
The slope engine (src/slopes.js, tiles 20-25) already had the MOVEMENT: `slideStep` (called from the "SAND SLIDE" block in main.js updatePlayer). Hold DOWN on a slope tile and you go downhill, 700 px/s^2 times the grade, capped at 180 px/s (steep) / 140 (gentle); it ends on release, when you leave the ground (the carry/leap), or when the flat takes the speed back (under 60 px/s). It had no pose, no hit, no dust, no sound, no teaching. This lane adds those on top; it did not change the movement.

## What changed
- src/slide.js (new): the hit and the bounce. A low box ahead of the boots, one blow per foe per slide, only at 70 px/s or more. Blow = a share of one sword cut, 0.35x at 70 px/s rising to 1.1x at 180 (a 12 cut: 4 / 8 / 13 at 60-70 / 120 / 180).
  - WEAK (no or light poise bar, not a mini/big/elite; `poiseMax <= 24`): takes the blow; if it lives it is knocked flat (knockFoe + 1 s stagger); you slide on (8% slower).
  - STRONG (heavy poise, mini, big, ELITE): takes 0.7x of the blow and STOPS you: thrown back (120 px/s, small hop) and on your back for 0.9 s (`P.flatT`, folded into `stunned`: no move, jump, swing, guard, dodge, no i-frames, so the foe's own touch and swing still hurt).
  - BOSS (a maxHp body that is not a mini): chip x0.05 (min 1), and it stops you the same way.
  - Hazards untouched. Hurt or a dodge ends a slide as before.
- main.js (small): import + one hook line after the slide block; `stunned` gains `|| P.flatT > 0`; the draw chain gets the pose; ducking is off while sliding; the Pyromancer's ember flare is held off while she stands on a slope (slide wins; flat flare unchanged); first-slope teach line once per hero per save (PROG.slideTold); loadLevel clears flatT.
- chars.js: `LEGS.slide` and a 2-frame `slide` pose for knight, warden, pirate, paladin, geomancer, reaper (leaning back, legs run out level, boots toes-up, weapon trailed behind/slung; knight's kite on his back) and the Pyromancer (robe hem run out, staff slung). Every skin gets it (they share the bakers). Boots row = the standing hero's row; no pixel under the floor (boot row + one outline row). Lying "on his back" reuses the last frame of the hero's `hurt` pose.
- Dust: heel dust every ~45 ms (a coarser one on Low particles), plus a kick ahead of the boots at speed.
- audio.js: `SFX.slide` (cloth/boot scrape) and `SFX.slideHit` (thump). hint-lines.js: 'HOLD DOWN TO SLIDE: FEET FIRST' (callout). controls.js: row 'slide  HOLD DOWN ON A SLOPE' (pad: HOLD DOWN).
- tools/slide.mjs (new, in check.mjs's list).

## Rules I chose (explained)
- Start: down held on a slope tile (with or without a way). Never on flat.
- End: release down; jump (the carry into the air stays: a jump is always available and keeps its leap); reaching the flat does NOT end it at once: with down still held it skids and bleeds off (150 px/s^2) and ends under 60 px/s; with down released it ends at once. That is the engine's existing, tested behaviour (tools/slopes.mjs asserts the carry); I kept it. The hit/pose follow the slide state, so a skid on the flat is still a seated slide.
- Pyromancer: on a slope DOWN is the slide, the flare TAP is off there only; on flat ground the tap and the weak guard are as before.

## Numbers (tools/slide.mjs, Sunken Caravan steep dune, knight)
- Slide tops out at 180 px/s against a walk of 101 (+78%); sliding starts 0 frames on flat, 20+ on the dune.
- Sprig (weak, hp 48): hp 48 -> 37, knocked flat, hero keeps sliding. Brute (strong, hp 79): 79 -> 71, hero thrown back vx 180 -> -120, flat 0.9 s. Elite and mini likewise (hp 48 -> 40). Boss stand-in (maxHp 400): 400 -> 399 (chip 1), hero stopped.
- Pose: 7 heroes x 18 skins x 2 frames = 252 frames measured.

## Checks (all run on branch claude/slide)
Green: slide, slopes, slopes-trace (every frame of every traced level identical: the slide is player input and the traced levels have no slopes), duck, crouch-feet, crouch-a, crouch-b, ember-flare, attack-animation, ability-poses, skins, hint-shown, audio-assets, textfit, settings-tabs, architecture, dangling-paths (after the commit).
New check proved red on master (d87b209a, detached worktree): 160 assertion failures (no slide starts, no pose, no hit, flare fires on the slope, no src/slide.js).

## UNVERIFIED
- No human playtest of how the pose looks in motion or how the 0.9 s on-your-back window feels; the pose was inspected as a 5x sprite sheet only.
- No real boss was slid into: the boss case is a maxHp stand-in (the rule reads `maxHp && !mini`, as the poise code does).
- Elite verified by setting `elite` on a sprig (real elite spawns go through eliteMake, the same flag).
- Not tested in co-op or on the Fair level (FAIRFIX3's area; it has slopes, so the slide works there by the same code).
- tools/slide.mjs: a jump test run directly before a foe lap left the next lap's slide late, so the jump test runs last. I did not find the cause; it did not reproduce outside the tool's scripted key presses (suspected leftover scripted jump buffer).
- Flying/high foes: the box is at boot height (10 px), so a foe above that is not hit.

## QUESTIONS FOR DANIEL (recommendation built)
1. Should the slide END the moment the flat is reached (as in your brief) instead of the existing skid? Built: the existing skid (down held on the flat keeps a bleeding slide to 60 px/s), because the slopes check and the "leap off the foot" feel depend on it. Rec: keep; if you want a hard stop, one line in slideStep.
2. Is 0.9 s on your back right? Built 0.9 s with no i-frames. Rec: keep; 0.6 s if it feels cruel.
3. Should the sliding hero be shorter (a low hurt box, so some high blows go over)? Not built (it is a balance change). Rec: yes later, reuse the duck box.
4. Strong foes take 0.7x of the blow and elites the same; a sprig-tier foe can survive a 180 px/s slide (11 of 48). Rec: keep: "knocked flat" is the intended result for anything above one-hit hp.
5. Should slide hits count for the Pyromancer's heat or other on-hit talents? Built: yes by default (it goes through hurtEnemy like any blow). Rec: keep.
