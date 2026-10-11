# claude/barriers - THEMED BARRIERS (art only)

Table: `src/barriers.js` (region -> gate / boss seal / lock plate, baked once per region at level load via `BAR.prime`, never on a frame, every pixel helper clamps to the tile so nothing lands at y < 0). Regions come from `KIND_OF` in `src/exit-gates.js` (reused, not duplicated). Collision, timings, triggers, levels, hashes: untouched. Sounds: the existing gate drop/lift/land.

## Every barrier found (all go through T.PORT tiles, the setWall/setWallAt boss walls, or the lock plate)
| barrier | drawn at (main.js) | where laid | levels |
|---|---|---|---|
| T.PORT tile (every gate column) | `portSpr` main.js:262, resolveTiles 1233, gateFx land 1827 / draw 2100 | level.js lays T.PORT: 1066, 1554, 1958, 2405, 3060, 3156, 3434, 3640, 3870, 4657 (tidegate), 5515, 5996, 6240, 6357 (winch slab), 6398, 6580, 6794, 7058 (tidegate), 7289, 7586, 7627, 7674 (lockgate), 7725, 7808 (vault); also additional-areas.js:44, burial-caverns.js:153/201, harbor-expansion.js:47, keep-expansion.js:81, lit-church.js:268, stormhold-town.js:54, tower-ascent.js:280, unburied-field.js:218, witchlight.js:148 | static columns (tools/barriers-inventory.mjs): kings 2, hanging 1, spire 1, storm 3, crown 7, longwater 3, lamplit 2, underleaf 3, keep 3, causeway 1, harbor 2, waymeet 1, fields 1, burial 2, mage 6, fallingtower 1, witchlight 1, unburied 1, church 12 |
| section / alarm / garrison gates (bell) | same tiles; raise at main.js:24514, lift 23148 | ents `alarms` | storm 2, crown 4, underleaf 4, undercrown 1, church 12, ksar 12, buriedcity 9 |
| winch gates | 23154 (re-drop), 2692 capstan | ent `winch` | storm 2, crown 3, waymeet 1 |
| elite gates (room fills, lifts on clear) | laid main.js:2913 (eliteGates), lifted 2923 (tileSpr rebuilt by resolveTiles -> portSpr) | `e.gate` on elites | 34 elites over wood, marsh, stockade, spore, scree, moor, storm 3, longwater, reef, flotilla, hurricane, deep, keep, causeway 2, burning, oreroad, caravan, fair, theatre, canal, welltown, redgorge, underwell, skyroad, glasssea, ksar, rootway, minecart, church, towpath, buriedcity |
| ambush sills | 2742 / 2799 | src/ambush.js | any ambush level |
| tide gates | T.PORT + `tidegate` ent (label 29096) | level.js 4657, 7058 | longwater 3, causeway 1 |
| key (lock) gates + plate | plate `BAR.plate` main.js:28924 | `lockgate` ent, level.js 7674 etc | storm 3, crown 4, lamplit 1, underleaf 3, mage 1 |
| mini-boss gate (lifts when the mini falls) | T.PORT | `L.mini.gate` | kings, hanging, spire, crown, lamplit, harbor, waymeet, fields, burial, mage, fallingtower, witchlight, unburied, welltown |
| mini-boss wall | `setWallAt` main.js:9892 (was a wooden palisade everywhere) | `L.mini.wallL` | every level with a mini |
| BOSS-ROOM SEAL (the vines) | `setWall` main.js:9906 (+ mother 9909) | `L.arena.wallL/wallR`, raised in bossStart | every boss level (inventory seal=...) |
No shutters or other door barriers exist (`doorway needs` = 0; town `door` props are not barriers).

## The look per region
| region | gate (T.PORT) | boss seal (and mini wall) | lock plate |
|---|---|---|---|
| forest | woven thorn hurdle: hazel stakes, withies woven over/under, thorns | heavier hurdle: thorn bramble with leaves and berries (vines fit here) | carved wood knot |
| marsh | sunk logs: four mossed round logs stacked, mud between | lashed reed-and-stake palisade, rope lashings, reed tufts | bone/peg plate |
| fungus | mycelium web: fleshy cords, pale threads, spore glints | bracket-cap wall: stacked purple shelf fungus | cap plate with glowing slit |
| crag | stacked stones: loose flat stones, uneven courses | rockfall: heavy boulders, moss, cracks | stone slab |
| mine | cage door: rusted lattice in a timber frame | timber cribbing: crossed baulks, iron straps | iron box |
| storm | the ORIGINAL iron portcullis (iron fits) | banded iron slab, rivets, a blue lightning sheen | original plate |
| coast | net hung on driftwood, corks, a glass float | ship planks, nails, barnacle specks | brass plate |
| canal | stop-planks dropped in the lock slots, weed | lock-gate leaf: wet planks, iron straps | bronze lock wheel |
| inland | churchyard railings: black wrought iron, collars, gold dot | clipped yew hedge on iron bars, red berries | black iron + gold |
| desert | sandstone slab with a carved band | pouring sand curtain | sandstone plate with a scarab |
Boss touches (BOSS_SEAL): queen = honeycomb wax wall; puppeteer = red stage curtain; wickerqueen = wicker; pyromancer = charred stakes with embers; duneworm = sand curtain (was drystone). Kept as before (already themed): chief/master palisade, suncatcher ice, ram ochre wall, lance/roc/golem/prince drystone, gqueen portcullis (storm = original, so unchanged).

## Checks (PORT 8834, sequential)
- pixels (headless floats): ok, 46 levels, 2963 sprites
- mark-integrity: ok
- boss-fight-end: ok, 60 of 60 (46 bosses, 14 minis) end on the boss's death (seals open)
- elites: ok, 77 elites, every gate opens onto the route; gate-openers --static: ok (27); gate-alpha: ok
- modulepreload: ok, 403 modules listed (+1: src/barriers.js); index.html regenerated
- no text changed, so textfit not needed; collision/timing/hash code not touched (main.js diff = sprite lookups only)

## Shots (work/claude/shots/barriers/)
`sheet.png` (all ten regions: gate 2x6, seal 2x6, plate; the old portcullis/vine and the five boss touches). In-game: `<level>-gate-closed|open[-screen].png` (kings, hanging, harbor, burial, waymeet: mini gate shut then lifted; marsh/oreroad/storm/wood/welltown: static or none), `<level>-seal-closed|open[-screen].png` for wood, marsh, kings, hanging, oreroad, storm, harbor, waymeet, burial, welltown. Limitation: the arena camera is locked 8 px outside wallL, so in play a seal is only a thin edge strip; several in-game crops frame the wrong spot (the tool, not the art). The sheet is the reliable picture. tools: barriers-inventory.mjs, barriers-sheet.mjs, barriers-shots.mjs.

## QUESTIONS FOR DANIEL (rec first)
1. Open animation/sounds reused as-is (stone grind/chain). Rec (built): keep; a region-specific set (wood creak for forest/marsh, sand hiss for desert) would need audio assets.
2. Inland seal is a yew hedge on iron: right for churchyard/fields/witchlight, odd for the Archmage's tower and the Paladin church. Rec (built): keep one inland look; say if mage/church should take the black iron slab.
3. Boss touches only on five bosses. Want more (Kraken net-and-chain, Colossus sandstone, Hourglass King sand)?
