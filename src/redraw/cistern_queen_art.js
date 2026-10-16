// src/redraw/cistern_queen_art.js - THE CISTERN QUEEN, drawn (claude/welltown3). A giant scorpion matriarch, drawn live from her pose (not a sprite
// sheet: she is too big and too many-jointed for one) - a dark chitin body as long as a cart, eight legs, two great claws held up in GUARD, and her tail
// curled up over her back to a LIT STINGER (amber, white-hot while it is told). Her size is the read: on the floor she stands three heroes tall to the
// tip of the tail and ten long. Every pose is the same body turned: clinging to a wall (turned on end, claws to the hall), hanging in the shaft (upside
// down), SOAKED (wet and slumped, the guard down), ON HER BACK (legs kicking), REARING (up on her tail, underbelly bare), THE VENOM BLOOM (planted, her
// stinger driven into the water, green). (claude/queen4, Daniel 10-07 "her animations jumping around look really awkward") Nothing pops any more: she is
// drawn through src/cistern-queen.js S.view - one eased transform (backing up a wall, the leap into the shaft and the drop out, a turn through a squash,
// the dig down into the sand and the burst up, the gather before a blow and the follow-through after) that her stinger's hitbox is found by too; her legs
// walk a SIX-FRAME gait wave keyed to the ground she covers (no moonwalking on the spot), and standing she breathes (a four-beat heave).
// Also: the hall's windlass, the shaft's bucket and rope, the two side tunnels, and over everything her tells on the floor and what she throws.
//   drawQueen(g, e, S, x, y, time)   x, y = her feet on screen.   bakeCisternQueen() -> a sprite set for the bestiary and her body (CQ_F names its frames)
import { CQ, TAIL, tailPose, view, qOpen, stingerOut, burstAt } from '../cistern-queen.js';   /* (claude/underwell3) her tail's one table, and the pose that picks a path */
import { canvas, flipX, whiten, outline } from '../px.js';
import { OUT } from '../art.js';

export const QC = { chit0: '#1a100c', chit1: '#5a3c2e', chit2: '#86593f', chit3: '#b8805a', rim: '#f2cf90', sand: '#d8b47a', belly: '#9a7a58', bellyL: '#c8a87c', leg: '#a06c46', legD: '#6e4630', legL: '#d9a56c',
  eye: '#ff6a3a', eyeL: '#ffd0a0', sting: '#ffb84a', stingHot: '#fff2c0', stingCore: '#ff6a2a', venom: '#a6e04a', venomD: '#4e7a24', wet: '#7ab8e8', wetL: '#d8eef8', claw: '#9c6642', clawL: '#e4a86c' };
/* (claude/cqart) HER THREE SHELLS: HOT (the fire has cracked her: the plates warm to ember-orange), DOUSED (water on her: a dark, cool, wet-lit shell) and BLACKENED (burnt out: ash-grey and sooty). Each is a swap of the same eight chitin colours, so every part of her (legs, tail, claws, head) wears it. */
const PAL_HOT = { chit1: '#6e3022', chit2: '#a24c28', chit3: '#d8803c', rim: '#ffdca0', belly: '#a8603a', bellyL: '#e09a60', claw: '#b8582c', clawL: '#f4a860', legD: '#7a3a22', leg: '#b85e34', legL: '#f0a060' };
const PAL_WET = { chit0: '#120e12', chit1: '#33282a', chit2: '#52403c', chit3: '#78625a', rim: '#cfe8f4', belly: '#4a4038', bellyL: '#7c8a90', claw: '#6a5046', clawL: '#a8bcc4', legD: '#3a2e2c', leg: '#6e5448', legL: '#a8bcc4' };
const PAL_CHAR = { chit0: '#0b0908', chit1: '#27221f', chit2: '#3a342f', chit3: '#554d46', rim: '#8a8279', belly: '#352e29', bellyL: '#4e453d', claw: '#463d35', clawL: '#706558', legD: '#221d1a', leg: '#413831', legL: '#655a4e' };
const WHITE = { chit0: '#fff', chit1: '#fff', chit2: '#fff', chit3: '#fff', rim: '#fff', belly: '#fff', bellyL: '#fff', claw: '#fff', clawL: '#fff', legD: '#fff', leg: '#fff', legL: '#fff' };
/* the cracks in her shell, in her own frame: down each plate, along her back, across her head - HOT they glow, BLACKENED they are black fissures */
const SEAMS = [[[-45, -38], [-40, -31], [-46, -25], [-41, -17]], [[-30, -40], [-26, -33], [-32, -27], [-27, -20], [-31, -14]], [[-14, -41], [-10, -34], [-16, -28], [-11, -21]],
  [[2, -40], [6, -33], [1, -27], [7, -20], [3, -14]], [[18, -38], [22, -31], [17, -25], [22, -17]], [[33, -36], [37, -30], [32, -25], [36, -19]], [[-46, -30], [-34, -25], [-21, -31], [-6, -25], [10, -32], [26, -27]]];
const R = Math.round;
const fr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const ell = (g, c, x, y, rx, ry, rot = 0) => { g.fillStyle = c; g.beginPath(); g.ellipse(R(x), R(y), Math.max(0.5, rx), Math.max(0.5, ry), rot, 0, Math.PI * 2); g.fill(); };
const ln = (g, c, w, pts) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); };

/* THE BODY in her own frame: origin at her feet (the floor under her middle), +x forward (her head), -y up. o = { t, walk, claw: 'guard'|'down'|'forward'|'snap'|'up',
   tail: 'curl'|'lance'|'sweep'|'flick'|'high'|'pin'|'down', clawReach, lanceTo: [dx, dy], hot (the stinger told), wet, flash, legs: 'walk'|'splay'|'kick'|'still' } */
export function drawBody(g, o) {
  const t = o.t || 0, wet = o.wet || 0;
  /* (claude/queen4) THE GAIT: a six-frame wave down each side (the legs of a side a quarter-cycle apart, the two sides half a cycle), the phase from the ground
     covered (o.gait) or, scrabbling up or down a wall, from the clock - stepped to six frames so it reads as drawn frames, not a wobble */
  const STEP = Math.PI / 3, gait = o.walk ? Math.floor((o.gait != null ? o.gait : t * 12) / STEP) * STEP : null;
  const heat = o.heat || 0, soaked = wet >= 0.7, charr = o.char || 0;   /* (claude/cqart) which shell she wears: DOUSED over BLACKENED over HOT */
  let C = o.flash ? WHITE : soaked ? { ...QC, ...PAL_WET } : charr > 0 ? { ...QC, ...PAL_CHAR } : heat > 0 ? { ...QC, ...PAL_HOT } : QC;
  if (o.back && soaked) C = { ...C, belly: '#8fa0a6', bellyL: '#c4d4da' };   /* (claude/cq3art) on her back and wet: the underbelly lit pale against the dark shell */
  /* THE LEGS (polish): thick, lighter than the floor and the body, a dark edge under a lit one, a knee and a pale foot-claw - they read on the dark hall */
  const legs = o.legs || 'walk';
  for (let i = 0; i < 4; i++) { const bx = -26 + i * 15;
    for (const side of [0, 1]) { const sh = side ? 0 : 1, col = side ? C.leg : C.legD, hi = side ? C.legL : C.leg, ph = gait == null ? 0 : Math.sin(gait + i * Math.PI / 2 + side * Math.PI);
      let pts;
      if (legs === 'kick') { const a = Math.sin(t * 16 + i * 1.7 + side) * 6; pts = [[bx, -14], [bx - 6 + a, -34], [bx + 4 + a, -46]]; }
      else if (legs === 'perch') { const sp = (i - 1.5) * 11 + (side ? 6 : -6), br = Math.sin(t * 2.2 + i) * 0.6; pts = [[bx, -14 - sh], [bx + sp * 1.5, -32 + sh * 3 + br], [bx + sp * 1.9 - 3, -2]]; }   /* (claude/cqart) THE PERCH: knees up and wide, a crouch on the beam, the foot-claws hooked down over its lip */
      else if (legs === 'thrashA') { const tr = Math.sin(t * 40 + i * 2 + side) * 1.8; const d = i - 1.5; pts = [[bx, -14 - sh], [bx - 8 + d * 6 + tr, -34], [bx + d * 13 + (side ? 5 : -5), -50 + tr]]; }   /* (claude/cq3art) THRASH, the windup: the legs snatched up and back, shuddering */
      else if (legs === 'thrashB') { const d = i - 1.5, tr = Math.sin(t * 40 + i + side) * 1.5; pts = [[bx, -14 - sh], [bx + d * 12 + 6, -20 + tr], [bx + d * 22 + 8, 0]]; }   /* (claude/cq3art) THRASH, the release: stamped wide and down on the hot sand */
      else if (legs === 'sag') { const k = i < 2 ? 1 : -1, w = side ? 1 : 0.7, br = Math.sin(t * 2.4 + i) * 0.8; pts = [[bx, -13 - sh], [bx + k * 11 * w, -8 + br], [bx + k * 23 * w, -1]]; }   /* (claude/cq3art) THE SAG: the legs gone slack and splayed flat out along the floor, the belly down */
      else if (legs === 'skid') { pts = [[bx, -14 - sh], [bx + 16 + i * 2, -26 + sh * 3], [bx + 32 + i * 3, -12 + side * 5]]; }   /* (claude/cq3art) THE SLIP, the skid: every foot shot out in front of her on the wet */
      else if (legs === 'upkick') { const a = Math.sin(t * 13 + i * 1.7 + side * 2) * 7; const d = (i - 1.5) * 1.5; pts = [[bx, -14], [bx + d * 4 + a * 0.5, 0], [bx + d * 11 + a, 15 + side * 6 + Math.abs(a) * 0.6]]; }   /* (claude/cq3art) ON HER BACK: drawn in her flipped frame, +y is UP - the legs paddle at the air */
      else { const fx = bx + (legs === 'splay' ? (i - 1.5) * 9 : ph * 5 - 4), lift = legs === 'walk' ? Math.max(0, ph) * 4 : 0; pts = [[bx, -14 - sh], [fx - 7, -30 + sh * 2], [fx - 11, -lift]]; }
      ln(g, C.chit0, 7, pts); ln(g, col, 4.6, pts); ln(g, hi, 1.4, pts.map(([x, y]) => [x - 0.8, y - 1]));
      const [kx, ky] = pts[1], [fx2, fy2] = pts[2]; ell(g, hi, kx, ky, 2.6, 2.6); fr(g, C.rim, kx - 1, ky - 3, 2, 2); ell(g, C.legL, fx2, fy2, 2.4, 1.6); fr(g, C.rim, fx2 - 3, fy2 - 1, 5, 1);
      if (legs === 'perch') { ln(g, C.chit0, 3, [[fx2, fy2 - 1], [fx2 + 2, fy2 + 3]]); ln(g, C.legL, 1.4, [[fx2, fy2 - 1], [fx2 + 2, fy2 + 2]]); } } }   /* the toe hooked over the beam's edge */
  /* THE TAIL: seven segments from her rump, curled up over her back to the stinger (or out at what it is doing). Dark edge, lit top. */
  const tail = o.tail || 'curl', segs = [];
  { let px = -42, py = -22; segs.push([px, py]);
    const path = TAIL[tail] || null; /* (claude/underwell3: the one table, src/cistern-queen.js TAIL - the stinger a blow must find is the one drawn) */
    if (tail === 'lance' && o.lanceTo) { const [tx, ty] = o.lanceTo; for (let i = 1; i <= 6; i++) { const q = i / 6, ax = px + (tx - px) * q, ay = py + (ty - py) * q - (o.flat ? (o.flip ? -1 : 1) * (Math.sin(q * Math.PI) * 6 + Math.sin(q * Math.PI * 3) * 2.5) : Math.sin(q * Math.PI) * 70); segs.push([ax, ay]); } }
    else for (const [ax, ay] of path || []) segs.push([ax + (tail === 'curl' ? Math.sin(t * 2.2) * 2 : 0), ay + (tail === 'curl' ? Math.cos(t * 2.2) * 2 : 0)]); }
  if (o.target) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.3 + 0.12 * Math.sin(t * 7); ln(g, '#c88a2a', 15, segs); g.globalAlpha = 0.45 + 0.2 * Math.sin(t * 7); ln(g, '#ffc85a', 6, segs); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }   /* (claude/cq3art) THE TAIL ON THE FLOOR IS THE TARGET (B10): a gold light along its whole length, pulsing */
  for (let i = segs.length - 1; i >= 1; i--) { const [x0, y0] = segs[i - 1], [x1, y1] = segs[i], r = o.flat ? 9 - i * 1.15 : 10.5 - i * 0.7;
    ln(g, C.chit0, r * 2 + 3, [[x0, y0], [x1, y1]]); ln(g, C.chit2, r * 2, [[x0, y0], [x1, y1]]);
    ell(g, C.chit0, x1, y1, r + 1.4, r * 0.85 + 1.4); ell(g, C.chit2, x1, y1, r, r * 0.85); ell(g, C.chit3, x1 - 1, y1 - r * 0.35, r * 0.62, r * 0.36); fr(g, o.target ? '#ffe39a' : C.rim, x1 - r * 0.6, y1 - r * 0.9, r * 1.2, 1.5); }
  /* THE STINGER (polish): an amber bulb in a real halo (a gradient, not a flat disc), a pale hook and a core - and white-hot, bigger and ringed while it is told */
  { const [sx, sy] = segs[segs.length - 1], [qx, qy] = segs[segs.length - 2] || [sx - 4, sy + 4], a = Math.atan2(sy - qy, sx - qx), green = o.venomHot;
    const hot = o.hot ? 0.6 + 0.4 * Math.abs(Math.sin(t * 18)) : 0, glow = 0.55 + 0.2 * Math.abs(Math.sin(t * 3)) + hot * 0.35, Z = o.target ? 1.35 : 1, R0 = (22 + hot * 12) * Z;
    const cA = green ? '166,224,74' : '255,184,74', cH = green ? '214,255,140' : '255,242,192';
    const gr = g.createRadialGradient(sx, sy, 2, sx, sy, R0); gr.addColorStop(0, 'rgba(' + (o.hot ? cH : cA) + ',' + Math.min(1, glow) + ')'); gr.addColorStop(0.45, 'rgba(' + cA + ',' + (glow * 0.4) + ')'); gr.addColorStop(1, 'rgba(' + cA + ',0)');
    g.fillStyle = gr; g.fillRect(sx - R0, sy - R0, R0 * 2, R0 * 2);
    if (o.hot) { g.strokeStyle = 'rgba(' + cH + ',' + (0.5 + 0.4 * hot) + ')'; g.lineWidth = 1.5; g.beginPath(); g.arc(sx, sy, 11 + hot * 5, 0, Math.PI * 2); g.stroke(); }
    ell(g, QC.chit0, sx, sy, 11 * Z, 10 * Z, a); ell(g, green ? QC.venom : QC.stingCore, sx, sy, 9 * Z, 8 * Z, a); ell(g, o.hot ? (green ? '#eaffb0' : QC.stingHot) : (green ? '#d6f8a0' : '#ffd070'), sx - 1, sy - 1, 5 * Z, 4 * Z, a);
    const bx = sx + Math.cos(a) * 15 * Z, by = sy + Math.sin(a) * 15 * Z, h1 = [bx + Math.cos(a + 1.9) * 7 * Z, by + Math.sin(a + 1.9) * 7 * Z];
    ln(g, QC.chit0, 5, [[sx + Math.cos(a) * 5, sy + Math.sin(a) * 5], [bx, by], h1]); ln(g, o.hot ? QC.stingHot : '#ffe2a0', 2.2, [[sx + Math.cos(a) * 6, sy + Math.sin(a) * 6], [bx, by], h1]);
    /* (claude/cqart) ARMOURED (outside her openings, B15 x0.4): a STEEL sleeve and two cap plates riveted over the bulb, the glow showing between them - bare and gold when it pays (HOT, stuck, an opening) */
    if (o.armour && !green) { g.save(); g.translate(sx, sy); g.rotate(a);
      fr(g, '#2a3038', -13, -10, 6, 20); fr(g, '#8995a3', -12, -9, 4, 18); fr(g, '#d6e0ea', -12, -9, 4, 2); fr(g, '#56606c', -9, -9, 1, 18); fr(g, '#eef4fa', -11, -6, 2, 2); fr(g, '#eef4fa', -11, 4, 2, 2);
      fr(g, '#2a3038', -4, -12, 12, 5); fr(g, '#9aa7b4', -3, -11, 10, 3); fr(g, '#e2eaf2', -3, -11, 10, 1); fr(g, '#2a3038', -4, 7, 12, 5); fr(g, '#8995a3', -3, 8, 10, 3); fr(g, '#56606c', -3, 10, 10, 1);
      g.restore(); } }
  /* THE BODY: a long segmented carapace, the underbelly paler, a continuous sandy rim light along the top and the head */
  ell(g, C.chit0, -4, -24, 50, 18); ell(g, C.belly, -6, -16, 46, 10); ell(g, C.chit1, -4, -24, 48, 16);
  for (let i = 0; i < 5; i++) { const x = -38 + i * 16; ell(g, C.chit0, x, -26, 12.4, 15.4); ell(g, i % 2 ? C.chit3 : C.chit2, x, -26, 11, 14); fr(g, C.chit3, x - 6, -34 + Math.abs(i - 2), 10, 2); }
  ln(g, C.rim, 2, [[-46, -36], [-36, -40], [-20, -42], [-4, -42], [12, -41], [28, -38], [38, -34]]);
  ell(g, C.bellyL, -6, -12, 40, 3);
  if (o.back) { ell(g, C.chit0, -4, -15, 46, 11); ell(g, C.bellyL, -4, -15, 44, 9.5); ell(g, C.belly, -4, -13.5, 42, 7.5); for (let i = 0; i < 8; i++) { const x = -38 + i * 10; ln(g, C.chit1, 1.3, [[x, -22], [x + 2, -15], [x, -8]]); fr(g, C.rim, x + 3, -17, 1, 1); } ln(g, C.rim, 1, [[-34, -22], [-12, -24], [10, -23], [30, -20]]); }   /* (claude/cq3art) THE UNDERBELLY: pale plates in rows, bare to the hall */
  /* THE HEAD and the eyes (a cluster, lit) */
  ell(g, C.chit0, 40, -24, 17.5, 14.5); ell(g, C.chit3, 40, -24, 16, 13); fr(g, C.rim, 30, -36, 20, 2);
  for (const [ex, ey] of [[46, -30], [50, -28], [43, -27]]) { ell(g, QC.eye, ex, ey, 2.4, 2.4); fr(g, QC.eyeL, ex - 1, ey - 1, 1.5, 1.5); }
  ln(g, C.chit0, 4, [[52, -20], [59, -15]]); ln(g, C.clawL, 2, [[52, -20], [59, -15]]); ln(g, C.chit0, 4, [[52, -24], [61, -26]]); ln(g, C.clawL, 2, [[52, -24], [61, -26]]);
  /* THE CLAWS (polish): two great pincers on thick lit arms - pale-rimmed, tipped bright, so the GUARD (the raised claws that turn a blow) and every snap read against the hall */
  const claw = o.claw || 'guard', reach = o.clawReach || 0;
  for (const side of [1, 0]) { const col = side ? C.claw : C.chit3, colL = side ? C.clawL : C.claw, dy = side ? 0 : 4;
    let sh = [44, -22 + dy], el, hand, open = 0.3;
    if (claw === 'guard') { el = [62, -40 + dy]; hand = [70 - side * 6, -60 + dy * 2]; open = 0.25 + 0.15 * Math.sin(t * 3 + side); }
    else if (claw === 'down') { el = [60, -14 + dy]; hand = [74, -6 + dy]; open = 0.1; }
    else if (claw === 'up') { el = [56, -60 + dy]; hand = [50 + side * 14, -88 + dy]; open = 0.6 + 0.3 * Math.sin(t * 20 + side * 2); }
    else if (claw === 'snap') { el = [70, -28 + dy]; hand = [94, -26 + dy]; open = side ? 0.05 : 0.9; }
    else if (claw === 'thrashA') { const sh2 = Math.sin(t * 28 + side * 2) * 1.5; if (side) { el = [40, -64]; hand = [20 + sh2, -92]; open = 1; } else { el = [74, -30]; hand = [96, -8 + sh2]; open = 0.95; } }   /* (claude/cq3art) THRASH, the windup: the near claw flung up and back over her shoulder, the far one thrown wide and low, both gaping */
    else if (claw === 'thrashB') { el = [64, -16 + dy]; hand = [88, -3 + dy]; open = 0.95; }   /* (claude/cq3art) THRASH, the release: both claws slammed down on the floor ahead of her, gaping */
    else if (claw === 'sprawl') { el = [62, -9 + dy]; hand = [84, -3 + dy * 0.5]; open = 0.15 + 0.05 * Math.sin(t * 2.4 + side); }   /* (claude/cq3art) THE SAG: the claws lie limp on the floor, the guard gone */
    else if (claw === 'airup') { const w = Math.sin(t * 5 + side * 2); el = [58, 10 + dy]; hand = [62 + side * 10 + w * 4, 34 + dy + w * 4]; open = 0.6 + 0.3 * Math.sin(t * 9 + side); }   /* (claude/cq3art) ON HER BACK (her flipped frame, +y UP): the claws wave at the air */
    else { el = [70, -26 + dy]; hand = [86 + reach, -22 + dy]; open = 0.75; }
    ln(g, C.chit0, 11, [sh, el, hand]); ln(g, col, 8, [sh, el, hand]); ln(g, colL, 2, [[sh[0], sh[1] - 3], [el[0], el[1] - 3], [hand[0], hand[1] - 3]]); ell(g, colL, el[0], el[1] - 1, 4, 3); fr(g, C.rim, el[0] - 2, el[1] - 4, 4, 1);
    /* the pincer: a heavy palm and two long fingers that open, the tips bright */
    const [hx, hy] = hand, u = [[hx + 6, hy - 3], [hx + 20, hy - 7 - open * 11]], d = [[hx + 6, hy + 3], [hx + 20, hy + 5 + open * 7]];
    ln(g, C.chit0, 9.5, u); ln(g, C.chit0, 9.5, d); ell(g, C.chit0, hx, hy, 15.5, 12.5);
    ln(g, col, 6.5, u); ln(g, col, 6.5, d); ell(g, col, hx, hy, 14, 11); ell(g, colL, hx - 2, hy - 4, 8, 3.2); ln(g, C.rim, 1.4, [[hx - 8, hy - 6], [hx + 6, hy - 8], u[1]]); fr(g, '#f6e0b0', u[1][0] - 1, u[1][1] - 1, 4, 3); fr(g, '#f6e0b0', d[1][0] - 1, d[1][1] - 1, 4, 3); }
  /* (claude/cqart) HOT: the fire has CRACKED her shell - a glow under the plates, every seam open and burning (a dark red lip, an orange body, a pale core), the heat rising off her; as it burns out the seams sink to a dull red */
  if (heat > 0 && !o.flash) { const dim = Math.min(1, 0.3 + heat * 1.2), pu = 0.7 + 0.3 * Math.sin(t * 7);
    g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,100,30,' + (0.2 * dim) + ')'; g.beginPath(); g.ellipse(-4, -24, 52, 20, 0, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over';
    SEAMS.forEach((sm, i) => { const k = dim * (0.75 + 0.25 * Math.sin(t * 6 + i * 1.3)); g.globalAlpha = k * 0.8; ln(g, '#c4300c', 5, sm); g.globalAlpha = k; ln(g, '#7a1408', 3.4, sm); ln(g, '#ff7a22', 2.2, sm); g.globalAlpha = Math.min(1, k * 1.1); ln(g, heat > 0.4 ? '#fff0b0' : '#ff9a3c', 1.1, sm); });
    g.globalAlpha = dim; ln(g, '#ffb84a', 1.4, [[-46, -36], [-36, -40], [-20, -42], [-4, -42], [12, -41], [28, -38], [38, -34]]);   /* the back's rim, white-hot */
    for (let i = 1; i < segs.length - 1; i++) { const [x1, y1] = segs[i], r2 = 10.5 - i * 0.7; g.globalAlpha = dim * pu; ln(g, '#ff7a22', 1.8, [[x1 - r2 * 0.6, y1 - 2], [x1 - 1, y1 + 1], [x1 + r2 * 0.6, y1 - 1]]); fr(g, '#ffe9a0', x1 - 1, y1 - 1, 2, 1); }
    g.globalAlpha = 1; for (let i = 0; i < 9; i++) { const x = -44 + ((i * 23 + t * 30) % 88), y = -40 - ((t * 45 + i * 17) % 26); fr(g, i % 3 ? '#ffd36b' : '#ff9a3c', x, y, 2, 2); } }
  /* (claude/cqart) DOUSED: a dark wet shell lit cool - sheen along every plate, beads, runnels down the carapace, drops swelling on her belly, rings on the floor where it falls */
  if (wet > 0 && !o.flash) { const w = Math.min(1, wet);
    if (soaked) { for (let i = 0; i < 5; i++) { const x = -38 + i * 16, tw = (Math.sin(t * 3 + i * 1.9) + 1) / 2;
        g.globalAlpha = 0.55 + 0.35 * tw; fr(g, '#d8eef8', x - 6, -37 + Math.abs(i - 2), 7, 1); fr(g, '#ffffff', x - 3 + (i % 2) * 2, -35 + Math.abs(i - 2), 2, 1);
        g.globalAlpha = 0.7; const rx = x - 4 + ((i * 7) % 5), k = (t * 0.8 + i * 0.23) % 1; ln(g, QC.wet, 1, [[rx, -34 + k * 5], [rx + 1, -18 + k * 3]]); g.globalAlpha = 1; fr(g, '#ffffff', rx, -32 + k * 14, 1, 2); }
      g.globalAlpha = 0.85; ln(g, '#d8eef8', 1.2, [[30, -38], [38, -34], [44, -31]]); g.globalAlpha = 1;
      for (let i = 0; i < 16; i++) { const x = -42 + ((i * 29) % 84), y = -38 + ((i * 17) % 22); fr(g, i % 3 ? '#9fd0ee' : '#ffffff', x, y, 1, 1); }
      for (let i = 0; i < 6; i++) { const x = -34 + i * 14, sw = 1 + ((t * 1.2 + i * 0.31) % 1) * 2; fr(g, '#7ab8e8', x, -11, 2, sw + 1); fr(g, '#e8f4f8', x, -11, 1, 1); } }
    g.globalAlpha = 0.1 * w; ell(g, QC.wet, -4, -26, 50, 16); g.globalAlpha = 1;
    if (o.floor && soaked) for (let j = 0; j < 2; j++) { const k = (t * 0.9 + j * 0.5) % 1; g.globalAlpha = 0.6 * (1 - k); g.strokeStyle = '#9fd0ee'; g.lineWidth = 1; g.beginPath(); g.ellipse(-4, 0, 22 + k * 30, 2 + k * 3, 0, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; } }
  /* (claude/cqart) BLACKENED: burnt out - ash-grey plates split along black fissures, soot and flaked ash on the shell, a last dull ember or two in the cracks that dies as it clears */
  if (charr > 0 && !o.flash) { const ember = Math.max(0, charr - 0.4) * 1.7;
    g.globalAlpha = 0.5; for (let i = 0; i < 14; i++) { const x = -42 + ((i * 31) % 84), y = -39 + ((i * 13) % 24); fr(g, i % 2 ? '#a89f94' : '#6a625a', x, y, 2 + (i % 2), 1); }
    g.globalAlpha = 0.95; for (const sm of SEAMS) { ln(g, '#050403', 2.6, sm); ln(g, '#8a8279', 0.7, sm.map(([x, y]) => [x + 1.4, y - 0.6])); }
    if (ember > 0) SEAMS.forEach((sm, i) => { const [x, y] = sm[Math.floor(t * 1.6 + i) % sm.length]; g.globalAlpha = Math.min(1, ember) * (0.5 + 0.5 * Math.sin(t * 9 + i * 2)); fr(g, '#e0551c', x - 1, y - 1, 2, 2); });
    g.globalAlpha = 1; }
  /* (claude/cq3art) THE SAG: the char is split along its seams with the last of the fire - glowing cracks that pulse and dim as the opening runs out */
  if ((o.ember || 0) > 0 && !o.flash) { const em = o.ember; g.globalCompositeOperation = 'lighter'; SEAMS.forEach((sm, i) => { const k = em * (0.55 + 0.45 * Math.sin(t * 5 + i * 1.3)); g.globalAlpha = k * 0.7; ln(g, '#b82a08', 4.2, sm); g.globalAlpha = k; ln(g, '#ff8a2a', 1.7, sm); g.globalAlpha = k * 0.9; ln(g, '#ffe0a0', 0.8, sm); }); g.globalAlpha = em * 0.18; ell(g, '#ff6a22', -4, -24, 50, 15); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
}

/* HER ON THE SCREEN, by pose */
export function drawQueen(g, e, S, x, y, time, cx, cy) {
  if (S.pose === 'burrow' || S.pose === 'tunnel') return;
  if (e.gone > 0 && S.pose !== 'shaft' && e.mode !== 'pounce') return;
  const V = S.view && S.view.live ? S.view : view(e, S);   /* (claude/queen4) the one transform: the fight eases it, her stinger's hitbox is found by it */
  const m = e.mode, tellHot = /Tell$/.test(m) && m !== 'diveTell' && m !== 'climbTell' && m !== 'floodTell', flash = (e.flash > 0) || (tellHot && Math.floor(time * 14) % 2 === 0 && e.modeT < 0.3);
  const moving = (V.spd || 0) > 14, scrabble = m === 'climb' || m === 'descend' || (m === 'ambushTell' && S.tunnelK != null);
  const o = { t: time, walk: moving || scrabble, gait: scrabble ? time * 16 : V.stride * 0.16, claw: 'guard', tail: 'curl', hot: tellHot && /lance|pin|sting|tidal|sweep|bloom/.test(m), flash, legs: moving || scrabble ? 'walk' : 'still', wet: S.flood ? 0.4 : 0 };
  if (m === 'pincerTell') { o.claw = 'snap'; } if (m === 'pincer' || m === 'snap' || m === 'snap2') { o.claw = 'forward'; o.clawReach = 8; }
  if (m === 'snapTell' || m === 'snap2Tell') o.claw = 'snap';
  if (m === 'lungeTell' || m === 'lunge') { o.claw = 'forward'; o.clawReach = m === 'lunge' ? 12 : 0; o.tail = 'high'; }
  if (m === 'lanceTell') { o.tail = 'high'; o.hot = true; } if (m === 'lance' && S.cur) { o.tail = 'lance'; o.lanceTo = [(S.cur.x - e.x) * (e.face || 1), 0]; o.hot = true; }
  if (m === 'flickTell' || m === 'flick') o.tail = 'flick';
  if (m === 'barbTell' || m === 'barb') { o.tail = 'pin'; o.hot = true; }
  if (m === 'sweepLowTell') { o.tail = 'back'; o.hot = true; o.claw = 'down'; } if (m === 'sweepHighTell') { o.tail = 'backHigh'; o.hot = true; o.claw = 'up'; } if (m === 'sweepLow' || m === 'sweepHigh') o.tail = 'sweep';
  if (m === 'pinTell') { o.tail = 'pin'; o.hot = true; } if (m === 'pin' || m === 'pinned') { o.tail = 'pin'; o.claw = 'down'; }
  if (m === 'grabTell') { o.claw = 'snap'; } if ((m === 'grab' || m === 'hold') && S.claw) { o.claw = 'forward'; o.clawReach = S.claw.reach; }
  if (m === 'tidalTell') { o.tail = 'high'; o.hot = true; } if (m === 'tidal') o.tail = 'sweep';
  if (m === 'soaked') { o.claw = 'down'; o.tail = 'down'; o.legs = 'splay'; o.wet = 1; o.walk = false; }
  if (m === 'rear') { o.claw = 'up'; o.legs = 'kick'; }
  if (m === 'recover' || m === 'surface') o.legs = 'still';
  if (m === 'slamTell') { o.claw = 'up'; o.hot = false; } if (m === 'spitTell') { o.claw = 'down'; o.tail = 'spit'; o.hot = true; o.venomHot = true; }
  if (m === 'tidalTell') { o.venomHot = true; } if (m === 'waveTell') { o.claw = 'up'; } if (m === 'pounceTell') { o.claw = 'up'; o.tail = 'high'; }
  /* (claude/queen4) THE VENOM BLOOM: planted (legs splayed, claws down in the water), the tail arched and the stinger green-hot; then driven in */
  if (m === 'bloomTell') { o.claw = 'down'; o.legs = 'splay'; o.walk = false; o.hot = true; o.venomHot = true; }
  if (m === 'bloom' || m === 'bloomBurst' || m === 'bloomPull') { o.claw = 'down'; o.legs = 'splay'; o.walk = false; o.venomHot = true; }
  if (m === 'leap') { o.legs = 'splay'; o.walk = false; o.claw = 'up'; } if (m === 'drop' || m === 'pounce') { o.legs = 'splay'; o.walk = false; o.claw = 'up'; }
  if (m === 'diveTell') { o.claw = 'down'; o.walk = true; o.gait = time * 20; o.legs = 'walk'; }   /* digging: the legs churn as she sinks */
  if (e.guardFx > 0) o.flash = true;
  const face = e.face || 1;
  /* (claude/underwell3) HER TAIL by src/cistern-queen.js tailPose - the same choice the hit on her stinger makes; the stinger stuck in the floor (a sting, the slam, the slip) runs the tail down to it, hot-white */
  { const tp = tailPose(e, S); o.tail = tp.tail; o.lanceTo = tp.lanceTo; if (tp.tail === 'lance') o.hot = true; }
  if (m === 'sslamTell') { o.claw = 'up'; o.hot = true; } if (m === 'planted') { o.claw = 'down'; o.legs = 'still'; }
  if (m === 'slip') { const age = CQ.slipT - Math.max(0, e.open || 0); o.wet = 1; o.walk = false; if (age < 0.22) { o.claw = 'up'; o.legs = 'skid'; } else { o.claw = 'airup'; o.legs = 'upkick'; o.back = true; } }   /* (claude/cq3art) SHE SLIPS: the skid (every foot out in front, the claws flung up), the flip, then ON HER BACK, paddling at the air */   /* (claude/cisternqueen3) SHE SLIPS ONTO HER BACK: drawn as the fall (greybox - the art lane draws her own slip) */
  if (m === 'thrash') { const rel = Math.floor(time * 7) % 2 === 1; o.claw = rel ? 'thrashB' : 'thrashA'; o.legs = rel ? 'thrashB' : 'thrashA'; o.walk = false; o.heat = 1; o.hot = true; }   /* (claude/cq3art, B16) ALIGHT: its own windup (rared back, claws and legs thrown up) and release (slammed down) frames, the burning shell on */   /* (claude/cisternqueen3) ABLAZE, THRASHING (greybox: the reel frame) */
  if (m === 'ablaze') { o.claw = 'sprawl'; o.legs = 'sag'; o.walk = false; o.char = 1; o.ember = Math.max(0.25, Math.min(1, (e.open || 0) / CQ.ablazeT)); }   /* (claude/cq3art) THE SAG: down on her belly, legs and claws slack, the char split with glowing seams that dim as the opening runs out */   /* (claude/cisternqueen3) ABLAZE, SAGGED: down, the shell charred (greybox) */
  if (e.scorch > 0) { o.scorch = Math.min(1, e.scorch); o.heat = 1; o.hot = true; }   /* (claude/cq3art: CQ.scorchT was retired - heat read NaN; alight, the shell burns whole until she sags) */   /* (claude/cqart) HOT: how much of her burn is left (the seams sink as it dies), and her stinger bare and glowing */
  if (m === 'fallen') { o.legs = 'upkick'; o.claw = 'airup'; o.tail = 'down'; o.back = true; }   /* (claude/cq3art) ON HER BACK, off her wall: belly bare, legs and claws at the air */
  /* (claude/cq3art) the stinger-broken stump, its reel and the DOUSED drip are gone (the stinger is never broken now); the wet shell stays for THE SLIP and the flood */
  if (S.charT > 0 && !(e.scorch > 0)) o.char = Math.min(1, S.charT / CQ.charT);
  if (S.pose === 'floor') o.floor = true;
  /* (claude/cq3art) THE TAIL ON THE FLOOR IS THE TARGET (B10): in every opening it lies flat to the stinger - tapered, gold-lit along its length, the stinger big (and the gold ring and its clock over it: src/cistern-queen-hands.js) */
  o.flip = V.sy < 0; if (o.tail === 'lance' && qOpen(e) && S.stinger) { o.flat = true; o.target = true; }
  /* THE ARMOURED STINGER: steel-capped while a blow on it is turned to CQ.tailMul (outside her openings, not HOT, not stuck in the floor); bare and gold when it pays */
  o.armour = !qOpen(e) && !stingerOut(S) && ((S.ward > 0) || (S.tipAct === S.act && (S.tipTaken || 0) >= (e.maxHp || 1) * CQ.tipCap - 0.01));   /* (claude/cisternqueen3: it pays whenever it is out - steel only in her ward, or once she has curled it away for this move) */
  /* THE PERCH: on THE WELLHEAD she is crouched on the beam, her knees up and wide, the toes hooked over its lip */
  if (S.pose === 'shaft' && !(e.gone > 0) && m !== 'leap' && m !== 'pounce' && m !== 'drop' && m !== 'fallen' && m !== 'soaked' && m !== 'thrash') { o.legs = 'perch'; o.walk = false; }
  /* STANDING, SHE BREATHES: a four-beat heave of the carapace (walking, clinging, hanging, getting up) */
  const idle = !moving && (m === 'walk' || m === 'cling' || m === 'hang' || m === 'recover' || m === 'planted' || m === 'stuck'), breath = idle ? 1 + 0.03 * [0, 1, 0, -1][Math.floor(time * 2.6 / (2 * Math.PI) * 4) % 4] : 1;
  g.save();
  /* her hall clips her: she comes out of a tunnel's mouth through the wall, and down into the sand under the floor line */
  const G = S.G; if (G) { g.beginPath(); g.rect(R(G.x0 - cx), R(G.vault - cy) - 400, R(G.x1 - G.x0), R(G.floor - G.vault) + 400 + (V.sink > 0.5 ? 0 : 40)); g.clip(); }
  /* (claude/queen4) S.view: floor / backed up her wall / hung in the shaft / on her back / rearing, eased between; her facing turned through a squash; sunk; gathered or thrust */
  g.translate(x + R(V.ox || 0), y + R(V.oy || 0)); g.translate(V.tx, V.ty + V.sink); g.rotate(V.rot); g.scale(V.sx * V.sc, V.sy * V.sc * breath);
  g.translate(4 * V.lean - 4 * V.crouch, 6 * V.crouch); g.rotate(0.04 * V.lean - 0.1 * V.crouch);
  drawBody(g, o);
  g.restore();
  /* the guard's spark: a blow turned on the claws */
  if (e.guardFx > 0) { g.fillStyle = '#fff6c8'; for (let i = 0; i < 4; i++) g.fillRect(x + face * (60 + i * 3), y - 50 - i * 5, 2, 2); }
}

/* THE HALL'S MACHINES */
export function drawWindlass(g, x, y, b, time) {
  fr(g, '#4a3424', x - 9, y - 20, 3, 20); fr(g, '#4a3424', x + 6, y - 20, 3, 20); fr(g, '#6a4a30', x - 8, y - 18, 16, 7); fr(g, '#c9b27c', x - 8, y - 16, 16, 2);
  const a = b.st === 'fall' ? time * 30 : b.st === 'down' ? time * 3 : 0; fr(g, '#2a1c12', x + 8 + R(Math.cos(a) * 3), y - 15 + R(Math.sin(a) * 3), 5, 2);
  ln(g, '#c9b27c', 1, [[x, y - 18], [x, y - 40]]);   /* its rope runs up to the vault's pulley */
  if (b.st === 'up') { fr(g, '#7ab8e8', x - 1, y - 26, 3, 3); }
}
/* (claude/cqart) THE BUCKET: a stave bucket with two iron hoops, a rope bail and the water in it - tipped about its west lip when it lands (the stream falls on the lintel; the stone's wet is drawWellhead's), then wound back up empty */
function bucketArt(g, mx, top, tilt, full, time) {
  g.save(); const px = mx - 10, py = top; g.translate(px, py); g.rotate(-tilt); g.translate(-px, -py);
  g.fillStyle = '#1c1108'; g.beginPath(); g.moveTo(mx - 11, top - 1); g.lineTo(mx + 11, top - 1); g.lineTo(mx + 8, top + 15); g.lineTo(mx - 8, top + 15); g.closePath(); g.fill();
  for (let i = 0; i < 4; i++) { const x = mx - 9 + i * 4.5; fr(g, i % 2 ? '#6a4428' : '#8a5a32', x, top, 4, 14); fr(g, '#a87a46', x, top, 1, 14); }
  fr(g, '#2a3038', mx - 10, top + 3, 20, 2); fr(g, '#8995a3', mx - 10, top + 3, 20, 1); fr(g, '#2a3038', mx - 9, top + 10, 18, 2); fr(g, '#56606c', mx - 9, top + 10, 18, 1);
  fr(g, '#a87a46', mx - 11, top - 2, 22, 2); fr(g, '#d8a868', mx - 11, top - 2, 22, 1);
  if (full > 0) { const h = Math.max(1, R(2 * full)); fr(g, '#2a5a8a', mx - 9, top - 1, 18, h + 1); fr(g, '#7ab8e8', mx - 9, top - 1, 18, 1); fr(g, '#e8f4f8', mx - 6 + R(Math.sin(time * 6) * 2), top - 1, 4, 1); }
  else { fr(g, '#120c06', mx - 9, top - 1, 18, 2); }
  ln(g, '#c9b27c', 1, [[mx - 10, top - 1], [mx - 6, top - 7], [mx, top - 9], [mx + 6, top - 7], [mx + 10, top - 1]]); fr(g, '#a87a46', mx - 2, top - 10, 4, 3);
  g.restore(); }
export function drawBucket(g, mx, vy, b, CQ, time, land) {   /* land: THE WELLHEAD's top - the bucket comes down onto its curb */
  const seat = land ? land - 6 - 16 : vy + 30, drop = seat - (vy - 60), k = b.st === 'fall' ? 1 - Math.max(0, b.t) / CQ.bucketFall : b.st === 'down' ? 1 : 0;
  const since = b.st === 'down' ? CQ.bucketCd - Math.max(0, b.t) : 99, up = b.st === 'down' ? 1 - b.t / CQ.bucketCd : 0;
  const top = b.st === 'down' ? vy - 60 + drop - up * drop : vy - 60 + k * drop;
  /* its rope, from the vault's pulley down to the bail; slack and swaying a little while it is up */
  ln(g, '#c9b27c', 1, [[mx, vy - 200], [mx + (b.st === 'up' ? R(Math.sin(time * 1.3)) : 0), top - 9]]);
  const tilt = since < 1.2 ? 1.15 * Math.sin(Math.PI * Math.min(1, since / 1.2) * 0.92) : 0, full = b.st === 'down' ? (since < 0.2 ? 1 : Math.max(0, 1 - (since - 0.2) / 0.7)) : 1;
  bucketArt(g, mx, R(top), tilt, full, time);
  if (b.st === 'fall') for (let i = 0; i < 3; i++) { const q = (time * 3 + i * 0.4) % 1; fr(g, '#7ab8e8', mx - 8 + i * 8, R(top) - 4 - R(q * 6), 1, 2); }   /* it slops as it drops */
  /* THE POUR: the stream off the west lip onto the lintel, and the splash where it lands */
  if (since > 0.1 && since < 0.95 && land) { const lx = mx - 10 - R(tilt * 3), ly = R(top) + R(tilt * 4), fall = land - ly;
    for (let i = 0; i < 9; i++) { const s = i / 8, wx = lx - 2 - s * 9, wy = ly + s * s * fall; fr(g, '#2a5a8a', R(wx) - 1, R(wy), 4, 3); fr(g, '#7ab8e8', R(wx), R(wy), 2, 3); fr(g, '#e8f4f8', R(wx), R(wy), 1, 1); }
    for (let i = 0; i < 6; i++) { const q = (time * 5 + i * 0.31) % 1; fr(g, i % 2 ? '#e8f4f8' : '#7ab8e8', lx - 11 + R((i - 2.5) * 5 * q), land - 1 - R(Math.sin(q * Math.PI) * 8), 1, 1); } }
}
/* (claude/cqart) THE WELLHEAD: her perch, dressed as what it is - a lintel of dressed stone across the sump (courses, joints, a rope groove worn at its middle, a drip-moulding under), a squat stone curb at its middle for the bucket to land on, and an iron frame over the curb with the pulley's sheave. The bucket comes down between the two cheek plates and TIPS its water over the curb's lip onto the lintel: it runs along the stone, darkens it, and drips off both edges. */
const WH = { top: '#cfae78', face: '#7c684c', faceD: '#5a4a34', joint: '#2a2016', mould: '#2c2218', mouldL: '#5a4630', relief: '#a58a5e', iron: '#2a3038', ironM: '#56606c', ironL: '#8995a3', ironH: '#d6e0ea', rope: '#c9b27c' };
export function drawWellhead(g, G, cx, cy, b, CQ, time) {
  const b0 = R(G.beam[0] - cx), b1 = R(G.beam[1] - cx), y0 = R(G.beamY - cy), mx = R(G.mid - cx), W = b1 - b0;
  const since = b.st === 'down' ? CQ.bucketCd - Math.max(0, b.t) : 99;   /* seconds since the bucket landed (99: it has not) */
  /* THE LINTEL: courses of dressed stone over the slab, the top lit, the joints dark, a carved lozenge on each block, the drip-moulding under */
  fr(g, WH.mould, b0 - 2, y0 + 7, W + 4, 3); fr(g, WH.mouldL, b0 - 2, y0 + 7, W + 4, 1); fr(g, '#16110b', b0 - 2, y0 + 9, W + 4, 1);
  fr(g, WH.face, b0, y0 + 1, W, 6); fr(g, WH.faceD, b0, y0 + 5, W, 2); fr(g, WH.top, b0, y0, W, 1); fr(g, '#e8d09a', b0 + 2, y0, W - 4, 1);
  for (let x = b0 + 24; x < b1 - 6; x += 32) { fr(g, WH.joint, x, y0 + 1, 1, 6); fr(g, '#8a7656', x + 1, y0 + 1, 1, 5); }
  for (let x = b0 + 8; x < b1 - 8; x += 32) { fr(g, WH.relief, x + 3, y0 + 3, 4, 1); fr(g, WH.faceD, x + 4, y0 + 4, 2, 1); }
  for (const [ex, d] of [[b0, 1], [b1, -1]]) { fr(g, WH.joint, ex + (d > 0 ? -2 : 0), y0, 2, 10); fr(g, WH.top, ex + (d > 0 ? -2 : 0), y0, 2, 1); }   /* the end blocks, keyed into the columns */
  fr(g, '#2a2016', mx - 3, y0 + 1, 6, 5); fr(g, '#3c3022', mx - 2, y0 + 1, 4, 3);   /* the groove the rope has worn at its middle */
  /* THE WET: the bucket's water running along the lintel, darkening the stone, its sheen, the runnels down the face, the drips off both edges - spreading for 1.3 s, drying away by ~6 */
  if (since < 6.5) { const sp = Math.min(1, since / 1.3), fade = Math.max(0, Math.min(1, (6.5 - since) / 3)), L = 8 + 36 * sp;
    for (const d of [-1, 1]) { const xa = d < 0 ? mx - 12 - L : mx + 12, wdt = L; g.globalAlpha = 0.45 * fade; fr(g, '#1c3a56', xa, y0 + 1, wdt, 6); g.globalAlpha = 0.9 * fade; fr(g, '#7ab8e8', xa, y0, wdt, 1); fr(g, '#d8eef8', xa + 2 + R(Math.sin(time * 5 + d) * 2), y0, 3, 1);
      for (let i = 0; i < 3; i++) { const rx = xa + 4 + i * (wdt / 3.4), k = (since * 0.7 + i * 0.3) % 1; g.globalAlpha = 0.8 * fade; fr(g, '#7ab8e8', R(rx), y0 + 1, 1, 6); fr(g, '#d8eef8', R(rx), y0 + 1 + R(k * 5), 1, 2); } }
    g.globalAlpha = 1;
    if (since < 5) for (const ex of [mx - 12 - L, mx + 12 + L - 1]) for (let i = 0; i < 3; i++) { const k = (since * 1.6 + i * 0.37) % 1, ox = Math.max(b0, Math.min(b1 - 1, R(ex))) + (i - 1) * 3; g.globalAlpha = (1 - k) * Math.min(1, fade * 2); fr(g, '#7ab8e8', ox, y0 + 10 + R(k * 34), 2, 3); fr(g, '#e8f4f8', ox, y0 + 10 + R(k * 34), 1, 1); }
    g.globalAlpha = 1; }
  /* THE CURB: a squat stone drum at the lintel's middle, an iron band round it, the bucket's seat */
  fr(g, '#1c150e', mx - 13, y0 - 7, 26, 7); fr(g, '#6e5c42', mx - 12, y0 - 6, 24, 6); fr(g, '#8a7656', mx - 12, y0 - 6, 24, 1); fr(g, WH.top, mx - 12, y0 - 7, 24, 1);
  fr(g, WH.faceD, mx - 12, y0 - 2, 24, 2); fr(g, WH.iron, mx - 12, y0 - 5, 24, 2); fr(g, WH.ironL, mx - 12, y0 - 5, 24, 1); for (const rx of [-9, -2, 5, 10]) fr(g, WH.ironH, mx + rx, y0 - 4, 1, 1);
  /* THE FRAME: two iron cheek plates, a cross-bar, the sheave between them turning with the rope */
  for (const sx of [-14, 12]) { fr(g, WH.iron, mx + sx, y0 - 30, 3, 24); fr(g, WH.ironL, mx + sx, y0 - 30, 1, 24); fr(g, WH.ironM, mx + sx + 2, y0 - 30, 1, 24); fr(g, WH.ironH, mx + sx, y0 - 8, 3, 1); }
  fr(g, WH.iron, mx - 16, y0 - 32, 32, 3); fr(g, WH.ironL, mx - 16, y0 - 32, 32, 1); fr(g, WH.iron, mx - 18, y0 - 30, 3, 2); fr(g, WH.iron, mx + 15, y0 - 30, 3, 2);
  const ang = b.st === 'fall' ? time * 9 : b.st === 'down' ? -time * 1.6 : time * 0.25, wy = y0 - 22;
  g.fillStyle = '#12161a'; g.beginPath(); g.arc(mx, wy, 7.5, 0, Math.PI * 2); g.fill(); g.fillStyle = WH.ironL; g.beginPath(); g.arc(mx, wy, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = WH.iron; g.beginPath(); g.arc(mx, wy, 4, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 4; i++) { const a = ang + i * Math.PI / 2; ln(g, WH.ironH, 1, [[mx + Math.cos(a) * 1.5, wy + Math.sin(a) * 1.5], [mx + Math.cos(a) * 5.2, wy + Math.sin(a) * 5.2]]); }
  fr(g, WH.ironH, mx - 1, wy - 1, 2, 2); fr(g, WH.ironH, mx - 6, wy - 5, 2, 1);
}
export function drawTunnels(g, x0, x1, fy, S, time) {
  for (const [x, d] of [[x0, 1], [x1, -1]]) { g.fillStyle = '#0a0808'; g.beginPath(); g.ellipse(x + d * 2, fy - 12, 10, 13, 0, 0, Math.PI * 2); g.fill(); fr(g, '#5a5048', x + d * 6 - (d < 0 ? 4 : 0), fy - 26, 4, 2); }
  /* THE AMBUSH'S TELL: dust trickles over the tunnel she will come out of */
  const e = S.cur; if (S.pose === 'tunnel' && e && e.side) { const x = e.side === 'W' ? x0 + 8 : x1 - 8; for (let i = 0; i < 8; i++) { const yy = fy - 60 + ((time * 70 + i * 9) % 50); fr(g, '#c9a46a', x + ((i * 5) % 9) - 4, yy, 1, 2); } }
}

/* OVER EVERYTHING: the water, the mound, her tells on the floor, what flies, the venom, the opening's clock */
export function drawOver(g, e, S, cx, cy, time, CQ) {
  const G = S.G, F = G.floor - cy, X = x => R(x - cx);
  /* THE FLOOD */
  if (S.water > 0.5) { const top = R(F - S.water); g.globalAlpha = 0.5; g.fillStyle = '#2a5a7a'; g.fillRect(X(G.x0), top, X(G.x1) - X(G.x0), R(S.water)); g.fillRect(X(G.sump[0]), R(F), X(G.sump[1]) - X(G.sump[0]), 32);
    g.globalAlpha = 0.85; g.fillStyle = '#7ab8e8'; for (let x = G.x0; x < G.x1; x += 6) g.fillRect(X(x), top + R(Math.sin(time * 4 + x * 0.1)), 4, 1); g.globalAlpha = 1;
    if (S.flood && S.water < CQ.waterH + 1) for (let i = 0; i < 10; i++) { const yy = G.vault + ((time * 260 + i * 37) % (G.floor - G.vault)); fr(g, '#7ab8e8', X(G.mid - 20 + i * 4), R(yy - cy), 2, 6); } }
  /* THE MOUND: her back moving under the sand (and a POUR marker over it while you carry water) */
  if (S.mound && S.pose === 'burrow') { const x = X(S.mound.x), hot = e.mode === 'strikeTell' || e.mode === 'chargeTell', bul = hot ? 6 + 3 * Math.sin(time * 20) : 3 + Math.sin(time * 8);
    g.fillStyle = '#b08a56'; g.beginPath(); g.ellipse(x, R(F), 26, bul + 4, 0, Math.PI, 0); g.fill(); g.fillStyle = '#d8b47a'; g.beginPath(); g.ellipse(x - 4, R(F - 2), 14, bul, 0, Math.PI, 0); g.fill();
    for (let i = 0; i < 5; i++) fr(g, '#d8b47a', x - 20 + ((time * 60 + i * 11) % 40), R(F - 6 - ((time * 30 + i * 7) % 8)), 1, 1);
    if (hot) { g.strokeStyle = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, R(F - 2), 30, 6, 0, 0, Math.PI * 2); g.stroke(); }
    fr(g, '#ffb84a', x + 10, R(F - bul - 6), 3, 3); }
  /* (claude/cq3art) THE BURST, TOLD: while she digs up to the spot the sand ripples out from it and cracks (the bulge above); the instant the window opens a WET RING the size of the splash
     zone lights on the sand with a water drop bobbing over it - THROW NOW - and it closes (greys, shrinks) as the window does. A pale ring is the sand; a BLUE one is the water's */
  { const w = burstAt(e, S), pre = e.mode === 'strikeTell' && S.cur && S.cur.x != null && S.pose === 'burrow';
    if (pre || w) { const wx = w ? w.x : S.cur.x, x = X(wx), fy = R(F), late = w && e.mode !== 'strikeTell', k = late ? Math.max(0, Math.min(1, (S.surfT || 0) / (CQ.strikeT + CQ.burstLate))) : 1;
      if (!w || !late) for (let j = 0; j < 3; j++) { const q = (time * 1.6 + j / 3) % 1; g.globalAlpha = (1 - q) * 0.7; g.strokeStyle = '#ead7a8'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, fy - 1, 8 + q * 30, 1.5 + q * 4, 0, 0, Math.PI * 2); g.stroke(); }
      g.globalAlpha = 0.8; g.fillStyle = '#6e5230'; for (const [dx, dy] of [[-17, 2], [-9, 0], [8, 1], [16, 3], [0, -1]]) { fr(g, x + dx, fy + dy - 1, 1, 2); fr(g, x + dx + (dx < 0 ? -1 : 1), fy + dy, 2, 1); }   /* the sand cracking over her back */
      if (w) { const pu = 0.5 + 0.5 * Math.sin(time * 18), RR = CQ.burstR * (0.55 + 0.45 * k), c1 = late ? '170,190,205' : '140,200,240';
        g.globalAlpha = (late ? 0.18 : 0.26) * k; g.fillStyle = 'rgb(' + c1 + ')'; g.beginPath(); g.ellipse(x, fy - 1, RR, 6, 0, 0, Math.PI * 2); g.fill();
        g.globalAlpha = (0.55 + 0.4 * pu) * (late ? 0.4 + 0.6 * k : 1); g.strokeStyle = late ? '#b8c8d4' : pu > 0.5 ? '#e8f4f8' : '#7ab8e8'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, fy - 1, RR, 6, 0, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 1; g.beginPath(); g.ellipse(x, fy - 1, RR * 0.62, 3.6, 0, 0, Math.PI * 2); g.stroke();
        if (!late) { const by = fy - 40 - R(Math.sin(time * 9) * 3), DROP = [[0, -1, 2], [1, -1, 2], [2, -2, 4], [3, -2, 4], [4, -3, 6], [5, -3, 6], [6, -4, 8], [7, -4, 8], [8, -4, 8], [9, -3, 6], [10, -2, 4]];   /* the drop, bobbing: THROW WATER HERE */
          g.globalAlpha = 1; for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) for (const [ry, rx, rw] of DROP) fr(g, '#0e1620', x + rx + ox, by + ry + oy, rw, 1);
          for (const [ry, rx, rw] of DROP) { fr(g, '#4a9ad8', x + rx, by + ry, rw, 1); if (rw > 2) fr(g, '#2a6aa8', x + rx + rw - 2, by + ry, 2, 1); } for (let r = 5; r <= 8; r++) fr(g, '#e8f4f8', x - 3, by + r, 1, 1); fr(g, '#e8f4f8', x - 2, by + 4, 1, 1);
          for (let c = 0; c < 3; c++) { const cy2 = by + 15 + c * 5 + R((time * 14) % 5); g.globalAlpha = c === 0 ? 0.35 : c === 1 ? 0.95 : 0.6; for (const [ox, oy, w] of [[-4, 0, 2], [-2, 1, 2], [0, 1, 2], [2, 0, 2]]) { fr(g, '#0e1620', x + ox - 1, cy2 + oy - 1, w + 2, 3); } for (const [ox, oy, w] of [[-4, 0, 2], [-2, 1, 2], [0, 1, 2], [2, 0, 2]]) fr(g, '#e8f4f8', x + ox, cy2 + oy, w, 1); } } }
      g.globalAlpha = 1; } }
  /* (claude/cq3art) THE SLIP, wet: the water she slipped on spreads under her for the opening - a dark sheen, rings that run out and fade */
  if (e.mode === 'slip' && e.open > 0) { const x = X(e.x), fy = R(F), age = CQ.slipT - e.open, sp = Math.min(1, age / 0.4), fade = Math.min(1, e.open / 1.2);
    g.globalAlpha = 0.4 * fade; g.fillStyle = '#1c3a56'; g.beginPath(); g.ellipse(x, fy, 20 + 46 * sp, 3.5, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.85 * fade; fr(g, '#7ab8e8', x - R(36 * sp), fy - 1, R(72 * sp), 1);
    for (let j = 0; j < 2; j++) { const q = (time * 0.9 + j * 0.5) % 1; g.globalAlpha = 0.6 * (1 - q) * fade; g.strokeStyle = '#9fd0ee'; g.beginPath(); g.ellipse(x, fy - 1, 24 + q * 34, 2 + q * 3, 0, 0, Math.PI * 2); g.stroke(); } g.globalAlpha = 1; }
  /* HER TELLS ON THE FLOOR */
  const cur = S.cur || {}, m = e.mode, blink = Math.floor(time * 12) % 2 ? '#ff6b6b' : '#fff6e0';
  if (m === 'lanceTell' && cur.x != null) { const x = X(cur.x), k = 1 - Math.max(0, e.modeT) / CQ.lanceTell; g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(x, R(F - 1), 16 - k * 8, 3, 0, 0, Math.PI * 2); g.stroke(); fr(g, '#ff6b6b', x - 1, R(F - 3), 2, 2); }
  if (m === 'sslamTell' && cur.x != null) { const x = X(cur.x), k = 1 - Math.max(0, e.modeT) / CQ.sslamTell; g.strokeStyle = blink; g.lineWidth = 2; g.beginPath(); g.ellipse(x, R(F - 1), CQ.slamR + 6 - k * 8, 5, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;   /* (claude/underwell3) THE STINGER SLAM's spot: red, the width of the blow */
    g.globalAlpha = 0.25 + 0.4 * k; g.fillStyle = '#ff6b6b'; g.beginPath(); g.ellipse(x, R(F - 1), (CQ.slamR - 4) * k + 4, 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; fr(g, '#ff6b6b', x - 1, R(F - 14), 2, 8); fr(g, '#ff6b6b', x - 1, R(F - 4), 2, 2); }
  if (m === 'pinTell' && cur.x != null) { g.strokeStyle = 'rgba(255,107,107,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X(e.x), R(e.y - 50 - cy)); g.lineTo(X(cur.x), R(cur.y - 8 - cy)); g.stroke(); g.strokeStyle = blink; g.beginPath(); g.ellipse(X(cur.x), R(G.floor - 1 - cy), 20, 4, 0, 0, Math.PI * 2); g.stroke(); }
  if (m === 'pounceTell' && cur.x != null) { const k = 1 - Math.max(0, e.modeT) / CQ.pounceTell; g.globalAlpha = 0.25 + 0.45 * k; g.fillStyle = '#1a1210'; g.beginPath(); g.ellipse(X(cur.x), R(F), 10 + k * CQ.pounceR, 3 + k * 3, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(X(cur.x), R(F), CQ.pounceR, 5, 0, 0, Math.PI * 2); g.stroke(); }
  if ((m === 'sweepLowTell' || m === 'sweepHighTell') ) { const hi = m === 'sweepHighTell', y = R(F - (hi ? 22 : 6)); g.globalAlpha = 0.35 + 0.3 * Math.abs(Math.sin(time * 14)); g.fillStyle = hi ? '#ffb84a' : '#ff6b6b'; g.fillRect(X(G.x0), y - 1, X(G.x1) - X(G.x0), 3); g.globalAlpha = 1; }
  if (m === 'tidalTell') { const fx = e.face || 1, x0 = fx > 0 ? e.x : e.x - CQ.tidalReach, x1 = fx > 0 ? e.x + CQ.tidalReach : e.x; g.globalAlpha = 0.3 + 0.3 * Math.abs(Math.sin(time * 14)); g.fillStyle = '#a6e04a'; g.fillRect(X(x0), R(F - 22), X(x1) - X(x0), 3); g.globalAlpha = 1; }
  if (m === 'grabTell') { const fx = e.face || 1, x = X(e.x + fx * (CQ.w / 2 + CQ.grabReach)); g.strokeStyle = blink; g.lineWidth = 1; g.beginPath(); g.ellipse(x, R(F - 1), 14, 3, 0, 0, Math.PI * 2); g.stroke(); }
  /* (claude/queen4, Daniel 10-07) THE VENOM BLOOM: told - the ring it will fill, blinking on the water, its two edges posted; spreading - the green slick growing from the
     stinger with its bright edge running out toward the ring; blooming - venom thrown up across the whole ring; then it thins away */
  if (S.bloom) { const b = S.bloom, bx = X(b.x), fy = R(F - Math.min(S.water || 0, 14)), RR = b.R, gb = Math.floor(time * 12) % 2 ? '#a6e04a' : '#ff6b6b';
    const fade = b.st === 'fade' ? Math.max(0, (b.t || 0) / 0.5) : 1;
    if (b.st !== 'fade') { g.strokeStyle = gb; g.lineWidth = 1; g.setLineDash([4, 3]); g.beginPath(); g.ellipse(bx, fy, RR, 5, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
      for (const sx of [-1, 1]) { fr(g, gb, bx + sx * RR - 1, fy - 12, 2, 12); fr(g, '#fff6e0', bx + sx * RR - 1, fy - 13, 2, 2); } }
    if (b.st !== 'told') { const r = b.st === 'spread' ? Math.max(3, RR * b.k) : RR;
      g.globalAlpha = 0.5 * fade; g.fillStyle = QC.venomD; g.beginPath(); g.ellipse(bx, fy, r, 3 + 2 * Math.min(1, r / RR), 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.65 * fade; g.fillStyle = QC.venom; g.beginPath(); g.ellipse(bx, fy - 1, r * 0.8, 2 + Math.min(1, r / RR), 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = fade;
      if (b.st === 'spread') { g.strokeStyle = '#eaffb0'; g.lineWidth = 2; g.beginPath(); g.ellipse(bx, fy, r, 3 + 2 * Math.min(1, r / RR), 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
        for (const sx of [-1, 1]) fr(g, '#eaffb0', bx + sx * r - 1, fy - 5, 2, 5); }
      for (let i = 0; i < 6; i++) { const px = bx + Math.sin(i * 2.1 + time * 3) * r * 0.8, py = fy - 2 - ((time * 20 + i * 5) % 6); fr(g, '#d6f8a0', R(px), R(py), 2, 2); }
      if (b.st === 'burst') for (let x0 = -RR; x0 <= RR; x0 += 7) { const h = R(10 + 18 * Math.abs(Math.sin(time * 30 + x0 * 0.3))); fr(g, QC.venomD, bx + x0 - 1, fy - h, 4, h); fr(g, QC.venom, bx + x0, fy - h, 2, h - 2); fr(g, '#eaffb0', bx + x0, fy - h, 2, 2); }
      g.globalAlpha = 1; } }
  /* THE BANDS: a dune wave, the tail's sweep, the thrash's waves */
  for (const b of S.bands) { const x = X(b.x), y0 = R(b.y[0] - cy), y1 = R(b.y[1] - cy);
    const col = b.k === 'dune' ? '#d8b47a' : b.k === 'wave' ? '#7ab8e8' : b.k === 'tailHigh' ? '#ffb84a' : '#c9a46a';
    g.fillStyle = col; g.beginPath(); g.moveTo(x - b.dir * 22, y1); g.quadraticCurveTo(x - b.dir * 4, y0 - 2, x + b.dir * 6, y1); g.fill();
    if (b.k === 'tailHigh' || b.k === 'tailLow') { fr(g, '#ffb84a', x - 2, y0, 4, y1 - y0); fr(g, '#fff2c0', x - 1, y0 + 1, 2, 2); }
    for (let i = 0; i < 4; i++) fr(g, '#e8f4f8', x - b.dir * (8 + i * 5), y0 + ((i * 3) % 6), 1, 1); }
  /* THE RUBBLE: a shadow growing where each stone will land, then the stone */
  for (const r of S.rubble) { const y = r.ledge ? G.ledgeY : G.floor, k = Math.max(0, Math.min(1, 1 - r.t / CQ.rubbleFall));
    if (!r.landed) { g.globalAlpha = 0.2 + 0.5 * k; g.fillStyle = '#100a08'; g.beginPath(); g.ellipse(X(r.x), R(y - cy), 6 + k * CQ.rubbleR, 2 + k * 2, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      const ry = r.y0 + (y - r.y0) * k * k; fr(g, '#6a7480', X(r.x) - 6, R(ry - cy) - 10, 12, 10); fr(g, '#9aa4ae', X(r.x) - 6, R(ry - cy) - 10, 12, 2); } }
  /* WHAT FLIES: sand stones, venom globs */
  for (const s of S.shots) { if (s.k === 'venom') { fr(g, QC.venomD, X(s.x) - 3, R(s.y - cy) - 3, 6, 6); fr(g, QC.venom, X(s.x) - 2, R(s.y - cy) - 2, 3, 3); } else { fr(g, '#8a6a3e', X(s.x) - 2, R(s.y - cy) - 2, 4, 4); fr(g, '#d8b47a', X(s.x) - 2, R(s.y - cy) - 2, 2, 1); } }
  for (const p of S.puddles) { g.globalAlpha = Math.min(1, p.t); g.fillStyle = QC.venomD; g.beginPath(); g.ellipse(X(p.x), R(F - 1), 15, 3, 0, 0, Math.PI * 2); g.fill(); fr(g, QC.venom, X(p.x) - 8 + R(Math.sin(time * 3 + p.x) * 3), R(F - 2), 3, 1); g.globalAlpha = 1; }
  /* HER CLAW holding you: the line of her arm */
  if (S.claw && S.claw.caught) { fr(g, '#ffd36b', X(S.claw.x) - 1, R(F - 40), 2, 6); }
  /* HER OPENING, said over her with its clock */
  if (e.open > 0) { const x = X(e.x), y = R(e.y - 92 - cy), k = Math.max(0, e.open / CQ.openT); g.fillStyle = '#1b1626'; g.fillRect(x - 20, y, 40, 3); g.fillStyle = '#8fd160'; g.fillRect(x - 20, y, R(40 * k), 3); }
}

/* ---------- (claude/cq3art) THE WATER JARS, THE RACK, THE SHATTER, THE OIL'S GLOW, THE TARGET'S CUE (src/cistern-queen-hands.js drawOver calls these) ---------- */
const CL = { out: '#2a1810', base: '#a8603a', shade: '#7a4228', lite: '#d89a62', rim: '#e8b878', band: '#4a2a18', tick: '#e8c27a', water: '#7ab8e8', waterD: '#3a7ab8', white: '#e8f4f8' };
/* A WATER JAR: a clay amphora, 13 x 17 - a round belly, a banded shoulder, two handles, a lipped neck, the water lit at the brim. (x, y) = the bottom middle; ang tumbles it in flight */
export function drawJarArt(g, x, y, o = {}) {
  const full = o.full !== false, t = o.t || 0; g.save(); g.translate(R(x), R(y)); if (o.ang) { g.translate(0, -8); g.rotate(o.ang); g.translate(0, 8); }
  ell(g, CL.out, 0, -6.5, 7.5, 7); ell(g, CL.base, 0, -6.5, 6.4, 6); ell(g, CL.shade, 2, -5, 4.2, 4.6); ell(g, CL.lite, -2.4, -8, 1.8, 2.6);   /* the belly: dark edge, clay, shade, a lit shoulder */
  fr(g, CL.out, -4, -15, 8, 6); fr(g, CL.base, -3, -15, 6, 6); fr(g, CL.shade, 1, -15, 2, 6); fr(g, CL.lite, -3, -14, 1, 5);   /* the neck */
  fr(g, CL.out, -5, -18, 10, 4); fr(g, CL.rim, -4, -18, 8, 2); fr(g, CL.base, -4, -16, 8, 1);   /* the lip */
  fr(g, CL.out, -9, -13, 3, 6); fr(g, CL.shade, -8, -12, 1, 4); fr(g, CL.out, 6, -13, 3, 6); fr(g, CL.shade, 7, -12, 1, 4); fr(g, CL.base, -8, -13, 2, 1); fr(g, CL.base, 6, -13, 2, 1);   /* the handles */
  fr(g, CL.band, -6, -8, 12, 2); for (let i = 0; i < 4; i++) fr(g, CL.tick, -5 + i * 3, -8, 1, 1);   /* the painted band */
  if (full) { fr(g, CL.waterD, -3, -18, 6, 1); fr(g, CL.water, -3, -19, 6, 1); fr(g, CL.white, -2 + R(Math.sin(t * 6) * 1.5), -19, 2, 1);   /* the water at the brim */
    if (o.slosh) { const k = (t * 3) % 1; g.globalAlpha = 1 - k; fr(g, CL.water, 3 + k * 3, -21 - k * 2, 1, 2); g.globalAlpha = 1; } }
  g.restore(); }
/* THE RACK: a squat stone block, an iron cradle (two uprights, a strap, rivets) and the spring's brass nozzle above it - full: the jar sits in it, lit; empty: the nozzle drips
   and a ghost of the jar fills up. r = { full, t }, y = the floor */
export function drawRack(g, x, y, r, time, back, glint) {
  fr(g, '#16110b', x - 14, y - 6, 28, 6); fr(g, '#6e5c42', x - 13, y - 5, 26, 5); fr(g, '#a58a5e', x - 13, y - 5, 26, 1); fr(g, '#4a3c2a', x - 13, y - 1, 26, 1); fr(g, '#2a2016', x - 1, y - 5, 1, 4); fr(g, '#8a7656', x, y - 5, 1, 3);   /* the block: a lit top, a dark foot, a joint */
  for (const s of [-1, 1]) { const ux = x + s * 8 - (s < 0 ? 1 : 0); fr(g, '#2a3038', ux, y - 17, 3, 12); fr(g, '#8995a3', ux + (s < 0 ? 0 : 2), y - 17, 1, 12); fr(g, '#d6e0ea', ux + 1, y - 17, 1, 1); }   /* the uprights */
  fr(g, '#2a3038', x - 9, y - 9, 18, 2); fr(g, '#8995a3', x - 9, y - 9, 18, 1); fr(g, '#d6e0ea', x - 7, y - 9, 1, 1); fr(g, '#d6e0ea', x + 6, y - 9, 1, 1);   /* the strap and its rivets */
  fr(g, '#2a3038', x - 12, y - 24, 9, 3); fr(g, '#56606c', x - 12, y - 24, 9, 1); fr(g, '#2a3038', x - 6, y - 21, 3, 3); fr(g, '#b8903a', x - 5, y - 21, 1, 3); fr(g, '#e8c27a', x - 5, y - 21, 1, 1);   /* the spring's pipe and its brass nozzle */
  if (r.full) { drawJarArt(g, x, y - 5, { t: time + x * 0.01 });
    if (glint) { const k = (time * 0.9 + x * 0.013) % 1;   /* a glint runs over the clay, then a twinkle at the brim */
      if (k < 0.3) { const gx = x - 6 + R(k / 0.3 * 12); g.globalAlpha = 0.85; fr(g, '#ffffff', gx, y - 15 + R(k / 0.3 * 6), 1, 3); g.globalAlpha = 1; }
      if (k > 0.3 && k < 0.5) { const q = (k - 0.3) / 0.2, s = q < 0.5 ? q * 2 : 2 - q * 2; fr(g, '#ffffff', x + 1, y - 24, 1, 1 + R(s * 4)); fr(g, '#ffffff', x - R(s * 2), y - 23, 1 + R(s * 4), 1); }
      g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.1 + 0.05 * Math.sin(time * 3 + x); g.fillStyle = '#7ab8e8'; g.beginPath(); g.ellipse(x, y - 12, 16, 12, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; } }
  else { const k = Math.max(0, Math.min(1, 1 - r.t / (back || 4))); g.globalAlpha = 0.28; drawJarArt(g, x, y - 5, { full: false, t: time }); g.globalAlpha = 1;
    fr(g, CL.out, x - 8, y - 13, 16, 2); fr(g, CL.water, x - 8, y - 12, R(16 * k), 1);   /* the jar filling: a line of water under the lip */
    const d = (time * 2.2) % 1; fr(g, CL.water, x - 5, y - 20 + R(d * 14), 1, 2); fr(g, CL.white, x - 5, y - 20 + R(d * 14), 1, 1);   /* a drop falling from the nozzle */ } }
/* THE SHATTER: the jar bursts on the stone - a white-blue flash, a ring running out along the floor, spray thrown up in arcs, clay shards tumbling down, then the wet dark where it fell.
   f = { x, y, t (0..1) } y = where it burst; fy = the floor under it (the shards come to rest there) */
export function drawShatter(g, f, cx, cy, fy) {
  const a = f.t, X0 = f.x - cx, Y0 = f.y - cy, FY = (fy != null ? fy : f.y) - cy, soft = !!f.soft;
  if (a < 0.12) { g.globalAlpha = 1 - a / 0.12; g.fillStyle = '#e8f4f8'; g.beginPath(); g.arc(R(X0), R(Y0 - 4), soft ? 6 : 11 * (0.5 + a / 0.12 * 0.5), 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
  g.globalAlpha = 0.45 * (1 - a); g.fillStyle = '#1c3a56'; g.beginPath(); g.ellipse(R(X0), R(FY), 8 + a * 22, 2 + a * 2, 0, 0, Math.PI * 2); g.fill();   /* the wet it leaves */
  g.globalAlpha = 1 - a; g.strokeStyle = '#e8f4f8'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(R(X0), R(FY - 1), 6 + a * 46, 1.5 + a * 6, 0, 0, Math.PI * 2); g.stroke(); g.strokeStyle = '#7ab8e8'; g.beginPath(); g.ellipse(R(X0), R(FY - 1), 3 + a * 30, 1 + a * 4, 0, 0, Math.PI * 2); g.stroke(); g.lineWidth = 1;
  const n = soft ? 6 : 14; for (let i = 0; i < n; i++) { const an = (i / n) * Math.PI * 0.9 + 0.1 * Math.PI, sp = 55 + (i * 37 % 40), dxx = Math.cos(an) * sp * (i % 2 ? 1 : -1), tt = a * 0.9, px = X0 + dxx * tt, py = Y0 - Math.sin(an) * sp * tt * 1.15 + 160 * tt * tt;
    if (py > FY) continue; g.globalAlpha = 1 - a * 0.8; fr(g, i % 3 ? CL.water : CL.white, px, py, 2, 2); fr(g, CL.waterD, px, py + 2, 1, 1); }
  if (!soft) for (let i = 0; i < 7; i++) { const an = (i / 7) * Math.PI * 0.8 + 0.1 * Math.PI, sp = 40 + (i * 29 % 30), dxx = Math.cos(an) * sp * (i % 2 ? 1 : -1), tt = Math.min(a * 0.9, 0.55), px = X0 + dxx * tt, py = Math.min(FY - 1, Y0 - Math.sin(an) * sp * tt * 0.9 + 190 * tt * tt);
    g.globalAlpha = 1 - Math.max(0, a - 0.6) / 0.4; fr(g, CL.out, px - 1, py - 1, 4, 3); fr(g, i % 2 ? CL.base : CL.shade, px, py, 3, 2); fr(g, CL.lite, px, py, 1, 1); }   /* the shards: dark-edged clay, the lit face up */
  g.globalAlpha = 1; }
/* THE OIL'S GLOW (it will catch: SET HER ALIGHT): over the pool's top, a warm light, a shimmer running along it, heat-wisps and an ember lifting off - drawn per 16 px cell */
export function drawOilGlow(g, x, y, time, p, seed) {
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.14 + 0.1 * p; g.fillStyle = '#ff7a22'; g.beginPath(); g.ellipse(R(x + 8), R(y - 1), 13, 4.5, 0, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over';
  g.globalAlpha = 0.55 + 0.3 * p; fr(g, '#ffb070', x, y - 2, 16, 1);
  const k = (time * 0.7 + seed * 0.37) % 1; g.globalAlpha = 0.9 * Math.sin(k * Math.PI); fr(g, '#ffe6b8', x + R(k * 13), y - 3, 3, 1);   /* the shimmer sliding along it */
  const w = (time * 0.9 + seed * 0.21) % 1; if ((seed + Math.floor(time * 0.9 + seed * 0.21)) % 3 === 0) { g.globalAlpha = 0.9 * (1 - w); fr(g, '#ffcf80', x + 4 + (seed * 5) % 8 + R(Math.sin(w * 6) * 1.5), y - 4 - R(w * 14), 1, 1); }   /* an ember lifting off */
  g.globalAlpha = 1; }
/* THE TARGET'S CUE on the stinger of an OPENING (B10): a gold light on the floor under it and a bobbing gold arrow over it, pointing down - STRIKE HERE (the ring and the clock are the hands'). x, y = the stinger on screen */
export function drawTargetCue(g, x, y, fy, time, p) {
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.26 + 0.14 * p; g.fillStyle = '#ffc85a'; g.beginPath(); g.ellipse(R(x), R(fy - 1), 34, 5, 0, 0, Math.PI * 2); g.fill(); g.globalAlpha = 0.12 + 0.08 * p; g.beginPath(); g.ellipse(R(x), R(fy - 1), 52, 7, 0, 0, Math.PI * 2); g.fill(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  const by = R(y - 32 - Math.sin(time * 8) * 3); fr(g, '#1b1626', x - 7, by - 1, 14, 4); fr(g, '#1b1626', x - 5, by + 3, 10, 2); fr(g, '#1b1626', x - 3, by + 5, 6, 2); fr(g, '#1b1626', x - 1, by + 7, 2, 2);   /* the arrow: dark edge, gold body, a white lit edge */
  fr(g, '#ffd36b', x - 6, by, 12, 2); fr(g, '#ffd36b', x - 4, by + 2, 8, 2); fr(g, '#ffd36b', x - 2, by + 4, 4, 2); fr(g, '#ffd36b', x - 1, by + 6, 2, 1); fr(g, '#fff6c8', x - 6, by, 12, 1); }

/* THE SPRITE SET for the bestiary card and the body she leaves: her body drawn into canvases (frame 0 standing in guard, 1 rearing, 2 on her back) */
export const CQ_F = { stand: 0, rear: 1, dead: 2 };
let SET = null;
export function bakeCisternQueen() {
  if (SET) return SET;
  const W = 200, H = 130, ax = 100, ay = 124;
  const F = [0, 1, 2].map(f => { const [c, g] = canvas(W, H); g.save(); g.translate(ax, ay);
    if (f === 1) { g.translate(-10, 0); g.rotate(-0.5); drawBody(g, { t: 0.3, claw: 'up', legs: 'kick' }); }
    else if (f === 2) { g.translate(0, -38); g.scale(1, -1); drawBody(g, { t: 0.3, claw: 'airup', legs: 'upkick', tail: 'down', back: true }); }
    else drawBody(g, { t: 0.3, claw: 'guard', legs: 'still' });
    g.restore(); outline(c, OUT); return c; });
  SET = { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax, ay, w: CQ_W, h: CQ_H };
  return SET;
}
const CQ_W = 76, CQ_H = 38;
