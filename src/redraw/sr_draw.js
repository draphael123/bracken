// sr_draw.js - SIREN ROCKS' shared drawing kit (claude/srart, 2026-11-12). Pure drawing, fillRect only (so tools/sr-art-sheet.mjs rasterises it in node, no browser).
// The silhouette pass of claude/sea4 (Drowned King 2) made every body part its OWN outlined mass; this is that method as a tiny toolkit:
//   a LAYER is a pixel map in local space (origin = the body's feet, y up is negative, facing +x). Shapes (ell / cap / poly / line / px) paint into it in painter's order;
//   flush() draws the layer's 1-px dark outline round the WHOLE layer first, then its fill as horizontal runs (one fillRect per run, not per pixel), through the caller's rc()
//   (which mirrors for facing -1 and applies a hurt tint). A mass drawn later outlines itself over the ones before it: head over torso over coils.
//   shading is toon: each shape takes a RAMP (dark ... light) and picks a band from a light that falls from the top; cap() can lay a BELLY colour on one side (scutes), tex adds a scale
//   dither on the mid band. Nothing here reads a level, a hand or main.js.
const R = Math.round, D2R = Math.PI / 180;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
export const hexRgb = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
export const mixC = (c, d, k) => { const A = hexRgb(c), B = hexRgb(d), m = i => R(A[i] + (B[i] - A[i]) * k); return '#' + [m(0), m(1), m(2)].map(v => v.toString(16).padStart(2, '0')).join(''); };
export const pol = (deg, len) => [Math.cos(deg * D2R) * len, Math.sin(deg * D2R) * len];
const KX = 4096, OX = 2048, OY = 512;
export class Layer {
  constructor() { this.m = new Map(); }
  set(x, y, c) { x = R(x); y = R(y); this.m.set(((y + OY) * KX) + x + OX, c); }
  has(x, y) { return this.m.has(((R(y) + OY) * KX) + R(x) + OX); }
  get(x, y) { return this.m.get(((R(y) + OY) * KX) + R(x) + OX); }
  get size() { return this.m.size; }
}
const LIGHT = [-0.28, -0.96];
/* a band of the ramp for a lit value -1 (away from the light) .. 1 (facing it) */
export const band = (ramp, lit) => { const n = ramp.length; if (n === 1) return ramp[0]; const v = clamp((lit * 0.85 + 0.15 + 1) / 2, 0, 0.999); return ramp[Math.floor(v * n)]; };
const texOn = (x, y) => ((x + ((y >> 1) & 1) * 2) & 3) === 0 && (y & 1) === 0;
/* an ellipse (rot degrees). o: belly = ramp (laid on the lower front: ny > belly cut), bc = cut (default 0.45), tex = scale dither (a darker colour), hi = a spec dot colour */
export function ell(L, cx, cy, rx, ry, ramp, o = {}) {
  const r = Math.ceil(Math.max(rx, ry)) + 1, a = (o.rot || 0) * D2R, ca = Math.cos(a), sa = Math.sin(a);
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) {
    const px = R(cx) + i, py = R(cy) + j, dx = px - cx, dy = py - cy, u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
    if ((u / rx) ** 2 + (v / ry) ** 2 > 1) continue;
    const nx = dx / Math.max(rx, ry), ny = dy / Math.max(rx, ry);
    let c = band(ramp, nx * LIGHT[0] + ny * LIGHT[1]);
    if (o.belly && ny > (o.bc ?? 0.45)) c = o.belly[(px + py) & 1 ? 0 : o.belly.length - 1];
    else if (o.tex && texOn(px, py)) c = o.tex;
    L.set(px, py, c);
  }
}
/* a tapered capsule from (x0,y0) r0 to (x1,y1) r1. o: belly = ramp laid where the offset points along bellyDir [bx,by] (cut bc), tex, round (default true) */
export function cap(L, x0, y0, x1, y1, r0, r1, ramp, o = {}) {
  const dx = x1 - x0, dy = y1 - y0, len2 = dx * dx + dy * dy || 1, rm = Math.max(r0, r1) + 1;
  const xa = Math.floor(Math.min(x0, x1) - rm), xb = Math.ceil(Math.max(x0, x1) + rm), ya = Math.floor(Math.min(y0, y1) - rm), yb = Math.ceil(Math.max(y0, y1) + rm);
  const bd = o.bellyDir || [1, 0.4];
  for (let py = ya; py <= yb; py++) for (let px = xa; px <= xb; px++) {
    let t = ((px - x0) * dx + (py - y0) * dy) / len2; t = clamp(t, 0, 1); const cx = x0 + dx * t, cy = y0 + dy * t, r = lerp(r0, r1, t), ox = px - cx, oy = py - cy, d = Math.hypot(ox, oy);
    if (d > r + 0.001) continue;
    const nx = ox / (r || 1), ny = oy / (r || 1);
    let c = band(ramp, nx * LIGHT[0] + ny * LIGHT[1]);
    if (o.belly && (nx * bd[0] + ny * bd[1]) / Math.hypot(bd[0], bd[1]) > (o.bc ?? 0.5)) c = o.belly[((px >> 1) + (py >> 1)) & 1 ? 0 : o.belly.length - 1];
    else if (o.tex && texOn(px, py)) c = o.tex;
    L.set(px, py, c);
  }
}
/* a filled polygon (even-odd) in one colour or a [light, dark] pair split by height */
export function poly(L, pts, col) {
  let xa = 1e9, xb = -1e9, ya = 1e9, yb = -1e9; for (const [x, y] of pts) { xa = Math.min(xa, x); xb = Math.max(xb, x); ya = Math.min(ya, y); yb = Math.max(yb, y); }
  for (let py = Math.floor(ya); py <= Math.ceil(yb); py++) for (let px = Math.floor(xa); px <= Math.ceil(xb); px++) {
    let ins = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) ins = !ins; }
    if (ins) L.set(px, py, Array.isArray(col) ? (py < (ya + yb) / 2 ? col[0] : col[1]) : col);
  }
}
export function line(L, x0, y0, x1, y1, c, th = 1) {
  const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; for (let a = 0; a < th; a++) for (let b = 0; b < th; b++) L.set(x - (th >> 1) + a, y - (th >> 1) + b, c); }
}
export const px = (L, x, y, c) => L.set(x, y, c);
/* the whole layer, as runs through rc(dx, dy, w, h, colour): the outline ring first (if oc), then the fill */
export function flush(L, rc, oc, alpha = 1) {
  if (!L.size) return;
  const cells = []; for (const [k, c] of L.m) cells.push([(k % KX) - OX, Math.floor(k / KX) - OY, c]);
  if (oc) { const ring = new Map(); for (const [x, y] of cells) for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!L.has(x + ax, y + ay)) ring.set(((y + ay + OY) * KX) + x + ax + OX, [x + ax, y + ay]);
    runs([...ring.values()].map(([x, y]) => [x, y, oc]), rc, alpha); }
  runs(cells, rc, alpha);
}
function runs(cells, rc, alpha) {
  cells.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  let i = 0; while (i < cells.length) { const [x, y, c] = cells[i]; let j = i + 1; while (j < cells.length && cells[j][1] === y && cells[j][0] === cells[j - 1][0] + 1 && cells[j][2] === c) j++; rc(x, y, j - i, 1, c, alpha); i = j; }
}
