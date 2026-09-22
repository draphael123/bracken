// tools/desert-v2.mjs — the five redrawn desert sprites (src/redraw/desert_v2.js) beside their first pass, x3, with the contract checked:
// the same frame count, anchor and hit box as the set each replaces. usage: node tools/desert-v2.mjs  -> docs/desert-v2.png
import { install, newCanvas, savePNG } from './node-canvas.mjs';
install();
const V = await import('../src/redraw/desert_v2.js'), G = await import('../src/redraw/desert_glass.js'), W = await import('../src/redraw/desert_west.js'), T = await import('../src/redraw/desert_tomb.js');
const pairs = [['colossus', G.bakeColossus(), V.bakeColossusV2()], ['sand warden', G.bakeSandWarden(), V.bakeSandWardenV2()], ['hourglass king', G.bakeHourglassKing(1), V.bakeHourglassKingV2(1)],
  ['gorge crab', W.bakeGorgeCrab(), V.bakeGorgeCrabV2()], ['fallen high priest', T.bakeFallenHighPriest(), V.bakeHighPriestV2()]];
let bad = 0; const sc = 3, rows = [];
for (const [n, a, b] of pairs) { const same = a.R.length === b.R.length && a.w === b.w && a.h === b.h && a.ax === b.ax && a.ay === b.ay;
  console.log(`${same ? '  ok  ' : '  FAIL'} ${n}: ${a.R.length} -> ${b.R.length} frames, anchor ${a.ax},${a.ay} -> ${b.ax},${b.ay}, box ${a.w}x${a.h} -> ${b.w}x${b.h}`); if (!same) bad++; rows.push([n + ' BEFORE', a.R], [n + ' AFTER', b.R]); }
const Wd = 2400, rowH = r => r[1][0].height * sc + 8, H = rows.reduce((s, r) => s + rowH(r) + 4, 0), c = newCanvas(Wd, H), g = c.getContext('2d'); g.fillStyle = '#3a3a44'; g.fillRect(0, 0, Wd, H);
let y = 2; for (const [, fr] of rows) { let x = 4; for (const f of fr) { if (x + f.width * sc > Wd) break; g.fillStyle = '#4a4a56'; g.fillRect(x, y, f.width * sc, f.height * sc); g.drawImage(f, x, y, f.width * sc, f.height * sc); x += f.width * sc + 4; } y += rowH([0, fr]) + 4; }
savePNG(c, new URL('../docs/desert-v2.png', import.meta.url)); process.exit(bad ? 1 : 0);
