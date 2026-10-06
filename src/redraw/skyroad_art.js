// src/redraw/skyroad_art.js - THE SKY ROAD's placeholder cast (claude/skyroad, the GREYBOX; the Sonnet art pass redraws it).
//   bakeSkySets(SPR) -> { kiterider, gobslinger }
//   kiterider   THE GOBLIN KITE-RIDER (the level's one new foe): a goblin in a harness under his war-kite (the kite and its line are drawn by
//               src/sky-road-hands.js over him while he flies). Frames follow src/sky-road-hands.js riderStep: 0 ride | 1 swoop | 2 falling / sinking |
//               3 swoop TELL (arms up, the yellow of his eye) | 4-5 walk on foot | 6 kick tell | 7 kick
//   gobslinger  THE POT-SLINGER: the moor's rock goblin's sheet recoloured to the kite-riders' rags (the reskinned shooter; his AI throws a lit pot)
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten, rgb } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (stops, l) => l < 0.5 ? lerpC(stops[0], stops[1], l * 2) : lerpC(stops[1], stops[2], (l - 0.5) * 2);
function recolor(c, pick) { const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765; if (l < 0.13) continue;
    const st = pick(r, gg, b, l); if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.15)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d; }
const reskin = (set, pick) => set && set.R ? { ...pack(set.R.map(f => recolor(f, pick)), set.ax, set.ay, set.w, set.h) } : set;

const K = { skin: '#5a8a3a', skinL: '#7aaa4a', skinD: '#3a5a22', rag: '#6a4a32', ragL: '#8a6a48', strap: '#c9a060', eye: '#ffe27a', red: '#ff3a2a', boot: '#3a2a22' };
export function bakeKiteRider() {
  const W = 24, H = 22, gy = 21;
  const F = Array.from({ length: 8 }, (_, f) => { const [c, g] = canvas(W, H); const cx = 12;
    const foot = f >= 4, by = foot ? gy - 6 : 10, lean = f === 1 ? 2 : 0;
    /* the body: a squat goblin in a rag jerkin with the kite harness's straps over it */
    ellipse(g, cx + lean, by, 4, 4.5, K.rag); ellipse(g, cx + lean - 1, by - 1, 2.5, 3, K.ragL);
    line(g, cx - 3 + lean, by - 3, cx + 3 + lean, by + 2, K.strap); line(g, cx + 3 + lean, by - 3, cx - 3 + lean, by + 2, K.strap);
    /* the head: big ears, the yellow eye (red on the swoop's tell) */
    const hx = cx + 3 + lean, hy = by - 6; circle(g, hx, hy, 3, K.skin); px(g, hx - 1, hy - 1, K.skinL); px(g, hx + 1, hy - 1, f === 3 || f === 6 ? K.red : K.eye);
    fillPoly(g, [[hx - 3, hy - 1], [hx - 7, hy - 3], [hx - 3, hy + 1]], K.skinD); fillPoly(g, [[hx + 3, hy - 1], [hx + 6, hy - 3], [hx + 3, hy + 1]], K.skinD);
    /* arms: up on the kite's bar while he rides, out on the tell, forward on the swoop; on foot at his sides */
    if (!foot) { const ay = f === 3 ? by - 12 : by - 9; line(g, cx - 2 + lean, by - 2, cx - 3, ay, K.skin); line(g, cx + 2 + lean, by - 2, cx + 4, ay, K.skin); rect(g, cx - 5, ay - 1, 11, 1, K.strap); }
    else { line(g, cx - 3, by, cx - 5, by + 3, K.skin); line(g, cx + 3, by, cx + 5 + (f === 7 ? 2 : 0), by + (f === 6 ? -1 : 3), K.skin); }
    /* legs: tucked while he flies, the kick's boot out on frame 7 */
    if (!foot) { line(g, cx - 1 + lean, by + 4, cx - 2 + lean * 2, by + 7, K.skinD); line(g, cx + 1 + lean, by + 4, cx + 2 + lean * 2, by + 7, K.skinD); rect(g, cx - 3 + lean * 2, by + 7, 2, 1, K.boot); rect(g, cx + 2 + lean * 2, by + 7, 2, 1, K.boot); }
    else { const st = f === 5 ? 1 : 0; line(g, cx - 1, by + 4, cx - 2 - st, gy, K.skinD); line(g, cx + 1, by + 4, f === 7 ? cx + 8 : cx + 2 + st, f === 7 ? by + 3 : gy, K.skinD); rect(g, f === 7 ? cx + 8 : cx + 2 + st, f === 7 ? by + 3 : gy, 2, 1, K.boot); rect(g, cx - 3 - st, gy, 2, 1, K.boot); }
    if (f === 2) { line(g, cx - 5, by - 6, cx - 7, by - 9, K.skin); line(g, cx + 5, by - 6, cx + 7, by - 9, K.skin); }   /* falling: arms flung up */
    outline(c, OUT); return c; });
  return pack(F, 12, H, 14, 14);
}
export function bakeSkySets(SPR) {
  const out = { kiterider: bakeKiteRider() };
  /* THE POT-SLINGER: the moor's rock goblin (he throws a lit pot) in a kite-rider's rag hood and harness colours */
  out.gobslinger = reskin(SPR.rockgoblin, (r, g, b, l) => (r > 150 && g < 100 && b < 110) ? ['#5a1a14', '#a8382a', '#d86a4a'] : (r > 190 && g > 150 && b > 90 && b < 170) ? ['#3a2a1a', '#6a4a32', '#9a7450'] : (r > g + 20 && r > 120 && l > 0.3) ? ['#2a4a1a', '#5a8a3a', '#9ac85a'] : null);
  return out;
}
