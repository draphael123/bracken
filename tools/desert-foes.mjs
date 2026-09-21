// tools/desert-foes.mjs — the Sunken Caravan's creatures and boss (src/redraw/desert_foes.js) rendered in Node: every
// frame, right-facing then the flip, on a sand-coloured sheet, x3. Also checks the contract: each sprite's frames share
// one canvas size and put their lowest pixel on ay-1 (so the anchor holds). usage: node tools/desert-foes.mjs [out.png]
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const D = await import('../src/redraw/desert_foes.js');
const sprites = { scorpion: D.bakeScorpion(), vulture: D.bakeVulture(), sandGoblin: D.bakeSandGoblin(), duneWorm: D.bakeDuneWorm(), duneWormLunge: D.bakeDuneWormLunge() };
let bad = 0;
for (const [k, s] of Object.entries(sprites)) {
  const w = s.R[0].width, h = s.R[0].height;
  const low = s.R.map(c => { const d = c._d; for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) return y; return -1; });
  const sizeOk = s.R.every(c => c.width === w && c.height === h), anchorOk = low.every(y => y === s.ay - 1) || k === 'vulture';   /* a flyer has no floor: its frames hang from the same box */
  console.log(`${sizeOk && anchorOk ? '  ok  ' : '  FAIL'} ${k}: ${s.R.length} frames ${w}x${h}, ax ${s.ax}, ay ${s.ay}, lowest rows ${[...new Set(low)].join('/')}`);
  if (!sizeOk || !anchorOk) bad++;
}
const all = Object.values(sprites).flatMap(s => [...s.R, ...s.L.slice(0, 2)]);
const sh = sheet(all, { maxW: 400, bg: '#e8cc94', pad: 6 }), big = newCanvas(sh.width * 3, sh.height * 3); big.getContext('2d').drawImage(sh, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/desert-foes.png', import.meta.url));
process.exit(bad ? 1 : 0);
