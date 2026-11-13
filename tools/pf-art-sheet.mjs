/* tools/pf-art-sheet.mjs - THE PIRATE FLEET's ART as PNG contact sheets, NODE ONLY (claude/pfart): a tiny software raster stands in for the canvas (fillRect with alpha, drawImage of a baked layer),
   so the art can be LOOKED AT with no browser.   node tools/pf-art-sheet.mjs [outdir]   (default scratch/pf-art next to the repo's parent)
   writes: freebooter.png (every pose, both windup and release, x3), pieces.png (hulls in five liveries, rigs, winch, line, posts, wreck, gauge), tiles.png (the kit, x3),
   backdrop.png (sky + far + mid + near, composed like the game at one camera spot, x2), streaks.png */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fileURLToPath(new URL('../../scratch/pf-art/', import.meta.url));
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
const PFT = await import(new URL('../src/redraw/pirate_fleet_tiles.js', import.meta.url).href), PFB = await import(new URL('../src/redraw/pirate_fleet_back.js', import.meta.url).href),
  PFA = await import(new URL('../src/redraw/pirate_fleet_art.js', import.meta.url).href), FBA = await import(new URL('../src/redraw/freebooter_art.js', import.meta.url).href),
  FBM = await import(new URL('../src/freebooter-boss.js', import.meta.url).href), { LEVELS, T } = await import(new URL('../src/level.js', import.meta.url).href);

/* ---- the Freebooter: every pose, windup beside release ---- */
{ const list = ['idle', 'walk', 'guard', 'pistolTell', 'pistolFire', 'reload', 'cutsTell', 'cuts', 'cutsRec', 'bootTell', 'boot', 'bootRec', 'riposteTell', 'riposte', 'riposteRec', 'haulTell', 'haulWait', 'boardTell', 'boardAir', 'plungeTell', 'plungeAir', 'plungeRec', 'stuck', 'sleep', 'wake'];
  const cw = 70, ch = 70, cols = 7, rows = Math.ceil(list.length / cols), [c, g] = mk(cw * cols, ch * rows, '#3a4a58');
  list.forEach((m, i) => { const x = (i % cols) * cw + 32, y = Math.floor(i / cols) * ch + 60; g.fillStyle = '#5a4630'; g.fillRect(x - 30, y, 60, 2); FBA.drawFreebooter(g, x, y, 1, { mode: m, p: m === 'cuts' ? 0.5 : m === 'wake' ? 0.8 : 0.6, ward: false }, 0.9); });
  { const x = 5 * cw + 32, y = 3 * ch + 60; FBA.drawDeadFreebooter(g, x, y, 1, 0.3, 1); FBA.drawDeadFreebooter(g, x + cw, y, 1, 1, 1); }
  png(c, 4, 'freebooter.png'); }

/* ---- pieces ---- */
{ const [c, g] = mk(480, 330, '#0a2a36');
  for (let z = 0; z < 5; z++) PFA.drawSwellHull(g, 6 + z * 96, 20, 90, { zone: z, depth: 26, seed: z * 7 + 1 });
  PFA.drawSwellHull(g, 8, 80, 192, { zone: 1, depth: 30, seed: 5, prize: true }); PFA.drawRig(g, 8, 80, 192, { sc: 1, seed: 5, t: 0.4 });
  PFA.drawSwellHull(g, 220, 80, 208, { zone: 4, depth: 30, seed: 9, prize: true, boss: true }); PFA.drawRig(g, 220, 80, 208, { sc: 1, seed: 9, boss: true, t: 0.4 });
  PFA.drawFarPrize(g, 10, 130, 90, 0.5, 0.7, 0.4, { glint: true, zone: 3 }); PFA.drawLongboat(g, 130, 150, 96, { t: 0.4 });
  PFA.drawWinch(g, 270, 160, 0.4, { ready: true }); PFA.drawWinch(g, 300, 160, 0.9, { hauling: true }); PFA.drawLine(g, 310, 148, 440, 110, 1, 0.4, { taut: true });
  PFA.drawStump(g, 340, 170, 'stump', 0.4, false); PFA.drawStump(g, 370, 170, 'chain', 0.4, true); PFA.drawWreck(g, 100, 250, 0.4);
  PFA.drawGauge(g, 220, 220, { k: 0.6, ph: 'warn', t: 0.5, tell: false, coming: 'in' }, 0.4); PFA.drawGauge(g, 250, 220, { k: 0.2, ph: 'low', tell: false, coming: null }, 0.4);
  PFA.drawFoam(g, 280, 470, 250, 0.4, 'warn'); PFA.drawFoam(g, 280, 470, 270, 0.4, 'turn'); PFA.drawCrest(g, 380, 300, 40, 0.4);
  png(c, 3, 'pieces.png'); }

/* ---- the tile kit, drawn onto the real level around a hull and the storm stretch ---- */
{ const L = LEVELS.find(l => l.id === 'piratefleet').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H ? T.SOLID : L.grid[y * L.W + x]);
  const spans = [[24, 48], [136, 160], [300, 324], [376, 400]], [c, g] = mk(24 * 16, 4 * 15 * 16, '#0a2a36');
  spans.forEach(([x0, x1], k) => { for (let y = 26; y < 41; y++) for (let x = x0; x < x1; x++) { const t = at(x, y); if (t === T.AIR) continue; const s = PFT.pfTile(t, x, y, at, T, L); if (s) g.drawImage(s, (x - x0) * 16, (y - 26 + k * 15) * 16, 16, 16); } });
  png(c, 2, 'tiles.png'); }

/* ---- the backdrop at one camera spot, composed like the game (the layers' anchors from src/main.js) ---- */
{ const VW = 320, VH = 180, [c, g] = mk(VW, VH), sky = PFB.bakeSky(VH); g.drawImage(sky, 0, 0, 1, VH, 0, 0, VW, VH);
  PFB.drawBackdrop(g, 1200, 400, VW, VH, { W: 440 }, 3.2, 0, true); PFB.drawNear(g, 1200, 400, VW, VH, { W: 440 }, 3.2, 0); png(c, 3, 'backdrop.png');
  const [c2, g2] = mk(VW, VH); g2.drawImage(sky, 0, 0, 1, VH, 0, 0, VW, VH); PFB.drawBackdrop(g2, 4200, 500, VW, VH, { W: 440 }, 6.1, 120, true); png(c2, 3, 'backdrop2.png'); }
