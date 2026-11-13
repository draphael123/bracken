// tools/gq5p-sheet.mjs - the Princess's ten blade-move frames (GQ5P) as one contact sheet, no browser: BRACKEN_GQ5P=1 node tools/gq5p-sheet.mjs [out.png]
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs';
process.env.BRACKEN_GQ5P = '1'; install();
const GPA = await import('../src/redraw/goblin_princess_art.js');
const out = process.argv[2] || 'work/claude/lane-done/gq5p-sheet.png', P = GPA.sheet(), F = GPA.GPF;
const keys = ['heelTell', 'heel', 'curtsyTell', 'curtsyLow', 'curtsyRise', 'tantrumTell', 'slashA', 'slashB', 'overTell', 'overhead'];
const sh = sheet(keys.map(k => P.R[F[k]]), { maxW: 940, bg: '#2a2a3c', pad: 4, scale: 2 });
savePNG(sh, out); console.log('gq5p-sheet: ' + keys.join(' | ') + ' -> ' + out);
