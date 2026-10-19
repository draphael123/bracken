// tools/church3art-sheet.mjs - claude/church3art's baked art in Node (not in the suite). usage: node tools/church3art-sheet.mjs <what: foes|props|deacon> <out.png> [scale]
import { install, sheet, savePNG } from './node-canvas.mjs'; install();
const what = process.argv[2] || 'foes', out = process.argv[3] || 'church3art.png', sc = +(process.argv[4] || 3);
let items = [];
if (what === 'foes') { const F = await import('../src/redraw/church3_foes_art.js'); items = F.sheetItems(); if (process.env.ONLY) items = process.env.ONLY.split(',').map(i => items[+i]); }
else if (what === 'props') { const F = await import('../src/redraw/church3_art.js'); items = F.sheetItems(); if (process.env.ONLY) items = process.env.ONLY.split(',').map(i => items[+i]); }
else if (what === 'deacon') { const D = await import('../src/redraw/deacon_art.js'); items = ['guard', 'sweepTell', 'douseTell', 'douse', 'kindleTell', 'grope'].map(k => D.bakePose(k).c); }
savePNG(sheet(items, { maxW: +(process.env.MAXW || 1400), bg: '#5a5870', pad: 4, scale: sc }), out); console.log('wrote ' + out + ' (' + items.length + ')');
