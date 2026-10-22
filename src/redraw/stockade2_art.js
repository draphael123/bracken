// src/redraw/stockade2_art.js - THE STOCKADE 2's drawn pieces (claude/stockade2art; the greybox was claude/stockade2's rectangles in src/stockade-hands.js).
// The camp's look is KEPT (planks, packed earth, the lashed-stake palisade); only the NEW pieces are drawn, all in the camp's own timber, rope and iron:
//   TOWER BODIES   stkTile: the gate tower and towers 1-3 are lashed-timber frames (corner logs, board infill, lashed rails, X-braces, a sill) over their solid cells
//   THE STAKE PIT  stkTile: the net over the pit is a heavy rope weave with the sharpened stakes standing under it (cells in L.stkPit)
//   THE BARRED GATE stkTile + drawGate: a camp gate of lashed stakes with iron strap hinges, its bar in the bracket inside; the bar lifts to the horn, the leaves swing back
//   SUPPORTS       drawSupport (routeSupports kinds, src/route-art.js): stkpost (a lashed pole), stktrestle (a pole pair, cross-braced), stkleg (a deck's outrigger leg braced to
//                  its tower), stkprop (a tunnel's shoring prop), stkmast (tower two's mast to the crow's nest, and the nest's rim), stkrope (the rope bridge's hand-lines and hangers)
//   LOG PILES      drawPile: logs end-on in a lashed pyramid at a stake, the lashing's glint; creak, fall, the heap
//   THE HORN       the ivory horn on the ground, at the belt, at the blower's mouth; the dozer's Zs
//   THE WAR TOWER  drawWarTower + drawWarTowerFront: legs, braces, rope ladder, deck, stake parapet, pennant, slack/taut lashings, pegs, the lurch, the fall and the wreck
// Pure pixel work from px.js primitives (fillRect / lines); baked sprites are memoised, the live pieces are fillRect only.
import { canvas, px, rect, line, circle, outline } from '../px.js';
import { T } from '../level.js';
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = Math.round;
export const ST = {
  o: '#1a1410', w0: '#2e1c10', w1: '#4a2e18', w2: '#6b4424', w3: '#8a5a32', w4: '#b98650', w5: '#d9a86a',
  r0: '#7a6a4c', r1: '#c9b48a', r2: '#e8dcc0', iron: '#3c3c46', ironHi: '#7c7c8a', ironLo: '#22222a',
  bone: '#e8dcc0', boneLo: '#b8a888', boneDp: '#7a6a50', brass: '#e0b040', brassLo: '#8a6a1c', red: '#c9463d', redLo: '#8f2f28', redDp: '#5a1a18',
  dirt: '#5a3a24', stone: '#6a6658', stoneHi: '#928c7a', gold: '#ffd36b', moss: '#3f5a33',
};
export const STK_KINDS = new Set(['stkpost', 'stktrestle', 'stkleg', 'stkprop', 'stkmast', 'stkrope']);
const TS = 16;

/* ---------------------------------------------------------------- rope + log helpers */
/* a rope lashing across a pole: x..x+w, three rows high */
function lash(g, x, y, w) { rect(g, x, y, w, 3, ST.r1); rect(g, x, y, w, 1, ST.r2); rect(g, x, y + 2, w, 1, ST.r0); for (let i = 1; i < w; i += 3) px(g, x + i, y + 1, ST.r0); }
/* a vertical log x..x+w-1, outlined, lit on its left, shaded on its right, with bark ticks */
function logV(g, x, y, w, h, seed = 0) {
  rect(g, x, y, w, h, ST.o); rect(g, x + 1, y, w - 2, h, ST.w2); rect(g, x + 1, y, 1, h, ST.w4); if (w > 4) rect(g, x + 2, y, 1, h, ST.w3); rect(g, x + w - 2, y, 1, h, ST.w1);
  for (let yy = y + 2 + (seed % 4); yy < y + h - 2; yy += 5) px(g, x + 2 + ((yy + seed) & 1), yy, ST.w1);
}
function logH(g, x, y, w, h, seed = 0) {
  rect(g, x, y, w, h, ST.o); rect(g, x, y + 1, w, h - 2, ST.w2); rect(g, x, y + 1, w, 1, ST.w4); rect(g, x, y + h - 2, w, 1, ST.w1);
  for (let xx = x + 2 + (seed % 4); xx < x + w - 2; xx += 5) px(g, xx, y + 2 + ((xx + seed) & 1), ST.w1);
}
/* a thick diagonal log from (x0,y0) to (x1,y1) - three pixel lines side by side, lit on the upper edge */
function brace(g, x0, y0, x1, y1, thick = 3) {
  const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
  for (let t = -1; t <= thick; t++) { const dx = steep ? t : 0, dy = steep ? 0 : t; const c = (t === -1 || t === thick) ? ST.o : t === 0 ? ST.w4 : t === thick - 1 ? ST.w1 : ST.w3; line(g, x0 + dx, y0 + dy, x1 + dx, y1 + dy, c); }
}

/* ================================================================ TOWER BODIES (tile kit) */
/* one 16x16 cell of a lashed-timber tower: u = column in the box (0..w-1), v = row from the box's top. The corner logs stand at the left and right cells; between them
   board infill; a lashed rail across the top of every third row; X-braces in each 3x3 bay (alternating hand); a heavy wale under the deck and a stone-footed sill. */
function towerCell(u, w, v, h) {
  const bay = Math.floor(v / 3), vm = v % 3, left = u === 0, right = u === w - 1;
  return once('tc' + u + '/' + w + '/' + (v % 6) + '/' + (v === 0) + '/' + (v === h - 1) + '/' + (bay & 1), () => {
    const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 16, ST.w1);
    for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 1, 16, ST.w0); rect(g, x + 1, 0, 1, 16, ST.w2); rect(g, x + 2, 0, 1, 16, ST.w2); rect(g, x + 1, 0, 1, 16, ST.w3); px(g, x + 2, (v * 5 + x * 3 + 4) % 14 + 1, ST.w0); px(g, x + 3, (v * 3 + x) % 12 + 2, ST.w0); }   /* the infill boards, a nail or two */
    /* the X-brace across this bay's diagonal cell */
    const diag = (bay & 1) ? (u === w - 1 - vm) : (u === vm);
    if (diag && w >= 2) { if (bay & 1) brace(g, 15, 0, 0, 15, 3); else brace(g, 0, 0, 15, 15, 3); }
    /* the lashed rail across the top of every bay */
    if (vm === 0 && v > 0) { logH(g, 0, 0, 16, 4, v); if (!left) { lash(g, 1, 0, 3); } if (!right) { lash(g, 12, 0, 3); } }
    /* the corner logs */
    if (left) { logV(g, 0, 0, 6, 16, v + 2); if (vm === 0) lash(g, 0, 5, 6); }
    if (right) { logV(g, 10, 0, 6, 16, v + 5); if (vm === 0) lash(g, 10, 5, 6); }
    if (v === 0) { /* the wale under the deck: a heavy beam, its end logs showing past the corner logs, lashed */
      rect(g, 0, 0, 16, 6, ST.o); rect(g, 0, 1, 16, 4, ST.w3); rect(g, 0, 1, 16, 1, ST.w5); rect(g, 0, 4, 16, 1, ST.w1); rect(g, 0, 5, 16, 1, ST.w0);
      if (left) { rect(g, 0, 1, 2, 4, ST.w4); } if (right) { rect(g, 14, 1, 2, 4, ST.w1); }
      lash(g, left ? 3 : 1, 2, 3); lash(g, right ? 10 : 12, 2, 3); }
    if (v === h - 1) { /* the sill: a footing beam on a bed of stones */
      rect(g, 0, 8, 16, 8, ST.dirt); rect(g, 0, 8, 16, 2, ST.o); rect(g, 0, 9, 16, 5, ST.w2); rect(g, 0, 9, 16, 1, ST.w4); rect(g, 0, 13, 16, 1, ST.w1);
      for (const x of [1, 6, 11]) { rect(g, x, 14, 4, 2, ST.stone); px(g, x, 14, ST.stoneHi); } lash(g, 5, 9, 6); }
    return c; });
}

/* ================================================================ THE STAKE PIT (tile kit) */
/* the net cell over the pit: stakes standing under a heavy rope weave. The weave is the top edge (what you land on); the stakes' tips show through it. */
function pitCell(x) {
  return once('pit' + (x % 3), () => {
    const [c, g] = canvas(16, 16), v = x % 3;
    for (const [sx, tip] of [[0 + (v & 1), 5], [5 + (v === 2 ? 1 : 0), 3], [11 - (v & 1), 6]]) {   /* three sharpened stakes, pale at the point, lashed at the base */
      rect(g, sx, tip + 3, 5, 16 - tip - 3, ST.o); rect(g, sx + 1, tip + 3, 3, 16 - tip - 3, ST.w3); rect(g, sx + 1, tip + 3, 1, 16 - tip - 3, ST.w5); rect(g, sx + 3, tip + 3, 1, 16 - tip - 3, ST.w1);
      rect(g, sx + 1, tip + 1, 3, 2, ST.o); rect(g, sx + 2, tip, 1, 2, ST.o); rect(g, sx + 2, tip + 1, 1, 2, ST.bone); rect(g, sx + 1, tip + 2, 1, 1, ST.bone); rect(g, sx + 3, tip + 2, 1, 1, ST.boneLo);
      rect(g, sx, 13, 5, 2, ST.r1); px(g, sx, 13, ST.r2); }
    rect(g, 0, 0, 16, 2, ST.o); rect(g, 0, 1, 16, 1, ST.r1); rect(g, 0, 0, 16, 1, ST.r2);          /* the net's heavy edge rope */
    for (let xx = 0; xx < 16; xx += 4) { px(g, xx + 1, 2, ST.r0); px(g, xx + 2, 3, ST.r0); px(g, xx + 3, 2, ST.r0); px(g, xx + 2, 1, ST.r2); }   /* the first row of the mesh */
    return c; });
}

/* ================================================================ THE BARRED GATE (tile kit) */
/* one cell of the gate's single column: lashed stakes, rails across at the 2nd and 5th cell, iron strap hinges on the left, the bar's iron bracket on the right at the 3rd */
function gateCell(i, n) {
  return once('gc' + i + '/' + n, () => {
    const [c, g] = canvas(16, 16);
    for (let k = 0; k < 4; k++) { const x = k * 4; rect(g, x, 0, 4, 16, ST.o); rect(g, x + 1, 0, 2, 16, ST.w2); rect(g, x + 1, 0, 1, 16, ST.w3); px(g, x + 2, (k * 5 + i * 3) % 12 + 2, ST.w1); }
    if (i === 1 || i === Math.min(5, n - 2)) { logH(g, 0, 5, 16, 5, i); lash(g, 1, 6, 3); lash(g, 12, 6, 3);   /* a rail with its lashings at the stake ends */
      rect(g, 0, 6, 5, 3, ST.iron); rect(g, 0, 6, 5, 1, ST.ironHi); px(g, 3, 7, ST.ironLo); rect(g, 0, 9, 1, 1, ST.ironLo); }   /* the hinge strap */
    if (i === 3) { rect(g, 12, 6, 4, 5, ST.iron); rect(g, 12, 6, 4, 1, ST.ironHi); rect(g, 13, 8, 3, 2, ST.ironLo); }                       /* the bar's bracket */
    return c; });
}

/* THE TILE HOOK (src/main.js tile bake): a tower cell, a pit net cell, a gate cell - or null (the camp's own tile draws) */
export function stkTile(t, x, y, at, T, L) {
  if (t === T.SOLID) { for (const b of L.stkTowers || []) if (x >= b.x0 && x <= b.x1 && y > b.top && y <= b.floor) return towerCell(x - b.x0, b.x1 - b.x0 + 1, y - b.top - 1, b.floor - b.top); }
  else if (t === T.NET) { const p = L.stkPit; if (p && y === p.row && x >= p.x0 && x <= p.x1) return pitCell(x); }
  else if (t === T.PALISADE) return lookTile(L, x, y);   /* (claude/chief3art) the kennel lookout's lashed stilts */
  else if (t === T.PORT) { const gt = L.stockade && L.stockade.gate; if (gt && x === gt.x && y >= gt.y0 && y <= gt.y1) return gateCell(y - gt.y0, gt.y1 - gt.y0 + 1); }
  return null;
}

/* ================================================================ SUPPORTS (route-art.js) */
/* A pole `len` px tall: a lashed log with its rope bands every 24 px */
function poleSprite(len) {
  return once('pole' + len, () => { const [c, g] = canvas(16, len);
    logV(g, 5, 0, 6, len, len); for (let y = 8; y < len - 6; y += 26) lash(g, 4, y, 8);
    return c; });
}
/* A trestle: two leg poles, a cross-rail and an X-brace every 3rd tile, lashed at every crossing */
function trestleSprite(len) {
  return once('tres' + len, () => { const [c, g] = canvas(16, len);
    for (let y = 0; y + 48 <= len + 40; y += 48) { const y1 = Math.min(len - 4, y + 48);
      if (y1 - y > 10) { brace(g, 4, y + 4, 11, y1 - 2, 2); brace(g, 11, y + 4, 4, y1 - 2, 2); } }
    logV(g, 1, 0, 5, len, 1); logV(g, 10, 0, 5, len, 4);
    for (let y = 6; y < len - 8; y += 48) { logH(g, 1, y, 14, 4, y); lash(g, 0, y, 7); lash(g, 9, y, 7); }
    return c; });
}
/* A tunnel prop: a post with a header plate under the roof and wedges, a sill at its foot */
function propSprite(len) {
  return once('prop' + len, () => { const [c, g] = canvas(16, len);
    logV(g, 4, 3, 8, len - 4, 7); rect(g, 1, 0, 14, 4, ST.o); rect(g, 2, 1, 12, 2, ST.w3); rect(g, 2, 1, 12, 1, ST.w4);   /* the header plate */
    for (const x of [3, 11]) { px(g, x, 4, ST.w1); px(g, x + 1, 4, ST.w3); rect(g, x, 5, 2, 1, ST.o); }                   /* wedges knocked in */
    lash(g, 3, Math.floor(len / 2) - 4, 10); rect(g, 2, len - 4, 12, 4, ST.o); rect(g, 3, len - 3, 10, 2, ST.w2); px(g, 3, len - 3, ST.w4);   /* the sill */
    return c; });
}
/* An outrigger leg for a deck's tail: the pole, and braces back to the tower (its wall `gap` px to the left of the pole's tile) */
function legSprite(len, gap) {
  return once('leg' + len + '/' + gap, () => { const [c, g] = canvas(gap + 16, len), ox = gap;
    for (let y = 0; y + 40 <= len; y += 40) { brace(g, 2, y + 8, ox + 6, y + 40, 2); brace(g, 2, y + 40, ox + 6, y + 8, 2); }   /* X-braces from the tower wall to the leg */
    logV(g, ox + 5, 0, 6, len, len); for (let y = 8; y < len - 6; y += 26) lash(g, ox + 4, y, 8);
    for (let y = 8; y < len - 14; y += 40) { rect(g, 0, y + 15, 3, 3, ST.r1); }                                              /* a lashing at the wall end of each brace */
    return c; });
}
/* the mast to the crow's nest, 8 px thick with the climbing rope along it, and the nest's rim (three tiles wide, rim and ribs) */
function mastSprite(len) {
  return once('mast' + len, () => { const [c, g] = canvas(16, len);
    logV(g, 4, 6, 8, len - 6, 11); for (let y = 12; y < len - 6; y += 30) lash(g, 3, y, 10);
    rect(g, 1, 0, 14, 7, ST.o); rect(g, 2, 1, 12, 5, ST.w3); rect(g, 2, 1, 12, 1, ST.w5); rect(g, 2, 5, 12, 1, ST.w1);    /* the nest's floor beam under the boards */
    brace(g, 3, 6, 1, 14, 2); brace(g, 12, 6, 14, 14, 2);                                                                      /* knee braces up under the boards */
    return c; });
}
/* the nest's rim, behind the hero: a low basket of stakes and a woven band across 514..516 (called with the nest's left tile) */
function nestRim(g, x, y) {
  for (let i = 0; i < 52; i += 6) { rect(g, x - 2 + i, y - 11, 3, 11, ST.o); rect(g, x - 1 + i, y - 10, 1, 10, ST.w3); px(g, x - 1 + i, y - 11, ST.bone); }   /* pointed ribs */
  rect(g, x - 2, y - 7, 52, 3, ST.o); rect(g, x - 2, y - 6, 52, 1, ST.r1); rect(g, x - 2, y - 5, 52, 1, ST.r0); for (let i = 1; i < 52; i += 4) px(g, x - 2 + i, y - 6, ST.r2);   /* the woven band */
}

/* the rope bridge's hand-lines. The plank row at each tile is read off the grid; the line follows it 22 px up, smoothed, with a newel at each end and hangers every 3 px... every 12 */
function ropeSprite(p, L) {
  if (p._c) return p._c;
  const x0 = p.x, x1 = p.x1, n = x1 - x0 + 1, W = n * TS, rows = [];
  for (let x = x0; x <= x1; x++) { let r = p.y; for (let y = p.y - 1; y <= p.y + 3; y++) { const t = L.grid[y * L.W + x]; if (t === T.PLANK || t === T.ONEWAY) { r = y; break; } } rows.push(r); }
  const minRow = Math.min(...rows), base = (minRow - 3) * TS;   /* the canvas's top is three tiles over the highest plank */
  const maxRow = Math.max(...rows), H = (maxRow - minRow + 4) * TS;
  const [c, g] = canvas(W + 8, H);
  const topAt = px0 => { const i = Math.max(0, Math.min(n - 1, Math.floor(px0 / TS))); return rows[i] * TS; };   /* plank top at a pixel */
  const sm = px0 => { let s = 0, k = 0; for (let d = -14; d <= 14; d += 2) { s += topAt(px0 + d); k++; } return s / k; };
  const yAt = px0 => sm(px0) - 22 - base;
  const rail = (g2, off) => { let prev = null; for (let xx = 4; xx < W - 4; xx++) { const yy = R(yAt(xx)) + off; g2.fillStyle = off ? ST.r0 : ST.r1; g2.fillRect(xx + 4, yy, 1, 2); if (!off) { g2.fillStyle = ST.r2; g2.fillRect(xx + 4, yy, 1, 1); } prev = yy; } };
  for (let xx = 8; xx < W - 6; xx += 12) { const yy = R(yAt(xx)), pl = R(topAt(xx)) - base; g.fillStyle = ST.r0; g.fillRect(xx + 4, yy + 2, 1, Math.max(0, pl - yy - 2)); }   /* the hangers */
  rail(g, 1); rail(g, 0);
  for (const [xx, k] of [[4, 0], [W - 10, n - 1]]) { const top = rows[k] * TS - base; rect(g, xx + 2, top - 26, 6, 26, ST.o); rect(g, xx + 3, top - 25, 4, 25, ST.w2); rect(g, xx + 3, top - 25, 1, 25, ST.w4); lash(g, xx + 1, top - 22, 8); lash(g, xx + 1, top - 8, 8); rect(g, xx + 2, top - 27, 6, 1, ST.o); px(g, xx + 3, top - 26, ST.w5); }   /* the newels */
  p._c = c; p._oy = base; p._ox = x0 * TS - 4; return c;
}

export function drawSupport(g, p, cx, cy, L) {
  const k = p.kind, X = p.x * TS, top = (p.y + 1) * TS - cy, bot = p.bottom * TS - cy;
  if (k === 'stkrope') { if (!L || !L.grid) return; const c = ropeSprite(p, L); g.drawImage(c, R(p._ox - cx), R(p._oy - cy)); return; }
  const len = Math.round(bot - top + 11);   /* from 5 px under the deck's top edge (the default post starts at y*16+5) */
  if (len < 4) return;
  const y0 = p.y * TS + 5 - cy;
  if (k === 'stkpost') { g.drawImage(poleSprite(len), R(X - cx), R(y0)); return; }
  if (k === 'stktrestle') { g.drawImage(trestleSprite(len), R(X - cx), R(y0)); return; }
  if (k === 'stkprop') { g.drawImage(propSprite(len), R(X - cx), R(y0)); return; }
  if (k === 'stkleg') { const gap = (p.gap || 16) + 5; g.drawImage(legSprite(len, gap), R(X - gap - cx), R(y0)); return; }
  if (k === 'stkmast') { g.drawImage(mastSprite(len), R(X - cx), R(y0)); if (p.nest) nestRim(g, R(X - TS - cx), R(p.y * TS - cy)); return; }
}

/* ================================================================ LOG PILES */
/* logs end-on in a lashed pyramid (three below, one on top), a stake behind it with the lashing's rope across, a knot at the top */
function logEnd(g, cx, cy, r, v) {
  circle(g, cx, cy, r, ST.o); circle(g, cx, cy, r - 1, ST.w3); circle(g, cx, cy, r - 2, ST.w5); circle(g, cx, cy, 1.5, ST.w3); px(g, cx, cy, ST.w2);
  px(g, cx - r + 1, cy - 1, ST.w2); px(g, cx + r - 2, cy + 1, ST.w1); if (v & 1) px(g, cx + 1, cy - 2, ST.w4);
}
/* the stake the lashing is made fast to, stood at the walk's edge behind the pile (it stays when the logs go: a cut rope end hangs from its knot) */
function stakeSprite(cut) {
  return once('stake' + cut, () => { const [c, g] = canvas(12, 34);
    rect(g, 3, 0, 6, 34, ST.o); rect(g, 4, 1, 4, 33, ST.w2); rect(g, 4, 1, 1, 33, ST.w4); rect(g, 7, 1, 1, 33, ST.w1); px(g, 5, 0, ST.boneLo);
    if (cut) { rect(g, 3, 10, 6, 3, ST.r1); rect(g, 3, 10, 6, 1, ST.r2); rect(g, 7, 13, 2, 6, ST.r1); px(g, 8, 18, ST.r0); }   /* the cut end, hanging */
    else { rect(g, 3, 10, 6, 4, ST.r1); rect(g, 3, 10, 6, 1, ST.r2); rect(g, 4, 11, 4, 2, ST.r0); }                          /* the knot */
    return c; });
}
function pileSprite() {
  return once('pile', () => { const [c, g] = canvas(30, 22);
    for (const [x, y, v] of [[7, 17, 0], [15, 17, 1], [23, 17, 2], [15, 9, 3]]) logEnd(g, x, y, 4, v);                         /* the four logs end-on */
    rect(g, 4, 12, 22, 3, ST.o); rect(g, 4, 13, 22, 1, ST.r1); rect(g, 4, 12, 22, 1, ST.r0); for (let x = 5; x < 26; x += 3) px(g, x, 13, ST.r2);    /* the lashing round the pile, across */
    rect(g, 13, 3, 4, 9, ST.r1); rect(g, 13, 3, 1, 9, ST.r2); rect(g, 16, 3, 1, 9, ST.r0);                                    /* its tail up to the stake's knot */
    return c; });
}
function heapSprite() {
  return once('heap', () => { const [c, g] = canvas(44, 14);
    for (const [x, y, v] of [[8, 9, 0], [18, 9, 1], [29, 9, 2], [38, 10, 3]]) logEnd(g, x, y, 4, v);
    logH(g, 12, 0, 18, 6, 3); rect(g, 3, 11, 10, 3, ST.o); rect(g, 4, 11, 8, 2, ST.w2);                                       /* one log rolled across the rest, a split one beside them */
    for (const [x, y] of [[2, 12], [15, 12], [26, 13], [41, 12], [33, 11]]) { px(g, x, y, ST.w5); px(g, x + 1, y, ST.w4); }    /* chips */
    rect(g, 22, 5, 8, 2, ST.r1); px(g, 25, 6, ST.r0);                                                                       /* the lashing, cut, fallen across */
    return c; });
}
export function drawPile(g, p, cx, cy, time) {
  const x = R(p.x - cx), wy = R(p.y - cy);   /* the walk's edge: where the pile sat */
  g.drawImage(stakeSprite(p.st !== 'hung' && p.st !== 'creak'), x - 6, wy - 34);
  const by = R((p.st === 'fall' || p.st === 'down' ? p.by : p.y) - cy);
  if (p.st === 'down') { g.drawImage(heapSprite(), x - 22, by - 14); return; }
  const sh = p.st === 'creak' ? R(Math.sin(time * 60) * 1.5) : 0;
  if (p.st === 'fall') { const k = Math.min(1, ((p.by - p.y) / Math.max(1, p.floor - p.y))); g.save(); g.translate(x, by - 3); g.rotate(0.3 * k * (p.x & 1 ? 1 : -1)); g.drawImage(pileSprite(), -15, -19); g.restore(); return; }
  g.drawImage(pileSprite(), x - 15 + sh, by - 22);
  if (p.st === 'hung') { const pulse = 0.5 + 0.5 * Math.sin(time * 5); g.globalAlpha = 0.35 + 0.4 * pulse; g.fillStyle = ST.gold; g.fillRect(x - 3, wy - 24, 6, 2); g.fillRect(x - 1, wy - 26, 2, 6); g.globalAlpha = 1; }   /* the lashing's glint: strike here */
}

/* ================================================================ THE HORN */
function hornSprite(small) {
  return once('horn' + small, () => { const [c, g] = canvas(small ? 13 : 18, small ? 10 : 12);
    const s = small ? 0.72 : 1, P = (x, y) => [R(x * s) + 1, R(y * s) + 1];
    const a = P(1.5, 7), b = P(7, 8), d = P(14, 1.5);            /* a quadratic from the mouthpiece (low left) round to the bell (high right) */
    for (let t = 0; t <= 1.001; t += 0.04) { const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * d[0], y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * d[1], r = (0.6 + t * 2.1) * (small ? 0.8 : 1);
      circle(g, x, y, r, ST.bone); }
    const w = small ? 0 : 1;
    for (let t = 0.05; t <= 1.001; t += 0.05) { const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * d[0], y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * d[1]; px(g, x - 0.5, y + (0.6 + t * 2.1) * 0.7 * (small ? 0.8 : 1), ST.boneLo); }
    px(g, R(a[0]), R(a[1]), ST.brass); px(g, R(a[0]) + 1, R(a[1]) - w, ST.brass);                                // the brass mouthpiece
    const m = P(8.8, 5); rect(g, m[0], m[1] - 1, 1, 3, ST.brass); rect(g, d[0] - 1, d[1] - 1, 2, 3, ST.brassLo);   // a brass band, the bell's rim
    return outline(c, ST.o); });
}
export function drawHornPickup(g, k, cx, cy, time) {
  const x = R(k.x - cx), y = R(k.y - cy), b = R(Math.sin(time * 4) * 1.5);
  g.drawImage(hornSprite(false), x - 8, y - 12 + b);
  g.globalAlpha = 0.4 + 0.4 * Math.sin(time * 6); g.fillStyle = ST.gold; g.fillRect(x + 4, y - 17 + b, 2, 2); g.fillRect(x + 3, y - 16 + b, 4, 1); g.globalAlpha = 1;
}
export function drawBeltHorn(g, x, y, ready) {
  g.drawImage(hornSprite(true), x + 4, y + 8); if (!ready) { g.globalAlpha = 0.5; g.fillStyle = '#2a2018'; g.fillRect(x + 4, y + 8, 11, 8); g.globalAlpha = 1; } else { g.fillStyle = ST.gold; g.fillRect(x + 13, y + 8, 1, 1); }
}
/* at the blower's mouth (drawHornTell): the horn raised, its bell forward. (x, y) = the mouth; f = facing */
export function drawMouthHorn(g, x, y, f) {
  const s = hornSprite(true); g.save(); g.translate(x, y); g.scale(f < 0 ? -1 : 1, 1); g.drawImage(s, 1, -6); g.restore();
}
/* the dozing blower's Zs: rising, fading, three of them in turn */
export function drawZs(g, x, y, time) {
  for (let i = 0; i < 3; i++) { const k = ((time * 0.5 + i / 3) % 1), zx = R(x + 3 + k * 7 + i), zy = R(y - 4 - k * 14), s = i === 1 ? 3 : 2; g.globalAlpha = Math.max(0, Math.min(1, (1 - k) * 1.4));
    g.fillStyle = ST.o; g.fillRect(zx - 1, zy - 1, s + 3, s + 3); g.fillStyle = ST.bone; g.fillRect(zx, zy, s + 1, 1); g.fillRect(zx + s, zy + 1, 1, 1); if (s > 2) g.fillRect(zx + 1, zy + 2, 1, 1); g.fillRect(zx, zy + s, s + 1, 1); }
  g.globalAlpha = 1;
}

/* ================================================================ THE BARRED GATE (overlays) */
/* the bar across the gate, in its bracket; lifting off (t = the opening delay's progress 0..1) then fallen at the foot. `open`: the leaves swing back against the posts (age 0..) */
const GATE_H = n => n * TS;
export function drawGate(g, gt, cx, cy, st, time) {
  const x = R(gt.x * TS - cx), y0 = R(gt.y0 * TS - cy), n = gt.y1 - gt.y0 + 1, H = GATE_H(n);
  const bar = (bx, by, ang) => { g.save(); g.translate(bx, by); g.rotate(ang); g.fillStyle = ST.o; g.fillRect(-12, -3, 27, 6); g.fillStyle = ST.w3; g.fillRect(-11, -2, 25, 4); g.fillStyle = ST.w5; g.fillRect(-11, -2, 25, 1); g.fillStyle = ST.w1; g.fillRect(-11, 1, 25, 1);
    g.fillStyle = ST.w5; g.fillRect(13, -2, 1, 4); g.fillStyle = ST.w2; g.fillRect(-11, -2, 1, 4); g.restore(); };
  if (!st.open) {
    const lift = st.lifting ? Math.min(1, st.lifting) : 0;   /* the bar slides up and off to the right as the crew inside haul it */
    bar(x + 8 + R(lift * 6), y0 + 3 * TS + 8 - R(lift * 10), -lift * 0.25);
    return;
  }
  const k = Math.min(1, st.age / 0.35), w = R(16 - 11 * k);   /* the leaves fold back: a strip against the post, its far edge shown */
  g.fillStyle = ST.o; g.fillRect(x + 16 - w - 1, y0, w + 1, H);
  for (let s = 0; s < w; s += 3) { g.fillStyle = (s / 3) & 1 ? ST.w2 : ST.w3; g.fillRect(x + 16 - w + s, y0 + 1, Math.min(3, w - s), H - 1); }
  g.fillStyle = ST.w1; g.fillRect(x + 16 - w, y0 + 5 * 1, w, 1);
  for (const ry of [1, Math.min(5, n - 2)]) { g.fillStyle = ST.o; g.fillRect(x + 16 - w - 1, y0 + ry * TS + 5, w + 1, 5); g.fillStyle = ST.w3; g.fillRect(x + 16 - w, y0 + ry * TS + 6, w, 3); g.fillStyle = ST.w5; g.fillRect(x + 16 - w, y0 + ry * TS + 6, w, 1); }
  g.fillStyle = ST.iron; g.fillRect(x + 14, y0 + TS + 6, 2, 3); g.fillRect(x + 14, y0 + 5 * TS + 6, 2, 3);
  bar(x + 3, y0 + H - 4, -0.05);   /* the bar, thrown down inside */
}

/* ================================================================ THE WAR TOWER */
/* dimensions (local, origin = the tower's centre at its foot on the dais): H = foot to the deck's top */
function towerSprite(h, which) {
  return once('wt' + h + which, () => { const W = 48, top = 30, [c, g] = canvas(W, h + top + 6), cx0 = 24, base = h + top;   // deck top at y = top
    if (which === 'body') {
      /* the legs: splayed, outlined logs; the cross-braces and a rope ladder up the front */
      const leg = (sx) => { for (let y = 0; y < h; y++) { const x = R(cx0 + sx * (11 + y / h * 2.4)); rect(g, x - 3, top + y, 6, 1, ST.o); rect(g, x - 2, top + y, 4, 1, ST.w2); px(g, x - 2, top + y, ST.w4); px(g, x + 1, top + y, ST.w1); if (y % 9 === 4) px(g, x, top + y, ST.w0); } };
      leg(-1); leg(1);
      brace(g, cx0 - 10, top + 6, cx0 + 11, top + h - 12, 2); brace(g, cx0 + 10, top + 6, cx0 - 11, top + h - 12, 2);
      for (const y of [8, h - 14]) { logH(g, cx0 - 12, top + y, 25, 4, y); lash(g, cx0 - 13, top + y, 3); lash(g, cx0 + 10, top + y, 3); }
      rect(g, cx0 - 2, top + 5, 1, h - 7, ST.r1); rect(g, cx0 + 3, top + 5, 1, h - 7, ST.r1);                  /* the rope ladder: two lines, a rung every 6 */
      for (let y = top + 8; y < top + h - 4; y += 6) { rect(g, cx0 - 2, y, 6, 2, ST.o); rect(g, cx0 - 1, y, 4, 1, ST.w3); }
      rect(g, cx0 - 14, top + h - 3, 28, 3, ST.o); rect(g, cx0 - 13, top + h - 3, 26, 2, ST.w2);               /* the foot-beam on the dais */
      rect(g, cx0 - 18, top - 1, 36, 6, ST.o); rect(g, cx0 - 17, top, 34, 4, ST.w3); rect(g, cx0 - 17, top, 34, 1, ST.w5); rect(g, cx0 - 17, top + 3, 34, 1, ST.w1);   /* the deck */
      for (let x = cx0 - 14; x < cx0 + 16; x += 7) px(g, x, top + 1, ST.w1);
      for (const x of [cx0 - 18, cx0 + 15]) { rect(g, x, top + 4, 3, 4, ST.o); rect(g, x, top + 5, 2, 2, ST.w4); }                                         /* beam ends past the deck, lashed */
      /* the pennant: a pole off the back corner, a red hide flag with a goblin skull */
      rect(g, cx0 + 12, top - 24, 3, 25, ST.o); rect(g, cx0 + 13, top - 23, 1, 24, ST.w4);
      rect(g, cx0 + 3, top - 23, 10, 12, ST.o); rect(g, cx0 + 4, top - 22, 8, 10, ST.red); rect(g, cx0 + 4, top - 22, 8, 1, ST.red); rect(g, cx0 + 4, top - 13, 8, 1, ST.redLo); rect(g, cx0 + 4, top - 18, 8, 2, ST.redLo);
      rect(g, cx0 + 6, top - 20, 4, 3, ST.bone); px(g, cx0 + 6, top - 19, ST.o); px(g, cx0 + 9, top - 19, ST.o); rect(g, cx0 + 7, top - 17, 2, 1, ST.bone);
      /* skull trophies lashed on the legs */
      for (const sx of [-1, 1]) { const x = R(cx0 + sx * 13.5), y = top + 16; rect(g, x - 2, y, 5, 4, ST.o); rect(g, x - 1, y + 1, 3, 2, ST.bone); px(g, x - 1, y + 1, ST.o); px(g, x + 1, y + 1, ST.o); }
    } else {   /* the front parapet: a rail of pointed stakes along the deck's front edge, lashed */
      for (let x = cx0 - 16; x < cx0 + 16; x += 5) { rect(g, x, top - 9, 3, 9, ST.o); rect(g, x + 1, top - 8, 1, 8, ST.w4); px(g, x + 1, top - 9, ST.boneLo); rect(g, x + 1, top - 8, 2, 8, ST.w2); rect(g, x + 1, top - 8, 1, 8, ST.w3); }
      rect(g, cx0 - 17, top - 5, 34, 3, ST.o); rect(g, cx0 - 17, top - 4, 34, 1, ST.r1); rect(g, cx0 - 17, top - 3, 34, 1, ST.r0);
    }
    return c; });
}
function wreckSprite() {
  return once('wreck', () => { const [c, g] = canvas(64, 22);
    logH(g, 2, 14, 30, 5, 1); logH(g, 24, 16, 30, 5, 5); brace(g, 8, 13, 30, 3, 3); brace(g, 34, 12, 55, 18, 3); logH(g, 14, 9, 22, 4, 2);
    rect(g, 36, 6, 22, 4, ST.o); rect(g, 37, 7, 20, 2, ST.w3); rect(g, 37, 7, 20, 1, ST.w5);                                  /* a piece of the deck */
    for (const x of [6, 20, 44, 58]) { rect(g, x, 18, 3, 4, ST.w1); px(g, x, 18, ST.w4); }                                       /* stumps and chips */
    rect(g, 40, 12, 12, 5, ST.o); rect(g, 41, 13, 10, 3, ST.red); rect(g, 41, 13, 10, 1, ST.redLo); rect(g, 44, 14, 4, 2, ST.bone);   /* the pennant, torn, lying */
    for (let x = 4; x < 60; x += 9) px(g, x, 21, ST.w2);
    rect(g, 12, 17, 9, 2, ST.r1); px(g, 15, 18, ST.r0);                                                                          /* a cut rope */
    return c; });
}
/* the lashing: a rope from the deck corner (ax, ay) to the peg (bx, by). slack = sagging, otherwise taut (pale, twisted) */
function rope(g, ax, ay, bx, by, taut, time) {
  let prev = null; const n = Math.max(8, Math.abs(bx - ax));
  for (let i = 0; i <= n; i++) { const t = i / n, x = R(ax + (bx - ax) * t), y = R(ay + (by - ay) * t + (taut ? 0 : Math.sin(t * Math.PI) * 11));
    g.fillStyle = ST.o; g.fillRect(x, y - 1, 1, 3); g.fillStyle = (i >> 1) & 1 ? (taut ? ST.r2 : ST.r1) : (taut ? ST.r1 : ST.r0); g.fillRect(x, y, 1, 2); prev = y; }
}
function peg(g, px0, foot, cut, taut, time) {
  g.fillStyle = ST.o; g.fillRect(px0 - 3, foot - 11, 7, 11); g.fillStyle = cut ? ST.w1 : ST.w3; g.fillRect(px0 - 2, foot - 10, 5, 10); g.fillStyle = cut ? ST.w2 : ST.w5; g.fillRect(px0 - 2, foot - 10, 1, 10);
  g.fillStyle = ST.o; g.fillRect(px0 - 4, foot - 12, 9, 2); g.fillStyle = cut ? ST.w2 : ST.w4; g.fillRect(px0 - 3, foot - 12, 7, 1);   /* its splayed head */
  g.fillStyle = ST.iron; g.fillRect(px0 - 4, foot - 7, 9, 2); g.fillStyle = ST.ironHi; g.fillRect(px0 - 4, foot - 7, 9, 1);        /* an iron collar */
  if (cut) { g.fillStyle = ST.r1; g.fillRect(px0 - 2, foot - 16, 2, 4); g.fillRect(px0 + 1, foot - 15, 2, 3); g.fillStyle = ST.r0; g.fillRect(px0, foot - 16, 1, 2); }   /* a frayed stub */
  else if (taut) { g.globalAlpha = 0.45 + 0.45 * Math.sin(time * 6); g.fillStyle = ST.gold; g.fillRect(px0 - 5, foot - 15, 10, 2); g.fillRect(px0 - 1, foot - 18, 2, 8); g.globalAlpha = 1; }
}
/* the tower's draw angle: the lurch (a cut lashing: it rocks toward the one still taut) and the fall */
function towerAngle(t, time) {
  if (t.st === 'fall') return t.dir * t.fallK * t.fallK * 1.45;
  if (t.sway > 0) { const lean = t.pegs.filter(q => q.cut).length === 1 ? (t.pegs[0].cut ? 1 : -1) : 0; return lean * 0.045 + Math.sin(time * 22) * 0.025 * Math.min(1, t.sway / 0.5); }
  return 0;
}
export function drawWarTower(g, t, cx, cy, time) {
  const x = R(t.x - cx), base = R((t.base || t.foot) - cy), deck = R(t.deck - cy), foot = R(t.foot - cy), h = base - deck;
  if (t.st === 'down') { g.drawImage(wreckSprite(), x + (t.dir > 0 ? 6 : -70), foot - 22); return; }
  const taut = t.st === 'manned';
  if ((t.st === 'up' || t.st === 'run' || t.st === 'manned' || t.sway > 0) && t.st !== 'fall') for (const pg of t.pegs) {
    const pxx = R(pg.x - cx), side = Math.sign(pxx - x) || 1;
    if (!pg.cut) rope(g, x + side * 17, deck + 3, pxx, foot - 14, taut, time);
    else if (t.sway > 0 || pg.cutT < 0.5) { const sw = pg.cutT !== undefined ? Math.min(1, pg.cutT / 0.4) : 1; for (let i = 0; i < 14; i++) { g.fillStyle = (i >> 1) & 1 ? ST.r1 : ST.r0; g.fillRect(x + side * 17 + R(side * Math.sin(sw * 2) * 2), deck + 3 + i, 1, 2); } }   /* the cut end, hanging off the deck's corner */
    peg(g, pxx, foot, pg.cut, taut, time);
  }
  const ang = towerAngle(t, time);
  g.save(); g.imageSmoothingEnabled = false; g.translate(x, base); if (ang) g.rotate(ang); g.drawImage(towerSprite(h, 'body'), -24, -(h + 30)); g.restore();
  if (t.st === 'fall') for (const pg of t.pegs) peg(g, R(pg.x - cx), foot, pg.cut, false, time);
}
/* the front parapet, over the Chieftain's legs (drawn in the over layer) - the same transform as the body */
export function drawWarTowerFront(g, t, cx, cy, time) {
  if (t.st === 'down') return;
  const x = R(t.x - cx), base = R((t.base || t.foot) - cy), deck = R(t.deck - cy), h = base - deck, ang = towerAngle(t, time);
  g.save(); g.imageSmoothingEnabled = false; g.translate(x, base); if (ang) g.rotate(ang); g.drawImage(towerSprite(h, 'front'), -24, -(h + 30)); g.restore();
}

/* ================================================================ (claude/chief3art) THE POWDER KEG, THE BLAST, HIS HORN BAR, THE LOOKOUT STILTS, THE POWDER STORE */
const hs = n => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
const clamp01 = v => Math.max(0, Math.min(1, v));
const disc = (g, x, y, r, c) => { g.fillStyle = c; for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy + 0.5)); g.fillRect(R(x) - w, R(y) + dy, w * 2 + 1, 1); } };

/* THE POWDER KEG: a squat stave keg with two iron hoops, a pale tag with the camp's red burst, a bung - and a fuse cord that burns down (drawKeg / the camp barrels, Stockade only) */
function kegSprite() {
  return once('pkeg', () => { const [c, g] = canvas(12, 14);
    const W = [8, 10, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 10, 8];
    for (let r = 0; r < 14; r++) { const w = W[r], x0 = (12 - w) >> 1; rect(g, x0, r, w, 1, ST.o);
      if (r > 0 && r < 13) { rect(g, x0 + 1, r, w - 2, 1, r === 1 ? ST.w3 : ST.w2); px(g, x0 + 1, r, ST.w4); if (w > 10) px(g, x0 + 2, r, ST.w3); px(g, x0 + w - 2, r, ST.w1); if (w > 10 && r > 1) px(g, x0 + w - 3, r, ST.w1); } }
    for (const x of [3, 6, 9]) for (let r = 4; r < 10; r += 2) px(g, x, r + (x === 6 ? 1 : 0), ST.w1);       /* the staves */
    for (const r of [2, 10]) { rect(g, 0, r, 12, 1, ST.ironHi); rect(g, 0, r + 1, 12, 1, ST.iron); px(g, 0, r, ST.o); px(g, 11, r, ST.o); px(g, 0, r + 1, ST.o); px(g, 11, r + 1, ST.o); px(g, 10, r + 1, ST.ironLo); px(g, 6, r + 1, ST.ironLo); }   /* the hoops */
    rect(g, 3, 5, 6, 4, ST.bone); rect(g, 3, 8, 6, 1, ST.boneLo); px(g, 3, 5, ST.boneLo);                                                               /* the tag */
    for (const [x, y] of [[5, 5], [6, 5], [4, 6], [5, 6], [6, 6], [7, 6], [5, 7], [6, 7]]) px(g, x, y, ST.red); px(g, 5, 7, ST.redLo);                    /* the red burst */
    rect(g, 5, 1, 2, 1, ST.o);                                                                                                                         /* the bung */
    return c; });
}
/* (x, y) = the keg's centre-bottom (the barrel prop's anchor); rot = how far it has rolled; fuseK 0..1 draws the cord burning down from its bung (undefined = unlit: no cord) */
export function drawPowderKeg(g, x, y, rot, fuseK, time) {
  x = R(x); y = R(y);
  g.save(); g.translate(x, y - 7); if (rot) g.rotate(rot); g.drawImage(kegSprite(), -6, -7); g.restore();
  if (fuseK === undefined || fuseK === null) return;
  const a = rot || 0, bx = R(x + Math.sin(a) * 7), by = R(y - 7 - Math.cos(a) * 7), L = 2 + R(7 * clamp01(fuseK));
  for (let i = 0; i < L; i++) { const wob = i > 6 ? 2 : i > 3 ? 1 : 0; px(g, bx + wob + 1, by - i, ST.o); px(g, bx + wob, by - i, (i & 1) ? ST.r1 : ST.r0); }
  const tx = bx + (L > 6 ? 2 : L > 3 ? 1 : 0), ty = by - L, ph = Math.floor(time * 26 + x) % 3;
  g.fillStyle = ph === 0 ? '#fff6e0' : ph === 1 ? '#ffd36b' : '#ff8c3c'; g.fillRect(tx - 1, ty - 1, 3, 3); g.fillStyle = '#fff6e0'; g.fillRect(tx, ty, 1, 1);
  g.fillStyle = '#ffd36b'; g.fillRect(tx + (ph - 1) * 2, ty - 3 - ph, 1, 1); g.fillRect(tx - (ph - 1) * 2 - 1, ty - 2 - ((ph + 1) % 3), 1, 1);                    /* the sparks */
}
/* THE TOLD FUSE: a twisted cord that burns down from the right (white, then gold, then red, flickering at the end), a spark at the burning tip */
export function drawFuseBar(g, x, y, k, time) {
  k = clamp01(k); const w = 14, n = Math.max(1, R(w * k)), c = k > 0.5 ? ST.r2 : k > 0.25 ? ST.gold : '#ff6b6b', a = k > 0.25 ? 1 : 0.55 + 0.45 * Math.sin(time * 30), x0 = R(x - w / 2);
  rect(g, x0 - 1, y - 1, w + 2, 4, '#1b1626'); g.globalAlpha = a; rect(g, x0, y, n, 2, c);
  for (let i = 1; i < n; i += 2) px(g, x0 + i, y + 1, k > 0.5 ? ST.r0 : k > 0.25 ? ST.brassLo : ST.redLo);
  g.globalAlpha = 1; const ph = Math.floor(time * 24) % 3; rect(g, x0 + n, y - 1, 2, 4, ph === 0 ? '#fff6e0' : ph === 1 ? '#ffd36b' : '#ff8c3c'); if (n < w - 2) px(g, x0 + n + 2, y + 1, '#3a3430');
}
/* HIS WAR HORN'S DRAW BAR: a timber plate with iron caps, an ivory horn badge at its head, a gold-then-red fill that pulses, a notch each quarter, and a bone peg per blow
   still wanted (green once it has landed). k 0..1 = how far the horn is drawn; hits/need = blows landed / wanted (need 0 = none shown) */
export function drawHornBar(g, x, y, k, hits, need, time) {
  k = clamp01(k); const w = 26, x0 = R(x - w / 2), pulse = 0.65 + 0.35 * Math.sin(time * (8 + k * 14));
  rect(g, x0 - 5, y - 2, w + 10, 9, ST.o); rect(g, x0 - 4, y - 1, w + 8, 7, ST.w1); rect(g, x0 - 4, y - 1, w + 8, 1, ST.w3); rect(g, x0 - 4, y + 5, w + 8, 1, ST.w0);
  rect(g, x0 - 4, y - 1, 2, 7, ST.iron); rect(g, x0 - 4, y - 1, 2, 1, ST.ironHi); rect(g, x0 + w + 2, y - 1, 2, 7, ST.iron); rect(g, x0 + w + 2, y - 1, 2, 1, ST.ironHi);
  rect(g, x0, y, w, 5, '#1b1626'); const n = Math.max(1, R(w * k)); g.globalAlpha = pulse; rect(g, x0, y + 1, n, 3, k > 0.7 ? '#ff6b6b' : ST.gold); rect(g, x0, y + 1, n, 1, k > 0.7 ? '#ffb0a0' : '#fff0b0'); g.globalAlpha = 1;
  for (const q of [0.25, 0.5, 0.75]) rect(g, x0 + R(w * q), y, 1, 5, ST.o);
  g.drawImage(hornSprite(true), x0 - 12, y - 4);                                                                                                     /* the horn badge */
  if (need > 0) for (let i = 0; i < need; i++) { const px0 = R(x - (need * 8 - 3) / 2) + i * 8, hit = i < hits; rect(g, px0 - 1, y + 7, 7, 6, ST.o); rect(g, px0, y + 8, 5, 4, hit ? '#8fd160' : '#3a3430'); rect(g, px0, y + 8, 5, 1, hit ? '#c8f0a0' : ST.boneLo); px(g, px0 + 2, y + 10, hit ? '#3f6e2c' : ST.boneDp); }
}
/* the Chieftain's loose effects: the horn's note arcs (blowing), a cough of smoke and swimming stars (silenced / blasted). x, y = his feet; f = facing; k = how far the horn is drawn */
export function drawChiefFx(g, kind, x, y, f, k, time) {
  if (kind === 'blow') { const bx = x + f * 10, by = y - 45;
    for (let i = 0; i < 3; i++) { const q = ((time * 1.7 + i / 3) % 1), r = 5 + q * 22; g.globalAlpha = (1 - q) * (0.35 + 0.6 * k); g.strokeStyle = k > 0.7 ? '#ff6b6b' : '#ffd36b'; g.lineWidth = 2; g.beginPath();
      if (f > 0) g.arc(bx, by, r, -1.1, 0.5); else g.arc(bx, by, r, Math.PI - 0.5, Math.PI + 1.1); g.stroke(); }
    g.globalAlpha = 1; return; }
  if (kind === 'silenced') { for (let i = 0; i < 3; i++) { const q = ((time * 1.4 + i / 3) % 1); g.globalAlpha = (1 - q) * 0.8; disc(g, x + f * (12 + q * 8) + i * 2, y - 26 - q * 16, 1 + Math.round(q * 2), '#8a8478'); } g.globalAlpha = 1;
    drawStars(g, x - f * 1, y - 47, time); return; }
  if (kind === 'blasted') { for (let i = 0; i < 4; i++) { const q = ((time * 0.9 + i / 4) % 1); g.globalAlpha = (1 - q) * 0.85; disc(g, x + Math.sin(i * 3 + time * 2) * 5 - f * 3, y - 24 - q * 26, 2 + Math.round(q * 3), i & 1 ? '#3a3430' : '#5a544c'); } g.globalAlpha = 1; drawStars(g, x - f * 3, y - 40, time); }
}
function drawStars(g, x, y, time) { for (let i = 0; i < 3; i++) { const a = time * 4 + i * 2.09, sx = R(x + Math.cos(a) * 9), sy = R(y + Math.sin(a) * 3); g.fillStyle = '#ffd36b'; g.fillRect(sx, sy - 1, 1, 3); g.fillRect(sx - 1, sy, 3, 1); } }

/* ---------------------------------------------------------------- THE BLAST: a flash, a fireball with a hot core, a ring, smoke, flung stakes and hoops, a scorch on the floor.
   kinds: keg (any blast in the camp), store (the powder store's chain: bigger, slower, sacks bursting), legs (a keg at the war tower's feet: splinters), door (the crew's entrance) */
export const BLAST_LIFE = { keg: 0.95, store: 1.5, legs: 1.1, door: 0.7 };
export const newBlast = (x, y, r, kind = 'keg') => ({ x, y, r, kind, t: 0, seed: (x * 7.31 + y * 3.17) % 97 });
function shard(g, x, y, i, big, c) { g.fillStyle = c; if (big) { g.fillRect(x, y, 3 + (i & 1), 2); g.fillStyle = ST.w5; g.fillRect(x, y, 1, 1); } else g.fillRect(x, y, 2, 1 + (i & 1)); }
export function drawBlast(g, b, cx, cy) {
  const life = BLAST_LIFE[b.kind] || 0.95, t = b.t, k = clamp01(t / life), X = R(b.x - cx), Y = R(b.y - cy), big = b.kind === 'store', r0 = b.r * (big ? 1.45 : 1);
  if (X < -120 || X > 440) return;
  if (b.kind === 'door') {   /* the doors flung open: a slit of firelight, a kick of dust */
    g.globalAlpha = (1 - k) * 0.8; g.fillStyle = '#ffd36b'; g.fillRect(X - 2, Y - 40, 4, 40); g.fillStyle = '#ff8c3c'; g.fillRect(X - 5, Y - 36, 10, 36); g.globalAlpha = 1;
    for (let i = 0; i < 5; i++) { const s = (i - 2) * 7 * (0.5 + k); g.globalAlpha = (1 - k) * 0.7; disc(g, X + s, Y - 3 - k * 5 - (i & 1) * 2, 2 + Math.round(k * 3), '#8a7a5a'); } g.globalAlpha = 1; return; }
  /* the scorch on the floor under it */
  if (b.kind !== 'legs') { g.globalAlpha = 0.5 * (t > 0.08 ? 1 - k * k : 0); g.fillStyle = '#14100c'; const rx = Math.round(r0 * 0.62); g.fillRect(X - rx, Y + 5, rx * 2, 2); g.fillRect(X - rx + 4, Y + 3, rx * 2 - 8, 2); g.globalAlpha = 1; }
  if (b.kind !== 'legs') {
    if (t < 0.12) { g.globalAlpha = 1 - t / 0.12; disc(g, X, Y - 2, Math.round(r0 * 0.4), '#fff6e0'); g.globalAlpha = 1; }                        /* the flash */
    const fk = clamp01(t / 0.3), ease = 1 - (1 - fk) * (1 - fk), rf = r0 * (0.2 + 0.42 * ease), fa = t < 0.32 ? 1 : clamp01(1 - (t - 0.32) / (big ? 0.7 : 0.4)), rise = t * (big ? 30 : 22);
    if (fa > 0) { g.globalAlpha = fa;   /* a ragged fireball: seven lobes in four layers, drifting up */
      for (const [col, sc] of [['#8f2f28', 1], ['#c9463d', 0.84], ['#ff8c3c', 0.64], ['#ffd36b', 0.42]]) for (let i = 0; i < 7; i++) { const an = hs(b.seed + i) * 6.283, d = rf * (0.3 + 0.55 * hs(b.seed + i + 3)), lr = rf * (0.5 + 0.35 * hs(b.seed + i + 7)) * sc;
        disc(g, X + Math.cos(an) * d, Y - 5 - rise * (0.4 + hs(b.seed + i + 11)) + Math.sin(an) * d * 0.7, Math.max(1, Math.round(lr)), col); }
      if (t < 0.2) { g.globalAlpha = fa * (1 - t / 0.2); disc(g, X, Y - 5, Math.max(2, Math.round(rf * 0.4)), '#fff6e0'); } g.globalAlpha = 1; }
    if (t < 0.45) { const q = t / 0.45; g.globalAlpha = 0.7 * (1 - q); g.strokeStyle = '#f4ecd8'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y - 3, r0 * (0.35 + 0.8 * q), 0, 7); g.stroke(); g.globalAlpha = 1; }   /* the shock ring */
    if (big && t > 0.18 && t < 0.7) { const q = (t - 0.18) / 0.52; g.globalAlpha = 0.5 * (1 - q); g.strokeStyle = '#ffd36b'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y - 3, r0 * (0.4 + 1.2 * q), 0, 7); g.stroke(); g.globalAlpha = 1; }
    for (let i = 0; i < (big ? 9 : 6); i++) { const q = clamp01((t - 0.12) / (life - 0.12)); if (q <= 0) break; g.globalAlpha = (1 - q) * 0.75; disc(g, X + (hs(b.seed + i) - 0.5) * r0 * 1.5, Y - 8 - q * (22 + hs(b.seed + i + 9) * 22), 3 + Math.round(q * 5 + hs(b.seed + i + 4) * 3), i & 1 ? '#3a3430' : '#4a443c'); } g.globalAlpha = 1;   /* the smoke */
  }
  const legs = b.kind === 'legs', nS = legs ? 14 : big ? 14 : 9;
  for (let i = 0; i < nS; i++) { const a = -0.3 - hs(b.seed + i * 2.1) * 2.5, sp = 50 + hs(b.seed + i * 3.7) * (legs ? 90 : 130), tt = Math.max(0, t - 0.02);   /* flung stakes, hoops and chips */
    const sx = X + Math.cos(a) * sp * tt + (legs ? (i % 2 ? 13 : -13) : 0), sy = Y - (legs ? 14 : 4) + Math.sin(a) * sp * tt + 0.5 * 360 * tt * tt;
    if (t > life * 0.92 || sy > Y + 8) continue; g.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1; shard(g, R(sx), R(sy), i, legs || i % 3 === 0, i % 4 === 3 ? ST.iron : ST.w3); g.globalAlpha = 1; }
  if (big) for (let i = 0; i < 7; i++) { const q = clamp01((t - 0.08) / 0.6); g.globalAlpha = (1 - q) * 0.9; g.fillStyle = i & 1 ? '#d8c9a0' : '#a89a78'; g.fillRect(R(X + (hs(b.seed + i * 5) - 0.5) * r0 * 2.2 * q), R(Y - 10 - q * 36 + hs(b.seed + i) * 14 * q * q * 2), 3, 2); g.globalAlpha = 1; }   /* the sacks, bursting */
  if (legs && t < 0.4) { const q = t / 0.4; g.globalAlpha = 0.8 * (1 - q); for (const s of [-13, 13]) { g.fillStyle = '#ffd36b'; g.fillRect(X + s - 3, Y - 18, 6, 12); g.fillStyle = '#fff6e0'; g.fillRect(X + s - 1, Y - 16, 2, 8); } g.globalAlpha = 1; }
}

/* ---------------------------------------------------------------- THE LOOKOUT ON STAKES (kennels): its stilts, and its fall */
const LK_W = 48, LK_H = 80;
/* three heavy lashed posts under the deck, three lashed wales, an X of braces between the posts, a skull on the middle one, a bed of stones at the foot */
function lookSprite() {
  return once('look', () => { const [c, g] = canvas(LK_W, LK_H);
    const posts = [1, 19, 37];
    for (const x of posts) logV(g, x, 0, 10, LK_H - 7, x);
    for (const [a, b] of [[10, 20], [28, 38]]) { brace(g, a, 26, b, 54, 3); brace(g, b, 26, a, 54, 3); }                                               /* the X braces between the posts */
    for (const y of [4, 28, 52]) { logH(g, 0, y, LK_W, 5, y); for (const x of posts) lash(g, x + 3, y, 5); }                                       /* the wales, lashed at every post */
    rect(g, 22, 36, 5, 5, ST.o); rect(g, 23, 37, 3, 3, ST.bone); px(g, 23, 38, ST.o); px(g, 25, 38, ST.o); rect(g, 24, 40, 1, 1, ST.boneDp);              /* a skull lashed on the middle post */
    rect(g, 0, LK_H - 8, LK_W, 8, ST.dirt); rect(g, 0, LK_H - 8, LK_W, 2, ST.o);                                                                     /* the footing: earth, packed with stones */
    for (const x of [0, 8, 19, 30, 40]) { rect(g, x, LK_H - 6, 8, 4, ST.stone); rect(g, x, LK_H - 6, 8, 1, ST.stoneHi); rect(g, x, LK_H - 3, 8, 1, ST.o); }
    for (const x of posts) { rect(g, x - 1, LK_H - 9, 12, 3, ST.o); rect(g, x, LK_H - 9, 10, 2, ST.w3); }
    return c; });
}
function lookCell(u, v) { return once('lc' + u + v, () => { const [c, g] = canvas(16, 16); g.drawImage(lookSprite(), u * 16, v * 16, 16, 16, 0, 0, 16, 16); return c; }); }
function lookPost() { return once('lookpost', () => { const [c, g] = canvas(12, LK_H); logV(g, 1, 0, 10, LK_H - 7, 3); lash(g, 3, 4, 5); lash(g, 3, 28, 5); lash(g, 3, 52, 5); return c; }); }
function lookDeck() { return once('lookdeck', () => { const [c, g] = canvas(80, 8); rect(g, 0, 0, 80, 8, ST.o); rect(g, 1, 1, 78, 5, ST.w3); rect(g, 1, 1, 78, 1, ST.w5); rect(g, 1, 5, 78, 1, ST.w1); for (let x = 8; x < 78; x += 9) rect(g, x, 1, 1, 5, ST.w1); rect(g, 0, 6, 80, 2, ST.w0); return c; }); }
function lookWreck() {
  return once('lookwreck', () => { const [c, g] = canvas(76, 20);
    logH(g, 2, 12, 34, 5, 2); logH(g, 26, 14, 40, 5, 6); brace(g, 8, 11, 34, 4, 3); brace(g, 40, 12, 70, 17, 3); logH(g, 18, 8, 26, 4, 3);
    rect(g, 40, 5, 26, 5, ST.o); rect(g, 41, 6, 24, 3, ST.w3); rect(g, 41, 6, 24, 1, ST.w5); rect(g, 52, 3, 4, 3, ST.o);                           /* a plank of the deck */
    for (const x of [6, 24, 50, 68]) { rect(g, x, 15, 4, 5, ST.w1); px(g, x, 15, ST.w4); px(g, x + 1, 14, ST.w4); }                                    /* splintered stumps */
    rect(g, 12, 15, 10, 2, ST.r1); rect(g, 56, 16, 8, 2, ST.r0);                                                                                      /* cut ropes */
    for (let x = 3; x < 72; x += 8) px(g, x, 19, ST.w2);
    return c; });
}
/* the fall (t = seconds since the stilts went): the posts topple outward from their feet, the deck breaks in two and drops, the splinters fly, then the heap stays */
export function drawLookFall(g, lo, cx, cy, t) {
  const base = (lo.sy1 + 1) * TS - cy, deckY = (lo.sy0 - 1) * TS - cy, X = R(lo.sx0 * TS - cx), BASE = R(base);
  if (X < -140 || X > 460) return;
  if (t > 0.55) { g.globalAlpha = clamp01((t - 0.55) / 0.5); g.drawImage(lookWreck(), X - 14, BASE - 18); g.globalAlpha = 1; }
  const post = lookPost();
  [[1, -1], [19, 1], [37, 0]].forEach(([p0, dir], i) => {
    if (t > 1.7) return; const q = clamp01(t / (0.85 + i * 0.1)), ang = dir * q * q * 1.45; g.save(); g.translate(X + p0 + 6, BASE - 8); g.globalAlpha = t > 1.2 ? clamp01(1 - (t - 1.2) / 0.5) : 1;
    if (dir) { g.rotate(ang); g.drawImage(post, -6, -(LK_H - 7)); } else { const hh = Math.round((LK_H - 7) * (1 - q * q * 0.8)); g.drawImage(post, 0, 0, 12, LK_H - 7, -6, -hh, 12, hh); }   /* the middle post folds under the deck */
    g.restore(); g.globalAlpha = 1; });
  const dk = lookDeck(), fall = 0.5 * 420 * t * t, floorDrop = (BASE - 6) - (deckY + 8);
  for (const [half, dir] of [[0, -1], [1, 1]]) { if (t > 1.3) break; const dy = Math.min(floorDrop, fall) + (half ? 4 : 0), rot = dir * clamp01(t / 0.7) * 0.5; g.save(); g.globalAlpha = t > 0.9 ? clamp01(1 - (t - 0.9) / 0.4) : 1;
    g.translate(X - 16 + half * 40 + 20, deckY + dy + 4); g.rotate(rot); g.drawImage(dk, half * 40, 0, 40, 8, -20, -4, 40, 8); g.restore(); g.globalAlpha = 1; }
  if (t < 1.2) for (let i = 0; i < 12; i++) { const a = -0.4 - hs(i * 3.1) * 2.3, sp = 40 + hs(i * 1.7) * 90, sx = X + 24 + Math.cos(a) * sp * t, sy = deckY + 10 + Math.sin(a) * sp * t + 0.5 * 360 * t * t; if (sy > BASE) continue; shard(g, R(sx), R(sy), i, i % 3 === 0, ST.w3); }
}
export const lookTile = (L, x, y) => { for (const lo of (L.stockade && L.stockade.lookouts) || []) if (x >= lo.sx0 && x <= lo.sx1 && y >= lo.sy0 && y <= lo.sy1) return lookCell(x - lo.sx0, y - lo.sy0); return null; };

/* ---------------------------------------------------------------- THE POWDER STORE (plateau 556-564): a lashed rack under a hide tarp, kegs on its shelf, sacks stacked at its feet */
const ST_W = 96, ST_H = 58;
function sack(g, x, y) { rect(g, x, y, 10, 9, ST.o); rect(g, x + 1, y + 1, 8, 7, '#b8a888'); rect(g, x + 1, y + 1, 8, 1, '#d8c9a0'); rect(g, x + 1, y + 7, 8, 1, '#8a7a5a'); rect(g, x + 3, y, 4, 2, '#8a7a5a'); px(g, x + 4, y + 4, ST.red); px(g, x + 5, y + 4, ST.red); px(g, x + 4, y + 5, ST.red); }
function storeSprite() {
  return once('store', () => { const [c, g] = canvas(ST_W, ST_H);
    logV(g, 2, 2, 7, ST_H - 4, 3); logV(g, ST_W - 9, 2, 7, ST_H - 4, 6); logV(g, 44, 38, 6, ST_H - 40, 9);                                           /* two posts and a middle prop */
    logH(g, 0, 2, ST_W, 5, 4); lash(g, 2, 2, 7); lash(g, ST_W - 9, 2, 7);                                                                              /* the ridge beam */
    for (const x of [2, ST_W - 9]) { rect(g, x - 1, ST_H - 5, 9, 5, ST.stone); rect(g, x - 1, ST_H - 5, 9, 1, ST.stoneHi); }
    /* the tarp: a patched hide, laced to the beam, scalloped at the hem, a skull charm */
    for (let x = 9; x < ST_W - 9; x++) { const hem = 15 + ((x * 7) % 5 < 2 ? 3 : 0) + Math.round(Math.sin(x / 5) * 1.5); rect(g, x, 7, 1, hem - 7, (x >> 3) & 1 ? '#6b5440' : '#7a6248'); px(g, x, hem, ST.o); px(g, x, 7, '#4a3a2c'); }
    for (const x of [26, 52, 70]) rect(g, x, 9, 1, 6, '#4a3a2c'); for (let x = 10; x < ST_W - 10; x += 6) { px(g, x, 8, ST.r1); px(g, x + 1, 9, ST.r0); }
    rect(g, 45, 15, 5, 5, ST.o); rect(g, 46, 16, 3, 3, ST.bone); px(g, 46, 17, ST.o); px(g, 48, 17, ST.o);
    rect(g, 8, 38, 80, 5, ST.o); rect(g, 8, 39, 80, 3, ST.w3); rect(g, 8, 39, 80, 1, ST.w5); rect(g, 8, 41, 80, 1, ST.w1); lash(g, 2, 39, 7); lash(g, ST_W - 9, 39, 7);   /* the shelf */
    brace(g, 9, 50, 22, 43, 2); brace(g, 87, 50, 74, 43, 2);
    const kg = kegSprite(); for (const x of [14, 28, 58, 72]) g.drawImage(kg, x, 24);                                                                   /* the spare kegs on the shelf */
    for (const [x, y] of [[10, 48], [20, 48], [15, 40]]) sack(g, x, y); for (const [x, y] of [[76, 48], [84, 47]]) sack(g, x, y);                      /* sacks at the feet */
    return c; });
}
function storeScorch() { return once('storeScorch', () => { const [c, g] = canvas(ST_W, ST_H); g.drawImage(storeSprite(), 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(14,8,6,0.7)'; g.fillRect(0, 0, ST_W, ST_H); return c; }); }
/* (x, floor) = the store's centre on the ground; scorch 0..1 = how blackened it is (the blasts leave it) */
export function drawStoreBack(g, x, floor, scorch, cx, cy) {
  const X = R(x - cx - ST_W / 2), Y = R(floor - cy - ST_H); if (X < -ST_W - 40 || X > 440) return;
  g.drawImage(storeSprite(), X, Y); if (scorch > 0) { g.globalAlpha = scorch * 0.85; g.drawImage(storeScorch(), X, Y); g.globalAlpha = 1; }
}
