// tools/wood2-beats.mjs — pins BRACKEN WOOD's design-audit beats (claude/wood2), so a later merge can't silently
// lose them: item 1 DEVELOP (a badger on the tarn's far bank, charging back along the felled pine so a missed jump
// throws you into the water you just crossed), item 2 COMBINE (the held jump asked for where a tapped one can fail), and
// item 3 TWIST (a second dead pine at the Hornet Queen's west wall, laid across the near comb as a third perch at her height).
// (claude/oldtusker, Daniel 10-19 21:42) THE HORNET QUEEN is parked and the clearing rebuilt for OLD TUSKER with no floating tree: item 3's TWIST is now the
// FELLING CLEARING's own - its marked pines stand at the edges and fall IN onto the boss (the trail's verb as his opening). Item 1's badger is a BOAR now
// (the same 'badger' AI under cnSkin 'boar').
// (claude/lumbertrail) THE LUMBER TRAIL rebuilt the wood in final columns (src/lumber-trail.js): the three beats are kept and
// re-pinned there. Item 2's old shape (thorns on both lips of the hollow's stream, under a "held jump" sign 17 columns back)
// went with the hollow; the held jump is asked for at the cabin gully's stair back up (three rows: a tapped jump falls short),
// and its sign stands in the gully, at the point of use. Coordinates are the level's BUILT columns.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { FELLS } from '../src/lumber-trail.js';

const L = LEVELS.find(l => l.id === 'wood').build();
const at = (t, x, y) => L.ents.find(e => e.t === t && e.x === x && e.y === y);
const tile = (x, y) => L.grid[y * L.W + x];

// item 1, DEVELOP: a badger on the tarn's far bank, right where the felled pine lands
const pine1 = L.ents.find(e => e.t === 'felltree' && e.role === 'tarn');
assert(pine1 && pine1.x === FELLS.tarn.x && pine1.dir === 1 && !pine1.head, 'the tarn pine still bridges the tarn level (kept, not rebuilt)');
const land = pine1.x + pine1.len;   /* the trunk's far end */
const b = L.ents.find(e => e.t === 'badger' && e.y === pine1.y && e.x > land && e.x <= land + 5);
assert(b && b.cnSkin === 'boar', 'a boar (the badger\'s AI, cnSkin boar) stands on the tarn\'s far bank, at the log\'s landing');
assert(b.face === -1, 'it starts facing back west, toward the pine and the water behind the player');
const tarnPool = L.pools.find(p => p.x0 / 16 > pine1.x && p.x1 / 16 <= land + 1 && !p.shallow);
assert(tarnPool && tarnPool.y / 16 > pine1.y + 2, 'the tarn it can throw you into is still deep water under the felled pine');

// item 2, COMBINE: the held jump is asked for where a tapped one fails - the gully's stair back up, three rows - and said there
const g = FELLS.gully, bed = 26;
let stairTop = null; for (let y = bed; y > g.y; y--) if (tile(g.x + 2, y + 1) !== T.AIR && tile(g.x + 2, y) === T.AIR) { stairTop = y; break; }
assert(stairTop !== null && bed - stairTop >= 2 && stairTop - g.y >= 1, 'the gully\'s near wall is a stair back up (each step a real jump)');
const held = L.ents.find(e => e.t === 'sign' && /HELD JUMP/.test(e.text) && e.x > g.x && e.x < g.x + g.len && e.y === bed);
assert(held, 'the sign that teaches the held jump stands in the gully, at the stair it asks for');

// item 3, TWIST (claude/oldtusker): THE FELLING CLEARING's marked pines - inside the walls, at both edges, leaning IN, and nothing standing in the air over the floor
const A = L.arena;
assert(A.boss === 'oldtusker' && Array.isArray(A.pines) && A.pines.length >= 3, 'the clearing has its marked pines (arena.pines) for OLD TUSKER');
for (const p of A.pines) { const x = p.col * 16 + 8; assert(x > A.x0 && x < A.x1 && p.dir === (x < (A.x0 + A.x1) / 2 ? 1 : -1), 'the pine at ' + p.col + ' stands inside the walls and leans in over the floor'); }
assert(!L.ents.some(e => e.t === 'felltree' && e.role === 'hive'), 'the old west-wall perch pine (the Queen\'s) is gone: no floating tree');

console.log('BRACKEN WOOD (claude/wood2, on THE LUMBER TRAIL): the tarn boar (DEVELOP), the held jump at the gully stair (COMBINE), and the felling clearing pines (TWIST) all verified.');
