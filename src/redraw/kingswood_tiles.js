// kingswood_tiles.js - THE KING'S HUNTING WOOD's own TILE KIT (claude/kingswood2art, Sonnet art pass). The greybox wore the generic autumn dirt and plank. This is the goblin KING's
// royal wood: his COURT keeps a road through it, so the road is paved, and the wood around the road is a hunting ground. Five looks, one per area (the sections of src/kingswood.js):
//   0 THE ROYAL ROAD        FLAGSTONE: the court's paved road, warm grey slabs in courses, a lit lip, moss in the joints; the checkpoint's wall and the gatehouse are the same stone, ashlar
//   1 THE HUNTING STANDS    ROOT-COBBLE: a worn cobbled hunt road, round stones in packed earth, dry gold grass on the lip; the decks are the hunters' scaffold boards, iron-strapped
//   2 THE CAGE GROVE        BARK: the great trunks and the grove's floor, red-brown ridged bark with leaf litter on every lip; the boughs are bark-on logs hung with moss
//   3 THE COURT'S PROCESSION FLAGSTONE again, sandstone and rose, courses worn by the court's feet (its crimson carpet is drawn by the game); the boughs are bark logs
//   4 THE KING'S HALL       BASALT with a thread of gold inlay; the galleries are carved dark timber, gold-studded
// Faces: stone masonry in the road and the hall, root cobble on the hill, bark in the grove. PORT: the court's iron portcullis, spiked at the foot.
// Made from px.js primitives, 16x16, baked lazily and memoised.   kingsTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

/* which area a column is in (src/kingswood.js SECTIONS) */
export const zoneOf = x => x < 122 ? 0 : x < 206 ? 1 : x < 306 ? 2 : x < 416 ? 3 : 4;
/* each zone's ramp of seven, dark to light (s0 the deepest joint ... s6 the sunlit lip), a gold or moss accent */
export const ZONE = [
  { s: ['#17121a', '#2a2228', '#463a3a', '#66564c', '#8a7660', '#b09a76', '#dcc898'], moss: ['#3a4a22', '#5a7a30', '#9aba50'], acc: '#e0b040', kind: 'flag' },
  { s: ['#1a1210', '#2e201a', '#4a3424', '#6a4a30', '#8c6840', '#b08a50', '#dcb468'], moss: ['#5a5a22', '#8a8630', '#c8b448'], acc: '#c9a83a', kind: 'cobble' },
  { s: ['#1c0e10', '#341618', '#52241e', '#74382a', '#9a5236', '#c07644', '#eaa85e'], moss: ['#6a3a1a', '#a85a20', '#e08a30'], acc: '#e08a30', kind: 'bark' },
  { s: ['#201418', '#3a2a2a', '#5c4642', '#82645a', '#a88470', '#cca88a', '#f2d4ae'], moss: ['#5a4a2a', '#8a7a3a', '#c8b060'], acc: '#e0b040', kind: 'flag' },
  { s: ['#0e0a10', '#1c141e', '#2e2230', '#463648', '#62485a', '#86667a', '#b8929e'], moss: ['#2a2230', '#463a4a', '#6a5a6a'], acc: '#e0b040', kind: 'flag' }];

/* the deeper under the open air, the darker */
const dk = (g, a) => { g.globalAlpha = a; rect(g, 0, 0, 16, 16, '#0a0608'); g.globalAlpha = 1; };

/* ---- ASHLAR / FLAGSTONE: courses of slabs, joints by ABSOLUTE pixel so neighbouring tiles agree. ch = course height, bw = slab width ---- */
function slabs(g, Z, x, y, y0, y1, base, lit, ch, bw) {
  for (let py = y0; py < y1; py++) for (let p = 0; p < 16; p++) {
    const ax = x * 16 + p, ay = y * 16 + py, row = Math.floor(ay / ch), off = (row * 7 + hash(row, 3) % 5) % bw, col = Math.floor((ax + off) / bw);
    const joint = ((ax + off) % bw === 0) || (ay % ch === 0), inRowTop = ay % ch === 1;
    const n = hash(col * 31 + row, row * 7 + col) % 100, sh = n < 18 ? -1 : n > 84 ? 1 : 0;
    let c = Z.s[Math.max(0, Math.min(6, base + sh))];
    if (joint) c = Z.s[Math.max(0, base - 2)]; else if (inRowTop) c = Z.s[Math.min(6, base + 1)];
    else if ((hash(ax, ay) % 23) === 0) c = Z.s[Math.max(0, base - 1)];
    px2(g, p, py, c); }
}
/* ---- ROOT COBBLE: round stones in packed earth, centres on an ABSOLUTE grid so the road runs on across tiles ---- */
function cobbles(g, Z, x, y, y0, y1, base) {
  rect(g, 0, y0, 16, y1 - y0, Z.s[Math.max(0, base - 2)]);
  const cw = 6, chh = 5;
  for (let cj = Math.floor((y * 16 + y0) / chh) - 1; cj <= Math.floor((y * 16 + y1) / chh) + 1; cj++) for (let ci = Math.floor(x * 16 / cw) - 1; ci <= Math.floor((x * 16 + 16) / cw) + 1; ci++) {
    const hh = hash(ci * 13 + 5, cj * 17 + 9), cxp = ci * cw + (cj & 1 ? 3 : 0) + (hh % 3) - 1 - x * 16, cyp = cj * chh + 2 + ((hh >> 4) % 2) - y * 16, rx = 2 + ((hh >> 8) % 2), ry = 2;
    const tone = [base - 1, base, base, base + 1][(hh >> 12) % 4];
    for (let dy = -ry; dy <= ry; dy++) for (let dx = -rx - 1; dx <= rx + 1; dx++) { const px_ = cxp + dx, py_ = cyp + dy; if (py_ < y0 || py_ >= y1) continue;
      const d = (dx * dx) / ((rx + 0.6) * (rx + 0.6)) + (dy * dy) / ((ry + 0.4) * (ry + 0.4)); if (d > 1) continue;
      const c = d > 0.72 ? Z.s[Math.max(0, tone - 2)] : (dx + dy < -1 ? Z.s[Math.min(6, tone + 2)] : Z.s[Math.max(0, Math.min(6, tone))]); px2(g, px_, py_, c); } }
}
/* ---- BARK: the grain runs up the trunk; strips of shade, a furrow now and then, a knot ---- */
function bark(g, Z, x, y, y0, y1, base, lit) {
  for (let py = y0; py < y1; py++) for (let p = 0; p < 16; p++) { const ax = x * 16 + p, ay = y * 16 + py, band = Math.floor(ax / 3), n = hash(band, 11) % 100, sh = n < 25 ? -1 : n > 78 ? 1 : 0;
    let c = Z.s[Math.max(0, Math.min(6, base + sh + (lit ? 1 : 0)))];
    if (ax % 3 === 0 && (hash(band, Math.floor(ay / 9)) % 3) !== 0) c = Z.s[Math.max(0, base - 2)];
    else if ((hash(ax, ay) % 19) === 0) c = Z.s[Math.max(0, base - 1)];
    px2(g, p, py, c); }
}
const body = (g, Z, x, y, y0, y1, base, lit) => { const k = Z.kind; if (k === 'bark') bark(g, Z, x, y, y0, y1, base, lit); else if (k === 'cobble') cobbles(g, Z, x, y, y0, y1, base); else slabs(g, Z, x, y, y0, y1, base, lit, k === 'flag' && Z === ZONE[4] ? 8 : 8, Z === ZONE[3] ? 20 : 16); };

/* dry grass / leaf litter on a lip */
function lipLitter(g, Z, x, y, zone) {
  for (let k = 0; k < 16; k++) { const hh = hash(x * 16 + k, y * 5 + 2) % 9, h = hh < 2 ? 0 : hh < 6 ? 1 : hh < 8 ? 2 : 3;
    if (h > 0) { rect(g, k, 0, 1, h, Z.moss[hh === 8 ? 2 : hh < 4 ? 0 : 1]); if (h >= 2) px2(g, k, 0, Z.moss[2]); } }
  if (zone === 2 || zone === 3) for (let i = 0; i < 3; i++) { const lx = hash(x, y + i) % 14, c = ['#c9463d', '#e08a30', '#a83a2a'][hash(i, x) % 3]; rect(g, lx, 0, 2, 1, c); px2(g, lx + 1, 1, '#7a2a1a'); }
}

/* ============================ TOP ============================ */
function topTile(zone, x, y, eL, eR, deep) {
  return once('tp' + zone + '_' + (x % 10) + '_' + y % 9 + (eL ? 'l' : '') + (eR ? 'r' : '') + deep, () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone], r = mulberry(hash(x, y) + zone * 31);
    body(g, Z, x, y, 0, 16, 3, false);
    if (Z.kind === 'cobble') {   /* the profile of a cobbled road: round tops standing a little proud */
      rect(g, 0, 0, 16, 5, '#000'); g.clearRect(0, 0, 16, 5);
      rect(g, 0, 4, 16, 12, Z.s[2]); cobbles(g, Z, x, y, 1, 7, 4);
      for (let k = 0; k < 16; k += 1) { const hh = hash(x * 16 + k, 99) % 4; if (hh === 0) px2(g, k, 0, Z.moss[1]); }
      rect(g, 0, 7, 16, 1, Z.s[1]);
      cobbles(g, Z, x, y, 8, 16, 3);
    } else if (Z.kind === 'bark') {
      rect(g, 0, 0, 16, 3, Z.s[5]); rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 3, 16, 1, Z.s[2]); rect(g, 0, 4, 16, 1, Z.s[1]);
      for (let k = 0; k < 5; k++) { const fx = 1 + ((r() * 14) | 0), fl = 2 + ((r() * 4) | 0); for (let yy = 0; yy < fl; yy++) px2(g, fx, 5 + yy, yy === fl - 1 ? Z.s[1] : Z.s[2]); }
    } else {   /* flagstone: the paved lip */
      rect(g, 0, 0, 16, 2, Z.s[5]); rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 2, 16, 1, Z.s[4]); rect(g, 0, 3, 16, 1, Z.s[1]);
      for (let k = 0; k < 16; k++) if ((hash(x * 16 + k, 41) % 7) === 0) px2(g, k, 2, Z.moss[1]);   /* moss in the joints */
      const jx = ((x * 16 + 8 + hash(y, 5) % 4) % 16 + 16) % 16; rect(g, jx, 0, 1, 3, Z.s[2]);
      if (zone === 4) { rect(g, 0, 4, 16, 1, Z.acc); g.globalAlpha = 0.5; rect(g, 0, 5, 16, 1, '#7a5a20'); g.globalAlpha = 1; }   /* the hall's gold inlay thread */
      if (zone === 3 && (hash(x, y) % 6) === 0) { rect(g, 4, 1, 3, 1, Z.s[3]); rect(g, 9, 2, 2, 1, Z.s[3]); }   /* worn by the court's feet */
    }
    if (Z.kind !== 'flag') lipLitter(g, Z, x, y, zone); else if (zone === 3 && (hash(x, y) % 5) === 0) lipLitter(g, Z, x, y, zone);
    if (eL) { rect(g, 0, 1, 1, 15, Z.s[5]); px2(g, 0, 0, Z.s[6]); }
    if (eR) { rect(g, 15, 1, 1, 15, Z.s[0]); rect(g, 14, 3, 1, 13, Z.s[1]); }
    if (deep) dk(g, deep);
    return c; });
}
/* ============================ FACE ============================ */
function faceTile(zone, x, y, eL, eR, deep) {
  return once('fc' + zone + '_' + (x % 10) + '_' + y + (eL ? 'l' : '') + (eR ? 'r' : '') + deep, () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone], r = mulberry(hash(x, y) + zone * 47);
    body(g, Z, x, y, 0, 16, eL ? 3 : 2, !!eL);
    if (Z.kind === 'bark' && r() < 0.28) { const kx = 4 + ((r() * 8) | 0), ky = 4 + ((r() * 8) | 0); for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const d = Math.hypot(dx, dy * 1.3); if (d <= 2.2) px2(g, kx + dx, ky + dy, d < 1 ? Z.s[0] : d < 1.7 ? Z.s[1] : Z.s[4]); } }
    if (Z.kind === 'flag' && zone === 0 && (hash(x, y) % 17) === 0) { rect(g, 6, 5, 4, 1, '#0c080a'); rect(g, 7, 6, 2, 3, '#0c080a'); }   /* an arrow slit in the court's wall */
    if (Z.kind === 'cobble' && (hash(x, y) % 13) === 0) { rect(g, 3, 2, 10, 2, Z.moss[0]); rect(g, 5, 2, 6, 1, Z.moss[1]); }
    if (eL) { rect(g, 0, 0, 1, 16, Z.s[6]); rect(g, 1, 0, 1, 16, Z.s[5]); }
    if (eR) { rect(g, 15, 0, 1, 16, Z.s[0]); rect(g, 14, 0, 1, 16, Z.s[1]); g.globalAlpha = 0.18; rect(g, 11, 0, 3, 16, '#000'); g.globalAlpha = 1; }
    if (deep) dk(g, deep);
    return c; });
}
function ceilTile(zone, x, y, eL, eR, deep) {
  return once('ce' + zone + '_' + (x % 10) + '_' + y + (eL ? 'l' : '') + (eR ? 'r' : '') + deep, () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone], r = mulberry(hash(x, y) + zone * 53);
    body(g, Z, x, y, 0, 16, 2, false);
    g.globalAlpha = 0.5; rect(g, 0, 9, 16, 7, '#000'); g.globalAlpha = 0.28; rect(g, 0, 5, 16, 4, '#000'); g.globalAlpha = 1;
    if (Z.kind === 'bark') for (let k = 0; k < 5; k++) { const nx = (r() * 15) | 0, nl = 1 + ((r() * 3) | 0); rect(g, nx, 15 - nl, 1, nl, Z.s[2]); }
    rect(g, 0, 15, 16, 1, Z.s[0]); if (eL) rect(g, 0, 0, 1, 16, Z.s[5]); if (eR) rect(g, 15, 0, 1, 16, Z.s[0]);
    if (deep) dk(g, deep);
    return c; });
}
function massTile(zone, x, y, d) {
  return once('ma' + zone + '_' + (x % 10) + '_' + y + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    body(g, Z, x, y, 0, 16, d <= 1 ? 2 : 1, false);
    g.globalAlpha = [0, 0.05, 0.1, 0.15, 0.2, 0.24, 0.28][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#0a0608'); g.globalAlpha = 1;
    return c; });
}

/* ============================ DECKS AND BOUGHS (the one-way ledges) ============================ */
/* THE HUNTERS' DECK (the road's ledges and the stands): broad boards, a lit top, nail heads, an iron strap at the end, the beam under it */
function deck(zone, l, rr, v) {
  return once('dk' + zone + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), Z = ZONE[zone];
    const W = ['#c08a50', '#a8723a', '#8a5a2c', '#6a4220', '#4a2c14', '#2e1a0c'];
    rect(g, 0, 0, 16, 5, W[1]); rect(g, 0, 0, 16, 1, '#e8c07a'); rect(g, 0, 1, 16, 1, W[0]); rect(g, 0, 4, 16, 1, W[3]);
    rect(g, 0, 5, 16, 2, W[2]); rect(g, 0, 7, 16, 1, W[4]); rect(g, 0, 8, 16, 1, W[5]);
    const seam = v === 0 ? [5, 12] : v === 1 ? [3, 10] : [7, 14]; for (const sx of seam) { rect(g, sx, 1, 1, 4, W[4]); px2(g, sx + 1, 1, W[0]); }
    for (let k = 0; k < 6; k++) px2(g, (hash(v * 9 + k, zone) % 16), 1 + k % 3, k % 2 ? W[0] : W[3]);   /* the grain */
    for (const sx of seam) { px2(g, sx - 2, 2, '#2e1a0c'); px2(g, sx + 3, 2, '#2e1a0c'); }   /* nail heads */
    if (v === 1) { rect(g, 6, 5, 4, 4, W[4]); rect(g, 6, 5, 4, 1, W[2]); }   /* a crossbeam under the board */
    if (l) { rect(g, 0, 0, 3, 8, '#3a3a40'); rect(g, 0, 0, 3, 1, '#9a9aa4'); px2(g, 1, 3, '#c0c0c8'); px2(g, 1, 6, '#c0c0c8'); }    /* iron strap cap, bolted */
    if (rr) { rect(g, 13, 0, 3, 8, '#3a3a40'); rect(g, 13, 0, 3, 1, '#9a9aa4'); px2(g, 14, 3, '#c0c0c8'); px2(g, 14, 6, '#c0c0c8'); }
    if (zone === 0 && (hash(v, l ? 1 : 2) % 3) === 0) { rect(g, 5, 0, 6, 1, '#a83a2a'); }   /* a strip of the court's red */
    g.globalAlpha = 0.28; rect(g, 0, 9, 16, 3, '#000'); g.globalAlpha = 1;
    return c; });
}
/* THE BOUGH (the grove's and the procession's ledges): a bark-on limb, a lit top with moss and leaves, the round belly, root hair under it, a rope turn */
function bough(zone, l, rr, v) {
  return once('bg' + zone + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), Z = ZONE[zone === 2 ? 2 : 2], r = mulberry(v * 17 + zone);
    rect(g, 0, 0, 16, 5, Z.s[4]); rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]); rect(g, 0, 4, 16, 1, Z.s[3]);
    rect(g, 0, 5, 16, 2, Z.s[2]); rect(g, 0, 7, 16, 1, Z.s[1]); rect(g, 0, 8, 16, 1, Z.s[0]);
    for (let i = 0; i < 6; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 4) | 0), r() < 0.5 ? Z.s[3] : Z.s[5]);
    for (let k = 1; k < 16; k += 3) px2(g, k, 9 + (k & 1), Z.s[0]);
    for (let k = 0; k < 16; k++) { const hh = hash(k + v * 5, zone) % 7; if (hh === 0) { px2(g, k, 0, '#e08a30'); px2(g, k, -1, '#c9463d'); } else if (hh === 1) px2(g, k, 0, '#6a7a2a'); }
    if (v === 0) { for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.hypot(dx / 2, dy) <= 1) px2(g, 10 + dx, 3 + dy, dy === 0 ? Z.s[0] : Z.s[2]); }
    if (v === 2) { rect(g, 6, 0, 3, 8, '#c9a060'); rect(g, 6, 0, 3, 1, '#f0e0b0'); px2(g, 7, 2, Z.s[0]); px2(g, 7, 5, Z.s[0]); }   /* a turn of the court's rope */
    if (l) { rect(g, 0, 0, 2, 8, Z.s[5]); px2(g, 0, 3, Z.s[0]); } if (rr) { rect(g, 14, 0, 2, 8, Z.s[2]); px2(g, 15, 3, Z.s[0]); }
    g.globalAlpha = 0.3; rect(g, 0, 9, 16, 3, '#000'); g.globalAlpha = 1;
    return c; });
}
/* THE BURNT BOUGH (claude/kingsfix2, Daniel 10-23: "chandeliers after the first boss section don't make sense - it's a wood, not a palace: just floating wood blocks"): the ledges of
   the burning wood and the glade, past his hall - a rough scorched limb, bark on its edge, a rope stub or two hanging from its belly, ember in the cracks; no gold, no iron, no candles */
const CHAR = ['#0c0706', '#1a0f0b', '#2c1a12', '#47291b', '#683a24', '#8a5232', '#b06a3a'];
function charBough(l, rr, v) {
  return once('cb' + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 29 + 5);
    rect(g, 0, 0, 16, 5, CHAR[3]); rect(g, 0, 0, 16, 1, CHAR[5]); rect(g, 0, 1, 16, 1, CHAR[4]); rect(g, 0, 4, 16, 1, CHAR[2]);
    rect(g, 0, 5, 16, 2, CHAR[2]); rect(g, 0, 7, 16, 1, CHAR[1]); rect(g, 0, 8, 16, 1, CHAR[0]);
    for (let k = 1; k < 16; k += 3) { const hh = hash(k + v * 7, 3) % 3; rect(g, k, 1 + hh, 1, 3, CHAR[1]); }   /* the bark's furrows */
    for (let i = 0; i < 5; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 4) | 0), r() < 0.5 ? CHAR[2] : CHAR[5]);
    for (let k = 0; k < 16; k++) { const hh = hash(k + v * 5, 9) % 11; if (hh === 0) { px2(g, k, 0, '#a89a8a'); px2(g, k, -1, '#6a5a4a'); } else if (hh === 1) { px2(g, k, 2, '#ff9a3c'); px2(g, k, 3, '#a83a1c'); } }   /* ash on the lip, a coal in a crack */
    if (v === 0) { for (let dy = -1; dy <= 1; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.hypot(dx / 2, dy) <= 1) px2(g, 10 + dx, 3 + dy, dy === 0 ? CHAR[0] : CHAR[2]); }   /* a knot */
    if (v === 2) { rect(g, 6, 8, 2, 6, '#8a6a3a'); rect(g, 6, 8, 1, 6, '#c9a060'); px2(g, 5, 13, '#c9a060'); px2(g, 8, 14, '#8a6a3a'); px2(g, 6, 14, '#c9a060'); }   /* a rope stub hanging from the belly, frayed at the end */
    if (v === 1) { rect(g, 11, 8, 1, 4, '#8a6a3a'); px2(g, 11, 12, '#c9a060'); px2(g, 12, 12, '#8a6a3a'); }
    for (let k = 2; k < 16; k += 4) px2(g, k, 9 + (k & 1), CHAR[0]);   /* root hair under it */
    if (l) { rect(g, 0, 0, 2, 8, CHAR[5]); px2(g, 0, 3, CHAR[0]); } if (rr) { rect(g, 14, 0, 2, 8, CHAR[2]); px2(g, 15, 3, CHAR[0]); }
    g.globalAlpha = 0.3; rect(g, 0, 9, 16, 3, '#000'); g.globalAlpha = 1;
    return c; });
}
/* THE HALL's gallery: carved dark timber, gold studs, a gold lip */
function hallTimber(l, rr, v) {
  return once('ht' + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), Z = ZONE[4];
    rect(g, 0, 0, 16, 6, '#3a2230'); rect(g, 0, 0, 16, 1, '#e0b040'); rect(g, 0, 1, 16, 1, '#8a6a3a'); rect(g, 0, 5, 16, 1, '#1a0e16');
    rect(g, 0, 6, 16, 2, '#2a1824'); rect(g, 0, 8, 16, 1, '#100a10');
    for (const sx of [3, 11]) { px2(g, sx, 2, '#e0b040'); px2(g, sx, 3, '#8a6a3a'); }
    for (let k = 1; k < 16; k += 2) px2(g, k, 4, Z.s[2]);
    if (v === 1) { rect(g, 6, 2, 4, 2, '#a83a2a'); rect(g, 7, 2, 2, 1, '#e0b040'); }
    if (l) { rect(g, 0, 0, 2, 8, '#e0b040'); rect(g, 0, 1, 1, 6, '#fff0a8'); } if (rr) { rect(g, 14, 0, 2, 8, '#8a6a20'); }
    g.globalAlpha = 0.3; rect(g, 0, 9, 16, 3, '#000'); g.globalAlpha = 1;
    return c; });
}
/* THE COURT'S PORTCULLIS: iron bars with their cross-straps, a spiked foot */
function portcullis(x, y, foot, zone) {
  return once('pc' + (x & 1) + (foot ? 'f' : '') + zone, () => { const [c, g] = canvas(16, 16);
    g.globalAlpha = 0.55; rect(g, 0, 0, 16, 16, '#0a0608'); g.globalAlpha = 1;
    for (const bx of [1, 5, 9, 13]) { rect(g, bx, 0, 2, 16, '#3a3a42'); rect(g, bx, 0, 1, 16, '#8a8a96'); rect(g, bx + 1, 0, 1, 16, '#18181e'); if (foot) { rect(g, bx, 12, 2, 2, '#3a3a42'); rect(g, bx, 14, 1, 2, '#c0c0c8'); } }
    for (const by of (x & 1) ? [4] : [10]) { rect(g, 0, by, 16, 1, '#2a2a32'); rect(g, 0, by + 1, 16, 1, '#6a6a76'); }
    if (y % 3 === 0) for (const bx of [1, 5, 9, 13]) px2(g, bx, 8, '#e0b040');
    return c; });
}

export const deckCell = (zone, l, r, v) => deck(zone, l, r, v);
const deepOf = y => y < 24 ? 0 : Math.min(0.3, (y - 24) * 0.03);
export function kingsTile(t, x, y, at, T, L) {
  const zone = zoneOf(x);
  if (t === T.PORT) { const foot = at(x, y + 1) !== T.PORT; return portcullis(x, y, foot, zone); }
  if (t === T.ONEWAY) {
    const same = k => at(x + k, y) === t, l = !same(-1), r = !same(1), v = ((x * 5 + y) % 3 + 3) % 3;
    return x >= 478 ? charBough(l, r, v) : zone === 4 ? hallTimber(l, r, v) : zone >= 2 ? bough(zone, l, r, v) : deck(zone, l, r, v);   /* (claude/kingsfix2) past his hall: scorched limbs, not gilt timber */
  }
  if (t !== T.SOLID) return null;
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET; };
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0), dp = Math.round(deepOf(y) * 100) / 100;
  if (up) return topTile(zone, x, y, eL, eR, dp);
  if (down) return ceilTile(zone, x, y, eL, eR, dp);
  if (eL || eR) return faceTile(zone, x, y, eL, eR, dp);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  return massTile(zone, x, y, d);
}
