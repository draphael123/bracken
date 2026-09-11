// queenchief.js — the first two bosses redrawn at boss size. Drop-in replacements for chars.js bakeQueen / bakeChief:
// same export names, same pack() shape ({ R, L, white, ax, ay, w, h }), same frame order and meaning. Both face right.
// Drawn with shaded primitives (like bakeKingBig / bakeGoblinQueen), 1px OUT outline, light from the upper left.
//
// THE HORNET QUEEN — bakeQueen()
//   frames : 0 flapUp, 1 flapDn (the idle/flying pair), 2 aim (reared, sting hooked forward under her), 3 dive (raked
//            head-down, wings swept), 4 volley (sting pointed at the floor, venom drip), 5 slamHang (wings flat, legs
//            braced), 6 winded (on the floor, wings drooped, crown knocked askew, stars), 7 sweep (low and level)
//   canvas : 56 x 42
//   anchor : ax 28, ay 35 — bottom-centre of her body, the same convention as before (e.y = the underside of her body).
//            Rows 36-41 hang below the anchor for dangling legs and the curled sting (aim, volley); the grounded frames
//            (6 winded, 3 dive) sit on row 35.
//   hitbox : w 40, h 20   (was 22 x 12)
//
// THE STOCKADE CHIEFTAIN — bakeChief()
//   frames : 0 stand, 1 walk, 2 raise, 3 slam, 4 sweep, 5 grab/reach, 6 guard, 7 slash, 8 bow/rain-aim, 9 leap/crouch,
//            10 stand2 (passing step), 11 gw, 12 gw2 (guard walk), 13 bw, 14 bw2 (bow walk)
//            club stance holds a nailed, iron-banded war club; sword stance a war-cleaver and a round iron-rimmed shield
//   canvas : 56 x 56 (the width is weapon reach: the club head lands ~ax+30 in slam and sweep; the body is ~24 wide,
//            ~41 px feet to helm, ~46 to the horn tips)
//   anchor : ax 19, ay 55 — between the feet, on the outline row under the boots (as before: ay = canvas height - 1)
//   hitbox : w 22, h 34   (was 16 x 18)
import { canvas, px, rect, line, circle, fillPoly, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(flipX), white = frames.map(c => whiten(c)), whiteL = white.map(flipX);
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}

// A rotated ellipse, every pixel shaded by where its surface faces: light comes from the upper left.
// ramp = [shadow, base, light, gloss?]; band(u) may return a different ramp along the long axis (u: -1 root .. +1 tip).
function oval(g, cx, cy, rx, ry, ang, ramp, band = null, dith = false, maxY = 1e9) {
  const R = Math.max(rx, ry) + 1, ca = Math.cos(ang), sa = Math.sin(ang);
  for (let y = Math.floor(cy - R); y <= Math.min(maxY, Math.ceil(cy + R)); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    const u = (dx * ca + dy * sa) / rx, v = (-dx * sa + dy * ca) / ry, r2 = u * u + v * v;
    if (r2 > 1) continue;
    const nl = [u / rx, v / ry], nw = [nl[0] * ca - nl[1] * sa, nl[0] * sa + nl[1] * ca], nm = Math.hypot(nw[0], nw[1]) || 1;
    const s = Math.sqrt(r2) * (-(nw[0] / nm) * 0.55 - (nw[1] / nm) * 0.83);
    const rp = band ? band(u, v) : ramp;
    let c = s > 0.62 && rp[3] ? rp[3] : s > 0.22 ? rp[2] : s < -0.42 ? rp[0] : rp[1];
    if (dith === 'fur') { const k = rp.indexOf(c); if (((x * 2 + y) % 5 === 0) && k > 0) c = rp[k - 1]; else if (((x * 3 + y * 2) % 7 === 0) && k < rp.length - 1 && k >= 1) c = rp[k + 1]; }
    else if (dith && c === rp[1] && s > 0.05 && ((x + y) & 1)) c = rp[2];
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
  oval(g, hd[0], hd[1], 5.5, 6.5, rot + 0.15, HQ.Y);
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
    for (const [x, h] of [[-4.6, 4.5], [0, 6.5], [4.6, 4.5]]) { fillPoly(g, C2([[x - 2.3, -3.4], [x + 2.3, -3.4], [x, -3.4 - h]]), HQ.G[1]); q(x, -3.4 - h - 0.6, HQ.G[2]); q(x - 1, -4.2, HQ.G[2]); }
    q(-5.5, -2.5, HQ.G[2]); q(-4.5, -2.5, HQ.G[2]); q(-3.5, -2.5, HQ.G[2]); q(-2.5, -2.5, HQ.G[2]);
    q(-0.5, -2.2, HQ.gem2); q(0.5, -2.2, HQ.gem); q(-0.5, -1.2, HQ.gem); q(0.5, -1.2, HQ.gem); }
  wingsFor(true);
  if (o.stars) for (const [sx, sy] of o.stars) { px(g, sx, sy, HQ.G[2]); px(g, sx - 1, sy, HQ.G[1]); px(g, sx + 1, sy, HQ.G[1]); px(g, sx, sy - 1, HQ.G[1]); px(g, sx, sy + 1, HQ.G[1]); }
  return outline(c, OUT);
}

export function bakeQueen() {
  const W = 56, H = 42, AY = 35; // rows below AY: dangling legs and a curled sting may hang under her hitbox
  const F = [
    queenFrame(W, H, { ox: 34, oy: 20, wing: 50 }),                                              // 0 flap up
    queenFrame(W, H, { ox: 34, oy: 19, wing: -22 }),                                             // 1 flap down
    queenFrame(W, H, { ox: 31, oy: 15, rot: -0.3, abd: 72, curl: 168, abdLen: 10.5, wing: 74, legs: 'tuck', mouth: 1 }), // 2 aim
    queenFrame(W, H, { ox: 31, oy: 20, rot: 0.65, abd: 2, wing: 14, wingLen: 15, legs: 'trail', mouth: 1 }),  // 3 dive
    queenFrame(W, H, { ox: 34, oy: 15, abd: 48, curl: 96, abdLen: 9.5, wing: 40, legs: 'tuck', mouth: 1, drip: 1 }), // 4 volley
    queenFrame(W, H, { ox: 34, oy: 18, rot: 0.1, abd: 36, abdLen: 10.5, wing: 4, legs: 'brace' }), // 5 slam hang
    queenFrame(W, H, { ox: 34, oy: 24, rot: 0.12, abd: 4, wing: -6, wingLen: 13, legs: 'splay', droop: 1.5, crownTilt: 0.35, crownDx: 2.5, crownDy: 0.5, stars: [[40, 6], [47, 9], [34, 9]] }), // 6 winded
    queenFrame(W, H, { ox: 36, oy: 22, abd: 6, wing: 8, wingLen: 19, legs: 'trail', mouth: 1 }), // 7 sweep
  ];
  return pack(F, 28, AY, 40, 20);
}

// ======================================================================================
// THE STOCKADE CHIEFTAIN
// ======================================================================================
const CK = {
  S: ['#3f6e2c', '#6faa4a', '#8fc85a'],              // skin
  SF: ['#2c4a1e', '#3f6e2c', '#5a8a3a'],             // far-side skin
  I: ['#3a3e48', '#5a6270', '#8a919c', '#c9d1dc'],   // iron
  H: ['#8a7a5a', '#c8b890', '#e8dcc0', '#fff6e0'],   // horn and bone
  HF: ['#5a4e3a', '#8a7a5a', '#b8a888'],             // far horn
  F: ['#4a3e32', '#6a5a48', '#8a7a68', '#a89a86'],   // fur
  R: ['#4a0e14', '#8f2f28', '#c9463d', '#e07060'],   // cloak red
  L: ['#2a1a10', '#4c2c17', '#6b4a2a', '#8a6a4a'],   // leather
  Wd: ['#3a2214', '#5c3a1d', '#8a5a32', '#a87a4a'],  // wood
  paint: '#c9463d', eye: '#ffd36b', pupil: '#ff4a3a', tusk: '#f3f0d2', gold: '#e0b040', gold2: '#a0781c', mouth: '#4a0e14', tongue: '#c9463d',
};
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const quad = (a, c, b, t) => lerp(lerp(a, c, t), lerp(c, b, t), t);
// a shaded capsule from p to q, `w` thick (limbs, shafts)
function seg(g, p, q, w, ramp, dith = false) {
  const dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy) || 1;
  oval(g, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, len / 2 + w * 0.35, w / 2, Math.atan2(dy, dx), ramp, null, dith);
}
// a horn (or bow limb): circles along a curve, thick at the root, lit from the upper left
function curve(g, a, c, b, r0, r1, ramp, rings = 0) {
  for (const pass of [0, 1, 2]) for (let t = 0; t <= 1.0001; t += 0.04) {
    const [x, y] = quad(a, c, b, t), r = r0 + (r1 - r0) * t;
    if (pass === 0) circle(g, x, y, r, ramp[0]);
    else if (pass === 1) circle(g, x - 0.4, y - 0.4, Math.max(0.5, r - 0.5), ramp[1]);
    else if (r > 1.2) circle(g, x - 0.8, y - 0.8, Math.max(0.4, r - 1.3), ramp[2]);
  }
  if (rings) for (let t = 0.2; t < 0.8; t += rings) { const [x, y] = quad(a, c, b, t); px(g, x, y, ramp[0]); px(g, x + 1, y, ramp[0]); }
}

// Each part is drawn on its own layer and outlined before it is laid down, so the near arm, the head and the
// pelt read against the body the way a hand-drawn sprite's inner lines do.
function chiefFrame(W, H, o) {
  const { ax, F, legs = 'stand', dy = 0, lean = 0, mouth = 'grim', near, far, club = null, sword = null, shield = null, bow = null, nearOpen = false, farClub = null } = o;
  const X = ax, Y = F + dy; // body origin: between the feet, on the floor (the body drops, the feet stay put)
  const hx = Math.round(X + 7 + lean), hy = Math.round(Y - 33); // head centre
  const shN = [X + 6 + lean * 0.7, Y - 25], shF = [X - 5 + lean * 0.7, Y - 26];
  const [out, go] = canvas(W, H);
  let g = null;
  const layer = (fn, ol) => { const [lc, lg] = canvas(W, H); g = lg; fn(); if (ol) outline(lc, ol); go.drawImage(lc, 0, 0); };

  const arm = (sh, el, hd, pal, open, bracer = true) => {
    seg(g, sh, el, 8, pal);
    seg(g, el, hd, 7, pal);
    if (bracer) { seg(g, lerp(el, hd, 0.4), lerp(el, hd, 0.8), 7.6, CK.L); const m = lerp(el, hd, 0.6); px(g, m[0], m[1], CK.gold); }
    fist(hd, el, pal, open);
  };
  const fist = (hd, el, pal, open) => {
    if (open) { circle(g, hd[0], hd[1], 3, pal[1]); const d = [hd[0] - el[0], hd[1] - el[1]], n = Math.hypot(d[0], d[1]) || 1, ux = d[0] / n, uy = d[1] / n;
      for (const k of [-2.2, 0, 2.2]) { const s = [hd[0] + ux * 2 - uy * k, hd[1] + uy * 2 + ux * k]; line(g, s[0], s[1], s[0] + ux * 3, s[1] + uy * 3, pal[1]); px(g, s[0] + ux * 4, s[1] + uy * 4, CK.H[2]); } }
    else { circle(g, hd[0], hd[1], 3.3, pal[1]); circle(g, hd[0] - 0.8, hd[1] - 0.8, 1.7, pal[2]); px(g, hd[0] + 1, hd[1] + 1.5, pal[0]); px(g, hd[0] + 2, hd[1] + 0.5, pal[0]); }
  };
  const drawClub = (hd, ang, len = 15) => { // a knotted war club, iron-banded and nailed, gripped at `hd`
    const u = [Math.cos(ang), Math.sin(ang)], at = t => [hd[0] + u[0] * t, hd[1] + u[1] * t], nrm = [-u[1], u[0]];
    seg(g, at(-3), at(len * 0.7), 3.2, CK.Wd);
    for (const k of [-1, 1]) for (const t of [0.72, 0.95]) { const s = at(len * t); fillPoly(g, [[s[0] + nrm[0] * k * 3 - u[0] * 1.2, s[1] + nrm[1] * k * 3 - u[1] * 1.2], [s[0] + nrm[0] * k * 3 + u[0] * 1.2, s[1] + nrm[1] * k * 3 + u[1] * 1.2], [s[0] + nrm[0] * k * 6.5, s[1] + nrm[1] * k * 6.5]], CK.I[2]); }
    const e = at(len + 0.5); fillPoly(g, [[e[0] - nrm[0] * 1.3, e[1] - nrm[1] * 1.3], [e[0] + nrm[0] * 1.3, e[1] + nrm[1] * 1.3], [e[0] + u[0] * 3.5, e[1] + u[1] * 3.5]], CK.I[2]);
    const hc = at(len * 0.8); oval(g, hc[0], hc[1], len * 0.3, 4.3, ang, CK.Wd, null, true);
    seg(g, at(len * 0.6), at(len * 0.63), 8.4, CK.I);
    px(g, ...at(-3), CK.I[3]);
  };
  const drawSword = (hd, ang) => { // a goblin war-cleaver: a broad slab of a blade, the edge on the underside
    const u = [Math.cos(ang), Math.sin(ang)], n = [-u[1], u[0]], at = (t, s) => [hd[0] + u[0] * t + n[0] * s, hd[1] + u[1] * t + n[1] * s];
    seg(g, at(-3.5, 0), at(1.5, 0), 3, CK.L);
    fillPoly(g, [at(2.5, -1.8), at(2.5, 2.2), at(13, 4), at(17.5, 3.2), at(18.5, -1.8)], CK.I[2]);
    fillPoly(g, [at(2.5, -1.8), at(18.5, -1.8), at(18.5, -0.7), at(2.5, -0.7)], CK.I[3]);
    line(g, ...at(4, 2), ...at(13, 3.3), CK.I[1]);
    seg(g, at(1.8, -3.8), at(1.8, 4.2), 2.4, CK.I);
    px(g, ...at(-4.5, 0), CK.gold);
  };

  // ---------- 1. the cloak and the far arm (and anything in the far hand), behind the body
  layer(() => {
    const hem = F - 4, pts = [[X - 7 + lean * 0.5, Y - 28], [X + 1 + lean * 0.5, Y - 29], [X + 1, hem - 2]];
    for (let x = X + 1, k = 0; x >= X - 13; x -= 2.4, k++) pts.push([x, hem + (k & 1 ? 2 : 0)]);
    pts.push([X - 13, hem - 3], [X - 10, Y - 19]);
    fillPoly(g, pts, CK.R[1]);
    fillPoly(g, [[X - 7 + lean * 0.5, Y - 28], [X - 4, Y - 27], [X - 9, hem], [X - 12, hem - 2], [X - 10, Y - 19]], CK.R[0]);
    line(g, X - 4, Y - 22, X - 6, hem - 1, CK.R[2]);
    if (far) arm(shF, far[0], far[1], CK.SF, false, !(sword || farClub));
    if (sword) drawSword(sword.at, sword.ang);
    if (farClub) drawClub(farClub.at, farClub.ang, farClub.len);
    if (far && (sword || farClub)) fist(far[1], far[0], CK.SF, false);
  }, OUT);
  // ---------- 2. legs, kilt, torso (one mass: the final outline takes care of its edge)
  layer(() => {
    const LEG = { stand: [[X - 4, X - 6, X - 6], [X + 4, X + 6, X + 6]], stride: [[X - 4, X - 7, X - 9], [X + 4, X + 7, X + 8]], pass: [[X - 3, X - 3, X - 3], [X + 3, X + 4, X + 3]], crouch: [[X - 4, X - 11, X - 9], [X + 4, X + 11, X + 9]] }[legs];
    const kneeY = legs === 'crouch' ? F - 8 : F - 6;
    LEG.forEach(([hipX, kneeX, footX], i) => {
      const pal = i === 0 ? CK.SF : CK.S, hip = [hipX, Y - 10], knee = [kneeX, kneeY], ank = [footX, F - 3];
      seg(g, hip, knee, 7.5, pal); seg(g, knee, ank, 6.5, pal);
      oval(g, footX + 1.5, F - 1.5, 4.8, 2.4, 0, i === 0 ? [CK.L[0], CK.L[0], CK.L[1]] : CK.L);
      rect(g, footX - 3, F - 1, 9, 1, CK.L[0]);
      seg(g, [footX - 3, F - 4], [footX + 3, F - 4], 3.2, i === 0 ? [CK.F[0], CK.F[0], CK.F[1]] : CK.F, true);
    });
    // kilt of leather strips, a belt with a gold buckle, a skull hung at each hip
    const top = Y - 14, bot = Y - 7;
    fillPoly(g, [[X - 9, top], [X + 10, top], [X + 11, bot], [X - 10, bot]], CK.L[1]);
    for (let x = X - 8; x <= X + 10; x += 3) { line(g, x, top + 2, x, bot - 1, CK.L[0]); px(g, x + 1, top + 3, CK.L[2]); }
    for (let x = X - 9, k = 0; x <= X + 10; x += 3, k++) px(g, x + 1, bot, k & 1 ? CK.L[0] : CK.L[1]);
    fillPoly(g, [[X - 9, top - 0.5], [X + 10, top - 0.5], [X + 10, top + 2], [X - 9, top + 2]], CK.L[0]);
    // the torso: a barrel of green with a belly, a strap across it, war paint on the chest
    oval(g, X + 1 + lean * 0.5, Y - 21, 10, 8.5, 0, CK.S);
    oval(g, X + 3.5 + lean * 0.5, Y - 17.5, 6.5, 4, 0, [CK.S[0], CK.S[1], CK.S[2]]);
    line(g, X + 7 + lean * 0.5, Y - 26, X - 6, Y - 14, CK.L[0], 2); line(g, X + 7 + lean * 0.5, Y - 27, X - 6, Y - 15, CK.L[2]);
    line(g, X + 1 + lean * 0.5, Y - 18, X + 9 + lean * 0.5, Y - 17, CK.S[0]);
    for (const k of [0, 3, 6]) { const x0 = X + 2 + k + lean * 0.5; line(g, x0 + 1, Y - 23, x0 - 1, Y - 19, CK.paint); line(g, x0 + 2, Y - 23, x0, Y - 19, CK.paint); }
    rect(g, X + 3, top - 0.5, 4, 3, CK.gold); rect(g, X + 4, top + 0.5, 2, 1, CK.gold2);
    const skull = (sx, sy, pal) => { oval(g, sx, sy, 2.6, 2.4, 0, pal); rect(g, sx - 1.5, sy + 1.5, 3, 1.5, pal[1]); px(g, sx - 1.2, sy - 0.2, OUT); px(g, sx + 0.8, sy - 0.2, OUT); px(g, sx - 0.2, sy + 1.8, pal[0]); };
    skull(X + 9, top + 5, CK.H); skull(X - 7, top + 5, CK.HF);
  }, null);
  // ---------- 3. the fur mantle: a wolf pelt heaped on the shoulders, shaggy at the edge
  layer(() => {
    const L0 = lean * 0.7;
    oval(g, X - 1.5 + L0, Y - 27, 10, 3.6, -0.06, CK.F, null, 'fur');
    for (let x = X - 10.5, k = 0; x <= X + 8; x += 2, k++) { const yy = Y - 25 + (k % 3 === 1 ? 1 : 0) + (k % 3 === 2 ? -0.5 : 0); fillPoly(g, [[x - 1.2, yy - 2], [x + 1.2, yy - 2], [x + 0.4, yy + 1.8]], CK.F[k & 1 ? 1 : 0]); }
    for (let x = X - 8, k = 0; x <= X + 6; x += 3, k++) px(g, x + L0, Y - 29 - (k & 1), CK.F[3]);
  }, '#2a2018');
  const nearLayer = () => layer(() => {
    if (club) drawClub(club.at, club.ang, club.len);
    if (bow) { const [gx, gy] = bow.at, top = [gx - 4, gy - 12], bot = [gx - 4, gy + 12], dr = bow.draw;
      line(g, top[0], top[1], dr[0], dr[1], CK.H[2]); line(g, bot[0], bot[1], dr[0], dr[1], CK.H[2]);
      curve(g, top, [gx + 4, gy], bot, 1.3, 1.3, CK.Wd);
      circle(g, top[0], top[1], 1, CK.H[1]); circle(g, bot[0], bot[1], 1, CK.H[1]);
      line(g, dr[0], dr[1], gx + 8, gy, CK.Wd[2]); fillPoly(g, [[gx + 7, gy - 2], [gx + 11, gy + 0.5], [gx + 7, gy + 2.5]], CK.I[3]);
      rect(g, dr[0] - 2, dr[1] - 1, 3, 1, CK.R[2]); rect(g, dr[0] - 2, dr[1] + 1, 3, 1, CK.R[2]); }
    if (near) arm(shN, near[0], near[1], CK.S, nearOpen, !shield);
    if (shield) { const [sx, sy] = shield;
      circle(g, sx, sy, 8, CK.I[0]); circle(g, sx - 0.4, sy - 0.4, 7.4, CK.I[1]);
      oval(g, sx, sy, 6.2, 6.2, 0, CK.R, null, true);
      line(g, sx - 5, sy, sx + 5, sy, CK.R[0]); line(g, sx, sy - 5, sx, sy + 5, CK.R[0]);
      oval(g, sx, sy, 2.4, 2.4, 0, CK.I); px(g, sx - 1, sy - 1, CK.I[3]);
      for (const [a, b] of [[0, -7], [7, 0], [0, 7], [-7, 0], [5, -5], [5, 5], [-5, 5], [-5, -5]]) px(g, sx + a * 0.95, sy + b * 0.95, CK.I[3]); }
    oval(g, shN[0] + 1, shN[1] - 1, 5, 4, 0.3, CK.F, null, 'fur'); for (const k of [-2, 0, 2]) px(g, shN[0] + 1 + k, shN[1] + 3, CK.F[1]);
    px(g, shN[0] + 3, shN[1] + 2, CK.F[0]); px(g, shN[0] - 1, shN[1] + 3, CK.F[0]); px(g, shN[0], shN[1] - 3, CK.F[3]);
  }, OUT);
  if (o.armsBack) nearLayer();
  // ---------- 4. the head: far horn and ear, a jutting jaw with tusks, a hooked nose, a red war-paint mask, the horned helm
  layer(() => {
    curve(g, [hx - 3, hy - 4], [hx - 11, hy - 5], [hx - 9, hy - 12], 2.1, 0.7, CK.HF, 0.2);
    fillPoly(g, [[hx - 4, hy - 1], [hx - 13, hy - 4], [hx - 4, hy + 3]], CK.S[1]); fillPoly(g, [[hx - 5, hy], [hx - 10, hy - 3], [hx - 5, hy + 2]], CK.S[0]);
    oval(g, hx, hy, 6.2, 5.6, 0, CK.S);
    oval(g, hx + 2, hy + 3.5, 5.6, 3, 0.1, [CK.S[0], CK.S[1], CK.S[1]]);
    rect(g, hx - 4, hy - 1, 9, 2, CK.paint); rect(g, hx - 3, hy + 1, 2, 1, CK.paint); // the red mask across the eyes, a drip under it
    rect(g, hx + 1, hy - 1, 3, 2, CK.eye); px(g, hx + 3, hy - 1, CK.pupil); px(g, hx + 3, hy, CK.pupil);
    fillPoly(g, [[hx + 4.5, hy - 1.5], [hx + 10, hy + 2.5], [hx + 5.5, hy + 3]], CK.S[1]); line(g, hx + 6, hy + 2.5, hx + 9, hy + 2.5, CK.S[0]); px(g, hx + 6, hy - 0.5, CK.S[2]); // nose
    if (mouth === 'roar') { fillPoly(g, [[hx + 0.5, hy + 3], [hx + 8, hy + 2.5], [hx + 7, hy + 7], [hx + 1.5, hy + 6.5]], CK.mouth); rect(g, hx + 3, hy + 5, 3, 1, CK.tongue);
      rect(g, hx + 1, hy + 3, 1, 2, CK.tusk); rect(g, hx + 6, hy + 3, 1, 1, CK.tusk); rect(g, hx + 2, hy + 5.5, 1, 1, CK.tusk); rect(g, hx + 6, hy + 5.5, 1, 1, CK.tusk); }
    else { line(g, hx + 1, hy + 4.5, hx + 7, hy + 4, CK.mouth); rect(g, hx + 6, hy + 2, 1, 2.5, CK.tusk); rect(g, hx + 2, hy + 2.5, 1, 2, CK.tusk); px(g, hx + 6, hy + 1.5, CK.H[2]); }
    // the helm sits down to the brow
    oval(g, hx - 0.5, hy - 2, 7.6, 5.6, 0, CK.I, null, false, hy - 2);
    rect(g, hx - 8, hy - 3, 16, 2, CK.I[1]); rect(g, hx - 8, hy - 3, 16, 1, CK.I[2]); for (let x = hx - 6; x < hx + 8; x += 3) px(g, x, hy - 3, CK.I[3]);
    rect(g, hx + 4, hy - 2, 2, 3, CK.I[1]); px(g, hx + 4, hy - 1, CK.I[2]); // nasal
    rect(g, hx - 2, hy - 8, 2, 1, CK.I[3]); // a glint on the dome
    curve(g, [hx + 3, hy - 4], [hx + 11, hy - 5], [hx + 9, hy - 12], 2.4, 0.7, CK.H, 0.2);
  }, OUT);
  // ---------- 5. the near arm and what it holds, and the wolf-head pauldron over its root
  if (!o.armsBack) nearLayer();
  return outline(out, OUT);
}

export function bakeChief() {
  const W = 56, H = 56, ax = 19, F = H - 2; // feet on row F; the outline under them is row H-1, the anchor
  const X = ax, Yb = F;
  const S = (dy = 0) => { const Y = Yb + dy; return { near: [[X + 10, Y - 18], [X + 13, Y - 12]], far: [[X - 8, Y - 20], [X - 9, Y - 13]], club: { at: [X + 13, Y - 12], ang: 0.95, len: 14 } }; };
  const GUARD = (dy = 0) => { const Y = Yb + dy; return { near: [[X + 10, Y - 17], [X + 12, Y - 20]], shield: [X + 13, Y - 19], far: [[X + 6, Y - 22], [X + 15, Y - 27]], sword: { at: [X + 15, Y - 27], ang: -1.0 } }; };
  const BOW = (dy = 0) => { const Y = Yb + dy; return { near: [[X + 12, Y - 23], [X + 17, Y - 23]], far: [[X + 1, Y - 20], [X + 6, Y - 26]], bow: { at: [X + 17, Y - 23], draw: [X + 6, Y - 26] } }; };
  const f = o => chiefFrame(W, H, Object.assign({ ax, F }, o));
  const Y = Yb;
  const frames = [
    f({ legs: 'stand', ...S() }),                                                                                         // 0 stand
    f({ legs: 'stride', ...S() }),                                                                                        // 1 walk
    f({ legs: 'stand', mouth: 'roar', lean: -1, armsBack: true, near: [[X + 13, Y - 32], [X + 10, Y - 40]], far: [[X + 1, Y - 33], [X + 8, Y - 40]], club: { at: [X + 9, Y - 40], ang: -2.75, len: 14 } }), // 2 raise
    f({ legs: 'stride', dy: 2, lean: 3, mouth: 'roar', near: [[X + 14, Y - 16], [X + 16, Y - 9]], far: [[X + 8, Y - 15], [X + 14, Y - 9]], club: { at: [X + 16, Y - 9], ang: 0.5, len: 14 } }), // 3 slam
    f({ legs: 'stride', lean: 2, near: [[X + 13, Y - 22], [X + 17, Y - 21]], far: [[X - 7, Y - 23], [X - 10, Y - 17]], club: { at: [X + 17, Y - 21], ang: -0.05, len: 14 } }), // 4 sweep
    f({ legs: 'stride', lean: 3, mouth: 'roar', near: [[X + 14, Y - 23], [X + 20, Y - 24]], nearOpen: true, far: [[X - 8, Y - 20], [X - 9, Y - 14]], farClub: { at: [X - 9, Y - 14], ang: -1.72, len: 13 } }), // 5 grab
    f({ legs: 'stand', ...GUARD() }),                                                                                     // 6 guard
    f({ legs: 'stride', lean: 2, near: [[X + 8, Y - 16], [X + 9, Y - 19]], shield: [X + 9, Y - 18], far: [[X + 5, Y - 21], [X + 13, Y - 23]], sword: { at: [X + 13, Y - 23], ang: 0 } }), // 7 slash
    f({ legs: 'stand', ...BOW() }),                                                                                       // 8 bow / rain-aim
    f({ legs: 'crouch', dy: 5, lean: 2, mouth: 'roar', near: [[X + 12, Y - 12], [X + 13, Y - 6]], far: [[X - 9, Y - 13], [X - 10, Y - 7]] }), // 9 leap/crouch
    f({ legs: 'pass', dy: 1, ...S(1) }),                                                                                  // 10 stand2 (the passing step)
    f({ legs: 'stride', ...GUARD() }),                                                                                    // 11 guard walk
    f({ legs: 'pass', dy: 1, ...GUARD(1) }),                                                                              // 12 guard walk 2
    f({ legs: 'stride', ...BOW() }),                                                                                      // 13 bow walk
    f({ legs: 'pass', dy: 1, ...BOW(1) }),                                                                                // 14 bow walk 2
  ];
  return pack(frames, ax, H - 1, 22, 34);
}
