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
    if (!l && !r) { cobbles(g, v); rect(g, 0, 0, 16, 1, CT.stone4); }   /* (claude/canalfix3) THE STREET: cobbles on the open top, the dressed flag kept for the quay's edge */
    else { rect(g, v * 4 + 3, 1, 1, 4, CT.stone0); for (let i = 0; i < 5; i++) px2(g, (rr() * 16) | 0, 2 + ((rr() * 3) | 0), CT.stone2); }
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
/* a swing bridge's deck (claude/canalfix3: CAST IRON, not boards - a city canal's swing bridge): a riveted chequer plate on a lattice girder */
function bridgeDeck(l, r) {
  return once('br' + l + r, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 4, '#3a4048'); rect(g, 0, 0, 16, 1, '#a8b4bc'); rect(g, 0, 1, 16, 1, '#5a646c');
    for (let x = 1; x < 16; x += 3) px2(g, x, 2, '#6a747c'); rect(g, 0, 4, 16, 1, '#14181c'); rect(g, 0, 5, 16, 1, '#2a3036'); rect(g, 0, 9, 16, 1, '#2a3036');   /* the plate, its chequer, the girder's flanges */
    for (let x = 0; x < 16; x += 6) { for (let k = 0; k < 4; k++) { px2(g, x + k, 5 + k, '#3a4048'); px2(g, x + 5 - k, 5 + k, '#3a4048'); } }                                             /* the lattice */
    for (let x = 2; x < 16; x += 5) px2(g, x, 3, '#c8d0d6');                                                                                                                        /* rivet heads */
    if (l) rect(g, 0, 0, 2, 10, '#22272c'); if (r) rect(g, 14, 0, 2, 10, '#22272c'); return c; });
}
/* (claude/canalfix3, Daniel 10-02: TOO MUCH WOOD - a canal through a city is stone and iron)
   A STONE LEDGE: the towpath, the banks, the wharf - a dressed granite slab with a lit arris, its joints, and a stone corbel under each end */
function stoneLedge(l, r, v) {
  return once('sl' + l + r + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 7, CT.stone1); rect(g, 0, 0, 16, 1, CT.stone4); rect(g, 0, 1, 16, 1, CT.stone3); rect(g, 0, 5, 16, 1, CT.stone0); rect(g, 0, 6, 16, 1, '#161a1c'); rect(g, 0, 7, 16, 1, '#0c0e10');
    rect(g, 3 + v * 5, 1, 1, 5, CT.stone0); for (let k = 0; k < 4; k++) px2(g, (v * 5 + k * 4 + 1) % 16, 3, CT.stone2);                                                      /* a joint, a little texture */
    const corbel = x0 => { rect(g, x0, 7, 5, 2, CT.stone1); rect(g, x0 + 1, 9, 3, 2, CT.stone1); rect(g, x0 + 2, 11, 1, 2, CT.stone1); rect(g, x0, 7, 5, 1, CT.stone2); };
    if (l) { rect(g, 0, 0, 1, 7, CT.stone0); corbel(1); } if (r) { rect(g, 15, 0, 1, 7, CT.stone0); corbel(10); }
    if (!l && !r && v === 1) { rect(g, 7, 7, 2, 1, CT.iron); rect(g, 7, 8, 1, 3, CT.iron); }                                                                              /* an iron bracket under the long runs */
    return c; });
}
/* (claude/canal4art) THE LEGGERS' LEDGE in the tunnel: a granite slab worn pale down the middle by boots, a lit lip and an iron nosing riveted along it, iron strut brackets under it */
function leggersLedge(l, r, v) {
  return once('ll' + l + r + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 7, '#4a4640'); rect(g, 0, 0, 16, 1, '#e0d0a8'); rect(g, 0, 1, 16, 1, '#a89c80'); rect(g, 0, 2, 16, 2, '#6a645a'); rect(g, 0, 4, 16, 1, '#3a3630'); rect(g, 0, 5, 16, 1, '#26231f'); rect(g, 0, 6, 16, 1, '#12100e');
    rect(g, 3 + v * 4, 1, 1, 5, '#2a2622'); for (let k = 0; k < 3; k++) px2(g, (v * 5 + k * 5 + 2) % 16, 2 + (k & 1), '#8a8274');                                   /* a joint, the boots' polish and scuffs */
    for (let x = 2; x < 16; x += 5) px2(g, x, 1, '#c8d0d8');                                                                                                  /* the nosing's rivets */
    rect(g, 0, 7, 16, 1, '#0c0a08');
    const strut = (x0, dir) => { for (let k = 0; k < 6; k++) { px2(g, x0 + dir * k, 8 + k, '#3a4048'); px2(g, x0 + dir * k + 1, 8 + k, '#6a747c'); } rect(g, x0 - 1, 8, 3, 1, '#2a3036'); };
    if (l) { rect(g, 0, 0, 1, 7, '#26231f'); strut(2, 1); } if (r) { rect(g, 15, 0, 1, 7, '#26231f'); strut(13, -1); }
    if (!l && !r && v === 1) { rect(g, 6, 7, 4, 1, '#3a4048'); rect(g, 7, 8, 2, 4, '#3a4048'); rect(g, 7, 8, 1, 4, '#6a747c'); }                                  /* an iron bracket under the long runs */
    return c; });
}
/* A FIREPROOF FLOOR (the warehouse's and the mill's floors): an iron beam with its rivets, and a shallow brick jack-arch sprung under it */
function jackArch(l, r, v) {
  return once('ja' + l + r + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 2, CT.iron); rect(g, 0, 0, 16, 1, CT.iron2); for (let x = 2 + v; x < 16; x += 5) px2(g, x, 1, '#9aa2aa');
    for (let x = 0; x < 16; x++) { const d = Math.round(3 * Math.sin(Math.PI * x / 16)); rect(g, x, 2, 1, 3 + d, ((x >> 1) + v) % 3 ? CT.brick1 : CT.brick2); px2(g, x, 4 + d, CT.mort); }   /* the arch's soffit */
    for (let x = 0; x < 16; x += 4) px2(g, x, 3, CT.mort);
    if (l) rect(g, 0, 0, 2, 7, CT.iron); if (r) rect(g, 14, 0, 2, 7, CT.iron); return c; });
}
/* COBBLES on the top of the street and the quays: rounded setts with a lit crown and the dark between them */
function cobbles(g, v) { for (let row = 0; row < 2; row++) for (let x = -(row ? 2 : 0) - v; x < 16; x += 4) { rect(g, x + 1, 1 + row * 2, 3, 2, row ? CT.stone1 : CT.stone2); px2(g, x + 1, 1 + row * 2, CT.stone3); px2(g, x + 3, 2 + row * 2, CT.stone0); } }
/* (claude/canalfix3) A GRATE: heavy iron bars in a stone frame, the water dark behind them - the line Jenny cannot cross into a safe swim */
function grate(v, vertical) { return once('gr' + v + vertical, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 16, '#0c1820');
  if (vertical) { for (let x = 1; x < 16; x += 4) { rect(g, x, 0, 2, 16, '#3a4048'); rect(g, x, 0, 1, 16, '#6a747c'); } rect(g, 0, 7, 16, 1, '#2a3036'); }
  else { for (let y = 1; y < 16; y += 4) { rect(g, 0, y, 16, 2, '#3a4048'); rect(g, 0, y, 16, 1, '#6a747c'); } for (let x = 3; x < 16; x += 6) rect(g, x, 0, 1, 16, '#2a3036'); }
  for (let k = 0; k < 3; k++) px2(g, (v * 5 + k * 6) % 16, (k * 7 + v) % 16, '#1e3a4a'); return c; }); }
/* A HATCH: an iron grate let into a floor (stand on it; drop through it) */
function hatch() { return once('hatch', () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 4, '#2a3036'); rect(g, 0, 0, 16, 1, '#8a949c'); for (let x = 1; x < 16; x += 3) rect(g, x, 1, 1, 3, '#0c1820'); rect(g, 0, 4, 16, 1, '#0c0e10'); return c; }); }
/* AN IRON LADDER: two flat-bar stiles and round rungs, the canal's own (up a lock wall, a warehouse front) */
function ironLadder(v) {
  return once('lad' + v, () => { const [c, g] = canvas(16, 16); rect(g, 2, 0, 2, 16, '#2a3036'); rect(g, 12, 0, 2, 16, '#2a3036'); rect(g, 2, 0, 1, 16, '#5a646c'); rect(g, 12, 0, 1, 16, '#5a646c');
    for (let y = 2; y < 16; y += 5) { rect(g, 4, y, 8, 1, '#4a525a'); rect(g, 4, y + 1, 8, 1, '#14181c'); } for (const y of [1, 9]) { px2(g, 1, y, '#3a4048'); px2(g, 14, y, '#3a4048'); } return c; });
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
    if ((ctx.grates || []).some(([a, b, c, d]) => x >= a && x <= b && y >= c && y <= d)) return grate(v, (ctx.grates || []).some(([a, b]) => a === b && a === x));   /* (claude/canalfix3) */
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
    const sameRow = k => at(x + k, y) === t, L0 = !sameRow(-1), R0 = !sameRow(1);
    /* (claude/canalfix3, Daniel 10-02: TOO MUCH WOOD) timber only on the odd jetty; the towpaths and banks are stone ledges, the warehouse's and the mill's floors iron and brick */
    if (x >= 248 && x <= 344 && y >= 14 && y <= 16) return leggersLedge(L0, R0, v);   /* (claude/canal4art) the tunnel's ledges */
    if (ctx.hatches && ctx.hatches.has(x + ',' + y)) return hatch();   /* (claude/canalfix3) the hatch into a safe swim */
    if ((ctx.jetties || []).some(([x0, x1, row]) => y === row && x >= x0 && x <= x1)) return towboards(L0, R0, v);
    if ((ctx.rooms || []).some(([x0, x1, y0, y1]) => x >= x0 && x <= x1 && y > y0 && y <= y1)) return jackArch(L0, R0, v);
    return stoneLedge(L0, R0, v);
  }
  if (t === T.NET) return ironLadder(v);   /* (claude/canalfix3) the canal's ladders are iron */
  return null;
}
