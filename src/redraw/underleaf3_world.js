// underleaf3_world.js - UNDERLEAF 3's RULE MACHINES, DRAWN (claude/underleafart). src/potion-hands.js owns what they DO; this draws what they ARE (A3: the rule's state is drawn):
//   HER JARS      a pot-bellied glass jar, cork and twine, the liquid in its colour (GREEN grows, BLUE floats, RED burns), a label tag in the colour; at rest it glows softly in that colour
//   HER SHELVES   a rush board on bone legs with a coloured wax seal; take the jar and an EMPTY CRADLE shows with the colour's motes gathering into it and the jar fading back in (it REFILLS, drawn)
//   HER CAULDRONS an iron belly on three feet over embers, the brew in the jar's colour bubbling, steam; while it refills the brew churns and a jar forms in it
//   SEED BEDS     a ring of pale stones round dark loam, a seedling and a glint of the seed; grown: a bloom at its foot and a green shimmer that runs up the new vine (the vine itself is the tile kit's)
//   THORN HEDGES  the tile kit draws the bramble; this adds glints, the fire climbing a burning hedge, and what a burnt one leaves (a blackened stump row, ash, a curl of smoke)
//   FLOAT WELLS   a ring of mossy stones round a blue spring: motes rise as far as the bubble will carry you
//   BUBBLES       a soap-bubble: a bright rim, a pale blue body, two highlights, a sliver of rainbow
//   PATCHES       a green snare of thorned tendrils / a red patch of flame (hers and yours)
//   HER MARKS     told spots on the floor: a flame, a jar in its colour, a gout
//   HER CAULDRON  (the arena's landmark: a great iron cauldron over a hearth, the brew green; in phase two it boils up red and spits)
// ART ONLY: nothing here reads or changes a hitbox or a number.
import { canvas, outline, mulberry } from '../px.js';
import { GLOW, CANDLE, JARC, mix, hash } from './underleaf3_pal.js';

const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const R = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); };
const rc = Math.round, OUT = '#1b1626';
export const COL = JARC;
const rgbOf = h => h.slice(1).match(/../g).map(x => parseInt(x, 16)).join(',');
const halo = rgb => once('halo' + rgb, () => { const [c, g] = canvas(48, 48), gr = g.createRadialGradient(24, 24, 0, 24, 24, 24); gr.addColorStop(0, 'rgba(' + rgb + ',0.5)'); gr.addColorStop(0.4, 'rgba(' + rgb + ',0.16)'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(0, 0, 48, 48); return c; });
const glowAt = (g, rgb, x, y, w, h, a) => { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; g.drawImage(halo(rgb), rc(x - w / 2), rc(y - h / 2), w, h); g.restore(); };

/* ------------------------------------------------------------------ THE JAR ------------------------------------------------------------------ */
/* 11 x 15, anchored at the bottom centre (5, 14): cork + twine neck, a pot belly of glass, the liquid in its colour to a surface line, a light side and a dark side, a specular, a bone tag */
export const jarSpr = (col, full = 1) => once('jar' + col + full, () => {
  const J = COL[col], [c, g] = canvas(11, 15), cx = 5, cy = 9.5, rx = 4.3, ry = 4.4, surf = 7 + (full < 1 ? 2 : 0);
  for (let y = 0; y < 15; y++) for (let x = 0; x < 11; x++) { const dx = (x - cx) / rx, dy = (y - cy) / ry; if (dx * dx + dy * dy > 1) continue;
    const edge = dx * dx + dy * dy > 0.66, liquid = y >= surf;
    if (liquid) R(g, edge ? J[2] : x <= 3 ? J[1] : x >= 7 ? J[0] : mix(J[0], J[1], 0.35), x, y, 1, 1); else R(g, edge ? '#8a98a0' : x <= 3 ? '#e0ecf0' : '#b8c8d0', x, y, 1, 1); }
  R(g, J[3], 3, surf, 4, 1);                                                                      /* the bright surface line */
  R(g, '#cfe0e8', 4, 4, 3, 3); R(g, '#8a98a0', 3, 4, 1, 3); R(g, '#8a98a0', 7, 4, 1, 3);       /* the neck */
  R(g, '#cbb888', 3, 4, 5, 1); R(g, '#a8946a', 4, 5, 3, 1);                                      /* the twine */
  R(g, '#8a5a2a', 4, 1, 3, 3); R(g, '#c89a5a', 4, 1, 1, 3); R(g, '#5a3a1e', 6, 2, 1, 2);        /* the cork */
  R(g, '#fff', 2, surf + 1, 1, 2);                                                                /* the specular */
  R(g, '#e8dcc0', 5, 10, 2, 2); R(g, J[0], 5, 11, 2, 1);                                          /* the bone tag, marked in the colour */
  outline(c, OUT); return c; });
/* the outline fills the sheet's empty pixels (no growth): 11 x 15, anchor = bottom centre */
const JAR_AX = 5, JAR_AY = 15;
/* the told arc's glow, her marks and patches use these: */
export const jarCol = k => COL[k] || COL.red;

/* ------------------------------------------------------------------ SHELVES, CAULDRONS ------------------------------------------------------------------ */
const shelfSpr = col => once('shelf' + col, () => { const J = COL[col], [c, g] = canvas(24, 10);
  R(g, '#e8dcc0', 3, 3, 2, 7); R(g, '#9c8c68', 4, 3, 1, 7); R(g, '#e8dcc0', 19, 3, 2, 7); R(g, '#9c8c68', 20, 3, 1, 7);                                  /* bone legs */
  R(g, '#8a7040', 1, 1, 22, 3); R(g, '#b89a58', 1, 1, 22, 1); R(g, '#5a4426', 1, 3, 22, 1);                                                                    /* the rush board */
  for (let k = 0; k < 22; k += 3) R(g, '#6a5430', 1 + k, 2, 1, 1);
  R(g, '#cbb888', 5, 0, 2, 4); R(g, '#cbb888', 17, 0, 2, 4);                                                                                                  /* the twine lashings */
  R(g, J[2], 10, 4, 4, 5); R(g, J[0], 11, 5, 2, 3); R(g, J[1], 11, 5, 1, 1);                                                                                  /* her wax seal, in the colour: the rack says what it holds */
  outline(c, OUT); return c; });
/* the shelf at its foot (hx, hy = the floor), and its jar; j.retT counts down to the refill (retMax is set when it was taken) */
export function drawShelf(g, j, cx, cy, time) {
  const x = rc(j.hx - cx), y = rc(j.hy - cy);
  if (j.brew) return drawBrewpot(g, j, cx, cy, time);
  const sp = shelfSpr(j.col); g.drawImage(sp, x - 12, y - 10);
  if (j.state === 'return') {   /* THE EMPTY CRADLE: a dark ring where the jar stood, the colour's motes gathering into it, the jar fading back in as it refills */
    const k = j.retMax > 0 ? Math.max(0, Math.min(1, 1 - j.retT / j.retMax)) : 0.5, J = COL[j.col];
    g.globalAlpha = 0.6; R(g, '#0a0806', x - 4, y - 11, 8, 2); g.globalAlpha = 1;
    for (let q = 0; q < 5; q++) { const ph = (time * 0.9 + q / 5) % 1, a = (1 - ph) * (0.35 + 0.65 * k), ang = q * 1.26 + time; g.globalAlpha = a; R(g, J[1], x + Math.cos(ang) * (9 * (1 - k * 0.6)) * (1 - ph), y - 18 + ph * 7 + Math.sin(ang) * 3 * (1 - ph), 1, 1); }
    g.globalAlpha = 0.12 + 0.7 * k * k; g.drawImage(jarSpr(j.col), x - JAR_AX, y - 10 - JAR_AY); g.globalAlpha = 1; }
}
/* A BREWPOT: an iron belly on three feet over embers; the brew in the jar's colour; while it refills the brew churns and a jar forms in it */
function drawBrewpot(g, j, cx, cy, time) {
  const x = rc(j.hx - cx), y = rc(j.hy - cy), J = COL[j.col], busy = j.state === 'return', k = busy && j.retMax > 0 ? Math.max(0, Math.min(1, 1 - j.retT / j.retMax)) : 1;
  const sp = once('pot' + j.col, () => { const [c, gg] = canvas(26, 22);
    R(gg, '#2a2420', 2, 17, 3, 5); R(gg, '#2a2420', 21, 17, 3, 5); R(gg, '#2a2420', 11, 18, 4, 4);                                                               /* the feet */
    for (let yy = 3; yy < 19; yy++) { const t = (yy - 3) / 15, w = Math.round(10.5 * Math.sin(Math.min(1, 0.45 + t * 0.7) * Math.PI / 2 + 0.4)); R(gg, yy < 7 ? '#46403a' : '#34302a', 13 - w, yy, w * 2, 1); R(gg, '#62594e', 13 - w, yy, 2, 1); R(gg, '#1e1a16', 13 + w - 2, yy, 2, 1); }
    R(gg, '#56504a', 2, 2, 22, 3); R(gg, '#7a7060', 2, 2, 22, 1); R(gg, '#1e1a16', 2, 4, 22, 1);                                                               /* the rim */
    R(gg, '#46403a', 0, 5, 3, 2); R(gg, '#46403a', 23, 5, 3, 2); outline(gg.canvas, OUT); return c; });
  g.drawImage(sp, x - 14, y - 23);
  /* the embers under it */
  const fl = Math.floor(time * 9 + j.hx) % 2; R(g, fl ? '#ff9a5c' : '#ffd36b', x - 6, y - 2, 3, 2); R(g, fl ? '#ffd36b' : '#ff9a5c', x + 4, y - 2, 3, 2); R(g, '#8a2a14', x - 2, y - 1, 5, 1);
  /* the brew: its surface in the colour, lit, rippling; busy = bubbling harder */
  R(g, J[2], x - 10, y - 20, 21, 2); R(g, J[0], x - 9, y - 21, 19, 1); R(g, J[1], x - 6 + rc(Math.sin(time * (busy ? 9 : 3) + j.hx) * 3), y - 21, 4, 1);
  const nb = busy ? 5 : 3; for (let q = 0; q < nb; q++) { const ph = (time * (busy ? 1.6 : 0.8) + q / nb + j.hx * 0.01) % 1; g.globalAlpha = (1 - ph) * 0.8; R(g, J[1], x - 7 + q * (14 / nb), y - 22 - ph * (busy ? 16 : 10), 2, 2); R(g, J[3], x - 7 + q * (14 / nb), y - 22 - ph * (busy ? 16 : 10), 1, 1); } g.globalAlpha = 1;
  /* steam, a pale curl in the colour */
  for (let q = 0; q < 3; q++) { const ph = (time * 0.35 + q / 3) % 1; g.globalAlpha = 0.3 * (1 - ph); R(g, mix(J[1], '#ffffff', 0.5), x - 4 + q * 4 + rc(Math.sin(ph * 6 + q) * 3), y - 26 - ph * 24, 3, 3); } g.globalAlpha = 1;
  glowAt(g, rgbOf(J[0]), x, y - 20, 44, 34, 0.35 + (busy ? 0.25 : 0.1) * Math.sin(time * 4 + j.hx));
  if (busy && k > 0.05) { g.globalAlpha = 0.15 + 0.8 * k * k; g.drawImage(jarSpr(j.col, 1), x - JAR_AX, y - 20 - JAR_AY + rc((1 - k) * 8)); g.globalAlpha = 1; }   /* the jar forming on the rim */
}
/* a jar in the world: at rest on its shelf (soft glow in its colour: A6), held, or flying (turning, a trail) */
export function drawJar(g, j, cx, cy, time) {
  const x = rc(j.x - cx), y = rc(j.y - cy), J = COL[j.col];
  if (j.state === 'rest') { const base = y - (j.brew ? 8 : 10), a = 0.32 + 0.2 * Math.sin(time * 3.2 + j.hx); glowAt(g, rgbOf(J[0]), x, base - 7, 34, 30, a); g.drawImage(jarSpr(j.col), x - JAR_AX, base - JAR_AY + rc(Math.sin(time * 2 + j.hx) * 0.5));
    const ph = (time * 0.7 + j.hx * 0.1) % 1; g.globalAlpha = 0.7 * (1 - ph); R(g, J[3], x - 2 + rc(Math.sin(ph * 6 + j.hx) * 2), base - 16 - ph * 10, 1, 1); g.globalAlpha = 1; return; }
  if (j.state === 'fly') { const s = Math.floor(time * 16) % 4; g.save(); g.translate(x, y - 2); g.rotate(s * Math.PI / 2 * 0.5 + time * 8); g.drawImage(jarSpr(j.col), -JAR_AX, -7); g.restore();
    for (let q = 1; q <= 3; q++) { g.globalAlpha = 0.5 / q; R(g, J[1], x - (j.vx || 0) * 0.012 * q, y - 5 - (j.vy || 0) * 0.012 * q, 2, 2); } g.globalAlpha = 1; return; }
  /* held */ g.drawImage(jarSpr(j.col), x - JAR_AX, y - 9); glowAt(g, rgbOf(J[0]), x, y - 2, 26, 24, 0.28);
}
export function drawHeldJar(g, col, x, y, time) { g.drawImage(jarSpr(col), rc(x) - JAR_AX, rc(y) - 9); glowAt(g, rgbOf(COL[col][0]), x, y - 4, 26, 24, 0.28 + 0.1 * Math.sin(time * 5)); }
/* her flying jar (the Grandmother's hurl): a turning jar and a trail */
export function drawHurledJar(g, p, cx, cy, time) { const x = rc(p.x - cx), y = rc(p.y - cy), J = COL[p.col || 'red'];
  g.save(); g.translate(x, y); g.rotate(time * 11); g.drawImage(jarSpr(p.col || 'red'), -JAR_AX, -7); g.restore();
  for (let q = 1; q <= 4; q++) { g.globalAlpha = 0.5 / q; R(g, J[1], x - (p.vx || 0) * 0.013 * q, y - (p.vy || 0) * 0.013 * q, 3, 3); } g.globalAlpha = 1; glowAt(g, rgbOf(J[0]), x, y, 30, 30, 0.4); }

/* ------------------------------------------------------------------ SEED BEDS ------------------------------------------------------------------ */
const bedSpr = () => once('bed', () => { const [c, g] = canvas(26, 12), r = mulberry(5);
  R(g, '#241a10', 3, 5, 20, 6); R(g, '#3a2a18', 4, 4, 18, 3); R(g, '#54402a', 5, 4, 8, 1);                                                                     /* the loam, heaped */
  for (const [sx, sw] of [[0, 4], [4, 4], [8, 4], [12, 4], [16, 4], [20, 4]]) { R(g, '#cfc4a8', sx, 7 + (sx % 8 ? 0 : 1), sw, 4); R(g, '#f0e8d0', sx, 7 + (sx % 8 ? 0 : 1), sw, 1); R(g, '#8a7e64', sx + sw - 1, 8, 1, 3); }   /* the ring of pale stones */
  for (let i = 0; i < 6; i++) R(g, r() < 0.5 ? '#54402a' : '#241a10', 5 + ((r() * 15) | 0), 4 + ((r() * 3) | 0), 1, 1);
  outline(c, OUT); return c; });
export function drawBed(g, b, cx, cy, time) {
  const x = rc(b.x - cx), y = rc(b.y - cy);
  if (!b.grown) { g.drawImage(bedSpr(), x - 14, y - 13);
    const s = Math.sin(time * 3 + b.x) * 0.5, J = COL.green;                                                                                                  /* a seedling, waiting, with a glint of the seed under it */
    R(g, J[2], x, y - 12, 1, 5); R(g, J[0], x - 2 + rc(s), y - 11, 2, 1); R(g, J[1], x + 1, y - 10, 2, 1); R(g, J[3], x - 2 + rc(s), y - 12, 1, 1);
    const gl = 0.5 + 0.5 * Math.sin(time * 2.6 + b.x * 0.3); g.globalAlpha = 0.5 + 0.4 * gl; R(g, '#fff0b0', x - 6, y - 9, 1, 1); R(g, '#ffd36b', x + 7, y - 8, 1, 1); g.globalAlpha = 1;
    glowAt(g, rgbOf(J[0]), x, y - 9, 30, 20, 0.12 + 0.12 * gl); return; }
  /* grown: a bloom at its foot and a green shimmer running up the new vine */
  g.drawImage(bedSpr(), x - 14, y - 13); const J = COL.green;
  for (const [fx, fy] of [[-8, -12], [-1, -14], [7, -12]]) { R(g, J[0], x + fx, y + fy, 1, 4); R(g, '#f0ecd0', x + fx - 1, y + fy - 2, 3, 1); R(g, '#f0ecd0', x + fx, y + fy - 3, 1, 3); R(g, '#e0b040', x + fx, y + fy - 2, 1, 1); }
  const k = b.growT === undefined ? 1 : b.growT;
  if (b.grow === 'ladder') { const bot = y - 13, top = rc(b.top * 16 - cy), h = bot - top;
    if (k < 1 || (time * 1.2) % 3 < 1) { const ph = k < 1 ? k : ((time * 1.2) % 3); g.globalAlpha = 0.6 * (1 - Math.min(1, ph * 0.5)); R(g, J[3], x - 6, bot - h * Math.min(1, ph), 13, 2); g.globalAlpha = 1; }
    for (let q = 0; q < 3; q++) { const ph = (time * 0.4 + q / 3) % 1; g.globalAlpha = 0.6 * (1 - ph); R(g, J[1], x - 5 + (q * 5), bot - ph * h, 1, 1); g.globalAlpha = 1; } }
  else { const bx0 = rc(b.x0 * 16 - cx), by = rc(b.row * 16 - cy), w = (b.x1 - b.x0 + 1) * 16, ph = k < 1 ? k : ((time * 0.8) % 3) / 1.5;
    if (ph < 1) { g.globalAlpha = 0.6 * (1 - ph * 0.6); R(g, J[3], bx0 + w * ph - 3, by, 4, 3); g.globalAlpha = 1; } }
  glowAt(g, rgbOf(J[0]), x, y - 9, 36, 24, 0.14);
}

/* ------------------------------------------------------------------ THORN HEDGES (the tile kit draws the bramble; this is the glint, the fire, and what burnt) ------------------------------------------------------------------ */
export function drawHedge(g, h, cx, cy, time) {
  const x0 = rc(h.x0 * 16 - cx), y0 = rc(h.y0 * 16 - cy), w = (h.x1 - h.x0 + 1) * 16, hh = (h.y1 - h.y0 + 1) * 16;
  if (h.burnt) {   /* WHAT BURNT: a row of blackened stumps and ash at its foot, a thread of smoke that thins out */
    const by = y0 + hh; R(g, '#1a1410', x0 - 1, by - 3, w + 2, 3); for (let q = 0; q < w; q += 4) { R(g, '#0e0a08', x0 + q, by - 5 - ((q * 7) % 4), 2, 3 + ((q * 7) % 4)); R(g, '#5a5048', x0 + q + 2, by - 3, 2, 1); }
    const sm = Math.max(0, 1 - (time % 6) / 6); for (let q = 0; q < 2; q++) { const ph = (time * 0.3 + q / 2) % 1; g.globalAlpha = 0.18 * (1 - ph); R(g, '#8a8478', x0 + (q ? w - 6 : 4) + rc(Math.sin(ph * 5 + q) * 2), by - 6 - ph * 22, 3, 3); } g.globalAlpha = 1; void sm; return; }
  /* a glint of the thorns now and then (the bramble is tall; red is the answer) */
  for (let q = 0; q < 3; q++) { const ph = (time * 0.5 + q * 0.33 + h.x0 * 0.1) % 1; if (ph < 0.18) { g.globalAlpha = 1 - ph * 5; R(g, '#fff6d8', x0 + 2 + ((q * 7 + h.x0) % (w - 4)), y0 + 4 + ((q * 13 + h.y0) % Math.max(1, hh - 8)), 1, 1); g.globalAlpha = 1; } }
  if (h.burnT > 0) { const k = Math.min(1, h.burnT / 0.9);   /* ON FIRE: the flames climb the bramble and lick over its top; the leaves curl dark */
    g.globalAlpha = 0.5 * k; R(g, '#0e0a08', x0, y0 + hh * (1 - k), w, hh * k); g.globalAlpha = 1;
    for (let q = 0; q < w / 3; q++) { const fh = 6 + ((q * 5 + rc(time * 14)) % 10), fy = y0 + hh - fh * k - ((q * 11 + rc(time * 22)) % Math.max(4, hh * k)); const hot = (q + rc(time * 14)) % 2;
      R(g, hot ? '#ff9a5c' : '#d8502a', x0 + q * 3, fy, 3, fh * 0.6); R(g, hot ? '#ffd36b' : '#ff9a5c', x0 + q * 3 + 1, fy + 2, 1, fh * 0.35); }
    glowAt(g, '255,154,92', x0 + w / 2, y0 + hh * 0.5, w + 40, hh + 20, 0.5 * k); }
}

/* ------------------------------------------------------------------ FLOAT WELLS ------------------------------------------------------------------ */
const wellSpr = () => once('well', () => { const [c, g] = canvas(30, 12), r = mulberry(8);
  R(g, '#241a10', 2, 5, 26, 6); R(g, '#3a4a30', 3, 3, 24, 4);                                                                                                 /* the bowl of the spring */
  for (let k = 0; k < 7; k++) { const sx = k * 4 + 1, sh = 3 + ((k * 5) % 3); R(g, '#6a7a5a', sx, 7 - sh + 3, 4, sh + 1); R(g, '#9aae80', sx, 7 - sh + 3, 4, 1); R(g, '#3a4a30', sx + 3, 8, 1, 3); R(g, '#4a7a30', sx, 7 - sh + 3, 2, 1); }   /* mossy stones */
  R(g, '#2e5a8a', 5, 4, 20, 3); R(g, '#4a8fd8', 6, 4, 18, 2); R(g, '#a8d8ff', 8, 4, 6, 1);                                                                    /* the water */
  outline(c, OUT); return c; });
export function drawWell(g, w, cx, cy, time) {
  const x = rc(w.x - cx), y = rc(w.y - cy), J = COL.blue, hpx = w.h * 16;
  g.drawImage(wellSpr(), x - 15, y - 13);
  for (let k = 0; k < 6; k++) { const ph = (time * 0.55 + k / 6) % 1; g.globalAlpha = 0.6 * (1 - ph); R(g, J[1], x - 8 + k * 3 + rc(Math.sin(ph * 7 + k) * 2), y - 12 - ph * hpx * 0.55, 2, 2); R(g, J[3], x - 8 + k * 3 + rc(Math.sin(ph * 7 + k) * 2), y - 12 - ph * hpx * 0.55, 1, 1); } g.globalAlpha = 1;
  g.globalAlpha = 0.07 + 0.05 * Math.sin(time * 2); R(g, J[1], x - 6, y - 12 - hpx * 0.55, 12, hpx * 0.55); g.globalAlpha = 1;   /* the faint column of the lift */
  glowAt(g, rgbOf(J[0]), x, y - 10, 40, 22, 0.28 + 0.1 * Math.sin(time * 3 + w.x));
  if (w.used) { g.globalAlpha = 0.4; R(g, J[3], x - 1, y - 14, 2, 1); g.globalAlpha = 1; }
}

/* ------------------------------------------------------------------ BUBBLES ------------------------------------------------------------------ */
export function drawBubble(g, b, cx, cy, time, bubbleR) {
  const x = rc(b.x - cx), y = rc(b.y - cy), pop = b.state === 'pop', r = pop ? bubbleR + b.t * 30 : bubbleR + Math.sin(time * 6 + b.x) * 1.2, J = COL.blue, al = pop ? Math.max(0, 0.65 - b.t * 2.6) : 0.7;
  g.save(); g.globalAlpha = al * 0.38; g.fillStyle = J[0]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.globalAlpha = al * 0.55; const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.7)'); gr.addColorStop(0.6, 'rgba(168,216,255,0.08)'); gr.addColorStop(1, 'rgba(120,180,255,0.5)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.globalAlpha = al; g.strokeStyle = J[1]; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
  g.strokeStyle = '#ffffff'; g.beginPath(); g.arc(x, y, r - 2, 3.6, 4.5); g.stroke();                                    /* the highlight arc */
  g.globalAlpha = al * 0.6; g.strokeStyle = '#ffb8e8'; g.beginPath(); g.arc(x, y, r - 1, 0.5, 1.2); g.stroke(); g.strokeStyle = '#b8ffd8'; g.beginPath(); g.arc(x, y, r - 1, 1.3, 1.8); g.stroke();   /* a sliver of rainbow */
  g.globalAlpha = al; R(g, '#ffffff', x - rc(r * 0.5), y - rc(r * 0.55), 2, 2); R(g, '#ffffff', x - rc(r * 0.5) + 3, y - rc(r * 0.55) - 1, 1, 1); g.restore();
  glowAt(g, rgbOf(J[0]), x, y, r * 3, r * 3, 0.22 * al);
}

/* ------------------------------------------------------------------ PATCHES (a snare of vines, a patch of fire) ------------------------------------------------------------------ */
export function drawPatch(g, p, cx, cy, time) {
  const x = rc(p.x - cx), y = rc(p.y - cy), a = 1 - p.t / p.life;
  if (p.col === 'green') { const J = COL.green; g.globalAlpha = Math.min(1, 1.5 * a);
    for (let k = -3; k <= 3; k++) { const hh = 5 + (Math.abs(k) % 2) * 3 + rc(Math.sin(time * 6 + k) * 1), sx = x + k * 4; R(g, J[2], sx, y - hh, 2, hh); R(g, J[0], sx, y - hh, 1, hh); R(g, '#d8ceae', sx + (k % 2 ? 1 : -1), y - hh - 1, 1, 1); if (Math.abs(k) % 2 === 0) { R(g, J[1], sx + 2, y - hh + 2, 3, 1); } }
    R(g, J[2], x - 14, y - 1, 28, 2); g.globalAlpha = 1; return; }
  g.globalAlpha = Math.min(1, 1.4 * a); for (let k = -3; k <= 3; k++) { const fl = Math.floor(time * 14 + k) % 2, fh = 5 + (k % 2 ? 2 : 0) + fl * 2, sx = x + k * 4; R(g, fl ? '#d8502a' : '#a83a1c', sx, y - fh, 4, fh); R(g, fl ? '#ff9a5c' : '#ffb070', sx + 1, y - fh + 2, 2, fh - 3); R(g, '#ffe6c0', sx + 1, y - 3, 1, 2); }
  g.globalAlpha = 1; glowAt(g, '255,154,92', x, y - 6, 48, 30, 0.4 * a);
}
/* HER ground patches (her hurled jars): thorns that rise under you / burning ground */
export function drawGranPatch(g, q, floorY, cx, cy, time) {
  const x = rc(q.x - cx), y = rc(floorY - cy), a = 1 - q.t / q.life; g.globalAlpha = Math.min(1, 1.6 * a);
  if (q.col === 'green') { const J = COL.green; for (let k = -5; k <= 5; k++) { const hh = 7 + ((k * 3) & 3) + rc(Math.sin(time * 7 + k) * 1), sx = x + k * 4; R(g, '#2a3a14', sx, y - hh, 2, hh); R(g, J[0], sx, y - hh + 2, 1, hh - 2); R(g, '#e8dcc0', sx, y - hh - 1, 1, 2); R(g, '#e8dcc0', sx + 1, y - hh + 3, 1, 1); }
    R(g, '#16200e', x - 22, y - 2, 44, 2); }
  else { for (let k = -5; k <= 5; k++) { const fl = Math.floor(time * 14 + k * 0.7) % 2, fh = 5 + ((k * 3) & 3) + fl * 2, sx = x + k * 4; R(g, fl ? '#d8502a' : '#a83a1c', sx, y - fh, 4, fh); R(g, fl ? '#ff9a5c' : '#ffb070', sx + 1, y - fh + 2, 2, Math.max(1, fh - 3)); }
    glowAt(g, '255,154,92', x, y - 6, 70, 34, 0.35 * a); }
  g.globalAlpha = 1;
}

/* ------------------------------------------------------------------ HER MARKS, HER FIREBALLS ------------------------------------------------------------------ */
export function drawMark(g, m, cx, cy, time) {
  const x = rc(m.x - cx), y = rc(m.y - cy), p = 0.5 + 0.5 * Math.sin(time * 12), col = m.kind === 'pot' ? COL[m.col || 'red'][1] : m.kind === 'gout' ? '#ffb070' : '#ff9a5c';
  g.globalAlpha = 0.45 + 0.4 * p; g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y - 1, m.r, m.r * 0.32, 0, 0, 7); g.stroke(); g.globalAlpha = 0.18; g.fillStyle = col; g.fill();
  g.globalAlpha = 0.5 + 0.4 * p;                                                                                       /* the glyph in the ring: what will land */
  if (m.kind === 'pot') { g.drawImage(jarSpr(m.col || 'red'), x - JAR_AX, y - JAR_AY - 1 + rc(Math.sin(time * 6) * 1)); }
  else if (m.kind === 'gout') { R(g, '#ff9a5c', x - 1, y - 8, 3, 6); R(g, '#ffd36b', x, y - 6, 1, 4); R(g, '#d8502a', x - 2, y - 4, 1, 3); R(g, '#d8502a', x + 2, y - 4, 1, 3); }
  else { R(g, '#d8502a', x - 2, y - 7, 5, 5); R(g, '#ffd36b', x - 1, y - 6, 3, 3); R(g, '#fff1a0', x, y - 5, 1, 1); R(g, '#ff9a5c', x - 1, y - 9, 1, 2); R(g, '#ff9a5c', x + 1, y - 10, 1, 3); }
  g.globalAlpha = 1;
}
export function drawBall(g, b, cx, cy, time) {   /* a fireball: a ball of witch-fire with a flickering tail */
  const x = rc(b.x - cx), y = rc(b.y - cy), fl = Math.floor(time * 20) % 2, sp = Math.hypot(b.vx || 0, b.vy || 0) || 1, ux = -(b.vx || 0) / sp, uy = -(b.vy || 0) / sp;
  for (let q = 1; q <= 5; q++) { g.globalAlpha = 0.55 / q + 0.05; R(g, q < 3 ? '#ff9a5c' : '#d8502a', x + ux * q * 3 + rc(Math.sin(time * 30 + q) * 1) - 2, y + uy * q * 3 - 2, 5 - (q >> 1), 5 - (q >> 1)); } g.globalAlpha = 1;
  R(g, '#d8502a', x - 5, y - 4, 10, 8); R(g, '#d8502a', x - 4, y - 5, 8, 10); R(g, fl ? '#ff9a5c' : '#ffb070', x - 4, y - 4, 8, 8); R(g, fl ? '#ffd36b' : '#fff1a0', x - 2, y - 3, 5, 5); R(g, '#ffffff', x - 1, y - 2, 2, 2);
  glowAt(g, '255,154,92', x, y, 44, 44, 0.5);
}

/* ------------------------------------------------------------------ HER GREAT CAULDRON (the arena's heart) ------------------------------------------------------------------ */
const bigPot = () => once('bigpot', () => { const [c, g] = canvas(60, 44), r = mulberry(6);
  R(g, '#241e1a', 6, 34, 6, 10); R(g, '#241e1a', 48, 34, 6, 10); R(g, '#241e1a', 27, 38, 6, 6);                                                                 /* the three feet */
  for (let y = 6; y < 38; y++) { const t = (y - 6) / 32, w = Math.round(28 * Math.sin(Math.min(1, 0.4 + t * 0.75) * Math.PI / 2 + 0.3)); R(g, y < 14 ? '#4a443e' : '#363029', 30 - w, y, w * 2, 1); R(g, '#6a6054', 30 - w, y, 4, 1); R(g, '#7a7060', 30 - w + 1, y, 1, 1); R(g, '#1a1612', 30 + w - 5, y, 5, 1); }
  for (let k = 0; k < 30; k++) R(g, r() < 0.5 ? '#2a2420' : '#46403a', 4 + ((r() * 50) | 0), 12 + ((r() * 22) | 0), 2, 1);                                    /* pits and soot */
  R(g, '#5a544c', 2, 4, 56, 5); R(g, '#8a8070', 2, 4, 56, 1); R(g, '#1e1a16', 2, 8, 56, 1); R(g, '#46403a', 0, 9, 5, 3); R(g, '#46403a', 55, 9, 5, 3);        /* the rim and its handle-lugs */
  R(g, '#d8c8a0', 22, 20, 14, 7); R(g, '#8a6a4a', 24, 22, 10, 3); for (const [bx, by] of [[18, 17], [38, 18], [28, 29]]) R(g, '#e8dcc0', bx, by, 3, 3);   /* a bone charm and her scratched mark */
  outline(c, OUT); return c; });
export function drawCauldron(g, cx0, floorY, cx, cy, time, fury, spit) {
  const x = rc(cx0 - cx), y = rc(floorY - cy); if (x < -90 || x > 760) return;
  const K = Math.max(0, Math.min(1, fury || 0)), br = K > 0 ? [mix(GLOW.mid, '#d8502a', K), mix(GLOW.c, '#ffb070', K), mix(GLOW.lo, '#6a2014', K)] : [GLOW.mid, GLOW.c, GLOW.lo];
  /* the hearth: banked coals and stones */
  R(g, '#14100c', x - 38, y - 4, 76, 4); for (let q = -4; q <= 4; q++) { R(g, '#5a5048', x + q * 8 - 3, y - 7 + (q % 2 ? 1 : 0), 6, 4); R(g, '#8a8070', x + q * 8 - 3, y - 7 + (q % 2 ? 1 : 0), 6, 1); }
  for (let q = -5; q <= 5; q++) { const fl = Math.floor(time * (9 + K * 8) + q) % 2, fh = 4 + ((q * 3) & 3) + K * 5 + fl * 2; R(g, fl ? '#ff9a5c' : '#d8502a', x + q * 6 - 2, y - 8 - fh, 4, fh); R(g, fl ? '#ffd36b' : '#ff9a5c', x + q * 6 - 1, y - 8 - fh + 2, 2, Math.max(1, fh - 3)); }
  g.drawImage(bigPot(), x - 30, y - 52);
  const rimY = y - 48, sw = 52 + rc(Math.sin(time * 3) * 1);
  R(g, br[2], x - 26, rimY, sw, 3); R(g, br[0], x - 25, rimY - 1, sw - 2, 2); R(g, br[1], x - 20 + rc(Math.sin(time * 3.4) * 5), rimY - 1, 8, 1);
  const nb = 6 + rc(K * 6); for (let q = 0; q < nb; q++) { const ph = (time * (1 + K * 1.2) + q / nb) % 1; g.globalAlpha = (1 - ph) * 0.85; R(g, br[1], x - 22 + q * (44 / nb), rimY - 2 - ph * (14 + K * 16), 2, 2); R(g, '#ffffff', x - 22 + q * (44 / nb), rimY - 2 - ph * (14 + K * 16), 1, 1); } g.globalAlpha = 1;
  for (let q = 0; q < 4; q++) { const ph = (time * 0.3 + q / 4) % 1; g.globalAlpha = 0.28 * (1 - ph); R(g, mix(br[1], '#ffffff', 0.4), x - 14 + q * 9 + rc(Math.sin(ph * 6 + q) * 4), rimY - 8 - ph * 40, 6, 5); } g.globalAlpha = 1;
  if (spit) { for (let q = 0; q < 6; q++) { const ph = (time * 3 + q * 0.17) % 1; g.globalAlpha = 1 - ph; R(g, q % 2 ? '#ff9a5c' : '#ffd36b', x - 14 + q * 5, rimY - 4 - ph * 34, 3, 3); } g.globalAlpha = 1; }
  glowAt(g, rgbOf(K > 0.5 ? '#ff9a5c' : GLOW.mid), x, rimY - 6, 130, 90, 0.4 + 0.15 * Math.sin(time * 3));
  glowAt(g, '255,154,92', x, y - 6, 120, 40, 0.3 + K * 0.2);
}
/* the AREA'S NAME as it comes up under the top bar: a bone-bordered tag */
export function drawBanner(g, text, VW, a, textFn) {
  g.save(); g.globalAlpha = Math.max(0, a); R(g, 'rgba(24,18,10,0.78)', VW / 2 - 92, 40, 184, 15);
  R(g, '#cbb888', VW / 2 - 92, 40, 184, 1); R(g, '#cbb888', VW / 2 - 92, 54, 184, 1); R(g, '#e8dcc0', VW / 2 - 94, 39, 4, 17); R(g, '#e8dcc0', VW / 2 + 90, 39, 4, 17);
  R(g, GLOW.mid, VW / 2 - 90, 43, 1, 9); R(g, GLOW.mid, VW / 2 + 89, 43, 1, 9);
  if (textFn) textFn(text, VW / 2, 44, '#f0e6c8', 'center'); g.restore();
}
export function warm() { for (const c of ['green', 'blue', 'red']) { jarSpr(c); jarSpr(c, 0); shelfSpr(c); } bedSpr(); wellSpr(); bigPot(); for (const r of ['255,200,96', '184,240,112', '255,154,92', '74,143,216', '95,174,58', '216,80,42']) halo(r); }
export { JAR_AX, JAR_AY, glowAt };
