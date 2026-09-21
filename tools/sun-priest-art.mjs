// tools/sun-priest-art.mjs — THE SUN PRIEST's concept frames (src/redraw/sun_priest.js) rendered in Node, x4, on a light sheet and a
// dark one (so the lit and dimmed looks can be judged where they would be seen). usage: node tools/sun-priest-art.mjs [out.png]
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { bakeSunPriest } = await import('../src/redraw/sun_priest.js');
const S = bakeSunPriest(); const lit = sheet([...S.R], { maxW: 460, bg: '#9cc4e4', pad: 6 }), dark = sheet([S.R[0], S.R[6], S.R[8], S.R[12]], { maxW: 460, bg: '#1e1a26', pad: 6 });
const out = newCanvas(lit.width, lit.height + dark.height), g = out.getContext('2d'); g.drawImage(lit, 0, 0); g.drawImage(dark, 0, lit.height);
const big = newCanvas(out.width * 4, out.height * 4); big.getContext('2d').drawImage(out, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/sun-priest-concept.png', import.meta.url)); console.log('sun-priest-art:', S.R.length, 'frames');
