// tools/kings2-beats.mjs — pins KINGSWOOD's design-audit beats (claude/kings2), so a later merge can't silently
// lose them: fork one's high-road plate and cage (item 1), fork two's TWIST - the plate moved to the canopy, its
// cage falling through a hatch onto the roots, and a second cracked post over the pike (item 2), the hunting
// stands' second cracked post and both stand archers now covering the rope walk (item 3, DEVELOP), and the
// processional's plate and cage over the carpet guards with a tippable brazier and a firepit in the grass
// (item 4, EXAM) - docs/level-design/wood-to-highcrown-design.md, KINGSWOOD section, on origin/claude/designaudit
// (unmerged, not a path this branch can cite). Coordinates below are the level's BUILT (final) columns, after
// every grow() splice - not the raw numbers written in kingswood()'s own source.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';

const L = LEVELS.find(l => l.id === 'kings').build();
const near = (t, x, y, r = 3) => L.ents.some(e => e.t === t && Math.abs(e.x - x) <= r && Math.abs(e.y - y) <= r);

// item 1: fork one's high road gets its own plate and cage, over the thief who already stood there
assert(near('thief', 160, 7), 'the high-road thief still stands where fork one always had him');
assert(L.ents.some(e => e.t === 'dropcage' && e.x === 160 && e.y === 3), 'a cage hangs over him, up in the canopy');
assert(L.ents.some(e => e.t === 'plate' && e.cage === 160), 'and a plate on the ledge road drops it');
assert.equal(L.grid[8 * L.W + 160], T.SOLID, 'the thief\'s ledge is solid now, so the cage has something to land on');

// item 2: fork two's TWIST — the plate moves to the canopy, its cage drops through a hatch onto the roots
assert(L.ents.some(e => e.t === 'plate' && e.x === 454 && e.y === 9 && e.cage === 454), 'the canopy holds the plate now, not the roots');
assert(L.ents.some(e => e.t === 'dropcage' && e.x === 454 && e.y === 4), 'its cage waits high in the canopy');
assert.equal(L.grid[13 * L.W + 453], T.AIR, 'the hatch is cut through the roof between canopy and roots');
assert.equal(L.grid[13 * L.W + 454], T.AIR, 'the hatch is two tiles wide');
assert(near('brute', 454, 20), 'the brute is the patrol the cage falls on, on the roots floor');
assert(!L.ents.some(e => e.t === 'plate' && e.y === 20 && e.x > 440 && e.x < 460), 'the old roots-side plate is gone, not duplicated');
assert(L.ents.some(e => e.t === 'timber' && e.x0 === 418 && e.x1 === 422), 'a second cracked post stands over the pike in the roots');

// item 3, DEVELOP: the hunting stands get a second cracked post, and both stand archers cover the rope walk
assert(L.ents.some(e => e.t === 'timber' && e.x0 === 355 && e.x1 === 359), 'a second cracked post opens the hunting stands');
assert(near('sprig', 357, 13), 'a patrol stands under it');
const archers = L.ents.filter(e => e.t === 'archer' && e.y === 5 && e.x >= 358 && e.x <= 388);
assert.equal(archers.length, 2, 'both stand archers are still there');
assert(archers.some(a => a.face === 1), 'the near-tower archer now faces east, toward the rope walk');
assert(archers.some(a => a.face === -1), 'the far-tower archer still faces west, toward the rope walk from her side');

// item 4, EXAM: the processional's plate and cage over the carpet guards, a brazier to tip, a firepit in the grass
assert(L.ents.some(e => e.t === 'brazier' && e.x === 580 && e.y === 13), 'a brazier stands with the carpet guards');
assert(L.ents.some(e => e.t === 'dropcage' && e.x === 580 && e.y === 5), 'a cage hangs over them');
assert(L.ents.some(e => e.t === 'plate' && e.x === 583 && e.cage === 580), 'the loft-step plate drops it');
assert(L.ents.some(e => e.t === 'firepit' && e.x === 578 && e.y === 13), 'the grass burns near the fire archer, not just in the sign\'s promise');

console.log('KINGSWOOD (claude/kings2): fork one\'s high-road plate and cage, fork two\'s TWIST (canopy plate, hatch, second post), the hunting stands\' second post and covered rope walk, and the processional\'s EXAM all verified.');
