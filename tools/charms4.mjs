// tools/charms4.mjs - THE TWELVE FEAT CHARMS, node only (claude/charms4-d). No browser.  node tools/charms4.mjs
// Flag off (CHARMS3_SHIP=false): inert. Flag on: 12 rows, one feat each, the feat logic (what counts, what must not), the veteran credit, the shop sort + riddle row, a save round trip, hooks present.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as C3 from '../src/charms3.js';
import * as C2 from '../src/charms2.js';
import { lockOf } from '../src/store.js';
import { migrateProgress, validateProgress } from '../src/progression.js';
const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const main = rd('src/main.js'), art = rd('src/art.js');
const NEW = ['magpie', 'surefoot', 'ink', 'spade', 'northstar', 'scout', 'redthread', 'bone', 'crumbs', 'brother', 'hourglass', 'tell'];
const OLD14 = ['lucky', 'iron', 'feather', 'heart', 'swift', 'ribbon', ...C2.CHARMS2.map(c => c.id)];

/* 0. dark */
assert.equal(C3.CHARMS3_SHIP, false); assert.equal(C3.charms3Ship(), false);
assert.deepEqual(C3.CHARMS3.map(c => c.id), NEW);
assert.deepEqual(C3.rows(), []); for (const id of NEW) assert.equal(C3.worn(id), null);
{ const p = { coins: 1 }; assert.equal(C3.noteDeath(p), false); assert.equal(C3.noteRevive(p, true, true), false); assert.equal(C3.notePurse(p, 'foe'), false); assert.deepEqual(C3.onWin(p, { id: 'moor', medal: 3, clean: true }), []); assert.deepEqual(p, { coins: 1 }, 'flag off writes nothing');
  assert.equal(C3.jumpMul('surefoot'), 1); assert.equal(C3.sureFootCoyote('surefoot', 0.1), 0.1); assert.equal(C3.camLead('scout', 1), 0); assert.equal(C3.spadeReach('spade'), 1); assert.equal(C3.spadeKeep('spade', 100), 100); assert.equal(C3.reviveTime('brother', 1.5), 1.5);
  assert.equal(C3.silverNear('magpie', 1, 1), false); assert.equal(C3.threadNear('redthread', 1, 1), false);
  const list = [{ id: 'a' }, { id: 'b' }]; assert.equal(C3.sortRows(list, () => true), list, 'flag off: the list is untouched'); const k = { id: 'spade', riddle: true }; assert.equal(C3.hideRiddle(k, true), k); }
/* flag-off hooks in main.js are all behind a C3.* call that is inert; the shop gets rows only from C3.rows() */
for (const hook of ['CHARMS.push(...C3.rows())', 'C3.sureFootCoyote(PROG.charm', 'C3.jumpMul(PROG.charm)', "C3.worn(PROG.charm) === 'scout'", 'C3.spadeReach(PROG.charm)', 'C3.spadeKeep(PROG.charm', 'C3.notePurse(PROG, b.where)', 'C3.noteRevive(PROG, helper === players[0]', 'C3.reviveTime(PROG.charm, 1)', 'C3.noteMiniStart(hitsTaken)', 'C3.noteMiniEnd(PROG, hitsTaken, c3Clean())', 'C3.noteHazard()', 'C3.noteSilver()', 'C3.noteDeath(PROG)', 'C3.reset()', 'C3.onWin(PROG,', 'drawC3(cx, cy)', "C3.worn(PROG.charm) === 'bone'", "C3.worn(PROG.charm) === 'hourglass'", "C3.worn(PROG.charm) === 'ink'", 'C3.sortRows(', 'C3.hideRiddle(', 'C3.isFeat(f) ? C3.featDone(f, PROG)'])
  assert.ok(main.includes(hook), 'main.js hook missing: ' + hook);
for (const id of NEW) assert.ok(new RegExp('\\n    ' + id + ': mk\\(g =>').test(art), 'no icon for ' + id);

C3.setCharms3Ship(true);
try {
  const rows = C3.rows(); assert.equal(rows.length, 12);
  assert.equal(new Set(rows.map(r => r.id).concat(OLD14)).size, 26, '26 distinct ids');
  /* each row: a feat (no counters-only), a price in the range, a one-line shop sentence that fits phone landscape (<= 62 chars incl. ' to earn it'), tiers 4 / 5 / 3 */
  const tiers = { 1: 0, 2: 0, 3: 0 };
  for (const r of rows) { assert.ok(r.feat && !r.needs, r.id); assert.ok(C3.isFeat(r.feat), r.id + ' feat kind'); assert.ok(r.price >= 40 && r.price <= 100, r.id + ' price'); tiers[r.tier]++;
    const words = r.featName({ c3: { f: {}, streak: 1, heroLv: { a: ['x'] } } }) + ' to earn it'; assert.ok(words.length <= 62, r.id + ' shop line too long (' + words.length + '): ' + words); assert.ok(r.desc.length <= 110, r.id + ' desc');
    assert.ok(!/flask|tonic|potion/i.test(r.name + r.desc), r.id + ' no flask charm'); assert.equal(r.name, r.name.toUpperCase()); assert.ok(r.name.length <= 20, r.id + ' name'); }
  assert.deepEqual(tiers, { 1: 4, 2: 5, 3: 3 }, 'about 4 early, 5 mid, 3 hard');
  assert.equal(rows.filter(r => r.riddle).length, 1, 'one hidden riddle row');
  /* trade-offs */
  assert.equal(C3.jumpMul('surefoot') < 1 && C3.sureFootCoyote('surefoot', 0.1) > 0.1, true); assert.equal(C3.camLead('scout', 1), 28); assert.equal(C3.camLead('scout', -1), -28); assert.equal(C3.spadeKeep('spade', 10), 8); assert.ok(C3.spadeReach('spade') > 1); assert.equal(C3.reviveTime('brother', 3), 2);
  /* ---- THE FEATS ---- */
  C3.setCampaign(['wood', 'a', 'b', 'c', 'd', 'e']);
  const fresh = () => ({ coins: 0 }); const ok = (o = {}) => ({ id: 'a', hero: 'knight', charm: null, medal: 0, wasCleared: false, deaths: 0, hits: 0, drinks: 0, boss: false, spikes: false, clean: true, ...o });
  /* silverin: the first four campaign woods (wood a b c), 12 silver; reads the save: a veteran is credited automatically */
  { const p = { wood: { silver: 7 }, a: { silver: 7 }, b: { silver: 7 }, c: { silver: 3 }, d: { silver: 7 } }; assert.equal(C3.featDone('silverin:12', p), false); assert.equal(C3.featProgress('silverin:12', p), '11 OF 12'); p.c.silver = 7; assert.equal(C3.featDone('silverin:12', p), true); }
  /* clean:3 - three woods in a row without a fall; a fall resets; the first wood counts for nothing; a cheat run counts for nothing */
  { const p = fresh(); C3.reset(); C3.onWin(p, ok({ id: 'wood' })); assert.equal(C3.featDone('clean:3', p), false, 'the first wood alone counts nothing');
    C3.onWin(p, ok({ id: 'a' })); C3.onWin(p, ok({ id: 'b' })); assert.equal(C3.featProgress('clean:3', p), '2 OF 3'); C3.noteDeath(p); assert.equal(C3.featProgress('clean:3', p), '0 OF 3', 'a fall resets it');
    C3.onWin(p, ok({ id: 'c', clean: false })); C3.onWin(p, ok({ id: 'd', clean: false })); C3.onWin(p, ok({ id: 'e', clean: false })); assert.equal(C3.featDone('clean:3', p), false, 'assist / co-op / dev runs count nothing');
    for (const id of ['c', 'd', 'e']) C3.onWin(p, ok({ id })); assert.equal(C3.featDone('clean:3', p), true);
    const q = fresh(); C3.onWin(q, ok({ id: 'a', deaths: 1 })); assert.equal(q.c3.streak, 0, 'a win with a death in it is not a clean one'); }
  /* firstgold: gold on the first clear of a wood (not the first wood); veteran credit at 40 cleared woods */
  { const p = fresh(); C3.onWin(p, ok({ id: 'wood', medal: 3 })); assert.equal(C3.featDone('firstgold:1', p), false); C3.onWin(p, ok({ id: 'a', medal: 2 })); assert.equal(C3.featDone('firstgold:1', p), false); C3.onWin(p, ok({ id: 'b', medal: 3, wasCleared: true })); assert.equal(C3.featDone('firstgold:1', p), false, 'a replay is not a first clear'); C3.onWin(p, ok({ id: 'c', medal: 3 })); assert.equal(C3.featDone('firstgold:1', p), true);
    const vet = {}; for (let i = 0; i < 40; i++) vet['w' + i] = { cleared: true }; assert.equal(C3.featDone('firstgold:1', vet), true, 'a 40-wood save is credited'); const v2 = {}; for (let i = 0; i < 39; i++) v2['w' + i] = { cleared: true }; assert.equal(C3.featDone('firstgold:1', v2), false); }
  /* chains: gold with SWIFT worn; gold with the RIBBON worn */
  { const p = fresh(); C3.onWin(p, ok({ id: 'a', medal: 3, charm: 'iron' })); assert.equal(C3.featDone('swiftgold:1', p), false); C3.onWin(p, ok({ id: 'b', medal: 2, charm: 'swift' })); assert.equal(C3.featDone('swiftgold:1', p), false, 'silver is not gold'); C3.onWin(p, ok({ id: 'c', medal: 3, charm: 'swift' })); assert.equal(C3.featDone('swiftgold:1', p), true); assert.equal(C3.featDone('ribbongold:1', p), false);
    C3.onWin(p, ok({ id: 'd', medal: 3, charm: 'ribbon' })); assert.equal(C3.featDone('ribbongold:1', p), true); }
  /* cleanspikes: a wood WITH spikes, no spike touched, no death */
  { const p = fresh(); C3.reset(); C3.onWin(p, ok({ id: 'a', spikes: false })); assert.equal(C3.featDone('cleanspikes:1', p), false, 'a wood with no spikes proves nothing'); C3.noteHazard(); C3.onWin(p, ok({ id: 'b', spikes: true })); assert.equal(C3.featDone('cleanspikes:1', p), false, 'touched one'); C3.reset(); C3.onWin(p, ok({ id: 'c', spikes: true })); assert.equal(C3.featDone('cleanspikes:1', p), true); }
  /* bossnoflask: a boss wood, no flask, no death */
  { const p = fresh(); C3.onWin(p, ok({ id: 'a', boss: true, drinks: 1 })); assert.equal(C3.featDone('bossnoflask:1', p), false); C3.onWin(p, ok({ id: 'b', boss: false })); assert.equal(C3.featDone('bossnoflask:1', p), false); C3.onWin(p, ok({ id: 'c', boss: true, deaths: 1 })); assert.equal(C3.featDone('bossnoflask:1', p), false); C3.onWin(p, ok({ id: 'd', boss: true })); assert.equal(C3.featDone('bossnoflask:1', p), true); }
  /* silver1life: all three silver of a wood in one life; credit for 3+ fully-silvered woods */
  { const p = fresh(); C3.reset(); C3.noteSilver(); C3.noteSilver(); C3.onWin(p, ok({ id: 'a' })); assert.equal(C3.featDone('silver1life:1', p), false); C3.reset(); for (let i = 0; i < 3; i++) C3.noteSilver(); C3.noteDeath(p); for (let i = 0; i < 3; i++) C3.noteSilver(); C3.onWin(p, ok({ id: 'b', deaths: 1 })); assert.equal(C3.featDone('silver1life:1', p), false, 'a fall in the wood spoils it');
    C3.reset(); for (let i = 0; i < 3; i++) C3.noteSilver(); C3.onWin(p, ok({ id: 'c' })); assert.equal(C3.featDone('silver1life:1', p), true); const v = { a: { silver: 7 }, b: { silver: 7 }, c: { silver: 7 } }; assert.equal(C3.featDone('silver1life:1', v), true, 'three full-silver woods credit a veteran'); assert.equal(C3.featDone('silver1life:1', { a: { silver: 7 }, b: { silver: 7 } }), false); }
  /* minino: a mini-boss beaten with no hit taken, on a clean run only */
  { const p = fresh(); C3.reset(); C3.noteMiniStart(5); assert.equal(C3.noteMiniEnd(p, 6, true), false, 'a hit taken'); C3.noteMiniStart(6); assert.equal(C3.noteMiniEnd(p, 6, false), false, 'not a clean run'); C3.noteMiniStart(6); assert.equal(C3.noteMiniEnd(p, 6, true), true); assert.equal(C3.featDone('minino:1', p), true); assert.equal(C3.noteMiniEnd(p, 6, true), false, 'no start, no end'); }
  /* heroclear: one wood with three DIFFERENT heroes */
  { const p = fresh(); for (const h of ['knight', 'knight', 'pyro']) C3.onWin(p, ok({ id: 'a', hero: h })); assert.equal(C3.featProgress('heroclear:3', p), '2 OF 3'); C3.onWin(p, ok({ id: 'b', hero: 'ranger' })); assert.equal(C3.featDone('heroclear:3', p), false, 'three heroes on DIFFERENT woods is not it'); C3.onWin(p, ok({ id: 'a', hero: 'ranger', clean: false })); assert.equal(C3.featDone('heroclear:3', p), false, 'a cheated run does not count'); C3.onWin(p, ok({ id: 'a', hero: 'ranger' })); assert.equal(C3.featDone('heroclear:3', p), true); }
  /* bossrevive: player one lifts an ally while a boss fight is on; an AI or a seat lifting does not count; outside a fight does not count */
  { const p = fresh(); assert.equal(C3.noteRevive(p, true, false), false); assert.equal(C3.noteRevive(p, false, true), false); assert.equal(C3.noteRevive(p, true, true), true); assert.equal(C3.featDone('bossrevive:1', p), true); }
  /* purseback: the purse a foe carried, taken back */
  { const p = fresh(); assert.equal(C3.notePurse(p, 'spot'), false); assert.equal(C3.notePurse(p, 'door'), false); assert.equal(C3.notePurse(p, 'foe'), true); assert.equal(C3.featDone('purseback:1', p), true); }
  /* NORTH STAR: 20 s without getting 8 px nearer */
  { const st = {}; assert.equal(C3.northStep(st, 500, 0), false); assert.equal(C3.northStep(st, 495, 10), false, 'a few pixels is not progress, but 10 s is not 20 s'); assert.equal(C3.northStep(st, 495, 20.5), true); assert.equal(C3.northStep(st, 400, 21), false, 'real progress resets it'); }
  /* ---- THE SHOP: the lock + riddle + sort ---- */
  { const p = fresh(); const fd = f => C3.isFeat(f) ? C3.featDone(f, p) : false; const by = Object.fromEntries(C3.rows().map(r => [r.id, r]));
    assert.match(lockOf(by.spade, p, fd), /thief carries/); const hid = C3.hideRiddle(by.spade, true); assert.equal(hid.name, '???'); assert.match(lockOf(hid, p, fd), /thief carries/); assert.equal(C3.hideRiddle(by.spade, false).name, "GRAVEDIGGER'S SPADE", 'earned: the name shows');
    assert.match(lockOf(by.magpie, p, fd), /^all 12 silver of the first four woods \(0 of 12\) to earn it$/); assert.match(lockOf(by.crumbs, { c3: { heroLv: { x: ['a', 'b'] }, f: {}, streak: 0 } }, fd), /\(2 of 3\)/, 'the line reads the save passed in');
    /* the sort: NONE first, then everything wearable in the old order, then the locked by tier */
    const list = [{ id: 'lucky' }, { id: 'ribbon', feat: 'medals:45', tier: 0 }, ...C3.rows()]; const locked = k => k.id === 'ribbon' || (C3.isFeat(k.feat) && !C3.featDone(k.feat, p)) ? 'x' : null; const sorted = C3.sortRows([{ id: 'none' }, ...list], locked);
    assert.equal(sorted[0].id, 'none'); assert.equal(sorted[1].id, 'lucky'); assert.equal(sorted[2].id, 'ribbon'); const tiersSeen = sorted.slice(3).map(k => k.tier); assert.deepEqual(tiersSeen, [...tiersSeen].sort((a, b) => a - b), 'locked rows run early -> hard'); assert.equal(sorted.length, 15); }
  /* ---- SAVE: round trip through migrate + validate, flag on and off; PER_HERO keeps charmOf (co-op) ---- */
  { const p = { progressionVersion: 2, hero: 'knight', xp: { knight: 500 }, done: {}, coins: 40, charm: 'tell', charms: { tell: true }, charmOf: { knight: 'tell' }, c3: { f: { minino: 1 }, streak: 2, heroLv: { wood: ['knight', 'pyro'] } } };
    const out = migrateProgress(JSON.stringify(p), []).progress; assert.equal(out.charm, 'tell'); assert.deepEqual(out.c3, p.c3, 'the feats round-trip'); validateProgress(JSON.parse(JSON.stringify(out))); assert.equal(C3.worn(out.charm), 'tell'); assert.equal(C3.featDone('minino:1', out), true); assert.equal(C3.featProgress('heroclear:3', out), '2 OF 3');
    const junk = { c3: 'junk' }; C3.noteDeath(junk); assert.deepEqual(junk.c3, { f: {}, streak: 0, heroLv: {} }, 'a damaged counter is repaired, not thrown on'); }
} finally { C3.setCharms3Ship(false); }
assert.deepEqual(C3.rows(), []); assert.equal(C3.worn('tell'), null, 'flag back off: inert again');
{ const out = migrateProgress(JSON.stringify({ progressionVersion: 2, hero: 'knight', xp: { knight: 10 }, done: {}, coins: 1, charm: 'tell', charms: { tell: true }, charmOf: { knight: 'tell' }, c3: { f: {} } }), []).progress; assert.equal(C3.worn(out.charm), null, 'a flag-off build reads a feat charm as nothing'); assert.equal(out.charm, 'tell', 'and keeps the id'); }
console.log('charms4: ok (12 rows 4/5/3 tiers, feats incl. what must not count, veteran credit, riddle row + sort, save round trip, hooks, flag off inert)');
