// high_lines_tiles.js - THE HIGH LINES' own TILE KIT (claude/hlart, 2026-11-05). The greybox wore the stock blue-grey crag. This is the mountain's ropeway shaft: bare granite cliffs,
// rime on every lip, the line crews' IRON GANTRY DECKS bolted to the rock, and the cargo nets. Mountain, rope, iron, stone: no timber, no logs.
// Six stones by ROW (the climb: a cell's zone is its row, with a ragged seam), pale to black as you rise toward the cave mouth:
//   zone 0 THE FOOTHOLD   rows >= 206  pale rimed granite            zone 3 THE COUNTERWEIGHT  rows 76-117  ore-rusted grey, iron seams
//   zone 1 THE GORGE      rows 164-205 blue slate, wind-scoured      zone 4 THE EXAM           rows 57-75   wet black granite
//   zone 2 THE AMBUSH     rows 118-163 dark neutral slate, ice seams  zone 5 THE CAVE MOUTH     rows < 57    basalt, lamp-warm, ore-stained
// SOLID   strata by the world row (a bed runs across the whole cliff), wind flutes, a RIME CAP on every lip, a dark wet underside with drip marks, the lit side on the left
// ONEWAY  an IRON GANTRY DECK (riveted plate over a flange, grating slots, a snow patch, end plates) - or, for the rock lips (the crevice, the shelf, the hut floor, the last steps),
//         a SLAB LIP of the granite itself; L.nets rows are the CARGO NETS (tarred rope, knots, lashed to iron rings)
// Made from px.js primitives, 16x16, baked lazily and memoised.   hlTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, rect, mulberry } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) rect(g, x, y, 1, 1, c); };

/* the six stones: seven steps each, deepest shadow to the lit lip; bed = the bed lines' accent */
export const ZONE = [
  { s: ['#1c2028', '#2c323c', '#414a58', '#5a6676', '#7a8798', '#a0aebe', '#cdd8e4'], bed: '#6a7a90' },
  { s: ['#161c2a', '#242d42', '#364260', '#4c5c80', '#6a7ca2', '#8ea0c6', '#bccae6'], bed: '#5a6c92' },
  { s: ['#1a1a1c', '#2a2a2e', '#3e3e44', '#56565e', '#74747c', '#9a9aa2', '#c4c4c8'], bed: '#6a7078' },
  { s: ['#1e1816', '#322824', '#4a3a32', '#665046', '#86705e', '#ac9884', '#d4c4ac'], bed: '#a06a3c' },
  { s: ['#0a0e14', '#141c26', '#202c3a', '#2e3e52', '#425870', '#5e7692', '#8aa4bc'], bed: '#3a5a7a' },
  { s: ['#120e14', '#221a22', '#362a32', '#4e3c44', '#6a5058', '#8e6e6c', '#c09484'], bed: '#c07a3a' },
];
export const BOUNDS = [206, 164, 118, 76, 57];
export function zoneOf(x, y) { const yy = y + (hash(x >> 1, 23) % 5) - 2; return yy >= BOUNDS[0] ? 0 : yy >= BOUNDS[1] ? 1 : yy >= BOUNDS[2] ? 2 : yy >= BOUNDS[3] ? 3 : yy >= BOUNDS[4] ? 4 : 5; }
const RIME = ['#8a9cb4', '#c4d4e4', '#e8f2fa', '#ffffff'];
const IRON = ['#0e1014', '#1c2026', '#2c323a', '#444c58', '#68727e', '#98a2ae', '#c8d0d8'];
const RUST = ['#3a1c10', '#6a3418', '#a0501e'];
const ROPE = ['#14100a', '#2a2216', '#463a24', '#6c5c38', '#a08c58'];
const LAMP = ['#6a3a12', '#c0701c', '#ffb23c', '#fff0b0'];

const isSolid = (t, T) => t === T.SOLID;
function depth(at, T, x, y) { let d = 9; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { let k = 1; while (k < 5 && isSolid(at(x + dx * k, y + dy * k), T)) k++; d = Math.min(d, k - 1); } return d; }
/* one granite pixel: world-row beds, wind flutes, grit; base = ramp step; lit pushes the left edge up a step */
function granite(zone, ax, ay, base, litL) {
  const Z = ZONE[zone], bed = Math.floor(ay / 5), bt = (hash(bed, zone + 11) % 3) - 1, flute = (hash(ax >> 1, 5) % 7) === 0 ? -1 : 0, grit = (hash(ax * 3 + 1, ay) >> 7) % 17 === 0 ? 1 : (hash(ax, ay * 3) >> 8) % 23 === 0 ? -1 : 0;
  if (ay % 5 === 4 && (hash(bed, 3) & 1)) return Z.s[Math.max(0, base - 1)];                           /* a bed line */
  return Z.s[Math.max(0, Math.min(6, base + bt + flute + grit + (litL ? 1 : 0)))];
}
function fillGranite(g, zone, x, y, base, litL, y0 = 0, y1 = 16) { for (let py = y0; py < y1; py++) for (let p = 0; p < 16; p++) px2(g, p, py, granite(zone, x * 16 + p, y * 16 + py, base, litL && p < 3)); }

function solidTile(zone, x, y, up, dn, lf, rt, d) {
  return once('so' + zone + '_' + (x & 7) + '_' + (y & 7) + (up ? 'u' : '') + (dn ? 'd' : '') + (lf ? 'l' : '') + (rt ? 'r' : '') + Math.min(d, 4), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 7, y & 7) + zone * 53), Z = ZONE[zone];
    fillGranite(g, zone, x, y, d <= 0 ? 3 : d === 1 ? 2 : d === 2 ? 2 : 1, lf);
    if (d >= 3) { g.globalAlpha = 0.18; rect(g, 0, 0, 16, 16, '#04060a'); g.globalAlpha = 1; }
    for (let k = 0; k < 2; k++) { const bx = (r() * 13) | 0, by = (r() * 14) | 0; rect(g, bx, by, 2 + ((r() * 3) | 0), 1, Z.s[Math.min(6, 2 + (d > 2 ? 0 : 1))]); }   /* a fleck of lighter mineral */
    if (zone === 3 || zone === 5) { for (let k = 0; k < 3; k++) { const bx = (r() * 14) | 0, by = (r() * 14) | 0; px2(g, bx, by, RUST[(r() * 3) | 0]); px2(g, bx + 1, by, RUST[1]); } }   /* ore stains */
    if (zone === 2 && (hash(x, y) & 3) === 0) { const bx = 2 + ((r() * 10) | 0); for (let q = 0; q < 6; q++) px2(g, bx + (q >> 1), 3 + q * 2, RIME[1]); }   /* an ice seam in the slate */
    if (up) {                                                                                           /* THE RIME CAP: a lit lip, then snow caught in the beds */
      rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]); rect(g, 0, 2, 16, 1, Z.s[4]);
      for (let p = 0; p < 16; p++) { const h = hash(x * 16 + p, y) % 5; if (h < 2) px2(g, p, 0, RIME[3]); if (h === 0) px2(g, p, 1, RIME[2]); if (h === 1) px2(g, p, 1, RIME[1]); }
      if ((hash(x, y + 5) & 3) === 0) { const bx = (r() * 11) | 0; rect(g, bx, 0, 4, 2, RIME[3]); rect(g, bx + 1, 2, 2, 1, RIME[2]); }
    }
    if (dn) { rect(g, 0, 13, 16, 3, Z.s[0]); rect(g, 0, 13, 16, 1, Z.s[1]); for (let k = 0; k < 3; k++) { const bx = (hash(x * 3 + k, y) % 15); px2(g, bx, 15, RIME[1]); px2(g, bx, 14, RIME[0]); } }   /* the wet dark under a lip and its drips */
    if (lf) { rect(g, 0, 0, 1, 16, Z.s[Math.min(6, d <= 1 ? 5 : 4)]); }
    if (rt) { rect(g, 15, 0, 1, 16, Z.s[0]); rect(g, 14, 0, 1, 16, Z.s[1]); }
    return c; });
}

/* THE IRON GANTRY DECK: a riveted deck plate over a flange; the line crews' own iron, rimed and rust-streaked */
function gantryTile(zone, x, y, eL, eR) {
  return once('ga' + zone + '_' + (x & 3) + (y & 1) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), r = mulberry(hash(x & 3, y & 1) + 71 + zone), warm = zone === 5;
    rect(g, 0, 0, 16, 1, IRON[6]); rect(g, 0, 1, 16, 3, IRON[4]); rect(g, 0, 1, 16, 1, IRON[5]); rect(g, 0, 4, 16, 1, IRON[1]);   /* the plate: lit edge, body, its dark lip */
    for (let k = 1; k < 16; k += 5) { px2(g, k, 2, IRON[6]); px2(g, k, 3, IRON[2]); }                                                    /* rivets */
    for (let k = 0; k < 16; k += 4) { px2(g, k, 1, IRON[3]); px2(g, k + 1, 1, IRON[3]); }                                               /* grating slots */
    rect(g, 0, 5, 16, 3, IRON[2]); rect(g, 0, 5, 16, 1, IRON[3]); rect(g, 0, 7, 16, 1, IRON[0]);                                         /* the flange under it */
    rect(g, 0, 8, 16, 1, IRON[1]); for (let k = 2; k < 16; k += 8) { rect(g, k, 8, 2, 3, IRON[2]); px2(g, k, 8, IRON[4]); px2(g, k + 1, 10, IRON[0]); }   /* brackets' tops */
    if ((hash(x, y) % 3) === 0) { const bx = (r() * 12) | 0; for (let q = 0; q < 5; q++) px2(g, bx + (q & 1), 5 + q, RUST[q % 3]); }   /* a rust streak down the flange */
    if ((hash(x + 1, y) % 4) === 0) { const bx = (r() * 10) | 0; rect(g, bx, 0, 5, 1, RIME[3]); rect(g, bx + 1, 1, 3, 1, RIME[2]); }   /* snow on the plate */
    if (warm && (hash(x, y) & 1)) { px2(g, 4, 1, LAMP[2]); px2(g, 11, 1, LAMP[1]); }                                                       /* lamp glint on the wet iron */
    if (eL) { rect(g, 0, 0, 2, 8, IRON[5]); rect(g, 0, 0, 1, 8, IRON[6]); px2(g, 1, 3, IRON[1]); }                                        /* an end plate and its bolt */
    if (eR) { rect(g, 14, 0, 2, 8, IRON[1]); rect(g, 15, 0, 1, 8, IRON[0]); px2(g, 14, 3, IRON[3]); }
    return c; });
}
/* A ROCK LIP: a slab of the granite itself (the crevice's lips, the shelf, the hut's floor, the last steps): lit top, chamfered underside */
function lipTile(zone, x, y, eL, eR) {
  return once('li' + zone + '_' + (x & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16), Z = ZONE[zone];
    fillGranite(g, zone, x, y, 3, eL, 0, 8);
    rect(g, 0, 0, 16, 1, Z.s[6]); rect(g, 0, 1, 16, 1, Z.s[5]);
    for (let p = 0; p < 16; p++) { const h = hash(x * 16 + p, y) % 5; if (h < 2) px2(g, p, 0, RIME[3]); if (h === 0) px2(g, p, 1, RIME[2]); }
    rect(g, 0, 6, 16, 2, Z.s[1]); rect(g, 0, 7, 16, 1, Z.s[0]);
    if (eL) { rect(g, 0, 0, 1, 7, Z.s[5]); px2(g, 0, 6, Z.s[2]); } if (eR) { rect(g, 15, 1, 1, 6, Z.s[0]); px2(g, 15, 0, Z.s[3]); }
    return c; });
}
/* A CARGO NET: tarred hemp, a diamond mesh, a knot at each crossing, lashed to iron rings at the ends */
function netTile(x, y, eL, eR) {
  return once('ne' + (x & 3) + (eL ? 'l' : '') + (eR ? 'r' : ''), () => {
    const [c, g] = canvas(16, 16);
    for (let k = 0; k < 16; k++) { const a = (k + (x & 3) * 4) & 15; for (const [px_, py_] of [[k, a >> 1], [15 - k, a >> 1]]) if (py_ < 8) px2(g, px_, py_ + 0, ROPE[(k & 1) ? 3 : 2]); }
    for (let k = 0; k < 16; k++) { px2(g, k, 8 + (k & 1), ROPE[2]); }                                                                    /* the heads' rope along the edge */
    for (let k = 0; k < 16; k += 4) { px2(g, k, (k >> 1) & 7, ROPE[4]); px2(g, 15 - k, (k >> 1) & 7, ROPE[4]); }                          /* knots catching the light */
    rect(g, 0, 0, 16, 1, ROPE[4]); rect(g, 0, 1, 16, 1, ROPE[3]);                                                                        /* the top rope */
    for (let k = 2; k < 16; k += 4) px2(g, k, 2, ROPE[0]);
    if (eL) { rect(g, 0, 0, 3, 5, IRON[3]); rect(g, 0, 0, 3, 1, IRON[5]); px2(g, 1, 2, IRON[0]); }                                       /* the iron ring it is lashed to */
    if (eR) { rect(g, 13, 0, 3, 5, IRON[2]); rect(g, 13, 0, 3, 1, IRON[4]); px2(g, 14, 2, IRON[0]); }
    return c; });
}

/* what is a rock lip and what is a gantry: the landings by index (src/highlines.js HL_DATA.landings) */
export const ROCK_LANDINGS = [14, 15, 16, 17, 18, 19, 20, 21, 22, 29, 30, 31, 32, 33];
function maps(L) {
  if (L._hlMaps) return L._hlMaps;
  const rock = new Set(), net = new Set();
  (L.landings || []).forEach((b, i) => { if (ROCK_LANDINGS.includes(i)) for (let x = b[0]; x <= b[2]; x++) rock.add(x + ',' + b[1]); });
  for (const b of L.nets || []) for (let x = b[0]; x <= b[2]; x++) net.add(x + ',' + b[1]);
  return (L._hlMaps = { rock, net });
}
export function hlTile(t, x, y, at, T, L) {
  const z = zoneOf(x, y);
  if (t === T.SOLID) { const o = n => !isSolid(at(x, y + n), T), up = o(-1), dn = o(1), lf = !isSolid(at(x - 1, y), T), rt = !isSolid(at(x + 1, y), T); return solidTile(z, x, y, up, dn, lf, rt, depth(at, T, x, y)); }
  if (t === T.ONEWAY) {
    const M = maps(L), k = x + ',' + y, same = (xx) => at(xx, y) === T.ONEWAY && (M.net.has(xx + ',' + y) === M.net.has(k)) && (M.rock.has(xx + ',' + y) === M.rock.has(k));
    const eL = !same(x - 1), eR = !same(x + 1);
    if (M.net.has(k)) return netTile(x, y, eL, eR);
    if (M.rock.has(k)) return lipTile(z, x, y, eL, eR);
    return gantryTile(z, x, y, eL, eR);
  }
  return null;
}

/* ---------------------------------------------------------------- SUPPORTS: the iron gantry's pylons and wall brackets (L.routeSupports kind 'hlgantry') ---------------------------------------------------------------- */
/* p = { x, y (the deck's row), bottom, kind: 'hlgantry', st: 'pylon' | 'bracketL' | 'bracketR', len, wall (tiles to the cliff), first, run: [x0, x1] }.
   A BRACKET is a jib from the cliff: a wall plate bolted into the rock, an I-beam under the deck run to the plate, a knee brace and a tie rod up to the wall. A PYLON is the line crews' lattice mast under a deck
   hung in the shaft: two legs, X bracing, a ballast shoe - with a guy cable out to each cliff. Drawn in the world, over the tiles. */
export function drawGantry(g, p, cx, cy) {
  const X = Math.round(p.x * 16 - cx), Y = Math.round(p.y * 16 - cy);
  if (X < -40 || X > g.canvas.width + 40 || Y < -120 || Y > g.canvas.height + 40) return;
  const len = Math.max(2, p.len || 3) * 16, run = p.run || [p.x, p.x];
  if (p.st === 'pylon') {
    const lx = X + 3, rx = X + 11;
    rect(g, lx, Y + 6, 2, len - 2, IRON[2]); rect(g, lx, Y + 6, 1, len - 2, IRON[4]); rect(g, rx, Y + 6, 2, len - 2, IRON[1]); rect(g, rx, Y + 6, 1, len - 2, IRON[3]);   /* the two legs */
    for (let k = 0; k < len - 18; k += 12) { for (let q = 0; q < 8; q++) { rect(g, lx + 2 + q, Y + 10 + k + q * 1.5, 1, 1, IRON[3]); rect(g, rx - 1 - q, Y + 10 + k + q * 1.5, 1, 1, IRON[2]); }
      rect(g, lx, Y + 8 + k + 12, 10, 1, IRON[3]); }                                                                                       /* X bracing between rungs */
    rect(g, X + 1, Y + 6, 14, 2, IRON[4]); rect(g, X + 1, Y + 6, 14, 1, IRON[5]);                                                          /* the cap under the deck */
    rect(g, X + 2, Y + len, 12, 4, IRON[2]); rect(g, X + 2, Y + len, 12, 1, IRON[4]); rect(g, X + 4, Y + len + 4, 8, 3, IRON[1]); rect(g, X + 6, Y + len + 7, 4, 2, IRON[0]);   /* the ballast shoe */
    for (const [yy] of [[Y + 8], [Y + len - 2]]) { px2x(g, X + 1, yy, IRON[6]); px2x(g, X + 14, yy, IRON[6]); }
    for (const s of [-1, 1]) { const wallD = (s < 0 ? p.x : 79 - p.x) * 16, run_ = Math.min(wallD, 110); for (let q = 0; q < run_; q += 2) { const t = q / run_; rect(g, X + 8 + s * q, Y + 8 - Math.round(t * t * 34 + t * 10), 1, 1, q % 6 < 4 ? IRON[5] : IRON[3]); } }   /* guy cables up and out to the cliffs */
    return;
  }
  const s = p.st === 'bracketL' ? -1 : 1, wallX = Math.round((s < 0 ? 1 : 79) * 16 - cx + (s < 0 ? 0 : 0)) , tipX = X + (s < 0 ? 0 : 15);
  const span = Math.abs(tipX - wallX);
  if (p.first !== false) {                                                                                                              /* the I-beam under the deck run, from the plate */
    const bx0 = Math.round((s < 0 ? 1 : run[0]) * 16 - cx), bx1 = Math.round((s < 0 ? run[1] + 1 : 79) * 16 - cx);
    rect(g, Math.min(bx0, bx1), Y + 8, Math.abs(bx1 - bx0), 3, IRON[2]); rect(g, Math.min(bx0, bx1), Y + 8, Math.abs(bx1 - bx0), 1, IRON[4]); rect(g, Math.min(bx0, bx1), Y + 10, Math.abs(bx1 - bx0), 1, IRON[0]);
    const plateX = s < 0 ? wallX : wallX - 4; rect(g, plateX, Y + 3, 5, 14, IRON[3]); rect(g, plateX, Y + 3, 5, 1, IRON[5]); for (const yy of [Y + 5, Y + 9, Y + 13]) { px2x(g, plateX + 1, yy, IRON[6]); px2x(g, plateX + 3, yy, IRON[1]); }   /* the wall plate and its bolts */
  }
  const kx = tipX - s * Math.min(span - 2, 40);                                                                                          /* the knee brace: tip to a point back along the beam, down */
  for (let q = 0; q <= 22; q++) { const t = q / 22; rect(g, Math.round(tipX - s * 3 + (kx - tipX + s * 3) * t), Y + 11 + Math.round(t * 16), 2, 2, IRON[3]); }
  rect(g, Math.round(kx) - 1, Y + 27, 3, 3, IRON[4]);
  for (let q = 0; q <= 30; q++) { const t = q / 30; px2x(g, Math.round(tipX - s * 1 - s * Math.min(span, 60) * t), Y + 4 - Math.round(t * 18), (q & 1) ? IRON[5] : IRON[3]); }   /* the tie rod up and back into the cliff */
  rect(g, tipX - (s < 0 ? 1 : 3), Y + 3, 4, 8, IRON[3]); rect(g, tipX - (s < 0 ? 1 : 3), Y + 3, 4, 1, IRON[6]);                         /* the tip bracket */
}
function px2x(g, x, y, c) { rect(g, x, y, 1, 1, c); }

/* ---------------------------------------------------------------- DRESSING: rime tufts, icicles, lamps on the stations, rope coils, a lashed crate or two ---------------------------------------------------------------- */
const sprMemo = new Map(); const spr = (k, w, h, fn) => { if (!sprMemo.has(k)) { const [c, g] = canvas(w, h); fn(g); sprMemo.set(k, c); } return sprMemo.get(k); };
export const SPR = {
  icicle: v => spr('ic' + v, 5, 14 + v * 4, g => { const n = 12 + v * 4; for (let y = 0; y < n; y++) { const w = Math.max(1, 3 - ((y * 3 / n) | 0)); rect(g, 2 - (w >> 1), y, w, 1, y < 2 ? RIME[0] : y % 4 < 2 ? RIME[1] : RIME[2]); } px2x(g, 2, n - 1, RIME[3]); }),
  lamp: () => spr('lamp', 7, 26, g => { rect(g, 3, 13, 1, 13, IRON[3]); rect(g, 2, 24, 3, 2, IRON[2]); rect(g, 3, 0, 1, 4, IRON[3]); rect(g, 1, 4, 5, 1, IRON[4]); rect(g, 1, 5, 5, 7, IRON[1]); rect(g, 2, 6, 3, 5, LAMP[1]); rect(g, 3, 7, 1, 3, LAMP[3]); rect(g, 1, 12, 5, 1, IRON[4]); px2x(g, 0, 7, LAMP[0]); px2x(g, 6, 7, LAMP[0]); }),
  coil: v => spr('co' + v, 14, 9, g => { for (let k = 0; k < 4; k++) { rect(g, 1 + k, 8 - k * 2, 12 - k * 2, 2, ROPE[2 + (k & 1)]); rect(g, 1 + k, 8 - k * 2, 12 - k * 2, 1, ROPE[4]); } rect(g, 6, 0, 2, 2, ROPE[1]); px2x(g, 8, 1, ROPE[4]); }),
  crate: v => spr('cr' + v, 14, 12, g => { rect(g, 0, 0, 14, 12, IRON[2]); rect(g, 0, 0, 14, 2, IRON[4]); rect(g, 0, 0, 1, 12, IRON[3]); rect(g, 13, 0, 1, 12, IRON[0]); rect(g, 2, 2, 10, 8, v ? '#5a4a34' : '#4a3c2c'); rect(g, 2, 2, 10, 1, v ? '#8a7650' : '#7a6844'); rect(g, 0, 5, 14, 2, IRON[3]); for (const yy of [1, 8]) { px2x(g, 1, yy, IRON[6]); px2x(g, 12, yy, IRON[6]); } }),
  tuft: v => spr('tu' + v, 8, 5, g => { for (let k = 0; k < 3; k++) { rect(g, 1 + k * 2, 3 - (k === 1 ? 2 : 1), 2, 2 + (k === 1 ? 2 : 1), RIME[1 + (k & 1)]); } rect(g, 0, 4, 8, 1, RIME[0]); }),
  bolt: () => spr('bolt', 5, 5, g => { rect(g, 0, 0, 5, 5, IRON[3]); rect(g, 0, 0, 5, 1, IRON[5]); px2x(g, 2, 2, IRON[6]); px2x(g, 3, 3, IRON[0]); }),
};
export function dress(decor, L, at, T) {
  const W = L.W, H = L.H, busy = new Set(); for (const e of L.ents || []) for (let dx = -2; dx <= 2; dx++) busy.add((e.x + dx) + ',' + e.y);
  const A = L.arena, inArena = x => A && x * 16 >= A.x0 - 16 && x * 16 <= A.x1 + 16, add = (c, x, y) => decor.push({ k: 'hldress', x: Math.round(x), y: Math.round(y), c, bg: true, sway: 0 });
  const M = maps(L);
  for (let y = 2; y < H - 2; y++) for (let x = 1; x < W - 1; x++) {
    const t = at(x, y), hv = hash(x * 7 + 3, y * 5 + 1), r = hv % 100;
    if (t === T.SOLID && at(x, y + 1) === T.AIR && !inArena(x)) { let open = 0; while (open < 6 && at(x, y + 1 + open) === T.AIR) open++; if (open >= 3 && r < 11) add(SPR.icicle(r & 1), x * 16 + 5 + (hv >> 9) % 6, y * 16 + 14); }   /* icicles under every overhang */
    else if (t === T.SOLID && at(x, y - 1) === T.AIR && !busy.has(x + ',' + (y - 1)) && !inArena(x) && r < 7) add(SPR.tuft(r & 1), x * 16 + 4, y * 16 - 4);
    else if (t === T.ONEWAY && !M.net.has(x + ',' + y) && !M.rock.has(x + ',' + y) && at(x, y - 1) === T.AIR && !busy.has(x + ',' + (y - 1))) {   /* a gantry deck: a coil of rope, a lashed crate */
      if (r < 5) add(SPR.coil(r & 1), x * 16 + 1, y * 16 - 8); else if (r < 8) add(SPR.crate(r & 1), x * 16 + 1, y * 16 - 11);
    }
  }
  for (const c of L.checkpoints || []) { const x = Math.floor(c.x), y = Math.floor(c.y); add(SPR.lamp(), (x + 2) * 16 + 4, y * 16 - 26); }   /* a lamp at every checkpoint station */
}
