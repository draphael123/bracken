// src/redraw/wasp_art.js - THE REAL WASP AND THE REAL HORNET (claude/waspart; Daniel 11-03: they read as BEES -> redrawn as wasps). ART ONLY: same frame indices, anchors, hit boxes as the sets
// they replace (foes_v2 bakeWaspV2: 0-2 buzz, 3 hurt; hornets_nest_art hornet: 0-2 buzz, 3 hurt).
//   Wasp anatomy, hand-set in pixels: HEAD / THORAX / ABDOMEN as three separate masses joined by a ONE-PIXEL PINCHED WAIST (the petiole); a POINTED, tapering, glossy abdomen banded hard
//   yellow / black with a pale STINGER; two narrow pairs of wings (a three-beat flicker, ghosted); antennae; mandibles; long thin legs DANGLING under the thorax.
//   WASP   (16 x 11): slim, bright yellow and black, black eye, yellow face.
//   HORNET (22 x 14): bigger and heavier: red-brown head and thorax, amber / black abdomen, a big pair of pale jaws, a dark eye.
//   Two layers per frame: the BODY (inked) then the THIN parts (feelers, legs, wings) on top, un-inked, so they stay hairlines.
// bakeWasp() / bakeHornet(ax, ay, w, h) -> { R, L, white: { R, L }, ax, ay, w, h }
import { canvas as mkCanvas, outline as ink, flipX as flip, whiten as whit } from '../px.js';

export const INK = '#1a0c06', WING = ['#8ea6bf', '#d6e4f2', '#ffffff'], LEG = '#241810';
export const put = (g, c, x, y) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
export const line = (g, c, x0, y0, x1, y1) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) put(g, c, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
/* a column run: x, from y0 to y1, shaded top (lit) -> belly (dark) by the palette [lit, mid, dark] */
export const col = (g, x, y0, y1, pal, dy = 0) => { for (let y = y0; y <= y1; y++) put(g, y === y0 && y1 - y0 > 1 ? pal[0] : y === y1 ? pal[2] : pal[1], x, y + dy); };
/* a narrow wing: a tapered blade from (x0, y0) to (x1, y1), pale, a darker leading edge, a bright tip */
export function blade(g, x0, y0, x1, y1, wd, alpha = 1) {
  g.globalAlpha = alpha; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1), nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny) || 1;
  for (let i = 0; i <= n; i++) { const t = i / n, w = wd * (1 - t * 0.65), cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t;
    for (let k = 0; k <= Math.round(w); k++) { const o = k - w / 2; put(g, k === 0 ? WING[0] : (t > 0.55 ? WING[2] : WING[1]), cx + nx / nl * o, cy + ny / nl * o); } }
  g.globalAlpha = 1;
}
/* the flicker: fore / hind wing tips relative to the shoulder, per beat; 3 = the hurt droop */
export const BEATS = [{ f: [-7, -5], h: [-4, -5], ghost: 0 }, { f: [-9, -1], h: [-7, 0], ghost: 1 }, { f: [-3, -7], h: [-6, -6], ghost: 0 }, { f: [-7, 2], h: [-5, 3], ghost: 0 }];
/* one frame: draw(g, layer) is called for 'body' then (after the ink) 'thin'; (ox, oy) is where the design's (0, 0) sits on the canvas */
export function bake(w, h, ox, oy, fns) { return fns.map(fn => { const [c, g] = mkCanvas(w, h); g.translate(ox, oy); fn(g, 'body'); g.setTransform(1, 0, 0, 1, 0, 0); ink(c, INK); g.translate(ox, oy); fn(g, 'thin'); g.setTransform(1, 0, 0, 1, 0, 0); return c; }); }
export const pack = (R, ax, ay, bw, bh) => ({ R, L: R.map(flip), white: { R: R.map(c => whit(c)), L: R.map(c => flip(whit(c))) }, ax, ay, w: bw, h: bh });

/* ---------------- THE WASP: 19 x 14 canvas, design offset (1, 2). Facing right: head x 13-16, neck 12, thorax 9-11, WAIST 7-8, abdomen 2-6, stinger 0-1 ---------------- */
const WP = { Yl: '#fff0a0', Y: '#f6cf2a', Yd: '#c28f10', K: '#1e1a14', Kl: '#4c4838', Kd: '#0e0c08', S: '#f0e8d0', M: '#e0d09a' };
function waspFrame(beat, hurt) { return (g, layer) => {
  const b = BEATS[hurt ? 3 : beat], dy = hurt ? 1 : 0;
  if (layer === 'body') {
    /* the abdomen: a slim teardrop - a thin stalk, swelling, then drawn to a point; bands Y Y K Y K; glossy; it hangs below the thorax line */
    col(g, 6, 5, 7, [WP.Yl, WP.Y, WP.Yd], dy); col(g, 5, 4, 8, [WP.Yl, WP.Y, WP.Yd], dy); col(g, 4, 4, 8, [WP.Kl, WP.K, WP.Kd], dy); col(g, 3, 5, 8, [WP.Yl, WP.Y, WP.Yd], dy);
    col(g, 2, 6, 8, [WP.K, WP.K, WP.Kd], dy); put(g, WP.K, 1, 8 + dy); put(g, WP.S, 1, 9 + dy); put(g, WP.S, 0, 10 + dy);                       /* the point, then the STINGER */
    put(g, WP.K, 7, 6 + dy); put(g, WP.K, 8, 6 + dy);                                                                                         /* the WAIST: a one-pixel stalk, two long */
    /* the thorax: a black barrel with a yellow collar and scutellum */
    for (let y = 4; y <= 7; y++) for (let x = 9; x <= 11; x++) { if (x === 9 && y === 7) continue; put(g, y === 4 && x === 10 ? WP.Kl : WP.K, x, y + dy); }
    put(g, WP.Y, 9, 4 + dy); put(g, WP.Y, 11, 4 + dy); put(g, WP.Y, 10, 7 + dy); put(g, WP.Yd, 11, 7 + dy);
    put(g, WP.K, 12, 6 + dy);                                                                                                                  /* the neck */
    /* the head: a yellow face, a big black eye, jaws */
    for (const [x, y] of [[13, 5], [13, 6], [13, 7], [14, 6], [15, 6], [16, 6], [14, 7], [15, 7], [16, 7]]) put(g, WP.Y, x, y + dy);
    for (const [x, y] of [[13, 4], [14, 4], [15, 4], [14, 5], [15, 5], [16, 5]]) put(g, WP.K, x, y + dy); put(g, hurt ? WP.K : '#ffffff', 15, 4 + dy);
    if (hurt) { put(g, WP.Yd, 15, 5 + dy); put(g, WP.K, 15, 6 + dy); }
    put(g, WP.M, 16, 8 + dy); put(g, WP.K, 15, 8 + dy);
  } else {
    line(g, '#1e1a14', 14, 3 + dy, 13, 1 + dy); line(g, '#1e1a14', 15, 3 + dy, 17, 1 + dy); put(g, WP.Y, 13, 0 + dy); put(g, WP.Y, 17, 0 + dy);   /* the feelers */
    const lg = hurt ? [[9, 8, 7, 11], [10, 8, 11, 11], [11, 8, 13, 11]] : beat === 1 ? [[9, 8, 8, 11], [10, 8, 10, 12], [11, 8, 12, 11]] : beat === 2 ? [[9, 8, 7, 11], [10, 8, 10, 11], [11, 8, 13, 10]] : [[9, 8, 8, 11], [10, 8, 11, 12], [11, 8, 12, 11]];
    for (const [x0, y0, x1, y1] of lg) line(g, LEG, x0, y0 + dy, x1, y1 + dy);                                                                  /* the legs DANGLE */
    blade(g, 10, 4 + dy, 10 + b.h[0], 4 + b.h[1] + dy, 1.4, b.ghost ? 0.6 : 0.85); blade(g, 10, 3.6 + dy, 10 + b.f[0], 3.6 + b.f[1] + dy, 1.8, b.ghost ? 0.75 : 1);   /* two narrow pairs */
  } }; }
export function bakeWasp() { return pack(bake(19, 14, 1, 2, [waspFrame(0), waspFrame(1), waspFrame(2), waspFrame(0, true)]), 9, 10, 10, 7); }

/* ---------------- THE HORNET: 26 x 18 canvas, design offset (1, 3). Facing right: head x 16-21, neck 15, thorax 11-14, WAIST 9-10, abdomen 2-8, stinger 0-1 ---------------- */
const HP = { A: '#f6a824', Al: '#ffd868', Ad: '#a8600c', K: '#1c0e08', Kl: '#44281a', Kd: '#0c0604', C: '#a8431c', Cl: '#d4733a', Cd: '#5e1e0c', S: '#f0e8d0', J: '#e8dcb4', Jd: '#8a7a58', E: '#2a0a06' };
function hornetFrame(beat, hurt) { return (g, layer) => {
  const b = BEATS[hurt ? 3 : beat], dy = hurt ? 1 : 0;
  if (layer === 'body') {
    /* the abdomen: heavy, a short stalk then swelling, tapering to a point; a red-brown first plate, then amber / black bands */
    col(g, 8, 6, 8, [HP.Cl, HP.C, HP.Cd], dy); col(g, 7, 5, 11, [HP.Al, HP.A, HP.Ad], dy); col(g, 6, 5, 11, [HP.Al, HP.A, HP.Ad], dy); col(g, 5, 5, 11, [HP.Kl, HP.K, HP.Kd], dy);
    col(g, 4, 6, 11, [HP.Al, HP.A, HP.Ad], dy); col(g, 3, 7, 10, [HP.K, HP.K, HP.Kd], dy); col(g, 2, 8, 10, [HP.K, HP.K, HP.Kd], dy);
    put(g, HP.K, 1, 10 + dy); put(g, HP.S, 1, 11 + dy); put(g, HP.S, 0, 12 + dy);                                           /* the STINGER */
    put(g, HP.Kd, 9, 7 + dy); put(g, HP.Kd, 10, 7 + dy);                                                                     /* the pinched waist */
    /* the thorax: a red-brown barrel, a gloss on top, an amber scutellum */
    for (let y = 4; y <= 9; y++) for (let x = 11; x <= 14; x++) { if ((x === 11 || x === 14) && (y === 4 || y === 9)) continue; put(g, y === 4 ? HP.Cl : y >= 8 ? HP.Cd : HP.C, x, y + dy); }
    put(g, HP.Cl, 12, 5 + dy); put(g, HP.Al, 13, 4 + dy); put(g, HP.A, 12, 4 + dy); put(g, HP.A, 12, 8 + dy); put(g, HP.Ad, 13, 8 + dy);
    put(g, HP.Kd, 15, 7 + dy);                                                                                              /* the neck */
    /* the head: red-brown, a big dark eye with a glint, an amber face patch */
    for (let y = 5; y <= 10; y++) for (let x = 16; x <= 21; x++) { if ((x === 16 || x === 21) && (y === 5 || y === 10)) continue; put(g, y === 5 ? HP.Cl : y >= 9 ? HP.Cd : HP.C, x, y + dy); }
    for (const [x, y] of [[18, 6], [19, 6], [20, 6], [18, 7], [19, 7], [20, 7], [19, 8]]) put(g, HP.E, x, y + dy); put(g, hurt ? HP.E : '#ff7a50', 19, 6 + dy); put(g, hurt ? HP.E : '#ffe0c0', 20, 6 + dy);
    if (hurt) { put(g, HP.Cd, 18, 6 + dy); put(g, HP.Cd, 20, 7 + dy); }
    put(g, HP.A, 17, 7 + dy); put(g, HP.A, 17, 8 + dy);
    /* the JAWS: two heavy pale mandibles, crossing under the face */
    put(g, HP.J, 21, 10 + dy); put(g, HP.J, 22, 11 + dy); put(g, HP.Jd, 22, 12 + dy); put(g, HP.J, 20, 11 + dy); put(g, HP.J, 21, 12 + dy); put(g, HP.Jd, 20, 13 + dy);
  } else {
    line(g, '#1c0e08', 19, 4 + dy, 18, 1 + dy); line(g, '#1c0e08', 20, 4 + dy, 22, 1 + dy); put(g, HP.A, 18, 0 + dy); put(g, HP.A, 22, 0 + dy);   /* the feelers */
    const lg = hurt ? [[12, 10, 10, 14], [13, 10, 14, 14], [15, 10, 17, 14]] : beat === 1 ? [[12, 10, 11, 14], [13, 10, 13, 15], [14, 10, 16, 14]] : beat === 2 ? [[12, 10, 10, 14], [13, 10, 13, 14], [14, 10, 17, 13]] : [[12, 10, 11, 14], [13, 10, 14, 15], [14, 10, 16, 14]];
    for (const [x0, y0, x1, y1] of lg) line(g, LEG, x0, y0 + dy, x1, y1 + dy);
    const k = 1.35; blade(g, 13, 5 + dy, 13 + b.h[0] * k, 5 + b.h[1] * k + dy, 1.8, b.ghost ? 0.6 : 0.85); blade(g, 13, 4.6 + dy, 13 + b.f[0] * k, 4.6 + b.f[1] * k + dy, 2.2, b.ghost ? 0.75 : 1);
  } }; }
export function bakeHornet(ax, ay, w, h) { return pack(bake(26, 18, 1, 3, [hornetFrame(0), hornetFrame(1), hornetFrame(2), hornetFrame(0, true)]), ax, ay, w, h); }
