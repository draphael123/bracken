/* print a region of Stormhold: tiles, and '*' where the reach fill stands. node work/stormhold/region.mjs x0 x1 y0 y1 */
import { LEVELS, T } from '../../src/level.js';
import { floodReach } from '../../src/reachcore.js';
const [x0, x1, y0, y1] = process.argv.slice(2).map(Number);
const L = LEVELS.find(l => l.id === 'storm').build(), R = floodReach(L, T, { rides: true });
const ch = { [T.AIR]: '.', [T.SOLID]: '#', [T.ONEWAY]: '=', [T.NET]: 'H', [T.PORT]: '|', [T.PLANK]: '-', [T.SHELF]: '~' };
const ents = new Map(L.ents.filter(e => e.t !== 'coin' && e.t !== 'deco').map(e => [e.x + ',' + e.y, e.t[0].toUpperCase()]));
for (let y = y0; y <= y1; y++) { let row = String(y).padStart(3) + ' ';
  for (let x = x0; x <= x1; x++) { const k = x + ',' + y; row += ents.get(k) && L.grid[y * L.W + x] === T.AIR ? ents.get(k) : R.seen.has(k) && L.grid[y * L.W + x] === T.AIR ? '*' : (ch[L.grid[y * L.W + x]] ?? '?'); }
  console.log(row); }
console.log('    ' + Array.from({ length: x1 - x0 + 1 }, (_, i) => String((x0 + i) % 10)).join(''));
