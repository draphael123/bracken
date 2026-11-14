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
const MT = ['#080b12', '#101722', '#1a2433', '#2a384c', '#3e5068', '#5a7088', '#9ab0c4', '#e8f0f8'];       /* the mountain, shadow to snow */
const FARC = ['#7a8eac', '#92a4c0', '#aab8d0'];                                                              /* the far range: hazed */
const STONE = ['#10141c', '#1e2530', '#313c4a', '#4a586a', '#6a7a8c', '#90a0b2', '#bccad8'];                 /* the portal's cut stone */
const IRON = ['#0c0e12', '#1a1e24', '#2a3038', '#424a56', '#646e7c', '#8e98a6'];
const LAMP = ['#6a3a12', '#c0701c', '#ffb23c', '#fff0b0'];
const CAVE = ['#020306', '#06080e', '#0c0f18', '#161420', '#28181a', '#4a2a1c'];                              /* the throat: black, then the warm of far lamps */
const ROPE = ['#1a140c', '#3a2e1c', '#6c5c38', '#a89460'];
const MISTC = '#c8d4e4';

/* ---------- the mountain with its cave mouth ---------- */
export const MW = 480, MH = 300, MOUTH = { cx: 240, base: 262, hw: 52, top: 168 };   /* the portal: centre x, floor row, half-width, the arch's crown row */
const ridge = (y, k) => 240 + (k - 2) * (y - 10) * 0.34 + Math.sin(y * 0.09 + k * 2.1) * 9;
export function bakeMountain() {
  return once('mountain', () => {
    const [c, g] = canvas(MW, MH), r = mulberry(1101);
    const edge = y => 0.92 * (y - 14) + Math.sin(y * 0.11) * 6 + Math.sin(y * 0.31) * 2;                       /* half-width of the massif at row y */
    for (let y = 8; y < MH; y++) { const hw = Math.max(0, edge(y)); const x0 = Math.floor(240 - hw), x1 = Math.ceil(240 + hw);
      for (let x = Math.max(0, x0); x < Math.min(MW, x1 + 1); x++) {
        let f = 0; for (let k = 0; k < 5; k++) if (x > ridge(y, k)) f++;                                      /* which facet: left of every ridge is lit */
        const lit = f < 3 ? 1 : 0, strata = Math.floor(y / 6), bt = (hash(strata, 5) % 3) - 1, gr = (hash(x, y) >> 7) % 13 === 0 ? 1 : (hash(x, y * 3) >> 8) % 19 === 0 ? -1 : 0;
        const fx = Math.abs(x - 240) / Math.max(1, hw), shade = fx > 0.82 ? -1 : 0;
        let idx = clamp(3 + (lit ? 1 : -1) * (f === 2 || f === 3 ? 0 : 0) + (lit ? 0 : -1) + bt + gr + shade - (y > 200 ? ((y - 200) >> 5) : 0), 0, 6);
        const snowline = 78 + Math.sin(x * 0.17) * 9 + ((hash(x >> 2, 9) % 5) * 3), gully = (hash(x >> 1, 4) % 6) === 0 && y < snowline + 38 + (hash(x >> 1, 3) % 30);
        if (y < snowline || gully) idx = clamp(lit ? 7 : 6, 0, 7) - (gully && y >= snowline ? 1 : 0);
        if (x === x0 || x === x1) idx = Math.min(idx, 2);
        rect(g, x, y, 1, 1, MT[idx]); } }
    for (let k = 0; k < 40; k++) { const x = (r() * MW) | 0, y = 60 + ((r() * 220) | 0), hw = edge(y); if (Math.abs(x - 240) < hw - 4) { rect(g, x, y, 2 + ((r() * 4) | 0), 1, MT[Math.min(6, 2 + ((r() * 3) | 0))]); } }   /* ledges and crags */
    /* THE PORTAL */
    const { cx, base, hw, top } = MOUTH, rad = hw, cy = top + rad;
    for (let y = top - 10; y <= base + 2; y++) for (let x = cx - hw - 12; x <= cx + hw + 12; x++) {                                    /* the stone frame, then the throat */
      const dx = x - cx, inFrame = y < cy ? Math.hypot(dx, y - cy) <= rad + 11 : Math.abs(dx) <= rad + 11, inThroat = y < cy ? Math.hypot(dx, y - cy) <= rad : Math.abs(dx) <= rad;
      if (!inFrame) continue;
      if (inThroat) { const d = y < cy ? Math.hypot(dx, y - cy) / rad : Math.abs(dx) / rad, far = 1 - Math.abs(dx) / rad;
        const eg = Math.hypot(dx / 34, (y - (base - 34)) / 44), lit = eg < 0.32 ? 5 : eg < 0.55 ? 4 : eg < 0.85 ? 3 : d > 0.85 ? 2 : 1;                    /* a faint warm far end: a soft glow round the far lamps */
        rect(g, x, y, 1, 1, CAVE[Math.min(5, lit + ((hash(x, y) % 9 === 0 && lit > 2 && lit < 5) ? 1 : 0) - ((hash(x, y) % 7 === 0 && lit > 3) ? 1 : 0))]); void far; continue; }
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
    for (let y = base - 52; y <= base; y++) { const t = (y - (base - 52)) / 52, wd = lerp(1, 40, t); rect(g, Math.round(cx - wd), y, 1, 1, IRON[4]); rect(g, Math.round(cx + wd), y, 1, 1, IRON[3]); if (y % 4 === 0) rect(g, Math.round(cx - wd - 2), y, Math.round(wd * 2 + 5), 1, '#2a2218'); }
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
/* ---------- the head station: THE CAVE MOUTH (claude/caveback, Daniel 11-14: the boss backdrop should look like the opening to a cave) ----------
   You stand INSIDE a rock cave looking down the ore road's throat: a ragged granite arch frames a dark tunnel that recedes in five arches under two hung lamps, the rails running to a small far exit where pale daylight is
   the ONLY light (east of centre). Rough rock ceiling with hanging rock and rime, iron crown housings and a winch bolted into the stone, eyebolt anchors in the frame. Everything is dark granite (2+ value steps under the lines).
   Two baked layers, both horizontally periodic on 640: bakeStation (the wall + throat, parallax 0.3) and bakeStationNear (hanging rock + ceiling lip, parallax 0.55); the live sheave wheel turns on the bracket the bake leaves for it (STATION_WHEEL). */
export const SW = 640, SH = 180, STATION_WHEEL = { x: 380, y: 44, r: 14 };
const TP = 640, TAU = 6.2832;
const ROCK = ['#0a0b10', '#12131a', '#1a1b24', '#22232c', '#2c2c36', '#383844'];                              /* the cave's granite, shadow to a lit rim (the level's own stone is two steps lighter) */
const ROCKEDGE = '#0a0b10';
const RIME = ['#7a8694', '#9aa6b2'];
const SKYC = ['#34465e', '#4a5e78', '#6a7e98', '#8a9cb4'];
const pn = (x, s) => { let v = 0; for (let k = 1; k <= 3; k++) v += Math.sin(TAU * (k + (s % 3)) * x / TP + (hash(k, s) % 628) / 100) / k; return v / 1.8; };   /* periodic noise -1..1 */
const wdx = (x, c) => { let d = ((x - c) % TP + TP) % TP; return d > TP / 2 ? d - TP : d; };
function bakeRock(g) {                                                                                      /* granite facets: jittered cells (wrapping), a crack where two meet, lit toward the upper left */
  const CW = 32, CH = 24, NC = TP / CW, seed = (i, j) => { const ii = ((i % NC) + NC) % NC; return [ii * CW + (hash(ii, j) % 28), j * CH + (hash(j + 40, ii) % 20), hash(ii, j + 7)]; };
  for (let y = 0; y < SH; y++) for (let x = 0; x < TP; x++) {
    const ci = Math.floor(x / CW), cj = Math.floor(y / CH); let d1 = 1e9, d2 = 1e9, best = null;
    for (let i = ci - 1; i <= ci + 1; i++) for (let j = cj - 1; j <= cj + 1; j++) { const s = seed(i, j), d = Math.hypot(wdx(x, s[0]), (y - s[1]) * 1.25); if (d < d1) { d2 = d1; d1 = d; best = s; } else if (d < d2) d2 = d; }
    let idx = 1 + (best[2] % 3) + ((best[2] >> 5) & 1);
    const gap = d2 - d1, st = y + Math.round(pn(x, 7) * 3);
    if (hash(Math.floor(st / 8), 3) % 5 === 0) idx--;
    if (y > 140) idx--;
    if (gap < 1.4) idx = 0; else if (gap < 3 && wdx(x, best[0]) < 0 && y < best[1]) idx++;
    else if ((hash(x, y) >> 7) % 17 === 0) idx += (hash(y, x) & 1) ? 1 : -1;
    rect(g, x, y, 1, 1, ROCK[clamp(idx, 0, 4)]); } }
export function bakeStation() {
  return once('station', () => { const [c, g] = canvas(SW, SH);
    bakeRock(g);
    /* the ceiling: a shadowed overhang band, a lit lip, hanging rock with pale icicle tips */
    const ceil = x => Math.round(17 + pn(x, 2) * 9 + (hash(x >> 2, 6) % 4));
    for (let x = 0; x < TP; x++) { const cy = ceil(x); for (let y = 0; y < cy; y++) rect(g, x, y, 1, 1, ROCK[(hash(x, y) % 6 === 0) ? 1 : 0]); rect(g, x, cy, 1, 1, ROCK[4]); rect(g, x, cy + 1, 1, 1, ROCK[1]); }
    for (let k = 0, x = 6; x < TP - 10; k++, x += 22 + (hash(k, 11) % 20)) { const w = 4 + (hash(k, 3) % 5), l = 6 + (hash(k, 4) % 15);
      for (let q = 0; q < l; q++) { const hw = Math.max(0, Math.round(w / 2 * (1 - q / l))); for (let i = -hw; i <= hw; i++) rect(g, x + i, ceil(x + i) + 1 + q, 1, 1, i < 0 ? ROCK[3] : ROCK[1]); }
      if (hash(k, 9) % 2 === 0) for (let q = 0; q < 4; q++) rect(g, x, ceil(x) + 1 + l + q, 1, 1, q < 3 ? RIME[0] : RIME[1]); }
    /* THE ARCH: a rough rock frame round a dark throat; the throat recedes in five arches to a small exit */
    const AX = 240, AR = 100, TOP = 26, VPX = AX + 26;
    const shell = k => { const t = k / 5, e = Math.pow(t, 0.8), hw = Math.round(lerp(AR, 16, e)), top = Math.round(lerp(TOP, 78, e)), cx = Math.round(lerp(AX, VPX, e)); return { hw, top, cx, cy: top + hw, fl: Math.round(lerp(SH, 118, e)) }; };
    const inArch = (S, x, y) => { const dx = wdx(x, S.cx); return Math.abs(dx) <= S.hw && y >= S.top && (y >= S.cy ? y <= S.fl : Math.hypot(dx, y - S.cy) <= S.hw); };
    const wob = x => Math.round(pn(x, 4) * 5);
    for (let y = TOP - 14; y < SH; y++) for (let x = AX - AR - 16; x <= AX + AR + 16; x++) {                                          /* the frame's lit lip and inner shadow */
      const dx = x - AX, dist = y < TOP + AR ? Math.hypot(dx, y - (TOP + AR)) : Math.abs(dx), e = dist - (AR + wob(x));
      if (e > 0 && e <= 1) rect(g, x, y, 1, 1, dx < 0 ? ROCK[5] : ROCK[4]); else if (e > 1 && e <= 4) rect(g, x, y, 1, 1, ROCK[(hash(x, y) % 4 === 0) ? 1 : 0]);
      else if (e <= 0) rect(g, x, y, 1, 1, ROCK[0]); }
    const WALL = [CAVE[2], CAVE[1], CAVE[1], CAVE[0], CAVE[0]], FLOOR = [ROCK[1], ROCK[1], ROCK[0], ROCK[0], ROCK[0]];
    for (let k = 0; k < 5; k++) { const S = shell(k), P = k ? shell(k - 1) : null;
      for (let y = S.top; y <= S.fl; y++) for (let x = S.cx - S.hw; x <= S.cx + S.hw; x++) if (inArch(S, x, y)) { const gr = (hash(x, y) % 13 === 0) ? 1 : 0; rect(g, x, y, 1, 1, y > S.cy + 6 && k < 4 ? FLOOR[k] : WALL[Math.min(4, k + gr)]); }
      if (P) for (let y = S.fl; y <= P.fl; y++) for (let x = P.cx - P.hw; x <= P.cx + P.hw; x++) if (inArch(P, x, y) && y > P.cy) rect(g, x, y, 1, 1, FLOOR[k - 1]);
      for (let x = S.cx - S.hw; x <= S.cx + S.hw; x++) { const dx = x - S.cx, yy = Math.round(S.cy - Math.sqrt(Math.max(0, S.hw * S.hw - dx * dx))); rect(g, x, yy, 1, 1, dx < 0 ? ROCK[3] : ROCK[2]); }   /* each arch's crown ring, a rock rib */
      for (let y = S.cy; y <= S.fl; y++) { rect(g, S.cx - S.hw, y, 1, 1, ROCK[3]); rect(g, S.cx + S.hw, y, 1, 1, ROCK[2]); } }
    /* hanging rock and icicles at the arch's crown */
    for (let k = 0; k < 9; k++) { const ix = AX - 70 + k * 17 + (hash(k, 21) % 8), l = 3 + (hash(k, 22) % 8), iy = Math.round(TOP + AR - Math.sqrt(Math.max(0, AR * AR - (ix - AX) ** 2))) + wob(ix);
      for (let q = 0; q < l; q++) rect(g, ix, iy + q, 1, 1, q < l - 3 ? ROCK[2] : q < l - 1 ? RIME[0] : RIME[1]); }
    /* THE FAR EXIT: pale daylight and a hazed peak, the only light in the cave */
    { const S = shell(5);
      for (let y = S.top; y <= S.fl; y++) for (let x = S.cx - S.hw; x <= S.cx + S.hw; x++) if (inArch(S, x, y)) { const t = (y - S.top) / (S.fl - S.top); rect(g, x, y, 1, 1, SKYC[Math.min(3, Math.floor(t * 3.4))]); }
      for (let x = S.cx - S.hw; x <= S.cx + S.hw; x++) { const pk = S.fl - 4 - Math.round(Math.abs(Math.sin(x * 0.4)) * 6 + Math.max(0, 6 - Math.abs(x - S.cx - 4))); for (let y = pk; y <= S.fl; y++) if (inArch(S, x, y)) rect(g, x, y, 1, 1, y === pk ? MT[5] : MT[3]); }
      for (let x = S.cx - S.hw; x <= S.cx + S.hw; x++) { const dx = x - S.cx, yy = Math.round(S.cy - Math.sqrt(Math.max(0, S.hw * S.hw - dx * dx))); rect(g, x, yy - 1, 1, 1, ROCK[2]); } }
    /* the ore road: two rails run from our feet to the exit, sleepers between, a few glints where the daylight finds them */
    for (let y = 119; y < SH; y++) { const t = (y - 118) / (SH - 118), cx = lerp(VPX, AX, t), sp = lerp(1, 48, t);
      rect(g, Math.round(cx - sp), y, 1, 1, y < 130 && y % 2 ? IRON[4] : IRON[3]); rect(g, Math.round(cx + sp), y, 1, 1, y < 130 && y % 2 ? IRON[3] : IRON[2]); }
    for (let i = 1; i < 13; i++) { const t = Math.pow(i / 13, 1.8), y = Math.round(119 + (SH - 119) * t), cx = lerp(VPX, AX, t), sp = lerp(1, 48, t); rect(g, Math.round(cx - sp - 2), y, Math.round(sp * 2 + 5), t > 0.4 ? 2 : 1, '#2a2218'); }
    /* two hung lamps in the throat, dim amber on a dithered halo */
    for (const [lx, ly, hl] of [[AX - 56, 66, 5], [AX + 4, 84, 4]]) {
      for (let y = -11; y <= 11; y++) for (let x = -14; x <= 14; x++) { const d = Math.hypot(x / 1.3, y); if (d < 4.5) rect(g, lx + x, ly + y, 1, 1, CAVE[5]); else if (d < 10 && ((x + y) & 1) === 0) rect(g, lx + x, ly + y, 1, 1, CAVE[4]); }
      for (let q = 0; q < hl * 2; q++) rect(g, lx, ly - 8 - q, 1, 1, IRON[2]);
      rect(g, lx - 2, ly - 2, 5, 6, IRON[1]); rect(g, lx - 2, ly - 2, 5, 1, IRON[3]); rect(g, lx - 1, ly - 1, 3, 4, LAMP[1]); rect(g, lx, ly, 1, 2, LAMP[2]); }
    /* IRON AND ROPE BOLTED INTO THE ROCK: crown housings in the ceiling, eyebolt anchors in the frame, a winch on a shelf, the wheel's bracket */
    for (const hx of [90, 232, 372, 520]) { const y0 = ceil(hx) - 3;
      rect(g, hx - 14, y0, 28, 11, IRON[1]); rect(g, hx - 14, y0, 28, 1, IRON[3]); rect(g, hx - 14, y0 + 10, 28, 1, IRON[0]); rect(g, hx - 14, y0, 1, 11, IRON[2]);
      for (const rx of [-12, -4, 4, 11]) { rect(g, hx + rx, y0 + 2, 2, 2, IRON[3]); rect(g, hx + rx, y0 + 7, 2, 2, IRON[3]); }
      rect(g, hx - 3, y0 + 11, 6, 6, IRON[2]); rect(g, hx - 2, y0 + 12, 4, 4, IRON[0]); rect(g, hx - 1, y0 + 13, 2, 2, IRON[4]);                 /* the crown sheave housing */
      for (let q = 0; q < 28; q++) rect(g, hx + (q < 14 ? 0 : 1), y0 + 17 + q, 1, 1, q < 20 ? ROPE[2] : ROPE[1]); }
    for (const [ex, ey, sg] of [[AX - AR - 10, 88, -1], [AX + AR + 10, 96, 1]]) {
      rect(g, ex - 5, ey, 10, 13, IRON[1]); rect(g, ex - 5, ey, 10, 1, IRON[3]); rect(g, ex - 4, ey + 2, 2, 2, IRON[4]); rect(g, ex + 2, ey + 9, 2, 2, IRON[4]);
      for (const [rx, ry] of [[-1, 4], [0, 4], [1, 4], [-1, 5], [1, 5], [-1, 6], [0, 6], [1, 6]]) rect(g, ex + rx, ey + ry, 1, 1, IRON[4]);                    /* the eye */
      for (let q = 0; q < 16; q++) rect(g, ex + sg * (2 + q), ey + 5 + Math.round(q * q / 60), 1, 1, q % 3 ? ROPE[2] : ROPE[1]); }
    { const wx = 95, wy = 134; rect(g, wx - 20, wy + 12, 44, 5, ROCK[4]); rect(g, wx - 20, wy + 12, 44, 1, ROCK[5]);                                              /* a winch on a rock shelf */
      rect(g, wx - 16, wy - 4, 4, 16, IRON[2]); rect(g, wx + 12, wy - 4, 4, 16, IRON[2]); rect(g, wx - 12, wy, 24, 12, IRON[1]); rect(g, wx - 12, wy, 24, 1, IRON[3]);
      for (let q = 0; q < 6; q++) rect(g, wx - 11 + q * 4, wy + 1, 2, 10, q % 2 ? ROPE[1] : ROPE[2]); rect(g, wx - 18, wy - 2, 2, 2, IRON[4]); rect(g, wx + 16, wy - 2, 2, 2, IRON[4]); rect(g, wx + 14, wy + 4, 10, 2, IRON[3]); rect(g, wx + 22, wy + 2, 2, 6, IRON[4]); }
    { const W = STATION_WHEEL, c0 = ceil(W.x); rect(g, W.x - 2, c0, 4, W.y - c0, IRON[2]); rect(g, W.x - 2, c0, 1, W.y - c0, IRON[3]); rect(g, W.x - 10, c0 - 2, 20, 4, IRON[1]); rect(g, W.x - 10, c0 - 2, 20, 1, IRON[3]);   /* the sheave's hanger bolted to the ceiling */
      for (const sx of [-1, 1]) for (let q = 0; q < W.r; q++) rect(g, W.x + sx * (W.r + 2), W.y - q, 1, 1, IRON[1]); rect(g, W.x - W.r - 2, W.y - W.r, W.r * 2 + 5, 2, IRON[2]); }
    return c; });
}
/* the near layer: the ceiling's dark lip and four hanging masses, the darkest thing on screen, slid at 0.55 over the wall */
export function bakeStationNear() {
  return once('stationNear', () => { const [c, g] = canvas(SW, SH);
    for (let x = 0; x < TP; x++) { const cy = Math.round(7 + pn(x, 5) * 5 + (hash(x >> 1, 8) % 3)); for (let y = 0; y < cy; y++) rect(g, x, y, 1, 1, ROCK[0]); rect(g, x, cy, 1, 1, ROCK[1]); }
    for (const [mx, w, l] of [[58, 36, 78], [214, 30, 62], [352, 40, 92], [520, 28, 56]]) for (let y = 0; y < l; y++) { const t = y / l, hw = Math.round(w / 2 * (1 - t * 0.9) + pn(mx * 7 + y * 4, 3) * 2.5);
      for (let i = -hw; i <= hw; i++) rect(g, mx + i, y, 1, 1, i === hw || (i === hw - 1 && y % 3) ? ROCK[2] : ROCK[0]);
      if (y > l - 8 && hash(mx, y) % 2) rect(g, mx, y, 1, 1, RIME[0]); }
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
    if (top + G.h < VH) { const y0 = top + G.h, ex = VH - y0;   /* the foot: strata run on down, the slopes flare to the screen edge */
      for (let yy = 0; yy < ex; yy += 2) { const fl = Math.round(yy * 0.92), st = Math.floor((y0 + yy) / 6), tone = (hash(st, 7) % 3 === 0) ? MT[2] : MT[1]; g.fillStyle = yy > ex * 0.5 && tone === MT[2] ? MT[1] : tone; g.fillRect(left - fl, y0 + yy, G.w + fl * 2, 2); } }
    /* the slopes' flare beside the sprite at its own foot: the massif's base is wider than the sprite */
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
    g.globalAlpha = (1 - sa) * (0.07 + 0.02 * Math.sin(time * 9)); g.fillStyle = '#ffb23c'; for (let k = 0; k < 3; k++) { const lw = Math.round((30 - k * 9) * G.s), lh = Math.round((22 - k * 6) * G.s); g.fillRect(mouthX - lw, mouthY - Math.round(26 * G.s) - lh / 2, lw * 2, lh); }
    /* spindrift off the peak */
    g.globalAlpha = (1 - sa) * 0.55; g.fillStyle = '#ffffff'; const px0 = Math.round(left + 240 * G.s), py0 = Math.round(top + 14 * G.s);
    for (let k = 0; k < 14; k++) { const t = (time * 0.4 + k * 0.071) % 1; g.fillRect(px0 + Math.round(t * 60 * G.s) + k, py0 + Math.round(Math.sin(t * 6 + k) * 3) + k % 4, Math.max(1, Math.round(4 * G.s * (1 - t))), 1); }
    g.globalAlpha = 1;
    /* the distance blues everything: a haze that thins as you come up to it */
    g.globalAlpha = (1 - sa) * 0.34 * (1 - p); g.fillStyle = MISTC; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1;
  }
  if (sa > 0) {
    const S = bakeStation(), N = bakeStationNear(), w = S.width, y = Math.round(Math.min(0, VH - S.height) + Math.min(dY * 0.2, 12)); let x0 = ((-cx * 0.3) % w + w) % w; if (x0 > 0) x0 -= w;
    g.globalAlpha = sa; for (let x = x0; x < VW; x += w) g.drawImage(S, Math.round(x), y);
    for (let x = x0; x < VW; x += w) { const W = STATION_WHEEL; g.globalAlpha = sa * 0.8; wheel(g, Math.round(x) + W.x, y + W.y, W.r, time * 0.9);   /* the sheave wheel turning on its ceiling hanger */
      g.globalAlpha = sa * (0.045 + 0.02 * Math.sin(time * 7)); g.fillStyle = '#ffb23c'; for (const [lx, ly] of [[184, 66], [244, 84]]) g.fillRect(Math.round(x) + lx - 16, y + ly - 11, 32, 22); }   /* the two lamps breathe */
    /* daylight spill (claude/batch189): the exit's cool light washes the cave wall in the band where Skyhook perches and rides, so his dark coat reads against paler stone; the ceiling stays dark */
    g.fillStyle = '#8ea4c6'; for (let yy = 10; yy < 104; yy += 2) { const b = clamp((yy - 10) / 14) * clamp((104 - yy) / 14); g.globalAlpha = sa * 0.24 * ease(b); g.fillRect(0, yy, VW, 2); }
    let xn = ((-cx * 0.55) % w + w) % w; if (xn > 0) xn -= w; g.globalAlpha = sa * 0.92; for (; xn < VW; xn += w) g.drawImage(N, Math.round(xn), y);   /* the near layer: hanging rock */
    g.globalAlpha = sa * 0.9; g.fillStyle = ROCKEDGE; for (let yy = 0; yy < VH; yy += 3) { const a = 3 + (hash(yy, 5) % 7) + Math.max(0, 12 - yy / 3) * 0.5, b = 3 + (hash(yy, 6) % 7) + Math.max(0, 12 - yy / 3) * 0.5; g.fillRect(0, yy, Math.round(a), 3); g.fillRect(VW - Math.round(b), yy, Math.round(b), 3); }   /* dark rock silhouettes at both walls */
    g.globalAlpha = 1;
  }
  /* mist bands, thicker low in the shaft */
  if (full) { const n = Math.round(lerp(5, 2, p)); g.fillStyle = MISTC; for (let k = 0; k < n; k++) { const w = 80 + k * 23, y = Math.round(((k * 53 + 20 - cy * (0.12 + k * 0.02)) % (VH + 30) + VH + 30) % (VH + 30)) - 10, x = Math.round(((k * 97 + time * (4 + k * 1.5) - cx * 0.2) % (VW + w) + VW + w) % (VW + w)) - w;
    g.globalAlpha = (0.05 + 0.02 * k) * (1 - sa * 0.8); g.fillRect(x, y, w, 2); g.fillRect(x + 10, y + 2, w - 24, 1); } g.globalAlpha = 1; }
}
