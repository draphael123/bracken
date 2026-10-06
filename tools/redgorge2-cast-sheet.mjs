// tools/redgorge2-cast-sheet.mjs - a contact sheet of OLD PLUME's poses (claude/redgorge2 art pass), baked in Node (no browser). Not in the suite.
//   usage: node tools/redgorge2-cast-sheet.mjs [out.png] [scale]      (the default writes work/claude/redgorge2-art/cast-sheet.png)
import { install, sheet, savePNG } from './node-canvas.mjs';
install();
const { bakeMatriarch } = await import('../src/redraw/matriarch_cast.js');
const C = bakeMatriarch(), out = process.argv[2] || 'work/claude/redgorge2-art/cast-sheet.png', scale = +(process.argv[3] || 3);
savePNG(sheet(C.poses.map(k => C.R[k]), { maxW: 6 * (C.W + 4) + 4, bg: '#7a4a5a', scale }), out);
console.log(C.poses.join(' '), '->', out);
