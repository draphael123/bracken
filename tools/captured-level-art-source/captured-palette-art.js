// Original ART function/primitive declarations, now under explicit captured C. No original ART.C write.
import { canvas, px, rect, line, circle, ellipse, fillPoly, fromGrid, outline, mulberry, shade, rgb, hex } from './px.js';
export const CAPTURED_PALETTE_FIELDS=Object.freeze(["dirt","dirtD","dirtL","stone","stoneL","stoneD","wood","woodD","woodL","grassD","grass","berry","gold","grassL","canopy"]);
export function createCapturedPaletteArt(C){
const OUT = '#1b1626';
const T = 16;
function dirtBase(g, rnd, w = T, h = T) {
  rect(g, 0, 0, w, h, C.dirt);
  for (let i = 0; i < w * h / 6; i++) {
    const x = (rnd() * w) | 0, y = (rnd() * h) | 0;
    px(g, x, y, rnd() < 0.5 ? C.dirtD : C.dirtL);
  }
  for (let i = 0; i < 2; i++) if (rnd() < 0.5) { const x = (rnd() * (w - 3)) | 0, y = (rnd() * (h - 2)) | 0; rect(g, x, y, 3, 2, C.stone); px(g, x, y, C.stoneL); px(g, x + 2, y + 1, C.stoneD); }
}
function bakeDirt(seed) { const rnd = mulberry(seed); const [c, g] = canvas(T, T); dirtBase(g, rnd); return c; }
function bakeDirtRoots(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T); dirtBase(g, rnd);
  const n = 1 + ((rnd() * 2) | 0);
  for (let i = 0; i < n; i++) {
    let x = 2 + ((rnd() * 12) | 0), y = 0; const dir = rnd() < 0.5 ? -1 : 1;
    for (let k = 0; k < 10 + ((rnd() * 5) | 0) && y < T; k++) { px(g, x, y, C.woodD); if (k < 4) px(g, x + 1, y, C.wood); if (rnd() < 0.4) x += dir; if (x < 0 || x > 15) break; y++; }
  }
  if (rnd() < 0.4) { const x = (rnd() * 12) | 0, y = 8 + ((rnd() * 6) | 0); rect(g, x, y, 3, 2, C.stone); px(g, x, y, C.stoneL); }
  return c;
}
function bakeLog(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  const bark = shade(C.wood, -0.18), barkD = shade(C.woodD, -0.15), lit = shade(C.woodL, 0.1);
  rect(g, 0, 0, T, 1, barkD);                                   /* the top edge, in shadow against the sky */
  rect(g, 0, 1, T, 2, lit);                                     /* and the band of light just under it */
  rect(g, 0, 3, T, 4, bark);
  rect(g, 0, 7, T, 2, barkD);                                   /* the underside turning away */
  for (let i = 0; i < 5; i++) { const x = (rnd() * T) | 0, y = 2 + ((rnd() * 5) | 0), h = 1 + ((rnd() * 3) | 0);
    rect(g, x, y, 1, h, rnd() < 0.5 ? C.woodD : shade(C.wood, 0.12)); }      /* the splits in the bark */
  if (rnd() < 0.55) { const kx = 2 + ((rnd() * 11) | 0);         /* a knot where a branch came off */
    ellipse(g, kx + 1, 4, 2, 2, C.woodD); ellipse(g, kx + 1, 4, 1, 1, shade(C.woodD, -0.3)); px(g, kx, 3, lit); }
  for (let x = 0; x < T; x++) if (rnd() < 0.34) { px(g, x, 1, C.grassD); if (rnd() < 0.5) px(g, x, 0, C.grass); }
  for (let i = 0; i < 2; i++) if (rnd() < 0.4) { const x = (rnd() * (T - 2)) | 0;   /* lichen on the upper side */
    px(g, x, 2, '#8a9a72'); px(g, x + 1, 2, '#6f8059'); }
  return c;
}
function bakeLogEnd(seed, right) {
  const c = bakeLog(seed); const g = c.getContext('2d');
  const rnd = mulberry(seed * 7 + 3);
  // THE CUT FACE IS THE WHOLE POINT. Sawn end grain is PALE - much paler than the bark around it - and that
  // contrast is what makes a brown bar read as a log at all. Rings out from the heart, a rim of bark, and
  // the crack that opened as it dried.
  const RIM = '#4a2f18', SAP = '#e0c191', RING = '#a87a49', HEART = '#c9a173', CORE = '#8a6034';
  const cx = right ? T - 3.5 : 2.5, cy = 4.5;
  for (let x = right ? T - 7 : 0; x < (right ? T : 7); x++) for (let y = 0; y < 10; y++) {
    const dx = (x - cx) * 0.86, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
    if (d > 4.5) continue;
    px(g, x, y, d > 3.7 ? RIM : d > 3.0 ? SAP : d > 2.3 ? RING : d > 1.5 ? HEART : d > 0.8 ? RING : CORE);
  }
  { const dir = right ? 1 : -1;                                         /* the drying crack, out of the heart */
    for (let k = 1; k <= 3; k++) px(g, Math.round(cx) + dir * k, Math.round(cy) - (k > 1 ? 1 : 0), RIM); }
  if (rnd() < 0.5) px(g, Math.round(cx), Math.round(cy) + 2, RIM);
  px(g, Math.round(cx) - 1, Math.round(cy) - 1, '#f2e0bc');             /* the light on the upper side of it */
  return c;
}
function bakeThorns(seed) { // a bed of bramble, and thorns standing up out of it: pale, sharp and outlined - the one thing in the wood that says NOT HERE
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  for (let i = 0; i < 4; i++) { const x0 = (rnd() * T) | 0, y0 = 10 + ((rnd() * 4) | 0), x1 = (rnd() * T) | 0, y1 = 12 + ((rnd() * 3) | 0); line(g, x0, y0, x1, y1, '#4a2a24', 2); }
  rect(g, 0, 13, T, 3, '#4a2a24'); rect(g, 0, 13, T, 1, '#6a3a2a');
  for (const bx of [2, 6, 10, 14]) { const x = Math.min(14, bx + ((rnd() * 2) | 0) - 1), h = 6 + ((rnd() * 4) | 0), top = 13 - h;
    for (let r = top; r < 13; r++) { const w = 1 + Math.min(2, Math.floor((r - top) / 3)), x0 = x - (w >> 1); rect(g, x0 - 1, r, w + 2, 1, '#1b1210'); rect(g, x0, r, w, 1, r - top < 2 ? '#fff6e0' : '#d8ccb0'); }
    px(g, x, top - 1, '#1b1210'); px(g, x, top, '#ff6b6b'); }
  if (rnd() < 0.5) { const x = (rnd() * 14) | 0; rect(g, x, 11, 2, 2, C.berry); }
  return c;
}
function bakeCrate() {
  const [c, g] = canvas(T, T);
  rect(g, 1, 1, 14, 14, C.wood);
  for (let y = 4; y < 15; y += 4) rect(g, 1, y, 14, 1, C.woodD);
  rect(g, 1, 1, 14, 1, C.woodL); rect(g, 1, 1, 1, 14, C.woodL);
  line(g, 2, 2, 13, 13, C.woodD, 1); line(g, 13, 2, 2, 13, C.woodD, 1);
  px(g, 2, 2, C.stoneD); px(g, 13, 2, C.stoneD); px(g, 2, 13, C.stoneD); px(g, 13, 13, C.stoneD);
  return outline(c, OUT);
}
function bakeShrine(lit) {
  const [c, g] = canvas(20, 34);
  rect(g, 3, 28, 14, 5, C.stone); rect(g, 3, 28, 14, 1, C.stoneL); rect(g, 3, 32, 14, 1, C.stoneD);
  rect(g, 7, 14, 6, 14, C.stone); rect(g, 7, 14, 1, 14, C.stoneL); rect(g, 12, 14, 1, 14, C.stoneD);
  rect(g, 4, 6, 12, 8, C.stoneD); rect(g, 6, 7, 8, 6, lit ? C.gold : '#2a2f3d');
  if (lit) { rect(g, 8, 8, 4, 4, '#fff1c0'); }
  rect(g, 2, 4, 16, 2, C.stone); rect(g, 4, 2, 12, 2, C.stone); rect(g, 7, 0, 6, 2, C.stoneL);
  px(g, 5, 15, C.grassD); px(g, 6, 20, C.grass); px(g, 13, 17, C.grassD);
  return outline(c, OUT);
}
function bakeStocks() {
  const [c, g] = canvas(24, 20);
  rect(g, 1, 4, 3, 16, C.wood); rect(g, 20, 4, 3, 16, C.wood);
  rect(g, 1, 4, 3, 1, C.woodL); rect(g, 20, 4, 3, 1, C.woodL);
  rect(g, 0, 8, 24, 4, C.wood); rect(g, 0, 8, 24, 1, C.woodL); rect(g, 0, 11, 24, 1, C.woodD);
  for (const x of [6, 11, 16]) { rect(g, x, 8, 3, 4, '#1b1626'); rect(g, x, 9, 3, 2, '#0d0b16'); }
  rect(g, 0, 18, 24, 2, '#5a5a52');
  return outline(c, OUT);
}
function bakeLychgate() {
  const [c, g] = canvas(34, 30);
  rect(g, 2, 8, 4, 22, C.wood); rect(g, 28, 8, 4, 22, C.wood);
  rect(g, 2, 8, 4, 1, C.woodL); rect(g, 28, 8, 4, 1, C.woodL);
  rect(g, 0, 6, 34, 3, '#5a4a3a');
  for (let k = 0; k <= 8; k++) rect(g, k * 2, 6 - k, 34 - k * 4, 2, k % 2 ? '#8a7250' : '#6f5c40');   // the little roof
  rect(g, 6, 18, 22, 2, C.woodD); rect(g, 6, 24, 22, 2, C.woodD);
  for (let x = 8; x < 28; x += 5) rect(g, x, 18, 2, 8, C.wood);
  return outline(c, OUT);
}
function bakeGate() {
  const [c, g] = canvas(48, 52);
  const pillar = x => { rect(g, x, 12, 10, 40, C.stone); rect(g, x, 12, 2, 40, C.stoneL); rect(g, x + 8, 12, 2, 40, C.stoneD); for (let y = 16; y < 52; y += 6) rect(g, x + 2, y, 6, 1, C.stoneD); };
  pillar(2); pillar(36);
  for (let x = 0; x < 48; x++) { const t = (x - 24) / 24; const y = 12 - Math.round(10 * Math.sqrt(Math.max(0, 1 - t * t))); rect(g, x, y, 1, 14 - (y - 2), C.stone); if (x % 5 === 0) px(g, x, y + 3, C.stoneD); }
  rect(g, 0, 10, 48, 1, C.stoneL);
  for (let i = 0; i < 40; i++) { const x = (i * 37) % 48, y = 4 + (i * 13) % 20; px(g, x, y, i & 1 ? C.grass : C.grassD); }
  for (let i = 0; i < 10; i++) { const x = 4 + (i * 11) % 40; line(g, x, 14, x + (i & 1 ? 1 : -1), 22 + (i * 7) % 12, C.grassD, 1); }
  rect(g, 20, 20, 8, 6, C.gold); rect(g, 22, 22, 4, 2, '#fff1c0');
  return outline(c, OUT);
}
function bakeSign() {
  const [c, g] = canvas(18, 18);
  rect(g, 8, 8, 2, 10, C.woodD);
  rect(g, 1, 1, 16, 8, C.wood); rect(g, 1, 1, 16, 1, C.woodL); rect(g, 1, 8, 16, 1, C.woodD);
  rect(g, 3, 3, 8, 1, C.woodD); rect(g, 3, 5, 11, 1, C.woodD);
  return outline(c, OUT);
}
function bakeTuft(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(8, 6);
  for (let i = 0; i < 4; i++) { const x = 1 + i * 2; const h = 2 + ((rnd() * 3) | 0); line(g, x, 5, x + (rnd() < 0.5 ? -1 : 1), 5 - h, rnd() < 0.5 ? C.grass : C.grassL, 1); }
  return c;
}
function bakeFlower(seed) {
  const rnd = mulberry(seed); const col = ['#f4d35e', '#e8788a', '#fbf6ea', '#9ec7ff'][(rnd() * 4) | 0];
  const [c, g] = canvas(5, 7); line(g, 2, 6, 2, 2, C.grassD, 1); px(g, 1, 4, C.grass);
  rect(g, 1, 1, 3, 3, col); px(g, 2, 2, '#e0a45f'); px(g, 0, 2, col); px(g, 4, 2, col); px(g, 2, 0, col);
  return c;
}
function bakeMushroom(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(7, 7);
  const cap = rnd() < 0.5 ? C.berry : '#d9a55b';
  rect(g, 2, 3, 3, 4, '#f0e6c8'); rect(g, 0, 1, 7, 3, cap); rect(g, 1, 0, 5, 1, cap); px(g, 2, 1, '#fff1c0'); px(g, 5, 2, '#fff1c0');
  return outline(c, OUT);
}
function bakeBush(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(26, 16);
  ellipse(g, 13, 10, 12, 6, C.grassD); ellipse(g, 9, 8, 7, 6, C.grass); ellipse(g, 17, 7, 7, 6, C.grass);
  ellipse(g, 12, 5, 6, 4, C.grassL, C.grass);
  for (let i = 0; i < 5; i++) if (rnd() < 0.6) px(g, 4 + ((rnd() * 18) | 0), 4 + ((rnd() * 8) | 0), C.berry);
  return outline(c, OUT);
}
function bakeRaft() {
  const [c, g] = canvas(48, 8);
  rect(g, 0, 1, 48, 6, C.wood); rect(g, 0, 1, 48, 1, C.woodL); rect(g, 0, 6, 48, 1, C.woodD);
  for (let x = 6; x < 48; x += 6) rect(g, x, 1, 1, 6, C.woodD);
  for (const x of [8, 24, 40]) { rect(g, x - 1, 0, 3, 8, '#b8a888'); rect(g, x, 0, 1, 8, '#8a7a5a'); }
  return outline(c, OUT);
}
function bakePlank() {
  const [c, g] = canvas(140, 30);
  rect(g, 2, 2, 136, 26, C.wood); rect(g, 2, 2, 136, 2, C.woodL); rect(g, 2, 26, 136, 2, C.woodD); rect(g, 2, 2, 2, 26, C.woodL); rect(g, 136, 2, 2, 26, C.woodD);
  for (let i = 0; i < 9; i++) rect(g, 8 + i * 15, 6 + (i % 3) * 5, 6 + (i % 4) * 3, 1, C.woodD);
  for (const x of [8, 130]) { rect(g, x, 8, 2, 2, C.stoneD); rect(g, x, 20, 2, 2, C.stoneD); }
  return outline(c, OUT);
}
function bakePalisade(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  for (let i = 0; i < 4; i++) { const x = i * 4; rect(g, x, 0, 4, T, C.wood); rect(g, x, 0, 1, T, C.woodL); rect(g, x + 3, 0, 1, T, C.woodD); if (rnd() < 0.5) px(g, x + 1 + ((rnd() * 2) | 0), (rnd() * T) | 0, C.woodD); }
  rect(g, 0, 5, T, 1, '#b8a888'); rect(g, 0, 11, T, 1, '#b8a888');
  return c;
}
function bakePalisadeTop() { const [c, g] = canvas(T, 6); for (let i = 0; i < 4; i++) fillPoly(g, [[i * 4, 6], [i * 4 + 2, 0], [i * 4 + 4, 6]], C.woodL); return c; }
function bakeBridgePlank(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 2, T, 4, C.wood); rect(g, 0, 2, T, 1, C.woodL); rect(g, 0, 5, T, 1, C.woodD); rect(g, 7, 2, 1, 4, C.woodD);
  rect(g, 0, 0, T, 1, '#b8a888'); if (rnd() < 0.5) px(g, (rnd() * T) | 0, 3, C.woodD);
  return c;
}
function bakeBridgePlankEnd(seed, dir) {
  const rnd = mulberry(seed); const [c, g] = canvas(T, T);
  rect(g, 0, 2, T, 4, C.wood); rect(g, 0, 2, T, 1, C.woodL); rect(g, 0, 5, T, 1, C.woodD);
  rect(g, 0, 0, T, 1, '#b8a888'); if (rnd() < 0.5) px(g, 4 + ((rnd() * 7) | 0), 3, C.woodD);
  const e = dir > 0 ? T - 2 : 0;                                   // the sawn end of the run
  rect(g, e, 1, 2, 6, C.woodD); rect(g, e + (dir > 0 ? 0 : 1), 1, 1, 6, '#3a2414');
  px(g, dir > 0 ? T - 4 : 3, 3, '#5a4a3a'); px(g, dir > 0 ? T - 4 : 3, 4, '#2a1e12');   // the bolt through it
  rect(g, dir > 0 ? T - 5 : 2, 6, 3, 3, C.woodD);                  // and the bracket it rests on
  return c;
}
function bakeTowerTop() {
  const [c, g] = canvas(32, 18);
  fillPoly(g, [[16, 0], [31, 8], [1, 8]], '#5c3a1d'); fillPoly(g, [[16, 1], [28, 7], [4, 7]], '#8a5a32');
  rect(g, 4, 8, 2, 8, C.wood); rect(g, 26, 8, 2, 8, C.wood); rect(g, 0, 16, 32, 2, C.wood); rect(g, 0, 16, 32, 1, C.woodL);
  return outline(c, OUT);
}
function bakeTreehouse(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(40, 30);
  rect(g, 4, 10, 32, 16, C.wood); rect(g, 4, 10, 32, 1, C.woodL); rect(g, 4, 25, 32, 1, C.woodD);
  fillPoly(g, [[20, 0], [39, 11], [1, 11]], '#5c3a1d'); fillPoly(g, [[20, 2], [35, 10], [5, 10]], '#6b4a2a');
  rect(g, 10, 15, 6, 6, '#ffd36b'); rect(g, 24, 15, 6, 6, rnd() < 0.5 ? '#ffd36b' : '#2a2f3d'); rect(g, 12, 17, 2, 2, '#fff1c0');
  for (let i = 0; i < 3; i++) rect(g, 6 + i * 12, 26, 2, 4, C.woodD);
  return outline(c, OUT);
}
function bakeTorch() { const [c, g] = canvas(6, 14); rect(g, 2, 4, 2, 10, C.woodD); rect(g, 1, 2, 4, 3, '#b8a888'); rect(g, 1, 0, 4, 2, '#ffd36b'); px(g, 2, 0, '#fff1c0'); return outline(c, OUT); }
function bakeBarrel() { const [c, g] = canvas(12, 14); rect(g, 1, 1, 10, 12, C.wood); rect(g, 1, 1, 2, 12, C.woodL); rect(g, 9, 1, 2, 12, C.woodD); rect(g, 0, 3, 12, 1, '#8b8378'); rect(g, 0, 10, 12, 1, '#8b8378'); rect(g, 4, 5, 4, 4, '#1b1626'); px(g, 6, 5, '#c9463d'); return outline(c, OUT); }
function bakeCrank() { const [c, g] = canvas(12, 14); rect(g, 4, 6, 4, 8, C.woodD); rect(g, 2, 2, 8, 5, '#8b8378'); rect(g, 2, 2, 8, 1, '#b3aca0'); line(g, 6, 4, 11, 0, '#5f5a52', 2); px(g, 11, 0, '#ffd36b'); return outline(c, OUT); }
function bakeLift() { const [c, g] = canvas(32, 8); rect(g, 0, 2, 32, 5, C.wood); rect(g, 0, 2, 32, 1, C.woodL); rect(g, 0, 6, 32, 1, C.woodD); for (let x = 8; x < 32; x += 8) rect(g, x, 2, 1, 5, C.woodD); rect(g, 15, 0, 2, 2, '#b8a888'); return outline(c, OUT); }
function bakeFern(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(14, 10);
  for (let i = 0; i < 5; i++) { const a = -1.9 + i * 0.5, L = 6 + rnd() * 3; const x1 = 7 + Math.cos(a) * L, y1 = 9 + Math.sin(a) * L; line(g, 7, 9, x1, y1, C.grassD, 1); for (let k = 2; k < L; k += 2) { const bx = 7 + Math.cos(a) * k, by = 9 + Math.sin(a) * k; px(g, Math.round(bx - 1), Math.round(by), C.grass); px(g, Math.round(bx + 1), Math.round(by), C.grassL); } }
  return c;
}
function bakeRock(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(12, 7);
  const w = 6 + ((rnd() * 5) | 0), h = 3 + ((rnd() * 3) | 0);
  ellipse(g, 6, 6 - h / 2, w / 2, h / 2, '#7c8797', '#5a6270'); ellipse(g, 5, 5 - h / 2, w / 4, h / 4, '#9aa3b0');
  if (rnd() < 0.6) px(g, 4 + ((rnd() * 4) | 0), 6, C.grass);
  return outline(c, OUT);
}
function bakeOldOak(seed) {
  const rnd = mulberry(seed); const [c, g] = canvas(72, 80);
  // trunk with a hollow
  rect(g, 26, 30, 20, 50, '#5c3a1d'); rect(g, 26, 30, 4, 50, '#7a4e28'); rect(g, 42, 30, 4, 50, '#3d2712');
  fillPoly(g, [[26, 80], [18, 80], [26, 62]], '#5c3a1d'); fillPoly(g, [[46, 80], [54, 80], [46, 60]], '#5c3a1d'); fillPoly(g, [[18, 80], [10, 80], [22, 70]], '#3d2712');
  ellipse(g, 36, 62, 6, 9, '#1b1626'); ellipse(g, 36, 60, 4, 6, '#0e0a14');
  for (let i = 0; i < 30; i++) rect(g, 28 + ((rnd() * 16) | 0), 32 + ((rnd() * 46) | 0), 1, 2 + ((rnd() * 3) | 0), rnd() < 0.5 ? '#7a4e28' : '#3d2712');
  // limbs and canopy lobes
  line(g, 30, 34, 10, 16, '#5c3a1d', 3); line(g, 42, 32, 60, 12, '#5c3a1d', 3); line(g, 36, 30, 36, 10, '#5c3a1d', 3);
  const lobes = [[14, 16, 15], [36, 10, 17], [58, 14, 14], [26, 22, 13], [48, 20, 13]];
  for (const [x, y, r] of lobes) ellipse(g, x, y, r, r * 0.75, C.canopy ? C.canopy[1] : '#2a5e46');
  for (const [x, y, r] of lobes) ellipse(g, x - r * 0.25, y - r * 0.3, r * 0.55, r * 0.35, C.canopy ? C.canopy[2] : '#3a7a55');
  for (let i = 0; i < 14; i++) px(g, 4 + ((rnd() * 64) | 0), 4 + ((rnd() * 24) | 0), C.canopy ? C.canopy[3] : '#4f9a68');
  return outline(c, OUT);
}
function bakeFallenLog(seed) { const rnd = mulberry(seed); const [c, g] = canvas(30, 10); rect(g, 0, 2, 28, 7, C.wood); rect(g, 0, 2, 28, 1, C.woodL); rect(g, 0, 7, 28, 2, C.woodD); fillPoly(g, [[27, 2], [30, 4], [29, 7], [27, 9]], C.woodD); for (let i = 0; i < 6; i++) rect(g, 2 + ((rnd() * 22) | 0), 3 + ((rnd() * 4) | 0), 3, 1, C.woodD); for (let i = 0; i < 4; i++) px(g, 1 + ((rnd() * 24) | 0), 1 + ((rnd() * 2) | 0), '#5aa33e'); rect(g, 3, 0, 4, 2, '#2f5e3a'); return outline(c, OUT); }
function bakeFence(seed) { const rnd = mulberry(seed); const [c, g] = canvas(32, 12); for (const x of [1, 15, 29]) { rect(g, x, 0, 2, 12, C.wood); px(g, x, 0, C.woodL); } rect(g, 0, 3, 32, 2, C.woodL); rect(g, 0, 7, 32, 2, C.wood); for (let i = 0; i < 3; i++) px(g, (rnd() * 32) | 0, 3 + ((rnd() * 6) | 0), C.woodD); return outline(c, OUT); }
function bakeCart(seed) { const rnd = mulberry(seed); const [c, g] = canvas(24, 16); rect(g, 2, 4, 18, 7, C.wood); rect(g, 2, 4, 18, 1, C.woodL); rect(g, 19, 8, 5, 1, C.woodD); for (let i = 0; i < 5; i++) ellipse(g, 5 + i * 3, 3 - ((rnd() * 2) | 0), 2, 2, rnd() < 0.5 ? '#c9b27c' : '#8a5a32'); circle(g, 7, 12, 3, '#3a2618', '#5c3a1d'); circle(g, 16, 12, 3, '#3a2618', '#5c3a1d'); px(g, 7, 12, C.woodL); px(g, 16, 12, C.woodL); return outline(c, OUT); }
function bakeWell() { const [c, g] = canvas(20, 24); rect(g, 3, 14, 14, 10, '#6a707c'); for (let y = 14; y < 24; y += 3) for (let x = 3; x < 17; x += 5) rect(g, x + ((y / 3) % 2 ? 2 : 0), y, 4, 2, '#7c8797'); rect(g, 5, 16, 10, 3, '#1b1626'); rect(g, 2, 4, 2, 12, C.wood); rect(g, 16, 4, 2, 12, C.wood); fillPoly(g, [[0, 6], [10, 0], [20, 6]], C.woodD); fillPoly(g, [[2, 6], [10, 2], [18, 6]], C.wood); rect(g, 9, 6, 2, 8, '#5a6270'); rect(g, 8, 10, 4, 3, '#8a5a32'); return outline(c, OUT); }
function bakeCounter() { const [c, g] = canvas(48, 18); rect(g, 2, 6, 44, 12, C.wood); rect(g, 2, 6, 44, 1, C.woodL); for (let x = 6; x < 46; x += 8) rect(g, x, 9, 1, 8, C.woodD); rect(g, 0, 4, 48, 3, C.woodL); rect(g, 0, 6, 48, 1, C.woodD); rect(g, 8, 1, 10, 3, '#e8dcc0'); rect(g, 8, 1, 10, 1, '#c9b27c'); for (const x of [30, 34, 38]) { rect(g, x, 2, 3, 2, '#e0b040'); px(g, x, 2, '#fff6c8'); } return outline(c, OUT); }
function bakeWares(v) { const [c, g] = canvas(32, 30); rect(g, 0, 0, 32, 30, '#3a2618'); for (const y of [8, 18, 28]) { rect(g, 0, y, 32, 2, C.wood); rect(g, 0, y, 32, 1, C.woodL); }
  if (v === 0) { rect(g, 3, 3, 3, 5, '#4aa0b0'); rect(g, 8, 2, 3, 6, '#c9463d'); rect(g, 13, 4, 3, 4, '#8fd160'); rect(g, 20, 1, 8, 7, '#c9d1dc'); rect(g, 21, 4, 6, 2, '#1b1626'); rect(g, 2, 12, 6, 6, '#c9b27c'); rect(g, 12, 11, 5, 7, '#8a5a32'); ellipse(g, 24, 14, 5, 4, '#c9463d', '#8f2f28'); px(g, 24, 13, '#e0b040'); rect(g, 4, 22, 8, 6, '#b8a888'); rect(g, 18, 21, 4, 7, '#7c8797'); rect(g, 25, 23, 5, 5, '#e0b040'); }
  else { rect(g, 2, 2, 8, 6, '#8a5a32'); rect(g, 14, 1, 3, 7, '#e0b040'); rect(g, 20, 3, 4, 5, '#9a5aa8'); rect(g, 27, 2, 3, 6, '#4aa0b0'); rect(g, 3, 11, 10, 7, '#5a6270'); rect(g, 4, 12, 8, 1, '#9aa3b0'); rect(g, 18, 12, 5, 6, '#c9b27c'); rect(g, 26, 10, 4, 8, '#3f6e2c'); rect(g, 2, 22, 5, 6, '#c9463d'); rect(g, 10, 21, 8, 7, '#b8a888'); rect(g, 22, 23, 8, 5, '#8a5a32'); }
  return outline(c, OUT); }
function bakeShopDoor() { const [c, g] = canvas(20, 30); rect(g, 0, 0, 20, 30, '#3a2618'); rect(g, 2, 6, 16, 24, C.wood); for (let y = 8; y < 30; y += 5) rect(g, 2, y, 16, 1, C.woodD); rect(g, 9, 6, 2, 24, C.woodD); ellipse(g, 10, 4, 7, 3, '#ffd36b', '#b8842a'); px(g, 14, 18, '#e0b040'); return outline(c, OUT); }
function bakeLanternPost() { const [c, g] = canvas(8, 28); rect(g, 3, 6, 2, 22, C.wood); rect(g, 1, 4, 6, 3, C.woodD); rect(g, 2, 7, 4, 6, '#ffd36b'); rect(g, 3, 8, 2, 3, '#fff6c8'); rect(g, 1, 13, 6, 1, C.woodD); rect(g, 3, 0, 2, 4, C.woodD); return outline(c, OUT); }
function bakeBeehive() { const [c, g] = canvas(12, 14); rect(g, 1, 12, 10, 2, C.woodD); ellipse(g, 6, 7, 5.5, 6, '#e0b040', '#b8842a'); for (let y = 3; y < 12; y += 2) rect(g, 2, y, 8, 1, '#b8842a'); rect(g, 5, 9, 2, 2, '#3a2618'); px(g, 9, 2, '#1b1626'); px(g, 2, 5, '#1b1626'); return outline(c, OUT); }
function bakeBirdhouse() { const [c, g] = canvas(10, 22); rect(g, 4, 10, 2, 12, C.wood); fillPoly(g, [[0, 4], [5, 0], [10, 4]], '#8f2f28'); rect(g, 1, 4, 8, 7, C.wood); rect(g, 1, 4, 8, 1, C.woodL); circle(g, 5, 7, 1.5, '#1b1626'); rect(g, 3, 10, 4, 1, C.woodD); px(g, 8, 9, '#4aa0b0'); px(g, 9, 9, '#4aa0b0'); px(g, 8, 8, '#4aa0b0'); return outline(c, OUT); }
function bakeSpearRack() { const [c, g] = canvas(18, 18); rect(g, 1, 14, 16, 2, C.woodD); rect(g, 1, 8, 16, 1, C.wood); for (let i = 0; i < 4; i++) { const x = 3 + i * 4; rect(g, x, 3, 1, 13, '#8a5a32'); rect(g, x - 1, 0, 3, 4, '#c9d1dc'); px(g, x, 0, '#fff6e0'); } return outline(c, OUT); }
function bakeBarrelStack() { const [c, g] = canvas(26, 20); const b = (x, y) => { rect(g, x, y, 10, 10, C.wood); rect(g, x, y + 2, 10, 1, '#5a6270'); rect(g, x, y + 7, 10, 1, '#5a6270'); rect(g, x + 4, y, 1, 10, C.woodD); rect(g, x, y, 1, 10, C.woodL); }; b(2, 10); b(14, 10); b(8, 0); return outline(c, OUT); }
function bakeCoffer() { const [c, g] = canvas(14, 11); rect(g, 2, 4, 10, 5, C.wood); rect(g, 2, 2, 10, 3, C.woodL); rect(g, 2, 4, 10, 1, C.woodD); rect(g, 6, 2, 2, 7, '#7c8797'); px(g, 6, 5, '#e0b040'); px(g, 7, 5, '#e0b040'); return outline(c); }
function bakeCabin() { const [c, g] = canvas(44, 32); rect(g, 4, 14, 36, 18, C.wood); for (let y = 15; y < 32; y += 4) rect(g, 4, y, 36, 1, C.woodD); rect(g, 4, 14, 36, 1, C.woodL); fillPoly(g, [[0, 15], [22, 0], [44, 15]], '#5c3a1d'); fillPoly(g, [[3, 14], [22, 2], [41, 14]], '#7a4e28', '#5c3a1d'); rect(g, 30, 5, 5, 8, '#6a707c'); rect(g, 30, 4, 5, 1, '#8b8378'); rect(g, 19, 20, 7, 12, '#2a1a10'); rect(g, 20, 21, 5, 11, '#3a2618'); px(g, 24, 26, '#e0b040'); rect(g, 8, 18, 6, 6, '#ffd36b'); rect(g, 10, 18, 1, 6, C.woodD); rect(g, 8, 20, 6, 1, C.woodD); return c; }
function bakeCatapult(f) { const [c, g] = canvas(36, 28); rect(g, 3, 20, 30, 4, C.wood); rect(g, 3, 20, 30, 1, C.woodL); circle(g, 8, 24, 3.5, '#5f5a52'); circle(g, 28, 24, 3.5, '#5f5a52'); px(g, 8, 24, '#8b8378'); px(g, 28, 24, '#8b8378');
  if (f < 2) { fillPoly(g, [[12, 20], [17, 6], [19, 6], [24, 20]], '#7a4e28', '#5c3a1d'); rect(g, 15, 9, 6, 2, '#5f5a52');
    if (f === 0) { line(g, 24, 19, 6, 5, '#8a5a32', 2); rect(g, 3, 2, 6, 4, '#8b8378'); rect(g, 4, 3, 4, 2, '#5f5a52'); ellipse(g, 6, 1, 3, 1.5, C.wood, C.woodD); }
    else { line(g, 14, 19, 33, 3, '#8a5a32', 2); rect(g, 29, 0, 6, 4, '#8b8378'); rect(g, 30, 1, 4, 2, '#5f5a52'); } }
  else { fillPoly(g, [[12, 20], [15, 12], [17, 12], [20, 20]], '#7a4e28', '#5c3a1d'); line(g, 4, 18, 32, 14, '#8a5a32', 2); rect(g, 22, 12, 5, 4, '#8b8378'); px(g, 10, 17, '#c9b27c'); px(g, 26, 11, '#c9b27c'); px(g, 30, 19, '#c9b27c'); }
  return outline(c); }
function bakeChainPost() { const [c, g] = canvas(12, 28); rect(g, 4, 2, 4, 26, C.woodD); rect(g, 4, 2, 1, 26, C.wood); rect(g, 2, 0, 8, 3, '#5f5a52'); circle(g, 6, 8, 2.5, '#7c8797'); for (let i = 0; i < 5; i++) { rect(g, 8 + (i % 2), 10 + i * 3, 2, 2, '#8b8378'); } return outline(c); }
function bakeCottage(shut) { const [c, g] = canvas(36, 32); rect(g, 3, 14, 30, 18, '#8a8478'); for (let y = 15; y < 32; y += 4) for (let x = 3 + ((y / 4) | 0) % 2 * 3; x < 33; x += 6) rect(g, x, y, 4, 3, '#7a7468'); rect(g, 3, 14, 30, 1, '#a09a8c'); fillPoly(g, [[0, 15], [18, 0], [36, 15]], '#3a3a48'); fillPoly(g, [[3, 14], [18, 3], [33, 14]], '#4a4a5a', '#3a3a48'); rect(g, 25, 4, 5, 9, '#5a5448'); rect(g, 25, 3, 5, 1, '#8b8378'); if (shut) { rect(g, 15, 20, 7, 12, C.wood); rect(g, 15, 20, 1, 12, C.woodL); px(g, 20, 26, '#e0b040'); } else { rect(g, 15, 20, 7, 12, '#1e1a22'); rect(g, 16, 21, 5, 11, '#2c2630'); } rect(g, 6, 18, 6, 6, '#ffd36b'); rect(g, 8, 18, 1, 6, '#5a5448'); rect(g, 6, 20, 6, 1, '#5a5448'); return c; }
function bakeCrownLantern(lit) { const [c, g] = canvas(12, 36); rect(g, 5, 8, 2, 28, C.woodD); rect(g, 5, 8, 1, 28, C.wood); rect(g, 2, 34, 8, 2, C.woodD); rect(g, 3, 0, 6, 2, '#5f5a52'); rect(g, 2, 2, 8, 8, lit ? '#ffd36b' : '#3a3444'); rect(g, 3, 3, 6, 6, lit ? '#fff6c8' : '#2a2630'); rect(g, 2, 10, 8, 1, '#5f5a52'); return outline(c); }
return Object.freeze({bakeDirt,bakeLog,bakeLogEnd,bakeThorns,bakeCrate,bakeDirtRoots,bakePalisade,bakePalisadeTop,bakeBridgePlank,bakeBridgePlankEnd,bakeShrine,bakeGate,bakeSign,bakeTuft,bakeFlower,bakeMushroom,bakeBush,bakeRaft,bakePlank,bakeFern,bakeRock,bakeOldOak,bakeStocks,bakeLychgate,bakeCounter,bakeWares,bakeShopDoor,bakeLanternPost,bakeBeehive,bakeBirdhouse,bakeSpearRack,bakeBarrelStack,bakeFallenLog,bakeFence,bakeCart,bakeWell,bakeCoffer,bakeCabin,bakeCatapult,bakeChainPost,bakeCrownLantern,bakeCottage,bakeTowerTop,bakeTreehouse,bakeTorch,bakeBarrel,bakeCrank,bakeLift});
}
