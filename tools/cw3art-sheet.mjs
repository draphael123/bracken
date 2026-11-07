/* tools/cw3art-sheet.mjs - THE DROWNED CAUSEWAY 2's ART as PNG contact sheets, NODE ONLY (claude/cw3art): a tiny software raster stands in for the canvas (fillRect with alpha, drawImage
   of a baked layer), so the art can be LOOKED AT with no browser, page, port or Chrome.
     node tools/cw3art-sheet.mjs [outdir]    (default ../work/claude/lane-done next to the repo's parent; writes cw3art-sheet.png plus the parts below)
   cw3art-sheet.png  everything on one sheet;  cw3art-tiles.png (the kit by act: dry I, wet II, night III, the light; the hull, towers, chapel, undersea, mud, gate, ledges)
   cw3art-sky.png (the storm by stage k = 0..1 with the lighthouse nearer each step, a lightning frame)  cw3art-pieces.png (bell, wheel, lever, gun, lamps, ferry, ring, air, arms, strike, crack, gauge) */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../work/claude/lane-done/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const hexRgb = c => { c = String(c); let m; if ((m = /^#([0-9a-f]{6})$/i.exec(c))) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4), 16)]; if ((m = /^rgba?\((\d+),(\d+),(\d+)/.exec(c.replace(/\s/g, '')))) return [+m[1], +m[2], +m[3]]; return [255, 0, 255]; };
class Ctx {
  constructor(c) { this.canvas = c; this.fillStyle = '#000000'; this.globalAlpha = 1; this.strokeStyle = '#000'; this.lineWidth = 1; this.imageSmoothingEnabled = false; }
  get buf() { const c = this.canvas; if (!c._buf || c._buf.length !== c.width * c.height * 4) c._buf = new Uint8ClampedArray(c.width * c.height * 4); return c._buf; }
  fillRect(x, y, w, h) { const c = this.canvas, b = this.buf, [r, g, bl] = hexRgb(this.fillStyle), a = this.globalAlpha; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) { const o = (j * c.width + i) * 4, da = b[o + 3] / 255, oa = a + da * (1 - a);
      if (oa > 0) { b[o] = (r * a + b[o] * da * (1 - a)) / oa; b[o + 1] = (g * a + b[o + 1] * da * (1 - a)) / oa; b[o + 2] = (bl * a + b[o + 2] * da * (1 - a)) / oa; b[o + 3] = oa * 255; } } }
  clearRect(x, y, w, h) { const c = this.canvas, b = this.buf; for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) b[(j * c.width + i) * 4 + 3] = 0; }
  drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh) { if (arguments.length <= 5) { dx = sx; dy = sy; sx = 0; sy = 0; sw = img.width; sh = img.height; dw = sw; dh = sh; } const s = img._buf, d = this.buf, c = this.canvas; if (!s) return;
    for (let j = 0; j < dh; j++) for (let i = 0; i < dw; i++) { const X = Math.round(dx) + i, Y = Math.round(dy) + j; if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) continue; const si = Math.min(img.width - 1, sx + Math.floor(i * sw / dw)), sj = Math.min(img.height - 1, sy + Math.floor(j * sh / dh)), so = (sj * img.width + si) * 4, o = (Y * c.width + X) * 4;
      const a = s[so + 3] / 255 * this.globalAlpha, da = d[o + 3] / 255, oa = a + da * (1 - a); if (oa > 0) { for (let k = 0; k < 3; k++) d[o + k] = (s[so + k] * a + d[o + k] * da * (1 - a)) / oa; d[o + 3] = oa * 255; } } }
  getImageData(x, y, w, h) { return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }; } putImageData() {} beginPath() {} moveTo() {} lineTo() {} closePath() {} fill() {} stroke() {} arc() {} ellipse() {} save() {} restore() {} setLineDash() {} createLinearGradient() { return { addColorStop() {} }; }
}
globalThis.document = { createElement: () => { const c = { width: 1, height: 1 }; c.getContext = () => (c._g = c._g || new Ctx(c)); return c; } };
const mk = (w, h, bg) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } return [c, g]; };
const crc = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xffffffff; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }; })();
function png(c, scale, name) {
  const W = c.width * scale, H = c.height * scale, raw = Buffer.alloc((W * 4 + 1) * H), b = c._buf;
  for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; for (let x = 0; x < W; x++) { const o = (Math.floor(y / scale) * c.width + Math.floor(x / scale)) * 4, p = y * (W * 4 + 1) + 1 + x * 4, a = b[o + 3] / 255; raw[p] = b[o] * a + 20 * (1 - a); raw[p + 1] = b[o + 1] * a + 20 * (1 - a); raw[p + 2] = b[o + 2] * a + 28 * (1 - a); raw[p + 3] = 255; } }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cc]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  writeFileSync(OUT + name, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])); console.log('wrote ' + OUT + name + ' ' + W + 'x' + H);
}

const TILES = await import(new URL('../src/redraw/causeway3_tiles.js', import.meta.url).href), BACK = await import(new URL('../src/redraw/causeway3_back.js', import.meta.url).href),
  ART = await import(new URL('../src/redraw/causeway3_art.js', import.meta.url).href);
process.env.CW3 = '1';
const { LEVELS, T } = await import(new URL('../src/level.js', import.meta.url).href);
const L = LEVELS.find(l => l.id === 'causeway').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const sheets = [];
/* ---- TILES: real spans of the real level, tile kit applied cell by cell ---- */
{ const spans = [[40, 64, 'LANDING / MILE ROAD (act I, dry)', 14, 34], [226, 250, 'THE GUN: the fallen tower (act I)', 4, 34], [306, 342, 'THE WRECK: hull + shrouds (act II, wet)', 2, 26], [366, 408, 'THE CHAPEL + crypt hole (act II)', 6, 40],
  [430, 500, 'THE SEA ARCH (undersea kit)', 18, 41], [612, 648, 'THE DARK MILE (act III, night)', 14, 36], [700, 724, 'THE LAST BELL stones + sluice house', 14, 36], [894, 932, 'THE LIGHTHOUSE steps + tower', 3, 24], [156, 180, 'THE COVE (mud)', 16, 36]];
  const COLS = 40, [c, g] = mk(COLS * 16, 0 + spans.reduce((s, sp) => s + (sp[4] - sp[3] + 1) * 16 + 12, 0) + 8, '#10141c'); let oy = 4;
  for (const [x0, x1, , y0, y1] of spans) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= Math.min(x1, x0 + COLS - 1); x++) { const t = at(x, y); if (t === T.AIR) continue; const s = TILES.cw3Tile(t, x, y, at, T, L); if (s) g.drawImage(s, (x - x0) * 16, oy + (y - y0) * 16, 16, 16); else { g.fillStyle = '#ff00ff'; g.fillRect((x - x0) * 16, oy + (y - y0) * 16, 16, 16); } } oy += (y1 - y0 + 1) * 16 + 12; }
  sheets.push(['cw3art-tiles.png', c, 2]); }
/* ---- SKY: five stages of the storm with the light, and a lightning frame ---- */
{ const VW = 320, VH = 180, ks = [0.02, 0.28, 0.5, 0.72, 0.95], [c, g] = mk(VW * 3, (VH + 4) * 2 + 4, '#000');
  ks.forEach((k, i) => { const cx = k * (BACK.END - 160) - VW / 2, ox = (i % 3) * VW, oy = 2 + Math.floor(i / 3) * (VH + 4), [cc, gg] = mk(VW, VH); BACK.drawBackdrop(gg, cx, 400, VW, VH, L, 3 + i * 1.3, 0, true, 0); gg.fillStyle = '#0a2a36'; gg.fillRect(0, Math.round(VH * 0.62 - k * 12) + 2, VW, VH);
    BACK.drawLighthouse(gg, cx, 400, VW, VH, 3 + i * 1.3, 0); g.drawImage(cc, ox, oy); });
  { const k = 0.8, cx = k * (BACK.END - 160) - VW / 2, [cc, gg] = mk(VW, VH); BACK.drawBackdrop(gg, cx, 400, VW, VH, L, 5.0, 0, true, 1.2); gg.fillStyle = '#0a2a36'; gg.fillRect(0, Math.round(VH * 0.62 - k * 12) + 2, VW, VH); BACK.drawLighthouse(gg, cx, 400, VW, VH, 5.0, 1.2); g.drawImage(cc, 2 * VW * 1, 2 + (VH + 4)); }
  sheets.push(['cw3art-sky.png', c, 2]); }
/* ---- PIECES ---- */
{ const [c, g] = mk(560, 330, '#1a222c'); const gy = 66, floor = (x0, x1, y) => { g.fillStyle = '#34333c'; g.fillRect(x0, y, x1 - x0, 3); };
  floor(0, 560, gy); floor(0, 560, gy * 2); floor(0, 560, gy * 3); floor(0, 560, gy * 4);
  ART.drawBell(g, 30, gy, 0, 0, 0); ART.drawBell(g, 80, gy, 0.8, 1, 0); ART.drawWheel(g, 125, gy, 0.3, false, 0, 0); ART.drawWheel(g, 160, gy, 0.9, true, 0.6, 0); ART.drawLever(g, 200, gy, false); ART.drawLever(g, 232, gy, true);
  ART.drawGun(g, 290, gy, 1, false, 0.5); ART.drawGun(g, 350, gy, 1, true, 0.5); ART.drawLamp(g, 400, gy, false, 1.2, false); ART.drawLamp(g, 430, gy, true, 1.2, false); ART.drawLamp(g, 460, gy, true, 2.0, true);
  ART.drawCottage(g, 505, gy, true, 1, 3); ART.drawWaymark(g, 540, gy, 1);
  ART.drawBoat(g, 8, gy + 16, 224, 1.0, true); ART.drawBoat(g, 250, gy + 16, 120, 1.0, false); ART.drawRing(g, 400, gy + 12); ART.drawGull(g, 430, gy + 14, 1, 1, 0); ART.drawGull(g, 450, gy + 14, 1, 0, 1);
  g.fillStyle = '#0a2a36'; g.fillRect(470, gy + 4, 80, 56); ART.drawAir(g, 478, 540, gy + 6, gy + 34, 0.7);
  ART.drawArmTell(g, 50, gy * 3, 0.3, 0.4); ART.drawArmTell(g, 120, gy * 3, 0.95, 0.4); ART.drawArm(g, 200, gy * 3, 1, 0.3, true); ART.drawArm(g, 260, gy * 3, 0.5, 0.6, false);
  g.fillStyle = '#10161e'; g.fillRect(300, gy * 2 + 4, 260, gy - 4); ART.drawStrike(g, 330, gy * 2 + 6, gy * 3 - 2, 0.3, 0.2); ART.drawStrike(g, 380, gy * 2 + 6, gy * 3 - 2, 0.9, 0.2);
  g.fillStyle = '#56545a'; g.fillRect(300, gy * 3, 240, 12); ART.drawCrack(g, 308, gy * 3, 1.0, 0.3, 1.2); ART.drawCrack(g, 332, gy * 3, 0.3, 0.3, 1.2); ART.drawFront(g, 400, gy * 3, 0.4); ART.drawWet(g, 430, 540, gy * 3, 1, 0.3, false);
  ART.drawTideGauge(g, 20, gy * 3 + 8, { k: 0.6, ph: 'warn', tell: false, coming: 'in', held: true, holdLeft: 6 }, 0.3); ART.drawTideGauge(g, 50, gy * 3 + 8, { k: 0.2, ph: 'low', tell: false, coming: null }, 0.3);
  sheets.push(['cw3art-pieces.png', c, 3]); }
/* ---- ONE SHEET ---- */
{ const parts = sheets.map(([, c, s]) => [c, s]); const sc = 1, W = Math.max(...parts.map(([c, s]) => c.width * s / 2)), Hh = parts.reduce((a, [c, s]) => a + c.height * s / 2 + 6, 0), [big, bg] = mk(W, Hh, '#000'); let y = 0;
  for (const [c, s] of parts) { const hw = c.width * s / 2, hh = c.height * s / 2; bg.drawImage(c, 0, 0, c.width, c.height, 0, y, hw, hh); y += hh + 6; } sheets.unshift(['cw3art-sheet.png', big, 1]); void sc; }
for (const [n, c, s] of sheets) png(c, s, n);
