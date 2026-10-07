// src/redraw/matriarch_young.js - OLD PLUME's YOUNG (claude/matriarch2 art): not a small cliff raptor but a JUVENILE - a round downy body in buff and cream with rust-brown
// patches, an oversized head and bright eye, a short orange beak, two stubby crimson crest tufts (her crest, grown out of down), a short tail with a rust tip, long clumsy feet.
// Frames follow the cliff raptor's (src/redraw/redgorge_art.js bakeRaptor): 0 glide | 1 flap up | 2 flap down | 3 DIVE TELL (red eye) | 4 DIVE | 5 PERCHED (open), 6 CLIMB.
// Drawn natively at their own size (main.js draws this set at scale 1). Contract: every frame faces RIGHT, ax = the body's centre column, ay = the row under the feet.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const Y = { b: '#e0c08a', B: '#f2dcae', r: '#a8562e', R: '#c8743e', d: '#5a2a1c', dd: '#341410', cream: '#f6ead0', beak: '#f0a84a', beakD: '#9a5a1c', eye: '#fff0a0', red: '#ff3a2a', leg: '#e0a840', crim: '#c8243a', crimL: '#e8485a' };
export function bakeYoung() {
  const W = 30, H = 24, gy = 22, ax = 13;
  const head = (g, x, y, tilt, eye) => { circle(g, x, y, 3.4, Y.b); circle(g, x - 0.5, y - 1, 2.2, Y.B); rect(g, x + 0, y - 1, 4, 2, Y.d); px(g, x + 1, y - 1, eye); px(g, x + 2, y - 1, Y.eye === eye ? Y.dd : Y.dd);   /* the big round head and its dark mask */
    px(g, x + 1, y - 1, eye); px(g, x + 2, y - 1, eye);
    fillPoly(g, [[x + 3, y - 1], [x + 7, y + 0.5 + tilt], [x + 3.5, y + 2.4]], Y.beak); px(g, x + 6, y + 1 + tilt, Y.beakD);   /* the short beak */
    line(g, x - 1, y - 3, x - 3, y - 6 + tilt, Y.crim); line(g, x + 1, y - 3, x, y - 6, Y.crimL); px(g, x - 3, y - 7 + tilt, Y.cream); };   /* two stubby crimson tufts */
  const tail = (g, x, y, up) => { fillPoly(g, [[x, y - 1], [x - 6, y - 1 + up], [x - 9, y + 1 + up * 1.4], [x - 5, y + 2 + up], [x, y + 2]], Y.r); px(g, x - 8, y + 0 + up, Y.d); px(g, x - 8, y + 1 + up, Y.d); };
  const body = (g, x, y, tilt, eye) => { ellipse(g, x, y, 6.5, 4.6, Y.b); ellipse(g, x - 1, y - 1.6, 4.6, 2.4, Y.R); ellipse(g, x + 2, y + 1.4, 4, 2.4, Y.cream); px(g, x - 3, y - 1, Y.r); px(g, x - 1, y - 2, Y.r); px(g, x + 1, y - 3, Y.r);   /* down: buff with rust patches */
    head(g, x + 7, y - 4, tilt, eye); };
  const wing = (g, x, y, lift, span, c1, c2) => { const tx = x - 2 + span * 0.2, ty = y - lift;
    fillPoly(g, [[x - 3, y - 1], [x + 3, y - 1], [tx + span * 0.4, ty], [tx - span * 0.4, ty - 1]], c1);
    for (let k = 0; k < 4; k++) line(g, tx - span * 0.4 + k * 2, ty - 1, tx - span * 0.4 + k * 2 - 1, ty - 3, c2); };
  const F = Array.from({ length: 7 }, (_, f) => { const [c, g] = canvas(W, H); const cx = ax, cy = 10;
    if (f === 5) {   /* PERCHED: a round fluffy owlet-like upright, wings shut, long feet gripping */
      ellipse(g, cx, gy - 7, 5.5, 6.5, Y.b); ellipse(g, cx + 1, gy - 6, 3.4, 4.6, Y.cream); ellipse(g, cx - 2, gy - 9, 3, 3.6, Y.R); px(g, cx - 3, gy - 6, Y.r); px(g, cx - 2, gy - 4, Y.r);
      head(g, cx + 2, gy - 15, 0, Y.eye); fillPoly(g, [[cx - 4, gy - 4], [cx - 7, gy - 1], [cx - 4, gy - 1], [cx - 2, gy - 4]], Y.r);
      rect(g, cx - 2, gy - 2, 1, 3, Y.leg); rect(g, cx + 2, gy - 2, 1, 3, Y.leg); rect(g, cx - 3, gy + 0, 3, 1, Y.leg); rect(g, cx + 1, gy + 0, 3, 1, Y.leg); outline(c, OUT); return c; }
    if (f === 4) {   /* DIVE: wings swept back, head down, big feet forward - a ball with a beak */
      ellipse(g, cx, cy + 1, 3.8, 6.4, Y.b); ellipse(g, cx - 1, cy, 2, 4, Y.R); ellipse(g, cx + 1, cy + 3, 2, 3, Y.cream);
      circle(g, cx + 1, cy + 8.5, 3, Y.b); px(g, cx + 2, cy + 8, Y.red); px(g, cx + 3, cy + 8, Y.red); fillPoly(g, [[cx, cy + 10], [cx + 3, cy + 13.5], [cx - 1, cy + 12]], Y.beak);
      line(g, cx - 3, cy - 3, cx - 6, cy + 3, Y.r); line(g, cx + 3, cy - 3, cx + 6, cy + 3, Y.r); line(g, cx - 1, cy - 4, cx - 2, cy - 8, Y.d); line(g, cx + 1, cy - 4, cx + 2, cy - 8, Y.d);
      line(g, cx - 1, cy + 6, cx - 2, cy + 9, Y.leg); line(g, cx + 2, cy + 6, cx + 3, cy + 9, Y.leg); outline(c, OUT); return c; }
    if (f === 6) {   /* CLIMB: scrambling up the rock, wings half open for balance, claws out ahead */
      ellipse(g, cx - 1, cy + 3, 5, 6, Y.b); ellipse(g, cx, cy + 4, 3, 4, Y.cream); wing(g, cx - 2, cy + 1, 7, 9, Y.r, Y.d);
      head(g, cx + 3, cy - 5, 0, Y.eye); line(g, cx + 3, cy + 5, cx + 7, cy + 1, Y.leg); line(g, cx + 1, cy + 7, cx + 5, cy + 4, Y.leg); line(g, cx + 6, cy + 1, cx + 9, cy - 1, Y.cream); outline(c, OUT); return c; }
    const lift = [1, 7, -3, 4][f], span = [17, 12, 14, 9][f], tilt = f === 3 ? 2 : 0, eye = f === 3 ? Y.red : Y.eye;
    wing(g, cx + 1, cy, lift, span, Y.d, Y.dd); tail(g, cx - 5, cy + 1, f === 1 ? -1 : f === 2 ? 2 : 0); body(g, cx, cy, tilt, eye); wing(g, cx - 1, cy + 1, lift - 1, span, Y.r, Y.d);
    line(g, cx + 1, cy + 4, cx + 2, cy + 8, Y.leg); line(g, cx + 4, cy + 4, cx + 5, cy + 8, Y.leg); px(g, cx + 3, cy + 9, Y.leg); px(g, cx + 6, cy + 9, Y.leg);
    if (f === 3) { px(g, cx + 3, cy + 10, Y.beak); px(g, cx + 6, cy + 10, Y.beak); }
    outline(c, OUT); return c; });
  const white = F.map(c => whiten(c));
  return { R: F, L: F.map(c => flipX(c)), white: { R: white, L: white.map(c => flipX(c)) }, ax, ay: H, w: 14, h: 8 };
}
