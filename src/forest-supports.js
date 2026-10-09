/* src/forest-supports.js - THE FOREST AND CRAG LEVELS STAND THEIR SLABS ON THEIR OWN SUPPORTS (claude/forestsupports, Daniel 2026-10-08: "no genre exception").
   Every board run, rock slab or stone block that floats (src/island-posts.js islandsOf) gets routeSupports entries with a `kind`, drawn by src/forest-supports-art.js:
     scree rock pillars / corbels, hanging vine-wrapped boughs, moor bog-oak piles, skyroad cloud-stone pillars, rootway gnarled roots,
     glasssea glass pedestals, witchlight rune-stone pillars.
   A support runs down to the first tile under it (<= GROUND rows); with nothing near, it ends free in the level's own manner (a tapering stalactite, dangling roots, a cloud).
   NO tile changes: route, walker and mash rows are untouched. tools/solid-islands.mjs counts these as drawn supports. */
export const FOREST_KIT = { scree: 'rock', hanging: 'vine', moor: 'pile', skyroad: 'cloud', rootway: 'root', glasssea: 'ice', witchlight: 'rune' };
export const FREE_LEN = { rock: 5, vine: 6, pile: 3, cloud: 6, root: 6, ice: 5, rune: 6 };
const GROUND = 16, STEP = 10;

export function addForestSupports(L, id, T, islandsOf) {
  const kind = FOREST_KIT[id]; if (!kind || !L || !L.grid) return L;
  const W = L.W, H = L.H, g = L.grid; if (!L.routeSupports) L.routeSupports = [];
  const have = new Set(L.routeSupports.map(p => p.x + ',' + p.y));
  for (const s of islandsOf(L, T)) {
    const cellSet = new Set(s.cells), low = new Map();   /* x -> lowest cell row of that column */
    for (const j of s.cells) { const x = j % W, y = (j / W) | 0; if (cellSet.has(j + W)) continue; if (!low.has(x) || low.get(x) < y) low.set(x, y); }
    const xs = [...low.keys()].sort((a, b) => a - b), runs = []; let cur = null;
    for (const x of xs) { if (cur && x === cur[cur.length - 1] + 1) cur.push(x); else { cur = [x]; runs.push(cur); } }
    const picks = [];
    for (const r of runs) {
      if (r.length <= 3) picks.push(r[(r.length - 1) >> 1]);
      else { picks.push(r[0], r[r.length - 1]); for (let k = STEP; k < r.length - 4; k += STEP) picks.push(r[k]); }
    }
    for (const x of picks) { const y = low.get(x); if (have.has(x + ',' + y)) continue;
      let b = y + 1; while (b < H - 1 && b - y <= GROUND && g[b * W + x] === T.AIR) b++;
      let free = false;
      if (g[b * W + x] === T.AIR || b - y > GROUND) { free = true; b = y + 1; const n = FREE_LEN[kind]; while (b - y <= n && b < H - 1 && g[b * W + x] === T.AIR) b++; b = Math.min(b, y + 1 + n); }
      if (b - y < 2) continue;
      L.routeSupports.push({ x, y, bottom: b, kind, free }); have.add(x + ',' + y); }
  }
  return L;
}
