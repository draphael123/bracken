// tools/charms2.mjs - THE EIGHT NEW CHARMS, node only (claude/charms2; plan passiveplan.md sec 5). No browser.
//   node tools/charms2.mjs
// Flag off (CHARMS2_SHIP=false): inert - no rows, no worn charm, every multiplier exactly 1, nothing written to a save, the shop is today's six.
// Flag on: eight rows with a gate each and an icon each; ONE charm worn per hero (a string in PROG.charmOf[h]); the gates lock and open through
// the store's own lockOf; a save with a new charm round-trips; the hooks are where the plan says.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as C2 from '../src/charms2.js';
import { lockOf } from '../src/store.js';
import { migrateProgress, validateProgress } from '../src/progression.js';
import { PER_HERO } from '../src/coop-save.js';
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const main = rd('src/main.js'), art = rd('src/art.js'), level = rd('src/level.js'), stock = JSON.parse(rd('tools/store-stock.json'));
const NEW = ['thorn', 'stone', 'hound', 'gambler', 'salt', 'quiet', 'lantern', 'pilgrim'], BASE = ['lucky', 'iron', 'feather', 'heart', 'swift', 'ribbon'];

/* 0. the flag ships dark */
assert.equal(C2.CHARMS2_SHIP, false, 'ships dark'); assert.equal(C2.charms2Ship(), false);
assert.deepEqual(C2.CHARMS2.map(c => c.id), NEW, 'the eight, in the plan\'s order');

/* 1. FLAG OFF: inert */
assert.deepEqual(C2.rows(), [], 'flag off: the shop gets no new rows');
for (const id of NEW.concat(BASE, [null, undefined, 'none'])) assert.equal(C2.worn(id), null, 'flag off: ' + id + ' is not a worn new charm');
{ const e = { hp: 10 }, st = {};
  for (const id of NEW) { assert.equal(C2.houndMul(id, e), 1); assert.equal(C2.takeMul(id), 1); assert.equal(C2.sightMul(id), 1); assert.equal(C2.pilgrimMul(id, 1, 30), 1); assert.equal(C2.goldExtra(id, st, 10), 0); assert.equal(C2.thornHits(id, { who: e, dist: 5 }), false); assert.equal(C2.lanternNear(id, 1, 1), false); }
  assert.deepEqual(st, {}, 'flag off: no gold fraction kept'); }
{ const p = { coins: 5 }; assert.equal(C2.noteDeath(p), false); assert.equal(C2.noteSecret(p, 'wood:1,2'), false); assert.deepEqual(p, { coins: 5 }, 'flag off: a save is not touched'); }
/* the shop today: the store-stock fixture lists the six and only the six */
{ const t = stock.find(x => x.id === 'charms'); assert.ok(t, 'a CHARMS tab in the stock fixture'); assert.deepEqual(t.rows.map(r => r.id).filter(i => i !== 'none'), BASE, 'the shop today is the six'); }
/* main.js adds the rows through the flag-gated list only, and every hook is behind a C2.* call that is inert off */
assert.ok(main.includes('CHARMS.push(...C2.rows())'), 'CHARMS gets its new rows only from C2.rows()');
for (const hook of ["C2.thornHits(PROG.charm", "C2.worn(PROG.charm) === 'stone' && C2.smallBlow(", "C2.houndMul(PROG.charm, e)", 'C2.goldExtra(PROG.charm, c2Gold, n)', 'C2.takeMul(PROG.charm)', 'C2.pilgrimMul(PROG.charm', 'qm = () => C2.sightMul(PROG.charm)', "C2.worn(PROG.charm) === 'lantern'", "C2.worn(PROG.charm) === 'salt'", 'C2.noteDeath(PROG)', 'C2.noteSecret(PROG', 'C2.isFeat(f) ? C2.featDone('])
  assert.ok(main.includes(hook), 'main.js hook missing: ' + hook);
assert.ok((main.match(/\* qm\(\)/g) || []).length >= 8, 'QUIET BOOTS scales the foes\' notice radii (7 chase checks + the sleeper wake)');

/* 2. ICONS: every new id has a 10x12 icon in bakeCharms (the sheet tool draws them: node tools/charms2-sheet.mjs) */
for (const id of NEW) assert.ok(new RegExp('\\n    ' + id + ': mk\\(g =>').test(art), 'no icon for ' + id);

/* 3. FLAG ON */
C2.setCharms2Ship(true);
try {
  const rows = C2.rows(); assert.equal(rows.length, 8); assert.deepEqual(rows.map(r => r.id), NEW);
  assert.equal(new Set(rows.map(r => r.id)).size, 8, 'ids unique'); for (const r of rows) assert.ok(!BASE.includes(r.id), r.id + ' clashes with a base charm');
  const levelIds = new Set([...level.matchAll(/\n  \{ id: '([a-z0-9]+)', name: '/g)].map(m => m[1]));
  for (const r of rows) {
    assert.ok(!!r.needs !== !!r.feat, r.id + ': exactly one of needs / feat');
    assert.ok(r.price >= 40 && r.price <= 100, r.id + ' price ' + r.price); assert.equal(r.name, r.name.toUpperCase()); assert.ok(r.name.length <= 20, r.id + ' name fits'); assert.ok(r.desc && r.desc.length <= 110, r.id + ' desc length ' + r.desc.length);
    if (r.needs) { assert.ok(levelIds.has(r.needs), r.id + ' needs a real level: ' + r.needs); assert.ok(r.needsName); }
    else { const kind = r.feat.split(':')[0]; assert.ok(C2.isFeat(r.feat) || kind === 'medals' || levelIds.has(r.feat), r.id + ' feat ' + r.feat); assert.ok(r.featName); }
    assert.ok(!/flask|tonic|potion/i.test(r.name + r.desc), r.id + ': no flask charms (bosses are tuned WITH flasks)');
  }
  /* the unlocks as the plan's table says */
  const by = Object.fromEntries(rows.map(r => [r.id, r]));
  assert.equal(by.thorn.feat, 'wood'); assert.equal(by.stone.needs, 'stockade'); assert.equal(by.hound.feat, 'medals:15'); assert.equal(by.gambler.needs, 'moor');
  assert.equal(by.salt.feat, 'deaths:10'); assert.equal(by.quiet.needs, 'spire'); assert.equal(by.lantern.feat, 'secrets:10'); assert.equal(by.pilgrim.feat, 'heroes:3');
  /* the gates lock and open through the store's own lockOf */
  const fd = (prog, facts) => f => C2.isFeat(f) ? C2.featDone(f, prog, facts) : f === 'wood' ? !!(prog.wood && prog.wood.cleared) : f.startsWith('medals:') ? (facts.medals | 0) >= +f.slice(7) : false;
  { const p = { coins: 0 }, facts = { heroes: 1, medals: 0 };
    for (const r of rows) assert.ok(lockOf(r, p, fd(p, facts)), r.id + ' is locked on a fresh save');
    p.stockade = { cleared: true }; p.moor = { cleared: true }; p.spire = { cleared: true }; p.wood = { cleared: true }; facts.medals = 15; facts.heroes = 3;
    for (const id of ['thorn', 'stone', 'hound', 'gambler', 'quiet', 'pilgrim']) assert.equal(lockOf(by[id], p, fd(p, facts)), null, id + ' opens when its gate is met');
    assert.ok(lockOf(by.salt, p, fd(p, facts)) && lockOf(by.lantern, p, fd(p, facts)), 'salt / lantern need their counters');
    p.c2 = { deaths: 0, secrets: {} }; for (let i = 0; i < 9; i++) C2.noteDeath(p); assert.ok(lockOf(by.salt, p, fd(p, facts))); C2.noteDeath(p); assert.equal(p.c2.deaths, 10); assert.equal(lockOf(by.salt, p, fd(p, facts)), null, 'ten falls open SALT');
    for (let i = 0; i < 9; i++) assert.ok(C2.noteSecret(p, 'w:' + i)); assert.ok(lockOf(by.lantern, p, fd(p, facts))); assert.equal(C2.noteSecret(p, 'w:3'), false, 'the same secret is not counted twice (walls mend)'); C2.noteSecret(p, 'w:9'); assert.equal(lockOf(by.lantern, p, fd(p, facts)), null, 'ten secrets open LANTERN');
    assert.match(C2.featProgress('deaths:10', p), /^10 OF 10 FALLS$/); assert.equal(C2.featProgress('heroes:3', p, { heroes: 1 }), '1 OF 3 HEROES'); }
  /* the worn charm */
  for (const id of NEW) assert.equal(C2.worn(id), id); for (const id of BASE) assert.equal(C2.worn(id), null, 'the six base charms are not this file\'s');
  /* THE NUMBERS */
  assert.equal(C2.smallBlow(6, 100), true); assert.equal(C2.smallBlow(10, 100), true); assert.equal(C2.smallBlow(11, 100), false); assert.equal(C2.smallBlow(6, 20), true, 'the floor of 6'); assert.equal(C2.smallBlow(7, 20), false);
  assert.equal(C2.houndMul('hound', { hp: 4 }), 1.15); assert.equal(C2.houndMul('hound', { hp: 4, c2Bit: true }), 1, 'only the first blow'); assert.equal(C2.houndMul('hound', { hp: 900, maxHp: 900 }), 1, 'never a boss'); assert.equal(C2.houndMul('hound', { hp: 40, mini: true }), 1, 'never a mini'); assert.equal(C2.houndMul('iron', { hp: 4 }), 1);
  assert.equal(C2.takeMul('gambler'), 1.1); assert.equal(C2.sightMul('quiet'), 0.7); assert.equal(C2.pilgrimMul('pilgrim', 5, 10), 1.15); assert.equal(C2.pilgrimMul('pilgrim', 6, 10), 1, 'only 5 or more below'); assert.equal(C2.pilgrimMul('pilgrim', 1, 1), 1);
  { const st = {}; let sum = 0; for (let i = 0; i < 100; i++) sum += C2.goldExtra('gambler', st, 1); assert.equal(sum, 25, '100 coins pay 125: a quarter, no rounding lost'); let one = 0; for (let i = 0; i < 4; i++) one += C2.goldExtra('gambler', {}, 1); assert.equal(one, 0, 'a fresh fraction does not round up'); assert.equal(C2.goldExtra('lantern', {}, 9), 0); }
  assert.equal(C2.thornHits('thorn', { who: {}, dist: 20 }), true); assert.equal(C2.thornHits('thorn', { who: {}, dist: 80 }), false, 'melee only: a bolt from afar is not a thorn blow'); assert.equal(C2.thornHits('thorn', { who: {}, pct: 0.2, dist: 5 }), false, 'a hazard is not a foe'); assert.equal(C2.thornHits('thorn', { dist: 5 }), false); assert.equal(C2.thornDamage(), 1);
  assert.equal(C2.lanternNear('lantern', 90, 30), true); assert.equal(C2.lanternNear('lantern', 97, 0), false); assert.equal(C2.lanternNear('lantern', 96, 0), true, '6 tiles of 16');
  /* THE PLAN'S RULE: no charm beats the IRON CHARM tier (a fifth less taken): none here reduces damage taken, and the one that raises it is the trade */
  assert.ok(C2.GAMBLER.take > 1 && C2.HOUND_MUL <= 1.15 && C2.PILGRIM.mul <= 1.15, 'no new charm adds power past the plan\'s numbers');

  /* 4. ONE CHARM WORN, PER HERO: a save keeps a string per hero; a new id survives the load / save round trip; validate never throws on one */
  const v2 = () => ({ progressionVersion: 2, hero: 'knight', xp: { knight: 500, pyro: 200 }, done: {}, coins: 40, charm: 'thorn', charms: { thorn: true, quiet: true, iron: true }, charmOf: { knight: 'thorn', pyro: 'quiet' }, c2: { deaths: 4, secrets: { 'wood:3,4': 1 } } });
  { const out = migrateProgress(JSON.stringify(v2()), []).progress; assert.equal(out.charm, 'thorn'); assert.deepEqual(out.charmOf, { knight: 'thorn', pyro: 'quiet' }); assert.deepEqual(out.charms, { thorn: true, quiet: true, iron: true }); assert.deepEqual(out.c2, { deaths: 4, secrets: { 'wood:3,4': 1 } }, 'the counters round-trip');
    for (const v of Object.values(out.charmOf)) assert.equal(typeof v, 'string', 'one charm, a plain id per hero');
    const again = migrateProgress(JSON.stringify(out), []).progress; assert.deepEqual(JSON.parse(JSON.stringify(again.charmOf)), out.charmOf); validateProgress(JSON.parse(JSON.stringify(out))); }
  assert.ok(PER_HERO.includes('charmOf'), 'the charm rides the hero snapshot (co-op / online)');
  /* c2() repairs a damaged counter instead of throwing */
  { const p = { c2: 'junk' }; C2.noteDeath(p); assert.deepEqual(p.c2, { deaths: 1, secrets: {} }); const q = { c2: { deaths: 'x', secrets: 5 } }; C2.noteSecret(q, 'a'); assert.equal(q.c2.deaths, 0); assert.deepEqual(q.c2.secrets, { a: 1 }); }
  /* a save that wears a new charm with the flag OFF again is simply a save with a charm nothing reads (nothing throws, the six stay) */
} finally { C2.setCharms2Ship(false); }
assert.deepEqual(C2.rows(), [], 'flag back off: inert again');
{ const out = migrateProgress(JSON.stringify({ progressionVersion: 2, hero: 'knight', xp: { knight: 10 }, done: {}, coins: 1, charm: 'thorn', charms: { thorn: true }, charmOf: { knight: 'thorn' } }), []).progress; assert.equal(C2.worn(out.charm), null, 'a flag-off build reads a new charm as nothing'); }
console.log('charms2: ok (8 rows, gates, one worn, hooks, save round trip, flag off inert)');
