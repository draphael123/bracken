// ============================================================================================
// THE DESERT — art for THE SUNKEN CARAVAN (not wired in; each baker says where phase 2 / the level batch uses it).
// Everything here is px.js primitives only, so tools/desert-art.mjs can render it in Node and look at it.
//
// THE PALETTE IS THE SUN. Every screen of this level asks "where is the next shade?", so the art keeps two values
// apart everywhere: SUNLIT sand and rock are pale and warm, and anything in SHADE is a clear step cooler and darker
// (the purple of a desert shadow, not a darker orange). An awning's shadow, a wagon's lee, an overhang: the player
// has to read them at a glance, and the shade colour (DESERT.shade) is the same everywhere so it means one thing.
//
//   bakeRockSlopes()            sandstone slopes: same kinds and layout as bakeSandSlopes (redraw/slopes.js)
//   bakeDesertSky(h)            the sky, bleached near the horizon: a 16 px wide strip to repeat
//   bakeFarMesas(w, h)          the far layer: flat-topped mesas in the haze, tiles horizontally (w a multiple of 64)
//   bakeMidDunes(w, h)          the middle layer: dune crests, lit face and shade face, tiles horizontally
//   bakeQuicksand()             4 frames of a 16x16 quicksand tile (tiles horizontally): it turns in on itself
//   bakeSandfall()              { fall: 4 frames 16x16 (tiles vertically), foot: 4 frames 24x10 }
//   bakeWagonWreck(v)           a caravan wagon half under a dune (v 0/1): 64x34, anchor bottom-centre; shade under its bed
//   bakeAwning(v)               a striped trader's awning on two poles: 52x30; SHADE x 3..49 under it
//   bakeBones()                 { skull, ribs, horn }: an ox's, half in the sand
//   bakeCargo()                 { amphora, amphoraDown, rug, sack, chest }: what the caravan carried
//   bakeScrub(v), bakeDeadTree(), bakeStandard(): dry scrub, a bleached tree, the caravan's standard with its bells
// ============================================================================================
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, mulberry, shade as tint, rgb, hex } from '../px.js';
import { OUT } from '../art.js';
import { bakeSandSlopes } from './slopes.js';

export const DESERT = {
  shade: '#8a6a86', shadeD: '#6e5470',            // THE shadow colour: cool, violet, the same everywhere
  sky0: '#5d93c8', sky1: '#8cb6d8', sky2: '#c6d6d2', sky3: '#f1dfb4',
  mesa: '#c69a86', mesaL: '#d9b39a', mesaD: '#a67f78', haze: '#e6cfb0',
  dune: '#e2bb7a', duneL: '#f2d79c', duneD: '#bf8f63', duneS: '#a57a64',
  wood: '#7a5232', woodL: '#9c6d43', woodD: '#553722', woodS: '#3e2a1c', iron: '#4a4a52', ironL: '#7a7a84',
  cloth: '#e3d2a8', clothD: '#b9a57e', red: '#b8463a', redD: '#8a3028', blue: '#3e6a92',
  bone: '#ece2c8', boneD: '#bfb096', boneS: '#8f8270',
  clay: '#c0703e', clayL: '#dc9058', clayD: '#8e4e2c', scrub: '#8a9468', scrubD: '#626e4c', gold: '#e8c24a',
  qs: '#b08050', qsL: '#c89a62', qsD: '#8a5e38', qsW: '#d8b27a',
};
export const ROCK = { crust: '#e8c4a0', crustL: '#f6dcbc', lit: '#d4a47e', base: '#c08a66', fill: '#a8765a', grain: '#98684e', ripple: '#b07e60', pebble: '#7a5a4a', pebbleL: '#caa088', root: '#5e4232' };

/* SANDSTONE SLOPES: the same skin model as the sand (redraw/slopes.js), in rock colours, plus the one thing rock has that
   sand does not - a crack now and then, running into the fill from under the skin. Same layout: [kind] x3, under, top, fill. */
export function bakeRockSlopes() {
  const R = bakeSandSlopes(ROCK, 9600);
  /* a crack in one tile in four, each its own length and wander (the first bake put one in half the tiles, the same
     short hook each time, and a cliff of them read as a printed pattern) */
  const crack = (c, seed) => { const g = c.getContext('2d'), rnd = mulberry(seed * 7919); if (rnd() < 0.75) return c;
    let x = 2 + ((rnd() * 12) | 0), y = 7 + ((rnd() * 5) | 0); const n = 3 + ((rnd() * 7) | 0), lean = rnd() < 0.5 ? -1 : 1;
    for (let k = 0; k < n && y < 16; k++) { px(g, x, y, '#8a5e48'); if (k === 0) px(g, x + lean, y, '#c49474'); y++; if (rnd() < 0.5) x += lean; } return c; };
  let s = 1; for (const k of Object.keys(R)) { const v = R[k]; if (Array.isArray(v)) v.forEach(c => crack(c, 700 + s++)); else for (const kk of Object.keys(v)) v[kk].forEach(c => crack(c, 700 + s++)); }
  return R;
}

// ---------------- THE SKY AND THE FAR LAND ----------------
/* bleached white-gold at the horizon, blue overhead. Twelve steps interpolated between the stops, dithered only in a
   two-row seam between neighbouring steps: a coarse dither across whole bands read as a screen door. */
export function bakeDesertSky(h = 180) {
  const [c, g] = canvas(16, h), stops = [[0, DESERT.sky0], [0.45, DESERT.sky1], [0.78, DESERT.sky2], [1, DESERT.sky3]], N = 12;
  const colAt = t => { let i = 0; while (i < stops.length - 2 && t > stops[i + 1][0]) i++; const [a, ca] = stops[i], [b, cb] = stops[i + 1], k = Math.max(0, Math.min(1, (t - a) / (b - a)));
    const A = rgb(ca), B = rgb(cb); return hex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k); };
  for (let y = 0; y < h; y++) { const t = y / (h - 1), step = Math.floor(t * N), into = t * N - step, here = colAt(step / N), next = colAt(Math.min(N, step + 1) / N);
    for (let x = 0; x < 16; x++) px(g, x, y, into > 0.82 && ((x + y) & 1) ? next : here); }
  return c;
}
/* a height line that tiles over w: a sum of sines whose periods divide w */
const wave = (w, parts) => x => parts.reduce((s, [n, a, ph]) => s + a * Math.sin((x / w) * Math.PI * 2 * n + ph), 0);
export function bakeFarMesas(w = 320, h = 70) {
  const [c, g] = canvas(w, h), rnd = mulberry(4401);
  // the haze band the mesas stand in
  rect(g, 0, h - 10, w, 10, DESERT.haze);
  // mesas: flat tops, sheer sides, a talus skirt; placed at fixed fractions of w so the layer tiles
  const M = [[0.06, 0.2, 30], [0.34, 0.11, 44], [0.52, 0.16, 24], [0.78, 0.13, 36]];
  for (const [fx, fw, top] of M) { const x0 = Math.round(fx * w), x1 = Math.round((fx + fw) * w), ty = h - top;
    const skirt = 7;
    fillPoly(g, [[x0 - skirt, h - 8], [x0, ty + 4], [x0 + 2, ty], [x1 - 2, ty], [x1, ty + 3], [x1 + skirt, h - 8]], DESERT.mesa);
    fillPoly(g, [[x0 + (x1 - x0) * 0.55, ty], [x1 - 2, ty], [x1, ty + 3], [x1 + skirt, h - 8], [x0 + (x1 - x0) * 0.62, h - 8]], DESERT.mesaD);   // the side away from the sun
    rect(g, x0 + 2, ty, (x1 - x0) - 4, 1, DESERT.mesaL);                                                            // the lit cap
    for (let y = ty + 5; y < h - 10; y += 4 + ((rnd() * 3) | 0)) for (let x = x0 + 1; x < x1 - 1; x++) if (rnd() < 0.55) px(g, x, y, DESERT.mesaD);   // strata, faint
  }
  // the haze over their feet: every other pixel, so they stand IN it
  for (let y = h - 14; y < h - 10; y++) for (let x = (y & 1); x < w; x += 2) px(g, x, y, DESERT.haze);
  return c;
}
/* the middle dunes: crests, each with a lit windward face and a shaded slip face, the crest line bright. The face is chosen
   from the curve's own slope (not from rounded pixel heights, which flipped it every other column into stripes), and it
   fades from face colour to the body colour with depth. */
export function bakeMidDunes(w = 480, h = 80) {
  const [c, g] = canvas(w, h), H = wave(w, [[2, 9, 0.3], [3, 6, 1.7], [5, 3, 0.9], [8, 1.5, 2.2]]), top = x => Math.round(h * 0.45 + H(x));
  for (let x = 0; x < w; x++) { const y0 = top(x), d1 = H(x + 0.5) - H(x - 0.5), slip = d1 > 0.05, lit = d1 < -0.05;   // falling to the right = the slip face, turned from the sun
    const deep = slip ? 3 + 14 * Math.min(1, (d1 - 0.05) / 0.5) : 0;   // how far the shade runs down: it grows with the steepness, so a face has no hard edge
    for (let y = y0; y < h; y++) { const d = y - y0; const col = d < 1 ? (slip ? DESERT.duneD : DESERT.duneL) : d < deep ? DESERT.duneS : d < deep + 3 && ((x + y) & 1) ? DESERT.duneS : lit && d < 5 ? DESERT.duneL : DESERT.dune;
      px(g, x, y, col); } }
  // wind ripples on the lit faces
  const rnd = mulberry(4501); for (let i = 0; i < w / 6; i++) { const x = (rnd() * w) | 0, y = top(x) + 3 + ((rnd() * 8) | 0); if (H(x + 0.5) - H(x - 0.5) <= 0) for (let k = 0; k < 3; k++) px(g, (x + k) % w, y + (k >> 1), DESERT.duneD); }
  return c;
}

// ---------------- HAZARDS ----------------
/* QUICKSAND: darker, wetter, and MOVING: dashes of ripple drawn in toward the middle a pixel a frame, a bubble breaking.
   It must never be mistaken for sand you can stand on: the surface line is dark, not the pale crust of good sand. */
export function bakeQuicksand() {
  const out = [];
  for (let f = 0; f < 4; f++) { const [c, g] = canvas(16, 16), rnd = mulberry(4600);
    rect(g, 0, 0, 16, 16, DESERT.qs);
    for (let i = 0; i < 40; i++) px(g, (rnd() * 16) | 0, 2 + ((rnd() * 14) | 0), rnd() < 0.5 ? DESERT.qsD : DESERT.qsL);
    rect(g, 0, 0, 16, 1, DESERT.qsD); rect(g, 0, 1, 16, 1, DESERT.qsW);                         // the wet lip: dark, then a sheen
    for (const [row, len, sp] of [[4, 4, 1], [8, 3, 1], [12, 3, 2]]) for (const side of [-1, 1]) {   // the ripples, drawn inward
      const x0 = 8 + side * (7 - ((f * sp) % 7)); for (let k = 0; k < len; k++) { const x = x0 - side * k; if (x >= 0 && x < 16) px(g, x, row, DESERT.qsD); if (x >= 0 && x < 16) px(g, x, row - 1, DESERT.qsL); } }
    if (f === 2) { px(g, 5, 1, DESERT.qsL); px(g, 6, 1, DESERT.qsL); px(g, 5, 0, DESERT.qsW); }   // a bubble...
    if (f === 3) { px(g, 4, 0, DESERT.qsD); px(g, 7, 0, DESERT.qsD); px(g, 5, 2, DESERT.qsD); }   // ...breaking
    out.push(c); }
  return out;
}
/* A SANDFALL: loose sand pouring off a ledge. The stream tiles down (period 8, and it moves 4 px a frame), grains fly off
   its edges, and at its foot it heaps and sprays. It pushes you DOWN, so it reads as heavy: dense in the middle. */
export function bakeSandfall() {
  const fall = [], foot = [], ph = [3, 6, 1, 5, 0, 4, 7, 2, 6, 1, 3, 5];
  for (let f = 0; f < 4; f++) { const [c, g] = canvas(16, 16), rnd = mulberry(4700 + f);
    for (let i = 0; i < 12; i++) { const x = 2 + i; for (let y = 0; y < 16; y++) { const k = (y - f * 4 + ph[i] + 64) % 8;
      const edge = i === 0 || i === 11, col = k < 2 ? DESERT.duneL : k < 5 ? DESERT.dune : DESERT.duneD;
      if (!edge ? k !== 7 : k < 3) px(g, x, y, col); } }
    for (let i = 0; i < 5; i++) px(g, rnd() < 0.5 ? (rnd() * 2) | 0 : 14 + ((rnd() * 2) | 0), (rnd() * 16) | 0, DESERT.dune);   // grains off the edge
    fall.push(c);
    const [d, h] = canvas(24, 10), r2 = mulberry(4800 + f);
    fillPoly(h, [[0, 10], [5, 6], [9, 4], [15, 4], [19, 6], [24, 10]], DESERT.dune); rect(h, 7, 4, 10, 1, DESERT.duneL);
    for (let i = 0; i < 10; i++) { const a = r2() * Math.PI, rr = 3 + r2() * 6 + f; px(h, Math.round(12 + Math.cos(a) * rr * 1.4), Math.round(5 - Math.sin(a) * rr * 0.6), r2() < 0.5 ? DESERT.duneL : DESERT.dune); }
    foot.push(d); }
  return { fall, foot };
}

// ---------------- THE CARAVAN ----------------
/* the arc of a hoop or a wheel rim, a pixel at a time (px.js has no stroked circle) */
function ring(g, cx, cy, r, col, a0 = 0, a1 = Math.PI * 2, thick = 1) { const n = Math.ceil(r * 8); for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; for (let t = 0; t < thick; t++) px(g, Math.round(cx + Math.cos(a) * (r - t)), Math.round(cy + Math.sin(a) * (r - t)), col); } }
/* A WAGON HALF UNDER A DUNE: the bed tipped, one wheel standing out of the sand, the canopy hoops bare but for rags.
   Its SHADE is under the tilted bed (x 14..50 at the sand line): the lee the player crouches in. */
export function bakeWagonWreck(v = 0) {
  const [c, g] = canvas(64, 34), rnd = mulberry(4900 + v), D = DESERT, tilt = v ? -0.12 : 0.1;
  const bedY = x => Math.round(20 + (x - 32) * tilt);
  // the shade in its lee, first, so everything stands in it
  fillPoly(g, [[12, 30], [14, bedY(14) + 5], [50, bedY(50) + 5], [52, 30]], D.shade);
  // the bed: planks, iron straps
  for (let x = 8; x < 56; x++) { const y = bedY(x); rect(g, x, y, 1, 6, (x % 7 === 0) ? D.woodD : D.wood); px(g, x, y, D.woodL); px(g, x, y + 5, D.woodS); }
  for (const sx of [16, 32, 48]) { const y = bedY(sx); rect(g, sx, y, 2, 6, D.iron); px(g, sx, y, D.ironL); }
  // the canopy hoops, three, one fallen flat; rags on the middle one
  for (const [hx, lean] of [[18, 0], [32, v ? 3 : -2], [46, 6]]) { const y = bedY(hx); ring(g, hx + lean * 0.3, y, 11, D.woodD, Math.PI * (1.05 + lean * 0.02), Math.PI * (1.95 + lean * 0.02)); }
  { const y = bedY(32); for (let x = 25; x < 40; x++) { const drop = 3 + ((rnd() * 6) | 0) + Math.abs(x - 32) / 2; for (let k = 0; k < drop; k++) if (!(k > 2 && rnd() < 0.25)) px(g, x, y - 10 + Math.round(Math.abs(x - 32) * 0.55) + k, k === 0 ? D.cloth : (x & 1) ? D.clothD : D.cloth); } }
  // the wheel out of the sand: rim, spokes, hub
  { const wx = v ? 48 : 14, wy = bedY(wx) + 7; circle(g, wx, wy, 8, D.woodD); const gg = g;
    gg.globalCompositeOperation = 'destination-out'; circle(gg, wx, wy, 6.4, '#000'); gg.globalCompositeOperation = 'source-over';
    ring(g, wx, wy, 8, D.wood, 0, Math.PI * 2, 2); for (let s = 0; s < 6; s++) { const a = s * Math.PI / 3 + 0.3; line(g, wx, wy, wx + Math.cos(a) * 6.5, wy + Math.sin(a) * 6.5, D.woodD); }
    circle(g, wx, wy, 1.6, D.iron); px(g, wx - 1, wy - 1, D.ironL); }
  // the dune over its foot: the crust, then sand, drifted higher on the windward (left) side
  for (let x = 0; x < 64; x++) { const y0 = Math.round(29 - 5 * Math.exp(-((x - 10) ** 2) / 90) - 2 * Math.exp(-((x - 44) ** 2) / 60) + (x < 4 || x > 60 ? 2 : 0));
    for (let y = y0; y < 34; y++) px(g, x, y, y === y0 ? D.duneL : y < y0 + 3 ? D.dune : D.duneD); }
  return outline(c, OUT);
}
/* A TRADER'S AWNING: red and cream stripes on two poles, sagging, a scalloped hem. SHADE under it, x 3..49. */
export function bakeAwning(v = 0) {
  const [c, g] = canvas(52, 30), D = DESERT;
  fillPoly(g, [[3, 30], [6, 13], [46, 13], [49, 30]], D.shade);                                        // the shade it casts, straight down in the noon sun
  rect(g, 4, 6, 2, 24, D.woodD); rect(g, 46, 6, 2, 24, D.woodD); px(g, 4, 6, D.woodL); px(g, 46, 6, D.woodL);   // poles
  for (let x = 3; x < 49; x++) { const sag = Math.round(4 * Math.sin((x - 3) / 46 * Math.PI)), y0 = 5 + sag, col = ((x - 3) >> 2) & 1 ? (v ? D.blue : D.red) : D.cloth;
    for (let y = y0; y < y0 + 7; y++) px(g, x, y, y === y0 ? tint(col, 0.2) : col);
    const hem = (x % 4 === 1 || x % 4 === 2) ? 1 : 0; px(g, x, y0 + 7, col); if (hem) px(g, x, y0 + 8, col);   // scallops
    px(g, x, y0 + 6, tint(col, -0.25)); }
  for (const x of [3, 48]) line(g, x, 7, x + (x < 10 ? -3 : 3), 29, D.clothD);                          // guy ropes
  return outline(c, OUT);
}
/* AN OX, WHAT IS LEFT: skull with horns, a ribcage half in the sand, a horn on its own */
export function bakeBones() {
  const D = DESERT;
  const [s, a] = canvas(16, 11); ellipse(a, 8, 5, 4, 3.2, D.bone); rect(a, 6, 7, 5, 3, D.bone); px(a, 6, 4, D.boneS); px(a, 10, 4, D.boneS); px(a, 7, 9, D.boneD); px(a, 9, 9, D.boneD);
  line(a, 4, 3, 1, 1, D.bone); px(a, 0, 0, D.boneD); line(a, 12, 3, 15, 1, D.bone); px(a, 15, 0, D.boneD); rect(a, 5, 2, 7, 1, '#fff6e2');
  const [r, b] = canvas(30, 14); for (let i = 0; i < 6; i++) { const x = 4 + i * 4; ring(b, x, 13, 8 - Math.abs(i - 2.5), D.bone, Math.PI * 1.1, Math.PI * 1.9); } rect(b, 2, 11, 26, 2, D.boneD); rect(b, 0, 12, 30, 2, D.dune); rect(b, 0, 12, 30, 1, D.duneL);
  const [h, c3] = canvas(10, 6); line(c3, 0, 5, 5, 3, D.bone); line(c3, 5, 3, 9, 0, D.boneD); px(c3, 1, 4, D.boneS);
  return { skull: outline(s, OUT), ribs: outline(r, OUT), horn: outline(h, OUT) };
}
/* WHAT THE CARAVAN CARRIED */
export function bakeCargo() {
  const D = DESERT;
  const [am, a] = canvas(10, 16); ellipse(a, 5, 9, 4, 5, D.clay); rect(a, 3, 1, 4, 4, D.clay); rect(a, 2, 1, 6, 1, D.clayL); px(a, 1, 3, D.clayD); px(a, 8, 3, D.clayD);
  for (let y = 5; y < 14; y++) px(a, 2, y, D.clayL); rect(a, 2, 8, 6, 1, D.clayD); rect(a, 4, 14, 2, 2, D.clayD);
  const [ad, b] = canvas(16, 10); ellipse(b, 7, 5, 5, 4, D.clay); rect(b, 11, 3, 4, 4, D.clay); rect(b, 14, 2, 1, 6, D.clayL); for (let x = 3; x < 11; x++) px(b, x, 2, D.clayL); rect(b, 5, 3, 1, 5, D.clayD);
  for (let x = 12; x < 16; x++) { px(b, x, 8, D.dune); px(b, x + 1, 9, D.duneD); }   // what poured out of it
  const [rg, c] = canvas(20, 8); rect(c, 1, 1, 18, 6, D.red); for (let x = 2; x < 18; x += 3) { rect(c, x, 1, 1, 6, D.gold); } rect(c, 1, 1, 18, 1, tint(D.red, 0.25)); rect(c, 1, 6, 18, 1, D.redD);
  ellipse(c, 18, 4, 1.6, 3, D.redD); px(c, 18, 4, D.gold);
  const [sk, d] = canvas(12, 11); ellipse(d, 6, 6.5, 5, 4.5, D.cloth); rect(d, 5, 1, 2, 3, D.clothD); rect(d, 4, 3, 4, 1, D.woodD); for (let y = 4; y < 10; y++) px(d, 9, y, D.clothD);
  const [ch, e] = canvas(16, 12); rect(e, 1, 4, 14, 7, D.wood); rect(e, 1, 2, 14, 3, D.woodL); rect(e, 1, 4, 14, 1, D.woodS); rect(e, 7, 4, 2, 3, D.gold); for (const x of [3, 12]) rect(e, x, 2, 1, 9, D.iron);
  for (let i = 0; i < 5; i++) px(e, 2 + i * 3, 1, D.gold);   // lid sprung, coin showing
  return { amphora: outline(am, OUT), amphoraDown: outline(ad, OUT), rug: outline(rg, OUT), sack: outline(sk, OUT), chest: outline(ch, OUT) };
}
export function bakeScrub(v = 0) {
  const [c, g] = canvas(16, 10), rnd = mulberry(5100 + v), D = DESERT;
  for (let i = 0; i < 14; i++) { const x0 = 8 + (rnd() - 0.5) * 4, a = -Math.PI / 2 + (rnd() - 0.5) * 2.4, len = 4 + rnd() * 5; line(g, x0, 9, x0 + Math.cos(a) * len, 9 + Math.sin(a) * len, rnd() < 0.5 ? D.scrub : D.scrubD); }
  for (let i = 0; i < 6; i++) px(g, 3 + ((rnd() * 10) | 0), 2 + ((rnd() * 5) | 0), '#b4a86a');   // dry seed heads
  return outline(c, OUT);
}
export function bakeDeadTree() {
  const [c, g] = canvas(28, 40), D = DESERT, rnd = mulberry(5200);
  const branch = (x, y, a, len, w) => { if (len < 2) return; const x1 = x + Math.cos(a) * len, y1 = y + Math.sin(a) * len; for (let t = 0; t < w; t++) line(g, x + t, y, x1 + t, y1, t ? D.boneD : D.bone);
    branch(x1, y1, a - 0.5 - rnd() * 0.3, len * 0.62, Math.max(1, w - 1)); if (rnd() < 0.8) branch(x1, y1, a + 0.45 + rnd() * 0.3, len * 0.55, Math.max(1, w - 1)); };
  branch(13, 39, -Math.PI / 2 - 0.08, 15, 3);
  return outline(c, OUT);
}
/* THE CARAVAN'S STANDARD: a pole in the sand, a torn pennant, two bells. It marks the road: phase 2 can use it as the
   level's checkpoint dressing, or as the landmark at each act's start */
export function bakeStandard() {
  const [c, g] = canvas(16, 42), D = DESERT;
  rect(g, 3, 2, 2, 40, D.woodD); px(g, 3, 2, D.woodL); circle(g, 4, 1.5, 1.6, D.gold);
  for (let y = 4; y < 14; y++) { const len = Math.max(0, 11 - (y - 4) * 0.5 - (y > 10 ? (y - 10) * 2 : 0)); for (let x = 5; x < 5 + len; x++) if (!((x + y) % 5 === 0 && x > 9)) px(g, x, y, y < 6 ? tint(D.red, 0.2) : y === 13 ? D.redD : D.red); }
  for (const [bx, by] of [[1, 16], [6, 18]]) { rect(g, bx, by, 3, 3, D.gold); px(g, bx + 1, by + 3, D.iron); }
  rect(g, 0, 40, 9, 2, D.dune);
  return outline(c, OUT);
}
/* THE SHADE EACH PROP CASTS, as data for the sunstroke rule (src/sunstroke.js): x0..x1 in the prop's canvas pixels, measured
   from its left edge; the shade reaches from the ground up to `h` px. The art paints exactly this span in DESERT.shade, so what
   the player sees as shade and what the game counts as shade are the same pixels. */
export const SHADE_OF = { wagon: { x0: 14, x1: 50, h: 14 }, awning: { x0: 3, x1: 49, h: 24 } };
