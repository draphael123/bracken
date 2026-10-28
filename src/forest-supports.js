/* src/forest-supports.js - THE FOREST AND CRAG LEVELS STAND THEIR SLABS ON THEIR OWN SUPPORTS (claude/forestsupports, Daniel 2026-10-08: "no genre exception").
   Every board run, rock slab or stone block that floats (src/island-posts.js islandsOf) gets routeSupports entries with a `kind`, drawn by src/forest-supports-art.js:
     scree rock pillars / corbels, hanging vine-wrapped boughs, moor bog-oak piles, skyroad cloud-stone pillars, rootway gnarled roots,
     glasssea glass pedestals, witchlight rune-stone pillars, THE LUMBER TRAIL (wood) woodsmen's timber cribs (claude/lumbertrail).
   A support runs down to the first tile under it (<= GROUND rows); with nothing near, it ends free in the level's own manner (a tapering stalactite, dangling roots, a cloud).
   NO tile changes: route, walker and mash rows are untouched. tools/solid-islands.mjs counts these as drawn supports. */
export const FOREST_KIT = { wood: 'crib', scree: 'rock', rookery: 'rock', hanging: 'vine', moor: 'pile', skyroad: 'cloud', rootway: 'root', spore: 'stalk',   /* (claude/sporewood2: SPOREWOOD 2's shelves hang on the Mother's roots - the art lane may give them cap stalks) */ glasssea: 'ice', witchlight: 'rune', marsh: 'stilt' };   /* (claude/marsh2) MARSH WOOD: a bog-oak stilt under a board, a bundle of reed stalks under a tuft - driven into the bed under the water */
export const FREE_LEN = { crib: 4, rock: 5, vine: 6, pile: 3, cloud: 6, root: 6, stalk: 6, ice: 5, rune: 6, stilt: 4, reed: 4 };
const GROUND0 = 16, STEP = 10;

export function addForestSupports(L, id, T, islandsOf) {
  const kind = FOREST_KIT[id]; if (!kind || !L || !L.grid) return L;
  const GROUND = id === 'rookery' ? L.H : GROUND0;   /* (claude/rookery2) THE ROOKERY: no pier ends in the air - it goes down to whatever footing is under it, however deep (tools/anchor-lint.mjs) */
  const W = L.W, H = L.H, g = L.grid; if (!L.routeSupports) L.routeSupports = [];
  const have = new Set(L.routeSupports.map(p => p.x + ',' + p.y));
  for (const s of islandsOf(L, T)) {
    if (id === 'marsh' && L.routeSupports.some(p => p.x >= s.x0 && p.x <= s.x1 && p.y >= s.y0 - 1 && p.y <= s.y1 + 1)) continue;   /* (claude/marsh2) the marsh's stages, huts and village boards stand on their own poles already */
    const kindI = id === 'marsh' && s.raw.every(k => k === T.REED) ? 'reed' : kind;
    const cellSet = new Set(s.cells), low = new Map();   /* x -> lowest cell row of that column */
    for (const j of s.cells) { const x = j % W, y = (j / W) | 0; if (cellSet.has(j + W)) continue; if (!low.has(x) || low.get(x) < y) low.set(x, y); }
    const xs = [...low.keys()].sort((a, b) => a - b), runs = []; let cur = null;
    for (const x of xs) { if (cur && x === cur[cur.length - 1] + 1) cur.push(x); else { cur = [x]; runs.push(cur); } }
    const picks = [], widths = new Map();
    for (const r of runs) {
      if (kind === 'rock') {   /* THE SCREE PATH (claude/screefix): a hoodoo of the hill's rock under the slab, as wide as the slab lets it - one for a short ledge, a pier set in a tile from each end of a long one */
        const n = r.length, grounded = x => { let b = low.get(x) + 1; while (b < H - 1 && b - low.get(x) <= GROUND && g[b * W + x] === T.AIR) b++; return g[b * W + x] !== T.AIR && b - low.get(x) <= GROUND; },   /* the pier stands where there is ground to stand on: the nearest column to its ideal spot that has some */
          near = (x, d) => { for (const dx of [0, -1, 1, -2, 2]) { const q = x + dx; if (low.has(q) && q >= r[0] && q <= r[n - 1] && Math.abs(q - x) <= d && grounded(q)) return q; } return x; };
        if (n <= (id === 'rookery' ? 3 : 5)) { const x = near(r[(n - 1) >> 1], 2);   /* (claude/rookery2: in THE ROOKERY a ledge of four or more stands on two piers - no end hangs past its pier, tools/anchor-lint.mjs) */ picks.push(x); widths.set(x, n <= 2 ? 12 : Math.min(24, 10 + n * 3)); }
        else { const a = near(r[1], 2), b = near(r[n - 2], 2); picks.push(a, b); widths.set(a, 18); widths.set(b, 18); for (let k = a + 9; k < b - 4; k += 9) { const q = near(k, 2); picks.push(q); widths.set(q, 16); } }
        continue; }
      if (r.length <= 3) picks.push(r[(r.length - 1) >> 1]);
      else { picks.push(r[0], r[r.length - 1]); for (let k = STEP; k < r.length - 4; k += STEP) picks.push(r[k]); }
    }
    for (const x of picks) { const y = low.get(x); if (have.has(x + ',' + y)) continue;
      let b = y + 1; while (b < H - 1 && b - y <= GROUND && g[b * W + x] === T.AIR) b++;
      let free = false;
      if (g[b * W + x] === T.AIR || b - y > GROUND) { free = true; b = y + 1; const n = FREE_LEN[kindI]; while (b - y <= n && b < H - 1 && g[b * W + x] === T.AIR) b++; b = Math.min(b, y + 1 + n); }
      if (free && id === 'marsh') { const q = (L.pools || []).find(p => x * 16 + 8 >= p.x0 && x * 16 + 8 < p.x1 && p.y > y * 16); if (q) { free = false; b = Math.floor(q.y / 16) + 2; } }   /* (claude/marsh2) a reed bundle over the deep water goes down into it: its foot is in the pool */
      if (b - y < 2) continue;
      L.routeSupports.push(widths.has(x) ? { x, y, bottom: b, kind: kindI, free, w: widths.get(x), ...(id === 'rookery' ? { rk: 1 } : {}) } : { x, y, bottom: b, kind: kindI, free, ...(id === 'rookery' ? { rk: 1 } : {}) });   /* (claude/rookeryart: rk = THE ROOKERY's own grey, guano-streaked piers, src/redraw/rookery_world.js drawPier) */ have.add(x + ',' + y); }
  }
  return L;
}
