// src/redraw/wispwood_art.js - WISPWOOD's art (claude/wispart, the SONNET ART PASS over claude/wispwood's greybox; WISPWOOD_SHIPS stays false).
// A dead wood over the barrows at night: bleached ash-pale bark, black peat, a black mere, mist, and two kinds of light - GOLD is your living flame (the lantern you carry, what a thief steals),
// COLD CYAN is the wood's own ghost light (candles, hanging lamps, waystones, the pale spans that are real only inside a glow). No planks, no logs, no leaves, no goblins: the trunks are standing
// dead oaks cut off at the crown, the boughs are gnarled dead branches, the bridges are woven pale roots.
//   TILES     wispTile(t, x, y, at, T, L): the peat bank (a bleached moss lip, bone-white pebbles, root fringe over the mere), the barrow stone the Caverns climb out of, the dead oaks' trunks
//             (bark grain, knots, a sawn crown), real dead BOUGHS (one-way), the drowned ROOTS of the root walk, and the SPECTRAL cells (a transparent tile: they are drawn live, lit or glint).
//   BACKDROP  drawBackdrop: three parallax layers of bare pale oaks (baked sprites), drifting mist, wisp lights; drawMere: THE BLACK MERE (ripples, mist, snags, eyes under the surface).
//   LIGHT     drawSpectral: a lit pale span (a bridge of woven roots, a gnarled branch, a rung) or its GLINT; drawCandle, drawLamp, drawStone, drawHeroLantern, drawWisp.
//   HANDS     drawPool (the dark ground), drawHandTell (a ripple + the yellow mark where it will lunge), drawHand (rising / lunging / sinking), drawThief (every mode), drawTether.
//   EXIT      drawExitHole: the root-hole under the glade, webbed shut until the Widow falls (the first webs of the Silk Undercroft).
// Rect-based (px.js primitives only: it runs in tools/node-canvas.mjs and tools/wisp-art-sheet.mjs). Baked once and memoised where it is a sprite. Axis-aligned only (no paths).
import { canvas, px, rect, line, circle, ellipse } from '../px.js';

export const WA = {
  gold: '#ffe9a0', goldHi: '#fffbe8', goldLo: '#c8923a', ember: '#ff9a5c', cyan: '#bfe6ff', cyanHi: '#eaffff', cyanMid: '#8ec4e6', cyanLo: '#5a8ab0', cyanDk: '#2a4a6a',
  bark: '#8a929c', barkHi: '#c4cad0', barkLo: '#6e747c', barkDk: '#3a4048', cream: '#d8d0b8', ring: '#a89a78',
  peat: ['#2c303a', '#323644', '#282c36', '#363a48'], peatLo: '#1c2028', root: '#8a929c', moss: '#6a7a84', mossHi: '#c4ccd0', mossLo: '#4a5660',
  hand: '#140a22', handHi: '#4a3a7a', handLo: '#7a62b0', water: '#05070c', iron: '#3a3e48', ironHi: '#7a808c', stone: '#6a727c',
};
const memo = new Map(); const once = (k, fn) => { if (!memo.has(k)) memo.set(k, fn()); return memo.get(k); };
const hash = (a, b) => { let h = (Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return h; };
const R = Math.round;
const al = (hexc, k) => { const h = hexc.slice(1); return 'rgba(' + parseInt(h.slice(0, 2), 16) + ',' + parseInt(h.slice(2, 4), 16) + ',' + parseInt(h.slice(4, 6), 16) + ',' + k.toFixed(2) + ')'; };
const thick = (g, x0, y0, x1, y1, c, w) => { const steep = Math.abs(y1 - y0) > Math.abs(x1 - x0); for (let k = 0; k < w; k++) { const o = k - (w >> 1); if (steep) line(g, x0 + o, y0, x1 + o, y1, c); else line(g, x0, y0 + o, x1, y1 + o, c); } };
const glow = (g, x, y, r, col, a) => { circle(g, x, y, r, al(col, a)); circle(g, x, y, r * 0.55, al(col, a * 0.9)); };

/* ================================ THE LEVEL'S LOOKUPS ================================ */
const INFO = new WeakMap();
function info(L) {
  let m = INFO.get(L);
  if (!m) { const spec = new Set(); for (const s of (L.ww && L.ww.spans) || []) for (let x = s.x0; x <= s.x1; x++) spec.add(s.y * L.W + x);
    m = { spec, trunks: (L.ww && L.ww.trunks) || [] }; INFO.set(L, m); }
  return m;
}
const trunkAt = (m, x, y) => m.trunks.find(t => x >= t.x0 && x <= t.x1 && y >= t.top && y <= (t.bot === undefined ? 999 : t.bot)) || null;

/* ================================ TILES (16 x 16) ================================ */
function peat(g, wx, wy) {
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
    const gx = wx + xx, gy = wy + yy; let c = WA.peat[hash(gx >> 1, gy >> 1) & 3], h = hash(gx, gy);
    if (h % 41 === 0) c = '#5a626c'; else if (h % 19 === 0) c = WA.peatLo; else if (h % 97 === 0) c = '#8a929c';
    px(g, xx, yy, c);
  }
  for (let k = 0; k < 2; k++) { const h = hash(wx + k * 7, wy + 3); if (h % 4 === 0) { const sx = h % 12, sy = 4 + (h >>> 4) % 9; rect(g, sx, sy, 3, 1, WA.root); px(g, sx + 3, sy + 1, WA.root); px(g, sx + 1, sy - 1, '#5a626c'); } }   /* a pale root thread through the peat */
}
export function groundTile(x, y, o) {
  const key = ['g', x % 5, y % 4, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.dn ? 'D' : '', o.deep ? 'P' : '', o.wet ? 'W' : ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16); peat(g, x * 16, y * 16);
    if (o.wet) rect(g, 0, 0, 16, 16, 'rgba(6,16,22,0.34)');   /* the mere's banks are sodden */
    if (o.deep) rect(g, 0, 0, 16, 16, 'rgba(4,6,12,0.30)');
    if (o.aL) { rect(g, 0, 0, 1, 16, '#7a8a94'); rect(g, 1, 0, 1, 16, '#4a5660'); }
    if (o.aR) { rect(g, 15, 0, 1, 16, '#10141a'); rect(g, 14, 0, 1, 16, '#1c2028'); }
    if (o.up) {   /* a bleached moss lip, dead grass in tufts */
      for (let xx = 0; xx < 16; xx++) { const h = hash(x * 16 + xx, y); rect(g, xx, 0, 1, 1, h % 3 === 0 ? WA.mossHi : '#a8b4bc'); rect(g, xx, 1, 1, 1, WA.moss); rect(g, xx, 2, 1, 1, h % 5 === 0 ? '#5a6a74' : WA.mossLo); if (h % 7 === 0) px(g, xx, 3, WA.mossLo); }
      for (let xx = 2; xx < 16; xx += 5) if (hash(x * 16 + xx, y + 11) % 3 === 0) { px(g, xx, 0, '#dce4e8'); px(g, xx + 1, 0, '#8a98a0'); } }
    if (o.dn) {   /* the root fringe: pale threads hanging under a bank that overhangs the water */
      rect(g, 0, 13, 16, 3, '#1a1e26'); for (let xx = 0; xx < 16; xx++) { const h = hash(x * 16 + xx, y + 5); if (h % 3 === 0) { const l = 1 + h % 3; rect(g, xx, 13, 1, 2 + l - 1, h % 2 ? '#6a7480' : '#8a929c'); } } }
    return c; });
}
/* the barrow's own stone (the hill you climb out of): cold grey blocks, moss in the joints, the Caverns' hand */
export function barrowTile(x, y, o) {
  return once(['b', x % 4, y % 3, o.up ? 'U' : '', o.aR ? 'R' : ''].join(''), () => { const [c, g] = canvas(16, 16), wx = x * 16, wy = y * 16;
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) { const gx = wx + xx, gy = wy + yy, row = (gy / 8) | 0, off = (row & 1) * 6, cx = ((gx + off) % 12 + 12) % 12;
      let col = ['#4a4e58', '#50545e', '#464a54', '#565a64'][hash(gx >> 2, gy >> 1) & 3];
      if (gy % 8 === 0 || cx === 0) col = '#1c2028'; else if (gy % 8 === 1) col = '#3a3e48'; else if (hash(gx, gy) % 21 === 0) col = '#7a808a'; else if (hash(gx + 3, gy) % 13 === 0) col = '#3a5a50';
      px(g, xx, yy, col); }
    if (o.up) { rect(g, 0, 0, 16, 1, WA.mossHi); rect(g, 0, 1, 16, 2, '#5a6a74'); rect(g, 0, 3, 16, 1, '#1c2028'); }
    if (o.aR) { rect(g, 15, 0, 1, 16, '#10141a'); }
    return c; });
}
/* A DEAD OAK'S TRUNK (a standing stump: bark grain, knots; its crown is sawn flat and shows the rings) */
export function trunkTile(x, y, o) {
  const key = ['t', x % 6, y % 5, o.up ? 'U' : '', o.aL ? 'L' : '', o.aR ? 'R' : '', o.dn ? 'D' : '', o.deep ? 'P' : ''].join('');
  return once(key, () => { const [c, g] = canvas(16, 16), wx = x * 16;
    for (let xx = 0; xx < 16; xx++) { const gx = wx + xx, h = hash(gx >> 1, 3), tone = [WA.bark, '#949ca6', '#7e8690', '#a0a8b0'][h & 3]; rect(g, xx, 0, 1, 16, tone);
      if (hash(gx, 9) % 6 === 0) { const y0 = hash(gx, y) % 8; rect(g, xx, y0, 1, 5 + hash(gx, y + 1) % 6, WA.barkLo); } }
    if (hash(x, y) % 11 === 0) { const kx = 4 + hash(x, y + 2) % 7, ky = 3 + hash(x + 1, y) % 8; ellipse(g, kx, ky, 3, 4, WA.barkDk); ellipse(g, kx, ky, 2, 3, '#1e2228'); rect(g, kx - 3, ky - 4, 5, 1, WA.barkHi); }
    if (o.aL) { rect(g, 0, 0, 2, 16, WA.barkHi); rect(g, 2, 0, 1, 16, '#c8ced2'); }
    if (o.aR) { rect(g, 14, 0, 2, 16, WA.barkDk); rect(g, 13, 0, 1, 16, WA.barkLo); }
    if (o.dn) { rect(g, 0, 14, 16, 2, WA.barkDk); }
    if (o.up) { rect(g, 0, 0, 16, 4, WA.cream); rect(g, 0, 3, 16, 1, WA.ring); for (let r = 0; r < 3; r++) rect(g, 2 + r * 2, 1 + (r & 1), 12 - r * 4, 1, WA.ring); rect(g, 0, 4, 16, 1, WA.barkLo); }   /* the sawn crown, its rings */
    if (o.deep) { rect(g, 0, 0, 16, 16, 'rgba(6,18,20,0.5)'); for (let i = 0; i < 5; i++) px(g, hash(x, y + i) % 16, hash(y, x + i) % 16, '#3a6a58'); }   /* slimed, under the water line */
    return c; });
}
/* A REAL DEAD BOUGH (one-way): a gnarled pale branch, twigs, hanging lichen; its ends taper */
export function boughTile(x, y, aL, aR) {
  return once(['bo', x % 5, aL ? 'L' : '', aR ? 'R' : ''].join(''), () => { const [c, g] = canvas(16, 16), s = x % 5;
    const x0 = aL ? 3 : 0, x1 = aR ? 13 : 16;
    rect(g, x0, 0, x1 - x0, 2, '#c8ced4'); rect(g, x0, 0, x1 - x0, 1, WA.barkHi); rect(g, x0, 2, x1 - x0, 3, '#8e969e'); rect(g, x0, 5, x1 - x0, 1, WA.barkLo); rect(g, x0 + 1, 6, x1 - x0 - 2, 1, WA.barkDk);
    for (let xx = x0; xx < x1; xx++) { const h = hash(xx + s * 13, y); if (h % 5 === 0) px(g, xx, 3, WA.barkLo); if (h % 11 === 0) px(g, xx, 1, '#a4aab2'); }
    if (aL) { px(g, 2, 1, '#8e969e'); px(g, 1, 0, '#8e969e'); px(g, 2, 3, '#6e747c'); px(g, 1, 4, '#6e747c'); }
    if (aR) { px(g, 13, 1, '#8e969e'); px(g, 14, 0, '#8e969e'); px(g, 13, 3, '#6e747c'); px(g, 14, 5, '#6e747c'); px(g, 15, 6, '#6e747c'); }
    for (let xx = x0 + 1; xx < x1 - 1; xx += 4) { const h = hash(xx + s, y + 4); if (h % 3 === 0) { const l = 3 + h % 5; rect(g, xx, 7, 1, l, h % 2 ? '#6a7a80' : '#7a8a90'); px(g, xx, 7 + l, '#4a5a60'); } }   /* hanging lichen */
    return c; });
}
/* THE DROWNED ROOTS (the root walk, the root-shelf): wet black-brown rope, slime, pale knots, rootlets dripping */
export function rootTile(x, y, aL, aR) {
  return once(['rt', x % 6, y, aL ? 'L' : '', aR ? 'R' : ''].join(''), () => { const [c, g] = canvas(16, 16), x0 = aL ? 2 : 0, x1 = aR ? 14 : 16;
    for (let xx = x0; xx < x1; xx++) { const w = 4 + ((hash(xx + x * 16 >> 2, y) & 1) ? 1 : 0), off = (hash(xx + x * 16 >> 3, y + 2) & 1);
      rect(g, xx, off, 1, w, (xx + off) % 4 < 2 ? '#3c3a44' : '#34323c'); px(g, xx, off, '#6a6870'); px(g, xx, off + w - 1, '#1e1c24'); if (hash(xx + x * 16, y) % 9 === 0) px(g, xx, off + 1, '#4a6a5c'); }
    for (let xx = x0 + 1; xx < x1 - 1; xx += 3) { const h = hash(xx + x * 16, y + 8); if (h % 2 === 0) { const l = 3 + h % 7; rect(g, xx, 5, 1, l, '#2c2a34'); px(g, xx, 5 + l, '#4a6a5c'); } }
    if (hash(x, y) % 3 === 0) { rect(g, 5, 1, 3, 2, '#8a929c'); px(g, 6, 0, '#a0a8b0'); }
    return c; });
}
const CLEAR = () => once('clear', () => canvas(16, 16)[0]);
/* main.js asks for a tile of every SOLID / ONEWAY cell of the wood (null = the stock ground) */
export function wispTile(t, x, y, at, T, L) {
  if (!L || !L.wispwood || !L.ww) return null;
  const m = info(L), i = y * L.W + x;
  if (t === T.ONEWAY) {
    if (m.spec.has(i)) return CLEAR();   /* a spectral cell is drawn live (drawSpectral): lit or its glint */
    const aL = at(x - 1, y) !== T.ONEWAY, aR = at(x + 1, y) !== T.ONEWAY;
    return y === 30 || y === 35 ? rootTile(x, y, aL, aR) : boughTile(x, y, aL, aR);
  }
  if (t !== T.SOLID) return null;
  const up = at(x, y - 1) !== T.SOLID, dn = at(x, y + 1) !== T.SOLID, aL = at(x - 1, y) !== T.SOLID, aR = at(x + 1, y) !== T.SOLID;
  const tr = trunkAt(m, x, y);
  if (tr) return trunkTile(x, y, { up, dn, aL, aR, deep: y >= 36 });
  if (x <= 6 && y <= 31 && y >= 20) return barrowTile(x, y, { up, aR });
  const deep = !up && !aL && !aR && !dn && at(x, y - 2) === T.SOLID && at(x, y - 3) === T.SOLID && y > 4;
  return groundTile(x, y, { up, dn, aL, aR, deep, wet: y >= 33 });
}

/* ================================ THE BACKDROP ================================ */
/* a bare pale oak, baked: the trunk forks, the crown is a net of dead branches (80 x 200, trunk base bottom-centre) */
function bakeTree(v) {
  return once('tree' + v, () => { const [c, g] = canvas(96, 210), col = '#a8b6c6', col2 = '#8a98aa';
    const br = (x, y, ang, len, w, d, seed) => { if (d > 4 || len < 4) return; const nx = x + Math.cos(ang) * len, ny = y + Math.sin(ang) * len; thick(g, x, y, nx, ny, d > 2 ? col2 : col, w);
      const n = d < 2 ? 2 : (hash(seed, d) % 2 ? 2 : 1); for (let k = 0; k < n; k++) { const da = (k - (n - 1) / 2) * (0.7 + (hash(seed + k, d) % 5) * 0.12) + ((hash(seed, d + k) % 7) - 3) * 0.05; br(nx, ny, ang + da, len * (0.66 + (hash(seed + 3, k) % 3) * 0.05), Math.max(1, w - 1), d + 1, seed * 3 + k + 1); } };
    const tw = 8 + (v % 3) * 2, bx = 48, by = 208, top = 96 + (v * 13) % 30;
    rect(g, bx - (tw >> 1), top, tw, by - top, col); rect(g, bx - (tw >> 1) - 2, by - 14, tw + 4, 14, col); rect(g, bx - (tw >> 1) - 5, by - 5, tw + 10, 5, col);
    rect(g, bx - (tw >> 1), top, 2, by - top, '#c8d4e0');
    br(bx, top + 4, -1.9 + (v % 2) * 0.1, 46 + v * 3, 4, 0, v * 11 + 1); br(bx, top + 4, -1.25 - (v % 3) * 0.06, 44 + v * 2, 4, 0, v * 11 + 5); br(bx, top + 14, -2.7, 26, 3, 1, v * 11 + 9); br(bx, top + 14, -0.45, 26, 3, 1, v * 11 + 13);
    return c; });
}
/* THE BACK OF THE WOOD: pale oaks in three layers, mist that drifts, wisps */
export function drawBackdrop(g, cx, cy, VW, VH, time, L) {
  const layers = [{ k: 0.16, a: 0.10, step: 150, sc: 0.62, dy: 54 }, { k: 0.30, a: 0.16, step: 118, sc: 0.8, dy: 28 }, { k: 0.52, a: 0.24, step: 96, sc: 1, dy: 6 }];
  layers.forEach((ly, li) => { const n = Math.ceil(VW / ly.step) + 2, off = ((cx * ly.k) % ly.step + ly.step) % ly.step;
    for (let i = -1; i < n; i++) { const wi = i + Math.floor((cx * ly.k) / ly.step), v = (hash(wi, li + 3) % 5), spr = bakeTree(v), w = spr.width * ly.sc, h = spr.height * ly.sc;
      if (hash(wi, li + 17) % 4 === 0) continue;   /* gaps */
      const x = R(i * ly.step - off + (hash(wi, li) % 40) - 20 - w / 2), y = R(VH - h + ly.dy); g.globalAlpha = ly.a; g.drawImage(spr, x, y, R(w), R(h)); g.globalAlpha = 1; }
    for (let k = 0; k < 3; k++) { const yb = R(VH * (0.46 + li * 0.16 + k * 0.05)); for (let s = 0; s < 6; s++) { const sx = R(((s * 97 + time * (3 + li * 2) + li * 41 + k * 29 - cx * ly.k * 0.5) % (VW + 160) + VW + 160) % (VW + 160) - 80); rect(g, sx, yb, 60 + (s * 13) % 50, 3 + (k & 1) * 2, 'rgba(170,200,226,' + (0.03 + li * 0.015).toFixed(3) + ')'); } } });
  for (let i = 0; i < 7; i++) {   /* wisp lights drifting between the oaks */
    const bx = ((i * 131 + time * (4 + (i % 3)) - cx * 0.4) % (VW + 100) + VW + 100) % (VW + 100) - 50, by = VH * (0.38 + (i % 4) * 0.1) + Math.sin(time * 0.8 + i * 1.7) * 10;
    glow(g, R(bx), R(by), 6, WA.cyan, 0.05); rect(g, R(bx) - 1, R(by) - 1, 2, 2, al(WA.cyanHi, 0.55 + 0.25 * Math.sin(time * 3 + i))); }
}
/* THE BLACK MERE (sx0..sx1 on screen, top = the water line on screen): water, ripples, mist, dead snags, eyes under the surface */
export function drawMere(g, sx0, sx1, top, VW, VH, time, seed) {
  const a = Math.max(0, sx0), b = Math.min(VW, sx1); if (b <= a || top > VH) return;
  const w = b - a;
  rect(g, a, top, w, VH - top, WA.water); rect(g, a, top + 3, w, 6, '#080c14'); rect(g, a, top + 14, w, 14, '#04060a');
  rect(g, a, top, w, 1, al('#9fc4e6', 0.34 + 0.12 * Math.sin(time * 2))); rect(g, a, top + 1, w, 1, 'rgba(60,90,130,0.30)');
  for (let i = 0; i < Math.ceil(w / 22); i++) { const rx = R(a + ((i * 37 + seed * 11 + time * (5 + (i % 3) * 2)) % w)), ry = top + 3 + (i % 4) * 4; if (rx + 8 <= b) rect(g, rx, ry, 5 + (i % 3) * 2, 1, 'rgba(150,190,230,' + (0.07 + 0.05 * Math.sin(time + i)).toFixed(3) + ')'); }
  for (let i = 0; i < Math.ceil(w / 46); i++) { const mx = R(a + ((i * 53 + seed * 7 - time * 4) % w + w) % w), lw = Math.min(b - mx, 36 + (i % 3) * 10); if (lw > 0) { rect(g, mx, top - 4, lw, 2, 'rgba(170,200,226,0.07)'); rect(g, mx + 6, top - 8, Math.max(0, lw - 12), 2, 'rgba(170,200,226,0.045)'); } }   /* mist on the water */
  for (let i = 0; i < Math.ceil(w / 90); i++) { const sx = R(a + 14 + ((hash(seed, i) % Math.max(1, w - 28)))), h = 8 + hash(i, seed) % 10; if (sx > a + 3 && sx < b - 6) { rect(g, sx, top - h, 2, h + 2, '#8a96a6'); rect(g, sx - 3, top - h + 3, 3, 1, '#8a96a6'); rect(g, sx + 2, top - h + 5, 4, 1, '#8a96a6'); px(g, sx - 1, top - h + 2, '#6a7686'); rect(g, sx, top - h, 1, h, '#b4bece'); } }   /* a dead snag in the water */
  const ep = Math.sin(time * 0.6 + seed) > 0.93, ex = R(a + (hash(seed, 99) % Math.max(1, w - 12)) + 6);
  if (ep && ex < b - 4) { rect(g, ex, top + 12, 2, 1, al(WA.gold, 0.7)); rect(g, ex + 5, top + 12, 2, 1, al(WA.gold, 0.7)); }   /* something looks up */
}

/* ================================ THE LIGHT ================================ */
/* A LIT PALE SPAN, baked (kind: bridge | branch | rung; first/last of its span; parity): ghost-wood - a glowing woven root, a gnarled bough, a short rung - cold cyan, a touch translucent */
export function spectralSprite(kind, first, last, i) {
  return once(['sp', kind, first ? 1 : 0, last ? 1 : 0, i & 3].join(''), () => { const [c, g] = canvas(16, 16), x0 = first ? 2 : 0, x1 = last ? 14 : 16, s = i & 3;
    rect(g, x0, 0, x1 - x0, 2, al(WA.cyanHi, 0.95)); rect(g, x0, 2, x1 - x0, 1, al(WA.cyan, 0.9));
    if (kind === 'bridge') {   /* woven pale roots: two strands crossing */
      rect(g, x0, 3, x1 - x0, 4, al(WA.cyanMid, 0.78)); for (let xx = x0; xx < x1; xx++) { const y1 = 3 + ((xx + s * 2) % 8 < 4 ? (xx + s * 2) % 4 : 3 - (xx + s * 2) % 4); px(g, xx, y1, al(WA.cyanLo, 0.95)); px(g, xx, 6 - (y1 - 3), al(WA.cyanHi, 0.75)); }
      rect(g, x0, 7, x1 - x0, 1, al(WA.cyanLo, 0.8)); }
    else if (kind === 'rung') { rect(g, x0, 3, x1 - x0, 5, al(WA.cyanMid, 0.8)); rect(g, x0, 3, x1 - x0, 1, al(WA.cyan, 0.9)); px(g, x0 + 4 + s, 5, al(WA.cyanDk, 0.9)); px(g, x0 + 5 + s, 5, al(WA.cyanDk, 0.9)); rect(g, x0, 8, x1 - x0, 1, al(WA.cyanLo, 0.8)); }
    else { rect(g, x0, 3, x1 - x0, 3, al(WA.cyanMid, 0.78)); for (let xx = x0; xx < x1; xx++) if ((xx + s) % 5 === 0) px(g, xx, 4, al(WA.cyanDk, 0.9)); rect(g, x0, 6, x1 - x0, 1, al(WA.cyanLo, 0.8));
      for (let xx = x0 + 2; xx < x1 - 1; xx += 5) { px(g, xx, 1 - 1, al(WA.cyanHi, 0.9)); } }
    if (first) { px(g, 2, 1, al(WA.cyanHi, 0.7)); px(g, 1, 0, al(WA.cyanHi, 0.5)); px(g, 1, 4, al(WA.cyan, 0.5)); }
    if (last) { px(g, 13, 1, al(WA.cyanHi, 0.7)); px(g, 14, 0, al(WA.cyanHi, 0.5)); px(g, 14, 5, al(WA.cyan, 0.5)); px(g, 15, 7, al(WA.cyan, 0.4)); }
    for (let xx = x0 + 1; xx < x1 - 1; xx += 3) { const h = hash(xx + s * 5, kind.length * 7 + i); if (h % 2 === 0) { const l = 3 + h % 5; rect(g, xx, 8, 1, l, al(WA.cyan, 0.4)); px(g, xx, 8 + l, al(WA.cyanHi, 0.55)); } }   /* strands of light hanging under it */
    rect(g, x0, 9, x1 - x0, 3, al(WA.cyan, 0.05));
    return c; });
}
/* ITS GLINT: what the light does not touch is still there - a dotted pale outline, faint */
export function glintSprite(first, last, i) {
  return once(['gl', first ? 1 : 0, last ? 1 : 0, i & 3].join(''), () => { const [c, g] = canvas(16, 16), x0 = first ? 2 : 0, x1 = last ? 14 : 16;
    for (let xx = x0; xx < x1; xx++) { if ((xx + (i & 3)) % 3 === 0) px(g, xx, 0, '#cfeaf8'); if ((xx + (i & 3)) % 4 === 1) px(g, xx, 4, '#8ec4e6'); }
    px(g, x0, 1, '#cfeaf8'); px(g, x1 - 1, 1, '#cfeaf8'); if ((i & 3) === 2) px(g, x0 + 7, 2, '#ffffff');
    return c; });
}
/* c = a spectral cell { real, i, n, kind, x }: px, py = the cell's top-left on screen */
export function drawSpectral(g, c, sx, sy, time) {
  const kind = c.kind || 'branch', first = c.i === 0, last = c.i === (c.n || 1) - 1;
  if (c.real) { g.drawImage(spectralSprite(kind, first, last, c.x), sx, sy);
    if ((c.x * 7 + c.y) % 3 === 0) { const k = (time * 0.9 + c.x * 0.37) % 1; px(g, sx + 3 + (c.x * 5) % 9, sy + 9 + R(k * 8), al(WA.cyanHi, 0.7 * (1 - k))); } }   /* a mote of light falls from it */
  else { g.globalAlpha = 0.5 + 0.28 * Math.sin(time * 3 + c.x * 0.7); g.drawImage(glintSprite(first, last, c.x), sx, sy); g.globalAlpha = 1; }
}
/* A GRAVE CANDLE (x, y = its base): a stub of wax on a leaning grave-slab. st: 'cold' | 'lit' | 'gutter' (about to go out) */
export function drawCandle(g, x, y, st, time, k = 0) {
  rect(g, x + 1, y - 11, 5, 11, '#4a505a'); rect(g, x + 1, y - 11, 5, 1, '#8a929c'); rect(g, x + 5, y - 11, 1, 11, '#2a2e36'); px(g, x + 3, y - 8, '#2a2e36');   /* the leaning grave marker behind */
  rect(g, x - 6, y - 3, 12, 3, WA.stone); rect(g, x - 6, y - 3, 12, 1, '#9aa2ac'); rect(g, x - 6, y - 1, 12, 1, '#3a3e48'); px(g, x - 5, y - 4, '#5a6a74'); px(g, x + 4, y - 4, '#4a5a64');
  rect(g, x - 2, y - 9, 4, 6, '#e8e4d4'); rect(g, x - 2, y - 9, 1, 6, '#fffaf0'); rect(g, x + 1, y - 9, 1, 6, '#b8b4a4'); px(g, x + 1, y - 6, '#e8e4d4'); px(g, x - 1, y - 4, '#d8d4c4'); rect(g, x - 3, y - 4, 1, 2, '#e8e4d4'); px(g, x, y - 10, '#2a2a2e');
  if (st === 'cold') { const t = (time * 0.8 + k) % 1; px(g, x + R(Math.sin(t * 6) * 1.5), y - 12 - R(t * 7), al('#9aa6b4', 0.4 * (1 - t))); return; }
  const f = st === 'gutter' ? ((time * 8) % 2 < 1 ? 1 : 0) : 1, fh = 3 + (Math.sin(time * 9 + k) > 0 ? 1 : 0);
  glow(g, x, y - 14, st === 'gutter' ? 5 : 9, st === 'gutter' ? WA.ember : WA.cyan, st === 'gutter' ? 0.10 : 0.13);
  if (f) { rect(g, x - 1, y - 10 - fh, 3, fh, st === 'gutter' ? '#ff9a5c' : WA.cyan); rect(g, x, y - 10 - fh - 1, 1, 2, st === 'gutter' ? '#ffd0a0' : WA.cyanHi); rect(g, x, y - 12, 1, 2, '#ffffff'); }
}
/* A HANGING LAMP (x, y = the foot of its iron post): a crook, a chain, a glass lantern. on = lit */
export function drawLamp(g, x, y, on, time, k = 0) {
  rect(g, x - 1, y - 34, 3, 34, WA.iron); rect(g, x - 1, y - 34, 1, 34, WA.ironHi); rect(g, x - 3, y - 2, 7, 2, '#2a2e36'); px(g, x - 2, y - 14, '#5a6a64'); px(g, x + 1, y - 20, '#5a6a64'); px(g, x, y - 9, '#5a6a64');   /* lichen on the iron */
  rect(g, x - 1, y - 36, 9, 2, WA.iron); rect(g, x + 7, y - 36, 2, 4, WA.iron); px(g, x + 8, y - 32, WA.ironHi);   /* the crook */
  rect(g, x + 7, y - 32, 1, 3, '#6a6e78'); px(g, x + 7, y - 30, '#6a6e78');   /* the chain */
  const lx = x + 8, ly = y - 28, sw = on ? Math.sin(time * 2 + k) * 1 : 0;
  rect(g, lx - 4 + sw, ly - 1, 9, 2, WA.iron); rect(g, lx - 3 + sw, ly - 3, 7, 2, '#4a4e58'); px(g, lx + sw, ly - 4, WA.ironHi);
  rect(g, lx - 3 + sw, ly + 1, 7, 8, on ? al(WA.cyan, 0.9) : '#1c2028'); rect(g, lx - 3 + sw, ly + 1, 1, 8, on ? WA.cyanHi : '#3a3e48'); rect(g, lx + 3 + sw, ly + 1, 1, 8, on ? WA.cyanLo : '#12151c');
  rect(g, lx - 4 + sw, ly + 9, 9, 2, WA.iron); rect(g, lx - 3 + sw, ly + 11, 7, 1, '#2a2e36');
  if (on) { rect(g, lx - 1 + sw, ly + 3, 3, 5, '#ffffff'); rect(g, lx + sw, ly + 2, 1, 7, WA.cyanHi); glow(g, lx, ly + 5, 13, WA.cyan, 0.07); glow(g, lx, ly + 5, 8, WA.cyan, 0.10); }
  else { px(g, lx - 1 + sw, ly + 3, '#3a4a5a'); px(g, lx + 1 + sw, ly + 6, '#2a3644'); }
}
/* A WAYSTONE (x, y = its foot): a standing stone with a carved ring that never goes out */
export function drawStone(g, x, y, time) {
  rect(g, x - 6, y - 3, 12, 3, '#4a505a'); rect(g, x - 7, y - 2, 14, 2, '#3a3e48');
  rect(g, x - 5, y - 24, 10, 22, '#6a7280'); rect(g, x - 4, y - 26, 8, 3, '#6a7280'); rect(g, x - 2, y - 27, 4, 2, '#6a7280');
  rect(g, x - 5, y - 24, 2, 22, '#8a929e'); rect(g, x + 3, y - 24, 2, 22, '#4a505c'); rect(g, x - 4, y - 26, 8, 1, '#9aa2ae');
  for (let i = 0; i < 4; i++) px(g, x - 2 + (hash(i, 5) % 5), y - 6 - i * 4, '#5a8a74');   /* moss */
  const p = 0.7 + 0.3 * Math.sin(time * 2);
  rect(g, x - 3, y - 17, 6, 1, al(WA.cyan, p)); rect(g, x - 3, y - 12, 6, 1, al(WA.cyan, p)); rect(g, x - 3, y - 16, 1, 4, al(WA.cyan, p)); rect(g, x + 2, y - 16, 1, 4, al(WA.cyan, p)); rect(g, x - 1, y - 15, 2, 2, WA.cyanHi);
  rect(g, x - 1, y - 21, 2, 1, al(WA.cyan, p * 0.8)); rect(g, x, y - 22, 1, 1, al(WA.cyan, p * 0.8)); rect(g, x - 1, y - 9, 2, 1, al(WA.cyan, p * 0.8));
  glow(g, x, y - 14, 14, WA.cyan, 0.07); glow(g, x, y - 14, 8, WA.cyan, 0.09);
  rect(g, x - 11, y - 2, 3, 2, '#5a606a'); rect(g, x + 8, y - 3, 3, 3, '#5a606a'); px(g, x - 10, y - 3, '#9aa2ac');   /* offering stones */
}
/* THE HERO'S GHOST LANTERN (x, y = where it hangs, held out to the side). st: 'lit' | 'out' (drowned) | 'stolen' (gone) */
export function drawHeroLantern(g, x, y, face, st, time) {
  if (st === 'stolen') { rect(g, x - 1, y - 3, 3, 4, '#2a2e38'); px(g, x, y - 5, '#6a6e78'); return; }
  rect(g, x - 2, y - 6, 5, 1, '#8a8e98'); rect(g, x - 2, y - 5, 1, 2, '#8a8e98'); rect(g, x + 2, y - 5, 1, 2, '#8a8e98');
  rect(g, x - 3, y - 3, 7, 2, '#6a6e78'); px(g, x, y - 4, '#9aa0aa');
  const lit = st === 'lit'; rect(g, x - 2, y - 1, 5, 5, lit ? WA.gold : '#22262e'); rect(g, x - 3, y - 1, 1, 5, '#6a6e78'); rect(g, x + 3, y - 1, 1, 5, '#6a6e78'); rect(g, x - 3, y + 4, 7, 1, '#6a6e78'); rect(g, x - 1, y + 5, 3, 1, '#4a4e58');
  if (lit) { const f = 0.5 + 0.5 * Math.sin(time * 11 + x); rect(g, x - 1, y, 3, 3, WA.goldHi); rect(g, x, y - (f > 0.5 ? 1 : 0), 1, 2, '#ffffff'); glow(g, x, y + 1, 10, WA.gold, 0.08); }
  else { px(g, x, y + 2, '#7a3a1a'); px(g, x - 1, y + 1, '#2a2020'); }
}
/* a drifting wisp (unattached light; the Widow's rim, the mere) */
export function drawWisp(g, x, y, time, k = 0) { glow(g, x, y, 6, WA.cyan, 0.08); rect(g, x - 1, y - 1, 3, 3, al(WA.cyanHi, 0.8)); px(g, x, y - 2 - R(Math.sin(time * 4 + k)), al(WA.cyan, 0.6)); }
/* THE TETHER: a thread of cold light from a thief to the flame it carries */
export function drawTether(g, x0, y0, x1, y1) { const n = 7; for (let i = 1; i < n; i++) { const t = i / n; rect(g, R(x0 + (x1 - x0) * t), R(y0 + (y1 - y0) * t), 1, 1, al(WA.cyan, 0.45 * (1 - t * 0.5))); } }

/* ================================ THE HANDS ================================ */
/* A POOL OF SHADOW: the dark ground a hand rises out of (a..b on screen, y = the standing surface) */
export function drawPool(g, a, b, y, time, seed = 0) {
  const w = b - a; if (w <= 0) return;
  rect(g, a + 2, y - 1, w - 4, 3, 'rgba(14,8,26,0.88)'); rect(g, a, y, w, 2, 'rgba(14,8,26,0.9)'); rect(g, a + 1, y - 2, w - 2, 1, 'rgba(74,58,122,0.30)');
  for (let x = a + 3; x < b - 3; x += 6) { const h = hash(x, seed); if (h % 2 === 0) rect(g, x, y - 2, 3, 1, 'rgba(122,98,176,0.35)'); }
  for (let i = 0; i < Math.ceil(w / 28); i++) { const rx = R(a + 6 + ((i * 29 + seed * 7 + time * 6) % Math.max(1, w - 12))), p = (time * 0.7 + i * 0.37) % 1; ellipse(g, rx, y, 1 + p * 4, 0.6 + p, 'rgba(160,140,220,' + (0.30 * (1 - p)).toFixed(2) + ')'); }
}
/* the hand's TELL: a ripple spreading at its rise (x, y), and the mark where it will lunge (tx) */
export function drawHandTell(g, x, y, tx, k, time) {
  const rx = 4 + k * 12; ellipse(g, x, y, rx, 2, 'rgba(18,10,34,0.8)'); ellipse(g, x, y, rx - 2, 1, 'rgba(90,70,150,0.5)'); rect(g, x - R(rx), y - 1, 2, 1, '#a08adc'); rect(g, x + R(rx) - 2, y - 1, 2, 1, '#a08adc');
  for (let i = -1; i <= 1; i++) { rect(g, x + i * 4 - 1, y - 3 - R(k * 3), 2, 3 + R(k * 3), '#140a22'); px(g, x + i * 4, y - 4 - R(k * 3), '#7a62b0'); }   /* knuckles breaking the surface */
  if ((time * 10) % 2 < 1) { rect(g, tx - 4, y - 2, 8, 1, '#ffd36b'); rect(g, tx - 1, y - 5, 2, 3, '#ffd36b'); }   /* where it is going: your feet */
}
/* THE HAND: up = 0..1 how far it has risen; dir = the way it lunges (0 = straight up) */
export function drawHand(g, x, y, up, dir, time) {
  const h = R(18 * Math.max(0.1, up)), lean = dir * 3, wob = R(Math.sin(time * 14) * 1);
  rect(g, x - 3, y - h, 6, h, WA.hand); rect(g, x - 3, y - h, 1, h, WA.handHi); rect(g, x - 5, y - 2, 10, 3, WA.hand); rect(g, x - 6, y, 12, 2, '#0c0616');   /* the forearm, the broken ground */
  const hy = y - h - 2, hx = x + lean;
  rect(g, hx - 4, hy - 1, 8, 4, WA.hand); rect(g, hx - 4, hy - 1, 8, 1, WA.handHi);
  [[-4, -5, 0], [-2, -7, 1], [1, -7, 1], [3, -5, 0]].forEach(([fx, fl, c], i) => { rect(g, hx + fx, hy + fl + wob * (i & 1 ? 1 : -1), 1 + c, -fl - 1, WA.hand); px(g, hx + fx, hy + fl - 1 + wob * (i & 1 ? 1 : -1), WA.handLo); });   /* four long fingers, the tips curled and lit */
  px(g, hx - 6 + dir, hy + 1, WA.hand); px(g, hx - 7 + dir, hy, WA.hand);
  for (let i = 0; i < 3; i++) { const t = (time * 1.2 + i * 0.33) % 1; px(g, x - 5 + i * 5, y - R(t * 14), 'rgba(122,98,176,' + (0.4 * (1 - t)).toFixed(2) + ')'); }   /* shadow smoke off it */
}

/* ================================ THE WISP THIEF ================================ */
let SCR = null; const scratch = () => (SCR = SCR || (() => { const [c, g] = canvas(64, 56); return { c, g }; })());
/* e.mode: drift | swoopTell | swoop | flee | scorched; e.flame = the flame it carries; e.flash = a hit */
export function drawThief(g, e, ex, ey, time) {
  const { c, g: sg } = scratch(), OX = 32, OY = 30, f = e.face || 1, mode = e.mode || 'drift';
  sg.clearRect(0, 0, 64, 56);
  const X = (lx, w) => (f > 0 ? OX + lx : OX - lx - w), bob = mode === 'drift' ? Math.sin(time * 4 + (e.x || 0) * 0.05) * 1.5 : 0;
  const wing = Math.sin(time * (mode === 'swoop' ? 30 : mode === 'scorched' ? 5 : 16)), tell = mode === 'swoopTell', sc = mode === 'scorched', fl = mode === 'flee';
  const body = sc ? '#e8a070' : tell ? '#ffffff' : '#bfe6ff', hi = sc ? '#ffd0a0' : '#eaffff', lo = sc ? '#a05a3a' : '#5a8ab0';
  const sw = mode === 'swoop' ? 7 : 0;   /* stretched out in the dive */
  /* the tail: a ragged streamer of fading light behind */
  for (let k = 0; k < 5; k++) { const tx = -4 - k * 3 - sw - (fl ? k : 0), ty = 2 + k + Math.sin(time * 7 + k) * 1.4 + bob, a = (0.6 - k * 0.11) * (sc ? 0.7 : 1); rect(sg, X(tx, 3 - (k >> 1)), OY + ty, 3 - (k >> 1), 2, al(body, Math.max(0.08, a))); }
  if (mode === 'swoop') for (let k = 1; k < 4; k++) rect(sg, X(-8 - k * 6, 6), OY - 2 + k, 6, 1, al(WA.cyanHi, 0.35 - k * 0.08));   /* speed lines */
  /* the wings: a moth's, pale, flapping (spread high to tell the dive, drooped when scorched) */
  const wy = tell ? -8 : sc ? 3 : wing > 0 ? -6 : -1;
  rect(sg, X(-3, 8), OY - 4 + wy + bob, 8, 5, al(body, 0.55)); rect(sg, X(-1, 6), OY - 7 + wy + bob, 6, 3, al(hi, 0.5)); rect(sg, X(-3, 8), OY - 4 + wy + bob + (wy < -2 ? 4 : 0), 8, 1, al(lo, 0.7));
  /* the body: a teardrop with a hooked beak and two lit eyes */
  ellipse(sg, OX, OY + bob, 5 + (sw ? 2 : 0), 5, body); ellipse(sg, OX - f * 1, OY - 1 + bob, 3, 3, hi); rect(sg, X(-5, 10), OY + 3 + bob, 10, 1, lo);
  rect(sg, X(3, 5), OY + bob, 5, 2, sc ? '#a05a3a' : WA.gold); px(sg, X(8, 1), OY + 2 + bob, sc ? '#a05a3a' : WA.goldLo);   /* the hooked beak */
  rect(sg, X(0, 3), OY - 3 + bob, 3, 3, '#0a1020'); px(sg, X(1, 1), OY - 2 + bob, tell ? '#ff4a2a' : sc ? '#7a3a1a' : WA.gold); if (tell) px(sg, X(1, 1), OY - 3 + bob, '#ffffff');
  /* the claws: out and open to take, closed on a flame when it has one */
  rect(sg, X(-1, 4), OY + 5 + bob, 4, 2, lo); if (tell || mode === 'swoop') { px(sg, X(-2, 1), OY + 8 + bob, lo); px(sg, X(1, 1), OY + 8 + bob, lo); px(sg, X(3, 1), OY + 8 + bob, lo); }
  if (e.flame) { const ff = 0.5 + 0.5 * Math.sin(time * 12); rect(sg, X(-1, 4), OY + 7 + bob, 4, 4, WA.gold); rect(sg, X(0, 2), OY + 6 + bob - (ff > 0.5 ? 1 : 0), 2, 3, WA.goldHi); px(sg, X(0, 1), OY + 5 + bob, '#ffffff'); glow(sg, OX, OY + 9 + bob, 8, WA.gold, 0.12); }
  if (sc) for (let k = 0; k < 3; k++) { const t = (time * 1.4 + k * 0.33) % 1; px(sg, OX - 3 + k * 3, OY - 6 - R(t * 9), al('#8a8a92', 0.5 * (1 - t))); px(sg, X(-6 + k * 5, 1), OY - 12 + (k & 1) * 2, (time * 8) % 2 < 1 ? WA.gold : '#ffffff'); }   /* smoke, and dizzy stars */
  if (e.flash > 0) { sg.globalCompositeOperation = 'source-in'; sg.fillStyle = '#ffffff'; sg.fillRect(0, 0, 64, 56); sg.globalCompositeOperation = 'source-over'; }
  g.drawImage(c, R(ex) - OX, R(ey) - OY);
}

/* ================================ THE EXIT ================================ */
/* THE ROOT-HOLE under the glade (x, y = the middle of its rim on the water): the oaks' roots curl into it; it is webbed shut until the Widow falls - the first webs of the Silk Undercroft */
export function drawExitHole(g, x, y, open, time) {
  ellipse(g, x, y, 34, 12, '#3a3a44'); ellipse(g, x, y, 31, 10, '#1a1a22'); ellipse(g, x, y, 25, 8, '#08090e'); ellipse(g, x, y + 1, 15, 5, '#010206');
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, rx = x + Math.cos(a) * 32, ry = y + Math.sin(a) * 11, ln = 4 + hash(i, 3) % 5, bx = Math.cos(a) * ln, by = Math.sin(a) * ln * 0.45;
    thick(g, R(rx), R(ry), R(rx + bx), R(ry + by), i % 3 ? '#8a8a96' : '#5a5a66', 2); px(g, R(rx + bx), R(ry + by), '#b0b0bc'); }   /* roots curling over the rim */
  if (open) {
    for (let i = 0; i < 4; i++) { const t = (time * 0.5 + i * 0.25) % 1; rect(g, x - 10 + i * 6, y + R(t * 22), 2, 2, al(WA.cyan, 0.5 * (1 - t))); }   /* dust, and a cold air from below */
    rect(g, x - 12, y + 6, 24, 12, 'rgba(191,230,255,0.05)');
    for (const [a, b] of [[-30, -12], [30, 14], [-8, -22]]) { line(g, x + a, y, x + b, y - 6, 'rgba(210,214,224,0.5)'); px(g, x + b, y - 6, 'rgba(210,214,224,0.7)'); }   /* torn webs on the rim */
  } else {
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.2; line(g, R(x + Math.cos(a) * 30), R(y + Math.sin(a) * 10), R(x + Math.cos(a + Math.PI) * 6), R(y + Math.sin(a + Math.PI) * 2), 'rgba(214,218,228,0.55)'); }
    for (const k of [0.35, 0.6, 0.85]) for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2 + 0.2, a2 = (i + 1) / 9 * Math.PI * 2 + 0.2; line(g, R(x + Math.cos(a) * 30 * k), R(y + Math.sin(a) * 10 * k), R(x + Math.cos(a2) * 30 * k), R(y + Math.sin(a2) * 10 * k), 'rgba(214,218,228,0.42)'); }   /* a web across it */
    px(g, x - 3, y - 1, '#ffffff'); px(g, x + 8, y + 2, '#ffffff'); if (Math.sin(time * 2) > 0.8) px(g, x + 14, y - 3, '#ffffff');
  }
}
