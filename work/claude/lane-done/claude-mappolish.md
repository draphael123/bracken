# claude/mappolish - map polish lane (11-05) - tip 5551952b3 (pushed), NOT merged/deployed. BROWSER OWED.
## Changed
1. Plates: locked level nodes draw dot only (no grey board, no leader line); boards show once unlocked/reached. Stores and '? ? ?' secrets keep theirs. board:'PALE' removed; plateNodes no longer uses n.board, so every board is the full name (minus THE). THE PALISADE WOOD is a TWO-LINE board (new TWO_LINE/plateLines in src/map-plates.js) with reach 46px + leader line (no 1-line or 2-line spot fits within 25px of that crowded node). Plate spots re-solved (src/map-plate-spots.js, seed 99). Landmark overlap cost raised 30->150 in plateCost.
2. Blank signposts: the MAPSIGN draw per node removed entirely (a blank board carries nothing).
3. Header: flag/medal icons replaced by two rows 'LEVELS 21/53' / 'MEDALS 40/159' (6px text rows at y3 / y11, inside the 19px bar); silver/coins untouched.
4. Level card: 'DANGER' label left of the 5 red pips; the card name now fits cw-84 (not cw-52) on level cards so it cannot run under DANGER.
5. Map life, new src/map-fx.js (pure functions of the clock, no state): per-region weather (Wood leaves, Crags snow, Desert blowing sand, Coast foam crests; none in Road Inland); carts + walkers ping-ponging the road between consecutive open stores; campfire at every open uncleared level, ash + red banner once cleared; water wheel on the wood river (292,801) and a windmill in the desert (262,98); checker fog over everything north of the furthest open node (thin near, pale solid far) which lifts as nodes open. SET.reduceMotion = no weather/travellers/turning, fog+banners static; SET.weather=false = no weather.
## Checks (node, individually; tools/check.mjs NOT run)
map-spacing ok, map-scale ok, map-roads PASS, map-grammar ok, map-footer ok. Smoke-test of map-fx with a fake canvas ok (full + reduced). node --check on main.js and map-fx.js ok.
Lint edits: tools/map-spacing.mjs allows a plate's own `reach`; tools/map-scale.mjs KNOWN landmark ratchet 2 -> 4 (palisadewood board over the stockade and spore critters).
## Owed (browser, one at a time, >=1500 MB free) - nothing was rendered
- Screenshots to take, before (master) and after: Wood sheet at start of game (few plates, fog, campfires), Wood mid-save (cleared banners), Palisade two-line board + leader, a locked store, header bar, level card with DANGER (a long name e.g. THE MASKWRIGHT'S THEATRE), Crags (snow), Coast (foam), Desert (sand, windmill), a cart on the road, reduced-motion on.
- Verify by eye: campfire/banner at (n.x+11, n.y+1) not hidden under boards or on roads; fog bands do not dim the frontier node's board; wheel sits on the river; cart sprite reads; header rows not cramped (text y 3 and 11); hero token + weather order.
- tools/textfit.mjs and the browser map tools (map-shots) were not run.
## Questions (rec first)
1. Palisade board sits ~40px from its node, over the stockade + spore critters (lint ratchet raised to 4). Rec: in a follow-up move the Palisade node or the two critters, then drop the ratchet back to 2.
2. Signposts removed outright, not shown on reached nodes. Rec: keep removed.
3. Fog is a plain checker veil. Rec: keep; tune alpha after the screenshots.
4. Campfire/banner is drawn at every level node (about 50 small sprites). Rec: keep; if too busy, show only on the Wood sheet.
