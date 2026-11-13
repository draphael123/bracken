// parasite_queen_art.js - THE PARASITE QUEEN, THE HAND-DRAWN POSE SET (claude/whaleart, 2026-11-12). The Whale greybox (src/whale-hands.js) drew her as a pale ellipse with five lines on it and a rectangle for a mouth.
// This draws THE QUEEN: a tick the size of a hearth-cart, swollen on a whale's blood, ROOTED in the heart by a fan of pale roots. She is built from OUTLINED MASSES in the pattern of the Naga Queen / Drowned
// King 2 sheets - eight jointed legs (each its own two-bone mass, solved by IK to a foot on the floor or in the air), a great ENGORGED ABDOMEN (blood-dark belly sack, pale banded back, veins), a small armoured
// THORAX and a HEAD with a FACE: a pale carapace mask with a crown of bone spikes, a heavy brow, TWO ember eyes (the near one 4x4, the far one peeking past it), cheek ridges, and a hooked PAIR OF MOUTHPARTS
// that open and swell. Every TELL changes the body's silhouette (rear raised, head thrown back, body reared, legs reaching), not just a glow.
// Pure drawing, fillRect only (tools/wh-art-sheet.mjs rasterises it in node, no browser). g = a 2d context, (x, y) = the floor under her centre, f = facing (+1 right),
// o = { mode (the sim's mode), phase (1|2|3), open (flushed / stranded: a gold read is the hands' ring), ward, hurtT, flash, seed, pose (a name, overrides), bodyOnly, still, alpha, P }.
// THE POSES (src/parasite-queen.js modes; B16: every told move has a WINDUP pose and a RELEASE pose):
//   qSleep / qWake / qIdle (rooted P1, P3) / qSkitIdle (P2: low, the ROOT-KNOT glowing on her back) / qSkitter (a gait) / qHop (airborne) / qRec (winded) / qHurt / qWard (the roots re-grip)
//   qLashWind (body low, rear raised, front legs driven in) -> qLashRel (stretched out, the legs wide, the head thrust)   | qSpitWind (head thrown back, mouthparts swollen green) -> qSpitRel (head thrust, jaws wide)
//   qThrumWind (arched high on stiff legs, the belly pulsing) -> qThrumRel (slammed flat, the legs splayed)             | qConstrictWind (the front legs and tendrils reach out, the jaws open) -> qConstrictRel (taut, leaning)
//   qBroodWind (abdomen swollen and raised, straining) -> qBroodRel (rear thrust, the sacs leaving)                      | qCrushWind (reared up, the front legs high) -> qCrushRel (slammed onto the heart, legs wide)
//   qFlushed (off her roots: belly up, the legs thrashing, torn roots trailing) / qStranded (P2 on the floor: curled) / qUproot (the tear: reared, the roots snapping) / qReroot (pressing down into the heart) / qDead
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp, lerp, pol } from './sr_draw.js';
const R = Math.round;
export const QCOL = {
  out: '#12060a',
  shell: ['#4a3c3a', '#7a6a60', '#a89888', '#d0c4b0', '#ece4d4'], back: ['#5a4a46', '#8a7a6c', '#bcae9a', '#e0d6c2'], blood: ['#2a0a12', '#5a1422', '#8a2232', '#c04050'], raw: ['#4a1018', '#8a2030', '#c04050', '#e8808a'],
  leg: ['#2e2422', '#52423c', '#7a6a60', '#a89888'], root: ['#6a5a50', '#a89888', '#d8c8b0', '#f0e4d0'], bone: ['#8a8068', '#b8ae94', '#d8d0b8', '#ece4d0'],
  socket: '#1a0608', eye: '#ff7a3a', eyeHot: '#fff0a0', eyeDim: '#8a3a2a', mouth: '#2a0a10', tongue: '#c04858', fang: '#f4ecd8', bile: '#b8d060', bileHi: '#e0f0a0', bileLo: '#586c1c',
  gold: '#ffd36b', white: '#f6fbfc', red: '#ff6b6b', glow: '#ff9aa8', vein: '#6a2a5a', grey: '#9ab0c0',
};
const C = QCOL;
/* a pose: b = the thorax [x, y] (the floor is y = 0, up is negative); ab = the abdomen { dx, dy, s (size), tilt }; hd = the head { dx, dy, t (tilt, - looks up), open 0..1, puff 0..1, eye };
   lg = the four NEAR feet [x, y] front -> back (the far side is derived: +x shifted, darker; lgF overrides); sag 0..1 = how engorged the belly sack shows; root: 'in' | 'torn' | 'slack' | 'none'; fx = an effect key; float = no floor */
const P0 = { b: [0, -21], ab: { dx: -15, dy: 2, s: 1, tilt: 0 }, hd: { dx: 14, dy: -2, t: 0, open: 0, puff: 0, eye: 'dim' }, lg: [[22, 0], [13, 0], [-5, 0], [-18, 0]], sag: 0.5, root: 'in', fx: null };
const mk = o => ({ ...P0, ...o, ab: { ...P0.ab, ...(o.ab || {}) }, hd: { ...P0.hd, ...(o.hd || {}) } });
export const POSES = {
  qSleep:   mk({ b: [0, -12], ab: { dx: -14, dy: 4 }, hd: { dx: 12, dy: 5, t: 30, eye: 'closed' }, lg: [[15, 0], [8, 0], [-6, 0], [-14, 0]], sag: 0.8, fx: 'zz' }),
  qWake:    mk({ b: [0, -25], hd: { dx: 14, dy: -5, t: -22, open: 0.3, eye: 'flare' }, lg: [[24, -13], [14, -5], [-5, 0], [-18, 0]], fx: 'glint' }),
  qIdle:    mk({}),
  qSkitIdle: mk({ b: [0, -12], ab: { dx: -13, dy: 2, s: 0.9 }, hd: { dx: 13, dy: 0, t: 8, eye: 'dim' }, lg: [[24, 0], [15, 0], [-8, 0], [-21, 0]], root: 'none', fx: 'knot' }),
  qSkitter: mk({ b: [2, -12], ab: { dx: -13, dy: 1, s: 0.9, tilt: 4 }, hd: { dx: 13, dy: 1, t: 12, eye: 'glow' }, lg: [[24, 0], [14, 0], [-8, 0], [-21, 0]], root: 'none', fx: 'knot', gait: 20 }),
  qHop:     mk({ b: [2, -34], ab: { dx: -14, dy: 3, s: 0.9, tilt: 14 }, hd: { dx: 13, dy: -3, t: -8, open: 0.2, eye: 'glow' }, lg: [[24, -22], [16, -12], [-6, -16], [-18, -22]], root: 'none', float: 1, fx: 'knot' }),
  qRec:     mk({ b: [0, -16], ab: { dx: -14, dy: 4 }, hd: { dx: 13, dy: 4, t: 30, open: 0.5, eye: 'half' }, lg: [[20, 0], [11, 0], [-7, 0], [-19, 0]], fx: 'pant' }),
  qHurt:    mk({ b: [-2, -24], hd: { dx: 13, dy: -6, t: -28, open: 0.7, eye: 'squeeze' }, lg: [[20, -8], [11, 0], [-6, 0], [-19, 0]], ab: { dx: -16, dy: 0, tilt: -8 } }),
  qWard:    mk({ b: [0, -18], ab: { dx: -15, dy: 3 }, hd: { dx: 14, dy: 0, t: 4, eye: 'glow' }, lg: [[27, 0], [16, 0], [-8, 0], [-23, 0]], fx: 'grip' }),
  qLashWind: mk({ b: [3, -14], ab: { dx: -14, dy: -9, s: 1.04, tilt: -26 }, hd: { dx: 14, dy: 3, t: 22, open: 0.2, eye: 'flare' }, lg: [[28, 0], [20, 0], [-4, 0], [-17, 0]], fx: 'floorglow' }),
  qLashRel:  mk({ b: [9, -11], ab: { dx: -16, dy: 3, s: 0.98, tilt: 8 }, hd: { dx: 18, dy: 1, t: 16, open: 0.7, eye: 'glow' }, lg: [[37, 0], [27, 0], [4, 0], [-14, 0]], fx: 'burst' }),
  qSpitWind: mk({ b: [-4, -26], ab: { dx: -15, dy: 5, s: 1.02, tilt: 6 }, hd: { dx: 11, dy: -10, t: -40, open: 0.3, puff: 1, eye: 'flare' }, lg: [[17, -15], [10, -6], [-8, 0], [-20, 0]], fx: 'spitglow' }),
  qSpitRel:  mk({ b: [5, -21], ab: { dx: -15, dy: 2 }, hd: { dx: 20, dy: -1, t: 14, open: 1, eye: 'glow' }, lg: [[29, 0], [19, 0], [-3, 0], [-17, 0]], fx: 'spit' }),
  qThrumWind: mk({ b: [0, -34], ab: { dx: -15, dy: 4, s: 1.06, tilt: 16 }, hd: { dx: 13, dy: -2, t: -6, eye: 'flare' }, lg: [[25, 0], [14, 0], [-7, 0], [-21, 0]], sag: 0.9, fx: 'pulse' }),
  qThrumRel:  mk({ b: [0, -9], ab: { dx: -16, dy: 3, s: 0.98 }, hd: { dx: 15, dy: 4, t: 18, open: 0.5, eye: 'glow' }, lg: [[31, 0], [20, 0], [-10, 0], [-26, 0]], fx: 'shockflat' }),
  qConstrictWind: mk({ b: [2, -22], ab: { dx: -14, dy: 3 }, hd: { dx: 14, dy: -3, t: -12, open: 0.7, eye: 'flare' }, lg: [[31, -22], [24, -15], [-6, 0], [-19, 0]], fx: 'reach' }),
  qConstrictRel:  mk({ b: [8, -19], ab: { dx: -15, dy: 2, tilt: 6 }, hd: { dx: 15, dy: -1, t: 8, open: 1, eye: 'glow' }, lg: [[44, -19], [36, -10], [-2, 0], [-16, 0]], fx: 'taut' }),
  qBroodWind: mk({ b: [-2, -26], ab: { dx: -16, dy: -8, s: 1.28, tilt: -30 }, hd: { dx: 13, dy: 1, t: 20, open: 0.3, eye: 'squeeze' }, lg: [[21, 0], [12, 0], [-6, 0], [-20, 0]], sag: 1, fx: 'eggs' }),
  qBroodRel:  mk({ b: [2, -22], ab: { dx: -17, dy: -12, s: 1.12, tilt: -52 }, hd: { dx: 14, dy: 0, t: 6, open: 0.8, eye: 'flare' }, lg: [[24, 0], [15, 0], [-4, 0], [-17, 0]], sag: 0.4, fx: 'eggfling' }),
  qCrushWind: mk({ b: [-2, -40], ab: { dx: -15, dy: 8, s: 1.04, tilt: 38 }, hd: { dx: 12, dy: -6, t: -30, open: 0.4, eye: 'flare' }, lg: [[24, -34], [14, -24], [-8, 0], [-21, 0]], fx: 'heartswell' }),
  qCrushRel:  mk({ b: [2, -7], ab: { dx: -17, dy: 3, s: 0.96 }, hd: { dx: 17, dy: 4, t: 22, open: 0.9, eye: 'glow' }, lg: [[36, 0], [24, 0], [-14, 0], [-30, 0]], fx: 'shockflat' }),
  qFlushed:  mk({ b: [0, -10], ab: { dx: -14, dy: 3, s: 1.04, tilt: -14 }, hd: { dx: 13, dy: 3, t: 34, open: 0.8, eye: 'dizzy' }, lg: [[19, -28], [8, -33], [-8, -31], [-18, -24]], sag: 1, root: 'torn', gait: 9, fx: 'stars' }),
  qStranded: mk({ b: [0, -9], ab: { dx: -13, dy: 2, s: 0.92, tilt: -6 }, hd: { dx: 13, dy: 3, t: 40, open: 0.6, eye: 'dizzy' }, lg: [[15, -14], [7, -16], [-8, -13], [-16, -8]], sag: 1, root: 'none', gait: 6, fx: 'stars' }),
  qUproot:   mk({ b: [0, -31], ab: { dx: -14, dy: 6, s: 1.04, tilt: 24 }, hd: { dx: 13, dy: -5, t: -30, open: 0.6, eye: 'flare' }, lg: [[27, -18], [17, -26], [-14, -22], [-24, -12]], root: 'torn', fx: 'snap' }),
  qReroot:   mk({ b: [2, -13], ab: { dx: -14, dy: 2 }, hd: { dx: 14, dy: 4, t: 34, open: 0.4, eye: 'glow' }, lg: [[20, -6], [12, -10], [-6, -9], [-16, -4]], root: 'in', fx: 'rootdown' }),
  qDead:     mk({ b: [0, -6], ab: { dx: -14, dy: 3, s: 0.78 }, hd: { dx: 13, dy: 3, t: 52, open: 0.8, eye: 'dead' }, lg: [[17, -14], [8, -19], [-8, -17], [-17, -10]], sag: 0, root: 'slack', fx: null }),
};
export const poseNames = () => Object.keys(POSES);
export const WINDS = { lash: ['qLashWind', 'qLashRel'], spit: ['qSpitWind', 'qSpitRel'], thrum: ['qThrumWind', 'qThrumRel'], constrict: ['qConstrictWind', 'qConstrictRel'], brood: ['qBroodWind', 'qBroodRel'], crush: ['qCrushWind', 'qCrushRel'] };
const MODE_POSE = { sleep: 'qSleep', wake: 'qWake', idle: 'qIdle', hop: 'qHop', skitter: 'qSkitter', flushed: 'qFlushed', stranded: 'qStranded', uprootTell: 'qUproot', rerootTell: 'qReroot' };
/* sim mode -> pose name. o = { phase, hurtT, ward }. A recovery (lashRec ...) is the winded pose */
export function poseOfQueen(mode, o = {}) {
  const m = /^(.*)Tell$/.exec(mode || ''); if (m && WINDS[m[1]]) return WINDS[m[1]][0];
  if (WINDS[mode]) return WINDS[mode][1];
  if (/Rec$/.test(mode || '')) return 'qRec';
  if (o.ward && (mode === 'idle' || !mode)) return 'qWard';
  if (mode === 'idle' && o.phase === 2) return 'qSkitIdle';
  const p = MODE_POSE[mode]; if (p) return p;
  return o.hurtT > 0 ? 'qHurt' : (o.phase === 2 ? 'qSkitIdle' : 'qIdle');
}
let g_, X_, Y_, F_ = 1, TINT_ = 0, ALPHA_ = 1;
const rc = (dx, dy, w, h, c, a = 1) => { const al = a * ALPHA_; if (al !== 1) g_.globalAlpha = al; g_.fillStyle = TINT_ > 0 ? mixC(c, '#ffffff', TINT_) : c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); if (al !== 1) g_.globalAlpha = 1; };
const FL = L => flush(L, rc, C.out);
const sq = (x, y, c, a = 1) => rc(x, y, 1, 1, c, a);
const hashN = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };
const rotp = (dx, dy, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [dx * c - dy * s, dx * s + dy * c]; };
/* two-bone leg: the knee is the one of the two solutions that sits higher (a spider's raised knee) */
function ik(hip, foot, l1, l2) {
  const dx = foot[0] - hip[0], dy = foot[1] - hip[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.02) || 0.02, a = Math.atan2(dy, dx), cs = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), b = Math.acos(cs);
  const k1 = [hip[0] + Math.cos(a + b) * l1, hip[1] + Math.sin(a + b) * l1], k2 = [hip[0] + Math.cos(a - b) * l1, hip[1] + Math.sin(a - b) * l1];
  return k1[1] < k2[1] ? k1 : k2;
}
/* the rig of a pose at scale sc (time tm walks the gait) */
export function queenRig(P, sc = 1, tm = 0, bob = 0) {
  const B = [P.b[0] * sc, P.b[1] * sc + bob], gait = P.gait || 0;
  const A = [B[0] + P.ab.dx * sc, B[1] + P.ab.dy * sc], Hd = [B[0] + P.hd.dx * sc, B[1] + P.hd.dy * sc];
  const hipX = [9, 3, -4, -11], feet = (far) => P.lg.map((f, i) => { let fx = f[0] * sc + (far ? 4 * sc : 0), fy = f[1] * sc;
    if (gait) { const ph = tm * gait + i * 1.7 + (far ? 3.1 : 0), air = P.lg[i][1] < -8; if (air) { fx += Math.sin(ph) * 4 * sc; fy += Math.cos(ph) * 4 * sc; } else { fx += Math.sin(ph) * 4.5 * sc; fy -= Math.max(0, Math.cos(ph)) * 4 * sc; } }
    return [fx, fy]; });
  const legs = (far) => feet(far).map((F, i) => { const hip = [B[0] + hipX[i] * sc + (far ? 2 * sc : 0), B[1] + 4 * sc], K = ik(hip, F, 12 * sc, 13 * sc); return { hip, K, F }; });
  return { B, A, H: Hd, near: legs(false), far: legs(true) };
}
function leg(L, lg, ramp, sc, front) {
  const r0 = (front ? 2.9 : 2.6) * sc, r1 = 2.1 * sc;
  cap(L, lg.hip[0], lg.hip[1], lg.K[0], lg.K[1], r0, r1, ramp);
  cap(L, lg.K[0], lg.K[1], lg.F[0], lg.F[1], r1, 1.1 * sc, ramp);
  ell(L, lg.K[0], lg.K[1], 2.4 * sc, 2.4 * sc, ramp);   /* the knee */
  const d = [lg.F[0] - lg.K[0], lg.F[1] - lg.K[1]], n = Math.hypot(d[0], d[1]) || 1, ux = d[0] / n, uy = d[1] / n;
  poly(L, [[lg.F[0] - uy * 1.1, lg.F[1] + ux * 1.1], [lg.F[0] + uy * 1.1, lg.F[1] - ux * 1.1], [lg.F[0] + ux * 3.4 + 0.6, lg.F[1] + uy * 3.4 + 1]], C.bone[2]);   /* the hooked claw */
  pset(L, lg.K[0] - 1, lg.K[1] - 1, C.shell[3]);
}
/* THE ROOTS: a fan of pale tendrils from her underside into the floor; 'torn' = hanging, frayed, dripping; 'slack' = lying on the floor */
function roots(rig, P, tm, sc, o) {
  const L = new Layer(), n = 5, torn = P.root === 'torn', slack = P.root === 'slack';
  for (let i = 0; i < n; i++) { const x0 = rig.B[0] - 11 * sc + i * 5.5 * sc, y0 = rig.B[1] + 7 * sc, sw = o.still ? 0 : Math.sin(tm * 6 + i * 1.3);
    if (slack) { cap(L, x0, y0, x0 - 3 + (i - 2) * 4, -1.5, 1.5, 1.1, C.root); continue; }
    if (torn) { const x1 = x0 + (i - 2) * 3 + sw * 3, y1 = y0 + 8 + (i & 1) * 6, x2 = x1 + sw * 2 + (i - 2), y2 = y1 + 5; cap(L, x0, y0, x1, y1, 1.8, 1.4, C.root); cap(L, x1, y1, x2, y2, 1.4, 0.7, C.root); pset(L, x2, y2 + 1, C.blood[3]); continue; }
    const x1 = x0 + (i - 2) * 4, y1 = Math.min(-1, y0 + 8); cap(L, x0, y0, x1, y1, 2, 1.2, C.root); pset(L, x1, -1, C.blood[2]); pset(L, x0 + 1, y0 + 2, C.root[3]); }
  FL(L);
  if (!torn && !slack) for (let i = 0; i < n; i++) { const x1 = rig.B[0] - 11 * sc + i * 5.5 * sc + (i - 2) * 4; rc(x1 - 3, -1, 7, 1, C.blood[1], 0.7); }   /* where each root sinks into the heart */
}
export function drawQueen(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = o.alpha ?? 1; TINT_ = (o.flash > 0 || o.flashT > 0) ? 0.5 : 0;
  const phase = o.phase || 1, key = o.pose || poseOfQueen(o.mode, { phase, hurtT: o.hurtT, ward: o.ward }), P = o.P || POSES[key] || POSES.qIdle, body = !!o.bodyOnly, tm = time + (o.seed || 0);
  const sc = o.scale || (phase === 2 && key !== 'qUproot' && key !== 'qReroot' && !/^qDead$/.test(key) ? 0.84 : 1), bob = (!o.still && !P.float) ? Math.sin(tm * 2.0) * 0.8 : (!o.still ? Math.sin(tm * 5) * 1.5 : 0);
  const rig = queenRig(P, sc, tm, bob), flayed = phase === 3 || P.sag > 0.95 && key === 'qFlushed', raw = phase === 3;
  if (!body && P.root !== 'none') roots(rig, P, tm, sc, o);
  /* ---- the far legs (darker) ---- */
  for (let i = 3; i >= 0; i--) { const L = new Layer(); leg(L, rig.far[i], C.leg.map(c => mixC(c, '#0a0306', 0.22)), sc, i === 0); FL(L); }
  /* ---- the abdomen: a great engorged sack. back = pale banded plates; belly = blood-dark, bulging; a tilt lifts the rear ---- */
  { const L = new Layer(), a = rotp(1, 0, P.ab.tilt), s = P.ab.s * sc, rx = 17.5 * s, ry = 13.5 * s, tilt = P.ab.tilt * 0.5, ax = rig.A[0], ay = rig.A[1];
    ell(L, ax, ay + 2.4 * s, rx * 0.98, ry * 1.0, raw ? C.raw : C.blood, { rot: tilt });   /* the blood-filled belly, under */
    ell(L, ax, ay - 2.6 * s, rx, ry * 0.68, C.back, { rot: tilt, belly: undefined });   /* the pale back plates over it */
    for (let k = -3; k <= 3; k++) { const px = ax + k * 4.6 * s, ph = Math.sqrt(Math.max(0, 1 - (k / 3.7) ** 2)); if (ph < 0.2) continue; const t0 = rotp(k * 4.6 * s, -ry * 0.7 * ph, tilt), t1 = rotp(k * 4.6 * s, ry * 0.15 * ph, tilt); line(L, ax + t0[0], ay + t0[1], ax + t1[0], ay + t1[1], C.shell[0], 1); }   /* the segment bands */
    for (let k = 0; k < 7; k++) { const q = rotp(-rx * 0.7 + k * rx * 0.2, ry * 0.5 + (k % 2) * 1.5, tilt); pset(L, ax + q[0], ay + q[1], C.blood[3]); }   /* the veins of the sack showing through */
    if (P.sag > 0.2 || raw) for (let k = 0; k < 3; k++) { const q = rotp(-rx * 0.5 + k * rx * 0.45, ry * 0.62, tilt); ell(L, ax + q[0], ay + q[1], 1.8 * s, 1.3 * s, raw ? C.raw : C.blood); }   /* blood-heavy lobes along the underside */
    if (raw) { for (const [dx, dy] of [[-6, -6], [2, -8], [-11, -2], [6, -3]]) { const q = rotp(dx * s, dy * s, tilt); ell(L, ax + q[0], ay + q[1], 2.6 * s, 1.8 * s, C.raw); pset(L, ax + q[0] - 1, ay + q[1] - 1, C.raw[3]); } }   /* P3: the skin flayed off in patches, raw meat showing */
    if (phase === 2 || P.fx === 'knot') { /* THE ROOT-KNOT on her back: a bright gold boil, 1.0x from behind */ const q = rotp(-6 * s, -ry * 0.78, tilt), kx = ax + q[0], ky = ay + q[1]; ell(L, kx, ky, 3.2, 2.7, [C.gold, C.gold, C.eyeHot]); pset(L, kx - 1, ky - 1, C.white); }
    void a; FL(L); }
  /* ---- the near hind legs, then the thorax, the near front legs ---- */
  for (let i = 3; i >= 2; i--) { const L = new Layer(); leg(L, rig.near[i], C.leg, sc, false); FL(L); }
  { const L = new Layer(), bx = rig.B[0], by = rig.B[1], r = 8 * sc;
    ell(L, bx, by, r * 1.15, r * 0.95, C.shell, { tex: C.shell[1] });
    for (let k = 0; k < 4; k++) pset(L, bx - 3 + k * 2.6, by - r * 0.55 + (k & 1), C.shell[4]);
    line(L, bx - r, by + 1, bx + r * 0.4, by + 3, C.shell[0], 1);
    pset(L, bx + 1, by + 2, C.blood[2]); pset(L, bx - 2, by + 3, C.blood[2]);
    FL(L); }
  for (let i = 1; i >= 0; i--) { const L = new Layer(); leg(L, rig.near[i], C.leg, sc, true); FL(L); }
  /* ---- THE HEAD: the carapace mask, the crown of bone spikes, the brow, the eyes, the cheeks, the mouthparts ---- */
  headDraw(rig, P, key, tm, sc, o);
  if (body) return;
  fxDraw(P, rig, key, tm, o, sc, phase);
  void flayed;
}
function headDraw(rig, P, key, tm, sc, o) {
  const h = P.hd, H = rig.H, t = h.t, at = (dx, dy) => { const r = rotp(dx * sc, dy * sc, t); return [H[0] + r[0], H[1] + r[1]]; };
  const hx = H[0], hy = H[1], rx = 9.8 * sc * (1 + h.puff * 0.1), ry = 8.6 * sc;
  /* the mouthparts first: a pair of hooked palps and the central beak (they swell on the spit tell and open) */
  { const L = new Layer(), open = h.open, pf = h.puff;
    for (const s of [-1, 1]) { const b = at(4.6, 3.4), up = s < 0 ? -1.4 : 1.4, e = at(8.5 + open * 2.4, 5 + s * (1.2 + open * 4.2)), tip = at(10 + open * 3.8, 8.6 + s * (1.2 + open * 5.2)); void up;
      cap(L, b[0], b[1], e[0], e[1], (2.4 + pf * 1.2) * sc, 1.7 * sc, pf > 0.4 ? [mixC(C.bone[0], C.bileLo, 0.5), mixC(C.bone[1], C.bile, 0.35), mixC(C.bone[2], C.bile, 0.45)] : C.bone);
      poly(L, [[e[0] - 1, e[1] - 1.2], [e[0] + 1.4, e[1] + 1.2], [tip[0] + 0.6, tip[1] + 1.8]], C.fang); }
    const bk = at(6, 5.2), bt = at(9.4, 8 + open * 3.2); cap(L, bk[0], bk[1], bt[0], bt[1], 1.8 * sc, 0.8 * sc, C.bone);   /* the barbed beak */
    FL(L); }
  /* the head mass: pale carapace, a ridged crown of bone spikes, cheek ridges */
  { const L = new Layer();
    ell(L, hx, hy, rx, ry, C.shell, { rot: t * 0.4, tex: C.shell[1] });
    for (let k = 0; k < 5; k++) { const a = -2.6 + k * 0.55, bs = at(Math.cos(a) * 6.2 + 0.6, Math.sin(a) * 5.4 - 1.6), tp = at(Math.cos(a) * 9.8 + 0.8 + (k - 2) * 0.7, Math.sin(a) * 9.6 - 2.4); cap(L, bs[0], bs[1], tp[0], tp[1], 1.9 * sc, 0.5, C.bone); }   /* the crown */
    for (let k = 0; k < 3; k++) { const q = at(-5 + k * 1.8, -1 + k); pset(L, q[0], q[1], C.shell[0]); }
    for (const [dx, dy] of [[3, 4.4], [6, 3.2]]) { const q = at(dx, dy); pset(L, q[0], q[1], C.shell[0]); pset(L, q[0] + 1, q[1], C.shell[0]); }   /* the cheek ridges */
    const gv = at(-2.4, 2.4); pset(L, gv[0], gv[1], C.blood[2]); pset(L, gv[0] - 1, gv[1] + 1, C.blood[2]);
    FL(L); }
  /* the face: a heavy brow, TWO ember eyes (near 4x4, far peeking past), a short nose slit */
  { const L = new Layer(), ey = h.eye;
    const bl = ey === 'squeeze' || ey === 'half' ? 0.9 : ey === 'flare' ? -0.6 : 0.2;
    for (let k = 0; k < 9; k++) { const q = at(-0.2 + k * 1.15, -3.5 + bl + (k > 6 ? 0.9 : 0) - (k < 2 ? 0.4 : 0)); pset(L, q[0], q[1], C.socket); pset(L, q[0], q[1] + 1, C.shell[0]); }
    const eye = (dx, dy, w, hh, far) => { const q = at(dx, dy);
      if (ey === 'closed' || ey === 'squeeze') { for (let k = -1; k <= w; k++) pset(L, q[0] + k, q[1] + (ey === 'squeeze' ? (k & 1) : 0), C.socket); return; }
      if (ey === 'dead') { for (const [a, b] of [[0, 0], [1, 1], [1, 0], [0, 1]]) pset(L, q[0] + a + (far ? 0 : 0), q[1] + b, C.eyeDim); if (!far) { pset(L, q[0] - 1, q[1] - 1, C.socket); pset(L, q[0] + 2, q[1] + 2, C.socket); } return; }
      for (let j = -1; j <= hh; j++) for (let i = -1; i <= w; i++) pset(L, q[0] + i, q[1] + j, C.socket);   /* the hollow */
      const col = ey === 'flare' ? C.eyeHot : ey === 'dim' ? C.eyeDim : ey === 'half' ? C.eyeDim : C.eye, hs = ey === 'half' ? Math.max(1, hh - 2) : hh;
      for (let j = 0; j < hs; j++) for (let i = 0; i < w; i++) pset(L, q[0] + i, q[1] + j + (hh - hs), (i + j === 0 && ey !== 'dizzy') ? C.eyeHot : col);
      if (ey === 'dizzy') { pset(L, q[0], q[1], C.socket); pset(L, q[0] + 1, q[1] + 1, C.socket); }
      else pset(L, q[0] + (far ? 0 : 1), q[1] + 1, C.socket);   /* the slit pupil */ };
    eye(1.4, -1.8, 5, 4, false); eye(8.2, -1.4, 3, 3, true);
    const n = at(9.4, 1.4); pset(L, n[0], n[1], C.socket);
    FL(L); }
  /* THE MOUTH (claude/seaart2): a wide maw across the front of the face, drawn ON TOP of the mask so it reads in every idle - a dark gape, a row of fangs above and below, a red tongue when it opens,
     and two hooked mandibles that frame it; the crown's spikes are gold-tipped (a queen, not a tick) */
  if (key !== 'qDead') { const L = new Layer(), op = clamp(h.open, 0, 1), gape = 2.4 + op * 4.2, dead = h.eye === 'dead', cl = h.eye === 'closed' && !op;
    const up = (dx, dy) => at(dx, dy);
    const a = up(3.2, 3.6), b = up(9.8, 3.4), c2 = up(9.4, 3.6 + gape), d2 = up(3.8, 3.8 + gape * 0.9);
    poly(L, [a, b, c2, d2], cl ? C.blood[0] : C.mouth);
    if (!cl) { if (op > 0.3) { const tg = up(6.4, 3.6 + gape * 0.78); ell(L, tg[0], tg[1], 2.6 * sc, 1.2 * sc, [C.blood[1], C.tongue, C.tongue]); }
      for (let k = 0; k < 4; k++) { const p0 = up(3.8 + k * 1.9, 3.6), p1 = up(4.3 + k * 1.9, 3.6 + 1.5 + op * 1.1 + (k & 1) * 0.5), p2 = up(4.9 + k * 1.9, 3.6); poly(L, [p0, p1, p2], C.fang); }
      for (let k = 0; k < 3; k++) { const p0 = up(4.6 + k * 2.2, 3.7 + gape * 0.9), p1 = up(5.3 + k * 2.2, 3.7 + gape * 0.9 - 1.5 - op * 0.6), p2 = up(6 + k * 2.2, 3.7 + gape * 0.9); poly(L, [p0, p1, p2], C.fang); } }
    else line(L, a[0], a[1], b[0], b[1], C.socket, 1);
    for (const s2 of [0, 1]) { const m0 = up(s2 ? 9 : 1.2, 2.6), m1 = up(s2 ? 12.4 : 1.6 - op, 5.8 + op * 3 + gape * 0.3), m2 = up(s2 ? 13.6 : 0.6 - op * 1.4, 9.4 + op * 3.4 + s2 * 0.8);
      cap(L, m0[0], m0[1], m1[0], m1[1], 1.7 * sc, 1.3 * sc, C.bone); cap(L, m1[0], m1[1], m2[0], m2[1], 1.3 * sc, 0.4, C.bone); poly(L, [[m2[0] - 0.8, m2[1] - 1.6], [m2[0] + 0.8, m2[1] - 1.6], [m2[0] + (s2 ? 1.6 : -1.6), m2[1] + 1.8]], C.fang); }
    void dead; FL(L);
    for (let k = 0; k < 5; k++) { const a2 = -2.6 + k * 0.55, tp = at(Math.cos(a2) * 9.8 + 0.8 + (k - 2) * 0.7, Math.sin(a2) * 9.6 - 2.4); sq(R(tp[0]), R(tp[1]) - 1, C.gold); } }
  /* a cheek-swell on the spit tell: the bile sacs under the mask, glowing */
  if (h.puff > 0.2) { const L = new Layer(), q = at(5, 4.4), gl = Math.sin(tm * 18) > 0; ell(L, q[0], q[1], 3.6 + h.puff * 1.6, 3 + h.puff * 1.2, [mixC(C.shell[1], C.bile, 0.35), mixC(C.shell[2], C.bile, 0.5), mixC(C.shell[3], C.bileHi, 0.55)]); pset(L, q[0], q[1], gl ? C.bileHi : C.bile); pset(L, q[0] + 1, q[1] + 1, C.bile); FL(L); }
}
/* effects: not bodies (skipped by o.bodyOnly), never outlined */
function fxDraw(P, rig, key, tm, o, sc, phase) {
  const f = P.fx, H = rig.H, B = rig.B, A = rig.A, ab = P.ab, tl = (a, dx, dy, w, h2, c, al) => rc(a[0] + dx, a[1] + dy, w, h2, c, al);
  if (f === 'zz') { rc(H[0] + 8, H[1] - 10, 3, 1, C.white, 0.6); rc(H[0] + 9, H[1] - 9, 1, 1, C.white, 0.6); rc(H[0] + 8, H[1] - 8, 3, 1, C.white, 0.6); }
  if (f === 'glint') { rc(H[0] + 9, H[1] - 2, 3, 1, C.eyeHot, 0.9); rc(H[0] + 10, H[1] - 3, 1, 3, C.eyeHot, 0.9); }
  if (f === 'pant') for (let i = 0; i < 3; i++) rc(H[0] + 10 + i * 3, H[1] + 5 + (((tm * 6 + i) % 3) | 0), 2, 1, C.white, 0.5 - i * 0.12);
  if (f === 'floorglow') { const k = 0.5 + 0.5 * Math.sin(tm * 22); for (let i = 0; i < 4; i++) rc(B[0] + 18 + i * 9, -2, 6, 2, C.red, 0.25 + 0.4 * k); for (let i = 0; i < 3; i++) rc(B[0] + 22 + i * 11, -4 - (i & 1), 1, 2, C.red, 0.6); }
  if (f === 'burst') { for (let i = 0; i < 6; i++) { const x = B[0] + 22 + i * 7; rc(x, -3 - (i & 1) * 6, 2, 6 + (i & 1) * 4, C.root[2], 0.9); rc(x - 2, -2, 6, 2, C.blood[1], 0.7); } }
  if (f === 'spitglow') { const k = 0.5 + 0.5 * Math.sin(tm * 20); rc(H[0] + 7, H[1] + 2, 6, 5, C.bileHi, 0.2 + 0.4 * k); for (let i = 0; i < 4; i++) rc(H[0] + 5 + i * 3, H[1] - 10 - ((tm * 12 + i * 3) % 6), 1, 2, C.bile, 0.8); rc(H[0] - 3, H[1] - 13, 1, 3, C.red, 0.8); rc(H[0] - 3, H[1] - 9, 1, 1, C.red, 0.8); }
  if (f === 'spit') { for (let i = 0; i < 4; i++) rc(H[0] + 12 + i * 4, H[1] + 2 + (i & 1) * 2, 3, 2, i & 1 ? C.bile : C.bileHi, 0.9 - i * 0.15); }
  if (f === 'pulse') { const k = 0.5 + 0.5 * Math.sin(tm * 14); for (let i = 0; i < 3; i++) { const r = 9 + i * 6 + k * 3; rc(B[0] - r, -2, 1, 2, C.glow, 0.6 - i * 0.15); rc(B[0] + r, -2, 1, 2, C.glow, 0.6 - i * 0.15); } rc(A[0] - 6, A[1] - 10, 12, 1, C.glow, 0.25 + 0.4 * k); }
  if (f === 'shockflat') { for (let i = 0; i < 5; i++) { rc(B[0] + 22 + i * 12, -2 - (i & 1), 6, 1, C.white, 0.5); rc(B[0] - 24 - i * 12, -2 - (i & 1), 6, 1, C.white, 0.4); } for (let i = 0; i < 4; i++) rc(B[0] + 14 + i * 9, -6 - (i & 1) * 4, 2, 2, C.blood[3], 0.8); }
  if (f === 'reach') { const k = 0.5 + 0.5 * Math.sin(tm * 16); for (let i = 0; i < 2; i++) { const F = rig.near[i].F; rc(F[0] + 2, F[1] - 1, 4, 1, C.glow, 0.5 + 0.3 * k); rc(F[0] + 6, F[1], 3, 1, C.glow, 0.4); } }
  if (f === 'taut') { for (let i = 0; i < 2; i++) { const F = rig.near[i].F; rc(F[0] + 1, F[1] - 1, 6, 2, C.glow, 0.8); rc(F[0] + 7, F[1], 5, 1, C.white, 0.5); } }
  if (f === 'eggs') { for (let k = 0; k < 4; k++) { const e = rotp(-ab.s * 10 + k * 5, ab.s * 9 + (k & 1) * 2, ab.tilt * 0.5); rc(A[0] + e[0] - 1, A[1] + e[1] - 1, 4, 4, '#e8e0b0', 0.9); rc(A[0] + e[0], A[1] + e[1], 1, 1, '#a89860'); } }
  if (f === 'eggfling') { for (let k = 0; k < 3; k++) rc(A[0] - 10 - k * 6, A[1] - 14 - k * 4 + Math.sin(tm * 12 + k) * 2, 4, 4, '#e8e0b0', 0.95 - k * 0.2); rc(A[0] - 8, A[1] - 8, 3, 1, C.white, 0.5); }
  if (f === 'heartswell') { const k = 0.5 + 0.5 * Math.sin(tm * 16); for (let i = 0; i < 6; i++) rc(B[0] - 18 + i * 7, -3 - k * 3, 3, 3, C.red, 0.4 + 0.4 * k); rc(B[0] - 20, -1, 44, 1, C.glow, 0.3 + 0.4 * k); }
  if (f === 'stars') for (let i = 0; i < 3; i++) { const a = tm * 5 + i * 2.1; rc(H[0] + Math.cos(a) * 7 - 1, H[1] - 11 + Math.sin(a) * 3, 2, 2, C.gold); }
  if (f === 'grip') { for (let i = 0; i < 5; i++) { const x = B[0] - 14 + i * 7; rc(x - 2, -1, 6, 1, C.grey, 0.7); rc(x, -3 - (i & 1), 1, 3, C.grey, 0.6); } }
  if (f === 'snap') { for (let i = 0; i < 6; i++) rc(B[0] - 14 + i * 6, B[1] + 10 + (i & 1) * 3 + ((tm * 18 + i) % 4), 1, 3, C.white, 0.7); rc(B[0] - 3, B[1] + 8, 7, 1, C.gold, 0.8); }
  if (f === 'rootdown') { for (let i = 0; i < 5; i++) rc(B[0] - 8 + i * 5, B[1] + 8 + (i & 1) * 2, 2, Math.max(3, -(B[1] + 8) - 2 - (i & 1) * 2), C.root[2], 0.8); }
  if (f === 'knot') { const k = 0.5 + 0.5 * Math.sin(tm * 8), r = rotp(-6 * P.ab.s * sc, -13.5 * P.ab.s * 0.78 * sc, P.ab.tilt * 0.5); rc(A[0] + r[0] - 3, A[1] + r[1] - 3, 7, 7, C.gold, 0.12 + 0.2 * k); }
  void tl; void phase;
}
/* THE FALL: k 0..1 - she is torn off the heart: legs curl up over her, the sack sags and the blood runs out under her, the eyes go out, the roots lie slack; fades */
export function drawQueenDead(g, x, y, f, k, time = 0, o = {}) {
  const kk = clamp(k), A = POSES.qFlushed, B = POSES.qDead, e = kk < 0.3 ? kk / 0.3 * 0.35 : 0.35 + (kk - 0.3) / 0.7 * 0.65, mx = (p, q, a) => p.map((v, i) => lerp(v, q[i], a));
  const P = { ...B, b: mx(A.b, B.b, e), ab: { ...B.ab, dx: lerp(A.ab.dx, B.ab.dx, e), dy: lerp(A.ab.dy, B.ab.dy, e), s: lerp(A.ab.s, B.ab.s, e), tilt: lerp(A.ab.tilt, B.ab.tilt, e) }, hd: { ...B.hd, dx: lerp(A.hd.dx, B.hd.dx, e), dy: lerp(A.hd.dy, B.hd.dy, e), t: lerp(A.hd.t, B.hd.t, e), eye: kk > 0.25 ? 'dead' : 'dizzy' },
    lg: A.lg.map((q, i) => mx(q, B.lg[i], e)), gait: 0, sag: 1 - e, root: kk > 0.3 ? 'slack' : 'torn', fx: null };
  if (!o.bodyOnly) { g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = (kk > 0.85 ? 1 - (kk - 0.85) / 0.15 * 0.9 : 1); TINT_ = 0;
    const pw = 14 + e * 26; rc(-pw, -2, pw * 2, 2, C.blood[1], 0.9); rc(-pw * 0.7, -3, pw * 1.4, 1, C.blood[2], 0.8); rc(-pw * 0.4, -3, 3, 1, C.blood[3], 0.7); }
  drawQueen(g, x, y, f, { ...o, P, alpha: (kk > 0.85 ? 1 - (kk - 0.85) / 0.15 * 0.9 : 1), still: true, flash: 0, scale: 1 }, time);
  if (!o.bodyOnly) { g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = 1; TINT_ = 0; for (let i = 0; i < 5; i++) { const up = ((time * 16 + i * 8) % 36) * (0.3 + kk); rc(-14 + i * 7, -24 - up, 2, 2, C.glow, 0.8 * (1 - kk * 0.6)); } }
}
/* ---- the pieces the hands lay on the floor and in the air ---- */
/* ROOT LASH: the marked stretch (tell: the floor swells and reddens) and the roots bursting out of it (release). cx = the stretch's centre on screen, fy = the floor, w, h = its box */
export function drawLash(g, cx, fy, w, h, mode, time = 0, k = 1) {
  g_ = g; X_ = R(cx); Y_ = R(fy); F_ = 1; ALPHA_ = 1; TINT_ = 0;
  if (mode === 'tell') { const p = 0.45 + 0.4 * Math.sin(time * 22);
    const L = new Layer(); for (let i = -w; i <= w; i += 2) { const hh = Math.max(1, R((1 - Math.abs(i) / (w + 1)) * 4 * (0.5 + p * 0.5))); for (let j = 0; j < hh; j++) L.set(i, -j, j === hh - 1 ? C.blood[3] : C.blood[2]); } FL(L);
    for (let i = -w; i <= w; i += 5) rc(i, -2, 2, 1, C.red, 0.5 + 0.4 * p); rc(-w, 0, w * 2, 1, C.red, 0.35 + 0.35 * p);
    for (let i = -2; i <= 2; i++) rc(i * 8 - 1, -6 - (i & 1) * 2 - p * 2, 1, 2, C.gold, 0.6); return; }
  for (let i = -2; i <= 2; i++) { const L = new Layer(), x0 = i * 8, hh = h * (0.85 + (i & 1) * 0.15) * clamp(k * 1.4), sw = Math.sin(time * 20 + i) * 1.5;
    cap(L, x0, 1, x0 + sw, -hh * 0.5, 3.2, 2.4, C.root); cap(L, x0 + sw, -hh * 0.5, x0 + sw * 1.6 + (i < 0 ? -2 : 2), -hh, 2.4, 0.7, C.root);
    for (let q = 0; q < 3; q++) pset(L, x0 + sw * 0.5 + 1, -hh * (0.2 + q * 0.25), C.root[3]);
    pset(L, x0 + sw * 1.6 + (i < 0 ? -2 : 2), -hh - 1, C.bone[3]); FL(L); rc(x0 - 4, -1, 9, 2, C.blood[1], 0.8); }
}
/* HEART THRUM: one ring edge (a ridge of flesh running along the floor): h = its height, dir = +1 | -1 */
export function drawThrumRing(g, x, fy, h, dir, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(fy); F_ = 1; ALPHA_ = 1; TINT_ = 0; const k = 0.5 + 0.5 * Math.sin(time * 26), L = new Layer();
  poly(L, [[-5 * dir, 0], [-2 * dir, -h * 0.6], [1 * dir, -h], [4 * dir, -h * 0.5], [6 * dir, 0]], [C.blood[3], C.blood[2]]);
  for (let i = 0; i < 3; i++) pset(L, (-1 + i) * dir, -h * 0.6 + i, C.glow);
  FL(L); rc(-6 * dir - (dir < 0 ? 0 : 0), -1, 12, 1, C.glow, 0.4 + 0.4 * k); rc(8 * dir, -h - 1 + (k > 0.5 ? 1 : 0), 2, 2, C.white, 0.6);
}
/* a sinew TENDRIL from (x0, y0) to (x1, y1): the CONSTRICT reach. tight = 0 (the tell: thin, faint, wavering) .. 1 (pulling: thick, bright, barbed tip) */
export function drawTendril(g, x0, y0, x1, y1, tight = 1, time = 0) {
  g_ = g; X_ = 0; Y_ = 0; F_ = 1; ALPHA_ = tight < 0.5 ? 0.6 : 1; TINT_ = 0; const L = new Layer(), n = 10, th = tight < 0.5 ? 1.0 : 1.9, dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  let px0 = x0, py0 = y0;
  for (let i = 1; i <= n; i++) { const t = i / n, w = Math.sin(t * 9 + time * (tight < 0.5 ? 10 : 24)) * (tight < 0.5 ? 3.2 : 1.2) * Math.sin(t * Math.PI), px = x0 + dx * t + nx * w, py = y0 + dy * t + ny * w;
    cap(L, px0, py0, px, py, th * (1 - t * 0.35), th * (1 - (i + 1) / n * 0.35), tight < 0.5 ? [C.root[0], C.root[1], C.root[1]] : C.root); px0 = px; py0 = py; if (i % 3 === 0 && tight >= 0.5) pset(L, px + nx * 2, py + ny * 2, C.root[3]); }
  const e = [x1, y1]; for (const s of [-1, 1]) poly(L, [[e[0], e[1]], [e[0] + nx * 3 * s - dx / len * 3, e[1] + ny * 3 * s - dy / len * 3], [e[0] - dx / len * 1, e[1] - dy / len * 1]], C.bone[2]);
  FL(L);
}
/* an EGG SAC (the brood: a leathery sac with a curled leech inside; ripening to hatch). ripe 0..1 */
export function drawEgg(g, x, y, ripe = 0, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = 1; ALPHA_ = 1; TINT_ = 0; const L = new Layer(), th = ripe > 0.6 ? Math.sin(time * 26) * 0.6 : 0;
  ell(L, th, -5, 5.6, 5.8, ['#6a5a30', '#a89860', '#d8cc98', '#f0e8c0'], { tex: '#6a5a30' });
  ell(L, th, -5, 2.8, 3.4, [C.blood[1], C.blood[2], ripe > 0.6 ? C.red : C.blood[3]]);   /* the embryo's dark shape */
  pset(L, 1 + th, -6, C.white); pset(L, -2, -8, '#f0e8c0'); line(L, -3, -2, 3, -3, '#a89860', 1);
  FL(L); if (ripe > 0.6) rc(-6, -12, 12, 1, C.glow, 0.5 + 0.4 * Math.sin(time * 26));
}
/* HEART CRUSH: the whole floor pulses - a band of swollen flesh along the floor from x0 to x1 (screen px), tell = a red wash, on = a heave */
export function drawCrushFloor(g, x0, x1, fy, h, on, time = 0) {
  g_ = g; X_ = 0; Y_ = 0; F_ = 1; ALPHA_ = 1; TINT_ = 0; const k = 0.5 + 0.5 * Math.sin(time * (on ? 30 : 22)), w = x1 - x0;
  for (let i = 0; i < w; i += 4) { const hh = on ? h * (0.55 + 0.45 * Math.sin(i * 0.18 + time * 40)) : h * 0.3 * (0.5 + 0.5 * Math.sin(i * 0.12 + time * 18)); rc(x0 + i, fy - hh, 4, hh, on ? C.blood[3] : C.blood[2], on ? 0.85 : 0.25 + 0.3 * k); if (on) rc(x0 + i, fy - hh - 1, 4, 1, C.glow, 0.8); }
}
