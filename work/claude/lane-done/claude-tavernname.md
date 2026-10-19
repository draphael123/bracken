# claude/tavernname (Sonnet, no-browser)

## Name
- Level name 'THE CROSSROADS INN' -> 'THE TAVERN' (src/level.js; id 'tavern', PROG.tavern, saves untouched).
- Full-party callout 'THE INN IS FULL: FOUR TO A PARTY.' -> 'THE TAVERN IS FULL: ...' (src/main.js).
- Title rows LOCAL CO-OP / ONLINE CO-OP and the map's TAVERN label already said the right thing: unchanged. No 'Co-op Tavern' string existed in src/.
- docs/updates.json batch 103 line "Co-op Tavern: 4 players, local + online" is PAST history: left as is (future entries should say "The Tavern").
- tools/tavern.mjs assertion text renamed. No hint/textfit baseline pinned the old names (grep clean).

## Settings in the Tavern
- ESC / keyboard / touch pause already reached openMenu('play') in the inn (state 'play' level). What was broken: (1) a JOINED pad player's START went through padIntoPlayer, which never reads `pause`, so only player one could pause; (2) the pause menu offered level-only rows that don't work in the inn (Map 'not in a level', Level card, Hero trial, Back to shrine, Restart level) and 'Return to map' used gotoLevelNode(tavern) instead of the inn door.
- Un-joined pad's START still joins (tavernPadJoin unchanged); player one's pad (p1Pad) never joins.
- Fix (src/main.js): padIntoPlayer sets pausePress on a joined seat's START when L.tavern && state==='play'; menuItems hides TAVERN_MENU_HIDE rows in the inn; 'Return to map' in the inn calls tavernToMap(). Resume/Settings (volume, controls, display tabs), Co-op (off), Co-op guide, Report a bug, Quit to title remain. Settings Back -> pause menu; ESC -> state 'play' = back in the Tavern.
- UNVERIFIED IN A BROWSER (no-browser lane). Could not find a keyboard/ESC cause in static reading; if ESC still fails on the live page the integ should capture it.

## Checks
- NEW tools/tavern-menu.mjs (registered in tools/check.mjs after 'tavern'): static pins for name, no old wording in any src string, menu rows, hide list, Return-to-map, joined-pad pause, un-joined join. all ok.
- tools/tavern.mjs pure, whatsnew, hint-shown run green.

## Integ must run
- node tools/tavern.mjs (page parts) and a page walk: enter tavern, join a pad (faked), press Start on the joined pad -> menu opens; Settings -> Back -> ESC returns to play in the tavern; Return to map leaves to the map. (Not written as a page test.)
