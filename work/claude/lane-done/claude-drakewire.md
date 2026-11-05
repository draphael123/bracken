# DRAKEWIRE (lane D1, Opus) - THE FIRE DRAKE wired into the game (branch claude/drakewire from claude/heartplan 1ab8eecf)
Not merged, not deployed. No browser was launched for checks (see CHECKS for one accident). Mount/sky code untouched (S1 SKYMOUNT's).

## What changed
- `src/fire-drake-hands.js` (new): the drake's hands, in the style of bog-troll-hands. spawnBoss / update / take / spare / barName / read / end / clear /
  drawBoss / drawOver. Blows go to the hero KEYED once a blow (the claw is the only one a guard takes: yellow `!`; every red `!!` is unblockable). Wing gust
  push, seal cracks (stage 1/2, split at 3), the P3 tear SINKS the basalt ledges (ctx.sinkTile). GREYBOX drawing: a parametric drake that reads every POSE
  field (windup and release poses differ - B16), the chains (sag / white-hot when taut), the scorched ring (glows when taut), the seal, vents (glow -> geyser),
  magma crests, tells (breath reach, sweep band, lunge aim tick, dive red ring, gust lines, claw rake, tail sweep) and the B10 read (JERKED gold ring + bar +
  purse line, PANTING dashed ring, WARDED pale ring, SCALES clank word). SOUND: a `drake*` name per move first (for D2), then a distinct stand-in.
- BEATEN, NOT KILLED: main.js hurtEnemy0 calls `FDH.spare(e)` before the kill (e.spent, hp held at 0.01); src/fire-drake.js treats e.spent like an empty
  bar (it lands first, lunges once more, the last chain parts, falls on the seal). Only at `down` the hands call ctx.beaten (alive=false, kills, xp,
  queenDies -> the fight ends normally) and ctx.checkpoint (the shrine set beside the seal = Daniel's checkpoint between the drake and the sky fight). The body
  stays drawn on the split seal (drawOver) for scene A (lane SC).
- `src/fire-drake.js`: two one-line changes (e.spent in the beaten trigger and in takeBlow); header note. tools/fire-drake.mjs still 78 ok.
- `src/drake-caldera.js` (new) + `src/level.js`: THE CALDERA, a HIDDEN LEVELS row `drakelab` (appended under arena_yard; no needs = on no road, art before
  live). 32-tile caldera, seal at 496, two oneway basalt ledges 32 px up outside the P2 ring, shrine 8 cols before the door, dress 'none', blaze2 ambient.
- `src/main.js` - thin hooks only (13): import + `let FDH`, clear on reset, spawn case, take (wardedDamage), spare (hurtEnemy0), update, drawBoss,
  drawOver, bar name, BK.fireDrakeHands/fireDrake, the hands' ctx block + `EHP.firedrake = FD.hp` + `POISE_SKIP.add('firedrake')` (its opening is the jerk).
- `src/lab.js`: bossLab branch for boss.t 'firedrake' driving `fdPlan` (dodge/jump/guard/move/strike, no swing while resting), labRest exclusion.
- `src/boss-greed.js`: OPEN_RULE firedrake = jerked || panting; `OWN_WARD.add('firedrake')` (its own x0.5/x0.4 - never a twentieth, B15 floor).
- `src/boss-read.js`: turn word SCALES / WARDED. `src/hint-lines.js`: FD_SAY routed to the hint box (all but the 65-char rule line, which the hands
  give as a hint at the first walk, and the SCALES word).
- `tools/fire-drake-hands.mjs` (new, node, 296 checks): the room (hidden, no road, 32 tiles, bait spots inside, ledges outside P2 + over breath/sweep,
  shrine near the door, walls closed), the hands vs a stub world (sleeps until woken, keyed blows, claw blockable / red unblockable, 2 tears, ledges
  sunk, spare holds the bar, won exactly once only at `down`, checkpoint by the seal, sounds per move, every pose + overlay draws without a throw),
  and every hook present (and nothing live: no rush row, no beastSeen).
- Off-campaign skip lists given `drakelab` (as rel141 did for arena_yard): tools/one-new-foe, dressing, level-reach, audit-lib, sealed-pyramid.

## Checks run (node only)
- fire-drake 78 ok; fire-drake-hands 296 ok; fire-drake-lab --n=6 pooled 100% (model, not the band); node --check on every changed file.
- boss-greed NODE part (54 bosses, 0 fails); hint-shown SOURCE part (none new); boss-checkpoint, boss-music, level-quality, goblin-lint, one-new-foe,
  skins, dressing, ambient-landmarks, threat-holes, ambush-listed/single, answer-tags, arena-supplies (drakelab listed under 'no update function', like
  every hands boss - exit 0), bridge-props, checkpoint-stand, checkpoints, floaters, foe-footing, ground-depth, occluders, platforming-lint, push-blocks, signs: all green.
- ACCIDENT: my node batch included tools/boss-fight-end.mjs, which opens pages via sweep-pages.mjs; it ran <=60 s and was killed by timeout. I stopped the
  batch before visible-supports (also a page tool). No headless Chrome of mine was left (checked by PID/parent).

## Owed (browser - other lanes held the machine)
- bossLab n=6 per demo-band hero on `drakelab` (`BK.bossLab({bosses:['drakelab'], heroes:[...]})`) -> band 70-80% WITH flasks; mash 0/6 (lane D3).
- Page smoke: load drakelab, walk in, wake, every move drawn, a jerk read, P2/P3 tears, ledges sink, beaten -> fight ends, shrine set, body drawn down.
- boss-fight-end on drakelab (it is in its sweep now: a spared death ends the fight ~2.1 s later - inside its 5 s limit, unproven in a page).
- hint-shown RUNTIME, boss-greed page part, visible-supports, level-walk and the nightly suite (a new hidden row with an arena: any page sweep over all
  arenas now includes it).

## Questions for Daniel (rec first; the branch builds the rec)
1. Lab room as a permanent hidden LEVELS row `drakelab`? REC yes - saves count levels by index, so it stays hidden for the lab after the Heart greybox
   carries the drake (that greybox can copy src/drake-caldera.js's geometry).
2. Blows while it PANTS count as "open" for the greed reprisal (no reprisal for hitting the soft window)? REC yes (x1 window after the breath is the reward).
3. The shared greed reprisal also runs on the drake (as on the Bog Troll)? REC yes for now; D3 drops it (NO_GREED) only if bossLab shows it fights the chain rule.
4. Bestiary card + beastSeen wait for D2's art? REC yes (art before live).
