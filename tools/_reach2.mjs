import { pathToFileURL } from 'node:url'; import path from 'node:path';
const imp = f => import(pathToFileURL(path.resolve(f)).href);
const { LEVELS, T } = await imp('src/level.js'); const { floodReach } = await imp('src/reachcore.js'); const { HERO_MOVE_IDS } = await imp('src/hero-move.js');
const L = LEVELS.find(l => l.id === 'crown').build();
const marks = [[790,80],[800,68],[784,68],[790,65],[803,56],[796,56],[784,44],[797,44],[803,32],[796,32],[792,19],[795,19],[800,19],[782,15],[830,15],[806,13],[806,16],[830,19],[834,19]];
for (const hero of [null, ...HERO_MOVE_IDS]) {
  const R = floodReach(L, T, { rides: true, hero: hero || undefined, seeds: [[784, 80]] });
  const miss = marks.filter(m => !R.seen.has(m[0] + ',' + m[1]));
  console.log((hero || 'any'), miss.length ? 'MISSING ' + miss.map(m => m.join(',')).join(' ') : 'all reached');
}
