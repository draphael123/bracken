// tools/paladin-forks.mjs - NODE-ONLY checks for the Paladin's complete fork road (claude/palfork). No browser. Run: node tools/paladin-forks.mjs
// 1. data: 11 rungs on the ladder, 10 trait pairs for his 10 traits, ids unique / shaped, text limits, no weapon noun that palrework changes (MAUL / MACE)
// 2. wiring: every side id is read by src/main.js through plb('id') (the effect code exists); no ad-block-looking filename
// 3. flag off = base: no side reads, no p.fork, traits row dark; flag on: reads respect pick + level + slot / worn; PvP EVEN L1 turns every fork off
// 4. the trait row: every catalog passive of his listed once; the five FOLDED ids stay slottable until the sides ship (forks off) and retire when they do (forks on)
// 5. effect-site source scan (the fragments that make each side do something)
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import { PALADIN_FORKS, PALADIN_RUNG_FORKS, PALADIN_TRAIT_FORKS } from '../src/forks-paladin.js';
import { SKILLS } from '../src/progression-catalog.js';
import * as T from '../src/traits.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0]); } };
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };
const withTraits = (v, fn) => { const was = T.traitsShip(); T.setTraitsShip(v); try { return fn(); } finally { T.setTraitsShip(was); } };
const KEYS = ['dash', 'hammer', 'chain', 'block', 'skill:divineShield', 'heavy', 'spender', 'skill:dawnburst', 'sig', 'skill:holyWrath', 'ult'];
const TRAITS = ['litany', 'shockwave', 'smite', 'beacon', 'retribution', 'crusade', 'earthshaker', 'martyr', 'sanctuary', 'doubleJudge'];

check('11 rungs: every ladder slot holds one fork, ability forks sit on their rung level', () => {
  const ability = F.forkList('paladin', false); assert.equal(ability.length, 11); assert.deepEqual(ability.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ability.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot)); assert.deepEqual(ability.map(r => r.key), KEYS);
  assert.equal(Object.keys(PALADIN_RUNG_FORKS).length, 11); for (const r of ability) if (r.key.startsWith('skill:')) assert.equal(r.e.ability, r.key, 'a skill fork is keyed by its skill id'); assert.equal(F.isCapstone(ability[10].e), true);
  for (const k of KEYS.filter(k => k.startsWith('skill:'))) assert(SKILLS.some(n => n.hero === 'paladin' && n.id === k.slice(6) && n.active), k + ' is a real paladin active'); });
check('10 trait forks: one pair per Paladin trait, keyed trait:<id>, open at L20 while worn', () => withFlag(true, () => {
  const traits = F.forkList('paladin', true); assert.equal(traits.length, 10); assert.equal(Object.keys(PALADIN_TRAIT_FORKS).length, 10); assert.deepEqual(traits.map(r => r.e.trait).sort(), TRAITS.slice().sort());
  const ids = T.traitIds('paladin'); for (const id of TRAITS) assert(ids.includes(id), id + ' is one of his slottable traits (forks on)'); assert.equal(ids.length, 10, 'forks on: his ten traits, no folded id');
  for (const r of traits) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(r.level, 20); } }));
check('ids unique and shaped; names <= 14; what <= 96; teach <= 160; sides differ; no maul / mace noun (palrework moves it)', () => {
  const ids = new Set(); for (const [k, e] of Object.entries(PALADIN_FORKS)) for (const s of ['A', 'B']) { const x = e[s]; assert(x.id && x.name && x.what && x.teach && x.input, k + s); assert(x.name.length <= F.NAME_MAX, k + s + ' name ' + x.name); assert(x.what.length <= 96, k + s + ' what ' + x.what.length + ' ' + x.what); assert(x.teach.length <= 160, k + s + ' teach ' + x.teach.length);
    assert(!ids.has(x.id), 'dup ' + x.id); ids.add(x.id); assert(/^p[a-z0-9]+$/.test(x.id) && x.id === x.id.toLowerCase(), 'id shape ' + x.id); assert(!/\b(MAUL|MACE|BULWARK ADVANCE|SHIELD ADVANCE)\b/.test(x.what + ' ' + x.teach + ' ' + x.name), 'word: ' + x.id); assert(x.name !== e[s === 'A' ? 'B' : 'A'].name, 'sides differ ' + k); }
  assert.equal(ids.size, 42); const kn = new Set(); for (const e of Object.values(F.forksOf('knight'))) for (const s of ['A', 'B']) kn.add(e[s].id); for (const i of ids) assert(!kn.has(i), 'collides with a Knight side id: ' + i); });
check('every side id is read by main.js (the effect code exists)', () => { for (const [k, e] of Object.entries(PALADIN_FORKS)) for (const s of ['A', 'B']) assert(main.includes("plb('" + e[s].id + "')"), 'main.js never reads ' + e[s].id + ' (' + k + s + ')'); });
check('no ad-block-looking filename', () => { for (const f of ['forks-paladin.js', 'traits-paladin.js', 'paladin-forks.mjs']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });
check('flag off = the base: no side reads, no p.fork, no owed card, the technique kit untouched', () => withFlag(false, () => {
  assert.equal(F.forkOn({ fork: { paladin: { dash: 'A' } } }, 'paladin', 'psunstep', 50), false); assert.equal(F.legacyTech({}, 'paladin', 50, 'psunstep'), null); assert.equal(PR.hasKit('paladin'), false, 'the Paladin never had a technique kit'); assert.equal(PR.hasKit('knight'), true);
  const p = { fork: { paladin: { dash: 'A', v: 1 } } }; assert.deepEqual(F.forksOwed(p, 'paladin', 50), []); assert.deepEqual(F.roadStrip(p, 'paladin', 50), []); assert.deepEqual(F.traitForksOwed(p, 'paladin', 50, ['litany']), []); }));
check('flag on: every side reads through legacyTech from the pick, the level and the slot / the worn trait', () => withFlag(true, () => {
  const p = { fork: { paladin: { dash: 'B', hammer: 'A', 'skill:divineShield': 'B', 'trait:litany': 'A', v: 1 } } }; const slotted = { slotted: id => id === 'divineShield', worn: id => id === 'litany' };
  assert.equal(F.legacyTech(p, 'paladin', 21, 'paegisstep'), true); assert.equal(F.legacyTech(p, 'paladin', 21, 'psunstep'), false); assert.equal(F.legacyTech(p, 'paladin', 21, 'pspiral'), false, 'L22 not reached'); assert.equal(F.legacyTech(p, 'paladin', 22, 'pspiral', slotted), true);
  assert.equal(F.legacyTech(p, 'paladin', 29, 'pmirror', slotted), true); assert.equal(F.legacyTech(p, 'paladin', 29, 'pmirror', { slotted: () => false }), false, 'the skill must be slotted');
  assert.equal(F.legacyTech(p, 'paladin', 19, 'plitanya', slotted), false); assert.equal(F.legacyTech(p, 'paladin', 20, 'plitanya', slotted), true); assert.equal(F.legacyTech(p, 'paladin', 20, 'plitanya', { worn: () => false }), false, 'the trait must be worn');
  assert.equal(F.legacyTech(p, 'knight', 50, 'psunstep'), false, 'no Knight reads a Paladin side'); assert.equal(PR.hasKit('paladin'), false);
  const owed = F.forksOwed({}, 'paladin', 30).map(r => r.key); assert.deepEqual(owed, ['dash', 'hammer', 'chain', 'block', 'skill:divineShield']); assert.equal(F.owedCount({}, 'paladin', 50, []), 11);
  assert.equal(F.setFork(p, 'paladin', 'sig', 'B', 42), 'Locked until level 43'); assert.equal(F.setFork(p, 'paladin', 'sig', 'B', 43), null); assert.equal(F.legacyTech(p, 'paladin', 43, 'parc'), true); assert.equal(F.setFork(p, 'paladin', 'sig', 'A', 43), null, 'free swap'); assert.equal(F.legacyTech(p, 'paladin', 43, 'parc'), false);
  const card = F.forkCard('paladin', 'ult'); assert.equal(card.capstone, true); assert.equal(card.opts.length, 2); const strip = F.roadStrip({}, 'paladin', 30); assert.equal(strip.length, 11); assert.equal(strip.filter(x => x.state === 'next').length, 1);
  const bots = F.botForks('paladin'); assert.equal(Object.keys(bots).length, 22); assert.equal(bots.dash, 'A'); }));
check('PvP EVEN L1: every Paladin fork reads off (YOUR LEVEL: on)', () => withFlag(true, () => {
  const p = { fork: { paladin: { chain: 'B', v: 1 } } }; assert.equal(F.legacyTech(p, 'paladin', 30, 'pbash'), true); F.setPvpEvenForks(true); try { assert.equal(F.legacyTech(p, 'paladin', 30, 'pbash'), false); } finally { F.setPvpEvenForks(false); } assert.equal(F.legacyTech(p, 'paladin', 30, 'pbash'), true); }));
check('trait row: every catalog passive of his is listed once; the folded five are slottable with forks OFF and retired with forks ON; fortress is cut', () => {
  const s = T.TRAIT_SPLIT.paladin; assert(T.hasSplit('paladin')); const cat = SKILLS.filter(n => n.hero === 'paladin' && !n.active).map(n => n.id); assert.equal(cat.length, 23);
  const FOLD = ['warded', 'heavyTread', 'blessedHammer', 'concuss', 'zeal'];
  for (const on of [false, true]) withFlag(on, () => { const listed = [...s.core, ...s.traits, ...Object.keys(s.folded), ...Object.values(s.merged).flat(), ...s.retired, ...(s.cut || []), ...(s.shared || [])];
    for (const id of cat) assert.equal(listed.filter(x => x === id).length + (s.retired.includes(id) && Object.keys(s.folded).includes(id) ? 1 : 0), 1, (on ? 'forks on ' : 'forks off ') + id + ' listed once'); });
  withFlag(false, () => { assert.deepEqual(Object.keys(s.folded).sort(), FOLD.slice().sort()); assert.deepEqual(s.retired, ['fortress']); assert.equal(T.traitIds('paladin').length, 15); for (const id of FOLD) assert(T.isSlottable('paladin', id), id + ' still slottable with the sides dark'); });
  withFlag(true, () => { assert.deepEqual(s.folded, {}); for (const id of [...FOLD, 'fortress']) assert(s.retired.includes(id), id + ' retired'); assert.equal(T.traitIds('paladin').length, 10); for (const id of FOLD) assert(!T.isSlottable('paladin', id)); });
  assert.deepEqual(s.core, ['consecrate', 'unwavering', 'reflect', 'mercy', 'wrath']); assert.deepEqual(s.merged, { shockwave: ['sunder', 'aftershock'] }); assert.deepEqual(s.defaults, ['litany', 'sanctuary']);
  for (const id of [...s.traits, ...FOLD]) { const lv = T.learnLevel('paladin', id); assert(lv >= 2 && lv <= 18, id + ' learned L' + lv); } });
check('TRAITS off: the new row changes nothing (every Paladin passive reads as today at every level)', () => withTraits(false, () => {
  const legacy = (p, id, lv) => { const n = SKILLS.find(x => x.hero === 'paladin' && x.id === id); return !!n && !n.active && lv >= n.level; };
  for (const n of SKILLS.filter(x => x.hero === 'paladin' && !x.active)) for (const lv of [1, 5, 10, 19, 20, 24, 50]) assert.equal(PR.passiveOn({ traits: { paladin: [] } }, 'paladin', n.id, lv), legacy({}, n.id, lv), 'flag off differs: paladin/' + n.id + '@' + lv); }));
check('TRAITS on: ten traits worn two at a time, core always on, the folded five follow the fork flag', () => withTraits(true, () => {
  const p = { traits: { paladin: ['litany', 'sanctuary'] } };
  withFlag(true, () => { assert.equal(PR.passiveOn(p, 'paladin', 'litany', 24), true); assert.equal(PR.passiveOn(p, 'paladin', 'consecrate', 24), true); assert.equal(PR.passiveOn(p, 'paladin', 'smite', 24), false, 'unworn trait off'); assert.equal(PR.passiveOn(p, 'paladin', 'warded', 24), false, 'retired: its effect is SUNSTEP A'); assert.equal(PR.passiveOn(p, 'paladin', 'fortress', 24), false, 'cut'); });
  withFlag(false, () => { assert.equal(PR.passiveOn({ traits: { paladin: ['warded', 'sanctuary'] } }, 'paladin', 'warded', 24), true, 'forks dark: WARDED is an ordinary trait again'); assert.equal(PR.passiveOn(p, 'paladin', 'fortress', 24), false); }); }));
check('the effect sites exist (source scan): every rung, the trait sites, the capstone helpers', () => {
  for (const frag of ['const plb = id =>', 'const shockLife =', 'const shockMul =', 'function dawnStrike()', 'function palForkBlow(', 'function radiantTurn()', 'function lanceFall()', 'function judgeHit(', 'function judgementFall(m = 1, reach = 110)',
    'P.aegisStepUntil', 'P.mirrorT', 'P.bastionT', 'P.dawnPend', 'P.wrathStore', 'P.steelUntil', 'spiral: plb(', 'home: plb(', "plb('pquick') && P.wrathT > 0 ? 1.25 : 1", 'P.judgeQ', 'plb(\'pjudge\') ? { ...HG.verdict', "plb('pswift') ? 1.6 : 1", "plb('pzeal') ? 1.25 : 1", "plb('ppillar') ?", "plb('parc') ? 0.4 : 0", "plb('pearlya') ? 0.65 : 1"]) assert(main.includes(frag), 'missing ' + frag);
  assert(/\|\| pb\('psunstep'\)/.test(main) && /!pb\('paegisstep'\)/.test(main), 'SUNSTEP / AEGIS STEP sites'); });
check('boss law: no side promises an invulnerable foe, a freeze or a pin; stagger / shove sides name the small', () => {
  for (const [k, e] of Object.entries(PALADIN_FORKS)) for (const s of ['A', 'B']) assert(!/INVULNERAB|FREEZE|PIN\b|IMMUNE|UNTOUCHABLE/i.test(e[s].what + ' ' + e[s].teach), 'boss law: ' + e[s].id);
  const mainLines = main.split('\n'); const bash = mainLines.find(l => l.includes("if (plb('pbash') && third)")); assert(bash && /!e\.maxHp && !e\.mini && !e\.elite/.test(bash), 'SHIELD BASH shoves only the small');
  const wide = mainLines.find(l => l.includes("e.vy = Math.max(e.vy || 0, 240)")); assert(wide && /!e\.maxHp && !e\.mini/.test(wide), 'HIGH ARC drives down only the small'); });
if (bad.length) { console.log('PALADIN FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Paladin forks: 11 rungs + 10 trait pairs (42 side ids), every side read by main.js, flag off = base, PvP EVEN off, trait row (23 passives listed once; 5 folded follow the fork flag), boss law kept.');
