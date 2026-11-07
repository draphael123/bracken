/* src/demo-supports.js - NO DECK IN THE DEMO HANGS IN THE AIR (claude/floatfix, Daniel 11-03: "I noticed a lot of floating geometry when playing").
   The island kits (island-posts.js, forest-supports.js) set a post at each END of a board run and call it held; a deck of 22 boards with one post at each end
   reads as hovering. This pass looks at every board run of the 12 DEMO levels the way a player does: how far is each cell from the nearest thing that visibly
   holds it (a post, the ground or a wall at its end, a rope / hanger / bridge / structure over it)? Where a cell is more than REACH columns from one it sets a
   post under it (down to the first thing under, in the level's own kit), a trestle riser under a bleacher step, or a knee brace under a cantilever's tip.
   routeSupports only: NO TILE CHANGES (the route, the walker, the curve and the mash rows are untouched; the level hash is unchanged).
   tools/demo-floats.mjs reads the same runsOf() and gates the result as a per-level ratchet. */
export const DECK_W = 8, REACH = 4, BRACE_LEN = 4;

/* the kit each demo level stands its boards on. kind: a forest-supports-art kind or a level's own post kind (undefined = the level's default post, which the level's
   art skins); style: a 'demo' style drawn by src/demo-supports-art.js. maxDrop: how far a post may run (rows). */
export const DEMO_KIT = {
  arena_yard: { kind: 'demo', style: 'trestle', trestle: true, maxDrop: 12 },   /* the training yard's stair: a braced timber trestle under every step */
  hornetsnest: { maxDrop: 30 },                                           /* the nest's own paper pillars (default post, skinned by the nest art) */
  underleaf: { maxDrop: 30 },                                             /* the village's default post, skinned by its art like the 80 already there */
  kings: { maxDrop: 30 },
  palisadewood: { maxDrop: 30 },
  marsh: { kind: 'stilt', maxDrop: 20 },
  spore: { kind: 'stalk', maxDrop: 24 },
  rootway: { kind: 'root', maxDrop: 24 },
  wood: { kind: 'crib', maxDrop: 20 },
  stockade: { kind: 'stkpost', maxDrop: 30 },                              /* a lashed pole of the camp's own kit (src/redraw/stockade2_art.js) */
};

const BOARDS_T = T => new Set([T.ONEWAY, T.PLANK, T.REED, T.SHELF]);
const SUPPORT_DECO = new Set(['stilt', 'bridgepost', 'bridgetower', 'pierPost', 'column', 'pillar', 'archPillar', 'canopyPost', 'mastStump', 'mastTall', 'netPoles', 'poles', 'flagPost', 'brokenPillar']);

/* is column x at board row y held by a hung / declared thing (not a post: those are asked separately)? */
export function hungAt(L, x, y) {
  for (const e of L.ents || []) if (e.t === 'deco' && SUPPORT_DECO.has(e.kind) && Math.abs(e.x - x) <= 1 && e.y >= y && e.y - y <= 24) return true;
  for (const r of L.ropes || []) { if (Array.isArray(r)) { if (x >= r[0] - 1 && x <= r[1] + 1 && Math.abs(y - r[2]) <= 2) return true; }
    else if (r.x0 !== undefined && r.x1 !== undefined) { const a = Math.min(r.x0, r.x1) / 16, b = Math.max(r.x0, r.x1) / 16, c = Math.min(r.y0, r.y1) / 16, d = Math.max(r.y0, r.y1) / 16; if (x >= a - 1 && x <= b + 1 && y >= c - 3 && y <= d + 3) return true; } }
  for (const h of (L.monk && L.monk.hangers) || []) if (Math.abs(h[0] - x) <= 1 && h[1] <= y && h[2] >= y - 1) return true;
  for (const b of L.bridges || []) if (x >= b.x - 1 && x <= b.x1 + 1 && Math.abs(y - b.y) <= 1) return true;
  for (const z of [...(L.structures || []), ...(L.watchtowers || [])]) if (x >= z.x0 - 1 && x <= z.x1 + 1 && y >= z.top && y <= z.floor + 1) return true;
  for (const h of L.hoists || []) if (typeof h === 'object' && h.x !== undefined && Math.abs(h.x - x) <= 2 && y >= h.top && y <= h.hang + 1) return true;
  return false;
}

/* every run of boards with open air under at least one cell: { x0, x1, y, w, air, worst, worstAt, anchors } - worst = the largest distance (columns) of any cell of the run
   to the nearest anchor (a post, a standing floor under the cell, a wall / floor at the run's own end, a hung thing); 99 when the run has no anchor at all */
export function runsOf(L, T) {
  const W = L.W, H = L.H, g = L.grid, BOARDS = BOARDS_T(T), at = (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : g[y * W + x];
  const solid = t => t !== T.AIR && t !== T.NET && !BOARDS.has(t);
  const posts = (L.routeSupports || []).filter(p => !p.free && p.bottom > p.y + 1);
    const postAt = (x, y) => posts.some(p => (p.x === x && Math.abs(p.y - y) <= 1 && p.style !== 'brace') || (p.style === 'brace' && p.y === y && p.x + p.dir * p.span === x) || (p.style === 'trestle' && p.y === y && (p.x === x || p.x + p.span === x))) || hungAt(L, x, y);
  const out = [];
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W;) {
    if (!BOARDS.has(at(x, y))) { x++; continue; }
    let x1 = x; while (x1 + 1 < W && BOARDS.has(at(x1 + 1, y))) x1++;
    const cells = []; let air = 0;
    for (let q = x; q <= x1; q++) {
      const below = at(q, y + 1), standing = below !== T.AIR && below !== T.NET;   /* (a board one row over the floor is a step; two rows over it hovers) */
      let a = 0; while (y + 1 + a < H && at(q, y + 1 + a) === T.AIR) a++;
      if (!standing && a >= 2) air++;
      cells.push({ q, anchor: standing || a < 2 || postAt(q, y) });
    }
    const endL = solid(at(x - 1, y)) || solid(at(x - 1, y + 1)), endR = solid(at(x1 + 1, y)) || solid(at(x1 + 1, y + 1));
    if (endL) cells[0].anchor = true; if (endR) cells[cells.length - 1].anchor = true;
    if (air) {
      const anchors = cells.filter(c => c.anchor).map(c => c.q);
      let worst = 0, worstAt = x; for (const c of cells) { const d = anchors.length ? Math.min(...anchors.map(a => Math.abs(a - c.q))) : 99; if (d > worst) { worst = d; worstAt = c.q; } }
      out.push({ x0: x, x1, y, w: x1 - x + 1, air, worst, worstAt, anchors: anchors.length, endL, endR });
    }
    x = x1 + 1;
  }
  return out;
}

/* what the gate calls floating: wider than DECK_W with a cell > REACH from any anchor (DECK), or 2..DECK_W wide with none within REACH of its worst cell (SLAB) */
export const floating = r => (r.w > DECK_W && r.worst > REACH) || (r.w >= 2 && r.w <= DECK_W && r.worst > REACH);

function dropOf(L, T, x, y, max) {
  const W = L.W, H = L.H, g = L.grid, air = t => t === T.AIR || t === T.NET; let b = y + 1;
  while (b < H - 1 && b - y <= max && air(g[b * W + x])) b++;
  return (!air(g[b * W + x]) && b - y <= max) ? b : -1;
}

/* a post over a pool of water goes down into it (its foot is under the surface, on the bed the map does not draw) */
function poolFoot(L, x, y) { const q = (L.pools || []).find(p => x * 16 + 8 >= p.x0 && x * 16 + 8 < p.x1 && p.y > y * 16); return q ? Math.floor(q.y / 16) + 2 : -1; }

import { findSlots, SLOT_IDS } from './demo-slots.js';
export function addDemoSupports(L, id, T) {
  if (L && L.grid && SLOT_IDS.has(id)) { L.demoSlots = findSlots(L, T); L.demoStyle = id; }   /* (claude/floatfix2) a window through the terrain is backed with masonry (src/demo-slots.js) */
  const cfg = DEMO_KIT[id]; if (!cfg || !L || !L.grid) return L;
  if (!L.routeSupports) L.routeSupports = [];
  const W = L.W, have = new Set(L.routeSupports.map(p => p.x + ',' + p.y)), unfixed = L.demoFloats = [];
  const push = (x, y, bottom) => { if (have.has(x + ',' + y)) return false; L.routeSupports.push({ x, y, bottom, ...(cfg.kind ? { kind: cfg.kind } : {}), ...(cfg.style ? { style: cfg.style } : {}) }); have.add(x + ',' + y); return true; };
  const tried = new Set();
  for (let pass = 0; pass < 24; pass++) {
    let added = 0;
    for (const r of runsOf(L, T)) {
      if (!floating(r)) continue;
      const key = r.x0 + ',' + r.y; if (tried.has(key + ',' + r.anchors + ',' + r.worstAt)) continue; tried.add(key + ',' + r.anchors + ',' + r.worstAt);
      const cols = [];
      if (cfg.trestle) {   /* a braced trestle under the whole step: a leg at each end, an X between (no ground within reach: a post / a knee brace below) */
        const bl = dropOf(L, T, r.x0, r.y, cfg.maxDrop || 24), br = dropOf(L, T, r.x1, r.y, cfg.maxDrop || 24);
        if (bl > 0 && br > 0) { if (!have.has(r.x0 + ',' + r.y)) { have.add(r.x0 + ',' + r.y); L.routeSupports.push({ x: r.x0, y: r.y, bottom: bl, rb: br, kind: 'demo', style: 'trestle', span: r.x1 - r.x0 }); added++; } continue; } }
      if (!r.anchors && r.w >= 3) cols.push(r.w <= DECK_W ? r.x0 : r.x0 + 1, r.w <= DECK_W ? r.x1 : r.x1 - 1);   /* a bare board: a post at each end, like a trestle */
      else if (!r.anchors) cols.push(r.x0);
      else cols.push(Math.min(r.x1 - (r.w > 2 ? 1 : 0), Math.max(r.x0 + (r.w > 2 ? 1 : 0), r.worstAt)));
      let ok = false;
      for (const c0 of cols) for (const dc of [0, 1, -1, 2, -2]) { const c = c0 + dc; if (c < r.x0 || c > r.x1) continue; const b = dropOf(L, T, c, r.y, cfg.maxDrop || 24) > 0 ? dropOf(L, T, c, r.y, cfg.maxDrop || 24) : poolFoot(L, c, r.y); if (b > 0 && push(c, r.y, b)) { added++; ok = true; break; } }
      /* no ground under it (a hall's void) but a wall / trunk at one end: a knee brace from the wall under the board, BRACE_LEN columns out */
      if (!ok && (r.endL !== r.endR)) { const dir = r.endR ? -1 : 1, ax = r.endR ? r.x1 : r.x0, bx = ax + dir * BRACE_LEN;
        if (bx >= r.x0 && bx <= r.x1 && !have.has(ax + ',' + r.y + ',b')) { have.add(ax + ',' + r.y + ',b'); L.routeSupports.push({ x: ax, y: r.y, bottom: r.y + BRACE_LEN, kind: 'demo', style: 'brace', dir, span: BRACE_LEN }); added++; ok = true; } }
      if (!ok) unfixed.push({ x0: r.x0, x1: r.x1, y: r.y, why: 'no ground within ' + (cfg.maxDrop || 24) + ' rows under the loose cells' });
    }
    if (!added) break;
  }
  return L;
}
