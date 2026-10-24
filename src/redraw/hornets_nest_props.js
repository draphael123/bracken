// hornets_nest_props.js - THE HORNET'S NEST's PROPS, drawn (claude/hornetsnestart; SONNET over the greybox). ART ONLY: every size, box and timing is the hands' (src/hornets-nest-hands.js); this
// draws what they say.
//   slab(g, x, y, w, h, set, time)    a COMB: a mass of hex cells on a paper stalk - fresh (gold, glossy, dripping) while it hangs and falls, SET (dull amber, cracked, a crumbled rim) once landed
//   stand(g, x, y, time)              a honey-hunter's SMOKE STAND: a tripod of sticks, a clay pot with a pierced lid, red ember slits, smoke curling off it
//   pot(g, x, y, time, lit)           the clay pot in a hand, set down, or in the air (a bail handle, an ember slit, a trail of smoke)
//   cloud(g, x, y, r, k, time)        a SMOKE CLOUD: layered grey puffs, lighter at the heart, drifting, with ember specks; k = its fade (0..1)
//   cell(g, x, y, st, kk, time)       a BROOD CELL in the wall: a capped wax pocket (idle) that swells, glows and cracks (pulse, kk = how far gone) and the torn rim (broken / hatched)
//   glintDrips(g, x, y, w, time)      the honey drips off a comb's under-edge
import { canvas } from '../px.js';
import { COMB, WAX } from './hornets_nest_tiles.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const gpu = c => { const [o, g] = canvas(c.width, c.height, true); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0); return o; };   /* (a sprite drawn every frame lives on the GPU: see hornets_nest_backdrop.js) */
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h ^ (h >>> 16); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const PAPER = ['#2a1c10', '#4a3420', '#6a4e30', '#8a6c46', '#a8896a'];
const CLAY = ['#2a1a10', '#5a3420', '#8a5030', '#b0703e', '#d09a5a'];

/* ---------------- a comb: baked per (w, h, set) ---------------- */
function slabSprite(w, h, set) { return once('slab' + w + 'x' + h + (set ? 's' : 'f'), () => {
  const PAD = 14, [c, g] = canvas(w + 4, h + PAD + 4), top = 0, H = h;   /* the stalk is drawn above by the caller; the sprite holds the comb and its drip room */
  const pal = set ? ['#1e1206', '#4a300c', '#7a5014', '#a8741e', '#c8921e', '#e0b040'] : ['#2e1c08', '#6a4410', '#b07a20', '#e0a838', '#f6cc5c', '#fff1a0'];
  /* the mass: rounded corners, a wider top than its bottom (it hangs) */
  for (let y = 0; y < H; y++) { const t = y / Math.max(1, H - 1), inset = Math.round((1 - Math.min(1, y / 4)) * 2 + Math.pow(t, 3) * 3 + (y > H - 3 ? 2 : 0));
    for (let x = inset; x < w - inset; x++) {
      const row = Math.floor((y + 1) / 4), cu = (((x + (row & 1) * 3) % 6) + 6) % 6, cv = (y + 1) % 4;
      const wall = cv === 0 ? cu >= 1 && cu <= 4 : (cv !== 3 && (cu === 0 || cu === 5)) || (cv === 3 && (cu === 0 || cu === 5));
      const lit = x - inset < 2 || (cv === 1 && cu === 1);
      let col = wall ? pal[1] : lit ? pal[4] : pal[3 - (t > 0.7 ? 1 : 0)];
      if (!wall && hash(x, y) % 17 === 0) col = pal[5];      /* a glint */
      if (!wall && (hash(x >> 1, y >> 2) % 7 === 0)) col = pal[2];   /* a capped (waxed-over) cell: duller */
      if (y === 0 || x === inset || x === w - inset - 1 || y === H - 1) col = pal[0];
      if (y === 1 && x > inset && x < w - inset - 1) col = pal[5];
      if (set && ((x * 5 + y * 3) % 31 === 0 || (x * 3 - y * 7 + 200) % 37 === 0)) col = pal[0];   /* cracks */
      R(g, col, x, top + y, 1, 1); } }
  if (set) { for (let x = 3; x < w - 3; x += 5 + (hash(x, 7) % 4)) { R(g, pal[0], x, H - 1, 2, 1 + (hash(x, 3) % 3)); } }   /* a crumbled underside */
  return gpu(c); }); }
export function slab(g, x, y, w, h, set, time) {
  x = Math.round(x); y = Math.round(y); g.drawImage(slabSprite(w, h, set), x - 2, y);
  if (!set) glintDrips(g, x, y + h, w, time);
}
/* the paper stalk a hanging comb hangs from: a tapering neck of paper, ribbed. x mid, y from the top of the comb up to `len` */
export function stalk(g, mid, y, len) { for (let q = 0; q < len; q++) { const t = q / Math.max(1, len), hw = 2 + Math.round(t * 2) + (q % 5 === 0 ? 1 : 0); R(g, PAPER[(q >> 2) & 1 ? 2 : 1], mid - hw, y - q - 1, hw * 2, 1); R(g, PAPER[3], mid - hw, y - q - 1, 1, 1); R(g, PAPER[0], mid + hw - 1, y - q - 1, 1, 1); } }
export function glintDrips(g, x, y, w, time) { for (let xx = 5; xx < w - 3; xx += 9) { const ph = (time * 0.7 + xx * 0.137) % 1, len = 2 + Math.round(Math.sin(ph * 3.1) * 3 * (ph < 0.8 ? ph : 1.6 - ph) + 2);
  R(g, COMB[3], x + xx, y, 1, len); if (ph > 0.65) R(g, COMB[5], x + xx, y + len, 1, 1); } }

/* ---------------- the smoke stand ---------------- */
function standSprite() { return once('stand', () => { const [c, g] = canvas(26, 30);
  /* three sticks lashed at the top, the pot hung in the fork */
  for (let q = 0; q < 17; q++) { R(g, PAPER[1], 13 - q * 0.45, 29 - q, 2, 1); R(g, PAPER[1], 12 + q * 0.45, 29 - q, 2, 1); R(g, PAPER[2], 12, 29 - q, 1, 1); }
  R(g, PAPER[0], 11, 12, 4, 2); R(g, '#c9b27c', 11, 12, 4, 1);   /* the lashing */
  /* the pot: a squat clay jar with a pierced lid and a bail */
  R(g, CLAY[0], 7, 14, 12, 12); R(g, CLAY[0], 6, 16, 14, 8); R(g, CLAY[2], 8, 15, 10, 10); R(g, CLAY[2], 7, 17, 12, 6); R(g, CLAY[3], 8, 16, 3, 8); R(g, CLAY[4], 8, 17, 1, 4); R(g, CLAY[1], 15, 16, 3, 9);
  R(g, CLAY[0], 8, 12, 10, 3); R(g, CLAY[1], 9, 12, 8, 2); R(g, CLAY[3], 9, 12, 3, 1);   /* the lid */
  R(g, '#2a1408', 10, 20, 6, 1); R(g, '#ff6a2a', 11, 20, 4, 1); R(g, '#ffc860', 12, 20, 2, 1);   /* the ember slit */
  R(g, '#2a1408', 9, 14, 1, 1); R(g, '#2a1408', 16, 14, 1, 1); R(g, PAPER[1], 12, 10, 2, 3);
  return c; }); }
export function stand(g, x, y, time) { x = Math.round(x); y = Math.round(y); g.drawImage(standSprite(), x - 13, y - 30);
  g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 5 + x); R(g, '#ff8a3a', x - 2, y - 11, 4, 1); g.globalAlpha = 1;
  smokeCurl(g, x, y - 29, time, 4); }
/* ---------------- the pot in hand / set down / in flight ---------------- */
function potSprite() { return once('pot', () => { const [c, g] = canvas(13, 13);
  R(g, CLAY[0], 3, 3, 8, 8); R(g, CLAY[0], 2, 5, 10, 4); R(g, CLAY[2], 3, 4, 7, 7); R(g, CLAY[2], 2, 6, 9, 3); R(g, CLAY[3], 3, 5, 2, 5); R(g, CLAY[1], 9, 6, 2, 4); R(g, CLAY[4], 3, 6, 1, 2);
  R(g, CLAY[0], 4, 2, 6, 2); R(g, CLAY[1], 5, 2, 4, 1);
  R(g, '#ff6a2a', 5, 7, 4, 1); R(g, '#ffc860', 6, 7, 2, 1);
  R(g, PAPER[1], 4, 0, 1, 3); R(g, PAPER[1], 9, 0, 1, 3); R(g, PAPER[2], 4, 0, 6, 1);   /* the bail */
  return c; }); }
export function pot(g, x, y, time, lit = true) { x = Math.round(x); y = Math.round(y); g.drawImage(potSprite(), x - 6, y - 12);
  if (lit) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 9 + x); R(g, '#ff8a3a', x - 1, y - 5, 2, 1); g.globalAlpha = 1; smokeCurl(g, x, y - 13, time + x * 0.01, 3); } }

/* ---------------- a smoke cloud ---------------- */
/* a soft puff: a radial fade, baked once per tint and scaled (smoke is the one soft thing here) */
const puffSprite = col => once('puff' + col, () => { const [c, g] = canvas(32, 32, true), gr = g.createRadialGradient(16, 16, 1, 16, 16, 16), r = parseInt(col.slice(1, 3), 16), gg = parseInt(col.slice(3, 5), 16), b = parseInt(col.slice(5, 7), 16);
  gr.addColorStop(0, `rgba(${r},${gg},${b},0.95)`); gr.addColorStop(0.55, `rgba(${r},${gg},${b},0.55)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c; });
const puff = (g, x, y, r, a, col) => { g.globalAlpha = a; g.drawImage(puffSprite(col), Math.round(x - r), Math.round(y - r), Math.round(r * 2), Math.round(r * 2)); g.globalAlpha = 1; };
export function smokeCurl(g, x, y, time, n = 4) { for (let k = 0; k < n; k++) { const ph = (time * 0.45 + k / n) % 1, rr = 3 + ph * 7, px_ = x + Math.sin(time * 1.6 + k * 2 + ph * 4) * (2 + ph * 5), py = y - ph * 34; puff(g, px_, py, rr, 0.7 * (1 - ph) * (ph < 0.1 ? ph * 10 : 1), k % 2 ? '#aab0b8' : '#d0d6dc'); } }
export function cloud(g, x, y, r, k, time) { const n = 11;
  for (let i = 0; i < n; i++) { const a = i * 2.4 + time * (0.3 + (i % 3) * 0.12), rr = r * (0.25 + 0.5 * ((i * 37) % 10) / 10), px_ = x + Math.cos(a) * rr * 0.75, py = y + Math.sin(a * 1.3) * rr * 0.4, pr = r * (0.34 + 0.12 * ((i * 13) % 5) / 5);
    puff(g, px_ + pr * 0.15, py + pr * 0.2, pr, 0.34 * k, '#6a7078'); puff(g, px_, py, pr, 0.4 * k, i % 3 === 0 ? '#9aa0a8' : i % 3 === 1 ? '#c8d0d8' : '#e8ecf0'); }
  puff(g, x, y, r * 0.42, 0.4 * k, '#f4f6f8');
  for (let i = 0; i < 4; i++) { const a = time * 0.8 + i * 1.7, rr = r * 0.5 * ((i + 1) / 4); g.globalAlpha = 0.5 * k * (0.5 + 0.5 * Math.sin(time * 5 + i)); R(g, '#ffb060', x + Math.cos(a) * rr, y + Math.sin(a * 1.2) * rr * 0.5, 1, 1); }   /* an ember in it */
  g.globalAlpha = 1; }

/* ---------------- a brood cell ---------------- */
function cellSprite(st, step) { return once('cell' + st + step, () => { const [c, g] = canvas(24, 26), CX = 12, base = 24;
  if (st === 'broken') { R(g, COMB[0], 4, base - 5, 16, 5); R(g, COMB[1], 5, base - 4, 14, 4); R(g, COMB[3], 6, base - 4, 12, 1);
    for (const [x, w, h] of [[4, 3, 6], [9, 2, 8], [14, 3, 5], [18, 2, 7]]) { R(g, COMB[0], x, base - h - 1, w + 2, h + 1); R(g, COMB[2], x + 1, base - h, w, h); R(g, COMB[4], x + 1, base - h, 1, h - 1); }   /* torn cap shards */
    R(g, '#3a0e08', 8, base - 6, 8, 2); R(g, '#7a2a18', 9, base - 6, 6, 1); return c; }
  const sw = step * 0.5, ww = 12 + Math.round(sw * 3), hh = 15 + Math.round(sw * 4), x0 = CX - ww / 2, y0 = base - hh;
  R(g, COMB[0], x0 - 1, y0 + 2, ww + 2, hh - 2); R(g, COMB[0], x0 + 1, y0, ww - 2, 2);   /* the wax rim */
  const pulse = step > 0;
  for (let y = 0; y < hh - 2; y++) { const t = y / hh, inset = t < 0.2 ? Math.round((0.2 - t) * 10) : 0;
    for (let x = inset; x < ww - inset; x++) { const lit = x < 3, dark = x > ww - 4;
      let col = pulse ? (lit ? '#ffb06a' : dark ? '#9a2a1a' : '#e0583a') : (lit ? '#fbe38c' : dark ? '#b88a2c' : '#ecc258');
      if (hash(x, y) % 19 === 0) col = pulse ? '#ffd9a0' : '#fff6c8';
      R(g, col, x0 + x, y0 + 1 + y, 1, 1); } }
  /* the capped seam, a swelling of the larva behind: a dark curl, glowing when it pulses */
  R(g, COMB[1], x0 + 2, y0 + 3, ww - 4, 1); R(g, pulse ? '#5a0e08' : COMB[2], CX - 2, y0 + 5, 4, hh - 9); R(g, pulse ? '#ff7a3a' : '#f8e8b0', CX - 1, y0 + 6, 2, hh - 11);
  if (pulse) for (let k = 0; k < step + 1; k++) R(g, '#2a0804', CX - 4 + k * 3 + (k & 1), y0 + 4 + k * 3, 1, 4 + k);   /* cracks spreading */
  return c; }); }
export function cell(g, x, y, st, kk, time) { x = Math.round(x); y = Math.round(y);
  if (st === 'broken' || st === 'hatched') { g.drawImage(cellSprite('broken', 0), x - 12, y - 24); return; }
  if (st === 'pulse') { const step = Math.min(3, 1 + Math.floor(kk * 3)), sw = 1 + 0.12 * Math.sin(time * (8 + 14 * kk)); g.drawImage(cellSprite('pulse', step), x - 12, y - 24 + (1 - sw) * 20);
    puff(g, x, y - 12, 18 + kk * 8, 0.5 + 0.3 * kk, '#ff5a2a');
    R(g, '#ff6b6b', x - 8, y + 2, 16 * kk, 2); return; }
  g.drawImage(cellSprite('idle', 0), x - 12, y - 24); }

/* ---------------- the supports: a comb shelf stands on a WAX PILLAR (L.routeSupports; the greybox's wooden posts are not drawn here) ---------------- */
function pillarSprite(h) { return once('pil' + h, () => { const w = 11, [c, g] = canvas(w, h + 2);
  for (let y = 0; y < h; y++) { const t = y / Math.max(1, h - 1), hw = 2.6 + Math.pow(t, 3) * 2.6 + (y < 4 ? 1.4 - y * 0.3 : 0), x0 = Math.round(5.5 - hw), x1 = Math.round(5.5 + hw);
    for (let x = x0; x < x1; x++) { const row = Math.floor(y / 4), cu = (((x + (row & 1) * 3) % 6) + 6) % 6, cv = y % 4, wall = cv === 0 ? cu >= 1 && cu <= 4 : (cv !== 3 && (cu === 0 || cu === 5)) || (cv === 3 && (cu === 0 || cu === 5));
      const edge = x === x0 || x === x1 - 1; let col = edge ? COMB[0] : wall ? COMB[1] : (x - x0 < 3 ? COMB[3] : x1 - x < 3 ? COMB[1] : COMB[2]); if (!edge && !wall && hash(x, y) % 13 === 0) col = COMB[4]; R(g, col, x, y, 1, 1); } }
  R(g, COMB[0], 1, h - 1, 9, 2); R(g, COMB[1], 2, h - 2, 7, 1);   /* the foot, spread on the floor */
  return c; }); }
export function posts(g, L, cx, cy) { for (const p of L.routeSupports || []) { if (L.grid && !L.grid[p.y * L.W + p.x]) continue;   /* (claude/hornetsnest2) a perch torn loose (her buzz, the hall's tear) takes its pillar with it */ const x = Math.round(p.x * 16 + 6 - cx), y = Math.round(p.y * 16 + 6 - cy), bottom = Math.round(p.bottom * 16 - cy); if (x < -8 || x > g.canvas.width + 8 || y > g.canvas.height + 4 || bottom < -4) continue;
  const h = Math.max(4, bottom - y); g.drawImage(pillarSprite(h), x - 5, y); } }
