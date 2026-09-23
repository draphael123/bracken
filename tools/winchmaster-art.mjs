// tools/winchmaster-art.mjs — THE WINCHMASTER's sprite sheet (and the miner's four new frames) rendered in Node, so the
// silhouettes can be looked at without a browser: docs/winchmaster.png at 3x on the Ore Road's rock.
// usage: node tools/winchmaster-art.mjs
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { bakeWinchmaster } = await import('../src/redraw/winchmaster.js');
const { bakeMiner } = await import('../src/chars.js');

const S = bakeWinchmaster(), M = bakeMiner();
const bad = S.R.filter(c => c.width !== S.R[0].width || c.height !== S.R[0].height);
console.log(JSON.stringify({ frames: S.R.length, size: S.R[0].width + 'x' + S.R[0].height, ax: S.ax, ay: S.ay, box: S.w + 'x' + S.h, ragged: bad.length, minerFrames: M.R.length }));
if (S.R.length !== 13) { console.log('FAIL: 13 frames expected'); process.exit(1); }
if (bad.length) { console.log('FAIL: frames are not one size'); process.exit(1); }
if (M.R.length !== 8) { console.log('FAIL: the miner should have 8 frames (4 new: bare x2, throw tell, helpless)'); process.exit(1); }
const sh = sheet(S.R, { maxW: 7 * (S.R[0].width + 8), bg: '#4a4450', pad: 6 }), ms = sheet(M.R, { maxW: 8 * (M.R[0].width + 8), bg: '#4a4450', pad: 6 });
const scale = 3, out = newCanvas(Math.max(sh.width, ms.width) * scale, (sh.height + ms.height + 6) * scale), g = out.getContext('2d');
g.imageSmoothingEnabled = false; g.fillStyle = '#4a4450'; g.fillRect(0, 0, out.width, out.height);
g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * scale, sh.height * scale);
g.drawImage(ms, 0, 0, ms.width, ms.height, 0, (sh.height + 6) * scale, ms.width * scale, ms.height * scale);
savePNG(out, new URL('../docs/winchmaster.png', import.meta.url));
console.log('docs/winchmaster.png written (13 frames, and the miner\'s 8 under them)');
