// fair_world.js - THE HARVEST FAIR's set dressing (claude/fair2, L2): the haystacks, the carousel, the lamps that gutter, the maypole green with its bonfire, the crowd
// that fills the background as the light goes. Pure drawing: src/main.js drawFair calls these each frame with the 2d context and the camera; every sprite is baked once
// here from px.js primitives (the palette of the village kit, so it sits with Waymeet's stalls). No state of its own: the game hands it `time` and the level's marks.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, mulberry } from '../px.js';
import { OUT } from '../art.js';

const TS = 16;
const S = { hay: '#dcb44e', hayL: '#f4d878', hayD: '#a8802c', hayDD: '#7a5a1c', twine: '#5a3a20', wood: '#7a5230', woodL: '#a67a48', woodD: '#4e321a', brass: '#e8c23a', brassD: '#a87a18',
  red: '#b8382c', redD: '#7a2418', cream: '#ece0c4', creamD: '#c8b890', gold: '#f0c840', ink: '#120e14' };
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };

// ---------------- THE HAYSTACK: a round rick two rows high over its spring cap, with twine bands and a pitchfork ----------------
export function hayRick(tiles) {
  return once('hay' + tiles, () => {
    const w = tiles * TS + 4, h = 2 * TS + 2, [c, g] = canvas(w, h), r = mulberry(tiles * 977 + 5);
    const dome = (x) => { const t = (x - w / 2) / (w / 2); return Math.round(4 + 6 * t * t * t * t + 4 * t * t); };       // the top edge: nearly flat, rounded at the shoulders
    for (let x = 0; x < w; x++) { const top = dome(x); for (let y = top; y < h; y++) px(g, x, y, S.hay); }
    for (let i = 0; i < w * 3; i++) { const x = (r() * w) | 0, top = dome(x), y = top + ((r() * (h - top)) | 0), len = 2 + ((r() * 4) | 0), k = r();
      for (let j = 0; j < len; j++) { const xx = x + j, yy = y - (j >> 1); if (xx < w && yy >= dome(xx)) px(g, xx, yy, k < 0.4 ? S.hayL : k < 0.75 ? S.hayD : S.hayDD); } }
    for (let x = 0; x < w; x++) { px(g, x, dome(x), S.hayL); if (x % 3 === 0) px(g, x, dome(x) - 1, S.hayL); }                     // the fuzz on the crown
    for (const bx of [Math.round(w * 0.3), Math.round(w * 0.7)]) { for (let y = dome(bx) + 1; y < h; y++) { px(g, bx, y, S.twine); if (y % 4 === 0) px(g, bx + 1, y, S.twine); } px(g, bx - 1, dome(bx) + 2, S.twine); px(g, bx + 1, dome(bx) + 3, S.twine); }
    for (let y = h - 4; y < h; y++) for (let x = 0; x < w; x++) if (r() < 0.55) px(g, x, y, S.hayD);
    if (tiles >= 3) { const fx = Math.round(w * 0.5); line(g, fx, dome(fx) - 9, fx + 5, h - 6, S.wood); line(g, fx + 1, dome(fx) - 9, fx + 6, h - 6, S.woodL); rect(g, fx - 2, dome(fx) - 11, 6, 1, '#8a919c'); for (const dx of [-2, 0, 3]) rect(g, fx + dx, dome(fx) - 13, 1, 3, '#8a919c'); }   // a pitchfork left standing in it
    outline(c, OUT); return c; });
}
export function drawHay(g, cx, cy, z, sq) {
  const x0 = z[0] * TS, x1 = (z[1] + 1) * TS, y = z[2] * TS, s = hayRick(z[1] - z[0] + 1), k = sq || 0;
  g.drawImage(s, Math.round(x0 - 2 - cx), Math.round(y - 3 - cy + k * 3), s.width, s.height - Math.round(k * 3));
}

// ---------------- THE LAMPS: a post and a hanging lantern; steady, guttering (it stutters) or out (dark glass, a thread of smoke) ----------------
const LAMP = () => once('lamp', () => { const [c, g] = canvas(14, 44);
  rect(g, 6, 12, 3, 32, S.woodD); rect(g, 6, 12, 1, 32, S.wood); rect(g, 4, 41, 7, 3, S.woodD); rect(g, 3, 43, 9, 1, S.wood);
  rect(g, 6, 8, 8, 2, S.woodD); line(g, 7, 14, 12, 9, S.woodD); rect(g, 10, 10, 1, 2, '#3a3a44'); rect(g, 9, 9, 3, 1, '#3a3a44');
  outline(c, OUT); return c; });
const LANTERN = (lit) => once('lantern' + lit, () => { const [c, g] = canvas(9, 12);
  rect(g, 1, 1, 7, 1, '#3a3a44'); rect(g, 2, 0, 5, 1, '#3a3a44'); rect(g, 1, 2, 7, 8, lit ? '#ffcf70' : '#4a4658'); rect(g, 1, 10, 7, 1, '#3a3a44');
  rect(g, 1, 2, 1, 8, '#3a3a44'); rect(g, 7, 2, 1, 8, '#3a3a44'); rect(g, 4, 2, 1, 8, lit ? '#e8a640' : '#3a3648');
  if (lit) { rect(g, 3, 4, 3, 5, '#fff2b0'); px(g, 4, 3, '#ff9a3c'); } else { px(g, 3, 7, '#6a6478'); }
  outline(c, OUT); return c; });
/* the state a lamp is in this frame: steady lit, guttering (on/off by two beating sines, so it stutters), or out. Returns 0..1 brightness */
export function lampBright(l, time) {
  if (l.life >= 1) return 1; if (l.life <= 0) return 0;
  const a = Math.sin(time * 9.3 + l.x) + Math.sin(time * 5.1 + l.x * 2.3) * 0.8, k = a > 0.35 ? 1 : a > -0.25 ? 0.4 : 0.06;
  return k; }
export function drawLamps(g, cx, cy, VW, lamps, time, glowOnly) {
  for (const l of lamps) { const x = l.x * TS + 8, y = (l.y + 1) * TS; if (x < cx - 40 || x > cx + VW + 40) continue;
    const b = l.b === undefined ? lampBright(l, time) : l.b, sx = Math.round(x - 7 - cx), sy = Math.round(y - 44 - cy);
    if (!glowOnly) { g.drawImage(LAMP(), sx, sy); g.drawImage(LANTERN(b > 0.3), sx + 8, sy + 8);
      if (l.life <= 0) { for (let i = 0; i < 6; i++) { const t = (time * 0.5 + i / 6) % 1; g.globalAlpha = 0.28 * (1 - t); g.fillStyle = '#9a96a8'; g.fillRect(Math.round(sx + 12 + Math.sin(time + i) * 2 * t), Math.round(sy + 6 - t * 14), 1, 1); } g.globalAlpha = 1; } }
    else if (b > 0.05) { const lx = sx + 12, ly = sy + 14, r = 22 + b * 18, gr = g.createRadialGradient(lx, ly, 1, lx, ly, r);
      gr.addColorStop(0, 'rgba(255,190,90,' + (0.42 * b) + ')'); gr.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = gr; g.fillRect(lx - r, ly - r, r * 2, r * 2); } } }

// ---------------- THE CAROUSEL: painted horses on brass poles going round under a scalloped, striped canopy ----------------
export const HORSE = (v) => once('chorse' + v, () => { const [c, g] = canvas(24, 22), P = [['#efe6d0', '#c8b890', '#8a3a3a'], ['#c8d4e0', '#8a9ab0', '#3a5a8a'], ['#e8c878', '#b08838', '#8a2a2a'], ['#d8c4d8', '#a488a4', '#4a3a6a']][v % 4], [b, s, m] = P;
  fillPoly(g, [[5, 10], [17, 9], [19, 15], [16, 16], [6, 16]], b); rect(g, 6, 15, 2, 6, b); rect(g, 8, 15, 2, 5, s); rect(g, 14, 15, 2, 6, b); rect(g, 16, 15, 2, 5, s);          // body, legs
  fillPoly(g, [[16, 10], [18, 3], [22, 4], [23, 9], [21, 10], [19, 8]], b); px(g, 20, 5, S.ink); px(g, 23, 8, s); px(g, 18, 2, b); px(g, 17, 2, s);                                 // neck and head
  line(g, 17, 3, 12, 7, m, 2); line(g, 4, 10, 1, 15, m, 1); rect(g, 8, 8, 6, 2, S.gold); rect(g, 8, 9, 6, 1, S.brassD);                                                              // mane, tail, saddle
  px(g, 19, 6, S.gold); px(g, 21, 6, S.gold); outline(c, OUT); return c; });
export function drawCarousel(g, cx, cy, VW, z, time, warn, riding) {
  const x0 = z.x0 * TS, x1 = (z.x1 + 1) * TS, top = z.row * TS, w = x1 - x0; if (x1 < cx - 16 || x0 > cx + VW + 16) return;
  const roofY = top - 7 * TS, mid = (x0 + x1) / 2, spin = warn ? 3.2 : 1;
  // the deck's painted skirt over the tile course: cream and red panels, gold rim, a bulb between each
  const dx = Math.round(x0 - cx), dy = Math.round(top - cy);
  g.fillStyle = '#4e321a'; g.fillRect(dx, dy, w, 3); g.fillStyle = '#a67a48'; g.fillRect(dx, dy, w, 1); g.fillStyle = S.gold; g.fillRect(dx, dy + 3, w, 1);
  for (let i = 0; i < Math.floor(w / 10); i++) { const px0 = dx + i * 10; g.fillStyle = i % 2 ? S.cream : S.red; g.fillRect(px0, dy + 4, 10, 24); g.fillStyle = i % 2 ? S.creamD : S.redD; g.fillRect(px0, dy + 4, 1, 24); g.fillRect(px0 + 3, dy + 12, 4, 8);
    g.fillStyle = S.gold; g.fillRect(px0 + 4, dy + 14, 2, 4); }
  g.fillStyle = '#4e321a'; g.fillRect(dx, dy + 28, w, 4);
  const back = [], front = [], n = Math.max(4, Math.floor(w / 26));
  for (let i = 0; i < n; i++) { const a = time * 0.9 * spin + i * Math.PI * 2 / n, hx = mid + Math.cos(a) * (w / 2 - 22), zf = Math.sin(a), bob = Math.sin(time * 2.6 * spin + i * 1.9) * 3;
    (zf > 0 ? front : back).push({ x: hx, z: zf, dir: -Math.sin(a) > 0 ? 1 : -1, bob, v: i }); }
  const poles = [x0 + 6, x1 - 8, Math.round(mid) - 1];
  const paint = (list, dim) => { for (const h of list) { const hs = HORSE(h.v), hy = Math.round(top - 26 + h.bob - (dim ? 3 : 0) - cy), hxp = Math.round(h.x - cx), py0 = Math.round(roofY + 8 - cy);
      g.save(); if (dim) g.globalAlpha = 0.55; g.fillStyle = S.brass; g.fillRect(hxp - 1, py0, 2, hy + 12 - py0);   // its brass pole from the canopy
      if (h.dir < 0) { g.translate(hxp, 0); g.scale(-1, 1); g.drawImage(hs, -12, hy, 24, 22); } else g.drawImage(hs, hxp - 12, hy, 24, 22); g.restore(); } };
  // the centre column and its painted panels (behind the front horses)
  g.fillStyle = '#4e321a'; g.fillRect(Math.round(mid) - 5 - cx, Math.round(roofY + 6 - cy), 10, top - roofY - 6); g.fillStyle = '#7a5230'; g.fillRect(Math.round(mid) - 5 - cx, Math.round(roofY + 6 - cy), 2, top - roofY - 6);
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? S.red : S.cream; g.fillRect(Math.round(mid) - 3 - cx, Math.round(roofY + 12 + i * 22 - cy), 6, 16); g.fillStyle = S.gold; g.fillRect(Math.round(mid) - 1 - cx, Math.round(roofY + 16 + i * 22 - cy), 2, 8); }
  paint(back, true);
  for (const px0 of poles) { g.fillStyle = S.brassD; g.fillRect(Math.round(px0 - cx), Math.round(roofY + 4 - cy), 3, top - roofY - 4); g.fillStyle = S.brass; g.fillRect(Math.round(px0 - cx), Math.round(roofY + 4 - cy), 1, top - roofY - 4); }
  paint(front, false);
  // the canopy: red and cream stripes, a scalloped valance, pennants, a flag on top
  const stripes = Math.floor(w / 8);
  for (let i = 0; i < stripes; i++) { const sx = Math.round(x0 + i * 8 - cx); g.fillStyle = i % 2 ? S.cream : S.red; g.fillRect(sx, Math.round(roofY - 6 - cy), 8, 9); g.fillStyle = i % 2 ? S.creamD : S.redD; g.fillRect(sx, Math.round(roofY - 6 - cy), 1, 9);
    g.fillStyle = i % 2 ? S.cream : S.red; g.fillRect(sx + 1, Math.round(roofY + 3 - cy), 6, 3); g.fillRect(sx + 2, Math.round(roofY + 6 - cy), 4, 1); }
  g.fillStyle = S.gold; g.fillRect(Math.round(x0 - cx), Math.round(roofY - 7 - cy), w, 2);
  for (let i = 0; i < stripes; i += 2) { const sx = Math.round(x0 + i * 8 - cx); g.fillStyle = S.red; g.fillRect(sx + 3, Math.round(roofY - 16 - cy), 2, 10); g.fillStyle = i % 4 ? '#3a7ab8' : S.gold; g.beginPath(); g.moveTo(sx + 5, Math.round(roofY - 16 - cy)); g.lineTo(sx + 12, Math.round(roofY - 13 - cy)); g.lineTo(sx + 5, Math.round(roofY - 10 - cy)); g.fill(); }
  g.fillStyle = S.brassD; g.fillRect(Math.round(mid - cx) - 1, Math.round(roofY - 26 - cy), 2, 20); g.fillStyle = S.gold; g.beginPath(); g.moveTo(Math.round(mid - cx) + 1, Math.round(roofY - 26 - cy)); g.lineTo(Math.round(mid - cx) + 11, Math.round(roofY - 22 - cy + Math.sin(time * 4) * 1.5)); g.lineTo(Math.round(mid - cx) + 1, Math.round(roofY - 18 - cy)); g.fill();
  // the bulbs under the canopy: gold and steady, some dead; every one red and beating when it is about to turn you
  for (let i = 0; i < stripes; i++) { const on = warn ? Math.floor(time * 8) % 2 === i % 2 : ((i * 7 + 3) % 11 !== 0 && Math.floor(time * 2 + i) % 4 !== 0); g.fillStyle = on ? (warn ? '#ff5a4a' : '#ffd36b') : '#5a4a32'; g.fillRect(Math.round(x0 + i * 8 + 3 - cx), Math.round(roofY + 8 - cy), 2, 2); }
  if (warn) { g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(mid - cx, roofY + 8 - cy, 4, mid - cx, roofY + 8 - cy, w * 0.6); gr.addColorStop(0, 'rgba(255,60,40,0.28)'); gr.addColorStop(1, 'rgba(255,60,40,0)'); g.fillStyle = gr; g.fillRect(x0 - cx, roofY - 30 - cy, w, 130); g.globalCompositeOperation = 'source-over'; }
}

// ---------------- THE MAYPOLE GREEN: the pole, its ribbons and wreath, the ring of trampled flowers, the bonfire, the wicker arch over the door ----------------
const RIB = ['#b8382c', '#e8c23a', '#3a7ab8', '#8fd160', '#c9a0ff', '#ff9a5c', '#f4ead0', '#d0508a'];
export function drawGreen(g, cx, cy, VW, G, time, dusk) {
  const gy = G.floor * TS, mx = G.maypole * TS + 8, fx = G.bonfire * TS + 8;
  // the arch of the door: bent wicker and marigolds over the gap (the boss's own colours, waiting)
  const ax = G.door * TS - cx;
  if (ax > -60 && ax < VW + 60) { g.fillStyle = '#6a4a22'; g.fillRect(Math.round(ax) - 2, Math.round(gy - 6 * TS - cy), 6, 3 * TS + 10); g.fillRect(Math.round(ax + 2 * TS) - 4, Math.round(gy - 6 * TS - cy), 6, 3 * TS + 10);
    for (let i = 0; i < 16; i++) { const t = i / 15, x = ax - 2 + t * (2 * TS + 4), y = gy - 6 * TS - cy - Math.sin(t * Math.PI) * 10; g.fillStyle = i % 2 ? '#b89050' : '#8a6a34'; g.fillRect(Math.round(x), Math.round(y), 3, 5); g.fillStyle = i % 3 ? '#f0a020' : '#c23a30'; g.fillRect(Math.round(x), Math.round(y - 2), 2, 2); } }
  // the ring of trampled flowers and straw round the pole
  if (!G.carousel && mx > cx - 90 && mx < cx + VW + 90) { const r = mulberry(4242);   /* (on THE WICKER QUEEN's carousel the column and the firebox are src/redraw/carousel_ring.js's) */
    for (let i = 0; i < 46; i++) { const a = r() * Math.PI * 2, d = 20 + r() * 26, x = mx + Math.cos(a) * d * 1.4, y = gy - 1 - Math.abs(Math.sin(a)) * 2 - r() * 2; g.fillStyle = r() < 0.5 ? RIB[(r() * 8) | 0] : '#c9a03a'; g.fillRect(Math.round(x - cx), Math.round(y - cy), r() < 0.3 ? 2 : 1, 1); }
    // the pole, banded with ribbon
    const top = gy - 10 * TS, sway = Math.sin(time * 0.7) * 1.5;
    g.fillStyle = '#5a3a1e'; g.fillRect(Math.round(mx - 3 - cx), Math.round(top - cy), 6, gy - top); g.fillStyle = '#8a6030'; g.fillRect(Math.round(mx - 3 - cx), Math.round(top - cy), 2, gy - top);
    for (let y = top + 6; y < gy - 8; y += 4) { g.fillStyle = RIB[((y - top) >> 2) % 8]; g.fillRect(Math.round(mx - 3 - cx), Math.round(y - cy), 6, 2); g.fillRect(Math.round(mx - 3 + ((y - top) % 8) / 2 - cx), Math.round(y + 2 - cy), 3, 1); }
    // the wreath and its crown of flowers on top, the ribbons out to the ground
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, x = mx + Math.cos(a) * 12, y = top + 4 + Math.sin(a) * 4; g.fillStyle = i % 2 ? '#3a6a2c' : '#4a8a3a'; g.fillRect(Math.round(x - cx) - 1, Math.round(y - cy) - 1, 3, 3); g.fillStyle = RIB[i % 8]; g.fillRect(Math.round(x - cx), Math.round(y - cy) - 1, 1, 1); }
    g.fillStyle = '#e8c23a'; g.fillRect(Math.round(mx - cx) - 1, Math.round(top - 5 - cy), 3, 5); g.fillStyle = '#b8382c'; g.fillRect(Math.round(mx - cx) - 3, Math.round(top - 2 - cy), 7, 2);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.4, ex = mx + Math.cos(a) * (34 + (i % 3) * 6), ey = gy - 4 - (i % 2) * 3; g.strokeStyle = RIB[i]; g.lineWidth = 1; g.beginPath();
      g.moveTo(Math.round(mx - cx + Math.cos(a) * 10), Math.round(top + 4 + Math.sin(a) * 4 - cy)); g.quadraticCurveTo(Math.round(mx - cx + Math.cos(a) * 24 + sway), Math.round((top + gy) / 2 - cy + Math.sin(time + i) * 2), Math.round(ex - cx), Math.round(ey - cy)); g.stroke(); } }
  // the bonfire: a pyre of logs, tongues of flame, a great warm bloom (the only light on the green now the lamps are out)
  if (!G.carousel && fx > cx - 90 && fx < cx + VW + 90) { const x = Math.round(fx - cx), y = Math.round(gy - cy);
    for (let i = 0; i < 7; i++) { const a = -0.6 + i * 0.2; g.save(); g.translate(x, y - 3); g.rotate(a * (i % 2 ? 1 : -1)); g.fillStyle = i % 2 ? '#4a3020' : '#5e3e24'; g.fillRect(-18, -2 - (i % 3), 36, 5); g.fillStyle = '#7a5230'; g.fillRect(-18, -2 - (i % 3), 36, 1); g.restore(); }
    for (let k = 0; k < 4; k++) { const f = Math.sin(time * (7 + k * 2.1) + k) * 0.5 + 0.5, hgt = 36 + k * 9 - f * 8, wd = 13 - k * 2; const cols = ['#a01c10', '#d84a14', '#f08a28', '#ffc850'][k];
      g.fillStyle = cols; g.beginPath(); g.moveTo(x - wd, y - 6); g.quadraticCurveTo(x - wd + f * 3, y - hgt * 0.6, x + Math.sin(time * 6 + k) * 3, y - hgt - 4 + k * 3); g.quadraticCurveTo(x + wd - f * 3, y - hgt * 0.6, x + wd, y - 6); g.closePath(); g.fill(); }
    g.globalCompositeOperation = 'lighter'; const r = 74 + Math.sin(time * 9) * 5, gr = g.createRadialGradient(x, y - 14, 3, x, y - 14, r); gr.addColorStop(0, 'rgba(255,140,50,0.10)'); gr.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = gr; g.fillRect(x - r, y - 14 - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over'; } }

// ---------------- THE CROWD: figures at the edge of the light, dark against the far street, more of them the later it gets ----------------
const FIG = (v) => once('fig' + v, () => { const [c, g] = canvas(9, 22), k = '#221a30', kk = '#2e2440';
  fillPoly(g, [[2, 9], [7, 9], [8, 21], [1, 21]], k); rect(g, 3, 3, 3, 6, kk); rect(g, 2, 1, 5, 2, k); px(g, 4, 0, k); if (v & 1) { rect(g, 0, 10, 2, 8, k); rect(g, 7, 10, 2, 8, k); }
  px(g, 3, 5, '#8a7a9a'); px(g, 5, 5, '#8a7a9a'); return c; });
let FIGS = null;
export function drawCrowd(g, cx, cy, VW, L, dusk, time) {
  const W = L.W * TS, PAR = 0.6, floor = (L.green ? L.green.floor : 28) * TS;
  if (!FIGS) { const r = mulberry(1913); FIGS = Array.from({ length: 150 }, () => { const at = r() * W; return { at, vx: at * PAR + 60, k: r(), v: (r() * 4) | 0, h: (r() * 3) | 0 }; }); }
  g.globalAlpha = Math.min(0.72, 0.2 + dusk * 0.6); const gy = Math.round(floor - cy - 20);
  for (const f of FIGS) { if (f.at < 20 * TS || f.k > (f.at / (620 * TS)) * 0.95 - 0.12) continue;   // none at the gate; the further along, the more of them stand there
    const sx = Math.round(f.vx - cx * PAR); if (sx < -12 || sx > VW + 12) continue;
    g.drawImage(FIG(f.v), sx, gy + f.h * 2 - 4 + Math.round(Math.sin(time * 0.5 + f.at) * 0.4)); }
  g.globalAlpha = 1; }

// ---------------- THE MASK'S GLOW: an additive halo behind a mummer whose mask has gone red (the glow tell, so it reads in the dusk) ----------------
export function drawGlow(g, x, y, time) {
  g.globalCompositeOperation = 'lighter'; const r = 26 + Math.sin(time * 26) * 3, gr = g.createRadialGradient(x, y, 2, x, y, r);
  gr.addColorStop(0, 'rgba(255,50,30,0.75)'); gr.addColorStop(0.5, 'rgba(255,40,20,0.3)'); gr.addColorStop(1, 'rgba(255,30,10,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.globalCompositeOperation = 'source-over'; }

