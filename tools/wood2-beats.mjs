// tools/wood2-beats.mjs — pins BRACKEN WOOD's design-audit beats (claude/wood2), so a later merge can't silently
// lose them: item 1 DEVELOP (a badger on the tarn's far bank, charging back along the felled pine so a missed jump
// throws you into the water you just crossed), item 2 COMBINE (the held jump asked for where a tapped one can fail), and
// item 3 TWIST (a second dead pine at the Hornet Queen's west wall, laid across the near comb as a third perch at her height).
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
assert(b, 'a badger stands on the tarn\'s far bank, at the log\'s landing');
assert(b.face === -1, 'it starts facing back west, toward the pine and the water behind the player');
const tarnPool = L.pools.find(p => p.x0 / 16 > pine1.x && p.x1 / 16 <= land + 1 && !p.shallow);
assert(tarnPool && tarnPool.y / 16 > pine1.y + 2, 'the tarn it can throw you into is still deep water under the felled pine');

// item 2, COMBINE: the held jump is asked for where a tapped one fails - the gully's stair back up, three rows - and said there
const g = FELLS.gully, bed = 26;
let stairTop = null; for (let y = bed; y > g.y; y--) if (tile(g.x + 2, y + 1) !== T.AIR && tile(g.x + 2, y) === T.AIR) { stairTop = y; break; }
assert(stairTop !== null && bed - stairTop >= 2 && stairTop - g.y >= 1, 'the gully\'s near wall is a stair back up (each step a real jump)');
const held = L.ents.find(e => e.t === 'sign' && /HELD JUMP/.test(e.text) && e.x > g.x && e.x < g.x + g.len && e.y === bed);
assert(held, 'the sign that teaches the held jump stands in the gully, at the stair it asks for');

// item 3, TWIST: a second dead pine at the Hornet Queen's west wall, inside the vines and before the fight's own trigger
const pine2 = L.ents.find(e => e.t === 'felltree' && e.role === 'hive');
assert(pine2 && pine2.len === 10 && pine2.dir === 1 && pine2.y === 6, 'a second pine stands at the arena\'s west wall, at comb height');
assert(L.arena.wallL < pine2.x && L.arena.trigger > pine2.x * 16, 'it stands past the west wall but short of the fight\'s own trigger, so it can be felled any time');
for (let x = pine2.x; x <= pine2.x + 1; x++) assert.equal(L.grid[3 * L.W + x], 0, 'it stands well under the Queen\'s ceiling, not fouling the comb-footing check');

console.log('BRACKEN WOOD (claude/wood2, on THE LUMBER TRAIL): the tarn badger (DEVELOP), the held jump at the gully stair (COMBINE), and the west-wall pine (TWIST) all verified.');
