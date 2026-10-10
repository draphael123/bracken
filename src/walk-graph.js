/* src/walk-graph.js - THE WALKER'S MOVEMENT GRAPH (claude/walkerctl). A browser-safe copy of the directed movement graph tools/pacing.mjs routes over
   (the reach fill's own edges, src/reachcore.js floodReach with rides, plus the gusts), with a Dijkstra from any footing to any goal.
   tools/level-walk.mjs asks it for the two moves the route alone does not carry:
     - A SIDE TRIP: the key up a tower / off the floor for a shut lockgate on the way (path route node -> key -> back onto the route);
     - AN ESCAPE: a hero who has fallen off the route (a chimney slot, a pit) is routed back onto it from where he stands.
   A cell is [x, y] = the column and the BODY row (feet at (y + 1) * 16), the same cells tools/pacing.mjs's route is made of.
   Pure data in, pure data out (no DOM, no node): imported in the page by the walker. */
import { floodReach } from './reachcore.js';
const TS = 16;
export function makeGraph(L, T, o = {}) {
  const W = L.W, H = L.H, N = W * H, R = floodReach(L, T, { rides: true, hero: o.hero });
  const foot = new Uint8Array(N);
  for (const k of R.footing) { const c = k.indexOf(','), x = +k.slice(0, c), y = +k.slice(c + 1); if (x >= 0 && y >= 0 && x < W && y < H) foot[y * W + x] = 1; }
  const cache = new Map();
  const edges = u => { let a = cache.get(u); if (a) return a; a = []; const ux = u % W, uy = (u / W) | 0, stamp = new Set();
    R.expand(ux, uy, (nx, ny) => { if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; const v = ny * W + nx; if (v === u || !foot[v] || stamp.has(v)) return; stamp.add(v);
      a.push(v, Math.min(16, Math.max(1, Math.abs(nx - ux), Math.abs(ny - uy)))); });
    for (const gu of (L.gusts || [])) { if (gu.arena || ux * TS < gu.x0 || ux * TS >= gu.x1 || uy * TS < gu.y0 - 3 * TS || uy * TS >= gu.y1) continue;
      for (let k = 2; k <= 10; k++) for (let dy = -3; dy <= 4; dy++) { const x = ux + gu.dir * k, y = uy + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const v = y * W + x; if (foot[v] && !stamp.has(v)) { stamp.add(v); a.push(v, k); } } }
    cache.set(u, a); return a; };
  /* the footing cell at or under (x, y) in this column (what pacing's settle does) */
  const settle = (x, y) => { x = Math.max(0, Math.min(W - 1, x)); let yy = Math.max(0, y); while (yy < H - 1 && !foot[yy * W + x]) yy++; return foot[yy * W + x] ? yy * W + x : -1; };
  /* the footing cell nearest (x, y) inside a box (rx, ry), or -1 */
  const near = (x, y, rx = 2, ry = 2) => { let best = -1, bd = 1e9; for (let dy = -ry; dy <= ry; dy++) for (let dx = -rx; dx <= rx; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H || !foot[yy * W + xx]) continue; const d = Math.abs(dx) * 2 + Math.abs(dy) * 3; if (d < bd) { bd = d; best = yy * W + xx; } } return best; };
  /* Dijkstra from cell s until goal(v) holds for a settled cell v: the cells s..v, each [x, y], or null (maxCost bounds the search) */
  const path = (s, goal, maxCost = 2500) => {
    if (s < 0) return null;
    const dist = new Map([[s, 0]]), par = new Map(), B = [[s]];
    for (let k = 0; k < B.length && k <= maxCost; k++) { const b = B[k]; if (!b) continue; B[k] = null;
      for (const u of b) { if (dist.get(u) !== k) continue;
        if (goal(u)) { const out = []; for (let v = u; v !== undefined; v = par.get(v)) out.push([v % W, (v / W) | 0]); return out.reverse(); }
        const a = edges(u); for (let j = 0; j < a.length; j += 2) { const v = a[j], nd = k + a[j + 1]; if (!dist.has(v) || nd < dist.get(v)) { dist.set(v, nd); par.set(v, u); (B[nd] ||= []).push(v); } } } }
    return null; };
  return { W, H, foot, edges, settle, near, path, cell: (x, y) => y * W + x };
}
