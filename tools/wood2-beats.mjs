// tools/wood2-beats.mjs — pins BRACKEN WOOD's design-audit beats (claude/wood2), so a later merge can't silently
// lose them: item 1 DEVELOP (a badger on the tarn's far bank, charging back along the felled pine so a missed jump
// throws you into the water you just crossed), item 2 COMBINE (thorns on both lips of the hollow's stream, so the
// "a held jump is higher" sign finally asks for a jump that can fail), and item 3 TWIST (a second dead pine at the
// Hornet Queen's west wall, laid across the near comb as a third perch at her height) — docs/level-design/
// wood-to-highcrown-design.md, BRACKEN WOOD section, on origin/claude/designaudit (unmerged, not a path this branch
// can cite). Coordinates below are the level's BUILT (final) columns, after every grow() splice - not the raw
// numbers written in brackenWood()'s own source.
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';

const L = LEVELS.find(l => l.id === 'wood').build();
const at = (t, x, y) => L.ents.find(e => e.t === t && e.x === x && e.y === y);

// item 1, DEVELOP: a third badger, on the tarn's far bank right where the felled pine lands
const b = at('badger', 451, 14);
assert(b, 'a badger stands on the tarn\'s far bank, at the log\'s landing');
assert(b.face === -1, 'it starts facing back west, toward the pine and the water behind the player');
const tarnPool = L.pools.find(p => p.x0 === 436 * 16 && p.x1 === 447 * 16);
assert(tarnPool, 'the tarn it can throw you into is still the pool under the felled pine');
const pine1 = L.ents.find(e => e.t === 'felltree' && e.x === 435 && e.y === 14);
assert(pine1 && pine1.len === 14 && pine1.dir === 1, 'the one-tile pine it charges along still bridges the tarn (kept, not rebuilt)');

// item 2, COMBINE: a thorn on each lip of the hollow's stream (409-411), under the "held jump is higher" sign at 392
const nearThorn = at('thorn', 408, 14), farThorn = at('thorn', 412, 14);
assert(nearThorn && nearThorn.face === 1, 'a thorn guards the near lip of the stream');
assert(farThorn && farThorn.face === -1, 'a thorn guards the far lip of the stream');
const streamPool = L.pools.find(p => p.x0 === 409 * 16 && p.x1 === 412 * 16);
assert(streamPool, 'the stream between the two thorns is still open water, not a killzone');
const heldJumpSign = L.ents.find(e => e.t === 'sign' && e.x === 392 && /HELD JUMP/.test(e.text));
assert(heldJumpSign, 'the sign that teaches the held jump is still there, ahead of the crossing it now asks for');

// item 3, TWIST: a second dead pine at the Hornet Queen's west wall, inside the vines and before the fight's own trigger
const pine2 = L.ents.find(e => e.t === 'felltree' && e.x === 519 && e.y === 6);
assert(pine2 && pine2.len === 10 && pine2.dir === 1, 'a second pine stands at the arena\'s west wall, at comb height');
assert(L.arena.wallL === 517 && L.arena.trigger === 522 * 16, 'it stands past the west wall but short of the fight\'s own trigger, so it can be felled any time');
for (let x = pine2.x; x <= pine2.x + 1; x++) assert.equal(L.grid[3 * L.W + x], 0, 'it stands well under the Queen\'s ceiling, not fouling the comb-footing check');

console.log('BRACKEN WOOD (claude/wood2): the tarn badger (DEVELOP), the stream\'s flanking thorns (COMBINE), and the west-wall pine (TWIST) all verified.');
