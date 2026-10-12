// src/redraw/sealed_pyramid_art.js - THE SEALED PYRAMID's cast, GREYBOX (claude/sealedpyramid): readable placeholders until the SONNET art lane draws the kit.
// main.js bakes them once: const K = SPA.bakeSealedPyramidSets(SPR); for (const k in K) SPR[k] = K[k]. Each set keeps the CONTRACT of the machine under it (every
// frame faces RIGHT, L is the flip; ax = the body's centre column; ay = the row under the lowest pixel; w/h = the hit box), so every tell, hurt frame and corpse
// is where its AI expects it (tools/corpses.mjs):
//   mummy        THE MUMMY (src/mummy.js, 8 frames, its own drawing: 0,1 walk | 2 LASH TELL | 3 LASH | 4 GRAB TELL | 5 GRAB | 6 hurt | 7 BURNING) - a tall wrapped
//                corpse, linen trailing, a gilded collar, ember eyes; every move its own windup and release (B16)
//   dartblower   THE TOMB DART-BLOWER (the archer's frames, re-coloured: a linen-wrapped tomb priest with a blowpipe)
//   jackal       THE TOMB JACKAL (the war hound's frames, re-coloured: black hide, gold collar)
//   scarab       THE SCARABS (the crack swarm's frames, re-coloured: green-black shell, a gold sheen)
//   scarabmother her bestiary card (two frames of a brood-queen); she draws herself in her fight (src/scarab-mother-hands.js)
import { canvas, px, rect, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return c; });

// ================= THE MUMMY =================
const MU = { lin: '#d8ccaa', linL: '#f2ead0', linD: '#9c8e6c', linDD: '#6a5e46', gold: '#d8aa40', goldL: '#f6dc80', eye: '#ff8a3a', eyeL: '#ffd890', dark: '#1a120c', fire: '#ff9a3a', fireL: '#ffe080', fireD: '#c84a1a' };
export function bakeMummy() {
  const W = 34, H = 30, cx = 15, gy = 29;
  const wraps = (g, x, y, w, h) => { rect(g, x, y, w, h, MU.lin); for (let k = 1; k < h; k += 3) line(g, x, y + k, x + w - 1, y + k + 1, MU.linD); rect(g, x, y, 1, h, MU.linL); };
  const head = (g, x, y, burn) => { ellipse(g, x, y, 3.2, 3.6, MU.lin); line(g, x - 3, y - 1, x + 3, y + 1, MU.linD); line(g, x - 3, y + 2, x + 3, y, MU.linD); rect(g, x, y - 1, 3, 1, MU.dark); px(g, x + 1, y - 1, burn ? MU.fireL : MU.eye); px(g, x + 2, y - 1, MU.eyeL); };
  const legs = (g, x, y, ph) => { const a = [0, 2, -2, 0][ph], b = -a; wraps(g, x - 3 + a, y, 3, 8); wraps(g, x + 1 + b, y, 3, 8); rect(g, x - 4 + a, y + 7, 4, 1, MU.linDD); rect(g, x + b, y + 7, 4, 1, MU.linDD); };
  const torso = (g, x, y, lean) => { wraps(g, x - 4 + lean, y, 8, 10); rect(g, x - 4 + lean, y, 8, 2, MU.gold); px(g, x - 2 + lean, y, MU.goldL); px(g, x + 1 + lean, y, MU.goldL); };
  const arm = (g, x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, MU.lin, 2); px(g, x1, y1, MU.linD); };
  const trail = (g, x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, MU.linL); px(g, x1, y1 + 1, MU.linD); };
  const flames = (g, x, y) => { for (let k = 0; k < 7; k++) { const fx = x - 5 + k * 2, fh = 4 + (k * 5) % 6; line(g, fx, y, fx + (k % 2 ? 1 : -1), y - fh, k % 3 ? MU.fire : MU.fireL); px(g, fx, y - fh - 1, MU.fireD); } };
  const F = frames(W, H, 8, (g, f) => {
    const hip = gy - 8;
    if (f === 7) { legs(g, cx, hip, 0); torso(g, cx, hip - 10, 0); head(g, cx + 1, hip - 14, true); arm(g, cx - 3, hip - 8, cx - 9, hip - 18); arm(g, cx + 4, hip - 8, cx + 10, hip - 17); flames(g, cx, hip - 9); flames(g, cx + 1, hip); return; }   /* BURNING: arms flung up, flailing */
    const ph = f === 1 ? 1 : f === 0 ? 2 : 0, lean = f === 3 ? 2 : f === 4 ? -1 : f === 5 ? 4 : f === 6 ? -3 : 0;
    legs(g, cx, hip, f === 5 ? 3 : ph); torso(g, cx, hip - 10, lean); head(g, cx + 1 + lean, hip - 14, false);
    const sh = [cx + 3 + lean, hip - 8];
    if (f === 2) { arm(g, ...sh, cx - 6, hip - 12); trail(g, cx - 6, hip - 12, cx - 11, hip - 9); trail(g, cx - 6, hip - 12, cx - 9, hip - 15); }     /* LASH TELL: arm drawn back, the bandage coiled behind */
    else if (f === 3) { arm(g, ...sh, cx + 11, hip - 9); for (let k = 0; k < 4; k++) trail(g, cx + 11 + k * 4, hip - 9 + (k % 2), cx + 15 + k * 4, hip - 8 - (k % 2)); }   /* LASH: the bandage flies out */
    else if (f === 4) { arm(g, cx - 2, hip - 8, cx - 8, hip - 19); arm(g, cx + 4, hip - 8, cx + 9, hip - 20); }                                           /* GRAB TELL: both arms up and wide */
    else if (f === 5) { arm(g, ...sh, cx + 14, hip - 10); arm(g, cx + 2 + lean, hip - 6, cx + 14, hip - 6); }                                           /* GRAB: lurched forward, arms closed */
    else if (f === 6) { arm(g, ...sh, cx - 4, hip - 2); }                                                                                              /* hurt: knocked back */
    else { arm(g, ...sh, cx + 9, hip - 7 + (f ? 1 : 0)); trail(g, cx + 9, hip - 7, cx + 12, hip - 3); }                                               /* walk: arms out before it, the old way */
    trail(g, cx - 4 + lean, hip - 3, cx - 8 + lean, hip + 2);
  });
  return pack(F, cx, H, 12, 20);
}

/* ================= THE RESKINS: the base machine's own sheets, re-coloured by brightness onto the tomb's ramps (outline and white kept) ================= */
const RAMPS = {
  dartblower: ['#2a1e14', '#6a5a40', '#b8a678', '#e8dcb4'],   /* linen, dust, a blowpipe of dark reed */
  jackal: ['#121016', '#2e2a36', '#8a6a2a', '#e0b850'],       /* black hide, a gold collar's gleam */
  scarab: ['#0e1a14', '#1e4a3a', '#3a8a5a', '#a8e070'],       /* green-black shell, a gold-green sheen */
};
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
function recolor(src, ramp) {
  const [c, g] = canvas(src.width, src.height); g.drawImage(src, 0, 0); const img = g.getImageData(0, 0, src.width, src.height), d = img.data, RP = ramp.map(hex);
  for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; const r = d[i], gg = d[i + 1], b = d[i + 2], l = (0.3 * r + 0.59 * gg + 0.11 * b) / 255, mx = Math.max(r, gg, b), mn = Math.min(r, gg, b);
    if (l < 0.13 || (l > 0.92 && mx - mn < 24)) continue;   /* (the outline and pure white stay) */
    const q = RP[Math.min(3, Math.floor(l * 4))]; d[i] = q[0]; d[i + 1] = q[1]; d[i + 2] = q[2]; }
  g.putImageData(img, 0, 0); return c; }
const isCanvas = v => v && typeof v === 'object' && typeof v.getContext === 'function';
function deepRecolor(v, ramp, white) {
  if (isCanvas(v)) return white ? v : recolor(v, ramp);
  if (Array.isArray(v)) return v.map(x => deepRecolor(x, ramp, white));
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) o[k] = deepRecolor(x, ramp, white || k === 'white'); return o; }
  return v; }
/* THE SCARAB MOTHER's bestiary card: two frames of her (greybox) */
export function bakeScarabMotherCard() {
  const F = frames(56, 32, 2, (g, f) => { ellipse(g, 22, 18, 16, 9, '#1e3a2c'); ellipse(g, 20, 14, 10, 3, '#3e7a52'); ellipse(g, 40, 18, 7, 6, '#1e3a2c'); px(g, 42, 16, '#ff5a3a');
    rect(g, 45, 17 - f, 5, 1, '#2a2016'); rect(g, 45, 20 + f, 5, 1, '#2a2016'); for (let k = 0; k < 3; k++) { line(g, 14 + k * 9, 24, 10 + k * 9 + f, 31, '#14201a'); line(g, 16 + k * 9, 24, 20 + k * 9 - f, 31, '#14201a'); } rect(g, 21, 10, 1, 16, '#d8aa40'); });
  return pack(F, 28, 32, 40, 24);
}
export function bakeSealedPyramidSets(SPR) {
  const out = { mummy: bakeMummy(), scarabmother: bakeScarabMotherCard() };
  if (SPR.archer) out.dartblower = deepRecolor(SPR.archer, RAMPS.dartblower, false);
  if (SPR.hound) out.jackal = deepRecolor(SPR.hound, RAMPS.jackal, false);
  if (SPR.skitter) out.scarab = deepRecolor(SPR.skitter, RAMPS.scarab, false);
  return out;
}
