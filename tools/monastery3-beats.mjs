// tools/monastery3-beats.mjs — pins THE MONASTERY's design-audit beats (claude/monastery3) so a later merge can't
// silently lose them: the drawbridge's harpy/fledgling/priest, the bellows' loose masonry, the bell yard's plate-
// and-cage trap, the crawl's third wheel between two priests' flocks (with its own incense and troll), and the
// warmth fix to the level's palette (the design audit's THE MONASTERY section and its game-wide pattern 1 - on
// origin/claude/designaudit, unmerged, not a path this branch can cite).
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';

const L = LEVELS.find(l => l.id === 'spire').build();
const near = (t, x, y, r = 4) => L.ents.some(e => e.t === t && Math.abs(e.x - x) <= r && Math.abs(e.y - y) <= r);

// plan 1: THE DRAWBRIDGE, DEVELOPED — a harpy and a fledgling over it, a priest at its far end
assert(near('harpy', 24, 112), 'a harpy flies over the drawbridge');
assert(near('fledgling', 36, 114), 'a fledgling flies over the drawbridge');
assert(near('gobpriest', 42, 117), 'a priest waits on the far tower floor, at the bridge\'s far end');

// plan 2: COMBINE INCENSE AND LOOSE MASONRY — a stal hangs over the first bellows plume's landing
assert.equal(L.grid[67 * L.W + 17], T.SOLID, 'a lip is cut into the bellows shaft, over the landing');
assert(L.ents.some(e => e.t === 'stal' && e.x === 17 && e.y === 68), 'and a loose stone hangs off it, in the plume');

// plan 3 + the exam (game-wide pattern 1): A THIRD WHEEL in the crawl, between two priests' flocks
assert(L.ents.some(e => e.t === 'pwheel' && e.pivot && e.pivot[0] === 77 && e.pivot[1] === 34), 'the third wheel stands in the crawl');
assert(near('gobpriest', 71, 35) && near('gobpriest', 80, 35, 6), 'two priests flock either side of the third wheel');
assert(near('troll', 73, 35), 'a troll stands by the wheel, in one flock');
assert(L.ents.some(e => e.t === 'vent' && e.incense && Math.abs(e.x - 74) <= 3 && e.y >= 30 && e.y <= 40), 'incense carries you up past the wheel, in the exam');

// Daniel's backlog: FAILING STONE, in the upper ruins (the scaffold up the east face, off the shrines' ledge)
assert(L.crumbles.some(c => c.x0 === 59 && c.x1 === 62 && c.row === 72), 'a scaffold board fails, in the upper ruins');

// Daniel's backlog: PRESSURE PLATES — Kingswood's plate-and-cage, replanted in the bell yard (cheap: same prop pair)
assert(L.ents.some(e => e.t === 'plate' && e.cage === 60), 'a plate sits in the bell yard');
assert(L.ents.some(e => e.t === 'dropcage' && e.x === 60), 'and its cage hangs over it, on the same column');

// the washed-out palette: a small warmth fix, not a rework — still 'crag', still the same keys
const pal = LEVELS.find(l => l.id === 'spire').build().palette;
assert.equal(pal.dress, 'crag');
assert.notEqual(pal.dirt, '#6a625a', 'the stone is warmer than it was');
assert.notEqual(pal.canopy[0], '#5a5650', 'the canopy is warmer than it was');

console.log('THE MONASTERY (claude/monastery3): drawbridge population, bellows loose masonry, the third wheel\'s exam cluster, the bell yard\'s plate-and-cage, and the palette warmth fix all verified.');
