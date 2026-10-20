# claude/lumberfix - Lumber Trail fixes from Daniel's playtest 10-19 (SONNET), off master fdcfd8ff (BATCH105)

## 1. BUG: a felled pine vanishes when you walk on - FIXED, pinned
- CAUSE: the prop draw loop (src/main.js, `for (const pr of props)`) culls every prop by its OWN x (+-40 px of the screen). A felled pine's x is its STUMP; the trunk is up to 14 tiles (224 px) long, so once the stump scrolled off the trailing edge the whole trunk (bridge, lean-to, drop) stopped being drawn until you went back. (The tiles under it are hidden by L.fellSet, so it looked like the bridge vanished.)
- FIX: `fellSpan(ent)` (src/felling.js, new pure fn: stump-to-crown px span, a tile of slack) and the cull now lets a felled `felltree` through while ANY part of its span is on screen. Applies to every level with felling.
- CHECK: tools/lumber-vanish.mjs (registered in tools/check.mjs, page check, one Chrome): fells each of the 5 trail pines, stands at the far end and 3 and 6 tiles past it, asserts the trunk sprite is drawn this frame while the stump is culled. RED on master (11 FAIL: gully 3/3, sett 1, leanto 2, drop 2, tarn 3 cases), GREEN here (17 assertions, incl. fellSpan covers every fellCells cell). Verified red in a throwaway worktree on fdcfd8ff (removed).

## 2. Old wood texture - redrawn in the Lumber Trail kit (gated L.lumberKit)
- GROUND: every plain SOLID tile the kit did not name (the old grass-and-dirt, ~5,400 cells, cols 0-509) is now the FOREST FLOOR (`floorTile`, src/redraw/lumber_trail_tiles.js): needle-duff lip with moss patches, dark loam by depth, bark chips, root threads, flanks, root-fringe undersides. Hooked in main.js's SOLID branch after the stock pick (the sprinkled ferns/tufts/mushrooms/flowers/rocks still grow on it).
- SPRINKLED timber (the random dice on every grass tile: stock stump / fallenLog / fence) -> sawn stumps, a limbed log with ringed end, a split-rail fence (`LTA.sprinkleOf`).
- PLACED decos: stump (v!=0), birdhouse (nest box on a pole), deadTree (lightning-split snag), trunk (blazed bare pine bole) redrawn; cabin/stump v0/fence were already the kit's.
- NOT changed: the boss clearing (cols 510+: ground, ONEWAY, deco), the old opus lane's. Spikes (2 tiles) stay the game's.
- Proof: before/after sweep sheets (6 sheets, a frame every 22 cols along the route, tools/lumberfix-shots.mjs): work/claude/shots/lumberfix/before|after/sheet-0..5.png, plus decos.png/z1.png/z2.png close-ups.

## 3. Hornet nest visuals removed along the trail (clearing + Queen untouched)
- The 5 paper-comb balls at cols 47, 188, 311, 326, 462 (`hiveBg`) and the 2 skeps at 327, 355 (`beehive`) are not drawn (draw-time hide for x<510; the entries stay in src/lumber-trail.js so levelHash and the pilot/curve/mash rows stay valid).
- The skyline GREAT PINE lost her comb and the wheeling wasps (the pine stays as the landmark).
- The area label THE HIVE PINES is now THE PINE RIDGE (text only; "THE HIVE CLEARING" stays for the boss lane).
- WASP FOES that remain (gameplay; list for the boss lane): 15 `wasp` ents - cols 46/48 (start, 2), 114/119/123 (ford, the plunge lesson, pogo), 291 (camp landing), 308/314/323 (ridge, the rising-cut lesson), 362/368/375 (hollow log), 420/424 (tarn, pogo; the tarn bridge exam), 463 (before the knoll). Signs that name them: col 303 (WASPS HANG OVER THE RIDGE), 172 tarn sign. The lessons (plunge, rising cut) and the tarn exam are TAUGHT on wasps, so removing them needs a replacement foe (ask).

## 4. MUSIC (coordinator add): Enchanted Festival
- audio/lumbertrail.ogg = "Enchanted Festival" by Matthew Pablo, CC-BY 3.0 (the author's Loop.wav, 102.5 s). ffmpeg: last 2 s crossfaded onto the first 2 s, loop returns to 2.0 s (TRACK_INTRO lumbertrail: 2.0), -0.3 dB + limiter, libvorbis 112 kbps, 1.5 MB, measured -12.9 LUFS (peak -0.9 dBFS); the seam step at the loop point is ~500 (was 9187 in the raw wav).
- Wired: src/audio.js TRACKS + TRACK_INTRO + MUSIC_NAMES + MUSIC_CREDITS + MUSIC_CREDITS_ROW (Sound Test row); src/credits.js row replaces brackenwood's (same row count, so credit pages keep their count); audio/CREDITS.txt; src/lumber-trail.js music 'brackenwood' -> 'lumbertrail'; tools/boss-music.mjs asserts; tools/music-start.mjs now probes 'lumbertrail'.
- brackenwood (Round Glasses, Clement Panchout) was used by nothing else: audio/brackenwood.ogg, its TRACKS/TRACK_INTRO/MUSIC_NAMES/MUSIC_CREDITS entries, its credits row and CREDITS.txt lines are removed.
- Checks (node): audio-assets ok, audio-mix 0 problems, boss-music ok. NOT run (Chrome): textfit credits/soundtest, music-start (integ should: `textfit soundtest,credits --strict`, `music-start`). Not auditioned by ear.

## CHECKS (PORT 8777, one Chrome at a time)
green: lumber-trail (65), lumber-vanish (17, new), level-quality wood (CLEARS, levelHash untouched), solid-islands, visible-supports wood (0 of 8), readability, frame-cost (wood 0 read-backs), audio-assets, audio-mix, boss-music.
mobile-perf title+wood at 4x CPU, 915x412: wood 56.8 fps, p95 18.2 ms, worst 18.8 ms, 13.4 ms busy/frame (title 56.8 fps) - inside the budget.
Not run: textfit, music-start (Chrome slot, see above).
Note: memguard.ps1 was started by this lane (a redundant 14 h guard; the earlier ones still run).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. Replace the trail's 15 wasp foes? REC: keep (the plunge and rising-cut lessons and the tarn exam are taught on them; they read as plain wasps once the combs are gone). BUILT: kept.
2. The clearing's ground stays the old grass/dirt until the Old Tusker lane rebuilds it: REC yes (its lane owns it). BUILT: cols 510+ untouched, so the ground style changes at the arena gate.
3. The FOREGROUND grass blades along ground bottoms (stock front layer) are still the game's: REC leave (they read as undergrowth). Say if you want them cut for the level.
