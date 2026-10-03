/* tools/mash-carry.mjs - the row-dropping bug of tools/mash-bot.mjs (claude/mashmachines). Node only.
   `mash-bot.mjs <id> --level <id> --write` used to open the id's entry as { hash } whenever the level hash had changed and so DROPPED that id's boss and
   mini rows (three lanes hit it in one day). tools/mash-rows.mjs carryRows is the fix: a level-only write carries the boss / mini rows through, a boss
   write after a level change drops the stale level row (loudly), an unchanged hash keeps everything. Also asserts that mash-bot.mjs really goes through
   carryRows (so the old one-liner cannot come back) and that the shipped cache still reads with the current verdict code (format unchanged). */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { carryRows, levelClears, heroReport } from './mash-rows.mjs';

const old = { hash: 111, boss: { wins: 0, fights: 6, byHero: { knight: ['dead:100/80'] } }, mini: { wins: 0, fights: 2, byHero: {} }, level: { knight: { deaths: 1, minHpPct: 0 } } };
const said = [], say = m => said.push(m);

/* the OLD behaviour, verbatim from the one-liner this replaces: it drops everything (the test proves it would fail it) */
const legacy = (o, h) => o && o.hash === h ? o : { hash: h };
assert.equal(legacy(old, 222).boss, undefined, 'the legacy one-liner drops the boss row (what we fix)');

let e = carryRows(old, 222, { boss: false, level: true }, say);   /* a level-only write after the level data changed */
assert.equal(e.hash, 222, 'the entry takes the new hash');
assert.deepEqual(e.boss, old.boss, 'level-only write: the BOSS row survives a hash change');
assert.deepEqual(e.mini, old.mini, 'level-only write: the MINI row survives a hash change');
assert.equal(e.level, undefined, 'level-only write: the old level row is left for the run to fill');
assert.deepEqual(e.carried, { from: 111, parts: ['boss', 'mini'] }, 'carried rows are marked with the hash they came from');
assert.ok(said.length === 1 && /carried the boss \+ mini/.test(said[0]), 'and it says so out loud: ' + said.join('|'));

said.length = 0; e = carryRows(old, 222, { boss: true, level: false }, say);   /* a boss-only write: the level run of the old data must not pass the new data */
assert.equal(e.level, undefined, 'boss-only write after a level change: the stale LEVEL row is dropped, not blessed with the new hash');
assert.equal(e.boss, undefined, 'a boss run re-measures the boss: nothing carried');
assert.ok(said.some(m => /LEVEL row is dropped/.test(m)), 'and it says so');

assert.equal(carryRows(old, 111, { boss: false, level: true }, say), old, 'an unchanged hash keeps the entry whole');
assert.deepEqual(carryRows(undefined, 5, { boss: true, level: true }), { hash: 5 }, 'a new id starts empty');
e = carryRows(old, 222, { boss: true, level: true }, say);
assert.deepEqual(e, { hash: 222 }, 'a full re-run starts clean (it measures everything itself)');

/* mash-bot.mjs goes through carryRows, and the legacy one-liner is gone */
const src = readFileSync(new URL('./mash-bot.mjs', import.meta.url), 'utf8');
assert.ok(/carryRows\(cache\[id\]/.test(src), 'mash-bot.mjs opens an entry through carryRows');
assert.ok(!/cache\[id\]\.hash === levelHash\(lv\) \? cache\[id\] : \{ hash: levelHash\(lv\) \}/.test(src), 'the dropping one-liner is not back in mash-bot.mjs');

/* the per-hero verdict: any hero that mashes through makes the level mashable; the knight-only stamp can miss it */
const lvl = { knight: { deaths: 1, minHpPct: 0 }, warden: { deaths: 0, minHpPct: 56 }, pyro: { deaths: 0, minHpPct: 12 } };
assert.equal(levelClears(lvl, ['knight'], 40).cleared, false, 'knight alone: holds');
const all = levelClears(lvl, ['knight', 'warden', 'pyro'], 40);
assert.ok(all.cleared && all.by.join() === 'warden', 'all heroes: the warden mashes through (the Theatre case)');
const rep = heroReport({ theatre: { hash: 1, level: lvl }, wood: { hash: 2, level: { knight: lvl.knight } } }, 40);
assert.deepEqual(rep.changes, ['theatre'], 'the report names the level whose verdict changes');
assert.deepEqual(rep.partial, ['wood'], 'and the row that does not hold all three heroes yet');

/* the shipped cache still reads: every row has a hash, level rows keep minHpPct/deaths/walked/lifts, boss rows keep byHero/wins/fights */
const cache = JSON.parse(readFileSync(new URL('../docs/mash-bot.json', import.meta.url), 'utf8'));
for (const [id, row] of Object.entries(cache)) {
  assert.ok(row.hash !== undefined, id + ': hash');
  for (const [h, r] of Object.entries(row.level || {})) for (const f of ['deaths', 'minHpPct', 'walked', 'lifts']) assert.ok(typeof r[f] === 'number', id + ' level ' + h + ' has ' + f);
  for (const key of ['boss', 'mini']) if (row[key]) for (const f of ['byHero', 'wins', 'fights']) assert.ok(row[key][f] !== undefined, id + ' ' + key + ' has ' + f);
}
console.log('mash-carry: level-only writes keep the boss/mini rows, boss writes drop the stale level row, ' + Object.keys(cache).length + ' cached rows still read');
