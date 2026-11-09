// src/redraw/ft5_art.js - FALLING TOWER 5 ART (claude/ft5art): the paint for ft5a's level (src/tower-fall5.js, src/ft5-level.js) and ft5b's spire field (src/spire-field.js).
//   HIS POISON      paintPoison() / paintPoisonFront()  ONE look for the thing that chases you up the shaft, along the wall, and fills the arena: a viscous green-black swell with a lit lip,
//                                                       sigils and bubbles rising through it, a drowned skull now and then, a haze of his light over it (chase.js look 'dark' under FT5, the sea)
//   THE CHUNKS      chunk()                             QUICK / SNAP / TEACH crack states: a loose block with gaps either side, jagged underside, a tinted rim, cracks that open and burn
//   THE SLAB        paintSlab()                         the floor that tears loose (wait / told / sliding): slate courses, iron pins, a split seam
//   THE SKINS       skins()                             'spire' (slate and violet glass: the Folly's outbuildings), 'lying' (the fallen wall's courses, stood on end: the run's floor)
//   THE SKY         drawBack()                          open sky from the Outer Face on: the moon, torn cloud, the far Folly skyline leaning, the horizon, masonry tumbling past
//   THE HORIZON     horizon()                           the horizon a window / hole shows, tipped to the act's story angle (src/redraw/fallen_tower.js hole())
//   THE PIECES      drawWorld()                         the shelves / dome ribs / gallery shear / bell / IT GOES OVER told and done, the braced rooms, his harry rings, the wall run's windows
//                                                       and buttresses, the Folly's lurch
//   THE FIELD       drawField()                         his sea, the spires' windows, pinnacles and banners, a spire's tell and its collapse, the cracked buttresses, the fade, the rugs
//   THE OPEN HALL   openDress() / abyss()               phase 2 outdoors: far spires, torn cloud and the void under the witchfire floor (src/sanctum.js)
// Only the tower's own materials: stone, slate, violet glass, iron, brass, verdigris; no wood or logs. Everything is deterministic from its inputs + the clock (no Math.random), so a frame is
// the same however often it is drawn. Pixel art: fillRect and stepped lines, a few arcs for the moon; tools/ft5art-sheet.mjs renders it in Node.
import { canvas, rect, px } from '../px.js';
import { paintCase, paintCaseLying, paintRib, paintRibDown, paintShearCrack, paintShearDust, paintBell, paintBellImpact, paintCrack, paintWallBreak, paintButtress } from './ft4_art.js';

const TS = 16;
const rnd = (i, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const R_ = (g, c, x, y, w, h) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const blink = (time, r = 8) => Math.floor(time * r) % 2;
/* a stepped 1 px line (crisp: no antialiasing, works in the Node renderer too) */
function ln(g, c, x0, y0, x1, y1) { g.fillStyle = c; x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) g.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), 1, 1); }

/* ---------------------------------------------------------------- HIS POISON */
export const POI = { void: '#030a06', deep: '#06160d', body: '#0b2a18', mid: '#14502c', lit: '#2f9a55', rim: '#6fe08a', glow: '#c8ffd8', sick: '#8fd160', rune: '#a6ff9e', bone: '#cfe8c8' };
const GLYPHS = [['01110', '10001', '10101', '10001', '01110'], ['00100', '01110', '00100', '01010', '10001'], ['11111', '00100', '01110', '00100', '11111'], ['10001', '01010', '00100', '01010', '10001']];
const SKULL = ['0111110', '1111111', '1011101', '1011101', '1111111', '0111110', '0101010'];
const stamp = (g, G, x, y, col) => { g.fillStyle = col; for (let j = 0; j < G.length; j++) for (let i = 0; i < G[j].length; i++) if (G[j][i] === '1') g.fillRect(Math.round(x + i), Math.round(y + j), 1, 1); };
const swell = (u, t, amp) => Math.sin(u * 0.045 + t * 2.2) * 2.2 * amp + Math.sin(u * 0.11 - t * 3.1) * 1.3 * amp + Math.sin(u * 0.23 + t * 1.3) * 0.6 * amp;
/* a surface along u at v0 with the poison below it to vBot (any frame: paintPoisonFront turns it on its side). o: { tell, phase (the world u of u = 0: waves and sigils stay put as the camera moves), vw (how far u is on screen) } */
export function paintPoison(g, u0, u1, v0, vBot, time, o = {}) {
  if (!(vBot > v0 - 8)) return;
  const amp = o.tell ? 2.4 : 1, ph = o.phase || 0, a = Math.max(u0, -8), b = Math.min(u1, (o.vw || 330) + 8), depth = vBot - v0, w = u1 - u0;
  g.fillStyle = POI.body; g.fillRect(u0, v0 + 4, w, Math.max(0, depth - 4));
  for (const [d, col] of [[16, 'rgba(3,12,7,0.30)'], [44, 'rgba(2,8,5,0.40)'], [100, 'rgba(1,4,2,0.50)']]) if (depth > d) { g.fillStyle = col; g.fillRect(u0, v0 + d, w, depth - d); }
  if (b <= a) return;
  for (let u = Math.floor(a / 2) * 2; u < b; u += 2) {   /* the swell: a lit lip over a mid band over the body */
    const ey = Math.round(v0 + swell(u + ph, time, amp));
    if (ey < v0 + 4) { g.fillStyle = POI.body; g.fillRect(u, ey, 2, v0 + 4 - ey); }
    g.fillStyle = POI.mid; g.fillRect(u, ey + 3, 2, 3); g.fillStyle = POI.lit; g.fillRect(u, ey + 1, 2, 2); g.fillStyle = POI.rim; g.fillRect(u, ey, 2, 1);
    if (Math.sin((u + ph) * 0.9 + time * 5) > 0.97) { g.fillStyle = POI.glow; g.fillRect(u, ey - 1, 2, 1); } }
  const cell = 40, k0 = Math.floor((a + ph) / cell), k1 = Math.floor((b + ph) / cell);
  for (let k = k0; k <= k1; k++) {
    const bu = k * cell - ph + rnd(k, 1) * cell;
    /* a strand of it thickening under the lip, slow */
    { const sv = v0 + 9 + rnd(k, 2) * 14, sl = 6 + rnd(k, 3) * 10; g.fillStyle = 'rgba(63,174,95,0.22)'; for (let j = 0; j < sl; j++) g.fillRect(Math.round(bu + Math.sin(j * 0.5 + time * 1.5 + k) * 2), Math.round(sv + j), 1, 1); }
    /* bubbles rising, popping at the lip in a spit of drops (twice as many while a tide is told) */
    for (let n = 0; n < (o.tell ? 2 : 1); n++) { if (rnd(k, 10 + n) < (o.tell ? 0.15 : 0.45)) continue;
      const ph2 = (time * (0.3 + rnd(k, 4 + n) * 0.3) + rnd(k, 5 + n)) % 1, bv = v0 + 4 + (1 - ph2) * (24 + rnd(k, 6) * 22), bx = bu + n * 13 + Math.sin(ph2 * 9 + k) * 2, r = rnd(k, 7 + n) > 0.65 ? 2 : 1;
      if (ph2 > 0.93) { g.fillStyle = POI.glow; for (let j = 0; j < 3; j++) g.fillRect(Math.round(bx + (j - 1) * 3), Math.round(v0 - 2 - (ph2 - 0.93) * 60 * (1 - j % 2 * 0.4)), 1, 1); continue; }
      g.fillStyle = POI.sick; g.fillRect(Math.round(bx), Math.round(bv - r), 2 * r, 1); g.fillRect(Math.round(bx), Math.round(bv + r), 2 * r, 1); g.fillRect(Math.round(bx - 1), Math.round(bv), 1, 1); g.fillRect(Math.round(bx + 2 * r), Math.round(bv), 1, 1);
      g.fillStyle = POI.glow; g.fillRect(Math.round(bx), Math.round(bv - r), 1, 1); }
    /* HIS SIGILS drift up through it, fading in and out */
    if (rnd(k, 20) > 0.55) { const p3 = (time * 0.12 + rnd(k, 21)) % 1, al = Math.sin(p3 * Math.PI) * (o.tell ? 0.8 : 0.5); g.globalAlpha = al; stamp(g, GLYPHS[Math.floor(rnd(k, 22) * 4)], bu - 2, v0 + 12 + p3 * 40, POI.rune); g.globalAlpha = 1; }
    /* and now and then a drowned skull, deep and slow */
    if (rnd(k, 30) > 0.9) { const p4 = (time * 0.07 + rnd(k, 31)) % 1; g.globalAlpha = Math.sin(p4 * Math.PI) * 0.4; stamp(g, SKULL, bu, v0 + 28 + (1 - p4) * 30, POI.bone); g.globalAlpha = 1; } }
  /* the haze of his light over it, and sparks off the lip */
  if (g.createLinearGradient) { const grad = g.createLinearGradient(0, v0, 0, v0 - 36); grad.addColorStop(0, 'rgba(111,224,138,' + (o.tell ? 0.34 : 0.2) + ')'); grad.addColorStop(1, 'rgba(111,224,138,0)'); g.fillStyle = grad; g.fillRect(a, v0 - 36, b - a, 36); }
  for (let i = 0; i < 7; i++) { const su = ((rnd(i, 40) * 330 + time * 12 * (i % 2 ? 1 : -1) - ph % 330 + 660) % 330), rise = (time * 22 + i * 17) % 30; if (su < a || su > b) continue; g.fillStyle = i % 3 ? POI.rim : POI.glow; g.fillRect(Math.round(su), Math.round(v0 - 3 - rise), 1, 1); }
}
/* the poison as a WALL coming along the run: its front at screen x, the poison behind it (dir 1: it comes from the west) */
export function paintPoisonFront(g, x, dir, VH, time, o = {}) {
  g.save(); g.transform(0, 1, dir > 0 ? -1 : 1, 0, Math.round(x), 0); paintPoison(g, 0, VH, 0, 260, time, { ...o, vw: VH + 8, phase: o.phase || 0 }); g.restore();
}

/* ---------------------------------------------------------------- THE STONE (skins) */
let SK = null;
export function skins() {
  if (SK) return SK;
  const tile = fn => [0, 1, 2].map(v => { const [c, g] = canvas(16, 16); fn(g, v); return c; });
  /* THE FOLLY'S OUTBUILDINGS: slate gone violet in his light - coursed ashlar, a lit upper left of every block, a fleck of glass in the mortar, a crack in one in three */
  const spire = tile((g, v) => {
    rect(g, 0, 0, 16, 16, '#3b3852'); rect(g, 0, 7, 16, 1, '#201c30'); rect(g, 0, 15, 16, 1, '#201c30');
    const j1 = (v * 5 + 3) % 14 + 1, j2 = (v * 5 + 11) % 14 + 1; for (let y = 0; y < 7; y++) px(g, j1, y, '#201c30'); for (let y = 8; y < 15; y++) px(g, j2, y, '#201c30');
    rect(g, 0, 0, 16, 1, '#4e4a6a'); rect(g, 0, 8, 16, 1, '#46425f'); rect(g, 1, 1, Math.max(1, j1 - 2), 1, '#5a5678'); rect(g, 1, 9, Math.max(1, j2 - 2), 1, '#544f70');
    rect(g, 0, 6, 16, 1, '#2c2940'); rect(g, 0, 14, 16, 1, '#2c2940');
    for (let i = 0; i < 4; i++) px(g, (i * 7 + v * 3) % 16, (i * 5 + v * 2) % 14 + 1, i % 2 ? '#2c2940' : '#4a4666');
    if (v === 1) { ln2(g, 3, 2, 6, 6, '#14101f'); ln2(g, 6, 6, 5, 10, '#14101f'); px(g, 4, 2, '#7a6aa8'); }
    if (v === 2) { px(g, j1, 7, '#7a5ac0'); px(g, (j2 + 6) % 15 + 1, 15, '#5a3a9a'); px(g, 12, 3, '#6a5a9a'); } });
  /* THE LYING WALL: the tower's courses stood on end - narrow vertical courses of blocks, the joints stepping, wind-scoured; the coping is drawn over the top by drawRun */
  const lying = tile((g, v) => {
    rect(g, 0, 0, 16, 16, '#46506a'); const o = [0, 5, 11][v];
    for (const x of [o % 16, (o + 8) % 16]) rect(g, x, 0, 1, 16, '#252b3a');
    for (const [x, ys] of [[o + 1, [7, 15]], [o + 9, [3, 11]]]) for (const y of ys) rect(g, x % 16, y, Math.min(7, 16 - x % 16), 1, '#252b3a');
    rect(g, (o + 1) % 16, 0, 1, 16, '#56627e'); rect(g, (o + 9) % 16, 0, 1, 16, '#52607a');
    for (let i = 0; i < 5; i++) px(g, (i * 7 + v * 3) % 16, (i * 5 + v * 4) % 16, i % 2 ? '#343c52' : '#6a7896');
    if (v === 1) { ln2(g, 4, 1, 7, 7, '#12151e'); ln2(g, 7, 7, 6, 12, '#12151e'); px(g, 5, 1, '#7a88a6'); }
    if (v === 2) { px(g, 12, 13, '#8e7e5e'); px(g, 13, 13, '#b09c74'); px(g, 2, 5, '#8e7e5e'); } });
  return (SK = { spire, lying });
}
function ln2(g, x0, y0, x1, y1, c) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let i = 0; i <= n; i++) px(g, Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c); }

/* ---------------------------------------------------------------- THE CHUNKS */
const CHUNK = { teach: { rim: '#d8a850', hot: '#ffd36b', num: true }, quick: { rim: '#e07a3a', hot: '#ffb070', num: true }, snap: { rim: '#d8453d', hot: '#ff8a7a', num: false } };
/* one crumbling section (src/tower-collapse.js c): 0 = not an FT5 chunk (the default paint draws it), 1 = painted, 2 = painted and the count's numeral is wanted over it.
   (sx, sy) = its top-left on screen, w its width in px; counting / k = how far into its count it is (0..1) */
export function chunk(g, c, sx, sy, w, time, counting, k) {
  const C = CHUNK[c.kind]; if (!C) return 0;
  const rows = c.rows || 1, h = rows * TS, snap = c.kind === 'snap', fast = counting && c.t < (snap ? 0.5 : 1), jig = fast ? Math.round(Math.sin(time * 50)) : 0;
  sx = Math.round(sx) + jig; sy = Math.round(sy);
  R_(g, '#0b0912', sx - 1, sy, 1, h); R_(g, '#0b0912', sx + w, sy, 1, h);   /* the gaps either side: it is a loose block */
  for (let x = 0; x < w; x += 3) { const d = 2 + Math.round(rnd(x + c.x0 * 7, 3) * (snap ? 4 : 3)); R_(g, '#1c2030', sx + x, sy + h, 3, d); R_(g, '#343c52', sx + x, sy + h, 3, 1); R_(g, '#12151e', sx + x + 2, sy + h + 1, 1, d - 1); }   /* its torn underside */
  const hot = counting, ph = hot ? 0.55 + 0.45 * Math.sin(time * (snap ? 30 : 18)) : 0.5;
  g.globalAlpha = hot ? 0.45 + 0.45 * k * ph : 0.5; R_(g, hot ? C.hot : C.rim, sx, sy, w, 1); R_(g, C.rim, sx, sy + 1, w, 1);
  if (snap || hot) { R_(g, C.rim, sx, sy, 1, h); R_(g, C.rim, sx + w - 1, sy, 1, h); R_(g, C.rim, sx, sy + h - 1, w, 1); } g.globalAlpha = 1;   /* the rim: a SNAP wears it all round, even whole */
  for (let x = c.x0; x <= c.x1; x++) for (let y = c.row; y < c.row + rows; y++) {
    const s = ((x * 73856093) ^ (y * 19349663)) >>> 0, a = 3 + (s % 9), b = 2 + ((s >> 4) % 5), e = 4 + ((s >> 8) % 8), ox = (x - c.x0) * TS, oy = (y - c.row) * TS;
    const pts = [[a, 0], [a + 1, b], [a - 2, b + 5], [e, b + 9], [e + 2, 15]], col = hot ? C.hot : '#0b0912';
    for (let i = 1; i < pts.length; i++) { ln(g, col, sx + ox + pts[i - 1][0], sy + oy + pts[i - 1][1], sx + ox + pts[i][0], sy + oy + pts[i][1]); if (!hot) ln(g, '#7a88a6', sx + ox + pts[i - 1][0] + 1, sy + oy + pts[i - 1][1], sx + ox + pts[i][0] + 1, sy + oy + pts[i][1]); }
    if (snap) ln(g, hot ? C.hot : '#0b0912', sx + ox + 12 - (s % 5), sy + oy, sx + ox + 14 - (s % 3), sy + oy + 9); }   /* a SNAP is hair-cracked twice over */
  if (hot) { R_(g, 'rgba(255,90,60,' + (0.28 * k).toFixed(2) + ')', sx, sy + h, w, 3); }
  else { const p = (time * 0.5 + c.x0 * 0.13) % 3; if (p < 1) { const gx = Math.round(sx + p * (w + 20) - 10); for (let j = 0; j < 4; j++) { const x = gx - j; if (x >= sx && x + 2 <= sx + w) R_(g, 'rgba(255,255,255,0.5)', x, sy + 2 + j, 2, 1); } } }   /* a glint crossing the lip: this one goes */
  return C.num ? 2 : 1;
}

/* ---------------------------------------------------------------- THE SLAB */
/* m = the slab mover (w 48, h 8; st wait | tell | slide | gone), (cx, cy) the camera */
export function paintSlab(g, m, cx, cy, time) {
  if (m.st === 'gone') return;
  const w = m.w || 48, h = m.h || 8, x = Math.round(m.x - cx), y = Math.round(m.y - cy), tell = m.st === 'tell', slide = m.st === 'slide', shake = tell ? Math.round(Math.sin(time * 55) * 1) : 0;
  if (x > g.canvas.width + 60 || x + w < -60 || y > g.canvas.height + 60 || y < -60) return;
  if (slide) for (let i = 0; i < 8; i++) { const tx = x - (m.dir || 1) * (4 + i * 6) + Math.round(Math.sin(i + time * 9) * 2), ty = y - 4 + i * 2 - (i % 3) * 2; g.globalAlpha = 0.5 - i * 0.055; R_(g, i % 2 ? '#a8987c' : '#6a6458', tx, ty, 3, 2); } g.globalAlpha = 1;   /* grit streaming off it */
  g.save(); g.translate(x + w / 2 + shake, y + h / 2); if (slide) g.rotate(clamp(m.t * 0.35, 0, 0.42) * (m.dir || 1));
  const X = -w / 2, Y = -h / 2;
  R_(g, '#0b0912', X - 1, Y - 1, w + 2, h + 5);                                                           /* its shadow edge */
  R_(g, '#46506a', X, Y, w, h + 2); R_(g, '#7a88a6', X, Y, w, 1); R_(g, '#6a7896', X, Y + 1, w, 1);          /* top face, lit */
  for (let i = 1; i < w / 16; i++) R_(g, '#252b3a', X + i * 16, Y + 2, 1, h);                                /* the joints between its three blocks */
  R_(g, '#343c52', X, Y + h - 1, w, 2);
  for (let i = 0; i < w; i += 4) { const d = 1 + Math.round(rnd(i, 61) * 3); R_(g, '#1c2030', X + i, Y + h + 1, 4, d); R_(g, '#343c52', X + i, Y + h + 1, 4, 1); }   /* torn underside */
  for (const px2 of [X + 4, X + w - 6]) { R_(g, '#1c1a24', px2, Y + 2, 3, 4); R_(g, '#8a8e9c', px2, Y + 2, 3, 1); }   /* the iron pins that held it */
  if (!slide) { const sx2 = X + w / 2 - 1; ln(g, tell ? (blink(time, 14) ? '#ff6b6b' : '#ffb070') : '#0b0912', sx2, Y + 1, sx2 + 2, Y + 4); ln(g, tell ? '#ff6b6b' : '#0b0912', sx2 + 2, Y + 4, sx2 - 1, Y + h + 2); }   /* the seam it will go along */
  if (tell) { g.globalAlpha = 0.5; R_(g, blink(time, 14) ? '#ff6b6b' : '#c9463d', X, Y + h + 1, w, 1); g.globalAlpha = 1; }
  else if (!slide) { const p = (time * 0.4 + (m.sx || 0) * 0.01) % 3; if (p < 1) { const gx = Math.round(X + p * (w + 14) - 7); for (let j = 0; j < 3; j++) if (gx - j >= X && gx - j + 2 <= X + w) R_(g, 'rgba(255,255,255,0.55)', gx - j, Y + 1 + j, 2, 1); } }
  g.restore();
}

/* ---------------------------------------------------------------- THE TIPPED HORIZON (what a window / hole shows) */
/* deg = the act's story angle (5 / 15 / 30): the far land tips to it. Inside a clip the caller set to the hole's outline. (cx, cy) the hole's centre, rx/ry its radii */
export function horizon(g, cx, cy, rx, ry, deg) {
  if (!deg) return;
  g.save(); g.translate(Math.round(cx), Math.round(cy + ry * 0.3)); g.rotate(-deg * Math.PI / 180);
  const W = rx * 3.2, glowH = 4;
  R_(g, '#1d2a52', -W, -glowH - 2, W * 2, 2); R_(g, '#2e3d6e', -W, -glowH, W * 2, glowH);                       /* the haze on the rim of the world */
  R_(g, '#0a0f1e', -W, 0, W * 2, ry * 3);                                                                       /* the far land, dark */
  R_(g, '#3a4a78', -W, 0, W * 2, 1);
  for (let i = 0; i < 9; i++) { const x = -W + rnd(i, 71) * W * 2, hh = 2 + Math.round(rnd(i, 72) * 5); R_(g, '#0a0f1e', x, -hh, 2 + Math.round(rnd(i, 73) * 3), hh); }   /* far towers and rises */
  for (let i = 0; i < 4; i++) { const x = -W + rnd(i, 74) * W * 2; R_(g, '#6a8ad0', x, 3 + Math.round(rnd(i, 75) * 4), 1, 1); }   /* a light or two down there */
  g.restore();
}
/* which act's story angle a room sits in (fallen_tower.js asks for it with the room's tile origin and size in px); 0 = none */
export function tipAt(L, tx0, ty0, w, h) {
  const F = L && L.ft5; if (!F) return 0; const tx = tx0 + ((w / 32) | 0), ty = ty0 + ((h / 32) | 0);
  for (const a of F.acts) if (tx >= a.box[0] && tx <= a.box[1] && ty >= a.box[2] && ty <= a.box[3]) return a.n >= 4 ? 0 : a.story;
  return 0;
}

/* ---------------------------------------------------------------- THE SKY OUTSIDE (drawn behind the tiles, over the shared night sky) */
const moonAt = (g, mx, my, R, time) => {
  g.globalCompositeOperation = 'lighter';
  for (let k = 3; k >= 1; k--) { g.fillStyle = 'rgba(150,150,210,' + (0.035 * (4 - k)).toFixed(3) + ')'; g.beginPath(); g.arc(mx, my, R + k * 12, 0, Math.PI * 2); g.fill(); }
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#e8e4d0'; g.beginPath(); g.arc(mx, my, R, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d2cdb6'; g.beginPath(); g.arc(mx + 6, my + 4, R - 4, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e8e4d0'; g.beginPath(); g.arc(mx - 3, my - 2, R - 6, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#c2bca4'; for (const [ox, oy, r] of [[-9, -8, 5], [6, -12, 3], [9, 5, 6], [-4, 9, 3], [-14, 4, 2], [2, -2, 2]]) { g.beginPath(); g.arc(mx + ox, my + oy, r, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = 'rgba(16,13,36,0.85)'; const drift = Math.round((time * 3) % 90) - 45; g.fillRect(mx - 44 + drift, my + 14, 70, 3); g.fillRect(mx - 30 + drift, my + 17, 52, 2); };
/* the Folly's outbuildings far off, some of them leaning: silhouettes with the moon on their near edge. par = parallax; hy = the horizon row on screen */
export function farSkyline(g, VW, hy, par, cx, time, lit = '#3a3f6a') {
  const period = 300, k0 = Math.floor(cx * par / period) - 1, k1 = Math.ceil((cx * par + VW) / period) + 1;
  for (let k = k0; k <= k1; k++) {
    const x0 = Math.round(k * period + rnd(k, 1) * period * 0.5 - cx * par), kind = Math.floor(rnd(k, 2) * 3), bw = 12 + Math.round(rnd(k, 3) * 14), H = 26 + Math.round(rnd(k, 4) * 46), lean = (rnd(k, 5) - 0.5) * 0.5;
    for (let r = 0; r < H; r += 2) {
      const f = kind === 0 ? Math.max(0.12, 1 - r / H) : kind === 1 ? (r < H * 0.55 ? 1 : Math.max(0.2, 1 - (r - H * 0.55) / (H * 0.5))) : (r > H - 8 ? 1 : 0.36 + (r % 14 < 7 ? 0.1 : 0));
      const w = Math.max(2, Math.round(bw * f)), x = x0 + Math.round(r * lean) + Math.round((bw - w) / 2), y = hy - r;
      R_(g, '#0e1026', x, y, w, 2); R_(g, lit, x, y, 1, 2);
      if (r > 8 && r < H - 6 && r % 12 === 4 && w > 6 && rnd(k * 9 + r, 6) > 0.5) R_(g, '#5a3a98', x + Math.round(w / 2) - 1, y, 2, 2); }   /* a window still lit */
    if (kind === 1) { R_(g, '#0e1026', x0 + Math.round(H * 0.55 * lean) - 1, hy - H - 1, 3, 1); }
  }
  void time;
}
export function drawBack(g, L, cx, cy, time) {
  const F = L && L.ft5, A = L && L.ft5Arena; if (!F || !A) return;
  const VW = g.canvas.width, VH = g.canvas.height, ctr = (cx + VW / 2) / TS, k = clamp((ctr - 96) / 22, 0, 1); if (k <= 0) return;
  const rt = L.spireField && L.spireField.rt; if (rt && rt.phase === 'p2' && L.carpetUp) return;   /* phase 2 paints its own sky (src/sanctum.js) */
  const hy = Math.round(VH * 0.84 + (A.runFloor * TS - 100 - cy) * 0.14);
  g.globalAlpha = k;
  /* the moon, the same one he fights under in phase 2 */
  moonAt(g, Math.round(VW * 0.7 - (cx - A.x0 * TS) * 0.04), Math.round(40 - (cy - A.y0 * TS) * 0.03), 26, time);
  /* torn cloud: two banks, the lower lit from under by his sea */
  for (let i = 0; i < 6; i++) { const lower = i % 2, sp = lower ? 0.18 : 0.1, w = 70 + Math.round(rnd(i, 81) * 80), x = Math.round(((rnd(i, 82) * 760 + time * (lower ? 5 : 3) - cx * sp) % 760 + 760) % 760 - 100), y = 24 + Math.round(rnd(i, 83) * 70) + (lower ? 30 : 0) + Math.round((A.runFloor * TS - cy) * 0.04);
    R_(g, 'rgba(14,12,34,0.8)', x, y, w, 4); R_(g, 'rgba(14,12,34,0.8)', x + 10, y - 2, w - 24, 2); R_(g, 'rgba(14,12,34,0.8)', x + 6, y + 4, w - 16, 2);
    R_(g, lower ? 'rgba(90,140,110,0.28)' : 'rgba(150,150,210,0.18)', x + 4, y + 6, w - 12, 1); }
  /* the far land and the leaning skyline on its rim, his light in the haze */
  farSkyline(g, VW, hy, 0.22, cx, time);
  R_(g, '#07091a', 0, hy, VW, VH - hy + 2);
  for (let x = 0; x < VW; x += 3) { const rise = Math.round(Math.sin((x + cx * 0.3) * 0.031) * 2 + Math.sin((x + cx * 0.3) * 0.09) * 1.2); R_(g, '#07091a', x, hy - 2 + rise, 3, 3); }
  R_(g, '#1c2248', 0, hy, VW, 1);
  if (g.createLinearGradient) { const gr = g.createLinearGradient(0, hy - 26, 0, hy); gr.addColorStop(0, 'rgba(111,224,138,0)'); gr.addColorStop(1, 'rgba(111,224,138,0.16)'); g.fillStyle = gr; g.fillRect(0, hy - 26, VW, 26); }
  /* masonry tumbling past: slates and chunks, more of them the nearer the wall run and the arena */
  const n = Math.round(4 + 8 * clamp((ctr - 120) / 30, 0, 1));
  for (let i = 0; i < n; i++) { const sp = 34 + rnd(i, 91) * 50, x = Math.round(((rnd(i, 92) * (VW + 40) - time * 6 * (i % 2 ? 1 : -1) + VW + 40) % (VW + 40)) - 20), y = Math.round(((time * sp + rnd(i, 93) * (VH + 30)) % (VH + 30)) - 15), s = 2 + (i % 3);
    g.save(); g.translate(x, y); g.rotate(time * (1 + i % 4) + i); R_(g, '#2e3550', -s, -(s >> 1), s * 2, s); R_(g, '#6a7896', -s, -(s >> 1), s * 2, 1); g.restore(); }
  g.globalAlpha = 1;
}

/* ---------------------------------------------------------------- THE OPEN HALL (phase 2, src/sanctum.js hooks) */
/* over the night and the moon, under the witchfire floor's far edge: the leaning skyline and torn cloud. ft = the fire's top on screen */
export function openDress(g, cx, cy, time, ft, VW) {
  const hy = ft - 4; farSkyline(g, VW, hy, 0.12, cx, time, '#4a4a88');
  for (let i = 0; i < 5; i++) { const w = 60 + Math.round(rnd(i, 101) * 70), x = Math.round(((rnd(i, 102) * 700 + time * 4 - cx * 0.1) % 700 + 700) % 700 - 100), y = Math.max(8, hy - 70 - Math.round(rnd(i, 103) * 50));
    R_(g, 'rgba(14,12,34,0.8)', x, y, w, 4); R_(g, 'rgba(14,12,34,0.8)', x + 10, y - 2, w - 24, 2); R_(g, 'rgba(150,150,210,0.16)', x + 4, y + 5, w - 12, 1); }
}
/* the void under the floor of witchfire: embers and wisps falling away into it, from the foot of the fire (screen row top) to the bottom of the screen */
export function abyss(g, A, cx, cy, time) {
  const top = Math.round(A.floor + 12 - cy), H = g.canvas.height, VW = g.canvas.width; if (top >= H) return;
  g.fillStyle = '#0a0614'; g.fillRect(0, top, VW, H - top);
  if (g.createLinearGradient) { const gr = g.createLinearGradient(0, top, 0, top + 70); gr.addColorStop(0, 'rgba(154,82,224,0.38)'); gr.addColorStop(1, 'rgba(154,82,224,0)'); g.fillStyle = gr; g.fillRect(0, top, VW, 70); }
  for (let i = 0; i < 14; i++) { const x = Math.round(((rnd(i, 111) * VW * 1.4 - cx * 0.2) % VW + VW) % VW), y = Math.round(top + 4 + ((time * (10 + rnd(i, 112) * 16) + rnd(i, 113) * 90) % Math.max(8, H - top)));
    g.globalAlpha = 0.65 - (y - top) / (H - top + 1) * 0.5; R_(g, i % 3 ? '#9a52e0' : '#c88aff', x, y, 1, 2); } g.globalAlpha = 1;
  for (let i = 0; i < 4; i++) { const x = Math.round(((rnd(i, 121) * VW * 1.2 - cx * 0.35) % (VW + 30) + VW + 30) % (VW + 30) - 15), y = top + 22 + Math.round(rnd(i, 122) * 60), s = 3 + (i % 3);   /* slabs falling away */
    g.globalAlpha = 0.6; R_(g, '#1c1a30', x, y + Math.round(Math.sin(time + i) * 3), s * 3, s); R_(g, '#3a3858', x, y + Math.round(Math.sin(time + i) * 3), s * 3, 1); } g.globalAlpha = 1;
}

/* ---------------------------------------------------------------- THE FOLLY'S LURCH (his death in the Mage's Folly sets the tower going: the first seconds) */
export function lurch(g, t, time) {
  if (t > 5.5) return; const VW = g.canvas.width, VH = g.canvas.height, a = t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.3) / 5);
  g.fillStyle = 'rgba(168,152,124,' + (0.2 * a).toFixed(3) + ')'; for (let i = 0; i < 8; i++) g.fillRect(Math.round(rnd(i, 131) * VW), 0, 20 + Math.round(rnd(i, 132) * 40), Math.round((VH * 0.3 + rnd(i, 133) * VH * 0.4) * Math.min(1, t * 1.2)));   /* plaster dust off the vault */
  const len = Math.min(1, t / 0.45), x0 = Math.round(VW * 0.35), pts = [[0, 0], [10, 14], [-6, 30], [8, 48], [-4, 66], [6, 84], [-2, 100]];
  for (let i = 1; i < pts.length && i <= Math.ceil(len * (pts.length - 1)); i++) { ln(g, '#0b0912', x0 + pts[i - 1][0], pts[i - 1][1], x0 + pts[i][0], pts[i][1]); ln(g, '#7a88a6', x0 + pts[i - 1][0] + 1, pts[i - 1][1], x0 + pts[i][0] + 1, pts[i][1]); }   /* a crack across the ceiling */
  for (let i = 0; i < 14; i++) { const ph = (t * (0.9 + rnd(i, 134) * 0.6) + rnd(i, 135)) % 1, x = Math.round(rnd(i, 136) * VW + Math.sin(time * 3 + i) * 3); g.globalAlpha = a * (1 - ph); R_(g, i % 3 ? '#5a5470' : '#a8987c', x, Math.round(ph * VH * 0.8), 1 + (i % 2), 2); } g.globalAlpha = 1;   /* chips raining */
}

/* ---------------------------------------------------------------- THE PIECES, THE ROOMS, THE RUN (drawn over the tiles, under the creatures) */
const inView = (g, x0, x1, y0, y1) => x1 > -40 && x0 < g.canvas.width + 40 && y1 > -60 && y0 < g.canvas.height + 60;
export function drawWorld(g, L, cx, cy, time) {
  const F = L && L.ft5; if (!F) return; if (L.follyFt5 && L.follyRt) lurch(g, L.follyRt.t, time);
  const R = F.rt; if (!R) return; const art = R.art || (R.art = { doneAt: {} }), VW = g.canvas.width;
  /* THE PIECES */
  for (const p of F.pieces || []) { const S = R.pieces[p.id]; if (!S) continue;
    if (S.st === 'done' && art.doneAt[p.id] === undefined) art.doneAt[p.id] = time; if (S.st !== 'done') delete art.doneAt[p.id];
    const since = S.st === 'done' ? time - art.doneAt[p.id] : 0, u = S.st === 'tell' ? clamp(1 - S.t / (p.tell || 1), 0, 1) : 0;
    if (p.kind === 'lay') { for (const [x0, x1, row] of p.lay || []) { const sx = Math.round(x0 * TS - cx), w = (x1 - x0 + 1) * TS, sy = Math.round(row * TS - cy); if (!inView(g, sx, sx + w, sy - 140, sy + 20)) continue;
        const rib = p.id === 'dome';
        if (S.st === 'tell') { g.globalAlpha = Math.min(1, u * 6);
          if (rib) { const top = sy - 8 * TS, k = u < 0.4 ? 0 : (u - 0.4) / 0.6; if (k <= 0) paintRib(g, sx, top, w, time, true, 0); else paintRib(g, sx, Math.round(top + (sy - top) * k * k), w, time, false, k); }
          else { const dropY = (1 - u) * 80; paintCase(g, sx + 8, Math.round(sy - dropY), w, Math.PI / 2 * u * u, time, u * u, 1); }
          g.globalAlpha = 1; for (let xx = sx; xx < sx + w; xx += 4) R_(g, blink(time) ? '#ff6b6b' : '#c9463d', xx, sy - 2, 2, 2); }
        else if (S.st === 'done') { if (rib) paintRibDown(g, sx, sy, w, time, !!p.slick); else paintCaseLying(g, sx, sy, w); } } continue; }
    if (p.kind === 'shear') { const [x0, x1, row] = p.ledges[0], sx = Math.round(x0 * TS - cx), sx1 = Math.round((x1 + 1) * TS - cx), sy = Math.round(row * TS - cy); if (!inView(g, sx, sx1, sy - 140, sy + 80)) continue;
      if (S.st === 'tell') { const x = Math.round((sx + sx1) / 2), yb = sy + TS, yt = Math.round(yb - 7 * TS * u); paintShearCrack(g, x, yb, yt, time); for (let xx = sx; xx < sx1; xx += 5) R_(g, blink(time) ? '#ff6b6b' : '#c9463d', xx + 1, sy + 13, 3, 2); }
      else if (S.st === 'done') { paintShearDust(g, sx, sx1, sy, p.rows || 2, since);
        for (const [a0, a1, ar] of p.lay || []) { const lx = Math.round(a0 * TS - cx), lw = (a1 - a0 + 1) * TS, ly = Math.round(ar * TS - cy); rubbleStep(g, lx, ly + TS, lw); } }
      continue; }
    if (p.kind === 'bell') { drawBell5(g, F, L, p, S, art, since, cx, cy, time); continue; }
    if (p.kind === 'over') { drawOver(g, F, S, u, since, cx, cy, time); continue; } }
  /* THE BRACED ROOMS: two buttresses either side of the shrine, as FT4's */
  for (const b of F.braced || []) { const y = Math.round((b.box[3] + 1) * TS - cy); if (y < -10 || y > g.canvas.height + 90) continue;
    [[b.box[0] * TS - 4, false], [(b.box[1] + 1) * TS - 8, true]].forEach(([bx, mir]) => { const x = Math.round(bx - cx); if (x > -30 && x < VW + 30) paintButtress(g, x, y, time, mir); }); }
  /* HIS HARRY RINGS: where he hangs outside a breach - a sigil circle he will use, faint until you are near */
  for (const h of F.harry || []) { const x = Math.round(h.x * TS - cx), y = Math.round(h.y * TS - cy); if (x < -40 || x > VW + 40 || y < -40 || y > g.canvas.height + 40) continue;
    const near = clamp(1 - Math.hypot(x - VW / 2, y - g.canvas.height / 2) / 200, 0.25, 1), pulse = 0.55 + 0.45 * Math.sin(time * 2.4 + h.x); g.globalAlpha = near * 0.5 * pulse;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + time * 0.4; R_(g, POI.rune, x + Math.cos(a) * 14, y + Math.sin(a) * 14, i % 4 ? 1 : 2, i % 4 ? 1 : 2); }
    stamp(g, GLYPHS[2], x - 2, y - 2, POI.glow); g.globalAlpha = 1; }
  drawRun(g, F, L, cx, cy, time);
}
function rubbleStep(g, sx, sy, w) {   /* the gallery wall's chunk, landed as a step: tumbled blocks, lit tops */
  for (let x = 0; x < w; x += 8) { const hh = 6 + Math.round(rnd(x + sx, 141) * 7); R_(g, '#343c52', sx + x, sy - hh, 9, hh); R_(g, '#56627e', sx + x, sy - hh, 9, 1); R_(g, '#12151e', sx + x + 8, sy - hh + 1, 1, hh - 1); }
  for (let i = 0; i < 6; i++) R_(g, '#6a7896', sx + rnd(i, 142) * w, sy - 1, 2, 1);
}
function drawBell5(g, F, L, p, S, art, since, cx, cy, time) {
  const [b0, b1] = p.bays, deckY = p.deck * TS, x = Math.round((b0 + b1 + 1) * TS / 2 - cx), ct = Math.round((p.zone[2] - 2) * TS - cy), bx0 = Math.round(b0 * TS - cx), bx1 = Math.round((b1 + 1) * TS - cx);
  if (x < -80 || x > g.canvas.width + 80 || ct < -400 || ct > g.canvas.height + 120) return;
  const hangY = Math.round(deckY - 64 - cy);
  if (S.st === 'wait') { paintBell(g, x, hangY, Math.sin(time * 0.9) * 0.012, time, 'hang', ct); return; }
  if (S.st === 'tell') { const u = clamp(1 - S.t / (p.tell || 1), 0, 1); for (let xx = bx0; xx < bx1; xx += 5) R_(g, blink(time) ? '#ff6b6b' : '#c9463d', xx, Math.round(deckY - cy) - 2, 3, 2);
    paintBell(g, x, hangY, Math.sin(time * 14) * (0.03 + 0.07 * u), time, 'tell', ct); return; }
  /* done: it comes through the deck, then lies wedged in the well */
  const fall = clamp(since / 0.4, 0, 1), y = Math.round(hangY + (deckY - cy - hangY) * fall * fall + (since > 0.4 ? Math.min(60, (since - 0.4) * 300) : 0));
  paintBellImpact(g, x, Math.round(deckY - cy), bx0, bx1, since - 0.35); if (since < 0.45) paintBell(g, x, y, 0, time, 'fall', ct);
  else paintBell(g, x + 6, Math.round(deckY - cy) + 52, 0.5, time, 'fall', ct);
  void F; void L; void art;
}
function drawOver(g, F, S, u, since, cx, cy, time) {   /* IT GOES OVER: told, the wall's courses crack along the bend; done, rubble slides off it */
  const B = F.bend; if (!B) return; const S0 = B.steep, G0 = B.gentle, x0 = S0.x0 * TS, x1 = (G0.x0 + 2 * G0.n) * TS;
  if (x1 - cx < -40 || x0 - cx > g.canvas.width + 40) return;
  if (S.st === 'tell') { for (let i = 0; i < 6; i++) { const col = S0.x0 + i * 2.5, row = S0.row0 - Math.min(S0.n, i * 2.5); const x = Math.round(col * TS + 8 - cx), yb = Math.round((row + 1) * TS - cy); paintShearCrack(g, x, yb, Math.round(yb - 56 * u), time + i * 0.3); }
    paintCrack(g, Math.round(x0 - cx), Math.round(x1 - cx), Math.round((S0.row0 - 4) * TS - cy), time); paintWallBreak(g, Math.round(x0 - cx), Math.round((S0.row0 - 3) * TS - cy), 1, time); }
  else if (S.st === 'done' && since < 3) { const k = since / 3; for (let i = 0; i < 16; i++) { const px2 = x0 + rnd(i, 151) * (x1 - x0), py = (S0.row0 - 6) * TS - cy + k * k * 240 * (0.5 + rnd(i, 152)) - 60 * (1 - k), s = 2 + Math.round(rnd(i, 153) * 3);
      g.globalAlpha = 1 - k; g.save(); g.translate(Math.round(px2 - cx), Math.round(py)); g.rotate(time * (2 + i % 4) + i); R_(g, '#46506a', -s, -s * 0.6, s * 2, s * 1.2); R_(g, '#7a88a6', -s, -s * 0.6, s * 2, 1); g.restore(); } g.globalAlpha = 1; }
}
/* THE WALL RUN: coping along the lying wall, the windows as pits with their glass, the buttresses' weathering */
function drawRun(g, F, L, cx, cy, time) {
  const run = F.run; if (!run) return; const VW = g.canvas.width, fl = run.row + 1;
  if ((run.x1 + 1) * TS - cx < -20 || run.x0 * TS - cx > VW + 20) return;
  const W = L.W, tx0 = Math.max(run.x0, Math.floor(cx / TS) - 1), tx1 = Math.min(run.x1, Math.ceil((cx + VW) / TS) + 1);
  for (let tx = tx0; tx <= tx1; tx++) { const i = fl * W + tx; if (!L.grid[i] || L.grid[i - W]) continue; const x = tx * TS - cx, y = fl * TS - cy;   /* the coping: three courses of weathered cap over the wall's end-on courses */
    R_(g, '#6a7896', x, y, TS, 1); R_(g, '#56627e', x, y + 1, TS, 2); R_(g, '#343c52', x, y + 3, TS, 1); if ((tx * 7) % 5 === 0) R_(g, '#8e7e5e', x + 3, y - 1, 3, 1); }
  for (const [a, b] of run.windows || []) { const x = Math.round(a * TS - cx), y = Math.round(fl * TS - cy), w = (b - a + 1) * TS, h = 2 * TS; if (x > VW + 10 || x + w < -10) continue;
    R_(g, '#0b0912', x, y, w, h); R_(g, '#16122a', x, y + h - 12, w, 12); R_(g, '#242040', x, y + h - 5, w, 5);
    for (let i = 0; i < w; i += 5) { const hh = 3 + Math.round(rnd(i + a, 161) * 4); R_(g, i % 2 ? '#3a2a6a' : '#7a5ac0', x + i, y + h - hh, 3, hh); R_(g, '#c8b4ff', x + i, y + h - hh, 1, 1); }   /* glass shards in the sill */
    R_(g, '#2a2438', x, y + 14, w, 2); R_(g, '#3b344e', x + Math.round(w / 2) - 1, y, 3, h); R_(g, '#56627e', x, y, w, 1);                                              /* tracery bars */
    g.globalAlpha = 0.12; for (let j = 0; j < 4; j++) R_(g, '#c8d4f0', x + 6 + j * 10, y, 3, h); g.globalAlpha = 1; }
  for (const [a, b] of run.buttresses || []) { const x = Math.round(a * TS - cx), y = Math.round((fl - 2) * TS - cy), w = (b - a + 1) * TS; if (x > VW + 10 || x + w < -10) continue;
    R_(g, '#6a7896', x, y, w, 1); R_(g, '#56627e', x, y + 1, w, 2); for (let k = 0; k < 4; k++) R_(g, '#252b3a', x + w - 1 - k, y + 4 + k * 3, 1 + k, 1);   /* stepped weathering down the east face */
    R_(g, '#1c1a24', x, y + 14, w, 3); R_(g, '#5a5a68', x, y + 14, w, 1);                                                                                         /* an iron strap */
    R_(g, '#8e7e5e', x + 2, y - 1, 4, 1); }
}

/* ---------------------------------------------------------------- THE SPIRE FIELD */
const NOTES = { rise: 2.5 };
export function drawField(g, L, F, R, cx, cy, time, e, drawRug) {
  const A = F.A, VW = g.canvas.width, H = g.canvas.height, art = R.art || (R.art = { goneAt: {} }), x0 = Math.round(A.x0 * TS - cx), x1 = Math.round((A.x1 + 1) * TS - cx);
  const sy = Math.round(R.seaY - cy), bot = Math.min(H + 4, Math.round((A.y1 + 1) * TS - cy)), tell = R.tides.some(q => q && q.st === 'tell');
  /* THE SPIRES: windows of violet glass, a broken pinnacle and a torn banner, stains where the sea has been */
  F.spires.forEach((s, i) => { const q = R.spires[i], sx = Math.round(s.x0 * TS - cx), sw = (s.x1 - s.x0 + 1) * TS, top = Math.round(s.top * TS - cy);
    if (q.st === 'gone') { if (art.goneAt[i] === undefined) art.goneAt[i] = time; fallingSpire(g, F, s, R, time - art.goneAt[i], cx, cy, i); return; } delete art.goneAt[i];
    if (sx > VW + 20 || sx + sw < -20) return; const lean = q.st === 'tell' ? Math.round(Math.sin(time * 14) * 2) : 0;
    for (let ry = top + 3 * TS, n = 0; ry + 22 < sy; ry += 6 * TS, n++) for (let wx = sx + (sw > 6 * TS ? 14 : sw / 2 - 5); wx < sx + sw - 12; wx += 7 * TS) lancet(g, wx + lean, ry, time, i * 7 + n);
    { const px0 = sx + sw - 9 + lean, ph = 14 + Math.round(rnd(i, 171) * 12); R_(g, '#3b3852', px0, top - ph, 8, ph); R_(g, '#4e4a6a', px0, top - ph, 1, ph); R_(g, '#201c30', px0 + 7, top - ph + 2, 1, ph - 2);   /* a pinnacle snapped short */
      for (let j = 0; j < 4; j++) R_(g, '#3b3852', px0 + j * 2, top - ph - (j % 2) * 2, 2, 2 + (j % 2) * 2);
      const bx = px0 - 2; for (let j = 0; j < 14; j++) R_(g, j % 5 === 0 ? '#7a3aa0' : '#5a2a7a', bx - Math.round(Math.sin(time * 2.6 + j * 0.35 + i) * (1 + j * 0.15)), top - ph + 2 + j, 3, 1); }   /* the banner: torn violet cloth */
    g.globalAlpha = 0.14; R_(g, POI.rim, sx + 1, sy - 22, 3, 22); R_(g, POI.rim, sx + sw - 5, sy - 18, 3, 18); g.globalAlpha = 1; });   /* his poison running down the faces */
  /* HIS SEA */
  paintPoison(g, x0, x1, sy, bot, time, { tell, phase: cx, vw: VW });
  /* A SPIRE'S TELL: its foot red, the crack climbing it, stone coming away */
  F.spires.forEach((s, i) => { const q = R.spires[i]; if (q.st !== 'tell') return; const a = Math.round(s.x0 * TS - cx), b = Math.round((s.x1 + 1) * TS - cx), t = Math.round(s.top * TS - cy), lean = Math.round(Math.sin(time * 14) * 2), u = clamp(q.t / 1.5, 0, 1);
    g.globalAlpha = 0.6; R_(g, blink(time) ? '#ff6b6b' : '#c9463d', a, Math.min(sy, bot) - 6, b - a, 4); g.globalAlpha = 1;
    let px0 = (a + b) / 2 + lean, py = t; for (let y = t; y < Math.min(sy, t + (sy - t) * Math.max(0.35, u)); y += 8) { const nx = (a + b) / 2 + ((y / 8) % 2 ? 3 : -3) + lean; ln(g, '#0b0912', px0, py, nx, y + 8); ln(g, blink(time, 10) ? '#ffd36b' : '#ff9a5c', px0 + 1, py, nx + 1, y + 8); px0 = nx; py = y + 8; }
    for (let k = 0; k < 6; k++) { const ph = (time * 0.9 + rnd(k + i * 9, 181)) % 1; R_(g, '#a8987c', a + rnd(k, 182) * (b - a), t + ph * 50, 1 + (k % 2), 2); } });
  /* THE CRACKED BUTTRESSES, their ruin once down, and the fall box's ghost while he hangs in it */
  F.spires.forEach((s, i) => { const B = s.buttress, q = R.butt[i]; if (!B || !q || R.spires[i].st === 'gone') return; const bx = Math.round(B.col * TS - cx), by = Math.round(B.top * TS - cy);
    if (bx > VW + 20 || bx < -30) return;
    if (q.st === 'down') { for (let k = 0; k < 7; k++) { const ww = 5 + Math.round(rnd(k, 191) * 6); R_(g, '#3b3852', bx - 3 + k * 3, by + 48 - 4 - (k % 3) * 3, ww, 4 + (k % 3) * 3); R_(g, '#5a5678', bx - 3 + k * 3, by + 48 - 4 - (k % 3) * 3, ww, 1); } return; }
    const glow = e && e.alive && boxHas(B.box, e.x, e.y) && crushable5(e), ember = glow ? 0.9 : 0.35 + 0.2 * Math.sin(time * 3 + i);
    R_(g, '#0b0912', bx + 2, by - 4, 12, 56); R_(g, '#3b3852', bx + 3, by, 10, 48); R_(g, '#5a5678', bx + 3, by, 3, 48); R_(g, '#2c2940', bx + 10, by, 3, 48);
    for (let r = 0; r < 4; r++) { R_(g, '#201c30', bx + 3, by + 11 + r * 12, 10, 1); R_(g, '#201c30', bx + (r % 2 ? 7 : 10), by + r * 12, 1, 12); }
    for (const yy of [by + 8, by + 34]) { R_(g, '#1c1a24', bx + 2, yy, 12, 3); R_(g, '#6a6a78', bx + 2, yy, 12, 1); }   /* iron straps */
    R_(g, '#201c30', bx + 1, by - 6, 14, 3); R_(g, '#7a6aa8', bx + 1, by - 6, 14, 1);                                  /* the cap */
    const cr = [[6, 4], [10, 14], [6, 26], [10, 40]]; for (let k = 1; k < cr.length; k++) { ln(g, '#0b0912', bx + cr[k - 1][0], by + cr[k - 1][1], bx + cr[k][0], by + cr[k][1]); g.globalAlpha = ember; ln(g, glow ? '#ffd36b' : '#ff9a5c', bx + cr[k - 1][0] + 1, by + cr[k - 1][1], bx + cr[k][0] + 1, by + cr[k][1]); g.globalAlpha = 1; }
    if (glow) { g.globalAlpha = 0.18; R_(g, '#ffb070', bx - 2, by - 6, 18, 56); g.globalAlpha = 1; g.strokeStyle = blink(time, 6) ? '#ffd36b' : '#ffffff'; g.setLineDash && g.setLineDash([3, 3]);
      g.strokeRect(Math.round(B.box[0] * TS - cx) + 0.5, Math.round(B.box[2] * TS - cy) + 0.5, (B.box[1] - B.box[0] + 1) * TS, (B.box[3] - B.box[2] + 1) * TS); g.setLineDash && g.setLineDash([]); } });
  /* THE FADE: every platform shimmers his green with his sigils, and goes top-down along a bright line */
  if (R.fade && (R.fade.st === 'tell' || R.fade.st === 'clear')) { const k = R.fade.st === 'tell' ? Math.min(1, R.fade.t / 1.0) : 1, W = L.W,
      ta = Math.max(A.x0, Math.floor(cx / TS) - 1), tb = Math.min(A.x1, Math.ceil((cx + VW) / TS) + 1), ya = Math.max(A.y0, Math.floor(cy / TS) - 1), yb = Math.min(A.y1, Math.ceil((cy + H) / TS) + 1);
    for (let y = ya; y <= yb; y++) for (let x = ta; x <= tb; x++) { if (!L.grid[y * W + x]) continue; const X = Math.round(x * TS - cx), Y = Math.round(y * TS - cy), s = Math.sin(time * 18 + x * 1.7 + y * 0.9);
      g.fillStyle = 'rgba(111,224,138,' + (0.14 + 0.3 * k * (0.6 + 0.4 * s)).toFixed(2) + ')'; g.fillRect(X, Y, TS, TS);
      if (!L.grid[(y - 1) * W + x]) { g.fillStyle = 'rgba(200,255,216,' + (0.35 * k).toFixed(2) + ')'; g.fillRect(X, Y, TS, 1); }
      if ((x * 7 + y * 13) % 6 === 0) { g.globalAlpha = Math.min(1, k * (0.5 + 0.5 * s)); stamp(g, GLYPHS[(x + y) & 3], X + 5, Y + 5, POI.rune); g.globalAlpha = 1; } }
    if (R.fade.st === 'clear' && R.fade.rows && R.fade.done) { const row = R.fade.rows[Math.max(0, R.fade.done - 1)]; if (row && row.length) { const y = Math.round(row[0][1] * TS - cy); g.globalAlpha = 0.7; R_(g, POI.glow, 0, y, VW, 2); R_(g, POI.rim, 0, y + 2, VW, 4); g.globalAlpha = 1; } } }
  /* A MAGIC CARPET flies up under each seat still falling */
  for (const rg of R.rugs.values()) { const x = Math.round(rg.x - cx), y = Math.round(rg.y - cy);
    if (drawRug) drawRug(g, x, y, time, 0); else { R_(g, '#7a2a2a', x - 14, y, 28, 4); R_(g, '#e0b050', x - 14, y, 28, 1); }
    for (let k = 0; k < 6; k++) { const ph = (time * 2 + k * 0.17) % 1; g.globalAlpha = 0.7 * (1 - ph); R_(g, k % 2 ? '#ffd36b' : '#c8b4ff', x - 12 + k * 5, y + 4 + ph * 14, 1, 2); } g.globalAlpha = 1; }
  void NOTES;
}
const boxHas = (b, x, y) => x >= b[0] * TS && x <= (b[1] + 1) * TS && y >= b[2] * TS && y <= (b[3] + 1) * TS + 8;
const crushable5 = e => !['down', 'open', 'sfRise', 'sfFade', 'sfGone', 'wake', 'blinkOut', 'blinkIn', 'realmTell'].includes(e.mode);
/* a lancet of violet glass in a spire's face, 8 x 20: a pointed head, leading, a candle behind it */
function lancet(g, x, y, time, seed) {
  R_(g, '#201c30', x - 2, y + 4, 12, 18); for (let k = 0; k < 4; k++) R_(g, '#201c30', x + 3 - k, y + k, 2 + 2 * k, 1);
  R_(g, '#1a1040', x, y + 5, 8, 15); for (let k = 0; k < 4; k++) R_(g, '#1a1040', x + 3 - k + 1, y + 1 + k, 2 * k, 1);
  const fl = 0.55 + 0.45 * Math.sin(time * 3.1 + seed * 2.3); g.globalAlpha = 0.35 + 0.4 * fl; R_(g, '#7a5ac0', x + 1, y + 8, 6, 6); R_(g, '#c8b4ff', x + 3, y + 10, 2, 2); g.globalAlpha = 1;
  R_(g, '#4a4466', x + 3, y + 1, 2, 19); R_(g, '#4a4466', x, y + 11, 8, 1); R_(g, '#6a6488', x - 2, y + 22, 12, 1);
}
/* a spire going over: it breaks into slabs that fall away into the sea one after another, the top one sliding toward its bridge; t = seconds since */
function fallingSpire(g, F, s, R, t, cx, cy, i) {
  if (t > 1.8) return; const sw = (s.x1 - s.x0 + 1) * TS, sx = s.x0 * TS - cx, top = s.top * TS - cy, sea = R.seaY - cy, n = 4, dir = s.bridge ? Math.sign((s.bridge[0] + s.bridge[1]) / 2 - (s.x0 + s.x1) / 2) || 1 : 1;
  const hh = Math.max(32, Math.min(sea - top, 140)) / n;
  for (let k = 0; k < n; k++) { const d = k * 0.12, u = clamp((t - d) / 0.9, 0, 1); if (u >= 1) continue; const fall = u * u * (sea - top - k * hh + 30), ox = dir * u * (n - k) * 12, rot = dir * u * (0.5 + k * 0.2), y = top + k * hh + fall;
    if (y > sea + 6) continue;
    g.globalAlpha = 1 - u * u * 0.8; g.save(); g.translate(Math.round(sx + sw / 2 + ox), Math.round(y + hh / 2)); g.rotate(rot);
    R_(g, '#3b3852', -sw / 2, -hh / 2, sw, hh); R_(g, '#4e4a6a', -sw / 2, -hh / 2, sw, 1); R_(g, '#201c30', -sw / 2, -hh / 2 + 7, sw, 1); R_(g, '#2c2940', -sw / 2, hh / 2 - 2, sw, 2); R_(g, '#201c30', sw / 2 - 1, -hh / 2, 1, hh);
    for (let j = 0; j < 3; j++) R_(g, '#7a5ac0', -sw / 2 + 6 + j * 14, -2, 1, 1); g.restore(); g.globalAlpha = 1; }
  if (t > 0.5 && t < 1.7) { const k = (t - 0.5) / 1.2; for (let j = 0; j < 10; j++) { const sx2 = sx + rnd(j, 201) * sw + dir * k * 20, h2 = Math.sin(clamp(k * 1.4 - j * 0.03, 0, 1) * Math.PI) * (20 + rnd(j, 202) * 26); g.globalAlpha = 1 - k; R_(g, j % 2 ? POI.rim : POI.glow, sx2, sea - 3 - h2, 1 + (j % 2), 2); } g.globalAlpha = 1; }
  void F; void i;
}
