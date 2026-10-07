// tools/redgorge2-cast-sheet.mjs - a contact sheet of OLD PLUME's poses and CYCLES (claude/redgorge2 art pass; claude/matriarch2 art: every key is a cycle), baked in Node (no browser). Not in the suite.
//   usage: node tools/redgorge2-cast-sheet.mjs [out.png] [scale] [key,key,...]      (the default writes docs/redgorge2-art/matriarch2-cycles.png: one row a pose key, its frames left to right)
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs';
install();
const { bakeMatriarch } = await import('../src/redraw/matriarch_cast.js');
const C = bakeMatriarch(), out = process.argv[2] || 'docs/redgorge2-art/matriarch2-cycles.png', scale = +(process.argv[3] || 1), only = process.argv[4] ? process.argv[4].split(',') : null;
const items = [], maxN = Math.max(...C.poses.map(k => C.count(k)));
for (const k of C.poses) { if (only && !only.includes(k)) continue; for (let i = 0; i < maxN; i++) items.push(i < C.count(k) ? C.get(k, i, false, false) : newCanvas(C.W, C.H)); }
const rows = items.length / maxN;
savePNG(sheet(items, { maxW: maxN * (C.W + 4) + 4, bg: '#7a4a5a', scale }), out);
console.log(C.poses.map(k => k + ' x' + C.count(k)).join(' | '), '->', out, '(' + rows + ' rows)');
