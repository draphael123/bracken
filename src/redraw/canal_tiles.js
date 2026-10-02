// canal_tiles.js - THE FOG CANAL's TILE KIT (claude/canalart). Wet brick quays and lock walls (dark red-brown) with a green algae line at every water level a lock can
// stand at, a lit stone coping on every quay edge, the towpath's boards, the swing bridges' decks, the lock gates' black timber (with a white-painted end), and Jenny's
// chamber in slimed green-black stone. Made from px.js primitives; each tile 16x16, baked once and memoised.
//   canalTile(t, x, y, at, ctx) -> the canvas for one cell (or null: the game's own kit draws it); ctx = { T, W, reaches, gates, bridges, weeds, lock }
//   the RULES (as the theatre's kit): every standable edge carries a LIT LIP so it is found from across the water; a wall mass is darker than the floor on it; the bright
//   weed (springy) and the dark weed (flat) are told apart by the weed's own overlay (canal-hands.js), so the boards under bright weed are not drawn here.
import { canvas, px, rect, mulberry } from '../px.js';
import { bakeLockSkins } from './greenteeth_art.js';

export const CT = { brick0: '#241a1c', brick1: '#3a2828', brick2: '#4c3434', brick3: '#5e4440', wet: '#2c3a42', wetL: '#44606a', mort: '#1a1416',
  alg0: '#1e3424', alg1: '#2e5034', alg2: '#4a7a48', stone0: '#2a3236', stone1: '#3a464c', stone2: '#52626a', stone3: '#7a8e94', stone4: '#a4b8bc',
  rub0: '#1c2226', rub1: '#262e32', rub2: '#323c40', ooze0: '#142218', ooze1: '#1e3a28', ooze2: '#2e5a3a', ooze3: '#5a9a5a',
  wood0: '#1e1610', wood1: '#2e2218', wood2: '#46321f', wood3: '#684a2c', wood4: '#8a6a3e', white: '#cfd8d4', iron: '#3a3e44', iron2: '#6a7078', lamp: '#ffcf6a' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const px2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
let SK = null; const skins = () => SK || (SK = bakeLockSkins());

/* a wet brick wall: courses of bricks, a few paler wet ones, the mortar dark */
function brick(v, deep) {
  return once('brick' + v + deep, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 131 + 7); rect(g, 0, 0, 16, 16, CT.mort);
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 4 : 0; for (let bx = -8; bx < 16; bx += 8) { const x = bx + off, tone = r(); rect(g, x + 1, row * 4 + 1, 7, 3, tone < 0.2 ? CT.brick3 : tone < 0.35 ? CT.brick0 : CT.brick1);
      rect(g, x + 1, row * 4 + 1, 7, 1, tone < 0.3 ? CT.brick2 : CT.brick1); if (tone > 0.88) rect(g, x + 2, row * 4 + 2, 2, 1, CT.wetL); } }
    if (deep) { g.globalAlpha = 0.34; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; } return c; });
}
/* the quay's coping: a flagstone with a lit lip and a dark shadow line under */
function coping(v, l, r) {
  return once('cop' + v + l + r, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 17 + 3); rect(g, 0, 0, 16, 16, CT.stone0); rect(g, 0, 0, 16, 5, CT.stone1); rect(g, 0, 0, 16, 1, CT.stone4); rect(g, 0, 1, 16, 1, CT.stone3); rect(g, 0, 5, 16, 1, CT.mort);
    rect(g, v * 4 + 3, 1, 1, 4, CT.stone0); for (let i = 0; i < 5; i++) px2(g, (rr() * 16) | 0, 2 + ((rr() * 3) | 0), CT.stone2);
    for (let y = 6; y < 16; y++) for (let x = 0; x < 16; x++) { const t = (x * 7 + y * 13 + v) % 9; px2(g, x, y, t === 0 ? CT.brick2 : t < 3 ? CT.brick1 : CT.brick0); }
    for (let x = 0; x < 16; x += 8) rect(g, x + (v & 1) * 3, 6, 1, 10, CT.mort); rect(g, 0, 11, 16, 1, CT.mort);
    if (l) rect(g, 0, 0, 1, 16, CT.mort); if (r) rect(g, 15, 0, 1, 16, CT.mort); return c; });
}
/* the water line on a wall: a band of algae at the level a lock can stand at, and a wet stain under it */
function waterline(v, deep) {
  return once('wl' + v + deep, () => { const c = document.createElement('canvas'); c.width = 16; c.height = 16; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(brick(v, deep), 0, 0);
    rect(g, 0, 3, 16, 2, CT.alg0); rect(g, 0, 4, 16, 1, CT.alg1); for (let x = (v * 3) % 4; x < 16; x += 4) { px2(g, x, 5, CT.alg1); px2(g, x + 1, 6, CT.alg0); px2(g, x, 3, CT.alg2); }
    g.globalAlpha = 0.34; rect(g, 0, 5, 16, 11, CT.wet); g.globalAlpha = 1; return c; });
}
/* rubble: the heart of a quay, big dim blocks (deep under the coping) */
function rubble(v, deep) {
  return once('rub' + v + deep, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 53 + 1); rect(g, 0, 0, 16, 16, CT.rub0);
    for (let row = 0; row < 2; row++) { let x = (row & 1) * -4; while (x < 16) { const w = 6 + ((r() * 5) | 0); rect(g, x + 1, row * 8 + 1, w - 1, 6, r() < 0.3 ? CT.rub2 : CT.rub1); rect(g, x + 1, row * 8 + 1, w - 1, 1, CT.rub2); x += w; } }
    if (deep) { g.globalAlpha = 0.3; rect(g, 0, 0, 16, 16, '#000'); g.globalAlpha = 1; } return c; });
}
/* the towpath: timber boards on corbels - a lit top, the plank joints, nail heads, a dark underside */
function towboards(l, r, v) {
  return once('tow' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 8, CT.wood2); rect(g, 0, 0, 16, 1, '#a89868'); rect(g, 0, 1, 16, 1, CT.wood4); rect(g, 0, 6, 16, 2, CT.wood1); rect(g, 0, 8, 16, 1, '#0c0806');
    rect(g, 4 + (v & 1) * 6, 2, 1, 4, CT.wood1); rect(g, 11, 2, 1, 4, CT.wood1); px2(g, 2, 4, CT.iron2); px2(g, 8, 4, CT.iron2); px2(g, 14, 4, CT.iron2);
    if (l) { rect(g, 0, 1, 2, 7, CT.wood3); px2(g, 0, 0, CT.wood2); } if (r) { rect(g, 14, 1, 2, 7, CT.wood3); px2(g, 15, 0, CT.wood2); } return c; });
}
/* a swing bridge's deck: pale painted boards (the white rail stands on it) with iron straps */
function bridgeDeck(l, r) {
  return once('br' + l + r, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 6, CT.wood3); rect(g, 0, 0, 16, 1, '#c8c0a0'); rect(g, 0, 1, 16, 1, CT.wood4); rect(g, 0, 5, 16, 1, CT.wood1); rect(g, 0, 6, 16, 2, '#14100c');
    for (let x = 3; x < 16; x += 5) rect(g, x, 2, 1, 3, CT.wood1); rect(g, 0, 7, 16, 1, CT.iron); if (l) rect(g, 0, 0, 2, 7, CT.iron); if (r) rect(g, 14, 0, 2, 7, CT.iron); px2(g, 7, 3, CT.iron2); return c; });
}
/* a lock gate leaf: black tarred timber, vertical planks, an iron strap every eight rows, the top end painted white (the balance beam's counterweight end) */
function gateLeaf(top, v) {
  return once('gt' + top + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, '#1c1610');
    for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 1, 16, '#0e0a08'); rect(g, x + 1, 0, 2, 16, '#2a2018'); rect(g, x + 3, 0, 1, 16, '#342618'); }
    if (v === 0) { rect(g, 0, 4, 16, 2, CT.iron); rect(g, 0, 4, 16, 1, CT.iron2); for (let x = 2; x < 16; x += 6) px2(g, x, 5, '#9aa2aa'); }
    if (v === 1) for (let y = 10; y < 16; y++) for (let x = (y * 3) % 4; x < 16; x += 4) px2(g, x, y, '#2c5a30');
    if (top) { rect(g, 0, 0, 16, 5, CT.white); rect(g, 0, 4, 16, 1, '#8a9894'); rect(g, 0, 0, 16, 1, '#ffffff'); }
    return c; });
}
/* Jenny's chamber: slimed green-black stone, weed hanging in streaks, a wet sheen */
function ooze(v, topFree) {
  return once('ooze' + v + topFree, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 97 + 11); rect(g, 0, 0, 16, 16, CT.ooze0);
    for (let row = 0; row < 4; row++) { const off = (row & 1) ? 4 : 0; for (let bx = -8; bx < 16; bx += 8) { const x = bx + off, t = r(); rect(g, x + 1, row * 4 + 1, 7, 3, t < 0.25 ? CT.ooze2 : CT.ooze1); rect(g, x + 1, row * 4 + 1, 7, 1, t < 0.2 ? CT.ooze3 : CT.ooze2); } }
    for (let i = 0; i < (v === 1 ? 2 : 1); i++) { const x = (r() * 15) | 0, h = 5 + ((r() * 9) | 0); for (let y = 0; y < h; y++) px2(g, x + (y % 5 === 4 ? 1 : 0), y, y < h - 1 ? CT.ooze3 : CT.ooze2); }
    if (topFree) { rect(g, 0, 0, 16, 3, CT.ooze2); rect(g, 0, 0, 16, 1, CT.ooze3); for (let x = 0; x < 16; x += 3) px2(g, x, 3, CT.ooze3); }
    return c; });
}

// ================================ THE HOOK ================================
export function canalTile(t, x, y, at, ctx) {
  const T = ctx.T, air = (dx, dy) => at(x + dx, y + dy) === T.AIR, v = ((x * 7 + y * 13) % 3 + 3) % 3, lk = ctx.lock;
  const inChamber = lk && x >= lk.sx && x <= lk.sx + 39 && y >= lk.R - 16;
  if (t === T.SOLID) {
    if (inChamber) { const sx = lk.sx, ex = sx + 39, R = lk.R, K = skins();
      if ((x === sx || x === ex) && y < R) return K.gate[(y + (x === sx ? 0 : 1)) % 3 === 0 ? 1 : (y > R - 4 ? 2 : 0)];
      if (y === R && x > sx && x < ex) return K.bed[x % 3]; if (y === R + 1 && x > sx && x < ex) return K.bed2;
      if (y === R - 2 && x >= sx + 15 && x <= sx + 24) return K.deck; if (y === R - 1 && x >= sx + 15 && x <= sx + 24) return K.hull; }
    const g = (ctx.gates || []).find(q => q.x === x && y >= q.top && y <= q.bot); if (g) return gateLeaf(y === g.top, (y + x) % 3 === 0 ? 1 : 0);
    const top = air(0, -1), l = air(-1, 0), r = air(1, 0), bl = air(0, 1);
    if (top) return coping(v, l, r);
    if (x >= 371 && x <= 420 && y >= 24 && (l || r || bl)) return ooze(v, false);   /* JENNY'S LOCK: the faces round her chamber are slimed (the heart of the walls stays dim rubble) */
    let depth = 0; for (let k = 1; k <= 6; k++) { if (at(x, y - k) === T.AIR) break; depth++; }
    const lvl = (ctx.levels || []).some(q => y === q.row && x >= q.x0 - 1 && x <= q.x1 + 1);
    const face = l || r || bl;
    if (lvl && face) return waterline(v, 0);
    if (depth >= 3 && !face) return rubble(v, 1);
    return brick(v, depth >= 4 ? 1 : 0);
  }
  if (t === T.ONEWAY) {
    if ((ctx.weedCells || new Set()).has(x + ',' + y)) return once('empty', () => canvas(16, 16)[0]);   /* the weed's own overlay draws its mat (the boards under bright weed are the floor the hero stands on) */
    const br = (ctx.bridges || []).find(b => b.row === y && x >= b.x0 && x <= b.x1); if (br) return bridgeDeck(x === br.x0, x === br.x1);
    if (inChamber) { const sx = lk.sx, ex = sx + 39, R = lk.R, K = skins(); if (y === R - 8 && (x <= sx + 4 || x >= ex - 4)) return K.walk; if (x <= sx + 3 || x >= ex - 3) return K.waler; }
    const sameRow = k => at(x + k, y) === t; return towboards(!sameRow(-1), !sameRow(1), v);
  }
  return null;
}
