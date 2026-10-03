// src/redraw/welltown_art.js - THE WELL TOWN's PLACEHOLDER art (claude/welltown, the greybox; the bowman and the thief are redrawn (claude/welltown3-art)). px.js
// primitives only. The contract is caravan_bandits.js's: every frame faces RIGHT (L is the flip), one canvas size per set, ax = the body's centre
// column, ay = the row under the feet, w/h = the hit box.
//   bakeBanditBowman()  THE BANDIT BOWMAN - the archer's frames on a man of the town (0 stand | 1 draw | 2,3 walk | 4 stand | 5 full draw | 6 loose | 7 hurt)
//   bakeWaterThief(ct)  THE WATER-THIEF - the cutthroat's frames (src/redraw/caravan_bandits.js) dyed the wells' blue, a skin at his hip
//   bakeSkinIcon()      a full water-skin (the level's four quest pickups)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };

/* ---------- THE BANDIT BOWMAN: a man of the town in a wound turban with a tail blowing back, his face veiled, a quiver at his back, a RECURVE bow (limbs bellied toward him, tips flicked away) ---------- */
const BW = { robe: '#c9b089', robeD: '#9a8462', wrap: '#7a3a2a', turban: '#e6d8b8', turbanD: '#b9a67e', skin: '#b07a52', veil: '#3a2a22', bow: '#6a4426', bowL: '#a47a46', bowD: '#3e2814', string: '#efe8d0', arrow: '#c9d1dc', fletch: '#d8d0c0', pants: '#5a4634', boot: '#2a1c12', eye: '#f0dca0', quiver: '#5a3a22' };
export function bakeBanditBowman() {
  const W = 30, H = 34, cx = 13, G = 33;
  const F = Array.from({ length: 8 }, (_, f) => { const [c, g] = canvas(W, H);
    const walk = f === 2 || f === 3, hurt = f === 7, k = f === 3 ? 1 : 0, lean = hurt ? -2 : 0, top = 12, hip = 22;
    for (const [lx, st] of [[cx - 3, walk ? (k ? -2 : 2) : 0], [cx + 1, walk ? (k ? 2 : -2) : 0]]) { rect(g, lx + st, hip, 3, G - 2 - hip, BW.pants); rect(g, lx + st - 1, G - 2, 4, 2, BW.boot); }
    /* the quiver on his back, its feathers over the shoulder */
    line(g, cx - 5 + lean, top + 1, cx - 3, hip - 2, BW.quiver, 2); for (let i = 0; i < 3; i++) { px(g, cx - 6 + lean + i, top - 1 - (i % 2), BW.fletch); }
    fillPoly(g, [[cx - 4 + lean, top], [cx + 4 + lean, top], [cx + 5, hip + 2], [cx - 5, hip + 2]], BW.robe);
    line(g, cx + 3 + lean, top + 1, cx + 4, hip + 1, BW.robeD); rect(g, cx - 4 + lean, top + 6, 9, 2, BW.wrap); rect(g, cx - 4 + lean, top + 6, 9, 1, '#a0523a');
    const hx = cx + 1 + lean, hy = top - 5;
    circle(g, hx, hy, 3.4, BW.skin); ellipse(g, hx - 0.5, hy - 2.5, 5.2, 3.2, BW.turban); rect(g, hx - 5, hy - 2, 10, 1, BW.turbanD); line(g, hx - 3, hy - 4, hx + 3, hy - 2, BW.turbanD); line(g, hx - 5, hy - 1, hx - 8, hy + 4, BW.turban, 2);
    rect(g, hx - 3, hy + 1, 7, 3, BW.veil); px(g, hx + 2, hy - 0.5, BW.eye); px(g, hx + 1, hy - 0.5, BW.eye);
    /* the recurve: tips flick away, the limbs belly toward the archer, a grip in the middle; the string and nock */
    const bow = (bx, by, pull) => { const P = [[bx + 2, by - 9], [bx - 1, by - 6], [bx - 2, by - 3], [bx - 1, by], [bx - 2, by + 3], [bx - 1, by + 6], [bx + 2, by + 9]];
      for (let i = 0; i < P.length - 1; i++) line(g, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], BW.bow, 2);
      for (const [x, y] of [P[1], P[2], P[4], P[5]]) px(g, x - 1, y, BW.bowL); rect(g, bx - 2, by - 1, 3, 3, BW.bowD);
      line(g, P[0][0], P[0][1], bx - pull, by, BW.string); line(g, bx - pull, by, P[6][0], P[6][1], BW.string); };
    const drawn = f === 1 || f === 5, loose = f === 6, raised = drawn || loose;
    if (raised) { const bx = cx + 9, by = top + 1, pull = f === 5 ? 6 : f === 1 ? 3 : 0; bow(bx, by, pull);
      line(g, cx + 3 + lean, top + 2, bx, by, BW.skin, 2); if (drawn) { line(g, bx - pull, by, bx + 6, by, BW.arrow); px(g, bx - pull, by - 1, BW.fletch); px(g, bx - pull, by + 1, BW.fletch); line(g, cx + 2, top + 3, bx - pull, by, BW.skin); } }
    else { const bx = cx + 7, by = hip - 2; for (let i = -9; i <= 9; i++) px(g, bx - 1 + Math.round(2 * Math.cos(i / 9 * Math.PI / 2) * (i < 0 ? 1 : 1)) - 2, by + i, BW.bow); rect(g, bx - 3, by - 1, 3, 3, BW.bowD); px(g, bx, by - 9, BW.bow); px(g, bx, by + 9, BW.bow);
      line(g, bx + 1, by - 9, bx + 1, by + 9, BW.string); line(g, cx + 3 + lean, top + 2, bx - 2, by, BW.skin, 2); }
    outline(c, OUT); return c; });
  return pack(F, cx, G, 10, 22);
}

/* ---------- THE WATER-THIEF: the cutthroat's frames, a LEAN TOWN THIEF: an indigo wrap and a pale headcloth, a cream sash, a blue drop on his chest, a water-skin on his hip ---------- */
const DYE = { '#35305a': '#2c3c82', '#554e86': '#4e68b0', '#201c38': '#141c4a', '#b8382c': '#d8c89c', '#842218': '#a89868', '#2a2640': '#9ab0d0' };
function dyed(c) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  const map = Object.entries(DYE).map(([a, b]) => [[1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16))]);
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; for (const [a, b] of map) if (p[i] === a[0] && p[i + 1] === a[1] && p[i + 2] === a[2]) { p[i] = b[0]; p[i + 1] = b[1]; p[i + 2] = b[2]; break; } }
  g.putImageData(img, 0, 0); return d; }
export function bakeWaterThief(ct) {
  const F = ct.R.map((c, f) => { const d = dyed(c), g = d.getContext('2d'), ox = f === 6 ? -1 : 0, x = ct.ax - 5, y = d.height - 11;
    /* the drop: a blue teardrop on his chest (the same blue as the wells) */
    px(g, ct.ax + ox, d.height - 17, '#8ad4ff'); rect(g, ct.ax - 1 + ox, d.height - 16, 3, 2, '#3a96e0'); px(g, ct.ax + ox, d.height - 14, '#2a6ab8');
    /* the skin on his hip: a leather bag with a tied neck and a drip */
    ellipse(g, x, y, 3.4, 4, '#2a1c12'); ellipse(g, x, y, 2.6, 3.2, '#b07a48'); px(g, x - 1, y - 1, '#d8a870'); px(g, x - 1, y, '#d8a870'); rect(g, x - 1, y - 4, 2, 2, '#2a1c12'); px(g, x, y - 4, '#6a4426'); px(g, x, y + 4, '#4aa8f0'); return d; });
  return pack(F, ct.ax, ct.ay, 10, 18);
}

/* ---------- ICONS ---------- */
export function bakeSkinIcon() { const [c, g] = canvas(12, 12); ellipse(g, 6, 7, 4.5, 4, '#c9a070'); ellipse(g, 6, 6, 3, 2.5, '#e8c890'); rect(g, 5, 1, 2, 3, '#6a4426'); rect(g, 4, 1, 4, 1, '#3a7ab8'); px(g, 8, 8, '#7ab8e8'); outline(c, OUT); return c; }
