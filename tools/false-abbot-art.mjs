// tools/false-abbot-art.mjs — THE FALSE ABBOT's sprite sheet rendered in Node, so his silhouette can be looked at
// without a browser: docs/false-abbot.png, 18 frames at 3x on the belfry's own stone, with the goblin priest beside
// frame 0 at the same scale (he is meant to read as the priest one size up, in a mitre that does not fit).
// usage: node tools/false-abbot-art.mjs
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { bakeFalseAbbot } = await import('../src/redraw/false_abbot.js');
const { bakeGoblinPriest } = await import('../src/redraw/monastery.js');

const S = bakeFalseAbbot(), P = bakeGoblinPriest();
const bad = S.R.filter(c => c.width !== S.R[0].width || c.height !== S.R[0].height);
console.log(JSON.stringify({ frames: S.R.length, size: S.R[0].width + 'x' + S.R[0].height, ax: S.ax, ay: S.ay, box: S.w + 'x' + S.h, ragged: bad.length }));
if (S.R.length !== 18) { console.log('FAIL: 18 frames expected'); process.exit(1); }
if (bad.length) { console.log('FAIL: frames are not one size'); process.exit(1); }

/* the sheet, and under it the two of them side by side at the same scale: the size gap IS the design */
const sh = sheet(S.R, { maxW: 6 * (S.R[0].width + 8), bg: '#3a3448', pad: 6 });
const scale = 3, pair = 140;
const out = newCanvas(Math.max(sh.width, pair) * scale, (sh.height + 70) * scale), g = out.getContext('2d');
g.imageSmoothingEnabled = false;
g.fillStyle = '#3a3448'; g.fillRect(0, 0, out.width, out.height);
g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * scale, sh.height * scale);
const by = (sh.height + 6) * scale;
g.fillStyle = '#2e2838'; g.fillRect(0, by, out.width, 64 * scale);
g.drawImage(S.R[0], 0, 0, S.R[0].width, S.R[0].height, 8 * scale, by, S.R[0].width * scale, S.R[0].height * scale);
g.drawImage(P.R[0], 0, 0, P.R[0].width, P.R[0].height, (8 + S.R[0].width + 6) * scale, by + (S.R[0].height - P.R[0].height) * scale, P.R[0].width * scale, P.R[0].height * scale);
savePNG(out, new URL('../docs/false-abbot.png', import.meta.url));
console.log('docs/false-abbot.png written (18 frames at 3x, and the priest beside him at the same scale)');
