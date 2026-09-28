# ART: THE SHOP INTERIORS (lane claude/shopart)

Brief: visual audit lane #3, the worst-scoring level group in the game (3.2/10, unchanged since 2026-09-21):
THE STORE (`shop`), THE HIGH STORE (`shopCrag`) and THE CHANDLER (`shopSea`) had no backdrop at all - a flat
colour wall, a shelf, a counter, two lamps (`docs/visual-audit/lanes.md` lane 3, `docs/visual-audit/levels.md`
row 34, `docs/visual-audit/bar.md`). The audit's own question 4 recommends three distinct, small interior kits
(wood / crag / sea) over one shared kit, "or a shared kit would just be a smaller wallpaper problem in the same
three rooms" - that recommendation is what got built.

## What changed

All three changes are in `src/level.js` (the three `theShop*` builders) plus their allowlist entries in
`src/dressing.js` (`ALLOWED_DECORATIONS`). No new drawing code, no new sprites, no new palette entries: every
wall theme and every prop kind reused here already exists and is already drawn somewhere else in the game.

- **THE STORE** (`shop`, wood region): its room had no theme string at all, so it fell through
  `drawRoomPaint`'s default fallback - flat brown planks, no depth. It now carries the **`hall`** room theme
  (`src/main.js`'s `st === 'hall'` branch, `TWN.bakeHallWall()` - the inn's own framed limewash, joists and
  wainscot), matching the wood region's own furniture. Added three hand-placed props, none new: a **hearth**
  (its own warm-light source - `bar.md`'s "warm pool of light" rule, item 4 - the shop had none before), a
  **mugShelf** and a **caskRack**, all `PROP.town.*` pieces already baked for Kingswood's inn.
- **THE HIGH STORE** (`shopCrag`, crag region): kept its existing **`stone`** room theme (a plain grey course
  wall - already distinct from the other two, left alone per the in-code comment warning against adding an
  `L.stone` zone here, which is a different thing: a zone-sized menhir sprite that once blanked the room). Added
  a hand-placed **standingStone** and a **cairn** (`PROP.standingStone` / `PROP.cairn`, the Scree Path's own
  crag furniture) so the room's *props*, not just its wall, read as the mountain.
- **THE CHANDLER** (`shopSea`, sea region): kept its existing **`ship`** room theme (an orlop's frames, gunports
  and swinging lanterns - already the most detailed of the three walls). Added a **hammock**, a **cannon** and a
  **pennant** (`PROP.flot.*`, the Flotilla's own ship furniture) alongside the existing chart table / rum
  barrels / sea chest / keg stack dressing, so the hulk reads fuller without repeating what THE STORE or THE
  HIGH STORE do.

Every new prop was placed on the floor row at an x with at least a 2-tile gap from its neighbours (1 tile for
the sea shop's pennant, matching the existing torch-to-coiledCable spacing there), so nothing added overlaps
the counter, the keeper, the wares stalls, the sign or the door. No shop logic touched: the counter, the trade
UI, the keeper NPC and the lock gates in `main.js` are all unchanged.

## Before / after

One capture per shop (the level's own 50%-checkpoint camera spot, via `tools/redress-shots.mjs`, comparing this
branch against a worktree of the unmodified base commit `04e4319`):

- `work/shopart/before/shop.jpg` / `work/shopart/after/shop.jpg` - the flat plank wall is now the hall's framed
  timber wall; the hearth's ember glow is visible in the 20%-checkpoint shot (not this one - see `work/audit/
  17-shop-0.jpg`, pre-existing audit capture, still shows the pre-lane look since it wasn't touched by this run).
- `work/shopart/before/shopCrag.jpg` / `work/shopart/after/shopCrag.jpg` - same wall (untouched, already
  distinct), new standing stone and cairn visible in the other two checkpoint frames.
- `work/shopart/before/shopSea.jpg` / `work/shopart/after/shopSea.jpg` - the cannon and pennant are visible by
  the counter in the after shot.

## Checks run (this PC has a full suite running elsewhere; runs kept scoped and short per the lane rules)

- `node tools/dressing.mjs` - **ok**: 2282 scatter/dressing/hand-placed decorations pass their level allowlist
  (every new kind added to `ALLOWED_DECORATIONS.shop` / `.shopCrag` / `.shopSea`); no sprinkled decoration under
  water or in a fire's reach.
- `node tools/shop-theme.mjs` - **ok**: all three shops still use the valid 40s store theme (untouched).
- `node tools/shop-gates.mjs` - **ok**: 15 store/hero gates, every one naming a real level (untouched).
- `node tools/render-layers.mjs` - **ok**: scenery behind tiles, continuous foreground mask.
- `node tools/room-patterns.mjs` - **ok**: nine interiors invariant under camera movement and clipped to room
  bounds (covers the `hall` theme now on THE STORE).
- `node tools/occluders.mjs` - **ok**: 44 levels / 147 rooms, nothing indoors, a tree only in the forest.
- REQUIRED CHECKS (level changed, so all seven run):
  - `node tools/architecture.mjs` - **ok**: 44 levels, 348 built pieces, everything built stands on something
    (2 pre-existing grandfathered, unrelated to shops).
  - `node tools/checkpoints.mjs` - **ok**: 427 checkpoints, none moved (shops have none of their own).
  - `node tools/skins.mjs` - **ok**: 3 indoor-stone levels (mage, fallingtower, witchlight - shops not among
    them; they use `palette.hall`/`stone`/`ship`, a different mechanism, untouched by this check).
  - `node tools/dangling-paths.mjs` - **ok**: 2380 tracked files, every cited path resolves (7 known, forgiven
    holes, all pre-existing and unrelated to this lane).
  - `node tools/boss-fight-end.mjs` - **ok**: 45/45 boss and mini fights end when their boss dies (shops have no
    boss; unaffected).
  - `node tools/slopes-trace.mjs` - **ok**: every frame of every level identical to the pre-slopes build (shops
    have no slopes; unaffected, and the trace did not change for any other level as required).
  - `node tools/npc-removal.mjs` - **ok**: every NPC outside the shops is still gone; the shop keeper NPCs are
    untouched.

- `node tools/textfit.mjs` (full run, all screens/heroes; 3665 screens, 37196 strings, ~13 min under this PC's
  shared load) - **ok for the shops**: the run's only findings are 2 OVERFLOW (`GEOMANCER` on the hero-pick
  screen, `SHADE` in the Sunken Caravan's boss fight), 2 COLLIDE (the Hurricane's boss-fight hint lines) and 7
  LONGHINT (pre-existing 3-line hints elsewhere) - all pre-existing, none naming THE STORE, THE HIGH STORE or
  THE CHANDLER, and none touching a sign, a hint or any text this lane added or moved. No new findings from this
  lane's change.

## QUESTIONS FOR DANIEL

1. **The wood shop's new `hall` wall theme is the same one Kingswood's tavern uses (`TWN.bakeHallWall()`).**
   Recommend: keep it - a forest general store and a forest inn share the same "timber frame, limewash,
   wainscot" language in this game's existing art, and the alternative (painting a fourth, brand-new wall
   texture) is new art the brief said to avoid. *Recommendation: built, no change needed.*
2. **THE HIGH STORE keeps its existing flat `stone` wall rather than getting a new texture of its own.** The
   in-code comment explains a zone-based menhir treatment was tried before and blanked the room; the standing
   stone and cairn added here are hand-placed sprites, not a zone, so they don't hit that bug. A deeper stone
   room theme (coursed ashlar, a proper mine-cellar texture) is more work than this lane's "reuse existing
   helpers" scope allows in one pass. *Recommendation: ship the props-only fix now (built); flag a proper stone
   wall redress as separate follow-up work if Daniel wants THE HIGH STORE's wall itself, not just its floor,
   reworked.*
