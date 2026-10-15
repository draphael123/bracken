// towpath_gear2.js - the rest of THE TOWPATH's machinery drawn (claude/towpath2art): the sack hoist's deck, a sunken mast's top, the aqueduct trough's sagging back plate.
import { TC } from './towpath_tiles.js';
const R = Math.round;
const rc = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), R(w), R(h)); };
const px1 = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
const line = (g, x0, y0, x1, y1, col, w = 1) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(R(x0) + 0.5, R(y0) + 0.5); g.lineTo(R(x1) + 0.5, R(y1) + 0.5); g.stroke(); g.lineWidth = 1; };

/* ============ THE SACK HOIST's DECK: a plank platform in iron bands, ropes up to the sheaves under the roof (py: their screen y) ============ */
export function drawHoistDeck(g, x, y, w, py, time) {
  for (const rx of [x + 8, x + w - 8]) { line(g, rx, y, rx, py, '#0a0806', 3); line(g, rx, y, rx, py, '#6a6a50', 1); }
  rc(g, x, y, w, 5, '#0a0c0c'); rc(g, x + 1, y, w - 2, 4, TC.wood3); rc(g, x + 1, y, w - 2, 1, TC.wood4); for (let i = 7; i < w - 2; i += 8) rc(g, x + i, y + 1, 1, 3, TC.wood1);
  rc(g, x, y + 4, w, 2, TC.iron1); rc(g, x, y + 4, w, 1, TC.iron2); rc(g, x + 6, y - 3, 2, 3, TC.iron1); rc(g, x + w - 8, y - 3, 2, 3, TC.iron1);   /* the bridle's eyes */
}
/* ============ A MAST (the sunken barges'): only its top works - the ratline tile (src/redraw/towpath_tiles.js) is the climb ============ */
export function drawMastTop(g, x, y, tall, time) {   /* y: the pole's top */
  rc(g, x - 5, y + 2, 11, 2, '#161410'); rc(g, x - 5, y + 2, 11, 1, '#4a4a38'); rc(g, x - 1, y - 6, 3, 8, '#161410');
  line(g, x - 5, y + 3, x - 14, y + 18, '#2a2a22'); line(g, x + 5, y + 3, x + 14, y + 18, '#2a2a22');
  const fl = Math.sin(time * 2.4 + x) * 2; for (let i = 0; i < 6; i++) rc(g, x + 2 + i, y + 5 + i + (i > 3 ? fl : 0), 1, 7 - i, '#2a2a22');   /* the sail's tatter */
  if (tall) { rc(g, x, y - 14, 1, 8, '#161410'); for (let i = 0; i < 8; i++) rc(g, x + 1 + i, y - 14 + Math.round(Math.sin(time * 4 + i * 0.7)), 1, 3 - Math.floor(i / 3), '#7a2a26'); }
}
/* ============ THE TROUGH's far wall: riveted plates under a flanged lip; the plate sags through the break (brk0..brk1, screen x) ============ */
export function drawTroughPlate(g, x0, x1, bedY, brk0, brk1, time) {
  const sag = x => (x > brk0 && x < brk1 ? Math.round(Math.sin((x - brk0) / (brk1 - brk0) * Math.PI) * 16) : 0);
  for (let x = x0; x < x1; x += 4) { const off = sag(x), k = ((x - x0) / 4) | 0;
    rc(g, x, bedY - 48 + off, 4, 48, '#10161a'); if (k % 6 === 0) rc(g, x, bedY - 48 + off, 1, 48, '#0a0e10'); if (k % 6 === 1) rc(g, x, bedY - 48 + off, 1, 48, TC.iron1);
    rc(g, x, bedY - 50 + off, 4, 3, TC.iron2); rc(g, x, bedY - 50 + off, 4, 1, TC.iron3); if (k % 3 === 0) { px1(g, x + 1, bedY - 40 + off, '#3a444c'); px1(g, x + 1, bedY - 24 + off, '#3a444c'); }
    for (let yy = 15; yy < 48; yy += 16) rc(g, x, bedY - 48 + off + yy, 4, 1, '#0a0e10'); }
  for (let x = x0 + 14; x < x1; x += 56) { const off = sag(x); rc(g, x, bedY - 48 + off, 3, 48, '#1a2026'); rc(g, x, bedY - 48 + off, 1, 48, TC.iron2); }
}
