// src/redraw/hornets_nest_honey.js - THE NEST'S HONEY, drawn (claude/hornets2art; SONNET over the greybox rects). ART ONLY: every box, timing and number is the hands' / the fat hornet's;
// this draws what they say.
//   glob(g, x, y, vy, time)                  a FAT HONEY HORNET's HONEY GLOB in the air: a glossy teardrop that stretches as it falls, a thread of honey up to where it let go
//   patch(g, x, y, w, t, t0, time)           the STICKY PATCH where a glob splashed (x = left, y = the footing's top): a domed puddle with a bright skin, bubbles, threads that
//                                            string up off it ("it holds your feet"), a splash crown in its first moments, and it thins and dulls as it runs out (t of t0 s left)
//   (the hall's flood, the tear, the torn stalks, the royal comb and the pin are further down: see the HALL section)
import { canvas } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h ^ (h >>> 16); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
export const HONEY_PAL = ['#6a3a06', '#a8600a', '#d8901a', '#f0b434', '#ffd36b', '#fff4b0'];

/* ---------------- a glob (11 x 14): a teardrop, dark rim, gold body, a white glint; stretched by speed ---------------- */
function globSprite(stretch) { return once('glob' + stretch, () => { const [c, g] = canvas(11, 16 + stretch);
  const W = [1, 1, 3, 3, 5, 5, 7, 7, 7, 5], H = W.length + stretch;   /* the tip's width down the drop; the stretch is extra tip */
  for (let i = 0; i < H; i++) { const j = Math.max(0, i - stretch), w = W[Math.min(W.length - 1, j)], x0 = 5 - (w >> 1);
    for (let x = 0; x < w; x++) { const edge = x === 0 || x === w - 1 || i === H - 1 || (w === 1), body = j >= 4;
      R(g, edge ? HONEY_PAL[0] : (body && x < 3) ? HONEY_PAL[4] : (body && x > w - 3) ? HONEY_PAL[2] : HONEY_PAL[3], x0 + x, i, 1, 1); } }
  R(g, HONEY_PAL[5], 3, stretch + 5, 1, 2); R(g, HONEY_PAL[5], 4, stretch + 4, 1, 1);
  return c; }); }
export function glob(g, x, y, vy, time) { x = Math.round(x); y = Math.round(y); const st = Math.max(0, Math.min(5, Math.floor(vy / 70)));
  g.drawImage(globSprite(st), x - 5, y - 8 - st);
  /* a thin thread of honey up from it toward where it came from, breaking into specks */
  for (let k = 0; k < 3; k++) { const a = 1 - k / 3; g.globalAlpha = 0.55 * a; R(g, HONEY_PAL[3], x, y - 14 - st - k * 5, 1, 3); } g.globalAlpha = 1;
  void time; }

/* ---------------- a sticky patch ---------------- */
/* x = left edge, y = the footing's top (the surface), w = width, t = s left, t0 = s it lasts */
export function patch(g, x, y, w, t, t0, time) {
  const age = t0 - t, fade = Math.min(1, t / 1.6), fresh = Math.max(0, 1 - age / 0.35), cxm = x + w / 2, half = w / 2;
  g.globalAlpha = 0.35 + 0.65 * fade;
  /* the dome: a puddle thicker at its middle, thin at its lips (it shrinks a little as it dries) */
  const hh = 1 + 2.4 * (0.55 + 0.45 * fade);
  for (let k = 0; k < w; k++) { const u = (k + 0.5 - half) / half, edge = 1 - u * u, h = Math.max(1, Math.round(hh * Math.sqrt(Math.max(0, edge)) + (k % 5 === 0 ? 0.5 : 0)));
    R(g, HONEY_PAL[1], x + k, y - h, 1, h + 1); if (h > 1) R(g, HONEY_PAL[2], x + k, y - h, 1, Math.min(2, h)); if (h > 2) R(g, HONEY_PAL[3], x + k, y - h, 1, 1); }
  R(g, HONEY_PAL[0], x + 1, y, w - 2, 1);                                    /* where it meets the footing */
  R(g, HONEY_PAL[5], cxm - 5, y - Math.round(hh) - 0, 3, 1); R(g, HONEY_PAL[5], cxm + 3, y - Math.round(hh) + 1, 2, 1);   /* the glints on its skin */
  /* a bubble or two, rising and popping */
  for (let b = 0; b < 2; b++) { const ph = (time * 0.5 + b * 0.5 + (hash(Math.round(x), b) % 10) / 10) % 1; if (ph < 0.7) { const bx = x + 5 + ((hash(Math.round(x), b + 3) % Math.max(1, w - 10)));
    R(g, HONEY_PAL[4], bx, y - hh - 1 - ph * 3, 2, 1); R(g, HONEY_PAL[5], bx, y - hh - 2 - ph * 3, 1, 1); } else { R(g, HONEY_PAL[5], x + 6 + b * 9, y - hh - 4, 1, 1); } }
  /* the threads: strands of honey stretched up off it, swaying, as if it were holding on to something (it IS: your feet) */
  for (let s = 0; s < 3; s++) { const sx = x + w * (0.22 + s * 0.28), len = 3 + (hash(Math.round(x), s + 9) % 4) + Math.round(Math.sin(time * 1.4 + s * 2) * 1.2);
    g.globalAlpha = (0.3 + 0.5 * fade) * 0.8; R(g, HONEY_PAL[4], sx, y - hh - len, 1, len); R(g, HONEY_PAL[5], sx, y - hh - len, 1, 1); }
  /* THE SPLASH CROWN in its first third of a second: droplets thrown up and out of it */
  if (fresh > 0) { g.globalAlpha = Math.min(1, fresh * 1.4);
    for (let d = 0; d < 7; d++) { const dir = d < 4 ? -1 : 1, sp = 6 + (d % 4) * 7, ph = 1 - fresh, dx = dir * (3 + sp * ph * 0.9 + (d % 3) * 2), dy = -(sp * ph * 1.6 - 30 * ph * ph);
      R(g, d % 2 ? HONEY_PAL[4] : HONEY_PAL[3], cxm + dx, y - 2 + dy, d % 3 === 0 ? 2 : 1, d % 3 === 0 ? 2 : 1); } }
  g.globalAlpha = 1;
}
