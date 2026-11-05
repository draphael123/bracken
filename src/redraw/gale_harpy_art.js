// gale_harpy_art.js - THE GALE HARPY'S OWN SHEET (claude/rookery2art; the greybox tinted the crag harpy teal). She is NOT the crag harpy: a different bird, in PROFILE (the crag harpy is
// frontal, wings left and right) - a long lean raptor-woman leaning into the wind, pale storm-teal, the longest wings in the crag with white-tipped primaries, a streaming scarf of
// head plumes and two tail streamers, cream ruff, a hooked yellow beak. Her silhouette is the wind itself: WINGS SWEPT BACK IS HER TELL.
// Same frame contract as every harpy (src/gale-harpy.js galeFrame): 0 hover (wings raised), 1 hover (wings down), 2 THE BEAT (wings thrown forward and down, body leaned back), 3 BROKEN
// (the tumble: wings crumpled, feathers loose, dizzy), 4 THE TELL (wings flung straight back and wide, chest out, beak open, red eyes), 5 HURT. Facing right; flipped for left.
import { canvas, rect as R, line as line0, fillPoly, ellipse, circle, outline, flipX, whiten } from '../px.js';
const OUT = '#1b1626';
const C = { b: '#7ea4b0', B: '#4c6e7e', d: '#2c4654', l: '#b4d0d8', h: '#e8f2f4', ruff: '#f0ece0', ruffD: '#c8c0ac', face: '#ece0cc', faceD: '#bba890', beak: '#f0cc58', beakD: '#a8842c', talon: '#e8dcb0', leg: '#d4bc70', eye: '#ffe27a', red: '#ff4a2a', plume: '#dce8ee', hair: '#1c2e3a', hairL: '#4a6a7c' };
const W = 54, H = 44, AX = 29, AY = 40, OX = 10, OY = 14;   /* (claude/harpyart2: 44x32 -> 54x44, the feet stay at (AX, AY): the woman is taller) */
const px0 = (g, x, y, c) => R(g, x, y, 1, 1, c);   /* the canvas, and her talons' point (the feet) */
const line = (g, a, b, c, d, col, t) => { if ([a, b, c, d].every(Number.isFinite)) line0(g, Math.round(a), Math.round(b), Math.round(c), Math.round(d), col, t); };
function feather(g, x0, y0, a, len, w, col, tip) { const ca = Math.cos(a), sa = Math.sin(a); for (let i = 0; i < len; i++) { const ww = Math.max(1, Math.round(w * (1 - 0.5 * i / len))); R(g, Math.round(x0 + ca * i), Math.round(y0 + sa * i - ww / 2), 1, ww, i >= len - 2 && tip ? tip : col); } }
/* a wing in profile: the ARM (bare, from the shoulder (sx, sy) out along angle a0 to the wrist, len L0), a clawed HAND at the wrist, then n primaries fanned from the wrist over fan rad centred on angle a1, each up to Lp long */
function wing(g, sx, sy, a0, L0, a1, fan, n, Lp, far) {
  L0 *= 1.3; Lp *= 1.4;   /* (claude/harpyart2) the arm-wing is longer than the old bird wing: a woman's arm is the leading edge */
  const wx = sx + Math.cos(a0) * L0, wy = sy + Math.sin(a0) * L0, base = far ? C.B : C.b, light = far ? C.B : C.l, dark = C.d;
  for (let k = 0; k < n; k++) {
    const t = n === 1 ? 0 : k / (n - 1), a = a1 + (t - 0.5) * fan, L = Lp * (0.7 + 0.3 * Math.sin(Math.PI * (0.15 + 0.7 * t)));
    feather(g, wx, wy, a, Math.round(L), 2.6, k % 2 ? base : light, k === n - 1 || k === 0 || k === 3 ? C.h : dark);
  }
  const ex = sx + (wx - sx) * 0.5, ey = sy + (wy - sy) * 0.5;
  line(g, sx, sy, ex, ey, far ? C.faceD : C.face, 2); line(g, ex, ey, wx, wy, base, 3);                                  /* the bare upper arm, the feathered forearm */
  ellipse(g, Math.round(ex), Math.round(ey), 2, 2, far ? C.B : C.b);
  ellipse(g, Math.round(wx), Math.round(wy), 1.8, 1.8, far ? C.faceD : C.face);                                           /* the hand */
  for (const d of [-0.5, 0, 0.5]) { const fx = wx + Math.cos(a0 + d) * 3.2, fy = wy + Math.sin(a0 + d) * 3.2; R(g, Math.round(fx), Math.round(fy), 1, 1, '#1b1626'); }   /* three claw-fingers */
}
/* (claude/harpyart2) THE PROFILE HARPY-WOMAN: a woman in profile, NOT a bird. A big head (radius 4.5: brow, eye, nose, lips, a chin) with long hair streaming back; a neck; bare shoulder; a slender torso in a feather bodice with a sash;
   a feather skirt with the tail streamers; BIRD LEGS and talons below. Her ARM is the wing: a bare arm from the shoulder to the wrist, a clawed HAND there, the flight feathers fanned from it. Pivot = the hip (cx, cy), the tilt leans the whole
   woman (a flying one is nearly horizontal); the legs hang under her when she is upright and trail behind her when she lies along the air. */
function bird(g, o) {
  const tilt = o.tilt || 0, cx = 19, cy = 16 + ((o.cy ?? 14) - 14), ct = Math.cos(tilt), st = Math.sin(tilt);
  const pt = (x, y) => [cx + (x * ct - y * st), cy + (x * st + y * ct)];
  const rp = (x, y) => { const q = pt(x, y); return [Math.round(q[0]), Math.round(q[1])]; };
  const sh = pt(0.5, -9), hip = pt(0, 0), hd = pt(3, -15.5);
  if (o.wing) wing(g, sh[0] - 1, sh[1] + 1, ...o.wing, true);   /* the far arm-wing first, behind her */
  for (const [da, L] of [[0.0, 11], [0.3, 9]]) feather(g, hip[0] - 1, hip[1] + 2, (o.tail ?? 2.05) + da + (tilt > 0.7 ? -tilt * 0.6 : 0), L, 2.4, C.B, C.h);   /* the two long tail streamers */
  /* legs: bird legs under the skirt (hanging when she stands, trailing when she lies along the air), thighs feathered, a hock, three forward toes and a hind claw */
  for (const dx of [-1.8, 1.6]) {
    const t0 = pt(dx, 5.5), trail = tilt > 0.7 || o.carry, L = o.legIn ? 4 : 9;
    const ex = trail ? t0[0] - Math.sin(Math.min(tilt, 1.4)) * L * 0.9 : t0[0] + dx * 0.3, ey = trail ? t0[1] + Math.cos(Math.min(tilt, 1.4)) * L * 0.6 + 2 : Math.max(t0[1] + L, o.legIn ? 0 : t0[1] + L);
    line(g, t0[0], t0[1], ex, ey, C.leg, 2); R(g, Math.round(ex) - 1, Math.round(ey), 4, 1, C.talon); R(g, Math.round(ex) + 2, Math.round(ey) + 1, 1, 1, C.talon); R(g, Math.round(ex) - 1, Math.round(ey) + 1, 1, 1, C.talon); R(g, Math.round(ex) - 2, Math.round(ey) - 1, 1, 1, C.talon);
  }
  /* the feather skirt over the hips: a bell of overlapping feathers, ragged at the hem */
  const sk = [pt(-3.4, -1.5), pt(3.2, -1.5), pt(4.4, 5.5), pt(-4.6, 5.5)]; fillPoly(g, sk, C.b);
  fillPoly(g, [pt(-2, -1.5), pt(2.6, -1.5), pt(3.2, 5), pt(-2.4, 5)], C.l);
  for (let k = -4; k <= 4; k += 2) { const p = rp(k, 5.5); R(g, p[0], p[1], 2, 2, k & 2 ? C.b : C.B); }
  /* the torso: a waist, a bodice of feathers with a cream ruff at the breast, a sash, the bare round of the shoulder */
  const tor = [pt(-2.4, -9.5), pt(3.2, -9.5), pt(3.9, -6.5), pt(2.8, -3), pt(2.1, -1.2), pt(-2.1, -1.2), pt(-2.6, -5)]; fillPoly(g, tor, C.l);
  fillPoly(g, [pt(-2.2, -9), pt(0.6, -9), pt(0.6, -2), pt(-1.6, -2)], C.b);
  const ch = pt(2.6, -7), chs = o.chest ? 1 : 0; ellipse(g, Math.round(ch[0]), Math.round(ch[1]), 2 + chs, 2.6 + chs, C.ruff);
  for (let q = 0; q < 2; q++) { const p = rp(0.6 + q, -5.5 + q * 2); R(g, p[0], p[1], 3, 1, C.ruffD); }
  { const a = rp(-2.2, -1.9), b2 = rp(2.4, -1.9); line(g, a[0], a[1], b2[0], b2[1], C.d, 1); const k = rp(0.5, -1.9); px0(g, k[0], k[1], '#e0b040'); }
  { const n0 = pt(1.2, -10), n1 = pt(2.2, -13.5); line(g, n0[0], n0[1], n1[0], n1[1], C.face, 3); const sd = pt(0.3, -10.3); ellipse(g, Math.round(sd[0]), Math.round(sd[1]), 2.2, 1.6, C.face); R(g, Math.round(n0[0]) - 1, Math.round(n0[1]) - 1, 1, 2, C.faceD); }   /* the neck and the bare shoulder */
  /* the head: HAIR first (a mass behind, then long locks streaming back), then the face over it */
  const hx = Math.round(hd[0]), hy = Math.round(hd[1]);
  ellipse(g, hx - 2, hy + 1, 5.2, 5.6, C.hair); ellipse(g, hx - 2, hy + 1.5, 4.2, 4.8, C.hairL);
  for (const [da, L] of [[-0.45, 11], [-0.2, 13], [0.05, 14], [0.3, 12], [0.55, 10]]) feather(g, hx - 3, hy, Math.PI + da + (o.plume || 0) * 1.6 + (tilt > 0.7 ? -tilt * 0.5 : 0), L, 2.8, da > 0 ? C.hairL : C.hair, C.hairL);   /* long hair streaming back in the wind */
  circle(g, hx, hy, 4.4, C.face); R(g, hx - 4, hy + 1, 3, 3, C.faceD); R(g, hx - 1, hy + 4, 4, 2, C.face);
  ellipse(g, hx - 1, hy - 2.6, 4.9, 2.4, C.hair); R(g, hx - 3, hy - 4, 6, 1, C.hairL); R(g, hx + 1, hy - 3, 3, 1, C.hair);                                   /* the crown of hair and the fringe */
  const ex = hx + 1, ey = hy - 1;
  if (o.hurt) { R(g, ex, ey + 1, 3, 1, '#1b0a0a'); R(g, ex, ey - 1, 3, 1, C.d); }
  else if (o.dizzy) { px0(g, ex, ey, '#1b0a0a'); px0(g, ex + 2, ey, '#1b0a0a'); px0(g, ex + 1, ey - 1, '#1b0a0a'); px0(g, ex + 1, ey + 1, '#1b0a0a'); }
  else { R(g, ex, ey, 3, 2, '#fffaf0'); R(g, ex + 1, ey, 2, 2, o.eye === 'red' ? C.red : C.eye); px0(g, ex + 2, ey, '#1b0a0a'); R(g, ex - 1, ey - 2, 5, 1, C.d); }   /* a wide eye under a brow */
  px0(g, hx + 5, hy + 1, C.faceD); px0(g, hx + 4, hy + 2, C.faceD);                                                                                  /* the nose */
  if (o.beak) { R(g, hx + 2, hy + 3, 3, 3, '#2a0c12'); px0(g, hx + 2, hy + 3, '#fffaf0'); px0(g, hx + 4, hy + 3, '#fffaf0'); R(g, hx + 2, hy + 2, 3, 1, '#d04a58'); R(g, hx + 3, hy + 5, 2, 1, '#e87878'); }   /* the screaming mouth: fangs, a tongue */
  else { R(g, hx + 2, hy + 3, 3, 1, '#c04858'); px0(g, hx + 4, hy + 4, C.faceD); }
  if (o.wing) wing(g, sh[0], sh[1], ...o.wing, false);   /* the near arm-wing, over the shoulder */
}
const FR = [
  /* 0 hover, wings raised in an arch above and behind */ { tilt: 0.32, wing: [-2.35, 8, -2.0, 1.05, 7, 12], plume: 0.1 },
  /* 1 hover, wings swept down */ { tilt: 0.28, wing: [2.55, 7, 2.2, 0.9, 7, 11], tail: 2.15, plume: 0.35 },
  /* 2 THE BEAT: wings thrown forward and down, body leaned back, legs drawn in */ { tilt: -0.22, cy: 13, wing: [0.55, 7, 1.0, 1.0, 7, 14], legIn: true, tail: 1.9, plume: -0.3, beak: true },
  /* 3 BROKEN: tumbling, wings crumpled */ { tilt: 1.3, cy: 15, wing: [-2.9, 5, -2.4, 1.6, 6, 8], dizzy: true, legIn: true, tail: 3.0 },
  /* 4 THE TELL: wings flung straight back and wide, chest out, beak open, red eyes */ { tilt: 0.12, cy: 14, wing: [-2.95, 9, -3.05, 0.95, 8, 15], chest: true, beak: true, eye: 'red', plume: -0.15 },
  /* 5 HURT */ { tilt: -0.1, wing: [-2.2, 7, -1.8, 1.3, 7, 11], hurt: true, beak: true, legIn: true },
];
let SET = null;
export function bakeGaleHarpy() {
  if (SET) return SET;
  const R0 = FR.map((o, i) => {
    const [c, g] = canvas(W, H); g.save(); g.translate(OX, OY); bird(g, o); g.restore();
    if (i === 3) { for (const [x, y] of [[10, 16], [38, 20], [16, 36], [36, 34]]) { R(g, x, y, 3, 1, C.h); R(g, x + 1, y - 1, 1, 1, C.l); } for (const [x, y] of [[23, 12], [30, 11], [26, 15]]) { R(g, x, y, 2, 2, '#ffe9a0'); R(g, x, y, 1, 1, '#fff'); } }   /* loose feathers and the tumble's stars */
    outline(c, OUT); return c;
  });
  const w0 = R0.map(c => whiten(c));
  SET = { R: R0, L: R0.map(flipX), white: { R: w0, L: w0.map(flipX) }, ax: AX, ay: AY, w: 14, h: 9 };
  return SET;
}
export const SHEET = () => { const out = {}, S = bakeGaleHarpy(); S.R.forEach((c, i) => out['gale-harpy-' + i] = c); return out; };

/* (claude/harpyart) THE GUST HARPY'S OWN SHEET: the gale harpy's profile build in STORM-INDIGO (slate-blue wings, white-blue primaries, pale plumes), with HER frames (src/gale-harpy.js gustFrame):
   0/1 hover, 2 THE CLAP (both wings slammed forward and together, the blast leaving her), 3 KNOCKED DOWN (grounded: tilted, wings splayed - main draws 3 for the whole downed spell),
   4 THE TELL (wings flung STRAIGHT UP, chest out, beak open, red eyes), 5 HURT. */
const STORM = { b: '#5a6cb4', B: '#34428a', d: '#1a2250', l: '#9aaee8', h: '#e0e8ff', ruff: '#e8e8f8', ruffD: '#b8bcd8', plume: '#c8d4ff', hair: '#12183e', hairL: '#3a4a9a' };
const FR_GUST = [
  { tilt: 0.3, wing: [-2.3, 8, -1.95, 1.05, 7, 12], plume: 0.1 },
  { tilt: 0.26, wing: [2.5, 7, 2.15, 0.9, 7, 11], tail: 2.15, plume: 0.35 },
  { tilt: -0.28, cy: 13, wing: [0.25, 7, 0.55, 0.9, 7, 15], legIn: true, tail: 1.9, plume: -0.4, beak: true },
  { tilt: 1.15, cy: 16, wing: [3.0, 6, 2.7, 1.5, 7, 10], dizzy: true, legIn: true, tail: 3.0 },
  { tilt: 0.05, cy: 14, wing: [-1.65, 9, -1.62, 0.8, 8, 15], chest: true, beak: true, eye: 'red', plume: -0.1 },
  { tilt: -0.1, wing: [-2.2, 7, -1.8, 1.3, 7, 11], hurt: true, beak: true, legIn: true },
];
let GSET = null;
export function bakeGustHarpy() {
  if (GSET) return GSET;
  const keep = { ...C }; Object.assign(C, STORM);
  try {
    const R0 = FR_GUST.map((o, i) => { const [c, g] = canvas(W, H); g.save(); g.translate(OX, OY); bird(g, o); g.restore();
      if (i === 3) { for (const [x, y] of [[10, 17], [38, 21], [16, 37], [36, 35]]) { R(g, x, y, 3, 1, C.h); R(g, x + 1, y - 1, 1, 1, C.l); } }
      if (i === 2) { for (const y of [20, 25, 30]) R(g, 40 + (y % 3), y, 5, 1, C.h); }
      outline(c, OUT); return c; });
    const w0 = R0.map(c => whiten(c)); GSET = { R: R0, L: R0.map(flipX), white: { R: w0, L: w0.map(flipX) }, ax: AX, ay: AY, w: 14, h: 9 };
  } finally { Object.assign(C, keep); }
  return GSET;
}

/* (claude/harpyart) THE CARRIER HARPY (src/carrier-harpy.js): the crag's pale guano-white bird in the gale harpy's profile build, frames 0-5 as every harpy (hover up / down, dive, downed, aim, hurt) plus
   6 SITTING (wings folded down along her back, a worn saddle-cloth over her shoulders: oxblood wool, gold trim, a girth strap, a bright glint) and 7 CARRYING (wings beating level, legs tucked, the
   saddle-cloth streaming, scuffed feathers under a hero's boots). Facing right; flipped for left. */
const CRAGP = { b: '#c4c2d4', B: '#7a7894', d: '#3a384e', l: '#e8e6f2', h: '#ffffff', ruff: '#f4f2f8', ruffD: '#c0bcd0', face: '#e8dccf', faceD: '#b49a8a', beak: '#e6c668', beakD: '#9a7a2c', plume: '#dcdaf0', hair: '#2c2a42', hairL: '#6a6890' };
const FR_CARRIER = [
  FR[0], FR[1], FR[2], FR[3], FR[4], FR[5],
  { tilt: 0.04, cy: 16, wing: [1.75, 5, 1.62, 0.4, 6, 9], plume: 0.2, tail: 2.4, sit: true },
  { tilt: 1.25, cy: 15, wing: [-2.5, 8, -2.35, 0.8, 8, 15], plume: -0.2, tail: 3.0, carry: true },   /* flying: along the air, her back up for the rider */
];
let CSET = null;
export function bakeCarrierHarpy() {
  if (CSET) return CSET;
  const keep = { ...C }; Object.assign(C, CRAGP);
  try {
    const R0 = FR_CARRIER.map(o => { const [c, g] = canvas(W, H); g.save(); g.translate(OX, OY); bird(g, o); g.restore();
      if (o.sit) { const sx = 25, sy = 22;   /* sitting: the saddle-cloth over her shoulders and back, a girth strap round the bodice, a glint */
        R(g, sx, sy, 6, 8, '#7a2a2a'); R(g, sx, sy, 6, 1, '#e0b040'); R(g, sx, sy + 7, 6, 1, '#e0b040'); R(g, sx + 1, sy + 2, 4, 1, '#a04040'); R(g, sx - 1, sy + 4, 10, 1, '#4a3220'); px0(g, sx + 4, sy + 2, '#fff1a0'); R(g, sx - 2, sy + 6, 2, 3, '#7a2a2a'); }
      if (o.carry) { const sx = 30, sy = 24;   /* carrying: flat along her back, the cloth streaming behind her */
        R(g, sx, sy, 8, 4, '#7a2a2a'); R(g, sx, sy, 8, 1, '#e0b040'); R(g, sx + 2, sy + 1, 4, 1, '#a04040'); R(g, sx + 3, sy + 4, 1, 3, '#4a3220'); px0(g, sx + 5, sy + 1, '#fff1a0');
        for (let k = 0; k < 4; k++) R(g, sx - 2 - k * 2, sy + 1 + (k % 2), 3, 2, k % 2 ? '#7a2a2a' : '#a04040'); }
      outline(c, OUT); return c; });
    const w0 = R0.map(c => whiten(c)); CSET = { R: R0, L: R0.map(flipX), white: { R: w0, L: w0.map(flipX) }, ax: AX, ay: AY, w: 14, h: 9 };
  } finally { Object.assign(C, keep); }
  return CSET;
}
