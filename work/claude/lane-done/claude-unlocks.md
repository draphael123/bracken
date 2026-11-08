# claude/unlocks - THE UNLOCKS screen + plain lock words (Daniel 11-07 08:48)
Branch claude/unlocks off master 95bc267a4. CODE + ART (greybox board only), no browsers run, not merged, not deployed.

## What changed
- src/unlocks.js (new, pure): every lock line's wording (levelReq -> reqText / reqProgress, heroHow, featHow, featProgress), buildTabs (demo filter), layout helpers, makeUnlocks (the screen).
- src/main.js: gormWant = 'BEAT KING GORM WITHOUT DYING'; lock lines now WRAP (map panel strip, road tips, swap-hero panel, the screen) - never cut; UNLOCKS reachable from the title (row before OPTIONS), the pause menu (row 'Unlocks' after Secrets) and the inn.
- src/tavern.js + tavern-art.js: station 'unlocks' (x=27, between the long tables and the bar), greybox plank board, on the ART list (the art lane paints it).
- src/hero-roster.js: HOW.paladin (the pick card said BUY IN THE STORE for a hero you must first beat).
- tools/unlocks.mjs (new, Node only), tools/demo-cut.mjs (pin for the one new DS.DEMO use: unlockDemo).

## The screen
Tabs LEVELS / HEROES / SKINS / OTHER; row = tick, name, how (plain words), your progress. Read-only. LEFT/RIGHT tabs, UP/DOWN rows, ESC / X / Q / B / pad back close; touch/mouse: tabs, rows, ^ v arrows, BACK are hit boxes. Under the demo only the slice (levels in DEMO_IDS, the five PICK heroes, skins/smith rows by the level their feat names; boss rush + MASTER hidden).
- LEVELS: every real stop on the map (NODES), locked ones stay with their line. Gorm row: 'NOT BEATEN YET' / 'BEATEN, BUT YOU DIED - TRY AGAIN' / DONE. Hidden secrets stay '? ? ?' until their first piece.
- HEROES: via main.js PICK. Ownership is read in ONE function, unlockHeroOwned (main.js, next to heroFacts) - switch it when claude/heroroster2 lands.
- SKINS: the feat-earned skins/weapon looks (Iron Knight, Sporeborn, Laurel, Laurel Blade, Chieftain's Axes) + two summary rows (skins / weapon looks for sale: n of m owned).
- OTHER: second skill slot (L30, your hero's level), the Runner's Ribbon charm (45 medals), the Smith's gated upgrades (clear a level). BOSS RUSH + MASTER rows exist but only show when MODES_PARKED is off (both are parked today).

## Lock lines, before -> after
- Burning Village (map strip, road tip, spur text): BEAT KING GORM WITHOUT FALLING -> BEAT KING GORM WITHOUT DYING (strip wraps to 2 lines; was cut at 'WITHOUT FA...')
- Gorm tip line 2: ONE LIFE, BOTH PHASES: FIGHT HIM AGAIN IN KINGSWOOD -> BEATEN, BUT YOU DIED: TRY AGAIN IN KINGSWOOD; ONE LIFE, BOTH PHASES, IN KINGSWOOD -> BOTH PHASES, NO DEATHS, IN KINGSWOOD
- Gorm death hint: YOU FELL TO GORM: ... -> YOU DIED TO GORM: THE BURNING VILLAGE STAYS SHUT
- Map panel strip, any other shut node: NEEDS <X> / LOCKED / NOT YET (fitText-cut, 1 line) -> CLEAR <X> FIRST, or the next step in full (BEAT X IN m:ss OR LESS, DEFEAT 80% OF THE FOES IN X, ...), wrapped up to 3 lines (detailH 15 -> 24; still 10 list rows at 180 high)
- Road tips (drawn at a junction): fitText-cut -> wrapped, box grows
- Spur text: BEAT X IN m:ss TO OPEN THIS ROAD -> BEAT X IN m:ss OR LESS; CLEAR X TO OPEN THIS ROAD -> CLEAR X; LIGHT WAYMEET'S VOTIVE LAMPS n/3 -> LIGHT ALL 3 VOTIVE LAMPS IN WAYMEET (n/3 on the progress line)
- Secret/time/kill levels: WALK X IN 3:00 -> BEAT X IN 3:00 OR LESS; YOU HAVE NOT WALKED IT YET -> ...NOT CLEARED IT YET; PUT DOWN 80% OF X -> DEFEAT 80% OF THE FOES IN X; YOU HAVE PUT DOWN n% -> YOU HAVE DEFEATED n%; SOMETHING IS STILL OWED -> NOT OPEN YET
- Swap-hero panel: BEAT THE BLOOD KNIGHT IN THE UNBURIED FIELD TO EARN IT (OR 10 SILVER) [implied silver skipped the fight] -> BEAT THE BLOOD KNIGHT IN THE UNBURIED FIELD, THEN BUY HIM: 10 SILVER OR 800 GOLD; BUY HIM AT THE STORE: 10 SILVER, OR 800 GOLD AFTER THE BURNING VILLAGE -> BUY HIM AT THE STORE: 10 SILVER OR 800 GOLD (GOLD ONLY AFTER THE BURNING VILLAGE); an unfound secret hero: FIND HIS HIDDEN PATH AND BEAT HIM, THEN BUY HIM: 10 SILVER
- Hero pick card, Paladin: BUY IN THE STORE - 10 SILVER -> BEAT HIM IN THE LIT CHURCH, THEN BUY: 10 SILVER
- Iron Knight skin: clear a level in Iron Knight -> clear a level with the IRON KNIGHT setting on (three lives)
- Unchanged (already plain): store lockOf 'clear X first' / '<feat> to earn it', SECOND SLOT AT LEVEL 30, medals/boss feats, the remaining hero-roster howTo lines.

## Checks run (all Node, no browser)
node --check src/main.js src/unlocks.js src/tavern.js src/tavern-art.js src/hero-roster.js src/ui-hud.js; node tools/unlocks.mjs (all ok: 265 real level x save lock lines wrap, hero how-tos wrap, demo filter, screen state machine + draw bounds, wiring pins); node tools/demo-cut.mjs (green, 14 pinned uses); node tools/tavern-menu.mjs (all ok). tools/tavern.mjs, tools/hero-roster.mjs, tools/ui-hud.mjs, tools/hero-swap.mjs, tools/textfit.mjs use the browser: NOT run.

## OWED (browser, when the machine is free)
Stills: (1) map panel with Burning Village selected, before Kingswood and after (strip: 2 lines, not cut); (2) a road tip at the Kingswood junction; (3) UNLOCKS screen, each tab, 320x180 and a touch layout, demo build LEVELS tab; (4) title menu (now 12 rows non-touch: row height drops 11 -> 8, check it) and the touch paged title; (5) pause menu with the new row; (6) the inn board and its prompt (x=27 sits between the long tables and the bar: check it clears the drinkers); (7) swap-hero panel with a locked Blood Knight / Paladin. Runs: tools/textfit.mjs (scoped to the map panel, swap hero, title, unlocks), tools/tavern.mjs, tools/hero-roster.mjs, tools/ui-hud.mjs. Check online co-op: the world freezes while the board is open (same as the SAVES board).

## Questions (recs built)
1. Should locked LEVEL rows ever show gold/silver rewards? Rec: no, as built.
2. BOSS RUSH / MASTER rows are hidden while MODES_PARKED; rec: leave, they appear the moment the modes ship.
3. The UNLOCKS board in the inn is greybox (plank + padlock); rec: fold a proper painted board into the next tavern art pass.
4. Legacy ABILITIES (needs: a level) are not listed; rec: skip (the skill slots replaced them).
