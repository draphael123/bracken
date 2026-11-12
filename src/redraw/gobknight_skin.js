// gobknight_skin.js - THE QUEEN'S KNIGHT (claude/gq4l, GQ4 plan Q4 'a hedge-knight reskin, a goblin in plate'): cnSkin 'gobknight' on the HEDGE KNIGHT's kit (poleaxe round the side, one mark;
// the double-mark jump). GREYBOX: the hedge knight's sheet recoloured pixel for pixel (frame order, anchors and boxes are the base's own, so every AI pick and hit box is untouched) in
// black plate with a gold trim and a gold crest mark on the breast. The art lane redraws him (a goblin's ears and jaw under the helm).
import { canvas, flipX, whiten } from '../px.js';
const hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const MAP = { '#9a3a3a': '#26222e', '#8a6a4a': '#d8b040' };   /* the surcoat goes black, the belt / haft trim goes gold */
export function bakeGobKnight(SPR) {
  const s = SPR.hedgeknight; if (!s || !s.R) return null;
  const m = Object.entries(MAP).map(([k, v]) => [hex(k), hex(v)]);
  const R = s.R.map(c => { const [o, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0);
    const img = g.getImageData(0, 0, c.width, c.height), d = img.data;
    for (let i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; for (const [a, b] of m) if (d[i] === a[0] && d[i + 1] === a[1] && d[i + 2] === a[2]) { d[i] = b[0]; d[i + 1] = b[1]; d[i + 2] = b[2]; break; } }
    g.putImageData(img, 0, 0);
    let x0 = c.width, x1 = -1, y0 = c.height, y1 = -1; for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 >= 0) { const mx = (x0 + x1) >> 1, my = y0 + Math.round((y1 - y0) * 0.5); g.fillStyle = '#d8b040';   /* the gold crest: a small crown on the breast */
      for (const [dx, dy] of [[-1, 0], [0, 0], [1, 0], [-1, -1], [1, -1], [0, 1]]) if (g.getImageData(mx + dx, my + dy, 1, 1).data[3] > 0) g.fillRect(mx + dx, my + dy, 1, 1); }
    return o; });
  return { R, L: R.map(c => flipX(c)), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax: s.ax, ay: s.ay, w: s.w, h: s.h };
}
