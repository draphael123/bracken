// src/redraw/academy_art.js - THE MAGE ACADEMY's art (claude/academyart, the SONNET ART PASS over claude/academy's greybox; ACADEMY_SHIPS stays false).
// An archmage's school at the foot of his tower: cold ashlar under moonlight, candle amber, parchment, brass, and the three cantrip colours - LEVITATION sky-blue, BLINK violet,
// CONJURE STEP gold. NO wood, no logs: the shelving is dark carved stone and iron, the lecterns stone and brass, the carpet is wool.
//   TILES     academyTile(t, x, y, at, T, L): per ROOM - the steps (weathered limestone), the library (plum stone, wool carpet; every bookstack cell is SHELVING: rows of spines,
//             a crown on top), the lecture hall (slate, brass inlay), the conjuration yard (pale flagstone), the exam hall + the Examination (black and white marble, gold).
//             A one-way (reading gallery, the Examination's high galleries) is a corbelled stone slab; a floating stone (L.hullZones) is a runestone with a lit underside;
//             a WARD RAIL cell is a column of dark glass; the Examination's east wall carries the exit gate.
//   BACKDROP  drawBackdrop (per-room back walls baked once as parallax strips: shelving + arched moon windows, stained windows + house banners + chalkboard, the yard's cloister
//             arcade and the tower, marble pillars; the galleries' chains; the pits' dark; the library door's light; the exit gate) + drawDecor (candelabra, globes, book piles, easels, desks)
//   PROPS     drawLectern (lit in its spell colour / dark), drawRail (ward rail: emitters + the light), drawStep (a conjured step), drawRune + shutter tile, drawAura (the cantrip a hero holds)
//   FOES      drawFlock (THE SPELLBOOK FLOCK: wheel / told gather / stream / scattered / regroup)
// Rect-based (px.js primitives only: it runs in tools/node-canvas.mjs, tools/academy-art-sheet.mjs), baked once and memoised where it is a sprite. Axis-aligned only (no rotate, no paths).
import { canvas, px, rect, line, ellipse, circle, flipX, whiten } from '../px.js';

export const AA = {
  spell: { levitate: '#9fd8ff', blink: '#d8a0ff', conjure: '#ffd36b' },
  brass: '#d8a840', brassHi: '#fff0a0', brassLo: '#8a6420', brassDeep: '#4a3410',
  parch: '#e8dcb8', parchLo: '#b8a880', parchDeep: '#7a6c50',
  candle: '#ffd36b', candleHi: '#fff6c8', flame: '#ff9a3a',
  glass: '#c8a0ff', glassHi: '#f0dcff',
  ink: '#120c1e', inkMid: '#1c1430', iron: '#34303e', ironHi: '#6a6678',
  house: ['#a02838', '#2c5aa8', '#2a8a5a'], houseHi: ['#d8506a', '#5a8ae0', '#5ac88a'], houseLo: ['#601824', '#183468', '#165034'],
  books: ['#8a2c3c', '#2c4a8a', '#2a6a4a', '#5a2c78', '#a06a2c', '#3a6a7a', '#7a3a2a', '#4a4a6a'],
};
/* THE ROOMS' STONE */
const ZP = {
  steps: { b: ['#5a5e74', '#626680', '#545870', '#6a6e88'], hi: '#8a8eac', lo: '#3a3c50', joint: '#2a2c3c', mid: '#4a4e66' },
  library: { b: ['#3c3048', '#443650', '#382c44', '#4a3c58'], hi: '#6a5a82', lo: '#241c2e', joint: '#181220', mid: '#2e2438' },
  lecture: { b: ['#34405e', '#3c4a6a', '#303a56', '#42507a'], hi: '#6a7ca8', lo: '#1e263c', joint: '#141a2a', mid: '#283450' },
  yard: { b: ['#7a7c94', '#848aa4', '#72748c', '#8e94b0'], hi: '#b8bcd4', lo: '#4a4c64', joint: '#34364a', mid: '#646880' },
  exam: { b: ['#2a2638', '#322e44', '#262234', '#38344c'], hi: '#5a5478', lo: '#14101e', joint: '#0c0814', mid: '#1e1a2c' },
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = Math.round;
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };
const TS = 16;

/* WHICH ROOM a column is in (L.ac.rooms: library / lecture / yard / exam; the steps before 18; the Examination from col 300) */
export function zoneOf(x, L) {
  const A = L && L.arena; if (A && x >= A.wallL) return 'exam';
  const rooms = (L && L.ac && L.ac.rooms) || []; const r = rooms.find(q => x >= q.x0 && x <= q.x1);
  return r ? (r.id === 'library' ? 'library' : r.id === 'lecture' ? 'lecture' : r.id === 'yard' ? 'yard' : 'exam') : 'steps';
}
const inBox = (zs, x, y) => (zs || []).some(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]);
const railAt = (L, x, y) => ((L.ac && L.ac.rails) || []).some(r => r.x === x && y >= r.y0 && y <= r.y1);

/* ================================ TILES (16 x 16) ================================ */
function ashlar(g, wx, wy, P) {
  const brick = 8;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
    const gx = wx + xx, gy = wy + yy, row = (gy / brick) | 0, off = (row & 1) * 6, cx = ((gx + off) % 12 + 12) % 12;
    let c = P.b[hash(gx >> 2, gy >> 1) & 3];
    if (gy % brick === 0 || cx === 0) c = P.joint;
    else if (gy % brick === 1) c = P.mid;
    else if (hash(gx, gy) % 21 === 0) c = P.hi;
    else if (hash(gx + 5, gy) % 15 === 0) c = P.lo;
    px(g, xx, yy, c);
  }
}
function edges(g, P, aL, aR, dn) {
  if (aL) { rect(g, 0, 0, 1, 16, P.hi); rect(g, 1, 0, 1, 16, P.mid); }
  if (aR) { rect(g, 15, 0, 1, 16, P.lo); rect(g, 14, 0, 1, 16, P.joint); }
  if (dn) { rect(g, 0, 14, 16, 1, P.lo); rect(g, 0, 15, 16, 1, P.joint); }
}
/* THE TOP FACE of a floor, per room */
function topFace(g, z, x, y, aL, aR) {
  const wx = x * 16;
  if (z === 'library') {   /* a wool carpet runner, gold fringe */
    for (let xx = 0; xx < 16; xx++) { rect(g, xx, 0, 1, 1, '#c04258'); rect(g, xx, 1, 1, 1, ((xx + x * 16) % 6 < 3) ? '#8a2a3e' : '#7a2434'); rect(g, xx, 2, 1, 1, '#5a1a28'); }
    for (let xx = 0; xx < 16; xx += 3) px(g, xx, 1, AA.brass);
    rect(g, 0, 3, 16, 1, '#2a0c16');
    if (aL) { rect(g, 0, 0, 1, 5, AA.brass); px(g, 0, 5, AA.brassLo); } if (aR) { rect(g, 15, 0, 1, 5, AA.brass); px(g, 15, 5, AA.brassLo); }
  } else if (z === 'lecture') {   /* polished slate, a brass inlay line */
    rect(g, 0, 0, 16, 1, '#a8b6d8'); rect(g, 0, 1, 16, 1, AA.brass); rect(g, 0, 2, 16, 1, AA.brassLo); rect(g, 0, 3, 16, 1, '#141a2a');
    if (x % 4 === 0) rect(g, 0, 0, 1, 4, '#141a2a');
  } else if (z === 'yard') {   /* pale flagstone, a lip of dew-light */
    rect(g, 0, 0, 16, 1, '#dce0f0'); rect(g, 0, 1, 16, 2, '#a8aec8'); rect(g, 0, 3, 16, 1, '#4a4c64');
    for (let xx = 0; xx < 16; xx++) if (hash(wx + xx, y) % 9 === 0) { px(g, xx, 0, '#9fd8ff'); px(g, xx, -1 + 1, '#c8ecff'); }
    if (x % 8 === 0) rect(g, 0, 0, 1, 4, '#34364a');
  } else if (z === 'exam') {   /* black and white marble, a gold line */
    for (let xx = 0; xx < 16; xx++) { const c = ((xx >> 3) + x) & 1 ? '#ece8f4' : '#2a2638'; rect(g, xx, 0, 1, 3, c); px(g, xx, 0, ((xx >> 3) + x) & 1 ? '#ffffff' : '#46405e'); }
    rect(g, 0, 3, 16, 1, AA.brass); rect(g, 0, 4, 16, 1, AA.brassLo);
  } else {   /* the steps: worn limestone, a chipped lip */
    rect(g, 0, 0, 16, 1, '#a8acc8'); rect(g, 0, 1, 16, 1, '#8a8eac'); rect(g, 0, 2, 16, 1, '#6a6e88');
    for (let xx = 0; xx < 16; xx++) if (hash(wx + xx, y + 3) % 7 === 0) px(g, xx, 0, '#5a5e74');
  }
}
export function stoneTile(z, x, y, o) {
  const key = ['s', z, x % 6, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.dn ? 'D' : '', o.corbel ? 'C' : '', o.deep ? 'P' : ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), P = ZP[z] || ZP.steps; ashlar(g, x * 16, y * 16, P);
    if (o.deep) { rect(g, 0, 0, 16, 16, 'rgba(8,6,16,0.28)'); }
    edges(g, P, o.aL, o.aR, o.dn);
    if (o.up) topFace(g, z, x, y, o.aL, o.aR);
    if (o.dn && !o.up) { rect(g, 0, 11, 16, 2, P.hi); rect(g, 0, 13, 16, 1, P.lo);   /* a cornice under a ceiling */
      if (z === 'exam') rect(g, 0, 10, 16, 1, AA.brass); if (z === 'lecture') rect(g, 0, 10, 16, 1, AA.brassLo); }
    return c; });
}
/* A BOOKSTACK CELL: carved dark shelving, rows of spines. A crown on the top cell */
export function shelfTile(x, y, up, aL, aR) {
  return once('sh' + (x % 7) + (y % 5) + (up ? 'U' : '') + (aL ? 'L' : '') + (aR ? 'R' : ''), () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 16, '#1c1426'); rect(g, 0, 0, 2, 16, '#3e3050'); rect(g, 14, 0, 2, 16, '#2e2440'); rect(g, 0, 0, 1, 16, '#5a4a70'); px(g, 0, 7, AA.brass); px(g, 15, 7, AA.brassLo); px(g, 0, 15, AA.brass);
    for (const sy of [7, 15]) { rect(g, 0, sy, 16, 1, '#5a4a70'); rect(g, 0, sy + (sy === 15 ? 0 : 1), 16, 1, '#241a30'); }
    for (const [r0, hh] of [[1, 6], [9, 6]]) { let xx = 2; while (xx < 14) { const h = hash(x * 16 + xx, y * 3 + r0), w = 2 + (h % 2), bh = Math.min(hh, 3 + ((h >> 3) % 4)), col = AA.books[(h >> 5) % AA.books.length];
        if (h % 11 === 0) { xx += 2; continue; }   /* a gap */
        const top = r0 + hh - bh; rect(g, xx, top, w, bh, col); rect(g, xx, top, 1, bh, al('#ffffff', 0.18)); px(g, xx, top, al('#ffffff', 0.35)); if (bh > 4) rect(g, xx, top + 2, w, 1, AA.brass);
        xx += w; } }
    if (up) { rect(g, 0, 0, 16, 4, '#4a3a60'); rect(g, 0, 0, 16, 1, '#8a7aa8'); rect(g, 0, 3, 16, 1, '#1c1426'); rect(g, 0, 1, 16, 1, AA.brassLo); }
    return c; });
}
/* A ONE-WAY: a corbelled stone slab (the reading gallery, the Examination's high galleries) */
export function galleryTile(z, x, aL, aR) {
  return once('gl' + z + (aL ? 'L' : '') + (aR ? 'R' : '') + (x & 1), () => { const [c, g] = canvas(16, 16), P = ZP[z] || ZP.library;
    rect(g, 0, 0, 16, 6, P.b[1]); rect(g, 0, 0, 16, 1, P.hi); rect(g, 0, 1, 16, 1, z === 'exam' ? AA.brass : AA.brassLo); rect(g, 0, 4, 16, 1, P.lo); rect(g, 0, 5, 16, 1, P.joint);
    for (const sx of [3, 12]) { px(g, sx, 2, AA.brassHi); px(g, sx, 3, AA.brassLo); }
    rect(g, 0, 6, 16, 1, 'rgba(8,6,16,0.45)');
    if (aL) { rect(g, 0, 0, 1, 6, P.hi); for (let k = 0; k < 5; k++) rect(g, 1 + k, 6 + k, 3 - Math.min(2, k) , 1, P.mid); }   /* a corbel under the end */
    if (aR) { rect(g, 15, 0, 1, 6, P.lo); for (let k = 0; k < 5; k++) rect(g, 12 - k + Math.min(2, k), 6 + k, 3 - Math.min(2, k), 1, P.mid); }
    return c; });
}
/* A FLOATING RUNESTONE (L.hullZones): the summoned stones of the yard - a lit underside, a rune */
export function floatTile(x, y, aL, aR, up, dn) {
  return once('fl' + (aL ? 'L' : '') + (aR ? 'R' : '') + (up ? 'U' : '') + (dn ? 'D' : '') + (x % 3), () => { const [c, g] = canvas(16, 16), P = ZP.yard;
    ashlar(g, x * 16, 0, P); rect(g, 0, 0, 16, 16, 'rgba(40,30,80,0.18)'); edges(g, P, aL, aR, dn);
    if (up) { rect(g, 0, 0, 16, 1, '#dce0f0'); rect(g, 0, 1, 16, 1, '#a8aec8'); }
    if (dn) { for (let xx = 0; xx < 16; xx++) { rect(g, xx, 11, 1, 5, al(AA.glass, 0.12 + 0.1 * ((xx + x) & 1))); } rect(g, 0, 14, 16, 1, al(AA.glassHi, 0.55)); rect(g, 0, 15, 16, 1, al(AA.glass, 0.9)); }
    if (x % 3 === 1) { const gl = AA.spell.conjure; px(g, 8, 5, gl); px(g, 7, 6, gl); px(g, 9, 6, gl); px(g, 8, 7, gl); px(g, 8, 8, gl); px(g, 7, 9, gl); px(g, 9, 9, gl); }
    return c; });
}
/* A WARD RAIL cell: a column of dark glass (the light itself is drawRail's) */
export function railTile(top, bot) {
  return once('rl' + (top ? 'T' : '') + (bot ? 'B' : ''), () => { const [c, g] = canvas(16, 16);
    rect(g, 5, 0, 6, 16, 'rgba(34,18,64,0.55)'); rect(g, 5, 0, 1, 16, al(AA.glass, 0.7)); rect(g, 10, 0, 1, 16, al(AA.glass, 0.7)); rect(g, 7, 0, 2, 16, al(AA.glassHi, 0.55));
    if (top) { rect(g, 3, 0, 10, 4, AA.brass); rect(g, 3, 0, 10, 1, AA.brassHi); rect(g, 3, 3, 10, 1, AA.brassLo); rect(g, 6, 4, 4, 2, AA.iron); }
    if (bot) { rect(g, 3, 12, 10, 4, AA.brass); rect(g, 3, 12, 10, 1, AA.brassHi); rect(g, 3, 15, 10, 1, AA.brassLo); rect(g, 6, 10, 4, 2, AA.iron); }
    return c; });
}
/* THE SHUTTER (a shortcut rune's cells while shut; the hands paint it: tileSpr is cleared when the grid is changed in play) */
export function shutterTile(v) {
  return once('sd' + (v & 1), () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 16, '#26222e'); rect(g, 0, 0, 16, 1, AA.ironHi); rect(g, 0, 15, 16, 1, '#0c0a12'); rect(g, 0, 0, 1, 16, '#4a4658'); rect(g, 15, 0, 1, 16, '#0c0a12');
    for (let yy = 3; yy < 16; yy += 4) rect(g, 1, yy, 14, 1, '#14101c'); for (const [sx, sy] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { px(g, sx, sy, AA.brass); px(g, sx, sy + 1, AA.brassLo); }
    rect(g, 7, 5, 2, 6, al(AA.glass, 0.85)); px(g, 8, 4, AA.glassHi); px(g, 6, 7, al(AA.glass, 0.6)); px(g, 9, 7, al(AA.glass, 0.6));
    return c; });
}
/* THE EXIT GATE of the Examination (the east wall, rows F-5 .. F-1): iron doors under a stone arch, a seal */
export function gateTile(dy, rows) {
  return once('gt' + dy + '_' + rows, () => { const [c, g] = canvas(16, 16), P = ZP.exam;
    ashlar(g, 5, dy * 16 + 3, P);
    rect(g, 2, 0, 12, 16, '#1c1a26'); rect(g, 2, 0, 1, 16, '#4a4658'); rect(g, 13, 0, 1, 16, '#0c0a12'); rect(g, 7, 0, 2, 16, '#0c0a12');
    for (let yy = 2; yy < 16; yy += 5) { rect(g, 3, yy, 4, 1, '#34303e'); rect(g, 9, yy, 4, 1, '#34303e'); px(g, 4, yy + 1, AA.brass); px(g, 11, yy + 1, AA.brass); }
    if (dy === 0) { rect(g, 1, 0, 14, 3, '#5a5478'); rect(g, 1, 0, 14, 1, '#8a84a8'); rect(g, 1, 2, 14, 1, AA.brass); }
    if (dy === Math.floor(rows / 2)) { circle(g, 8, 8, 3, '#3a1c1c'); px(g, 8, 7, '#ff6b6b'); px(g, 7, 8, '#ff6b6b'); px(g, 9, 8, '#ff6b6b'); px(g, 8, 9, '#ff6b6b'); }
    return c; });
}
/* main.js asks for a tile of every SOLID / ONEWAY cell of an academy level (null = the stock ground) */
export function academyTile(t, x, y, at, T, L) {
  if (!L || !L.academy) return null;
  const z = zoneOf(x, L), air = (a, b) => at(a, b) === T.AIR, F = (L.ac && L.ac.floorRow) || 40;
  if (t === T.ONEWAY) { const same = (a, b) => at(a, b) === T.ONEWAY; return galleryTile(z, x, !same(x - 1, y), !same(x + 1, y)); }
  if (t !== T.SOLID) return null;
  if (railAt(L, x, y)) return railTile(!railAt(L, x, y - 1), !railAt(L, x, y + 1));
  const A = L.arena;
  if (A && x === A.wallR && y >= F - 5 && y <= F - 1) return gateTile(y - (F - 5), 5);
  const up = air(x, y - 1), dn = air(x, y + 1), aL = air(x - 1, y), aR = air(x + 1, y);
  if (inBox(L.hullZones, x, y) && (up || dn)) return floatTile(x, y, aL, aR, up, dn);
  if (z === 'library' && y >= 14 && y < F) return shelfTile(x, y, up, aL, aR);
  const deep = !up && !aL && !aR && !dn && at(x, y - 2) === T.SOLID && at(x, y - 3) === T.SOLID && y > 4;
  return stoneTile(z, x, y, { up, dn, aL, aR, deep });
}

/* ================================ THE PROPS ================================ */
/* A LECTERN (x = its centre, y = its feet): stone and brass, an open book that glows in the spell's colour when it is lit, a closed dark one when not */
export function drawLectern(g, x, y, spell, lit, time) {
  x = R(x); y = R(y); const C = AA.spell[spell] || AA.brass;
  rect(g, x - 5, y - 2, 10, 2, '#4a4658'); rect(g, x - 6, y - 1, 12, 1, '#2a2634');            /* the plinth */
  rect(g, x - 2, y - 13, 4, 11, '#5a5470'); rect(g, x - 2, y - 13, 1, 11, '#7a7498'); rect(g, x + 1, y - 13, 1, 11, '#3a3650');   /* the stem */
  rect(g, x - 3, y - 9, 6, 1, AA.brass); px(g, x, y - 8, AA.brassLo);
  rect(g, x - 8, y - 17, 16, 4, '#6a6488'); rect(g, x - 8, y - 17, 16, 1, '#9a94b8'); rect(g, x - 8, y - 14, 16, 1, '#2a2634'); rect(g, x - 8, y - 17, 1, 4, AA.brass); rect(g, x + 7, y - 17, 1, 4, AA.brass);   /* the sloped desk */
  if (lit) {
    rect(g, x - 6, y - 21, 6, 4, AA.parch); rect(g, x, y - 21, 6, 4, AA.parch); rect(g, x - 6, y - 21, 12, 1, '#ffffff'); rect(g, x - 1, y - 21, 2, 4, AA.parchLo);
    for (let k = 0; k < 3; k++) { rect(g, x - 5, y - 20 + k, 4, 1, al(C, 0.9)); rect(g, x + 1, y - 20 + k, 4, 1, al(C, 0.9)); }
    const pul = 0.5 + 0.5 * Math.sin(time * 4); rect(g, x - 9, y - 22, 18, 7, al(C, 0.08 + 0.1 * pul));
    for (let k = 0; k < 3; k++) { const ph = (time * 0.9 + k * 0.33) % 1; px(g, x - 4 + k * 4 + Math.sin(time * 3 + k) * 2, y - 24 - ph * 14, al(C, 1 - ph)); }
    rect(g, x - 7, y - 1, 14, 1, al(C, 0.7));                                                   /* the lit circle at its feet */
  } else {
    rect(g, x - 6, y - 20, 12, 3, '#3a3040'); rect(g, x - 6, y - 20, 12, 1, '#5a4a70'); rect(g, x - 1, y - 20, 2, 3, AA.brassLo);   /* a closed book */
    px(g, x - 7, y - 16, al('#e8e8f4', 0.5)); px(g, x + 6, y - 15, al('#e8e8f4', 0.4));       /* dust */
  }
}
/* A WARD RAIL (px = the cell's left, top / bot = its screen y range): emitters at both ends, the light between, runes climbing it */
export function drawRail(g, pxL, top, bot, time, k = 0, temp = false) {
  const cx = R(pxL) + 8, h = bot - top; if (h <= 0) return; const pul = 0.5 + 0.5 * Math.sin(time * 4 + k);
  rect(g, cx - 5, top, 10, h, al(AA.glass, 0.1 + 0.07 * pul)); rect(g, cx - 3, top, 6, h, al(AA.glass, 0.14 + 0.08 * pul));
  rect(g, cx - 1, top, 2, h, al(AA.glassHi, 0.85)); rect(g, cx - 2, top, 1, h, al(AA.glass, 0.6)); rect(g, cx + 1, top, 1, h, al(AA.glass, 0.6));
  const ph = (time * 28 + k * 11) % 12;
  for (let yy = top + 4 + ph; yy < bot - 5; yy += 12) { rect(g, cx - 6, R(yy), 12, 1, al(AA.glassHi, 0.75)); rect(g, cx - 4, R(yy) + 1, 8, 1, al(AA.glass, 0.5)); px(g, cx - 6, R(yy) + 2, al(AA.glass, 0.7)); px(g, cx + 5, R(yy) + 2, al(AA.glass, 0.7)); }
  const sp = (time * 40 + k * 7) % h; px(g, cx - 1 + ((sp * 7) % 3), top + sp, '#ffffff');
  for (const [yy, d] of [[top, 1], [bot - 4, -1]]) { rect(g, cx - 5, yy, 10, 4, AA.brass); rect(g, cx - 5, yy, 10, 1, AA.brassHi); rect(g, cx - 5, yy + 3, 10, 1, AA.brassLo); rect(g, cx - 2, yy + (d > 0 ? 4 : -2), 4, 2, AA.iron); }
  if (temp) rect(g, cx - 7, top, 14, h, al('#ffffff', 0.04 + 0.03 * pul));
}
/* A CONJURED STEP: one 16-wide cell of the 3-cell step - a gold runic slab; l / r its ends, flick = it is about to go */
export function drawStep(g, pxL, py, l, r, flick, time, i = 0) {
  const x = R(pxL), y = R(py), a = flick ? 0.4 : 1;
  rect(g, x, y, 16, 1, al(AA.brassHi, a)); rect(g, x, y + 1, 16, 3, al(AA.candle, 0.85 * a)); rect(g, x, y + 4, 16, 1, al(AA.brass, 0.9 * a)); rect(g, x + 1, y + 5, 14, 1, al(AA.flame, 0.5 * a));
  const gl = ((i * 5 + R(time * 8)) % 16); px(g, x + gl, y, al('#ffffff', a));
  if ((i & 1) === 0) { px(g, x + 7, y + 2, al('#8a4a10', a)); px(g, x + 8, y + 2, al('#8a4a10', a)); px(g, x + 8, y + 3, al('#8a4a10', a)); }
  if (l) rect(g, x, y, 1, 5, al(AA.brassHi, a)); if (r) rect(g, x + 15, y, 1, 5, al(AA.brassLo, a));
  for (let k = 0; k < 2; k++) { const ph = (time * 1.2 + i * 0.37 + k * 0.5) % 1; px(g, x + 4 + k * 8 + Math.sin(time * 4 + k) * 2, y + 6 + ph * 7, al(AA.candle, (1 - ph) * a)); }
}
/* A SHORTCUT RUNE: a carved tablet, a violet glyph that pulses; struck, it goes dark and cracked */
export function drawRune(g, x, y, done, time) {
  x = R(x); y = R(y);
  rect(g, x - 5, y - 15, 10, 13, '#3a3650'); rect(g, x - 5, y - 15, 10, 1, '#7a7498'); rect(g, x - 5, y - 15, 1, 13, '#5a5470'); rect(g, x + 4, y - 15, 1, 13, '#1c1a28'); rect(g, x - 5, y - 3, 10, 1, '#1c1a28');
  if (done) { px(g, x - 1, y - 10, '#0c0a12'); px(g, x, y - 9, '#0c0a12'); px(g, x + 1, y - 8, '#0c0a12'); px(g, x, y - 7, '#0c0a12'); px(g, x - 2, y - 6, '#0c0a12'); return; }
  const p = 0.55 + 0.45 * Math.sin(time * 3 + x), C = al(AA.glass, p);
  rect(g, x - 1, y - 13, 2, 8, C); rect(g, x - 3, y - 11, 6, 1, C); px(g, x - 3, y - 7, C); px(g, x + 2, y - 7, C); px(g, x - 2, y - 13, al(AA.glassHi, p)); px(g, x + 1, y - 13, al(AA.glassHi, p));
  rect(g, x - 7, y - 16, 14, 15, al(AA.glass, 0.05 + 0.07 * p));
}
/* THE CANTRIP A HERO HOLDS: a little glyph over the head (levitate: feathers + the float meter; blink: a diamond; conjure: a step), wisps under the feet while floating */
export function drawAura(g, x, y, spell, o = {}, time = 0) {
  x = R(x); y = R(y); const C = AA.spell[spell]; if (!C) return;
  rect(g, x - 5, y - 5, 11, 11, al('#0c0a18', 0.55)); rect(g, x - 5, y - 5, 11, 1, al(C, 0.9)); rect(g, x - 5, y + 5, 11, 1, al(C, 0.9)); rect(g, x - 5, y - 5, 1, 11, al(C, 0.9)); rect(g, x + 5, y - 5, 1, 11, al(C, 0.9));
  if (spell === 'levitate') { rect(g, x, y - 3, 1, 7, C); px(g, x - 1, y - 2, C); px(g, x + 1, y - 2, C); px(g, x - 2, y - 1, C); px(g, x + 2, y - 1, C); px(g, x - 2, y + 1, al(C, 0.6)); px(g, x + 2, y + 1, al(C, 0.6)); }
  else if (spell === 'blink') { px(g, x, y - 3, C); rect(g, x - 1, y - 2, 3, 1, C); rect(g, x - 2, y - 1, 5, 1, C); rect(g, x - 2, y, 5, 1, C); rect(g, x - 1, y + 1, 3, 1, C); px(g, x, y + 2, C); px(g, x, y, '#ffffff'); }
  else { rect(g, x - 3, y + 1, 7, 1, C); rect(g, x - 2, y - 1, 5, 1, al(C, 0.7)); rect(g, x - 1, y - 3, 3, 1, al(C, 0.45)); px(g, x + 2, y + 3, al(C, 0.5)); px(g, x - 2, y + 3, al(C, 0.5)); }
  if (spell === 'levitate' && o.meter != null) { rect(g, x - 8, y + 7, 17, 3, al('#0c0a18', 0.7)); rect(g, x - 7, y + 8, R(15 * o.meter), 1, C); }
  if (o.float) for (let k = 0; k < 4; k++) { const ph = (time * 2.2 + k * 0.25) % 1; px(g, x - 6 + k * 4 + Math.sin(time * 6 + k * 2) * 2, y + 28 + ph * 8, al(C, (1 - ph) * 0.9)); rect(g, x - 5, y + 27, 11, 1, al(C, 0.45)); }
}

/* ================================ THE BACK WALLS (parallax strips, baked once) ================================ */
const SW = 256, SH = 480;
const strip = z => once('strip' + z, () => { const [c, g] = canvas(SW, SH); BAKE[z](g); return c; });
function arch(g, x, y, w, h, fill, rim) {   /* a tall arched window (the top is a stepped semicircle) */
  rect(g, x, y + w / 2, w, h - w / 2, fill); for (let k = 0; k < w / 2; k++) { const inset = Math.round(w / 2 - Math.sqrt(Math.max(0, (w / 2) * (w / 2) - (w / 2 - k - 0.5) * (w / 2 - k - 0.5)))); rect(g, x + inset, y + k, w - inset * 2, 1, fill); }
  rect(g, x, y + w / 2, 1, h - w / 2, rim); rect(g, x + w - 1, y + w / 2, 1, h - w / 2, rim);
}
function shelvesBack(g, x, y, w, h, a) {   /* a back shelving silhouette: rows of dim spines */
  rect(g, x, y, w, h, '#14101e'); for (let r = 0; r < h / 12; r++) { const yy = y + r * 12; rect(g, x, yy + 11, w, 1, '#2a2038'); let xx = x + 1; while (xx < x + w - 2) { const k = hash(xx, yy), bw = 2 + (k % 2), bh = 6 + ((k >> 3) % 4); rect(g, xx, yy + 11 - bh, bw, bh, al(AA.books[(k >> 5) % 8], a)); xx += bw; } }
  rect(g, x, y, 2, h, '#2e2440'); rect(g, x + w - 2, y, 2, h, '#2e2440');
}
function banner(g, x, y, h, hi, col, shape) {
  rect(g, x - 1, y - 3, 12, 2, AA.brass); px(g, x - 1, y - 3, AA.brassHi);
  rect(g, x, y, 10, h, AA.house[col]); rect(g, x, y, 1, h, AA.houseHi[col]); rect(g, x + 9, y, 1, h, AA.houseLo[col]); rect(g, x, y + h - 3, 10, 1, AA.brass);
  for (let k = 0; k < 5; k++) rect(g, x + k * 2, y + h + (k & 1 ? -1 : 0), 2, 3 - ((k & 1) ? 1 : 0) + 1, AA.house[col]);   /* the swallow-tail */
  const s = AA.brassHi, cx = x + 5, cy = y + h / 2 - 3;
  if (shape === 0) { px(g, cx, cy - 4, s); rect(g, cx - 1, cy - 3, 3, 2, s); rect(g, cx - 2, cy - 1, 5, 3, AA.brass); rect(g, cx - 1, cy + 2, 3, 1, AA.brassLo); }   /* a flame */
  else if (shape === 1) { rect(g, cx - 3, cy - 2, 7, 1, s); rect(g, cx - 2, cy, 5, 1, AA.brass); rect(g, cx - 3, cy + 2, 7, 1, s); px(g, cx - 3, cy - 3, s); px(g, cx + 3, cy + 1, s); }   /* waves */
  else { rect(g, cx, cy - 4, 1, 9, AA.brass); rect(g, cx - 3, cy - 2, 3, 2, s); rect(g, cx + 1, cy, 3, 2, s); rect(g, cx - 2, cy + 2, 2, 1, AA.brass); }   /* a leaf */
}
const BAKE = {
  steps(g) { rect(g, 0, 0, SW, SH, al('#10101c', 0.55));
    for (let i = 0; i < 2; i++) { const x = i * 128 + 24; arch(g, x, 70, 28, 120, '#0c0a16', '#3a3c58'); rect(g, x + 4, 110, 20, 1, '#2a2c44'); }
    for (const x of [8, 136]) { rect(g, x, 60, 10, 160, '#20203a'); rect(g, x, 60, 2, 160, '#3a3c58'); rect(g, x - 2, 58, 14, 4, '#3a3c58'); rect(g, x - 2, 218, 14, 4, '#2a2c44'); }   /* the gate's pillars */
    for (const x of [14, 142]) { rect(g, x - 1, 150, 2, 6, '#4a3410'); rect(g, x - 2, 143, 4, 8, '#ffb04a'); rect(g, x - 1, 141, 2, 3, '#ffe08a'); }   /* a torch beside each */
    rect(g, 0, 300, SW, 180, al('#0c0a16', 0.6)); },
  library(g) { rect(g, 0, 0, SW, SH, al('#161024', 0.94));
    for (let i = 0; i < 2; i++) { const x = i * 128; shelvesBack(g, x + 2, 40, 40, 250, 0.7); shelvesBack(g, x + 86, 40, 40, 250, 0.7);
      arch(g, x + 48, 56, 32, 150, '#3a5a9a', '#5a4a70'); rect(g, x + 63, 66, 2, 140, '#241a34'); rect(g, x + 50, 120, 28, 2, '#241a34'); rect(g, x + 54, 60, 10, 4, '#6a9ad8');   /* a moon window */
      rect(g, x + 46, 52, 36, 4, '#5a4a70'); rect(g, x + 46, 52, 36, 1, '#8a7aa8'); }
    for (const x of [64, 192]) { rect(g, x, 0, 1, 30, '#4a3a60'); rect(g, x - 9, 30, 19, 3, AA.brassLo); rect(g, x - 9, 30, 19, 1, AA.brass); for (const k of [-8, -3, 2, 7]) { rect(g, x + k, 24, 2, 6, AA.parch); px(g, x + k, 22, AA.candle); px(g, x + k, 21, AA.flame); } }   /* a hanging candle ring */
    rect(g, 0, 0, SW, 14, al('#08060e', 0.7)); rect(g, 0, 380, SW, 100, al('#08060e', 0.5)); },
  lecture(g) { rect(g, 0, 0, SW, SH, al('#10162a', 0.94));
    for (let i = 0; i < 2; i++) { const x = i * 128;
      rect(g, x + 4, 44, 6, 250, '#222c48'); rect(g, x + 4, 44, 1, 250, '#4a5a88'); rect(g, x + 118, 44, 6, 250, '#222c48'); rect(g, x + 118, 44, 1, 250, '#4a5a88');   /* pillars */
      arch(g, x + 20, 70, 26, 110, '#2a4a8a', '#4a5a88'); rect(g, x + 32, 78, 2, 100, '#1a2440');                                                                    /* a stained window */
      for (let k = 0; k < 5; k++) { rect(g, x + 22, 104 + k * 14, 22, 5, al(AA.house[(i + k) % 3], 0.8)); }
      banner(g, x + 62, 62, 64, 0, (i * 2) % 3, i % 3); banner(g, x + 92, 62, 52, 0, (i * 2 + 1) % 3, (i + 1) % 3);
      rect(g, x + 54, 190, 62, 38, '#0c1220'); rect(g, x + 53, 189, 64, 1, '#6a7ca8'); rect(g, x + 53, 228, 64, 1, '#6a7ca8');   /* a chalkboard */
      line(g, x + 60, 214, x + 72, 200, al('#efe6d2', 0.8)); line(g, x + 72, 200, x + 84, 214, al('#efe6d2', 0.8)); rect(g, x + 88, 200, 20, 1, al('#efe6d2', 0.7)); rect(g, x + 88, 206, 14, 1, al('#efe6d2', 0.6)); rect(g, x + 88, 212, 18, 1, al('#efe6d2', 0.6)); circle(g, 100 + x, 218, 3, al('#9fd8ff', 0.5)); }
    rect(g, 0, 0, SW, 12, al('#06080e', 0.7)); rect(g, 0, 400, SW, 80, al('#06080e', 0.5)); },
  yard(g) { rect(g, 0, 0, SW, SH, al('#1a1438', 0.34));
    for (let i = 0; i < 2; i++) { const x = i * 128;   /* a cloister arcade, far off */
      rect(g, x, 190, 128, 6, al('#2a2c4a', 0.9)); for (let k = 0; k < 4; k++) { rect(g, x + k * 32 + 2, 196, 6, 70, al('#242642', 0.95)); arch(g, x + k * 32 + 8, 206, 18, 60, al('#10101e', 0.9), al('#2a2c4a', 0.9)); }
      rect(g, x, 190, 128, 1, al('#4a4c7a', 0.9)); }
    rect(g, 40, 60, 14, 134, al('#262846', 0.95)); rect(g, 36, 56, 22, 6, al('#34365a', 0.95)); rect(g, 44, 40, 6, 16, al('#262846', 0.95)); px(g, 46, 80, '#ffd36b'); px(g, 46, 112, '#ffd36b'); px(g, 47, 140, '#ffd36b');   /* a tower of the school */
    rect(g, 170, 96, 10, 98, al('#262846', 0.95)); rect(g, 167, 92, 16, 5, al('#34365a', 0.95)); px(g, 174, 120, '#ffd36b'); px(g, 175, 150, '#9fd8ff');
    for (let k = 0; k < 14; k++) { const q = hash(k, 3); px(g, q % SW, (q >> 8) % 160, k & 1 ? '#dce0f0' : '#9fd8ff'); }   /* stars */
    rect(g, 0, 300, SW, 180, al('#0c0a1c', 0.55)); },
  exam(g) { rect(g, 0, 0, SW, SH, al('#0e0c18', 0.95));
    for (let i = 0; i < 2; i++) { const x = i * 128;
      rect(g, x + 8, 30, 10, 300, '#24203a'); rect(g, x + 8, 30, 2, 300, '#4a4468'); rect(g, x + 6, 28, 14, 5, AA.brassLo); rect(g, x + 6, 28, 14, 1, AA.brass); rect(g, x + 6, 326, 14, 4, AA.brassLo);   /* a marble pillar, gold capital */
      for (let k = 0; k < 28; k++) px(g, x + 9 + (hash(k, i) % 7), 36 + k * 10, al('#8a84a8', 0.5));   /* veins */
      banner(g, x + 40, 56, 90, 0, i === 0 ? 0 : 1, i === 0 ? 0 : 1); banner(g, x + 80, 56, 70, 0, 2, 2);
      arch(g, x + 56, 130, 20, 70, '#1a1a38', '#4a4468'); circle(g, x + 66, 160, 4, al('#ffd36b', 0.28)); }
    rect(g, 0, 0, SW, 12, al('#04040a', 0.7)); rect(g, 0, 390, SW, 90, al('#04040a', 0.5)); },
};
/* blit a strip's columns [a, b) of the screen, scrolled by `scroll` px, down from y0 */
function blitStrip(g, st, a, b, scroll, y0) {
  a = Math.max(0, a); if (b <= a) return;
  for (let x = a; x < b;) { const sx = (((x + scroll) % SW) + SW) % SW, ch = Math.min(b - x, SW - sx); g.drawImage(st, sx, 0, ch, SH, x, y0, ch, SH); x += ch; }
}
/* THE PITS: each its own dark (archive: falling paper, spirits; orchestra: the empty seats; the summoning well: a violet vortex; the exam gap: pale) */
function drawWell(g, w, a, b, top, VH, time) {
  const bot = Math.max(VH, top + 40), n = (w.name || '');
  rect(g, a, top, b - a, bot - top, n === 'THE EXAM GAP' ? '#10101e' : '#0a0614');
  rect(g, a, top, b - a, 1, al(AA.glass, 0.35 + 0.15 * Math.sin(time * 2)));
  if (n === 'THE ARCHIVE') { for (let k = a + 6; k < b - 6; k += 9) { const ph = (time * 0.4 + hash(k, 1) % 10 / 10) % 1; rect(g, k, top + 6 + ph * (bot - top - 12), 3, 1, al(AA.parch, 0.5 * (1 - ph))); }
    for (let k = 0; k < 3; k++) { const x = a + 14 + ((hash(k, 5) % Math.max(1, b - a - 28))), y = top + 14 + Math.sin(time * 1.3 + k * 2) * 6 + k * 14; rect(g, x, y, 3, 3, al(AA.spell.levitate, 0.7)); px(g, x + 1, y + 3, al(AA.spell.levitate, 0.4)); px(g, x, y + 1, '#0a0614'); } }
  else if (n === 'THE ORCHESTRA PIT') { for (let r = 0; r < 3; r++) for (let k = a + 4; k < b - 4; k += 8) { rect(g, k, top + 14 + r * 12, 5, 6, al('#2a2040', 0.9)); rect(g, k, top + 14 + r * 12, 5, 1, al('#4a3a60', 0.9)); } }
  else { const cx = (a + b) / 2, cy = top + 22;   /* a vortex: dotted rings turning */
    for (let r = 0; r < 4; r++) { const rx = Math.max(6, (b - a) / 2 - 4 - r * ((b - a) / 9)), ry = 4 + r * 3; for (let k = 0; k < 14; k++) { const t = time * (r & 1 ? -0.8 : 0.8) + k * 0.4488 + r; px(g, R(cx + Math.cos(t) * rx), R(cy + r * 9 + Math.sin(t) * ry), al(n === 'THE EXAM GAP' ? AA.parchLo : (k & 1 ? AA.glass : AA.spell.conjure), 0.8 - r * 0.15)); } } }
}
/* A CHANDELIER/GALLERY CHAIN, a hung gallery's two chains up to the ceiling */
function chains(g, x, y0, y1) { for (let yy = y0; yy < y1; yy += 3) { rect(g, x, yy, 1, 2, AA.ironHi); rect(g, x + 1, yy + 1, 1, 2, '#1a1824'); } }
/* THE BACKDROP: the room's back wall (parallax 0.4 across, 0.35 down), the galleries' chains, the pits, the library door's light */
export function drawBackdrop(g, cx, cy, VW, VH, time, G, L, o = {}) {
  const zones = [['steps', 0, 18], ['library', 18, 100], ['lecture', 100, 180], ['yard', 180, 250], ['exam', 250, 340]], y0 = R(-cy * 0.35 - 20);
  for (const [z, c0, c1] of zones) { const a = R(c0 * TS - cx), b = R(c1 * TS - cx); if (b < 0 || a > VW) continue; blitStrip(g, strip(z), a, Math.min(VW, b), R(cx * 0.4), y0);
    if (z !== 'yard' && z !== 'steps') { if (a > -8 && a < VW) rect(g, a, 0, 8, VH, al('#04040a', 0.45)); if (b - 8 > 0 && b - 8 < VW) rect(g, b - 8, 0, 8, VH, al('#04040a', 0.45)); } }
  /* motes of light in the air (dust in the moonbeams / drifting candle sparks) */
  for (let k = 0; k < 16; k++) { const hx = hash(k, 17), mx = ((hx % (VW + 40)) + R(time * (4 + (hx >> 9) % 5) * (k & 1 ? 1 : -1)) + VW * 4) % (VW + 40) - 20, my = (((hx >> 12) % VH) + R(Math.sin(time * 0.7 + k) * 5) + VH * 4) % VH; px(g, mx, my, al(k % 3 ? '#ffd36b' : '#9fd8ff', 0.18 + 0.12 * Math.sin(time * 2 + k))); }
  if (!G || !L) return; const x = v => R(v - cx), y = v => R(v - cy);
  for (const w of G.wells || []) { const a = x(w.x0 * TS), b = x((w.x1 + 1) * TS); if (b < 0 || a > VW) continue; drawWell(g, w, a, b, y(G.catchY - 80), VH, time); }
  for (const h of L.hullZones || []) if (h[2] === h[3] && h[3] < 36) { for (const hx of [h[0] * TS + 4, (h[1] + 1) * TS - 5]) { const px0 = x(hx); if (px0 < -2 || px0 > VW + 2) continue; chains(g, px0, 0, y(h[2] * TS)); } }   /* the high galleries hang from the rafters */
  /* THE LIBRARY DOOR: the high door's gap (cols 96-99, rows 23-25) is a lit corridor; THE EXIT GATE of the Examination when she has closed the register */
  const dx = x(96 * TS), dy = y(23 * TS); if (dx > -80 && dx < VW) { rect(g, dx, dy, 4 * TS, 3 * TS, '#2a2038'); for (let k = 0; k < 4; k++) rect(g, dx + k * 16, dy, 16, 48, al(AA.candle, 0.07 + 0.04 * k)); rect(g, dx + 40, dy + 2, 20, 46, al(AA.candleHi, 0.12 + 0.05 * Math.sin(time * 2))); rect(g, dx, dy, 4 * TS, 3, '#5a4a70'); }
  const A = L.arena; if (A) { const gx = x((A.wallR) * TS), gy = y((A.floor / TS - 5) * TS); if (gx > -20 && gx < VW + 20) {
    const open = !!o.exitOpen; if (open) { rect(g, gx - 30, gy + 16, 46, 64, al(AA.candleHi, 0.1 + 0.06 * Math.sin(time * 3))); for (let k = 0; k < 5; k++) rect(g, gx - 24 + k * 9, gy + 12, 3, 68, al(AA.candle, 0.12)); }
    rect(g, gx - 5, gy - 1, 6, 82, open ? al('#ffd36b', 0.5) : al('#ff6b6b', 0.0)); } }
}

/* ================================ DECOR (props standing on the floor, drawn behind the tiles' foot traffic) ================================ */
const decorCache = new WeakMap();
function decorList(L, at, T) {
  const key = L; if (decorCache.has(key)) return decorCache.get(key);
  const out = [], W = L.W, H = L.H, ents = L.ents || [], near = x => ents.some(e => Math.abs(e.x - x) <= 1);
  const A = L.arena, F = 40;
  for (let x = 2; x < W - 2; x += 1) {
    const hh = hash(x, 91); if (hh % 9 !== 0) continue; if (near(x)) continue;
    let y = -1; for (let yy = 4; yy < H - 1; yy++) { const t = at(x, yy), up = at(x, yy - 1); if (t === T.SOLID && up === T.AIR && at(x, yy - 2) === T.AIR && at(x, yy - 3) === T.AIR) { y = yy; if (yy >= 20) break; } }
    if (y < 0 || at(x - 1, y) !== T.SOLID || at(x + 1, y) !== T.SOLID) continue; if (inBox(L.hullZones, x, y)) continue;
    const z = zoneOf(x, L); if (A && x >= A.wallL && (x < A.wallL + 3 || x > A.wallR - 3)) continue;
    const kinds = z === 'library' ? ['candle', 'books', 'globe', 'candle'] : z === 'lecture' ? ['easel', 'candle', 'desk', 'candle'] : z === 'yard' ? ['globe', 'books', 'candle'] : z === 'exam' ? ['candle', 'desk', 'books'] : ['candle', 'books'];
    out.push({ x: x * TS + 8, y: y * TS, kind: kinds[(hh >> 4) % kinds.length], v: hh >> 9 });
  }
  decorCache.set(key, out); return out;
}
function decorSprite(kind, v) {
  return once('dc' + kind + (v & 3), () => { const [c, g] = canvas(24, 26);
    if (kind === 'candle') { rect(g, 10, 22, 4, 3, '#4a4658'); rect(g, 11, 12, 2, 10, AA.brass); rect(g, 8, 11, 8, 2, AA.brassLo); rect(g, 8, 11, 8, 1, AA.brass); for (const sx of [8, 15]) { rect(g, sx, 8, 1, 4, AA.brass); } rect(g, 11, 6, 2, 5, AA.parch); rect(g, 7, 7, 2, 4, AA.parchLo); rect(g, 15, 7, 2, 4, AA.parchLo); }
    else if (kind === 'books') { rect(g, 4, 20, 16, 5, AA.books[v & 7]); rect(g, 4, 20, 16, 1, al('#ffffff', 0.3)); rect(g, 4, 23, 16, 1, AA.brass); rect(g, 6, 16, 13, 4, AA.books[(v + 3) & 7]); rect(g, 6, 16, 13, 1, al('#ffffff', 0.3)); rect(g, 9, 12, 9, 4, AA.books[(v + 5) & 7]); rect(g, 9, 12, 9, 1, al('#ffffff', 0.3)); rect(g, 4, 21, 1, 3, AA.parch); rect(g, 19, 21, 1, 3, AA.parch); px(g, 15, 11, AA.parch); px(g, 16, 10, AA.parch); }
    else if (kind === 'globe') { rect(g, 10, 22, 6, 3, '#4a4658'); rect(g, 12, 15, 2, 7, AA.brassLo); circle(g, 12.5, 10, 7, '#2a4a8a'); circle(g, 11, 8.5, 2.5, '#5a8ae0'); rect(g, 9, 10, 5, 2, '#3a7a5a'); rect(g, 12, 7, 3, 2, '#3a7a5a'); rect(g, 5, 10, 15, 1, AA.brass); rect(g, 12, 2, 1, 16, AA.brassLo); px(g, 8, 6, '#dcecff'); }
    else if (kind === 'easel') { rect(g, 3, 6, 18, 12, '#0c1220'); rect(g, 2, 5, 20, 1, '#6a7ca8'); rect(g, 2, 18, 20, 1, '#6a7ca8'); rect(g, 2, 5, 1, 14, '#6a7ca8'); rect(g, 21, 5, 1, 14, '#6a7ca8'); line(g, 5, 15, 9, 9, al('#efe6d2', 0.85)); line(g, 9, 9, 13, 15, al('#efe6d2', 0.85)); rect(g, 14, 9, 5, 1, al('#efe6d2', 0.7)); rect(g, 14, 12, 4, 1, al('#efe6d2', 0.7)); rect(g, 4, 19, 2, 6, '#4a4658'); rect(g, 18, 19, 2, 6, '#4a4658'); rect(g, 6, 18, 12, 1, '#2a2634'); rect(g, 8, 17, 3, 1, '#ffffff'); }
    else { rect(g, 3, 14, 18, 3, '#6a6488'); rect(g, 3, 14, 18, 1, '#9a94b8'); rect(g, 5, 17, 3, 8, '#4a4658'); rect(g, 16, 17, 3, 8, '#4a4658'); rect(g, 6, 11, 8, 3, AA.parch); rect(g, 6, 11, 8, 1, '#ffffff'); rect(g, 7, 12, 6, 1, AA.parchDeep); rect(g, 17, 8, 1, 6, '#2a2038'); rect(g, 16, 7, 3, 2, '#0a0814'); rect(g, 18, 3, 1, 5, '#efe6d2'); px(g, 19, 3, '#ffffff'); }
    return c; });
}
export function drawDecor(g, cx, cy, VW, VH, time, L, at, T) {
  if (!L || !L.academy) return; const list = decorList(L, at, T);
  for (const d of list) { const sx = R(d.x - cx) - 12; if (sx < -26 || sx > VW + 2) continue; const sy = R(d.y - cy) - 26; if (sy < -30 || sy > VH + 4) continue; g.drawImage(decorSprite(d.kind, d.v), sx, sy);
    if (d.kind === 'candle') { const fx = sx + 12, fy = sy + 5, fl = Math.sin(time * 9 + d.x) * 1; for (const [ox, oy] of [[0, 0], [-4, 1], [3, 1]]) { rect(g, fx + ox - 1, fy + oy - 3 + fl, 2, 3, AA.candle); px(g, fx + ox, fy + oy - 4 + fl, AA.candleHi); px(g, fx + ox, fy + oy - 2, AA.flame); } rect(g, fx - 8, fy - 8, 17, 12, al(AA.candle, 0.07 + 0.03 * Math.sin(time * 6 + d.x))); } }
}

/* ================================ THE SPELLBOOK FLOCK ================================ */
const bookTints = [0, 1, 2, 3, 4];
/* a flying book, frame f (0 wings up, 1 half, 2 wings down, 3 half): 16 x 12, anchor (8, 6) */
function bookSprite(ci, f, white) {
  return once('bk' + ci + f + (white ? 'w' : ''), () => { const [c, g] = canvas(16, 12), col = AA.books[ci % 8], hi = al('#ffffff', 0.3);
    const wing = (side, dy, ang) => { const x0 = side < 0 ? 1 : 9;   /* a page-wing: 6 wide */
      rect(g, x0, 3 + dy, 6, 4 - Math.abs(ang), '#efe6d2'); rect(g, x0, 3 + dy, 6, 1, '#ffffff'); rect(g, x0 + (side < 0 ? 0 : 5), 3 + dy, 1, 4 - Math.abs(ang), AA.parchLo); if (ang !== 0) rect(g, x0 + (side < 0 ? 0 : 3), 3 + dy + (ang > 0 ? 3 : 0), 3, 1, AA.parchLo); rect(g, x0 + 1, 5 + dy, 4, 1, al('#8a7a5a', 0.6)); };
    const dy = [-2, 0, 2, 0][f], ang = [1, 0, -1, 0][f];
    wing(-1, dy, ang); wing(1, dy, ang);
    rect(g, 6, 3, 4, 6, col); rect(g, 6, 3, 1, 6, hi); rect(g, 9, 3, 1, 6, al('#000000', 0.35)); rect(g, 6, 5, 4, 1, AA.brass); px(g, 7, 7, AA.brassHi);   /* the spine */
    return white ? whiten(c) : c; });
}
/* a CLOSED book (the stream, the gathered line): 12 x 7 facing right, anchor (6, 3) */
function closedBook(ci, white) {
  return once('cb' + ci + (white ? 'w' : ''), () => { const [c, g] = canvas(12, 8), col = AA.books[ci % 8];
    rect(g, 1, 1, 10, 6, col); rect(g, 1, 1, 10, 1, al('#ffffff', 0.3)); rect(g, 1, 6, 10, 1, al('#000000', 0.35)); rect(g, 10, 2, 2, 4, '#efe6d2'); rect(g, 11, 2, 1, 4, AA.parchLo); rect(g, 3, 1, 1, 6, AA.brass); rect(g, 7, 3, 2, 2, AA.brass); px(g, 8, 3, AA.brassHi);
    return white ? whiten(c) : c; });
}
/* THE FLOCK (e: hp, mode, anim, face; e.x, e.y its centre): n books, one per 6 hp */
export function drawFlock(g, e, cx, cy, time, FLOCK) {
  const FL = FLOCK || { hp: 30, books: 5, orbit: 26 }, ex = R(e.x - cx), ey = R(e.y - cy), n = Math.max(1, Math.ceil(e.hp / (FL.hp / FL.books))), mode = e.mode, f = e.face || 1;
  const tell = mode === 'gatherTell', sc = mode === 'scattered', st = mode === 'stream', rg = mode === 'regroup';
  if (tell) { const p = 0.5 + 0.5 * Math.sin(time * 28); rect(g, ex - 18, ey - 8, 36, 16, al(AA.candleHi, 0.14 + 0.14 * p)); }
  for (let i = 0; i < n; i++) {
    const a = e.anim * (tell ? 6 : sc ? 3.2 : 2.4) + i * (Math.PI * 2 / n), rr = tell ? 5 : sc ? FL.orbit + 12 : rg ? FL.orbit * 0.9 : FL.orbit * 0.6;
    let bx = ex + Math.cos(a) * rr, by = ey + Math.sin(a) * rr * 0.5;
    if (st) { bx = ex - f * i * 8; by = ey + Math.sin(e.anim * 14 + i) * 1.5 + (i - n / 2) * 0.5; }
    if (tell) { bx = ex + (i - (n - 1) / 2) * 6 * f * 1; by = ey + Math.sin(time * 30 + i) * 1; }
    const ci = i % bookTints.length;
    if (st || tell) {
      const spr = closedBook(ci, tell && ((time * 20) | 0) % 2 === 0); g.drawImage(f < 0 ? mirror(spr) : spr, R(bx) - 6, R(by) - 3);
      if (st) { for (let k = 1; k <= 3; k++) rect(g, R(bx - f * (6 + k * 6)), R(by) - 1 + (k & 1), 5, 1, al('#efe6d2', 0.5 - k * 0.13)); rect(g, R(bx - f * 14), R(by) + 3, 4, 1, al('#efe6d2', 0.3)); px(g, R(bx - f * 22), R(by) - 3, al('#efe6d2', 0.4)); }
    } else {
      const fr = sc ? ((e.anim * 5 + i) | 0) % 4 : (((time * (rg ? 14 : 9) + i * 0.7) | 0) & 3);
      const spr = bookSprite(ci, fr, false); const sx = R(bx) - 8, sy = R(by) - 6 + (sc ? R(Math.sin(e.anim * 9 + i) * 3) : 0); g.drawImage(((i + (e.x | 0)) & 1) && !sc ? mirror(spr) : spr, sx, sy);
      if (sc) { px(g, R(bx) + Math.cos(time * 7 + i * 2) * 6, sy - 4 + Math.sin(time * 5 + i) * 2, al('#efe6d2', 0.9)); rect(g, R(bx) + 4, sy + 2 + ((time * 14 + i * 5) % 8), 3, 2, al('#efe6d2', 0.6)); }
    }
  }
  if (sc) { for (let k = 0; k < 3; k++) { const t = time * 5 + k * 2.09, sx = ex + Math.cos(t) * 12, sy = ey - 16 + Math.sin(t) * 3; rect(g, R(sx) - 1, R(sy), 3, 1, '#ffd36b'); rect(g, R(sx), R(sy) - 1, 1, 3, '#ffd36b'); } }
  if (tell) { rect(g, ex - 1, ey - 26, 2, 7, AA.candle); px(g, ex - 1, ey - 18, AA.candle); }   /* the told GATHER (main's MARK row draws the !; this is the glint) */
}
const mirrors = new Map(); function mirror(c) { if (!mirrors.has(c)) mirrors.set(c, flipX(c)); return mirrors.get(c); }
