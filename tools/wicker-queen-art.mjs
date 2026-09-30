// tools/wicker-queen-art.mjs - THE WICKER QUEEN's sprite sheet rendered in Node (claude/fair3), so her silhouette can be looked at without a browser:
// work/claude/fair3/wicker-queen-sheet.png, her 14 frames at 3x on the green's dusk, with a mummer beside frame 0 at the same scale.
// usage: node tools/wicker-queen-art.mjs
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const { bakeWickerQueen } = await import('../src/redraw/wicker_queen.js');
const { bakeMummer } = await import('../src/redraw/fair_art.js');
const S = bakeWickerQueen(), M = bakeMummer();
const bad = S.R.filter(c => c.width !== S.R[0].width || c.height !== S.R[0].height);
console.log(JSON.stringify({ frames: S.R.length, size: S.R[0].width + 'x' + S.R[0].height, ax: S.ax, ay: S.ay, box: S.w + 'x' + S.h, ragged: bad.length }));
if (S.R.length !== 14 || bad.length) { console.log('FAIL: 14 frames of one size expected'); process.exit(1); }
const sh = sheet(S.R, { maxW: 7 * (S.R[0].width + 8), bg: '#3a2e44', pad: 6 }), scale = 3;
const out = newCanvas(sh.width * scale, (sh.height + S.R[0].height + 12) * scale), g = out.getContext('2d');
g.imageSmoothingEnabled = false; g.fillStyle = '#3a2e44'; g.fillRect(0, 0, out.width, out.height);
g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * scale, sh.height * scale);
const by = (sh.height + 6) * scale; g.fillStyle = '#2a2234'; g.fillRect(0, by, out.width, (S.R[0].height + 6) * scale);
g.drawImage(S.R[0], 0, 0, S.R[0].width, S.R[0].height, 8 * scale, by, S.R[0].width * scale, S.R[0].height * scale);
g.drawImage(M.R[0], 0, 0, M.R[0].width, M.R[0].height, (8 + S.R[0].width + 4) * scale, by + (S.R[0].height - M.R[0].height) * scale, M.R[0].width * scale, M.R[0].height * scale);
savePNG(out, new URL('../work/claude/fair3/wicker-queen-sheet.png', import.meta.url));
console.log('work/claude/fair3/wicker-queen-sheet.png written');
