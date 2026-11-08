// src/redraw/hc3_art.js - HIGHCROWN 3's WORLD ART (claude/hc3art, over the greybox claude/highcrown3). DRAWING ONLY: no tile, entity, number or timer changes (the level hash is the greybox's).
// px.js primitives only (rect/px), so tools/hc3art-sheet.mjs renders it in Node with no browser. Castle stone and iron, goblin banners; timber only where a castle uses it (a door, a hatch,
// a winch drum). Same stone as the rest of Highcrown (STONE in highcrown2_art.js) and the Queen's purple + gold.
//   the BATTLEMENTS  drawFar (the outer wards, the hills, the haze - parallax, behind the facades), drawParapet (merlons, crenels, snow, loops: behind the walkers), drawTowers (machicolation
//                    course, arch rings, loops, banners), the broken stretch's ragged ends
//                    drawTowerTops (the archers' roofs: snow caps, loops, pennants, the signal brazier)
//   the BELL TOWER   drawBellTowerTop (belfry arches, louvres, finial), drawHatch (her roof hatch, shut / open to the sky)
//   the PROPS        drawGuardDoor (shut oak / raised / iron gate down), drawWinchBox, drawBellAt (cast bronze, swung), drawRope, drawMurderHole (the slot, the chain, the stone), drawStone
//   the ROOMS        paintRoom: THE CAPTAINS HALL (guard hall) and THE BANQUET HALL (feast hall), keyed off the 'royal' interiors at those columns
//   the YARD         drawYard: the bakehouse yard's stone ovens, flour sacks, iron racks
import { canvas, rect, px, mulberry } from '../px.js';
import { STONE } from './highcrown2_art.js';

const R = rect, S = STONE;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const TS = 16;
const SNOW = '#dfe5f2', SNOW_D = '#aab4cc';
export const K = {
  S: 21,                                            // the wall walk's standing row (its floor tiles are row 22)
  PARAPET: [[527, 556], [567, 575], [585, 601], [612, 622]],        // the open stretches (the towers and the broken stretch are between)
  GAP: [576, 584],
  TOWERS: [{ x0: 557, x1: 566, bell: 564, door: 561, winch: 558 }, { x0: 602, x1: 611, bell: 609, door: 606, winch: 603 }],
  BT: [623, 648], BT_ROOF: 6, HATCH: 639,
  FAR: [520, 652],                                  // where the far wards are drawn (tile columns)
  CAPT: 431, BANQ: 479,                             // the 'royal' interiors' west columns: the Captains Hall, the Banquet Hall
  YARD: [{ k: 'oven', col: 264, row: 64 }, { k: 'sacks', col: 322, row: 62 }, { k: 'rack', col: 326, row: 62 }, { k: 'oven', col: 309, row: 56 }, { k: 'trough', col: 285, row: 56 }, { k: 'sacks', col: 258, row: 64 }, { k: 'rack', col: 291, row: 56 }],
};

// ---------------- SMALL PIECES ----------------
const bandIron = (g, x, y, w, h = 2) => { R(g, x, y, w, h, '#2a2a34'); R(g, x, y, w, 1, '#6a6a80'); };
function stud(g, x, y) { R(g, x, y, 2, 2, '#8a8aa0'); px(g, x, y, '#c9c9d6'); }
export function drawBellAt(g, bx, topY, sw = 0, glow = 0, time = 0) {                                          // a cast-bronze bell hung from an iron beam on stone corbels; sw = its swing in px, glow 0..1 = the lure's warm ring
  R(g, bx - 10, topY, 21, 3, S.dk); R(g, bx - 10, topY, 21, 1, S.f); R(g, bx - 12, topY + 1, 3, 8, S.c); R(g, bx + 10, topY + 1, 3, 8, S.c); R(g, bx - 12, topY + 1, 1, 8, S.e);
  R(g, bx, topY + 3, 1, 10, '#5a5a6c'); const b = bx + sw, y = topY + 12;
  R(g, b - 5, y, 11, 3, '#5a3a14'); R(g, b - 4, y + 3, 9, 7, '#8a6a2a'); R(g, b - 3, y + 3, 3, 8, '#c9a040'); R(g, b - 6, y + 10, 13, 3, '#a07828'); R(g, b - 7, y + 12, 15, 2, '#c9a040'); R(g, b - 7, y + 13, 15, 1, '#5a3a14');
  R(g, b - 1 + (sw > 0 ? 1 : 0), y + 14, 3, 3, '#3a3a44');                                                    // the clapper
  if (glow > 0) { g.globalAlpha = 0.25 + 0.3 * glow * (0.5 + 0.5 * Math.sin(time * 6)); R(g, b - 9, y - 1, 19, 17, '#ffd36b'); g.globalAlpha = 1; } }
export function drawRope(g, x, topY, floorY, sway = 0, time = 0) {                                            // a hemp bell-rope from a pulley in the vault to a knotted grip at head height
  R(g, x - 3, topY, 7, 3, S.dk); R(g, x - 3, topY, 7, 1, S.f); R(g, x - 1, topY + 3, 3, 3, '#4a4a5a'); px(g, x, topY + 4, '#c9a040');
  const len = floorY - 8 - topY - 6; for (let i = 0; i < len; i += 2) { const k = i / len, xx = x + Math.round(Math.sin(time * 7 + i * 0.2) * sway * k); R(g, xx, topY + 6 + i, 1, 2, i & 2 ? '#c9b27c' : '#a0885a'); }
  const gx = x + Math.round(Math.sin(time * 7 + len * 0.2) * sway); R(g, gx - 2, floorY - 12, 5, 5, '#7a5a30'); R(g, gx - 2, floorY - 12, 5, 1, '#c9a870'); R(g, gx - 1, floorY - 7, 1, 4, '#a0885a'); R(g, gx + 1, floorY - 7, 1, 4, '#a0885a'); }

// ---------------- THE GUARDROOM DOOR ----------------
// st: 'shut' (an oak door, iron-strapped) | 'up' (raised: the dark guardroom, ember light, the leaf's foot hanging in the arch head) | 'down' (an iron gate dropped to the sill: guards kept in)
// hornK 0..1 = the horn's time left (a red pennant over the arch while it runs); hit = a frame's worth of sparks after a winch blow.
export function drawGuardDoor(g, x, fy, st = 'shut', hornK = 0, time = 0, hit = 0) {
  const x0 = x - 11, top = fy - 32;
  R(g, x0 - 3, top - 2, 28, 34, S.dk);                                                                          // the opening's reveal
  R(g, x0 - 3, top - 4, 28, 3, S.d); R(g, x0 - 3, top - 4, 28, 1, S.f); R(g, x0 - 1, top - 6, 24, 2, S.c);        // the lintel and its course
  for (const [bx, bw] of [[x0 - 3, 3], [x0 + 22, 3]]) { for (let y = top - 2; y < fy; y += 5) { R(g, bx, y, bw, 4, ((y - top) / 5 | 0) & 1 ? S.e : S.d); R(g, bx, y, 1, 4, S.g); } }   // the jambs: ashlar
  R(g, x - 4, top - 8, 9, 5, S.f); R(g, x - 4, top - 8, 9, 1, S.g); R(g, x - 1, top - 6, 3, 2, '#e0b040'); R(g, x - 5, top - 3, 11, 1, S.a);                        // a keystone with the crown glyph
  if (st === 'shut') {
    R(g, x0, top, 22, 32, '#3a2814');
    for (let k = 0; k < 5; k++) { R(g, x0 + k * 4, top, 3, 32, k & 1 ? '#5a4228' : '#654a2c'); R(g, x0 + k * 4, top, 1, 32, '#7a5a3a'); R(g, x0 + k * 4 + 3, top, 1, 32, '#1e140c'); }
    bandIron(g, x0, top + 4, 22, 3); bandIron(g, x0, top + 22, 22, 3); for (const sx of [x0 + 2, x0 + 9, x0 + 18]) { stud(g, sx, top + 5); stud(g, sx, top + 23); }
    R(g, x + 3, top + 13, 5, 5, '#16161e'); R(g, x + 4, top + 14, 3, 3, '#5a4228'); R(g, x + 4, top + 13, 3, 1, '#a0a0b8');             // the ring
    R(g, x - 1, top, 2, 32, '#12100c'); return; }
  R(g, x0, top, 22, 32, '#0a0810');
  if (st === 'up') {
    const f = 0.5 + 0.5 * Math.sin(time * 9); g.globalAlpha = 0.22 + 0.1 * f; R(g, x0, top + 8, 22, 24, '#ff6b3c'); g.globalAlpha = 1; g.globalAlpha = 0.18; R(g, x0 + 3, top + 18, 16, 14, '#ffd36b'); g.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { const hx = x0 + 4 + i * 6; R(g, hx, top + 22 - (i & 1) * 2, 5, 3, '#3a3a48'); R(g, hx, top + 22 - (i & 1) * 2, 5, 1, '#9a9ab0'); R(g, hx + 1, top + 25 - (i & 1) * 2, 3, 7, '#1a1a24'); }   // helmets in the dark
    R(g, x0, top, 22, 6, '#3a2814'); for (let k = 0; k < 5; k++) { R(g, x0 + k * 4, top, 1, 6, '#7a5a3a'); } bandIron(g, x0, top + 4, 22, 2);                  // the raised leaf's foot
    for (let k = 0; k < 6; k++) { R(g, x0 + 1 + k * 4, top + 6, 1, 4, '#8a8aa0'); px(g, x0 + 1 + k * 4, top + 10, '#c9c9d6'); }
  } else {
    const slam = hit > 0 ? Math.min(1, hit) : 0;
    for (let k = 0; k < 6; k++) { R(g, x0 + 1 + k * 4, top, 3, 31, '#34343f'); R(g, x0 + 1 + k * 4, top, 1, 31, '#8a8aa0'); R(g, x0 + 3 + k * 4, top, 1, 31, '#16161e'); R(g, x0 + 1 + k * 4, fy - 4, 3, 2, '#c9c9d6'); px(g, x0 + 2 + k * 4, fy - 2, '#c9c9d6'); }
    bandIron(g, x0, top, 22, 3); bandIron(g, x0, top + 14, 22, 2); bandIron(g, x0, top + 26, 22, 2); for (const sx of [x0 + 1, x0 + 19]) stud(g, sx, top + 1);
    if (slam) { g.globalAlpha = slam; for (let i = 0; i < 6; i++) px(g, x0 + 2 + i * 4 + ((i * 7) & 1), fy - 3 - (i % 3), '#ffd36b'); g.globalAlpha = 1; } }
  if (hornK > 0) { const k = Math.max(0, Math.min(1, hornK)), w = Math.round(26 * k); R(g, x - 14, top - 13, 28, 5, '#3a1a1a'); R(g, x - 13 + (26 - w) / 2, top - 12, w, 3, hornK < 0.3 && Math.sin(time * 24) > 0 ? '#ffffff' : '#ff6b6b'); R(g, x - 14, top - 13, 28, 1, '#e0b040'); R(g, x - 14, top - 9, 28, 1, '#a8841c'); } }

// ---------------- THE WINCH BOX (a guardroom's hoist) ----------------
// doorX = where the door is (the chain runs to it); n/need = the blows struck so far; spin = it is turning now.
export function drawWinchBox(g, x, fy, doorX, spin = 0, n = 0, need = 3, open = false, time = 0) {
  R(g, x - 9, fy - 4, 19, 4, S.d); R(g, x - 9, fy - 4, 19, 1, S.f); R(g, x - 10, fy - 1, 21, 1, S.a);
  R(g, x - 7, fy - 22, 4, 18, S.c); R(g, x + 4, fy - 22, 4, 18, S.c); R(g, x - 7, fy - 22, 1, 18, S.e); R(g, x + 4, fy - 22, 1, 18, S.e); R(g, x - 8, fy - 24, 17, 3, S.dk); R(g, x - 8, fy - 24, 17, 1, S.f);
  R(g, x - 3, fy - 19, 7, 11, '#4a3620'); R(g, x - 3, fy - 19, 7, 1, '#7a5a3a'); R(g, x - 3, fy - 9, 7, 1, '#1e140c'); for (const yy of [fy - 17, fy - 12]) R(g, x - 3, yy, 7, 1, '#2a2a34');
  const a = spin > 0 ? Math.floor(time * 14) & 3 : 0, hand = [[7, 0], [0, 7], [-7, 0], [0, -7]][a];                                // the crank: four poses
  for (let i = 0; i < 7; i++) R(g, x + Math.round(hand[0] * i / 7), fy - 14 + Math.round(hand[1] * i / 7), 1, 1, '#8a6a3a'); R(g, x + hand[0] - 1, fy - 14 + hand[1] - 1, 3, 3, '#c9a040');
  const cy0 = fy - 24; for (let yy = cy0 - 8; yy < cy0; yy += 3) R(g, x, yy, 1, 2, yy & 1 ? '#b0b0c4' : '#6a6a7c');                         // the chain up
  const dx = Math.round(doorX), dir = dx > x ? 1 : -1; for (let xx = x; Math.abs(xx - dx) > 2; xx += dir * 3) R(g, xx, cy0 - 9, 2, 1, (xx & 1) ? '#b0b0c4' : '#6a6a7c'); R(g, x - 2, cy0 - 10, 5, 3, S.dk); px(g, x, cy0 - 9, '#c9a040');
  for (let i = 0; i < need; i++) R(g, x - 7 + i * 5, fy - 29, 4, 3, i < n ? '#ffd36b' : '#3a3a44'); if (open) { g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 8); R(g, x - 9, fy - 31, 19, 1, '#ffd36b'); g.globalAlpha = 1; } }

// ---------------- THE MURDER HOLE (a prop you strike) ----------------
export function drawStone(g, x, y, time = 0) {                                                                  // the dropped stone: a cut block, tumbling, with its dust
  const a = Math.floor(time * 20) & 3, o = a & 1 ? 1 : 0;
  R(g, x - 5 + o, y - 5, 10, 10, '#7a7a8a'); R(g, x - 5 + o, y - 5, 10, 2, '#c9c9d6'); R(g, x - 5 + o, y + 3, 10, 2, '#4a4a58'); R(g, x - 1 + o, y - 5, 1, 10, '#3a3a44'); px(g, x - 4, y - 1, '#a0a0b0'); px(g, x + 3, y + 1, '#2a2a34');
  g.globalAlpha = 0.5; R(g, x - 3, y - 12 - o * 2, 6, 3, '#9a9aaa'); R(g, x - 2, y - 17, 4, 2, '#9a9aaa'); g.globalAlpha = 1; }
export function drawMurderHole(g, pr, cx, cy, time) {
  const x = Math.round(pr.x - cx), y = Math.round(pr.y0 - cy), L = !!pr.loaded;
  R(g, x - 9, y - 3, 18, 6, S.d); R(g, x - 9, y - 3, 18, 1, S.f); R(g, x - 8, y + 3, 16, 1, S.mor);                                      // the iron-lipped slot in the vault
  R(g, x - 7, y - 1, 14, 3, '#07070b'); R(g, x - 8, y - 1, 1, 4, S.e); R(g, x + 7, y - 1, 1, 4, S.a);
  if (L) { R(g, x - 5, y - 2, 10, 4, '#8a8a9c'); R(g, x - 5, y - 2, 10, 1, '#c9c9d6'); R(g, x - 5, y + 1, 10, 1, '#4a4a58'); g.globalAlpha = 0.35 + 0.3 * Math.sin(time * 5); R(g, x - 8, y + 4, 16, 1, '#ffd36b'); R(g, x - 6, y + 5, 12, 1, '#ffd36b'); g.globalAlpha = 1; }
  else { R(g, x - 6, y - 1, 12, 3, '#14141c'); }
  if (pr.chain) { const k = pr.kick, chx = Math.round((k.l + k.r) / 2 - cx), top = y + 2, bot = Math.round(k.b - cy) - 2;                           // the pull-chain: iron links on a bracket, a grip at its foot
    R(g, chx - 3, top, 7, 3, S.dk); R(g, chx - 3, top, 7, 1, S.f); for (let yy = top + 3, i = 0; yy < bot - 6; yy += 3, i++) { if (i & 1) { R(g, chx, yy, 1, 3, '#b0b0c4'); } else { R(g, chx - 1, yy, 3, 3, '#4c4c5c'); px(g, chx, yy + 1, '#0e0e14'); } }
    R(g, chx - 4, bot - 6, 9, 2, L ? '#ffd36b' : '#5a5a68'); R(g, chx - 1, bot - 8, 3, 3, '#3a3a44'); R(g, chx - 4, bot - 4, 9, 2, L ? '#c9a040' : '#3a3a44'); }
  if (pr.stone) drawStone(g, Math.round(pr.stone.x - cx), Math.round(pr.stone.y - cy), time); }

// ---------------- THE ROOF HATCH ----------------
export function drawHatch(g, x, y, open = 0, time = 0) {                                                       // x centre, y = the ceiling's under-face; an iron-strapped trap, or the night and a rope-ladder's rungs
  if (open > 0) { g.globalAlpha = 0.22 + 0.1 * Math.sin(time * 4); R(g, x - 9, y, 18, 34, '#aac4ff'); g.globalAlpha = 1; R(g, x - 10, y - 1, 20, 4, '#06060a'); R(g, x - 10, y + 3, 20, 1, S.mor);
    for (let i = 0; i < 4; i++) { R(g, x - 5, y + 6 + i * 7, 10, 1, '#8a6a3a'); } R(g, x - 5, y + 3, 1, 28, '#a0885a'); R(g, x + 4, y + 3, 1, 28, '#a0885a');
    R(g, x + 6, y - 5, 12, 3, '#4a3620'); R(g, x + 6, y - 5, 12, 1, '#7a5a3a'); return; }
  R(g, x - 10, y - 1, 20, 6, '#3a2814'); for (let k = 0; k < 5; k++) { R(g, x - 10 + k * 4, y - 1, 3, 6, k & 1 ? '#5a4228' : '#654a2c'); R(g, x - 10 + k * 4, y - 1, 1, 6, '#7a5a3a'); }
  bandIron(g, x - 10, y, 20, 1); bandIron(g, x - 10, y + 3, 20, 1); R(g, x - 11, y - 2, 22, 1, S.f); R(g, x - 11, y + 5, 22, 1, S.mor); R(g, x - 1, y + 5, 3, 4, '#2a2a34'); R(g, x - 1, y + 9, 3, 1, '#c9a040'); }

// ---------------- THE BATTLEMENTS ----------------
const inSpan = (a, b, cx, VW) => b * TS + TS + 80 > cx && a * TS - 80 < cx + VW;
const farStrip = () => once('far', () => { const W = 1024, H = 190, [c, g] = canvas(W, H), rnd = mulberry(1103);
  for (let x = 0; x < W; x++) { const h1 = 70 + Math.sin(x * 0.011) * 22 + Math.sin(x * 0.031 + 1) * 11 + Math.sin(x * 0.083) * 4, h2 = 42 + Math.sin(x * 0.017 + 2) * 16 + Math.sin(x * 0.05) * 7;
    R(g, x, H - Math.round(h1), 1, Math.round(h1), '#171c30'); R(g, x, H - Math.round(h1), 1, 2, '#3a4668'); R(g, x, H - Math.round(h2), 1, Math.round(h2), '#1d233a'); if (h2 > 50) R(g, x, H - Math.round(h2), 1, 2, '#46547a'); }   // two ridges, snow on the high ground
  for (let k = 0; k < 4; k++) { const x0 = 40 + k * 250 + ((rnd() * 40) | 0), w = 110 + ((rnd() * 40) | 0), top = H - 62 - ((rnd() * 10) | 0);                                // a far curtain wall with its towers
    R(g, x0, top + 14, w, 48, '#242a42'); R(g, x0, top + 14, w, 2, '#3a4466'); for (let x = x0; x < x0 + w; x += 8) { R(g, x, top + 8, 5, 6, '#242a42'); R(g, x, top + 8, 5, 1, SNOW_D); }
    for (const tx of [x0 + 4, x0 + w - 22]) { R(g, tx, top - 14, 18, 76, '#2c3350'); R(g, tx, top - 14, 18, 2, '#46547a'); R(g, tx + 15, top - 14, 3, 76, '#1c2138'); for (let x = tx; x < tx + 18; x += 6) { R(g, x, top - 20, 4, 6, '#2c3350'); R(g, x, top - 20, 4, 1, SNOW_D); }
      R(g, tx + 7, top - 2, 3, 5, '#ffb84a'); if (rnd() < 0.7) R(g, tx + 7, top + 20, 3, 5, '#ffb84a'); R(g, tx + 8, top - 30, 2, 10, '#46547a'); R(g, tx + 10, top - 30, 8, 5, '#5a2a7a'); } }
  return c; });
export function drawFar(g, cx, cy, VW, VH, time) {                                                             // far wards, ridges and a snow-haze, under the facades (parallax 0.35)
  if (!inSpan(K.FAR[0], K.FAR[1], cx, VW)) return;
  const s = farStrip(), base = Math.round((K.S + 1) * TS - cy) + 2, off = -Math.round(cx * 0.35) % 1024, a0 = Math.max(0, Math.min(1, (cx + VW - K.FAR[0] * TS) / 160, (K.FAR[1] * TS + 160 - cx) / 160));
  g.globalAlpha = 0.9 * a0; for (let x = off - 1024; x < VW; x += 1024) { if (x + 1024 > 0) g.drawImage(s, x, base - 190); } g.globalAlpha = 1;
  g.globalAlpha = 0.07 * a0; R(g, 0, base - 80, VW, 80, '#c9d8ff'); g.globalAlpha = 1; void time; }

export function drawParapet(g, cx, cy, VW, time) {                                                             // the wall walk's parapet: merlons, crenels, loops, snow, drawn behind the walkers
  const fy = Math.round((K.S + 1) * TS - cy), H = 26, top = fy - H;
  const seg = (xa, xb, ragL, ragR) => {
    const x0 = xa * TS - cx, x1 = (xb + 1) * TS - cx; if (x1 < -16 || x0 > VW + 16) return;
    const from = Math.max(0, Math.floor(x0)), to = Math.min(VW, Math.ceil(x1));
    R(g, from, top + 8, to - from, H - 8, S.b); R(g, from, top + 8, to - from, 1, S.d);                              // the wall body
    for (let x = Math.floor((cx + from) / TS) * TS; x < cx + to; x += TS) { const sx = x - cx;                       // merlons (10 wide) and crenels (6) on the world's grid
      const a = Math.max(sx + 3, from), b = Math.min(sx + 13, to); if (b > a) { R(g, a, top, b - a, 9, S.c); if (a === sx + 3) R(g, a, top, 1, 9, S.e); if (b === sx + 13) R(g, b - 1, top, 1, 9, S.a); R(g, a, top, b - a, 1, S.f);
        R(g, a, top - 1, b - a, 2, SNOW); R(g, a, top + 1, b - a, 1, SNOW_D); if (b - a >= 9) { R(g, sx + 7, top + 3, 2, 6, S.mor); R(g, sx + 7, top + 3, 1, 6, '#000000'); } }                          // a loop in the merlon
      const ja = Math.max(sx + 3, from), jb = Math.min(sx + 13, to); void ja; void jb;
      if ((x / TS) % 2 === 0 && sx + 16 > from && sx < to) { const a2 = Math.max(sx + 1, from), b2 = Math.min(sx + 15, to); if (b2 > a2) R(g, a2, top + 14, b2 - a2, 1, S.mor); }
      if (((x / TS) | 0) % 3 === 1) { const a3 = Math.max(sx + 4, from), b3 = Math.min(sx + 12, to); if (b3 > a3) { R(g, a3, top + 8, b3 - a3, 2, SNOW); } } }                                        // drifts on the sill
    for (let x = Math.floor((cx + from) / 8) * 8; x < cx + to; x += 8) { const sx = x - cx, k = (x / 8) | 0, y = top + 17 + ((k * 5) % 3) * 3; if (sx >= from && sx < to) R(g, sx + (k & 1 ? 4 : 0), y, 4, 1, S.mor); }  // the courses
    R(g, from, fy - 3, to - from, 3, S.a); R(g, from, fy - 3, to - from, 1, S.mor);                                // the shadow at the foot
    if (ragL && x0 >= -2) { for (let i = 0; i < 6; i++) R(g, Math.round(x0) + i, top + 4 + ((i * 7) % 5) * 3, 1, H, S.dk); }
    if (ragR && x1 <= VW + 2) { for (let i = 0; i < 6; i++) R(g, Math.round(x1) - 1 - i, top + 5 + ((i * 5) % 4) * 3, 1, H, S.dk); } };
  K.PARAPET.forEach(([a, b], i) => seg(a, b, a === 585, b === 575));
  void time; }

export function drawGapRubble(g, cx, cy, time) {                                                               // the broken stretch: stumps of wall either side, rubble on the lower walk
  const gx0 = K.GAP[0] * TS - cx, gx1 = (K.GAP[1] + 1) * TS - cx; if (gx1 < -20 || gx0 > 520) return; const fy = Math.round((K.S + 1) * TS - cy);
  for (const [x, dir] of [[gx0, -1], [gx1, 1]]) for (let i = 0; i < 7; i++) { const h = 10 + ((i * 11) % 6) * 3; R(g, Math.round(x) + dir * (i * 2) - (dir > 0 ? 0 : 2), fy - 5 - h + i * 2, 2, h, i & 1 ? S.b : S.c); R(g, Math.round(x) + dir * (i * 2) - (dir > 0 ? 0 : 2), fy - 5 - h + i * 2, 2, 1, SNOW); }
  g.globalAlpha = 0.9; for (let i = 0; i < 7; i++) { const x = Math.round(gx0 + 24 + i * 15 + (i * 5) % 9), y = fy + 6 * 16 - 4 - (i % 3); R(g, x, y, 5 + (i % 3), 3, S.c); R(g, x, y, 5 + (i % 3), 1, S.e); } g.globalAlpha = 1; void time; }

export function drawTowers(g, cx, cy, VW, time) {                                                              // the alarm towers: a machicolation course, arch rings at the passage mouths, loops, banners
  for (const T of K.TOWERS) {
    if (!inSpan(T.x0, T.x1, cx, VW)) continue; const X0 = Math.round(T.x0 * TS - cx), X1 = Math.round((T.x1 + 1) * TS - cx), fy = Math.round((K.S + 1) * TS - cy), top = Math.round(15 * TS - cy);
    R(g, X0, top - 7, X1 - X0, 7, S.d); R(g, X0, top - 7, X1 - X0, 1, S.f);                                         // the machicolation course under the body: corbels with slots between
    for (let x = X0 + 2; x < X1 - 6; x += 8) { R(g, x, top - 6, 6, 9, S.c); R(g, x, top - 6, 6, 1, S.e); R(g, x + 1, top + 3, 4, 3, S.b); R(g, x + 2, top + 6, 2, 2, S.a); R(g, x + 6, top - 5, 2, 7, S.mor); }
    for (const [ax, dir] of [[X0, 1], [X1, -1]]) { for (let i = 0; i < 12; i++) { const ox = ax + dir * i - (dir < 0 ? 1 : 0), dyy = Math.round(12 - Math.sqrt(Math.max(0, 144 - (12 - i) * (12 - i)))); R(g, ox, top + 8 + dyy, 1, 3, (i & 2) ? S.e : S.d); } R(g, ax - (dir > 0 ? 3 : 0), top + 8, 3, fy - top - 8, S.d); R(g, ax - (dir > 0 ? 3 : 0), top + 8, 1, fy - top - 8, S.f); }   // jambs and the arch springers
    for (const [lx, ly] of [[T.x0 + 2, 8], [T.x1 - 2, 8], [T.x0 + 4, 11], [T.x0 + 6, 11], [(T.x0 + T.x1) / 2, 8]]) { const sx = Math.round(lx * TS + 7 - cx), sy = Math.round(ly * TS - cy); R(g, sx - 2, sy - 1, 5, 1, S.f); R(g, sx - 1, sy, 3, 10, '#07070b'); R(g, sx - 2, sy, 1, 10, S.e); R(g, sx - 1, sy + 4, 3, 1, '#07070b'); R(g, sx - 3, sy + 10, 7, 1, S.a); }   // the archers' loops
    const wave = Math.sin(time * 2.2 + T.x0) * 1.5; for (const bx of [X0 + 7, X1 - 15]) { R(g, bx - 1, top + 3, 12, 2, S.dk); R(g, bx, top + 5, 10, 18, '#4e1e72'); R(g, bx, top + 5, 10, 1, '#e0b040'); R(g, bx + 4 + Math.round(wave), top + 10, 2, 6, '#e0b040'); R(g, bx + 3 + Math.round(wave), top + 12, 4, 2, '#e0b040'); for (let i = 0; i < 5; i++) R(g, bx + i * 2, top + 23 + (i & 1), 2, 2, '#e0b040'); }   // the Queen's banner: a crown on purple
  } }

// THE TOWER TOPS (the archers' roofs): the merlons (tile columns x0, x1 and x0+4..5 on rows 5-6) get snow caps, a cut loop in the broad one, a pennant pole on each end; a signal BRAZIER (an iron basket on three legs) stands in
// the crenel by the west merlon: cold coals until her alarm sounds, then it burns (lit = a Set of tower ids, from goblin-princess.js). Nothing here moves a tile.
export function drawTowerTops(g, cx, cy, VW, time, lit) {
  for (const T of K.TOWERS) {
    if (!inSpan(T.x0, T.x1, cx, VW)) continue; const id = T.x0 === K.TOWERS[0].x0 ? 'tower1' : 'tower2', on = !!(lit && lit.has && lit.has(id));
    const top = Math.round(5 * TS - cy), floor = Math.round(7 * TS - cy), X = c => Math.round(c * TS - cx);
    for (const [a, b] of [[T.x0, T.x0], [T.x1, T.x1], [T.x0 + 4, T.x0 + 5]]) { const x = X(a), w = (b - a + 1) * TS;
      R(g, x, top - 2, w, 3, SNOW); R(g, x, top - 2, w, 1, '#ffffff'); R(g, x + 1, top + 1, w - 2, 1, SNOW_D); R(g, x - 1, top + 2, w + 2, 2, S.f); R(g, x - 1, top + 3, w + 2, 1, S.mor);   // the cap stone, the snow on it
      for (let y = top + 6; y < floor - 2; y += 8) { R(g, x, y, w, 1, S.mor); } R(g, x - 1, floor - 3, w + 2, 3, S.a);                                                                // courses, the shadow at the foot
      if (w > 20) { const lx = x + (w >> 1) - 1; R(g, lx - 2, top + 8, 5, 1, S.f); R(g, lx - 1, top + 9, 3, 16, '#07070b'); R(g, lx - 2, top + 9, 1, 16, S.e); R(g, lx - 1, top + 15, 3, 1, '#07070b'); R(g, lx - 3, top + 25, 7, 1, S.a); } }   // the archers' loop, a cross-slit
    const pole = (a, col, flip) => { const x = X(a) + (flip ? 11 : 3), w = Math.sin(time * 2.6 + a) * 1.5; R(g, x, top - 22, 2, 21, '#8a919c'); R(g, x, top - 22, 2, 1, '#c9a040'); R(g, x - 1, top - 24, 4, 2, '#c9a040');
      for (let i = 0; i < 9; i++) R(g, x + 2 + i, top - 20 + Math.round(w * i / 9) + (i >> 2), 1, 7 - (i >> 1), i & 1 ? col : col);   // the pennant, tapering
      R(g, x + 2, top - 20, 6, 1, '#e0b040'); };
    pole(T.x0, '#5a2a7a', false); pole(T.x1, '#2c6a2c', true);
    const bx = X(T.x0 + 2) + 8;                                                                                   // the signal brazier in the crenel
    R(g, bx - 6, floor - 3, 3, 3, '#34343f'); R(g, bx + 4, floor - 3, 3, 3, '#34343f'); R(g, bx - 1, floor - 3, 3, 3, '#34343f');
    R(g, bx - 7, floor - 12, 15, 3, '#3a3a48'); R(g, bx - 7, floor - 12, 15, 1, '#8a8aa0'); R(g, bx - 6, floor - 9, 13, 6, '#22222c'); for (const dx of [-5, -1, 3, 6]) R(g, bx + dx, floor - 9, 1, 6, '#5a5a6c');
    if (!on) { R(g, bx - 5, floor - 14, 11, 2, '#2a2420'); px(g, bx - 2, floor - 14, '#5a3a2a'); px(g, bx + 2, floor - 15, '#3a2a22'); }
    else { const f = 0.5 + 0.5 * Math.sin(time * 11 + T.x0); for (let k = 0; k < 4; k++) { g.globalAlpha = (0.05 + 0.03 * f) * (k + 1) / 2; R(g, bx - 8 - (3 - k) * 5, floor - 20 - (3 - k) * 5, 17 + (3 - k) * 10, 20 + (3 - k) * 5, '#ff8a3c'); } g.globalAlpha = 1;
      for (let i = 0; i < 5; i++) { const fh = 8 + ((i * 5 + Math.floor(time * 12 + i * 2)) % 4) * 3; R(g, bx - 5 + i * 2, floor - 13 - fh, 3, fh, i & 1 ? '#ff7a2c' : '#ff9a3c'); R(g, bx - 4 + i * 2, floor - 13 - fh + 4, 1, fh - 4, '#ffd36b'); }
      R(g, bx - 5, floor - 14, 11, 2, '#ff6a2c'); } }
}

// ---------------- THE BELL TOWER ----------------
export function drawBellTowerTop(g, cx, cy, VW, time) {
  if (!inSpan(K.BT[0], K.BT[1], cx, VW)) return; const X0 = Math.round(K.BT[0] * TS - cx), top = Math.round(2 * TS - cy), W = (K.BT[1] - K.BT[0] + 1) * TS;
  R(g, X0, top, W, 5, S.d); R(g, X0, top, W, 1, SNOW);                                                          // the cornice under the roof
  for (let x = X0 + 4; x < X0 + W - 6; x += 8) { R(g, x, top + 5, 5, 3, S.c); R(g, x, top + 5, 5, 1, S.e); }
  for (const bx of [X0 + 7 * TS + 8, X0 + 9 * TS + 8, X0 + 11 * TS + 8]) {                                      // three belfry arches with louvres
    R(g, bx - 9, top + 12, 19, 52, S.dk); R(g, bx - 9, top + 12, 19, 2, S.f); for (let y = top + 16; y < top + 62; y += 4) { R(g, bx - 7, y, 15, 2, '#12121a'); R(g, bx - 7, y, 15, 1, S.c); }
    for (let i = 0; i < 9; i++) { const dx = Math.round(9 - Math.sqrt(Math.max(0, 81 - (9 - i) * (9 - i)))); R(g, bx - 9 + i, top + 12, 1, 2 + dx, S.e); R(g, bx + 9 - i, top + 12, 1, 2 + dx, S.d); }
    R(g, bx - 11, top + 14, 3, 50, S.c); R(g, bx + 9, top + 14, 3, 50, S.b); R(g, bx - 11, top + 14, 1, 50, S.e); }
  const sw = Math.sin(time * 1.3) * 2, bx = X0 + 9 * TS + 8; R(g, bx - 4 + Math.round(sw), top + 42, 9, 10, '#1a1420'); R(g, bx - 3 + Math.round(sw), top + 42, 2, 10, '#3a2e22');   // the bell, dark in the middle arch
  R(g, X0 + W / 2 - 1, top - 20, 2, 14, '#8a919c'); R(g, X0 + W / 2 - 3, top - 22, 6, 3, '#c9a040'); R(g, X0 + W / 2 + 1, top - 19, 9, 5, '#5a2a7a'); }

// ---------------- THE BAKEHOUSE YARD ----------------
export function drawYard(g, cx, cy, VW, time) {
  for (const o of K.YARD) { const x = Math.round(o.col * TS + 8 - cx), fy = Math.round(o.row * TS - cy); if (x < -40 || x > VW + 40) continue;
    if (o.k === 'oven') {                                                                                         // a beehive bread oven in coursed stone, soot over its mouth, a fire-glow in it
      R(g, x - 15, fy - 6, 31, 6, S.d); R(g, x - 15, fy - 6, 31, 1, S.f); R(g, x - 13, fy - 20, 27, 14, S.c); R(g, x - 13, fy - 20, 27, 1, S.e); R(g, x - 10, fy - 25, 21, 5, S.c); R(g, x - 7, fy - 29, 15, 4, S.b); R(g, x - 4, fy - 32, 9, 3, S.c);
      for (const [yy, off] of [[fy - 15, 0], [fy - 10, 5], [fy - 23, 3]]) R(g, x - 13 + off, yy, 26 - off, 1, S.mor);
      R(g, x - 6, fy - 17, 13, 11, '#0a0810'); R(g, x - 7, fy - 18, 15, 2, S.d); R(g, x - 7, fy - 16, 1, 10, S.e); const f = 0.5 + 0.5 * Math.sin(time * 7 + o.col); g.globalAlpha = 0.5 + 0.25 * f; R(g, x - 5, fy - 11, 11, 5, '#ff7a2c'); R(g, x - 3, fy - 9, 7, 3, '#ffd36b'); g.globalAlpha = 1;
      R(g, x - 5, fy - 24, 11, 3, '#1a1620'); R(g, x + 13, fy - 28, 3, 22, S.b); R(g, x + 13, fy - 28, 3, 1, S.e); }                                // soot, and the flue
    else if (o.k === 'sacks') {                                                                                   // flour sacks piled against the wall, goblin-brand stamped
      for (const [dx, dy, w] of [[-9, 0, 11], [3, 0, 11], [-4, -9, 11]]) { R(g, x + dx, fy - 9 + dy, w, 9, '#b8a888'); R(g, x + dx, fy - 9 + dy, w, 1, '#d8c8a8'); R(g, x + dx, fy - 1 + dy, w, 1, '#7a6a50'); R(g, x + dx + 1, fy - 12 + dy, w - 2, 3, '#a89878'); R(g, x + dx + 3, fy - 5 + dy, 4, 3, '#2c4a1e'); R(g, x + dx + 4, fy - 4 + dy, 2, 1, '#8fd160'); } R(g, x + 9, fy - 3, 4, 3, '#e8e0cc'); }
    else if (o.k === 'rack') {                                                                                    // an iron cooling rack of black loaves
      R(g, x - 9, fy - 20, 2, 20, '#34343f'); R(g, x + 8, fy - 20, 2, 20, '#34343f'); for (const yy of [fy - 18, fy - 11, fy - 4]) { R(g, x - 9, yy, 19, 2, '#34343f'); R(g, x - 9, yy, 19, 1, '#8a8aa0'); for (let i = 0; i < 3; i++) { R(g, x - 7 + i * 6, yy - 4, 5, 4, '#3a2418'); R(g, x - 7 + i * 6, yy - 4, 5, 1, '#6a4a2a'); } } }
    else if (o.k === 'trough') {                                                                                  // a quenching trough hewn from one stone, steaming
      R(g, x - 14, fy - 10, 29, 10, S.c); R(g, x - 14, fy - 10, 29, 2, S.e); R(g, x - 12, fy - 8, 25, 4, '#1a2a3a'); R(g, x - 12, fy - 8, 25, 1, '#4a7a9a'); R(g, x - 15, fy - 1, 31, 1, S.dk);
      g.globalAlpha = 0.3; for (let i = 0; i < 3; i++) R(g, x - 8 + i * 8 + Math.round(Math.sin(time * 2 + i) * 2), fy - 18 - ((time * 12 + i * 5) % 10 | 0), 3, 5, '#e0e8f0'); g.globalAlpha = 1; } } }

// ---------------- THE ROOMS ----------------
// The Captains Hall (the guard hall: iron racks, shields, pikes, the Queen's banners between lancets) and the Banquet Hall (the feast: tall arcade, great hearth, plate racks, swagged banners)
const ashlar = (g, w, h, base, lit, mor, seed) => { const rnd = mulberry(seed); R(g, 0, 0, w, h, base);
  for (let y = 0; y < h; y += 10) { R(g, 0, y + 9, w, 1, mor); const off = ((y / 10) | 0) & 1 ? 12 : 0; for (let x = off; x < w; x += 24) R(g, x, y, 1, 9, mor); }
  for (let i = 0; i < w * h / 90; i++) { const x = (rnd() * w) | 0, y = (rnd() * h) | 0; px(g, x, y, rnd() < 0.5 ? lit : mor); } };
function banner(g, x, y, h, col, trim, glyph) { R(g, x - 1, y, 14, 2, S.dk); R(g, x, y, 12, 1, '#8a8aa0'); R(g, x + 1, y + 2, 10, h, col); R(g, x + 1, y + 2, 1, h, trim); R(g, x + 10, y + 2, 1, h, '#000000'); for (let i = 0; i < 5; i++) R(g, x + 1 + i * 2, y + 2 + h, 2, 2 + (i & 1) * 2, trim);
  if (glyph) { const cy = y + 2 + (h >> 1) - 3; R(g, x + 3, cy + 2, 6, 3, trim); for (const dx of [3, 5, 7, 9]) R(g, x + dx - 1 + (dx > 5 ? 0 : 0), cy - (dx === 5 || dx === 7 ? 1 : 0), 1, 3, trim); px(g, x + 6, cy + 3, '#ff4a6a'); } }
const lancet = (g, x, y, w, h, shaftK) => { R(g, x - 2, y - 2, w + 4, h + 3, S.dk); R(g, x, y, w, h, '#0c1226'); for (let i = 0; i < w / 2; i++) { const d = Math.round((w / 2 - i) * 0.8); R(g, x + i, y, 1, d, S.dk); R(g, x + w - 1 - i, y, 1, d, S.dk); }
  R(g, x - 2, y - 2, 1, h + 3, S.e); R(g, x + w + 1, y - 2, 1, h + 3, S.a); R(g, x - 3, y + h + 1, w + 6, 2, S.f); R(g, x + (w >> 1), y + 3, 1, h - 3, S.dk); R(g, x, y + (h >> 1), w, 1, S.dk); for (let k = 0; k < 2; k++) px(g, x + 2 + k * (w - 5), y + 6 + k, '#9fb4e8'); void shaftK; };
const bakeCapt = (w, h) => once('capt' + w + 'x' + h, () => { const [c, g] = canvas(w, h);
  ashlar(g, w, h, '#2a2d38', '#3c4050', '#14151d', 431);
  R(g, 0, 0, w, 7, S.d); R(g, 0, 0, w, 1, S.f); R(g, 0, 6, w, 1, S.mor); for (let x = 4; x < w - 6; x += 12) { R(g, x, 7, 8, 5, S.c); R(g, x + 1, 12, 6, 3, S.b); R(g, x + 2, 15, 4, 2, S.a); }   // a corbel table under the ceiling
  R(g, 0, h - 22, w, 22, '#1f2029'); R(g, 0, h - 22, w, 2, S.d); R(g, 0, h - 21, w, 1, S.f); for (let x = 0; x < w; x += 16) { R(g, x, h - 20, 1, 20, S.mor); R(g, x + 3, h - 18, 10, 14, '#252733'); R(g, x + 3, h - 18, 10, 1, S.b); }   // an iron-plated dado
  for (let bx = 12, i = 0; bx < w - 40; bx += 64, i++) {
    R(g, bx - 4, 8, 7, h - 30, S.e); R(g, bx - 4, 8, 1, h - 30, S.g); R(g, bx + 2, 8, 1, h - 30, S.a); R(g, bx - 6, 8, 11, 3, S.f); R(g, bx - 6, h - 24, 11, 4, S.d);           // a pilaster
    lancet(g, bx + 14, 22, 12, 36, 0);                                                                                                                                                   // a lancet window
    banner(g, bx + 36, 14, 38, i % 2 ? '#4e1e72' : '#2c4a1e', '#e0b040', true);                                                                                                           // the Queen's purple / the goblin green
    if (bx + 28 < w - 8) { /* a shield and crossed pikes on every other bay */ const sx = bx + 30, sy = 62; if (i % 2 === 0) { R(g, sx - 1, sy - 8, 2, 34, '#5a5a6c'); R(g, sx + 12, sy - 8, 2, 34, '#5a5a6c'); R(g, sx - 3, sy - 12, 6, 5, '#c9d1dc'); R(g, sx + 10, sy - 12, 6, 5, '#c9d1dc'); R(g, sx - 2, sy - 1, 18, 2, '#34343f'); } } }
  for (let x = 40, i = 0; x < w - 30; x += 64, i++) { if (i % 2 === 1) { R(g, x, h - 56, 22, 22, '#3a3a48'); R(g, x + 1, h - 55, 20, 20, '#8a2c2c'); R(g, x + 1, h - 55, 20, 3, '#c9a040'); R(g, x + 9, h - 52, 4, 16, '#e8e8f0'); R(g, x + 4, h - 46, 14, 4, '#e8e8f0'); } }   // a heater shield on the wall
  return c; });
const bakeBanq = (w, h) => once('banq' + w + 'x' + h, () => { const [c, g] = canvas(w, h);
  ashlar(g, w, h, '#2b2830', '#403c4c', '#15131b', 479);
  for (let y = 0; y < 18; y++) { R(g, 0, y, w, 1, y < 2 ? S.f : y < 6 ? S.d : y < 12 ? S.c : S.b); } R(g, 0, 18, w, 2, S.mor);                                              // the vault's cornice
  for (let x = 6; x < w - 8; x += 16) { R(g, x, 18, 10, 6, S.c); R(g, x + 1, 24, 8, 4, S.b); R(g, x + 2, 28, 6, 3, S.a); }
  const bays = Math.floor((w - 16) / 80), bw = (w - 16) / Math.max(1, bays);
  for (let i = 0; i < bays; i++) { const bx = 8 + Math.round(i * bw);
    R(g, bx, 18, 8, h - 40, S.e); R(g, bx, 18, 1, h - 40, S.g); R(g, bx + 7, 18, 1, h - 40, S.a); R(g, bx - 2, 18, 12, 4, S.f); R(g, bx - 2, h - 26, 12, 5, S.d);                      // pilasters between the bays
    const ax = bx + 14, aw = Math.round(bw) - 28;                                                                                                                                       // a tall arched window
    R(g, ax - 2, 40, aw + 4, 90, S.dk); R(g, ax, 42, aw, 88, '#0a0f22'); for (let k = 0; k < aw / 2; k++) { const d = Math.round((aw / 2 - k) * 0.55); R(g, ax + k, 42, 1, d, S.dk); R(g, ax + aw - 1 - k, 42, 1, d, S.dk); }
    R(g, ax - 2, 40, 1, 90, S.e); R(g, ax + aw + 1, 40, 1, 90, S.a); R(g, ax - 3, 130, aw + 6, 3, S.f); for (let y = 52; y < 126; y += 18) R(g, ax, y, aw, 1, S.dk); R(g, ax + (aw >> 1), 42, 1, 88, S.dk);
    for (let k = 0; k < 6; k++) px(g, ax + 4 + (k * 7) % (aw - 8), 50 + k * 12, '#9fb4e8'); }
  for (let x = 24; x < w - 40; x += 80) { R(g, x, 20, 30, 3, '#8a8aa0'); banner(g, x + 4, 22, 54, '#4e1e72', '#e0b040', true); }                                                // the Queen's banners hung between windows
  R(g, 0, h - 30, w, 30, '#1f1c25'); R(g, 0, h - 30, w, 2, S.d); for (let x = 0; x < w; x += 24) { R(g, x, h - 28, 1, 28, S.mor); R(g, x + 3, h - 26, 18, 18, '#262330'); R(g, x + 3, h - 26, 18, 1, S.b); }
  const sv = (31 * 16);                                                                                                                                                                  // the servery door's end: a plate rack and a serving shelf (the door is at 510)
  R(g, sv - 56, h - 72, 44, 5, S.f); R(g, sv - 56, h - 72, 44, 1, S.g); for (let i = 0; i < 6; i++) { R(g, sv - 54 + i * 7, h - 82, 5, 10, '#c9c9d6'); R(g, sv - 54 + i * 7, h - 82, 5, 1, '#ffffff'); R(g, sv - 53 + i * 7, h - 80, 3, 6, '#9a9aa8'); }
  R(g, sv - 58, h - 90, 3, 20, '#34343f'); R(g, sv - 14, h - 90, 3, 20, '#34343f'); R(g, sv - 58, h - 92, 47, 2, '#34343f');
  return c; });
export function paintRoom(g, st, sx, sy, w, h, tx0, ty0, time) {
  if (st !== 'royal') return false;
  if (tx0 === K.CAPT) { g.drawImage(bakeCapt(w, h), sx, sy); const k = 0.5 + 0.5 * Math.sin(time * 2.3); g.globalAlpha = 0.06 + 0.02 * k; g.fillStyle = '#ffb45c'; g.fillRect(sx, sy + h - 50, w, 50); g.globalAlpha = 1; return true; }
  if (tx0 === K.BANQ) { g.drawImage(bakeBanq(w, h), sx, sy);
    const hx = sx + 40, hy = sy + h - 30; R(g, hx - 6, hy - 70, 62, 70, S.dk); R(g, hx - 10, hy - 76, 70, 8, S.d); R(g, hx - 10, hy - 76, 70, 1, S.f); R(g, hx - 4, hy - 68, 58, 68, '#0a0810'); R(g, hx - 6, hy - 70, 3, 70, S.e); R(g, hx + 53, hy - 70, 3, 70, S.a);   // the great hearth on the west wall
    const f = 0.5 + 0.5 * Math.sin(time * 7); for (let i = 0; i < 5; i++) { const fh = 18 + ((i * 7 + Math.floor(time * 9 + i * 3)) % 4) * 4; g.globalAlpha = 0.85; R(g, hx + 4 + i * 10, hy - fh, 8, fh, i & 1 ? '#ff7a2c' : '#ff9a3c'); R(g, hx + 6 + i * 10, hy - fh + 6, 4, fh - 6, '#ffd36b'); g.globalAlpha = 1; }
    g.globalAlpha = 0.08 + 0.04 * f; g.fillStyle = '#ff9a3c'; g.fillRect(sx, sy + h - 120, w, 120); g.globalAlpha = 1; return true; }
  return false; }
