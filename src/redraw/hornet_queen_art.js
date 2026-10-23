// hornet_queen_art.js - THE HORNET QUEEN 2's BAKED FRAMES (claude/hornetsnestart; SONNET over the greybox claude/hornetsnest). ART ONLY: the pose table (POSE in src/hornet-queen-hands.js) is the
// contract and says what each move looks like (B16: every windup and release its own); this draws it, as hard pixels (no antialiasing), inked.
//   She is a great hornet crowned in gold: a chestnut thorax with an amber fringe, a banded amber abdomen (four black bands) ending in a pale sting, a large red compound eye, pale mandibles,
//   two feathered antennae, three jointed legs a side and two pairs of veined wings. A pose is { tilt, abd, wing, head, legs, sting, lying }: the body's lean, the abdomen's angle off it, the wings'
//   state (fold / blur / wide / back / beat / droop), the head thrust, the legs spread, the sting out.
//   queenFrame(pose, step, flash) -> { c, ox, oy, tip: [x, y], head: [x, y] }   one baked frame (memoised); step picks the wing's beat (0..2); flash is the hit-white copy
//   queenFx(g, ctx)                                                              the live extras on top of a pose (the venom bead, speed lines, smoke, stars, shock rings, the cloak)
//   bakeQueenCard(poses)                                                         the bestiary card's frames
import { canvas, outline, whiten } from '../px.js';

const W = 112, H = 84, OX = 56, OY = 42, memo = new Map();
const INK = '#1a0c06';
const CH = ['#2a140a', '#4a2410', '#6e3a16', '#94521e', '#b8702a'];             /* the thorax: chestnut, dark to lit */
const AM = ['#8a4c08', '#c47a14', '#eea52a', '#ffd25a', '#fff0a0'];              /* the abdomen's amber */
const WING = ['#8aa4bc', '#b4c8dc', '#d8e6f2', '#f4f9fd'];
const GOLD = ['#a8741e', '#ffd36b', '#fff0a0'];
const EYE = ['#6a0a0a', '#e8341c', '#ff8a5a', '#ffe0c0'];
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h ^ (h >>> 16); };
const px = (g, c, x, y) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
/* a rotated ellipse filled per pixel: shade(u, v, dx, dy) -> colour or null (u along the axis, v across, -1..1) */
function blob(g, cx, cy, rx, ry, a, shade) { const R0 = Math.max(rx, ry) + 1, c = Math.cos(a), s = Math.sin(a);
  for (let y = Math.floor(cy - R0); y <= Math.ceil(cy + R0); y++) for (let x = Math.floor(cx - R0); x <= Math.ceil(cx + R0); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry; if (u * u + v * v > 1) continue; const col = shade(u, v, dx, dy, x, y); if (col) px(g, col, x, y); } }
/* a thin line of pixels (legs, antennae, stings) */
function line(g, col, x0, y0, x1, y1) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) px(g, col, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); }
const lit = (dx, dy, R0) => -(dx * 0.45 + dy * 0.9) / R0;   /* light from above and a little in front */

function wingPair(g, pivot, tilt, kind, step, hind, far) {
  const base = { fold: -2.95, blur: -1.95, wide: -1.55, back: -2.7, beat: -1.75, droop: 2.3 }[kind] ?? -2;
  const osc = kind === 'blur' ? (step - 1) * 0.55 : kind === 'wide' ? (step - 1) * 0.45 : kind === 'beat' ? (step - 1) * 0.95 : 0;
  const L = (hind ? 17 : 24) * (kind === 'wide' ? 1.15 : 1), Wd = hind ? 3.6 : 4.8, a = tilt + base + osc + (hind ? 0.32 : 0) + (far ? -0.1 : 0);
  const cx = pivot[0] + Math.cos(a) * L / 2, cy = pivot[1] + Math.sin(a) * L / 2, ghost = kind === 'blur' || kind === 'wide';
  g.globalAlpha = ghost ? 0.62 : 1;
  blob(g, cx, cy, L / 2, Wd, a, (u, v, dx, dy, x, y) => { /* a wing in motion is drawn thinner (see-through), not dithered */
    const vein = Math.abs(v) < 0.12 || (Math.abs(u * 6 % 2) < 0.18 && Math.abs(v) < 0.8); const edge = Math.abs(v) > 0.78 || u > 0.86 || u < -0.86;
    return edge ? WING[0] : vein ? WING[1] : (far ? WING[1] : u < 0 ? WING[3] : WING[2]); });
  g.globalAlpha = 1;
}
/* one baked frame of a pose */
function bake(p, step) {
  const [c, g] = canvas(W, H), t = p.tilt || 0, a = t + (p.abd || 0), lying = !!p.lying;
  g.save(); g.translate(OX, OY); if (lying) g.rotate(Math.PI / 2 * 0.9);
  const pivotW = rot(-1, -6, t), head0 = rot(11 + (p.head || 0), -1.5, t), th = [0, 0];
  /* the far wings, then the far legs */
  wingPair(g, pivotW, t, p.wing, step, false, true); wingPair(g, pivotW, t, p.wing, step, true, true);
  const legs = (sh) => { for (const [lx, k] of [[-4, 0], [1, 1], [6, 2]]) { const sp = p.legs ? 1 : 0, [bx, by] = rot(lx, 5, t), kx = bx + (k - 1) * 3 + (sh ? 1 : -1) * (sp ? 3 : 1), ky = by + (sp ? 5 : 6), fx = kx + (k - 1) * 2 + (sp ? (k - 1) * 3 : 1), fy = ky + (sp ? -2 : 5);
    line(g, sh ? CH[1] : CH[0], bx, by, kx, ky); line(g, sh ? CH[1] : CH[0], kx, ky, fx, fy); px(g, INK, fx, fy); } };
  legs(false);
  /* the abdomen: an egg of amber with four black bands, tapering to the sting; its axis points away from the thorax at angle a (+pi) */
  { const len = 28, ry = 8.5, ax = Math.cos(a), ay = Math.sin(a), P0 = rot(-8, 1.5, t), acx = P0[0] - ax * (len / 2 - 1), acy = P0[1] - ay * (len / 2 - 1);   /* the axis, pointing forward (toward the thorax); the tail is the other way */
    blob(g, acx, acy, len / 2, ry, a, (u, v, dx, dy, x, y) => {
      const s = (u + 1) / 2, hw = Math.sqrt(Math.max(0, 1 - (2 * s - 1) * (2 * s - 1))) * (0.7 + 0.3 * s);   /* its profile: fat at the front, drawn to a point behind */
      if (Math.abs(v) > hw + 0.04) return null;
      const band = (s > 0.16 && s < 0.28) || (s > 0.4 && s < 0.52) || (s > 0.64 && s < 0.74) || (s > 0.86 && s < 0.93);
      let k = lit(dx, dy, ry); const sh = k > 0.55 ? 4 : k > 0.2 ? 3 : k > -0.2 ? 2 : k > -0.6 ? 1 : 0;
      if (band) return sh > 3 ? '#4a2810' : sh > 1 ? '#2a160a' : '#140a04'; if (hash(x, y) % 23 === 0) return AM[Math.min(4, sh + 1)];
      return AM[sh]; });
    /* the sting out of the tail: a pale spike, longer when it is bared */
    const tipD = len / 2 + 1, tx = acx - ax * tipD, ty = acy - ay * tipD, sl = p.sting ? 9 : 4;
    for (let i = 0; i < sl; i++) { const k = i / sl; px(g, k < 0.7 ? '#f4ecd8' : '#ffffff', tx - ax * i, ty - ay * i); if (k < 0.45) px(g, '#c8b890', tx - ax * i, ty - ay * i + 1); }
    px(g, '#3a2a18', tx, ty); c._tip = [OX + tx - ax * sl, OY + ty - ay * sl]; if (lying) c._tip = [OX + tx, OY + ty]; }
  /* the thorax: a chestnut barrel with an amber fur fringe along its back and a pale collar */
  blob(g, th[0], th[1], 9, 7.4, t, (u, v, dx, dy, x, y) => { const k = lit(dx, dy, 8); let sh = k > 0.55 ? 4 : k > 0.15 ? 3 : k > -0.3 ? 2 : k > -0.65 ? 1 : 0;
    if (v < -0.55 && hash(x, y) % 3 === 0) return AM[2 + (hash(x, y) % 2)];   /* fur on the shoulders */
    if (u > 0.78) return '#e8c878';                                       /* the collar */
    if (hash(x, y) % 9 === 0) sh = Math.min(4, sh + 1); return CH[sh]; });
  px(g, CH[0], th[0] - 2, th[1] + 2);
  legs(true);
  /* the head: chestnut, a big red eye, pale mandibles, a gold crown, two antennae */
  { const [hx, hy] = head0, hr = 6;
    blob(g, hx, hy, hr, hr - 0.4, t, (u, v, dx, dy, x, y) => { const k = lit(dx, dy, hr); const sh = k > 0.5 ? 4 : k > 0.1 ? 3 : k > -0.35 ? 2 : 1; return CH[Math.min(4, sh)]; });
    const [ex, ey] = rot(2.4, -0.8, t); blob(g, hx + ex, hy + ey, 2.9, 3.5, t, (u, v, dx, dy) => { const kk = lit(dx, dy, 3); return kk > 0.45 ? EYE[3] : kk > 0.05 ? EYE[2] : kk > -0.4 ? EYE[1] : EYE[0]; });
    const [mx, my] = rot(5.5, 3.5, t); line(g, '#f0e4c8', hx + mx - 1, hy + my - 1, hx + mx + 2, hy + my + 1); line(g, '#c8b890', hx + mx - 1, hy + my, hx + mx + 1, hy + my + 2); px(g, '#f0e4c8', hx + mx + 2, hy + my + 2);
    /* the crown: a gold band and three points, set on the head */
    const [kx, ky] = rot(-1, -hr + 0.6, t); line(g, GOLD[0], hx + kx - 4, hy + ky + 0.5, hx + kx + 4, hy + ky + 0.5);
    for (const [dx, h2] of [[-4, 3], [0, 5], [4, 3]]) { const [qx, qy] = rot(dx, -h2, t); line(g, GOLD[1], hx + kx + dx, hy + ky + 0.5, hx + kx + qx, hy + ky + qy); px(g, GOLD[2], hx + kx + qx, hy + ky + qy); }
    /* the antennae: two jointed feelers curling forward off the brow */
    const [bx, by] = rot(4, -5, t); for (const s of [-1, 1]) { const x1 = hx + bx + s * 1, y1 = hy + by, x2 = x1 + 4 + s * 2, y2 = y1 - 4 - (s < 0 ? 1 : 0), x3 = x2 + 3, y3 = y2 + 1; line(g, INK, x1, y1, x2, y2); line(g, CH[1], x2, y2, x3, y3); px(g, AM[3], x3, y3); }
    c._head = [OX + hx, OY + hy]; }
  /* the near wings, over the back */
  wingPair(g, pivotW, t, p.wing, step, true, false); wingPair(g, pivotW, t, p.wing, step, false, false);
  g.restore();
  const tip = c._tip, head = c._head; outline(c, INK);
  return { c, ox: OX, oy: OY, tip, head };
}
const keyOf = (p, step, flash) => [p.tilt || 0, p.abd || 0, p.wing, p.head || 0, p.legs ? 1 : 0, p.sting ? 1 : 0, p.lying ? 1 : 0, step, flash ? 1 : 0].join('|');
export function queenFrame(p, step = 0, flash = false) { const k = keyOf(p, step, false);
  if (!memo.has(k)) memo.set(k, bake(p, step));
  const f = memo.get(k); if (!flash) return f;
  const kf = keyOf(p, step, true); if (!memo.has(kf)) memo.set(kf, { ...f, c: whiten(f.c) }); return memo.get(kf); }
/* how many beats a wing state has (a folded or drooping wing has one) */
export const beats = p => (p.wing === 'blur' || p.wing === 'wide' || p.wing === 'beat') ? 3 : 1;
/* DRAW HER: the frame for the pose at (x, y), facing f (1 right / -1 left). The caller's context is untouched */
export function drawQueen(g, x, y, f, p, time, flash) { const n = beats(p), step = n > 1 ? Math.floor(time * (p.wing === 'beat' ? 14 : 22)) % n : 0, fr = queenFrame(p, step, flash);
  g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(f, 1); g.drawImage(fr.c, -fr.ox, -fr.oy); g.restore();
  return { tip: [Math.round(x) + f * (fr.tip[0] - fr.ox), Math.round(y) + (fr.tip[1] - fr.oy)], head: [Math.round(x) + f * (fr.head[0] - fr.ox), Math.round(y) + (fr.head[1] - fr.oy)] }; }

/* ------------------------------------------------------------------ the live extras on top of a pose ------------------------------------------------------------------ */
const star = (g, x, y, c) => { px(g, c, x, y); px(g, c, x - 1, y); px(g, c, x + 1, y); px(g, c, x, y - 1); px(g, c, x, y + 1); };
export function queenFx(g, o) {
  const { mode, x, y, f, time, tip, head, vx = 0, vy = 0, held = false } = o, blink = Math.floor(time * 12) % 2;
  switch (mode) {
    case 'aim': case 'volleyTell': {   /* the sting cocked: a venom bead swelling at its point, a ring closing in on it (told) */
      const k = (Math.sin(time * 14) + 1) / 2, r = 2 + k * 2; g.globalAlpha = 0.9; for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) if (i * i + j * j <= r * r) px(g, i * i + j * j < 3 ? '#fff6c0' : '#8fd160', tip[0] + i, tip[1] + j);
      g.globalAlpha = 0.6; g.strokeStyle = blink ? '#ffd36b' : '#ff6b6b'; g.beginPath(); g.arc(tip[0], tip[1], 8 + k * 4, 0, 7); g.stroke(); g.globalAlpha = 1;
      if (mode === 'aim' && held && blink) for (let i = 0; i < 3; i++) px(g, '#ffd36b', x - f * (16 + i * 3), y + 12 + i); break; }
    case 'dive': case 'skim': case 'sweep': {   /* speed: streaks trailing off her, against her way */
      const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp; for (let i = 0; i < 6; i++) { const off = (i - 2.5) * 4, len = 10 + (i % 3) * 5; g.globalAlpha = 0.6 - i * 0.05; const sx = x - ux * 8 - uy * off, sy = y - uy * 8 + ux * off; line(g, i % 2 ? '#fff0b0' : '#ffd36b', sx, sy, sx - ux * len, sy - uy * len); } g.globalAlpha = 1; break; }
    case 'stuck': {   /* the sting buried: chips fly off the perch, the body strains */
      for (let i = 0; i < 4; i++) { const ph = (time * 3 + i / 4) % 1; g.globalAlpha = 1 - ph; px(g, i % 2 ? '#e0a838' : '#8a5a32', tip[0] + (i - 1.5) * 4 * ph + Math.sin(i * 3) * 2, tip[1] - ph * 10 + ph * ph * 14); } g.globalAlpha = 1;
      line(g, '#2a1408', tip[0] - 5, tip[1] + 1, tip[0] + 5, tip[1] + 1); px(g, '#fff6c8', tip[0], tip[1] + 2); break; }
    case 'dazed': {   /* the smoke round her head and stars circling it */
      for (let i = 0; i < 4; i++) { const ph = (time * 0.9 + i / 4) % 1; g.globalAlpha = 0.5 * (1 - ph); g.fillStyle = i % 2 ? '#c8d0d8' : '#9aa0a8'; g.beginPath(); g.arc(Math.round(head[0] + Math.sin(time * 2 + i * 2) * 6), Math.round(head[1] - 6 - ph * 16), 3 + ph * 3, 0, 7); g.fill(); } g.globalAlpha = 1;
      for (let i = 0; i < 3; i++) { const an = time * 4.5 + i * 2.1; star(g, head[0] + Math.cos(an) * 10, head[1] - 12 + Math.sin(an) * 3, '#ffd36b'); } break; }
    case 'winded': { for (let i = 0; i < 3; i++) { const ph = (time * 1.6 + i / 3) % 1; g.globalAlpha = 0.6 * (1 - ph); px(g, '#fff6e0', head[0] + f * (8 + ph * 8), head[1] + 2 + ph * 4 + i); px(g, '#fff6e0', head[0] + f * (9 + ph * 8), head[1] + 2 + ph * 4 + i); } g.globalAlpha = 1; break; }
    case 'buzzTell': case 'buzz': {   /* the wing-buzz: shock rings off the wings (the comb shakes) */
      for (let i = 0; i < 3; i++) { const ph = (time * (mode === 'buzz' ? 3 : 1.6) + i / 3) % 1; g.globalAlpha = 0.5 * (1 - ph); g.strokeStyle = i % 2 ? '#fff6c8' : '#ffd36b'; g.beginPath(); g.ellipse(Math.round(x), Math.round(y - 6), 10 + ph * 34, 6 + ph * 22, 0, 0, 7); g.stroke(); } g.globalAlpha = 1; break; }
    case 'tearTell': case 'tear': {   /* she rears and tears the hall open: grit and splinters of comb */
      for (let i = 0; i < 8; i++) { const ph = (time * 2.4 + i / 8) % 1, a = i * 0.8; g.globalAlpha = 1 - ph; px(g, i % 2 ? '#e0a838' : '#7a4a2a', x + Math.cos(a) * (10 + ph * 28), y - 6 + Math.sin(a) * (8 + ph * 18) + ph * ph * 10); } g.globalAlpha = 1; break; }
    case 'cloakTell': { for (let i = 0; i < 12; i++) { const ph = (time * 1.4 + i / 12) % 1, a = i * 2.39 + time; mote(g, x + Math.cos(a) * (46 - ph * 30), y - 4 + Math.sin(a * 1.3) * (30 - ph * 20), Math.cos(a) > 0 ? -1 : 1, time + i); } break; }
    case 'pinned': { for (let i = 0; i < 3; i++) star(g, head[0] + Math.cos(time * 3 + i * 2.1) * 9, head[1] - 10 + Math.sin(time * 3 + i * 2.1) * 3, '#ffd36b'); break; }
  }
}
/* the cloak: her own hornets orbiting her - a dark ring of them, thick (it armours her until she is smoked or a pine scatters it) */
export function cloak(g, x, y, time) { g.globalAlpha = 0.32; g.fillStyle = '#2a1408'; g.beginPath(); g.ellipse(Math.round(x), Math.round(y - 2), 30, 22, 0, 0, 7); g.fill(); g.globalAlpha = 1;
  for (let i = 0; i < 26; i++) { const a = i * 2.39996 + time * (i % 2 ? 3.6 : -3.1), rr = 14 + (i % 5) * 4; mote(g, x + Math.cos(a) * rr * 1.25, y - 2 + Math.sin(a * 1.1) * rr * 0.85, Math.sin(a) * (i % 2 ? -1 : 1) > 0 ? 1 : -1, time + i); } }
/* one of her hornets (a 5-px mote) */
export function mote(g, x, y, dir, t) { const o = dir > 0 ? 1 : -1; x = Math.round(x); y = Math.round(y);
  g.globalAlpha *= 0.5; g.fillStyle = '#1a0c06'; g.fillRect(x - 2, y + 1, 5, 1); g.globalAlpha /= 0.5;
  const seq = o > 0 ? ['#1a0c06', '#e8a418', '#1a0c06', '#e8a418', '#1a0c06'] : ['#1a0c06', '#e8a418', '#1a0c06', '#e8a418', '#1a0c06']; for (let k = 0; k < 5; k++) { g.fillStyle = seq[k]; g.fillRect(x - 2 + k, y, 1, 1); }
  g.fillStyle = '#e8a418'; g.fillRect(x - o * 0, y - 1, 2, 1); g.fillStyle = '#d4dce8'; if (Math.floor(t * 22) & 1) { g.fillRect(x - 1, y - 2, 2, 1); g.fillRect(x, y - 3, 1, 1); } else g.fillRect(x - 1, y - 2, 3, 1); }
/* a STINGER DART in flight: a pale barbed spike with a dark ring and a venom bead, along its way (vx, vy) */
export function dart(g, x, y, vx, vy, time) { const sp = Math.hypot(vx, vy) || 1, ux = vx / sp, uy = vy / sp;
  for (let i = 0; i < 5; i++) px(g, i < 2 ? '#fff6c8' : i < 4 ? '#f0e8d0' : '#8a7a58', x - ux * i, y - uy * i);
  px(g, '#1a0c06', x - ux * 5, y - uy * 5); px(g, '#8fd160', x - ux * 6, y - uy * 6); px(g, '#c8f090', x + ux * 1, y + uy * 1);
  g.globalAlpha = 0.35; line(g, '#8fd160', x - ux * 7, y - uy * 7, x - ux * 12, y - uy * 12); g.globalAlpha = 1; void time; }
/* THE BESTIARY CARD: two frames (hover, the aim) on the card's own scale */
export function bakeCard(poses) { return poses.map((p, i) => { const f = queenFrame(p, i % 3, false), [c, g] = canvas(W, H); g.drawImage(f.c, 0, 0); return c; }); }
