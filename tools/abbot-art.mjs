// tools/abbot-art.mjs - THE FALSE ABBOT's chapel art (claude/abbotart), rendered and linted in Node. No browser.
//   MON3=1 is set here. node tools/abbot-art.mjs [out-prefix] -> <prefix>-poses.png, -westfront.png, -chapel.png, -chapel-fallen.png, -fx.png
process.env.MON3 = '1';
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { bakeFalseAbbot } = await import('../src/redraw/false_abbot.js');
const { bakeGoblinPriest } = await import('../src/redraw/monastery.js');
const bad = []; let n = 0; const out = process.argv[2];
const big = (c, s = 2) => { const o = newCanvas(c.width * s, c.height * s), g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(c, 0, 0, c.width, c.height, 0, 0, c.width * s, c.height * s); return o; };
const sig = c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, k = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { k++; h = (h * 31 + d[i] * 7 + d[i + 1] * 3 + d[i + 2] + i) >>> 0; } return { h, k }; };
/* 1. the poses: 23 frames unchanged with the flag off, 27 with it; the four new ones are their own drawings */
const S0 = bakeFalseAbbot(), S = bakeFalseAbbot(true); n++;
if (S0.R.length !== 23) bad.push('flag off: ' + S0.R.length + ' frames, not 23');
if (S.R.length !== 27) bad.push('flag on: ' + S.R.length + ' frames, not 27');
for (let i = 0; i < 23; i++) { n++; if (sig(S.R[i]).h !== sig(S0.R[i]).h) bad.push('frame ' + i + ' changed by the m3 bake'); }
const seen = new Set(); for (let i = 23; i < 27; i++) { n++; const k = sig(S.R[i]); if (k.k < 400) bad.push('pose ' + i + ' barely drawn'); for (let j = 0; j < 23; j++) if (sig(S.R[j]).h === k.h) bad.push('pose ' + i + ' == frame ' + j); if (seen.has(k.h)) bad.push('pose ' + i + ' repeats'); seen.add(k.h);
  if (sig(S.white.R[i]).k !== k.k) bad.push('pose ' + i + ': flash silhouette differs'); if (S.R[i].width !== 80 || S.R[i].height !== 66) bad.push('pose ' + i + ': size'); }
if (out) savePNG(big(sheet([S.R[3], S.R[4], S.R[14], S.R[15], S.R[10], ...S.R.slice(23)], { maxW: 560, bg: '#6a5a44', pad: 4 }), 2), out + '-poses.png');
console.log(n + ' checked, ' + bad.length + ' bad' + (bad.length ? '\n  ' + bad.join('\n  ') : '')); process.exit(bad.length ? 1 : 0);
