// forge_art.js - THE SMELTER FLOOR and THE FORGE, dressed (claude/forgemasterart; the sonnet ART lane after the Opus greybox, art-before-live).
// An IRON + SLAG forge in a mine: soot-black brick, riveted iron plate, brick furnace mouths, glow, cooling slag. NO timber, no logs.
// src/forge-rails.js (the greybox's drawWorld / drawBack / drawCart) hands this file the numbers and it draws; every READ the greybox laid down is kept and dressed, never dropped:
//   gold OPEN + clock, pale BRACED shell, red lanes, ingot marks, lever arrows (UP = the cart rides on, DOWN = it drops), the ETA pip.
// Everything is plain fillRect pixel art on the 320x180 buffer (a few baked 16x16 canvases, a few additive glows - no per-frame allocation).
//   drawBack     the room's own back wall (brick, iron pillars, a girder, pipes, chains, wall vents) and THE FURNACE (the chimney landmark's foot)
//   mouth        a loop mouth: a brick furnace arch the carts come out of / go into, glowing
//   junction     the lever on the floor (arm, arrow disc, pull-chain, ETA gauge) and `points` (the trap in the ore line)
//   plug         a slag plug: a black heap with hot cracks
//   gutter       THE SLAG GUTTER: molten slag at the foot of a pit - it kills, and it reads as killing
//   cart         the forge cart's skin: ore-loaded; hot (a sent / thrown cart) and chained (while he drags one)
//   ingot, hotPatch, chain, belly, loaderKick   the smith's own things
import { MP, glow, hash } from './minecart_backdrop.js';
import { canvas, mulberry } from '../px.js';
const R = Math.round;
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(R(x), R(y), R(w), R(h)); };
const add = (g, fn) => { g.globalCompositeOperation = 'lighter'; fn(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
export const FX0 = 1062, FX1 = 1239;   /* THE SMELTER FLOOR + THE FORGE, in columns (src/minecart.js forgeFloor: S = 1062, S + 177 = his gate) */
export const inForge = tx => tx >= FX0 && tx <= FX1;
export const FC = {
  brick: ['#1c100d', '#28160f', '#341d15', '#43271b'], mortar: '#0c0605',
  slag: ['#0d0908', '#1a1210', '#2b1d17', '#42291d', '#5c3a28'],
  hot: ['#7a2208', '#c8420e', '#ff7a22', '#ffc060', '#fff2b8'],
  iron: ['#14141a', '#24242c', '#3a3a46', '#585866', '#80808e', '#b0b0be'],
};

/* ---------------- THE BACK WALL ---------------- */
function brickTile(v) {
  return once('fbk' + v, () => { const [c, g] = canvas(16, 16), r = mulberry(v * 977 + 13);
    rc(g, 0, 0, 16, 16, FC.mortar);
    for (let row = 0; row < 4; row++) { const y = row * 4, off = (row & 1) ? 4 : 0;
      for (let bx = -off; bx < 16; bx += 8) { const x0 = Math.max(0, bx), w = Math.min(16, bx + 7) - x0; if (w <= 0) continue;
        const t = r(); rc(g, x0, y, w, 3, FC.brick[t < 0.18 ? 0 : t < 0.55 ? 1 : t < 0.88 ? 2 : 3]); rc(g, x0, y, w, 1, FC.brick[3]); if (r() < 0.35) rc(g, x0 + 1, y + 1, 2, 1, FC.brick[0]); } }
    if (v % 3 === 1) { let x = 3 + ((r() * 9) | 0); for (let y = 2; y < 14; y++) { rc(g, x, y, 1, 1, y % 3 ? FC.hot[0] : FC.hot[1]); if (r() < 0.4) x += r() < 0.5 ? -1 : 1; } }   /* an ember crack, a seam of old fire in the brick */
    return c; });
}

/* THE FURNACE: the smith's, at the room's east end (decor 'furnace'). bright 0..1.6 (phase two, braced, his furnace breath): the mouth and the glow */
export function furnace(g, x, y, time, bright = 0.4, vh = 180) {
  const k = 0.5 + 0.5 * Math.sin(time * 5.3) * Math.sin(time * 2.1 + 1), b = Math.min(1.6, bright);
  rc(g, x - 11, y - 190, 22, 100, FC.iron[1]); rc(g, x - 11, y - 190, 3, 100, FC.iron[3]); rc(g, x + 8, y - 190, 3, 100, FC.iron[0]);   /* the stack going up through the roof */
  for (let yy = y - 180; yy < y - 90; yy += 22) { rc(g, x - 13, yy, 26, 3, FC.iron[3]); rc(g, x - 13, yy, 26, 1, FC.iron[5]); rc(g, x - 11, yy + 1, 2, 1, FC.iron[0]); }
  rc(g, x - 44, y - 100, 88, 100, FC.brick[1]);   /* the body: soot brick under iron bands */
  for (let yy = y - 100; yy < y; yy += 4) { const o = (((yy - y) / 4) & 1) ? 5 : 0; rc(g, x - 44, yy + 3, 88, 1, FC.mortar); for (let xx = x - 44 - o; xx < x + 44; xx += 10) rc(g, Math.max(x - 44, xx), yy, 1, 3, FC.mortar); }
  for (let xx = x - 44; xx < x + 44; xx += 12) for (let yy = y - 100; yy < y; yy += 12) if (hash(xx, yy) % 5 === 0) rc(g, xx + 2, yy + 2, 8, 3, FC.brick[hash(xx, yy) % 4]);
  rc(g, x - 44, y - 100, 4, 100, FC.iron[2]); rc(g, x - 44, y - 100, 1, 100, FC.iron[4]); rc(g, x + 40, y - 100, 4, 100, FC.iron[1]); rc(g, x + 43, y - 100, 1, 100, FC.iron[0]);   /* buttress straps */
  for (const by of [y - 98, y - 62, y - 30]) { rc(g, x - 44, by, 88, 4, FC.iron[2]); rc(g, x - 44, by, 88, 1, FC.iron[4]); rc(g, x - 44, by + 3, 88, 1, FC.iron[0]); for (let xx = x - 40; xx < x + 40; xx += 10) rc(g, xx, by + 1, 2, 2, FC.iron[5]); }
  rc(g, x - 50, y - 2, 100, 2, FC.slag[1]);
  /* the mouth: an arch, an iron lintel and a grate over the fire */
  const mw = 34, mh = 30, mx = x - mw / 2, my = y - mh;
  rc(g, mx - 4, my - 6, mw + 8, mh + 6, FC.iron[1]); rc(g, mx - 4, my - 6, mw + 8, 2, FC.iron[4]); rc(g, mx - 4, my - 6, 2, mh + 6, FC.iron[3]); rc(g, mx - 5, my - 7, mw + 10, 1, FC.iron[0]);
  rc(g, mx, my, mw, mh, '#080303');
  const f1 = 0.55 + 0.35 * b + 0.1 * k;
  rc(g, mx + 1, my + 5, mw - 2, mh - 5, FC.hot[0]); rc(g, mx + 3, my + 8, mw - 6, mh - 8, FC.hot[1]);
  rc(g, mx + 5, my + 12 - R(3 * k * b), mw - 10, mh - 12 + R(3 * k * b), FC.hot[2]);
  rc(g, mx + 8, my + 16 - R(5 * k * b), mw - 16, mh - 16 + R(5 * k * b), FC.hot[3]);
  rc(g, mx + 12, my + 21 - R(4 * k * b), mw - 24, mh - 21 + R(4 * k * b), FC.hot[4]);
  for (let i = 0; i < 5; i++) { const tx = mx + 4 + i * 6 + ((hash(i, 2) % 3) - 1), th = 6 + ((time * 6 + i * 2.7) % 5) * (0.6 + 0.4 * b); rc(g, tx, my + 8 - th * 0.6, 3, th, i % 2 ? FC.hot[2] : FC.hot[3]); }   /* tongues */
  for (let i = 1; i <= 3; i++) rc(g, mx + i * 8, my, 2, mh, FC.iron[0]);   /* the grate */
  rc(g, mx + 8, my, 1, mh, FC.iron[2]); rc(g, mx + 16, my, 1, mh, FC.iron[2]); rc(g, mx + 24, my, 1, mh, FC.iron[2]);
  rc(g, x + 26, y - 14, 12, 3, FC.iron[2]); rc(g, x + 34, y - 11, 3, 11, FC.hot[1 + (k > 0.6 ? 1 : 0)]); rc(g, x + 35, y - 11, 1, 11, FC.hot[3]);   /* the tap: a runnel of slag down the brick */
  add(g, () => { g.globalAlpha = Math.min(1, 0.3 + 0.28 * b + 0.08 * k); g.drawImage(glow(96, '255,120,40'), R(x - 96), R(y - 28 - 96)); g.globalAlpha = Math.min(1, 0.16 + 0.2 * b); g.drawImage(glow(40, '255,230,160'), R(x - 40), R(y - 14 - 40)); });
  add(g, () => { g.globalAlpha = Math.min(0.5, 0.12 + 0.12 * b); g.fillStyle = 'rgb(255,110,30)'; g.fillRect(R(x - 70), R(y - 6), 140, 6); g.globalAlpha = Math.min(0.3, 0.06 + 0.08 * b); g.fillRect(R(x - 110), R(y - 3), 220, 3); });   /* the light spilled on the floor */
  for (let i = 0; i < 6; i++) { const t = (time * 0.5 + i * 0.17) % 1; add(g, () => { g.globalAlpha = (1 - t) * 0.9; g.fillStyle = i % 2 ? FC.hot[3] : FC.hot[2]; g.fillRect(R(x - 12 + i * 5 + Math.sin(time * 2.6 + i) * 4), R(y - 30 - t * 60), 1, 2); }); }   /* sparks up the flue */
}

/* the whole back wall of the smelter floor: x0..x1 columns, D the floor's row, U the ore line's row. cx, cy the camera. o.furn {x px, bright}, o.mini true when his room is shut */
export function drawBack(g, cx, cy, vw, vh, time, o) {
  const ts = 16, c0 = Math.max(o.x0, Math.floor(cx / ts) - 1), c1 = Math.min(o.x1, Math.ceil((cx + vw) / ts) + 1); if (c1 < c0) return;
  const D = o.D, r0 = D - 15, r1 = D + 4, top = R(r0 * ts - cy), bot = R((D + 1) * ts - cy);
  for (let tx = c0; tx <= c1; tx++) for (let ty = r0; ty <= r1; ty++) g.drawImage(brickTile(hash(tx, ty) % 6), R(tx * ts - cx), R(ty * ts - cy));
  const sx0 = R(c0 * ts - cx), sw = (c1 - c0 + 1) * ts;
  /* soot toward the roof, a warm wash toward the floor */
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(6,2,2,' + (0.06 * (6 - i)).toFixed(2) + ')'; g.fillRect(sx0, top + i * 12, sw, 12); }
  add(g, () => { for (let i = 0; i < 6; i++) { g.globalAlpha = 0.012 * (i + 1) * (0.8 + 0.2 * Math.sin(time * 1.3)); g.fillStyle = 'rgb(255,100,30)'; g.fillRect(sx0, bot - (6 - i) * 12 - 8, sw, 12); } });
  /* THE CEILING GIRDER, an iron box beam over the whole room with cross-braces and the chains it holds */
  const gy = R((D - 11) * ts - cy);
  rc(g, sx0, gy, sw, 12, FC.iron[2]); rc(g, sx0, gy, sw, 2, FC.iron[4]); rc(g, sx0, gy + 11, sw, 1, FC.iron[0]); rc(g, sx0, gy + 8, sw, 1, FC.iron[1]);
  for (let tx = c0; tx <= c1; tx++) { const X = R(tx * ts - cx); rc(g, X + 3, gy + 4, 2, 2, FC.iron[5]); rc(g, X + 11, gy + 4, 2, 2, FC.iron[5]); if ((tx & 3) === 0) { g.fillStyle = FC.iron[1]; for (let i = 0; i < 12; i++) g.fillRect(X + i, gy + i, 2, 1); } }
  /* PIPES along the wall (steam on a valve now and then) */
  const py = R((D - 8) * ts - cy);
  /* THE PILLARS: iron columns (two tiles wide) every fourteenth column, and a lit wall vent in every other bay */
  for (let tx = c0; tx <= c1; tx++) { const q = (tx - FX0) % 14, bay = Math.floor((tx - FX0) / 14), X = R(tx * ts - cx);
    if (q === 7 || q === 8) { const left = q === 7;
      rc(g, X, gy + 12, ts, bot - gy - 12, FC.iron[1]); rc(g, left ? X : X + ts - 2, gy + 12, 2, bot - gy - 12, left ? FC.iron[4] : FC.iron[0]); rc(g, left ? X + 2 : X, gy + 12, 1, bot - gy - 12, left ? FC.iron[3] : FC.iron[2]);
      for (let yy = gy + 18; yy < bot - 6; yy += 20) { rc(g, X + 3, yy, 2, 2, FC.iron[5]); rc(g, X + 11, yy, 2, 2, FC.iron[5]); rc(g, X, yy + 6, ts, 2, FC.iron[2]); rc(g, X, yy + 6, ts, 1, FC.iron[4]); }
      rc(g, X - (left ? 3 : 0), bot - 8, ts + 3, 8, FC.iron[2]); rc(g, X - (left ? 3 : 0), bot - 8, ts + 3, 1, FC.iron[5]);   /* the plinth, slag-stained */
      rc(g, X - (left ? 3 : 0), bot - 3, ts + 3, 3, FC.slag[2]); }
    if (q === 0 && (bay & 1) === 0) { const vx = X - 8, vy = R((D - 6) * ts - cy), f = 0.6 + 0.4 * Math.sin(time * 3 + bay * 1.7);   /* a wall vent: a slit of old fire in a brick arch */
      rc(g, vx - 2, vy - 2, 52, 30, FC.iron[1]); rc(g, vx - 2, vy - 2, 52, 1, FC.iron[4]); rc(g, vx, vy, 48, 26, '#0a0504');
      rc(g, vx + 2, vy + 10, 44, 14, FC.hot[0]); rc(g, vx + 5, vy + 13, 38, 11, FC.hot[1]); rc(g, vx + 10, vy + 17 - R(2 * f), 28, 7 + R(2 * f), FC.hot[2]); rc(g, vx + 16, vy + 20 - R(f), 16, 4 + R(f), FC.hot[3]);
      for (let i = 0; i < 4; i++) rc(g, vx + 6 + i * 12, vy, 2, 26, FC.iron[0]);
      add(g, () => { g.globalAlpha = 0.28 * f; g.drawImage(glow(44, '255,110,36'), vx + 24 - 44, vy + 16 - 44); }); }
    if (q === 3 && (bay & 1) === 1) { /* a rack of ingots cooling on the floor, dull */ const ix = X - 4, iy = bot - 2;
      for (let row = 0; row < 3; row++) for (let i = 0; i < 3 - row; i++) { rc(g, ix + i * 9 + row * 4, iy - 4 - row * 4, 8, 3, FC.slag[3]); rc(g, ix + i * 9 + row * 4, iy - 4 - row * 4, 8, 1, FC.slag[4]); }
      rc(g, ix + 8, iy - 8, 8, 1, FC.hot[(time * 0.8 + bay) % 2 < 1 ? 0 : 1]); } }
  rc(g, sx0, py, sw, 6, FC.iron[2]); rc(g, sx0, py, sw, 1, FC.iron[5]); rc(g, sx0, py + 1, sw, 1, FC.iron[4]); rc(g, sx0, py + 5, sw, 1, FC.iron[0]);
  for (let tx = c0; tx <= c1; tx++) { const X = R(tx * ts - cx); if (tx % 4 === 0) { rc(g, X, py - 2, 4, 10, FC.iron[3]); rc(g, X, py - 2, 4, 1, FC.iron[5]); rc(g, X + 1, py + 1, 2, 2, FC.iron[1]); }
    if (hash(tx, 11) % 11 === 0) { const t = (time * 0.7 + tx * 0.31) % 1; add(g, () => { g.globalAlpha = (1 - t) * 0.55; g.fillStyle = '#c9c0b8'; g.beginPath(); g.arc(X + 2 + Math.sin(time + tx) * 2, py - 4 - t * 16, 2 + t * 3, 0, 6.2832); g.fill(); }); } }
  /* CHAINS hanging off the girder, swaying a little */
  for (let tx = c0; tx <= c1; tx++) { if (tx % 9 !== 3) continue; const X = R(tx * ts + 8 - cx + Math.sin(time * 0.8 + tx) * 1.4), n = 3 + (hash(tx, 4) % 3);
    for (let i = 0; i < n * 2; i++) { rc(g, X - (i & 1 ? 0 : 1), gy + 12 + i * 3, i & 1 ? 1 : 3, 3, i & 1 ? FC.iron[2] : FC.iron[4]); }
    rc(g, X - 2, gy + 12 + n * 6, 5, 2, FC.iron[3]); rc(g, X, gy + 14 + n * 6, 1, 3, FC.iron[4]); rc(g, X + 1, gy + 16 + n * 6, 2, 1, FC.iron[4]); }
  /* THE WEST DOOR: the smelter floor starts under an iron portal */
  if (c0 <= o.x0 + 2) { const X = R(o.x0 * ts - cx); rc(g, X, gy + 12, 6, bot - gy - 12, FC.iron[2]); rc(g, X, gy + 12, 2, bot - gy - 12, FC.iron[4]); rc(g, X + 5, gy + 12, 1, bot - gy - 12, FC.iron[0]); }
  /* THE FURNACE */
  if (o.furn) { const fx = o.furn.x - cx; if (fx > -140 && fx < vw + 140) furnace(g, R(fx), R((D) * ts - cy), time, o.furn.bright, vh); }
}

/* ---------------- THE LOOP MOUTHS ---------------- */
/* a loop's mouth on the ore line: x the tile edge the line starts / ends at, y the line's top; west = where the carts come out. A brick furnace arch, an iron lintel, a chain curtain, the glow of the next cart's furnace */
export function mouth(g, x, y, west, time, seed) {
  const k = 0.5 + 0.5 * Math.sin(time * 3 + seed), w = 30, h = 30, x0 = west ? x - w : x, ix = west ? x0 + 3 : x0 + 2;
  rc(g, x0, y - h, w, h + 4, FC.brick[1]); rc(g, x0, y - h, w, 1, FC.brick[3]);   /* the brick face the line goes through */
  for (let yy = y - h; yy < y + 4; yy += 4) { rc(g, x0, yy + 3, w, 1, FC.mortar); const o = ((yy - (y - h)) / 4) & 1 ? 4 : 0; for (let xx = x0 - o; xx < x0 + w; xx += 8) rc(g, Math.max(x0, xx), yy, 1, 3, FC.mortar); }
  rc(g, ix, y - 24, w - 5, 24, '#080303');   /* the throat */
  rc(g, ix + 1, y - 18, w - 7, 18, FC.hot[0]); rc(g, ix + 3, y - 14, w - 11, 14, FC.hot[1]); rc(g, ix + 6, y - 9, w - 17, 9, FC.hot[2]); rc(g, ix + 9, y - 5, w - 23, 5, FC.hot[3]);
  rc(g, ix - 1, y - 26, w - 3, 3, FC.iron[3]); rc(g, ix - 1, y - 26, w - 3, 1, FC.iron[5]); rc(g, ix - 1, y - 24, 2, 24, FC.iron[2]); rc(g, ix + w - 8, y - 24, 2, 24, FC.iron[2]);   /* lintel and jambs */
  rc(g, west ? x0 + w - 4 : x0, y - 30, 4, 34, FC.iron[2]); rc(g, west ? x0 + w - 4 : x0 + 3, y - 30, 1, 34, FC.iron[4]);   /* the iron post at the line's end */
  for (let i = 0; i < 4; i++) { const sw = Math.sin(time * 1.4 + i + seed) * 1.5, cxs = ix + 3 + i * 5 + (west ? 0 : 1); for (let j = 0; j < 5; j++) rc(g, cxs + (j & 1 ? sw * 0.5 : 0), y - 24 + j * 4, 1, 3, FC.iron[j & 1 ? 2 : 4]); }   /* the chain curtain */
  rc(g, west ? x0 + 2 : x0 + 4, y - h - 3, 8, 4, FC.iron[2]); rc(g, west ? x0 + 3 : x0 + 5, y - h - 8, 4, 5, FC.iron[1]);   /* a flue */
  add(g, () => { g.globalAlpha = 0.34 + 0.12 * k; g.drawImage(glow(34, '255,120,40'), R((west ? x0 + w - 8 : x0 + 8) - 34), R(y - 12 - 34)); g.globalAlpha = 0.14 + 0.06 * k; g.fillStyle = 'rgb(255,120,40)'; g.fillRect(R(west ? x0 + w : x0 - 28), R(y - 2), 28, 2); });
}

/* ---------------- THE JUNCTION LEVER and its points ---------------- */
/* the lever on the floor: x its centre, y the floor. open = the points are open (the next cart drops). The arrow in the disc is the read: UP = the cart rides on, DOWN = it drops. Returns the disc's centre y */
export function junction(g, x, y, open, flash, time) {
  const tilt = open ? 5 : -5, hx = x + tilt, hy = y - 26, pivY = y - 9;
  rc(g, x - 8, y - 3, 16, 3, FC.iron[2]); rc(g, x - 8, y - 3, 16, 1, FC.iron[5]); rc(g, x - 7, y - 2, 2, 1, FC.iron[0]); rc(g, x + 5, y - 2, 2, 1, FC.iron[0]);   /* the bolted base plate */
  rc(g, x - 4, y - 11, 8, 8, FC.iron[1]); rc(g, x - 4, y - 11, 8, 1, FC.iron[4]); rc(g, x - 4, y - 11, 1, 8, FC.iron[3]); rc(g, x + 3, y - 11, 1, 8, FC.iron[0]); rc(g, x - 1, y - 8, 2, 4, '#080303');   /* the housing and its slot */
  g.strokeStyle = FC.iron[0]; g.lineWidth = 4; g.beginPath(); g.moveTo(x, pivY); g.lineTo(hx, hy); g.stroke(); g.strokeStyle = FC.iron[3]; g.lineWidth = 2; g.beginPath(); g.moveTo(x, pivY); g.lineTo(hx, hy); g.stroke(); g.strokeStyle = FC.iron[5]; g.lineWidth = 1; g.beginPath(); g.moveTo(x - 0.5, pivY); g.lineTo(hx - 0.5, hy); g.stroke(); g.lineWidth = 1;   /* the arm, leaning to the throw */
  rc(g, x - 2, pivY - 2, 4, 4, FC.iron[4]); rc(g, x - 1, pivY - 1, 2, 2, FC.iron[0]);   /* the pivot pin */
  const fl = flash > 0 && Math.floor(time * 20) % 2;
  g.fillStyle = FC.iron[0]; g.beginPath(); g.arc(hx + 1, hy - 3, 7, 0, 6.2832); g.fill();
  g.fillStyle = fl ? '#fff6c8' : open ? '#ffd36b' : '#8a919c'; g.beginPath(); g.arc(hx + 1, hy - 3, 6, 0, 6.2832); g.fill();
  g.fillStyle = open ? '#fff0a0' : '#b0b0be'; g.beginPath(); g.arc(hx, hy - 4, 2.5, 0, 6.2832); g.fill();
  g.fillStyle = '#1b1626'; g.beginPath(); if (open) { g.moveTo(hx - 2, hy - 6); g.lineTo(hx + 4, hy - 6); g.lineTo(hx + 1, hy + 1); } else { g.moveTo(hx - 2, hy); g.lineTo(hx + 4, hy); g.lineTo(hx + 1, hy - 7); } g.fill();   /* the ARROW: up = rides on, down = drops */
  if (open) add(g, () => { g.globalAlpha = 0.4 + 0.2 * Math.sin(time * 9); g.drawImage(glow(18, '255,211,107'), R(hx + 1 - 18), R(hy - 3 - 18)); });
  return hy - 10;
}
/* the pull-chain from the lever's disc up to the points housing */
export function pullChain(g, x, yTop, yBot, open, time) {
  for (let yy = yTop, i = 0; yy < yBot; yy += 3, i++) { const c = open ? (i & 1 ? '#ffd36b' : '#b08418') : (i & 1 ? FC.iron[4] : FC.iron[2]); rc(g, x - (i & 1 ? 0 : 1), yy, i & 1 ? 1 : 3, 3, c); }
  rc(g, x - 4, yTop - 3, 9, 5, FC.iron[2]); rc(g, x - 4, yTop - 3, 9, 1, FC.iron[5]); rc(g, x - 1, yTop - 1, 3, 3, FC.iron[0]);   /* the pulley at the points */
}
/* the points in the ore line: px0..px1 their span, py the line's top. set = an iron cover plate bolted over the trap; open = two leaves hanging and the drop lit gold */
export function points(g, px0, px1, py, open, time) {
  const w = px1 - px0;
  if (!open) { rc(g, px0, py, w, 5, FC.iron[2]); rc(g, px0, py, w, 1, FC.iron[5]); rc(g, px0, py + 4, w, 1, FC.iron[0]); rc(g, px0 + R(w / 2), py, 1, 5, FC.iron[0]); for (const bx of [px0 + 3, px1 - 5, px0 + R(w / 2) - 3, px0 + R(w / 2) + 2]) rc(g, bx, py + 1, 2, 2, FC.iron[4]);
    rc(g, px0, py + 5, w, 2, '#8a6a3a'); return; }
  const k = 0.5 + 0.5 * Math.sin(time * 12);
  rc(g, px0 - 1, py, 3, 5, FC.iron[3]); rc(g, px1 - 2, py, 3, 5, FC.iron[3]);   /* the hinges */
  for (let i = 0; i < 6; i++) { rc(g, px0 + 1 + (i >> 1), py + 5 + i * 2, 3, 2, FC.iron[2 + (i & 1)]); rc(g, px1 - 4 - (i >> 1), py + 5 + i * 2, 3, 2, FC.iron[2 + (i & 1)]); }   /* the leaves swung down */
  add(g, () => { g.globalAlpha = 0.35 + 0.35 * k; g.fillStyle = '#ffd36b'; g.fillRect(px0, py - 2, w, 3); g.globalAlpha = 0.28 + 0.2 * k; g.drawImage(glow(18, '255,211,107'), R((px0 + px1) / 2 - 18), R(py + 6 - 18)); });
}
/* the little gauge over a lever: the next cart's ETA fills as it comes */
export function etaPip(g, x, y, eta) { rc(g, x - 9, y - 1, 20, 5, FC.iron[1]); rc(g, x - 9, y - 1, 20, 1, FC.iron[4]); rc(g, x - 8, y, 18, 3, '#1b1626'); rc(g, x - 8, y, R(18 * Math.max(0, 1 - eta / 4)), 3, eta < 1 ? '#8fd160' : '#c9a24a'); }

/* ---------------- THE SLAG PLUG ---------------- */
/* a heap of black slag choking the floor: x, y the rect's top-left, w x h (two tiles by five); hot cracks that breathe, a core that glows */
export function plug(g, x, y, w, h, time, seed) {
  const k = 0.5 + 0.5 * Math.sin(time * 2 + seed);
  rc(g, x, y, w, h, FC.slag[0]);
  for (let i = 0; i < w; i++) { const j = hash(seed + i, 5) % 4; rc(g, x + i, y - j + ((i + 1) % 3 === 0 ? 1 : 0), 1, j + 1, FC.slag[1]); }   /* the ragged crown, a little over the rect */
  rc(g, x - 3, y + h - 5, w + 6, 5, FC.slag[1]); rc(g, x - 3, y + h - 5, w + 6, 1, FC.slag[3]);   /* the spill at its foot */
  for (let yy = 0; yy < h; yy += 6) { const o = ((yy / 6) & 1) * 5; for (let xx = -o; xx < w; xx += 11) { const bx = Math.max(0, xx), bw = Math.min(w, xx + 10) - bx; if (bw <= 0) continue; const t = hash(seed + xx, yy) % 5; rc(g, x + bx, y + yy, bw, 5, FC.slag[t < 2 ? 1 : t < 4 ? 2 : 3]); rc(g, x + bx, y + yy, bw, 1, FC.slag[4]); rc(g, x + bx + bw - 1, y + yy, 1, 5, FC.slag[0]); } }
  for (let c = 0; c < 3; c++) { let cx_ = 4 + ((hash(seed, c) % (Math.max(2, w - 8)))), cy_ = 8 + c * 22;   /* the cracks: hot lines that run down the face */
    for (let s = 0; s < 14; s++) { const hot = (s + c) % 5 === 0 ? FC.hot[3] : FC.hot[1 + ((s + c) & 1)]; g.globalAlpha = 0.55 + 0.4 * k; rc(g, x + cx_, y + cy_ + s, 1, 2, hot); g.globalAlpha = 1; if (hash(seed + c, s) % 3 === 0) cx_ += (hash(c, s) & 1) ? 1 : -1; cx_ = Math.max(1, Math.min(w - 2, cx_)); } }
  add(g, () => { g.globalAlpha = 0.28 + 0.2 * k; g.drawImage(glow(26, '255,110,40'), R(x + w / 2 - 26), R(y + h * 0.62 - 26)); });
  const dx = x + 2 + (hash(seed, 8) % (w - 5)), ph = (time * 0.6 + seed * 0.13) % 1; rc(g, dx, y + 30 + R(ph * 36), 1, 3, FC.hot[2]);   /* a drip of molten slag down the face */
  rc(g, x, y + h - 1, w, 1, FC.slag[0]);
}

/* ---------------- THE SLAG GUTTER ---------------- */
/* a killing pit of molten slag: x0px..x1px (screen) its mouth, yTop the floor's top, deep the pit's depth in px down to the spikes' tile. It reads as DEATH: white-hot, bubbling, rising heat, hazard stripes on both lips. */
export function gutter(g, x0, x1, yTop, deep, time, seed) {
  const w = x1 - x0, surf = yTop + R(deep * 0.72), k = 0.5 + 0.5 * Math.sin(time * 4 + seed);
  rc(g, x0, yTop, w, deep + 16, '#0a0504');
  for (let i = 0; i < w; i++) { const wave = Math.sin(time * 3.2 + i * 0.55 + seed) * 1.4 + Math.sin(time * 1.9 + i * 0.21) * 1.2, sy = surf + R(wave);
    rc(g, x0 + i, sy, 1, yTop + deep + 16 - sy, FC.hot[1]); rc(g, x0 + i, sy + 3, 1, yTop + deep + 16 - sy - 3, FC.hot[2]); rc(g, x0 + i, sy + 7, 1, yTop + deep + 16 - sy - 7, FC.hot[1]); rc(g, x0 + i, sy, 1, 2, FC.hot[4]); if (((i + R(time * 6)) & 7) === 0) rc(g, x0 + i, sy - 1, 1, 1, FC.hot[3]); }
  for (let b = 0; b < 4; b++) { const t = (time * 0.9 + b * 0.27 + seed * 0.1) % 1, bx = x0 + 3 + ((hash(seed, b) % Math.max(2, w - 6))), r = 1 + (t > 0.7 ? 2 : 1);   /* bubbles coming up and bursting */
    if (t < 0.9) { g.strokeStyle = FC.hot[4]; g.lineWidth = 1; g.strokeRect(bx + 0.5, surf + 8 - t * 8 - r, r, r); } else { rc(g, bx - 1, surf - 3, 1, 2, FC.hot[3]); rc(g, bx + 2, surf - 4, 1, 2, FC.hot[3]); } }
  for (let i = 0; i < 6; i++) { const t = (time * 0.6 + i * 0.17) % 1; add(g, () => { g.globalAlpha = (1 - t) * 0.9; g.fillStyle = i % 2 ? FC.hot[3] : FC.hot[2]; g.fillRect(R(x0 + 3 + ((i * 11 + seed) % Math.max(4, w - 6))), R(surf - 2 - t * 26), 1, 2); }); }   /* sparks over it */
  add(g, () => { g.globalAlpha = 0.5 + 0.2 * k; g.drawImage(glow(Math.max(30, R(w * 0.75)), '255,120,40'), R((x0 + x1) / 2 - Math.max(30, R(w * 0.75))), R(surf - Math.max(30, R(w * 0.75)))); g.globalAlpha = 0.1 + 0.06 * k; g.fillStyle = 'rgb(255,120,40)'; g.fillRect(R(x0 - 6), R(yTop - 22), R(w + 12), 22); g.globalAlpha = 0.07; g.fillRect(R(x0 - 2), R(yTop - 48), R(w + 4), 26); });   /* the heat standing over the mouth */
  for (const [lx, dir] of [[x0 - 16, 1], [x1, 1]]) for (let i = 0; i < 4; i++) rc(g, lx + i * 4, yTop - 1, 2, 2, i & 1 ? '#1a1612' : '#e8b830');   /* hazard stripes on the lips */
  rc(g, x0 - 2, yTop, 2, deep, FC.hot[1]); rc(g, x1, yTop, 2, deep, FC.hot[1]);   /* the lips scorched */
}

/* ---------------- THE FORGE CART ---------------- */
/* an ore cart, riveted iron with a heap of ore over the rim. x, y the mover's top-left (it is 28 x 10); hot: a sent or thrown cart glows; chained: he has it on his chain; v: its pace (wheels turn) */
export function cart(g, x, y, hot, chained, v, time, seed) {
  const bx = x - 1, by = y - 4, k = 0.5 + 0.5 * Math.sin(time * 14 + seed);
  rc(g, bx + 2, by + 4, 26, 8, hot ? '#5a2a1c' : FC.iron[2]); rc(g, bx + 1, by + 2, 28, 3, hot ? '#8a3a1c' : FC.iron[3]); rc(g, bx + 1, by + 2, 28, 1, hot ? FC.hot[2] : FC.iron[5]); rc(g, bx + 3, by + 11, 24, 1, FC.iron[0]);   /* the box and its rolled rim */
  rc(g, bx + 8, by + 5, 1, 6, FC.iron[0]); rc(g, bx + 20, by + 5, 1, 6, FC.iron[0]); for (const rx of [bx + 4, bx + 14, bx + 24]) { rc(g, rx, by + 6, 1, 1, FC.iron[5]); rc(g, rx, by + 9, 1, 1, FC.iron[5]); }   /* straps and rivets */
  for (let i = 0; i < 8; i++) { const h = 2 + (hash(seed, i) % 3), lx = bx + 3 + i * 3; rc(g, lx, by + 2 - h, 3, h, i & 1 ? '#6a3a24' : '#8a5a38'); rc(g, lx, by + 2 - h, 3, 1, (i * 5 + seed) % 7 === 0 ? MP.cu3 : '#c98a3a'); }   /* the heap of ore: rust and copper, a green glint */
  for (const wx of [bx + 6, bx + 22]) { rc(g, wx - 1, by + 10, 6, 5, FC.iron[0]); rc(g, wx, by + 11, 4, 3, FC.iron[3]); const sp = Math.abs(v) > 20 ? Math.floor(time * 16 + wx) % 2 : 0; rc(g, wx + 1 + sp, by + 11, 1, 3, FC.iron[5]); }
  if (hot) { add(g, () => { g.globalAlpha = 0.3 + 0.2 * k; g.drawImage(glow(20, '255,110,40'), R(bx + 14 - 20), R(by + 6 - 20)); g.globalAlpha = 0.4 + 0.25 * k; g.fillStyle = 'rgb(255,120,40)'; g.fillRect(R(bx + 2), R(by + 4), 26, 1); }); if (Math.abs(v) > 40) rc(g, bx + (v > 0 ? -4 : 30), by + 8 + (k > 0.5 ? 1 : 0), 3, 1, FC.hot[3]); }
  if (chained) { rc(g, bx + 12, by - 5, 5, 4, FC.iron[4]); rc(g, bx + 13, by - 5, 3, 1, FC.iron[5]); rc(g, bx + 14, by - 8, 1, 3, FC.iron[3]); }
}
/* a chain of links from (x1, y1) to (x2, y2), a little slack, gold-lit when he is hauling */
export function chain(g, x1, y1, x2, y2, time, hot) {
  const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 3));
  for (let i = 0; i <= n; i++) { const t = i / n, sag = Math.sin(t * Math.PI) * 3, px_ = x1 + (x2 - x1) * t, py_ = y1 + (y2 - y1) * t + sag; rc(g, px_ - 1, py_ - 1, i & 1 ? 2 : 3, i & 1 ? 3 : 2, hot ? (i & 1 ? '#ffd36b' : '#b08418') : (i & 1 ? FC.iron[5] : FC.iron[3])); }
}

/* ---------------- THE SMITH'S OWN THINGS ---------------- */
/* a HOT INGOT in flight: a glowing bar that turns end over end, with a trail */
export function ingot(g, x, y, ang, time) {
  g.save(); g.translate(R(x), R(y)); g.rotate(ang);
  rc(g, -4, -2, 8, 4, FC.hot[1]); rc(g, -3, -1, 6, 2, FC.hot[3]); rc(g, -4, -2, 1, 4, FC.hot[4]); rc(g, 3, -2, 1, 4, FC.hot[4]); rc(g, -3, -2, 6, 1, FC.hot[2]);
  g.restore();
  add(g, () => { g.globalAlpha = 0.55 + 0.2 * Math.sin(time * 30); g.drawImage(glow(14, '255,130,50'), R(x - 14), R(y - 14)); });
}
/* where an ingot landed: a puddle of molten iron that dulls to a black crust (life s left of max) */
export function hotPatch(g, x, floorY, life, max, time) {
  const a = Math.max(0, Math.min(1, life / max)), k = 0.5 + 0.5 * Math.sin(time * 10 + x), w = 12 + R(6 * a);
  rc(g, x - w, floorY - 2, w * 2, 2, '#1a0e0a');
  rc(g, x - w + 2, floorY - 3, w * 2 - 4, 3, a > 0.5 ? FC.hot[1] : FC.hot[0]); rc(g, x - w + 5, floorY - 3, w * 2 - 10, 2, a > 0.25 ? FC.hot[2] : FC.hot[1]); if (a > 0.35) rc(g, x - w + 8, floorY - 3, w * 2 - 16, 1, FC.hot[4]);
  rc(g, x - w + 1, floorY - 1, w * 2 - 2, 1, FC.slag[0]);
  add(g, () => { g.globalAlpha = (0.15 + 0.35 * a) * (0.8 + 0.2 * k); g.drawImage(glow(24, '255,120,40'), R(x - 24), R(floorY - 24)); });
  if (a > 0.3) for (let i = 0; i < 3; i++) { const t = (time * 1.4 + i * 0.33 + x * 0.01) % 1; add(g, () => { g.globalAlpha = (1 - t) * a; g.fillStyle = FC.hot[3]; g.fillRect(R(x - 8 + i * 8), R(floorY - 4 - t * 12), 1, 2); }); }
}
/* THE FURNACE BELLY: his grate glowing. x, y the middle of it on screen (it is already facing); k 0..1.6 (phase two and BRACED burn brighter) */
export function belly(g, x, y, k, time) {
  const f = 0.5 + 0.5 * Math.sin(time * 7) * Math.sin(time * 2.9 + 1), b = Math.min(1.6, k);
  add(g, () => { g.globalAlpha = Math.min(1, 0.25 + 0.28 * b + 0.07 * f); g.drawImage(glow(26, '255,120,40'), R(x - 26), R(y - 26)); g.globalAlpha = Math.min(1, 0.18 * b + 0.05 * f); g.fillStyle = 'rgb(255,214,120)'; g.fillRect(R(x - 7), R(y - 2), 14, 5); });
  if (b > 0.9) for (let i = 0; i < 2; i++) { const t = (time * 1.6 + i * 0.5) % 1; add(g, () => { g.globalAlpha = (1 - t) * 0.8; g.fillStyle = FC.hot[3]; g.fillRect(R(x - 5 + i * 8 + Math.sin(time * 5 + i) * 2), R(y - 6 - t * 14), 1, 2); }); }
}
/* THE LOADER's kick: a boot swung out at the cart, an iron toe cap, the swing's arc (face -1 = he kicks west, down the floor at you). x, y the feet */
export function loaderKick(g, x, y, face, k, time) {
  const f = face || -1, lx = x + f * 3, ly = y - 7;
  rc(g, f > 0 ? lx : lx - 9, ly, 9, 3, '#3a2a24'); rc(g, f > 0 ? lx + 8 : lx - 12, ly - 1, 4, 5, FC.iron[3]); rc(g, f > 0 ? lx + 8 : lx - 12, ly - 1, 4, 1, FC.iron[5]);
  g.globalAlpha = 0.3 + 0.4 * k; g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.beginPath(); g.arc(x + f * 2, y - 6, 12, f > 0 ? -0.9 : Math.PI - 0.1, f > 0 ? 0.5 : Math.PI + 1.3); g.stroke(); g.globalAlpha = 1;
  rc(g, x - f * 1 - 3, y - 14, 6, 8, FC.iron[1]); rc(g, x - f * 1 - 3, y - 14, 6, 1, FC.iron[4]); rc(g, x - f * 1 - 2, y - 13, 1, 6, FC.iron[3]);   /* his iron apron */
}
/* a soft buffer stop in iron (the forge's: a cast block with a slag-black base and a red lamp - never timber) */
export function buffer(g, x, y, time) {
  rc(g, x + 1, y - 14, 14, 14, FC.iron[2]); rc(g, x + 1, y - 14, 14, 2, FC.iron[5]); rc(g, x + 1, y - 14, 1, 14, FC.iron[4]); rc(g, x + 14, y - 14, 1, 14, FC.iron[0]);
  rc(g, x, y - 3, 16, 3, FC.slag[2]); for (let i = 0; i < 3; i++) rc(g, x + 3 + i * 4, y - 10, 2, 6, i & 1 ? '#1a1612' : '#e8b830');
  rc(g, x + 4, y - 12, 2, 2, FC.iron[5]); rc(g, x + 10, y - 12, 2, 2, FC.iron[5]);
  const on = Math.floor(time * 3) % 2; rc(g, x + 6, y - 19, 4, 4, on ? '#ff6b6b' : '#5a1a14'); rc(g, x + 7, y - 15, 2, 1, FC.iron[3]); if (on) add(g, () => { g.globalAlpha = 0.6; g.drawImage(glow(10, '255,80,60'), x - 2, y - 27); });
}
/* an iron trestle bent under the ore line (a cast column and a brace - never timber): sx the column, yTop the line's underside, yBot the floor */
export function bent(g, sx, yTop, yBot, next, seed) {
  rc(g, sx, yTop, 5, yBot - yTop, FC.iron[1]); rc(g, sx, yTop, 1, yBot - yTop, FC.iron[4]); rc(g, sx + 4, yTop, 1, yBot - yTop, FC.iron[0]);
  for (let yy = yTop + 8; yy < yBot - 4; yy += 14) { rc(g, sx - 1, yy, 7, 2, FC.iron[2]); rc(g, sx - 1, yy, 7, 1, FC.iron[4]); rc(g, sx + 1, yy + 2, 1, 1, FC.iron[5]); }
  rc(g, sx - 3, yBot - 3, 11, 3, FC.iron[2]); rc(g, sx - 3, yBot - 3, 11, 1, FC.iron[5]);
  rc(g, sx - 2, yTop, 9, 2, FC.iron[3]);
  if (next) { rc(g, sx + 5, yTop + 10, 43, 3, FC.iron[2]); rc(g, sx + 5, yTop + 10, 43, 1, FC.iron[4]); }   /* a tie bar to the next column */
}
