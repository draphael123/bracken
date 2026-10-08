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

// plan 2, REWORKED (claude/monastery2, review M3/M5 - the lip was a grass slab in open sky and caught you two rows over the board): the first
// plume LANDS you on its board, with room to stand, and a missed second plume falls back onto that board; the bellows' upper braziers are EMBER
// braziers (their coals bring a harpy over them down), the middle one cold until struck
for (const x of [16, 17, 18, 20, 24, 26]) { assert.equal(L.grid[69 * L.W + x], T.ONEWAY, 'the first plume landing board runs under the second plume (' + x + ',69)'); assert.notEqual(L.grid[68 * L.W + x], T.SOLID, 'with room to stand on it (' + x + ',68)'); }
assert(L.ents.some(e => e.t === 'vent' && e.incense && e.x === 19 && e.ember && e.snuff) && L.ents.some(e => e.t === 'vent' && e.incense && e.x === 25 && e.ember), 'the bellows ember braziers');

// plan 3 + the exam, REBUILT (claude/monastery2, review M2 + idea 3: the crawl's wheel hung under the roof, no board of it could be stood on): the
// LAST WHEEL's stair is the way up the roof's well to the ringing floor, over a thorn pit that is a real death (an exam span), an elite troll on it
const w3 = L.ents.find(e => e.t === 'pwheel' && e.pivot && e.pivot[0] === 42 && e.pivot[1] === 35);
assert(w3, 'the last wheel stands in the roof well');
for (const [x0, y, w] of [...w3.a, ...w3.b]) for (let x = x0; x < x0 + w; x++) if (L.grid[y * L.W + x] !== T.SOLID) assert.notEqual(L.grid[(y - 1) * L.W + x], T.SOLID, 'every board of its stair can be stood on (' + x + ',' + y + ')');
for (const x of [38, 39, 40]) assert.equal(L.grid[37 * L.W + x], T.SPIKE, 'a thorn pit under its stair (' + x + ',37)');
assert((L.examSpans || []).some(s => s[0] <= 38 && s[1] >= 40), 'and the pit is an exam span: its thorns are a real death');
assert(L.ents.some(e => e.t === 'troll' && Math.abs(e.x - 41) <= 2 && Math.abs(e.y - 32) <= 2), 'a troll holds its stair');
/* THE SPRINKLE CUT (Daniel, 2026-09-29, "FEWER, BETTER FOES"; src/foe-tactics.js SPRINKLE/PLAN): the second priest east of the wheel was the garrison
   sprinkler's, not the builder's, and the halved row no longer puts one there. The exam keeps its hand-placed priest and troll by the wheel, and the
   crawl's section (rows 0-59) is held by a DESIGNED squad with a priest behind its melee instead (tools/sprinkle-cap.mjs holds every section to one). */
assert(L.ents.some(e => e.t === 'gobpriest' && Math.abs(e.x - 42) <= 8 && Math.abs(e.y - 35) <= 3), 'a priest flocks by the last wheel');
assert(L.ents.some(e => e.t === 'gobpriest' && e.squad && !e.garrison && e.y < 60) && (L.squadBands || []).filter(b => b.lo < 60).every(b => b.designed), 'and the crawl\'s section stands a designed squad with a priest behind its melee');
assert(!L.ents.some(e => e.t === 'vent' && L.grid[(e.y + 1) * L.W + e.x] === T.AIR), 'no brazier hangs a tile off the floor (the crawl one, which lifted nobody)');

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
