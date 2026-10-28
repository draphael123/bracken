// gale_harpy_art.js - THE GALE HARPY'S OWN SHEET (claude/rookery2art; the greybox tinted the crag harpy teal). She is NOT the crag harpy: a different bird, in PROFILE (the crag harpy is
// frontal, wings left and right) - a long lean raptor-woman leaning into the wind, pale storm-teal, the longest wings in the crag with white-tipped primaries, a streaming scarf of
// head plumes and two tail streamers, cream ruff, a hooked yellow beak. Her silhouette is the wind itself: WINGS SWEPT BACK IS HER TELL.
// Same frame contract as every harpy (src/gale-harpy.js galeFrame): 0 hover (wings raised), 1 hover (wings down), 2 THE BEAT (wings thrown forward and down, body leaned back), 3 BROKEN
// (the tumble: wings crumpled, feathers loose, dizzy), 4 THE TELL (wings flung straight back and wide, chest out, beak open, red eyes), 5 HURT. Facing right; flipped for left.
import { canvas, rect as R, line as line0, fillPoly, ellipse, circle, outline, flipX, whiten } from '../px.js';
const OUT = '#1b1626';
const C = { b: '#7ea4b0', B: '#4c6e7e', d: '#2c4654', l: '#b4d0d8', h: '#e8f2f4', ruff: '#f0ece0', ruffD: '#c8c0ac', face: '#ece0cc', faceD: '#bba890', beak: '#f0cc58', beakD: '#a8842c', talon: '#e8dcb0', leg: '#d4bc70', eye: '#ffe27a', red: '#ff4a2a', plume: '#dce8ee' };
const W = 44, H = 32, AX = 27, AY = 30, OX = 8, OY = 4;   /* the canvas, and her talons' point (the feet) */
const line = (g, a, b, c, d, col, t) => { if ([a, b, c, d].every(Number.isFinite)) line0(g, Math.round(a), Math.round(b), Math.round(c), Math.round(d), col, t); };
function feather(g, x0, y0, a, len, w, col, tip) { const ca = Math.cos(a), sa = Math.sin(a); for (let i = 0; i < len; i++) { const ww = Math.max(1, Math.round(w * (1 - 0.5 * i / len))); R(g, Math.round(x0 + ca * i), Math.round(y0 + sa * i - ww / 2), 1, ww, i >= len - 2 && tip ? tip : col); } }
/* a wing in profile: a shoulder (sx, sy), the arm out along angle a0 to the wrist (len L0), then n primaries fanned from the wrist over fan rad centred on angle a1, each up to Lp long */
function wing(g, sx, sy, a0, L0, a1, fan, n, Lp, far) {
  const wx = sx + Math.cos(a0) * L0, wy = sy + Math.sin(a0) * L0, base = far ? C.B : C.b, light = far ? C.B : C.l, dark = C.d;
  for (let k = 0; k < n; k++) {
    const t = n === 1 ? 0 : k / (n - 1), a = a1 + (t - 0.5) * fan, L = Lp * (0.7 + 0.3 * Math.sin(Math.PI * (0.15 + 0.7 * t)));
    feather(g, wx, wy, a, Math.round(L), 2.6, k % 2 ? base : light, k === n - 1 || k === 0 || k === 3 ? C.h : dark);
  }
  line(g, sx, sy, wx, wy, base, 3); line(g, sx, sy - 1, wx, wy - 1, far ? C.B : C.l, 1);
  ellipse(g, Math.round((sx + wx) / 2), Math.round((sy + wy) / 2), 3, 2, far ? C.B : C.b);
}
function bird(g, o) {
  const tilt = o.tilt || 0, cx = 19, cy = o.cy ?? 14;
  const pt = (x, y) => [cx + (x * Math.cos(tilt) - y * Math.sin(tilt)), cy + (x * Math.sin(tilt) + y * Math.cos(tilt))];
  const sh = pt(-1, -3), hip = pt(-2, 6), hd = pt(4, -8);
  if (o.wing) wing(g, sh[0] - 1, sh[1] + 1, ...o.wing, true);   /* the far wing first, behind everything */
  for (const [da, L] of [[0.0, 10], [0.3, 8]]) feather(g, hip[0], hip[1], (o.tail ?? 2.05) + da, L, 2.2, C.B, C.h);   /* two long tail streamers */
  const body = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; body.push(pt(Math.cos(a) * 4.3, Math.sin(a) * 7)); }
  fillPoly(g, body, C.b);
  const lit = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; lit.push(pt(Math.cos(a) * 2.8 - 0.8, Math.sin(a) * 5.4 - 0.5)); }
  fillPoly(g, lit, C.l);
  const ch = pt(2.2, -1); ellipse(g, Math.round(ch[0]), Math.round(ch[1]), o.chest ? 4 : 3, o.chest ? 6 : 5, C.ruff);   /* the cream ruff */
  for (let q = 0; q < 4; q++) { const p = pt(1.2 + (q % 2), -4 + q * 2.6); R(g, Math.round(p[0]), Math.round(p[1]), 3, 1, C.ruffD); }
  for (const dx of [-1.5, 1.8]) {   /* legs and talons, dangling (drawn up and curled in the beat) */
    const t = pt(dx, 6), ex = t[0] + (o.legIn ? 0 : dx * 0.4), ey = t[1] + (o.legIn ? 3 : 6);
    line(g, t[0], t[1], ex, ey, C.leg, 2); R(g, Math.round(ex) - 1, Math.round(ey), 4, 1, C.talon); R(g, Math.round(ex) + 2, Math.round(ey) + 1, 1, 1, C.talon); R(g, Math.round(ex) - 1, Math.round(ey) + 1, 1, 1, C.talon);
  }
  for (const [da, L] of [[-0.35, 9], [0, 11], [0.35, 8]]) feather(g, hd[0] - 1, hd[1] - 1, Math.PI + da + (o.plume || 0), L, 2.2, C.plume, C.l);   /* the plume scarf streaming back */
  circle(g, Math.round(hd[0]), Math.round(hd[1]), 3, C.face); R(g, Math.round(hd[0]) - 2, Math.round(hd[1]) + 1, 3, 2, C.faceD);
  const ex = Math.round(hd[0]) + 1, ey = Math.round(hd[1]) - 1;
  if (o.hurt) { R(g, ex - 1, ey + 1, 3, 1, '#1b0a0a'); R(g, ex - 1, ey - 1, 3, 1, C.d); }
  else if (o.dizzy) { R(g, ex - 1, ey, 1, 1, '#1b0a0a'); R(g, ex + 1, ey, 1, 1, '#1b0a0a'); R(g, ex, ey - 1, 1, 1, '#1b0a0a'); R(g, ex, ey + 1, 1, 1, '#1b0a0a'); }
  else { R(g, ex - 1, ey, 3, 2, o.eye === 'red' ? C.red : C.eye); R(g, ex, ey, 1, 1, '#1b0a0a'); R(g, ex - 2, ey - 1, 4, 1, C.d); }
  const bx = Math.round(hd[0]) + 2, by = Math.round(hd[1]) + 1;
  if (o.beak) { fillPoly(g, [[bx, by - 2], [bx + 7, by - 1], [bx + 5, by], [bx, by]], C.beak); fillPoly(g, [[bx, by + 1], [bx + 6, by + 4], [bx + 3, by + 4], [bx, by + 3]], C.beakD); R(g, bx + 1, by, 4, 1, '#3a0c10'); }
  else { fillPoly(g, [[bx, by - 2], [bx + 6, by], [bx + 5, by + 2], [bx + 2, by + 2.5], [bx, by + 2]], C.beak); R(g, bx + 4, by + 1, 2, 2, C.beakD); }
  if (o.wing) wing(g, sh[0], sh[1], ...o.wing, false);   /* the near wing over the body */
}
const FR = [
  /* 0 hover, wings raised in an arch above and behind */ { tilt: 0.32, wing: [-2.35, 8, -2.0, 1.05, 7, 12], plume: 0.1 },
  /* 1 hover, wings swept down */ { tilt: 0.28, wing: [2.55, 7, 2.2, 0.9, 7, 11], tail: 2.15, plume: 0.35 },
  /* 2 THE BEAT: wings thrown forward and down, body leaned back, legs drawn in */ { tilt: -0.22, cy: 13, wing: [0.55, 7, 1.0, 1.0, 7, 14], legIn: true, tail: 1.9, plume: -0.3, beak: true },
  /* 3 BROKEN: tumbling, wings crumpled */ { tilt: 1.3, cy: 15, wing: [-2.9, 5, -2.4, 1.6, 6, 8], dizzy: true, legIn: true, tail: 3.0 },
  /* 4 THE TELL: wings flung straight back and wide, chest out, beak open, red eyes */ { tilt: 0.12, cy: 14, wing: [-2.95, 9, -3.05, 0.95, 8, 15], chest: true, beak: true, eye: 'red', plume: -0.15 },
  /* 5 HURT */ { tilt: -0.1, wing: [-2.2, 7, -1.8, 1.3, 7, 11], hurt: true, beak: true, legIn: true },
];
let SET = null;
export function bakeGaleHarpy() {
  if (SET) return SET;
  const R0 = FR.map((o, i) => {
    const [c, g] = canvas(W, H); g.save(); g.translate(OX, OY); bird(g, o); g.restore();
    if (i === 3) { for (const [x, y] of [[8, 8], [36, 10], [14, 26], [34, 24]]) { R(g, x, y, 3, 1, C.h); R(g, x + 1, y - 1, 1, 1, C.l); } for (const [x, y] of [[21, 4], [28, 3], [24, 7]]) { R(g, x, y, 2, 2, '#ffe9a0'); R(g, x, y, 1, 1, '#fff'); } }   /* loose feathers and the tumble's stars */
    outline(c, OUT); return c;
  });
  const w0 = R0.map(c => whiten(c));
  SET = { R: R0, L: R0.map(flipX), white: { R: w0, L: w0.map(flipX) }, ax: AX, ay: AY, w: 14, h: 9 };
  return SET;
}
export const SHEET = () => { const out = {}, S = bakeGaleHarpy(); S.R.forEach((c, i) => out['gale-harpy-' + i] = c); return out; };
