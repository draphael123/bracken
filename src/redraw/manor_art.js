// src/redraw/manor_art.js - THE HOLLOW MANOR's art (claude/manorart, the SONNET ART PASS over claude/hollowmanor's greybox; MANOR_SHIPS stays false).
// A great empty house at night: grey stone, plaster, faded green damask, dust sheets, family portraits, candle amber for the light, and ONE accent - ghost-green (a possessed visor, a wisp,
// the Castellan). NO wood and no logs as a main material: the floors are flags, marble and carpet, the walls are stone and painted plaster, the gallery slabs are corbelled stone.
//   TILES     manorTile(t, x, y, at, T, L): per SECTION - the servants' hall (scullery flags, whitewash), the portrait gallery (marble chequer, damask frieze), the long gallery (carpet runner,
//             dark stone), the nursery wing (pale painted plaster, small tiles), the armoury door (iron-studded flags), the great hall (black marble, ghost-green veining). A ONE-WAY is a
//             corbelled stone gallery slab. A SHIFTING PANEL's cells are their own tiles: a plastered, gilt-moulded door leaf (trompe-l'oeil: this wall is the one that moves), the carpeted
//             stair, the bookcase.
//   BACKDROP  drawBackdrop: the room's back wall behind every open cell (paper / chair rail / panelling), tall windows that look out on the night (the great hall's tower and its one lit
//             window over the roofs, the landmark), moon beams, decor (pans, hearth, dust sheets, empty frames, busts, rocking horse, cot, dolls' house, banners, a dark chandelier).
//   PROPS     drawPortrait (3 faces; the figure steps out of the frame when its key is taken), drawSconce (a wall candle: lit / flickering / out), drawStand (the candelabra), drawCarried,
//             drawRack + drawPile (an empty suit / its heap), drawNurseryDoor (shut with keyholes / ajar), drawPedestal (the silver's cushion), drawEye (a panel's watching eye) +
//             drawAlt (where a panel could be), drawDoorway (the open door's frame), drawWisp, drawThrown (chair / plate / candlestick / book), drawExit (the stair to the road).
// Rect-based (px.js primitives only: it runs in tools/node-canvas.mjs and tools/manor-art-sheet.mjs). Baked once and memoised where it is a sprite. Axis-aligned only (no paths).
import { canvas, px, rect, line, circle, ellipse } from '../px.js';

export const MA = {
  ghost: '#9adfb0', ghostHi: '#e6fff0', ghostLo: '#4a8a68', amber: '#ffb04a', amberHi: '#ffe0a0', amberLo: '#a8541a',
  gilt: '#b8a050', giltHi: '#e8d890', giltLo: '#6a5a28', brass: '#b89a58', brassHi: '#f0d890', brassLo: '#6a5430',
  damask: '#35483c', damaskHi: '#4a6454', damaskLo: '#232f27', paper: '#2c3a32', plaster: '#8a8c80', plasterLo: '#5a5c54',
  iron: '#2e3236', ironHi: '#6a727a', sheet: '#c8cec8', sheetLo: '#8a928c', sheetDeep: '#5a625e', velvet: '#6a2a3a', velvetHi: '#a04458',
};
const ZP = {   /* the sections' stone */
  servant: { b: ['#4a4c48', '#52544e', '#464842', '#585a54'], hi: '#7a7c74', lo: '#2c2e2a', joint: '#1e201c', mid: '#3a3c38' },
  gallery: { b: ['#3e4642', '#444c48', '#3a423e', '#4a524e'], hi: '#6c7a72', lo: '#242a28', joint: '#181c1a', mid: '#2e3532' },
  long: { b: ['#343c3a', '#3a4240', '#303836', '#404846'], hi: '#5e6c68', lo: '#1e2422', joint: '#121615', mid: '#283030' },
  nursery: { b: ['#4c5256', '#545a5e', '#484e52', '#5a6064'], hi: '#8a929a', lo: '#2c3236', joint: '#1c2024', mid: '#3a4044' },
  door: { b: ['#3a3c40', '#404246', '#36383c', '#46484c'], hi: '#6a6e74', lo: '#222428', joint: '#16181a', mid: '#2c2e32' },
  hall: { b: ['#2c3030', '#323636', '#282c2c', '#383c3c'], hi: '#54605e', lo: '#181c1c', joint: '#0e1010', mid: '#202424' },
};
const ZONES = ['servant', 'gallery', 'long', 'nursery', 'door', 'hall'];
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = Math.round;
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };
const TS = 16;

/* WHICH SECTION a column is in (L.sections: servants' hall .. great hall) */
export function zoneOf(x, L) {
  const S = (L && L.sections) || []; const i = S.findIndex(s => x >= s.x0 && x < s.x1);
  return ZONES[i >= 0 ? i : x < 60 ? 0 : x < 140 ? 1 : x < 210 ? 2 : x < 274 ? 3 : x < 288 ? 4 : 5];
}
/* THE SHIFTING PANELS' CELLS: cell -> { panel, idx (in its own state's cells), n } */
const PANELS = new WeakMap();
export function panelOf(L, x, y) {
  let m = PANELS.get(L);
  if (!m) { m = new Map(); for (const p of (L.mn && L.mn.panels) || []) for (const set of [p.a, p.b]) set.forEach(([cx, cy], i) => m.set(cy * L.W + cx, { p, i, n: set.length })); PANELS.set(L, m); }
  return m.get(y * L.W + x) || null;
}

/* ================================ TILES (16 x 16) ================================ */
function ashlar(g, wx, wy, P) {
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
    const gx = wx + xx, gy = wy + yy, row = (gy / 8) | 0, off = (row & 1) * 6, cx = ((gx + off) % 12 + 12) % 12;
    let c = P.b[hash(gx >> 2, gy >> 1) & 3];
    if (gy % 8 === 0 || cx === 0) c = P.joint; else if (gy % 8 === 1) c = P.mid; else if (hash(gx, gy) % 21 === 0) c = P.hi; else if (hash(gx + 5, gy) % 15 === 0) c = P.lo;
    px(g, xx, yy, c);
  }
}
function edges(g, P, aL, aR, dn) {
  if (aL) { rect(g, 0, 0, 1, 16, P.hi); rect(g, 1, 0, 1, 16, P.mid); }
  if (aR) { rect(g, 15, 0, 1, 16, P.lo); rect(g, 14, 0, 1, 16, P.joint); }
  if (dn) { rect(g, 0, 14, 16, 1, P.lo); rect(g, 0, 15, 16, 1, P.joint); }
}
/* THE TOP FACE of a floor, per section */
function topFace(g, z, x, y, aL, aR, stair) {
  const wx = x * 16;
  if (stair) {   /* a faded green runner down the steps, a brass stair rod on the nosing */
    for (let xx = 0; xx < 16; xx++) { rect(g, xx, 0, 1, 1, '#5a7a64'); rect(g, xx, 1, 1, 2, ((xx + wx) % 6 < 3) ? '#3e5a48' : '#364e40'); }
    rect(g, 0, 3, 16, 1, MA.brass); rect(g, 0, 4, 16, 1, MA.brassLo); px(g, 1, 3, MA.brassHi); px(g, 14, 3, MA.brassHi); return;
  }
  if (z === 'servant') {   /* scullery flags, worn pale at the lip */
    rect(g, 0, 0, 16, 1, '#9a9c92'); rect(g, 0, 1, 16, 2, '#74766e'); rect(g, 0, 3, 16, 1, '#2c2e2a');
    if (x % 3 === 0) rect(g, 0, 0, 1, 4, '#2c2e2a'); for (let xx = 0; xx < 16; xx++) if (hash(wx + xx, y) % 8 === 0) px(g, xx, 1, '#5a5c54');
  } else if (z === 'gallery') {   /* a marble chequer, a gilt line */
    for (let xx = 0; xx < 16; xx++) { const lt = ((xx >> 3) + x) & 1; rect(g, xx, 0, 1, 3, lt ? '#6a7a70' : '#242a28'); px(g, xx, 0, lt ? '#9aaaa0' : '#3e4a44'); }
    rect(g, 0, 3, 16, 1, MA.giltLo); rect(g, 0, 4, 16, 1, '#181c1a');
  } else if (z === 'long') {   /* a threadbare runner: faded green, a gold edge, a fringe */
    for (let xx = 0; xx < 16; xx++) { rect(g, xx, 0, 1, 1, '#587a62'); rect(g, xx, 1, 1, 1, ((xx + wx) % 8 < 4) ? '#3e5c4a' : '#36503f'); rect(g, xx, 2, 1, 1, '#263a2e'); }
    for (let xx = 0; xx < 16; xx += 4) px(g, xx, 1, MA.gilt); rect(g, 0, 3, 16, 1, '#141c18');
    if (hash(x, y) % 5 === 0) { px(g, 5, 0, '#2a3a30'); px(g, 6, 0, '#2a3a30'); px(g, 6, 1, '#202e26'); }   /* worn through */
    if (aL) rect(g, 0, 0, 1, 4, MA.gilt); if (aR) rect(g, 15, 0, 1, 4, MA.giltLo);
  } else if (z === 'nursery') {   /* small pale painted tiles, a faded blue */
    for (let xx = 0; xx < 16; xx++) { const lt = ((xx >> 2) + x) & 1; rect(g, xx, 0, 1, 3, lt ? '#c8d0d4' : '#6a7a88'); px(g, xx, 0, lt ? '#eef2f4' : '#8a9aa8'); }
    rect(g, 0, 3, 16, 1, '#3a4450'); rect(g, 0, 4, 16, 1, '#1c2024');
  } else if (z === 'door') {   /* iron-studded flags */
    rect(g, 0, 0, 16, 1, '#8a8e94'); rect(g, 0, 1, 16, 2, '#62666c'); rect(g, 0, 3, 16, 1, '#16181a'); px(g, 3, 1, MA.ironHi); px(g, 12, 1, MA.ironHi);
  } else {   /* the great hall: black marble, ghost-green veins, a silver inlay line */
    rect(g, 0, 0, 16, 1, '#566462'); rect(g, 0, 1, 16, 2, '#1c2222'); rect(g, 0, 3, 16, 1, '#8aa09a'); rect(g, 0, 4, 16, 1, '#0c1010');
    for (let xx = 0; xx < 16; xx++) if (hash(wx + xx, y + 9) % 7 === 0) px(g, xx, 1 + (xx & 1), al(MA.ghost, 0.55));
  }
}
export function stoneTile(z, x, y, o) {
  const key = ['s', z, x % 6, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.dn ? 'D' : '', o.stair ? 'S' : '', o.deep ? 'P' : ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), P = ZP[z] || ZP.gallery; ashlar(g, x * 16, y * 16, P);
    if (o.deep) rect(g, 0, 0, 16, 16, 'rgba(4,8,8,0.30)');
    edges(g, P, o.aL, o.aR, o.dn);
    if (o.up) topFace(g, z, x, y, o.aL, o.aR, o.stair);
    if (o.dn && !o.up) {   /* a plaster cove under a ceiling; the rooms with a frieze have the faded damask band */
      rect(g, 0, 11, 16, 2, P.hi); rect(g, 0, 13, 16, 1, P.lo);
      if (z === 'gallery' || z === 'long' || z === 'nursery') { rect(g, 0, 6, 16, 4, z === 'nursery' ? '#5a6a78' : MA.damask); rect(g, 0, 6, 16, 1, MA.giltLo); rect(g, 0, 10, 16, 1, MA.giltLo); for (let xx = 2; xx < 16; xx += 5) px(g, xx, 8, z === 'nursery' ? '#c8d0d4' : MA.damaskHi); }
      if (z === 'hall') { rect(g, 0, 8, 16, 1, '#8aa09a'); px(g, 4, 9, al(MA.ghost, 0.6)); px(g, 11, 9, al(MA.ghost, 0.6)); }
    }
    return c; });
}
/* A ONE-WAY: a corbelled stone gallery slab (a balcony, a table, a ledge) */
export function galleryTile(z, x, aL, aR) {
  return once('gl' + z + (aL ? 'L' : '') + (aR ? 'R' : '') + (x & 1), () => { const [c, g] = canvas(16, 16), P = ZP[z] || ZP.gallery;
    rect(g, 0, 0, 16, 6, P.b[1]); rect(g, 0, 0, 16, 1, P.hi); rect(g, 0, 1, 16, 1, MA.giltLo); rect(g, 0, 4, 16, 1, P.lo); rect(g, 0, 5, 16, 1, P.joint);
    for (const sx of [3, 12]) { px(g, sx, 2, MA.giltHi); px(g, sx, 3, MA.giltLo); }
    rect(g, 0, 6, 16, 1, 'rgba(4,8,8,0.5)');
    if (aL) { rect(g, 0, 0, 1, 6, P.hi); for (let k = 0; k < 5; k++) rect(g, 1 + k, 6 + k, 3 - Math.min(2, k), 1, P.mid); }
    if (aR) { rect(g, 15, 0, 1, 6, P.lo); for (let k = 0; k < 5; k++) rect(g, 12 - k + Math.min(2, k), 6 + k, 3 - Math.min(2, k), 1, P.mid); }
    return c; });
}
/* THE SHIFTING PANELS */
const GROOVES = [1, 14];
export function panelTile(kind, i, n, z, o) {
  if (kind === 'stair') return stoneTile(z, 0, 0, { ...o, stair: true, up: o.up });
  return once('pn' + kind + i + '_' + n + (o.up ? 'U' : ''), () => { const [c, g] = canvas(16, 16);
    if (kind === 'bookcase') {   /* a carved case, the books grey and green and oxblood, a cornice on top */
      rect(g, 0, 0, 16, 16, '#18221c'); rect(g, 0, 0, 2, 16, '#3a4a40'); rect(g, 14, 0, 2, 16, '#26342c'); rect(g, 0, 0, 1, 16, '#5a6e60');
      for (const sy of [7, 15]) { rect(g, 0, sy, 16, 1, '#5a6e60'); rect(g, 0, sy + (sy === 15 ? 0 : 1), 16, 1, '#141c18'); }
      const cols = ['#4a5a50', '#2c4a3c', '#6a3030', '#5a5a48', '#3a4a5a', '#7a6a4a'];
      for (const [r0, hh] of [[1, 6], [9, 6]]) { let xx = 2; while (xx < 14) { const h = hash(xx + i * 7, r0 + i), w = 2 + (h % 2), bh = Math.min(hh, 3 + ((h >>> 3) % 4)); if (h % 9 === 0) { xx += 2; continue; }
        rect(g, xx, r0 + hh - bh, w, bh, cols[(h >>> 5) % cols.length]); rect(g, xx, r0 + hh - bh, 1, bh, al('#ffffff', 0.16)); if (bh > 4) rect(g, xx, r0 + hh - bh + 2, w, 1, MA.giltLo); xx += w; } }
      if (i === 0) { rect(g, 0, 0, 16, 4, '#3a4a40'); rect(g, 0, 0, 16, 1, '#8aa090'); rect(g, 0, 3, 16, 1, '#141c18'); rect(g, 0, 1, 16, 1, MA.giltLo); }
      px(g, 0, 7, MA.gilt); px(g, 15, 7, MA.giltLo);
      return c; }
    /* a door leaf, painted on the plaster: a faded green panel, gilt mouldings, a painted handle - the wall that is not quite a wall */
    rect(g, 0, 0, 16, 16, '#3a5242'); rect(g, 0, 0, 1, 16, '#6a8a74'); rect(g, 15, 0, 1, 16, '#1e2e24');
    rect(g, 2, 0, 1, 16, MA.giltLo); rect(g, 13, 0, 1, 16, MA.giltLo);
    if (i === 0) { rect(g, 2, 0, 12, 2, MA.giltLo); rect(g, 3, 2, 10, 1, MA.gilt); px(g, 8, 4, MA.giltHi); px(g, 7, 5, MA.giltLo); px(g, 9, 5, MA.giltLo); }
    if (i > 0 && i < n - 1) { rect(g, 4, 2, 8, 1, MA.gilt); rect(g, 4, 2, 1, 12, MA.gilt); rect(g, 11, 2, 1, 12, MA.giltLo); rect(g, 4, 13, 8, 1, MA.giltLo); circle(g, 11, 8, 1.6, MA.brassHi); px(g, 11, 8, MA.brass); }
    if (i === n - 1) { rect(g, 2, 13, 12, 3, '#26342c'); rect(g, 2, 13, 12, 1, MA.gilt); px(g, 4, 14, MA.ironHi); px(g, 11, 14, MA.ironHi); }
    if (n === 1) rect(g, 4, 3, 8, 10, '#2a3c30');
    return c; });
}
/* THE WALL BEHIND (a 16 x 16 per section and band: 'paper' above the rail, 'rail' (the chair rail), 'wain' (the panelling under it)) */
export function wallTile(z, x, band) {
  const k = 'w' + z + band + (x & 3);
  return once(k, () => { const [c, g] = canvas(16, 16);
    const base = { servant: '#4a4c46', gallery: MA.paper, long: '#222e28', nursery: '#454e56', door: '#26282c', hall: '#1c2020' }[z];
    rect(g, 0, 0, 16, 16, base);
    if (band === 'paper') {
      if (z === 'servant') { for (let i = 0; i < 24; i++) px(g, hash(x * 9 + i, 3) % 16, hash(i, x * 5 + 1) % 16, hash(i, x) & 1 ? '#54564f' : '#3e403a'); rect(g, 3 + (x & 3) * 3, 0, 1, 7, '#3a3c36'); }   /* damp stains */
      else if (z === 'gallery' || z === 'long') { const sh = (x & 1) * 8, lt = z === 'gallery' ? MA.damaskHi : '#2e4236';
        for (let dy = -4; dy <= 4; dy++) { const w = 4 - Math.abs(dy), yy = (8 + dy + sh) & 15; px(g, 8 - w, yy, lt); px(g, 8 + w, yy, lt); } px(g, 8, (8 + sh) & 15, MA.giltLo); px(g, 0, (0 + sh) & 15, lt); px(g, 15, (0 + sh) & 15, lt); }
      else if (z === 'nursery') { for (let xx = 0; xx < 16; xx += 4) rect(g, xx, 0, 2, 16, '#4e5860'); if (x & 1) { rect(g, 6, 5, 4, 3, '#6a7a88'); px(g, 5, 6, '#6a7a88'); px(g, 10, 5, '#8a9aa8'); px(g, 7, 4, '#8a9aa8'); rect(g, 7, 8, 2, 1, '#2a3036'); } }   /* a stencilled duck */
      else { ashlar(g, x * 16, 0, ZP[z]); rect(g, 0, 0, 16, 16, 'rgba(4,8,8,0.45)'); }
    } else if (band === 'rail') {
      if (z === 'door' || z === 'hall') { ashlar(g, x * 16, 5, ZP[z]); rect(g, 0, 0, 16, 16, 'rgba(4,8,8,0.45)'); rect(g, 0, 11, 16, 2, '#4a5654'); rect(g, 0, 11, 16, 1, '#8aa09a'); }
      else { rect(g, 0, 10, 16, 6, z === 'servant' ? '#3a3c38' : z === 'nursery' ? '#3a444c' : '#18241c'); rect(g, 0, 9, 16, 1, MA.giltHi); rect(g, 0, 10, 16, 1, MA.gilt); rect(g, 0, 11, 16, 1, MA.giltLo); }
    } else {
      if (z === 'door' || z === 'hall') { ashlar(g, x * 16, 80, ZP[z]); rect(g, 0, 0, 16, 16, 'rgba(4,8,8,0.40)'); }
      else { const dk = z === 'servant' ? '#34362f' : z === 'nursery' ? '#323c44' : '#18241c', md = z === 'servant' ? '#42443d' : z === 'nursery' ? '#3c4850' : '#223226';
        rect(g, 0, 0, 16, 16, dk); rect(g, 2, 2, 12, 12, md); rect(g, 2, 2, 12, 1, al('#ffffff', 0.12)); rect(g, 2, 13, 12, 1, al('#000000', 0.35)); rect(g, 2, 2, 1, 12, al('#ffffff', 0.08)); rect(g, 13, 2, 1, 12, al('#000000', 0.3)); }
    }
    rect(g, 0, 0, 16, 16, 'rgba(0,0,0,0.14)');   /* the back wall sits behind the light */
    return c; });
}

/* main.js asks for a tile of every SOLID / ONEWAY cell of the manor (null = the stock ground) */
export function manorTile(t, x, y, at, T, L) {
  if (!L || !L.manor) return null;
  const z = zoneOf(x, L), open = (a, b) => at(a, b) !== T.SOLID || !!panelOf(L, a, b);
  if (t === T.ONEWAY) return galleryTile(z, x, at(x - 1, y) !== T.ONEWAY, at(x + 1, y) !== T.ONEWAY);
  if (t !== T.SOLID) return null;
  const pn = panelOf(L, x, y);
  if (pn) return panelTile(pn.p.kind, pn.i, pn.n, z, { up: at(x, y - 1) !== T.SOLID, aL: at(x - 1, y) !== T.SOLID, aR: at(x + 1, y) !== T.SOLID, dn: at(x, y + 1) !== T.SOLID });
  const up = open(x, y - 1), dn = open(x, y + 1), aL = open(x - 1, y), aR = open(x + 1, y);
  const deep = !up && !aL && !aR && !dn && at(x, y - 2) === T.SOLID && at(x, y - 3) === T.SOLID && y > 4;
  return stoneTile(z, x, y, { up, dn, aL, aR, deep });
}

/* ================================ THE BACKDROP ================================ */
const rowBand = y => (y < 26 ? 'paper' : y === 26 ? 'rail' : 'wain');
const clipRect = (g, x, y, w, h, bx, by, bw, bh, col) => { const x0 = Math.max(x, bx), y0 = Math.max(y, by), x1 = Math.min(x + w, bx + bw), y1 = Math.min(y + h, by + bh); if (x1 > x0 && y1 > y0) rect(g, x0, y0, x1 - x0, y1 - y0, col); };
/* A WINDOW onto the night (sx, sy = its top-left on screen; w x h px; arched). inside it: the sky, a moon, roofs - and, far off, THE GREAT HALL'S TOWER with its one lit window (the landmark) */
function drawWindow(g, sx, sy, w, h, time, tower, cxc) {
  rect(g, sx - 3, sy - 3, w + 6, h + 6, '#2a302e'); rect(g, sx - 3, sy - 3, w + 6, 1, '#5a6a62'); rect(g, sx - 3, sy - 3, 1, h + 6, '#4a5a52'); rect(g, sx + w + 2, sy - 3, 1, h + 6, '#161a18');
  for (let r = 0; r < h; r++) { const k = r / h, col = k < 0.5 ? '#0a1214' : k < 0.8 ? '#10201f' : '#1a2e2c'; rect(g, sx, sy + r, w, 1, col); }
  const rr = 5; for (let r = 0; r < rr; r++) { const cut = rr - r; rect(g, sx - 3, sy - 3 + r, cut, 1, '#161a18'); rect(g, sx + w + 3 - cut, sy - 3 + r, cut, 1, '#161a18'); }
  for (let i = 0; i < 6; i++) px(g, sx + 3 + (hash(i, cxc) % (w - 6)), sy + 3 + (hash(cxc, i) % Math.max(4, h >> 1)), '#c8e0d8');   /* stars */
  clipRect(g, sx + w - 11, sy + 6, 5, 5, sx, sy, w, h, '#dce8e0'); clipRect(g, sx + w - 10, sy + 5, 3, 7, sx, sy, w, h, '#dce8e0');   /* a moon */
  if (tower !== null) { const tx = R(tower), yb = sy + h;
    clipRect(g, tx, sy + h - 34, 16, 34, sx, sy, w, h, '#0c1618'); clipRect(g, tx - 2, sy + h - 38, 20, 5, sx, sy, w, h, '#0c1618'); for (let k = 0; k < 4; k++) clipRect(g, tx - 2 + k * 6, sy + h - 41, 3, 3, sx, sy, w, h, '#0c1618');
    clipRect(g, tx + 6, sy + h - 26, 4, 7, sx, sy, w, h, al(MA.ghost, 0.55 + 0.25 * Math.sin(time * 1.3))); clipRect(g, tx + 7, sy + h - 25, 2, 5, sx, sy, w, h, al(MA.ghostHi, 0.5));
    for (let k = 0; k < 7; k++) clipRect(g, sx + k * 11 - 4, yb - 7 - (k & 1) * 3, 12, 12, sx, sy, w, h, '#0a1214'); }
  else for (let k = 0; k < 5; k++) clipRect(g, sx + k * 12 - 3, sy + h - 6 - (k & 1) * 3, 13, 10, sx, sy, w, h, '#0a1214');
  rect(g, sx + (w >> 1) - 1, sy, 2, h, '#1c2220'); rect(g, sx, sy + (h >> 1) - 1, w, 2, '#1c2220'); rect(g, sx, sy + h, w, 3, '#5a6a62'); rect(g, sx - 2, sy + h + 2, w + 4, 2, '#3a4640');   /* the glazing bars, the sill */
}
/* THE DECOR (world column slots; nothing here is solid) */
function decorAt(g, z, col, sx, floorY, time) {
  const h = hash(col, 7) % 5;
  if (z === 'servant') {
    if (h === 0 || h === 3) { rect(g, sx - 10, floorY - 78, 28, 2, MA.iron); for (let k = 0; k < 3; k++) { const px0 = sx - 6 + k * 9; rect(g, px0, floorY - 76, 1, 5, MA.iron); circle(g, px0, floorY - 66, 4, '#7a5a2a'); circle(g, px0 - 1, floorY - 67, 2, '#c8985a'); rect(g, px0 - 4, floorY - 70, 8, 1, '#4a3418'); } }   /* copper pans on a rail */
    else if (h === 1) { rect(g, sx - 14, floorY - 40, 28, 40, '#3a3c38'); rect(g, sx - 11, floorY - 36, 22, 36, '#0e1010'); rect(g, sx - 16, floorY - 44, 32, 5, '#5a5c54'); rect(g, sx - 16, floorY - 44, 32, 1, '#8a8c84'); rect(g, sx - 5, floorY - 16, 10, 6, '#242628'); rect(g, sx - 6, floorY - 18, 12, 2, '#3a3c3e'); rect(g, sx - 8, floorY - 3, 16, 3, '#1c1e1e'); }   /* a cold hearth, an iron pot */
    else if (h === 2) { rect(g, sx - 12, floorY - 12, 24, 12, MA.sheet); rect(g, sx - 12, floorY - 12, 24, 2, '#e8ece8'); rect(g, sx - 9, floorY - 18, 18, 7, MA.sheetLo); rect(g, sx - 13, floorY - 4, 3, 4, MA.sheetLo); rect(g, sx + 10, floorY - 5, 3, 5, MA.sheetLo); rect(g, sx - 5, floorY - 7, 1, 7, MA.sheetDeep); }   /* a dust-sheeted table */
  } else if (z === 'gallery') {
    if (h === 0 || h === 2) { const fy = floorY - 76; rect(g, sx - 11, fy, 22, 30, MA.giltLo); rect(g, sx - 10, fy + 1, 20, 28, MA.gilt); rect(g, sx - 8, fy + 3, 16, 24, '#1c2a22'); rect(g, sx - 8, fy + 3, 16, 1, '#0c1410'); rect(g, sx - 4, fy + 8, 8, 10, '#2e4036'); rect(g, sx - 3, fy + 20, 6, 6, '#26382e'); px(g, sx + 6, fy + 3, MA.giltHi); }   /* an empty frame: where somebody hung */
    else if (h === 1) { rect(g, sx - 13, floorY - 20, 26, 20, MA.sheet); rect(g, sx - 13, floorY - 20, 26, 2, '#e8ece8'); rect(g, sx - 10, floorY - 30, 20, 11, MA.sheetLo); rect(g, sx - 8, floorY - 34, 16, 5, MA.sheetLo); rect(g, sx - 3, floorY - 15, 1, 15, MA.sheetDeep); rect(g, sx + 6, floorY - 12, 1, 12, MA.sheetDeep); }   /* a sofa under a dust sheet */
  } else if (z === 'long') {
    if (h === 0 || h === 4) { rect(g, sx - 6, floorY - 28, 12, 28, '#3a4644'); rect(g, sx - 7, floorY - 30, 14, 3, '#586864'); rect(g, sx - 7, floorY - 3, 14, 3, '#586864'); circle(g, sx, floorY - 38, 7, '#8a9a94'); rect(g, sx - 6, floorY - 36, 12, 8, '#8a9a94'); rect(g, sx - 3, floorY - 40, 2, 2, '#1c2624'); rect(g, sx + 2, floorY - 40, 2, 2, '#1c2624'); rect(g, sx - 8, floorY - 33, 16, 2, '#6a7a74'); }   /* a bust on a plinth */
    else if (h === 1) { rect(g, sx - 5, floorY - 96, 10, 96, '#2c3634'); rect(g, sx - 5, floorY - 96, 2, 96, '#4e5e5a'); rect(g, sx + 3, floorY - 96, 2, 96, '#141a18'); rect(g, sx - 8, floorY - 98, 16, 4, '#4e5e5a'); rect(g, sx - 8, floorY - 5, 16, 5, '#4e5e5a'); }   /* a pier */
  } else if (z === 'nursery') {
    if (h === 0) { const hy = floorY; rect(g, sx - 14, hy - 8, 28, 6, '#5a6a78'); rect(g, sx - 14, hy - 8, 28, 1, '#8a9aa8'); rect(g, sx - 12, hy - 20, 2, 12, '#6a7a88'); rect(g, sx + 10, hy - 22, 2, 14, '#6a7a88'); rect(g, sx - 12, hy - 24, 24, 3, '#8a2a3a'); circle(g, sx - 12, hy - 4, 5, '#4a5866'); circle(g, sx + 12, hy - 4, 5, '#4a5866'); rect(g, sx - 17, hy - 22, 6, 4, '#8a2a3a'); rect(g, sx - 18, hy - 19, 2, 8, '#c8d0d4'); rect(g, sx + 12, hy - 16, 4, 2, '#c8d0d4'); }   /* a painted rocking horse */
    else if (h === 1) { rect(g, sx - 16, floorY - 22, 32, 4, '#c8d0d4'); rect(g, sx - 16, floorY - 22, 2, 22, '#c8d0d4'); rect(g, sx + 14, floorY - 22, 2, 22, '#c8d0d4'); rect(g, sx - 14, floorY - 14, 28, 8, '#8a9aa8'); rect(g, sx - 14, floorY - 14, 28, 2, '#e8ecf0'); rect(g, sx - 10, floorY - 36, 20, 2, '#a0b0be'); rect(g, sx - 14, floorY - 36, 2, 16, '#a0b0be'); rect(g, sx + 12, floorY - 36, 2, 16, '#a0b0be'); }   /* a cot, curtained */
    else if (h === 2) { const dy = floorY - 20; rect(g, sx - 12, dy, 24, 20, '#6a7a88'); rect(g, sx - 12, dy, 24, 2, '#a0b0be'); for (const [dx2, ddy] of [[-9, 4], [3, 4], [-9, 12], [3, 12]]) { rect(g, sx + dx2, dy + ddy, 6, 5, '#1c2630'); px(g, sx + dx2 + 1, dy + ddy + 1, al(MA.amber, 0.35)); } rect(g, sx - 14, dy - 5, 28, 5, '#8a2a3a'); rect(g, sx - 12, dy - 8, 24, 3, '#a04458'); rect(g, sx - 3, dy + 12, 6, 8, '#2a3440'); }   /* a dolls' house (it is this house) */
    else if (h === 3) { rect(g, sx - 8, floorY - 8, 8, 8, '#8a2a3a'); rect(g, sx, floorY - 8, 8, 8, '#2a5a8a'); rect(g, sx - 4, floorY - 16, 8, 8, '#c8a84a'); px(g, sx - 6, floorY - 6, '#e8d0d4'); px(g, sx + 3, floorY - 5, '#c8e0f0'); px(g, sx - 1, floorY - 13, '#fff0b0'); }   /* a stack of blocks */
  } else if (z === 'door') {
    if (h !== 4) { rect(g, sx - 9, floorY - 74, 18, 3, '#6a727a'); const hx = sx - 8; for (let k = 0; k < 9; k++) { rect(g, hx + k, floorY - 71 + k, 2, 2, '#9aa2aa'); rect(g, hx + 17 - k, floorY - 71 + k, 2, 2, '#9aa2aa'); } rect(g, sx - 5, floorY - 62, 10, 12, '#4a5258'); rect(g, sx - 5, floorY - 62, 10, 2, '#8a929a'); rect(g, sx - 1, floorY - 58, 2, 6, MA.brassLo); }   /* crossed halberds over a shield */
  } else {
    if (h === 0 || h === 2) { rect(g, sx - 8, floorY - 120, 16, 2, MA.iron); rect(g, sx - 7, floorY - 118, 14, 52, '#2e3a34'); rect(g, sx - 7, floorY - 118, 14, 1, '#4e5e56'); for (let k = 0; k < 7; k++) rect(g, sx - 7 + k * 2, floorY - 66 + (k & 1) * 3, 2, 4, '#1c2420'); rect(g, sx - 1, floorY - 100, 2, 16, al(MA.ghost, 0.35)); rect(g, sx - 3, floorY - 94, 6, 2, al(MA.ghost, 0.35)); }   /* a tattered banner */
    else if (h === 1) { rect(g, sx, floorY - 160, 1, 56, '#2a3030'); circle(g, sx, floorY - 100, 12, '#2c3434'); circle(g, sx, floorY - 100, 9, '#12181a'); for (let k = 0; k < 5; k++) { const a = k * 1.2566, cx2 = R(sx + Math.cos(a) * 11), cy2 = R(floorY - 100 + Math.sin(a) * 11); rect(g, cx2 - 1, cy2 - 6, 2, 5, '#cfc8b0'); px(g, cx2, cy2 - 7, '#3a3e3e'); } }   /* a chandelier, dark and cold */
  }
}
/* THE WALL, THE WINDOWS, THE DECOR - behind every open cell. at = live grid read */
export function drawBackdrop(g, cx, cy, VW, VH, time, L, at, T) {
  if (!L || !L.manor) return;
  const c0 = Math.max(0, Math.floor(cx / TS)), c1 = Math.min(L.W - 1, Math.floor((cx + VW) / TS)), r0 = Math.max(0, Math.floor(cy / TS)), r1 = Math.min(L.H - 1, Math.floor((cy + VH) / TS));
  for (let y = r0; y <= r1; y++) for (let x = c0; x <= c1; x++) { if (at(x, y) === T.SOLID) continue; g.drawImage(wallTile(zoneOf(x, L), x, rowBand(y)), x * TS - cx, y * TS - cy); }
  const towerX = VW * 0.5 + (300 * TS - cx) * 0.12, air = (a0, a1, b0, b1) => { for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) if (at(a, b) === T.SOLID) return false; return true; };
  for (let x = c0 - 1; x <= c1 + 1; x++) { const z = zoneOf(x, L), sx = x * TS - cx;
    if (z === 'servant') { if (x % 10 === 4 && x > 12 && air(x, x + 1, 13, 15)) drawWindow(g, sx, 13 * TS - cy, 22, 36, time, null, x); continue; }
    const wide = z === 'hall' ? 16 : 12, slot = z === 'hall' ? 8 : 5;
    if (x % wide === slot) { for (const [ya, yb] of [[21, 27], [11, 18]]) if (air(x, x + 1, ya, yb)) { const sy = ya * TS - cy, hh = (yb - ya + 1) * TS - 6, w = 22;
        if (z === 'long' || z === 'gallery') for (let k = 0; k < 70; k += 2) rect(g, sx + 2 + k * 0.5, sy + hh + 6 + k, 18, 2, 'rgba(176,216,200,0.045)');   /* the moon beam on the floor */
        drawWindow(g, sx, sy, w, hh, time, towerX > sx - 22 && towerX < sx + 26 ? towerX : null, x); } } }
  for (let x = c0 - 2; x <= c1 + 2; x++) { if (x % 6 !== 2) continue; const z = zoneOf(x, L); let fy = null;
    for (let y = 29; y < L.H; y++) if (at(x, y) === T.SOLID || at(x, y) === T.ONEWAY) { fy = y; break; }
    if (fy === null || fy > 36) continue; if (!air(x - 1, x + 1, fy - 5, fy - 1)) continue;
    if (L.mn && L.mn.panels.some(p => p.a.concat(p.b).some(([a, b]) => Math.abs(a - x) < 2 && Math.abs(b - fy) < 9))) continue;
    decorAt(g, z, x, x * TS + 8 - cx, fy * TS - cy, time); }
}

/* ================================ THE PROPS ================================ */
/* A PORTRAIT (x, y = the frame's centre): a gilt frame, a family face; when its key is taken the figure has stepped out (an empty dark canvas, the frame askew) */
export function drawPortrait(g, x, y, got, time, idx = 0) {
  x = R(x); y = R(y) + (got ? 1 : 0); const sh = got ? 1 : 0;
  rect(g, x - 11, y - 14 + sh, 22, 28, MA.giltLo); rect(g, x - 10, y - 13 + sh, 20, 26, MA.gilt); rect(g, x - 10, y - 13 + sh, 20, 1, MA.giltHi); rect(g, x - 10, y - 13 + sh, 1, 26, MA.giltHi); px(g, x - 11, y - 14, MA.giltHi); px(g, x + 10, y - 14, MA.giltHi); px(g, x - 11, y + 12, MA.giltHi); px(g, x + 10, y + 12, MA.giltHi);
  const cv = got ? '#12181a' : ['#2a3c46', '#3c2e3a', '#2e3a2c'][idx % 3]; rect(g, x - 8, y - 11 + sh, 16, 22, cv); rect(g, x - 8, y - 11 + sh, 16, 1, '#0a0e10');
  if (got) { rect(g, x - 6, y + 4, 12, 1, '#2a3238'); px(g, x - 3, y - 4, '#2a3238'); px(g, x + 2, y - 2, '#2a3238'); rect(g, x - 1, y + 12, 2, 4, '#8a8c80'); return; }   /* the figure is gone: only a chair back and dust */
  const skin = '#c8b8a0', tone = ['#6a7a8a', '#8a4a5a', '#5a7a5a'][idx % 3];
  rect(g, x - 6, y + 2, 12, 9, tone); rect(g, x - 5, y + 1, 10, 2, tone);                                   /* shoulders */
  rect(g, x - 3, y - 7, 6, 8, skin); rect(g, x - 3, y - 8, 6, 2, idx === 1 ? '#3a2a24' : idx === 2 ? '#8a8a82' : '#4a3a30');   /* a face, hair */
  if (idx === 0) rect(g, x - 2, y - 2, 4, 1, '#4a3a30'); else if (idx === 1) { rect(g, x - 2, y - 1, 4, 1, '#8a3a3a'); px(g, x - 4, y - 6, '#4a3a30'); px(g, x + 3, y - 6, '#4a3a30'); } else rect(g, x - 3, y - 3, 6, 1, '#6a6a62');
  const fl = 0.35 + 0.35 * Math.max(0, Math.sin(time * 1.7 + idx * 2)); px(g, x - 2, y - 5, al(MA.ghost, fl)); px(g, x + 1, y - 5, al(MA.ghost, fl));   /* the eyes catch a green light */
  rect(g, x - 1, y + 13, 2, 1, MA.brassHi); rect(g, x, y + 14, 1, 3, MA.brass); rect(g, x - 1, y + 17, 3, 2, MA.brassHi); px(g, x, y + 17, MA.brass);   /* the key on its ribbon, under the frame */
}
/* A WALL CANDLE (x = its centre, y = the cell's bottom): a sconce, a candle. lit / flickering (a told one) / out (a thread of smoke) */
export function drawSconce(g, x, y, lit, flick, time, k = 0) {
  x = R(x); y = R(y);
  rect(g, x - 5, y - 16, 10, 12, '#2a2e2c'); rect(g, x - 5, y - 16, 10, 1, '#5a625e'); rect(g, x - 5, y - 16, 1, 12, '#4a524e'); rect(g, x + 4, y - 16, 1, 12, '#101412'); px(g, x - 3, y - 14, MA.brass); px(g, x + 3, y - 14, MA.brass);
  rect(g, x - 4, y - 5, 8, 2, MA.brass); rect(g, x - 4, y - 5, 8, 1, MA.brassHi); rect(g, x - 2, y - 3, 4, 2, MA.brassLo);
  rect(g, x - 1, y - 12, 3, 7, '#d8d0c0'); rect(g, x - 1, y - 12, 1, 7, '#fff6e8'); rect(g, x + 1, y - 12, 1, 7, '#a8a090'); if (!lit) { rect(g, x - 1, y - 12, 3, 1, '#6a665a'); }
  if (lit) { const f = flick && (time * 14) % 2 < 1; if (f) { px(g, x, y - 14, MA.amberLo); return; }
    const sw = Math.sin(time * 9 + k + x) * 1, h = flick ? 3 : 5; rect(g, x - 1 + (sw > 0 ? 1 : 0), y - 12 - h, 2, h, MA.amber); rect(g, x, y - 12 - h + 1, 1, h - 1, MA.amberHi); px(g, x, y - 12, '#fff6d8');
    rect(g, x - 7, y - 24, 14, 20, al(MA.amber, 0.05 + (flick ? 0 : 0.04))); }
  else { px(g, x, y - 13, '#2a2a28'); const ph = (time * 0.8 + k * 0.37) % 1; px(g, x + Math.round(Math.sin(time * 3 + k) * 1), y - 14 - R(ph * 12), al('#8a9a90', 0.55 * (1 - ph))); px(g, x + 1, y - 18 - R(ph * 8), al('#8a9a90', 0.3 * (1 - ph))); }
}
/* THE CANDELABRA STAND (x = its centre, y = its feet): iron, three arms, three flames */
export function drawStand(g, x, y, time, k = 0) {
  x = R(x); y = R(y);
  rect(g, x - 6, y - 2, 12, 2, MA.brassLo); rect(g, x - 4, y - 4, 8, 2, MA.brass); rect(g, x - 1, y - 22, 2, 18, MA.brass); rect(g, x - 1, y - 22, 1, 18, MA.brassHi); rect(g, x - 2, y - 14, 4, 2, MA.brassLo);
  rect(g, x - 7, y - 24, 14, 2, MA.brass); rect(g, x - 7, y - 24, 14, 1, MA.brassHi); px(g, x - 8, y - 25, MA.brass); px(g, x + 7, y - 25, MA.brass); rect(g, x - 7, y - 27, 1, 3, MA.brass); rect(g, x + 6, y - 27, 1, 3, MA.brass);
  for (const d of [-6, 0, 6]) { rect(g, x + d - 1, y - 32, 3, 6, '#d8d0c0'); rect(g, x + d - 1, y - 32, 1, 6, '#fff6e8'); const sw = Math.sin(time * 10 + d + k) > 0 ? 1 : 0; rect(g, x + d - 1 + sw, y - 38, 2, 6, MA.amber); rect(g, x + d, y - 37, 1, 4, MA.amberHi); }
  rect(g, x - 10, y - 40, 20, 18, al(MA.amber, 0.06));
}
/* A CARRIED CANDELABRA (x, y = the hero's feet; face; lit / out): a small three-armed brass branch held out in front */
export function drawCarried(g, x, y, face, st, time) {
  const px0 = R(x) + (face || 1) * 9, py = R(y) - 18;
  rect(g, px0 - 1, py, 2, 11, MA.brass); rect(g, px0 - 6, py - 1, 12, 2, MA.brass); rect(g, px0 - 6, py - 1, 12, 1, MA.brassHi); rect(g, px0 - 2, py + 10, 4, 2, MA.brassLo);
  for (const d of [-5, 0, 5]) { rect(g, px0 + d - 1, py - 6, 3, 5, '#d8d0c0');
    if (st === 'lit') { const sw = Math.sin(time * 12 + d) > 0 ? 1 : 0; rect(g, px0 + d - 1 + sw, py - 11, 2, 5, MA.amber); rect(g, px0 + d, py - 10, 1, 3, MA.amberHi); }
    else { px(g, px0 + d, py - 7, '#2a2a28'); const ph = (time * 1.1 + d * 0.2) % 1; px(g, px0 + d + Math.round(Math.sin(time * 4 + d)), py - 8 - R(ph * 10), al('#8a9a90', 0.6 * (1 - ph))); } }
  if (st === 'lit') rect(g, px0 - 12, py - 14, 24, 22, al(MA.amber, 0.07));
}
/* AN EMPTY SUIT ON ITS RACK (x = its centre, y = its feet) - stone plinth, iron stand, steel, a dark visor */
export function drawRack(g, x, y, time, face = 1, pal = null) {
  x = R(x); y = R(y); const C = pal || { b: '#6e767c', hi: '#a8b2b8', lo: '#3a4046' };
  rect(g, x - 9, y - 3, 18, 3, '#3a403e'); rect(g, x - 9, y - 3, 18, 1, '#6a746e'); rect(g, x - 7, y - 5, 14, 2, '#2e3432');
  rect(g, x - 1, y - 36, 2, 33, MA.iron); rect(g, x - 5, y - 17, 10, 3, MA.iron);
  rect(g, x - 4, y - 14, 3, 11, C.b); rect(g, x + 1, y - 14, 3, 11, C.b); rect(g, x - 4, y - 14, 1, 11, C.hi); rect(g, x - 5, y - 4, 4, 2, C.lo); rect(g, x + 1, y - 4, 4, 2, C.lo);
  rect(g, x - 6, y - 28, 12, 14, C.b); rect(g, x - 6, y - 28, 12, 2, C.hi); rect(g, x - 6, y - 28, 1, 14, C.hi); rect(g, x + 5, y - 28, 1, 14, C.lo); rect(g, x - 5, y - 20, 10, 1, C.lo); rect(g, x - 1, y - 27, 2, 8, C.lo);
  rect(g, x - 8, y - 29, 4, 4, C.hi); rect(g, x + 4, y - 29, 4, 4, C.b);
  rect(g, x - 4, y - 36, 8, 8, C.b); rect(g, x - 4, y - 36, 8, 2, C.hi); rect(g, x - 4, y - 36, 1, 8, C.hi); rect(g, x - 3 + (face > 0 ? 1 : 0), y - 33, 6, 2, '#0c1010');
  rect(g, x + face * 8, y - 28, 2, 24, '#c8ccd0'); rect(g, x + face * 8 - 2, y - 14, 6, 2, MA.brass);
}
/* A HEAP OF ARMOUR (x = its centre, y = its floor): what a knocked-out suit left */
export function drawPile(g, x, y, time) {
  x = R(x); y = R(y); rect(g, x - 11, y - 4, 22, 4, '#4a5258'); rect(g, x - 9, y - 7, 14, 3, '#6e767c'); rect(g, x - 9, y - 7, 14, 1, '#a8b2b8'); rect(g, x - 2, y - 9, 8, 5, '#5a6268');
  rect(g, x + 4, y - 8, 7, 6, '#7a828a'); rect(g, x + 5, y - 6, 5, 2, '#0c1010'); rect(g, x - 13, y - 2, 6, 2, '#6e767c'); rect(g, x - 12, y - 3, 3, 2, '#8a929a'); rect(g, x + 6, y - 2, 8, 1, '#c8ccd0');
  px(g, x - 6, y - 5, '#2a2e32'); px(g, x, y - 6, '#2a2e32'); if ((time * 0.9) % 3 < 0.25) px(g, x + 7, y - 5, al(MA.ghost, 0.5));   /* a last green glint in the visor */
}
/* THE SEALED NURSERY DOOR (cells x, y0..y1; n rows tall; keys of need; shut or ajar) */
export function drawNurseryDoor(g, sx, sy, n, keys, need, open, time) {
  const h = n * TS;
  if (open) { rect(g, sx, sy, 3, h, '#5a6a78'); rect(g, sx, sy, 1, h, '#c8d0d4'); rect(g, sx + 3, sy, 2, h, '#3a4450'); rect(g, sx + 5, sy + 2, 8, h - 2, al(MA.amber, 0.10 + 0.04 * Math.sin(time * 2))); rect(g, sx + 6, sy + 6, 4, h - 6, al(MA.amberHi, 0.08)); return; }
  rect(g, sx, sy, 16, h, '#5a6a78'); rect(g, sx, sy, 16, 1, '#a0b0be'); rect(g, sx, sy, 1, h, '#8a9aa8'); rect(g, sx + 15, sy, 1, h, '#2a323a'); rect(g, sx + 2, sy + 2, 12, h - 4, '#6a7a88'); rect(g, sx + 2, sy + 2, 12, 1, '#c8d0d4'); rect(g, sx + 2, sy + h - 3, 12, 1, '#3a4450');
  for (let q = 0; q < 3; q++) { const yy = sy + 8 + q * 22; rect(g, sx + 4, yy, 8, 12, '#4a5866'); rect(g, sx + 4, yy, 8, 1, '#8a9aa8'); rect(g, sx + 5, yy + 3, 6, 3, '#c8d0d4'); px(g, sx + 6, yy + 4, '#2a3440'); rect(g, sx + 7, yy + 6, 2, 1, '#e8a0a0'); }   /* painted ducks in the panels */
  rect(g, sx + 1, sy + 4, 3, h - 8, '#2a323a'); for (let q = 0; q < 3; q++) rect(g, sx, sy + 6 + q * 24, 4, 3, MA.iron);   /* the hinge side's iron */
  for (let k = 0; k < need; k++) { const yy = sy + 12 + k * 18, got = k < keys; rect(g, sx + 9, yy - 1, 5, 9, '#1c242c'); rect(g, sx + 9, yy - 1, 5, 1, got ? MA.giltHi : '#3a4450'); rect(g, sx + 10, yy + 1, 3, 3, got ? MA.giltHi : '#0c1014'); rect(g, sx + 11, yy + 4, 1, 3, got ? MA.giltHi : '#0c1014'); if (got) rect(g, sx + 8, yy - 2, 7, 11, al(MA.giltHi, 0.16 + 0.08 * Math.sin(time * 3 + k))); }
}
/* THE PEDESTAL under a silver (x = its centre, y = the floor): a velvet cushion on a stone plinth, a cobweb */
export function drawPedestal(g, x, y, time) {
  x = R(x); y = R(y); rect(g, x - 8, y - 2, 16, 2, '#4a524e'); rect(g, x - 6, y - 5, 12, 3, '#6a746e'); rect(g, x - 6, y - 5, 12, 1, '#9aa8a0'); rect(g, x - 7, y - 7, 14, 3, MA.velvet); rect(g, x - 7, y - 7, 14, 1, MA.velvetHi); rect(g, x - 7, y - 4, 1, 2, MA.giltHi); rect(g, x + 6, y - 4, 1, 2, MA.giltHi);
  line(g, x - 10, y - 12, x - 4, y - 7, 'rgba(220,230,224,0.35)'); line(g, x - 10, y - 12, x - 12, y - 7, 'rgba(220,230,224,0.25)');
}
/* A PANEL'S EYE (x, y = its centre): a plaster medallion; the lid lifts and the iris shows while the panel is WATCHED, a closed lid when it is not */
export function drawEye(g, x, y, seen, time) {
  x = R(x); y = R(y); rect(g, x - 8, y - 4, 16, 8, '#1a2220'); rect(g, x - 9, y - 3, 18, 6, '#1a2220'); rect(g, x - 8, y - 4, 16, 1, MA.giltLo); rect(g, x - 8, y + 3, 16, 1, MA.giltLo);
  if (seen) { rect(g, x - 6, y - 2, 12, 4, '#dce8e0'); rect(g, x - 3, y - 2, 6, 4, MA.ghost); rect(g, x - 1, y - 1, 2, 2, '#0c1410'); px(g, x - 2, y - 2, MA.ghostHi); rect(g, x - 7, y - 3, 14, 1, '#3a4a40'); }
  else { rect(g, x - 6, y - 1, 12, 2, '#3a4a40'); rect(g, x - 6, y, 12, 1, '#1c2822'); for (const d of [-4, 0, 4]) px(g, x + d, y + 2, '#3a4a40'); }
}
/* WHERE A PANEL COULD BE: the other state's cells as faint ticks (a ghost outline of the door, the stair, the case) */
export function drawAlt(g, cells, cx, cy, time) {
  const pul = 0.18 + 0.08 * Math.sin(time * 3), col = al('#c8d8cc', pul);
  for (const [a, b] of cells) { const x = a * TS - cx, y = b * TS - cy; rect(g, x, y, 3, 1, col); rect(g, x, y, 1, 3, col); rect(g, x + 13, y, 3, 1, col); rect(g, x + 15, y, 1, 3, col); rect(g, x, y + 15, 3, 1, col); rect(g, x, y + 13, 1, 3, col); rect(g, x + 13, y + 15, 3, 1, col); rect(g, x + 15, y + 13, 1, 3, col); }
}
/* THE OPEN DOORWAY (a moving door's air cells): an architrave round the hole, a brass-bound threshold */
export function drawDoorway(g, cells, cx, cy) {
  const top = Math.min(...cells.map(c => c[1])), bot = Math.max(...cells.map(c => c[1]));
  for (const [a, b] of cells) { const x = a * TS - cx, y = b * TS - cy; rect(g, x, y, 2, 16, '#2a3a30'); rect(g, x, y, 1, 16, MA.gilt); rect(g, x + 14, y, 2, 16, '#162018'); rect(g, x + 15, y, 1, 16, MA.giltLo);
    if (b === top) { rect(g, x, y, 16, 3, '#2a3a30'); rect(g, x, y, 16, 1, MA.giltHi); rect(g, x, y + 2, 16, 1, MA.giltLo); } if (b === bot) { rect(g, x, y + 13, 16, 3, '#4a524e'); rect(g, x, y + 13, 16, 1, '#8a928c'); } }
}
/* A WISP (x, y = its centre; dir = +1 / -1 along its flight): the ghost between suits - a little green flame with a streaming tail and a face */
export function drawWisp(g, x, y, dir, time) {
  x = R(x); y = R(y); const w = Math.sin(time * 14) > 0 ? 1 : 0;
  for (let k = 5; k >= 1; k--) { const a = 0.5 - k * 0.08; rect(g, x - dir * (k * 4 + 3), y - 2 + Math.round(Math.sin(time * 9 + k) * 2), 4, 4 - (k > 3 ? 1 : 0), al(MA.ghost, a)); }
  rect(g, x - 5, y - 7 - w, 10, 13 + w, al(MA.ghost, 0.28)); rect(g, x - 4, y - 6, 8, 10, MA.ghost); rect(g, x - 3, y - 7, 6, 2, MA.ghost); rect(g, x - 2, y - 3, 4, 7, MA.ghostHi);
  px(g, x - 2, y - 4, '#0c2418'); px(g, x + 1, y - 4, '#0c2418'); rect(g, x - 1, y - 1, 2, 2, '#0c2418'); rect(g, x - 5, y - 9, 10, 1, al(MA.ghostHi, 0.35));
}
/* A THROWN THING (a poltergeist's: CHAIR / PLATE / CANDLESTICK / BOOK), two positions as it tumbles */
export function itemSprite(item, ph) {
  return once('it' + item + (ph ? 1 : 0), () => { const [c, g] = canvas(14, 14);
    if (item === 'CHAIR') { if (!ph) { rect(g, 3, 1, 2, 12, '#7a6a5a'); rect(g, 3, 2, 8, 2, '#8a7a68'); rect(g, 3, 8, 8, 2, '#8a7a68'); rect(g, 9, 10, 2, 3, '#6a5a4a'); rect(g, 4, 3, 1, 5, '#a89a86'); } else { rect(g, 1, 3, 12, 2, '#7a6a5a'); rect(g, 2, 3, 2, 8, '#8a7a68'); rect(g, 8, 3, 2, 8, '#8a7a68'); rect(g, 1, 11, 12, 1, '#6a5a4a'); } }
    else if (item === 'PLATE') { if (!ph) { circle(g, 7, 7, 6, '#e8e8e0'); circle(g, 7, 7, 4, '#c8ccc8'); circle(g, 7, 7, 2, '#a8b0ac'); rect(g, 7, 1, 1, 2, '#b89a58'); } else { rect(g, 1, 6, 12, 2, '#e8e8e0'); rect(g, 3, 8, 8, 1, '#a8b0ac'); rect(g, 1, 6, 12, 1, '#fff'); } }
    else if (item === 'CANDLESTICK') { if (!ph) { rect(g, 6, 1, 3, 6, '#d8d0c0'); rect(g, 6, 7, 3, 2, MA.brass); rect(g, 7, 9, 1, 3, MA.brass); rect(g, 4, 12, 7, 2, MA.brassHi); px(g, 7, 0, MA.amber); } else { rect(g, 1, 6, 6, 3, '#d8d0c0'); rect(g, 7, 6, 2, 3, MA.brass); rect(g, 9, 7, 3, 1, MA.brass); rect(g, 12, 4, 2, 7, MA.brassHi); px(g, 0, 7, MA.amber); } }
    else { if (!ph) { rect(g, 2, 3, 10, 8, '#7a3a3a'); rect(g, 2, 3, 10, 1, '#a85a5a'); rect(g, 3, 4, 1, 6, '#e8e0c8'); rect(g, 11, 4, 1, 6, '#c8c0a8'); rect(g, 5, 6, 4, 1, MA.giltHi); } else { rect(g, 0, 4, 6, 7, '#e8e0c8'); rect(g, 8, 2, 6, 7, '#e8e0c8'); rect(g, 6, 3, 2, 8, '#7a3a3a'); rect(g, 1, 6, 4, 1, '#8a8478'); rect(g, 9, 4, 4, 1, '#8a8478'); } }
    return c; });
}
export function drawThrown(g, x, y, item, time) { g.drawImage(itemSprite(item, (time * 12) % 2 < 1 ? 0 : 1), R(x) - 7, R(y) - 7); }
/* THE STAIR TO THE WITCHLIGHT ROAD (the armoury door's far wall, sx = its centre, fy = the floor): iron-gated and dark until the Castellan falls, then raised, and the road's pale light on the steps */
export function drawExit(g, sx, fy, open, time) {
  sx = R(sx); fy = R(fy); const w = 40, h = 62, x0 = sx - w / 2;
  rect(g, x0 - 5, fy - h - 6, w + 10, h + 6, '#2a2e32'); rect(g, x0 - 5, fy - h - 6, w + 10, 2, '#6a727a'); rect(g, x0 - 5, fy - h - 6, 2, h + 6, '#4a525a'); rect(g, x0 + w + 3, fy - h - 6, 2, h + 6, '#121416');
  for (let r = 0; r < 16; r++) { const cut = 16 - r; rect(g, x0, fy - h + r - 14, cut, 1, '#16181a'); rect(g, x0 + w - cut, fy - h + r - 14, cut, 1, '#16181a'); }   /* the arch */
  rect(g, x0, fy - h, w, h, open ? '#c8d0b8' : '#06080a');
  if (open) { for (let k = 0; k < 7; k++) { rect(g, x0 + 4 + k * 2, fy - 6 - k * 7, w - 8 - k * 4, 6, k & 1 ? '#a8b09a' : '#b8c0aa'); rect(g, x0 + 4 + k * 2, fy - 6 - k * 7, w - 8 - k * 4, 1, '#e8f0dc'); } rect(g, x0 + 12, fy - h, w - 24, 10, '#f0f4e0'); rect(g, x0 - 14, fy - h, w + 28, h, al('#e0e8c8', 0.07 + 0.03 * Math.sin(time * 2))); }
  else { for (let k = 0; k < 7; k++) rect(g, x0 + 4 + k * 2, fy - 6 - k * 7, w - 8 - k * 4, 5, '#0e1214'); for (let q = x0 + 3; q < x0 + w - 2; q += 5) rect(g, q, fy - h, 2, h, '#3a4046'); for (const yy of [fy - h + 12, fy - 28]) rect(g, x0, yy, w, 2, '#4a525a'); circle(g, sx, fy - 30, 3, MA.brassLo); px(g, sx, fy - 31, MA.brassHi); }
  rect(g, x0 - 3, fy - 3, w + 6, 3, '#4a524e');
  for (const sd of [-1, 1]) { const lx = sx + sd * (w / 2 + 11); rect(g, lx - 1, fy - 40, 2, 6, MA.iron); rect(g, lx - 2, fy - 36, 4, 2, MA.brass); rect(g, lx - 1, fy - 44, 2, 5, '#d8d0c0'); if (open) { rect(g, lx - 1, fy - 49, 2, 5, MA.amber); rect(g, lx, fy - 48, 1, 3, MA.amberHi); } }   /* two lamps: lit when it opens */
}
