// tools/flotilla4art-sheet.mjs - THE ADMIRAL's plate stages / openings and THE POWDER MONKEY's poses in Node (claude/flotilla4art; not in the suite). No browser.
//   node tools/flotilla4art-sheet.mjs <outdir>
import { install, newCanvas, savePNG } from './node-canvas.mjs';
import { mkdirSync } from 'fs';
import { join } from 'path';
install();
const out = process.argv[2] || 'work/tmp-flotilla4/sheets'; mkdirSync(out, { recursive: true });
const A = await import('../src/redraw/admiral_art.js'), M = await import('../src/redraw/powder_monkey_art.js');
const S = 4;
function sheet(cells, cols, CW, CH, bg) { const rows = Math.ceil(cells.length / cols), cv = newCanvas(cols * CW * S, rows * CH * S), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  cells.forEach((fn, i) => { const c = newCanvas(CW, CH), q = c.getContext('2d'); q.fillStyle = bg || '#5a4a7a'; q.fillRect(0, 0, CW, CH); q.fillStyle = '#8a6a48'; q.fillRect(0, CH - 14, CW, 14); q.fillStyle = '#b09468'; q.fillRect(0, CH - 14, CW, 1); fn(q, CW, CH);
    g.drawImage(c, 0, 0, CW, CH, (i % cols) * CW * S, Math.floor(i / cols) * CH * S, CW * S, CH * S); }); return cv; }
const stages = [[], [0], [0, 1], [0, 1, 2]];
savePNG(sheet(stages.map(off => (q, W, H) => A.drawAdmiral(q, 55, H - 14, 1, { mode: 'recover', p: 0, off }, 1.3)), 4, 110, 80), join(out, 'admiral_stages.png'));
const open = ['stagger', 'reload', 'soaked', 'axeStuck', 'flat', 'axeRec'];
for (const [nm, off] of [['on', []], ['bare', [0, 1, 2]]]) savePNG(sheet(open.filter(m => off.length || !['axeStuck', 'axeRec'].includes(m)).flatMap(m => [0.2, 0.9, 1.7].map(t => (q, W, H) => A.drawAdmiral(q, 60, H - 14, 1, { mode: m, p: 0.5, off }, t))), 6, 120, 80), join(out, 'admiral_open_' + nm + '.png'));
const P = M.PMA_ALL;
savePNG(sheet(P.concat(['scurry', 'idle']).map((p, i) => (q, W, H) => M.drawMonkey(q, 24, H - 14, 1, p, i >= P.length ? 0.35 : 0.1, false)), 5, 48, 40), join(out, 'monkey_poses.png'));
savePNG(sheet([0.9, 0.5, 0.2, 0.05].map((k, i) => (q, W, H) => { q.beginPath = q.arc = q.stroke = () => {}; M.drawGrenade(q, 24, H - 14, k * 2.5, 2.5, i * 0.07, false); }).concat([(q, W, H) => M.drawGrenade(q, 24, H - 14, 1.5, 2.5, 0.1, true)]), 5, 48, 40), join(out, 'grenade.png'));
console.log('wrote', out);
