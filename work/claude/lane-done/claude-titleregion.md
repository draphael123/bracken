# claude/titleregion - TITLE SCENE BY REGION

## What it does
- src/title-region.js (pure): `regionAt(LEVELS, cleared)` = region of the deepest level on the gate chain (campaign-order depthsOf) that the slot has cleared OR unlocked. Spurs (burning, harbor, church, unburied, undercrown) take their gate's region by walking `needs`; a level may carry `titleRegion: '<id>'` to override.
- src/main.js: `titleRegion()` reads PROG only (PROG is the last-played slot: loadSlot keeps bracken.slot). `titleLayers(rid)` bakes the region's sky/far/near once from the bakers its own levels use (cached per region+VH; no per-frame bakes). Wash colour per region. Horizon (Sunspire/castle) keeps wood/coast/inland/crag styles.
- Menu music: the region's own existing track, only if the slot has already heard it (so the title never unlocks a Sound Test row), and never over a bought menu track; the wood = title as it was (null). Set on entering the title / region change, not per frame.
- Hero: K (the slot's hero, skin, gear) stands at the fire, idle, and dances for ~2 s every 9 s; the roster seat of that hero is skipped (it filtered 'knight' before, so a non-knight slot hero was doubled).
- Empty save / new player = forest = the title unchanged (except the knight now also dances).
- Save data is only read (tool asserts localStorage byte-identical).

## Regions (road order) - opener / track / backdrop
forest (wood) theme(unchanged) | marsh (marsh, stockade, burning) theme2 | fungus (spore..underleaf) sporewood | crag (scree..skyroad) mountain | mine (oreroad, minecart) oreroad | storm (storm, crown, undercrown) stormhold | coast (longwater..causeway, harbor) longwater | canal (waymeet, towpath, canal, church, theatre, fair) canal | inland (fields..unburied) fields | desert (caravan..buriedcity) welltown.
HOOKS (no levels yet, borrow desert art): frost (snow), volcano, demon. To wire: give the new levels `titleRegion: 'frost'` etc. (or add the opener to SPINE) and replace that row's sky/far/near names + add bakers in titleLayers.

## Checks (PORT 8824)
title-region (10 regions: region id, track, saves untouched, no page errors, <1ms/frame) green; modulepreload (title-region.js added to index.html); see final message for titlescene/textfit/uiscreens/save-slots/mobile-perf.

## Shots (work/claude/shots/titleregion/)
forest.png marsh.png fungus.png crag.png mine.png storm.png coast.png canal.png inland.png desert.png

## QUESTIONS FOR DANIEL
1. (rec: keep) Region = furthest UNLOCKED wood, so the title changes the moment a region opens. Alternative: furthest cleared.
2. (rec: keep) A bought menu-music track beats the region track. Alternative: region wins.
3. (rec: later pass) The mine/storm/canal rows reuse crag/town art rather than their own full backdrops; a bespoke pass can swap them in titleLayers.
