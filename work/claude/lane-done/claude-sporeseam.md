# claude/sporeseam - STOPPED EARLY (credits). Investigation + plan only; NO level/game changes made.

## Done
- tools/seam-shots.mjs (new, not in suite): stills at the Mother's door, past the arena, and Kingswood's opening. Run: `PORT=8697 node tools/seam-shots.mjs <suffix>`.
- Before-stills in docs/seam/ (spore-door, spore-out, kings-start, kings-caps, kings-hall). Note: the "+XP catching up" banner covers the top; sim longer before the shot.

## Not done (all of it): climb-out, camp foreshadow, Kingswood opening blend, story line. Findings for whoever continues:
- Sporewood ends at the boss: winLevel() fires on Mother death. A walkable climb needs `gateAfterBoss: true` on the level return plus `ent('gate', x, row)` (existing mechanic, src/main.js ~24458/9443) and one line in respawn() (src/main.js ~3830): `if (L.gateAfterBoss) L.gateOpen = false;` so a retry cannot reuse an open gate. No checkpoint after the arena (death on the climb = refight), so keep the climb foe-free; I'd skip placing goblin foes there (QUESTION: want a post-boss checkpoint + 1-2 scouts?).
- Final Sporewood is W=552; arena wallR=536; tail 537-551 flat at row 20. Screens are 320px = 20 tiles. Plan: +48 cols (W=600) stepped up to row 11 (steps <=2), gate near col 594.
- To avoid rerolling the whole level's garrison/dress sprinkle (row-major rng, changes with W), extend AFTER the pipeline: add an outermost wrapper after src/level.js line ~8533 (`lv.build = ...thinCheckpoints(groundCheckpoints(...))`) for ids spore/kings, from a new module (pass T, TS in; level.js imports it).
- Palette blend tools that already exist: `L.tints` ([x0,x1,rgb,a] tiles, 24-tile crossfade; spore's last tint [420,W) pink must be shortened; kings has none: use x0=-24 for full strength at start), weather zones (only 'spore'/'rain'/'pollen'/'glitter'/'wind' kinds are read; 'leaves' is ignored), ambient zones (drip -> forest). Kingswood (dress 'wood') already gets screen-space sun shafts; Sporewood needs `L.palette.dress==='wood'`-style shafts via a small main.js edit near line 28512 (scale by camera x). Ground skin is global `palette.myc` (main.js ~1131-1177): a per-column `L.mycEnd` is the small engine change to get plain earth in the climb; backdrop 'mushroom' near layer is global too (accept, or fade with tints).
- Dressing allowlist: add to ALLOWED_DECORATIONS.spore: warnPost, gobPennant, stakeFence, trophyRack, tent, trunk, flower, bushDeco, fern; to .kings: sporePod, mushroom, moss, rootDecor, tinyCap. Hand-placed decos go in final columns. Existing GOBLIN_CAMP table (level.js ~8150) is the in-pipeline way (would reroll sprinkle).
- Story line: LEVELS kings `sub` is the map-card blurb (paginates 2.4 s a page, no length limit): set to e.g. 'up from the deep fungus, the goblins made a court of the old wood'.
- After geometry changes: re-stamp level1-pilot (docs/level1-pilot.json via tools/level1-pilot.mjs --write) and mash rows (tools/mash-bot.mjs, level then boss) for spore; run spore/kings/level-quality/checkpoints/checkpoint-gaps/signs/textfit/floaters/dressing checks.

## Reds: none run (no code changed).
