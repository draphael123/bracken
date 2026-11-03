// kings_court_foes.js - KINGSWOOD's COURT GUARD (claude/kingsreskin; Daniel 11-03: Kingswood is Gorm's own court, so its shield, pike and brute goblins wear his household's livery).
//   ART ONLY: each sheet is the camp goblin's own sheet recoloured and dressed (same frame count, same canvas size, same anchor and hit box), so the AI, the tells and the silhouette family are the goblin's.
//   KING'S SHIELD     (the shield's) a steel helm with a gold circlet and a crimson plume, a crimson tabard with gold trim, the great shield painted crimson with a gold boss and cross
//   COURT HALBERDIER  (the pike's) a crimson tabard, a gold-banded cap with a white plume, the pike head grown an axe-blade and a crimson pennon: a court halberd (the thrust and the guard are the pike's)
//   ROYAL BRUTE       (the brute's) a crimson surcoat with a gold belt, steel pauldrons and a half-helm with a gold crown-band, the club shod in iron
// bakeKingsShield(base) / bakeCourtHalberdier(base) / bakeRoyalBrute(base) -> { R, L, white, ax, ay, w, h }
import { canvas, flipX, whiten, rgb, outline, rect as RC } from '../px.js';

const OUT = '#1b0e10';
const CRIM = ['#4a1418', '#a8342c', '#e0584a'], GOLD = ['#8a6418', '#d8a838', '#ffd36b'], STEEL = ['#1c1e2c', '#4c5470', '#9aa2bc'], IRON = ['#16161e', '#383a48', '#6a6c7c'], FURW = '#efe4c8';
const pack = (frames, base) => ({ R: frames, L: frames.map(c => flipX(c)), white: { R: frames.map(c => whiten(c)), L: frames.map(c => flipX(whiten(c))) }, ax: base.ax, ay: base.ay, w: base.w, h: base.h });
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
/* a class of a pixel of a goblin sheet: skin (green), red, cloth (blue-purple), wood, metal (grey), dark */
const kind = (r, g, b, l) => {
  if (l < 0.13) return 'dark';
  if (g > r + 10 && g > b + 10) return 'skin';
  if (r > g + 40 && r > b + 30) return 'red';
  if (b > g + 8 && b >= r - 10) return l > 0.55 ? 'metal' : 'cloth';
  if (Math.abs(r - g) < 26 && Math.abs(g - b) < 30) return 'metal';
  if (r > g && g > b) return 'wood';
  return 'other';
};
/* map: kind -> a ramp of three, or a function (lightness) -> [r, g, b] */
function recolor(c, map) {
  const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765, k = kind(r, gg, b, l), st = map[k]; if (!st) continue;
    const o = typeof st === 'function' ? st(l, r, gg, b) : rampAt(st, Math.min(1, l * 1.2)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d;
}
/* where the head is: the top row of the sheet's skin, the middle of the skin's first rows, and the sheet's very top row (helm, cap, club) */
function headOf(c) { const p = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, at = (x, y) => (y * c.width + x) * 4; let top = -1, topAny = -1, x0 = 99, x1 = -1;
  for (let y = 0; y < c.height && topAny < 0; y++) for (let x = 0; x < c.width; x++) if (p[at(x, y) + 3]) { topAny = y; break; }
  for (let y = 0; y < c.height && top < 0; y++) for (let x = 0; x < c.width; x++) { const i = at(x, y); if (p[i + 3] && kind(p[i], p[i + 1], p[i + 2], (p[i] + p[i + 1] + p[i + 2]) / 765) === 'skin') { top = y; break; } }
  if (top >= 0) for (let y = top; y < top + 3; y++) for (let x = 0; x < c.width; x++) { const i = at(x, y); if (p[i + 3] && kind(p[i], p[i + 1], p[i + 2], (p[i] + p[i + 1] + p[i + 2]) / 765) === 'skin') { x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }
  return { top, topAny, cx: x1 < 0 ? c.width >> 1 : (x0 + x1) >> 1, w: x1 < 0 ? 6 : x1 - x0 + 1 }; }
/* draw the livery over the recoloured sheet (inside the canvas: the sheet's size, anchor and hit box never change) */
function dress(c, draw) {
  const [o, g] = canvas(c.width, c.height); draw((x, y, w, h, col) => RC(g, x, y, w, h, col)); outline(o, OUT);
  const [d, k] = canvas(c.width, c.height); k.drawImage(c, 0, 0); k.drawImage(o, 0, 0); return d; }

export function bakeKingsShield(base) {
  const frames = base.R.map(f => { const h = headOf(f);
    let c = recolor(f, { cloth: CRIM, red: (l, r, g) => g > r * 0.45 ? (l > 0.5 ? rgb(GOLD[2]) : rampAt(CRIM, Math.min(1, l * 1.9))) : rampAt(GOLD, Math.min(1, l * 1.2)), metal: l => rampAt(STEEL, Math.min(1, l * 1.5)), wood: l => l > 0.66 ? rgb(GOLD[2]) : rampAt(CRIM, Math.min(1, l * 1.9)), other: l => l > 0.62 ? rgb(GOLD[2]) : rampAt(CRIM, l * 1.9) });   /* the great shield crimson, its boss and cross gold */
    c = dress(c, r => { const cx = h.cx, y0 = h.topAny;
      r(cx - 2, y0 + 2, 6, 1, GOLD[2]);                                   /* a gold circlet round the helm */
      r(cx - 1, y0 + 1, 1, 1, GOLD[1]); r(cx + 1, y0 + 1, 1, 1, GOLD[1]); r(cx + 3, y0 + 1, 1, 1, GOLD[1]);   /* its points: the crown */
      r(cx, y0, 2, 1, CRIM[2]); r(cx - 1, y0, 1, 1, CRIM[1]);             /* a crimson plume at the crest */
    });
    return c; });
  return pack(frames, base);
}
export function bakeCourtHalberdier(base) {
  const frames = base.R.map(f => { const h = headOf(f);
    let c = recolor(f, { cloth: CRIM, red: GOLD, metal: l => rampAt(STEEL, Math.min(1, l * 1.1)) });
    /* the pike head is the sheet's right-most steel: find it and grow an axe-blade and a pennon there */
    const p = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let tipX = -1, tipY = -1;
    for (let x = c.width - 1; x >= 0 && tipX < 0; x--) for (let y = 0; y < c.height; y++) { const i = (y * c.width + x) * 4; if (p[i + 3] && kind(p[i], p[i + 1], p[i + 2], (p[i] + p[i + 1] + p[i + 2]) / 765) === 'metal') { tipX = x; tipY = y; break; } }
    c = dress(c, r => { const cx = h.cx, y0 = h.top;
      if (y0 >= 0) { r(cx - 2, y0 - 1, 5, 2, CRIM[1]); r(cx - 2, y0 - 1, 5, 1, CRIM[2]); r(cx - 2, y0 + 1, 5, 1, GOLD[2]); r(cx + 1, y0 - 2, 1, 1, FURW); }   /* a crimson cap with a gold band and a white plume */
      if (tipX >= 3) { const bx = tipX - 4, by = tipY;
        r(bx, by - 2, 3, 2, STEEL[2]); r(bx, by + 1, 3, 2, STEEL[2]); r(bx + 1, by - 2, 1, 1, '#ffffff'); r(bx, by + 2, 1, 1, STEEL[1]);   /* the axe-blade and the spike: a halberd head */
        r(bx - 1, by - 1, 1, 3, GOLD[1]);                                                                                                  /* a gold collar under it */
        r(bx - 3, by + 1, 2, 2, CRIM[2]); r(bx - 3, by + 3, 1, 1, CRIM[1]); }                                                              /* a crimson pennon hanging off the collar */
    });
    return c; });
  return pack(frames, base);
}
export function bakeRoyalBrute(base) {
  const frames = base.R.map(f => { const h = headOf(f);
    let c = recolor(f, { cloth: CRIM, red: GOLD, wood: l => rampAt(IRON, Math.min(1, l * 1.4)), metal: l => rampAt(STEEL, Math.min(1, l * 1.1)) });   /* a crimson surcoat, a gold belt, the club iron-shod */
    c = dress(c, r => { const cx = h.cx, y0 = h.top;
      if (y0 >= 0) { r(cx - 4, y0 - 1, 9, 3, STEEL[1]); r(cx - 4, y0 - 1, 9, 1, STEEL[2]); r(cx - 4, y0 + 1, 9, 1, GOLD[2]); r(cx - 3, y0 - 2, 1, 1, GOLD[2]); r(cx, y0 - 2, 1, 1, GOLD[2]); r(cx + 3, y0 - 2, 1, 1, GOLD[2]); r(cx - 4, y0 + 2, 1, 2, STEEL[0]); r(cx + 4, y0 + 2, 1, 2, STEEL[0]); }   /* a steel half-helm with a gold crown-band */
      if (y0 >= 0) { const sy = y0 + 5; r(cx - 8, sy, 4, 3, STEEL[1]); r(cx - 8, sy, 4, 1, STEEL[2]); r(cx - 8, sy + 2, 4, 1, STEEL[0]); r(cx + 5, sy, 4, 3, STEEL[1]); r(cx + 5, sy, 4, 1, STEEL[2]); r(cx + 5, sy + 2, 4, 1, STEEL[0]); r(cx - 7, sy + 1, 1, 1, GOLD[2]); r(cx + 7, sy + 1, 1, 1, GOLD[2]); }   /* pauldrons, a gold stud on each */
    });
    return c; });
  return pack(frames, base);
}
