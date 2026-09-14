// tools/deadends.mjs — EVERY DEAD END PAYS.
// "Whenever there's a dead end like this, like in the deep, there needs to be some type of collectible." Lists every dead
// end the movement graph can find (src/deadends.js: on land, in water, up high), how far past its last way on it runs,
// and what is at the far end - and FAILS on any pocket with nothing there. What pays: a silver, a quest stray, a relic, a
// key, a stash heart, or a cache of four coins or more within reach of the last six tiles. One coin or a sign does not.
// The build pass payDeadEnds() in src/level.js pays them; this is the check that it did. Section R of
// RULES-LEVELS-AND-BOSSES.md is the rule.
//   node tools/deadends.mjs            every level
//   node tools/deadends.mjs <id> -v    one level, with what was looked at and skipped (open water, too small, a door)
import { LEVELS, T } from '../src/level.js';
import { findDeadEnds } from '../src/deadends.js';

const want = process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : null, verbose = process.argv.includes('-v');
let total = 0, unpaid = 0, levels = 0;
for (const lv of LEVELS) {
  if ((lv.hidden && !lv.secret) || (want && lv.id !== want)) continue;
  const L = lv.build(), r = findDeadEnds(L, T); levels++;
  const owed = r.pockets.filter(p => !p.paid);
  total += r.pockets.length; unpaid += owed.length;
  console.log('== ' + lv.id + ': ' + r.pockets.length + ' dead end' + (r.pockets.length === 1 ? '' : 's') + (owed.length ? ', ' + owed.length + ' WITH NOTHING AT THE END' : '') + (r.why ? ' (' + r.why + ')' : ''));
  for (const p of r.pockets) {
    /* what the stash pass put down, and what was there already */
    const props = L.ents.filter(e => e.t === 'deco' && e.stash && p.inZone(e.x, e.y)).map(e => e.kind);
    const what = [p.coins ? p.coins + ' coin' + (p.coins === 1 ? '' : 's') : '', ...p.loot.map(t => t === 'mend' ? 'heart' : t), ...props].filter(Boolean).join(', ') || 'nothing';
    console.log('  ' + (p.paid ? 'paid    ' : 'UNPAID  ') + (p.x + ',' + p.y).padEnd(8) + String(p.len).padStart(3) + ' tiles  ' + p.kind.padEnd(5) + ' ' + (p.wall ? 'wall' : 'edge') + (p.danger ? ' danger' : '       ') + '  ' + what);
  }
  if (verbose) for (const s of r.skipped) console.log('  skipped ' + (s.x + ',' + s.y).padEnd(8) + String(s.len).padStart(3) + ' tiles  ' + s.why);
}
console.log(unpaid ? '\n' + unpaid + ' of ' + total + ' dead ends have nothing at the end.' : '\n' + total + ' dead ends in ' + levels + ' levels, and every one pays.');
process.exitCode = unpaid ? 1 : 0;
