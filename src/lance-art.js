// src/lance-art.js - THE QUEEN'S LANCE, drawn (claude/stormhold3art; the rework's art list in scratch/lane-reports/stormhold3.md; B16: every move has its
// own windup and release pose). Art only: nothing here is read by the fight (updateLance in src/main.js) except frameOf(), which turns his mode into a pose.
//   THE QUEEN'S CHAMPION   plate (cold steel gone grey with the siege), a PLUMED HELM (red plume over a gold crest, one amber slit), the Queen's purple
//                          tabard and cloak with the gold chevron, a TOWER SHIELD in the same, and a LANCE WITH A SWALLOW-TAILED PENNANT (purple, gold edge).
//   (claude/lance4) ON FOOT: the barded charger and the seated poses are gone (Daniel 10-29: cut the horse). P3 bakes the same poses shieldless.
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
    line(g, bx - nx * 0.7, by - ny * 0.7, tx - nx * 0.7, ty - ny * 0.7, C.W); line(g, bx, by, tx, ty, C.W); line(g, bx + nx * 0.7, by + ny * 0.7, tx + nx * 0.7, ty + ny * 0.7, C.w);   /* (claude/lance4) a THICK shaft (brief s1: 3 px, not a 1 px line) */
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
  if (o.two) { const ox = hx - dx * 8, oy = hy - dy * 8; limb(g, shX - 1, shY + 2, (shX - 1 + ox) / 2, (shY + 2 + oy) / 2 + 2, 4, 3.4, C.D); limb(g, (shX - 1 + ox) / 2, (shY + 2 + oy) / 2 + 2, ox, oy, 3.4, 3, C.D); circle(g, ox, oy, 1.9, C.K); }   /* (claude/lance4) SHIELDLESS: the off hand on the shaft, two-handed */
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

/* THE POSES (claude/lance4: ON FOOT - the seated set and the charger are gone; scratch/brief-lance4-1029.md s2). Index = frame. Numbers: lean
   (torso forward), crouch (hips down), foot x offsets (back, front), lift, knee bend, hand (from the shoulder), ang (the lance: 0 forward, -90
   straight up, 90 down), len, sh (the shield from the shoulder), two (the off hand on the shaft too: shieldless). Every attack is its own
   SILHOUETTE family: the thrust a horizontal line at the chest, the sweep a big arc then flat at the ankles, the charge a low wedge, the vault
   a tall pole, the wall a door with feet, the volley an arm straight up, the pennant a vertical lance with its cloth huge. Each tell has its
   ANTICIPATION frame (a lerp in from the guard), each blow its release and FOLLOW-THROUGH, each opening a held loop of two. The art lane
   (LANCE 4 ART) redraws the whole set at 1:1; these are the greybox poses it starts from. */
const lerp = (p, q, t) => { const o = { ...p, ...q }; for (const k of Object.keys(o)) { const a = p[k], b = q[k];
  if (Array.isArray(a) && Array.isArray(b)) o[k] = a.map((v, i) => v + (b[i] - v) * t); else if (typeof a === 'number' && typeof b === 'number') o[k] = a + (b - a) * t; else o[k] = t < 0.5 && a !== undefined ? a : b; } return o; };
const GUARD = { hand: [9, -4], ang: -26 };
const BASE = {
  guard: GUARD,
  breath: { ...GUARD, crouch: 1, hand: [9, -3], flut: 0.8 },
  walkA: { foot: [-8, 6], lift: [0, 2], knee: [1, 4], hand: [9, -4], ang: -26, lean: 1, flut: 0.6 },
  walkB: { foot: [-6, 7], lift: [1, 0], knee: [0, 3], hand: [9, -4], ang: -25, lean: 1, flut: 1.2, crouch: 1 },
  walkC: { foot: [-4, 8], lift: [2, 0], knee: [0, 3], hand: [9, -3], ang: -24, lean: 1, flut: 1.8 },
  walkD: { foot: [-6, 6], lift: [0, 1], knee: [1, 3], hand: [9, -3], ang: -25, lean: 1, flut: 2.4, crouch: 1 },
  /* THE THRUST (LIGHT): drawn back, the rear foot braced; all of him behind the point (the shaft drawn long: its smear); over his front foot */
  thrustTell0: lerp(GUARD, { foot: [-7, 5], crouch: 2, lean: -3, hand: [-3, 1], ang: -6, len: 38, sh: [7, 5] }, 0.5),
  thrustTell: { foot: [-7, 5], crouch: 2, lean: -3, hand: [-3, 1], ang: -6, len: 38, sh: [7, 5] },
  thrust: { foot: [-8, 9], knee: [0, 5], crouch: 3, lean: 5, hand: [15, 1], ang: 0, len: 44, sh: [4, 5], flut: 0.4 },
  thrustRec: { foot: [-8, 10], knee: [0, 6], crouch: 4, lean: 6, hand: [14, 3], ang: 4, len: 38, sh: [4, 6], flut: 0.9, head: [1, 1] },
  /* THE LOW SWEEP (MEDIUM): swung high behind, coiled; the arc; flat at the ankles */
  sweepTell0: lerp(GUARD, { foot: [-6, 6], lean: -2, hand: [0, -12], ang: -150, len: 36, sh: [6, 5] }, 0.5),
  sweepTell: { foot: [-6, 6], lean: -3, crouch: 1, hand: [-1, -12], ang: -155, len: 36, sh: [6, 5], flut: 0.6 },
  sweepArc: { foot: [-8, 7], knee: [0, 4], crouch: 3, lean: 2, hand: [9, -2], ang: -60, len: 40, sh: [4, 4], flut: 1.5, banner: 1.2 },
  sweep: { foot: [-9, 8], knee: [0, 5], crouch: 5, lean: 4, hand: [11, 11], ang: 9, len: 40, sh: [3, 3] },
  sweepRec: { foot: [-9, 9], knee: [0, 5], crouch: 4, lean: 3, hand: [10, 10], ang: 24, len: 38, sh: [4, 4], flut: 2 },
  /* THE LANCE CHARGE (HEAVY): the shield up, the lance couched under the arm, a foot scraping; a low wedge pointing forward; the skid; OVERRUN, the tip in the boards */
  couchA: { foot: [-7, 6], crouch: 3, lean: 3, hand: [11, 1], ang: -2, len: 44, sh: [7, 2], shS: 1.1, flut: 0.2 },
  couchB: { foot: [-9, 6], lift: [2, 0], crouch: 3, lean: 4, hand: [11, 1], ang: -2, len: 44, sh: [7, 2], shS: 1.1, flut: 0.9 },
  chargeA: { foot: [-10, 8], lift: [3, 0], knee: [2, 5], crouch: 4, lean: 7, hand: [12, 3], ang: 2, len: 46, sh: [8, 3], flut: 2.2, banner: 1.25, plume: 1.5 },
  chargeB: { foot: [-4, 10], lift: [0, 3], knee: [4, 2], crouch: 5, lean: 8, hand: [12, 3], ang: 1, len: 46, sh: [8, 3], flut: 3.0, banner: 1.25, plume: 1.5 },
  chargeC: { foot: [-8, 4], lift: [2, 2], knee: [3, 4], crouch: 3, lean: 7, hand: [12, 2], ang: 2, len: 46, sh: [8, 3], flut: 3.8, banner: 1.25, plume: 1.5 },
  skid: { foot: [-10, 11], knee: [-2, 6], crouch: 5, lean: -2, hand: [12, 4], ang: 8, len: 44, sh: [7, 4], flut: 1.4, plume: 1.3 },
  overrun: { foot: [-7, 11], knee: [-1, 7], crouch: 6, lean: 7, hand: [13, 9], ang: 42, len: 40, sh: [4, 6], head: [1, 2], flut: 0.5 },
  overrunB: { foot: [-7, 11], knee: [-1, 7], crouch: 7, lean: 5, hand: [11, 9], ang: 44, len: 40, sh: [4, 7], head: [1, 2], flut: 1.0 },
  /* THE LANCE VAULT (HEAVY, P2): the point into the boards, a deep crouch; the pole arc; perched; the stab; planted, tugging at it */
  vaultTell: { foot: [-6, 6], crouch: 6, lean: 3, hand: [9, 5], ang: 66, len: 34, sh: [3, 4], banner: 0.7 },
  vaultUp: { air: 12, foot: [-3, 4], lift: [7, 9], knee: [4, 5], lean: 2, hand: [6, 2], ang: 80, len: 44, sh: [-4, 6], banner: 0.6 },
  perch: { foot: [-6, 7], crouch: 6, lean: 3, hand: [9, 5], ang: 62, len: 28, sh: [3, 5], flut: 1 },
  stab: { air: 8, foot: [-8, -3], lift: [6, 10], knee: [-3, 0], lean: 5, hand: [8, 6], ang: 78, len: 40, sh: [-3, 2], banner: 0.6 },
  planted: { foot: [-5, 8], crouch: 6, lean: 6, hand: [11, 7], ang: 58, len: 28, sh: [5, 7], head: [1, 1], flut: 0.3 },
  plantedB: { foot: [-7, 8], crouch: 5, lean: 2, hand: [9, 6], ang: 62, len: 28, sh: [6, 6], head: [0, 1], flut: 0.9 },
  /* THE SHIELD WALL (MEDIUM, P2): slammed down on the boards; crouched behind it, edging; TURNED, flung wide and his back bare */
  wallTell: { foot: [-6, 6], crouch: 3, lean: 2, hand: [8, -2], ang: -20, len: 34, sh: [9, 9], shS: 1.3 },
  shieldwall: { foot: [-8, 7], crouch: 5, lean: 4, hand: [8, 0], ang: -4, len: 34, sh: [10, 8], shS: 1.4 },
  shieldwallB: { foot: [-6, 8], lift: [1, 0], crouch: 5, lean: 4, hand: [8, 0], ang: -4, len: 34, sh: [10, 8], shS: 1.4, flut: 1 },
  turned: { foot: [-7, 5], lean: -5, crouch: 1, hand: [5, -9], ang: -68, len: 34, sh: [-7, 4], shS: 0.9, head: [-1, 0], flut: 2.5 },
  /* THE SPEAR VOLLEY (MEDIUM): a spear drawn from the back quiver and cocked; the arm straight up */
  volleyTell: { foot: [-6, 6], lean: -3, hand: [-2, -9], ang: -14, len: 24, banner: 0, sh: [6, 6] },
  volley: { foot: [-6, 8], lean: 4, hand: [10, -17], ang: -60, len: 0, banner: 0, sh: [6, 5] },
  /* THE PENNANT: the lance straight up and the cloth huge (a two-frame wave) */
  pennantTell: { hand: [6, -10], ang: -90, len: 42, banner: 1.7, flut: 1.4, lean: -1, plume: 1.4 },
  pennantB: { hand: [6, -11], ang: -88, len: 42, banner: 1.8, flut: 3.0, lean: -1, plume: 1.4 },
  /* HIS OPENINGS: PINNED under the bars (a struggle, two frames); HELM RUNG (dazed, swaying); WHIPPED (knocked back); the SHIELD SPLIT */
  pinned: { foot: [-6, 7], crouch: 8, lean: 2, hand: [4, -6], ang: -120, len: 30, sh: [4, -2], shS: 0.95, head: [1, 2], flut: 0.4 },
  pinnedB: { foot: [-7, 6], crouch: 7, lean: -1, hand: [3, -8], ang: -110, len: 30, sh: [3, -3], shS: 0.95, head: [0, 2], flut: 1.4 },
  rung: { foot: [-6, 6], crouch: 2, lean: -4, hand: [5, 6], ang: 30, len: 34, sh: [6, 7], head: [-2, 1], flut: 0.6 },
  rungB: { foot: [-5, 7], crouch: 3, lean: 2, hand: [6, 7], ang: 40, len: 34, sh: [7, 8], head: [2, 2], flut: 1.6 },
  whipped: { foot: [-9, 4], lift: [0, 3], crouch: 2, lean: -7, hand: [3, -6], ang: -100, len: 32, sh: [9, 0], head: [-2, -1], flut: 3 },
  split: { foot: [-7, 6], crouch: 2, lean: -3, hand: [6, -4], ang: -40, len: 34, sh: [-10, 3], shS: 0.6, head: [-1, 0], flut: 2.2 },
  wake: { foot: [-5, 7], crouch: 5, lean: 3, hand: [7, 5], ang: 76, len: 34, sh: [4, 6], head: [0, 1], banner: 1.2 },   /* his pennant planted in the boards: he wrenches it up */
  hurt: { foot: [-7, 6], crouch: 1, lean: -6, hand: [4, 5], ang: -32, len: 30, sh: [8, 6], head: [-2, -1], flut: 3 },
};
/* THE SHIELDLESS SET (P3): the same joints with the shield gone and the off hand on the shaft - and his own TWO-HANDED thrust and sweep */
const BARE = { two: true, shield: false };
const BARE_OWN = {
  thrustTell0: { foot: [-7, 5], crouch: 2, lean: -2, hand: [2, 0], ang: -4, len: 40 },
  thrustTell: { foot: [-8, 5], crouch: 3, lean: -4, hand: [-2, 1], ang: -3, len: 40 },
  thrust: { foot: [-9, 10], knee: [0, 5], crouch: 3, lean: 6, hand: [16, 1], ang: 0, len: 46, flut: 0.4 },
  thrustRec: { foot: [-9, 10], knee: [0, 6], crouch: 4, lean: 6, hand: [15, 3], ang: 5, len: 40, flut: 0.9 },
  sweepTell: { foot: [-7, 6], lean: -4, crouch: 2, hand: [-2, -13], ang: -160, len: 38, flut: 0.6 },
  sweepArc: { foot: [-8, 8], knee: [0, 4], crouch: 3, lean: 3, hand: [10, -2], ang: -55, len: 42, flut: 1.5 },
  sweep: { foot: [-10, 9], knee: [0, 5], crouch: 6, lean: 5, hand: [12, 11], ang: 8, len: 42 },
};
const NAMES = Object.keys(BASE).filter(k => k !== 'hurt');
const ORDER = [...NAMES, 'hurt'];                      /* the shielded set: its hurt frame last of its half */
const POSES = [...ORDER.map(k => BASE[k]), ...ORDER.map(k => ({ ...BASE[k], ...(BARE_OWN[k] || {}), ...BARE }))];
export const F = Object.fromEntries(ORDER.map((k, i) => [k, i]));
export const BARE_AT = ORDER.length;                    /* the shieldless frame of any pose: F[name] + BARE_AT */
F.hurt2 = POSES.length - 1;                             /* (HAS_HURT reads the last frame: the shieldless hurt) */
export const SCALE = 1.35;   /* drawn at 1.35 until the art lane's 1:1 sheet lands (brief s1: drawn at 1:1, no runtime scale) */
export const bakeChampion = () => { const fr = POSES.map(p => outline(champion(p), OUT)); const white = fr.map(c => whiten(c));
  return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: FX, ay: FY + 1, w: 28, h: 40 }; };

/* HIS POSE FOR HIS MODE (updateLance keeps e.modeAge, the seconds he has been in it): every move its anticipation, release and follow-through;
   every opening a held two-frame loop; shieldless (e.bare) the same pose from his P3 half */
export function frameOf(e) {
  const mv = Math.abs(e.vx) > 6, m = e.mode, a = e.modeAge || 0, loop = (p, q, hz) => (Math.floor(e.anim * hz) % 2 ? q : p);
  const f = (() => { switch (m) {
    case 'wake': return F.wake;
    case 'couch': return loop(F.couchA, F.couchB, 4);
    case 'charge': return [F.chargeA, F.chargeB, F.chargeC, F.chargeB][Math.floor(e.anim * 12) % 4];
    case 'skid': return F.skid;
    case 'overrun': return a < 0.3 ? F.skid : loop(F.overrun, F.overrunB, 3);
    case 'thrustTell': return a < 0.14 ? F.thrustTell0 : F.thrustTell;
    case 'thrust': return F.thrust;
    case 'thrustRec': case 'recover': return F.thrustRec;
    case 'sweepTell': return a < 0.2 ? F.sweepTell0 : F.sweepTell;
    case 'sweep': return a < 0.1 ? F.sweepArc : F.sweep;
    case 'sweepRec': return F.sweepRec;
    case 'volleyTell': return F.volleyTell;
    case 'volley': return F.volley;
    case 'pennantTell': case 'pennant': case 'haul': return loop(F.pennantTell, F.pennantB, 5);
    case 'vaultTell': return F.vaultTell;
    case 'vaultUp': return F.vaultUp;
    case 'perch': return F.perch;
    case 'stab': return F.stab;
    case 'planted': return loop(F.planted, F.plantedB, 2.5);
    case 'wallTell': return F.wallTell;
    case 'shieldwall': return loop(F.shieldwall, F.shieldwallB, 2);
    case 'wallTurned': case 'stumble': case 'reel': return F.turned;
    case 'pinned': return loop(F.pinned, F.pinnedB, 3);
    case 'rung': return loop(F.rung, F.rungB, 2);
    case 'whipped': return F.whipped;
    case 'split': return F.split;
  }
  if (m === 'fallback' || mv) return [F.walkA, F.walkB, F.walkC, F.walkD][Math.floor(e.anim * 8) % 4];
  return loop(F.guard, F.breath, 1.2); })();
  return e.bare && m !== 'split' ? f + BARE_AT : f;
}
