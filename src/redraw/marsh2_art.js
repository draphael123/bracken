// marsh2_art.js - MARSH WOOD 2's art pass (claude/marsh2art). ART ONLY: the grid is read for how a cell is DRAWN, never changed.
//   THE SLUICE HOUSE   a timber-and-clay DAM (vertical bog-oak timbers, clay chinking, wale beams, a culvert at its foot), a mill shed on stilts over it with its
//                      hoist and sluice GATE (closed -> cracked by each blow -> broken, water running), the miller's loft under its own roof, the draining basin's
//                      MUD BED (wet mud, glints, stubs) with the drowned huts' stilts and stranded fish traps standing in it
//   THE STILTS         every stilt walk (jetty, lookout, boardwalk, hides, river boards, hut walks) is a deck of bog-oak boards lashed with reed cord, over a stringer
//   SUPPORTS           the marsh's 'stilt' pile (cross-lashed, braced, a green waterline) and 'reed' bundle (thick stems), src/forest-supports-art.js
// Palette = the Marsh's own (bog oak, reed cord, clay, moss). tile(t, x, y, at, T, L) -> a 16x16 canvas, or null (the game's own kit draws it).
import { canvas } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };
const rnd = (a, b, m) => hash(a, b) % m;
const P = (g, c, x, y) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const tileOf = fn => { const [c, g] = canvas(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const col = fn(x, y); if (col) P(g, col, x, y); } return c; };

export const OAK = ['#1c1610', '#2c2218', '#3a3026', '#5a4a36', '#7a6648', '#9a8660'];   /* bog oak, dark -> pale */
export const BOARD = ['#4a3018', '#5c3a1d', '#8a5a32', '#a8743f', '#c4975a'];             /* the marsh's own planks (the ferry dock's colours) */
export const CORD = '#c9b27c', CORD_D = '#8e7a52';
export const CLAY = ['#463a2c', '#5e503c', '#7a6a52', '#9a8a6e'];
export const MOSS = ['#2f4a26', '#4a7a3a', '#5a8a4a', '#8fd160'];
export const MUD = ['#241a12', '#33261a', '#45331f', '#6a5236', '#9fb8a8'];

/* ---- where things are (tile columns/rows of src/marsh2.js; art reads them, nothing else does) ---- */
export const DAM = [347, 349, 18];            /* x0, x1, top row (to the bottom of the level) */
export const BED = [350, 369, 25];            /* the far basin's mud bed: x0, x1, top row */
export const DECK = [346, 348, 11];           /* the sluice house's gate deck */
export const LOFT = [340, 343, 8];            /* the miller's loft planks */
export const STAIR = [[363, 364, 22], [365, 366, 20]];   /* the boards out of the mud */
export const WALKS = [   /* [x0, x1, row, kind] - every plank run of the stilt walks, wear picked by kind */
  [5, 23, 19, 'jetty'], [57, 70, 11, 'lookout'], [112, 129, 16, 'walk'], [132, 137, 15, 'hide'], [150, 158, 15, 'hide'], [226, 236, 15, 'river'], [261, 271, 15, 'river'],
  [293, 300, 15, 'river'], [378, 388, 14, 'hut'], [429, 443, 15, 'hut'], [DECK[0], DECK[1], DECK[2], 'mill'], [LOFT[0], LOFT[1], LOFT[2], 'mill'],
  [STAIR[0][0], STAIR[0][1], STAIR[0][2], 'stair'], [STAIR[1][0], STAIR[1][1], STAIR[1][2], 'stair'],
];
const walkAt = (x, y) => { for (const w of WALKS) if (y === w[2] && x >= w[0] && x <= w[1]) return w; return null; };

/* ===== the deck of a stilt walk: bog-oak boards, a lit lip, seams, nails, reed-cord lashings at the ends, a stringer and green drips under ===== */
function walkTile(x, y, at, T) {
  const w = walkAt(x, y); if (!w) return null;
  const kind = w[3], edgeL = x === w[0], edgeR = x === w[1], air = at(x, y + 1) === T.AIR;
  return once('wk' + kind + (x & 3) + edgeL + edgeR + air, () => tileOf((px, py) => {
    const u = x * 16 + px, mossy = kind === 'river' || kind === 'hide' || kind === 'hut', worn = kind === 'jetty' || kind === 'lookout';
    if (py === 0) { if (edgeL && px < 2 || edgeR && px > 13) return null; return rnd(u, 1, mossy ? 4 : 9) === 0 ? MOSS[2] : (worn ? BOARD[4] : BOARD[3]); }
    if (py >= 1 && py <= 3) {
      if (edgeL && px === 0 || edgeR && px === 15) return OAK[1];
      const seam = ((u + (py > 2 ? 0 : 0)) % 8) === 7; if (seam) return BOARD[0];
      if ((u % 8) === 1 && py === 2) return OAK[1];                                         /* a nail */
      if (py === 1) return rnd(u, 2, 6) === 0 ? BOARD[3] : BOARD[2];
      if (py === 3) return BOARD[1];
      return rnd(u, py, 7) === 0 ? BOARD[1] : (worn && rnd(u, 3, 5) === 0 ? BOARD[3] : BOARD[2]);
    }
    if (py === 4) return OAK[1];
    if (py === 5 || py === 6) {                                                            /* the stringer under the boards */
      if (!air) return null;
      if (edgeL && px < 3 || edgeR && px > 12) return py === 5 ? CORD : CORD_D;            /* the lashing at the end of the run */
      if ((px === 3 || px === 4) && x % 2 === 0) return CORD_D;                            /* a binding every other tile */
      return py === 5 ? OAK[3] : OAK[2];
    }
    if (py >= 7 && py <= 9 && air && mossy && ((px * 5 + x * 3) % 7 === 0 || (px + x) % 11 === 3) && py <= 7 + rnd(u, 9, 3)) return MOSS[(py + px) & 1 ? 1 : 0];   /* weed hanging off the boards */
    return null;
  }));
}

/* ===== the dam: vertical bog-oak timbers, clay chinking, wale beams; the culvert at its foot; the plank cap ===== */
const WALE = new Set([20, 24]);
function damTile(x, y, at, T) {
  if (x < DAM[0] || x > DAM[1] || y < DAM[2]) return null;
  const top = y === DAM[2], k = (x - DAM[0]) * 100 + y;
  return once('dm' + k, () => tileOf((px, py) => {
    const u = (x - DAM[0]) * 16 + px;
    if (top) {   /* the cap: boards, a lit lip, the timbers' heads below */
      if (py === 0) return rnd(u, 5, 8) === 0 ? MOSS[2] : BOARD[4];
      if (py <= 2) return (u % 8) === 7 ? BOARD[0] : py === 1 ? BOARD[3] : BOARD[2];
      if (py === 3) return OAK[1];
      if (py < 6) return u % 4 === 3 ? CLAY[2] : OAK[(u >> 2) % 3 + 2];
    }
    const col = u % 4, ti = (u >> 2) % 5, wy = y;
    if (WALE.has(wy) && py >= 4 && py <= 9) {   /* a wale beam bound across the timbers */
      if (py === 4) return OAK[4]; if (py === 9) return OAK[0];
      if ((px === 3 || px === 11)) return '#8a8a82';                                         /* an iron bolt head */
      return rnd(u, py, 9) === 0 ? OAK[3] : OAK[2];
    }
    if (col === 3) return rnd(u, py, 5) === 0 ? CLAY[3] : CLAY[1];                           /* clay chinking */
    const base = [OAK[2], OAK[3], OAK[2], OAK[3], OAK[4]][ti];
    if (col === 0) return rnd(u, y, 3) === 0 ? OAK[4] : base === OAK[2] ? OAK[3] : OAK[4];    /* the lit edge of each timber */
    if (rnd(u, py + y * 16, 23) === 0) return OAK[1];                                       /* a knot or a nail hole */
    if (y <= DAM[2] + 2 && rnd(u, py, 4) === 0) return MOSS[(py & 1)];                       /* weed at the waterline */
    if (y === DAM[2] + 1 && py < 3 && rnd(u, y, 3) === 0) return MOSS[1];
    return base;
  }));
}
/* the culvert at the dam's foot (cols 347-349 rows 25-26): a timber frame and a dark mouth; the leaf is drawn over it by drawFront */
export const CULVERT = { x: 347 * 16 + 8, y: 25 * 16 + 2, w: 32, h: 22 };

/* ===== the drained basin's mud: wet, glinting, a few stubs; the stir of rows below ===== */
function mudTile(x, y, at, T) {
  if (x < BED[0] || x > BED[1] || y < BED[2]) return null;
  const top = at(x, y - 1) !== T.SOLID;
  return once('mu' + (x & 7) + (top ? 't' : 'b') + (y > BED[2] + 1 ? 'd' : ''), () => tileOf((px, py) => {
    const u = x * 16 + px;
    if (top) {
      if (py < 1) return rnd(u, 3, 4) === 0 ? MUD[3] : MUD[2];
      if (py < 3 && rnd(u, py, 11) === 0) return MUD[4];                                    /* a glint of standing water */
      if (py === 1 && ((u * 7) % 19) < 3) return MUD[4];
      if (py < 6) return rnd(u, py + 4, 9) === 0 ? MUD[3] : rnd(u, py, 6) === 0 ? MUD[1] : MUD[2];
    }
    const r = rnd(u, py + y * 16, 29);
    if (r === 0) return '#6a6458';                                                           /* a pebble */
    if (r === 1) return MOSS[0];
    if (r < 5) return MUD[0];
    return rnd(u >> 1, py >> 1, 5) === 0 ? MUD[2] : MUD[1];
  }));
}

export function tile(t, x, y, at, T, L) {
  if (t === T.SOLID) return damTile(x, y, at, T) || mudTile(x, y, at, T);
  if (t === T.PLANK) return walkTile(x, y, at, T);
  return null;
}

/* ================= BACKGROUND DRESSING (drawn behind the tiles, before the water) ================= */
const sx = (x, cx) => Math.round(x - cx), sy = (y, cy) => Math.round(y - cy);
const baked = new Map();
function blit(g, key, x0, y0, w, h, cx, cy, fn) {   /* paint fn(cg, cx0, cy0) once into a w x h sheet whose corner is world (x0, y0); draw it when it is on screen */
  if (x0 - cx > 340 || x0 + w - cx < -20 || y0 - cy > 200 || y0 + h - cy < -20) return;
  let c = baked.get(key); if (!c) { const [cv, cg] = canvas(w, h); fn(cg, x0, y0); c = cv; baked.set(key, c); }
  g.drawImage(c, Math.round(x0 - cx), Math.round(y0 - cy));
}
function post(g, x, y0, y1, w = 4) { R(g, OAK[2], x, y0, w, y1 - y0); R(g, OAK[4], x, y0, 1, y1 - y0); R(g, OAK[0], x + w - 1, y0, 1, y1 - y0); }
function lash(g, x, y, w = 4) { R(g, CORD, x - 1, y, w + 2, 1); R(g, CORD_D, x - 1, y + 1, w + 2, 1); }
function brace(g, x0, y0, x1, y1) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n); R(g, OAK[3], x, y, 2, 2); P(g, OAK[1], x + 1, y + 1); } }
function thatch(g, x0, x1, yEave, h, flip) {   /* a lean-to / gable of reed thatch: rows of stalks, a dark eave */
  for (let r = 0; r < h; r++) { const inset = flip ? 0 : r, ww = (x1 - x0) - (flip ? r : 0) - (flip ? 0 : 0); const xs = flip ? x0 : x0 + 0; const y = yEave - h + r;
    for (let x = xs; x < xs + ww; x++) { const c = (x + r * 3) % 5 === 0 ? '#c9b27c' : (x + r) % 3 === 0 ? '#9a8a50' : '#7a7a3a'; P(g, c, x, y); } }
  R(g, OAK[1], x0, yEave, x1 - x0, 2);
  for (let x = x0; x < x1; x += 3) P(g, '#7a7a3a', x, yEave + 2 + ((x >> 1) & 1));
}
function gableRoof(g, xl, xr, yEave, rise) {   /* the shed's thatched gable, plank-ridged */
  const mid = (xl + xr) / 2, half = (xr - xl) / 2;
  for (let y = 0; y < rise; y++) { const f = y / rise, x0 = Math.round(xl + half * (1 - f)) - 0, x1 = Math.round(xr - half * (1 - f)); for (let x = x0; x < x1; x++) { const c = (x + y * 2) % 5 === 0 ? '#c9b27c' : (x + y) % 3 === 0 ? '#9a8a50' : '#7a7a3a'; P(g, y === rise - 1 ? '#9a8a50' : c, x, yEave - rise + y + 1); } }
  R(g, OAK[1], xl, yEave, xr - xl, 2); R(g, OAK[4], xl, yEave, xr - xl, 1);
  for (let x = xl + 1; x < xr; x += 3) P(g, '#7a7a3a', x, yEave + 2 + ((x >> 1) & 1));
  R(g, OAK[3], Math.round(mid) - 1, yEave - rise - 1, 3, 2);
}

/* the sluice house: a stilt mill on the dam. Back wall, posts, under-deck trestle, roof; the miller's loft beside it. */
function drawMill(g, cx, cy, time, st) {
  const x0 = 344 * 16, x1 = 350 * 16, deck = 11 * 16;
  const X = x => sx(x, cx), Y = y => sy(y, cy);
  /* under the deck: stilts down to the dam's cap, cross-braced; one drops into the water west of the dam */
  for (const px of [346 * 16 + 6, 348 * 16 + 2]) post(g, X(px), Y(deck + 4), Y(18 * 16), 4);
  post(g, X(345 * 16 + 3), Y(deck + 4), Y(21 * 16), 4); lash(g, X(345 * 16 + 3), Y(14 * 16 + 4)); lash(g, X(345 * 16 + 3), Y(17 * 16 + 2));
  brace(g, X(345 * 16 + 5), Y(deck + 8), X(346 * 16 + 6) - 1, Y(15 * 16)); brace(g, X(346 * 16 + 8), Y(deck + 10), X(348 * 16 + 2) - 1, Y(17 * 16 + 4)); brace(g, X(348 * 16 + 2), Y(deck + 10), X(346 * 16 + 8) - 1, Y(17 * 16 + 4));
  lash(g, X(346 * 16 + 6), Y(13 * 16 + 4)); lash(g, X(348 * 16 + 2), Y(13 * 16 + 4)); lash(g, X(346 * 16 + 6), Y(16 * 16 + 2)); lash(g, X(348 * 16 + 2), Y(16 * 16 + 2));
  /* the shed: a back wall of boards behind the gate, a post at each end, a thatched gable, a beam and hoist */
  const wx0 = 345 * 16 - 2, wx1 = 350 * 16 - 4, wy0 = 7 * 16 + 6, wy1 = deck;
  R(g, OAK[1], X(wx0), Y(wy0), wx1 - wx0, wy1 - wy0);
  for (let x = wx0 + 1; x < wx1 - 1; x++) { const c = ((x - wx0) % 6 === 5) ? OAK[0] : ((x - wx0) % 6 === 0 ? BOARD[2] : BOARD[1]); R(g, c, X(x), Y(wy0 + 1), 1, wy1 - wy0 - 1); }
  R(g, 'rgba(20,16,10,0.45)', X(wx0), Y(wy0), wx1 - wx0, 12);                               /* the eave's shade over the back wall */
  R(g, OAK[0], X(wx0 + 6), Y(wy0 + 20), 12, 14); for (let i = 0; i < 6; i++) { R(g, i & 1 ? OAK[2] : '#0c0a08', X(wx0 + 7), Y(wy0 + 21 + i * 2), 10, 2); R(g, OAK[4], X(wx0 + 7), Y(wy0 + 21 + i * 2), 10, 1); }   /* a louvred vent: pale slat edges over the dark */
  post(g, X(wx0 - 2), Y(wy0 - 4), Y(wy1), 5); post(g, X(wx1 - 3), Y(wy0 - 4), Y(wy1), 5); lash(g, X(wx0 - 2), Y(wy0 + 18), 5); lash(g, X(wx1 - 3), Y(wy0 + 18), 5);
  gableRoof(g, X(wx0 - 8), X(wx1 + 8), Y(wy0 - 3), 20);
  R(g, OAK[2], X(wx0 - 2), Y(wy0 + 4), wx1 - wx0 + 4, 4); R(g, OAK[4], X(wx0 - 2), Y(wy0 + 4), wx1 - wx0 + 4, 1);   /* the hoist beam under the eave */
  brace(g, X(wx0 + 2), Y(wy0 + 22), X(wx0 + 16), Y(wy0 + 9)); brace(g, X(wx1 - 4), Y(wy0 + 22), X(wx1 - 18), Y(wy0 + 9));
  /* the rope off the beam and the hook above the gate (the gate itself is a prop, src/redraw/marsh2_art.js drawGate) */
  const gx = 347 * 16 + 8; R(g, CORD, X(gx), Y(wy0 + 8), 1, 18); R(g, '#8a8a82', X(gx - 1), Y(wy0 + 26), 3, 2);
  /* the mill's barrels and sacks on the deck, the miller's lantern */
  R(g, BOARD[1], X(346 * 16 + 1), Y(deck - 10), 7, 10); R(g, BOARD[3], X(346 * 16 + 1), Y(deck - 10), 7, 1); R(g, OAK[1], X(346 * 16 + 1), Y(deck - 7), 7, 1); R(g, OAK[1], X(346 * 16 + 1), Y(deck - 3), 7, 1);
  const lx = wx1 - 18, ly = wy0 + 12; R(g, OAK[0], X(lx), Y(ly - 6), 1, 6); R(g, '#8a8a82', X(lx - 2), Y(ly), 5, 1); R(g, '#e8c060', X(lx - 1), Y(ly + 1), 3, 4); R(g, '#fff1a0', X(lx), Y(ly + 2), 1, 2);
}

/* the miller's loft: boards over the water under a thatched lean-to, rope to a pulley, sacks, a hanging net */
function drawLoft(g, cx, cy) {
  const x0 = LOFT[0] * 16, x1 = (LOFT[1] + 1) * 16, deck = LOFT[2] * 16;
  const X = x => sx(x, cx), Y = y => sy(y, cy);
  for (const px of [x0 + 2, x1 - 6]) { post(g, X(px), Y(deck + 4), Y(14 * 16 + 4), 4); lash(g, X(px), Y(deck + 20)); lash(g, X(px), Y(deck + 40)); }
  brace(g, X(x0 + 6), Y(deck + 22), X(x1 - 8), Y(deck + 46)); brace(g, X(x1 - 8), Y(deck + 22), X(x0 + 6), Y(deck + 46));
  post(g, X(x0 + 2), Y(deck - 50), Y(deck), 4); post(g, X(x1 - 6), Y(deck - 50), Y(deck), 4); lash(g, X(x0 + 2), Y(deck - 30)); lash(g, X(x1 - 6), Y(deck - 30));
  thatch(g, X(x0 - 8), X(x1 + 8), Y(deck - 46), 12, false);
  R(g, OAK[2], X(x0), Y(deck - 44), x1 - x0, 3);
  R(g, CORD, X(x0 + 24), Y(deck - 41), 1, 14); R(g, OAK[1], X(x0 + 21), Y(deck - 28), 7, 5); R(g, '#8a8a82', X(x0 + 23), Y(deck - 26), 3, 3);   /* a pulley and its rope */
  R(g, '#a89a74', X(x0 + 6), Y(deck - 10), 9, 10); R(g, '#c9b27c', X(x0 + 6), Y(deck - 10), 9, 2); R(g, OAK[1], X(x0 + 9), Y(deck - 8), 3, 1); R(g, '#a89a74', X(x1 - 18), Y(deck - 7), 8, 7); R(g, '#c9b27c', X(x1 - 18), Y(deck - 7), 8, 2);   /* grain sacks */
}

/* the drained basin's furniture: the huts' stilts standing in the mud, stranded fish traps, a sunk skiff's ribs */
function drawBasin(g, cx, cy, time, L) {
  const x0 = BED[0] * 16, x1 = (BED[1] + 1) * 16;
  const X = x => sx(x, cx), Y = y => sy(y, cy), bed = BED[2] * 16;
  for (const [tx, h] of [[353, 5], [358, 7], [361, 4], [367, 6]]) {   /* the huts' stilts: a trio each, cross-braced, a rotted floor snapped off */
    const bx = tx * 16 + 2, top = bed - h * 16 + (tx & 3) * 3;
    post(g, X(bx), Y(top), Y(bed + 1), 4); post(g, X(bx + 9), Y(top + 6), Y(bed + 1), 4); post(g, X(bx + 18), Y(top + 2), Y(bed + 1), 4);
    brace(g, X(bx + 3), Y(top + 18), X(bx + 10), Y(top + 36)); brace(g, X(bx + 11), Y(top + 18), X(bx + 4), Y(top + 36)); lash(g, X(bx), Y(top + 16)); lash(g, X(bx + 9), Y(top + 22)); lash(g, X(bx + 18), Y(top + 18));
    R(g, BOARD[1], X(bx - 4), Y(top - 1), 10, 3); R(g, BOARD[3], X(bx - 4), Y(top - 1), 10, 1);   /* a snapped floor board across the first stilt */
    for (let i = 0; i < 4; i++) R(g, MOSS[i & 1], X(bx + 1 + i), Y(bed - 3 - (i % 2)), 1, 3 + (i & 1));   /* weed at the foot */
  }
  for (const tx of [355, 363]) {   /* a fish trap lying on its side: a wicker cone, hoops, the funnel mouth, a fish still in it */
    const fx = tx * 16, fy = bed - 11;
    for (let i = 0; i < 18; i++) { const w = 4 + Math.floor(i * 0.55), ww = Math.min(11, w); R(g, i % 4 === 0 ? OAK[1] : (i & 1) ? '#9a8a50' : '#7a7a3a', X(fx + i), Y(fy + 11 - ww), 1, ww); }
    R(g, OAK[1], X(fx + 18), Y(fy + 1), 2, 10); R(g, '#1c1610', X(fx + 19), Y(fy + 3), 2, 6);
    R(g, CORD, X(fx + 5), Y(fy + 5), 1, 6); R(g, '#c8d8d0', X(fx + 11), Y(fy + 7), 4, 1); R(g, '#8fb0a0', X(fx + 12), Y(fy + 8), 3, 1);
  }
  for (let i = 0; i < 5; i++) { const fx = (354 + i * 3) * 16 + 4, fy = bed - 2; R(g, '#c8d8d0', X(fx), Y(fy), 5, 1); R(g, '#8fb0a0', X(fx + 1), Y(fy + 1), 3, 1); P(g, MUD[0], X(fx + 4), Y(fy - 1)); }   /* dead fish in the mud */
}

export function drawBack(g, L, cx, cy, time) {
  blit(g, 'mill', 5496, 80, 124, 270, cx, cy, drawMill);
  blit(g, 'loft', 5424, 60, 100, 190, cx, cy, drawLoft);
  blit(g, 'basin', 5600, 270, 340, 150, cx, cy, drawBasin);
  blit(g, 'jetty', 64, 256, 340, 56, cx, cy, drawJetty);
  blit(g, 'lookout', 900, 136, 250, 44, cx, cy, drawLookout);
  for (const [a, b] of [[132, 137], [150, 158]]) blit(g, 'hide' + a, a * 16 - 16, 176, (b - a + 1) * 16 + 36, 76, cx, cy, (cg, x0, y0) => drawHide(cg, x0, y0, a, b));
  for (const [a, row] of [[378, 14], [429, 15]]) blit(g, 'hut' + a, (a + 3) * 16 - 12, row * 16 - 66, 84, 70, cx, cy, (cg, x0, y0) => drawHut(cg, x0, y0, a, row));
  /* the lamps' flicker is the only live part: the miller's lantern and the jetty's */
  if (5496 - cx < 340 && 5620 - cx > -20) { g.globalAlpha = 0.18 * (0.8 + 0.2 * Math.sin(time * 9 + 1)); R(g, '#ffd36b', sx(350 * 16 - 4 - 18 - 7, cx), sy(7 * 16 + 6 + 12 - 4, cy), 15, 14); g.globalAlpha = 1; }
  if (64 - cx < 340 && 400 - cx > -20) { g.globalAlpha = 0.2 * (0.85 + 0.15 * Math.sin(time * 8)); R(g, '#ffd36b', sx(10 * 16 + 11, cx), sy(19 * 16 - 36, cy), 20, 20); g.globalAlpha = 1; }
}

/* ===== the stilt walks' own dressing: mooring bollards and a coil on the jetty, a rope rail at the lookout, thatched hides, a hut on each hut walk ===== */
function drawJetty(g, cx, cy) {   /* the landing jetty: a stout mooring post at each end, a rope coil, a hung lantern on a bracket */
  const X = x => sx(x, cx), Y = y => sy(y, cy), deck = 19 * 16;
  for (const bx of [6 * 16 + 4, 22 * 16 + 4]) { R(g, OAK[2], X(bx), Y(deck - 11), 6, 11); R(g, OAK[4], X(bx), Y(deck - 11), 1, 11); R(g, OAK[1], X(bx + 5), Y(deck - 11), 1, 11); R(g, OAK[4], X(bx - 1), Y(deck - 12), 8, 2); lash(g, X(bx), Y(deck - 7), 6); }
  R(g, CORD_D, X(14 * 16 + 4), Y(deck - 3), 8, 3); R(g, CORD, X(14 * 16 + 5), Y(deck - 3), 6, 1); R(g, CORD, X(14 * 16 + 4), Y(deck - 2), 1, 1);
  R(g, OAK[2], X(10 * 16 + 4), Y(deck - 36), 3, 36); R(g, OAK[2], X(10 * 16 + 4), Y(deck - 36), 18, 3); brace(g, X(10 * 16 + 5), Y(deck - 20), X(10 * 16 + 14), Y(deck - 34)); R(g, CORD, X(10 * 16 + 20), Y(deck - 33), 1, 5);
  R(g, '#e8c060', X(10 * 16 + 18), Y(deck - 28), 4, 5); R(g, '#fff1a0', X(10 * 16 + 19), Y(deck - 27), 2, 2);
}
function drawLookout(g, cx, cy) {   /* the lookout: a rope rail along the far edge on posts, a pennant of reed */
  const X = x => sx(x, cx), Y = y => sy(y, cy), deck = 11 * 16;
  for (let x = 57; x <= 70; x += 4) { R(g, OAK[2], X(x * 16 + 6), Y(deck - 12), 3, 12); R(g, OAK[4], X(x * 16 + 6), Y(deck - 12), 1, 12); }
  for (let x = 57 * 16 + 7; x < 70 * 16 + 8; x++) P(g, CORD, X(x), Y(deck - 11 + Math.round(Math.sin(((x - 57 * 16) % 64) / 64 * Math.PI) * 2)));
  R(g, OAK[2], X(70 * 16 + 4), Y(deck - 30), 3, 30); R(g, '#5a8a4a', X(70 * 16 + 7), Y(deck - 30), 9, 5); R(g, '#8fd160', X(70 * 16 + 7), Y(deck - 30), 9, 1); R(g, '#5a8a4a', X(70 * 16 + 10), Y(deck - 25), 5, 2);
}
function drawHide(g, cx, cy, a, b) {   /* a heron hide: a woven reed screen along the back and a low thatched roof */
  const X = x => sx(x, cx), Y = y => sy(y, cy), deck = 15 * 16, x0 = a * 16 - 2, x1 = (b + 1) * 16 + 2;
  R(g, OAK[2], X(x0), Y(deck - 54), 3, 54); R(g, OAK[2], X(x1 - 3), Y(deck - 54), 3, 54); lash(g, X(x0), Y(deck - 24), 3); lash(g, X(x1 - 3), Y(deck - 24), 3);
  for (let x = x0 + 3; x < x1 - 3; x++) { const c = (x & 1) ? '#7a7a3a' : '#9a8a50'; R(g, c, X(x), Y(deck - 40), 1, 40); } R(g, OAK[1], X(x0 + 3), Y(deck - 24), x1 - x0 - 6, 1); R(g, OAK[1], X(x0 + 3), Y(deck - 12), x1 - x0 - 6, 1);
  R(g, OAK[0], X(x0 + 20), Y(deck - 34), 12, 2); R(g, '#0c0a08', X(x0 + 21), Y(deck - 33), 10, 1);   /* the peep slit */
  thatch(g, X(x0 - 6), X(x1 + 6), Y(deck - 40), 11, false);
}
function drawHut(g, cx, cy, a, row) {   /* a hut on a hut walk: board wall, a doorway with a hung curtain, a lit window, thatch */
  const X = x => sx(x, cx), Y = y => sy(y, cy), deck = row * 16, hx = (a + 3) * 16;
  R(g, OAK[1], X(hx), Y(deck - 40), 58, 40); for (let x = hx + 1; x < hx + 57; x++) R(g, (x - hx) % 6 === 5 ? OAK[0] : (x - hx) % 6 === 0 ? BOARD[2] : BOARD[1], X(x), Y(deck - 39), 1, 39);
  R(g, OAK[0], X(hx + 8), Y(deck - 26), 14, 26); R(g, '#33281c', X(hx + 9), Y(deck - 25), 12, 25); R(g, '#7a4a3a', X(hx + 9), Y(deck - 25), 5, 22); R(g, '#a85a4a', X(hx + 9), Y(deck - 25), 1, 22);   /* the doorway and its curtain */
  R(g, OAK[0], X(hx + 34), Y(deck - 28), 14, 12); R(g, '#e8c060', X(hx + 35), Y(deck - 27), 12, 10); R(g, OAK[1], X(hx + 40), Y(deck - 27), 1, 10); R(g, OAK[1], X(hx + 35), Y(deck - 22), 12, 1);   /* a lit window */
  post(g, X(hx - 3), Y(deck - 44), Y(deck), 4); post(g, X(hx + 57), Y(deck - 44), Y(deck), 4);
  gableRoof(g, X(hx - 8), X(hx + 66), Y(deck - 40), 18);
}

/* ================= FOREGROUND STATE (after the tiles, before the water): the gate, the culvert, the draining basin ================= */
function paintGate(g, px, py, hits, open) {   /* the gate's frame and leaf at (px, py = its foot on the deck, the leaf 24 wide from px): static, baked once per state */
  post(g, px - 7, py - 44, py, 5); post(g, px + 26, py - 44, py, 5); R(g, OAK[2], px - 8, py - 46, 44, 4); R(g, OAK[4], px - 8, py - 46, 44, 1); lash(g, px - 7, py - 32, 5); lash(g, px + 26, py - 32, 5);
  brace(g, px - 3, py - 40, px + 4, py - 46 + 8); brace(g, px + 27, py - 40, px + 20, py - 38);
  R(g, OAK[0], px - 7, py - 3, 5, 3); R(g, OAK[0], px + 26, py - 3, 5, 3);
  if (!open) {
    const th = 32 - hits * 2;   /* the leaf: heavy planks banded with iron, sagging as it takes blows */
    R(g, OAK[0], px - 2, py - th - 3, 28, th + 3);
    for (let i = 0; i < 5; i++) { const yy = py - th - 2 + ((i * (th + 2) / 5) | 0), hh = Math.ceil((th + 2) / 5) - 1; R(g, i & 1 ? BOARD[1] : BOARD[2], px - 1, yy, 26, hh); R(g, BOARD[4], px - 1, yy, 26, 1); R(g, BOARD[0], px - 1, yy + hh - 1, 26, 1); }
    R(g, '#6a6a62', px - 2, py - th + 3, 28, 2); R(g, '#8a8a82', px - 2, py - th + 3, 28, 1); R(g, '#6a6a62', px - 2, py - 11, 28, 2); R(g, '#8a8a82', px - 2, py - 11, 28, 1); for (const bx of [1, 9, 17, 23]) { P(g, '#c8c8c0', px + bx, py - th + 4); P(g, '#c8c8c0', px + bx, py - 10); }   /* iron bands and bolts */
    R(g, '#8a8a82', px + 10, py - th - 6, 4, th + 4); R(g, '#c8c8c0', px + 10, py - th - 6, 1, th + 4);   /* the lifting rod up to the wheel */
    R(g, '#3a5a68', px - 1, py - 3, 26, 3); R(g, '#5e8a98', px, py - 3, 6, 1); R(g, '#5e8a98', px + 13, py - 2, 8, 1);   /* damp at the foot */
    if (hits >= 1) { R(g, OAK[0], px + 17, py - th + 6, 1, 10); R(g, OAK[0], px + 16, py - th + 15, 1, 6); R(g, OAK[0], px + 18, py - th + 8, 1, 4); }
    if (hits >= 2) { R(g, OAK[0], px + 4, py - th + 8, 1, 14); R(g, OAK[0], px + 5, py - th + 21, 2, 1); R(g, '#e8d8a8', px + 2, py - th + 12, 2, 1); R(g, OAK[0], px + 21, py - th + 5, 1, 16); for (let i = 0; i < 4; i++) P(g, '#e8d8a8', px + 19 + (i & 1), py - th + 11 + i * 3); for (let i = 0; i < 5; i++) R(g, '#5e8a98', px + 3 + i * 5, py - 8 + (i & 1) * 2, 1, 2); }   /* split planks, pale splinters, weeping */
  } else {
    /* broken: two splintered stumps of planking, one plank swinging from its chain, the opening black and running with water */
    R(g, '#0a0806', px + 2, py - 20, 20, 20);
    R(g, BOARD[1], px - 2, py - 12, 7, 12); R(g, BOARD[2], px - 2, py - 12, 7, 1); R(g, BOARD[1], px + 19, py - 9, 7, 9); R(g, BOARD[2], px + 19, py - 9, 7, 1);
    for (const [sx0, sh] of [[-1, 7], [1, 14], [4, 5], [20, 9], [22, 4], [24, 6]]) R(g, '#e8d8a8', px + sx0, py - 12 - sh + (sx0 > 10 ? 3 : 0), 1, sh);   /* splinters */
    R(g, OAK[2], px + 7, py - 30, 11, 4); R(g, OAK[4], px + 7, py - 30, 11, 1); R(g, '#6a6a62', px + 8, py - 36, 1, 7); R(g, '#8a8a82', px + 8, py - 36, 1, 1);   /* a plank swinging by its chain */
  }
  /* the winding wheel on the head beam: a spoked ring */
  const wx = px + 12, wy = py - 38, an0 = open ? 0.6 : hits * 0.3;
  for (let i = 0; i < 8; i++) { const an = an0 + i * Math.PI / 4; for (let r = 1; r <= 6; r += (r === 1 ? 2 : 1)) { const rx = Math.round(wx + Math.cos(an) * r), ry = Math.round(wy + Math.sin(an) * r); P(g, r > 4 ? OAK[4] : OAK[3], rx, ry); } }
  R(g, OAK[1], wx - 1, wy - 1, 3, 3); P(g, '#c8c8c0', wx, wy);
}
export function drawGate(g, pr, x, y, time) {   /* x, y: the gate's foot on the deck; pr.hits 0-3, pr.open: the gate is broken */
  const hits = pr.open ? 3 : Math.min(3, pr.hits || 0), px = x - 12;
  if (px - 20 > 340 || px + 60 < -20) return;
  const key = 'gate' + (pr.open ? 'o' : hits); let c = baked.get(key); if (!c) { const [cv, cg] = canvas(60, 60); paintGate(cg, 12, 52, hits, !!pr.open); c = cv; baked.set(key, c); }
  g.drawImage(c, px - 12, y - 52);
  if (pr.open) { const py = y; for (let i = 0; i < 9; i++) { const bx = px + 3 + i * 2; R(g, i & 1 ? '#bfe6f5' : '#7fc4e0', bx, py - 6 + ((((time * 8) + i * 3) % 7) | 0), 1, 3); } R(g, '#e8f4f0', px + 4, y - 2, 16, 1); }   /* water running out of the broken gate */
}
/* the culvert leaf over the dam's foot while the gate holds; open: the black mouth and a water jet west; and a whirlpool in the basin while it drains */
export function drawFront(g, L, cx, cy, time, st) {
  const C = CULVERT, X = x => sx(x, cx), Y = y => sy(y, cy);
  if (C.x - cx > 380 || C.x + 120 - cx < -120) return;
  const open = !!st.open, onScreen = C.y - cy < 200 && C.y - cy > -40;
  if (onScreen) {
  R(g, OAK[0], X(C.x - 1), Y(C.y - 1), C.w + 2, C.h + 2); R(g, OAK[2], X(C.x), Y(C.y), C.w, 2);
  if (!open) {
    R(g, OAK[1], X(C.x + 2), Y(C.y + 2), C.w - 4, C.h - 2);
    for (let i = 0; i < 4; i++) { R(g, i & 1 ? BOARD[1] : BOARD[2], X(C.x + 3), Y(C.y + 3 + i * 5), C.w - 6, 4); R(g, BOARD[3], X(C.x + 3), Y(C.y + 3 + i * 5), C.w - 6, 1); }
    R(g, '#6a6a62', X(C.x + 2), Y(C.y + 8), C.w - 4, 2); R(g, '#6a6a62', X(C.x + 2), Y(C.y + 17), C.w - 4, 2); R(g, '#8a8a82', X(C.x + 14), Y(C.y + 2), 4, C.h - 3);
  } else {
    R(g, '#0a0806', X(C.x + 2), Y(C.y + 2), C.w - 4, C.h - 2);
    const t = time * 5;   /* water pouring out through it, the stream breaking in foam */
    for (let i = 0; i < 12; i++) { const yy = C.y + 3 + ((i * 7 + t * 9) % (C.h - 4)); R(g, i & 1 ? '#bfe6f5' : '#7fc4e0', X(C.x + 3 + (i * 5) % (C.w - 8)), Y(yy), 3 + (i & 1), 1); }
    for (let i = 0; i < 7; i++) { const fx = C.x - 6 - ((t * 7 + i * 5) % 22), fy = C.y + C.h - 4 + Math.sin(t + i) * 2; R(g, '#e8f4f0', X(fx), Y(fy), 2, 1); P(g, '#fff', X(fx + 1), Y(fy - 1)); }
  }
  }
  if (open) {   /* the gate's water: it falls off the deck's west edge down onto the dam's near basin, foam where it lands; a trickle once the far basin is dry */
    const A = (L.pools || []).find(q => Math.abs(q.x1 - 347 * 16) < 2), top = 11 * 16 + 2, bot = A ? A.y : 19 * 16, wide = st.draining ? 9 : 3, x0 = 346 * 16 + 3;
    if (bot - top > 8) { for (let k = 0; k < wide; k++) for (let y = top; y < bot; y += 1) { const ph = (y * 0.55 + time * 22 + k * 1.7) % 6; if (ph < 3.6) P(g, ph < 1.2 ? '#e8f4f0' : (k & 1) ? '#bfe6f5' : '#7fc4e0', X(x0 + k), Y(y)); }
      for (let i = 0; i < (st.draining ? 12 : 4); i++) { const fx = x0 + wide / 2 + Math.sin(time * 9 + i * 2.1) * (3 + (i % 5) * 2.3), fy = bot - 1 - Math.abs(Math.sin(time * 7 + i)) * 5; R(g, i & 1 ? '#ffffff' : '#bfe6f5', X(fx), Y(fy), 2, 1); }
      R(g, '#e8f4f0', X(x0 - 3), Y(bot), wide + 6, 1); } }
  if (st.draining) {   /* a whirlpool dimple and floating weed circling the far basin's surface while it falls */
    const q = st.pool, sxm = 360 * 16, syw = q.y;
    for (let r = 0; r < 4; r++) { const rr = 5 + r * 4; for (let i = 0; i < 10; i++) { const an = time * (2 - r * 0.35) + i * 0.628 + r; R(g, r & 1 ? '#7fc4e0' : '#bfe6f5', X(sxm + Math.cos(an) * rr * 1.8), Y(syw + 2 + Math.sin(an) * rr * 0.35), 2, 1); } }
  }
}

/* ================= THE SUPPORTS (data): the marsh's route posts reach the bed or the world's floor, the river's reed tufts too ================= */
export function marshSupports(L, T) {
  if (!L || !L.routeSupports) return L;
  const W = L.W, H = L.H, g = L.grid;
  for (const p of L.routeSupports) {
    if (p.kind === 'beam' || p.kind === 'pier') continue;
    let b = p.bottom; while (b < H && g[b * W + p.x] === T.AIR) b++;   /* the first thing under it - or the world's floor */
    if (!p.free && g[Math.min(H - 1, p.bottom) * W + p.x] === T.AIR) p.bottom = Math.min(b, H);
    if (!p.kind) p.kind = 'stilt';   /* the coast-town posts of the stages and the village boards: bog-oak stilts, lashed */
  }
  const have = new Set(L.routeSupports.map(p => p.x + ',' + p.y));
  for (const s of [{ x: 347, y: 14, bottom: 18, kind: 'stilt' }, { x: 348, y: 14, bottom: 18, kind: 'stilt' }]) if (!have.has(s.x + ',' + s.y)) L.routeSupports.push(s);   /* the reed tuft beside the ladder stands on the dam */
  return L;
}

/* ================= THE BULLFROG KING's EFFECTS (src/frog-king.js S.draw, main.js waves): art only, same footprints as before ================= */
/* THE BELLY-FLOP's shockwave: a crest of mud and water running along the ground, leaning the way it runs, spray over it, a wake behind */
export function flopCrest(g, x, y, dir, time) {
  const d = dir > 0 ? 1 : -1, wob = (time * 18) & 1;
  R(g, '#2a2018', x - 8, y - 3, 16, 3); R(g, '#3d3128', x - 7 + d, y - 6, 14, 3); R(g, '#5a4a3c', x - 5 + d * 2, y - 9, 10, 3); R(g, '#3d3128', x - 3 + d * 3, y - 11, 6, 2);   /* the mud heaved up, stepped, leaning ahead */
  R(g, '#7fc4e0', x - 4 + d * 3, y - 13, 8, 3); R(g, '#bfe6f5', x - 3 + d * 4, y - 14, 5, 2); R(g, '#ffffff', x - 1 + d * 5, y - 15, 3, 1);   /* the water thrown over its top */
  for (let i = 0; i < 5; i++) { const sxp = x + d * (2 + i * 2) + ((i * 5 + wob * 3) % 5) - 2, syp = y - 15 - ((i * 7 + (time * 30 | 0)) % 7); R(g, i & 1 ? '#ffffff' : '#bfe6f5', sxp, syp, 1, 1); }   /* spray */
  for (let i = 1; i <= 3; i++) R(g, i & 1 ? '#7fc4e0' : '#bfe6f5', x - d * (8 + i * 5), y - 1 - (i & 1), 5 - i, 1);   /* the wake, thinning */
}
/* THE CROAK RIPPLE: a clean ring of water standing up off the surface, foam on its lip, rings trailing */
export function rippleCrest(g, x, y, dir, a, time) {
  const d = dir > 0 ? 1 : -1; g.globalAlpha = Math.max(0.15, Math.min(1, a));
  R(g, '#3a6f8a', x - 3 + d, y - 10, 6, 10); R(g, '#7fc4e0', x - 2 + d, y - 11, 4, 9); R(g, '#bfe6f5', x - 1 + d * 2, y - 12, 3, 6); R(g, '#ffffff', x + d * 2, y - 13, 2, 2);
  for (let i = 1; i <= 4; i++) { const sp = i * 4; R(g, i & 1 ? '#bfe6f5' : '#7fc4e0', x - d * sp - 1, y - 7 + i, 2, 1); R(g, '#7fc4e0', x - d * sp - 2, y - 1, 4 - (i >> 1), 1); }
  if (((time * 14) | 0) & 1) { R(g, '#ffffff', x + d * 4, y - 9, 1, 1); R(g, '#ffffff', x - d * 1, y - 13, 1, 1); }
  g.globalAlpha = 1;
}
/* THE FLY SWARM: each fly a dark body with a flickering pair of wings, a thread of afterimage, a few motes round the cloud */
export function swarm(g, sw, cx, cy, time, orbit) {
  for (let i = 0; i < 12; i++) { const a = sw.ph + i * 2.39, rr = orbit * (0.5 + ((i * 37) % 10) / 20), fx = Math.round(sw.x + Math.cos(a) * rr - cx), fy = Math.round(sw.y + Math.sin(a * 1.3) * rr * 0.6 - cy), fl = ((time * 40 + i) | 0) & 1;
    const a2 = a - 0.5; R(g, 'rgba(26,26,20,0.35)', Math.round(sw.x + Math.cos(a2) * rr - cx), Math.round(sw.y + Math.sin(a2 * 1.3) * rr * 0.6 - cy), 1, 1);
    R(g, '#1a1a14', fx, fy, 2, 1); R(g, '#3a3a2c', fx, fy + 1, 1, 1); R(g, fl ? '#cfe8ff' : '#8fb0c8', fx + (fl ? 0 : 1), fy - 1, 1, 1); R(g, fl ? '#8fb0c8' : '#cfe8ff', fx + (fl ? 1 : 0), fy - 2, 1, 1); }
  for (let i = 0; i < 4; i++) { const a = -sw.ph * 0.6 + i * 1.57; R(g, 'rgba(143,209,96,0.6)', Math.round(sw.x + Math.cos(a) * orbit * 0.3 - cx), Math.round(sw.y + Math.sin(a) * orbit * 0.2 - cy), 1, 1); }
}
/* A TIPPED PAD: its far edge stands up out of the water (a wedge of leaf with the pale underside showing), water running off, the gold rim and the end it throws from */
export function tippedPad(g, m, cx, cy, time) {
  const x = Math.round(m.x - cx), y = Math.round(m.y - cy), w = m.w, d = m.tipDir > 0 ? 1 : -1, f = Math.sin(time * 18) > 0, ex = d > 0 ? x + w - 1 : x;
  for (let k = 0; k < 7; k++) { const hx = ex - d * k * 1; R(g, k < 2 ? '#d8e8a0' : '#9ac86a', hx, y - 2 - (6 - k), 1, 6 - k + 1); }   /* the lifted lip: pale underside, a leaf-green edge */
  R(g, '#2f6e50', ex - d * 3 + (d > 0 ? 0 : -1), y - 2, 4, 2);
  g.fillStyle = f ? '#ffd36b' : '#fff1a0'; g.fillRect(x - 1, y - 1, w + 2, 1); g.fillRect(x - 1, y + m.h, w + 2, 1); g.fillRect(d > 0 ? x + w - 3 : x, y - 4, 3, 3);
  for (let i = 0; i < 3; i++) R(g, '#bfe6f5', ex - d * (2 + i * 3), y + ((time * 14 + i * 3) % 5 | 0), 1, 2);   /* water running off the lifted edge */
}
