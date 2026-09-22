# Visual audit, 2026-09-21: every level, three checkpoints each (`docs/audit/sheet-0..4.jpg`)

Captured from this branch's copy of the game (the live code minus the Mother Cap commit), 3 shots per level at its checkpoints
20% / 50% / near the end. Ranked worst first. The config column is `L.palette` (sky / far / mid / near / fg / dress).

## What the weak levels have in common
1. **The same ground everywhere**: a thick grey gravel slab (the crag set's) under the crag, castle, harbour and tower levels.
   It fills a third of the screen and says nothing about the place.
2. **An empty middle distance**: nothing between the backdrop and the floor. The good levels (Bracken Wood, Kingswood, the
   Flotilla, Waymeet) put trees, masts, houses and lamps there.
3. **One sky for five levels**: the crag dusk (purple-orange with the same clouds) on Scree, Hanging Village, Stormhold, Highcrown
   and Harbor, so they blur together.
4. **No foreground layer and no dressing**: `fg` is unset on all of them; Highcrown, the Undercrown, Burial and the shops have
   `dress: 'none'`.
5. **Wallpaper**: one motif repeated on a grid (Burial's candle shelves, the Mage's bookcases), which reads as a pattern, not a place.

## Ranking (worst first)
| # | level | what reads badly | config |
|---|---|---|---|
| 1 | the three SHOPS | dark empty brown rooms, a shelf and two lamps; no backdrop | no far/mid/near, dress none |
| 2 | HIGHCROWN | a castle with no castle in it: flat grey floor, dusk sky, a few banners at the very end | crag + crown mid, dress none |
| 3 | STORMWRECK HARBOR (out of the campaign) | grey slab, dusk sky, almost no props | shore/reef borrowed |
| 4 | THE UNDERCROWN | flat brown dark, the floor and wall the same value | all crag, dress none |
| 5 | HANGING VILLAGE, SCREE PATH, STORMHOLD | the crag trio: the same sky, the gravel slab, sparse | all crag |
| 6 | THE MAGE'S FOLLY, THE FALLING TOWER | grey brick and bookcase wallpaper, dark blue, little to look at | mage set |
| 7 | BURIAL CAVERNS | the candle-shelf wallpaper on a grid | all crag, dress none |
| 8 | THE MONASTERY | washed-out white on white, low contrast | crag layers |
| 9 | THE DEEP, THE UNDERWATER KEEP | murky and sparse (fair for underwater, but little silhouette) | reef set |
| 10 | THE DROWNED CAUSEWAY | grey, saved by rain and props | shore/causeway |

**Look good** (the bar to match): Bracken Wood, Marsh Wood, Kingswood, Sporewood, the Stockade, the Long Water, the Flotilla,
Waymeet, the Hexed Fields, Underleaf, Gale Moor, the Reef, the Hurricane Deck, the Lamplit Street.

Note: the pirate ship levels themselves (the Flotilla, the Hurricane Deck) came out mid-to-good at these checkpoints; the
harbour-and-slab look is Stormwreck Harbor's, and the Sky Ship (not in the level list) borrows crag mountains.

## The fix, in order
1. A CRAG REDRESS: a new ground (layered rock with ledges and grass tufts instead of the slab), three distinct skies (Scree's
   dusk, the Hanging Village's morning, Stormhold's storm), a mid layer of houses/ruins/pines, and dressing on. It lifts
   five levels at once.
2. HIGHCROWN + THE UNDERCROWN: a castle set (banners, tapestries, pillars, windows with light shafts; foundations and roots below).
3. THE SHOPS: three interiors (a forest store, a mountain store, a chandler's) with a backdrop wall, shelves of wares, a counter.
4. De-wallpaper Burial and the Mage's tower: break the grid (vary spacing, mix 3-4 motifs, add depth layers).

## Fix 1 done (as art, not wired): THE CRAG REDRESS - `src/redraw/crag_redress.js`, scenes in `docs/crag-redress.png`
Three looks for the three levels that shared one: **Scree Path** (dusk: amber sky, a low sun behind a snowcapped range, foothills with
scree fans and pines, a ruined watchtower), **the Hanging Village** (morning: a clear sky, the cliff face with ledges, moss and cracks,
timber houses on stilts with lit windows and rope bridges between), **Stormhold** (storm: slate cloud, lightning behind jagged peaks,
the hold's walls and towers on the ridge, rain). All three stand on ROCK instead of the slab: layered strata that carry across tiles,
grass that lips over its corners, lit west faces and shaded east ones, a slab ledge, mud, and their own dressing kits.
**Wiring (after the Burning Village):** in main.js's backdrop setup (~626) add `pal.sky/far/mid/near === 'screeDusk' | 'hangingMorning'
| 'stormhold'` cases calling `bakeCragSky/Far/Mid/Near(theme)`; in resolveTiles (~701) a `pal.set === 'crag:<theme>'` arm that uses
`bakeCragGround(theme)` as SET2 (its shape is the game's own); `GROUND_KITS[id]` from `CRAG_KITS[theme]` + the props; then set the
three levels' palettes in level.js. Tools/check would then want the readability pass re-run on them (L* of foes against the new skies).

## Fixes 2-4 done (as art, not wired): `src/redraw/redress2.js`, scenes in `docs/redress2.png`
- **HIGHCROWN** (`castle`): the great hall's granite back wall, three arched windows on the night with the moon, the queen's plum
  banners between, columns with torches, tapestries, chandeliers; flagstone floor and corbelled balconies; armour, braziers, rugs.
- **THE UNDERCROWN** (`undercrown`): the pit under the castle, its foundation arches overhead, water dripping, roots hanging, timber
  shoring and lamps; packed rubble ground, shoring-plank ledges; rubble, props and lamps as dressing.
- **THE MAGE'S TOWER** (`mage`, the Folly and the Falling Tower; their tiles stay): the bookcase wallpaper broken up. Cases of
  different heights and widths, gaps with moonlit windows, rolling ladders, floating candles, hanging lamps.
- **THE MONASTERY** (`monastery`; the monks' tiles stay): a deep high-altitude blue over a sea of cloud with far peaks, and the
  terraces down the mountain, each with a red-roofed hall, pines and prayer flags. Its pale stone now has something to stand against.
- **THE SHOPS** (`shopWood`, `shopCrag`, `shopSea`): a log store (hanging herbs, jars and sacks), a mountain store (stone, pelts,
  rope, lanterns), a chandler's (hull planking, nets, a ship's wheel, brass), each with its own floor and shelf ledges.
- **Burial Caverns** is left to the session reworking it now (`src/burial-expansion.js` in the main repo); its candle-shelf
  wallpaper should be broken the same way as the Mage's bookcases.
**Wiring** is as for the crag: backdrop cases (main.js ~626) calling `bakeRedressSky/Far/Mid/Near(theme)`, a `pal.set` arm in
resolveTiles using `bakeRedressGround(theme)` as SET2 where it returns one, `GROUND_KITS` from `REDRESS_KITS`. Indoor themes
return no sky: draw the far layer (320x180) as the back wall.
