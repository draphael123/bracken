// tools/killzones.mjs — CAN YOU STAND HERE AND LIVE?
// Every tool before this asked "can you get there". None asked "and when you do, does the level kill you for it" -
// which is how the Undercrown's flooded level spent rounds killing everyone who walked into the Pit Warden's arena
// a hundred and ten rows under it. This takes every tile the reach fill says you can stand on and asks the level's
// own static rules whether a hero standing there dies with no creature in sight:
//   a POOL you drown in   - standing BELOW a pool's water (under its bottom or depth) in its columns is a bug; standing
//                           on the bed INSIDE its water is the pool doing its job, and is not reported
//   a POOL with no floor  - a deadly pool with neither bottom nor depth leans on the rock scan in main.js: reported if
//                           any reachable ground lies in its columns below it, so a missing number is seen, not felt
//   a SPIKE in the body   - spikes in the two tiles a standing hero fills
//   the WORLD'S FLOOR     - standing below the last row
// A runtime sweep of the same tiles, with the real loop, is BK.killLab() in the browser (src/lab.js).
//   node tools/killzones.mjs            every level, failures only
//   node tools/killzones.mjs <id>       one level
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const TS = 16, want = process.argv[2];
let bad = 0;
for (const lv of LEVELS) {
  if (lv.hidden && !lv.secret) continue;
  if (want && lv.id !== want) continue;
  let L; try { L = lv.build(); } catch (e) { console.log('== ' + lv.id + ': build failed ' + e.message); bad++; continue; }
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  const solid = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.SOFT || t === T.ICE || t === T.WEB || t === T.CLIMB;
  const { seen } = floodReach(L, T);
  const hits = new Map();
  const note = (why, x, y) => { if (!hits.has(why)) hits.set(why, []); hits.get(why).push(x + ',' + y); };
  const deadly = (L.pools || []).filter(p => !p.shallow && !p.swim && !p.dry);
  for (const k of seen) {
    const [x, y] = k.split(',').map(Number);          /* (x, y) is the cell the hero's feet stand in; the floor is y+1 */
    const px = x * TS + 8, py = (y + 1) * TS;          /* P.x, P.y as main.js keeps them */
    for (const p of deadly) {
      if (!(px > p.x0 && px < p.x1 && py > p.y + 9)) continue;
      const floorPx = p.bottom !== undefined ? p.bottom + 4 : p.depth !== undefined ? p.y + p.depth + 6 : null;
      if (floorPx === null) note('stands under a deadly pool with no bottom or depth set (surface y ' + p.y + ')', x, y);
      /* inside the water (the pool's own bed) is the pool working; below its floor the game no longer kills, and says so here */
    }
    if (at(x, y) === T.SPIKE || at(x, y - 1) === T.SPIKE) note('stands in spikes', x, y);
    if (py > H * TS + 30) note('is below the world', x, y);
  }
  if (!hits.size) { if (want) console.log('== ' + lv.id + ': every reachable footing is safe to stand on'); continue; }
  for (const [why, cells] of hits) { bad++; console.log('== ' + lv.id + ': ' + cells.length + ' reachable tile(s) where a hero ' + why + ': ' + cells.slice(0, 8).join(' ') + (cells.length > 8 ? ' ...' : '')); }
}
console.log(bad ? '\n' + bad + ' kill zone(s) on reachable ground.' : 'no reachable tile kills a standing hero.');
process.exitCode = bad ? 1 : 0;
