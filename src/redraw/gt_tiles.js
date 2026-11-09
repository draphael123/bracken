// gt_tiles.js - THE GHOST TRAIN's TILE KIT (claude/gtart). The cars ARE the ground you stand on, so the kit paints each car's own iron: riveted roof tin, varnished floors over iron
// girders, panelled end pillars with a night window, the chassis and its truss rods, coal (heaps, tub plates), the engine's boiler plate / brass dome / stack / backhead, and every
// one-way ledge by what it is (gangway tread plate, dining tables, sleeper berths, luggage racks, the ride facade's lit cornices).  Each tile 16x16, baked once and memoised.
//   gtTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it).  Only used while L.ghostTrain (flag on); flag off never reaches here.
// THEME: a haunted railway - iron, brass, varnish gone black-violet, pale lamp-lips on every standable top. No wood, no logs (the cars are iron-framed and panelled).
import { canvas, px, rect, mulberry } from '../px.js';

export const GP = {
  i0: '#12121c', i1: '#1e1e2c', i2: '#2e2e42', i3: '#464660', i4: '#686886', i5: '#8c8caa',
  v0: '#16111c', v1: '#241a2c', v2: '#382a42', v3: '#523c5c', v4: '#6e5478',
  r0: '#1a2030', r1: '#28324a', r2: '#3c4a68', r3: '#5a6c8e', r4: '#86a0c4',
  brass: '#d0aa4a', brassL: '#f0d078', brassD: '#80642a',
  pale: '#dceaf8', paleD: '#9cb4d2', lamp: '#fff0c4', lampD: '#f0c46a',
  coal0: '#08080c', coal1: '#14141c', coal2: '#262632', coal3: '#3e3e50', coal4: '#6a7a9a',
  ember: '#d84a18', emberL: '#ffa83c', rust: '#6a3a28', rustD: '#3e241a',
  night: '#0e1226', night2: '#181e3c', cream: '#d8e0ec', creamD: '#a0acc0', plum: '#6a2a4a', plumD: '#3e1a2e', curt: '#4a2a5a', curtD: '#2c1838', bunk: '#34466a', bunkL: '#52688e' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const p2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const hash = (x, y) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };
const rivets = (g, ys, step, c, off = 0) => { for (const y of ys) for (let x = 2 + off; x < 16; x += step) p2(g, x, y, c); };

function carOf(L, x) { const cs = L.gt && L.gt.cars; if (!cs) return null; for (const c of cs) if (x >= c.x0 && x <= c.x1) return c; return null; }

/* ---------------- the pieces ---------------- */
function roofTile(v, litTop, lEdge, rEdge, under) {
  return once('roof' + v + litTop + lEdge + rEdge + under, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 16, GP.r1);
    if (litTop) { rect(g, 0, 0, 16, 1, GP.r4); rect(g, 0, 1, 16, 1, GP.r3); rect(g, 0, 2, 16, 1, GP.r2); }                               /* the lit lip: the roof's top catches the moon and the lamps */
    for (let x = 0; x < 16; x += 8) { rect(g, x + (v & 1 ? 1 : 0), 3, 1, 8, GP.r0); rect(g, x + 1 + (v & 1 ? 1 : 0), 3, 1, 8, GP.r2); }   /* tin seams */
    rivets(g, [4, 9], 4, GP.r3, v & 3);
    rect(g, 0, 11, 16, 1, GP.r0); rect(g, 0, 12, 16, 4, GP.i1); rect(g, 0, 12, 16, 1, GP.brassD);                                       /* the ceiling cornice under it */
    if (under) { rect(g, 0, 13, 16, 1, GP.v2); for (let x = 1; x < 16; x += 5) p2(g, x, 14, GP.brassD); }
    if (lEdge) rect(g, 0, 0, 1, 16, GP.r0); if (rEdge) rect(g, 15, 0, 1, 16, GP.r0);
    return c; });
}
function wallTile(side, win, door, v) {   /* an end pillar of a closed car: panelled, a night window in the upper cell, brass door furniture */
  return once('wall' + side + win + door + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 16, GP.v1); rect(g, 2, 1, 12, 14, GP.v2); rect(g, 2, 1, 12, 1, GP.v3); rect(g, 2, 14, 12, 1, GP.v0);
    if (win) { rect(g, 3, 3, 10, 9, GP.brassD); rect(g, 4, 4, 8, 7, GP.night); rect(g, 4, 4, 8, 2, GP.night2); rect(g, 9, 4, 1, 7, GP.paleD); p2(g, 6, 7, GP.pale); p2(g, 7, 9, GP.paleD); rect(g, 3, 3, 10, 1, GP.brass); }
    else { rect(g, 4, 3, 8, 10, GP.v1); rect(g, 4, 3, 8, 1, GP.v0); rect(g, 5, 4, 6, 8, GP.v2); }
    if (door) { rect(g, side > 0 ? 0 : 15, 0, 1, 16, GP.brass); rect(g, side > 0 ? 1 : 14, 0, 1, 16, GP.brassD); if (!win) p2(g, side > 0 ? 3 : 12, 8, GP.brassL); }   /* a brass door-frame strip on the doorway's edge */
    rect(g, side > 0 ? 0 : 15, 0, 1, 16, GP.i0);
    return c; });
}
function floorTile(v, kind, litTop, wellGap) {
  return once('floor' + v + kind + litTop + wellGap, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 31 + 7);
    rect(g, 0, 0, 16, 16, GP.i1);
    if (kind === 'iron') {                                                                                               /* engine / tender / coal truck deck: diamond tread plate */
      rect(g, 0, 0, 16, 5, GP.i3); rect(g, 0, 0, 16, 1, GP.i5);
      for (let x = (v & 1) * 2; x < 16; x += 4) { p2(g, x, 2, GP.i5); p2(g, x + 1, 3, GP.i5); p2(g, x + 2, 2, GP.i2); p2(g, x + 1, 1, GP.i4); }
    } else {                                                                                                             /* a carriage floor: varnished boards, a threadbare runner */
      rect(g, 0, 0, 16, 5, GP.v3); rect(g, 0, 0, 16, 1, litTop ? GP.v4 : GP.v3); rect(g, 0, 4, 16, 1, GP.v0);
      for (let x = (v & 3) * 3; x < 16; x += 7) p2(g, x, 2, GP.v2);
      if (v % 4 < 2) { rect(g, 0, 1, 16, 2, GP.curt); rect(g, 0, 1, 16, 1, '#7a4a8a'); for (let x = (v & 1); x < 16; x += 4) p2(g, x, 2, GP.curtD); }   /* the runner's worn violet */
    }
    rect(g, 0, 5, 16, 1, GP.i0); rect(g, 0, 6, 16, 6, GP.i2); rect(g, 0, 6, 16, 1, GP.i3); rect(g, 0, 11, 16, 1, GP.i0);       /* the girder under the boards */
    rivets(g, [8], 4, GP.i4, v & 3); rect(g, 0, 12, 16, 4, GP.i1); rect(g, 0, 12, 16, 1, GP.i3);
    if (wellGap) { rect(g, 0, 12, 16, 4, GP.rustD); for (let i = 0; i < 4; i++) p2(g, (r() * 16) | 0, 12 + ((r() * 4) | 0), GP.rust); }
    return c; });
}
function chassisTile(row, v, edgeL, edgeR) {
  return once('chas' + row + v + edgeL + edgeR, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 16, GP.i0);
    if (row === 0) { rect(g, 0, 0, 16, 3, GP.i3); rect(g, 0, 0, 16, 1, GP.i4);                                         /* the solebar */
      for (let i = 0; i < 16; i++) { p2(g, i, 3 + (i < 8 ? (i >> 1) : ((15 - i) >> 1)), GP.i2); p2(g, i, 4 + (i < 8 ? (i >> 1) : ((15 - i) >> 1)), GP.i3); }   /* a truss rod, down and up */
      rivets(g, [1], 5, GP.i5, v & 3); rect(g, 0, 12, 16, 4, GP.i1); rect(g, 0, 12, 16, 1, GP.i2); }
    else { rect(g, 0, 0, 16, 2, GP.i1); rect(g, 3, 2, 10, 8, GP.i2); rect(g, 3, 2, 10, 1, GP.i3); rect(g, 5, 4, 6, 4, GP.i0);     /* an axle box and the spring over it */
      for (let k = 0; k < 4; k++) rect(g, 2 + k, 10 + (k > 1 ? 3 - k : k), 12 - k * 2, 1, k % 2 ? GP.i3 : GP.i2); rect(g, 0, 14, 16, 2, GP.i0); }
    if (edgeL) rect(g, 0, 0, 1, 16, GP.i1); if (edgeR) rect(g, 15, 0, 1, 16, GP.i1);
    return c; });
}
function coalTile(x, y, top, edgeL, edgeR) {
  const v = hash(x, y) % 5;
  return once('coal' + v + top + edgeL + edgeR, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 53 + 11);
    rect(g, 0, 0, 16, 16, GP.coal1);
    for (let i = 0; i < 22; i++) { const px_ = (r() * 14) | 0, py = (r() * 14) | 0, w = 2 + ((r() * 3) | 0), h = 2 + ((r() * 2) | 0), k = r();
      rect(g, px_, py, w, h, k < 0.3 ? GP.coal0 : k < 0.7 ? GP.coal2 : GP.coal3); p2(g, px_, py, GP.coal4); if (k > 0.82) p2(g, px_ + 1, py + 1, GP.coal4); }
    for (let i = 0; i < 3; i++) p2(g, (r() * 16) | 0, 4 + ((r() * 11) | 0), GP.ember);                                    /* a coal still glowing at the heart of the heap */
    if (top) { rect(g, 0, 0, 16, 3, GP.coal1);
      for (let xx = 0; xx < 16; xx++) { const h = 2 + (((hash(x * 16 + xx, 3) >> 3) % 3)); rect(g, xx, 3 - h + 1, 1, h, (xx + v) % 3 ? GP.coal2 : GP.coal3); if ((xx + v) % 5 === 0) p2(g, xx, 3 - h + 1, GP.coal4); } p2(g, 5 + v, 1, GP.emberL); }
    if (edgeL) rect(g, 0, 0, 1, 16, GP.coal0); if (edgeR) rect(g, 15, 0, 1, 16, GP.coal0);
    return c; });
}
function plateTile(kind, litTop, edgeL, edgeR, v) {   /* tub walls, boiler plate, backhead */
  return once('plate' + kind + litTop + edgeL + edgeR + v, () => { const [c, g] = canvas(16, 16);
    const [a, b, d] = kind === 'boiler' ? [GP.i2, GP.i3, GP.i1] : kind === 'tub' ? [GP.rustD, GP.rust, GP.i1] : [GP.i2, GP.i3, GP.i0];
    rect(g, 0, 0, 16, 16, a); rect(g, 0, 15, 16, 1, d); rect(g, 7 + (v & 1), 0, 1, 16, d); rect(g, 8 + (v & 1), 0, 1, 16, b);
    rivets(g, [2, 13], 3, GP.i5, 1); if (kind === 'tub') { for (let i = 0; i < 5; i++) { p2(g, (hash(v, i) % 16), (hash(i, v) % 16), GP.rustD); p2(g, (hash(v + 4, i) % 16), (hash(i, v + 4) % 16), GP.i4); } rect(g, 3, 4, 3, 1, GP.rust); }
    if (kind === 'boiler') { rect(g, 0, 5, 16, 1, GP.i4); rect(g, 0, 6, 16, 1, GP.i1); if (v & 4) { rect(g, 0, 9, 16, 3, GP.brassD); rect(g, 0, 9, 16, 1, GP.brass); rect(g, 0, 11, 16, 1, GP.brassD); } }   /* brass boiler bands */
    if (litTop) { rect(g, 0, 0, 16, 1, GP.i5); rect(g, 0, 1, 16, 1, GP.i4); }
    if (edgeL) rect(g, 0, 0, 1, 16, d); if (edgeR) rect(g, 15, 0, 1, 16, d);
    return c; });
}
function domeTile(part) {   /* the boiler's brass dome (a 1-cell cap) and the stack's tall black chimney with a flared lip */
  return once('dome' + part, () => { const [c, g] = canvas(16, 16);
    if (part === 'dome') { rect(g, 1, 6, 14, 10, GP.brassD); for (const [x, y, w] of [[3, 3, 10], [5, 1, 6], [6, 0, 4]]) rect(g, x, y, w, 3, GP.brassD); rect(g, 6, 0, 4, 1, GP.brassL); rect(g, 3, 3, 3, 1, GP.brassL); rect(g, 1, 6, 14, 1, GP.brassL); rect(g, 9, 4, 5, 10, GP.i0 + '00'); rect(g, 11, 6, 3, 9, GP.brass); rect(g, 2, 8, 2, 7, GP.brassL); }
    else if (part === 'stackTop') { rect(g, 0, 0, 16, 4, GP.i0); rect(g, 0, 0, 16, 1, GP.i3); rect(g, 1, 4, 14, 12, GP.i1); rect(g, 3, 4, 2, 12, GP.i3); rect(g, 11, 4, 4, 12, GP.i0); rect(g, 1, 4, 14, 1, GP.brassD); }
    else { rect(g, 2, 0, 12, 16, GP.i1); rect(g, 4, 0, 2, 16, GP.i3); rect(g, 11, 0, 3, 16, GP.i0); rect(g, 2, 7, 12, 1, GP.i0); rect(g, 2, 8, 12, 1, GP.i2); }
    return c; });
}
function ledgeTile(kind, v, edgeL, edgeR) {   /* a one-way ledge, by what it is */
  return once('ledge' + kind + v + edgeL + edgeR, () => { const [c, g] = canvas(16, 16);
    if (kind === 'tread') {                                                                                              /* the gangway between cars: iron tread plate with a lit lip */
      rect(g, 0, 0, 16, 4, GP.i3); rect(g, 0, 0, 16, 1, GP.i5); for (let x = (v & 1) * 2; x < 16; x += 4) { p2(g, x, 2, GP.i5); p2(g, x + 2, 1, GP.i4); p2(g, x + 1, 3, GP.i2); } rect(g, 0, 4, 16, 1, GP.i0); rect(g, 0, 5, 16, 2, GP.i2); rect(g, 0, 7, 16, 1, GP.i0); }
    else if (kind === 'cornice') {                                                                                       /* the ride facade's cornice: plum plaster, gold trim, a bulb every 4 px */
      rect(g, 0, 0, 16, 7, GP.plum); rect(g, 0, 0, 16, 2, GP.brass); rect(g, 0, 2, 16, 1, GP.brassD); rect(g, 0, 5, 16, 2, GP.plumD); rect(g, 0, 7, 16, 1, GP.v0);
      for (let x = 1; x < 16; x += 4) { rect(g, x, 3, 2, 2, GP.lamp); p2(g, x, 3, '#ffffff'); } for (let x = 0; x < 16; x += 4) p2(g, x, 6, GP.brassD); }
    else if (kind === 'table') {                                                                                         /* a dining table: cloth, a plate, a dead candle, the drape */
      rect(g, 0, 0, 16, 2, GP.cream); rect(g, 0, 0, 16, 1, '#ffffff'); rect(g, 0, 2, 16, 6, GP.creamD); rect(g, 0, 2, 16, 1, GP.cream);
      for (let x = 0; x < 16; x += 3) rect(g, x, 8, 2, 2, GP.creamD); rect(g, 3, -1 + 1, 4, 1, GP.pale); p2(g, 11, 0, GP.brassL); rect(g, 11, 0, 1, 1, GP.brassL); }
    else if (kind === 'berth') {                                                                                         /* a sleeper's bunk: mattress, pillow, the curtain half-drawn */
      rect(g, 0, 0, 16, 3, GP.bunk); rect(g, 0, 0, 16, 1, GP.bunkL); rect(g, 0, 3, 16, 1, GP.v0); rect(g, 1, -1 + 1, 5, 2, GP.pale);
      rect(g, 0, 4, 16, 7, GP.curt); for (let x = 1; x < 16; x += 3) rect(g, x, 4, 1, 7, GP.curtD); rect(g, 0, 10, 16, 1, GP.curtD); rect(g, 0, 4, 16, 1, GP.brassD); }
    else if (kind === 'rack') {                                                                                          /* a luggage rack: a brass rail and the net under it */
      rect(g, 0, 0, 16, 2, GP.brass); rect(g, 0, 0, 16, 1, GP.brassL); rect(g, 0, 2, 16, 1, GP.brassD);
      for (let x = 0; x < 16; x += 3) for (let y = 3; y < 8; y += 2) { p2(g, x + (y & 2 ? 1 : 0), y, GP.brassD); } p2(g, 0, 3, GP.brassD); rect(g, 0, 8, 16, 1, GP.v0); }
    else { rect(g, 0, 0, 16, 3, GP.i3); rect(g, 0, 0, 16, 1, GP.i5); for (let x = 1; x < 16; x += 3) rect(g, x, 3, 1, 4, GP.i2); rect(g, 0, 3, 16, 1, GP.i0); }
    if (edgeL) rect(g, 0, 0, 1, 8, GP.i0); if (edgeR) rect(g, 15, 0, 1, 8, GP.i0);
    return c; });
}

/* ---------------- the entry ---------------- */
export function gtTile(t, x, y, at, T, L) {
  if (!L || !L.gt) return null;
  const G = L.gt, car = carOf(L, x), kind = car ? car.kind : null, v = hash(x, y) & 7;
  const air = (xx, yy) => { const k = at(xx, yy); return k === T.AIR || k === undefined || k === null; };
  const edgeL = air(x - 1, y), edgeR = air(x + 1, y), top = air(x, y - 1), ROOF = 12, FLOOR = 18, CLER = 10;
  if (t === T.ONEWAY) {
    if (!car) return ledgeTile('tread', v, false, false);
    if (kind === 'well') return ledgeTile('cornice', v, edgeL, edgeR);
    if (kind === 'dining') return ledgeTile('table', v, edgeL, edgeR);
    if (kind === 'sleeper') return ledgeTile('berth', v, edgeL, edgeR);
    if (kind === 'coach' || kind === 'van') return ledgeTile(y === FLOOR ? 'tread' : 'rack', v, edgeL, edgeR);
    return ledgeTile(y === FLOOR || y === 15 ? 'tread' : 'iron', v, edgeL, edgeR);
  }
  if (t !== T.SOLID) return null;
  if (!car) return plateTile('tub', top, edgeL, edgeR, v);
  const closed = car.closed, b0 = car.body ? car.body[0] : car.x0;
  if (kind === 'well' && y >= 21) return floorTile(v, 'iron', true, true);                                                  /* the well's slung floor */
  if (y > FLOOR) return chassisTile(y - FLOOR - 1, v, x === car.x0 + 1, x === car.x1 - 1);
  if (y === FLOOR) return floorTile(v, closed ? 'boards' : 'iron', top, false);
  if (closed) {
    if (y === ROOF || (kind === 'dining' && y === CLER && x >= 100 && x <= 113)) return roofTile(v, top, edgeL, edgeR, !top || air(x, y + 1));
    if (kind === 'dining' && y >= CLER && y < ROOF && (x === 100 || x === 113)) return wallTile(x === 100 ? 1 : -1, true, false, v);                      /* the clerestory's side */
    if (x === b0 || x === car.x1) { const door = at(x, y - 1) === T.AIR && y >= 15 || at(x, y + 1) === T.AIR && y >= 14; return wallTile(x === b0 ? 1 : -1, y <= 14 && y >= 13, door, v); }
  }
  if (kind === 'coal') return x === car.x0 || x === car.x1 ? plateTile('tub', top, edgeL, edgeR, v) : coalTile(x, y, top, edgeL, edgeR);
  if (kind === 'tender') return x === car.x0 ? plateTile('tub', top, edgeL, edgeR, v) : coalTile(x, y, top, edgeL, edgeR);
  if (kind === 'engine') {
    if (y === CLER && x <= 249) return roofTile(v, top, edgeL, edgeR, true);
    if (x === 249) return plateTile('back', false, false, false, v);
    if (x === 255 && y === 10) return domeTile('dome');
    if (x >= 259 && x <= 260 && y <= 10) return domeTile(y === 7 ? 'stackTop' : 'stack');
    return plateTile('boiler', top, edgeL, edgeR, y === 13 || y === 16 ? v | 4 : v & 3);
  }
  return plateTile('back', top, edgeL, edgeR, v);
}
export const GT_TILE_KINDS = ['roof', 'wall', 'floor', 'chassis', 'coal', 'plate', 'dome', 'ledge'];
export { floorTile, roofTile, wallTile, chassisTile, coalTile, plateTile, domeTile, ledgeTile };
