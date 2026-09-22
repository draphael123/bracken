// tools/desert-glass-art.mjs — THE GLASS SEA / THE BURIED CITY's creatures, minis and bosses (src/redraw/desert_glass.js)
// rendered in Node: every frame, right-facing then the flip, on a sand-coloured sheet, x3. Checks the contract: each
// sprite's frames share one canvas size and put their lowest pixel on ay-1. usage: node tools/desert-glass-art.mjs [out.png]
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const D = await import('../src/redraw/desert_glass.js');
const sprites = {
  glassScorpion: D.bakeGlassScorpion(), shard: D.bakeShard(), nightHunter: D.bakeNightHunter(), sandDrowned: D.bakeSandDrowned(),
  construct: D.bakeConstruct(), stalker: D.bakeStalker(), colossus: D.bakeColossus(), sandWarden: D.bakeSandWarden(),
  hourglassKingFull: D.bakeHourglassKing(0), hourglassKingHalf: D.bakeHourglassKing(1), hourglassKingLow: D.bakeHourglassKing(2),
};
let bad = 0;
for (const [k, s] of Object.entries(sprites)) {
  const w = s.R[0].width, h = s.R[0].height;
  const low = s.R.map(c => { const d = c._d; for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) return y; return -1; });
  const sizeOk = s.R.every(c => c.width === w && c.height === h), anchorOk = low.every(y => y === s.ay - 1);
  console.log(`${sizeOk && anchorOk ? '  ok  ' : '  FAIL'} ${k}: ${s.R.length} frames ${w}x${h}, ax ${s.ax}, ay ${s.ay}, lowest rows ${[...new Set(low)].join('/')}`);
  if (!sizeOk || !anchorOk) bad++;
}
// effects/props: not creature packs, just rendered for a look, no contract check
const sunLance = D.bakeSunLance(), shelf = D.bakeShelf(), cog = D.bakeCog();
console.log(`  --   sunLance: ${sunLance.length} frames ${sunLance[0].width}x${sunLance[0].height}`);
console.log(`  --   shelf: 1 frame ${shelf.width}x${shelf.height}`);
console.log(`  --   cog: ${cog.length} frames ${cog[0].width}x${cog[0].height}`);

const rows = [];
for (const [k, s] of Object.entries(sprites)) rows.push(...s.R, ...s.L.slice(0, 2));
rows.push(...sunLance, shelf, ...cog);
const sh = sheet(rows, { maxW: 480, bg: '#e8cc94', pad: 6 }), big = newCanvas(sh.width * 3, sh.height * 3);
big.getContext('2d').drawImage(sh, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/desert-glass.png', import.meta.url));
process.exit(bad ? 1 : 0);
