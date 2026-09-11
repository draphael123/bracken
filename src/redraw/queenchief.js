// queenchief.js — boss redraws (WIP)
import { canvas, px, rect, line, circle, ellipse, fillPoly, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(whiten), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}

// A rotated ellipse, every pixel shaded by where its surface faces: light comes from the upper left.
// ramp = [shadow, base, light, gloss?]; band(u) may return a different ramp along the long axis (u: -1 root .. +1 tip).
function oval(g, cx, cy, rx, ry, ang, ramp, band = null, dith = false) {
  const R = Math.max(rx, ry) + 1, ca = Math.cos(ang), sa = Math.sin(ang);
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    const u = (dx * ca + dy * sa) / rx, v = (-dx * sa + dy * ca) / ry, r2 = u * u + v * v;
    if (r2 > 1) continue;
    const nl = [u / rx, v / ry], nw = [nl[0] * ca - nl[1] * sa, nl[0] * sa + nl[1] * ca], nm = Math.hypot(nw[0], nw[1]) || 1;
    const s = Math.sqrt(r2) * (-(nw[0] / nm) * 0.55 - (nw[1] / nm) * 0.83);
    const rp = band ? band(u, v) : ramp;
    let c = s > 0.62 && rp[3] ? rp[3] : s > 0.22 ? rp[2] : s < -0.42 ? rp[0] : rp[1];
    if (dith && c === rp[1] && s > 0.05 && ((x + y) & 1)) c = rp[2];
    px(g, x, y, c);
  }
}

// ======================================================================================
// THE HORNET QUEEN
// ======================================================================================
const HQ = {
  Y: ['#a0781c', '#e0b040', '#ffd34a', '#fff1a0'],   // yellow chitin
  K: ['#1f140c', '#3a2618', '#5a3e26', '#8a6a4a'],   // black chitin
  F: ['#2a1a10', '#5a3a20', '#7a5a32', '#9a7a48'],   // thorax fur
  E: ['#6a1e1a', '#c9463d', '#ff6b3a', '#ffd0a0'],   // compound eye
  G: ['#a07a1c', '#ffd34a', '#fff6c8'],              // crown gold
  W: ['#9ab0d8', '#cfdcf5', '#f4f8ff', '#8fa6d0'],   // near wing: edge, membrane, glint, vein
  WF: ['#7a90b8', '#9ab0d8', '#b8c8e8', '#6a80a8'],  // far wing
  leg: '#3a2618', shin: '#c9962a', blue: '#4a90e0', gem: '#c9463d', gem2: '#ff9a8a', venom: '#8fd160', venom2: '#d8ffb0', sting: '#e8dcc0',
};

function queenFrame(W, H, o) {
  const [c, g] = canvas(W, H);
  const { ox, oy, rot = 0, abd = 28, abdLen = 11, wing = 50, wingLen = 18, legs = 'dangle', mouth = 0, crownTilt = 0, crownDx = 0, crownDy = 0, drip = 0, droop = 0 } = o;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  const T = (x, y) => [ox + x * cr - y * sr, oy + x * sr + y * cr];
  const P = pts => pts.map(([x, y]) => T(x, y));
  const deg = Math.PI / 180;
  // ---- wings: far pair first (behind the body), near pair last
  const wingPoly = (len, wid) => [[0, -1], [-len * 0.3, -wid * 0.55], [-len * 0.72, -wid * 0.7], [-len, -wid * 0.35], [-len * 1.02, 0], [-len * 0.8, wid * 0.35], [-len * 0.35, wid * 0.3], [0, 1]];
  const wingAt = (root, phi, len, wid, pal, veins) => {
    if (wing === null) return;
    const cp = Math.cos(phi), sp = Math.sin(phi);
    const L2 = ([x, y]) => T(root[0] + x * cp - y * sp, root[1] + x * sp + y * cp);
    fillPoly(g, wingPoly(len, wid).map(L2), pal[1]);
    // the leading edge catches the light
    const le = [[-len * 0.1, -wid * 0.3], [-len * 0.3, -wid * 0.5], [-len * 0.7, -wid * 0.6], [-len * 0.9, -wid * 0.3]].map(L2);
    for (let i = 0; i + 1 < le.length; i++) line(g, le[i][0], le[i][1], le[i + 1][0], le[i + 1][1], pal[2]);
    if (veins) { const a = L2([0, 0]), b = L2([-len * 0.75, -wid * 0.1]), d = L2([-len * 0.55, wid * 0.2]); line(g, a[0], a[1], b[0], b[1], pal[3]); line(g, a[0], a[1], d[0], d[1], pal[3]); }
  };
  const wingsFor = (near) => {
    const pal = near ? HQ.W : HQ.WF, dx = near ? 0 : 2, dp = near ? 0 : 10 * deg;
    wingAt([-3 + dx, -4], (wing - 14) * deg + dp, wingLen * 0.7, 5, pal, near); // hind wing
    wingAt([-1 + dx, -5], wing * deg + dp, wingLen, 7, pal, near);                // fore wing
  };
  // ---- legs
  const LEGS = {
    dangle: [[[4, 4], [8, 8], [9, 12]], [[1, 5], [3, 9], [2, 13]], [[-2, 4], [-5, 8], [-6, 12]]],
    tuck: [[[4, 4], [8, 6], [9, 3]], [[1, 5], [4, 8], [6, 6]], [[-2, 4], [-3, 8], [-1, 9]]],
    brace: [[[4, 4], [10, 7], [12, 12]], [[1, 5], [3, 10], [3, 14]], [[-2, 4], [-7, 8], [-9, 12]]],
    splay: [[[4, 4], [10, 5], [13, 7]], [[1, 5], [3, 7], [7, 7]], [[-2, 4], [-7, 5], [-10, 7]]],
    trail: [[[4, 4], [2, 8], [-3, 10]], [[1, 5], [-2, 8], [-7, 9]], [[-2, 4], [-6, 7], [-11, 8]]],
  };
  const legSet = (near) => {
    for (const [hip, knee, foot] of LEGS[legs]) {
      const d = near ? 0 : 2;
      const a = T(hip[0] + d, hip[1] - 1), b = T(knee[0] + d, knee[1] - (near ? 0 : 1)), f = T(foot[0] + d, foot[1] - (near ? 0 : 1));
      line(g, a[0], a[1], b[0], b[1], near ? HQ.leg : HQ.K[0]); line(g, a[0] + 1, a[1], b[0] + 1, b[1], near ? HQ.leg : HQ.K[0]);
      line(g, b[0], b[1], f[0], f[1], near ? HQ.shin : HQ.Y[0]);
    }
  };
  wingsFor(false);
  legSet(false);
  // ---- abdomen: droops from the waist, striped, glossy, a sting at the tip
  const root = T(-8, 2.5);
  let tip, da;
  if (o.curl === undefined) { // one smooth droop
    const a = abd * deg + rot; da = [-Math.cos(a), Math.sin(a)];
    const ac = [root[0] + da[0] * abdLen, root[1] + da[1] * abdLen];
    const band = u => (u < -0.62 ? HQ.K : u < -0.2 ? HQ.Y : u < 0.02 ? HQ.K : u < 0.36 ? HQ.Y : u < 0.52 ? HQ.K : HQ.Y);
    oval(g, ac[0], ac[1], abdLen + 0.5, 7.2 * abdLen / 11, Math.atan2(da[1], da[0]), HQ.Y, band);
    tip = [ac[0] + da[0] * (abdLen + 0.5), ac[1] + da[1] * (abdLen + 0.5)];
  } else { // curled under her: a fat front half, then the tip hooked round towards the target
    const a1 = abd * deg + rot, d1 = [-Math.cos(a1), Math.sin(a1)], l1 = abdLen * 0.62;
    const c1 = [root[0] + d1[0] * l1, root[1] + d1[1] * l1];
    const j = [c1[0] + d1[0] * l1 * 0.7, c1[1] + d1[1] * l1 * 0.7];
    const a2 = o.curl * deg + rot; da = [-Math.cos(a2), Math.sin(a2)]; const l2 = abdLen * 0.55;
    const c2 = [j[0] + da[0] * l2, j[1] + da[1] * l2];
    oval(g, c1[0], c1[1], l1 + 0.5, 7.2, Math.atan2(d1[1], d1[0]), HQ.Y, u => (u < -0.45 ? HQ.K : u < 0.05 ? HQ.Y : u < 0.35 ? HQ.K : HQ.Y));
    oval(g, c2[0], c2[1], l2 + 0.5, 5.4, Math.atan2(da[1], da[0]), HQ.Y, u => (u < -0.35 ? HQ.Y : u < 0.1 ? HQ.K : HQ.Y));
    tip = [c2[0] + da[0] * (l2 + 0.5), c2[1] + da[1] * (l2 + 0.5)];
  }
  { const nx = -da[1], ny = da[0]; // the sting: a pale needle, dark at the root
    fillPoly(g, [[tip[0] + nx * 1.8 - da[0], tip[1] + ny * 1.8 - da[1]], [tip[0] - nx * 1.8 - da[0], tip[1] - ny * 1.8 - da[1]], [tip[0] + da[0] * 6.5, tip[1] + da[1] * 6.5]], HQ.sting);
    fillPoly(g, [[tip[0] + nx * 1.8 - da[0], tip[1] + ny * 1.8 - da[1]], [tip[0] - nx * 1.8 - da[0], tip[1] - ny * 1.8 - da[1]], [tip[0] + da[0] * 1.5, tip[1] + da[1] * 1.5]], HQ.K[1]);
    if (drip) { const dx = tip[0] + da[0] * 7.5, dy = tip[1] + da[1] * 7.5; px(g, dx, dy, HQ.venom); px(g, dx, dy + 1, HQ.venom); px(g, dx, dy + 2, HQ.venom2); } }
  // ---- waist, thorax
  { const w = T(-7, 2); oval(g, w[0], w[1], 2.2, 1.8, rot, HQ.K); }
  { const t = T(0, 0); oval(g, t[0], t[1], 7, 6, rot, HQ.F, null, true); }
  // yellow markings on the thorax: the collar and the shield on her back
  fillPoly(g, P([[4, -5], [6, -3], [5, -1], [3, -3]]), HQ.Y[1]);
  fillPoly(g, P([[-4, -4], [-1, -5.5], [0, -4], [-3, -2.8]]), HQ.Y[2]);
  fillPoly(g, P([[-2, 1], [1, 0.5], [1, 2.5], [-1, 3]]), HQ.Y[0]);
  legSet(true);
  // ---- head: a yellow face, a great red eye, mandibles, elbowed antennae
  const hd = T(9, 1 + droop);
  oval(g, hd[0], hd[1], 5, 6, rot + 0.15, HQ.Y);
  { const tp = T(8, -3.5 + droop); oval(g, tp[0], tp[1], 4, 2.2, rot + 0.15, HQ.K); }
  { const e = T(8.2, -0.2 + droop); oval(g, e[0], e[1], 2.6, 4.2, rot + 0.2, HQ.E); px(g, e[0] - 1, e[1] - 2, HQ.E[3]); }
  // mandibles
  if (mouth) { fillPoly(g, P([[12, 4 + droop], [16, 3 + droop], [13, 5.5 + droop]]), HQ.K[1]); fillPoly(g, P([[12, 6 + droop], [15.5, 8.5 + droop], [11.5, 7.5 + droop]]), HQ.K[1]); }
  else { fillPoly(g, P([[11, 5 + droop], [14.5, 6 + droop], [11, 7.5 + droop]]), HQ.K[1]); }
  // antennae
  { const a0 = T(11.5, -3 + droop), a1 = T(14, -7 + droop), a2 = T(17.5, -6 + droop * 1.5); line(g, a0[0], a0[1], a1[0], a1[1], HQ.K[1]); line(g, a1[0], a1[1], a2[0], a2[1], HQ.K[1]); }
  // ---- the crown: gold, five points with a pearl on each, a red stone in front and blue ones either side
  { const cc = T(8 + crownDx, -5.5 + droop + crownDy), ct = Math.cos(rot + crownTilt), st = Math.sin(rot + crownTilt);
    const C2 = pts => pts.map(([x, y]) => [cc[0] + x * ct - y * st, cc[1] + x * st + y * ct]);
    const q = (x, y, col) => { const [X, Y] = C2([[x, y]])[0]; px(g, X, Y, col); };
    fillPoly(g, C2([[-6.5, 0.5], [6.5, 0.5], [6.5, -3.5], [-6.5, -3.5]]), HQ.G[1]);
    fillPoly(g, C2([[-6.5, 0.5], [6.5, 0.5], [6.5, -0.6], [-6.5, -0.6]]), HQ.G[0]);
    for (const [x, h] of [[-5.5, 3.5], [-2.8, 4.5], [0, 6.5], [2.8, 4.5], [5.5, 3.5]]) { fillPoly(g, C2([[x - 1.4, -3.4], [x + 1.4, -3.4], [x, -3.4 - h]]), HQ.G[1]); q(x - 0.5, -3.4 - h - 0.3, HQ.G[2]); }
    q(-5.5, -2.5, HQ.G[2]); q(-4.5, -2.5, HQ.G[2]); q(-3.5, -2.5, HQ.G[2]);
    q(-0.5, -2.2, HQ.gem2); q(0.5, -2.2, HQ.gem); q(-0.5, -1.2, HQ.gem); q(0.5, -1.2, HQ.gem); }
  wingsFor(true);
  if (o.stars) for (const [sx, sy] of o.stars) { px(g, sx, sy, HQ.G[2]); px(g, sx - 1, sy, HQ.G[1]); px(g, sx + 1, sy, HQ.G[1]); px(g, sx, sy - 1, HQ.G[1]); px(g, sx, sy + 1, HQ.G[1]); }
  return outline(c, OUT);
}

export function bakeQueen() {
  const W = 56, H = 36;
  const F = [
    queenFrame(W, H, { ox: 34, oy: 19, wing: 50 }),                                              // 0 flap up
    queenFrame(W, H, { ox: 34, oy: 18, wing: -22 }),                                             // 1 flap down
    queenFrame(W, H, { ox: 32, oy: 15, rot: -0.35, abd: 150, abdLen: 10, wing: 74, legs: 'tuck', mouth: 1 }), // 2 aim
    queenFrame(W, H, { ox: 31, oy: 17, rot: 0.65, abd: 2, wing: 14, wingLen: 15, legs: 'trail', mouth: 1 }),  // 3 dive
    queenFrame(W, H, { ox: 34, oy: 15, abd: 78, abdLen: 10, wing: 40, legs: 'tuck', mouth: 1, drip: 1 }),      // 4 volley
    queenFrame(W, H, { ox: 34, oy: 20, rot: 0.1, abd: 50, abdLen: 10, wing: 4, legs: 'brace' }), // 5 slam hang
    queenFrame(W, H, { ox: 34, oy: 27, rot: 0.12, abd: 4, wing: -6, wingLen: 13, legs: 'splay', droop: 1.5, crownTilt: 0.55, crownDx: 3, crownDy: 1.5, stars: [[40, 9], [47, 12], [34, 12]] }), // 6 winded
    queenFrame(W, H, { ox: 36, oy: 23, abd: 6, wing: 8, wingLen: 19, legs: 'trail', mouth: 1 }), // 7 sweep
  ];
  return pack(F, 28, H, 34, 18);
}

export function bakeChief() {
  const [c] = canvas(8, 8); return pack([c], 4, 8, 16, 18);
}
