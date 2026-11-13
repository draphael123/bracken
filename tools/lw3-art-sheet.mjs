/* tools/lw3-art-sheet.mjs - SALTREACH (Long Water 3) ART as PNG contact sheets, NODE ONLY (claude/saltart): the software raster stands in for the canvas, so the art is LOOKED AT with no browser.
   node tools/lw3-art-sheet.mjs [outdir]   writes salt-tiles-*.png (real spans of the real level), salt-crab-poses, salt-herald-poses (1x strips too), salt-pieces, salt-village (a composed room) */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/lane-reports/saltart/', import.meta.url));
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

/* ---- a 3x5 label font (A-Z 0-9 . - / ( ) ) ---- */
const FONT = { A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101111011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001', 5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110', '.': '000000000000010', '-': '000000111000000', '/': '001001010100100', ' ': '000000000000000', '(': '010100100100010', ')': '010001001001010', '+': '000010111010000' };
const label = (g, x, y, s, col = '#c9d8d0') => { g.fillStyle = col; let cx = x; for (const ch of String(s).toUpperCase()) { const m = FONT[ch] || FONT[' ']; for (let i = 0; i < 15; i++) if (m[i] === '1') g.fillRect(cx + (i % 3), y + Math.floor(i / 3), 1, 1); cx += 4; } };

const BG = '#141a22', CELL = '#1b2430', FLOOR = '#2a3440';
const sheets = [];
/* ---- TILES: real spans of the real level, the tile kit applied cell by cell ---- */
const TILES = await import(new URL('../src/redraw/lw3_tiles.js', import.meta.url).href);
process.env.LW3 = '1';
const { LEVELS, T } = await import(new URL('../src/level.js', import.meta.url).href);
const L = LEVELS.find(l => l.id === 'longwater').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
const SKY = ['#9fb0b8', '#b6c4c8'];
{ const spans = [[366, 411, 'THE STAITHE: quay, kelp ladder, cove', 17, 36], [412, 455, 'THE TIDE POOLS + THE SEA WALL', 20, 38], [456, 497, 'THE MILL RACE: bluff, bed, steps', 20, 38], [498, 545, 'THE NET LOFTS: pier stumps, net walks', 15, 38],
    [546, 585, 'THE LOW STREET: net walks', 18, 30], [586, 633, 'THE PIERS: flats, bell rock, pier head', 20, 38], [634, 705, 'THE HEADLAND + THE TIDE FLATS', 20, 36]];
  spans.forEach(([x0, x1, name, y0, y1], i) => { const [c, g] = mk((x1 - x0 + 1) * 16, (y1 - y0 + 1) * 16, SKY[0]); let n = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = at(x, y); if (t === T.AIR) { g.fillStyle = y >= 24 ? '#4a7a86' : SKY[(y + x) & 1 ? 0 : 0]; if (y >= 24 && y < 30) g.fillRect((x - x0) * 16, (y - y0) * 16, 16, 16); continue; }
      const s = TILES.lw3Tile(t, x, y, at, T, L); if (s) { g.drawImage(s, (x - x0) * 16, (y - y0) * 16, 16, 16); n++; } else { g.fillStyle = '#f0f'; g.fillRect((x - x0) * 16, (y - y0) * 16, 16, 16); } }
    label(g, 3, 3, name); sheets.push(['salt-tiles-' + (i + 1) + '.png', c, 2]); }); }

/* ---- the crab: every pose (a windup label is gold), 4x; and the Herald: every pose, 3x; plus 1x strips ---- */
const CA = await import(new URL('../src/redraw/pool_crab_art.js', import.meta.url).href), HA = await import(new URL('../src/redraw/tide_herald_art.js', import.meta.url).href);
const SAND = '#3a3a30';
{ const keys = Object.keys(CA.CRAB_POSE_SET), cw = 56, ch = 40, cols = 4, rows = Math.ceil(keys.length / cols), [c, g] = mk(cw * cols, ch * rows, BG);
  keys.forEach((k, i) => { const x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * ch; g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = SAND; g.fillRect(x0 + 2, y0 + 34, cw - 4, 4);
    CA.drawCrab(g, x0 + 20, y0 + 34, 1, { pose: k, seed: 1, k: 0.5 }, 0.3); label(g, x0 + 3, y0 + 3, k, /Tell$/.test(k) ? '#ffd36b' : '#c9d8d0'); });
  sheets.push(['salt-crab-poses.png', c, 4]);
  const [c1, g1] = mk(keys.length * 40, 40, CELL); keys.forEach((k, i) => { g1.fillStyle = SAND; g1.fillRect(i * 40 + 2, 31, 36, 1); CA.drawCrab(g1, i * 40 + 16, 31, 1, { pose: k, seed: 1, k: 0.5 }, 0.3); }); sheets.push(['salt-crab-poses-1x.png', c1, 1]); }
{ const keys = Object.keys(HA.HERALD_POSE_SET), cw = 110, ch = 88, cols = 5, rows = Math.ceil(keys.length / cols), [c, g] = mk(cw * cols, ch * rows, BG);
  keys.forEach((k, i) => { const x0 = (i % cols) * cw, y0 = Math.floor(i / cols) * ch; g.fillStyle = CELL; g.fillRect(x0 + 1, y0 + 1, cw - 2, ch - 2); g.fillStyle = FLOOR; g.fillRect(x0 + 4, y0 + 78, cw - 8, 3);
    HA.drawHerald(g, x0 + 44, y0 + 78, 1, { pose: k, seed: 1 }, 0.3); label(g, x0 + 3, y0 + 3, k, /Tell$|^raise$/.test(k) ? '#ffd36b' : '#c9d8d0'); });
  sheets.push(['salt-herald-poses.png', c, 3]);
  const [c1, g1] = mk(keys.length * 84, 76, CELL); keys.forEach((k, i) => { g1.fillStyle = FLOOR; g1.fillRect(i * 84 + 2, 68, 80, 1); HA.drawHerald(g1, i * 84 + 34, 68, 1, { pose: k, seed: 1 }, 0.3); }); sheets.push(['salt-herald-poses-1x.png', c1, 1]); }
if (process.env.SALT_DEBUG) { const [c, g] = mk(4 * 70, 80, CELL); ['idle', 'sweepTell', 'thrustTell', 'raise'].forEach((k, i) => HA.drawHerald(g, i * 70 + 30, 70, 1, { pose: k, seed: 1 }, 0.3)); sheets.push(['salt-debug-herald.png', c, 8]); }
/* ---- pieces + the village room ---- */
const PA = await import(new URL('../src/redraw/lw3_art.js', import.meta.url).href);
{ const [c, g] = mk(520, 240, '#9fb0b8'); const gy = 70, fl = y => { g.fillStyle = '#445562'; g.fillRect(0, y, 520, 4); };
  [gy, gy * 2 + 10, gy * 3 + 20].forEach(fl);
  PA.drawBell(g, 24, gy, 0, 0.3); PA.drawBell(g, 64, gy, 0.8, 0.3, 0.7); PA.drawSluice(g, 110, gy, 0, 0, 0.3); PA.drawSluice(g, 146, gy, 0.7, 0, 0.3); PA.drawSluice(g, 182, gy, 0, 0.5, 0.3);
  PA.drawMooring(g, 214, gy, false); PA.drawMooring(g, 236, gy, true, 0.3); PA.drawTrap(g, 266, 40, true, 6, 'crush', 0.3); PA.drawTrap(g, 296, 40, true, 6, 'coins', 0.3);
  PA.drawSmokehouse(g, 340, gy, 0.3); PA.drawLocal(g, 380, gy, 0.3, 1, 0); PA.drawLocal(g, 400, gy, 0.8, -1, 1); PA.drawGulls(g, 440, gy, 0, 0.3); PA.drawGulls(g, 490, gy, 0.8, 0.3);
  const y2 = gy * 2 + 10; PA.drawBoat(g, 10, y2 - 2, 90, 0.3, {}); PA.drawBoat(g, 120, y2 - 2, 50, 0.3, { loose: true }); PA.drawMillWheel(g, 220, y2 - 22, 0.4, 1, 0.3); PA.drawJelly(g, 280, y2 - 30, 0.3, 0); PA.drawJelly(g, 300, y2 - 20, 0.3, 2);
  PA.drawWave(g, 350, y2 - 40, y2, 1, 0.3); PA.drawSpear(g, 420, y2, 40, 0.3); PA.drawSpear(g, 440, y2, 20, 0.3); PA.drawFoam(g, 460, 510, y2 - 10, 0.3, 'rise'); PA.drawFoam(g, 460, 510, y2 - 2, 0.3, 'warn');
  const y3 = gy * 3 + 10; PA.drawLighthouse(g, 60, y3 + 8, { k: 0.6, ph: 'warn', t: 1, coming: 'in' }, 0.3); PA.drawLighthouse(g, 130, y3 + 8, { k: 0.2 }, 0.3, true); PA.drawSwirl(g, 300, y3, 0.3, 120);
  sheets.push(['salt-pieces.png', c, 3]); }
{ const VW = 360, VH = 190, [c, g] = mk(VW, VH, '#a8b8bc'); const cx = 396 * 16, cy = 15 * 16;
  g.fillStyle = '#c4d0d2'; g.fillRect(0, 0, VW, 90); g.fillStyle = '#4a7a86'; g.globalAlpha = 0.6; g.fillRect(0, (24 * 16 - cy), VW, 120); g.globalAlpha = 1;
  PA.drawLighthouse(g, 300, 120, { k: 0.5 }, 0.3, true);
  for (let ty = 15; ty < 15 + 12; ty++) for (let tx = 396; tx < 396 + 23; tx++) { const t = at(tx, ty); if (t === T.AIR) continue; const s = TILES.lw3Tile(t, tx, ty, at, T, L); if (s) g.drawImage(s, tx * 16 - cx, ty * 16 - cy, 16, 16); }
  PA.drawSmokehouse(g, 404 * 16 + 8 - cx, 23 * 16 - cy, 0.3); PA.drawLocal(g, 399 * 16 + 8 - cx, 23 * 16 - cy, 0.3, 1, 0); PA.drawLocal(g, 403 * 16 - cx, 23 * 16 - cy, 0.8, -1, 1); PA.drawBell(g, 410 * 16 + 8 - cx, 23 * 16 - cy, 0.5, 0.3, 0.5); PA.drawGulls(g, 406 * 16 - cx, 23 * 16 - cy, 0, 0.3);
  PA.drawBoat(g, 385 * 16 - cx, 32 * 16 - cy - 20, 7 * 16, 0.3, { loose: true }); PA.drawFoam(g, 0, VW, 24 * 16 - cy + 40, 0.3, 'rise');
  sheets.push(['salt-village.png', c, 3]); }
for (const [name, c, s] of sheets) png(c, s, name);
