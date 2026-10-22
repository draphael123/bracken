// fen_site_art.js - THE CREWS' WORK SITES along THE FEN ROAD (claude/fenroad2art; Daniel 10-22: the boardwalk kit "with more variety": work sites, plank stacks, rope lashings,
// lanterns, half-built pilings). Scenery only, drawn behind the tiles (src/redraw/fen_road_art.js drawBack calls this); it is laid out once from the road itself - wherever a run of
// boards has clear air over it and no entity within three tiles - and each reach of the road has its own mix:
//   THE PEAT CUTTINGS  lantern posts, barrels and a sawhorse, a tarp lean-to, a coiled rope      THE WORK CREWS  the pile-driver tripod, plank stacks, sawhorses with a saw, half-built
//   pilings out in the water (a cap beam not yet laid), lantern posts, a tar brazier           THE STILT POSTS  tall lantern posts, hung nets, skull-and-rag totems, half pilings
//   THE PALISADE ROAD  braziers, skull stakes, sharpened-stake rows, red banners, plank stacks      THE CROSSING  banners and braziers either side of the gate's road
// Lanterns and braziers cast a small warm glow (drawn live, additive, a few fillRects).
import { canvas, outline } from '../px.js';
import { OAK, BOARD, FRESH, ROPE, ROPE_D, ROPE_L, RED, REDL, PEAT } from './fen_road_art.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177) | 0; return (h ^ (h >>> 16)) >>> 0; };
const P = (g, c, x, y) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, 1, 1); };
const Rr = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); };
const OUT = '#120c08', ROAD = 18, WATER = 19;
const IRON = '#3a3e42', IRONL = '#6a7078', CANVAS = ['#6a604a', '#8a7e60', '#a89a78'], FIRE = ['#ffd36b', '#ff9a3c', '#c84a1c'];

/* ---------------- the pieces ---------------- */
const lantern = () => once('lant', () => { const [c, g] = canvas(7, 9); Rr(g, IRON, 2, 0, 3, 1); Rr(g, IRON, 1, 1, 5, 1); Rr(g, '#a86a2a', 1, 2, 5, 5); Rr(g, '#ffd36b', 2, 3, 3, 3); P(g, '#fff6d0', 3, 4); Rr(g, IRON, 1, 7, 5, 1); P(g, IRON, 3, 8); return c; });
function lampPost(tall) { return once('lamp' + tall, () => { const H = tall ? 46 : 34, [c, g] = canvas(20, H);
  Rr(g, OAK[3], 3, 5, 3, H - 5); Rr(g, OAK[5], 3, 5, 1, H - 5); Rr(g, OAK[1], 5, 5, 1, H - 5); Rr(g, OAK[3], 3, 3, 12, 2); Rr(g, OAK[5], 3, 3, 12, 1); Rr(g, OAK[3], 3, 7, 5, 1); P(g, OAK[3], 7, 6);   /* the post, the crossarm, a brace */
  for (const y of [H - 12, H - 15]) { Rr(g, ROPE, 2, y, 5, 1); Rr(g, ROPE_D, 2, y + 1, 5, 1); }
  Rr(g, ROPE_D, 13, 4, 1, 2); g.drawImage(lantern(), 11, 5);
  Rr(g, RED, 7, 5, 3, 1); P(g, REDL, 8, 4); P(g, RED, 10, 6);
  return outline(c, OUT); }); }
const sawhorse = () => once('horse', () => { const [c, g] = canvas(30, 22);
  for (const lx of [3, 21]) { for (let i = 0; i < 10; i++) { P(g, OAK[3], lx + (i >> 1), 12 + i); P(g, OAK[3], lx + 6 - (i >> 1), 12 + i); P(g, OAK[4], lx + (i >> 1) - 0, 12 + i); } }
  Rr(g, OAK[3], 1, 10, 28, 2); Rr(g, OAK[5], 1, 10, 28, 1);
  Rr(g, FRESH[1], 4, 7, 22, 3); Rr(g, FRESH[3], 4, 7, 22, 1); Rr(g, FRESH[4], 25, 7, 1, 3); for (let i = 0; i < 4; i++) P(g, FRESH[0], 7 + i * 5, 8);   /* the board being cut */
  Rr(g, IRONL, 14, 3, 9, 1); for (let i = 0; i < 9; i += 2) P(g, IRON, 14 + i, 4); Rr(g, OAK[3], 12, 2, 3, 4); Rr(g, OAK[5], 12, 2, 3, 1); Rr(g, IRON, 14, 5, 1, 1);   /* a hand saw laid on it */
  for (let i = 0; i < 9; i++) P(g, i % 3 ? '#e0c490' : '#c9a672', 6 + ((i * 7) % 22), 20 + (i & 1));
  return outline(c, OUT); });
const barrel = () => once('barrel', () => { const [c, g] = canvas(22, 16);
  for (const bx of [1, 12]) { Rr(g, OAK[2], bx + 1, 1, 8, 13); Rr(g, OAK[3], bx, 3, 10, 9); Rr(g, OAK[5], bx + 1, 2, 2, 11); Rr(g, OAK[1], bx + 8, 2, 1, 11); Rr(g, IRON, bx, 4, 10, 1); Rr(g, IRON, bx, 10, 10, 1); Rr(g, IRONL, bx + 1, 4, 3, 1); Rr(g, OAK[1], bx + 1, 1, 8, 1); }
  Rr(g, '#2a1a10', 3, 1, 4, 1); P(g, '#c9a672', 4, 0); Rr(g, ROPE, 18, 12, 3, 3); Rr(g, ROPE_D, 18, 14, 3, 1); P(g, ROPE_L, 19, 12);   /* a tar bung, a coil of rope */
  return outline(c, OUT); });
const lean = () => once('lean', () => { const [c, g] = canvas(44, 28);   /* a crew's tarp lean-to: a pole frame, a patched canvas sheet pitched down to the back, a red stripe, a bedroll */
  Rr(g, OAK[3], 3, 4, 2, 24); Rr(g, OAK[5], 3, 4, 1, 24); Rr(g, OAK[3], 38, 12, 2, 16); Rr(g, OAK[1], 39, 12, 1, 16);
  for (let x = 2; x < 41; x++) { const y = 4 + Math.round((x - 2) * 0.22); Rr(g, CANVAS[1], x, y, 1, 11 - Math.round((x - 2) * 0.1)); P(g, CANVAS[2], x, y); P(g, CANVAS[0], x, y + 10 - Math.round((x - 2) * 0.1)); }
  Rr(g, RED, 14, 8, 3, 10); Rr(g, RED, 26, 10, 3, 9); P(g, REDL, 14, 8); P(g, REDL, 26, 10);   /* the stripes */
  Rr(g, CANVAS[0], 21, 12, 5, 4); Rr(g, '#5a4a38', 22, 13, 3, 2);   /* a patch */
  Rr(g, ROPE, 5, 14, 34, 1); for (let x = 6; x < 38; x += 8) { Rr(g, ROPE, x, 14, 1, 3); }   /* guy rope + pegs */
  Rr(g, '#5a3a2a', 12, 21, 14, 5); Rr(g, '#7a5a3a', 12, 21, 14, 1); Rr(g, '#8a7a5a', 13, 22, 3, 3); Rr(g, '#2a1a10', 10, 24, 3, 2);   /* a bedroll, boots */
  return outline(c, OUT); });
/* the pile-driver tripod: three lashed poles, a rope over the top, a heavy log weight hung on it, a mallet; the crews' machine for the pilings */
const driver = () => once('driver', () => { const [c, g] = canvas(40, 56);
  for (const [x0, x1] of [[19, 3], [20, 20], [21, 37]]) { for (let i = 0; i < 52; i++) { const x = Math.round(x0 + (x1 - x0) * i / 51 * (1 - 0.0)); P(g, OAK[3], x, 4 + i); P(g, OAK[4], x - (x1 > 20 ? 0 : -0), 4 + i); P(g, OAK[1], x + 1, 4 + i); } }
  Rr(g, OAK[3], 17, 2, 7, 4); Rr(g, ROPE, 17, 4, 7, 1); Rr(g, ROPE_D, 17, 5, 7, 1); Rr(g, RED, 24, 3, 3, 1); P(g, REDL, 24, 2);   /* the lashed head, a rag */
  Rr(g, ROPE_D, 20, 6, 1, 20); Rr(g, ROPE, 21, 6, 1, 20);                                                                              /* the hoist rope */
  Rr(g, OAK[2], 15, 26, 11, 10); Rr(g, OAK[4], 15, 26, 11, 2); Rr(g, OAK[5], 15, 26, 2, 10); Rr(g, OAK[0], 24, 27, 2, 9); Rr(g, IRON, 15, 30, 11, 1); P(g, IRONL, 17, 30);        /* the heavy log weight, banded */
  Rr(g, ROPE, 11, 36, 1, 16); P(g, ROPE_L, 11, 36);                                                                                     /* a haul line */
  return outline(c, OUT); });
const stackB = () => once('stackB', () => { const [c, g] = canvas(34, 18);
  for (let k = 0; k < 4; k++) { const y = 14 - k * 3, x = 2 + (k % 2) * 2; Rr(g, FRESH[1], x, y, 28 - (k % 3), 3); Rr(g, FRESH[3], x, y, 28 - (k % 3), 1); Rr(g, FRESH[0], x, y + 2, 28 - (k % 3), 1); Rr(g, FRESH[4], x + 27 - (k % 3), y, 1, 3); }
  Rr(g, OAK[3], 4, 16, 4, 2); Rr(g, OAK[3], 24, 16, 4, 2); Rr(g, ROPE, 11, 2, 2, 15); Rr(g, ROPE_D, 12, 2, 1, 15); Rr(g, ROPE, 20, 3, 2, 14); Rr(g, ROPE_D, 21, 3, 1, 14); Rr(g, RED, 21, 2, 3, 1);
  for (let i = 0; i < 8; i++) P(g, '#e0c490', 3 + ((i * 5) % 30), 17); return outline(c, OUT); });
const brazier = () => once('braz', () => { const [c, g] = canvas(14, 22);
  Rr(g, OAK[3], 6, 8, 2, 14); Rr(g, OAK[3], 3, 20, 8, 2); for (let i = 0; i < 4; i++) { P(g, IRON, 2 + i, 6 + i); P(g, IRON, 11 - i, 6 + i); } Rr(g, IRON, 3, 10, 8, 1); Rr(g, IRONL, 3, 6, 8, 1); Rr(g, '#2a1a10', 3, 7, 8, 3);
  Rr(g, '#a83a1c', 4, 6, 6, 1); return outline(c, OUT); });
const skullStake = () => once('skull', () => { const [c, g] = canvas(12, 26);
  Rr(g, OAK[3], 5, 8, 2, 18); Rr(g, OAK[5], 5, 8, 1, 18); Rr(g, '#e6dcc0', 3, 1, 6, 5); Rr(g, '#c8bea0', 3, 5, 6, 1); Rr(g, '#e6dcc0', 4, 6, 4, 2); P(g, '#2a1a10', 4, 3); P(g, '#2a1a10', 7, 3); P(g, '#2a1a10', 5, 7); P(g, '#2a1a10', 6, 7); Rr(g, RED, 7, 9, 4, 1); P(g, REDL, 8, 8); P(g, RED, 11, 10);
  Rr(g, ROPE, 4, 12, 4, 1); return outline(c, OUT); });
const banner = () => once('banner', () => { const [c, g] = canvas(16, 36);
  Rr(g, OAK[3], 2, 0, 2, 36); Rr(g, OAK[5], 2, 0, 1, 36); Rr(g, OAK[3], 2, 2, 12, 1); Rr(g, '#7a1c1c', 4, 3, 9, 16); Rr(g, RED, 4, 3, 9, 2); Rr(g, '#4a0e0e', 4, 17, 9, 2); P(g, '#7a1c1c', 6, 19); P(g, '#7a1c1c', 10, 19);
  Rr(g, '#e6dcc0', 7, 8, 3, 4); P(g, '#2a1a10', 7, 9); P(g, '#2a1a10', 9, 9); Rr(g, '#e6dcc0', 7, 12, 3, 1);   /* the goblin skull sigil */ return outline(c, OUT); });
const stakes = () => once('stakes', () => { const [c, g] = canvas(30, 16);
  for (let i = 0; i < 6; i++) { const x = 1 + i * 5, h = 10 + (i % 3) * 2; Rr(g, OAK[3], x, 16 - h, 3, h); Rr(g, OAK[5], x, 16 - h, 1, h); Rr(g, OAK[1], x + 2, 16 - h, 1, h); P(g, OAK[4], x + 1, 15 - h); P(g, '#c9a672', x + 1, 14 - h); }
  Rr(g, ROPE, 0, 9, 30, 1); Rr(g, ROPE_D, 0, 10, 30, 1); return outline(c, OUT); });
/* half-built pilings out in the water behind the road: three driven piles of unequal height, a cap beam laid on two of them, a ladder, not yet laid on the third; 44 x 40 */
const pilings = v => once('pil' + v, () => { const [c, g] = canvas(44, 40), hs = [34, 30 + (v & 1) * 3, 22];
  [4, 20, 36].forEach((x, i) => { Rr(g, OAK[3], x, 40 - hs[i], 4, hs[i]); Rr(g, OAK[5], x, 40 - hs[i], 1, hs[i]); Rr(g, OAK[1], x + 3, 40 - hs[i], 1, hs[i]); Rr(g, OAK[4], x + 1, 39 - hs[i], 2, 1); for (const y of [10, 20]) { Rr(g, ROPE, x - 1, 40 - hs[i] + y - 6, 6, 1); Rr(g, ROPE_D, x - 1, 40 - hs[i] + y - 5, 6, 1); } });
  Rr(g, OAK[2], 2, 40 - hs[0] - 3, 22, 3); Rr(g, OAK[4], 2, 40 - hs[0] - 3, 22, 1); Rr(g, ROPE, 8, 40 - hs[0] - 4, 2, 5); for (let i = 0; i < 10; i += 2) { P(g, OAK[1], 14 + i, 40 - hs[0] + 1 + (i & 2)); }
  for (let y = 0; y < 14; y += 3) { Rr(g, OAK[2], 28, 40 - hs[1] + 4 + y, 6, 1); } Rr(g, OAK[3], 28, 40 - hs[1] + 2, 1, 16); Rr(g, OAK[3], 33, 40 - hs[1] + 2, 1, 16);
  Rr(g, FRESH[3], 24, 40 - hs[2] - 3, 14, 2); P(g, FRESH[4], 37, 40 - hs[2] - 3);    /* a cap beam waiting, laid across the top of one */
  return outline(c, OUT); });
const net = () => once('net', () => { const [c, g] = canvas(30, 26);
  Rr(g, OAK[3], 0, 0, 30, 2); Rr(g, OAK[5], 0, 0, 30, 1);
  for (let y = 2; y < 24; y += 3) for (let x = 1 + (y % 2); x < 29; x += 3) { P(g, ROPE_D, x, y); P(g, ROPE, x + 1, y + 1); } for (let x = 1; x < 29; x += 6) Rr(g, ROPE_D, x, 2, 1, 22);
  for (const [x, y] of [[5, 20], [14, 22], [23, 19]]) { Rr(g, '#8a9aa0', x, y, 4, 2); P(g, '#dfe8ea', x, y); P(g, '#2a2a2a', x + 3, y); }   /* a few fish caught in it */
  for (const x of [3, 11, 19, 26]) Rr(g, '#a86a2a', x, 24, 2, 2);   /* the floats */
  return outline(c, OUT); });

/* ---------------- layout ---------------- */
const ZONE = t => t < 105 ? 0 : t < 211 ? 1 : t < 311 ? 2 : t < 405 ? 3 : 4;
function layout(L, T) {
  if (L._frSites) return L._frSites; const W = L.W, g = L.grid, at = (x, y) => g[y * W + x], out = [], busy = new Uint8Array(W);
  const INT = new Set(['sign', 'lashing', 'check', 'crewgap', 'broken', 'sag', 'rotten', 'gate', 'deco', 'undertow', 'shrine', 'bogtroll', 'silver']);
  for (const e of L.ents || []) { if (!INT.has(e.t)) continue; for (let d = -1; d <= 1; d++) { const x = Math.round(e.x) + d; if (x >= 0 && x < W) busy[x] = 1; } }
  for (const b of L.bundles || []) for (let d = -3; d <= 3; d++) { const x = b[0] + d; if (x >= 0 && x < W) busy[x] = 1; }
  const free = (x, n) => { for (let i = 0; i < n; i++) { const q = x + i; if (q < 1 || q >= W - 1 || busy[q]) return false; if (at(q, ROAD - 1) !== T.AIR || at(q, ROAD - 2) !== T.AIR) return false; const t = at(q, ROAD); if (t !== T.PLANK && t !== T.SOLID) return false; } return true; };
  const take = (x, n) => { for (let i = -1; i <= n; i++) if (x + i >= 0 && x + i < W) busy[x + i] = 1; };
  const MIX = [
    ['lamp', 'barrel', 'horse', 'lean', 'lamp', 'stackB', 'barrel'],
    ['driver', 'stackB', 'horse', 'lamp', 'stackB', 'barrel', 'brazier', 'horse', 'lean'],
    ['lamp', 'net', 'lamp', 'skull', 'barrel', 'lamp', 'net'],
    ['brazier', 'skull', 'stakes', 'banner', 'brazier', 'stackB', 'skull', 'stakes'],
    ['banner', 'brazier', 'banner', 'brazier'],
  ];
  const W_ = { lamp: 1, barrel: 2, horse: 2, lean: 3, driver: 3, stackB: 2, brazier: 1, net: 2, skull: 1, stakes: 2, banner: 1 };
  for (let x = 4; x < W - 6; x += 4) { const hs = hash(x, 5), z = ZONE(x); if (hs % 100 >= (z === 4 ? 60 : z === 1 ? 70 : 62)) continue; const mix = MIX[z], kind = mix[(hs >>> 8) % mix.length], w = W_[kind], px = x + (hs >>> 4) % 3;
    if (!free(px, w)) continue; take(px, w); out.push({ k: kind, x: px * 16 + (w * 16) / 2 - 8, z }); }
  /* half-built pilings out in the water behind the road: along the crews' and the stilt posts' reaches, over the fen's open water */
  for (const p of L.pools || []) if (p.fen && !p.peat) for (let x = Math.floor(p.x0 / 16) + 4; x < Math.floor(p.x1 / 16) - 6; x += 11) { const hs = hash(x, 77), z = ZONE(x); if (z < 1 || z > 3 || hs % 100 >= 36) continue; out.push({ k: 'pilings', x: x * 16 + 22, v: hs % 4, z }); }
  return (L._frSites = out.sort((a, b) => a.x - b.x));
}
const glow = (g, x, y, r, a) => { g.globalAlpha = a; g.fillStyle = '#ffb44a'; g.fillRect(Math.round(x - r), Math.round(y - 1), r * 2, 3); g.fillRect(Math.round(x - 1), Math.round(y - r), 3, r * 2); g.globalAlpha = a * 0.6; g.fillRect(Math.round(x - r * 0.7), Math.round(y - r * 0.7), Math.round(r * 1.4), Math.round(r * 1.4)); g.globalAlpha = 1; };
const SPR = { lamp: () => lampPost(false), lampT: () => lampPost(true), horse: sawhorse, barrel, lean, driver, stackB, brazier, net, skull: skullStake, banner, stakes };
const OFF = { lamp: [10, 34], horse: [15, 22], barrel: [11, 16], lean: [22, 28], driver: [20, 56], stackB: [17, 18], brazier: [7, 22], net: [15, 26], skull: [6, 26], banner: [8, 36], stakes: [15, 16] };

/* BEHIND THE TILES (drawn from fen_road_art.drawBack) */
export function drawSites(g, L, cx, cy, time, T) {
  const VW = g.canvas.width; for (const o of layout(L, T)) { const X = Math.round(o.x - cx); if (X < -50 || X > VW + 50) continue;
    if (o.k === 'pilings') { g.globalAlpha = 0.85; g.drawImage(pilings(o.v), X - 22, WATER * 16 - cy - 34 + 12); g.globalAlpha = 1; continue; }
    const yb = ROAD * 16 - cy, [ox, oh] = OFF[o.k] || [10, 20];
    if (o.k === 'lamp') { const tall = o.z === 2; const s = tall ? lampPost(true) : lampPost(false); g.drawImage(s, X - ox, yb - s.height); const fl = 0.6 + 0.25 * Math.sin(time * 6 + o.x) * Math.sin(time * 2.3 + o.x * 0.1); glow(g, X - ox + 14.5, yb - s.height + 9, 9, 0.16 * fl); continue; }
    if (o.k === 'brazier') { g.drawImage(brazier(), X - ox, yb - oh); const fl = Math.floor(time * 9 + o.x) % 3; Rr(g, FIRE[2], X - 3, yb - oh + 2 - fl, 6, 3); Rr(g, FIRE[1], X - 2, yb - oh + 1 - fl, 4, 3); Rr(g, FIRE[0], X - 1, yb - oh - fl, 2, 3); const q = (time * 1.4 + o.x * 0.1) % 1; g.globalAlpha = 0.5 * (1 - q); Rr(g, FIRE[0], X - 3 + Math.round(Math.sin(q * 6 + o.x) * 3), yb - oh - 4 - Math.round(q * 14), 1, 1); g.globalAlpha = 1; glow(g, X, yb - oh, 11, 0.2 * (0.7 + 0.3 * Math.sin(time * 11 + o.x))); continue; }
    if (o.k === 'banner') { const s = banner(), sw = Math.round(Math.sin(time * 1.6 + o.x) * 1); g.drawImage(s, X - ox + sw * 0, yb - oh); Rr(g, '#4a0e0e', X - 4 + 8 + sw, yb - oh + 19, 1, 1); continue; }
    if (!SPR[o.k]) throw new Error("site kind " + o.k); const s = SPR[o.k](); g.drawImage(s, X - ox, yb - s.height); }
}
