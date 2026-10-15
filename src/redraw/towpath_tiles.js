// towpath_tiles.js - THE TOWPATH's TILE KIT (claude/towpath2art). The river road by night: cold blue-green wet stone under a moon, a pale lit lip on every edge you can
// stand on (found from across a fog bank), moss and turf on the upper banks, black-green lock walls with a weed line at every level a lock stands at, grey drowned
// timber for boards, riveted iron for the aqueduct's trough and the gantries, soot-dark brick for the mill and the warehouses, the old gate irons in the last lock.
// Made from px.js primitives, each tile 16x16, baked once and memoised. Pure drawing.
//   towpathTile(t, x, y, at, T, L) -> a canvas for one cell (or null: the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';

export const TC = {
  s0: '#141c20', s1: '#1e2a2e', s2: '#2a3a3e', s3: '#3a4e50', s4: '#56706e', lip: '#a6c4be', lip2: '#7ea09a', mort: '#0e1416',
  wet: '#1c3640', wetL: '#2e5660', moss0: '#1c3a2c', moss1: '#2e5a40', moss2: '#4a8a5c', moss3: '#7cb878',
  turf0: '#16281e', turf1: '#223c2c', turf2: '#325a3c', turf3: '#4a7e4e', soil0: '#1a1c1a', soil1: '#262a26', soil2: '#343830',
  brick0: '#181a1e', brick1: '#22262a', brick2: '#2e3436', brick3: '#3e4644', soot: '#0e1012',
  wood0: '#161614', wood1: '#24261f', wood2: '#363a30', wood3: '#4e5446', wood4: '#7a8268',
  iron0: '#1a1e22', iron1: '#2c3238', iron2: '#4a545c', iron3: '#7a8892', rust0: '#3a2216', rust1: '#5c3420', rust2: '#8a5030',
  gate0: '#0e1214', gate1: '#1a2024',
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const p2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const O = 9;   /* (src/towpath.js O: design rows are laid O rows lower) */

/* a wet stone block wall: coursed ashlar, cool, with a wet sheen on some and the moon's pale on a few */
function ashlar(v, deep, dry) {
  return once('ash' + v + deep + dry, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 131 + 7); rect(g, 0, 0, 16, 16, TC.mort);
    for (let row = 0; row < 2; row++) { let x = (row & 1) * -5 - v; while (x < 16) { const w = 7 + ((r() * 4) | 0), t = r(); rect(g, x + 1, row * 8 + 1, w - 1, 6, t < 0.18 ? TC.s3 : t < 0.5 ? TC.s2 : TC.s1);
      rect(g, x + 1, row * 8 + 1, w - 1, 1, t < 0.3 ? TC.s3 : TC.s2); rect(g, x + 1, row * 8 + 6, w - 1, 1, TC.s0); if (t > 0.85 && !dry) rect(g, x + 2, row * 8 + 3, 2, 1, TC.wetL); x += w; } }
    if (deep) { g.globalAlpha = 0.34; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; } return c; });
}
/* rubble: the dark heart of a wall */
function rubble(v) { return once('rub' + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 53 + 1); rect(g, 0, 0, 16, 16, TC.s0);
  for (let row = 0; row < 2; row++) { let x = (row & 1) * -4; while (x < 16) { const w = 6 + ((r() * 5) | 0); rect(g, x + 1, row * 8 + 1, w - 1, 6, r() < 0.3 ? TC.s2 : TC.s1); rect(g, x + 1, row * 8 + 1, w - 1, 1, TC.s2); x += w; } }
  g.globalAlpha = 0.28; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; return c; }); }
/* a quay's coping: a flagstone with a lit moonlit lip, a dark shadow line under, moss in the joints */
function coping(v, l, r) {
  return once('cop' + v + l + r, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 17 + 3); rect(g, 0, 0, 16, 16, TC.s1);
    rect(g, 0, 0, 16, 5, TC.s2); rect(g, 0, 0, 16, 1, TC.lip); rect(g, 0, 1, 16, 1, TC.lip2); rect(g, 0, 5, 16, 1, TC.s0);
    rect(g, v * 5 + 3, 1, 1, 4, TC.s1); for (let i = 0; i < 4; i++) p2(g, (rr() * 16) | 0, 2 + ((rr() * 3) | 0), TC.s3);
    for (let i = 0; i < 3; i++) { const x = (rr() * 14) | 0; p2(g, x, 1, TC.moss1); p2(g, x + 1, 1, TC.moss2); }
    for (let y = 6; y < 16; y++) for (let x = 0; x < 16; x++) { const t = (x * 7 + y * 13 + v) % 9; p2(g, x, y, t === 0 ? TC.s3 : t < 3 ? TC.s2 : TC.s1); }
    for (let x = 0; x < 16; x += 8) rect(g, x + (v & 1) * 3, 6, 1, 10, TC.mort); rect(g, 0, 11, 16, 1, TC.mort);
    if (l) rect(g, 0, 0, 1, 16, TC.mort); if (r) rect(g, 15, 0, 1, 16, TC.mort); return c; });
}
/* the upper banks' turf: a grassy lip, the moon on it, soil under with stones */
function turf(v, l, r) {
  return once('turf' + v + l + r, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 29 + 5); rect(g, 0, 0, 16, 16, TC.soil1);
    for (let y = 5; y < 16; y++) for (let x = 0; x < 16; x++) { const t = (x * 5 + y * 11 + v * 3) % 8; p2(g, x, y, t === 0 ? TC.soil2 : t === 1 ? TC.soil0 : TC.soil1); }
    rect(g, 0, 0, 16, 4, TC.turf1); rect(g, 0, 0, 16, 2, TC.turf2); rect(g, 0, 0, 16, 1, TC.turf3);
    for (let x = 0; x < 16; x++) { const h = 1 + ((x * 7 + v * 5) % 4 === 0 ? 2 : 0) + (rr() < 0.3 ? 1 : 0); rect(g, x, 4, 1, 1, TC.turf1); if (h > 2) p2(g, x, 4 - h + 3, TC.turf3); }
    for (let x = 0; x < 16; x += 3 + (v & 1)) { p2(g, x, 4, TC.turf0); p2(g, x + 1, 5, TC.turf0); }
    for (let i = 0; i < 3; i++) { const x = (rr() * 14) | 0, y = 8 + ((rr() * 6) | 0); rect(g, x, y, 2, 1, TC.s3); p2(g, x, y + 1, TC.s1); }
    if (l) { rect(g, 0, 0, 1, 5, TC.turf0); } if (r) { rect(g, 15, 0, 1, 5, TC.turf0); } return c; });
}
/* the wet line on a lock wall: a band of weed at every level a lock can stand at, and the stain below it */
function waterline(v, deep) {
  return once('wl' + v + deep, () => { const [c, g] = canvas(16, 16); g.drawImage(ashlar(v, deep, false), 0, 0);
    rect(g, 0, 3, 16, 2, TC.moss0); rect(g, 0, 4, 16, 1, TC.moss1); for (let x = (v * 3) % 4; x < 16; x += 4) { p2(g, x, 5, TC.moss1); p2(g, x + 1, 6, TC.moss0); p2(g, x, 3, TC.moss2); }
    g.globalAlpha = 0.4; rect(g, 0, 5, 16, 11, TC.wet); g.globalAlpha = 1; return c; });
}
/* a lock gate leaf: black tarred oak planks, iron straps, a pale painted top (the balance beam's end), weed at its foot */
function gateLeaf(top, v, foot) {
  return once('gt' + top + v + foot, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, TC.gate0);
    for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 1, 16, '#080a0c'); rect(g, x + 1, 0, 2, 16, TC.gate1); rect(g, x + 3, 0, 1, 16, '#222a2e'); }
    if (v === 0) { rect(g, 0, 4, 16, 2, TC.iron1); rect(g, 0, 4, 16, 1, TC.iron2); for (let x = 2; x < 16; x += 6) p2(g, x, 5, TC.iron3); }
    if (v === 1) for (let y = 10; y < 16; y++) for (let x = (y * 3) % 4; x < 16; x += 4) p2(g, x, y, TC.moss1);
    if (foot) for (let x = 0; x < 16; x += 2) { p2(g, x, 15, TC.moss2); p2(g, x + 1, 14, TC.moss1); }
    if (top) { rect(g, 0, 0, 16, 5, '#b8c4c0'); rect(g, 0, 4, 16, 1, '#7a8a86'); rect(g, 0, 0, 16, 1, '#e8f0ee'); }
    return c; });
}
/* weathered timber boards: the willow's limb, the gibbet's platform, the hay rick, the gantry - grey drowned oak, a pale top, plank joints, iron nails */
function boards(l, r, v) {
  return once('bd' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 7, TC.wood3); rect(g, 0, 0, 16, 1, TC.wood4); rect(g, 0, 1, 16, 1, '#5e664e'); rect(g, 0, 5, 16, 2, TC.wood1); rect(g, 0, 7, 16, 1, '#080a08');
    rect(g, 4 + (v & 1) * 5, 2, 1, 3, TC.wood1); rect(g, 12, 2, 1, 3, TC.wood1); p2(g, 2, 3, TC.iron3); p2(g, 8, 3, TC.iron3); p2(g, 14, 3, TC.iron3);
    for (let i = 0; i < 3; i++) p2(g, (v * 5 + i * 5 + 1) % 16, 2 + (i & 1), TC.wood2);
    if (l) { rect(g, 0, 1, 2, 6, TC.wood4); } if (r) { rect(g, 14, 1, 2, 6, TC.wood4); }
    rect(g, 3, 8, 2, 3, TC.wood0); rect(g, 11, 8, 2, 3, TC.wood0); return c; });   /* (the knee brackets under) */
}
/* a gantry beam / swing-bridge deck: a riveted iron-banded timber on a lattice */
function beamDeck(l, r) {
  return once('bm' + l + r, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 4, TC.iron1); rect(g, 0, 0, 16, 1, TC.iron3); rect(g, 0, 1, 16, 1, TC.iron2); for (let x = 1; x < 16; x += 3) p2(g, x, 2, TC.iron3);
    rect(g, 0, 4, 16, 1, '#080a0c'); rect(g, 0, 5, 16, 1, TC.iron1); rect(g, 0, 9, 16, 1, TC.iron1);
    for (let x = 0; x < 16; x += 6) for (let k = 0; k < 4; k++) { p2(g, x + k, 5 + k, TC.iron1); p2(g, x + 5 - k, 5 + k, TC.iron1); }
    if (l) rect(g, 0, 0, 2, 10, TC.iron0); if (r) rect(g, 14, 0, 2, 10, TC.iron0); return c; });
}
/* the aqueduct's trough: riveted cast-iron plate, red with rust where it has sagged, a flanged lip you can stand on */
function ironTop(l, r, v) {
  return once('it' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, TC.iron1); rect(g, 0, 0, 16, 3, TC.iron2); rect(g, 0, 0, 16, 1, TC.iron3); rect(g, 0, 3, 16, 1, TC.iron0);
    for (let x = 2; x < 16; x += 4) p2(g, x, 1, '#b8c4cc'); for (let y = 5; y < 16; y += 5) rect(g, 0, y, 16, 1, TC.iron0);
    for (let i = 0; i < 4; i++) { const x = (v * 5 + i * 5) % 16, y = 5 + ((i * 3 + v) % 10); rect(g, x, y, 3, 2, i & 1 ? TC.rust1 : TC.rust0); p2(g, x + 1, y, TC.rust2); }
    if (l) rect(g, 0, 0, 1, 16, TC.iron0); if (r) rect(g, 15, 0, 1, 16, TC.iron0); return c; });
}
function ironBody(v) {
  return once('ib' + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, TC.iron1);
    for (let y = 0; y < 16; y += 8) { rect(g, 0, y, 16, 1, TC.iron0); rect(g, 0, y + 1, 16, 1, TC.iron2); for (let x = 2 + v; x < 16; x += 5) p2(g, x, y + 3, '#9aa6ae'); }
    rect(g, 7 + v, 0, 1, 16, TC.iron0); for (let i = 0; i < 3; i++) { const x = (v * 7 + i * 6) % 15, y = (i * 5 + v * 3) % 13; rect(g, x, y, 2, 3, TC.rust0); p2(g, x, y, TC.rust1); }
    return c; });
}
/* a pier / arch pillar of the ruined aqueduct: big cut ashlar, cracked, ivy and a broken lit top */
function pier(v, top, l, r) {
  return once('pi' + v + top + l + r, () => { const [c, g] = canvas(16, 16); g.drawImage(ashlar(v, 0, true), 0, 0);
    for (let i = 0; i < 2; i++) { const x = (v * 5 + i * 7) % 14; for (let k = 0; k < 7; k++) p2(g, x + (k % 3 === 2 ? 1 : 0), 2 + k * 2, '#0a0e10'); }   /* a crack */
    for (let i = 0; i < 3; i++) { const x = (v * 3 + i * 5) % 15; for (let k = 0; k < 5 + i * 2; k++) p2(g, x, k, k < 4 + i * 2 ? TC.moss1 : TC.moss2); }   /* ivy hanging */
    if (top) { rect(g, 0, 0, 16, 5, TC.s3); rect(g, 0, 0, 16, 1, TC.lip); rect(g, 0, 1, 16, 1, TC.lip2); rect(g, 0, 4, 16, 1, TC.s0);
      for (let x = (v * 3) % 5; x < 16; x += 5) { p2(g, x, 0, TC.s1); p2(g, x + 1, 1, TC.s1); } for (let x = 1; x < 16; x += 4) p2(g, x, 2, TC.moss2); }   /* (a broken, uneven, mossy lit top) */
    if (l) rect(g, 0, top ? 0 : 0, 1, 16, TC.mort); if (r) rect(g, 15, 0, 1, 16, TC.mort); return c; });
}
/* soot-dark brick (the mill, the warehouses, the cottage) with a few lit courses and a lit cornice on the top */
function brick(v, deep, top) {
  return once('br' + v + deep + top, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 71 + 9); rect(g, 0, 0, 16, 16, TC.soot);
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 4 : 0; for (let bx = -8; bx < 16; bx += 8) { const x = bx + off, t = r(); rect(g, x + 1, row * 4 + 1, 7, 3, t < 0.2 ? TC.brick3 : t < 0.4 ? TC.brick1 : TC.brick2);
      rect(g, x + 1, row * 4 + 1, 7, 1, t < 0.3 ? TC.brick3 : TC.brick2); } }
    if (deep) { g.globalAlpha = 0.34; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; }
    if (top) { rect(g, 0, 0, 16, 4, TC.s2); rect(g, 0, 0, 16, 1, TC.lip); rect(g, 0, 1, 16, 1, TC.lip2); rect(g, 0, 4, 16, 1, TC.s0); }
    return c; });
}
/* a slate roof course: overlapped slates with the moon's lit edge (the cottage, the hut, the tower's roof, the warehouses') */
function slate(v, top) {
  return once('sl' + v + top, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, '#1c2428');
    for (let row = 0; row < 4; row++) { const off = (row & 1) * 4; for (let x = -4; x < 16; x += 8) { rect(g, x + off, row * 4, 8, 4, row % 2 ? '#26343a' : '#2c3c42'); rect(g, x + off, row * 4, 8, 1, '#4a6468'); rect(g, x + off + 7, row * 4, 1, 4, '#10181a'); } }
    if (top) { rect(g, 0, 0, 16, 3, '#3a4e54'); rect(g, 0, 0, 16, 1, TC.lip); rect(g, 0, 3, 16, 1, '#0c1214'); } return c; });
}
/* a TIMBER-SHINGLE roof course (the lock-keeper's hut: not brick, not slate): split oak shingles in staggered rows, each with a ragged tail, silvered and moss-stained, the moon on their upper edges; top = the ridge course (a capped ridge beam) */
function shingle(v, top) {
  return once('shg' + v + top, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 53 + 5); rect(g, 0, 0, 16, 16, '#100d0a');
    const cols = ['#4a3a2a', '#3c2e22', '#54432f', '#32271d', '#463626'];
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 2 : 0; for (let x = -2; x < 16; x += 4) { const t = r(), col = cols[Math.floor(t * cols.length)], y0 = row * 4, bx = x + off, tail = (t * 7 | 0) % 3;
      rect(g, bx, y0, 4, 4, col); rect(g, bx, y0, 4, 1, '#7a6a52'); rect(g, bx + 3, y0, 1, 4, '#16110c'); rect(g, bx, y0 + 3, 4, 1, '#120e0a');
      if (tail === 0) rect(g, bx, y0 + 3, 1, 1, '#100d0a'); if (tail === 1) rect(g, bx + 2, y0 + 3, 2, 1, '#100d0a');
      rect(g, bx + 1, y0 + 1, 1, 2, 'rgba(0,0,0,0.25)'); if (t > 0.82) { rect(g, bx, y0 + 1, 3, 2, '#3a5a3a'); p2(g, bx + 1, y0 + 1, '#5a8a52'); } } }
    if (top) { rect(g, 0, 0, 16, 4, '#2a2018'); rect(g, 0, 0, 16, 1, '#8a7a60'); rect(g, 0, 1, 16, 1, '#5a4a38'); rect(g, 0, 3, 16, 1, '#0c0a08'); for (let x = 2; x < 16; x += 5) p2(g, x, 2, '#8a8a90'); }
    return c; });
}
/* iron stakes: the old gate irons, rusted, their points the only pale thing - drawn dark, they are found only in a light */
function irons(v) {
  return once('irn' + v, () => { const [c, g] = canvas(16, 16);
    for (const x of [1, 6, 11]) { const h = 9 + ((x + v) % 3) * 2; rect(g, x, 16 - h, 3, h, TC.rust0); rect(g, x, 16 - h, 1, h, TC.rust1); rect(g, x + 1, 16 - h, 1, h - 6, '#4a2c1c');
      p2(g, x + 1, 16 - h - 1, TC.iron3); p2(g, x + 1, 16 - h - 2, '#c8d4dc'); rect(g, x - 1, 13, 5, 1, TC.iron0); p2(g, x + 1, 13 - 5, TC.rust2); }
    rect(g, 0, 14, 16, 2, TC.iron0); rect(g, 0, 14, 16, 1, TC.rust0); return c; });
}
/* a ladder: two iron-shod stiles and rope rungs (the keeper's ladders) */
function ladder(v) {
  return once('lad' + v, () => { const [c, g] = canvas(16, 16); rect(g, 2, 0, 2, 16, TC.wood2); rect(g, 12, 0, 2, 16, TC.wood2); rect(g, 2, 0, 1, 16, TC.wood4); rect(g, 12, 0, 1, 16, TC.wood4);
    for (let y = 2; y < 16; y += 5) { rect(g, 4, y, 8, 1, '#6a7258'); rect(g, 4, y + 1, 8, 1, TC.wood0); } for (const y of [1, 9]) { p2(g, 1, y, TC.iron2); p2(g, 14, y, TC.iron2); } return c; });
}

/* a sunken barge's mast: a tarred pole with lashed ratlines either side - the climb (the tile above the top is the crosstree's: src/redraw/towpath_gear2.js) */
function mastTile(v, topEnd) {
  return once('mast' + v + topEnd, () => { const [c, g] = canvas(16, 16); rect(g, 6, 0, 4, 16, '#161410'); rect(g, 6, 0, 1, 16, '#4a4a38'); rect(g, 9, 0, 1, 16, '#0a0806');
    rect(g, 2, 0, 1, 16, '#2a2a22'); rect(g, 13, 0, 1, 16, '#2a2a22'); for (let y = 2; y < 16; y += 5) { rect(g, 2, y, 12, 1, '#6a6650'); rect(g, 2, y + 1, 12, 1, '#12100c'); }
    for (let i = 0; i < 3; i++) p2(g, 6 + (i & 1), (v * 3 + i * 5) % 16, TC.moss1); if (topEnd) { rect(g, 4, 0, 8, 2, '#161410'); rect(g, 4, 0, 8, 1, '#4a4a38'); } return c; });
}
/* THE ZONES (design columns; rows are design rows + O): where each material is, so every structure reads as its own thing */
const Z = {
  hut: [39, 44, 34, 35], cottage: [67, 75, 29, 31], mill: [109, 125, 11, 26], tower: [218, 227, -8, 4], warehouses: [372, 390, 3, 40], arenaWall: [441, 500, -8, 60],
  aqueduct: [236, 289, 6, 8], aqPiers: [236, 289, 9, 60], arches: [292, 319, 8, 60], lastLock: [391, 441, 13, 60],
};
const inZ = (z, x, y) => x >= z[0] && x <= z[1] && y - O >= z[2] && y - O <= z[3];

export function towpathTile(t, x, y, at, T, L) {
  const D = L.towpath; if (!D) return null;
  const air = (dx, dy) => at(x + dx, y + dy) === T.AIR, v = ((x * 7 + y * 13) % 3 + 3) % 3;
  const dy = y - O;
  if (t === T.SPIKE) return irons(v);
  if (t === T.NET) return (x === 353 || x === 358) ? mastTile(v, at(x, y - 1) !== T.NET) : ladder(v);
  if (t === T.ONEWAY) {
    const br = (D.bridges || []).find(b => b.row === y && x >= b.x0 && x <= b.x1); if (br) return beamDeck(x === br.x0, x === br.x1);
    const sameRow = k => at(x + k, y) === t, L0 = !sameRow(-1), R0 = !sameRow(1);
    if (x >= 236 && x <= 290 && dy <= 3) return beamDeck(L0, R0);   /* the sluice gantries */
    return boards(L0, R0, v);
  }
  if (t !== T.SOLID) return null;
  const top = air(0, -1), l = air(-1, 0), r = air(1, 0), bl = air(0, 1), face = l || r || bl;
  /* the gates (a lock's lower gate: solid while shut) */
  const gk = (D.locks || []).find(q => q.gate && q.gate.x === x && y >= q.gate.top && y <= q.gate.bot); if (gk) return gateLeaf(y === gk.gate.top, (y + x) % 3 === 0 ? 1 : 0, y === gk.gate.bot);
  /* the aqueduct: an iron trough on arches */
  if (inZ(Z.aqueduct, x, y)) return dy === 6 ? ironTop(l, r, v) : ironBody(v);
  /* the mill, the cottage, the hut, the tower, the warehouses: brick under slate */
  if (inZ(Z.hut, x, y)) return shingle(v, top);
  if (inZ(Z.cottage, x, y) || inZ(Z.tower, x, y) && (dy === -8 || dy === -9)) { if (top) return slate(v, true); return slate(v, false); }
  if (inZ(Z.mill, x, y)) { if (dy === 11 && top) return slate(v, true); if (dy === 11) return slate(v, false); return brick(v, 0, top); }
  if (inZ(Z.tower, x, y)) return ashlar(v, 0, true);
  if (x >= 372 && x <= 390 && dy >= 3 && dy <= 40 && (x <= 379 || x >= 383)) return brick(v, dy > 20 ? 1 : 0, top);
  /* the broken arches' piers (and the aqueduct's, into the river) */
  if ((x >= 240 && x <= 289 && dy >= 9) || (x >= 292 && x <= 319 && dy >= 8)) { const isTop = top; return pier(v, isTop, l, r); }
  if (top) { const turfBank = (x <= 99 && !(x >= 39 && x <= 55)) || (x >= 109 && x <= 130) || (x >= 139 && x <= 165) || (x >= 173 && x <= 235 && !(x >= 166 && x <= 182)); return turfBank && !(x >= 100 && x <= 108) && !((D.locks || []).some(q => x >= q.x0 - 1 && x <= q.x1 + 1)) ? turf(v, l, r) : coping(v, l, r); }
  let depth = 0; for (let k = 1; k <= 6; k++) { if (at(x, y - k) === T.AIR) break; depth++; }
  const lvl = (D.locks || []).some(q => (y === q.lo || y === q.hi) && x >= q.x0 - 1 && x <= q.x1 + 1);
  if (lvl && face) return waterline(v, 0);
  if (depth >= 3 && !face) return rubble(v);
  if (x >= 391 && x <= 441 && dy >= 13) return ashlar(v, depth >= 4 ? 1 : 0, false);
  return ashlar(v, depth >= 4 ? 1 : 0, false);
}
export { pier as bakePierTile, irons as bakeIronsTile };
