// tools/checkpoints.mjs — EVERY CHECKPOINT IN EVERY LEVEL STANDS ON THREE TILES OF FLOOR (Daniel, 2026-09-23).
// Before the rule, sixteen hung half over air at a ledge's edge in twelve levels. src/level.js groundCheckpoints slides
// them onto floor at build time; this proves none is left over air, spikes, reeds, a climb, a web or a bouncer.
// usage: node tools/checkpoints.mjs
import assert from 'node:assert/strict';
import { LEVELS, T, checkStands } from '../src/level.js';
/* THE RULE BITES: a made-up ledge, a checkpoint on it, one hanging off it, one over air, one inside rock */
{ const W = 8, H = 4, grid = new Uint8Array(W * H); for (let x = 2; x <= 4; x++) grid[2 * W + x] = T.SOLID; grid[1 * W + 6] = T.SOLID; const L = { W, H, grid };
  assert(checkStands(L, 3, 1, true), 'on a three-tile ledge it stands');
  assert(checkStands(L, 4, 1, false) && !checkStands(L, 4, 1, true), 'on the last tile of the ledge it stands, but not on three');
  assert(!checkStands(L, 5, 1, false), 'past the ledge, over air, it does not'); assert(!checkStands(L, 6, 1, false), 'inside rock it does not'); }
const bad = []; let n = 0;
for (const lv of LEVELS) { const L = lv.build(), at = (x, y) => (x < 0 || y < 0 || x >= L.W || y >= L.H) ? T.SOLID : L.grid[y * L.W + x];
  for (const e of L.ents.filter(e => e.t === 'check')) { n++;
    if (!checkStands(L, e.x, e.y, false)) bad.push(`${lv.id} @${e.x},${e.y} under [${[-1, 0, 1].map(d => at(e.x + d, e.y + 1)).join(',')}]`); } }
assert.equal(bad.length, 0, `${bad.length} checkpoint(s) hang off an edge or stand in rock:\n  ` + bad.join('\n  '));
console.log(`${n} checkpoints in ${LEVELS.length} levels, every one on floor under its foot (centre tile and a neighbour), none inside rock; where three tiles were within reach it stands on three.`);

// ---- AND NONE WHERE YOU WAKE UP IN THE WRONG PLACE (level review, 2026-09-24) ----
// B6 says one checkpoint OUTSIDE the arena walls, and the rule lived only in the filler (src/level.js checkpoints()),
// which keeps its OWN placements out of arenas and never judged anybody else's: a builder's hand-placed shrine inside
// the walls - or one grown in behind a wall later - passed every tool, because this file asked only about footing and
// tools/newlevel.mjs only that SOME checkpoint stands before the trigger. The Flotilla's 304 was B6's own case again
// (inside the Quartermaster's walls and past her trigger). Now every built checkpoint is asked:
//   not inside a boss arena's walls, a mini's or an ambush room's (by height too: a tall level's floors share columns)
//   not on a flight: the kite never lets you stand, and a death after lighting one there stands you on a spire with no kite
/* INSIDE ON PURPOSE, SAID SO - and nothing is, now. Gale Moor's kite used to drop you inside the Windcaller's walls with no
   ground outside them nearer than the kite post, so its landing checkpoint (952,12) was listed here (the levelfix report's
   first question). The rework built a landing shelf west of his wall and the checkpoint stands on it
   (docs/briefs/gale-moor-rework.md §5). A new entry needs its reason written beside it; a stale one fails, below. */
const INSIDE_OK = {};
const TSZ = 16;
export const roomsOf = L => { const r = [];
  for (const [n, A] of [['arena', L.arena], ['mini', L.mini]]) if (A) r.push([n, A.wallL !== undefined ? A.wallL : A.x0 / TSZ, A.wallR !== undefined ? A.wallR : (A.gate !== undefined ? A.gate : A.x1 / TSZ), A.y0 !== undefined ? A.y0 : A.floor - 20 * TSZ, A.floor + 4]);
  for (const A of (L.ambushes || [])) r.push(['ambush', A.wallL, A.wallR, (A.y0 !== undefined ? A.y0 : A.row - 9) * TSZ, (A.row + 2) * TSZ]);
  return r; };
export const whereWrong = (L, e) => { const feet = (e.y + 1) * TSZ;
  for (const [n, l, r, top, bot] of roomsOf(L)) if (e.x > l && e.x < r && feet >= top && feet <= bot) return 'inside the ' + n + ' walls (' + l + '-' + r + ')';
  if (L.flight) { const k0 = Math.min(L.flight.x1, ...L.ents.filter(k => k.t === 'stormkite').map(k => k.x)); if (e.x > k0 && e.x < L.flight.x1) return 'on the flight (' + k0 + '-' + L.flight.x1 + ')'; }
  return null; };
/* THE RULE BITES: a made-up arena, a shrine inside its walls, one outside; a made-up kite ride and a shrine under it */
{ const L = { arena: { x0: 20 * TSZ, x1: 60 * TSZ, wallL: 19, wallR: 61, floor: 10 * TSZ }, ents: [{ t: 'stormkite', x: 70 }], flight: { x1: 120 } };
  assert(whereWrong(L, { x: 30, y: 9 }), 'a shrine inside the walls passes'); assert(!whereWrong(L, { x: 15, y: 9 }), 'a shrine outside the walls fails');
  assert(whereWrong(L, { x: 90, y: 3 }), 'a shrine on the kite ride passes'); assert(!whereWrong(L, { x: 125, y: 9 }), 'a shrine past the ride fails'); }
/* AND THE LIST CAN ONLY SHRINK (Gale Moor rework, 2026-09-25). An entry here forgives ONE checkpoint that stands where it
   should not; an entry that forgives nothing - the checkpoint moved, or the level no longer needs it - is a hole waiting for
   the next checkpoint put down on that tile, so it fails, as a stale KNOWN line fails tools/checkpoint-gaps.mjs. */
export const staleInside = (OK, built) => Object.entries(OK).flatMap(([id, list]) => list.filter(([x, y]) => { const L = built[id]; return !L || !L.ents.some(e => e.t === 'check' && e.x === x && e.y === y && whereWrong(L, e)); }).map(([x, y]) => id + ' @' + x + ',' + y));
{ const L = { arena: { x0: 20 * TSZ, x1: 60 * TSZ, wallL: 19, wallR: 61, floor: 10 * TSZ }, ents: [{ t: 'check', x: 30, y: 9 }, { t: 'check', x: 15, y: 9 }] };
  assert.equal(staleInside({ x: [[30, 9]] }, { x: L }).length, 0, 'an entry that forgives a checkpoint inside the walls stands');
  assert.equal(staleInside({ x: [[15, 9], [44, 9]] }, { x: L }).length, 2, 'an entry for a checkpoint that is fine, or that is not there, is stale'); }
const wrong = [], built = {}; let asked = 0;
for (const lv of LEVELS) { const L = built[lv.id] = lv.build();
  for (const e of L.ents.filter(e => e.t === 'check')) { asked++; const w = whereWrong(L, e);
    if (w && !(INSIDE_OK[lv.id] || []).some(([x, y]) => x === e.x && y === e.y)) wrong.push(`${lv.id} @${e.x},${e.y}${e.filled ? ' (filled)' : ''} ${w}`); } }
{ const stale = staleInside(INSIDE_OK, built); assert.equal(stale.length, 0, stale.length + ' INSIDE_OK entr(y/ies) forgive nothing - delete them from tools/checkpoints.mjs: ' + stale.join(', ')); }
assert.equal(wrong.length, 0, `${wrong.length} checkpoint(s) where a death wakes you in the wrong place:\n  ` + wrong.join('\n  '));
console.log(`${asked} checkpoints: none inside an arena's, a mini's or an ambush room's walls, none on a flight (${Object.values(INSIDE_OK).flat().length} inside on purpose, listed).`);
