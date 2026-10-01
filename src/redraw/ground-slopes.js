// ground-slopes.js - A SLOPE DRAWN IN THE LEVEL'S OWN GROUND (claude/fairlevel; Daniel, 2026-09-30: "a slope exists but no slope tile is drawn - it looks like flat ground or empty air").
// THE CAUSE: src/main.js resolveTiles gave a picture to every tile id it knew (rock, ledge, reed, bouncer ...) and to the Sunken Caravan's slopes (cvTile, in sand), and to NOTHING
// ELSE: a slope tile (ids 20-25, src/slopes.js) in any other level fell through with no sprite, so the wedge you walk up was empty air, and the rock under it, seeing a slope
// (not rock) overhead, was drawn as a grass-topped square: a staircase of flat steps drawn over a smooth ramp. (The Harvest Fair's Stall Stair and the Ore Road's ramps.)
// THE FIX: bake each slope from the level's own top and fill sprites, column by column: the fill under the surface, and the top's skin (the lip, the grass) laid ON the
// surface, following it, so a ramp reads as one hill in the level's ground. The rock under a slope is drawn as fill (main.js), not as a top.
// slopeTile(kind, top, fill) -> a 16x16 canvas (memoised on the two sprites)
import { canvas } from '../px.js';
import { heightAt } from '../slopes.js';
const TS = 16, SKIN = 6, memo = new WeakMap();
export function slopeTile(kind, top, fill) {
  let byTop = memo.get(top); if (!byTop) memo.set(top, byTop = new WeakMap());
  let byFill = byTop.get(fill); if (!byFill) byTop.set(fill, byFill = {});
  if (byFill[kind]) return byFill[kind];
  const [c, g] = canvas(TS, TS);
  for (let x = 0; x < TS; x++) { const d = Math.round(heightAt(kind, x + 0.5)); if (d >= TS) continue;
    g.drawImage(fill, x, d, 1, TS - d, x, d, 1, TS - d);                    // the fill under the surface
    const s = Math.min(SKIN, TS - d); g.drawImage(top, x, 0, 1, s, x, d, 1, s);   // the top's skin, laid on the surface (it follows the slope, pixel for pixel)
    if (x > 0) { const d0 = Math.round(heightAt(kind, x - 0.5)); for (let y = Math.min(d, d0); y < Math.max(d, d0); y++) g.drawImage(top, x, 0, 1, 1, x, y, 1, 1); } }   // no gap where the lip steps
  return (byFill[kind] = c);
}
