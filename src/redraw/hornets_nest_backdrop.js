// hornets_nest_backdrop.js - THE HORNET'S NEST's OWN BACKDROP (claude/hornetsnestart; SONNET over the greybox). ART ONLY: nothing here reads or changes a hitbox or a number.
// Outside, the shared round-canopy forest is gone: this is a PINE wood (a golden-green sky under a dense canopy, far pines in haze, mid trunks, drifting pollen and needles) and over
// the first screens THE ANCIENT PINE itself stands behind the foot of the climb - a trunk as wide as a house, its root-flare in the roots you climb, the nest hung off it.
// Inside (cols 80-332) is the nest: the back wall is wasp paper in scalloped shells (parchment at THE PAPER GATE, ochre in THE COMB STAIR, red-brown at THE BROOD CELLS), with great
// comb curtains hanging in it and honey-lit pools of light; THE BROOD HALL has its own ribbed vault and the royal cell. By the falling nest and the great pine it is the wood again,
// warmer toward the evening, the nest pine's trunk rising and the torn nest hanging over.
//   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full)   sky, far + mid pines, the ancient pine, the nest's inner wall and its lights, the hall's vault
//   drawNear(g, cx, cy, VW, VH, L, time, dY)             near boughs, drifting pollen and needles outside; floating wax motes, dripping honey and the odd hornet inside
//   drawAmbientHornets - the far hornets that cross the wall (a speck on a loop)
// Every static picture is baked ONCE; a frame is a few dozen drawImage calls.
import { canvas, mulberry } from '../px.js';
import { PAPER, COMB, BARK, NEEDLE } from './hornets_nest_tiles.js';

const TS = 16, memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
/* the big baked pictures are drawn every frame: a CPU-side bake canvas has to be uploaded to the graphics card each time it is drawn (a 576 x 320 vault cost ~12 ms a frame headless), so each one is copied ONCE onto a GPU canvas */
const gpu = c => { const [o, g] = canvas(c.width, c.height, true); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0); return o; };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h ^ (h >>> 16); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const hx = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
const rgbOf = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => { const A = rgbOf(a), B = rgbOf(b); return '#' + hx(A[0] + (B[0] - A[0]) * t) + hx(A[1] + (B[1] - A[1]) * t) + hx(A[2] + (B[2] - A[2]) * t); };
export const NEST_X0 = 80, NEST_X1 = 332, HALL = { x0: 295, x1: 332, y0: 3, y1: 22 };
/* the sky by place: [top, mid, low] over the pines. foot = a green-gold morning; fall = the nest tearing loose (warmer); pine = the late gold under the great pine */
const SKY = { foot: ['#6f9a62', '#b5cf8a', '#e8e2a0'], fall: ['#7f9a58', '#d2c47c', '#f0d890'], pine: ['#7a8f46', '#d8b860', '#f2c878'] };
const skyAt = tx => { if (tx < 200) return SKY.foot; if (tx < 340) return SKY.foot; if (tx < 354) return SKY.fall; return SKY.pine; };
const WALL = [['#251712', '#34221a', '#46301f', '#573d28'], ['#281509', '#38200f', '#4a2e16', '#5c3c1e'], ['#2c0e0a', '#421810', '#582416', '#6e301c']];

/* ------------------------------------------------------------------ baked pieces ------------------------------------------------------------------ */
/* a conifer: stacked drooping boughs (tiers) on a trunk; lit left, dark right */
function conifer(g, x, base, h, w, T, r) {
  const tiers = Math.max(4, Math.round(h / 14)); R(g, T[2], x - 1, base - h * 0.2, 3, h * 0.2);
  for (let i = 0; i < tiers; i++) { const t = i / (tiers - 1), y = base - h * 0.12 - t * h * 0.88, hw = Math.max(2, (1 - t * 0.85) * w / 2 + (r() * 2 | 0)), th = Math.max(4, h / tiers * 1.5);
    for (let row = 0; row < th; row++) { const k = row / th, ww = hw * (0.25 + 0.75 * k) + (r() < 0.3 ? 1 : 0), yy = y - th + row + 4; R(g, T[1], x - ww, yy, ww * 2, 1); R(g, T[0], x - ww, yy, Math.max(1, ww * 0.5), 1); R(g, T[2], x + ww * 0.45, yy, ww * 0.55, 1); } }
  R(g, T[0], x - 1, base - h - 3, 2, 5);
}
function farStrip(ti) { return once('far' + ti, () => { const [c, g] = canvas(768, 230), r = mulberry(31 + ti), T = ti ? ['#7f9c7a', '#6a8a68', '#587858'] : ['#8aa882', '#759872', '#628462'];
  for (let i = 0; i < 17; i++) { const x = 20 + i * 45 + (r() * 24 | 0), h = 90 + (r() * 110 | 0); conifer(g, x, 230, h, 24 + (r() * 14 | 0), T, r); } return gpu(c); }); }
/* the mid trunks: pines whose crowns are far above - a column of bark, a few bare limbs, a tuft of needles at the top of the frame */
function midStrip(ti) { return once('mid' + ti, () => { const [c, g] = canvas(768, 360), r = mulberry(77 + ti), T = ti ? [BARK[1], BARK[3], BARK[4], BARK[2]] : [BARK[1], BARK[2], BARK[3], BARK[2]];
  for (let i = 0; i < 5; i++) { const x = 40 + i * 150 + (r() * 60 | 0), w = 12 + (r() * 12 | 0);
    for (let y = 0; y < 360; y++) { const flare = y > 330 ? (y - 330) * 0.35 : 0, ww = w + flare;
      for (let xx = -ww; xx < ww; xx++) { const u = xx / ww, s = u < -0.55 ? 3 : u < -0.1 ? 2 : u < 0.5 ? 1 : 0, cr = (hash(Math.floor((x + xx) / 3), y >> 3) % 6) === 0;
        R(g, mix(T[Math.min(3, Math.max(0, 3 - s))], '#7a9a70', 0.28), x + xx, y, 1, 1); if (cr) R(g, mix(T[0], '#7a9a70', 0.28), x + xx, y, 1, 3); } }
    for (let k = 0; k < 3; k++) { const ly = 40 + (r() * 250 | 0), d = r() < 0.5 ? -1 : 1, len = 18 + (r() * 24 | 0); for (let q = 0; q < len; q++) R(g, mix(T[0], '#7a9a70', 0.28), x + d * (w + q), ly - q * 0.35, 1, 3);
      for (let q = 0; q < 26; q++) { const nx = x + d * (w + len * (0.45 + 0.55 * r())), ny = ly - len * 0.35 + (r() - 0.4) * 8; R(g, mix(NEEDLE[1 + (r() * 3 | 0)], '#7a9a70', 0.3), nx + (r() - 0.5) * 16, ny + r() * 6, 2, 1); } } }
  return gpu(c); }); }
/* THE ANCIENT PINE: one trunk, 176 x 1152 (rows 0..71): plated bark, deep furrows, resin, a root-flare at the foot, stubs of limbs. Lit from the left. */
function ancientPine() { return once('ancient', () => { const PAD = 130, TW = 176, W = TW + PAD * 2, H = 1152, [c, g] = canvas(W, H), r = mulberry(4091), cxm = W / 2;
  /* the great boughs first (behind the trunk): limbs with drooping needle-skirts, both sides, down the upper trunk */
  for (let i = 0; i < 9; i++) { const d = i % 2 ? 1 : -1, y0 = 60 + i * 66 + (r() * 30 | 0), len = 70 + (r() * 56 | 0);
    for (let q = 0; q < len; q++) { const nx = cxm + d * (60 + q), ny = y0 - q * 0.12 + (q * q) / (len * 9); R(g, BARK[1], nx, ny, 1, 6 - q * 0.05); R(g, BARK[3], nx, ny, 1, 1);
      if (q > 14 && q % 2 === 0) for (let s = 0; s < 5; s++) { const hh = 6 + ((q * 7 + s * 5) % 9); R(g, NEEDLE[(q + s) % 3], nx + s - 2, ny + 4, 1, hh); R(g, NEEDLE[2 + (q + s) % 2], nx + s - 2, ny + 4, 1, 2); } } }
  for (let y = 0; y < H; y++) { const flare = y > H - 150 ? Math.pow((y - (H - 150)) / 150, 1.8) * 46 : 0, hw = 68 + flare + Math.sin(y / 90) * 2.5;
    for (let xx = Math.floor(-hw); xx < hw; xx++) { const u = xx / hw, x = Math.round(cxm + xx), plate = Math.floor((xx + 200) / 9), cut = (y + hash(plate, 5) % 40) % 40;
      let s = u < -0.7 ? 4 : u < -0.3 ? 3 : u < 0.2 ? 2 : u < 0.62 ? 1 : 0;
      const col = (xx + 200) % 9; if (col === 0) s = Math.max(0, s - 2); else if (col === 1 && s < 4) s++; if (cut === 0) s = Math.max(0, s - 2); else if (cut === 1) s = Math.min(5, s + 1);
      if (hash(x, y) % 9 === 0) s = Math.max(0, s - 1); else if (hash(x, y) % 13 === 0) s = Math.min(5, s + 1);
      R(g, mix(BARK[Math.max(0, Math.min(5, s + 1))], '#6a8a5e', y < 520 ? 0.12 : 0.04), x, y, 1, 1); } }
  for (let i = 0; i < 22; i++) { const x = cxm + (r() - 0.5) * 110, y = 60 + r() * (H - 300); R(g, '#e8b24a', x, y, 2, 3); R(g, '#fff0a0', x, y, 1, 1); }   /* resin beads */
  return gpu(c); }); }
/* a hanging comb CURTAIN for the nest's back wall: a tapering mass of hex cells hung from the ceiling, dark with an amber lit left edge and a dripping tip */
function curtain(seed, zi) { return once('curt' + seed + '_' + zi, () => { const r = mulberry(seed * 13 + zi), w = 40 + (r() * 36 | 0), h = 150 + (r() * 130 | 0), [c, g] = canvas(w, h), P = PAPER[zi];
  const hex = (u, v) => { const row = Math.floor(v / 5), cu = (((u + (row & 1) * 4) % 8) + 8) % 8, cv = v % 5; if (cv === 0) return cu >= 1 && cu <= 6 ? 1 : 0; if (cu === 0 || cu === 7) return 1; return cv === 1 && cu < 4 ? 3 : 2; };
  for (let y = 0; y < h; y++) { const t = y / h, ww = w * (0.5 + 0.5 * Math.pow(1 - t, 0.6)) / 2 + Math.sin(y / 9 + seed) * 2, x0 = Math.round(w / 2 - ww), x1 = Math.round(w / 2 + ww);
    for (let x = x0; x < x1; x++) { const k = hex(x, y); const lit = (x - x0) < 3 ? 1 : 0, edge = x1 - x < 3;
      R(g, k === 1 ? '#1a0e06' : k === 3 ? COMB[2] : lit ? COMB[2] : edge ? '#3a2410' : mix('#3a2410', COMB[1], 0.3 + (hash(x, y) % 4) * 0.06), x, y, 1, 1); }
    if (y > h - 18 && y < h - 2) { /* the drips */ } }
  for (let k = 0; k < 3; k++) { const dx = Math.round(w * (0.3 + 0.2 * k)); R(g, COMB[3], dx, h - 14 + k * 3, 1, 12 - k * 3); R(g, COMB[4], dx, h - 3 - k * 2, 1, 2); }
  void P; return gpu(c); }); }
/* a soft round glow for the honey lights */
function glow(r0, col) { return once('glow' + r0 + col, () => { const [c, g] = canvas(r0 * 2, r0 * 2), gr = g.createRadialGradient(r0, r0, 0, r0, r0, r0), [R_, G_, B_] = rgbOf(col);
  gr.addColorStop(0, `rgba(${R_},${G_},${B_},0.55)`); gr.addColorStop(0.5, `rgba(${R_},${G_},${B_},0.2)`); gr.addColorStop(1, `rgba(${R_},${G_},${B_},0)`); g.fillStyle = gr; g.fillRect(0, 0, r0 * 2, r0 * 2); return gpu(c); }); }
/* the nest's back wall: wasp paper in broad scalloped shells, dark, hex comb showing through in patches; 192 x 192, tiles */
function wallTile(zi) { return once('wall' + zi, () => { const S = 192, [c, g] = canvas(S, S), W = WALL[zi], P = PAPER[zi], img = g.getImageData(0, 0, S, S), d = img.data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const band = 14, k = Math.floor(y / band), rr = y % band, off = Math.round(2.2 * Math.sin((x + k * 29) * 2 * Math.PI / 64 + k)), q = rr + off;
    let s = 1 + (hash(k, Math.floor(x / 24)) % 3 === 0 ? 1 : 0); if (q >= 12) s = 0; else if (q <= 1) s = 2; else if (hash(x, y) % 11 === 0) s = Math.max(0, s - 1);
    if (hash(x >> 1, y >> 1) % 21 === 0 && q > 1 && q < 12) s = Math.min(3, s + 1);
    const col = W[Math.min(3, s)], [r_, g_, b_] = rgbOf(col), i = (y * S + x) * 4; d[i] = r_; d[i + 1] = g_; d[i + 2] = b_; d[i + 3] = 255; }
  g.putImageData(img, 0, 0);
  /* torn paper: three patches of comb cells (honey-dim) */
  const r = mulberry(901 + zi); for (let n = 0; n < 4; n++) { const px0 = (r() * (S - 60) | 0) + 8, py0 = (r() * (S - 50) | 0) + 6, pw = 36 + (r() * 22 | 0), ph = 26 + (r() * 18 | 0);
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) { const ex = Math.min(x, pw - 1 - x), ey = Math.min(y, ph - 1 - y); if (ex < 2 + (hash(x, y) % 3) || ey < 2) continue; const row = Math.floor(y / 5), cu = (((x + (row & 1) * 4) % 8) + 8) % 8, cv = y % 5;
      const wall = cv === 0 ? cu >= 1 && cu <= 6 : cu === 0 || cu === 7; R(g, wall ? '#140a05' : mix(P[0], COMB[1], cv === 1 ? 0.55 : 0.32), px0 + x, py0 + y, 1, 1); } }
  return c; }); }
/* the hall's vault: ribs of paper arching from both walls to a crown, a royal cell high on the back wall. Baked for the hall's rect (36 x 20 tiles) */
function hallVault() { return once('hall', () => { const w = (HALL.x1 - HALL.x0 + 1) * TS, h = (HALL.y1 - HALL.y0 + 2) * TS, [c, g] = canvas(w, h), P = PAPER[2], r = mulberry(55);
  const hx0 = w / 2, rib = (cxr, yr, rx, ry, col, th) => { g.strokeStyle = col; g.lineWidth = th; g.beginPath(); g.ellipse(cxr, yr, rx, ry, 0, Math.PI, 2 * Math.PI); g.stroke(); };
  g.fillStyle = '#2a110c'; g.fillRect(0, 0, w, h);
  /* the wall: shells */
  for (let y = 0; y < h; y += 12) for (let x = 0; x < w; x += 2) { const off = Math.round(2 * Math.sin((x + y * 3) / 14)), q = y % 24; R(g, (y / 12 & 1) ? '#3a1812' : '#44201a', x, y + off, 2, 11); R(g, '#1a0a06', x, y + off + 10, 2, 2); void q; }
  for (let i = 0; i < 6; i++) rib(hx0, h * 0.92, hx0 * (1 - i * 0.16), h * (0.9 - i * 0.12), i % 2 ? '#5a2a1c' : '#7a3a26', 6 - i * 0.6);
  /* comb panels in the two walls */
  for (const sx of [0, w - 62]) for (let y = 40; y < h - 30; y += 5) for (let x = sx; x < sx + 62; x += 8) { const row = y / 5 | 0, ox = x + (row & 1) * 4; R(g, '#1a0a06', ox, y, 7, 1); R(g, mix('#2a110c', COMB[2], 0.35 + (hash(ox, y) % 5) * 0.05), ox + 1, y + 1, 6, 4); }
  /* THE ROYAL CELL: a great hex dome, glowing, in the crown of the vault */
  const rx = hx0, ry = h * 0.2; for (let a = 0; a < 6; a++) { const a0 = a * Math.PI / 3 - Math.PI / 6, a1 = (a + 1) * Math.PI / 3 - Math.PI / 6; g.fillStyle = a % 2 ? COMB[2] : COMB[3]; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx + Math.cos(a0) * 34, ry + Math.sin(a0) * 34); g.lineTo(rx + Math.cos(a1) * 34, ry + Math.sin(a1) * 34); g.closePath(); g.fill(); }
  g.strokeStyle = '#2a1408'; g.lineWidth = 3; g.beginPath(); for (let a = 0; a <= 6; a++) { const aa = a * Math.PI / 3 - Math.PI / 6; g.lineTo(rx + Math.cos(aa) * 34, ry + Math.sin(aa) * 34); } g.stroke();
  g.fillStyle = '#ffe9a0'; g.beginPath(); g.arc(rx, ry, 7, 0, 7); g.fill(); void P; void r; return gpu(c); }); }

/* ------------------------------------------------------------------ the frame ------------------------------------------------------------------ */
const LIGHTS = [];   /* [world x, world y, radius, colour index] - the honey lights of the wall, laid by hash over the nest's width */
for (let i = 0; i < 40; i++) LIGHTS.push([NEST_X0 * TS + 60 + i * 100 + (hash(i, 5) % 50), 40 + (hash(i, 9) % 560), 70 + 20 * (hash(i, 3) % 3), hash(i, 7) % 3]);   /* (three radii only: each is a baked glow) */
/* WARM: every picture baked at the level's load (a first draw in play, mid-fight, was a hitch) */
export function warm() { ancientPine(); farStrip(0); midStrip(0); midStrip(1); for (let z = 0; z < 3; z++) { wallTile(z); for (let i = 0; i < 5; i++) curtain(i, z); } hallVault(); for (const r of [70, 90, 110]) for (const c of ['#ffc860', '#ffb040', '#ff8a3a']) glow(r, c); for (const c of ['#fff0a0']) glow(150, c); glow(130, '#ff9a3a'); glow(70, '#ffc860'); }
const zoneOfCol = tx => tx < 169 ? 0 : tx < 248 ? 1 : 2;
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  cx = Math.round(cx); cy = Math.round(cy);
  const tx = Math.floor((cx + VW / 2) / TS), sk = skyAt(tx);
  /* the SKY: a dense canopy above (green) to the warm light low; deeper green the higher the camera climbs */
  { const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, sk[0]); gr.addColorStop(0.5, sk[1]); gr.addColorStop(1, sk[2]); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
  { const k = Math.max(0, Math.min(1, 1 - (cy + VH) / (46 * TS))); if (k > 0) { g.fillStyle = `rgba(30,50,20,${(0.5 * k).toFixed(3)})`; g.fillRect(0, 0, VW, VH); } }
  /* a low sun glow, east */
  { const gl = glow(150, '#fff0a0'); g.globalAlpha = 0.5; g.drawImage(gl, Math.round(VW * 0.74 - cx * 0.02 - 150), Math.round(30 + dY * 0.08 - 150 + 60)); g.globalAlpha = 1; }
  const outsideL = cx < (NEST_X0 + 4) * TS, outsideR = cx + VW > (NEST_X1 + 1) * TS - 4 * TS;
  if (outsideL || outsideR) {
    /* far pines in haze (0.12), mid trunks (0.32) */
    if (full !== false) { const fs = farStrip(0), x = -(Math.round(cx * 0.12) % 768); for (let X = x; X < VW; X += 768) g.drawImage(fs, X, Math.round(VH - 230 + dY * 0.05)); }
    g.fillStyle = 'rgba(200,226,190,0.18)'; g.fillRect(0, 0, VW, VH);
    { const ms = midStrip(tx > 340 ? 1 : 0), x = -(Math.round(cx * 0.32) % 768); g.globalAlpha = 0.9; for (let X = x; X < VW; X += 768) g.drawImage(ms, X, Math.round(VH - 360 + dY * 0.18)); g.globalAlpha = 1; }
    /* THE ANCIENT PINE: world-anchored behind the foot (cols 68-79 and its flare); the nest hangs off its right side */
    { const ap = ancientPine(), x = 71 * TS - 218 - cx, y = 72 * TS - 1152 - cy; if (x < VW && x + 436 > 0) g.drawImage(ap, x, y); }
    /* the light through the canopy: slow shafts (screen-anchored, two) */
    for (let i = 0; i < 3; i++) { const sx = ((i * 233 + 60 - cx * 0.06) % (VW + 200) + VW + 200) % (VW + 200) - 100, a = 0.07 + 0.03 * Math.sin(time * 0.4 + i * 2); g.globalAlpha = a; g.fillStyle = '#fff4b0'; g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx + 34, 0); g.lineTo(sx - 46, VH); g.lineTo(sx - 120, VH); g.closePath(); g.fill(); g.globalAlpha = 1; }
  }
  /* THE NEST'S INNER WALL: world columns 80..332 */
  const sx0 = NEST_X0 * TS - cx, sx1 = (NEST_X1 + 1) * TS - cx;
  if (sx1 > 0 && sx0 < VW) {
    g.save(); g.beginPath(); g.rect(Math.max(0, sx0), 0, Math.min(VW, sx1) - Math.max(0, sx0), VH); g.clip();
    const k = 0.78, z = zoneOfCol(tx), wallAt = zz => { const pat = once('wpat' + zz, () => g.createPattern(gpu(wallTile(zz)), 'repeat')); pat.setTransform(new DOMMatrix().translate(-Math.round(cx * k), -Math.round(cy * k))); return pat; };
    g.fillStyle = wallAt(z); g.fillRect(0, 0, VW, VH);
    for (const e of [169, 248]) { const d = (tx - e) / 14; if (d > -1 && d < 1) { const al = d < 0 ? 0.5 + 0.5 * d : 0.5 - 0.5 * d; if (al > 0.01) { g.globalAlpha = al; g.fillStyle = wallAt(d < 0 ? zoneOfCol(e - 1) : zoneOfCol(e)); g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; } } }
    /* the combs hanging in the wall (parallax 0.62), dim */
    { const kk = 0.62, per = 210, i0 = Math.floor((cx * kk - 120) / per) - 1, i1 = Math.floor((cx * kk + VW) / per) + 1;
      for (let i = i0; i <= i1; i++) { const h = hash(i, 17); if (h % 4 === 0) continue; const sp = curtain(h % 5, z), wx = i * per + (h % 70) - Math.round(cx * kk), wy = -10 - Math.round(cy * kk) + (h % 5) * 40; if (wy + 300 < 0 || wy > VH) continue; g.globalAlpha = 0.9; g.drawImage(sp, wx, wy); } g.globalAlpha = 1; }
    /* shade the back wall a step so the footing reads in front of it; deeper rows (the roots) darker */
    g.fillStyle = 'rgba(8,4,2,0.24)'; g.fillRect(0, 0, VW, VH);
    /* the HONEY LIGHTS: warm pools on the wall, breathing */
    if (!(globalThis.__hnDbg && globalThis.__hnDbg.lights)) { g.globalCompositeOperation = 'source-over'; for (const [lx, ly, lr, ci] of LIGHTS) { const x = lx - Math.round(cx * 0.9), y = ly - Math.round(cy * 0.9); if (x < -lr || x > VW + lr || y < -lr || y > VH + lr) continue;
      g.globalAlpha = (ci === 2 ? 0.3 : 0.22) * (0.8 + 0.2 * Math.sin(time * (0.7 + ci * 0.25) + lx)); g.drawImage(glow(lr, ci === 0 ? '#ffc860' : ci === 1 ? '#ffb040' : '#ff8a3a'), x - lr, y - lr); }
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
    /* THE BROOD HALL: the vault and the royal cell, world-anchored */
    if (!(globalThis.__hnDbg && globalThis.__hnDbg.vault)) { const hx0 = HALL.x0 * TS - cx, hy0 = (HALL.y0 - 1) * TS - cy; if (hx0 < VW && hx0 + 36 * TS > 0) { if (!(globalThis.__hnDbg && globalThis.__hnDbg.vimg)) g.drawImage(hallVault(), hx0, hy0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.5 + 0.12 * Math.sin(time * 1.3); if (!(globalThis.__hnDbg && globalThis.__hnDbg.vglow)) g.drawImage(glow(130, '#ff9a3a'), hx0 + 18 * TS - 130, hy0 + 4 * TS - 100); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; } }
    g.restore();
    /* the nest's mouth, seen from outside, is lit: a honey glow at the doorway (cols 82-90, rows 50-53) */
    { const mx = 86 * TS - cx, my = 52 * TS - cy; if (mx > -100 && mx < VW + 100) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 0.5; g.drawImage(glow(70, '#ffc860'), mx - 70, my - 70); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; } }
  }
}
/* ------------------------------------------------------------------ the near layer ------------------------------------------------------------------ */
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  cx = Math.round(cx); cy = Math.round(cy);
  const inside = cx + VW / 2 > NEST_X0 * TS && cx + VW / 2 < (NEST_X1 + 1) * TS;
  /* floating motes: pollen outside (green-gold), wax flecks and ember-gold inside; a handful, drifting up */
  for (let i = 0; i < 26; i++) { const sp = 6 + (i % 5) * 3, x = ((i * 97 + time * (inside ? 4 : 9) * (i % 2 ? 1 : -0.6) - cx * (0.25 + (i % 4) * 0.12)) % (VW + 40) + VW + 40) % (VW + 40) - 20,
    y = ((i * 53 - time * sp - cy * (0.2 + (i % 3) * 0.1) + dY * 0) % (VH + 20) + VH + 20) % (VH + 20) - 10;
    g.globalAlpha = 0.5 + 0.4 * Math.sin(time * 1.7 + i); g.fillStyle = inside ? (i % 3 ? '#ffd36b' : '#f0e0b0') : (i % 3 ? '#fff4b0' : '#cfe8a0'); g.fillRect(Math.round(x), Math.round(y), i % 5 ? 1 : 2, 1); }
  g.globalAlpha = 1;
  if (inside) {
    /* far hornets crossing the wall: dark specks with a flicker of wing, on a long loop */
    for (let i = 0; i < 5; i++) { const per = 14 + i * 3.7, t = ((time + i * 5.3) % per) / per, x = Math.round(-30 + t * (VW + 60)), y = Math.round(60 + ((i * 71) % 170) + Math.sin(time * 2 + i * 3) * 8 + Math.sin(t * 9 + i) * 14);
      g.globalAlpha = 0.5; g.fillStyle = '#1a0e06'; g.fillRect(x, y, 3, 2); g.fillStyle = '#e8b030'; g.fillRect(x + 1, y, 1, 1); g.fillStyle = '#e8eef4'; if (Math.floor(time * 24 + i) & 1) g.fillRect(x, y - 1, 2, 1); g.globalAlpha = 1; }
    /* an edge vignette: the nest is close and warm */
    const gr = g.createRadialGradient(VW / 2, VH / 2, VH * 0.55, VW / 2, VH / 2, VH * 1.05); gr.addColorStop(0, 'rgba(10,4,0,0)'); gr.addColorStop(1, 'rgba(10,4,0,0.32)'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  } else {
    /* near boughs in the top corners: needles, a limb, tilted by the wind */
    const sway = Math.sin(time * 0.6) * 2; for (const d of [-1, 1]) { const bx = d < 0 ? -10 : VW + 10, by = 0 + sway * d;
      for (let q = 0; q < 96; q++) { const nx = bx - d * q * 1.5, ny = by + q * 0.28 + Math.sin(q / 7) * 2.5, th = 5 - q * 0.04; R(g, BARK[0], nx, ny - 1, 2, th + 2); R(g, BARK[2], nx, ny, 2, th); R(g, BARK[4], nx, ny, 2, 1);
        if (q % 3 === 0 && q > 6) for (let s = 0; s < 5; s++) { const len = 6 + ((q * 7 + s * 3) % 7); R(g, NEEDLE[(q + s) % 3], nx + (s - 2) * 2, ny + th, 1, len); R(g, NEEDLE[3], nx + (s - 2) * 2, ny + th, 1, 2); } } }
  }
}
