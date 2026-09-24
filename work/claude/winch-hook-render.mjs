// work/claude/winch-hook-render.mjs — renders THE HOOK's two frames (src/redraw/winchmaster.js bakeWinchHook) to PNG,
// beside the Winchmaster himself, so Daniel can see it with no browser. Not in the suite.
import { install, newCanvas, sheet, savePNG } from '../../tools/node-canvas.mjs';
install();
const { bakeWinchmaster, bakeWinchHook } = await import('../../src/redraw/winchmaster.js');
const S = bakeWinchmaster(), K = bakeWinchHook();
console.log(JSON.stringify({ hookFrames: K.R.length, size: K.R[0].width + 'x' + K.R[0].height, ax: K.ax, ay: K.ay }));
if (K.R.length !== 2) { console.log('FAIL: 2 hook frames expected'); process.exit(1); }
const sh = sheet(S.R, { maxW: 7 * (S.R[0].width + 8), bg: '#4a4450', pad: 6 });
const kh = sheet([...K.R, ...K.L], { maxW: 4 * (K.R[0].width + 8), bg: '#4a4450', pad: 6 });
const scale = 6, out = newCanvas(Math.max(sh.width * 3, kh.width * scale), (sh.height * 3 + kh.height * scale + 10)), g = out.getContext('2d');
g.imageSmoothingEnabled = false; g.fillStyle = '#4a4450'; g.fillRect(0, 0, out.width, out.height);
g.drawImage(sh, 0, 0, sh.width, sh.height, 0, 0, sh.width * 3, sh.height * 3);
g.drawImage(kh, 0, 0, kh.width, kh.height, 0, sh.height * 3 + 6, kh.width * scale, kh.height * scale);
savePNG(out, new URL('../../docs/winchmaster-hook.png', import.meta.url));
console.log('docs/winchmaster-hook.png written: the winchmaster at 3x above, the hook (R,R,L,L at 6x) below');
