// tools/deacon-art-sheet.mjs - THE DEACON's baked sheet in Node (claude/church2art; not in the suite): every pose with its flame laid over it.
//   usage: node tools/deacon-art-sheet.mjs <out.png> [scale]
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs';
install();
const out = process.argv[2] || 'deacon-art-sheet.png', sc = +(process.argv[3] || 3);
const A = await import('../src/redraw/deacon_art.js');
const items = [];
const only = (process.argv[4] || '').split(',').filter(Boolean); for (const k of Object.keys(A.POSES)) { if (only.length && !only.includes(k)) continue; const B = A.bakePose(k); const c = newCanvas(A.W, A.H), g = c.getContext('2d'); g.drawImage(B.c, 0, 0); if (B.flame) A.drawFlame(g, B.flame[0], B.flame[1] - 2, k.startsWith('arc') ? 8 : 6, 0.3, !!B.P.holy); items.push(c); }
savePNG(sheet(items, { maxW: +(process.env.MAXW || 1500), bg: '#5a5870', pad: 4, scale: sc }), out); console.log('wrote ' + out + ' (' + items.length + ')');
