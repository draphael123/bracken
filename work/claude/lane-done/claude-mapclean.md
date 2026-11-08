# claude/mapclean - MAP DECLUTTER (Daniel 11-07, for the Sunday follow-up patch)
Branch claude/mapclean off claude/batch150 (e629fed7e). Worktree bracken-mapclean. CODE ONLY - no browser was run (full suites running), so nothing here has been SEEN yet.

## Before / after
BEFORE: a wood plate on every open node, two flags + a campfire/red banner + a gold/white medal ring per node, boss ghosts (greyed) for beaten bosses, orange dotted pulse discs round the lit Burning Village spur, a 208x54 card with blurb, postcard, times, loot, quest, difficulty; the demo caption could sit over nodes.
AFTER (src/main.js drawMap/drawMapPanel/updateMap, src/map-plates.js panelSize, src/demo-end.js mapCaption):
1. NAME PLATES: only the node you stand on, its road neighbours (plateNeighbours), its side roads, and a store within 70 px (both ends while walking). Others are their disc + icon. HOLD C (keyboard C/L; pad LB/RB = block) shows every name; touch gets a NAMES chip (top corner opposite the card) that toggles. TAB is unchanged (THE LEVELS LIST). Footer: 'Z ENTER  TAB LEVELS  X BEASTS  C NAMES' (the word ARROWS was dropped to make room).
2. ONE BADGE per node, 9x9 whole-pixel disc at the disc's upper right: NEW (amber !, not walked), CLEARED (green tick), ALL MEDALS (gold star; = gold medal, medal 3), LOCKED (grey padlock). Walked-but-uncleared nodes show no badge. The rim ring is now one colour (dim when locked); flag, red banner/campfire (MFX.drawNodeStates no longer called) and gold ring are gone. Stores get no badge unless locked.
3. COMPACT CARD 160x40 (store 160x22), was 208x54, placed by the existing placePanel (it already prefers the side away from the node). Page 1: name, RECOMMENDED LV, danger pips (no word), best medal, CLEARED tick, difficulty (UP/DOWN still change it), 'E MORE'. MORE page (E / pad talk / tap the card, same size): best time, silver x/3, gold x/y, the three medal times, quest, no-hit, iron. Thumbnail and one-line blurb dropped (they do not fit); the blurb stays in the levels list data.
4. DECORATIONS: map boss sprites (and the hornets' nest pine) only while unbeaten; the orange dotted pulse discs/ring round the lit spur are removed (the ember path and bobbing NEW arrow stay). Props baked into MAPC under roads were NOT touched (needs a screenshot pass - see owed). Inn house, river, castle, mills kept.
Demo: hidden nodes/caption logic unchanged; the caption now also avoids node boxes and the card, trying under the header, then over the footer, then stepping down.

## Verified (node, no browser)
node --check src/main.js, src/demo-end.js, tools/map-scale.mjs ok. Green: map-grammar, map-spacing (56 nodes; card is smaller so fewer reds), map-roads, additional-areas, demo-cut.
Intended check change: tools/map-scale.mjs lost its blurb-fits-the-card line (blurb no longer on the card).

## OWED (needs a browser when RAM/suite allows)
- tools/map-scale.mjs, tools/map-footer.mjs (new footer text; I estimate ~22 px gap), tools/textfit.mjs mapcard, tools/touch.mjs (card tap / NAMES chip hit boxes) - all use cdp.mjs, not run.
- Stills: full map + demo map (wood sheet, Kingswood selected - caption), crown sheet, a node with a long name (THE MASKWRIGHT'S THEATRE) and a secret card, touch width, phone width (375x812): names chip placement, MORE page text fit (QUEST DONE row, silver/gold row), badge legibility on dark vs light ground, the 'NEW' badge on a fresh save.
- Look for baked props sitting on roads/nodes in the stills (MAPC bake); not edited.

## Questions (rec first)
1. ALL MEDALS = gold medal on the level (medal 3). Rec: keep. Alt: require silver 3/3 + all gold coins + quest.
2. Walked-but-uncleared nodes carry no badge. Rec: keep (NEW means untouched). Alt: a small open ring.
3. NAMES on hold C (pad LB/RB), TAB stays levels. Rec: keep. Alt: TAB hold = names, tap = list (needs a timing rule).
4. Blurb dropped from the card. Rec: keep dropped; alt: show it on the MORE page truncated.
