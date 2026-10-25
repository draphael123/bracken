// palisade_world.js - THE PALISADE WOOD's RULE MACHINES, DRAWN (claude/palisadeart). src/palisade-hands.js owns the state and the rules (what a prop holds, when it falls, where the stakes roll); this
// module draws every picture of them, replacing the greybox's flat rectangles. READABLE ON A PHONE (the trebuchet test: big, a verb, shows its result first):
//   THE PROP         a fresh-cut SHORE leaning into its load, its iron-shod head in a notch, a pale WEDGE at the foot (the one light thing in the picture, outlined dark), the rope LASHED three turns
//                    round it and running up to what it holds, orange STRAIN marks that shiver, a GOLD glint (the game's target colour) while it holds. Knocked: the shore lies on its side, the wedge
//                    kicked out beside it, the rope slack
//   THE SCAFFOLD SECTION  posts, rungs, braces and lashings against the wall face, a capping beam; folds down into STEPS of stacked log-ends under a board (a ramp that stays). THE RESULT FIRST: a pale
//                    gold dashed ghost of the steps / the bridge where it will land
//   THE WATCHTOWER   a half-built tower (legs, bracing, a deck with its first stakes, a pennant, a ladder); it topples across the gap and stays a LOG BRIDGE: stringers, boards, a rope rail
//   THE CREW WALKWAY boards on two braced legs, the plumb line dotted under it to where the timber will land; it drops in pieces and lies in pieces
//   THE STAKE STACK  a bundle of sharpened stakes bound in two bands on a rack of two posts; the plumb line and the road it will roll dotted gold; rolling, the bundle turns; scattered, the stakes lie
//   THE STAKE WALL   the setter's two-row wall: sharp stakes four to a tile lashed to a rail, a mound of earth and chips at its foot, cracks as it is hit, stakes lying when it is down
//   THE HARVEST      baskets of apples and gourds, nut piles, rakes, sheaves, apple heaps: small, warm, theirs
// px.js primitives; baked once per picture and memoised.   drawWorld(env), harvestSprite(kind)
import { canvas, mulberry } from '../px.js';
import { WOOD, ROPE, IRON, RUST, LEAF, mix } from './palisade_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round;
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const strHash = k => { let h = 5381; for (let i = 0; i < k.length; i++) h = (Math.imul(h, 33) + k.charCodeAt(i)) >>> 0; return h; };
const GOLD = '#ffd36b', STRAIN = '#ff9a5c', OUT = '#150a05';
const FRESH = WOOD.fresh, MID = WOOD.mid, OLD = WOOD.old;

/* ============================== small drawing helpers ============================== */
/* a lashing: rope turns round a post (x, y, w) with a twist, a loose tail */
function lash(g, x, y, w, tail) { rect(g, x - 1, y, w + 2, 3, ROPE[1]); for (let k = 0; k < w + 2; k++) { rect(g, x - 1 + k, y + (k & 1), 1, 1, ROPE[2]); rect(g, x - 1 + k, y + 2 - (k & 1), 1, 1, ROPE[0]); } rect(g, x - 1, y + 3, w + 2, 1, OUT);
  if (tail) { rect(g, x + w + 1, y + 2, 1, 4, ROPE[1]); rect(g, x + w + 1, y + 6, 1, 1, ROPE[0]); } }
/* a straight beam from (x0,y0) to (x1,y1), w px thick, pixel-stepped */
function beam(g, x0, y0, x1, y1, w, lit, body, dark) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const t = n ? i / n : 0, x = R(x0 + (x1 - x0) * t), y = R(y0 + (y1 - y0) * t); rect(g, x, y, w, w, body); rect(g, x, y, 1, w > 1 ? w - 1 : 1, lit); if (w > 2) rect(g, x + w - 1, y + 1, 1, w - 1, dark); } }
/* a dotted gold line (the game's target colour: where it will go) */
const dotsV = (g, x, y0, y1, a = 0.55) => { g.fillStyle = 'rgba(255,211,107,' + a + ')'; for (let y = y0; y < y1; y += 5) g.fillRect(x, y, 1, 2); };
const dotsH = (g, x0, x1, y, a = 0.55) => { g.fillStyle = 'rgba(255,211,107,' + a + ')'; const lo = Math.min(x0, x1), hi = Math.max(x0, x1); for (let x = lo; x < hi; x += 6) g.fillRect(x, y, 3, 1); };
/* a round log-end 8 px: rings, a dark rim */
function logEnd(g, x, y, d, fresh) { const c = fresh ? FRESH : MID, r = d / 2; for (let yy = 0; yy < d; yy++) for (let xx = 0; xx < d; xx++) { const dx = (xx - r + 0.5) / r, dy = (yy - r + 0.5) / r, q = dx * dx + dy * dy; if (q > 1) continue; rect(g, x + xx, y + yy, 1, 1, q > 0.72 ? OLD[1] : Math.floor(q * 4) % 2 ? c[2] : c[3]); }
  rect(g, x + (d >> 1) - 1, y + (d >> 1) - 1, 1, 1, c[0]); }

/* ============================== THE PROP ============================== */
/* x, y = the foot (centre of the cleat cell, its floor); lean = -1 | 0 | 1 toward what it holds */
export function drawProp(g, x, y, lean, up, time, id) {
  g.globalAlpha = 0.28; rect(g, x - 10, y - 1, 22, 3, '#000'); g.globalAlpha = 1;
  if (!up) {   /* KNOCKED: the shore on the ground, the wedge kicked out, the rope slack, splinters */
    rect(g, x - 14, y - 5, 24, 5, OLD[1]); rect(g, x - 14, y - 5, 24, 1, FRESH[3]); rect(g, x - 14, y - 2, 24, 2, OLD[0]); rect(g, x - 15, y - 4, 2, 3, FRESH[3]); rect(g, x + 9, y - 4, 2, 3, FRESH[2]);
    for (let k = 0; k < 4; k++) rect(g, x - 12 + k * 6, y - 4 + (k & 1), 1, 2, MID[1]);
    lash(g, x - 2, y - 6, 4, false); rect(g, x + 12, y - 2, 6, 1, ROPE[1]); rect(g, x + 17, y - 3, 2, 1, ROPE[0]); rect(g, x + 12, y - 1, 3, 1, ROPE[0]);
    rect(g, x + 11, y - 4, 7, 4, OUT); rect(g, x + 12, y - 3, 5, 2, FRESH[4]); rect(g, x + 14, y - 4, 3, 1, FRESH[4]);   /* the wedge, lying */
    for (const [dx, dy] of [[-6, -9], [8, -8], [3, -10]]) rect(g, x + dx, y + dy, 2, 1, FRESH[3]);
    return; }
  const sl = lean || 0, H = 32;
  /* the shore: five wide, lit left, leaning into its load; the foot in a notch of packed earth */
  for (let t = 0; t < H; t++) { const px = x - 2 + R(sl * t * 0.28), py = y - 1 - t, f = t > 24 ? OLD : FRESH; rect(g, px - 1, py, 7, 1, OUT);
    rect(g, px, py, 1, 1, f[4]); rect(g, px + 1, py, 1, 1, f[3]); rect(g, px + 2, py, 2, 1, f[2]); rect(g, px + 4, py, 1, 1, f[1]); if (t % 7 === 3) rect(g, px + 2, py, 1, 1, f[0]); }
  const hx = x - 2 + R(sl * H * 0.28), hy = y - 1 - H;
  rect(g, hx - 2, hy - 2, 9, 3, OUT); rect(g, hx - 1, hy - 2, 7, 2, IRON[1]); rect(g, hx - 1, hy - 2, 7, 1, IRON[3]); rect(g, hx + 1, hy, 1, 1, IRON[0]);   /* the iron-shod head in its notch */
  /* THE ROPE: three turns round it, high and low, and a line running up toward the load */
  for (const t of [9, 19]) lash(g, x - 2 + R(sl * t * 0.28) - 1, y - 1 - t, 5, t === 9);
  for (let k = 0; k < 8; k++) rect(g, hx + 2 + sl * (2 + k), hy - 3 - k * 2, 1, 2, k % 2 ? ROPE[1] : ROPE[2]);
  /* THE WEDGE: pale, big, outlined dark - the one light thing in the picture - with a chevron on it saying 'knock it out' */
  rect(g, x - 11, y - 1, 12, 1, OUT);
  for (let t = 0; t < 7; t++) { rect(g, x - 11 + 0, y - 1 - t, 11 - t * 1, 1, OUT); rect(g, x - 10, y - 1 - t, Math.max(0, 9 - t * 1), 1, t === 0 ? FRESH[2] : t < 3 ? FRESH[4] : '#fff6d0'); }
  rect(g, x - 10, y - 2, 9, 1, FRESH[2]);
  /* the STRAIN marks: slanting zig-zags off the shore that shiver */
  const sh = Math.sin(time * 18 + (id % 7)) > 0 ? 1 : 0; g.fillStyle = STRAIN;
  for (const sy of [22, 10]) { const bx = x + 4 + R(sl * sy * 0.28) + sh; g.fillRect(bx, y - sy, 2, 1); g.fillRect(bx + 2, y - sy - 1, 2, 1); g.fillRect(bx, y - sy - 2, 2, 1); g.fillRect(bx + 2, y - sy - 3, 2, 1); }
  /* the GLINT (the game's gold): a flashing star at the wedge's tip while it holds */
  const ph = Math.floor(time * 3) % 3; if (ph < 2) { g.globalAlpha = ph ? 0.6 : 0.95; rect(g, x - 13, y - 9, 1, 5, GOLD); rect(g, x - 15, y - 7, 5, 1, GOLD); rect(g, x - 13, y - 7, 1, 1, '#fff6d0'); g.globalAlpha = 1; }
}

/* ============================== THE SCAFFOLD SECTION (a frame against the wall face) ============================== */
function section(g, x0, y0, w, h, alpha, tilt) {
  if (alpha < 1) g.globalAlpha = alpha;
  const post = (px, lit) => { rect(g, px, y0, 5, h, OUT); rect(g, px + 1, y0, 1, h, FRESH[4]); rect(g, px + 2, y0, 2, h, FRESH[2]); rect(g, px + 4, y0, 1, h, FRESH[0]); };
  rect(g, x0, y0 - 5, w, 6, OUT); rect(g, x0 + 1, y0 - 4, w - 2, 1, FRESH[4]); rect(g, x0 + 1, y0 - 3, w - 2, 3, FRESH[2]); rect(g, x0 + 1, y0 - 1, w - 2, 1, MID[0]);   /* the capping beam */
  post(x0 + 1); post(x0 + w - 6);
  const bays = Math.max(1, Math.round(h / 28)), bh = h / bays;
  for (let b = 0; b < bays; b++) { const by = y0 + R(b * bh);
    rect(g, x0 + 5, by + R(bh) - 2, w - 10, 4, OUT); rect(g, x0 + 5, by + R(bh) - 1, w - 10, 2, MID[3]); rect(g, x0 + 5, by + R(bh) - 1, w - 10, 1, FRESH[3]);   /* a rung */
    if (b % 2 === (tilt ? 1 : 0)) beam(g, x0 + 5, by + 2, x0 + w - 7, by + R(bh) - 3, 2, FRESH[3], FRESH[1], MID[0]); else beam(g, x0 + w - 7, by + 2, x0 + 5, by + R(bh) - 3, 2, FRESH[3], FRESH[1], MID[0]);   /* a brace, the bays alternating */
    for (const px of [x0 + 1, x0 + w - 6]) lash(g, px, by + R(bh) - 3, 5, false); }
  /* a ladder cut into the right post's flank: a few rungs */
  for (let r2 = 6; r2 < h - 4; r2 += 9) rect(g, x0 + w - 2, y0 + r2, 3, 1, FRESH[3]);
  g.globalAlpha = 1;
}
/* the steps a section lays when it comes down: log-ends stacked under a board on top of each column; boards where it lays one-way cells */
function steps(g, cells, cx, cy, TS) {
  const top = new Map(); for (const [x, y, k] of cells) { const key = x; if (!top.has(key) || top.get(key)[0] > y) top.set(key, [y, k]); }
  for (const [x, y, k] of cells) { const sx = R(x * TS - cx), sy = R(y * TS - cy);
    if (k === 'O') { rect(g, sx, sy, 16, 5, OUT); rect(g, sx, sy, 16, 1, FRESH[4]); rect(g, sx, sy + 1, 16, 2, FRESH[2]); rect(g, sx, sy + 3, 16, 1, MID[0]); rect(g, sx + 2, sy + 2, 1, 1, IRON[3]); rect(g, sx + 13, sy + 2, 1, 1, IRON[3]); rect(g, sx + 1, sy + 4, 14, 1, ROPE[0]); continue; }
    rect(g, sx, sy, 16, 16, OUT);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) logEnd(g, sx + j * 8, sy + i * 8, 8, ((x + y + i + j) & 1) === 0);
    if (top.get(x)[0] === y) { rect(g, sx - 1, sy - 1, 18, 4, OUT); rect(g, sx - 1, sy - 1, 18, 1, FRESH[4]); rect(g, sx - 1, sy, 18, 2, FRESH[2]); rect(g, sx, sy + 2, 16, 1, MID[0]); }
    rect(g, sx, sy + 7, 16, 2, ROPE[1]); rect(g, sx + 1, sy + 7, 1, 1, ROPE[2]); rect(g, sx + 9, sy + 8, 1, 1, ROPE[0]); }
}

/* ============================== THE WATCHTOWER (standing) and the BRIDGE (down) ============================== */
function tower(g, bx, foot, top, gatehouse) {
  const hgt = foot - top, w = gatehouse ? 18 : 22;
  for (const [dx, sgn] of [[-w / 2, 1], [w / 2 - 4, -1]]) { for (let t = 0; t < hgt; t++) { const x = bx + R(dx + sgn * (t < hgt * 0.5 ? 0 : 0) + sgn * (1 - t / hgt) * 0), y = foot - t; rect(g, x - 1, y, 6, 1, OUT); rect(g, x, y, 1, 1, FRESH[4]); rect(g, x + 1, y, 2, 1, FRESH[2]); rect(g, x + 3, y, 1, 1, FRESH[0]); } }
  for (let b = 0; b < Math.max(1, Math.round(hgt / 24)); b++) { const y0 = foot - R((b + 1) * hgt / Math.max(1, Math.round(hgt / 24))), y1 = foot - R(b * hgt / Math.max(1, Math.round(hgt / 24)));
    beam(g, bx - w / 2 + 4, y1 - 2, bx + w / 2 - 4, y0 + 2, 2, FRESH[3], FRESH[1], MID[0]); if (!gatehouse || b % 2) beam(g, bx + w / 2 - 4, y1 - 2, bx - w / 2 + 4, y0 + 2, 2, FRESH[3], FRESH[1], MID[0]);
    rect(g, bx - w / 2, y0, w, 3, OUT); rect(g, bx - w / 2 + 1, y0, w - 2, 1, FRESH[3]); rect(g, bx - w / 2 + 1, y0 + 1, w - 2, 1, MID[2]); lash(g, bx - w / 2, y0 - 1, 5, false); lash(g, bx + w / 2 - 5, y0 - 1, 5, false); }
  /* the deck and what stands on it */
  const dy = top;
  rect(g, bx - w / 2 - 4, dy - 4, w + 8, 7, OUT); rect(g, bx - w / 2 - 3, dy - 3, w + 6, 1, FRESH[4]); rect(g, bx - w / 2 - 3, dy - 2, w + 6, 3, FRESH[2]); rect(g, bx - w / 2 - 3, dy + 1, w + 6, 1, MID[0]);
  for (let k = 0; k < 4; k++) rect(g, bx - w / 2 - 1 + k * 7, dy - 2, 1, 3, MID[1]);
  if (!gatehouse) { for (let k = 0; k < 5; k++) { const sx = bx - w / 2 - 2 + k * 6; rect(g, sx, dy - 14, 3, 11, OUT); rect(g, sx + 1, dy - 13, 1, 10, FRESH[3]); rect(g, sx + 1, dy - 15, 1, 2, FRESH[4]); }   /* the first stakes of its parapet */
    rect(g, bx + w / 2 + 2, dy - 26, 1, 22, MID[0]); rect(g, bx + w / 2 + 3, dy - 25, 10, 6, RUST[2]); rect(g, bx + w / 2 + 3, dy - 25, 10, 1, '#f08a5a'); rect(g, bx + w / 2 + 6, dy - 23, 3, 2, RUST[0]); }   /* a pennant on a pole */
  else { for (const x of [bx - 8, bx + 4]) rect(g, x, dy - 18, 4, 14, FRESH[1]); rect(g, bx - 10, dy - 20, 24, 3, FRESH[2]); lash(g, bx - 8, dy - 12, 4, false); rect(g, bx + 8, dy - 40, 2, 36, MID[0]); rect(g, bx - 8, dy - 40, 18, 2, FRESH[2]); rect(g, bx - 8, dy - 38, 1, 12, ROPE[1]); rect(g, bx - 10, dy - 27, 5, 4, FRESH[3]); }   /* a crane arm over the deck, a log on the rope */
}
/* the span laid: stringers, boards, a rope rail on posts */
function bridge(g, x0, x1, y) {
  rect(g, x0, y + 4, x1 - x0, 3, OUT); rect(g, x0, y + 4, x1 - x0, 1, FRESH[2]); rect(g, x0, y + 6, x1 - x0, 1, MID[0]);
  for (let k = x0; k < x1; k += 16) { rect(g, k, y, 16, 5, OUT); rect(g, k, y, 16, 1, FRESH[4]); rect(g, k, y + 1, 16, 2, FRESH[2]); rect(g, k, y + 3, 16, 1, MID[0]); rect(g, k + 2, y + 2, 1, 1, IRON[3]); rect(g, k + 13, y + 2, 1, 1, IRON[3]); rect(g, k + 15, y, 1, 4, MID[1]); }
  for (let k = x0 + 6; k < x1; k += 28) { rect(g, k, y - 13, 3, 14, OUT); rect(g, k + 1, y - 12, 1, 13, FRESH[3]); }
  rect(g, x0 + 6, y - 12, x1 - x0 - 12, 1, ROPE[1]); rect(g, x0 + 6, y - 8, x1 - x0 - 12, 1, ROPE[0]);
  for (const bx of [x0, x1 - 6]) { rect(g, bx, y + 5, 6, 3, OUT); lash(g, bx, y + 4, 5, false); }
}

/* ============================== THE CREW WALKWAY ============================== */
function walkway(g, wx0, wx1, wy, ccy) {
  rect(g, wx0 - 2, wy, wx1 - wx0 + 4, 7, OUT); rect(g, wx0 - 1, wy, wx1 - wx0 + 2, 1, FRESH[4]); rect(g, wx0 - 1, wy + 1, wx1 - wx0 + 2, 3, FRESH[2]); rect(g, wx0 - 1, wy + 4, wx1 - wx0 + 2, 2, MID[1]);
  for (let k = wx0 + 3; k < wx1 - 4; k += 12) rect(g, k, wy + 1, 1, 4, MID[0]); for (const nx of [wx0 + 2, wx1 - 4]) { rect(g, nx, wy + 2, 1, 1, IRON[3]); }
  for (const lx of [wx0 + 3, wx1 - 8]) { rect(g, lx, wy + 7, 5, ccy - wy - 7, OUT); rect(g, lx + 1, wy + 7, 1, ccy - wy - 7, FRESH[4]); rect(g, lx + 2, wy + 7, 2, ccy - wy - 7, FRESH[2]); rect(g, lx + 4, wy + 7, 1, ccy - wy - 7, FRESH[0]); lash(g, lx, wy + 8, 5, false); }
  const mid = (wx0 + wx1) / 2; if (ccy - wy > 24) { beam(g, wx0 + 6, ccy - 4, mid, wy + 8, 2, FRESH[3], FRESH[1], MID[0]); beam(g, wx1 - 8, ccy - 4, mid, wy + 8, 2, FRESH[3], FRESH[1], MID[0]); }
}

/* ============================== THE STAKE STACK ============================== */
function stack(g, cx0, ly, w, turn, rolling) {
  for (let k = 0; k < 3; k++) { const yy = ly - 4 - k * 4, off = rolling ? R(Math.sin(turn + k) * 2) : 0;
    rect(g, cx0 + off, yy - 1, w, 5, OUT); rect(g, cx0 + off, yy, w, 1, FRESH[4]); rect(g, cx0 + off, yy + 1, w, 2, k % 2 ? FRESH[2] : FRESH[3]); rect(g, cx0 + off, yy + 3, w, 1, MID[0]);
    rect(g, cx0 + w + off - 1, yy - 1, 5, 5, OUT); rect(g, cx0 + w + off, yy, 4, 3, FRESH[4]); rect(g, cx0 + w + off + 3, yy + 1, 2, 1, FRESH[4]);   /* the sharp ends */
    rect(g, cx0 + off - 3, yy, 3, 3, OUT); rect(g, cx0 + off - 2, yy + 1, 2, 1, FRESH[3]); }
  for (const bx of [cx0 + 10, cx0 + w - 12]) { rect(g, bx + (rolling ? R(Math.sin(turn) * 2) : 0), ly - 14, 3, 14, ROPE[1]); rect(g, bx + (rolling ? R(Math.sin(turn) * 2) : 0), ly - 14, 1, 14, ROPE[2]); }   /* the two bands */
}

/* ============================== THE STAKE WALL ============================== */
function wall(g, x, y, rows, hits, sh) {
  const TS = 16, H = rows * TS;
  rect(g, x - 2, y - 4, 20, 5, OUT); rect(g, x - 1, y - 3, 18, 3, MID[0]); rect(g, x, y - 3, 14, 1, '#7a5a38'); for (let k = 0; k < 5; k++) rect(g, x + k * 3, y - 4 - (k & 1), 2, 1, FRESH[3]);   /* the mound with chips */
  for (let k = 0; k < 4; k++) { const sx = x + 1 + k * 4 + sh, top = y - H + 2 + (k % 2) * 3 + (hits ? (k & 1) * -1 : 0);
    rect(g, sx - 1, top - 5, 6, H - 1 - (top - (y - H)) + 8, OUT); rect(g, sx, top, 1, y - top - 3, FRESH[4]); rect(g, sx + 1, top, 2, y - top - 3, k & 1 ? FRESH[3] : FRESH[2]); rect(g, sx + 3, top, 1, y - top - 3, MID[0]);
    rect(g, sx + 1, top - 4, 2, 4, FRESH[4]); rect(g, sx + 1, top - 5, 1, 2, '#fff6d0'); }   /* a sharp tip */
  rect(g, x - 1, y - R(H * 0.7), 18, 3, OUT); rect(g, x, y - R(H * 0.7), 16, 2, ROPE[1]); rect(g, x, y - R(H * 0.7) + 1, 16, 1, ROPE[0]); rect(g, x - 1, y - R(H * 0.35), 18, 2, ROPE[1]);   /* the rail he lashed */
  if (hits) { rect(g, x + 5, y - H + 10, 1, 8, OUT); rect(g, x + 6, y - H + 14, 2, 1, OUT); rect(g, x + 9, y - H + 18, 1, 6, OUT); for (let k = 0; k < 3; k++) rect(g, x + 2 + k * 5, y - H + 6 + k * 3, 1, 1, '#fff6d0'); }   /* split, splinters */
}
function wallDown(g, x, y, a) { g.globalAlpha = a; for (let k = 0; k < 5; k++) { const sx = x - 8 + k * 6, sy = y - 3 - (k % 2); rect(g, sx, sy - 1, 8, 4, OUT); rect(g, sx + 1, sy, 6, 1, FRESH[4]); rect(g, sx + 1, sy + 1, 6, 1, FRESH[2]); rect(g, sx + 7, sy, 2, 2, FRESH[4]); } g.globalAlpha = 1; }

/* ============================== THE HARVEST ============================== */
export function harvestSprite(kind) {
  return once('hv' + kind, () => {
    const [c, g] = canvas(24, 22), r = mulberry(kind.length * 7 + 3);
    const apple = (x, y, col) => { rect(g, x, y, 4, 4, OUT); rect(g, x + 1, y, 2, 1, col); rect(g, x, y + 1, 4, 2, col); rect(g, x + 1, y + 3, 2, 1, mix(col, '#000', 0.3)); rect(g, x + 1, y + 1, 1, 1, '#ffe8c0'); rect(g, x + 2, y - 1, 1, 1, '#4a6a1a'); };
    if (kind === 'basket') { for (let i = 0; i < 3; i++) apple(5 + i * 5, 4 + (i & 1), i === 1 ? LEAF[4] : i ? LEAF[2] : '#c0402a'); rect(g, 15, 5, 4, 5, OUT); rect(g, 16, 6, 2, 3, LEAF[3]);   /* a gourd */
      rect(g, 3, 9, 18, 11, OUT); rect(g, 4, 10, 16, 9, '#a8783e'); for (let k = 0; k < 16; k += 2) { rect(g, 4 + k, 10, 1, 9, '#8a5a2a'); } for (let k = 0; k < 9; k += 3) rect(g, 4, 11 + k, 16, 1, '#c89a58'); rect(g, 3, 9, 18, 2, '#d8a860'); rect(g, 3, 9, 18, 1, '#f0c880'); rect(g, 3, 19, 18, 1, '#5a3a1a');
      for (const hx of [3, 19]) { rect(g, hx, 4, 2, 6, OUT); rect(g, hx, 5, 1, 4, '#c89a58'); } rect(g, 3, 3, 18, 2, OUT); rect(g, 4, 3, 16, 1, '#a8783e'); }
    else if (kind === 'nuts') { for (let row = 0; row < 4; row++) for (let i = 0; i < 6 - row; i++) { const x = 3 + i * 3 + row * 1.5, y = 17 - row * 3; rect(g, x, y, 4, 4, OUT); rect(g, x + 1, y, 2, 1, (i + row) % 2 ? '#a4743a' : '#6a4420'); rect(g, x, y + 1, 4, 2, (i + row) % 2 ? '#8a5a2a' : '#7a4a22'); rect(g, x + 1, y + 1, 1, 1, '#d8a860'); rect(g, x + 1, y + 3, 2, 1, '#3a2210'); }
      rect(g, 1, 20, 22, 1, OUT); }
    else if (kind === 'rake') { rect(g, 11, 0, 3, 21, OUT); rect(g, 12, 0, 1, 21, FRESH[3]); rect(g, 13, 0, 1, 21, MID[0]); rect(g, 12, 1, 1, 21, MID[2]); rect(g, 3, 1, 18, 4, OUT); rect(g, 4, 2, 16, 2, MID[2]); rect(g, 4, 2, 16, 1, FRESH[3]); for (let k = 0; k < 7; k++) { rect(g, 4 + k * 2.5, 4, 1, 5, OUT); rect(g, 4 + k * 2.5, 4, 1, 4, FRESH[2]); } lash(g, 10, 6, 4, false); rect(g, 11, 6, 3, 1, ROPE[1]); }
    /* (claude/palisade2, Daniel 10-25: "leaves on the ground and all that - add to the theme") THE SIEGE CAMP'S DRESSING: on-theme stock only - the palisade's own timber */
    else if (kind === 'ropeCoil') { for (let k = 0; k < 4; k++) { const w = 18 - k * 3, x = 3 + k * 1.5, y = 19 - k * 3; rect(g, x, y - 2, w, 4, OUT); rect(g, x + 1, y - 1, w - 2, 1, ROPE[2]); rect(g, x + 1, y, w - 2, 1, ROPE[1]); for (let q = 1; q < w - 1; q += 3) rect(g, x + q, y - 1, 1, 2, ROPE[0]); }
      rect(g, 19, 12, 4, 2, OUT); rect(g, 19, 12, 3, 1, ROPE[1]); rect(g, 21, 13, 2, 7, ROPE[1]); }
    else if (kind === 'toolRack') { for (const px of [3, 19]) { rect(g, px, 2, 3, 19, OUT); rect(g, px + 1, 2, 1, 19, MID[2]); } rect(g, 2, 5, 21, 2, OUT); rect(g, 3, 5, 19, 1, FRESH[2]);
      rect(g, 8, 6, 2, 13, MID[1]); rect(g, 6, 16, 6, 3, IRON[2]); rect(g, 6, 16, 6, 1, IRON[3]);                 /* a mallet */
      rect(g, 13, 6, 1, 14, MID[1]); rect(g, 12, 7, 5, 4, IRON[1]); rect(g, 16, 7, 1, 4, IRON[3]);                 /* an axe */
      rect(g, 16, 6, 1, 12, MID[2]); for (let k = 0; k < 4; k++) rect(g, 15 + (k & 1), 18 + k, 2, 1, IRON[2]); }   /* a two-man saw's end */
    else if (kind === 'sawdust') { for (let k = 0; k < 26; k++) { const x = 1 + ((k * 37) % 22), y = 17 + ((k * 13) % 4); rect(g, x, y, 1 + (k % 2), 1, k % 3 ? FRESH[4] : FRESH[3]); } rect(g, 4, 20, 16, 1, FRESH[3]); rect(g, 6, 19, 10, 1, FRESH[4]);
      rect(g, 15, 15, 7, 4, OUT); rect(g, 16, 16, 5, 2, FRESH[2]); rect(g, 16, 16, 1, 2, FRESH[4]); }               /* a sawn-off block */
    else if (kind === 'stakePile') { for (let k = 0; k < 5; k++) { const y = 18 - (k % 3) * 3 - (k > 2 ? 2 : 0), x = 1 + (k % 2) * 2; rect(g, x, y - 1, 19, 4, OUT); rect(g, x + 1, y, 16, 1, FRESH[4]); rect(g, x + 1, y + 1, 16, 1, FRESH[2]); rect(g, x + 17, y, 3, 2, FRESH[4]); rect(g, x + 20, y + 1, 2, 1, FRESH[3]); } lash(g, 8, 13, 2, false); }
    else if (kind === 'logStack') { for (let row = 0; row < 3; row++) for (let i = 0; i < 3 - row; i++) logEnd(g, 2 + i * 7 + row * 3.5, 14 - row * 6, 7, row !== 1); rect(g, 0, 20, 24, 1, OUT); }   /* the palisade's stock, cut to length */
    else if (kind === 'brokenStakes') { for (let k = 0; k < 4; k++) { const x = 2 + k * 5, h = 6 + ((k * 5) % 9); rect(g, x, 21 - h, 4, h, OUT); rect(g, x + 1, 21 - h, 2, h, k & 1 ? '#3a2414' : '#5a3a1d'); rect(g, x + 1, 21 - h, 1, 2, '#1a0e06'); rect(g, x + 2, 22 - h, 1, 1, '#ff8a3a'); } }   /* charred butts, an ember */
    else if (kind === 'scorch') { for (let k = 0; k < 18; k++) rect(g, 1 + ((k * 29) % 22), 19 + ((k * 7) % 3), 2, 1, k % 4 ? '#1a1008' : '#5a5048'); rect(g, 3, 21, 18, 1, '#120a04'); }   /* a burnt patch, ash */
    else if (kind === 'sheaf') { for (let i = 0; i < 9; i++) { const x = 6 + i * 1.5 + (i - 4) * (i - 4) * 0.12 * (i < 4 ? -1 : 1), top = 1 + Math.abs(i - 4) * 1.2; rect(g, x, top, 2, 20 - top, OUT); rect(g, x, top, 1, 20 - top, '#e8c860'); rect(g, x + 1, top, 1, 20 - top, '#b08828'); rect(g, x - 0, top - 1, 2, 3, '#f4dc88'); }
      rect(g, 5, 10, 14, 3, OUT); rect(g, 6, 10, 12, 1, ROPE[2]); rect(g, 6, 11, 12, 1, ROPE[1]); rect(g, 6, 12, 12, 1, ROPE[0]); rect(g, 8, 13, 1, 3, ROPE[1]); }
    else { for (let row = 0; row < 3; row++) for (let i = 0; i < 5 - row; i++) apple(2 + i * 4 + row * 2, 16 - row * 3, (i + row) % 3 === 0 ? '#c0402a' : (i + row) % 3 === 1 ? '#e06030' : LEAF[4]); rect(g, 0, 20, 24, 1, OUT); rect(g, 2, 19, 20, 1, MID[0]); }
    void r; return c; });
}

/* ============================== THE WHOLE WORLD'S DRAW (called by PWH.drawWorld) ============================== */
/* (claude/palisade2) FALLEN LEAVES on every floor (Daniel 10-25): each top surface in view carries a scatter of russet and gold leaves, hashed so it never crawls;
   THE BREACH's crater floor and stumps carry ash instead. The surfaces are found once a level (a cell you stand on: solid or boards, with air over it) */
const leafCache = new WeakMap();
function surfaces(lv) { let s = leafCache.get(lv); if (s) return s; s = new Map();
  for (let x = 0; x < lv.W; x++) { const col = []; for (let y = 1; y < lv.H; y++) { const t = lv.grid[y * lv.W + x], up = lv.grid[(y - 1) * lv.W + x]; if ((t === 1 || t === 2) && up === 0) col.push(y); } if (col.length) s.set(x, col); }
  leafCache.set(lv, s); return s; }
function leafLitter(g, lv, cx, cy, VW, VH, TS, time) {
  const s = surfaces(lv), ash = lv.breach || [0, -1], x0 = Math.max(0, Math.floor(cx / TS)), x1 = Math.min(lv.W - 1, Math.ceil((cx + VW) / TS));
  for (let x = x0; x <= x1; x++) { const col = s.get(x); if (!col) continue;
    for (const y of col) { const sy = y * TS - cy; if (sy < -8 || sy > VH + 8) continue; const sx = x * TS - cx, burnt = x >= ash[0] && x <= ash[1];
      let h = strHash(x + ':' + y); const n = 3 + (h % 4);
      for (let k = 0; k < n; k++) { h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0; const lx = sx + (h % 16), ly = sy - 1 + ((h >>> 5) % 3) - 1, c = burnt ? ((h >>> 9) % 3 ? '#1e140c' : '#6a6058') : LEAF[1 + ((h >>> 9) % 5)];
        g.fillStyle = c; g.fillRect(R(lx), R(ly), (h >>> 12) % 3 ? 2 : 1, 1); if (!burnt && (h >>> 15) % 4 === 0) g.fillRect(R(lx) + 1, R(ly) - 1, 1, 1); } } } }
export function drawWorld(E) {
  const { g, S, lv, ctx, cx, cy, VW, time, propCells, PROPS, SETTER, standAt } = E, TS = ctx.TS;
  if (!E.noLeaves) leafLitter(g, lv, cx, cy, VW, E.VH || 400, TS, time);
  /* THE HARVEST the goblins took */
  for (const [hx, hy, k] of (lv.harvest || [])) { const x = R(hx * TS + 8 - cx), y = R((hy + 1) * TS - cy); if (x < -30 || x > VW + 30) continue; const sp = harvestSprite(k); g.globalAlpha = 0.3; rect(g, x - 9, y - 1, 18, 2, '#000'); g.globalAlpha = 1; g.drawImage(sp, x - 12, y - sp.height + 1); }
  for (const h of S.hs.values()) { const d = h.d, ccx = R(d.cleat[0] * TS + 8 - cx), ccy = R((d.cleat[1] + 1) * TS - cy), lxs = R(h.lx - cx), ly = R(h.ly - cy), up = h.state === 'hang';
    const span = d.span ? [d.span[0] * TS - cx, (d.span[1] + 1) * TS - cx] : null;
    if (Math.max(ccx, lxs, span ? span[1] : -999) < -100 || Math.min(ccx, lxs, span ? span[0] : 9999) > VW + 100) continue;
    const lean = Math.sign(d.x - d.cleat[0]);
    if (d.load === 'ramp') { const c = propCells(d, (x, y) => ctx.solidAt(x, y)), xs = c.map(q => q[0]), x0 = Math.min(...xs), x1 = Math.max(...xs) + 1, yTop = d.top;
      if (up) { const foot = Math.max(...c.map(q => q[1])) + 1; section(g, R(x0 * TS - cx), R(yTop * TS - cy), (x1 - x0) * TS, (foot - yTop) * TS, 1, (d.x & 1) === 0);   /* the section standing against the face */
        g.fillStyle = 'rgba(255,233,160,0.4)'; for (const [x, y, k] of c) if (k === 'O' || !c.some(q => q[0] === x && q[1] === y - 1)) { g.fillRect(R(x * TS - cx) + 1, R(y * TS - cy), 14, 1); g.fillRect(R(x * TS - cx) + 1, R(y * TS - cy) + 2, 14, 1); }   /* THE RESULT FIRST: the steps' ghost */
        g.fillStyle = 'rgba(255,211,107,0.5)'; for (const [x, y, k] of c) if (k === 'O' || !c.some(q => q[0] === x && q[1] === y - 1)) { for (let q = 0; q < 14; q += 4) g.fillRect(R(x * TS - cx) + 1 + q, R(y * TS - cy) - 1, 2, 1); } }
      else if (h.state === 'fold') { g.save(); g.globalAlpha = 1 - h.fold * 0.55; section(g, R(x0 * TS - cx), R((yTop + h.fold * 4) * TS - cy), (x1 - x0) * TS, 3 * TS, 1, true); g.restore(); }
      else steps(g, c, cx, cy, TS); }
    else if (d.load === 'tower' || d.load === 'bridge') { const bx = R(d.x * TS + 8 - cx), foot = R((d.cleat[1] + 1) * TS - cy), top = R(d.top * TS - cy);
      if (up) { tower(g, bx, foot, top + 6, d.load === 'bridge');
        const sy = R(d.span[2] * TS - cy); g.fillStyle = 'rgba(255,233,160,0.38)'; g.fillRect(R(span[0]), sy, R(span[1] - span[0]), 1); g.fillRect(R(span[0]), sy + 2, R(span[1] - span[0]), 1); dotsH(g, bx, R(span[1]), sy - 2, 0.6); }   /* THE RESULT FIRST: the span's ghost, a dotted line from its foot */
      else if (h.state === 'fold') { g.save(); g.translate(bx, foot); g.rotate(Math.sign(d.span[0] - d.x) * h.fold * Math.PI / 2); g.translate(-bx, -foot); tower(g, bx, foot, top + 6, d.load === 'bridge'); g.restore(); }
      else bridge(g, R(span[0]), R(span[1]), R(d.span[2] * TS - cy)); }
    else if (d.load === 'crew') { const [x0, x1, row] = d.walk, wx0 = R(x0 * TS - cx), wx1 = R((x1 + 1) * TS - cx), wy = R(row * TS - cy);
      if (up) { walkway(g, wx0, wx1, wy, ccy);
        let fy = row + 1; while (fy < lv.H - 1 && !standAt(x0 + 1, fy)) fy++; dotsV(g, R((wx0 + wx1) / 2), wy + 8, R(fy * TS - cy), 0.5); }
      else if (h.state === 'fall') { rect(g, wx0, ly - 7, wx1 - wx0, 5, OUT); rect(g, wx0 + 1, ly - 7, wx1 - wx0 - 2, 1, FRESH[4]); rect(g, wx0 + 1, ly - 6, wx1 - wx0 - 2, 3, FRESH[2]); for (let x = wx0; x < wx1; x += 10) rect(g, x + 2, ly - 12 - ((x >> 3) & 3), 3, 5, FRESH[3]); }
      else if ((h.goneT || 0) < 6) { g.globalAlpha = Math.max(0, 1 - (h.goneT || 0) / 6); for (let x = wx0; x < wx1; x += 9) { rect(g, x, ly - 4 - (x % 3), 8, 3, OUT); rect(g, x + 1, ly - 4 - (x % 3), 6, 1, FRESH[3]); rect(g, x + 1, ly - 3 - (x % 3), 6, 1, FRESH[1]); } g.globalAlpha = 1; } }
    else if (d.load === 'stakes') { const w = PROPS.stakeW * TS;
      if (up) { const top = R(d.top * TS - cy); for (const sx of [lxs - w / 2 - 6, lxs + w / 2 + 3]) { rect(g, sx, top, 4, ly - top + 3, OUT); rect(g, sx + 1, top, 1, ly - top + 2, FRESH[3]); rect(g, sx + 2, top, 1, ly - top + 2, FRESH[1]); lash(g, sx, top + 4, 3, false); }
        rect(g, lxs - w / 2 - 7, ly, w + 14, 3, OUT); rect(g, lxs - w / 2 - 6, ly, w + 12, 1, FRESH[3]); rect(g, lxs - w / 2 - 6, ly + 1, w + 12, 1, MID[0]);   /* the rack */
        let to = Math.floor(h.ly / TS); while (to < lv.H - 1 && !standAt(Math.floor(h.lx / TS), to)) to++; dotsV(g, lxs, ly + 4, R(to * TS - cy), 0.5);
        if (d.roll) { let tx = Math.floor(h.lx / TS), n = 0; const lim = d.rollMax || PROPS.stakeMax; while (n < lim && !ctx.solidAt(tx + d.roll * 2, to - 1)) { tx += d.roll; n++; } dotsH(g, lxs, R((tx + 0.5) * TS - cx), R(to * TS - cy) - 3, 0.5); } }   /* THE RESULT FIRST: where it falls, the road it will roll */
      if (h.state !== 'gone') stack(g, lxs - w / 2, ly, w, h.turn || 0, h.state === 'roll');
      else if ((h.goneT || 0) < 2) for (let k = 0; k < 5; k++) { rect(g, lxs - 22 + k * 9, ly - 5 - (k % 2) * 3, 9, 3, OUT); rect(g, lxs - 21 + k * 9, ly - 4 - (k % 2) * 3, 7, 1, FRESH[3]); rect(g, lxs - 14 + k * 9, ly - 4 - (k % 2) * 3, 2, 1, FRESH[4]); } }
    drawProp(g, ccx, ccy, lean, up, time, strHash(d.id)); }
  /* THE STAKE WALLS */
  for (const w of S.walls) { const x = R(w.x * TS - cx), y = R((w.y + 1) * TS - cy); if (x < -20 || x > VW + 20) continue; const sh = w.shake > 0 ? (w.shake -= 1 / 60, R(Math.sin(time * 60) * 2)) : 0;
    if (w.down) { wallDown(g, x + 8, y, Math.max(0, 1 - w.goneT)); continue; } wall(g, x, y, SETTER.rows, w.hits, sh); }
  /* the area banner: a plank plaque lashed with rope, rust pennant ends */
  if (S.banner && ctx.text && !(ctx.talking && ctx.talking())) { const a = Math.min(1, S.banner.t / 0.6, (3.4 - S.banner.t) / 0.4 + 0.2); g.globalAlpha = Math.max(0, Math.min(1, a));
    const bx = R(VW / 2 - 112), by = 25; rect(g, bx, by, 224, 20, OUT); rect(g, bx + 1, by + 1, 222, 18, '#3a2210'); rect(g, bx + 1, by + 1, 222, 1, FRESH[2]); rect(g, bx + 1, by + 18, 222, 1, '#1c1008');
    for (let k = 0; k < 7; k++) rect(g, bx + 8 + k * 32, by + 2, 1, 16, '#2a180a');
    for (const nx of [bx + 5, bx + 217]) { rect(g, nx, by + 4, 2, 2, IRON[3]); rect(g, nx, by + 13, 2, 2, IRON[3]); }
    for (const px of [bx - 6, bx + 224]) { rect(g, px, by + 2, 6, 14, RUST[1]); rect(g, px, by + 2, 6, 1, RUST[2]); rect(g, px + 1, by + 16, 2, 3, RUST[1]); rect(g, px + 3, by + 16, 2, 2, RUST[0]); }
    ctx.text(S.banner.name, VW / 2, 31, '#ffe9b0', 'center'); g.globalAlpha = 1; }
}
