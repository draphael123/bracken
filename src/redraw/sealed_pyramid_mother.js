// src/redraw/sealed_pyramid_mother.js - THE SCARAB MOTHER, drawn (claude/spart, the art pass). The greybox drew her live from canvas ellipses; now every move of hers is its OWN baked pose
// (B16: its own windup and its own release, never a shared frame or a lean). Her contract (src/scarab-mother-hands.js drawBoss): every pose faces RIGHT (flipped live), CX is the
// body's centre column, the canvas's last row is the floor under her feet. A pose is a canvas in POSES (and POSE_NAMES lists them, in order):
//   sleep      curled low, legs folded in, head tucked          wake       rising, forelegs planted, head coming up
//   walk0/1    the walk (also 'back', and 'recover' standing)   chargeTell head LOWERED, horn levelled, one foreleg raking the floor (two frames: rake0/rake1)
//   charge     stretched flat out, legs streaming back          skid       braced, forelegs thrown forward, head up, the dust thrown
//   dazed      head drooped, legs splayed, mandibles slack      snapTell   forelegs reared, the head up, MANDIBLES SPREAD WIDE
//   snap       head thrust forward, mandibles shut on the air    spitTell   abdomen TIPPED UP over her back, the acid sac bulged and lit
//   spit       abdomen snapped down, the sac emptied, a spray    burrowTell forelegs digging, the front sunk in the floor, sand flying
//   burrowUp   erupting: half out of the floor, sand running off  quakeTell  REARED on her hind legs, forelegs high, the head back
//   quake      slammed down, forelegs driven into the floor        pinned     (open: block) flattened, legs splayed flat
//   stuck0/1   (open: darts) darts standing in her shell, legs jerking      flipped0/1 (open: stone) on her BACK, legs kicking at the air
// the seal of her on the wing-case (a gold scarab sigil) is the same THE SEAL that is cut on the tomb's walls.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { pack, settleFrame } from './sealed_pyramid_cast.js';

export const MW = 92, MH = 56, CX = 44, GY = MH - 1;
const C = { sh: '#0c2620', shM: '#17463a', shL: '#2e8a58', shH: '#9ae8b0', shD: '#06140f', gold: '#d8aa40', goldL: '#f8e08a', goldD: '#8a6a20', leg: '#1c4a38', legL: '#0f2a20', spine: '#c8bea0',
  eye: '#ff5a3a', eyeL: '#ffc890', mand: '#3a2a1a', mandL: '#8a6a40', sac: '#8cb458', sacL: '#d8f090', sacD: '#4a6a2a', egg: '#d8d0a8', belly: '#b49c68', bellyD: '#7a6a3e', acid: '#9ad04a', acidL: '#e0ff90', sand: '#e0c890', sandD: '#a88a58', dart: '#3a2a1a', dartTip: '#d8d8d0' };

function limb(g, hx, hy, kx, ky, fx, fy, col, hi) {
  line(g, hx, hy, kx, ky, col, 2); line(g, kx, ky, fx, fy, col, 2); line(g, kx - 1, ky - 1, kx, ky, hi || col); px(g, kx, ky - 1, C.spine); px(g, kx + 1, ky - 2, C.spine);
  px(g, (kx + fx) >> 1, ((ky + fy) >> 1), C.spine); px(g, fx, fy, C.leg); px(g, fx + 1, fy, C.leg); px(g, fx + 2, fy - 1, C.leg); }
/* P: the pose's parameters */
function mother(g, P = {}) {
  const lift = P.lift || 0, ab = P.ab || 0, abx = P.abx || 0, hx = P.hx || 0, hy = P.hy || 0, mand = P.mand ?? 2, horn = P.horn || 0, by = GY - 20 - lift, tilt = P.tilt || 0;
  const hip = GY - 14 - lift;
  const feet = P.feet || [[-22, 0], [-9, 0], [7, 0]];   /* [foot dx, foot dy-up] of the hind, middle and fore pair */
  const knee = P.knee || [[-26, -9], [-12, -11], [9, -11]];
  const hipx = [CX - 18, CX - 4, CX + 9];
  /* the FAR legs (dark), then the body, then the NEAR legs */
  for (let i = 0; i < 3; i++) { const [fdx, fup] = feet[i], [kdx, kdy] = knee[i]; limb(g, hipx[i] + 2, hip, hipx[i] + 3 + kdx + 5, hip + kdy, CX + fdx + 6, GY - 1 - fup, C.legL, C.shM); }
  /* the ABDOMEN: a brood sac under the wing-case's tail, pale green, bulged with eggs, tipped by ab */
  { const ax = CX - 28 + abx, ay = by + 2 - ab; ellipse(g, ax, ay, 10, 9.5, C.sacD); ellipse(g, ax - 1, ay - 1, 9, 8.4, C.sac);
    for (const [ex, ey] of [[-5, -3], [0, 1], [-4, 4], [3, -4], [4, 4]]) { ellipse(g, ax + ex, ay + ey, 2.4, 2.2, C.sacL); px(g, ax + ex - 1, ay + ey - 1, '#fff8d0'); px(g, ax + ex + 1, ay + ey + 1, C.sacD); }
    for (let k = 0; k < 5; k++) line(g, ax - 9 + k * 4, ay - 8 + Math.abs(k - 2), ax - 8 + k * 4, ay - 2, C.sacD);
    if (P.acid) { ellipse(g, ax - 6, ay - 4, 4, 4, C.acid); px(g, ax - 7, ay - 6, C.acidL); px(g, ax - 6, ay - 5, C.acidL); px(g, ax - 8, ay - 3, C.acidL); for (let i = 0; i < 4; i++) px(g, ax - 12 - (i & 1), ay - 8 - i * 2, C.acid); }
    if (P.spray) { for (let i = 0; i < 9; i++) { px(g, ax - 11 - i * 2, ay + 4 - ((i * 3) % 7) + (i > 5 ? 4 : 0), i % 2 ? C.acid : C.acidL); } } }
  /* the WING-CASE: a great domed elytron, emerald-black, a gold seam, ribs of light, THE SEAL cut in gold at its crown */
  ellipse(g, CX - 10, by - 1, 22, 14, C.sh); ellipse(g, CX - 11, by - 3, 20, 11.5, C.shM); ellipse(g, CX - 13, by - 6.4, 15, 5.4, C.shL); ellipse(g, CX - 15, by - 8, 8, 2, C.shH);
  for (let k = 0; k < 5; k++) { const rx = CX - 28 + k * 7; line(g, rx, by - 11 + Math.abs(k - 2) * 2, rx - 2, by + 8, C.sh); px(g, rx + 1, by - 8 + Math.abs(k - 2), C.shL); }
  line(g, CX - 11, by - 14, CX - 11, by + 12, C.gold); line(g, CX - 10, by - 13, CX - 10, by + 11, C.goldL);
  { const sx = CX - 6, sy = by - 5; ellipse(g, sx, sy, 4, 3.5, C.gold); ellipse(g, sx, sy, 2.6, 2.4, C.shD); rect(g, sx - 1, sy - 2, 2, 5, C.gold); px(g, sx - 3, sy, C.goldL); px(g, sx + 3, sy, C.goldL); px(g, sx, sy - 3, C.goldL); px(g, sx - 2, sy - 1, C.goldL); px(g, sx + 2, sy - 1, C.goldL); }
  rect(g, CX - 31, by + 8, 28, 2, C.sh);
  /* the PRONOTUM (the shield behind the head): a ridged saddle */
  ellipse(g, CX + 8, by + 1, 10, 9, C.sh); ellipse(g, CX + 8, by - 1, 8.4, 7, C.shM); ellipse(g, CX + 6, by - 3.4, 5, 2.6, C.shL); px(g, CX + 3, by - 4, C.shH); px(g, CX + 4, by - 4, C.shH);
  for (let k = 0; k < 3; k++) { px(g, CX + 12 + k, by - 5 + k, C.spine); px(g, CX + 13 + k, by - 5 + k, C.spine); }   /* spines on the pronotum's rim */
  /* the HEAD: a broad clypeus, a curved horn, ember eyes, two sickle MANDIBLES */
  const hxx = CX + 24 + hx, hyy = by + 3 + hy;
  ellipse(g, hxx, hyy, 8.4, 7, C.sh); ellipse(g, hxx - 1, hyy - 2, 7, 4.6, C.shM); px(g, hxx - 3, hyy - 4, C.shH); px(g, hxx - 2, hyy - 4, C.shH);
  fillPoly(g, [[hxx - 3, hyy - 4], [hxx + 1 + horn, hyy - 14 - (P.hornUp || 0)], [hxx + 2, hyy - 3]], C.shM); line(g, hxx - 1, hyy - 5, hxx + 1 + horn, hyy - 13 - (P.hornUp || 0), C.shL); px(g, hxx + 1 + horn, hyy - 14 - (P.hornUp || 0), C.shH);
  rect(g, hxx + 1, hyy - 3, 4, 3, C.eye); px(g, hxx + 2, hyy - 3, C.eyeL); px(g, hxx + 3, hyy - 3, C.eyeL); px(g, hxx + 4, hyy - 2, '#8a1e0e');
  rect(g, hxx + 3, hyy + 3, 3, 2, C.sh);   /* the labrum */
  /* mandibles: upper and lower sickles that meet at the tip when shut (mand 0) and part to a gape (mand 8) */
  { const o = mand; const up = [[hxx + 6, hyy], [hxx + 11, hyy - 1 - o * 0.4], [hxx + 15, hyy + 1 - o * 0.9], [hxx + 17, hyy + 3 - o]], dn = [[hxx + 6, hyy + 3], [hxx + 11, hyy + 4 + o * 0.4], [hxx + 15, hyy + 3 + o * 0.9], [hxx + 17, hyy + 1 + o]];
    for (const m of [up, dn]) { for (let i = 0; i < m.length - 1; i++) line(g, m[i][0], m[i][1], m[i + 1][0], m[i + 1][1], C.mand, 2); px(g, m[3][0], m[3][1], C.spine); px(g, m[3][0] + 1, m[3][1], '#fff'); px(g, m[1][0], m[1][1] - 1, C.mandL); px(g, m[2][0], m[2][1], C.mandL); } }
  /* the NEAR legs (over the body's edge): knees up and out, spined, a hooked foot */
  for (let i = 0; i < 3; i++) { const [fdx, fup] = feet[i], [kdx, kdy] = knee[i]; limb(g, hipx[i], hip, hipx[i] + 3 + kdx, hip + kdy, CX + fdx + 3, GY - 1 - fup, C.leg, C.legL); }
  if (P.darts) { for (let i = 0; i < 7; i++) { const dx = CX - 26 + i * 5, dy = by - 12 + (i * 5 % 4) - Math.abs(i - 3); line(g, dx, dy, dx + 4, dy - 6 - (i & 1), C.dart); px(g, dx + 4, dy - 7 - (i & 1), C.dartTip); px(g, dx + 5, dy - 8 - (i & 1), C.dartTip); px(g, dx - 1, dy + 1, '#8a1e0e'); } }
}
/* ---- the pose table: parameters per pose ---- */
const STAND = { feet: [[-22, 0], [-9, 0], [7, 0]], knee: [[-26, -9], [-12, -11], [9, -11]] };
const gait = k => ({ feet: [[-22 + k * 4, k > 0 ? 0 : 3], [-9 - k * 5, k > 0 ? 3 : 0], [7 + k * 5, k > 0 ? 0 : 3]], knee: [[-26 + k * 3, -9], [-12 - k * 3, -12], [9 + k * 3, -9]] });
export const POSE_DEFS = {
  sleep:   { lift: -8, hy: 6, hx: -6, mand: 0, horn: -2, feet: [[-18, 0], [-6, 0], [4, 0]], knee: [[-20, -5], [-10, -6], [6, -6]], ab: -2 },
  wake:    { lift: -3, hy: 3, hx: -2, mand: 1, feet: [[-20, 0], [-8, 0], [8, 0]], knee: [[-24, -7], [-11, -9], [10, -9]], ab: 0 },
  walk0:   { ...gait(1), mand: 2 }, walk1: { ...gait(-1), mand: 2, lift: 1 },
  rake0:   { lift: -4, hy: 7, hx: 2, hornUp: -4, horn: 3, mand: 1, feet: [[-22, 0], [-9, 0], [14, 7]], knee: [[-26, -9], [-12, -10], [18, -3]], ab: 2 },
  rake1:   { lift: -4, hy: 7, hx: 2, hornUp: -4, horn: 3, mand: 1, feet: [[-22, 0], [-9, 0], [16, 0]], knee: [[-26, -9], [-12, -10], [14, -9]], ab: 2 },
  charge:  { lift: -6, hy: 5, hx: 3, hornUp: -6, horn: 4, mand: 0, feet: [[-34, 5], [-26, 3], [-12, 4]], knee: [[-36, -1], [-28, -2], [-14, -2]], ab: -3, abx: -3 },
  skid:    { lift: 0, hy: -2, hx: -2, hornUp: 2, mand: 3, feet: [[-14, 0], [8, 0], [22, 0]], knee: [[-12, -12], [10, -8], [24, -4]], ab: 4, abx: 2 },
  dazed:   { lift: -6, hy: 8, hx: 0, mand: 5, horn: -2, feet: [[-26, 0], [-14, 0], [14, 0]], knee: [[-32, -4], [-18, -5], [18, -5]], ab: -3 },
  snapTell:{ lift: 3, hy: -6, hx: -5, hornUp: 3, mand: 8, feet: [[-20, 0], [-8, 0], [12, 9]], knee: [[-24, -9], [-10, -11], [13, -12]], ab: 3 },
  snap:    { lift: 0, hy: 2, hx: 9, hornUp: 0, mand: 0, feet: [[-22, 0], [-8, 0], [12, 4]], knee: [[-26, -9], [-10, -11], [14, -8]], ab: 0, abx: -2 },
  spitTell:{ lift: 2, hy: -3, hx: -6, mand: 4, acid: true, ab: 12, abx: 4, feet: [[-18, 0], [-6, 0], [8, 0]], knee: [[-22, -9], [-9, -11], [9, -11]] },
  spit:    { lift: 0, hy: 0, hx: 2, mand: 2, spray: true, ab: -1, abx: -2, feet: [[-22, 0], [-9, 0], [7, 0]], knee: [[-26, -9], [-12, -11], [9, -11]] },
  burrowTell:{ lift: -8, hy: 8, hx: 4, hornUp: -5, horn: 3, mand: 1, feet: [[-20, 0], [-6, 0], [10, 6]], knee: [[-24, -7], [-9, -8], [14, -2]], ab: 1 },
  burrowUp:{ lift: -12, hy: 6, hx: 0, hornUp: -3, mand: 2, feet: [[-20, 0], [-8, 0], [8, 0]], knee: [[-24, -5], [-10, -6], [10, -6]], ab: -2 },
  quakeTell:{ lift: 6, tilt: 1, hy: -8, hx: -9, hornUp: 4, mand: 5, feet: [[-18, 0], [-6, 0], [4, 17]], knee: [[-24, -10], [-9, -12], [9, -20]], ab: -6, abx: -2 },
  quake:   { lift: -2, hy: 5, hx: 6, hornUp: -3, mand: 1, feet: [[-20, 0], [-8, 0], [18, -1]], knee: [[-24, -9], [-10, -10], [20, -8]], ab: 2 },
};
export const POSE_NAMES = [...Object.keys(POSE_DEFS), 'pinned', 'stuck0', 'stuck1', 'flipped0', 'flipped1', 'idle'];

function bakeOne(def) { const [c, g] = canvas(MW, MH); mother(g, def); outline(c, OUT); return c; }
function bakePinned() {   /* (open: block) flattened under the falling stone: the shell squashed wide and low, legs splayed flat, the head pressed forward and the eyes wide */
  const [c, g] = canvas(MW, MH);
  for (const [dx, fx] of [[-22, -40], [-10, -30], [4, 40], [14, 50]]) { line(g, CX + dx, GY - 6, CX + dx + (fx > 0 ? 8 : -8), GY - 3, C.legL, 2); line(g, CX + dx + (fx > 0 ? 8 : -8), GY - 3, CX + fx * 0.5 + dx * 0.5, GY - 1, C.legL, 2); px(g, CX + fx * 0.5 + dx * 0.5, GY - 1, C.leg); }
  ellipse(g, CX - 28, GY - 7, 9, 5, C.sacD); ellipse(g, CX - 29, GY - 8, 8, 4, C.sac); for (const ex of [-4, 1, 5]) { ellipse(g, CX - 29 + ex, GY - 8, 2, 1.6, C.sacL); }
  ellipse(g, CX - 6, GY - 8, 28, 8, C.sh); ellipse(g, CX - 7, GY - 9, 26, 6.6, C.shM); ellipse(g, CX - 10, GY - 11, 14, 2.4, C.shL); line(g, CX - 8, GY - 15, CX - 8, GY - 1, C.gold);
  for (let k = 0; k < 5; k++) line(g, CX - 28 + k * 7, GY - 14, CX - 30 + k * 7, GY - 2, C.sh);
  line(g, CX - 20, GY - 15, CX - 14, GY - 9, C.shD); line(g, CX + 4, GY - 15, CX - 2, GY - 8, C.shD);   /* the cracks the stone made */
  ellipse(g, CX + 26, GY - 6, 9, 5, C.sh); ellipse(g, CX + 25, GY - 8, 7, 3, C.shM); rect(g, CX + 28, GY - 8, 4, 3, C.eye); px(g, CX + 29, GY - 8, C.eyeL); px(g, CX + 31, GY - 7, C.eyeL);
  for (const m of [[GY - 5, 1], [GY - 3, -1]]) { line(g, CX + 33, m[0], CX + 40, m[0] + m[1], C.mand, 2); px(g, CX + 41, m[0] + m[1], C.spine); }
  for (let k = 0; k < 6; k++) px(g, CX - 26 + k * 10, GY - 17 - (k % 2), C.sand); outline(c, OUT); return c; }
function bakeStuck(k) {   /* (open: darts) a hedgehog of darts in the shell, legs jerking, the head thrown up, the mandibles gaping */
  const [c, g] = canvas(MW, MH); const j = k ? 3 : -3;
  mother(g, { lift: 1, hy: -3, hx: -2, hornUp: 2, mand: 7, darts: true, feet: [[-22 + j, 0], [-9 - j, 0], [7 + j, 0]], knee: [[-26 + j * 2, -11], [-12 - j * 2, -13], [9 + j * 2, -12]], ab: 1 });
  outline(c, OUT); return c; }
function bakeFlipped(k) {   /* (open: stone) ON HER BACK: the pale ridged belly up, the six legs jerking at the air, the head lolling, the dome of the shell under her like a rocking bowl */
  const [c, g] = canvas(MW, MH); const s = k ? 1 : -1;
  ellipse(g, CX - 4, GY - 6, 26, 6, C.sh); ellipse(g, CX - 4, GY - 4.4, 22, 3.6, C.shM); line(g, CX - 4, GY - 1, CX - 4, GY - 8, C.gold);   /* the shell rocking beneath */
  ellipse(g, CX - 28, GY - 12, 10, 8, C.sacD); ellipse(g, CX - 28, GY - 13, 9, 7, C.sac); ellipse(g, CX - 5, GY - 15, 22, 9, C.bellyD); ellipse(g, CX - 5, GY - 16, 20, 7.4, C.belly);   /* the abdomen and the plated belly */
  for (let i = 0; i < 6; i++) line(g, CX - 22 + i * 7, GY - 21, CX - 21 + i * 7, GY - 9, C.bellyD); px(g, CX - 14, GY - 20, '#e8d8a8'); px(g, CX + 2, GY - 20, '#e8d8a8');
  for (let i = 0; i < 3; i++) { const hx0 = CX - 18 + i * 13, sw = (i % 2 ? s : -s) * 5;
    limb(g, hx0, GY - 20, hx0 + 4 + sw, GY - 32 - (i & 1) * 2, hx0 + 8 + sw * 2, GY - 41 - (i === 1 ? 2 : 0), C.legL, C.shM);
    limb(g, hx0 + 5, GY - 20, hx0 - 1 - sw, GY - 33, hx0 - 6 - sw * 2, GY - 42, C.leg, C.legL); }
  ellipse(g, CX + 26, GY - 13, 8.4, 7, C.sh); ellipse(g, CX + 25, GY - 15, 7, 4.6, C.shM); rect(g, CX + 27, GY - 14, 4, 3, C.eye); px(g, CX + 28, GY - 14, C.eyeL);
  line(g, CX + 33, GY - 15, CX + 39, GY - 19 - s, C.mand, 2); line(g, CX + 33, GY - 10, CX + 39, GY - 6 + s, C.mand, 2); px(g, CX + 40, GY - 19 - s, C.spine); px(g, CX + 40, GY - 6 + s, C.spine);
  fillPoly(g, [[CX + 22, GY - 19], [CX + 21, GY - 28], [CX + 26, GY - 19]], C.shM); for (let i = 0; i < 5; i++) px(g, CX - 20 + i * 9, GY - 30 + (i % 2) * 4 + s, C.goldL);   /* (stars) */
  outline(c, OUT); return c; }
export function bakeMother() {
  const P = {}; for (const [k, d] of Object.entries(POSE_DEFS)) P[k] = settleFrame(bakeOne(d));
  P.pinned = bakePinned(); P.stuck0 = bakeStuck(0); P.stuck1 = bakeStuck(1); P.flipped0 = settleFrame(bakeFlipped(0)); P.flipped1 = settleFrame(bakeFlipped(1)); P.idle = P.walk0;
  return P; }
/* the bestiary card: two frames of her at full size (the bestiary scales a set to its panel) */
export function bakeCard() { const base = bakeMother(); return pack([base.walk0, base.snapTell], CX, MH, 40, 24); }
