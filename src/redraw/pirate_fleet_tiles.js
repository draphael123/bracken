// pirate_fleet_tiles.js - THE PIRATE FLEET's own TILE KIT (claude/pfart, 2026-11-05). The greybox wore the Flotilla's noon-bleached ship set. This is open sea at the turn of the day, hulls
// of a raiding fleet in five liveries (the zone of a cell is its COLUMN, with a ragged seam - the same rule as the Kitchen Gate's kit):
//   zone 0 THE FLEET'S WAKE     x < 97    weathered grey-brown timber, salt-white deck, ochre trim flaking off the wales
//   zone 1 THE GRAPPLE          x < 197   warm brown oak, red-lead paint on the wales, brass nails
//   zone 2 THE SINKING PRIZE    x < 297   the powder hulk: charred black timber, soot, scorched wales, the odd red ember seam
//   zone 3 THE STORM SWELL      x < 379   wet blue-black timber, a sheen on every lit edge, green weed at the waterline
//   zone 4 THE FLAGSHIP         x >= 379  tarred black with oxblood paint and a gold line along the wale: the Freebooter's own
// SOLID  TOP a walked deck (planks, caulked butts, a covering board, then strakes)   FACE a hull's end (stem / stern post, iron strap)   CEIL a deckhouse's beam underside
//        MASS packed strakes - COPPER SHEATHING at the waterline band (rows 34-37, where the swell lives), weed under it, silt at the sea bed
// ONEWAY / PLANK  a YARD or fighting-top board: a round spar, iron-banded, lashed.   NET  the shrouds: tarred rope, ratlines every four pixels (no log, no loose timber: it is all ship).
// Made from px.js primitives, 16x16, baked lazily and memoised.   pfTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, rect, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) rect(g, x, y, 1, 1, c); };
export const BED_ROW = 41;                       /* PF.BED in src/pirate-fleet.js (the sea bed's first row) */
export const WATER_ROWS = [34, 37];              /* the copper band: where the swell's waterline sits at rest and at high */

/* five liveries: s = seven timber steps dark -> lit; joint = the caulk; paint = the wale's colour; trim = the thin line over it; deck = the walked planks (4 steps) */
export const ZONE = [
  { s: ['#0d0b0a', '#1a1613', '#2b241d', '#3d332a', '#554839', '#72624c', '#9a8666'], joint: '#070605', paint: '#a8884a', trim: '#d8c48a', deck: ['#6a5c46', '#8e7d60', '#b5a483', '#d8ccae'], nail: '#c9a340' },
  { s: ['#0e0a08', '#1d1410', '#33241a', '#4a3424', '#684a32', '#8a6644', '#b08a5e'], joint: '#080504', paint: '#9a2e22', trim: '#e0b84a', deck: ['#5e4630', '#82633f', '#a88458', '#cdaa78'], nail: '#e6c04a' },
  { s: ['#050404', '#0e0a09', '#1a1412', '#2a201c', '#3c2e28', '#52403a', '#6e5850'], joint: '#030202', paint: '#3a2218', trim: '#7a2c14', deck: ['#2a221e', '#3e332c', '#564840', '#71625a'], nail: '#8a6a30' },
  { s: ['#070b10', '#0f161e', '#1a2530', '#27384a', '#385068', '#4e6e8a', '#7898b4'], joint: '#04070a', paint: '#1e3a52', trim: '#7fb0c8', deck: ['#3a4856', '#506478', '#6e869a', '#94aebe'], nail: '#9ab0b8' },
  { s: ['#060506', '#0f0c0e', '#1b1518', '#2b2126', '#3e3038', '#564452', '#7a6270'], joint: '#030203', paint: '#6e1620', trim: '#e0b040', deck: ['#3c2a28', '#563c36', '#745248', '#96705e'], nail: '#f0c850' },
];
export function zoneOf(x, y) {
  const xx = x + (hash(y >> 1, 17) % 5) - 2;
  return xx < 97 ? 0 : xx < 197 ? 1 : xx < 297 ? 2 : xx < 379 ? 3 : 4;
}
const copper = ['#0a1814', '#143a30', '#22604e', '#3a8a70', '#6cb898'];      /* the sheathing gone green */
const weed = ['#0a1a12', '#14301c', '#245030'];
const silt = ['#0c1418', '#162226', '#22343a', '#3a5258'];
const rope = ['#0f0c08', '#241c12', '#3e3220', '#6a5a3a', '#9a8856'];          /* tarred hemp */

/* one strake pixel: 4-high planks, butt joints staggered by course, a treenail now and then, a grain scratch */
function strakePx(zone, ax, ay, base, lit, ox) {
  const Z = ZONE[zone], course = Math.floor(ay / 4), cy = ay - course * 4, wid = 22, off = (course * 7 + (ox || 0)) % wid, sx = ((ax + off) % wid + wid) % wid;
  const plank = (Math.floor((ax + off) / wid) * 31 + course * 13) | 0, tone = (hash(plank, zone + 3) % 3) - 1;
  if (cy === 3) return Z.joint;
  if (sx === 0) return Z.s[Math.max(0, base - 2)];
  if (cy === 0) return Z.s[Math.max(0, Math.min(6, base + 1 + tone + (lit ? 1 : 0)))];
  if (sx === 11 && cy === 1 && (hash(plank, course) & 3) === 0) return Z.nail;                   /* a treenail / brass nail head */
  const grit = (hash(ax, ay) >> 6) % 9 === 0 ? -1 : (hash(ax * 3, ay) >> 7) % 19 === 0 ? 1 : 0;
  return Z.s[Math.max(0, Math.min(6, base + tone + grit + (lit && sx < 3 ? 1 : 0)))];
}
function fillStrakes(g, zone, x, y, base, lit, y0 = 0, y1 = 16) { for (let py = y0; py < y1; py++) for (let pxl = 0; pxl < 16; pxl++) px2(g, pxl, py, strakePx(zone, x * 16 + pxl, y * 16 + py, base, lit, 0)); }

/* A DECK: lit planks over a covering board, the wale painted its colour, then the hull's strakes */
function topTile(zone, x, y, eL, eR, stern) {
  return once('tp' + zone + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : '') + (stern ? 's' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + zone * 37), Z = ZONE[zone];
    fillStrakes(g, zone, x, y, 2, false, 7, 16);
    rect(g, 0, 0, 16, 4, Z.deck[2]);                                                              /* the walked planks */
    rect(g, 0, 0, 16, 1, Z.deck[3]);                                                              /* the lit edge */
    rect(g, 0, 2, 16, 1, Z.deck[1]); rect(g, 0, 3, 16, 1, Z.deck[0]);                             /* the shade under the planks' lip */
    for (let k = 0; k < 3; k++) { const bx = (hash(x * 3 + k, y) % 14) + 1; px2(g, bx, 1, Z.deck[0]); px2(g, bx, 2, Z.deck[0]); }   /* caulked butts */
    for (let k = 0; k < 4; k++) px2(g, (r() * 16) | 0, (r() * 3) | 0, Z.deck[3]);                 /* salt in the grain */
    rect(g, 0, 4, 16, 1, Z.joint);                                                                /* the waterway's caulk */
    rect(g, 0, 5, 16, 2, Z.s[3]); rect(g, 0, 5, 16, 1, Z.s[5]);                                   /* the covering board */
    for (let k = 1; k < 16; k += 5) px2(g, k, 5, Z.nail);
    rect(g, 0, 7, 16, 1, Z.paint); rect(g, 0, 8, 16, 1, Z.trim); rect(g, 0, 9, 16, 1, Z.paint);    /* THE WALE: her painted band and its thin trim line */
    if (zone === 2 && (hash(x, y) & 3) === 0) { px2(g, (r() * 14) | 0, 8, '#ff7a2a'); px2(g, (r() * 14) | 0, 9, '#c2421a'); }   /* an ember in the scorched wale */
    if (zone === 3) { for (let k = 0; k < 16; k += 3) px2(g, k + (hash(x, k) & 1), 0, '#cfe6f0'); }   /* wet on the planks */
    if (eL) { rect(g, 0, 0, 1, 16, Z.s[5]); rect(g, 0, 0, 1, 1, Z.deck[3]); } if (eR) rect(g, 15, 0, 1, 16, Z.s[0]);
    return c; });
}
/* the sheathing: 8x8 copper plates gone green, tacks at the corners, a plate lifted bright here and there - the waterline band of a hull's end */
function sheathe(g, x, y) {
  const r = mulberry(hash(x & 3, y & 7) + 17);
  for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) { const qx = ((pxl + (((py >> 3) & 1) * 4)) % 8), qy = py & 7;
    px2(g, pxl, py, qx === 0 || qy === 0 ? copper[0] : (qx === 1 && qy === 1) ? copper[3] : copper[(hash((x * 16 + pxl) >> 3, (y * 16 + py) >> 3) % 3) + 1 - (qy > 5 ? 1 : 0)]); }
  for (let k = 0; k < 2; k++) rect(g, (r() * 12) | 0, (r() * 13) | 0, 3, 2, copper[4]);
  g.globalAlpha = 0.3; rect(g, 0, 0, 16, 16, '#030406'); g.globalAlpha = 1;
}
/* A HULL's END (stem / sternpost) or a block's flank: strakes, lit on the left, an iron strap and rivets */
function faceTile(zone, x, y, eL, eR, band) {
  return once('fa' + zone + '_' + (x & 3) + '_' + (y & 7) + (eL ? 'l' : '') + (eR ? 'r' : '') + (band ? 'w' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    fillStrakes(g, zone, x, y, 3, eL, 0, 16);
    if ((y & 3) === 1) { rect(g, 0, 6, 16, 3, '#2c3038'); rect(g, 0, 6, 16, 1, '#6a7280'); for (let k = 2; k < 16; k += 6) px2(g, k, 7, '#a8b0c0'); }   /* the iron strap */
    if (eL) { rect(g, 0, 0, 2, 16, Z.s[5]); rect(g, 0, 0, 1, 16, Z.s[6]); } if (eR) { rect(g, 14, 0, 2, 16, Z.s[1]); rect(g, 15, 0, 1, 16, Z.s[0]); }
    if (y >= WATER_ROWS[0] && y <= WATER_ROWS[1]) sheathe(g, x, y);
    else if (y > WATER_ROWS[1] && y < BED_ROW) { const r = mulberry(hash(x & 3, y & 7) + 5); for (let k = 0; k < 5; k++) { const bx = (r() * 16) | 0, l = 2 + ((r() * 6) | 0); for (let q = 0; q < l; q++) px2(g, bx + (q & 1), 15 - q, weed[q % 3]); } }
    if (band) paintBand(g, Z, 16);
    return c; });
}
/* the underside of a deckhouse roof: deck beams between planks, a lantern hook's shadow */
function ceilTile(zone, x, y, eL, eR) {
  return once('ce' + zone + '_' + (x & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    fillStrakes(g, zone, x, y, 1, false, 0, 16);
    rect(g, 0, 11, 16, 5, Z.s[2]); rect(g, 0, 11, 16, 1, Z.s[4]); rect(g, 0, 15, 16, 1, Z.joint);       /* a deck beam */
    if ((x & 3) === 1) { rect(g, 6, 7, 4, 5, Z.s[3]); rect(g, 6, 7, 4, 1, Z.s[5]); }                    /* a carline */
    if (eL) rect(g, 0, 0, 1, 16, Z.s[4]); if (eR) rect(g, 15, 0, 1, 16, Z.s[0]);
    g.globalAlpha = 0.35; rect(g, 0, 0, 16, 16, '#030406'); g.globalAlpha = 1; return c; });
}
function paintBand(g, Z, h) { rect(g, 0, 4, 16, 1, Z.paint); rect(g, 0, 5, 16, 1, Z.trim); rect(g, 0, 6, 16, 1, Z.paint); }
/* PACKED STRAKES: darker the deeper into the hull; the waterline band is COPPER SHEATHING (green, with a bright lifted plate or two), weed under it, silt on the bed */
function massTile(zone, x, y, d) {
  return once('ma' + zone + '_' + (x & 7) + '_' + (y & 7) + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + 41 + zone);
    fillStrakes(g, zone, x, y, d <= 1 ? 2 : 1, false);
    g.globalAlpha = [0, 0.05, 0.1, 0.14, 0.18, 0.21, 0.24][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#030406'); g.globalAlpha = 1;
    if (y > WATER_ROWS[1] && y < BED_ROW && d <= 2) { for (let k = 0; k < 7; k++) { const bx = (r() * 16) | 0, l = 2 + ((r() * 5) | 0); for (let q = 0; q < l; q++) px2(g, bx + (q & 1), 15 - q, weed[q % 3]); } }   /* weed streaming off the hull */
    if (zone === 3) { g.globalAlpha = 0.1; rect(g, 0, 0, 16, 16, '#2a5a7a'); g.globalAlpha = 1; }   /* the storm's wet light */
    return c; });
}
/* THE SEA BED: ripple-sand under the swell with shell and a dark weed crown, silt under it */
function bedTile(x, y, top, d) {
  return once('bd' + (x & 7) + (top ? 't' : 'm' + Math.min(d, 4)), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, top ? 5 : 9) + 7);
    for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) px2(g, pxl, py, silt[Math.max(0, Math.min(3, (top ? 2 : 1) + (hash(x * 16 + pxl, y * 16 + py) % 3) - 1 - (top ? 0 : Math.min(d, 3) >> 1)))]);
    if (top) { for (let k = 0; k < 16; k++) { const rp = 2 + Math.round(Math.sin((x * 16 + k) * 0.55) * 1.2); px2(g, k, rp, silt[3]); px2(g, k, rp + 1, silt[0]); }
      rect(g, 0, 0, 16, 2, silt[2]); for (let k = 0; k < 3; k++) px2(g, (r() * 16) | 0, 1, '#d8e6e0');                  /* a shell's fleck */
      if ((hash(x, 3) & 3) === 0) { const bx = (r() * 13) | 0; for (let q = 0; q < 6; q++) px2(g, bx + (q & 1), -q + 1 < 0 ? 0 : 1, weed[q % 3]); } }
    return c; });
}
/* A YARD / fighting-top board: a round spar (lit on the top), two iron bands, a rope seizing, a stray rope end */
function yardTile(zone, l, rr, v) {
  return once('yd' + zone + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    rect(g, 0, 0, 16, 5, Z.s[4]); rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]); rect(g, 0, 3, 16, 1, Z.s[3]); rect(g, 0, 4, 16, 1, Z.s[1]); rect(g, 0, 5, 16, 1, Z.joint);
    for (let i = 0; i < 4; i++) px2(g, hash(i + v, 3) % 16, 1 + (hash(i, v) % 3), Z.s[3]);
    const bx = v & 1 ? 2 : 9; rect(g, bx, 0, 2, 5, '#2c3038'); rect(g, bx, 0, 1, 5, '#80889a');
    rect(g, bx + 5, 0, 3, 5, rope[3]); for (let k = 0; k < 5; k += 2) rect(g, bx + 5, k, 3, 1, rope[1]);   /* the seizing */
    if (v === 2) { rect(g, 6, 5, 1, 4, rope[3]); rect(g, 6, 9, 2, 1, rope[2]); }                          /* a rope end hanging */
    g.globalAlpha = 0.28; rect(g, 0, 6, 16, 4, '#030406'); g.globalAlpha = 1;
    if (l) rect(g, 0, 0, 2, 5, '#9a9aa8'); if (rr) rect(g, 14, 0, 2, 5, Z.s[0]);                        /* the spar's iron cap */
    return c; });
}
/* SHROUDS: two tarred uprights and a ratline every four pixels, a rope's lay in each */
function shroudTile(x, y, up, down) {
  return once('sh' + (x & 3) + (y & 1) + (up ? 'u' : '') + (down ? 'd' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, y & 1) + 3), jit = (hash(x, y) % 3) - 1;
    for (const bx of [3 + jit, 11 + jit]) { for (let py = 0; py < 16; py++) { px2(g, bx, py, rope[(py + bx) & 1 ? 3 : 2]); px2(g, bx + 1, py, rope[1]); } px2(g, bx, 0, rope[4]); }
    for (let py = 1; py < 16; py += 4) { for (let pxl = 3 + jit; pxl <= 12 + jit; pxl++) px2(g, pxl, py + ((pxl >> 1) & 1 ? 0 : 0), rope[(pxl + py) & 1 ? 3 : 2]); px2(g, 3 + jit, py, rope[4]); px2(g, 11 + jit, py, rope[4]); }
    if (up) rect(g, 3 + jit, 0, 10, 1, rope[4]);
    if (r() < 0.25) px2(g, 7, (r() * 14) | 0, rope[4]);
    return c; });
}

export function pfTile(t, x, y, at, T, L) {
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET || v === T.RAIL; };
  const zone = zoneOf(x, y);
  if (t === T.NET) return shroudTile(x, y, at(x, y - 1) !== T.NET, at(x, y + 1) !== T.NET);
  if (t === T.PLANK || t === T.ONEWAY) {
    const same = k => { const v = at(x + k, y); return v === T.PLANK || v === T.ONEWAY; };
    return yardTile(zone, !same(-1), !same(1), ((x * 5 + y) % 3 + 3) % 3);
  }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (y >= BED_ROW) { if (up) return bedTile(x, y, true, 0); let d = 4; for (let k = 1; k <= 3 && d === 4; k++) if (open(0, -k)) d = k; return bedTile(x, y, false, d); }
  if (up) return topTile(zone, x, y, eL, eR, false);
  if (down) return ceilTile(zone, x, y, eL, eR);
  if (eL || eR) return faceTile(zone, x, y, eL, eR, y === 31 || y === 30);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  return massTile(zone, x, y, d);
}
