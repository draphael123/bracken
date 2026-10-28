// rookery_arena_art.js - THE SISTERS' CRAG, THE BOSS ROOM (claude/rookery2art; brief B5: "boss arena visual pass: anchored perches, nests, spires, the monastery roof landmark, wind streaks;
// no floating stone"). The greybox arena was a flat summit with two shelves and a bare perch. Now:
//   THE PERCH     the shrieker's high perch wears a real bone nest (eggs, bones, guano) on its shelf, LASHED to the spire under it: sinew wraps at the shelf's lip, bone toggles, a rope tail; the
//                 shelf's corbel is the hoodoo's own (rookery_world.js drawPier)
//   THE SHELVES   the two end shelves each hold an egg nest at their far end (the snatcher's rock shelf), a drift of guano and a lashing at each pier-head
//   THE LANDMARK  THE MONASTERY OF THE ROC'S PENITENTS: a far crag far to the west with a tiered, up-turned terracotta roof, a bell tower and a lit window, wrapped in haze, parallax-slow -
//                 so the summit has somewhere to look that is not the Roc's own peak
//   WIND          streaks racing east across the whole screen in front of everything, and a few loose feathers riding them - the summit is in the wind
// drawArena(g, cx, cy, VW, VH, time, A, G)   (behind the action)      drawWind(g, VW, VH, time)   (in front)
import { canvas, rect as R, line as L } from '../px.js';
import { PAL, GUANO, BONE, TWIG, mix } from './rookery_pal.js';
import * as RKW from './rookery_world.js';
const px = (g, x, y, c) => R(g, x, y, 1, 1, c);
const SINEW = ['#5a4a32', '#8a7650', '#b8a47a', '#d8c8a0'];
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const Z = 4;   /* the crag's own stone (wind-polished rose) */

/* the sinew lashing round a pier-head / nest neck: three diagonal wraps, a bone toggle each side, a rope tail */
function lash(g, x, y, hw) {
  for (let b = 0; b < 3; b++) { const yy = y + b * 3; for (let xx = -hw; xx < hw; xx++) px(g, x + xx, yy + ((xx + b) & 1), SINEW[(xx + b) & 1 ? 1 : 2]); R(g, x - hw, yy, hw * 2, 1, SINEW[0]); for (let xx = -hw; xx < hw; xx += 3) px(g, x + xx, yy, SINEW[3]); }
  for (const s of [-1, 1]) { R(g, x + s * (hw - 1) - (s > 0 ? 0 : 3), y + 1, 4, 2, BONE[2]); px(g, x + s * (hw - 1) - (s > 0 ? 0 : 3), y + 1, BONE[3]); }
  for (let i = 0; i < 8; i++) px(g, x + 2 + (i > 5 ? 1 : 0), y + 9 + i, i % 2 ? SINEW[1] : SINEW[2]); R(g, x + 1, y + 17, 3, 2, SINEW[0]);
}
/* THE MONASTERY (a far haze-wrapped crag with a roof): 96 x 120, baked once */
function bakeMonastery() {
  return once('mon', () => {
    const [c, g] = canvas(96, 120), S = PAL[Z].s, haze = PAL[Z].haze;
    const tone = col => mix(col, haze, 0.42);
    /* the crag it stands on: a tapering stone stack with strata */
    for (let y = 44; y < 120; y++) { const t = (y - 44) / 76, hw = Math.round(17 + t * 15 + Math.sin(y * 0.4) * 1.5); for (let x = 48 - hw; x < 48 + hw; x++) { const u = (x - (48 - hw)) / (hw * 2); px(g, x, y, tone(S[u < 0.3 ? 4 : u < 0.7 ? 3 : 2])); } if (y % 9 === 0) R(g, 48 - hw + 2, y, hw * 2 - 4, 1, tone(S[1])); }
    /* the hall: cream walls, three slit windows, one lit warm */
    R(g, 26, 30, 44, 15, tone('#d8d0c4')); R(g, 26, 30, 44, 1, tone('#f0ece4')); R(g, 26, 44, 44, 1, tone('#8a8478'));
    for (const [wx, lit] of [[32, 0], [46, 1], [60, 0]]) { R(g, wx, 34, 4, 8, tone(lit ? '#ffd36b' : '#3a3448')); if (lit) R(g, wx + 1, 35, 2, 4, '#fff1c0'); }
    R(g, 24, 44, 48, 2, tone('#6a5a50'));
    /* the roof: two tiers of terracotta, up-turned at the eaves, a ridge and a finial */
    const roof = (cy, w, h, dark, mid, lit) => { for (let y = 0; y < h; y++) { const hw = Math.round(w / 2 - (y / h) * (w / 2 - 8) + (y === h - 1 ? 3 : 0)); for (let x = 48 - hw; x < 48 + hw; x++) { const k = ((x + y * 3) % 5 === 0) ? dark : y < 2 ? lit : mid; px(g, x, cy + y, tone(k)); } }
      R(g, 48 - Math.round(w / 2) - 3, cy + h - 3, 4, 2, tone(lit)); R(g, 48 + Math.round(w / 2) - 1, cy + h - 3, 4, 2, tone(lit)); px(g, 48 - Math.round(w / 2) - 3, cy + h - 4, tone(lit)); px(g, 48 + Math.round(w / 2) + 2, cy + h - 4, tone(lit)); };
    roof(26, 66, 6, '#6a3238', '#a65a4a', '#d08a72'); roof(14, 44, 12, '#6a3238', '#a65a4a', '#d08a72');
    R(g, 46, 6, 4, 8, tone('#6a3238')); R(g, 47, 2, 2, 5, tone('#d8b860')); px(g, 47, 1, tone('#fff1c0'));   /* the ridge-cap and the gilt finial */
    /* the bell tower: a narrow shaft with its own small roof and a bell */
    R(g, 74, 22, 8, 24, tone('#cfc6b8')); R(g, 74, 22, 1, 24, tone('#f0ece4')); R(g, 76, 28, 4, 6, tone('#2a2438')); R(g, 77, 30, 2, 3, tone('#c8a050'));
    for (let y = 0; y < 6; y++) { const hw = 6 - y; R(g, 78 - hw, 16 + y, hw * 2, 1, tone(y < 1 ? '#d08a72' : '#a65a4a')); } px(g, 78, 14, tone('#d8b860'));
    /* prayer flags on a line from the tower to the roof, a bit of smoke */
    for (let k = 0; k < 7; k++) { const x = 52 + k * 3, y = 26 + Math.round(Math.sin(k / 6 * Math.PI) * 3); R(g, x, y, 2, 2, tone(['#c4463a', '#e8d8a0', '#5a8aa0'][k % 3])); }
    return c; });
}
let CLOUD = null;
export function drawArena(g, cx, cy, VW, VH, time, A, G) {
  if (!A || !G) return;
  const fy = Math.round(G.floorY - cy), z = Z;
  /* THE LANDMARK: far, slow, hazy; behind the Roc's peak's side, high in the west of the sky */
  { const sx = Math.round(VW * 0.28 + (A.x0 + 90 - cx) * 0.1), sy = Math.round(fy - 160); if (sx > -100 && sx < VW + 20) { g.globalAlpha = 0.86; g.drawImage(bakeMonastery(), sx - 48, sy); g.globalAlpha = 1;
    /* its smoke, climbing */ for (let k = 0; k < 5; k++) { const t = (time * 0.35 + k * 0.2) % 1; g.globalAlpha = 0.4 * (1 - t); g.fillStyle = '#f0ece8'; g.fillRect(Math.round(sx + 30 + Math.sin(t * 6 + k) * 3), Math.round(sy + 20 - t * 24), 3, 2); } g.globalAlpha = 1; } }
  /* THE SHELVES: an egg nest at the far end of each, a lashing at each pier-head */
  const T = 16, sh = fy - 3 * T;
  for (const [x0, x1, side] of [[A.x0 + 3 * T, A.x0 + 8 * T, -1], [A.x1 - 8 * T, A.x1 - 3 * T, 1]]) {
    const sx0 = Math.round(x0 - cx), sx1 = Math.round(x1 - cx); if (sx1 < -40 || sx0 > VW + 40) continue;
    RKW.drawEggs(g, side < 0 ? sx0 + 14 : sx1 - 14, sh, 1, side < 0 ? 1 : 2);
    for (const x of [sx0 + 12, sx1 - 12]) lash(g, x, sh + 3, 6);
  }
  /* THE PERCH: a great bone nest on the shelf, lashed to the spire under it */
  if (G.perchS) { const P0 = G.perchS, nx = Math.round(P0.x - cx), ny = Math.round(P0.y - cy); if (nx > -60 && nx < VW + 60) {
    lash(g, nx - Math.round(P0.w / 2) + 6, ny + 3, 6); lash(g, nx + Math.round(P0.w / 2) - 6, ny + 3, 6);
    RKW.drawNest(g, nx, ny, Math.max(40, P0.w - 2), z);
    R(g, nx - 9, ny - 13, 5, 3, BONE[2]); R(g, nx - 9, ny - 13, 5, 1, BONE[3]); px(g, nx - 8, ny - 12, '#14100c'); px(g, nx - 6, ny - 12, '#14100c');   /* a skull on the rim: she is not a visitor here */
    for (let k = 0; k < 4; k++) { const dx = nx - 18 + k * 12; for (let q = 0; q < 4 + (k % 3) * 2; q++) px(g, dx, ny + 6 + q, q % 2 ? GUANO[1] : GUANO[2]); }   /* guano dripping off the shelf */ } }
}
/* THE WIND, in front of everything: long pale streaks racing east, and loose feathers riding them */
export function drawWind(g, VW, VH, time) {
  g.fillStyle = '#f4f0f8';
  for (let k = 0; k < 16; k++) { const sp = 150 + (k % 5) * 45, len = 14 + (k % 4) * 11, x = ((time * sp + k * 97) % (VW + 90)) - 60, y = (k * 41 + Math.round(Math.sin(time * 0.8 + k) * 3)) % (VH - 60) + 14; g.globalAlpha = 0.12 + (k % 3) * 0.07; g.fillRect(Math.round(x), Math.round(y), len, 1); if (k % 2) g.fillRect(Math.round(x + 5), Math.round(y + 1), Math.round(len * 0.55), 1); }
  g.globalAlpha = 0.85; for (let k = 0; k < 5; k++) { const sp = 90 + k * 22, x = ((time * sp + k * 131) % (VW + 60)) - 30, y = 40 + (k * 57) % (VH - 120) + Math.round(Math.sin(time * 2.4 + k * 1.7) * 7); g.fillStyle = '#e6e4ec'; g.fillRect(Math.round(x), Math.round(y), 3, 1); g.fillStyle = '#c0bece'; g.fillRect(Math.round(x) + 1, Math.round(y) + 1, 2, 1); }
  g.globalAlpha = 1;
}
export const SPRITES = () => ({ monastery: bakeMonastery() });
