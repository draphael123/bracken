// tools/checkpoint-stand.mjs — EVERY CHECKPOINT IS SOMEWHERE A PLAYER CAN ACTUALLY STAND (Falling Tower round 2, 2026-09-25).
// Daniel: "there is a checkpoint that is unreachable when you fight the skeletal mage". It stood on the Falling Tower's parapet, one
// row under the Undead Archmage's hall, and the carpet fight's camera looks that far down: a lit lantern under the fire, all fight
// long, that the carpet can never reach. tools/checkpoints.mjs asks whether a checkpoint has floor under it and is outside a room's
// walls; nothing asked whether you can GET there, with a real jump, or whether a fight you cannot leave is staring at it. Two rules:
//   REAL JUMP  the reach fill, run with a hero's real jump (opts.across 5 columns foot to foot: about 3.5 tiles of flight with a foot
//              over each edge, inside the 3.2-4.5 measured in-game - not the model's 6), STANDS at every checkpoint (its column or
//              one either side). A few misses are gaps in the MODEL, not the level - a ride it cannot follow - and are listed with the
//              reason; an entry that forgives nothing fails, so the list only shrinks.
//   NOT SEEN FROM A FLIGHT  a carpet fight has nowhere to stand, so no checkpoint may be drawn anywhere its camera can look: the box,
//              plus the camera's reach below its lowest point (the hero flies at most to the box's bottom; the camera keeps 42% of
//              the screen under him) and a margin for shake.
// usage: node tools/checkpoint-stand.mjs
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { carpetBox } from '../src/carpet.js';

const ACROSS = 5, VW = 320, VH = 180, TS = 16, SPRITE = 32;
/* GAPS IN THE MODEL, each with its reason. Not levels that are wrong: rides the fill cannot follow with a shorter jump. */
const MODEL_GAPS = {
  wood: [[510, 8, 'the wasp pogo over the last pit: the fill has no landing lower than a jump starts, so it never comes down off a wasp'],
    [453, 14, 'the same: the pit crossing before it is made on the wasps']],
  moor: [[652, 12, "the gust ride's carry is calibrated on the model's 6-tile jump (tools/moor-gusts.mjs), so with a real jump the carry falls a tile short - the ride itself is walked by tools/moor-gusts-walk.mjs"]],
};
/* THE RULE BITES: a made-up flight arena with a lantern under its floor, one far below it, one inside it */
export const seenFromFlight = (L, e) => { const A = L.arena; if (!A || !A.carpet) return null; const b = carpetBox(A, 0), feet = (e.y + 1) * TS, px = e.x * TS + 8;
  const low = b.y1 + Math.ceil(VH * 0.42) + 4, high = b.y0 - Math.ceil(VH * 0.58) - 4;
  if (px > b.x0 - VW / 2 && px < b.x1 + VW / 2 && feet > high && feet - SPRITE < low) return 'in view of the flight over ' + A.boss + ' (the camera sees rows ' + Math.floor(high / TS) + '-' + Math.floor(low / TS) + ')';
  return null; };
{ const L = { arena: { carpet: true, boss: 'x', x0: 64, x1: 1088, y0: 544, floor: 800 } };
  assert(seenFromFlight(L, { x: 31, y: 50 }), 'a lantern one row under the flight floor passes'); assert(seenFromFlight(L, { x: 31, y: 40 }), 'one inside the flight passes');
  assert(!seenFromFlight(L, { x: 31, y: 56 }), 'one six rows under the floor fails'); assert(!seenFromFlight({ arena: { ...L.arena, carpet: false } }, { x: 31, y: 50 }), 'a standing arena is checkpoints.mjs\'s business'); }

const bad = [], built = {}; let n = 0;
for (const lv of LEVELS) { const L = built[lv.id] = lv.build(), R = floodReach(L, T, { rides: true, across: ACROSS });
  for (const e of L.ents.filter(e => e.t === 'check')) { n++;
    const v = seenFromFlight(L, e); if (v) bad.push(`${lv.id} @${e.x},${e.y}: ${v}`);
    const stood = [-1, 0, 1].some(dx => R.seen.has(R.key(e.x + dx, e.y)));
    if (!stood && !(MODEL_GAPS[lv.id] || []).some(([x, y]) => x === e.x && y === e.y)) bad.push(`${lv.id} @${e.x},${e.y}: the fill with a real jump (${ACROSS} columns) never stands here`); } }
const stale = Object.entries(MODEL_GAPS).flatMap(([id, list]) => list.filter(([x, y]) => { const L = built[id]; if (!L || !L.ents.some(e => e.t === 'check' && e.x === x && e.y === y)) return true;
  const R = floodReach(L, T, { rides: true, across: ACROSS }); return [-1, 0, 1].some(dx => R.seen.has(R.key(x + dx, y))); }).map(([x, y]) => id + ' @' + x + ',' + y));
assert.equal(stale.length, 0, stale.length + ' MODEL_GAPS entr(y/ies) forgive nothing - delete them from tools/checkpoint-stand.mjs: ' + stale.join(', '));
assert.equal(bad.length, 0, bad.length + ' checkpoint(s) nobody can stand at:\n  ' + bad.join('\n  '));
console.log(`ok  checkpoint-stand   ${n} checkpoints in ${LEVELS.length} levels: every one stood at with a real jump (${ACROSS} columns, not 6; ${Object.values(MODEL_GAPS).flat().length} gaps in the model listed), none in view of a flight arena.`);
