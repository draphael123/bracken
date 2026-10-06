# claude/uiscreens - UI POLISH B (screens): loading + boot, opening, map + results

Base: origin/master 85e13368. Sonnet 5.5. Port 8650. Before/after stills: `work/claude/lane-done/uiscreens/` (`before-desktop-*` and `after-desktop-*`;
`PORT=8650 node tools/uiscreens-shots.mjs before|after desktop|phone [boot,title,intro,heropick,map,death,win]` makes them).

## What changed (plain words)

### 1. LOADING + BOOT
- The `booting...` line is gone for players: `#boot` starts empty and `?debug` turns the dev text on (index.html). The 8 s line is UIQUICK's `STILL LOADING - SLOW CONNECTION?`.
- The loading screen (src/loading-screen.js) is now a scene: the player's own hero dancing by a campfire (sparks, smoke, a glow) under the bracken, the mountain
  behind with its light on top, a moon, a few stars, bracken fronds swaying in front. Stage text is 2x (BAKING BOSSES / 37%), the bar is unchanged (still true: the
  step weights and the monotonic bar are the same), and under it a TIP or a line of the wood changes every 5.2 s (12 lines, picked off the clock so a still is repeatable).
  First visit of a browser says so ("FIRST VISIT: EVERYTHING IS FETCHED FRESH. NEXT TIME IS QUICKER."). 6 new glyphs in the hand-drawn 3x5 font (, ' ! ? : +).
- NOT DONE: caching the art bakes (see QUESTIONS).

### 2. OPENING
- PRESS ANY KEY card (src/title-card.js): the first title of a run is a dark card, the wood closed over the picture (two walls of fronds), the name, PRESS ANY KEY
  (TAP TO BEGIN on a phone), "this also starts the sound". The first key / tap / pad button / click starts the audio and does nothing else (the menu does not move);
  then the fronds part (0.9 s), the knight walks in from the left and sits at the fire (about 2 s), the sign settles, the menu slides in. A press during that skips ahead.
  The in-level PRESS A KEY FOR SOUND banner stays only as the fallback for a run that never passes the title. `?nocard` turns the card off. It is not shown to tools
  that press a key at boot (tools/cdp.mjs sends F8), so no other check changed except touch (below).
- First-run opening (src/opening-panels.js): four illustrated panels (THE WOOD, THE MOUNTAIN, THE ROAD, THE KNIGHT), two short lines each, once per browser
  (localStorage `bracken.openingSeen`), shown on the first new save before the hero pick. Z / right / a tap turn the page, X or ESC skips all. Not shown under
  BK.manualSimulation (tools) and `?noopening`. THE WORDS ARE MY FIRST DRAFT (the game has no written backstory) - see QUESTIONS.
- Hero pick: the selected hero's signature move loops in a window beside the words (the existing src/ability-preview.js, pure draw), with the move's name under it:
  knight RISING CUT, pyro EMBER FLARE, paladin LIGHT LANCE, pirate GRAPESHOT, reaper HARVEST MOON, warden SKEWER, geomancer FAULT LINE. The cards are 10 px shorter
  to give the words and window room; the loop line wraps in the left column.

### 4. MAP + RESULTS
- Map info card (still 218x58: a taller card cannot be placed on 8 nodes, map-spacing proves it at 62, 64, 66, 70): a postcard of the node's country (src/map-card.js:
  desert, inland, coast, crags, wood; dark at night) as the level preview, BEST (or NOT WALKED) with the medal held, the three medal times with discs (a filled disc is a
  medal you hold), silver n/3, gold n/total, QUEST DONE / QUEST OPEN (said in words), RECOMMENDED LV n (green if you are there, orange if not; it is the level the wood
  pays x3 XP below) with the difficulty and its up/down on the same row. A long name drops to the small hand instead of being cut (THE MASKWRIGHT'S THEATRE); a long
  blurb pages (two halves, 2.4 s each, a dot says which) instead of being cut. The header's counters start after the region's name (THE ROAD INLAND no longer runs under the flag).
- DEATH screen (src/death-card.js): a card with YOU FELL (12 px), who killed you (8 px, the bestiary name), the blow's name, THE TELL YOU MISSED (RED !! WARNED YOU: ONLY A DODGE TURNS IT /
  YELLOW ! WARNED YOU: RAISE THE SHIELD / a piercing blow: a parry / a pit, water, fire, a trap say what to mind), and what the death cost (the existing DROPPED line or
  NOTHING DROPPED). The respawn is NOT delayed (the 1.2 s clock is unchanged). After the respawn a one-line recap sits under the timer for 3.2 s (FELLED BY ..., the tell).
- LEVEL-COMPLETE card: the compare line (FIRST CLEAR / NEW BEST -m:ss / BEST m:ss), foes + blocks + dodges on one row, a new row for silver n/3 and quest done/open, deaths
  tinted when there were some, the medal stamp as before, then NEXT: SILVER AT m:ss (what the next medal wants, once the stamp is down), the +0 XP line is gone,
  "Z continue" (TAP continue on touch, and a whole-screen tap box), and a darker scrim (0.88) so the HUD's fragments do not poke out.

## Files
New: src/title-card.js, src/opening-panels.js, src/map-card.js, src/death-card.js, tools/uiscreens-shots.mjs (stills), tools/uiscreens.mjs, tools/death-screen.mjs, tools/level-complete.mjs.
Edited: src/main.js (small, local: imports, the press card state + 6 hooks, the opening state, hero pick window, map card block, death block, win card block),
src/loading-screen.js, src/map-plates.js (no change in the end: 58), index.html (boot line + modulepreload list), tools/textfit.mjs (5 scopes, a `world` flag so the map's own plates
are not measured as screen text), tools/touch.mjs (a press-card section; every other page takes the card down), tools/check.mjs (3 names + the textfit scope list).
I did not touch the HUD, toasts, status icons, settings, pause or the save-slot cards.

## Checks (all on port 8650)
- GREEN: loading-screen, uiscreens (new), death-screen (new), level-complete (new), textfit scopes opening/press/mapcard/death/results/pick/trial/erase/slots/credits/soundtest
  (strict: 0 of every kind over 198 screens), settings-tabs, hint-shown, map-grammar, map-spacing, modulepreload (289 modules), audio-assets.
- touch: GREEN in full on the re-run (the new press-card section included). The first full run had ONE frame-time FAIL (lighter preset 7.79 ms vs heavy 3.74 ms) while six lanes shared the PC; the re-run read 2.81 vs 3.07 ms.
- mobile-perf: RED under load, not by my change. First run: wood 60.1 fps and welltown 56.2 passed, redgorge 36.2 (budget 40) failed; the second run (PC busier) failed title 22.5, wood 28.1, redgorge 13. The press card costs about 0.7 ms a frame on the title (3.0 -> 3.7 ms measured in the page). Needs a quiet-PC re-run by the coordinator.

## UNVERIFIED
- Phone landscape stills of the new screens (`uiscreens-shots.mjs ... phone`) were taken after the desktop ones; the death card and the level-complete card are drawn in the
  320x180 game space so they scale like every other card, but the 6 px lines are the game's small hand (the brief's >= 8 px for the death text is met for the headline and the killer only).
- The postcard is the REGION's picture, not the level's own layout (a wood is built only when you enter it).
- The first-visit note says the next visit is quicker: true of the fetches (the service worker + HTTP cache), not of the bakes.

## QUESTIONS FOR DANIEL (each with my rec; the rec is what is built)
1. CACHE THE ART BAKES for instant return visits? NOT built. The bakes are ~190 modules of canvases made at boot; persisting them means storing ImageBitmaps/PNGs in IndexedDB keyed by
   a build hash, and the failure is a STALE sprite after a deploy. REC: skip it; instead spend the effort where the time is (the 3.4 s tiles and 1.7 s props steps) in a perf lane,
   or ship a build-hash-keyed cache for tiles + props only, behind a flag, after a playtest.
2. THE OPENING'S WORDS are mine (the wood, the mountain, a road of torches, "so you go"). REC: keep them as a placeholder and send me the real lines when you have them
   (src/opening-panels.js OPENING_LINES, one array); the loading screen's 3 lore lines are the same kind of placeholder (src/loading-screen.js TIPS).
3. A LONGER DEATH SCREEN? The respawn is still 1.2 s so the card is readable for about one second, plus the 3.2 s recap under the timer. REC: leave the pace (the Salt & Sanctuary
   loop is the point) and let the recap do the teaching; if you want the card to hold until a key, say so and it is one number.
4. A TRUE LEVEL PREVIEW on the map card (the level's real silhouette) needs each level's tile grid, which is built lazily. REC: bake a 40x30 silhouette per level at the end of
   its first play and store it in the save; until then the regional postcard stands in.
5. A TALLER MAP CARD (more info, a second blurb line) cannot be placed on 8 nodes (Witchlight, Redgorge, Underwell, Caravan, Burial, Fair, Causeway, Welltown) without moving
   those levels' nodes or plates. REC: leave the card at 58 px; if a map-art lane moves those 8 nodes it can grow to 66.
6. THE PRESS CARD blocks the first key. A returning player with a save now needs one more press at boot. REC: keep it (it is also how the audio starts on a phone and a desktop);
   `?nocard` skips it for anyone who wants.
