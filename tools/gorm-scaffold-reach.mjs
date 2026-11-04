// tools/gorm-scaffold-reach.mjs - KING GORM's HALL: EVERY HERO CAN CLIMB THE SCAFFOLD TO THE RAFTER ARCHERS (claude/gormrocks, Daniel 11-03: the rock heaps are gone, so the
// scaffold is the only way onto a deck). Node, no page. Each hero's own legs (src/reach-hero.js) flood the hall from its floor; every archer's mark (row 5 deck, one tile above
// the plank) on all five ropes must be reached, and the shared (any-hero) fill agrees. The archers are only pressure (the ropes are free at any moment), so this is the
// "clear them if they bother you" promise, not a gate on the cage loop.
//   node tools/gorm-scaffold-reach.mjs [--v]
import './gorm2-dom.mjs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { HERO_MOVE_IDS } from '../src/hero-move.js';
const TS = 16, verbose = process.argv.includes('--v');
let fails = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const L = LEVELS.find(l => l.id === 'kings').build(), G = L.gorm, hall = G.hall;
const start = [Math.floor(hall.x0 / TS) + 6, 13];   /* the hall's floor, inside its west door */
const marks = []; for (const r of hall.ropes) for (const a of r.archers) marks.push({ x: Math.floor(a / TS), y: Math.floor(r.deck[2] / TS) - 1, rope: Math.round(r.x) });
const table = {};
for (const hero of [null, ...HERO_MOVE_IDS]) {
  const R = floodReach(L, T, { rides: true, hero: hero || undefined, seeds: [start] });
  const miss = marks.filter(m => !R.seen.has(m.x + ',' + m.y));
  table[hero || 'shared'] = { reached: marks.length - miss.length, of: marks.length };
  ok(!miss.length, (hero || 'any hero (shared fill)') + ': ' + (marks.length - miss.length) + '/' + marks.length + ' archer marks reached from the floor' + (miss.length ? ' - MISSING ' + miss.map(m => m.x + ',' + m.y).join(' ') : ''));
}
if (verbose) console.log(JSON.stringify(table));
console.log(fails ? 'FAIL gorm-scaffold-reach' : 'ok  gorm-scaffold-reach'); process.exit(fails ? 1 : 0);
