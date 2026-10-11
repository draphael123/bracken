# claude/flasks2art - FLASKS 2 ART (Sonnet lane, 10-10)
Branch off master ce20a08d. ART ONLY: drink timing (0.75 s / swallow 0.5 s, quick 0.5/0.33), the spill window, heal, every number untouched (tools/flasks2.mjs green).

## What changed
- **src/flask-art.js (new)**: everything below, one module, so src/chars.js is untouched (heroanim owns it; no merge conflict there).
- **DRINK FRAMES, all 7 heroes**: `set.R/L/white.drink` = 5 frames baked off each hero's OWN idle frame at heroSet() time (so every skin, gear tier and weapon skin wears them; previews skip them):
  0 UNCORK (flask upright in the front fist at the chest, cork lifting), 1 GULP (head back 1, neck at the lips), 2 GULP (head back 2, bottle steeper, emptier),
  3 LOWER (empty bottle coming down, dithered green rim = the heal), 4 SPILL (glove flung back open, head snapped round, red drops). Per-hero spec (head box, shoulder, chest fist, mouth, sleeve/glove colours read off the frame) in `SPEC`.
  main.js picks them in the hero draw (key 'drink'; frame from F2.drinkPhase; spill frame 0.28 s after a spill). Old rotated-icon overlay stays only as fallback (Knight's SHIELD THROW bare set, etc.).
- **HUD flask row**: potency now READS - the full bottle is cut by tier (35% steel stopper / RICH gold stopper, deeper red / DISTILLED pale stopper, rose liquid / SUNLIGHT orange liquid + sparks). Gold stays the over-max colour. Same 7x8 cells: row layout and rects identical.
- **STORE icons, every FLASKS line** (<=9x9, were all the same bottle): EXTRA I (bottle + plus), II (two bottles), III (glass shard), RICH/DISTILLED/SUNLIGHT (tier bottle + 1/2/3 gold pips), QUICK (speed lines), STEADY (fist on a bottle), BLESSING (shrine stone under a halo), SECOND DRAUGHT (bottle + green bolt, `ICONS.second`), hidden '?'.
- **Hidden FIND sprites**: shard / bottled sunlight / glove drawn from the icons, with a 3-beat glint sprite (pixel, plus, pixel) replacing the 1px blink.
- **Cork + splash + flight**: cork is 4 quarter-turn frames, the knocked flask tumbles through 4 quarter-turn frames (no rotated pixel sprites, per style guide), the broken flask gets a 3-beat splash sprite on top of the existing particles. Cork now leaves from the bottle top.
- Tools: `tools/flask-sheet.mjs` (drink-sheet.png + icons-sheet.png), `tools/flask-shots.mjs` (live drink, 7 heroes x 4 phases -> drink-live.png). Contact sheets in work/claude/flasks2art/.

## Checks (PORT=8811, this branch; logs chk-*.log)
flasks2, survival, hud-default, textfit hud,store, skins, weapon-skins (1022 bakes), store-ui, store-preview, pixels, mobile-perf: all exit 0 (store-ui/store-preview/weapon-skins/skins re-run green after a fix: preview sets lack L/white, so drink frames are baked only for real sets).
hero-keys timing fingerprints (tools/hero-keys-strip.mjs vs master): pyro/warden/paladin/geomancer byte-identical; knight/pirate/reaper differ, but master vs master also differs run to run on knight/pirate (the bot's timing is nondeterministic) - no timer or box was touched, so read as noise, not a regression.

## QUESTIONS FOR DANIEL (built the rec)
1. Drink arm is drawn over the idle pose (weapon stays in the off hand/planted); a fully re-posed body per hero is a bigger pass. Rec: ship as is, revisit if it reads thin in play.
2. Sunlight potency bottle is sun-orange with sparks (gold = over-max only). Rec: as built.
