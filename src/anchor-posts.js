/* src/anchor-posts.js - THE RED GORGE AND HIGHCROWN HANG EVERY LEDGE ON SOMETHING (claude/polish1028, anchor-lint polish, Daniel 10-28 'Recs are fine').
   tools/anchor-lint.mjs listed overhangs (a long board with posts at its ends and nothing under its middle), cantilevers (a thin run joined to rock at one end,
   its tip in the air), islands with no drawn support and wall windows set on air. This pass adds the missing drawn supports: an extra post under the loose
   columns of each board, a post under the free tip of each cantilever.
   routeSupports only: NO TILE CHANGES (the route, the walker and the mash rows are untouched; the level hash is unchanged).
   Same geometry the lint reads (OVER 1.25: a post holds the columns within 1.75 of it). A post runs down to the first tile under it; with no tile within
   MAX rows it is a short stub (a corbel into the wall), which the lint counts but which does not draw a mile of pole. */
import { islandsOf } from './island-posts.js';
export const ANCHOR_LEVELS = new Set(['redgorge', 'crown']);
const OVER = 1.25, LIP = 2, THIN = 2, MAX = 40, STUB = 3;

export function addAnchorPosts(L, id, T) {
  if (!ANCHOR_LEVELS.has(id) || !L || !L.grid) return L;
  const W = L.W, H = L.H, g = L.grid, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : g[y * W + x], air = t => t === T.AIR || t === T.NET;
  if (!L.routeSupports) L.routeSupports = [];
  const have = new Set(L.routeSupports.map(p => p.x + ',' + p.y));
  const reach = p => (p.w ? p.w / 32 : 0.5) + OVER;
  const live = () => L.routeSupports.filter(p => !p.free && p.bottom > p.y + 1);
  const drop = (x, y) => { let b = y + 1; while (b < H - 1 && air(at(x, b)) && at(x, b) !== T.NET && b - y <= MAX) b++; return (at(x, b) !== T.AIR && b - y <= MAX) ? b : y + 1 + STUB; };
  const add = (x, y) => { if (have.has(x + ',' + y)) return false; const bottom = drop(x, y); if (bottom - y < 2) return false; L.routeSupports.push({ x, y, bottom }); have.add(x + ',' + y); return true; };
  const isl = islandsOf(L, T), inIsland = new Set(); for (const s of isl) for (const j of s.cells) inIsland.add(j);
  /* 1. islands: a bare one gets a post under each end; a held one gets posts under every column the posts above leave past their reach */
  for (const s of isl) {
    const cells = new Set(s.cells), low = new Map();
    for (const j of s.cells) { if (cells.has(j + W)) continue; const x = j % W, y = (j / W) | 0; if (!low.has(x) || low.get(x) < y) low.set(x, y); }
    const cols = [...low.keys()].sort((a, b) => a - b); if (!cols.length) continue;
    const mine = () => live().filter(p => p.x >= s.x0 - 1 && p.x <= s.x1 + 1 && p.y >= s.y0 - 1 && p.y <= s.y1 + 1);
    const loose = () => cols.filter(x => !mine().some(p => Math.abs(x - p.x) <= reach(p)));
    for (let guard = 0; guard < 60; guard++) { const l = loose(); if (!l.length) break;
      const c = l[0], q = cols.includes(c + 1) && l.includes(c + 1) ? c + 1 : c;   /* set the post one in from the loose edge so it covers three columns */
      if (!add(q, low.get(q))) { if (!add(c, low.get(c))) break; } }
  }
  /* 2. cantilevers: a post under the free tip */
  for (let y = 0; y < H - 1; y++) { let x = 0;
    while (x < W) { if (air(at(x, y)) || !air(at(x, y + 1)) || inIsland.has(y * W + x)) { x++; continue; }
      const x0 = x; while (x < W && !air(at(x, y)) && air(at(x, y + 1)) && !inIsland.has(y * W + x)) x++; const x1 = x - 1, n = x1 - x0 + 1;
      const lA = !air(at(x0 - 1, y)), rA = !air(at(x1 + 1, y)); if (lA === rA || n <= LIP) continue;
      const tip = lA ? x1 : x0; let th = 0; for (let yy = y; yy >= 0 && !air(at(tip, yy)); yy--) th++;
      if (th > THIN) continue;
      const held = () => live().some(p => p.x >= x0 - 1 && p.x <= x1 + 1 && Math.abs(p.y - y) <= 1 && Math.abs(tip - p.x) <= reach(p) + LIP);
      if (held()) continue;
      const step = lA ? -1 : 1; let q = tip + step * 1;   /* one in from the tip, so the post is under the board */
      if (q < x0 || q > x1) q = tip; add(q, y); } }
  return L;
}
