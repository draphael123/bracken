// src/redraw/rootway_art.js - THE ROOTWAY's placeholder cast (claude/rootway, the GREYBOX; the Sonnet art pass redraws it).
//   bakeTrophyHunter() -> THE GOBLIN TROPHY-HUNTER (the level's one new foe): a lean goblin in a hide cape with a bone-tipped spear and a trophy tag on a
//                          cord. Frames follow src/rootway-hands.js hunterStep: 0 hanging on the hoist | 1 (spare) | 2 falling | 3 the TELL (spear drawn back,
//                          the yellow of his eye red) | 4-5 walk | 6 the jab / lunge (spear out) | 7 dazed
//   bakeHuntmasterCard() -> THE GOBLIN HUNTMASTER's bestiary card (he draws himself live in the fight: src/huntmaster.js drawBoss)
//   bakeTagIcon() -> a TROPHY TAG (the level's quest pickup): a bone tag on a knotted cord
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const K = { skin: '#5a7a32', skinL: '#7a9a4a', skinD: '#3a5222', hide: '#8a6a48', hideD: '#5a4230', bone: '#e8dcc0', spear: '#7a5a3a', eye: '#ffe27a', red: '#ff3a2a', boot: '#3a2a22' };
export function bakeTrophyHunter() {
  const W = 26, H = 24, gy = 23;
  const F = Array.from({ length: 8 }, (_, f) => { const [c, g] = canvas(W, H); const cx = 12;
    const hang = f === 0 || f === 1, fall = f === 2, daze = f === 7, by = hang ? 12 : gy - 7, lean = f === 6 ? 2 : f === 3 ? -1 : 0;
    /* the body: a hide cape over a lean goblin */
    fillPoly(g, [[cx - 4 + lean, by - 4], [cx + 4 + lean, by - 4], [cx + 5 + lean, by + 4], [cx - 5 + lean, by + 4]], K.hide); rect(g, cx - 4 + lean, by - 4, 8, 1, K.hideD);
    /* the trophy tag on its cord */
    line(g, cx + lean, by - 3, cx + 1 + lean, by + 1, K.hideD); rect(g, cx + lean, by + 1, 2, 2, K.bone);
    /* the head: long ears, the eye (red on his tell) */
    const hx = cx + 2 + lean, hy = by - 7; circle(g, hx, hy, 3, K.skin); px(g, hx - 1, hy - 1, K.skinL); px(g, hx + 1, hy - 1, f === 3 ? K.red : daze ? K.bone : K.eye);
    fillPoly(g, [[hx - 3, hy - 1], [hx - 7, hy - 3], [hx - 3, hy + 1]], K.skinD); fillPoly(g, [[hx + 3, hy - 1], [hx + 6, hy - 3], [hx + 3, hy + 1]], K.skinD);
    /* arms and the spear: up the rope while he hangs, drawn back on the tell, out on the jab */
    if (hang) { line(g, cx - 1, by - 3, cx, 0, K.skin); line(g, cx + 2, by - 3, cx + 1, 0, K.skin); line(g, cx - 6, by + 2, cx + 8, by - 6, K.spear); }
    else if (f === 3) { line(g, cx + 2, by - 1, cx - 3, by, K.skin); line(g, cx - 9, by + 1, cx + 5, by - 1, K.spear); px(g, cx + 6, by - 1, K.bone); }
    else if (f === 6) { line(g, cx + 3, by - 1, cx + 8, by - 1, K.skin); line(g, cx - 2, by - 1, cx + 13, by - 1, K.spear); px(g, cx + 13, by - 1, K.bone); px(g, cx + 12, by - 2, K.bone); }
    else if (fall || daze) { line(g, cx - 4, by - 3, cx - 7, by - 7, K.skin); line(g, cx + 4, by - 3, cx + 7, by - 7, K.skin); line(g, cx - 8, by + 4, cx + 6, by - 8, K.spear); }
    else { line(g, cx + 3, by - 1, cx + 5, by + 2, K.skin); line(g, cx + 5, by - 9, cx + 5, by + 5, K.spear); px(g, cx + 5, by - 10, K.bone); }
    /* legs */
    if (hang || fall) { line(g, cx - 1, by + 4, cx - 2, by + 8, K.skinD); line(g, cx + 1, by + 4, cx + 2, by + 8, K.skinD); }
    else { const st = f === 5 ? 1 : 0; line(g, cx - 1, by + 4, cx - 2 - st, gy, K.skinD); line(g, cx + 1, by + 4, cx + 2 + st, gy, K.skinD); rect(g, cx - 3 - st, gy, 2, 1, K.boot); rect(g, cx + 2 + st, gy, 2, 1, K.boot); }
    if (daze) { px(g, hx - 2, hy - 6, K.eye); px(g, hx + 2, hy - 7, K.eye); }
    outline(c, OUT); return c; });
  return pack(F, 12, H, 10, 16);
}
export function bakeHuntmasterCard() {
  const W = 34, H = 34, [c, g] = canvas(W, H), x = 16, y = 33, by = y - 24;
  rect(g, x - 4, y - 8, 3, 8, '#2e4a1a'); rect(g, x + 1, y - 8, 3, 8, '#2e4a1a');
  rect(g, x - 6, by + 4, 12, 13, '#5a3a22'); rect(g, x - 6, by + 4, 12, 2, '#7a5232');
  rect(g, x - 11, by, 5, 14, '#6a3a1a'); px(g, x - 11, by - 3, '#ffd36b'); px(g, x - 9, by - 3, '#ffd36b'); px(g, x - 7, by - 3, '#ffd36b');
  rect(g, x - 5, by - 8, 10, 10, '#4a6a2a'); rect(g, x - 9, by - 6, 4, 2, '#4a6a2a'); rect(g, x + 5, by - 6, 4, 2, '#4a6a2a');
  rect(g, x - 3, by - 7, 8, 7, '#e8dcc0'); rect(g, x - 1, by - 5, 2, 2, '#2a1a12'); rect(g, x + 2, by - 5, 2, 2, '#2a1a12'); px(g, x - 1, by - 5, '#ff9a3c'); px(g, x + 2, by - 5, '#ff9a3c');
  rect(g, x + 3, by + 6, 3, 6, '#4a6a2a'); rect(g, x + 3, by + 9, 3, 3, '#8a6a48');
  for (let k = -9; k <= 9; k++) { const yy = by + 8 + k, xx = x + 9 + Math.round(4 - (k * k) / 20); px(g, xx, yy, '#6a4a22'); }
  line(g, x + 12, by - 1, x + 12, by + 17, '#e8dcc0');
  outline(c, OUT); return { R: [c], L: [flipX(c)], white: { R: [whiten(c)], L: [flipX(whiten(c))] }, ax: 16, ay: 34, w: 14, h: 26 };
}
export function bakeTagIcon() { const [c, g] = canvas(8, 10); line(g, 4, 0, 4, 3, '#8a6a48'); rect(g, 1, 3, 6, 6, '#e8dcc0'); rect(g, 2, 4, 4, 1, '#c9b27c'); px(g, 3, 6, '#5a4230'); px(g, 4, 7, '#5a4230'); outline(c, OUT); return c; }
