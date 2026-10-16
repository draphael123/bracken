/* src/scree-rock.js - THE SCREE PATH's ROCK PIERS (claude/screefix, Daniel 2026-10-15: "slabs on thin single posts in open sky", "this looks bad").
   A ledge that hangs over air is held by a PIER OF THE HILL'S OWN ROCK: a hoodoo whose capital merges into the slab, a waist, and a talus foot of rubble that
   stands on the ground (or on the slab below). It is as wide as a crag spire reads at 320x180 (never a 1-2 post stick), built from the SAME strata, light and
   rim colours as the ground tiles (src/redraw/crag_redress.js CRAG_PAL.scree) so the ledge, its pier and the floor are one rock. A pier that finds no ground
   (p.free) is the underbelly of a floating crag: a rough cone that tapers to a point.
   Baked ONCE per support (a small canvas, no per-frame rects) and drawn with drawImage - tools/mobile-perf stays flat.
   p = { x, y, bottom, w? }: tile coords, p.w the pier's top width in px (forest-supports.js sets it from the slab above it). */
import { canvas } from './px.js';
const C = { r: ['#8a7a70', '#9c8b7e', '#7a6a62', '#6c5d56'], crack: '#4a3e3a', rim: '#d8aa7c', rimD: '#b88a68', shade: '#5a4a58', out: '#3a2e38', grass: '#7a8a3a', grassL: '#b0bc50', grassD: '#4e5a2a', peb: '#b0a090', pebD: '#5e514a' };
const SW = 44, CX = 22, cache = new Map();
const hash = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const wave = (x, s) => Math.round(Math.sin((x + s * 7) * 0.45) * 0.8 + Math.sin((x + s * 3) * 0.19) * 0.9);
const BAND = [C.r[0], C.r[1], C.r[0], C.r[2], C.r[0], C.r[3]];

/* the pier's half width at row r of len (top row 0): a flared capital under the slab, a waist, a long talus foot */
function half(r, len, w0, free) {
  const base = w0 / 2;
  if (free) return Math.max(0.5, base * Math.pow(1 - r / len, 0.85) + 0.5);
  const waist = Math.max(5, base * 0.78), foot = Math.min(14.5, base + 3 + len / 24), F = Math.min(70, len * 0.5);
  const cap = Math.max(0, 1 - r / 12), t2 = Math.max(0, Math.min(1, (r - (len - F)) / F));
  return waist + (base - waist) * cap + (foot - waist) * Math.pow(t2, 1.7);
}

export function bakePier(p) {
  const h0 = 0, len = Math.max(4, Math.round((p.bottom - p.y) * 16 - 10)), w0 = Math.max(10, Math.min(26, p.w || 16)), free = !!p.free;
  const sd = (p.x * 31 + p.y * 17) | 0, [c, g] = canvas(SW, len + 8), P = C, top = 4;
  const rowL = new Int16Array(len), rowR = new Int16Array(len);
  for (let r = 0; r < len; r++) { const hw = half(r, len, w0, free), bl = Math.sin(r / 6.2 + sd) * 1.6 + Math.sin(r / 2.9 + sd * 0.3) * 0.7, jl = Math.round((hash(sd, r >> 2) - 0.5) * 3 + bl), jr = Math.round((hash(sd + 9, r >> 2) - 0.5) * 3 - bl * 0.8);   /* knuckles and bulges: a pier is a stack of rock, not a post */
    rowL[r] = Math.round(CX - hw - jl); rowR[r] = Math.round(CX + hw + jr); }
  const fill = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  /* the corbel the slab sits on: a lit lip and a dark one, wider than the capital */
  fill(rowL[0] - 3, top - 4, rowR[0] - rowL[0] + 7, 4, P.r[2]); fill(rowL[0] - 3, top - 4, rowR[0] - rowL[0] + 7, 1, P.rim); fill(rowL[0] - 3, top - 1, rowR[0] - rowL[0] + 7, 1, P.out);
  for (let r = 0; r < len; r++) {
    const l = rowL[r], rr = rowR[r], y = top + r;
    for (let x = l; x <= rr; x++) {
      const band = BAND[(((h0 + r + p.y * 16 + wave(x, sd & 15) + 24) / 4) | 0) % 6], edgeL = x - l, edgeR = rr - x;
      let col = band; if (edgeL <= 1) col = edgeL === 0 ? P.rim : P.r[1]; else if (edgeR <= 2) col = edgeR === 0 ? P.out : edgeR === 1 ? P.shade : P.r[3];
      if (r < 3) col = P.shade;                                  /* the slab's own shadow on the capital */
      fill(x, y, 1, 1, col); }
    fill(l - 1, y, 1, 1, P.out); fill(rr + 1, y, 1, 1, P.out);   /* the outline, so a pier reads against the far hills */
  }
  /* speckle, cracks, a ledge shelf every so often, moss on the lit side */
  for (let k = 0; k < len * 0.5; k++) { const r = (hash(sd, k + 40) * len) | 0, x = rowL[r] + 2 + ((hash(sd, k + 80) * Math.max(1, rowR[r] - rowL[r] - 4)) | 0); fill(x, top + r, 1, 1, hash(sd, k) < 0.5 ? P.r[3] : P.r[1]); }
  for (let k = 0; k < Math.max(1, Math.round(len / 60)); k++) { let x = CX - 3 + ((hash(sd, k + 200) * 7) | 0), r = 6 + ((hash(sd, k + 210) * Math.max(1, len - 40)) | 0); for (let n = 0; n < 9 && r < len - 2; n++, r++) { if (x > rowL[r] + 2 && x < rowR[r] - 2) fill(x, top + r, 1, 1, P.crack); if (hash(sd, r + k) < 0.4) x += hash(sd, r) < 0.5 ? -1 : 1; } }
  if (!free) {
    for (let r = 18 + (sd & 7), i = 0; r < len - 24; r += 30 + ((hash(sd, r) * 16) | 0), i++) { const w = 5 + ((hash(sd, r + 3) * 3) | 0), left = (i + sd) & 1, bx = left ? rowL[r] - w + 1 : rowR[r] - 1;   /* a lump of rock stepping out on one side, a tuft of grass on it */
      fill(bx, top + r, w, 4, P.r[left ? 1 : 2]); fill(bx, top + r, w, 1, P.rim); fill(bx, top + r + 3, w, 1, P.out); fill(bx + (left ? 0 : w - 1), top + r, 1, 4, P.out); fill(bx + 1, top + r - 1, 2, 1, P.grassD); fill(bx + 2, top + r - 2, 1, 1, P.grassL); }
    /* the talus foot: rubble banked against the base, a boulder or two */
    const by = top + len - 1;
    for (let k = 0; k < 6; k++) { const bw = 3 + ((hash(sd, k + 300) * 4) | 0), bx = k < 3 ? rowL[len - 1] - 3 + k * 3 : rowR[len - 1] - 6 + (k - 3) * 3; fill(bx, by - 2 - (k % 2), bw, 3 + (k % 2), P.r[k % 2 ? 2 : 0]); fill(bx, by - 2 - (k % 2), bw, 1, P.peb); fill(bx, by, bw, 1, P.out); }
  } else { fill(CX - 1, top + len - 1, 2, 1, P.out); }
  return { c, top };
}

/* drawn behind the tiles: g the frame, p the support, cx/cy the camera */
export function drawRockPier(g, p, cx, cy) {
  const k = p.x + ',' + p.y + ',' + p.bottom + ',' + (p.w || 0) + (p.free ? 'f' : '');
  let s = cache.get(k); if (!s) cache.set(k, s = bakePier(p));
  g.drawImage(s.c, Math.round(p.x * 16 + 8 - CX - cx), Math.round(p.y * 16 + 10 - s.top - cy));
}
