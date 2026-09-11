// tools/reach.mjs — can you actually get there?
// Flood-fills the standable tiles of a level from its START using the knight's real numbers (the fill
// itself lives in src/reachcore.js, which the coin sprinkler uses too), then reports anything the player
// is expected to touch that the fill never reached: the gate, the checkpoints, the silver, the quest
// items, the relic, the boss - and any gold outside it.
//
// It cannot model a mover, a swing or a wind gust, so a level that uses those will report things it can
// in fact reach. Every such miss is listed as ASSISTED rather than UNREACHABLE, and the levels that lean
// on them say so at the top.
// usage: node tools/reach.mjs [levelId]
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';

const want = process.argv[2];
let bad = 0;
for (const lv of LEVELS) {
  if (lv.hidden) continue;
  if (want && lv.id !== want) continue;
  const L = lv.build(), W = L.W;
  const { seen, footing, assisted, near, jumpNear } = floodReach(L, T);

  // is everything you are meant to touch inside the fill?
  const WANT = { gate: 'THE GATE', check: 'a checkpoint', silver: 'a silver', stray: 'a quest item', relic: 'the relic', key: 'a key', doorway: 'a doorway' };
  const misses = [];
  for (const e of L.ents) { const w = WANT[e.t]; if (!w) continue; if (!near(e.x, e.y)) misses.push(`${w} at ${e.x},${e.y}`); }
  // and the boss, if the level has one
  if (L.arena && L.arena.boss) { const b = L.ents.find(e => e.t === L.arena.boss || e.t === L.arena.boss + 'lord'); if (b && !near(b.x, b.y)) misses.push(`the boss (${L.arena.boss}) at ${b.x},${b.y}`); }

  // gold nobody can get to is worse than none: count the coins outside the fill (list them for one level)
  const lost = L.ents.filter(e => e.t === 'coin' && !jumpNear(e.x, e.y));
  if (lost.length) { if (!assisted) bad++; console.log(`== ${lv.id}: ${lost.length} coin${lost.length > 1 ? 's' : ''} outside the fill${assisted ? ' (ASSISTED level: may be a mover away)' : ''}` + (want ? '\n  ' + lost.map(e => e.x + ',' + e.y).join(' ') : '')); }
  const pct = Math.round(seen.size / Math.max(1, footing.size) * 100);
  const head = `== ${lv.id} (${W}x${L.H})  reached ${pct}% of the footing${assisted ? '   [ASSISTED: has movers/wind/doors the model cannot follow]' : ''}`;
  if (!misses.length) { if (want) console.log(head + '\n  everything is reachable.'); continue; }
  console.log(head);
  for (const m of misses) { console.log('  ' + (assisted ? 'ASSISTED?  ' : 'UNREACHABLE  ') + m); bad++; }
}
console.log(bad ? `\n${bad} to check by hand.` : '\nnothing stranded.');
