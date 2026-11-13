// drowned_crew_art.js - THE SUNKEN CREW (four sheets) + THE CURSED SAILOR, THE HAND-DRAWN POSE SET (claude/d3art, 2026-11-12). The Deep 3 greybox (src/deep3-hands.js) drew each sailor as a grey
// rectangle with a stick for a weapon; this draws THEM: four drowned men of the Salt Widow, each a stack of OUTLINED MASSES (legs, coat tail, torso, head with its hat, far arm, near arm, his weapon) in the
// pattern of the Drowned King 2 / Naga Queen sheets (every TELL changes the body's silhouette, not just the weapon; every face is a pale skull with dark sockets and ONE cyan lantern-light eye that
// flares in a windup). Pure drawing, fillRect only (tools/d3-art-sheet.mjs rasterises it in node, no browser). g = a 2d context, (x, y) = the feet on screen, f = facing (+1 right),
// o = { role: 'cutlass'|'shield'|'harpoon'|'heavy'|'sailor', stance (the Sailor's: cutlass|shield|harpoon|anchor), mode (the sim's mode), pose (a name, overrides mode), flash, hurtT, seed, bodyOnly, still, alpha }.
// WHO: THE CUTLASS (blue coat, red sash, a ruined tricorn, a curved blade) | THE SHIELD (iron breastplate + visor helm, a studded round shield) | THE HARPOONER (oilskin hood, a barbed iron, a rope bandolier)
//      | THE HEAVY (bare barnacled giant, chains, the ship's anchor) | THE CURSED SAILOR (all four fused: a captain's hat crusted in barnacles, a coat of four coats, four souls burning in a rib cage, big).
// THE POSES (src/sunken-crew.js POSE names them; every told move has a WINDUP + a RELEASE pose, B16):
//   crewSwim / crewSwimFast / crewSleep / crewWake / crewRecover / crewReel / crewRaise / crewStagger / crewCorpse | cutLungeWind (crouched, blade drawn back low) -> cutLungeRel (a long line, arm locked)
//   cutFlurryWind (blade high over the head) -> cutFlurryRel (a diagonal cut, arc) | shBashWind (shield pulled to the chest) -> shBashRel (shoulder-first, shield out) | shGuardWind (shield swung up)
//   -> shGuardHold (planted, huge, crouched behind it, a glowing rim) | shBroken (halves on the floor, doubled over) | hpThrowWind (arm cocked, point on you) -> hpThrowRel (empty hand, follow-through)
//   hpReelWind (aiming, two hands) -> hpReelRel (the line out, hauling back) | hvSlamWind (anchor over the head, two hands) -> hvSlamRel (driven into the floor, a shock) | hvChargeWind (wound low,
//   anchor behind) -> hvChargeRel (a bull run, sparks) | sailorMerge / sailorIdle / sailorSwapWind / sailorSwapStagger / sailorStuck / sailorWard / sailorFall
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp, lerp, pol } from './sr_draw.js';
const R = Math.round;
export const DCOL = {
  out: '#090e12',
  skin: ['#2e4448', '#4a6a6c', '#7a9a98', '#b8d2ca'], socket: '#06100f', eye: '#7ff0e0', eyeHot: '#f0fffa', eyeDim: '#3fa89c', mouth: '#120a0e', teeth: '#e8e2cc',
  cutlass: { coat: ['#16222e', '#25384a', '#3a566c', '#5a7e94'], trim: ['#5c4527', '#8a6a28', '#c8a24a', '#e8c24c'], sash: ['#4a1a24', '#7a2a32', '#a03a42', '#c86058'], hat: ['#10161c', '#1c2630', '#2c3a46'] },
  shield: { coat: ['#2a3036', '#474e58', '#6e7886', '#aab4c4'], trim: ['#5c4527', '#8a6a28', '#c8a24a', '#e8c24c'], cloth: ['#2a2a22', '#44442e', '#5e5e3e'], wood: ['#2c2218', '#463624', '#6a5238', '#8a6e4c'] },
  harpoon: { coat: ['#1e2a16', '#324620', '#4e6a2c', '#7a9a3c'], trim: ['#5a4a30', '#8a7650', '#b4a478'], hood: ['#16200e', '#263818', '#3c5424'] },
  heavy: { coat: ['#2a3036', '#3e4a50', '#5e6e72', '#8a9ea0'], pants: ['#1a2024', '#2c363a', '#46545a'], chain: ['#2a3036', '#6e7886', '#aab4c4'] },
  sailor: { coat: ['#0e161c', '#1a2832', '#2c4452', '#486c7c'], trim: ['#5c4527', '#8a6a28', '#c8a24a', '#e8c24c'], hat: ['#0a1014', '#141e26', '#243440'] },
  iron: ['#2a3036', '#474e58', '#6e7886', '#aab4c4', '#e8ecf4'], bone: ['#8a8068', '#b8ae94', '#d8d0b8'], barn: ['#5e5a50', '#8c8878', '#b8b4a2', '#d8d4c0'], kelp: ['#1d4224', '#3c5624', '#5d7d36'],
  rope: ['#6a5a3a', '#9a8458', '#c8b078'], soul: { cutlass: '#5aa8d8', shield: '#d8d0a0', harpoon: '#8ad060', heavy: '#b080d8' }, gold: '#ffd36b', white: '#f6fbfc', spark: '#fff0a8', red: '#ff6b6b', glow: '#7ff0e0',
};
const D = DCOL;
export const ROLES = ['cutlass', 'shield', 'harpoon', 'heavy'];
export const ROLE_OF_STANCE = { cutlass: 'cutlass', shield: 'shield', harpoon: 'harpoon', anchor: 'heavy' };
/* ---- the pose tables. fields: b = hip [x, y]; lean0 / lean = lower / upper torso lean (deg, + forward); lg = [far foot, near foot] [x, y]; hd = { t tilt (- looks up), dx, dy, open 0..1, eye };
   aF / aB = near / far arm [upper deg, len, fore deg, len] on SCREEN (0 forward, 90 down); w = the weapon { a deg, grip 0..1 butt->tip, len, two (far hand on it) } or null; sh = the shield { ox, oy (from the near hand), r, st };
   fx = an effect key; float = lifts the body off the floor. ---- */
const P0 = { b: [0, -12], lean0: 0, lean: 0, lg: [[-3, 0], [3, 0]], hd: { t: 0, dx: 0, dy: 0, open: 0, eye: 'dim' }, aF: [70, 5.5, 40, 5], aB: [95, 5.5, 70, 5], w: 'carry', fx: null };
const mk = o => ({ ...P0, ...o, hd: { ...P0.hd, ...(o.hd || {}) } });
export const COMMON = {
  crewSwim:     mk({ b: [0, -13], lean0: 8, lean: 12, lg: [[-7, -2], [-12, -3]], hd: { t: 6 }, aF: [58, 5.5, 18, 5.5], aB: [100, 5.5, 75, 5], float: 1 }),
  crewSwimFast: mk({ b: [0, -12], lean0: 28, lean: 36, lg: [[-11, -3], [-17, -5]], hd: { t: 20, eye: 'glow' }, aF: [122, 5.5, 150, 5], aB: [112, 5.5, 140, 5], w: 'drag', float: 1, fx: 'speed' }),
  crewSleep:    mk({ b: [-3, -6], lean0: 34, lean: 58, lg: [[9, 0], [3, 0]], hd: { t: 56, dy: 2, eye: 'closed' }, aF: [80, 5, 95, 5], aB: [90, 5, 100, 5], w: 'floor', fx: 'zz' }),
  crewWake:     mk({ b: [0, -10], lean0: -6, lean: 4, lg: [[-4, 0], [4, 0]], hd: { t: -14, eye: 'flare', open: 0.3 }, aF: [18, 5.5, -22, 5.5], aB: [60, 5, 10, 5], fx: 'glint' }),
  crewRecover:  mk({ b: [1, -9], lean0: 22, lean: 42, lg: [[-4, 0], [6, 0]], hd: { t: 36, open: 0.5 }, aF: [72, 5.5, 52, 5], aB: [82, 5, 62, 5], w: 'drag' }),
  crewReel:     mk({ b: [-2, -12], lean0: -16, lean: -30, lg: [[-3, 0], [3, 0]], hd: { t: -32, open: 0.8, eye: 'closed' }, aF: [-80, 5, -40, 5], aB: [140, 5, 110, 5], fx: 'stars' }),
  crewRaise:    mk({ b: [0, -6], lean0: 24, lean: 36, lg: [[4, 0], [-8, 0]], hd: { t: 22, eye: 'glow' }, aF: [40, 5.5, 72, 5], aB: [28, 5, 66, 5], w: 'floor', fx: 'raise' }),
  crewStagger:  mk({ b: [0, -11], lean0: -6, lean: -14, lg: [[-5, 0], [5, 0]], hd: { t: -26, eye: 'dizzy', open: 0.3 }, aF: [102, 5, 118, 5], aB: [80, 5, 98, 5], w: 'droop', fx: 'stars' }),
  crewCorpse:   mk({ b: [-9, -3], lean0: 82, lean: 88, lg: [[-20, -1], [-23, -3]], hd: { t: 22, eye: 'dead' }, aF: [100, 5, 124, 5], aB: [94, 5, 112, 5], w: 'floor' }),
  crewHurt:     mk({ b: [-2, -12], lean0: -12, lean: -22, lg: [[-4, 0], [3, 0]], hd: { t: -22, open: 0.6, eye: 'closed' }, aF: [-70, 5, -20, 5], aB: [130, 5, 100, 5] }),
};
export const ROLE_POSES = {
  cutlass: {
    cutLungeWind:  mk({ b: [-3, -9], lean0: -10, lean: -22, lg: [[-10, 0], [4, 0]], hd: { t: -6, eye: 'flare' }, aF: [152, 5.5, 172, 5], aB: [-8, 5, -3, 5], w: { a: -3, grip: 0.2, len: 23 }, fx: 'glint' }),
    cutLungeRel:   mk({ b: [8, -9], lean0: 54, lean: 66, lg: [[-15, -1], [-9, -1]], hd: { t: 22, open: 0.8 }, aF: [0, 6, 0, 6.5], aB: [122, 5, 100, 5], w: { a: 4, grip: 0.12, len: 24 }, fx: 'speed' }),
    cutFlurryWind: mk({ b: [0, -12], lean0: -4, lean: -12, lg: [[-4, 0], [4, 0]], hd: { t: -10, eye: 'flare' }, aF: [-102, 5.5, -72, 5.5], aB: [60, 5, 20, 5], w: { a: -78, grip: 0.18, len: 23 }, fx: 'glint' }),
    cutFlurryRel:  mk({ b: [3, -11], lean0: 14, lean: 26, lg: [[-5, 0], [7, 0]], hd: { t: 14, open: 0.5 }, aF: [10, 5.5, 36, 5.5], aB: [82, 5, 40, 5], w: { a: 44, grip: 0.15, len: 23 }, fx: 'arc' }),
  },
  shield: {
    shBashWind:  mk({ b: [-2, -11], lean0: 4, lean: 8, lg: [[-6, 0], [4, 0]], hd: { t: 2, eye: 'flare' }, aF: [82, 4.5, -112, 4], aB: [100, 5, 76, 5], w: null, sh: { ox: 4, oy: -3, r: 8, st: 'carry' }, fx: 'glint' }),
    shBashRel:   mk({ b: [7, -10], lean0: 38, lean: 48, lg: [[-11, 0], [0, 0]], hd: { t: 14, open: 0.4 }, aF: [-4, 6, 0, 7], aB: [112, 5, 82, 5], w: null, sh: { ox: 6, oy: 0, r: 8.5, st: 'bash' }, fx: 'speed' }),
    shGuardWind: mk({ b: [-1, -9], lean0: 12, lean: 24, lg: [[-7, 0], [5, 0]], hd: { t: 14, eye: 'glow' }, aF: [-40, 5, -82, 5], aB: [90, 5, 60, 5], w: null, sh: { ox: 5, oy: -7, r: 9, st: 'raise' } }),
    shGuardHold: mk({ b: [0, -8], lean0: 18, lean: 28, lg: [[-8, 0], [6, 0]], hd: { t: 20 }, aF: [20, 5, 0, 5.5], aB: [70, 5, 40, 5], w: null, sh: { ox: 8, oy: -4, r: 11, st: 'guard' }, fx: 'rim' }),
    shBroken:    mk({ b: [0, -9], lean0: 40, lean: 62, lg: [[-4, 0], [5, 0]], hd: { t: 50, eye: 'dizzy' }, aF: [82, 5, 100, 5], aB: [90, 5, 106, 5], w: null, sh: { ox: 8, oy: 7, r: 8, st: 'broken' }, fx: 'stars' }),
  },
  harpoon: {
    hpThrowWind: mk({ b: [-3, -12], lean0: -14, lean: -24, lg: [[-8, 0], [3, 0]], hd: { t: -14, eye: 'flare' }, aF: [-122, 5.5, -166, 5.5], aB: [-22, 5, 4, 5], w: { a: -14, grip: 0.22, len: 30 }, fx: 'glint' }),
    hpThrowRel:  mk({ b: [4, -11], lean0: 30, lean: 44, lg: [[-10, 0], [6, 0]], hd: { t: 20, open: 0.4 }, aF: [-10, 6, 5, 7], aB: [132, 5, 110, 5], w: null, fx: 'throw' }),
    hpReelWind:  mk({ b: [0, -10], lean0: 14, lean: 22, lg: [[-8, 0], [5, 0]], hd: { t: 12, eye: 'flare' }, aF: [22, 5.5, -4, 6], aB: [34, 5, 18, 5], w: { a: -3, grip: 0.3, len: 30, two: 1 }, fx: 'coil' }),
    hpReelRel:   mk({ b: [2, -11], lean0: -10, lean: -22, lg: [[-6, 0], [6, 0]], hd: { t: -8, open: 0.5 }, aF: [-10, 6, -2, 6.5], aB: [152, 5, 172, 5], w: { a: -2, grip: 0.3, len: 30 }, fx: 'rope' }),
  },
  heavy: {
    hvSlamWind:   mk({ b: [0, -12], lean0: -12, lean: -28, lg: [[-8, 0], [8, 0]], hd: { t: -22, eye: 'flare' }, aF: [-106, 6, -92, 6], aB: [-90, 6, -80, 6], w: { a: -86, grip: 0.38, len: 30, two: 1 }, fx: 'glint' }),
    hvSlamRel:    mk({ b: [5, -9], lean0: 40, lean: 58, lg: [[-8, 0], [9, 0]], hd: { t: 24, open: 0.7 }, aF: [28, 6, 52, 6], aB: [44, 6, 60, 6], w: { a: 66, grip: 0.38, len: 30, two: 1 }, fx: 'shock' }),
    hvChargeWind: mk({ b: [-3, -9], lean0: 28, lean: 44, lg: [[-10, 0], [3, 0]], hd: { t: 26, eye: 'flare' }, aF: [100, 5, 72, 5], aB: [92, 5, 62, 5], w: { a: 168, grip: 0.2, len: 30 }, fx: 'glint' }),
    hvChargeRel:  mk({ b: [8, -9], lean0: 58, lean: 74, lg: [[-14, -1], [-6, -1]], hd: { t: 32, open: 0.9 }, aF: [96, 6, 122, 6], aB: [102, 5, 132, 5], w: { a: 174, grip: 0.2, len: 30 }, fx: 'speed' }),
  },
};
const CARRY = { cutlass: { a: 36, grip: 0.15, len: 23 }, shield: null, harpoon: { a: -72, grip: 0.34, len: 31 }, heavy: { a: 104, grip: 0.3, len: 26 } };
const CARRY_SH = { ox: 3, oy: 4, r: 8, st: 'carry' };
export const SAILOR_POSES = {
  sailorIdle:        mk({ b: [0, -12], lean0: 4, lean: 12, lg: [[-5, 0], [5, 0]], hd: { t: 8 }, aF: [55, 6, 15, 6], aB: [96, 6, 82, 6] }),
  sailorMerge:       mk({ b: [0, -15], lean0: 0, lean: -8, lg: [[-4, -4], [4, -5]], hd: { t: -34, open: 1, eye: 'flare' }, aF: [-38, 6, -72, 6], aB: [-142, 6, -110, 6], w: null, fx: 'souls', float: 1 }),
  sailorSwapWind:    mk({ b: [0, -12], lean0: -6, lean: -18, lg: [[-7, 0], [6, 0]], hd: { t: -18, eye: 'flare' }, aF: [-62, 6, -108, 6], aB: [-100, 6, -70, 6], w: { a: -74, grip: 0.4, len: 30 }, fx: 'swap' }),
  sailorSwapStagger: mk({ b: [0, -8], lean0: 42, lean: 62, lg: [[-6, 0], [6, 0]], hd: { t: 50, eye: 'dizzy', open: 0.4 }, aF: [88, 6, 104, 6], aB: [92, 6, 108, 6], w: 'floor', fx: 'stars' }),
  sailorStuck:       mk({ b: [-3, -11], lean0: -6, lean: -16, lg: [[-9, 0], [4, 0]], hd: { t: -2, open: 0.6 }, aF: [-20, 6, -6, 6], aB: [-14, 6, 10, 6], w: { a: 52, grip: 0.9, len: 38, two: 1 }, fx: 'stuck' }),
  sailorWard:        mk({ b: [0, -12], lean0: -2, lean: -4, lg: [[-5, 0], [5, 0]], hd: { t: -2, eye: 'glow' }, aF: [76, 5.5, -52, 5.5], aB: [86, 5.5, -38, 5.5], fx: 'shell' }),
};
export const ALL_POSE_NAMES = ['crewSwim', 'crewSwimFast', 'crewSleep', 'crewWake', 'crewRecover', 'crewReel', 'crewRaise', 'crewStagger', 'crewCorpse', 'crewHurt'];
/* a role's whole table (common + its moves; the Sailor adds his own) */
export const poseTable = role => (role === 'sailor' ? { ...COMMON, ...ROLE_POSES.cutlass, ...ROLE_POSES.shield, ...ROLE_POSES.harpoon, ...ROLE_POSES.heavy, ...SAILOR_POSES } : { ...COMMON, ...ROLE_POSES[role] });
/* the stance a Sailor pose belongs to (the weapon he holds in it) */
export const stanceOfPose = k => /^cut/.test(k) ? 'cutlass' : /^sh/.test(k) ? 'shield' : /^hp/.test(k) ? 'harpoon' : /^hv/.test(k) ? 'anchor' : null;
export const poseNames = role => Object.keys(poseTable(role));
/* sim mode -> pose name (src/sunken-crew.js POSE + the Sailor's idle / ward) */
const MODE_POSE = { sleep: 'crewSleep', wake: 'crewWake', circle: 'crewSwim', approach: 'crewSwim', rec: 'crewRecover', reeling: 'crewReel', toRaise: 'crewSwimFast', raise: 'crewRaise', fallen: 'crewCorpse', staggered: 'crewStagger',
  broken: 'shBroken', merge: 'sailorMerge', swapTell: 'sailorSwapWind', swap: 'sailorSwapStagger', stuck: 'sailorStuck', idle: 'sailorIdle', ward: 'sailorWard' };
const MOVE_POSE = { lunge: ['cutLungeWind', 'cutLungeRel'], flurry: ['cutFlurryWind', 'cutFlurryRel'], bash: ['shBashWind', 'shBashRel'], guard: ['shGuardWind', 'shGuardHold'], throw: ['hpThrowWind', 'hpThrowRel'], reel: ['hpReelWind', 'hpReelRel'],
  slam: ['hvSlamWind', 'hvSlamRel'], charge: ['hvChargeWind', 'hvChargeRel'] };
export function poseOfCrew(role, mode, o = {}) {
  const m = /^(.*)Tell$/.exec(mode || ''); if (m && MOVE_POSE[m[1]]) return MOVE_POSE[m[1]][0];
  if (MOVE_POSE[mode]) return MOVE_POSE[mode][1];
  if (role === 'sailor' && mode === 'broken') return 'sailorSwapStagger';
  if (role === 'sailor' && mode === 'rec') return 'sailorIdle';
  if (role === 'sailor' && o.ward) return 'sailorWard';
  const p = MODE_POSE[mode]; if (p && (role === 'sailor' || !/^sailor/.test(p))) return p;
  return (o.hurtT > 0) ? 'crewHurt' : role === 'sailor' ? 'sailorIdle' : 'crewSwim';
}

let g_, X_, Y_, F_ = 1, TINT_ = 0, ALPHA_ = 1;
const rc = (dx, dy, w, h, c, a = 1) => { const al = a * ALPHA_; if (al !== 1) g_.globalAlpha = al; g_.fillStyle = TINT_ > 0 ? mixC(c, '#ffffff', TINT_) : c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); if (al !== 1) g_.globalAlpha = 1; };
const FL = L => flush(L, rc, D.out);
const sq = (x, y, c, a = 1) => rc(x, y, 1, 1, c, a);

/* the forward kinematics of a pose at build scale sc */
export function crewRig(P, sc = 1, bob = 0) {
  const B = [P.b[0] * sc, P.b[1] * sc + bob], a0 = P.lean0 * Math.PI / 180, a1 = P.lean * Math.PI / 180, tl = 10 * sc;
  const M = [B[0] + Math.sin(a0) * tl * 0.5, B[1] - Math.cos(a0) * tl * 0.5], T = [M[0] + Math.sin(a1) * tl * 0.5, M[1] - Math.cos(a1) * tl * 0.5], S = [lerp(M[0], T[0], 0.7), lerp(M[1], T[1], 0.7)];
  const H = [T[0] + Math.sin(a1) * 3.2 * sc + P.hd.dx * sc, T[1] - Math.cos(a1) * 3.2 * sc + P.hd.dy * sc];
  const arm = a => { const u = pol(a[0], a[1] * sc), E = [S[0] + u[0], S[1] + u[1]], v = pol(a[2], a[3] * sc); return { E, W: [E[0] + v[0], E[1] + v[1]] }; };
  const leg = f => { const F2 = [f[0] * sc, f[1] * sc + (P.float ? bob * 0.3 : 0)], K = [(B[0] + F2[0]) / 2 + 2.2 * sc, (B[1] + F2[1]) / 2 + 0.5 * sc]; return { F: F2, K }; };
  return { B, M, T, S, H, aF: arm(P.aF), aB: arm(P.aB), lgF: leg(P.lg[0]), lgN: leg(P.lg[1]) };
}
/* a two-bone reach from the shoulder to a target (the far hand on a two-handed weapon), elbow bent down */
function reach(S, tgt, l1, l2) { const dx = tgt[0] - S[0], dy = tgt[1] - S[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.01) || 0.01, a = Math.atan2(dy, dx), cs = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), b = Math.acos(cs);
  const E = [S[0] + Math.cos(a + b) * l1, S[1] + Math.sin(a + b) * l1]; return { E, W: [S[0] + Math.cos(a) * d, S[1] + Math.sin(a) * d] }; }

/* ---- weapons ---- */
function bladeDraw(L, hand, w, sc) {
  const d = pol(w.a, 1), n = [-d[1], d[0]], len = w.len * sc, butt = [hand[0] - d[0] * len * w.grip, hand[1] - d[1] * len * w.grip], tip0 = [hand[0] + d[0] * len * (1 - w.grip), hand[1] + d[1] * len * (1 - w.grip)];
  cap(L, butt[0], butt[1], hand[0] + d[0] * 1.5, hand[1] + d[1] * 1.5, 1.1, 1.1, D.cutlass.trim);   /* grip + pommel */
  const g0 = [hand[0] + d[0] * 2, hand[1] + d[1] * 2]; cap(L, g0[0] - n[0] * 2.6, g0[1] - n[1] * 2.6, g0[0] + n[0] * 2.6, g0[1] + n[1] * 2.6, 0.9, 0.9, D.cutlass.trim);   /* the guard */
  const pts = []; for (let i = 0; i <= 6; i++) { const t = i / 6, bow = Math.sin(t * Math.PI * 0.9) * 2.6 * sc * (w.a > -30 && w.a < 60 ? 1 : 1); pts.push([g0[0] + (tip0[0] - g0[0]) * t + n[0] * bow, g0[1] + (tip0[1] - g0[1]) * t + n[1] * bow, 1.7 * (1 - t * 0.78)]); }
  for (let i = 0; i + 1 < pts.length; i++) cap(L, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], pts[i][2], pts[i + 1][2], D.iron);
  const ml = pts[3]; pset(L, ml[0], ml[1], D.iron[4]); pset(L, pts[4][0], pts[4][1], D.iron[4]);
  return { tip: tip0, butt };
}
function harpoonDraw(L, hand, w, sc, rope) {
  const d = pol(w.a, 1), n = [-d[1], d[0]], len = w.len * sc, butt = [hand[0] - d[0] * len * w.grip, hand[1] - d[1] * len * w.grip], tip = [hand[0] + d[0] * len * (1 - w.grip), hand[1] + d[1] * len * (1 - w.grip)];
  cap(L, butt[0], butt[1], tip[0], tip[1], 0.95, 0.95, D.bone);
  const hb = [tip[0] - d[0] * 6, tip[1] - d[1] * 6];   /* the barbed iron: a long leaf and two swept barbs */
  poly(L, [[tip[0] + d[0] * 4, tip[1] + d[1] * 4], [hb[0] + n[0] * 2.4, hb[1] + n[1] * 2.4], [hb[0] - n[0] * 2.4, hb[1] - n[1] * 2.4]], D.iron[2]);
  poly(L, [[hb[0] + n[0] * 2.4, hb[1] + n[1] * 2.4], [hb[0] + n[0] * 4.6 - d[0] * 3, hb[1] + n[1] * 4.6 - d[1] * 3], [hb[0] + n[0] * 0.5 - d[0] * 0.5, hb[1] + n[1] * 0.5 - d[1] * 0.5]], D.iron[1]);
  poly(L, [[hb[0] - n[0] * 2.4, hb[1] - n[1] * 2.4], [hb[0] - n[0] * 4.6 - d[0] * 3, hb[1] - n[1] * 4.6 - d[1] * 3], [hb[0] - n[0] * 0.5 - d[0] * 0.5, hb[1] - n[1] * 0.5 - d[1] * 0.5]], D.iron[1]);
  line(L, hb[0], hb[1], tip[0] + d[0] * 3, tip[1] + d[1] * 3, D.iron[4], 1);
  if (rope) { const c0 = [hand[0] - d[0] * len * 0.2, hand[1] - d[1] * len * 0.2]; for (let k = 0; k < 3; k++) cap(L, c0[0] + n[0] * (k - 1) * 1.4, c0[1] + n[1] * (k - 1) * 1.4 + 2.5, c0[0] + n[0] * (k - 1) * 1.4 - d[0] * 3, c0[1] + n[1] * (k - 1) * 1.4 + 3, 1.5, 1.5, D.rope); }
  return { tip, butt };
}
function anchorDraw(L, hand, w, sc) {
  const d = pol(w.a, 1), n = [-d[1], d[0]], len = w.len * sc, butt = [hand[0] - d[0] * len * w.grip, hand[1] - d[1] * len * w.grip], tip = [hand[0] + d[0] * len * (1 - w.grip), hand[1] + d[1] * len * (1 - w.grip)];
  cap(L, butt[0], butt[1], tip[0], tip[1], 1.9, 1.7, D.iron);   /* the shank */
  const rg = [butt[0] - d[0] * 2.4, butt[1] - d[1] * 2.4]; for (let k = 0; k < 8; k++) { const a0 = k / 8 * Math.PI * 2, a1 = (k + 1) / 8 * Math.PI * 2; cap(L, rg[0] + Math.cos(a0) * 2.6, rg[1] + Math.sin(a0) * 2.6, rg[0] + Math.cos(a1) * 2.6, rg[1] + Math.sin(a1) * 2.6, 0.8, 0.8, D.iron); }   /* the ring */
  const st = [butt[0] + d[0] * 5, butt[1] + d[1] * 5]; cap(L, st[0] - n[0] * 7, st[1] - n[1] * 7, st[0] + n[0] * 7, st[1] + n[1] * 7, 1.3, 1.3, D.bone);   /* the stock */
  const cr = [tip[0] - d[0] * 3, tip[1] - d[1] * 3]; for (let k = -4; k < 4; k++) { const a0 = k / 4 * 1.05, a1 = (k + 1) / 4 * 1.05; const p0 = [cr[0] + d[0] * Math.cos(a0) * 3 + n[0] * Math.sin(a0) * 8, cr[1] + d[1] * Math.cos(a0) * 3 + n[1] * Math.sin(a0) * 8], p1 = [cr[0] + d[0] * Math.cos(a1) * 3 + n[0] * Math.sin(a1) * 8, cr[1] + d[1] * Math.cos(a1) * 3 + n[1] * Math.sin(a1) * 8]; cap(L, p0[0], p0[1], p1[0], p1[1], 1.5, 1.5, D.iron); }   /* the crown arc */
  for (const s of [-1, 1]) { const fb = [cr[0] + d[0] * 1.5 + n[0] * s * 8.2, cr[1] + d[1] * 1.5 + n[1] * s * 8.2]; poly(L, [[fb[0] - d[0] * 3.5, fb[1] - d[1] * 3.5], [fb[0] + d[0] * 1 + n[0] * s * 1.2, fb[1] + d[1] * 1 + n[1] * s * 1.2], [fb[0] - d[0] * 4.5 - n[0] * s * 3, fb[1] - d[1] * 4.5 - n[1] * s * 3], [fb[0] + n[0] * s * 2.6, fb[1] + n[1] * s * 2.6]], D.iron[2]); }
  for (let k = 0; k < 4; k++) pset(L, butt[0] + d[0] * (3 + k * 5) + n[0], butt[1] + d[1] * (3 + k * 5) + n[1], D.barn[2]);
  return { tip, butt };
}
function shieldDraw(L, c, r, st, sc, ST) {
  const rr = r * sc;
  if (st === 'broken') { /* two halves, one dropped each side, the rim split */
    for (const s of [-1, 1]) { const ctr = [c[0] + s * (rr * 0.55), c[1] + (s > 0 ? 1.5 : -0.5)]; const pts = []; for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI - Math.PI / 2; pts.push([ctr[0] + s * Math.cos(a) * rr * 0.7, ctr[1] + Math.sin(a) * rr * 0.7]); } poly(L, pts, ST.wood[1]); line(L, ctr[0], ctr[1] - rr * 0.7, ctr[0], ctr[1] + rr * 0.7, D.iron[2], 1); for (let i = 0; i < 4; i++) pset(L, ctr[0] + s * (rr * 0.3), ctr[1] - rr * 0.5 + i * rr * 0.3, ST.trim[2]); } return; }
  ell(L, c[0], c[1], rr, rr * 1.12, ST.trim);   /* the brass rim */
  ell(L, c[0], c[1], rr - 1.6, rr * 1.12 - 1.6, ST.wood);   /* planks */
  for (let i = -2; i <= 2; i++) if (i) line(L, c[0] + i * rr * 0.3, c[1] - rr * 0.95, c[0] + i * rr * 0.3, c[1] + rr * 0.95, ST.wood[0], 1);
  ell(L, c[0], c[1], rr * 0.34, rr * 0.34, D.iron);   /* the boss */
  pset(L, c[0] - 1, c[1] - 1, D.iron[4]);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pset(L, c[0] + Math.cos(a) * (rr - 0.9), c[1] + Math.sin(a) * (rr * 1.12 - 0.9), ST.trim[3]); }   /* studs */
  if (st === 'guard') { /* barnacles crust the lower rim: it has been a long time under */ for (let k = 0; k < 5; k++) pset(L, c[0] - rr * 0.6 + k * rr * 0.3, c[1] + rr * 0.95, D.barn[2]); }
}

/* ---- the builder ---- */
const hashN = (a, b = 0) => { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return (h ^ (h >>> 16)) >>> 0; };
export function drawCrew(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = o.alpha ?? 1; TINT_ = (o.flash > 0 || o.flashT > 0) ? 0.5 : 0;
  const role = o.role || 'cutlass', tbl = poseTable(role), key = o.pose || poseOfCrew(role, o.mode, { hurtT: o.hurtT, ward: o.ward }), P = o.P || tbl[key] || tbl[role === 'sailor' ? 'sailorIdle' : 'crewSwim'];
  const body = !!o.bodyOnly, stance = o.stance || 'cutlass', wRole = role === 'sailor' ? ROLE_OF_STANCE[stance] : role;
  const sc = role === 'heavy' ? 1.22 : role === 'sailor' ? 1.7 : 1, tm = time + (o.seed || 0), bob = (P.float && !o.still) ? Math.sin(tm * 2.1) * 1.2 : 0;
  const rig = crewRig(P, sc, bob), ST = D[wRole === 'heavy' ? 'heavy' : wRole] || D.cutlass, SB = role === 'sailor' ? D.sailor : ST;
  const coat = role === 'sailor' ? D.sailor.coat : role === 'heavy' ? D.heavy.pants : ST.coat, thick = role === 'heavy' ? 1.3 : role === 'sailor' ? 1.15 : 1;
  const hold = typeof P.w === 'string' ? (P.w === 'carry' ? (wRole === 'shield' ? null : CARRY[wRole]) : P.w === 'drag' ? (wRole === 'cutlass' ? { a: 150, grip: 0.15, len: 23 } : wRole === 'harpoon' ? { a: 168, grip: 0.4, len: 31 } : wRole === 'heavy' ? { a: 172, grip: 0.3, len: 28 } : null)
    : P.w === 'droop' ? (wRole === 'cutlass' ? { a: 100, grip: 0.15, len: 23 } : wRole === 'harpoon' ? { a: 96, grip: 0.4, len: 31 } : wRole === 'heavy' ? { a: 98, grip: 0.3, len: 26 } : null) : null) : P.w;
  const floorW = P.w === 'floor', shield = wRole === 'shield' && !floorW ? (P.sh || (P.w === 'carry' || P.w === 'drag' || P.w === 'droop' ? CARRY_SH : null)) : (wRole === 'shield' && P.sh ? P.sh : null);
  /* the facing's weapon scale: the Sailor's weapon is large */
  const wsc = role === 'sailor' ? 1.5 : role === 'heavy' ? 1.1 : 1;
  /* ---- the coat tail / rags (behind) ---- */
  if (role === 'cutlass' || role === 'sailor' || role === 'harpoon') { const L = new Layer(), lean = P.lean0 * Math.PI / 180, tr = -Math.sign(lean || 1) * 0 - 1, sw = Math.sin(tm * 3) * (P.float ? 1.6 : 0.5), ln = (role === 'sailor' ? 14 : role === 'harpoon' ? 8 : 11) * sc * (P.lean0 > 40 ? 0.7 : 1);
    const bx = rig.B[0], by = rig.B[1] + 1, back = P.lean0 > 20 ? -1 : -0.5;
    poly(L, [[bx - 3.4 * sc * thick, by - 2], [bx + 3.2 * sc * thick, by - 2], [bx + back * ln * 0.2 + 2 * sc, by + ln * 0.62], [bx + back * ln + sw, by + ln * 0.5 + 2], [bx + back * ln * 0.7, by + ln * 0.25]], [coat[1], coat[0]]);
    for (let k = 0; k < 3; k++) pset(L, bx + back * ln * (0.25 + k * 0.22), by + ln * (0.35 + 0.05 * k), coat[2]);
    FL(L); }
  /* ---- the far leg ---- */
  const legDraw = (lg, dark) => { const L = new Layer(), c = dark ? coat.map(q => mixC(q, '#06090c', 0.35)) : coat, r0 = 2.7 * sc * thick, r1 = 2.1 * sc * thick;
    cap(L, rig.B[0], rig.B[1], lg.K[0], lg.K[1], r0, r1, c, { tex: undefined }); cap(L, lg.K[0], lg.K[1], lg.F[0], lg.F[1], r1, 1.6 * sc * thick, c);
    ell(L, lg.F[0] + 1.8 * sc, lg.F[1] - 0.8, 2.6 * sc * thick, 1.6 * sc, dark ? D.iron.slice(0, 3).map(q => mixC(q, '#06090c', 0.3)) : [D.iron[0], D.iron[1], D.iron[1]]);   /* a boot */
    if (role === 'heavy') for (let k = 0; k < 2; k++) pset(L, lg.K[0] - 1 + k * 2, lg.K[1] - 1, D.barn[2]);
    FL(L); };
  legDraw(rig.lgF, true);
  /* ---- the far arm (+ a far hand on a two-handed weapon) ---- */
  let farA = rig.aB;
  if (hold && hold.two) { const hand = rig.aF.W, d = pol(hold.a, 1), len = hold.len * wsc * sc, tipv = [hand[0] + d[0] * len * 0.28, hand[1] + d[1] * len * 0.28]; farA = reach(rig.S, tipv, 5.5 * sc, 5.5 * sc); }
  { const L = new Layer(), dark = SB.coat.map(q => mixC(q, '#06090c', 0.4)), r = 2.1 * sc * thick;
    cap(L, rig.S[0] - 1, rig.S[1], farA.E[0], farA.E[1], r, r * 0.85, dark); cap(L, farA.E[0], farA.E[1], farA.W[0], farA.W[1], r * 0.85, r * 0.7, dark); ell(L, farA.W[0], farA.W[1], 1.8 * sc, 1.8 * sc, [D.skin[0], D.skin[1], D.skin[1]]); FL(L); }
  legDraw(rig.lgN, false);
  /* ---- the torso ---- */
  { const L = new Layer(), r0 = 4.1 * sc * thick, r1 = 4.8 * sc * thick, r2 = 3.7 * sc * thick;
    if (role === 'heavy') { cap(L, rig.B[0], rig.B[1], rig.M[0], rig.M[1], r0 * 1.05, r1, D.skin, { tex: D.skin[0] }); cap(L, rig.M[0], rig.M[1], rig.T[0], rig.T[1], r1, r2 * 1.1, D.skin, { tex: D.skin[0] });
      for (let k = 0; k < 7; k++) pset(L, rig.M[0] + ((hashN(k, 3) % 7) - 3) * sc, rig.M[1] + ((hashN(k, 9) % 7) - 3) * sc, D.barn[1 + (k & 1)]);   /* barnacles on the bare chest */
      cap(L, rig.B[0] - 4 * sc, rig.B[1] - 1, rig.B[0] + 4 * sc, rig.B[1] - 1, 1.5, 1.5, D.heavy.chain); cap(L, rig.S[0] - 4 * sc, rig.S[1] + 1, rig.M[0] + 3 * sc, rig.M[1] + 1, 1, 1, D.heavy.chain);   /* the belt chain + a bandolier chain */ }
    else { const tc = role === 'sailor' ? D.sailor.coat : ST.coat; cap(L, rig.B[0], rig.B[1], rig.M[0], rig.M[1], r0, r1, tc, { tex: undefined }); cap(L, rig.M[0], rig.M[1], rig.T[0], rig.T[1], r1, r2, tc);
      if (role === 'cutlass') { cap(L, rig.B[0] - 4.5 * sc, rig.B[1] - 1.5, rig.B[0] + 4.5 * sc, rig.B[1] - 3.5, 1.5, 1.5, D.cutlass.sash); cap(L, rig.B[0] + 3 * sc, rig.B[1] - 3, rig.B[0] + 5.5 * sc - (P.lean0 > 30 ? 4 : 0), rig.B[1] + 5, 1.2, 0.9, D.cutlass.sash);   /* a red sash and its trailing end */
        for (let k = 0; k < 3; k++) pset(L, rig.M[0] + (k - 1) * 2, rig.M[1] - 2 + k, D.cutlass.trim[2]); }   /* three brass buttons */
      if (role === 'shield') { cap(L, rig.B[0], rig.B[1] - 1, rig.T[0], rig.T[1] + 1, 4.4 * sc, 3.6 * sc, D.shield.coat, { tex: undefined }); cap(L, rig.T[0] - 4 * sc, rig.T[1] + 2, rig.T[0] + 3 * sc, rig.T[1] + 2, 1.6, 1.6, D.shield.trim);
        for (let k = 0; k < 3; k++) pset(L, rig.M[0] - 1 + k * 2, rig.M[1] + 1, D.shield.trim[3]); }   /* the breastplate and its studs */
      if (role === 'harpoon') { cap(L, rig.S[0] - 3, rig.S[1] + 1, rig.B[0] + 4, rig.B[1] - 2, 1.3, 1.3, D.rope);   /* the rope bandolier */ for (let k = 0; k < 3; k++) pset(L, lerp(rig.S[0] - 3, rig.B[0] + 4, k / 3) + 1, lerp(rig.S[1] + 1, rig.B[1] - 2, k / 3) - 1, D.rope[0]); }
      if (role === 'sailor') { /* four coats: pale lapels in four stripes, barnacle crust on both shoulders, the rib cage with four souls */
        for (const s of [-1, 1]) for (let k = 0; k < 5; k++) pset(L, rig.S[0] + s * (3 + (k % 3)) * sc + 1, rig.S[1] - 1 + (k >> 1), D.barn[1 + (k & 1)]);
        cap(L, rig.B[0] - 5 * sc, rig.B[1] - 2, rig.B[0] + 5 * sc, rig.B[1] - 2, 1.8, 1.8, D.sailor.trim);
        for (let k = 0; k < 4; k++) pset(L, rig.M[0] - 4 + k * 3 + 1, rig.M[1], D.skin[3]);
        for (let k = 0; k < 4; k++) pset(L, rig.M[0] - 4.5 + k * 3 + 1, rig.M[1] + 3, D.soul[ROLES[k]]); } }   /* the four souls in the rib cage */
    FL(L); }
  /* ---- the head ---- */
  headDraw(rig, P, key, tm, role, sc);
  /* ---- the weapon + the near arm ---- */
  { let hand = rig.aF.W;
    if (!body) {
      if (shield) { const c = [hand[0] + shield.ox * sc, hand[1] + shield.oy * sc]; const L = new Layer(); shieldDraw(L, c, shield.r, shield.st, sc * 1.0, D.shield); FL(L);
        if (shield.st === 'guard' || shield.st === 'raise') for (let a = 0; a < 20; a++) { const an = a / 20 * Math.PI * 2, k = shield.st === 'guard' ? 1 : 0.5; sq(c[0] + Math.cos(an) * (shield.r * sc + 2), c[1] + Math.sin(an) * (shield.r * sc * 1.12 + 2), D.glow, 0.35 + 0.4 * k * ((a & 1) ? 1 : 0.5)); } }
      if (floorW) { const L = new Layer(); weaponFloor(L, wRole, sc * wsc); FL(L); }
      else if (hold) { const L = new Layer(), h2 = [hand[0], hand[1]], hs = { ...hold, len: hold.len * wsc };
        if (wRole === 'cutlass') bladeDraw(L, h2, hs, sc); else if (wRole === 'harpoon') harpoonDraw(L, h2, hs, sc, P.fx === 'coil' || P.fx === 'rope'); else if (wRole === 'heavy') anchorDraw(L, h2, hs, sc); FL(L); } }
    const L = new Layer(), r = 2.3 * sc * thick, AC = role === 'heavy' ? D.skin : role === 'sailor' ? D.sailor.coat : ST.coat;
    cap(L, rig.S[0], rig.S[1], rig.aF.E[0], rig.aF.E[1], r, r * 0.88, AC); cap(L, rig.aF.E[0], rig.aF.E[1], hand[0], hand[1], r * 0.88, r * 0.72, AC);
    if (role === 'shield' || role === 'cutlass') cap(L, lerp(rig.aF.E[0], hand[0], 0.5), lerp(rig.aF.E[1], hand[1], 0.5), lerp(rig.aF.E[0], hand[0], 0.78), lerp(rig.aF.E[1], hand[1], 0.78), r * 0.9, r * 0.8, D[role].trim);   /* a brass cuff */
    ell(L, hand[0], hand[1], 1.9 * sc, 1.9 * sc, [D.skin[1], D.skin[2], D.skin[2]]); FL(L); }
  if (!body) fxDraw(P, rig, key, tm, o, sc, role, wRole, hold);
}
function weaponFloor(L, role, sc) {
  if (role === 'cutlass') line(L, 4 * sc, -1, 22 * sc, -2, D.iron[2], 2);
  else if (role === 'harpoon') { line(L, 2, -1, 30 * sc, -1, D.bone[1], 2); poly(L, [[30 * sc, -3], [36 * sc, -1], [30 * sc, 1]], D.iron[2]); }
  else if (role === 'heavy') anchorDraw(L, [10, -4], { a: 4, grip: 0.1, len: 26 }, 1);
}
function headDraw(rig, P, key, tm, role, sc) {
  const H = rig.H, h = P.hd, t = h.t, L = new Layer(), SK = D.skin, hs = role === 'sailor' ? 1.3 : role === 'heavy' ? 1.12 : 1;
  const rx = 4.3 * sc * (role === 'sailor' ? 0.88 : 1) * (hs > 1 ? 1 : 1), ry = 4.6 * sc * (role === 'sailor' ? 0.88 : 1);
  if (role === 'harpoon') ell(L, H[0] - 1.2 * sc, H[1] - 0.5, 5.4, 5.2, D.harpoon.hood);   /* the oilskin hood behind the skull */
  ell(L, H[0], H[1], rx, ry, SK, { rot: t * 0.3 });
  const jw = H[1] + ry * 0.5 + h.open * 2.4 * sc;   /* the jaw drops */
  ell(L, H[0] + 0.6, jw, rx * 0.72, 1.7 * sc, [SK[0], SK[1], SK[1]]);
  if (h.open > 0.2) { const mw = rx * 0.55; for (let i = -1; i <= 1; i++) for (let j = 0; j < Math.max(1, R(h.open * 2.4 * sc)); j++) L.set(H[0] + 1.5 + i, H[1] + ry * 0.45 + j, D.mouth); for (let i = -1; i <= 1; i += 2) pset(L, H[0] + 1.5 + i, H[1] + ry * 0.4, D.teeth); }
  else for (let i = -1; i < 3; i++) pset(L, H[0] + 0.5 + i, H[1] + ry * 0.5, D.mouth);
  /* the eye: a hollow socket with one cyan light; flare = white-cyan and two pixels bigger */
  const ex = H[0] + 1.3 * sc, ey = H[1] - 0.6 * sc + (t > 20 ? 1 : 0), eye = h.eye;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 2; i++) pset(L, ex + i, ey + j, D.socket);
  if (eye === 'closed') { line(L, ex - 1, ey, ex + 2, ey, D.socket, 1); }
  else if (eye === 'dead') { pset(L, ex, ey - 1, D.eyeDim); pset(L, ex + 1, ey + 1, D.eyeDim); pset(L, ex + 2, ey - 1, D.eyeDim); }
  else if (eye === 'dizzy') { pset(L, ex, ey, D.eyeDim); pset(L, ex + 1, ey + 1, D.eye); pset(L, ex + 2, ey, D.eyeDim); }
  else { const big = eye === 'flare', c = big ? D.eyeHot : eye === 'dim' ? D.eyeDim : D.eye; for (let j = 0; j < (big ? 2 : 1); j++) for (let i = 0; i < 2; i++) pset(L, ex + i, ey + j - (big ? 0 : 0), c); if (big || eye === 'glow') pset(L, ex + 2, ey, D.eye); }
  pset(L, ex - 1, ey - 2, D.socket); pset(L, ex, ey - 2, D.socket); pset(L, ex + 1, ey - 2, D.socket);   /* the heavy brow */
  pset(L, H[0] - 1, H[1] + 1, SK[0]); pset(L, H[0] - 2, H[1] + 2, SK[0]);   /* a gill slit / cheek hollow */
  FL(L);
  /* the hat / helm / hair, its own mass */
  const Lh = new Layer();
  if (role === 'cutlass') { const hx = H[0], hy = H[1] - ry * 0.92, hc = D.cutlass.hat; poly(Lh, [[hx - 5.5, hy + 1], [hx - 3, hy - 3], [hx + 3, hy - 3], [hx + 6, hy + 1], [hx + 3, hy + 1.5], [hx - 3, hy + 1.5]], [hc[2], hc[1]]); line(Lh, hx - 6, hy + 1, hx + 6, hy + 1, D.cutlass.trim[1], 1); pset(Lh, hx + 5, hy - 1, D.cutlass.trim[3]); line(Lh, hx - 3, hy - 3, hx - 4, hy - 6, D.kelp[1], 1); }   /* a ruined tricorn with a kelp plume */
  else if (role === 'shield') { const hx = H[0], hy = H[1] - 0.8; ell(Lh, hx, hy - 1, rx + 1.2, ry * 0.85, D.shield.coat); poly(Lh, [[hx - 1, hy - 5.6], [hx + 1, hy - 5.6], [hx + 1, hy - 8.2], [hx - 1, hy - 8.4]], D.shield.trim[2]); for (let i = 0; i < 4; i++) pset(Lh, hx + 1 + i, hy + 0, D.socket); line(Lh, hx - 2, hy + 1, hx + 4, hy + 1, D.shield.trim[1], 1); }   /* an iron helm, a brass crest, a visor slit */
  else if (role === 'heavy') { for (let k = 0; k < 4; k++) pset(Lh, H[0] - 2 + k * 1.5, H[1] - ry + 1 + (k & 1), D.barn[1 + (k & 1)]); line(Lh, H[0] - rx, H[1] + 2, H[0] - rx - 1.5, H[1] + 4, D.heavy.chain[1], 1); }   /* a bald head with barnacles, a ring-chain in the ear */
  else if (role === 'harpoon') { const hx = H[0], hy = H[1] - 1; poly(Lh, [[hx - 5, hy + 1], [hx - 2, hy - 5], [hx + 3, hy - 5.5], [hx + 6, hy - 2], [hx + 4, hy - 3], [hx - 2, hy - 2]], D.harpoon.hood[2]); line(Lh, hx - 4, hy + 2, hx - 7, hy + 6, D.kelp[1], 1); }   /* the hood's peak */
  else if (role === 'sailor') { const hx = H[0], hy = H[1] - ry * 0.95, hc = D.sailor.hat; poly(Lh, [[hx - 10, hy + 2], [hx - 6, hy - 6], [hx - 1, hy - 9], [hx + 5, hy - 7], [hx + 10, hy + 2], [hx + 4, hy + 3], [hx - 4, hy + 3]], [hc[2], hc[1]]); line(Lh, hx - 10, hy + 2, hx + 10, hy + 2, D.sailor.trim[2], 1); pset(Lh, hx, hy - 3, D.skin[3]); pset(Lh, hx - 1, hy - 2, D.skin[3]); pset(Lh, hx + 1, hy - 2, D.skin[3]);   /* a captain's hat with a skull badge */
    for (let k = 0; k < 7; k++) pset(Lh, hx - 8 + k * 2.6, hy + 1 - (k % 3) * 2, D.barn[1 + (k % 3 ? 0 : 2)]); }   /* barnacle crust on its brim */
  FL(Lh);
}
/* effects: not bodies (skipped by o.bodyOnly), never outlined */
function fxDraw(P, rig, key, tm, o, sc, role, wRole, hold) {
  const f = P.fx, H = rig.H, W = rig.aF.W;
  if (f === 'speed') for (let i = 0; i < 4; i++) rc(-26 - (i & 1) * 8 - 6 * sc, rig.B[1] - 12 + i * 5, 12 + (i & 1) * 6, 1, D.white, 0.5 + (i & 1) * 0.2);
  if (f === 'glint') { const gx = hold ? W[0] + pol(hold.a, hold.len * sc * 0.75)[0] : H[0] + 6, gy = hold ? W[1] + pol(hold.a, hold.len * sc * 0.75)[1] : H[1] - 6; rc(gx - 1, gy, 3, 1, D.gold, 0.9); rc(gx, gy - 1, 1, 3, D.gold, 0.9); }
  if (f === 'stars') for (let i = 0; i < 3; i++) { const a = tm * 5 + i * 2.1; rc(H[0] + Math.cos(a) * 7 - 1, H[1] - 8 * sc + Math.sin(a) * 3, 2, 2, o.gold || D.spark); }
  if (f === 'zz') { rc(H[0] + 6, H[1] - 8, 3, 1, D.white, 0.6); rc(H[0] + 7, H[1] - 7, 1, 1, D.white, 0.6); rc(H[0] + 6, H[1] - 6, 3, 1, D.white, 0.6); }
  if (f === 'arc') for (let i = 0; i < 9; i++) { const a = -1.1 + i * 0.28; rc(W[0] + Math.cos(a) * 24 * sc + 2, W[1] + Math.sin(a) * 24 * sc - 6, 2, 1, D.white, 0.25 + i * 0.07); }
  if (f === 'throw') for (let i = 0; i < 3; i++) rc(W[0] + 8 + i * 5, W[1] - 2 + (i - 1) * 2, 5 + i * 2, 1, D.white, 0.6 - i * 0.12);
  if (f === 'shock') { for (let i = 0; i < 4; i++) rc(18 + i * 12, -2 - (i & 1), 8, 1, D.white, 0.55); for (let i = 0; i < 4; i++) rc(24 + i * 9 + (i & 1) * 3, -8 - (i & 1) * 6, 2, 2, D.barn[2], 0.8); rc(rig.aF.W[0] + 14, -2, 1, 6, D.gold, 0.8); }
  if (f === 'rope') { for (let i = 0; i < 26; i++) rc(W[0] + 20 + i * 2, W[1] - 2 + Math.round(Math.sin(i * 0.6) * 1), 2, 1, D.rope[2], 0.9); rc(W[0] + 70, W[1] - 4, 2, 4, D.iron[3]); }
  if (f === 'coil') { for (let k = 0; k < 3; k++) rc(rig.B[0] + 1 + k, rig.B[1] + 2, 1, 1, D.rope[2]); }
  if (f === 'rim') { /* glowing rim handled with the shield; a standing line along the floor */ rc(10, -1, 18, 1, D.glow, 0.4); }
  if (f === 'raise') { const lx = rig.aF.W[0] + 5, ly = rig.aF.W[1] - 6; rc(lx - 2, ly, 5, 7, D.glow, 0.9); rc(lx - 1, ly - 2, 3, 2, D.iron[2]); rc(lx - 1, ly + 1, 3, 3, D.eyeHot); for (let k = 0; k < 3; k++) rc(lx - 6 + k * 5, ly - 4 - ((tm * 10 + k * 3) % 6), 1, 1, D.glow, 0.6); }
  if (f === 'souls') { for (let k = 0; k < 4; k++) { const a = tm * 3 + k * 1.57, r = 16 - ((tm * 3) % 1) * 5; rc(Math.cos(a) * r - 1, rig.M[1] + Math.sin(a) * r * 0.7, 3, 3, D.soul[ROLES[k]]); rc(Math.cos(a) * r, rig.M[1] + Math.sin(a) * r * 0.7 - 1, 1, 5, D.soul[ROLES[k]], 0.5); } }
  if (f === 'swap') { for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + tm * 4; rc(W[0] + Math.cos(a) * 15, W[1] - 10 + Math.sin(a) * 9, 2, 2, D.gold, 0.8); } }
  if (f === 'stuck') { rc(rig.aF.W[0] + 6, -2, 20, 1, D.barn[1]); for (let k = 0; k < 4; k++) rc(18 + k * 7, -3 - (k & 1), 1, 3, D.white, 0.7); }
  if (f === 'shell') { for (let k = 0; k < 18; k++) { const a = k / 18 * 6.283; rc(Math.cos(a) * 22 - 1, rig.M[1] + Math.sin(a) * 26, 2, 2, k & 1 ? D.glow : D.white, 0.6); } }
  /* the tells flare the eye's halo */
  if (/Wind$/.test(key) || key === 'sailorSwapWind') { rc(H[0] + 3 * sc, H[1] - 1, 1, 1, D.eyeHot); rc(H[0] + 5 * sc, H[1] - 1, 2, 1, D.glow, 0.6); }
}
/* the dead (a fallen sailor sinks to a corpse: crewCorpse) and the Sailor's last fall: k 0..1 (kneels, topples, the hat floats off, the souls go up) */
export function drawCrewDead(g, x, y, f, k, time = 0, o = {}) {
  const role = o.role || 'cutlass', kk = clamp(k), tbl = poseTable(role), A = tbl[role === 'sailor' ? 'sailorSwapStagger' : 'crewHurt'], B = tbl.crewCorpse, e = kk < 0.35 ? kk / 0.35 * 0.4 : 0.4 + (kk - 0.35) / 0.65 * 0.6;
  const P = { ...B, b: [lerp(A.b[0], B.b[0], e), lerp(A.b[1], B.b[1], e)], lean0: lerp(A.lean0, B.lean0, e), lean: lerp(A.lean, B.lean, e), lg: A.lg.map((q, i) => [lerp(q[0], B.lg[i][0], e), lerp(q[1], B.lg[i][1], e)]), hd: { ...B.hd, t: lerp(A.hd.t, B.hd.t, e), eye: 'dead' }, aF: A.aF.map((q, i) => lerp(q, B.aF[i], e)), aB: A.aB.map((q, i) => lerp(q, B.aB[i], e)), w: 'floor', fx: null };
  drawCrew(g, x, y, f, { ...o, P, alpha: kk > 0.85 ? 1 - (kk - 0.85) / 0.15 * 0.8 : 1, still: true }, time);
  if (!o.bodyOnly && role === 'sailor') for (let i = 0; i < 4; i++) { g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = 1; TINT_ = 0; const up = ((time * 24 + i * 9) % 40) * (0.4 + kk) + kk * 16; rc(-8 + i * 5, -22 - up, 3, 3, D.soul[ROLES[i]], 0.9 * (1 - kk * 0.5)); }
}
