// tools/starter-skill.mjs - NODE-ONLY check of THE STARTER SKILL (claude/starterskill, Daniel 11-07): every hero starts with his cheapest level-1 active ability OWNED + EQUIPPED in slot 1.
//   FRESH      a new save: every hero owns his starter and has it in slot 1, nothing else, and no coins are spent
//   MIGRATE    an old save whose hero owns nothing gets it; one that owns abilities (equipped or not) is left exactly as it is; passives never count; no refund, nothing removed
//   ONCE       a second load changes nothing; a hero who unequips his starter keeps owning it and is not re-granted
//   COOP       a seat's snapshot (fresh, from a slot, from an old client) has the hero's starter in the view
//   CARD       the skills first card waits until an ability is equipped
// usage: node tools/starter-skill.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { migrateProgress, HERO_IDS, STARTER_SKILLS, starterSkillFor, grantStarter, grantStarters, skillsFor, skillFor, equipped, equipSkill, slotsAt } from '../src/progression.js';
import * as CS from '../src/coop-save.js';
import * as FC from '../src/first-cards.js';

/* the choice per hero: the lowest-level active, then the cheapest */
for (const h of HERO_IDS) {
  const id = STARTER_SKILLS[h], n = skillFor(h, id); assert.ok(n && n.active, h + ': a starter that is an active ability');
  const acts = skillsFor(h).filter(x => x.active); assert.ok(acts.every(x => x.level > n.level || (x.level === n.level && x.price >= n.price)), h + ': nothing active is lower or cheaper than ' + id);
  assert.equal(n.level, 1, h + ': the starter is a level-1 ability'); assert.equal(starterSkillFor(h), id);
}
/* FRESH */
{ const p = migrateProgress(null).progress;
  for (const h of HERO_IDS) { assert.deepEqual(Object.keys(p.skillOwned[h]), [STARTER_SKILLS[h]], h + ' owns exactly his starter'); assert.deepEqual(p.loadouts[h], [STARTER_SKILLS[h]], h + ' has it in slot 1'); assert.deepEqual(equipped(p, h, 1), [STARTER_SKILLS[h]]); }
  assert.equal(p.coins || 0, 0, 'no gold is spent or paid for it');
  const again = migrateProgress(JSON.stringify(p)); assert.equal(again.changed, false); assert.deepEqual(again.progress, p, 'a second load changes nothing'); }
/* MIGRATE: an old save (v2) whose heroes hold nothing, one that owns a skill, one that owns skills but has nothing equipped, a passive-only one */
{ const k = STARTER_SKILLS.knight, w2 = skillsFor('warden').filter(n => n.active)[1].id, g2 = skillsFor('geomancer').filter(n => n.active)[1].id, pas = skillsFor('ranger').find(n => !n.active);
  const raw = { progressionVersion: 2, hero: 'knight', coins: 321, xp: { knight: 500 }, skillOwned: { warden: { [w2]: true }, geomancer: { [g2]: true }, ranger: pas ? { [pas.id]: true } : {} }, loadouts: { warden: [w2], geomancer: [] } };
  const o = migrateProgress(JSON.stringify(raw)).progress;
  assert.deepEqual(o.skillOwned.knight, { [k]: true }); assert.deepEqual(o.loadouts.knight, [k], 'a hero with nothing gets his starter, equipped');
  assert.deepEqual(o.skillOwned.warden, { [w2]: true }); assert.deepEqual(o.loadouts.warden, [w2], 'a hero who owns something is untouched (equipped)');
  assert.deepEqual(o.skillOwned.geomancer, { [g2]: true }); assert.deepEqual(o.loadouts.geomancer, [], 'owns an ability, nothing equipped: left as he is (no starter forced in)');
  if (pas) { assert.equal(o.skillOwned.ranger[pas.id], true, 'a passive stays'); assert.equal(o.skillOwned.ranger[STARTER_SKILLS.ranger], true, 'passives do not count as owning an ability'); assert.deepEqual(o.loadouts.ranger, [STARTER_SKILLS.ranger]); }
  assert.equal(o.coins, 321, 'no refund, no charge'); assert.equal(o.xp.knight, 500); }
/* a pre-skills save (version 0, the whole migration path) lands with starters too */
{ const o = migrateProgress(JSON.stringify({ hero: 'knight', wood: { cleared: true }, coins: 5 }), ['wood']).progress; for (const h of HERO_IDS) assert.deepEqual(o.loadouts[h], [STARTER_SKILLS[h]], h + ' (pre-v1 save)'); }
/* ONCE: unequip keeps ownership and never re-grants */
{ const p = migrateProgress(null).progress, k = STARTER_SKILLS.knight; assert.equal(equipSkill(p, 'knight', null, 0, 1, true), null); assert.ok(!p.loadouts.knight.some(Boolean));
  const r = migrateProgress(JSON.stringify(p)).progress; assert.ok(!r.loadouts.knight.some(Boolean), 'a hero who put his starter away is not given it back'); assert.equal(r.skillOwned.knight[k], true);
  assert.equal(grantStarter(r, 'knight'), false); assert.equal(grantStarters(r), 0, 'nothing left to grant'); assert.equal(slotsAt(1), 1); }
/* grantStarter on a bare object (a hero unlocked later, any path) */
{ const p = {}; assert.equal(grantStarter(p, 'pirate'), true); assert.deepEqual(p.skillOwned.pirate, { [STARTER_SKILLS.pirate]: true }); assert.deepEqual(p.loadouts.pirate, [STARTER_SKILLS.pirate]); assert.equal(grantStarter(p, 'pirate'), false); assert.equal(grantStarter(null, 'pirate'), false); assert.equal(grantStarter({}, 'nobody'), false); }
/* COOP: a fresh seat, a seat from an old client's snapshot (no skills at all), a seat from an old slot */
{ const f = CS.freshSeat('ranger', 3); assert.deepEqual(f.view.loadouts.ranger, [STARTER_SKILLS.ranger]); assert.equal(f.view.skillOwned.ranger[STARTER_SKILLS.ranger], true);
  const snap = CS.snapshotOf(migrateProgress(null).progress, 'warden', 1); delete snap.data.skillOwned; delete snap.data.loadouts; const s = CS.cleanSnapshot(snap);
  assert.ok(s, 'an old client snapshot is still accepted'); assert.deepEqual(s.view.loadouts.warden, [STARTER_SKILLS.warden], 'and its hero gets his starter in the seat view');
  const mem = new Map(), store = { getItem: k => mem.has(k) ? mem.get(k) : null, setItem: (k, v) => mem.set(k, v), removeItem: k => mem.delete(k) };
  store.setItem(CS.slotKeys()[0], JSON.stringify({ progressionVersion: 2, hero: 'knight', xp: { geomancer: 40 } })); const g = CS.seatFromSlot(store, 0, 'geomancer');
  assert.deepEqual(g.view.loadouts.geomancer, [STARTER_SKILLS.geomancer], 'a seat from an old slot has it'); }
/* CARD: the skills card waits for an equipped ability */
{ const p = migrateProgress(null).progress; assert.equal(FC.skillsReady(p, 'knight', 1), true, 'a fresh hero: the card may come');
  equipSkill(p, 'knight', null, 0, 1, true); assert.equal(FC.skillsReady(p, 'knight', 1), false, 'nothing equipped: the card waits'); assert.equal(FC.skillsReady(null, 'knight', 1), false);
  equipSkill(p, 'knight', STARTER_SKILLS.knight, 0, 1, true); assert.equal(FC.skillsReady(p, 'knight', 1), true, 'equipped again: it comes');
  const q = { loadouts: { knight: [] }, skillOwned: {} }; assert.equal(FC.skillsReady(q, 'knight', 1), false); }
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(main.includes("!FC.told(PROG, 'skills') && !live && P.ground && FC.skillsReady(PROG, hero(), heroLevel())"), 'main.js: the calm timer for the skills card runs only with an ability equipped');
console.log('starter-skill ok: ' + HERO_IDS.map(h => h + '=' + STARTER_SKILLS[h]).join(' '));
