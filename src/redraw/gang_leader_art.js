// src/redraw/gang_leader_art.js - THE GANG LEADER (claude/welltown3): the bandits' captain, a lean quick man in an indigo coat and a red sash, a
// headcloth with its tail flying, a sling of oil bottles across his chest, and TWO curved swords. px.js primitives. The contract is caravan_bandits.js's:
// every frame faces RIGHT (L is the flip), one canvas size, ax = the body's centre column, ay = the row under the feet, w/h = the hit box.
// Frames (GL_F): 0 stand | 1,2 walk | 3 cut told (both blades back) | 4 the first cut | 5 the second told | 6 the second cut | 7 the whirl told (crouched,
// blades out) | 8,9 the whirl | 10 the bottle raised (lit) | 11 thrown | 12 the dodge (leaning back) | 13,14 burning (beating at the flames) | 15 hurt | 16 dead
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

export const GL_F = { stand: 0, dead: 16 };
const C = { coat: '#2e3a6a', coatL: '#4a5a96', coatD: '#1c2446', sash: '#a8302a', sashL: '#d84a3a', skin: '#a8704a', skinD: '#7a4e32', cloth: '#d8c8a0', clothD: '#a89870',
  pants: '#3a2e26', boot: '#1e1612', steel: '#c9d1dc', steelL: '#f4f8ff', hilt: '#c9962a', bottle: '#5a7a4a', bottleL: '#8ab070', flame: '#ffd36b', flameO: '#ff8a3a', beard: '#2a1a12', eye: '#f0dca0' };
export function bakeGangLeader() {
  const W = 64, H = 50, cx = 30, G = 47;
  const F = Array.from({ length: 17 }, (_, f) => { const [c, g] = canvas(W, H);
    if (f === 16) { ellipse(g, cx, G - 4, 14, 4, C.coat); rect(g, cx - 4, G - 6, 9, 2, C.sash); circle(g, cx + 12, G - 6, 4, C.skin); line(g, cx - 14, G - 2, cx - 26, G - 1, C.steel, 1); line(g, cx + 16, G - 1, cx + 28, G - 3, C.steel, 1); outline(c, OUT); return c; }
    const walk = f === 1 || f === 2, crouch = f === 7 || f === 8 || f === 9, lean = f === 12 ? -4 : f === 4 || f === 6 ? 3 : f === 15 ? -2 : 0, top = crouch ? 22 : 18, hip = crouch ? 34 : 31;
    const st = walk ? (f === 1 ? 3 : -3) : crouch ? 4 : f === 12 ? -2 : 0;
    /* legs and boots */
    rect(g, cx - 4 + st, hip, 3, G - hip - 2, C.pants); rect(g, cx + 1 - st, hip, 3, G - hip - 2, C.pants); rect(g, cx - 5 + st, G - 3, 5, 3, C.boot); rect(g, cx + 1 - st, G - 3, 5, 3, C.boot);
    /* the coat, long, flaring at the hem; the sash; the bottle sling across */
    fillPoly(g, [[cx - 5 + lean, top], [cx + 5 + lean, top], [cx + 8, hip + 4], [cx - 8, hip + 4]], C.coat); line(g, cx + 4 + lean, top + 1, cx + 7, hip + 3, C.coatL); line(g, cx - 5 + lean, top + 2, cx - 7, hip + 3, C.coatD);
    rect(g, cx - 6 + lean, hip - 4, 12, 3, C.sash); rect(g, cx - 6 + lean, hip - 4, 12, 1, C.sashL); line(g, cx - 6 + lean, hip - 2, cx - 9, hip + 5, C.sash, 2);
    line(g, cx - 5 + lean, top + 1, cx + 5 + lean, hip - 5, C.clothD); for (let i = 0; i < 3; i++) { const bx = cx - 3 + lean + i * 3, by = top + 3 + i * 3; rect(g, bx, by, 2, 3, C.bottle); px(g, bx, by, C.bottleL); }
    /* the head: a headcloth with a tail that flies, a short beard */
    const hx = cx + 1 + lean, hy = top - 6; circle(g, hx, hy, 4, C.skin); ellipse(g, hx, hy + 3, 4, 2.5, C.beard); ellipse(g, hx - 0.5, hy - 2.5, 5, 2.8, C.cloth); rect(g, hx - 5, hy - 2, 10, 1, C.clothD);
    line(g, hx - 4, hy - 2, hx - 9 - (walk || f === 12 ? 3 : 0), hy + (f === 12 ? -2 : 2), C.cloth, 2); px(g, hx + 2, hy, C.eye);
    /* the swords: two curved blades; where each is in this frame */
    const sh = [cx + 4 + lean, top + 3], sh2 = [cx - 3 + lean, top + 3];
    const blade = (x0, y0, x1, y1, curve) => { line(g, x0, y0, x1, y1, C.steel, 1); line(g, x0, y0 + 1, x1, y1 + curve, C.steel, 1); px(g, x1, y1, C.steelL); rect(g, x0 - 1, y0 - 1, 2, 2, C.hilt); };
    const arm = (a, x, y) => line(g, a[0], a[1], x, y, C.skin, 2);
    if (f === 3 || f === 5) { arm(sh, cx - 4, top - 6); blade(cx - 4, top - 6, cx - 16, top - 14, 1); arm(sh2, cx - 8, top - 2); blade(cx - 8, top - 2, cx - 20, top + 2, 1); }
    else if (f === 4 || f === 6) { arm(sh, cx + 14, top + 6); blade(cx + 14, top + 6, cx + 28, top + 14, -1); arm(sh2, cx + 10, top + 2); blade(cx + 10, top + 2, cx + 24, top - 4, 1);
      for (let i = 0; i < 6; i++) px(g, cx + 12 + i * 3, top - 4 + i * 3, C.steelL); }
    else if (f === 7) { arm(sh, cx + 12, top + 6); blade(cx + 12, top + 6, cx + 26, top + 8, 1); arm(sh2, cx - 12, top + 6); blade(cx - 12, top + 6, cx - 26, top + 8, 1); }
    else if (f === 8 || f === 9) { const k = f === 8 ? 1 : -1; arm(sh, cx + 12 * k, top + 4); blade(cx + 12 * k, top + 4, cx + 28 * k, top + 2, 1); arm(sh2, cx - 12 * k, top + 8); blade(cx - 12 * k, top + 8, cx - 26 * k, top + 12, 1);
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; px(g, cx + Math.round(Math.cos(a) * 24), top + 8 + Math.round(Math.sin(a) * 6), C.steelL); } }
    else if (f === 10) { arm(sh, cx + 2, top - 10); rect(g, cx + 1, top - 15, 3, 5, C.bottle); px(g, cx + 2, top - 16, C.flameO); px(g, cx + 2, top - 17, C.flame); arm(sh2, cx - 6, top + 10); blade(cx - 6, top + 10, cx - 8, top + 22, 1); }
    else if (f === 11) { arm(sh, cx + 16, top - 2); arm(sh2, cx - 6, top + 10); blade(cx - 6, top + 10, cx - 8, top + 22, 1); }
    else if (f === 12) { arm(sh, cx + 8, top + 8); blade(cx + 8, top + 8, cx + 20, top + 2, 1); arm(sh2, cx - 10, top + 4); blade(cx - 10, top + 4, cx - 20, top - 4, 1); }
    else if (f === 13 || f === 14) { const k = f === 13 ? 1 : 0; arm(sh, cx + 2 + k * 3, top - 8 + k * 4); arm(sh2, cx - 4 - k * 2, top - 6 - k * 2); blade(cx - 12, G - 3, cx - 24, G - 2, 0); blade(cx + 14, G - 2, cx + 26, G - 3, 0);
      for (let i = 0; i < 5; i++) { rect(g, cx - 6 + i * 3, top - 2 - ((i + k) % 3) * 3, 2, 5, i % 2 ? C.flameO : C.flame); } }
    else { arm(sh, cx + 10, top + 12); blade(cx + 10, top + 12, cx + 20, top + 22, -1); arm(sh2, cx - 6, top + 12); blade(cx - 6, top + 12, cx - 14, top + 24, 1); }
    outline(c, OUT); return c; });
  return { R: F, L: F.map(c => flipX(c)), white: { R: F.map(c => whiten(c)), L: F.map(c => flipX(whiten(c))) }, ax: cx, ay: G, w: 16, h: 30 };
}
