/* src/spire-supports-art.js - the drawn supports of THE MONASTERY (see src/spire-supports.js). p = { x, y, bottom, kind: 'beam' | 'pier', w }; tile coords, drawn behind the tiles.
   Baked once per support into a small canvas (no per-frame rects) and drawn with drawImage.
   beam  a SCAFFOLD POST: weathered timber with grain, an iron strap every 14 px, a knee brace each side under the board, a stone bearing block at the foot.
   pier  a MASONRY PIER: a shaft of dressed courses (staggered joints, lit west edge, shaded east), a moulded capital under the floor, a plinth. */
import { canvas } from './px.js';
const hash = (a, b) => { let h = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const T = { wood: '#7a5634', woodL: '#a37a4c', woodD: '#4a3220', grain: '#5e4228', iron: '#2e2e36', ironL: '#6a6a76', out: '#2a1e16' };
const S = { base: ['#a89c88', '#b4a88e', '#9c9078'], light: '#d2c6ac', dark: '#7c705e', mortar: '#5e5446', out: '#3a3228', moss: '#6a8a4a', mossD: '#4a6a34' };
const SW = 34, CX = 17, cache = new Map();
const fill = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };

function bakeBeam(p) {
  const len = Math.max(8, (p.bottom - p.y) * 16 - 8), pw = Math.max(4, Math.min(8, p.w || 6)), [c, g] = canvas(SW, len + 12), top = 10, sd = (p.x * 29 + p.y * 13) | 0, l = CX - (pw >> 1);
  /* the knee braces: two timbers from the post up under the board, 2 px thick, on both sides */
  for (let k = 0; k < 12; k++) { const x = l - 1 - k, y = top + 3 + k - 2; fill(g, x, y - 3 + 0, 2, 2, T.woodD); fill(g, x, y - 3, 1, 1, T.wood); const xr = l + pw + k; fill(g, xr, y - 3, 2, 2, T.woodD); fill(g, xr + 1, y - 3, 1, 1, T.wood); }
  /* the post */
  fill(g, l - 1, top - 4, pw + 2, len + 4, T.out); fill(g, l, top - 4, pw, len + 4, T.wood); fill(g, l, top - 4, 1, len + 4, T.woodL); fill(g, l + pw - 1, top - 4, 1, len + 4, T.woodD);
  for (let k = 0; k < len * 0.7; k++) { const y = top - 3 + ((hash(sd, k) * (len + 2)) | 0); fill(g, l + 1 + ((hash(sd, k + 99) * Math.max(1, pw - 2)) | 0), y, 1, 2 + ((hash(sd, k + 7) * 3) | 0), T.grain); }   /* the grain */
  for (let y = top + 6; y < top + len - 6; y += 14) { fill(g, l - 1, y, pw + 2, 2, T.iron); fill(g, l - 1, y, pw + 2, 1, T.ironL); fill(g, l + (pw >> 1), y, 1, 1, '#c8c8d0'); }   /* iron straps, a rivet on each */
  fill(g, l - 3, top - 4, pw + 6, 3, T.iron); fill(g, l - 3, top - 4, pw + 6, 1, T.ironL);   /* the cap plate under the board */
  /* a tie and a short diagonal every so often on a tall post */
  for (let y = top + 40, i = 0; y < top + len - 20; y += 40, i++) { const left = (i + sd) & 1; for (let k = 0; k < 8; k++) fill(g, left ? l - 1 - k : l + pw + k, y + k, 2, 2, T.woodD); }
  /* the bearing block it stands on */
  const by = top + len - 1; fill(g, l - 4, by - 3, pw + 8, 4, S.dark); fill(g, l - 4, by - 3, pw + 8, 1, S.light); fill(g, l - 4, by + 1, pw + 8, 1, S.out); fill(g, l - 4, by - 3, 1, 4, S.out); fill(g, l + pw + 3, by - 3, 1, 4, S.out);
  return { c, top };
}

function bakePier(p) {
  const len = Math.max(12, (p.bottom - p.y) * 16 - 8), pw = Math.max(8, Math.min(14, p.w || 10)), [c, g] = canvas(SW, len + 12), top = 10, sd = (p.x * 31 + p.y * 17) | 0, l = CX - (pw >> 1);
  /* the shaft: courses 8 px high, a staggered vertical joint in each, lit west edge, shaded east */
  fill(g, l - 1, top, pw + 2, len, S.out);
  for (let y = 0, i = 0; y < len; y += 8, i++) { const h = Math.min(8, len - y), col = S.base[(hash(sd, i) * 3) | 0];
    fill(g, l, top + y, pw, h, col); fill(g, l, top + y, pw, 1, S.mortar); fill(g, l, top + y + 1, pw, 1, S.light);
    const jx = l + 2 + ((hash(sd + 5, i) * (pw - 4)) | 0); fill(g, jx, top + y + 1, 1, h - 1, S.mortar); }
  fill(g, l, top, 2, len, S.light); fill(g, l + pw - 3, top, 3, len, S.dark); fill(g, l + pw - 1, top, 1, len, S.mortar);
  for (let k = 0; k < len / 5; k++) { const y = top + ((hash(sd, k + 50) * len) | 0); fill(g, l + 2 + ((hash(sd, k + 60) * (pw - 5)) | 0), y, 1, 1, hash(sd, k) < 0.5 ? S.dark : S.light); }   /* weathering */
  /* the capital under the floor: a moulded block wider than the shaft */
  fill(g, l - 4, top - 6, pw + 8, 7, S.out); fill(g, l - 3, top - 5, pw + 6, 3, S.base[1]); fill(g, l - 3, top - 5, pw + 6, 1, S.light); fill(g, l - 2, top - 2, pw + 4, 2, S.dark); fill(g, l - 3, top + 1, pw + 6, 1, S.mortar);
  /* the plinth and a little moss at the foot */
  const by = top + len; fill(g, l - 4, by - 5, pw + 8, 6, S.out); fill(g, l - 3, by - 4, pw + 6, 4, S.base[0]); fill(g, l - 3, by - 4, pw + 6, 1, S.light); fill(g, l - 3, by - 1, pw + 6, 1, S.dark);
  fill(g, l - 2, by - 5, 3, 1, S.mossD); fill(g, l - 1, by - 6, 2, 1, S.moss); if (hash(sd, 7) < 0.6) { fill(g, l + pw - 1, by - 5, 3, 1, S.mossD); fill(g, l + pw, by - 6, 1, 1, S.moss); }
  return { c, top };
}

export function drawSpireSupport(g, p, cx, cy) {
  const k = p.kind + ',' + p.x + ',' + p.y + ',' + p.bottom + ',' + (p.w || 0);
  let s = cache.get(k); if (!s) cache.set(k, s = p.kind === 'pier' ? bakePier(p) : bakeBeam(p));
  g.drawImage(s.c, Math.round(p.x * 16 + 8 - CX - cx), Math.round(p.y * 16 + 8 - s.top - cy));
}
