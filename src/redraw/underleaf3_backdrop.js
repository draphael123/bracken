// underleaf3_backdrop.js - UNDERLEAF 3's OWN BACKDROP (claude/underleafart). The greybox wore the shared autumn forest in every place. Each of the six areas now has its own air, far line and
// mid row (palette + shapes from underleaf3_pal.js), crossfading at the seams, and HER COTTAGE stands on the skyline from the yard on (the landmark, under the biggest leaf):
//   THE HERB GARDEN      a sage-gold morning under giant hanging leaves, tall fennel and foxglove stalks, thatched huts far down the rows, strings of drying herbs between poles
//   THE DRYING LOFTS     straw-gold afternoon, the drying poles and racks with bundles hung, candle-lit huts, the air full of dried-leaf dust
//   THE THORN HEDGES     bramble-dark dusk, hedges of cane on the far bank, bone charms hanging, lantern jars far off
//   THE CAULDRON YARD    soot and amber, great cauldrons smoking on far hearths, huts with fire in the windows, green steam
//   HER GREAT LEAF       deep green under the biggest leaf, its veins across the whole sky, her cottage glowing under it, witch-motes
//   HER COTTAGE          inside: a mud-plaster wall hung with shelves of jars (glowing), herb bundles, candle sconces, the thatch overhead
// Every static picture is baked ONCE; a frame is ~60 drawImage calls. ART ONLY: nothing here reads or changes a hitbox or a number.
//   drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full)   sky + far + the landmark + mid
//   drawNear(g, cx, cy, VW, VH, L, time, dY)             near stalks and hanging herbs/jars at the edges, witch-motes
import { canvas, mulberry } from '../px.js';
import { PAL, GLOW, CANDLE, JARC, ZONES, palAt, mix, hash } from './underleaf3_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const LOOK = [   /* rays = light shafts, mist, dens = how many stalks stand in the mid row, hut = how many huts, glow = how much witch-light, smoke = chimneys */
  { rays: 0.18, mist: 0.45, dens: 56, hut: 22, glow: 0.15 },   /* garden */
  { rays: 0.14, mist: 0.4, dens: 44, hut: 34, glow: 0.2 },     /* lofts */
  { rays: 0.04, mist: 0.7, dens: 60, hut: 14, glow: 0.3 },     /* hedges */
  { rays: 0.0, mist: 0.5, dens: 38, hut: 40, glow: 0.55 },     /* yard */
  { rays: 0.06, mist: 0.4, dens: 64, hut: 0, glow: 0.8 },      /* great leaf */
  { rays: 0.0, mist: 0.2, dens: 0, hut: 0, glow: 0.9 },        /* cottage */
];

/* ------------------------------------------------------------------ baked pieces ------------------------------------------------------------------ */
/* a GIANT LEAF hanging from the top: a broad pointed oval, midrib and side veins, lit on the left; w = half width, h = length; hazy = 0..1 toward the air; curl = tip bends */
function bakeLeaf(z, seed, w, h, hazy, curl) {
  const P = PAL[z], r = mulberry(seed * 19 + z * 3), lf = P.leaf.map(c => mix(c, P.haze, hazy)), W = w * 2 + 12 + Math.abs(curl) * 2, [c, g] = canvas(W, h + 6), CX = (W >> 1);
  for (let y = 0; y < h; y++) { const t = y / h, half = Math.max(0, Math.round(w * Math.sin(Math.PI * Math.pow(t, 0.62)) * (1 - t * 0.2))), sh = Math.round(curl * t * t), xl = CX - half + sh, wd = half * 2;
    if (wd < 1) { R(g, lf[0], CX + sh, y, 1, 1); continue; }
    R(g, lf[1], xl, y, wd, 1); R(g, lf[2], xl, y, Math.max(1, wd >> 2), 1); R(g, lf[0], xl + wd - Math.max(1, wd >> 2), y, Math.max(1, wd >> 2), 1);
    R(g, mix(lf[0], '#000000', 0.25), xl, y, 1, 1); R(g, mix(lf[0], '#000000', 0.25), xl + wd - 1, y, 1, 1);   /* the edge */
    R(g, lf[2], CX + sh, y, 1, 1);                                                                              /* the midrib */
    if (y % 7 === 3 && half > 4) for (let k = 1; k < half - 1; k++) { const yy = y + Math.round(k * 0.55); if (yy < h) { R(g, mix(lf[1], lf[2], 0.45), CX + sh - k, yy, 1, 1); R(g, mix(lf[1], lf[0], 0.35), CX + sh + k, yy, 1, 1); } } }   /* side veins running down and out */
  R(g, lf[0], CX - 1, 0, 3, 3); for (let i = 0; i < 6; i++) R(g, mix(lf[2], '#ffffff', 0.15), CX - w + ((r() * w * 2) | 0), 4 + ((r() * (h - 8)) | 0), 1, 1);
  return c;
}
/* a GIANT STALK: a green-brown pillar, ringed at its nodes, with leaf-pairs growing off it; w = half width */
function bakeStalk(z, seed, w, h, hazy) {
  const P = PAL[z], r = mulberry(seed * 31 + z * 7), lf = P.leaf.map(c => mix(c, P.haze, hazy)), W = w * 2 + 50, [c, g] = canvas(W, h), CX = W >> 1, st = [mix(P.rush[0], P.haze, hazy), mix(P.rush[1], P.haze, hazy), mix(P.rush[2], P.haze, hazy)];
  for (let y = 0; y < h; y++) { const ww = w + Math.round(Math.sin(y * 0.04 + seed) * 1), xl = CX - ww, wd = ww * 2;
    R(g, lf[1], xl, y, wd, 1); R(g, lf[2], xl, y, Math.max(1, wd >> 2), 1); R(g, lf[0], xl + wd - Math.max(1, wd >> 2), y, Math.max(1, wd >> 2), 1);
    if (wd > 7 && (y + seed) % 3 === 0) R(g, mix(lf[1], lf[0], 0.5), xl + (wd >> 1), y, 1, 1); }                                     /* fibres */
  for (let ny = 24 + ((r() * 20) | 0); ny < h - 20; ny += 46 + ((r() * 30) | 0)) {                                                    /* the nodes: a dry sheath ring and a leaf pair */
    R(g, st[1], CX - w - 2, ny, w * 2 + 4, 4); R(g, st[2], CX - w - 2, ny, w * 2 + 4, 1); R(g, st[0], CX - w - 2, ny + 3, w * 2 + 4, 1);
    for (const d of [-1, 1]) { const len = 14 + ((r() * 14) | 0); for (let k = 0; k < len; k++) { const lw = Math.max(1, Math.round(Math.sin(k / len * Math.PI) * 4)), px0 = CX + d * (w + 1 + k), py = ny - Math.round(k * 0.55) + Math.round(k * k * 0.012);
      R(g, k < 3 ? lf[0] : lf[1], d > 0 ? px0 : px0 - 1, py, 1, lw); R(g, lf[2], d > 0 ? px0 : px0 - 1, py, 1, 1); } } }
  return c;
}
/* a HUT: a round mud-plaster hut under a thatch of overlapping leaf scales, a low arched door with candle light in it, a window slit, a chimney pot, jars and herb bunches hung by the door */
function bakeHut(z, seed, hazy, lit) {
  const P = PAL[z], r = mulberry(seed * 23 + z), lf = P.leaf.map(c => mix(c, P.haze, hazy)), ru = P.rush.map(c => mix(c, P.haze, hazy)), Wd = 50 + (seed % 3) * 8, Ht = 38 + (seed % 2) * 6, [c, g] = canvas(Wd + 12, Ht + 20), CX = (Wd + 12) >> 1;
  const base = Ht + 18;
  /* the plaster body */
  R(g, mix(ru[1], P.s[3], 0.35), CX - Wd / 2 + 4, base - 16, Wd - 8, 16); R(g, mix(ru[2], P.s[4], 0.3), CX - Wd / 2 + 4, base - 16, 4, 16); R(g, mix(ru[0], P.s[1], 0.4), CX + Wd / 2 - 8, base - 16, 4, 16);
  /* the thatch dome */
  for (let y = 0; y < Ht - 6; y++) { const t = (y + 1) / (Ht - 6), half = Math.round((Wd / 2 + 2) * Math.sqrt(1 - Math.pow(1 - t, 2))), yy = base - 16 - (Ht - 6) + y + 6;
    R(g, lf[1], CX - half, yy, half * 2, 1); R(g, lf[2], CX - half, yy, Math.max(1, half >> 2), 1); R(g, lf[0], CX + half - Math.max(1, half >> 2), yy, Math.max(1, half >> 2), 1);
    if (y % 4 === 3) for (let x = -half + (y % 8 ? 2 : 0); x < half; x += 5) { R(g, lf[0], CX + x, yy, 3, 1); R(g, lf[2], CX + x, yy - 1, 2, 1); } }                       /* the leaf scales, in rows */
  R(g, lf[0], CX - Wd / 2 - 1, base - 16, Wd + 2, 2);                                                                                       /* the eave's shadow */
  /* the door and a window slit; the light in them is the candle (a halo is drawn live over a lit one) */
  R(g, mix(P.s[0], '#000000', 0.2), CX - 5, base - 12, 10, 12); R(g, mix(P.s[0], '#000000', 0.2), CX - 4, base - 14, 8, 2); R(g, lit ? CANDLE.mid : mix(P.s[1], P.haze, hazy), CX - 3, base - 10, 6, 10); R(g, lit ? CANDLE.hi : mix(P.s[2], P.haze, hazy), CX - 2, base - 8, 3, 6);
  R(g, mix(P.s[0], '#000000', 0.2), CX + Wd / 2 - 16, base - 12, 6, 5); R(g, lit ? CANDLE.c : mix(P.s[1], P.haze, hazy), CX + Wd / 2 - 15, base - 11, 4, 3);
  /* a chimney pot on the dome and a string of herbs by the door */
  R(g, ru[0], CX + 6, base - 16 - (Ht - 6) + 2, 5, 6); R(g, ru[1], CX + 6, base - 16 - (Ht - 6) + 2, 2, 6); R(g, mix(P.s[0], '#000000', 0.3), CX + 6, base - 16 - (Ht - 6) + 1, 5, 1);
  R(g, ru[2], CX - Wd / 2 + 8, base - 14, 1, 7); for (let k = 0; k < 3; k++) R(g, lf[1 + (k % 2)], CX - Wd / 2 + 7 + (k % 2), base - 8 + k * 2, 3, 2);
  return c;
}
/* HER COTTAGE (the landmark): a round mud-plaster hut under the biggest leaf in the world - the leaf arches over it like an umbrella - her cauldron smoking beside it, jars hung in a row
   along the eaves (glowing), a bone-charm chime, a door with a candle. 190 x 150. */
function bakeCottage() {
  const [c, g] = canvas(200, 160), r = mulberry(77), P = PAL[4], lf = P.leaf, ru = P.rush, base = 150;
  /* THE GREAT LEAF: a vast leaf arched over the cottage, stalk to the right, its tip drooping over the left; veins fan out */
  for (let x = 0; x < 196; x++) { const t = x / 195, top = Math.round(8 + 56 * Math.pow(Math.abs(t - 0.62) * 1.6, 1.6)), thick = 5 + Math.round(8 * Math.sin(Math.PI * Math.min(1, t * 1.1)));
    for (let y = top; y < top + thick; y++) { const k = (y - top) / thick; R(g, k < 0.3 ? lf[2] : k < 0.75 ? lf[1] : lf[0], x, y, 1, 1); }
    if (x % 9 === 0) for (let k = 1; k < 14; k++) R(g, mix(lf[1], lf[2], 0.4), x - k, top + Math.round(k * 0.5) + 1, 1, 1);                       /* veins */ }
  R(g, lf[2], 0, 66, 4, 2);
  /* the body */
  R(g, mix(ru[1], P.s[3], 0.3), 40, base - 52, 110, 52); R(g, mix(ru[2], P.s[4], 0.25), 40, base - 52, 8, 52); R(g, mix(ru[0], P.s[1], 0.4), 140, base - 52, 10, 52);
  for (let y = base - 52; y < base; y += 6) for (let x = 44; x < 146; x += 9) R(g, mix(ru[1], P.s[2], 0.5), x + (y % 12 ? 4 : 0), y, 5, 1);                            /* plaster strokes */
  /* the thatch dome */
  for (let y = 0; y < 44; y++) { const t = (y + 1) / 44, half = Math.round(64 * Math.sqrt(1 - Math.pow(1 - t, 2))), yy = base - 52 - 44 + y + 6;
    R(g, lf[1], 95 - half, yy, half * 2, 1); R(g, lf[2], 95 - half, yy, Math.max(1, half >> 2), 1); R(g, lf[0], 95 + half - Math.max(1, half >> 2), yy, Math.max(1, half >> 2), 1);
    if (y % 4 === 3) for (let x = -half + (y % 8 ? 3 : 0); x < half; x += 6) { R(g, lf[0], 95 + x, yy, 4, 1); R(g, lf[2], 95 + x, yy - 1, 3, 1); } }
  R(g, lf[0], 30, base - 52, 130, 3);
  /* the door: an arch, warm inside, a candle in it */
  R(g, '#0e0905', 82, base - 30, 26, 30); R(g, '#0e0905', 84, base - 34, 22, 4); R(g, '#0e0905', 88, base - 37, 14, 3); R(g, CANDLE.lo, 86, base - 26, 18, 26); R(g, CANDLE.mid, 88, base - 22, 14, 22); R(g, CANDLE.c, 91, base - 16, 8, 16); R(g, CANDLE.hi, 93, base - 10, 4, 8);
  R(g, '#2a1a0c', 94, base - 36, 2, 36);
  /* two round windows, lit */
  for (const wx of [56, 128]) { R(g, '#0e0905', wx - 1, base - 41, 14, 14); R(g, CANDLE.mid, wx, base - 40, 12, 12); R(g, CANDLE.c, wx + 2, base - 38, 8, 8); R(g, CANDLE.hi, wx + 4, base - 36, 3, 3); R(g, '#2a1a0c', wx + 5, base - 40, 2, 12); R(g, '#2a1a0c', wx, base - 35, 12, 2); }
  /* her jars strung along the eaves, glowing (the three colours: the rule's, in one row, in the dark of the thatch) */
  const cols = ['green', 'blue', 'red', 'green', 'red', 'blue', 'green', 'red', 'blue']; R(g, '#3a2a18', 36, base - 56, 124, 1);
  cols.forEach((k, i) => { const jx = 42 + i * 13, J = JARC[k]; R(g, '#3a2a18', jx + 3, base - 56, 1, 4 + (i % 2) * 2); const jy = base - 52 + (i % 2) * 2; R(g, J[2], jx, jy, 8, 9); R(g, J[0], jx + 1, jy + 1, 6, 7); R(g, J[1], jx + 1, jy + 1, 2, 4); R(g, '#5a3a1e', jx + 2, jy - 2, 4, 2); });
  /* a bone-charm chime by the door */
  R(g, '#3a2a18', 66, base - 52, 1, 8); for (let k = 0; k < 4; k++) { R(g, '#e8dcc0', 63 + k * 3, base - 46 + (k % 2) * 3, 1, 8 - (k % 2) * 2); R(g, '#9c8c68', 63 + k * 3, base - 40, 1, 1); }
  /* HER CAULDRON beside it: an iron belly on three feet, green brew and steam */
  R(g, '#14100c', 160, base - 26, 30, 22); R(g, '#2a2420', 162, base - 24, 26, 18); R(g, '#3a342c', 160, base - 26, 30, 3); R(g, '#14100c', 164, base - 4, 4, 4); R(g, '#14100c', 182, base - 4, 4, 4);
  R(g, GLOW.mid, 163, base - 27, 24, 2); R(g, GLOW.c, 166, base - 28, 14, 1); R(g, '#9a6a2a', 166, base - 2, 18, 2);
  /* a path of stones to the door */
  for (let k = 0; k < 5; k++) { R(g, P.s[5], 88 + k * 3 - 6, base + 1 + k, 14 - k * 2, 2); }
  return c;
}
/* a drying line: a rope sagging between two poles with herb bundles hung from it; 96 wide */
function bakeHerbLine(z, seed, hazy) {
  const P = PAL[z], r = mulberry(seed * 9 + z), lf = P.leaf.map(c => mix(c, P.haze, hazy)), ru = P.rush.map(c => mix(c, P.haze, hazy)), [c, g] = canvas(96, 40);
  R(g, ru[0], 0, 0, 3, 40); R(g, ru[0], 93, 0, 3, 40); R(g, ru[2], 0, 0, 1, 40); R(g, ru[2], 93, 0, 1, 40);
  for (let x = 3; x < 93; x++) { const y = 2 + Math.round(Math.sin((x - 3) / 90 * Math.PI) * 9); R(g, ru[2], x, y, 1, 1); }
  for (let k = 0; k < 8; k++) { const x = 8 + k * 11 + ((r() * 3) | 0), y = 2 + Math.round(Math.sin((x - 3) / 90 * Math.PI) * 9), len = 8 + ((r() * 8) | 0), col = lf[(k + seed) % 3 === 0 ? 2 : 1];
    R(g, ru[2], x, y + 1, 1, 2); for (let j = 0; j < len; j++) { const w = Math.max(1, 3 - (j >> 2)); R(g, j % 3 === 0 ? lf[0] : col, x - (w >> 1), y + 3 + j, w, 1); } }
  return c;
}
/* a lantern JAR on a string (witch-light): a small jar with the glow in it; 8 x 22 (the halo is drawn live) */
const bakeLanternJar = (col, v) => once('lj' + col + v, () => { const [c, g] = canvas(10, 26), J = col === 'glow' ? [GLOW.lo, GLOW.mid, GLOW.lo, GLOW.hi] : JARC[col]; R(g, '#3a2a18', 4, 0, 1, 12 + (v % 3) * 2); const y = 12 + (v % 3) * 2;
  R(g, J[2], 1, y, 8, 10); R(g, J[0], 2, y + 1, 6, 8); R(g, J[1], 2, y + 1, 2, 5); R(g, J[3], 2, y + 2, 1, 2); R(g, '#5a3a1e', 3, y - 2, 4, 2); return c; });
/* a hanging bundle of herbs (dried), 10 x 24 */
const bakeBundle = (z, v) => once('hb' + z + '_' + v, () => { const P = PAL[z], [c, g] = canvas(12, 26), r = mulberry(v * 5 + z); R(g, '#3a2a18', 5, 0, 1, 8); R(g, P.rush[2], 4, 7, 3, 2);
  for (let j = 0; j < 14; j++) { const w = Math.max(2, 7 - (j >> 1)); R(g, j % 3 === 0 ? P.leaf[0] : P.leaf[1 + (v & 1)], 6 - (w >> 1), 9 + j, w, 1); if (r() < 0.3) R(g, P.leaf[2], 6 - (w >> 1), 9 + j, 1, 1); } return c; });
/* a soft band (mist), a soft glow disc */
function bakeMist(rgb, a) { const [c, g] = canvas(1, 48); for (let y = 0; y < 48; y++) { const k = Math.sin((y / 47) * Math.PI); g.fillStyle = 'rgba(' + rgb + ',' + (k * k * a).toFixed(3) + ')'; g.fillRect(0, y, 1, 1); } return c; }
function bakeHalo(rgb) { const [c, g] = canvas(48, 48), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, 'rgba(' + rgb + ',0.5)'); gr.addColorStop(0.4, 'rgba(' + rgb + ',0.16)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, 48, 48); return c; }
const halo = rgb => once('halo' + rgb, () => bakeHalo(rgb));
/* THE ROOM (her cottage's back wall): mud plaster, wattle ribs, a thatch ceiling, shelves of jars; 160 wide, tiles */
function bakeRoom(seed) {
  const P = PAL[5], r = mulberry(seed * 13 + 4), W = 160, H = 360, [c, g] = canvas(W, H), pl = [mix(P.rush[0], '#000000', 0.45), mix(P.rush[1], '#000000', 0.55), mix(P.rush[2], '#000000', 0.5)];
  R(g, pl[0], 0, 0, W, H);
  for (let y = 0; y < H; y += 5) for (let x = (y % 10 ? 3 : 0); x < W; x += 9) R(g, hash(x, y) % 3 ? pl[1] : pl[0], x, y, 6, 1);                                          /* plaster strokes */
  for (const rx of [18, 78, 138]) { R(g, P.s[1], rx, 0, 5, H); R(g, P.s[3], rx, 0, 1, H); }                                                                            /* wattle ribs / roots */
  /* the shelves: two boards with jars; the jar colours are the three of her rule, dim - the room is lit by the fire */
  for (const sy of [118, 196]) { R(g, P.s[2], 0, sy, W, 4); R(g, P.s[4], 0, sy, W, 1); R(g, '#0a0604', 0, sy + 4, W, 2);
    for (let x = 6; x < W - 10; x += 10 + ((r() * 7) | 0)) { const k = ['green', 'blue', 'red'][(r() * 3) | 0], J = JARC[k], hh = 8 + ((r() * 6) | 0), dim = 0.45; R(g, mix(J[2], '#000000', 0.2), x, sy - hh, 7, hh); R(g, mix(J[0], '#000000', 1 - dim), x + 1, sy - hh + 1, 5, hh - 2); R(g, mix(J[1], '#000000', 0.5), x + 1, sy - hh + 1, 1, 4); R(g, '#3a2a18', x + 1, sy - hh - 2, 5, 2); } }
  /* herb bundles hanging from the ceiling, a bone chime */
  for (let x = 10; x < W - 6; x += 22 + ((r() * 12) | 0)) { const len = 22 + ((r() * 30) | 0); R(g, '#2a1a0c', x, 0, 1, 10); for (let j = 0; j < len; j++) { const w = Math.max(2, 7 - (j >> 2)); R(g, j % 3 === 0 ? mix(P.leaf[0], '#000000', 0.3) : mix(P.leaf[1], '#000000', 0.35), x - (w >> 1), 10 + j, w, 1); } }
  /* the thatch overhead: a dark band of leaf scales across the top */
  for (let y = 0; y < 34; y++) for (let x = 0; x < W; x += 6) R(g, y % 6 < 3 ? mix(P.leaf[0], '#000000', 0.35) : mix(P.leaf[1], '#000000', 0.5), x + (y % 12 < 6 ? 0 : 3), y, 5, 1);
  R(g, '#0a0604', 0, 34, W, 3);
  return c;
}
/* a candle sconce: bone holder + flame; 6 x 12 (halo live) */
const bakeSconce = () => once('sconce', () => { const [c, g] = canvas(8, 14); R(g, '#9c8c68', 3, 6, 2, 8); R(g, '#e8dcc0', 2, 4, 4, 4); R(g, CANDLE.c, 3, 1, 2, 3); R(g, CANDLE.hi, 3, 1, 1, 2); return c; });

/* ------------------------------------------------------------------ placement ------------------------------------------------------------------ */
const farBase = (VH, dY) => Math.round(VH * 0.52 + dY * 0.05), midBase = (VH, dY) => Math.round(VH * 0.72 + dY * 0.12);
function row(cx, VW, f, s, salt) {
  const out = [], mid = cx + VW / 2, i0 = Math.floor((mid * f - VW / 2 - 90) / s), i1 = Math.ceil((mid * f + VW / 2 + 90) / s);
  for (let i = i0; i <= i1; i++) { const hs = hash(i, salt), U = i * s + (hs % Math.max(2, s >> 1)); out.push({ sx: Math.round(VW / 2 + U - mid * f), hs }); }
  return out;
}
const rgbStr = h => h.slice(1).match(/../g).map(x => parseInt(x, 16)).join(',');

/* ------------------------------------------------------------------ the layers, each drawn for one place at an alpha (a seam draws two) ------------------------------------------------------------------ */
function farLayer(g, z, al, cx, VW, VH, fb, time) {
  const P = PAL[z], look = LOOK[z]; if (z === 5) return;
  g.globalAlpha = 0.5 * al; g.fillStyle = mix(P.haze, P.s[1], 0.55); g.fillRect(0, fb + 6, VW, VH - fb); g.globalAlpha = al;
  /* far HUTS down the rows, in haze, a few with a lit window */
  for (const o of row(cx, VW, 0.12, 70, 13)) { if (look.hut <= 0 || (o.hs >>> 5) % 100 >= look.hut * 1.6) continue; const lit = (o.hs >> 9) % 3 !== 0 && (z >= 1), sp = once('fh' + z + '_' + (o.hs % 3) + (lit ? 'l' : ''), () => bakeHut(z, o.hs % 3 + 1, 0.62, lit)); g.drawImage(sp, o.sx - (sp.width >> 1), fb - sp.height + 22 + (o.hs % 5));
    if (lit) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.32 * al; g.drawImage(halo(CANDLE.rgb), o.sx - 18, fb - 22 + (o.hs % 5), 36, 30); g.restore(); g.globalAlpha = al; } }
  /* far giant leaves hanging from the top edge, hazy (every place; the great leaf's are the biggest) */
  const lf = z === 4 ? 1.4 : 1;
  for (const o of row(cx, VW, 0.07, 120, 29)) { if ((o.hs >>> 5) % 100 >= 70) continue; const sp = once('fl' + z + '_' + (o.hs % 4), () => bakeLeaf(z, o.hs % 4 + 1, Math.round((22 + (o.hs % 4) * 8) * lf), Math.round((90 + (o.hs % 4) * 28) * lf), 0.66, ((o.hs % 5) - 2) * 6)); g.globalAlpha = 0.9 * al; g.drawImage(sp, o.sx - (sp.width >> 1), -6 - ((o.hs >> 7) % 20)); g.globalAlpha = al; }
  /* far witch-light pin-points (the yard, the great leaf) */
  if (look.glow > 0.4) for (let i = 0; i < 14; i++) { const hs = hash(i, 301), U = (hs % 900) - 220, sx = Math.round(((U - cx * 0.1) % (VW + 100) + VW + 100) % (VW + 100)) - 50, sy = 30 + (hs >> 5) % Math.round(VH * 0.45), tw = 0.5 + 0.5 * Math.sin(time * (1.1 + (hs % 5) * 0.2) + hs);
    g.globalAlpha = al * look.glow * 0.7 * tw; R(g, GLOW.c, sx, sy, 1, 1); }
  g.globalAlpha = 1;
}
function midLayer(g, z, al, cx, VW, VH, mb, time) {
  const look = LOOK[z], P = PAL[z]; if (z === 5) return; g.globalAlpha = al;
  for (const o of row(cx, VW, 0.3, 58, 71)) { if ((o.hs >>> 5) % 100 >= look.dens) continue; const v = o.hs % 4, w = 4 + (o.hs % 3) * 2, hz = 0.28;
    const sp = once('ms' + z + '_' + v, () => bakeStalk(z, v + 1, w, 300, hz)), X = o.sx - (sp.width >> 1), Y = mb - 300 + 4 - (o.hs & 3);
    g.drawImage(sp, X, Y); }
  /* huts at the foot of the stalks, lit windows warm and breathing (halo) */
  for (const o of row(cx, VW, 0.3, 120, 233)) { if (look.hut <= 0 || (o.hs >>> 5) % 100 >= look.hut * 1.5) continue; const lit = z >= 1 && ((o.hs >> 9) % 4 !== 0), sp = once('mh' + z + '_' + (o.hs % 3) + (lit ? 'l' : ''), () => bakeHut(z, o.hs % 3 + 1, 0.2, lit)), hx = o.sx - (sp.width >> 1), hy = mb - sp.height + 10;
    g.globalAlpha = al; g.drawImage(sp, hx, hy);
    if (lit) { const fl = 0.7 + 0.3 * Math.sin(time * 5 + o.hs); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.45 * fl * al; g.drawImage(halo(CANDLE.rgb), hx + (sp.width >> 1) - 22, hy + sp.height - 38, 44, 34); g.restore(); g.globalAlpha = al; }
    /* chimney smoke, thin and slow */
    if (z >= 1 && (o.hs % 3) !== 1) for (let k = 0; k < 4; k++) { const ph = (time * 0.25 + k / 4 + (o.hs % 7) / 7) % 1; g.globalAlpha = 0.28 * (1 - ph) * al; R(g, mix(P.haze, '#d8d8c8', 0.4), hx + (sp.width >> 1) + 7 + Math.round(Math.sin(ph * 5 + o.hs) * 3 + ph * 8), hy + 5 - ph * 30, 3, 3); } g.globalAlpha = al; }
  /* the drying lines (the lofts' poles, the garden's rows) and the hanging jars of the hedges and yard */
  if (z <= 1) for (const o of row(cx, VW, 0.3, 180, 419)) { if ((o.hs >>> 5) % 100 >= (z === 1 ? 70 : 40)) continue; const sp = once('hl' + z + '_' + (o.hs % 3), () => bakeHerbLine(z, o.hs % 3 + 1, 0.2)); g.globalAlpha = al; g.drawImage(sp, o.sx - 48, mb - 100 - (o.hs % 18)); }
  g.globalAlpha = 1;
}
/* THE ROOM (her cottage): the back wall of plaster across the whole view, parallax 0.3 */
function roomLayer(g, al, cx, VW, VH, time) {
  const sp = once('room', () => bakeRoom(1)), so = ((-(cx * 0.3)) % 160 + 160) % 160, vy = Math.round(VH - 360 > 0 ? (VH - 360) : 0); g.globalAlpha = al;
  for (let X = -160 + so; X < VW + 160; X += 160) g.drawImage(sp, Math.round(X), vy - Math.max(0, 360 - VH) * 0.5);
  /* candle sconces on the ribs, breathing; the fire's glow along the floor */
  for (const o of row(cx, VW, 0.3, 160, 905)) { const sc = bakeSconce(), fl = 0.65 + 0.35 * Math.sin(time * 6 + o.hs); g.globalAlpha = al; g.drawImage(sc, o.sx - 4, Math.round(VH * 0.38)); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.5 * fl * al; g.drawImage(halo(CANDLE.rgb), o.sx - 28, Math.round(VH * 0.38) - 24, 56, 56); g.restore(); }
  g.globalAlpha = 1;
}

/* ------------------------------------------------------------------ the frame ------------------------------------------------------------------ */
export function drawBackdrop(g, cx, cy, VW, VH, L, time, dY, full) {
  const mid = cx + VW / 2, tM = mid / 16, A = palAt(tM), z = A.z, nz = A.nz, P = A.P, Q = A.Q, fb = farBase(VH, dY), mb = midBase(VH, dY), look = LOOK[z], seam = A.k > 0.02;
  /* SKY / BACK COLOUR: the place's two colours, a seam crossfade to the next place */
  { const c0 = mix(P.sky[0], Q.sky[0], A.k), c1 = mix(P.sky[1], Q.sky[1], A.k); const gr = g.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, c0); gr.addColorStop(0.75, c1); gr.addColorStop(1, mix(c1, '#000000', 0.25)); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
  /* LIGHT SHAFTS through the leaves (the garden's morning, the lofts' afternoon): slow slanted bars, additive, warm */
  { const rays = look.rays * (1 - A.k) + LOOK[nz].rays * A.k; if (rays > 0.01) { g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const x0 = ((i * 83 - cx * 0.08 + time * 1.4 * (i % 2 ? 1 : -1)) % (VW + 120) + VW + 120) % (VW + 120) - 60, w = 12 + (i * 7) % 16; g.globalAlpha = rays * (0.6 + 0.4 * Math.sin(time * 0.4 + i * 2));
      g.fillStyle = mix(P.sky[1], '#fff0b8', 0.6); g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + w, 0); g.lineTo(x0 + w - 46, VH); g.lineTo(x0 - 46, VH); g.fill(); } g.restore(); g.globalAlpha = 1; } }
  if (full) { farLayer(g, z, 1 - A.k, cx, VW, VH, fb, time); if (seam) farLayer(g, nz, A.k, cx, VW, VH, fb, time); }
  /* HER COTTAGE ON THE SKYLINE (the landmark): from the yard on, far to the right at first, then centred under the biggest leaf as you reach her; a halo of her potion-light breathes at its door */
  if (tM > 250 && tM < 436) { const land = once('cottage', () => bakeCottage()), k = Math.min(1, Math.max(0, (tM - 250) / 190)), sx = Math.round(VW / 2 + (454 * 16 - mid) * 0.1 - land.width / 2), sy = fb - land.height + 30 + Math.round(dY * 0.03), fade = tM > 420 ? Math.max(0, (436 - tM) / 16) : 1;
    g.globalAlpha = (0.55 + 0.4 * k) * fade; g.drawImage(land, sx, sy);
    g.save(); g.globalCompositeOperation = 'lighter'; const br = 0.7 + 0.3 * Math.sin(time * 2.3); g.globalAlpha = 0.4 * br * fade; g.drawImage(halo(CANDLE.rgb), sx + 95 - 36, sy + land.height - 62, 72, 56); g.globalAlpha = 0.34 * br * fade; g.drawImage(halo(GLOW.rgb), sx + 174 - 28, sy + land.height - 46, 56, 40); g.restore();
    for (let q = 0; q < 5; q++) { const ph = (time * 0.18 + q / 5) % 1; g.globalAlpha = 0.34 * (1 - ph) * fade; R(g, mix(GLOW.mid, '#ffffff', 0.3), sx + 174 + Math.round(Math.sin(ph * 6 + q) * 4) + ph * 6, sy + land.height - 54 - ph * 70, 4, 4); }
    g.globalAlpha = 1; }
  { const ph = Math.sin(time * 0.12) * 12, mc = rgbStr(mix(P.haze, Q.haze, A.k)); g.globalAlpha = Math.min(1, 0.5 * look.mist + 0.12); g.drawImage(once('mA' + mc, () => bakeMist(mc, 0.6)), 0, 0, 1, 48, Math.round(ph) - 14, fb - 24, VW + 28, 52); g.globalAlpha = 1; }
  midLayer(g, z, 1 - A.k, cx, VW, VH, mb, time); if (seam) midLayer(g, nz, A.k, cx, VW, VH, mb, time);
  if (z === 5 || (seam && nz === 5)) roomLayer(g, z === 5 ? 1 - (seam ? A.k : 0) : A.k, cx, VW, VH, time);
  { const ph = Math.sin(time * 0.17 + 1) * 16, mc = rgbStr(mix(P.haze, Q.haze, A.k)); g.globalAlpha = Math.min(1, 0.7 * look.mist); g.drawImage(once('mB' + mc, () => bakeMist(mc, 0.5)), 0, 0, 1, 48, Math.round(ph) - 16, mb - 30, VW + 32, 48); g.globalAlpha = 1; }
}

/* ---------------- NEAR (0.55): dark leaves across the top, hanging herb bundles and lantern jars, witch-motes ---------------- */
const nearLeaf = (z, v) => once('nl' + z + '_' + v, () => { const sp = bakeLeaf(z, v + 9, 30 + v * 8, 110 + v * 25, 0, (v - 1) * 8), [c, g2] = canvas(sp.width, sp.height); g2.drawImage(sp, 0, 0); const img = g2.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 0; i < d.length; i += 4) { d[i] *= 0.4; d[i + 1] *= 0.42; d[i + 2] *= 0.38; } g2.putImageData(img, 0, 0); return c; });
export function drawNear(g, cx, cy, VW, VH, L, time, dY) {
  const mid = cx + VW / 2, tM = mid / 16, A = palAt(tM);
  for (const [z, al] of A.k > 0.02 ? [[A.z, 1 - A.k], [A.nz, A.k]] : [[A.z, 1]]) {
    for (const o of row(cx, VW, 0.55, 190, 41)) { if ((o.hs >>> 5) % 100 >= 55) continue; const sp = nearLeaf(z, o.hs % 3); g.globalAlpha = 0.78 * al; g.drawImage(sp, o.sx - (sp.width >> 1), -20 - ((o.hs >> 6) % 30) + Math.min(0, Math.round(dY * 0.05) - 2)); }
    /* hanging herb bundles (the lofts, the garden) and lantern jars (the hedges, the yard, the great leaf) from the top edge, swaying */
    for (const o of row(cx, VW, 0.5, 70, 59)) { const hs = o.hs; if ((hs >>> 5) % 100 >= (z <= 1 ? 55 : 35)) continue; const sw = Math.round(Math.sin(time * 0.6 + hs * 0.02) * 1.5), top = -4 + Math.min(0, Math.round(dY * 0.05) - 2);
      if (z <= 1) { g.globalAlpha = 0.85 * al; g.drawImage(bakeBundle(z, hs % 3), o.sx - 6 + sw, top + (hs % 12)); }
      else { const col = z === 2 ? 'glow' : ['green', 'blue', 'red', 'glow'][hs % 4], lj = bakeLanternJar(col, hs); g.globalAlpha = 0.9 * al; g.drawImage(lj, o.sx - 5 + sw, top - 4 + (hs % 14));
        g.save(); g.globalCompositeOperation = 'lighter'; const J = col === 'glow' ? GLOW.rgb : rgbStr(JARC[col][0]); g.globalAlpha = 0.28 * al * (0.7 + 0.3 * Math.sin(time * 3 + hs)); g.drawImage(halo(J), o.sx - 18 + sw, top + 8 + (hs % 14), 36, 36); g.restore(); } }
  }
  g.globalAlpha = 1;
  /* witch-motes drifting where her light is (the yard, the great leaf, her cottage): pale green-gold */
  const glow = LOOK[A.z].glow; if (glow > 0.3) for (let i = 0; i < 9; i++) { const hs = hash(i, 777), a = time * (0.25 + (hs % 5) * 0.05) + hs, X = ((hs % 400) - cx * 0.55 % 400 + 400) % 400 - 40 + Math.round(Math.sin(a) * 14), Y = 20 + (hs >> 4) % Math.round(VH * 0.6) + Math.round(Math.sin(a * 1.3) * 8), tw = 0.5 + 0.5 * Math.sin(time * 2.1 + hs);
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.3 * glow * tw; g.drawImage(halo(GLOW.rgb), X - 10, Y - 10, 20, 20); g.restore(); g.globalAlpha = glow * (0.5 + 0.5 * tw); R(g, GLOW.hi, X, Y, 1, 1); g.globalAlpha = 1; }
}
export { ZONES };
