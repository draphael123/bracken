// tools/desert-west-art.mjs — THE WELL TOWN's and THE RED GORGE's creatures and bosses (src/redraw/desert_west.js)
// rendered in Node: every frame, right-facing then the flip, on a sand-coloured sheet, x3. Also checks the
// contract: each sprite's frames share one canvas size and put their lowest pixel on ay-1 (flyers hang from one
// box, so they're excused). usage: node tools/desert-west-art.mjs [out.png]
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const D = await import('../src/redraw/desert_west.js');
const FLYERS = new Set(['cliffRaptor', 'roc']);
const sprites = {
  bandit: D.bakeBandit(), banditArcher: D.bakeBanditArcher(), waterThief: D.bakeWaterThief(),
  cliffRaptor: D.bakeCliffRaptor(), gorgeCrab: D.bakeGorgeCrab(),
  banditKing: D.bakeBanditKing(), roc: D.bakeRoc(),
};
let bad = 0;
for (const [k, s] of Object.entries(sprites)) {
  const w = s.R[0].width, h = s.R[0].height;
  const low = s.R.map(c => { const d = c._d; for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) return y; return -1; });
  const sizeOk = s.R.every(c => c.width === w && c.height === h), anchorOk = low.every(y => y === s.ay - 1) || FLYERS.has(k);
  console.log(`${sizeOk && anchorOk ? '  ok  ' : '  FAIL'} ${k}: ${s.R.length} frames ${w}x${h}, ax ${s.ax}, ay ${s.ay}, lowest rows ${[...new Set(low)].join('/')}`);
  if (!sizeOk || !anchorOk) bad++;
}
// the props: bakeOilFire's patch/knife/jar, bakeRocFX's shadow/quill and bakeArrow — not packed sprites, just canvases
const fx = D.bakeOilFire(), rocFx = D.bakeRocFX(), arrow = D.bakeArrow();
console.log(`  --   oilFire: patch ${fx.patch.length}x ${fx.patch[0].width}x${fx.patch[0].height}, knife ${fx.knife.width}x${fx.knife.height}, jar ${fx.jar.width}x${fx.jar.height}`);
console.log(`  --   rocFx: shadow ${rocFx.shadow.length}x ${rocFx.shadow[0].width}x${rocFx.shadow[0].height}, quill ${rocFx.quill.width}x${rocFx.quill.height}`);
console.log(`  --   arrow: ${arrow.width}x${arrow.height}`);

const all = [
  ...Object.values(sprites).flatMap(s => [...s.R, ...s.L.slice(0, 2)]),
  ...fx.patch, fx.knife, fx.jar, ...rocFx.shadow, rocFx.quill, arrow,
];
const sh = sheet(all, { maxW: 480, bg: '#e8cc94', pad: 6 }), big = newCanvas(sh.width * 3, sh.height * 3);
big.getContext('2d').drawImage(sh, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/desert-west.png', import.meta.url));
process.exit(bad ? 1 : 0);
