import { install, savePNG } from '../../tools/node-canvas.mjs';
install();
const { bakeScalder } = await import('../../src/redraw/scalder.js');
const S = bakeScalder(), fr = S.R, sc = 6, pad = 4;
const w = fr.reduce((a, c) => a + c.width + pad, pad), h = Math.max(...fr.map(c => c.height)) + pad * 2;
const out = document.createElement('canvas'); out.width = w * sc; out.height = h * sc; const g = out.getContext('2d');
g.fillStyle = '#4a4a58'; g.fillRect(0, 0, out.width, out.height);
let x = pad; for (const c of fr) { g.drawImage(c, 0, 0, c.width, c.height, x * sc, pad * sc, c.width * sc, c.height * sc); x += c.width + pad; }
savePNG(out, 'docs/stormhold/scalder-sheet.png'); console.log('ok', fr.length, fr[0].width, fr[0].height);
