/* tools/one-new-foe.mjs — RULE F10: EVERY LEVEL BRINGS AT LEAST ONE FOE THE GAME HAS NEVER SEEN, AND IT IS NOT ITS
   BOSS. Node only: no page, no port, no Chrome.

   WHY "AND IT IS NOT ITS BOSS". F10 was written on 2026-09-24 as plain "at least one new foe", earned from Daniel's
   verdict on THE ORE ROAD - "no new enemies/idea other than riding lifts". Measured, the rule in that form PASSED the
   Ore Road, because its one new creature is the Winchmaster: its boss. A rule that does not catch the level it was
   earned from is not a rule. Every level with a boss gets one new creature for free, so the boss cannot be the answer.

   WHAT THE CAMPAIGN ACTUALLY DOES. The median level brings FIVE new foes. One is a floor, not a target.

   THE GRANDFATHER LIST is the honest way to introduce a rule to a game that predates it: the five levels that fail
   today are named, each with a reason, and everything else must comply now. A level added to that list without a
   reason is a level nobody thought about. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';

/* Named, with a reason each. THE ORE ROAD IS BEING REWORKED and must leave this list when it lands. */
const GRANDFATHERED = {
  oreroad: 'REJECTED BY DANIEL AND BEING REWORKED - its only new creature is the Winchmaster, and "no new enemies/idea other than riding lifts" is exactly what this rule now measures. It must leave this list when the rework lands.',
  witchlight: 'rejected 2026-09-22 on a related count (rules met is not a good level); its only new creature is the Gate Gargoyle.',
  harbor: 'shelved on purpose - the only level in LEVELS with no map node.',
  crown: 'late-arc castle: it closes out the goblin roster the crags spent five levels establishing, and brings a boss and a mini rather than a new rank-and-file. LOOK AT THIS ONE - it may be deliberate, or it may be the same fault as the Ore Road in a level nobody has complained about yet.',
  keep: 'same shape as crown, and the same open question.',
};

const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ehp = src.slice(src.indexOf('const EHP = {'));
const EHP = new Set([...ehp.slice(0, ehp.indexOf('};')).matchAll(/([a-zA-Z][a-zA-Z0-9]*)\s*:/g)].map(m => m[1]));
assert.ok(EHP.size > 80, 'only ' + EHP.size + ' creatures read out of EHP: the parse has stopped working and this check guards nothing');

const seen = new Set();
const fresh = [], failed = [], stale = [];
for (const lv of LEVELS) {
  if (/^(shop|trial|custom)/.test(lv.id)) continue;
  let L; try { L = lv.build(); } catch { continue; }
  const bosses = new Set([L.arena && L.arena.boss, L.mini && L.mini.boss].filter(Boolean));
  const roster = new Set((L.ents || []).filter(e => e && e.t && EHP.has(e.t)).map(e => e.t));
  for (const r of (L.garrison || [])) if (Array.isArray(r) && EHP.has(r[0])) roster.add(r[0]);
  const news = [...roster].filter(t => !seen.has(t) && !bosses.has(t));
  for (const t of roster) seen.add(t);

  if (news.length) { fresh.push([lv.id, news.length]); if (GRANDFATHERED[lv.id]) stale.push(lv.id); }
  else if (!GRANDFATHERED[lv.id]) failed.push(lv.id);
}

if (failed.length) assert.fail(failed.length + ' level(s) bring no foe the game has not already seen, other than their own boss'
  + ' — F10. A boss does not count: every level with one would get a free pass.\n    ' + failed.join('\n    ')
  + '\n  The median level brings FIVE new foes, so one is a floor and not a target.');

assert.equal(stale.length, 0, 'these are on the grandfather list and no longer need to be — delete their entries: ' + stale.join(', '));

const counts = fresh.map(f => f[1]).sort((a, b) => a - b);
console.log('ok  one-new-foe    ' + fresh.length + ' levels each bring a foe the game had not seen (median '
  + counts[Math.floor(counts.length / 2)] + '), and ' + Object.keys(GRANDFATHERED).length + ' predate the rule:');
for (const id of Object.keys(GRANDFATHERED)) console.log('      ' + id.padEnd(11) + GRANDFATHERED[id].slice(0, 96));
