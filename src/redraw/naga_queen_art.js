// naga_queen_art.js - THE NAGA QUEEN, THE HAND-DRAWN POSE SET (claude/srart, 2026-11-12). The greybox drew her as coloured rectangles; this draws HER, the way claude/sea4 rebuilt the Drowned King:
// SEPARATE OUTLINED MASSES (the tail, four coils, her hair behind, the far arm, the torso with its pearl bodice, the head with its fins, her crown, the near arm) and every TELL changes the BODY's
// silhouette - she REARS, HUNCHES, ARCHES, SINKS - not just where a hand points. The king's blank grey face was the weak spot; hers is built to read at 1x:
//   THE FACE: the palest mass on the sprite (lavender skin) in a frame of near-black hair, so the oval pops off the dark; two teal glowing eyes under hard brows (2x2 with a white core), a dark
//   socket line, a red mouth that goes to a black O with a white fang row when she sings and a green-throated snarl when she spits, teal fin-ears swept back, a gold crown with pearls.
// Pure drawing, fillRect only (tools/sr-art-sheet.mjs rasterises it in node). g = a 2d context, (x, y) = the foot of her coils, f = facing (+1 right), o = { mode, under, hurtT, flash, open, k, seed, bodyOnly, ward }.
// THE POSES (Q_POSE_SET; keys are her modes, src/naga-queen.js):
//   sleep / wake            curled tight, head down on her folded arms, crown askew   |   rising, eyes flaring open
//   idle / slither          three loops, torso upright, arms folded   |   the coils stretched along the rock, leaning in
//   songTell (!!)           REARS: four tall tight loops, torso arched back, chest out, both hands lifting, the mouth opening, the throat lit  ->  song: the arms flung wide and flat, head thrown back, the mouth a black O, hair lifted, rings
//   sweepTell (!!)          HUNCHED forward over her coils, the TAIL RAISED high behind her in a hook  ->  sweep: the chest dropped low, the tail laid out flat along the whole floor, a white arc
//   venomTell (!)           head thrown back, cheeks full, a green throat, one hand out as a sight  ->  venomSpit: the head snapped forward and down, jaws open, a green streak
//   surfaceTell (!)         head and shoulders out of the water, the venom glowing   |   under: a low dark shape in the tide, two eyes, a dorsal ridge   |   sinkTell: bowing down into the tide, arms trailing
//   drownTell (!!)          rising out of the bubbles, hands lifting, eyes flaring  ->  drown: arms wide, a black O, rings in the water
//   reel (OPEN): both hands to her ears, the song broken on her   |   dragged (OPEN): hauled onto the rock, lying on one elbow, hair across the stone   |   hurt: a flinch   |   rec: bowed and panting   |   dead: drawQueenDead(k)
import { Layer, ell, cap, poly, line, px as pset, flush, mixC, clamp, lerp, pol } from './sr_draw.js';
const R = Math.round, D2R = Math.PI / 180;
export const QP = {
  out: '#090c10',
  scale: ['#1b1528', '#342c4a', '#4e4068', '#5b4a6e'], tex: '#2a2334', belly: ['#c9bde6', '#f0e8ff'], rim: '#96689f',
  skin: ['#96689f', '#c9bde6', '#f0e8ff'], skinSh: '#64406e', bodice: ['#4e4068', '#96689f', '#c295d0', '#f0e8ff'],
  hair: ['#0b0908', '#1b1528', '#2a2334', '#342c4a'], fin: ['#227058', '#3fb0a2', '#8ef2da'],
  gold: ['#5c4527', '#8a6a28', '#c8a24a', '#e8c24c', '#fff0a8'], pearl: '#f2f7ff',
  eye: '#8ef2da', eyeHot: '#ffffff', socket: '#1b1528', lip: '#8a3442', lipHi: '#c98f92', mouth: '#401a26', tooth: '#f2f7ff',
  venom: ['#5d7d36', '#86a648', '#9ab04e', '#cfe8a0'], ring: '#c295d0', ringHi: '#f0e8ff', water: ['#275e6c', '#3f8c96', '#6fb8bc', '#dff7ee'],
  hot: '#ffd36b', white: '#f6fbfc', red: '#ff6b6b', spark: '#fff0a8',
};
const L0 = [0, 0, 0, 0];
const IDLE_TAIL = [[-19, -5, 5.2], [-31, -4, 4.4], [-43, -3, 3.6], [-53, -4, 2.8], [-60, -7, 2], [-62, -12, 1.3]];
/* loops [cx, cy, rx, ry] x4 (rx 0 = absent), tail [x, y, r] x6, b = torso base, lean0 / lean (deg, + forward), len, hd = { t tilt, dx, dy, open 0..1, eye, venom, throat }, aF / aB = [upper deg, upper len, lower deg, lower len]
   hair = [ex, ey] the hair's tip relative to the head centre, ripple = a waterline effect */
export const Q_POSE_SET = {
  idle:       { loops: [[0, -6, 21, 6], [-2, -13, 16, 5.5], [1, -19, 11, 5], L0], tail: IDLE_TAIL, b: [1, -21], lean0: -2, lean: 4, len: 14, hd: { t: 2, dx: 1, dy: -8, open: 0, eye: 'calm' }, aF: [74, 8, -34, 8], aB: [112, 8, 72, 7], hair: [-7, 15] },
  slither:    { loops: [[-12, -5, 22, 5], [5, -9, 15, 5], [12, -14, 9, 4], L0], tail: [[-30, -4, 4.8], [-44, -3, 4], [-56, -4, 3.2], [-67, -3, 2.4], [-76, -5, 1.7], [-82, -4, 1.1]], b: [12, -15], lean0: 14, lean: 24, len: 13, hd: { t: 12, dx: 3, dy: -7, open: 0, eye: 'calm' }, aF: [48, 8, 10, 8], aB: [130, 8, 100, 7], hair: [-12, 10] },
  sleep:      { loops: [[0, -6, 22, 6.5], [0, -13, 18, 6], [1, -19, 13, 5.5], [2, -24, 8, 4]], tail: [[-20, -5, 5.4], [-30, -8, 4.6], [-35, -15, 3.8], [-30, -21, 3], [-22, -23, 2.2], [-17, -20, 1.4]], b: [2, -25], lean0: 38, lean: 62, len: 8, hd: { t: 58, dx: 3, dy: -4, open: 0, eye: 'closed' }, aF: [14, 7, 60, 6], aB: [30, 7, 70, 6], hair: [-8, 6], crownTilt: 14 },
  wake:       { loops: [[0, -6, 21, 6], [-2, -13, 16, 5.5], [1, -19, 11, 5], L0], tail: IDLE_TAIL, b: [1, -21], lean0: -6, lean: -8, len: 14, hd: { t: -10, dx: 0, dy: -8, open: 0.15, eye: 'flare' }, aF: [24, 9, -6, 8], aB: [160, 9, 190, 8], hair: [-9, 12], fx: 'glint' },
  hurt:       { loops: [[-3, -6, 21, 6], [-6, -13, 16, 5.5], [-4, -19, 10, 5], L0], tail: [[-21, -5, 5.2], [-33, -6, 4.4], [-44, -10, 3.6], [-52, -17, 2.8], [-52, -25, 2], [-46, -30, 1.3]], b: [-3, -21], lean0: -18, lean: -34, len: 14, hd: { t: -34, dx: -2, dy: -8, open: 0.7, eye: 'closed' }, aF: [-70, 8, -20, 8], aB: [140, 8, 100, 7], hair: [10, -4], fx: 'stars' },
  rec:        { loops: [[0, -5, 23, 5.5], [-2, -11, 17, 5], [3, -16, 11, 4.5], L0], tail: [[-20, -4, 5.2], [-32, -3.5, 4.4], [-44, -3, 3.6], [-54, -3, 2.8], [-62, -3.5, 2], [-68, -3, 1.3]], b: [3, -17], lean0: 16, lean: 34, len: 12, hd: { t: 34, dx: 2, dy: -6, open: 0.3, eye: 'dim' }, aF: [96, 9, 104, 8], aB: [102, 9, 96, 8], hair: [-4, 16] },
  songTell:   { loops: [[0, -6, 18, 6], [-1, -13, 14, 5.5], [0, -20, 10, 5], [1, -27, 7, 4.5]], tail: [[-16, -5, 5], [-26, -5, 4.2], [-35, -9, 3.5], [-40, -17, 2.8], [-37, -24, 2], [-31, -27, 1.3]], b: [1, -28], lean0: -6, lean: -14, len: 19, hd: { t: -20, dx: 0, dy: -8, open: 0.5, eye: 'flare', throat: true }, aF: [-28, 9, -58, 8], aB: [-152, 9, -122, 8], hair: [-9, 12], fx: 'gather' },
  song:       { loops: [[0, -6, 25, 6], [-2, -12, 19, 5], [0, -17, 13, 4.5], L0], tail: [[-23, -5, 5.2], [-35, -4, 4.4], [-47, -3, 3.6], [-57, -3, 2.8], [-65, -4, 2], [-70, -4, 1.3]], b: [0, -18], lean0: 0, lean: -4, len: 16, hd: { t: -40, dx: 0, dy: -8, open: 1, eye: 'flare', throat: true }, aF: [-10, 11, -6, 10], aB: [-170, 11, -174, 10], hair: [-13, -12], fx: 'song' },
  sweepTell:  { loops: [[0, -6, 19, 6], [-3, -13, 14, 5.5], L0, L0], tail: [[-14, -12, 5], [-23, -20, 4.4], [-28, -31, 3.6], [-25, -41, 2.8], [-16, -46, 2], [-8, -44, 1.3]], b: [-1, -14], lean0: 26, lean: 50, len: 13, hd: { t: 30, dx: 3, dy: -6, open: 0.1, eye: 'flare' }, aF: [32, 9, 40, 8], aB: [60, 9, 50, 8], hair: [-14, 8], fx: 'glint' },
  sweep:      { loops: [[-6, -5, 17, 5], [-2, -10, 12, 4.5], L0, L0], tail: [[16, -4, 5], [30, -3.5, 4.2], [44, -3, 3.4], [58, -3, 2.6], [70, -3, 1.8], [82, -3, 1.2]], b: [-2, -11], lean0: 44, lean: 66, len: 11, hd: { t: 42, dx: 3, dy: -5, open: 0.6, eye: 'flare' }, aF: [140, 9, 110, 8], aB: [160, 9, 130, 8], hair: [-16, 4], fx: 'arc' },
  venomTell:  { loops: [[0, -6, 19, 6], [-1, -13, 14, 5.5], [0, -20, 10, 5], L0], tail: [[-17, -5, 5], [-27, -5, 4.2], [-37, -8, 3.5], [-43, -14, 2.8], [-42, -21, 2], [-36, -25, 1.3]], b: [0, -22], lean0: -14, lean: -30, len: 15, hd: { t: -52, dx: -1, dy: -8, open: 0.55, eye: 'flare', venom: true, throat: true, cheeks: true }, aF: [-6, 9, -4, 9], aB: [100, 8, 140, 7], hair: [-3, 15], fx: 'drip' },
  venomSpit:  { loops: [[-3, -6, 19, 5.5], [1, -11, 14, 5], [5, -16, 9, 4.5], L0], tail: [[-20, -5, 5], [-32, -4, 4.2], [-44, -3, 3.4], [-54, -4, 2.6], [-62, -5, 1.8], [-67, -4, 1.2]], b: [5, -17], lean0: 22, lean: 40, len: 13, hd: { t: 32, dx: 4, dy: -6, open: 1, eye: 'flare', venom: true }, aF: [18, 9, 8, 9], aB: [120, 8, 90, 7], hair: [-14, 6], fx: 'spit' },
  reel:       { loops: [[-4, -5, 22, 5.5], [-8, -11, 16, 5], [-6, -17, 10, 4.5], L0], tail: [[-24, -4, 5], [-36, -3, 4.2], [-48, -3, 3.4], [-58, -3, 2.6], [-66, -4, 1.8], [-70, -6, 1.2]], b: [-6, -18], lean0: -26, lean: -46, len: 14, hd: { t: -36, dx: -3, dy: -7, open: 0.8, eye: 'closed' }, aF: [-84, 7, -154, 6], aB: [-100, 8, -168, 6], hair: [8, 8], fx: 'stars' },
  dragged:    { loops: [[-10, -4, 24, 4.5], [10, -4, 14, 4], L0, L0], tail: [[-30, -3, 4.6], [-42, -3, 4], [-52, -2.5, 3.2], [-62, -3, 2.4], [-70, -2.5, 1.7], [-76, -3, 1.1]], b: [8, -6], lean0: 66, lean: 86, len: 14, hd: { t: 52, dx: 3, dy: -4, open: 0.3, eye: 'closed' }, aF: [60, 8, 84, 5], aB: [30, 8, 60, 7], hair: [4, 4] },
  sinkTell:   { loops: [[-2, -4, 23, 5], [-3, -9, 17, 4.5], [0, -13, 9, 4], L0], tail: [[-22, -4, 5], [-34, -3, 4.2], [-46, -3, 3.4], [-56, -3, 2.6], [-64, -3.5, 1.8], [-69, -3, 1.2]], b: [0, -14], lean0: 26, lean: 58, len: 12, hd: { t: 44, dx: 3, dy: -5, open: 0.1, eye: 'closed' }, aF: [38, 9, 62, 8], aB: [140, 9, 112, 8], hair: [-6, 12], fx: 'bubbles' },
  surfaceTell:{ loops: [[0, -3, 22, 3.5], [-4, -6, 15, 3.2], [0, 0, 0, 0], L0], tail: [[-20, -3, 3.5], [-32, -3, 3], [-44, -3, 2.6], [-54, -3, 2.2], [-62, -3, 1.7], [-68, -3, 1.2]], b: [0, -7], lean0: -10, lean: -24, len: 14, hd: { t: -46, dx: -1, dy: -8, open: 0.55, eye: 'flare', venom: true, throat: true, cheeks: true }, aF: [-8, 9, -6, 9], aB: [120, 8, 150, 7], hair: [-2, 14], fx: 'ripple' },
  drownTell:  { loops: [[0, -3, 23, 3.8], [-3, -6, 16, 3.4], [0, 0, 0, 0], L0], tail: [[-22, -3, 4], [-34, -3, 3.4], [-46, -3, 2.8], [-56, -3, 2.3], [-64, -3, 1.7], [-70, -3, 1.2]], b: [0, -6], lean0: -10, lean: -22, len: 19, hd: { t: -30, dx: -1, dy: -8, open: 0.4, eye: 'flare', throat: true }, aF: [-52, 9, -84, 8], aB: [-126, 9, -96, 8], hair: [-8, 6], fx: 'bubbles' },
  drown:      { loops: [[0, -3, 31, 3.8], [-3, -6, 23, 3.4], [0, 0, 0, 0], L0], tail: [[-24, -3, 4], [-36, -3, 3.4], [-48, -3, 2.8], [-58, -3, 2.3], [-66, -3, 1.7], [-72, -3, 1.2]], b: [0, -7], lean0: 4, lean: 2, len: 13, hd: { t: -40, dx: 0, dy: -8, open: 1, eye: 'flare', throat: true }, aF: [-8, 11, -4, 10], aB: [-172, 11, -176, 10], hair: [-12, -8], fx: 'drown' },
};
export const Q_MODE_POSE = { sleep: 'sleep', wake: 'wake', slither: 'slither', songTell: 'songTell', song: 'song', songRec: 'rec', sweepTell: 'sweepTell', sweep: 'sweep', sweepRec: 'rec', venomTell: 'venomTell', venomSpit: 'venomSpit', venomRec: 'rec',
  surfaceTell: 'surfaceTell', reel: 'reel', dragged: 'dragged', sinkTell: 'sinkTell', under: 'under', drownTell: 'drownTell', drown: 'drown', drownRec: 'rec' };
export const poseOfQueen = (mode, o = {}) => Q_MODE_POSE[mode] || ((o.hurtT > 0) ? 'hurt' : 'idle');

let g_, X_, Y_, F_ = 1, TINT_ = 0, ALPHA_ = 1;
const rc = (dx, dy, w, h, c, a = 1) => { const al = a * ALPHA_; if (al !== 1) g_.globalAlpha = al; g_.fillStyle = TINT_ > 0 ? mixC(c, '#ffffff', TINT_) : c; g_.fillRect(F_ > 0 ? X_ + R(dx) : X_ - R(dx) - R(w), Y_ + R(dy), R(w), R(h)); if (al !== 1) g_.globalAlpha = 1; };
const FL = L => flush(L, rc, QP.out);
const blend = (a, b, k) => Array.isArray(a) ? a.map((v, i) => blend(v, b[i], k)) : typeof a === 'number' ? lerp(a, b, k) : (k < 0.5 ? a : b);

export function queenRig(P) {
  const [bx, by] = P.b, a0 = P.lean0 * D2R, a1 = P.lean * D2R, l0 = P.len * 0.5, l1 = P.len * 0.5;
  const M = [bx + Math.sin(a0) * l0, by - Math.cos(a0) * l0], T = [M[0] + Math.sin(a1) * l1, M[1] - Math.cos(a1) * l1];
  const S = [lerp(M[0], T[0], 0.7), lerp(M[1], T[1], 0.7) + 0.5], H = [T[0] + P.hd.dx, T[1] + P.hd.dy];
  const arm = a => { const u = pol(a[0], a[1]), E = [S[0] + u[0], S[1] + u[1]], v = pol(a[2], a[3]); return { E, W: [E[0] + v[0], E[1] + v[1]] }; };
  return { B: [bx, by], M, T, S, H, F: arm(P.aF), Bk: arm(P.aB) };
}

export function drawQueen(g, x, y, f, o = {}, time = 0) {
  g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = o.alpha ?? 1; o = { seed: 0, ...o };
  const key = o.pose || poseOfQueen(o.mode, o);
  TINT_ = o.flash > 0 || o.flashT > 0 ? 0.5 : 0;
  const tm = time + (o.seed || 0), body = !!o.bodyOnly;
  if (key === 'under') { underDraw(tm, body); return; }
  const P = o.P || Q_POSE_SET[key] || Q_POSE_SET.idle, rig = queenRig(P), still = !!o.still, sway = still ? 0 : Math.sin(tm * 2) * 0.6, SC = QP.scale;
  const breath = still ? 0 : Math.sin(tm * 2.4) * 0.5;
  /* ---- the tail ---- */
  { const L = new Layer(), wag = (key === 'idle' || key === 'slither' || key === 'rec') && !still;
    const tl = P.tail.map(([tx, ty, r], i) => [tx, ty + (wag ? Math.sin(tm * 2.1 + i * 0.8) * (0.3 + i * 0.4) * (key === 'slither' ? 1.6 : 0.8) : 0), r]);
    for (let i = 0; i + 1 < tl.length; i++) cap(L, tl[i][0], tl[i][1], tl[i + 1][0], tl[i + 1][1], tl[i][2], tl[i + 1][2], SC, { belly: QP.belly, bellyDir: [0, 1], bc: 0.5, tex: QP.tex });
    /* a pearl fin on the tail's tip */
    const e = tl[tl.length - 1], p = tl[tl.length - 2]; const dx = e[0] - p[0], dy = e[1] - p[1], n = Math.hypot(dx, dy) || 1;
    poly(L, [[e[0], e[1]], [e[0] + dx / n * 5 + dy / n * 3, e[1] + dy / n * 5 - dx / n * 3], [e[0] + dx / n * 5 - dy / n * 3, e[1] + dy / n * 5 + dx / n * 3]], QP.fin[1]);
    FL(L); }
  /* ---- the coils: lowest first; a bright rim and a row of pearl scutes down each ---- */
  P.loops.forEach(([cx, cy, rx, ry], i) => { if (rx < 1) return; const L = new Layer(); ell(L, cx, cy + sway * (i ? 0.4 : 0), rx, ry, SC, { belly: QP.belly, bc: 0.5, tex: QP.tex });
    for (let q = -rx + 4; q < rx - 3; q += 5) { pset(L, cx + q, cy + ry * 0.55, QP.belly[1]); pset(L, cx + q + 1, cy + ry * 0.55, QP.belly[0]); }
    for (let q = -rx + 3; q < rx - 2; q += 6) pset(L, cx + q, cy - ry * 0.55, QP.rim);
    FL(L); });
  /* ---- the hair, behind her: a dark mass off the head down over the shoulders, its tip where the pose throws it ---- */
  hairDraw(rig, P, key, tm, 'back');
  /* ---- the far arm ---- */
  { const L = new Layer(), A = rig.Bk, dk = QP.skin.map(c => mixC(c, '#1b1528', 0.4));
    cap(L, rig.S[0] - 1, rig.S[1], A.E[0], A.E[1], 2.4, 2, dk); cap(L, A.E[0], A.E[1], A.W[0], A.W[1], 2, 1.6, dk); ell(L, A.W[0], A.W[1], 1.9, 1.9, dk); FL(L); }
  /* ---- the torso: a waist, a pearl bodice, shoulders ---- */
  { const L = new Layer();
    cap(L, rig.B[0], rig.B[1] + breath, rig.M[0], rig.M[1] + breath, 5.4, 5.6, QP.skin);
    cap(L, rig.M[0], rig.M[1] + breath, rig.T[0], rig.T[1] + breath * 1.2, 6.2, 5.2, QP.bodice, { tex: QP.bodice[0] });
    /* the bodice: two pearl shells and a gold band; a pearl necklace across the throat */
    const cx = lerp(rig.M[0], rig.T[0], 0.5), cy = lerp(rig.M[1], rig.T[1], 0.5) + breath;
    ell(L, cx + 1.8, cy, 2.6, 2.3, QP.bodice, {}); ell(L, cx - 2.2, cy + 0.4, 2.6, 2.3, QP.bodice, {});
    cap(L, rig.M[0] - 4, rig.M[1] + 2, rig.M[0] + 4, rig.M[1] + 2, 1.1, 1.1, QP.gold);
    for (let i = -1; i <= 1; i++) pset(L, rig.T[0] + i * 2 + 0.5, rig.T[1] + 2 + (i === 0 ? 1 : 0) + breath, QP.pearl);
    FL(L); }
  /* ---- the head: fins behind, the oval, the face, the crown ---- */
  headDraw(rig, P, key, tm, o);
  hairDraw(rig, P, key, tm, 'front');
  /* ---- the near arm ---- */
  { const L = new Layer(), A = rig.F;
    cap(L, rig.S[0] + 1, rig.S[1], A.E[0], A.E[1], 2.6, 2.1, QP.skin); cap(L, A.E[0], A.E[1], A.W[0], A.W[1], 2.1, 1.7, QP.skin);
    cap(L, lerp(A.E[0], A.W[0], 0.45), lerp(A.E[1], A.W[1], 0.45), lerp(A.E[0], A.W[0], 0.7), lerp(A.E[1], A.W[1], 0.7), 2.1, 1.9, QP.gold);
    ell(L, A.W[0], A.W[1], 2, 2, QP.skin); if (P.hd.venom && key === 'venomSpit') ell(L, A.W[0], A.W[1], 1.6, 1.6, QP.venom);
    /* three claws */
    const fd = pol(P.aF[2], 1); for (let i = -1; i <= 1; i++) pset(L, A.W[0] + fd[0] * 3 - fd[1] * i * 1.2, A.W[1] + fd[1] * 3 + fd[0] * i * 1.2, QP.pearl);
    FL(L); }
  if (!body) fxDraw(P, rig, key, tm, o);
}

const FRAME = (H, t) => { const c = Math.cos(t * D2R), s = Math.sin(t * D2R); return (u, v) => [H[0] + u * c - v * s, H[1] + u * s + v * c]; };

function hairDraw(rig, P, key, tm, layer) {
  const H = rig.H, hp = FRAME(H, P.hd.t * 0.5), [ex, ey] = P.hair, wave = (key === 'song' || key === 'drown' ? Math.sin(tm * 6) * 1.5 : 0), L = new Layer();
  if (layer === 'back') {
    ell(L, hp(-2.5, 1.5)[0], hp(-2.5, 1.5)[1], 7, 8, QP.hair); const root = hp(-3, 4);
    cap(L, root[0], root[1], H[0] + ex * 0.55 + wave, H[1] + ey * 0.6, 5.2, 4, QP.hair); cap(L, H[0] + ex * 0.55 + wave, H[1] + ey * 0.6, H[0] + ex + wave, H[1] + ey, 4, 1.8, QP.hair);
    /* a highlight strand and a pearl comb */
    line(L, root[0] - 1, root[1] + 1, H[0] + ex * 0.8 + wave, H[1] + ey * 0.85, QP.hair[3], 1);
    FL(L);
  } else { /* a front lock over the near shoulder */
    const a = hp(-4.5, 5), b = hp(-4 + ex * 0.08, 11 + Math.max(0, ey) * 0.2); cap(L, a[0], a[1], b[0] + wave * 0.4, b[1], 1.8, 1, QP.hair); FL(L);
  }
}

function headDraw(rig, P, key, tm, o) {
  const H = rig.H, h = P.hd, t = h.t, hp = FRAME(H, t), fl = hp, L = new Layer();
  /* FIN-EARS: teal spikes swept back from the temple, a pale tip (and they flare when she sings) */
  const flare = h.open > 0.7 ? 1.4 : 1;
  for (const [da, ln] of [[-165, 7 * flare], [-190, 8 * flare], [-215, 6 * flare]]) { const s0 = fl(-4, -1), u = pol(t + da, ln), n = pol(t + da + 90, 1.8);
    poly(L, [[s0[0] + n[0], s0[1] + n[1]], [s0[0] + u[0], s0[1] + u[1]], [s0[0] - n[0], s0[1] - n[1]]], QP.fin[1]); pset(L, s0[0] + u[0], s0[1] + u[1], QP.fin[2]); }
  /* the oval of the face: the palest mass she has */
  ell(L, H[0], H[1], 6 + (h.cheeks ? 0.9 : 0), 7, QP.skin, { rot: t * 0.5 });
  const jaw = h.open * 3.4;
  /* eyes: dark sockets under hard brows; teal iris, white core; flare = bigger and white-hot */
  const eyes = [[1.6, -1.2, 1], [-2.6, -1.2, 0.8]];
  for (const [u, v, s] of eyes) { const [ex, ey] = hp(u, v);
    if (h.eye === 'closed') { line(L, ex - 1, ey + 0.4, ex + 1.5, ey + 0.4, QP.socket, 1); continue; }
    if (h.eye === 'dim') { pset(L, ex, ey, QP.eye); pset(L, ex + 1, ey, QP.eye); pset(L, ex - 1, ey - 1, QP.socket); pset(L, ex, ey - 1, QP.socket); pset(L, ex + 1, ey - 1, QP.socket); continue; }
    const big = h.eye === 'flare';
    for (let j = -1; j <= (big ? 2 : 1); j++) for (let i = -1; i <= 2; i++) pset(L, ex + i, ey + j, QP.socket);
    for (let j = 0; j < (big ? 2 : 1 + (s > 0.9 ? 1 : 0)); j++) for (let i = 0; i < 2; i++) pset(L, ex + i, ey + j, big ? QP.eyeHot : QP.eye);
    pset(L, ex + (u > 0 ? 1 : 0), ey, big ? QP.eye : QP.eyeHot);
    /* the brow: a hard dark line angled down to the nose */
    line(L, ex - 1, ey - 2 + (u > 0 ? 0 : 0), ex + 2, ey - 2 + (u > 0 ? 1 : 0), QP.hair[0], 1); }
  /* the nose: one shadow pixel; the mouth: red when shut, a black O with a tooth row when she sings, a snarl (fangs) when she spits */
  const [nx, ny] = hp(2.4, 1.6); pset(L, nx, ny, QP.skin[0]);
  const m0 = hp(0.4, 3.6 + jaw * 0.1);
  if (h.open < 0.15) { line(L, m0[0] - 1.5, m0[1], m0[0] + 2, m0[1], QP.lip, 1); pset(L, m0[0] - 2, m0[1] - 1, QP.lip); pset(L, m0[0] + 3, m0[1] - 1, QP.lip); }
  else { const rw = 2.2 + h.open * 0.6, rh = 1 + jaw; ell(L, m0[0], m0[1] + rh * 0.4, rw, rh, [QP.mouth, QP.mouth, QP.mouth]);
    for (let i = -1; i <= 1; i++) pset(L, m0[0] + i * 1.5, m0[1] - rh * 0.4 + 0.5, QP.tooth);
    if (h.venom) { for (let i = -1; i <= 1; i++) pset(L, m0[0] + i, m0[1] + rh * 0.6 + 0.4, QP.venom[2 - (i & 1)]); if (h.open > 0.8) { pset(L, m0[0] - 2, m0[1] - 0.6, QP.tooth); pset(L, m0[0] + 3, m0[1] - 0.6, QP.tooth); } }
    else if (h.throat) pset(L, m0[0], m0[1] + rh * 0.5, QP.ringHi);
    /* the lips' red rim */
    pset(L, m0[0] - rw, m0[1] + rh * 0.4, QP.lip); pset(L, m0[0] + rw, m0[1] + rh * 0.4, QP.lip); }
  /* a cheek gill: two teal ticks */
  pset(L, fl(-3.2, 2.4)[0], fl(-3.2, 2.4)[1], QP.fin[1]); pset(L, fl(-3.8, 3.4)[0], fl(-3.8, 3.4)[1], QP.fin[1]);
  FL(L);
  /* THE CROWN: its own mass: a gold band over the brow, five points, a pearl on each tip (tilted if she sleeps) */
  { const C = new Layer(), ct = (P.crownTilt || 0), cp = FRAME(hp(0.2, -5.6), t * 0.5 + ct);
    const a = cp(-4.2, 0), b = cp(4.2, 0); cap(C, a[0], a[1], b[0], b[1], 1.2, 1.2, QP.gold);
    for (const u of [-4, -2, 0, 2, 4]) { const base = cp(u, -1), tip = cp(u, u === 0 ? -5.5 : -3.6); poly(C, [[base[0] - 1, base[1]], [tip[0], tip[1]], [base[0] + 1, base[1]]], QP.gold[2]); pset(C, tip[0], tip[1] - 1, QP.pearl); }
    pset(C, cp(0, 0)[0], cp(0, 0)[1], QP.eye);
    FL(C); }
}

/* the effects: never outlined, skipped when o.bodyOnly */
function ringAt(cx, cy, r, c, a, sx = 1, step = 18) { for (let d = 0; d < 360; d += step) { const px = cx + Math.cos(d * D2R) * r * sx, py = cy + Math.sin(d * D2R) * r * 0.7; rc(px, py, 1, 1, c, a); } }
function fxDraw(P, rig, key, tm, o) {
  const f = P.fx, H = rig.H;
  if (f === 'song' || f === 'drown') for (let i = 0; i < 3; i++) { const r = 12 + ((tm * 30 + i * 12) % 36); ringAt(H[0], H[1] + 6, r, i & 1 ? QP.ringHi : QP.ring, 0.75 - r / 70, 1, 14);
    /* notes: a head and a stem */ const nx = H[0] - 22 + i * 22 + Math.sin(tm * 3 + i) * 3, ny = H[1] - 8 - ((tm * 18 + i * 9) % 22); rc(nx, ny, 2, 2, QP.ringHi, 0.9); rc(nx + 1, ny - 4, 1, 4, QP.ringHi, 0.9); }
  if (f === 'gather') for (let i = 0; i < 5; i++) { const a = tm * 2 + i * 1.26, r = 20 - ((tm * 12 + i * 4) % 14); rc(H[0] + Math.cos(a) * r, H[1] + 4 + Math.sin(a) * r * 0.6, 1, 1, QP.ringHi, 0.8); }
  if (f === 'arc') { for (const s of [-1, 1]) for (let d = 0; d < 7; d++) rc(s * (22 + d * 8), -4 - Math.abs(d - 3) * 1.4, 7, 1, QP.white, 0.55); }
  if (f === 'spit') for (let i = 0; i < 6; i++) rc(H[0] + 8 + i * 4, H[1] + 4 + i * 0.7, 3, 2, QP.venom[1 + (i & 1)], 0.9 - i * 0.1);
  if (f === 'drip') for (let i = 0; i < 2; i++) rc(H[0] + 3 + i * 3, H[1] + 7 + ((tm * 14 + i * 4) % 8), 1, 2, QP.venom[2], 0.9);
  if (f === 'stars') for (let i = 0; i < 3; i++) { const a = tm * 5 + i * 2.1; rc(H[0] + Math.cos(a) * 9 - 1, H[1] - 9 + Math.sin(a) * 3, 2, 2, QP.spark); }
  if (f === 'glint') { rc(H[0] + 4, H[1] - 3, 3, 1, QP.eyeHot, 0.9); rc(H[0] + 5, H[1] - 4, 1, 3, QP.eyeHot, 0.9); }
  if (f === 'bubbles' || f === 'ripple' || f === 'drown') for (let i = 0; i < 5; i++) { const bx = -16 + i * 9 + Math.sin(tm * 2 + i) * 2, by = -10 - ((tm * 16 + i * 7) % 24); rc(bx, by, 2, 2, QP.water[3], 0.55); rc(bx, by, 1, 1, QP.white, 0.8); }
  if (f === 'ripple' || f === 'drown') for (let x = -34; x < 34; x += 6) rc(x + ((tm * 14) % 6), -2, 3, 1, QP.water[3], 0.7);
  if (key === 'venomTell' || key === 'surfaceTell') { rc(rig.F.W[0] + 6, rig.F.W[1] - 2, 3, 1, QP.hot, 0.9); rc(rig.F.W[0] + 7, rig.F.W[1] - 3, 1, 3, QP.hot, 0.9); }
}

/* UNDER THE TIDE: a low dark shape (translucent), a dorsal ridge, two glowing eyes, a wake */
function underDraw(tm, body) {
  const L = new Layer(), SC = QP.scale.map(c => mixC(c, '#0e1118', 0.25));
  ell(L, -4, -5, 25, 5, SC, { tex: QP.tex }); ell(L, 14, -6, 10, 4, SC);
  for (let i = -2; i < 6; i++) { const x = -22 + i * 6, h = 3 + (i & 1); poly(L, [[x, -9], [x + 2.5, -9 - h - Math.sin(tm * 2 + i) * 0.6], [x + 5, -9]], QP.fin[0]); }
  cap(L, -28, -4, -48, -3, 4, 1.4, SC);
  pset(L, 18, -8, QP.eye); pset(L, 19, -8, QP.eyeHot); pset(L, 16, -8, QP.eye);
  const a = ALPHA_; ALPHA_ = a * 0.6; FL(L); ALPHA_ = a;
  if (!body) { for (let i = 0; i < 4; i++) rc(-20 + i * 12 + ((tm * 10) % 6), -13 - (i & 1), 3, 1, QP.water[3], 0.6); }
}

/* HER FALL: k 0..1 - she slumps off the reel, the crown rolls, the coils loosen, she sinks. drawQueenDead(g, x, y, f, k, t) */
export function drawQueenDead(g, x, y, f, k, time = 0, o = {}) {
  const A = Q_POSE_SET.reel, B = Q_POSE_SET.dragged, kk = clamp(k), e = kk < 0.3 ? kk / 0.3 * 0.55 : 0.55 + (kk - 0.3) / 0.7 * 0.45;
  const P = { loops: blend(A.loops, B.loops, e), tail: blend(A.tail, B.tail, e), b: blend(A.b, B.b, e), lean0: lerp(A.lean0, B.lean0, e), lean: lerp(A.lean, B.lean, e), len: lerp(A.len, B.len, e),
    hd: { t: lerp(A.hd.t, B.hd.t, e), dx: lerp(A.hd.dx, B.hd.dx, e), dy: lerp(A.hd.dy, B.hd.dy, e), open: lerp(A.hd.open, 0.2, e), eye: 'closed' }, aF: blend(A.aF, B.aF, e), aB: blend(A.aB, B.aB, e), hair: blend(A.hair, B.hair, e), crownTilt: lerp(0, 40, e) };
  drawQueen(g, x, y, f, { ...o, P, alpha: kk > 0.7 ? 1 - (kk - 0.7) / 0.3 * 0.9 : 1, still: true }, time);
  if (!o.bodyOnly) { g_ = g; X_ = R(x); Y_ = R(y); F_ = f >= 0 ? 1 : -1; ALPHA_ = 1; TINT_ = 0;
    for (let i = 0; i < 6; i++) { const yy = -10 - ((time * 18 + i * 8) % 34) * (0.4 + kk), xx = -18 + i * 7 + Math.sin(time * 3 + i) * 2; rc(xx, yy, 2, 2, QP.water[3], 0.5 * (1 - kk * 0.6)); }
    /* the crown rolls off along the rock */ const cx = 14 + kk * 26; rc(cx, -2, 6, 2, QP.gold[2], 1 - kk * 0.5); rc(cx, -4, 1, 2, QP.gold[3], 1 - kk * 0.5); rc(cx + 3, -4, 1, 2, QP.gold[3], 1 - kk * 0.5); rc(cx + 5, -4, 1, 2, QP.gold[3], 1 - kk * 0.5); }
}

/* the venom glob in flight (a green blob with a trailing drip) and the pool it leaves (a bubbling green puddle on the rock). (x, y) on screen */
export function drawVenomGlob(g, x, y, vx = 0, vy = 0, t = 0) {
  const r = (a, b, w, h, c, al = 1) => { if (al !== 1) g.globalAlpha = al; g.fillStyle = c; g.fillRect(R(x + a), R(y + b), w, h); if (al !== 1) g.globalAlpha = 1; };
  const n = Math.hypot(vx, vy) || 1, ux = vx / n, uy = vy / n;
  for (let i = 3; i >= 1; i--) r(-ux * i * 3 - 1, -uy * i * 3 - 1, 3 - (i > 1 ? 1 : 0), 3 - (i > 1 ? 1 : 0), QP.venom[1], 0.5 - i * 0.1);
  r(-3, -3, 6, 6, QP.out); r(-2, -3, 4, 6, QP.venom[1]); r(-3, -2, 6, 4, QP.venom[1]); r(-2, -2, 4, 4, QP.venom[2]); r(-2, -2, 2, 2, QP.venom[3]); r(1, 1, 1, 1, QP.venom[0]);
}
export function drawVenomPool(g, x, y, k = 1, t = 0) {
  const r = (a, b, w, h, c, al = 1) => { g.globalAlpha = al * k; g.fillStyle = c; g.fillRect(R(x + a), R(y + b), w, h); };
  r(-16, -2, 32, 2, QP.venom[0], 0.85); r(-13, -3, 26, 1, QP.venom[1], 0.85); r(-9, -4, 18, 1, QP.venom[2], 0.7);
  for (let i = 0; i < 4; i++) { const ph = (t * 2 + i * 0.37) % 1; r(-12 + i * 8 + Math.sin(t + i) * 2, -4 - ph * 6, 2, 2, QP.venom[3], 0.8 * (1 - ph)); }
  g.globalAlpha = 1;
}
