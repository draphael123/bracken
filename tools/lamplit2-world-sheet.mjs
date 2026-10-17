// tools/lamplit2-world-sheet.mjs - the Lamplit Street 2's WORLD art (src/lamplit2-art.js) drawn in Node on the level's own floor colours, 4x: docs/lamplit2-world.png.
// The canvas stub has no paths, so the glows/rings (arc, ellipse) are skipped here; what is drawn is the pixel work itself.
// usage: node tools/lamplit2-world-sheet.mjs [out.png]
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const LA = await import('../src/lamplit2-art.js');
const cell = (w, h, fn, bg = '#243236') => { const c = newCanvas(w, h), g = c.getContext('2d'); for (const k of ['beginPath', 'ellipse', 'arc', 'fill', 'stroke', 'setLineDash']) g[k] = () => {};
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#4a5c58'; g.fillRect(0, h - 14, w, 14); g.fillStyle = '#6f847e'; g.fillRect(0, h - 14, w, 1); fn(g, h - 14); return c; };
const T = 0.4;
const cells = [
  cell(90, 60, (g, f) => LA.flask(g, 45, 24, 1, 0.1, 0.5)), cell(90, 60, (g, f) => LA.flask(g, 45, 24, 1, 0.2, 0.5)),
  cell(120, 60, (g, f) => LA.slick(g, 60, f, 30, 1, T, 0, 0, 40)), cell(120, 60, (g, f) => LA.slick(g, 60, f, 30, 1, T, 1, 0.8, 40)),
  cell(120, 60, (g, f) => LA.wax(g, 60, f, 40, 0.8, T)),
  cell(120, 80, (g, f) => LA.sealGhost(g, 60, f, 28, 0.2, false, T)), cell(120, 80, (g, f) => LA.sealGhost(g, 60, f, 28, 0.85, true, T)),
  cell(120, 80, (g, f) => LA.scalesWeight(g, 30, 8, 80, 40, T, false)), cell(120, 80, (g, f) => LA.scalesWeight(g, 30, 8, 95, 20, T, true)),
  cell(90, 50, (g, f) => g.drawImage(LA.bier(), 25, f - 17)), cell(140, 60, (g, f) => { g.drawImage(LA.bier(), 50, f - 17); LA.bearers(g, 70, f, 0.3); }),
  cell(80, 80, (g, f) => { for (let j = 0; j < 3; j++) { g.drawImage(LA.tollGate(0), 8 + 16 * 0, 2 + 16 * j); g.drawImage(LA.tollGate(1), 8 + 32, 2 + 16 * j); } }),
  cell(120, 90, (g, f) => LA.airMain(g, 40, 70, 50, true, T)), cell(120, 90, (g, f) => LA.airMain(g, 40, 70, 50, false, T)),
  cell(160, 80, (g, f) => LA.pocket(g, { l: 10, r: 150, t: 8, b: 40 }, true, T)), cell(160, 80, (g, f) => LA.pocket(g, { l: 10, r: 150, t: 8, b: 40 }, false, T)),
  cell(120, 70, (g, f) => LA.hoodWater(g, 50, 6, T, 3)),
];
const sc = 4, per = 4, W = Math.max(...cells.map(c => c.width)) + 6, rows = Math.ceil(cells.length / per);
const rowH = []; for (let r = 0; r < rows; r++) rowH.push(Math.max(...cells.slice(r * per, r * per + per).map(c => c.height)) + 6);
const out = newCanvas(W * per * sc, rowH.reduce((a, b) => a + b, 0) * sc), og = out.getContext('2d'); og.imageSmoothingEnabled = false; og.fillStyle = '#10181c'; og.fillRect(0, 0, out.width, out.height);
let y = 0; for (let r = 0; r < rows; r++) { cells.slice(r * per, r * per + per).forEach((c, i) => og.drawImage(c, 0, 0, c.width, c.height, i * W * sc, y * sc, c.width * sc, c.height * sc)); y += rowH[r]; }
savePNG(out, process.argv[2] || new URL('../docs/lamplit2-world.png', import.meta.url));
