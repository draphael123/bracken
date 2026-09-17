// cabins.js — ROOMS OF THEIR OWN BELOW DECKS. Every ship interior in the game was the same planked wall with a gunport and a
// lantern every 120 px, so a galley, a powder room and the captain's own cabin were one long corridor. A cabin is a stretch of
// an interior that says what it is (L.cabins: [x0, x1, top row, floor row, kind] in tiles), dressed on its back wall behind the play:
//   galley    the brick firebox and its hood, the copper on it, pots and ladles on a rail, onions and a ham, the block and the casks
//   magazine  copper-sheeted walls, kegs racked three high, shot in pyramids, rammers, and the lamp behind its glass (no flame in here)
//   brig      iron-barred cells with straw in them, chains and irons on the wall, the bucket, the keys on their hook
//   cabin     the stern windows, the chart table with a chart held down and the candle on it, a chart on the wall, books, the bunk
//   chart     the chart room: the table, the charts pinned up and rolled in their rack, the lamp
// Baked once per cabin (bakeCabin), then its few live things drawn on the game clock (drawCabinLife): the galley fire, the
// candle, the lamps. Everything is a step darker than the play and sits on the wall, never on the floor you walk.
import { canvas } from '../px.js';

const W = { d: '#1a120c', m: '#2e2218', l: '#3e2e20', hi: '#56402a', rim: '#6e5436' };
const IRON = { d: '#1c1e22', m: '#34383e', l: '#50565e', hi: '#6e767e' };
const CU = { d: '#4a2a18', m: '#6e4028', l: '#8e5a34', hi: '#b87a48' };
const h01 = (a, b) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };

/* grid: (tx, ty) -> true where the wall is open (not solid) so a piece is never half inside a bulkhead */
export function bakeCabin(kind, x0, x1, y0, floorRow, TS, open) {
  const w = (x1 - x0 + 1) * TS, H = (floorRow - y0) * TS, [c, g] = canvas(w, H), life = [];
  const R = (x, y, ww, hh, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(ww), Math.round(hh)); };
  const fits = (px0, ww, hh) => { for (let tx = Math.floor(px0 / TS); tx <= Math.floor((px0 + ww - 1) / TS); tx++) for (let ty = Math.floor((H - hh) / TS); ty < H / TS; ty++) if (!open(x0 + tx, y0 + ty)) return false; return px0 >= 0 && px0 + ww <= w && hh <= H - 2; };
  const F = H;   /* the floor line in the canvas */
  const lamp = (x, y) => { R(x, 0, 1, y, W.m); life.push(['lamp', x, y]); };
  const keg = (x, y, s = 1) => { R(x, y, 10 * s, 12 * s, W.hi); R(x, y, 10 * s, 1, '#8a6c46'); R(x, y + 2 * s, 10 * s, 1, IRON.m); R(x, y + 9 * s, 10 * s, 1, IRON.m); R(x + 9 * s, y, 1, 12 * s, W.d); R(x + 2 * s, y + 5 * s, 2, 2, W.hi); };

  if (kind === 'galley') {
    for (let px0 = 8; px0 < w - 60; px0 += 150) {
      if (fits(px0, 40, 40)) {   /* the firebox: brick, an iron door with the fire in it, the hood and its pipe to the deck */
        for (let yy = F - 30; yy < F; yy += 4) for (let xx = px0 + ((yy >> 2) & 1 ? 0 : 4); xx < px0 + 38; xx += 8) { R(xx, yy, 7, 3, h01(xx, yy) < 0.3 ? '#5a2e22' : '#6e3a2a'); }
        R(px0, F - 31, 38, 2, '#3a2a24'); R(px0 + 11, F - 18, 16, 12, IRON.d); R(px0 + 12, F - 17, 14, 10, '#2a0e08'); life.push(['fire', px0 + 13, F - 10]);
        R(px0 - 2, F - 38, 42, 6, IRON.m); R(px0 - 2, F - 38, 42, 1, IRON.hi); R(px0 + 16, 0, 6, F - 38, IRON.m); R(px0 + 16, 0, 1, F - 38, IRON.l);
        R(px0 + 26, F - 44, 12, 8, CU.m); R(px0 + 26, F - 44, 12, 1, CU.hi); R(px0 + 28, F - 46, 8, 2, CU.d);   /* the copper on the hob */
      }
      if (fits(px0 + 48, 70, 30)) {   /* the rail of pots and ladles, the onions and the ham, the block with its cleaver and a fish on it */
        R(px0 + 48, 6, 64, 2, IRON.m);
        for (let k = 0; k < 5; k++) { const hx = px0 + 52 + k * 12; R(hx, 8, 1, 3, IRON.l); if (k & 1) { R(hx - 3, 11, 7, 6, CU.m); R(hx - 3, 11, 7, 1, CU.hi); } else { R(hx, 11, 1, 8, IRON.l); R(hx - 1, 19, 3, 2, IRON.l); } }
        for (let k = 0; k < 4; k++) R(px0 + 116, 4 + k * 5, 4, 4, k & 1 ? '#c8a060' : '#b08a48'); R(px0 + 117, 0, 1, 4, '#8a6a3a');
        R(px0 + 126, 0, 1, 6, '#8a6a3a'); R(px0 + 123, 6, 7, 11, '#8a3a2a'); R(px0 + 124, 7, 3, 4, '#b85a40'); R(px0 + 123, 16, 7, 2, '#e8d0b0');
        R(px0 + 52, F - 16, 40, 4, W.hi); R(px0 + 52, F - 16, 40, 1, W.rim); R(px0 + 54, F - 12, 3, 12, W.m); R(px0 + 87, F - 12, 3, 12, W.m);
        R(px0 + 62, F - 19, 14, 3, '#8a94a0'); R(px0 + 76, F - 18, 2, 2, '#8a94a0'); R(px0 + 80, F - 22, 6, 3, IRON.l); R(px0 + 84, F - 20, 2, 4, W.hi);
      }
      if (fits(px0 + 100, 24, 14)) { keg(px0 + 100, F - 12); keg(px0 + 111, F - 12); }
    }
  } else if (kind === 'magazine') {
    R(0, 0, w, H, 'rgba(142,90,52,0.16)');   /* copper-sheeted, against the sparks */
    for (let xx = 0; xx < w; xx += 24) R(xx, 0, 1, H, 'rgba(40,20,10,0.5)'); for (let yy = 6; yy < H; yy += 18) for (let xx = 4; xx < w; xx += 24) R(xx, yy, 1, 1, CU.hi);
    for (let px0 = 6; px0 < w - 40; px0 += 110) {
      if (fits(px0, 38, 40)) { R(px0 - 2, F - 38, 40, 2, W.hi); R(px0 - 2, F - 25, 40, 2, W.hi);   /* the rack, three high */
        for (let k = 0; k < 3; k++) keg(px0 + k * 12, F - 12); for (let k = 0; k < 3; k++) keg(px0 + k * 12, F - 24 - 1); for (let k = 0; k < 3; k++) keg(px0 + k * 12, F - 37 - 1 + 1); }
      if (fits(px0 + 46, 22, 12)) for (let r = 0; r < 3; r++) for (let k = 0; k <= 2 - r; k++) { const bx = px0 + 48 + k * 6 + r * 3, by = F - 5 - r * 4; R(bx, by, 5, 5, IRON.m); R(bx + 1, by, 2, 1, IRON.hi); }
      if (fits(px0 + 74, 10, 40)) { R(px0 + 74, F - 42, 2, 42, W.hi); R(px0 + 72, F - 44, 6, 4, '#6a5a44'); R(px0 + 80, F - 38, 2, 38, W.l); R(px0 + 79, F - 40, 4, 3, IRON.l); }
      if (fits(px0 + 90, 14, 30)) { R(px0 + 88, F - 34, 14, 14, IRON.d); R(px0 + 89, F - 33, 12, 12, 'rgba(150,170,180,0.35)'); life.push(['glass', px0 + 95, F - 27]);   /* the light-room: a lamp behind glass, lit from outside */
        R(px0 + 90, F - 46, 10, 8, '#8a2a24'); R(px0 + 94, F - 44, 2, 4, '#e8c060'); R(px0 + 91, F - 45, 8, 1, '#e8d0b0'); R(px0 + 91, F - 40, 8, 1, '#e8d0b0'); }   /* and the red plaque: no flame */
    }
  } else if (kind === 'brig') {
    for (let px0 = 4; px0 < w - 50; px0 += 64) {
      if (!fits(px0, 56, Math.min(46, H - 4))) continue;
      const top = F - Math.min(46, H - 4);
      R(px0, F - 3, 56, 3, '#8a7a40'); for (let k = 0; k < 14; k++) R(px0 + 2 + h01(px0, k) * 50, F - 4 - (k % 2), 4, 1, '#b8a058');   /* straw */
      R(px0 + 20, top + 10, 1, 8, IRON.l); R(px0 + 18, top + 18, 5, 3, IRON.m); R(px0 + 34, top + 12, 1, 6, IRON.l); R(px0 + 32, top + 18, 5, 3, IRON.m);   /* irons on the wall */
      R(px0 + 42, F - 9, 8, 8, W.l); R(px0 + 42, F - 9, 8, 1, IRON.l);   /* the bucket */
      R(px0, top, 56, 3, IRON.m); R(px0, top, 56, 1, IRON.hi); R(px0, F - 4, 56, 2, IRON.m);
      for (let xx = px0 + 2; xx < px0 + 56; xx += 6) { R(xx, top + 3, 2, F - top - 7, IRON.d); R(xx, top + 3, 1, F - top - 7, IRON.m); }
      R(px0 + 22, top + 20, 8, 6, IRON.d); R(px0 + 23, top + 21, 3, 2, IRON.hi);   /* the lock */
      if (fits(px0 + 57, 6, 30)) { R(px0 + 59, top + 8, 2, 2, IRON.hi); R(px0 + 58, top + 10, 4, 4, '#b8962a'); R(px0 + 59, top + 14, 1, 4, '#b8962a'); }   /* the keys, out of reach */
    }
  } else if (kind === 'cabin' || kind === 'chart') {
    let px0 = 6;
    if (kind === 'cabin' && fits(px0, 60, Math.min(38, H - 4))) {   /* the stern windows: leaded lights, the weather in them */
      const hh = Math.min(30, H - 12), y = Math.max(4, F - hh - 12);
      R(px0, y - 2, 60, hh + 4, W.hi); for (let k = 0; k < 3; k++) { R(px0 + 3 + k * 19, y, 16, hh, '#3a4a58'); R(px0 + 3 + k * 19, y + hh - 4, 16, 4, '#4a5a66'); for (let yy = y + 4; yy < y + hh; yy += 5) R(px0 + 3 + k * 19, yy, 16, 1, IRON.d); R(px0 + 10 + k * 19, y, 1, hh, IRON.d); }
      life.push(['window', px0, y, 60, hh]); px0 += 72;
    }
    for (; px0 < w - 30; px0 += 120) {
      if (fits(px0, 44, 24)) {   /* the chart table, a chart held flat by the dividers and a book, and the candle */
        R(px0, F - 16, 44, 4, W.hi); R(px0, F - 16, 44, 1, W.rim); R(px0 + 3, F - 12, 3, 12, W.m); R(px0 + 38, F - 12, 3, 12, W.m); R(px0 + 20, F - 12, 4, 12, W.l);
        R(px0 + 6, F - 18, 26, 2, '#b8a47c'); R(px0 + 10, F - 18, 8, 1, '#8a6a4a'); R(px0 + 34, F - 20, 6, 4, '#6a2a24'); R(px0 + 14, F - 19, 1, 1, IRON.l); R(px0 + 17, F - 19, 1, 1, IRON.l);
        R(px0 + 4, F - 21, 2, 5, '#e8e0c8'); life.push(['candle', px0 + 4, F - 23]);
      }
      if (fits(px0 + 50, 34, 30)) {   /* a chart on the wall: the coast, the soundings, a rhumb line */
        const y = Math.max(3, F - 40); R(px0 + 50, y, 32, 22, '#a8966e'); R(px0 + 50, y, 32, 1, '#c0ae86'); R(px0 + 81, y, 1, 22, '#8a7a5a');
        for (let k = 0; k < 12; k++) R(px0 + 52 + k * 2, y + 6 + Math.round(Math.sin(k * 0.9) * 3), 2, 1, '#6a5a3a');
        R(px0 + 54, y + 15, 24, 1, '#a84a3a'); for (let k = 0; k < 6; k++) R(px0 + 56 + h01(px0, k) * 22, y + 4 + h01(k, px0) * 15, 1, 1, '#5a6a8a'); R(px0 + 66, y + 3, 1, 1, '#2a2a2a');
      }
      if (kind === 'chart' && fits(px0 + 88, 26, 34)) { R(px0 + 88, F - 34, 26, 34, W.m); for (let r = 0; r < 3; r++) { R(px0 + 88, F - 34 + r * 11, 26, 1, W.rim); for (let k = 0; k < 5; k++) { R(px0 + 90 + k * 5, F - 31 + r * 11, 4, 4, '#a8966e'); R(px0 + 91 + k * 5, F - 30 + r * 11, 2, 2, '#7e6e4e'); } } lamp(px0 + 116, Math.max(6, F - 40)); }
      if (kind === 'cabin' && fits(px0 + 88, 30, 26)) {   /* books, and the bunk behind its curtain */
        R(px0 + 88, F - 28, 26, 2, W.hi); for (let k = 0; k < 8; k++) R(px0 + 89 + k * 3, F - 36, 2, 8, ['#6a2a24', '#2a4a3a', '#5a4a2a', '#2a3a5a'][k & 3]);
        R(px0 + 86, F - 14, 32, 10, W.l); R(px0 + 86, F - 14, 32, 1, W.rim); R(px0 + 88, F - 12, 20, 4, '#c8b8a0'); R(px0 + 108, F - 22, 10, 18, '#6a2a2a'); R(px0 + 108, F - 22, 10, 1, '#8a3a3a');
        lamp(px0 + 64, Math.max(6, F - 46));
      }
    }
  }
  c.life = life; c.x0 = x0; c.y0 = y0; return c;
}

/* THE LIVE THINGS: the fire in the galley's box, the candle on the chart table, the lamps on their hooks swinging with her,
   the light moving in the stern windows. Each on its own clock, keyed by where it is. */
export function drawCabinLife(g, c, sx, sy, time, swing) {
  for (const [k, x, y, ww, hh] of c.life) {
    const X = sx + x, Y = sy + y, ph = h01(c.x0 * 16 + x, y);
    if (k === 'fire') { for (let i = 0; i < 4; i++) { const fh = 3 + Math.round(3 * Math.abs(Math.sin(time * (6 + i) + ph * 9 + i))); g.fillStyle = i & 1 ? '#f08a3a' : '#ffc050'; g.fillRect(X + 1 + i * 3, Y + 8 - fh, 2, fh); }
      g.globalAlpha = 0.12 + 0.05 * Math.sin(time * 9 + ph * 6); g.fillStyle = '#ff9a40'; g.fillRect(X - 10, Y - 12, 34, 28); g.globalAlpha = 1; }
    else if (k === 'candle') { const f = Math.sin(time * 11 + ph * 20) > 0; g.fillStyle = '#ffd070'; g.fillRect(X, Y - (f ? 1 : 0), 2, 2); g.fillStyle = '#fff0b0'; g.fillRect(X, Y + 1, 1, 1);
      g.globalAlpha = 0.1 + 0.03 * Math.sin(time * 7 + ph); g.fillStyle = '#ffc060'; g.fillRect(X - 7, Y - 6, 16, 14); g.globalAlpha = 1; }
    else if (k === 'lamp') { const sw = Math.round(Math.sin(time * 1.6 + ph * 6) * 2 * swing);
      g.fillStyle = '#34383e'; g.fillRect(X - 2 + sw, Y, 5, 6); g.fillStyle = '#ffd36b'; g.fillRect(X - 1 + sw, Y + 1, 3, 4);
      g.globalAlpha = 0.1; g.fillStyle = '#ffd36b'; g.fillRect(X - 12 + sw, Y - 8, 26, 22); g.globalAlpha = 1; }
    else if (k === 'glass') { g.globalAlpha = 0.35 + 0.1 * Math.sin(time * 2 + ph); g.fillStyle = '#ffd890'; g.fillRect(X - 3, Y - 3, 6, 6); g.globalAlpha = 1; }
    else if (k === 'window') { const t = (time * 12 + ph * 50) % (ww + 30) - 15; g.globalAlpha = 0.18; g.fillStyle = '#c8d8e0'; g.fillRect(X + Math.max(0, Math.round(t)), Y, Math.max(0, Math.min(8, ww - Math.round(t))), hh); g.globalAlpha = 1; }
  }
}
