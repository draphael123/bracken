FIRST5 DONE 11-07 (branch claude/first5, based on master 6743648c2, pushed). Stills: scratch\lane-reports\first5\{flow,play,map,wood,after,levels}\*.png
Tools added (not in the suite): tools/first5-flow|play|map|wood|after|levels|heap.mjs (one headless Chrome each, ?demo=1, fresh storage).

## Findings, ranked by what a new player notices
1. END CARD FOLLOW BUTTON IS SHUT. src/demo-end-config.js FOLLOW_URL = '' so the end card says "WISHLIST / FOLLOW: COMING SOON" and "THE FULL GAME HAS NO PAGE YET". The card is the last thing every demo player sees. REC: Daniel fills FOLLOW_URL (https itch page) before Sunday; if there is no page by then, leave as is (it is honest, never a dead link). Not mine to fill.
2. Demo map caption overlapped the red tag "BEAT KING GORM WITHOUT DYING" at Kingswood ("THE ROAD ENDS HERE... FOR NOW" printed over it, tag cut to "BEAT KI"). FIXED (commit on claude/first5, src/main.js drawMap: the tag's rect is passed to DEND.mapCaption so it steps clear). Before/after: levels\12-map-kings-tab-closed.png vs 22-map-kings-tab-closed.png.
3. HP number on the HUD ("10") is clipped/struck by the bar's right edge, so it reads "1'0'" on every screen of every level (play\*.png, wood\*.png). Cosmetic but constant. NOT fixed (needs a look at the HUD draw in main.js/ui-hud.js). REC: draw the number inside a 1px dark plate or move it 2 px left; art/polish lane, 15 min.
4. The tutorial never names the starter skill (shield throw, F). It is taught later by the "YOUR SKILL" card after 7 s of calm in the Lumber Trail (after\01-wood-skills-card.png) - works, text readable. A headless page (navigator.webdriver) suppresses this and the first-death cards, so they only show with BK.saltForce=true. REC: fine for Sunday; optional 13th lesson step later.
5. Sign "E" prompts show over the hero at the start of the tutorial and at the flask station (the hero spawns/stands on a sign): "E" floats above him with nothing to press it for (play\01, 17). Minor. REC: move the first sign 2 tiles right (lesson level only) - not done, needs col check against lesson-opening.mjs.
6. Inn card (THE CROSSROADS INN) covers the inn for 9 s and no key dismisses it (it auto-times out). REC: let the confirm key dismiss it. Small code change in src/opening-tutorial.js, not done (needs input wiring).
7. New save card wording "A DEATH SENDS YOU TO THE LAST SHRINE, AS EVER": "as ever" is odd for a first-timer. REC: "...TO THE LAST SHRINE YOU LIT" (main.js:6852, lower-case string, 2 lines either way). Not changed (text pins in other tools unchecked).
8. Title menu CHOOSE A SAVE / PLAY ONLINE / DUEL (BETA) / BOSS SELECT all show in the demo; NEW GAME is first and works (CONTINUE fix from demoaudit holds).
9. Map: LEVELS counter reads 0/11 (the 12th, the Arena Yard, and the lesson are not counted) - consistent, fine.

## Verified OK (real keys on a fresh ?demo=1 save)
- Title -> NEW GAME -> opening story (3 slides, Z next / X skip) -> NEW SAVE card (lives OFF default, difficulty NORMAL, "cannot be changed after the first level") -> hero pick (knight "recommended for first run", 4 free + locked ???) -> knight card -> lesson. Order in play: opening, new-save card, hero pick.
- Lesson walked with scripted input: 12 of 12 steps complete, gates lift, prompts readable and correct. It DOES teach heavy (HEAVY CUT hold X, armour), up (RISING CUT up+X, bird), down (LOW SWEEP down+X rat; PLUNGE jump then down+X, barrel lid), plus block, dodge, flask, shrine, held jump, three-hit third blow. Door -> inn, PROG.lesson=1, starter skill shieldThrow owned and equipped.
- Inn -> campaign table -> map -> Lumber Trail by confirm. First-run cards (skills, flask) fire and read well. Level-up: win card -> choice card (LEVEL UP: CHOOSE ONE, three cards, readable at rest) -> map.
- Old Tusker arena entry: boss name banner, health bar, intro. 
- Level select: map nodes hide everything past Kingswood (only 12 listed ids visible, the rest locked+secret); the TAB list shows Lumber Trail ... Underleaf (scrolls) with Store, nothing outside the demo (levels\11-map-tab-list.png).
- 9 of the 13 DEMO_IDS load, run 200 frames and reach their boss arena with no page errors, boss banner correct: wood (Old Tusker), hornetsnest (Hornet Queen), marsh (Bullfrog King), fenroad (Bog Troll), stockade (Goblin Chieftain), spore (Mother Cap), rootway (Huntmaster), underleaf (Grandmother), palisadewood (Battering Beast). Stills levels\1xx-lv-*/boss-*.png.

## OWED (not run: coordinator held Chrome for gate151 at 6 GB free)
- kings, burning, arena_yard, lesson cold loads; the end card after King Gorm on the live build (tools/demo-end-page.mjs passed at batch143; tools/first5-levels.mjs PART=end does it, PART=levels IDS=kings,burning,arena_yard,lesson the rest). Earlier demoaudit (11-06) loaded all 13.
- Machine note: memguard (floor 900 MB free) killed several of my headless pages while other lanes ran: "page CRASHED" in these tools = guard kill, not a game bug. JS heap is flat across level loads (80-130 MB).

## Fixed
- map caption overlap (finding 2). Nothing else touched. No suite run (never check.mjs).

## ROUND 2 (11-08, master 923e8ad42, branch claude/first5b = master + first5 tools; no game code changed). Stills: scratch\lane-reports\first5b\
- The unfinished part is done. kings (King Gorm), burning (Pyromancer), arena_yard and lesson all load and run 200 frames with no page errors (arena_yard and lesson are hidden, no boss). With round 1 that is 13 of 13 DEMO_IDS.
- King Gorm end card: win -> confirm -> state demoend; card text, 5 vignettes, KEEP YOUR PROGRESS, GIVE FEEDBACK, CREDITS, BACK TO THE MAP, MAIN MENU all present and readable (first5b\304-demo-end.png).
- Re-check of round-1 findings on 923e8ad42: HP number readable ("10" clean, play\01); no stray E at the lesson start or flask station (play\01, play\17); inn card closes on ESC and stays in play, not pause (tools/first5-esc.mjs: card up true -> false); new-save card text now "a death sends you back to the last shrine you lit: retry as often as you like" (main.js:6887, read from source - the still of that card was not retaken); Kingswood caption clear of the red tag, tag fully readable (first5b\402-map-kings-tab-closed.png). All fixed.
- STILL OPEN: FOLLOW_URL in src/demo-end-config.js is blank, so the end card button reads "WISHLIST / FOLLOW: COMING SOON" (Daniel to fill before shipping if the itch page exists). Tiny: on the hero pick the GEOMANCER label has a dark plate behind it that the other names lack (flow\06-step.png, first5b\newsave.png) - cosmetic, REC polish lane.
