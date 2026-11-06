// src/redraw/sun_priest_fx.js - THE DESERT PRIEST'S LIGHT, DRAWN (claude/priestart, 11-06). Replaces the rect placeholders in src/desert-priest.js draw():
// the SUNBEAM (shimmering core, travelling motes, a burning disc at the staff and a starburst where it lands), the HALLOWED PATCH (a floor of light with sun-glyphs and
// rising motes), the SUN-LAMP (a rayed orb), the SUN SHARD (a diamond of light with a tail), the PILLAR OF NOON (telegraph, then the column), the BURNING EYE (an
// almond eye and its line), the FLARE's burst, the DISC's shield arc, the HALO / WARD rings, MERCY's rising motes and the SUNRISE tint with its shafts.
// Pure fillRect + globalAlpha, no strokes, no fonts: it draws on the page canvas and on tools/sun-priest-art-sheet.mjs's software raster alike.
import { canvas, px, outline } from '../px.js';

const R = (g, x, y, w, h, c, a = 1) => { g.globalAlpha = a; g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); g.globalAlpha = 1; };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const GOLD = { hi: '#ffffff', cream: '#fff6c8', pale: '#fff2b0', gold: '#ffd36b', warm: '#ffe89a', deep: '#e8a83a', amber: '#b8862a' };

/* THE SUNBEAM: ln = { x0, y0, x1, y1, up? } as beamLine gives it. Horizontal from the staff (x0) to the wall or foe (x1); UP runs from y0 to y1 on a column. */
export function beam(g, ln, cx, cy, time, o = {}) {
  const k = o.wide ? 1.7 : 1, up = !!ln.up, len = up ? Math.abs(ln.y0 - ln.y1) : Math.abs(ln.x1 - ln.x0); if (len < 2) return;
  const sgn = up ? -1 : Math.sign(ln.x1 - ln.x0) || 1, ox = ln.x0 - cx, oy = ln.y0 - cy, fl = Math.floor(time * 24) % 2;
  /* band(u0, u1, v0, v1): u runs along the beam from the staff, v across it */
  const band = (u0, u1, v0, v1, c, a) => { if (u1 <= u0) return; if (up) R(g, ox + v0, oy - u1, v1 - v0, u1 - u0, c, a); else { const xa = ox + sgn * u0, xb = ox + sgn * u1; R(g, Math.min(xa, xb), oy + v0, Math.abs(xb - xa), v1 - v0, c, a); } };
  const h1 = Math.round(5 * k), h2 = Math.round(3 * k), h3 = Math.round(1.5 * k);
  band(0, len, -h1 - 2, h1 + 3, GOLD.warm, 0.14);                                // the haze
  band(0, len, -h1, h1 + 1, GOLD.warm, 0.32);                                    // the body
  band(0, len, -h2, h2 + 1, fl ? GOLD.pale : GOLD.gold, 0.7);                    // the hot band
  band(0, len, -h3, h3, GOLD.cream, 0.95);                                       // the core
  band(0, len, 0, 1, GOLD.hi, 1);                                                // the white line
  for (let u = ((time * 150) % 22); u < len; u += 22) { band(u, Math.min(len, u + 5), -h2, -h2 + 1, GOLD.hi, 0.9); band(Math.max(0, u - 9), Math.max(0, u - 5), h2 - 1, h2, GOLD.cream, 0.8); }   // motes riding down it
  for (let u = 6; u < len; u += 9) { const j = hash(u + Math.floor(time * 12)), v = (j < 0.5 ? -1 : 1) * (h1 + 1 + Math.floor(j * 3)); band(u, u + 1, v, v + 1, GOLD.gold, 0.7); }   // heat off the edges
  /* the burning disc at the staff, and the starburst where it lands */
  const star = (u, big) => { const b = big ? 1 : 0; band(u - 1, u + 2, -1, 2, GOLD.hi, 1); band(u - 3 - b * 2, u + 4 + b * 2, 0, 1, GOLD.cream, 0.95); band(u, u + 1, -3 - b * 2, 4 + b * 2, GOLD.cream, 0.95);
    band(u - 2, u + 3, -2, -1, GOLD.gold, 0.8); band(u - 2, u + 3, 2, 3, GOLD.gold, 0.8); band(u - 5 - b * 3, u + 6 + b * 3, -1, 2, GOLD.warm, 0.35); };
  star(1, false); star(len, true);
  for (let i = 0; i < 5; i++) { const j = hash(i * 7 + Math.floor(time * 20)), u = len - 2 - Math.floor(j * 9), v = (hash(i * 3 + 1 + Math.floor(time * 20)) - 0.5) * 14; band(u, u + 1, v, v + 1, i % 2 ? GOLD.hi : GOLD.gold, 0.9); }   // sparks off the target
}

/* THE HALLOWED PATCH: q = { x0, x1, y, t, kind } in tiles; fades in the last 0.6 s. */
export function patch(g, q, cx, cy, TS, time) {
  const a = Math.min(1, q.t / 0.6) * (q.kind === 'sunfall' ? 0.8 : 1), x = q.x0 * TS - cx, y = (q.y + 1) * TS - cy, w = (q.x1 - q.x0 + 1) * TS; if (a <= 0) return;
  for (let r = 0; r < 8; r++) R(g, x, y - 1 - r * 2, w, 2, GOLD.warm, a * (0.34 - r * 0.04));                 // the glow standing off the floor
  R(g, x, y - 2, w, 2, GOLD.cream, a * 0.9); R(g, x, y - 1, w, 1, GOLD.hi, a);                                  // the lit floor line
  R(g, x - 1, y - 6, 2, 6, GOLD.pale, a * 0.7); R(g, x + w - 1, y - 6, 2, 6, GOLD.pale, a * 0.7);              // the posts of light at either end
  for (let gx = x + TS / 2; gx < x + w; gx += TS) {                                                              // a sun-glyph on every tile: a diamond with a bar
    R(g, gx - 1, y - 5, 3, 1, GOLD.deep, a * 0.9); R(g, gx - 2, y - 4, 5, 1, GOLD.gold, a); R(g, gx - 1, y - 3, 3, 1, GOLD.deep, a * 0.9); R(g, gx, y - 6, 1, 1, GOLD.cream, a); }
  for (let i = 0; i < Math.floor(w / 5); i++) { const ph = (time * (9 + hash(i) * 6) + hash(i + 40) * 20) % 22, mx = x + 2 + hash(i + 9) * (w - 4), my = y - 3 - ph, fade = 1 - ph / 22;
    R(g, mx, my, 1, 2, i % 3 ? GOLD.cream : GOLD.hi, a * fade * 0.9); }                                           // motes rising
  if (q.kind === 'sunfall') for (const ex of [x, x + w - 3]) { R(g, ex - 2, y - 8, 7, 1, GOLD.hi, a * 0.6); R(g, ex + 1, y - 11, 1, 7, GOLD.hi, a * 0.6); }
}

/* THE SUN-LAMP: l = { x, y, t, r }. A rayed orb, its rays turning a quarter-turn every 0.25 s, the light round it; it gutters in its last two seconds. */
export function lamp(g, l, cx, cy, time) {
  const x = Math.round(l.x - cx), y = Math.round(l.y - cy), dying = l.t < 2, on = !dying || Math.floor(time * 10) % 3 !== 0, a = on ? 1 : 0.45, ph = Math.floor(time * 4) % 2;
  for (let i = 0; i < 4; i++) { const rr = l.r * (0.9 - i * 0.18); R(g, x - rr * 0.5, y - 1 - rr * 0.18 + i, rr, rr * 0.36 - i * 2, GOLD.warm, a * 0.05); }   // the pool of light, a soft stack
  R(g, x - 1, y + 3, 3, 3, GOLD.deep, a * 0.8); R(g, x - 3, y + 6, 7, 1, '#7a5a3a'); R(g, x - 2, y + 5, 5, 1, '#9a7a4a');                                 // a bronze dish under it
  R(g, x - 3, y - 3, 7, 7, GOLD.gold, a); R(g, x - 4, y - 2, 9, 5, GOLD.gold, a); R(g, x - 2, y - 4, 5, 9, GOLD.gold, a);                                 // the orb
  R(g, x - 2, y - 2, 5, 5, GOLD.cream, a); R(g, x - 1, y - 1, 3, 3, GOLD.hi, a);
  const rays = ph ? [[0, -7], [0, 7], [-7, 0], [7, 0]] : [[-5, -5], [5, -5], [-5, 5], [5, 5]];
  for (const [rx, ry] of rays) { R(g, x + rx - 1, y + ry - 1, 2, 2, GOLD.cream, a); R(g, x + rx * 0.7 - 0, y + ry * 0.7 - 0, 1, 1, GOLD.hi, a); }
  R(g, x - 5, y - 6, 10, 1, GOLD.warm, a * 0.15);
}

/* THE SUN SHARD: s = { x, y, vx }. A diamond of white light with a tail of three fading dashes behind it. */
export function shard(g, s, cx, cy, time) {
  const x = Math.round(s.x - cx), y = Math.round(s.y - cy), d = Math.sign(s.vx) || 1;
  for (let i = 1; i <= 3; i++) R(g, d > 0 ? x - 3 - i * 5 : x + 3 + (i - 1) * 5, y, 4, 1, i === 1 ? GOLD.cream : GOLD.gold, 0.8 - i * 0.2);
  R(g, x - 1, y - 3, 3, 1, GOLD.gold); R(g, x - 2, y - 2, 5, 1, GOLD.gold); R(g, x - 3, y - 1, 7, 3, GOLD.cream); R(g, x - 2, y + 2, 5, 1, GOLD.gold); R(g, x - 1, y + 3, 3, 1, GOLD.gold);
  R(g, x - 2, y, 5, 1, GOLD.hi); R(g, x, y - 1, 1, 3, GOLD.hi); if (Math.floor(time * 20) % 2) { R(g, x - 5, y, 1, 1, GOLD.pale, 0.8); R(g, x + 5, y, 1, 1, GOLD.pale, 0.8); }
}

/* THE PILLAR OF NOON: q = { x, y, t }. t > 0 the telegraph (a thin dotted column and a ground mark), t <= 0 the column. */
export function pillar(g, q, cx, cy, time) {
  const x = Math.round(q.x - cx), y = Math.round(q.y - cy);
  if (q.t > 0) { for (let yy = 0; yy < y; yy += 4) R(g, x, yy + ((time * 30) % 4), 1, 2, GOLD.pale, 0.55); R(g, x - 10, y - 2, 21, 1, GOLD.gold, 0.7); R(g, x - 6, y - 3, 13, 1, GOLD.cream, 0.7); R(g, x - 3, y - 1, 7, 1, GOLD.hi, 0.8); return; }
  const wob = Math.floor(time * 30) % 2;
  R(g, x - 9, 0, 19, y, GOLD.warm, 0.22); R(g, x - 6, 0, 13, y, GOLD.gold, 0.5); R(g, x - 3, 0, 7, y, GOLD.cream, 0.9); R(g, x - 1, 0, 3, y, GOLD.hi, 1);
  for (let yy = 4; yy < y; yy += 6) { R(g, x - 8 + wob, yy, 2, 2, GOLD.cream, 0.7); R(g, x + 7 - wob, yy + 3, 2, 2, GOLD.cream, 0.7); }
  R(g, x - 14, y - 3, 29, 3, GOLD.gold, 0.8); R(g, x - 10, y - 5, 21, 2, GOLD.cream, 0.85); R(g, x - 5, y - 8, 11, 3, GOLD.hi, 0.9); R(g, x - 18, y - 1, 37, 1, GOLD.warm, 0.6);   // the splash on the floor
}

/* THE BURNING EYE: stood over the hero at (ex, ey) in screen px; `to` = { x, y } the foe it is burning (or null). */
let EYE = null;
function eyeSprite() {
  if (EYE) return EYE;
  const rows = ['...yyyyyyy...', '.yyrrrrrrryy.', 'yrrrrGGGrrrry', 'yrrrGGdGGrrry', 'yrrrrGGGrrrry', '.yyrrrrrrryy.', '...yyyyyyy...'], pal = { y: '#ffd36b', r: '#fffaf0', G: '#e8a83a', d: '#3a2a22' };
  const [c, g] = canvas(13, 7); rows.forEach((row, yy) => [...row].forEach((k, xx) => { if (pal[k]) px(g, xx, yy, pal[k]); })); EYE = outline(c, '#7a4a14'); return EYE;
}
export function eye(g, ex, ey, to, time) {
  const s = eyeSprite(), fl = Math.floor(time * 12) % 2;
  R(g, ex - 9, ey - 5, 19, 11, GOLD.warm, 0.18);
  g.drawImage(s, Math.round(ex - 7), Math.round(ey - 4));
  for (const [rx, ry] of [[-8, -4], [-5, -6], [0, -7], [5, -6], [8, -4]]) R(g, ex + rx, ey + ry - fl, 1, 2, GOLD.gold, 0.9);   // the lashes of fire
  if (to) { const dx = to.x - ex, dy = to.y - ey, n = Math.max(2, Math.floor(Math.hypot(dx, dy) / 2));
    for (let i = 1; i <= n; i++) { const t = i / n; R(g, ex + dx * t, ey + 3 + (dy - 3) * t, i % 2 ? 2 : 1, i % 2 ? 2 : 1, i % 3 ? GOLD.pale : GOLD.hi, 0.95); }
    R(g, to.x - 2, to.y - 2, 5, 5, GOLD.cream, 0.8); R(g, to.x - 1, to.y - 1, 3, 3, GOLD.hi); R(g, to.x - 4, to.y, 9, 1, GOLD.gold, 0.8); R(g, to.x, to.y - 4, 1, 9, GOLD.gold, 0.8); }
}

/* THE FLARE: a sun going off, age 0..0.35 s, r = its reach. A white flash, a ring of sparks racing out, eight rays. */
export function flareBurst(g, x, y, age, r) {
  const t = Math.min(1, age / 0.35), fade = 1 - t, rad = r * (0.25 + 0.75 * Math.sqrt(t));
  if (age < 0.09) { R(g, x - 7, y - 7, 15, 15, GOLD.hi, 0.9 * (1 - age / 0.09)); R(g, x - 12, y - 1, 25, 3, GOLD.hi, 0.8); R(g, x - 1, y - 12, 3, 25, GOLD.hi, 0.8); }
  for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; R(g, x + Math.cos(a) * rad, y + Math.sin(a) * rad * 0.8, 2, 2, i % 2 ? GOLD.cream : GOLD.gold, fade); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.2; for (let s = 0.3; s < 1; s += 0.14) R(g, x + Math.cos(a) * rad * s, y + Math.sin(a) * rad * s * 0.8, 1, 1, GOLD.pale, fade * (1.1 - s)); }
}

/* THE DISC's shield: an arc of gold stood in front of him for `age` s after the tap. */
export function discShield(g, x, y, face, age) {
  const a = Math.max(0, 1 - age / 0.2); if (a <= 0) return;
  for (let i = -5; i <= 5; i++) { const ax = x + face * (14 + Math.round(8 * Math.cos(i * 0.28))), ay = y + i * 3; R(g, ax, ay, 2, 3, Math.abs(i) % 2 ? GOLD.gold : GOLD.cream, a); }
  R(g, x + face * 21, y - 2, 2, 5, GOLD.hi, a); R(g, x + face * 17, y - 1, 7, 3, GOLD.warm, a * 0.4);
}

/* HALO OF NOON: a gold ring with eight ticks turning over his head while it lasts. */
export function haloRing(g, x, y, time) {
  for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; R(g, x + Math.cos(a) * 9 - 1, y + Math.sin(a) * 3 - 1, 2, 2, i % 2 ? GOLD.gold : GOLD.cream); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + time * 2; R(g, x + Math.cos(a) * 12, y + Math.sin(a) * 4.5, 1, 1, GOLD.hi, 0.9); }
}
/* DAWN WARD: a ring of morning light about him, a rising sun marked on the ground, dotted ring turning. */
export function wardRing(g, x, y, time) {
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + time * 1.5; R(g, x + Math.cos(a) * 17 - 1, y + Math.sin(a) * 20 - 1, i % 2 ? 2 : 1, i % 2 ? 2 : 1, i % 3 ? GOLD.cream : GOLD.hi, 0.85); }
  R(g, x - 17, y + 20, 35, 1, GOLD.gold, 0.5);
}
/* MERCY: green-gold motes rising off him. */
export function mend(g, x, y, time) {
  for (let i = 0; i < 9; i++) { const ph = (time * 22 + i * 7) % 30, mx = x - 10 + hash(i + 3) * 20 + Math.sin(time * 4 + i) * 2; R(g, mx, y - ph, 1, 2, i % 2 ? '#cdf08a' : GOLD.cream, 1 - ph / 30); R(g, mx - 1, y - ph + 1, 3, 1, '#cdf08a', (1 - ph / 30) * 0.5); }
}

/* SUNRISE: the whole screen warmed, long shafts coming down from the top, a golden lip along the top edge. k = 0..1 fade. */
export function sunrise(g, VW, VH, time, k = 1) {
  R(g, 0, 0, VW, VH, GOLD.pale, (0.07 + 0.025 * Math.sin(time * 4)) * k);
  for (let i = 0; i < 6; i++) { const sx = (i * 0.19 + 0.06) * VW + Math.sin(time * 0.7 + i) * 6, w = 10 + hash(i) * 14; R(g, sx, 0, w, VH, GOLD.cream, (0.05 + 0.03 * Math.sin(time * 2 + i * 1.7)) * k); R(g, sx + w * 0.35, 0, w * 0.3, VH, GOLD.hi, 0.04 * k); }
  for (let r = 0; r < 8; r++) R(g, 0, r * 3, VW, 3, GOLD.gold, (0.16 - r * 0.02) * k);
}
