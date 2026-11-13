// naga_guard_art.js - THE NAGA GUARD, THE HAND-DRAWN POSE SET (claude/srart, 2026-11-12). The greybox (src/siren-rocks-hands.js) drew it as green rectangles; this draws IT: a serpent-bodied spear
// guard of the Naga Queen's court, built the way claude/sea4 rebuilt the Drowned King: SEPARATE OUTLINED MASSES (tail, coils x3, far arm, torso, head with its frill, near arm, spear),
// and every TELL changes the BODY's silhouette, not just the weapon's angle. Pure drawing, fillRect only (tools/sr-art-sheet.mjs rasterises it in node). g = a 2d context, (x, y) = the coil's
// foot on the rock, f = facing (+1 right), o = the state { mode, hurtT, flash, open, k, seed, bodyOnly }.
// A FACE THAT READS AT GAME SCALE (the king's weak spot): the head is the lightest mass on a dark body, a dark FRILL behind it throws it forward, a gold slit-pupil EYE (2x2, a bright core)
// under a heavy brow line, a mouth line that opens into a black jaw with one white fang; in a tell the eye flares white-gold and the jaw is open.
// THE POSES (G_POSE_SET; the keys are the guard's modes, src/naga-guard.js):
//   idle / slither           coiled two loops, spear upright at the hip   |   stretched along the rock, head low and forward, spear carried low
//   spearTell (!)            REARED: tall S-curve, head high and back, the spear drawn back to the shoulder, point on you, the far hand out as a sight, tail curled under  ->
//   spear                    STRETCHED: long flat lunge of the chest, arm locked straight, spear out to full reach, jaw open, speed lines
//   rec                      after the thrust: slumped forward, spear dragging low, panting
//   coilTell (!!)            WOUND: three tall loops, the head sunk low in the top coil, the tail wound into the coil and a loose end cocked up behind like a spring  ->
//   lunge                    FLAT OUT: the whole body a long line along the rock, jaws open, the spear couched  ->  spent: lying stretched on the rock, tongue out, spear dropped
//   recoil (turned)          thrown back off a blocked thrust: the shaft flung up behind, stars   |   hurt: a flinch, eyes shut   |   dead (drawGuardDead k): falls, the spear drops, bubbles
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp, lerp, pol } from './sr_draw.js';
const R = Math.round;
export const GP = {
  out: '#0d110d',
  scale: ['#173a30', '#28564a', '#3d7a64', '#5ba888'], belly: ['#d8c894', '#e8e2c8'], tex: '#2d6a5e',
  face: ['#3d7a64', '#5ba888', '#84cfb6', '#dff7ee'], frill: ['#173a30', '#227058', '#3a9a80'], frillTip: '#dff7ee',
  gold: ['#5c4527', '#8a6a28', '#c8a24a', '#e8c24c'], eye: '#ffd36b', eyeHot: '#fff3bc', pupil: '#090c10', mouth: '#241018', tongue: '#8e3a3a', fang: '#f4fbf8',
  bone: ['#a89c84', '#d8c894', '#e8e2c8'], iron: ['#474e58', '#aab4c4', '#e8ecf4'], kelp: ['#3c5624', '#5d7d36'],
  hot: '#ffd36b', white: '#f6fbfc', red: '#ff6b6b', spark: '#fff0a8',
};
/* the pose table. loops [cx, cy, rx, ry] x3 (rx 0 = absent), tail [x, y, r] x5, b = the torso's base, lean0 / lean = lower / upper torso lean (deg, + forward), len = torso length,
   hd = { t head tilt deg (- looks up), dx, dy (from the torso top), open 0..1 jaw, eye }, aF / aB = [upper deg, upper len, lower deg, lower len] on SCREEN (0 = forward, 90 = down),
   sp = { ang, grip 0..1 (butt to tip), len } or null (a dropped spear is sp.floor) */
const L0 = [0, 0, 0, 0];
export const G_POSE_SET = {
  idle:      { loops: [[-2, -3.5, 11, 3.5], [0, -7.5, 8.5, 3.4], L0], tail: [[-10, -3, 3], [-17, -3, 2.6], [-23, -4.5, 2.1], [-27, -8, 1.5], [-26, -12, 1]], b: [0, -9], lean0: -3, lean: 7, len: 15,
              hd: { t: 4, dx: 2, dy: -2, open: 0, eye: 'calm' }, aF: [66, 6, -24, 6], aB: [96, 6, 62, 5], sp: { ang: -84, grip: 0.4, len: 34 } },
  slither:   { loops: [[-8, -3, 13, 3], [3, -5.5, 8, 3], L0], tail: [[-17, -3, 2.8], [-26, -2.5, 2.3], [-33, -4, 1.8], [-39, -3, 1.3], [-44, -4, 1]], b: [4, -7], lean0: 18, lean: 26, len: 13,
              hd: { t: 14, dx: 2, dy: -1, open: 0, eye: 'calm' }, aF: [40, 6, 10, 6], aB: [86, 6, 50, 5], sp: { ang: -26, grip: 0.4, len: 34 } },
  spearTell: { loops: [[-2, -3.5, 9, 3.5], [-3, -7.5, 7, 3.2], [-4, -11, 5, 2.8]], tail: [[-8, -3, 3], [-14, -4, 2.6], [-18, -9, 2.1], [-16, -14, 1.5], [-11, -16, 1]], b: [-3, -13], lean0: -16, lean: -22, len: 17,
              hd: { t: -10, dx: 0, dy: -3, open: 0.2, eye: 'flare' }, aF: [-100, 6, 20, 7], aB: [-6, 7, -2, 6], sp: { ang: -4, grip: 0.18, len: 34 } },
  spear:     { loops: [[-5, -3, 11, 3], [4, -5, 7, 2.6], L0], tail: [[-14, -3, 2.8], [-22, -2.5, 2.3], [-30, -3, 1.8], [-36, -2.5, 1.3], [-41, -3, 1]], b: [6, -8], lean0: 38, lean: 50, len: 17,
              hd: { t: 22, dx: 3, dy: -2, open: 0.8, eye: 'flare' }, aF: [4, 7, 0, 8], aB: [112, 6, 80, 5], sp: { ang: 0, grip: 0.1, len: 36 }, fx: 'thrust' },
  rec:       { loops: [[-2, -3, 10, 3], [3, -6, 8, 3], L0], tail: [[-9, -3, 2.9], [-16, -2.5, 2.4], [-22, -3, 1.9], [-27, -2.5, 1.4], [-30, -4, 1]], b: [3, -8], lean0: 22, lean: 40, len: 13,
              hd: { t: 30, dx: 1, dy: 0, open: 0.5, eye: 'dim' }, aF: [62, 6, 30, 7], aB: [100, 6, 78, 5], sp: { ang: 24, grip: 0.4, len: 34 } },
  coilTell:  { loops: [[-1, -4, 12.5, 4.4], [0, -9.5, 10, 4], [1, -14, 7.5, 3.6]], tail: [[-12, -4, 3], [-15, -9, 2.6], [-13, -15, 2.1], [-8, -19, 1.5], [-3, -19, 1]], b: [2, -15], lean0: 4, lean: 14, len: 7,
              hd: { t: 12, dx: 3, dy: -1, open: 0.5, eye: 'flare' }, aF: [50, 5, 4, 6], aB: [100, 5, 40, 5], sp: { ang: -2, grip: 0.4, len: 32, tuck: true } },
  lunge:     { loops: [[-12, -3, 8, 3], [0, -3.5, 7, 3], L0], tail: [[-20, -3, 2.8], [-29, -3, 2.4], [-37, -3, 1.9], [-44, -3, 1.4], [-50, -3, 1]], b: [4, -4], lean0: 76, lean: 84, len: 14,
              hd: { t: 8, dx: 3, dy: 0, open: 1, eye: 'flare' }, aF: [14, 6, 4, 6], aB: [80, 5, 70, 5], sp: { ang: 2, grip: 0.1, len: 34, low: true }, fx: 'speed' },
  spent:     { loops: [[-8, -2.5, 10, 2.6], [4, -2, 8, 2.2], L0], tail: [[-17, -2, 2.4], [-26, -1.5, 2], [-33, -2, 1.6], [-38, -1.5, 1.2], [-43, -2, 1]], b: [6, -4], lean0: 84, lean: 90, len: 11,
              hd: { t: 30, dx: 2, dy: -1, open: 0.6, eye: 'closed', tongue: true }, aF: [80, 5, 100, 4], aB: [90, 5, 100, 5], sp: { floor: true, len: 34 }, fx: 'puff' },
  recoil:    { loops: [[-5, -3.5, 10, 3.5], [-6, -7.5, 7.5, 3.4], L0], tail: [[-12, -4, 3], [-18, -7, 2.5], [-22, -13, 2], [-20, -18, 1.4], [-15, -20, 1]], b: [-5, -9], lean0: -28, lean: -44, len: 15,
              hd: { t: -34, dx: -2, dy: -2, open: 0.8, eye: 'closed' }, aF: [-150, 7, -130, 6], aB: [150, 6, 110, 5], sp: { ang: -136, grip: 0.4, len: 34 }, fx: 'stars' },
  hurt:      { loops: [[-3, -3.5, 11, 3.5], [-3, -7.5, 8, 3.4], L0], tail: [[-10, -3, 3], [-17, -4, 2.6], [-22, -9, 2.1], [-20, -14, 1.5], [-15, -15, 1]], b: [-2, -9], lean0: -14, lean: -24, len: 15,
              hd: { t: -20, dx: -1, dy: -2, open: 0.7, eye: 'closed' }, aF: [-70, 6, -20, 6], aB: [130, 6, 100, 5], sp: { ang: -112, grip: 0.4, len: 34 } },
};
export const G_MODE_POSE = { spearTell: 'spearTell', spear: 'spear', rec: 'rec', coilTell: 'coilTell', lunge: 'lunge', spent: 'spent', recoil: 'recoil', slither: 'slither' };
export const poseOfGuard = (mode, o = {}) => G_MODE_POSE[mode] || ((o.hurtT > 0) ? 'hurt' : 'idle');

let g_, X_, Y_, F_ = 1, TINT_ = 0, ALPHA_ = 1;
const rc = (dx, dy, w, h, c, a = 1) => { const al = a * ALPHA_; if (al !== 1) g_.globalAlpha = al; g_.fillStyle = TINT_ > 0 ? mixC(c, '#ffffff', TINT_) : c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); if (al !== 1) g_.globalAlpha = 1; };
const FL = L => flush(L, rc, GP.out);
const blend = (a, b, k) => Array.isArray(a) ? a.map((v, i) => blend(v, b[i], k)) : typeof a === 'number' ? lerp(a, b, k) : (k < 0.5 ? a : b);

/* the forward kinematics of a pose: every anchor the masses and the lint need */
export function guardRig(P, t = 0, wave = 0) {
  const [bx, by] = P.b, a0 = P.lean0 * Math.PI / 180, a1 = P.lean * Math.PI / 180, l0 = P.len * 0.5, l1 = P.len * 0.5;
  const M = [bx + Math.sin(a0) * l0, by - Math.cos(a0) * l0], T = [M[0] + Math.sin(a1) * l1, M[1] - Math.cos(a1) * l1];
  const S = [lerp(M[0], T[0], 0.55), lerp(M[1], T[1], 0.55)], H = [T[0] + P.hd.dx, T[1] + P.hd.dy];
  const arm = a => { const u = pol(a[0], a[1]), E = [S[0] + u[0], S[1] + u[1]], v = pol(a[2], a[3]); return { E, W: [E[0] + v[0], E[1] + v[1]] }; };
  return { B: [bx, by], M, T, S, H, F: arm(P.aF), Bk: arm(P.aB) };
}

export function drawGuard(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = o.alpha ?? 1; o = { seed: 0, ...o };
  const key = o.pose || poseOfGuard(o.mode, o), P = o.P || G_POSE_SET[key] || G_POSE_SET.idle;
  TINT_ = o.flash > 0 || o.flashT > 0 ? 0.5 : 0;
  const tm = time + (o.seed || 0), sway = o.still ? 0 : Math.sin(tm * 2.2) * 0.6;
  const wv = key === 'slither' ? Math.sin(tm * 8) : 0;
  const rig = guardRig(P, tm), body = !!o.bodyOnly, SC = GP.scale;
  /* ---- the tail (its own mass) ---- */
  { const L = new Layer(); const tl = P.tail.map(([tx, ty, r], i) => [tx, ty + (key === 'idle' || key === 'slither' ? Math.sin(tm * 2.4 + i * 0.9) * (0.4 + i * 0.35) * (key === 'slither' ? 1.8 : 0.7) : 0), r]);
    for (let i = 0; i + 1 < tl.length; i++) cap(L, tl[i][0], tl[i][1], tl[i + 1][0], tl[i + 1][1], tl[i][2], tl[i + 1][2], SC, { belly: GP.belly, bellyDir: [0, 1], bc: 0.55, tex: GP.tex });
    FL(L); }
  /* ---- the coils (one mass each, back to front: the lowest first, the top loop lightest) ---- */
  P.loops.forEach(([cx, cy, rx, ry], i) => { if (rx < 1) return; const L = new Layer(); ell(L, cx, cy + sway * (i ? 0.5 : 0), rx, ry, SC, { belly: GP.belly, bc: 0.5, tex: GP.tex });
    /* a scute line on the lit rim of the loop */
    for (let q = -rx + 3; q < rx - 2; q += 4) pset(L, cx + q, cy + ry * 0.55, GP.belly[0]); FL(L); });
  /* ---- the far arm (behind the chest, a shade darker) ---- */
  if (!body || true) { const L = new Layer(), A = rig.Bk, dark = SC.map(c => mixC(c, '#090c10', 0.35));
    cap(L, rig.S[0] - 1, rig.S[1], A.E[0], A.E[1], 2, 1.7, dark); cap(L, A.E[0], A.E[1], A.W[0], A.W[1], 1.7, 1.4, dark); ell(L, A.W[0], A.W[1], 1.6, 1.6, dark); FL(L); }
  /* ---- the torso: two segments, a pale belly down the front, a gold collar ---- */
  { const L = new Layer(), r0 = 4.8, r1 = 4.3, r2 = 3.4;
    cap(L, rig.B[0], rig.B[1], rig.M[0], rig.M[1], r0, r1, SC, { belly: GP.belly, bellyDir: [1, 0.2], bc: 0.45, tex: GP.tex });
    cap(L, rig.M[0], rig.M[1], rig.T[0], rig.T[1], r1, r2, SC, { belly: GP.belly, bellyDir: [1, 0.2], bc: 0.45, tex: GP.tex });
    /* a gold gorget at the neck and a bronze belt where the coil begins */
    cap(L, rig.T[0] - 3, rig.T[1] + 1.5, rig.T[0] + 2.5, rig.T[1] + 2, 1.6, 1.6, GP.gold);
    cap(L, rig.B[0] - 3, rig.B[1] + 0.5, rig.B[0] + 3, rig.B[1] + 0.5, 1.2, 1.2, GP.gold);
    FL(L); }
  /* ---- the head: frill behind, cranium, snout, jaw, the face ---- */
  headDraw(rig, P, key, tm);
  /* ---- the near arm and the spear ---- */
  { const A = rig.F, sp = P.sp;
    if (sp && !body) spearDraw(A.W, sp, key, tm);
    const L = new Layer(); cap(L, rig.S[0], rig.S[1], A.E[0], A.E[1], 2.3, 1.9, SC, { tex: GP.tex }); cap(L, A.E[0], A.E[1], A.W[0], A.W[1], 1.9, 1.5, SC); ell(L, A.W[0], A.W[1], 1.8, 1.8, GP.face);
    /* a bronze bracer */
    cap(L, lerp(A.E[0], A.W[0], 0.55), lerp(A.E[1], A.W[1], 0.55), lerp(A.E[0], A.W[0], 0.8), lerp(A.E[1], A.W[1], 0.8), 1.7, 1.5, GP.gold);
    FL(L); }
  if (!body) fxDraw(P, rig, key, tm, o);
}

function headDraw(rig, P, key, tm) {
  const H = rig.H, h = P.hd, t = h.t, dir = a => pol(t + a, 1), D0 = dir(0);
  const L = new Layer();
  /* the frill: three dark fins swept back off the skull, one pale tip each */
  for (const [da, ln, w] of [[-150, 7, 2.2], [178, 8, 2.4], [150, 6, 2.2]]) { const u = pol(t + da, ln), n = pol(t + da + 90, w); poly(L, [[H[0] + n[0] * 0.5, H[1] + n[1] * 0.5], [H[0] + u[0], H[1] + u[1]], [H[0] - n[0] * 0.5, H[1] - n[1] * 0.5]], GP.frill[1]); pset(L, H[0] + u[0], H[1] + u[1], GP.frillTip); }
  ell(L, H[0], H[1], 5.2, 4.6, GP.face, { rot: t * 0.3 });
  const sn = [H[0] + D0[0] * 4.4, H[1] + D0[1] * 4.4];
  /* the open jaw: a black mouth with the lower jaw swung down off the hinge */
  const hinge = [H[0] + D0[0] * 1.5, H[1] + D0[1] * 1.5 + 1.2], jd = pol(t + h.open * 42, 5.6);
  if (h.open > 0.12) { poly(L, [[hinge[0], hinge[1] - 1], [sn[0] + D0[0] * 2.5, sn[1] + D0[1] * 2.5 + 0.5], [hinge[0] + jd[0] + 0.5, hinge[1] + jd[1]], [hinge[0] - 1, hinge[1] + 1]], GP.mouth); }
  ell(L, sn[0], sn[1] - 0.4, 3.4, 2.2, GP.face, { rot: t });
  const jc = [hinge[0] + jd[0] * 0.6, hinge[1] + jd[1] * 0.6 + 0.6];
  ell(L, jc[0], jc[1], 3.1, 1.5, [GP.face[0], GP.face[1], GP.face[1]], { rot: t + h.open * 42 });
  if (h.open > 0.3) { pset(L, sn[0] + D0[0] * 2.2, sn[1] + D0[1] * 2.2 + 1.4, GP.fang); pset(L, hinge[0] + jd[0] * 0.8, hinge[1] + jd[1] * 0.8 - 0.4, GP.fang); }
  if (h.tongue) { const tp = pol(t + 20, 6); line(L, sn[0] + 1, sn[1] + 2, sn[0] + tp[0] + 2, sn[1] + 3.5, GP.tongue, 1); }
  /* a mouth line when shut */
  else if (h.open <= 0.12) { for (let i = 0; i < 4; i++) pset(L, sn[0] - 1 + i * D0[0] + 0.3, sn[1] + 1 + i * D0[1] + 0.3 + 0.2, GP.mouth); }
  /* THE EYE: a heavy brow line, a gold eye with a slit pupil; flare = wide, white-gold */
  const ec = [H[0] + pol(t - 24, 3.3)[0] + 0.5, H[1] + pol(t - 24, 3.3)[1]];
  const eye = h.eye;
  if (eye === 'closed') { line(L, ec[0] - 1, ec[1] + 0.4, ec[0] + 2, ec[1] + 0.4, GP.pupil, 1); pset(L, ec[0] + 2, ec[1] - 0.6, GP.pupil); }
  else if (eye === 'dead') { pset(L, ec[0] - 1, ec[1] - 1, GP.pupil); pset(L, ec[0] + 1, ec[1] - 1, GP.pupil); pset(L, ec[0], ec[1], GP.pupil); pset(L, ec[0] - 1, ec[1] + 1, GP.pupil); pset(L, ec[0] + 1, ec[1] + 1, GP.pupil); }
  else { const big = eye === 'flare', col = big ? GP.eyeHot : eye === 'dim' ? GP.gold[1] : GP.eye;
    for (let j = 0; j < (big ? 3 : 2); j++) for (let i = 0; i < (big ? 3 : 2); i++) pset(L, ec[0] - 1 + i, ec[1] - 1 + j, col);
    pset(L, ec[0], ec[1] - (big ? 0 : 0), GP.pupil); if (big) pset(L, ec[0], ec[1] - 1 + 1 + 1, GP.pupil);
    /* the brow: a dark wedge that angles down toward the snout (angry) */
    for (let i = -1; i < 3; i++) pset(L, ec[0] + i, ec[1] - (big ? 2 : 2) + (i > 0 ? 1 : 0) - (eye === 'dim' ? -1 : 0), GP.pupil); }
  /* a gill slit on the cheek */
  pset(L, H[0] - 1, H[1] + 2, GP.face[0]); pset(L, H[0] - 2, H[1] + 1, GP.face[0]);
  FL(L);
}

function spearDraw(hand, sp, key, tm) {
  const L = new Layer(), len = sp.len;
  if (sp.floor) { const bx = -26, by = -1.2; line(L, bx, by, bx + len, by - 0.4, GP.bone[1], 2); poly(L, [[bx + len, by - 3], [bx + len + 7, by], [bx + len, by + 2]], GP.iron[1]); FL(L); return; }
  const d = pol(sp.ang, 1), butt = [hand[0] - d[0] * len * sp.grip, hand[1] - d[1] * len * sp.grip], tip = [hand[0] + d[0] * len * (1 - sp.grip), hand[1] + d[1] * len * (1 - sp.grip)];
  cap(L, butt[0], butt[1], tip[0], tip[1], 0.9, 0.9, GP.bone);
  /* a kelp tassel under the head, a leaf blade with a barb */
  const nrm = [-d[1], d[0]], hb = [tip[0] - d[0] * 7, tip[1] - d[1] * 7];
  poly(L, [[tip[0] + d[0] * 5, tip[1] + d[1] * 5], [hb[0] + nrm[0] * 2.6, hb[1] + nrm[1] * 2.6], [hb[0] - nrm[0] * 2.6, hb[1] - nrm[1] * 2.6]], GP.iron[1]);
  line(L, hb[0], hb[1], tip[0] + d[0] * 4, tip[1] + d[1] * 4, GP.iron[2], 1);
  poly(L, [[hb[0] + nrm[0] * 2.6, hb[1] + nrm[1] * 2.6], [hb[0] + nrm[0] * 4 - d[0] * 2, hb[1] + nrm[1] * 4 - d[1] * 2], [hb[0] + nrm[0] * 1, hb[1] + nrm[1] * 1 - d[1] * 0]], GP.iron[0]);
  const kp = [hb[0] - d[0] * 1, hb[1] - d[1] * 1]; line(L, kp[0], kp[1], kp[0] - d[0] * 3 + nrm[0] * 2, kp[1] - d[1] * 3 + nrm[1] * 2 + 1, GP.kelp[1], 1); line(L, kp[0], kp[1], kp[0] - d[0] * 4 - nrm[0] * 1.5, kp[1] - d[1] * 4 - nrm[1] * 1.5 + 2, GP.kelp[0], 1);
  FL(L);
}

/* the effects: not bodies (skipped by o.bodyOnly), never outlined */
function fxDraw(P, rig, key, tm, o) {
  const f = P.fx, H = rig.H;
  if (f === 'thrust' || f === 'speed') { for (let i = 0; i < 4; i++) { const yy = rig.F.W[1] - 5 + i * 3, w = 10 + (i & 1) * 6; rc(-w - 8 - (f === 'speed' ? 14 : 0), yy - (f === 'speed' ? -6 : 0), w, 1, GP.white, 0.5 + (i & 1) * 0.2); } }
  if (f === 'stars') for (let i = 0; i < 3; i++) { const a = tm * 5 + i * 2.1; rc(H[0] + Math.cos(a) * 8 - 1, H[1] - 8 + Math.sin(a) * 3, 2, 2, GP.spark); }
  if (f === 'puff') for (let i = 0; i < 3; i++) rc(H[0] + 6 + i * 3, H[1] - 4 - ((tm * 12 + i * 5) % 8), 2, 1, GP.white, 0.55);
  if (key === 'coilTell') { /* the wound coil winks */ rc(rig.H[0] + 7, rig.H[1] - 7, 3, 1, GP.hot, 0.8); rc(rig.H[0] + 8, rig.H[1] - 8, 1, 3, GP.hot, 0.8); }
  if (key === 'spearTell') { rc(rig.F.W[0] + 30, rig.F.W[1] - 2, 3, 1, GP.hot, 0.9); rc(rig.F.W[0] + 31, rig.F.W[1] - 3, 1, 3, GP.hot, 0.9); }
}

/* THE FALL: k 0..1 - the head drops, the loops slacken, the spear falls and lies on the rock, bubbles go up. drawGuardDead(g, x, y, f, k, t) */
export function drawGuardDead(g, x, y, f, k, time = 0, o = {}) {
  const A = G_POSE_SET.recoil, B = G_POSE_SET.spent, kk = clamp(k), e = kk < 0.35 ? kk / 0.35 * 0.45 : 0.45 + (kk - 0.35) / 0.65 * 0.55;
  const P = { loops: blend(A.loops, B.loops, e), tail: blend(A.tail, B.tail, e), b: blend(A.b, B.b, e), lean0: lerp(A.lean0, B.lean0, e), lean: lerp(A.lean, B.lean, e), len: lerp(A.len, B.len, e),
    hd: { t: lerp(A.hd.t, B.hd.t, e), dx: lerp(A.hd.dx, B.hd.dx, e), dy: lerp(A.hd.dy, B.hd.dy, e), open: lerp(A.hd.open, B.hd.open, e), eye: 'dead', tongue: kk > 0.7 },
    aF: blend(A.aF, B.aF, e), aB: blend(A.aB, B.aB, e), sp: kk > 0.6 ? { floor: true, len: 34 } : { ang: lerp(-136, -190, e), grip: 0.4, len: 34 } };
  drawGuard(g, x, y, f, { ...o, P, alpha: kk > 0.82 ? 1 - (kk - 0.82) / 0.18 * 0.85 : 1, still: true, bodyOnly: o.bodyOnly }, time);
  if (!o.bodyOnly) for (let i = 0; i < 4; i++) { const yy = -8 - ((time * 20 + i * 7) % 26) * (0.4 + kk), xx = -4 + i * 5 + Math.sin(time * 4 + i) * 2; g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = 1; TINT_ = 0; rc(xx, yy, 2, 2, '#dff7ee', 0.5 * (1 - kk * 0.6)); }
}
