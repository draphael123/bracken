// tools/lamplit2-zoom.mjs — chosen frames of the Lamplit bosses at a big scale: node tools/lamplit2-zoom.mjs out.png reeve:14,15,16 toll:13,14 watch:7 [scale]
import { install, sheet, savePNG, newCanvas } from './node-canvas.mjs';
install();
const { bakeLampreeve, bakeTollmaster, bakeWatch } = await import('../src/redraw/city.js');
const B = { reeve: bakeLampreeve(), toll: bakeTollmaster(), watch: bakeWatch() };
const out = process.argv[2], sc = +(process.argv.find(a => /^\d+$/.test(a)) || 6);
const fr = []; for (const a of process.argv.slice(3)) { const m = /^(\w+):([\d,]+)$/.exec(a); if (m) for (const i of m[2].split(',')) fr.push(B[m[1]].R[+i]); }
const sh = sheet(fr, { maxW: 6 * (fr[0].width + 6), bg: '#2e3a40', pad: 4 });
const o = newCanvas(sh.width * sc, sh.height * sc), g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, o.width, o.height);
savePNG(o, out);
