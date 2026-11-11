// tools/traits.mjs - THE TRAITS FRAMEWORK, node only (claude/traitframe; plan passiveplan.md sec 6.6). No browser.
//   node tools/traits.mjs
// Core passives on at their level; a trait on only while worn in a slot the level has; slot 2 at L20; ranks 0.70/0.85/1.0; migrate idempotent;
// a v2 save round-trips; with TRAITS_SHIP off NOTHING differs from today. Data-agnostic: it reads each split hero's own rows from src/traits.js.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readFileSync } from 'node:fs';
import { SKILLS, passiveOn, migrateProgress, validateProgress, wearTrait, migrateTraits, HERO_IDS, TRT } from '../src/progression.js';
import { xpFloor } from '../src/xp.js';
const T = TRT;
/* (claude/traitsmoke-d) the shipped value is not asserted (the flip commit must not break this tool); section 1 is the FLAG OFF path, so it starts by turning the flag off */
T.setTraitsShip(false);
assert.equal(T.traitsShip(), false);
const legacy = (p, h, id, lv) => { const n = SKILLS.find(x => x.hero === h && x.id === id); return !!n && !n.active && (lv >= n.level || !!(p && p.skillOwned && p.skillOwned[h] && p.skillOwned[h][id])); };

/* 1. FLAG OFF: every passive of every hero is exactly today's, at every level, owned or not */
for (const h of HERO_IDS) for (const n of SKILLS.filter(x => x.hero === h && !x.active)) for (const lv of [1, 5, 10, 19, 20, 24, 50]) for (const own of [false, true]) {
  const p = { skillOwned: { [h]: own ? { [n.id]: true } : {} }, traits: { [h]: [] } };
  assert.equal(passiveOn(p, h, n.id, lv), legacy(p, h, n.id, lv), 'flag off differs: ' + h + '/' + n.id + '@' + lv);
}
const v2 = () => ({ progressionVersion: 2, xp: { knight: xpFloor(21) }, hero: 'knight', done: { knight: { stockade: 1 } }, coins: 5, skillOwned: { knight: { shieldThrow: true } }, loadouts: { knight: ['shieldThrow'] }, bossRecords: {} });
{ const out = migrateProgress(JSON.stringify(v2()), []).progress; assert.equal(out.traits, undefined, 'flag off: no p.traits written'); }

/* 1b. FLAG OFF, TRAITDATA-A: the 4 NEW geomancer traits are not in the catalog and are never on, at any level, owned or not */
for (const n of T.NEW_TRAITS) { assert(!SKILLS.some(x => x.id === n.id), n.id + ' is not a catalog node'); for (const lv of [1, 10, 24, 50]) assert.equal(passiveOn({ traits: { [n.hero]: [n.id] }, skillOwned: { [n.hero]: { [n.id]: true } } }, n.hero, n.id, lv), false, 'flag off: ' + n.id); }
assert.equal(T.rankLack(T.traitScale({}, 'knight', 'plated', 5)), 0, 'flag off: no rank penalty anywhere');
/* the multiplier pattern the effect sites use is EXACTLY x at rank III (so flag off / rank III change nothing): 1 + (x - 1) * 1 === x for every x in the code */
for (const x of [1.25, 1.4, 1.5, 1.6, 2, 2.6, 4 / 3]) assert.equal(1 + (x - 1) * 1, x, 'mulK exact at k=1 for ' + x);
assert.equal(T.rankLack(1), 0); assert(Math.abs(T.rankLack(0.7) - 1) < 1e-9); assert(Math.abs(T.rankLack(0.85) - 0.5) < 1e-9);

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
    for (const n of SKILLS.filter(x => x.hero === h && !x.active)) { const k = T.kindOf(h, n.id); assert(['core', 'trait', 'merged', 'folded', 'shared', 'retired'].includes(k) || (k === 'cut' && (s.cut || []).includes(n.id)), h + '/' + n.id + ' is ' + k + ' (list it in the split, or in cut:[] if it is a deliberate cut)'); }
    assert(s.defaults.every(id => T.slottable(h).includes(id)), h + ' defaults are slottable');
    for (const id of T.traitIds(h)) assert(T.learnLevel(h, id) <= 18, h + '/' + id + ' arrives by L18 (so it reaches rank III at L20)');
    for (const id of s.core) { const n = SKILLS.find(x => x.hero === h && x.id === id); assert((T.coreLevel ? T.coreLevel(h, id) : n.level) <= 20, h + ' core ' + id + ' by L20'); }
    /* core is on at its level, whatever is worn */
    const bare = { traits: { [h]: [] } };
    for (const id of s.core) { const cl = T.coreLevel(h, id); assert.equal(passiveOn(bare, h, id, cl), true); assert.equal(passiveOn(bare, h, id, cl - 1), false); }
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
  /* TRAITDATA-A: knight, warden, ranger, geomancer - the table as built (plan passiveplan sec 2) */
  const A = {
    knight: { core: 6, traits: 10, folded: 0, merged: 0, retired: 0, shared: 6, total: 22, def: ['vengeance', 'bash'] },
    warden: { core: 5, traits: 10, folded: 4, merged: 3, retired: 1, shared: 0, total: 23, def: ['vaulter', 'everReady'] },
    ranger: { core: 5, traits: 10, folded: 4, merged: 1, retired: 1, shared: 0, total: 21, def: ['rgKill', 'rgCover'] },
    geomancer: { core: 4, traits: 9, folded: 0, merged: 1, retired: 0, shared: 0, total: 10, def: ['geoAftershock', 'geoShrapnel'], newTraits: 4 },
  };
  for (const [h, w] of Object.entries(A)) {
    const s = T.TRAIT_SPLIT[h]; assert(T.hasSplit(h), h + ' is split');
    assert.deepEqual([s.core.length, s.traits.length, Object.keys(s.folded).length, Object.values(s.merged).flat().length, s.retired.length, s.shared.length], [w.core, w.traits, w.folded, w.merged, w.retired, w.shared], h + ' table shape');
    const cat = SKILLS.filter(x => x.hero === h && !x.active), listed = [...s.core, ...s.traits, ...Object.keys(s.folded), ...Object.values(s.merged).flat(), ...s.retired.filter(id => !(id in s.folded)), ...s.shared];   /* (claude/rangerfork) a folded id that retired with FORKS_SHIP is one id, listed once */
    assert.equal(new Set(listed).size, listed.length, h + ': no id is listed twice');
    for (const n of cat) assert(listed.includes(n.id), h + '/' + n.id + ' unlisted');
    for (const id of listed) assert(cat.some(n => n.id === id) || T.isNewTrait(h, id), h + '/' + id + ' is neither a catalog passive nor a NEW trait');
    assert.equal(cat.length, w.total, h + ' catalog passive count (' + cat.length + ')');
    assert.deepEqual(s.defaults, w.def, h + ' defaults');
    for (const id of s.defaults) assert(T.learnLevel(h, id) <= 10, h + ' default ' + id + ' arrives by L10');
    for (const id of T.traitIds(h)) assert(T.learnLevel(h, id) <= 18, h + '/' + id + ' by L18');
    /* a merged passive is on exactly when its host is worn, and is the same rank */
    for (const [host, ids] of Object.entries(s.merged)) for (const id of ids) {
      assert.equal(T.kindOf(h, id), 'merged', id); assert.equal(passiveOn({ traits: { [h]: [host] } }, h, id, 24), true, id + ' on with ' + host); assert.equal(passiveOn({ traits: { [h]: [] } }, h, id, 24), false, id + ' off without ' + host);
      assert.equal(T.traitScale({ traits: { [h]: [host] } }, h, id, 12), 0.85, id + ' ranks with its host'); }
    for (const id of s.retired) { assert.equal(T.kindOf(h, id), 'retired'); assert.equal(passiveOn({ traits: { [h]: [id] } }, h, id, 24), false, id + ' never on'); assert(!T.slottable(h).includes(id), id + ' never slots'); }
    for (const id of s.core) assert.equal(T.traitScale({ traits: { [h]: [] } }, h, id, 5), 1, id + ' is core: no rank');
    /* every ranked trait of these heroes has a rank number at an effect site (the source names it); FLAT = boolean by nature, rank-flat on purpose */
    const FLAT = new Set(['geoFourth']);
    const src = ['main', 'geomancer', 'ranger', 'crouch-a'].map(f => readFileSync(new URL('../src/' + f + '.js', import.meta.url), 'utf8')).join('\n');
    for (const id of [...s.traits, ...Object.keys(s.folded), ...Object.values(s.merged).flat()]) {
      if (FLAT.has(id)) continue;
      const re = new RegExp("(trk|trLack|trOn)\\('" + id + "'|trm\\([0-9.]+, '" + id + "'");
      assert(re.test(src), h + '/' + id + ' has no rank number at an effect site (trk/trm/trLack/trOn)'); }
  }
  /* GEOMANCER: the NEW traits are learnable, wearable and on only while worn; DEEP ROOTS is the card name for geoBulwark; AFTERSHOCK + RUMBLE ride the table */
  { const g = 'geomancer';
    for (const n of T.NEW_TRAITS) { assert(T.slottable(g).includes(n.id), n.id + ' slottable'); assert.equal(T.kindOf(g, n.id), 'trait'); assert.equal(passiveOn({ traits: { [g]: [n.id] } }, g, n.id, T.learnLevel(g, n.id)), true, n.id + ' on when worn+learned'); assert.equal(passiveOn({ traits: { [g]: [n.id] } }, g, n.id, T.learnLevel(g, n.id) - 1), false, n.id + ' off before it arrives'); assert.equal(passiveOn({ traits: { [g]: ['geoShrapnel'] } }, g, n.id, 24), false, n.id + ' off when unworn'); }
    assert.equal(T.traitRows(g).find(r => r.id === 'geoBulwark').name, 'DEEP ROOTS'); assert.equal(SKILLS.find(x => x.id === 'geoBulwark' && x.hero === g).name, 'BULWARK', 'the catalog keeps the old name (flag off)');
    assert.match(T.traitUpText(g, 1, 2), /AFTERSHOCK/); assert.match(T.traitUpText(g, 6, 7), /GRAVEL/);
    assert.equal(wearTrait({ traits: {} }, g, 'geoMoss', 0, 8), null); assert.match(wearTrait({ traits: {} }, g, 'geoMoss', 0, 7), /Learned at level 8/); }
  /* WARDEN / RANGER / KNIGHT spot checks: the default pair is the whole kit at L24 (core + 2 traits) */
  for (const h of ['knight', 'warden', 'ranger', 'geomancer']) { const s = T.TRAIT_SPLIT[h]; let on = 0; for (const n of SKILLS.filter(x => x.hero === h && !x.active)) if (passiveOn({}, h, n.id, 24)) on++; for (const n of T.NEW_TRAITS.filter(x => x.hero === h)) if (passiveOn({}, h, n.id, 24)) on++;
    const want = s.core.length + 2 + Object.values(s.merged).flat().filter(id => s.defaults.some(d => (s.merged[d] || []).includes(id))).length; assert.equal(on, want, h + ' at L24 runs core + 2 worn traits (+ their merged), not all: ' + on + ' vs ' + want); }
  /* an unsplit hero is judged as today even with the flag on */
  for (const h of HERO_IDS.filter(x => !T.hasSplit(x))) for (const n of SKILLS.filter(x => x.hero === h && !x.active).slice(0, 5)) assert.equal(passiveOn({ traits: { [h]: [] } }, h, n.id, 24), legacy({}, h, n.id, 24), 'unsplit ' + h + '/' + n.id);
  /* merged: reads its host's slot (a temporary row, put back) */
  { const sp = T.TRAIT_SPLIT.knight, keepM = sp.merged, keepF = sp.folded, keepC = sp.core; sp.merged = { bleed: ['riposte'] }; sp.folded = {}; sp.core = keepC.filter(x => x !== 'riposte');   /* riposte is core now: lift it out for the temporary row */
    assert.equal(T.kindOf('knight', 'riposte'), 'merged');
    assert.equal(passiveOn({ traits: { knight: ['bleed'] } }, 'knight', 'riposte', 24), true, 'merged on with host'); assert.equal(passiveOn({ traits: { knight: ['vengeance'] } }, 'knight', 'riposte', 24), false);
    sp.merged = keepM; sp.folded = keepF; sp.core = keepC; }
  /* RIPOSTE is knight CORE (RECS158-d): on at its level with nothing worn, never ranked */
  assert.equal(T.kindOf('knight', 'riposte'), 'core'); assert.equal(passiveOn({ traits: { knight: [] } }, 'knight', 'riposte', 5), true); assert.equal(passiveOn({ traits: { knight: [] } }, 'knight', 'riposte', 4), false); assert.equal(T.traitScale({ traits: { knight: [] } }, 'knight', 'riposte', 5), 1);
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
  assert.equal(T.traitUpText('nosuchhero', 1, 24), '', 'unsplit hero: the old line');
  assert.deepEqual(T.traitRows('knight').slice(0, 5).map(r => r.tkind), ['core', 'core', 'core', 'core', 'core']);
  /* TRAITDATA-B (pyro, pirate, reaper, berserker): rows as planned, a rank number at every effect site, cards rename only while the flag is on */
  { const want = { pyro: [5, 10, 6, 2], pirate: [5, 10, 0, 4], reaper: [5, 10, 2, 1], berserker: [5, 10, 4, 2] };   /* core, traits, merged ids, folded */
    const shared = { pyro: 0, pirate: 1, reaper: 1, berserker: 0 };
    for (const h of Object.keys(want)) { const s = T.TRAIT_SPLIT[h]; assert(T.hasSplit(h), h + ' is split');
      assert.equal(s.core.length, want[h][0], h + ' core'); assert.equal(s.traits.length, want[h][1], h + ' traits');
      assert.equal(Object.values(s.merged).reduce((n, a) => n + a.length, 0), want[h][2], h + ' merged'); assert.equal(Object.keys(s.folded).length, want[h][3], h + ' folded');
      assert.equal((s.shared || []).length, shared[h], h + ' shared'); assert.equal(s.defaults.length, 2);
      for (const id of s.defaults) assert(T.learnLevel(h, id) <= 10, h + ' default ' + id + ' arrives by L10');
      for (const id of T.traitIds(h)) assert(T.learnLevel(h, id) >= 2, h + '/' + id + ' not before L2');
      /* a merged id is on exactly when its host is worn */
      for (const [host, ids] of Object.entries(s.merged)) for (const id of ids) { assert.equal(passiveOn({ traits: { [h]: [host] } }, h, id, 24), true, h + '/' + id + ' rides ' + host); assert.equal(passiveOn({ traits: { [h]: [s.traits.find(x => x !== host)] } }, h, id, 24), false); } }
    assert.equal(T.nameOf('berserker', 'bzPrice'), 'RED FEAST'); assert.equal(T.nameOf('pyro', 'brand'), 'BRAND');
    /* RANK SITES: each trait/merged/folded id of the four heroes has a trk('id') / K('id') / rk('id') in the source, bar the documented rankless riders */
    const src = ['main.js', 'berserker.js', 'crouch-c.js'].map(f => fs.readFileSync(new URL('../src/' + f, import.meta.url), 'utf8')).join('');
    const rankless = new Set(['phoenixTrail', 'skip', 'sunder', 'ossuary', 'graveProvides', 'bzSpinChop']);   /* boolean riders / owed (parryCut shares counterLand with COUNTERSTROKE: scale after TRAITDATA-A merges) */
    for (const h of Object.keys(want)) { const s = T.TRAIT_SPLIT[h]; for (const id of [...s.traits, ...Object.keys(s.folded), ...Object.values(s.merged).flat()]) if (!rankless.has(id)) assert(new RegExp("(trk|K|rk)[(]'" + id + "'[)]").test(src), h + '/' + id + ' has no rank site'); } }
    /* TRAITMERGE: ALL EIGHT split heroes (paladin stays null: his split rides the paladin rework) */
    { const SPLIT8 = ['knight', 'pyro', 'pirate', 'reaper', 'warden', 'geomancer', 'berserker', 'ranger'];
      assert.deepEqual(HERO_IDS.filter(T.hasSplit).sort(), SPLIT8.concat(['paladin']).sort(), 'exactly the 8 heroes + the Paladin (claude/palfork, src/traits-paladin.js) are split'); assert.equal(T.hasSplit('paladin'), true);
      const sharedIds = new Set(T.SHARED_TRAITS.map(s => s.id));
      for (const h of SPLIT8) { const s = T.TRAIT_SPLIT[h];
        assert.equal(s.defaults.length, 2, h + ' two defaults'); assert.notEqual(s.defaults[0], s.defaults[1], h + ' distinct defaults');
        for (const d of s.defaults) { assert(!sharedIds.has(d), h + ': default ' + d + ' is a shared trait'); assert(s.traits.includes(d), h + ': default ' + d + ' is one of his own traits'); }
        assert(!s.defaults.every(d => sharedIds.has(d)), h + ': no default pair is two shared traits');
        /* a fresh L20 hero wearing his defaults has core + both traits on, and shared traits are off until worn */
        const pair = { traits: { [h]: s.defaults.slice() } }; for (const d of s.defaults) assert.equal(passiveOn(pair, h, d, 20), true, h + '/' + d + ' on at L20');
        for (const sh of T.SHARED_TRAITS) assert.equal(passiveOn(pair, h, sh.id, 20), false, h + ' does not get ' + sh.id + ' unworn');
        /* every catalog passive is accounted for (core/trait/merged/folded/shared/retired/cut) */
        for (const n of SKILLS.filter(x => x.hero === h && !x.active)) assert.notEqual(T.kindOf(h, n.id), null, h + '/' + n.id + ' accounted');
        /* rank scales on the hero's own ids, 1.0 at L20 */
        for (const id of s.traits) { assert.equal(T.traitScale({}, h, id, 5), 0.7, h + '/' + id); assert.equal(T.traitScale({}, h, id, 20), 1); } }
      /* swash (Freebooter) and winnow (Blood Knight) ride the shared AIR ROLL / EXECUTIONER rows: the shared id works on their hero, the old id is off */
      const air = T.SHARED_TRAITS.find(s => s.id === 'airRoll'), exe = T.SHARED_TRAITS.find(s => s.id === 'execute');
      assert.equal(air.legacy.pirate, 'swash'); assert.equal(exe.legacy.reaper, 'winnow');
      assert.equal(T.sharedOn({ traits: { pirate: ['airRoll'] }, done: { pirate: { [air.needs]: 1 } } }, 'pirate', 'airRoll', 20), true, 'pirate wears the shared AIR ROLL');
      assert.equal(T.sharedOn({ traits: { reaper: ['execute'] }, done: { reaper: { [exe.needs]: 1 } } }, 'reaper', 'execute', 20), true, 'reaper wears the shared EXECUTIONER');
      const mj2 = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
      assert.ok(/tal\('airRoll'\) \|\| \(isPirate\(\) && tal\('swash'\)\)/.test(mj2), 'flag-off swash path kept'); assert.ok(/counterCut\(f, 'RIPOSTE', trk\('parryCut'\)\)/.test(mj2), 'parryCut scales per wearer'); }
} finally { T.setTraitsShip(false); }
/* FLAG OFF = TODAY'S ARITHMETIC for all 8 split heroes: rank scale is exactly 1 for every id at every level, names are the catalog's, no hero has a split */
for (const h of ['knight', 'pyro', 'pirate', 'reaper', 'warden', 'geomancer', 'berserker', 'ranger']) { const s = T.TRAIT_SPLIT[h];
  for (const id of [...s.traits, ...Object.keys(s.folded || {}), ...Object.values(s.merged || {}).flat()]) for (const lv of [1, 10, 20, 40]) assert.equal(T.traitScale({}, h, id, lv), 1, 'flag off: ' + h + '/' + id + ' scale 1 at L' + lv);
  for (const n of SKILLS.filter(x => x.hero === h && !x.active)) assert.equal(T.nameOf(h, n.id), n.name, 'flag off: catalog name for ' + h + '/' + n.id); }
assert.equal(T.traitsShip(), false);
console.log('traits ok: flag-off identical for ' + HERO_IDS.length + ' heroes; all 8 split heroes (paladin null) core/traits/merged/folded/new/slots/ranks/rank sites/migrate/round-trip/shared (6, region ids vs level.js)/pvp/lab pass');
