// tide_herald_art.js - THE TIDE HERALD 2, THE HAND-DRAWN POSE SET (claude/saltart, 2026-11-13). Master's sheet (src/redraw/tidebound.js bakeHerald) has ten frames and none of them for the new
// moves (spears of water, the undertow, calling the sea, the seize). This draws him by RIG, one pose per mode, the way claude/srart drew the naga: SEPARATE OUTLINED MASSES (kelp cape, far leg,
// far arm, near leg, torso, head with crest, the coral glaive, near arm + pauldron), so every TELL changes the BODY's silhouette and not just the weapon's angle. ART ONLY: no timing, hp, damage
// or hitbox is touched (src/tide-herald.js is not edited). Same man as master's: an old elven knight in barnacled coral-and-bronze plate, a swept coral fan crest on a bronze dome, a pale old face
// with ONE glowing eye, a long ear laid back through foam-white hair, a pearl gorget, a kelp cape, and the CORAL GLAIVE (bronze haft, pearl collar, curved coral blade).
// Pure drawing, fillRect only. g = a 2d context, (x, y) = the feet, f = facing (+1 right), o = { mode, hurtT, flash, open, seed, vx, bodyOnly, mud }.
// THE POSES (HERALD_POSE_SET; keys = his modes, src/tide-herald.js, and master's sheet names):
//   idle / stride        glaive grounded at his side, stately step  |  sleep: kneeling, both hands on the planted glaive, head bowed  |  wake: head up, the eye lights, rising
//   sweepTell (!! low)   TWISTED BACK: weight on the rear foot, shoulders turned, the glaive wound back low behind him      ->  sweep: LUNGED, the glaive swept low and wide in front (a smear)
//   thrustTell (!)       COILED: crouched, glaive couched level at the shoulder, point on you                             ->  thrust: driven straight out, arm locked, front leg long
//   spearTell (!)        glaive point DRIVEN INTO the ground at his feet, head down, both hands on it                    ->  spear: wrenched UP, both arms flung skyward (the water columns rise)
//   raise (!! wave)      glaive overhead in both hands, blade glowing pale, halo (calling the wave)                       ->  wave: slammed forward and down, bowed
//   maelTell (!)         ARMS WIDE: glaive held out flat in one hand, the other thrown out, chest open, eye white          ->  mael: hunched, both hands dragging down on the haft (the undertow pulls)
//   callTell             one hand raised flat to the sea, the glaive planted      seize: glaive high, head back, sea-light up the haft
//   mired (open)         SUNK to the thigh in mud, hunched, the glaive stuck in the mud, heaving      reel (parried): flung back, the glaive knocked up and away      rec: panting, stooped      hurt: a flinch
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp, lerp, pol } from './sr_draw.js';
const R = Math.round;
export const HP = {
  out: '#0c0f12', coral: ['#5a2024', '#a03a36', '#d8685a', '#f4a890'], bronze: ['#3a2812', '#7a5a28', '#b8883a', '#e8c070'], cape: ['#10332e', '#1f5a4e', '#3a8a76', '#6ac0a0'], pearl: ['#a8a496', '#e0dccb', '#fff8e8'],
  hair: ['#aab8b8', '#d6e0de', '#f2f8f6'], skin: ['#a89c8c', '#c8bcaa', '#e8dcc8'], eye: '#7ff0e0', eyeHot: '#ffffff', brow: '#3a2a26', mouth: '#4a2a2a', barn: ['#e4e6da', '#b0b4a6'], weed: ['#244a30', '#3a6a42'], mud: ['#2a2218', '#4a3e2c', '#6a5a40', '#8a7a5a'],
  water: ['#2f7a88', '#7cc8c8', '#dff2f8'], gold: '#ffd36b',
};
/* the pose table. hy = hip height (17 = standing), hx = hip x; lean0 / lean = lower / upper torso lean (deg, + forward); fN / fF = [foot dx, foot lift] (near / far); hd = { dx, dy, t tilt deg, eye, open };
   aN / aF = { hold: 0..1 (the wrist sits on the haft at that fraction from the butt) } or { a: [upper deg, len, lower deg, len] } (screen angle: 0 forward, 90 down, -90 up);
   sp = { ang (deg, 0 = forward, -90 = up), at: [x, y] the haft point he holds (relative to the feet) , frac: where along the haft that point is (0 butt .. 1 blade end), len } ;  cape = swing back (px); fx = effect */
const POSE = {
  idle:       { hy: 17.5, hx: 0, lean0: 2, lean: 4, fN: [4, 0], fF: [-3, 0], hd: { dx: 1, dy: 0, t: 2, eye: 'calm' }, aN: { hold: 0.5 }, aF: { a: [100, 7, 80, 6] }, sp: { ang: -88, at: [10, -26], frac: 0.5, len: 40 }, cape: 2 },
  stride:     { hy: 17, hx: 0, lean0: 7, lean: 10, fN: [6, 0], fF: [-6, 3], hd: { dx: 2, dy: 0, t: 6, eye: 'calm' }, aN: { hold: 0.5 }, aF: { a: [60, 7, 20, 6] }, sp: { ang: -82, at: [12, -25], frac: 0.5, len: 40 }, cape: 5, walk: true },
  sleep:      { hy: 11, hx: -2, lean0: 18, lean: 30, fN: [10, 0], fF: [-9, 0], kneel: true, hd: { dx: 4, dy: 3, t: 32, eye: 'closed' }, aN: { hold: 0.78 }, aF: { hold: 0.7 }, sp: { ang: -90, at: [10, -22], frac: 0.78, len: 40 }, cape: 0 },
  wake:       { hy: 14, hx: -1, lean0: 8, lean: 14, fN: [7, 0], fF: [-6, 0], hd: { dx: 2, dy: -1, t: 8, eye: 'flare' }, aN: { hold: 0.7 }, aF: { hold: 0.6 }, sp: { ang: -90, at: [11, -25], frac: 0.7, len: 40 }, cape: 2, fx: 'glint' },
  rec:        { hy: 15.5, hx: 1, lean0: 14, lean: 24, fN: [5, 0], fF: [-5, 0], hd: { dx: 3, dy: 1, t: 22, eye: 'dim' }, aN: { hold: 0.55 }, aF: { a: [95, 7, 85, 6] }, sp: { ang: -60, at: [10, -20], frac: 0.5, len: 40, drag: true }, cape: 3 },
  sweepTell:  { hy: 15, hx: -4, lean0: -18, lean: -30, fN: [-9, 0], fF: [9, 0], hd: { dx: -2, dy: 0, t: -12, eye: 'flare' }, aN: { hold: 0.3 }, aF: { hold: 0.18 }, sp: { ang: 168, at: [-12, -24], frac: 0.3, len: 40 }, cape: -3, fx: 'tellRing' },
  sweep:      { hy: 12.5, hx: 5, lean0: 38, lean: 58, fN: [15, 0], fF: [-9, 0], hd: { dx: 3, dy: 0, t: 26, eye: 'flare', open: 0.5 }, aN: { hold: 0.22 }, aF: { hold: 0.12 }, sp: { ang: 8, at: [10, -9], frac: 0.22, len: 42, low: true }, cape: 12, fx: 'smear' },
  thrustTell: { hy: 12.5, hx: -3, lean0: 12, lean: 6, fN: [10, 0], fF: [-10, 0], hd: { dx: 3, dy: 0, t: 4, eye: 'flare' }, aN: { hold: 0.35 }, aF: { hold: 0.2 }, sp: { ang: -2, at: [3, -26], frac: 0.3, len: 40 }, cape: 0 },
  thrust:     { hy: 12, hx: 6, lean0: 40, lean: 52, fN: [17, 0], fF: [-10, 0], hd: { dx: 4, dy: 0, t: 18, eye: 'flare', open: 0.6 }, aN: { hold: 0.34 }, aF: { hold: 0.18 }, sp: { ang: 0, at: [20, -26], frac: 0.36, len: 40 }, cape: 11, fx: 'speed' },
  spearTell:  { hy: 11.5, hx: 2, lean0: 22, lean: 40, fN: [9, 0], fF: [-6, 0], hd: { dx: 4, dy: 3, t: 34, eye: 'flare' }, aN: { hold: 0.72 }, aF: { hold: 0.62 }, sp: { ang: 82, at: [14, -17], frac: 0.7, len: 40, planted: true }, cape: 6, fx: 'ripples' },
  spear:      { hy: 18, hx: 0, lean0: -8, lean: -20, fN: [4, 0], fF: [-4, 0], hd: { dx: -1, dy: -2, t: -22, eye: 'flare', open: 0.8 }, aN: { a: [-70, 7, -100, 7] }, aF: { a: [-100, 7, -120, 7] }, sp: { ang: -64, at: [8, -52], frac: 0.7, len: 40 }, cape: -2, fx: 'spray' },
  raise:      { hy: 17.5, hx: -1, lean0: -6, lean: -12, fN: [4, 0], fF: [-4, 0], hd: { dx: -1, dy: -1, t: -18, eye: 'flare' }, aN: { hold: 0.62 }, aF: { hold: 0.42 }, sp: { ang: -90, at: [4, -50], frac: 0.55, len: 40, glow: true }, cape: -1, fx: 'halo' },
  wave:       { hy: 12.5, hx: 3, lean0: 28, lean: 50, fN: [12, 0], fF: [-8, 0], hd: { dx: 3, dy: 1, t: 28, eye: 'flare', open: 0.5 }, aN: { hold: 0.4 }, aF: { hold: 0.26 }, sp: { ang: 22, at: [14, -13], frac: 0.4, len: 40 }, cape: 9, fx: 'surge' },
  maelTell:   { hy: 16, hx: 0, lean0: -4, lean: -8, fN: [6, 0], fF: [-6, 0], hd: { dx: 0, dy: -1, t: -10, eye: 'flare', open: 0.3 }, aN: { a: [-8, 7, 0, 8] }, aF: { a: [-172, 7, -180, 8] }, sp: { ang: -4, at: [17, -28], frac: 0.5, len: 40, held1: true }, cape: 0, fx: 'tellRing' },
  mael:       { hy: 12, hx: 1, lean0: 30, lean: 52, fN: [9, 0], fF: [-9, 0], hd: { dx: 3, dy: 2, t: 30, eye: 'flare', open: 0.4 }, aN: { hold: 0.7 }, aF: { hold: 0.56 }, sp: { ang: 64, at: [14, -14], frac: 0.7, len: 40, planted: true }, cape: 8, fx: 'drag' },
  callTell:   { hy: 17, hx: 0, lean0: -4, lean: -10, fN: [4, 0], fF: [-4, 0], hd: { dx: -1, dy: -1, t: -14, eye: 'flare' }, aN: { hold: 0.55 }, aF: { a: [-40, 7, -92, 6] }, sp: { ang: -90, at: [10, -26], frac: 0.55, len: 40 }, cape: 1, fx: 'rings' },
  seize:      { hy: 17.5, hx: 0, lean0: -10, lean: -22, fN: [4, 0], fF: [-4, 0], hd: { dx: -2, dy: -2, t: -30, eye: 'flare', open: 0.7 }, aN: { a: [-60, 7, -100, 7] }, aF: { a: [-110, 7, -120, 7] }, sp: { ang: -78, at: [9, -53], frac: 0.55, len: 40, glow: true }, cape: -2, fx: 'halo' },
  mired:      { hy: 9, hx: 0, lean0: 30, lean: 52, fN: [8, 0], fF: [-7, 0], hd: { dx: 4, dy: 3, t: 34, eye: 'dim' }, aN: { hold: 0.68 }, aF: { hold: 0.54 }, sp: { ang: 70, at: [13, -12], frac: 0.7, len: 40, planted: true }, cape: 5, mud: true },
  reel:       { hy: 15, hx: -5, lean0: -22, lean: -42, fN: [-6, 0], fF: [8, 0], hd: { dx: -3, dy: -1, t: -34, eye: 'closed', open: 0.8 }, aN: { a: [-130, 7, -150, 7] }, aF: { a: [-60, 7, -100, 7] }, sp: { ang: -138, at: [-16, -42], frac: 0.5, len: 40 }, cape: 10, fx: 'stars' },
  hurt:       { hy: 17, hx: -2, lean0: -10, lean: -20, fN: [3, 0], fF: [-5, 0], hd: { dx: -2, dy: -1, t: -22, eye: 'closed' }, aN: { hold: 0.5 }, aF: { a: [110, 7, 100, 6] }, sp: { ang: -100, at: [8, -26], frac: 0.5, len: 40 }, cape: 5 },
};
export const HERALD_POSE_SET = POSE;
export const HERALD_MODE_POSE = { sleep: 'sleep', wake: 'wake', stride: 'stride', rec: 'rec', sweepTell: 'sweepTell', sweep: 'sweep', thrustTell: 'thrustTell', thrust: 'thrust', spearTell: 'spearTell', spear: 'spear', raise: 'raise', wave: 'wave',
  maelTell: 'maelTell', mael: 'mael', callTell: 'callTell', seize: 'seize', mired: 'mired', reel: 'reel' };
export const poseOfHerald = (mode, o = {}) => HERALD_MODE_POSE[mode] === 'stride' && Math.abs(o.vx || 0) < 6 ? 'idle' : (HERALD_MODE_POSE[mode] || ((o.hurtT > 0) ? 'hurt' : 'idle'));

let g_, X_, Y_, F_ = 1, TINT_ = 0, AL_ = 1;
const rc = (dx, dy, w, h, c, a = 1) => { const al = a * AL_; if (al !== 1) g_.globalAlpha = al; g_.fillStyle = TINT_ > 0 ? mixC(c, '#ffffff', TINT_) : c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); if (al !== 1) g_.globalAlpha = 1; };
const FL = (L, oc = HP.out) => flush(L, rc, oc);
/* two-bone IK: from A to B, lengths l1 l2; bend: +1 = the joint bows forward-down (knees: +x), -1 = back (elbows go down-back) */
function ik(A, B, l1, l2, bend) {
  let dx = B[0] - A[0], dy = B[1] - A[1], d = Math.hypot(dx, dy) || 0.001; const dd = Math.min(d, l1 + l2 - 0.01);
  const a = Math.acos(clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1)), base = Math.atan2(dy, dx) + bend * a;
  return [A[0] + Math.cos(base) * l1, A[1] + Math.sin(base) * l1];
}
/* the forward kinematics of a pose: every anchor the masses and the lint need */
export function heraldRig(P, t = 0) {
  const hy = P.hy, H = [P.hx, -hy], a0 = P.lean0 * Math.PI / 180, a1 = P.lean * Math.PI / 180, L0 = 6.5, L1 = 7;
  const M = [H[0] + Math.sin(a0) * L0, H[1] - Math.cos(a0) * L0], Tp = [M[0] + Math.sin(a1) * L1, M[1] - Math.cos(a1) * L1], S = [lerp(M[0], Tp[0], 0.78), lerp(M[1], Tp[1], 0.78)];
  const hd = P.hd, Hc = [Tp[0] + hd.dx, Tp[1] + hd.dy - 6.8];
  const walk = P.walk ? Math.sin(t * 6) : 0, fN = [P.fN[0] + walk * 3, -(P.fN[1] + Math.max(0, walk) * 3)], fF = [P.fF[0] - walk * 3, -(P.fF[1] + Math.max(0, -walk) * 3)];
  const kN = ik(H, fN, 9.5, 9.5, -1), kF = ik(H, fF, 9.5, 9.5, -1);
  const sp = P.sp, dir = pol(sp.ang, 1), at = [sp.at[0], sp.at[1]], butt = [at[0] - dir[0] * sp.frac * sp.len, at[1] - dir[1] * sp.frac * sp.len], tip = [butt[0] + dir[0] * sp.len, butt[1] + dir[1] * sp.len];
  const hand = (A, frac) => [butt[0] + dir[0] * frac * sp.len, butt[1] + dir[1] * frac * sp.len];
  const arm = (a, sh) => { if (a.hold !== undefined) { const W = hand(a, a.hold), E = ik(sh, W, 7, 7, 1); return { E, W }; } const u = pol(a.a[0], a.a[1]), E = [sh[0] + u[0], sh[1] + u[1]], v = pol(a.a[2], a.a[3]); return { E, W: [E[0] + v[0], E[1] + v[1]] }; };
  return { H, M, T: Tp, S, Hc, fN, fF, kN, kF, aN: arm(P.aN, S), aF: arm(P.aF, [S[0] - 1, S[1] + 0.5]), butt, tip, dir, sp };
}

export function drawHerald(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; AL_ = o.alpha ?? 1; o = { seed: 0, ...o };
  const key = o.pose || poseOfHerald(o.mode, o), P = o.P || POSE[key] || POSE.idle, tm = time + (o.seed || 0), body = !!o.bodyOnly;
  TINT_ = o.flash > 0 || o.flashT > 0 || (o.hurtT > 0 && key === 'hurt') ? 0.5 : 0;
  const rig = heraldRig(P, tm), br = o.still ? 0 : Math.sin(tm * 2.1) * 0.5, CO = HP.coral, BR = HP.bronze, CA = HP.cape;
  const H = rig.H, S = rig.S, hdp = P.hd;
  /* ---- the kelp cape (behind everything): from the shoulders, hanging and swung back by `cape` ---- */
  { const L = new Layer(), sw = P.cape + (o.still ? 0 : Math.sin(tm * 3) * 1.2), bx = S[0] - 2, by = S[1];
    poly(L, [[bx + 1, by - 1], [bx - 5, by + 2], [bx - 7 - sw, by + 10], [bx - 8 - sw * 1.4, by + 19], [bx - 6 - sw * 1.2, by + 23 + (o.still ? 0 : Math.sin(tm * 4) * 1.5)], [bx - 2 - sw, by + 21], [bx + 2 - sw * 0.5, by + 24], [bx + 4, by + 12]], CA[1]);
    poly(L, [[bx + 1, by - 1], [bx - 3, by + 1], [bx - 4 - sw * 0.6, by + 11], [bx - 3 - sw, by + 21], [bx + 2, by + 12]], CA[2]);
    for (let i = 0; i < 3; i++) pset(L, bx - 3 - i - sw * (0.4 + i * 0.3), by + 8 + i * 4, CA[3]); pset(L, bx - 5 - sw, by + 22, HP.weed[1]); FL(L); }
  /* ---- legs: far (dark) then near ---- */
  const leg = (hip, kn, ft, ramp, front) => { const L = new Layer(); cap(L, hip[0], hip[1], kn[0], kn[1], 3, 2.3, ramp); cap(L, kn[0], kn[1], ft[0], ft[1] - 1.5, 2.3, 1.9, ramp);
    ell(L, kn[0] + 0.5, kn[1], 2.6, 2.4, [BR[1], BR[2], BR[3]]); poly(L, [[ft[0] - 2.6, ft[1] - 1.4], [ft[0] + 5, ft[1] - 1.4], [ft[0] + 5.5, ft[1]], [ft[0] - 2.6, ft[1]]], front ? BR[1] : BR[0]);   /* a bronze greave, a poleyn at the knee, a sabaton */
    if (front) { pset(L, ft[0] + 1, ft[1] - 2, BR[3]); pset(L, kn[0], kn[1] - 1, BR[3]); } FL(L); };
  const hipF = [H[0] - 1.5, H[1]], hipN = [H[0] + 1.5, H[1]];
  leg(hipF, rig.kF, rig.fF, [BR[0], BR[1]], false);
  const FA = new Layer();   /* far arm */
  cap(FA, S[0] - 0.5, S[1], rig.aF.E[0], rig.aF.E[1], 2.2, 1.8, [CO[0], CO[1], CO[2]]); cap(FA, rig.aF.E[0], rig.aF.E[1], rig.aF.W[0], rig.aF.W[1], 1.8, 1.5, [BR[0], BR[1], BR[2]]); ell(FA, rig.aF.W[0], rig.aF.W[1], 1.7, 1.7, [BR[1], BR[2]]); FL(FA);
  leg(hipN, rig.kN, rig.fN, [BR[1], BR[2]], true);
  /* ---- the torso: a bronze breastplate laced with coral, a pearl gorget, a belt, a tasset skirt ---- */
  { const L = new Layer(), Mi = rig.M, Tp = rig.T, a1 = Math.atan2(Tp[0] - Mi[0], -(Tp[1] - Mi[1])), cs = Math.cos(a1), sn = Math.sin(a1), q = (u, v) => [Mi[0] + u * cs + v * sn, Mi[1] + u * -sn + v * cs];
    const hips = (P.kneel ? 0 : 0);
    poly(L, [q(-5.4, 6), q(-6.4, -2), q(-5.4, -8), q(5, -8), q(6.4, -2), q(5.6, 6)], BR[1]);                                    /* the body */
    poly(L, [q(-5.4, 6), q(-6.4, -2), q(-5.4, -8), q(-1, -8), q(-1.4, 0), q(-1.8, 6)], BR[2]);                                  /* the lit side */
    poly(L, [q(-3.6, -2), q(3.4, -2), q(2.8, -6.4), q(-2.8, -6.4)], CO[1]); line(L, ...q(0, -6), ...q(0, 0), CO[2]); pset(L, ...q(-1.6, -5), CO[3]);   /* the coral chest-plate and its ridge */
    poly(L, [q(-6, 5), q(6, 5), q(7.5, 9.5), q(-7.5, 9.5)], CO[1]); for (let i = -2; i <= 2; i++) line(L, ...q(i * 2.6, 5.5), ...q(i * 2.8, 9), i & 1 ? CO[0] : CO[2]);   /* the tassets */
    line(L, ...q(-6, 4.4), ...q(6, 4.4), BR[3]); line(L, ...q(-6, 5), ...q(6, 5), BR[0]);                                          /* the belt */
    poly(L, [q(-3.4, -7.6), q(3.4, -7.6), q(2.6, -10), q(-2.6, -10)], HP.pearl[1]); pset(L, ...q(-1, -9), HP.pearl[2]);              /* the pearl gorget */
    for (const [u, v] of [[-4, 0], [4, -6], [-2, 6]]) { pset(L, ...q(u, v), HP.barn[0]); pset(L, ...q(u + 1, v), HP.barn[1]); }       /* barnacles on the plate */
    void hips; FL(L); }
  /* ---- the head: bronze dome, the coral fan crest swept back, the pale old face with one lit eye, a long ear, foam hair ---- */
  { const L = new Layer(), c = rig.Hc, t = hdp.t * Math.PI / 180, ct = Math.cos(t), st = Math.sin(t), q = (u, v) => [c[0] + u * ct - v * st, c[1] + u * st + v * ct];
    ell(L, ...q(-3, 3), 3.4, 4.6, [HP.hair[0], HP.hair[1], HP.hair[2]]); poly(L, [q(-6, 2), q(-7.4, 9), q(-3, 9), q(-3, 3)], HP.hair[1]);                       /* foam-white hair to the shoulders */
    ell(L, ...q(1, 0.5), 3.9, 4.4, HP.skin);                                                                                                          /* the old face */
    ell(L, ...q(0, -2.4), 4.4, 2.8, BR);                                                                                                              /* the bronze dome */
    poly(L, [q(-4, -4), q(-1, -5), q(-2, -11), q(-7, -9), q(-8.5, -4)], CO[1]); poly(L, [q(-1, -5), q(3, -3), q(2, -8), q(-1, -11)], CO[2]);          /* the fan crest, swept back */
    line(L, ...q(-3, -4), ...q(-6, -9), CO[3]); line(L, ...q(-1, -4), ...q(-3, -10), CO[3]); line(L, ...q(1, -3), ...q(0, -9), CO[0]);
    poly(L, [q(-2, 1), q(-8, -1), q(-3, 3)], HP.skin[1]); pset(L, ...q(-7, -1), HP.skin[2]);                                                           /* the long ear laid back */
    poly(L, [q(3, 2), q(5.4, 4), q(3.6, 7.6), q(1, 6)], HP.hair[1]);                                                                                   /* a beard, thin and white */
    FL(L);
    const ex = q(2.4, 0.2); rc(ex[0] - 1, ex[1] - 1, 3, 2, '#14100e'); const hot = hdp.eye === 'flare', cl = hdp.eye === 'closed', dim = hdp.eye === 'dim';
    if (cl) rc(ex[0] - 1, ex[1], 3, 1, HP.brow); else { rc(ex[0], ex[1] - 1, 2, 2, hot ? HP.eyeHot : dim ? '#4a8a84' : HP.eye); if (hot) { rc(ex[0] - 1, ex[1] - 2, 4, 1, HP.eye, 0.7); rc(ex[0] + 2, ex[1], 2, 1, HP.eye, 0.6); } }
    const br_ = q(1.4, -1.6); rc(br_[0] - 1, br_[1], 4, 1, HP.brow);                                                                                    /* the heavy brow */
    const mo = q(2.8, 4); if (hdp.open) { rc(mo[0], mo[1], 2, 2, HP.mouth); rc(mo[0], mo[1], 1, 1, HP.skin[2]); } else rc(mo[0], mo[1] + 1, 2, 1, HP.brow);
    if (!body && hot) { rc(ex[0] + 1, ex[1] - 4, 1, 1, HP.eye, 0.6 + 0.3 * Math.sin(tm * 18)); } }
  /* ---- the glaive: bronze haft, pearl collar, the curved coral blade; a glow when it calls the sea ---- */
  { const sp = P.sp, L = new Layer(), b = rig.butt, tpt = rig.tip, d = rig.dir, n = [-d[1], d[0]];
    if (!body) { cap(L, b[0], b[1], tpt[0], tpt[1], 1.2, 1.2, BR); for (let k = 0.15; k < 1; k += 0.22) pset(L, lerp(b[0], tpt[0], k), lerp(b[1], tpt[1], k), BR[3]); ell(L, b[0], b[1], 1.8, 1.8, BR);                  /* the butt cap */
      ell(L, tpt[0] - d[0] * 1.5, tpt[1] - d[1] * 1.5, 2.2, 2.2, [HP.pearl[0], HP.pearl[1], HP.pearl[2]]);                                                  /* the pearl collar */
      const bl = (u, v) => [tpt[0] + d[0] * u + n[0] * v, tpt[1] + d[1] * u + n[1] * v];
      poly(L, [bl(0, -1.4), bl(3, -3.8), bl(8, -4), bl(13, -1.4), bl(11, 0.2), bl(6, 0.8), bl(0, 1.4)], CO[2]); poly(L, [bl(0, -1.4), bl(3, -3.8), bl(8, -4), bl(5, -1.2), bl(0, -0.4)], CO[3]); line(L, ...bl(1, 0.2), ...bl(10, -0.4), CO[1]);
      pset(L, ...bl(13, -1.4), HP.pearl[2]); }
    FL(L);
    if (!body && (sp.glow || P.fx === 'halo')) { const k = 0.6 + 0.4 * Math.sin(tm * 8), cx = tpt[0] + d[0] * 6, cy = tpt[1] + d[1] * 6; for (let r = 0; r < 2; r++) for (let a = 0; a < 360; a += 20) rc(cx + Math.cos(a * Math.PI / 180) * (10 + r * 4), cy + Math.sin(a * Math.PI / 180) * (10 + r * 4), 1, 1, r ? HP.water[1] : HP.water[2], 0.7 * k); }
    if (sp.planted && !body) { /* the point is in the ground: a splash and a ring of ripples */
      const gx = tpt[0], gy = Math.min(0, tpt[1] + 2); rc(gx - 4, -1, 8, 1, HP.water[2], 0.6); for (let i = 0; i < 4; i++) rc(gx - 6 + i * 4, -3 - ((tm * 20 + i * 3) % 5), 1, 2, HP.water[2], 0.7); }
    if (sp.low && !body) for (let i = 0; i < 4; i++) rc(b[0] + d[0] * (sp.len + 2) + 3 + i * 3, -3 - i, 5 - i, 1, HP.water[2], 0.55 - i * 0.1); }
  /* ---- the near arm over the glaive, with a pauldron of coral and a bronze vambrace ---- */
  { const L = new Layer(); cap(L, S[0] + 0.5, S[1], rig.aN.E[0], rig.aN.E[1], 2.6, 2.1, [CO[0], CO[1], CO[2]]); cap(L, rig.aN.E[0], rig.aN.E[1], rig.aN.W[0], rig.aN.W[1], 2.1, 1.7, BR);
    ell(L, rig.aN.W[0], rig.aN.W[1], 2, 2, [BR[2], BR[3]]); ell(L, S[0] + 0.5, S[1] + 0.2, 3.1, 2.5, [CO[1], CO[2], CO[3]]); pset(L, S[0] - 1, S[1] - 2, HP.barn[0]); pset(L, S[0], S[1] - 2, HP.barn[1]); pset(L, S[0] + 1.6, S[1] - 1.4, CO[0]); FL(L); }
  if (!body) fx(P, rig, tm);
  if (P.mud || o.mud) mudHeap(tm, rig);
}
/* his effects: a tell ring is the hands' own UI; these are the body's: spray, smear, speed, surge, drag, ripples, stars, glint */
function fx(P, rig, t) {
  const k = P.fx, tp = rig.tip, d = rig.dir;
  if (k === 'speed') for (let i = 0; i < 4; i++) rc(-24 - i * 4, -30 + i * 3, 6, 1, HP.water[2], 0.5 - i * 0.1);
  /* (claude/saltlook) THE THRUST'S JET: the blade is ~60 px out but the blow (src/tide-herald.js TH.thrust.r, 112) lands that far, so a streak of sea-water runs on from the point to the reach and bursts there:
     what is drawn now ends where the hit does (the still with the hitbox outlined: look-herald-thrust-*-hitbox.png) */
  if (k === 'speed') { const x0 = R(tp[0] + 14), x1 = 110, y0 = R(tp[1]); for (let x = x0; x < x1; x += 3) { const f = (x - x0) / (x1 - x0); rc(x, y0 - 1, 3, 1, HP.water[2], 0.95 - f * 0.35); rc(x, y0, 3, 1, HP.water[0], 0.95 - f * 0.35);   /* a pale crest over a teal keel: it reads on a peach sky too */ rc(x + 1, y0 + 2 + ((x >> 2) & 1) * 3, 2, 1, HP.water[2], 0.5 - f * 0.3); rc(x, y0 - 4 - ((x >> 1) & 3), 1, 1, HP.water[2], 0.5 - f * 0.3); }
    for (let i = 0; i < 6; i++) rc(x1 - 2 + Math.cos(i * 1.05 + t * 14) * 5, y0 - 1 + Math.sin(i * 1.05 + t * 14) * 5, 2, 2, HP.water[2], 0.7); }
  if (k === 'smear') { for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.28; rc(tp[0] + Math.cos(a + 0.3) * 6 - 4 + i * 2, tp[1] + Math.sin(a) * 10 - 2, 6 - i, 1, HP.water[2], 0.7 - i * 0.12); } }
  if (k === 'spray') for (let i = 0; i < 9; i++) rc(8 + Math.sin(i * 2) * 10 + (i & 1 ? 4 : -4), -6 - ((t * 60 + i * 9) % 42), 1, 2, i & 1 ? HP.water[2] : HP.water[1], 0.85);
  if (k === 'surge') for (let i = 0; i < 5; i++) rc(14 + i * 4, -6 - i - Math.abs(Math.sin(t * 20 + i)) * 4, 4, 2, HP.water[(i & 1) + 1], 0.8);
  if (k === 'drag') for (let i = 0; i < 6; i++) rc(24 + ((t * 90 + i * 17) % 60) * -0.5 + 40, -3 - (i % 3) * 3, 5, 1, HP.water[1], 0.6);
  if (k === 'stars') for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; rc(-8 + Math.cos(a) * 9, -52 + Math.sin(a) * 3, 2, 2, HP.gold); }
  if (k === 'glint') rc(5, -46 + Math.sin(t * 9) * 1, 2, 2, HP.eyeHot, 0.8);
  if (k === 'rings') for (let r = 0; r < 2; r++) { const q = ((t * 1.4 + r * 0.5) % 1); for (let a = 0; a < 360; a += 30) rc(rig.aF.W[0] + Math.cos(a * Math.PI / 180) * (3 + q * 18), rig.aF.W[1] + Math.sin(a * Math.PI / 180) * (3 + q * 10), 1, 1, HP.water[2], 0.8 * (1 - q)); }
  void d;
}
/* mired: the mud to the thigh, a heaped lip and clots */
function mudHeap(t, rig) {
  const L = new Layer(), H = rig.H; poly(L, [[-16, 0], [-14, -5], [-8, -9], [-2, -11 + Math.sin(t * 3) * 0.6], [6, -10], [13, -8], [17, -3], [18, 0]], HP.mud[2]);
  poly(L, [[-16, 0], [-14, -5], [-8, -9], [-2, -11], [-4, -4], [-9, 0]], HP.mud[3]);
  for (let i = -14; i <= 16; i += 3) pset(L, i, -4 - (Math.abs(i) % 5), HP.mud[1]); FL(L, '#14100a');
  for (let i = 0; i < 4; i++) rc(-10 + i * 7 + Math.sin(t * 5 + i), -13 - ((t * 16 + i * 4) % 6), 2, 2, HP.mud[2], 0.8);   /* clots flung up as he heaves */
}
