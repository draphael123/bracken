// buried_city_tiles.js - THE BURIED CITY's own TILE KIT (claude/bc2art, the art pass). The greybox wore the shared sand-and-log kit: every ledge a grassy log, one
// masonry brick everywhere. Now each footing kind and each district is its own:
//   THE SAND ROOF   packed sand with buried roof tiles, beam ends and a ragged underside that sifts grain (the dunes' sand, over the whole city)
//   DISTRICTS       THE SAND STAIR sun-bleached ashlar; THE BAZAAR faded painted plaster over brick; THE SINKING STREET red clay brick; THE HOURGLASS HALLS grey
//                   ashlar with a brass inlay line; THE SAND-FALL wet-stained stone with brass sluice plates; THE DROWNED QUARTER tide-marked clay with green streaks;
//                   THE THRONE STREET basalt-lapis under a gilded frieze; THE THRONE ROOM black lapis with gold flagstones
//   FLOORS          laid flags with sand drifted into the joints and a lamp-lit lip; WALLS coursed with a shadow edge; UNDERSIDES hang a dark lip and grit
//   FOOTINGS (ONEWAY, by L.plats kind)  balcony: carved stone slab with a dentil frieze (the corbels are the structure); awning: striped stall cloth with a scalloped
//                   fringe; pipe: brass tube, flanged, verdigris-spotted; beam: dark stone beam, iron-banded; lintel: a broken lintel, chipped and cracked;
//                   drum: a spire's fallen drum, fluted; rotten: cracked, dusty, gapped. (SOLID kinds) dome: glazed scales; minaret: banded glazed tile; house: a buried
//                   roof with a crenellated parapet and beam ends.
//   STAKES (SPIKE)  iron-shod stakes standing in drifted sand and dust-white bone
//   LIGHT           every tile is tinted by the light on it: warm near a lamp, golden in a shaft of sun, cold blue where only the sand's shadow reaches
// Made from px.js primitives, 16x16, baked once and memoised.   bcTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect } from '../px.js';

export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const p2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

/* ---------- the districts' stone: five tones dark -> lit, a joint, an inlay ---------- */
export const DIST = {
  sand:   { r: ['#6a4c2c', '#86663a', '#a4824e', '#c4a064', '#e6c98a'], joint: '#5a3e24', inlay: null, base: '#b08e58' },
  stair:  { r: ['#3a2a1e', '#54402c', '#6e5438', '#8a6c48', '#b09064'], joint: '#2a1e14', inlay: null },
  bazaar: { r: ['#4e3a2e', '#664c3a', '#7e6048', '#9a7a5c', '#bc9a74'], joint: '#34261c', inlay: '#2e7a78', brick: '#5a382c', paint: ['#2c6a68', '#9a4030', '#b8944a'] },
  street: { r: ['#44281e', '#5e3828', '#7a4a34', '#966042', '#b87c52'], joint: '#2e1a12', inlay: null },
  halls:  { r: ['#2e2c2a', '#46423c', '#605a50', '#7c7466', '#9c9280'], joint: '#1e1c1a', inlay: '#c49a3c' },
  sluice: { r: ['#262e2c', '#38443f', '#4a5a52', '#607268', '#80968a'], joint: '#181e1c', inlay: '#b08c3c', stain: '#3c6a52' },
  quarter:{ r: ['#34262a', '#4a3438', '#624450', '#7c5c60', '#9a7a76'], joint: '#241a1c', inlay: null, stain: '#2f5a58', tide: '#241a22' },
  throne: { r: ['#181628', '#242240', '#34325a', '#46447a', '#605e9a'], joint: '#0e0c1a', inlay: '#d8aa40' },
  royal:  { r: ['#100e22', '#1a1834', '#272548', '#363462', '#4a4880'], joint: '#080714', inlay: '#e0b44a' },
};
export const distOf = x => x < 38 ? 'sand' : x < 112 ? 'stair' : x < 200 ? 'bazaar' : x < 237 ? 'street' : x < 337 ? 'halls' : x < 396 ? 'sluice' : x < 513 ? 'quarter' : x < 630 ? 'throne' : 'royal';

/* the level's own facts, read once from the built level: the roof's depth per column, the footing kinds by cell, where light falls */
const INFO = new WeakMap();
function info(L, T) {
  if (INFO.has(L)) return INFO.get(L);
  const W = L.W, H = L.H, roofBot = new Array(W).fill(-2);
  for (let x = 0; x < W; x++) { let y = 0; while (y < H && L.grid[y * W + x] === T.SOLID) y++; roofBot[x] = y < H ? y - 1 : -2; }   /* (the last row of the roof's run; -2 on a column with no air) */
  for (let x = 0; x < W; x++) if (roofBot[x] === -2) { let d = 1; while (d < 60) { const a = x - d, b = x + d; const v = a >= 0 && roofBot[a] > -2 ? roofBot[a] : b < W && roofBot[b] > -2 ? roofBot[b] : -2; if (v > -2) { roofBot[x] = v; break; } d++; } }
  const plat = new Map(); for (const p of L.plats || []) for (let y = p.y; y <= (p.y1 ?? p.y); y++) for (let x = p.x0; x <= p.x1; x++) plat.set(y * W + x, { kind: p.kind, i: x - p.x0, n: p.x1 - p.x0 + 1, top: y === p.y });
  const sun = (L.sun || []).filter(z => z.x0 >= 38), lamps = L.lamps || [];
  const I = { roofBot, plat, sun, lamps }; INFO.set(L, I); return I;
}
/* the light on a cell, in steps of a seventh from -3 (the sand's cold shadow) to +4 (a shaft of sun): warm within ~9 tiles of a lamp, golden in a shaft, else cold */
function lightAt(I, x, y) {
  let v = -1.4;   /* the city's own dark: cold, blue */
  for (const z of I.sun) { const dx = x < z.x0 ? z.x0 - x : x > z.x1 ? x - z.x1 : 0; v = Math.max(v, 4 - dx * 0.9); }
  for (const lp of I.lamps) { const d = Math.hypot(lp.x - x, (lp.y - y) * 1.2); v = Math.max(v, 3.2 - d * 0.42); }
  return Math.max(-3, Math.min(4, Math.round(v)));
}
const TINTED = new Map();
function tint(c, lit) {
  if (lit === 0) return c;
  if (!TINTED.has(lit)) TINTED.set(lit, new WeakMap()); const tm = TINTED.get(lit); if (tm.has(c)) return tm.get(c);
  const [d, g] = canvas(16, 16); g.drawImage(c, 0, 0); g.globalCompositeOperation = 'source-atop';
  g.fillStyle = lit < 0 ? 'rgba(24,34,96,' + (-lit * 0.06).toFixed(3) + ')' : 'rgba(255,' + (lit > 2 ? 214 : 160) + ',' + (lit > 2 ? 110 : 60) + ',' + (lit * 0.045).toFixed(3) + ')'; g.fillRect(0, 0, 16, 16); tm.set(c, d); return d;
}

/* world-space smooth value noise */
const vn = (wx, wy, s) => { const x0 = Math.floor(wx / s), y0 = Math.floor(wy / s), fx = wx / s - x0, fy = wy / s - y0, h = (a, b) => (hash(a, b) % 1000) / 1000;
  const a = h(x0, y0), b = h(x0 + 1, y0), c = h(x0, y0 + 1), d = h(x0 + 1, y0 + 1); return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy; };

/* ---------------------------------------------------------------- SAND (the dunes, the roof, the drifts) */
const SAND = ['#8e6a3c', '#a88248', '#c29a5c', '#d8b472', '#ecd090'];
function sandTile(x, y, o) {   /* o: up (a dune's lit lip), deep (rows under the surface), aL, aR */
  const dp = Math.min(o.depth, 9);
  return once(['sd', x % 5, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', dp].join(''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    const shade = dp < 1 ? 0 : dp < 3 ? 1 : dp < 6 ? 2 : 3, ramp = [[2, 3, 3, 4], [1, 2, 2, 3], [0, 1, 1, 2], [0, 0, 1, 1]][shade];
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy;
      const rip = Math.sin((wx + wy * 1.7) / 5 + vn(wx, wy, 14) * 4) + Math.sin((wx - wy * 0.6) / 11); let k = rip > 0.9 ? 3 : rip > -0.2 ? 2 : rip > -1.1 ? 1 : 0;
      k = ramp[Math.max(0, Math.min(3, k))]; if (hash(wx, wy) % 11 === 0) k = Math.max(0, k - 1); else if (hash(wx + 3, wy + 9) % 17 === 0) k = Math.min(4, k + 1);
      px(g, xx, yy, SAND[k]); }
    if (o.up) for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, SAND[4]); if (hash(wx0 + xx, 2) % 3) px(g, xx, 1, SAND[3]); }
    if (o.aL) for (let yy = 0; yy < 16; yy++) px(g, 0, yy, SAND[0]);
    if (o.aR) for (let yy = 0; yy < 16; yy++) px(g, 15, yy, SAND[4]);
    return c; });
}

/* ---------------------------------------------------------------- THE SAND ROOF: packed sand over buried roof tiles and beam ends */
function roofTile(x, y, o) {   /* o: gap (rows above the underside: 0 is the lowest row), aD, aL, aR (a shaft's lip) */
  const gp = Math.min(o.gap, 5);
  return once(['rf', x % 7, y % 5, gp, o.aD ? 'D' : '', o.aL ? 'L' : '', o.aR ? 'R' : ''].join(''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy;
      const n = vn(wx, wy, 7) * 0.6 + vn(wx + 50, wy, 3) * 0.4, band = Math.floor((wy + Math.round(2.2 * Math.sin(wx / 17))) / 4);
      let k = n > 0.62 ? 2 : n > 0.4 ? 1 : 0; if (band & 1) k = Math.max(0, k - 1);
      const dark = 0; px(g, xx, yy, ['#4a3420', '#5e4428', '#76562e', '#8c6a3c'][Math.max(0, Math.min(3, k + dark))]);
      if (hash(wx, wy) % 13 === 0) px(g, xx, yy, '#a4824e'); else if (hash(wx + 5, wy) % 19 === 0) px(g, xx, yy, '#3a2818'); }
    /* a buried roof tile course: terracotta fragments laid in the sand */
    if (hash(x, y) % 4 === 0) { const ry = 3 + hash(x, y + 7) % 8; for (let k = 0; k < 3; k++) { const rx = (k * 6 + hash(x, y + k) % 4) % 14; rect(g, rx, ry, 5, 2, '#8a4a30'); rect(g, rx, ry, 5, 1, '#b4683c'); rect(g, rx, ry + 2, 5, 1, '#4a2418'); } }
    /* a beam end poking out of the packed sand */
    if (hash(x + 3, y) % 9 === 0) { const by = 4 + hash(x, y + 2) % 7; rect(g, 2, by, 12, 4, '#2a1c10'); rect(g, 2, by, 12, 1, '#5a3e20'); rect(g, 3, by + 1, 10, 2, '#46301a'); for (let k = 0; k < 3; k++) px(g, 4 + k * 4, by + 1, '#2a1c10'); }
    if (o.aD) { for (let xx = 0; xx < 16; xx++) { const h = hash(wx0 + xx, wy0) % 5; px(g, xx, 14, '#2e2012'); px(g, xx, 15, '#1c1208'); if (h === 0) g.clearRect(xx, 15, 1, 1); if (h === 1) px(g, xx, 13, '#3a2818'); }
      for (let k = 0; k < 2; k++) { const dx = hash(wx0, k + 4) % 15; g.clearRect(dx, 15, 2, 1); px(g, dx + 1, 14, '#6a4e2c'); } }   /* (grains caught on the lip) */
    if (o.aL) for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, '#2a1c10'); px(g, 1, yy, '#3a2818'); }
    if (o.aR) for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, '#d8b472'); px(g, 14, yy, '#a4824e'); }
    return c; });
}

/* ---------------------------------------------------------------- THE DISTRICTS' MASONRY */
function stoneFill(g, d, wx0, wy0, o) {   /* coursed stone in world space: 8 px courses of mixed length, per-district character */
  const R = d.r, big = o.d === 'halls' || o.d === 'stair' || o.d === 'sluice' || o.d === 'throne' || o.d === 'royal';
  const ch = big ? 11 : 8;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy, r = Math.floor(wy / ch), bw = big ? 22 + (hash(r, 7) % 3) * 6 : 12 + (hash(r, 5) % 2) * 4, off = hash(r, 11) % bw, cc = Math.floor((wx + off) / bw), bx = (wx + off) - cc * bw, by = wy - r * ch;
    let k = 2 + (hash(cc, r) % 3) - 1; if (hash(cc, r + 9) % 7 === 0) k = 1;
    let col = R[Math.max(0, Math.min(4, k))];
    if (by === ch - 1 || bx === bw - 1) col = d.joint; else if (by === 0 || bx === 0) col = R[Math.min(4, k + 1)]; else if (by === ch - 2) col = R[Math.max(0, k - 1)];
    else if (hash(wx, wy) % 17 === 0) col = R[Math.max(0, k - 1)]; else if (hash(wx + 7, wy) % 23 === 0) col = R[Math.min(4, k + 1)];
    px(g, xx, yy, col); }
}
function districtDetail(g, d, o, x, y, wx0, wy0) {
  const K = o.d;
  if (K === 'bazaar' && o.depth > 0) {   /* painted plaster: a band of colour across it */
    const band = (y % 6) === 2 ? d.paint[hash(x >> 3, y) % 3] : null;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wy = wy0 + yy;
      { if (band && yy >= 5 && yy < 11) px(g, xx, yy, (yy === 5 || yy === 10) ? d.paint[0] === band ? '#1e4a48' : '#6a2a20' : band); else if ((wy & 7) === 7) px(g, xx, yy, '#6e5640'); } } }
  if (K === 'halls' && o.depth > 0 && (y & 3) === 0) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 5, d.inlay); px(g, xx, 6, '#7a5a20'); if (xx % 4 === 1) px(g, xx, 4, '#f0d070'); } }
  if (K === 'sluice') { const wet = vn(wx0, wy0, 11); if (o.depth > 0) for (let xx = 0; xx < 16; xx++) if ((hash(wx0 + xx, 9) % 5) < 2) { const l = 3 + hash(wx0 + xx, 2) % 9; for (let yy = 0; yy < l; yy++) px(g, xx, yy, yy < l - 1 ? '#34584a' : '#4a7a64'); }
    if (hash(x, y) % 6 === 0 && o.depth > 0) { rect(g, 3, 4, 10, 8, '#6a5230'); rect(g, 3, 4, 10, 1, '#d0a848'); rect(g, 3, 11, 10, 1, '#4a3418'); for (const [bx, by] of [[4, 5], [11, 5], [4, 10], [11, 10]]) px(g, bx, by, '#f0d070'); rect(g, 6, 6, 4, 4, '#3a2a14'); void wet; } }
  if (K === 'quarter' && o.depth > 0) { const tide = (y % 9 === 4); if (tide) { rect(g, 0, 7, 16, 2, d.tide); for (let xx = 0; xx < 16; xx++) if (hash(wx0 + xx, 6) % 3 === 0) px(g, xx, 9, d.tide); }
    for (let xx = 0; xx < 16; xx += 1) if ((hash(wx0 + xx, 33) % 7) === 0) { const l = 2 + hash(wx0 + xx, 4) % 8; for (let yy = 0; yy < l; yy++) px(g, xx, 8 + yy, yy < l - 1 ? d.stain : '#4a8078'); } }
  if (K === 'throne' && o.depth > 0) { if ((y & 7) === 3) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 4, d.inlay); px(g, xx, 5, '#8a6a20'); if ((xx & 3) === 1) { px(g, xx, 3, '#f4d878'); px(g, xx, 6, '#8a6a20'); } else if ((xx & 3) === 3) px(g, xx, 3, '#8a6a20'); } }   /* the gilded frieze: a run of gold knots */
    else if ((y & 7) === 4) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, '#3a3868'); px(g, xx, 15, '#10102a'); } } }
  if (K === 'royal' && o.depth > 0 && (y & 3) === 1) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 7, d.inlay); px(g, xx, 8, '#6a4a14'); } }
}
function masonryTile(dk, x, y, o) {   /* o: up, aL, aR, aD, depth, deep */
  const d = DIST[dk];
  const key = ['m', dk, x % 5, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', Math.min(o.depth, 3), o.deep ? 'X' : '', dk === 'bazaar' || dk === 'sluice' || dk === 'quarter' || dk === 'throne' || dk === 'royal' || dk === 'halls' ? (y & 7) + '.' + (x & 3) : ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    if (dk === 'bazaar') { /* plaster over brick */ for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy; let col = ['#8e7254', '#846a50', '#977a5a', '#8a6e52'][hash(wx >> 4, wy >> 3) % 4]; if (hash(wx, wy) % 11 === 0) col = '#7e644a'; else if (hash(wx + 3, wy) % 19 === 0) col = '#a48a68'; px(g, xx, yy, col); } }
    else stoneFill(g, d, wx0, wy0, { d: dk });
    if (o.deep) for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) if ((xx + yy) % 2 === 0 && hash(wx0 + xx, wy0 + yy) % 3 === 0) px(g, xx, yy, d.joint);   /* the foundations, darker and rougher */
    if (!o.deep) districtDetail(g, d, { ...o, d: dk }, x, y, wx0, wy0);
    if (o.up) { /* the street's lip: lit paving, the joints between flags, sand drifted into them */
      for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, d.r[4]); px(g, xx, 1, hash(wx0 + xx, 1) % 4 ? d.r[3] : d.r[4]); px(g, xx, 2, d.r[2]); px(g, xx, 3, d.r[1]); if (hash(wx0 + xx, wy0) % 5 === 0) px(g, xx, 4, d.joint); }
      const jx = ((wx0 >> 4) & 1) ? 7 : 12; for (let yy = 1; yy < 4; yy++) px(g, jx, yy, d.joint);
      for (let k = 0; k < 5; k++) { const sx = hash(wx0, k + 11) % 16; px(g, sx, 0, SAND[3]); if (k < 2) px(g, sx, 1, SAND[2]); } }   /* (the dunes' sand, blown in) */
    if (o.aL) for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, d.joint); px(g, 1, yy, d.r[0]); }
    if (o.aR) for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, d.r[4]); px(g, 14, yy, d.r[3]); }
    if (o.aD) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, '#0c0806'); px(g, xx, 14, d.joint); px(g, xx, 13, d.r[0]); } if (hash(x, y) % 4 === 0) for (let xx = 5; xx < 11; xx++) px(g, xx, 12, d.r[1]); }   /* (a cornice's shadow) */
    return c; });
}

/* ---------------------------------------------------------------- FOOTINGS (ONEWAY) */
function balconyTile(i, n, x) {   /* a carved stone slab (its corbels are src/buried-city-hands.js drawStructure's) */
  return once('pb' + (i === 0 ? 'L' : i === n - 1 ? 'R' : 'M') + (x & 3), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    const col = ['#f0d8a0', '#cdb078', '#b0925e', '#a08450', '#7a5e38', '#3e2c1a'];
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, col[yy]);
    for (let xx = 0; xx < 16; xx++) { if ((wx0 + xx) % 16 === 15) for (let yy = 1; yy < 5; yy++) px(g, xx, yy, '#6a5030'); if (hash(wx0 + xx, 4) % 6 === 0) px(g, xx, 2, '#c4a56e'); }
    for (let xx = 1; xx < 16; xx += 4) { rect(g, xx, 6, 2, 2, '#8a6c40'); px(g, xx, 6, '#b08e58'); px(g, xx, 7, '#3e2c1a'); px(g, xx + 1, 7, '#3e2c1a'); }   /* a dentil frieze under the slab */
    for (let xx = 0; xx < 16; xx += 5) px(g, xx + (hash(wx0, xx) % 3), 3, '#7a5e38');
    if (i === 0) { g.clearRect(0, 0, 1, 2); px(g, 0, 2, '#7a5e38'); rect(g, 1, 1, 1, 4, '#e6cc94'); } if (i === n - 1) { g.clearRect(15, 0, 1, 2); px(g, 15, 2, '#7a5e38'); rect(g, 14, 1, 1, 4, '#7a5e38'); }
    return c; });
}
function awningTile(i, n, x) {   /* striped stall cloth on a rod, a scalloped fringe */
  return once('pa' + (i === 0 ? 'L' : i === n - 1 ? 'R' : 'M') + (x & 7), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    rect(g, 0, 0, 16, 1, '#5a3a1c'); rect(g, 0, 1, 16, 1, '#8a5a2c');
    for (let xx = 0; xx < 16; xx++) { const s = Math.floor((wx0 + xx) / 4) & 1, A = s ? ['#e8d4a4', '#d4bc86', '#b49e68'] : ['#c4442c', '#a63420', '#7e2616'];
      px(g, xx, 2, A[0]); px(g, xx, 3, A[0]); px(g, xx, 4, A[1]); px(g, xx, 5, A[1]);
      const ph = (wx0 + xx) % 4, sc = ph === 0 || ph === 3 ? 0 : 1; px(g, xx, 6, ph === 0 ? A[2] : A[1]); if (sc) { px(g, xx, 7, A[1]); px(g, xx, 8, ph === 1 && hash(wx0 + xx, 3) % 3 === 0 ? A[2] : A[1]); }
      if (hash(wx0 + xx, 2) % 11 === 0) px(g, xx, 3, A[2]); }
    for (let k = 0; k < 2; k++) { const hx = hash(wx0, k + 2) % 14; if (hash(wx0, k) % 3 === 0) { g.clearRect(hx, 3, 2, 2); px(g, hx, 5, '#3a2210'); } }   /* (a moth-eaten hole: you can see the dark behind it) */
    if (i === 0) { rect(g, 0, 0, 2, 9, '#00000000'); g.clearRect(0, 6, 1, 3); } if (i === n - 1) g.clearRect(15, 6, 1, 3);
    return c; });
}
function pipeTile(i, n, x) {   /* a brass pipe: a lit tube, flanged at the joints, verdigris and bolts */
  return once('pp' + (i === 0 ? 'L' : i === n - 1 ? 'R' : 'M') + (x & 3), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    const col = ['#7a5416', '#f0d070', '#d4aa48', '#b08a30', '#8a6820', '#4e3810'];
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, col[yy]);
    for (let xx = 0; xx < 16; xx++) { if (hash(wx0 + xx, 8) % 9 === 0) { px(g, xx, 1, '#e8f0c0'); } if (hash(wx0 + xx, 3) % 8 === 0) { px(g, xx, 2 + hash(xx, wx0) % 3, '#4aa08a'); if (hash(xx, 9) % 2) px(g, xx + 1, 3, '#3a8470'); } }
    const fl = (x & 3) === 1 ? 7 : -1; if (fl >= 0) { rect(g, fl, 0, 3, 8, '#8a6820'); rect(g, fl, 0, 1, 8, '#e0b858'); rect(g, fl + 2, 0, 1, 8, '#4e3810'); px(g, fl + 1, 1, '#f0d070'); px(g, fl + 1, 6, '#3a2810'); }
    if (i === 0) { rect(g, 0, 0, 2, 7, '#8a6820'); rect(g, 0, 0, 1, 7, '#e0b858'); px(g, 1, 3, '#3a2810'); } if (i === n - 1) { rect(g, 14, 0, 2, 7, '#8a6820'); rect(g, 15, 0, 1, 7, '#4e3810'); px(g, 14, 3, '#f0d070'); }
    return c; });
}
function beamTile(i, n, x) {   /* a dark stone beam, iron-banded where the chains take it */
  return once('pm' + (i === 0 ? 'L' : i === n - 1 ? 'R' : 'M') + (x & 3), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    const col = ['#8a8498', '#625e74', '#544f66', '#454058', '#2e2a3c', '#1a1824'];
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, col[yy]);
    for (let xx = 0; xx < 16; xx++) if (hash(wx0 + xx, 6) % 7 === 0) px(g, xx, 2, '#74708a');
    if ((wx0 >> 4) % 2 === 0) for (let yy = 0; yy < 6; yy++) px(g, 8, yy, '#2a2636');
    if (i === 0) { rect(g, 2, 0, 3, 6, '#7a7a86'); rect(g, 2, 0, 1, 6, '#c4c4d0'); rect(g, 4, 0, 1, 6, '#3a3a46'); px(g, 3, 2, '#e0e0ea'); rect(g, 0, 0, 1, 6, '#2a2636'); }
    if (i === n - 1) { rect(g, 11, 0, 3, 6, '#7a7a86'); rect(g, 11, 0, 1, 6, '#c4c4d0'); rect(g, 13, 0, 1, 6, '#3a3a46'); px(g, 12, 2, '#e0e0ea'); rect(g, 15, 0, 1, 6, '#2a2636'); }
    return c; });
}
function lintelTile(i, n, x) {   /* a broken lintel: pale limestone, a diagonal crack, a chipped end */
  return once('pl' + (i === 0 ? 'L' : i === n - 1 ? 'R' : 'M') + (x & 3), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    const col = ['#e4dcc4', '#c8c0a4', '#b0a888', '#9a9272', '#6e6850', '#38342a'];
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, col[yy]);
    for (let k = 0; k < 6; k++) { const cx = 3 + hash(wx0, 4) % 8 + (k >> 1) * (hash(wx0, 5) % 2 ? 1 : -1); px(g, cx, k, '#2a261c'); }
    for (let xx = 0; xx < 16; xx++) if (hash(wx0 + xx, 12) % 6 === 0) px(g, xx, 2, '#8a8468');
    for (let k = 0; k < 3; k++) px(g, 2 + k * 5, 1, '#6e6850');   /* (old carved notches) */
    if (i === 0) { g.clearRect(0, 0, 2, 2); g.clearRect(0, 4, 1, 2); px(g, 2, 1, '#6e6850'); } if (i === n - 1) { g.clearRect(14, 0, 2, 1); g.clearRect(15, 1, 1, 3); px(g, 14, 1, '#6e6850'); }
    for (let xx = 0; xx < 16; xx += 3) px(g, xx, 6, hash(wx0, xx) % 2 ? '#6e6850' : '#38342a');
    return c; });
}
function drumTile(i, n, x) {   /* a fallen spire drum: a fluted cylinder lying on its side */
  return once('pd' + (i === 0 ? 'L' : i === n - 1 ? 'R' : 'M') + (x & 3), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    const col = ['#e6d4a0', '#d0b87c', '#b49a62', '#9a8050', '#745c36', '#3e2e1a'];
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) { const fl = (wx0 + xx) % 4 === 3; px(g, xx, yy, fl ? col[Math.min(5, yy + 1)] : col[yy]); }
    for (let xx = 0; xx < 16; xx++) if (hash(wx0 + xx, 5) % 8 === 0) px(g, xx, 3, '#8a7048');
    if (i === 0) { rect(g, 0, 0, 3, 7, '#6a5430'); rect(g, 0, 0, 1, 7, '#e6d4a0'); rect(g, 2, 0, 1, 7, '#2e2212'); px(g, 1, 3, '#c4a868'); g.clearRect(0, 0, 1, 1); }
    if (i === n - 1) { rect(g, 13, 0, 3, 7, '#6a5430'); rect(g, 13, 0, 1, 7, '#e6d4a0'); rect(g, 15, 0, 1, 7, '#2e2212'); px(g, 14, 3, '#c4a868'); g.clearRect(15, 0, 1, 1); }
    return c; });
}
function rottenTile(i, n, x) {   /* a cracked dusty slab with gaps: it will go */
  return once('pr' + (i === 0 ? 'L' : i === n - 1 ? 'R' : 'M') + (x & 3), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    const col = ['#b8a070', '#9a8458', '#80693f', '#6a5432', '#4a3a22', '#2a2014'];
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) px(g, xx, yy, col[yy]);
    for (let k = 0; k < 4; k++) { const cx = (hash(wx0, k) % 14) + 1; for (let yy = 0; yy < 6; yy++) { const dx = cx + ((yy + k) % 3 === 0 ? 1 : 0); if (yy < 4 || hash(k, yy) % 2) px(g, dx, yy, '#1e160c'); } }
    for (let k = 0; k < 2; k++) { const gx = hash(wx0, k + 20) % 13 + 1; g.clearRect(gx, 3, 2, 3); px(g, gx, 2, '#4a3a22'); }
    for (let xx = 0; xx < 16; xx++) { if (hash(wx0 + xx, 8) % 4 === 0) px(g, xx, 0, '#d8c898'); if (hash(wx0 + xx, 9) % 6 === 0) { g.clearRect(xx, 5, 1, 1); } }
    for (let k = 0; k < 3; k++) px(g, hash(wx0, k + 40) % 16, 6, '#8a7448');   /* (dust sifting off) */
    if (i === 0) g.clearRect(0, 0, 1, 3); if (i === n - 1) g.clearRect(15, 2, 1, 4);
    return c; });
}
const FOOT = { balcony: balconyTile, awning: awningTile, pipe: pipeTile, beam: beamTile, lintel: lintelTile, drum: drumTile, rotten: rottenTile };

/* the SOLID footings: a glazed dome's drum, a minaret's banded shaft, a buried house's roof */
const GLAZE = ['#12444e', '#1c6672', '#2a8a98', '#4cb4bc', '#9ae4e4'];
function domeTile(i, n, x, y, top) {
  return once(['pdm', i === 0 ? 'L' : i === n - 1 ? 'R' : 'M', x & 3, y & 3, top ? 'T' : ''].join(''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy, r = Math.floor(wy / 5), off = (r & 1) * 4, sx = (wx + off) % 8, sy = wy - r * 5;
      let k = 2; const arc = sy * sy / 9 + Math.pow(sx - 3.5, 2) / 16; if (arc > 0.98) k = 0; else if (sy <= 1) k = 3; else if (sy === 0) k = 4;
      if (hash(wx >> 3, r) % 5 === 0) k = Math.max(1, k - 1); px(g, xx, yy, GLAZE[k]); }
    if (top) { rect(g, 0, 0, 16, 3, '#d8aa40'); rect(g, 0, 0, 16, 1, '#f8e08a'); rect(g, 0, 2, 16, 1, '#7a5a14'); for (let xx = 2; xx < 16; xx += 4) px(g, xx, 1, '#8a6a20'); }
    if (i === 0) for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, '#0a2a30'); px(g, 1, yy, GLAZE[0]); } if (i === n - 1) for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, GLAZE[4]); px(g, 14, yy, GLAZE[3]); }
    return c; });
}
function minaretTile(i, n, x, y, top) {
  return once(['pmn', x & 1, y & 7, i === 0 ? 'L' : i === n - 1 ? 'R' : 'M', top ? 'T' : ''].join(''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy; const band = Math.floor(wy / 8) & 1; let col;
      if (band) { const zz = Math.abs(((wx + wy) % 8) - 4); col = zz < 2 ? '#e8d4a4' : '#c4442c'; } else col = (wx % 4 < 2) ? GLAZE[2] : GLAZE[1];
      if ((wy & 7) === 0) col = '#d8aa40'; else if ((wy & 7) === 7) col = '#4a3410'; px(g, xx, yy, col); }
    if (top) { rect(g, 0, 0, 16, 4, '#6a4a1a'); rect(g, 0, 0, 16, 1, '#f0d070'); rect(g, 0, 3, 16, 1, '#2e1e08'); for (let xx = 1; xx < 16; xx += 3) px(g, xx, 1, '#a8802c'); }
    if (i === 0) for (let yy = 0; yy < 16; yy++) px(g, 0, yy, '#2a1a08'); if (i === n - 1) for (let yy = 0; yy < 16; yy++) px(g, 15, yy, '#f0d070');
    return c; });
}
function houseTile(dk, i, n, x, y, o) {
  return once(['phs', dk, x & 3, y & 3, i === 0 ? 'L' : i === n - 1 ? 'R' : 'M', o.top ? 'T' : '', o.vig ? 'V' : ''].join(''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16, d = DIST[dk] || DIST.quarter;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy, n2 = vn(wx, wy, 8); let col = n2 > 0.55 ? '#a8845a' : n2 > 0.3 ? '#92704a' : '#7a5a3c'; if ((wy & 7) === 7) col = '#4a3220'; else if (hash(wx, wy) % 13 === 0) col = '#5e422c'; px(g, xx, yy, col); }
    if (o.top) { /* the parapet: merlons along the roof's edge, a lit coping */
      for (let xx = 0; xx < 16; xx++) { const m = ((wx0 + xx) % 8) < 5; if (!m) { g.clearRect(xx, 0, 1, 3); px(g, xx, 3, '#d8bc86'); } else { px(g, xx, 0, '#e8d09a'); px(g, xx, 1, '#c4a672'); px(g, xx, 2, '#8a6a46'); } }
      for (let xx = 0; xx < 16; xx++) { px(g, xx, 4, '#d8bc86'); px(g, xx, 5, '#6a4a30'); } }
    if (o.vig) for (let k = 0; k < 2; k++) { const lx = 1 + k * 8; rect(g, lx, 2, 6, 5, '#2a1a10'); rect(g, lx + 1, 3, 4, 3, '#5a3a20'); rect(g, lx + 1, 3, 4, 1, '#8a5a30'); px(g, lx + 3, 4, '#c49a60'); }
    if (i === 0) for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, d.joint); px(g, 1, yy, '#5a3e26'); } if (i === n - 1) for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, '#c4a672'); px(g, 14, yy, '#a8845a'); }
    return c; });
}

/* ---------------------------------------------------------------- STAKES (SPIKE): iron-shod stakes in drifted sand and bone */
function stakeTile(x) {
  return once('sk' + (x % 4), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    rect(g, 0, 12, 16, 4, '#8a6a3c'); for (let xx = 0; xx < 16; xx++) { px(g, xx, 12, '#d8b472'); if (hash(wx0 + xx, 1) % 3) px(g, xx, 13, '#b08a50'); if (hash(wx0 + xx, 2) % 4 === 0) px(g, xx, 14, '#6a4c2c'); }
    const xs = [2, 6, 10, 14]; xs.forEach((sx, i) => { const top = 2 + hash(wx0 + i, 8) % 3, lean = i % 2 ? 1 : 0;
      for (let yy = top + 5; yy < 13; yy++) { px(g, sx, yy, '#6a4a2a'); px(g, sx - 1, yy, '#3e2a16'); if (yy % 4 === 0) px(g, sx, yy, '#8a6a3c'); }
      rect(g, sx - 1, top + 5, 3, 2, '#5a5a66'); px(g, sx - 1, top + 5, '#9a9aa8');   /* the iron collar */
      for (let k = 0; k < 5; k++) { const w = 4 - Math.floor(k * 0.8); rect(g, sx - (w >> 1) + (k > 2 ? lean : 0), top + k, w, 1, k < 2 ? '#e8e8f0' : '#b0b0bc'); }
      px(g, sx + (lean ? 1 : 0), top - 1 + 1, '#ffffff'); px(g, sx, top + 4, '#6a6a78'); });
    for (let k = 0; k < 2; k++) { const bx = 1 + (hash(wx0, k + 6) % 10); rect(g, bx, 12, 3, 1, '#f0e8d0'); px(g, bx, 11, '#d8cfae'); px(g, bx + 3, 12, '#d8cfae'); }   /* (a bone half buried) */
    return c; });
}

/* ---------------------------------------------------------------- the entry: which tile is this cell? */
export function bcTile(t, x, y, at, T, L) {
  const I = info(L, T), lit = lightAt(I, x, y), pl = I.plat.get(y * L.W + x);
  const open = v => v === T.AIR || v === T.ONEWAY || v === T.SPIKE || v === T.SOFT;
  if (t === T.SPIKE) return tint(stakeTile(x), lit);
  if (t === T.SOFT) return tint(sandTile(x, y, { up: !open(at(x, y)) ? false : false, depth: 4, aL: false, aR: false }), lit);
  if (t === T.ONEWAY) { const kind = pl ? pl.kind : 'balcony', f = FOOT[kind] || balconyTile, n = pl ? pl.n : 1, i = pl ? pl.i : 0; return tint(f(i, n, x), lit); }
  if (t !== T.SOLID) return null;
  const up = at(x, y - 1), dn = at(x, y + 1), lf = at(x - 1, y), rt = at(x + 1, y);
  const o = { up: up !== T.SOLID, aL: open(lf), aR: open(rt), aD: dn === T.AIR || dn === T.ONEWAY };
  let depth = 0; while (at(x, y - 1 - depth) === T.SOLID && depth < 40) depth++;
  let under = 0; while (at(x, y + 1 + under) === T.SOLID && under < 40) under++;
  /* THE SOLID FOOTINGS (a plat's own rows) */
  if (pl && (pl.kind === 'dome' || pl.kind === 'minaret' || pl.kind === 'house')) {
    if (pl.kind === 'dome') return tint(domeTile(pl.i, pl.n, x, y, pl.top), lit);
    if (pl.kind === 'minaret') return tint(minaretTile(pl.i, pl.n, x, y, pl.top), lit);
    return tint(houseTile(distOf(x), pl.i, pl.n, x, y, { top: pl.top, vig: !pl.top && at(x, y - 1) === T.SOLID && depth === 1 }), lit); }
  const dk = distOf(x);
  if (dk === 'sand' && !(x >= 27 && y >= 20 && !o.up && depth > 9)) { if (x < 27 || o.up || depth < 9 || y < 22) return tint(sandTile(x, y, { up: o.up, depth, aL: o.aL, aR: o.aR }), lit); }
  /* THE ROOF: the first run of solid rock from the top of a column, to the roof's row */
  const rb = I.roofBot[x];
  if (x >= 27 && y <= rb) return tint(roofTile(x, y, { gap: rb - y, aD: o.aD, aL: o.aL, aR: o.aR }), lit);
  if (x < 27) return tint(sandTile(x, y, { up: o.up, depth, aL: o.aL, aR: o.aR }), lit);
  /* THE DISTRICTS' MASONRY (rows far under the street are foundation) */
  const deep = !o.aL && !o.aR && depth > 6 && up === T.SOLID && at(x - 2, y) === T.SOLID;
  return tint(masonryTile(dk === 'sand' ? 'stair' : dk, x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD, depth, deep }), lit);
}
export const BC_TILES = { bcTile, DIST, distOf, SAND };
