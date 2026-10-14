// src/redraw/sealed_pyramid_tombart.js - THE SEALED PYRAMID's SECOND HALF, drawn (claude/pyramidart, the art pass over lanes A and B's placeholders). src/sealed-pyramid-hands.js keeps all the LOGIC
// (what fires, when, what it hits) and calls these for the PICTURE - same positions, same boxes, nothing here moves anything. Every function takes a canvas and SCREEN pixels.
//   tomb(g, x, y, kind, st, time)           a TOMB NICHE (28 x 48 at x, y): a carved frame under a gilt lintel; SHUT a lidded slab (a gilt mummy mask / a bone ankh + skull for the guard),
//                                           CRACK the slab shaking with dust and fissures (told), OPEN the lid fallen at the foot, the dark inside with a pair of embers
//   gasJet(g, x, y, armed, time)            a bronze embalmers' grate in the floor with green verdigris; ARMED a hiss of wisps rises
//   gasCloud(g, x, y, w, h, a, time)        the cloud: rolling pale-green puffs, a drifting skull in the haze (no word: the skull is the told)
//   oilChannel / oilPour / brazier / flameFront / oilFall   the black channel with its sheen and stone kerbs; the gutter on the high walk; the BRAZIER on its bronze stand (upright / tipped, pouring);
//                                           the RUNNING FLAME FRONT (layered tongues, a lit oil sheen behind it); the OIL FALL's burning curtain
//   sluice(g, x, y0, y1, dir, ready) / bore(g, x, y1, w, time) / sluiceGauge(g, x, y, k)   the bronze GRILLE in a carved frame (water light behind it when open), the BORE (a foam front), the water gauge
//   switchmount(g, x, y) / chains(g, x, y, h) / robbers(g, x, y)   the chamber's fittings and the robbers' callback prop
// Everything static is baked once and memoised.
import { canvas, px, rect, ellipse } from '../px.js';

const R = Math.round;
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const C = { s0: '#2a1e12', s1: '#4a3a24', s2: '#6e5636', s3: '#8e7248', s4: '#b09462', s5: '#d0b47c', g0: '#7a5a18', g1: '#d8aa40', g2: '#f8e08a', l1: '#2e4a8a', l2: '#6a8ad8', ink: '#0c0806', bone: '#e8e0c8', boneD: '#a89c80', boneDD: '#6a604c',
  br0: '#6a4420', br1: '#b0743a', br2: '#e8a868', verd: '#3a8a6a', verdL: '#7ad0a0', ember: '#ff9a3a' };

/* ================= TOMBS ================= */
const niche = (kind) => once('niche' + kind, () => {
  const [c, g] = canvas(36, 56);
  /* the lintel: a gilt frieze on a stone cap, then the jambs */
  rect(g, 0, 2, 36, 5, C.s3); rect(g, 0, 2, 36, 1, C.s5); rect(g, 0, 6, 36, 1, C.s1); rect(g, 2, 3, 32, 3, C.s1); for (let x = 3; x < 33; x += 4) { rect(g, x, 3, 2, 2, kind === 'skel' ? C.boneD : C.g1); px(g, x, 3, kind === 'skel' ? C.bone : C.g2); }
  rect(g, 2, 7, 4, 48, C.s2); rect(g, 30, 7, 4, 48, C.s2); rect(g, 2, 7, 1, 48, C.s4); rect(g, 30, 7, 1, 48, C.s3); rect(g, 5, 7, 1, 48, C.s1); rect(g, 30, 7, 1, 48, C.s1);
  for (let y = 12; y < 54; y += 9) { rect(g, 2, y, 4, 1, C.s1); rect(g, 30, y, 4, 1, C.s1); }
  /* the recess: dark, a step of shadow under the lintel */
  rect(g, 6, 7, 24, 48, '#120c08'); rect(g, 6, 7, 24, 2, C.ink); rect(g, 6, 53, 24, 2, C.s1);
  rect(g, 0, 54, 36, 2, C.s3); rect(g, 0, 54, 36, 1, C.s5);   /* the sill */
  return c; });
const lidArt = (kind) => once('lid' + kind, () => {
  const [c, g] = canvas(24, 46);   /* the slab that stands in the niche */
  if (kind === 'skel') {
    rect(g, 0, 0, 24, 46, C.boneD); rect(g, 1, 0, 22, 46, '#c8bc9c'); rect(g, 1, 0, 22, 1, C.bone); rect(g, 0, 0, 1, 46, C.bone); rect(g, 23, 0, 1, 46, C.boneDD); rect(g, 1, 45, 23, 1, C.boneDD);
    /* a carved skull and a bone ankh */
    rect(g, 8, 6, 8, 7, C.boneDD); rect(g, 9, 5, 6, 1, C.boneDD); rect(g, 9, 7, 2, 3, C.ink); rect(g, 13, 7, 2, 3, C.ink); rect(g, 11, 11, 2, 1, C.ink); rect(g, 9, 13, 6, 2, C.boneDD); for (let x = 9; x < 15; x += 2) px(g, x, 13, C.ink);
    rect(g, 11, 20, 2, 18, C.boneDD); rect(g, 7, 24, 10, 2, C.boneDD); rect(g, 9, 17, 6, 1, C.boneDD); rect(g, 8, 18, 1, 3, C.boneDD); rect(g, 15, 18, 1, 3, C.boneDD);   /* the ankh */
    for (let y = 40; y < 44; y++) for (let x = 2; x < 22; x += 2) if (hash(x, y) % 3 === 0) px(g, x, y, C.boneD);
  } else {
    rect(g, 0, 0, 24, 46, C.s4); rect(g, 0, 0, 24, 1, C.s5); rect(g, 0, 0, 1, 46, C.s5); rect(g, 23, 0, 1, 46, C.s2); rect(g, 0, 45, 24, 1, C.s2);
    /* an anthropoid lid: nemes stripes, a gilt mask, a lapis collar, the crossed arms */
    rect(g, 5, 2, 14, 13, C.g1); for (let k = 0; k < 6; k++) rect(g, 5, 3 + k * 2, 14, 1, C.l1); rect(g, 7, 5, 10, 9, C.g2); rect(g, 7, 5, 1, 9, C.g1); rect(g, 16, 6, 1, 8, C.g0); rect(g, 8, 8, 3, 2, C.ink); rect(g, 13, 8, 3, 2, C.ink); rect(g, 11, 10, 2, 3, C.g0); rect(g, 10, 14, 4, 2, C.g0);
    rect(g, 3, 17, 18, 3, C.l1); rect(g, 3, 17, 18, 1, C.l2); rect(g, 4, 20, 16, 2, C.g1);
    for (let k = 0; k < 6; k++) { px(g, 5 + k * 2, 24 + k, C.g1); px(g, 18 - k * 2, 24 + k, C.g1); }
    rect(g, 8, 32, 8, 12, C.g1); rect(g, 8, 32, 8, 1, C.g2); for (let k = 0; k < 3; k++) { rect(g, 10, 34 + k * 3, 1, 2, C.ink); rect(g, 13, 35 + k * 3, 1, 2, C.ink); } rect(g, 8, 43, 8, 1, C.l1);
  }
  return c; });
export function tomb(g, x, y, kind, st, time) {
  /* (x, y) = the niche's top-left as the greybox drew it (w 28, h 48); the frame is 4 px wider each side and 4 px up */
  const k = kind === 'skel' ? 'skel' : 'mum', X = R(x) - 4, Y = R(y) - 4 - 1;
  g.drawImage(niche(k), X, Y);
  const lx = X + 6, ly = Y + 9;
  if (st === 'shut') { g.drawImage(lidArt(k), lx, ly); }
  else if (st === 'crack') {
    const sh = Math.round(Math.sin(time * 70) * 1.3); g.drawImage(lidArt(k), lx + sh, ly);
    /* fissures across the slab, dust sifting out of the edges */
    for (let i = 0; i < 12; i++) px(g, lx + 8 + sh + ((i * 3) % 5), ly + 4 + i * 3, C.ink); for (let i = 0; i < 8; i++) px(g, lx + 14 + sh - (i >> 1), ly + 20 + i * 3, C.ink); for (let i = 0; i < 5; i++) px(g, lx + 3 + sh + i, ly + 14 + (i >> 1), C.ink);
    g.globalAlpha = 0.75; for (let i = 0; i < 7; i++) { const a = (time * 26 + i * 7) % 30; rect(g, lx + 1 + ((i * 5) % 22), ly + 40 + a * 0.3, 1, 2, '#d8c8a0'); } g.globalAlpha = 1;
    g.globalAlpha = 0.35 + 0.25 * Math.sin(time * 18); rect(g, lx, ly, 24, 1, kind === 'skel' ? '#ffe8b0' : '#ffd36b'); rect(g, lx, ly + 45, 24, 1, kind === 'skel' ? '#ffe8b0' : '#ffd36b'); g.globalAlpha = 1;
  } else {
    /* OPEN: the slab thrown down in front of the sill, cracked in two; the dark inside with two embers (a mummy's) / pale sockets (a guard's) */
    g.save(); g.translate(lx - 7, ly + 43); g.rotate(-0.28); g.drawImage(lidArt(k), 0, -2, 24, 16, 0, 0, 24, 5); g.restore();
    rect(g, lx - 6, ly + 41, 30, 4, C.s3); rect(g, lx - 6, ly + 41, 30, 1, C.s5); rect(g, lx + 10, ly + 41, 2, 4, C.ink);
    const ex = lx + 6 + ((time * 0) | 0), ey = ly + 20; rect(g, ex, ey, 2, 2, kind === 'skel' ? C.bone : C.ember); rect(g, ex + 10, ey, 2, 2, kind === 'skel' ? C.bone : C.ember);
    g.globalAlpha = 0.5; rect(g, lx + 4, ly + 28, 16, 12, '#1a1008'); g.globalAlpha = 1;
  }
}

/* ================= GAS ================= */
const jetSprite = () => once('jet', () => {
  const [c, g] = canvas(16, 6);
  rect(g, 0, 3, 16, 3, C.s1); rect(g, 0, 3, 16, 1, C.s3); rect(g, 1, 1, 14, 3, C.br0); rect(g, 1, 1, 14, 1, C.br1); for (let x = 2; x < 14; x += 3) rect(g, x, 2, 2, 2, C.ink);
  px(g, 3, 1, C.verd); px(g, 4, 2, C.verd); px(g, 10, 1, C.verd); px(g, 11, 1, C.verdL); px(g, 7, 3, C.verd); rect(g, 6, 0, 4, 1, C.br2);
  return c; });
export function gasJet(g, x, y, armed, time) {
  g.drawImage(jetSprite(), R(x), R(y) - 3);
  if (armed) { g.globalAlpha = 0.7; for (let k = 0; k < 4; k++) { const a = (time * 26 + k * 5) % 12; rect(g, R(x) + 3 + k * 3 + Math.sin(time * 9 + k) , R(y) - 5 - a, 2, 2, k & 1 ? '#a6e04a' : '#d8ff90'); } g.globalAlpha = 1; }
}
const skullGlyph = () => once('skull', () => {
  const [c, g] = canvas(11, 12);
  rect(g, 2, 1, 7, 6, '#e0ffb0'); rect(g, 1, 2, 9, 4, '#e0ffb0'); rect(g, 3, 7, 5, 3, '#c8ec98'); rect(g, 2, 3, 3, 3, '#1a3a10'); rect(g, 6, 3, 3, 3, '#1a3a10'); rect(g, 5, 6, 1, 1, '#1a3a10'); rect(g, 4, 9, 1, 2, '#1a3a10'); rect(g, 6, 9, 1, 2, '#1a3a10');
  return c; });
export function gasCloud(g, x, y, w, h, a, time) {
  /* two layers of rolling puffs over a pale-green wash that thins to the top, and a skull drifting in the haze */
  g.globalAlpha = 0.40 * a; g.fillStyle = '#5a9a28'; g.fillRect(R(x), R(y + h * 0.18), R(w), R(h * 0.82)); g.globalAlpha = 0.22 * a; g.fillRect(R(x), R(y), R(w), R(h * 0.2));
  const n = Math.max(3, Math.floor(w / 9));
  for (let k = 0; k < n; k++) { const bx = x + ((k * 37 + time * 12) % w), by = y + h * 0.55 + Math.sin(time * 1.6 + k * 1.3) * h * 0.3, r = 5 + (k % 3) * 2;
    g.globalAlpha = 0.45 * a; g.fillStyle = '#a8e050'; g.beginPath(); g.arc(R(bx), R(by), r, 0, 7); g.fill(); g.globalAlpha = 0.35 * a; g.fillStyle = '#e4ffa8'; g.beginPath(); g.arc(R(bx - 2), R(by - 2), r - 3, 0, 7); g.fill(); }
  g.globalAlpha = (0.5 + 0.2 * Math.sin(time * 4)) * a; g.drawImage(skullGlyph(), R(x + w / 2 - 5 + Math.sin(time * 1.2) * w * 0.12), R(y + h * 0.28 + Math.sin(time * 2.1) * 3)); g.globalAlpha = 1;
}

/* ================= OIL ================= */
export function oilChannel(g, x0, x1, fy, time) {
  /* a channel cut in the floor: stone kerbs, black oil with a purple-blue sheen that crawls */
  rect(g, x0, fy - 3, x1 - x0, 1, C.s3); rect(g, x0, fy - 2, x1 - x0, 4, '#100a06'); rect(g, x0, fy + 1, x1 - x0, 1, C.s1);
  for (let x = x0 + 2; x < x1; x += 9) { const o = Math.floor(time * 6 + x * 0.2) % 3; g.globalAlpha = 0.55; rect(g, x + o, fy - 1, 3, 1, '#6a5a9a'); px(g, x + o + 1, fy, '#8a7ac0'); g.globalAlpha = 1; }
  for (let x = x0; x < x1; x += 16) { rect(g, x, fy - 3, 1, 5, C.s1); }
}
export function oilPour(g, px0, px1, py) {   /* the gutter on the high walk: a stone spout lip with a black stain */
  rect(g, px0, py - 3, px1 - px0, 1, C.s3); rect(g, px0, py - 2, px1 - px0, 3, '#100a06'); rect(g, px0, py + 1, px1 - px0, 1, C.s1); rect(g, px1 - 4, py - 4, 5, 6, C.s2); rect(g, px1 - 4, py - 4, 5, 1, C.s4); rect(g, px1 - 3, py + 1, 3, 3, '#100a06');
}
const flame = (g, x, y, h, w, t) => { rect(g, x, y - h, w, h, '#c43a1c'); rect(g, x + 1, y - h * 0.8, Math.max(1, w - 2), h * 0.8, '#ff7a2a'); rect(g, x + 1, y - h * 0.55, Math.max(1, w - 2), h * 0.55, '#ffc24a'); px(g, x + (w >> 1), y - h, '#ff9a3a'); if (h > 9 && ((t * 8 + x) | 0) % 3 === 0) px(g, x + (w >> 1), y - h - 2, '#ffd36b'); };
export function brazier(g, hx, hy, tip, time) {
  /* a bronze bowl on a tripod stand (hx, hy = the foot): upright it burns; tipped it leans over and pours */
  rect(g, hx - 4, hy - 1, 9, 1, C.br0); for (const [dx, dy] of [[-3, 0], [0, 0], [3, 0]]) rect(g, hx + dx, hy - 9 + dy, 1, 9, C.br0); rect(g, hx - 1, hy - 10, 3, 1, C.br1); rect(g, hx - 1, hy - 3, 3, 1, C.br1);
  g.save(); g.translate(R(hx), R(hy - 11)); g.rotate(tip ? 0.85 : 0);
  rect(g, -6, -4, 13, 5, C.br1); rect(g, -6, -4, 13, 1, C.br2); rect(g, -5, 1, 11, 1, C.br0); rect(g, -7, -5, 15, 1, C.br2); rect(g, -6, -3, 1, 4, C.br2); rect(g, 6, -3, 1, 4, C.br0);
  const t = time; g.globalAlpha = 0.95; flame(g, -5, -5, 6 + Math.abs(Math.sin(t * 9)) * 3, 3, t); flame(g, -2, -5, 9 + Math.abs(Math.sin(t * 11 + 1)) * 3, 4, t); flame(g, 2, -5, 6 + Math.abs(Math.sin(t * 8 + 2)) * 3, 3, t); g.globalAlpha = 1;
  g.restore();
  if (tip) { /* the oil running out of the lip */ rect(g, hx + 6, hy - 11, 2, 11, '#100a06'); rect(g, hx + 7, hy - 4, 3, 4, '#ff9a3a'); }
}
export function flameFront(g, x0, xe, fy, time) {
  /* behind the front: a lit sheen on the oil, low flames, the tallest at the front itself */
  g.globalAlpha = 0.8; rect(g, x0, fy - 2, Math.max(0, xe - x0), 4, '#8a2a14'); g.globalAlpha = 1;
  for (let x = x0; x < xe; x += 4) { const near = Math.max(0, 1 - (xe - x) / 70), hgt = 6 + 10 * near * Math.abs(Math.sin(time * 9 + x * 0.3)) + 3 * Math.abs(Math.sin(time * 14 + x)); flame(g, x, fy - 2, hgt, 4, time); }
  g.globalAlpha = 0.3; rect(g, xe - 3, fy - 28, 6, 26, '#ffd36b'); g.globalAlpha = 1;   /* the front's glare */
  for (let k = 0; k < 4; k++) { const a = (time * 22 + k * 9) % 22; px(g, xe - 10 + k * 3, fy - 8 - a, '#ffd36b'); }   /* sparks */
}
export function oilFall(g, px0, pxe, py, fy, time) {
  /* THE OIL FALL on fire: the burning gutter, a curtain of flame down to the floor */
  for (let x = px0; x < pxe; x += 5) flame(g, x, py - 1, 5 + 4 * Math.abs(Math.sin(time * 10 + x)), 4, time);
  g.globalAlpha = 0.85; for (let y = py; y < fy; y += 4) { rect(g, pxe, y, 5, 4, (y >> 2) % 2 ? '#ff7a2a' : '#ffc24a'); rect(g, pxe + 1, y, 3, 4, (y + ((time * 40) | 0)) % 8 < 4 ? '#ffd36b' : '#e0602c'); } g.globalAlpha = 1;
  for (let x = pxe - 8; x < pxe + 14; x += 4) flame(g, x, fy - 2, 5 + 4 * Math.abs(Math.sin(time * 9 + x)), 4, time);
}

/* ================= SLUICES ================= */
export function sluice(g, x, y0, y1, dir, ready, time) {
  /* a carved frame in the wall, a bronze grille; open, the water shows behind it and spills */
  const w = 8, X = dir > 0 ? x - w : x, h = y1 - y0;
  rect(g, X, y0, w, h, C.s1); rect(g, X, y0, w, 1, C.s4); rect(g, X + (dir > 0 ? 0 : w - 1), y0, 1, h, C.s4);
  rect(g, X + 1, y0 + 2, w - 2, h - 4, ready ? '#120c08' : '#2e6a8a');
  if (!ready) { g.globalAlpha = 0.8; for (let y = y0 + 3; y < y1 - 3; y += 3) rect(g, X + 1, y + ((time * 14 + y) % 3 | 0), w - 2, 1, '#9fd0e8'); g.globalAlpha = 1; }
  for (let y = y0 + 3; y < y1 - 2; y += 4) { rect(g, X + 1, y, w - 2, 1, ready ? C.br1 : '#8a7450'); px(g, X + 2, y, C.br2); }
  rect(g, X + 3, y0 + 2, 1, h - 4, C.br0); rect(g, X + 1, y0 + 1, w - 2, 1, C.br2);
  rect(g, X, y1 - 4, w, 4, C.s2); rect(g, X, y1 - 4, w, 1, C.s4);   /* the sill */
  const lx = X + 3; rect(g, lx - 1, y0 - 3, 4, 3, C.g1); px(g, lx, y0 - 3, C.g2);   /* a gilt lotus boss over the frame */
}
export function bore(g, bx, y1, w, time) {
  /* the BORE: a wall of water with a foam crest, a curl, spray ahead of it */
  const hgt = 24; g.globalAlpha = 0.85; rect(g, bx - w, y1 - hgt + 4, w * 2, hgt - 4, '#4a9ac0'); rect(g, bx - w, y1 - hgt + 4, w * 2, 4, '#7ac0e0'); g.globalAlpha = 1;
  for (let x = bx - w; x < bx + w; x += 3) { const hh = 3 + Math.abs(Math.sin(time * 11 + x * 0.7)) * 3; rect(g, x, y1 - hgt + 4 - hh, 3, hh, '#eefaff'); px(g, x + 1, y1 - hgt + 4 - hh - 1, '#ffffff'); }
  g.globalAlpha = 0.6; for (let y = y1 - hgt + 10; y < y1 - 2; y += 4) rect(g, bx - w + ((time * 30 + y) % 8 | 0), y, 6, 1, '#c8ecfa'); g.globalAlpha = 1;
  for (let k = 0; k < 5; k++) { const a = (time * 30 + k * 11) % 20; px(g, bx - w - 3 - a * 0.3, y1 - hgt - 2 + k * 3 + a * 0.2, '#eefaff'); px(g, bx + w + 2 + a * 0.3, y1 - hgt - 2 + k * 3 + a * 0.2, '#eefaff'); }
}
export function sluiceGauge(g, x, y, k) {
  /* its water gauge: a carved lintel bar with a bronze rim and a blue column that fills */
  rect(g, x - 1, y - 1, 34, 6, C.br0); rect(g, x - 1, y - 1, 34, 1, C.br2); rect(g, x, y, 32, 4, C.ink); rect(g, x, y, R(32 * k), 4, '#5aa8d0'); rect(g, x, y, R(32 * k), 1, '#b0e0f4');
  for (let i = 1; i < 4; i++) rect(g, x + i * 8, y, 1, 4, C.br0);
}

/* ================= THE BURIAL CHAMBER's FITTINGS, the robbers' callback ================= */
export function switchmount(g, x, y) {   /* a stone housing in the wall, a lever socket, a gilt scarab (the lever itself is src/tomb-king-hands.js) */
  rect(g, x, y, 16, 16, C.s1); rect(g, x, y, 16, 1, C.s4); rect(g, x, y, 1, 16, C.s3); rect(g, x + 15, y, 1, 16, C.s0); rect(g, x, y + 15, 16, 1, C.s0);
  rect(g, x + 3, y + 3, 10, 10, C.ink); rect(g, x + 5, y + 5, 6, 6, C.br0); rect(g, x + 6, y + 6, 4, 4, C.br1); rect(g, x + 7, y + 7, 2, 2, C.br2);
  for (const [a, b] of [[1, 1], [13, 1], [1, 13], [13, 13]]) px(g, x + a, y + b, C.g1);
}
export function chains(g, x, ytop, h) {   /* a ledge's chain: alternating links in two irons */
  for (let y = 0; y < h; y += 3) { rect(g, x, ytop + y, 2, 2, (y / 3) & 1 ? '#8a8478' : '#5d594e'); px(g, x, ytop + y, '#b8b2a6'); }
  rect(g, x - 2, ytop, 6, 3, C.s1); px(g, x - 1, ytop, C.s4);
}
export function robbers(g, x, y) {
  /* the robbers' callback: two heaps of bones under a torn sack, a sand-gate key, a broken hourglass (the bandits' mark) */
  rect(g, x - 12, y + 12, 24, 2, '#3a2c1c'); rect(g, x - 11, y + 10, 8, 2, C.bone); rect(g, x - 9, y + 8, 5, 2, C.bone); rect(g, x - 5, y + 9, 3, 3, C.boneD); rect(g, x - 12, y + 11, 3, 1, C.boneD); rect(g, x - 8, y + 6, 4, 3, C.bone); px(g, x - 7, y + 7, C.ink); px(g, x - 5, y + 7, C.ink);   /* a skull */
  rect(g, x - 1, y + 7, 6, 6, '#8a6a40'); rect(g, x, y + 6, 4, 1, '#a8844e'); rect(g, x + 1, y + 9, 2, 2, '#6a4a26');   /* the sack */
  rect(g, x + 7, y + 4, 7, 1, C.br1); rect(g, x + 7, y + 13, 7, 1, C.br1); rect(g, x + 8, y + 5, 1, 3, '#b8e0f0'); rect(g, x + 12, y + 5, 1, 2, '#b8e0f0'); rect(g, x + 9, y + 12, 3, 1, '#e8d8a8'); px(g, x + 11, y + 10, '#e8d8a8'); rect(g, x + 8, y + 8, 5, 4, '#e8d8a8'); rect(g, x + 8, y + 8, 5, 1, '#fff6d0'); px(g, x + 10, y + 9, C.s1);
  rect(g, x + 15, y + 9, 5, 2, C.g1); rect(g, x + 19, y + 7, 3, 5, C.g1); rect(g, x + 20, y + 8, 1, 3, C.s0); rect(g, x + 15, y + 9, 5, 1, C.g2);   /* the key */
}
