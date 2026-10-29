# WINDCALLER 4 ART + MUSIC lane - branch claude/windcaller4 (art on top of 7639de6f)
Level hash (moor, tools/level-quality.mjs levelHash): before c0db471769a0, after c0db471769a0 - UNCHANGED (matches docs/mash-bot.json stamp). No gameplay/logic touched (only draw code, frame picks, moorRocks.x1 and routeSupports kind in level.js - none are in the hash).
FPS (tools/mobile-perf.mjs, 4x CPU, 915x412 phone): arena moor@715:12 52.1 fps (p95 35 ms), stair 47.8, start 49.6 - budget 40 OK.
GALE HARPY files untouched (src/gale-harpy.js, src/redraw/gale_harpy_art.js).

## Drawn
- Boss (src/redraw/callerram.js, frames 6-14; main.js picks by mode): hurlTell (crook swept low, cloak billowing, dust ahead), devilTell (crook spun overhead, dust ring), draftTell (crook driven point-down, palm pressing, falling-air dashes), bladeTell (crook drawn back across the body, crescent of light), blastTell (palm out, storm ball), reel (one per counted blow: head back, stars), tumble (in the air as he falls), down (dazed on the floor, crook beside him, stars), rise (lifted, feet hanging, air streaks). Existing frames 0-5 untouched.
- Attacks (src/redraw/windcaller_fx.js): bowed hurl wall + streaks + grit; dust-devil funnel with orbiting pebbles/heather + ground ring; downdraft ring tell (dashed ring, inward dust, falling chevrons) and slam column; gale-blade crescents; HIGH/LOW windows over his head (gold/green).
- Summit: the pit (dark throat, rising wind streaks, grit over the rim); east-corner and gully thorns as moor blackthorn (bone barbs, red points) via the tile kit; summit ledges as granite slabs with lit lip/brackets; wind-carved stone pillars (routeSupports kind 'torpost', east ones break to stumps when the ledge falls in P3; the old auto wood piles are no longer drawn on stair/summit); bone chimes under both roosts (lit while he stands there); cairn restyled; moorRocks.x1 703->751 so the summit floor/path tops wear the tor-country granite.
- Stair/landing/summit: gale updraft vents (stone sill + mouth, tell flicker, spiral streams and lifted dust when blowing); flags = cairn + bone staff + ragged red banner with a tusk mark (stair x>=640 only).
- Music: none new (kept Northumberland + windcaller themes). No CC0 whoosh/devil loop added (no clearly-CC0 source in hand).
## Screenshots (scratch/lane-reports/windcaller4art-*.png, also docs/windcaller4art/)
before-* (old), after-sheet, after-start, after-stair-shelf/crag/gap/gully/gust, after-landing, after-corner, after-pit, after-boss-idle/hurlTell/devilTell/draftTell/bladeTell/blastTell/howlTell/reel/fallen/rise/cast. Tool: tools/moor-wc4art-shots.mjs.
## Not done / notes
- The WIND HOLE cave got no extra dressing beyond the tor tiles. Not run: tools/check.mjs, boss-rates (art only; band stays as measured 64%).
- In my single-frame forced-pose shots the boss sprite renders whitened during tells (pre-existing tell flash, same in the 'before' shots) - worth a look live that the new poses are readable through it.
## QUESTIONS
1. Thorns are small (tile-height ~10 px): rec keep (hazard clear at game scale). Built.
2. Old wood piles under the summit were swapped for stone pillars (no generic wood). Rec keep. Built.
3. Gust whoosh / devil loop audio: rec skip until a CC0 source is picked. Built: none.
