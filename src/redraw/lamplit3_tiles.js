// lamplit3_tiles.js - THE LAMPLIT STREET 3's FOOTING (claude/lamplit3, Daniel 10-18: "I still see the wood platforms"; finished by claude/lamplit3art). The drowned city had stood every
// one-way ledge it owned on the game's generic planks and logs (its swing hoists were TILE.log, its storeys' steps the castle's plain shelf). Nothing in
// a stone city a hundred feet down is timber, so every footing here is one of the city's own things, named where the level lays it (L.lpLedges, in tiles):
//   cobble   a COBBLED LEDGE - a broken lip of the old street, cold stone with wet cobbles set in it and weed hanging from the break
//   step     a STONE CANAL STEP - a dressed block of the quay stair, chamfered lip, a tide line and weed on its face (the courtyards' way down to the water)
//   balcony  an IRON BALCONY - a grated wrought-iron deck on a scroll bracket, rivets and rust, the house front's (its handrail is drawn behind you: lpRailDraw)
//   awning   a SHOP AWNING - drowned canvas, its stripes gone to rust and bone, SAGGING between its iron rod and arms, a scalloped valance (the fish market's)
//   crossbar a LAMP-POST CROSSBAR - the iron arm of a tall lamp standard (its post is drawn down to the paving: lpPostDraw)
//   gantry   an IRON GANTRY - a riveted lattice girder with gusset plates at its nodes (the lamp works', the toll road's, and the cradles that swing on chains)
// and a TAR NET (L.lpSnags): a fishing net choked with tar and weed, hung across a way - solid until fire takes it (src/lamplit-fire.js), and the barriers
// (L.lpBarriers: src/redraw/lamplit3_barriers.js - the market house, the procession wall, the works' brickwork).
// Pure drawing from px.js primitives, 16x16, memoised. lpTile(t, x, y, at, T, L) -> a canvas for one cell, or null (the city kit draws it).
import { canvas, px, rect, mulberry } from '../px.js';
import { barrierAt, barrierTile } from './lamplit3_barriers.js';

export const LC = {
  st0: '#1b2429', st1: '#243036', st2: '#35454a', st3: '#46595c', st4: '#58706f', lip: '#a6c4be', lip2: '#7e9490',
  cob0: '#2c3a3e', cob1: '#3e5052', cob2: '#56706c', cob3: '#7a948e', wet: '#bfe6f0',
  alg0: '#24402c', alg1: '#39603f', alg2: '#4e7a58',
  ir0: '#101316', ir1: '#1f262c', ir2: '#3a444c', ir3: '#5e6c76', ir4: '#94a4ae', rust0: '#3a2418', rust1: '#5e3622', rust2: '#8a5634',
  cv0: '#3a2226', cv1: '#5e3438', cv2: '#7a4a48', bone0: '#6e665a', bone1: '#958a76', bone2: '#b8ac94',
  tar0: '#0c0c0e', tar1: '#1a1a1e', tar2: '#2a2a30', tarS: '#4a5058', weed: '#2f5a46', weed2: '#3f7a54',
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const p2 = (g, x, y, c) => { if (x >= 0 && x < 16 && y >= 0 && y < 16) px(g, x, y, c); };

/* COBBLED LEDGE: a pale wet lip, a row of rounded cobbles each with its own highlight, mortar between, the broken underside with weed hanging off it and a drip on the rock */
function cobble(v, end) {
  return once('cob' + v + end, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 97 + 11);
    rect(g, 0, 0, 16, 7, LC.st1); rect(g, 0, 0, 16, 1, LC.lip); rect(g, 0, 1, 16, 1, LC.lip2);
    for (let x = (v & 1) * -2; x < 16; x += 4) { const w = 3, h = 3, t = r(); rect(g, x + 1, 2, w, h, t < 0.3 ? LC.cob3 : t < 0.7 ? LC.cob2 : LC.cob1); p2(g, x + 1, 2, LC.cob0); p2(g, x + 3, 4, LC.cob0); p2(g, x + 2, 2, LC.lip2); if (t < 0.45) p2(g, x + 1, 3, LC.wet);
      p2(g, x + 4, 2, LC.cob0); p2(g, x + 4, 3, LC.cob0); p2(g, x + 4, 4, LC.cob0); }                                                                  /* mortar */
    rect(g, 0, 5, 16, 1, LC.cob0); rect(g, 0, 6, 16, 1, LC.st0);
    for (let x = 0; x < 16; x++) { const d = 7 + ((x * 5 + v * 3) % 3); rect(g, x, 7, 1, d - 7, LC.st1); p2(g, x, d, LC.st0); if (((x + v) & 3) === 0) p2(g, x, 8, LC.st2); }   /* the broken underside */
    for (let i = 0; i < 3; i++) { const x = (r() * 15) | 0, len = 2 + ((r() * 4) | 0); for (let y = 0; y < len; y++) p2(g, x + (y & 1), 8 + y, y < 2 ? LC.alg1 : LC.alg0); }
    p2(g, 6 + v, 10, LC.cob3); p2(g, 6 + v, 11, LC.wet);                                                                                                       /* a drip about to fall */
    if (end === 'L') { g.clearRect(0, 0, 2, 2); p2(g, 2, 0, LC.lip2); rect(g, 0, 2, 1, 6, LC.st0); }
    if (end === 'R') { g.clearRect(14, 0, 2, 2); p2(g, 13, 0, LC.lip2); rect(g, 15, 2, 1, 6, LC.st0); }
    return c; });
}
/* STONE CANAL STEP: a dressed quay block - a chamfered lit lip, a dark joint, its face stained at the tide line, weed in the joint, an iron mooring ring on the odd one */
function step(v, end) {
  return once('stp' + v + end, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 53 + 5);
    rect(g, 0, 0, 16, 12, LC.st2); rect(g, 0, 0, 16, 1, LC.lip); rect(g, 0, 1, 16, 1, LC.lip2); rect(g, 0, 2, 16, 1, LC.st3);          /* the lip and its chamfer */
    rect(g, 0, 3, 16, 7, LC.st1); for (let x = 0; x < 16; x += 2) if (r() < 0.4) p2(g, x, 4 + ((r() * 4) | 0), LC.st2);                    /* the face's tooling */
    rect(g, 0, 10, 16, 2, LC.alg0); for (let x = 0; x < 16; x++) if (((x * 3 + v) % 4) < 2) p2(g, x, 10, LC.alg1); rect(g, 0, 12, 16, 1, LC.st0); for (let x = 1; x < 16; x += 4) rect(g, x + (v & 1), 12, 1, 2, LC.alg0);   /* the tide line, weed under it */
    rect(g, (v & 1) ? 8 : 4, 3, 1, 8, LC.st0);                                                                                                  /* the block joint */
    if (v === 1) { rect(g, 6, 5, 4, 4, LC.ir2); rect(g, 7, 6, 2, 2, LC.ir0); p2(g, 6, 5, LC.ir4); }                                              /* a mooring ring */
    if (end === 'L') { g.clearRect(0, 0, 1, 2); rect(g, 0, 2, 1, 10, LC.st0); }
    if (end === 'R') { g.clearRect(15, 0, 1, 2); rect(g, 15, 2, 1, 10, LC.st0); }
    return c; });
}
/* IRON BALCONY: a grated deck, a riveted beam, filigree under it, and at either end the cast scroll bracket (a curl and a gusset) down to the wall it hangs off */
function balcony(v, end) {
  return once('bal' + v + end, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 1, LC.ir4); rect(g, 0, 1, 16, 2, LC.ir2); for (let x = v & 1; x < 16; x += 2) p2(g, x, 2, LC.ir0);   /* the grating */
    rect(g, 0, 3, 16, 2, LC.ir1); for (let x = 2 + (v & 1) * 3; x < 16; x += 6) { p2(g, x, 3, LC.ir3); p2(g, x, 4, LC.ir0); }  /* the beam and its rivets */
    rect(g, 0, 5, 16, 1, LC.ir0);
    for (let x = 0; x < 16; x += 4) { p2(g, x + 1, 6, LC.ir2); p2(g, x, 7, LC.ir2); p2(g, x + 2, 7, LC.ir2); p2(g, x + 1, 8, LC.ir1); p2(g, x + 1, 7, LC.ir3); }   /* the cast lace under the beam: a run of small quatrefoils */
    for (let x = 1; x < 16; x += 5) { p2(g, x, 9, LC.rust1); p2(g, x, 10, LC.rust0); }                                                                    /* rust weeping off it */
    const scroll = (s) => { const bx = s < 0 ? 1 : 14;
      for (let k = 0; k < 10; k++) { p2(g, bx - s * Math.round(k * 0.9), 5 + k, LC.ir2); p2(g, bx - s * Math.round(k * 0.9) + s, 5 + k, LC.ir1); }   /* the diagonal strut */
      for (let k = 0; k < 4; k++) { p2(g, bx - s * (5 + k), 10 - (k === 3 ? 1 : 0), LC.ir3); p2(g, bx - s * (3 + k), 12, LC.ir2); }                     /* the curl at its foot */
      p2(g, bx - s * 4, 9, LC.ir3); p2(g, bx - s * 5, 10, LC.ir3); p2(g, bx - s * 4, 11, LC.ir3); rect(g, s < 0 ? 0 : 15, 0, 1, 16, LC.ir1); rect(g, s < 0 ? 0 : 14, 5, 2, 3, LC.ir2); p2(g, s < 0 ? 1 : 14, 6, LC.ir4); };   /* the gusset plate and its bolt */
    if (end === 'L') scroll(-1); if (end === 'R') scroll(1);
    return c; });
}
/* SHOP AWNING: striped canvas gone to rust-red and bone, SAGGING between the arms (sag rows of extra cloth in the middle of a span), a scalloped valance, the iron rod along its front */
function awning(v, end, sag = 0) {
  return once('awn' + v + end + sag, () => { const [c, g] = canvas(16, 16), nb = 5 + sag;
    for (let x = 0; x < 16; x++) { const s = Math.floor((x + v * 2) / 4) & 1; for (let y = 1; y < nb; y++) p2(g, x, y, s ? (y === 1 ? LC.cv2 : y > nb - 3 ? LC.cv0 : LC.cv1) : (y === 1 ? LC.bone2 : y > nb - 3 ? LC.bone0 : LC.bone1)); p2(g, x, nb, s ? LC.cv0 : LC.bone0); }
    rect(g, 0, 0, 16, 1, LC.ir3);                                                                  /* the rod (the lit walking lip) */
    for (let x = 0; x < 16; x += 4) { const s = Math.floor((x + v * 2) / 4) & 1; rect(g, x, nb + 1, 3, 1, s ? LC.cv1 : LC.bone1); p2(g, x + 1, nb + 2, s ? LC.cv0 : LC.bone0); p2(g, x + 1, nb + 3, LC.st0); }   /* the scallops and their tassels */
    for (let y = 2; y < nb; y += 2) for (let x = (y + v) % 4; x < 16; x += 8) p2(g, x, y, y & 2 ? LC.cv0 : LC.bone0);   /* the cloth's pull-folds, radiating */
    for (let x = 3 + v; x < 16; x += 7) { p2(g, x, 3, LC.alg0); p2(g, x, 4, LC.alg1); p2(g, x, nb + 1, LC.alg0); }   /* silt and weed on it */
    if (end === 'L' || end === 'R') { const s = end === 'L' ? 1 : -1, bx = end === 'L' ? 0 : 15; for (let k = 0; k < 9; k++) p2(g, bx + s * (k >> 1), 6 + sag + k, LC.ir2); rect(g, bx, 0, 1, 6 + sag, LC.ir1); p2(g, bx, 0, LC.ir4); }
    return c; });
}
/* LAMP-POST CROSSBAR: the iron arm of a lamp standard - a flat bar with round bosses at its ends; the middle cell carries the post's head (the post itself is drawn down to the paving) */
function crossbar(v, end) {
  return once('xb' + v + end, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 1, LC.ir4); rect(g, 0, 1, 16, 2, LC.ir2); rect(g, 0, 3, 16, 1, LC.ir0);
    for (let x = 3; x < 16; x += 5) p2(g, x, 1, LC.ir3);
    /* the arm's ends: a round iron boss, no legs under it (in the lamp's warm wash curled ends read as a table's legs) */
    if (end === 'L') { g.clearRect(0, 0, 1, 4); rect(g, 1, 1, 2, 2, LC.ir3); p2(g, 1, 1, LC.ir4); }
    if (end === 'R') { g.clearRect(15, 0, 1, 4); rect(g, 13, 1, 2, 2, LC.ir3); p2(g, 14, 1, LC.ir4); }
    if (end === 'M') { rect(g, 5, 3, 6, 2, LC.ir1); rect(g, 6, 3, 4, 1, LC.ir3); rect(g, 7, 4, 2, 12, LC.ir2); p2(g, 7, 4, LC.ir3); rect(g, 9, 4, 1, 12, LC.ir0); for (let y = 6; y < 16; y += 3) p2(g, 7, y, LC.ir3); p2(g, 5, 4, LC.ir3); p2(g, 10, 4, LC.ir3); }   /* the collar where the post meets the bar */
    return c; });
}
/* IRON GANTRY: a riveted lattice girder - a lit top plate, the X of its truss with a gusset plate and rivets at each node, the bottom flange, rust streaks */
function gantry(v, end) {
  return once('gan' + v + end, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 1, LC.ir4); rect(g, 0, 1, 16, 1, LC.ir3); rect(g, 0, 2, 16, 1, LC.ir1);
    for (let k = 0; k < 6; k++) { p2(g, k + (v & 1) * 8, 3 + k, LC.ir2); p2(g, 7 - k + (v & 1) * 8, 3 + k, LC.ir2); p2(g, (k + 8 + (v & 1) * 8) % 16, 3 + k, LC.ir2); p2(g, (15 - k + (v & 1) * 8) % 16, 3 + k, LC.ir2); }
    rect(g, 0, 9, 16, 1, LC.ir2); rect(g, 0, 10, 16, 1, LC.ir0);
    for (const nx of [(v & 1) * 8, (v & 1) * 8 + 7, ((v & 1) * 8 + 8) % 16, ((v & 1) * 8 + 15) % 16]) { const gx = Math.max(0, Math.min(13, nx - 1)); rect(g, gx, 3, 3, 3, LC.ir1); p2(g, gx + 1, 4, LC.ir3); rect(g, gx, 7, 3, 3, LC.ir1); p2(g, gx + 1, 8, LC.ir3); }   /* gusset plates with a bolt */
    for (let x = 1 + v; x < 16; x += 4) { p2(g, x, 1, LC.ir0); p2(g, x, 9, LC.ir3); }
    for (let x = 5 + v * 3; x < 16; x += 9) { p2(g, x, 11, LC.rust1); p2(g, x, 12, LC.rust0); p2(g, x, 13, LC.rust0); }
    if (end === 'L') { rect(g, 0, 0, 2, 11, LC.ir1); p2(g, 0, 0, LC.ir4); rivet2(g, 0, 3); rivet2(g, 0, 7); } if (end === 'R') { rect(g, 14, 0, 2, 11, LC.ir1); p2(g, 15, 0, LC.ir4); rivet2(g, 14, 3); rivet2(g, 14, 7); }
    return c; });
}
const rivet2 = (g, x, y) => { p2(g, x, y, LC.ir3); p2(g, x + 1, y, LC.ir0); };
/* THE CRADLE: a gantry deck hung on chains - a grated deck in a cage frame, a shackle plate at each end where the chain takes it (the chain itself is main.js's line) */
function cradle(v, end) {
  return once('crd' + v + end, () => { const [c, g] = canvas(16, 16);
    rect(g, 0, 0, 16, 1, LC.ir4); rect(g, 0, 1, 16, 2, LC.ir2); for (let x = v & 1; x < 16; x += 2) p2(g, x, 2, LC.ir0);
    rect(g, 0, 3, 16, 3, LC.ir1); rect(g, 0, 3, 16, 1, LC.ir3); for (let x = 3; x < 16; x += 5) { p2(g, x, 4, LC.ir3); p2(g, x, 5, LC.ir0); }
    rect(g, 0, 6, 16, 1, LC.ir0); for (let x = 1 + v; x < 16; x += 4) { p2(g, x, 7, LC.ir2); p2(g, x, 8, LC.ir1); }                          /* the hanging ribs */
    rect(g, 0, 9, 16, 1, LC.ir2); rect(g, 0, 10, 16, 1, LC.ir0); for (let x = 4 + v; x < 16; x += 7) { p2(g, x, 11, LC.rust1); p2(g, x, 12, LC.rust0); }
    if (end === 'L' || end === 'R') { const x = end === 'L' ? 0 : 12; rect(g, x, 0, 4, 11, LC.ir1); rect(g, x, 0, 4, 1, LC.ir4); rect(g, x + 1, 2, 2, 2, LC.ir0); p2(g, x + 1, 2, LC.ir4); p2(g, x + 1, 6, LC.ir3); p2(g, x + 2, 8, LC.ir3); }   /* the shackle plate: an eye the chain runs through */
    return c; });
}
/* TAR NET: the drowned fleet's nets, hung across a way and choked black with tar and weed - a mesh you cannot get through, and it BURNS (a rod above, floats and sinkers knotted in) */
function tarnet(v, top) {
  return once('tar' + v + top, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 41 + 3); rect(g, 0, 0, 16, 16, LC.tar1);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { if (((x + y + v) % 5 === 0) || ((x - y + 32 + v) % 5 === 0)) p2(g, x, y, LC.tar2); }
    for (let k = 0; k < 16; k += 5) for (let y = 0; y < 16; y++) if (((y + v) % 5) === 0) p2(g, (k + y * 2 + v) % 16, y, LC.tarS);                      /* the knots catch the light */
    for (let i = 0; i < 6; i++) { const x = (r() * 15) | 0, y = (r() * 15) | 0; rect(g, x, y, 2, 2, LC.tar0); p2(g, x, y, LC.tarS); }
    for (let i = 0; i < 3; i++) { const x = (r() * 15) | 0; for (let y = 0; y < 5; y++) p2(g, x + (y & 1), ((r() * 10) | 0) + y, y & 1 ? LC.weed : LC.weed2); }
    if (v === 1) { rect(g, 5, 6, 4, 3, LC.bone1); rect(g, 5, 6, 4, 1, LC.bone2); rect(g, 8, 7, 1, 2, LC.bone0); }                                       /* a cork float, tarred over its edge */
    if (top) { rect(g, 0, 0, 16, 2, LC.ir2); rect(g, 0, 0, 16, 1, LC.ir3); for (let x = 2; x < 16; x += 5) p2(g, x, 2, LC.ir1); for (let x = 1; x < 16; x += 5) p2(g, x, 1, LC.ir0); }   /* the iron rod it hangs from */
    return c; });
}
const MAKERS = { cobble, step, balcony, awning, crossbar, gantry };
export const LEDGE_KINDS = Object.keys(MAKERS);
/* one ledge cell: its kind's left end, right end or a middle (the crossbar's middle is the post's head); an awning sags in the middle of its span */
export function ledgeCell(kind, x, y, at, T, span) {
  const mk = MAKERS[kind] || cobble, l = at(x - 1, y) === T.ONEWAY, r = at(x + 1, y) === T.ONEWAY;
  const end = !l && !r ? (kind === 'crossbar' ? 'M' : 'L') : !l ? 'L' : !r ? 'R' : kind === 'crossbar' ? 'M' : '';
  let sag = 0; if (kind === 'awning' && span && span[1] > span[0]) { const n = span[1] - span[0] + 1, u = (x - span[0] + 0.5) / n; sag = Math.round(3 * Math.sin(Math.PI * u)); }
  return mk(((x * 7 + y * 3) % 3), end, sag);
}
export const inZ = (zs, x, y) => (zs || []).find(z => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3]);
/* THE KIT'S ENTRY: a one-way cell inside a named ledge zone, a barrier cell, or a tar-net cell. Everything else stays the drowned city's own stone (city_tiles.js) */
export function lpTile(t, x, y, at, T, L) {
  if (t === T.ONEWAY) { const z = (L.lpLedges || []).find(q => x >= q[0] && x <= q[1] && y === q[2]); return ledgeCell(z ? z[3] : 'cobble', x, y, at, T, z ? [z[0], z[1]] : null); }   /* every one-way in this city is one of its own things: a ledge nobody named is a broken cobbled lip, never a plank */
  if (t === T.SOLID) { const s = (L.lpSnags || []).find(q => x >= q.x0 && x <= q.x1 && y >= q.y0 && y <= q.y1); if (s) return tarnet((x + y) % 3, y === s.y0);
    const b = barrierAt(L, x, y); if (b) return barrierTile(b, x, y); }
  return null;
}
/* THE GANTRY CRADLE (a swing mover's deck in this city): its iron cage, cell by cell */
export const cradleCell = (i, n) => cradle(i % 3, i === 0 ? 'L' : i === n - 1 ? 'R' : '');
/* A LAMP STANDARD's post, from its crossbar down to the paving it stands on: a fluted iron column with a lit edge, a collar every few rows, a plinth, weed at its foot */
export function lpPostDraw(g, x, y0, y1, time) {
  const R = Math.round, X = R(x), t0 = R(y0), t1 = R(y1);
  g.fillStyle = LC.ir1; g.fillRect(X - 1, t0, 3, t1 - t0); g.fillStyle = LC.ir3; g.fillRect(X - 1, t0, 1, t1 - t0); g.fillStyle = LC.ir0; g.fillRect(X + 1, t0, 1, t1 - t0);
  g.fillStyle = LC.ir2; for (let y = t0 + 4; y < t1 - 6; y += 6) g.fillRect(X, y, 1, 3);                                                                              /* the flutes */
  for (let y = t0 + 10; y < t1 - 4; y += 28) { g.fillStyle = LC.ir3; g.fillRect(X - 2, y, 5, 2); g.fillStyle = LC.ir4; g.fillRect(X - 2, y, 5, 1); g.fillStyle = LC.ir0; g.fillRect(X - 2, y + 2, 5, 1); }
  g.fillStyle = LC.ir1; g.fillRect(X - 4, t1 - 9, 9, 3); g.fillStyle = LC.ir2; g.fillRect(X - 3, t1 - 9, 7, 1);                                                       /* the base's skirt */
  g.fillStyle = LC.ir2; g.fillRect(X - 4, t1 - 6, 9, 6); g.fillStyle = LC.ir3; g.fillRect(X - 4, t1 - 6, 9, 1); g.fillStyle = LC.ir0; g.fillRect(X - 4, t1 - 1, 9, 1); g.fillStyle = LC.ir4; g.fillRect(X - 3, t1 - 4, 1, 1); g.fillRect(X + 3, t1 - 4, 1, 1);   /* the plinth, its bolts */
  g.fillStyle = LC.alg1; for (let k = 0; k < 5; k++) g.fillRect(X - 4 + k * 2, t1 - 8 - R(Math.sin(time * 1.3 + k + x * 0.1) * 1.5), 1, 3);
}
/* AN IRON BRACKET under a balcony or awning that stands out from a wall: drawn from its end cell back to the wall face - a cast scroll: the strut, a curl at its foot, a wall plate with two bolts */
export function lpBracketDraw(g, x, y, dir) {
  const R = Math.round, X = R(x), Y = R(y);
  g.fillStyle = LC.ir2; for (let k = 0; k < 10; k++) g.fillRect(X + dir * k, Y + k, 1, 1);
  g.fillStyle = LC.ir1; for (let k = 0; k < 10; k++) g.fillRect(X + dir * k + dir, Y + k, 1, 1);
  g.fillStyle = LC.ir3; g.fillRect(X + dir * 3, Y + 2, 1, 1); g.fillRect(X + dir * 6, Y + 5, 1, 1);
  g.fillStyle = LC.ir2; g.fillRect(X + dir * 8, Y + 1, 1, 1); g.fillRect(X + dir * 9, Y + 2, 1, 1); g.fillRect(X + dir * 8, Y + 3, 1, 1);                                  /* the curl */
  g.fillStyle = LC.ir1; g.fillRect(X + dir * 10, Y - 1, 2, 13); g.fillStyle = LC.ir3; g.fillRect(X + dir * 10, Y - 1, 1, 13); g.fillStyle = LC.ir4; g.fillRect(X + dir * 10, Y + 1, 1, 1); g.fillRect(X + dir * 10, Y + 8, 1, 1);   /* the wall plate, its bolts */
  g.fillStyle = LC.rust1; g.fillRect(X + dir * 11, Y + 12, 1, 3); g.fillStyle = LC.rust0; g.fillRect(X + dir * 11, Y + 15, 1, 2);
}
/* THE BALCONY'S HANDRAIL (behind the hero, over its deck): a top rail, balusters with a scroll between each pair, a newel post at either end; drawn once for each span, low (9 px) so the deck still reads as a ledge */
export function lpRailDraw(g, x0, x1, y, time) {   /* x0..x1 = the span's pixel left and right (screen), y = the deck's top (screen) */
  const R = Math.round, a = R(x0), b = R(x1), top = R(y) - 9;
  g.fillStyle = LC.ir2; g.fillRect(a, top, b - a, 1); g.fillStyle = LC.ir4; g.fillRect(a, top, b - a, 1); g.fillStyle = LC.ir1; g.fillRect(a, top + 1, b - a, 1);
  g.fillStyle = LC.ir1; for (let x = a + 3; x < b - 2; x += 4) { g.fillRect(x, top + 2, 1, 7); g.fillStyle = LC.ir3; g.fillRect(x, top + 2, 1, 1); g.fillStyle = LC.ir1; }
  g.fillStyle = LC.ir2; for (let x = a + 5; x < b - 4; x += 8) { g.fillRect(x, top + 4, 3, 1); g.fillRect(x, top + 5, 1, 1); g.fillRect(x + 2, top + 5, 1, 1); }                  /* a small scroll between balusters */
  for (const nx of [a, b - 3]) { g.fillStyle = LC.ir2; g.fillRect(nx, top - 3, 3, 12); g.fillStyle = LC.ir3; g.fillRect(nx, top - 3, 1, 12); g.fillStyle = LC.ir4; g.fillRect(nx, top - 4, 3, 1); g.fillStyle = LC.ir0; g.fillRect(nx + 2, top - 2, 1, 11); }   /* the newel posts, finialled */
}
/* WHAT STANDS UNDER A LEDGE (the generic routeSupports posts were timber: the wood Daniel still saw): a cobbled lip or a quay step stands on a dressed stone pier (courses, a lit edge, a cap block, weed at its foot);
   everything else (a balcony, an awning, a gantry, a crossbar) on a cast-iron column (fluted, collared, a flared head with rivets, a bolted base plate). p = { x, y, bottom } (tiles), sx/sy/sb = screen px */
export function lpSupportDraw(g, p, L, cx, cy) {
  const z = (L.lpLedges || []).find(q => p.x >= q[0] && p.x <= q[1] && p.y === q[2]), kind = z ? z[3] : 'cobble'; if (kind === 'crossbar') return;   /* a lamp standard's own post holds its crossbar up (lpPostDraw) */
  const x = Math.round(p.x * 16 + 6 - cx), y = Math.round(p.y * 16 + 5 - cy), b = Math.round(p.bottom * 16 - cy), len = b - y; if (len < 2) return;
  if (kind === 'cobble' || kind === 'step') {
    g.fillStyle = LC.st1; g.fillRect(x - 1, y, 6, len); g.fillStyle = LC.st3; g.fillRect(x - 1, y, 1, len); g.fillStyle = LC.st0; g.fillRect(x + 4, y, 1, len);
    for (let yy = y + 4; yy < b - 2; yy += 5) { g.fillStyle = LC.st0; g.fillRect(x - 1, yy, 6, 1); if (((yy * 3 + p.x) & 3) === 0) { g.fillStyle = LC.st2; g.fillRect(x + 1, yy + 1, 2, 2); } }
    g.fillStyle = LC.st3; g.fillRect(x - 2, y, 8, 3); g.fillStyle = LC.lip2; g.fillRect(x - 2, y, 8, 1); g.fillStyle = LC.st0; g.fillRect(x - 2, y + 3, 8, 1);
    g.fillStyle = LC.alg1; for (let k = 0; k < 3; k++) g.fillRect(x - 1 + k * 2, b - 3 - (k & 1), 1, 3 + (k & 1));
  } else {
    g.fillStyle = LC.ir1; g.fillRect(x, y, 4, len); g.fillStyle = LC.ir3; g.fillRect(x, y, 1, len); g.fillStyle = LC.ir0; g.fillRect(x + 3, y, 1, len); g.fillStyle = LC.ir2; for (let yy = y + 5; yy < b - 4; yy += 4) g.fillRect(x + 1, yy, 1, 2);
    for (let yy = y + 9; yy < b - 5; yy += 14) { g.fillStyle = LC.ir3; g.fillRect(x - 1, yy, 6, 2); g.fillStyle = LC.ir4; g.fillRect(x - 1, yy, 6, 1); g.fillStyle = LC.ir0; g.fillRect(x - 1, yy + 2, 6, 1); }
    g.fillStyle = LC.ir2; g.fillRect(x - 2, y, 8, 3); g.fillStyle = LC.ir4; g.fillRect(x - 2, y, 8, 1); g.fillStyle = LC.ir0; g.fillRect(x - 2, y + 3, 8, 1); g.fillStyle = LC.ir4; g.fillRect(x - 1, y + 1, 1, 1); g.fillRect(x + 4, y + 1, 1, 1);
    g.fillStyle = LC.ir2; g.fillRect(x - 2, b - 3, 8, 3); g.fillStyle = LC.ir3; g.fillRect(x - 2, b - 3, 8, 1); g.fillStyle = LC.ir4; g.fillRect(x - 1, b - 2, 1, 1); g.fillRect(x + 4, b - 2, 1, 1);
    g.fillStyle = LC.rust1; g.fillRect(x + 1, b - 7, 1, 4); }
}
