// pirate_fleet_back.js - THE PIRATE FLEET's BACKDROP LAYERS (claude/pfart, 2026-11-05): sky, far fleet, mid ships, near hulls, foreground rigging. Open sea at the turn of the day under a STORM FRONT:
// a gold slit of sun under a bruise-purple wall of cloud, the sea gone teal-black with the light laid on it in a broken road. NOT the Flotilla's noon glare (flot_tiles.js) nor the reef's grey-green
// storm (reef_tiles.js): this is the Freebooter's own weather, and it darkens as you sail into it (the level's tints do the rest).
//   SKY    a 1xVH column (stepped, 16-bit): indigo -> plum -> rust -> amber -> gold at the horizon           bakeSky(VH)
//   FAR    640x150, horizon row 70: the cloud wall with its lit lower edge, rain curtains, the gold slit and the sun's road, the FLEET hull-down in silhouette, one three-master with a red pennant
//   MID    640x160, waterline row 110: four ships at sail and at anchor in dark silhouette, rim-lit on their sun side, lanterns lit, one PRIZE BURNING; swell lines and lantern reflections below
//   NEAR   640x300: two great hulls looming (a stern gallery with lit windows, a bowsprit and jib), spars and rigging crossing, nets and a cannon muzzle - dark, drawn at 0.55
//   FG     640xVH: hanging ropes with blocks, torn canvas rags and a spar end - the strip that crosses the frame in front at 0.3
// LIFE (drawn each frame, not baked): flags, lantern flicker, the burning prize's flames and smoke, gulls, a far lightning flicker in the cloud wall as the level darkens.
// drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) / drawNear(...) are called from src/main.js's backdrop chain when L.pfKit; layers bake once, lazily.
import { canvas, mulberry } from '../px.js';
const R = Math.round;
const memo = {};
const once = (k, fn) => memo[k] || (memo[k] = fn());
const px = (g, x, y, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const wrapper = w => x => ((Math.round(x) % w) + w) % w;
const line = (g, w, x0, y0, x1, y1, c) => { const wr = wrapper(w), n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) px(g, wr(x0 + (x1 - x0) * i / n), R(y0 + (y1 - y0) * i / n), c); };

/* the one palette: every colour of the backdrop is in here (tools/pf-art-lint.mjs checks it) */
export const BP = {
  skyStops: [[0, [14, 18, 40]], [0.22, [30, 28, 62]], [0.42, [72, 46, 82]], [0.58, [140, 66, 80]], [0.7, [214, 104, 70]], [0.8, [255, 166, 88]], [0.9, [255, 204, 128]], [1, [255, 188, 108]]],
  cloud: ['#0c0e1e', '#161a30', '#242a44', '#3a3858', '#58486a', '#8a5a72'],        /* the wall, dark to its lit lower lip */
  rim: ['#c25a46', '#e88a58', '#ffb870'],                                           /* sun on an edge */
  sea: ['#061822', '#0a2a36', '#103e4c', '#1a5666', '#2c7482'],
  glow: ['#ffe9b0', '#ffc878', '#ff9a50'],
  sil: ['#0a0810', '#140e1c', '#201626', '#322236'],                                 /* ship silhouettes, near to far (far = lighter, hazed) */
  nsil: ['#262a40', '#303650', '#3c4262', '#4c5272'], nsail: ['#343a56', '#40466a', '#4c5278', '#5c6086'], nrim: ['#8a6272', '#b8806e'], nlamp: '#d8b070',   /* the NEAR hulls: hazed toward the sea and the storm light so they sit behind the play space, not on it (claude/pffix) */
  sail: ['#1c1426', '#2e2036', '#4a3040', '#6e4850'],
  lamp: '#ffd36b', fire: ['#ff4a1a', '#ff8a2a', '#ffc84a', '#fff0a0'], smoke: '#2a2024', red: '#8a1e22', rain: '#3a4468', gull: '#1a1218',
};
const lerpC = (a, b, k) => 'rgb(' + R(a[0] + (b[0] - a[0]) * k) + ',' + R(a[1] + (b[1] - a[1]) * k) + ',' + R(a[2] + (b[2] - a[2]) * k) + ')';

export function bakeSky(h) {
  const [c, g] = canvas(1, h), st = BP.skyStops;
  for (let y = 0; y < h; y++) { const q = Math.round((y / Math.max(1, h - 1)) * 15) / 15; let i = 0; while (i < st.length - 2 && q > st[i + 1][0]) i++;
    const [t0, a] = st[i], [t1, b] = st[i + 1]; px(g, 0, y, lerpC(a, b, Math.min(1, Math.max(0, (q - t0) / (t1 - t0))))); }
  return c;
}

/* a ship in silhouette: hull polygon with a sheer, masts, square sails (course / topsail / topgallant), a bowsprit and jib; rim = the sun's side lit; life gets the flag and lantern spots */
function ship(g, w, x, base, s, o = {}) {
  const wr = wrapper(w), col = o.col || BP.sil[1], sail = o.sail || BP.sail[1], hl = o.hl || BP.sil[3], L = o.len || R(46 * s), H = R(7 * s), masts = o.masts || 2, rim = o.rim !== false, life = o.life;
  for (let i = 0; i < L; i++) { const u = i / L, sheer = R((u < 0.12 ? (0.12 - u) * 28 : u > 0.88 ? (u - 0.88) * 22 : 0) * s * 0.5), top = base - H + sheer - (u > 0.8 ? R(2 * s) : 0);
    for (let y = top; y < base + 1 - R((u < 0.1 || u > 0.92 ? 2 : 0) * s * 0.6); y++) px(g, wr(x + i), y, y === top ? hl : col); }
  for (let i = 0; i < L; i += 5) { if (o.lit) px(g, wr(x + 4 + i), base - R(H * 0.5), BP.lamp); }                     /* gunports lit from within */
  for (let m = 0; m < masts; m++) { const mx = x + R(L * (masts === 1 ? 0.45 : 0.22 + m * (0.56 / (masts - 1)))), mh = R((o.mh || 40) * s * (m === masts - 1 && masts > 2 ? 0.8 : 1)), top = base - H - mh, sw = R((o.sw || 20) * s);
    rect(g, wr(mx), top, 1, mh + H, col);
    for (let k = 0; k < 3; k++) { const sy = top + R(mh * (0.05 + k * 0.3)), sh = R(mh * (k === 0 ? 0.26 : 0.28)), sk = sw * (1 - k * 0.22), x0 = R(mx - sk / 2);
      for (let j = 0; j < sh; j++) { const bow = R(Math.sin(j / sh * Math.PI) * 1.6 * s); for (let i = 0; i < R(sk) + bow; i++) px(g, wr(x0 + i), sy + j, rim && i < 2 ? BP.rim[(j + k) % 3 === 0 ? 2 : 1] : j % 5 === 4 ? BP.sail[2] : sail); }
      rect(g, wr(x0 - 1), sy - 1, 1, 1, col); line(g, w, x0 - 1, sy - 1, R(x0 + sk), sy - 1, col); }                    /* the yard */
    if (life && m === 0) life.flags.push([mx, top - 1, (o.red ? 1 : 0)]);
  }
  line(g, w, x + L - 2, base - H - 1, x + L + R(10 * s), base - H - R(5 * s), col);                                    /* the bowsprit */
  for (let j = 0; j < R(9 * s); j++) for (let i = 0; i < j; i++) px(g, wr(x + L + R(10 * s) - R(j * 1.2) - i * 0 + R(i * 0.4)), base - H - R(5 * s) + j, rim && i === 0 ? BP.rim[0] : sail);   /* the jib */
  line(g, w, x + 2, base - H - R((o.mh || 40) * s * 0.5), x + 1, base - H, col);                                         /* a stay aft */
}
const SUN_X = 470;

export function bakeFar() {
  return once('far', () => {
    const w = 640, h = 150, H0 = 70, rnd = mulberry(8101), wr = wrapper(w), [c, g] = canvas(w, h), life = { gulls: [], flash: [] };
    /* THE SEA from the horizon: five stepped bands, a lighter dash as it comes at us, the sun's broken road */
    const bands = [[0, 0.1, 3], [0.1, 0.3, 2], [0.3, 0.6, 1], [0.6, 1, 0]];
    for (let y = H0; y < h; y++) { const k = (y - H0) / (h - H0), b = k < 0.08 ? 4 : k < 0.28 ? 3 : k < 0.55 ? 2 : k < 0.8 ? 1 : 0; rect(g, 0, y, w, 1, BP.sea[b]); }
    for (let y = H0 + 2; y < h; y++) { const r = y - H0, n = R(w / (6 + r * 0.3)); for (let i = 0; i < n; i++) { const x = (rnd() * w) | 0, len = 1 + ((r / 9) | 0); for (let k = 0; k < len; k++) px(g, wr(x + k), y, r < 12 ? BP.sea[4] : BP.sea[3]); } }
    for (let y = H0 + 1; y < h; y++) { const t = (y - H0) / (h - H0), spread = 5 + t * 40, n = R(2 + t * 8); for (let i = 0; i < n; i++) { const x = wr(SUN_X + (rnd() - 0.5) * spread * 2), len = 1 + ((t * 4) | 0); for (let k = 0; k < len; k++) px(g, wr(x + k), y, rnd() < 0.5 ? BP.glow[1] : rnd() < 0.5 ? BP.glow[0] : BP.glow[2]); } }
    /* THE GOLD SLIT between sea and cloud: the sun's last band, warm to the horizon line */
    for (let y = H0 - 7; y < H0; y++) for (let x = 0; x < w; x++) { const dx = Math.abs(x - SUN_X) / 280, a = Math.max(0, 1 - dx) * (0.25 + (y - (H0 - 7)) / 9); if (a > 0.15 && ((x + y) & 1 || a > 0.7)) px(g, x, y, a > 0.8 ? BP.glow[0] : a > 0.5 ? BP.glow[1] : BP.glow[2]); }
    /* THE CLOUD WALL: dark banks stacked from y 4 to 56, ragged lower lip lit by the slit (lit more near the sun), rain curtains hanging off it */
    for (let x = 0; x < w; x++) { const lip = 50 + Math.round(Math.sin(x * 0.037) * 4 + Math.sin(x * 0.11) * 2 + Math.sin(x * 0.0081 + 1) * 6) - (rnd() < 0.2 ? 1 : 0), near = Math.max(0, 1 - Math.abs(x - SUN_X) / 260);
      for (let y = 4; y <= lip; y++) { const d = lip - y; let b = d > 40 ? 0 : d > 26 ? 1 : d > 14 ? 2 : d > 6 ? 3 : d > 2 ? 4 : 5; if (b === 5 && near < 0.2) b = 4; px(g, x, y, BP.cloud[b]); }
      if (near > 0.1) { px(g, x, lip, near > 0.6 ? BP.rim[2] : BP.rim[1]); if (near > 0.4) px(g, x, lip - 1, BP.rim[0]); } }
    for (let i = 0; i < 26; i++) { const x = (rnd() * w) | 0, len = 12 + ((rnd() * 18) | 0), sl = rnd() < 0.5 ? 1 : 0; if (Math.abs(x - SUN_X) < 60) continue; for (let k = 0; k < len; k++) if ((k + i) % 3) px(g, wr(x + R(k * 0.25 * (sl ? 1 : -1))), 50 + k, BP.rain); }   /* rain curtains */
    for (let i = 0; i < 4; i++) life.flash.push([(rnd() * w) | 0, 22 + ((rnd() * 18) | 0)]);
    /* THE FLEET, hull-down: far, small, dark violet, lit on the sun side, one big three-master with the red pennant */
    for (const [x, s, m] of [[20, 0.5, 2], [92, 0.42, 1], [150, 0.6, 2], [250, 0.5, 2], [330, 0.38, 1], [406, 0.55, 2], [548, 0.46, 2], [600, 0.4, 1]]) ship(g, w, x, H0 - 1, s, { col: BP.sil[3], sail: BP.sail[3], hl: BP.sil[3], masts: m, mh: 36, sw: 18, life: null });
    { const lf = { flags: [] }; ship(g, w, 188, H0 + 1, 0.95, { col: BP.sil[2], sail: BP.sail[2], hl: BP.sil[3], masts: 3, mh: 42, sw: 22, red: true, life: lf }); life.flags = lf.flags; }
    for (let i = 0; i < 7; i++) life.gulls.push([(rnd() * w) | 0, 14 + ((rnd() * 30) | 0), rnd() * 6.28]);
    for (let y = H0 - 1; y <= H0 + 1; y++) for (let x = 0; x < w; x++) if (rnd() < 0.25) px(g, x, y, rnd() < 0.5 ? BP.glow[1] : BP.sea[4]);      /* the shimmer closing over the hulls */
    c.life = life; return c; });
}
export function bakeMid() {
  return once('mid', () => {
    const w = 640, h = 160, W = 110, rnd = mulberry(8202), wr = wrapper(w), [c, g] = canvas(w, h), life = { flags: [], lamps: [], fires: [], smoke: [] };
    for (let y = W; y < h; y++) { const k = (y - W) / (h - W); rect(g, 0, y, w, 1, BP.sea[k < 0.08 ? 3 : k < 0.3 ? 2 : k < 0.65 ? 1 : 0]); }
    for (let y = W + 1; y < h; y++) { const r = y - W, n = R(w / (5 + r * 0.3)); for (let i = 0; i < n; i++) { const x = (rnd() * w) | 0, len = 2 + ((r / 6) | 0); for (let k = 0; k < len; k++) px(g, wr(x + k), y, r < 8 ? BP.sea[4] : BP.sea[3]); } }
    /* the ships: x, base row, scale, masts, lit ports, red pennant. The sun is far right: every sail's right edge is lit */
    const specs = [[34, W + 1, 1.4, 3, true, true], [190, W, 1.0, 2, false, false], [330, W + 2, 1.65, 3, true, false], [520, W, 1.1, 2, false, true]];
    for (const [x, b, s, m, lit, red] of specs) { ship(g, w, x, b, s, { col: BP.sil[0], sail: BP.sail[0], hl: BP.sil[2], masts: m, mh: 44, sw: 22, lit, red, rim: true, life });
      for (let i = 0; i < 4; i++) { const lx = x + R((8 + i * 11) * s); if (lit) life.lamps.push([lx, b - R(4 * s)]); }
      for (let i = 0; i < 14; i++) { const sx = x + 4 + R(rnd() * 40 * s); rect(g, wr(sx), b + 2 + ((rnd() * 8) | 0), 1 + ((rnd() * 3) | 0), 1, BP.glow[2]); } }     /* the lanterns' road on the water */
    /* THE PRIZE BURNING: a half-sunk hull, her mast a black stick, fire at her waist */
    { const x = 424, b = W + 3, L = 40; for (let i = 0; i < L; i++) { const top = b - 6 + (i < 8 ? (8 - i) : 0) - (i > 30 ? 3 : 0); for (let y = top; y <= b; y++) px(g, wr(x + i), y, y === top ? BP.sil[3] : BP.sil[0]); }
      rect(g, wr(x + 20), b - 36, 1, 30, BP.sil[0]); line(g, w, x + 20, b - 36, x + 12, b - 28, BP.sil[0]); line(g, w, x + 20, b - 30, x + 30, b - 22, BP.sil[0]);
      life.fires.push([x + 18, b - 8, 1.2], [x + 28, b - 6, 0.8], [x + 9, b - 5, 0.7]); }
    c.life = life; return c; });
}
export function bakeNear() {
  return once('near', () => {
    const w = 640, h = 300, rnd = mulberry(8303), wr = wrapper(w), [c, g] = canvas(w, h), life = { lamps: [], flags: [] };
    /* two hulls loom: x, width, top row. Dark, stern gallery windows lit, a quarter-badge, wales, chains; hung with rigging */
    for (const [x, W2, top, dir] of [[40, 130, 205, 1], [380, 150, 190, -1]]) {
      for (let i = 0; i < W2; i++) { const u = i / W2, sh = dir > 0 ? (u > 0.8 ? (u - 0.8) * 70 : 0) : (u < 0.2 ? (0.2 - u) * 70 : 0), tp = top + R(sh * 0.5);
        for (let y = tp; y < h; y++) px(g, wr(x + i), y, y === tp ? BP.nrim[0] : y < tp + 3 ? BP.nsil[3] : (y - tp) % 6 === 5 ? BP.nsil[0] : BP.nsil[1]); }
      const gx = dir > 0 ? x + W2 - 46 : x + 8;                                                                          /* the stern gallery */
      for (let k = 0; k < 4; k++) { rect(g, wr(gx + k * 10), top + 20, 7, 10, BP.nsil[0]); rect(g, wr(gx + k * 10 + 1), top + 21, 5, 8, k % 2 ? '#a07040' : BP.nlamp); rect(g, wr(gx + k * 10 + 3), top + 21, 1, 8, BP.nsil[0]); life.lamps.push([gx + k * 10 + 3, top + 25]); }
      for (let k = 0; k < 6; k++) { const px0 = x + 12 + k * 22; rect(g, wr(px0), top + 46, 8, 8, BP.nsil[0]); rect(g, wr(px0 + 1), top + 47, 6, 2, BP.nsil[2]); }   /* gunports */
      rect(g, wr(x), top + 34, W2, 2, BP.nrim[0]); rect(g, wr(x), top + 35, W2, 1, BP.nrim[1]);                              /* the wale takes the last light */
      for (let m = 0; m < 3; m++) { const mx = x + R(W2 * (0.15 + m * 0.34)); const mt = top - 105; rect(g, wr(mx), mt, 3, top - mt, BP.nsil[1]); rect(g, wr(mx), mt, 1, top - mt, BP.nsil[2]);                    /* the masts rise off the top */
        for (const yy of [mt + 24, mt + 66]) rect(g, wr(mx - 24), yy, 51, 2, BP.nsil[1]);                                           /* yards */
        for (let q = 0; q < 12; q++) line(g, w, mx, mt + 4, mx + (q - 6) * 5, top + 2, BP.nsil[2]); }
      if (dir > 0) { line(g, w, x + W2, top + 8, x + W2 + 60, top - 18, BP.nsil[2]); for (let j = 0; j < 26; j++) for (let i = 0; i < j; i++) px(g, wr(x + W2 + 58 - i * 2), top - 18 + j, i === 0 ? BP.nrim[0] : BP.nsail[0]); }   /* bowsprit + jib */
      else { for (let j = 0; j < 40; j++) for (let i = 0; i < 12 + ((j * 7) % 5); i++) px(g, wr(x + W2 + 2 + i), top + 6 + j, (i + j) % 9 === 0 ? BP.nsail[1] : BP.nsail[0]); }   /* a furled/torn sail hanging past her stern */
      for (let k = 0; k < 3; k++) { const nx = x + 30 + k * 40; for (let a = 0; a < 20; a += 4) { line(g, w, nx + a, top + 54, nx + a, top + 80 + ((a * 3) % 7), BP.nsil[2]); } for (let b = 0; b < 24; b += 6) line(g, w, nx, top + 56 + b, nx + 18, top + 56 + b, BP.nsil[2]); }   /* cargo net hung down the side */
    }
    c.life = life; return c; });
}
export function bakeFG(w, h, seed) {
  const rnd = mulberry(seed + 8404), wr = wrapper(w), [c, g] = canvas(w, h);
  const ropes = [30, 98, 171, 249, 330, 402, 481, 560, 612];
  for (const x of ropes) { const len = 40 + ((rnd() * 80) | 0), sway = (rnd() < 0.5 ? -1 : 1);
    for (let y = 0; y < len; y++) { const xx = x + R(Math.sin(y * 0.04 + x) * 1.5 * sway); px(g, wr(xx), y, (y + x) & 1 ? '#2a2018' : '#1a140e'); px(g, wr(xx + 1), y, '#0e0a08'); }
    const by = len; rect(g, wr(x - 2), by, 6, 7, '#1a1612'); rect(g, wr(x - 2), by, 6, 1, '#3a3028'); rect(g, wr(x), by + 2, 2, 2, '#0a0806');   /* a block (pulley) at the end */ }
  for (const x of [58, 270, 450, 590]) { const len = 18 + ((rnd() * 16) | 0);            /* torn canvas rags */
    for (let i = 0; i < 24; i++) { const l = len - ((i * 5 + x) % 9); for (let y = 0; y < l; y++) px(g, wr(x + i), y, y > l - 3 ? '#2e2036' : (i + y) % 6 === 0 ? '#3c2a44' : '#1c1426'); } }
  rect(g, 130, 0, 36, 6, '#1a140e'); rect(g, 130, 0, 36, 1, '#3a3028'); for (const x of [136, 154]) rect(g, x, 1, 2, 5, '#4a505c');                  /* a spar end with its iron bands */
  return c;
}

/* ---------- the frame: layers laid like the harbour's (far a little over the middle of the frame, hulls under it), plus their life ---------- */
function layer(g, c, f, baseY, cx, dY, VW, VH) { const w = c.width; let x0 = ((-cx * f) % w + w) % w; if (x0 > 0) x0 -= w; const y0 = R(baseY + dY * f); if (y0 > VH) return null; for (let x = x0; x < VW; x += w) g.drawImage(c, R(x), y0); return { x0, y0, w }; }
const flag = (g, x, y, red, t, i) => { const n = 7; for (let k = 0; k < n; k++) { px(g, x + k, y + R(Math.sin(t * 5 + i + k * 0.7) * 1.2) + (k >> 2), red ? '#c43a34' : BP.sil[0]); if (k < n - 2) px(g, x + k, y + 1 + R(Math.sin(t * 5 + i + k * 0.7) * 1.2) + (k >> 2), red ? BP.red : BP.sil[0]); } };
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  const far = bakeFar(), mid = bakeMid();
  if (full) { const p = layer(g, far, 0.15, VH - 186, cx, dY, VW, VH); if (p) lifeFar(g, far.life, p, VW, time); }
  const p = layer(g, mid, 0.3, VH - 215, cx, dY, VW, VH); if (p) lifeMid(g, mid.life, p, VW, time);
  /* below the mid layer's water: the same sea carried to the foot of the frame, so a deep view never shows the sky's amber under the tiles */
  const yb = p ? p.y0 + mid.height : VH; if (yb < VH) { g.fillStyle = BP.sea[0]; g.fillRect(0, yb, VW, VH - yb); }
}
function lifeFar(g, lf, p, VW, t) {
  for (let X = p.x0; X < VW; X += p.w) { const o = R(X);
    for (const [fx, fy, red] of lf.flags) flag(g, o + fx, p.y0 + fy, red, t, fx);
    for (const [gx, gy, ph] of lf.gulls) { const q = t * 0.3 + ph, x = o + gx + R(Math.cos(q) * 20), y = p.y0 + gy + R(Math.sin(q) * 5), up = Math.sin(t * 6 + ph) > 0; if (x < -6 || x > VW) continue; g.fillStyle = BP.gull; g.fillRect(x - 2, y + (up ? 0 : 1), 2, 1); g.fillRect(x, y + 1, 1, 1); g.fillRect(x + 1, y + (up ? 0 : 1), 2, 1); }
    for (const [fx, fy] of lf.flash) { const k = Math.sin(t * 0.7 + fx) * Math.sin(t * 11 + fx * 0.3); if (k > 0.93) { g.globalAlpha = 0.4; g.fillStyle = BP.cloud[5]; g.fillRect(o + fx - 20, p.y0 + fy, 50, 4); g.globalAlpha = 1; } } }   /* a flicker deep in the wall */
}
function lifeMid(g, lf, p, VW, t) {
  for (let X = p.x0; X < VW; X += p.w) { const o = R(X);
    for (const [fx, fy, red] of lf.flags) flag(g, o + fx, p.y0 + fy, red, t, fx);
    for (const [lx, ly] of lf.lamps) { const k = 0.6 + 0.4 * Math.sin(t * 7 + lx); g.globalAlpha = 0.5 + 0.5 * k; g.fillStyle = BP.lamp; g.fillRect(o + lx, p.y0 + ly, 1, 1); g.globalAlpha = 1; }
    for (const [fx, fy, sc] of lf.fires) for (let k = 0; k < 5; k++) { const ph = (t * 2.2 + k * 0.37 + fx) % 1, hgt = R((4 + k * 2) * sc * (1 - ph * 0.5)), x = o + fx + R(Math.sin(t * 9 + k * 2) * 2 * sc) + k - 2;
      g.fillStyle = BP.fire[Math.min(3, k % 4)]; g.globalAlpha = 1 - ph * 0.6; g.fillRect(x, p.y0 + fy - hgt - R(ph * 6), 2, Math.max(1, hgt >> 1)); }
    for (const [fx, fy] of lf.fires.slice(0, 1)) for (let k = 0; k < 8; k++) { const ph = (t * 0.25 + k / 8) % 1; g.globalAlpha = 0.5 * (1 - ph); g.fillStyle = BP.smoke; g.fillRect(o + fx + 4 + R(ph * 30) + R(Math.sin(t + k) * 3), p.y0 + fy - 10 - R(ph * 60), 5 + R(ph * 7), 3 + R(ph * 4)); }
    g.globalAlpha = 1; }
}
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const near = bakeNear(); g.globalAlpha = 0.6; const p = layer(g, near, 0.55, VH - 265, cx, dY, VW, VH); g.globalAlpha = 1;
  if (!p) return;
  for (let X = p.x0; X < VW; X += p.w) for (const [lx, ly] of near.life.lamps) { const k = 0.7 + 0.3 * Math.sin(time * 5 + lx * 0.2); g.globalAlpha = 0.16 * k; g.fillStyle = BP.nlamp; g.fillRect(R(X) + lx - 4, p.y0 + ly - 6, 9, 12); g.globalAlpha = 1; }
}
