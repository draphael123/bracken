// frogking.js — the Bullfrog King, redrawn at native size (the old 40x17 grid was scaled 1.35x in the draw, which
// smeared the pixels and left him squat). Side-on, facing RIGHT (L is the flip): a hunched bullfrog with a gold crown
// behind the eye, a short red mantle over the back, a pale throat sac, a folded hind leg and a planted forearm.
//   frames: 0 sit, 1 croak (sac blown up), 2 maw open (tongue / breath in), 3 crouch (squashed, about to leap),
//           4 rising (stretched, legs trailing), 5 falling (legs reaching down), 6 dazed (flat on the boards, tongue out)
//   canvas 64x46, every frame the same size and anchor: ax 30, ay 44 (toes on ay-1), so no frame floats or sinks.
import { canvas, px, rect, line, circle, ellipse, fillPoly, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const C = {
  F: '#5a9a3a', D: '#3a6a2a', DD: '#284a1e', L: '#8fc85a', LL: '#c0e890',
  B: '#e4e6ac', Bs: '#b4b87a', y: '#e0b040', Y: '#fff1a0', yd: '#9a7020', gem: '#c9463d',
  r: '#b03a34', R: '#7a2426', k: '#f0e6c8', ks: '#b8ac90', maw: '#4a1a22', tg: '#ff7a9a', tgL: '#ffb0c0', iris: '#f08a2a',
};
const W = 64, H = 46, GY = 43; // GY: the row the toes stand on

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

function frame(o) {
  const [c, g] = canvas(W, H);
  const sy = (o.sy || 1) * 1.16, sx = o.sx || 1, lift = o.lift || 0;
  const X = x => 30 + (x - 30) * sx, Y = y => GY - (GY - y) * sy - lift;

  // far limbs, behind everything
  if (o.legs === 'sit' || o.legs === 'crouch') { rect(g, X(22), GY - 1, 9, 2, C.DD); toes(g, X(30), GY, 1, C.DD); }
  if (o.arms !== 'none') { const ax = o.arms === 'fwd' ? X(53) : o.arms === 'down' ? X(51) : o.arms === 'splay' ? X(56) : X(42), ay = o.arms === 'fwd' ? Y(35) : o.arms === 'splay' ? GY : o.arms === 'down' ? GY - lift * 0.3 : GY; limb(g, X(40), Y(33), ax - 2, ay, 2, C.DD); }

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

  // throat sac
  if (o.sac) { blob(g, X(46), Y(37), 10.5, 7.5, C.B, '#fbfbe0', C.Bs); ellipse(g, X(43), Y(33.5), 3, 1.5, '#ffffff'); }
  else if (!o.mouth) { ellipse(g, X(46), Y(33.5), 6, 2.2, C.B); line(g, X(41), Y(35), X(51), Y(35), C.Bs); }

  // eye: gold iris, a flat frog's pupil, a heavy brow
  const ey = Y(16.5) - hy;
  if (o.eyes === 'shut') { line(g, X(43), ey, X(48), ey + 1, C.DD); line(g, X(43), ey - 1, X(47), ey - 1, C.D); }
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
  if (o.arms !== 'none') {
    const hx = o.arms === 'fwd' ? X(57) : o.arms === 'down' ? X(54) : o.arms === 'splay' ? X(60) : X(47), hy2 = o.arms === 'fwd' ? Y(36) : o.arms === 'splay' ? GY : o.arms === 'down' ? GY - lift * 0.3 : GY;
    limb(g, X(44), Y(33), hx, hy2 - 1, 3, C.F, C.D);
    toes(g, hx - 1, Math.min(GY, hy2), 1, C.D, C.L);
  }
  if (o.tongueOut) { fillPoly(g, [[X(50), Y(31)], [X(58), Y(35)], [X(60), GY], [X(56), GY], [X(52), Y(34)]], C.tg); line(g, X(52), Y(32), X(58), Y(37), C.tgL); }
  return outline(c, OUT);
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
  ];
  const L = frames.map(flipX), white = frames.map(c => whiten(c));
  return { R: frames, L, white: { R: white, L: white.map(flipX) }, ax: 30, ay: 44, w: 40, h: 30 };
}
