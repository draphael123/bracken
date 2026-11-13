/* tools/saltlook-perf.mjs <outjson> <ids,comma> - LEVEL LOAD + SCROLL FRAME COST IN THE REAL PAGE (claude/saltlook). Not in the suite.
   Loads a throwaway level first, then for each id: cold BK.load ms (the first load of that id in this page), 2 warm loads, canvases made by a load, and ms per BK.step(1)
   (update + render) while the hero is put on every 6th pacing-route node and the page runs 24 frames there (the camera scrolls the level end to end). BRACKEN_LW3=1 LW3=1 for Saltreach on. */
import { openPage, ROOT } from './cdp.mjs';
import { pacing } from './pacing.mjs';
import { LEVELS } from '../src/level.js';
import { writeFileSync } from 'fs';
const [outf, idsArg] = process.argv.slice(2), ids = (idsArg || 'longwater').split(',');
const routes = {}; for (const id of ids) { const lv = LEVELS.find(l => l.id === id); routes[id] = pacing(lv).route.filter((_, i) => i % 6 === 0); }
const pg = await openPage({ audio: false, fonts: false, seed: 5 });
const res = {};
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { const C = Document.prototype.createElement, ce = C; window.__made = 0; Document.prototype.createElement = function (t, ...x) { if (String(t).toLowerCase() === 'canvas') window.__made++; return ce.call(this, t, ...x); }; BK.load(__LV.findIndex(l => l.id === 'wood')); BK.start(); return true; })()`);
  for (const id of ids) {
    const r = await pg.evalp(`(() => { const at = __LV.findIndex(l => l.id === ${JSON.stringify(id)}); const out = {};
      const ld = () => { window.__made = 0; const t0 = performance.now(); BK.load(at); const t1 = performance.now(); BK.start(); BK.god = true; BK.step(1); return { loadMs: +(t1 - t0).toFixed(0), firstFrameMs: +(performance.now() - t1).toFixed(0), canvases: window.__made }; };
      out.cold = ld(); out.warm1 = ld(); out.warm2 = ld(); out.W = BK.L.W; out.kit = !!BK.L.lw3Kit; return out; })()`, 600000);
    const frames = await pg.evalp(`(() => { BK.sim(40); const det = [], ms = [], pts = ${JSON.stringify(routes[id])}; for (const [x, y] of pts) { BK.tp(x, y); BK.step(2); const t0 = performance.now(); for (let k = 0; k < 24; k++) BK.step(1); ms.push((performance.now() - t0) / 24); const d0 = performance.now(); for (let k = 0; k < 24; k++) BK.draw1(); det.push([x, y, +ms[ms.length - 1].toFixed(1), +((performance.now() - d0) / 24).toFixed(1)]); }
      const det0 = det; ms.sort((a, b) => a - b); const q = p => +ms[Math.min(ms.length - 1, Math.floor(ms.length * p))].toFixed(2); return { det, n: ms.length, mean: +(ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(2), p50: q(0.5), p95: q(0.95), max: +ms[ms.length - 1].toFixed(2) }; })()`, 600000);
    res[id] = { ...r, frames }; console.log(id, JSON.stringify(res[id]));
  }
  res.errors = (pg.errors || []).slice(0, 10); console.log('console errors:', JSON.stringify(res.errors));
  writeFileSync(outf, JSON.stringify(res, null, 1));
} finally { await pg.close(); }
