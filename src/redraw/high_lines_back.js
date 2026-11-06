// high_lines_back.js - THE HIGH LINES' BACKDROP (claude/hlart, 2026-11-05; Daniel 11-05 15:27: "a mountain CAVE MOUTH you climb toward the whole level, which GROWS as you rise, and leads into the Ore Road").
// Layers, back to front (all baked once from px.js rects, no gradients, so the art can be read in a node contact sheet):
//   FAR PEAKS   a pale blue range, hazy, on the slowest parallax (the sky is the level's own palette gradient)
//   THE MOUNTAIN + ITS CAVE MOUTH  ONE sprite (320x300): a snow-capped massif in blue-grey facets, and a stone portal near its foot - voussoirs, a lintel gantry with a sheave wheel, a dark throat with the ore
//     road's rails running in under hung lamps. It is drawn at a scale that GROWS with the climb (0.28 at the line-yard, about 1.8 at the head station) and it SLIDES DOWN the screen as you rise
//     (vertical parallax by height), so the whole level is one approach: a dark notch in a far mountain, then a doorway, then the hall you fight in.
//   THE ROPEWAY  three cables converge on the portal's lintel from the lower left (they grow with it); ore buckets ride them in; a puff of spindrift blows off the peak
//   MIST BANDS   thin drifting strips, thicker low in the shaft
//   THE HEAD STATION  below row ~48 the camera is INSIDE the cave: the mountain fades out and the station's back wall takes over - five stone bays, iron roof beams, a big sheave wheel turning, hung lamps
// drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full)   bakeStation() / bakeMountain() are exported for the contact sheet and the lint.
import { canvas, rect, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
const MT = ['#0a0e16', '#141c2a', '#202c40', '#324258', '#4a6078', '#6c8498', '#a8bccc', '#e8f0f8'];       /* the mountain, shadow to snow */
const FARC = ['#7a8eac', '#92a4c0', '#aab8d0'];                                                              /* the far range: hazed */
const STONE = ['#10141c', '#1e2530', '#313c4a', '#4a586a', '#6a7a8c', '#90a0b2', '#bccad8'];                 /* the portal's cut stone */
const IRON = ['#0c0e12', '#1a1e24', '#2a3038', '#424a56', '#646e7c', '#8e98a6'];
const LAMP = ['#6a3a12', '#c0701c', '#ffb23c', '#fff0b0'];
const CAVE = ['#020306', '#06080e', '#0c0f18', '#161420', '#28181a', '#4a2a1c'];                              /* the throat: black, then the warm of far lamps */
const ROPE = ['#1a140c', '#3a2e1c', '#6c5c38', '#a89460'];
const MISTC = '#c8d4e4';

/* ---------- the mountain with its cave mouth ---------- */
export const MW = 320, MH = 300, MOUTH = { cx: 160, base: 262, hw: 52, top: 168 };   /* the portal: centre x, floor row, half-width, the arch's crown row */
const ridge = (y, k) => 160 + (k - 2) * (y - 10) * 0.34 + Math.sin(y * 0.09 + k * 2.1) * 9;
export function bakeMountain() {
  return once('mountain', () => {
    const [c, g] = canvas(MW, MH), r = mulberry(1101);
    const edge = y => 0.92 * (y - 14) + Math.sin(y * 0.11) * 6 + Math.sin(y * 0.31) * 2;                       /* half-width of the massif at row y */
    for (let y = 8; y < MH; y++) { const hw = Math.max(0, edge(y)); const x0 = Math.floor(160 - hw), x1 = Math.ceil(160 + hw);
      for (let x = Math.max(0, x0); x < Math.min(MW, x1 + 1); x++) {
        let f = 0; for (let k = 0; k < 5; k++) if (x > ridge(y, k)) f++;                                      /* which facet: left of every ridge is lit */
        const lit = f < 3 ? 1 : 0, strata = Math.floor(y / 6), bt = (hash(strata, 5) % 3) - 1, gr = (hash(x, y) >> 7) % 13 === 0 ? 1 : (hash(x, y * 3) >> 8) % 19 === 0 ? -1 : 0;
        const fx = Math.abs(x - 160) / Math.max(1, hw), shade = fx > 0.82 ? -1 : 0;
        let idx = clamp(3 + (lit ? 1 : -1) * (f === 2 || f === 3 ? 0 : 0) + (lit ? 0 : -1) + bt + gr + shade - (y > 200 ? ((y - 200) >> 5) : 0), 0, 6);
        const snowline = 78 + Math.sin(x * 0.17) * 9 + ((hash(x >> 2, 9) % 5) * 3), gully = (hash(x >> 1, 4) % 6) === 0 && y < snowline + 38 + (hash(x >> 1, 3) % 30);
        if (y < snowline || gully) idx = clamp(lit ? 7 : 6, 0, 7) - (gully && y >= snowline ? 1 : 0);
        if (x === x0 || x === x1) idx = Math.min(idx, 2);
        rect(g, x, y, 1, 1, MT[idx]); } }
    for (let k = 0; k < 40; k++) { const x = (r() * MW) | 0, y = 60 + ((r() * 220) | 0), hw = edge(y); if (Math.abs(x - 160) < hw - 4) { rect(g, x, y, 2 + ((r() * 4) | 0), 1, MT[Math.min(6, 2 + ((r() * 3) | 0))]); } }   /* ledges and crags */
    /* THE PORTAL */
    const { cx, base, hw, top } = MOUTH, rad = hw, cy = top + rad;
    for (let y = top - 10; y <= base + 2; y++) for (let x = cx - hw - 12; x <= cx + hw + 12; x++) {                                    /* the stone frame, then the throat */
      const dx = x - cx, inFrame = y < cy ? Math.hypot(dx, y - cy) <= rad + 11 : Math.abs(dx) <= rad + 11, inThroat = y < cy ? Math.hypot(dx, y - cy) <= rad : Math.abs(dx) <= rad;
      if (!inFrame) continue;
      if (inThroat) { const d = y < cy ? Math.hypot(dx, y - cy) / rad : Math.abs(dx) / rad, far = 1 - Math.abs(dx) / rad;
        const lit = y > base - 52 && y < base - 8 && Math.abs(dx) < 22 ? 4 : y > base - 62 && Math.abs(dx) < 12 ? 3 : d > 0.85 ? 2 : 1;                   /* a faint warm far end */
        rect(g, x, y, 1, 1, CAVE[Math.min(5, Math.round(lit + (hash(x, y) % 9 === 0 && lit > 2 ? 1 : 0) - (d > 0.92 ? 0 : 0) + (far > 0.9 ? 1 : 0)))]); continue; }
      const ring = y < cy ? Math.floor(Math.atan2(y - cy, dx) * 9) : Math.floor(y / 11), blk = hash(ring, Math.floor((y < cy ? Math.hypot(dx, y - cy) : Math.abs(dx)) / 6)),   /* voussoir joints */
        e = (y < cy ? Math.hypot(dx, y - cy) - rad : Math.abs(dx) - rad);
      const joint = (y < cy ? (Math.floor(Math.atan2(y - cy, dx) * 24) % 3 === 0 && false) : false);
      let idx = 3 + (dx < 0 ? 1 : 0) + ((blk % 3) - 1) - (e > 8 ? 1 : 0); if (e < 1.5) idx = 1; if ((y < cy ? Math.floor((Math.atan2(y - cy, dx) + 6.283) * 40) % 6 === 0 : y % 11 === 0) && e > 1.5) idx = 1;
      if (y < cy - 1 && e > 9 && dx < 0 && !joint) idx++;
      rect(g, x, y, 1, 1, STONE[clamp(idx, 0, 6)]);
    }
    /* snow on the lintel stone, icicles at the springing */
    for (let x = cx - rad - 8; x <= cx + rad + 8; x++) { const yy = Math.round(cy - Math.sqrt(Math.max(0, (rad + 11) ** 2 - (x - cx) ** 2))); if (yy > 4 && (hash(x, 3) % 4) < 3) { rect(g, x, yy - 1, 1, 2, '#e8f0f8'); if (hash(x, 5) % 3 === 0) rect(g, x, yy + 1, 1, 1, '#c0d0e0'); } }
    for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) { const ix = cx + sx * (rad - 2 - k * 3), l = 3 + ((hash(k, sx + 3) % 5)); const iy = Math.round(cy - Math.sqrt(Math.max(0, rad * rad - (ix - cx) ** 2))); for (let q = 0; q < l; q++) rect(g, ix, iy + 1 + q, 1, 1, q < 2 ? '#a8bccc' : '#e8f0f8'); }
    /* the lintel gantry: an iron beam across the arch's crown, the sheave wheel on it, a truss */
    const gy = top - 4; rect(g, cx - 34, gy, 68, 5, IRON[3]); rect(g, cx - 34, gy, 68, 1, IRON[5]); rect(g, cx - 34, gy + 4, 68, 1, IRON[0]);
    for (let k = -32; k < 32; k += 8) { for (let q = 0; q < 8; q++) rect(g, cx + k + q, gy - 1 - Math.round(Math.abs(q - 4) * 0.0) - (q < 4 ? q : 8 - q), 1, 1, IRON[2]); }
    rect(g, cx - 3, gy - 22, 6, 22, IRON[2]); rect(g, cx - 3, gy - 22, 2, 22, IRON[4]); rect(g, cx - 7, gy - 26, 14, 5, IRON[3]); rect(g, cx - 7, gy - 26, 14, 1, IRON[5]);   /* the mast */
    wheel(g, cx, gy - 12, 9, 0);                                                                                         /* the sheave wheel (a still frame; the live one turns) */
    for (const lx of [cx - 46, cx + 46]) { rect(g, lx - 1, gy + 4, 2, 10, IRON[2]); rect(g, lx - 3, gy + 14, 6, 6, IRON[1]); rect(g, lx - 2, gy + 15, 4, 4, LAMP[1]); rect(g, lx - 1, gy + 16, 2, 2, LAMP[3]); }   /* lamps on the portal's shoulders */
    /* the ore road's rails running in under the arch, and the sleepers */
    for (let y = base - 52; y <= base; y++) { const t = (y - (base - 52)) / 52, wd = lerp(2, 36, t * t); rect(g, Math.round(cx - wd), y, 1, 1, IRON[4]); rect(g, Math.round(cx + wd), y, 1, 1, IRON[3]); if (y % 4 === 0) rect(g, Math.round(cx - wd - 2), y, Math.round(wd * 2 + 5), 1, '#2a2218'); }
    for (const dx of [-30, -14, 14, 30]) { rect(g, cx + dx, base - 38 + Math.abs(dx) / 3, 1, 3, IRON[3]); rect(g, cx + dx - 1, base - 41 + Math.abs(dx) / 3, 3, 3, LAMP[1]); }   /* the far lamps */
    rect(g, cx - rad - 12, base + 1, rad * 2 + 24, 3, STONE[2]); rect(g, cx - rad - 12, base + 1, rad * 2 + 24, 1, STONE[5]);   /* the sill / landing stones */
    return c; });
}
function wheel(g, x, y, r, ph) { for (let a = 0; a < 6.283; a += 0.12) rect(g, Math.round(x + Math.cos(a) * r), Math.round(y + Math.sin(a) * r), 1, 1, IRON[4]);
  for (let k = 0; k < 4; k++) { const a = ph + k * Math.PI / 2; for (let q = 1; q < r; q++) rect(g, Math.round(x + Math.cos(a) * q), Math.round(y + Math.sin(a) * q), 1, 1, q % 3 ? IRON[3] : IRON[5]); }
  rect(g, x - 1, y - 1, 3, 3, IRON[5]); rect(g, x, y, 1, 1, IRON[0]); }

/* ---------- the far range ---------- */
export function bakeFar() {
  return once('far', () => { const W = 480, H = 110, [c, g] = canvas(W, H), r = mulberry(77);
    for (let x = 0; x < W; x++) { const h = 30 + Math.sin(x * 0.021) * 22 + Math.sin(x * 0.067) * 9 + Math.sin(x * 0.19) * 3 + (x % 97 < 3 ? 10 : 0), y0 = Math.round(H - h - 10);
      for (let y = y0; y < H; y++) { const k = y - y0; rect(g, x, y, 1, 1, k < 2 ? '#dce6f2' : k < 6 && (hash(x >> 2, 3) & 1) ? '#c4d2e4' : FARC[Math.min(2, (k / 22) | 0)]); } }
    for (let k = 0; k < 20; k++) rect(g, (r() * W) | 0, 50 + ((r() * 50) | 0), 3, 1, FARC[0]);
    return c; });
}
/* ---------- the head station's back wall: five stone bays, iron roof beams, a sheave wheel, lamps ---------- */
export const SW = 640, SH = 180;
export function bakeStation() {
  return once('station', () => { const [c, g] = canvas(SW, SH), r = mulberry(404);
    for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) { const course = Math.floor(y / 12), off = (course & 1) * 14, bx = Math.floor((x + off) / 28), blk = hash(bx, course), jx = (x + off) % 28 === 0, jy = y % 12 === 0;
      rect(g, x, y, 1, 1, jx || jy ? STONE[0] : STONE[1 + (blk % 3) - (y > 130 ? 1 : 0) + (y < 30 ? 0 : 0)] || STONE[1]); }
    for (let b = 0; b < 5; b++) { const bx = 24 + b * 128, hw = 40;                                                                  /* five arched bays, dark */
      for (let y = 38; y < SH; y++) for (let x = bx - hw; x <= bx + hw; x++) { const dy = y - 78, dd = y < 78 ? Math.hypot(x - bx, dy) : Math.abs(x - bx); if (dd > hw) continue; const e = hw - dd; rect(g, x, y, 1, 1, e < 2 ? STONE[3] : e < 3 ? STONE[2] : CAVE[1 + ((hash(x, y) % 11 === 0) ? 1 : 0) + (y > 140 ? 1 : 0)]); }
      for (let q = 0; q < 12; q++) rect(g, bx - 3, 60 + q * 7, 6, 1, IRON[2]);                                                    /* the ore chute's iron ladder in the bay */ }
    for (let k = 0; k < 4; k++) { rect(g, 0, 20 + k * 6, SW, 2, k === 0 ? IRON[4] : IRON[2]); }                                    /* the roof's iron beams, in tiers */
    for (let x = 0; x < SW; x += 64) { rect(g, x, 0, 6, 44, IRON[2]); rect(g, x, 0, 2, 44, IRON[4]); for (let q = 0; q < 6; q++) rect(g, x + 1, 4 + q * 7, 4, 1, IRON[0]); }   /* the iron posts of the roof frame */
    rect(g, 0, 0, SW, 12, IRON[1]); rect(g, 0, 11, SW, 1, IRON[3]);
    for (let x = 36; x < SW; x += 128) { rect(g, x - 1, 12, 2, 16, IRON[3]); rect(g, x - 4, 28, 8, 9, IRON[1]); rect(g, x - 3, 29, 6, 7, LAMP[1]); rect(g, x - 1, 31, 2, 3, LAMP[3]); }   /* lamps hung under the beam */
    for (let x = 0; x < SW; x += 2) { const y = 156 + Math.round(Math.sin(x * 0.04) * 1); rect(g, x, y, 1, 1, ROPE[2]); }               /* the high line's cable across, just a thread of rope */
    return c; });
}

/* ---------- the live parts ---------- */
const cable = (g, x0, y0, x1, y1, sag, col, step = 1) => { const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)); for (let i = 0; i <= n; i++) { const t = i / n; rect(g, Math.round(lerp(x0, x1, t)), Math.round(lerp(y0, y1, t) + Math.sin(t * Math.PI) * sag), 1, 1, col); } };
const bucket = (g, x, y, s) => { const w = Math.max(2, Math.round(5 * s)), h = Math.max(2, Math.round(4 * s)); rect(g, x - w / 2, y - 1, w, 1, IRON[3]); rect(g, x - w / 2, y, w, h, IRON[2]); rect(g, x - w / 2, y, w, 1, IRON[5]); rect(g, x - w / 2 + 1, y + 1, Math.max(1, w - 2), 1, '#5a3a22'); };
export const climbOf = (cy, VH, L) => clamp(1 - cy / Math.max(1, (L && L.H ? L.H * 16 : 3840) - VH));
export function stationAlpha(cy) { return clamp((62 - cy / 16) / 14); }
export function mouthGeom(p, VW, VH, cx) {
  const s = Math.round(lerp(0.28, 1.85, Math.pow(p, 1.7)) * 12) / 12, anchorY = VH * lerp(0.2, 0.58, ease(p)), x = Math.round(VW * lerp(0.62, 0.5, p) - cx * 0.02);
  return { s, x, y: anchorY, w: Math.round(MW * s), h: Math.round(MH * s) };
}
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full = true) {
  const p = climbOf(cy, VH, L), sa = stationAlpha(cy);
  /* the far peaks */
  { const c = bakeFar(), w = c.width; let x = ((-cx * 0.05) % w + w) % w; if (x > 0) x -= w; const y = Math.round(VH - c.height + 8 + Math.min(dY * 0.04, 30) + p * 28); for (; x < VW; x += w) g.drawImage(c, Math.round(x), y); }
  if (sa < 1) {
    const M = bakeMountain(), G = mouthGeom(p, VW, VH, cx), top = Math.round(G.y - (MOUTH.base - 30) * G.s + 0), left = Math.round(G.x - MW * G.s / 2);
    g.imageSmoothingEnabled = false; g.globalAlpha = 1 - sa;
    g.drawImage(M, 0, 0, MW, MH, left, top, G.w, G.h);
    if (top + G.h < VH) { g.fillStyle = MT[2]; g.fillRect(Math.max(0, left), top + G.h - 1, Math.min(VW, G.w), VH - (top + G.h) + 1); }                       /* the mountain's foot runs on below the sprite */
    if (left > 0) { g.fillStyle = MT[2]; }
    /* the lintel's anchor, on screen */
    const ax = Math.round(left + MOUTH.cx * G.s), ay = Math.round(top + (MOUTH.top - 8) * G.s), mouthX = ax, mouthY = Math.round(top + (MOUTH.base - 20) * G.s);
    /* the live sheave wheel */
    if (G.s > 0.5) wheel(g, ax, Math.round(top + (MOUTH.top - 16) * G.s), Math.round(9 * G.s), time * 1.4);
    /* THE ROPEWAY: three cables from the lower left up to the lintel; ore buckets ride in */
    g.globalAlpha = (1 - sa) * clamp(0.5 + p);
    for (let k = 0; k < 3; k++) { const sx = -10 - k * 6, sy = VH + 6 - k * 22 + Math.round((1 - p) * 14), tx = ax - 14 * G.s + k * 14 * G.s, ty = ay + 2 * G.s;
      cable(g, sx, sy, tx, ty, 5 + 12 * G.s, k === 1 ? ROPE[3] : ROPE[2], 1);
      for (let b = 0; b < 3; b++) { const t = ((time * (0.035 + k * 0.006) + b / 3 + k * 0.21) % 1); const bx = lerp(sx, tx, t), by = lerp(sy, ty, t) + Math.sin(t * Math.PI) * (5 + 12 * G.s); if (t > 0.04 && t < 0.97) bucket(g, Math.round(bx), Math.round(by) + 1, 0.5 + G.s * 0.6); } }
    /* the lamps at the mouth flicker */
    g.globalAlpha = (1 - sa) * (0.18 + 0.05 * Math.sin(time * 9)); g.fillStyle = '#ffb23c'; const lw = Math.round(40 * G.s); g.fillRect(mouthX - lw, mouthY - Math.round(30 * G.s), lw * 2, Math.round(26 * G.s));
    /* spindrift off the peak */
    g.globalAlpha = (1 - sa) * 0.55; g.fillStyle = '#ffffff'; const px0 = Math.round(left + 160 * G.s), py0 = Math.round(top + 14 * G.s);
    for (let k = 0; k < 14; k++) { const t = (time * 0.4 + k * 0.071) % 1; g.fillRect(px0 + Math.round(t * 60 * G.s) + k, py0 + Math.round(Math.sin(t * 6 + k) * 3) + k % 4, Math.max(1, Math.round(4 * G.s * (1 - t))), 1); }
    g.globalAlpha = 1;
    /* the distance blues everything: a haze that thins as you come up to it */
    g.globalAlpha = (1 - sa) * 0.34 * (1 - p); g.fillStyle = MISTC; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
  }
  if (sa > 0) {
    const S = bakeStation(), w = S.width; let x = ((-cx * 0.3) % w + w) % w; if (x > 0) x -= w; const y = Math.round(Math.min(0, VH - S.height) + Math.min(dY * 0.2, 12));
    g.globalAlpha = sa; for (; x < VW; x += w) g.drawImage(S, Math.round(x), y); g.globalAlpha = 1;
    const wx = Math.round(VW * 0.5 - cx * 0.3 % 220), wy = 62; g.globalAlpha = sa; wheel(g, ((wx % 320) + 320) % 320 - 10, wy, 22, time * 0.9); g.globalAlpha = 1;   /* the big sheave wheel turning */
    g.globalAlpha = sa * (0.08 + 0.03 * Math.sin(time * 7)); g.fillStyle = '#ffb23c'; g.fillRect(0, 20, VW, 60); g.globalAlpha = 1;
  }
  /* mist bands, thicker low in the shaft */
  if (full) { const n = Math.round(lerp(5, 2, p)); g.fillStyle = MISTC; for (let k = 0; k < n; k++) { const w = 80 + k * 23, y = Math.round(((k * 53 + 20 - cy * (0.12 + k * 0.02)) % (VH + 30) + VH + 30) % (VH + 30)) - 10, x = Math.round(((k * 97 + time * (4 + k * 1.5) - cx * 0.2) % (VW + w) + VW + w) % (VW + w)) - w;
    g.globalAlpha = (0.05 + 0.02 * k) * (1 - sa * 0.8); g.fillRect(x, y, w, 2); g.fillRect(x + 10, y + 2, w - 24, 1); } g.globalAlpha = 1; }
}
