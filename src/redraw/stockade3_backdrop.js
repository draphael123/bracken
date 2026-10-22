// src/redraw/stockade3_backdrop.js - THE STOCKADE's OWN far + mid parallax layers and dusk (claude/stockade3, Daniel 10-22: "visually still needs work"). The camp wore the shared
// forest's far hills; it now has the goblins' camp on its skyline, area by area (L.stockade.areas, tiles): a dusk that still has a sunset in it (a banded horizon glow, thin violet
// cloud streaks), a FAR palisade (0.15) - lashed wall runs of uneven sharpened logs, watch towers with a lit deck and a pennant, a barred gate now and then - that grows more
// continuous the deeper you go, smoke columns from the camp's far fires, and a MID camp (0.30) - tents with a lit door, hide racks, kennel roofs, war poles with skulls, a nearer
// wall run with a torch, a big tower - every static picture baked ONCE; a frame is ~30 drawImage calls. Colours stay dim and bluish so foes, hazards and pickups pop (readability
// first). ART ONLY: no tile, hitbox or entity changes. Also the near campsmoke (drawSmoke) that the ground fires and braziers rise into.
//   drawFarMid(g, cx, cy, VW, VH, L, time, dY, full)      drawSmoke(g, srcs, cx, cy, VW, time)
import { canvas, mulberry, fillPoly } from '../px.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };

/* the palette: night-blue wood, a dying sunset on the sharp edges, amber in the windows */
const FAR = { body: '#2a2b4c', lit: '#3a3a66', dark: '#1f2040', rim: '#8a5560', roof: '#222342', amber: '#ffb35a', amberHi: '#ffe3a0', flag: '#8a2f3a' };
const MIDC = { body: '#242744', lit: '#363a62', dark: '#1a1c36', rim: '#6a4a5e', canvas: '#2e3052', canvasLit: '#454a76', hide: '#4a3a46', amber: '#ffb35a', skull: '#8a88a0' };

/* THE AREAS (tiles), the wall's presence: the outer camp is a forest with a camp in it, the wall thickens with the Yard and is unbroken by the kennels */
const wallK = t => Math.max(0, Math.min(1, (t - 36) / 150));
const AREAS = [[0, 131, 'outer'], [131, 226, 'yard'], [226, 334, 'wall'], [334, 378, 'tunnel'], [378, 9999, 'towers']];
const areaOf = t => { for (const [a, b, k] of AREAS) if (t < b) return k; return 'towers'; };

/* ------------------------------------------------------------------ baked pieces ------------------------------------------------------------------ */
/* a run of lashed, sharpened logs 3 px wide, `w` wide, `h` tall, tips uneven; v = 3 is a barred gate with an arch and two lit sconces */
function bakeWall(v, w, h, C, tall) {
  const [c, g] = canvas(w, h), r = mulberry(v * 31 + w + (tall ? 7 : 0));
  const top0 = tall ? 4 : 6;
  for (let x = 0; x < w; x += 3) { const t = top0 + ((r() * 4) | 0) + (x % 9 === 0 ? 3 : 0);
    R(g, C.body, x, t + 3, 3, h - t - 3); R(g, C.lit, x, t + 3, 1, h - t - 3); R(g, C.dark, x + 2, t + 3, 1, h - t - 3);
    R(g, C.body, x + 1, t + 1, 1, 3); R(g, C.lit, x + 1, t, 1, 1); R(g, C.rim, x, t + 2, 1, 1); }
  for (const y of [Math.round(h * 0.45), Math.round(h * 0.78)]) { R(g, C.dark, 0, y, w, 2); R(g, C.lit, 0, y, w, 1); for (let x = 2; x < w; x += 9) R(g, FAR.rim, x, y, 1, 1); }
  if (v === 3 && w >= 36) { const gx = (w >> 1) - 9; R(g, FAR.dark, gx, h - 26, 18, 26); R(g, '#171830', gx + 2, h - 24, 14, 24); R(g, C.dark, gx - 2, h - 30, 22, 4);
    for (const sx of [gx - 4, gx + 21]) { R(g, C.dark, sx, h - 24, 2, 12); R(g, FAR.amber, sx - 1, h - 27, 4, 3); R(g, FAR.amberHi, sx, h - 27, 2, 1); } }
  return c;
}
/* a watch tower: legs, X-braces, a lit deck behind a stake parapet, a peaked roof, a pennant */
function bakeTower(v, C, big) {
  const W = big ? 44 : 34, H = big ? 96 : 78, [c, g] = canvas(W, H), r = mulberry(v * 17 + 5), mx = W >> 1, deckY = big ? 40 : 32;
  for (const lx of [mx - 12, mx + 8]) { R(g, C.dark, lx, deckY, 5, H - deckY); R(g, C.lit, lx, deckY, 1, H - deckY); }
  for (let y = deckY + 4; y < H - 14; y += 16) { for (let k = 0; k < 18; k++) { const bx = mx - 10 + k, by = y + ((k * 12) / 18) | 0; R(g, C.dark, bx, by, 2, 2); R(g, C.dark, mx + 8 - k + 1, by, 2, 2); } }
  R(g, C.dark, mx - 15, deckY - 1, 30, 4); R(g, C.lit, mx - 15, deckY - 1, 30, 1);
  for (let x = mx - 14; x < mx + 14; x += 3) { const t = deckY - 11 - ((r() * 3) | 0); R(g, C.body, x, t + 2, 3, 10); R(g, C.lit, x, t + 2, 1, 10); R(g, C.body, x + 1, t, 1, 3); R(g, FAR.rim, x + 1, t, 1, 1); }
  R(g, C.dark, mx - 14, deckY - 7, 28, 2);
  R(g, '#14152a', mx - 9, deckY - 22, 18, 12);                                                    /* the roofed room: dark inside */
  R(g, FAR.amber, mx - 6, deckY - 19, 5, 4); R(g, FAR.amberHi, mx - 5, deckY - 19, 2, 1); R(g, FAR.amber, mx + 2, deckY - 19, 4, 4);   /* two lit slits */
  fillPoly(g, [[mx, deckY - 38], [mx + 14, deckY - 20], [mx - 14, deckY - 20]], FAR.roof); fillPoly(g, [[mx, deckY - 36], [mx + 2, deckY - 24], [mx - 2, deckY - 24]], C.lit);
  R(g, C.dark, mx - 1, deckY - 46, 1, 10); R(g, FAR.flag, mx, deckY - 46, 7, 4); R(g, '#c06070', mx, deckY - 46, 7, 1);   /* the pennant */
  R(g, C.dark, mx - 17, H - 6, 34, 6);                                                              /* the footing */
  return c;
}
/* a goblin tent: a hide cone on a ridge pole, lit door */
function bakeTent(v) {
  const [c, g] = canvas(44, 30), r = mulberry(v * 11 + 3), lit = v % 2 === 0;
  fillPoly(g, [[22, 3], [43, 29], [1, 29]], MIDC.canvas); fillPoly(g, [[22, 3], [14, 29], [1, 29]], MIDC.canvasLit);
  for (const x of [8, 15, 29, 36]) R(g, MIDC.dark, x, 14 + ((r() * 6) | 0), 1, 8);
  R(g, MIDC.dark, 22, 0, 1, 6); R(g, '#8a2f3a', 23, 0, 5, 3);                                 /* the pole and a rag */
  fillPoly(g, [[22, 14], [29, 29], [15, 29]], lit ? '#3a2018' : MIDC.dark); if (lit) { R(g, MIDC.amber, 19, 22, 6, 7); R(g, '#ffe3a0', 21, 25, 2, 4); }
  return c;
}
function bakeRack(v) {
  const [c, g] = canvas(34, 24); R(g, MIDC.dark, 2, 2, 2, 22); R(g, MIDC.dark, 30, 2, 2, 22); R(g, MIDC.dark, 2, 2, 30, 2);
  for (const x of [8, 15, 22]) { R(g, MIDC.hide, x, 4, 5, 10 + ((x + v) % 5)); R(g, '#5c4a58', x, 4, 5, 1); }
  return c;
}
function bakeKennel() { const [c, g] = canvas(30, 18); R(g, MIDC.dark, 3, 7, 24, 11); fillPoly(g, [[1, 8], [15, 0], [29, 8]], MIDC.canvas); R(g, '#12132a', 9, 10, 10, 8); R(g, '#d86a3a', 11, 12, 2, 1); R(g, '#d86a3a', 16, 12, 2, 1); R(g, MIDC.lit, 3, 7, 1, 11); return c; }
function bakePole() { const [c, g] = canvas(16, 44); R(g, MIDC.dark, 7, 6, 2, 38); R(g, MIDC.skull, 5, 2, 6, 5); R(g, '#12132a', 6, 4, 1, 1); R(g, '#12132a', 9, 4, 1, 1); R(g, MIDC.skull, 6, 7, 4, 2); R(g, '#8a2f3a', 9, 14, 6, 12); R(g, '#a43c4a', 9, 14, 6, 1); R(g, MIDC.dark, 3, 12, 10, 1); return c; }
function bakeStack(v) { const [c, g] = canvas(30, 16); for (let i = 0; i < 4; i++) { R(g, MIDC.dark, i * 7, 10, 7, 6); R(g, MIDC.lit, i * 7 + 1, 11, 5, 1); R(g, '#3a2a36', i * 7 + 2, 12, 3, 3); } for (let i = 0; i < 3; i++) { R(g, MIDC.dark, 3 + i * 7, 4, 7, 6); R(g, MIDC.lit, 4 + i * 7, 5, 5, 1); R(g, '#3a2a36', 5 + i * 7, 6, 3, 3); } return c; }
/* the dusk: a horizon band that is orange at the sill, rose, then bruise - laid once over the sky */
function bakeDusk(h) {
  const [c, g] = canvas(1, h);
  for (let y = 0; y < h; y++) { const t = y / (h - 1), q = Math.round(t * 14) / 14;   /* banded, not smooth: it is pixel art */
    const a = q < 0.4 ? 0 : (q - 0.4) / 0.6, rr = 255, gg = Math.round(110 + a * 30), bb = Math.round(150 - a * 90);
    g.fillStyle = 'rgba(' + rr + ',' + gg + ',' + bb + ',' + Math.min(0.78, a * a * 0.85).toFixed(3) + ')'; g.fillRect(0, y, 1, 1); }
  return c;
}
/* a thin violet cloud streak with a lit underside */
function bakeStreak(v) { const w = 70 + v * 14, [c, g] = canvas(w, 7), r = mulberry(v * 5 + 2); for (let x = 0; x < w; x++) { const hh = 1 + Math.round(Math.sin(x / w * Math.PI) * (2 + r() * 1.2)); R(g, '#4a3a6a', x, 3 - hh, 1, hh); R(g, '#c06a5a', x, 3, 1, 1 + (r() < 0.4 ? 1 : 0)); } return c; }

/* the smoke puff (for the near smoke): a 5x4 dither of grey-violet */
function bakePuff(v) { const [c, g] = canvas(7, 6), r = mulberry(v + 91); for (let y = 0; y < 6; y++) for (let x = 0; x < 7; x++) { const d = Math.hypot(x - 3, y - 2.6); if (d < 3.1 && (d < 1.8 || r() < 0.55)) R(g, '#8a8298', x, y, 1, 1); } return c; }

/* ------------------------------------------------------------------ the layers ------------------------------------------------------------------ */
const farBase = (VH, dY) => Math.round(VH * 0.64 + dY * 0.08), midBase = (VH, dY) => Math.round(VH * 0.7 + dY * 0.16);
const smokeColumn = (g, x, y0, time, seed, h, a) => {   /* a thin wind-leaning plume of dithered puffs rising from (x, y0) */
  for (let i = 0; i < 7; i++) { const ph = ((time * 0.11 + i / 7 + seed * 0.37) % 1 + 1) % 1, py = y0 - ph * h, px = x + ph * ph * 22 + Math.sin(time * 0.7 + i * 1.7 + seed) * 1.5 * ph, k = 1 - ph;
    g.globalAlpha = a * k * (ph < 0.08 ? ph / 0.08 : 1); g.drawImage(once('puff' + (i % 3), () => bakePuff(i % 3)), Math.round(px - 3 - ph * 3), Math.round(py)); }
  g.globalAlpha = 1;
};

export function drawFarMid(g, cx, cy, VW, VH, L, time, dY, full) {
  const mid = cx + VW / 2, fb = farBase(VH, dY), mb = midBase(VH, dY), sxOf = (wx, f) => Math.round(VW / 2 + (wx - mid) * f);
  /* THE DUSK: a banded glow on the horizon over the shared night sky, with thin cloud streaks that drift */
  { const top = Math.max(0, fb - 120); g.drawImage(once('dusk', () => bakeDusk(96)), 0, 0, 1, 96, 0, top, VW, fb - top + 10);
    for (let i = 0; i < 4; i++) { const sp = once('streak' + i, () => bakeStreak(i)), u = ((i * 131 - mid * 0.03 - time * (0.35 + i * 0.1)) % (VW + 200) + VW + 200) % (VW + 200) - 100; g.globalAlpha = 0.5; g.drawImage(sp, Math.round(u), Math.max(0, fb - 70 - i * 9 + Math.round(dY * 0.02))); } g.globalAlpha = 1; }
  /* ---------------- FAR (0.15): the wall and its towers ---------------- */
  if (full) {
    { const f = 0.15, s = 40, i0 = Math.floor((mid * f - VW / 2 - 40) / s), i1 = Math.ceil((mid * f + VW / 2 + 40) / s);
      /* the wall runs first (behind the towers), then the towers and fires */
      for (let i = i0; i <= i1; i++) { const hs = hash(i, 71), U = i * s, t = (U / f) / 16, k = wallK(t); if (((hs >> 6) % 100) / 100 > k * 1.15 + 0.08) continue;
        const sx = Math.round(VW / 2 + U - mid * f), v = hs % 4 === 3 && (areaOf(t) === 'yard' || areaOf(t) === 'wall') ? 3 : hs % 3;
        g.drawImage(once('fw' + v + (hs % 2), () => bakeWall(v, 41, 40 + (hs % 2) * 4, FAR, false)), sx, fb - 36 - (hs % 2) * 4 + 6); }
      for (let i = i0; i <= i1; i++) { const hs = hash(i, 97), U = i * s * 2 + (hs % 17), t = (U / f) / 16, k = wallK(t), sx = Math.round(VW / 2 + U - mid * f); if (((hs >> 8) % 100) > 10 + k * 50) continue;
        const big = areaOf(t) === 'towers' || (hs >> 3) % 4 === 0; g.drawImage(once('ft' + (big ? 'b' : 's') + (hs % 2), () => bakeTower(hs % 2, FAR, big)), sx - (big ? 22 : 17), fb - (big ? 92 : 74) + 6);
        const fl = 0.75 + 0.25 * Math.sin(time * 6 + hs); g.globalAlpha = 0.5 * fl; g.fillStyle = FAR.amber; g.fillRect(sx - 8, fb - (big ? 92 : 74) + 6 + (big ? 22 : 20), 16, 2); g.globalAlpha = 1; }   /* the deck's firelight leaks */
      /* far fires and their smoke: small amber specks on the sill, plumes rising */
      for (let i = i0; i <= i1; i++) { const hs = hash(i, 131), U = i * s * 3 + (hs % 40), t = (U / f) / 16; if ((hs >> 5) % 100 > 12 + wallK(t) * 40) continue; const sx = Math.round(VW / 2 + U - mid * f);
        g.fillStyle = FAR.amber; g.globalAlpha = 0.8; g.fillRect(sx, fb + 2, 2, 2); g.globalAlpha = 0.25; g.fillRect(sx - 3, fb, 8, 5); g.globalAlpha = 1; smokeColumn(g, sx, fb, time, hs % 7, 56, 0.42); } }
  }
  /* ---------------- MID (0.30): the camp itself ---------------- */
  { const f = 0.3, s = 44, i0 = Math.floor((mid * f - VW / 2 - 40) / s), i1 = Math.ceil((mid * f + VW / 2 + 40) / s);
    /* a low earth line under it, so the pieces stand on a ridge and not in the air */
    g.fillStyle = 'rgba(22,22,46,0.55)'; g.fillRect(0, mb - 1, VW, VH - mb + 1);
    for (let i = i0; i <= i1; i++) { const hs = hash(i, 23), U = i * s + (hs % 13), t = (U / f) / 16, a = areaOf(t), k = wallK(t), r = (hs >> 4) % 100, sx = Math.round(VW / 2 + U - mid * f);
      const put = (key, mk, ox, oy) => { const sp = once(key, mk); g.drawImage(sp, sx + ox, mb - sp.height + 2 + oy); };
      if (a === 'tunnel') { if (r < 30) put('mrack' + (hs % 2), () => bakeRack(hs % 2), -17, 0); else if (r < 52) put('mstack', bakeStack, -15, 0); continue; }
      if (r < 24) put('mt' + (hs % 3), () => bakeTent(hs % 3), -22, 0);
      else if (r < 36) put('mrack' + (hs % 2), () => bakeRack(hs % 2), -17, 0);
      else if (r < 44) put('mkennel', bakeKennel, -15, 0);
      else if (r < 53) put('mpole', bakePole, -8, 0);
      else if (r < 60) put('mstack', bakeStack, -15, 0);
      else if (r < 60 + k * 30) { put('mw' + (hs % 3), () => bakeWall(hs % 3, 45, 44, MIDC, true), -22, 0); if (hs % 3 === 0) { g.fillStyle = MIDC.amber; g.globalAlpha = 0.5 + 0.3 * Math.sin(time * 7 + hs); g.fillRect(sx - 1, mb - 34, 3, 3); g.globalAlpha = 1; } } }
    /* a big tower now and then, nearer than the far ones: platform and a lit room */
    for (let i = Math.floor((mid * f - VW / 2 - 40) / 160); i <= Math.ceil((mid * f + VW / 2 + 40) / 160); i++) { const hs = hash(i, 55), U = i * 160 + (hs % 50), t = (U / f) / 16; if (wallK(t) < 0.35 || (hs >> 7) % 100 > 55) continue;
      const sx = Math.round(VW / 2 + U - mid * f), sp = once('mtw' + (hs % 2), () => bakeTower(hs % 2 + 3, MIDC, true)); g.globalAlpha = 0.92; g.drawImage(sp, sx - 22, mb - sp.height + 4); g.globalAlpha = 1; } }
}

/* NEAR SMOKE: `srcs` = [{x, y}] world points of cook fires, braziers and camp fires; a column of grey puffs rises from each and leans on the wind. cx/cy = the camera. */
export function drawSmoke(g, srcs, cx, cy, VW, time) {
  for (let n = 0; n < srcs.length; n++) { const s = srcs[n]; if (s.x < cx - 30 || s.x > cx + VW + 30) continue;
    const sx = s.x - cx, sy = s.y - cy, seed = s.seed || n;
    for (let i = 0; i < 5; i++) { const ph = ((time * 0.34 + i / 5 + seed * 0.211) % 1 + 1) % 1, py = sy - 8 - ph * 34, pxx = sx + ph * 7 + Math.sin(time * 1.3 + i * 2.1 + seed) * 1.6 * ph;
      g.globalAlpha = 0.28 * (1 - ph) * (ph < 0.12 ? ph / 0.12 : 1); g.drawImage(once('puff' + ((i + seed) % 3), () => bakePuff((i + seed) % 3)), Math.round(pxx - 3 - ph * 2), Math.round(py)); } }
  g.globalAlpha = 1;
}
