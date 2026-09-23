/* tools/one-new-foe.mjs — RULE F10: EVERY LEVEL BRINGS AT LEAST ONE FOE THE GAME HAS NEVER SEEN, AND IT IS NOT ITS
   BOSS. Node only: no page, no port, no Chrome.

   WHY "AND IT IS NOT ITS BOSS". F10 was written on 2026-09-24 as plain "at least one new foe", earned from Daniel's
   verdict on THE ORE ROAD - "no new enemies/idea other than riding lifts". Measured, the rule in that form PASSED the
   Ore Road, because its one new creature is the Winchmaster: its boss. A rule that does not catch the level it was
   earned from is not a rule. Every level with a boss gets one new creature for free, so the boss cannot be the answer.

   WHAT THE CAMPAIGN ACTUALLY DOES. The median level brings FOUR new foes - one is a floor, not a target. That
   number was FIVE while this walked the array, and it is not a number to keep typing into a comment: the tool
   computes it and says it, and the failure message quotes what it just measured rather than what was true once.
   RULES-LEVELS-AND-BOSSES.md F10 and docs/QUEUE.md §2a both still say five, and neither is edited from here -
   changing the law is not a thing to slip into a tool fix.

   THE GRANDFATHER LIST is the honest way to introduce a rule to a game that predates it: the levels that fail
   today are named, each with a reason, and everything else must comply now. A level added to that list without a
   reason is a level nobody thought about.

   "EARLIER" MEANS THE GATE CHAIN, NOT THE ARRAY (fixed 2026-09-23). This walked LEVELS in array order, so "every
   EARLIER level" meant "every level written above this one in a JavaScript literal". The array is an APPEND LOG -
   THE BURNING VILLAGE, THE WITCHLIGHT STAIR and THE ORE ROAD were each appended at the end on purpose, because the
   map's nodes and the saves count levels by index and inserting one in the middle moves everything after it - so
   the array's tail is three levels that belong in the MIDDLE of the campaign, and this rule was crediting their
   foes to levels the player reaches later.
     IT COST A REAL VERDICT. THE WITCHLIGHT STAIR sat on this list as "its only new creature is the Gate Gargoyle".
   It is not. The array put THE MAGE'S FOLLY above the Stair, so the Folly was credited with the imp, the broom,
   the armour, the apprentice and the topiary - but the Folly NEEDS the Stair, so the player meets all five ON THE
   STAIR. Walked properly it brings FIVE new foes, which is exactly the campaign median, and its entry here was an
   artefact of the array and nothing else. It is gone. (The Folly still passes, on two of its own.)
     AND THE CHAIN IS A TREE, NOT A LINE. Four levels hang off a predecessor another level already continues -
   the Burning Village off the Stockade, Stormwreck Harbor off the Causeway, and the two secrets off Kingswood and
   Highcrown. At a fork the longer continuation is walked first and the spur after it, which is a CHOICE: a real
   player can meet them either way round, and a set difference against "everything earlier" is exactly the kind of
   measure that could quietly depend on the choice. It does not, and that was checked rather than assumed - across
   4000 randomly generated LEGAL play orders (every order the gate chain permits) the set of failing levels came
   out the same every time. If a future level ever makes that stop being true, the honest answer is to say the
   verdict depends on the route, not to print whichever answer this walk happened to reach.
     The walk is tools/campaign-order.mjs, shared with tools/curve.mjs, which had the identical bug for the
   identical reason. Two tools answering "what comes before this level?" out of two copies of the answer is
   exactly how the THREAT table drifted by twenty entries. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { chainOf } from './campaign-order.mjs';

/* Named, with a reason each. THE ORE ROAD IS BEING REWORKED and must leave this list when it lands. */
const GRANDFATHERED = {
  oreroad: 'REJECTED BY DANIEL AND BEING REWORKED - its only new creature is the Winchmaster, and "no new enemies/idea other than riding lifts" is exactly what this rule now measures. It must leave this list when the rework lands.',
  harbor: 'shelved on purpose - the only level in LEVELS with no map node.',
  crown: 'ANSWERED, AND BEING FIXED - Daniel agreed 2026-09-24 that it should bring a new foe. THE TEMPERER is briefed in docs/briefs/crown-temperer.md; this entry goes when he lands.',
  keep: 'ANSWERED, AND BEING FIXED - THE LEADFOOT is briefed in docs/briefs/keep-leadfoot.md; this entry goes when he lands.',
};

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ehp = src.slice(src.indexOf('const EHP = {'));
const EHP = new Set([...ehp.slice(0, ehp.indexOf('};')).matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*:/g)].map(m => m[1]));
assert.ok(EHP.size > 80, 'only ' + EHP.size + ' creatures read out of EHP: the parse has stopped working and this check guards nothing');

/* A store, a trial yard and YOUR WOOD are not campaign levels and never were. Everything else is, INCLUDING THE
   TWO SECRETS: Underleaf is gated on `needsTime: { id: 'kings', t: 180 }` and the Undercrown on
   `needsKills: { id: 'crown', pct: 0.8 }`, which name the level you must be standing in just as exactly as
   `needs` does. A walk that reads only `needs` has no position at all for those two and either drops them or
   leaves them wherever the array put them - so campaign-order.mjs reads all three gates. */
const rows = [];
for (const lv of LEVELS) {
  if (/^(shop|trial|custom)/.test(lv.id)) continue;
  let L; try { L = lv.build(); } catch { continue; }
  const roster = new Set((L.ents || []).filter(e => e && e.t && EHP.has(e.t)).map(e => e.t));
  for (const r of (L.garrison || [])) if (Array.isArray(r) && EHP.has(r[0])) roster.add(r[0]);
  rows.push({ id: lv.id, needs: lv.needs, needsTime: lv.needsTime, needsKills: lv.needsKills, roster,
    bosses: new Set([L.arena && L.arena.boss, L.mini && L.mini.boss].filter(Boolean)) });
}

const C = chainOf(rows);
assert.equal(C.cyclic.length, 0, 'the gate chain runs in a circle through ' + C.cyclic.join(', ')
  + ': there is no "earlier level" until that is untangled, so this rule cannot be measured at all');
assert.equal(C.roots.length, 1, C.roots.length + ' level(s) have no gate at all (' + C.roots.join(', ')
  + '): the campaign must have exactly one first level for "earlier" to mean anything');
assert.equal(C.orphans.length, 0, C.orphans.length + ' level(s) are gated on something that is not a campaign level ('
  + C.orphans.map(id => id + ' -> ' + C.prev.get(id)).join(', ') + '): nothing is earlier than them, so they cannot be'
  + ' measured. Fix the gate - do not let them fall to wherever the array happens to put them.');
assert.equal(C.order.length, rows.length, 'the walk placed ' + C.order.length + ' of ' + rows.length
  + ' campaign levels: some level is not reachable from ' + C.roots[0] + ' and would be silently skipped');

const seen = new Set();
const fresh = [], failed = [], stale = [];
for (const id of C.order) {
  const lv = C.byId.get(id);
  const news = [...lv.roster].filter(t => !seen.has(t) && !lv.bosses.has(t));
  for (const t of lv.roster) seen.add(t);

  if (news.length) { fresh.push([id, news.length]); if (GRANDFATHERED[id]) stale.push(id); }
  else if (!GRANDFATHERED[id]) failed.push(id);
}

const counts = fresh.map(f => f[1]).sort((a, b) => a - b);
const median = counts[Math.floor(counts.length / 2)];

if (failed.length) assert.fail(failed.length + ' level(s) bring no foe the game has not already seen, other than their own boss'
  + ' — F10. A boss does not count: every level with one would get a free pass.\n    ' + failed.join('\n    ')
  + '\n  "Already seen" is the GATE CHAIN, not the LEVELS array: each one is measured against everything the player'
  + '\n  reaches before it. The median level brings ' + median + ' new foes, so one is a floor and not a target.');

assert.equal(stale.length, 0, 'these are on the grandfather list and no longer need to be — delete their entries: ' + stale.join(', '));
console.log('    one-new-foe    walked off the gate chain, not the LEVELS array: ' + C.order.length + ' campaign levels, '
  + C.forks.length + ' fork(s) (' + C.forks.map(([id, v]) => v.join('/') + ' both off ' + id).join('; ') + ')');
console.log('ok  one-new-foe    ' + fresh.length + ' levels each bring a foe the game had not seen (median '
  + median + '), and ' + Object.keys(GRANDFATHERED).length + ' predate the rule:');
for (const id of Object.keys(GRANDFATHERED)) console.log('      ' + id.padEnd(11) + GRANDFATHERED[id].slice(0, 96));
