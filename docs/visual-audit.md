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
