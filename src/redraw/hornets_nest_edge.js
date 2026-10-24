// src/redraw/hornets_nest_edge.js - THE NEST'S TWO ENDS, drawn (claude/hornets2art; SONNET over the greybox rects). ART ONLY: no tile, no ent, no grid is changed; the level's hash keeps.
//   THE OLD PINES (the foot, cols 0-80):  scrap(g, x, y, k)     a flake of the nest's grey paper blown down onto the needles - curled, a hex watermark, a pale curl-edge
//                                         pineNest(g, x, y, t)  a little ABANDONED paper nest hung from a pine bough: the first sighting (an egg of grey shells, a dark mouth, two specks circling)
//   THE MARSH EDGE (cols 354-419):        mudTile(x, y, at, T)  the muddy-bank tile: wet dark mud with a cool sheen, sedge tufts on the lip, reed roots, footprints, a bank face where it meets water
//                                         reed(g, x, y, h, k, t) / cattail(g, x, y, h, t)  swaying reed clumps with tapered blades; a cattail's brown head and spike
//                                         pad(g, x, y, k, t)    a lily pad (a notch, a vein, the odd white flower); mist(g, x0, x1, y, t)  low drifting mist
import { canvas } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h ^ (h >>> 16); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const gpu = c => { const [o, g] = canvas(c.width, c.height, true); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0); return o; };
const tile = fn => { const [c, g] = canvas(16, 16); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const col = fn(x, y); if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); } } return c; };
const PAPER = ['#2a241c', '#4a4132', '#6c614c', '#8e8268', '#b0a488', '#cfc4a8'];
const MUD = ['#120e08', '#1e1710', '#2c2217', '#3e3020', '#544229'], REED = ['#2a3e1a', '#44602a', '#628a3a', '#86b04e', '#b0d070'], NEEDLE = ['#222f10', '#38491a', '#506a26', '#728c34', '#9eb44c'];

/* ---------------- the old pines: a scrap of nest paper ---------------- */
function scrapSprite(k) { return once('scrap' + k, () => { const w = [9, 7, 10, 6][k], h = [4, 4, 5, 3][k], [c, g] = canvas(w + 2, h + 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const curl = y === 0 && x > w - 4; const inside = (x - (w - 1) / 2) ** 2 / ((w / 2) ** 2) + (y - (h - 1) / 2) ** 2 / ((h / 2) ** 2) <= 1.05; if (!inside) continue;
    let col = y === h - 1 ? PAPER[1] : y === 0 ? PAPER[5] : (x + y * 2) % 4 === 0 ? PAPER[3] : PAPER[4]; if ((x + (y & 1) * 2) % 4 === 1 && y > 0 && y < h - 1) col = PAPER[3]; if (curl) col = PAPER[2]; R(g, col, x + 1, y + 2, 1, 1); }
  R(g, PAPER[0], 1 + (k & 1), h + 2, w - 2, 1);   /* its shadow on the needles */
  return c; }); }
export function scrap(g, x, y, k, time) { const lift = k === 2 ? Math.round(Math.sin(time * 1.3 + x * 0.1) * 1) : 0; g.drawImage(scrapSprite(k & 3), Math.round(x) - 5, Math.round(y) - 5 + lift); }

/* ---------------- a little abandoned paper nest on a bough (a distant first sighting) ---------------- */
function pineNestSprite() { return once('pnest', () => { const W = 56, H = 70, [c, g] = canvas(W, H), cx = 30;
  /* the bough it hangs from: a limb of bark with a needle skirt */
  for (let x = 0; x < W; x++) { const y = 4 + Math.round(Math.sin(x / 9) * 1.2); R(g, '#37271c', x, y, 1, 4); R(g, '#523a28', x, y, 1, 1); if (x % 3 === 0) { const len = 5 + (hash(x, 3) % 7); R(g, NEEDLE[1 + (x % 2)], x, y + 4, 1, len); R(g, NEEDLE[3], x, y + 4, 1, 1); } }
  R(g, PAPER[1], cx - 1, 8, 3, 8); R(g, PAPER[3], cx, 8, 1, 8);   /* the stalk */
  /* the shell: an egg of overlapping scalloped tiers, lit on its left, a dark mouth at the foot */
  const ry = 25, rx = 14, ny = 16 + ry;
  for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) { const d = (x * x) / (rx * rx) + (y * y) / (ry * ry); if (d > 1) continue;
    const tier = Math.floor((y + ry) / 6), r = (y + ry) % 6, scallop = Math.round(1.2 * Math.sin((x + tier * 5) / 2.6)), rr = r + scallop;
    let s = rr >= 5 ? 0 : rr === 4 ? 1 : rr <= 0 ? 5 : 3; if (x < -rx * 0.45) s = Math.min(5, s + 1); else if (x > rx * 0.4) s = Math.max(0, s - 1); if (hash(x + 20, y + 20) % 11 === 0) s = Math.max(0, s - 1);
    R(g, d > 0.88 ? PAPER[0] : PAPER[s], cx + x, ny + y, 1, 1); }
  for (let q = 0; q < 5; q++) R(g, '#17120c', cx - 3 + q, ny + ry - 3 + (q === 0 || q === 4 ? 1 : 0), 1, 3 - (q === 0 || q === 4 ? 1 : 0));   /* the mouth */
  R(g, '#17120c', cx - 2, ny + ry - 2, 5, 2);
  return gpu(c); }); }
export function pineNest(g, x, y, time) { x = Math.round(x); y = Math.round(y); g.drawImage(pineNestSprite(), x - 30, y);
  /* two hornets coming and going at the mouth: specks on little loops */
  for (let k = 0; k < 2; k++) { const a = time * (1.6 + k * 0.5) + k * 3, hx = x + Math.cos(a) * (8 + k * 5), hy = y + 58 + Math.sin(a * 1.3) * 5 - k * 4; R(g, '#1a0c06', hx, hy, 3, 2); R(g, '#e8a838', hx, hy, 1, 1); R(g, '#dce8f4', hx + (Math.sin(a * 18) > 0 ? 0 : 1), hy - 1, 2, 1); } }

/* ---------------- the marsh edge: the muddy-bank tile ---------------- */
export function mudTile(x, y, at, T, rows = 66) {
  const eU = at(x, y - 1) !== T.SOLID && at(x, y - 1) !== T.CRATE, eL = at(x - 1, y) === T.AIR, eR = at(x + 1, y) === T.AIR, depth = y - rows;
  return once('mud' + (x & 7) + (y & 7) + (eU ? 'u' : '') + (eL ? 'l' : '') + (eR ? 'r' : '') + Math.min(4, depth), () => tile((px, py) => {
    const u = x * 16 + px, v = y * 16 + py, hh = hash(u, v);
    if (eU) {
      if (py === 0) { const t = hash(u >> 1, 41) % 9; if (t === 0 || t === 1) return null;   /* a sedge tuft's ragged top */ return t < 4 ? REED[2] : t < 6 ? REED[1] : MUD[4]; }
      if (py === 1) { const t = hash(u >> 1, 41) % 9; return t < 4 ? REED[1] : t < 6 ? REED[0] : (hh % 6 === 0 ? '#8a9a96' : MUD[3]); }
      if (py === 2) { if (hash(u, 23) % 7 === 0) return '#7a8a88'; return hh % 5 === 0 ? MUD[2] : MUD[3]; }   /* a wet glint */
    }
    if (eL && px === 0 || eR && px === 15) return MUD[0];
    /* the bank where it meets the water: darker, mossed, with streaks running down */
    const bank = (eL && px < 5) || (eR && px > 10);
    let s = bank ? 1 : 3 + (hh % 5 === 0 ? 1 : 0) - (hh % 7 === 0 ? 1 : 0) - (depth > 1 ? 1 : 0);
    if ((u * 3 + v * 5) % 29 === 0) return REED[0];                                        /* a reed-root thread */
    if (hash(u >> 2, v >> 2) % 11 === 0 && px % 4 < 3 && py % 4 < 2) return ['#6a6a58', '#4a4a3c'][hh & 1];   /* a stone */
    if (eU && py < 7 && hash(u >> 3, 19) % 6 === 0 && px % 6 < 3 && py > 3) return MUD[1];   /* a footprint's shadow */
    if (bank && hh % 6 === 0) return REED[1];
    return MUD[Math.max(0, Math.min(4, s))];
  }));
}

/* ---------------- reeds, cattails, pads, mist ---------------- */
/* a clump of reeds: tapered blades leaning a little each way, swaying in the draught; h = 1..4 (x6 px) */
export function reed(g, x, y, h, k, time) {
  x = Math.round(x); y = Math.round(y); const sway = Math.sin(time * 1.1 + k * 0.7);
  for (let b = -2; b <= 2; b++) { const hh = h * 6 + (b === 0 ? 8 : b % 2 ? 0 : 3) + (hash(k, b + 9) % 4), lean = b * 1.1 + sway * (b === 0 ? 1 : 1.6);
    for (let s = 0; s < hh; s += 2) { const t = s / hh, bx = x + b * 2 + Math.round(lean * t * t * 3), by = y - s, w = t > 0.8 ? 1 : 1 + (t < 0.35 ? 1 : 0), col = t > 0.85 ? REED[4] : t > 0.5 ? REED[3] : t > 0.2 ? REED[2] : REED[1];
      R(g, col, bx, by - 1, w, 2); if (t < 0.7) R(g, REED[0], bx + w, by - 1, 1, 2); } } }
export function cattail(g, x, y, h, time) {
  x = Math.round(x); const sway = Math.round(Math.sin(time * 1.1 + x * 0.7) * 1.5), hh = h * 6 + 14;
  for (let s = 0; s < hh; s += 2) { const t = s / hh, bx = x + Math.round(sway * t * t); R(g, t > 0.6 ? REED[3] : REED[2], bx, Math.round(y) - s - 1, 1, 2); R(g, REED[0], bx + 1, Math.round(y) - s - 1, 1, 2); }
  const hx = x + sway - 1, hy = Math.round(y) - hh - 8;
  R(g, '#2a1408', hx - 1, hy - 1, 5, 10); R(g, '#6a3e1c', hx, hy, 3, 8); R(g, '#8a5a2a', hx, hy + 1, 1, 6); R(g, '#3a2210', hx + 2, hy + 1, 1, 7);   /* the brown sausage head */
  R(g, '#c8a060', hx + 1, hy + 2, 1, 1); R(g, '#c8a060', hx, hy + 5, 1, 1);                                                                      /* a puff of seed */
  R(g, REED[3], hx + 1, hy - 5, 1, 4); R(g, REED[4], hx + 1, hy - 5, 1, 1);                                                                      /* the spike above it */
}
export function pad(g, x, y, k, time) { x = Math.round(x); y = Math.round(y + Math.sin(time * 1.6 + k) * 0.6);
  const w = 13 + (k % 3), rows = [[4, 5], [2, 9], [1, 11], [1, 12], [2, 10]];
  for (let r = 0; r < rows.length; r++) { const [ox, ww] = rows[r]; for (let i = 0; i < Math.min(ww, w); i++) { if (r === 2 && i >= 6 && i <= 7) continue;   /* the notch */
      R(g, r === 0 ? '#86b050' : r === 4 ? '#2e4a20' : (i + r) % 5 === 0 ? '#6a9a44' : '#4e7a34', x - 6 + ox + i, y - 2 + r, 1, 1); } }
  R(g, '#2a4a1c', x - 1, y, 4, 1); R(g, '#2a4a1c', x + 1, y + 1, 3, 1);                                                                          /* the vein */
  if (k % 4 === 0) { R(g, '#f6f0e0', x - 2, y - 4, 1, 2); R(g, '#f6f0e0', x, y - 5, 1, 3); R(g, '#f6f0e0', x + 2, y - 4, 1, 2); R(g, '#e8c840', x, y - 3, 1, 1); }   /* a flower */
}
const mistPuff = () => once('mist', () => { const [c, g] = canvas(96, 20, true), gr = g.createRadialGradient(48, 0, 1, 48, 0, 46); gr.addColorStop(0, 'rgba(232,240,232,0.85)'); gr.addColorStop(0.6, 'rgba(220,232,224,0.35)'); gr.addColorStop(1, 'rgba(220,232,224,0)'); g.translate(0, 10); g.scale(1, 0.22); g.fillStyle = gr; g.fillRect(0, -46, 96, 92); return c; });
/* bake the old pines' and the marsh edge's pictures at the level's load (a first draw in play was a hitch) */
export function warmEdge() { pineNestSprite(); for (let k = 0; k < 4; k++) scrapSprite(k); mistPuff(); }
export function mist(g, x0, x1, y, time, a = 0.3) { const spr = mistPuff();
  for (let k = 0; k < 7; k++) { const ph = (time * 0.025 + k * 0.143) % 1, x = x0 + ph * (x1 - x0) - 48, yy = y - 6 - (k % 3) * 5 + Math.sin(time * 0.4 + k) * 1.5; g.globalAlpha = a * Math.sin(ph * Math.PI); g.drawImage(spr, Math.round(x), Math.round(yy), 120, 24); } g.globalAlpha = 1; }
