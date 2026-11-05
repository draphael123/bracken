// fire_drake_set.js - THE CALDERA's dressing for THE FIRE DRAKE (claude/drakeart, D2): the demon SEAL (4 stages), the iron CHAINS (linked, sagging or taut and white-hot),
// the scorched RING with its posts, the basalt LEDGES, the VENTS and their geysers, the magma CREST, and the caldera's own BACKDROP.
// Volcano heart: black basalt, ember, cooled-lava hide - no timber anywhere. The seal + vents are baked (px.js); the rest draws straight on the frame with 1 px rects.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline } from '../px.js';
import { OUT } from '../art.js';

const C = { b0: '#1a1418', b1: '#2e2428', b2: '#4a3a34', b3: '#7a6a5a', b4: '#a08c78', em: '#ff9a3a', emH: '#ffe08a', fire: '#ff5a1a', red: '#c8321a', iron: ['#2a2622', '#5a5248', '#8a8070', '#b8ac98'], soot: '#3a1a10' };
const R = Math.round;
const once = (m, k, f) => { let v = m.get(k); if (!v) { v = f(); m.set(k, v); } return v; };
const SEALS = new Map();
export const SEAL_SIZE = { w: 84, h: 20 };
/* THE SEAL: a black basalt disc laid flat in the floor, a rune ring round its rim, the demon's sigil in the middle. stage 1/2 = ember cracks run out of the sigil;
   3 = split (a magma seam straight through it and the halves lifted). glow 0/1 = the runes brighten */
export function sealSprite(stage, glow) {
  return once(SEALS, stage + '|' + (glow ? 1 : 0), () => {
    const [c, g] = canvas(SEAL_SIZE.w, SEAL_SIZE.h), cx = 42, cy = 10, ra = glow ? C.emH : C.em;
    ellipse(g, cx, cy + 1, 41, 8.5, C.b0); ellipse(g, cx, cy, 40, 8, C.b2); ellipse(g, cx, cy - 1, 37, 6.5, C.b1, C.b2); ellipse(g, cx, cy, 33, 5.5, C.b2, C.b1);
    for (let i = 0; i < 20; i++) { const t = i / 20 * Math.PI * 2, x = cx + Math.cos(t) * 36, y = cy + Math.sin(t) * 6.2; rect(g, x - 1, y, 3, 1, i & 1 ? ra : C.red); }   // the rune ring
    for (let i = 0; i < 8; i++) { const t = i / 8 * Math.PI * 2 + 0.2, x = cx + Math.cos(t) * 25, y = cy + Math.sin(t) * 4; px(g, x, y, ra); px(g, x + 1, y, C.red); }
    ellipse(g, cx, cy, 14, 3.2, C.b0); line(g, cx - 13, cy, cx + 13, cy, ra); line(g, cx - 5, cy - 2, cx, cy + 3, ra); line(g, cx + 5, cy - 2, cx, cy + 3, ra); line(g, cx, cy - 3, cx, cy + 3, glow ? C.emH : C.red);   // the sigil: a horned eye
    const crack = (pts, col) => { for (let i = 0; i + 1 < pts.length; i++) line(g, cx + pts[i][0], cy + pts[i][1], cx + pts[i + 1][0], cy + pts[i + 1][1], col); };
    if (stage >= 1) { crack([[-8, 0], [-16, -2], [-22, 1], [-30, 3]], C.fire); crack([[-16, -2], [-19, -5]], C.em); }
    if (stage >= 2) { crack([[9, 1], [16, 3], [24, 0], [31, -2]], C.fire); crack([[16, 3], [19, 6]], C.em); crack([[-3, 3], [-1, 7]], C.em); }
    if (stage >= 3) { for (let y = 1; y < SEAL_SIZE.h - 1; y++) { const x = cx + Math.sin(y * 0.9) * 1.5; rect(g, x - 2, y, 5, 1, C.b0); rect(g, x - 1, y, 3, 1, y & 1 ? C.fire : C.emH); } rect(g, cx - 40, cy - 1, 4, 2, C.b3); rect(g, cx + 36, cy - 1, 4, 2, C.b3); }
    return outline(c, OUT); });
}
/* THE CHAINS: iron links - alternate flat and edge-on - hung seal to collar. slack: sag to the floor; taut: straight, the links white-hot and shivering */
export function drawChain(g, x0, y0, x1, y1, sag, taut, time, i) {
  const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 3.5));
  for (let k = 0; k <= n; k++) { const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + (taut ? 0 : Math.sin(t * Math.PI) * sag) + (taut ? Math.sin(time * 40 + k + i) * 0.6 : 0);
    const hot = taut && ((k + Math.floor(time * 18)) % 3 === 0), flat = k & 1, hi = taut ? (hot ? '#ffffff' : C.emH) : C.iron[3], mid = taut ? C.em : C.iron[2], lo = taut ? C.red : C.iron[1];
    if (flat) { rect(g, R(x) - 2, R(y) - 1, 4, 3, C.iron[0]); rect(g, R(x) - 1, R(y), 2, 1, lo); rect(g, R(x) - 2, R(y) - 1, 3, 1, hi); rect(g, R(x) - 1, R(y) + 1, 2, 1, mid); }
    else { rect(g, R(x) - 1, R(y) - 2, 3, 4, C.iron[0]); rect(g, R(x), R(y) - 1, 1, 2, lo); rect(g, R(x) - 1, R(y) - 2, 1, 3, hi); } }
  /* the seal-end staple: a bolt plate driven into the disc */
  rect(g, R(x0) - 3, R(y0) - 2, 6, 4, C.iron[0]); rect(g, R(x0) - 2, R(y0) - 2, 4, 2, C.iron[2]); px(g, R(x0), R(y0) - 1, taut ? C.emH : C.iron[3]);
}
/* THE SCORCHED RING: a ring of soot and ember scars at the chain's reach, an iron post at each end of its reach (they glow when a chain is taut) */
export function drawRing(g, cx, fy, ring, taut, time) {
  for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2, x = cx + Math.cos(t) * ring, y = fy + 1 + Math.sin(t) * 4;
    if ((a * 7) % 5 === 0) continue; g.fillStyle = taut ? ((a + Math.floor(time * 12)) & 1 ? C.fire : C.em) : ((a & 1) ? C.soot : '#5a2a18'); g.fillRect(R(x), R(y), (a % 3) + 1, 1);
    if (a % 5 === 2) { g.fillStyle = taut ? C.emH : '#7a3a20'; g.fillRect(R(x), R(y) - 1, 1, 1); } }
  for (const sd of [-1, 1]) { const x = R(cx + sd * ring);
    rect(g, x - 2, fy - 8, 4, 10, C.iron[0]); rect(g, x - 1, fy - 8, 2, 9, C.iron[1]); rect(g, x - 1, fy - 8, 1, 7, C.iron[2]); rect(g, x - 3, fy - 9, 6, 2, C.iron[1]); rect(g, x - 3, fy - 9, 6, 1, C.iron[3]);
    rect(g, x - 2, fy, 4, 2, C.b1); rect(g, x - 1, fy - 5, 2, 2, taut ? C.emH : C.red); } }
/* THE BASALT LEDGES: hex columns, dark top, ember lit under-edge from the magma below */
export function drawLedge(g, x, y, w, time) {
  rect(g, x, y, w, 5, C.b1); rect(g, x, y, w, 1, C.b4); rect(g, x, y + 1, w, 1, C.b3);
  for (let q = 0; q < w; q += 6) { rect(g, x + q, y + 2, 1, 3, C.b0); rect(g, x + q + 2, y + 2, 2, 1, C.b2); }
  rect(g, x, y + 5, w, 1, C.b0); for (let q = 2; q < w - 2; q += 4) { const h = 1 + ((q * 5 + Math.floor(time * 4)) % 3); g.globalAlpha = 0.7; rect(g, x + q, y + 6, 2, h, q % 8 < 4 ? C.fire : C.em); g.globalAlpha = 1; }
  px(g, x, y, C.b1); px(g, x + w - 1, y, C.b1);
}
/* THE VENTS (P3): told as a cracked mouth glowing white-orange, then a lava geyser: a column of bubbling magma with a ragged crown and spat embers */
export function drawVent(g, x, fy, w, h, told, rise, time) {
  rect(g, x - w - 3, fy - 1, w * 2 + 6, 3, C.b0); rect(g, x - w - 1, fy - 2, w * 2 + 2, 2, C.b2);
  for (let q = -w; q <= w; q += 3) rect(g, x + q, fy - 1, 2, 1, told ? (Math.floor(time * 16 + q) & 1 ? C.emH : C.fire) : C.red);
  if (told) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 18); ellipseFill(g, x, fy - 1, w + 4, 3, C.fire); g.globalAlpha = 1; for (let i = 0; i < 3; i++) { const q = (time * 3 + i / 3) % 1; px(g, x - 3 + i * 3, fy - 3 - q * 7, C.emH); } return; }
  const hh = R(h * Math.min(1, rise));
  for (let yy = 0; yy < hh; yy++) { const wob = Math.sin(yy * 0.5 + time * 30) * 1.2, ww = w - (yy > hh - 6 ? (yy - (hh - 6)) * 0.5 : 0) + wob; rect(g, x - ww, fy - yy, ww * 2, 1, yy % 5 < 2 ? C.fire : C.em); rect(g, x - ww / 2, fy - yy, ww, 1, yy % 7 < 3 ? C.emH : C.em); }
  for (let i = 0; i < 6; i++) { const q = (time * 4 + i * 0.17) % 1, sx = x + (i - 2.5) * 5 * q; px(g, sx, fy - hh - q * 10 + q * q * 12, i & 1 ? C.emH : C.fire); }
  rect(g, x - w - 1, fy - 3, 2, 3, C.fire); rect(g, x + w - 1, fy - 3, 2, 3, C.fire);
}
function ellipseFill(g, cx, cy, rx, ry, col) { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry + 0.01))); g.fillRect(R(cx) - w, R(cy) + y, w * 2, 1); } }
/* THE MAGMA CREST (P3 slam): a rolling wall of lava, jump it - sample height h at offset q, hot crest on top */
export function drawCrest(g, x, fy, q, h, time) {
  if (h < 1) return; rect(g, x + q, fy - h, 2, h + 1, h > 6 ? C.emH : C.em); rect(g, x + q, fy - h + 2, 2, h - 2, C.fire); if (h > 8) px(g, x + q, fy - h - 1 - (Math.floor(time * 20 + q) & 1), C.emH);
}

/* ---------- THE CALDERA'S BACKDROP: a blackened sky over the heart of the mountain; far cones with a lava glow, the caldera's black wall of columns, ash drifting up ---------- */
const BD = new Map();
function skyStrip() { return once(BD, 'sky', () => { const [c, g] = canvas(1, 128); const bands = [['#120608', 0], ['#2a0e0e', 22], ['#4a1812', 46], ['#7a2a18', 70], ['#a84420', 92], ['#d8702a', 112], ['#f0a040', 126]];
  for (let y = 0; y < 128; y++) { let col = bands[0][0]; for (const [cc, at] of bands) if (y >= at) col = cc; px(g, 0, y, col); } return c; }); }
function coneStrip(seed, h, hot) { return once(BD, 'cone' + seed, () => { const W = 800, [c, g] = canvas(W, h + 4); let x = 0, i = 0;
  while (x < W) { const w = 120 + ((i * 53 + seed * 17) % 90), top = 20 + ((i * 37 + seed * 11) % (h - 30)), mid = x + w / 2;
    fillPoly(g, [[x, h], [mid - 10, h - top], [mid - 3, h - top - 4], [mid + 3, h - top - 4], [mid + 10, h - top], [x + w, h]], seed ? '#2a1218' : '#3a1a1c');
    fillPoly(g, [[mid + 2, h - top - 4], [mid + 10, h - top], [x + w, h], [mid + 6, h]], seed ? '#1e0c10' : '#2a1216');
    if (hot) { px(g, mid - 1, h - top - 5, C.fire); px(g, mid, h - top - 5, C.em); rect(g, mid - 2, h - top - 4, 4, 1, C.fire); for (let k = 0; k < 5; k++) rect(g, mid - 1 + (k % 2 ? 1 : -1) * (k >> 1), h - top + k * 5, 1, 3, C.red); }
    x += w - 24; i++; }
  return c; }); }
function wallStrip() { return once(BD, 'wall', () => { const W = 256, H = 150, [c, g] = canvas(W, H);
  rect(g, 0, 0, W, H, '#1e1a24'); for (let x = 0; x < W; x += 14) { const w = 10 + ((x * 7) % 5); rect(g, x, 0, w, H, (x / 14) & 1 ? '#25222c' : '#2e2a36'); rect(g, x, 0, 1, H, C.b0); rect(g, x + w - 2, 0, 1, H, '#403c4a'); for (let y = 6 + (x % 9); y < H; y += 22) rect(g, x + 1, y, w - 3, 1, C.b0); }
  for (let k = 0; k < 7; k++) { const x = (k * 41 + 13) % W, y = 20 + (k * 29) % (H - 40); line(g, x, y, x + 6, y + 9, C.red); line(g, x + 6, y + 9, x + 3, y + 18, C.fire); px(g, x + 6, y + 9, C.emH); }
  return c; }); }
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  g.drawImage(skyStrip(), 0, 0, 1, 128, 0, 0, VW, VH);
  const hz = 160 - cy * 0.3 + dY * 0.1;
  if (full) { const c2 = coneStrip(0, 90, true), off = R(cx * 0.1) % 800; for (let x = -off; x < VW; x += 800) g.drawImage(c2, x, R(hz - 60)); }
  { const c1 = coneStrip(1, 70, true), off = R(cx * 0.25) % 800; for (let x = -off; x < VW; x += 800) g.drawImage(c1, x, R(hz - 20)); }
  /* the lava lake's glow under the far cones, breathing */
  g.globalAlpha = 0.18 + 0.05 * Math.sin(time * 1.3); g.fillStyle = C.fire; g.fillRect(0, R(hz + 8), VW, VH); g.globalAlpha = 1;
  /* the caldera's own black wall of basalt columns, anchored near the world (0.9), lit by ember cracks, from the horizon down */
  { const w = wallStrip(), off = R(cx * 0.9) % 256, oy = R(hz + 40 - cy * 0.6); for (let y = oy; y < VH; y += 150) for (let x = -off; x < VW; x += 256) g.drawImage(w, x, y); }
  /* ash and sparks rising off the lake */
  for (let i = 0; i < 28; i++) { const sp = 6 + (i % 5) * 3, x = ((i * 97 + time * (3 + i % 4)) % (VW + 20)) - 10, y = VH - ((time * sp + i * 41) % VH); g.fillStyle = i % 3 ? '#ff9a3a' : '#5a4a48'; g.globalAlpha = i % 3 ? 0.7 : 0.5; g.fillRect(R(x), R(y), 1, 1); }
  g.globalAlpha = 1;
}
