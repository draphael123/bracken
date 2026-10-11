import { install, sheet, savePNG } from '../../../tools/node-canvas.mjs';
install();
const M = await import('../../../src/redraw/lich.js');
const B = M.bakeUndeadMage();
savePNG(sheet(B.R, { scale: 3, maxW: 1100 }), process.argv[2]);
console.log(B.R.length, 'frames');
