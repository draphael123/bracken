// src/lance-art.js - THE QUEEN'S LANCE, drawn (claude/stormhold3art; the rework's art list in scratch/lane-reports/stormhold3.md; B16: every move has its
// own windup and release pose). Art only: nothing here is read by the fight (updateLance in src/main.js) except frameOf(), which turns his mode into a pose.
//   THE QUEEN'S CHAMPION   plate (cold steel gone grey with the siege), a PLUMED HELM (red plume over a gold crest, one amber slit), the Queen's purple
//                          tabard and cloak with the gold chevron, a TOWER SHIELD in the same, and a LANCE WITH A SWALLOW-TAILED PENNANT (purple, gold edge).
//   THE BARDED CHARGER     a dark bay under steel (chanfron with a spike, crinet plates, a peytral over the chest) and the Queen's caparison to its knees.
// Both are built from joints (a pose is numbers: where the hips are, where the hand is, what angle the lance takes), so every move's tell is a different SHAPE,
// not a recolour. Sheets face right; the left-facing set is the flip (ax/ay = his feet).
import { canvas, rect, px, fillPoly, line, circle, ellipse, outline, flipX, whiten } from './px.js';

const OUT = '#1b1626';
const C = { s: '#b4bcc8', S: '#8590a0', D: '#4a5262', K: '#262b36', p: '#8a4cb4', P: '#4e2670', G: '#f0c048', g: '#a87c20', r: '#d8483e', R: '#8f2f28',
  w: '#9a7448', W: '#5e4430', e: '#ffc04a', f: '#f0f4f8', k: '#14121a', h: '#4a3640', H: '#2e2128', b: '#6a5058' };
const limb = (g, x0, y0, x1, y1, w0, w1, col) => { const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  fillPoly(g, [[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], col); };
const rad = a => a * Math.PI / 180;

// ---------------------------------------------------------------------------------------------------------------- THE CHAMPION
const CW = 112, CH = 92, FX = 36, FY = 87;   /* the sheet, and his feet on it */
function champion(o0) {
  const [c, g] = canvas(CW, CH);
  const o = { lean: 0, crouch: 0, hipDx: 0, foot: [-5, 5], lift: [0, 0], knee: [1, 3], hand: [9, -3], ang: -28, len: 36, sh: [6, 5], shS: 1, flut: 0, cape: 1, air: 0, head: [0, 0], banner: 1, plume: 1, seat: false, thigh: 0, pole: true, ...o0 };
  const hipX = FX + o.hipDx, hipY = FY - 15 + o.crouch - o.air;
  const shX = hipX + o.lean, shY = hipY - 12 + (o.crouch > 3 ? 1 : 0), hdX = shX + 1 + o.head[0], hdY = shY - 7 + o.head[1];
  const fl = o.flut, fk = Math.sin(fl) * 1.6;
  // ---- the cloak, behind everything
  if (o.cape) { const k = o.cape; fillPoly(g, [[shX - 3, shY - 1], [shX + 1, shY + 1], [hipX - 1, hipY + 9], [hipX - 9 - 4 * k + fk, hipY + 12 + (o.air ? -2 : 0)], [shX - 8 - 2 * k, shY + 6]], C.P);
    line(g, shX - 4, shY + 1, hipX - 8 - 4 * k + fk, hipY + 11, C.p); px(g, hipX - 8 - 4 * k + fk, hipY + 12, C.G); }
  // ---- legs (back one, then front), greaves with a bright knee and a dark sabaton
  const leg = (i, back) => { const hx = hipX + (i ? 2 : -2), fx = FX + o.foot[i], fy = FY - o.lift[i], kx = (hx + fx) / 2 + o.knee[i], ky = (hipY + fy) / 2 - (o.thigh || 0);
    limb(g, hx, hipY, kx, ky, 5, 4, back ? C.D : C.S); limb(g, kx, ky, fx, fy - 2, 4, 3.4, back ? C.D : C.S);
    circle(g, kx, ky, 2, back ? C.S : C.s); rect(g, fx - 1, fy - 3, 6, 3, C.K); px(g, fx + 4, fy - 2, C.D); };
  leg(0, true); leg(1, false);
  // ---- the lance behind the torso: the shaft first
  const hx = shX + o.hand[0], hy = shY + o.hand[1] + 2, ang = rad(o.ang), dx = Math.cos(ang), dy = Math.sin(ang);
  const drawLance = () => { if (o.len <= 0) return; const tx = hx + dx * o.len, ty = hy + dy * o.len, bx = hx - dx * 9, by = hy - dy * 9, nx = -dy, ny = dx;
    line(g, bx, by, tx, ty, C.W); line(g, bx + nx * 0.6, by + ny * 0.6, tx + nx * 0.6, ty + ny * 0.6, C.w);
    fillPoly(g, [[tx + dx * 7, ty + dy * 7], [tx + nx * 2.2, ty + ny * 2.2], [tx - nx * 2.2, ty - ny * 2.2]], C.f); fillPoly(g, [[tx + dx * 7, ty + dy * 7], [tx, ty], [tx - nx * 2.2, ty - ny * 2.2]], C.S);   /* the head: a long leaf of steel */
    circle(g, hx + dx * 3, hy + dy * 3, 2.3, C.g); circle(g, hx + dx * 3, hy + dy * 3, 1.4, C.G);                                                                           /* the vamplate at the hand */
    if (o.banner) { const sx = tx - dx * 6, sy = ty - dy * 6, kk = o.banner, flyx = -Math.max(0.5, dx * 0.6 + 0.8) * 12 * kk, flyy = (3 + Math.sin(fl + 1) * 2) * kk + (dy < -0.6 ? 2 : 0), q = 3 * kk;
      fillPoly(g, [[sx, sy], [sx - dx * 7, sy - dy * 7], [sx - dx * 7 + flyx, sy - dy * 7 + flyy + q * 0.4], [sx + flyx * 0.78, sy + flyy * 0.78 + 0.5 - q * 0.2], [sx + flyx, sy + flyy - q * 0.8]], C.p);
      line(g, sx, sy, sx + flyx, sy + flyy - q * 0.8, C.G); line(g, sx - dx * 7, sy - dy * 7, sx - dx * 7 + flyx, sy - dy * 7 + flyy + q * 0.4, C.R); px(g, sx + flyx * 0.4, sy + flyy * 0.4 + 1, C.G); } };
  if (o.pole) drawLance();
  // ---- the body: breastplate, the tabard over the belt, gold girdle, the pauldron
  fillPoly(g, [[shX - 5, shY - 1], [shX + 5, shY - 1], [hipX + 4, hipY], [hipX - 4, hipY]], C.S);
  fillPoly(g, [[shX + 0.5, shY], [shX + 5, shY], [hipX + 4, hipY - 3], [hipX + 1, hipY - 3]], C.s);
  line(g, shX - 4, shY + 1, hipX - 3, hipY - 2, C.D);
  fillPoly(g, [[hipX - 4, hipY - 3], [hipX + 5, hipY - 3], [hipX + 5, hipY + 4], [hipX + 1, hipY + 7], [hipX - 4, hipY + 4]], C.p); rect(g, hipX, hipY - 2, 1, 9 - 1, C.G); rect(g, hipX - 4, hipY - 3, 10, 1, C.G);
  px(g, hipX - 3, hipY + 4, C.P); px(g, hipX + 4, hipY + 3, C.P);
  circle(g, shX + 1, shY + 1.2, 3.6, C.S); circle(g, shX + 1.4, shY + 0.6, 2.6, C.s); px(g, shX + 4, shY - 1, C.f); px(g, shX + 3, shY - 2, C.G);
  rect(g, shX - 1, shY - 3, 5, 3, C.D);   /* the gorget */
  // ---- the head: a closed great helm, one amber slit, a gold crest and a red plume streaming back
  const pl = o.plume;
  if (pl) { const sway = Math.sin(fl * 1.3); for (let k = 0; k < 11; k++) { const x = hdX - 1 - k * 0.95 * pl, y = hdY - 4 + k * 0.45 + Math.sin(k * 0.6 + fl) * 0.9 + (k > 6 ? 1 : 0) + sway * 0.3, th = k < 7 ? 3 : 2; rect(g, x, y, 2, th, k % 3 === 2 ? C.R : C.r); }
    for (let k = 0; k < 8; k++) px(g, hdX - 2 - k * 0.9 * pl, hdY - 3 + k * 0.45 + Math.sin(k * 0.6 + fl) * 0.9, C.p); }
  fillPoly(g, [[hdX - 3.5, hdY - 4], [hdX + 3.5, hdY - 4], [hdX + 4.5, hdY - 1], [hdX + 4, hdY + 4], [hdX + 1, hdY + 5.5], [hdX - 3, hdY + 5.5], [hdX - 4, hdY]], C.S);
  fillPoly(g, [[hdX + 0.5, hdY - 4], [hdX + 3.5, hdY - 4], [hdX + 4.5, hdY - 1], [hdX + 4, hdY + 3], [hdX + 1, hdY + 3]], C.s);
  rect(g, hdX - 1, hdY - 6, 5, 2, C.G); px(g, hdX + 1, hdY - 7, C.G);   /* the crest */
  rect(g, hdX + 1.5, hdY - 0.5, 4, 1, C.e); px(g, hdX + 2, hdY + 2, C.D); px(g, hdX + 3, hdY + 3, C.D); px(g, hdX + 4, hdY + 2, C.D); rect(g, hdX - 3, hdY + 2, 2, 1, C.D);
  // ---- the sword arm: shoulder to the hand on the lance
  const exx = (shX + 2 + hx) / 2, eyy = (shY + 2 + hy) / 2 + (o.hand[1] < -6 ? 1 : 3);
  limb(g, shX + 2, shY + 2, exx, eyy, 4, 3.4, C.S); limb(g, exx, eyy, hx, hy, 3.4, 3, C.D); circle(g, hx, hy, 1.9, C.K);
  if (!o.pole) { /* the lance is the front of him when it points toward us: drawn over the arm */ }
  // ---- the tower shield on the near arm
  const sx = shX + o.sh[0], sy = shY + o.sh[1] + 5, k = o.shS, hw = 4.8 * k, hh = 10 * k;
  if (o.shield !== false) { limb(g, shX, shY + 2, sx - hw * 0.4, sy - 1, 4, 3.4, C.S);
    fillPoly(g, [[sx - hw - 1, sy - hh - 1], [sx + hw + 1, sy - hh - 1], [sx + hw + 1, sy + hh * 0.3], [sx, sy + hh + 1.5], [sx - hw - 1, sy + hh * 0.3]], C.K);
    fillPoly(g, [[sx - hw, sy - hh], [sx + hw, sy - hh], [sx + hw, sy + hh * 0.3], [sx, sy + hh], [sx - hw, sy + hh * 0.3]], C.p);
    fillPoly(g, [[sx - hw, sy - hh], [sx, sy - hh], [sx, sy + hh], [sx - hw, sy + hh * 0.3]], C.P);
    line(g, sx - hw, sy - hh, sx + hw, sy - hh, C.s); line(g, sx + hw, sy - hh, sx + hw, sy + hh * 0.3, C.S);
    line(g, sx - hw + 1, sy - hh * 0.2, sx, sy + hh * 0.15, C.G); line(g, sx, sy + hh * 0.15, sx + hw - 1, sy - hh * 0.2, C.G);   /* the gold chevron */
    circle(g, sx, sy - hh * 0.45, 1.6 * k, C.G); px(g, sx, sy - hh * 0.45, C.f);
    circle(g, sx + hw * 0.6, sy - hh * 0.2, 1.4, C.K); }
  return c;
}

/* THE POSES. Index = frame. Numbers: lean (torso forward), crouch (hips down), foot x offsets (back, front), lift, knee bend, hand (from the shoulder), ang (the lance: 0 forward,
   -90 straight up, 90 down), len, sh (the shield from the shoulder). seat: the champion in the saddle (legs astride, nothing under him). */
const SEAT = { crouch: 2, foot: [-2, 6], knee: [4, 6], lift: [0, 1], hipDx: 0 };
const POSES = [
  /* 0 GUARD: the lance at the ready, the shield square */            { hand: [9, -4], ang: -26 },
  /* 1 STRIDE A */                                                    { foot: [-8, 6], lift: [0, 2], knee: [1, 4], hand: [9, -4], ang: -26, lean: 1, flut: 0.6 },
  /* 2 STRIDE B */                                                    { foot: [-4, 8], lift: [2, 0], knee: [0, 3], hand: [9, -3], ang: -24, lean: 1, flut: 1.8 },
  /* 3 RIDE */                                                        { ...SEAT, hand: [6, -8], ang: -84, sh: [6, 6], flut: 0.5 },
  /* 4 RIDE, bobbing */                                               { ...SEAT, crouch: 3, hand: [6, -8], ang: -82, sh: [6, 7], flut: 1.7 },
  /* 5 HE LEVELS IT (couch): the lance comes down level, he leans in */ { ...SEAT, lean: 3, hand: [11, 1], ang: -4, len: 46, sh: [3, 5], flut: 0.2 },
  /* 6 CHARGE A */                                                    { ...SEAT, crouch: 4, lean: 7, hand: [12, 3], ang: 2, len: 48, sh: [3, 6], flut: 2.2, banner: 1.25, plume: 1.5 },
  /* 7 CHARGE B */                                                    { ...SEAT, crouch: 3, lean: 6, hand: [12, 2], ang: -1, len: 48, sh: [3, 5], flut: 3.6, banner: 1.25, plume: 1.5 },
  /* 8 THE WHEEL: hauled round, lance hand up */                      { ...SEAT, lean: -4, hand: [4, -10], ang: -62, sh: [8, 2], head: [-1, 0], flut: 1.2 },
  /* 9 THE REAR: thrown back with the horse */                        { ...SEAT, lean: -7, hand: [2, -9], ang: -74, sh: [8, 1], head: [-2, 0], flut: 2.4 },
  /* 10 THRUST, TOLD: the lance drawn right back */                   { foot: [-7, 5], crouch: 2, lean: -3, hand: [-3, 1], ang: -6, len: 38, sh: [7, 5] },
  /* 11 THRUST: all of him behind the point */                        { foot: [-8, 9], knee: [0, 5], crouch: 3, lean: 5, hand: [15, 1], ang: 0, len: 38, sh: [4, 5], flut: 0.4 },
  /* 12 SWEEP, TOLD: the lance up and behind */                       { foot: [-6, 6], lean: -2, hand: [0, -12], ang: -150, len: 36, sh: [6, 5] },
  /* 13 SWEEP: low, across the boards */                              { foot: [-9, 8], knee: [0, 5], crouch: 5, lean: 4, hand: [11, 11], ang: 9, len: 40, sh: [3, 3] },
  /* 14 BASH, TOLD: the shield hauled back */                         { foot: [-6, 6], lean: -3, crouch: 1, hand: [7, -3], ang: -42, len: 32, sh: [-3, 4] },
  /* 15 BASH: the whole shield thrown forward */                      { foot: [-6, 9], knee: [0, 5], crouch: 2, lean: 5, hand: [4, -4], ang: -50, len: 30, sh: [13, 4], shS: 1.1 },
  /* 16 VAULT, TOLD: the point into the boards */                     { foot: [-6, 6], crouch: 5, lean: 3, hand: [9, 5], ang: 66, len: 34, sh: [3, 4], banner: 0.7 },
  /* 17 VAULT UP: over the shaft, legs tucked */                      { air: 12, foot: [-3, 4], lift: [7, 9], knee: [4, 5], lean: 2, hand: [6, 2], ang: 80, len: 44, sh: [-4, 6], banner: 0.6 },
  /* 18 PERCH: crouched on the lookout, the lance planted */          { foot: [-6, 7], crouch: 6, lean: 3, hand: [9, 5], ang: 62, len: 28, sh: [3, 5], flut: 1 },
  /* 19 STAB: coming down point-first */                              { air: 8, foot: [-8, -3], lift: [6, 10], knee: [-3, 0], lean: 5, hand: [8, 6], ang: 78, len: 40, sh: [-3, 2], banner: 0.6 },
  /* 20 SPEARS, TOLD: a spear cocked over the shoulder */             { foot: [-6, 6], lean: -3, hand: [-2, -9], ang: -14, len: 24, banner: 0, sh: [6, 6] },
  /* 21 SPEARS: the arm thrown up, the hand open */                   { foot: [-6, 8], lean: 4, hand: [10, -17], ang: -60, len: 0, banner: 0, sh: [6, 5] },
  /* 22 THE PENNANT, TOLD: the lance straight up, the cloth streaming */ { hand: [6, -10], ang: -90, len: 42, banner: 1.7, flut: 1.4, lean: -1, plume: 1.4 },
  /* 23 PLANTED: the point stuck in the boards, he is bent over it */ { foot: [-5, 8], crouch: 6, lean: 6, hand: [11, 7], ang: 58, len: 28, sh: [5, 7], head: [1, 1], flut: 0.3 },
  /* 24 THE WALL, TOLD: the shield swung down onto the boards */     { foot: [-6, 6], crouch: 3, lean: 2, hand: [8, -2], ang: -20, len: 34, sh: [9, 9], shS: 1.3 },
  /* 25 THE WALL: crouched behind it, edging forward */              { foot: [-8, 7], crouch: 5, lean: 4, hand: [8, 0], ang: -4, len: 34, sh: [10, 8], shS: 1.4 },
  /* 26 THE WALL TURNED / STUMBLE: the shield swung wide, his back bare */ { foot: [-7, 5], lean: -5, crouch: 1, hand: [5, -9], ang: -68, len: 34, sh: [-7, 4], shS: 0.9, head: [-1, 0], flut: 2.5 },
  /* 27 THROWN: out of the saddle */                                  { air: 14, foot: [-10, 3], lift: [5, 9], knee: [-3, 2], lean: -8, hand: [-5, -10], ang: -150, len: 34, sh: [-8, -2], head: [-1, 0], flut: 2 },
  /* 28 RISE: a hand on the shaft, hauling up */                      { foot: [-6, 7], crouch: 6, lean: 3, hand: [7, 7], ang: 78, len: 30, sh: [4, 7], head: [0, 1] },
  /* 29 PENNANT, RIDING */                                            { ...SEAT, hand: [6, -10], ang: -90, len: 42, banner: 1.7, flut: 1.4, lean: -1, plume: 1.4 },
  /* 30 SPEARS TOLD, RIDING */                                        { ...SEAT, lean: -3, hand: [-2, -9], ang: -14, len: 24, banner: 0, sh: [6, 6] },
  /* 31 SPEARS, RIDING */                                             { ...SEAT, lean: 3, hand: [10, -17], ang: -60, len: 0, banner: 0, sh: [6, 5] },
  /* 32 HURT, RIDING */                                               { ...SEAT, lean: -6, hand: [3, 4], ang: -30, len: 30, sh: [8, 3], head: [-2, -1], flut: 3 },
  /* 33 HURT (LAST: HAS_HURT reads the last frame) */                 { foot: [-7, 6], crouch: 1, lean: -6, hand: [4, 5], ang: -32, len: 30, sh: [8, 6], head: [-2, -1], flut: 3 },
];
export const F = { guard: 0, walkA: 1, walkB: 2, ride: 3, rideB: 4, couch: 5, chargeA: 6, chargeB: 7, wheel: 8, rear: 9, thrustTell: 10, thrust: 11, sweepTell: 12, sweep: 13, bashTell: 14, bash: 15,
  vaultTell: 16, vaultUp: 17, perch: 18, stab: 19, volleyTell: 20, volley: 21, pennantTell: 22, planted: 23, wallTell: 24, shieldwall: 25, turned: 26, thrown: 27, rise: 28,
  pennantRide: 29, volleyTellRide: 30, volleyRide: 31, hurtRide: 32, hurt: 33 };
export const bakeChampion = () => { const fr = POSES.map(p => outline(champion(p), OUT)); const white = fr.map(c => whiten(c));
  return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: FX, ay: FY + 1, w: 28, h: 40 }; };

/* HIS POSE FOR HIS MODE: every move of updateLance has its own (the mounted ones are the seated variants) */
export function frameOf(e) {
  const mv = Math.abs(e.vx) > 6, m = e.mode, ride = !!e.mounted;
  switch (m) {
    case 'couch': return F.couch;
    case 'charge': return Math.floor(e.anim * 12) % 2 ? F.chargeB : F.chargeA;
    case 'wheel': return F.wheel;
    case 'rearTell': case 'rear': return F.rear;
    case 'volleyTell': return ride ? F.volleyTellRide : F.volleyTell;
    case 'volley': return ride ? F.volleyRide : F.volley;
    case 'pennantTell': return ride ? F.pennantRide : F.pennantTell;
    case 'thrown': return F.thrown;
    case 'rise': return F.rise;
    case 'thrustTell': return F.thrustTell;
    case 'thrust': return F.thrust;
    case 'sweepTell': return F.sweepTell;
    case 'sweep': return F.sweep;
    case 'bashTell': return F.bashTell;
    case 'bash': return F.bash;
    case 'vaultTell': return F.vaultTell;
    case 'vaultUp': return F.vaultUp;
    case 'perch': return F.perch;
    case 'stab': return F.stab;
    case 'planted': return F.planted;
    case 'wallTell': return F.wallTell;
    case 'shieldwall': return F.shieldwall;
    case 'wallTurned': case 'stumble': return F.turned;
    case 'reel': return ride ? F.wheel : F.turned;
    case 'recover': return ride ? F.ride : F.thrust;
  }
  if (ride) return mv ? (Math.floor(e.anim * 9) % 2 ? F.rideB : F.ride) : F.ride;
  if (m === 'fallback' || mv) return Math.floor(e.anim * 8) % 2 ? F.walkA : F.walkB;
  return F.guard;
}

// ---------------------------------------------------------------------------------------------------------------- THE CHARGER
const HW = 78, HH = 58, HX = 36, HY = 55;   /* the sheet and the hooves */
function charger(o0) {
  const [c, g] = canvas(HW, HH);
  const o = { rot: 0, fore: [[46, 55], [42, 55]], hind: [[26, 55], [22, 55]], neck: 0, flut: 0, ...o0 };
  const pv = [o.pivot ? o.pivot[0] : HX, o.pivot ? o.pivot[1] : HY], ca = Math.cos(o.rot), sa = Math.sin(o.rot);
  const R = (x, y) => { const dx = x - pv[0], dy = y - pv[1]; return [pv[0] + dx * ca - dy * sa, pv[1] + dx * sa + dy * ca]; };
  const Lm = (x0, y0, x1, y1, w0, w1, col) => { const a = R(x0, y0), b = R(x1, y1); limb(g, a[0], a[1], b[0], b[1], w0, w1, col); };
  const Pg = (pts, col) => fillPoly(g, pts.map(p => R(p[0], p[1])), col);
  const Ln = (x0, y0, x1, y1, col) => { const a = R(x0, y0), b = R(x1, y1); line(g, a[0], a[1], b[0], b[1], col); };
  const Cx = (x, y, r, col) => { const a = R(x, y); circle(g, a[0], a[1], r, col); };
  const Px = (x, y, col) => { const a = R(x, y); px(g, a[0], a[1], col); };
  // the legs: dark bay, steel on the knees and a white sock; the far pair first
  const legs = (pairs, sx, back) => pairs.forEach(([fx, fy], i) => { const hx = sx - (i ? 2 : 0), hy = 36, kx = (hx + fx) / 2 + (sx > 30 ? 2 : -2), ky = (hy + fy) / 2 + 1, far = i === 1; const col = far ? C.H : C.h;
    Lm(hx, hy, kx, ky, 5, 3.5, col); Lm(kx, ky, fx, fy - 2, 3.4, 3, col); Cx(kx, ky, 1.5, far ? C.D : C.S); Lm(fx, fy - 5, fx, fy - 3, 3.4, 3.4, far ? C.D : C.S); rect(g, ...R(fx - 2, fy - 2).map(Math.round), 4, 2, C.K); });
  legs(o.hind, 24, true); legs(o.fore, 46, false);
  // the tail: the Queen's black, streaming back
  { const t = Math.sin(o.flut) * 2; Lm(21, 30, 13, 33 + t, 4, 3, C.H); Lm(13, 33 + t, 9, 42 + t, 3, 2, C.H); Px(9, 43 + t, C.P); }
  // the barrel and the caparison to the knees
  const bar = []; for (let a = 0; a < 360; a += 20) bar.push([34 + Math.cos(rad(a)) * 15.5, 31 + Math.sin(rad(a)) * 7.5]); Pg(bar, C.h);
  Pg([[21, 28], [46, 28], [47, 38], [43, 43], [39, 39], [35, 44], [31, 39], [27, 43], [23, 39]], C.P);
  Pg([[21, 28], [46, 28], [46, 31], [21, 31]], C.p); Ln(22, 33, 46, 33, C.G); Ln(24, 40, 45, 40, C.g);
  for (const x of [26, 31, 36, 41]) Px(x, 42, C.G);   /* the scalloped hem, gilt */
  Ln(30, 34, 35, 38, C.G); Ln(35, 38, 40, 34, C.G); Px(35, 33, C.f);   /* the Queen's chevron */
  Pg([[21, 25], [26, 25], [27, 29], [21, 29]], C.D); Ln(21, 25, 26, 25, C.s);   /* the crupper */
  // the neck, with its crinet of steel plates; the head under a chanfron
  const nk = o.neck; const nx = 53 + nk, ny = 20 - nk;
  Lm(43, 31, nx, ny, 10, 7, C.h); Lm(44, 28, nx - 1, ny - 4, 3, 3, C.D);
  for (let k = 0; k < 4; k++) { const t = k / 3, x = 44 + (nx - 44) * t, y = 28 + (ny - 28 - 3) * t; Pg([[x - 2, y - 1], [x + 2, y - 3], [x + 3, y], [x - 1, y + 2]], k % 2 ? C.S : C.s); }
  Pg([[40, 30], [48, 28], [51, 35], [47, 42], [43, 40]], C.S); Pg([[41, 31], [47, 30], [49, 35], [46, 40]], C.s); Ln(43, 41, 48, 36, C.G); Ln(42, 32, 47, 31, C.G);   /* the peytral over the chest */
  const hd = [nx + 2, ny + 4]; Lm(nx, ny, hd[0] + 6, hd[1] + 5, 7, 5, C.h);
  Pg([[nx + 1, ny - 2], [nx + 5, ny - 1], [nx + 10, ny + 8], [nx + 9, ny + 11], [nx + 5, ny + 8]], C.S); Ln(nx + 2, ny - 1, nx + 9, ny + 9, C.s);   /* the chanfron */
  Ln(nx + 3, ny - 2, nx + 4, ny - 7, C.f); Px(nx + 4, ny - 8, C.f);   /* its spike */
  Px(nx + 5, ny + 2, C.e); Px(nx + 6, ny + 3, C.r); Pg([[nx - 2, ny - 3], [nx, ny - 8], [nx + 1, ny - 3]], C.h);
  const sway = Math.sin(o.flut * 1.2); for (let k = 0; k < 7; k++) { Cx(nx - 3 - k * 1.1, ny - 3 + k * 0.6 + sway * 0.4, 1.2, k % 2 ? C.R : C.r); }   /* the plume on its poll: the champion's red */
  return c;
}
const GAL = { A: { fore: [[56, 48], [51, 52]], hind: [[14, 48], [19, 52]], rot: -0.05 }, B: { fore: [[42, 46], [46, 43]], hind: [[28, 46], [31, 43]], rot: 0.04 } };
const CHF = [
  { },                                                                                                    /* 0 STAND */
  { ...GAL.A, flut: 0.4, neck: 2 },                                                                        /* 1 GALLOP: reaching */
  { ...GAL.B, flut: 1.9, neck: 1 },                                                                        /* 2 GALLOP: gathered */
  { rot: -0.7, pivot: [24, 52], fore: [[56, 24], [60, 30]], hind: [[26, 55], [20, 55]], neck: 2, flut: 1 },   /* 3 THE REAR: up on the hocks, the forehooves pawing */
  { rot: 0.18, pivot: [24, 52], fore: [[58, 46], [53, 50]], hind: [[22, 55], [12, 55]], neck: 4, flut: 0.6 },   /* 4 THE WHEEL: haunches down, skidding round, head up */
  { fore: [[50, 53], [41, 55]], hind: [[22, 55], [28, 52]], flut: 0.2 },                                    /* 5 WALK */
];
export const CF = { stand: 0, gallopA: 1, gallopB: 2, rear: 3, wheel: 4, walk: 5 };
export const bakeCharger = () => { const fr = CHF.map(p => outline(charger(p), OUT)); const white = fr.map(c => whiten(c));
  return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: HX, ay: HY + 1, w: 30, h: 30 }; };
export function chargerFrame(e) {
  const m = e.mode; if (m === 'charge') return Math.floor(e.anim * 12) % 2 ? CF.gallopB : CF.gallopA;
  if (m === 'rearTell' || m === 'rear') return CF.rear; if (m === 'wheel') return CF.wheel; if (m === 'couch') return CF.stand;
  return Math.abs(e.vx) > 30 ? (Math.floor(e.anim * 7) % 2 ? CF.walk : CF.stand) : CF.stand;
}
