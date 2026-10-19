// lumber_trail_tiles.js - THE LUMBER TRAIL's tile kit, supports and dressing (claude/lumbertrailart). Art only: the grid is never read for anything but how a cell is DRAWN.
//   SOLID  the skid road's STUMP SLOPE (each step a sawn stump: pale ringed face, bark front) and its CORDUROY top (log ends in a course), the gully's wet rock, the ford's gravel,
//          the landing stone and the cliff's strata, the camp's trodden yard + sawpit shoring + LOG STACKS (end-on rounds), the hollow log's bark shell, the tarn's slate, the helm pit's stumps
//   ONEWAY every deck is a half-round LOG, lashed at the ends (never a plank)
//   cribs  the woodsman's CRIBWORK under every deck (alternating log courses); the hollow log's props are broken branch stubs
// Made from px.js primitives, 16x16, baked lazily and memoised.   lumberTile(t, x, y, at, T, L) -> a canvas for one cell, or null (the game's own kit draws it)
import { canvas, rect, mulberry } from '../px.js';
import { BARK, CUT, NEEDLE, ROPE, hash, woodsmanSprite, sawFrameSprite, tentSprite, logPileSprite } from './lumber_trail_art.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const P = (g, c, x, y) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const ROCK = ['#1b2024', '#2a3238', '#3e484f', '#566269', '#76858c', '#9db0b3'];
const MOSS = ['#25421d', '#386228', '#538a38', '#80b252'];
const EARTH = ['#33241a', '#52391f', '#755535', '#977450', '#b8956a'];
const tile = fn => { const [c, g] = canvas(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const col = fn(x, y); if (col) P(g, col, x, y); } return c; };
const inR = (x, y, x0, x1, y0, y1) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
const rnd = (a, b, m) => hash(a, b) % m;

/* ---- the level's zones (tile columns/rows of src/lumber-trail.js; art reads them, nothing else does) ---- */
const STEPS = [[65, 69, 21], [70, 74, 20], [75, 80, 19]];          /* the skid road's stump slope: x0, x1, top row */
const ROAD = [81, 104, 18];                                           /* the corduroy plateau */
const STACKS = [[240, 243, 15], [244, 246, 13]];                      /* the log stacks: x0, x1, top row (to row 16) */
const HELM = [[443, 446, 13], [448, 451, 13]];                        /* the helm pit's stumps (to row 16) */
const solid = (at, T, x, y) => at(x, y) === T.SOLID;

/* ===== a sawn stump (x0..x1 tiles wide) ===== */
function stumpTop(x, y, x0, x1, row, drowned) {
  return once('st' + x0 + '_' + x1 + '_' + (x - x0) + '_' + row + (drowned ? 'd' : ''), () => tile((px, py) => {
    const Wp = (x1 - x0 + 1) * 16, u = (x - x0) * 16 + px, cu = Wp / 2 - 0.5, rx = Wp / 2 - 0.4;
    if (row === 1) { /* the bark under the face, a ragged root fringe at its foot */
      const fringe = 9 + rnd(u, 3, 4) + (rnd(u >> 2, 9, 3) === 0 ? 2 : 0); if (py > fringe) return null;
      let sh = (u % 16) < 3 ? 5 : (u % 16) < 7 ? 4 : (u % 16) < 12 ? 3 : 2; if (rnd(u >> 1, 5, 7) === 0) sh--; if (py < 2) sh = Math.min(5, sh + 0); if (py > fringe - 2) sh = Math.max(1, sh - 1);
      return BARK[Math.max(1, sh)]; }
    const ex = (u - cu) / rx, ry = 4.6, cyc = 5.2; if (Math.abs(ex) > 1) return null;
    const half = ry * Math.sqrt(Math.max(0, 1 - ex * ex)), yt = cyc - half, yb = cyc + half;
    if (py < yt - 0.3) return null;
    if (py <= yb) { const d = Math.hypot(ex, (py - cyc) / ry); const ring = Math.floor(d * 6.5);
      if (d > 0.9) return drowned ? '#5a6a3a' : CUT[3]; if (d < 0.1) return CUT[4];
      let c = ring % 2 ? CUT[1] : CUT[0]; if (d > 0.62) c = ring % 2 ? CUT[2] : CUT[1];
      if (Math.abs(u - cu) < 0.7 && py < cyc) c = CUT[3];   /* a check running to the heart */
      if (drowned && (d > 0.5 || rnd(u, py, 4) === 0)) c = ring % 2 ? '#7a8a4a' : '#5a6a3a';
      return c; }
    const k = (u % 16) / 16; let sh = k < 0.2 ? 5 : k < 0.5 ? 4 : k < 0.8 ? 3 : 2; if (rnd(u >> 1, 11, 6) === 0) sh--; if (py > 14) sh = Math.max(1, sh - 1);
    if (u < 2 || u > Wp - 3) sh = Math.max(1, sh - 1);
    return BARK[Math.max(1, sh)];
  }));
}
/* ===== the corduroy road: a course of log ends along its face, a planed top ===== */
function roadTile(x, y, row) {
  return once('rd' + (x & 3) + '_' + row, () => tile((px, py) => {
    const u = x * 16 + px;
    if (row === 0 && py < 5) { if (py === 0) return '#d2a566'; if (py === 1) return '#b07e48'; if (py === 4) return BARK[1]; if (u % 11 === 0 || (u + 5) % 23 === 0) return BARK[1]; return rnd(u >> 1, py, 5) === 0 ? BARK[3] : BARK[4]; }
    const off = row === 1 ? 4 : 0, cc = ((u + off) % 8) - 3.5, cy0 = row === 0 ? 10.5 : 7.5;
    const d = Math.hypot(cc, py - cy0) / 4.2;
    if (d <= 1) { if (d > 0.84) return BARK[3]; if (d > 0.72) return BARK[1]; const ring = Math.floor(d * 4); return d < 0.12 ? CUT[4] : ring % 2 ? CUT[2] : CUT[1]; }
    if (row === 1 && py > 12) return rnd(u, py, 3) === 0 ? null : EARTH[1];
    return py < 5 && row === 0 ? BARK[1] : BARK[0];
  }));
}
/* ===== rock: strata, moss on a lit lip ===== */
function rockTile(x, y, top, eL, eR, ceil, wet) {
  return once('rk' + (x & 7) + '_' + (y & 7) + (top ? 't' : '') + (eL ? 'l' : '') + (eR ? 'r' : '') + (ceil ? 'c' : '') + (wet ? 'w' : ''), () => tile((px, py) => {
    const ax = x * 16 + px, ay = y * 16 + py; const band = (ay >> 2) + (rnd(ax >> 4, ay >> 4, 3)); let sh = 2 + (band % 3 === 0 ? 1 : 0) + (rnd(ax >> 1, ay, 9) === 0 ? 1 : 0) - (rnd(ax, ay >> 1, 13) === 0 ? 1 : 0);
    if (eL && px < 2) sh += 1; if (eR && px > 13) sh -= 1; if (ceil && py > 12) sh -= 1;
    if (ax % 13 === 5 && (ay >> 3) % 2 === 0) sh -= 1;   /* a joint */
    if (wet && rnd(ax, ay >> 2, 9) < 2) sh += 1;
    if (top) { const mh = 2 + rnd(ax, 3, 3); if (py < mh) return MOSS[py === 0 ? 3 : py === 1 ? 2 : 1]; if (py === mh) return MOSS[0]; }
    if (eR && px > 13) return ROCK[1]; return ROCK[Math.max(0, Math.min(5, sh))];
  }));
}
/* ===== river gravel and the tarn's slate bed ===== */
function gravelTile(x, y, top, dark) {
  return once('gv' + (x & 7) + '_' + y + (top ? 't' : '') + (dark ? 'd' : ''), () => tile((px, py) => {
    const ax = x * 16 + px, ay = y * 16 + py, cell = (Math.floor(ax / 3) + Math.floor(ay / 3) * 7) ; const h = hash(Math.floor(ax / 3), Math.floor(ay / 3)) % 6;
    let c = dark ? ['#1c262a', '#26343a', '#2e3e45', '#3a4d54', '#4a5f67', '#5a7078'][h] : ['#5e5a4e', '#6e6a5c', '#7c7766', '#8a8573', '#98927e', '#a8a38c'][h];
    if ((ax + ay * 2) % 5 === 0) c = dark ? '#16201f' : '#3a3730';
    if (top && py < 2) c = dark ? '#34454c' : '#a9a48e'; return c;
  }));
}
/* ===== the camp's yard: trodden earth with wood chips and a dust of sawdust ===== */
function yardTile(x, y, top, pit, eL, eR) {
  return once('yd' + (x & 7) + (top ? 't' : '') + (pit ? 'p' : '') + (eL ? 'l' : '') + (eR ? 'r' : ''), () => tile((px, py) => {
    const ax = x * 16 + px, ay = y * 16 + py; let sh = 2 + (rnd(ax >> 1, ay >> 1, 5) === 0 ? 1 : 0) - (rnd(ax, ay, 11) === 0 ? 1 : 0) + (py < 3 ? 1 : 0);
    if (top) { if (py === 0) return pit ? '#efdca8' : '#c8a86e'; if (py < 3) return rnd(ax, py, 3) === 0 ? CUT[1] : (pit ? '#d8bc84' : EARTH[4]); }
    if (rnd(ax >> 2, ay >> 1, 17) === 0 && py < 6) return rnd(ax, ay, 2) ? CUT[0] : CUT[2];   /* a chip */
    if (eL && px < 2) sh += 1; if (eR && px > 13) sh -= 1; return EARTH[Math.max(0, Math.min(4, sh))];
  }));
}
/* ===== shoring: vertical split planks, lashed at the top ===== */
function shoreTile(x, y, side) {
  return once('sh' + side + (x & 1) + (y & 1), () => tile((px, py) => {
    const pl = Math.floor(px / 4), lit = px % 4; let sh = lit === 0 ? 5 : lit === 3 ? 2 : 3 + (pl & 1); if (rnd(pl, y, 5) === 0 && py % 9 < 2) sh = 1; if (py === 0) return ROPE[1]; if (py === 1) return ROPE[0];
    return BARK[Math.max(1, Math.min(5, sh))];
  }));
}
/* ===== the log stacks: end-on rounds, hex-packed, a lashed binder on top ===== */
function stackTile(x, y, top, eL, eR) {
  return once('sk' + (x & 1) + (y & 1) + (top ? 't' : '') + (eL ? 'l' : '') + (eR ? 'r' : ''), () => tile((px, py) => {
    if (top && py < 3) { if (py === 0) return '#d2a566'; return py === 2 ? BARK[1] : BARK[4]; }
    const ay = py + (top ? -3 : 0), off = ((ay + 16) >> 3) % 2 ? 4 : 0, cc = ((px + off) % 8) - 3.5, cyy = (ay % 8) - 3.5, d = Math.hypot(cc, cyy) / 4.1;
    if (d <= 1) { if (d > 0.84) return BARK[3]; if (d > 0.72) return BARK[1]; const ring = Math.floor(d * 4); return d < 0.14 ? CUT[4] : ring % 2 ? CUT[2] : CUT[1]; }
    return BARK[0];
  }));
}
/* ===== the hollow log: a bark shell, its inner roof dark and rotten, the cut ends ringed ===== */
function logTile(x, y, row, eL, eR) {
  return once('hl' + (x & 7) + row + (eL ? 'l' : '') + (eR ? 'r' : ''), () => tile((px, py) => {
    const u = x * 16 + px;
    if (eL || eR) { const cxe = eL ? 9 : 6, d = Math.hypot((px - cxe) / 8.5, (py - 8) / 9); if (row === 0 && py < 2 && d > 0.9) return null;
      if (d <= 1) { if (d > 0.88) return BARK[1]; const ring = Math.floor(d * 5); return d < 0.12 ? CUT[4] : ring % 2 ? CUT[2] : CUT[1]; } }
    if (row === 0) { if (py < 2) return py === 0 ? MOSS[rnd(u, 3, 4) === 0 ? 3 : 2] : MOSS[1]; if (py === 2) return BARK[5]; }
    if (row === 2) { if (py > 10) { const rag = 11 + rnd(u, 7, 4); if (py > rag) return null; return BARK[0]; } const g = rnd(u >> 1, py >> 1, 6); return g === 0 ? '#3a2a1a' : g < 3 ? '#2a1c10' : '#1d130a'; }
    /* weathered grey-brown bark, its ridges running along the log */
    const WB = ['#2a2018', '#3d2e21', '#54402c', '#6f563a', '#8c7050'], ay = py + row * 16, ridge = (ay + Math.floor(rnd(u >> 5, 3, 3))) % 5;
    let sh = 2 + (row === 0 ? 1 : 0); if (ridge === 0) sh = 0 + 1; else if (ridge === 1) sh = 3; if (rnd(u >> 2, ay >> 1, 8) === 0 && ridge !== 0) sh++; if (rnd(u >> 3, ay, 5) === 0 && ridge === 0) return WB[0];
    if (row === 1 && py > 12) sh--; if (rnd(u >> 4, 41, 6) === 0 && row === 1 && px < 5 && py > 3 && py < 10) return WB[0];   /* a knot */
    return WB[Math.max(0, Math.min(4, sh))];
  }));
}
/* ===== a deck: a half-round log, lashed at its ends ===== */
function deckTile(x, y, l, r) {
  return once('dk' + (x & 3) + (l ? 'l' : '') + (r ? 'r' : ''), () => tile((px, py) => {
    if (py > 8) return null; const u = x * 16 + px;
    let col; if (py === 0) col = '#d6a96a'; else if (py === 1) col = BARK[6]; else if (py <= 3) col = BARK[5]; else if (py <= 5) col = BARK[4]; else if (py === 6) col = BARK[3]; else if (py === 7) col = BARK[2]; else col = BARK[0];
    if (py > 1 && py < 8 && rnd(u >> 1, py, 9) === 0) col = BARK[Math.max(1, ['#1c120a'].length ? 3 : 3)];
    if (py >= 2 && py <= 6 && rnd(u >> 2, 53, 14) === 0 && (u & 3) < 3) col = BARK[1];
    if (!l && px < 4) { const d = Math.hypot((px - 4) / 4.6, (py - 4.5) / 4.6); if (d > 1) return null; if (d > 0.82) return BARK[2]; const ring = Math.floor(d * 4); col = d < 0.15 ? CUT[4] : ring % 2 ? CUT[2] : CUT[1]; }
    if (!r && px > 11) { const d = Math.hypot((px - 11) / 4.6, (py - 4.5) / 4.6); if (d > 1) return null; if (d > 0.82) return BARK[1]; const ring = Math.floor(d * 4); col = d < 0.15 ? CUT[4] : ring % 2 ? CUT[2] : CUT[3]; }
    if (!l && (px === 5 || px === 6)) col = px === 5 ? ROPE[2] : ROPE[0];   /* the lashing: a wrap of rope at each end */
    if (!r && (px === 9 || px === 10)) col = px === 9 ? ROPE[1] : ROPE[0];
    return col;
  }));
}

/* ===== THE ENTRY: lumberTile ===== */
export function lumberTile(t, x, y, at, T, L) {
  if (t === T.ONEWAY) { if (x >= 510) return null; return deckTile(x, y, at(x - 1, y) === T.ONEWAY, at(x + 1, y) === T.ONEWAY); }
  if (t !== T.SOLID) return null;
  const up = at(x, y - 1), dn = at(x, y + 1), lft = at(x - 1, y), rgt = at(x + 1, y);
  const topEx = up !== T.SOLID && up !== T.CRATE && !(T.SLOPE_L !== undefined && up === T.SLOPE_L), ceil = dn === T.AIR || dn === T.ONEWAY, eL = lft === T.AIR || lft === T.ONEWAY || lft === T.SPIKE, eR = rgt === T.AIR || rgt === T.ONEWAY || rgt === T.SPIKE;
  /* THE SKID ROAD: a stump slope, then the corduroy */
  if (x >= 65 && x <= 104) {
    for (const [a, b, tr] of STEPS) if (x >= a && x <= b) { if (y === tr && topEx) return stumpTop(x, y, a, b, 0); if (y === tr + 1 && at(x, tr - 1) !== T.SOLID) return stumpTop(x, y, a, b, 1); return null; }
    if (x >= ROAD[0] && x <= ROAD[1]) { if (y === ROAD[2] && topEx) return roadTile(x, y, 0); if (y === ROAD[2] + 1) return roadTile(x, y, 1); return null; }
  }
  /* THE GULLY: wet rock */
  if (x >= 26 && x <= 37 && y >= 23 && y <= 27) return rockTile(x, y, topEx && x >= 27 && x <= 36, eL, eR, ceil, true);
  /* THE FORD: shingle under the shallows, the landing stone, the deep pool's bed, the drowned stump, the sawdust hollow and its shoring */
  if (x >= 112 && x <= 126 && y >= 25 && y <= 27) return gravelTile(x, y, y === 25, false);
  if (x >= 127 && x <= 129 && y >= 22) return rockTile(x, y, topEx, eL, eR, ceil, true);
  if (x >= 145 && x <= 146 && y >= 23 && y <= 26) { if (y === 23) return stumpTop(x, y, 145, 146, 0, true); if (y === 24) return stumpTop(x, y, 145, 146, 1, true); return gravelTile(x, y, false, true); }
  if (x >= 130 && x <= 146 && y === 27) return gravelTile(x, y, false, true);
  if (x >= 152 && x <= 156 && y === 24 && topEx) return yardTile(x, y, true, true, false, false);
  if ((x === 151 || x === 157) && (y === 23 || y === 24)) return shoreTile(x, y, x === 151 ? 1 : 2);
  /* THE CAMP: trodden yard, the pit's shoring, the log stacks */
  for (const [a, b, tr] of STACKS) if (x >= a && x <= b && y >= tr && y <= 16) return stackTile(x, y, y === tr, x === a, x === b);
  if (x >= 206 && x <= 276 && y === 17 && topEx) return yardTile(x, y, true, false, eL, eR);
  if (x >= 228 && x <= 236 && y === 19 && topEx) return yardTile(x, y, true, true, false, false);
  if ((x === 227 || x === 237) && (y === 18 || y === 19) && !(y === 19 && x === 237 && false)) return shoreTile(x, y, x === 227 ? 1 : 2);
  /* THE CLIFF (277-300) and the cave dug into its foot (the woodsmen's store) */
  if (x >= 277 && x <= 300 && y >= 12 && y <= 27) { if (y === 17 && x <= 285 && topEx) return yardTile(x, y, true, true, false, false); return rockTile(x, y, false, eL, eR, ceil, false); }
  /* THE CREW'S DEN: its floor and roof */
  if (x >= 325 && x <= 334 && y === 17 && topEx) return yardTile(x, y, true, false, false, false);
  /* THE HOLLOW LOG */
  if (x >= 353 && x <= 385 && y >= 11 && y <= 13) return logTile(x, y, y - 11, x === 353, x === 385);
  if (x >= 350 && x <= 351 && y >= 14 && y <= 16) { if (y === 14 && topEx) return stumpTop(x, y, 350, 351, 0); if (y === 15) return stumpTop(x, y, 350, 351, 1); return null; }
  /* THE HIVE KNOLL: rock the honey has run down */
  if (x >= 483 && x <= 492 && y === 8) return rockTile(x, y, true, eL, eR, false, false);
  /* THE TARN: slate */
  if (x >= 416 && x <= 429 && y >= 14 && y <= 27) { if (y >= 23 && x >= 417 && x <= 428) return gravelTile(x, y, y === 23, true); return rockTile(x, y, topEx && x === 417, eL, eR, ceil, true); }
  /* THE HELM PIT: two big stumps over the thorns */
  for (const [a, b, tr] of HELM) if (x >= a && x <= b && y >= tr && y <= 16) { if (y === tr) return stumpTop(x, y, a, b, 0); if (y === tr + 1) return stumpTop(x, y, a, b, 1); return stumpTop(x, y, a, b, 1); }
  return null;
}

/* ===== CRIBWORK (supports): alternating log courses; a hollow-log prop is a broken branch stub ===== */
const SH = { c: [BARK[3], BARK[5], BARK[1], CUT[1]] };
export function drawCrib(g, p, cx, cy) {
  const x = Math.round(p.x * 16 + 8 - cx), y0 = Math.round(p.y * 16 + 10 - cy), y1 = Math.round(p.bottom * 16 - cy), len = y1 - y0; if (len < 3) return;
  if (p.post) {   /* a squared timber prop under a cave's roof beam: a cap, bolts, a footing */
    R(g, BARK[0], x - 4, y0 - 3, 8, 1); R(g, BARK[3], x - 4, y0 - 2, 9, 3); R(g, BARK[5], x - 4, y0 - 2, 9, 1);
    R(g, BARK[3], x - 3, y0, 6, len - 3); R(g, BARK[5], x - 3, y0, 2, len - 3); R(g, BARK[2], x, y0, 1, len - 3); R(g, BARK[1], x + 2, y0, 1, len - 3);
    for (let y = y0 + 8; y < y1 - 8; y += 14) { R(g, BARK[1], x - 3, y, 6, 1); P(g, '#a8b0b8', x - 2, y + 3); P(g, '#a8b0b8', x + 1, y + 3); }
    R(g, BARK[2], x - 5, y1 - 3, 11, 3); R(g, BARK[4], x - 5, y1 - 3, 11, 1); return; }
  if (p.x >= 353 && p.x <= 385 && p.y >= 12 && p.y <= 14) {   /* the fallen giant rests on its own snapped limbs: a gnarled dead bough, forked under the log, splayed at the foot */
    const wob = yy => Math.round(Math.sin((yy + p.x * 3) / 9) * 1.2);
    for (let yy = y0; yy < y1; yy++) { const xx = x + wob(yy), fork = yy - y0 < 8 ? (8 - (yy - y0)) : 0, foot = y1 - yy < 6 ? (6 - (y1 - yy)) : 0;
      R(g, BARK[3], xx - 2 - fork, yy, 5 + fork * 2, 1); P(g, BARK[5], xx - 2 - fork, yy); R(g, BARK[1], xx + 2 + fork, yy, 1 + (foot ? 1 : 0), 1); if (foot) R(g, BARK[2], xx - 3 - foot, yy, foot, 1); }
    for (let yy = y0 + 10; yy < y1 - 10; yy += 12) { const d = (yy >> 2) % 2 ? 1 : -1; R(g, BARK[2], x + d * 3, yy, 4, 2); R(g, CUT[2], x + d * 7 - (d < 0 ? 0 : 0), yy, 1, 2); }
    return; }
  /* a pier of cribwork: a wide course, a narrow end-on course, alternating; log ends ringed */
  const half = 6, top = y0; let k = 0;
  for (let y = y1 - 6; y > top - 6; y -= 6, k++) {
    if (y + 6 > y1) continue;
    if (k % 2 === 0) { R(g, BARK[3], x - half, y, half * 2, 6); R(g, BARK[5], x - half, y, half * 2, 1); R(g, BARK[1], x - half, y + 5, half * 2, 1); R(g, CUT[1], x - half, y + 1, 2, 4); P(g, CUT[0], x - half, y + 1); R(g, CUT[2], x + half - 2, y + 1, 2, 4); }
    else { R(g, BARK[2], x - 4, y, 8, 6); R(g, BARK[4], x - 4, y, 8, 1); R(g, CUT[1], x - 3, y + 1, 6, 4); P(g, CUT[3], x, y + 3); P(g, CUT[0], x - 3, y + 1); R(g, BARK[0], x - 4, y + 5, 8, 1); } }
  R(g, BARK[2], x - half - 2, y1 - 3, half * 2 + 4, 3); R(g, BARK[4], x - half - 2, y1 - 3, half * 2 + 4, 1); R(g, BARK[0], x - half - 2, y1 - 1, half * 2 + 4, 1);   /* the sill log */
}

/* ===== DRESSING: the dark of the store and the den, their props and lamps, the hollow log's tunnel ===== */
export function dress(decor, lights, L, at, T) {
  const dark = (x0, x1, y0, y1, a) => { const w = (x1 - x0 + 1) * 16, h = (y1 - y0 + 1) * 16, [c, g] = canvas(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const e = Math.min(x, w - 1 - x) / 10; const k = Math.min(1, e); g.globalAlpha = Math.min(0.9, a * (0.62 + 0.38 * k)); P(g, '#0c0806', x, y); } g.globalAlpha = 1; decor.push({ k: 'rock', bg: true, x: x0 * 16, y: y0 * 16, c }); };
  const prop = (x, y, c, bg = true) => decor.push({ k: 'rock', bg, x, y, c });
    const beam = (x0, x1, y) => { const w = (x1 - x0 + 1) * 16, [c, g] = canvas(w, 7); R(g, BARK[2], 0, 0, w, 6); R(g, BARK[5], 0, 0, w, 1); R(g, BARK[1], 0, 5, w, 1); for (let x = 5; x < w - 4; x += 12) R(g, BARK[1], x, 3, 3, 1); prop(x0 * 16, y * 16, c); };
  /* the cabin's woodsman, the camp's saw frame over the pit, a tent and the firewood pile: set on their floors (dressing, so the level's data is untouched) */
  { const wm = woodsmanSprite(0); prop(13 * 16 + 8 - 12, 22 * 16 - 30, wm, false); const sf = sawFrameSprite(); prop(230 * 16 + 8 - 36, 19 * 16 - 52, sf); const tn = tentSprite(); prop(221 * 16 + 8 - 28, 17 * 16 - 36, tn); const lp = logPileSprite(); prop(251 * 16 + 8 - 28, 17 * 16 - 34, lp); }
  /* the woodsmen's store: dark, shored, a lantern, a tool rack and a barrel at the back */
  dark(277, 285, 14, 16, 0.8); beam(277, 285, 13);
  { const [c, g] = canvas(8, 22); R(g, BARK[0], 3, 0, 1, 6); R(g, '#1c120a', 1, 6, 5, 1); R(g, '#ffd36b', 1, 7, 5, 6); R(g, '#fff2b0', 2, 8, 3, 3); R(g, '#1c120a', 1, 13, 5, 1); prop(283 * 16, 14 * 16 - 1, c, false); lights.push({ x: 283 * 16 + 4, y: 14 * 16 + 12, r: 46, torch: true }); }
  { const [c, g] = canvas(40, 26); R(g, BARK[2], 0, 4, 40, 3); for (const [x, h] of [[4, 10], [12, 14], [22, 11], [30, 15]]) { R(g, BARK[4], x, 7, 2, h); R(g, '#8a929a', x - 2, 7 + h - 3, 7, 3); R(g, '#c4ccd4', x - 2, 7 + h - 3, 7, 1); } prop(278 * 16, 15 * 16 - 10, c); }
  { const [c, g] = canvas(20, 24); R(g, BARK[3], 1, 2, 18, 22); R(g, BARK[5], 1, 2, 3, 22); R(g, BARK[1], 15, 2, 4, 22); R(g, '#3c424a', 0, 6, 20, 2); R(g, '#3c424a', 0, 17, 20, 2); R(g, BARK[0], 3, 0, 14, 3); R(g, BARK[2], 4, 0, 12, 1); prop(283 * 16, 16 * 16 - 8, c); }
  /* the crew's den: bone, rope and a charm, a cold fire */
  dark(325, 334, 14, 16, 0.7); beam(325, 334, 13);
  { const [c, g] = canvas(14, 22); R(g, ROPE[1], 6, 0, 1, 9); R(g, '#d8d0c0', 3, 9, 8, 6); R(g, '#a8a090', 3, 14, 8, 1); R(g, '#2a1c14', 4, 11, 2, 2); R(g, '#2a1c14', 8, 11, 2, 2); R(g, '#7a3a8a', 5, 15, 4, 6); R(g, '#a85ab8', 5, 15, 4, 1); prop(329 * 16 + 1, 14 * 16, c, false); }
  { const [c, g] = canvas(28, 12); for (const [x, y, w] of [[2, 9, 8], [12, 7, 10], [6, 4, 8]]) { R(g, BARK[2], x, y, w, 3); R(g, CUT[1], x, y, 2, 3); } R(g, '#3a3028', 4, 10, 18, 2); R(g, '#8a8478', 8, 9, 4, 1); prop(331 * 16 - 4, 17 * 16 - 11, c); }
  /* the hollow log's tunnel: its far wall, dim and wet, a shaft of light at each end */
  { const x0 = 353, x1 = 385; dark(x0, x1, 14, 16, 0.78); }
  /* the gully's trickle: a thread of water down the bed between the rocks, and the stones it has rounded */
  { const w = 8 * 16, [c, g] = canvas(w, 10); for (let x = 0; x < w; x++) { const y = 5 + Math.round(Math.sin(x / 9) * 1.4); g.globalAlpha = 0.85; R(g, '#5a8aa0', x, y, 1, 2); g.globalAlpha = 1; if (x % 6 < 2) P(g, '#c8e6ee', x, y); }
    for (const [x, r] of [[10, 3], [44, 4], [78, 3], [110, 4]]) { R(g, '#6a747a', x, 8 - r, r * 2 + 1, r); R(g, '#8a969c', x + 1, 8 - r, r, 1); R(g, '#3a4248', x, 7, r * 2 + 1, 1); } prop(29 * 16, 27 * 16 - 8, c); }
  /* tarn: nothing in the grid; the bed's lost purse is a coin pile */
}
