// kitchen_tiles.js - THE KITCHEN GATE's own TILE KIT (claude/kitchengateart). The greybox wore the crags' default stone. This is the castle's lower ward, room by room (the zone of a cell is its COLUMN, with a ragged seam):
//   zone 0 THE UNDERCELLARS    x < 104   cold grey-blue brick vaults, damp and frosted at the lips, barrel-stave browns in the shelves
//   zone 1 THE SPIT HALL       x < 201   soot-black basalt blocks, red heat in the joints, the great hearths' glow
//   zone 2 THE GREASE KITCHENS x < 300   fat-glazed cream and ochre tile (a checker on the floors), copper-green trim, grease on every lip
//   zone 3 THE FEAST HALL      x < 372   warm sandstone ashlar with a red banner-band and a gold line; flagstones
//   zone 4 GRUBBAG'S TABLE     x >= 372  dark royal stone in the queen's colours: plum and gold
//   SOLID  TOP a lit walked lip (flags / tile / grease-glazed)   FACE the wall, lit on the left   CEIL the vault's underside   MASS packed courses fading to rubble
//   ONEWAY / PLANK  a DRESSER SHELF: a scrubbed board on iron brackets (not a log, not a plank walk)
//   SPIKE  a bed of HOT COALS over an iron grate (the fire pits and the trench): the glow is drawn here, the flicker by KA.drawAmbient
// Made from px.js primitives, 16x16, baked lazily and memoised.   kgTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, rect, mulberry } from '../px.js';
import { KG_ZONES } from '../kitchen-gate.js';   /* (claude/kitchengate3) the zones by column come from the level: two rooms were let in (THE HANGING LARDER is cellar brick, THE CARVERY glazed tile) */

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) rect(g, x, y, 1, 1, c); };

export const ZONE = [
  /* 0 the undercellars: cold grey-blue brick */
  { s: ['#0d1118', '#161d28', '#222c3a', '#33404f', '#4a5a6a', '#6a7d8c', '#94a8b4'], joint: '#080b10', acc: '#bcd6e6', glaze: null },
  /* 1 the spit hall: soot basalt, a red heat */
  { s: ['#0a0808', '#151010', '#241a18', '#372a26', '#4e3c34', '#6e564a', '#9a7c68'], joint: '#060404', acc: '#ff8a3a', glaze: null },
  /* 2 the grease kitchens: glazed cream / ochre tile, copper-green trim */
  { s: ['#1c130a', '#33220f', '#5a3f1e', '#8a6a3a', '#b8964e', '#d8bf7c', '#f0e2b0'], joint: '#241608', acc: '#4fa890', glaze: '#fff2b8' },
  /* 3 the feast hall: warm sandstone, red and gold */
  { s: ['#170f0c', '#2a1c16', '#4a3226', '#6e4e3a', '#94705a', '#b99478', '#dcc09e'], joint: '#100906', acc: '#c8302c', glaze: null },
  /* 4 grubbag's table: plum royal stone, gold */
  { s: ['#0d0812', '#1a1020', '#2a1a34', '#40294d', '#5c3d6c', '#7e5a92', '#a584b8'], joint: '#080510', acc: '#e0b040', glaze: null }];
export function zoneOf(x, y) {
  const xx = x + (hash(y >> 1, 11) % 5) - 2;
  let z = 0; for (const [x0, k] of KG_ZONES) if (xx >= x0) z = k; return z;
}
/* SOLIDS are pale only in the kitchens' glazed zone; the rest read as stone */
function brickPx(zone, ax, ay, base, lit) {
  const Z = ZONE[zone], course = Math.floor(ay / 8), cy = ay - course * 8, wid = zone === 0 ? 12 : zone === 4 ? 24 : 16, off = (course * 5) % wid, sx = ((ax + off) % wid + wid) % wid;
  const stone = (Math.floor((ax + off) / wid) * 29 + course * 13) | 0, tone = (hash(stone, zone + 5) % 3) - 1;
  if (cy === 7) return Z.joint;
  if (sx === 0) return Z.s[Math.max(0, base - 2)];
  if (cy === 0) return Z.s[Math.max(0, Math.min(6, base + 1 + tone + (lit ? 1 : 0)))];
  if (cy === 6) return Z.s[Math.max(0, base - 1)];
  const grit = (hash(ax, ay) >> 6) % 11 === 0 ? -1 : (hash(ax * 3, ay) >> 7) % 17 === 0 ? 1 : 0;
  return Z.s[Math.max(0, Math.min(6, base + tone + grit + (lit && sx < 3 ? 1 : 0)))];
}
/* kitchen tile: 8x8 glazed squares, a checker of two tones, a hairline crack */
function glazePx(ax, ay, base, lit) {
  const Z = ZONE[2], qx = Math.floor(ax / 8), qy = Math.floor(ay / 8), cx = ax - qx * 8, cy = ay - qy * 8, chk = (qx + qy) & 1;
  if (cx === 0 || cy === 0) return Z.joint;
  const b = Math.max(0, Math.min(6, base + (chk ? 0 : 1) + (lit ? 1 : 0)));
  if (cx === 1 && cy === 1) return Z.s[Math.min(6, b + 1)];
  if ((hash(qx, qy) % 7) === 0 && cx === cy) return Z.s[Math.max(0, b - 2)];   /* a crazed glaze */
  return Z.s[b];
}
const stonePx = (zone, ax, ay, base, lit, brick) => zone === 2 && !brick ? glazePx(ax, ay, base, lit) : brickPx(zone, ax, ay, base, lit);
function fill(g, zone, x, y, base, lit, brick) { for (let py = 0; py < 16; py++) for (let pxl = 0; pxl < 16; pxl++) px2(g, pxl, py, stonePx(zone, x * 16 + pxl, y * 16 + py, base, lit, brick)); }
/* what a zone adds to a face / mass cell: damp streaks (cellars), heat in the joints (spit hall), grease runs (kitchens), a banner band (feast), a gold line (table) */
function decorate(g, zone, r, x, y, mass) {
  const Z = ZONE[zone];
  if (zone === 0 && r() < 0.35) { const x0 = 1 + ((r() * 13) | 0), l = 3 + ((r() * 8) | 0); for (let k = 0; k < l; k++) px2(g, x0, 3 + k, k % 3 ? '#1e3a44' : Z.s[2]); if (r() < 0.4) px2(g, x0, 3 + l, Z.acc); }
  if (zone === 1) { if (r() < 0.45) { const y0 = 7; for (let k = 0; k < 16; k++) if ((hash(x * 16 + k, y) >> 5) % 3 === 0) px2(g, k, y0, '#7a2a12'); px2(g, (r() * 16) | 0, y0, '#d86a22'); } if (r() < 0.2) rect(g, (r() * 12) | 0, (r() * 12) | 0, 3, 2, Z.s[0]); }
  if (zone === 2 && r() < 0.1) { const x0 = 2 + ((r() * 11) | 0), l = 3 + ((r() * 9) | 0); for (let k = 0; k < l; k++) { px2(g, x0, 1 + k, '#8a6a1a'); if (k % 3 === 0) px2(g, x0 + 1, 1 + k, '#b89a30'); } px2(g, x0, 1 + l, '#e0c25a'); }   /* a grease run */
  if (zone === 3 && !mass && (hash(x, y) % 9) === 0) { rect(g, 0, 7, 16, 1, Z.s[1]); rect(g, 0, 8, 16, 1, '#7a1c1c'); rect(g, 0, 9, 16, 1, Z.acc); rect(g, 0, 10, 16, 1, '#7a1c1c'); }   /* the banner band's thread */
  if (zone === 4 && (hash(x, y) % 6) === 0) { rect(g, 0, 7, 16, 1, Z.acc); g.globalAlpha = 0.5; rect(g, 0, 7, 16, 1, Z.s[2]); g.globalAlpha = 1; }
}
const warm = (g, zone, y) => { if (zone === 1) { g.globalAlpha = 0.07; rect(g, 0, 0, 16, 16, '#ff6a20'); g.globalAlpha = 1; } };

function topTile(zone, x, y, eL, eR) {
  return once('tp' + zone + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + zone * 31), Z = ZONE[zone];
    fill(g, zone, x, y, 3, false);
    rect(g, 0, 0, 16, 2, Z.s[5]); rect(g, 0, 2, 16, 1, Z.s[4]); rect(g, 0, 3, 16, 1, Z.s[1]);
    rect(g, 0, 0, 16, 1, Z.s[6]);
    if (zone === 2) {   /* glazed tile with a shine and a grease slick on the lip */
      for (let k = 0; k < 16; k += 8) rect(g, k, 0, 1, 3, Z.joint);
      rect(g, 2 + ((x * 3) % 6), 0, 5, 1, Z.glaze); for (let k = 0; k < 16; k++) if (((hash(x * 16 + k, y + 2) >> 4) % 5) < 2) px2(g, k, 1, '#a88a2a');
    } else for (let k = 0; k < 16; k += 5) rect(g, k + ((x * 3) % 5), 0, 1, 3, Z.joint);   /* flagstones: the joints cut through the lip */
    if (zone === 0) { for (let k = 0; k < 16; k++) if ((hash(x * 16 + k, y) >> 6) % 7 === 0) px2(g, k, 0, Z.acc); }   /* frost on the lip */
    if (zone === 1) { for (let k = 0; k < 16; k++) if ((hash(x * 16 + k, y + 4) >> 5) % 6 === 0) px2(g, k, 1, '#5a2a1a'); px2(g, 3 + ((x * 5) % 9), 0, '#ff9a3a'); }   /* a scorch and a living spark */
    if (zone === 3) { rect(g, 0, 1, 16, 1, Z.s[5]); if ((x & 3) === 1) { rect(g, 0, 1, 16, 1, Z.acc); g.globalAlpha = 0.5; rect(g, 0, 1, 16, 1, Z.s[3]); g.globalAlpha = 1; } }   /* a runner of red carpet every fourth tile */
    if (zone === 4) { rect(g, 0, 1, 16, 1, Z.acc); g.globalAlpha = 0.6; rect(g, 0, 1, 16, 1, Z.s[3]); g.globalAlpha = 1; for (let k = 2; k < 16; k += 6) px2(g, k, 1, Z.acc); }
    decorate(g, zone, r, x, y); warm(g, zone, y);
    if (eL) { rect(g, 0, 2, 1, 14, Z.s[5]); px2(g, 0, 1, Z.s[6]); }
    if (eR) rect(g, 15, 1, 1, 15, Z.s[0]);
    return c; });
}
function faceTile(zone, x, y, eL, eR) {
  return once('fc' + zone + '_' + (x & 7) + '_' + (y & 7) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + zone * 47), Z = ZONE[zone];
    fill(g, zone, x, y, eL ? 3 : 2, !!eL); decorate(g, zone, r, x, y);
    if ((hash(x, y) % 13) === 0 && zone !== 2) { rect(g, 6, 3, 4, 3, Z.s[1]); rect(g, 6, 3, 4, 1, Z.s[5]); px2(g, 7, 4, '#9a9aa2'); }   /* an iron ring-bolt */
    if (eL) { rect(g, 0, 0, 1, 16, Z.s[6]); rect(g, 1, 0, 1, 16, Z.s[5]); }
    if (eR) { rect(g, 15, 0, 1, 16, Z.s[0]); rect(g, 14, 0, 1, 16, Z.s[1]); g.globalAlpha = 0.22; rect(g, 11, 0, 3, 16, '#000'); g.globalAlpha = 1; }
    warm(g, zone, y); return c; });
}
function ceilTile(zone, x, y, eL, eR) {
  return once('ce' + zone + '_' + (x & 7) + '_' + (y & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 3) + zone * 53), Z = ZONE[zone];
    fill(g, zone, x, y, 2, false);
    g.globalAlpha = 0.5; rect(g, 0, 10, 16, 6, '#000'); g.globalAlpha = 0.28; rect(g, 0, 6, 16, 4, '#000'); g.globalAlpha = 1;
    rect(g, 0, 13, 16, 3, Z.s[1]); rect(g, 0, 12, 16, 1, Z.s[4]); rect(g, 0, 15, 16, 1, Z.joint);   /* the vault's springing */
    if ((x + 1) % 4 === 0) { rect(g, 5, 8, 6, 7, Z.s[3]); rect(g, 5, 8, 6, 1, Z.s[5]); rect(g, 5, 14, 6, 1, Z.joint); rect(g, 7, 9, 2, 5, Z.s[2]); }   /* a keystone */
    if (zone === 1) { for (let k = 0; k < 16; k++) if ((hash(x * 16 + k, 3) >> 4) % 3 === 0) px2(g, k, 14, '#2a2220'); }   /* soot on the soffit */
    if (zone === 2 && (hash(x, y) % 4) === 0) { const dx = 3 + (hash(y, x) % 10); px2(g, dx, 15, '#e0c25a'); px2(g, dx, 14, '#a88a2a'); }   /* a grease bead waiting at the lowest point */
    if (zone === 0 && (hash(x, y) % 4) === 0) { const dx = 3 + (hash(y, x) % 10); px2(g, dx, 15, Z.acc); px2(g, dx, 14, Z.s[5]); }   /* a drip */
    if (zone >= 3 && (x % 4) === 2) { rect(g, 3, 13, 10, 2, zone === 4 ? ZONE[4].acc : '#7a1c1c'); }   /* a hanging cloth's hem */
    if (eL) rect(g, 0, 0, 1, 16, Z.s[5]); if (eR) rect(g, 15, 0, 1, 16, Z.s[0]);
    warm(g, zone, y); return c; });
}
function massTile(zone, x, y, d) {
  return once('ma' + zone + '_' + (x & 7) + '_' + (y & 7) + '_' + Math.min(d, 6), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + 41 + zone);
    fill(g, zone, x, y, d <= 1 ? 2 : 1, false, true);
    g.globalAlpha = [0, 0.05, 0.1, 0.14, 0.18, 0.21, 0.24][Math.min(d, 6)]; rect(g, 0, 0, 16, 16, '#040308'); g.globalAlpha = 1;
    decorate(g, zone, r, x, y, true); warm(g, zone, y); return c; });
}
/* DRESSER SHELF: a scrubbed board on two iron brackets with a lip, a pewter plate or two stood on it, drip-stained below */
function shelf(zone, l, rr, v) {
  return once('sh' + (zone >= 3 ? 1 : 0) + (l ? 'l' : '') + (rr ? 'r' : '') + v, () => {
    const [c, g] = canvas(16, 16), w = zone >= 3 ? ['#1c0e0c', '#3a1c18', '#6a3a2c', '#8e5a44', '#b07c5c'] : ['#14100a', '#2c2214', '#54401e', '#7a6030', '#a88a4a'];
    rect(g, 0, 0, 16, 5, w[3]); rect(g, 0, 0, 16, 1, w[4]); rect(g, 0, 4, 16, 1, w[2]); rect(g, 0, 5, 16, 2, w[1]); rect(g, 0, 7, 16, 1, w[0]);
    for (let i = 0; i < 4; i++) px2(g, (hash(i + v, 3) % 16), 1 + (hash(i, v) % 3), w[2]);
    const bx = v & 1 ? 2 : 9; rect(g, bx, 7, 3, 1, '#3a3a40'); rect(g, bx, 8, 2, 4, '#3a3a40'); rect(g, bx, 7, 3, 1, '#8a8a92'); px2(g, bx, 12, '#2a2a30');   /* the bracket */
    px2(g, 1, 2, '#9a9aa2'); px2(g, 14, 2, '#9a9aa2');
    g.globalAlpha = 0.3; rect(g, 0, 8, 16, 3, '#000'); g.globalAlpha = 1;
    if (l) rect(g, 0, 0, 2, 7, w[4]); if (rr) rect(g, 14, 0, 2, 7, w[1]);
    return c; });
}
/* HOT COALS over an iron grate: black clinker, a crust of grey ash and a red-orange glow beneath */
function coals(x, y, open) {
  return once('co' + (x & 3) + (open ? 'o' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, 99));
    rect(g, 0, 0, 16, 16, '#1a0a06'); rect(g, 0, 8, 16, 8, '#0e0504');
    for (let i = 0; i < 26; i++) { const cx = (r() * 15) | 0, cy = 3 + ((r() * 12) | 0), k = r(); px2(g, cx, cy, k < 0.2 ? '#fff1a0' : k < 0.5 ? '#ff9a2a' : k < 0.85 ? '#d0421a' : '#7a1c0c'); if (k < 0.5) px2(g, cx + 1, cy, '#a82c10'); }
    for (let i = 0; i < 6; i++) rect(g, (r() * 14) | 0, 2 + ((r() * 6) | 0), 2, 1, '#3a2a26');   /* ash / clinker crust */
    rect(g, 0, 0, 16, 2, '#2a1810'); rect(g, 0, 2, 16, 1, '#7a2c10');   /* the pit's lip, lit from below */
    g.globalAlpha = 0.18; rect(g, 0, 3, 16, 5, '#ff7a20'); g.globalAlpha = 1;
    for (let k = 3; k < 16; k += 6) { rect(g, k, 11, 1, 5, '#2a2a30'); }   /* the grate's bars underneath */
    return c; });
}

export function kgTile(t, x, y, at, T, L) {
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET || v === T.RAIL; };
  const zone = zoneOf(x, y);
  if (t === T.SPIKE) return coals(x, y);
  if (t === T.PLANK || t === T.ONEWAY) {
    const same = k => { const v = at(x + k, y); return v === T.PLANK || v === T.ONEWAY; };
    return shelf(zone, !same(-1), !same(1), ((x * 5 + y) % 3 + 3) % 3);
  }
  if (t !== T.SOLID) return null;
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0);
  if (up) return topTile(zone, x, y, eL, eR);
  if (down) return ceilTile(zone, x, y, eL, eR);
  if (eL || eR) return faceTile(zone, x, y, eL, eR);
  let d = 6; for (let k = 1; k <= 5 && d === 6; k++) for (let dy = -k; dy <= k && d === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { d = k; break; } }
  return massTile(zone, x, y, d);
}
