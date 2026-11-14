// src/redraw/gq6s3_art.js - THE ART OF THE QUEEN'S BURN-AND-CLIMB (claude/gq6s3art, over src/gq6s2.js + src/gq6s3.js; Highcrown roof style: oak, iron, slate and lead).
// DRAWING ONLY: no tile, number, hitbox or timer is touched. The tiers are still the default tile sprites underneath; this draws OVER them (src/gq6s2.js E.draw, after the tiles, before the creatures):
//   THE HOARDINGS   boarded oak galleries: a plank deck, vertical boards, an iron strap, a corbel under every 4th board.        (tier 1, the laid cells; the parapet walks stay stone)
//   THE BELL LOFT   squared bell-frame beams: end-grain, iron bolt plates, bracket knees.                                      (tier 2)
//   THE BELL-CAGE ROOF   a slate roof under a lead ridge, a stone newel with a gold finial at each end, eaves teeth.             (the final platform; with S2 alone the ladder's own tile is a hatch)
//   A BURNT SPAN    the same cells charred (black planks, ember joints, split ends), a soot-scorched stone cell where the span is the deck or a parapet, a scorch cap at each end of the span.
//                   THE SMOULDER TELL = the cells char over the 3.0 s (alpha 0 -> 1), a pulsing ember joint line, a few rising embers (the bay's smoke and seam stay under it).
//   THE LADDERS     oak rails, pale iron-shod rungs on a dark trunking, iron hooks at the top and shoes at the foot; lit gold (a second sheet drawn over it) while it is the way.
// Everything is baked ONCE to shared offscreen sheets (one sheet a frame from the roof entry on, so nothing bakes during a burn tell); a frame is a few drawImage per visible cell.
// Draw budget: with every span burning, worst frame <= 600 canvas calls (tools/gq6s3art-look.mjs counts them in the browser; tools/gq6s3.mjs checks the node side, which draws nothing here: no document).
// No document (node) or any failure to make a canvas = every function here returns false and the caller keeps the old look (the default tiles and the flat glow).
import { canvas, rect, px } from '../px.js';
import { STONE as S } from './highcrown2_art.js';

const R = rect, ri = Math.round;
export const TA = { TS: 16, hoardH: 22, roofTop: 12, roofH: 32 };
const OAK = { hl: '#a8844c', top: '#8a6a3c', a: '#6a4a2a', b: '#5a3a20', c: '#4e321b', d: '#3a2414', e: '#2a1a10', k: '#120a08' };
const CHAR = { hl: '#3a2a20', top: '#2a1c14', a: '#241812', b: '#1a110d', c: '#140d0a', d: '#0e0807', e: '#0a0605', k: '#050303' };
const IRON = { hl: '#9a9ab0', a: '#5a6270', b: '#3a3a46', c: '#14151d' };
const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = ((h ^ (h >> 13)) * 1274126177) >>> 0; return (h ^ (h >> 16)) >>> 0; };

// ---------------------------------------------------------------- the cells (each a 16 px column; boards keep a 4 px rhythm across cells so the run reads as one gallery)
function hoardCell(g, ox, oy, v, ch) {
  const P = ch ? CHAR : OAK, h = hash(v, ch ? 7 : 3);
  R(g, ox, oy, 16, 6, P.b); R(g, ox, oy, 16, 1, P.top); R(g, ox, oy + 1, 16, 1, P.a);                                    // the plank deck and its lip
  R(g, ox, oy + 3, 16, 1, P.e); R(g, ox + 3 + ((v * 5) & 7), oy + 1, 1, 2, P.e); R(g, ox + 11 - ((v * 3) & 7), oy + 4, 1, 2, P.e);   // a plank seam and the butt joints
  R(g, ox, oy + 6, 16, 1, P.k);                                                                                       // the deck's shadow line
  R(g, ox, oy + 7, 16, 9, P.c);                                                                                       // the face: vertical boards
  for (let x = 3; x < 16; x += 4) R(g, ox + x, oy + 7, 1, 9, P.e);
  for (let x = 0; x < 16; x += 4) R(g, ox + x, oy + 7, 1, 8, P.b);
  px(g, ox + 1 + (h & 7), oy + 8 + (h >> 4 & 1), P.d); px(g, ox + 9 + (h >> 3 & 3), oy + 12, P.d);                    // knots
  R(g, ox, oy + 10, 16, 2, ch ? '#1c1c22' : IRON.b); R(g, ox, oy + 10, 16, 1, ch ? '#2c2e3b' : IRON.a);                // the iron strap
  px(g, ox + 3, oy + 11, ch ? '#4a4a56' : IRON.hl); px(g, ox + 11, oy + 11, ch ? '#4a4a56' : IRON.hl);                // its nails
  R(g, ox, oy + 14, 16, 2, P.e); R(g, ox, oy + 14, 16, 1, P.d);                                                       // the bottom rail
  if (v === 0) { R(g, ox + 6, oy + 16, 4, 3, P.c); R(g, ox + 7, oy + 19, 2, 2, P.e); R(g, ox + 6, oy + 16, 1, 3, P.d); }  // a corbel
  if (v === 2) { for (const x of [3, 8, 12]) { R(g, ox + x, oy + 16, 1, 2 + (x & 3), P.e); } }                        // tar / soot drips
  if (v === 1) { R(g, ox + 10, oy + 16, 1, 3, P.e); R(g, ox + 4, oy + 16, 1, 2, P.e); }
  if (ch) { for (let k = 0; k < 5; k++) { const x = (hash(v, k) & 15), y = k < 2 ? 3 : (k < 4 ? 8 : 13); px(g, ox + x, oy + y, k & 1 ? '#ff6b2c' : '#c9462a'); }   // embers in the joints
    for (let x = 0; x < 16; x += 3) { if (hash(v + 9, x) & 1) { px(g, ox + x, oy, P.d); px(g, ox + x + 1, oy, P.e); } }                                  // a split, ragged top edge
    px(g, ox + 7, oy + 16, '#c9462a'); }
}
function loftCell(g, ox, oy, v, ch) {
  const P = ch ? CHAR : OAK, h = hash(v, ch ? 21 : 11);
  R(g, ox, oy, 16, 3, P.a); R(g, ox, oy, 16, 1, P.top); R(g, ox, oy + 1, 16, 1, P.hl === OAK.hl ? OAK.top : P.hl); R(g, ox, oy + 2, 16, 1, P.d);   // the floor plank's edge
  R(g, ox, oy + 3, 16, 10, P.b); R(g, ox, oy + 3, 16, 1, P.e);                                                         // the great beam
  for (let y = 5; y < 12; y += 3) R(g, ox, oy + y + (v & 1), 16, 1, P.c);                                              // grain
  R(g, ox, oy + 12, 16, 1, P.e); R(g, ox, oy + 13, 16, 3, P.d); R(g, ox, oy + 13, 16, 1, P.c);                         // the shadowed under-beam
  for (const x of [2, 10]) { R(g, ox + x, oy + 5, 4, 5, ch ? '#1c1c22' : IRON.b); R(g, ox + x, oy + 5, 4, 1, ch ? '#2c2e3b' : IRON.a); px(g, ox + x + 1, oy + 7, ch ? '#4a4a56' : IRON.hl); px(g, ox + x + 2, oy + 8, ch ? '#2c2e3b' : IRON.a); }   // bolt plates
  R(g, ox + (v & 1 ? 12 : 1), oy + 13, 1, 3, P.e);                                                                      // a joint
  const kx = v & 1 ? 9 : 3; for (let k = 0; k < 4; k++) R(g, ox + kx + k, oy + 16 + k, 8 - 2 * k - (v & 1 ? 0 : 0), 1, k < 2 ? P.c : P.e);   // a bracket knee under the beam (tapering)
  if (ch) { for (let k = 0; k < 5; k++) { const x = (hash(v + 5, k) & 15), y = k < 2 ? 2 : (k < 4 ? 8 : 12); px(g, ox + x, oy + y, k & 1 ? '#ff6b2c' : '#c9462a'); }
    for (let x = 1; x < 16; x += 4) { if (hash(v + 1, x) & 1) { R(g, ox + x, oy, 2, 1, P.e); } } }
  void h;
}
const roofCell = (g, ox, oy, v, cap) => {   // oy = the cell's top; the sheet leaves TA.roofTop px above for the newel post
  R(g, ox, oy, 16, 1, '#c8c8dc'); R(g, ox, oy + 1, 16, 1, S.g); R(g, ox, oy + 2, 16, 1, S.f); R(g, ox, oy + 3, 16, 1, S.b);       // the lead ridge
  for (let k = 0; k < 3; k++) { const y = oy + 4 + 4 * k, off = (hash(v, k) % 6) + 1, base = [S.c, S.d, S.b][(v + k) % 3];
    R(g, ox, y, 16, 4, base); R(g, ox, y, 16, 1, S.e); R(g, ox, y + 3, 16, 1, S.dk);
    R(g, ox + off, y, 1, 3, S.dk); R(g, ox + off + 8 > 15 ? off - 8 : off + 8, y, 1, 3, S.dk);                                       // the slates' joints
    px(g, ox + (hash(v, k + 4) % 14) + 1, y + 1, S.f); }
  R(g, ox, oy + 16, 16, 1, S.dk); for (const x of [1, 5, 9, 13]) { R(g, ox + x, oy + 17, 2, 2, S.a); }                                 // eaves teeth
  if (cap === 'L' || cap === 'R') { const px0 = cap === 'L' ? ox : ox + 12;                                                           // the newel post: stone, a gold finial
    R(g, px0, oy - 8, 4, 8, S.d); R(g, px0, oy - 8, 1, 8, S.f); R(g, px0 + 3, oy - 8, 1, 8, S.b); R(g, px0 - (cap === 'L' ? 0 : 0), oy - 9, 4, 1, S.g);
    R(g, px0 + 1, oy - 11, 2, 2, '#e0b040'); px(g, px0 + 1, oy - 11, '#fff6c8'); px(g, px0 + 1, oy - 12, '#a0781c'); R(g, px0 + (cap === 'L' ? 0 : 3), oy - 8, 1, 8, cap === 'L' ? S.f : S.b);
    R(g, cap === 'L' ? ox : ox + 15, oy, 1, 16, S.dk); }
  if (cap === 'H') { R(g, ox + 2, oy + 3, 12, 13, '#0a0608'); R(g, ox + 2, oy + 3, 12, 1, S.dk); R(g, ox + 2, oy + 3, 1, 13, S.a); R(g, ox + 13, oy + 3, 1, 13, S.e);   // (S2 alone) the ladder's own tile is a hatch with the top rungs showing
    for (const y of [7, 11, 15]) { R(g, ox + 3, oy + y, 10, 1, '#c9a05a'); R(g, ox + 3, oy + y + 1, 10, 1, '#5a3a20'); } R(g, ox + 3, oy + 3, 1, 13, OAK.top); R(g, ox + 12, oy + 3, 1, 13, OAK.c); }
};
// soot on stone (the deck, the parapet walks) where a span burns: alpha pixels, drawn over the slate cell
function sootCell(g, ox, oy, v) {
  const h = (x, y) => hash(v * 31 + x, y);
  for (let y = 0; y < 9; y++) for (let x = 0; x < 16; x++) { if ((h(x, y) % 100) < (1 - y / 9) * 100 + (y < 2 ? 40 : 0)) { g.globalAlpha = y < 3 ? 0.92 : 0.62; px(g, ox + x, oy + y, y < 2 ? '#050303' : '#0a0608'); } }
  g.globalAlpha = 1;
  for (let k = 0; k < 4; k++) { const x = h(k, 77) % 16, y = 2 + (h(k, 78) % 5); px(g, ox + x, oy + y, k & 1 ? '#ff6b2c' : '#c9462a'); }
}
// the scorch cap: charred splinters tapering off the span's end, drawn over the unburnt neighbour (tallest at the span, 6 px wide)
const EDGE_H = [2, 3, 5, 8, 11, 14];
function edgeCell(g, ox, oy, left) {
  for (let i = 0; i < 6; i++) { const x = left ? i : 5 - i, hh = EDGE_H[left ? i : i]; const xx = left ? i : 5 - i;
    R(g, ox + xx, oy, 1, hh + (hash(i, 3) & 1), i > 3 ? '#0a0605' : '#140d0a'); R(g, ox + xx, oy, 1, 1, '#050303'); if (i & 1) px(g, ox + xx, oy + hh, '#c9462a'); void x; }
}
// a ladder of n rows (16 x 16n): oak rails, pale iron-shod rungs on a dark trunking, hooks on top and shoes at the foot. lit = the gold look (drawn over it at an alpha)
function ladderImg(n, lit) {
  const [c, g] = canvas(16, 16 * n, true), H = 16 * n;
  const rail1 = lit ? '#ffe8a0' : OAK.hl, rail2 = lit ? '#e0b040' : OAK.b, rung1 = lit ? '#fff6c8' : '#f0d498', rung2 = lit ? '#e0b040' : '#8a6a3c';
  if (!lit) { R(g, 2, 0, 12, H, '#2a1e22'); R(g, 2, 0, 1, H, '#3a2c2c'); R(g, 13, 0, 1, H, '#0a0608'); for (let y = 6; y < H; y += 16) R(g, 3, y, 10, 1, '#1a1210'); }                  // the dark trunking behind
  R(g, 3, 0, 2, H, rail2); R(g, 3, 0, 1, H, rail1); R(g, 11, 0, 2, H, rail2); R(g, 12, 0, 1, H, lit ? '#e0b040' : OAK.c);                                          // the rails
  for (let y = 3; y < H - 2; y += 4) { R(g, 5, y, 6, 2, rung2); R(g, 5, y, 6, 1, rung1); if (!lit) { px(g, 5, y + 1, IRON.a); px(g, 10, y + 1, IRON.a); } }          // the rungs
  R(g, 1, 0, 5, 3, lit ? '#e0b040' : IRON.a); R(g, 10, 0, 5, 3, lit ? '#e0b040' : IRON.a); R(g, 1, 0, 5, 1, lit ? '#fff6c8' : IRON.hl); R(g, 10, 0, 5, 1, lit ? '#fff6c8' : IRON.hl);   // the hooks at the top
  R(g, 2, H - 3, 3, 3, lit ? '#e0b040' : IRON.b); R(g, 11, H - 3, 3, 3, lit ? '#e0b040' : IRON.b);                                                                     // the shoes at the foot
  return c;
}

// ---------------------------------------------------------------- the sheets, baked one a frame
const SH = { hoard: null, loft: null, roof: null, soot: null, edge: null, lad: new Map(), litLad: new Map(), n: 0, fail: false };
const QUEUE = [
  () => { const [c, g] = canvas(16 * 8, TA.hoardH, true); for (let v = 0; v < 4; v++) { hoardCell(g, v * 16, 0, v, false); hoardCell(g, (v + 4) * 16, 0, v, true); } SH.hoard = c; },
  () => { const [c, g] = canvas(16 * 8, TA.hoardH, true); for (let v = 0; v < 4; v++) { loftCell(g, v * 16, 0, v, false); loftCell(g, (v + 4) * 16, 0, v, true); } SH.loft = c; },
  () => { const [c, g] = canvas(16 * 6, TA.roofH, true); roofCell(g, 0, TA.roofTop, 0, 'L'); for (let v = 1; v < 4; v++) roofCell(g, v * 16, TA.roofTop, v, 'M'); roofCell(g, 64, TA.roofTop, 4, 'R'); roofCell(g, 80, TA.roofTop, 2, 'H'); SH.roof = c; },
  () => { const [c, g] = canvas(16 * 4, 16, true); for (let v = 0; v < 4; v++) sootCell(g, v * 16, 0, v); SH.soot = c; },
  () => { const [c, g] = canvas(16, 20, true); edgeCell(g, 0, 0, true); edgeCell(g, 8, 0, false); SH.edge = c; },
  () => { for (const n of [4, 5]) { SH.lad.set(n, ladderImg(n, false)); SH.litLad.set(n, ladderImg(n, true)); } },
];
/* bake the next sheet (ONE per call; the caller calls it once a frame from the roof entry on). true = everything is baked (or there is no canvas to bake on) */
export function bakeStep() {
  if (SH.fail || typeof document === 'undefined') return false;
  if (SH.n >= QUEUE.length) return true;
  try { QUEUE[SH.n++](); } catch (e) { SH.fail = true; return false; }
  return SH.n >= QUEUE.length;
}
export const ready = () => !SH.fail && typeof document !== 'undefined' && SH.n >= QUEUE.length;
const ladFor = (n, lit) => { const m = lit ? SH.litLad : SH.lad; let c = m.get(n); if (!c) { try { c = ladderImg(n, lit); m.set(n, c); } catch (e) { SH.fail = true; return null; } } return c; };

const cellX = (c, cx) => c * 16 - cx;
const cellVar = (c, row) => (hash(c, row) >>> 3) & 3;
const inView = (x, VW) => x > -16 && x < VW + 8;

/* a run of intact cells of one material on one tile row: mat 'hoard' | 'loft'; cols ca..cb. g = the picture, cx / cy = the camera, VW / VH = the picture's size */
export function floorRun(g, mat, ca, cb, row, cx, cy, VW, VH) {
  if (!ready()) return false; const sheet = mat === 'loft' ? SH.loft : SH.hoard, y = row * 16 - cy; if (y < -24 || y > VH + 8) return true;
  const a = Math.max(ca, Math.floor(cx / 16) - 1), b = Math.min(cb, Math.ceil((cx + VW) / 16) + 1);
  for (let c = a; c <= b; c++) g.drawImage(sheet, cellVar(c, row) * 16, 0, 16, TA.hoardH, cellX(c, cx), y, 16, TA.hoardH);
  return true;
}
/* the bell-cage roof: cols c0..c1 (the end caps carry the newel posts); hatchCol >= 0 = (S2 alone) the ladder's own tile */
export function roofRun(g, c0, c1, row, cx, cy, VW, VH, hatchCol = -1) {
  if (!ready()) return false; const y = row * 16 - cy - TA.roofTop; if (y < -TA.roofH - 8 || y > VH + 8) return true;
  const a = Math.max(c0, Math.floor(cx / 16) - 1), b = Math.min(c1, Math.ceil((cx + VW) / 16) + 1);
  for (let c = a; c <= b; c++) { const k = c === hatchCol ? 5 : c === c0 ? 0 : c === c1 ? 4 : 1 + ((c * 7 + row) % 3 + 3) % 3; g.drawImage(SH.roof, k * 16, 0, 16, TA.roofH, cellX(c, cx), y, 16, TA.roofH); }
  return true;
}
/* a burning / smouldering span of cells (cols ca..cb on tile row `row`): timber cells ta..tb of it are charred oak (mat), the others scorched stone. p = how far the char has come (0..1; 1 = burnt),
   t = the clock (the ember joint pulses, quicker as p climbs). The span's two ends get a scorch cap. */
export function burnRun(g, mat, ca, cb, ta, tb, row, p, t, cx, cy, VW, VH, i = 0) {
  if (!ready()) return false; const y = row * 16 - cy; if (y < -24 || y > VH + 8) return true;
  const a = Math.max(ca, Math.floor(cx / 16) - 1), b = Math.min(cb, Math.ceil((cx + VW) / 16) + 1), sheet = mat === 'loft' ? SH.loft : SH.hoard;
  for (let c = a; c <= b; c++) { const x = cellX(c, cx), v = cellVar(c, row);
    if (c >= ta && c <= tb) { g.globalAlpha = p; g.drawImage(sheet, (v + 4) * 16, 0, 16, TA.hoardH, x, y, 16, TA.hoardH); g.globalAlpha = 1; }
    else { g.globalAlpha = Math.min(1, p * 1.2); g.drawImage(SH.soot, v * 16, 0, 16, 16, x, y, 16, 16); g.globalAlpha = 1; } }
  const x0 = cellX(ca, cx), x1 = cellX(cb + 1, cx);                                                                    // the span's ends
  if (p > 0.15) { g.globalAlpha = Math.min(1, p); if (inView(x0 - 6, VW) && ca > 0) g.drawImage(SH.edge, 0, 0, 6, 20, x0 - 6, y, 6, 20); if (inView(x1, VW)) g.drawImage(SH.edge, 8, 0, 6, 20, x1, y, 6, 20); g.globalAlpha = 1; }
  const L0 = Math.max(x0 + 2, -8), L1 = Math.min(x1 - 2, VW + 8);                                                     // the pulsing ember joint (one rect) and a few rising embers
  if (L1 > L0) { g.globalAlpha = (0.25 + 0.55 * p) * (0.5 + 0.5 * Math.sin(t * (5 + 9 * p) + i)); R(g, L0, y + 3, L1 - L0, 1, '#ff6b2c'); R(g, L0, y + 11, L1 - L0, 1, '#ff9a5c'); g.globalAlpha = 1;
    for (let k = 0; k < 3 + ri(2 * p); k++) { const ph = (t * (0.5 + 0.3 * p) + k * 0.31 + i * 0.13) % 1, ex = L0 + ((k * 97 + i * 41) % Math.max(1, L1 - L0)); g.globalAlpha = (1 - ph) * (0.4 + 0.6 * p); R(g, ex, y - 2 - ph * 26, 1, 1, k & 1 ? '#ffd36b' : '#ff9a5c'); } g.globalAlpha = 1; }
  return true;
}
/* a ladder: foot..top = tile rows rowTop..rowTop + n - 1 in column col; lit = 0..1 the gold look's strength (0 = plain), glow > 0 adds the halo */
export function ladderDraw(g, col, rowTop, n, cx, cy, VW, VH, lit = 0) {
  if (!ready()) return false; const x = col * 16 - cx, y = rowTop * 16 - cy; if (x < -16 || x > VW + 8 || y < -16 * n - 8 || y > VH + 8) return true;
  const im = ladFor(n, false); if (!im) return false; g.drawImage(im, x, y);
  if (lit > 0) { const li = ladFor(n, true); if (li) { g.globalAlpha = lit; g.drawImage(li, x, y); g.globalAlpha = 1; } }
  return true;
}
/* the sheets, for the contact sheet / lint (tools/gq6s3art-sheet.mjs): the raw canvases, the cell makers */
export const _sheets = SH; export const _cells = { hoardCell, loftCell, roofCell, sootCell, edgeCell, ladderImg };
