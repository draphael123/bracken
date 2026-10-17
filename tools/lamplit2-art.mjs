// tools/lamplit2-art.mjs — THE LAMPREEVE's and THE TOLLMASTER's sprite sheets rendered in Node: docs/lamplit2-art.png (3x).
// usage: node tools/lamplit2-art.mjs [out.png]
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs';
install();
const { bakeLampreeve, bakeTollmaster, bakeWatch } = await import('../src/redraw/city.js');
const sets = [["LAMPREEVE", bakeLampreeve(), 18], ['TOLLMASTER', bakeTollmaster(), 26], ['WATCH', bakeWatch(), null]];
let bad = 0;
const sheets = sets.map(([n, S, want]) => {
  const r = S.R.filter(c => c.width !== S.R[0].width || c.height !== S.R[0].height).length;
  console.log(n, S.R.length, S.R[0].width + 'x' + S.R[0].height, 'ax', S.ax, 'ay', S.ay, 'ragged', r);
  if (r || (want && S.R.length !== want)) bad++;
  return sheet(S.R, { maxW: 8 * (S.R[0].width + 8), bg: '#2e3a40', pad: 6 });
});
const sc = 3, W = Math.max(...sheets.map(s => s.width)) * sc, H = sheets.reduce((a, s) => a + s.height + 4, 0) * sc;
const out = newCanvas(W, H), g = out.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#2e3a40'; g.fillRect(0, 0, W, H);
let y = 0; for (const s of sheets) { g.drawImage(s, 0, 0, s.width, s.height, 0, y, s.width * sc, s.height * sc); y += (s.height + 4) * sc; }
savePNG(out, process.argv[2] || new URL('../docs/lamplit2-art.png', import.meta.url));
if (bad) { console.log('FAIL'); process.exit(1); }
