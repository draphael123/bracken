// src/redraw/gorm_hall.js - THE KING'S HALL's new props for his fight, painted (claude/gorm2art, Sonnet art pass). Art only: nothing here is a number, a timer or a hitbox.
//   the RAFTER ARCHERS' DECK   a hunters' blind on each cage's deck: a post and the court's pennant at each end, a rail with boar hides pegged over it, a quiver barrel, and the WINDLASS the cage rope is wound on
//   the PEG PADLOCK            the iron lock and hasp on a peg while its archers hold the rope (a short chain round the stake)
//   the ROCK HEAP / a ROCK     the cobbles stacked at the hall's ends (what you throw at a bowman), one cobble in the air
//   the ARROW                  a told arrow: ash shaft, grey-goose fletching, an iron head
// Baked once; a frame is a drawImage each.
import { canvas, rect, line, circle, outline } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const OUT = '#1b1626';
export const DECK_H = 36;
/* a deck w px wide (the plank row), the rope's windlass ropeOff px in from its left end; the sprite has 8 px of margin on each side */
export function deck(w, ropeOff) {
  return once('deck' + w + ':' + ropeOff, () => { const [c, g] = canvas(w + 16, DECK_H + 2), x0 = 8;
    /* the posts at each end, with a pennant on a cross-spar */
    for (const [px, s] of [[x0 + 2, 1], [x0 + w - 6, -1]]) { rect(g, px, 6, 4, 30, '#1e1208'); rect(g, px + 1, 6, 2, 30, '#6a4424'); rect(g, px + 1, 6, 1, 30, '#a8723a'); rect(g, px - 1, 5, 6, 2, '#e0b040');
      rect(g, px + (s > 0 ? 3 : -9), 8, 9, 6, '#a83a2a'); rect(g, px + (s > 0 ? 3 : -9), 8, 9, 1, '#e0b040'); rect(g, px + (s > 0 ? 9 : -9), 10, 3, 5, '#6a1e18'); }
    /* the rail: a knee-high rope-lashed spar, three boar hides pegged over it */
    rect(g, x0 + 8, 24, w - 16, 3, '#1e1208'); rect(g, x0 + 8, 24, w - 16, 1, '#a8723a'); rect(g, x0 + 8, 26, w - 16, 1, '#3a2214');
    for (let k = 0; k < 3; k++) { const hx = x0 + 14 + k * ((w - 44) / 2); rect(g, hx, 24, 12, 11, '#3a2214'); rect(g, hx + 1, 25, 10, 9, k % 2 ? '#7a5236' : '#6a4424'); rect(g, hx + 1, 25, 10, 1, '#a8723a'); rect(g, hx + 3, 28, 2, 2, '#3a2214'); rect(g, hx + 7, 30, 2, 2, '#3a2214'); rect(g, hx + 4, 34, 3, 1, '#3a2214'); rect(g, hx + 8, 34, 3, 1, '#3a2214'); }
    /* the windlass the cage's rope is wound on: a drum between two cheeks, a crank, a pawl, the rope's turns */
    const wx = x0 + ropeOff - 10;
    rect(g, wx, 14, 20, 22, '#1e1208'); rect(g, wx + 1, 15, 3, 21, '#5a3a24'); rect(g, wx + 16, 15, 3, 21, '#3a2214'); rect(g, wx + 4, 20, 12, 12, '#3a2214'); rect(g, wx + 4, 20, 12, 1, '#8a5a32');
    for (let k = 0; k < 4; k++) { rect(g, wx + 4, 21 + k * 3, 12, 2, '#c9a060'); rect(g, wx + 4, 22 + k * 3, 12, 1, '#6a4a24'); }
    line(g, wx + 10, 26, wx + 10 + 9, 17, '#3a2214', 2); rect(g, wx + 17, 14, 4, 4, '#8a5a32'); rect(g, wx + 1, 12, 4, 4, '#4a4a54'); rect(g, wx + 1, 12, 4, 1, '#9a9aa6');
    /* a quiver barrel with arrows, a coil of spare rope */
    const qx = x0 + w - 32; rect(g, qx, 26, 9, 10, '#1e1208'); rect(g, qx + 1, 27, 7, 9, '#5a3a24'); rect(g, qx + 1, 29, 7, 1, '#4a4a54'); rect(g, qx + 1, 33, 7, 1, '#4a4a54'); for (let k = 0; k < 4; k++) { rect(g, qx + 1 + k * 2, 20 - (k % 2) * 2, 1, 8, '#c9a060'); rect(g, qx + 1 + k * 2, 18 - (k % 2) * 2, 1, 3, '#e8e0d0'); }
    circle(g, x0 + 30, 31, 4, '#6a4a24'); circle(g, x0 + 30, 31, 3, '#c9a060'); circle(g, x0 + 30, 31, 1.2, '#6a4a24');
    return outline(c, OUT); });
}
/* the padlock on a locked peg: a chain round the stake, a hasp and an iron padlock with a keyhole */
export function padlock() {
  return once('plock', () => { const [c, g] = canvas(12, 18);
    rect(g, 2, 8, 8, 9, '#2a2a32'); rect(g, 2, 8, 8, 2, '#9a9aa6'); rect(g, 3, 10, 6, 6, '#4a4a54'); rect(g, 3, 10, 2, 6, '#7a7a86'); rect(g, 5, 11, 2, 2, '#14141a'); rect(g, 5, 13, 1, 2, '#14141a');   /* the body and its keyhole */
    rect(g, 3, 2, 1, 7, '#9a9aa6'); rect(g, 8, 2, 1, 7, '#9a9aa6'); rect(g, 3, 1, 6, 2, '#c9ccd6'); rect(g, 4, 3, 4, 1, '#14141a');   /* the shackle */
    rect(g, 0, 7, 2, 2, '#7a7a86'); rect(g, 10, 7, 2, 2, '#7a7a86'); rect(g, 0, 7, 12, 1, '#4a4a54');   /* the chain links */
    return outline(c, OUT); });
}
/* a cobble heap: a dozen round stones, lit from the top left */
export function heap() {
  return once('heap', () => { const [c, g] = canvas(40, 22);
    const st = [[4, 14, 10, 7], [14, 15, 11, 6], [25, 14, 10, 7], [8, 9, 10, 6], [19, 9, 11, 6], [13, 4, 9, 6], [28, 8, 7, 6]];
    st.forEach(([x, y, w, h], i) => { rect(g, x, y + 1, w, h - 1, '#2a2430'); rect(g, x + 1, y, w - 2, h, '#2a2430'); rect(g, x + 1, y + 1, w - 2, h - 2, i % 2 ? '#7a6a50' : '#8a7a5a'); rect(g, x + 2, y + 1, w - 4, 1, '#c0aa6a'); rect(g, x + 1, y + h - 2, w - 2, 1, '#5a4a38'); if (i % 3 === 0) rect(g, x + w - 4, y + 2, 2, 1, '#6a8a40'); });
    return outline(c, OUT); });
}
export function rock() {
  return once('rock', () => { const [c, g] = canvas(8, 8); circle(g, 4, 4, 3.4, '#2a2430'); circle(g, 4, 4, 2.6, '#7a6a50'); rect(g, 2, 2, 3, 1, '#c0aa6a'); rect(g, 3, 5, 3, 1, '#5a4a38'); return c; });
}
export function arrow() {
  return once('arrow', () => { const [c, g] = canvas(16, 5); rect(g, 2, 2, 11, 1, '#8a5a32'); rect(g, 2, 2, 11, 1, '#c9a060'); rect(g, 12, 1, 3, 3, '#9a9aa6'); rect(g, 13, 2, 3, 1, '#e8eef8'); rect(g, 0, 0, 2, 2, '#e8e0d0'); rect(g, 0, 3, 2, 2, '#e8e0d0'); rect(g, 2, 1, 2, 1, '#c9463d'); rect(g, 2, 3, 2, 1, '#c9463d'); return c; });
}
