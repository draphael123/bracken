// src/tower-flyers.js - THE FALLING TOWER'S FLYERS KEEP TO THE FLOORS (round 3, Daniel 2026-09-27: "too many flying foes in this level,
// especially over platforming ... flyers only on flat ground / rooms"). A flyer over a stair of ledges is a hit you take mid-jump from
// something you cannot fight from where you stand; over a floor it is a fight. So a flyer starts over FLAT GROUND: within FLAT.rise rows
// of solid floor that runs FLAT.half tiles either side of it, open over the top, with no spikes in it and no poison over it. On a stair
// the tower puts a creature that walks, or nothing. src/tower-ascent.js places by it, level.js's sprinkler (L.flatFlyers) keeps to it,
// and tools/tower-flyers.mjs holds every flyer in the built level to it.
export const TOWER_FLYERS = new Set(['tome', 'imp', 'bat', 'boo', 'haunt', 'broom']);
export const FLAT = { rise: 6, half: 4 };
export function overFlat(L, T, x, y) {
  const W = L.W, H = L.H, at = (cx, cy) => (cx < 0 || cy < 0 || cx >= W || cy >= H) ? T.SOLID : L.grid[cy * W + cx];
  let gy = y; while (gy < H && gy - y <= FLAT.rise && at(x, gy) === T.AIR) gy++;
  if (gy - y > FLAT.rise || at(x, gy) !== T.SOLID) return false;
  for (let dx = -FLAT.half; dx <= FLAT.half; dx++) { const t = at(x + dx, gy), up = at(x + dx, gy - 1);
    if (t !== T.SOLID || up === T.SOLID || up === T.SPIKE) return false; }
  const px0 = (x - FLAT.half) * 16, px1 = (x + FLAT.half + 1) * 16;
  return !(L.pools || []).some(p => p.harm && p.x1 > px0 && p.x0 < px1 && p.y <= gy * 16 + 8 && (p.bottom === undefined || p.bottom >= gy * 16 - 8));
}
