// src/redraw/sealed_pyramid_backdrop.js - THE SEALED PYRAMID's BACKDROP (claude/spart, the art pass). Two jobs:
//   drawRoom(g, st, sx, sy, w, h, x0, y0, time)   the tomb's BACK WALLS (L.interiors 'py*'): coursed sandstone darker than the stone you stand on, a recessed glyph frieze at one course,
//        fluted pilasters every 12 tiles with their capital and base, a ceiling cavetto and a floor shadow, each room its own cast: the gallery's warm dust, the shafts' cool grey, THE FALSE
//        TOMB's gold-lattice walls, THE PITS' damp green-black, THE DEEP WAY's near-black guard frieze, THE ANTECHAMBER's scarab frieze - and THE SEAL OF THE MOTHER, the tomb's landmark (A8),
//        a great carved scarab disc breathing teal light, cut into the back wall every ~26 columns so it is in view on almost every screen (and over the antechamber's wall, bigger)
//   drawBackdrop(g, cx, cy, VW, VH, L, time, dY)  the FACE's sky: far dunes, two far pyramids in the haze and THE PYRAMID'S OWN APEX with its gilded capstone - the thing you are climbing,
//        always in view up the flank (A8) - and the sandstorm's haze bands. It fades out as you go in under the stone.
// Baked once (the wall texture 192x96 per room style, the seal, the apex) and memoised; drawn world-aligned so it scrolls with the level and reads as a wall, not wallpaper.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline } from '../px.js';

const R = Math.round, TS = 16;
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

export const GLYPHS = [
  ['01110', '10101', '01110', '00100', '00000'], ['00000', '01010', '10101', '00000', '00000'], ['01110', '01010', '01110', '00100', '01110'], ['00110', '01111', '00110', '00100', '01010'],
  ['00100', '01110', '00100', '01110', '01010'], ['01110', '11111', '10101', '11111', '01110'], ['00100', '00100', '01100', '00100', '00100'], ['01110', '11111', '11111', '11111', '01110'],
  ['10001', '01010', '00100', '01010', '10001'], ['00100', '01110', '11111', '00100', '00100'], ['11011', '10001', '00100', '10001', '11011'], ['01010', '01010', '01110', '00100', '00100'],
];
export function glyph(g, x, y, n, col) { const G = GLYPHS[((n % GLYPHS.length) + GLYPHS.length) % GLYPHS.length]; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (G[r][c] === '1') px(g, x + c, y + r, col); }

/* ---- the room styles: wall ramp (dark -> lit), the joint, the frieze's recess and glyph, a trim colour, and a motif ---- */
const STYLE = {
  pyGallery:   { r: ['#241a12', '#2e2218', '#3a2c1e', '#483826'], joint: '#171009', rec: '#1a120c', gly: '#6a5030', trim: '#8a6a3a', motif: null, tone: 'rgba(40,24,10,0.18)' },
  pyShafts:    { r: ['#22201c', '#2c2924', '#38342c', '#46403a'], joint: '#14120f', rec: '#181613', gly: '#60584a', trim: '#7a7060', motif: null, tone: 'rgba(16,20,34,0.2)' },
  pyCorridor:  { r: ['#2a1e14', '#36281a', '#443422', '#54422c'], joint: '#1a1109', rec: '#1e140c', gly: '#8a6a30', trim: '#b08a3a', motif: 'lotus', tone: 'rgba(40,24,10,0.15)' },
  pyFalseTomb: { r: ['#2e2012', '#3c2a16', '#4c371c', '#5e4624'], joint: '#1c1209', rec: '#22160a', gly: '#d8aa40', trim: '#e0b44a', motif: 'lattice', tone: 'rgba(60,36,6,0.14)' },
  pyPits:      { r: ['#121a14', '#1a241c', '#243026', '#2e3c30'], joint: '#0a100c', rec: '#0e140f', gly: '#3a8a58', trim: '#4a8a58', motif: 'damp', tone: 'rgba(6,24,14,0.22)' },
  pyDeep:      { r: ['#16120f', '#1e1814', '#28201a', '#342a22'], joint: '#0c0907', rec: '#0f0b09', gly: '#5a4a38', trim: '#7a6648', motif: 'guards', tone: 'rgba(6,6,16,0.28)' },
  pyAntechamber: { r: ['#14110f', '#1c1814', '#26201a', '#322a22'], joint: '#0a0806', rec: '#0c0907', gly: '#2e9a68', trim: '#2e9a68', motif: 'scarabs', tone: 'rgba(4,16,10,0.26)' },
};
const TW = 192, TH = 96;
function wallTexture(st) {
  const S = STYLE[st] || STYLE.pyGallery;
  return once('wall' + st, () => {
    const [c, g] = canvas(TW, TH);
    for (let cr = 0; cr < 8; cr++) {
      const y0 = cr * 12, bw = [24, 32, 48, 32, 24, 48, 32, 24][cr], off = (hash(cr, 11) % (bw / 8)) * 8;
      for (let x = 0; x < TW; x += 1) for (let y = 0; y < 12; y++) {
        const bx = (x + off) % bw, bi = Math.floor((x + off) / bw), k = 1 + (hash(bi, cr * 3 + 1) % 3) - (hash(bi, cr + 9) % 6 === 0 ? 1 : 0);
        let col = S.r[Math.max(0, Math.min(3, k))];
        if (y === 11 || bx === bw - 1) col = S.joint; else if (y === 0 || bx === 0) col = S.r[Math.min(3, k + 1)]; else if (y === 10 || bx === bw - 2) col = S.r[Math.max(0, k - 1)];
        else if (hash(x + cr * 7, y + cr) % 17 === 0) col = S.r[Math.max(0, k - 1)]; else if (hash(x + 5, y + cr * 3) % 29 === 0) col = S.r[Math.min(3, k + 1)];
        px(g, x, y0 + y, col);
      }
    }
    /* the FRIEZE (course 4): a recessed strip, the glyph run, a trim line above and below */
    rect(g, 0, 48, TW, 12, S.rec); rect(g, 0, 48, TW, 1, S.joint); rect(g, 0, 50, TW, 1, S.trim); rect(g, 0, 58, TW, 1, S.joint);
    for (let i = 0; i < 16; i++) glyph(g, 3 + i * 12, 52, hash(i, st.length) % GLYPHS.length, S.gly);
    if (S.motif === 'lattice') {   /* THE FALSE TOMB: gold diamonds in a lattice (gilt over the plaster) on courses 1, 2, 6, 7 */
      for (const cr of [1, 2, 6, 7]) for (let i = 0; i < 8; i++) { const dx = 6 + i * 24 + (cr & 1) * 12, dy = cr * 12 + 6; px(g, dx, dy - 3, '#d8aa40'); for (let k = 1; k < 3; k++) { px(g, dx - k, dy - 3 + k, '#d8aa40'); px(g, dx + k, dy - 3 + k, '#d8aa40'); px(g, dx - 2 + k, dy + k, '#8a6a20'); px(g, dx + 2 - k, dy + k, '#8a6a20'); } px(g, dx, dy, '#f8e08a'); px(g, dx, dy + 3, '#8a6a20'); }
    } else if (S.motif === 'damp') {   /* THE PITS: damp stains running down from the courses' joints, a green bloom */
      for (let i = 0; i < 26; i++) { const dx = hash(i, 5) % TW, dy = (hash(i, 6) % 8) * 12 + 11, len = 6 + hash(i, 7) % 22; for (let k = 0; k < len; k++) { if (dy + k >= TH || (dy + k > 47 && dy + k < 60)) break; px(g, dx, dy + k, k < len - 2 ? '#0e1c14' : '#2a5a3c'); if (k % 5 === 2) px(g, dx + 1, dy + k, '#16281c'); } }
    } else if (S.motif === 'guards') {   /* THE DEEP WAY: a line of guards in profile marching round the course 1 and 7 (spear, shield, headdress) */
      for (const cr of [1, 7]) for (let i = 0; i < 8; i++) { const gx = 6 + i * 24, gy = cr * 12 + 10; const col = S.gly; rect(g, gx + 2, gy - 6, 3, 6, col); rect(g, gx + 2, gy - 9, 3, 3, col); px(g, gx + 4, gy - 8, S.rec); line(g, gx + 7, gy - 10, gx + 7, gy, col); px(g, gx + 7, gy - 11, '#8a7a5a'); rect(g, gx - 1, gy - 7, 3, 5, '#3a3024'); px(g, gx + 1, gy - 1, col); px(g, gx + 4, gy, col); }
    } else if (S.motif === 'scarabs') {   /* THE ANTECHAMBER: a ring of small scarabs on courses 1 and 7, teal-inlaid */
      for (const cr of [1, 7]) for (let i = 0; i < 12; i++) { const sx = 4 + i * 16, sy = cr * 12 + 3; ellipse(g, sx + 3, sy + 3, 3, 3.4, '#0c2a1c'); rect(g, sx + 3, sy, 1, 7, S.gly); px(g, sx + 2, sy + 2, '#5ad8a0'); px(g, sx, sy + 1, S.gly); px(g, sx + 6, sy + 1, S.gly); px(g, sx, sy + 5, S.gly); px(g, sx + 6, sy + 5, S.gly); }
    } else if (S.motif === 'lotus') {   /* THE HIGH CORRIDOR: a lotus-and-papyrus band on course 6 */
      for (let i = 0; i < 16; i++) { const lx = 4 + i * 12, ly = 6 * 12 + 4; rect(g, lx + 3, ly + 3, 1, 4, '#4a6a30'); px(g, lx + 2, ly + 2, '#c8a050'); px(g, lx + 3, ly + 1, '#e8c070'); px(g, lx + 4, ly + 2, '#c8a050'); px(g, lx + 1, ly + 3, '#a07a38'); px(g, lx + 5, ly + 3, '#a07a38'); }
    }
    /* a few cracks and a pocked block here and there */
    for (let i = 0; i < 7; i++) { let cx0 = hash(i, 21) % TW, cy0 = (hash(i, 22) % 7) * 12 + 1; if (cy0 > 44 && cy0 < 62) continue; for (let k = 0; k < 9; k++) { px(g, cx0, cy0, S.joint); cy0++; cx0 += hash(k, i) % 3 - 1; if (cy0 >= TH) break; } }
    return c;
  });
}
const ROOMGRAD = once('grad', () => { const [c, g] = canvas(1, 64); const gr = g.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(0,0,0,0.5)'); gr.addColorStop(0.18, 'rgba(0,0,0,0.12)'); gr.addColorStop(0.7, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.28)'); g.fillStyle = gr; g.fillRect(0, 0, 1, 64); return c; });

/* ---- THE SEAL OF THE MOTHER: a carved disc, the brood-queen cut in it, gold and teal inlay ---- */
export function sealRelief(size) {
  return once('seal' + size, () => {
    const s = size, h = s / 2, [c, g] = canvas(s, s);
    circle(g, h, h, h - 1, '#0e0a07'); circle(g, h, h, h - 2, '#6a5236'); circle(g, h, h, h - 3.4, '#4a3a26'); circle(g, h, h, h - 5, '#3a2c1c');
    for (let k = 0; k < 24; k++) { const a = k * Math.PI / 12; px(g, h + Math.cos(a) * (h - 2.6), h + Math.sin(a) * (h - 2.6), '#a08454'); }   /* the ring's studs */
    const u = s / 44;
    /* the scarab: wing-case split down the middle, head with horns, six legs, the sun disc held over it */
    const E = (x, y, rx, ry, col) => ellipse(g, h + x * u, h + y * u, rx * u, ry * u, col);
    E(0, 3, 9, 11, '#0c3a28'); E(-1, 1, 7.4, 9, '#14664a'); E(-3, -2, 3, 5, '#2aa078'); rect(g, h - 0.5 * u, h - 8 * u, Math.max(1, u), 21 * u, '#d8aa40');
    E(0, -12, 4.2, 3.4, '#0c3a28'); E(0, -12.4, 3.2, 2.4, '#14664a'); line(g, h - 3 * u, h - 14 * u, h - 6 * u, h - 19 * u, '#d8aa40'); line(g, h + 3 * u, h - 14 * u, h + 6 * u, h - 19 * u, '#d8aa40'); px(g, h - 2 * u, h - 12 * u, '#7affd8'); px(g, h + 2 * u, h - 12 * u, '#7affd8');
    for (const [dy, dx] of [[-5, 13], [2, 15], [9, 12]]) { for (const sg of [-1, 1]) { line(g, h + sg * 7 * u, h + dy * u, h + sg * dx * u, h + (dy - 4) * u, '#d8aa40'); line(g, h + sg * dx * u, h + (dy - 4) * u, h + sg * (dx + 3) * u, h + (dy + 3) * u, '#a08030'); } }
    circle(g, h, h - 20 * u + 1, 3.6 * u, '#d8aa40'); circle(g, h, h - 20 * u + 1, 2.4 * u, '#f8e08a'); px(g, h, h - 20 * u + 1, '#fff6c0');
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + 0.3; px(g, h + Math.cos(a) * 15 * u, h + Math.sin(a) * 15 * u + 6 * u, '#7affd8'); }
    outline(c, '#0a0705'); return c;
  });
}
const GLOW = once('sealglow', () => { const [c, g] = canvas(96, 96); const gr = g.createRadialGradient(48, 48, 6, 48, 48, 48); gr.addColorStop(0, 'rgba(90,255,200,0.34)'); gr.addColorStop(0.5, 'rgba(60,220,170,0.10)'); gr.addColorStop(1, 'rgba(60,220,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, 96, 96); return c; });

/* ---- the room: world-aligned wall, friezes, pilasters, the seal ---- */
export function drawRoom(g, st, sx, sy, w, h, x0, y0, time) {
  const S = STYLE[st] || STYLE.pyGallery, T = wallTexture(st), wx0 = x0 * TS, wy0 = y0 * TS;
  g.save(); g.beginPath(); g.rect(R(sx), R(sy), R(w), R(h)); g.clip();
  const ox = ((wx0 % TW) + TW) % TW, oy = ((wy0 % TH) + TH) % TH;
  for (let x = -ox; x < w; x += TW) for (let y = -oy; y < h; y += TH) g.drawImage(T, R(sx + x), R(sy + y));
  /* the ceiling's cavetto and the floor's shadow, the room's tone */
  g.globalAlpha = 1; g.drawImage(ROOMGRAD, 0, 0, 1, 64, R(sx), R(sy), R(w), R(h));
  g.fillStyle = S.tone; g.fillRect(R(sx), R(sy), R(w), R(h));
  /* PILASTERS every 12 tiles: a fluted shaft, a lotus capital, a base */
  const first = Math.ceil(x0 / 12) * 12, last = x0 + Math.ceil(w / TS);
  for (let tx = first; tx <= last; tx += 12) { const px0 = R(sx + (tx - x0) * TS), top = R(sy), bot = R(sy + h), pw = 10;
    g.fillStyle = S.r[2]; g.fillRect(px0, top, pw, bot - top); g.fillStyle = S.r[3]; g.fillRect(px0, top, 1, bot - top); g.fillStyle = S.joint; g.fillRect(px0 + pw - 1, top, 1, bot - top);
    g.fillStyle = S.r[1]; for (let f = 2; f < pw - 2; f += 3) g.fillRect(px0 + f, top + 8, 1, bot - top - 14);
    g.fillStyle = S.trim; g.fillRect(px0 - 2, top, pw + 4, 3); g.fillStyle = S.r[3]; g.fillRect(px0 - 2, top, pw + 4, 1); g.fillStyle = S.joint; g.fillRect(px0 - 2, top + 3, pw + 4, 1);   /* the capital */
    g.fillStyle = S.r[3]; g.fillRect(px0 - 1, top + 4, pw + 2, 2); g.fillStyle = S.r[1]; g.fillRect(px0, top + 6, pw, 2);
    g.fillStyle = S.joint; g.fillRect(px0 - 1, bot - 5, pw + 2, 5); g.fillStyle = S.r[2]; g.fillRect(px0 - 1, bot - 5, pw + 2, 1); }
  /* THE SEAL: every 26 columns, in the wall's upper middle, breathing teal (the landmark: A8) */
  if (h >= 4 * TS) { const size = st === 'pyAntechamber' ? 56 : h >= 8 * TS ? 52 : 40, k0 = Math.floor((x0 - 8) / 26) - 1, k1 = Math.ceil((x0 + w / TS) / 26);
    for (let k = k0; k <= k1; k++) { const tx = k * 26 + 8 + (hash(k, y0) % 5), cxs = R(sx + (tx - x0) * TS + TS / 2); if (cxs < sx - 60 || cxs > sx + w + 60) continue;
      const cys = R(sy + Math.min(h * 0.46, 8 + size * 0.7 + (h >= 8 * TS ? 26 : 0))); const pulse = 0.5 + 0.5 * Math.sin(time * 1.6 + k);
      g.globalAlpha = 0.55 + 0.35 * pulse; g.drawImage(GLOW, cxs - 48, cys - 48); g.globalAlpha = 1; g.drawImage(sealRelief(size), cxs - size / 2, cys - size / 2);
      g.globalAlpha = 0.22 + 0.22 * pulse; g.fillStyle = '#7affd8'; g.fillRect(cxs - 3, cys - 3, 2, 2); g.fillRect(cxs + 2, cys - 3, 2, 2); g.globalAlpha = 1; } }
  g.restore();
}

/* ---- the FACE: far dunes, far pyramids, THE APEX over the flank ---- */
function pyramidLayer(w, h, tone, lit) {   /* a distant pyramid silhouette: a lit left face, a shaded right face, courses as faint lines */
  return once('far' + w + tone, () => { const [c, g] = canvas(w, h);
    fillPoly(g, [[0, h], [w / 2, 0], [w, h]], tone[1]); fillPoly(g, [[0, h], [w / 2, 0], [w / 2 + 1, h]], tone[0]);
    for (let y = 4; y < h; y += 5) { g.fillStyle = tone[2]; const half = (w / 2) * (y / h); g.fillRect(R(w / 2 - half), y, R(half * 2), 1); }
    g.fillStyle = lit; for (let y = 0; y < h; y++) { const half = (w / 2) * (y / h); g.fillRect(R(w / 2 - half), y, 1, 1); }
    return c; });
}
const APEX = once('apex', () => {   /* the pyramid's upper courses and its gilded capstone, lit by a low sun on its left face */
  const W = 260, H = 190, [c, g] = canvas(W, H), ax = 150, ay = 6;
  /* the two faces */
  fillPoly(g, [[ax, ay], [ax + 140, H], [ax, H]], '#6a4a3a'); fillPoly(g, [[ax, ay], [ax - 150, H], [ax, H]], '#d2a266');
  /* the courses: each a step, a lit lip and a shadowed riser, the lit face's tone going down */
  for (let y = 22; y < H; y += 9) { const half = (y - ay) * 0.93; g.fillStyle = '#f0cc8c'; g.fillRect(R(ax - half), y, R(half), 1); g.fillStyle = '#9c7040'; g.fillRect(R(ax - half), y + 8, R(half), 1); g.fillStyle = '#3c2824'; g.fillRect(ax, y, R(half * 0.95), 1);
    for (let bx = ax - half + ((y / 9) % 2) * 9; bx < ax; bx += 18) { g.fillStyle = '#b88850'; g.fillRect(R(bx), y + 1, 1, 7); } }
  /* the capstone: a gilded pyramidion on a collar, a bright glint */
  fillPoly(g, [[ax, ay - 2], [ax + 14, 26], [ax - 14, 26]], '#d8aa40'); fillPoly(g, [[ax, ay - 2], [ax - 14, 26], [ax, 26]], '#f8e08a'); fillPoly(g, [[ax, ay - 2], [ax + 14, 26], [ax, 26]], '#a07a20');
  g.fillStyle = '#fff6c8'; g.fillRect(ax - 2, ay + 3, 2, 8); g.fillStyle = '#7a5a18'; g.fillRect(ax - 15, 26, 30, 2);
  /* weathering: dark streaks down the lit face */
  for (let i = 0; i < 14; i++) { const sy0 = 30 + hash(i, 3) % 140, sxx = ax - 12 - hash(i, 4) % 110; const len = 6 + hash(i, 5) % 16; g.fillStyle = 'rgba(80,50,24,0.4)'; g.fillRect(sxx, sy0, 1, len); }
  return c; });
const GLINT = once('glint', () => { const [c, g] = canvas(80, 80); const gr = g.createRadialGradient(40, 40, 2, 40, 40, 40); gr.addColorStop(0, 'rgba(255,240,170,0.7)'); gr.addColorStop(0.35, 'rgba(255,214,110,0.22)'); gr.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 80, 80); return c; });
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY = 0) {
  const open = 76 * TS, mid = cx + VW / 2, sky = Math.max(0, Math.min(1, (open - mid) / (10 * TS) + 0.5));
  if (sky < 0.999) { g.globalAlpha = 1 - sky; const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#0c0806'); gr.addColorStop(1, '#16100a'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); g.globalAlpha = 1; }   /* under the stone: where no room's wall covers (a hole in the floor) the dark, never the dusk */
  if (sky < 0.01) return;
  g.save(); g.globalAlpha = sky;
  /* the far dunes' heat haze, two far pyramids */
  const fp = pyramidLayer(120, 44, ['#a0607a', '#7a4a66', '#8a5470'], '#e8b8a0'), fp2 = pyramidLayer(80, 30, ['#b87a88', '#946474', '#a46e7e'], '#f0c8b0');
  g.drawImage(fp, R(VW * 0.12 - cx * 0.02), R(VH * 0.5 - 38 - cy * 0.02 + dY * 0.1)); g.drawImage(fp2, R(VW * 0.40 - cx * 0.02), R(VH * 0.5 - 24 - cy * 0.02 + dY * 0.1));
  /* the dunes: two lit silhouettes, the sand the pyramid stands in */
  { const dx = cx * 0.15; for (const [col, rim, base, amp, f2, ph] of [['#8a566a', '#e8a890', 0.56, 8, 0.011, 0], ['#a8705c', '#f4c488', 0.64, 12, 0.013, 2]]) { g.fillStyle = col; g.beginPath(); g.moveTo(0, VH); for (let x = 0; x <= VW; x += 4) g.lineTo(x, R(VH * base + Math.sin((x + dx) * f2 + ph) * amp + Math.sin((x + dx) * f2 * 2.3) * 3 - cy * 0.05)); g.lineTo(VW, VH); g.closePath(); g.fill();
      g.fillStyle = rim; for (let x = 0; x < VW; x += 2) g.fillRect(x, R(VH * base + Math.sin((x + dx) * f2 + ph) * amp + Math.sin((x + dx) * f2 * 2.3) * 3 - cy * 0.05), 2, 1); } }
  /* THE APEX: the pyramid you are on, its courses going up past the top of the screen, the capstone catching the sun - nearer as you climb */
  const k = Math.max(0, Math.min(1, cx / (62 * TS))), X = R(VW * 0.78 - cx * 0.06 - 40), Y = R(-6 + (1 - k) * 22 - cy * 0.03 + dY * 0.1);
  g.drawImage(APEX, X - 150, Y);
  g.globalAlpha = sky * (0.6 + 0.3 * Math.sin(time * 1.3)); g.drawImage(GLINT, X - 40, Y - 34); g.globalAlpha = sky;
  /* the storm's haze: bands of blown sand at their own speeds */
  for (let b = 0; b < 3; b++) { g.globalAlpha = sky * (0.07 + 0.03 * b); g.fillStyle = '#e8b878'; const by = R(VH * (0.2 + b * 0.22) + Math.sin(time * 0.4 + b) * 4); g.fillRect(0, by, VW, 12 + b * 6); }
  g.restore();
}
export const SPB = { drawRoom, drawBackdrop, sealRelief, glyph };
