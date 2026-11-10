// tools/traits.mjs - THE TRAITS FRAMEWORK, node only (claude/traitframe; plan passiveplan.md sec 6.6). No browser.
//   node tools/traits.mjs
// Core passives on at their level; a trait on only while worn in a slot the level has; slot 2 at L20; ranks 0.70/0.85/1.0; migrate idempotent;
// a v2 save round-trips; with TRAITS_SHIP off NOTHING differs from today. Data-agnostic: it reads each split hero's own rows from src/traits.js.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SKILLS, passiveOn, migrateProgress, validateProgress, wearTrait, migrateTraits, HERO_IDS, TRT } from '../src/progression.js';
import { xpFloor } from '../src/xp.js';
const T = TRT;
assert.equal(T.TRAITS_SHIP, false, 'ships dark');
assert.equal(T.traitsShip(), false);
const legacy = (p, h, id, lv) => { const n = SKILLS.find(x => x.hero === h && x.id === id); return !!n && !n.active && (lv >= n.level || !!(p && p.skillOwned && p.skillOwned[h] && p.skillOwned[h][id])); };

/* 1. FLAG OFF: every passive of every hero is exactly today's, at every level, owned or not */
for (const h of HERO_IDS) for (const n of SKILLS.filter(x => x.hero === h && !x.active)) for (const lv of [1, 5, 10, 19, 20, 24, 50]) for (const own of [false, true]) {
  const p = { skillOwned: { [h]: own ? { [n.id]: true } : {} }, traits: { [h]: [] } };
  assert.equal(passiveOn(p, h, n.id, lv), legacy(p, h, n.id, lv), 'flag off differs: ' + h + '/' + n.id + '@' + lv);
}
const v2 = () => ({ progressionVersion: 2, xp: { knight: xpFloor(21) }, hero: 'knight', done: { knight: { stockade: 1 } }, coins: 5, skillOwned: { knight: { shieldThrow: true } }, loadouts: { knight: ['shieldThrow'] }, bossRecords: {} });
{ const out = migrateProgress(JSON.stringify(v2()), []).progress; assert.equal(out.traits, undefined, 'flag off: no p.traits written'); }

/* 2. FLAG ON */
T.setTraitsShip(true);
try {
  const split = HERO_IDS.filter(T.hasSplit); assert(split.includes('knight'), 'knight is seeded');
  assert.deepEqual([T.RANK[0], T.RANK[1], T.RANK[2]], [0.7, 0.85, 1]);
  for (const [lv, r] of [[1, 0], [9, 0], [10, 1], [19, 1], [20, 2], [50, 2]]) assert.equal(T.traitRank(lv), r, 'rank at ' + lv);
  assert.deepEqual([T.traitSlotsAt(1), T.traitSlotsAt(19), T.traitSlotsAt(20)], [1, 1, 2]);
  for (const h of split) {
    const s = T.TRAIT_SPLIT[h];
    /* every passive of the hero is classified (no 'cut' by accident): core, trait, merged, folded, shared or retired */
    for (const n of SKILLS.filter(x => x.hero === h && !x.active)) { const k = T.kindOf(h, n.id); assert(['core', 'trait', 'merged', 'folded', 'shared', 'retired'].includes(k), h + '/' + n.id + ' is ' + k + ' (list it in the split)'); }
    assert(s.defaults.every(id => T.slottable(h).includes(id)), h + ' defaults are slottable');
    for (const id of T.traitIds(h)) assert(T.learnLevel(h, id) <= 18, h + '/' + id + ' arrives by L18 (so it reaches rank III at L20)');
    for (const id of s.core) { const n = SKILLS.find(x => x.hero === h && x.id === id); assert(n.level <= 20, h + ' core ' + id + ' by L20'); }
    /* core is on at its level, whatever is worn */
    const bare = { traits: { [h]: [] } };
    for (const id of s.core) { const n = SKILLS.find(x => x.hero === h && x.id === id); assert.equal(passiveOn(bare, h, id, n.level), true); assert.equal(passiveOn(bare, h, id, n.level - 1), false); }
    /* a trait is on ONLY while worn in a slot the level has, and learned */
    const [a, b] = s.defaults, lv24 = 24, lv10 = 10;
    const p = { traits: { [h]: [a] } };
    assert.equal(passiveOn(p, h, a, lv24), true, 'worn default on');
    for (const id of T.traitIds(h)) if (id !== a) assert.equal(passiveOn(p, h, id, lv24), false, 'unworn trait off: ' + id);
    assert.equal(passiveOn({ traits: { [h]: [a, b] } }, h, b, lv10), false, 'slot 2 is not open at L10');
    assert.equal(passiveOn({ traits: { [h]: [a, b] } }, h, b, 20), true, 'slot 2 opens at L20');
    assert.equal(passiveOn({ traits: { [h]: [a] } }, h, a, T.learnLevel(h, a) - 1), false, 'worn but not learned = off');
    /* a hero with no p.traits wears his defaults (bots, partners, a save before the flip) */
    assert.equal(passiveOn({}, h, a, lv24), true); assert.equal(passiveOn({}, h, b, lv24), true); assert.equal(passiveOn({}, h, b, lv10), false);
    /* wear / swap / unwear */
    const q = { traits: { [h]: [a, b] } };
    assert.equal(wearTrait(q, h, b, 0, 20), null); assert.deepEqual(q.traits[h], [b, a], 'swap');
    assert.equal(wearTrait(q, h, null, 1, 20), null); assert.deepEqual(q.traits[h], [b]);
    assert.match(wearTrait(q, h, a, 1, 19), /second trait slot/);
    assert.match(wearTrait(q, h, 'nope', 0, 20), /Not a trait/);
    const other = T.traitIds(h).find(id => T.learnLevel(h, id) > 3); if (other) assert.match(wearTrait({ traits: {} }, h, other, 0, 3), /Learned at level/);
    /* rank scales a worn trait; core is 1 */
    assert.equal(T.traitScale(p, h, a, 5), 0.7); assert.equal(T.traitScale(p, h, a, 12), 0.85); assert.equal(T.traitScale(p, h, a, 24), 1);
    if (s.core[0]) assert.equal(T.traitScale(p, h, s.core[0], 5), 1);
  }
  /* an unsplit hero is judged as today even with the flag on */
  for (const h of HERO_IDS.filter(x => !T.hasSplit(x))) for (const n of SKILLS.filter(x => x.hero === h && !x.active).slice(0, 5)) assert.equal(passiveOn({ traits: { [h]: [] } }, h, n.id, 24), legacy({}, h, n.id, 24), 'unsplit ' + h + '/' + n.id);
  /* merged: reads its host's slot (a temporary row, put back) */
  { const sp = T.TRAIT_SPLIT.knight, keepM = sp.merged, keepF = sp.folded; sp.merged = { bleed: ['riposte'] }; sp.folded = {};
    assert.equal(T.kindOf('knight', 'riposte'), 'merged');
    assert.equal(passiveOn({ traits: { knight: ['bleed'] } }, 'knight', 'riposte', 24), true, 'merged on with host'); assert.equal(passiveOn({ traits: { knight: ['vengeance'] } }, 'knight', 'riposte', 24), false);
    sp.merged = keepM; sp.folded = keepF; }
  /* shared: worn + unlocked (account-wide: any hero's first clear) */
  { const sh = T.SHARED_TRAITS[0];
    assert.equal(T.sharedOn({ traits: { knight: [sh.id] } }, 'knight', sh.id, 24), false, 'locked until a first clear');
    assert.equal(T.sharedOn({ traits: { knight: [sh.id] }, done: { warden: { [sh.needs]: 1 } } }, 'knight', sh.id, 24), true, 'account-wide unlock (another hero cleared it)');
    assert.equal(passiveOn({ traits: { knight: [sh.id] }, done: { knight: { [sh.needs]: 1 } } }, 'knight', sh.id, 24), true, "the knight's own catalog id reads the shared slot"); }
  /* SHARED lane (11-09): the six are hero-agnostic. Region ids are REAL level ids (read from level.js, not guessed); each unlocks account-wide by its own first clear;
     every split hero can wear them; none is ever a hero's default (a shared trait is a sidegrade, never the best slot); legacy catalog ids exist. */
  { const lvSrc = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');
    const want = { airRoll: 'stockade', lightStep: 'kings', momentum: 'moor', hangCut: 'spire', airDash: 'fields', execute: 'mage' };
    assert.equal(T.SHARED_TRAITS.length, 6);
    for (const sh of T.SHARED_TRAITS) {
      assert.equal(sh.needs, want[sh.id], sh.id + ' region id');
      assert.ok(new RegExp("\{ id: '" + sh.needs + "', name:").test(lvSrc), sh.id + ': level id ' + sh.needs + ' is not a real level in level.js');
      assert.equal(T.sharedUnlocked({}, sh.id), false); assert.equal(T.sharedUnlocked({ done: { ranger: { [sh.needs]: 1 } } }, sh.id), true, 'account-wide');
      assert.equal(T.sharedUnlocked({ done: { ranger: { zzz: 1 } } }, sh.id), false, 'only its own region');
      for (const [hh, lid] of Object.entries(sh.legacy || {})) assert.ok(SKILLS.some(x => x.hero === hh && x.id === lid && !x.active), 'legacy ' + hh + '/' + lid);
      for (const h of HERO_IDS.filter(x => T.hasSplit(x))) {
        assert.ok(T.isSlottable(h, sh.id), h + ' can wear ' + sh.id);
        assert.ok(!(T.TRAIT_SPLIT[h].defaults || []).includes(sh.id), h + ': a shared trait is never a default (sidegrade rule)');
        const own = { traits: { [h]: [sh.id] }, done: { [h]: { [sh.needs]: 1 } } };
        assert.equal(T.sharedOn(own, h, sh.id, 24), true, h + '/' + sh.id + ' on when worn + cleared'); assert.equal(T.sharedOn({ traits: { [h]: [] }, done: own.done }, h, sh.id, 24), false, 'off when not worn');
        assert.equal(T.sharedOn({ ...own, traits: { [h]: ['zzz', sh.id] } }, h, sh.id, 10), false, 'slot 2 needs L20'); } }
    /* the two old hero ids stay off while the flag is on: they ride the shared row now */
    if (T.hasSplit('pirate')) assert.equal(passiveOn({ traits: { pirate: ['longBarrel'] }, done: { pirate: { stockade: 1 } } }, 'pirate', 'swash', 24), false, 'swash is the shared AIR ROLL now');
    if (T.hasSplit('reaper')) assert.equal(passiveOn({ traits: { reaper: ['deepRed'] }, done: { reaper: { mage: 1 } } }, 'reaper', 'winnow', 24), false, 'winnow is the shared EXECUTIONER now');
    /* rank scales shared numbers on any hero, 1.0 at L20 */
    for (const h of HERO_IDS) { assert.equal(T.traitScale({}, h, 'momentum', 5), 0.7); assert.equal(T.traitScale({}, h, 'momentum', 12), 0.85); assert.equal(T.traitScale({}, h, 'momentum', 20), 1); }
    /* main.js: the shared sites carry no hero test on the flag-on path */
    const mj = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
    assert.ok(/TRT\.traitsShip\(\) \? \(P\.heavySwing \|\| P\.heavy\) && !e\.mini : !isPyro\(\) && !isPaladin\(\) && P\.heavySwing/.test(mj), 'EXECUTIONER: flag on = any hero, never a mini; off = the old line');
    assert.ok(/trk\('momentum'\)/.test(mj) && /trk\('lightStep'\)/.test(mj) && /trk\('airRoll'\)/.test(mj) && /trk\('execute'\)/.test(mj), 'rank scales read at the shared sites'); }
  /* PvP: EVEN L1 = core only */
  { const p = { traits: { knight: ['vengeance'] } }; T.setPvpEvenTraits(true); assert.equal(passiveOn(p, 'knight', 'vengeance', 24), false); assert.equal(passiveOn(p, 'knight', 'thirdCut', 24), true); T.setPvpEvenTraits(false); assert.equal(passiveOn(p, 'knight', 'vengeance', 24), true); }
  /* lab override */
  { T.setLabTraits('core'); assert.equal(passiveOn({}, 'knight', 'vengeance', 24), false); T.setLabTraits(['bleed']); assert.equal(passiveOn({}, 'knight', 'bleed', 24), true); T.setLabTraits(null); }

  /* SAVE: validate DROPS bad entries (never throws); migrate is idempotent; a v2 save round-trips */
  { const bad = v2(); bad.traits = { knight: ['vengeance', 'vengeance', 'zzz', 'bash'], nobody: ['x'], pyro: 'no' };
    const out = validateProgress(JSON.parse(JSON.stringify(bad))); assert.deepEqual(out.traits, { knight: ['vengeance'] }, JSON.stringify(out.traits)); }
  { const bad = v2(); bad.traits = 7; assert.equal(validateProgress(bad).traits, undefined); }
  { const p = migrateProgress(JSON.stringify(v2()), []).progress; assert.deepEqual(p.traits.knight, ['vengeance', 'bash'], 'L21 gets both defaults');
    const again = JSON.parse(JSON.stringify(p)); assert.equal(migrateTraits(again), false, 'idempotent'); assert.deepEqual(again.traits, p.traits);
    p.traits.knight = ['bleed']; const keep = migrateProgress(JSON.stringify(p), []).progress; assert.deepEqual(keep.traits.knight, ['bleed'], 'an existing choice is never overwritten');
    const young = v2(); young.xp.knight = xpFloor(4); const y = migrateProgress(JSON.stringify(young), []).progress; assert.deepEqual(y.traits.knight, ['vengeance'], 'L4: one slot');
    const rt = migrateProgress(JSON.stringify(keep), []).progress; assert.deepEqual(rt, migrateProgress(JSON.stringify(rt), []).progress, 'round trip stable'); }
  /* level-up words */
  assert.match(T.traitUpText('knight', 1, 2), /TRAIT LEARNED/); assert.match(T.traitUpText('knight', 9, 10), /RANK II/); assert.match(T.traitUpText('knight', 19, 20), /RANK III.*SECOND TRAIT SLOT/);
  assert.equal(T.traitUpText('pyro', 1, 24), '', 'unsplit hero: the old line');
  assert.deepEqual(T.traitRows('knight').slice(0, 5).map(r => r.tkind), ['core', 'core', 'core', 'core', 'core']);
} finally { T.setTraitsShip(false); }
assert.equal(T.traitsShip(), false);
console.log('traits ok: flag-off identical for ' + HERO_IDS.length + ' heroes; knight core/traits/slots/ranks/migrate/round-trip/shared (6, region ids vs level.js, every hero)/pvp/lab pass');
