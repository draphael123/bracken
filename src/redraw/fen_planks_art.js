// fen_planks_art.js - LAY THE ROAD, drawn (claude/fenroad2art). ART ONLY: src/fen-planks.js and src/fen-road-hands.js keep every rule; they call these painters.
//   THE BUNDLE   the crew's planks stacked and staggered on two sawhorses, hemp-roped with a red rag, tally marks, a mallet, sawdust - and a glint sweeping it (a thing to take)
//   THE PLANK    one hand-adzed board (lit top, nail heads, a hemp loop at one end, pale end-grain at the other): carried, flying (spinning), resting on the boards
//   THE GHOST    where it will go down: the board drawn pale across the broken stretch, pulsing, with arrows into each lip
//   THE LAID ROAD  a board you laid: fresh-cut pale wood on the stringer, bright nails, a hemp lashing at each end, sawdust
//   THE BROKEN ROAD  snapped board ends hanging off either lip, a snapped stringer, a crew's stake with a red rag, old boards sunk and tilted in the bog, a dangling rope
//   THE PEAT HOLE  its own painter: a black sucking bog - peat fibre and roots, an oily skin, a slow whirl, floating clods, gas bubbles that heave up and burst - not generic mud
import { canvas, outline } from '../px.js';
import { OAK, BOARD, FRESH, ROPE, ROPE_D, ROPE_L, RED, REDL, PEAT } from './fen_road_art.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177) | 0; return (h ^ (h >>> 16)) >>> 0; };
const P = (g, c, x, y) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
const Rr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const R = Math.round;
const OUT = '#120c08';

/* ---------------------------------------------------------------- the PLANK ---------------------------------------------------------------- */
/* 34 x 8, drawn lying along x: the plank 30 long, 4 thick; the right end pale end-grain, the left end looped with hemp */
function plankSprite() {
  return once('plank', () => { const [c, g] = canvas(34, 8), x0 = 2, w = 30;
    Rr(g, FRESH[1], x0, 2, w, 4); Rr(g, FRESH[3], x0, 2, w, 1); Rr(g, FRESH[4], x0 + 2, 2, w - 6, 1); Rr(g, FRESH[0], x0, 5, w, 1);
    for (let i = 0; i < 9; i++) P(g, FRESH[0], x0 + 3 + ((i * 7) % 24), 3 + (i & 1));                      /* the grain */
    for (const nx of [x0 + 7, x0 + 21]) { P(g, '#f4eed8', nx, 3); P(g, OAK[1], nx + 1, 3); }              /* nail heads */
    Rr(g, FRESH[4], x0 + w - 1, 2, 1, 4); P(g, FRESH[2], x0 + w - 1, 3); P(g, FRESH[0], x0 + w - 1, 4);   /* end-grain, a ring */
    Rr(g, ROPE, x0 + 1, 1, 3, 6); Rr(g, ROPE_D, x0 + 1, 3, 3, 1); P(g, ROPE_L, x0 + 1, 1); Rr(g, RED, x0 - 1, 5, 2, 1); P(g, REDL, x0 - 1, 4);   /* the hemp loop + a red tag */
    return outline(c, OUT); });
}
/* a plank at (x, y) screen, centre, angle ang (radians), face -1 flips it, alpha */
export function drawPlank(g, x, y, ang, face = 1, alpha = 1) {
  const s = plankSprite(); g.save(); g.globalAlpha = alpha; g.translate(R(x), R(y)); if (face < 0) g.scale(-1, 1); g.rotate(ang); g.drawImage(s, -17, -4); g.restore();
}

/* ---------------------------------------------------------------- the BUNDLE ---------------------------------------------------------------- */
function bundleSprite() {
  return once('bundle', () => { const [c, g] = canvas(44, 32), bx = 4, by = 31;
    /* two sawhorses: crossed legs, a top bar, a foot spreader */
    for (const lx of [bx + 4, bx + 28]) { for (let i = 0; i < 12; i++) { P(g, OAK[3], lx + 1 + (i >> 1), by - 11 + i - 0); P(g, OAK[3], lx + 6 - (i >> 1), by - 11 + i); P(g, OAK[4], lx + (i >> 1), by - 11 + i); }
      Rr(g, OAK[3], lx - 1, by - 13, 11, 2); Rr(g, OAK[5], lx - 1, by - 13, 11, 1); Rr(g, OAK[1], lx + 1, by - 3, 7, 1); }
    /* the stack: five courses, each a little shorter and offset, end-grain showing at the right */
    for (let k = 0; k < 5; k++) { const y = by - 15 - k * 3, x = bx - 1 + (k % 2) * 2 - (k === 4 ? 1 : 0), w = 38 - (k % 3) * 2;
      Rr(g, FRESH[1], x, y, w, 3); Rr(g, k % 2 ? FRESH[2] : FRESH[3], x, y, w, 1); Rr(g, FRESH[0], x, y + 2, w, 1); Rr(g, FRESH[4], x + w - 1, y, 1, 3); P(g, FRESH[2], x + w - 1, y + 1);
      for (let i = 0; i < 4; i++) P(g, FRESH[0], x + 4 + ((i * 11 + k * 5) % (w - 8)), y + 1); }
    /* hemp rope bands round the stack at two places, a red rag tied off */
    for (const rx of [bx + 9, bx + 28]) { Rr(g, ROPE, rx, by - 29, 2, 16); Rr(g, ROPE_D, rx + 1, by - 29, 1, 16); for (let y = by - 28; y < by - 14; y += 3) P(g, ROPE_L, rx, y); }
    Rr(g, RED, bx + 29, by - 30, 4, 1); Rr(g, REDL, bx + 29, by - 31, 3, 1); P(g, RED, bx + 33, by - 29); P(g, RED, bx + 32, by - 28);
    /* tally marks (the crew's count), a mallet laid on top, sawdust at the foot */
    for (let i = 0; i < 4; i++) Rr(g, RED, bx + 13 + i * 2, by - 28, 1, 2); Rr(g, RED, bx + 12, by - 27, 8, 1);
    Rr(g, OAK[3], bx + 20, by - 31, 9, 2); Rr(g, OAK[5], bx + 20, by - 31, 9, 1); Rr(g, OAK[2], bx + 27, by - 34, 4, 5); Rr(g, OAK[4], bx + 27, by - 34, 4, 1);
    for (let i = 0; i < 12; i++) P(g, i % 3 ? '#e0c490' : '#c9a672', bx + 1 + ((i * 9) % 38), by - 1 + (i & 1));
    return outline(c, OUT); });
}
export function drawBundle(g, x, y, time, seed = 0) {
  const s = bundleSprite(); g.drawImage(s, R(x) - 22, R(y) - 32 + 1);
  const ph = (time * 0.6 + seed * 0.01) % 1; if (ph < 0.3) { const k = ph / 0.3; g.globalAlpha = 0.75 * (1 - Math.abs(k - 0.5) * 1.4); for (let i = 0; i < 4; i++) Rr(g, '#fff6d8', R(x) - 19 + R(k * 36) - i, R(y) - 29 + i * 3 + 2, 2, 3); g.globalAlpha = 1; }
}

/* ---------------------------------------------------------------- the GHOST plank ---------------------------------------------------------------- */
const ghostBoard = () => once('ghostB', () => { const [c, g] = canvas(16, 7);
  Rr(g, '#ffe9b0', 0, 1, 16, 1); Rr(g, '#f2d488', 0, 2, 16, 3); Rr(g, '#c9a672', 0, 5, 16, 1); for (let x = 3; x < 16; x += 6) { P(g, '#fff6d8', x, 3); } P(g, '#fff6d8', 0, 3); P(g, '#fff6d8', 15, 3); return c; });
export function drawGhost(g, x0, x1, y, time) {
  const pulse = 0.5 + 0.5 * Math.sin(time * 6), b = ghostBoard(), n = Math.max(1, R((x1 - x0) / 16));
  g.globalAlpha = 0.38 + 0.3 * pulse; for (let i = 0; i < n; i++) g.drawImage(b, R(x0) + i * 16, R(y) - 1);
  g.globalAlpha = 0.5 + 0.4 * pulse; for (let i = 0; i < n * 16; i += 4) Rr(g, '#fff6d8', R(x0) + i, R(y) + 6, 2, 1);          /* a dashed line under it: the span */
  const bob = R(Math.sin(time * 7) * 1.5);
  for (const [ax, d] of [[R(x0) + 4, 1], [R(x1) - 5, -1]]) { g.globalAlpha = 0.8; for (let k = 0; k < 3; k++) Rr(g, '#ffe9b0', ax + d * k, R(y) - 9 + bob - k, 1, 1 + k * 0); Rr(g, '#ffe9b0', ax + d * 3, R(y) - 11 + bob, 1, 5); P(g, '#ffe9b0', ax + d * 2, R(y) - 7 + bob); }   /* chevrons dropping toward each lip */
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------- the LAID road ---------------------------------------------------------------- */
/* one board of your laid plank: fresh-cut pale wood (i of w: the end boards carry a hemp lashing round the stringer), bright nails */
function laidBoard(end) { return once('laid' + end, () => { const [c, g] = canvas(16, 10);
  Rr(g, FRESH[1], 0, 1, 16, 5); Rr(g, FRESH[3], 0, 1, 16, 1); Rr(g, FRESH[4], 1, 1, 14, 1); Rr(g, FRESH[0], 0, 6, 16, 1); Rr(g, FRESH[2], 0, 2, 16, 1);
  for (let i = 0; i < 5; i++) P(g, FRESH[0], 2 + ((i * 7) % 12), 3 + (i & 1));
  for (const nx of [3, 12]) { P(g, '#f4eed8', nx, 2); P(g, OAK[1], nx + 1, 2); P(g, '#f4eed8', nx, 4); P(g, OAK[1], nx + 1, 4); }
  Rr(g, OAK[2], 2, 7, 12, 2); Rr(g, OAK[3], 2, 7, 12, 1);                                                                          /* the stringer pole under it */
  if (end) { const lx = end === 'L' ? 2 : 11; Rr(g, ROPE, lx, 0, 3, 9); Rr(g, ROPE_D, lx + 1, 0, 1, 9); for (let y = 1; y < 9; y += 3) P(g, ROPE_L, lx, y); }
  for (let i = 0; i < 4; i++) P(g, '#e0c490', 1 + ((i * 5) % 14), 0);
  return outline(c, OUT); }); }
export function drawLaidBoard(g, x, y, i, w, a = 1) { const end = i === 0 ? 'L' : i === w - 1 ? 'R' : ''; g.globalAlpha = a; g.drawImage(laidBoard(end), x, y - 1); g.globalAlpha = 1; }

/* ---------------------------------------------------------------- the BROKEN road ---------------------------------------------------------------- */
/* the snapped end of the old road at a lip: two boards hanging off the edge, splintered, the stringer pole snapped off; 24 x 16 (drawn facing right = the left lip) */
function snapEnd(v) { return once('snap' + v, () => { const [c, g] = canvas(24, 16);
  Rr(g, BOARD[2], 0, 0, 12, 4); Rr(g, BOARD[4], 0, 0, 12, 1); Rr(g, BOARD[0], 0, 3, 12, 1);                                         /* the last board, still on the road */
  for (let i = 0; i < 6; i++) { const w = 12 + i; Rr(g, BOARD[1 + (i & 1)], 11 + i, 1 + (i >> 1) + (v & 1), 1, 3); }                  /* its snapped, drooping end */
  P(g, BOARD[4], 17, 1); P(g, BOARD[4], 19, 2 + (v & 1)); P(g, OAK[0], 18, 5); P(g, BOARD[3], 20, 4); P(g, BOARD[3], 16, 0);        /* splinters */
  Rr(g, BOARD[1], 2, 6, 11, 3); Rr(g, BOARD[3], 2, 6, 11, 1); for (let i = 0; i < 5; i++) Rr(g, BOARD[0], 13 + i, 6 + (i >> 1) + 1, 1, 3); P(g, BOARD[4], 17, 8); P(g, BOARD[3], 14, 5);   /* the next one down, hanging */
  Rr(g, OAK[3], 0, 11, 10, 3); Rr(g, OAK[5], 0, 11, 10, 1); P(g, OAK[4], 10, 11); P(g, OAK[4], 11, 12); P(g, OAK[1], 11, 13); P(g, '#c9a672', 9, 12); P(g, '#c9a672', 10, 13);   /* the stringer, snapped off */
  Rr(g, ROPE, 4, 0, 2, 4); P(g, ROPE_D, 5, 2);                                                                                      /* a hemp end hanging from it */
  return outline(c, OUT); }); }
/* the crew's stake at the near lip: a driven post with a red rag and a hanging hemp coil (the crew has marked it: here the road stops) */
const stake = () => once('stakeB', () => { const [c, g] = canvas(10, 22);
  Rr(g, OAK[3], 3, 3, 3, 19); Rr(g, OAK[5], 3, 3, 1, 19); Rr(g, OAK[1], 5, 3, 1, 19); Rr(g, '#c9a672', 3, 2, 3, 1); Rr(g, ROPE, 2, 12, 5, 1); Rr(g, ROPE_D, 2, 13, 5, 1);
  Rr(g, RED, 6, 5, 4, 1); Rr(g, REDL, 6, 4, 3, 1); P(g, RED, 9, 6); P(g, RED, 9, 7); return outline(c, OUT); });
/* an old board sunk in the bog, tilted, wet (len px) */
function sunkBoard(v) { return once('sunk' + v, () => { const [c, g] = canvas(30, 10), t = (v % 3) - 1;
  for (let x = 0; x < 28; x++) { const yy = 2 + Math.round(x * t * 0.18) + (t < 0 ? 4 : 0); Rr(g, BOARD[1], x, yy, 1, 3); P(g, BOARD[3], x, yy); P(g, BOARD[0], x, yy + 2); if (x % 9 === 3) P(g, OAK[0], x, yy + 1); }
  return outline(c, OUT); }); }
export function drawBroken(g, x0, x1, y, w, time, seed = 0) {
  /* the old road's boards, sunk and tilted in the bog (partly under its skin: drawn first, the bog's over-pass veils them), a rope dangling from the left lip */
  for (let i = 0; i < Math.max(1, (w / 2) | 0); i++) { const s = sunkBoard(hash(seed, i)), bx = R(x0 + 10 + i * ((x1 - x0 - 40) / Math.max(1, w / 2)) + (hash(seed, i + 9) % 8)), by = R(y) + 16 + 4 + (hash(seed, i + 3) % 14); g.globalAlpha = 0.9; g.drawImage(s, bx, by); g.globalAlpha = 1; }
  g.drawImage(snapEnd(seed & 3), R(x0) - 12, R(y) - 1);
  g.save(); g.translate(R(x1) + 12, R(y) - 1); g.scale(-1, 1); g.drawImage(snapEnd((seed + 1) & 3), 0, 0); g.restore();
  const sw = Math.round(Math.sin(time * 1.6 + seed) * 1);
  Rr(g, ROPE, R(x0) - 5 + sw, R(y) + 3, 1, 12); Rr(g, ROPE_D, R(x0) - 4 + sw, R(y) + 6, 1, 8); P(g, ROPE_L, R(x0) - 5 + sw, R(y) + 14);
  g.drawImage(stake(), R(x0) - 28, R(y) - 21);
}

/* ---------------------------------------------------------------- the PEAT HOLE ---------------------------------------------------------------- */
const peatTex = () => once('peatTex', () => { const [c, g] = canvas(64, 64);
  Rr(g, '#150e08', 0, 0, 64, 64);
  for (let i = 0; i < 70; i++) { const x = hash(i, 1) % 64, y = hash(i, 2) % 64, w = 3 + hash(i, 3) % 9, h = 1 + hash(i, 4) % 3; Rr(g, i % 3 ? '#1e140c' : '#271b11', x, y, w, h); if (x + w > 64) Rr(g, '#1e140c', 0, y, x + w - 64, h); }
  for (let i = 0; i < 28; i++) { const x = hash(i, 5) % 62, y = hash(i, 6) % 60, l = 4 + hash(i, 7) % 9, d = (i & 1) ? 1 : -1; for (let k = 0; k < l; k++) P(g, k % 4 === 0 ? '#4a3322' : '#33241a', (x + k) % 64, Math.max(0, Math.min(63, y + ((k * d) >> 1))));   /* roots and fibres */ }
  for (let i = 0; i < 18; i++) P(g, '#5f4630', hash(i, 8) % 64, hash(i, 9) % 64);
  for (let i = 0; i < 6; i++) { const x = hash(i, 10) % 60, y = hash(i, 11) % 60; Rr(g, '#0a0604', x, y, 4, 2); P(g, '#2c2018', x, y); }
  return c; });
const clod = v => once('clod' + v, () => { const [c, g] = canvas(9, 5); Rr(g, PEAT[2], 1, 1, 7, 3); Rr(g, PEAT[3], 2, 0, 5, 2); Rr(g, PEAT[1], 1, 3, 7, 1); P(g, PEAT[5], 3, 1); P(g, '#4a6a34', 5, 0 + (v & 1)); P(g, '#4a6a34', 7, 1); return outline(c, OUT); });
/* behind the heroes (over = false): the bog's body; in front (over = true): the skin, whirl, clods, gas, and a veil over whoever is in it. (x0, x1) the pool's screen span, y its surface */
export function drawPeat(g, p, x0, x1, y, h, cx, cy, time, over) {
  const w = x1 - x0, bot = y + h;
  if (!over) {
    g.save(); g.beginPath(); g.rect(x0, y, w, h); g.clip();
    const t = peatTex(), ox = -(R(cx * 0.5) % 64 + 64) % 64, oy = R(time * 2) % 64;
    for (let X = x0 + ox - 64; X < x1; X += 64) for (let Y = y - 64 + (oy % 64); Y < bot; Y += 64) g.drawImage(t, X, Y);
    const gr = g.createLinearGradient(0, y, 0, bot); gr.addColorStop(0, 'rgba(10,6,4,0.25)'); gr.addColorStop(0.5, 'rgba(8,5,3,0.55)'); gr.addColorStop(1, 'rgba(4,3,2,0.9)'); g.fillStyle = gr; g.fillRect(x0, y, w, h);
    g.restore(); return;
  }
  g.save(); g.beginPath(); g.rect(x0 - 2, y - 12, w + 4, h + 12); g.clip();
  /* the veil: whoever sinks in it is seen through black */
  g.globalAlpha = 0.5; g.fillStyle = '#0c0805'; g.fillRect(x0, y + 2, w, h - 2); g.globalAlpha = 1;
  /* the skin: an oily dark film, a lit edge, rainbow specks of oil, drifting */
  Rr(g, '#241810', x0, y, w, 3); Rr(g, '#3a2a1c', x0, y, w, 1); Rr(g, '#0e0905', x0, y + 3, w, 1);
  for (let X = x0 + 3; X < x1 - 2; X += 7) { const q = Math.sin(time * 1.3 + (X + cx) * 0.31); if (q > 0.55) { P(g, '#6a8a5a', X, y); P(g, '#8a6aa0', X + 1, y); P(g, '#a89a4a', X + 2, y + 1); } }
  for (let X = x0; X < x1; X += 2) if (((X + cx) >> 1) % 5 === 0) P(g, '#4a3322', X, y - 1);                  /* clumped fibre at the surface */
  /* the whirl: a slow ring closing toward the middle of the hole (the bog drawing you down) */
  { const mx = (x0 + x1) / 2; for (let k = 0; k < 3; k++) { const ph = ((time * 0.5 + k / 3) % 1), rw = (w * 0.45) * (1 - ph); g.globalAlpha = 0.45 * Math.sin(ph * Math.PI); g.fillStyle = '#6a4a30'; g.fillRect(R(mx - rw), y + 1, R(rw * 2), 1); g.globalAlpha = 1; } }
  /* floating clods, turning slowly in the whirl */
  { const n = Math.max(1, (w / 40) | 0); for (let i = 0; i < n; i++) { const ph = (time * 0.12 + i / n + (p.x0 % 7) * 0.1) % 1, X = R(x0 + 6 + ph * (w - 22)), Y = y - 2 + R(Math.sin(time * 1.1 + i * 2) * 1); g.drawImage(clod(i), X, Y); } }
  /* gas: pale heavy blobs heaving up from the depth, swelling at the skin and bursting in a puff */
  { const n = Math.max(2, (w / 24) | 0); for (let i = 0; i < n; i++) { const ph = (time * 0.28 + hash(i, 33) % 100 / 100) % 1, X = R(x0 + 5 + (hash(i, 34) % Math.max(1, w - 10)));
      if (ph < 0.86) { const bY = R(bot - 6 - ph / 0.86 * (h - 8)), r = ph > 0.7 ? 2 : 1; g.globalAlpha = 0.5; Rr(g, '#8a8a54', X, bY, r + 1, r + 1); P(g, '#c9c68a', X, bY); g.globalAlpha = 1; }
      else { const k = (ph - 0.86) / 0.14; g.globalAlpha = 1 - k; Rr(g, '#a8a66a', X - 1, y - 2 - R(k * 3), 3, 2); P(g, '#c9c68a', X - 2 - R(k * 2), y - 3 - R(k * 2)); P(g, '#c9c68a', X + 2 + R(k * 2), y - 3 - R(k * 2)); g.globalAlpha = 1; } } }
  g.restore();
}
