// (claude/rookery4art) THE NEW, BIGGER MODELS for ONE HUNTER AT A TIME: each sister bakes 18-26% larger (the hitbox is unchanged) on a roomier canvas, with her OWN build -
//   THE DIVER     HEAVY-WINGED AND DARK: charcoal-slate, the broadest wing (10 flight feathers, 4 heavy coverts) with the white bar, a long forked tail, a lean low body
//   THE SHRIEKER  TALL AND PALE: bone-pink, a long NECK under the head, a body 12 px deep, the crest fan, a throat sac that swells at the neck's base (the MARK and the shriek)
//   THE SNATCHER  BROAD WITH LONG TALONS: a barrel chest 23 px across, barred wings, a shaggy mane, thick legs and claws half again as long, the pebble / boulder in the grip
// shriek_sisters_art.js - THE SHRIEK SISTERS DRAWN (claude/rookeryart). The greybox drew each sister as a handful of rectangles in one shape and three colours (src/shriek-sisters-hands.js drawSister).
// Here are three DIFFERENT BIRDS, each baked as pixel art for every pose the fight asks for (B16: every told move its own windup and release - src/shriek-sisters-hands.js POSE is the contract):
//   THE DIVER     slate-blue and white, long narrow swept wings with a white bar across them, a long forked tail, a lean body, a pale swept-back crest, a hooked yellow beak.
//   THE SHRIEKER  dusky rose, the broadest rounded wings, a fan of seven red crest feathers, a swollen pink THROAT SAC (it fills when she screams), a beak that opens wide.
//   THE SNATCHER  earth-brown and buff, the heaviest: barred barn-owl wings, a shaggy mane, a scarred hooked beak and the biggest talons - the ones that hold the rock.
// Facing right (the hands flip her), talons at the origin, wings spread to both sides like the crag harpy's frontal pose; the dive is side-on, wings swept back. Baked lazily per (role, pose, wing beat)
// and memoised - a frame is one drawImage. The rings, the cone and the dizzy stars are live (they move) and drawn over.   drawSister(g, role, pose, flash, time, rocks)   SHEET()
import { canvas, rect as R, px, line as line0, fillPoly, ellipse, circle, outline, whiten, mulberry } from '../px.js';
const line = (g, a, b, c, d, col, t) => { if (![a, b, c, d].every(Number.isFinite)) { (globalThis.__rkNaN = globalThis.__rkNaN || []).push([a, b, c, d]); return; } line0(g, a, b, c, d, col, t); };   /* (px.line never ends on a NaN end: a bad pose must not hang the bake) */

const OUT = '#1b1626';
const ROLE = {
  diver: { body: '#4a5470', dark: '#232a3e', light: '#6c7a9a', hi: '#dce6f4', belly: '#9aa6bc', crest: '#c8d4e8', face: '#e8e0d4', faceD: '#b8a898', beak: '#e8c870', beakD: '#a88838', talon: '#d8c890', size: 1.2, nf: 10, wlen: 40, fan: 0.09, tail: 5, bar: true, bw: 6.8, bh: 9.5, cy: -15, cov: 4, lt: 2, tl: 1.15 },
  shrieker: { body: '#c4a2ac', dark: '#6e4a5a', light: '#e6d2d6', hi: '#fff0f0', belly: '#f8eeea', crest: '#e04a3a', face: '#f0dccc', faceD: '#c8a496', beak: '#e0b060', beakD: '#a07830', talon: '#d8c090', size: 1.18, nf: 8, wlen: 30, fan: 0.17, tail: 2, bar: false, bw: 6, bh: 12, cy: -18, neck: 6, cov: 3, lt: 2, tl: 1.0 },
  snatcher: { body: '#8a7048', dark: '#3e2e1a', light: '#b8966a', hi: '#e4cc9c', belly: '#d8c8a0', crest: '#c8a060', face: '#dcc4a4', faceD: '#a88c6c', beak: '#d8b060', beakD: '#8a6a28', talon: '#e8dcb0', size: 1.26, nf: 8, wlen: 36, fan: 0.14, tail: 3, bar: true, bw: 11.5, bh: 11, cy: -15, cov: 4, lt: 3, tl: 1.55, barred: true },
};
const memo = new Map();
const AX = 80, AY = 92, CW = 160, CH = 101;   /* (claude/sisters2: 92 -> 116 wide, so the snatcher's level wings - the jar, the rake, the grab - are not clipped) */   /* the canvas, and the talons' point in it */
/* a feather: a tapered stroke from (x0, y0) along angle a for len px, colour c, tip colour t (the last two px) */
function feather(g, x0, y0, a, len, w, c, t, bars) {
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let i = 0; i < len; i++) { const x = x0 + ca * i, y = y0 + sa * i, ww = w * (1 - 0.55 * i / len) + 0.3; R(g, Math.round(x), Math.round(y - ww / 2), 1, Math.max(1, Math.round(ww)), i > len - 3 && t ? t : (bars && (i === Math.round(len * 0.42) || i === Math.round(len * 0.66)) ? bars : c)); }
}
/* a wing: shoulder (sx, sy), side s (-1 left, +1 right), elevation el (rad above horizontal), fold (swept back along the body) */
function wing(g, r, sx, sy, s, el, P0, fold, shade, F) {
  /* (claude/rookery4art) a real wing: the arm (a thick leading edge), a row of SECONDARIES hung from it along its whole length, the PRIMARIES fanned from the wrist, and short COVERTS laid over
     the root - not a fan on a stick. Angles are 'mirror-agnostic': +delta turns the feather toward the ground on either side */
  const P = F && F.diverCrest && !P0.bar ? { ...P0, bar: true } : P0;
  const nf = P.nf, base = -el, A = ang => Math.atan2(Math.sin(ang), s * Math.cos(ang)), wr = fold ? 0.55 : 0.6, tr = fold ? 0.55 : 1;
  const wx = sx + s * Math.cos(base) * P.wlen * wr, wy = sy + Math.sin(base) * P.wlen * wr;
  const dark = shade, c0 = dark ? P.dark : P.body, c1 = dark ? P.body : P.light, bars = P.barred && !dark ? P.dark : null;
  const nSec = Math.max(4, Math.round(nf * 0.62)), nPri = nf - nSec + 2;
  for (let i = 0; i < nSec; i++) {                                                  /* secondaries, from the wrist in toward the shoulder */
    const t = 1 - i / nSec * 0.85, ox = sx + (wx - sx) * t, oy = sy + (wy - sy) * t, d = (1.15 - 0.25 * t) * tr + (fold ? 0.5 : 0);
    feather(g, Math.round(ox), Math.round(oy), A(base + d), Math.round(P.wlen * (0.42 + 0.12 * Math.sin(Math.PI * (1 - t) * 0.9 + 0.5))), 3.4 + (P.cov > 3 ? 0.8 : 0), i % 2 ? c0 : c1, P.dark, bars);
  }
  for (let k = 0; k < nPri; k++) {                                                  /* primaries, fanned from the wrist */
    const kk = k / Math.max(1, nPri - 1), ang = base + (-0.12 + kk * 0.95) * tr + (fold ? 0.55 : 0), lenk = P.wlen * (0.78 - 0.34 * kk) * (fold ? 0.92 : 1);
    feather(g, wx - s * 2, wy, A(ang), Math.round(lenk * (1 - wr * 0.3)), 3.4 + (P.cov > 3 ? 0.8 : 0), k % 2 ? c0 : c1, P.dark, bars);
  }
  const th = P.cov > 3 ? 8 : 6;                                                      /* the arm: leading edge, lit along its top */
  line(g, Math.round(sx), Math.round(sy), Math.round(wx), Math.round(wy), c0, th);
  line(g, Math.round(sx), Math.round(sy) - 2, Math.round(wx), Math.round(wy) - 2, c1, 2);
  line(g, Math.round(sx), Math.round(sy) + 3, Math.round(wx), Math.round(wy) + 3, dark ? P.dark : P.dark, 1);
  for (let q = 0; q < 3; q++) { const t = 0.12 + q * 0.2, cx = sx + (wx - sx) * t, cy = sy + (wy - sy) * t; feather(g, Math.round(cx), Math.round(cy), A(base + 0.95), 6 + q, 3, dark ? P.dark : P.light, c0); }   /* coverts over the root */
  if (P.bar && !dark) { const bx = sx + (wx - sx) * 1.5, by = sy + (wy - sy) * 1.5; line(g, Math.round(bx), Math.round(by) - 2, Math.round(bx + s * Math.cos(base + 0.55) * 11), Math.round(by + Math.sin(base + 0.55) * 11), P.hi, 2); }   /* the white bar across the wing */
}
function body(g, P, p, role, F) {
  const sp = !!p.sprawl, cy = sp ? -9 : P.cy, bw = P.bw, bh = sp ? 5.5 + (P.bh - 9) * 0.4 : P.bh;
  if (P.neck && !sp) { const hx0 = Math.round(((p.head || [8, -2])[0]) * 0.55), top = cy - bh + 2, hy1 = cy - bh - 3 + Math.round(((p.head || [8, -2])[1]) * 0.5) - P.neck; for (let yy = hy1 + 2; yy <= top; yy++) { const t = (yy - hy1) / Math.max(1, top - hy1), nx = Math.round(hx0 * (1 - t) - 2), nw = 4 + Math.round(t * 2); R(g, nx, yy, nw, 1, P.light); R(g, nx + nw - 2, yy, 2, 1, P.belly); R(g, nx, yy, 1, 1, P.body); } }   /* THE SHRIEKER'S NECK: the long pale throat under her head */
  /* tail: fanned feathers below the body */
  if (!sp) for (let k = 0; k < P.tail; k++) { const a = Math.PI / 2 + (k - (P.tail - 1) / 2) * 0.22; feather(g, 0, cy + bh - 2, a, role === 'diver' ? 11 : 7, 2.4, k % 2 ? P.dark : P.body, P.hi); }
  ellipse(g, 0, cy, bw, bh, P.body); ellipse(g, -1.2, cy - 0.5, bw - 2, bh - 1.5, P.light);
  /* the breast: pale feathers in rows (barred for the snatcher) */
  const br = P.belly; ellipse(g, 1, cy + 1.5, bw - 3.2, bh - 3.4 + (p.chest ? 1.6 : 0), br); if (role === 'snatcher') { ellipse(g, 0, cy + 1, bw - 1, 2.4, P.faceD); ellipse(g, 1, cy + 1.5, bw - 4, bh - 5, br); }
  for (let q = 0; q < 4; q++) { const yy = cy - 3 + q * 3, ww = Math.round(bw - 3.6 - Math.abs(q - 1.2) * 0.8); R(g, -ww + 2, yy, ww, 1, role === 'snatcher' ? P.faceD : P.light); R(g, -ww + 3, yy + 1, Math.max(1, ww - 2), 1, br); }
  if (F.sac) { ellipse(g, 3, cy - bh + 2 - (P.neck ? 3 : 0) + (p.beak ? 1 : 0), 3 + (p.sac ? 3.4 : p.cone || p.rings || p.chest ? 2 : 0.6), 2.6 + (p.sac ? 2.6 : p.rings || p.cone ? 1.6 : 0.4), P.belly); if (p.sac) { ellipse(g, 2, cy - bh + 1 - (P.neck ? 3 : 0), 2.2, 1.4, '#f8c8c8'); for (let k = -2; k <= 2; k += 2) R(g, 3 + k, cy - bh + 3 - (P.neck ? 3 : 0), 1, 2, '#c06070'); } }   /* (claude/sisters2) THE SHOCK SHRIEK: the sac blown up tight, veins showing */   /* the throat sac: swollen when she screams */
  if (WOMAN) { ellipse(g, 0, cy - bh + 3.5, bw - 1, 3.6, P.face); ellipse(g, -1, cy - bh + 3, bw - 3, 2.2, '#f6ece0'); R(g, -3, cy - bh + 5, 6, 1, P.faceD); for (let k = -3; k <= 3; k += 2) px(g, k, cy - bh + 6 + (k & 2 ? 1 : 0), P.belly); }   /* (claude/harpyart) bare shoulders and collarbone, the feathers starting below them */
  if (F.bag) satchel(g, cy, bh);   /* THE SNATCHER'S GIFT: her satchel and its strap */
  return { cy, bw, bh };
}
/* (claude/harpyart) THE HARPY-WOMEN (Daniel 11-01 #3): a woman's face, long hair streaming back, bare shoulders and a throat, a mouth that SCREAMS (open, fanged) - on the same bird body, wings, crest and talons.
   false = the old bird heads (same bake, same anchors; nothing else reads it). */
export const WOMAN = true;
function harpyHair(g, P, p, role, hx, hy, r0) {   /* behind the face: a mass of hair blown back and down past the shoulder, the strands lit from above; a scream throws it up and out */
  const up = p.beak || p.rings || p.cone ? 3 : 0, dk = P.dark, md = role === 'shrieker' ? '#8a5a6a' : role === 'snatcher' ? '#5a4228' : '#3a445e';
  ellipse(g, hx - 3, hy + 3 - up, r0 + 0.5, r0 + 2.5, dk); ellipse(g, hx - 4, hy + 4 - up, r0 - 0.5, r0 + 1.5, md);
  for (let k = 0; k < 5; k++) { const a = Math.PI * (0.78 + k * 0.1) - (up ? 0.5 : 0); feather(g, hx - 2, hy + 1, a, 10 + (k % 2) * 3 + up, 2.6, k % 2 ? dk : md, null); }
  R(g, hx - 1, hy - r0 - 1, 6, 2, dk); R(g, hx, hy - r0 - 1, 3, 1, md);   /* the fringe over her brow */
}
function harpyMouth(g, P, p, hx, hy, r0, bx, by) {   /* a nose, lips; SCREAMING (p.beak): the jaw dropped, a black throat, a red tongue, two fangs */
  px(g, bx - 1, by - 1, P.faceD); px(g, bx, by, P.faceD); px(g, bx - 1, by, P.faceD);   /* the nose */
  if (p.beak) { R(g, bx - 2, by + 1, 5, 4, '#2a0c12'); R(g, bx - 1, by + 4, 3, 1, '#e87878'); px(g, bx - 2, by + 1, '#f8f4ea'); px(g, bx + 2, by + 1, '#f8f4ea'); R(g, bx - 2, by, 5, 1, '#c85a5a'); R(g, bx - 1, by + 5, 3, 1, P.faceD); }
  else { R(g, bx - 2, by + 2, 5, 1, '#b04a52'); px(g, bx + 2, by + 3, P.faceD); }
  px(g, hx + 5, hy - 1, P.faceD); R(g, hx - 1, hy + Math.round(r0) - 1, 4, 5, P.face); R(g, hx - 1, hy + Math.round(r0) + 2, 4, 2, P.faceD);   /* a cheek-shade; the neck, bare, and its shadow */
}
function head(g, P, p, role, b, F) {
  const [hx0, hy0] = p.head || [8, -2], hx = Math.round(hx0 * 0.55), hy = Math.round(b.cy - b.bh - 3 + hy0 * 0.5) - (P.neck || 0), r0 = (role === 'snatcher' ? 5.6 : role === 'shrieker' ? 4 : 4.6) + (WOMAN ? 1.6 : 0);
  /* the crest / mane first (behind the face) */
  if (F.diverCrest && role !== 'diver') for (let k = 0; k < 5; k++) { const a = -Math.PI * 0.82 + k * 0.12; feather(g, hx - 1, hy - 1, a, 11 - k, 2.2, k % 2 ? '#9aaac4' : '#c8d4e8', '#f4f8ff'); }   /* THE DIVER'S GIFT: her pale swept crest */
  if (F.fan) for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.3 + (p.rings ? -0.15 : 0), L = 9 + (k % 2 ? 1 : 3) + (p.beak ? 2 : 0); feather(g, hx - 1, hy - 1, a, L, 2.4, k % 2 ? '#a82820' : P.crest, '#ffd0a0'); }
  if (role === 'diver') for (let k = 0; k < 5; k++) { const a = -Math.PI * 0.82 + k * 0.12; feather(g, hx - 1, hy - 1, a, 9 - k, 2.2, k % 2 ? P.light : P.crest, P.hi); }
  if (role === 'snatcher') for (let k = 0; k < 7; k++) { const a = -Math.PI * 0.95 + k * 0.4; feather(g, hx, hy, a, 7 + (k % 3), 2.6, k % 2 ? P.crest : P.light, P.faceD); }
  if (WOMAN) harpyHair(g, P, p, role, hx, hy, r0);
  circle(g, hx, hy, r0, P.face); circle(g, hx - 1, hy - 1, r0 - 1.5, role === 'snatcher' ? P.face : '#f2ece0'); R(g, hx - Math.round(r0) + 1, hy + 1, 3, 2, P.faceD);
  /* the eye: red when she is telling; a brow ridge */
  const eye = p.eye === 'red' ? '#ff4a2a' : '#ffe9a0';
  if (p.dead) { px(g, hx + 1, hy - 1, '#1b0a0a'); px(g, hx + 3, hy - 1, '#1b0a0a'); px(g, hx + 2, hy, '#1b0a0a'); px(g, hx + 1, hy + 1, '#1b0a0a'); px(g, hx + 3, hy + 1, '#1b0a0a'); }   /* an X */
  else if (p.hurt) { R(g, hx, hy, 4, 1, '#1b0a0a'); px(g, hx + 4, hy - 1, '#1b0a0a'); px(g, hx + 4, hy + 1, '#1b0a0a'); }   /* screwed shut, wincing */
  else { R(g, hx + 1, hy - 1, 2, 2, eye); px(g, hx + 2, hy - 1, '#1b0a0a'); }
  R(g, hx, hy - 2, 4, 1, P.dark);
  /* the beak: hooked; wide open (two halves, a dark mouth, a tongue) when screaming */
  const bx = hx + Math.round(r0) - 1, by = hy + 1;
  if (WOMAN) harpyMouth(g, P, p, hx, hy, r0, bx, by); else if (p.beak) { fillPoly(g, [[bx, by - 2], [bx + 8, by - 1], [bx + 7, by + 0.5], [bx, by + 0.5]], P.beak); R(g, bx, by + 0.5, 5, 1, '#3a0c10'); fillPoly(g, [[bx, by + 1.5], [bx + 7, by + 5], [bx + 5, by + 6], [bx, by + 3.5]], P.beakD); R(g, bx + 1, by + 2, 3, 1, '#e87878'); R(g, bx + 6, by - 1, 2, 2, P.beakD); }
  else { fillPoly(g, [[bx, by - 2], [bx + 7, by - 0.5], [bx + 6, by + 1.5], [bx + 3, by + 2.2], [bx, by + 2.4]], P.beak); R(g, bx + 5, by + 1, 2, 2, P.beakD); R(g, bx, by + 1, 5, 1, P.beakD); }
  if (role === 'snatcher' || F.bag) { R(g, hx + 1, hy - 3, 1, 4, '#8a2a2a'); }   /* an old scar over the eye */
  return { hx, hy, bx, by, r0 };
}
function talons(g, P, p, role, F) {
  const big = F.big ? 1.3 : 1, st = p.talon || 'hang', sp = !!p.sprawl;
  const TL = P.tl || 1, LT = P.lt || 2;
  const claw = (x0, y0, x1, y1) => { const X = Math.round(x0 + (x1 - x0) * TL), Y = Math.round(y0 + (y1 - y0) * TL); line(g, x0, y0, X, Y, P.talon, TL > 1.3 ? 2 : 1); R(g, X, Y, 1, 1, '#f4ecd0'); if (TL > 1.3) R(g, X + (X >= x0 ? 1 : -1), Y + 1, 1, 1, '#f4ecd0'); };
  const leg = (x, y0) => { line(g, x, y0, x + (st === 'fwd' ? 5 : st === 'spread' || st === 'open' ? (x < 0 ? -2 : 2) : 0), -2, '#c8b060', LT); };
  if (sp) { for (const x of [-4, 3]) { line(g, x, -6, x + 2, -2, '#c8b060', LT); claw(x + 2, -2, x + 6, -1); claw(x + 2, -2, x + 5, 0); } return; }
  for (const sx of [-3, 3]) {
    const x0 = sx, y0 = -7;
    if (st === 'fwd') { line(g, x0, y0, x0 + 6, -2, '#c8b060', LT); claw(x0 + 6, -2, x0 + 12, 0); claw(x0 + 6, -2, x0 + 11, -3); claw(x0 + 6, -2, x0 + 10, 2); }   /* thrust out ahead: the stoop */
    else if (st === 'spread' || st === 'open') { const e = sx < 0 ? -1 : 1; line(g, x0, y0, x0 + e * 4, -2, '#c8b060', LT); claw(x0 + e * 4, -2, x0 + e * 10, 1); claw(x0 + e * 4, -2, x0 + e * 9, -3); claw(x0 + e * 4, -2, x0 + e * 7, 3); }   /* open wide, empty */
    else if (st === 'grip') { line(g, x0, y0, x0 + 1, -3, '#c8b060', LT); claw(x0 + 1, -3, x0 + 6, -1); claw(x0 + 1, -3, x0 - 3, -1); R(g, x0 - 1, -4, 4, 2, P.talon); }                                      /* curled round a thing */
    else if (st === 'rake') { line(g, x0, y0, x0 + 8, -1, '#c8b060', LT); claw(x0 + 8, -1, x0 + 14, 0); claw(x0 + 8, -1, x0 + 13, -2); claw(x0 + 8, -1, x0 + 3, 0); R(g, x0 + 9, 0, 6, 1, P.talon); }   /* (claude/sisters2) THE RAKE: legs thrust out ahead along the ground, claws dug in */
    else if (st === 'reach') { const e = sx < 0 ? -0.5 : 1; line(g, x0, y0, x0 + 7, y0 - 3 + (sx < 0 ? 2 : 0), '#c8b060', LT); const hx = x0 + 7, hy = y0 - 3 + (sx < 0 ? 2 : 0); claw(hx, hy, hx + 6, hy - 4); claw(hx, hy, hx + 7, hy); claw(hx, hy, hx + 5, hy + 4); claw(hx, hy, hx - 1, hy + 4 * e); }   /* THE GRAB: both feet reaching forward, every claw open */
    else if (st === 'clutch') { line(g, x0, y0, x0 + (sx < 0 ? -1 : 1), -1, '#c8b060', LT); claw(x0, -1, x0 + 3, 3); claw(x0, -1, x0 - 2, 3); claw(x0, -1, x0 + 1, 4); R(g, x0 - 1, 2, 3, 1, P.talon); }   /* HOLDING YOU: feet down, claws closed round your shoulders */
    else { line(g, x0, y0, x0, -2, '#c8b060', LT); claw(x0, -2, x0 + Math.round(5 * big), 0); claw(x0, -2, x0 - Math.round(3 * big), 0); claw(x0, -2, x0 + 2, 2); }
  }
}
/* THE SNATCHER'S SATCHEL: a stitched leather pouch on a strap across her breast, a bone toggle, a feather stuck in the flap */
function satchel(g, cy, bh) {
  const L0 = '#4a3220', L1 = '#7a5634', L2 = '#a8804e', B = '#e8dcc0';
  line(g, 4, cy - bh + 2, -7, cy + 2, L0, 2); line(g, 4, cy - bh + 1, -7, cy + 1, L1, 1);   /* the strap */
  R(g, -12, cy + 1, 9, 8, L0); R(g, -11, cy + 2, 7, 6, L1); R(g, -11, cy + 2, 7, 3, L2); R(g, -11, cy + 5, 7, 1, L0);   /* the pouch and its flap */
  R(g, -8, cy + 5, 1, 2, B); R(g, -9, cy + 7, 1, 1, L0); R(g, -5, cy + 3, 1, 1, B); R(g, -11, cy + 7, 7, 1, L0);
  line(g, -6, cy + 2, -3, cy - 3, '#e6e4ec', 1); px(g, -3, cy - 4, '#c0bece'); }   /* a pale feather in the flap */
/* (claude/sisters2) THE BOULDER: the crag's own rose stone (as the summit's slabs), bigger than the old rock - guano cap, strata, a black fracture */
function rockSprite(g) { const S = ['#30242c', '#4e3c46', '#725a62', '#987c80', '#bf9fa0', '#e4c8c4'];
  ellipse(g, 0, -6, 11, 7.5, S[2]); ellipse(g, -2, -7.5, 8.5, 5.5, S[3]); ellipse(g, -3.5, -9, 5, 3, S[4]); R(g, -5, -13, 8, 2, '#f4f0e6'); R(g, -3, -14, 5, 1, '#ffffff'); R(g, -1, -11, 2, 3, '#e6e2d8');
  R(g, -9, -6, 17, 1, S[1]); R(g, -7, -3, 13, 1, S[1]); R(g, 4, -1, 6, 2, S[0]); line(g, 2, -12, 4, -7, '#1c1a22', 1); line(g, 4, -7, 2, -3, '#1c1a22', 1); R(g, 5, -8, 2, 1, '#ece8dc'); }
/* (claude/rookery4art) THE PEBBLE: a fist-sized rose-stone in the Diver's grip - small beside the boulder, a guano cap and a black chip */
function pebbleSprite(g) { const S = ['#30242c', '#4e3c46', '#725a62', '#987c80', '#bf9fa0']; ellipse(g, 2, -3, 5, 3.6, S[2]); ellipse(g, 1, -4, 3.6, 2.4, S[3]); R(g, 0, -6, 3, 1, '#f4f0e6'); R(g, 4, -2, 2, 1, S[0]); R(g, 3, -4, 1, 1, '#1c1a22'); R(g, -2, -3, 1, 1, S[4]); }
const rubble = g => { const C = ['#5e594f', '#8a8478', '#b4ae9f', '#ece8dc']; for (let k = 0; k < 8; k++) { const x = -20 + k * 6 + (k % 3), w = 4 + (k % 3), h = 3 + (k % 2) * 2; R(g, x, -h, w, h, C[k % 2]); R(g, x, -h, w, 1, C[2]); if (k % 3 === 0) R(g, x + 1, -h - 1, 2, 1, C[3]); } };

const featsOf = (role, gifts) => ({ diverCrest: role === 'diver' || /D/.test(gifts), fan: role === 'shrieker' || /S/.test(gifts), sac: role === 'shrieker' || /S/.test(gifts), bag: /N/.test(gifts), big: role === 'snatcher' || /N/.test(gifts) });
function bake(role, pose, ph, rockOn, gifts = '') {
  const key = role + '|' + pose.__n + '|' + ph + '|' + (rockOn ? 'r' : '') + '|' + gifts; if (memo.has(key)) return memo.get(key);
  const F = featsOf(role, gifts), P = ROLE[role], [c, g] = canvas(CW, CH), r = mulberry(role.length * 31 + pose.__n.length);
  g.save(); g.translate(AX, AY); g.scale(P.size, P.size); g.translate(0, 0);
  const sp = !!pose.sprawl, beat = pose.flap ? (ph - 1.5) * 0.28 : 0, el = -(pose.wing || 0) - beat, fold = !!pose.fold;
  const sh = sp ? -14 : -23;
  /* WINGS: the far (left) one in shade behind the body, then the body, the head, then the near (right) one over it */
  if (fold) { wing(g, r, pose.tuck ? -3 : -1, sh + 4, -1, pose.tuck ? -1.3 : 2.45 + beat * 0.3, P, true, true, F); }
  else wing(g, r, -3, sp ? -9 : -19, -1, sp ? -0.3 : el, P, false, true, F);
  const b = body(g, P, pose, role, F);
  const h = head(g, P, pose, role, b, F);
  talons(g, P, pose, role, F);
  if (fold) wing(g, r, pose.tuck ? 4 : 2, sh + 5, 1, pose.tuck ? -1.35 : 2.2 - beat * 0.3, P, true, false, F); else wing(g, r, 3, sp ? -9 : -19, 1, sp ? -0.3 : el, P, false, false, F);
  if (pose.feathers) for (let k = 0; k < 7; k++) { const fx = -22 + ((k * 13) % 41), fy = -34 + ((k * 7) % 30); feather(g, fx, fy, 0.5 + k * 0.7, 6, 1.6, k % 2 ? P.light : '#e6e4ec', P.hi); }   /* loose feathers round a falling bird */
  if (pose.rock && rockOn) { g.save(); g.translate(2, 0); rockSprite(g); g.restore(); }
  if (pose.pebble) pebbleSprite(g);
  if (pose.rubble) rubble(g);
  g.restore();
  outline(c, OUT);
  const w = whiten(c), set = { c, w, hd: [h.hx * P.size, h.hy * P.size] };
  memo.set(key, set); return set;
}
/* a pose gets a stable name from its content (the hands' POSE table is plain objects) */
const NAMES = new Map();
function named(p) { if (!p.__n) { const k = JSON.stringify(p); if (!NAMES.has(k)) NAMES.set(k, 'p' + NAMES.size); Object.defineProperty(p, '__n', { value: NAMES.get(k), enumerable: false }); } return p; }
export function drawSister(g, role, p, flash, time, rocks, gifts) {
  named(p); const ph = p.flap ? [0, 1, 2, 3, 2, 1][Math.floor(time * 13 + (p.flapOff || 0)) % 6] : 1, set = bake(role, p, ph, rocks !== false, gifts || '');
  g.save(); g.rotate(p.pitch || 0); g.drawImage(flash ? set.w : set.c, -AX, -AY); g.restore();
  /* the live bits: the dizzy stars, the scream's rings, the wave's cone */
  if (p.stars) for (let k = 0; k < 3; k++) { const a = time * 5 + k * 2.1; R(g, Math.round(4 + Math.cos(a) * 11), Math.round(-33 + Math.sin(a) * 4), 3, 3, '#ffe9a0'); R(g, Math.round(5 + Math.cos(a) * 11), Math.round(-34 + Math.sin(a) * 4), 1, 1, '#ffffff'); }
  const [hx0, hy0] = p.head || [8, -2], hx = Math.round(set.hd[0]) + 11, hy = Math.round(set.hd[1]) - 2;
  if (p.rings) { const k = (time * 3) % 1; g.strokeStyle = 'rgba(255,90,74,' + (1 - k).toFixed(2) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(hx, hy + 3, 6 + k * 26, -0.9, 0.9); g.stroke(); g.strokeStyle = 'rgba(255,200,170,' + (0.7 - k * 0.7).toFixed(2) + ')'; g.beginPath(); g.arc(hx, hy + 3, 3 + k * 16, -0.9, 0.9); g.stroke(); }
  /* (claude/sisters2) the signature moves' live bits: the rake's sparks and dust streak, the shock's blast rings, the echo's rings at the floor */
  if (p.sparks) for (let k = 0; k < 4; k++) { const a = (time * 9 + k * 1.7) % 1; R(g, Math.round(14 + a * 10), Math.round(-1 - a * 6 + k), 1, 1, k % 2 ? '#ffe9a0' : '#ffffff'); }
  if (p.streak) for (let k = 0; k < 5; k++) { const a = (time * 6 + k * 0.2) % 1; g.fillStyle = 'rgba(232,224,204,' + (0.7 - a * 0.7).toFixed(2) + ')'; g.fillRect(Math.round(-8 - a * 22 - k * 3), -2 - (k % 2), 6, 1); }
  if (p.blast) for (let k = 0; k < 3; k++) { const a = (time * 4 + k / 3) % 1; g.strokeStyle = 'rgba(255,236,170,' + (0.9 - a * 0.9).toFixed(2) + ')'; g.lineWidth = 2 - (k === 2 ? 1 : 0); g.beginPath(); g.arc(hx + 2, hy + 4, 6 + a * 30, -0.7, 0.7); g.stroke(); } g.lineWidth = 1;
  if (p.down) { const k = (time * 3) % 1; g.strokeStyle = 'rgba(255,90,74,' + (1 - k).toFixed(2) + ')'; g.beginPath(); g.arc(hx + 4, hy + 8, 4 + k * 16, 0.5, 2.0); g.stroke(); }
  if (p.cone) { g.fillStyle = 'rgba(255,211,107,0.35)'; g.beginPath(); g.moveTo(hx + 4, hy + 4); g.lineTo(hx + 36, hy - 12); g.lineTo(hx + 36, hy + 22); g.closePath(); g.fill(); }
}
/* the three, small, for the bestiary card: a grid of the roles in a telling pose and at rest */
export const SHEET = (POSE) => { const out = {}, ms = ['hover', 'diveTell', 'dive', 'stuck', 'screamTell', 'scream', 'swoop', 'waveTell', 'pick', 'carry', 'dropTell', 'drop', 'snatchTell', 'snatch', 'tear', 'land', 'chainTell', 'jar', 'rakeTell', 'rake', 'shockTell', 'shock', 'echoTell', 'echo', 'grabTell', 'grab', 'lift', 'hold'];
  for (const role of Object.keys(ROLE)) for (const m of ms) { const p = POSE[m]; if (p) { named(p); out[role + '-' + m] = bake(role, p, 1, true).c; } } return out; };
