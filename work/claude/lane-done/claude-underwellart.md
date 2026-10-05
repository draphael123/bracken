# claude/underwellart - THE UNDERWELL's art pass (Sonnet)

Art only: no geometry, route, foe, rule or number moved (level hash unchanged; the only level-data edits are the look: `dark`, `edgeLit`, `palette`, `music`, `ambient`).
Merged master a88a13f9 first (conflicts in src/main.js and tools/check.mjs: kept both sides). Underwell level-1 pilot row stamped (docs/level1-curve.json): 33 hits / 3 deaths over 3 runs, inside its band (not on the out-of-band list).
Before / after captures: docs/underwell/before and docs/underwell/after (19 matching screens incl. the four oil states, nest burning, hall burning, gutter burning; cast sheets cast-*.png). Tools: tools/underwell-art-shots.mjs, tools/underwell-art-sheet.mjs.

## What changed
- TILE KIT src/redraw/underwell_tiles.js (replaces the desert sandstone): flagstone floors with a lit lip, oil-stained where a seep runs (black, sheen, drips down the joints), silt crest in the sump and the exam worm bed; coursed ashlar walls (the well's small cut limestone, riveted iron bands in the works, big dressed blocks in the Queen's hall); brick vaults on the ceilings; 5 rows of masonry under every floor fading to raw rock; stone slabs / riveted iron grating for the ledges; hemp rope tied to an iron ring.
- THE LOOK: a dark level like the Ore Road's (dark 0.3, warm dark colour, amber lamp glow, warm creature rim, lit lip on every standable edge). Every lit torch, burning cell, burning nest, the Great Lamp (plus a warm cone) and each candle niche is a hole in the dark and throws a warm pool.
- BACKDROP + LANDMARK src/redraw/underwell_backdrop.js: far arcade wall with a riveted pipe and brass valve; THE OLD WELL SHAFT's light (oculus, cone, motes, lit patch) on a slow parallax every ~300 px so one is in view on almost every screen, and the Dry Well's own shaft lit from its grille at its true place; fluted pillars with ribs wherever the geometry leaves a tall span (hall, lower works). Rooms: brood chamber (brick, web, egg-sacs, bones), fountain vault, the Queen's cistern (blind arcade, frieze, vault springers).
- DRESSING src/redraw/underwell_dress.js, read off the grid (hash-safe): 153 items, 16 kinds - oil drums (upright / streaked / toppled and leaking), amphorae, pipe stubs with brass valves, brass spigots, lamp racks, rope coils, rubble, scorpion husks, claw gouges, egg-sacs round the nests, silt mounds, the broken pillar, the well bucket; ceiling pipe runs, chains, unlit bronze lamps, cobwebs; wall pipes, damp streaks, candle niches (real lights). Each ledge is held up: stone corbel / iron bracket at a wall end, a post to the floor, chains to the ceiling, or a diagonal strut for the shaft's cantilevers.
- OIL STATES (unmistakable): oil = glossy black with a lit meniscus and a violet/teal/amber sheen (gutter oil is deeper); burning = layered flames, sparks, smoke, floor glow; wet = blue-grey water over drowned oil with drip rings; spent = ash-grey crust, black cracks, last embers.
- NESTS: papery egg-sacs in silk, ragged edges, dark holes with green eyes, husks in the web; char and flames when burning. Hanging cresset torches on chains; the Great Lamp (brass bowl, five spouts, heavy chain); the Dry Fountain (basin, column, three lion sockets, brass taps, running water); the Queen's shed shell (hollow, split down the back).
- CAST: oil scorpion (tar black, gloss, drips, slick), dust (pale, grit halo), thirsty (gaunt, longer and leaner, ribbed, feelers, blue barb), spitting (purple, bulging venom sac that swells on the tell), FAST SANDWORM (slate violet, ivory bands, red eye) drawn in the Underwell only (src/main.js picks SPR.fastworm).
- AMBIENT: own synth bed 'cistern' (src/audio.js): drips with two echoes, far skitter, oil in a pipe, a chitin click, a loaded chain (existing amb_creak); the fire crackles louder near burning oil (existing ember sfx). Nothing downloaded.
- MUSIC (Daniel's pick, file fetched by the coordinator): audio/underwell.ogg "Ossuary 6 - Air" Kevin MacLeod, CC-BY 4.0 is the level track (the Queen keeps her own theme); credited in MUSIC_CREDITS, MUSIC_CREDITS_ROW, src/credits.js (4th-7th CC-BY entry, 2 a page) and audio/CREDITS.txt, exactly as the licence asks.
- NOTHING FLOATS: new check tools/underwell-aloft.mjs (in check.mjs, Node + `--page`): all 22 ledge runs held, every post/chain/strut real, 153 props held up, and on the page the supports are drawn down their length.

## Identity re-score /18 (reviewer 11): KIT 2, PAL 2, PLAT 2, LMK 2, SET 2, DRESS 1, LIGHT 2, AMB 2, THEME 2 = 17/18 (my own reading of stills: DRESS is 1 because the floor props are sparse on the long plain stretches).

## Checks (PORT 8628, all green)
underwell (page), underwell-aloft (+ --page), level-quality, curve-gate, mash-gate, render-layers, footing-art, ground-depth, frame-cost, signs, corpses, architecture, dangling-paths, skins, slopes-trace (unchanged), ambient-landmarks, audio-assets, boss-music, modulepreload, textfit (credits), comments, homepaths, floaters, readability, hint-shown, desert-foes2, cistern-queen, welltown, redgorge, boss-fight-end, underwell-route (knight/warden/pyro level 1: 0 deaths, 0 lifts).

## UNVERIFIED
Stills only, no human eye in play; the Queen's fight not replayed with the new light (no gameplay change); the shaft-light is subtle on some screens; frame-cost passed but I did not time the dark pass on a phone.

## QUESTIONS FOR DANIEL
1. The Underwell has no act row in the combat-part-2 curve table: level-quality reads it as act 1 (band 40-250%, it lost 226%). Rec: file it with the desert act (Well Town / Red Gorge) when the table is next touched; not retuned here.
2. Darkness: dark 0.3 with warm pools. Rec keep; if it feels murky on a phone raise it down to 0.22.
