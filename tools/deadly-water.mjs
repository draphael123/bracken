/* tools/deadly-water.mjs — A POOL YOU CANNOT CLIMB OUT OF IS MARKED DEADLY, AND ONLY THAT POOL (2026-09-21).
   Daniel: the Falling Tower's cistern killed in one go and looked like every other poison water, which does not. For every
   harmful pool of every level: src/deadly-water.js poolTraps() (can a hero standing on its bed jump to footing clear of the
   water?) must agree with the pool's own `deadly` flag - the flag is what draws the deadly look and makes it kill on entry. */
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { poolTraps } from '../src/deadly-water.js';
const bad = [], rows = [];
for (const lv of LEVELS) { if (lv.hidden && !lv.secret) continue; let L; try { L = lv.build(); } catch { continue; }
  for (const p of L.pools || []) { if (!p.harm) continue; const trap = poolTraps(L, p, T), flag = !!p.deadly;
    rows.push(lv.id + '@' + (p.x0 / 16) + (trap ? ' TRAP' : '') + (flag ? ' deadly' : ''));
    if (trap !== flag) bad.push(lv.id + ' pool ' + p.x0 / 16 + '-' + p.x1 / 16 + ': ' + (trap ? 'nobody can climb out of it, but it is not marked deadly' : 'it is marked deadly, but it can be climbed out of')); } }
assert.deepEqual(bad, [], bad.join('\n'));
const deadly = rows.filter(r => r.includes('deadly'));
assert.ok(deadly.length >= 1, 'the Falling Tower cistern is the deadly one');
console.log(rows.length + ' harmful pools; deadly (and marked): ' + deadly.join(', '));
