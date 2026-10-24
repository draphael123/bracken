// src/redraw/honey_hornet_art.js - THE FAT HONEY HORNET's SHEET (claude/hornetsnest2 greybox-plus -> claude/hornets2art the REAL REDRAW: hard pixels, inked, in the nest's palette).
// HONEY_POSE in src/honey-hornet.js is the contract: 0-1 fly, 2 drip tell, 3 drop, 4 ram tell, 5 ram, 6 reel, 7 drowsy, 8 hurt, 9 dead.
//   It is a hornet gone fat on the nest's honey: a small chestnut thorax (with a plated shoulder) and head (a hot red compound eye, pale mandibles) in front of a HUGE swollen abdomen.
//   THE ARMOUR is the read: the top of the abdomen is four overlapping lacquered chestnut PLATES, each with a bright rim on its leading edge, a dark seam behind it and a glint - like a
//   beetle's back - over a belly of amber banded black; a cut from behind lands on them (HONEY.armour). Under the tail a honey SAC that swells before a drip; two pairs of short wings
//   that look too small for it. Facing right, its feet (or the bottom of its hover box) at the anchor.
//   Per pose: the DRIP (sac swollen, a bead hanging, the head tipped down at you), the DROP (the sac let go, a glob falling), the RAM TELL (leaning back, wings a wide blur, the eye blazing,
//   dust pulled off the floor), the RAM (stretched, wings swept back, a SMEAR of speed streaks behind it), the REEL (crooked, dazed stars of ichor), DROWSY (down on the ground, wings
//   folded, eye shut, antennae drooping, a bead of honey at its mouth, a puddle under it), HURT (squint, the plates flashing), DEAD (on its back, legs curled, eye crossed, honey leaking).
//   bakeHoneyHornetSheet(canvas, flipX, whiten, HONEY) -> { R, L, white: { R, L }, ax, ay, w, h, card }
const W = 44, H = 34, AX = 22, AY = 31;
const INK = '#1a0c06', CH = ['#2a140a', '#4a2410', '#6e3a16', '#94521e'], AM = ['#7a4206', '#b8700f', '#e09a22', '#f8c24a', '#fff0a0'];
const PL = ['#120806', '#2a160c', '#4a2c16', '#74481e'], PLRIM = '#f0c878', PLGLINT = '#fff2c8';
const WING = ['#8aa4bc', '#c4d4e4', '#eef4fa'], HONEYC = ['#a8600a', '#e0a020', '#ffd36b', '#fff4b0'];
const px = (g, c, x, y) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
function blob(g, cx, cy, rx, ry, a, shade) { const R0 = Math.max(rx, ry) + 1, c = Math.cos(a), s = Math.sin(a);
  for (let y = Math.floor(cy - R0); y <= Math.ceil(cy + R0); y++) for (let x = Math.floor(cx - R0); x <= Math.ceil(cx + R0); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry; if (u * u + v * v > 1) continue; const col = shade(u, v, dx, dy); if (col) px(g, col, x, y); } }
function line(g, col, x0, y0, x1, y1) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) px(g, col, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); }
/* an outline: every empty pixel beside a filled one, inked */
function ink(c, g) { const d = g.getImageData(0, 0, c.width, c.height), a = d.data, w = c.width, h = c.height, on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && a[(y * w + x) * 4 + 3] > 40;
  const out = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!on(x, y) && (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1))) out.push([x, y]); for (const [x, y] of out) px(g, INK, x, y); }
/* one pose: { tilt (body lean, rad), lift (px up from the anchor), wing ('blur'|'wide'|'back'|'fold'|'reel'), sac (0..1 swelling), drop (a glob just let go), lying, dead, sleep, hurt, hot (the eye blazing),
   smear (speed streaks), dust (pulled off the floor), legs, abd, head, dx, squash }  */
function drawHornet(g, p, step) {
  const t = p.tilt || 0, cx = AX + (p.dx || 0), cy = AY - 12 - (p.lift ?? 4);
  g.save();
  /* the SMEAR (behind everything): streaks along its line of travel, longest at the abdomen's height */
  if (p.smear) { for (const [dy, len, a] of [[-6, 11, 0.55], [-2, 15, 0.8], [2, 13, 0.7], [6, 9, 0.5]]) { g.globalAlpha = a * 0.75; line(g, '#fff0c8', cx - 12 - len, cy + dy + 1, cx - 13, cy + dy + 1); g.globalAlpha = a * 0.5; line(g, '#e8b860', cx - 13 - len * 0.7, cy + dy + 2, cx - 14, cy + dy + 2); } g.globalAlpha = 1; }
  /* wings (behind): short for the body - a blur in flight, wide on the ram's tell, swept back on the ram, folded flat when drowsy */
  if (!p.dead) { const base = { blur: -1.9, wide: -1.45, back: -2.75, fold: -3.0, reel: -1.2 }[p.wing] ?? -1.9, osc = p.wing === 'blur' ? (step ? 0.5 : -0.3) : p.wing === 'wide' ? (step ? 0.35 : -0.35) : 0;
    for (const [hind, L] of [[1, 10], [0, 14]]) { const a = t + base + osc + hind * 0.35, pv = [cx + 4 + Math.cos(t) * 2, cy - 4], wx = pv[0] + Math.cos(a) * L / 2, wy = pv[1] + Math.sin(a) * L / 2;
      g.globalAlpha = p.wing === 'blur' || p.wing === 'wide' ? 0.7 : 1;
      blob(g, wx, wy, L / 2, hind ? 2.6 : 3.4, a, (u, v) => Math.abs(v) > 0.75 || Math.abs(u) > 0.85 ? WING[0] : Math.abs(v) < 0.15 ? WING[1] : (Math.abs(u - 0.1) < 0.12 ? WING[1] : WING[2]));   /* (a vein across each) */
      g.globalAlpha = 1; } }
  /* the ABDOMEN: huge, swollen, behind the thorax. BELLY amber banded black; the BACK four overlapping lacquered PLATES (scalloped lower edge, bright leading rim, dark seam behind, a glint) */
  const ax = cx - 7 - Math.cos(t) * 2, ay = cy + 1 + Math.sin(t) * 3 + (p.squash ? 1 : 0), aa = t + (p.abd || 0.15), RX = 11.5, RY = p.squash ? 7.6 : 8.5;
  blob(g, ax, ay, RX, RY, aa, (u, v, dx, dy) => {
    const pf = (u + 1) * 2, idx = Math.floor(pf), pu = pf - idx, edge = -0.34 + 0.3 * (1 - Math.pow(2 * pu - 1, 2));   /* the plate's lower boundary bulges down at its middle */
    if (v < edge - 0.1) {
      if (pu < 0.14) return PL[0];                                           /* the seam behind each plate */
      if (pu > 0.84 && v > -0.9) return PLRIM;                               /* the bright leading rim */
      if (v > edge - 0.2) return PL[1];                                      /* its shadowed lower lip */
      if (v < -0.72) return idx % 2 ? PL[3] : PL[2];                         /* the lit top ridge */
      return idx % 2 ? PL[2] : PL[1];
    }
    if (v < edge) return PL[0];                                              /* the dark edge under the plates */
    const k = -(dx * 0.3 + dy * 0.9) / RY, s = (u + 1) / 2, band = (s > 0.18 && s < 0.29) || (s > 0.44 && s < 0.55) || (s > 0.7 && s < 0.8), sh = k > 0.4 ? 3 : k > 0 ? 2 : k > -0.5 ? 1 : 0;
    return band ? (sh > 2 ? '#4a2810' : '#24120a') : AM[sh]; });
  for (let k = 0; k < 4; k++) { const pu = -0.78 + k * 0.5 + 0.12, bx = ax + Math.cos(aa) * pu * RX + Math.sin(aa) * RY * 0.62, by = ay + Math.sin(aa) * pu * RX - Math.cos(aa) * RY * 0.62; px(g, PLGLINT, bx, by); px(g, PLRIM, bx + 1, by + 1); }   /* a glint on each plate */
  /* the HONEY SAC under the tail: swelling before a drip (a vein of amber through it), a bead hanging off it */
  { const sx = ax - Math.cos(aa) * 9, sy = ay + 5, r = 2 + (p.sac || 0) * 3.2; blob(g, sx, sy, r, r * 0.9, 0, (u, v) => (v < -0.4 && u < 0 ? HONEYC[3] : v < -0.1 ? HONEYC[2] : u > 0.3 ? HONEYC[0] : HONEYC[1]));
    if (p.sac > 0.5) { px(g, HONEYC[3], sx - 1, sy - 1); px(g, HONEYC[2], sx, sy + r + 1); px(g, HONEYC[2], sx, sy + r + 2); px(g, HONEYC[1], sx, sy + r + 3); px(g, HONEYC[3], sx, sy + r + 2); }
    if (p.drop) { px(g, HONEYC[2], sx, sy + r + 3); px(g, HONEYC[2], sx + 1, sy + r + 3); px(g, HONEYC[1], sx, sy + r + 4); px(g, HONEYC[1], sx, sy + r + 5); px(g, HONEYC[3], sx, sy + r + 3); } }
  /* the sting */
  { const tx = ax - Math.cos(aa) * 12.5, ty = ay - Math.sin(aa) * 12.5 + 1; line(g, '#f0e8d0', tx, ty, tx - Math.cos(aa) * 3, ty - Math.sin(aa) * 3 + 1); px(g, '#fff', tx - Math.cos(aa) * 3, ty - Math.sin(aa) * 3 + 1); }
  /* the THORAX with its plated shoulder (the same lacquer as the back: a small rimmed scale), the HEAD (compound eye, pale mandibles), the antennae */
  blob(g, cx + 2, cy - 1, 5, 4.5, t, (u, v, dx, dy) => (-(dx * 0.4 + dy * 0.9) / 5 > 0.3 ? CH[3] : v > 0.4 ? CH[0] : CH[2]));
  blob(g, cx + 1, cy - 4, 3.4, 1.9, t, (u, v) => (u > 0.5 ? PLRIM : v < -0.2 ? PL[3] : PL[2])); px(g, PLGLINT, cx, cy - 5);   /* the pauldron */
  const hx = cx + 7 + Math.cos(t) * 2 + (p.head || 0), hy = cy - 1 + Math.sin(t) * 3 + (p.sleep ? 2 : 0);
  blob(g, hx, hy, 3.6, 3.4, t, (u, v) => (v > 0.5 ? CH[1] : CH[2]));
  if (p.sleep) { line(g, INK, hx + 0.5, hy - 1, hx + 3, hy - 1); px(g, '#e8d8b0', hx + 1, hy); px(g, '#e8d8b0', hx + 2, hy); }   /* the eye shut: a dark lid line */
  else if (p.dead) { px(g, '#e8341c', hx + 1, hy - 2); px(g, '#e8341c', hx + 3, hy); px(g, '#e8341c', hx + 3, hy - 2); px(g, '#e8341c', hx + 1, hy); px(g, '#ff9a6a', hx + 2, hy - 1); }   /* crossed out */
  else if (p.hurt) { line(g, '#fff', hx + 1, hy - 1, hx + 3, hy - 2); px(g, '#ff6a4a', hx + 2, hy - 1); }                                                                          /* squinting */
  else { blob(g, hx + 1.6, hy - 0.8, 1.9, 2.1, 0, (u, v) => (p.hot ? (v > 0.2 ? '#ff6a2a' : '#ffb060') : (u > 0.1 && v > -0.2 ? '#e8341c' : '#b0200c'))); px(g, '#ffd0a0', hx + 1, hy - 2); px(g, '#ff9a6a', hx + 2, hy - 1); }   /* the compound eye */
  line(g, '#f0e0c0', hx + 3, hy + 2, hx + 5, hy + 3); if (p.open || p.drop) px(g, '#f0e0c0', hx + 4, hy + 4);   /* mandibles */
  if (p.sleep) { line(g, CH[0], hx + 1, hy - 3, hx + 3, hy - 5); line(g, CH[0], hx + 3, hy - 5, hx + 4, hy - 3); px(g, HONEYC[2], hx + 4, hy + 4); px(g, HONEYC[1], hx + 4, hy + 5); }   /* antennae drooped, a bead of honey at its mouth */
  else { line(g, CH[0], hx + 1, hy - 3, hx + 4, hy - 7); line(g, CH[0], hx + 4, hy - 7, hx + 6, hy - 7); px(g, AM[3], hx + 6, hy - 7); }
  /* legs: tucked in flight (a jointed pair of them), out on the ground */
  for (const [lx, k] of [[-1, 0], [2, 1], [5, 2]]) { const bx = cx + lx, by = cy + 3, out = p.lying ? 2 : 0; line(g, CH[0], bx, by, bx + (k - 1) * 2 - 1, by + 3 + out); px(g, CH[1], bx + (k - 1) * 2 - 1, by + 3 + out); }
  if (p.dead) for (const lx of [-4, 0, 4]) { line(g, CH[0], cx + lx, cy - 7, cx + lx + 1, cy - 11); line(g, CH[0], cx + lx + 1, cy - 11, cx + lx + 3, cy - 11); }   /* the legs up, curled */
  g.restore();
}
/* the honey puddle under a creature on the floor (drowsy, dead) and the dust the ram's tell pulls up */
function puddle(g, cx, wd) { for (let x = -wd; x <= wd; x++) { const h = Math.round(1.6 * Math.sqrt(Math.max(0, 1 - (x * x) / (wd * wd)))); for (let y = 0; y <= h; y++) px(g, y === h ? HONEYC[3] : y === 0 ? HONEYC[0] : HONEYC[1], cx + x, AY - 1 + (1 - y) + 1); } px(g, HONEYC[3], cx - 3, AY - 1); px(g, HONEYC[3], cx + 2, AY - 1); }
function dustPuffs(g, cx) { for (const [dx, dy, c] of [[-9, 0, '#e8d8b0'], [-6, 1, '#c8b890'], [3, 0, '#e8d8b0'], [-12, 1, '#c8b890'], [8, 1, '#c8b890']]) { g.globalAlpha = 0.75; px(g, c, cx + dx, AY + dy - 1); px(g, c, cx + dx + 1, AY + dy - 2); g.globalAlpha = 1; } }
const POSES = [
  { wing: 'blur', lift: 6 }, { wing: 'blur', lift: 7 },                                    // 0-1 fly
  { wing: 'blur', lift: 6, sac: 1, abd: -0.1, tilt: 0.12 },                                // 2 drip tell: the sac swollen, a bead hanging, the head tipped down at you
  { wing: 'blur', lift: 8, sac: 0.2, drop: 1, abd: 0.25, open: 1 },                        // 3 drop: let go
  { wing: 'wide', lift: 8, tilt: -0.62, dx: -4, abd: 0.7, head: -1, hot: 1 },     // 4 ram tell: leaning back, the wings a wide buzz, the eye blazing
  { wing: 'back', lift: 5, tilt: 0.28, dx: 4, abd: -0.1, head: 2, hot: 1, smear: 1, open: 1 },  // 5 ram: stretched along its line, a smear of speed behind
  { wing: 'reel', lift: 5, tilt: 0.45, abd: 0.5, open: 1 },                                // 6 reel / recover: knocked crooked
  { wing: 'fold', lift: -4, tilt: 0.05, abd: 0.05, lying: true, sleep: 1, squash: 1, pool: 1 },   // 7 drowsy: down on the ground, the wings folded flat, eye shut, a puddle under it
  { wing: 'blur', lift: 6, tilt: -0.25, abd: 0.4, hurt: 1 },                               // 8 hurt
  { wing: 'fold', lift: -6, tilt: Math.PI, abd: 0, dead: true, lying: true, pool: 1 },     // 9 dead: on its back
];
export function bakeHoneyHornetSheet(canvas, flipX, whiten, HONEY) {
  const frames = POSES.map((p, i) => { const [c, g] = canvas(W, H); g.imageSmoothingEnabled = false;
    if (p.pool) puddle(g, AX - 2, p.dead ? 15 : 13);
    if (p.dead) { g.save(); g.translate(AX, AY - 8); g.rotate(Math.PI); g.translate(-AX, -(AY - 8)); drawHornet(g, { ...p, tilt: 0 }, 0); g.restore(); } else drawHornet(g, p, i === 1 ? 1 : 0);
    ink(c, g); if (i === 8) { g.globalAlpha = 0.45; g.globalCompositeOperation = 'source-atop'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
    return c; });
  const white = frames.map(c => whiten(c));
  /* its bestiary card: the beat and the ram's tell */
  const card = [frames[0], frames[4]];
  return { R: frames, L: frames.map(flipX), white: { R: white, L: white.map(flipX) }, ax: AX, ay: AY, w: HONEY.w, h: HONEY.h,
    card: { R: card, L: card.map(flipX), white: { R: card.map(c => whiten(c)), L: card.map(c => flipX(whiten(c))) }, ax: AX, ay: AY, w: HONEY.w, h: HONEY.h } };
}
