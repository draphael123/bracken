// src/redraw/carousel_ring.js - THE WICKER QUEEN'S CAROUSEL, drawn (claude/fairboss). The ride itself is src/wicker-carousel.js (pure); this is only its
// look, in the fair's own kit (src/redraw/fair_world.js: the same painted horses, brass, and red-and-cream canopy as the ride on the road).
//   drawRingBack   under everything: the striped canopy over the whole green, the centre column with its band-organ pipes, the engine's firebox, the
//                  horses going round the BACK (small and dim, the other way), and the boards of the ring scrolling the ride's way
//   drawRingHorse  one FRONT horse, a platform: its brass pole from the canopy, the horse on it at its saddle's height
//   drawRingFire   over the dark: the floor told to burn (the boards glowing the length of the ride) and burning (a row of flame on the boards)
//   drawRingSickle her thrown sickle, spinning
import { HORSE } from './fair_world.js';
import { horseAt, RING } from '../wicker-carousel.js';

const TS = 16;
const C = { brass: '#e8c23a', brassD: '#a87a18', red: '#b8382c', redD: '#7a2418', cream: '#ece0c4', creamD: '#c8b890', gold: '#f0c840', wood: '#7a5230', woodD: '#4e321a', woodL: '#a67a48', iron: '#3a3a44', ironL: '#5a5a66' };
export const roofOf = r => r.floor - 8 * TS;   /* the canopy's valance, over the whole ride */

export function drawRingBack(g, cx, cy, VW, r, G, A, time, warn) {
  const fl = r.floor, roof = roofOf(r), x0 = A.x0 - 8, x1 = A.x1 + 8, w = x1 - x0, mx = G.maypole * TS + 8, fx = G.bonfire * TS + 8;
  if (x1 < cx - 20 || x0 > cx + VW + 20) return;
  const X = x => Math.round(x - cx), Y = y => Math.round(y - cy);
  // THE BACK OF THE RIDE: a dark painted rounding board behind everything, lit by its bulbs
  g.fillStyle = '#2a1a22'; g.fillRect(X(x0), Y(roof + 4), w, fl - roof - 4); g.fillStyle = '#3a2430'; for (let x = x0; x < x1; x += 32) g.fillRect(X(x), Y(roof + 4), 16, fl - roof - 4);
  g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(X(x0), Y(fl - 20), w, 20);
  // THE HORSES ROUND THE BACK: smaller, dimmer, going the other way, a little higher (further off)
  for (let i = 0; i < RING.horses; i++) { const h = horseAt(r, i); if (h.front) continue; const s = HORSE(i), k = 0.55 + 0.2 * (1 - h.back);
    const hx = X(h.x), hy = Y(h.y - 18 - 10 * h.back);
    g.save(); g.globalAlpha = 0.5; g.fillStyle = C.brassD; g.fillRect(hx, Y(roof + 6), 1, hy + 6 - Y(roof + 6));
    g.translate(hx, hy); g.scale(-k, k); g.drawImage(s, -12, 0); g.restore(); }
  // THE CENTRE COLUMN: painted panels, a mirror band, and the band organ's pipes at its foot
  g.fillStyle = C.woodD; g.fillRect(X(mx) - 7, Y(roof + 2), 14, fl - roof - 2); g.fillStyle = C.wood; g.fillRect(X(mx) - 7, Y(roof + 2), 3, fl - roof - 2);
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? C.red : C.cream; g.fillRect(X(mx) - 4, Y(roof + 10 + i * 18), 8, 13); g.fillStyle = C.gold; g.fillRect(X(mx) - 1, Y(roof + 13 + i * 18), 2, 7); }
  for (let i = 0; i < 6; i++) { const ph = Math.floor(time * 6 + i) % 3, hgt = 10 + ((i * 5) % 9); g.fillStyle = ph ? C.brass : '#fff2b0'; g.fillRect(X(mx) - 9 + i * 3, Y(fl - 22 - hgt), 2, hgt); g.fillStyle = C.brassD; g.fillRect(X(mx) - 9 + i * 3, Y(fl - 22 - hgt), 2, 1); }
  g.fillStyle = C.woodD; g.fillRect(X(mx) - 11, Y(fl - 22), 22, 22); g.fillStyle = C.red; g.fillRect(X(mx) - 10, Y(fl - 21), 20, 8); g.fillStyle = C.gold; g.fillRect(X(mx) - 10, Y(fl - 13), 20, 1);
  // THE ENGINE'S FIREBOX: an iron box under its chimney, its door open on the fire (the embers themselves are on the boards: main.js drawWickerGround)
  { const bx = X(fx), by = Y(fl); g.fillStyle = C.iron; g.fillRect(bx - 14, by - 22, 28, 20); g.fillStyle = C.ironL; g.fillRect(bx - 14, by - 22, 28, 2); g.fillRect(bx - 14, by - 22, 2, 20);
    const f = 0.5 + 0.5 * Math.sin(time * 9); g.fillStyle = f > 0.5 ? '#ffc850' : '#f08a28'; g.fillRect(bx - 8, by - 16, 16, 10); g.fillStyle = '#a01c10'; g.fillRect(bx - 8, by - 8, 16, 2);
    g.fillStyle = C.iron; for (let k = -6; k <= 6; k += 4) g.fillRect(bx + k, by - 16, 1, 10);
    g.fillStyle = C.iron; g.fillRect(bx + 6, Y(roof - 10), 5, by - 22 - Y(roof - 10)); g.fillStyle = C.ironL; g.fillRect(bx + 6, Y(roof - 10), 1, by - 22 - Y(roof - 10));
    for (let i = 0; i < 5; i++) { const t = (time * 0.4 + i / 5) % 1; g.globalAlpha = 0.35 * (1 - t); g.fillStyle = '#8a8698'; g.fillRect(bx + 7 + Math.round(Math.sin(time + i) * 3 * t), Y(roof - 12 - t * 30), 3, 3); } g.globalAlpha = 1; }
  // THE BOARDS OF THE RING: planks along the floor's top, their seams scrolling the ride's way (you can see it turn under you)
  g.fillStyle = '#5e3e24'; g.fillRect(X(x0), Y(fl), w, 3); g.fillStyle = '#8a6038'; g.fillRect(X(x0), Y(fl), w, 1);
  const off = ((r.u * RING.dir) % 24 + 24) % 24; g.fillStyle = '#3a2616'; for (let x = x0 - 24 + off; x < x1; x += 24) if (x >= x0) g.fillRect(X(x), Y(fl), 1, 3);
  // THE CANOPY: red and cream stripes the length of the ride, a scalloped valance, pennants, and its bulbs (red and beating when the ride is about to quicken)
  const stripes = Math.ceil(w / 8), spin = ((r.u * 0.5) % 16 + 16) % 16;
  for (let i = -2; i < stripes; i++) { const sx = X(x0 + i * 8 + (spin % 16 >= 8 ? 8 : 0)); if (sx < X(x0) - 8 || sx > X(x1)) continue; const c = i % 2 ? C.cream : C.red, cd = i % 2 ? C.creamD : C.redD;
    g.fillStyle = c; g.fillRect(sx, Y(roof - 10), 8, 13); g.fillStyle = cd; g.fillRect(sx, Y(roof - 10), 1, 13); g.fillStyle = c; g.fillRect(sx + 1, Y(roof + 3), 6, 3); g.fillRect(sx + 2, Y(roof + 6), 4, 1); }
  g.fillStyle = C.gold; g.fillRect(X(x0), Y(roof - 11), w, 2); g.fillStyle = C.woodD; g.fillRect(X(x0), Y(roof - 30), w, 19); g.fillStyle = C.red; for (let x = x0; x < x1; x += 20) g.fillRect(X(x) + 2, Y(roof - 27), 14, 12);
  g.fillStyle = C.gold; for (let x = x0; x < x1; x += 20) g.fillRect(X(x) + 8, Y(roof - 23), 2, 5);
  g.fillStyle = C.brassD; g.fillRect(X(mx) - 1, Y(roof - 52), 2, 22); g.fillStyle = C.gold; g.beginPath(); g.moveTo(X(mx) + 1, Y(roof - 52)); g.lineTo(X(mx) + 12, Y(roof - 48 + Math.sin(time * 4) * 1.5)); g.lineTo(X(mx) + 1, Y(roof - 44)); g.fill();
  for (let i = 0; i < stripes; i++) { const on = warn ? Math.floor(time * 8) % 2 === i % 2 : ((i * 7 + 3) % 11 !== 0 && Math.floor(time * 2 + i) % 4 !== 0);
    g.fillStyle = on ? (warn ? '#ff5a4a' : '#ffd36b') : '#5a4a32'; g.fillRect(X(x0 + i * 8 + 3), Y(roof + 8), 2, 2); }
}

/* one FRONT horse (a mover {x, y, w}: y is its saddle's top) on its pole */
export function drawRingHorse(g, m, cx, cy, r, i) {
  const roof = roofOf(r), mid = m.x + m.w / 2, hx = Math.round(mid - cx), top = Math.round(roof + 6 - cy), sy = Math.round(m.y - cy);
  g.fillStyle = C.brassD; g.fillRect(hx - 1, top, 3, sy - top + 18); g.fillStyle = C.brass; g.fillRect(hx - 1, top, 1, sy - top + 18);   /* its brass pole, through the horse */
  const s = HORSE(i || 0); if (RING.dir > 0) g.drawImage(s, hx - 12, sy - 8); else { g.save(); g.translate(hx, 0); g.scale(-1, 1); g.drawImage(s, -12, sy - 8); g.restore(); }
  g.fillStyle = C.gold; g.fillRect(hx - 6, sy - 1, 12, 1);   /* the saddle's gold edge: where you stand */
}

/* THE FLOOR BURNS: k is 0..1 through the tell (the boards glowing, brighter as it comes) or through the burn (flame the length of the ride) */
export function drawRingFire(g, cx, cy, VW, A, fl, mode, k, time) {
  const x0 = Math.max(A.x0, cx - 8), x1 = Math.min(A.x1, cx + VW + 8), y = Math.round(fl - cy);
  if (mode === 'floorTell') {
    g.globalCompositeOperation = 'lighter';
    for (let x = x0; x < x1; x += 2) { const f = 0.5 + 0.5 * Math.sin(time * 18 + x * 0.21); g.globalAlpha = Math.min(1, 0.25 + 0.6 * k) * (0.6 + 0.4 * f); g.fillStyle = f > 0.6 ? '#ffc850' : '#f06a20'; g.fillRect(Math.round(x - cx), y - 2, 2, 3); }
    g.globalAlpha = 0.18 + 0.3 * k; g.fillStyle = '#ff5a2a'; g.fillRect(Math.round(x0 - cx), y - 10, x1 - x0, 8); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    g.fillStyle = '#ff6b6b'; if (Math.floor(time * 10) % 2) g.fillRect(Math.round(x0 - cx), y - 11, x1 - x0, 1);   /* the red line: nothing below it is safe */
  } else if (mode === 'floor') {
    for (let x = x0 - (x0 % 6); x < x1; x += 6) { const f = Math.sin(time * 11 + x * 0.37) * 0.5 + 0.5, h = 8 + f * 9 * (1 - Math.abs(k - 0.5)), sx = Math.round(x - cx);
      g.fillStyle = '#a01c10'; g.fillRect(sx, y - Math.round(h * 0.5), 5, Math.round(h * 0.5)); g.fillStyle = '#f08a28'; g.fillRect(sx + 1, y - Math.round(h * 0.8), 3, Math.round(h * 0.5));
      g.fillStyle = '#ffc850'; g.fillRect(sx + 2, y - Math.round(h), 1, Math.round(h * 0.4)); }
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.25; g.fillStyle = '#ff7a2a'; g.fillRect(Math.round(x0 - cx), y - 22, x1 - x0, 22); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
}

/* her sickle, spinning (a crescent blade on a short haft) */
export function drawRingSickle(g, x, y, spin) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(spin * 18);
  g.strokeStyle = '#d8dce4'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 7, -0.3, Math.PI * 1.1); g.stroke();
  g.strokeStyle = '#8a919c'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, 5, 0, Math.PI); g.stroke();
  g.fillStyle = C.wood; g.fillRect(-1, -1, 7, 3); g.restore();
  g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.35; g.fillStyle = '#ff6b6b'; g.fillRect(Math.round(x) - 9, Math.round(y) - 1, 18, 2); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
