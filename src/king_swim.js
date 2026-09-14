// king_swim.js — THE DROWNED KING IN THE WATER. His standing frames are drawn from a grid in chars.js; a man swimming is
// a body at an angle with a cape and a beard trailing off it, and a grid cannot turn, so these are painted from a pose:
// a body laid along an axis (u toward his head, v across it) at an angle, arms and legs at angles off it, the cape and
// the beard waving behind. Every frame is 80x72 with his feet anchored at (40, 69), the standing frames included, and
// every frame is checked for touching its own border when it is baked (rules E6 and G: at bake time, not after).
import { canvas, px, line, circle, fillPoly, outline } from './px.js';
import { OUT } from './art.js';

/* A SHADE LIGHTER THAN HE IS ON LAND: the sea's wash goes over everything in it, and his first palette went under it and left an
   outline swimming about the throne room. A thing that hurts must look like it (C1). */
const K = { p: '#5e9c86', P: '#3a6a5c', pl: '#8cc4ae', s: '#a8b8b2', S: '#6e7e7a', sl: '#d0dcd6', y: '#e0bc44', Y: '#a07e22', yl: '#fff0a8',
  i: '#7a8494', I: '#4e5664', il: '#aab2bc', g: '#7ff0e0', gl: '#dffffa', w: '#bcd0c8', W: '#8aa89e', v: '#3e8a60', V: '#2a5a40', k: '#12201e', r: '#7a2a30' };
export const KING_W = 80, KING_H = 72, KING_AX = 40, KING_AY = 69;

function pose(o) {
  const [c, g] = canvas(KING_W, KING_H);
  const { cx = 40, cy = 50, a = 0, ph = 0, armF = 0.3, armB = 1.6, cape = 1, legs = 1, kick = 0, eyes = K.g, mouth = false, crownOff = 0, extra = null } = o;
  const ca = Math.cos(a), sa = Math.sin(a);
  const Pt = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];
  const oval = (u0, v0, ru, rv, col) => { const pts = []; for (let k = 0; k < 18; k++) { const t = k / 18 * Math.PI * 2; pts.push(Pt(u0 + Math.cos(t) * ru, v0 + Math.sin(t) * rv)); } fillPoly(g, pts, col); };
  const seg = (u0, v0, ang, len, col, th) => { const p0 = Pt(u0, v0), p1 = [p0[0] + Math.cos(a + ang) * len, p0[1] + Math.sin(a + ang) * len]; line(g, p0[0], p0[1], p1[0], p1[1], col, th); return p1; };
  // THE CAPE: chain-mail and weed off his shoulders, trailing behind him and waving
  const top = [], bot = [];
  for (let u = 9; u >= -26 * cape; u -= 2) { const t = (9 - u) / 35, wv = Math.sin(u * 0.3 + ph) * 2.6 * t; top.push(Pt(u, -9 - t * 2 + wv)); bot.push(Pt(u, 7 + t * 6 + wv)); }
  fillPoly(g, top.concat(bot.slice().reverse()), K.I);
  for (let u = 5; u >= -24 * cape; u -= 5) { const t = (9 - u) / 35, wv = Math.sin(u * 0.3 + ph) * 2.6 * t; const p0 = Pt(u, -7 + wv), p1 = Pt(u - 3, 5 + t * 4 + wv); line(g, p0[0], p0[1], p1[0], p1[1], K.i); }
  for (let u = -4; u >= -22 * cape; u -= 7) { const t = (9 - u) / 35, wv = Math.sin(u * 0.3 + ph) * 2.6 * t; const q = Pt(u, 8 + t * 6 + wv); px(g, q[0], q[1], K.v); px(g, q[0] + 1, q[1], K.V); }
  // THE BACK ARM, behind him
  { const h = seg(8, 4, armB, 13, K.I, 3); circle(g, h[0], h[1], 2, K.S); }
  // THE LEGS: greaves trailing from his hips, kicking
  for (const s of [-1, 1]) { const kk = Math.sin(ph + (s > 0 ? 0 : Math.PI)) * 3 * legs + kick * s;
    const hip = Pt(-6, s * 3), knee = Pt(-16, s * 3 + kk * 0.5), foot = Pt(-25, s * 2 + kk);
    line(g, hip[0], hip[1], knee[0], knee[1], K.P, 4); line(g, knee[0], knee[1], foot[0], foot[1], K.S, 3); px(g, foot[0], foot[1], K.v); }
  // THE BODY: green plate, a gold belt, a trail of chain off it
  oval(2, 0, 12, 7, K.p); oval(5, -3, 6, 2.5, K.pl);
  { const s0 = Pt(-8, 0), s1 = Pt(12, 0); line(g, s0[0], s0[1], s1[0], s1[1], K.P); const b0 = Pt(-6, -6), b1 = Pt(-6, 6); line(g, b0[0], b0[1], b1[0], b1[1], K.Y, 2); }
  for (let k = 0; k < 4; k++) { const q = Pt(-8 - k * 3, 7 + (k % 2)); px(g, q[0], q[1], k % 2 ? K.il : K.i); }
  // THE HEAD: a narrow face, two lamps for eyes, a beard trailing down his throat, and the crown that has not been off in thirty years
  oval(17, -1, 5, 5, K.s); oval(18, -3, 3, 1.6, K.sl);
  { const e1 = Pt(20, -2), e2 = Pt(20, 1.5); px(g, e1[0], e1[1], eyes); px(g, e2[0], e2[1], eyes); if (mouth) { const m = Pt(21, 3); px(g, m[0], m[1], K.k); px(g, m[0] + 1, m[1], K.k); } }
  { const wv = Math.sin(ph + 1) * 2; fillPoly(g, [Pt(21, 3), Pt(15, 5), Pt(6, 9 + wv), Pt(4, 11 + wv), Pt(11, 4)], K.w); const b = Pt(9, 7 + wv); px(g, b[0], b[1], K.W); }
  { const cr = crownOff; for (let k = 0; k < 5; k++) { const b = Pt(13 + k * 2 + cr, -5 - cr * 0.5), t = Pt(14 + k * 2 + cr, -9 - cr); line(g, b[0], b[1], t[0], t[1], k % 2 ? K.y : K.yl); }
    const b0 = Pt(12 + cr, -5 - cr * 0.5), b1 = Pt(22 + cr, -4 - cr * 0.5); line(g, b0[0], b0[1], b1[0], b1[1], K.Y, 2); }
  // THE FRONT ARM, over all of it
  { const el = seg(8, -3, armF, 8, K.i, 3), ha = [el[0] + Math.cos(a + armF * 0.8) * 7, el[1] + Math.sin(a + armF * 0.8) * 7]; line(g, el[0], el[1], ha[0], ha[1], K.i, 3); circle(g, ha[0], ha[1], 2.3, K.il); px(g, ha[0], ha[1], K.sl); }
  if (extra) extra(g, Pt);
  return outline(c, OUT);
}

/* the frames: 0-4 are his standing ones, handed in from chars.js, centred on the same anchor */
export function kingFrames(upright) {
  const fit = src => { const [c, g] = canvas(KING_W, KING_H); g.drawImage(src, Math.round(KING_AX - 23), Math.round(KING_AY - 31)); return c; };
  const F = upright.map(fit);
  // 5-7 THE STROKE: reach, pull, sweep
  F.push(pose({ ph: 0, armF: -0.9, armB: 2.2 }), pose({ ph: 2.1, armF: 0.5, armB: 1.2 }), pose({ ph: 4.2, armF: 2.5, armB: -0.4, kick: 1 }));
  // 8 THE GLIDE: arms along him, the cape straight out behind
  F.push(pose({ ph: 1, armF: 2.9, armB: 2.9, legs: 0.2, cape: 1.1 }));
  // 9 THE TURN: square on to you, the cape spread both ways
  F.push(front());
  // 10 THE DIVE, head down; 11 THE RISE, head up with his arms over it
  F.push(pose({ a: Math.PI / 2, cy: 40, ph: 1, armF: -0.1, armB: 0.15, cape: 0.75, legs: 0.6 }));
  F.push(pose({ a: -Math.PI / 2, cy: 38, ph: 2.5, armF: 0.1, armB: -0.2, cape: 0.8, legs: 0.8 }));
  // 12 THE CHARGE TOLD: drawn back into himself, both arms behind, the cape bunched; 13 THE CHARGE: both fists down the line
  F.push(pose({ cx: 36, a: 0.12, ph: 3, armF: 2.7, armB: 2.9, cape: 0.62, legs: 1.4, eyes: K.gl }));
  F.push(pose({ cx: 44, a: 0, ph: 0.5, armF: 0.05, armB: 0.2, cape: 1.2, legs: 0.3, eyes: K.gl, extra: (g, Pt) => { for (let k = 0; k < 4; k++) { const s = Pt(-30 - k * 2, -8 + k * 5), e2 = Pt(-24 - k * 2, -8 + k * 5); line(g, s[0], s[1], e2[0], e2[1], K.gl); } } }));
  // 14 THE UNDERTOW: turning over in the water with the cape wrapped round him
  F.push(pose({ a: 0.7, cy: 46, ph: 5, armF: -1.9, armB: 1.9, cape: 0.9, legs: 1.2, extra: (g, Pt) => { for (let k = 0; k < 20; k++) { const t = k / 20 * Math.PI * 2, q = Pt(2 + Math.cos(t) * 22, Math.sin(t) * 16); if (k % 3) px(g, q[0], q[1], K.g); } } }));
  // 15 THE ANCHOR: one arm up and back, the chain over his head and the anchor at the end of it
  F.push(pose({ ph: 2, armF: -2.2, armB: 1.4, extra: (g, Pt) => { const h = Pt(2, -22); for (let k = 0; k < 6; k++) { const q = Pt(6 - k * 2, -10 - k * 2.2); px(g, q[0], q[1], k % 2 ? K.il : K.i); }
    line(g, h[0] - 4, h[1], h[0] + 4, h[1], K.i, 2); line(g, h[0], h[1] - 3, h[0], h[1] + 5, K.i, 2); px(g, h[0] - 5, h[1] + 2, K.il); px(g, h[0] + 5, h[1] + 2, K.il); } }));
  // 16 THE FALL TOLD: tipped over you, looking down, arms spread
  F.push(pose({ a: 0.55, cy: 46, ph: 3.5, armF: -1.5, armB: 1.5, cape: 1, legs: 0.4, eyes: K.gl }));
  // 17 STUNNED in the stone: slumped, the crown knocked askew, the lamps in his eyes gone dim
  F.push(pose({ a: 0.85, cy: 42, ph: 0, armF: 1.9, armB: 1.3, cape: 0.8, legs: 0, eyes: '#3a6a64', crownOff: 3, extra: (g, Pt) => { for (const [u, v] of [[26, -12], [20, -16], [30, -6]]) { const q = Pt(u, v); px(g, q[0], q[1], K.yl); px(g, q[0] + 1, q[1] + 1, K.y); } } }));
  // 18 HURT, and last: thrown back off the blow, arms flung, mouth open
  F.push(pose({ a: -0.35, cy: 48, ph: 1.5, armF: -2.3, armB: 2.7, cape: 0.95, legs: 1.6, eyes: K.gl, mouth: true }));
  // AT BAKE TIME: a frame that touches its own border has been cut, and nobody will see that until it is on a contact sheet
  F.forEach((c, i) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
    for (let x = 0; x < W; x++) if (d[(x) * 4 + 3] || d[((H - 1) * W + x) * 4 + 3]) { console.warn('king frame ' + i + ' touches its top or bottom edge'); break; }
    for (let y = 0; y < H; y++) if (d[(y * W) * 4 + 3] || d[(y * W + W - 1) * 4 + 3]) { console.warn('king frame ' + i + ' touches its side edge'); break; } });
  return F;
}

/* square on: the torso upright and facing you, the cape spread out either side in the water, his feet hanging */
function front() {
  const [c, g] = canvas(KING_W, KING_H), cx = 40; g.translate(0, 8);
  fillPoly(g, [[cx - 6, 24], [cx - 24, 30], [cx - 28, 44], [cx - 20, 52], [cx - 8, 48], [cx + 8, 48], [cx + 20, 52], [cx + 28, 44], [cx + 24, 30], [cx + 6, 24]], K.I);
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) line(g, cx + s * (10 + k * 4), 28 + k, cx + s * (12 + k * 4), 46 + k, K.i);
  fillPoly(g, [[cx - 9, 26], [cx + 9, 26], [cx + 8, 44], [cx - 8, 44]], K.p); fillPoly(g, [[cx - 6, 27], [cx - 1, 27], [cx - 2, 40], [cx - 6, 40]], K.pl);
  line(g, cx - 8, 38, cx + 8, 38, K.Y, 2);
  for (const s of [-1, 1]) { line(g, cx + s * 4, 44, cx + s * 5, 55, K.P, 4); line(g, cx + s * 5, 55, cx + s * 5, 59, K.S, 3); line(g, cx + s * 10, 28, cx + s * 20, 38, K.i, 3); circle(g, cx + s * 20, 38, 2.3, K.il); }
  circle(g, cx, 19, 5.5, K.s); px(g, cx - 2, 19, K.g); px(g, cx + 2, 19, K.g);
  fillPoly(g, [[cx - 4, 22], [cx + 4, 22], [cx + 2, 32], [cx, 34], [cx - 2, 32]], K.w);
  for (let k = 0; k < 5; k++) line(g, cx - 5 + k * 2.5, 13, cx - 5 + k * 2.5, 9, k % 2 ? K.y : K.yl); line(g, cx - 6, 13, cx + 6, 13, K.Y, 2);
  return outline(c, OUT);
}
