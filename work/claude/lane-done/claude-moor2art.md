# Lane report: claude/moor2art (ART pass on GALE MOOR 2's new sections)

Branch `claude/moor2art`, on claude/moor2 1f61f396. Sonnet ART lane. Art only: no geometry, route, foe or rule changed
(pool objects gained a `tarn: true` flag and `L.moorRocks` gained `x0/x1`, both art metadata).

## What changed
- **Tile kit** (`src/redraw/moor_tiles.js`, new; hooked in `src/main.js` beside the other level kits, columns 535-654):
  - wind-scoured granite (slab and two-course blocks that never line up, mottled interior fill so a tor is one outcrop, not a brick wall);
  - tops are either a turf cap with a heather sprig or a bare lit slab with moss in the seam;
  - boulders (the stack on the high tor) are smooth rounded stones lit from the upper left, outlined, lichened;
  - the tarn's own black wet rock with a slime line at the bed, and wet walls beside the water;
  - the goblins' scaffold boards: bleached, mismatched, some proud, hide-cord lashings, a red tusk-paint mark, chewed ends, cord ends hanging
    (their own look, not Highcrown's `scaffold` prop).
  - The landing (647-654) wears the kit too so it does not sit as brown dirt between granite and the summit.
- **Crevices and shafts** (`src/moor-rocks-hands.js` drawCrevice): a jagged fissure with a polished lit lip and a scoured pale streak up the tor face;
  a goblin-red cloth scrap on a peg that lies toward the crack as it whistles and flies up as it blows; grit heaped at the foot. The whistle is
  seen three ways (grit swept in, wavy wind-lines climbing, the blinking chevron); the burst gets a jet, streaks and a grit spray. Gust
  shafts under the decks are a gap between sleepers with cord streamers that lift.
- **Tarns** (drawTarn, called from `drawWater` for pools with `tarn`): teal to near-black body, light shafts, rising silt; a sky-line surface, ruffle
  dashes that run with the gust (faster and brighter while it blows), scaffold posts going in dark with foam rings and wobbling reflections.
- **Scaffold** (drawWorld): squared lashed posts with ballast-stone heaps at each foot (or slimed in the tarn), thick bound X braces, tall posts with a
  tattered tusk banner, a bone bar and a lit fire basket with flame and glow (contrast at dusk), loose planks, deck clutter (bundles, ballast basket, rope coil).
  **Found and fixed:** posts ended a row above the tarn bed, hanging in the water; they now run to the rock.
- **The windmill frame** is a tapering A-frame of lashed timbers with rungs, braces, a hub, four sail arms (two with cloth strips) and a banner,
  and its guy-rope is thick hide cord on a peg. A **far silhouette** of the same frame (parallax 0.3, `drawFar`, one line in main.js's backdrop
  pass) hangs on the horizon from the high tor to the landing, so the landmark is in view before you reach it.
- New check `tools/moor-aloft.mjs` (the Unburied Field's floating-check idea, moor variant; in the check list): every grounded thing in cols 535-654
  stands on a foothold, every scaffold deck is gap-free with posts within 4 tiles of each end and each post runs to rock or the tarn bed, every tarn has a bed.
  Its first version flagged the hanging posts above (the drawing's foot rule); the second pins the corrected rule.
- New `tools/moor2art-shots.mjs` (ten named spots, god-mode hero) for the art; `tools/moor-shots.mjs` is unchanged.

## Pictures
Before: `docs/galemoor/before-01-wind-rocks.png`, `before-02-goblin-scaffolds.png`. After: `after-01-wind-rocks.png`, `after-02-goblin-scaffolds.png`
(same tool, same spots). Extras (`art-after-*.png`): crevice, ridge over the tarn, high tor, boulders, yard, deck, top deck, frame, tarn, landing.

## Checks (PORT 8621), all green
moor-aloft, moor-wind, moor-gusts, moor-rocks (3 heroes, runtime), render-layers, footing-art (every floor drawn, 30 levels), ground-depth,
frame-cost, signs, architecture, skins, weapon-skins, slopes-trace (unchanged: the moor is not a traced level), dangling-paths.

## UNVERIFIED
- A human eye on taste: the tor mass is dark under the engine's depth shading (it keeps the lit tops and turf caps readable, but a full-screen
  rock wall is still a lot of grey); boulder rounding is subtle at 320x180.
- Not re-run (nothing they read changed): relics, stuck, hint-shown, checkpoints.

## QUESTIONS FOR DANIEL (each built as recommended)
1. The summit arena (655+) and the moor before the Wind Rocks are still the brown peat kit, so a seam shows at col 535 and at 655. Rec: keep (granite
   starts where the tors do, and the arena is a boss lane's); if you want it, widen `L.moorRocks.x0/x1`.
2. The deck fire baskets are decor only (a drawn glow, not an entry in `lights`). Rec: keep; no foe or fire rule rides on them.
