// fair_tiles.js - THE HARVEST FAIR's TILE KIT (claude/fairfix5; the review: "in the canal and the theatre the place IS the ground you stand on - in the fair, the fair is only a
// painting behind Waymeet's ground"). The fair's own ground and ledges, BY ZONE, from px.js primitives; each tile 16x16, baked once and memoised.
//   THE TURNSTILES + THE MIDWAY (0-246)  trodden sawdust-and-straw turf on russet earth, a duckboard path let into it every few strides
//   THE RIDES YARD (246-372)             painted iron deck plates, brass rivets, a bulb-lined edge; the iron understructure under them
//   THE BARNS + THE CORN (372-466)       barn floorboards with hay on top (the one place wood belongs), barn-board walls under
//   THE BONFIRE FIELD (466-525)          stubble on scorched earth
//   THE BACK LOT (525-620)               mud with wagon ruts and duckboards
//   THE MAYPOLE GREEN (620-)             the game's own kit (her carousel draws itself)
// LEDGES BY WHAT THEY ARE (L.fairKit.ledges names the special runs; the rest go by zone and height):
//   'awning'    a stall roof: a striped canvas with a bulb lip and a scalloped valance          'boardwalk' painted planks with a gilt trim
//   'iron'      a ride deck: a riveted plate on a lattice                                          'track'     the scenic railway's timber track: a rail, sleepers, bulbs
//   'wagon'     a wagon step: a painted box step with an iron strap                               'beam'      a barn beam with hay along it
// SPIKES are harrow tines and upturned pitchforks in straw. EVERY standable top carries a LIT LIP (and fair_rides.js drawLips puts one over the height night).
//   fairTile(t, x, y, at, T, L) -> the canvas for one cell, or null (the game's own kit draws it)
import { canvas, px, rect, mulberry } from '../px.js';

export const FT = {
  straw: '#e2c070', strawL: '#f4dc98', strawD: '#b08a40', saw: '#c89a62', sawD: '#9a7246', earth0: '#2a1a12', earth1: '#3e2618', earth2: '#56361f', earth3: '#6e4628',
  duck: '#7a5634', duckL: '#a47a4a', duckD: '#4a321c',
  iron0: '#1e1e28', iron1: '#2e2e3c', iron2: '#44445a', iron3: '#62627a', brass: '#e8c040', brassD: '#a8801c', bulb: '#fff0b0', bulbD: '#c89a40', red: '#b8382c', redD: '#7a2418',
  barn0: '#3a2214', barn1: '#5a3420', barn2: '#7a4a28', barn3: '#9a6232', hay: '#e6c95c', hayD: '#b8962e',
  stub: '#8a6a34', stubL: '#b08a4a', scorch: '#22160e', ember: '#c8501c',
  mud0: '#1e1610', mud1: '#2e221a', mud2: '#3e3024', mud3: '#5a4632', rut: '#120c08',
  cream: '#ece0c4', creamD: '#c8b890', blue: '#2f5f9a', blueD: '#1e3e66', green: '#3f7a4a', greenD: '#28502e', plum: '#8a3a6a', plumD: '#5a2446', gold: '#f0c840', paint: '#8a3a2a', paintD: '#5a2418',
  tine: '#8a919c', tineL: '#c9d1dc', tineD: '#4a505a' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const p2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };
const AW = [[FT.red, FT.cream], [FT.blue, FT.cream], [FT.green, FT.cream], [FT.plum, FT.creamD], [FT.gold, FT.redD]];

/* ---------------- THE TOPS (a standable SOLID cell under air) ---------------- */
function turfTop(v, l, r, duck) {
  return once('turf' + v + l + r + duck, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 71 + 5);
    earthBody(g, v, 0);
    if (duck) { rect(g, 0, 0, 16, 5, FT.duckD); for (let x = 0; x < 16; x += 4) { rect(g, x, 1, 3, 3, FT.duck); rect(g, x, 1, 3, 1, FT.duckL); } rect(g, 0, 0, 16, 1, FT.strawL); rect(g, 0, 5, 16, 1, FT.earth0); }
    else { rect(g, 0, 0, 16, 4, FT.saw); rect(g, 0, 0, 16, 1, FT.strawL); rect(g, 0, 1, 16, 1, FT.straw);
      for (let i = 0; i < 7; i++) { const x = (rr() * 15) | 0, y = 1 + ((rr() * 3) | 0); rect(g, x, y, 2, 1, rr() < 0.5 ? FT.straw : FT.strawD); }   /* straw strewn on the sawdust */
      for (let i = 0; i < 4; i++) p2(g, (rr() * 16) | 0, 2 + ((rr() * 2) | 0), FT.sawD); rect(g, 0, 4, 16, 1, FT.earth1); }
    if (l) { rect(g, 0, 0, 1, 16, FT.earth0); p2(g, 1, 0, FT.straw); } if (r) { rect(g, 15, 0, 1, 16, FT.earth0); p2(g, 14, 0, FT.straw); }
    return c; });
}
function earthBody(g, v, deep) { const rr = mulberry(v * 37 + deep * 11 + 3); rect(g, 0, 0, 16, 16, deep ? FT.earth0 : FT.earth1);
  rect(g, 0, 5 + v * 3, 16, 1, deep ? '#22140e' : FT.earth0);                                                      /* a faint stratum: trodden earth, not gravel */
  for (let i = 0; i < 3; i++) { const x = (rr() * 15) | 0, y = (rr() * 15) | 0; rect(g, x, y, 2, 1, deep ? FT.earth1 : FT.earth2); }
  if (!deep) p2(g, (rr() * 16) | 0, 7 + ((rr() * 8) | 0), FT.strawD); }
function earth(v, deep) { return once('earth' + v + deep, () => { const [c, g] = canvas(16, 16); earthBody(g, v, deep); return c; }); }

function ironTop(v, l, r) {
  return once('iron' + v + l + r, () => { const [c, g] = canvas(16, 16); ironBody(g, v, 0);
    rect(g, 0, 0, 16, 5, FT.iron2); rect(g, 0, 0, 16, 1, FT.brass); rect(g, 0, 1, 16, 1, FT.iron3); rect(g, 0, 5, 16, 1, FT.iron0);
    for (let x = 1; x < 16; x += 4) { p2(g, x, 0, FT.bulb); p2(g, x + 2, 3, FT.brass); }   /* bulbs on the lip, brass rivets on the plate */
    for (let x = 0; x < 16; x += 2) p2(g, x + (v & 1), 2, FT.iron1);                          /* the chequer */
    rect(g, 7 + v, 1, 1, 4, FT.iron1);
    if (l) rect(g, 0, 0, 1, 16, FT.iron0); if (r) rect(g, 15, 0, 1, 16, FT.iron0); return c; });
}
function ironBody(g, v, deep) { rect(g, 0, 0, 16, 16, deep ? FT.iron0 : FT.iron1); rect(g, 0, 7, 16, 1, FT.iron0); rect(g, 0, 15, 16, 1, FT.iron0);
  for (let k = 0; k < 8; k++) { p2(g, k * 2, 8 + (k & 3), FT.iron2); p2(g, 15 - k * 2, 8 + (k & 3), FT.iron2); }   /* a lattice */
  if (!deep) { p2(g, 3, 6, FT.brassD); p2(g, 12, 6, FT.brassD); } if (v === 2) rect(g, 7, 0, 2, 16, FT.iron0); }
function iron(v, deep) { return once('ironB' + v + deep, () => { const [c, g] = canvas(16, 16); ironBody(g, v, deep); return c; }); }

function barnTop(v, l, r) {
  return once('barn' + v + l + r, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 53 + 9); earthBody(g, v, 0);   /* boards laid on the earth (a barn's walls are its blocks; the yard under the boards is ground) */
    rect(g, 0, 0, 16, 5, FT.barn2); rect(g, 0, 0, 16, 1, FT.hay); rect(g, 0, 1, 16, 1, FT.barn3); rect(g, 0, 5, 16, 1, FT.barn0); rect(g, 5 + v * 3, 1, 1, 4, FT.barn1);
    for (let i = 0; i < 8; i++) { const x = (rr() * 15) | 0; rect(g, x, 0, 2, 1, rr() < 0.5 ? FT.hay : FT.hayD); p2(g, x + 1, 1, FT.hayD); }   /* hay on the boards */
    if (l) rect(g, 0, 0, 1, 16, FT.barn0); if (r) rect(g, 15, 0, 1, 16, FT.barn0); return c; });
}
function barnBody(g, v, deep) { rect(g, 0, 0, 16, 16, deep ? FT.barn0 : FT.barn1); for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 1, 16, FT.barn0); rect(g, x + 1, 0, 1, 16, deep ? FT.barn1 : FT.barn2); }
  if (!deep && v === 1) { rect(g, 0, 9, 16, 1, FT.barn0); p2(g, 2, 9, FT.tine); p2(g, 10, 9, FT.tine); } }
function barn(v, deep) { return once('barnB' + v + deep, () => { const [c, g] = canvas(16, 16); barnBody(g, v, deep); return c; }); }

function stubbleTop(v, l, r) {
  return once('stub' + v + l + r, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 29 + 1); earthBody(g, v, 0);
    rect(g, 0, 0, 16, 4, FT.scorch); rect(g, 0, 0, 16, 1, FT.stubL);
    for (let x = (v & 1); x < 16; x += 2) { const h = 1 + ((rr() * 3) | 0); rect(g, x, 1 - Math.min(1, h - 1), 1, h, rr() < 0.3 ? FT.ember : FT.stub); }   /* burnt stubble, an ember or two */
    if (l) rect(g, 0, 0, 1, 16, FT.earth0); if (r) rect(g, 15, 0, 1, 16, FT.earth0); return c; });
}
function mudTop(v, l, r, duck) {
  return once('mud' + v + l + r + duck, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 43 + 7); rect(g, 0, 0, 16, 16, FT.mud1);
    for (let i = 0; i < 8; i++) rect(g, (rr() * 15) | 0, 4 + ((rr() * 11) | 0), 2, 1, rr() < 0.5 ? FT.mud0 : FT.mud2);
    rect(g, 0, 0, 16, 4, FT.mud2); rect(g, 0, 0, 16, 1, FT.mud3); rect(g, 0, 2, 16, 1, FT.rut); rect(g, 0, 3, 16, 1, FT.mud0);   /* a wagon rut along the top */
    if (duck) { for (let x = 1; x < 16; x += 5) { rect(g, x, 0, 4, 3, FT.duck); rect(g, x, 0, 4, 1, FT.duckL); rect(g, x, 3, 4, 1, FT.duckD); } }
    if (l) rect(g, 0, 0, 1, 16, FT.mud0); if (r) rect(g, 15, 0, 1, 16, FT.mud0); return c; });
}
function mud(v, deep) { return once('mudB' + v + deep, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 17 + deep); rect(g, 0, 0, 16, 16, deep ? FT.mud0 : FT.mud1);
  for (let i = 0; i < 7; i++) rect(g, (rr() * 15) | 0, (rr() * 15) | 0, 2, 1, FT.mud0); return c; }); }

/* ---------------- THE LEDGES ---------------- */
export function awning(l, r, v, k) {
  return once('aw' + l + r + v + k, () => { const [c, g] = canvas(16, 16), [a, b] = AW[k % AW.length];
    for (let x = 0; x < 16; x += 4) rect(g, x, 2, 4, 5, ((x >> 2) + v) & 1 ? b : a);              /* the striped canvas */
    rect(g, 0, 0, 16, 2, FT.brassD); rect(g, 0, 0, 16, 1, FT.brass); for (let x = 1; x < 16; x += 4) p2(g, x, 0, FT.bulb);   /* the bulb lip */
    for (let x = 0; x < 16; x += 4) { const col = ((x >> 2) + v) & 1 ? b : a; rect(g, x, 7, 4, 2, col); rect(g, x + 1, 9, 2, 1, col); }   /* the scalloped valance */
    rect(g, 0, 7, 16, 1, 'rgba(0,0,0,0.25)');
    if (l) { rect(g, 0, 2, 1, 7, FT.duckD); } if (r) { rect(g, 15, 2, 1, 7, FT.duckD); } return c; });
}
function boardwalk(l, r, v) {
  return once('bw' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 1, 16, 5, FT.paint); rect(g, 0, 0, 16, 1, FT.gold); rect(g, 0, 1, 16, 1, '#b8583a'); rect(g, 0, 6, 16, 1, FT.paintD); rect(g, 0, 7, 16, 1, '#1a0c08');
    rect(g, 3 + v * 4, 2, 1, 4, FT.paintD); p2(g, 1, 3, FT.brassD); p2(g, 14, 3, FT.brassD);
    const bracket = x0 => { rect(g, x0, 8, 2, 4, FT.duckD); rect(g, x0 + 2, 8, 1, 2, FT.duckD); };
    if (l) { rect(g, 0, 0, 1, 7, FT.paintD); bracket(2); } if (r) { rect(g, 15, 0, 1, 7, FT.paintD); bracket(12); } return c; });
}
function ironLedge(l, r, v) {
  return once('il' + l + r + v, () => { const [c, g] = canvas(16, 16); rect(g, 0, 0, 16, 4, FT.iron2); rect(g, 0, 0, 16, 1, FT.brass); for (let x = 1; x < 16; x += 4) p2(g, x, 0, FT.bulb);
    for (let x = 3; x < 16; x += 5) p2(g, x, 2, FT.brass); rect(g, 0, 4, 16, 1, FT.iron0);
    for (let k = 0; k < 4; k++) { p2(g, (v * 3 + k) % 16, 5 + k, FT.iron1); p2(g, (v * 3 + 7 - k) % 16, 5 + k, FT.iron1); }
    if (l) rect(g, 0, 0, 2, 9, FT.iron1); if (r) rect(g, 14, 0, 2, 9, FT.iron1); return c; });
}
export function track(l, r, v) {
  return once('tr' + l + r + v, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 2, 16, 3, FT.duck); rect(g, 0, 2, 16, 1, FT.duckL); for (let x = 1; x < 16; x += 5) rect(g, x, 2, 3, 4, FT.duckD);   /* the sleepers */
    rect(g, 0, 0, 16, 2, FT.tineD); rect(g, 0, 0, 16, 1, FT.tineL);                                                                  /* the rail */
    for (let x = 2 + (v & 1) * 2; x < 16; x += 6) p2(g, x, 1, FT.bulb);                                                             /* its bulbs */
    for (let k = 0; k < 7; k++) { p2(g, 2 + k, 6 + k, FT.duckD); p2(g, 13 - k, 6 + k, FT.duckD); }                                  /* the trestle's cross brace */
    if (l) rect(g, 0, 0, 2, 16, FT.duckD); if (r) rect(g, 14, 0, 2, 16, FT.duckD); return c; });
}
function wagonStep(l, r, v) {
  return once('wg' + l + r + v, () => { const [c, g] = canvas(16, 16), col = [FT.blue, FT.green, FT.red][v % 3];
    rect(g, 0, 0, 16, 7, col); rect(g, 0, 0, 16, 1, FT.gold); rect(g, 0, 1, 16, 1, FT.cream); rect(g, 1, 3, 14, 3, 'rgba(0,0,0,0.22)'); rect(g, 0, 7, 16, 1, '#100a08');
    rect(g, 5 + v * 2, 1, 2, 6, FT.tineD); p2(g, 6 + v * 2, 2, FT.tineL);                                                           /* the iron strap */
    if (l) rect(g, 0, 0, 1, 8, FT.paintD); if (r) rect(g, 15, 0, 1, 8, FT.paintD); return c; });
}
function beam(l, r, v) {
  return once('bm' + l + r + v, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 13 + 2); rect(g, 0, 1, 16, 5, FT.barn2); rect(g, 0, 1, 16, 1, FT.barn3); rect(g, 0, 6, 16, 1, FT.barn0);
    rect(g, 0, 0, 16, 1, FT.hay); for (let i = 0; i < 6; i++) { const x = (rr() * 15) | 0; rect(g, x, 0, 2, 2, FT.hay); p2(g, x, 2, FT.hayD); }
    if (l) { rect(g, 0, 1, 1, 6, FT.barn0); rect(g, 1, 7, 2, 3, FT.barn1); } if (r) { rect(g, 15, 1, 1, 6, FT.barn0); rect(g, 13, 7, 2, 3, FT.barn1); } return c; });
}
/* (claude/fairfix5) A SPRINGY AWNING (the awning bounce): the striped canvas sagging on its frame, a bulb lip - and a TEARING one frayed, its canvas split and patched */
function springAwning(l, r, v, k, tear) {
  return once('sa' + l + r + v + k + tear, () => { const [c, g] = canvas(16, 16), [a, b] = AW[k % AW.length];
    for (let x = 0; x < 16; x += 4) { const sag = (x === 4 || x === 8) ? 1 : 0; rect(g, x, 2 + sag, 4, 5, ((x >> 2) + v) & 1 ? b : a); }
    rect(g, 0, 0, 16, 2, FT.brassD); rect(g, 0, 0, 16, 1, FT.brass); for (let x = 1; x < 16; x += 4) p2(g, x, 0, FT.bulb);
    for (let x = 0; x < 16; x += 4) { const col = ((x >> 2) + v) & 1 ? b : a; rect(g, x, 8, 4, 2, col); rect(g, x + 1, 10, 2, 1, col); }
    if (tear) { for (const [x, y] of [[5, 3], [6, 4], [6, 5], [11, 2], [11, 3], [12, 4]]) p2(g, x, y, '#1a0c08'); rect(g, 2, 6, 3, 1, FT.creamD); rect(g, 9, 9, 4, 1, 'rgba(0,0,0,0.4)'); }   /* split and fraying */
    if (l) rect(g, 0, 1, 1, 9, FT.duckD); if (r) rect(g, 15, 1, 1, 9, FT.duckD); return c; });
}
/* ---------------- THE SPIKES: harrow tines and upturned pitchforks in straw ---------------- */
function harrow(v) {
  return once('hr' + v, () => { const [c, g] = canvas(16, 16), rr = mulberry(v * 19 + 4);
    rect(g, 0, 11, 16, 5, FT.strawD); rect(g, 0, 11, 16, 1, FT.straw); for (let i = 0; i < 6; i++) rect(g, (rr() * 15) | 0, 12 + ((rr() * 3) | 0), 2, 1, FT.straw);
    if (v === 1) { rect(g, 1, 9, 14, 1, FT.duckD); for (const x of [3, 7, 11]) { rect(g, x, 2, 1, 7, FT.tine); p2(g, x, 2, FT.tineL); } rect(g, 7, 9, 1, 3, FT.duckD); }   /* an upturned pitchfork */
    else { rect(g, 0, 10, 16, 1, FT.tineD); for (let x = 1 + v; x < 16; x += 4) { rect(g, x, 4, 1, 6, FT.tine); rect(g, x + 1, 5, 1, 5, FT.tineD); p2(g, x, 3, FT.tineL); } }   /* a harrow's tines */
    return c; });
}

/* ---------------- A STALL BUILDING (the terrace, the high stall, the roof streets over the stalls): a painted plank roof with a gilt lip over a stall front ---------------- */
function stallTop(v, l, r) {
  return once('st' + v + l + r, () => { const [c, g] = canvas(16, 16); stallBody(g, v, 0); rect(g, 0, 0, 16, 5, FT.paint); rect(g, 0, 0, 16, 1, FT.gold); rect(g, 0, 1, 16, 1, '#b8583a'); rect(g, 0, 5, 16, 1, FT.paintD); rect(g, 0, 6, 16, 1, '#1a0c08');
    rect(g, 4 + v * 4, 1, 1, 4, FT.paintD); for (let x = 2; x < 16; x += 6) p2(g, x, 3, FT.brassD);
    if (l) rect(g, 0, 0, 1, 16, FT.paintD); if (r) rect(g, 15, 0, 1, 16, FT.paintD); return c; });
}
const STALLC = [['#5a2a22', '#6e3628'], ['#2e3a4a', '#3a4a5c'], ['#3a4a2e', '#4a5c3a']];
function stallBody(g, v, deep) { const [a, b] = STALLC[v % 3]; rect(g, 0, 0, 16, 16, a); for (let x = 0; x < 16; x += 4) { rect(g, x + 1, 0, 2, 16, b); rect(g, x, 0, 1, 16, '#1a0e0c'); }   /* painted stall boards */
  if (deep) { g.globalAlpha = 0.45; rect(g, 0, 0, 16, 16, '#0e0808'); g.globalAlpha = 1; } else if (v === 1) { rect(g, 4, 6, 8, 6, '#140c0e'); rect(g, 4, 6, 8, 1, FT.gold); rect(g, 4, 11, 8, 1, FT.brassD); } }
function stall(v, deep) { return once('stB' + v + deep, () => { const [c, g] = canvas(16, 16); stallBody(g, v, deep); return c; }); }

// ================================ THE ZONES ================================
const zoneAt = (K, x) => { for (const [a, b, z] of K.zones || []) if (x >= a && x <= b) return z; return null; };
function ledgeKind(K, x, y, t, at, T, R) {
  for (const [a, b, y0, y1, k] of K.ledges || []) if (x >= a && x <= b && y >= y0 && y <= y1) return k;
  const z = zoneAt(K, x); let run = 1; for (let k = 1; k < 9 && at(x - k, y) === t; k++) run++; for (let k = 1; k < 9 && at(x + k, y) === t; k++) run++;
  if (z === 'mud') return 'wagon'; if (y > R) return z === 'iron' ? 'iron' : 'boardwalk';
  if (y >= R - 6 && run <= 7) return 'awning';
  return z === 'iron' ? 'iron' : z === 'barn' ? 'beam' : z === 'field' ? 'awning' : 'boardwalk';
}

// ================================ THE HOOK ================================
export function fairTile(t, x, y, at, T, L) {
  const K = L.fairKit; if (!K) return null; const z = zoneAt(K, x); if (!z || z === 'green') return null;
  const v = ((x * 7 + y * 13) % 3 + 3) % 3, air = (dx, dy) => at(x + dx, y + dy) === T.AIR || at(x + dx, y + dy) === T.SPIKE;
  if (t === T.SOLID) {
    if ((K.keep || []).some(([a, b, y0, y1]) => x >= a && x <= b && y >= y0 && y <= y1)) return null;   /* (the corn maze and the tower draw their own over the rock) */
    const top = at(x, y - 1) === T.AIR, l = air(-1, 0), r = air(1, 0);
    if ((K.blocks || []).some(([a, b, y0, y1]) => x >= a && x <= b && y >= y0 && y <= y1)) { let d = 0; for (let k = 1; k <= 3; k++) { if (at(x, y - k) === T.AIR) break; d++; } return top ? stallTop(v, l, r) : stall(v, d >= 3 ? 1 : 0); }
    let depth = 0; for (let k = 1; k <= 5; k++) { const q = at(x, y - k); if (q === T.AIR || q === T.SPIKE) break; depth++; }
    if (top) return z === 'iron' ? ironTop(v, l, r) : z === 'barn' ? barnTop(v, l, r) : z === 'field' ? stubbleTop(v, l, r) : z === 'mud' ? mudTop(v, l, r, (x % 7) < 2) : turfTop(v, l, r, (x % 9) < 2 && !l && !r);
    const deep = depth >= 3 ? 1 : 0;
    return z === 'iron' ? iron(v, deep) : z === 'mud' ? mud(v, deep) : earth(v, deep);
  }
  if (t === T.ONEWAY || t === T.PLANK) {
    const l = at(x - 1, y) !== t, r = at(x + 1, y) !== t, k = ledgeKind(K, x, y, t, at, T, K.R || 28);
    if (k === 'awning') { let x0 = x; while (at(x0 - 1, y) === t && x - x0 < 12) x0--; return awning(l, r, (x - x0) & 1, (x0 * 3 + y) % AW.length); }
    if (k === 'iron') return ironLedge(l, r, v); if (k === 'track') return track(l, r, v); if (k === 'wagon') return wagonStep(l, r, v); if (k === 'beam') return beam(l, r, v);
    return boardwalk(l, r, v);
  }
  if (t === T.SPIKE) return harrow((x * 5 + y) % 3);
  if (t === T.BOUNCER) { const a = (L.awnings || []).find(q => x >= q.x0 && x <= q.x1 && y === q.row); if (a) return springAwning(x === a.x0, x === a.x1, (x - a.x0) & 1, (a.x0 * 3 + y) % AW.length, a.tear); }
  return null;
}
/* THE LIP COLOUR of a standable top here (for fair_rides.js drawLips: what the footing's edge is lit with over the height night) */
export function lipAt(L, x, y, t, at, T) { const K = L.fairKit; if (!K) return null; const z = zoneAt(K, x); if (!z || z === 'green') return null;
  if (t === T.SOLID) return z === 'iron' ? FT.brass : z === 'barn' ? FT.hay : z === 'mud' ? FT.mud3 : FT.strawL;
  const k = ledgeKind(K, x, y, t, at, T, K.R || 28); return k === 'track' ? FT.tineL : k === 'wagon' ? FT.cream : k === 'beam' ? FT.hay : FT.brass; }
/* THE SLOPES' SKIN here (src/main.js cvTile cuts a slope out of a top and a fill): the zone's own ground, so a ramp in the midway is sawdust and earth, in the yard iron */
const EMPTY = () => once('empty', () => canvas(16, 16)[0]);
export function slopeSkins(L, x, y) { const K = L.fairKit; if (!K) return null; const z = zoneAt(K, x); if (!z || z === 'green') return null;
  if ((K.ledges || []).some(([a, b, y0, y1, k]) => k === 'track' && x >= a && x <= b && y >= y0 - 1 && y <= y1)) return { top: [0, 1, 2].map(v => track(false, false, v)), fill: [EMPTY(), EMPTY(), EMPTY()] };   /* the railway's humps: track, nothing under */
  const top = [0, 1, 2].map(v => z === 'iron' ? ironTop(v, false, false) : z === 'barn' ? barnTop(v, false, false) : z === 'field' ? stubbleTop(v, false, false) : z === 'mud' ? mudTop(v, false, false, false) : turfTop(v, false, false, false));
  const fill = [0, 1, 2].map(v => z === 'iron' ? iron(v, 0) : z === 'barn' ? barn(v, 0) : z === 'mud' ? mud(v, 0) : earth(v, 0)); return { top, fill }; }
