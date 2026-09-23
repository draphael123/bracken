// work/claude/render-worldmap.mjs — renders MAPC (all five sheets, baked) to PNG for a look before trusting it.
// "Node renders lie about light" (map-life-and-select §3) — this is the BAKED map only, no live overlay (smoke,
// birds, the panel, labels): those are text and motion, which node-canvas.mjs does not draw. It exists to check
// the GEOMETRY reads right: no corner, no limb, the seams, the desert sheet's style. The real thing wants the page.
// usage: node work/claude/render-worldmap.mjs
import fs from 'node:fs'; import vm from 'node:vm';
import { install, newCanvas, savePNG } from '../../tools/node-canvas.mjs';
install();
/* node-canvas.mjs deliberately throws on createRadialGradient/createLinearGradient - "a baker that needs them is
   caught rather than rendered wrong" - but bakeMap's parchment vignette and bakeWorldMap's seam both call the real
   canvas gradient API directly (not through px.js), which no baker has ever asked node-canvas to render before.
   This script is read-only geometry review, not a check, so it patches around it here rather than widening the
   shared tool's deliberate restriction: a gradient becomes a tagged no-op object, and a fill with one skips
   (loses the vignette/seam darkening only - every node, road and label position renders exactly). */
{ const proto = Object.getPrototypeOf(newCanvas(1, 1).getContext('2d'));
  proto.createRadialGradient = proto.createLinearGradient = function () { return { addColorStop() {}, __fakeGradient: true }; };
  const origFillRect = proto.fillRect;
  proto.fillRect = function (x, y, w, h) { if (this.fillStyle && this.fillStyle.__fakeGradient) return; origFillRect.call(this, x, y, w, h); }; }
const ART = await import('../../src/art.js');
const { LEVELS } = await import('../../src/level.js');

const src = fs.readFileSync(new URL('../../src/main.js', import.meta.url), 'utf8');
const ctx = vm.createContext({ LEVELS });
const slice = src.slice(src.indexOf('const MAPW ='), src.indexOf('const MAPC ='));
vm.runInContext(slice + '\nglobalThis.route = { MAPW, MAPH, DESERT_Y, INLAND_Y, COAST_Y, CRAG_Y, WOOD_Y,'
  + ' DESERT_NODES, INLAND_NODES, COAST_NODES, CRAG_NODES, WOOD_NODES,'
  + ' DESERT_PATH, INLAND_PATH, COAST_PATH, CRAG_PATH, WOOD_PATH };', ctx);
const { MAPW, MAPH, DESERT_Y, INLAND_Y, COAST_Y, CRAG_Y, WOOD_Y,
  DESERT_NODES, INLAND_NODES, COAST_NODES, CRAG_NODES, WOOD_NODES,
  DESERT_PATH, INLAND_PATH, COAST_PATH, CRAG_PATH, WOOD_PATH } = ctx.route;

const MAPC = ART.bakeWorldMap(MAPW, MAPH, [
  { x: 0, y: DESERT_Y, w: 320, h: 180, nodes: DESERT_NODES, path: DESERT_PATH, seed: 59, style: 'desert', seam: { y: INLAND_Y, gold: true } },
  { x: 0, y: INLAND_Y, w: 320, h: 180, nodes: INLAND_NODES, path: INLAND_PATH, seed: 47, style: 'haunted', seam: COAST_Y },
  { x: 0, y: COAST_Y, w: 320, h: 180, nodes: COAST_NODES, path: COAST_PATH, seed: 31, style: 'coast', seam: CRAG_Y },
  { x: 0, y: CRAG_Y, w: 320, h: 180, nodes: CRAG_NODES, path: CRAG_PATH, seed: 23, style: 'crag', seam: WOOD_Y },
  { x: 0, y: WOOD_Y, w: 320, h: 180, nodes: WOOD_NODES, path: WOOD_PATH, seed: 11, style: 'wood' },
], [
  [[40, 64 + WOOD_Y], [CRAG_PATH[0][0], 200 + CRAG_Y]], [[CRAG_PATH[0][0], 200 + CRAG_Y], [CRAG_PATH[0][0], CRAG_PATH[0][1] + CRAG_Y]],
  [[CRAG_PATH[CRAG_PATH.length - 1][0], CRAG_PATH[CRAG_PATH.length - 1][1] + CRAG_Y], [COAST_PATH[0][0], COAST_PATH[0][1] + COAST_Y]], [[140, 8 + COAST_Y], [140, 176 + INLAND_Y]],
  [[260, 34 + INLAND_Y], [274, 174 + DESERT_Y], 'sand'],
]);

const outDir = new URL('../../docs/', import.meta.url);
// the full stack, at 2x
{ const big = newCanvas(MAPW * 2, MAPH * 2); big.getContext('2d').drawImage(MAPC, 0, 0, big.width, big.height);
  savePNG(big, new URL('worldmap-full.png', outDir)); console.log('wrote worldmap-full.png', MAPW, 'x', MAPH); }
// each sheet on its own, at 3x, so a label or a corner is easy to read
const SHEETS = [['desert', DESERT_Y], ['inland', INLAND_Y], ['coast', COAST_Y], ['crag', CRAG_Y], ['wood', WOOD_Y]];
for (const [name, y] of SHEETS) {
  const crop = newCanvas(320, 180), cg = crop.getContext('2d'); cg.drawImage(MAPC, 0, y, 320, 180, 0, 0, 320, 180);
  const big = newCanvas(320 * 3, 180 * 3); big.getContext('2d').drawImage(crop, 0, 0, big.width, big.height);
  savePNG(big, new URL(`worldmap-${name}.png`, outDir)); console.log('wrote worldmap-' + name + '.png');
}
