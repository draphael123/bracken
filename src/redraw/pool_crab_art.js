// pool_crab_art.js - THE TIDE-POOL CRAB, THE HAND-DRAWN POSE SET (claude/saltart, 2026-11-13). The greybox (src/longwater3-hands.js) drew it as red rectangles. ART ONLY: no timing, hp, damage
// or hitbox is touched (src/pool-crab.js is not edited). Same method as claude/srart: separate OUTLINED MASSES (far claw + legs behind, the shell, the eye-stalks, the near claw in front),
// every TELL changes the SILHOUETTE. Pure drawing, fillRect only. g = a 2d context, (x, y) = the feet, f = facing (+1 right), o = { mode, hurtT, flash, modeT, seed, bodyOnly }.
// THE POSES (CRAB_POSE_SET; keys = the crab's modes, src/pool-crab.js):
//   walk         sideways scuttle: shell low and wide, claws held half-open at the front, four legs stepping
//   pinchTell !  (0.5 s) REARED: the near claw thrown straight up over the head, wide open, the shell tipped back on its rear legs, eyes flared white  ->
//   pinch        SNAPPED SHUT forward: the arm locked out flat to full reach, the claw closed, speed streaks, the shell lunged low
//   rec          after a pinch: the claw hangs OPEN and low (the soft pale joint showing: the opening), the shell slumped, eyes dim - the gold ring is the hands'
//   flipped      belly up: pale plastron, legs and claws curled in the air, flailing
//   buried       two eye-stalks over a boil of sand            emerge  the shell heaving out of the sand, grains falling       digTell  sinking: sand thrown up both sides
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp, lerp } from './sr_draw.js';
const R = Math.round;
export const CP = {
  out: '#1a0e0c', shell: ['#4a1e1a', '#7a3026', '#a8402e', '#d0604a'], shellHi: '#f09478', under: ['#c8a888', '#e8c8a8', '#f4e2cc'], tip: ['#e8dcc0', '#fff4dc'], soft: '#e8b8a0',
  eye: '#101214', eyeW: '#f6fbfc', eyeHot: '#fff3bc', sand: ['#7a6c4e', '#a8986c', '#cfc29a', '#e8dcb2'], barn: ['#e4e6da', '#a8aca0'], weed: ['#244a30', '#3a6a42', '#5c9250'], gold: '#ffd36b',
};
/* pose: b = body centre, rot (deg, + tips the front down), tall = rear (shell raised), near / far claw = { s: shoulder, e: elbow, w: wrist, open 0..1, up (claw's axis in deg) }, legs = [dx phase], belly (upside down), stalk (eye-stalk height) */
const POSE = {
  walk:      { b: [0, -5], rot: 0, near: { s: [5, -4], e: [9, -6], w: [12, -6], open: 0.4, ax: -8 }, far: { s: [3, -5], e: [7, -9], w: [10, -9], open: 0.4, ax: -10 }, step: 1, stalk: 3, eye: 'calm' },
  pinchTell: { b: [-2, -7], rot: -22, near: { s: [3, -8], e: [4, -16], w: [3, -22], open: 1, ax: -86 }, far: { s: [1, -7], e: [6, -11], w: [9, -11], open: 0.6, ax: -20 }, step: 0, stalk: 4, eye: 'flare', rear: true },
  pinch:     { b: [3, -4], rot: 10, near: { s: [6, -4], e: [14, -4], w: [20, -4], open: 0, ax: 0 }, far: { s: [4, -5], e: [7, -8], w: [9, -9], open: 0.3, ax: -20 }, step: 0, stalk: 2, eye: 'flare', fx: 'speed' },
  rec:       { b: [1, -3.5], rot: 8, near: { s: [6, -3], e: [10, -2], w: [13, -2], open: 1, ax: 14, soft: true }, far: { s: [3, -4], e: [6, -5], w: [8, -4], open: 0.5, ax: 10 }, step: 0, stalk: 1, eye: 'dim', gape: true },
  flipped:   { b: [0, -4], rot: 0, near: { s: [5, -2], e: [10, -9], w: [12, -13], open: 0.5, ax: -60 }, far: { s: [-4, -2], e: [-9, -9], w: [-11, -13], open: 0.5, ax: -120 }, step: 2, stalk: 0, eye: 'closed', belly: true },
  hurt:      { b: [-1, -6], rot: -14, near: { s: [3, -6], e: [5, -12], w: [4, -15], open: 0.8, ax: -80 }, far: { s: [1, -6], e: [4, -11], w: [5, -13], open: 0.8, ax: -70 }, step: 0, stalk: 3, eye: 'closed' },
};
export const CRAB_POSE_SET = { ...POSE, buried: {}, emerge: {}, digTell: {} };
export const CRAB_MODE_POSE = { walk: 'walk', pinchTell: 'pinchTell', pinch: 'pinch', rec: 'rec', flipped: 'flipped', buried: 'buried', emerge: 'emerge', digTell: 'digTell' };
export const poseOfCrab = (mode, o = {}) => (o.hurtT > 0 && (mode === 'walk' || !mode)) ? 'hurt' : (CRAB_MODE_POSE[mode] || 'walk');

let g_, X_, Y_, F_ = 1, TINT_ = 0, AL_ = 1;
const rc = (dx, dy, w, h, c, a = 1) => { const al = a * AL_; if (al !== 1) g_.globalAlpha = al; g_.fillStyle = TINT_ > 0 ? mixC(c, '#ffffff', TINT_) : c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); if (al !== 1) g_.globalAlpha = 1; };
const FL = L => flush(L, rc, CP.out);
const hs = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };

/* the claw: arm from the shoulder through the elbow to the wrist, then a palm and two pincers opened `open` (0 shut .. 1 gaping) along axis ax (deg, 0 = forward, -90 = up) */
function claw(L, C, big, belly) {
  const sh = CP.shell, un = CP.under, col = belly ? un : sh;
  cap(L, C.s[0], C.s[1], C.e[0], C.e[1], 1.5, 1.3, col); cap(L, C.e[0], C.e[1], C.w[0], C.w[1], 1.4, 1.8 * big, col);
  const a = C.ax * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), px = C.w[0], py = C.w[1], op = C.open * 0.9;
  ell(L, px + ca * 2 * big, py + sa * 2 * big, 2.8 * big, 2.2 * big, col, { rot: C.ax });
  for (const sgn of [-1, 1]) { const aa = a + sgn * op * 0.55 - sgn * 0.12, len = 5.6 * big, x1 = px + ca * 2 * big + Math.cos(aa) * len, y1 = py + sa * 2 * big + Math.sin(aa) * len;
    cap(L, px + ca * 2.2 * big, py + sa * 2.2 * big, x1, y1, 1.8 * big, 0.7, col); pset(L, x1, y1, CP.tip[1]); pset(L, x1 - ca, y1 - sa, CP.tip[0]); }
  if (C.soft) { pset(L, px + 1, py + 1, CP.soft); pset(L, px + 2, py + 1, CP.soft); pset(L, px + 1, py, CP.soft); }
  return { tip: [px + ca * 6 * big, py + sa * 6 * big] };
}
export function drawCrab(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; AL_ = o.alpha ?? 1; TINT_ = o.flash > 0 || o.flashT > 0 ? 0.5 : 0; o = { seed: 0, ...o };
  const key = o.pose || poseOfCrab(o.mode, o), tm = time + (o.seed || 0), body = !!o.bodyOnly;
  if (key === 'buried') return drawBuried(tm, o); if (key === 'emerge') return drawEmerge(tm, o); if (key === 'digTell') return drawDig(tm, o);
  const P = o.P || POSE[key] || POSE.walk, sh = CP.shell, belly = !!P.belly, base = belly ? CP.under : sh;
  const ph = (key === 'walk' && !o.still) ? Math.sin(tm * 14) : 0, ph2 = key === 'flipped' ? Math.sin(tm * 12) : 0;
  const [bx, by] = P.b, rot = P.rot, ca = Math.cos(rot * Math.PI / 180), sa = Math.sin(rot * Math.PI / 180);
  /* ---- the far side: far claw and far legs (their own mass, behind) ---- */
  const F = new Layer();
  if (!body || true) { for (const [dx, k] of [[-4, 1], [-1, -1], [2, 1]]) { const lx = bx + dx - 1, up = P.step === 1 ? ph * k * 1.5 : 0; cap(F, lx, by + 1, lx - 2 + up, by + 3.5, 0.8, 0.7, [sh[0], sh[1]]); pset(F, lx - 2 + up, by + 4, sh[0]); } }
  claw(F, P.far, 0.8, belly); FL(F);
  /* ---- the near legs, the shell, the stalks and eyes, the near claw ---- */
  const N = new Layer();
  if (belly) { for (let i = 0; i < 4; i++) { const lx = bx - 5 + i * 3.4, wv = ph2 * (i & 1 ? 1 : -1) * 2.2; cap(N, lx, by - 1, lx + (i < 2 ? -2 : 2) + wv, by - 8 - (i & 1) * 2, 0.9, 0.7, CP.under); pset(N, lx + (i < 2 ? -2 : 2) + wv, by - 9 - (i & 1) * 2, CP.tip[0]); } }
  else for (let i = 0; i < 4; i++) { const lx = bx - 5 + i * 3.3, up = P.step === 1 ? ph * (i & 1 ? 1 : -1) * 1.8 : 0, rear = P.rear && i < 2 ? 1.5 : 0;
    const fx = lx + (i < 2 ? -1.5 : 1.5) + up, fy = P.rear ? -0.5 : 0; cap(N, lx, by + 2, fx, fy - rear, 1, 0.8, [sh[0], sh[1], sh[2]]); pset(N, fx, fy + 0.5 - rear, CP.tip[0]); }
  ell(N, bx, by, 6.6, 3.7 + (key === 'rec' ? -0.3 : 0), belly ? CP.under : sh, { rot, belly: belly ? null : [sh[3], sh[2]], bc: 0.99 });
  if (!belly) { ell(N, bx - 1, by - 1.4, 4.4, 1.5, [sh[2], sh[3], CP.shellHi], { rot }); pset(N, bx + 2, by - 1, sh[0]); pset(N, bx - 3, by - 1, sh[0]); }   /* a lit carapace crest and two grooves */
  else { for (let i = -2; i <= 2; i++) pset(N, bx + i * 2, by, CP.under[0]); line(N, bx - 4, by - 1, bx + 4, by - 1, CP.under[0]); }
  if (!belly) { pset(N, bx - 4, by - 2, CP.barn[0]); pset(N, bx - 3, by - 3, CP.barn[1]); pset(N, bx - 5, by - 1, CP.barn[1]); pset(N, bx + 3, by - 3, CP.weed[1]); pset(N, bx + 3, by - 4, CP.weed[2]); }   /* a barnacle and a weed tuft on the shell */
  const e0x = bx + 3.2 * ca - (-2.2) * sa, e0y = by - 2.2 * ca + 3.2 * sa;   /* eye-stalk root */
  const st = P.stalk; if (st > 0) for (const [d, k] of [[0, 1], [2.4, 1.3]]) { cap(N, e0x + d - 1, e0y, e0x + d - 1 + (P.rear ? -1 : 0.5), e0y - st * k, 0.7, 0.9, CP.under); }
  FL(N);
  const eyes = (px_, py_) => { rect_(px_, py_, 2, 2, o.eye === 'x' ? CP.eye : (P.eye === 'closed' ? sh[0] : P.eye === 'flare' ? CP.eyeHot : P.eye === 'dim' ? '#303438' : CP.eye)); if (P.eye !== 'closed') rect_(px_, py_, 1, 1, P.eye === 'flare' ? CP.eyeW : '#9aa4a8'); };
  const rect_ = (a, b, w, h, c) => rc(a, b, w, h, c);
  if (st > 0) { eyes(e0x - 1, e0y - st * 1 - 2); eyes(e0x + 1.4, e0y - st * 1.3 - 2); }
  const NC = new Layer(); const tipN = claw(NC, P.near, 1, belly); FL(NC);
  if (P.gape) { rc(bx + 3, by + 1, 3, 1, CP.soft); rc(bx + 4, by + 2, 2, 1, CP.soft); }                       /* the soft pale underside showing while it is open */
  if (P.eye === 'flare') { rc(bx + 4, by - 6.5, 1, 1, CP.eyeHot); }
  if (P.fx === 'speed') { for (let i = 0; i < 4; i++) rc(-12 - i * 3, by - 5 + i * 2, 5, 1, '#dff2f8', 0.6 - i * 0.12); }
  if (o.tellFlash && Math.sin(tm * 24) > 0) rc(tipN.tip[0] - 1, tipN.tip[1] - 2, 3, 3, CP.gold, 0.8);
  void lerp; void clamp;
}
function drawBuried(t, o) {
  const k = o.k ?? 1;   /* two eye-stalks over a low boil of sand */
  const L = new Layer(); poly(L, [[-8, 0], [-6, -2], [-2, -3], [2, -3], [6, -2], [8, 0]], CP.sand[1]); for (let i = -6; i <= 6; i += 2) pset(L, i, -2 + (hs(i, 3) & 1), CP.sand[(hs(i, 5) & 1) ? 2 : 3]); flush(L, rc, '#3a3224');
  for (const dx of [-3, 2]) { const w = Math.round(Math.sin(t * 3 + dx) * 0.8); rc(dx + w, -7, 1, 4, CP.under[0]); rc(dx + w - (dx < 0 ? 0 : 0), -9, 2, 2, CP.eye); rc(dx + w, -9, 1, 1, CP.eyeW); }
  for (let i = 0; i < 3; i++) rc(-5 + i * 4 + Math.sin(t * 2 + i) * 1, -4 - ((t * 5 + i * 2) % 3), 1, 1, CP.sand[3], 0.7);
  void k;
}
function drawEmerge(t, o) {
  const k = clamp(o.k ?? 0.5);   /* the shell heaving up out of a boil: k 0 = under .. 1 = up */
  g_.save && 0; const L = new Layer(); const lift = 3 - 3 * k; ell(L, 0, -4 + lift, 6.2, 3.4, [CP.shell[0], CP.shell[1], CP.shell[2], CP.shell[3]], { belly: null }); ell(L, -1, -5.4 + lift, 4, 1.4, [CP.shell[2], CP.shell[3], CP.shellHi]); flush(L, rc, CP.out);
  for (const dx of [-3, 2]) { rc(dx, -9 + lift, 1, 3, CP.under[0]); rc(dx, -11 + lift, 2, 2, CP.eye); rc(dx, -11 + lift, 1, 1, CP.eyeW); }
  const S = new Layer(); poly(S, [[-9, 0], [-7, -2], [-4, -4 + lift * 0.5], [4, -4 + lift * 0.5], [7, -2], [9, 0]], CP.sand[1]); for (let i = -7; i <= 7; i += 2) pset(S, i, -2 + (hs(i, 3) & 1), CP.sand[(hs(i, 7) & 1) ? 2 : 3]); flush(S, rc, '#3a3224');
  for (let i = 0; i < 6; i++) rc(-8 + i * 3 + Math.sin(t * 9 + i) * 1.5, -6 - ((t * 24 + i * 5) % 8), 1, 1, CP.sand[(i & 1) + 2]);
}
function drawDig(t, o) {
  const k = clamp(o.k ?? 0.5);   /* sinking: the shell lowers, sand thrown up both sides */
  const L = new Layer(), sink = k * 4; ell(L, 0, -4 + sink, 6.4, 3.4, CP.shell); ell(L, -1, -5.4 + sink, 4, 1.4, [CP.shell[2], CP.shell[3], CP.shellHi]); flush(L, rc, CP.out);
  for (const dx of [-3, 2]) { rc(dx, -9 + sink, 1, 3, CP.under[0]); rc(dx, -11 + sink, 2, 2, CP.eye); rc(dx, -11 + sink, 1, 1, CP.eyeW); }
  cap_(5.5, -3 + sink, 11, -9 - (1 - k) * 4); cap_(-5.5, -3 + sink, -11, -9 - (1 - k) * 4);   /* both claws shovelling */
  for (let i = 0; i < 10; i++) { const a = i * 0.9 + t * 8, r = 6 + ((t * 30 + i * 7) % 12); rc((i & 1 ? 1 : -1) * (5 + (r % 8)), -3 - (r % 9) - (i % 3) * 2, 2, 2, CP.sand[(i % 3) + 1]); void a; }
  const S = new Layer(); poly(S, [[-10, 0], [-6, -2 - k * 2], [6, -2 - k * 2], [10, 0]], CP.sand[1]); flush(S, rc, '#3a3224');
}
function cap_(x0, y0, x1, y1) { const n = 6; for (let i = 0; i <= n; i++) rc(lerp(x0, x1, i / n), lerp(y0, y1, i / n), 2, 2, CP.shell[2 - (i & 1)]); }
