// src/redraw/redgorge_art.js - THE RED GORGE's PLACEHOLDER art (claude/redgorge, the greybox; the Sonnet art lane replaces every piece of it). px.js
// primitives only. The contract is welltown_art.js's: every frame faces RIGHT (L is the flip), one canvas size per set, ax = the body's centre
// column, ay = the row under the feet, w/h = the hit box.
//   bakeRaptor(v)      THE CLIFF RAPTOR - the vulture's frames (src/redraw/desert_foes.js) dyed the gorge's rust and cream (its frames are the vulture's)
//   bakeGorgeCrab()    THE GREAT RED CRAB - a crab as wide as a cart, red shell, two great claws (CRAB_F names the frames)
//   bakeFeatherIcon()  a raptor's feather (the level's four quest pickups)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten, rgb, hex } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };

/* ---------- THE CLIFF RAPTOR: the vulture warmed to rust (every dark feather), its pale ruff cream ---------- */
function rust(c) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const l = (p[i] + p[i + 1] + p[i + 2]) / 3;
    if (l < 40) continue;   /* the outline stays */
    const [r, gg, b] = l > 170 ? rgb('#f0dcb8') : rgb(l > 100 ? '#c8643a' : '#7a2e1c'); const k = l / 255; p[i] = r * (0.6 + 0.4 * k); p[i + 1] = gg * (0.6 + 0.4 * k); p[i + 2] = b * (0.6 + 0.4 * k); }
  g.putImageData(img, 0, 0); return d; }
export function bakeRaptor(v) { const F = v.R.map(rust); return { ...pack(F, v.ax, v.ay, v.w, v.h) }; }

/* ---------- THE GREAT RED CRAB ---------- */
export const CRAB_F = { stand: 0, walk: [1, 2], pinchTell: 3, pinch: 4, crushTell: 5, crush: 6, boulderTell: 7, boulder: 8, scuttleTell: 9, scuttle: 10, dug: 11, open: 12, hurt: 13, dead: 14 };
const CR = { shell: '#b8382c', shellL: '#e0603c', shellD: '#6e1a14', belly: '#e8c8a0', bellyD: '#b89a74', leg: '#8a2a1e', claw: '#c84a30', clawL: '#f08a5a', tip: '#2a1410', eye: '#ffe08a', rock: '#8a6a52', rockL: '#b8967a', wet: '#7ab8e8' };
export function bakeGorgeCrab() {
  const W = 96, H = 52, cx = 44, G = 50;
  const F = Array.from({ length: 15 }, (_, f) => { const [c, g] = canvas(W, H);
    const on = f === CRAB_F.open || f === CRAB_F.dead;
    if (on) {   /* ON HIS BACK: the belly up, the legs kicking at the sky, water running off him */
      ellipse(g, cx, G - 9, 24, 9, CR.shellD); ellipse(g, cx, G - 13, 21, 8, CR.belly); for (let i = -3; i <= 3; i++) line(g, cx + i * 6, G - 20, cx + i * 7, G - 15, CR.bellyD);
      for (let i = 0; i < 4; i++) { const k = f === CRAB_F.dead ? 0 : (i % 2 ? 2 : -2); line(g, cx - 16 + i * 4, G - 18, cx - 22 + i * 3, G - 30 + k, CR.leg, 2); line(g, cx + 4 + i * 4, G - 18, cx + 10 + i * 3, G - 30 - k, CR.leg, 2); }
      ellipse(g, cx - 28, G - 8, 9, 5, CR.claw); ellipse(g, cx + 28, G - 8, 9, 5, CR.claw);
      if (f === CRAB_F.open) for (let i = 0; i < 7; i++) px(g, cx - 18 + i * 6, G - 23 - (i % 2) * 2, CR.wet);
      outline(c, OUT); return c; }
    const walk = f === 1 || f === 2, dug = f === CRAB_F.dug, low = f === CRAB_F.scuttle || f === CRAB_F.scuttleTell || dug, bob = walk ? (f === 1 ? -1 : 0) : 0;
    const top = (low ? 24 : 18) + bob, body = G - 12;
    /* the legs: four a side, splayed (dug in: buried to the knee) */
    for (let i = 0; i < 4; i++) { const sx = cx - 14 + i * 5, st = walk ? ((i + f) % 2 ? 2 : -2) : 0, foot = dug ? G - 2 : G;
      line(g, sx, body, sx - 8 + st, body + 6, CR.leg, 2); line(g, sx - 8 + st, body + 6, sx - 10 + st, foot, CR.leg, 2);
      line(g, sx + 8, body, sx + 16 - st, body + 6, CR.leg, 2); line(g, sx + 16 - st, body + 6, sx + 18 - st, foot, CR.leg, 2); }
    if (dug) { rect(g, cx - 28, G - 3, 56, 3, CR.rock); for (let i = 0; i < 8; i++) px(g, cx - 26 + i * 7, G - 4, CR.rockL); }
    /* the shell */
    ellipse(g, cx, top + 10, 23, 11, CR.shellD); ellipse(g, cx, top + 8, 22, 9.5, CR.shell); ellipse(g, cx - 4, top + 5, 13, 4, CR.shellL);
    for (let i = -2; i <= 2; i++) px(g, cx + i * 7, top + 12, CR.shellD);
    /* the eyes on their stalks */
    line(g, cx + 6, top + 2, cx + 7, top - 5, CR.shellD); line(g, cx + 12, top + 3, cx + 14, top - 4, CR.shellD); circle(g, cx + 7, top - 6, 1.6, CR.eye); circle(g, cx + 14, top - 5, 1.6, CR.eye);
    /* THE CLAWS: the big one forward (to the right), the small one under */
    const claw = (x, y, open, big) => { const r = big ? 8 : 5; ellipse(g, x, y, r + 2, r, CR.claw); ellipse(g, x - 1, y - 2, r, r * 0.5, CR.clawL);
      fillPoly(g, [[x + r, y - 2], [x + r + (big ? 10 : 6), y - 2 - open], [x + r + 2, y + 1]], CR.claw); fillPoly(g, [[x + r, y + 2], [x + r + (big ? 9 : 5), y + 3 + open], [x + r + 1, y + 4]], CR.claw);
      px(g, x + r + (big ? 10 : 6), y - 2 - open, CR.tip); };
    const sh = [cx + 18, top + 10];
    if (f === CRAB_F.pinchTell) { line(g, ...sh, cx + 22, top - 4, CR.leg, 3); claw(cx + 24, top - 8, 7, true); }
    else if (f === CRAB_F.pinch) { line(g, ...sh, cx + 30, top + 8, CR.leg, 3); claw(cx + 34, top + 8, 0, true); for (let i = 0; i < 4; i++) px(g, cx + 46 + i * 2, top + 6, CR.clawL); }
    else if (f === CRAB_F.crushTell) { line(g, cx - 18, top + 6, cx - 14, top - 12, CR.leg, 3); line(g, ...sh, cx + 16, top - 12, CR.leg, 3); claw(cx + 16, top - 16, 3, true); claw(cx - 14, top - 15, 2, false); }
    else if (f === CRAB_F.crush) { line(g, ...sh, cx + 30, G - 6, CR.leg, 3); claw(cx + 32, G - 6, 0, true); claw(cx + 22, G - 4, 0, false); for (let i = 0; i < 6; i++) px(g, cx + 26 + i * 4, G - 1, CR.rockL); }
    else if (f === CRAB_F.boulderTell) { line(g, ...sh, cx + 10, top - 14, CR.leg, 3); claw(cx + 10, top - 18, 2, true); circle(g, cx + 12, top - 26, 6, CR.rock); circle(g, cx + 10, top - 28, 3, CR.rockL); }
    else if (f === CRAB_F.boulder) { line(g, ...sh, cx + 30, top - 10, CR.leg, 3); claw(cx + 32, top - 12, 6, true); }
    else { line(g, ...sh, cx + 26, top + 12, CR.leg, 3); claw(cx + 30, top + 12, f === CRAB_F.scuttle ? 1 : 3, true); }
    line(g, cx - 16, top + 12, cx - 24, top + 14, CR.leg, 2); claw(cx - 28, top + 14, 2, false);
    if (f === CRAB_F.hurt) for (let i = 0; i < 5; i++) px(g, cx - 10 + i * 5, top + 2, '#ffffff');
    outline(c, OUT); return c; });
  return pack(F, cx, G, 46, 28);
}

/* ---------- ICONS ---------- */
export function bakeFeatherIcon() { const [c, g] = canvas(10, 14); line(g, 2, 13, 7, 1, '#e8dcc0'); for (let i = 0; i < 6; i++) { line(g, 3 + i, 11 - i * 2, 1 + i, 9 - i * 2, '#c8643a'); line(g, 3 + i, 11 - i * 2, 6 + i * 0.5, 11 - i * 2, '#7a2e1c'); } px(g, 7, 1, '#f0dcb8'); outline(c, OUT); return c; }
