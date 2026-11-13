// lw3_tiles.js - SALTREACH's TILE KIT (claude/saltart, 2026-11-13). Long Water 3's columns 366-705 wore master's generic coast set (warm dusk sand, one flat grey).
// This is a SALT-MARSH FISHING VILLAGE under sea-mist, and every material is TEXTURED PER PIXEL (no single-colour block anywhere): each tile is baked from a pixel function of the
// WORLD pixel (so courses, cracks and ripples run on across tile seams), lit from the top left, with a TIDE LINE on every wall (dry salt-bleached stone above the bay's high-water row 24,
// barnacles from row 26, weed streaks from row 29, darkened silt under row 33) - the level IS the tide, so the stone says where the tide comes to.
//   quay       the village's harbour stone: pale blue-grey limestone ashlar in 16 / 32 px blocks, bevelled, chipped, grit; walked tops are flags with a salt crust, a cobble seam and amber
//              lantern-wash flecks; an iron mooring ring on some faces
//   wall       THE SEA WALL (cols 448-455): rusticated blocks, deep bevels, the heaviest tide line, drain holes
//   sand       THE FLATS / the coves' beds / the Herald's floor: wet ripple sand with shell fleck, pebbles, a bright wet lip, a weed tuft; silt strata under it, dithered into rock
//   bluff      THE MILL's bluff + the race's bed + its steps: blue-black basalt in columns, vertical cracks, moss at the lip, a wet sheen
//   stump      THE PIER STUMPS (cols 504-537): barnacled granite, lilac-grey, crowded barnacle clusters, hanging weed, gull-white on the cap
//   stone      THE HERALD'S STONES (arena, three of them): pale standing granite with a salt-bleached cap and a worn dip, lantern amber moss
// Other cells: ONEWAY = the NET-DRYING WALKS (a tarred rope on top, a cork float or two, netting under, an iron stanchion at each end); NET = the KELP LADDER (two tarred ropes, rope rungs, kelp
// fronds with bladders). No timber anywhere (boats are drawn by the hands). x < 366 returns null: master's own Long Water art draws it.
// 16x16, baked lazily, memoised.   lw3Tile(t, x, y, at, T, L) -> a canvas, or null (the game's own kit draws it)
import { canvas, rect } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const KIT_X0 = 366, HIGH_ROW = 24, BARN_ROW = 26, WEED_ROW = 29, SILT_ROW = 33;
export const STUMPS = [504, 537], MILL = [462, 489], WALL = [448, 455], STONES = [[658, 660], [672, 673], [686, 688]], ARENA = [650, 705];

/* the stones: eight steps dark -> lit, each a plain colour (the texture is the choice of step per pixel) */
export const PAL = {
  quay:  ['#161c23', '#222b34', '#313e49', '#445562', '#5c707d', '#7a8f9a', '#a2b4ba', '#cddada'],
  wall:  ['#10161c', '#1b242c', '#2a3640', '#3a4854', '#4f606c', '#6a7c88', '#8c9ea6', '#b4c4c6'],
  bluff: ['#080d12', '#0f171e', '#18242d', '#243441', '#324656', '#445c6c', '#5c7a88', '#7c9aa4'],
  stump: ['#1a1a24', '#2a2a38', '#3d3e4f', '#54566a', '#70728a', '#8e90a6', '#b0b2c4', '#d4d6e0'],
  stone: ['#1c2028', '#2c323c', '#40495a', '#586474', '#788690', '#9aa8ae', '#c0cccc', '#e4ecea'],
  sand:  ['#2a261e', '#3e382a', '#574e38', '#756a4c', '#938660', '#b3a47a', '#d0c294', '#e8dcb2'],
  silt:  ['#14161a', '#1e2224', '#2a302e', '#3a423c', '#4e5648'],
};
const C = { joint: '#0c1016', crust: '#e6eeee', crust2: '#c4d2d4', amber: '#e6c070', amberD: '#a8802c', barn: ['#e4e6da', '#b4b8aa', '#80857a'], weed: ['#16301f', '#244a30', '#3a6a42', '#5c9250'],
  moss: ['#1c3a26', '#2f5a34', '#4a7a40'], iron: ['#15171b', '#2a2e36', '#4a505c', '#7a8290'], rope: ['#17110a', '#2e2314', '#54442a', '#86734a'], cork: ['#7a5a2c', '#b08a48', '#d8b868'], shell: '#ece4cc', pebble: ['#3a362c', '#8a806a'], gull: '#eef0ee' };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) rect(g, x, y, 1, 1, c); };
const mixHex = (a, b, k) => { const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };

/* ONE MASONRY PIXEL: courses of ch px, blocks of 16 or 32 (period 128 so a tile column repeats every 8), staggered; mortar low and right, a lit arris top and left, a dark bevel bottom and right, grit.
   o = { ch, seed, bevel (px), tone (spread), chip (1 in n) } -> an index into the 8-step ramp (can be -1 / 8: caller clamps) */
function masonry(ax, ay, o) {
  const ch = o.ch || 8, course = Math.floor(ay / ch), cy = ay - course * ch, seed = o.seed || 0;
  const w = (hash(course, seed) & 3) === 0 ? 32 : 16, off = hash(course, seed + 1) % 16, p = (((ax - off) % 128) + 128) % 128, blk = Math.floor(p / w), sx = p - blk * w;
  const bid = hash(blk * 31 + course * 17, seed + 2), tone = (bid % 3) - 1 + (((bid >> 5) % 5) === 0 ? 1 : 0) * (o.tone || 0), bv = o.bevel || 1;
  if (cy === ch - 1 || sx === w - 1) return { mortar: true, v: 0 };
  let v = (o.base || 3) + tone;
  if (cy < bv) v += 2; else if (sx < bv) v += 1; else if (cy >= ch - 1 - bv) v -= 1; else if (sx >= w - 1 - bv) v -= 1;
  const gh = hash(ax, ay * 3 + seed);
  if (gh % 11 === 0) v -= 1; else if (gh % 17 === 0) v += 1;
  if (o.chip && (hash(bid, cy * 7 + sx) % o.chip) === 0 && (cy < 2 || sx < 2)) return { mortar: true, v: 1 };
  const hairline = (hash(bid, 9) & 7) === 0 && sx === ((bid >> 4) % (w - 4)) + 2 && cy > 1 && cy < ch - 3;   /* a hairline crack running down one block */
  return { v: hairline ? v - 2 : v, block: bid };
}
/* ripple sand: low ridges that run across the tile, 6 px apart, wobbled by x */
function ripple(ax, ay, seed) { const r = (ay + Math.round(Math.sin(ax * 0.42 + seed) * 1.6 + Math.sin(ax * 0.11 + seed * 2) * 2.2)) % 6; return r < 0 ? r + 6 : r; }

/* what a tile is: from where it stands. kind -> 'quay' | 'wall' | 'sand' | 'bluff' | 'stump' | 'stone'; surface = the row of the top of its column run */
function surfaceOf(x, y, at, T) { let s = y; while (s > 0 && at(x, s - 1) === T.SOLID) s--; return s; }
export function kindOf(x, y, surf) {
  if (x >= ARENA[0]) { for (const [a, b] of STONES) if (x >= a && x <= b && y >= 28 && y < 31) return 'stone'; if (x >= 698) return 'quay'; if (x >= 696) return 'wall'; if (x === 650) return 'wall'; return surf >= 28 ? 'sand' : 'quay'; }
  if (x >= STUMPS[0] && x <= STUMPS[1] && surf <= 24) return 'stump';
  if (x >= MILL[0] && x <= MILL[1]) return surf <= 1 || y < 33 ? 'bluff' : 'bluff';
  if (x >= 490 && x <= 495) return 'bluff';
  if (x >= WALL[0] && x <= WALL[1] && surf <= 24) return 'wall';
  if (surf >= 28) return 'sand';
  return 'quay';
}

/* the wet and the dry of a wall: dry salt-bleach above the high-water row, barnacles, weed streaks, silt dark. Called per pixel with the world pixel, the tile edge distance and the colour so far */
function tideStain(col, ax, ay, y, edge, o) {
  const row = ay / 16;
  if (row < HIGH_ROW) {   /* dry: the salt blooms white on the upper tide mark, and a lantern's amber falls on the quay lip */
    if (row > HIGH_ROW - 2.2 && edge <= 3 && hash(ax, ay + 5) % 5 === 0) return C.crust2;
    return col;
  }
  let c = col;
  const k = clamp((row - HIGH_ROW) / 9, 0, 1);
  c = mixHex(c, '#10241c', 0.12 + 0.3 * k);
  if (row >= BARN_ROW && edge <= 2) { const h = hash(ax >> 1, (ay >> 1) + 3); if (h % 9 === 0) return C.barn[(ax + ay) & 1 ? 0 : 1]; if (h % 9 === 1 && ((ax | ay) & 1)) return C.barn[2]; }
  const ws = (HIGH_ROW + 5) * 16 + (hash(ax, 3) % 40);
  const wl = 10 + (hash(ax, 8) % 26); if (ay >= ws && ay < ws + wl && (hash(ax >> 1, 5) % 7) < 2 && (hash(ax, ay) % 4) !== 0) return C.weed[clamp((hash(ax, ay >> 2) % 3) + (ay < ws + 4 ? 1 : 0), 0, 3)];
  if (row > SILT_ROW) c = mixHex(c, '#06100e', 0.18 + (hash(ax, ay + 1) % 4) * 0.05);
  return c;
}

/* ---------- the kinds: pixel(kind, ax, ay, lx, ly, o) -> a colour ---------- */
function pixel(kind, ax, ay, lx, ly, o) {
  const x = o.x, y = o.y, up = o.up, down = o.down, eL = o.eL, eR = o.eR, d = o.dep;
  const edge = Math.min(eL ? lx : 99, eR ? 15 - lx : 99, up ? ly : 99, down ? 15 - ly : 99);
  const P = PAL[kind];
  if (kind === 'sand') return sandPixel(ax, ay, lx, ly, o, edge);
  let m;
  if (kind === 'quay') m = masonry(ax, ay, { ch: 8, seed: 11, base: 4, bevel: 1, tone: 1, chip: 61 });
  else if (kind === 'wall') m = masonry(ax, ay, { ch: 8, seed: 23, base: 4, bevel: 2, tone: 1, chip: 29 });
  else if (kind === 'stump') m = masonry(ax, ay, { ch: 16, seed: 47, base: 3, bevel: 1, tone: 1, chip: 43 });
  else if (kind === 'stone') m = masonry(ax, ay, { ch: 16, seed: 59, base: 4, bevel: 2, tone: 1 });
  else m = bluffPx(ax, ay, o);
  let v = m.v;
  if (m.mortar && kind !== 'bluff') { const c = m.v === 0 ? C.joint : P[Math.max(1, v + 2)]; return tideStain(c, ax, ay, y, edge, o); }
  /* the light falls from the top left: faces turned to it brighten, the shadow side and depth darken */
  if (eL) v += lx < 2 ? 2 : lx < 4 ? 1 : 0; if (eR) v -= 15 - lx < 2 ? 2 : 0;
  v -= d >= 6 ? 2 : d >= 3 ? 1 : 0;
  let c = P[clamp(Math.round(v), 0, 7)];
  if ((kind === 'quay' || kind === 'wall') && m.block && hash(m.block, 3) % 5 === 0) c = mixHex(c, '#a8946a', 0.22);   /* a block of warmer sandstone among the grey */
  if (kind === 'bluff') { const bh = hash(ax, ay + 3); if (bh % 13 === 0) c = P[clamp(Math.round(v) + 2, 0, 7)]; else if (bh % 37 === 0) c = C.moss[0]; else if (bh % 23 === 0) c = P[clamp(Math.round(v) - 1, 0, 7)]; }   /* mineral flecks and a trace of moss */
  if (kind === 'stone' && ly < 3 && up) c = P[clamp(v + 1, 0, 7)];
  if (kind === 'stump') { /* barnacle crowds: a cluster is a lit rim and a dark mouth */
    if (hash(ax >> 2, ay >> 2) % 7 === 0) { const cx = (ax & 3), cy = (ay & 3); if ((cx === 1 || cx === 2) && (cy === 1 || cy === 2)) c = cx === 1 && cy === 1 ? C.barn[0] : cx === 2 && cy === 2 ? '#3a3e48' : C.barn[1]; } }
  return tideStain(c, ax, ay, y, edge, o);
}
/* basalt: columns 6-10 px wide with a lit left arris, a dark crack between, faint strata, a wet sheen that creeps in on lit edges */
function bluffPx(ax, ay, o) {
  const col = Math.floor((ax + (hash(Math.floor(ay / 24), 5) % 7)) / 8) | 0, sx = ((ax + (hash(Math.floor(ay / 24), 5) % 7)) % 8 + 8) % 8, tone = (hash(col, 61) % 3) - 1;
  let v = 3 + tone; if (sx === 0) v += 2; else if (sx === 1) v += 1; else if (sx === 7) v -= 2;
  const strata = (ay % 24) < 2; if (strata) v -= 1;
  const gh = hash(ax, ay + 13); if (gh % 9 === 0) v -= 1; else if (gh % 23 === 0) v += 2;
  if (sx === 7 && (hash(col, Math.floor(ay / 5)) & 3) === 0) return { mortar: true, v: 0 };   /* a crack between columns, broken */
  return { v };
}
function sandPixel(ax, ay, lx, ly, o, edge) {
  const P = PAL.sand, S = PAL.silt, top = o.up, d = o.dep, down = o.down;
  const depthRow = o.top ? o.top : 0;
  if (top) {   /* the surface tile: rows 0-3 are the sand proper, the rest is wet strata */
    const rr = ripple(ax, ay, o.x & 7);
    if (ly === 0) return (hash(ax, 2) % 4) ? P[7 - (hash(ax, 3) & 1)] : P[6];   /* the wet lip catching the light */
    if (ly === 1) return hash(ax, 4) % 5 === 0 ? P[4] : P[6];
    if (ly < 6) { let v = ly < 3 ? 5 : 4; v -= rr === 0 ? 1 : rr === 3 ? 0 : 0; if (rr === 2 && (hash(ax, ay) & 1)) v += 1; if (hash(ax, ay + 9) % 29 === 0) return C.shell; if (hash(ax, ay + 21) % 31 === 0) return C.pebble[hash(ax, 1) & 1]; return P[clamp(v - ((hash(ax, ay) % 7) === 0 ? 1 : 0), 0, 7)]; }
    const u = (ly - 6) / 10; const pick = hash(ax, ay) % 100 < u * 100 ? S : P;   /* dithers sand into silt */
    return pick === S ? S[clamp(3 - (ly > 11 ? 1 : 0) + ((hash(ax, ay + 2) % 5) === 0 ? 1 : 0), 0, 4)] : P[clamp(2 + ((hash(ax, ay) % 4) === 0 ? 1 : 0), 0, 7)];
  }
  /* below the surface: silt with strata, shells, darker with depth; the side faces of the bed (a pool's wall) take the tide stain */
  const v = clamp(4 - (d >= 4 ? 1 : 0) - (d >= 6 ? 1 : 0) + ((hash(ax, ay) % 3) - 1) - ((ay % 10) < 2 ? 1 : 0) + ((hash(ax >> 1, ay) % 17) === 0 ? 1 : 0), 0, 4);
  let c = S[v]; const fh = hash(ax, ay + 31); if (fh % 53 === 0) c = P[3]; else if (fh % 8 === 0) c = P[2]; else if (fh % 29 === 0) c = P[4]; else if (fh % 17 === 0) c = S[Math.min(4, v + 1)]; else if (fh % 41 === 0) c = C.weed[0];   /* sand flecks, a shell chip, a dark clot of weed in the silt */
  if (edge <= 2 && ay / 16 >= HIGH_ROW) return tideStain(c, ax, ay, o.y, edge, o);
  void depthRow; void down; return c;
}

/* ---------- the baked tile for a SOLID cell ---------- */
function solidTile(kind, x, y, up, down, eL, eR, dep, surf) {
  const sx = kind === 'bluff' ? x % 8 : x & 7, key = ['s', kind, sx, y & 3, y >= 24 ? (y >= 33 ? 2 : 1) : 0, up ? 'u' : '', down ? 'd' : '', eL ? 'l' : '', eR ? 'r' : '', Math.min(dep, 6), up ? (hash(x, 5) & 7) : ''].join('');
  return once(key, () => {
    const [c, g] = canvas(16, 16), o = { x, y, up, down, eL, eR, dep, top: surf };
    for (let ly = 0; ly < 16; ly++) for (let lx = 0; lx < 16; lx++) px2(g, lx, ly, pixel(kind, ((x & 7) + 64) * 16 + lx, y * 16 + ly, lx, ly, o));
    if (up) dressTop(g, kind, x, y, eL, eR);
    if (down && kind !== 'sand') { for (let lx = 0; lx < 16; lx++) { px2(g, lx, 15, '#06090c'); if (hash(lx + x * 16, 6) % 3 === 0) px2(g, lx, 14, '#0e141a'); } }
    if (eL && kind !== 'sand') { rect(g, 0, up ? 2 : 0, 1, up ? 14 : 16, PAL[kind][6]); } if (eR && kind !== 'sand') rect(g, 15, up ? 2 : 0, 1, up ? 14 : 16, PAL[kind][0]);
    return c;
  });
}
/* the walked top of a ground tile: flags with a salt crust (quay / wall / stump / stone), moss at a bluff's lip, the weed tuft and the shells on the sand */
function dressTop(g, kind, x, y, eL, eR) {
  const h = hash(x, y + 77);
  if (kind === 'quay' || kind === 'wall') {
    rect(g, 0, 0, 16, 3, PAL[kind][5]); rect(g, 0, 0, 16, 1, PAL[kind][7]); rect(g, 0, 2, 16, 1, PAL[kind][3]);   /* the walked flag: lit lip, face, edge in shade */
    rect(g, 0, 3, 16, 1, C.joint);
    for (let k = 0; k < 16; k++) { const q = hash(k + (x & 7) * 16, 14) % 6; if (q === 0) px2(g, k, 0, C.crust); if (q === 1) px2(g, k, 1, PAL[kind][6]); if (q === 2) px2(g, k, 1, PAL[kind][4]); }   /* worn flag: salt specks and hollows */
    const jx = 5 + (h % 7); px2(g, jx, 0, C.joint); px2(g, jx, 1, C.joint); px2(g, jx, 2, PAL[kind][2]);   /* the butt joint between two flags */
    if (y < HIGH_ROW + 1 && (h & 3) === 0) { px2(g, jx + 1, 0, C.amber); px2(g, jx + 2, 0, C.amberD); }   /* lantern light on the lip */
    if ((h & 15) === 3) { rect(g, 7, 1, 3, 1, C.iron[1]); px2(g, 7, 1, C.iron[3]); px2(g, 9, 1, C.iron[0]); px2(g, 8, 2, C.iron[0]); }   /* a mooring ring set in the flag */
    if ((h & 7) === 5) { for (let q = 0; q < 3; q++) px2(g, 11 + q, 0, C.moss[q]); px2(g, 12, 1, C.moss[1]); }   /* moss in a joint */
  } else if (kind === 'stump') {
    rect(g, 0, 0, 16, 2, PAL.stump[6]); rect(g, 1, 0, 14, 1, PAL.stump[7]); rect(g, 0, 2, 16, 1, PAL.stump[3]);
    for (let k = 0; k < 16; k++) if (hash(k + (x & 7) * 16, 17) % 5 === 0) px2(g, k, 0, C.crust);
    if ((h & 3) === 0) { px2(g, 5, -0, C.gull); px2(g, 6, 0, C.gull); px2(g, 6, 1, C.gull); px2(g, 10, 1, C.gull); }   /* the gulls' white on the cap */
  } else if (kind === 'stone') {
    rect(g, 0, 0, 16, 3, PAL.stone[6]); rect(g, 0, 0, 16, 1, PAL.stone[7]); rect(g, 0, 3, 16, 1, PAL.stone[2]);
    for (let k = 3; k < 13; k++) if (hash(k, x * 3) % 3 === 0) px2(g, k, 1, PAL.stone[5]);   /* the worn dip where boots go */
    for (let k = 0; k < 4; k++) px2(g, 2 + ((h >> (k * 2)) & 7) + k, 0, k & 1 ? C.moss[2] : C.amberD);   /* amber moss */
  } else if (kind === 'bluff') {
    rect(g, 0, 0, 16, 2, PAL.bluff[5]); rect(g, 0, 0, 16, 1, PAL.bluff[7]);
    for (let k = 0; k < 16; k++) { const q = hash(k + (x & 7) * 16, 19) % 4; if (q === 0) { px2(g, k, 1, C.moss[2]); px2(g, k, 2, C.moss[1]); } if (q === 1) px2(g, k, 0, C.moss[1]); }
  } else if (kind === 'sand') {
    if ((h & 3) === 0) { const bx = 2 + (h >> 3) % 10; for (let q = 0; q < 5; q++) px2(g, bx + (q & 1), 1 - Math.min(1, q >> 1), C.weed[q % 4]); px2(g, bx + 1, -1, C.weed[3]); px2(g, bx, 0, C.weed[2]); }   /* a weed tuft crowning the sand */
    if ((h & 15) === 6) { px2(g, 6, 1, C.shell); px2(g, 7, 1, '#b4a888'); px2(g, 7, 0, C.shell); }   /* a shell */
  }
}

/* ---------- the net-drying walk (ONEWAY) and the kelp ladder (NET) ---------- */
function netWalk(x, y, at, T) {
  const same = k => { const v = at(x + k, y); return v === T.ONEWAY; }, first = !same(-1), last = !same(1);
  return once('nw' + (x & 7) + (first ? 'f' : '') + (last ? 'l' : ''), () => {
    const [c, g] = canvas(16, 16), h = hash(x & 7, 91);
    /* the tarred top rope: a two-strand twist, 3 px thick, a lit upper strand */
    for (let lx = 0; lx < 16; lx++) { const tw = ((lx + (x & 1) * 2) >> 1) & 1; px2(g, lx, 0, tw ? C.rope[3] : C.rope[2]); px2(g, lx, 1, tw ? C.rope[2] : C.rope[1]); px2(g, lx, 2, C.rope[0]); }
    /* netting: a diamond mesh 4 px pitch, thin dark twine with a pale knot at each crossing, hanging 8 px with a ragged hem */
    const hem = 7 + (h % 3);
    for (let ly = 3; ly < hem + 1; ly++) for (let lx = 0; lx < 16; lx++) { const a = (lx + ly) & 3, b = (lx - ly + 64) & 3; if (a === 0 || b === 0) px2(g, lx, ly, ly > hem - 1 ? C.rope[1] : C.rope[2]); if (a === 0 && b === 0) px2(g, lx, ly, C.rope[3]); }
    for (const fx of [3, 11]) if (((h >> (fx & 3)) & 1) || fx === 3) { rect(g, fx, 3, 3, 3, C.cork[1]); px2(g, fx, 3, C.cork[2]); px2(g, fx + 2, 5, C.cork[0]); px2(g, fx + 1, 4, C.cork[0]); }   /* cork floats lashed to the net */
    if ((h & 7) === 2) { px2(g, 6, hem + 1, C.barn[0]); px2(g, 7, hem + 2, C.weed[2]); px2(g, 7, hem + 1, C.weed[1]); }
    if (first || last) { const sx = first ? 0 : 13; rect(g, sx, 0, 3, 12, C.iron[1]); rect(g, sx, 0, 1, 12, C.iron[3]); rect(g, sx + 2, 0, 1, 12, C.iron[0]); rect(g, sx - 1 + (first ? 0 : 1), 0, 3, 2, C.iron[3]); }   /* an iron stanchion at each end */
    return c; });
}
function kelpLadder(x, y, at, T) {
  const topEnd = at(x, y - 1) !== T.NET;
  return once('kl' + (x & 3) + (y & 3) + (topEnd ? 't' : ''), () => {
    const [c, g] = canvas(16, 16);
    for (const rx of [4, 11]) { for (let ly = 0; ly < 16; ly++) { px2(g, rx, ly, ((ly >> 1) & 1) ? C.rope[2] : C.rope[3]); px2(g, rx + 1, ly, C.rope[0]); } }
    for (const ry of [2 + (y & 1), 9 + (y & 1)]) { rect(g, 4, ry, 8, 2, C.rope[2]); rect(g, 4, ry, 8, 1, C.rope[3]); px2(g, 4, ry + 1, C.rope[0]); px2(g, 11, ry + 1, C.rope[0]); }   /* the rungs, lashed */
    const h = hash(x, y);   /* kelp fronds draped over the ropes, with air-bladders */
    for (let k = 0; k < 3; k++) { const bx = [1, 7, 13][k] + ((h >> (k * 3)) & 1), len = 6 + ((h >> (k + 4)) % 8); for (let q = 0; q < len; q++) { const wob = Math.round(Math.sin(q * 0.8 + k * 2 + x) * 1.1); px2(g, bx + wob, (h % 5) + q, C.weed[(q + k) % 4]); if (q % 3 === 1) px2(g, bx + wob + 1, (h % 5) + q, C.weed[2]); } if (len > 8) px2(g, bx, (h % 5) + 2, '#9ac070'); }
    if (topEnd) { rect(g, 2, 0, 11, 2, C.iron[1]); rect(g, 2, 0, 11, 1, C.iron[3]); }   /* the ladder's top rail on the quay's lip */
    return c; });
}

/* the entry the game calls (src/main.js: `if (L.lw3Kit) ...`). x < 366 = master's Long Water: null */
export function lw3Tile(t, x, y, at, T, L) {
  void L; if (x < KIT_X0) return null;
  if (t === T.ONEWAY) return netWalk(x, y, at, T);
  if (t === T.NET) return kelpLadder(x, y, at, T);
  if (t !== T.SOLID) return null;
  const open = (dx, dy) => { const v = at(x + dx, y + dy); return v === T.AIR || v === T.NET || v === T.RAIL || v === T.ONEWAY; };
  const up = open(0, -1), down = open(0, 1), eL = open(-1, 0), eR = open(1, 0), surf = surfaceOf(x, y, at, T);
  let dep = 6; for (let k = 1; k <= 5 && dep === 6; k++) for (let dy = -k; dy <= k && dep === 6; dy++) for (let dx = -k; dx <= k; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== k) continue; if (open(dx, dy)) { dep = k; break; } }
  return solidTile(kindOf(x, y, surf), x, y, up, down, eL, eR, dep, surf);
}
