// tools/tower-flyers.mjs - NO FLYER OVER A PLATFORMING STRETCH IN THE FALLING TOWER (round 3; src/tower-flyers.js is the rule). Node only.
// Every flyer in the BUILT level - the builder's and the sprinkler's - must start over flat ground (overFlat), none may start in the
// desert past the second door, and the tower still has flyers (the TOMES are its own new foe: they are kept, on the floors).
//   node tools/tower-flyers.mjs          the check           node tools/tower-flyers.mjs --list      every flyer, and where
import { LEVELS, T } from '../src/level.js';
import { TOWER, SAND } from '../src/tower-ascent.js';
import { TOWER_FLYERS, overFlat } from '../src/tower-flyers.js';
const L = LEVELS.find(l => l.id === 'fallingtower').build(), fails = [];
const floor = y => (L.towerFloors.find(f => y >= f.top - 2 && y < f.bot + 1) || {}).name || (y <= SAND.deep ? 'THE DESERT' : 'THE SKY');
const fly = L.ents.filter(e => TOWER_FLYERS.has(e.t));
for (const e of fly) { const ok = overFlat(L, T, e.x, e.y);
  if (process.argv.includes('--list')) console.log((ok ? '  flat  ' : '  OVER  ') + e.t.padEnd(6) + String(e.x).padStart(3) + ',' + String(e.y).padEnd(4) + floor(e.y) + (e.garrison ? ' (sprinkled)' : ''));
  if (!ok) fails.push(e.t + ' at ' + e.x + ',' + e.y + ' (' + floor(e.y) + (e.garrison ? ', sprinkled' : '') + ') is over a platforming stretch, not flat ground');
  if (e.y <= SAND.deep) fails.push(e.t + ' at ' + e.x + ',' + e.y + ' starts in the desert past the second door'); }
const all = L.ents.filter(e => !['coin', 'silver', 'check', 'sign', 'gate', 'deco', 'glyph', 'stal', 'undeadmage', 'sexton'].includes(e.t) && e.y <= SAND.deep);
for (const e of all) if (!TOWER_FLYERS.has(e.t)) fails.push(e.t + ' at ' + e.x + ',' + e.y + ' starts in the desert past the second door');
if (!fly.some(e => e.t === 'tome')) fails.push('no tome is left in the tower: the tomes are its own foe - keep them, on the floors');
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log(fails.length + ' FAILED'); process.exitCode = 1; }
else console.log('ok  tower-flyers   ' + fly.length + ' flyers in the Falling Tower, every one over flat ground (' + [...new Set(fly.map(e => floor(e.y)))].length + ' floors), none over a stair and none in the desert');
