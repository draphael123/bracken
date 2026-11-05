// src/redraw/mon3_art.js - MONASTERY 3's ART PASS (claude/art4, over the greybox claude/monastery3-1105). DRAWING ONLY: no tile, entity, number or timer changes.
// Behind L.monk.m3 (set only by src/monastery3.js, which only runs under MON3 / MON3_SHIPS): master's Monastery never calls any of this.
// Plain fillRect pixels (no paths) so tools/mon3-art.mjs renders everything in Node. The monastery's own style is KEPT (src/redraw/monastery.js: warm
// limestone, tar-dark timber, bronze, faded tile red): the colours below are its colours.
//   THE CENSER-SWINGER  the goblin priest's frames in ash-grey and soot, a fat brass pot with a red heart and its smoke (cnSkin 'censerswinger')
//   THE DEFACED SAINT   the seated stone monk with a goblin's pot-helm jammed on him and a daub across his chest
//   THE BARRICADE       the monks' grain crates, stencilled with their cross, a goblin's red hand and bent nails (the T.CRATE tile under L.monk.m3)
//   A DESK CANDLE       iron spike stand, brass dish, wax taper, a flame that leans; snuffed it is a hot wick and a thread of smoke (drawCandle)
//   THE FEAST TABLES    cloth with a red runner, trestle ENDS, platters, bones, tankards, a candle stub (drawTables, over the board platforms)
//   THE CHANDELIERS     an iron ring under the hung board ring: hoops, hooks, candle sockets, flames, wax drips (drawChandeliers)
//   THE KITCHEN FLUE    soot up the chimney breast, the hearth's glow from under, sparks (drawFlue, back pass); THE DOVECOTE NOOK (drawNook)
//   THE CELLS           a window slit with its cold shaft, a peg, a straw heap in each (drawCells, back pass)
//   THE DORTER CAMP     looted hangings on the walls, straw ticks + blankets on the bunk boards (drawDorter back / drawBunks front)
//   THE CLIFF PATH      the hoist's housing under its crag, nests + guano on the spires (drawCliffBack / drawSpires)
//   THE ROPE BELLS      a hank of rolled rope on the bell's frame (drawRopeBell); THE DRAWBRIDGE: its roll, its chains, its planks (drawBridge)
import { canvas, rect, px, mulberry, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import * as MON from './monastery.js';

const R = rect, ri = Math.round, T = 16;
const wave = (t, f, p = 0) => 0.5 + 0.5 * Math.sin(t * f + p);
const ST = { cap: '#cdbd9c', hi: '#b8a888', l: '#a09074', m: '#8c7e66', d: '#766a58', deep: '#5a5046', mor: '#3c342e' };
const WD = ['#2e1e12', '#4a3020', '#6a4a2c', '#8a6640', '#b08a5c'];
const BR = ['#3a2a12', '#6a4a1e', '#9a7634', '#c9a44a', '#f0dc8a'];
const IRON = ['#1c1c22', '#33333c', '#4a4a56', '#6a6a78', '#9a9aa8'];
const CLOTH = ['#a8987a', '#cdbf9e', '#ece0c0'];
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const pack = (frames, ax, ay, w, h) => { const white = frames.map(c => whiten(c)); return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax, ay, w, h }; };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

// ---------------- THE CENSER-SWINGER ----------------
const SWAP = { '#8e3a32': '#6a655c', '#5a1e1e': '#363230', '#b8584a': '#8f897d', '#e8a83a': '#8a7a58', '#a8681c': '#574a32', '#6faa4a': '#5f8c46', '#3f6e2c': '#2e5022' };
function swingerFrame(src, i) {
  const [c, g] = canvas(src.width, src.height), sg = src.getContext('2d'), d = sg.getImageData(0, 0, src.width, src.height).data, W = src.width, H = src.height;
  const map = Object.keys(SWAP).map(k => [hex(k), hex(SWAP[k])]), bronze = [BR[1], BR[2], BR[3], BR[4]].map(hex);
  const at = (x, y) => { const k = (y * W + x) * 4; return d[k + 3] ? [d[k], d[k + 1], d[k + 2]] : null; };
  const same = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  let bx = 0, by = 0, bn = 0, eyeY = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const p = at(x, y); if (!p) continue;
    let q = p; for (const [a, b] of map) if (same(p, a)) { q = b; break; }
    if (same(p, hex('#f3f0d2')) && eyeY < 0) eyeY = y;
    if (bronze.some(b => same(p, b)) && !(i === 7 || i === 8) && !((i === 3 || i === 4) && y > 9)) { bx += x; by += y; bn++; }
    g.fillStyle = `rgb(${q[0]},${q[1]},${q[2]})`; g.fillRect(x, y, 1, 1); }
  // SOOT: black thumbs across the cheeks under the eyes, a grey smear up the hood
  if (eyeY >= 0) for (let x = 0; x < W; x++) { const p = at(x, eyeY + 1); if (p && same(p, hex('#6faa4a'))) { R(g, x, eyeY + 1, 1, 1, '#2a2622'); if (x % 2) R(g, x, eyeY, 1, 1, '#3a3430'); } }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const p = at(x, y); if (p && same(p, hex('#8e3a32')) && (x * 7 + y * 3) % 11 === 0) R(g, x, y, 1, 1, '#b8b0a2'); }   /* ash dusted on the robe */
  // THE POT: a fat brass censer with a red heart, and the smoke that gives it away
  if (bn > 2) { const cx = ri(bx / bn), cy = ri(by / bn);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { if (Math.abs(dx) + Math.abs(dy) === 4) continue; const edge = Math.abs(dx) === 2 || Math.abs(dy) === 2;
      if (cx + dx < 0 || cx + dx >= W || cy + dy < 0 || cy + dy >= H) continue; R(g, cx + dx, cy + dy, 1, 1, edge ? BR[1] : (dy < 0 ? BR[4] : BR[3])); }
    R(g, cx, cy, 1, 1, '#ff7a2c'); R(g, cx - 1, cy + 1, 1, 1, '#c9382a');
    if (cy - 4 >= 0) { R(g, cx, cy - 3, 1, 1, '#d8d0c0'); R(g, cx + 1, cy - 4, 1, 1, '#9a948a'); } }
  // a rope belt with a ring of keys at the hip (all but the thrown/rung poses)
  if (i < 3 || i === 5 || i === 9) { const by2 = H - 8; for (let x = 4; x < W - 5; x++) { const p = at(x, by2); if (p && !same(p, hex('#3f6e2c'))) R(g, x, by2, 1, 1, x % 2 ? '#c8b088' : '#8a7a58'); } R(g, 5, by2 + 1, 1, 1, IRON[4]); R(g, 6, by2 + 2, 1, 1, IRON[3]); }
  return outline(c, OUT);
}
export function bakeCenserSwinger() {
  return once('swinger', () => { const P = MON.bakeGoblinPriest(); return pack(P.R.map(swingerFrame), P.ax, P.ay, P.w, P.h); });
}

// ---------------- PROP SPRITES ----------------
function statueDefaced(v) {   /* the monk with a goblin's pot-helm on, a red daub across his chest; v picks which way the helm sits */
  const [c, g] = canvas(16, 30), s = v ? -1 : 1, hx = v ? 1 : 0;
  R(g, 1, 24, 14, 6, ST.m); R(g, 1, 24, 14, 1, ST.hi);
  for (let y = 12; y < 24; y++) { const half = 3 + ((y - 12) >> 2); R(g, 8 - half, y, half * 2, 1, y < 14 ? ST.hi : ST.l); }
  R(g, 5, 18, 6, 3, ST.d);
  R(g, 5, 4, 7, 7, ST.l); R(g, 6, 8, 1, 1, ST.deep); R(g, 9, 8, 1, 1, ST.deep);   /* his face, eyes as they were */
  // the helm: a battered iron pot with a nose-bar, jammed on crooked, a horn-stub bent off one side
  R(g, 3 + hx, 1, 10, 5, IRON[2]); R(g, 3 + hx, 1, 10, 1, IRON[4]); R(g, 4 + hx, 0, 8, 1, IRON[3]); R(g, 3 + hx, 5, 10, 1, IRON[1]);
  R(g, 8 + hx - 1, 5, 2, 4, IRON[1]); R(g, s > 0 ? 12 : 2, 0, 2, 1, '#c9b27c'); px(g, s > 0 ? 13 : 1, -0 + 0, '#c9b27c'); R(g, 5 + hx, 3, 1, 1, IRON[0]); R(g, 10 + hx, 2, 1, 2, '#7a4a2a');   /* rust runs */
  // the daub: a goblin's red hand and a stroke across the cope
  R(g, 6, 14, 5, 1, '#c9382a'); R(g, 7, 15, 1, 3, '#c9382a'); R(g, 9, 15, 1, 2, '#c9382a'); R(g, 10, 16, 1, 2, '#8a2a24'); px(g, 5, 20, '#7e8a4a'); px(g, 11, 15, '#5e6a36');
  return outline(c, OUT);
}
function crate(v) {   /* a monks' grain crate: slatted, stencilled with their cross, a goblin's red hand, nails bent, a corner stove in */
  const [c, g] = canvas(T, T);
  R(g, 0, 0, T, T, WD[2]); for (let y = 0; y < T; y += 5) { R(g, 0, y, T, 1, WD[1]); R(g, 0, y + 1, T, 1, WD[3]); }
  R(g, 0, 0, 2, T, WD[1]); R(g, T - 2, 0, 2, T, WD[1]); R(g, 0, 0, T, 2, WD[1]); R(g, 0, T - 2, T, 2, WD[1]); R(g, 0, 0, T, 1, WD[4]);
  R(g, 0, 0, T, T, 'rgba(0,0,0,0)');
  for (const [x, y] of [[1, 1], [T - 3, 1], [1, T - 3], [T - 3, T - 3]]) { R(g, x, y, 2, 2, IRON[3]); px(g, x, y, IRON[4]); }
  if (!v) { R(g, 7, 4, 2, 8, '#d8ccaa'); R(g, 4, 6, 8, 2, '#d8ccaa'); R(g, 7, 4, 2, 1, '#fff6d8'); }   /* the monks' cross, stencilled */
  else { R(g, 5, 5, 6, 6, '#b8352a'); R(g, 4, 4, 1, 3, '#b8352a'); R(g, 6, 3, 1, 2, '#b8352a'); R(g, 8, 3, 1, 2, '#b8352a'); R(g, 10, 3, 1, 2, '#b8352a'); R(g, 6, 8, 3, 1, '#8a2a24'); }   /* a goblin's hand, flat on it */
  R(g, T - 5, 0, 5, 3, 'rgba(0,0,0,0.0)'); px(g, T - 4, 6, WD[0]); px(g, T - 5, 7, WD[0]); px(g, 3, T - 5, WD[0]);
  return c;
}
export function bakeMon3Props() {
  return once('props', () => ({ statueDefaced: [statueDefaced(0), statueDefaced(1)], crate: [crate(0), crate(1)] }));
}

// ---------------- A DESK CANDLE (a lantern ent with `candle: true`; x, y = its foot on screen) ----------------
export function drawCandle(g, x, y, lit, time, seed = 0) {
  x = ri(x); y = ri(y);
  R(g, x - 3, y - 1, 7, 1, IRON[2]); R(g, x - 2, y - 2, 5, 1, IRON[3]); R(g, x, y - 9, 1, 8, IRON[2]);   /* a tripod foot, a spike */
  R(g, x - 3, y - 11, 7, 1, BR[2]); R(g, x - 2, y - 10, 5, 1, BR[1]); R(g, x - 3, y - 12, 1, 1, BR[3]); R(g, x + 3, y - 12, 1, 1, BR[3]);   /* the dish */
  if (lit) {
    R(g, x - 1, y - 17, 3, 5, '#efe6c8'); R(g, x - 1, y - 17, 1, 5, '#cfc4a4'); R(g, x + 1, y - 14, 1, 2, '#d8cca8'); R(g, x + 1, y - 12, 2, 1, '#e8dcb8');   /* wax and a drip */
    const lean = ri(Math.sin(time * 7 + seed) * 1.2), k = wave(time, 11, seed);
    R(g, x + lean, y - 21, 1, 4, '#ff9a3c'); R(g, x + lean, y - 22, 1, 1, '#ffd36b'); R(g, x + (lean > 0 ? 1 : lean < 0 ? -1 : 0) + 0, y - 19, 1, 2, k > 0.5 ? '#fff3b8' : '#ffd36b');
    g.globalAlpha = 0.22 + 0.08 * k; R(g, x - 4, y - 24, 9, 9, '#ffd36b'); g.globalAlpha = 0.14; R(g, x - 7, y - 27, 15, 15, '#ffc36b'); g.globalAlpha = 1;
  } else {
    R(g, x - 1, y - 15, 3, 3, '#cfc4a4'); R(g, x - 1, y - 15, 1, 3, '#a89c80'); R(g, x, y - 16, 1, 1, '#3a2a22'); R(g, x, y - 17, 1, 1, '#ff6a2c');   /* a stub, its wick still red */
    g.globalAlpha = 0.5; for (let i = 0; i < 6; i++) { const k = (time * 0.7 + i / 6 + seed * 0.13) % 1, sx = x + ri(Math.sin(k * 7 + i) * (1 + k * 3)); g.globalAlpha = 0.55 * (1 - k); R(g, sx, y - 17 - ri(k * 16), 1, 1, '#9a948a'); } g.globalAlpha = 1;
  }
}

// ---------------- THE FEAST TABLES (front pass; M.tables = [x0, x1, topRow, floorRow]) ----------------
export function drawTables(g, tables, cx, cy, VW, VH, time) {
  for (const [x0, x1, top, floor] of tables) {
    const L0 = x0 * T - cx, W = (x1 - x0 + 1) * T, ty = top * T - cy; if (L0 > VW + 8 || L0 + W < -8 || ty > VH + 40 || ty + (floor - top) * T < -60) continue;
    const L = ri(L0), Y = ri(ty), n = x1 - x0 + 1;
    // the cloth over the boards: a hem hanging a hand's width with its scallops, a stain or two
    R(g, L - 1, Y + 1, W + 2, 4, CLOTH[1]); R(g, L - 1, Y + 1, W + 2, 1, CLOTH[2]);
    for (let x = 0; x < W; x += 4) { const dd = 3 + ((x * 5 + x0) % 3 === 0 ? 1 : 0); R(g, L + x, Y + 5, 3, dd - 1, CLOTH[0]); R(g, L + x, Y + 5, 3, 1, CLOTH[1]); }
    R(g, L + 3, Y + 1, W - 6, 1, '#b8352a'); R(g, L + 3, Y + 2, W - 6, 1, '#8a2a24');   /* a red runner */
    for (let k = 0; k < n; k += 3) R(g, L + k * T + 5, Y + 3, 3, 2, '#7a3a2a');           /* spilled wine */
    // trestle ENDS: a full-height board with a lathe-cut waist, a cross-brace, a foot (a hero passes in front)
    for (const ex of [x0, x1]) { const X = ri(ex * T - cx); R(g, X + 1, Y + 6, T - 2, (floor - top) * T - 6, WD[2]);
      R(g, X + 1, Y + 6, 2, (floor - top) * T - 6, WD[3]); R(g, X + T - 3, Y + 6, 2, (floor - top) * T - 6, WD[1]);
      for (let yy = Y + 12; yy < Y + (floor - top) * T - 4; yy += 14) { R(g, X + 5, yy, 6, 7, WD[0]); R(g, X + 6, yy + 1, 4, 5, WD[1]); }   /* the cut-out waist */
      R(g, X, Y + (floor - top) * T - 3, T, 3, WD[1]); R(g, X, Y + (floor - top) * T - 3, T, 1, WD[3]); R(g, X + 1, Y + 5, T - 2, 1, WD[0]); }
    R(g, L + T, Y + (floor - top) * T - 14, W - 2 * T, 2, WD[1]); R(g, L + T, Y + (floor - top) * T - 14, W - 2 * T, 1, WD[2]);   /* the stretcher between the ends */
    // the feast, set out by a goblin: platters, bones, a roast, tankards, a candle stub, a dropped knife
    for (let k = 0; k < n; k++) { const X = L + k * T, h = (x0 + k) * 7 + top * 3;
      switch (h % 5) {
        case 0: R(g, X + 3, Y - 2, 10, 2, IRON[3]); R(g, X + 3, Y - 2, 10, 1, IRON[4]); R(g, X + 5, Y - 5, 6, 3, '#9a5a2a'); R(g, X + 5, Y - 5, 6, 1, '#c9843a'); R(g, X + 7, Y - 6, 2, 1, '#e8b860'); break;     /* a roast on a platter */
        case 1: R(g, X + 4, Y - 4, 3, 4, WD[3]); R(g, X + 4, Y - 4, 3, 1, '#e8dcc0'); R(g, X + 9, Y - 3, 3, 3, WD[2]); R(g, X + 9, Y - 3, 3, 1, '#d8c8a0'); R(g, X + 7, Y - 1, 1, 1, '#c9382a'); break;   /* two tankards */
        case 2: R(g, X + 2, Y - 1, 8, 1, '#e8e0cc'); R(g, X + 2, Y - 2, 2, 1, '#e8e0cc'); R(g, X + 9, Y - 2, 2, 1, '#e8e0cc'); R(g, X + 11, Y - 3, 3, 3, '#d8ccaa'); R(g, X + 12, Y - 4, 1, 1, '#d8ccaa'); break;   /* bones */
        case 3: R(g, X + 6, Y - 3, 4, 3, BR[3]); R(g, X + 6, Y - 3, 4, 1, BR[4]); R(g, X + 7, Y - 5, 2, 2, '#c9382a'); R(g, X + 3, Y - 1, 3, 1, IRON[4]); break;   /* a stolen chalice, an apple */
        default: R(g, X + 3, Y - 2, 8, 2, '#c8a860'); R(g, X + 3, Y - 2, 8, 1, '#e8cc88'); R(g, X + 11, Y - 1, 3, 1, IRON[4]); break; }   /* a loaf and a knife */
    }
    const cxn = L + ri(W / 2); R(g, cxn - 1, Y - 8, 3, 8, '#efe6c8'); R(g, cxn, Y - 11, 1, 3, '#ff9a3c'); R(g, cxn, Y - 12, 1, 1, '#ffd36b'); g.globalAlpha = 0.18 + 0.06 * wave(time, 9, x0); R(g, cxn - 5, Y - 16, 11, 9, '#ffd36b'); g.globalAlpha = 1;
  }
}

// ---------------- THE CHANDELIERS (front pass; M.m3.chandeliers = [[chainCol, topRow, ringRow, x0, x1]]) ----------------
export function drawChandeliers(g, list, cx, cy, VW, VH, time) {
  for (const [col, top, ring, x0, x1] of list) {
    const L = ri(x0 * T - cx), W = (x1 - x0 + 1) * T, Y = ri(ring * T - cy); if (L > VW + 8 || L + W < -8 || Y > VH + 30 || Y < -60) continue;
    R(g, L - 1, Y + 4, W + 2, 3, IRON[1]); R(g, L - 1, Y + 4, W + 2, 1, IRON[3]);                         // the iron band under the boards
    for (let x = 6; x < W - 4; x += 12) { R(g, L + x, Y + 7, 1, 3, IRON[2]); R(g, L + x - 1, Y + 10, 3, 1, IRON[3]); }   // its hooks
    for (const sx of [0, W - 3]) { R(g, L + sx, Y - 3, 3, 10, IRON[2]); R(g, L + sx, Y - 3, 1, 10, IRON[4]); }          // end hoops
    const nC = Math.max(2, Math.floor(W / 28)); for (let i = 0; i < nC; i++) {                              // candle sockets: only the ends and the mid, never where you stand
      const X = L + (i === 0 ? 1 : i === nC - 1 ? W - 3 : ri(W * i / (nC - 1))), k = wave(time, 10, i + x0);
      R(g, X - 1, Y - 9, 3, 6, '#efe6c8'); R(g, X, Y - 12, 1, 3, '#ff9a3c'); R(g, X, Y - 13, 1, 1, '#ffd36b'); R(g, X + 1, Y - 6, 1, 4, '#d8cca8');
      g.globalAlpha = 0.2 + 0.08 * k; R(g, X - 5, Y - 17, 11, 11, '#ffd36b'); g.globalAlpha = 1; }
    const mx = L + ri(W / 2); R(g, mx - 2, Y - 1, 5, 5, IRON[2]); R(g, mx - 1, Y, 3, 3, BR[3]);                                   // the boss the chain ends in
  }
}

// ---------------- BACK PASS: the flue, the nook, the cells, the dorter, the cliff ----------------
export function drawFlue(g, flues, cx, cy, VW, VH, time) {   /* [x0, x1, y0, y1] tiles: soot up the chimney breast, the hearth glow from under, sparks */
  for (const [x0, x1, y0, y1] of flues) { const L = x0 * T - cx, t = y0 * T - cy, W = (x1 - x0 + 1) * T, H = (y1 - y0 + 1) * T; if (L > VW || L + W < 0 || t > VH || t + H < 0) continue;
    const rnd = mulberry(900 + x0 * 13);
    for (let x = 0; x < W; x += 2) { const len = 20 + ri(rnd() * (H * 0.9)), edge = x < 10 || x > W - 12;   // soot thick at the walls, running up from the floor
      for (let y = 0; y < len; y += 3) { const yy = H - y; const a = (edge ? 0.55 : 0.24) * (1 - y / (len + 1)); if (t + yy < -4 || t + yy > VH) continue; g.globalAlpha = a; R(g, ri(L + x), ri(t + yy), 2, 3, '#14100e'); } }
    const k = 0.5 + 0.5 * Math.sin(time * 5 + 1) * Math.sin(time * 3.1);
    for (let i = 0; i < 6; i++) { g.globalAlpha = (0.05 + 0.03 * k) * (1 - i / 6); R(g, ri(L + 8 + i), ri(t + H - 34 - i * 14), ri(W - 16 - i * 2), 14, '#ff8a2c'); }   // the hearth's glow climbing the breast
    g.globalAlpha = 1;
    for (let i = 0; i < 7; i++) { const f = (time * 0.18 + i * 0.143 + x0 * 0.1) % 1, sx = L + 12 + ((i * 29) % Math.max(8, W - 24)) + ri(Math.sin(f * 9 + i) * 4), sy = t + H - 4 - f * H * 0.9; if (sy < -4 || sy > VH) continue;
      g.globalAlpha = 0.9 * (1 - f); R(g, ri(sx), ri(sy), 1, 1, f < 0.5 ? '#ffd36b' : '#ff8a2c'); } g.globalAlpha = 1; }
}
export function drawNook(g, nooks, cx, cy, VW, VH, time) {   /* the dovecote's nook cut up through the refectory floor: cubbies, straw, feathers, a slant of daylight */
  for (const [x0, x1, y0, y1] of nooks) { const L = ri(x0 * T - cx), Y = ri(y0 * T - cy), W = (x1 - x0 + 1) * T, H = (y1 - y0 + 1) * T; if (L > VW || L + W < 0 || Y > VH || Y + H < 0) continue;
    R(g, L, Y, W, H, '#2a2018');
    for (let r = 0; r < 4; r++) for (let c = 0; c < W / 8; c++) { const X = L + 2 + c * 8 + (r & 1) * 4; if (X + 6 > L + W) continue; const yy = Y + 3 + r * 8; R(g, X, yy, 6, 6, '#120e0a'); R(g, X, yy, 6, 1, ST.deep); R(g, X, yy + 6, 6, 1, ST.m); if ((r * 5 + c * 3) % 4 === 0) { R(g, X + 1, yy + 4, 4, 2, '#c8b070'); px(g, X + 2, yy + 3, '#e8e0cc'); } }
    for (let i = 0; i < 5; i++) { const f = (time * 0.2 + i * 0.2) % 1; g.globalAlpha = 0.8 * (1 - f); R(g, L + 4 + ((i * 11) % (W - 8)) + ri(Math.sin(f * 6 + i) * 3), Y + 2 + ri(f * (H - 6)), 1, 1, '#f0ece0'); } g.globalAlpha = 1;
    g.globalAlpha = 0.1 + 0.04 * wave(time, 1.3); for (let k = 0; k < 4; k++) R(g, L + 4 + k * 5, Y, 4, H, '#fff0c0'); g.globalAlpha = 1; }
}
export function drawCells(g, cells, cx, cy, VW, VH, time) {   /* [x0, x1, topRow, botRow] of the cell stack: one window slit + shaft, a peg with a cowl, a straw heap per floor */
  for (const [x0, x1, y0, y1] of cells) for (const fl of [177, 172, 167]) { if (fl < y0 || fl > y1 + 1) continue;
    const L = ri(x0 * T - cx), fy = ri(fl * T - cy); if (L > VW || L + (x1 - x0 + 1) * T < 0 || fy > VH + 80 || fy < -20) continue; const W = (x1 - x0 + 1) * T, wx = L + ri(W * 0.62);
    R(g, wx, fy - 62, 5, 18, '#0e0c0a'); R(g, wx - 1, fy - 63, 7, 1, ST.hi); R(g, wx + 1, fy - 63, 3, 1, ST.cap);                     // the slit
    g.globalAlpha = 0.08 + 0.03 * wave(time, 0.7, fl); for (let k = 0; k < 18; k++) R(g, wx - 3 - k, fy - 44 + k, 6, 1, '#fff0c8'); g.globalAlpha = 1;   // its cold shaft raking down the wall
    R(g, L + 10, fy - 38, 2, 3, IRON[3]); R(g, L + 9, fy - 35, 4, 7, '#5a4a38'); R(g, L + 9, fy - 35, 1, 7, '#7a6a52');                // a peg, a cowl on it
    for (let k = 0; k < 7; k++) { R(g, L + 24 + k * 2, fy - 3 - (k % 3), 2, 3 + (k % 3), '#c8b070'); } R(g, L + 25, fy - 2, 10, 1, '#e0cc90'); }
}
export function drawDorter(g, spans, cx, cy, VW, VH, time) {   /* [x0, x1, floorRow, hangRow] between the piers: stolen hangings, hams, a plundered banner */
  for (const [x0, x1, , hang] of spans) { const L = ri(x0 * T - cx), Y = ri(hang * T - cy), W = (x1 - x0 + 1) * T; if (L > VW || L + W < 0 || Y > VH + 80 || Y < -80) continue;
    R(g, L, Y, W, 1, WD[1]); for (let x = 6; x < W - 10; x += 22) { const k = ((x0 + x) * 7) % 3, X = L + x;
      if (k === 0) { R(g, X + 3, Y + 1, 1, 6, '#c8b088'); R(g, X, Y + 7, 8, 11, '#a82a2a'); R(g, X, Y + 7, 8, 1, '#c9a44a'); R(g, X + 3, Y + 11, 2, 2, '#e8c84a'); for (let t2 = 0; t2 < 8; t2 += 2) R(g, X + t2, Y + 18, 1, 2, '#c9a44a'); }   // a banner of the order, taken
      else if (k === 1) { R(g, X + 3, Y + 1, 1, 4, '#c8b088'); R(g, X + 1, Y + 5, 6, 7, '#a85a4a'); R(g, X + 1, Y + 5, 6, 1, '#d88a7a'); R(g, X + 2, Y + 12, 4, 2, '#7a3a2a'); }   // a ham
      else { R(g, X, Y + 1, 2, 3, IRON[3]); R(g, X + 8, Y + 1, 2, 3, IRON[3]); R(g, X + 1, Y + 4, 8, 7, '#c8b070'); R(g, X + 1, Y + 4, 8, 1, '#e8d8a0'); R(g, X + 3, Y + 6, 4, 4, '#3e6e2c'); } } }   // a sack on two hooks
}
export function drawBunks(g, bunks, cx, cy, VW, VH) {   /* front pass: [x0, row, w] bunk boards: a straw tick, a grey blanket, a goblin's pillow, bed-posts */
  for (const [x0, row, w] of bunks) { const L = ri(x0 * T - cx), Y = ri(row * T - cy), W = w * T; if (L > VW || L + W < 0 || Y > VH + 20 || Y < -40) continue;
    R(g, L + 1, Y - 2, W - 2, 3, '#c8b070'); R(g, L + 1, Y - 2, W - 2, 1, '#e0cc90');
    R(g, L + 10, Y - 4, W - 12, 3, (x0 + row) % 2 ? '#5e6470' : '#6a4a3a'); R(g, L + 10, Y - 4, W - 12, 1, (x0 + row) % 2 ? '#7a8290' : '#8a6a52');
    R(g, L + 2, Y - 4, 7, 2, '#e8dcc0'); R(g, L + 2, Y - 4, 7, 1, '#fffaea');
    for (const sx of [0, W - 2]) { R(g, L + sx, Y - 10, 2, 10, WD[2]); R(g, L + sx, Y - 10, 1, 10, WD[3]); R(g, L + sx, Y - 11, 2, 1, BR[3]); } }
}
export function drawCliffBack(g, hubs, cx, cy, VW, VH) {   /* the hoist's wheel plate: an iron backing bolted into the crag behind the wheel, and the spare rope coiled on a peg (main.js draws the beam + the wheel itself) */
  for (const [hx, hy] of hubs) { const X = ri(hx - cx), Y = ri(hy - cy); if (X < -60 || X > VW + 60 || Y < -40 || Y > VH + 40) continue;
    R(g, X - 14, Y - 14, 28, 28, IRON[1]); R(g, X - 14, Y - 14, 28, 1, IRON[3]); R(g, X - 14, Y + 13, 28, 1, IRON[0]); R(g, X - 14, Y - 14, 1, 28, IRON[2]); R(g, X + 13, Y - 14, 1, 28, IRON[0]);
    for (const [bx, by] of [[-12, -12], [10, -12], [-12, 10], [10, 10]]) { R(g, X + bx, Y + by, 3, 3, IRON[3]); px(g, X + bx, Y + by, IRON[4]); }
    R(g, X + 15, Y - 1, 8, 7, '#c8b088'); for (let k = 0; k < 4; k++) R(g, X + 15, Y + k * 2, 8, 1, '#8a7a58'); R(g, X + 17, Y - 2, 4, 1, '#c8b088'); R(g, X + 14, Y - 3, 2, 2, IRON[3]); }
}
export function drawSpires(g, spires, cx, cy, VW, VH) {   /* front pass: [x0, topRow, w] crag spires: guano streaks down their faces, a stick nest on two of them */
  for (const [x0, top, w] of spires) { const L = ri(x0 * T - cx), Y = ri(top * T - cy), W = w * T; if (L > VW + 20 || L + W < -20 || Y > VH + 20 || Y < -40) continue;
    for (let i = 0; i < w * 2; i++) { const X = L + 3 + ((i * 13 + x0 * 5) % (W - 6)), len = 8 + ((i * 7 + x0) % 22); R(g, X, Y + 1, 2, len, '#d8d4c4'); R(g, X, Y + 1, 2, 1, '#f0ece0'); R(g, X + 1, Y + 1 + len, 1, 2, '#c8c4b0'); }
    if ((x0 + top) % 2) { const nx = L + ri(W / 2) - 8; R(g, nx, Y - 4, 16, 4, '#6a4a2c'); R(g, nx + 2, Y - 5, 12, 1, '#8a6640'); for (let k = 0; k < 6; k++) R(g, nx + 1 + k * 3, Y - 4 - (k & 1), 1, 5, k % 2 ? '#8a6640' : '#4a3020'); R(g, nx + 5, Y - 6, 6, 2, '#e8e0cc'); } }
}

// ---------------- THE ROPE BELLS + THE DRAWBRIDGE (called from main.js drawTBell) ----------------
export function drawRopeBell(g, x, y, down, time) {   /* x, y = the bell's foot on screen: a hank of rope hung on the frame's side peg; down = it has been let out, the peg bare but for its end */
  R(g, x + 11, y - 22, 2, 2, IRON[3]);
  if (!down) { R(g, x + 11, y - 21, 7, 9, '#c8b088'); for (let k = 0; k < 5; k++) R(g, x + 11, y - 21 + k * 2, 7, 1, '#8a7a58'); R(g, x + 13, y - 12, 2, 4, '#c8b088'); }
  else { R(g, x + 12, y - 21, 2, 10, '#c8b088'); R(g, x + 12, y - 20, 2, 1, '#8a7a58'); R(g, x + 12, y - 16, 2, 1, '#8a7a58'); }
}
function chain(g, ax, ay, bx, by, sag = 0) {   // links, alternating dark/light, a pixel line stepped in rects
  const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 3)); for (let i = 0; i <= n; i++) { const k = i / n, x = ri(ax + (bx - ax) * k), y = ri(ay + (by - ay) * k + Math.sin(k * Math.PI) * sag); R(g, x, y, 2, 2, i % 2 ? IRON[3] : IRON[1]); if (i % 2) px(g, x, y, IRON[4]); } }
export function drawBridge(g, o) {   // o = { hx (screen x of the tower end), ry (screen y of the deck), len, left, k (0 up .. 1 down), down, time }
  const { hx, ry, len, left, down, time } = o, dir = left ? 1 : -1, farX = hx + dir * len, k = down ? 1 : o.k;
  const x0 = left ? hx : hx - len * k;   // planks run out from the tower end as it lowers
  const run = ri(len * k);
  if (k < 1 && !o.chainsOnly) { const rx = left ? hx + run : hx - run, rollR = ri(5 * (1 - k)) + 1;   // the roll at the free end: a drum of planks bound in iron
    R(g, rx - rollR, ry - rollR * 2, rollR * 2 + 1, rollR * 2 + 1, WD[2]); R(g, rx - rollR, ry - rollR * 2, rollR * 2 + 1, 1, WD[4]); R(g, rx - 1, ry - rollR * 2, 2, rollR * 2 + 1, IRON[2]); }
  if (run > 0 && !o.chainsOnly) { const X = left ? hx : hx - run; R(g, X, ry, run, 4, WD[2]); R(g, X, ry, run, 1, WD[4]); R(g, X, ry + 3, run, 1, WD[0]);
    for (let p = 0; p < run; p += 6) R(g, X + p, ry + 1, 1, 3, WD[0]); for (let p = 3; p < run; p += 12) { px(g, X + p, ry + 1, IRON[4]); } }
  // the chains: from the tower's crown, down to the free end of the planks (taut once it is let down)
  const topY = ry - 7 * T, endX = left ? hx + run : hx - run, sag = down ? 1 : 4 * (1 - k);
  chain(g, hx + (left ? -3 : 3), topY, endX, ry - 1, sag); chain(g, hx + (left ? -3 : 3), topY + 6, endX - dir * 2, ry - 3, sag);
  R(g, hx - 4, topY - 2, 9, 5, IRON[2]); R(g, hx - 4, topY - 2, 9, 1, IRON[4]); R(g, hx - 1, topY + 3, 3, 3, BR[3]);   // the winch cap on the tower
  if (!down && o.time !== undefined) { const kk = wave(time, 3); g.globalAlpha = 0.12 + 0.08 * kk; R(g, left ? hx : hx - len, ry, len, 3, '#e8c88a'); g.globalAlpha = 1; }   // where it will go
}

// ---------------- the hooks main.js calls ----------------
export function decoOf(e) {   /* a placed deco in the new Monastery: the defaced saint */
  if (e.kind === 'statue' && e.defaced) return [bakeMon3Props().statueDefaced[(e.v || 0) % 2], true];
  return null;
}
const safe = (name, fn) => { try { fn(); } catch (err) { if (!safe.told) { safe.told = true; if (typeof console !== 'undefined') console.warn('mon3_art ' + name + ': ' + err.message); } } };
export function drawBack(g, M, cx, cy, VW, VH, time) {
  const m = M.m3; if (!m) return;
  safe('flue', () => drawFlue(g, m.flue || [], cx, cy, VW, VH, time)); safe('nook', () => drawNook(g, m.nooks || [], cx, cy, VW, VH, time));
  safe('cells', () => drawCells(g, m.cells || [], cx, cy, VW, VH, time)); safe('dorter', () => drawDorter(g, m.dorter || [], cx, cy, VW, VH, time));
  safe('hubs', () => drawCliffBack(g, m.hubs || [], cx, cy, VW, VH));
}
export function drawFront(g, M, cx, cy, VW, VH, time) {
  const m = M.m3; if (!m) return;
  safe('tables', () => drawTables(g, M.tables || [], cx, cy, VW, VH, time)); safe('chandeliers', () => drawChandeliers(g, m.chandeliers || [], cx, cy, VW, VH, time));
  safe('bunks', () => drawBunks(g, m.bunks || [], cx, cy, VW, VH)); safe('spires', () => drawSpires(g, m.spires || [], cx, cy, VW, VH));
}
