// glasssea_set.js - THE GLASS SEA's SET, drawn (claude/glasssea art pass): the posts and arches that hold the shelves and fused spans up, the decor kinds (the bone skiffs,
// the fulgurite spires, the fused ridges' crests, THE DARK CUT, THE FORK OBELISK, THE SUN TEMPLE's sealed stub, THE SUNKEN HEAD) and the dressing, from the plan in
// src/redraw/glasssea_props.js (which also bakes everything). Pure drawing: no geometry, rule or number moves.
//   drawProps(g, L, T, cx, cy, vw, vh, time)   everything static in view, behind the heroes
//   drawPost / drawArch                        a fused bed's own supports (src/glass-sea-hands.js draws them as the bed fuses)
import { canvas, px, rect, outline } from '../px.js';
import { GL, hash, HEAD } from './glasssea_tiles.js';
import * as P from './glasssea_props.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round, TS = 16, DARK = '#0a1c26';
const HIDE = { h1: '#6c4428', h2: '#9a6c40', h3: '#c89a62', h4: '#e6c68a' };
const FLUTTER = ['#c8603c', '#e6c68a', '#c8603c', '#9a6c40'];

/* a fulgurite POST: a slim twisted glass tube (h px), the shelf's foot; a collar under the shelf and a flare at the root */
export function bakePost(h, seed) {
  return once('post' + h + '_' + seed, () => { const [c, g] = canvas(16, Math.max(4, h)), mid = 8;
    for (let y = 0; y < h; y++) { const wob = Math.sin(y / 4.5 + seed) * 0.9, hw = 2.4 + (y < 4 ? (4 - y) * 0.5 : 0) + (y > h - 7 ? (y - (h - 7)) * 0.55 : 0), x0 = R(mid + wob - hw), x1 = R(mid + wob + hw);
      for (let x = x0; x <= x1; x++) { const f = (x - x0) / Math.max(1, x1 - x0); px(g, x, y, f < 0.3 ? GL.c2 : f < 0.65 ? GL.c4 : GL.c6); }
      if (y % 4 === 1) px(g, R(mid + wob), y, GL.vioL); }
    outline(c, DARK); return c; });
}
export function drawPost(g, p, cx, cy, alpha) {
  const x = p.x * TS + 8, y0 = p.y0 * TS + 6, y1 = p.y1 * TS + (p.sl ? 6 : 0), h = y1 - y0; if (h < 2) return;
  if (alpha != null && alpha < 1) g.globalAlpha = alpha; g.drawImage(bakePost(h, p.x % 7), R(x - 8 - cx), R(y0 - cy)); g.globalAlpha = 1;
}
/* THE ARCH under a long fused span: springs from the lips, 3 tiles down, to the deck at the middle; glass, lit on the top edge */
export function bakeArch(tiles) {
  return once('arch' + tiles, () => { const W = tiles * 16 + 4, H = 56, [c, g] = canvas(W, H);
    for (let x = 0; x < W; x++) { const t = (x + 0.5) / W, top = R(1 + 46 * Math.pow(Math.abs(2 * t - 1), 1.7)), th = R(7 - 2 * Math.abs(2 * t - 1));
      for (let y = top; y < top + th && y < H; y++) { const f = (y - top) / th; px(g, x, y, f < 0.15 ? GL.w : f < 0.4 ? GL.c2 : f < 0.7 ? GL.c4 : GL.c6); if (f > 0.3 && f < 0.7 && (x * 3 + y) % 17 === 0) px(g, x, y, GL.vioL); } }
    outline(c, DARK); return c; });
}
export function drawArch(g, a, cx, cy, alpha) { const tiles = a.b - a.a + 1; if (alpha != null && alpha < 1) g.globalAlpha = alpha; g.drawImage(bakeArch(tiles), R(a.a * TS - 2 - cx), R(a.y * TS + 5 - cy)); g.globalAlpha = 1; }
export function bakeCrest(v) {
  return once('crest' + v, () => { const [c, g] = canvas(14, 10);
    const spike = (x, h, lean, w) => { for (let i = 0; i < h; i++) { const t = i / h, hw = Math.max(0.5, (w / 2) * (1 - t * 0.9)), cxx = x + lean * t; for (let xx = R(cxx - hw); xx <= R(cxx + hw); xx++) px(g, xx, 9 - i, xx <= cxx - hw * 0.3 ? GL.c2 : xx <= cxx + hw * 0.4 ? GL.c4 : GL.c6); } px(g, R(x + lean), 9 - h, GL.w); };
    spike(4, 6 + (v % 3) * 2, -1, 4); spike(9, 4 + ((v + 1) % 3) * 2, 1, 3); outline(c, DARK); return c; });
}

/* ================================ THE SET ================================ */
function drawDress(g, d, X, Y, time) {
  const gx = X(d.tx) + 8, gy = Y(d.ty);
  if (d.k === 'shards') g.drawImage(P.bakeShards(d.v), R(gx - 14), R(gy - 21));
  else if (d.k === 'stump') g.drawImage(P.bakeStump(d.v), R(gx - 8), R(gy - 19));
  else if (d.k === 'drift') { const c = P.bakeDrift(d.v); g.drawImage(c, R(gx - c.width / 2), R(gy - 7)); }
  else if (d.k === 'bones' || d.k === 'skull') g.drawImage(P.bakeBones(d.k === 'skull' ? 2 : d.v), R(gx - 13), R(gy - 13));
  else if (d.k === 'ribs') g.drawImage(P.bakeRibs(0), R(gx - 38), R(gy - 55));
  else if (d.k === 'cairn') g.drawImage(P.bakeCairn(0), R(gx - 8), R(gy - 15));
  else if (d.k === 'frost') g.drawImage(P.bakeFrost(d.v), R(gx - 13), R(gy - 21));
  else if (d.k === 'rime') g.drawImage(P.bakeRime(d.v), R(gx - 7), R(gy - 23));
  else if (d.k === 'hide') { g.drawImage(P.bakeHidePole(), R(gx - 3), R(gy - 39)); const top = R(gy - 36);
    for (let i = 0; i < 5; i++) { const sw = Math.sin(time * 3.2 + i * 0.9 + d.tx) * (1 + i * 0.5); g.fillStyle = FLUTTER[i % 4]; g.fillRect(R(gx + 2 + i * 3), R(top + 1 + i * 0.4 + sw * 0.4), 3, 6 - (i >> 1)); g.fillStyle = HIDE.h1; g.fillRect(R(gx + 2 + i * 3), R(top + 1 + i * 0.4 + sw * 0.4), 3, 1); } }
  else if (d.k === 'chime') { g.drawImage(P.bakeChimePost(), R(gx - 11), R(gy - 33));
    for (let i = 0; i < 4; i++) { const sx = gx - 8 + i * 5, sw = Math.sin(time * 1.7 + i * 1.3 + d.tx) * 1.6, len = 8 + (i % 2) * 4; g.fillStyle = '#e8dcc0'; g.fillRect(R(sx), R(gy - 28), 1, len); g.fillStyle = i % 2 ? GL.c3 : GL.c2; g.fillRect(R(sx - 1 + sw), R(gy - 28 + len), 3, 5); g.fillStyle = GL.w; g.fillRect(R(sx + sw), R(gy - 28 + len), 1, 2); } }
}
/* every static piece of the set in view: the supports, the decor kinds, the dressing */
export function drawProps(g, L, T, cx, cy, vw, vh, time) {
  const pl = P.plan(L, T), X = x => R(x * TS - cx), Y = y => R(y * TS - cy), inX = (px0, m = 120) => px0 > cx - m && px0 < cx + vw + m;
  for (const p of pl.posts) if (!p.bed && inX(p.x * TS)) drawPost(g, p, cx, cy);
  for (const a of pl.arches) if (!a.bed && inX(a.a * TS, 300)) drawArch(g, a, cx, cy);
  for (const c of pl.piers) for (const p of c.piers) if (!p.decor && inX(p.x * TS)) drawPier(g, c, p, cx, cy);
  for (const d of L.decor || []) { const x = (d.x ?? d.x0) * TS; if (!inX(x, 500)) continue; drawDecor(g, d, L, T, cx, cy, vw, time); }
  for (const d of pl.dress) if (inX(d.x * TS, 60)) drawDress(g, d, X, Y, time);
}
function drawPier(g, c, p, cx, cy) {   /* a pier under a hanging mass: the cut's ribs are glass; the obelisk's plinth is its own sandstone */
  const x = p.x * TS, y0 = p.y0 * TS, y1 = p.y1 * TS, h = y1 - y0;
  if (c.how === 'plinth') { for (let yy = 0; yy < h; yy += 4) for (let xx = 0; xx < 16; xx++) { g.fillStyle = xx < 2 ? '#a47a48' : xx > 12 ? '#3a2616' : (hash(xx >> 1, (y0 + yy) >> 2) % 7 === 0 ? '#3a2616' : '#5a3c22'); g.fillRect(R(x + xx - cx), R(y0 + yy - cy), 1, Math.min(4, h - yy)); }
    g.fillStyle = '#c89c62'; g.fillRect(R(x - 1 - cx), R(y0 - cy), 18, 3); g.fillStyle = '#3a2616'; g.fillRect(R(x - 1 - cx), R(y1 - 4 - cy), 18, 4); return; }
  g.drawImage(bakePost(h, p.x % 5), R(x - cx), R(y0 - cy));
}
export function drawDecor(g, d, L, T, cx, cy, vw, time) {
  const X = x => R(x * TS - cx), Y = y => R(y * TS - cy);
  if (d.kind === 'skiff') g.drawImage(P.bakeSkiff(d.x % 2), X(d.x) + 8 - 42, Y(d.y + 1) - 50);
  else if (d.kind === 'spire') { const h = (d.y + 1 - d.top - 1) * TS + 6, c = P.bakeSpire(h, !d.tall, (d.x % 5) + 1, !!d.tall); g.drawImage(c, X(d.x) + 8 - 22, Y(d.top + 1) - 4); }
  else if (d.kind === 'ridge') { for (let x = d.x0 * TS + 4, i = 0; x < (d.x1 + 1) * TS - 6; x += 9 + hash(i++, d.x0) % 5) g.drawImage(bakeCrest(i % 3), R(x - cx), Y(d.y) - 8); }
  else if (d.kind === 'cut') { const x0 = X(d.x0), w = (d.x1 - d.x0 + 1) * TS, y0 = Y(d.y1 + 1), gr = g.createLinearGradient(0, y0, 0, y0 + 5 * TS); gr.addColorStop(0, 'rgba(6,12,34,0.62)'); gr.addColorStop(1, 'rgba(6,12,34,0.05)'); g.fillStyle = gr; g.fillRect(x0, y0, w, 5 * TS); }
  else if (d.kind === 'obelisk') {
    g.drawImage(P.bakeObeliskCap(), X(d.x0) - 10, Y(d.top) - 30); g.drawImage(P.bakeObeliskEye(), X(d.x0) - 4, Y(d.eye) - 3);
    { const ex = X(d.x0), ey = Y(d.eye), ew = (d.x1 - d.x0 + 1) * TS, k = 0.5 + 0.5 * Math.sin(time * 1.4);   /* THE EYE'S LENS: a pane of glass fills the slit (the upper block rests on it; the sunset ray passes through) */
      g.globalAlpha = 0.5; g.fillStyle = '#7adcc4'; g.fillRect(ex, ey, ew, 16); g.globalAlpha = 0.42; g.fillStyle = '#e6fff6'; g.fillRect(ex, ey + 1, ew, 2); g.fillStyle = '#34908c'; g.fillRect(ex, ey + 13, ew, 3); g.globalAlpha = 1;
      g.fillStyle = '#ffd36b'; g.globalAlpha = 0.55 + 0.25 * k; g.fillRect(ex + R(ew / 2) - 3, ey + 2, 6, 12); g.globalAlpha = 1; g.fillStyle = '#241810'; g.fillRect(ex + R(ew / 2) - 1, ey + 3, 2, 10);   /* a gold iris with a dark slit pupil */
      for (let i = 1; i < 4; i++) { g.globalAlpha = 0.35; g.fillStyle = '#ffffff'; g.fillRect(ex + i * 16 - 2 + ((i * 5) % 7), ey + 3, 1, 10); g.globalAlpha = 1; } }
    const gx = X(d.x0 + 1), gw = (d.x1 - d.x0 - 1) * TS, gt = Y(d.y - 2), gh = 3 * TS; g.fillStyle = '#120a06'; g.fillRect(gx, gt, gw, gh); g.fillStyle = '#241810'; g.fillRect(gx, gt, gw, 3); }   /* the dark doorway between the plinth piers */
  else if (d.kind === 'templeDoor') { const c = P.bakeTemple(); g.drawImage(c, X(d.x) + 8 - 50, Y(d.y + 1) - c.height + 2); }
  else if (d.kind === 'head') drawHead(g, d, cx, cy, time);
}
/* THE SUNKEN HEAD: the carved face over the wall, the ear's frame, and the glow on each hold (the three, in turn) */
function drawHead(g, d, cx, cy, time) {
  const f = P.bakeHeadFace(), fx = HEAD.x0 * TS - cx, fy = HEAD.y0 * TS - cy;
  g.drawImage(f, 0, 0, f.width, 96, R(fx), R(fy), f.width, 96); g.drawImage(f, 0, 128, f.width, f.height - 128, R(fx), R(fy + 128), f.width, f.height - 128);   /* (the ear's rows 96-128 stay the alcove's own) */
  g.fillStyle = '#0c121c'; for (const [rx, ry, rw, rh] of [[0, 94, 68, 3], [0, 125, 68, 3], [65, 94, 3, 34]]) g.fillRect(R(fx + rx), R(fy + ry), rw, rh);
  g.fillStyle = '#5a86a8'; g.fillRect(R(fx), R(fy + 94), 66, 1); g.fillRect(R(fx), R(fy + 125), 66, 1);   /* the ear's carved rim */
  const eye = 0.5 + 0.5 * Math.sin(time * 1.1); g.globalAlpha = 0.25 + 0.25 * eye; g.fillStyle = '#ffd36b'; g.fillRect(R(fx + 30), R(fy + 66), 54, 8); g.globalAlpha = 1;   /* the eye's gleam breathes */
  const holds = [[361, 368, 25], [362, 365, 22], [365, 368, 19]];   /* the nose ridge, the cheek, the brow: they glow in turn */
  holds.forEach(([a, b, row], i) => { const ph = (time * 0.9 - i * 0.55) % 3, k = Math.max(0, 1 - Math.abs(ph - 0.5) * 1.6), w = (b - a + 1) * TS, x = a * TS - cx, y = row * TS - cy;
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.16 + 0.34 * k; const gr = g.createLinearGradient(0, y - 18, 0, y + 2); gr.addColorStop(0, 'rgba(255,211,107,0)'); gr.addColorStop(1, 'rgba(255,225,140,1)'); g.fillStyle = gr; g.fillRect(R(x - 2), R(y - 18), w + 4, 20);
    g.globalAlpha = 0.5 + 0.4 * k; g.fillStyle = '#fff6c8'; g.fillRect(R(x), R(y), w, 1); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; });
}
