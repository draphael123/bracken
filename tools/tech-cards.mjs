/* tools/tech-cards.mjs - THE L25-L50 CARD v2 FRAMEWORK (claude/knightid; node only, no browser): tech / upgrade / stat cards for a hero with a kit,
   the deferral rule, ranked upgrades (II needs I), the save shape + respec + validation, and that a hero with no kit keeps the old card. */
import assert from 'node:assert/strict';
import * as PR from '../src/progression.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const mk = h => ({ card: { [h]: { v: 0, e: 0, m: 0, ms: {} } } });

check('shape', () => {
  assert.deepEqual(PR.TECH_LEVELS, [25, 30, 35, 40, 45, 50]); assert.equal(PR.UPGRADE_LEVELS.length, 10);
  assert(PR.hasKit('knight')); assert(!PR.hasKit('pyro'));
  for (const h of Object.keys(PR.TECHNIQUES)) {
    assert.deepEqual(Object.keys(PR.TECHNIQUES[h]).map(Number), PR.TECH_LEVELS, h + ' needs one technique per tech level');
    const ids = new Set(); for (const t of Object.values(PR.TECHNIQUES[h])) { assert(t.id && t.name && t.what && t.teach && t.input, h + ' ' + t.id + ' text'); assert(!ids.has(t.id)); ids.add(t.id); }
    assert((PR.UPGRADES[h] || []).length >= 8, h + ' upgrades'); for (const u of PR.UPGRADES[h]) assert(u.what.length === 2 && !ids.has(u.id), h + ' ' + u.id);
  }
  /* the ability law, statically: every technique k is a multiplier (never flat), the AoE ceiling for the knight is 1.00 (brief sec 4) */
  for (const t of Object.values(PR.TECHNIQUES.knight)) assert(t.k === null || (t.k > 0 && t.k <= 2.2), 'k ' + t.id);
});
check('cards in order', () => {
  const p = mk('knight'); let tech = [];
  for (const n of PR.TECH_LEVELS) {
    const o = PR.perkOffer(p, 'knight', n); assert(o.length >= 2 && o.length <= 3, 'L' + n); assert(o[0].tech && o[0].rec, 'L' + n + ' leads with the technique');
    assert.equal(o[0].id, PR.TECHNIQUES.knight[n].id, 'L' + n + ' is the next technique'); assert(o.slice(1).every(k => !k.tech));
    assert.equal(PR.pickMilestone(p, 'knight', n, o[0].id, 50), null); tech.push(o[0].id); }
  assert(PR.TECH_LEVELS.every(n => PR.techOn(p, 'knight', PR.TECHNIQUES.knight[n].id)));
});
check('deferral', () => {
  const p = mk('knight'); const o25 = PR.perkOffer(p, 'knight', 25); const up = o25.find(k => k.up); assert(up, 'upgrade option at L25');
  assert.equal(PR.pickMilestone(p, 'knight', 25, up.id, 50), null);   /* skip the technique */
  assert(!PR.techOn(p, 'knight', 'kcounter')); const o30 = PR.perkOffer(p, 'knight', 30); assert.equal(o30[0].id, 'kcounter', 'the skipped technique is offered again at L30 (deferred, not lost)');
  assert.equal(PR.pickMilestone(p, 'knight', 30, 'kcounter', 50), null); assert(PR.techOn(p, 'knight', 'kcounter'));
  assert.equal(PR.perkOffer(p, 'knight', 35)[0].id, 'kadvance', 'the next card is the next technique in order');
});
check('upgrades rank I then II', () => {
  const p = mk('knight'); const seen = [];
  for (const n of PR.UPGRADE_LEVELS) { const o = PR.perkOffer(p, 'knight', n); assert(o.length >= 2 && o[0].up && o[0].rec, 'L' + n); assert.equal(new Set(o.map(k => k.id)).size, o.length, 'L' + n + ' repeats');
    for (const k of o) if (k.up && k.rank === 2) assert(PR.upgRank(p, 'knight', k.upgrade) === 1, 'II offered before I: ' + k.id);
    assert.equal(PR.pickMilestone(p, 'knight', n, o[0].id, 50), null); seen.push(o[0].id); }
  assert.equal(new Set(seen).size, 10, 'ten different upgrade picks in ten cards'); assert(Object.values(p.card.knight.up).every(r => r >= 1 && r <= 2));
  assert.equal(PR.pickMilestone(p, 'knight', 27, 'nope:1', 50), 'No milestone owed');
  const q = mk('knight'); assert.equal(PR.pickMilestone(q, 'knight', 27, 'ukeep:2', 50), 'Not offered', 'rank II without I');
});
check('picks owed', () => {
  assert.equal(PR.picksOwed(mk('knight'), 'knight', 24), 24); assert.equal(PR.picksOwed(mk('knight'), 'knight', 25), 24, 'L25 is a tech card, not a stat pick');
  assert.equal(PR.picksOwed(mk('knight'), 'knight', 50), 34, '50 levels - 6 tech - 10 upgrade'); assert.equal(PR.milestonesOwed(mk('knight'), 'knight', 50).length, 4 + 6 + 10);
  assert.equal(PR.picksOwed(mk('pyro'), 'pyro', 50), 50, 'a hero with no kit keeps a stat pick every level'); assert.equal(PR.milestonesOwed(mk('pyro'), 'pyro', 50).length, 10);
});
check('respec + save shape', () => {
  const p = mk('knight'); PR.pickMilestone(p, 'knight', 25, 'kcounter', 50); PR.pickMilestone(p, 'knight', 27, PR.perkOffer(p, 'knight', 27)[0].id, 50);
  assert(Object.keys(p.card.knight.up).length === 1); PR.validateProgress(JSON.parse(JSON.stringify(p)));
  assert.throws(() => PR.validateProgress({ card: { knight: { v: 0, e: 0, m: 0, ms: {}, up: { ukeep: 9 } } } }), /upgrades/);
  assert.throws(() => PR.validateProgress({ card: { knight: { v: 0, e: 0, m: 0, ms: {}, up: [] } } }), /upgrades/);
  PR.respecCard(p, 'knight'); assert.deepEqual(p.card.knight.up, {}); assert.deepEqual(p.card.knight.ms, {}); assert.equal(PR.picksOwed(p, 'knight', 50), 34);
});
check('old save migrates', () => {
  const old = JSON.stringify({ progressionVersion: 2, xp: { knight: 83400 }, card: { knight: PR.evenCard(50) }, cardV: 1, hero: 'knight', loadouts: { knight: ['lunge'] }, skillOwned: { knight: { lunge: true, vengeance: true, sunder: true } } });
  const r = PR.migrateProgress(old, []); assert.equal(r.progress.card.knight.v + r.progress.card.knight.e + r.progress.card.knight.m, 50);
  assert.equal(PR.picksOwed(r.progress, 'knight', 50), 0, 'old stat picks are kept, none owed'); assert.equal(PR.milestonesOwed(r.progress, 'knight', 50).length, 20, 'four small perks (L5-L20, owed as ever), six techniques and ten upgrades');
  assert.equal(r.progress.skillOwned.knight.vengeance, true, 'a renamed or merged passive id is kept');
});
check('no-kit hero offer unchanged', () => {
  const o = PR.perkOffer(mk('warden'), 'warden', 25); assert.equal(o.length, 3); assert(!o.some(k => k.tech || k.up)); assert(o.some(k => k.own));
});
if (bad.length) { console.log('TECH-CARDS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Tech cards: a kit hero is dealt TECH (technique first, RECOMMENDED), UPGRADE and STAT cards L25-L50; a skipped technique is offered again; upgrades rank I then II; picks owed, respec, save validation and old-save migration hold; a hero with no kit keeps the old card.');
