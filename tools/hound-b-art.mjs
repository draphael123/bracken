// tools/hound-b-art.mjs - THE GREAT HOUND's group B art, rendered in Node (claude/art4). No browser.  node tools/hound-b-art.mjs [out-prefix] -> <prefix>-set.png
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const HB = await import('../src/redraw/hound_b_art.js');
const bad = []; let n = 0; const out = process.argv[2];
const cell = (w, h, bg, fn) => { const c = newCanvas(w, h), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); fn(g, w, h); return c; };
const colours = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, s = new Set(); for (let i = 0; i < d.length; i += 4) s.add(d[i] << 16 | d[i + 1] << 8 | d[i + 2]); return s.size; };
const floor = (g, w, y) => { g.fillStyle = '#4a3a2a'; g.fillRect(0, y, w, 6); };
const parts = [
  ['gibbet', cell(130, 190, '#6a8a6a', (g, w) => { floor(g, w, 180); HB.drawGibbet(g, 50, 30, 180, 1, 0.4); })],
  ['gallery', cell(120, 120, '#6a8a6a', (g, w) => { floor(g, w, 110); g.fillStyle = '#74382a'; g.fillRect(14, 30, 92, 5); HB.drawGallery(g, 14, 106, 30, 110, 0.5); })],
  ['horn cue k0.2 / k0.9', cell(300, 90, '#6a8a6a', (g, w) => { floor(g, w, 80); HB.drawHornCue(g, 30, 80, 0.2, 1, 0.3); HB.drawHornCue(g, 270, 80, 0.9, -1, 0.3); })],
  ['charge trail', cell(130, 50, '#6a8a6a', (g, w) => { floor(g, w, 44); g.fillStyle = '#5c3c28'; g.fillRect(70, 22, 40, 22); HB.drawChargeTrail(g, 100, 44, 1, 0.4); })],
  ['caged', cell(80, 60, '#6a8a6a', (g, w) => { floor(g, w, 52); g.fillStyle = '#3a2416'; g.fillRect(20, 26, 40, 26); HB.drawCagedFx(g, 40, 52, 0.2); })],
];
for (const [name, c] of parts) { n++; if (colours(c) < 6) bad.push(name + ': barely drawn'); }
if (out) { const sh = sheet(parts.map(p => p[1]), { maxW: 760, bg: '#000', pad: 6 }), c = newCanvas(sh.width * 2, sh.height * 2), g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * 2, sh.height * 2); savePNG(c, out + '-set.png'); }
console.log(n + ' checked, ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.join('\n  ') : '')); process.exit(bad.length ? 1 : 0);
