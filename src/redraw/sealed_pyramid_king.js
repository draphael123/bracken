// src/redraw/sealed_pyramid_king.js - THE COFFIN KING, drawn (claude/pyramidart, Daniel 10-13: his name; src/tomb-king-hands.js keeps every number and every POSE; this file is only the PICTURE).
// A man-sized anthropoid sarcophagus of dressed sandstone that walks on two thick stone legs: a gilt mask under a lapis-striped nemes, the crook and flail crossed on the chest, a wing-collar,
// a cartouche column down the lid; the trough under the lid carries a hieroglyph band. LID OFF: the old king inside - linen wrappings, a gold death mask, his own crossed hands.
// Everything is a pure function of (pose, flash, time, phase): the hands call drawStanding / drawLying with the canvas translated to his FOOT (0, 0), facing +x, and the contract of the
// POSE table (tilt, lift, arm, squat, glow, lidOff, lying, dazed) is unchanged - every move still wears its own windup and release picture (B16).
//   drawStanding(g, p, flash, time, ph, dim)   the standing coffin; ph 3 = the lid cracked for good, p.lift = the lid rides up (a hair of gold light under it), p.glow = the eye slots' colour
//   drawLying(g, p, flash, time, dim)          on his back (FLIPPED: lid off, the king showing, the legs in the air) or rolling on his side (lid on, the stripes turning)
//   bakeCard(POSE, dim)                         the bestiary card's two frames (walk, slamTell)
import { canvas, flipX, whiten } from '../px.js';

const R = Math.round;
const N = { s0: '#3a2c1c', s1: '#5e4c34', s2: '#8a7450', s3: '#b89c6c', s4: '#e0cc98', ink: '#14100a', g0: '#7a5a18', g1: '#d8aa40', g2: '#f8e08a', l0: '#16306a', l1: '#2e4a8a', l2: '#6a8ad8', n0: '#a89870', n1: '#e0d4b0', n2: '#f8f0d0', br: '#b0743a', brL: '#e8a868', brD: '#6a4420', red: '#ff6b6b' };
const W = {}; for (const k in N) W[k] = '#ffffff'; W.ink = '#d8d0c0';   /* the hurt flash: the whole body white, the slots greyed */
const rect = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const px = (g, x, y, c) => rect(g, x, y, 1, 1, c);

/* a shaded stone block: light top-left edge, dark bottom-right edge, a tone body (used for every slab on him) */
function slab(g, P, x, y, w, h, body = P.s2, hi = P.s3, lo = P.s1) {
  rect(g, x, y, w, h, body); rect(g, x, y, w, 1, hi); rect(g, x, y, 1, h, hi); rect(g, x + w - 1, y, 1, h, lo); rect(g, x, y + h - 1, w, 1, lo); }

/* the ANTHROPOID LID: head, shoulders, a taper. x centred on 0; top = the lid's top y; h = its height */
function lid(g, P, top, h, p, time, ph, lift) {
  const hw = 15;
  /* the outline: the head (±7 over 11 rows), the shoulder step (±hw), then the taper to ±12 */
  const row = (yy, half, c) => rect(g, -half, top + yy, half * 2, 1, c);
  for (let i = 0; i < h; i++) { const half = i < 2 ? 5 + i : i < 11 ? 7 : i < 13 ? 7 + (i - 10) * 4 : i < h - 8 ? hw : hw - Math.floor((i - (h - 8)) / 3); row(i, half, P.s3); }
  /* edge light and shade */
  for (let i = 0; i < h; i++) { const half = i < 2 ? 5 + i : i < 11 ? 7 : i < 13 ? 7 + (i - 10) * 4 : i < h - 8 ? hw : hw - Math.floor((i - (h - 8)) / 3); rect(g, -half, top + i, 1, 1, P.s4); rect(g, half - 1, top + i, 1, 1, P.s1); rect(g, half - 2, top + i, 1, 1, P.s2); }
  rect(g, -6, top, 12, 1, P.s4);
  /* the NEMES (headcloth): gold with lapis stripes, falling to the shoulders in two lappets */
  rect(g, -7, top + 1, 14, 10, P.g1); for (let k = 0; k < 5; k++) rect(g, -7, top + 2 + k * 2, 14, 1, P.l1); rect(g, -7, top + 1, 14, 1, P.g2); rect(g, -9, top + 10, 3, 9, P.g1); rect(g, 6, top + 10, 3, 9, P.g1);
  for (let k = 0; k < 4; k++) { rect(g, -9, top + 11 + k * 2, 3, 1, P.l1); rect(g, 6, top + 11 + k * 2, 3, 1, P.l1); }
  /* the FACE: a gold mask, the brow ledge, two eye slots (the glow), a nose, the small beard */
  rect(g, -4, top + 4, 8, 9, P.g2); rect(g, -4, top + 4, 8, 1, P.g1); rect(g, -4, top + 4, 1, 9, P.g1); rect(g, 3, top + 5, 1, 8, P.g0);
  rect(g, -4, top + 6, 8, 1, P.l1);
  const eye = p.glow || P.ink; rect(g, -3, top + 7, 2, 2, eye); rect(g, 1, top + 7, 2, 2, eye); if (p.glow) { px(g, -3, top + 7, '#fff'); px(g, 1, top + 7, '#fff'); }
  rect(g, 0, top + 9, 1, 2, P.g0); rect(g, -2, top + 11, 4, 1, P.g0); rect(g, -1, top + 13, 2, 3, P.l1); rect(g, -1, top + 16, 2, 1, P.l0);
  /* the WING COLLAR: lapis and gold, across the shoulders */
  rect(g, -12, top + 17, 24, 2, P.l1); rect(g, -12, top + 17, 24, 1, P.l2); rect(g, -10, top + 19, 20, 2, P.g1); rect(g, -8, top + 21, 16, 1, P.l1); for (let k = -10; k <= 8; k += 4) rect(g, k, top + 19, 2, 1, P.g2);
  /* the CROOK and FLAIL crossed on the chest */
  for (let k = 0; k < 9; k++) { px(g, -9 + k * 2, top + 23 + k, P.g2); px(g, -8 + k * 2, top + 23 + k, P.g1); px(g, 9 - k * 2, top + 23 + k, P.g2); px(g, 8 - k * 2, top + 23 + k, P.g1); }
  rect(g, -11, top + 22, 4, 2, P.g0); rect(g, 7, top + 22, 4, 2, P.g0); rect(g, -2, top + 28, 4, 4, P.l1); rect(g, -1, top + 29, 2, 2, P.g2);
  /* the cracked lid (phase three): ink fissures and a chip */
  if (ph >= 3) { const c = P.ink; for (let k = 0; k < 9; k++) px(g, -3 + (k >> 1), top + 3 + k, c); for (let k = 0; k < 6; k++) px(g, 3 - (k >> 1), top + 14 + k, c); for (let k = 0; k < 7; k++) px(g, -10 + k, top + 24 + (k >> 1), c); for (let k = 0; k < 6; k++) px(g, 4 + (k >> 1), top + 26 + k, c);
    rect(g, 7, top + 11, 3, 3, P.s0); px(g, 6, top + 12, P.ink); rect(g, -12, top + 33, 2, 2, P.s0); }
  /* a lid riding up shows a hair of gold light under it */
  if (lift > 0) { g.globalAlpha = 0.7; rect(g, -hw + 1, top + h, hw * 2 - 2, 1, P.g2); g.globalAlpha = 1; }
}

/* the TROUGH under the lid: carved stone with a hieroglyph band, chamfered, the king's cartouche */
function trough(g, P, y0, y1, time) {
  const hw = 15, h = y1 - y0;
  slab(g, P, -hw, y0, hw * 2, h, P.s2, P.s3, P.s1); rect(g, -hw + 1, y0 + 1, hw * 2 - 2, 1, P.s4);
  rect(g, -hw + 2, y0 + 3, hw * 2 - 4, 2, P.s1); for (let k = 0; k < 10; k++) { px(g, -hw + 3 + k * 3, y0 + 3, P.ink); px(g, -hw + 4 + k * 3, y0 + 4, k % 3 ? P.g1 : P.l2); }   /* the hieroglyph band */
  if (h > 8) { rect(g, -hw + 2, y0 + 7, hw * 2 - 4, 1, P.s1); rect(g, -3, y0 + 7, 6, h - 8, P.s1); rect(g, -2, y0 + 8, 4, h - 10, P.g1); px(g, -1, y0 + 9, P.ink); px(g, 0, y0 + 10, P.ink); }
}

/* THE KING INSIDE (lid off): the open trough, linen, the gold mask, the crossed hands with the crook */
function king(g, P, y0, y1, time, glow) {
  const hw = 12; rect(g, -hw - 2, y0, hw * 2 + 4, y1 - y0, P.ink); rect(g, -hw - 2, y0, hw * 2 + 4, 1, P.s0);
  const h = y1 - y0; rect(g, -hw, y0 + 1, hw * 2, h - 1, P.n1);
  for (let k = 0; k < h; k += 3) { rect(g, -hw, y0 + 3 + k, hw * 2, 1, P.n0); if (k % 6 === 0) rect(g, -hw + ((k * 5) % 7), y0 + 4 + k, 7, 1, P.n2); }   /* the wrappings */
  rect(g, -6, y0 + 1, 12, 11, P.g1); rect(g, -6, y0 + 1, 12, 1, P.g2); rect(g, -5, y0 + 3, 10, 7, P.g2); rect(g, -6, y0 + 1, 1, 11, P.g0); rect(g, 5, y0 + 2, 1, 10, P.g0);   /* the death mask */
  for (let k = 0; k < 3; k++) rect(g, -6, y0 + 2 + k * 2, 12, 1, P.l1);
  const e = glow || P.ink; rect(g, -4, y0 + 6, 2, 2, e); rect(g, 1, y0 + 6, 2, 2, e); rect(g, -1, y0 + 8, 2, 2, P.g0);
  if (h > 20) { rect(g, -8, y0 + 18, 16, 3, P.n2); rect(g, -8, y0 + 18, 16, 1, P.n1); for (let k = 0; k < 2; k++) { for (let j = 0; j < 8; j++) { px(g, -7 + j * 2, y0 + 19 + k, P.g1); } } rect(g, -9, y0 + 17, 4, 5, P.n1); rect(g, 5, y0 + 17, 4, 5, P.n1); }   /* the crossed hands */
}

export function drawStanding(g, p, flash, time, ph, dim) {
  const P = flash ? W : N, sq = p.squat || 0, Hh = dim.h - sq, lift = p.lift || 0;
  g.save(); g.rotate((p.tilt || 0) * 0.6);
  /* STONE LEGS: thick, a bronze anklet each, a toe block */
  for (const lx of [-12, 3]) { slab(g, P, lx, -9 + Math.min(0, -sq * 0), 9, 9, P.s1, P.s2, P.s0); rect(g, lx, -4, 9, 1, P.brD); rect(g, lx, -5, 9, 1, P.br); rect(g, lx + 1, -5, 3, 1, P.brL); rect(g, lx - 1, -2, 11, 2, P.s0); rect(g, lx - 1, -2, 11, 1, P.s1); }
  /* the BASE and the LID (or the king inside) */
  const bt = -(Hh + 4), trTop = -11;
  if (!p.lidOff) { trough(g, P, trTop, -6, time); lid(g, P, bt - lift, trTop - bt + lift, p, time, ph, lift); }
  else { trough(g, P, trTop + 4, -6, time); king(g, P, bt, trTop + 6, time, p.glow); rect(g, -16, bt - 1, 3, trTop - bt + 12, P.s2); rect(g, 13, bt - 1, 3, trTop - bt + 12, P.s1); rect(g, -16, bt - 1, 3, 1, P.s4); rect(g, 13, bt - 1, 3, 1, P.s3); }
  /* the ARMS: stone, a bandaged wrist, a knuckled fist */
  const ay = -Hh + 16, arm = p.arm || 'down', hw = 15;
  const fist = (x, y) => { slab(g, P, x - 1, y, 7, 6, P.s2, P.s3, P.s1); px(g, x + 1, y + 2, P.s1); px(g, x + 3, y + 2, P.s1); px(g, x + 5, y + 2, P.s1); };
  const limb = (x, y, w, h) => { slab(g, P, x, y, w, h, P.s1, P.s2, P.s0); for (let k = 3; k < h - 2; k += 4) rect(g, x, y + k, w, 1, P.n1); };
  if (arm === 'down') { limb(hw, ay, 5, 14); fist(hw - 1, ay + 14); limb(-hw - 5, ay, 5, 14); fist(-hw - 6, ay + 14); }
  else if (arm === 'up') { limb(hw, ay - 16, 5, 18); fist(hw - 1, ay - 21); limb(-hw - 5, ay - 16, 5, 18); fist(-hw - 6, ay - 21); }
  else if (arm === 'back') { limb(-hw - 16, ay - 2, 16, 5); fist(-hw - 22, ay - 3); limb(-hw - 5, ay, 5, 14); for (let k = 0; k < 4; k++) { rect(g, -hw - 28 - k * 4, ay - 3 + k * 2 + (k & 1), 5, 2, P.n1); rect(g, -hw - 28 - k * 4, ay - 3 + k * 2 + (k & 1), 5, 1, P.n2); } }
  else if (arm === 'out') { limb(hw, ay - 1, 17, 5); fist(hw + 15, ay - 3); limb(-hw - 5, ay, 5, 14); fist(-hw - 6, ay + 14); }
  else if (arm === 'cross') { slab(g, P, -hw + 2, ay + 2, hw * 2 - 4, 4, P.s1, P.s2, P.s0); slab(g, P, -hw + 2, ay + 8, hw * 2 - 4, 4, P.s1, P.s2, P.s0); rect(g, -3, ay, 6, 14, P.g1); rect(g, -3, ay, 6, 1, P.g2); rect(g, 2, ay, 1, 14, P.g0); }
  else if (arm === 'chain') { limb(hw, ay, 5, 14); fist(hw - 1, ay + 14); limb(-hw - 5, ay, 5, 14);
    slab(g, P, -4, ay + 3, 8, 8, '#5d594e', '#9a958c', '#2e2c28'); px(g, -1, ay + 6, P.ink); px(g, 0, ay + 6, P.ink); for (let k = 0; k < 5; k++) { const a = time * 9 + k * 1.3; rect(g, Math.cos(a) * 9, ay + 7 + Math.sin(a) * 5, 3, 3, k & 1 ? '#9a958c' : '#6a665c'); } }
  else if (arm === 'jars') { limb(hw, ay - 12, 5, 16); limb(-hw - 5, ay - 12, 5, 16); for (const jx of [hw - 1, -hw - 6]) { rect(g, jx, ay - 25, 8, 11, '#c8b48a'); rect(g, jx, ay - 25, 8, 1, '#e8d8a8'); rect(g, jx + 7, ay - 24, 1, 10, '#8a7450'); rect(g, jx + 1, ay - 29, 6, 4, '#2e8a6a'); rect(g, jx + 2, ay - 30, 4, 1, '#7ae0a8'); px(g, jx + 3, ay - 20, P.ink); px(g, jx + 4, ay - 19, P.ink); } }
  g.restore();
}

export function drawLying(g, p, flash, time, dim) {
  const P = flash ? W : N, Wd = dim.h + 6, Hh = dim.w - 4;
  if (p.lidOff) {
    /* ON HIS BACK: the open trough seen from the side and a little above, the king showing, the stone legs kicking up at the foot */
    for (const [lx, a] of [[-Wd / 2 - 1, -0.5], [-Wd / 2 + 7, -0.35]]) { g.save(); g.translate(lx + 4, -Hh + 3); g.rotate(a + Math.sin(time * 2 + lx) * 0.04); slab(g, P, -3, -13, 8, 14, P.s1, P.s2, P.s0); rect(g, -3, -6, 8, 1, P.br); rect(g, -4, -15, 10, 3, P.s0); g.restore(); }
    slab(g, P, -Wd / 2, -Hh, Wd, Hh, P.s2, P.s3, P.s1); rect(g, -Wd / 2 + 2, -Hh + 4, Wd - 4, 1, P.s1);
    rect(g, -Wd / 2 + 3, -Hh + 5, Wd - 6, Hh - 8, P.ink);
    rect(g, -Wd / 2 + 5, -Hh + 6, Wd - 12, Hh - 11, P.n1); for (let k = 0; k < Wd - 14; k += 4) { rect(g, -Wd / 2 + 6 + k, -Hh + 6, 1, Hh - 11, P.n0); } rect(g, -Wd / 2 + 6, -Hh + 6, Wd - 14, 1, P.n2);
    rect(g, Wd / 2 - 13, -Hh + 5, 9, Hh - 9, P.g1); rect(g, Wd / 2 - 13, -Hh + 5, 9, 1, P.g2); rect(g, Wd / 2 - 13, -Hh + 5, 1, Hh - 9, P.g2); for (let k = 0; k < 3; k++) rect(g, Wd / 2 - 13 + k * 3, -Hh + 6, 1, Hh - 11, P.l1);   /* the death mask, face to the roof */
    rect(g, Wd / 2 - 9, -Hh + 8, 2, 3, p.glow || P.ink); rect(g, Wd / 2 - 9, -Hh + 13, 2, 2, P.ink);
    rect(g, -Wd / 2 + 14, -Hh + 7, 11, 4, P.n2); rect(g, -Wd / 2 + 14, -Hh + 7, 11, 1, P.n1);   /* the hands on the chest */
  } else {
    /* ROLLING ON HIS SIDE: the lid's stripes turn over the long box */
    slab(g, P, -Wd / 2, -Hh, Wd, Hh, P.s2, P.s3, P.s1); rect(g, -Wd / 2 + 1, -Hh + 1, Wd - 2, 2, P.s4);
    const sp = (time * 14) % 8; for (let k = -1; k < Wd / 8 + 1; k++) { const x = -Wd / 2 + k * 8 + sp; if (x > -Wd / 2 && x < Wd / 2 - 3) { rect(g, x, -Hh + 3, 3, Hh - 5, P.s1); rect(g, x, -Hh + 3, 1, Hh - 5, P.s0); } }
    rect(g, -Wd / 2 + 4, -Hh + 5, 4, Hh - 9, P.g1); rect(g, Wd / 2 - 8, -Hh + 5, 4, Hh - 9, P.g1); rect(g, -5, -Hh + 4, 10, Hh - 7, P.g1); rect(g, -5, -Hh + 4, 10, 1, P.g2); rect(g, -5, -Hh + 4, 1, Hh - 7, P.g2); for (let k = 0; k < 3; k++) rect(g, -4 + k * 3, -Hh + 6, 1, Hh - 11, P.l1);
    rect(g, -Wd / 2, -3, 6, 3, P.s0); rect(g, Wd / 2 - 6, -3, 6, 3, P.s0);
    /* sand off the stone */ g.globalAlpha = 0.6; for (let k = 0; k < 6; k++) rect(g, -Wd / 2 + ((k * 9 + time * 40) % Wd), -2 - (k % 3), 2, 1, '#d8c8a0'); g.globalAlpha = 1;
  }
  if (p.dazed) { for (let i = 0; i < 3; i++) { const a = time * 6 + i * 2.1; rect(g, Math.cos(a) * 10, -Hh - 8 + Math.sin(a) * 3, 2, 2, P.g2); } }
}

export function bakeCard(POSE, dim) {
  const fr = ['walk', 'slamTell'].map(k => { const [c, g] = canvas(64, 80); g.translate(32, 78); drawStanding(g, POSE[k], false, 0, 1, dim); return c; });
  return { R: fr, L: fr.map(c => flipX(c)), white: { R: fr.map(c => whiten(c)), L: fr.map(c => flipX(whiten(c))) }, ax: 32, ay: 78, w: dim.w, h: dim.h };
}
