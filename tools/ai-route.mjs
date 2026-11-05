// tools/ai-route.mjs - node-only: the AI partner's route graph (claude/coopai, main.js allyRoute) on real levels: build time, and that a path from the start footing to
// footing a few columns on (any row) is found and cheap. No browser. node tools/ai-route.mjs [levelId,...]
import { LEVELS, T } from '../src/level.js';
import { makeGraph } from '../src/walk-graph.js';
const ids = process.argv[2] ? process.argv[2].split(',') : ['wood', 'marsh', 'storm', 'hanging', 'skyroad'];
let bad = 0;
for (const id of ids) {
  const lv = LEVELS.find(l => l.id === id); if (!lv) { console.log('  skip ' + id); continue; }
  const L = lv.build(), t0 = performance.now(), G = makeGraph(L, T), t1 = performance.now();
  const sx = L.START.x, sy = L.START.y; const a = G.near(sx, sy, 1, 2);
  let found = 0, tried = 0, maxMs = 0, vert = 0;
  for (let dx = 6; dx <= 60; dx += 6) for (let dy = -6; dy <= 6; dy += 3) {
    const b = G.near(sx + dx, sy + dy, 1, 1); if (b < 0 || a < 0) continue; tried++;
    const q0 = performance.now(), p = G.path(a, v => v === b, 320), q1 = performance.now(); maxMs = Math.max(maxMs, q1 - q0);
    if (p) { found++; if (p.some(c => c[1] !== p[0][1])) vert++; } }
  console.log(`  ${id}: graph ${(t1 - t0).toFixed(0)} ms, footing at start ${a >= 0}, paths ${found}/${tried} (${vert} change row), slowest path ${maxMs.toFixed(1)} ms`);
  if (a < 0 || !found) bad++;
  if (t1 - t0 > 1500) { console.log('  FAIL graph build over 1.5 s on ' + id); bad++; }
  if (maxMs > 40) { console.log('  FAIL a path took over 40 ms on ' + id); bad++; }
}
console.log(bad ? 'FAIL ' + bad : 'ALL OK'); process.exit(bad ? 1 : 0);
