// sky_layers_art.js - THE SKY OVER THE ERUPTING VOLCANO, 3 altitudes x 4 parallax layers, plus the scene pieces (claude/skyart, lane S4).
// Ids/kinds/k come from src/sky-mount.js SKY (rim-ash, rim-ranges, rim-cone, rim-embers / high-ash, high-ranges, high-cone, high-cloud / ash-column, ash-ranges, ash-cone, ash-embers).
// Everything is baked ONCE per (view size) from px.js primitives into seamless tiles / sprites; the animated parts (eruption plume + fountains, lava bombs, lightning, embers) are
// drawn per frame from the clock. No generic wood anywhere: basalt, ash, lava glow.
//   RIM  (P1) the crater rim, the cone close and enormous, spewing; high ash overhead, the glow of lava on every underside.
//   HIGH (P2) above the plume: the cone small below, ash banks and storm cloud, lava bombs arcing up out of the throat.
//   ASH  (P3) inside the ash column: a dark pillar sky lit red from underneath, lightning, the cone a far orange speck.
// Scene pieces for lane SC (seal breaks / escape): sealLight, plume, breachCrack, rimLanding.
import { canvas, px, rect, fillPoly, line, circle, ellipse, hex, rgb, mulberry } from '../px.js';

const R = Math.round, TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => { const a = rgb(c1), b = rgb(c2); return hex(lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)); };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const cache = new Map();
const memo = (key, fn) => { let v = cache.get(key); if (!v) { v = fn(); cache.set(key, v); } return v; };
export function clearSkyArt() { cache.clear(); }

/* THE GRADIENT: 16 colour steps with a 4x4 Bayer dither between them (no smooth blend: this is pixel art) */
export function gradientTile(top, bot, glow, VW, VH) {
  return memo(['grad', top, bot, VW, VH].join('|'), () => {
    const [c, g] = canvas(VW, VH), N = 16, steps = []; for (let i = 0; i < N; i++) steps.push(mix(top, bot, i / (N - 1)));
    for (let y = 0; y < VH; y++) { const t = Math.pow(y / (VH - 1), 1.35) * (N - 1), i = Math.floor(t), f = t - i;
      for (let x = 0; x < VW; x += 1) { g.fillStyle = steps[f * 16 > BAYER[(y & 3) * 4 + (x & 3)] ? Math.min(N - 1, i + 1) : i]; g.fillRect(x, y, 1, 1); } }
    void glow; return c;
  });
}

/* a seamless billow band: overlapping lumpy blobs, dark body, lit crescents underneath where the lava glow reaches, dithered edges */
function billow(w, h, seed, pal, o = {}) {
  const [c, g] = canvas(w, h), rnd = mulberry(seed), n = o.n || 14;
  const blobs = []; for (let i = 0; i < n; i++) blobs.push({ x: (i + rnd() * 0.7) * w / n, y: h * (0.25 + rnd() * 0.5), rx: w / n * (0.9 + rnd() * 1.3), ry: h * (0.16 + rnd() * 0.22) });
  blobs.sort((a, b) => a.y - b.y);
  for (const b of blobs) for (const ox of [-w, 0, w]) ellipse(g, b.x + ox, b.y, b.rx, b.ry, pal[0], pal[1]);
  for (const b of blobs) for (const ox of [-w, 0, w]) { ellipse(g, b.x + ox - 1, b.y - b.ry * 0.18, b.rx * 0.82, b.ry * 0.68, pal[1], pal[2]); }
  for (const b of blobs) for (const ox of [-w, 0, w]) { ellipse(g, b.x + ox - 2, b.y - b.ry * 0.42, b.rx * 0.5, b.ry * 0.3, pal[2], pal[1]); }
  if (pal[3]) {   /* the under-glow: a dithered lava-red lip along each blob's lower edge */
    const img = g.getImageData(0, 0, w, h), d = img.data, a = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[(y * w + x) * 4 + 3]);
    const rgbG = rgb(pal[3]); const marks = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (a(x, y) && !a(x, y + 1) && ((x + y) & 1) === 0) marks.push([x, y]); else if (a(x, y) && !a(x, y + 2) && a(x, y + 1) && ((x + y) & 3) === 0) marks.push([x, y]);
    g.fillStyle = hex(...rgbG); for (const [x, y] of marks) g.fillRect(x, y, 1, 1);
  }
  return c;
}
/* a seamless ridge line: summed sines on integer harmonics (so the tile wraps), crest lit by the glow, a few lava threads down the slopes */
function ridge(w, h, seed, pal, o = {}) {
  const [c, g] = canvas(w, h), rnd = mulberry(seed), ph = [rnd() * TAU, rnd() * TAU, rnd() * TAU, rnd() * TAU], amp = o.amp || h * 0.5, base = o.base || h * 0.45;
  const top = x => { const u = x / w * TAU; return Math.round(base - (Math.sin(u * 2 + ph[0]) * 0.5 + Math.sin(u * 5 + ph[1]) * 0.32 + Math.sin(u * 11 + ph[2]) * 0.16 + Math.sin(u * 23 + ph[3]) * 0.08) * amp * 0.5 - amp * 0.3); };
  for (let x = 0; x < w; x++) { const y0 = Math.max(0, top(x));
    for (let y = y0; y < h; y++) { const t = (y - y0) / Math.max(1, h - y0); g.fillStyle = y === y0 ? pal[3] : t < 0.06 ? pal[2] : t < 0.5 ? (((x + y) & 1) ? pal[1] : pal[0]) : pal[0]; g.fillRect(x, y, 1, 1); } }
  const threads = o.threads === undefined ? 5 : o.threads;
  for (let i = 0; i < threads; i++) { let x = Math.floor(rnd() * w), y = top(x) + 2; for (let k = 0; k < 10 + rnd() * 10; k++) { px(g, x, y, k % 4 === 3 ? pal[5] : pal[4]); y += 1; if (rnd() < 0.45) x += rnd() < 0.5 ? -1 : 1; x = (x + w) % w; } }
  return c;
}
/* a lone stratovolcano: concave flanks, strata, lava channels glowing down the sides, a lit crater lip. Returns { c, craterX, craterY } (sprite px) */
function cone(W, H, seed, pal, o = {}) {
  const [c, g] = canvas(W, H), rnd = mulberry(seed), cw = Math.max(5, Math.round(W * (o.crater || 0.07)));
  const hw = t => cw + (W / 2 - cw - 1) * Math.pow(t, 0.72);
  for (let y = 0; y < H; y++) { const t = y / (H - 1), half = hw(t), cx = W / 2;
    for (let x = Math.ceil(cx - half); x <= Math.floor(cx + half); x++) { const dx = (x - cx) / half, near = 1 - Math.abs(dx);
      const glow = Math.max(0, 1 - t * 1.8) * 0.9 + (o.hot || 0);                              /* lit from the crater: warm near the top */
      let col = t < 0.03 ? pal[4] : (y % 7 === 0 ? pal[0] : (dx > 0.55 ? pal[0] : dx < -0.6 ? pal[0] : (near > 0.5 ? pal[2] : pal[1])));
      if (glow > 0.2 && near > 0.35 && (((x + y) & 1) === 0 || glow > 0.55)) col = glow > 0.55 ? pal[3] : pal[2];
      if (dx > 0.75 && ((x + y) & 1)) col = pal[0];
      g.fillStyle = col; g.fillRect(x, y, 1, 1); } }
  /* lava channels */
  const chans = o.channels === undefined ? 4 : o.channels;
  for (let i = 0; i < chans; i++) { let t = 0.03, off = (i / Math.max(1, chans - 1) - 0.5) * 1.5 + (rnd() - 0.5) * 0.2; const len = (o.chanLen || 0.7) * (0.6 + rnd() * 0.4);
    while (t < len) { const half = hw(t), x = Math.round(W / 2 + off * half + Math.sin(t * 30 + i) * 1.4), y = Math.round(t * (H - 1));
      px(g, x, y, t < 0.3 ? pal[5] : pal[6]); if (t < 0.4) px(g, x + 1, y, pal[6]); if (y % 3 === 0) px(g, x - 1, y, pal[6]); t += 1 / H; off *= 1.0015; } }
  /* the crater: dark throat with a white-hot lip */
  ellipse(g, W / 2, 2, cw, 2.4, pal[7]); ellipse(g, W / 2, 2.5, cw * 0.7, 1.6, pal[5]); ellipse(g, W / 2, 2.5, cw * 0.4, 1, pal[6]);
  return { c, craterX: W / 2, craterY: 2 };
}
/* streaky storm cloud (long thin lozenges) for the near 'high-cloud' layer */
function streaks(w, h, seed, pal) {
  const [c, g] = canvas(w, h), rnd = mulberry(seed);
  for (let i = 0; i < 22; i++) { const x = rnd() * w, y = rnd() * h * 0.9, len = 14 + rnd() * 40, th = 1 + (rnd() * 2.6 | 0); for (const ox of [-w, 0, w]) { ellipse(g, x + ox, y, len, th, pal[0], pal[1]); ellipse(g, x + ox - 2, y - 1, len * 0.7, Math.max(0.6, th * 0.5), pal[2], pal[1]); } }
  return c;
}

/* ---- the layer table: id -> baker (VH-aware). pal order for ridge/cone/billow explained in each use. ---- */
const PAL = {
  rim: { ash: ['#241218', '#3a2026', '#5a3034', '#a03a1c'], ranges: ['#1c1016', '#2c1a1e', '#3c2224', '#e8702a', '#c8501a', '#ff9a3a'], cone: ['#1a0e0e', '#2c1812', '#46261a', '#7a3a1e', '#a85a2a', '#ff6a1a', '#ffd36b', '#0e0608'] },
  high: { ash: ['#1c1018', '#34202a', '#4e2c34', '#8a3220'], ranges: ['#160c10', '#24161a', '#34201e', '#d85a22', '#b8421a', '#ff8a3a'], cone: ['#140a0c', '#24120e', '#3a1c12', '#6a2e18', '#9a4a22', '#ff5a1a', '#ffc04a', '#0c0508'], cloud: ['#2a181e', '#4a2c2c', '#6a3c38'] },
  ash: { column: ['#120c14', '#24181e', '#3a2630', '#8a2a24'], ranges: ['#100a0e', '#1c1216', '#2a1a1c', '#c8421a', '#a8321a', '#e8702a'], cone: ['#0e0808', '#1e0e0c', '#2c140e', '#5a2610', '#8a3a1a', '#ff4a1a', '#ffb04a', '#080404'] },
};
function bake(id, VH, ly, S) {
  const h = Math.max(8, R(ly.h * VH));
  switch (id) {
    case 'rim-ash': return { kind: 'tile', c: billow(256, h, 11, PAL.rim.ash, { n: 9 }), P: 256 };
    case 'high-ash': return { kind: 'tile', c: billow(256, h, 23, PAL.high.ash, { n: 8 }), P: 256 };
    case 'ash-column': return { kind: 'tile', c: billow(256, h, 31, PAL.ash.column, { n: 7 }), P: 256 };
    case 'rim-ranges': return { kind: 'tile', c: ridge(256, VH - R(ly.y * VH), 41, PAL.rim.ranges, { amp: h * 1.1, base: h * 0.35, threads: 7 }), P: 256 };
    case 'high-ranges': return { kind: 'tile', c: ridge(256, Math.max(10, VH - R(ly.y * VH)), 43, PAL.high.ranges, { amp: h * 1.3, base: h * 0.4, threads: 3 }), P: 256 };
    case 'ash-ranges': return { kind: 'tile', c: ridge(256, Math.max(8, VH - R(ly.y * VH) + 4), 47, PAL.ash.ranges, { amp: 7, base: 5, threads: 2 }), P: 256 };
    case 'rim-cone': { const K = cone(R(h * 2.15), h, 51, PAL.rim.cone, { crater: 0.07, channels: 5, chanLen: 0.8 }); return { kind: 'cone', ...K }; }
    case 'high-cone': { const K = cone(R(h * 2.1), h, 53, PAL.high.cone, { crater: 0.08, channels: 3, chanLen: 0.8 }); return { kind: 'cone', ...K }; }
    case 'ash-cone': { const K = cone(R(Math.max(24, h * 2.2)), Math.max(10, h), 57, PAL.ash.cone, { crater: 0.1, channels: 2, chanLen: 0.8, hot: 0.3 }); return { kind: 'cone', ...K }; }
    case 'high-cloud': return { kind: 'tile', c: streaks(256, h, 61, PAL.high.cloud), P: 256 };
    default: return { kind: ly.kind === 'motes' ? 'motes' : 'none' };
  }
  void S;
}
export function layerArt(id, VH, ly, S) { return memo('layer|' + id + '|' + VH, () => bake(id, VH, ly, S)); }

/* ---- the animated eruption, in screen px: plume + lava fountains + (high) bombs + (ash) lightning, rooted at the crater (x, y) of a cone drawn W wide ---- */
function eruption(g, x, y, W, fx, time, alpha, seed) {
  g.globalAlpha = alpha;
  if (fx === 'eruption' || fx === 'bombs' || fx === 'lightning') {
    const N = fx === 'eruption' ? 26 : fx === 'bombs' ? 16 : 12, Hmax = fx === 'eruption' ? 120 : fx === 'bombs' ? 70 : 40;
    for (let i = 0; i < N; i++) {                                             /* the ash column: smoke discs rising and widening, fire-lit at the base */
      const t = (time * 0.32 + i / N + seed * 0.13) % 1, px_ = x + Math.sin(i * 2.7 + time * 0.7) * (3 + t * 16) + t * t * 22, py = y - t * Hmax, r = 3 + t * (fx === 'eruption' ? 13 : 8);
      const col = t < 0.15 ? '#ffb04a' : t < 0.3 ? '#c8501a' : t < 0.5 ? '#6a2a1e' : t < 0.75 ? '#3a2226' : '#2a1a20';
      circle(g, px_, py, r, col, t < 0.5 ? '#3a1a14' : '#1c1218'); if (t > 0.3 && t < 0.8) circle(g, px_ - r * 0.25, py - r * 0.3, r * 0.5, '#4a2c30', col);
    }
    const F = fx === 'eruption' ? 9 : fx === 'bombs' ? 6 : 3;                  /* lava fountains: ballistic sparks */
    for (let i = 0; i < F; i++) for (let k = 0; k < 4; k++) { const t = (time * 0.9 + i * 0.37 + k * 0.045) % 1, vx = Math.sin(i * 5.1) * 26, px_ = x + vx * t, py = y - (62 + (i % 3) * 14) * t + 80 * t * t;
      px(g, px_, py, k === 0 ? '#ffe08a' : k === 1 ? '#ff9a3a' : '#ff5a1a'); }
    if (fx === 'bombs') for (let i = 0; i < 3; i++) { const t = (time * 0.35 + i / 3) % 1, bx = x + (i - 1) * 18 * t * 2.2, by = y - 150 * t + 190 * t * t - 12; circle(g, bx, by, 3, '#3a1008'); circle(g, bx, by, 2, '#ff7a2a', '#a8301a'); px(g, bx - 1, by - 1, '#ffe08a'); px(g, bx, by - 5, '#ff9a3a'); }
    if (fx === 'lightning' && Math.floor(time * 3 + x) % 7 === 0) { let lx = x + 6, ly = y - 90; g.fillStyle = '#e8d8ff'; for (let k = 0; k < 7; k++) { const nx = lx + (((k * 7 + R(x)) % 9) - 4), ny = ly + 11; line(g, lx, ly, nx, ny, k % 2 ? '#e8d8ff' : '#ffffff'); lx = nx; ly = ny; } g.globalAlpha = alpha * 0.18; g.fillStyle = '#c8b0ff'; g.fillRect(x - 60, y - 140, 120, 150); }
  }
  g.globalAlpha = 1; void W;
}

/* THE SKY (backdrop pass, screen space). One altitude; `dy` = the climb's slide, `alpha` = its blend. Signature used by sky-mount-draw.js */
export function paintAltitude(g, S, b, VW, VH, time, dy, alpha, full, layerShift) {
  g.globalAlpha = alpha; g.drawImage(gradientTile(S.top, S.bot, S.glow, VW, VH), 0, R(dy));
  if (dy > 0) { g.fillStyle = S.top; g.fillRect(0, 0, VW, R(dy)); }
  let ci = 0;
  for (const ly of S.layers) {
    const art = layerArt(ly.id, VH, ly, S), y = R(ly.y * VH + dy);
    if (art.kind === 'tile') { const P = art.P, o = layerShift(ly, b.scroll, P);
      for (let x = o - P; x < VW + P; x += P) g.drawImage(art.c, R(x), y);
      if (ly.kind === 'ridge' && art.c.height + y < VH) { g.fillStyle = '#100a0e'; g.fillRect(0, y + art.c.height, VW, VH - y - art.c.height); } }
    else if (art.kind === 'cone') { const P = 900, o = layerShift(ly, b.scroll, P), W = art.c.width;
      for (let x0 = o + VW * 0.6 - P; x0 < VW + P; x0 += P) for (const cx0 of [x0, x0 + P]) { if (cx0 < -W || cx0 > VW + W) continue;
        g.drawImage(art.c, R(cx0 - W / 2), y); eruption(g, R(cx0), y + art.craterY, W, ly.fx, time, alpha, Math.abs(R(cx0 / P)) % 5); } }
    else if (art.kind === 'motes' && (full || ly.k <= 1)) {
      const big = ly.k > 1.2 ? 3 : 2;
      for (let i = 0; i < (full ? 30 : 12); i++) { const sx = ((i * 53 - b.scroll * ly.k - time * 8) % VW + VW) % VW, sy = ((i * 37 - time * (10 + (i % 5) * 4)) % VH + VH) % VH, sz = (i % big) + 1;
        g.fillStyle = i % 4 === 0 ? '#ffe08a' : i % 3 === 0 ? '#ff5a1a' : ly.col; g.fillRect(R(sx), R(sy), sz, sz); if (sz > 1 && i % 3 === 0) { g.globalAlpha = alpha * 0.4; g.fillRect(R(sx + 2), R(sy - 2), 1, 1); g.globalAlpha = alpha; } } }
    ci++;
  }
  void ci; g.globalAlpha = 1;
}

/* ===== SCENE PIECES (lane SC calls these; all draw into screen-space g, k = 0..1 progress) ===== */
/* THE SEAL BREAKS: a column of white light rising through the cracks (x = the seal's centre, y = the floor), with pulsing rings and rising motes */
export function sealLight(g, x, y, h, k, time) {
  const w = 6 + k * 22;
  for (let i = 0; i < 4; i++) { g.globalAlpha = (0.12 + 0.1 * k) * (4 - i) / 2; g.fillStyle = i < 2 ? '#fff0c0' : '#ff9a3a'; g.fillRect(R(x - w / 2 - i * 3), R(y - h * k), R(w + i * 6), R(h * k)); }
  g.globalAlpha = 1; g.fillStyle = '#ffffff'; g.fillRect(R(x - w / 4), R(y - h * k), R(w / 2), R(h * k));
  for (let i = 0; i < 18; i++) { const t = (time * 0.8 + i / 18) % 1; px(g, x + Math.sin(i * 3.3) * w * 0.6, y - t * h * k, i % 2 ? '#ffe08a' : '#ffffff'); }
  for (let i = 0; i < 3; i++) { const t = (time * 1.2 + i / 3) % 1; g.strokeStyle = '#ffe08a'; g.globalAlpha = (1 - t) * 0.7; g.beginPath(); g.ellipse(x, y, 10 + t * 50 * k, 3 + t * 8 * k, 0, 0, 7); g.stroke(); }
  g.globalAlpha = 1;
}
/* THE ERUPTION PLUME as a scene piece (the same column the backdrop erupts, big) */
export function plume(g, x, y, scale, time) { eruption(g, x, y, 80 * scale, 'eruption', time, 1, 1); if (scale > 1) eruption(g, x - 14 * scale, y + 4, 60 * scale, 'eruption', time + 0.4, 0.8, 2); }
/* THE BREACH: the crack opening in the crater floor, seen from the side (x centre, y floor line, w width, k 0..1 open) */
export function breachCrack(g, x, y, w, k, time) {
  const hw = R(w * k / 2); if (hw < 1) return;
  g.fillStyle = '#0a0406'; g.fillRect(x - hw, y, hw * 2, 8 + R(k * 10));
  for (let i = -hw; i <= hw; i++) { const t = Math.abs(i) / hw, d = 3 + (1 - t) * (8 + 10 * k); g.fillStyle = t > 0.8 ? '#ffb04a' : t > 0.5 ? '#ff5a1a' : '#a8301a'; g.fillRect(x + i, y + 1, 1, R(d * (0.7 + 0.3 * Math.sin(time * 6 + i * 0.7)))); }
  for (let i = 0; i < 10; i++) { const t = (time * 0.9 + i / 10) % 1; px(g, x + Math.sin(i * 4.1) * hw * 0.8, y - t * 40 * k, i % 2 ? '#ffe08a' : '#ff7a2a'); }
  for (let i = 0; i < 6; i++) { const sx = x + (i % 2 ? 1 : -1) * (hw + 2 + i * 3), sy = y + (i & 1); g.fillStyle = '#2c1812'; g.fillRect(sx, sy - 2 - (i % 3), 3, 2 + (i % 3)); }
}
/* THE RIM LANDING: the crater rim seen from the drake as it banks in - basalt lip + lava glow below (x, y = the lip's top, w width) */
export function rimLanding(g, x, y, w, time) {
  return memo('rim|' + w, () => { const [c, gg] = canvas(w, 40), rnd = mulberry(5);
    for (let xx = 0; xx < w; xx++) { const t = xx / w, top = R(4 + Math.sin(t * 9) * 2 + Math.sin(t * 23) * 1.4 + (t > 0.7 ? (t - 0.7) * 20 : 0)); for (let yy = top; yy < 40; yy++) { gg.fillStyle = yy === top ? '#6c5c5c' : yy < top + 3 ? '#463a3c' : ((xx + yy) & 1) ? '#2c2224' : '#1e1618'; gg.fillRect(xx, yy, 1, 1); } }
    for (let i = 0; i < 14; i++) { let xx = rnd() * w, yy = 10 + rnd() * 6; for (let k = 0; k < 8; k++) { px(gg, xx, yy, k % 3 ? '#ff5a1a' : '#ffb04a'); yy++; if (rnd() < 0.4) xx += rnd() < 0.5 ? -1 : 1; } }
    return c; }) && void g.drawImage(cache.get('rim|' + w), R(x), R(y)) || (g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 3), g.fillStyle = '#ff7a2a', g.fillRect(R(x), R(y + 30), w, 2), void (g.globalAlpha = 1));
}
export { PAL as SKY_PAL };
