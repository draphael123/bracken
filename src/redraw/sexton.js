// src/redraw/sexton.js — THE SEXTON's sprite (src/sexton.js), on the shore.js contract: frames face RIGHT, one canvas each, grounded
// frames settled so ay = H, ax the body's centre. px.js primitives only; rendered in Node by tools/sexton.mjs (docs/fallingtower/).
// The tower's dead bell-ringer: tall and stooped, a grey-violet cassock to the floor, a hood over a pale skull with two ember eyes, a
// knotted bell-rope for a belt, and his weapon - a bronze hand-bell on a short chain. Every tell pose is bigger and slower than its
// blow; the OPENING pose (caught in the bell pit) is the one the player makes.
//   0 stand | 1,2 walk | 3 SWING TELL (bell drawn back) | 4 SWING (bell out on its chain) | 5 RUSH TELL (head down, bell lowered like
//   a ram) | 6 RUSH | 7 TOLL TELL (the bell up in both hands) | 8 TOLL (brought down, ringing) | 9 THE BELL DROPS (hauling a rope)
//   | 10,11 CAUGHT IN THE PIT (arms flung up, the bell dropped) | 12 CLIMBING OUT (hands over the edge) | 13 hurt
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from '../px.js';
import { OUT } from '../art.js';

export const SX = { robe: '#4e4460', robeL: '#6c6082', robeD: '#2e2838', hem: '#3a3248', skull: '#d8d0bc', skullD: '#9c9482', eye: '#ffc85a',
  bell: '#b07a2a', bellL: '#e2b050', bellD: '#5e3c14', chain: '#8a8e9c', rope: '#a8864e', ropeD: '#6e5430', hand: '#c8c0ac', ring: '#ffe7a0' };
const pack = (R, ax, ay, w, h) => ({ R, L: R.map(flipX), white: { R: R.map(c => whiten(c)), L: R.map(c => flipX(whiten(c))) }, ax, ay, w, h });
function settle(c) { const g = c.getContext('2d'), img = g.getImageData(0, 0, c.width, c.height), d = img.data; let low = -1;
  for (let y = c.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) { low = y; break; }
  const n = c.height - 1 - low; if (low < 0 || n === 0) return c; g.clearRect(0, 0, c.width, c.height); g.putImageData(img, 0, n); return c; }

export function bakeSexton() {
  const W = 64, H = 76, cx = 26, floor = H - 1;
  /* THE BELL: a bronze cup, mouth down, a lip, a crown loop; size 1 is the hand-bell, `tilt` swings its mouth */
  const bell = (g, x, y, s = 1, tilt = 0) => { const w = Math.round(6 * s), h = Math.round(8 * s), dx = Math.round(tilt * 3);
    fillPoly(g, [[x - w * 0.55 + dx * 0.3, y - h], [x + w * 0.55 + dx * 0.3, y - h], [x + w + dx, y], [x - w + dx, y]], SX.bell);
    line(g, x - w * 0.55 + dx * 0.3 + 1, y - h + 1, x - w + dx + 1, y - 1, SX.bellL); rect(g, x - w + dx - 1, y, w * 2 + 3, 2, SX.bellD); rect(g, x - w + dx, y, w * 2 + 1, 1, SX.bellL);
    rect(g, x - 1 + Math.round(dx * 0.2), y - h - 2, 3, 2, SX.bellD); px(g, x + dx, y + 2, SX.bellD); };
  const chain = (g, x0, y0, x1, y1) => { const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 2)); for (let k = 0; k <= n; k++) px(g, x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n, k % 2 ? SX.chain : '#5a5e6a'); };
  const arm = (g, x0, y0, x1, y1) => { line(g, x0, y0, x1, y1, SX.robe, 3); line(g, x0, y0 - 1, x1, y1 - 1, SX.robeL); rect(g, x1 - 1, y1 - 1, 3, 3, SX.hand); };
  /* THE BODY: lean tips the shoulders forward (px at the top), crouch shortens him; step shifts the hem's feet */
  const body = (g, { lean = 0, crouch = 0, step = 0, hood = 0 } = {}) => {
    const top = floor - 50 + crouch, sh = top + 12, hip = floor - 20 + Math.round(crouch * 0.4), L0 = Math.round(lean);
    fillPoly(g, [[cx - 7 + L0, sh], [cx + 8 + L0, sh], [cx + 13, floor - 1], [cx - 12, floor - 1]], SX.robe);           /* the cassock, wide at the hem */
    fillPoly(g, [[cx + 3 + L0, sh + 1], [cx + 8 + L0, sh], [cx + 13, floor - 1], [cx + 7, floor - 1]], SX.robeL);
    fillPoly(g, [[cx - 7 + L0, sh], [cx - 3 + L0, sh], [cx - 7, floor - 1], [cx - 12, floor - 1]], SX.robeD);
    for (let k = 0; k < 3; k++) line(g, cx - 4 + k * 5 + L0 * 0.5, sh + 6, cx - 7 + k * 6, floor - 3, SX.robeD);           /* the folds */
    rect(g, cx - 12, floor - 3, 26, 2, SX.hem); for (let x = cx - 11; x < cx + 13; x += 3) px(g, x, floor - 1, SX.hem);     /* the ragged hem */
    rect(g, cx - 5 + step, floor - 1, 5, 1, '#1b1626'); rect(g, cx + 2 - step, floor - 1, 5, 1, '#1b1626');                 /* the feet under it */
    rect(g, cx - 7 + Math.round(lean * 0.6), hip, 15, 2, SX.rope); rect(g, cx - 7 + Math.round(lean * 0.6), hip + 1, 15, 1, SX.ropeD);   /* the bell-rope belt */
    line(g, cx - 4 + Math.round(lean * 0.6), hip + 2, cx - 6, hip + 11, SX.rope); px(g, cx - 6, hip + 12, SX.ropeD);
    /* the hood, stooped: a cowl that hangs forward over a skull, two ember eyes in it */
    const hx = cx + 2 + L0 + hood, hy = top + 6;
    fillPoly(g, [[hx - 7, hy + 6], [hx - 6, hy - 4], [hx - 1, hy - 7], [hx + 6, hy - 5], [hx + 8, hy + 2], [hx + 6, hy + 7]], SX.robe);
    fillPoly(g, [[hx - 6, hy - 4], [hx - 1, hy - 7], [hx + 2, hy - 6], [hx - 3, hy - 2]], SX.robeL);
    ellipse(g, hx + 3, hy + 1, 3, 4, SX.skullD); ellipse(g, hx + 3, hy, 3, 3, SX.skull); rect(g, hx + 1, hy - 1, 2, 2, '#1b1626'); rect(g, hx + 4, hy - 1, 2, 2, '#1b1626'); px(g, hx + 2, hy - 1, SX.eye); px(g, hx + 5, hy - 1, SX.eye);
    rect(g, hx + 2, hy + 3, 4, 1, SX.skullD); px(g, hx + 3, hy + 4, SX.skullD); px(g, hx + 5, hy + 4, SX.skullD);
    return { sh: sh + 3, sx: cx + 5 + L0, bx: cx - 4 + L0, hip }; };
  const F = [];
  const frame = (fn, ground = true) => { const [c, g] = canvas(W, H); fn(g); outline(c, OUT); F.push(ground ? settle(c) : c); };
  /* 0 stand: the bell hanging from his near hand */
  frame(g => { const b = body(g); arm(g, b.sx, b.sh, b.sx + 5, b.hip + 2); chain(g, b.sx + 5, b.hip + 4, b.sx + 6, b.hip + 7); bell(g, b.sx + 6, b.hip + 16); arm(g, b.bx, b.sh, b.bx - 3, b.hip); });
  /* 1,2 walk */
  for (const s of [2, -2]) frame(g => { const b = body(g, { step: s, lean: 1 }); arm(g, b.sx, b.sh, b.sx + 6 + s, b.hip + 1); chain(g, b.sx + 6 + s, b.hip + 3, b.sx + 8 + s, b.hip + 6); bell(g, b.sx + 8 + s, b.hip + 15, 1, s * 0.3); arm(g, b.bx, b.sh, b.bx - 3 - s, b.hip - 1); });
  /* 3 SWING TELL: the bell drawn back over the shoulder on its chain */
  frame(g => { const b = body(g, { lean: -2 }); arm(g, b.sx, b.sh, b.bx - 6, b.sh - 8); chain(g, b.bx - 6, b.sh - 8, b.bx - 14, b.sh - 12); bell(g, b.bx - 16, b.sh - 4, 1, -1); arm(g, b.bx, b.sh, b.bx + 2, b.hip); });
  /* 4 SWING: the arm out, the bell at the end of its chain, a smear behind it */
  frame(g => { const b = body(g, { lean: 3 }); arm(g, b.sx, b.sh, b.sx + 11, b.sh + 2); chain(g, b.sx + 11, b.sh + 2, b.sx + 26, b.sh + 4); bell(g, b.sx + 30, b.sh + 12, 1, 1);
    for (let k = 0; k < 4; k++) line(g, b.sx + 14 + k * 3, b.sh - 8 + k * 3, b.sx + 24 + k * 2, b.sh - 4 + k * 3, '#e0dccf'); arm(g, b.bx, b.sh, b.bx - 5, b.hip - 3); });
  /* 5 RUSH TELL: stooped double, the bell held low in front like a ram */
  frame(g => { const b = body(g, { lean: 7, crouch: 6 }); arm(g, b.sx, b.sh, b.sx + 10, b.sh + 10); arm(g, b.bx + 2, b.sh, b.sx + 8, b.sh + 12); bell(g, b.sx + 15, b.sh + 18, 1.3, 2); });
  /* 6 RUSH: further down and forward, dust at the hem */
  frame(g => { const b = body(g, { lean: 9, crouch: 8, step: 3 }); arm(g, b.sx, b.sh, b.sx + 13, b.sh + 8); arm(g, b.bx + 3, b.sh, b.sx + 11, b.sh + 10); bell(g, b.sx + 19, b.sh + 16, 1.3, 2.5);
    for (let k = 0; k < 4; k++) line(g, cx - 18 - k * 2, floor - 6 - k * 4, cx - 12 - k * 2, floor - 6 - k * 4, '#b8b0a0'); });
  /* 7 TOLL TELL: both hands up, the bell raised over the hood */
  frame(g => { const b = body(g, { lean: -1, hood: -1 }); arm(g, b.sx, b.sh, b.sx - 1, b.sh - 22); arm(g, b.bx, b.sh, b.sx - 5, b.sh - 22); bell(g, b.sx - 3, b.sh - 22, 1.4);
    for (const [dx, dy] of [[-12, -30], [10, -30], [-1, -38]]) px(g, b.sx - 3 + dx, b.sh + dy, SX.ring); });
  /* 8 TOLL: brought down to the deck in front of him, the ring going out */
  frame(g => { const b = body(g, { lean: 5, crouch: 5 }); arm(g, b.sx, b.sh, b.sx + 10, b.sh + 18); arm(g, b.bx + 2, b.sh, b.sx + 8, b.sh + 19); bell(g, b.sx + 11, floor - 1, 1.4);
    for (const r of [8, 12]) for (let a = -2.9; a < -0.2; a += 0.35) px(g, b.sx + 11 + Math.cos(a) * r * 1.6, floor - 8 + Math.sin(a) * r, SX.ring); });
  /* 9 THE BELL DROPS: one arm hauling a rope that runs up out of the frame, the bell hand down */
  frame(g => { const b = body(g, { lean: -2, hood: -1 }); line(g, b.sx + 2, 0, b.sx + 2, b.sh - 16, SX.rope); line(g, b.sx + 3, 0, b.sx + 3, b.sh - 16, SX.ropeD);
    arm(g, b.sx, b.sh, b.sx + 2, b.sh - 16); arm(g, b.bx, b.sh, b.bx - 4, b.hip); chain(g, b.bx - 4, b.hip + 2, b.bx - 5, b.hip + 8); bell(g, b.bx - 5, b.hip + 17); });
  /* 10,11 CAUGHT IN THE PIT: arms flung up and clawing, the bell fallen on its chain, the hood knocked back */
  for (const s of [0, 1]) frame(g => { const b = body(g, { lean: s ? -3 : 2, hood: s ? -2 : 1 }); arm(g, b.sx, b.sh, b.sx + 8 - s * 4, b.sh - 16 + s * 3); arm(g, b.bx, b.sh, b.bx - 8 + s * 3, b.sh - 14 - s * 3);
    chain(g, b.sx + 8 - s * 4, b.sh - 14, b.sx + 14, b.hip + 4); bell(g, b.sx + 15, b.hip + 13, 1, s ? -1 : 1);
    for (const [dx, dy] of [[-10, -24], [12, -22]]) { px(g, b.sx + dx, b.sh + dy, SX.eye); px(g, b.sx + dx + 1, b.sh + dy - 1, SX.eye); } });
  /* 12 CLIMBING OUT: both hands high and forward, over an edge */
  frame(g => { const b = body(g, { lean: 5, hood: 1 }); arm(g, b.sx, b.sh, b.sx + 10, b.sh - 12); arm(g, b.bx, b.sh, b.sx + 6, b.sh - 14); chain(g, b.sx + 10, b.sh - 10, b.sx + 6, b.hip + 6); bell(g, b.sx + 6, b.hip + 15); });
  /* 13 hurt: thrown back, the bell flying out behind */
  frame(g => { const b = body(g, { lean: -5, hood: -2 }); arm(g, b.sx, b.sh, b.bx - 10, b.sh - 6); chain(g, b.bx - 10, b.sh - 6, b.bx - 16, b.sh + 2); bell(g, b.bx - 17, b.sh + 11, 1, -2); arm(g, b.bx, b.sh, b.sx + 6, b.sh - 4);
    line(g, b.sx + 8, b.sh - 14, b.sx + 14, b.sh - 20, '#ffffff'); });
  return pack(F, cx, H, 20, 46);
}
