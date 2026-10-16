// church2_art.js - LIT CHURCH 2's baked pieces (claude/church2art): THE CROSSING's two floor SCONCES and two CHANDELIERS (hanging, the chain parting, falling, lying - lit or dark),
// THE PARCLOSE (the iron grille, shut and ajar), THE CRYPT GRATE (a hatch of riveted iron, and swung up as the one-way grate you stand on), HOLY FIRE (the trough's burner bed, its
// blazing tongues, its ember bed with the iron grate over it, the dotted feed of light from the lamp that burns it), THE CHANTRY (the two relay braziers dark and lit with their
// taper racks, the chantry door with its bell, the choir stalls over the fire) and the HOLY FIRE's tongue shared with the Deacon's flame arc.
// Everything is baked once with px.js (a 1 px dark outline for the props) and memoised; the flames, the fire and the feed are laid live (drawTroughFire, drawFeed).
import { canvas, px, rect, line, ellipse, circle, outline, fillPoly } from '../px.js';
const R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const O = '#14121c';
export const K = {
  iron: '#3a3846', ironHi: '#7a7890', ironLo: '#1e1c28', ironDeep: '#121018', brass: '#c9a040', brassHi: '#f4dc80', brassLo: '#7a5c1c', wax: '#ece4cc', waxLo: '#b8ae90', wick: '#2a2020',
  oak: '#6a4426', oakHi: '#a0703c', oakLo: '#2e1c10', oakMid: '#5a381e', stone: '#9a9684', stoneLo: '#5e5a4e', glass: '#9ab8f0', glassHi: '#e0eaff',
  fireW: '#ffffff', fireP: '#fff6c8', fireG: '#ffd36b', fireO: '#ff9a3c', fireR: '#d8502a', coal: '#7a2a1a', coalHi: '#a8401e', ash: '#3a3640', ashHi: '#5a5660',
};
/* a bake rotated by `ang` (nearest, about its centre) into a canvas `w` x `h` */
export function rot(src, ang, w, h) { const [c, g] = canvas(w, h), s = src.getContext('2d').getImageData(0, 0, src.width, src.height).data, o = g.getImageData(0, 0, w, h), d = o.data;
  const cs = Math.cos(-ang), sn = Math.sin(-ang), cx = src.width / 2, cy = src.height / 2, ox = w / 2, oy = h / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dx = x + 0.5 - ox, dy = y + 0.5 - oy, sx = Math.floor(dx * cs - dy * sn + cx), sy = Math.floor(dx * sn + dy * cs + cy);
    if (sx < 0 || sy < 0 || sx >= src.width || sy >= src.height) continue; const si = (sy * src.width + sx) * 4, di = (y * w + x) * 4; if (s[si + 3] === 0) continue; d[di] = s[si]; d[di + 1] = s[si + 1]; d[di + 2] = s[si + 2]; d[di + 3] = s[si + 3]; }
  g.putImageData(o, 0, 0); return c; }

/* ================================================================ THE CROSSING */
/* a floor sconce: a wrought-iron stem on a tripod foot, a twisted waist, a brass dish and a thick pillar candle with a drip. 14 x 40; the wick at SCONCE_WICK */
export const SCONCE_WICK = [7, 8];
export function bakeFloorSconce() { return once('fsconce', () => { const [c, g] = canvas(14, 40);
  line(g, 7, 36, 2, 39, K.iron); line(g, 7, 36, 12, 39, K.iron); rect(g, 6, 35, 2, 4, K.iron); rect(g, 3, 38, 8, 2, K.ironLo); rect(g, 4, 38, 6, 1, K.ironHi);   /* the tripod foot */
  rect(g, 6, 14, 2, 22, K.iron); rect(g, 6, 14, 1, 22, K.ironHi); for (let y = 18; y < 33; y += 4) { rect(g, 5, y, 4, 1, K.ironLo); px(g, 8, y + 1, K.ironHi); }   /* the stem, twisted */
  circle(g, 7, 26, 2.2, K.brass); px(g, 6, 25, K.brassHi); px(g, 8, 27, K.brassLo);                                                                          /* a knop */
  line(g, 7, 16, 1, 12, K.iron); line(g, 7, 16, 13, 12, K.iron); rect(g, 2, 12, 10, 2, K.brass); rect(g, 2, 12, 10, 1, K.brassHi); rect(g, 3, 14, 8, 1, K.brassLo);   /* the dish on its arms */
  rect(g, 5, 4, 4, 8, K.wax); rect(g, 5, 4, 1, 8, '#fff'); rect(g, 8, 5, 1, 7, K.waxLo); rect(g, 6, 3, 2, 1, K.wax); px(g, 7, 2, K.wick); px(g, 9, 9, '#d8d0b8'); px(g, 9, 10, '#d8d0b8');   /* the candle and its drip */
  outline(c, O); return c; }); }
/* a chandelier: an iron crown on a brass boss, spokes to a wide hoop, seven candle cups, glass drops. 48 x 40; the hoop's candles at CH_WICKS */
const CH_XS = [4, 10, 17, 24, 31, 38, 44];
const hoopY = x => 28 - 3.4 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 24) / 21, 2)));
export const CH_WICKS = CH_XS.map(x => [x, R(hoopY(x)) - 9]);
export function bakeChandelier2() { return once('chand2', () => { const [c, g] = canvas(48, 40);
  rect(g, 22, 0, 4, 1, K.brassHi); rect(g, 21, 1, 1, 2, K.brass); rect(g, 26, 1, 1, 2, K.brassLo); rect(g, 22, 3, 4, 1, K.brassLo);                                  /* the ring the chain hangs from */
  rect(g, 23, 4, 2, 24, K.iron); rect(g, 23, 4, 1, 24, K.ironHi); ellipse(g, 24, 9, 6, 2, K.iron); ellipse(g, 24, 8, 5, 1.2, K.ironHi); rect(g, 22, 12, 4, 3, K.brass); rect(g, 22, 12, 4, 1, K.brassHi);   /* the crown */
  for (const [x, y] of [[4, 28], [11, 28], [37, 28], [44, 28]]) { line(g, 24, 9, x, y, K.iron); }
  line(g, 24, 14, 6, 27, K.ironLo); line(g, 24, 14, 42, 27, K.ironLo);
  ellipse(g, 24, 29, 21, 3.6, K.ironLo); ellipse(g, 24, 28.5, 20.5, 3, K.iron); ellipse(g, 24, 28, 19, 2, '#26242f');                                                 /* the hoop */
  for (let x = 4; x <= 44; x++) { const y = R(hoopY(x)) + 1; px(g, x, y, K.ironHi); }
  for (const x of CH_XS) { const yb = R(hoopY(x)); rect(g, x - 1, yb - 1, 4, 3, K.brass); rect(g, x - 1, yb - 1, 4, 1, K.brassHi); px(g, x + 2, yb + 1, K.brassLo);          /* a brass cup, a candle, its wick */
    rect(g, x, yb - 8, 2, 7, K.wax); px(g, x, yb - 8, '#fff'); px(g, x + 1, yb - 3, K.waxLo); px(g, x, yb - 9, K.wick); if (x % 3 === 1) { px(g, x + 1, yb - 1, '#d8d0b8'); px(g, x + 1, yb, '#d8d0b8'); } }
  for (const x of [8, 15, 24, 33, 40]) { const yb = R(hoopY(x)) + 3; px(g, x, yb, K.glass); px(g, x, yb + 1, K.glassHi); px(g, x, yb + 2, K.glass); }   /* glass drops */
  circle(g, 24, 35, 3, K.brass); px(g, 23, 34, K.brassHi); px(g, 25, 36, K.brassLo); rect(g, 23, 38, 2, 2, K.brass); px(g, 23, 39, K.brassHi);                               /* the boss and its finial */
  outline(c, O); return c; }); }
/* it lies on the floor: the hoop bent flat and split, the arms sprung up, candles snapped, wax pooled. 52 x 24; floor at the bottom; standing candles' wicks at CH_LY_WICKS */
export const CH_LY_WICKS = [[8, 9], [15, 11], [44, 10]];
export function bakeChandelierLying() { return once('chandlying', () => { const [c, g] = canvas(52, 24);
  rect(g, 4, 20, 44, 2, '#d8d0b8'); rect(g, 8, 21, 36, 1, '#b8ae90');                                                                                                           /* the wax puddle */
  ellipse(g, 26, 18, 22, 3.4, K.ironLo); ellipse(g, 26, 17.5, 21.5, 3, K.iron); ellipse(g, 26, 17, 19.5, 2, '#26242f'); g.clearRect(31, 14, 5, 8);                                    /* the hoop, split */
  for (let x = 5; x <= 47; x++) { if (x > 30 && x < 36) continue; px(g, x, R(17 + 3 * Math.sqrt(Math.max(0, 1 - Math.pow((x - 26) / 21, 2)))), K.ironHi); }
  line(g, 26, 17, 16, 5, K.iron); line(g, 16, 5, 13, 1, K.iron); line(g, 26, 17, 40, 9, K.iron); line(g, 40, 9, 46, 8, K.iron); rect(g, 22, 15, 6, 4, K.brass); rect(g, 22, 15, 6, 1, K.brassHi);   /* the arms, sprung */
  for (const [x, y, h] of [[8, 17, 6], [15, 18, 5], [44, 17, 6]]) { rect(g, x - 1, y, 4, 2, K.brass); rect(g, x, y - h, 2, h, K.wax); px(g, x, y - h, '#fff'); px(g, x, y - h - 1, K.wick); }   /* candles still standing */
  rect(g, 21, 20, 8, 2, K.wax); rect(g, 33, 19, 7, 2, K.wax); rect(g, 2, 19, 4, 2, K.waxLo); px(g, 3, 18, K.wick);                                                                  /* ...and the snapped */
  for (const x of [11, 19, 38, 41]) { px(g, x, 21, K.glass); px(g, x + 1, 21, K.glassHi); }                                                                                            /* glass drops on the floor */
  circle(g, 27, 12, 3, K.brass); px(g, 26, 11, K.brassHi);                                                                                                                         /* the boss, rolled off */
  outline(c, O); return c; }); }
/* it falls: the hanging bake tilted either way, and the chain's torn end above it */
export function bakeChandelierFalling(dir) { return once('chandfall' + dir, () => rot(bakeChandelier2(), 0.5 * dir, 64, 60)); }
/* a chain of links from (x, y0) down to y1: face-on and edge-on links alternating; `swing` pushes the free end sideways (a torn chain) */
export function drawChainLinks(g, x, y0, y1, time = 0, swing = 0) {
  const n = Math.max(1, R((y1 - y0) / 3));
  for (let i = 0; i < n; i++) { const t = i / n, sx = R(swing * Math.pow(t, 1.6) * Math.sin(time * 3)), y = R(y0 + i * 3), xx = R(x) + sx;
    if (i & 1) { rect(g, xx, y, 1, 3, '#3a3a48'); px(g, xx, y, '#8a8aa0'); } else { rect(g, xx - 1, y, 3, 3, '#6a6a7c'); rect(g, xx, y + 1, 1, 1, '#14121c'); px(g, xx - 1, y, '#a0a0b8'); px(g, xx + 1, y + 2, '#2a2a38'); } }
}
/* the iron ring in the vault the chain hangs from */
export function drawChainAnchor(g, x, y) { rect(g, R(x) - 3, R(y) - 2, 7, 3, K.ironLo); rect(g, R(x) - 3, R(y) - 2, 7, 1, K.ironHi); rect(g, R(x) - 1, R(y), 3, 2, K.brass); px(g, R(x), R(y) + 1, K.brassLo); }
/* THE PARCLOSE: the crossing's iron grille, `h` tall, 16 wide. Closed: posts, rods with spear points, rails with brass roundels, a kick-plate, a lock; ajar: swung edge-on against the pier */
export function bakeParclose(h, open) { return once('parclose' + h + open, () => { const [c, g] = canvas(16, h);
  if (open) { rect(g, 0, 0, 3, h, K.iron); rect(g, 0, 0, 1, h, K.ironHi); for (let y = 2; y < h - 2; y += 3) { px(g, 1, y, K.ironHi); px(g, 2, y, K.ironLo); }   /* edge-on: a strip of rods */
    for (let y = 8; y < h; y += 24) { rect(g, 3, y, 3, 2, K.ironLo); rect(g, 3, y, 3, 1, K.ironHi); circle(g, 4, y + 1, 1.6, K.brass); }                       /* the hinges */
    for (let y = 6; y < h - 6; y += 24) { rect(g, 0, y, 3, 2, K.brass); px(g, 0, y, K.brassHi); }
    outline(c, O); return c; }
  rect(g, 0, 0, 2, h, K.iron); rect(g, 14, 0, 2, h, K.iron); rect(g, 0, 0, 1, h, K.ironHi); rect(g, 14, 0, 1, h, K.ironHi); rect(g, 15, 0, 1, h, K.ironLo);       /* the posts */
  for (const x of [3, 6, 9, 12]) { rect(g, x, 6, 1, h - 6, K.iron); px(g, x, 7, K.ironHi); for (let y = 12; y < h; y += 6) px(g, x, y, K.ironHi); fillPoly(g, [[x - 1, 6], [x + 2, 6], [x + 0.5, 1]], K.ironHi); px(g, x, 2, '#c4c2d8'); }   /* rods with spear points */
  for (const y of [8, Math.floor(h * 0.45), h - 24]) { rect(g, 0, y, 16, 2, K.ironLo); rect(g, 0, y, 16, 1, K.iron); }                                                    /* rails */
  const my = Math.floor(h * 0.45) - 5; for (const [x, y] of [[8, my], [8, h - 32]]) { circle(g, x, y + 1, 3, K.brass); circle(g, x, y + 1, 1.2, K.ironDeep); px(g, x - 2, y - 1, K.brassHi); px(g, x, y - 2, K.brassHi); px(g, x + 2, y + 1, K.brassLo); }   /* quatrefoil roundels */
  rect(g, 0, h - 16, 16, 16, K.ironLo); rect(g, 1, h - 15, 14, 14, K.iron); rect(g, 1, h - 15, 14, 1, K.ironHi); for (const [x, y] of [[3, h - 13], [12, h - 13], [3, h - 4], [12, h - 4]]) { px(g, x, y, K.brassHi); px(g, x + 1, y, K.brassLo); }   /* the kick-plate, riveted */
  line(g, 2, h - 14, 13, h - 3, K.ironLo); line(g, 13, h - 14, 2, h - 3, K.ironLo);
  const ly = Math.floor(h * 0.45) + 6; rect(g, 10, ly, 5, 7, K.brass); rect(g, 10, ly, 5, 1, K.brassHi); rect(g, 10, ly + 6, 5, 1, K.brassLo); px(g, 12, ly + 2, K.ironDeep); rect(g, 12, ly + 3, 1, 2, K.ironDeep);   /* the lock plate */
  for (let y = 10; y < h - 18; y += 22) { rect(g, 0, y, 4, 2, K.brass); px(g, 0, y, K.brassHi); }                                                                          /* hinge straps */
  outline(c, O); return c; }); }
/* THE CRYPT GRATE: closed - a hatch of riveted iron plate with a brace and two ring-pulls; cracked - swung up and set as the one-way grate you stand on: a thin lattice, a rimmed top, the crypt's cold light in its gaps. w x 16 (the tile row); the grate sits at the row's top */
export function bakeCryptGrate(w, open) { return once('cgrate' + w + open, () => { const [c, g] = canvas(w, 16);
  if (!open) { rect(g, 0, 0, w, 16, K.ironLo); rect(g, 1, 1, w - 2, 14, K.iron); rect(g, 1, 1, w - 2, 1, K.ironHi); rect(g, 1, 14, w - 2, 1, K.ironDeep);
    for (let x = 0; x < w; x += 16) { rect(g, x, 0, 1, 16, K.ironDeep); } line(g, 2, 2, w - 3, 13, K.ironLo); line(g, w - 3, 2, 2, 13, K.ironLo);
    for (let x = 4; x < w - 3; x += 8) for (const y of [3, 11]) { px(g, x, y, K.brassHi); px(g, x + 1, y, K.brassLo); }
    for (const x of [w / 3 | 0, 2 * w / 3 | 0]) { circle(g, x, 8, 3, K.brass); circle(g, x, 8, 1.4, K.ironDeep); px(g, x - 2, 6, K.brassHi); }
    return c; }
  rect(g, 0, 0, w, 7, '#0e0c16'); rect(g, 0, 0, w, 2, K.ironHi); rect(g, 0, 2, w, 1, K.iron); rect(g, 0, 6, w, 1, K.ironLo); rect(g, 0, 1, w, 1, '#c4c2d8');
  for (let x = 2; x < w - 1; x += 4) { rect(g, x, 2, 2, 5, K.iron); px(g, x, 2, K.ironHi); }
  rect(g, 0, 3, w, 1, K.ironLo); for (let x = 3; x < w - 3; x += 4) { px(g, x, 4, '#2a3a6a'); px(g, x + 1, 5, '#4a5a9a'); }                                                  /* the crypt's cold light in the gaps */
  rect(g, 0, 0, 3, 8, K.ironLo); rect(g, 0, 0, 3, 2, K.ironHi); for (const y of [1, 5]) { px(g, 1, y, K.brassHi); }                                                       /* the hinge end */
  rect(g, w - 3, 0, 3, 8, K.ironLo); rect(g, w - 3, 0, 3, 2, K.ironHi);
  for (let x = 6; x < w - 6; x += 16) { rect(g, x, 0, 3, 7, K.iron); px(g, x + 1, 0, K.brassHi); }                                                                            /* the cross-ribs, studded */
  return c; }); }
/* THE CRYPT GRATE's chains: the two the grate swung up on, slack under it */
export function drawGrateChains(g, x0, x1, y, time) { for (const x of [x0 + 3, x1 - 4]) drawChainLinks(g, x, y + 7, y + 20, time, 1.2); }

/* ================================================================ HOLY FIRE */
/* one tongue of holy fire: white core, pale mid, gold skin, an orange tip; `h` tall, `w` wide at the root, leaning and licking in time */
export function drawTongue(g, x, yBase, h, w, time, seed = 0) {
  h = Math.max(2, R(h));
  for (let i = 0; i < h; i++) { const k = i / h, ww = Math.max(1, R(w * (1 - Math.pow(k, 1.35)))), lean = R(Math.sin(time * 7 + seed + k * 3.2) * k * 2.2 + Math.sin(time * 12.5 + seed * 2) * k * 0.9);
    const x0 = R(x) - (ww >> 1) + lean, y = R(yBase) - i; const tip = k > 0.82;
    rect(g, x0, y, ww, 1, tip ? K.fireO : k > 0.55 ? K.fireG : K.fireG);
    if (ww > 2) { rect(g, x0 + 1, y, ww - 2, 1, k > 0.6 ? K.fireG : K.fireP); } if (ww > 4 && k < 0.7) rect(g, x0 + 2, y, ww - 4, 1, K.fireW); }
}
/* THE TROUGH. geo: { x0, x1 } world px of the channel's ends (x1 exclusive), y the floor line (the channel's bottom edge) - all on screen already; on: blazing. A stone-lined channel with a burner bed; blazing, it is tongues and sparks; cooled, a bed of cinders with the iron grate laid over it */
export function drawTroughFire(g, x0, x1, y, on, time, o = {}) {
  const w = x1 - x0, seed = o.seed || 0;
  /* the lining: a soot-black bed, a brass burner rail with its jets, and the channel's inner shadow */
  rect(g, x0, y - 6, w, 6, '#17131c'); rect(g, x0, y - 7, w, 1, '#2a2530'); rect(g, x0, y - 2, w, 2, K.brassLo); rect(g, x0, y - 2, w, 1, K.brass);
  for (let x = x0 + 2; x < x1 - 1; x += 8) { rect(g, x, y - 4, 3, 2, K.brass); px(g, x + 1, y - 4, K.brassHi); }                                              /* the jets */
  for (let x = x0; x < x1; x += 16) { px(g, x + 1, y - 9, '#3a3446'); px(g, x + 1, y - 8, '#3a3446'); }
  if (on) {
    for (let x = x0 + 1; x < x1 - 1; x += 2) { const sx = x, n = Math.sin(time * 9 + sx * 0.5 + seed) + Math.sin(time * 5.3 - sx * 0.23); rect(g, sx, y - 6, 2, 4, (sx >> 1) & 1 ? K.fireO : K.fireR); if (n > 0.6) rect(g, sx, y - 7, 2, 1, K.fireG); }
    for (let x = x0 + 3, i = 0; x < x1 - 2; x += 4, i++) { const n = Math.sin(time * 8 + i * 1.9 + seed) + Math.sin(time * 4.7 + i * 0.7); drawTongue(g, x, y - 5, 12 + 5 * n + (i % 3) * 4, 4, time, i * 1.7 + seed); }
    for (let i = 0; i < Math.max(3, w >> 4); i++) { const t = (time * 0.9 + i * 0.37 + seed) % 1, sx = x0 + 6 + ((i * 53 + seed * 7) % Math.max(1, w - 12)); g.globalAlpha = 1 - t; rect(g, sx + R(Math.sin(t * 8 + i) * 3), y - 12 - R(t * 30), 1, 1, i & 1 ? K.fireP : K.fireG); g.globalAlpha = 1; }   /* sparks */
  } else {
    for (let x = x0; x < x1; x++) { const hh = hash(x, 5) % 7; rect(g, x, y - 6, 1, 4, hh < 2 ? K.coal : hh < 4 ? K.coalHi : K.ash); if (hh === 6) px(g, x, y - 7, K.ashHi); }   /* cinders */
    for (let x = x0 + 2; x < x1 - 1; x += 3) { const p = 0.5 + 0.5 * Math.sin(time * 2.3 + x * 0.7 + seed), hh = hash(x, 9) % 4; if (hh < 3) { g.globalAlpha = 0.5 + 0.5 * p; rect(g, x, y - 5, 2, 1, K.fireO); px(g, x, y - 4, K.fireR); g.globalAlpha = 1; } if (hh === 0 && p > 0.8) px(g, x, y - 7, K.fireG); }   /* breathing coals */
    for (let i = 0; i < Math.max(2, w >> 5); i++) { const t = (time * 0.5 + i * 0.41 + seed) % 1; g.globalAlpha = 0.45 * (1 - t); rect(g, x0 + 8 + ((i * 41 + seed * 11) % Math.max(1, w - 16)) + R(Math.sin(t * 6 + i) * 2), y - 9 - R(t * 14), 1, 1, '#9a9ab0'); g.globalAlpha = 1; }   /* smoke */
    /* THE GRATE: iron laid flat across the cooled channel - the footing the player reads */
    rect(g, x0, y - 9, w, 1, K.ironHi); rect(g, x0, y - 8, w, 1, K.ironLo); for (let x = x0 + 1; x < x1; x += 3) { rect(g, x, y - 8, 1, 3, K.iron); px(g, x, y - 8, K.ironHi); } rect(g, x0, y - 6, w, 1, K.ironLo);
    for (let x = x0; x < x1; x += 16) { rect(g, x, y - 10, 2, 5, K.iron); px(g, x, y - 10, '#c4c2d8'); }
  }
}
/* the lamp's feed of light: an inlaid brass vein along the floor from the lamp to the trough; lit, bright dashes run toward the fire, snuffed it is a dull dead line */
export function drawFeed(g, k0, k1, y, towardRight, lit, time) {
  rect(g, k0, y, k1 - k0, 1, lit ? '#6a5a28' : '#2e2a36');
  if (!lit) { for (let x = k0 + 2; x < k1; x += 8) px(g, x, y, '#4a4656'); return; }
  const n = Math.floor((k1 - k0) / 6);
  for (let i = 0; i < n; i++) { const ph = ((i / 3 + (towardRight ? 1 : -1) * time * 2.2) % 1 + 1) % 1, x = k0 + i * 6; g.globalAlpha = 0.35 + 0.65 * (1 - ph); rect(g, x, y - 1, 3, 2, ph < 0.34 ? K.fireP : K.fireG); g.globalAlpha = 1; }
  px(g, k0, y - 1, K.fireG); px(g, k1 - 1, y - 1, K.fireG);
}

/* ================================================================ THE CHANTRY */
/* a relay brazier: an iron bowl on a tripod, a rack of wax tapers hooked to one side. 26 x 34; lit: coals glow and the flame is laid at RB_WICK */
export const RB_WICK = [13, 13];
export function bakeRelayBrazier(lit) { return once('relayb' + lit, () => { const [c, g] = canvas(26, 34);
  for (const [a, b] of [[8, 33], [13, 33], [18, 33]]) line(g, 13, 20, a < 13 ? a - 2 : a > 13 ? a + 2 : a, b, K.iron); rect(g, 12, 20, 2, 12, K.iron); rect(g, 12, 20, 1, 12, K.ironHi); rect(g, 8, 32, 10, 2, K.ironLo);
  rect(g, 5, 15, 16, 5, K.iron); rect(g, 5, 15, 16, 1, K.ironHi); rect(g, 7, 20, 12, 2, K.ironLo); rect(g, 4, 14, 18, 2, K.brass); rect(g, 4, 14, 18, 1, K.brassHi); rect(g, 4, 15, 18, 1, K.brassLo);   /* the bowl, a brass rim */
  for (let x = 6; x < 20; x += 3) px(g, x, 17, K.ironHi);
  if (lit) { rect(g, 6, 13, 14, 2, '#6a2a1a'); for (let x = 7; x < 19; x += 2) px(g, x, 13, (x >> 1) & 1 ? K.fireO : K.fireR); px(g, 12, 12, K.fireG); px(g, 15, 12, K.fireO); }
  else { rect(g, 6, 13, 14, 2, K.ash); for (let x = 7; x < 19; x += 3) px(g, x, 13, K.ashHi); px(g, 11, 13, K.coal); px(g, 16, 13, K.coalHi); }
  line(g, 21, 17, 24, 12, K.iron); rect(g, 23, 5, 1, 7, K.iron); line(g, 24, 5, 25, 4, K.iron);                                                                                 /* the taper rack's arm */
  for (const [x, h] of [[21, 9], [23, 11], [25, 8]]) { rect(g, x - 1, 12 - h + 4, 1, h, '#e8dcc0'); px(g, x - 1, 12 - h + 3, K.wick); }
  outline(c, O); return c; }); }
/* THE CHANTRY DOOR: oak boards, three iron straps with scroll ends, a brass bell on a roundel with the lamp's flame over it, a ring-pull. 16 wide x h; the lamp at the foot of the door lights it open */
export function bakeChantryDoor(h) { return once('chdoor' + h, () => { const [c, g] = canvas(16, h);
  rect(g, 0, 0, 16, h, K.oakMid); for (let x = 0; x < 16; x += 4) { rect(g, x, 0, 1, h, K.oakLo); rect(g, x + 1, 0, 1, h, K.oakHi); rect(g, x + 2, 0, 1, h, '#74502e'); }
  rect(g, 0, 0, 16, 2, K.oakLo); rect(g, 0, h - 2, 16, 2, K.oakLo);
  for (const y of [5, Math.floor(h / 2) - 1, h - 12]) { rect(g, 0, y, 16, 3, K.iron); rect(g, 0, y, 16, 1, K.ironHi); rect(g, 0, y + 2, 16, 1, K.ironLo); px(g, 2, y + 1, K.brassHi); px(g, 13, y + 1, K.brassHi); px(g, 8, y + 1, K.brassLo); }
  const by = Math.floor(h / 2) - 14; circle(g, 8, by + 7, 7, K.ironLo); circle(g, 8, by + 7, 6, '#4a3a26'); circle(g, 8, by + 7, 5, K.brassLo);
  fillPoly(g, [[5, by + 10], [11, by + 10], [10, by + 6], [9, by + 4], [7, by + 4], [6, by + 6]], K.brass); rect(g, 6, by + 6, 1, 4, K.brassHi); rect(g, 5, by + 10, 7, 1, K.brassLo); px(g, 8, by + 11, K.brassHi); px(g, 8, by + 3, K.brassHi);   /* the bell */
  circle(g, 12, Math.floor(h / 2) + 10, 2, K.ironLo); circle(g, 12, Math.floor(h / 2) + 10, 1, K.iron); px(g, 12, Math.floor(h / 2) + 13, K.ironLo);     /* the ring-pull */
  outline(c, O); return c; }); }
/* A CHOIR STALL: a high carved back with pinnacles and a canopy rail, the poppyhead ends, a misericord seat, the front panelled in tracery down to the floor/fire. w tiles; 32 tall: the seat is the board's row (at y = 16) */
export function bakeStall(w) { return once('stall' + w, () => { const W = w * 16, [c, g] = canvas(W, 32);
  rect(g, 1, 0, W - 2, 14, K.oakMid); rect(g, 1, 0, W - 2, 1, K.oakHi); rect(g, 1, 13, W - 2, 1, K.oakLo);                                                                       /* the high back */
  for (let x = 4; x < W - 7; x += 8) { rect(g, x, 3, 6, 9, K.oak); rect(g, x, 3, 6, 1, K.oakHi); rect(g, x + 2, 4, 2, 4, K.oakLo); px(g, x + 2, 9, K.oakHi); px(g, x + 3, 9, K.oakHi); px(g, x + 1, 2, K.oakLo); px(g, x + 4, 2, K.oakLo); }   /* tracery */
  for (let x = 1; x <= W - 4; x += 8) { fillPoly(g, [[x, 3], [x + 3, 3], [x + 1.5, -1]], K.oakHi); rect(g, x, 3, 3, 1, K.oakLo); }                                                   /* pinnacles */
  rect(g, 0, 14, 4, 18, K.oakLo); rect(g, W - 4, 14, 4, 18, K.oakLo); rect(g, 1, 14, 2, 18, K.oakMid); rect(g, W - 3, 14, 2, 18, K.oakMid); circle(g, 2, 14, 2.2, K.oakHi); circle(g, W - 3, 14, 2.2, K.oakHi);   /* the poppyhead ends */
  rect(g, 2, 16, W - 4, 2, K.oakHi); rect(g, 2, 18, W - 4, 1, K.oakLo);                                                                                                           /* the seat */
  for (let x = 5; x < W - 7; x += 9) { rect(g, x, 20, 7, 11, K.oak); rect(g, x, 20, 7, 1, K.oakHi); rect(g, x + 2, 22, 3, 7, K.oakLo); fillPoly(g, [[x + 1, 22], [x + 6, 22], [x + 3.5, 20]], K.oakMid); }   /* the panelled front */
  rect(g, 0, 30, W, 2, K.oakLo); outline(c, O); return c; }); }
/* a bell-rope hung in the chantry: a pale rope, a red sally. 6 x 54 */
export function bakeBellRope() { return once('bellrope', () => { const [c, g] = canvas(6, 54); for (let y = 0; y < 44; y++) { px(g, 2 + (y & 1), y, '#c8b890'); px(g, 3, y, '#a89870'); } rect(g, 1, 38, 4, 12, '#b83a2e'); rect(g, 1, 38, 1, 12, '#e0604a'); rect(g, 1, 46, 4, 2, '#e8dcc0'); rect(g, 2, 50, 2, 4, '#c8b890'); outline(c, O); return c; }); }
