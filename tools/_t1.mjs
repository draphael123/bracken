import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
{ const P = Object.getPrototypeOf(newCanvas(2, 2).getContext('2d')); P.rotate = function () {}; }
const CH = await import('../src/chars.js');
const GPA = await import('../src/redraw/goblin_princess_art.js');
const Q = CH.bakeGoblinQueen(), P = GPA.bakeGoblinPrincess();
const big = (list, s = 3) => { const sh = sheet(list, { maxW: 1000, bg: '#4a4a5a' }), c = newCanvas(sh.width * s, sh.height * s); c.getContext('2d').drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * s, sh.height * s); return c; };
savePNG(big([...P.R.slice(38, 45), ...Q.R.slice(41, 51)], 2), process.argv[2]);
console.log(P.R.length, Q.R.length);
