// curve.mjs — THE RAMP, measured instead of felt.
//
// Nobody had ever looked at the difficulty curve as a curve. This walks the campaign in order and prints,
// per level: how long it is, how much is in it, how dangerous what is in it is, and how far you can be from
// a checkpoint. The last column is a single index so the shape of the ramp is readable down the page.
//
//   node tools/curve.mjs
//
// The index is deliberately crude and deliberately STATIC - it is what the level contains, not how a player
// does. It is for spotting a level that is out of order with its neighbours, not for tuning a number.
//
// "IN ORDER" MEANS THE `needs` CHAIN, NOT THE ARRAY (fixed 2026-09-23). This walked LEVELS in array order and
// called row i-1 "the level before" row i. The array is an APPEND LOG: THE BURNING VILLAGE, THE WITCHLIGHT STAIR
// and THE ORE ROAD were each appended at the end on purpose, because the map's nodes and the saves count levels by
// their index and inserting one in the middle moves everything after it. So the array's tail is three levels that
// belong in the middle of the campaign, and SIX of the twenty-eight visible levels were being measured against a
// level the player has not played when they reach them - crown, waymeet, mage, burning, witchlight and oreroad.
// The order a player walks is what `needs` says, and nothing else here reads the array's order any more.
//
// AND THE CHAIN IS A TREE, NOT A LINE. Two levels hang off a predecessor that another level already continues:
// THE BURNING VILLAGE off the Stockade (which SPOREWOOD continues) and STORMWRECK HARBOR off the Causeway (which
// WAYMEET continues). So there is no single "order they are walked" to print, and this does not invent one. What
// IS well defined for every level but the first is THE LEVEL IT NEEDS, and that is the only thing the step check
// compares against. The table prints the longest road from the root, then each branch that hangs off it, and every
// row carries an `after` column so no reading depends on which line is above it.
//
// The walk itself lives in tools/campaign-order.mjs, because tools/one-new-foe.mjs had the same bug for the same
// reason, and two tools answering "what is the level before this one?" out of two copies of the walk is exactly
// how the THREAT table drifted by twenty entries.
import { LEVELS, T, TS } from '../src/level.js';
import { chainOf, gateOf } from './campaign-order.mjs';
import { THREAT, spanOf, indexOf, worstGap, measureLevel, RAMP_DROP, RAMP_WALL } from '../src/threat.js';


const rows = [];
for (const lv of LEVELS) {
  // THE RAMP IS THE CAMPAIGN'S. A secret level is a bonus hanging off the side of act one, not the
  // seventeenth step of a sixteen-step slope, and counting it makes every reading after it a lie.
  if (lv.hidden) continue;
  const R = lv.build();
  /* COUNTED IN src/threat.js (measureLevel), the same count the bot makes: ambush crowds with their captain as an elite, and floor that gives way as hazard */
  const M = measureLevel(R, { T, TS }), { foes, threat, kinds: nk, checks, hazTiles, gap, span, index } = M, kinds = { size: nk };
  const per100 = threat / (span / 100);
  rows.push({ id: lv.id, needs: gateOf(lv), arc: lv.arc || null, cols: span, foes, threat: Math.round(threat), kinds: kinds.size, per100: +per100.toFixed(1), haz: hazTiles, checks, gap, index });
}

// ---- THE CAMPAIGN ORDER, walked off the gate chain ---------------------------------------------------------
const C = chainOf(rows);
const { byId, kids, roots, forks, leaves, placed, pickOrder } = C;
if (C.cyclic.length) { console.error('\nthe gate chain runs in a circle through: ' + C.cyclic.join(', ') + '\n  The campaign has no order until that is untangled. Nothing measured.'); process.exit(1); }
if (!roots.length) { console.error('\nNo level has an empty gate: the campaign has no first level. Nothing measured.'); process.exit(1); }
const road = C.road.map(id => byId.get(id));
const branches = C.branches.map(b => ({ from: b.from, rows: b.ids.map(id => byId.get(id)) }));
// A level whose gate is not a visible level is NOT on the campaign road: it is pointing at a hidden level or at
// nothing. Say so rather than dropping it into the line at whatever spot the array happened to give it.
const orphans = C.orphans.map(id => byId.get(id));

const pad = (s, n) => String(s).padEnd(n);
const padl = (s, n) => String(s).padStart(n);
const HEAD = pad('level', 13) + pad('after', 13) + padl('cols', 6) + padl('foes', 6) + padl('threat', 8) + padl('kinds', 7) + padl('thr/100', 9) + padl('hazard', 8) + padl('checks', 8) + padl('gap', 6) + padl('INDEX', 7) + '   ramp';
const line = r => {
  const p = r.needs && byId.has(r.needs) ? byId.get(r.needs) : null;
  const arrow = !p ? '  ' : r.index > p.index ? ' /' : r.index < p.index ? ' \\' : ' -';
  return pad(r.id, 13) + pad(r.needs || '(first)', 13) + padl(r.cols, 6) + padl(r.foes, 6) + padl(r.threat, 8) + padl(r.kinds, 7)
    + padl(r.per100, 9) + padl(r.haz, 8) + padl(r.checks, 8) + padl(r.gap, 6) + padl(r.index, 7) + arrow + ' ' + '#'.repeat(Math.max(1, Math.round(r.index / 4)));
};

console.log('\nTHE RAMP, in the order the `needs` chain is walked\n');
console.log(HEAD);
for (const r of road) console.log(line(r));
for (const b of branches) {
  console.log('\n  -- a branch off ' + (b.from || '(a second first level)') + ': ' + b.rows.map(r => r.id).join(' -> ')
    + ' -- ' + (b.from ? b.from + ' is also continued by ' + pickOrder(b.from)[0] + ', so this is not "after" anything on the road above' : ''));
  for (const r of b.rows) console.log(line(r));
}
if (orphans.length) {
  console.log('\n  -- NOT REACHABLE FROM ' + roots[0] + ": each one's `needs` names no visible level, so nothing is the level before it --");
  for (const r of orphans) console.log(line(r) + '   <- needs "' + r.needs + '", which is not a visible level');
}

// WHAT SHAPE THE CHAIN IS, said plainly rather than smoothed over.
console.log('\nTHE SHAPE OF THE CHAIN');
console.log('  first level (no `needs`): ' + roots.join(', ') + (roots.length > 1 ? '   <- more than one: the campaign has more than one beginning' : ''));
if (!forks.length) console.log('  no forks: the chain is a single line, and "the level before" is unambiguous.');
else {
  console.log('  ' + forks.length + ' fork(s): the chain is a TREE, not a line. "The level before" means THE LEVEL IT NEEDS, which is');
  console.log('  well defined for every level here - but the levels AFTER a fork are not in one order, and none is invented:');
  for (const [id, v] of forks) console.log('    ' + v.length + ' levels need ' + id + ': ' + v.join(', ') + ' - a player can meet them in either order');
}
console.log('  ends of a branch (nothing needs them): ' + (leaves.length ? leaves.join(', ') : 'none'));
console.log('  ' + rows.length + ' visible levels, ' + placed.size + ' on the chain, ' + orphans.length + ' off it.');

// where the ramp goes backwards by more than a little - MEASURED AGAINST THE LEVEL IT NEEDS
console.log('');
let bad = 0, unmeasured = 0;
for (const r of road.concat(...branches.map(b => b.rows), orphans)) {
  const p = r.needs && byId.has(r.needs) ? byId.get(r.needs) : null;
  if (!p) { if (r.needs) { console.log(`  ${r.id} needs "${r.needs}", which is not a visible level - nothing to measure it against`); unmeasured++; }
    continue; }
  const d = r.index - p.index;
  // A NEW ARC IS ALLOWED TO BREATHE. The ramp was one line because the game was one road; a campaign of
  // fifty levels is four or five roads, and the first level of a new one being quieter than the last boss
  // of the old one is the breath between chapters, not a mistake. Inside an arc the rule is unchanged.
  if (r.arc) { console.log(`  ${r.id} opens ${r.arc.toUpperCase()} at ${r.index} (${p.id} closed the last one at ${p.index})`); continue; }
  if (d < RAMP_DROP) { console.log(`  ${r.id} is ${-d} EASIER than ${p.id}, the level it needs`); bad++; }
  if (d > RAMP_WALL) { console.log(`  ${r.id} is ${d} harder than ${p.id}, the level it needs - a wall`); bad++; }
}
console.log(bad ? `\n${bad} step(s) out of line.` : '\nthe ramp climbs.');
if (unmeasured) console.log(`${unmeasured} level(s) could not be measured at all.`);
