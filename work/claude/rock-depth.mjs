// how deep into rock does each line carry a 14x18 rider, and where
import { LEVELS, T } from '../../src/level.js';
import { OR, makeCableway, lineYAt } from '../../src/ore-road.js';
const TS = 16, L = LEVELS.find(l => l.id === 'oreroad').build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
for (const l of makeCableway(L.cable).lines) { if (l.drum) continue;
  const xs = l.pts.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), hits = [];
  for (let x = x0; x <= x1; x += 1) { const y = lineYAt(l, x); let d = 0;
    for (let c = Math.floor((x - 7) / TS); c <= Math.floor((x + 6) / TS); c++) if (at(c, Math.floor((y - 1) / TS)) === T.SOLID) d = Math.max(d, y - Math.floor((y - 1) / TS) * TS);
    if (d) hits.push([Math.round(x), +(x / TS).toFixed(1), +d.toFixed(1)]); }
  const from = l.pts[0][0] / TS, to = l.pts[l.pts.length - 1][0] / TS;
  console.log(l.id, 'from', from, 'to', to, 'hits', hits.length ? `${hits[0][1]}..${hits[hits.length - 1][1]} max depth ${Math.max(...hits.map(h => h[2]))}px` : 'none');
  const groups = []; for (const h of hits) { const g = groups[groups.length - 1]; if (g && h[0] - g.b <= 2) { g.b = h[0]; g.d = Math.max(g.d, h[2]); } else groups.push({ a: h[0], b: h[0], d: h[2] }); }
  for (const g of groups) console.log('   cols', (g.a / TS).toFixed(1), '-', (g.b / TS).toFixed(1), 'depth', g.d.toFixed(1), 'px');
}
