// src/contrast-rim.js — A LIGHT RIM FOR DARK FOES IN DARK PLACES (docs/sprite-quality-audit.md). Not wired in.
// The audit found the foes that vanish are dark bodies (L* 23-36) on dusky or cave backdrops: the bat in the Falling Tower, the snuffer
// on the Lamplit Street, the lamprey in the Keep, the petrel on the Causeway. Their dark outline is the same value as the dark behind
// them, so nothing separates them. The cure art uses everywhere: a one-pixel rim of light along the edges that face UP (lit from above),
// just outside the outline, in a tint picked against the level's backdrop. It is baked once per sprite set per level that needs it.
//   rimSet(set, bgL, tint?) -> a new set { R, L, white, ax, ay, w, h } with every frame rimmed (L is the flip of the rimmed R)
//   rimCanvas(canvas, colour) -> a rimmed copy of one frame
//   needsRim(bodyL, bgHist) -> the share of the backdrop within 12 L* of the body (the audit's camouflage); rim above 0.45
//   RIM_TINT(bgL) -> the rim colour: pale and cool on a dark backdrop, a dark warm edge on a pale one
import { flipX, whiten } from './px.js';
export const RIM_TINT = bgL => bgL < 45 ? '#aebcd4' : bgL < 60 ? '#f0e6c8' : '#2a1e28';
export const needsRim = (bodyL, hist) => { const n = hist.reduce((a, b) => a + b, 0) || 1; let near = 0; for (let L = Math.max(0, Math.round(bodyL) - 12); L <= Math.min(100, Math.round(bodyL) + 12); L++) near += hist[L] || 0; return near / n; };
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
export function rimCanvas(src, colour) {
  const W = src.width, H = src.height, c = src.ownerDocument ? src.ownerDocument.createElement('canvas') : new src.constructor(W, H);
  c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const img = g.getImageData(0, 0, W, H), d = img.data, a = (x, y) => x >= 0 && y >= 0 && x < W && y < H && d[(y * W + x) * 4 + 3] > 127, [r0, g0, b0] = hex(colour);
  /* the top of the body: the lowest row of it that still counts as "up" (a rim along the flanks only in the top 45%) */
  let top = H, bot = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (a(x, y)) { top = Math.min(top, y); bot = Math.max(bot, y); }
  const flank = top + (bot - top) * 0.45, paint = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (a(x, y)) continue;
    if (a(x, y + 1)) paint.push([x, y]);                                                          // over an upward-facing edge
    else if (y <= flank && (a(x + 1, y) || a(x - 1, y))) paint.push([x, y]); }                     // beside a flank, high on the body
  for (const [x, y] of paint) { const p = (y * W + x) * 4; d[p] = r0; d[p + 1] = g0; d[p + 2] = b0; d[p + 3] = 255; }
  g.putImageData(img, 0, 0); return c;
}
export function rimSet(set, bgL, tint) {
  const col = tint || RIM_TINT(bgL), each = v => Array.isArray(v) ? v.map(c => rimCanvas(c, col)) : v && v.getContext ? rimCanvas(v, col) : v;
  const R = Array.isArray(set.R) ? set.R.map(c => rimCanvas(c, col)) : Object.fromEntries(Object.entries(set.R).map(([k, v]) => [k, each(v)]));
  const flip = v => Array.isArray(v) ? v.map(flipX) : v && v.getContext ? flipX(v) : v, L = Array.isArray(R) ? R.map(flipX) : Object.fromEntries(Object.entries(R).map(([k, v]) => [k, flip(v)]));
  return { ...set, R, L, rim: col };
}
