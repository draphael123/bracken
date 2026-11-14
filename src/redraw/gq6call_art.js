// src/redraw/gq6call_art.js - THE GEODE CALL's props (claude/gq6call-art): the falling stone, the hanging shard pair, the told rings. DRAWING ONLY, px.js primitives only (renders in Node:
// tools/gq6callart-sheet.mjs). Only drawn with GQ6CALL_SHIPS on (src/gobgeo-hands.js drawCalls); nothing here is loaded by anything else.
// THE LANGUAGE is the Goblin Queen's (src/redraw/gq4_art.js): the stone is her portal boulder's grey-violet rock, an amethyst vein, a dark underside (smaller, ~12 px, three rotations,
// baked); the shards are her hanging shards' jagged wedge with the pale-gold tip and her four-point glint over them, so 'a bright-tipped hanging shard = hit me' transfers.
import { canvas, px, rect, line, fillPoly, outline } from '../px.js';
import { OUT } from '../art.js';

/* the Queen's boulder family: [deepest, dark, mid, light, highlight] + her amethyst */
const ROCK = ['#2e2a3a', '#46415a', '#5a5668', '#8a869c', '#c4c0d4'];
const AME = ['#2a0e48', '#5a2a9a', '#9a5ae0', '#d0a8ff', '#ffffff'];
const TIP = '#fff6c8';   /* her shard's tip */

/* ---------- THE STONE: 12 px, three rotations (0-2; 3 mirrors 1, as her boulder does). A LUMP, not a ball: the outline is lumpy (a different bump per rotation), the lit
   face is flat-faceted with chipped edges, the underside a dark slab, an amethyst vein and a pale chip: her boulder's rock, smaller ---------- */
function stoneFrame(r) {
  const [c, g] = canvas(16, 16), k = r === 3 ? 1 : r, m = r === 3 ? -1 : 1, cx = 8, cy = 8, R = 5.4, ph = [0.4, 2.1, 4.0][k];
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const dx = (x + 0.5 - cx) * m, dy = y + 0.5 - cy, th = Math.atan2(dy, dx), rr = R * (1 + 0.13 * Math.sin(3 * th + ph) + 0.09 * Math.sin(5 * th + 2 * ph) - (Math.abs(dy) > 4.6 ? 0.1 : 0)), d = Math.hypot(dx, dy) / rr; if (d > 1) continue;
    const nx = dx / rr, ny = dy / rr, lit = -(nx * -0.62 + ny * -0.78) * 0.9 + Math.sqrt(Math.max(0, 1 - d * d)) * 0.35;
    const facet = ((x * 3 + y * 5 + k * 7) % 11 === 0) ? 1 : 0;   /* a few chipped facets */
    px(g, x, y, ROCK[Math.max(0, Math.min(4, Math.round(lit * 2.0 + 1.3 - (d > 0.82 ? 0.7 : 0) + facet)))]);
  }
  for (let x = 3; x < 13; x++) for (let y = 10; y < 14; y++) { const d = c.getContext('2d').getImageData(x, y, 1, 1).data; if (d[3] && y >= 11 + (x < 6 || x > 9 ? 0 : 1)) px(g, x, y, ROCK[y > 11 ? 0 : 1]); }   /* the dark underside slab */
  const crack = [[[3, 4, 3], [8, 8, 2]], [[7, 3, 3], [3, 7, 2]], [[4, 5, 2], [8, 3, 2]]][k];
  for (const [x, y, w] of crack) { rect(g, x, y, w, 1, ROCK[4]); rect(g, x, y + 1, w, 1, ROCK[0]); }   /* chips: a lit lip over a dark seam */
  const v = [[6, 6], [7, 5], [5, 7]][k];   /* the amethyst vein: a little cluster that turns with the stone */
  px(g, v[0], v[1], AME[2]); px(g, v[0] + m, v[1] - 1, AME[3]); px(g, v[0] + m, v[1], AME[2]); px(g, v[0], v[1] + 1, AME[1]); px(g, v[0] + 2 * m, v[1] + 1, AME[1]); px(g, v[0] + m, v[1] - 1, AME[4]);
  outline(c, OUT); return c;
}
let STONE = null;
export function stoneSet() { return STONE || (STONE = [0, 1, 2, 3].map(stoneFrame)); }
/* the falling stone centred on (x, y); r = rotation tick; k 0..1 of the fall: faint violet motes streaming up off it (never a fuse) */
export function drawCallStone(g, x, y, r = 0, k = 0.5) {
  const X = Math.round(x), Y = Math.round(y);
  g.save(); for (let i = 0; i < 4; i++) { g.globalAlpha = 0.55 - i * 0.12; px(g, X - 3 + i * 2 - (i & 1), Y - 8 - i * 3 - Math.round(k * i * 2), i & 1 ? AME[2] : AME[3]); } g.restore();
  g.drawImage(stoneSet()[r & 3], X - 8, Y - 8);
}

/* ---------- THE HANGING SHARD PAIR: a leaning wedge of her rock, a lit left face and a dark right face, an amethyst vein, a pale tip; two sizes (0 big, 1 small); dir -1 leans left, +1 right ---------- */
function shardFrame(size) {
  const [c, g] = canvas(14, 20), sc = size ? 0.72 : 1, P = pts => pts.map(([x, y]) => [Math.round(7 + x * sc), Math.round(17 - y * sc)]);
  fillPoly(g, P([[-4, 0], [-4, 7], [-2, 15], [0, 11], [1, 12], [3, 8], [5, 9], [5, 1]]), ROCK[2]);   /* the body: a leaning, notched wedge */
  fillPoly(g, P([[-4, 0], [-4, 7], [-2, 15], [0, 11], [0, 2]]), ROCK[3]);                              /* its lit left face */
  fillPoly(g, P([[-4, 4], [-3, 8], [-2, 14], [-1, 8]]), ROCK[4]);                                      /* the bright facet along the lit edge */
  fillPoly(g, P([[1, 1], [1, 11], [3, 8], [5, 9], [5, 1]]), ROCK[1]);                                  /* the shadowed right face */
  line(g, Math.round(7 - 2 * sc), Math.round(17 - 14 * sc), Math.round(7 + 0 * sc), Math.round(17 - 3 * sc), ROCK[4], 1);   /* the crest */
  for (const [x, y, col] of [[-1, 5, AME[2]], [-1, 7, AME[3]], [0, 6, AME[1]], [1, 4, AME[1]]]) px(g, Math.round(7 + x * sc), Math.round(17 - y * sc), col);   /* the amethyst vein */
  px(g, Math.round(7 - 2 * sc), Math.round(17 - 15 * sc), TIP); px(g, Math.round(7 - 2 * sc), Math.round(17 - 14 * sc), TIP); px(g, Math.round(7 - 3 * sc), Math.round(17 - 13 * sc), '#e0d8f0');   /* her pale tip */
  for (let x = 3; x <= 12; x++) px(g, Math.round(x), 17 + (x > 8 ? 0 : 1), x & 1 ? ROCK[0] : ROCK[1]);   /* the snapped base */
  outline(c, OUT); return c;
}
let SHARDS = null;
export function shardSet() { return SHARDS || (SHARDS = [0, 1].map(shardFrame)); }
/* a shard centred on (x, y) (its middle), size 0|1, dir -1|+1; the hands add the Queen's glint (GQ4A.drawHangGlint) over it */
export function drawCallShard(g, x, y, size = 0, dir = 1) {
  const s = shardSet()[size & 1], X = Math.round(x), Y = Math.round(y);
  if (dir < 0) { g.save(); g.translate(2 * X, 0); g.scale(-1, 1); g.drawImage(s, X - 7, Y - 12); g.restore(); } else g.drawImage(s, X - 7, Y - 12);
}

/* ---------- THE TOLD RINGS, in pixels (the canvas strokes blurred at 4x): a flat ellipse on the floor and a small closing circle over the hero ---------- */
function ellipsePx(g, cx, cy, rx, ry, col, dash = 0) {
  const n = Math.max(24, Math.round((rx + ry) * 4));
  for (let a = 0; a < n; a++) { if (dash && ((a / dash) | 0) & 1) continue; const t = a / n * Math.PI * 2; px(g, Math.round(cx + Math.cos(t) * rx), Math.round(cy + Math.sin(t) * ry), col); }
}
/* the landing ring on the floor at (x, fy): violet while it follows you (marching dashes), RED and solid with a second inner ring once it locks; r = its radius */
export function drawLandRing(g, x, fy, r, locked, time) {
  const X = Math.round(x), Y = Math.round(fy) - 2;
  if (locked) { ellipsePx(g, X, Y, r, 4, '#ff6b6b'); ellipsePx(g, X, Y, r - 3, 2, '#ffb0a0'); g.save(); g.globalAlpha = 0.35; ellipsePx(g, X, Y + 1, r, 4, '#7a1a1a'); g.restore();
    for (const d of [-1, 1]) { px(g, X + d * (r + 2), Y, '#ff6b6b'); px(g, X + d * (r + 3), Y, '#ffd0c8'); } }   /* lock ticks at either end */
  else { const ph = Math.floor(time * 12) & 3; ellipsePx(g, X, Y, r, 4, AME[3], 4); g.save(); g.globalAlpha = 0.6; ellipsePx(g, X, Y, r - 2, 3, AME[2], 3); g.restore(); px(g, X - r + ph, Y, AME[4]); }
}
/* the small ring closing over the hero's head at (x, y): k 0..1 of the tell (it tightens from 7 to 4 px, brightens as it closes) */
export function drawHeroRing(g, x, y, k, time) {
  const X = Math.round(x), Y = Math.round(y), r = Math.round(7 - 3 * Math.min(1, k)), col = k > 0.6 ? AME[4] : AME[3];
  ellipsePx(g, X, Y, r, Math.max(2, r - 2), col);
  g.save(); g.globalAlpha = 0.55; ellipsePx(g, X, Y + 1, r, Math.max(2, r - 2), AME[1]); g.restore();
  for (const d of [-1, 1]) px(g, X + d * (r + 2), Y - 2 - (Math.floor(time * 10) & 1), AME[2]);   /* two violet motes: it is about to close */
  line(g, X, Y - 4, X, Y - 7, AME[3], 1); px(g, X - 1, Y - 5, AME[3]); px(g, X + 1, Y - 5, AME[3]);   /* an arrow down: it comes from above */
}
