// rootway_areas.js - THE ROOTWAY's FIVE AREAS, each with its own look (claude/rootway2art, Sonnet art pass). Art only: nothing here is a tile, an entity, a hitbox or a number - every
// picture is anchored to the world's own coordinates (the sections of src/rootway.js) and drawn from RWB.drawBackdrop (behind the tiles) and RWW.planRoot (lights, dressing).
//   THE ROOT CELLAR       (tiles 0-100)   a real CAVE: a root-weave back wall in cold violet, pillars of twisted root, hanging root hair, bracket fungus that GLOWS - the dark pass is
//                                         punched through by its spore lights (the buds, the span, the pit)
//   THE HOLLOW TRUNK      (111-151)       the INSIDE of a great trunk: a bark-lined back wall (grain, ridges, rings, knots), chinks of low gold light and the shafts they throw,
//                                         dust in them, root hair from the heartwood roof, the foot sunk in violet dark with spore glows, the knothole's warm spill at the exit
//   THE HUNTERS' GANTRY   (196-303)       the goblins' scaffold towers behind the road: lashed posts, cross-braces, rope nets, a trophy line of skulls strung between them
//   THE CANOPY SNARES     (303-372)       great boughs across the view hung with nooses, drop-net bundles, bone chimes and red rags - the goblins' trapline
//   THE TROPHY LODGE      (372-448)       the lodge's own HALL: a back wall of lashed logs, rafters and eaves, THE HORN MOUNT over the stand, skin racks, a shelf of skulls, lantern glow
// drawAreaBack(g, cx, cy, VW, VH, time, dY) is called once a frame from drawBackdrop, after the landmarks and before the haze.
import { mulberry } from '../px.js';
import { ZONE, hash, mix } from './rootway_tiles.js';

const TS = 16, R = Math.round;
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
const rc = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const glow = (g, x, y, r, a, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(' + col + ',' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); };
/* a filled disc / ellipse in pixels */
const disc = (g, cx, cy, rx, ry, col) => { for (let dy = -ry; dy <= ry; dy++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry || 1)))); rc(g, cx - hw, cy + dy, hw * 2 + 1, 1, col); } };

/* ---- where the areas stand (tiles; the sections of src/rootway.js) ---- */
export const AREA = { cellar: [0, 100], trunk: [111, 151], gantry: [196, 303], snares: [303, 372], lodge: [372, 448] };
const inView = (a, cx, VW) => a[1] * TS > cx - 40 && a[0] * TS < cx + VW + 40;
/* the edge of a bake fades over a stretch so a seam is never a wall of pixels */
const fadeX = (g, W, H, from, to) => { g.globalCompositeOperation = 'destination-in'; const gr = g.createLinearGradient(from, 0, to, 0); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; };

/* ============================================ THE HOLLOW TRUNK: bark lining, tile cols 111-150, rows 7-35 ============================================ */
const TRUNK = { x: 111 * TS, y: 7 * TS, w: 40 * TS, h: 29 * TS };
const CHINKS = [[58, 14, 34], [176, 22, 20], [262, 10, 44], [398, 18, 26], [500, 12, 38], [588, 24, 18]];   /* [x, y, length] on the baked wall */
const trunkWall = () => once('trunk', () => {
  const { w: W, h: H } = TRUNK, [c, g] = mk(W, H), r = mulberry(9031);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#42281a'); gr.addColorStop(0.45, '#2e1c15'); gr.addColorStop(0.78, '#1d1322'); gr.addColorStop(1, '#0f0a18'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W;) { const w = 2 + ((r() * 4) | 0), col = ['#4e2e1c', '#3e271a', '#33201a', '#5a331e'][(r() * 4) | 0]; g.globalAlpha = 0.5; rc(g, x, 0, w, H, col); g.globalAlpha = 1; if (r() < 0.3) rc(g, x, 0, 1, H, '#1c110c'); x += w; }   /* the grain: strips of bark, a furrow now and then */
  for (let x = 18; x < W; x += 50 + ((r() * 20) | 0)) for (let y = 0; y < H; y += 2) { const sw = Math.round(Math.sin(y * 0.045 + x) * 1.6); rc(g, x + sw, y, 5, 2, '#5a3820'); rc(g, x + sw, y, 1, 2, '#7a502c'); rc(g, x + sw + 4, y, 1, 2, '#1a0f0a'); }   /* the ridges, swaying a little */
  for (let y = 26; y < H; y += 40 + ((r() * 30) | 0)) for (let x = 0; x < W; x++) { const yy = y + Math.round(Math.sin(x * 0.03 + y) * 3); if (((x * 7 + y) % 11) < 7) rc(g, x, yy, 1, 1, '#241510'); }   /* growth rings */
  for (let i = 0; i < 9; i++) { const kx = 40 + ((r() * (W - 80)) | 0), ky = 30 + ((r() * (H - 150)) | 0), kr = 5 + ((r() * 5) | 0);   /* knots */
    for (let dy = -kr; dy <= kr; dy++) for (let dx = -kr; dx <= kr; dx++) { const d = Math.hypot(dx, dy * 1.4); if (d > kr) continue; rc(g, kx + dx, ky + dy, 1, 1, d < kr * 0.4 ? '#0e0806' : d < kr * 0.7 ? '#2a1810' : (dx + dy < 0 ? '#8a5a34' : '#5a3822')); } }
  for (const [x, y, l] of CHINKS) { rc(g, x - 2, y - 1, 5, l + 2, '#120a06'); rc(g, x - 1, y, 3, l, '#ffc474'); rc(g, x, y, 1, l, '#fff2b8'); }   /* the chinks the light comes through */
  /* the heartwood roof: root hair hanging from it */
  for (let x = 4; x < W; x += 5) { const l = 6 + ((hash(x, 7) >> 3) % 26); for (let y = 0; y < l; y++) rc(g, x + Math.round(Math.sin(y * 0.3 + x) * 1), y, 1, 1, y > l - 3 ? '#8a6a44' : y % 5 === 4 ? '#6a4a2c' : '#2a1a10'); }
  /* the foot: sunk in violet dark, a few pale caps in it */
  for (let i = 0; i < 12; i++) { const fx = 20 + ((hash(i, 91) >> 2) % (W - 40)), fy = H - 22 - ((hash(i, 17) >> 4) % 20); disc(g, fx, fy, 3, 2, '#3a2a58'); rc(g, fx - 2, fy - 2, 3, 1, '#6a58a0'); rc(g, fx, fy + 1, 1, 4, '#2a1c40'); }
  return c; });
function drawTrunk(g, cx, cy, VW, VH, time) {
  const sx = TRUNK.x - cx, sy = TRUNK.y - cy; if (sx > VW || sx + TRUNK.w < 0 || sy > VH || sy + TRUNK.h < 0) return;
  g.drawImage(trunkWall(), sx, sy);
  g.save(); g.beginPath(); g.rect(sx, sy, TRUNK.w, TRUNK.h); g.clip(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < CHINKS.length; i++) { const [x, y, l] = CHINKS[i], bx = sx + x, by = sy + y + l, a = 0.075 + 0.025 * Math.sin(time * 0.7 + i * 1.9), w = 7 + (i % 3) * 4;
    const gr = g.createLinearGradient(bx, by, bx - 30, by + 230); gr.addColorStop(0, 'rgba(255,196,110,' + a.toFixed(3) + ')'); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(bx - 2, by); g.lineTo(bx + 2, by); g.lineTo(bx - 30 + w, by + 230); g.lineTo(bx - 30 - w, by + 230); g.closePath(); g.fill(); }
  /* dust turning in the shafts */
  for (let k = 0; k < 22; k++) { const [x, y] = CHINKS[k % CHINKS.length], u = (time * (4 + (k % 5)) * 0.1 + k * 0.37) % 1, px = sx + x - 30 * u + Math.sin(time * 0.8 + k) * 5, py = sy + y + 24 + 220 * u; g.globalAlpha = 0.55 * Math.sin(u * Math.PI); rc(g, px, py, 1, 1, '#ffe2a0'); } g.globalAlpha = 1;
  /* the knothole's warm spill on the right edge (rows 19-22 open to the outside) */
  glow(g, sx + TRUNK.w + 6, (21 * TS) - cy, 120, 0.2 + 0.04 * Math.sin(time * 0.5), '255,190,100');
  g.restore();
}

/* ============================================ THE ROOT CELLAR: a cave of root-weave, tile cols 0-100, rows 22-44 ============================================ */
const CELLAR = { x: 0, y: 22 * TS, w: 100 * TS, h: 22 * TS };
const cellarWall = () => once('cellar', () => {
  const { w: W, h: H } = CELLAR, [c, g] = mk(W, H), r = mulberry(4417), Z = ZONE[0].s;
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0f0a18'); gr.addColorStop(0.55, '#1a1026'); gr.addColorStop(1, '#0c0812'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  /* the weave: long curving roots across the wall, dark on lighter */
  for (let i = 0; i < 46; i++) { let x = r() * W, y = r() * H, a = r() * 6.28; const len = 60 + r() * 140, th = 1 + ((r() * 3) | 0), col = [Z[1], Z[2], '#2c1c3c', '#33224a'][(r() * 4) | 0];
    for (let s = 0; s < len; s++) { a += (r() - 0.5) * 0.12; x += Math.cos(a) * 1.3; y += Math.sin(a) * 1.3; g.globalAlpha = 0.65; rc(g, x, y, th, th, col); if (th > 1 && s % 6 === 0) rc(g, x, y, 1, 1, Z[4]); } g.globalAlpha = 1; }
  /* pillars of twisted root, floor to ceiling, every ~120 px */
  for (let p = 0; p < 14; p++) { const bx = 60 + p * 112 + ((hash(p, 5) >> 3) % 50);
    for (let y = 0; y < H; y++) { for (const [ph, w, col, hi] of [[0, 6, '#2a1a38', '#4a3466'], [1.8, 5, '#33224a', '#58407a']]) { const x = bx + Math.sin(y * 0.055 + ph + p) * 7 + (ph ? 4 : 0); rc(g, x, y, w, 1, col); rc(g, x, y, 1, 1, hi); rc(g, x + w - 1, y, 1, 1, '#120a1c'); } } }
  /* hanging root hair off the ceiling (the ceiling's underside is row 25: y 48 here) */
  for (let x = 2; x < W; x += 4 + ((hash(x, 3) >> 2) % 3)) { const l = 8 + ((hash(x, 9) >> 3) % 44); for (let y = 0; y < l; y++) rc(g, x + Math.round(Math.sin(y * 0.2 + x) * 1.2), 46 + y, 1, 1, y > l - 3 ? '#6a5a8a' : y % 6 === 5 ? '#4a3a68' : '#241838'); }
  /* bracket fungus on the wall: a shelf of cap, glowing underneath (the glow itself is lit live) */
  for (let i = 0; i < 26; i++) { const fx = 30 + ((hash(i, 41) >> 2) % (W - 60)), fy = 60 + ((hash(i, 43) >> 3) % (H - 130)), s = 4 + (i % 3) * 2, hue = i % 3 === 0 ? ['#3a6a68', '#58b0a0', '#a8f0d8'] : i % 3 === 1 ? ['#5a2a6a', '#9a58b0', '#e0a8f0'] : ['#2a4a70', '#4a88c0', '#a8d8ff'];
    disc(g, fx, fy, s, 2, hue[0]); disc(g, fx, fy - 1, s - 1, 1, hue[1]); rc(g, fx - s + 1, fy - 2, s, 1, hue[2]); rc(g, fx - s, fy + 2, s * 2 + 1, 1, '#120a1c'); }
  fadeX(g, W, H, 1180, 1590);   /* the cave opens to the air past the pit: its wall fades out */
  return c; });
const CELLAR_GLOWS = (() => { const out = []; for (let i = 0; i < 26; i++) { const fx = 30 + ((hash(i, 41) >> 2) % (CELLAR.w - 60)), fy = 60 + ((hash(i, 43) >> 3) % (CELLAR.h - 130)); if (fx > 1250) continue; out.push([fx, fy + CELLAR.y, i % 3 === 0 ? '90,230,200' : i % 3 === 1 ? '200,110,240' : '110,180,255', i]); } return out; })();
function drawCellar(g, cx, cy, VW, VH, time) {
  const sx = CELLAR.x - cx, sy = CELLAR.y - cy; if (sx > VW || sx + CELLAR.w < 0 || sy > VH || sy + CELLAR.h < 0) return;
  g.drawImage(cellarWall(), sx, sy);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [wx, wy, col, i] of CELLAR_GLOWS) { const x = wx - cx; if (x < -50 || x > VW + 50) continue; glow(g, R(x), R(wy - cy), 30 + R(4 * Math.sin(time * 1.4 + i)), 0.2 + 0.05 * Math.sin(time * 2.1 + i * 2), col); }
  /* spores adrift, rising slowly */
  for (let k = 0; k < 26; k++) { const wx = (k * 211 + 40) % (1250), u = (time * 0.03 * (1 + (k % 4) * 0.4) + k * 0.19) % 1, wy = CELLAR.y + CELLAR.h - 60 - u * 300, x = wx - cx + Math.sin(time * 0.6 + k) * 8; if (x < -4 || x > VW + 4) continue; g.globalAlpha = 0.6 * Math.sin(u * Math.PI); rc(g, x, wy - cy, 1, 1, k % 2 ? '#b8f0e0' : '#e0c0ff'); }
  g.globalAlpha = 1; g.restore();
}

/* ============================================ THE HUNTERS' GANTRY: scaffold towers behind the road (parallax 0.8) ============================================ */
function drawGantry(g, cx, cy, VW, VH, time) {
  const par = 0.8, X0 = AREA.gantry[0] * TS, X1 = AREA.gantry[1] * TS, XC = (X0 + X1) / 2, cxl = XC + (cx - XC) * par;   /* a layer that turns with the world at the area's middle and lags it either side: screen x = layer x - cxl */
  const top = R(46 - (cy - 330) * 0.45), Z = ZONE[2].s, wood = ['#3a2410', '#5a3a1c', '#7a5226', '#a07434'];
  const haze = (col) => mix(col, '#c88a58', 0.28);
  const S = 190, i0 = Math.max(Math.floor(X0 / S), Math.floor((cxl - 120) / S)), i1 = Math.min(Math.floor(X1 / S), Math.floor((cxl + VW + 120) / S));
  const towers = [];
  for (let i = i0; i <= i1; i++) { const wx = i * S + 40 + ((hash(i, 13) >> 4) % 60), x = R(wx - cxl), h = 150 + ((hash(i, 21) >> 3) % 50), w = 34 + ((hash(i, 22) >> 4) % 16); towers.push({ i, x, h, w });
    const y0 = top + (hash(i, 23) % 18);
    for (const px of [x, x + w]) { rc(g, px - 2, y0, 5, VH, haze(wood[1])); rc(g, px - 2, y0, 2, VH, haze(wood[2])); rc(g, px + 2, y0, 1, VH, haze(wood[0])); }
    for (let yy = y0 + 12; yy < VH; yy += 40) { rc(g, x, yy, w, 4, haze(wood[1])); rc(g, x, yy, w, 1, haze(wood[3]));   /* a deck and its cross-braces */
      for (let k = 0; k < w; k += 2) { rc(g, x + k, yy + 4 + R(k * 0.5), 2, 2, haze(wood[0])); rc(g, x + w - k, yy + 4 + R(k * 0.5), 2, 2, haze(wood[0])); } }
    for (let q = 0; q < w; q += 5) rc(g, x + q, y0 + 14, 1, 40, haze('#c8aa72')); for (let q = 0; q < 40; q += 6) rc(g, x, y0 + 14 + q, w, 1, haze('#c8aa72'));   /* the rope net strung on it */
    rc(g, x - 6, y0 - 3, w + 12, 5, haze(wood[2])); rc(g, x - 6, y0 - 3, w + 12, 1, haze(wood[3]));   /* its roof beam */
    if (hash(i, 31) % 3 === 0) { const sw = R(Math.sin(time * 1.1 + i) * 2); rc(g, x + w / 2 + sw, y0 + 4, 1, 18, haze('#cdb88a')); rc(g, x + w / 2 - 6 + sw, y0 + 22, 14, 14, haze('#3a3438')); rc(g, x + w / 2 - 5 + sw, y0 + 23, 12, 12, haze('#1a1210')); rc(g, x + w / 2 - 2 + sw, y0 + 27, 5, 4, haze('#e8dcc0')); }   /* a hung cage with a skull */
    if (hash(i, 37) % 2 === 0) { rc(g, x + w + 4, y0 - 12, 1, 10, haze('#5a3c26')); rc(g, x + w + 5, y0 - 12, 8, 5, haze('#b8403a')); } }
  /* the trophy line: a rope strung tower to tower, skulls and hides hanging from it */
  for (let t = 0; t < towers.length - 1; t++) { const a = towers[t], b = towers[t + 1], ax = a.x + a.w, bx = b.x, ay = top + (hash(a.i, 23) % 18) + 30, by = top + (hash(b.i, 23) % 18) + 30, n = bx - ax; if (n < 8 || n > 400) continue;
    for (let q = 0; q <= n; q += 1) { const u = q / n, yy = R(ay + (by - ay) * u + Math.sin(u * Math.PI) * 14); rc(g, ax + q, yy, 1, 1, haze('#cdb88a')); if (q % 20 === 10) { const sk = (q / 20 + a.i) % 3; if (sk === 0) { rc(g, ax + q - 2, yy + 1, 5, 4, haze('#e8dcc0')); rc(g, ax + q - 1, yy + 2, 1, 1, '#2a1a12'); rc(g, ax + q + 1, yy + 2, 1, 1, '#2a1a12'); } else if (sk === 1) rc(g, ax + q - 2, yy + 1, 5, 8, haze('#8a6a48')); else { rc(g, ax + q, yy + 1, 1, 4, haze('#cdb88a')); rc(g, ax + q - 1, yy + 5, 3, 1, haze('#e8dcc0')); } } } }
}

/* ============================================ THE CANOPY SNARES: boughs hung with the goblins' traps (parallax 0.7) ============================================ */
function drawSnares(g, cx, cy, VW, VH, time) {
  const par = 0.7, X0 = AREA.snares[0] * TS, X1 = AREA.snares[1] * TS, XC = (X0 + X1) / 2, cxl = XC + (cx - XC) * par, base = R(30 - (cy - 250) * 0.5), bark = ['#2a1a10', '#4a2e1a', '#6e4626', '#9a6a38'], H = c => mix(c, '#d8944e', 0.3);
  const wl = cxl - 80, wr = cxl + VW + 80, a0 = Math.max(X0, wl), a1 = Math.min(X1, wr); if (a1 <= a0) return;
  /* two boughs across the whole stretch, sagging and rising */
  for (let b = 0; b < 2; b++) { const by = base + b * 70, th = 14 - b * 4;
    for (let wx = Math.floor(a0); wx < a1; wx += 2) { const x = R(wx - cxl), y = R(by + Math.sin(wx * 0.011 + b * 2) * 10 + Math.sin(wx * 0.037) * 3);
      rc(g, x, y, 2, th, H(bark[2])); rc(g, x, y, 2, 2, H(bark[3])); rc(g, x, y + th - 3, 2, 3, H(bark[0])); if ((wx >> 1) % 7 === 0) rc(g, x, y + 3, 1, 4, H(bark[1])); }
    /* what hangs from it, every ~44 px: a noose, a bundled net, bone chimes, a red rag on a stick */
    for (let wx = Math.ceil(a0 / 44) * 44; wx < a1; wx += 44) { const k = (hash(wx, b + 3) >> 3) % 4, x = R(wx - cxl), y = R(by + Math.sin(wx * 0.011 + b * 2) * 10 + Math.sin(wx * 0.037) * 3) + th, sw = R(Math.sin(time * 1.3 + wx) * 1.5);
      if (k === 0) { rc(g, x, y, 1, 14, H('#cdb88a')); for (let q = 0; q < 8; q++) { const ang = q * 0.785; rc(g, x + sw + R(Math.cos(ang) * 5), y + 14 + R(Math.sin(ang) * 5), 1, 1, H('#cdb88a')); } }   /* a noose */
      else if (k === 1) { rc(g, x, y, 1, 8, H('#cdb88a')); rc(g, x - 5 + sw, y + 8, 11, 9, H('#8a7a5a')); for (let q = 0; q < 11; q += 3) rc(g, x - 5 + sw + q, y + 9, 1, 7, H('#e8dcc0')); rc(g, x - 5 + sw, y + 12, 11, 1, H('#5a4a30')); }   /* a bundled net */
      else if (k === 2) { for (let q = 0; q < 3; q++) { rc(g, x - 4 + q * 4, y, 1, 7 + q * 3, H('#cdb88a')); rc(g, x - 5 + q * 4, y + 7 + q * 3, 3, 4, H('#e8dcc0')); } }   /* bone chimes */
      else { rc(g, x, y - 12, 1, 14, H('#5a3c26')); for (let q = 0; q < 7; q++) rc(g, x + 1 + q, y - 12 + R(Math.sin(time * 3 + q * 0.6) * 1.5) + (q >> 2), 1, 5, q & 1 ? '#b8403a' : '#e8685a'); } } }
  /* leaf-mass clumps on the upper bough, in the autumn gold */
  for (let wx = Math.floor(a0 / 90) * 90; wx < a1; wx += 90) { const x = R(wx - cxl) + ((hash(wx, 7) >> 3) % 20), y = base - 6 - ((hash(wx, 8) >> 4) % 12); disc(g, x, y, 22, 9, H('#7a5a1e')); disc(g, x - 4, y - 3, 15, 5, H('#b88a34')); disc(g, x - 7, y - 4, 7, 2, H('#e8c050')); }
}

/* ============================================ THE TROPHY LODGE: the hall's back wall, tile cols 372-448, rows 1-19 ============================================ */
const LODGE = { x: 372 * TS, y: 100, w: 76 * TS, h: 204 };   /* y 100 = the arena camera's top edge; its floor is y 288 */
export const HORN_X = 417 * TS + 8;   /* the horn mount hangs over the middle of the stand */
const lodgeWall = () => once('lodge', () => {
  const { w: W, h: H } = LODGE, [c, g] = mk(W, H), r = mulberry(7733);
  const log = ['#2a1810', '#3e2416', '#54321c', '#6e4624'];
  /* (the bake's top is world y 100 - the arena camera's top edge: everything the eye wants is laid below it) */
  /* the back wall: courses of lashed bark logs, each a different warm brown, the lashings in columns */
  for (let y = 36, row = 0; y < H; y += 11, row++) { for (let x = 0; x < W;) { const w = 40 + ((r() * 60) | 0), col = log[(r() * 3) | 0]; rc(g, x, y, w, 10, col); rc(g, x, y, w, 1, log[3]); rc(g, x, y + 9, w, 1, '#150c08'); for (let q = 0; q < 3; q++) rc(g, x + 6 + ((r() * (w - 12)) | 0), y + 3 + ((r() * 4) | 0), 3, 1, '#150c08'); rc(g, x + w - 1, y, 1, 10, '#150c08'); x += w; } }
  for (let x = 0; x < W; x += 80) { rc(g, x - 3, 24, 7, H - 24, '#4a2a14'); rc(g, x - 3, 24, 2, H - 24, '#7a5226'); rc(g, x + 2, 24, 2, H - 24, '#1a0e08'); for (let y = 40; y < H; y += 24) { rc(g, x - 4, y, 9, 3, '#cdb88a'); rc(g, x - 4, y, 9, 1, '#f0e0b0'); } }   /* the posts and their lashings */
  /* the eaves and the rafters: a ragged roof of root-thatch over the top of the hall, great beams under it */
  for (let x = 0; x < W; x++) { const eave = 14 + ((hash(x >> 2, 5) % 5)) + Math.round(Math.sin(x * 0.05) * 3); rc(g, x, 0, 1, eave, '#1c1008'); if (x % 3 === 0) rc(g, x, eave, 1, 3 + (hash(x, 9) % 8), '#33200f'); rc(g, x, eave - 5, 1, 2, '#5a3a1a'); }
  for (let x = -20; x < W; x += 120) { rc(g, x, 22, 130, 7, '#4a2a14'); rc(g, x, 22, 130, 1, '#7a5226'); rc(g, x, 28, 130, 1, '#150c08'); for (const dx of [10, 110]) for (let q = 0; q < 12; q++) rc(g, x + dx - q, 29 + q, 3, 2, '#3a2210'); }   /* a beam and its braces */
  rc(g, 0, 31, W, 6, '#3e2416'); rc(g, 0, 31, W, 1, '#8a6232'); rc(g, 0, 36, W, 1, '#150c08');   /* the wall plate */
  /* THE SKULL SHELF: a plank on brackets, a row of trophy skulls, antlers and horns on it */
  rc(g, 0, 62, W, 4, '#4a2a14'); rc(g, 0, 62, W, 1, '#8a6232'); for (let x = 12; x < W; x += 80) rc(g, x, 66, 4, 8, '#33200f');
  for (let x = 20; x < W; x += 21) { const k = (hash(x, 4) >> 3) % 4; if (k === 0) { disc(g, x, 56, 4, 4, '#e8dcc0'); rc(g, x - 3, 58, 7, 3, '#e8dcc0'); rc(g, x - 2, 55, 2, 2, '#2a1a12'); rc(g, x + 1, 55, 2, 2, '#2a1a12'); rc(g, x - 1, 60, 3, 1, '#b8a888'); }
    else if (k === 1) { rc(g, x - 6, 48, 2, 12, '#e8dcc0'); rc(g, x + 5, 48, 2, 12, '#e8dcc0'); rc(g, x - 4, 57, 9, 4, '#b8a888'); rc(g, x - 8, 50, 3, 2, '#e8dcc0'); rc(g, x + 7, 50, 3, 2, '#e8dcc0'); }   /* a pair of antlers */
    else if (k === 2) { disc(g, x, 56, 3, 3, '#b8a888'); rc(g, x - 4, 49, 1, 5, '#e8dcc0'); rc(g, x + 4, 49, 1, 5, '#e8dcc0'); }
    else { rc(g, x - 3, 52, 7, 9, '#6a4a30'); rc(g, x - 2, 53, 5, 1, '#8a6a48'); } }
  /* THE SKIN RACKS: hides stretched on frames, hung between the posts (the lodge's own washing) */
  for (let x = 44; x < W - 40; x += 160) { rc(g, x - 1, 78, 2, 62, '#4a2a14'); rc(g, x + 31, 78, 2, 62, '#4a2a14'); rc(g, x - 3, 76, 40, 3, '#6e4624');
    for (let yy = 0; yy < 46; yy++) { const ins = yy < 3 || yy > 42 ? 3 : (yy * 7 % 4 === 0 ? 1 : 0); rc(g, x + 2 + ins, 80 + yy, 28 - ins * 2, 1, yy % 9 === 4 ? '#6a4a30' : '#8a6a48'); } rc(g, x + 6, 82, 1, 38, '#5a4230'); rc(g, x + 24, 86, 1, 34, '#5a4230'); for (const [lx, ly] of [[x + 2, 80], [x + 30, 80], [x + 2, 124], [x + 30, 124]]) rc(g, lx, ly, 2, 2, '#cdb88a'); }
  /* THE HORN MOUNT over the stand: a great curved horn on a carved plaque, a beast's skull under it, crossed arrows, a trailing cord */
  { const mx = HORN_X - LODGE.x, my = 96; rc(g, mx - 38, my - 22, 76, 44, '#2a170c'); rc(g, mx - 38, my - 22, 76, 2, '#7a5226'); rc(g, mx - 38, my + 20, 76, 2, '#150c08'); rc(g, mx - 38, my - 22, 2, 44, '#150c08'); rc(g, mx + 36, my - 22, 2, 44, '#150c08');   /* the plaque */
    for (let q = -36; q < 36; q += 8) { rc(g, q + mx, my - 18, 2, 2, '#cdb88a'); rc(g, q + mx, my + 14, 2, 2, '#cdb88a'); }
    for (const s of [-1, 1]) for (let q = 0; q < 34; q++) rc(g, mx + s * (q * 0.5) - (s > 0 ? 0 : 2), my - 18 + q * 0.9, 2, 1, '#c9a060');   /* two arrows crossed behind */
    for (let a = 0; a < 46; a++) { const t = a / 45, ang = 0.3 + t * 2.5, x = mx + Math.cos(Math.PI - ang) * 30 * (1 - t * 0.35), y = my + 2 - Math.sin(ang) * 15 * (1 - t * 0.3), th = Math.max(2, 7 - Math.round(t * 5));   /* the horn: a great curve, thick at the root */
      rc(g, x, y - th / 2, 2, th, a % 9 === 8 ? '#b8a888' : '#e8dcc0'); rc(g, x, y - th / 2, 2, 1, '#fff6e0'); }
    rc(g, mx - 33, my - 2, 5, 12, '#ff9a3c'); rc(g, mx - 33, my - 2, 5, 1, '#ffd8a0'); rc(g, mx - 31, my + 2, 2, 6, '#2a1a12');   /* its amber-rimmed bell */
    disc(g, mx + 8, my + 10, 10, 7, '#e8dcc0'); rc(g, mx + 2, my + 12, 4, 4, '#2a1a12'); rc(g, mx + 10, my + 12, 4, 4, '#2a1a12'); rc(g, mx + 6, my + 16, 5, 1, '#b8a888');   /* the beast's skull */
    rc(g, mx - 1, my + 22, 2, 24, '#cdb88a'); rc(g, mx - 3, my + 46, 6, 5, '#b8403a'); }
  /* the hall darkens toward its floor and under the roof; its ends fade into the forest */
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(10,6,4,0.4)'); gr.addColorStop(0.35, 'rgba(10,6,4,0)'); gr.addColorStop(1, 'rgba(10,6,4,0.45)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'destination-in'; { const gr2 = g.createLinearGradient(0, 0, W, 0); gr2.addColorStop(0, 'rgba(0,0,0,0)'); gr2.addColorStop(90 / W, 'rgba(0,0,0,1)'); gr2.addColorStop((W - 60) / W, 'rgba(0,0,0,1)'); gr2.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr2; g.fillRect(0, 0, W, H); } g.globalCompositeOperation = 'source-over';   /* (one gradient over the whole bake) */
  return c; });
function drawLodge(g, cx, cy, VW, VH, time) {
  const sx = LODGE.x - cx, sy = LODGE.y - cy; if (sx > VW || sx + LODGE.w < 0 || sy > VH || sy + LODGE.h < 0) return;
  g.drawImage(lodgeWall(), sx, sy);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [wx, wy, r0, a] of [[HORN_X, 196, 110, 0.2], [392 * TS, 160, 70, 0.16], [442 * TS, 160, 70, 0.16], [404 * TS, 190, 60, 0.12], [430 * TS, 190, 60, 0.12]]) glow(g, R(wx - cx), R(wy - cy), R(r0 * (1 + 0.05 * Math.sin(time * 5 + wx))), a, '255,190,100');
  g.restore();
}

/* the one call from RWB.drawBackdrop */
export function drawAreaBack(g, cx, cy, VW, VH, time) {
  if (inView(AREA.cellar, cx, VW)) drawCellar(g, cx, cy, VW, VH, time);
  if (inView(AREA.gantry, cx, VW)) drawGantry(g, cx, cy, VW, VH, time);
  if (inView(AREA.snares, cx, VW)) drawSnares(g, cx, cy, VW, VH, time);
  if (inView(AREA.lodge, cx, VW)) drawLodge(g, cx, cy, VW, VH, time);
  if (inView([AREA.trunk[0] - 1, AREA.trunk[1] + 1], cx, VW)) drawTrunk(g, cx, cy, VW, VH, time);
}

/* ============================================ THE AREAS' LIGHTS (read off the built level; RWW.planRoot adds them) ============================================ */
export function areaLights(L, T) {
  const out = [], W = L.W, tt = (x, y) => x < 0 || y < 0 || x >= W || y >= L.H ? T.SOLID : L.grid[y * W + x];
  const standTop = (x, y) => tt(x, y) === T.SOLID && tt(x, y - 1) === T.AIR;
  /* the cellar: a spore light on every bud and cap, the span's cleat, and bioluminescent caps along its floor and ledges */
  for (const m of (L.moversExtra || [])) if (m.kind === 'growcap') { const z = m.x / TS; if (z < 100) out.push({ x: m.x + m.w / 2, y: m.y - 2, r: 46, a: 0.34, c: '255,130,200', fl: 0.4, hole: 52 }); else if (z > 111 && z < 151) out.push({ x: m.x + m.w / 2, y: m.y - 2, r: 42, a: 0.3, c: '255,190,100', fl: 0.4, hole: 46 }); }
  for (const h of (L.hoists || [])) if (h.id === 'cellarSpan') out.push({ x: h.cleat[0] * TS + 8, y: h.cleat[1] * TS, r: 44, a: 0.3, c: '150,230,210', fl: 0.5, hole: 50 });
  let n = 0, last = -99;
  for (let x = 2; x < 100 && n < 22; x++) for (let y = 26; y < 44; y++) { if (!standTop(x, y) || x - last < 4 || (hash(x * 7, y * 3) % 100) > 14) continue; last = x; n++;
    out.push({ x: x * TS + 8, y: y * TS - 6, r: 34, a: 0.26, c: n % 3 === 0 ? '200,120,255' : '110,240,215', fl: 0.6, hole: 40 }); break; }
  /* the trunk's foot: pale caps in the dark, teal and rose */
  for (let x = 113; x < 150; x += 5) { for (let y = 30; y < 36; y++) if (standTop(x, y)) { out.push({ x: x * TS + 8, y: y * TS - 5, r: 38, a: 0.26, c: (x / 5 | 0) % 2 ? '120,230,215' : '230,130,210', fl: 0.5, hole: 44 }); break; } }
  /* the lodge: the horn mount's lamp, the lanterns on its posts */
  out.push({ x: HORN_X, y: 196, r: 100, a: 0.2, c: '255,190,100', fl: 0.4, hole: 90 }); for (const x of [392, 442]) out.push({ x: x * TS, y: 160, r: 64, a: 0.18, c: '255,190,100', fl: 0.7, hole: 78 });   /* (claude/arenapolish) a hole in the lair's dark */
  return out;
}
