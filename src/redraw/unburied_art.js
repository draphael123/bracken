// unburied_art.js - THE UNBURIED FIELD's drawing toolkit (claude/unburiedart): the palette of a siege that never ended and the few shapes every set piece is built from -
// a timber with a lit edge, a spoked wheel, a sack, a pennant, a shroud, a flame. Pure px.js; every baker returns a canvas (or draws into one it is handed).
// THE TWO ARMIES, as you walk (Daniel 2026-10-03): the BESIEGERS (the host) are SLATE and RAVEN in the west - the camp, the lines, the engines; the ORDER is RED and GOLD
// on the chapel-fort in the east - its banner, its gatehouse, its nave. Both are deco only; nothing here is a gameplay colour (the red warn and the green cover glow stay on top).
import { canvas, px, rect, fillPoly, line, circle, ellipse, outline, mulberry } from '../px.js';

export const K = {
  out: '#120c10', ink: '#1c1a22',
  slate0: '#2e3440', slate1: '#444c5c', slate2: '#5c6678', slate3: '#7a8498', slate4: '#a0aabc', raven: '#1c1a22', silver: '#c8ceda',
  red0: '#4a1418', red1: '#7a1e24', red2: '#a8342c', red3: '#c8503c', gold1: '#a8842c', gold2: '#d8b04a', gold3: '#f0d878',
  wood0: '#1e1610', wood1: '#2e2218', wood2: '#46321f', wood3: '#684a2c', wood4: '#8a6a3e', wood5: '#b08c54', wood6: '#c8a870', wet: '#3a2e26',
  iron0: '#1a1c20', iron1: '#2a2e34', iron2: '#4a5058', iron3: '#7a828c', iron4: '#a8b0b8', rust: '#6a3a28',
  hide1: '#5a4a3e', hide2: '#74604c', hide3: '#907a62', hide4: '#a8927a',
  cloth1: '#8a867e', cloth2: '#a8a49c', cloth3: '#d0ccc0', cloth4: '#ece8dc', blood: '#5a3028',
  straw1: '#8e8250', straw2: '#aca276', straw3: '#c8bc88', burlap1: '#7a6644', burlap2: '#9a8458', burlap3: '#b89c68',
  peat1: '#30261f', peat2: '#3c2f26', peat3: '#4c3c32', peat4: '#604c3e', peat5: '#7a6150', lime1: '#bdb8a4', lime2: '#d8d4c0', lime3: '#ece8d8',
  ash0: '#18141a', ash1: '#2a2428', ember: '#8a3a1c', fire1: '#c8381c', fire2: '#ff7a2c', fire3: '#ffb84a', fire4: '#fff0a0',
  st0: '#221e20', st1: '#2e2a2c', st2: '#3e3a3c', st3: '#524e4e', st4: '#6c6866', st5: '#908a84', st6: '#b4aca0', st7: '#d0c8b8',
  vio0: '#1e1430', vio1: '#322250', vio2: '#4a3478', vio3: '#6a4ca0', vio4: '#9a7ad0', vio5: '#c8b6ff' };

export const px2 = (g, x, y, c) => px(g, Math.round(x), Math.round(y), c);
/* a thick straight stroke, lit along its upper edge */
export function beam(g, x0, y0, x1, y1, th, c1, c2) {
  const horiz = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
  for (let i = 0; i < th; i++) line(g, x0 + (horiz ? 0 : i), y0 + (horiz ? i : 0), x1 + (horiz ? 0 : i), y1 + (horiz ? i : 0), c1);
  if (c2) line(g, x0, y0, x1, y1, c2);
}
/* a post: width w, from y0 down to y1, lit on the left edge */
export function post(g, x, y0, y1, w, c1, c2) { rect(g, x, y0, w, y1 - y0, c1); rect(g, x, y0, 1, y1 - y0, c2 || c1); }
/* a spoked wheel: rim r, n spokes, the rim two pixels thick, hub */
export function wheel(g, cx, cy, r, n, rot, wood, iron, miss = 0) {
  for (let a = 0; a < 360; a += 6) { const t = a * Math.PI / 180; px2(g, cx + Math.cos(t) * r, cy + Math.sin(t) * r, wood); px2(g, cx + Math.cos(t) * (r - 1), cy + Math.sin(t) * (r - 1), wood); }
  for (let a = 0; a < 360; a += 12) { const t = a * Math.PI / 180; px2(g, cx + Math.cos(t) * (r + 0.6), cy + Math.sin(t) * (r + 0.6), iron); }
  for (let i = 0; i < n; i++) { if (i < miss) continue; const t = rot + i * Math.PI * 2 / n; line(g, cx, cy, cx + Math.cos(t) * (r - 1), cy + Math.sin(t) * (r - 1), wood); }
  rect(g, Math.round(cx) - 1, Math.round(cy) - 1, 3, 3, iron);
}
/* a sack, slumped: burlap with a tied neck and a darker fold */
export function sack(g, x, y, w, h, c1 = K.burlap2, c2 = K.burlap1) {
  ellipse(g, x + w / 2, y + h * 0.6, w / 2, h * 0.45, c1); rect(g, x + w / 2 - 2, y, 4, 3, c1); rect(g, x + w / 2 - 2, y + 2, 4, 1, K.wood1);
  rect(g, x + 2, y + h - 3, w - 4, 2, c2); px(g, x + w / 2, y + h * 0.5, c2); px(g, x + w / 2 + 2, y + h * 0.6, c2);
}
/* a pennant on a pole, drooping or flying: pole foot (x, y), height h, cloth colour c */
export function pennant(g, x, y, h, c, w = 14, fly = true, trim) {
  rect(g, x, y - h, 1, h, K.wood2); px(g, x, y - h - 1, K.gold2);
  for (let i = 0; i < w; i++) { const k = i / w, dy = fly ? Math.round(Math.sin(i * 0.6) * 1.2) : Math.round(k * 5); rect(g, x + 1 + i, y - h + dy, 1, Math.max(1, Math.round(5 * (1 - k * 0.7))), c); }
  if (trim) rect(g, x + 1, y - h, w - 2, 1, trim);
}
/* a shrouded body lying down, head to the left: pale cloth, tied at the feet and the neck, a shadow of its form */
export function shroud(g, x, y, len, tone = 0) {
  const c1 = [K.cloth3, K.cloth2, K.cloth4][tone % 3], c2 = [K.cloth1, K.cloth1, K.cloth2][tone % 3];
  ellipse(g, x + len / 2, y + 3, len / 2, 3, c1); ellipse(g, x + 3, y + 2, 3, 3, c1);   /* the shape, with a head bump */
  rect(g, x + 3, y + 5, len - 4, 1, c2); px(g, x + len * 0.55, y + 2, c2); px(g, x + len * 0.7, y + 3, c2);
  rect(g, x + 6, y, 1, 7, K.wood3); rect(g, x + len - 5, y + 1, 1, 6, K.wood3);   /* the ties */
}
/* flame tongues for a fire standing on a base of width w at (x, y), animated by t (seconds): drawn straight onto a context */
export function flame(g, x, y, w, h, t, seed = 0) {
  for (let i = 0; i < Math.max(2, Math.round(w / 4)); i++) {
    const k = (i + 0.5) / Math.max(2, Math.round(w / 4)), fx = x - w / 2 + k * w, ph = t * 9 + i * 1.7 + seed, hh = h * (0.45 + 0.55 * Math.abs(Math.sin(ph * 0.7 + i))) * (1 - Math.abs(k - 0.5) * 0.9), sway = Math.sin(ph) * 1.2;
    g.fillStyle = K.fire1; g.fillRect(Math.round(fx - 2 + sway * 0.3), Math.round(y - hh * 0.55), 4, Math.round(hh * 0.55));
    g.fillStyle = K.fire2; g.fillRect(Math.round(fx - 1.5 + sway * 0.6), Math.round(y - hh * 0.85), 3, Math.round(hh * 0.8));
    g.fillStyle = K.fire3; g.fillRect(Math.round(fx - 1 + sway), Math.round(y - hh), 2, Math.round(hh * 0.7));
    if (hh > h * 0.8) { g.fillStyle = K.fire4; g.fillRect(Math.round(fx + sway), Math.round(y - hh - 1), 1, 2); } }
}
/* the same, baked: n frames of a fire (for deco that animates through K[2]) */
export function flameFrames(w, h, n = 4, seed = 0) { const out = []; for (let f = 0; f < n; f++) { const [c, g] = canvas(w, h + 4); flame(g, w / 2, h + 3, w - 2, h, f * 0.11, seed); out.push(c); } return out; }
/* a plank face: n boards across a w x h box, lit on the top edge, nails */
export function planks(g, x, y, w, h, base, lite, dark, nails = true) {
  rect(g, x, y, w, h, base); rect(g, x, y, w, 1, lite);
  for (let i = 4; i < w; i += 5) rect(g, x + i, y + 1, 1, h - 1, dark);
  if (nails) for (let i = 2; i < w; i += 5) { px(g, x + i, y + 2, K.iron3); px(g, x + i, y + h - 3, K.iron3); }
}
export const rnd = (seed) => mulberry(seed);
export { canvas, px, rect, fillPoly, line, circle, ellipse, outline };
