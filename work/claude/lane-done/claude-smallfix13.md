# claude/smallfix13 (from claude/batch142 0c2dfca2) - 11-03

## Changed
1. DUEL PIT: tavern station 'arena' now name "THE DUEL PIT", verb DUEL, intro and hint lines, comments (src/tavern.js, src/tavern-art.js, src/level.js comment, tools/tavern.mjs assert). Station id stays 'arena'. I kept the "THE" like the other stations (Daniel wrote 'DUEL PIT'; drop THE if wanted).
2. Credits (licence audit): "March of the Wizards" (Aureolus_Omicron, CC-BY 4.0) added to CC_BY. creditPages now splits CC_BY rows: kind 'ccby' pages (CC-BY only, header CREDIT REQUIRED (CC-BY)) then kind 'cc0' pages (header "CC0: CREDITED ALL THE SAME", the "ALL THE REST IS CC0..." footer moved to the last CC0 page). Every CC-BY page carries "TRACKS TRIMMED AND LOOPED FOR THE GAME." above the page number. JaggedStone, SketchMan3, TheOuterLinux added to SFX_CREDIT_NAMES. PeerJS (MIT) line on the fonts page. Sound Test rows added for burial / fallingtower / underkeep (they were CC0 recordings: "Evil2 - Catacombs" Junkala, "8-bit - Last Mission" HydroGene, "Sinking Feeling" Umplix, not "made for THORNROAD"). audio/CREDITS.txt: wind-whoosh-loop URL, header line (28 CC-BY, trimmed/looped), geopop date 2026-11-05 -> 11-03, Otto Halmen -> Halmén.
   Not done: MUSIC_CREDITS key for arenayard (A5, trivial; the Sound Test row exists), stale MUSIC_CREDITS_ROW.brackenwood (tools/boss-music.mjs cites it), in-game Halmén spelling, audit Draft-1 page 1 and closing page text (not requested).
3. Ad-block filenames (git mv, all refs updated incl. index.html modulepreload, audio.js TRACKS, check.mjs, tools):
   src/admiral-hands.js -> fleetlord-hands.js; src/admirals-champion.js -> fleetlord-champion.js; src/admirals-champion-hands.js -> fleetlord-champion-hands.js; audio/admiral.ogg -> audio/fleetlord.ogg; src/map-pixel.js -> src/map-dots.js. Extra: src/redraw/admiral_art.js -> fleetlord_art.js; tools/admirals-champion.mjs -> tools/fleetlord-champion.mjs. TRACKS key / boss id 'admiral' unchanged (only the file name matters). Old paths added to tools/dangling-paths.mjs known holes (old lane reports cite them). tools/admiral.mjs kept (tools are not deployed, .vercelignore). Names checked against ad, ads, admiral, pixel, track, analytics, banner, beacon, sponsor, promo, advert, popup: no served file in git ls-files matches now (audio/adventure.mp3 and src/additional-areas.js left, low risk, not matching those words).

## Checks (all green)
modulepreload (718 listed, 13 unlisted within budget 15), audio-assets, dangling-paths, deploy-surface, ship-fixes, fleetlord-champion --pure, admiral (pure + level), textfit credits,soundtest (0 of everything), tavern pure,stations (page loads every renamed module), tavern-menu.
Not run: tavern 'fixes' (headless crash on baseline), full suite, a real EasyList/EasyPrivacy blocker test.

## What's New suggestions
- The tavern's roped-off pit is now the DUEL PIT (no more mix-up with the Arena Yard door).
- Credits: the music credits now list every CC-BY track, split from the CC0 names.
(The file renames are invisible to players; skip.)

## Question
Drop "THE" from THE DUEL PIT? Rec: no (matches THE ARENA YARD, THE SPARRING BELL).
