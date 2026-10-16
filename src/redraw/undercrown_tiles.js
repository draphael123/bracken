// undercrown_tiles.js - THE UNDERCROWN's own TILE KIT (claude/undercrown2art). The greybox wore the crags' gravel and the mine staging. This is the hole under a castle:
// the old workings were cut into the castle's own FOOTINGS and then followed the iron down, so the rock changes as you go (the zone of a cell is its row, with a ragged seam):
//   zone 0 THE FOOTINGS   rows < 46    warm DRESSED FOUNDATION STONE: ashlar courses with mortar, a lit chamfer, the vault's underside, timber lagging under the roof
//   zone 1 THE DEAD WATER rows 46-129  wet hewn rock, black-green, slime on every lip and a drip off every ceiling (the poison pools' green)
//   zone 2 THE GLITTER    x >= 97, rows 104-129   the iron ran out into glass: violet rock with crystal shards, glints
//   zone 3 THE DIGGINGS   rows 130-143  the goblins' own work: raw-cut clay-brown rock with PICK MARKS, bone flecks, rubble on the lips
//   zone 4 THE TOMB       rows >= 144   a prince's vault: dark royal ashlar, big blocks, a gold inlay line, no pick marks
//   SOLID  TOP   a lit lip + the course under it, grit    FACE  the wall, lit on the left    CEIL  the underside (vault / lagging / drip)    MASS  packed rock, courses fading to rubble
//   SLAB   the roof course of a span (L.slabs): big dressed blocks, iron ties at the thirds, a keystone - so a roof you can bring down READS as a slab on posts
//   ONEWAY / PLANK  boards: nailed deal planks with an iron strap, drip-stained
// Made from px.js primitives, 16x16, baked lazily and memoised.   ucTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

export const ZONE = [
  /* 0 the footings: warm grey-brown ashlar */
  { s: ['#14100f', '#241c1a', '#382b26', '#4f3f35', '#6a5648', '#8a7260', '#b49d84'], moss: ['#3a3a24', '#5a5a30', '#8c8c4a'], joint: '#120d0c', acc: '#c8a064' },
  /* 1 the dead water: wet black-green rock, poison-green slime */
  { s: ['#0b1113', '#141e1f', '#1f2e2e', '#2e4240', '#425c56', '#5c7c70', '#86a896'], moss: ['#233f16', '#44721f', '#8ac03a'], joint: '#091012', acc: '#a6e04a' },
  /* 2 the glitter vein: violet rock, crystal */
  { s: ['#0e0b1a', '#1a1630', '#2a2446', '#3e3668', '#58498e', '#7c6cb8', '#aa9ae4'], moss: ['#2c2250', '#4c3c86', '#9a88e8'], joint: '#0a0814', acc: '#d8d0ff' },
  /* 3 the diggings: raw clay rock, bone */
  { s: ['#150f0c', '#25180f', '#3b291a', '#573c26', '#74523a', '#9a7452', '#c49c70'], moss: ['#3a2a18', '#5e4426', '#9a7a48'], joint: '#100a07', acc: '#e0d4b4' },
  /* 4 the tomb: dark royal stone, gold */
  { s: ['#0b0910', '#16121d', '#231c2d', '#342a41', '#4a3d5b', '#6a5a7e', '#8f7ea4'], moss: ['#2a2436', '#443a58', '#7a6a94'], joint: '#07050c', acc: '#c9a040' }];

/* which zone a cell is in: by its row, with a ragged seam so the change of rock is not a ruled line */
export function zoneOf(x, y) {
  const j = (hash(x, 3) % 5) - 2;
  const yy = y + j;
  if (yy >= 144 && x <= 100) return 4;   /* the vault and its floor; the rock east of it is still the diggings */
  if (yy >= 130) return 3;
  if (x >= 97 && yy >= 104 && yy < 130) return 2;
  if (yy >= 46) return 1;
  return 0;
}

/* deeper under the castle, darker (rows below 20 start to close in) */
const deepK = y => y < 20 ? 0 : Math.min(0.45, (y - 20) * 0.0032);
function deepTint(g, y, mul = 1) { for (let py = 0; py < 16; py++) { const a = deepK(y + py / 16) * mul; if (a < 0.01) continue; g.globalAlpha = a; rect(g, 0, py, 16, 1, '#050408'); } g.globalAlpha = 1; }

/* ----- ashlar: courses 8 px high, stones 10-16 wide, alternating joints. ax / ay are ABSOLUTE pixel coordinates so courses run on across neighbours ----- */
function ashlarPx(zone, ax, ay, base, lit) {
  const Z = ZONE[zone], course = Math.floor(ay / 8), cy = ay - course * 8;
  const wid = zone === 4 ? 24 : 16, off = ((course * 7) % wid) + (zone === 4 ? 4 : 0), sx = ((ax + off) % wid + wid) % wid;
  const stone = (Math.floor((ax + off) / wid) * 31 + course * 17) | 0, tone = (hash(stone, zone + 3) % 3) - 1;
  if (cy === 7) return Z.joint;
  if (sx === 0) return Z.s[Math.max(0, base - 2)];
  if (cy === 0) return Z.s[Math.max(0, Math.min(6, base + 1 + tone + (lit ? 1 : 0)))];   /* the chamfer: a lit top edge on every stone */
  if (cy === 6) return Z.s[Math.max(0, base - 1)];
  const grit = (hash(ax, ay) >> 6) % 11 === 0 ? -1 : (hash(ax * 3, ay) >> 7) % 17 === 0 ? 1 : 0;
  return Z.s[Math.max(0, Math.min(6, base + tone + grit + (lit && sx < 3 ? 1 : 0)))];
}
/* raw rock: strata that run across, speckled, a pick mark here and there */
function rawPx(zone, ax, ay, base, lit) {
  const Z = ZONE[zone], band = Math.floor((ay + Math.sin(ax * 0.07) * 2) / 5), tone = (hash(band, zone + 9) % 3) - 1;
  const grit = (hash(ax, ay) >> 5) % 9 === 0 ? -1 : (hash(ay, ax + 7) >> 6) % 13 === 0 ? 1 : 0;
  if (((ay + Math.round(Math.sin(ax * 0.07) * 2)) % 5) === 4) return Z.s[Math.max(0, base - 1)];
  return Z.s[Math.max(0, Math.min(6, base + tone + grit + (lit ? 1 : 0)))];
}
const masonry = zone => zone === 0 || zone === 4;
const stonePx = (zone, ax, ay, base, lit) => masonry(zone) ? ashlarPx(zone, ax, ay, base, lit) : rawPx(zone, ax, ay, base, lit);
function fill(g, zone, x, y, base, lit) {
  for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) px2(g, pxl, py, stonePx(zone, x * 16 + pxl, y * 16 + py, base, lit));
}
/* a PICK MARK: a short bright chip with a dark gouge under it (the goblins' diggings) */
function pick(g, zone, cx, cy) { const Z = ZONE[zone]; px2(g, cx, cy, Z.s[5]); px2(g, cx + 1, cy - 1, Z.s[5]); px2(g, cx, cy + 1, Z.s[0]); px2(g, cx + 1, cy, Z.s[0]); px2(g, cx - 1, cy + 1, Z.s[1]); }
function bone(g, zone, cx, cy) { const Z = ZONE[zone]; rect(g, cx, cy, 3, 1, Z.acc); px2(g, cx, cy - 1, Z.acc); px2(g, cx + 3, cy + 1, Z.acc); px2(g, cx + 1, cy + 1, ZONE[zone].s[1]); }
function crystalSpeck(g, cx, cy) { const Z = ZONE[2]; px2(g, cx, cy, Z.acc); px2(g, cx, cy + 1, Z.s[5]); px2(g, cx - 1, cy + 1, Z.s[4]); px2(g, cx + 1, cy + 1, Z.s[4]); px2(g, cx, cy - 1, '#ffffff'); }
function seam(g, zone, r, y0) {   /* a vein of the zone's accent running through the rock */
  const Z = ZONE[zone], sl = r() < 0.5 ? -1 : 1; for (let k = 0; k < 16; k++) { const yy = y0 + Math.round(sl * Math.sin(k / 16 * Math.PI) * 2); px2(g, k, yy, Z.s[4]); px2(g, k, yy + 1, Z.s[1]); }
}
const decorate = (g, zone, r, hx, hy) => {
  if (zone === 2 && r() < 0.5) crystalSpeck(g, 2 + ((r() * 12) | 0), 3 + ((r() * 10) | 0));
  if (zone === 3) { if (r() < 0.6) pick(g, zone, 2 + ((r() * 11) | 0), 2 + ((r() * 11) | 0)); if (r() < 0.2) bone(g, zone, 2 + ((r() * 9) | 0), 3 + ((r() * 9) | 0)); }
  if (zone === 1 && r() < 0.4) { const x0 = 1 + ((r() * 13) | 0), l = 3 + ((r() * 8) | 0); for (let k = 0; k < l; k++) px2(g, x0, 4 + k, k % 3 ? ZONE[1].moss[0] : ZONE[1].s[2]); }   /* a wet streak */
  if (zone === 0 && r() < 0.18) { const x0 = 2 + ((r() * 11) | 0), y0 = 3 + ((r() * 8) | 0); px2(g, x0, y0, ZONE[0].s[0]); px2(g, x0 + 1, y0 + 1, ZONE[0].s[0]); px2(g, x0 + 1, y0 + 2, ZONE[0].s[0]); px2(g, x0 + 2, y0 + 3, ZONE[0].s[1]); }   /* a hairline crack in the old stone */
};

/* ============================ TOP: a lit lip with the course under it ============================ */
function topTile(zone, x, y, eL, eR) {
  return once('tp' + zone + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + zone * 31), Z = ZONE[zone];
    fill(g, zone, x, y, 3, false);
    rect(g, 0, 0, 16, 2, Z.s[5]); rect(g, 0, 2, 16, 1, Z.s[4]); rect(g, 0, 3, 16, 1, Z.s[1]);                                   /* the walked lip and the shadow line under it */
    if (zone === 0 || zone === 4) { rect(g, 0, 0, 16, 1, Z.s[6]); for (let k = 0; k < 16; k += 5) rect(g, k + ((x * 3) % 5), 0, 1, 3, Z.joint); }  /* flagstones: the joints cut through the lip */
    else {   /* rock: grit, small rubble and a skim of the zone's moss on the lip */
      for (let k = 0; k < 16; k++) { const hh = (hash(x * 16 + k, y) >> 5) % 4; if (hh === 0) rect(g, k, 0, 1, 1, Z.moss[2]); else if (hh === 1) px2(g, k, 0, Z.moss[1]); else if (hh === 2) px2(g, k, 0, Z.s[6]); }
      for (let i = 0; i < 3; i++) { const rx = (r() * 14) | 0; rect(g, rx, 0, 2, 1, Z.s[6]); px2(g, rx, 1, Z.s[3]); } }
    if (zone === 1) { for (let k = 0; k < 16; k++) if (((hash(x * 16 + k, y + 5) >> 4) % 5) < 2) { rect(g, k, 0, 1, 2, Z.moss[1]); px2(g, k, 0, Z.moss[2]); } }   /* slime on every lip of the dead water */
    if (zone === 3 && r() < 0.5) rect(g, 3 + ((r() * 9) | 0), 0, 3, 1, Z.acc);                                              /* a bone chip in the dirt */
    if (zone === 4) { rect(g, 0, 1, 16, 1, Z.acc); g.globalAlpha = 0.6; rect(g, 0, 1, 16, 1, Z.s[3]); g.globalAlpha = 1; for (let k = 2; k < 16; k += 6) px2(g, k, 1, Z.acc); }   /* the gold inlay line in the prince's floor */
    decorate(g, zone, r, x, y);
    if (eL) { rect(g, 0, 2, 1, 14, Z.s[5]); px2(g, 0, 1, Z.s[6]); }
    if (eR) { rect(g, 15, 1, 1, 15, Z.s[0]); }
    deepTint(g, y);
    return c; });
}
/* ============================ FACE: the wall, lit on the left ============================ */
function faceTile(zone, x, y, eL, eR) {
  return once('fc' + zone + '_' + (x & 7) + '_' + (y & 7) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + zone * 47), Z = ZONE[zone];
    fill(g, zone, x, y, eL ? 3 : 2, !!eL);
    decorate(g, zone, r, x, y);
    if (zone === 0 && (hash(x, y) % 11) === 0) { rect(g, 6, 3, 4, 3, Z.s[1]); rect(g, 6, 3, 4, 1, Z.s[5]); px2(g, 7, 4, Z.acc); }                    /* an iron ring-bolt let into the stone */
    if (zone === 4 && (hash(x, y) % 6) === 0) { rect(g, 0, 7, 16, 1, Z.acc); g.globalAlpha = 0.5; rect(g, 0, 7, 16, 1, Z.s[2]); g.globalAlpha = 1; }   /* the inlay band runs up the walls too */
    if (eL) { rect(g, 0, 0, 1, 16, Z.s[6]); rect(g, 1, 0, 1, 16, Z.s[5]); }
    if (eR) { rect(g, 15, 0, 1, 16, Z.s[0]); rect(g, 14, 0, 1, 16, Z.s[1]); g.globalAlpha = 0.22; rect(g, 11, 0, 3, 16, '#000'); g.globalAlpha = 1; }
    deepTint(g, y);
    return c; });
}
/* ============================ CEIL: the underside - a vault, lagging, dripping rock ============================ */
function ceilTile(zone, x, y, eL, eR) {
  return once('ce' + zone + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + zone * 53), Z = ZONE[zone];
    fill(g, zone, x, y, 2, false);
    g.globalAlpha = 0.5; rect(g, 0, 10, 16, 6, '#000'); g.globalAlpha = 0.28; rect(g, 0, 6, 16, 4, '#000'); g.globalAlpha = 1;
    if (zone === 0 || zone === 4) {   /* a vault: the springing of a rib, a dark soffit band, a keystone every so often */
      rect(g, 0, 13, 16, 3, Z.s[1]); rect(g, 0, 12, 16, 1, Z.s[4]); rect(g, 0, 15, 16, 1, Z.joint);
      if ((x + 1) % 4 === 0) { rect(g, 5, 8, 6, 7, Z.s[3]); rect(g, 5, 8, 6, 1, Z.s[5]); rect(g, 5, 14, 6, 1, Z.joint); rect(g, 7, 9, 2, 5, Z.s[2]); } }
    else {   /* rock: stalactite teeth and a wet bead on each */
      for (let k = 0; k < 6; k++) { const nx = (r() * 15) | 0, nl = 1 + ((r() * 4) | 0); rect(g, nx, 15 - nl, 1, nl, Z.s[3]); px2(g, nx, 15, Z.s[0]); }
      rect(g, 0, 15, 16, 1, Z.s[0]); }
    /* TIMBER LAGGING under the roof of a working: three boards across, the grain along them, a nail in each (zones 0 and 3, a third of the tiles) */
    if ((zone === 0 || zone === 3) && ((hash(x >> 2, y) % 3) === 0)) {
      const wood = ['#1a1008', '#36220f', '#5a3a1a', '#7e5428'];
      rect(g, 0, 11, 16, 5, wood[1]); rect(g, 0, 11, 16, 1, wood[3]); rect(g, 0, 13, 16, 1, wood[0]); rect(g, 0, 15, 16, 1, wood[0]);
      for (let k = 0; k < 5; k++) px2(g, (r() * 16) | 0, 12 + ((r() * 3) | 0), wood[2]); for (const nx of [3, 12]) { px2(g, nx, 12, '#a8a090'); px2(g, nx, 14, '#a8a090'); } }
    /* a drip bead waiting at the lowest point */
    if ((zone === 1 || zone === 2) && ((hash(x, y) % 4) === 0)) { const dx = 3 + (hash(y, x) % 10); px2(g, dx, 15, zone === 1 ? Z.moss[2] : Z.acc); px2(g, dx, 14, Z.s[5]); }
    if (eL) rect(g, 0, 0, 1, 16, Z.s[5]); if (eR) rect(g, 15, 0, 1, 16, Z.s[0]);
    deepTint(g, y);
    return c; });
}
/* ============================ MASS: packed rock, coursed stone fading to rubble ============================ */
function massTile(zone, x, y, d) {
  return once('ma' + zone + '_' + (x & 7) + '_' + (y & 7) + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + 41 + zone), Z = ZONE[zone];
    fill(g, zone, x, y, masonry(zone) ? (d <= 1 ? 2 : 1) : (d <= 1 ? 3 : 2), false);
    g.globalAlpha = [0, 0.05, 0.1, 0.14, 0.18, 0.21, 0.24][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#040308'); g.globalAlpha = 1;
    if (zone !== 0 && zone !== 4 && (hash(x >> 1, y) % 3) === 0) seam(g, zone, r, 3 + ((r() * 9) | 0));
    decorate(g, zone, r, x, y);
    if (zone === 0 && d >= 3) { /* deep in the footings the dressing gives out to a rubble core */ g.globalAlpha = 0.35; for (let i = 0; i < 6; i++) { const rx = (r() * 12) | 0, ry = (r() * 12) | 0; rect(g, rx, ry, 3 + ((r() * 3) | 0), 2 + ((r() * 2) | 0), Z.s[1]); } g.globalAlpha = 1; }
    deepTint(g, y, 1.1);
    return c; });
}
/* ============================ SLAB: the roof course of a span, the thing you bring down ============================ */
function slabTile(zone, u, top, bottom, nU, last) {   /* u = column along the span, top / bottom = which faces the open air */
  return once('sl' + zone + '_' + (u % 3) + (top ? 't' : '') + (bottom ? 'b' : '') + (last ? 'e' : '') + (u === 0 ? 's' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone === 4 ? 4 : zone === 3 ? 3 : zone === 1 ? 1 : 0], zz = zone === 4 ? 4 : zone === 3 ? 3 : zone === 1 ? 1 : 0;
    /* one dressed block 3 tiles long, laid up as a single course: a lit chamfer, dark joints at the stone ends, a darker face under the cap */
    rect(g, 0, 0, 16, 16, Z.s[3]);
    const col = u % 3; for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) { const grit = (hash(u * 16 + pxl, py + 9 * zz) >> 6) % 9 === 0 ? -1 : (hash(pxl, py * 3 + u) >> 7) % 14 === 0 ? 1 : 0; px2(g, pxl, py, Z.s[Math.max(0, Math.min(6, 3 + grit + (py < 4 ? 1 : 0)))]); }
    rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]);
    if (col === 0) { rect(g, 0, 0, 1, 16, Z.joint); rect(g, 1, 1, 1, 14, Z.s[5]); }
    if (col === 2 || last) { rect(g, 15, 0, 1, 16, Z.joint); rect(g, 14, 0, 1, 16, Z.s[1]); }
    rect(g, 0, 15, 16, 1, Z.joint); rect(g, 0, 14, 16, 1, Z.s[1]);
    if (col === 1) { rect(g, 7, 2, 2, 12, Z.s[2]); rect(g, 6, 5, 4, 6, Z.s[2]); rect(g, 6, 5, 4, 1, Z.s[4]); rect(g, 7, 7, 2, 2, Z.acc); }   /* the iron tie-plate let into the middle of the stone */
    if (nU) { rect(g, 0, 0, 16, 2, Z.s[6]); }
    if (bottom) { g.globalAlpha = 0.55; rect(g, 0, 10, 16, 6, '#000'); g.globalAlpha = 0.25; rect(g, 0, 7, 16, 3, '#000'); g.globalAlpha = 1; rect(g, 0, 15, 16, 1, Z.joint); }
    return c; });
}
/* ============================ BOARDS ============================ */
function boards(zone, l, rr, v) {
  return once('bd' + (zone > 0 ? 1 : 0) + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 19 + 3), wet = zone > 0;
    const w = wet ? ['#0e0a06', '#241a10', '#3e2c1a', '#5a4228', '#7a5c38'] : ['#130b05', '#30200f', '#55391b', '#7c5428', '#a87a3a'];
    /* a deal plank laid along: lit top, the grain, an iron strap and nail heads, the end grain at the ends */
    rect(g, 0, 0, 16, 5, w[3]); rect(g, 0, 0, 16, 1, w[4]); rect(g, 0, 1, 16, 1, w[4]); rect(g, 0, 4, 16, 1, w[2]); rect(g, 0, 5, 16, 2, w[1]); rect(g, 0, 7, 16, 1, w[0]);
    for (let i = 0; i < 6; i++) px2(g, (r() * 16) | 0, 1 + ((r() * 3) | 0), r() < 0.5 ? w[2] : w[4]);
    if (v === 0) rect(g, 10, 1, 2, 1, w[1]);
    if (v !== 1) { const sx = v === 2 ? 11 : 4; rect(g, sx, 0, 3, 7, '#3a3a40'); rect(g, sx, 0, 3, 1, '#8a8a92'); px2(g, sx + 1, 2, '#c0c0c8'); px2(g, sx + 1, 5, '#c0c0c8'); }
    for (const nx of [1, 8, 14]) if (r() < 0.7) px2(g, nx, 2, '#9a9aa2');
    if (wet) { for (let k = 0; k < 16; k++) if (((hash(k + v * 5, 7) >> 4) % 4) === 0) px2(g, k, 0, ZONE[1].moss[1]); g.globalAlpha = 0.25; rect(g, 0, 0, 16, 7, '#10281a'); g.globalAlpha = 1; }
    for (let k = 1; k < 16; k += 4) px2(g, k, 8 + (k & 1), w[0]);
    g.globalAlpha = 0.35; rect(g, 0, 8, 16, 3, '#000'); g.globalAlpha = 1;
    if (l) { rect(g, 0, 0, 2, 7, w[4]); px2(g, 0, 3, w[0]); px2(g, 1, 4, w[2]); } if (rr) { rect(g, 14, 0, 2, 7, w[1]); px2(g, 15, 3, w[0]); }
    return c; });
}

/* THE SLAB CELLS of the level: a Map of cell index -> { u, x0, x1, row, deep } built once per level object */
const SLABCELLS = new WeakMap();
function slabCells(L) {
  if (SLABCELLS.has(L)) return SLABCELLS.get(L);
  const m = new Map();
  for (const s of (L.slabs || [])) for (let x = s.x0; x <= s.x1; x++) for (let y = s.row - (s.deep || 1) + 1; y <= s.row; y++) m.set(y * L.W + x, { u: x - s.x0, x0: s.x0, x1: s.x1, row: s.row, deep: s.deep || 1, y });
  SLABCELLS.set(L, m); return m;
}
export const slabAt = (L, x, y) => slabCells(L).get(y * L.W + x) || null;

// ================================ THE HOOK ================================
export function ucTile(t, x, y, at, T, L) {
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET || v === T.RAIL; };
  const zone = zoneOf(x, y);
  if (t === T.PLANK || t === T.ONEWAY) {
    const same = k => { const v = at(x + k, y); return v === T.PLANK || v === T.ONEWAY; }, l = !same(-1), r = !same(1), v = ((x * 5 + y) % 3 + 3) % 3;
    return boards(zone, l, r, v);
  }
  if (t !== T.SOLID) return null;
  const sc = slabAt(L, x, y);
  if (sc) { const zz = zoneOf(sc.x0, sc.row); return slabTile(zz, sc.u, y === sc.row - sc.deep + 1 && open(0, -1), open(0, 1) && y === sc.row, sc.deep, x === sc.x1); }
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (up) return topTile(zone, x, y, eL, eR);
  if (down) return ceilTile(zone, x, y, eL, eR);
  if (eL || eR) return faceTile(zone, x, y, eL, eR);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  return massTile(zone, x, y, d);
}
