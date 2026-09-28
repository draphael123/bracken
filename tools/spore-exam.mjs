// tools/spore-exam.mjs — SPOREWOOD's second half and its EXAM, node-only (the design audit's sec.4 plan, plus GAME-WIDE
// PATTERNS item 1: the last stretch before a boss must be an exam, not a rest). spore-loop.mjs already holds the rebuild's
// rule (taught, leaned, dripped, paid off in her room); this holds what the audit found still missing on top of it:
//   1. TWIST the lurker: the "SOME CAPS ARE LURKERS" sign reads before the dripping stair, not after it, and one of the
//      stair's own landings holds a lurker.
//   2. COMBINE in the bog: a leaning cap over the middle sink, under its own spore fall, where the weaver already spits.
//   3. DEVELOP the pillars: a lurker waits among the two floor caps, not past them. (A curtain gating each cap on a
//      cut was tried and reverted - checkpoint-stand.mjs's real jump (5 columns, not the model's 6) found it sitting
//      in the only jump's arc over the gaps either side, cutting the route in two. See the level's own comment.)
//   4. EXAM, out of the Deep Gills to her door: a spore fall over the second sprout, the spitcap and weaver already
//      holding the ledge, and a leaning cap over a carved sink - growcap both ways, a fall, and a foe, all in the same
//      short stretch, and every foot of it stays reachable (floodReach, the same model pacing.mjs walks the route with).
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const L = LEVELS.find(l => l.id === 'spore').build();
const at = (x, y) => L.grid[y * L.W + x];
const near = (t, x, y, r = 2) => L.ents.some(e => e.t === t && Math.abs(e.x - x) <= r && Math.abs(e.y - y) <= r);

// -- 1. TWIST the lurker --
const twistSign = L.ents.find(e => e.t === 'sign' && e.x === 244 && /SOME CAPS ARE LURKERS/.test(e.text || ''));
assert(twistSign, 'the "some caps are lurkers" sign did not move to the stair\'s mouth (244)');
assert(!L.ents.some(e => e.t === 'sign' && e.x === 286 && /SOME CAPS ARE LURKERS/.test(e.text || '')), 'the old lurker sign is still at 286 too');
assert(L.ents.some(e => e.t === 'lurker' && e.x >= 245 && e.x <= 284), 'no lurker stands on the dripping stair (245-284)');

// -- 2. COMBINE in the bog --
const bogLean = L.moversExtra.filter(m => m.kind === 'growcap' && m.lean && m.x / 16 >= 330 && m.x / 16 <= 372);
assert(bogLean.length >= 1, 'no leaning cap over the bog (330-372)');
assert(L.ents.some(e => e.t === 'rockfall' && e.spore && e.x >= 330 && e.x <= 372), 'no spore fall over the bog\'s leaning cap');
assert(near('weaver', bogLean[0].x / 16, 9, 4), 'the bog\'s weaver is not near the leaning cap it is meant to spit at');

// -- 3. DEVELOP the pillars --
// the pillars' own quiet stretch, wherever the earlier "the drone gauntlet" section landed after the bog and the Tumble
// grew in front of it: found by its own sign ("THE PILLARS..."), which the rebuild already moved onto it.
const pillarSign = L.ents.find(e => e.t === 'sign' && /THE PILLARS/.test(e.text || ''));
assert(pillarSign, 'cannot find the pillars\' sign to anchor the section');
const pStart = pillarSign.x, pEnd = pillarSign.x + 40;
assert(L.ents.some(e => e.t === 'lurker' && e.x >= pStart && e.x <= pEnd), 'no lurker waits among the pillars\' floor caps');

// -- 4. EXAM: the last stretch before her door --
const A = L.arena;
const examX0 = 448, examX1 = A.wallL;
assert(L.ents.some(e => e.t === 'rockfall' && e.spore && e.x >= examX0 && e.x < examX1), 'no spore fall between the Gills and her door');
assert(L.ents.some(e => ['spitcap', 'weaver'].includes(e.t) && e.x >= examX0 && e.x < examX1), 'nothing holds the ledge in the exam stretch');
const examLean = L.moversExtra.find(m => m.kind === 'growcap' && m.lean && m.x / 16 >= examX0 && m.x / 16 < examX1);
assert(examLean, 'no leaning cap in the exam stretch (' + examX0 + '-' + examX1 + ')');
const examPlain = L.moversExtra.some(m => m.kind === 'growcap' && !m.lean && !m.mother && m.x / 16 >= 448 && m.x / 16 < examX0 + 10);
assert(examPlain, 'the exam stretch does not grow a cap both ways (a plain step, and a leaning one)');

// the carved sink has a floor (nothing here is bottomless): a bouncer under the gap the leaning cap crosses
const gapX0 = Math.floor(examLean.x / 16), gapX1 = Math.floor((examLean.x + examLean.lean) / 16);
let hasFloor = false;
for (let x = gapX0; x <= gapX1; x++) for (let y = 0; y < L.H; y++) if (at(x, y) === T.BOUNCER) hasFloor = true;
assert(hasFloor, 'the exam\'s leaning cap crosses a gap with no spring at the bottom');

// -- reachability: everything this level's own beats touch still sits inside the route's fill, start to her door,
// with a REAL JUMP (5 columns, not the model's 6 - the same stricter model checkpoint-stand.mjs holds every
// checkpoint to, which is what caught the pillars' webbed caps blocking the route the first time this was written) --
const R = floodReach(L, T, { rides: true, across: 5 });
const settle = x => { let y = 0; while (y < L.H - 1 && !R.footing.has(R.key(x, y))) y++; return R.footing.has(R.key(x, y)) ? y : -1; };
const reached = x => { const y = settle(x); return y >= 0 && R.seen.has(R.key(x, y)); };
assert(reached(pStart + 2), 'the pillars\' section (col ' + (pStart + 2) + ') fell out of the reach fill');
assert(reached(examX0 + 2), 'the exam stretch (col ' + (examX0 + 2) + ') fell out of the reach fill');
assert(reached(A.wallL - 1), 'her door (col ' + (A.wallL - 1) + ') is no longer reachable through the exam stretch');

console.log('Sporewood\'s second half and its exam: the lurker twist at 244, a leaning cap combined into the bog, a lurker'
  + ' among the pillars\' floor caps, and the exam stretch (' + examX0 + '-' + examX1 + ') growing a cap both ways under a'
  + ' fall and a foe, all reachable to her door with a real jump.');
