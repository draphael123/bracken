// fire_drake_art.js - THE FIRE DRAKE's sprites (claude/drakeart, lane D2 of claude/heartplan). src/fire-drake.js is the fight, src/fire-drake-hands.js binds it;
// this is its PICTURE: one baked + outlined sprite per pose (POSE in src/fire-drake.js), px.js primitives only so tools/fire-drake-art.mjs renders it in Node.
//
// THE SILHOUETTE IS THE CREATURE: a long low red-black lizard with a barbed spade tail, bat wings with bone fingers, a horned head on a long neck, an iron
// COLLAR with a ring where the chains bite, and the mountain's own fire showing through cracks in the hide (hide cracked like cooled lava, ember in the cracks).
// B16: every POSE field reads - a windup and its release are never the same picture (tools/fire-drake-art.mjs proves the sprites differ pose to pose).
// Facing RIGHT, origin = the floor under the body's middle (anchor ax, ay). drakeSprite() returns { c, collar, jaw } (collar / jaw in px from the anchor) so the chains meet the ring.
import { canvas, px, rect, fillPoly, line, circle, outline, whiten } from '../px.js';
import { OUT } from '../art.js';

export const DRAKE_ANCHOR = { ax: 100, ay: 90, w: 200, h: 104 };
const K = {
  hide: ['#2a0e0a', '#4a1810', '#7a2a1c', '#a8402a', '#c8603a'],   /* deep shade, shade, body, lit, rim */
  belly: ['#6a4220', '#a8742c', '#d8a04a', '#f0c870'],
  horn: ['#6a5a40', '#b89c70', '#e8d8b0', '#fff4d8'],
  iron: ['#2a2622', '#5a5248', '#8a8070', '#b8ac98'],
  wing: ['#3a100c', '#5a1c14', '#8a3020', '#b04a2a'],
  eye: '#ffd36b', eyeH: '#fff6c0', ember: '#ff9a3a', emberH: '#ffe08a', fire: '#ff5a1a', mouth: '#2a0a06', mouthL: '#6a1a10', tooth: '#f4ecd0', smoke: '#9a9090',
};
const BODY = {   /* lift (body middle above the floor), tilt (rad, + = nose down), neck (rad, + = raised) - the greybox's table, kept so a pose means the same thing */
  coiled: [10, 0, -0.5], rising: [22, -0.1, 0.6], stalk: [20, 0, 0.2], rear: [28, -0.35, 0.9], lean: [18, 0.2, 0.05], coil: [16, 0.1, 0.3], spin: [18, 0, 0.1],
  crouch: [12, 0.12, 0.05], twist: [18, -0.1, -0.35], brace: [18, 0.1, 0.12], slump: [12, 0.15, -0.35], dash: [16, 0.25, 0], onSide: [10, 1.25, -0.2],
  air: [26, 0, 0.3], stoop: [24, 0.6, -0.6], slam: [14, 0.22, -0.1], lunge: [16, 0.25, 0.05], collapsed: [6, 0.08, -0.55],
};
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const bez = (a, b, c, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1]];
function blob(g, cx, cy, rx, ry, a, col, dith) { const pts = []; for (let i = 0; i < 26; i++) { const t = i / 26 * Math.PI * 2, [x, y] = rot(Math.cos(t) * rx, Math.sin(t) * ry, a); pts.push([cx + x, cy + y]); } fillPoly(g, pts, col, dith); }
function seg(g, x0, y0, x1, y1, w0, w1, col, dith) { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  fillPoly(g, [[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], col, dith); circle(g, x1, y1, w1 / 2, col); }
/* a TUBE along a curve (neck, tail): dark base, body, lit upper edge, optional belly stripe - three circles per sample */
function tube(g, pts, ws, o = {}) {
  const H = o.hide || K.hide;
  pts.forEach(([x, y], i) => circle(g, x, y, ws[i] / 2 + 0.5, H[1]));
  pts.forEach(([x, y], i) => circle(g, x, y - ws[i] * 0.08, ws[i] / 2 - 0.5, H[2], H[1]));
  pts.forEach(([x, y], i) => { if (ws[i] > 3) circle(g, x, y - ws[i] * 0.22, ws[i] * 0.26, H[3]); });
  if (o.belly) pts.forEach(([x, y], i) => { if (ws[i] > 3) circle(g, x + 0.5, y + ws[i] * 0.28, Math.max(1, ws[i] * 0.2), K.belly[2], K.belly[1]); });
}

/* THE WINGS: arm bone to the wrist, three finger bones, a membrane between (dithered at its trailing edge), the thumb claw. S = shoulder; o = { span, up, flap } */
function wings(g, S, st, k, far) {
  const flap = st === 'beat' ? [1, 0.2, -0.7, 0.1][k % 4] : 0, dk = far ? 1 : 0, M = K.wing;
  const span = st === 'spread' ? 54 : st === 'beat' ? 50 : st === 'half' ? 34 : st === 'tucked' ? 12 : 20;
  const lift = st === 'spread' ? 36 : st === 'beat' ? 22 + flap * 18 : st === 'half' ? 20 : st === 'tucked' ? 4 : 12;
  const sx = S[0] - (far ? 5 : 0), sy = S[1] - (far ? 3 : 0);
  const W = [sx - span * 0.25, sy - lift], tips = st === 'tucked' ? [[sx - 20, sy - 3], [sx - 17, sy], [sx - 12, sy + 3]]
    : st === 'fold' ? [[sx - span - 8, sy - lift * 0.5], [sx - span - 2, sy - lift * 0.2 + 3], [sx - span * 0.6, sy + 4]]
    : [[sx - span - 8, sy - lift * 0.9 - flap * 6], [sx - span * 1.05, sy - lift * 0.15 + flap * 4], [sx - span * 0.55, sy + 6 + flap * 2]];
  const poly = [[sx + 5, sy + 1], W, ...tips, [sx - 6, sy + 2]];
  fillPoly(g, poly, M[dk ? 0 : 1]); fillPoly(g, [[sx + 3, sy], W, tips[0], tips[1], [sx - 4, sy + 1]], M[dk ? 1 : 2], M[dk ? 0 : 1]);
  if (!dk) fillPoly(g, [W, tips[0], tips[1], [W[0] + 4, W[1] + 6]], M[3], M[2]);
  for (const t of tips) line(g, W[0], W[1], t[0], t[1], K.horn[dk ? 0 : 1]);
  seg(g, sx + 3, sy + 1, W[0], W[1], 3, 2, K.hide[dk ? 1 : 2]); line(g, sx + 3, sy, W[0], W[1] - 1, K.hide[3]);
  px(g, W[0], W[1] - 2, K.horn[2]); px(g, W[0] - 1, W[1] - 3, K.horn[3]);   // the thumb claw
}

/* THE HEAD. (x, y) the head's base on the neck, a = its heading (rad, + = nose down), open 0..1, o: glow / shut / smoke / chain / roar / shake */
function head(g, x, y, a, open, o, t) {
  const P = (px_, py_) => { const [rx, ry] = rot(px_, py_, a); return [x + rx, y + ry]; };
  const poly = (pts, col, d) => fillPoly(g, pts.map(p => P(p[0], p[1])), col, d);
  /* the horns, swept back (behind the skull) */
  poly([[-1, -5], [-5, -9], [-13, -13], [-9, -8], [-4, -4]], K.horn[1]); poly([[1, -6], [-3, -11], [-9, -17], [-6, -10], [0, -5]], K.horn[2]);
  { const [hx, hy] = P(-9, -17); px(g, hx, hy, K.horn[3]); }
  /* the lower jaw, hinged under the skull and dropped by `open` */
  const jr = open * 0.75, J = (jx, jy) => { const [rx, ry] = rot(jx - 1, jy - 3, jr); return [1 + rx, 3 + ry]; };
  const jaw = [[-1, 3], [14, 3], [21, 3], [20, 5], [13, 8], [1, 8]].map(p => J(p[0], p[1]));
  if (open > 0.1) { const m = [[0, 3], [20, 3], ...jaw.slice(1, 4).reverse().slice(0, 0)]; poly([[0, 1], [21, 1], [21, 3 + open * 8], [1, 4 + open * 4]], o.glow ? K.fire : K.mouth);
    if (o.glow) poly([[2, 1], [19, 1], [19, 3 + open * 5], [3, 3 + open * 3]], K.emberH, K.ember); else poly([[3, 2], [14, 2], [14, 3 + open * 4], [4, 3 + open * 2]], K.mouthL); }
  poly(jaw, K.hide[3]); poly(jaw.map(p => [p[0], p[1] + 0]).slice(0, 4), K.hide[2], K.hide[1]);
  { const [t0x, t0y] = P(...jaw[2]); px(g, t0x, t0y + 0, K.horn[2]); }
  if (open > 0.1) for (let i = 0; i < 4; i++) { const [lx, ly] = P(...[J(5 + i * 4, 3)].map(p => [p[0], p[1] - 1])[0]); px(g, lx, ly, K.tooth); }
  /* the skull: a long wedge, lit on the brow, the snout's tip blunt */
  poly([[-5, -6], [4, -8], [13, -6], [21, -3], [22, 1], [14, 2], [-2, 4]], K.hide[2]);
  poly([[-5, -6], [4, -8], [13, -6], [21, -3], [14, -3], [2, -5]], K.hide[3]);
  poly([[-2, -3], [6, -4], [14, -2], [20, 0], [14, 2], [-2, 4]], K.hide[2], K.hide[1]);
  poly([[3, -8], [6, -9], [9, -7], [5, -6]], K.horn[1]);   // the brow ridge
  /* the cheek spikes, the nostril's ember, the teeth along the upper lip */
  poly([[-4, 0], [-10, 3], [-3, 3]], K.horn[1]); poly([[-2, 3], [-6, 7], [0, 4]], K.horn[0]);
  { const [nx, ny] = P(20, -2); px(g, nx, ny, o.glow ? K.emberH : K.ember); }
  for (let i = 0; i < 3; i++) { const [lx, ly] = P(8 + i * 4, 2); px(g, lx, ly, K.tooth); }
  /* the eye: a burning slit (shut in sleep) */
  { const [ex, ey] = P(8, -4); if (o.shut) { px(g, ex, ey, K.hide[0]); px(g, ex + 1, ey, K.hide[0]); } else { rect(g, ex, ey - 1, 3, 2, K.eye); px(g, ex + 1, ey - 1, K.eyeH); px(g, ex + 2, ey, K.hide[0]); } }
  if (o.chain) { for (let i = 0; i < 3; i++) { const [cx_, cy_] = P(12 + i * 2, 5 + i * 2); rect(g, cx_, cy_, 2, 2, i & 1 ? K.iron[3] : K.iron[1]); } }
  if (o.smoke) for (let i = 0; i < 3; i++) { const q = (t * 1.5 + i * 0.33) % 1, [sx, sy] = P(21, -2); circle(g, sx + q * 6, sy - 3 - q * 12, 1.5 + q * 2, K.smoke, '#6a6060'); }
  if (o.roar) for (let i = 0; i < 3; i++) { const [sx, sy] = P(25 + i * 3, -3 + i * 3), [ex, ey] = P(30 + i * 4, -5 + i * 5); line(g, sx, sy, ex, ey, K.emberH); }
  return P(21, 0);
}

/* what a pose's fields do: see src/fire-drake.js POSE. mode only names the cache key and the frame variants */
function drawDrake(g, p, k, time) {
  const [lift, tilt, neckA] = BODY[p.body] || BODY.stalk, air = p.body === 'air', CX = 100, FY = 90;
  const T = (x, y) => { const [rx, ry] = rot(x, y, tilt); return [CX + rx, FY - lift + ry]; };
  const out = { collar: [22, -22], jaw: [30, -30] };
  const step = k % 2 ? 3 : -3, walking = p.body === 'stalk' && p.head === 'low';
  /* a pool of heat under it: nothing but the ember glow on the floor, so the body is not floating */
  /* --- the far wing, the far legs, the tail ------------------------------------------------------------------ */
  const wst = p.wings || (air ? 'beat' : 'fold'), sh = T(-4, -9);
  wings(g, sh, wst, k + 2, true);
  const hips = [T(-17, 5), T(15, 5)];
  const leg = (hip, foot, w, col, claws) => { const kx = (hip[0] + foot[0]) / 2 + (foot[0] >= hip[0] ? 2 : -1), ky = (hip[1] + foot[1]) / 2 - 1;
    seg(g, hip[0], hip[1], kx, ky, w + 2, w, col); seg(g, kx, ky, foot[0], foot[1], w, w - 1, col);
    for (let i = 0; i < 3; i++) rect(g, foot[0] + i * 2 - 1, foot[1], 1, 2, claws); };
  if (p.body === 'onSide') { leg(hips[0], [hips[0][0] - 4, hips[0][1] + 17], 5, K.hide[1], K.horn[0]); leg(hips[1], [hips[1][0] + 8, hips[1][1] + 16], 5, K.hide[1], K.horn[0]); }
  else if (air) { leg(hips[0], [hips[0][0] - 3, hips[0][1] + 10], 4, K.hide[1], K.horn[1]); leg(hips[1], [hips[1][0] + 8, hips[1][1] + 8], 4, K.hide[1], K.horn[1]); }
  else { leg(hips[0], [hips[0][0] - 3 + (walking ? step : 0), FY - 1], 5, K.hide[1], K.horn[0]); leg(hips[1], [hips[1][0] + 3 + (walking ? -step : 0), FY - 1], 5, K.hide[1], K.horn[0]); }
  /* THE TAIL: a long taper to a barbed spade; raised and rattling, swept forward under it, or trailing */
  { const b = T(-26, 2), raised = p.tail === 'raised', sweepT = p.tail === 'sweep', rat = p.rattle ? (k % 2 ? 2 : -2) : 0;
    const dead = p.body === 'collapsed', tip = sweepT ? [CX + 46, FY - 9] : raised ? [CX - 66 + rat, FY - 54 + rat] : dead ? [CX - 78, FY - 2] : air ? [CX - 70, FY - 30 + Math.sin(time * 4) * 3] : [CX - 80, FY - 4 + (p.body === 'onSide' ? -2 : Math.sin(time * 2) * 2)];
    const ctl = sweepT ? [CX - 30, FY + 6] : raised ? [CX - 56, FY - 22] : [(b[0] + tip[0]) / 2 + 2, Math.max(b[1], FY - 8) + 5];
    const pts = [], ws = []; for (let i = 0; i <= 16; i++) { const t = i / 16, q = bez(b, ctl, tip, t); pts.push(q); ws.push(Math.max(2, 10 - 8 * t)); }
    tube(g, pts, ws, { belly: false });
    for (let i = 2; i < 15; i += 3) { const [x, y] = pts[i]; fillPoly(g, [[x - 1, y - ws[i] / 2], [x + 1, y - ws[i] / 2], [x - (sweepT ? -1 : 1), y - ws[i] / 2 - 4]], K.horn[1]); }
    /* the spade: a barbed blade with an ember edge */
    const e = pts[16], d = pts[15], vx = e[0] - d[0], vy = e[1] - d[1], l = Math.hypot(vx, vy) || 1, ux = vx / l, uy = vy / l, nx = -uy, ny = ux;
    fillPoly(g, [[e[0] + nx * 5 - ux * 2, e[1] + ny * 5 - uy * 2], [e[0] + ux * 8, e[1] + uy * 8], [e[0] - nx * 5 - ux * 2, e[1] - ny * 5 - uy * 2], [e[0] - ux * 3, e[1] - uy * 3]], K.horn[1]);
    fillPoly(g, [[e[0] + nx * 3, e[1] + ny * 3], [e[0] + ux * 7, e[1] + uy * 7], [e[0] - nx * 3, e[1] - ny * 3]], K.horn[2]); px(g, e[0] + ux * 7, e[1] + uy * 7, K.emberH);
    if (p.rattle) for (let i = 0; i < 3; i++) px(g, e[0] + ux * 4 + nx * (i - 1) * 4, e[1] + uy * 4 + ny * (i - 1) * 4, K.eyeH); }
  /* --- the body -------------------------------------------------------------------------------------------- */
  { const c = T(0, 0), a = tilt;
    blob(g, c[0], c[1], 31, 12.5, a, K.hide[1]); blob(g, c[0] + 1, c[1] - 1, 29.5, 11, a, K.hide[2]);
    blob(g, c[0] + 2, c[1] - 4, 24, 5, a, K.hide[3], K.hide[2]); blob(g, c[0] - 2, c[1] + 5, 28, 5, a, K.hide[1], K.hide[2]);
    /* the belly plates: pale bands across the underside */
    const bb = T(4, 6); blob(g, bb[0], bb[1], 22, 5, a, K.belly[1]); blob(g, bb[0] + 1, bb[1] - 1, 20, 3.5, a, K.belly[2], K.belly[1]);
    for (let i = -4; i <= 4; i++) { const [x, y] = T(4 + i * 4.5, 7); rect(g, x, y - 3, 1, 5, K.belly[0]); }
    /* the scales: a pitted dither on the flank and a ring of lit scale tips along the back */
    for (let i = -5; i <= 5; i++) for (const r of [-1, 0]) { const [x, y] = T(i * 5 + (r ? 2 : 0), r * 4 - 1); px(g, x, y, K.hide[3]); px(g, x + 1, y + 1, K.hide[1]); }
    /* the dorsal plates, tallest over the shoulders */
    for (let i = -4; i <= 4; i++) { const h = 4 + (4 - Math.abs(i)) * 0.5, [x, y] = T(i * 6.5, -10.5); fillPoly(g, [[x - 2, y + 1], [x + 2, y + 1], [x + (i < 0 ? -1 : 1), y - h]], K.horn[1]); px(g, x, y - h + 2, K.horn[2]); }
    /* THE MOUNTAIN IN ITS HIDE: cracks that glow like cooling lava - white-hot when it blazes or tells */
    const hot = p.scales === 'blaze' ? 2 : (p.chest === 'glow' || p.seal === 'glow' || p.chains === 'strain' || p.chains === 'glow') ? 1 : 0, cr = hot > 1 ? K.emberH : hot ? K.ember : K.fire;
    const cracks = [[-14, -3, -10, 0, -11, 4], [-4, -6, 0, -3, -2, 2], [8, -5, 11, -1, 9, 4], [18, -2, 21, 2], [-24, 1, -20, 3]];
    for (const c2 of cracks) for (let i = 0; i + 3 < c2.length + 1 && i + 3 <= c2.length; i += 2) { if (c2[i + 2] === undefined) break; const q0 = T(c2[i], c2[i + 1]), q1 = T(c2[i + 2], c2[i + 3]); line(g, q0[0], q0[1], q1[0], q1[1], cr); }
    if (hot) for (const [cx2, cy2] of [[-12, 0], [0, -3], [10, -1]]) { const [x, y] = T(cx2, cy2); px(g, x, y - 1, K.emberH); px(g, x + 1, y, K.ember); }
    if (hot > 1) for (let i = 0; i < 6; i++) { const [x, y] = T(-26 + i * 10, -12 - (i % 2) * 3); px(g, x, y - 2 - ((k + i) % 3), K.emberH); }
    /* the shoulder and haunch masses */
    const sp = T(14, 0), hp = T(-16, 1); blob(g, hp[0], hp[1], 11, 9, a, K.hide[2], K.hide[1]); blob(g, hp[0] - 1, hp[1] - 3, 8, 4, a, K.hide[3]); blob(g, sp[0], sp[1] - 1, 10, 9, a, K.hide[2], K.hide[1]); blob(g, sp[0] + 1, sp[1] - 4, 7, 4, a, K.hide[3]);
    /* chest glow: the breath kindling in the throat plates */
    if (p.chest === 'glow') { const ch = T(20, 3), pu = k % 2; blob(g, ch[0], ch[1], 8 + pu, 6 + pu, a, K.fire); blob(g, ch[0], ch[1], 5, 3.5, a, pu ? K.emberH : K.ember); } }
  /* --- the near legs ----------------------------------------------------------------------------------------- */
  const fh = T(18, 4), bh = T(-15, 4), lu = p.leg === 'up', sw = p.leg === 'swipe', hi = p.legs === 'high', pc = p.claws === 'glow' || sw ? K.emberH : K.horn[2];
  const claws = (x, y, c, dir = 1) => { for (let i = 0; i < 3; i++) { rect(g, x + i * 2 - 1, y - (dir < 0 ? 2 : 0), 1, 3, c); } };
  if (p.body === 'onSide') { seg(g, fh[0], fh[1], fh[0] + 14, fh[1] + 10, 6, 5, K.hide[2]); claws(fh[0] + 13, fh[1] + 9, K.horn[1]); seg(g, bh[0], bh[1], bh[0] - 12, bh[1] + 12, 6, 5, K.hide[2]); claws(bh[0] - 13, bh[1] + 11, K.horn[1]); }
  else if (hi) { seg(g, fh[0], fh[1], fh[0] + 14, fh[1] - 22, 6, 5, K.hide[2]); claws(fh[0] + 13, fh[1] - 25, pc); seg(g, fh[0] - 6, fh[1], fh[0] + 6, fh[1] - 24, 5, 4, K.hide[1]); claws(fh[0] + 5, fh[1] - 27, K.horn[1]);
    seg(g, bh[0], bh[1], bh[0] + 2, FY - 1, 6, 5, K.hide[2]); claws(bh[0] + 1, FY - 1, K.horn[1]); }
  else if (lu) { const f = [fh[0] + 16, fh[1] - 22]; seg(g, fh[0], fh[1], fh[0] + 10, fh[1] - 12, 6, 5, K.hide[2]); seg(g, fh[0] + 10, fh[1] - 12, f[0], f[1], 5, 4, K.hide[2]); claws(f[0] - 1, f[1] - 2, pc, -1); for (let i = 0; i < 3; i++) px(g, f[0] - 1 + i * 2, f[1] - 3, K.emberH);
    seg(g, bh[0], bh[1], bh[0] + 2, FY - 1, 6, 5, K.hide[2]); claws(bh[0] + 1, FY - 1, K.horn[1]); }
  else if (sw) { const f = [fh[0] + 36, fh[1] + 4]; seg(g, fh[0], fh[1], fh[0] + 18, fh[1] - 4, 6, 5, K.hide[2]); seg(g, fh[0] + 18, fh[1] - 4, f[0], f[1], 5, 4, K.hide[2]); claws(f[0], f[1] - 1, pc);
    for (let i = 0; i < 4; i++) line(g, f[0] - 6 + i * 2, f[1] - 8 + i * 4, f[0] + 8 + i * 3, f[1] - 4 + i * 4, K.eyeH);
    seg(g, bh[0], bh[1], bh[0] - 2, FY - 1, 6, 5, K.hide[2]); claws(bh[0] - 3, FY - 1, K.horn[1]); }
  else if (p.body === 'slam' || p.legs === 'down') { seg(g, fh[0], fh[1], fh[0] + 6, FY - 1, 7, 6, K.hide[2]); rect(g, fh[0] + 3, FY - 2, 8, 3, K.hide[1]); claws(fh[0] + 6, FY - 1, K.horn[2]); seg(g, bh[0], bh[1], bh[0] - 3, FY - 1, 6, 5, K.hide[2]); claws(bh[0] - 4, FY - 1, K.horn[1]); }
  else if (air) { seg(g, fh[0], fh[1], fh[0] + 9, fh[1] + 10, 5, 4, K.hide[2]); claws(fh[0] + 8, fh[1] + 10, K.horn[2]); seg(g, bh[0], bh[1], bh[0] - 2, bh[1] + 11, 5, 4, K.hide[2]); claws(bh[0] - 3, bh[1] + 11, K.horn[2]); }
  else { const dx = p.body === 'dash' || p.body === 'lunge' ? 5 : 0; seg(g, fh[0], fh[1], fh[0] + 2 + dx + (walking ? -step : 0), FY - 1, 6, 5, K.hide[2]); claws(fh[0] + 1 + dx + (walking ? -step : 0), FY - 1, K.horn[2]);
    seg(g, bh[0], bh[1], bh[0] - 2 + (walking ? step : 0), FY - 1, 6, 5, K.hide[2]); claws(bh[0] - 3 + (walking ? step : 0), FY - 1, K.horn[1]); }
  /* --- the neck, the collar, the head ------------------------------------------------------------------------- */
  { const n0 = T(22, -6); let na = neckA + (p.neck === 'back' ? 0.45 : 0), ln = p.neck === 'out' ? 34 : 26;
    if (p.head === 'down') na -= 0.2;
    const nd = [Math.cos(na), -Math.sin(na)], hb = [n0[0] + nd[0] * ln, n0[1] + nd[1] * ln];
    const c1 = [n0[0] + (p.neck === 'back' ? -2 : 8), n0[1] - (p.neck === 'back' ? 10 : -1) + (na > 0.5 ? -4 : 0)];
    const pts = [], ws = []; for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(bez(n0, c1, hb, t)); ws.push(10 - 3 * t); }
    tube(g, pts, ws, { belly: true });
    for (let i = 1; i < 10; i += 2) { const [x, y] = pts[i]; fillPoly(g, [[x - 1, y - ws[i] / 2], [x + 1, y - ws[i] / 2], [x - 2, y - ws[i] / 2 - 3]], K.horn[1]); }
    /* THE COLLAR: an iron hoop with the ring the chains bite on */
    { const ci = 3, [x, y] = pts[ci], w = ws[ci], col = p.chains === 'snap' ? K.iron[1] : K.iron[2];
      rect(g, x - 2, y - w / 2 - 1, 4, w + 3, K.iron[1]); rect(g, x - 1, y - w / 2 - 1, 2, w + 3, col); rect(g, x - 2, y - w / 2 - 1, 1, 2, K.iron[3]); rect(g, x - 2, y + w / 2 + 1, 4, 1, K.iron[0]);
      const rx = x + 2, ry = y + w / 2 + 2; circle(g, rx, ry, 2.5, K.iron[1]); px(g, rx, ry, K.iron[0]); px(g, rx - 1, ry - 1, K.iron[3]);
      if (p.chains === 'snap') { for (const [dx, dy] of [[5, 4], [8, 7], [-4, 6], [11, 2]]) rect(g, rx + dx, ry + dy, 2, 3, K.iron[2]); px(g, rx + 3, ry + 1, K.emberH); }
      if (p.chains === 'glow' || p.chains === 'strain' || p.chains === 'taut') { px(g, rx, ry, K.emberH); px(g, rx + 1, ry, K.ember); px(g, rx, ry + 1, K.ember); }
      out.collar = [rx - CX, ry - FY]; }
    const open = p.jaw === 'open' || p.roar || p.body === 'lunge' || p.body === 'dash' ? 0.85 : p.chest === 'glow' ? 0.4 : p.body === 'rising' ? 0.45 : p.leg === 'up' ? 0.3 : p.legs === 'high' ? 0.7 : p.jaw === 'smoke' ? 0.25 : p.body === 'stoop' ? 0.5 : 0;
    let ha = -na * 0.5 + tilt * 0.6 + (p.head === 'down' ? 0.7 : p.head === 'up' ? -0.35 : p.head === 'low' ? 0.25 : 0) + (p.head === 'shake' ? (k % 2 ? 0.3 : -0.3) : 0) + (p.neck === 'back' ? -0.45 : 0) + (p.neck === 'out' ? 0.15 : 0);
    if (p.body === 'collapsed') ha = 0.95;
    const hh = head(g, hb[0], hb[1], ha, open, { glow: p.chest === 'glow' || p.body === 'brace' || p.neck === 'out', shut: p.body === 'coiled' || p.body === 'collapsed', smoke: p.jaw === 'smoke' || p.body === 'coiled', chain: p.jaw === 'chain', roar: !!p.roar }, time);
    out.jaw = [hh[0] - CX, hh[1] - FY]; }
  /* --- the near wing, over the back ------------------------------------------------------------------------ */
  wings(g, sh, wst, k, false);
  /* heat shimmer on the blaze: a few sparks off the hide */
  if (p.scales === 'blaze') for (let i = 0; i < 6; i++) { const [x, y] = T(-28 + i * 11, -14 - ((i + k) % 3) * 4); px(g, x, y, i & 1 ? K.emberH : K.ember); }
  return out;
}

/* animated poses (wing beat, walk, rattle, glow, smoke, shake) get 4 steps a second pair; the rest hold one */
const MOVING = new Set(['hover', 'takeoff', 'walk', 'recover', 'tailTell', 'breathTell', 'pant', 'sleep', 'rise', 'clawTell', 'tearTell', 'slamTell', 'lungeTell', 'wake', 'diveTell']);
const cache = new Map();
export function drakeSprite(mode, pose, time, flash) {
  const k = MOVING.has(mode) ? Math.floor(time * 8) % 4 : 0, key = mode + '|' + k + (flash ? 'w' : '');
  let s = cache.get(key); if (s) return s;
  if (flash) { const b = drakeSprite(mode, pose, time, false); s = { c: whiten(b.c), collar: b.collar, jaw: b.jaw }; cache.set(key, s); return s; }
  const [c, g] = canvas(DRAKE_ANCHOR.w, DRAKE_ANCHOR.h); const meta = drawDrake(g, pose, k, k / 8 + 0.02);
  const img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.putImageData(img, 0, 0);
  s = { c: outline(c, OUT), collar: meta.collar, jaw: meta.jaw }; cache.set(key, s); return s;
}
export function clearDrakeSprites() { cache.clear(); }
/* HIS BESTIARY CARD (claude/drakeroom): two of his poses (stalking, the breath's windup) shrunk to the card's 66 px - main.js SPR.firedrakeCard (the bestiary reads SPR[t + 'Card'].R) */
export function bakeDrakeCard(POSE, flipX) {
  const fr = ['walk', 'breathTell'].map((m, i) => { const s = drakeSprite(m, POSE[m] || POSE.walk, i * 0.3, false), [c, g] = canvas(66, 40); g.imageSmoothingEnabled = false; g.drawImage(s.c, 1, 2, 64, 33);
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let q = 3; q < d.length; q += 4) d[q] = d[q] > 110 ? 255 : 0; g.putImageData(img, 0, 0); return outline(c, OUT); });
  const white = fr.map(c => whiten(c)); return { R: fr, L: fr.map(flipX), white: { R: white, L: white.map(flipX) }, ax: 33, ay: 31, w: 40, h: 26 };
}
