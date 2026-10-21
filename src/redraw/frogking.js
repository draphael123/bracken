// frogking.js — the Bullfrog King, redrawn at native size (the old 40x17 grid was scaled 1.35x in the draw, which
// smeared the pixels and left him squat). Side-on, facing RIGHT (L is the flip): a hunched bullfrog with a gold crown
// behind the eye, a short red mantle over the back, a pale throat sac, a folded hind leg and a planted forearm.
//   frames: 0 sit, 1 croak (sac blown up), 2 maw open (tongue / breath in), 3 crouch (squashed, about to leap),
//           4 rising (stretched, legs trailing), 5 falling (legs reaching down), 6 dazed (flat on the boards, tongue out)
//           (claude/marsh2, greybox poses for the ART lane to redraw - B16, each new move its own windup and release):
//           7 the grab's windup (head low, maw open), 8 the tongue out (lunging), 9 the belly-flop's rear-up, 10 flat on his belly,
//           11 cheeks full of flies, 12 the flies spat, 13 the throat swelling for the ripple, 14 the ripple let go, 15 a hand raised
//           over the water, 16 the slap, 17 his eye on the flies (the snap's windup), 18 the spit's windup, 19 the spit let go (claude/frogking2)
//   canvas 64x58 (claude/marsh2art: 12 rows of headroom for the rear-up and the raised hand), every frame the same size and anchor: ax 30, ay 56 (toes on ay-1), so no frame floats or sinks.
//   marsh2art: poses 7-17 are redrawn with their own bodies - rot (the rear-up), a raised/slammed arm with a webbed hand, flies, sound arcs, mud and spray (see fx).
import { canvas, px, rect, line, circle, ellipse, fillPoly, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const C = {
  F: '#5a9a3a', D: '#3a6a2a', DD: '#284a1e', L: '#8fc85a', LL: '#c0e890',
  B: '#e4e6ac', Bs: '#b4b87a', y: '#e0b040', Y: '#fff1a0', yd: '#9a7020', gem: '#c9463d',
  r: '#b03a34', R: '#7a2426', k: '#f0e6c8', ks: '#b8ac90', maw: '#4a1a22', tg: '#ff7a9a', tgL: '#ffb0c0', iris: '#f08a2a',
};
const W = 64, PADT = 12, H = 46 + PADT, GY = 43 + PADT; // GY: the row the toes stand on

// draw a shaded blob on its own layer so highlight and shadow stay inside it
function blob(g, cx, cy, rx, ry, base, hi, lo) {
  const [c, q] = canvas(W, H);
  ellipse(q, cx, cy, rx, ry, base);
  q.globalCompositeOperation = 'source-atop';
  if (hi) ellipse(q, cx - rx * 0.1, cy - ry * 0.75, rx * 0.8, ry * 0.45, hi);
  if (lo) ellipse(q, cx + rx * 0.05, cy + ry * 0.8, rx * 0.95, ry * 0.45, lo);
  g.drawImage(c, 0, 0);
}
const limb = (g, x0, y0, x1, y1, t, col, edge) => { line(g, x0, y0, x1, y1, col, t); if (edge) line(g, x0, y0 + t - 1, x1, y1 + t - 1, edge, 1); };
const toes = (g, x, y, dir, col, tip) => { for (let i = 0; i < 3; i++) { px(g, x + dir * i * 2, y, col); px(g, x + dir * i * 2 + dir, y, col); if (tip) px(g, x + dir * i * 2 + dir, y, tip); } };

const FLY = (g, x, y, k = 0) => { px(g, x, y, '#1a1a14'); px(g, x + 1, y, '#1a1a14'); px(g, x + (k & 1 ? -1 : 2), y - 1, '#cfe8ff'); px(g, x + (k & 1 ? 2 : -1), y - 1, '#8fb0c8'); };   /* a fly: a dark body, two pale wing pixels */
const hand = (g, x, y, up) => { /* a webbed hand: a round palm, three stout fingers with pale pads, a dark web between them */
  const d = up ? -1 : 1; rect(g, x - 4, up ? y - 4 : y + 1, 9, 3, C.D); ellipse(g, x, y, 4, 2.6, C.F); ellipse(g, x - 0.5, y - d * 1.2, 2.6, 1, C.L);
  for (const k of [-3, 0, 3]) { rect(g, x + k - 1, up ? y - 6 : y + 1, 2, 5, C.F); px(g, x + k - 1, up ? y - 6 : y + 5, C.L); px(g, x + k, up ? y - 6 : y + 5, C.L); px(g, x + k + 1 - (k > 0 ? 0 : 1), up ? y - 3 : y + 2, C.D); } };
const arc = (g, cx, cy, r, a0, a1, c) => { for (let a = a0; a <= a1; a += 0.12) px(g, Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), c); };
const drops = (g, pts, c = '#bfe6f5') => { for (const [x, y] of pts) { px(g, x, y, c); px(g, x, y - 1, '#ffffff'); } };

function frame(o) {
  const [c, g] = canvas(W, H);
  const sy = (o.sy || 1) * 1.16, sx = o.sx || 1, lift = o.lift || 0;
  const X = x => 30 + (x - 30) * sx, Y = y => GY - (43 - y) * sy - lift;

  // far limbs, behind everything
  if (o.legs === 'sit' || o.legs === 'crouch') { rect(g, X(22), GY - 1, 9, 2, C.DD); toes(g, X(30), GY, 1, C.DD); }
  if (o.arms === 'up') { limb(g, X(40), Y(30), X(50), Y(18), 2, C.DD); }
  else if (o.arms !== 'none') { const ax = o.arms === 'fwd' ? X(53) : o.arms === 'down' ? X(51) : o.arms === 'splay' ? X(56) : X(42), ay = o.arms === 'fwd' ? Y(35) : o.arms === 'splay' ? GY : o.arms === 'down' ? GY - lift * 0.3 : GY; limb(g, X(40), Y(33), ax - 2, ay, 2, C.DD); }

  // hind leg (near side): the thigh is a big folded oval, the foot runs forward under the belly
  const leg = () => {
    if (o.legs === 'sit') { blob(g, X(15), Y(34), 9 * sx, 7 * sy, C.F, C.L, C.D); rect(g, X(10), GY - 2, 20, 3, C.D); rect(g, X(12), GY - 2, 14, 1, C.F); toes(g, X(29), GY, 1, C.D, C.L); }
    else if (o.legs === 'crouch') { blob(g, X(14), Y(35), 10 * sx, 7 * sy, C.F, C.L, C.D); rect(g, X(6), GY - 2, 24, 3, C.D); rect(g, X(8), GY - 2, 18, 1, C.F); toes(g, X(29), GY, 1, C.D, C.L); }
    else if (o.legs === 'trail') { blob(g, X(13), Y(32), 8, 6, C.F, C.L, C.D); limb(g, X(9), Y(36), X(2), GY - 3, 3, C.F, C.D); limb(g, X(3), GY - 3, X(1), GY, 2, C.D); toes(g, X(0), GY, 1, C.D, C.L); }
    else if (o.legs === 'reach') { blob(g, X(16), Y(33), 8, 6, C.F, C.L, C.D); limb(g, X(16), Y(37), X(20), GY - 2, 3, C.F, C.D); rect(g, X(17), GY - 1, 8, 2, C.D); toes(g, X(24), GY, 1, C.D, C.L); }
    else if (o.legs === 'splay') { blob(g, X(12), Y(36), 10, 5 * sy, C.F, C.L, C.D); rect(g, X(0), GY - 1, 14, 2, C.D); toes(g, X(0), GY, -1, C.D, C.L); }
  };

  // body and head, one silhouette, shaded on its own layer
  const [bc, bq] = canvas(W, H);
  ellipse(bq, X(27), Y(31), 18 * sx, 11 * sy, C.F);
  ellipse(bq, X(42), Y(24.5) - (o.tilt || 0), 13 * sx, 9.5 * sy, C.F);
  circle(bq, X(46), Y(16.5) - (o.tilt || 0), 5, C.F); // the eye bump
  bq.globalCompositeOperation = 'source-atop';
  ellipse(bq, X(30), Y(22), 17 * sx, 4 * sy, C.L); // back and brow catch the light
  ellipse(bq, X(45), Y(13) - (o.tilt || 0), 3, 1.4, C.LL);
  ellipse(bq, X(20), Y(40), 15 * sx, 5 * sy, C.D); // shadow under the haunch
  ellipse(bq, X(41), Y(39), 14 * sx, 6.5 * sy, C.B); // the pale belly and jaw
  ellipse(bq, X(38), Y(43), 12 * sx, 3 * sy, C.Bs);
  for (const [sx0, sy0, rr] of [[17, 27, 1.8], [23, 24.5, 1.4], [13, 32, 1.5], [29, 28, 1.2], [21, 31, 1.1]]) circle(bq, X(sx0), Y(sy0), rr, C.D); // warts
  bq.globalCompositeOperation = 'source-over';
  g.drawImage(bc, 0, 0);
  leg();

  const hy = o.tilt || 0;
  // the eardrum: a dark ring behind the eye, a bullfrog's tell
  circle(g, X(36), Y(25) - hy * 0.5, 2.8, C.D); circle(g, X(36), Y(25) - hy * 0.5, 1.6, C.F); px(g, X(35), Y(24) - hy * 0.5, C.L);

  // mouth
  if (o.mouth) { // agape: the maw drops open under the snout, the tongue lies in it
    fillPoly(g, [[X(33), Y(29)], [X(56.5), Y(26.5) - hy], [X(55), Y(36)], [X(40), Y(33)]], C.maw);
    fillPoly(g, [[X(40), Y(33)], [X(54), Y(35)], [X(52), Y(33)], [X(44), Y(31.5)]], C.tg);
    line(g, X(44), Y(32), X(51), Y(33), C.tgL);
    line(g, X(36), Y(29) - hy * 0.5, X(55), Y(26.5) - hy, C.DD); // upper lip
  } else {
    line(g, X(34), Y(30.5), X(37), Y(29), C.DD); line(g, X(37), Y(29), X(55), Y(27.5), C.DD); line(g, X(38), Y(30), X(54), Y(28.5), C.Bs);
  }

  // cheeks full of flies (the swarm's windup)
  if (o.cheeks) { blob(g, X(50), Y(30), 6, 4.5, C.L, C.LL, C.F); for (const [fx, fy] of [[48, 29], [52, 31], [50, 27]]) px(g, X(fx), Y(fy), '#1a1a14'); }
  // throat sac
  if (o.sac === 'big') { blob(g, X(46), Y(36), 14, 10, C.B, '#fbfbe0', C.Bs); ellipse(g, X(42), Y(31), 4, 2, '#ffffff'); line(g, X(36), Y(40), X(56), Y(40), C.Bs); }
  else if (o.sac) { blob(g, X(46), Y(37), 10.5, 7.5, C.B, '#fbfbe0', C.Bs); ellipse(g, X(43), Y(33.5), 3, 1.5, '#ffffff'); }
  else if (!o.mouth) { ellipse(g, X(46), Y(33.5), 6, 2.2, C.B); line(g, X(41), Y(35), X(51), Y(35), C.Bs); }

  // eye: gold iris, a flat frog's pupil, a heavy brow
  const ey = Y(16.5) - hy;
  if (o.eyes === 'shut') { line(g, X(43), ey, X(48), ey + 1, C.DD); line(g, X(43), ey - 1, X(47), ey - 1, C.D); }
  else if (o.eyes === 'wide') { circle(g, X(46.5), ey, 4.9, C.DD); circle(g, X(46.5), ey, 4.2, '#fff7d0'); circle(g, X(46.5), ey, 3.0, C.iris); rect(g, X(46), ey - 1.5, 1.6, 3.4, OUT); px(g, X(47.5), ey - 2, '#ffffff'); line(g, X(42), ey - 6, X(50), ey - 6.5, C.DD); }
  else if (o.eyes === 'narrow') { circle(g, X(46.5), ey, 3.9, C.DD); rect(g, X(43), ey - 1.6, 8, 3.4, C.iris); rect(g, X(43), ey - 0.4, 8, 1.2, OUT); line(g, X(42), ey - 3.2, X(50), ey - 1.4, C.DD, 2); }
  else { circle(g, X(46.5), ey, 3.9, C.DD); circle(g, X(46.5), ey, 3.1, C.iris); rect(g, X(45), ey - 0.5, 4, 1.2, OUT); px(g, X(47.5), ey - 2, '#ffffff'); line(g, X(43), ey - 4.5, X(49), ey - 5, C.DD); }

  // crown behind the eye (knocked forward and crooked when he is dazed)
  const cx0 = X(o.crookedCrown ? 38 : 28.5), cyb = Y(20) - hy * 0.5 + (o.crookedCrown ? 3 : 0), tip = o.crookedCrown ? 1.2 : 0;
  rect(g, cx0, cyb - 3, 10, 3, C.y); rect(g, cx0, cyb - 1, 10, 1, C.yd); rect(g, cx0, cyb - 3, 10, 1, C.Y);
  for (let i = 0; i < 3; i++) { const bx = cx0 + i * 4; fillPoly(g, [[bx, cyb - 3], [bx + 1 + tip * i, cyb - 8 + i * tip], [bx + 2.5, cyb - 3]], C.y); px(g, bx + 1 + Math.round(tip * i), cyb - 8 + Math.round(i * tip), C.Y); }
  rect(g, cx0 + 4, cyb - 3, 2, 2, C.gem); px(g, cx0 + 4, cyb - 3, '#ff9a8a');

  // the mantle: red over the back, an ermine hem
  if (o.mantle !== false) {
    const m = [[X(30), Y(20)], [X(22), Y(20.5)], [X(12), Y(24)], [X(8), Y(30)], [X(12), Y(31)], [X(20), Y(28)], [X(28), Y(24)]];
    fillPoly(g, m, C.r); fillPoly(g, [[X(30), Y(20)], [X(22), Y(20.5)], [X(14), Y(23.5)], [X(24), Y(22)]], '#d0564a');
    line(g, X(8), Y(30), X(13), Y(31), C.k, 2); line(g, X(13), Y(31), X(21), Y(28), C.k, 2); line(g, X(21), Y(28), X(29), Y(24), C.k, 2);
    for (const [kx, ky] of [[10, 30.5], [16, 29.5], [23, 27], [27, 25]]) px(g, X(kx), Y(ky), OUT);
  }

  // near forearm, planted in front of the belly
  if (o.arms === 'up') { limb(g, X(44), Y(31), X(55), Y(17), 3, C.F, C.D); toes(g, X(54), Y(16), 1, C.D, C.L); }
  else if (o.arms !== 'none') {
    const hx = o.arms === 'fwd' ? X(57) : o.arms === 'down' ? X(54) : o.arms === 'splay' ? X(60) : X(47), hy2 = o.arms === 'fwd' ? Y(36) : o.arms === 'splay' ? GY : o.arms === 'down' ? GY - lift * 0.3 : GY;
    limb(g, X(44), Y(33), hx, hy2 - 1, 3, C.F, C.D);
    toes(g, hx - 1, Math.min(GY, hy2), 1, C.D, C.L);
  }
  if (o.tongueOut) { fillPoly(g, [[X(50), Y(31)], [X(58), Y(35)], [X(60), GY], [X(56), GY], [X(52), Y(34)]], C.tg); line(g, X(52), Y(32), X(58), Y(37), C.tgL); }
  let cc = c, gg = g;
  if (o.rot) { const [c2, g2] = canvas(W, H); const pv = o.pivot || [X(12), GY - 1]; g2.imageSmoothingEnabled = false; g2.translate(pv[0], pv[1]); g2.rotate(o.rot * Math.PI / 180); g2.drawImage(c, -pv[0], -pv[1]); g2.setTransform(1, 0, 0, 1, 0, 0); cc = c2; gg = g2; }
  if (o.fx) o.fx(gg, X, Y);
  return outline(cc, OUT);
}

export function bakeFrog() {
  const frames = [
    frame({ legs: 'sit', arms: 'plant' }),
    frame({ legs: 'sit', arms: 'plant', sac: true, lift: 1 }),
    frame({ legs: 'sit', arms: 'plant', mouth: true, tilt: 2 }),
    frame({ legs: 'crouch', arms: 'plant', sx: 1.08, sy: 0.8 }),
    frame({ legs: 'trail', arms: 'fwd', sx: 0.94, sy: 1.06, lift: 5 }),
    frame({ legs: 'reach', arms: 'down', lift: 3 }),
    frame({ legs: 'splay', arms: 'splay', sx: 1.06, sy: 0.72, eyes: 'shut', mouth: true, tongueOut: true, crookedCrown: true }),
    frame({ legs: 'crouch', arms: 'fwd', mouth: true, tilt: -3, sx: 1.1, sy: 0.8, eyes: 'narrow', fx: (g, X, Y) => { fillPoly(g, [[X(46), Y(33)], [X(53), Y(36.5)], [X(58), Y(35)], [X(60), Y(38.5)], [X(55), Y(40.5)], [X(46), Y(36)]], C.tg); line(g, X(47), Y(34), X(57), Y(36), C.tgL); px(g, X(60), Y(37), C.tgL); } }),   /* 7 THE TONGUE GRAB's windup: dropped low on his forearms, eyes narrowed on you, the tongue curling out of the maw */
    frame({ legs: 'sit', arms: 'fwd', mouth: true, tilt: 1, sx: 1.16, sy: 0.92, fx: (g, X, Y) => { fillPoly(g, [[X(50), Y(31)], [X(61), Y(32)], [X(61), Y(35)], [X(49), Y(36)]], C.tg); line(g, X(50), Y(32), X(61), Y(33), C.tgL); circle(g, X(61), Y(33.5), 1.8, C.tg); px(g, X(61), Y(33), C.tgL); } }),   /* 8 the tongue out: head thrust forward, the tongue's root running from the maw */
    frame({ legs: 'trail', arms: 'up', mouth: true, sx: 0.94, sy: 1.0, rot: -17, pivot: [30, GY - 1], eyes: 'wide', fx: (g, X, Y) => { hand(g, X(56) - 3, Y(14) - 9, true); drops(g, [[X(8) - 3, GY - 2], [X(5) - 3, GY - 6]]); } }),   /* 9 THE BELLY-FLOP's windup: reared up on his hind legs, belly out, a hand thrown up, eyes wide */
    frame({ legs: 'splay', arms: 'splay', sx: 1.22, sy: 0.58, eyes: 'shut', sac: true, fx: (g, X, Y) => { for (const [mx, my, c] of [[2, GY - 3, '#3d3128'], [6, GY - 1, '#5a4a3c'], [58, GY - 4, '#3d3128'], [62, GY - 2, '#5a4a3c'], [4, GY - 7, '#5a4a3c'], [61, GY - 8, '#3d3128'], [11, GY - 12, '#3d3128'], [56, GY - 11, '#5a4a3c']]) rect(g, mx, my, 2, 2, c); drops(g, [[9, GY - 9], [52, GY - 13], [14, GY - 15]]); arc(g, X(30), GY, 30, Math.PI * 1.12, Math.PI * 1.45, '#7fc4e0'); } }),   /* 10 flat on his belly: winded, mud and spray thrown out round him */
    frame({ legs: 'sit', arms: 'plant', sac: true, cheeks: true, tilt: 3, eyes: 'shut', fx: (g, X, Y) => { blob(g, X(40), Y(30), 5, 4, C.L, C.LL, C.F); FLY(g, X(53), Y(20), 0); FLY(g, X(57), Y(25), 1); FLY(g, X(50), Y(13), 1); FLY(g, X(36), Y(11), 0); } }),   /* 11 THE FLY SWARM's windup: both cheeks stuffed with flies, eyes screwed shut, the first of them already out */
    frame({ legs: 'sit', arms: 'plant', mouth: true, tilt: 5, sx: 1.04, eyes: 'wide', fx: (g, X, Y) => { for (const [fx, fy, k] of [[56, 24, 0], [60, 21, 1], [58, 29, 0], [54, 18, 1], [61, 26, 1], [57, 14, 0], [51, 22, 0]]) FLY(g, X(fx), Y(fy), k); } }),   /* 12 the flies spat: maw wide, the swarm pouring out of it */
    frame({ legs: 'sit', arms: 'plant', sac: 'big', lift: 3, sy: 1.1, tilt: 4, eyes: 'shut', fx: (g, X, Y) => { arc(g, X(46), Y(33), 19, -0.5, 1.1, '#fbfbe0'); arc(g, X(46), Y(33), 22, -0.4, 1.0, '#7fc4e0'); } }),   /* 13 THE CROAK RIPPLE's windup: the throat swollen to the size of him, head back, rings gathering ahead of the sac */
    frame({ legs: 'crouch', arms: 'down', sac: true, mouth: true, sx: 1.08, sy: 0.88, eyes: 'wide', fx: (g, X, Y) => { for (let r = 0; r < 3; r++) { arc(g, X(56), Y(29), 6 + r * 5, -0.95, 0.95, r & 1 ? '#7fc4e0' : '#dff4ff'); arc(g, X(56), Y(29), 6.6 + r * 5, -0.8, 0.8, r & 1 ? '#7fc4e0' : '#dff4ff'); } } }),   /* 14 the ripple let go: slammed onto his forearms, maw wide, the croak running out in rings */
    frame({ legs: 'sit', arms: 'up', tilt: 1, sx: 0.96, sy: 1.04, rot: 4, eyes: 'narrow', fx: (g, X, Y) => { limb(g, X(40), Y(32), X(51), Y(19), 4, C.F, C.D); limb(g, X(51), Y(19), X(54), Y(9), 4, C.F, C.D); hand(g, X(54), Y(7), true); } }),   /* 15 THE SLAP's windup: a great webbed hand lifted high over the water, leaning back to throw it */
    frame({ legs: 'sit', arms: 'down', sx: 1.1, sy: 0.9, tilt: -1, eyes: 'wide', fx: (g, X, Y) => { limb(g, X(42), Y(30), X(49), Y(37), 4, C.F, C.D); limb(g, X(49), Y(37), X(55), GY - 5, 4, C.F, C.D); hand(g, X(55), GY - 5, false); drops(g, [[X(49), GY - 9], [X(59), GY - 7], [X(57), GY - 12], [X(61), GY - 11], [X(51), GY - 14]]); arc(g, X(55), GY - 1, 7, Math.PI, Math.PI * 2, '#dff4ff'); } }),   /* 16 the slap: the hand brought down flat on the water, spray flung */
    frame({ legs: 'crouch', arms: 'plant', tilt: 7, sx: 1.02, eyes: 'wide', fx: (g, X, Y) => { fillPoly(g, [[X(53), Y(29.5)], [X(58), Y(28)], [X(59), Y(29.5)], [X(53), Y(31)]], C.tg); px(g, X(59), Y(28.5), C.tgL); FLY(g, X(55), Y(8), 0); FLY(g, X(49), Y(5), 1); } }),   /* 17 the snap's windup: head cocked up at the flies, pupil dilated, the tongue-tip flicking */
    /* (claude/frogking2, greybox for the art lane - B16) 18 THE SPIT's windup: cheeks blown green with venom, head drawn back, a drip at the lip */
    frame({ legs: 'sit', arms: 'plant', cheeks: true, tilt: -4, sx: 1.06, sy: 0.96, eyes: 'narrow', fx: (g, X, Y) => { blob(g, X(42), Y(31), 6, 4, '#7fb84a', '#b8e070', '#4a7a2a'); drops(g, [[X(52), Y(36)], [X(53), Y(39)]], '#8fd160'); } }),
    /* 19 THE SPIT let go: head thrown up and forward, maw wide, three globs leaving it */
    frame({ legs: 'trail', arms: 'fwd', mouth: true, tilt: 6, lift: 2, eyes: 'wide', fx: (g, X, Y) => { for (const [gx, gy] of [[56, 20], [60, 15], [62, 24]]) blob(g, X(gx), Y(gy), 2, 2, '#8fd160', '#d6f5a0', '#4a7a2a'); } }),
  ];
  const L = frames.map(flipX), white = frames.map(c => whiten(c));
  return { R: frames, L, white: { R: white, L: white.map(flipX) }, ax: 30, ay: 44 + PADT, w: 40, h: 30 };
}
