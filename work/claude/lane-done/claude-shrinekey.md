SHRINEKEY DONE 11-06 15:30 READY tip 2649fb1ea

Branch claude/shrinekey (pushed), worktree bracken-shrinekey. Not merged/deployed.

WHAT CHANGED
- R hotkey removed (src/main.js keydown). No pad/touch shortcut existed (searched controls/touch/pad). R is no longer reserved in controls.js RESERVED_KEYS (now only M), so it can be rebound.
- Pause row 'Back to shrine' now opens a YES/NO card (opens on NO; arrows, Z, X/ESC = No, touch buttons). Wording true to returnToShrine: "BACK TO THE LAST SHRINE? / NOT A DEATH: YOU KEEP WHAT YOU CARRY / YOUR HEALTH AND FLASKS STAY AS THEY ARE" (code: respawn but hp/flasks carried, no life lost, unbanked carry not dropped). No salt wording used since it is coins/carry in this game.
- Disabled (greyed row, value 'NO SHRINE HERE', buzz + 'no shrine here') via noShrineHere(): tutorial (L.opening), Arena Yard, duel pit, trials, shops, openYard, inn, rush, no level. Row in a normal level works.
- Texts: controls card row 'to shrine' now 'PAUSE MENU (NOT A DEATH)' (was 'R (NOT A DEATH)'); README table row. No lesson step/tip/hero card mentioned R for the shrine (grepped).
- Coordinator add 1: inn full name WAYMEET'S CROSSROADS INN -> THE CROSSROADS INN (level.js comments, opening-tutorial.js INN_SIGN/INN_CARD, tavern.js, tools). Town 'Waymeet' untouched. 'THE INN' untouched.
- Coordinator add 2: player-facing LESSON -> TUTORIAL: level name 'THE TUTORIAL' (id 'lesson' kept), sign 'THE TUTORIAL. WALK ON.', pause row 'Skip tutorial', skip prompt 'THEN SKIP TUTORIAL', loading tip 'WANT THE TUTORIAL AGAIN? THE TUTORIAL BOARD...', 'THE ROAD STARTS WITH A SHORT TUTORIAL', inn station name/verb/first card (tavern.js lesson row ONLY, line 35 + comment line 58, for a clean merge with INNSAVES), board sign art 'TUTORIAL' (src/tavern-art.js: plank widened 34->46 so 8 letters fit). Internal ids/saves/files stay.
- Test hooks: BKT.returnToShrine/noShrineHere/shrineAsk; BK.ui.shrineAsk.

TESTS UPDATED (intended): tools/survival.mjs (R keypress -> BKT.returnToShrine(); messages), tools/settings-tabs.mjs (reserved-key check uses M, R is free), tools/lesson-opening.mjs (verb 'TUTORIAL'), tools/tavern-menu.mjs + tavern.mjs + lesson-opening.mjs (inn name). New tools/shrinekey.mjs.

CHECKS
- node --check on all touched src: ok.
- tools/shrinekey.mjs (browser): R does nothing in play; row asks; NO stays; YES returns; tutorial and arena_yard rows disabled, Enter does not ask, R does nothing -> ok.
- tools/textfit.mjs menu,lesson,erase: OVERFLOW/TRUNCATED/COLLIDE/CLIPPED 0 (added textfit frames: shrine ask, pause menu in tutorial + yard; first run found a COLLIDE with the pause rows under the card, fixed by drawing the card alone).
- survival, settings-tabs, lesson-opening (pure + browser all), tavern-menu, ui-hud: pass.
- tools/tavern.mjs: 3 FAIL, all 'page CRASHED (Inspector.targetCrashed)' at the 3-player victory card + online abort (renderer crash, likely RAM beside DEMOAUDIT's browser; not in touched code). OWED: re-run tools/tavern.mjs once on a quiet machine, and on master to compare if it repeats.

QUESTIONS
- None blocking. Rec kept: R stays unbound (free for rebinding). Textfit scopes 'title'/'mapcard' not re-run for the TUTORIAL level-name; the level is hidden, so recommend the integ suite covers it.
