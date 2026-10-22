// fen_road_art.js - THE FEN ROAD's art pass (claude/fenroadart, SONNET over the greybox claude/fenroad). ART ONLY: the grid is read for how a cell is DRAWN, never changed; no hitbox,
// timer or number lives here. The troll and the stilt-walker are in bog_troll_art.js / stilt_walker_art.js.
//   THE BOARDWALK KIT   sound planks (split-log boards on lashed pole stringers, nailed, tally-marked), rotten ones (the bowed sections, the crossing's), stilt decks, the crew's fresh-laid boards,
//                       lashings (a stake, hemp coils, a rope to the boards, a frayed stub when cut), driven piles (the crew gaps), lashed log cribs (the lookout steps, the crew's landing),
//                       the barricade (road-planks on end, roped, stakes), the peat trench (cut turves)
//   SUPPORTS            every plank run over the fen stands on bents: driven piles into the water/peat with a cap beam, lashings, a green waterline (visible-supports clears)
//   THE FEN             reed stands + cattails, peat stacks, drying racks, scum + bubbles + a sick green sheen on the biting water, low mist wisps
//   THE HORIZON         the Stockade's palisade grown on the skyline (stakes, rails, two horn towers, smoke), and the gate arrival at the crossing's east end
// Palette: a cold, wet green-brown (peat, bog oak, hemp, weed), the goblins' red cloth.
import { canvas, outline } from '../px.js';
import * as FNB from './fen_backdrop.js'; import * as FSA from './fen_site_art.js';   /* (claude/fenroad2art) the fen's reflections and its heron */

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };
const rnd = (a, b, m) => hash(a, b) % m;
const P = (g, c, x, y) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
const Rr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const tileOf = fn => { const [c, g] = canvas(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const col = fn(x, y); if (col) P(g, col, x, y); } return c; };
const ROAD = 18, WATER = 19, BED = 23;
/* the fen's own colours */
export const OAK = ['#16110b', '#241a10', '#3a2c1c', '#54402a', '#735a3a', '#947a52'];       /* bog oak / peat-black timber, dark -> pale */
export const BOARD = ['#2a2014', '#3e3020', '#5a4630', '#745c3e', '#92784e'];                  /* the boards: old, grey-brown, wet */
export const FRESH = ['#6a4c2c', '#8c6a40', '#b08a5a', '#c9a672', '#e0c490'];                  /* a crew's new-cut planks */
export const ROPE = '#c9b27c', ROPE_D = '#8e7a52', ROPE_L = '#e4d29a';
export const MOSS = ['#1f3322', '#2f4a26', '#4a6a34', '#6f8f4a'];
export const PEAT = ['#150f0a', '#241912', '#352418', '#4a3322', '#5f4630', '#7a5c3c'];
export const RED = '#8f2f28', REDL = '#c24a3c';

/* ================= THE TILE KIT ================= */
const POSTS = (L) => { if (L._frPiles) return L._frPiles; const s = new Set(); for (const e of L.ents) if (e.t === 'crewgap') for (const p of e.piles || []) s.add(p); return (L._frPiles = s); };
const CRIBS = [[228, 231, 16], [232, 234, 14], [235, 237, 12], [238, 240, 10]];   /* x0, x1, top row: the lookout steps */
const LANDING = [195, 200, 18];                                                   /* the crew's landing behind the barricade */
const TRENCH = [36, 53, 20];                                                      /* the peat cutting: x0, x1, top row */
const inRange = (r, x, y) => x >= r[0] && x <= r[1] && y >= r[2];

/* a SOUND board of the boardwalk: split-log boards, seams, nails, a lit lip; over the water it stands on a pole stringer lashed with hemp (air = open below) */
function plankTile(x, y, at, T, L, kind) {
  const air = at(x, y + 1) === T.AIR, edgeL = at(x - 1, y) !== T.PLANK && at(x - 1, y) !== T.ONEWAY, edgeR = at(x + 1, y) !== T.PLANK && at(x + 1, y) !== T.ONEWAY;
  const deck = kind === 'deck';   /* a stilt deck (ONEWAY): narrower, cleaner, no mark */
  return once('pl' + kind + (x & 7) + (edgeL ? 1 : 0) + (edgeR ? 1 : 0) + (air ? 1 : 0) + (y & 3), () => tileOf((px, py) => {
    const u = x * 16 + px, v = (x * 7 + y * 3) & 7;
    if (py === 0) { if (edgeL && px < 1 || edgeR && px > 14) return null; return rnd(u, 1, 11) === 0 ? MOSS[2] : rnd(u, 2, 5) === 0 ? BOARD[4] : BOARD[3]; }   /* the lit lip */
    if (py >= 1 && py <= 3) {
      if (edgeL && px === 0 || edgeR && px === 15) return OAK[1];
      const seam = ((u + (py > 2 ? 0 : 0)) % 9) === 8; if (seam) return OAK[1];
      if ((u % 9) === 1 && py === 2) return OAK[0];                                                  /* a nail head */
      if ((u % 9) === 6 && py === 1 && rnd(x, y, 3) === 0) return OAK[0];
      if (py === 1) return rnd(u, 2, 5) === 0 ? BOARD[3] : BOARD[2];
      if (py === 3) return BOARD[1];
      if (!deck && v === 2 && px >= 3 && px <= 6 && py === 2) return RED;                           /* a goblin tally mark: a red stroke */
      if (!deck && v === 2 && px >= 3 && px <= 6 && py === 3) return RED;
      return rnd(u, py, 6) === 0 ? BOARD[1] : (rnd(u, 3, 9) === 0 ? BOARD[3] : BOARD[2]);
    }
    if (py === 4) return OAK[0];
    if (py === 5 || py === 6) {   /* the stringer: a pole under the boards, lashed */
      if (!air) return py === 5 ? OAK[2] : OAK[1];
      if ((px === 3 || px === 4 || px === 11 || px === 12) && (x + (px > 8 ? 1 : 0)) % 2 === 0) return py === 5 ? ROPE : ROPE_D;   /* a hemp binding */
      return py === 5 ? OAK[4] : OAK[2];
    }
    if (py === 7 && air) return OAK[0];
    if (air && py >= 8 && py <= 10 && ((px * 5 + x * 3) % 9 === 0 || (px + x) % 13 === 3) && py <= 8 + rnd(u, 9, 3)) return MOSS[(py + px) & 1 ? 1 : 2];   /* weed hanging from the stringer */
    return null;
  }));
}
/* a bowed-section / rotten board sprite (also used live by the hands): the same board, sicker (soft, split, mossy), with a worn hollow */
const rotBoard = (arena, i, w) => once('rb' + arena + (i % 3) + (i === 0 ? 'L' : i === w - 1 ? 'R' : ''), () => { const [c, g] = canvas(16, 9);
  const b = arena ? ['#1f1a10', '#2e261a', '#443826', '#5a4a32', '#72603f'] : ['#2a2014', '#3a2e1e', '#54422c', '#6c563a', '#86704a'];
  Rr(g, b[2], 0, 1, 16, 4); Rr(g, b[3], 0, 0, 16, 1); Rr(g, b[1], 0, 5, 16, 2); Rr(g, OAK[0], 0, 7, 16, 1);   /* board, lit lip, the underside, the stringer shadow */
  Rr(g, OAK[3], 0, 5, 16, 2); Rr(g, OAK[2], 0, 6, 16, 1);                                                      /* the pole under it */
  for (let k = 0; k < 4; k++) { const sx = 2 + ((i * 5 + k * 4) % 12); P(g, b[0], sx, 1 + (k & 1)); P(g, b[0], sx + 1, 2 + (k & 1)); }   /* cracks */
  for (let k = 0; k < 3; k++) { const mx = (i * 7 + k * 6) % 14; Rr(g, MOSS[1 + (k & 1)], mx, 0, 2 + (k & 1), 1); if (arena) Rr(g, MOSS[2], mx, 1, 2, 1); }   /* moss patches (the crossing's are thick) */
  if (!arena) for (const bx of [4, 5]) P(g, OAK[0], (bx + i * 3) % 14, 3);                                      /* nail heads gone rusty */
  P(g, OAK[0], 8, 1); P(g, OAK[0], 8, 2); P(g, OAK[0], 8, 3);                                                   /* a seam */
  if (i === 0) { Rr(g, ROPE, 0, 5, 3, 1); Rr(g, ROPE_D, 0, 6, 3, 1); }                                         /* the lashing round each end */
  if (i === w - 1) { Rr(g, ROPE, 13, 5, 3, 1); Rr(g, ROPE_D, 13, 6, 3, 1); }
  return c; });
export const rottenBoard = rotBoard;
/* THE CREW'S FRESH-LAID BOARD: pale new wood, bright nail heads, sawdust on it */
const freshBoard = () => once('fresh', () => { const [c, g] = canvas(16, 9); Rr(g, FRESH[2], 0, 1, 16, 4); Rr(g, FRESH[4], 0, 0, 16, 1); Rr(g, FRESH[0], 0, 5, 16, 1); Rr(g, FRESH[1], 0, 4, 16, 1); Rr(g, OAK[3], 0, 5, 16, 2); Rr(g, OAK[1], 0, 7, 16, 1);
  for (const x of [3, 12]) { P(g, '#3a2818', x, 2); P(g, '#e0e0e0', x - 1, 1); } for (let k = 0; k < 6; k++) P(g, FRESH[4], 1 + rnd(k, 3, 14), 1 + (k & 1));   /* nails, sawdust */
  Rr(g, FRESH[1], 8, 1, 1, 3); Rr(g, ROPE, 0, 5, 2, 1); Rr(g, ROPE, 14, 5, 2, 1); return c; });

/* a DRIVEN PILE standing alone in the water (a crew gap's pile): two lashed logs, a flat cap board, a hemp wrap, a green waterline; the tile carries 16 px of its length */
function pileTile(x, y, at, T) {
  const top = at(x, y - 1) !== T.SOLID, waterline = y === WATER;
  return once('pile' + (top ? 1 : 0) + (waterline ? 1 : 0) + (y & 3) + (x & 3), () => tileOf((px, py) => {
    if (px < 2 || px > 13) return null;
    if (top) { if (py < 2) return px >= 1 && px <= 14 ? (py === 0 ? BOARD[4] : BOARD[2]) : null; if (py === 2) return OAK[0]; if (py === 3 && (px === 4 || px === 5 || px === 10 || px === 11)) return ROPE; if (py === 4 && (px === 4 || px === 5 || px === 10 || px === 11)) return ROPE_D; }
    if (px >= 3 && px <= 12) {
      if (px === 3 || px === 12) return OAK[1];
      if (px === 7 || px === 8) return OAK[0];                                              /* the gap between the two logs */
      const lit = px === 4 || px === 9; const base = lit ? OAK[4] : px < 8 ? OAK[3] : OAK[2];
      if ((py + (x & 1) * 3) % 8 === 3 && (px === 5 || px === 10)) return OAK[1];           /* a bark scar */
      if (waterline && py > 4) return MOSS[(px + py) & 1 ? 1 : 2];                          /* the green waterline */
      if (y >= WATER + 1 && rnd(px, y * 16 + py, 5) === 0) return MOSS[1];
      return base;
    }
    return null;
  }));
}
/* a LASHED LOG CRIB (the lookout's steps; the crew's landing): horizontal logs course on course, round cut ends at the corners, hemp lashings down the face, a plank deck on top */
function cribTile(x, y, at, T, R) {   /* R = [x0, x1, top] */
  const top = y === R[2], edgeL = x === R[0], edgeR = x === R[1], under = y >= WATER + 1;
  return once('cr' + (top ? 1 : 0) + (edgeL ? 1 : 0) + (edgeR ? 1 : 0) + (under ? 1 : 0) + (x & 3) + (y & 1), () => tileOf((px, py) => {
    const u = x * 16 + px;
    if (top && py < 3) { if (edgeL && px < 1 || edgeR && px > 14) return null; if (py === 0) return rnd(u, 5, 7) === 0 ? MOSS[2] : BOARD[3]; if (py === 1) return u % 9 === 8 ? OAK[1] : BOARD[2]; return OAK[1]; }   /* the deck planks on top */
    const yy = top ? py - 3 : py, course = (yy + 4) >> 3, cy = (yy + 4) & 7;   /* two courses of logs (8 px each) */
    if (top && py < 3) return null;
    if (edgeL && px < 3) return cy === 0 || cy === 7 ? OAK[0] : px === 0 ? OAK[0] : px === 1 ? OAK[3] : (course & 1) ? '#c9a672' : '#b08a5a';   /* the round cut end of a log: a dark ring, pale wood */
    if (edgeR && px > 12) return cy === 0 || cy === 7 ? OAK[0] : px === 15 ? OAK[0] : px === 14 ? OAK[3] : (course & 1) ? '#b08a5a' : '#c9a672';
    if (cy === 0) return OAK[0]; if (cy === 7) return OAK[1];
    if (cy === 1) return under ? OAK[3] : OAK[5];                                           /* the lit top of the log */
    if (cy === 2) return under ? OAK[2] : OAK[4];
    if (rnd(u, yy, 17) === 0) return OAK[1];                                                 /* bark scars */
    if ((px === 6 || px === 7) && (yy & 8) === 0 && !top) return px === 6 ? ROPE : ROPE_D;     /* a hemp lashing down the face */
    if (under && rnd(px, y * 16 + py, 4) === 0) return MOSS[1];
    return cy < 5 ? OAK[3] : OAK[2];
  }));
}
/* the PEAT CUTTING: cut peat turves in strata (brick-like blocks), roots, a wet gloss, a spade-marked top */
function peatTile(x, y, at, T, mode = 'cut') {
  const top = at(x, y - 1) !== T.SOLID && at(x, y - 1) !== T.PLANK, sedge = mode === 'bank' && top, mud = mode === 'bed';
  const wallL = at(x - 1, y) === T.AIR && !top, wallR = at(x + 1, y) === T.AIR && !top;
  return once('pt' + mode + (top ? 1 : 0) + (wallL ? 1 : 0) + (wallR ? 1 : 0) + ((x * 3 + y) & 3), () => tileOf((px, py) => {
    const u = x * 16 + px, v = y * 16 + py;
    if (sedge) { if (py === 0) return rnd(u, 3, 3) === 0 ? PEAT[3] : MOSS[2 + (rnd(u, 8, 3) === 0 ? 1 : 0)]; if (py === 1) return rnd(u, 4, 3) === 0 ? MOSS[1] : (rnd(u, 7, 4) === 0 ? PEAT[3] : MOSS[2]); if (py === 2) return rnd(u, 5, 3) === 0 ? PEAT[2] : MOSS[1]; if (py === 3) return rnd(u, 6, 3) === 0 ? PEAT[1] : PEAT[2]; }
    if (mud) { const w = rnd(u, v, 7); if (top && py < 2) return py === 0 ? '#4a4a34' : '#33301f'; return w === 0 ? '#4a4630' : w < 3 ? '#26231a' : '#1d1b14'; }
    if (top) { if (py === 0) return rnd(u, 3, 6) === 0 ? '#5b6a3a' : PEAT[3]; if (py === 1) return rnd(u, 4, 4) === 0 ? PEAT[4] : PEAT[2]; if (py === 2 && rnd(u, 5, 7) === 0) return '#9fb3a6'; /* a puddle glint */ }
    if (mode !== 'cut') {   /* the fen's ground: dark peat, mottled, faint strata, roots - no cut blocks */
      const n = rnd(u + (v >> 1) * 3, v >> 1, 24), strata = (v % 7 === 3 && rnd(u >> 3, v, 3) !== 0);
      if (wallL && px < 2 || wallR && px > 13) return y > WATER ? MOSS[n & 1 ? 0 : 1] : PEAT[1];
      if (strata) return PEAT[1]; if (n === 0) return '#3a5a2a'; if (n < 3) return PEAT[1]; if (n < 7) return PEAT[3]; if (n === 7) return PEAT[4]; return PEAT[2]; }
    const brick = ((v >> 2) & 1) ? 0 : 3, bx = (u + brick) % 7, by = v % 4;
    if (by === 3) return PEAT[0];                                                              /* the cut between turves */
    if (bx === 6) return PEAT[1];
    if (bx === 0 && by === 0) return PEAT[5];                                                  /* a lit corner */
    if (rnd(u, v, 19) === 0) return '#6a4a2a';                                                  /* a root */
    if (rnd(u, v, 23) === 0) return '#3a5a2a';
    if (wallL && px < 2) return PEAT[0]; if (wallR && px > 13) return PEAT[0];
    return rnd(u, v, 5) < 2 ? PEAT[2] : PEAT[3];
  }));
}
export function tile(t, x, y, at, T, L) {
  if (t === T.PLANK) return plankTile(x, y, at, T, L, 'plank');
  if (t === T.ONEWAY) return plankTile(x, y, at, T, L, 'deck');
  if (t !== T.SOLID) return null;
  if (y >= ROAD && at(x - 1, y) === T.AIR && at(x + 1, y) === T.AIR && POSTS(L).has(x) && y < BED) return pileTile(x, y, at, T);
  for (const R of CRIBS) if (x >= R[0] && x <= R[1] && y >= R[2] && y < BED) return cribTile(x, y, at, T, R);
  if (x >= LANDING[0] && x <= LANDING[1] && y >= LANDING[2] && y < BED) return cribTile(x, y, at, T, LANDING);
  if (x === 195 && y === 17) return cribTile(x, y, at, T, [195, 195, 17]);
  if (inRange(TRENCH, x, y) && x <= TRENCH[1] && y >= TRENCH[2] && y <= 24) return peatTile(x, y, at, T, 'cut');
  if (y > WATER && at(x, y - 1) === T.AIR && y >= BED) return peatTile(x, y, at, T, 'bed');   /* the bed under the fen: silt */
  if (y >= BED) return peatTile(x, y, at, T, 'bed');
  return peatTile(x, y, at, T, 'bank');   /* every other bit of ground is the fen's own: peat under a mat of sedge */
}

/* ================= SUPPORTS: BENTS OF DRIVEN PILES UNDER EVERY RUN OVER THE FEN ================= */
export const FEN_KINDS = new Set(['fenpile']);
/* a post under a plank run that nothing else holds: down to the first thing under it; kind 'fenpile' is drawn by drawPile (route-art.js) */
export function addSupports(L, T) {
  if (!L || !L.grid || !L.fenroad) return L;
  const W = L.W, H = L.H, g = L.grid; L.routeSupports = L.routeSupports || [];
  const near = (x0, x1, y) => L.routeSupports.some(p => p.x >= x0 - 1 && p.x <= x1 + 1 && p.y >= y - 1 && p.y <= y + 1 && p.bottom > y + 3);
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W;) {
    const t = g[y * W + x];
    if (t === T.AIR || t === T.NET || g[(y + 1) * W + x] !== T.AIR) { x++; continue; }
    let x1 = x; while (x1 + 1 < W && g[y * W + x1 + 1] !== T.AIR && g[y * W + x1 + 1] !== T.NET && g[(y + 1) * W + x1 + 1] === T.AIR) x1++;
    let air = 0; while (y + 1 + air < H && g[(y + 1 + air) * W + x] === T.AIR) air++;
    if (air >= 3 && (t === T.PLANK || t === T.ONEWAY || t === T.SOLID) && !near(x, x1, y)) {
      const xs = []; for (let q = x; q <= x1; q += 4) xs.push(q); if (xs[xs.length - 1] !== x1) xs.push(x1);
      for (const px of xs) { let b = y + 1; while (b < H && g[b * W + px] === T.AIR) b++; L.routeSupports.push({ x: px, y, bottom: Math.min(b, H), kind: 'fenpile', fen: true }); }
    }
    x = x1 + 1;
  }
  return L;
}
/* one pile: the bent under a board - a log with a cap beam under the deck, hemp lashings, a green waterline, wet and dark below it; p = { x, y (the board's row), bottom } in tiles */
export function drawPile(g, p, cx, cy) {
  const x = Math.round(p.x * 16 + 6 - cx), y0 = Math.round(p.y * 16 + 5 - cy), y1 = Math.round(p.bottom * 16 - cy), wl = Math.round(WATER * 16 - cy);
  if (x < -12 || x > g.canvas.width + 12 || y1 < 0 || y0 > g.canvas.height) return;
  const ya = Math.max(y0, -2), yb = Math.min(y1, g.canvas.height + 2), side = (p.x & 1) ? 0 : 1;
  /* the cap beam across the pile's head, under the boards */
  Rr(g, OAK[3], x - 4, y0, 12, 2); Rr(g, OAK[5], x - 4, y0, 12, 1); Rr(g, OAK[0], x - 4, y0 + 2, 12, 1);
  /* the log: lit left, dark right, 4 px wide */
  for (let yy = ya + 3; yy < yb; yy++) { const under = yy >= wl, dk = (yy + p.x) % 7 === 0;
    P(g, under ? OAK[3] : OAK[5], x, yy); P(g, under ? OAK[2] : OAK[4], x + 1, yy); P(g, dk ? OAK[0] : under ? OAK[1] : OAK[2], x + 2, yy); P(g, OAK[0], x + 3, yy); }
  Rr(g, ROPE, x - 1, y0 + 3, 6, 1); Rr(g, ROPE_D, x - 1, y0 + 4, 6, 1);                                          /* the hemp lashing under the cap */
  if (y1 - y0 > 28) { Rr(g, ROPE, x - 1, y0 + 14, 6, 1); Rr(g, ROPE_D, x - 1, y0 + 15, 6, 1); }
  /* a brace to the next bent every other pile: a leaning pole */
  if (side && y1 - y0 > 20) { for (let k = 0; k < 14; k++) { P(g, OAK[3], x + 4 + k, y0 + 6 + (k >> 1)); P(g, OAK[2], x + 4 + k, y0 + 7 + (k >> 1)); } }
  /* the waterline: weed collared round the pile, a pale tide mark */
  if (wl > ya && wl < yb) { Rr(g, MOSS[1], x - 1, wl - 2, 6, 3); Rr(g, MOSS[2], x, wl - 2, 2, 1); P(g, MOSS[0], x + 4, wl + 1); P(g, MOSS[3], x - 1, wl - 3); P(g, MOSS[3], x + 4, wl - 3); }
  /* the foot, sunk into the peat bed: a splayed driven end */
  if (y1 < g.canvas.height + 4) { Rr(g, OAK[1], x - 1, y1 - 3, 6, 3); Rr(g, PEAT[2], x - 2, y1 - 1, 8, 2); }
}

/* ================= THE HANDS' PIECES (src/fen-road-hands.js calls these; the logic stays there) ================= */
const sx = (x, cx) => Math.round(x - cx), sy = (y, cy) => Math.round(y - cy);
/* one board of a bowed / rotten section at screen (x, y): the section's own sprite, over its pole stringer; a = alpha; wreck = a board the troll burst round (tilted, splintered) */
export function drawBoard(g, x, y, i, w, arena, a = 1, wreck = false) {
  const s = rottenBoard(arena, i, w); g.globalAlpha = a;
  if (wreck) { g.save(); g.translate(x + 8, y + 4); g.rotate((i & 1 ? 1 : -1) * 0.16); g.drawImage(s, -8, -4); g.restore(); P(g, OAK[0], x + 3, y - 1); P(g, BOARD[4], x + 4, y - 2); P(g, BOARD[3], x + 11, y - 1); }
  else g.drawImage(s, x, y);
  g.globalAlpha = 1;
}
/* A BOARD THE CREW JUST LAID: drops in from a hand's height */
export function drawLaid(g, x, y, age) { const d = Math.max(0, 1 - age / 0.22), s = freshBoard(); g.drawImage(s, x, y - Math.round(d * 7)); if (age < 0.5) { g.globalAlpha = 0.6 * (1 - age * 2); Rr(g, '#e8dcc0', x + 2, y - 1 - Math.round(d * 7), 12, 1); g.globalAlpha = 1; } }
/* THE LASHING: a driven stake with hemp coils and a red rag, the rope to the section's near board; cut = the rope parted, a frayed stub; glint = a body stands on the section (strike NOW) */
export function drawLashing(g, x, yb, ex, ey, cut, glint, time) {
  const w = Math.sin(time * 5 + x * 0.1) > 0 ? 1 : 0;
  /* the stake: 4 px, lit left, a pointed head, a pale cut ring at the top */
  Rr(g, OAK[3], x - 2, yb - 17, 4, 17); Rr(g, OAK[5], x - 2, yb - 17, 1, 17); Rr(g, OAK[1], x + 1, yb - 17, 1, 17); Rr(g, OAK[4], x - 1, yb - 18, 2, 1); Rr(g, '#c9a672', x - 1, yb - 19, 2, 1);
  P(g, OAK[0], x - 1, yb - 9); P(g, OAK[0], x, yb - 4);
  /* a red rag knotted under the head, stirring */
  Rr(g, RED, x + 2, yb - 15, 3, 1); Rr(g, REDL, x + 2, yb - 16, 2, 1); Rr(g, RED, x + 5, yb - 14 + w, 2, 1); P(g, REDL, x + 4, yb - 15);
  /* the foot: a heap of stones/peat round it */
  Rr(g, PEAT[3], x - 4, yb - 2, 8, 2); Rr(g, PEAT[5], x - 3, yb - 3, 4, 1); P(g, '#9a9a8a', x + 2, yb - 3);
  if (!cut) {
    for (const yy of [yb - 12, yb - 9, yb - 6]) { Rr(g, ROPE, x - 3, yy, 6, 1); Rr(g, ROPE_D, x - 3, yy + 1, 6, 1); P(g, ROPE_L, x - 2, yy); }   /* three hemp coils */
    P(g, ROPE_D, x + 3, yb - 8); P(g, ROPE_D, x + 3, yb - 7);                                                                                          /* the knot's tail */
    const x0 = x + 3, y0 = yb - 9, n = Math.max(8, Math.abs(ex - x0) >> 1);   /* the rope to the section: a taut sagging line */
    for (let k = 0; k <= n; k++) { const t = k / n, px = Math.round(x0 + (ex - x0) * t), py = Math.round(y0 + (ey - y0) * t + Math.sin(t * Math.PI) * 3); P(g, ROPE, px, py); P(g, ROPE_D, px, py + 1); }
    if (glint && Math.floor(time * 6) % 2) { Rr(g, '#ffd36b', x - 2, yb - 23, 3, 3); Rr(g, '#fff6e0', x - 1, yb - 26, 1, 7); }
  } else { Rr(g, ROPE, x + 2, yb - 10, 2, 1); P(g, ROPE_D, x + 3, yb - 9); P(g, ROPE, x + 4 + w, yb - 9); P(g, ROPE_D, x + 4, yb - 8); P(g, ROPE, x - 3, yb - 8); P(g, ROPE_D, x - 4, yb - 7); }   /* frayed ends */
}
/* THE BARRICADE: one cell (16x16) of road-planks stood on end and roped, the top one sharpened; mark = the goblins' red X; foot = this cell rests on the boards */
export function drawBarricadeCell(g, x, y, top, mark, foot) {
  const pl = [BOARD[3], BOARD[2], BOARD[4], BOARD[2]];
  for (let k = 0; k < 4; k++) { const px = x + k * 4;
    Rr(g, pl[k], px, y, 3, 16); Rr(g, OAK[1], px + 3, y, 1, 16); Rr(g, BOARD[4], px, y, 1, 16);
    if (top) { const cut = k % 2 ? 4 : 2; Rr(g, BOARD[0], px, y, 3, cut); Rr(g, '#8a6c46', px + (k < 2 ? 1 : 0), y + cut, 2, 1); g.clearRect(px, y, 1 + (k & 1), cut - 1); P(g, BOARD[4], px + 1, y + cut - 1); }
    P(g, OAK[0], px + 1, y + 5 + k); P(g, OAK[0], px + 2, y + 9 - k); }
  for (const yy of [y + 3, y + 11]) { Rr(g, ROPE, x, yy, 16, 1); Rr(g, ROPE_D, x, yy + 1, 16, 1); P(g, ROPE_L, x + 3, yy); P(g, ROPE_L, x + 10, yy); P(g, ROPE_D, x + 7, yy - 1); }
  if (mark) { for (let k = 0; k < 6; k++) { P(g, RED, x + 5 + k, y + 5 + k); P(g, RED, x + 10 - k, y + 5 + k); } P(g, REDL, x + 5, y + 5); P(g, REDL, x + 10, y + 5); }
  if (foot) { Rr(g, OAK[0], x, y + 15, 16, 1); }
}
/* THE ARM OUT OF THE FEN (something under the road): a mossy forearm, weed trailing, four claws, dripping; k 0..1 how far up, (x, y) the water line under it */
export function drawArm(g, x, y, k, time) {
  const h = Math.round(10 + k * 30), c = ['#262a1a', '#3c3e28', '#5a5c3a', '#7a7e4a', '#9ca662'];
  g.save(); g.beginPath(); g.rect(x - 30, y - 80, 60, 80); g.clip();
  Rr(g, c[1], x - 6, y - h, 12, h); Rr(g, c[2], x - 5, y - h, 9, h); Rr(g, c[3], x - 5, y - h, 3, h); Rr(g, c[4], x - 5, y - h, 1, h - 4);
  Rr(g, PEAT[2], x - 2, y - h + 8, 6, 3); Rr(g, PEAT[3], x - 1, y - h + 8, 3, 1);                                  /* a smear of peat */
  Rr(g, MOSS[1], x - 7, y - h + 12, 2, 12); Rr(g, MOSS[2], x + 5, y - h + 6, 2, 10); Rr(g, MOSS[0], x - 7, y - h + 22, 1, 6);   /* weed trailing off it */
  Rr(g, c[1], x - 9, y - h - 7, 18, 8); Rr(g, c[2], x - 8, y - h - 7, 15, 7); Rr(g, c[3], x - 8, y - h - 7, 6, 2);   /* the great knuckled fist */
  for (let i = 0; i < 4; i++) { const fx = x - 9 + i * 5, fy = y - h - 13 - (i === 1 || i === 2 ? 2 : 0) + (i === 0 ? 4 : 0); Rr(g, c[1], fx, fy, 4, 7); Rr(g, c[2], fx, fy, 3, 6); Rr(g, '#cfc8a8', fx + 1, fy - 1, 2, 2); P(g, '#fff', fx + 1, fy - 1); }   /* four fingers, pale claws */
  if (Math.floor(time * 8) % 2) { P(g, '#cfe0d0', x - 8, y - h + 6); P(g, '#cfe0d0', x + 7, y - h + 20); }                 /* drips */
  g.restore();
  g.globalAlpha = 0.9; Rr(g, '#e6efe6', x - 12, y - 2, 24, 1); Rr(g, '#cfe0d0', x - 9, y - 3, 6, 1); Rr(g, '#cfe0d0', x + 3, y - 3, 5, 1); g.globalAlpha = 1;   /* a foam ring round it */
}

/* ================= THE HORIZON: THE STOCKADE'S PALISADE, GROWING ================= */
const mix = (a, b, k) => { const pa = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
const SKYB = 12;   /* k buckets */
/* the whole palisade baked at bucket b (0..SKYB): stakes with pointed heads, two rails, a gate arch, two horn towers with thatched roofs; haze colours far, dark brown near */
function skyline(b) {
  return once('sky' + b, () => { const k = b / SKYB, w = Math.round(90 + k * 260), sh = Math.round(5 + k * 22), th = sh + 10 + Math.round(k * 10), H = th + 26, [c, g] = canvas(w, H);
    const far = '#7a8678', near = '#3a382c', col = mix(far, near, k), colD = mix('#68746a', '#28261e', k), colL = mix('#8a9686', '#544e3c', k), rail = mix('#6a766a', '#241e16', k), base = H - 1;
    /* the stakes: 3 px wide on a 4 px pitch, heights jittering, the head cut to a point; a lit left edge */
    for (let x = 0; x < w - 2; x += 4) { const hh = sh + ((x * 7 + 3) % 5) - 2; Rr(g, col, x, base - hh, 3, hh); Rr(g, colL, x, base - hh, 1, hh); Rr(g, colD, x + 2, base - hh, 1, hh); P(g, col, x + 1, base - hh - 1); P(g, colL, x + 1, base - hh - 2 + (x & 4 ? 1 : 0)); }
    Rr(g, rail, 0, base - Math.round(sh * 0.7), w, 1); Rr(g, rail, 0, base - Math.round(sh * 0.3), w, 1);          /* two lashed rails */
    Rr(g, colD, 0, base - 1, w, 2);
    /* the gate: a dark arch between two taller posts, a lintel */
    if (k > 0.35) { const gx = Math.round(w * 0.5), gw = 10 + Math.round(k * 8), gh = sh + 4; Rr(g, colD, gx - gw / 2, base - gh, gw, gh); Rr(g, mix(colD, '#000000', 0.4), gx - gw / 2 + 2, base - gh + 3, gw - 4, gh - 3); Rr(g, col, gx - gw / 2 - 2, base - gh - 2, gw + 4, 3); Rr(g, colL, gx - gw / 2 - 2, base - gh - 2, gw + 4, 1); for (const q of [-1, 1]) { Rr(g, col, gx + q * (gw / 2 + 1) - 1, base - gh - 6, 3, gh + 6); P(g, colL, gx + q * (gw / 2 + 1) - 1, base - gh - 6); } }
    /* the two horn towers: a boxed lookout on a tall frame, a thatched pyramid roof, a flag staff */
    for (const f of [0.17, 0.82]) { const tx = Math.round(w * f), tw = 5 + Math.round(k * 4), tt = th;
      Rr(g, col, tx - tw, base - tt, tw * 2 + 1, tt); Rr(g, colL, tx - tw, base - tt, 1, tt); Rr(g, colD, tx + tw, base - tt, 1, tt); Rr(g, rail, tx - tw, base - Math.round(tt * 0.5), tw * 2 + 1, 1);
      Rr(g, colD, tx - tw - 2, base - tt - 2, tw * 2 + 5, 3); Rr(g, rail, tx - tw - 2, base - tt - 2, tw * 2 + 5, 1);
      Rr(g, mix(colD, '#000000', 0.3), tx - tw + 1, base - tt - 6, tw * 2 - 1, 4);
      for (let r = 0; r < 4; r++) Rr(g, r & 1 ? colD : col, tx - tw - 1 + r, base - tt - 7 - r, tw * 2 + 3 - r * 2, 1);
      Rr(g, rail, tx, base - tt - 14, 1, 7); }
    /* (claude/fenroad2art) the camp growing behind the wall: hide-and-thatch tent roofs and a long lodge peeking over the stakes, a second row of taller sharpened stakes, once it is near enough to see */
    if (k > 0.3) { for (const f of [0.27, 0.36, 0.46, 0.56, 0.66, 0.74]) { const rx = Math.round(w * f), rh = 6 + Math.round(k * 8) + ((rx * 7) % 4), rw = 5 + Math.round(k * 5); for (let r = 0; r < rh; r++) Rr(g, r < 2 ? colL : colD, rx - Math.round(rw * (1 - r / rh)), base - sh - rh + r + 1, Math.round(rw * (1 - r / rh)) * 2, 1); Rr(g, rail, rx, base - sh - rh - 2, 1, 3); } }
    if (k > 0.55) { for (let x = 2; x < w - 2; x += 8) { const hh = sh + 5 + ((x * 5) % 4); Rr(g, colD, x, base - hh, 2, hh - sh + 1); P(g, colD, x, base - hh - 1); } }
    /* smoke from the camp behind: two soft grey plumes */
    if (k > 0.25) for (const f of [0.38, 0.62]) { for (let q = 0; q < 6; q++) { g.globalAlpha = 0.26 - q * 0.03; Rr(g, '#aab4a6', Math.round(w * f) + (q & 1) * 2 - 1, base - sh - 2 - q * 3 - Math.round(k * 4), 3 + q, 3); } g.globalAlpha = 1; }
    return c; });
}
export function drawSky(g, cx, cy, VW, VH, time, k) {
  const b = Math.max(0, Math.min(SKYB, Math.round(k * SKYB))), s = skyline(b), kk = b / SKYB;
  const base = Math.round(VH * 0.62 - kk * 18), x0 = Math.round(VW * (0.9 - 0.35 * kk) - s.width / 2);
  g.globalAlpha = 0.5 + 0.4 * kk; g.drawImage(s, x0, base - s.height + 1);
  /* (claude/fenroad2art) its fires: a warm flicker at the gate, a torch at the head of each tower, a haze of light over the camp (it is evening in the fen) */
  if (kk > 0.28) { const a = Math.min(1, (kk - 0.28) * 2.4), gx = x0 + Math.round(s.width * 0.5), gy = base - Math.round(5 + kk * 22) - 2, fl = 0.7 + 0.3 * Math.sin(time * 9) * Math.sin(time * 3.1);
    g.globalAlpha = 0.16 * a * fl; Rr(g, '#ffb44a', gx - 18, gy - 12, 36, 24); g.globalAlpha = 0.28 * a * fl; Rr(g, '#ffb44a', gx - 8, gy - 6, 16, 12); g.globalAlpha = a; Rr(g, '#ffd36b', gx - 5, gy - 2, 1, 2); Rr(g, '#ffd36b', gx + 4, gy - 2, 1, 2); Rr(g, '#ff9a3c', gx - 5, gy - 1, 1, 1); Rr(g, '#ff9a3c', gx + 4, gy - 1, 1, 1);
    for (const f of [0.17, 0.82]) { const tx = x0 + Math.round(s.width * f), th = Math.round(5 + kk * 22) + 10 + Math.round(kk * 10); g.globalAlpha = 0.5 * a * fl; Rr(g, '#ffb44a', tx - 3, base - th - 4, 8, 6); g.globalAlpha = a; Rr(g, '#ffd36b', tx + 1, base - th - 2, 2, 2); } g.globalAlpha = 1; }
  /* the pennants on the towers, stirring */
  for (const f of [0.17, 0.82]) { const tx = x0 + Math.round(s.width * f), th = Math.round(5 + kk * 22) + 10 + Math.round(kk * 10), py = base - th - 14, w = Math.floor(time * 3 + f * 9) % 2;
    Rr(g, '#8f2f28', tx + 1, py, 4 + w, 2); Rr(g, '#c24a3c', tx + 1, py, 3, 1); P(g, '#8f2f28', tx + 5 + w, py + 2); }
  g.globalAlpha = 1;
}

/* ================= THE FEN: reeds, cattails, peat stacks, mooring posts; the biting water ================= */
function reedSprite(v) {
  return once('reed' + v, () => { const [c, g] = canvas(24, 34), n = 7 + (v & 3), gr = ['#243a22', '#34522a', '#4a6a34', '#6f8f4a']; const rng = (i, m) => rnd(v * 31 + i, 7, m);
    for (let i = 0; i < n; i++) { const x0 = 3 + Math.round(i * 18 / n) + rng(i, 2), h = 14 + rng(i + 9, 18), lean = rng(i + 3, 5) - 2, col = gr[1 + (i & 1) + (i % 3 === 0 ? 1 : 0)];
      for (let y = 0; y < h; y++) { const xx = x0 + Math.round(lean * y / h); P(g, col, xx, 33 - y); if (y < h * 0.5 && (i & 1)) P(g, gr[0], xx + 1, 33 - y); }
      if (i % 3 === 1) { const xx = x0 + lean; Rr(g, '#5a3a1e', xx - 1, 33 - h - 1, 2, 5); Rr(g, '#8a5a30', xx - 1, 33 - h - 1, 1, 5); P(g, '#c9a672', xx, 33 - h - 2); }   /* a cattail head */
      else { P(g, gr[3], x0 + lean, 33 - h); P(g, gr[2], x0 + lean + 1, 33 - h + 1); } }
    return c; });
}
const peatStack = () => once('peatstack', () => { const [c, g] = canvas(32, 18);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6 - r; i++) { const x = 2 + r * 3 + i * 5, y = 17 - (r + 1) * 4; Rr(g, PEAT[2], x, y, 5, 4); Rr(g, PEAT[4], x, y, 5, 1); Rr(g, PEAT[0], x + 4, y, 1, 4); Rr(g, PEAT[1], x, y + 3, 5, 1); P(g, '#3a5a2a', x + 2, y + 1); }
  Rr(g, '#8a7a4a', 6, 0, 18, 2); for (let i = 0; i < 9; i++) P(g, '#a8925c', 7 + i * 2, 2 + (i & 1)); return outline(c, '#120c08'); });   /* a stack of cut turves under a straw cap */
const rack = () => once('rack', () => { const [c, g] = canvas(30, 22);
  Rr(g, OAK[3], 1, 4, 3, 18); Rr(g, OAK[3], 26, 4, 3, 18); Rr(g, OAK[4], 1, 4, 1, 18); Rr(g, OAK[4], 26, 4, 1, 18); Rr(g, OAK[3], 0, 3, 30, 3); Rr(g, OAK[5], 0, 3, 30, 1); Rr(g, OAK[3], 0, 12, 30, 2);
  for (let i = 0; i < 6; i++) { Rr(g, PEAT[2], 4 + i * 4, 6, 3, 6); Rr(g, PEAT[4], 4 + i * 4, 6, 1, 6); Rr(g, PEAT[2], 5 + i * 4, 14, 3, 6); Rr(g, PEAT[0], 7 + i * 4, 14, 1, 6); }
  Rr(g, ROPE, 1, 6, 3, 1); Rr(g, ROPE, 26, 6, 3, 1); return outline(c, '#120c08'); });   /* a drying rack of turves */
const mooring = () => once('moor', () => { const [c, g] = canvas(12, 24);
  Rr(g, OAK[3], 4, 6, 4, 18); Rr(g, OAK[5], 4, 6, 1, 18); Rr(g, OAK[1], 7, 6, 1, 18); Rr(g, '#c9a672', 4, 5, 4, 1);
  for (const y of [14, 17]) { Rr(g, ROPE, 3, y, 6, 1); Rr(g, ROPE_D, 3, y + 1, 6, 1); }
  Rr(g, RED, 8, 8, 3, 1); Rr(g, REDL, 8, 7, 2, 1); P(g, RED, 11, 9);
  Rr(g, OAK[2], 0, 8, 5, 1); Rr(g, '#a86a2a', 0, 9, 3, 3); Rr(g, '#ffd36b', 1, 10, 1, 1); return outline(c, '#120c08'); });   /* a mooring post, a hemp coil, a red rag, a hung lantern */
/* scenery placed once per level: reeds in the water between piles, on the banks; mooring posts where the road leaves a bank; peat stacks + racks at the cutting */
function layout(L, T) {
  if (L._frDress) return L._frDress; const out = [], W = L.W, g = L.grid, at = (x, y) => g[y * W + x];
  for (const p of L.pools || []) if (p.fen) { const x0 = Math.floor(p.x0 / 16), x1 = Math.floor(p.x1 / 16) - 1;
    for (let x = x0; x <= x1; x++) if (rnd(x, 41, 5) === 0 && (at(x, BED) === T.SOLID || at(x, BED - 1) === T.SOLID) && at(x, ROAD + 1) === T.AIR) out.push({ k: 'reedW', x: x * 16 + 8 + rnd(x, 3, 7) - 3, v: rnd(x, 5, 8) }); }
  for (let x = 1; x < W - 1; x++) {
    if (at(x, ROAD) === T.PLANK && at(x - 1, ROAD) === T.SOLID && at(x - 1, ROAD - 1) === T.AIR) out.push({ k: 'moor', x: (x - 1) * 16 + 4 });
    if (at(x, ROAD) === T.PLANK && at(x + 1, ROAD) === T.SOLID && at(x + 1, ROAD - 1) === T.AIR) out.push({ k: 'moor', x: (x + 1) * 16 + 2, flip: true });
    if (at(x, ROAD - 1) === T.AIR && at(x, ROAD) === T.SOLID && rnd(x, 17, 6) === 0 && (at(x - 1, ROAD) === T.SOLID || at(x + 1, ROAD) === T.SOLID)) out.push({ k: 'reedB', x: x * 16 + 8, v: rnd(x, 9, 8) });
  }
  out.push({ k: 'stack', x: 34 * 16 }, { k: 'rack', x: 54 * 16 }, { k: 'stack', x: 56 * 16 + 20 }); L._frDress = out.sort((a, b) => a.x - b.x); return L._frDress;
}
/* BEHIND THE TILES */
export function drawBack(g, L, cx, cy, time, T, px = -1e9) {
  FNB.drawHeron(g, cx, cy, time, px); FSA.drawSites(g, L, cx, cy, time, T);   /* (claude/fenroad2art) the crews' work sites: lamp posts, sawhorses, pile drivers, half-built pilings, braziers, banners */
  const d = layout(L, T), VW = g.canvas.width, wl = WATER * 16 - cy;
  for (const o of d) { const X = o.x - cx; if (X < -40 || X > VW + 40) continue;
    if (o.k === 'reedW') { const s = reedSprite(o.v); g.globalAlpha = 0.85; g.drawImage(s, Math.round(X - 12), wl - 30 + (o.v & 3) - 4); g.globalAlpha = 1; }   /* standing in the fen, a head of it clear of the water */
    else if (o.k === 'reedB') { const s = reedSprite(o.v); g.drawImage(s, Math.round(X - 12), (ROAD * 16 - cy) - 33); }
    else if (o.k === 'moor') { const s = mooring(); if (o.flip) { g.save(); g.translate(Math.round(X) + 12, 0); g.scale(-1, 1); g.drawImage(s, 0, (ROAD * 16 - cy) - 22); g.restore(); } else g.drawImage(s, Math.round(X), (ROAD * 16 - cy) - 22); }
    else if (o.k === 'stack') g.drawImage(peatStack(), Math.round(X), ROAD * 16 - cy - 18)
    else if (o.k === 'rack') g.drawImage(rack(), Math.round(X), ROAD * 16 - cy - 22); }
}
/* THE BITING WATER, over the water's surface: a sick scum skin, bubbles rising, a green sheen, low mist wisps */
const scumStrip = () => once('scum', () => { const [c, g] = canvas(96, 5);
  for (let x = 0; x < 96; x++) { const h = rnd(x, 1, 7); if (h < 3) { P(g, '#6a7a2a', x, 1 + (h & 1)); if (h === 0) P(g, '#8a9a3a', x, 0); } if (rnd(x, 2, 9) === 0) P(g, '#4a3a1e', x, 2 + (x & 1)); if (rnd(x, 3, 13) === 0) { P(g, '#9a8a4a', x, 1); P(g, '#9a8a4a', x + 1, 1); } }
  return c; });
const wisp = () => once('wisp', () => { const [c, g] = canvas(160, 14); for (let i = 0; i < 160; i++) { const h = 3 + Math.round(3 * Math.sin(i * 0.11) + 2 * Math.sin(i * 0.31 + 1)); for (let y = 0; y < h; y++) { g.globalAlpha = 0.08 + 0.07 * (1 - y / h); P(g, '#dfe8dc', i, 7 + y - (h >> 1)); } } g.globalAlpha = 1; return c; });
export function drawWater(g, L, cx, cy, time, T) {
  const VW = g.canvas.width;
  for (const p of L.pools || []) { if (!p.fen || p.x1 < cx || p.x0 > cx + VW) continue;
    const x0 = Math.max(p.x0, cx) - cx, x1 = Math.min(p.x1, cx + VW) - cx, y = p.y - cy, bot = (p.bottom !== undefined ? p.bottom : p.y + 64) - cy;
    g.save(); g.beginPath(); g.rect(x0, y - 8, x1 - x0, bot - y + 8); g.clip();
    if (!p.peat) FNB.drawReflections(g, cx, cy, VW, g.canvas.height, time, (L.H * 16 - g.canvas.height) - cy, x0, x1, y);   /* (claude/fenroad2art) the cypress doubled in the murk */
    /* the sheen: a faint toxic green in the top of the water */
    if (!p.peat) { g.globalAlpha = 0.09; g.fillStyle = '#8a9a2a'; g.fillRect(x0, y, x1 - x0, Math.min(34, bot - y)); g.globalAlpha = 1; }
    /* the scum skin drifting on the surface */
    if (!p.peat) { const s = scumStrip(), sc = ((time * 2.2 - cx * 0.25) % 96 + 96) % 96; g.globalAlpha = 0.75; for (let X = x0 - 96 + sc; X < x1; X += 96) g.drawImage(s, Math.round(X), y - 1); g.globalAlpha = 1; }
    /* bubbles rising from the bed, popping at the surface */
    const n0 = Math.floor((cx + x0) / 28), n1 = Math.floor((cx + x1) / 28);
    for (let n = n0; n <= n1; n++) { if (rnd(n, 61, 3) !== 0) continue; const ph = ((time * 0.35 + rnd(n, 63, 100) / 100) % 1), bx = n * 28 + rnd(n, 65, 24) - cx, by = bot - 4 - ph * (bot - y - 4);
      if (bx < x0 || bx > x1) continue; g.globalAlpha = 0.55 * (1 - ph * 0.4); P(g, '#cfe0d0', bx, by); P(g, '#e6efe6', bx - 1, by - 1); if (ph > 0.9) { P(g, '#e6efe6', bx - 2, y - 1); P(g, '#e6efe6', bx + 2, y - 1); } g.globalAlpha = 1; }
    g.restore();
    /* mist wisps lying on the water, two layers at different speeds */
    const w = wisp(); for (const [sp, dy] of [[4, -6], [7, -1]]) { const so = ((-(cx * 0.3) - time * sp) % 160 + 160) % 160; for (let X = x0 - 160 + so; X < x1; X += 160) g.drawImage(w, Math.round(X), y + dy - 6); }
  }
}

/* ================= THE STOCKADE'S GATE: THE ARRIVAL (behind the exit gate at the crossing's east end) ================= */
const gateWall = () => once('gatewall', () => { const W = 150, H = 132, [c, g] = canvas(W, H), base = H - 1;
  const L = ['#7a5e3c', '#5a4228', '#3a2a1a', '#241a10', '#9a7a4e'];
  /* the palisade: logs 8 px wide, pointed heads, heights jittering, lit left / dark right, bark scars, a pale cut ring on each head */
  for (let x = 0; x < 112; x += 8) { const hh = 90 + ((x * 5 + 3) % 4) * 3; const top = base - hh;
    Rr(g, L[1], x, top + 4, 8, hh - 4); Rr(g, L[0], x, top + 4, 2, hh - 4); Rr(g, L[2], x + 6, top + 4, 2, hh - 4); Rr(g, L[3], x + 7, top + 4, 1, hh - 4); Rr(g, L[4], x, top + 4, 1, hh - 4);
    Rr(g, L[1], x + 1, top + 2, 6, 2); Rr(g, L[0], x + 1, top + 2, 2, 2); Rr(g, L[1], x + 2, top, 4, 2); Rr(g, '#c9a672', x + 3, top, 2, 1); Rr(g, L[3], x + 3, top - 1, 2, 1);
    for (let k = 0; k < 5; k++) { P(g, L[3], x + 2 + (k % 3) * 2, top + 12 + k * 15 + ((x >> 3) & 3) * 3); P(g, L[3], x + 3 + (k % 3) * 2, top + 13 + k * 15 + ((x >> 3) & 3) * 3); } }
  for (const ry of [base - 24, base - 56, base - 82]) { Rr(g, L[3], 0, ry - 1, 112, 1); Rr(g, L[0], 0, ry, 112, 3); Rr(g, L[4], 0, ry, 112, 1); Rr(g, L[2], 0, ry + 3, 112, 1);
    for (let x = 4; x < 112; x += 8) { Rr(g, ROPE, x - 1, ry - 1, 4, 5); Rr(g, ROPE_D, x - 1, ry + 2, 4, 2); P(g, ROPE_L, x, ry - 1); } }   /* the lashed rails, a hemp wrap on every log */
  Rr(g, L[3], 0, base - 3, 112, 4);                                                                                                                      /* the foot, in the shadow */
  /* goblin marks: a red hand on one log, a hide scrap, a skull on a stake */
  Rr(g, RED, 26, base - 44, 5, 6); for (let k = 0; k < 4; k++) Rr(g, RED, 25 + k * 2, base - 48, 1, 3); Rr(g, REDL, 27, base - 44, 2, 2);
  Rr(g, '#e8e0cc', 72, base - 96, 6, 5); Rr(g, '#a89a80', 72, base - 91, 6, 1); P(g, '#2a1210', 73, base - 94); P(g, '#2a1210', 76, base - 94); Rr(g, '#2a1210', 74, base - 92, 2, 1);
  /* THE GATE TOWER at the right: a frame of lashed poles up to a boxed lookout, a thatched roof, the horn blower, a red banner */
  const tx = 112; for (const [x, w] of [[tx, 3], [tx + 33, 3]]) { Rr(g, L[1], x, base - 112, w, 112); Rr(g, L[0], x, base - 112, 1, 112); Rr(g, L[3], x + w - 1, base - 112, 1, 112); }
  for (let y = base - 104; y < base; y += 22) { Rr(g, L[0], tx, y, 36, 2); Rr(g, ROPE, tx - 1, y - 1, 5, 3); Rr(g, ROPE, tx + 32, y - 1, 5, 3); }   /* cross rails */
  for (let k = 0; k < 30; k++) { P(g, L[0], tx + 3 + k, base - 104 + k * 3 + 1); P(g, L[2], tx + 33 - k, base - 104 + k * 3 + 1); }                    /* the cross-braces */
  Rr(g, L[2], tx - 4, base - 118, 44, 5); Rr(g, L[0], tx - 4, base - 118, 44, 1); Rr(g, L[3], tx - 4, base - 114, 44, 1);                                 /* the lookout's floor */
  Rr(g, '#150f0a', tx, base - 138, 36, 20);                                                                                                             /* the open box, dark */
  Rr(g, L[1], tx - 4, base - 138, 3, 20); Rr(g, L[1], tx + 37, base - 138, 3, 20); Rr(g, L[0], tx - 4, base - 138, 1, 20);
  for (let r = 0; r < 9; r++) { Rr(g, r & 1 ? '#8a7a4a' : '#a8925c', tx - 6 + r * 2, base - 139 - r * 2, 48 - r * 4, 2); }                               /* the thatched roof */
  for (let k = 0; k < 14; k++) P(g, '#6a5a2a', tx - 4 + ((k * 7) % 44), base - 140 - ((k * 3) % 16));
  return c; });
/* the gate's palisade + tower, tall enough to be a wall; gx = the east wall's x on screen, yb = the road's top on screen */
export function drawGate(g, gx, yb, time) {
  const s = gateWall(), x0 = gx - 112 - 40, y0 = yb - s.height + 6;
  if (x0 > g.canvas.width + 10 || x0 + s.width < -10) return;
  g.drawImage(s, x0, y0);
  /* the horn blower in the box: a small hunched goblin, the horn lifting now and then; a red banner on a pole from the roof */
  const tx = x0 + 112, by = y0 + 132 - 118, lift = Math.floor(time * 0.8) % 3 === 0;
  Rr(g, '#4e7034', tx + 12, by - 12, 6, 6); Rr(g, '#74509a', tx + 11, by - 6, 8, 6); Rr(g, '#d2b868', tx + 10, by - 15, 10, 2); Rr(g, '#a08c44', tx + 12, by - 17, 6, 2);
  Rr(g, '#eee2c4', tx + 18, by - (lift ? 15 : 9), 6, 2); Rr(g, '#eee2c4', tx + 23, by - (lift ? 17 : 8), 2, 4); if (lift && Math.floor(time * 6) % 2) { P(g, '#e6efe6', tx + 27, by - 18); P(g, '#e6efe6', tx + 28, by - 14); }
  const pw = Math.floor(time * 3) % 2, px = tx + 18, py = y0 - 8; Rr(g, '#241a10', px, py - 22, 2, 30); Rr(g, '#8f2f28', px + 2, py - 22, 14 + pw, 9); Rr(g, '#c24a3c', px + 2, py - 22, 14 + pw, 2); Rr(g, '#150f0a', px + 7, py - 19, 4, 3);
  /* two braziers either side of where the gate stands: an iron bowl on three legs, a live flame, a warm glow on the stakes */
  for (const bx of [gx - 66, gx - 6]) { const fy = yb - 2; Rr(g, '#2a2a2e', bx - 4, fy - 14, 9, 2); Rr(g, '#4a4a52', bx - 5, fy - 16, 11, 2); Rr(g, '#1a1a1e', bx - 3, fy - 12, 1, 12); Rr(g, '#1a1a1e', bx + 3, fy - 12, 1, 12); Rr(g, '#1a1a1e', bx, fy - 12, 1, 10);
    const fl = Math.floor(time * 9 + bx) % 3; g.globalAlpha = 0.22; g.fillStyle = '#ffb347'; g.beginPath(); g.arc(bx, fy - 24, 18, 0, 7); g.fill(); g.globalAlpha = 1;
    Rr(g, '#c2441c', bx - 3, fy - 22, 7, 6); Rr(g, '#ff8a2a', bx - 2, fy - 24 - fl, 5, 8); Rr(g, '#ffd36b', bx - 1, fy - 22 - fl, 3, 5); P(g, '#fff6e0', bx, fy - 20); }
}

/* A SECTION THAT HAS GONE UNDER: a foam streak where it sank, bubbles breaking at the surface; and a BOWED one: drips off its boards */
export function drawSunk(g, x, w, y, time) {
  g.globalAlpha = 0.75; for (let i = 0; i < w - 4; i += 6) Rr(g, '#e6efe6', x + 2 + i, y - 1 - ((i >> 1) & 1), 4, 1);
  for (let i = 0; i < Math.floor(w / 12); i++) { const q = (time * 1.6 + i * 0.37) % 1; g.globalAlpha = 0.8 * (1 - q); P(g, '#e6efe6', x + 6 + i * 12, y - 1 - q * 7); P(g, '#cfe0d0', x + 7 + i * 12, y - 2 - q * 7); }
  g.globalAlpha = 1;
}
export function drawDrips(g, x, w, y, time) { for (let i = 0; i < Math.floor(w / 16); i++) { const ph = (time * 2.2 + i * 0.5) % 1; g.globalAlpha = 1 - ph * 0.5; P(g, '#cfe0d0', x + 4 + i * 16 + (i & 1) * 5, y + ph * 8); } g.globalAlpha = 1; }

/* THE BULGE under the boards (the troll's burst, told): five boards humped up over him, a dark gap and water showing under them, splinters jumping once it has set; k 0..1 how long it has been rising */
export function drawBulge(g, bx, by, k, locked, time) {
  const spr = rottenBoard(true, 1, 3);
  for (let i = -2; i <= 2; i++) { const lift = Math.round((3 - Math.abs(i)) * (1 + k * 2) + (locked ? Math.sin(time * 40) : 0)), x = bx + i * 8 - 4;
    if (lift > 2) { Rr(g, '#10160e', x, by + 6 - lift + 4, 8, lift); P(g, '#9fb3a6', x + 2, by + 6); }       /* the gap under a lifted board: dark, a gleam of fen */
    g.drawImage(spr, (i + 2) % 2 ? 0 : 8, 0, 8, 9, x, by - lift - 1, 8, 9);
    if (lift > 3) P(g, OAK[0], x + 3, by - lift + 1);                                                                         /* a split opening */ }
  if (locked) for (let i = 0; i < 5; i++) { const q = (time * 5 + i * 0.21) % 1; g.globalAlpha = 1 - q; P(g, BOARD[4], bx - 14 + i * 7, by - 6 - q * 12); P(g, '#e0c490', bx - 12 + i * 7, by - 5 - q * 10); g.globalAlpha = 1; }
}
/* THE PEAT CLOD in flight: a black wet lump, weed trailing, drips falling */
export function drawClod(g, x, y, time) {
  Rr(g, PEAT[1], x - 4, y - 3, 8, 6); Rr(g, PEAT[2], x - 3, y - 4, 6, 6); Rr(g, PEAT[4], x - 3, y - 4, 3, 2); Rr(g, PEAT[0], x + 1, y, 3, 3);
  P(g, MOSS[2], x - 4, y - 1); Rr(g, MOSS[1], x + 3, y - 2, 1, 4 + ((time * 8) | 0) % 2); Rr(g, MOSS[2], x - 1, y - 5, 2, 1);
  if (Math.floor(time * 12) % 2) { P(g, '#cfe0d0', x - 2, y + 4); P(g, '#cfe0d0', x + 2, y + 6); }
}
