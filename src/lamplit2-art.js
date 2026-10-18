// lamplit2-art.js — THE LAMPLIT STREET 2, the art pass (claude/lamplit2art). Draw only: no number, timing or level data lives here.
// Everything the greybox lane drew as a canvas primitive is drawn here properly, in the city's own palette (src/city_props.js):
// cold iron, one warm gold, the pale green of held air, and the Tollmaster's red wax.
//   THE LAMPREEVE   the oil flask in flight (a tumbling glass with a burning wick, its comet of sparks) and the shadow it lands in;
//                   the oil SLICK (a black skin with a drifting rainbow sheen) and the slick catching fire (flames running out from the middle).
//   THE TOLLMASTER  the TOLL's stream (a thread of flame drawn out of the hood into his box, the lamp's own flame shrinking to nothing),
//                   the brass COUNTERWEIGHT on its chain, the SEAL coming down (its ghost, then the stamp) and the WAX it leaves
//                   (a pooled red puddle with the seal's print), the WRIT's water standing in the lamp hoods, the bier left on the stones
//                   and the bearers stepping back from it.
//   THE STREET      the toll gate (a brass-bound iron portcullis), the air-main collar on a way lamp and its pocket lit / dry,
//                   the flame fuse under the water, the flare's reach ring, the city brazier's leap to your hand.
// Every function takes the game's 2D context and screen coordinates; nothing here reads game state.
import { canvas, px, rect, line, outline, mulberry } from './px.js';
import { OUT } from './art.js';

const rd = Math.round;
const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(rd(x), rd(y), w, h); };
const P = (g, x, y, c) => { g.fillStyle = c; g.fillRect(rd(x), rd(y), 1, 1); };
const FLAME = ['#fff6c8', '#ffe9a8', '#f0c05a', '#c07a22'];

// ================= THE LAMPREEVE =================
/* THE OIL FLASK in flight: a round glass of whale oil, tumbling a quarter-turn at a time (so it stays crisp), the wick's flame always streaming
   back along the way it travels, and a comet of sparks behind. (X, Y) is its centre; dir is the way it is going (-1 or 1). */
export function flask(g, X, Y, dir, time, q) {
  const spin = Math.floor(time * 14) & 3, x = rd(X), y = rd(Y);
  /* sparks off the burning rag, strung back along the flight */
  for (let i = 1; i <= 5; i++) { const sx = x - dir * (4 + i * 3), sy = y - 3 + Math.round(Math.sin(time * 30 + i * 2) * 1.5) + i; g.globalAlpha = 0.9 - i * 0.15; P(g, sx, sy, i < 3 ? '#ffe9a8' : '#f0c05a'); }
  g.globalAlpha = 1;
  /* the glass: a 7 x 7 belly, drawn in four turns */
  const body = ['..TTT..', '.TtttT.', 'TtyyyyT', 'TyyxyyT', 'TyyyyYT', '.TYYYT.', '..TTT..'];
  for (let j = 0; j < 7; j++) for (let i = 0; i < 7; i++) {
    const k = body[j][i]; if (k === '.') continue;
    let a = i, b = j; if (spin === 1) { a = 6 - j; b = i; } else if (spin === 2) { a = 6 - i; b = 6 - j; } else if (spin === 3) { a = j; b = 6 - i; }
    P(g, x - 3 + a, y - 3 + b, k === 'T' ? '#56898a' : k === 't' ? '#9fd6d2' : k === 'y' ? '#d9983a' : k === 'Y' ? '#8a5a1a' : '#ffe9a8');
  }
  /* the neck, the cork and the rag - they turn with the glass, the flame does not */
  const nx = [0, 4, 0, -4][spin], ny = [-4, 0, 4, 0][spin];
  P(g, x + nx, y + ny, '#6d5338'); P(g, x + nx * 1.4, y + ny * 1.4, '#46321f');
  const fx = x + nx * 1.5 - dir * 1, fy = y + ny * 1.5 - 1, fl = (time * 22 | 0) & 1;
  P(g, fx, fy - 1, FLAME[fl ? 0 : 1]); P(g, fx, fy - 2, FLAME[2]); if (fl) P(g, fx - dir, fy - 2, FLAME[3]);
  g.globalAlpha = 0.22 + 0.1 * fl; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill(); g.globalAlpha = 1;
}
/* WHERE IT WILL LAND: the shadow the flask throws on the boards, small and pale when it is high, a dark hard disc when it is about to land,
   a rim of lamplight on the near edge, and four short ticks that close in on you (they stop when the shadow has locked). */
export function flaskShadow(g, x, y, r, q, locked, time) {
  const rr = 4 + r * 0.55 * q;
  g.globalAlpha = 0.18 + 0.5 * q; g.fillStyle = '#0a1214'; g.beginPath(); g.ellipse(rd(x), rd(y), rr, 2 + 1.5 * q, 0, 0, 7); g.fill();
  g.globalAlpha = 0.5 * q; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.ellipse(rd(x), rd(y), rr, 2 + 1.5 * q, 0, Math.PI * 0.1, Math.PI * 0.9); g.stroke(); g.globalAlpha = 1;
  const k = locked ? 0 : 1 + 2 * (0.5 + 0.5 * Math.sin(time * 18));
  g.fillStyle = locked ? '#ff6b6b' : '#ffd36b';
  for (const s of [-1, 1]) { R(g, x + s * (rr + 3 + k) - 1, y - 1, 2, 1, g.fillStyle); R(g, x + s * (rr + 5 + k) - 1, y - 1, 1, 1, g.fillStyle); }
}
/* THE SLICK: a black skin of oil lying on the boards, thin at its ends and a handful of pixels thick in the middle, with the street's lamplight
   sliding over it in colours (gold, teal, violet, rust) the way oil on water does. Burning: tongues of flame run out of the middle to the edges. */
export function slick(g, x, y, w, a, time, burn, burnK, seedX) {
  const rnd = mulberry((rd(seedX) & 1023) + 11), W = Math.max(8, rd(w) + 4), A = Math.min(1, a);
  g.globalAlpha = A * 0.38; g.fillStyle = '#05080a'; g.beginPath(); g.ellipse(rd(x), rd(y) - 1, W + 3, 3, 0, 0, 7); g.fill();   /* the dark of it soaking into the boards, so it reads on any floor */
  g.globalAlpha = A * 0.96;
  for (let i = -W; i <= W; i++) {
    const e = 1 - Math.abs(i) / W, h = Math.max(1, Math.round(4 * Math.sqrt(e) + (rnd() - 0.5) * 0.9));
    R(g, x + i, y - h, 1, h, e < 0.18 ? '#3a2a12' : '#1c1308');
    R(g, x + i, y - h, 1, 1, e < 0.25 ? '#8a6a2c' : '#4a3818');
    if (h > 2) R(g, x + i, y - h + 1, 1, 1, '#2e2210');
  }
  const SH = ['#e0b858', '#5acaba', '#b07ac8', '#e8844a'];
  for (let i = -W + 2; i < W - 1; i += 2) { const e = 1 - Math.abs(i) / W, ph = i * 0.33 + time * 2.2 + seedX * 0.05; if (Math.sin(ph) > 0.05) { g.globalAlpha = A * (0.6 + 0.35 * e); P(g, x + i, y - 3, SH[((ph | 0) % 4 + 4) % 4]); P(g, x + i + 1, y - 3, SH[((ph + 1 | 0) % 4 + 4) % 4]); P(g, x + i, y - 2, SH[((ph + 2 | 0) % 4 + 4) % 4]); } }
  g.globalAlpha = A; const gl = ((time * 26 + seedX) % (W * 2 + 14)) - W - 4; if (gl > -W + 2 && gl < W - 3) { R(g, x + gl, y - 4, 4, 1, '#f4faf6'); }
  g.globalAlpha = 1;
  if (burn > 0) {   /* the oil catches: flames come out of the middle first, then the rim, and a hot glow lifts off it */
    const spread = Math.min(1, 0.3 + (burnK === undefined ? 1 : burnK) * 1.4);
    g.globalAlpha = 0.34; g.fillStyle = '#ff9a3c'; g.beginPath(); g.ellipse(rd(x), rd(y - 8), W * spread + 8, 12, 0, 0, 7); g.fill(); g.globalAlpha = 1;
    for (let i = -Math.floor(W * spread); i <= W * spread; i += 3) {
      const f = 0.5 + 0.5 * Math.sin(time * 19 + i * 1.7), h = Math.round((8 + 13 * (1 - Math.abs(i) / W)) * (0.5 + 0.5 * f));
      for (let j = 0; j < h; j++) { const t = j / h; R(g, x + i - (t > 0.55 ? 0 : 1), y - 3 - j, t > 0.55 ? 1 : 3, 1, t < 0.2 ? '#c0431a' : t < 0.5 ? '#ff7a2a' : t < 0.8 ? '#ffd36b' : '#fff6c8'); }
    }
  }
}

// ================= THE TOLLMASTER =================
/* THE TOLL, drawn: a thread of the lamp's flame pulled out of its hood and streaming to his box in a lazy arch, beads of fire running along it.
   mode 'tell': the thread is only a pale, slow pulse (a lamp is being named); 'collect': it runs hot and the box glows when a bead lands. */
export function tollStream(g, lx, ly, bx, by, collecting, time) {
  const cxm = (lx + bx) / 2, cym = Math.min(ly, by) - 18 - Math.abs(bx - lx) * 0.06, at = t => [(1 - t) * (1 - t) * lx + 2 * (1 - t) * t * cxm + t * t * bx, (1 - t) * (1 - t) * ly + 2 * (1 - t) * t * cym + t * t * by];
  g.globalAlpha = collecting ? 0.4 : 0.18 + 0.1 * Math.sin(time * 6);
  for (let i = 0; i <= 24; i++) { const [x, y] = at(i / 24); P(g, x, y, collecting ? '#f0c05a' : '#9fd6d2'); }
  const N = collecting ? 9 : 3;
  for (let i = 0; i < N; i++) { const t = ((time * (collecting ? 1.15 : 0.5) + i / N) % 1), [x, y] = at(t), [x2, y2] = at(Math.max(0, t - 0.04)), [x3, y3] = at(Math.max(0, t - 0.08));
    g.globalAlpha = collecting ? 0.95 : 0.5;
    if (collecting) { R(g, x - 1, y - 1, 2, 2, '#fff6c8'); P(g, x2, y2, '#ffd36b'); P(g, x3, y3, '#c07a22'); } else { P(g, x, y, '#dff6ee'); P(g, x2, y2, '#9fd6d2'); } }
  g.globalAlpha = 1;
  /* at the hood the flame is dragged out into a tongue; at the box the lid slot flashes when a bead lands */
  if (collecting) { const [tx, ty] = at(0.1); for (let j = 0; j < 4; j++) P(g, lx + (tx - lx) * (j / 3), ly + (ty - ly) * (j / 3) - (3 - j), j < 2 ? '#fff6c8' : '#f0c05a');
    if (((time * 9) | 0) % 3 === 0) { g.globalAlpha = 0.6; g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(rd(bx), rd(by), 5, 0, 7); g.fill(); g.globalAlpha = 1; } }
}
/* THE LAMP'S OWN FLAME while it is collected: k 0..1 of it gone. Painted over the lit sprite's flame (the sprite is drawn at x, y = its top-left). */
export function lampDrain(g, x, y, k) {
  if (!(k > 0.08)) return;
  const rows = Math.min(4, Math.ceil(4 * k));
  R(g, x + 8, y + 13, 2, rows, '#9fd6d2'); if (k > 0.7) { R(g, x + 7, y + 15, 1, 1, '#2b3136'); R(g, x + 8, y + 16, 2, 1, '#9fd6d2'); }
}
/* THE WRIT'S WATER standing up in a lamp's hood: the glass fills to the brim with a restless surface, bubbles climbing, the flame a dim gold under it. */
export function hoodWater(g, x, y, time, seed) {
  g.globalAlpha = 0.82; g.fillStyle = '#1a4a5a'; g.fillRect(rd(x) + 4, rd(y) + 9, 9, 9);
  g.globalAlpha = 0.95; for (let i = 0; i < 9; i++) P(g, x + 4 + i, y + 9 + (Math.sin(time * 5 + i * 0.9 + seed) > 0.3 ? 1 : 0), '#9fd6d2');
  const b = ((time * 6 + seed) % 6) | 0; P(g, x + 6 + (seed & 3), y + 17 - b, '#dff6ee'); P(g, x + 10 - (seed & 1), y + 14 - ((b + 3) % 6), '#bfe6f5'); g.globalAlpha = 1;
}
/* THE WRIT, told then standing: the flooded half of the square - a body of cold water with a live surface, light shafts from the lamp hoods
   down through it, and bubbles climbing; h is how tall it stands (the hood line), a is its fade. */
export function writWater(g, x0, x1, floorY, h, a, time) {
  const W = rd(x1 - x0), top = rd(floorY - h);
  g.globalAlpha = 0.3 * a; g.fillStyle = '#123e4e'; g.fillRect(rd(x0), top, W, rd(h));
  g.globalAlpha = 0.16 * a; g.fillStyle = '#2a6a7a'; g.fillRect(rd(x0), top, W, rd(h * 0.4));
  for (let x = 0; x < W; x += 5) { g.globalAlpha = 0.12 * a * (0.5 + 0.5 * Math.sin(time * 1.6 + x * 0.21)); R(g, x0 + x, top + 2, 2, h - 3, '#bfe6f5'); }
  g.globalAlpha = 0.85 * a; for (let x = 0; x < W; x++) { const wv = Math.sin(time * 3 + x * 0.35) + Math.sin(time * 1.7 + x * 0.12); R(g, x0 + x, top + (wv > 0.9 ? 0 : 1), 1, 1, wv > 0.9 ? '#e8f4f0' : '#9fd6d2'); }
  g.globalAlpha = 0.5 * a; for (let i = 0; i < Math.floor(W / 24); i++) { const bx = x0 + i * 24 + 7 + (i * 13 % 9), by = floorY - ((time * 22 + i * 17) % h); P(g, bx, by, '#dff6ee'); P(g, bx + 1, by - 1, '#bfe6f5'); }
  g.globalAlpha = 1;
}
/* THE BRASS COUNTERWEIGHT and its chain: pivot (px, py) is the rod's iron collar, (wx, wy) the weight. Links alternate flat and edge-on; the drum is
   a banded brass loaf with the city's scale stamped dark on its face; while it swings it drags a ghost of itself. */
const WT = ['..yyyyy..', '.yxyyyyY.', 'yxyyYYyyY', 'yyyY.Yyyy', 'yyYjjjYyY', 'yyyY.YyyY', 'yyyYYYyyY', '.yyyyyYY.', '..YYYYY..'];
const WTC = { y: '#e6b94a', Y: '#9c7619', x: '#fff6c8', j: '#47515b' };
let wtTrail = [], wtSeen = -9;
export function scalesWeight(g, px0, py0, wx, wy, time, swinging) {
  const dx = wx - px0, dy = wy - py0, n = Math.max(2, Math.round(Math.hypot(dx, dy) / 3.5));
  for (let i = 1; i < n; i++) { const x = px0 + dx * (i / n), y = py0 + dy * (i / n); if (i & 1) R(g, x - 1, y, 3, 1, '#ccd4dc'); else R(g, x, y - 1, 1, 3, '#8e98a3'); }
  R(g, px0 - 2, py0 - 2, 5, 5, '#2b3136'); R(g, px0 - 1, py0 - 1, 3, 3, '#6a757d'); P(g, px0, py0, '#e6b94a');
  if (time - wtSeen > 0.2) wtTrail = []; wtSeen = time;
  if (swinging) { wtTrail.push([wx, wy]); if (wtTrail.length > 4) wtTrail.shift(); wtTrail.forEach(([tx, ty], i) => { if (i === wtTrail.length - 1) return; g.globalAlpha = 0.12 + 0.07 * i; for (let j = 1; j < 8; j++) R(g, tx - 4 + (j & 1), ty - 4 + j, 8 - (j & 1), 1, '#e6b94a'); }); g.globalAlpha = 1; } else wtTrail = [];
  for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) { const k = WT[j][i]; if (k !== '.') P(g, wx - 4 + i, wy - 4 + j, WTC[k]); }
  R(g, wx - 5, wy - 1, 1, 3, '#16191c'); R(g, wx + 5, wy - 1, 1, 3, '#16191c'); R(g, wx - 4, wy + 5, 9, 1, '#16191c');
}
/* THE SEAL OF DEBT, told: a ghost of the brass seal hangs over where you stand and comes down as the windup runs out, a shadow growing under it.
   q 0..1 through the tell, locked once the shadow has stopped following. */
export function sealGhost(g, x, floorY, r, q, locked, time) {
  const y = floorY - 6 - 78 * (1 - q) * (1 - q), a = 0.25 + 0.5 * q, w = rd(r * 0.55);
  g.globalAlpha = a;
  for (let j = -9; j < 0; j++) R(g, x, y - 6 + j, 1, 1, j & 1 ? '#e6b94a' : '#9c7619');
  R(g, x - 2, y - 15, 5, 1, '#e6b94a'); R(g, x - 3, y - 14, 1, 1, '#9c7619'); R(g, x + 3, y - 14, 1, 1, '#9c7619');
  R(g, x - w, y - 5, w * 2 + 1, 2, '#e6b94a'); R(g, x - w, y - 3, w * 2 + 1, 4, locked ? '#c9463d' : '#8f2a24'); R(g, x - w + 1, y + 1, w * 2 - 1, 1, '#5a1a16');
  g.globalAlpha = a * 0.7; for (let i = -w + 2; i < w - 2; i += 3) P(g, x + i, y - 1, '#e6b94a');
  g.globalAlpha = 1;
}
/* THE WAX: where the seal came down - a thick pool of red wax on the boards, scalloped at its rim, a bead of it run down at either edge, a highlight
   along its crown and the city's scale pressed into the middle. f is its life left (1 fresh .. 0 gone); it softens to nothing at the end. */
export function wax(g, x, y, w, f, time) {
  const rnd = mulberry(rd(x) & 255), W = Math.max(12, rd(w) + 2), a = Math.min(1, f * 1.6);
  g.globalAlpha = 0.9 * a;
  for (let i = -W; i <= W; i++) { const e = 1 - Math.abs(i) / W, h = Math.max(1, Math.round(5.2 * Math.pow(e, 0.55) + (rnd() - 0.5) * 0.7));
    R(g, x + i, y - h, 1, h, e < 0.2 ? '#6a1e1a' : '#8f2a24'); R(g, x + i, y - h, 1, 1, e > 0.35 ? '#c9463d' : '#a8342d'); if (e > 0.55 && (i & 3) === 0) P(g, x + i, y - h, '#f0a090'); }
  for (const s of [-1, 1]) { R(g, x + s * (W - 1), y, 1, 2, '#6a1e1a'); P(g, x + s * (W - 1), y + 2, '#8f2a24'); }
  R(g, x - 6, y - 4, 13, 2, '#6a1e1a'); R(g, x - 5, y - 5, 11, 1, '#6a1e1a'); R(g, x - 3, y - 4, 7, 1, '#c9463d'); P(g, x, y - 4, '#e6b94a'); P(g, x - 4, y - 3, '#e6b94a'); P(g, x + 4, y - 3, '#e6b94a'); P(g, x - 1, y - 5, '#f0a090');
  g.globalAlpha = 1;
}
/* THE BIER LEFT ON THE STONES at set-down: the four poles lowered to the floor, the board and the pall, the gilt pins. Baked once (36 x 16, feet on the bottom). */
let bierSpr = null;
export function bier() {
  if (bierSpr) return bierSpr;
  const [c, g] = canvas(40, 18);
  R(g, 4, 6, 32, 2, '#8a6a44'); R(g, 4, 8, 32, 1, '#5a4228'); R(g, 4, 9, 32, 1, '#46321f');
  for (let x = 2; x < 38; x++) P(g, x, 5, (x & 3) === 0 ? '#46321f' : '#6d5338');
  for (const x of [3, 37]) { R(g, x - 1, 3, 2, 12, '#8a6a44'); R(g, x, 3, 1, 12, '#5a4228'); }
  for (const x of [8, 31]) { R(g, x, 10, 2, 7, '#5a4228'); R(g, x, 10, 1, 7, '#8a6a44'); }
  for (const x of [5, 9, 30, 34]) { P(g, x, 4, '#e6b94a'); P(g, x, 3, '#9c7619'); }
  for (let x = 5; x < 36; x++) for (let y = 10; y < 14; y++) P(g, x, y, ((x + y) & 7) === 0 ? '#7d4d8c' : ((x + y) & 1) ? '#14201e' : '#3a2042');   /* the pall, hanging off it */
  for (let x = 5; x < 36; x += 2) P(g, x, 14, '#14201e');
  outline(c, OUT); bierSpr = c; return c;
}
/* THE BEARERS stepping back as he is set down: four stooped livery silhouettes at the poles, backing out into the dark and fading (k 0..1 over the set-down). */
export function bearers(g, x, floorY, k) {
  g.globalAlpha = Math.max(0, 1 - k * 1.1) * 0.85;
  for (const [s, o] of [[-1, 15], [-1, 9], [1, 9], [1, 15]]) { const bx = x + s * (o + k * 18), by = floorY, st = (k * 14 | 0) & 1;
    R(g, bx - 2, by - 14, 5, 9, '#16262d'); R(g, bx - 1, by - 14, 3, 1, '#36535e'); R(g, bx - 3, by - 17, 7, 3, '#9fb8a8'); R(g, bx - 4, by - 15, 9, 1, '#587465');
    R(g, bx - 2 + st, by - 5, 2, 5, '#0e1a1f'); R(g, bx + 1 - st, by - 5, 2, 5, '#0e1a1f'); R(g, bx - 3, by - 11, 1, 5, '#2a3a34'); }
  g.globalAlpha = 1;
}

// ================= THE STREET =================
/* THE FUSE on a flame carried under the water: a cord ring that burns down. q is what is left (1..0), a spark at the burning end, blue and pulsing
   when it is nearly out. (x, y) is its centre. */
export function fuse(g, x, y, q, time) {
  const low = q < 0.35, N = 28, n = Math.max(1, Math.round(N * q));
  for (let i = 0; i < N; i++) { const a = -Math.PI / 2 + (i / N) * Math.PI * 2, bx = x + Math.cos(a) * 6, by = y + Math.sin(a) * 6;
    if (i < n) P(g, bx, by, low ? '#7fd0ff' : (i & 1) ? '#cbb68a' : '#8e7a52'); else if (i < n + 3) P(g, bx, by, '#2a2418'); }
  const a = -Math.PI / 2 + (n / N) * Math.PI * 2, sx = x + Math.cos(a) * 6, sy = y + Math.sin(a) * 6, f = (time * 20 | 0) & 1;
  P(g, sx, sy, low ? '#dff6ff' : '#fff6c8'); P(g, sx + (f ? 1 : -1), sy - 1, low ? '#7fd0ff' : '#ffd36b'); if (!low) P(g, sx, sy - 2, '#ff9a3c');
  g.globalAlpha = low ? 0.5 + 0.4 * Math.sin(time * 14) : 0.25; g.strokeStyle = low ? '#7fd0ff' : '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(rd(x) + 0.5, rd(y) + 0.5, 8, 0, 7); g.stroke(); g.globalAlpha = 1;
}
/* WHERE A RELIT LAMP'S FLARE WILL REACH: a flat ring on the boards under the lamp, drawn as dashes with eight small flame ticks standing on it,
   breathing a little. R is its radius in px; (x, y) its centre on the paving. */
export function flareReach(g, x, y, Rr, time) {
  const br = 0.5 + 0.5 * Math.sin(time * 5);
  g.globalAlpha = 0.28 + 0.2 * br;
  for (let i = 0; i < 48; i++) { if (i & 1) continue; const a = (i / 48) * Math.PI * 2; P(g, x + Math.cos(a) * Rr, y + Math.sin(a) * 5, '#ffd36b'); }
  g.globalAlpha = 0.5 + 0.3 * br;
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2, fx = x + Math.cos(a) * Rr, fy = y + Math.sin(a) * 5; P(g, fx, fy - 1, '#f0c05a'); P(g, fx, fy - 2, '#ffe9a8'); }
  g.globalAlpha = 1;
}
/* A WAY LAMP's AIR MAIN: the iron pipe run up from its hood to the vault pocket it feeds, with a brass collar and a stop-valve wheel; while the
   lamp burns the pipe has bubbles climbing it, and while it is out the wheel is dull and the pipe dark. (x, y) the lamp's hood top. n px of pipe. */
export function airMain(g, x, y, n, lit, time) {
  n = Math.min(n, 240);
  for (let j = 0; j < n; j++) { const yy = y - 1 - j; R(g, x - 1, yy, 3, 1, (j % 24) < 2 ? '#6a757d' : '#2b3136'); P(g, x - 1, yy, '#454e55'); if ((j % 24) === 12) { R(g, x - 3, yy, 7, 2, '#2b3136'); P(g, x - 3, yy, '#6a757d'); } }
  R(g, x - 3, y - 6, 7, 3, '#7f6320'); R(g, x - 3, y - 6, 7, 1, lit ? '#f2d88e' : '#9c7619'); P(g, x - 4, y - 5, '#16191c'); P(g, x + 4, y - 5, '#16191c');
  if (lit) for (let i = 0; i < Math.min(5, n / 30); i++) { const t = (time * 28 + i * 31) % n; P(g, x + (i & 1 ? 1 : -1), y - 8 - t, '#dff6ee'); P(g, x + (i & 1 ? 1 : -1), y - 9 - t, '#a8d8c8'); }
}
/* THE POCKET: the vault's held air. On: a pale lens of air under the roof with a bright water line, a light shimmer and bubbles breathing up into
   it. Off: a faint dashed outline of where it was and the dark weed already hanging off the roof. r is the room {l, r, t, b} in screen px. */
export function pocket(g, r, on, time) {
  const w = r.r - r.l, x0 = rd(r.l), y0 = rd(r.t), y1 = rd(r.b);
  if (!on) {
    g.globalAlpha = 0.28; for (let x = 0; x < w; x += 4) { R(g, x0 + x, y0, 2, 1, '#bfe6f5'); R(g, x0 + x, y1 - 1, 2, 1, '#6aa0a8'); } for (let y = 0; y < y1 - y0; y += 4) { R(g, x0, y0 + y, 1, 2, '#bfe6f5'); R(g, x0 + w - 1, y0 + y, 1, 2, '#bfe6f5'); }
    g.globalAlpha = 0.8; for (let x = 6; x < w - 4; x += 11) { const l = 3 + (x * 7 % 5); for (let j = 0; j < l; j++) P(g, x0 + x + (j & 1), y0 + 1 + j, j & 1 ? '#1e3d30' : '#2f5a46'); }
    g.globalAlpha = 1; return;
  }
  g.globalAlpha = 0.2; g.fillStyle = '#dff6ee'; g.fillRect(x0, y0, w, y1 - y0);
  g.globalAlpha = 0.14; for (let x = 0; x < w; x += 6) R(g, x0 + x, y0, 3, y1 - y0, '#ffffff');
  g.globalAlpha = 0.95; for (let x = 0; x < w; x++) { const wv = Math.sin(time * 3.2 + (r.l + x) * 0.22); R(g, x0 + x, y1 - 1 + (wv > 0.4 ? 1 : 0), 1, 1, wv > 0.4 ? '#ffffff' : '#bfe6f5'); }
  g.globalAlpha = 0.7; for (let x = 0; x < w; x += 2) P(g, x0 + x, y0, '#a8d8c8');
  for (let i = 0; i < Math.floor(w / 22); i++) { const bx = x0 + 8 + i * 22, t = (time * 18 + i * 9) % 26; P(g, bx, y1 + 6 - t, '#dff6ee'); P(g, bx + 1, y1 + 5 - t, '#bfe6f5'); }
  g.globalAlpha = 1;
}
/* THE CITY BRAZIER takes your hand: while you stand at it, a tongue of its fire leans over to you and sparks leap, a warm halo over the coals. */
export function brazierReach(g, x, y, dir, near, time) {
  g.globalAlpha = 0.2 + 0.08 * Math.sin(time * 6); g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(rd(x), rd(y - 14), 20, 0, 7); g.fill(); g.globalAlpha = 1;
  if (!near) return;
  for (let j = 0; j < 7; j++) { const t = j / 6, fx = x + dir * (3 + t * 11), fy = y - 16 - Math.sin(t * Math.PI) * 6 - 1; R(g, fx, fy, 2, 2 - (j > 4 ? 1 : 0), j < 3 ? '#ffe9a8' : j < 5 ? '#f0c05a' : '#c07a22'); }
  for (let i = 0; i < 3; i++) { const t = (time * 3 + i * 0.33) % 1; P(g, x + dir * (4 + t * 12), y - 22 - t * 10, i & 1 ? '#fff6c8' : '#ffd36b'); }
}

// ================= THE TOLL GATE =================
/* THE TOLL GATE: a brass-bound iron portcullis, 16 x 16 a tile, two variants (n % 2). Heavy square bars, flat cross-straps riveted in brass where
   they cross, a gilt scale on the straps of the lower variant, the weed that grows on iron a century under water, and the dark behind it. */
let gateSpr = null;
export function tollGate(n) {
  if (!gateSpr) gateSpr = [0, 1].map(v => {
    const [c, g] = canvas(16, 16), rnd = mulberry(5300 + v);
    g.fillStyle = 'rgba(8,14,18,0.6)'; g.fillRect(0, 0, 16, 16);
    for (const x of [1, 5, 9, 13]) { R(g, x, 0, 2, 16, '#2b3136'); R(g, x, 0, 1, 16, '#6a757d'); R(g, x + 1, 0, 1, 16, '#16191c'); }
    const ys = v ? [2, 9] : [5, 12];
    for (const y of ys) { R(g, 0, y, 16, 3, '#454e55'); R(g, 0, y, 16, 1, '#8e98a3'); R(g, 0, y + 2, 16, 1, '#16191c'); for (const x of [1, 5, 9, 13]) { P(g, x, y + 1, '#e6b94a'); P(g, x + 1, y + 1, '#9c7619'); } }
    if (v) { R(g, 6, 11, 4, 4, '#9c7619'); R(g, 7, 11, 2, 3, '#e6b94a'); P(g, 8, 12, '#16191c'); }   /* the toll plate: a scale */
    else for (const x of [1, 5, 9, 13]) { P(g, x, 15, '#cfe8d8'); P(g, x + 1, 15, '#8e98a3'); }          /* the spikes' points */
    for (let i = 0; i < 5; i++) { const x = (rnd() * 16) | 0; P(g, x, (rnd() * 16) | 0, '#2f5a46'); P(g, x, ((rnd() * 16) | 0) + 0, '#1e3d30'); }
    return c;
  });
  return gateSpr[((n % 2) + 2) % 2];
}
/* THE GATE LAMP's chain: from the lamp's hood to the head of the gate it lifts, sagging, iron while the gate is down and gold-lit once it has been paid. */
export function gateChain(g, x0, y0, x1, y1, open, time) {
  const n = Math.max(4, Math.round(Math.hypot(x1 - x0, y1 - y0) / 4));
  for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 5;
    if (i & 1) R(g, x - 1, y, 3, 1, open ? '#f0c05a' : '#8e98a3'); else R(g, x, y - 1, 1, 3, open ? '#c07a22' : '#454e55'); }
  if (open) { const t = (time * 1.4) % 1, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 5; R(g, x - 1, y - 1, 2, 2, '#fff6c8'); }
  R(g, x1 - 2, y1 - 1, 5, 3, '#9c7619'); R(g, x1 - 2, y1 - 1, 5, 1, '#e6b94a');
}
