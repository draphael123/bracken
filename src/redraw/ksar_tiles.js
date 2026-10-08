// ksar_tiles.js - THE BANDIT KSAR's own TILE KIT (claude/ksar art pass). It used to wear the caravan's pale sandstone sheet. Now:
//   MUD-BRICK   the fort: red-brown sun-baked brick in 8 px courses, each brick its own shade, straw-flecked, with patches of ochre plaster that have flaked
//               off to show the brick; windows (a dark arched niche with a sill) and arrow slits in the walls; PALM-LOG ROOF BEAMS (vigas) poking out under every
//               flat roof, and a pale baked coping on top.
//   ASHLAR      the gatehouse, the great gong's tower, the Hawk Tower and the courtyard: big cut blocks of pale grey-cream limestone, chiselled edges, a dark joint,
//               a hanging cornice, arrow slits. A COOLER stone than the brick, so the places the fort's masters built read apart from its mud walls.
//   BEDROCK     the wadi's red strata under the fort (rows 37 and down) and the road's earth: dark madder bands with a lit lip.
//   ROAD        the caravan road and the wadi bank (columns 0-71): packed earth with pebbles, cart-ruts, a bleached top.
//   FLAGS       the courtyard's floor: laid flagstones with moss-dark joints.
//   RUBBLE      the BREACHES' lips (a broken-brick profile, the bricks' ends showing) and the stakes in the pit (SPIKE: sharpened palm poles in a heap of broken brick);
//               the ROOF GAPS' lips crumble the same way (the cells beside a drop).
//   LEDGES      (ONEWAY) a stone slab corbelled out of a wall where it is keyed to one; a lashed PALM-LOG scaffold beam where it stands free.
// Made from px.js primitives, 16x16, baked once and memoised.   ksarTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect } from '../px.js';

export const KP = {
  brick: ['#b4714a', '#a5643f', '#9a5a38', '#bb7a52', '#8f5233'], mort: '#6a3a26', mortL: '#7e4a30', brickHi: '#d0956a', brickLo: '#7a4429',
  plaster: ['#dcc08e', '#d2b27c', '#c9a76f'], plasterEdge: '#9a7a52', plasterShade: '#b8946a',
  ash: ['#d2cfc2', '#c6c3b4', '#b9b5a4', '#ccc9ba'], ashJoint: '#6a685e', ashHi: '#ece9de', ashLo: '#8c8a7c', ashDeep: '#58564e',
  coping: '#e6cf9e', copingSh: '#8a5a3a',
  bed: ['#5c3a30', '#6c4636', '#4c2f2a', '#7a5040', '#583826'], bedLip: '#a0704f', bedDark: '#3a2420',
  earth: ['#cfa271', '#c19464', '#b3875a', '#a47a50'], earthDeep: ['#8e5f42', '#7c5038', '#6a4230'], pebble: ['#e8d4a8', '#9a7a58', '#7a5a42'],
  flag: ['#cdc2a2', '#c0b592', '#b4a884', '#c8bd9a'], flagJoint: '#6a604a', flagMoss: '#6e6a3c',
  log: '#6a4528', logHi: '#9a6a3c', logLo: '#3e2616', logEnd: '#b88a52', rope: '#d0b27a', ropeLo: '#8a6c42',
  stake: '#8a6238', stakeHi: '#c9a468', stakeTip: '#efe0b0', stakeLo: '#4a3018', rubble: ['#a5643f', '#8f5233', '#b4714a', '#7a4429'],
  void: '#1d1218', voidHi: '#2e1f26', sill: '#e0c898',
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
/* smooth-ish value noise in tile-pixel space for plaster patches */
const vn = (wx, wy, s) => { const x0 = Math.floor(wx / s), y0 = Math.floor(wy / s), fx = wx / s - x0, fy = wy / s - y0, h = (a, b) => (hash(a, b) % 1000) / 1000;
  const a = h(x0, y0), b = h(x0 + 1, y0), c = h(x0, y0 + 1), d = h(x0 + 1, y0 + 1); return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy; };

/* ---------------------------------------------------------------- the level's own map of materials (columns and rows in tiles) */
export const ZONES = {
  ashlar: [[232, 238, 25, 36], [257, 272, 15, 36], [560, 575, 9, 20], [576, 583, 26, 36], [584, 640, 0, 36]],   /* the great gong's tower, the gatehouse, the Hawk Tower, the shaft, the courtyard */
  plinthRow: 37,                                                                                        /* rows from here down are the wadi's bedrock (the fort stands on it) */
  roadTo: 71, wallFrom: 72,
  flags: [[584, 640, 33, 36], [239, 256, 34, 36], [273, 355, 34, 36]],                                        /* laid flagstones: the courtyard, the yard, the souq's floor */
  plaster: [[356, 445, 25, 36], [273, 355, 28, 36]],                                                    /* the store and the terrace and the souq are plastered brick */
  roofs: [[356, 445, 25, 25], [445, 583, 15, 22], [308, 326, 29, 29], [41, 51, 28, 28], [108, 122, 22, 22], [382, 388, 19, 19], [542, 553, 15, 15]],   /* rows with vigas under them */
};
const inZ = (zs, x, y) => zs.some(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]);
export const isAshlar = (x, y) => inZ(ZONES.ashlar, x, y);
const isFlags = (x, y) => inZ(ZONES.flags, x, y);

/* ---------------------------------------------------------------- MUD-BRICK */
function brickTile(x, y, o) {
  const key = ['b', x % 6, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', o.depth > 3 ? 3 : o.depth, o.pl ? 'P' : '', o.win || '', o.viga ? 'V' : '', o.broken || ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const wx = wx0 + xx, wy = wy0 + yy, r = wy >> 3, off = (r & 1) * 4 + (hash(r, 3) % 2) * 0, cc = (wx + off) >> 3;
      let col = KP.brick[hash(cc, r) % 5]; const bx = (wx + off) & 7, by = wy & 7;
      if (by === 7) col = KP.mort; else if (bx === 7) col = KP.mortL; else if (by === 0) col = KP.brickHi; else if (by === 6 && hash(cc, r) % 3) col = KP.brickLo;
      if (col !== KP.mort && col !== KP.mortL && hash(wx, wy) % 17 === 0) col = hash(wx, wy + 5) % 2 ? KP.brickHi : KP.brickLo;   /* straw flecks and grit */
      if (o.pl) { const n = vn(wx, wy, 9) * 0.65 + vn(wx + 90, wy + 30, 4) * 0.35; if (n > 0.52) { const pc = KP.plaster[hash(wx >> 3, wy >> 3) % 3]; col = n < 0.56 ? KP.plasterEdge : pc; if (col === pc && by === 7 && hash(cc, 9) % 3 === 0) col = KP.plasterShade; } }
      px(g, xx, yy, col); }
    if (o.up) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, KP.coping); px(g, xx, 1, hash(wx0 + xx, 1) % 4 ? KP.coping : KP.brickHi); px(g, xx, 2, KP.copingSh); if (hash(wx0 + xx, wy0) % 5 === 0) px(g, xx, 3, KP.mort); } }
    if (o.aL) { for (let yy = o.up ? 3 : 0; yy < 16; yy++) { px(g, 0, yy, KP.mort); px(g, 1, yy, KP.brickLo); } }
    if (o.aR) { for (let yy = o.up ? 3 : 0; yy < 16; yy++) { px(g, 15, yy, KP.brickHi); px(g, 14, yy, KP.brick[0]); } }
    if (o.aD) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, KP.bedDark); px(g, xx, 14, KP.mort); } }
    if (o.viga) { for (let k = 0; k < 2; k++) { const lx = 1 + k * 8; rect(g, lx, 2, 6, 5, KP.logLo); rect(g, lx + 1, 3, 4, 3, KP.log); rect(g, lx + 1, 3, 4, 1, KP.logHi); px(g, lx + 3, 4, KP.logEnd); px(g, lx + 2, 4, KP.logEnd); rect(g, lx, 7, 6, 1, KP.mort); } }
    if (o.win === 'win') { rect(g, 4, 3, 8, 11, KP.sill); rect(g, 5, 4, 6, 9, KP.void); rect(g, 6, 3, 4, 1, KP.void); rect(g, 5, 4, 1, 9, KP.voidHi); rect(g, 3, 13, 10, 2, KP.sill); rect(g, 3, 15, 10, 1, KP.mort); px(g, 7, 7, KP.voidHi); }
    if (o.win === 'slit') { rect(g, 6, 3, 4, 11, KP.mort); rect(g, 7, 4, 2, 9, KP.void); rect(g, 7, 4, 1, 9, KP.voidHi); }
    if (o.broken) brokenEdge(g, o.broken, wx0, wy0);
    return c; });
}
/* a broken lip: bricks missing on the side facing a breach or a roof gap (L = the open side is to the left, R = right), stepped, the ends of courses showing */
function brokenEdge(g, side, wx0, wy0) {
  for (let yy = 0; yy < 16; yy++) { const depth = [0, 1, 1, 2, 4, 4, 3, 3, 5, 5, 3, 2, 2, 1, 1, 0][(yy + (hash(wx0, wy0) % 4)) % 16]; const w = Math.min(7, depth + (yy >> 3));
    for (let k = 0; k < w; k++) { const xx = side === 'L' ? k : 15 - k; g.clearRect(xx, yy, 1, 1); }
    const e = side === 'L' ? w : 15 - w; if (w > 0) { px(g, e, yy, KP.brickLo); px(g, e + (side === 'L' ? 1 : -1), yy, yy & 1 ? KP.mort : KP.brickLo); } }
  for (let k = 0; k < 3; k++) { const yy = 2 + ((hash(wx0, wy0 + k) % 12)); const xx = side === 'L' ? 6 + (k & 1) : 8 - (k & 1); px(g, xx, yy, KP.mort); }
}

/* ---------------------------------------------------------------- ASHLAR */
function ashlarTile(x, y, o) {
  const key = ['a', x % 5, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', o.cornice ? 'C' : '', o.win || '', o.broken || ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const wx = wx0 + xx, wy = wy0 + yy, r = Math.floor(wy / 11), bw = 20 + (hash(r, 7) % 3) * 6, off = hash(r, 11) % bw, cc = Math.floor((wx + off) / bw), bx = (wx + off) - cc * bw, by = wy - r * 11;
      let col = KP.ash[hash(cc, r) % 4];
      if (by === 10 || bx === bw - 1) col = KP.ashJoint; else if (by === 0 || bx === 0) col = KP.ashHi; else if (by === 9 || bx === bw - 2) col = KP.ashLo;
      else if (hash(wx, wy) % 23 === 0) col = KP.ashLo; else if (hash(wx + 7, wy) % 31 === 0) col = KP.ashHi; else if (by < 4 && bx > 2 && hash(cc, r + 5) % 2 && (bx + by) % 5 === 0) col = KP.ashHi;
      px(g, xx, yy, col); }
    if (o.up) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, KP.ashHi); px(g, xx, 1, KP.ash[0]); px(g, xx, 2, KP.ashLo); px(g, xx, 3, KP.ashJoint); } }
    if (o.cornice) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 13, KP.ashHi); px(g, xx, 14, KP.ashLo); px(g, xx, 15, KP.ashDeep); } }
    if (o.aL) { for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, KP.ashDeep); px(g, 1, yy, KP.ashLo); } }
    if (o.aR) { for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, KP.ashHi); px(g, 14, yy, KP.ash[0]); } }
    if (o.aD) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, KP.ashDeep); px(g, xx, 14, KP.ashLo); } }
    if (o.win === 'slit') { rect(g, 6, 2, 4, 12, KP.ashDeep); rect(g, 7, 3, 2, 10, KP.void); rect(g, 7, 3, 1, 10, KP.voidHi); rect(g, 5, 1, 6, 1, KP.ashHi); }
    if (o.win === 'win') { rect(g, 4, 3, 8, 11, KP.ashHi); rect(g, 5, 4, 6, 10, KP.void); rect(g, 6, 3, 4, 1, KP.void); rect(g, 5, 4, 1, 10, KP.voidHi); }
    if (o.broken) brokenEdge(g, o.broken, wx0, wy0);
    return c; });
}

/* ---------------------------------------------------------------- BEDROCK (the wadi's strata) and the ROAD's earth */
function bedTile(x, y, o) {
  const key = ['r', x % 7, y % 6, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.aD ? 'D' : '', o.road ? 'E' : '', o.road ? Math.min(o.depth, 6) : 0].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy; let col;
      const band = Math.floor((wy + Math.round(2.4 * Math.sin(wx / 23) + 1.3 * Math.sin(wx / 9 + 2))) / 5);
      if (o.road) { const dpx = o.depth * 16 + yy; col = dpx < 4 ? KP.earth[0] : dpx < 20 ? KP.earth[band & 1 ? 1 : 2] : KP.earthDeep[band % 3];
        if (dpx >= 4 && dpx < 40 && hash(wx, wy) % 29 === 0) col = KP.pebble[hash(wx, wy + 2) % 3]; if (dpx < 4 && hash(wx, wy) % 7 === 0) col = KP.earth[1]; }
      else { col = KP.bed[Math.abs(band) % 5]; if (hash(wx, wy) % 19 === 0) col = KP.bed[(Math.abs(band) + 2) % 5]; }
      px(g, xx, yy, col); }
    if (o.up) { for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, o.road ? '#e4c490' : KP.bedLip); if (o.road && hash(wx0 + xx, 4) % 3 === 0) px(g, xx, 1, KP.earth[0]); } }
    if (o.aL) for (let yy = 0; yy < 16; yy++) { px(g, 0, yy, KP.bedDark); }
    if (o.aR) for (let yy = 0; yy < 16; yy++) { px(g, 15, yy, KP.bedLip); }
    if (o.aD) for (let xx = 0; xx < 16; xx++) { px(g, xx, 15, KP.bedDark); }
    return c; });
}

/* ---------------------------------------------------------------- FLAGSTONES */
function flagTile(x, y, o) {
  return once(['f', x % 4, y % 3, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : ''].join(''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16, wy0 = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx, wy = wy0 + yy, r = wy >> 3, off = (r & 1) * 10, cc = (wx + off) / 20 | 0, bx = (wx + off) % 20, by = wy & 7;
      let col = KP.flag[hash(cc, r) % 4]; if (by === 7 || bx === 19) col = KP.flagJoint; else if (by === 0) col = '#e0d6b8'; else if (hash(wx, wy) % 13 === 0) col = KP.ashLo;
      if ((by === 7 || bx === 19) && hash(wx, wy) % 6 === 0) col = KP.flagMoss; px(g, xx, yy, col); }
    if (o.up) for (let xx = 0; xx < 16; xx++) { px(g, xx, 0, '#efe6c8'); px(g, xx, 1, hash(wx0 + xx, 1) % 3 ? KP.flag[0] : '#e0d6b8'); }
    if (o.aL) for (let yy = 0; yy < 16; yy++) px(g, 0, yy, KP.ashDeep);
    if (o.aR) for (let yy = 0; yy < 16; yy++) px(g, 15, yy, KP.ashHi);
    return c; });
}

/* ---------------------------------------------------------------- THE STAKES (SPIKE): broken brick and sharpened palm poles */
function stakeTile(x, y, breachEdge) {
  return once('st' + (x % 3) + (breachEdge || ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    rect(g, 0, 11, 16, 5, KP.mort);
    for (let k = 0; k < 7; k++) { const bx = (k * 3 + (hash(wx0, k) % 2)) % 14, by = 10 + (hash(wx0 + k, 5) % 4), w = 3 + hash(k, wx0) % 3; rect(g, bx, by, w, 3, KP.rubble[hash(k, wx0 + 1) % 4]); rect(g, bx, by, w, 1, KP.brickHi); rect(g, bx, by + 2, w, 1, KP.brickLo); }
    const xs = [2, 6, 10, 13]; xs.forEach((sx, i) => { const lean = (i % 2 ? 1 : -1) * (hash(wx0, i) % 2), top = 1 + (hash(wx0 + i, 8) % 4);
      for (let yy = top + 3; yy < 13; yy++) { const lx = sx + (lean && yy < top + 7 ? lean : 0); px(g, lx, yy, KP.stake); px(g, lx + 1, yy, KP.stakeLo); if (yy % 3 === 0) px(g, lx, yy, KP.stakeHi); }
      px(g, sx + lean, top + 2, KP.stakeHi); px(g, sx + lean, top + 1, KP.stakeTip); px(g, sx + lean + 1, top + 2, KP.stake); px(g, sx + lean, top, KP.stakeTip); });
    for (let k = 0; k < 3; k++) px(g, 1 + ((hash(wx0, k + 30) % 14)), 13 + (k & 1), KP.bedDark);
    return c; });
}

/* ---------------------------------------------------------------- LEDGES (ONEWAY) */
function slabLedge(x, l, r) {
  return once('sl' + (x % 3) + (l ? 'L' : '') + (r ? 'R' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx; let col = yy === 0 ? '#e0d2aa' : yy === 1 ? '#c8b88e' : yy < 4 ? '#b4a47c' : yy === 4 ? '#8a7a58' : KP.ashJoint; if (yy >= 1 && yy < 4 && ((wx & 15) === 15)) col = KP.ashJoint; px(g, xx, yy, col); }
    for (let k = 0; k < 3; k++) px(g, 3 + k * 5, 6, KP.ashDeep);
    if (l) { g.clearRect(0, 0, 1, 2); px(g, 0, 2, KP.ashJoint); } if (r) { g.clearRect(15, 0, 1, 2); px(g, 15, 2, KP.ashJoint); }
    return c; });
}
function beamLedge(x, l, r) {
  return once('bm' + (x % 4) + (l ? 'L' : '') + (r ? 'R' : ''), () => { const [c, g] = canvas(16, 16), wx0 = x * 16;
    for (let yy = 0; yy < 6; yy++) for (let xx = 0; xx < 16; xx++) { const wx = wx0 + xx; let col = yy === 0 ? KP.logHi : yy < 3 ? KP.log : yy < 5 ? KP.logLo : KP.logLo; if (yy >= 1 && yy < 4 && hash(wx >> 1, yy) % 9 === 0) col = KP.logLo; px(g, xx, yy, col); }
    if ((x & 3) === 1) { rect(g, 5, 0, 3, 6, KP.rope); rect(g, 5, 1, 3, 1, KP.ropeLo); rect(g, 5, 3, 3, 1, KP.ropeLo); rect(g, 5, 5, 3, 1, KP.ropeLo); }   /* a lashing */
    if (l) { rect(g, 0, 0, 2, 6, KP.logEnd); px(g, 1, 2, KP.logLo); px(g, 0, 0, '#00000000'); } if (r) { rect(g, 14, 0, 2, 6, KP.logEnd); px(g, 14, 2, KP.logLo); }
    for (let k = 0; k < 2; k++) px(g, 2 + ((hash(wx0, k + 20) % 12)), 6, KP.stakeLo);
    return c; });
}

/* ---------------------------------------------------------------- the entry: which tile is this cell? */
const BREACH_ROW = 28;
export function ksarTile(t, x, y, at, T, L) {
  const open = v => v === T.AIR || v === T.ONEWAY || v === T.SPIKE;
  if (t === T.SPIKE) return stakeTile(x);
  if (t === T.ONEWAY) {
    let a = x, b = x; while (at(a - 1, y) === T.ONEWAY && x - a < 40) a--; while (at(b + 1, y) === T.ONEWAY && b - x < 40) b++;
    const solid = (cx, cy) => at(cx, cy) === T.SOLID, keyed = solid(a - 1, y) || solid(b + 1, y) || solid(a - 1, y + 1) || solid(b + 1, y + 1) || solid(a - 1, y - 1) || solid(b + 1, y - 1);
    const l = x === a, r = x === b; return keyed ? slabLedge(x, l, r) : beamLedge(x, l, r); }
  if (t !== T.SOLID) return null;
  const up = at(x, y - 1), dn = at(x, y + 1), lf = at(x - 1, y), rt = at(x + 1, y);
  const o = { up: up !== T.SOLID, aL: open(lf), aR: open(rt), aD: dn === T.AIR };
  /* the lips beside a breach or a roof gap crumble */
  let broken = null;
  for (const [b0, b1, r0] of L.breaches || []) { if (y >= r0 - 1 && y <= r0 + 3) { if (x === b0 - 1) broken = 'R'; else if (x === b1 + 1) broken = 'L'; } }
  for (const [d0, d1] of L.drops || []) { if (y >= 10) { if (x === d0 - 1) broken = 'R'; else if (x === d1 + 1) broken = 'L'; } }
  let depth = 0; while (at(x, y - 1 - depth) === T.SOLID && depth < 40) depth++;
  if (y >= ZONES.plinthRow && x >= 0) return bedTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD });
  if (x <= ZONES.roadTo) return bedTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD, road: true, depth });
  if (isFlags(x, y) && o.up) return flagTile(x, y, o);
  if (isFlags(x, y) && depth < 3) return flagTile(x, y, o);
  if (isAshlar(x, y)) { const win = depth >= 3 && depth <= 9 && !o.aL && !o.aR && hash(x, y >> 2) % 11 === 0 && (y & 3) === 1 ? 'slit' : (depth >= 2 && !o.aL && !o.aR && hash(x, y >> 1) % 23 === 0 ? 'win' : '');
    return ashlarTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD, win, cornice: depth > 0 && at(x, y + 1) === T.SOLID && at(x, y - 1) === T.SOLID && isAshlar(x, y - 1) && (y & 3) === 0 && false, broken }); }
  const pl = inZ(ZONES.plaster, x, y) && depth > 0 ? hash(x >> 2, y >> 2) % 3 !== 0 : hash(x >> 2, y >> 1) % 5 === 0 && depth > 0;
  const viga = depth === 1 && inZ(ZONES.roofs, x, y - 1) && !o.aL && !o.aR;
  const win = depth >= 3 && depth <= 12 && !o.aL && !o.aR && y < ZONES.plinthRow - 1 ? (hash(x, y) % 41 === 0 ? 'win' : hash(x >> 1, y) % 29 === 0 ? 'slit' : '') : '';
  return brickTile(x, y, { up: o.up, aL: o.aL, aR: o.aR, aD: o.aD, depth, pl, viga, win, broken });
}
export const KSAR_KIT = { ksarTile, KP, ZONES };
