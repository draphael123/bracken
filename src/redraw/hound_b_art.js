// src/redraw/hound_b_art.js - THE GREAT HOUND's GROUP B ART (claude/art4, over the greybox claude/greathound). DRAWING ONLY: no tile, entity, hitbox or number.
// Behind L.mini.hound2 / hound2B (KENNEL_B in src/kingswood.js stays false: the B pieces show nothing live while it is). Plain fillRect pixels, so tools/hound-b-art.mjs renders it in Node.
//   THE GIBBET     the royal rope's pulley over the open yard hung from a kennelmen's gantry: a tall bark post, a leaning beam, a knee brace, the court's pennant (replaces the BOUGH there)
//   THE GALLERY    the feeding gallery's posts, knee braces, a rail, and meat-hooks with joints hung on the front edge
//   THE HORN CUE   the King's horn: a pennant post at the far wall, a great curved horn raised on it, sound arcs spreading as the tell runs out (k 0..1)
//   THE CHARGE     a called royal boar's gallop: a dust wake with gold motes (over the royal boar's own frames, src/redraw/royal_boar_art.js)
//   CAGED          the cage lands on him: rattled bars' dust, glaring eyes between them, steam breath
const R = Math.round;
const f = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(R(x), R(y), w | 0, h | 0); };
const B = { k: '#3a1c12', d: '#52241e', m: '#74382a', l: '#c07644', iron: '#1e1e26', ironL: '#9a9aa6', gold: '#e0b040', red: '#a83a2a' };
const alpha = (g, a, fn) => { g.globalAlpha = a; fn(); g.globalAlpha = 1; };
const post = (g, x, y0, y1, w) => { f(g, B.k, x - 1, y0, w + 2, y1 - y0); f(g, B.m, x, y0, w, y1 - y0); f(g, B.l, x, y0, 1, y1 - y0); f(g, B.d, x + w - 1, y0, 1, y1 - y0); for (let y = y0 + 6; y < y1; y += 11) f(g, B.k, x + 1, y, w - 2, 1); };
const brace = (g, x0, y0, x1, y1, col = B.m) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n; f(g, B.k, x - 1, y - 1, 4, 4); f(g, col, x, y, 2, 2); } };
// px, py = the pulley's screen x / y; floorY = the yard floor's screen y; side = +1 the post stands east of it, -1 west
export function drawGibbet(g, px, py, floorY, side, time) {
  px = R(px); py = R(py); const postX = px + side * 44;
  post(g, postX - 3, py - 10, floorY, 7); f(g, B.k, postX - 6, floorY - 4, 13, 4); f(g, B.d, postX - 5, floorY - 3, 11, 2);
  f(g, B.k, postX - 5, py - 12, 11, 3); f(g, B.m, postX - 4, py - 11, 9, 1);
  const x0 = Math.min(postX, px - side * 6), x1 = Math.max(postX, px - side * 6);
  f(g, B.k, x0, py - 8, x1 - x0, 7); f(g, B.m, x0, py - 7, x1 - x0, 5); f(g, B.l, x0, py - 7, x1 - x0, 1); f(g, B.d, x0, py - 3, x1 - x0, 1);
  for (let x = x0 + 8; x < x1 - 4; x += 13) f(g, B.k, x, py - 6, 1, 3);
  f(g, B.iron, px - 4, py - 9, 9, 9); f(g, B.ironL, px - 4, py - 9, 9, 1); f(g, B.ironL, px - 3, py - 8, 1, 7);
  brace(g, postX - side * 3, py + 26, postX - side * 22, py - 2);
  brace(g, postX, py + 60, postX - side * 14, py + 34, B.d);
  f(g, B.k, postX, py - 26, 1, 15);
  for (let i = 0; i < 12; i++) { const x = postX + side * (1 + i), h = Math.max(1, 6 - (i >> 1)), y = py - 26 + (i >> 2) + Math.sin(time * 4 + i * 0.7 + px) * 1.2; f(g, i < 2 ? B.gold : B.red, x, y, 1, h); }
  f(g, B.gold, postX - 1, py - 27, 3, 1);
  const cx0 = postX + side * 4 + (side > 0 ? 0 : -6); f(g, '#c8b088', cx0, py + 6, 7, 8); for (let k = 0; k < 4; k++) f(g, '#8a7a58', cx0, py + 6 + k * 2, 7, 1);
}
// x0, x1 = the gallery boards' screen x (left, right), y = the top of the boards, floorY = the yard's floor
export function drawGallery(g, x0, x1, y, floorY, time) {
  x0 = R(x0); x1 = R(x1); y = R(y); floorY = R(floorY); const w = x1 - x0;
  for (const x of [x0 + 4, x1 - 11]) { post(g, x, y + 5, floorY, 7); f(g, B.k, x - 2, floorY - 3, 11, 3); f(g, B.m, x - 1, floorY - 2, 9, 1); }
  brace(g, x0 + 11, y + 22, x0 + 26, y + 5); brace(g, x1 - 11, y + 22, x1 - 26, y + 5);
  brace(g, x0 + 11, y + 40, x1 - 11, y + 14, B.d);
  f(g, B.k, x0 - 2, y - 14, 2, 14); f(g, B.k, x1, y - 14, 2, 14); f(g, B.k, x0 - 2, y - 15, w + 4, 2); f(g, B.m, x0 - 1, y - 14, w + 2, 1);
  for (let i = 0; i < 3; i++) { const hx = x0 + 10 + i * Math.floor((w - 20) / 2), sw = Math.round(Math.sin(time * 1.6 + i * 2)), j = i % 2;
    f(g, B.iron, hx, y + 4, 1, 4 + j); f(g, B.iron, hx - 1, y + 8 + j, 3, 1);
    if (i !== 1) { f(g, '#c8b088', hx + sw, y + 9 + j, 1, 3); f(g, '#a83a3a', hx - 2 + sw, y + 12 + j, 6, 9); f(g, '#d86a5a', hx - 2 + sw, y + 12 + j, 6, 1); f(g, '#e8dcc0', hx + 3 + sw, y + 14 + j, 1, 5); f(g, '#6a1e18', hx - 2 + sw, y + 19 + j, 6, 2); } }
  f(g, '#5a1e18', x0 + 14, floorY - 3, 6, 2); f(g, '#5a1e18', x1 - 30, floorY - 2, 4, 1);
}
// x = the wall's screen x where the horn sounds, floorY = the floor; k 0..1 over the tell; face = the way the wall faces into the yard (+1 east, -1 west)
export function drawHornCue(g, x, floorY, k, face, time) {
  x = R(x); floorY = R(floorY); const top = floorY - 58, d = face;
  post(g, x - 2, top, floorY, 5); f(g, B.k, x - 5, floorY - 3, 11, 3);
  for (let i = 0; i < 10; i++) { const h = Math.max(1, 9 - i), y = top + 2 + Math.sin(time * 4 + i * 0.7); f(g, i < 2 ? B.gold : B.red, x + d * (3 + i), y, 1, h); }
  const lift = R(k * 5), hy = top + 26 - lift;
  f(g, B.iron, x - 4, hy + 6, 9, 2); f(g, B.ironL, x - 4, hy + 6, 9, 1);
  for (let i = 0; i < 16; i++) { const t = i / 15, hx = x + d * (4 + i * 1.5), yy = hy + 6 - Math.sin(t * 2.4) * 8 + t * t * 4, th = 2 + t * 5; f(g, B.k, hx - 1, yy - 1, 3, th + 2); f(g, i % 5 === 4 ? B.gold : '#e8dcc0', hx, yy, 2, th); f(g, '#fff6e0', hx, yy, 2, 1); }
  f(g, B.gold, x + d * 28, hy - 2, 2, 9); f(g, B.k, x + d * 27, hy - 1, 2, 7);
  for (let r = 0; r < 3; r++) { const q = (k * 1.4 + r * 0.3) % 1, ax = x + d * (32 + q * 40); alpha(g, Math.min(1, k * 1.5) * (1 - q), () => { for (let a = -6; a <= 6; a += 2) f(g, B.gold, ax - d * Math.abs(a) * 0.35, hy + 3 + a * (1 + q * 0.5), 1, 2); }); }
}
// a called royal boar's gallop: dust wake + gold motes behind it (x, y = its feet, face = its heading)
export function drawChargeTrail(g, x, y, face, time) {
  x = R(x); y = R(y);
  for (let i = 0; i < 9; i++) { const q = (time * 3.2 + i / 9) % 1, bx = x - face * (14 + q * 40), by = y - 2 - q * 10 - (i % 3), s = 3 + q * 5; alpha(g, 0.5 * (1 - q), () => { f(g, '#c9b27c', bx - s / 2, by - s / 2, s, s * 0.7); f(g, '#8a7a58', bx - s / 2, by, s, 1); }); }
  for (let i = 0; i < 5; i++) { const q = (time * 5 + i / 5) % 1; alpha(g, 1 - q, () => f(g, i & 1 ? B.gold : '#fff6c0', x - face * (10 + q * 26), y - 18 - Math.sin(q * 3 + i) * 4 + q * 6, 1, 1)); }
}
// the cage is on him: x, y = his feet (screen)
export function drawCagedFx(g, x, y, time) {
  x = R(x); y = R(y); const rat = Math.round(Math.sin(time * 38));
  for (const dx of [-14, -7, 0, 7, 14]) { f(g, B.k, x + dx - 1 + rat, y - 33, 3, 32); f(g, B.ironL, x + dx + rat, y - 33, 1, 32); }
  alpha(g, 0.9, () => { f(g, '#ffd36b', x - 10 + rat, y - 14, 3, 2); f(g, '#ffd36b', x + 7 + rat, y - 14, 3, 2); f(g, '#c8321a', x - 9 + rat, y - 14, 1, 1); f(g, '#c8321a', x + 8 + rat, y - 14, 1, 1); });
  for (let i = 0; i < 5; i++) { const q = (time * 2.2 + i / 5) % 1; alpha(g, 0.6 * (1 - q), () => f(g, '#e8e8e0', x + 12 + q * 10, y - 10 - q * 12, 3, 2)); }
  for (let i = 0; i < 4; i++) { const q = (time * 6 + i * 0.25) % 1; alpha(g, 1 - q, () => f(g, '#c9b27c', x - 22 + i * 15, y - 2 - q * 8, 2, 1)); }
}
