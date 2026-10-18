// lamplit3_tiles.js - THE LAMPLIT STREET 3's FOOTING (claude/lamplit3, Daniel 10-18: "I still see the wood platforms"). The drowned city had stood every
// one-way ledge it owned on the game's generic planks and logs (its swing hoists were TILE.log, its storeys' steps the castle's plain shelf). Nothing in
// a stone city a hundred feet down is timber, so every footing here is one of the city's own things, named where the level lays it (L.lpLedges, in tiles):
//   cobble   a COBBLED LEDGE - a broken lip of the old street, cold stone with cobbles set in it and weed hanging from the break
//   balcony  an IRON BALCONY - a grated wrought-iron deck on a scroll bracket, rivets and rust, the house front's
//   awning   a SHOP AWNING - drowned canvas, its stripes gone to rust and bone, on an iron rod and arm (the fish market's)
//   crossbar a LAMP-POST CROSSBAR - the iron arm of a tall lamp standard (its post is drawn down to the paving: lpPostDraw)
//   gantry   an IRON GANTRY - a riveted lattice girder (the lamp works', the toll road's, and the cradles that swing on chains)
// and a TAR NET (L.lpSnags): a fishing net choked with tar and weed, hung across a way - solid until fire takes it (src/lamplit-fire.js).
// Pure drawing from px.js primitives, 16x16, memoised. lpTile(t, x, y, at, T, L) -> a canvas for one cell, or null (the city kit draws it).
import { canvas, px, rect, mulberry } from '../px.js';

export const LC = {
  st0: '#1b2429', st1: '#243036', st2: '#35454a', st3: '#46595c', st4: '#58706f', lip: '#a6c4be', lip2: '#7e9490',
  cob0: '#2c3a3e', cob1: '#3e5052', cob2: '#56706c', cob3: '#7a948e',
  alg0: '#24402c', alg1: '#39603f', alg2: '#4e7a58',
  ir0: '#101316', ir1: '#1f262c', ir2: '#3a444c', ir3: '#5e6c76', ir4: '#94a4ae', rust0: '#3a2418', rust1: '#5e3622', rust2: '#8a5634',
  cv0: '#3a2226', cv1: '#5e3438', cv2: '#7a4a48', bone0: '#6e665a', bone1: '#958a76', bone2: '#b8ac94',
  tar0: '#0c0c0e', tar1: '#1a1a1e', tar2: '#2a2a30', tarS: '#4a5058', weed: '#2f5a46', weed2: '#3f7a54',
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const p2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

/* COBBLED LEDGE: a pale wet lip, a row of rounded cobbles, the broken underside with weed hanging off it */
function cobble(v, end) {
  return once('cob' + v + end, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 97 + 11);
    rect(g, 0, 0, 16, 7, LC.st1); rect(g, 0, 0, 16, 1, LC.lip); rect(g, 0, 1, 16, 1, LC.lip2);
    for (let x = (v & 1) * -2; x < 16; x += 4) { const w = 3, h = 3, t = r(); rect(g, x + 1, 2, w, h, t < 0.3 ? LC.cob3 : t < 0.7 ? LC.cob2 : LC.cob1); p2(g, x + 1, 2, LC.cob0); p2(g, x + 3, 4, LC.cob0); p2(g, x + 2, 2, LC.lip2); }
    rect(g, 0, 5, 16, 1, LC.cob0); rect(g, 0, 6, 16, 1, LC.st0);
    for (let x = 0; x < 16; x++) { const d = 7 + ((x * 5 + v * 3) % 3); rect(g, x, 7, 1, d - 7, LC.st1); p2(g, x, d, LC.st0); }   /* the broken underside */
    for (let i = 0; i < 3; i++) { const x = (r() * 15) | 0, len = 2 + ((r() * 4) | 0); for (let y = 0; y < len; y++) p2(g, x + (y & 1), 8 + y, y < 2 ? LC.alg1 : LC.alg0); }
    if (end === 'L') { g.clearRect(0, 0, 2, 2); p2(g, 2, 0, LC.lip2); rect(g, 0, 2, 1, 6, LC.st0); }
    if (end === 'R') { g.clearRect(14, 0, 2, 2); p2(g, 13, 0, LC.lip2); rect(g, 15, 2, 1, 6, LC.st0); }
    return c; });
}
/* IRON BALCONY: a grated deck, a riveted beam, and at either end the scroll bracket down to the wall it hangs off */
function balcony(v, end) {
  return once('bal' + v + end, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 1, LC.ir4); rect(g, 0, 1, 16, 2, LC.ir2); for (let x = v & 1; x < 16; x += 2) p2(g, x, 2, LC.ir0);   /* the grating */
    rect(g, 0, 3, 16, 2, LC.ir1); for (let x = 2 + (v & 1) * 3; x < 16; x += 6) p2(g, x, 3, LC.ir3);                        /* the beam and its rivets */
    rect(g, 0, 5, 16, 1, LC.ir0); for (let x = 1; x < 16; x += 5) { p2(g, x, 6, LC.rust1); p2(g, x, 7, LC.rust0); }      /* rust weeping off it */
    for (let x = 0; x < 16; x += 4) { rect(g, x + 1, 5, 1, 3, LC.ir1); p2(g, x + 1, 8, LC.ir2); }                          /* the lattice fringe under */
    const scroll = (s) => { const bx = s < 0 ? 1 : 14; for (let k = 0; k < 9; k++) p2(g, bx - s * Math.round(k * 0.9), 5 + k, LC.ir2); for (let k = 0; k < 9; k++) p2(g, bx - s * Math.round(k * 0.9) + s, 5 + k, LC.ir1);
      p2(g, bx - s * 4, 9, LC.ir3); p2(g, bx - s * 5, 10, LC.ir3); p2(g, bx - s * 4, 11, LC.ir3); rect(g, s < 0 ? 0 : 15, 0, 1, 16, LC.ir1); };
    if (end === 'L') scroll(-1); if (end === 'R') scroll(1);
    return c; });
}
/* SHOP AWNING: striped canvas gone to rust-red and bone, a scalloped fringe, the iron rod along its front; its ends carry the arm back to the wall */
function awning(v, end) {
  return once('awn' + v + end, () => { const [c, g] = canvas(16, 16);
    for (let x = 0; x < 16; x++) { const s = Math.floor((x + v * 2) / 4) & 1; for (let y = 1; y < 5; y++) p2(g, x, y, s ? (y === 1 ? LC.cv2 : LC.cv1) : (y === 1 ? LC.bone2 : LC.bone1)); p2(g, x, 5, s ? LC.cv0 : LC.bone0); }
    rect(g, 0, 0, 16, 1, LC.ir3);                                                                  /* the rod (the lit walking lip) */
    for (let x = 0; x < 16; x += 4) { const s = Math.floor((x + v * 2) / 4) & 1; rect(g, x, 6, 3, 1, s ? LC.cv1 : LC.bone1); p2(g, x + 1, 7, s ? LC.cv0 : LC.bone0); }   /* the scallops */
    for (let x = 3 + v; x < 16; x += 7) { p2(g, x, 3, LC.alg0); p2(g, x, 4, LC.alg1); p2(g, x, 6, LC.alg0); }   /* silt and weed on it */
    if (end === 'L' || end === 'R') { const s = end === 'L' ? 1 : -1, bx = end === 'L' ? 0 : 15; for (let k = 0; k < 9; k++) p2(g, bx + s * (k >> 1), 6 + k, LC.ir2); rect(g, bx, 0, 1, 16, LC.ir1); p2(g, bx, 0, LC.ir4); }
    return c; });
}
/* LAMP-POST CROSSBAR: the iron arm of a lamp standard - a flat bar with curled ends; the middle cell carries the post's head (the post itself is drawn down to the paving) */
function crossbar(v, end) {
  return once('xb' + v + end, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 1, LC.ir4); rect(g, 0, 1, 16, 2, LC.ir2); rect(g, 0, 3, 16, 1, LC.ir0);
    for (let x = 3; x < 16; x += 5) p2(g, x, 1, LC.ir3);
    if (end === 'L') { g.clearRect(0, 0, 2, 4); p2(g, 2, 4, LC.ir2); p2(g, 1, 5, LC.ir2); p2(g, 2, 6, LC.ir3); p2(g, 3, 5, LC.ir2); }
    if (end === 'R') { g.clearRect(14, 0, 2, 4); p2(g, 13, 4, LC.ir2); p2(g, 14, 5, LC.ir2); p2(g, 13, 6, LC.ir3); p2(g, 12, 5, LC.ir2); }
    if (end === 'M') { rect(g, 6, 3, 4, 2, LC.ir1); rect(g, 7, 4, 2, 12, LC.ir2); p2(g, 7, 4, LC.ir3); rect(g, 9, 4, 1, 12, LC.ir0); for (let y = 6; y < 16; y += 3) p2(g, 7, y, LC.ir3); }
    return c; });
}
/* IRON GANTRY: a riveted lattice girder - a lit top plate, the X of its truss, the bottom flange, rust streaks */
function gantry(v, end) {
  return once('gan' + v + end, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 1, LC.ir4); rect(g, 0, 1, 16, 1, LC.ir3); rect(g, 0, 2, 16, 1, LC.ir1);
    for (let k = 0; k < 6; k++) { p2(g, k + (v & 1) * 8, 3 + k, LC.ir2); p2(g, 7 - k + (v & 1) * 8, 3 + k, LC.ir2); p2(g, (k + 8 + (v & 1) * 8) % 16, 3 + k, LC.ir2); p2(g, (15 - k + (v & 1) * 8) % 16, 3 + k, LC.ir2); }
    rect(g, 0, 9, 16, 1, LC.ir2); rect(g, 0, 10, 16, 1, LC.ir0);
    for (let x = 1 + v; x < 16; x += 4) { p2(g, x, 1, LC.ir0); p2(g, x, 9, LC.ir3); }
    for (let x = 5 + v * 3; x < 16; x += 9) { p2(g, x, 11, LC.rust1); p2(g, x, 12, LC.rust0); }
    if (end === 'L') { rect(g, 0, 0, 2, 11, LC.ir1); p2(g, 0, 0, LC.ir4); } if (end === 'R') { rect(g, 14, 0, 2, 11, LC.ir1); p2(g, 15, 0, LC.ir4); }
    return c; });
}
/* TAR NET: the drowned fleet's nets, hung across a way and choked black with tar and weed - a mesh you cannot get through, and it BURNS */
function tarnet(v, top) {
  return once('tar' + v + top, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 41 + 3); rect(g, 0, 0, 16, 16, LC.tar1);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { if (((x + y + v) % 5 === 0) || ((x - y + 32 + v) % 5 === 0)) p2(g, x, y, LC.tar2); }
    for (let i = 0; i < 6; i++) { const x = (r() * 15) | 0, y = (r() * 15) | 0; rect(g, x, y, 2, 2, LC.tar0); p2(g, x, y, LC.tarS); }
    for (let i = 0; i < 3; i++) { const x = (r() * 15) | 0; for (let y = 0; y < 5; y++) p2(g, x + (y & 1), ((r() * 10) | 0) + y, y & 1 ? LC.weed : LC.weed2); }
    if (top) { rect(g, 0, 0, 16, 2, LC.ir2); rect(g, 0, 0, 16, 1, LC.ir3); for (let x = 2; x < 16; x += 5) p2(g, x, 2, LC.ir1); }   /* the iron rod it hangs from */
    return c; });
}
const MAKERS = { cobble, balcony, awning, crossbar, gantry };
export const LEDGE_KINDS = Object.keys(MAKERS);
/* one ledge cell: its kind's left end, right end or a middle (the crossbar's middle is the post's head) */
export function ledgeCell(kind, x, y, at, T) {
  const mk = MAKERS[kind] || cobble, l = at(x - 1, y) === T.ONEWAY, r = at(x + 1, y) === T.ONEWAY;
  const end = !l && !r ? (kind === 'crossbar' ? 'M' : 'L') : !l ? 'L' : !r ? 'R' : kind === 'crossbar' ? 'M' : '';
  return mk(((x * 7 + y * 3) % 3), end);
}
export const inZ = (zs, x, y) => (zs || []).find(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]);
/* THE KIT'S ENTRY: a one-way cell inside a named ledge zone, or a tar-net cell. Everything else stays the drowned city's own stone (city_tiles.js) */
export function lpTile(t, x, y, at, T, L) {
  if (t === T.ONEWAY) { const z = (L.lpLedges || []).find(q => x >= q[0] && x <= q[1] && y === q[2]); return ledgeCell(z ? z[3] : 'cobble', x, y, at, T); }   /* every one-way in this city is one of its own things: a ledge nobody named is a broken cobbled lip, never a plank */
  if (t === T.SOLID) { const s = (L.lpSnags || []).find(q => x >= q.x0 && x <= q.x1 && y >= q.y0 && y <= q.y1); if (s) return tarnet((x + y) % 3, y === s.y0); }
  return null;
}
/* THE GANTRY CRADLE (a swing mover's deck in this city): its girder, cell by cell */
export const cradleCell = (i, n) => gantry(i % 3, i === 0 ? 'L' : i === n - 1 ? 'R' : '');
/* A LAMP STANDARD's post, from its crossbar down to the paving it stands on: a fluted iron column, a collar every few rows, weed at its foot */
export function lpPostDraw(g, x, y0, y1, time) {
  const R = Math.round, X = R(x), t0 = R(y0), t1 = R(y1);
  g.fillStyle = LC.ir1; g.fillRect(X - 1, t0, 3, t1 - t0); g.fillStyle = LC.ir2; g.fillRect(X - 1, t0, 1, t1 - t0); g.fillStyle = LC.ir0; g.fillRect(X + 1, t0, 1, t1 - t0);
  for (let y = t0 + 10; y < t1 - 4; y += 28) { g.fillStyle = LC.ir3; g.fillRect(X - 2, y, 5, 2); g.fillStyle = LC.ir0; g.fillRect(X - 2, y + 2, 5, 1); }
  g.fillStyle = LC.ir2; g.fillRect(X - 3, t1 - 4, 7, 4); g.fillStyle = LC.ir3; g.fillRect(X - 3, t1 - 4, 7, 1);
  g.fillStyle = LC.alg1; for (let k = 0; k < 4; k++) g.fillRect(X - 3 + k * 2, t1 - 6 - R(Math.sin(time * 1.3 + k + x * 0.1) * 1.5), 1, 3);
}
/* AN IRON BRACKET under a balcony or awning that stands out from a wall: drawn from its end cell back to the wall face (art lane: a cast scroll) */
export function lpBracketDraw(g, x, y, dir) {
  g.fillStyle = LC.ir2; for (let k = 0; k < 10; k++) g.fillRect(Math.round(x + dir * k), Math.round(y + k), 1, 1);
  g.fillStyle = LC.ir1; g.fillRect(Math.round(x + dir * 10), Math.round(y), 1, 11);
}
