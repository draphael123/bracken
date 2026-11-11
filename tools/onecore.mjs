/* tools/onecore.mjs (claude/onecore-d) - ONE CORE PASSIVE PER HERO, node only. No browser.
     node tools/onecore.mjs
   1. switch OFF (the shipped ONECORE_SHIP): every hero's row in force IS master's TRAIT_SPLIT row, the paladin unsplit, passiveOn identical to the onecore-free path.
   2. switch ON (+ TRAITS on): all nine heroes split; exactly ONE core (ONECORE[h].core) on at its level whatever is worn; every other former core is a trait (learned by L18,
      off unless worn, on when worn and learned); every catalog passive classified; defaults slottable, learned by L10; level-up line / menu rows name the moved ones as traits.
   3. OLD SAVES with the switch ON: a v1 save, a long v1 save, a save with p.traits already chosen (incl. a paladin with xp), a save wearing a moved core: no throw,
      worn traits stay worn, empty heroes get defaults, load -> export -> load stable. Then the switch goes back OFF and the same save still loads. */
import assert from 'node:assert/strict'; import { readFileSync } from 'node:fs';
import { migrateProgress, exportProgress, passiveOn, SKILLS, HERO_IDS, TRT } from '../src/progression.js'; import { levelOfXp, xpFloor } from '../src/xp.js';
import { ONECORE, ONECORE_SHIP } from '../src/traits-onecore.js';
const T = TRT, NINE = ['knight', 'warden', 'ranger', 'geomancer', 'pyro', 'pirate', 'reaper', 'berserker', 'paladin'];
const passives = h => SKILLS.filter(x => x.hero === h && !x.active), lvOf = (h, id) => SKILLS.find(x => x.hero === h && x.id === id).level;
assert.equal(ONECORE_SHIP, false, 'ONECORE_SHIP ships false');
assert.equal(T.onecoreShip(), false);
/* 1. OFF */
T.setTraitsShip(true);
try {
  for (const h of HERO_IDS) assert.equal(T.splitRow(h), T.hasSplit(h) ? T.TRAIT_SPLIT[h] : null, h + ': OFF row is master');
  assert.equal(T.hasSplit('paladin'), false, 'OFF: paladin unsplit');
  const snap = []; for (const h of HERO_IDS) for (const n of passives(h)) for (const lv of [1, 9, 20, 30]) snap.push(passiveOn({}, h, n.id, lv));
  T.setOnecoreShip(true); T.setOnecoreShip(false);
  let i = 0; for (const h of HERO_IDS) for (const n of passives(h)) for (const lv of [1, 9, 20, 30]) assert.equal(passiveOn({}, h, n.id, lv), snap[i++], 'OFF after a toggle differs: ' + h + '/' + n.id);
  /* 2. ON */
  T.setOnecoreShip(true);
  const rows = [];
  for (const h of NINE) {
    assert(T.hasSplit(h), h + ' split under ONECORE'); const s = T.splitRow(h);
    assert.deepEqual(T.coreIds(h), [ONECORE[h].core], h + ': exactly one core');
    for (const n of passives(h)) { const k = T.kindOf(h, n.id); assert(['core', 'trait', 'merged', 'folded', 'shared', 'retired'].includes(k) || (k === 'cut' && (s.cut || []).includes(n.id)), h + '/' + n.id + ' unclassified: ' + k); }
    const master = T.TRAIT_SPLIT[h]; if (master) for (const id of master.core) if (id !== ONECORE[h].core) { assert.equal(T.kindOf(h, id), 'trait', h + '/' + id + ' moved core is a trait'); assert(T.isSlottable(h, id), h + '/' + id + ' slottable'); }
    for (const id of T.traitIds(h)) assert(T.learnLevel(h, id) <= 18, h + '/' + id + ' learned by L18');
    assert(s.defaults.length === 2 && s.defaults.every(id => T.isSlottable(h, id) && T.learnLevel(h, id) <= 10), h + ': two slottable defaults learned by L10');
    const c = ONECORE[h].core, cl = lvOf(h, c);
    assert.equal(passiveOn({ traits: { [h]: [] } }, h, c, cl), true, h + ' core on at its level, nothing worn'); if (cl > 1) assert.equal(passiveOn({ traits: { [h]: [] } }, h, c, cl - 1), false);
    for (const id of T.movedCores(h)) {
      const ll = T.learnLevel(h, id);
      assert.equal(passiveOn({ traits: { [h]: [] } }, h, id, 30), false, h + '/' + id + ' moved core off unworn');
      assert.equal(passiveOn({ traits: { [h]: [id] } }, h, id, Math.max(ll, 1)), true, h + '/' + id + ' worn + learned = on');
      if (ll > 1) assert.equal(passiveOn({ traits: { [h]: [id] } }, h, id, ll - 1), false, h + '/' + id + ' worn, not learned = off');
      assert(/TRAIT LEARNED/.test(T.traitUpText(h, ll - 1, ll)) && !/CORE: /.test(T.traitUpText(h, ll - 1, ll).replace('CORE: ' + T.nameOf(h, c), '')), h + '/' + id + ' level-up line: ' + T.traitUpText(h, ll - 1, ll));
      assert(T.traitRows(h).some(r => r.id === id && r.tkind === 'trait' && r.level === ll), h + '/' + id + ' menu row is a trait at LV ' + ll);
    }
    assert(T.traitRows(h).filter(r => r.tkind === 'core').length === 1, h + ': one CORE row in the menu');
    const up = T.traitUpText(h, 0, 30); assert(/CORE: /.test(up) && !/CORE: [^.]*\+\d+ MORE/.test(up), h + ': level-up line names ONE core: ' + up);
    rows.push(h + ': core ' + c + ' (L' + cl + ') | moved ' + T.movedCores(h).map(id => id + '@' + T.learnLevel(h, id)).join(' ') + ' | defaults ' + s.defaults.join('+'));
  }
  /* bots / partners / the lab with no p.traits wear the defaults */
  for (const h of NINE) { const [a, b] = T.splitRow(h).defaults; assert.equal(passiveOn({}, h, a, 24), true); assert.equal(passiveOn({}, h, b, 24), true); assert.equal(passiveOn({}, h, b, 10), false, h + ' slot 2 closed at L10'); }
  /* 3. OLD SAVES */
  const fx = JSON.parse(readFileSync(new URL('./fixtures/progression-v1-passives.json', import.meta.url), 'utf8'));
  const fat = JSON.parse(JSON.stringify(fx)); fat.xp = { knight: 90000, pyro: 60000, warden: 40000, ranger: 30000, paladin: 50000 }; fat.heroes = { knight: true, pyro: true, warden: true, ranger: true, paladin: true };
  const strip = p => { const q = JSON.parse(JSON.stringify(p)); delete q.traits; delete q.progressionReceipt; delete q.progressionVersion; return q; };
  for (const [name, base] of [['fixture v1', fx], ['long v1 (5 heroes incl paladin)', fat]]) {
    T.setOnecoreShip(false); const off = migrateProgress(JSON.stringify(base), []).progress; T.setOnecoreShip(true);
    const on1 = migrateProgress(JSON.stringify(base), []).progress, saved = exportProgress(on1), on2 = migrateProgress(saved, []).progress, saved2 = exportProgress(on2);
    assert.deepEqual(strip(on1), strip(off), name + ': progress differs ON vs OFF beyond traits'); assert.equal(saved, saved2, name + ': export not stable');
    for (const h of Object.keys(base.xp)) assert(Array.isArray(on1.traits[h]) && on1.traits[h].length >= 1, name + ': ' + h + ' got defaults');
    console.log('OLD SAVE ' + name + ' PASS: traits ' + JSON.stringify(on1.traits));
  }
  /* a v2 save that already chose traits under master's split (knight wears plated+bleed, pyro emberSkin+phoenix) + a paladin with xp and nothing chosen */
  const chosen = { progressionVersion: 2, hero: 'knight', xp: { knight: xpFloor(30), pyro: xpFloor(25), paladin: xpFloor(22) }, done: { knight: { stockade: 1 } }, coins: 5, skillOwned: { knight: { riposte: true } }, loadouts: {}, bossRecords: {}, traits: { knight: ['plated', 'bleed'], pyro: ['emberSkin', 'phoenix'] } };
  { const o = migrateProgress(JSON.stringify(chosen), []).progress, s1 = exportProgress(o), s2 = exportProgress(migrateProgress(s1, []).progress);
    assert.deepEqual(o.traits.knight, ['plated', 'bleed'], 'chosen knight traits kept'); assert.deepEqual(o.traits.pyro, ['emberSkin', 'phoenix'], 'chosen pyro traits kept');
    assert.deepEqual(o.traits.paladin, T.splitRow('paladin').defaults, 'paladin with xp gets defaults'); assert.equal(s1, s2, 'chosen save: stable');
    console.log('OLD SAVE chosen-traits PASS: ' + JSON.stringify(o.traits) + '; knight riposte (owned, unworn) on=' + passiveOn(o, 'knight', 'riposte', 30) + ', parry on=' + passiveOn(o, 'knight', 'parry', 30)); }
  /* a save wearing a moved core, then the switch flips back OFF: it must still load (the moved id is not slottable OFF: validate drops it to an empty slot) */
  { const w = JSON.parse(JSON.stringify(chosen)); w.traits.knight = ['riposte', 'bleed']; const on = migrateProgress(JSON.stringify(w), []).progress; assert.deepEqual(on.traits.knight, ['riposte', 'bleed'], 'worn moved core kept ON');
    assert.equal(passiveOn(on, 'knight', 'riposte', 30), true); T.setOnecoreShip(false); const back = migrateProgress(exportProgress(on), []).progress;
    console.log('FLIP-BACK (save wore riposte under ONECORE, switch OFF): knight traits -> ' + JSON.stringify(back.traits.knight) + '; bleed on=' + passiveOn(back, 'knight', 'bleed', 30) + ', vengeance on=' + passiveOn(back, 'knight', 'vengeance', 30) + ', riposte (core) on=' + passiveOn(back, 'knight', 'riposte', 30)); T.setOnecoreShip(true); }
  for (const r of rows) console.log(r);
} finally { T.setOnecoreShip(false); T.setTraitsShip(false); }
console.log('onecore ok');
