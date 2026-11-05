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
    const ids = new Set(); for (const t of PR.TECH_LEVELS.flatMap(n => PR.techniquesAt(h, n))) { assert(t.id && t.name && t.what && t.teach && t.input, h + ' ' + t.id + ' text'); assert(!ids.has(t.id)); ids.add(t.id); }
    assert((PR.UPGRADES[h] || []).length >= 8, h + ' upgrades'); for (const u of PR.UPGRADES[h]) assert(u.what.length === 2 && !ids.has(u.id), h + ' ' + u.id);
  }
  /* the ability law, statically: every technique k is a multiplier (never flat), the AoE ceiling for the knight is 1.00 (brief sec 4) */
  for (const t of PR.TECH_LEVELS.flatMap(n => PR.techniquesAt('knight', n))) assert(t.k === null || (t.k > 0 && t.k <= 2.2), 'k ' + t.id);
});
check('cards in order', () => {
  const p = mk('knight'); let tech = [];
  for (const n of PR.TECH_LEVELS) {
    const o = PR.perkOffer(p, 'knight', n); assert(o.length >= 2 && o.length <= 3, 'L' + n); assert(o[0].tech && o[0].rec, 'L' + n + ' leads with the technique');
    assert.equal(o[0].id, PR.techniqueFor('knight', n).id, 'L' + n + ' is the next technique'); assert(PR.isFork('knight', n) ? o.length === 2 && o[1].tech : o.slice(1).every(k => !k.tech));
    assert.equal(PR.pickMilestone(p, 'knight', n, o[0].id, 50), null); tech.push(o[0].id); }
  assert(PR.TECH_LEVELS.every(n => PR.techOn(p, 'knight', PR.techniqueFor('knight', n).id)));
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
/* ==== PICK-1-OF-2 FORKS (claude/ltfork): a synthetic pair is put on the knight's L30 / L50 for these checks and taken off again ==== */
const withForks = fn => fn();   /* (claude/kfork: the Knight's real B techniques are in the data now; the synthetic pair is gone) */
check('fork data shape', () => withForks(() => {
  assert.deepEqual(PR.FORK_LEVELS, [30, 40, 50]);
  for (const n of PR.FORK_LEVELS) { assert(PR.isFork('knight', n)); const [a, b] = PR.techniquesAt('knight', n); assert.equal(PR.techniqueFor('knight', n).id, a.id, 'techniqueFor stays A'); assert.notEqual(a.role, b.role, 'roles differ'); assert.equal(PR.techniqueById('knight', b.id).id, b.id, 'byId finds B'); assert.equal(PR.techniqueLevel('knight', b.id), n); assert.deepEqual(PR.forkSiblings('knight', a.id), [b.id]); }
  assert(!PR.isFork('knight', 25)); assert.equal(PR.techniquesAt('knight', 25).length, 1); assert(PR.techniquesAt('knight', 50).every(t => t.capstone));
}));
check('fork card: both, no put-off, A recommended', () => withForks(() => {
  const p = mk('knight'); assert.equal(PR.pickMilestone(p, 'knight', 25, 'kcounter', 50), null);
  const o = PR.perkOffer(p, 'knight', 30); assert.equal(o.length, 2); assert(o.every(k => k.tech && k.fork)); assert(o[0].rec && !o[1].rec); assert.equal(o[0].id, 'kadvance'); assert.equal(o[1].id, 'klinkcut');
  assert.equal(PR.pickMilestone(p, 'knight', 30, 'klinkcut', 50), null); assert(PR.techOn(p, 'knight', 'klinkcut')); assert(!PR.techOn(p, 'knight', 'kadvance'));
  assert(PR.forkLocked(p, 'knight', 'kadvance')); assert(!PR.forkLocked(p, 'knight', 'klinkcut'));
  const next = PR.perkOffer(p, 'knight', 35); assert.equal(next[0].id, 'kpunish', 'the next card is the next technique');
}));
check('fork deferred to a later card is still a two-option card', () => withForks(() => {
  const p = mk('knight'); PR.pickMilestone(p, 'knight', 25, 'kcounter', 50);
  const o = PR.perkOffer(p, 'knight', 31 > 30 ? 35 : 35); /* L30 untaken, the L35 card re-offers the L30 pair */ assert.deepEqual(o.map(k => k.id), ['kadvance', 'klinkcut']);
  assert.equal(PR.pickMilestone(p, 'knight', 35, 'kadvance', 50), null); assert(PR.forkLocked(p, 'knight', 'klinkcut'));
  assert.equal(PR.pickMilestone(p, 'knight', 40, 'klinkcut', 50), 'Not offered');   /* the card at 40 is the L35 technique now; and a locked sibling is never taken */
}));
check('locked sibling refused', () => withForks(() => {
  const p = mk('knight'); p.card.knight.ms = { 25: 'kcounter', 30: 'kadvance' };
  assert.equal(PR.pickMilestone(p, 'knight', 35, 'klinkcut', 50), 'Not offered');   /* L35 card is the punish card, B30 not in it */
  p.card.knight.ms = { 25: 'kcounter', 30: 'kadvance', 35: 'kpunish' };
  assert.equal(PR.forkTaken(p, 'knight', 30).id, 'kadvance');
}));
check('respec forks only', () => withForks(() => {
  const p = { card: { knight: { v: 3, e: 2, m: 1, ms: { 25: 'kcounter', 30: 'klinkcut', 35: 'kpunish', 40: 'klong', 27: 'ukeep:1', 50: 'kwheel' }, up: { ukeep: 1 } } }, cardFree: { knight: 0 } };
  assert(PR.hasForkPick(p, 'knight')); assert.equal(PR.respecForks(p, 'knight'), null);
  assert.deepEqual(Object.values(p.card.knight.ms).sort(), ['kcounter', 'kpunish', 'ukeep:1'].sort()); assert.equal(p.card.knight.v, 3); assert.equal(p.card.knight.up.ukeep, 1);
  assert.equal(PR.respecForks(p, 'knight'), 'Nothing'); assert.equal(p.cardFree.knight, 0);
  PR.respecCard(p, 'knight'); assert.equal(p.cardFree.knight, 0, 'a used free respec stays used (0, not re-granted)');
}));
check('free fork re-pick: granted once, idempotent', () => withForks(() => {
  const raw = JSON.stringify({ progressionVersion: 2, xp: { knight: 83400 }, card: { knight: { v: 17, e: 16, m: 7, ms: { 25: 'kcounter', 30: 'kadvance' } } }, cardV: 1, hero: 'knight' });
  const a = PR.migrateProgress(raw, []).progress; assert.equal(a.cardFree.knight, 1, 'a fork-A holder gets the one free re-pick');
  const b = PR.migrateProgress(JSON.stringify(a), []).progress; assert.equal(b.cardFree.knight, 1);
  PR.respecForks(b, 'knight'); assert.equal(b.cardFree.knight, 0); const c = PR.migrateProgress(JSON.stringify(b), []).progress; assert.equal(c.cardFree.knight, 0, 'not re-granted after it was spent');
}));
check('clashing siblings are ignored, never an error', () => withForks(() => {
  const p = { card: { knight: { v: 0, e: 0, m: 0, ms: { 30: 'kadvance', 35: 'klinkcut' } } } }; assert.doesNotThrow(() => PR.validateProgress(p));
  assert.deepEqual(p.card.knight.ms, { 30: 'kadvance' }, 'the lower milestone key wins');
  assert.doesNotThrow(() => PR.validateProgress({ card: { knight: { v: 0, e: 0, m: 0, ms: { 30: 'gone-technique' } } } }));
}));
check('road to L50', () => withForks(() => {
  const p = mk('knight'); PR.pickMilestone(p, 'knight', 25, 'kcounter', 50); PR.pickMilestone(p, 'knight', 30, 'klinkcut', 50);
  const r = PR.roadToL50(p, 'knight', 33); assert.equal(r.length, 6); assert.deepEqual(r.map(x => x.state), ['taken', 'taken', 'next', 'ahead', 'ahead', 'ahead']);
  assert(r[1].fork && r[1].picked.id === 'klinkcut' && r[1].options.find(o => o.id === 'kadvance').locked && !r[1].options.find(o => o.id === 'klinkcut').locked);
  assert(r[5].capstone && r[5].options.length === 2 && r[5].options.every(o => !o.locked) && !r[0].fork); assert.deepEqual(PR.roadToL50(mk('warden'), 'warden', 50), []);
}));
check('knight forks are real: L30 / L40 / L50 pairs, roles differ, B is not the default', () => { for (const n of PR.FORK_LEVELS) { assert(PR.isFork('knight', n)); const [a, b] = PR.techniquesAt('knight', n); assert(a.role && b.role && a.role !== b.role && b.trade === a.trade); } assert.deepEqual(PR.techniquesAt('knight', 50).map(t => t.id), ['kcharge2', 'kwheel']); assert(!PR.isFork('knight', 25) && !PR.isFork('knight', 35) && !PR.isFork('knight', 45)); });
check('freebooter kit (claude/freebooterpack): forks at 30/40/50, roles differ, shared trade, capstone pair [fraid,fkeg], eight upgrades', () => {
  for (const n of PR.FORK_LEVELS) { assert(PR.isFork('pirate', n)); const [a, b] = PR.techniquesAt('pirate', n); assert(a.role && b.role && a.role !== b.role && b.trade === a.trade, 'L' + n); }
  assert.deepEqual(PR.techniquesAt('pirate', 50).map(t => t.id), ['fraid', 'fkeg']); assert(PR.techniquesAt('pirate', 50).every(t => t.capstone));
  assert(!PR.isFork('pirate', 25) && !PR.isFork('pirate', 35) && !PR.isFork('pirate', 45)); assert.equal(PR.UPGRADES.pirate.length, 8);
  const p = mk('pirate'); assert.equal(PR.perkOffer(p, 'pirate', 25)[0].id, 'fsteel'); assert(PR.hasKit('pirate'));
});
if (bad.length) { console.log('TECH-CARDS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Tech cards: a kit hero is dealt TECH (technique first, RECOMMENDED), UPGRADE and STAT cards L25-L50; a skipped technique is offered again; upgrades rank I then II; picks owed, respec, save validation and old-save migration hold; a hero with no kit keeps the old card.');
