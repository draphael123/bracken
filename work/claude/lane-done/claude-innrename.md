STATUS: READY (branch claude/tutorial1; tip sha in the commit after this report - code commit 986bb8275). Not merged, not deployed.

# INNRENAME - player-facing THE TAVERN -> THE INN (Daniel 11-05 22:52)

## Strings changed: 9 (display strings only; ids, files, saves, functions, station ids keep 'tavern')
- src/level.js: level name 'THE TAVERN' -> 'THE INN' (banner, map label, menus)
- src/main.js (4): 'THE INN IS FULL: FOUR TO A PARTY.', 'JOIN IN THE INN', 'SEAT AN AI PARTNER IN THE INN OR FROM THE PAUSE MENU', store msg 'THE ARENA YARD (THE INN DOOR, ...)'
- src/touch.js: map touch button label TAVERN -> INN
- src/online.js: online help 'each guest walks into the host's inn'
- src/opening-tutorial.js: first-arrival card title now "WAYMEET'S CROSSROADS INN" (door plate unchanged)
- tools/tavern.mjs: one assertion message. docs/updates.json history untouched (no future entry added).
Map footer / title row / tips / lesson subtitles already said INN.

## Check rule
tools/tavern-menu.mjs: level must be named THE INN; src strings may not say THE TAVERN / bare 'TAVERN' / CO-OP TAVERN / CO-OP INN / tavern door|sign|board; CROSSROADS INN now allowed everywhere; opening-tutorial.js exemption removed; full-party callout pins THE INN IS FULL.

## Checks run (no GATE flag, RAM ~4 GB)
- tavern-menu: all ok. save-safety: ok. demo-cut: all green. dangling-paths: ok.
- textfit title,mapcard,lesson,party,card --strict: all 0 except 1 TRUNCATED (main.js:5623 mapcard theatre "THE MASKWRIGHT'S THEATRE", not touched by this lane - pre-existing).
- lesson-opening: knight walk + inn checks ok; ranger/paladin walk FAILs in the default multi-hero run are PRE-EXISTING (identical on base 8282254a7, verified in a throwaway worktree, since removed); ranger alone passes its walk. Harness hero-order issue, not the rename.
## Owed
- tools/tavern.mjs (browser tavern checks) not run; textfit scopes levelcard/hud/menu not run (long/untouched text).
