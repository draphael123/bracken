# claude/redgorge-art - THE RED GORGE's art pass

Art only. Gameplay geometry, numbers, the flood clock, the fix lane's glint and nudge are untouched (slopes-trace identical, route and probe green).
Before/after pictures: `work/claude/redgorge-art/before/` and `after/` (16 matching frames, plus `after/17-the-dam-crab-b.png`; cast sheets `cast-bandits`, `cast-crab`, `cast-props`). Made with `tools/redgorge-art-shots.mjs <before|after>`, `tools/redgorge-art-sheet.mjs`, and `tools/redgorge-art-cost.mjs` (ms per frame). None are in the suite.

## What changed
- **Tile kit** `src/redraw/redgorge_tiles.js` (hooked in main.js on `L.redgorge`; the caravan's rock skin no longer covers the gorge's solids):
  - banded red sandstone in strata, darker the deeper (the shade);
  - a lit lip on every standable edge (canalart's rule);
  - overhangs with a ragged hanging shadow under them;
  - the channel's rock is the one pale scoured stone, top to bottom;
  - the old dam is cut masonry (ashlar, coped top);
  - bridges are lashed planks on a log beam (cord at every joint, strapped ends); climbing ledges are rock shelves;
  - the climbing rope is a thick twisted strand with a knot every four rows.
- **Backdrop** `src/redraw/redgorge_backdrop.js` (own sky slit, far mesas, far rim crags, and a world-anchored dark BACK WALL with varnish streaks and niches). The channel's pale gully runs down it. A depth gradient darkens it the deeper you go; a warm glow sits only near the rim. The gorge now reads as a shaded canyon, not a ledge in an open sunset.
- **Props** `src/redraw/redgorge_props.js` (drawn by the hands, replacing the greybox shapes):
  - the flood and burst: a baked water texture, scrolled, with bank foam, long streaks, a churning foam head where a gate or the floor stops it, and spray on the bed and on every bridge it crosses;
  - the horn's trickle, and a damp stain that dries after a flood (wet and dry bed);
  - the gates: stone-cheeked timber frames with a hoist beam and iron-strapped board, raised, set down, or set down with a rippling banked pool;
  - the wheels: spoked wooden wheels on braced posts with lit hand pegs and a state tag (blue full / tan shut / amber open), and a rope from each wheel up to its gate's hoist to follow;
  - the water-wheels: paddle wheels that throw spray while the water runs;
  - the baskets: woven (staves, weaving, lit rim) on a V of hoist ropes to a pulley and a haul rope;
  - the jam: a heap of drowned timbers, brush, a cart's wheel, an ox skull and a snagged red scarf, with water seeping through (harder when the bank is full);
  - the bridges' under-ropes and end posts, only over air;
  - the huge stick nest, with the feathers you have laid in showing in it;
  - ochre hand stencils; a cool blue wash inside the Cave of Hands; the vault's woven door;
  - the old dam's ruined masonry face behind the plateau, with the spillway slot.
- **Weather** (`drawOver`, in front of the heroes): dust motes lit warm near the rim, and heat shimmer at the rim ONLY (the gorge's top edge, the dam plateau floor), never below. The shimmer copies one band and draws strips of it back; a self-copy per strip cost 5x the frame on the dam.
- **Cast** `src/redraw/redgorge_art.js`:
  - the CLIFF RAPTOR is now its own bird (crest, hooked beak, long forked tail, barred cream breast, a perched pose for ledges);
  - cutthroats are red-dust robes with an ochre sash, slingers have an ochre scarf and clay tunic, common scorpions are banded red clay, the elite keeper is black-red armour (swapped in only on this level through `gorgeSets`);
  - THE GREAT RED CRAB is a new 128x76 sprite (barnacled plated shell, jointed legs, big jagged claws, eye stalks) with every pose redrawn, and a new REAR pose (frame 15: front up, claws wide, mouth open, spitting bubbles) now used for phase two's refusal in place of the borrowed crush-tell. The hit box (46x28) is unchanged.

## Checks (all green on this branch)
redgorge, redgorge-probe, redgorge-route (gate plan: completes, 2 deaths, 1 lift, matches the fix lane's gate row), level-quality, pixels, floaters, dressing, occluders, render-layers, readability, footing-art, skins, textfit, frame-cost, architecture, dangling-paths, slopes-trace.
Frame time per drawn frame (ms, this PC under load, base 4fe69fc7 vs now): mouth 11.8 / 10.6, bridge two 11.2 / 9.6, jam 7.8 / 10.8, summit 7.1 / 10.3, dam 7.9 / 11.2. Noisy; no big regression after the shimmer fix (it was 62 ms on the dam before).

## UNVERIFIED
- Not hand-played: only stills at 16 spots. The crab's new frames were looked at on a sheet and in the plateau shot (not in a full fight); the boss pilot was NOT re-run (no gameplay change, sprite only).
- The rear pose shows only in phase two at the held water (not captured in-game).
- The raptor's perched frame is drawn but I did not catch it in a still.

## QUESTIONS FOR DANIEL (recommendation built)
1. **The horn tower** (the concept's skyline landmark) is not built: the gorge is so shaded that no skyline shows from the narrows on. Rec: a stone horn tower on the dam plateau's rim, seen when you walk out to the crab.
2. **The flood front.** Water arrives whole down its span (the damage is instant, by the rule), so the "front" is the churning foam head where it stops, and the foam lip at its top. A sweeping front would mean changing when it hurts. Rec: leave it.
3. **Bandits and scorpions are palette reskins** of the Well Town's frames (new colours, same poses). Rec: keep for now; bespoke gorge cutthroats/slingers would need new frames and are worth it only if the reskins still read as borrowed in play.
4. **The ropes from wheels to gates** run long diagonals (the falls' wheel is 20 rows below its gate). They are what makes the wheel read as linked. Rec: keep; if they clutter, thin them to one strand.
