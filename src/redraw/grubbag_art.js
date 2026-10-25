// grubbag_art.js - LORD GRUBBAG THE GLUTTON's art (claude/kitchengateart): him, his reinforced chair, the high table, the pie oven and its hatch, the serving line's dishes and the POWDER PIE.
// The drawing contract is src/grubbag-hands.js POSE (B16: every move its own windup and release pose) - this file only changes how a pose is DRAWN, never what poses there are.
// Local px, facing right, his seat on the floor at 0,0. He is the goblin queen's brother: green, vast, in the queen's plum, a napkin tucked under his jowls, a gold circlet that
// no longer fits, an iron-banded chair bolted to the floor. Pixel ellipses and lines from px.js, one dark outline round every mass, light from the upper left.
import { ellipse, line, fillPoly, rect } from '../px.js';
const R = Math.round;
export const SK = { out: '#1a1410', skin: '#7a8a52', skinD: '#4e5a32', skinDD: '#33401f', skinL: '#a0b070', skinLL: '#c4d494', fat: '#9aa868', robe: '#6a2a3a', robeD: '#3e1622', robeL: '#8e3c50', trim: '#ffd36b', trimD: '#b08a30',
  oak: '#4a3020', oakD: '#2a1a10', oakL: '#6e4a2e', oakLL: '#8e6440', iron: '#3a3a42', ironD: '#22222a', ironL: '#7a7a86', ironLL: '#b0b0bc', bib: '#e8e0d0', bibD: '#b8ae98', gravy: '#7a4a22', gravyL: '#a8743a',
  eye: '#ffe9a0', red: '#ff4a2a', mouth: '#2a0e0e', tooth: '#efe6cf', toothD: '#b8ac90', dish: '#c8ccd4', dishD: '#8a8e96', food: '#a0602a', foodL: '#d08a44', pie: '#c0302a', pieL: '#ff8a5c', pieD: '#7a1a18', copper: '#b8673a', copperL: '#e09a5c', copperD: '#6a3418' };
const mk = (g, flash) => {
  const c = col => (flash ? '#ffffff' : col);
  return { c, r: (x, y, w, h, col) => rect(g, R(x), R(y), R(w), R(h), c(col)), e: (cx, cy, rx, ry, col) => ellipse(g, R(cx), R(cy), rx, ry, c(col)), l: (x0, y0, x1, y1, col, t = 1) => line(g, R(x0), R(y0), R(x1), R(y1), c(col), t),
    p: (pts, col) => fillPoly(g, pts.map(q => [R(q[0]), R(q[1])]), c(col)) };
};
/* ---------------------------------------------------------------- THE CHAIR: tall oak back banded in iron, bolted arms, a plum cushion, boar skulls on the finials ---------------------------------------------------------------- */
function chair(g, flash) {
  const k = mk(g, flash);
  k.r(-34, -92, 58, 92, SK.out);
  k.r(-32, -90, 54, 90, SK.oak); k.r(-32, -90, 54, 3, SK.oakLL); k.r(-32, -90, 3, 90, SK.oakL); k.r(19, -90, 3, 90, SK.oakD);
  for (let x = -26; x < 20; x += 12) { k.r(x, -86, 1, 82, SK.oakD); k.r(x + 1, -86, 1, 82, SK.oakL); }   /* the planks' seams */
  for (const y of [-72, -48, -22]) { k.r(-33, y, 56, 5, SK.ironD); k.r(-33, y, 56, 1, SK.ironL); k.r(-33, y + 4, 56, 1, SK.out); for (let x = -29; x < 22; x += 11) { k.r(x, y + 1, 2, 2, SK.ironLL); } }   /* iron bands, riveted */
  /* the finials: a boar skull on each post */
  for (const x of [-30, 18]) { k.e(x + 3, -96, 5, 4, SK.bib); k.r(x, -94, 7, 3, SK.bibD); k.r(x + 1, -97, 2, 2, SK.out); k.r(x + 4, -97, 2, 2, SK.out); k.r(x + 5, -92, 6, 2, SK.bib); }
  /* arms and the seat */
  k.r(-40, -30, 10, 30, SK.out); k.r(-39, -29, 8, 28, SK.oakL); k.r(-39, -29, 8, 2, SK.oakLL); k.r(-39, -24, 8, 3, SK.ironD); k.r(-37, -23, 2, 1, SK.ironLL);
  k.r(24, -30, 10, 30, SK.out); k.r(25, -29, 8, 28, SK.oakL); k.r(25, -29, 8, 2, SK.oakLL); k.r(25, -24, 8, 3, SK.ironD); k.r(27, -23, 2, 1, SK.ironLL);
  k.r(-30, -10, 56, 10, SK.robeD); k.r(-30, -10, 56, 2, SK.robeL); k.r(-30, -2, 56, 2, SK.out);
}
/* ---------------------------------------------------------------- THE GREAT FORK ---------------------------------------------------------------- */
function fork(g, flash, fx, fy, fa, fl) {
  const k = mk(g, flash); g.save(); g.translate(fx, fy); g.rotate(fa);
  k.r(-2, -2, fl + 2, 5, SK.out); k.r(0, -1, fl, 3, SK.dishD); k.r(0, -1, fl, 1, SK.ironLL);   /* the shaft */
  k.r(fl, -7, 4, 15, SK.out); k.r(fl + 1, -6, 2, 13, SK.dish);   /* the neck */
  for (const ty of [-6, -1, 4]) { k.r(fl + 3, ty - 1, 12, 4, SK.out); k.r(fl + 4, ty, 11, 2, SK.dish); k.r(fl + 4, ty, 11, 1, SK.ironLL); k.r(fl + 13, ty, 3, 2, SK.ironLL); }   /* three tines */
  k.r(-5, -3, 4, 7, SK.oakD); k.r(-4, -2, 2, 5, SK.oakL);   /* the butt */
  g.restore();
}
/* ---------------------------------------------------------------- A HAND: four greasy sausage fingers ---------------------------------------------------------------- */
function hand(g, flash, x, y, open) {
  const k = mk(g, flash);
  k.e(x, y, 6, 6, SK.out); k.e(x, y, 5, 5, SK.skin); k.e(x - 1, y - 2, 3, 2, SK.skinL);
  if (open) for (let i = 0; i < 4; i++) { k.r(x + 4, y - 6 + i * 3, 7, 3, SK.out); k.r(x + 4, y - 5 + i * 3, 6, 2, SK.skin); k.r(x + 4, y - 5 + i * 3, 6, 1, SK.skinL); }
}
function arm(g, flash, x0, y0, x1, y1, near) {
  const k = mk(g, flash), sleeve = near ? SK.robe : SK.robeD;
  k.l(x0, y0, x1, y1, SK.out, 11); k.l(x0, y0, x1, y1, sleeve, 9); k.l(x0 - 1, y0 - 2, x1 - 1, y1 - 2, near ? SK.robeL : SK.robe, 2);
  const mx = x0 + (x1 - x0) * 0.78, my = y0 + (y1 - y0) * 0.78; k.l(mx, my, x1, y1, SK.out, 9); k.l(mx, my, x1, y1, near ? SK.skin : SK.skinD, 7);   /* the bare forearm out of the cuff */
  k.l(mx, my, mx + 1, my + 1, SK.trim, 9);   /* the gold cuff */
}
/* ---------------------------------------------------------------- HIM ---------------------------------------------------------------- */
export function drawGrubbagArt(g, p, flash, time, holding) {
  const k = mk(g, flash), lean = p.lean || 0, bk = p.belly || 1;
  chair(g, flash);
  g.save(); g.translate(lean, 0); if (p.tilt) g.rotate(p.tilt * 0.15);
  arm(g, flash, -8, -44, p.far[0], p.far[1], false); hand(g, flash, p.far[0], p.far[1], false);
  /* legs, short under the belly: slippers */
  for (const x of [-16, 5]) { k.r(x, -9, 15, 9, SK.out); k.r(x + 1, -8, 13, 6, SK.robeD); k.r(x - 1, -3, 17, 4, SK.out); k.r(x, -3, 15, 3, SK.trimD); k.r(x, -3, 15, 1, SK.trim); }
  /* the robe: plum, gold-hemmed, a sash */
  k.e(0, -34, 23, 24, SK.out); k.e(0, -34, 22, 23, SK.robe); k.e(-8, -42, 10, 12, SK.robeL);
  k.r(-22, -14, 44, 4, SK.out); k.r(-21, -15, 42, 3, SK.trim); k.r(-21, -15, 42, 1, '#fff0b0');
  /* the belly: bursting out between the robe's lapels, the buttons gone */
  const bw = 17 * bk, bh = 15 * bk, by = -22;
  k.e(4, by, bw + 1, bh + 1, SK.out); k.e(4, by, bw, bh, p.red ? '#a85a42' : SK.skin); k.e(0, by - 5 * bk, bw * 0.6, bh * 0.55, p.red ? '#c8785a' : SK.skinL); k.e(3, by + bh * 0.35, bw * 0.4, 1, SK.skinD);
  k.r(5, by + 1, 2, 2, SK.skinDD);   /* the navel */
  /* the napkin tucked in his collar, with the gravy on it */
  k.p([[-10, -52], [14, -52], [11, -26], [2, -20], [-7, -26]], SK.out); k.p([[-9, -51], [13, -51], [10, -27], [2, -22], [-6, -27]], SK.bib);
  k.l(-8, -50, 10, -50, '#ffffff', 1); k.r(-6, -40, 6, 4, SK.gravy); k.r(-3, -36, 3, 6, SK.gravy); k.r(3, -45, 4, 3, '#a8402a'); k.r(1, -33, 5, 2, SK.gravyL);
  k.r(-4, -47, 1, 14, SK.bibD); k.r(5, -47, 1, 12, SK.bibD);
  /* the head */
  const [hx, hy] = p.head, H0 = -66 + hy;
  for (const s of [-1, 1]) { const ex = hx + 1 + s * 14; k.p([[ex, H0 + 7], [ex + s * 12, H0 + 1 + (s < 0 ? 3 : 0)], [ex + s * 2, H0 + 13]], SK.out); k.p([[ex + s * 0, H0 + 8], [ex + s * 9, H0 + 3 + (s < 0 ? 3 : 0)], [ex + s * 2, H0 + 12]], s < 0 ? SK.skinD : SK.skin); }   /* the pointed ears */
  k.e(hx + 1, H0 + 9, 15, 13, SK.out); k.e(hx + 1, H0 + 9, 14, 12, p.red ? '#b05a42' : SK.skin);
  k.e(hx - 2, H0 + 4, 8, 5, p.red ? '#c8785a' : SK.skinL); k.e(hx + 1, H0 + 17, 13, 5, p.red ? '#8e3e2c' : SK.skinD);   /* the cheek light; the jowls' shade */
  k.e(hx - 9, H0 + 14, 6, 5, SK.skin); k.e(hx + 11, H0 + 14, 6, 5, SK.skinD);   /* jowls hanging over the napkin */
  /* the circlet, a size too small */
  k.r(hx - 11, H0 - 3, 25, 5, SK.out); k.r(hx - 10, H0 - 2, 23, 3, SK.trim); k.r(hx - 10, H0 - 2, 23, 1, '#fff0b0'); k.r(hx - 10, H0, 23, 1, SK.trimD);
  for (const x of [-9, -1, 7]) { k.p([[hx + x, H0 - 3], [hx + x + 2, H0 - 9], [hx + x + 4, H0 - 3]], SK.out); k.p([[hx + x + 1, H0 - 3], [hx + x + 2, H0 - 7], [hx + x + 3, H0 - 3]], SK.trim); }
  k.r(hx - 1, H0 - 2, 3, 3, '#e0302a'); k.r(hx - 1, H0 - 2, 1, 1, '#ffb0a0');
  /* the eyes: small, piggy, under a heavy brow */
  const ey = p.eyes;
  k.r(hx + 1, H0 + 2, 12, 2, SK.skinDD);
  if (ey === 'shut') { k.r(hx + 3, H0 + 6, 7, 1, SK.out); k.r(hx - 6, H0 + 6, 5, 1, SK.out); }
  else { const bul = ey === 'bulge'; for (const [x, w] of [[hx + 3, bul ? 8 : 7], [hx - 7, bul ? 7 : 6]]) { k.r(x - 1, H0 + 3, w + 2, (bul ? 8 : 6) + 2, SK.out); k.r(x, H0 + 4, w, bul ? 8 : 5, ey === 'red' ? SK.red : SK.eye); k.r(x + (w >> 1), H0 + 5, 2, bul ? 4 : 3, '#1a1010'); if (bul) k.r(x, H0 + 4, 2, 2, '#ffffff'); } }
  /* the nose: a boil of a nose, two nostrils */
  k.e(hx + 6, H0 + 11, 4, 3, SK.out); k.e(hx + 6, H0 + 11, 3, 2, SK.fat); k.r(hx + 5, H0 + 12, 1, 1, SK.skinDD); k.r(hx + 8, H0 + 12, 1, 1, SK.skinDD);
  /* the mouth: a wide wet mouth and the tusks */
  const mo = p.mouth, my = H0 + 16;
  if (mo === 'wide') { k.r(hx - 8, my - 3, 20, 11, SK.out); k.r(hx - 7, my - 2, 18, 9, SK.mouth); k.r(hx - 4, my + 3, 12, 4, '#a8403a'); for (const x of [-6, 0, 6, 10]) k.r(hx + x, my - 2, 3, 3, SK.tooth); k.r(hx - 8, my - 7, 3, 7, SK.tooth); k.r(hx + 11, my - 7, 3, 7, SK.tooth); }
  else if (mo === 'open') { k.r(hx - 4, my - 2, 15, 7, SK.out); k.r(hx - 3, my - 1, 13, 5, SK.mouth); k.r(hx - 2, my - 1, 3, 2, SK.tooth); k.r(hx + 6, my - 1, 3, 2, SK.tooth); k.r(hx - 8, my - 6, 3, 6, SK.tooth); k.r(hx + 11, my - 6, 3, 6, SK.tooth); }
  else if (mo === 'chew') { const j = Math.floor(time * 6) % 2; k.r(hx - 4, my - 1, 14, 3 + j, SK.out); k.r(hx - 3, my, 12, 1 + j, SK.mouth); k.r(hx - 8, my - 5, 3, 5, SK.tooth); k.r(hx + 11, my - 5, 3, 5, SK.tooth); if (j) k.r(hx + 8, my + 2, 2, 3, SK.gravyL); }
  else { k.r(hx - 4, my, 14, 1, SK.out); k.r(hx - 8, my - 5, 3, 6, SK.tooth); k.r(hx + 11, my - 5, 3, 6, SK.tooth); }
  fork(g, flash, p.fork[0], p.fork[1], p.fork[2], p.fork[3]);
  if (p.arm) { k.l(-8, -44, p.hand[0], p.hand[1], SK.out, 11); k.l(-8, -44, p.hand[0], p.hand[1], SK.skin, 9); hand(g, flash, p.hand[0], p.hand[1], true); }
  else { arm(g, flash, 8, -44, p.hand[0], p.hand[1], true); hand(g, flash, p.hand[0], p.hand[1], !!p.fingers); }
  if (p.item === 'drumstick') { k.e(p.hand[0], p.hand[1] - 8, 6, 5, SK.out); k.e(p.hand[0], p.hand[1] - 8, 5, 4, SK.food); k.e(p.hand[0] - 1, p.hand[1] - 10, 3, 2, SK.foodL); k.r(p.hand[0] + 4, p.hand[1] - 9, 5, 2, SK.tooth); k.r(p.hand[0] + 8, p.hand[1] - 11, 2, 2, SK.tooth); k.r(p.hand[0] + 8, p.hand[1] - 7, 2, 2, SK.tooth); }
  if (p.item === 'dish' && holding) { dish(g, flash, p.hand[0], p.hand[1] - 3, holding, time); }
  g.restore();
  /* the gravy cauldron at his side: copper, banded, with a ladle */
  g.save(); g.translate(-42, -2); g.rotate(-(p.cauldron || 0));
  k.e(0, -10, 13, 11, SK.out); k.e(0, -10, 12, 10, SK.copper); k.e(-4, -13, 6, 5, SK.copperL); k.r(-12, -19, 24, 5, SK.out); k.r(-11, -18, 22, 3, SK.copperL); k.r(-9, -17, 18, 2, SK.gravy); k.r(-6, -17, 5, 1, SK.gravyL); k.r(-12, -9, 24, 2, SK.copperD);
  k.r(-15, -17, 4, 8, SK.out); k.r(-14, -16, 2, 6, SK.copperD); k.r(11, -17, 4, 8, SK.out); k.r(11, -16, 2, 6, SK.copperD);
  g.restore();
  if (p.rings) { const q = (time * 3) % 1; g.strokeStyle = 'rgba(160,200,90,' + (1 - q).toFixed(2) + ')'; g.beginPath(); g.arc(16 + p.head[0], -56, 6 + q * 26, -0.8, 0.8); g.stroke(); }
  if (p.smoke) for (let q = 0; q < 5; q++) { const a = time * 3 + q * 1.3, yy = -84 - ((time * 20 + q * 8) % 30); g.globalAlpha = 0.7 * (1 - (((time * 20 + q * 8) % 30) / 30)); rect(g, R(8 + Math.cos(a) * 10), R(yy), 6, 5, '#46403c'); g.globalAlpha = 1; }
  if (p.zzz) { const q = (time * 0.8) % 1; g.globalAlpha = 1 - q; rect(g, 12, R(-84 - q * 14), 5, 1, '#e8e0d0'); rect(g, 16, R(-84 - q * 14), 1, 4, '#e8e0d0'); rect(g, 12, R(-80 - q * 14), 5, 1, '#e8e0d0'); g.globalAlpha = 1; }
  if (p.cough) for (let q = 0; q < 3; q++) rect(g, 18 + q * 6, R(-58 - (time * 30 + q * 7) % 10), 3, 3, 'rgba(200,190,170,0.7)');
}
/* ---------------------------------------------------------------- DISHES, THE POWDER PIE ---------------------------------------------------------------- */
export function dish(g, flash, dx, dy, kind, time) {
  const k = mk(g, flash);
  k.r(dx - 11, dy - 1, 22, 5, SK.out); k.r(dx - 10, dy, 20, 3, SK.dish); k.r(dx - 10, dy, 20, 1, '#ffffff'); k.r(dx - 8, dy + 3, 16, 1, SK.dishD);
  if (kind === 'pie') {
    k.e(dx, dy - 4, 9, 6, SK.out); k.e(dx, dy - 4, 8, 5, SK.pie); k.e(dx - 2, dy - 6, 4, 2, SK.pieL); k.r(dx - 7, dy - 3, 15, 2, SK.pieD);
    for (const x of [-5, -1, 3, 6]) k.r(dx + x, dy - 3, 1, 3, SK.pieD);   /* the crimped crust */
    k.r(dx + 1, dy - 14, 2, 8, SK.out); k.r(dx + 1, dy - 13, 1, 6, '#6a5a3a');   /* the fuse, out of the crust */
    if (Math.floor(time * 12) % 2) { k.r(dx - 1, dy - 17, 5, 5, '#ffd36b'); k.r(dx, dy - 16, 3, 3, '#ffffff'); } else { k.r(dx, dy - 16, 3, 3, '#ff9a3c'); k.r(dx + 1, dy - 18, 1, 2, '#ffd36b'); }
    g.globalAlpha = 0.3; rect(g, dx - 10, dy - 10, 20, 12, '#ff5a2a'); g.globalAlpha = 1;
  } else {
    k.e(dx, dy - 4, 8, 5, SK.out); k.e(dx, dy - 4, 7, 4, SK.food); k.e(dx - 2, dy - 6, 3, 2, SK.foodL); k.r(dx + 5, dy - 8, 6, 2, SK.tooth); k.r(dx + 10, dy - 10, 2, 2, SK.tooth); k.r(dx + 10, dy - 6, 2, 2, SK.tooth);   /* a roast with the bone out */
    k.r(dx - 8, dy - 2, 3, 2, '#5a8a2a'); k.r(dx - 10, dy - 3, 2, 2, '#8ac03a');   /* a sprig of something green */
  }
}
/* ---------------------------------------------------------------- THE HALL: the pie oven in its hatch, the high table ---------------------------------------------------------------- */
export function drawOven(g, ox, fy, st, time) {
  const k = mk(g, false), hot = st === 'bake' || st === 'out';
  /* the brick arch of the oven and the kitchen hatch above it */
  k.r(ox - 26, fy - 60, 52, 60, SK.out); k.r(ox - 24, fy - 58, 48, 58, '#5a4a40');
  for (let y = fy - 58; y < fy; y += 6) { k.r(ox - 24, y, 48, 1, '#3a2c24'); for (let x = ox - 24 + ((((y - fy) / 6) | 0) & 1) * 6; x < ox + 24; x += 12) k.r(x, y, 1, 6, '#3a2c24'); }
  k.r(ox - 24, fy - 58, 48, 2, '#8a7a6a'); k.r(ox - 24, fy - 58, 2, 58, '#7a6a5a');
  k.e(ox, fy - 20, 15, 16, SK.out); k.r(ox - 15, fy - 20, 30, 20, SK.out); k.e(ox, fy - 20, 13, 14, '#120a08'); k.r(ox - 13, fy - 20, 26, 20, '#120a08');   /* the oven mouth */
  if (hot) { const q = 0.7 + 0.3 * Math.sin(time * 14); k.e(ox, fy - 14, 11, R(11 * q), '#c0401a'); k.e(ox, fy - 12, 8, R(8 * q), '#ff9a3c'); k.e(ox, fy - 11, 4, R(4 * q), '#ffe9a0');
    g.globalAlpha = 0.18; rect(g, ox - 40, fy - 50, 80, 50, '#ff8a3a'); g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) { const t = (time * 0.7 + i / 4) % 1; g.globalAlpha = 1 - t; rect(g, R(ox - 6 + Math.sin(time * 3 + i) * 6), R(fy - 64 - t * 22), 3, 3, '#5a504a'); g.globalAlpha = 1; } }
  else if (st === 'cold') { rect(g, ox - 8, fy - 8, 16, 3, '#c0401a'); if (Math.floor(time * 2) % 3 === 0) rect(g, ox - 2, fy - 10, 2, 2, '#ffd36b'); }
  else { rect(g, ox - 8, fy - 7, 16, 2, '#4a2a22'); }
  /* the hatch: a dark opening with a counter and a hook for the line */
  k.r(ox - 18, fy - 90, 36, 28, SK.out); k.r(ox - 16, fy - 88, 32, 24, '#1a1010'); k.r(ox - 18, fy - 64, 36, 4, '#6e4a2e'); k.r(ox - 18, fy - 64, 36, 1, '#8e6440');
  k.r(ox - 18, fy - 92, 36, 4, '#4a3020'); k.r(ox - 18, fy - 92, 36, 1, '#6e4a2e');
  for (let i = 0; i < 3; i++) { k.r(ox - 10 + i * 9, fy - 76, 3, 12, '#2a2020'); k.r(ox - 10 + i * 9, fy - 76, 3, 2, '#c8c8d0'); }   /* ladles and cleavers hung in the dark */
}
export function drawBellows(g, bx, fy, cold, time, pump) {
  const k = mk(g, false), p = pump || 0;
  k.r(bx - 9, fy - 4, 18, 4, SK.out); k.r(bx - 8, fy - 3, 16, 3, SK.oakD); k.r(bx - 8, fy - 3, 16, 1, SK.oakL);   /* the stand */
  k.p([[bx - 9, fy - 5 - p], [bx + 5, fy - 9 - p], [bx + 5, fy - 4], [bx - 9, fy - 4]], SK.out);
  k.p([[bx - 8, fy - 5 - p], [bx + 4, fy - 8 - p], [bx + 4, fy - 5], [bx - 8, fy - 5]], '#7a4a2a'); k.p([[bx - 8, fy - 5 - p], [bx + 4, fy - 8 - p], [bx + 4, fy - 7 - p], [bx - 8, fy - 6 - p]], '#a06a3e');   /* the leather bag */
  for (let x = bx - 6; x < bx + 4; x += 3) k.r(x, fy - 7, 1, 2, '#3a2010');   /* its folds */
  k.r(bx + 4, fy - 8, 7, 3, SK.out); k.r(bx + 4, fy - 7, 7, 1, SK.ironL); k.r(bx + 10, fy - 8, 3, 3, SK.ironD);   /* the nozzle */
  k.r(bx - 12, fy - 14 - p, 6, 2, SK.oakD); k.r(bx - 12, fy - 14 - p, 6, 1, SK.oakL); k.r(bx - 9, fy - 12 - p, 2, 6, SK.oakD);   /* the handle */
  if (cold) { g.strokeStyle = Math.floor(time * 3) % 2 ? '#ffd36b' : 'rgba(255,211,107,0.5)'; g.strokeRect(bx - 13.5, fy - 18.5, 28, 19); }
}
export function drawTable(g, t0, t1, fy, time) {
  const k = mk(g, false), w = t1 - t0;
  /* THE HIGH TABLE: a plum cloth to the floor with a gold fringe, the platters on it, a candelabra at each end */
  k.r(t0 - 2, fy - 24, w + 4, 24, SK.out); k.r(t0, fy - 22, w, 22, SK.robe); k.r(t0, fy - 22, w, 3, SK.robeL);
  for (let x = t0 + 6; x < t1 - 4; x += 10) { k.r(x, fy - 19, 1, 17, SK.robeD); }
  k.r(t0, fy - 4, w, 4, SK.trimD); for (let x = t0; x < t1; x += 3) k.r(x, fy - 3, 1, 4, SK.trim);   /* the fringe */
  k.r(t0 - 4, fy - 27, w + 8, 5, SK.out); k.r(t0 - 3, fy - 26, w + 6, 3, '#d8c8a8'); k.r(t0 - 3, fy - 26, w + 6, 1, '#fff0d0');
  for (let q = t0 + 6; q < t1 - 12; q += 18) { k.e(q + 6, fy - 29, 7, 3, SK.out); k.e(q + 6, fy - 29, 6, 2, SK.dish); k.e(q + 6, fy - 32, 5, 3, SK.food); k.e(q + 4, fy - 33, 2, 1, SK.foodL); }
  for (const cx of [t0 + 2, t1 - 3]) { k.r(cx - 1, fy - 40, 3, 13, SK.out); k.r(cx, fy - 39, 1, 12, SK.trim); k.r(cx - 2, fy - 28, 5, 2, SK.trimD); k.r(cx, fy - 44, 1, 4, '#ffffff'); const f = 0.6 + 0.4 * Math.sin(time * 9 + cx); k.r(cx - 1, fy - 48 + R(2 - 2 * f), 3, R(4 + 2 * f), '#ffd36b'); k.r(cx, fy - 46, 1, 2, '#ffffff'); }
}
/* the serving line's rail: an iron rail with S-hooks, from the hatch to his table */
export function drawLine(g, x0, y0, x1, y1, lineY, step) {
  const k = mk(g, false); g.strokeStyle = SK.out; g.lineWidth = 4; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  g.strokeStyle = SK.iron; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = SK.ironL; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, y0 - 1); g.lineTo(x1, y1 - 1); g.stroke(); g.lineWidth = 1;
  for (let q = x0 + 20; q < x1; q += step) { const yy = lineY(q); k.r(q - 1, yy - 12, 3, 12, SK.out); k.r(q, yy - 12, 1, 12, SK.ironL); k.r(q - 3, yy - 14, 7, 2, SK.out); }   /* braces up to the roof */
}
export function drawHooked(g, dx, hy, dy, kind, time) {
  const k = mk(g, false); k.r(dx - 1, hy, 3, dy - hy - 4, SK.out); k.r(dx, hy, 1, dy - hy - 4, SK.ironL); k.r(dx - 4, dy - 8, 9, 3, SK.out); k.r(dx - 3, dy - 7, 7, 1, SK.ironLL);   /* the hook and its chain */
  dish(g, false, dx, dy, kind, time);
}
