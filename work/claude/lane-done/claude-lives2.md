# claude/lives2 - EASY mode + lives by difficulty + lives icon (Daniel 11-08, demo day)
Branch claude/lives2 off master 923e8ad42. NOT merged, NOT deployed.

## Changed
- src/difficulty.js: EASY mode (id 'easy', label EASY, col #c7d265) between story and normal, halfway on take .75, stagger 1.18, parry 1.2, open 1.18, death .5, affix .75. Whole-number rules: flaskAdd +1 (rounded up from .5), shrine 'one' (as Normal). MODE_IDS = story, easy, normal, master. ?difficulty=easy now means EASY (it used to mean VERY EASY; veryeasy/story still do).
- src/lives.js: LIVES_BY_MODE 10/5/3/1, livesFor, coinLivesOn (not MASTER), livesValue ('ON: 3 LIVES', 'ON: 1 LIFE'), livesBlurb, EASY blurb. startLives follows the save mode.
- src/main.js: card LIVES row shows 'ON: N LIVES' and a matching line; livesCoin skipped on MASTER; GAME OVER card uses the mode count; new baked HUD icon PROP.hudLife (steel shield, red heart, 9x8); the lives row (icon, xN, LIVES) is no longer hidden by the idle MINIMAL HUD (it sits on a strip like the flask row); BK.lives and BK.ui.rulesRow tool hooks.
- Tools: lives.mjs (section F + new greps), difficulty.mjs (easy page run), demo-cut.mjs (MODES block), textfit.mjs (pick scope: 16 new-save card frames; hud scope: lives row x10/3/1 in both HUDs).
- Medals/records, pause/settings: nothing keys off PROG.mode besides the Master unlock (DFM.mode() === 'normal'), so EASY earns no unlock; the Settings 'Difficulty' row is the older per-wood dial and is untouched. WHAT'S NEW has no lives entry: not touched.

## Stills (scratch\lane-reports\lives2-stills\, 3x) - LOOKED AT
card-{story,easy,normal,master}-{on,off}.png, hud-{story,easy,normal,master}-{full,minimal}.png, hud-lives-OFF-baseline.png. HUD: icon + count clear of the HP plate, flask row, skill slots; LV row overlap with the plate edge is pre-existing (same in baseline).

## Checks run (all green)
node tools/lives.mjs, demo-cut.mjs, demo-save-carry.mjs, difficulty.mjs (easy hit 15 vs 20, 1 shrine flask, opening x1.18), textfit pick (25 screens) and hud (49 screens): 0 issues. Page run confirmed lives 10/5/3/1 on level entry per mode.

## Coordinator re-run
textfit slots + title, save-slots, save-safety, hero-roster, lesson-opening (browser, not run here), tools/boss-rates etc. use ?difficulty=easy only via --difficulty (meaning changed; none in suite pass it).

## Question
EASY shrine: kept 'one' (flask add +1). Rec: keep. Master card pick is still gated behind a Normal clear (demo cannot reach it).
