/* tools/shop-gates.mjs — EVERY LOCK IN THE STORE NAMES A DOOR THAT EXISTS. Node only: no page, no port, no Chrome.
 *
 * WHAT IT ANSWERS, YES OR NO. A skill in the store can be held back until a level is cleared:
 *
 *     { id: 'wisp', name: 'WISP', price: 120, needs: 'oreroad', needsName: 'the Ore Road', hero: 'pyro' }
 *
 * `needs` is matched against PROG, which is keyed by LEVEL ID. If it names anything else, PROG[needs] is undefined,
 * `.cleared` is never true, and THE SKILL CAN NEVER BE BOUGHT. Nothing throws. The store draws the lock, prints
 * `needsName`, and a player reads a sentence telling them to go and clear a place that does not exist.
 *
 * WHY IT EXISTS. THE PYROMANCER'S WISP was gated on `needs: 'mineworks'` from the day it was written.
 * `mineworks` is THE ORE ROAD'S MUSIC TRACK - somebody took the level's `music` field instead of its `id` - so a
 * 120-coin skill on a hero with a class level of his own was dead in the shop, and the shop cheerfully explained
 * why in a sentence naming a place no map has. It was found by reading the Ore Road brief, not by playing, and it
 * could have sat there for the life of the game: nothing crashes, nothing warns, and a skill nobody can buy looks
 * exactly like a skill nobody has bought yet.
 *
 * WHAT IT CHECKS, AND WHAT IT DELIBERATELY DOES NOT. Only gates carrying BOTH `needs` and `needsName` - those are
 * unambiguously store locks meant to be read by a player. A bare `needs:` is something else and is none of this
 * tool's business: src/level.js uses it for KEYS (`needs: 'brass'`, `'iron'`, `'bone'` open lock gates), and reading
 * those as level ids would fail the suite on three healthy doors. `coinNeeds`, the hero unlock gate, IS checked -
 * it resolves against PROG the same way. Level ids are read out of src/level.js rather than imported, because
 * importing the game needs a DOM.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = f => readFileSync(ROOT + f, 'utf8');

const ids = new Set([...read('src/level.js').matchAll(/\bid: *'([a-z0-9]+)'/g)].map(m => m[1]));
assert.ok(ids.size > 20, 'only ' + ids.size + ' level ids parsed out of src/level.js: the scan has stopped working and this check is guarding nothing');

const main = read('src/main.js');
const lineOf = i => main.slice(0, i).split('\n').length;
const bad = [], seen = [];

/* a store lock: needs + the sentence the player is shown. Both, in that order, on one entry. */
for (const m of main.matchAll(/needs: *'([a-z0-9]+)' *, *needsName: *'([^']*)'/g)) {
  seen.push(m[1]);
  if (!ids.has(m[1])) bad.push({ line: lineOf(m.index), kind: 'needs', id: m[1], shown: m[2] });
}
/* the hero unlock gate, same resolution against PROG */
for (const m of main.matchAll(/coinNeeds: *'([a-z0-9]+)'/g)) {
  seen.push(m[1]);
  if (!ids.has(m[1])) bad.push({ line: lineOf(m.index), kind: 'coinNeeds', id: m[1], shown: '' });
}

/* a feat that asks for a level's BOSS beaten ('boss:<level id>', featDone in src/main.js): the level must exist, and something in
   main.js must set PROG.bossDown for it - a flag nothing sets is a lock nothing opens (THE DEATH KNIGHT, 2026-09-25) */
for (const m of main.matchAll(/feat: *'boss:([a-z0-9]+)'/g)) {
  seen.push(m[1]);
  if (!ids.has(m[1])) bad.push({ line: lineOf(m.index), kind: 'feat boss:', id: m[1], shown: '' });
  else if (!main.includes('PROG.bossDown.' + m[1] + ' = true')) bad.push({ line: lineOf(m.index), kind: 'feat boss: (nothing sets PROG.bossDown.' + m[1] + ')', id: m[1], shown: '' });
}
assert.ok(seen.length >= 6, 'only ' + seen.length + ' gates found in src/main.js: the scan has stopped working and this check is guarding nothing');

if (bad.length) {
  assert.fail(bad.length + ' shop gate(s) name something that is not a level:\n'
    + bad.map(b => '    src/main.js:' + b.line + '  ' + b.kind + ": '" + b.id + "'"
        + (b.shown ? '  (the store tells the player to clear "' + b.shown + '")' : '')).join('\n')
    + '\n  PROG is keyed by level id, so this gate never opens and the skill can never be bought. Use the level\'s\n'
    + '  `id`, not its `music`, its name or its region. If the level does not exist yet, the gate cannot ship.');
}

console.log('ok  shop-gates     ' + seen.length + ' store and hero gates, every one naming a real level of the ' + ids.size + ' in src/level.js');
