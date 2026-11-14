// tools/title-bake.mjs - THE TITLE'S GRADIENT BAKE (claude/small1113). Drives src/title-bake.js with a stub 2D context over 300 simulated title
// frames and counts createRadialGradient: the old title built 2 per frame (glow + vignette = 600); the bake builds one per distinct glow step and
// one for the vignette (<= GLOW_STEPS + 1), and the fallback (no canvas) keeps the old path. Also checks the baked glow radius stays within 0.5 px
// of the old exact radius (46 + sin*2 -> 44..48 in GLOW_STEPS steps), so no band and no pop.
// usage: node tools/title-bake.mjs
import assert from 'node:assert/strict';
import { makeTitleBake, GLOW_STEPS, glowStep } from '../src/title-bake.js';
const stub = counter => { const ctx = { gradients: 0, draws: 0, createRadialGradient() { counter.n++; return { addColorStop() {} }; }, fillRect() { }, drawImage() { ctx.draws++; }, fillStyle: null, globalCompositeOperation: 'source-over' }; return ctx; };
const FRAMES = 300;
// before: the old per-frame path, as the title ran it
{ const cnt = { n: 0 }, g = stub(cnt); for (let f = 0; f < FRAMES; f++) { const time = f / 60 * 3; g.createRadialGradient(138, 152, 2, 138, 152, 46 + Math.sin(time * 11) * 2); g.createRadialGradient(160, 90, 60, 160, 90, 220); } assert.equal(cnt.n, FRAMES * 2); console.log('before: createRadialGradient calls over ' + FRAMES + ' frames = ' + cnt.n); }
// after: with a canvas factory (every baked canvas counts its own gradient calls)
{ const cnt = { n: 0 }; const bake = makeTitleBake((w, h) => { const c = stub(cnt); return { width: w, height: h, getContext: () => c }; });
  const g = stub({ n: 0 }); const seen = new Set();
  for (let f = 0; f < FRAMES; f++) { const time = f / 60 * 3; seen.add(glowStep(time)); bake.glow(g, 138, 152, time); bake.vignette(g, 320, 180); }
  assert.equal(g.draws, FRAMES * 2, 'every frame blits both layers');
  assert.equal(cnt.n, seen.size + 1, 'one gradient per distinct glow step plus one vignette');
  assert.ok(cnt.n <= GLOW_STEPS + 1, 'bounded by the number of flicker steps');
  const before = cnt.n; for (let f = 0; f < FRAMES; f++) { bake.glow(g, 138, 152, f * 0.013); bake.vignette(g, 320, 180); } assert.ok(cnt.n <= GLOW_STEPS + 1 && cnt.n >= before, 'a second run builds nothing beyond the step set');
  console.log('after: createRadialGradient calls over ' + FRAMES + ' frames = ' + cnt.n + ' (distinct glow steps ' + seen.size + ' + 1 vignette; cap ' + (GLOW_STEPS + 1) + ')'); }
// the quantised radius never strays more than half a step from the exact one
{ let worst = 0; for (let f = 0; f < 5000; f++) { const t = f * 0.0137, exact = 46 + Math.sin(t * 11) * 2, k = glowStep(t), r = 44 + k * 4 / (GLOW_STEPS - 1); worst = Math.max(worst, Math.abs(exact - r)); } assert.ok(worst <= 4 / (GLOW_STEPS - 1) / 2 + 1e-9, 'glow radius error ' + worst); console.log('worst glow radius error ' + worst.toFixed(3) + ' px'); }
// fallback: no canvas at all -> the old per-frame gradient path (2 per frame), no throw
{ const cnt = { n: 0 }, g = stub(cnt), bake = makeTitleBake(() => null); for (let f = 0; f < 10; f++) { bake.glow(g, 138, 152, f * 0.1); bake.vignette(g, 320, 180); } assert.equal(cnt.n, 20); console.log('fallback (no canvas): per-frame gradients kept, ok'); }
console.log('title-bake ok');
