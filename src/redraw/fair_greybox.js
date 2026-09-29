// fair_greybox.js - PLACEHOLDER ART for THE HARVEST FAIR's two foes (claude/fair1, L1: greybox). Real art is L2 (Daniel's approval first).
// Made from px.js primitives only, in the contract desert_foes.js / caravan_bandits.js keep: every frame faces RIGHT (L is the flip), every frame
// of a sprite shares one canvas, ax = the body's centre column, ay = the row under the lowest pixel (grounded sprites settle to it), w/h = the hit box.
//   bakeMummer()     THE MUMMER  sackcloth, a painted wooden mask, a peaked cap with bells
//                    0 stand (stock still) | 1,2 creep (leaning in, the bells swinging) | 3 GLOW (arms up, the mask burning red: the tell) | 4 strike | 5 hurt
//   bakeHobbyHorse() THE HOBBY-HORSE  a player under a cloth skirt with a carved horse's head on a pole, red glass eyes
//                    0 stand | 1 WIND (the head reared, eyes lit: the tell) | 2,3 charge (head low, driving) | 4 skid | 5 hurt
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';
import { MUMMER, HORSE } from '../mummer.js';

function pack(frames, ax, ay, w, h) {
  const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c));
  return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h };
}
function settleFrame(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }
const frames = (W, H, n, fn) => Array.from({ length: n }, (_, f) => { const [c, g] = canvas(W, H); fn(g, f); outline(c, OUT); return settleFrame(c); });

const C = { sack: '#b89868', sackL: '#d4b888', sackD: '#8a6c44', rope: '#6a4a2a', mask: '#d9b878', maskD: '#a6803c', paint: '#b8382c', eye: '#141014', red: '#ff3a2a', redL: '#ffb090',
  bell: '#e8c23a', cap: '#7a3a5a', capL: '#a45c80', wood: '#7a5230', woodL: '#a67a48', cloth: '#a83c3c', clothL: '#d05c50', clothD: '#742828', mane: '#3a2a20' };

// ================= THE MUMMER =================
export function bakeMummer() {
  const W = 26, H = 30, cx = 11;
  const F = frames(W, H, 6, (g, f) => {
    const lean = f === 1 || f === 2 ? 2 : f === 4 ? 3 : f === 5 ? -2 : 0, step = f === 1 ? 1 : f === 2 ? -1 : 0, glow = f === 3, y0 = 3;
    // legs (bare, wrapped)
    rect(g, cx - 3 + step, y0 + 20, 2, 5, C.sackD); rect(g, cx + 1 - step, y0 + 20, 2, 5, C.sackD); rect(g, cx - 4 + step, y0 + 24, 3, 1, C.rope); rect(g, cx + 1 - step, y0 + 24, 3, 1, C.rope);
    // the sackcloth smock, belted with rope
    fillPoly(g, [[cx - 3 + lean, y0 + 8], [cx + 3 + lean, y0 + 8], [cx + 5, y0 + 21], [cx - 5, y0 + 21]], C.sack);
    line(g, cx - 2 + lean, y0 + 9, cx - 4, y0 + 20, C.sackL); line(g, cx + 3 + lean, y0 + 9, cx + 4, y0 + 20, C.sackD);
    rect(g, cx - 4, y0 + 14, 8, 1, C.rope);
    // arms
    if (glow) { line(g, cx - 3, y0 + 9, cx - 8, y0 + 3, C.sack); line(g, cx + 3, y0 + 9, cx + 8, y0 + 3, C.sack); px(g, cx - 8, y0 + 2, C.sackL); px(g, cx + 8, y0 + 2, C.sackL); }
    else if (f === 4) { line(g, cx + 3, y0 + 10, cx + 11, y0 + 11, C.sack); rect(g, cx + 10, y0 + 9, 3, 3, C.wood); line(g, cx - 3, y0 + 10, cx - 5, y0 + 15, C.sack); }
    else if (f === 1 || f === 2) { line(g, cx + 3, y0 + 10, cx + 8, y0 + 12, C.sack); line(g, cx - 3, y0 + 10, cx - 1, y0 + 16, C.sack); }
    else { line(g, cx - 3, y0 + 10, cx - 5, y0 + 17, C.sack); line(g, cx + 3, y0 + 10, cx + 5, y0 + 17, C.sack); }
    // the mask: a painted wooden face, tall and flat, a wide mouth
    const hx = cx + lean, hy = y0 + 3;
    rect(g, hx - 3, hy - 2, 7, 9, glow ? C.red : C.mask); rect(g, hx - 3, hy + 5, 7, 2, glow ? C.redL : C.maskD);
    px(g, hx - 2, hy, C.eye); px(g, hx + 1, hy, C.eye); if (glow) { px(g, hx - 2, hy, C.redL); px(g, hx + 1, hy, C.redL); px(g, hx - 3, hy + 2, C.redL); px(g, hx + 3, hy + 2, C.redL); }
    rect(g, hx - 2, hy + 3, 5, 1, C.eye); px(g, hx - 2, hy + 2, glow ? C.redL : C.paint); px(g, hx + 2, hy + 2, glow ? C.redL : C.paint);
    // the peaked cap and its bells
    fillPoly(g, [[hx - 4, hy - 2], [hx + 4, hy - 2], [hx + 1 + (f === 1 ? 2 : f === 2 ? -1 : 0), hy - 8]], C.cap); line(g, hx - 3, hy - 2, hx, hy - 7, C.capL);
    px(g, hx + 1 + (f === 1 ? 2 : f === 2 ? -1 : 0), hy - 9, C.bell); px(g, hx - 5, hy - 1, C.bell); px(g, hx + 5, hy - 1, C.bell); px(g, hx - 5, hy, C.bell); if (f === 1 || f === 2) px(g, hx - 6, hy + 1, C.bell);
  });
  return pack(F, cx, H - 1, MUMMER.w, MUMMER.h);
}

// ================= THE HOBBY-HORSE =================
export function bakeHobbyHorse() {
  const W = 44, H = 34, cx = 16;
  const F = frames(W, H, 6, (g, f) => {
    const rear = f === 1, drive = f === 2 || f === 3, skid = f === 4, hurt = f === 5, k = f === 3 ? 1 : 0, y0 = 6;
    // the cloth skirt: the horse's body, hiding the player under it
    const sway = drive ? k * 2 - 1 : 0;
    fillPoly(g, [[cx - 9, y0 + 8], [cx + 8, y0 + 8], [cx + 11 + sway, y0 + 22], [cx - 11 + sway, y0 + 22]], C.cloth);
    for (let i = 0; i < 4; i++) rect(g, cx - 10 + i * 5 + sway, y0 + 18, 3, 4, i % 2 ? C.clothD : C.clothL);
    rect(g, cx - 10, y0 + 8, 20, 2, C.clothD);
    // four legs of the player and the pole-mates' boots
    rect(g, cx - 8 + sway, y0 + 22, 2, 4, C.sackD); rect(g, cx - 3 + sway, y0 + 22, 2, 4, C.sackD); rect(g, cx + 3 + sway, y0 + 22, 2, 4, C.sackD); rect(g, cx + 8 + sway, y0 + 22, 2, 4, C.sackD);
    // the tail of rope
    line(g, cx - 10, y0 + 10, cx - 15, y0 + 15 + (drive ? -2 : 0), C.mane); line(g, cx - 10, y0 + 11, cx - 14, y0 + 17, C.mane);
    // the head on its pole: reared for the wind-up, low and driving for the charge
    const bx = cx + 9, by = y0 + 9, hx = bx + (rear ? 6 : drive ? 15 : hurt ? 8 : 11), hy = by + (rear ? -9 : drive ? 4 : hurt ? 6 : -2), sk = skid ? 3 : 0;
    line(g, bx, by, hx, hy, C.wood, 2);
    fillPoly(g, [[hx - 3, hy - 4], [hx + 4, hy - 4], [hx + 9 + sk, hy + 2], [hx + 7 + sk, hy + 5], [hx - 3, hy + 3]], C.woodL);
    fillPoly(g, [[hx - 3, hy - 4], [hx, hy - 8], [hx + 1, hy - 4]], C.woodL);   // the ear
    line(g, hx - 4, hy - 4, hx - 6, hy + 4, C.mane, 2);                          // the mane
    rect(g, hx + 5 + sk, hy + 2, 4, 1, C.eye); px(g, hx + 8 + sk, hy + 4, C.eye);   // the jaw and nostril
    const eyeC = rear || drive ? C.red : C.eye; px(g, hx + 2, hy - 2, eyeC); px(g, hx + 3, hy - 2, eyeC); if (rear || drive) { px(g, hx + 2, hy - 3, C.redL); px(g, hx + 4, hy - 3, C.redL); }
    px(g, hx - 1, hy - 5, C.bell); px(g, hx + 3, hy + 4, C.bell); px(g, hx - 2, hy, C.bell);   // bells on the bridle
    // the player's own masked face above the skirt, watching
    rect(g, cx - 3, y0 + 2, 6, 6, C.mask); px(g, cx - 2, y0 + 4, C.eye); px(g, cx + 1, y0 + 4, C.eye); rect(g, cx - 2, y0 + 6, 4, 1, C.paint);
    fillPoly(g, [[cx - 4, y0 + 2], [cx + 4, y0 + 2], [cx, y0 - 3]], C.cap); px(g, cx, y0 - 4, C.bell);
  });
  return pack(F, cx + 4, H - 1, HORSE.w, HORSE.h);
}
