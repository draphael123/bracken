/* src/island-posts.js - A BOARD WITH NOTHING UNDER IT GETS A POST (claude/floatsweep, Daniel 2026-10-08: "floating plank platforms").
   An ISLAND is a 4-connected group of non-air tiles that reaches no edge of the map (a rope - T.NET - joins). Boards (ONEWAY / PLANK) laid as an island
   over ground that is not far below read as floating; the Marsh, the Reef and Waymeet already stand theirs on posts (src/coast-town.js, routeSupports,
   drawn by src/route-art.js). This is the same kit for the other BUILT places: at each end of every board run of an island made of boards only, a post is
   set down to the first thing under it, if that is within MAX_DROP rows. No tile changes: the route, the walker and the mash rows are untouched.
   What it cannot reach (open sky or a deep void under the board) stays in tools/solid-islands.mjs's table for the level's own lane. */
import { addForestSupports } from './forest-supports.js'; import { marshSupports } from './redraw/marsh2_art.js';
import { addAnchorPosts } from './anchor-posts.js';
import { addSpireSupports } from './spire-supports.js'; import { addSupports as addFenSupports } from './redraw/fen_road_art.js';
export const MAX_DROP = 16;
const HOVER = 6;
const HOVER_ID = { fair: 30 };   /* (claude/theatrelines) the fair's stage and slide are timber: a stilt may run the whole way down to the ground */   /* rows of air under a laid wall / stone stub that a stilt may cover */
const DROP = { fields: 24, lamplit: 20, fair: 30, underleaf: 28 };   /* (claude/underleaf4) UNDERLEAF's BUBBLE SHAFTS: her drying racks stand on tall bone poles out of the thorn chasm */ //   /* the Hexed Fields: its planks ride up in the dead trees, twenty rows over the stubble */

/* levels that get the posts: the BUILT places (THE STOCKADE joined them, claude/stockade2: a goblin camp is lashed poles). The organic ones (the Wood, the Marsh, the Spore Forest, Kingswood, the crags and passes,
   the Hanging Gardens, the Rootway, the Glass Sea, the Witchlight) draw logs, caps, reeds and slabs that grow where they are: tools/solid-islands.mjs ALLOW. */
export const POST_LEVELS = new Set(['hornetsnest', /* (claude/hornetsnest) the nest's comb shelves stand on posts (greybox: the art lane draws them as wax pillars and paper stalks) */ 'kings', 'fenroad', 'stockade', 'storm', 'underleaf', 'lamplit', 'deep', 'causeway', 'fields', 'burning', 'canal', 'welltown', 'redgorge', 'underwell', 'minecart', 'fair', 'caravan', 'unburied', 'mage', 'fallingtower', 'keep', 'harbor', 'undercrown', 'towpath']);   /* (claude/towpath2: THE TOWPATH 2's gantries, racks, beams and lofts stand on posts) */

export function islandsOf(L, T) {
  const W = L.W, H = L.H, g = L.grid, seen = new Uint8Array(W * H), out = [];
  const machine = new Set();
  for (const f of (L.theatre && L.theatre.flats) || []) { const pos = f.tools === 'A' ? f.a : f.b;
    if (f.axis === 'y') { for (let y = pos; y < pos + f.h; y++) for (let x = f.x0; x <= f.x1; x++) machine.add(y * W + x); }
    else for (let y = f.y0; y <= f.y1; y++) for (let x = pos; x < pos + f.w; x++) machine.add(y * W + x); }
  for (const j of L.machineCells || []) machine.add(j);   /* (claude/colossusrework) cells a machine moves - THE GLASS COLOSSUS's holds walk with him: never an island stood on posts (a post left behind when he walks is a drawn thing with nothing there) */
  for (let i = 0; i < W * H; i++) {
    if (seen[i] || g[i] === T.AIR || machine.has(i)) continue;
    const q = [i]; seen[i] = 1; let edge = false, x0 = W, x1 = -1, y0 = H, y1 = -1; const cells = [], kinds = new Set();
    while (q.length) { const j = q.pop(), x = j % W, y = (j / W) | 0; cells.push(j); kinds.add(g[j]);
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) edge = true;
      for (const k of [j - 1, j + 1, j - W, j + W]) { if (k < 0 || k >= W * H) continue; if ((k === j - 1 && x === 0) || (k === j + 1 && x === W - 1)) continue;
        if (!seen[k] && g[k] !== T.AIR && !machine.has(k)) { seen[k] = 1; q.push(k); } } }
    if (!edge) out.push({ n: cells.length, x0, x1, y0, y1, cells, kinds: [...kinds].map(k => Object.keys(T).find(K => T[K] === k) || k), raw: [...kinds] });
  }
  return out;
}

export function addIslandPosts(L, id, T) { const r = addIslandPostsBase(L, id, T); addAnchorPosts(r, id, T); if (id === 'marsh' && r && r.marsh2Kit) marshSupports(r, T); if (id === 'fenroad' && r) addFenSupports(r, T); return r; }   /* (claude/fenroadart) THE FEN ROAD's bents under every run the posts above left bare (bowed sections, the landing) */   /* (claude/marsh2art) the marsh's posts reach the bed or the world's floor, drawn as bog-oak stilts (src/redraw/marsh2_art.js) */
function addIslandPostsBase(L, id, T) {
  addForestSupports(L, id, T, islandsOf);   /* the forest and crag levels: their own kit (src/forest-supports.js) */
  if (id === 'spire') addSpireSupports(L, T);   /* THE MONASTERY: scaffold posts under its boards, masonry piers under its floors (claude/screefix, src/spire-supports.js) */
  if (!POST_LEVELS.has(id) || !L || !L.grid) return L;
  const MAX = DROP[id] || MAX_DROP, W = L.W, H = L.H, g = L.grid, boards = new Set([T.ONEWAY, T.PLANK]);
  const have = new Set((L.routeSupports || []).map(p => p.x + ',' + p.y)); if (!L.routeSupports) L.routeSupports = [];
  for (const s of islandsOf(L, T)) {
    const boardsOnly = s.raw.every(k => boards.has(k)), cellSet = new Set(s.cells);
    for (const j of s.cells) { const x = j % W, y = (j / W) | 0;
      if (cellSet.has(j + W)) continue;                                  /* only the lowest cell of its column: what hangs over the air */
      const l = cellSet.has(j - 1), r = cellSet.has(j + 1); if (l && r) continue;   /* the end of a run: one post at each */
      if (have.has(x + ',' + y)) continue;
      let b = y + 1; while (b < H - 1 && b - y <= MAX && g[b * W + x] === T.AIR) b++;
      if (g[b * W + x] === T.AIR || b - y > MAX || b - y < 2) continue;
      if (!boardsOnly && b - y > (HOVER_ID[id] || HOVER)) continue;                       /* a wall or tower stub hovering over the ground gets a stilt; a rock slab high in the air is the level's own (the table) */
      L.routeSupports.push(L.lpKit ? { x, y, bottom: b, kind: 'lpiron' } : { x, y, bottom: b }); have.add(x + ',' + y); }   /* (lamplit3art) the Lamplit Street's ledges stand on stone piers and iron columns, never the timber post */
  }
  return L;
}
/* (claude/palisadewood) THE PALISADE WOOD: its scaffold tiers, walkways, decks and the half-built gatehouse stand on timber posts (greybox; the art lane draws them) */
POST_LEVELS.add('palisadewood');
/* (claude/kitchengate) THE KITCHEN GATE: its pot racks, dressers and benches stand on posts (greybox; the art lane draws them as iron brackets and dresser legs) */
POST_LEVELS.add('kitchengate');
