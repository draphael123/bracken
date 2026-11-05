// demon_king_art.js - THE DEMON KING, HIS BOLTS AND HIS HUD (claude/skyart, lane S4). One sprite per POSE x PHASE (src/demon-king.js POSE) so a windup and its release are never the same
// picture (B16). HE IS REGAINING HIS POWER: phase 1 half-formed (crumbling cracked-obsidian chest, one horn a broken stub, no crown, smoke where the legs go, dim veins, orange eyes);
// phase 2 the crown and both horns, shoulder shards, hot veins, gold eyes; phase 3 whole: tall crown with ember tips, smoke-wings, ghostly legs forming, white-gold eyes.
// On one wrist the BROKEN SEAL CHAIN (the same iron + links as the drake's collar). Not a goblin and not the drake: tall, narrow, ivory horns, black glass skin, ember veins.
// Facing RIGHT; the hands flip it. Origin (ax, ay) = the foot of his smoke tail; `hand` = where the casting hand is (sprite px) so the orb sits in it. px.js primitives only.
import { canvas, px, rect, fillPoly, line, circle, ellipse, outline, whiten, mulberry } from '../px.js';
import { OUT } from '../art.js';

export const KING_ANCHOR = { w: 88, h: 96, ax: 44, ay: 84 };
const O = ['#100b16', '#1c1424', '#2c2236', '#463a54', '#6c5c7c'];            /* black glass: deep, shade, body, lit, rim */
const V = ['#7a1a10', '#ff4a1a', '#ff9a3a', '#ffe08a', '#fff6d0'];             /* ember veins: dull, hot, bright, white-gold */
const H = ['#6a5a40', '#b89c70', '#e8d8b0', '#fff4d8'];                        /* ivory horn */
const I = ['#2a2622', '#5a5248', '#8a8070', '#b8ac98'];                        /* iron (the chain) */
const S = ['#160e16', '#241a26', '#382a38', '#523e4c'];                        /* smoke */
const EYE = ['#ff9a3a', '#ffd36b', '#fff6c0'], SCREAM = '#ff4a3a';
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const bez = (a, b, c, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1]];
function seg(g, x0, y0, x1, y1, w0, w1, col, dith) {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  fillPoly(g, [[x0 + nx * w0 / 2, y0 + ny * w0 / 2], [x1 + nx * w1 / 2, y1 + ny * w1 / 2], [x1 - nx * w1 / 2, y1 - ny * w1 / 2], [x0 - nx * w0 / 2, y0 - ny * w0 / 2]], col, dith); circle(g, x1, y1, w1 / 2, col);
}
const clean = c => { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0; g.putImageData(img, 0, 0); return c; };

/* the casting hand, in the sprite's own px relative to the FOOT of the tail (the greybox table, kept so a pose still means what S2 wrote) */
const HAND = { down: [10, -18], palmUp: [12, -34], thrown: [18, -30], pulled: [6, -30], both: [12, -36], thrownBoth: [18, -32], clawUp: [8, -52], swat: [18, -44], clawBack: [-14, -38],
  clawFwd: [20, -24], chainBack: [-16, -40], chainLash: [22, -20], spread: [16, -38], flail: [14, -46], out: [16, -10], flat: [10, -4] };
/* body: lean (rad, + = toward the front), drop (px, + = lower), hunch */
const BODY = { float: { lean: 0, drop: 0 }, rise: { lean: -0.16, drop: -4 }, low: { lean: 0.34, drop: 7 }, flat: { lean: 1.12, drop: 12 }, tumble: { lean: 0.7, drop: 4 }, prone: { lean: 1.5, drop: 22 } };
const cache = new Map();
export function clearKingArt() { cache.clear(); }

/* spec: { body, arm, scream, cape, ph (1..3), frame (0|1) } -> { c, ax, ay, hand:[x,y] in sprite px (facing right) } */
export function kingSprite(spec, flash = false) {
  const ph = Math.max(1, Math.min(3, spec.ph | 0 || 1)), fr = spec.frame ? 1 : 0, body = BODY[spec.body] ? spec.body : 'float', arm = HAND[spec.arm] ? spec.arm : 'down';
  const key = [body, arm, spec.scream ? 's' : '', spec.cape || '', ph, fr, flash ? 'w' : ''].join('|');
  let s = cache.get(key); if (s) return s;
  if (flash) { const b = kingSprite(spec, false); s = { c: whiten(b.c), ax: b.ax, ay: b.ay, hand: b.hand }; cache.set(key, s); return s; }
  const A = KING_ANCHOR, [c, g] = canvas(A.w, A.h), rnd = mulberry(1000 + ph * 17 + fr);
  const B = BODY[body], hip = [0, -26], OX = A.ax, OY = A.ay;
  const T = (x, y) => { const [rx, ry] = rot(x - hip[0], y - hip[1], B.lean); return [OX + hip[0] + rx, OY + hip[1] + ry + B.drop]; };
  const poly = (pts, col, d) => fillPoly(g, pts.map(p => T(p[0], p[1])), col, d);
  const vein = (pts, w = 1) => { for (let i = 0; i < pts.length - 1; i++) { const a = T(pts[i][0], pts[i][1]), b = T(pts[i + 1][0], pts[i + 1][1]); line(g, a[0], a[1], b[0], b[1], ph === 3 ? V[2] : V[1], w); if (ph > 1) line(g, a[0], a[1] - 0.5, b[0], b[1] - 0.5, ph === 3 ? V[3] : V[2]); } };
  const prone = body === 'prone', fl = 1;

  /* 1. SMOKE ABOVE THE GROUND: what is left of his legs - a tail of smoke from the hip that thins into embers. Phase 3 shows two ghost legs forming in it. */
  { const n = ph === 1 ? 9 : ph === 2 ? 8 : 7;
    for (let i = 0; i < n; i++) { const t = i / (n - 1), x = Math.sin(i * 1.7 + fr * 1.3) * (2 + t * 3), y = -26 + t * 25, r = 8 - t * 5.2; const p = T(x, y);
      circle(g, p[0], p[1], Math.max(1.3, r), S[Math.min(3, 1 + (i % 3))], S[0]); if (i < n - 2) circle(g, p[0] + 1, p[1] - 1.5, Math.max(1, r - 2), S[3], S[2]); }
    if (ph === 3) for (const sx of [-4, 4]) { const a = T(sx, -24), b = T(sx * 1.6 + (fr ? 1 : 0), -8); seg(g, a[0], a[1], b[0], b[1], 5, 2.5, O[2], S[1]); line(g, a[0], a[1], b[0], b[1] - 1, O[3]); }
    for (let i = 0; i < 7; i++) { const t = (i * 0.17 + fr * 0.09) % 1, p = T(Math.sin(i * 2.3) * 9, -4 - t * 30); px(g, p[0], p[1], i % 3 ? V[1] : V[3]); } }

  /* 2. SMOKE WINGS: the flare of a swoop's windup; phase 3 keeps a low pair always (he is whole enough to spread them) */
  if (spec.cape === 'flare' || ph === 3) { const big = spec.cape === 'flare' ? 1 : 0.55;
    for (const sd of [-1, 1]) { const pts = [[sd * 8, -44], [sd * 30 * big, -62 * big - 10 * (1 - big)], [sd * 38 * big, -40], [sd * 28 * big, -26], [sd * 8, -30]];
      poly(pts, S[1], S[0]); poly([pts[0], pts[1], [sd * 24 * big, -46], [sd * 8, -36]], S[2], S[1]); for (let k = 0; k < 3; k++) { const a = T(sd * 10, -42), b = T(sd * (24 + k * 5) * big, -56 + k * 9 * big); line(g, a[0], a[1], b[0], b[1], S[3]); } } }

  /* 3. FAR ARM (behind the torso) */
  const handSp = T(HAND[arm][0], HAND[arm][1]);       /* NB: HAND is in anchor space, not body space: keep it un-leaned so the orb meets it */
  const hx = OX + HAND[arm][0], hy = OY + HAND[arm][1], two = arm === 'both' || arm === 'thrownBoth' || arm === 'spread';
  const drawArm = (sx, sy, tx, ty, near) => {
    const mx = (sx + tx) / 2, my = (sy + ty) / 2, dx = tx - sx, dy = ty - sy, l = Math.hypot(dx, dy) || 1, ex = mx - dy / l * 3, ey = my + dx / l * 3;
    seg(g, sx, sy, ex, ey, 6, 4.5, near ? O[2] : O[1], O[1]); seg(g, ex, ey, tx, ty, 4.5, 3, near ? O[2] : O[1], O[1]);
    line(g, sx, sy - 1, ex, ey - 1, near ? O[3] : O[2]); line(g, ex, ey - 1, tx, ty - 1, near ? O[3] : O[2]);
    if (near && ph > 1) { px(g, ex, ey, V[1]); px(g, (ex + tx) / 2, (ey + ty) / 2, V[2]); }
    /* the claw: three fingers fanned along the arm's heading */
    const ux = dx / l, uy = dy / l; for (const f of [-0.6, 0, 0.6]) { const [fx, fy] = rot(ux, uy, f); line(g, tx, ty, tx + fx * 4.5, ty + fy * 4.5, near ? O[3] : O[2]); px(g, tx + fx * 5, ty + fy * 5, H[2]); }
    return [ex, ey];
  };
  const shF = T(-9, -43), shN = T(9, -43);
  drawArm(shF[0], shF[1], two ? OX - HAND[arm][0] : shF[0] - 2 + (arm === 'clawBack' || arm === 'chainBack' ? 0 : -1), two ? hy : shF[1] + 15, false);

  /* 4. TORSO: broad shoulders of cracked black glass narrowing to a waist that dissolves into the smoke. Phase 1: the lower edge is ragged; later it is clean. */
  const torso = [[-13, -46], [-6, -50], [6, -50], [13, -46], [14, -40], [10, -32], [6, -26], [-6, -26], [-10, -32], [-14, -40]];
  poly(torso, O[2], O[1]);
  poly([[-13, -46], [-6, -50], [-4, -42], [-9, -32], [-14, -40]], O[1]);                       /* shadow side */
  poly([[6, -50], [13, -46], [14, -40], [9, -36], [5, -44]], O[3]);                            /* lit side */
  poly([[-6, -50], [6, -50], [3, -48], [-3, -48]], O[4]);                                      /* collarbone rim */
  poly([[-4, -42], [4, -42], [3, -33], [0, -30], [-3, -33]], O[1], O[2]);                      /* sternum plate */
  /* ember veins: fewer + dull in phase 1, a web in phase 3 */
  { const set = [[[-8, -45], [-6, -39], [-8, -34]], [[7, -44], [5, -38], [7, -32]], [[0, -41], [1, -36], [0, -30]], [[-3, -47], [-9, -41]], [[4, -47], [10, -42]], [[-6, -33], [-3, -28]], [[5, -33], [3, -28]], [[11, -41], [9, -35]]];
    const n = ph === 1 ? 3 : ph === 2 ? 5 : 8; for (let i = 0; i < n; i++) vein(set[i]); if (ph === 3) { const e = T(0, -37); circle(g, e[0], e[1], 2, V[2]); circle(g, e[0], e[1], 1, V[4]); } else if (ph === 2) { const e = T(0, -37); px(g, e[0], e[1], V[3]); } }
  if (ph === 1) for (let i = 0; i < 26; i++) { const p = T(-11 + rnd() * 22, -33 + rnd() * 9); if (rnd() < 0.55) { g.clearRect(p[0] | 0, p[1] | 0, 1, 1); } else px(g, p[0], p[1], S[2]); }   /* crumbling edge: he is not whole yet */
  /* shoulder shards: phase 2 small, phase 3 great jagged pauldrons with a hot seam */
  if (ph >= 2) for (const sd of [-1, 1]) { const k = ph === 3 ? 1.5 : 1; poly([[sd * 12, -48], [sd * (17 + 4 * k), -54 - 4 * k], [sd * (21 + 3 * k), -46], [sd * 15, -42]], O[3], O[1]); poly([[sd * 12, -48], [sd * (17 + 4 * k), -54 - 4 * k], [sd * 15, -46]], O[4]); if (ph === 3) vein([[sd * 15, -47], [sd * 19, -47]]); }

  /* 5. HEAD: black-glass face, a brow of cracks, ember eyes; horns - broken in phase 1, a crown in 2-3 */
  const hc = [1, -56];
  poly([[-6, -54], [-5, -61], [5, -61], [7, -54], [5, -49], [0, -47], [-5, -49]], O[2], O[1]);
  poly([[-6, -54], [-5, -61], [0, -61], [-1, -52], [-5, -49]], O[1]); poly([[3, -61], [5, -61], [7, -54], [5, -50], [2, -52]], O[3]);
  poly([[-5, -56], [6, -56], [5, -54], [-4, -54]], O[0]);                                       /* the brow shadow */
  poly([[-3, -47], [3, -47], [0, -44]], O[1]);                                                  /* the chin spike */
  { const ey = spec.scream ? SCREAM : EYE[ph - 1]; rect(g, T(1, -55)[0], T(1, -55)[1], 3, 2, ey); rect(g, T(-4, -55)[0], T(-4, -55)[1], 2, 2, ey); px(g, T(2, -55)[0], T(2, -55)[1] - 1, ey); }
  if (spec.scream) { const m = T(0, -49); rect(g, m[0] - 2, m[1], 5, 2, V[1]); px(g, m[0], m[1], V[3]); }
  vein([[-2, -61], [-1, -58], [-3, -56]]);
  /* horns: swept back + up from the temples, ivory with a dark root */
  { const hornPoly = (sd, len, up, thick) => { const r = T(sd * 4, -60), tip = T(sd * (6 + len * 0.4), -60 - up), mid = T(sd * (5 + len * 0.5), -61 - up * 0.45), r2 = T(sd * 4 + sd * thick, -57);
      fillPoly(g, [r, mid, tip, [mid[0] + sd * thick * 0.8, mid[1] + thick], r2], H[1]); fillPoly(g, [r, mid, tip, [mid[0] - 1, mid[1] + 1]], H[2]); px(g, tip[0], tip[1], H[3]); px(g, r[0], r[1] + 1, H[0]); };
    hornPoly(1, 9, ph === 3 ? 20 : 15, 3); if (ph === 1) { const r = T(-4, -60), t = T(-6, -65); fillPoly(g, [r, t, [t[0] + 3, t[1]], T(-1, -59)], H[1]); px(g, t[0], t[1], H[0]); }   /* the far horn is a snapped stub */
    else hornPoly(-1, 9, ph === 3 ? 20 : 15, 3);
    if (ph >= 2) { const n = ph === 3 ? 5 : 3; for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 2.8, y = -62 - (ph === 3 ? 4 : 2) + Math.abs(i - (n - 1) / 2) * 1.2; const b = T(x, -61), t = T(x, y - 3 + (ph === 3 ? -2 : 0)); fillPoly(g, [[b[0] - 1, b[1]], [b[0] + 1.5, b[1]], t], H[2]); px(g, t[0], t[1] - 1, ph === 3 ? V[3] : H[3]); } } }

  /* 6. NEAR ARM + the broken seal chain on this wrist */
  const el = drawArm(shN[0], shN[1], two ? hx : hx, hy, true);
  { const wx = hx - (hx - el[0]) * 0.18, wy = hy - (hy - el[1]) * 0.18, dx = hx - el[0], dy = hy - el[1], l = Math.hypot(dx, dy) || 1;
    seg(g, wx - dx / l * 1.5, wy - dy / l * 1.5, wx + dx / l * 1.5, wy + dy / l * 1.5, 5, 5, I[1]); px(g, wx, wy - 2, I[3]); px(g, wx - 1, wy - 2, I[2]);
    for (let i = 0; i < 3; i++) { const lx = wx + (fr ? 1 : 0) + i, ly = wy + 3 + i * 3 + (i % 2); rect(g, lx - 1, ly, 2, 3, i % 2 ? I[1] : I[3]); px(g, lx, ly + 1, I[0]); } px(g, wx + 3, wy + 12, V[1]); }   /* parted link, still hot */

  /* 7. embers drifting off him (frame-shifted) */
  for (let i = 0; i < 6; i++) { const t = (i * 0.19 + fr * 0.1) % 1, p = T(-12 + (i * 5.3) % 24, -50 + t * 18); px(g, p[0], p[1], V[i % 3 === 0 ? 3 : 1]); }
  clean(c); outline(c, OUT);
  s = { c, ax: A.ax, ay: A.ay, hand: [hx, hy], prone }; void handSp; void fl; void ellipse; cache.set(key, s); return s;
}

/* ---- BOLTS: the hellbolt (red-black orb, white core), the feint (dim, cracked, no core), the returns (pale gold / white-gold), the bat-back (red flash). draw straight onto the world ctx ---- */
const hexn = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
void hexn;
export function drawBolt(g, x, y, r, kind, time, vx = 0, vy = 0) {
  const fl = Math.floor(time * 12) % 2, spd = Math.hypot(vx, vy) || 1, ux = -vx / spd, uy = -vy / spd;
  if (kind === 'in') {            /* HELLBOLT: smoke trail, black body with a crimson rim, a seething white core, 3 orbiting sparks, and the gold returnable ring */
    for (let i = 4; i >= 1; i--) circle(g, x + ux * i * 4.5, y + uy * i * 4.5, r - i * 1.1, i > 2 ? '#2a0810' : '#4a0e18', '#1a0610');
    circle(g, x, y, r + 1, '#1a0610'); circle(g, x, y, r, '#c0283a', '#7a1020'); circle(g, x, y, r - 1.5, '#3a0a14', '#5a1020');
    circle(g, x - 1, y - 1, r * 0.52 + fl * 0.5, '#ff7a5a'); circle(g, x - 1, y - 1, r * 0.34, '#ffffff'); px(g, x - 2, y - 2, '#ffffff');
    for (let i = 0; i < 3; i++) { const a = time * 7 + i * 2.094; px(g, x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2), '#ff9a3a'); }
    g.strokeStyle = '#ffd36b'; g.globalAlpha = 0.5 + 0.3 * fl; g.beginPath(); g.arc(x, y, r + 3.5, 0, 7); g.stroke(); g.globalAlpha = 1; return;
  }
  if (kind === 'feint') {         /* FEINT: the same orb gone cold and wrong - cracked, flickering, NO white core */
    g.globalAlpha = 0.5 + 0.35 * fl; circle(g, x, y, r, '#3a1a3a', '#1a0a1e'); circle(g, x, y, r - 2, '#120612'); line(g, x - r + 2, y - 1, x + r - 2, y + 1, '#6a2a5a'); line(g, x - 1, y - r + 2, x + 1, y + r - 2, '#6a2a5a'); g.globalAlpha = 1; return;
  }
  if (kind === 'bat') {           /* BATTED BACK: red-hot, a flare of sparks */
    for (let i = 3; i >= 1; i--) circle(g, x + ux * i * 4, y + uy * i * 4, r - i, i > 1 ? '#7a1a12' : '#c0382a');
    circle(g, x, y, r + 2, '#ff4a3a', '#7a1a12'); circle(g, x, y, r, '#ff8a7a'); circle(g, x, y, r * 0.5, '#ffffff');
    for (let i = 0; i < 4; i++) { const a = time * 11 + i * 1.57; px(g, x + Math.cos(a) * (r + 4), y + Math.sin(a) * (r + 4), '#ffd36b'); } return;
  }
  const pw = kind === 'pow';      /* RETURNS: gold comet. The power return is bigger, white-gold, with a cross-flare and a ring that chimes outward */
  for (let i = 5; i >= 1; i--) circle(g, x + ux * i * (pw ? 5 : 4), y + uy * i * (pw ? 5 : 4), Math.max(1, r - i * (pw ? 0.8 : 1)), pw ? (i > 3 ? '#f2d878' : '#fff4c0') : (i > 3 ? '#a8842a' : '#d8b850'));
  circle(g, x, y, r + 1, pw ? '#ffe08a' : '#a8842a'); circle(g, x, y, r, pw ? '#fffbe8' : '#f2e2a0'); circle(g, x, y, r * 0.55, '#ffffff');
  if (pw) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(x - r - 4), Math.round(y), 2 * r + 8, 1); g.fillRect(Math.round(x), Math.round(y - r - 4), 1, 2 * r + 8);
    g.strokeStyle = '#fff4c0'; g.globalAlpha = 0.6; g.beginPath(); g.arc(x, y, r + 4 + (time * 14 % 6), 0, 7); g.stroke(); g.globalAlpha = 1; }
  else for (let i = 0; i < 3; i++) { const a = time * 9 + i * 2.1; px(g, x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2), '#fff4c0'); }
}
/* the orb in his hand (windup): grows with k; `kind` grow | dim | two | glyph */
export function drawHandOrb(g, x, y, k, kind, time) {
  const r = 3 + k * 4.5;
  if (kind === 'dim') { drawBolt(g, x, y, r, 'feint', time); return; }
  g.globalAlpha = 0.25 + 0.2 * k; circle(g, x, y, r + 4 + k * 2, '#c0283a'); g.globalAlpha = 1;
  circle(g, x, y, r + 1, '#1a0610'); circle(g, x, y, r, '#c0283a', '#7a1020'); circle(g, x, y, r - 1.5, '#3a0a14'); circle(g, x, y, Math.max(1, r * 0.4), '#ffffff');
  for (let i = 0; i < 3; i++) { const a = time * 8 + i * 2.1 - k * 6, rr = r + 4 - k * 2; px(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr, i ? '#ff9a3a' : '#ffd36b'); }
}
/* the summoning glyph above his head (imps): a ring of runes that tightens, and the ring on the back where an imp lands */
export function drawGlyph(g, x, y, k, time, flat = false) {
  const rx = flat ? 11 : 7 + k * 4, ry = flat ? 3.4 : rx;
  g.strokeStyle = '#c04a7a'; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.stroke();
  g.strokeStyle = '#7a2a5a'; g.beginPath(); g.ellipse(x, y, rx * 0.62, ry * 0.62, 0, 0, 7); g.stroke();
  for (let i = 0; i < 6; i++) { const a = time * 2 + i * 1.047; px(g, x + Math.cos(a) * rx, y + Math.sin(a) * ry, i % 2 ? '#ff4a3a' : '#f090b0'); }
  if (flat) for (let i = 0; i < 5; i++) { const t = (time * 0.9 + i * 0.2) % 1; px(g, x - 6 + i * 3, y - t * 10 * k - 1, i % 2 ? '#ff9a3a' : '#ffe08a'); }
}
/* the lava bomb: a molten ball with a heat shimmer + ember tail (falls from the eruption), and its landing ring (told) */
export function drawBomb(g, x, y, time) {
  for (let i = 3; i >= 1; i--) circle(g, x + 1, y - i * 4, 4 - i * 0.7, i > 1 ? '#6a2410' : '#c0501a');
  circle(g, x, y, 5, '#3a1008'); circle(g, x, y, 4, '#a8301a', '#7a1a10'); circle(g, x - 1, y - 1, 2.5, '#ff7a2a'); px(g, x - 2, y - 2, '#ffe08a'); px(g, x - 1, y - 2, '#ffe08a');
  if (Math.floor(time * 14) % 2) { px(g, x + 5, y - 1, '#ff9a3a'); px(g, x - 5, y + 1, '#ff5a1a'); }
}

/* ---- HUD: the Demon King's bar (three phase segments in a bone-and-iron frame) and his three pips (ember gems; two lit = white-gold) ---- */
export function drawKingBar(g, cx, y, w, fill, ph, open, time) {
  const x = Math.round(cx - w / 2), seg = w / 3;
  g.fillStyle = '#100b16'; g.fillRect(x - 3, y - 3, w + 6, 10); g.fillStyle = '#5a5248'; g.fillRect(x - 3, y - 3, w + 6, 1); g.fillRect(x - 3, y + 6, w + 6, 1); g.fillRect(x - 3, y - 3, 1, 10); g.fillRect(x + w + 2, y - 3, 1, 10);
  g.fillStyle = '#b8ac98'; g.fillRect(x - 3, y - 3, 2, 2); g.fillRect(x + w + 1, y - 3, 2, 2); g.fillRect(x - 3, y + 5, 2, 2); g.fillRect(x + w + 1, y + 5, 2, 2);
  for (let i = 0; i < 3; i++) { const p = i + 1, sx = x + Math.round((2 - i) * seg), cur = p === ph, f = Math.max(0, Math.min(1, fill[i]));
    g.fillStyle = '#2a1018'; g.fillRect(sx + 1, y, Math.round(seg) - 2, 4);
    g.fillStyle = cur ? (open ? '#ffd36b' : '#c0283a') : '#6a2430'; g.fillRect(sx + 1, y, Math.round((seg - 2) * f), 4);
    if (cur) { g.fillStyle = open ? '#fff4c0' : '#ff6a4a'; g.fillRect(sx + 1, y, Math.round((seg - 2) * f), 1); }
    if (i < 2) { g.fillStyle = '#8a8070'; g.fillRect(sx - 1, y - 2, 2, 8); } }
  if (open && Math.floor(time * 6) % 2) { g.fillStyle = 'rgba(255,211,107,0.35)'; g.fillRect(x - 3, y - 4, w + 6, 1); g.fillRect(x - 3, y + 7, w + 6, 1); }
}
export function drawPip(g, cx, cy, lit, power, time) {
  const x = Math.round(cx), y = Math.round(cy);
  const dia = (r, c) => { for (let dy = -r; dy <= r; dy++) { const w = r - Math.abs(dy); g.fillStyle = c; g.fillRect(x - w, y + dy, 2 * w + 1, 1); } };
  dia(4, '#100b16'); dia(3, lit ? (power ? '#fff4c0' : '#ff9a3a') : '#3a2a3a');
  if (lit) { dia(2, power ? '#ffffff' : '#ffd36b'); g.fillStyle = '#ffffff'; g.fillRect(x - 1, y - 1, 1, 1); if (Math.floor(time * 5) % 2) g.fillRect(x, y - 4, 1, 1); }
  else { g.fillStyle = '#5a4a5a'; g.fillRect(x - 1, y - 2, 1, 1); }
}
