// src/redraw/buried_city_set.js - THE BURIED CITY's SET (claude/bc2art, the art pass): everything the city is made of that is not a tile or the backdrop. It replaces the 10-11
// placeholder shapes in src/buried-city-hands.js; every drawing function takes a view V = { g, cx, cy, vw, vh, time, L } and draws world pixels. Static pieces are baked once and memoised
// (never per frame); only what moves is drawn live (flames, motes, streams, the sand, the fall).
//   SAND         a world-anchored rippled sand texture for every body of it (rooms, heaps, the street's pit), a lit crest, a darker depth
//   LIGHT        the four SHAFTS of sun (slanted god-rays in layers, dust drifting in them, a lit patch on the floor), the lamps (oil lamps and wall braziers with a flame, a glow)
//   DECOR        the dunes' spire and torn canopy, the king's head, three statues, the mural, the kneeling court, the Sealed Pyramid, stalls, buried house fronts, domes, the
//                sinkhole's sliding lip
//   THE STREET   the sinking street as one baked set riding the sand: paving, house fronts, a minaret stub, a dome; sand streaming off its ends while it moves; THE ARCH
// Part two (falls, rooms, gates, levers) is below.
const R = Math.round, TS = 16;
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w); c.height = Math.max(1, h); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const vis = (V, x0, x1, m = 80) => x1 > V.cx - m && x0 < V.cx + V.vw + m;
const put = (V, spr, wx, wy) => V.g.drawImage(spr, R(wx - V.cx), R(wy - V.cy));
const cellAt = (V, x, y) => (x < 0 || y < 0 || x >= V.L.W || y >= V.L.H ? 1 : V.L.grid[y * V.L.W + x]);

/* ---------------------------------------------------------------- SAND */
export const SAND = { ramp: ['#9a7240', '#b08650', '#c49c5e', '#d8b474', '#ecd092'], crest: '#f4dc9c', crestLo: '#d8b474', deep: 'rgba(58,32,12,0.34)', stream: 'rgba(232,196,128,0.9)', streamHi: '#fff0c8', dark: '#a27c42' };
/* a 64 x 64 seamless rippled sand: strata of wind-ripple, grit, a few dark grains */
function sandTex() {
  return once('sandtex', () => { const [c, g] = mk(64, 64);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { let k = 2;
      const wob = Math.round(1.1 * Math.sin(x * Math.PI * 2 / 64 * 3 + (y >> 4)) + 0.8 * Math.sin(x * Math.PI * 2 / 64 * 7)), band = (y + wob + 64) % 7;
      if (band === 0) k = 1; else if (band === 3 && hash(x >> 2, y >> 3) % 3 === 0) k = 3;   /* thin strata, a lit dash here and there */
      if (hash(x, y) % 8 === 0) k = Math.max(0, k - 1); else if (hash(x + 11, y + 5) % 12 === 0) k = Math.min(4, k + 1);
      dot(g, x, y, SAND.ramp[k]); }
    for (let i = 0; i < 40; i++) { const x = hash(i, 1) % 64, y = hash(i, 2) % 64; dot(g, x, y, SAND.ramp[0]); dot(g, (x + 1) % 64, y, SAND.ramp[3]); }   /* grit */
    return c; });
}
const PAT = new WeakMap();
function sandPat(g) { let p = PAT.get(g); if (!p) { p = g.createPattern(sandTex(), 'repeat'); PAT.set(g, p); } return p; }
/* a body of sand from world (x, top) down to bottom: the texture anchored to the world, a deepening shade, a lit crest */
export function sandBody(V, wx, wtop, w, wbot, o = {}) {
  const g = V.g, h = wbot - wtop; if (h <= 0 || w <= 0) return;
  g.save(); g.translate(-R(V.cx), -R(V.cy)); g.fillStyle = sandPat(g); g.fillRect(R(wx), R(wtop), R(w), R(h));
  const gr = g.createLinearGradient(0, R(wtop), 0, R(wbot)); gr.addColorStop(0, 'rgba(58,32,12,0)'); gr.addColorStop(1, SAND.deep); g.fillStyle = gr; g.fillRect(R(wx), R(wtop), R(w), R(h));
  if (!o.noCrest) { g.fillStyle = SAND.crest; g.fillRect(R(wx), R(wtop), R(w), 1); g.fillStyle = SAND.crestLo; for (let x = 0; x < w; x += 3) g.fillRect(R(wx + x), R(wtop + 1 + (hash(x >> 1, 7) % 2)), 2, 1);
    g.fillStyle = 'rgba(255,240,190,0.5)'; for (let x = 0; x < w; x += 11) g.fillRect(R(wx + x + (hash(x, 3) % 5)), R(wtop), 2, 1); }
  g.restore();
}

/* ---------------------------------------------------------------- LIGHT */
function glowSpr(r, rgb) { return once('glow' + r + rgb, () => { const [c, g] = mk(r * 2, r * 2); const gr = g.createRadialGradient(r, r, 1, r, r, r); gr.addColorStop(0, 'rgba(' + rgb + ',0.85)'); gr.addColorStop(0.4, 'rgba(' + rgb + ',0.28)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); return c; }); }
export function glow(V, x, y, r, a, rgb = '255,170,70') { const g = V.g, o = g.globalCompositeOperation, oa = g.globalAlpha; g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.drawImage(glowSpr(r, rgb), R(x - V.cx - r), R(y - V.cy - r)); g.globalCompositeOperation = o; g.globalAlpha = oa; }
/* THE LAMPS (L.lamps: kind 'lamp' | 'brazier'): an iron bracket on the wall; an oil lamp hung from it (a brass bowl, a wick), or a wall brazier (an iron basket of coals and flame) */
export function drawLamp(V, lp) {
  const x = lp.x * TS + 8, y = lp.y * TS + 8; if (!vis(V, x, x, 60)) return; const t = V.time, fl = Math.sin(t * 9 + lp.x * 3) * 0.5 + Math.sin(t * 23 + lp.x) * 0.5;
  if (lp.kind === 'brazier') {
    put(V, once('brz', () => { const [c, g] = mk(24, 22);
      rc(g, 11, 12, 2, 10, '#2a2230'); rc(g, 4, 17, 16, 2, '#4a4252'); rc(g, 4, 17, 16, 1, '#7a7284'); rc(g, 10, 14, 4, 2, '#4a4252');   /* the bracket */
      rc(g, 4, 6, 16, 3, '#3a3242'); rc(g, 4, 6, 16, 1, '#8a8296'); for (let k = 0; k < 5; k++) { rc(g, 5 + k * 3, 8, 1, 6, '#2a2230'); } rc(g, 6, 13, 12, 2, '#3a3242'); rc(g, 6, 13, 12, 1, '#6a6276');   /* the basket */
      rc(g, 6, 7, 12, 2, '#d85a1e'); for (let k = 0; k < 6; k++) dot(g, 6 + k * 2, 7, '#ffb050');   /* coals */ return c; }), x - 12, y - 6);
    const fh = 8 + fl * 2; for (let k = 0; k < 3; k++) { const fx = x - 5 + k * 5, h = fh - Math.abs(k - 1) * 2 + Math.sin(t * 12 + k * 2) * 1.5; V.g.fillStyle = '#e8501c'; V.g.fillRect(R(fx - V.cx), R(y - 3 - h - V.cy), 3, R(h)); V.g.fillStyle = '#ffb050'; V.g.fillRect(R(fx - V.cx), R(y - 3 - h * 0.7 - V.cy), 2, R(h * 0.7)); V.g.fillStyle = '#fff0b0'; V.g.fillRect(R(fx - V.cx), R(y - 3 - h * 0.35 - V.cy), 1, R(h * 0.35)); }
    for (let k = 0; k < 3; k++) { const ph = (t * 0.9 + k * 0.33) % 1; dot(V.g, R(x - V.cx - 4 + k * 4 + Math.sin(t * 3 + k) * 3), R(y - V.cy - 10 - ph * 26), ph < 0.6 ? '#ffd070' : '#a85a2a'); }   /* sparks */
    glow(V, x, y - 8, 52, 0.5 + fl * 0.08); } else {
    put(V, once('lampspr', () => { const [c, g] = mk(16, 20);
      rc(g, 1, 0, 2, 4, '#2a2230'); rc(g, 1, 0, 10, 2, '#4a4252'); rc(g, 1, 0, 10, 1, '#8a8296'); rc(g, 10, 1, 1, 3, '#4a4252');   /* the bracket arm */
      rc(g, 9, 4, 3, 1, '#5a4a20'); rc(g, 7, 5, 7, 5, '#8a6a20'); rc(g, 7, 5, 7, 1, '#e0b858'); rc(g, 8, 10, 5, 2, '#6a4a14'); rc(g, 7, 6, 1, 4, '#e8c868'); rc(g, 13, 6, 1, 4, '#4a3410'); dot(g, 10, 7, '#f0d070');   /* the lamp: a brass bowl */
      return c; }), x - 10, y - 12);
    V.g.fillStyle = '#e8501c'; V.g.fillRect(R(x - V.cx + 2), R(y - 8 - V.cy), 2, 4 + (fl > 0.3 ? 1 : 0)); V.g.fillStyle = '#ffd070'; V.g.fillRect(R(x - V.cx + 2), R(y - 7 - V.cy), 1, 3); dot(V.g, R(x - V.cx + 2), R(y - 9 - V.cy), '#fff4c0');
    glow(V, x + 2, y - 6, 34, 0.42 + fl * 0.06); }
}
/* THE SHAFTS OF SUN: slanted god-rays in three layers, motes drifting in them, a lit patch on the floor, the rim of the hole */
export function drawShaft(V, z, floorRow) {
  const g = V.g, l = z.x0 * TS, w = (z.x1 - z.x0 + 1) * TS, r = l + w, fy = floorRow * TS, off = 26, t = V.time;
  if (!vis(V, l, r + off, 40)) return;
  const sx = l - V.cx, sy = -V.cy, fh = fy - 0;
  const gr = g.createLinearGradient(0, R(sy), 0, R(sy + fh)); gr.addColorStop(0, 'rgba(255,240,180,0.36)'); gr.addColorStop(0.6, 'rgba(255,226,150,0.17)'); gr.addColorStop(1, 'rgba(255,214,120,0.12)');
  const beam = (a0, a1, b0, b1, alpha) => { g.globalAlpha = alpha; g.fillStyle = gr; g.beginPath(); g.moveTo(R(sx + a0), R(sy)); g.lineTo(R(sx + a1), R(sy)); g.lineTo(R(sx + b1 + off), R(sy + fh)); g.lineTo(R(sx + b0 + off), R(sy + fh)); g.closePath(); g.fill(); };
  beam(0, w, 0, w, 0.9); const pulse = 0.5 + 0.25 * Math.sin(t * 0.8 + z.x0);
  beam(w * 0.08, w * 0.3, w * 0.08, w * 0.3, 0.55 * pulse + 0.15); beam(w * 0.52, w * 0.74, w * 0.52, w * 0.74, 0.5 * (1 - pulse) + 0.2); beam(w * 0.82, w * 0.92, w * 0.82, w * 0.92, 0.4);
  g.globalAlpha = 1;
  /* the lit patch on the floor: a warm ellipse, a brighter core, grains catching */
  const px0 = sx + off + w / 2, py0 = sy + fy; g.globalAlpha = 0.5; g.fillStyle = 'rgba(255,226,140,0.55)'; g.beginPath(); g.ellipse(R(px0), R(py0 - 2), w * 0.62, 5, 0, 0, 7); g.fill(); g.globalAlpha = 0.5; g.fillStyle = 'rgba(255,248,210,0.7)'; g.beginPath(); g.ellipse(R(px0), R(py0 - 2), w * 0.34, 3, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  /* motes drifting down the beam */
  g.fillStyle = 'rgba(255,248,214,0.85)'; for (let i = 0; i < 16; i++) { const ph = ((t * (5 + (i % 4) * 2) + i * 37) % fh) / fh, y = ph * fh, xx = sx + (i * 17 % w) + off * ph + Math.sin(t * 0.7 + i) * 4; g.fillRect(R(xx), R(sy + y), 1, 1); if (i % 3 === 0) g.fillRect(R(xx), R(sy + y + 1), 1, 1); }
  /* a light bloom where the rays leave the hole */
  glow(V, l + w / 2, 6, 40, 0.22, '255,236,170');
}

/* ---------------------------------------------------------------- shared figure drawing: a silhouette by rows, shaded left (lit) to right (dark) */
function ramp5(base) { return base; }
const STONE = ['#4a3a26', '#6e5636', '#8e7248', '#b09462', '#d8c088'];
function bodyRows(g, cx, y0, y1, hw, ramp = STONE, lit = -0.2) {   /* hw(y) -> half-width; shading across the width, a darker edge on the right, a lit edge on the left */
  for (let y = y0; y < y1; y++) { const w = hw(y); if (w <= 0) continue; for (let x = -w; x < w; x++) { const u = (x + w) / (2 * w), k = u < 0.12 ? 4 : u < 0.35 ? 3 : u < 0.62 ? 2 : u < 0.85 ? 1 : 0; dot(g, R(cx + x), y, ramp[Math.max(0, Math.min(4, k + (hash(R(cx + x), y) % 17 === 0 ? -1 : 0)))]); } }
}
function gearAt(g, gx, gy, r, teeth, col, hi, dark) { g.fillStyle = col; for (let i = 0; i < teeth; i++) { const an = i * Math.PI * 2 / teeth, tx = gx + Math.cos(an) * (r + 1), ty = gy + Math.sin(an) * (r + 1); g.fillRect(R(tx) - 1, R(ty) - 1, 2, 2); }
  g.beginPath(); g.arc(gx, gy, r, 0, 7); g.fill(); g.fillStyle = hi; g.fillRect(R(gx - r + 1), R(gy - r * 0.6), 1, 2); g.fillStyle = dark; g.beginPath(); g.arc(gx, gy, Math.max(1, r * 0.35), 0, 7); g.fill(); }

/* ---------------------------------------------------------------- THE KING, CARVED: statue, head in the dune */
const GOLD = ['#5a4014', '#8a6a20', '#c49a38', '#e8c45c', '#fff0a0'];
export function kingStatue(h) {
  return once('kingstatue' + h, () => { const H = h * 16 + 6, [c, g] = mk(56, H), cx = 28;
    /* the plinth: stepped, with a carved band */
    rc(g, 6, H - 7, 44, 7, '#5a4630'); rc(g, 6, H - 7, 44, 1, '#b09462'); rc(g, 9, H - 12, 38, 5, '#6e5636'); rc(g, 9, H - 12, 38, 1, '#c8aa72'); rc(g, 6, H - 1, 44, 1, '#2e2212');
    for (let x = 10; x < 46; x += 4) { rc(g, x, H - 9, 2, 1, '#d8aa40'); rc(g, x + 2, H - 8, 2, 1, '#8a6a20'); }   /* a gilded band of knots */
    const fy1 = H - 12, top = 4, hh = fy1 - top;
    /* robes: flaring to the floor, shoulders at 0.26 */
    bodyRows(g, cx, top + 14, fy1, y => { const t = (y - (top + 14)) / (hh - 14); return Math.round(8 + (t < 0.1 ? 1 : 0) + 6 * t * t); });
    for (const fx of [-6, -2, 2, 6]) for (let y = top + 34; y < fy1; y++) if ((y + fx) % 3) dot(g, cx + fx + (y - top > hh * 0.6 ? (fx > 0 ? 2 : -2) * Math.round((y - top - hh * 0.6) / 14) : 0), y, '#4a3a26');   /* pleats */
    rc(g, cx - 9, top + 14, 18, 2, '#c8aa72'); rc(g, cx - 9, top + 16, 18, 1, '#6e5636');   /* the collar */
    /* the glass in his chest: a brass ring, a pane, sand */
    const gy = top + 26; g.fillStyle = GOLD[2]; g.beginPath(); g.arc(cx, gy, 6, 0, 7); g.fill(); g.fillStyle = GOLD[0]; g.beginPath(); g.arc(cx, gy, 5, 0, 7); g.fill(); rc(g, cx - 3, gy - 4, 6, 8, '#1a1626'); rc(g, cx - 3, gy - 4, 1, 8, '#4a5a70');
    g.fillStyle = GOLD[3]; g.beginPath(); g.moveTo(cx - 2, gy + 3); g.lineTo(cx + 2, gy + 3); g.lineTo(cx + 1, gy + 1); g.lineTo(cx - 1, gy + 1); g.closePath(); g.fill(); rc(g, cx, gy - 1, 1, 2, GOLD[4]); rc(g, cx - 2, gy - 3, 4, 1, GOLD[3]); dot(g, cx - 2, gy - 4, GOLD[4]);
    /* arms: down at the sides, the right hand on a pendulum sceptre (a long rod, a bob) */
    rc(g, cx - 13, top + 15, 5, 26, '#8e7248'); rc(g, cx - 13, top + 15, 1, 26, '#d8c088'); rc(g, cx - 9, top + 15, 1, 26, '#4a3a26');
    rc(g, cx + 8, top + 15, 5, 22, '#6e5636'); rc(g, cx + 12, top + 15, 1, 22, '#3a2a18');
    rc(g, cx + 9, top + 35, 6, 4, '#b09462'); rc(g, cx + 9, top + 35, 6, 1, '#d8c088');   /* the hand */
    rc(g, cx + 12, top + 39, 1, fy1 - top - 42, GOLD[2]); rc(g, cx + 12, top + 39, 1, 3, GOLD[4]);   /* the rod */
    g.fillStyle = GOLD[2]; g.beginPath(); g.arc(cx + 12.5, fy1 - 6, 4, 0, 7); g.fill(); g.fillStyle = GOLD[1]; g.beginPath(); g.arc(cx + 13, fy1 - 5, 3, 0, 7); g.fill(); dot(g, cx + 11, fy1 - 8, GOLD[4]);   /* the bob */
    /* the head: a square-cut beard, closed eyes, the crown of gears */
    bodyRows(g, cx, top + 2, top + 14, y => (y < top + 5 ? 5 : 6));
    bodyRows(g, cx, top + 12, top + 24, y => 3 + (y > top + 20 ? -1 : 0), ['#3a2a18', '#5a4630', '#6e5636', '#8e7248', '#b09462']);   /* the beard */
    rc(g, cx - 4, top + 6, 3, 1, '#2e2212'); rc(g, cx + 1, top + 6, 3, 1, '#2e2212'); rc(g, cx - 1, top + 7, 2, 3, '#6e5636'); rc(g, cx - 3, top + 11, 6, 1, '#4a3a26');
    rc(g, cx - 6, top + 1, 12, 2, GOLD[2]); rc(g, cx - 6, top + 1, 12, 1, GOLD[4]);   /* the circlet */
    gearAt(g, cx - 4, top - 1, 3, 6, GOLD[3], GOLD[4], GOLD[0]); gearAt(g, cx + 4, top - 1, 3, 6, GOLD[2], GOLD[4], GOLD[0]); gearAt(g, cx, top - 3, 3, 6, GOLD[3], GOLD[4], GOLD[0]);
    /* a long crack and chipped edges: he has stood a long time */
    for (let y = top + 18; y < fy1 - 4; y++) if (y % 5 !== 0) dot(g, cx - 5 + ((y - top) >> 3), y, '#2e2212');
    for (let k = 0; k < 14; k++) dot(g, 6 + hash(k, h) % 44, 8 + hash(k, h + 3) % Math.max(10, H - 30), '#3a2a18');
    return c; });
}
function kingHead() {
  return once('kinghead', () => { const [c, g] = mk(72, 64), cx = 36;
    /* the great head, half under the dune: a long skull of sandstone, the crown of gears rising from it */
    bodyRows(g, cx, 14, 52, y => { const t = (y - 14) / 38; return Math.round(t < 0.15 ? 14 + t * 20 : t < 0.6 ? 17 : 17 - (t - 0.6) * 22); });
    rc(g, cx - 20, 14, 40, 2, '#d8c088'); rc(g, cx - 19, 16, 38, 1, '#6e5636');   /* the brow band */
    for (const s of [-1, 1]) { rc(g, cx + s * 9 - 4, 25, 8, 2, '#2e2212'); rc(g, cx + s * 9 - 4, 24, 8, 1, '#8e7248'); rc(g, cx + s * 9 - 3, 27, 6, 1, '#4a3a26'); }   /* closed eyes */
    rc(g, cx - 2, 28, 4, 12, '#6e5636'); rc(g, cx - 3, 38, 6, 2, '#4a3a26'); rc(g, cx - 1, 28, 1, 8, '#b09462');   /* the nose, broken */
    rc(g, cx - 8, 44, 16, 2, '#3a2a18'); rc(g, cx - 7, 46, 14, 1, '#8e7248');   /* the mouth */
    /* the crown: a band and three great gears, one cracked, one with a tooth gone */
    rc(g, cx - 18, 10, 36, 5, GOLD[2]); rc(g, cx - 18, 10, 36, 1, GOLD[4]); rc(g, cx - 18, 14, 36, 1, GOLD[0]); for (let x = cx - 16; x < cx + 16; x += 5) dot(g, x, 12, GOLD[4]);
    gearAt(g, cx - 12, 6, 6, 9, GOLD[3], GOLD[4], GOLD[0]); gearAt(g, cx + 12, 6, 6, 9, GOLD[2], GOLD[4], GOLD[0]); gearAt(g, cx, 3, 7, 10, GOLD[3], GOLD[4], GOLD[0]);
    g.clearRect(cx + 9, 0, 3, 2); for (let y = 0; y < 8; y++) dot(g, cx + 1 + (y >> 1), y + 1, '#2e2212');
    /* the hourglass at his throat, half-buried: the glass he is named for */
    rc(g, cx - 8, 50, 16, 14, GOLD[2]); rc(g, cx - 8, 50, 16, 1, GOLD[4]); rc(g, cx - 5, 52, 10, 12, '#1a1626'); rc(g, cx - 5, 52, 1, 12, '#6a7a90'); g.fillStyle = GOLD[3]; g.beginPath(); g.moveTo(cx - 4, 63); g.lineTo(cx + 4, 63); g.lineTo(cx + 1, 58); g.lineTo(cx - 1, 58); g.closePath(); g.fill();
    for (let k = 0; k < 30; k++) dot(g, cx - 18 + hash(k, 9) % 36, 16 + hash(k, 4) % 36, '#3a2a18');   /* pitting */
    return c; });
}
export function drawKingHead(V, x, base) { if (!vis(V, x - 40, x + 40)) return; put(V, kingHead(), x - 36, base - 52);
  /* the dune over his lower face and the hourglass's glint */
  const g = V.g; g.fillStyle = SAND.ramp[3]; for (let i = -34; i < 34; i += 2) { const h = 4 + Math.abs(Math.sin(i * 0.2)) * 3 + (i > 10 ? 6 : 0); g.fillRect(R(x + i - V.cx), R(base - h - V.cy), 2, R(h)); } g.fillStyle = SAND.crest; for (let i = -34; i < 34; i += 2) { const h = 4 + Math.abs(Math.sin(i * 0.2)) * 3 + (i > 10 ? 6 : 0); g.fillRect(R(x + i - V.cx), R(base - h - V.cy), 2, 1); }
  const gl = (Math.sin(V.time * 2) + 1) / 2; dot(g, R(x - 2 - V.cx), R(base - 1 - V.cy), gl > 0.5 ? '#fff4c0' : '#e8c45c'); }

/* ---------------------------------------------------------------- the king's mural (painted), the kneeling court, the Sealed Pyramid */
function mural(w) {
  return once('mural' + w, () => { const H = 46, [c, g] = mk(w, H);
    rc(g, 0, 0, w, H, '#9a7a52'); for (let y = 0; y < H; y += 1) for (let x = 0; x < w; x += 1) if (hash(x, y) % 9 === 0) dot(g, x, y, '#8a6c46'); else if (hash(x + 4, y) % 23 === 0) dot(g, x, y, '#b4946a');
    rc(g, 0, 0, w, 3, '#2c6a68'); rc(g, 0, 3, w, 1, '#d4a84a'); rc(g, 0, H - 4, w, 1, '#d4a84a'); rc(g, 0, H - 3, w, 3, '#9a4030'); rc(g, 0, 0, 3, H, '#2c6a68'); rc(g, w - 3, 0, 3, H, '#2c6a68');
    for (let x = 6; x < w - 6; x += 6) { rc(g, x, 6, 3, 1, '#4a3220'); rc(g, x + 1, 8, 2, 1, '#4a3220'); rc(g, x, 10, 3, 1, '#4a3220'); }   /* a row of glyphs */
    const cx = (w / 2) | 0, gy = H - 8; rc(g, 4, gy, w - 8, 1, '#5a4228'); for (let x = 6; x < w - 6; x += 3) dot(g, x, gy + 1, '#d4a84a');   /* the ground line, grains of sand */
    /* the king: tall, flat-painted, a crown of gears, the glass for a heart, a pendulum sceptre */
    rc(g, cx - 4, 14, 8, 24, '#d4a84a'); rc(g, cx - 4, 14, 1, 24, '#f0cc70'); rc(g, cx - 6, 34, 12, 4, '#d4a84a'); rc(g, cx - 3, 12, 6, 3, '#b87838'); rc(g, cx - 5, 11, 10, 1, '#f0cc70'); for (const dx of [-4, 0, 4]) rc(g, cx + dx, 8, 2, 3, '#f0cc70');
    rc(g, cx - 2, 20, 4, 6, '#2c3a50'); rc(g, cx - 1, 23, 2, 3, '#f0cc70'); rc(g, cx + 5, 18, 1, 20, '#5a3a1c'); g.fillStyle = '#d4a84a'; g.beginPath(); g.arc(cx + 5.5, 38, 2.5, 0, 7); g.fill();
    /* the folk: kneeling to him, in ochre, red and teal wraps, bowed heads */
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const fx = cx + s * (16 + i * 12), fh = 7 + (i % 2), col = ['#9a4030', '#2c6a68', '#c49038', '#6a3a4a'][(i + (s > 0 ? 1 : 0)) % 4]; if (fx < 6 || fx > w - 8) continue; rc(g, fx - 3, gy - fh, 6, fh, col); rc(g, fx - 2 + s, gy - fh - 3, 3, 3, '#6a4a30'); rc(g, fx - 3, gy - fh, 6, 1, 'rgba(255,255,255,0.25)'); rc(g, fx + s * 3, gy - 3, 3, 2, '#6a4a30'); }
    for (let k = 0; k < 40; k++) dot(g, 4 + hash(k, w) % (w - 8), 4 + hash(k, 3) % (H - 10), 'rgba(40,24,10,0.5)');   /* flaking */
    rc(g, 0, 0, w, 1, '#1a1008'); rc(g, 0, H - 1, w, 1, '#1a1008');
    return c; });
}
export function drawMural(V, d) { const l = d.x0 * TS, w = (d.x1 - d.x0 + 1) * TS; if (!vis(V, l, l + w)) return; put(V, mural(w), l, d.y * TS - 40 - 2); }
/* the kneeling court: bleached, bowed, in the king's collars - four figures, no two alike */
function courtier(k) {
  return once('court' + k, () => { const [c, g] = mk(18, 22), rob = [['#c8bc9c', '#a89c7c', '#7c7058'], ['#bcb092', '#9c9072', '#70664e'], ['#d0c4a4', '#b0a484', '#847860'], ['#b4a888', '#948868', '#6a604a']][k];
    rc(g, 3, 8, 11, 13, rob[0]); rc(g, 3, 8, 2, 13, rob[1]); rc(g, 12, 8, 2, 13, rob[2]); for (let y = 10; y < 21; y += 3) rc(g, 4, y, 9, 1, rob[1]);   /* a kneeling shroud-robe */
    rc(g, 6, 3, 6, 5, '#b0a080'); rc(g, 6, 3, 1, 5, '#d0c4a4'); rc(g, 6 + (k & 1) * 4, 7, 2, 1, '#4a4030');   /* the bowed skull, the sockets */
    rc(g, 4, 9, 10, 2, '#d8aa40'); rc(g, 4, 9, 10, 1, '#f4d878'); dot(g, 9, 11, '#8a6a20');   /* the gilded collar of the court */
    rc(g, 1, 17, 6, 3, '#a89c7c'); rc(g, 11, 18, 6, 3, '#8c8068');   /* the hands on the floor */
    for (let i = 0; i < 8; i++) dot(g, 3 + hash(i, k) % 12, 8 + hash(i, k + 5) % 13, '#8c7a5a');
    for (let i = 0; i < 5; i++) dot(g, 4 + hash(i, k + 9) % 10, 20 + (hash(i, k) % 2), '#d8b472');   /* sand drifted against the knees */
    return c; });
}
export function drawCourtiers(V, d) { for (let x = d.x0; x <= d.x1; x += 4) { const wx = x * TS + 8, k = hash(x, 5) % 4; if (!vis(V, wx, wx, 20)) continue; put(V, courtier(k), wx - 9, (d.y + 1) * TS - 22); } }
function relief(w) {
  return once('relief' + w, () => { const H = 76, [c, g] = mk(w, H);
    rc(g, 0, 0, w, H, '#2a2640'); for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) if (hash(x, y) % 8 === 0) dot(g, x, y, '#34304c'); rc(g, 0, 0, w, 2, '#14122a'); rc(g, 0, 0, 2, H, '#14122a'); rc(g, w - 2, 0, 2, H, '#14122a'); rc(g, 0, H - 2, w, 2, '#d8aa40'); rc(g, 0, 2, w, 1, '#46427a');
    const cx = (w / 2) | 0, base = H - 10, ph = 52;
    for (let y = 0; y < ph; y++) { const hw = Math.round((y / ph) * 52); for (let x = -hw; x <= hw; x++) { const course = Math.floor(y / 5); let col = x < -hw + 3 ? '#5a5688' : x > hw - 3 ? '#1e1c38' : (course & 1) ? '#3e3a68' : '#46427a'; if (y % 5 === 4) col = '#1e1c38'; dot(g, cx + x, base - ph + y, col); } }   /* the pyramid, in courses */
    rc(g, cx - 7, base - 18, 14, 18, '#0e0c1c'); rc(g, cx - 7, base - 18, 14, 1, '#d8aa40'); rc(g, cx - 7, base - 18, 1, 18, '#d8aa40'); rc(g, cx + 6, base - 18, 1, 18, '#d8aa40');   /* the sealed door */
    rc(g, cx - 5, base - 8, 10, 1, '#d8aa40'); rc(g, cx - 5, base - 4, 10, 1, '#d8aa40'); for (let k = 0; k < 4; k++) dot(g, cx - 4 + k * 3, base - 6, '#8a6a20');   /* its bars, a seal */
    rc(g, cx - 18, base, 36, 2, '#d8aa40');   /* the threshold */
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { rc(g, cx + s * (30 + k * 8) - 1, 12 + k * 3, 3, 1, '#d8aa40'); rc(g, cx + s * (30 + k * 8), 14 + k * 3, 1, 3, '#8a6a20'); }   /* rays of the long day, carved */
    return c; });
}
export function drawRelief(V, d) { const l = d.x0 * TS, w = (d.x1 - d.x0 + 1) * TS; if (!vis(V, l, l + w)) return; put(V, relief(w), l, d.y * TS - 66);
  const cx = l + w / 2, by = d.y * TS - 66 + 76 - 10 - 9, p = 0.5 + 0.5 * Math.sin(V.time * 2.2);   /* the scarab on the seal, breathing teal: the next road */
  V.g.fillStyle = '#4ab0a0'; V.g.fillRect(R(cx - 3 - V.cx), R(by - 2 - V.cy), 6, 5); V.g.fillStyle = '#9ae8d8'; V.g.fillRect(R(cx - 1 - V.cx), R(by - 3 - V.cy), 2, 1); V.g.fillStyle = '#2a7a6c'; V.g.fillRect(R(cx - 4 - V.cx), R(by - V.cy), 1, 2); V.g.fillRect(R(cx + 3 - V.cx), R(by - V.cy), 1, 2); glow(V, cx, by, 20, 0.2 + 0.25 * p, '74,176,160'); }

/* ---------------------------------------------------------------- the dunes: spire, torn canopy, sinkhole lip */
function spire(hTiles) {
  return once('spire' + hTiles, () => { const H = hTiles * 16 + 6, [c, g] = mk(30, H), cx = 15;
    bodyRows(g, cx, 10, H - 6, y => { const t = (y - 10) / (H - 16); return Math.round(5 + t * 3.5 + (t > 0.9 ? 3 : 0)); }, ['#4a3622', '#6e5434', '#8e7248', '#b09462', '#d4bc84']);
    for (let y = 14; y < H - 8; y += 12) { rc(g, cx - 8, y, 16, 1, '#3a2a18'); rc(g, cx - 8, y + 1, 16, 1, '#b09462'); }   /* courses */
    rc(g, cx - 1, 24, 2, 7, '#1a1208'); rc(g, cx - 1, 50, 2, 7, '#1a1208');   /* slits */
    rc(g, cx - 10, H * 0.28, 20, 3, '#8e7248'); rc(g, cx - 10, H * 0.28, 20, 1, '#d8c088'); rc(g, cx - 10, H * 0.28 + 3, 20, 1, '#2e2212'); rc(g, cx - 8, H * 0.28 - 5, 1, 5, '#6e5434'); rc(g, cx + 7, H * 0.28 - 5, 1, 5, '#6e5434');   /* a balcony ring */
    for (let x = -6; x <= 6; x++) { const t = 10 + (hash(x + 8, 1) % 6); rc(g, cx + x, 4 + (x * x > 25 ? 3 : 0) + (hash(x, 9) % 4), 1, t - 4, '#8e7248'); }   /* the broken top: a ragged crown of masonry */
    for (let x = -8; x <= 8; x++) { const h = 3 + Math.abs(Math.sin(x * 0.4)) * 4; rc(g, cx + x, H - h, 1, h, SAND.ramp[3]); dot(g, cx + x, H - h, SAND.crest); }   /* the dune drifted round its foot */
    return c; });
}
export function drawSpire(V, d) { const wx = d.x * TS + 8; if (!vis(V, wx, wx, 30)) return; put(V, spire(d.h), wx - 15, (d.y + 1) * TS + 2 - (d.h * 16 + 6)); }
export function drawTornCanopy(V, d) { const l = d.x0 * TS, w = (d.x1 - d.x0 + 1) * TS, g = V.g, y = d.y * TS - V.cy; if (!vis(V, l, l + w)) return; const sx = l - V.cx;
  rc(g, sx - 2, y - 2, 3, 38, '#5a3a1c'); rc(g, sx + w - 1, y - 2, 3, 38, '#5a3a1c'); rc(g, sx - 2, y - 2, 3, 1, '#a07a44');
  for (let x = 0; x < w; x++) { const sag = Math.round(Math.sin(x / w * Math.PI) * 6 + Math.sin(x * 0.5 + V.time * 1.4) * 0.8), s = (x >> 2) & 1; const hole = hash(x >> 1, 4) % 9 === 0 && x > 6 && x < w - 6;
    if (hole) continue; for (let k = 0; k < 5; k++) { const A = s ? ['#e8d4a4', '#d4bc86'] : ['#c4442c', '#a63420']; dot(g, sx + x, y + sag + k, k < 3 ? A[0] : A[1]); } if (hash(x, 6) % 3 === 0) dot(g, sx + x, y + sag + 5 + (x % 3), s ? '#b49e68' : '#7e2616'); } }
export function drawSinkhole(V, d) { const l = d.x0 * TS, w = (d.x1 - d.x0 + 1) * TS; if (!vis(V, l, l + w)) return; const g = V.g, t = V.time;
  g.fillStyle = 'rgba(232,196,128,0.85)'; for (let i = 0; i < 18; i++) { const x = l + (i * 61 % w), ph = ((t * (14 + i % 5 * 3) + i * 29) % 110), y = 23 * TS + ph; g.fillRect(R(x - V.cx), R(y - V.cy), 1, 2 + (i % 3)); }
  g.fillStyle = 'rgba(40,24,10,0.3)'; g.fillRect(R(l - V.cx), R(23 * TS - V.cy), w, 3); }

/* ---------------------------------------------------------------- stalls, buried house fronts, domes */
function stallGoods(w, k) {
  return once('stall' + w + k, () => { const [c, g] = mk(w, 30);
    rc(g, 2, 14, w - 4, 14, '#6a4a28'); rc(g, 2, 14, w - 4, 2, '#a07a44'); rc(g, 2, 16, w - 4, 1, '#3a2812'); for (let x = 6; x < w - 6; x += 9) rc(g, x, 17, 1, 11, '#4a3418');   /* the counter */
    const cols = [['#b8452e', '#e8d4a4'], ['#2e7a78', '#d4a84a'], ['#c49038', '#8a3a2a']][k % 3];
    for (let x = 6; x < w - 8; x += 10) { const h = 6 + hash(x, k) % 4; rc(g, x, 14 - h, 6, h, cols[(x >> 3) & 1]); rc(g, x, 14 - h, 6, 1, 'rgba(255,255,255,0.35)'); rc(g, x + 1, 14 - h - 2, 4, 2, '#3a2812'); }   /* jars */
    for (let x = 8; x < w - 10; x += 14) { rc(g, x, 18, 8, 6, '#8a6a3a'); rc(g, x, 18, 8, 1, '#c8a060'); dot(g, x + 2, 20, '#3a2812'); }   /* crates */
    rc(g, w - 14, 4, 8, 10, '#6a3a4a'); rc(g, w - 14, 4, 8, 2, '#c49038'); rc(g, w - 12, 8, 4, 6, '#8a4a5a');   /* a rolled carpet */
    for (let i = 0; i < 5; i++) { rc(g, 8 + i * 8, 0, 1, 3 + (i % 2) * 3, '#3a2812'); rc(g, 6 + i * 8, 3 + (i % 2) * 3, 5, 3, ['#8a6a20', '#a63420', '#2e7a78'][i % 3]); }   /* wares hung from the cloth */
    for (let i = 0; i < 10; i++) dot(g, 3 + hash(i, w) % (w - 6), 24 + hash(i, 4) % 6, '#d8b472');
    return c; });
}
export function drawStall(V, d) { const l = d.x0 * TS, w = (d.x1 - d.x0 + 1) * TS; if (!vis(V, l, l + w)) return; let fy = d.y + 1; const T0 = V.T; while (fy < V.L.H - 1 && cellAt(V, (d.x0 + d.x1) >> 1, fy) !== T0.SOLID && cellAt(V, (d.x0 + d.x1) >> 1, fy) !== T0.ONEWAY) fy++; put(V, stallGoods(w, d.x0 >> 2), l, fy * TS - 30); }
function house(w, hRows, k) {
  return once('house' + w + '.' + hRows + '.' + k, () => { const H = hRows * 16, [c, g] = mk(w, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) { let col = ['#6e5a48', '#645040', '#74604c'][hash(x >> 3, y >> 3) % 3]; if ((y & 7) === 7) col = '#46382c'; else if (hash(x, y) % 13 === 0) col = '#54463a'; dot(g, x, y, col); }
    rc(g, 0, 0, w, 3, '#8a7458'); rc(g, 0, 3, w, 1, '#3a2c20'); for (let x = 0; x < w; x += 8) rc(g, x, -0, 5, 1, '#a48a68');   /* the roof's coping */
    const dx = 8 + (k % 3) * 6; rc(g, dx, H - 28, 14, 28, '#14100c'); rc(g, dx - 1, H - 29, 16, 1, '#a48a68'); rc(g, dx, H - 28, 1, 28, '#3a2c20'); for (let y = H - 26; y < H; y += 4) rc(g, dx + 2, y, 10, 1, '#1e1812');   /* a door, black */
    for (let wx = dx + 26; wx < w - 14; wx += 26) { rc(g, wx, 18, 10, 14, '#0e0c10'); rc(g, wx - 1, 17, 12, 1, '#a48a68'); rc(g, wx - 1, 32, 12, 1, '#8a7458'); for (let y = 19; y < 32; y += 3) rc(g, wx + 1, y, 8, 1, '#2a2418'); for (let x = wx + 2; x < wx + 10; x += 3) rc(g, x, 19, 1, 13, '#2a2418'); }   /* a lattice window */
    rc(g, 0, 0, 2, H, '#8a7458'); rc(g, w - 2, 0, 2, H, '#3a2c20'); for (let i = 0; i < w * 2; i++) dot(g, hash(i, k) % w, 4 + hash(i, k + 3) % (H - 6), '#46382c');
    for (let x = 0; x < w; x += 2) { const h = 2 + hash(x, k) % 3; rc(g, x, H - h, 2, h, SAND.ramp[2]); }   /* sand against the foot */
    return c; });
}
export function drawHouse(V, d) { const l = d.x0 * TS, w = (d.x1 - d.x0 + 1) * TS; if (!vis(V, l, l + w)) return; V.g.globalAlpha = 0.72; put(V, house(w, 6, d.x0 & 7), l, (d.y - 6) * TS); V.g.globalAlpha = 1; }
function dome(w) {
  return once('dome' + w, () => { const r = w / 2, [c, g] = mk(w, R(r) + 2);
    for (let y = 0; y < r; y++) { const hw = Math.round(Math.sqrt(Math.max(0, r * r - (r - y) * (r - y)))); for (let x = -hw; x < hw; x++) { const U = (x + hw) / (2 * hw); let k = U < 0.15 ? 4 : U < 0.4 ? 3 : U < 0.7 ? 2 : U < 0.9 ? 1 : 0; const rr = Math.floor((x + r) / 6), sx = (x + r + (Math.floor(y / 4) & 1) * 3) % 6; if (((y & 3) === 3) || sx === 0) k = Math.max(0, k - 1); const gl = ['#12444e', '#1c6672', '#2a8a98', '#4cb4bc', '#9ae4e4']; dot(g, R(r + x), y, gl[k]); void rr; } }
    for (let k = -2; k <= 2; k++) { const ang = k * 0.38; for (let y = 4; y < r; y++) { const hw = Math.sqrt(Math.max(0, r * r - (r - y) * (r - y))); dot(g, R(r + Math.sin(ang) * hw * 0.98), y, '#d8aa40'); } }   /* gilded ribs */
    rc(g, r - 1, -0, 2, 1, '#f0d070');
    return c; });
}
export function drawDome(V, d) { const l = d.x0 * TS, w = (d.x1 - d.x0 + 1) * TS, r = w / 2; if (!vis(V, l, l + w)) return;
  put(V, dome(w), l, d.y * TS - r); const cx = l + w / 2;   /* the lantern on top and its finial */
  V.g.fillStyle = '#c49a38'; V.g.fillRect(R(cx - 2 - V.cx), R(d.y * TS - r - 10 - V.cy), 4, 10); V.g.fillStyle = '#f0d070'; V.g.fillRect(R(cx - 2 - V.cx), R(d.y * TS - r - 10 - V.cy), 1, 10); V.g.fillStyle = '#8a6a20'; V.g.fillRect(R(cx + 1 - V.cx), R(d.y * TS - r - 10 - V.cy), 1, 10);
  V.g.fillStyle = '#2a7a88'; V.g.fillRect(R(cx - 1 - V.cx), R(d.y * TS - r - 8 - V.cy), 2, 4); V.g.fillStyle = '#c49a38'; V.g.fillRect(R(cx - 3 - V.cx), R(d.y * TS - r - 12 - V.cy), 6, 2); V.g.fillRect(R(cx - V.cx), R(d.y * TS - r - 16 - V.cy), 1, 4); V.g.fillStyle = '#f0d070'; V.g.fillRect(R(cx - 1 - V.cx), R(d.y * TS - r - 16 - V.cy), 1, 1); }

/* ---------------------------------------------------------------- THE ARCH (the street's, the sluice's): a pointed arch of voussoirs with a gold keystone and a lamp */
function archSpr(w, h, down) {
  return once('arch' + w + 'x' + h + down, () => { const [c, g] = mk(w, h), cx = w / 2, rise = Math.min(34, w * 0.5);
    /* the dark door: pointed, deep */
    for (let y = 0; y < h; y++) { const t = y < rise ? Math.sqrt(Math.max(0, 1 - Math.pow((rise - y) / rise, 2))) : 1, hw = Math.round(((w - 14) / 2) * (0.35 + 0.65 * t)); if (y < 6) continue; rc(g, cx - hw, y, hw * 2, 1, y % 9 === 0 ? '#14101c' : '#0e0a14'); }
    /* a stair going down inside it: treads lit by something below */
    if (down) for (let k = 0; k < 6; k++) { const y = h - 8 - k * 5; rc(g, cx - 14 + k * 2, y, 28 - k * 4, 2, k < 2 ? '#8a6a3a' : '#5a4428'); rc(g, cx - 14 + k * 2, y, 28 - k * 4, 1, k < 2 ? '#d8b472' : '#8a6a3a'); }
    /* the frame: voussoirs round the point, jambs below */
    for (let y = 0; y < h; y++) { const t = y < rise ? Math.sqrt(Math.max(0, 1 - Math.pow((rise - y) / rise, 2))) : 1, hw = Math.round(((w - 14) / 2) * (0.35 + 0.65 * t)); if (y < 4) continue;
      for (let s = 0; s < 7; s++) { const xl = cx - hw - 1 - s, xr = cx + hw + s; const k = y < rise ? (Math.floor(y / 4) + s) % 3 : (Math.floor(y / 8) + s) % 2; const col = ['#c8aa72', '#a48a58', '#8a7048'][k]; dot(g, R(xl), y, s === 0 ? '#e0c890' : (y % 4 === 0 || s === 6) ? '#3a2a18' : col); dot(g, R(xr), y, s === 6 ? '#3a2a18' : (y % 4 === 0) ? '#3a2a18' : s === 0 ? '#6a5436' : col); } }
    rc(g, cx - 4, 0, 8, 9, '#d8aa40'); rc(g, cx - 4, 0, 8, 1, '#f8e08a'); rc(g, cx - 4, 8, 8, 1, '#7a5a14'); rc(g, cx - 3, 2, 6, 1, '#8a6a20'); dot(g, cx, 4, '#fff0a0');   /* the keystone */
    if (down) { for (let k = 0; k < 3; k++) { rc(g, cx - 4 + k, 12 + k * 2, 8 - k * 2, 1, '#e8c45c'); } }   /* a gilt chevron cut in the stone over the door: down */
    return c; });
}
export function drawArch(V, d) { const l = d.x0 * TS + 4, w = (d.x1 - d.x0 + 1) * TS - 8, h = (d.y1 + 1 - d.y0) * TS; if (!vis(V, l, l + w)) return; put(V, archSpr(w, h, !!d.down), l, d.y0 * TS);
  if (d.down) glow(V, l + w / 2, (d.y1 + 1) * TS - 14, 28, 0.2 + 0.05 * Math.sin(V.time * 3), '255,190,100'); }

/* THE KING'S STATUE on its plinth: base = the ground's row px, wx = the centre */
export function drawKingStatue(V, wx, base, h) { if (!vis(V, wx - 30, wx + 30)) return; put(V, kingStatue(h), wx - 28, base - (h * 16 + 6));
  const tt = V.time, top = base - (h * 16 + 6) + 4 + 26; dot(V.g, R(wx - V.cx), R(top - V.cy), (Math.sin(tt * 2.2) > 0) ? '#fff4c0' : '#e8c45c'); }   /* (the glass in his chest catching the lamps) */

/* ---------------------------------------------------------------- THE THRONE (the king's room): a high-backed seat of lapis-black stone on a stepped dais, gilded, a gear-crowned arched back with a glass inset, braziers' light on it */
export function throneSpr() {
  return once('throne', () => { const [c, g] = mk(72, 96), cx = 36, L = ['#14122a', '#201e3c', '#2e2c52', '#403e70', '#5a5890'];
    for (let k = 0; k < 3; k++) { const w = 34 - k * 6, y = 96 - 5 * (k + 1); rc(g, cx - w, y, w * 2, 5, L[1 + (k & 1)]); rc(g, cx - w, y, w * 2, 1, L[4]); rc(g, cx - w, y + 4, w * 2, 1, L[0]); rc(g, cx - w, y, w * 2, 1, '#d8aa40'); for (let x = cx - w + 3; x < cx + w - 2; x += 6) dot(g, x, y + 2, L[0]); }   /* the dais, three steps, a gilded lip */
    const bx0 = cx - 17, bw = 34;   /* the high back: an arch */
    for (let y = 8; y < 81; y++) { const arch = y < 30 ? Math.round(bw / 2 * Math.sqrt(Math.max(0, 1 - Math.pow((30 - y) / 22, 2)))) : bw / 2; if (arch <= 0) continue;
      for (let x = -arch; x < arch; x++) { const u = (x + arch) / (2 * arch); dot(g, cx + x, y, L[u < 0.1 ? 4 : u < 0.4 ? 3 : u < 0.75 ? 2 : u < 0.92 ? 1 : 0]); if (hash(cx + x, y) % 19 === 0) dot(g, cx + x, y, L[0]); } }
    for (let y = 10; y < 80; y++) { const arch = y < 30 ? Math.round(bw / 2 * Math.sqrt(Math.max(0, 1 - Math.pow((30 - y) / 22, 2)))) : bw / 2; dot(g, cx - arch, y, '#d8aa40'); dot(g, cx + arch - 1, y, '#8a6a20'); }   /* the gilt edge */
    for (let k = 0; k < 14; k++) { const a = Math.PI * (k / 13), x = cx + Math.cos(a) * 14, y = 30 - Math.sin(a) * 19; rc(g, x - 1, y - 1, 3, 3, '#d8aa40'); dot(g, x - 1, y - 1, '#f6dc80'); }   /* a ring of gilt studs round the arch */
    gearAt(g, cx, 11, 6, 10, '#c49a38', '#f6dc80', '#5a4014'); gearAt(g, cx - 14, 17, 4, 7, '#a07a28', '#f6dc80', '#5a4014'); gearAt(g, cx + 14, 17, 4, 7, '#a07a28', '#f6dc80', '#5a4014');   /* the crown of gears over the back */
    rc(g, cx - 5, 28, 10, 20, '#e0b858'); rc(g, cx - 4, 29, 8, 18, '#1a1626'); rc(g, cx - 4, 29, 1, 18, '#6a7a90'); g.fillStyle = '#e6bc68'; g.beginPath(); g.moveTo(cx - 3, 46); g.lineTo(cx + 3, 46); g.lineTo(cx + 1, 40); g.lineTo(cx - 1, 40); g.closePath(); g.fill(); rc(g, cx - 2, 30, 4, 2, '#e6bc68');   /* the glass inset: the city's hour, in his seat */
    rc(g, cx - 23, 56, 9, 6, L[2]); rc(g, cx - 23, 56, 9, 1, '#d8aa40'); rc(g, cx - 23, 62, 9, 14, L[1]); rc(g, cx + 14, 56, 9, 6, L[1]); rc(g, cx + 14, 56, 9, 1, '#d8aa40'); rc(g, cx + 14, 62, 9, 14, L[0]);   /* the arms, ending in brass knobs */
    for (const x of [cx - 20, cx + 18]) { gearAt(g, x, 54, 3, 6, '#c49a38', '#f6dc80', '#5a4014'); }
    rc(g, cx - 15, 62, 30, 14, L[1]); rc(g, cx - 15, 62, 30, 2, '#d8aa40'); rc(g, cx - 15, 74, 30, 2, L[0]); for (let x = cx - 12; x < cx + 12; x += 6) { rc(g, x, 66, 3, 6, L[2]); dot(g, x, 66, L[4]); }   /* the seat, a cushion's worth of gilt */
    return c; });
}
export function drawThrone(V, wx, floorY) { if (!vis(V, wx - 40, wx + 40)) return; put(V, throneSpr(), wx - 36, floorY - 96 + 1); glow(V, wx, floorY - 40, 60, 0.18, '255,190,100'); }
