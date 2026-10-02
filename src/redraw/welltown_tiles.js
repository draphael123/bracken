// welltown_tiles.js - THE WELL TOWN's OWN TILE KIT (claude/welltown3-art). A desert town reads as sandstone, mudbrick, whitewash, cloth and palm wood - never
// logs or crates. Made from px.js primitives; every tile 16x16, baked once and memoised.
//   wellTownTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it: slopes, spikes, anything not listed)
//   THE RULES (as the canal's and the theatre's kits): every standable edge carries a LIT LIP so it is found from across the street; a wall is darker than the floor on it.
//   WHAT A CELL IS is read from the grid and from L.interiors (never from a hard-coded column), so geometry added later is dressed with no change here:
//     - a SOLID cell with a room of kind wtCistern / wtQueen touching it is cool blue-grey cut stone (a floor with a lit lip, a darker vault, a wall, a pillar);
//       the rooms' bedrock a few cells out is the same stone, dimmer. A street slab with a cistern under it keeps its sandstone top over a vault underside.
//     - a SOLID cell in a TOWER (a column with lower ground on both sides: a house, a roof, a gatehouse, a pier) above that ground is a BUILDING: mudbrick walls
//       (whitewash patches, a faded blue shutter now and then), a flat mud roof with a parapet lip on top. West of the first house and from the Kasbah on, the
//       buildings are dressed sandstone (the outer wall, the gatehouse, the Kasbah's walls). Round a wtDovecote room the walls are pigeon-holed.
//     - the rest of the SOLID is the street and the bedrock: flagstones with a lit lip on top, sandstone courses going darker with depth.
//     - ONEWAY is a palm-wood board (a stone slab inside a cistern), NET is a rope-and-pole ladder.
//     - the street under a market awning carries the cloth's shadow in the desert violet (the shade is still the rect the level lists; this is the cloth's shadow on the ground).
import { canvas, px, rect, mulberry, shade as tint } from '../px.js';

export const WT = {
  hi: '#f8e8bc', top: '#ecce92', topD: '#cfa56c', face: '#d9b27a', face2: '#cca36c', mort: '#a67a4c', shd: '#8a6040', dk: '#6a4630', grain: '#b88a58', grainL: '#ecd09a',
  mud0: '#7a5436', mud1: '#8c6642', mud2: '#a67c52', mud3: '#bc9468', mudM: '#5e3a22', wash: '#eee2c6', washD: '#d2c3a2', blue: '#5a80a4', blueD: '#3c5c80',
  d0: '#ecd7aa', d1: '#dcc08c', d2: '#c6a672', dm: '#9c7a52', dd: '#7a5c3c',
  c0: '#1c2631', c1: '#2c3a48', c2: '#3c5062', c3: '#52687c', ch: '#9cb6c8', cw: '#223846', cm: '#3a645e', cmL: '#4e8076', cmort: '#161e28',
  p0: '#3e2e1e', p1: '#6c5238', p2: '#957a54', p3: '#c3a674', rope: '#e0d0a0', ropeD: '#a89868', violet: '#8a6a86',
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const dark = (c, k) => tint(c, -k);

// ================================ SANDSTONE: the street, the bedrock, the walls of the ground ================================
/* a street block: a lit lip (top), flagstone courses under it. l / r: a bare edge to the side. under: a cistern's vault under a slab. sh = [a, b) the awning's shadow columns */
function sandTop(v, l, r, under, sh) {
  return once('st' + v + l + r + under + (sh ? sh.join('_') : ''), () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 31 + 5); rect(g, 0, 0, 16, 16, WT.face);
    rect(g, 0, 0, 16, 1, WT.hi); rect(g, 0, 1, 16, 2, WT.top); rect(g, 0, 3, 16, 1, WT.topD);
    for (const [y0, h, off] of [[4, 4, v * 3 + 5], [9, 4, v * 3 + 1], [14, 2, v * 2 + 3]]) { rect(g, 0, y0 + h, 16, y0 === 14 ? 0 : 1, WT.mort);
      for (let bx = off % 8 - 8; bx < 16; bx += 8) { if (rr() < 0.5) rect(g, bx + 1, y0, 7, h, WT.face2); rect(g, bx, y0, 1, h, WT.mort); } }
    for (let i = 0; i < 9; i++) px2(g, (rr() * 16) | 0, 4 + ((rr() * 12) | 0), rr() < 0.5 ? WT.grain : WT.grainL);
    rect(g, 0, 3, 16, 1, WT.topD); if (v === 0) { px2(g, 5, 1, WT.topD); px2(g, 6, 1, WT.topD); } if (v === 2) px2(g, 11, 2, WT.mort);
    if (l) { rect(g, 0, 1, 1, 15, WT.shd); px2(g, 0, 0, WT.top); } if (r) { rect(g, 15, 1, 1, 15, WT.mort); px2(g, 15, 0, WT.top); }
    if (under) { rect(g, 0, 10, 16, 6, WT.c0); rect(g, 0, 10, 16, 1, WT.cmort); for (let x = (v * 5) % 8; x < 16; x += 8) rect(g, x, 11, 1, 5, WT.c1); rect(g, 0, 13, 16, 1, WT.c1); for (let x = 2 + v; x < 16; x += 6) { px2(g, x, 14, WT.cw); px2(g, x, 15, WT.ch); } }
    if (sh) { g.globalAlpha = 0.55; rect(g, sh[0], 0, sh[1] - sh[0], 5, WT.violet); g.globalAlpha = 0.3; rect(g, sh[0], 5, sh[1] - sh[0], 11, WT.violet); g.globalAlpha = 1; }
    return c; });
}
/* the courses under the street and the face of a cut: tier 0..3 = how deep (darker); l / r a bare face with a lit or shaded edge */
function sandFill(v, tier, l, r) {
  return once('sf' + v + tier + l + r, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 53 + tier), k = 0.1 * tier; rect(g, 0, 0, 16, 16, dark(WT.face, k));
    for (const [y0, off] of [[0, v * 3], [8, v * 3 + 4]]) { rect(g, 0, y0 + 7, 16, 1, dark(WT.mort, k));
      for (let bx = off % 8 - 8; bx < 16; bx += 8) { rect(g, bx + 1, y0, 7, 3, rr() < 0.4 ? dark(WT.face2, k) : dark(WT.face, k + 0.015)); rect(g, bx, y0, 1, 7, dark(WT.mort, k)); rect(g, bx + 1, y0, 7, 1, dark(WT.top, k)); } }
    for (let i = 0; i < 8; i++) px2(g, (rr() * 16) | 0, (rr() * 16) | 0, dark(WT.grain, k));
    if (l) { rect(g, 0, 0, 1, 16, dark(WT.shd, k)); } if (r) { rect(g, 15, 0, 1, 16, dark(WT.mort, k)); rect(g, 14, 0, 1, 16, dark(WT.hi, k + 0.06)); }
    return c; });
}
/* dressed ashlar (the outer wall, the gatehouse, the Kasbah): big pale blocks with lit chamfers; top = a capstone with a lit lip and its shadow line */
function dressed(v, l, r, top, soffit) {
  return once('dr' + v + l + r + top + soffit, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 71 + 3); rect(g, 0, 0, 16, 16, WT.d1);
    for (const [y0, off] of [[0, v * 5], [8, v * 5 + 8]]) { rect(g, 0, y0 + 7, 16, 1, WT.dm);
      for (let bx = off % 16 - 16; bx < 16; bx += 16) { rect(g, bx + 1, y0, 15, 7, rr() < 0.3 ? WT.d2 : WT.d1); rect(g, bx + 1, y0, 15, 1, WT.d0); rect(g, bx + 1, y0, 1, 7, WT.d0); rect(g, bx, y0, 1, 8, WT.dm); } }
    for (let i = 0; i < 6; i++) px2(g, (rr() * 16) | 0, (rr() * 16) | 0, WT.dm);
    if (top) { rect(g, 0, 0, 16, 1, WT.hi); rect(g, 0, 1, 16, 2, WT.d0); rect(g, 0, 3, 16, 1, WT.dm); rect(g, 0, 4, 16, 1, WT.d2); }
    if (l) rect(g, 0, 0, 1, 16, WT.dm); if (r) { rect(g, 15, 0, 1, 16, WT.dd); rect(g, 14, 0, 1, 16, WT.d0); }
    if (soffit) { rect(g, 0, 11, 16, 5, WT.dd); rect(g, 0, 11, 16, 1, WT.dm); for (let x = 1; x < 16; x += 5) rect(g, x, 12, 2, 4, WT.p1); rect(g, 0, 15, 16, 1, '#3e2e20'); }
    return c; });
}

// ================================ MUDBRICK: the houses ================================
/* a house wall: courses of mud brick (ochre, a few darker), plaster patches whitewashed in the sun, and now and then a faded blue shutter. roof = the flat mud roof's parapet lip. */
function mud(v, l, r, roof, soffit, accent) {
  return once('md' + v + l + r + roof + soffit + accent, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 97 + 11); rect(g, 0, 0, 16, 16, WT.mud2);
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 4 : 0; rect(g, 0, row * 4 + 3, 16, 1, WT.mudM);
      for (let bx = -8; bx < 16; bx += 8) { const t = rr(), x = bx + off; rect(g, x, row * 4, 1, 3, WT.mudM); rect(g, x + 1, row * 4, 7, 3, t < 0.22 ? WT.mud1 : t < 0.34 ? WT.mud3 : WT.mud2); rect(g, x + 1, row * 4, 7, 1, WT.mud3); } }
    if (v === 1) { const w = 6 + ((rr() * 5) | 0), h = 5 + ((rr() * 4) | 0), x0 = (rr() * (16 - w)) | 0, y0 = 4 + ((rr() * 5) | 0); rect(g, x0, y0, w, h, WT.wash); rect(g, x0, y0 + h - 1, w, 1, WT.washD);
      for (let i = 0; i < 5; i++) px2(g, x0 + ((rr() * w) | 0), y0 + ((rr() * h) | 0), WT.washD); px2(g, x0, y0, WT.mud2); px2(g, x0 + w - 1, y0 + h - 1, WT.mud2); }
    if (accent) { rect(g, 4, 4, 7, 9, WT.blueD); rect(g, 5, 5, 5, 7, WT.blue); rect(g, 7, 5, 1, 7, WT.blueD); rect(g, 4, 4, 7, 1, WT.wash); rect(g, 3, 13, 9, 1, WT.washD); px2(g, 9, 9, WT.wash); }
    if (roof) { rect(g, 0, 0, 16, 1, '#f4dca8'); rect(g, 0, 1, 16, 2, '#dcb070'); rect(g, 0, 3, 16, 1, WT.mud0); rect(g, 0, 4, 16, 1, WT.mud1); for (let x = (v * 2) % 5; x < 16; x += 5) px2(g, x, 2, '#c4965a'); }
    if (l) { rect(g, 0, roof ? 1 : 0, 1, 16, WT.mud0); if (roof) px2(g, 0, 0, '#dcb070'); } if (r) { rect(g, 15, roof ? 1 : 0, 1, 16, WT.mudM); rect(g, 14, roof ? 1 : 0, 1, 16, WT.mud3); }
    if (soffit) { rect(g, 0, 12, 16, 4, WT.mud0); rect(g, 0, 12, 16, 1, WT.mudM); for (let x = 2; x < 16; x += 5) rect(g, x, 13, 2, 3, WT.p1); rect(g, 0, 15, 16, 1, '#2a1a10'); }
    return c; });
}
/* the DOVECOTE's wall: mudbrick with pigeon-holes, each a dark niche with a ledge to land on; odd rows plain */
function pigeon(v, roof, l, r, holes) {
  return once('pg' + v + roof + l + r + holes, () => { const [c, g] = canvas(16, 16); g.drawImage(mud(v & 1 ? 0 : 2, l, r, roof, false, false), 0, 0);
    if (holes && !roof) for (const hy of [2, 9]) for (const hx of [l ? 4 : 2, 9]) { rect(g, hx, hy, 4, 4, '#2a1a10'); rect(g, hx, hy, 4, 1, '#120a06'); rect(g, hx - 1, hy + 4, 6, 1, WT.wash); rect(g, hx - 1, hy + 5, 6, 1, WT.washD); px2(g, hx + 1, hy + 2, '#8e8a96'); }
    return c; });
}
/* a beam or pier: a palm trunk hewn square, seen end-on: grain rings and a lit edge (wood where it belongs: beams) */
function beam(v) { return once('bm' + v, () => { const [c, g] = canvas(16, 16); rect(g, 2, 0, 12, 16, WT.p1); rect(g, 2, 0, 2, 16, WT.p3); rect(g, 12, 0, 2, 16, WT.p0); for (let y = 2 + v; y < 16; y += 5) rect(g, 4, y, 8, 1, WT.p0);
  rect(g, 0, 0, 16, 2, WT.p3); rect(g, 0, 2, 16, 1, WT.p0); rect(g, 6, 7, 4, 1, WT.ropeD); rect(g, 6, 8, 4, 1, WT.rope); rect(g, 6, 9, 4, 1, WT.ropeD); return c; }); }

// ================================ THE CISTERNS: cool blue-grey cut stone, wet ================================
/* role: floor (a room above: lit lip), vault (a room below: dark, arched courses, damp), wall (a room beside), bed (bedrock round the rooms, dimmer); dry = the boss's cistern hall (dust, no wet) */
function cistern(v, role, l, r, dry) {
  return once('ct' + v + role + l + r + dry, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 89 + role.length), base = role === 'vault' ? WT.c0 : role === 'bed' ? WT.c1 : role === 'floor' ? WT.c3 : WT.c2, hi = role === 'vault' ? WT.c2 : role === 'bed' ? WT.c2 : WT.c3;
    rect(g, 0, 0, 16, 16, base);
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 4 : 0; rect(g, 0, row * 4 + 3, 16, 1, WT.cmort);
      for (let bx = -8; bx < 16; bx += 8) { const x = bx + off, t = rr(); rect(g, x, row * 4, 1, 3, WT.cmort); rect(g, x + 1, row * 4, 7, 3, t < 0.25 ? hi : base); rect(g, x + 1, row * 4, 7, 1, role === 'vault' ? WT.c1 : hi); } }
    if (!dry && role !== 'bed') { for (let i = 0; i < 2 + (v & 1); i++) { const x = (rr() * 15) | 0, h = 4 + ((rr() * 9) | 0); for (let y = 0; y < h; y++) px2(g, x, y + (role === 'floor' ? 0 : 0), y < h - 1 ? WT.cw : WT.c1); }
      for (let i = 0; i < 2; i++) px2(g, (rr() * 16) | 0, 8 + ((rr() * 8) | 0), WT.c3); }
    if (dry) for (let i = 0; i < 7; i++) px2(g, (rr() * 16) | 0, (rr() * 16) | 0, WT.ch);
    if (role === 'floor') { rect(g, 0, 0, 16, 1, WT.ch); rect(g, 0, 1, 16, 2, WT.c3); rect(g, 0, 3, 16, 1, WT.c1); if (!dry) for (let x = (v * 3) % 5; x < 16; x += 5) px2(g, x, 1, '#6aa0c0'); }
    if (role === 'vault') { rect(g, 0, 12, 16, 4, WT.c0); rect(g, 0, 12, 16, 1, WT.c1); for (let x = 2 + v; x < 16; x += 7) { px2(g, x, 13, WT.cw); px2(g, x, 14, WT.cm); if (!dry) px2(g, x, 15, WT.ch); } }
    if (l) rect(g, 0, 0, 1, 16, WT.cmort); if (r) { rect(g, 15, 0, 1, 16, WT.cmort); rect(g, 14, 0, 1, 16, hi); }
    return c; });
}
/* a hung PILLAR: a fluted square column with a capital, in the cistern's stone */
function pillar(v, end) { return once('pl' + v + end, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, WT.c2); rect(g, 0, 0, 3, 16, WT.c3); rect(g, 13, 0, 3, 16, WT.c1); for (let x = 5; x < 12; x += 3) rect(g, x, 0, 1, 16, WT.c1); for (let y = 3 + v; y < 16; y += 8) rect(g, 0, y, 16, 1, WT.cmort);
  rect(g, 0, 0, 16, 2, WT.c1); if (end) { rect(g, 0, 11, 16, 5, WT.c3); rect(g, 0, 11, 16, 1, WT.ch); rect(g, 0, 15, 16, 1, WT.cmort); rect(g, 2, 12, 12, 1, WT.c2); } return c; }); }

// ================================ BOARDS AND LADDERS ================================
/* a palm-wood board: a few planks, a lit top, a dark underside, rope lashing at the ends; stone = a gallery slab in a cistern */
function board(l, r, v, stone) {
  return once('bd' + l + r + v + stone, () => { const [c, g] = canvas(16, 16);
    if (stone) { rect(g, 0, 0, 16, 6, WT.c2); rect(g, 0, 0, 16, 1, WT.ch); rect(g, 0, 1, 16, 1, WT.c3); rect(g, 0, 4, 16, 2, WT.c1); rect(g, 0, 6, 16, 1, WT.cmort); for (let x = 5 + v * 2; x < 16; x += 8) rect(g, x, 1, 1, 5, WT.cmort); px2(g, 3 + v, 5, WT.cw); if (l) rect(g, 0, 0, 1, 6, WT.cmort); if (r) rect(g, 15, 0, 1, 6, WT.cmort); return c; }
    rect(g, 0, 0, 16, 6, WT.p2); rect(g, 0, 0, 16, 1, '#e8d098'); rect(g, 0, 1, 16, 1, WT.p3); rect(g, 0, 3, 16, 1, WT.p1); rect(g, 0, 4, 16, 2, WT.p0); rect(g, 0, 6, 16, 1, '#2a1c10');
    for (let x = 4 + v * 2; x < 16; x += 8) rect(g, x, 1, 1, 3, WT.p0);
    if (l) { rect(g, 1, 0, 2, 6, WT.rope); rect(g, 1, 3, 2, 1, WT.ropeD); rect(g, 0, 1, 1, 4, WT.p0); } if (r) { rect(g, 13, 0, 2, 6, WT.rope); rect(g, 13, 3, 2, 1, WT.ropeD); rect(g, 15, 1, 1, 4, WT.p0); }
    return c; });
}
/* a rope-and-pole ladder: two palm poles, rungs lashed with rope (the rungs line up from cell to cell: they sit on rows 3 and 11) */
function ladder(v) {
  return once('ld' + v, () => { const [c, g] = canvas(16, 16);
    for (const x of [2, 12]) { rect(g, x - 1, 0, 4, 16, WT.p0); rect(g, x, 0, 2, 16, WT.p2); rect(g, x, 0, 1, 16, WT.p3); }
    for (const y of [3, 11]) { rect(g, 3, y, 10, 2, WT.rope); rect(g, 3, y + 1, 10, 1, WT.ropeD); rect(g, 3, y - 1, 10, 1, WT.p0); rect(g, 1, y - 1, 4, 3, WT.rope); rect(g, 1, y + 1, 4, 1, WT.ropeD); rect(g, 11, y - 1, 4, 3, WT.rope); rect(g, 11, y + 1, 4, 1, WT.ropeD); }
    return c; });
}
/* a swept clay floor inside a house: pale, a lit lip, a few scuffs */
function clay(v) { return once('cl' + v, () => { const [c, g] = canvas(16, 16), rr = mulberry(v + 41); rect(g, 0, 0, 16, 16, WT.mud3); rect(g, 0, 0, 16, 1, '#f4dca8'); rect(g, 0, 1, 16, 2, '#d8ac72'); rect(g, 0, 3, 16, 1, WT.mud1); for (let y = 4; y < 16; y += 4) rect(g, 0, y, 16, 1, WT.mud1); for (let i = 0; i < 8; i++) px2(g, (rr() * 16) | 0, 4 + ((rr() * 12) | 0), WT.mud2); return c; }); }

// ================================ READING THE LEVEL (once per level) ================================
const INFO = new WeakMap();
const isSl = t => t >= 20 && t <= 25;
function info(L, at, T) {
  let I = INFO.get(L); if (I && I.grid === L.grid) return I;
  const W = L.W, H = L.H, top = new Int16Array(W).fill(H), solid = t => t === T.SOLID || isSl(t);
  for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (solid(at(x, y))) { top[x] = y; break; }
  const rooms = (L.interiors || []).map(r => ({ x0: r[0], x1: r[1], y0: r[2], y1: r[3], k: r[4] || '' }));
  /* a hole down into a room (a ladder shaft into a cistern) is not the lie of the ground: the column's top is the street over it */
  for (let x = 0; x < W; x++) { const rm = rooms.find(q => x >= q.x0 - 1 && x <= q.x1 + 1 && top[x] >= q.y0 - 1 && top[x] <= q.y1 + 1); if (rm) top[x] = Math.min(top[x], rm.y0 - 1); }
  /* a TOWER column: lower, WIDE (three columns or more: a street, an alley, not a shaft) ground within 30 on BOTH sides; the cells above that ground are a building */
  const thick = x => { let n = 0; for (let y = top[x]; y < H && solid(at(x, y)); y++) n++; return n; };   /* how thick the mass is under its top (a roof slab is one or two rows) */
  const pw = x => { let n = 1; for (let k = x - 1; k >= 0 && Math.abs(top[k] - top[x]) <= 1; k--) n++; for (let k = x + 1; k < W && Math.abs(top[k] - top[x]) <= 1; k++) n++; return n; };   /* the width of the plateau it tops */
  const gr = new Int16Array(W).fill(-1), wide = c => { let n = 0; for (let k = c - 2; k <= c + 2; k++) if (k >= 0 && k < W && top[k] >= top[c] - 1) n++; return n >= 3; };
  for (let x = 0; x < W; x++) { let lo = -1, ro = -1; for (let d = 1; d <= 30; d++) { if (x - d >= 0 && top[x - d] >= top[x] + 2 && wide(x - d)) lo = Math.max(lo, top[x - d]); if (x + d < W && top[x + d] >= top[x] + 2 && wide(x + d)) ro = Math.max(ro, top[x + d]); }
    if (lo >= 0 && ro >= 0 && Math.max(lo, ro) >= top[x] + 5 && (pw(x) <= 24 || thick(x) <= 3)) gr[x] = Math.max(lo, ro); }   /* (and it stands at least five rows over the street on one side: a plateau is ground, not a house) */
  const wet = rooms.filter(r => r.k === 'wtCistern'), dryR = rooms.filter(r => r.k === 'wtQueen'), cist = wet.concat(dryR), dove = rooms.filter(r => r.k === 'wtDovecote'), houses = rooms.filter(r => r.k === 'wtHouse');
  const sec = L.sections || {}, kasbah = sec['THE KASBAH'] != null ? sec['THE KASBAH'] : 426, market = sec['THE LOWER MARKET'] != null ? sec['THE LOWER MARKET'] : 64;
  const awns = (L.ents || []).filter(e => e.t === 'deco' && (e.kind === 'awning' || e.kind === 'awningTorn')).map(e => { const left = e.x * 16 + 8 - 26; return { row: e.y + 1, a: left + 3, b: left + 49 }; });
  I = { grid: L.grid, top, gr, cist, dryR, dove, houses, kasbah, west: Math.min(44, market), awns }; INFO.set(L, I); return I;
}
const run = (at, x, y, T) => { let n = 1; for (let k = 1; k <= 4 && at(x, y - k) === T.SOLID; k++) n++; for (let k = 1; k <= 4 && at(x, y + k) === T.SOLID; k++) n++; return n; };
const inR = (rs, x, y) => rs.find(r => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);

// ================================ THE HOOK ================================
export function wellTownTile(t, x, y, at, T, L) {
  if (t !== T.SOLID && t !== T.ONEWAY && t !== T.NET) return null;
  const I = info(L, at, T), v = ((x * 7 + y * 13) % 4 + 4) % 4;
  if (t === T.NET) return ladder(v & 1);
  if (t === T.ONEWAY) { const room = inR(I.cist, x, y), sameRow = k => at(x + k, y) === t; return board(!sameRow(-1), !sameRow(1), v & 1, !!room); }
  /* ---- SOLID ---- */
  const up = at(x, y - 1), dn = at(x, y + 1), lf = at(x - 1, y), rt = at(x + 1, y), solidT = q => q === T.SOLID || isSl(q) || q === T.CRATE;
  const l = !solidT(lf) && !isSl(lf), r = !solidT(rt) && !isSl(rt), topExp = !solidT(up), under = !solidT(dn);
  /* the cisterns: a room of kind wtCistern / wtQueen touching this cell */
  const rU = inR(I.cist, x, y - 1), rD = inR(I.cist, x, y + 1), rL = inR(I.cist, x - 1, y), rR = inR(I.cist, x + 1, y);
  const dry = !!(inR(I.dryR, x, y - 1) || inR(I.dryR, x, y + 1) || inR(I.dryR, x - 1, y) || inR(I.dryR, x + 1, y));
  if (inR(I.cist, x, y)) return pillar(v & 1, under);                                 /* a pillar hung from the vault, standing in the hall's own box */
  if (topExp && rD && !rU) return sandTop(v, l, r, true, shadeAt(I, x, y));          /* a street slab over a vault */
  if (rU) return cistern(v, 'floor', l, r, dry);
  if (rD) return cistern(v, 'vault', l, r, dry);
  if (rL || rR) return cistern(v, 'wall', l, r, dry);
  /* the cistern's bedrock, a few cells out: the same stone, dimmer */
  for (const rm of I.cist) if (x >= rm.x0 - 4 && x <= rm.x1 + 4 && y >= rm.y0 - 2 && y <= rm.y1 + 4 && !(topExp && y < rm.y0)) return cistern(v, 'bed', l, r, rm.k === 'wtQueen');
  /* the dovecote's walls: pigeon-holed mudbrick */
  { const d = I.dove.find(q => x >= q.x0 - 1 && x <= q.x1 + 1 && y >= q.y0 - 1 && y <= q.y1 + 1); if (d) return pigeon(v, topExp, l, r, y > d.y0 + 1 && y < d.y1 - 2); }
  /* the little mud house at the gate: its walls and roof (the room's ring above the floor) are mudbrick whatever the columns say */
  { const hz = I.houses.find(q => x >= q.x0 - 1 && x <= q.x1 + 1 && y >= q.y0 - 1 && y <= q.y1); if (hz) return mud(v, l, r, topExp, false, false); }
  /* a BUILDING: a tower column's cells above its ground */
  if (I.gr[x] >= 0 && y < I.gr[x]) {
    if (l && r && !topExp && run(at, x, y, T) <= 3) return beam(v & 1);                                       /* a thin pier or hung beam: palm timber */
    if (x < I.west || x >= I.kasbah) return dressed(v, l, r, topExp, under && !rD);
    const accent = !topExp && (((x * 37 + y * 101) % 23) === 0);
    return mud(v, l, r, topExp, under, accent);
  }
  /* a house's floor: swept clay */
  if (topExp && inR(I.houses, x, y - 1)) return clay(v & 1);
  /* the street and the bedrock */
  if (topExp) return sandTop(v, l, r, false, shadeAt(I, x, y));
  let d = 0; for (let k = 1; k <= 12; k++) { if (!solidT(at(x, y - k))) break; d++; }
  return sandFill(v, Math.min(3, (d + 1) >> 1), l, r);
}
/* the cloth's shadow on the street: the columns of this tile inside an awning's span (the awning sprite's own span, 3..49 px of its 52) */
function shadeAt(I, x, y) {
  for (const a of I.awns) if (a.row === y) { const x0 = x * 16, x1 = x0 + 16; if (a.b > x0 && a.a < x1) return [Math.max(0, a.a - x0), Math.min(16, a.b - x0)]; }
  return null;
}
