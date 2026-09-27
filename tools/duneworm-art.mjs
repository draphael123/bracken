// tools/duneworm-art.mjs — THE DUNE WORM's sheet (src/redraw/desert_foes.js), rendered in Node on the hollow's sand at x3: his eleven frames
// in DW_F order (surfaced, spit tell, spit, breach, TANGLED, dive, lunge tell, swallow, surfacing, dead, hurt), the lunge's body in flight,
// and the ripple (running x2, COMMITTED, the sinkhole). Checks the contract (one canvas a set, every frame on its anchor row) and writes
// docs/duneworm/sheet.png. usage: node tools/duneworm-art.mjs [out.png]
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const D = await import('../src/redraw/desert_foes.js');
const sets = { worm: D.bakeDuneWorm(), lunge: D.bakeDuneWormLunge(), ripple: D.bakeDuneWormRipple() };
let bad = 0;
for (const [k, s] of Object.entries(sets)) {
  const w = s.R[0].width, h = s.R[0].height, low = s.R.map(c => { const d = c._d; for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) return y; return -1; });
  const ok = s.R.every(c => c.width === w && c.height === h) && low.every(y => y === s.ay - 1);
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${k}: ${s.R.length} frames ${w}x${h}, ax ${s.ax}, ay ${s.ay}`); if (!ok) bad++;
}
if (Object.keys(D.DW_F).length !== sets.worm.R.length) { console.log('  FAIL DW_F names ' + Object.keys(D.DW_F).length + ' frames, the sheet has ' + sets.worm.R.length); bad++; }
const all = [...sets.worm.R, sets.worm.L[0], ...sets.lunge.R, ...sets.ripple.R];
const sh = sheet(all, { maxW: 420, bg: '#e2bb7a', pad: 8 }), big = newCanvas(sh.width * 3, sh.height * 3); big.getContext('2d').drawImage(sh, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/duneworm/sheet.png', import.meta.url));
process.exit(bad ? 1 : 0);
