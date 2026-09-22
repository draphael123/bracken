// tools/desert-tomb-art.mjs — the desert tomb's undead (src/redraw/desert_tomb.js) rendered in Node: every frame,
// right-facing then the flip, on a sand-coloured sheet, x3. Checks the contract: each creature sprite's frames share
// one canvas size and (grounded ones) put their lowest pixel on ay-1. FX bakers (hands, bolts, jars, splashes, the
// sand hump, the acid glob) are rendered for a look but not contract-checked the same way — most are props or
// projectiles, not creatures. usage: node tools/desert-tomb-art.mjs [out.png]
import { install, newCanvas, sheet, savePNG } from './node-canvas.mjs';
install();
const D = await import('../src/redraw/desert_tomb.js');

const creatures = {
  mummy: D.bakeMummy(), scarabSwarm: D.bakeScarabSwarm(), jackalGuard: D.bakeJackalGuard(), skeletonGuard: D.bakeSkeletonGuard(),
  priestOfKing: D.bakePriestOfKing(), shadowThing: D.bakeShadowThing(), fallenPriest: D.bakeFallenPriest(),
  fallenHighPriest: D.bakeFallenHighPriest(), embalmer: D.bakeEmbalmer(), scarabMother: D.bakeScarabMother(),
};
const FLYERS = new Set(['shadowThing']);   // hang from one box: no floor to settle to (the house's vulture exception)

let bad = 0;
for (const [k, s] of Object.entries(creatures)) {
  const w = s.R[0].width, h = s.R[0].height;
  const low = s.R.map(c => { const d = c._d; for (let y = c.height - 1; y >= 0; y--) for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3]) return y; return -1; });
  const sizeOk = s.R.every(c => c.width === w && c.height === h), anchorOk = FLYERS.has(k) || low.every(y => y === s.ay - 1);
  console.log(`${sizeOk && anchorOk ? '  ok  ' : '  FAIL'} ${k}: ${s.R.length} frames ${w}x${h}, ax ${s.ax}, ay ${s.ay}, lowest rows ${[...new Set(low)].join('/')}`);
  if (!sizeOk || !anchorOk) bad++;
}

// FX: rendered for the look, and a light size-consistency check per group (not the anchor rule — most don't touch a floor)
const fx = { shadowHands: D.bakeShadowHands(), shadowBolt: D.bakeShadowBolt(), embalmerJar: D.bakeEmbalmerJar(), scarabFX: D.bakeScarabFX() };
for (const [k, v] of Object.entries(fx)) {
  const groups = Array.isArray(v) ? { frames: v } : v.R ? { R: v.R, L: v.L } : v;   // { R,L } bolt/glob, { jar:{R,L}, splash:[] } etc.
  for (const [gk, arr] of Object.entries(groups)) {
    if (!Array.isArray(arr)) { for (const [gk2, arr2] of Object.entries(arr)) checkFX(`${k}.${gk}.${gk2}`, arr2); continue; }
    checkFX(`${k}.${gk}`, arr);
  }
}
function checkFX(name, arr) { if (!arr.length) return; const w = arr[0].width, h = arr[0].height; const ok = arr.every(c => c.width === w && c.height === h);
  console.log(`${ok ? '  ok  ' : '  FAIL'} ${name}: ${arr.length} frames ${w}x${h}`); if (!ok) bad++; }

// the sheet: every creature's R frames, then two of its L frames, one row of the FX
const rows = [];
for (const s of Object.values(creatures)) rows.push(...s.R, ...s.L.slice(0, 2));
rows.push(...D.bakeShadowHands());
const bolt = D.bakeShadowBolt(); rows.push(...bolt.R, ...bolt.L.slice(0, 1));
const jar = D.bakeEmbalmerJar(); rows.push(...jar.jar.R, ...jar.splash);
const sfx = D.bakeScarabFX(); rows.push(...sfx.hump, ...sfx.glob.R);

const sh = sheet(rows, { maxW: 420, bg: '#e8cc94', pad: 6 }), big = newCanvas(sh.width * 3, sh.height * 3);
big.getContext('2d').drawImage(sh, 0, 0, big.width, big.height);
savePNG(big, process.argv[2] || new URL('../docs/desert-tomb.png', import.meta.url));
process.exit(bad ? 1 : 0);
