// rookery_hang.js - THE HERO HANGING FROM A HARPY'S TALONS (claude/rookery2art; Daniel 10-27: "the hero hanging pose"). One look for every carry in the Rookery - a ride (CATCH A RIDE),
// the sisters' ferry up to the shrieker's perch, the snatcher's GRAB and the survivor's SNATCH. The greybox drew two thin yellow lines. Here:
//   the harpy's two LEGS (scaled, yellow-grey, a feathered thigh) run down from her talon point to the hero's shoulders; her TOES wrap over each shoulder, claws set in his collar;
//   his ARMS are thrown up and his HANDS grip her legs (sleeve, a pale glove); a few loose feathers ride the wind; the wind pulls his cloak/hair sideways with the carry (lean).
// hangPose(g, x, ty, hy, time, o)  x: the harpy's x on screen; ty: her talon point; hy: the hero's feet; o: { face, lean (px the wind drags him), tight (the clutch: 1 held hard / 0 loose) }
import { rect as R, line as L } from '../px.js';
const LEG = '#c8b060', LEGD = '#8a7438', CLAW = '#f4ecd0', GLOVE = '#d8c4a4', SLEEVE = '#6a5a4a', SLEEVED = '#3e342c', FEATH = '#e6e4ec';
export function drawHang(g, x, ty, hy, time, o = {}) {
  const sh = hy - 17, lean = Math.round(o.lean || 0), hx = x + lean, len = Math.max(3, sh - ty);
  for (const s of [-1, 1]) {
    const lx = x + s * 3, ex = hx + s * 4;   /* her leg: from her thigh (x±3) to his shoulder (x±4) */
    for (let i = 0; i <= len; i++) { const k = i / len, px = Math.round(lx + (ex - lx) * k), py = ty + i; R(g, px, py, 2, 1, i % 3 === 2 ? LEGD : LEG); if (i < 6) R(g, px + (s > 0 ? 2 : -1), py, 1, 1, FEATH); }   /* the feathered thigh, then the scaled shank */
    /* her toes: curled over his shoulder, three claws set in the collar */
    const cx = ex + (s > 0 ? 0 : -1);
    R(g, cx - 1, sh - 1, 4, 2, LEG); R(g, cx - 2 * s, sh + 1, 1, 3, CLAW); R(g, cx + 1, sh + 1, 1, 3, CLAW); R(g, cx + 3 * s, sh, 1, 2, CLAW); R(g, cx, sh + 2, 1, 2, CLAW);
    /* his arm: up from the shoulder to her shank, a glove round it */
    const gy = sh - Math.min(10, Math.round(len * 0.55)), ax = hx + s * 6;
    L(g, hx + s * 5, sh + 3, ax, gy + 2, SLEEVED, 2); L(g, hx + s * 5, sh + 2, ax, gy + 1, SLEEVE, 1);
    R(g, ax - 1, gy - 1, 3, 3, GLOVE); R(g, ax - 1, gy, 3, 1, '#a88c6c');
  }
  /* a few feathers shed in the wind */
  for (let k = 0; k < 3; k++) { const t = (time * 0.9 + k * 0.33) % 1, fx = Math.round(x + (k - 1) * 9 + Math.sin(time * 3 + k * 2) * 4), fy = Math.round(ty + t * 36); R(g, fx, fy, 3, 1, FEATH); R(g, fx + 1, fy - 1, 1, 1, '#c0bece'); }
}
/* THE LIFT: the ride harpy climbing off the rock, her legs hanging open below her, claws spread and reaching - the sign that she can be GRABBED. (claude/rookery2art) */
export function drawLegs(g, x, y, time) {
  const sw = Math.round(Math.sin(time * 9) * 1);
  for (const s of [-1, 1]) { const lx = x + s * 3, ex = lx + s * 1 + sw;
    for (let i = 0; i < 9; i++) R(g, lx + Math.round((ex - lx) * i / 9), y + i, 2, 1, i % 3 === 2 ? LEGD : LEG);
    R(g, ex - 1, y + 9, 4, 1, LEG); R(g, ex - 2 * s - (s > 0 ? 0 : 1), y + 10, 1, 3, CLAW); R(g, ex + 1, y + 10, 1, 3, CLAW); R(g, ex + 3 * s, y + 9, 1, 2, CLAW); R(g, ex, y + 10, 1, 3, CLAW); }
}
