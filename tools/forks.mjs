/* tools/forks.mjs (claude/forkframe) - THE POST-L20 A/B FORK FRAMEWORK, node only (no browser): flag-off is the base, the data shape, the owed queue, pick / swap, the skill and trait
   conditions, save validation (a bad entry is dropped, never thrown), the Knight's live-save migration (L24 / L27 / L35 / L50), the legacy tech() / upg() reads, a save round
   trip with the flag on, the board rows + strip + card shapes, and THE CROSSROADS screen driven through a fake api. The ability-law pair asserts that tools/ability-law.mjs would hold
   (A and B differ; boss law is in the effect code) are the static ones here: names <= 14, ids unique, the capstone is the ult, a trade line. */
import assert from 'node:assert/strict';
import * as PR from '../src/progression.js';
import * as F from '../src/forks.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
import { makeCrossroads } from '../src/crossroads.js';
import { STATIONS, TAVERN_ART } from '../src/tavern.js';
import { xpFloor } from '../src/xp.js';
import { PER_HERO } from '../src/coop-save.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const withFlag = (on, fn) => { const was = F.forksShip(); F.setForksShip(on); try { return fn(); } finally { F.setForksShip(was); } };
const mk = (lv, extra = {}) => ({ xp: { knight: xpFloor(lv) }, heroes: { knight: true }, card: { knight: { v: 0, e: 0, m: 0, ms: {} } }, ...extra });
const full = (lv, ms) => { const p = mk(lv); p.card.knight.ms = { ...ms }; return p; };
const OLD35 = { 25: 'kcounter', 30: 'kadvance', 35: 'kpunish', 40: 'klong', 45: 'korders', 50: 'kcharge2' };

check('the shipped flag is off', () => { assert.equal(F.FORKS_SHIP, false); assert.equal(F.forksShip(), false); });

check('flag OFF is the base: nothing reads the forks', () => {
  assert(PR.hasKit('knight')); const p = full(40, { 25: 'kcounter' });
  assert.equal(F.forkSide(p, 'knight', 'heavy'), null); assert.equal(F.forkOn(p, 'knight', 'kpunish', 40), false); assert.deepEqual(F.forksOwed(p, 'knight', 50), []);
  assert.deepEqual(F.roadStrip(p, 'knight', 50), []); assert.equal(F.legacyTech(p, 'knight', 50, 'kpunish'), null); assert.equal(F.legacyUpg(p, 'knight', 50, 'ukeep'), null);
  assert.equal(PR.perkOffer(p, 'knight', 30)[0].tech, true, 'L30 is still a technique card'); assert(PR.isTechLevel('knight', 30)); assert(PR.isUpgradeLevel('knight', 27));
  assert.deepEqual(PR.milestoneLevels('knight'), PR.MILESTONES.concat(PR.UPGRADE_LEVELS).sort((a, b) => a - b));
  assert.equal(F.setFork(p, 'knight', 'heavy', 'A', 50), 'Forks are not open yet'); assert.equal(p.fork, undefined, 'nothing written');
  assert(!STATIONS.some(s => s.id === 'crossroads'), 'no inn station'); assert(!TAVERN_ART.some(a => a[0] === 'crossroads'), 'no station art');
  const out = PR.migrateProgress(JSON.stringify({ progressionVersion: 2, xp: { knight: xpFloor(35) }, heroes: { knight: true }, card: { knight: { v: 2, e: 2, m: 1, ms: OLD35, up: { ukeep: 1 } } } }), []).progress;
  assert.equal(out.fork, undefined, 'no p.fork written while off'); assert.deepEqual(out.card.knight.ms, OLD35, 'the technique picks are untouched'); assert.deepEqual(out.card.knight.up, { ukeep: 1 });
});

check('data shape (every registered fork, every hero)', () => {
  for (const h of Object.keys({ knight: 1 })) { const ids = new Set(), list = F.forkList(h); assert.equal(list.length, 21, h + ' has 11 rungs + 10 trait forks');
    for (const { key, e, level } of list) { assert(e.name && e.trade && e.A && e.B, key + ' text'); assert(level >= 20 && level <= 50, key + ' level ' + level);
      for (const s of ['A', 'B']) { const x = e[s]; assert(x.id && x.name && x.what && x.teach, key + s + ' text'); assert(x.name.length <= F.NAME_MAX, key + s + ' name > 14: ' + x.name); assert(x.what.length <= 96, key + s + ' what too long for 2 lines'); assert(!ids.has(x.id), 'dup id ' + x.id); ids.add(x.id); }
      assert.notEqual(e.A.id, e.B.id); assert.notEqual(e.A.name, e.B.name);
      if (e.slot) assert(F.FORK_LADDER.some(r => r.slot === e.slot), key + ' slot ' + e.slot); assert.equal(F.isCapstone(e), e.slot === 'ult', key + ' only the ult is the capstone'); }
    assert.equal(F.levelOfFork(KNIGHT_FORKS.ult), 50); assert.equal(F.levelOfFork(KNIGHT_FORKS.block), 27); assert.equal(F.levelOfFork(KNIGHT_FORKS.heavy), 32); assert.equal(F.levelOfFork(KNIGHT_FORKS.spender), 36); }
  /* rungs avoid every milestone level but the capstone (never two choice cards on one level) */
  for (const r of F.FORK_LADDER) if (!r.capstone) assert(!PR.MILESTONES.includes(r.lv), 'rung ' + r.lv + ' is a milestone'); assert.deepEqual(F.FORK_LADDER.map(r => r.lv), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  /* every side id the Knight's effect sites still ask for is covered, or deliberately dropped */
  const covered = new Set(F.forkList('knight').flatMap(r => [r.e.A.id, r.e.B.id])); for (const id of ['kadvance', 'klong', 'kpunish', 'klinkcut', 'korders', 'kcharge2', 'kwheel']) assert(covered.has(id), id + ' has a fork side');
  assert(!covered.has('kshook') && !covered.has('kcounter'), 'SHIELD HOOK is parked, COUNTER-THRUST is core');
});

check('flag ON: the Knight has no technique / upgrade cards (they are cut), those levels are stat cards + perks', () => withFlag(true, () => {
  assert(!PR.hasKit('knight')); assert(!PR.isTechLevel('knight', 30)); assert(!PR.isUpgradeLevel('knight', 27)); assert.deepEqual(PR.milestoneLevels('knight'), PR.MILESTONES);
  const p = mk(50); assert.equal(PR.picksOwed(p, 'knight', 50), 50, 'every level a stat pick at L50'); const o = PR.perkOffer(p, 'knight', 30); assert(o.every(k => !k.tech && !k.fork && !k.up), 'L30 deals a plain major perk'); assert(o.length >= 2);
  assert(!PR.hasKit('pyro') && !PR.hasKit('warden'), 'no-kit heroes unchanged');
}));

check('owed queue: a rung reached with no pick, in ladder order; the stat card is not touched', () => withFlag(true, () => {
  const p = mk(26); assert.deepEqual(F.forksOwed(p, 'knight', 26).map(r => r.key), ['dash', 'skill:shieldThrow', 'chain']); assert.deepEqual(F.forksOwed(p, 'knight', 27).map(r => r.key), ['dash', 'skill:shieldThrow', 'chain', 'block']);
  assert.deepEqual(F.forksOwed(p, 'knight', 36).map(r => r.key), ['dash', 'skill:shieldThrow', 'chain', 'block', 'skill:risingCut', 'heavy', 'spender']); assert.deepEqual(F.forksOwed(p, 'knight', 50).map(r => r.key), ['dash', 'skill:shieldThrow', 'chain', 'block', 'skill:risingCut', 'heavy', 'spender', 'skill:groundSlam', 'sig', 'skill:ironclad', 'ult']);
  assert.equal(F.owedCount(p, 'knight', 50, []), 11); assert.deepEqual(F.forksOwed(p, 'nobody', 50), [], 'a hero without fork data owes nothing');
  assert.equal(F.setFork(p, 'knight', 'block', 'B', 27), null); assert.deepEqual(F.forksOwed(p, 'knight', 36).map(r => r.key), ['dash', 'skill:shieldThrow', 'chain', 'skill:risingCut', 'heavy', 'spender']);
}));

check('pick and swap: level gate, free, unlimited, the read needs the level', () => withFlag(true, () => {
  const p = mk(31); assert(/Locked until level 32/.test(F.setFork(p, 'knight', 'heavy', 'A', 31))); assert.equal(F.setFork(p, 'knight', 'nope', 'A', 50), 'No such fork'); assert.equal(F.setFork(p, 'knight', 'block', 'C', 50), 'Pick A or B');
  assert.equal(F.setFork(p, 'knight', 'block', 'A', 31), null); assert.equal(F.forkSide(p, 'knight', 'block'), 'A'); assert.equal(p.fork.knight.v, 1);
  assert(F.forkOn(p, 'knight', 'klong', 31)); assert(!F.forkOn(p, 'knight', 'kadvance', 31), 'the other side is off');
  for (let i = 0; i < 6; i++) assert.equal(F.setFork(p, 'knight', 'block', i % 2 ? 'A' : 'B', 31), null); assert.equal(F.forkSide(p, 'knight', 'block'), 'A', 'swapped free, six times');
  assert(!F.forkOn(p, 'knight', 'kadvance', 26), 'a save edited above its level just plays base (level read live)');
  p.fork.knight.heavy = 'A'; assert(!F.forkOn(p, 'knight', 'kpunish', 31), 'an edited pick above the rung plays base');
}));

check('skill fork applies only while slotted; trait fork only at L20+ while worn', () => withFlag(true, () => {
  F.registerFork('knight', 'skill:shieldThrowTest', { slot: 'skill1', ability: 'skill:shieldThrowTest', name: 'TEST THROW', trade: 'ONE OR TWO', A: { id: 'tsA', name: 'HEAVY', what: 'W', teach: 'T' }, B: { id: 'tsB', name: 'TWIN', what: 'W', teach: 'T' } });
  F.registerFork('knight', 'trait:platedTest', { trait: 'platedTest', name: 'TEST PLATE', trade: 'IRON OR LIGHT', A: { id: 'ttA', name: 'IRON BACK', what: 'W', teach: 'T' }, B: { id: 'ttB', name: 'LIGHT PLATE', what: 'W', teach: 'T' } });
  try { const p = mk(30); F.setFork(p, 'knight', 'skill:shieldThrowTest', 'B', 30); F.setFork(p, 'knight', 'trait:platedTest', 'A', 30);
    assert(!F.forkOn(p, 'knight', 'tsB', 30, { slotted: () => false })); assert(F.forkOn(p, 'knight', 'tsB', 30, { slotted: id => id === 'shieldThrowTest' }), 'plays at once when slotted');
    assert(!F.forkOn(p, 'knight', 'ttA', 30, { worn: () => false })); assert(F.forkOn(p, 'knight', 'ttA', 30, { worn: id => id === 'platedTest' }));
    assert(!F.forkOn(p, 'knight', 'ttA', 19, { worn: () => true }), 'trait forks open at L20'); assert(/Locked until level 20/.test(F.setFork(mk(19), 'knight', 'trait:platedTest', 'A', 19)));
    const q = mk(30); assert.deepEqual(F.traitForksOwed(q, 'knight', 30, []).map(r => r.key), [], 'not worn: nothing owed'); assert.deepEqual(F.traitForksOwed(q, 'knight', 30, ['platedTest']).map(r => r.key), ['trait:platedTest'], 'the first-wear card');
    assert.deepEqual(F.traitForksOwed(q, 'knight', 19, ['platedTest']), []); assert(!F.forksOwed(q, 'knight', 30).some(r => r.key.startsWith('trait:')), 'a trait fork is never a level-up rung');
    F.setFork(q, 'knight', 'trait:platedTest', 'B', 30); assert.deepEqual(F.traitForksOwed(q, 'knight', 30, ['platedTest']), [], 'picked once: not asked again');
    assert(F.boardRows(q, 'knight', 30, 'TRAITS').some(r => r.key === 'trait:platedTest' && r.side === 'B')); assert(!F.boardRows(q, 'knight', 30, 'ABILITIES').some(r => r.trait));
    assert.equal(F.boardRows(q, 'knight', 30, 'TRAITS', { worn: () => false })[0].note, 'WEAR THE TRAIT TO USE IT');
  } finally { F.unregisterFork('knight', 'skill:shieldThrowTest'); F.unregisterFork('knight', 'trait:platedTest'); }
  assert(!F.forkList('knight').some(r => /Test$/.test(r.key)), 'synthetic forks removed');
}));

check('validation: a bad entry is DROPPED, never an error', () => {
  const junk = () => ({ fork: { knight: { block: 'A', heavy: 'Z', ghost: 'B', v: 'x', spender: 7 }, pyro: 'nope', warden: { v: 1 } } });
  withFlag(false, () => { const p = junk(); assert.doesNotThrow(() => F.validateForks(p)); assert.deepEqual(p.fork.knight, { block: 'A', ghost: 'B', v: 1 }, 'flag off: unknown key kept (a later build may know it), bad values dropped'); assert.equal(p.fork.pyro, undefined); });
  withFlag(true, () => { const p = junk(); assert.doesNotThrow(() => F.validateForks(p)); assert.deepEqual(p.fork.knight, { block: 'A', v: 1 }, 'flag on: unknown key dropped too'); });
  for (const bad of [null, 5, [], 'x']) { const p = { fork: bad }; assert.doesNotThrow(() => F.validateForks(p)); if (bad !== null) assert.equal(p.fork, undefined); }
  withFlag(true, () => assert.doesNotThrow(() => PR.validateProgress({ fork: { knight: { block: 'nonsense' } }, card: { knight: { v: 0, e: 0, m: 0, ms: {} } } }))); });

const migrate = (lv, ms, up, card) => { const p = full(lv, ms); Object.assign(p.card.knight, { v: 2, e: 2, m: 1 }, card || {}); if (up) p.card.knight.up = up; const r = F.migrateForks(p); return { p, r }; };
check('knight migration: L24 (no technique yet) changes nothing but the marker', () => withFlag(true, () => { const { p, r } = migrate(24, {}); assert.equal(r.picked.length, 0); assert.equal(p.fork.knight.v, 1); assert(!p.cardFree || !p.cardFree.knight, 'no free respec owed'); assert.equal(p.card.knight.v, 2); }));
check('knight migration: L27 (an upgrade only) returns the upgrade as a stat pick', () => withFlag(true, () => {
  const p = full(27, { 25: 'kcounter', 27: 'ukeep:1' }); p.card.knight.up = { ukeep: 1 }; p.card.knight.v = 4; const before = PR.picksOwed(p, 'knight', 27), r = withFlag(true, () => F.migrateForks(p));
  assert.equal(r.upgradesReturned >= 1, true); assert.equal(p.card.knight.up, undefined); assert.deepEqual(Object.keys(p.card.knight.ms), [], 'both the technique perk and the upgrade pick are owed back');
  assert.equal(p.cardFree.knight, 1); assert.deepEqual(F.forksOwed(p, 'knight', 27).map(x => x.key), ['dash', 'skill:shieldThrow', 'chain', 'block'], 'the L21-L27 fork cards are owed, A/B not picked for him (kcounter is core)'); assert(PR.picksOwed(p, 'knight', 27) >= before, 'stat picks grow'); }));
check('knight migration: L35 full kit -> sides, perks and stat picks owed, one free respec', () => withFlag(true, () => {
  const ms = { 25: 'kcounter', 27: 'ukeep:1', 29: 'urise:1', 30: 'kadvance', 32: 'usunder:1', 35: 'kpunish' }; const { p, r } = migrate(35, ms, { ukeep: 1, urise: 1, usunder: 1 });
  assert.deepEqual(p.fork.knight, { block: 'B', heavy: 'A', chain: 'A', v: 1 }, 'usunder folds into chain A'); assert.equal(r.picked.length, 3); assert.deepEqual(p.card.knight.ms, {}); assert.equal(p.card.knight.up, undefined); assert.equal(p.cardFree.knight, 1); assert.equal(p.cardNew, 1);
  assert.deepEqual(F.forksOwed(p, 'knight', 35).map(x => x.key), ['dash', 'skill:shieldThrow', 'skill:risingCut'], 'block, heavy, chain picked; the L36 spender rung is not reached at 35'); assert.deepEqual(F.forksOwed(p, 'knight', 36).map(x => x.key), ['dash', 'skill:shieldThrow', 'skill:risingCut', 'spender']); }));
check('knight migration: L35 spender not reached; L50 capstone + every side', () => withFlag(true, () => {
  const ms = { 25: 'kcounter', 30: 'klinkcut', 35: 'kpunish', 40: 'klong', 45: 'korders', 50: 'kwheel' }; const { p } = migrate(50, ms);
  assert.deepEqual(p.fork.knight, { heavy: 'A', block: 'A', spender: 'B', ult: 'B', v: 1 }, 'klinkcut + kpunish both held: A wins; klong -> block A; korders -> spender B; kwheel -> ult B');
}));
check('knight migration: both sides of one fork held -> A wins; kshook is parked (no side)', () => withFlag(true, () => {
  const { p } = migrate(50, { 30: 'kadvance', 40: 'klong', 35: 'kpunish', 45: 'klinkcut', 50: 'kshook' }); assert.equal(p.fork.knight.block, 'A'); assert.equal(p.fork.knight.heavy, 'A'); assert.equal(p.fork.knight.ult, undefined); assert.deepEqual(p.card.knight.ms, {}); }));
check('knight migration: idempotent, one-shot on p.fork.knight.v, a respec of forks never re-runs it', () => withFlag(true, () => {
  const { p } = migrate(40, { 25: 'kcounter', 30: 'kadvance' }, { ukeep: 2 }); const snap = JSON.stringify(p); const again = F.migrateForks(p); assert.equal(again.done, false); assert.equal(JSON.stringify(p), snap, 'second run changes nothing');
  F.setFork(p, 'knight', 'block', 'A', 40); p.card.knight.up = { ukeep: 1 }; F.migrateForks(p); assert.deepEqual(p.card.knight.up, { ukeep: 1 }, 'v=1: an upgrade held later is not touched (none can be taken with the flag on)'); }));
check('migration is flag-gated (off: no change at all)', () => withFlag(false, () => { const p = full(40, OLD35); const s = JSON.stringify(p); assert.equal(F.migrateForks(p).done, false); assert.equal(JSON.stringify(p), s); }));

check('legacy reads: tech() / upg() are answered from the forks (flag on) and the Knight only', () => withFlag(true, () => {
  const { p } = migrate(50, { 25: 'kcounter', 35: 'kpunish', 36: 'ukeep:1', 45: 'korders', 50: 'kcharge2' }, { ukeep: 1 });   /* heavy A, spender B, ult A */
  const T = id => F.legacyTech(p, 'knight', 50, id); assert.equal(T('kpunish'), true); assert.equal(T('klinkcut'), false); assert.equal(T('korders'), true); assert.equal(T('kcharge2'), true); assert.equal(T('kwheel'), false);
  assert.equal(T('kcounter'), false, 'riposte is core, not a tech'); assert.equal(T('kshook'), false); assert.equal(F.legacyTech(p, 'nobody', 50, 'kpunish'), false);
  assert.equal(F.legacyUpg(p, 'knight', 50, 'ukeep'), 0, 'spender is B: IRON LINKS off'); assert.equal(F.legacyUpg(p, 'knight', 50, 'usunder'), 0, 'the cut upgrades read 0');
  F.setFork(p, 'knight', 'spender', 'A', 50); assert.equal(F.legacyUpg(p, 'knight', 50, 'ukeep'), 2); assert.equal(F.legacyUpg(p, 'knight', 50, 'uwind'), 2); assert.equal(F.legacyUpg(p, 'knight', 50, 'ukeep') && F.legacyTech(p, 'knight', 50, 'korders'), false);
  assert.equal(F.legacyTech(p, 'knight', 35, 'kpunish'), true, 'heavy rung is 32: open at 35'); assert.equal(F.legacyTech(p, 'knight', 30, 'kpunish'), false, 'below the rung: base'); }));

check('save round trip with the flag ON: load -> export -> load is stable and valid', () => withFlag(true, () => {
  const raw = JSON.stringify({ progressionVersion: 2, xp: { knight: xpFloor(50) }, heroes: { knight: true }, card: { knight: { v: 10, e: 10, m: 10, ms: { 25: 'kcounter', 30: 'kadvance', 35: 'kpunish', 40: 'klong', 45: 'korders', 50: 'kcharge2' }, up: { ukeep: 2 } } } });
  const a = PR.migrateProgress(raw, []).progress, s1 = PR.exportProgress(a), b = PR.migrateProgress(s1, []).progress, s2 = PR.exportProgress(b);
  assert.equal(s1, s2, 'export stable'); assert.deepEqual(b.fork.knight, { block: 'A', heavy: 'A', spender: 'B', ult: 'A', v: 1 }); assert.deepEqual(a.card.knight.ms, {}); assert(a.card.knight.up === undefined);
  assert.equal(PR.picksOwed(a, 'knight', 50) > 0, true); assert.equal(PR.milestonesOwed(a, 'knight', 50).filter(n => n >= 25).length, 6, 'all six major perks owed back'); }));
check('a save written with the flag ON still loads with the flag OFF (rollback)', () => {
  const on = withFlag(true, () => PR.exportProgress(PR.migrateProgress(JSON.stringify({ progressionVersion: 2, xp: { knight: xpFloor(40) }, heroes: { knight: true }, card: { knight: { v: 5, e: 5, m: 5, ms: { 25: 'kcounter' } } } }), []).progress));
  withFlag(false, () => { const p = PR.migrateProgress(on, []).progress; assert.deepEqual(p.fork.knight.v, 1, 'p.fork is carried, ignored'); assert(PR.hasKit('knight')); assert(PR.perkOffer(p, 'knight', 30)[0].tech, 'the technique cards are back, owed again'); }); });

check('card, strip and board shapes', () => withFlag(true, () => {
  const c = F.forkCard('knight', 'heavy'); assert.equal(c.kind, 'fork'); assert.equal(c.opts.length, 2); assert.deepEqual(c.opts.map(o => o.side), ['A', 'B']); assert(c.opts.every(o => o.fork && o.free && o.name && o.what && o.teach && !o.rec), 'no recommended: both equal'); assert.equal(c.n, 32); assert.equal(F.forkCard('knight', 'ult').capstone, true);
  const p = mk(36); F.setFork(p, 'knight', 'block', 'B', 36); const s = F.roadStrip(p, 'knight', 36); assert.equal(s.length, 11); assert.deepEqual(s.map(x => x.state), ['next', 'ahead', 'ahead', 'taken', 'ahead', 'ahead', 'ahead', 'ahead', 'ahead', 'ahead', 'ahead']); const sb = s.find(x => x.key === 'block'); assert(sb.picked.id === 'kadvance' && sb.options.find(o => o.id === 'klong').locked && !sb.options.find(o => o.id === 'kadvance').locked); assert(s[10].capstone);
  assert.deepEqual(F.roadStrip(p, 'nobody', 50), [], 'no fork data: no strip'); const rows = F.boardRows(p, 'knight', 36, 'ABILITIES'); assert.deepEqual(rows.map(r => r.open), [true, true, true, true, true, true, true, false, false, false, false]); assert.equal(rows[10].note, 'LEVEL 50'); assert.equal(F.boardRows(p, 'knight', 36, 'TRAITS').length, 10, 'ten trait forks'); assert(F.boardRows(p, 'knight', 36, 'TRAITS').every(r => r.trait && r.note === 'LEVEL 20' || r.open), 'open from L20 (level 36 here)'); }));

check('THE CROSSROADS screen (fake api): open, flip, set, locked refusal, tabs, back', () => withFlag(true, () => {
  const p = mk(36), log = []; const g = new Proxy({}, { get: () => () => {}, set: () => true });
  const data = () => ({ heroName: 'KNIGHT', level: 36, tabs: { ABILITIES: F.boardRows(p, 'knight', 36, 'ABILITIES'), TRAITS: F.boardRows(p, 'knight', 36, 'TRAITS') } });
  const X = makeCrossroads({ g: () => g, VW: () => 320, VH: () => 180, text: (...a) => log.push(a[0]), panel() {}, hit() {}, sfx: k => log.push('sfx:' + k), wrap: s => [s], fit: s => s, data, set: (k, s) => F.setFork(p, 'knight', k, s, 36) });
  assert.equal(X.isOpen, false); assert.equal(X.input({ down: true }), false, 'closed: eats nothing'); X.open('inn'); assert(X.isOpen); assert.equal(X.rows().length, 11); X.draw();
  X.input({ down: true }); X.input({ down: true }); X.input({ down: true }); X.input({ right: true }); X.input({ confirm: true }); assert.equal(F.forkSide(p, 'knight', 'block'), 'B'); X.input({ left: true }); X.input({ confirm: true }); assert.equal(F.forkSide(p, 'knight', 'block'), 'A', 'flipped back, free');
  X.input({ down: true }); X.input({ down: true }); X.input({ down: true }); X.input({ down: true }); assert.equal(X.state.sel[0], 7); X.input({ confirm: true }); assert.equal(F.forkSide(p, 'knight', 'skill:groundSlam'), null, 'the L38 row is locked at 36'); assert(/LOCKED/.test(X.state.msg));
  X.input({ tab: true }); assert.equal(X.state.tab, 1); assert.equal(X.rows().length, 10, 'the TRAITS tab lists the ten pairs'); X.draw();
  X.input({ tab: true }); assert.equal(X.state.tab, 0); X.input({ back: true }); assert.equal(X.isOpen, false); }));

check('flag ON: the inn station + art are dealt (module load flag is the lab/shipped one: checked by source)', () => {
  const src = JSON.stringify(STATIONS.map(s => s.id)); const t = F.forksShip();   /* the station list is fixed at module load; the lab's ?forks=on sets it. Here: the data the flag would add */
  assert(!t || /crossroads/.test(src)); assert(STATIONS.every((s, i) => i === 0 || s.x - STATIONS[i - 1].x >= 3), 'stations 3+ tiles apart: ' + STATIONS.map(s => s.x)); });

check('bots, AI partners and the lab take side A; the co-op snapshot carries the map', () => withFlag(true, () => {
  assert.deepEqual(F.botForks('knight'), Object.fromEntries([['v', 1], ...F.forkList('knight').map(r => [r.key, 'A'])])); assert.equal(F.botForks('knight', 'B').ult, 'B'); assert.deepEqual(F.botForks('knight', { heavy: 'B', nope: 'A' }), { v: 1, heavy: 'B' }); assert.deepEqual(F.botForks('nobody'), { v: 1 });
  assert(PER_HERO.includes('fork'), 'fork joins the hero snapshot'); }));
if (bad.length) { console.log('FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Forks: flag off is the base (no read, no write, no station); data shape, rungs off the milestones, owed queue, pick/swap free, skill/trait conditions, bad saves dropped, Knight migration (L24/L27/L35/L50, idempotent), legacy tech()/upg() reads, flag-on round trip + rollback load, card/strip/board shapes, THE CROSSROADS screen all hold.');
