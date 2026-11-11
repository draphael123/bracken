// tools/pyro-forks.mjs - NODE-ONLY checks for the Pyromancer's complete fork road (claude/pyrofork). No browser. Run: node tools/pyro-forks.mjs
// 1. data: 11 rungs on the ladder, 10 trait pairs for her 10 traits, ids unique across every registered hero, text limits, sides differ, skill keys = catalog skill ids
// 2. wiring: every side id is read by src/main.js through pb('id') (the effect code exists), the fork hands exist, pb() is flag-gated, no ad-block-looking filename
// 3. flag off = base (no read, no pick, blaze / inferno still slottable); flag on: reads respect pick + level + slot / worn, blaze / inferno retire, PvP EVEN L1 off, bots take A
// 4. numbers: boss law (caps), A/B parity hand math (SHORT FUSE vs SLOW FUSE, shower vs star on a lone boss), showerPlan
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import { PYRO_FORKS, PYRO_RUNG_FORKS, PYRO_TRAIT_FORKS, PF, showerPlan, shortStagger } from '../src/forks-pyro.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
import * as T from '../src/traits.js';
import { SKILLS } from '../src/progression-catalog.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0]); } };
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };
const SLOT_WORN = { slotted: () => true, worn: () => true };

check('shipped flag is false', () => assert.equal(F.FORKS_SHIP, false));
check('11 rungs: every ladder slot holds one fork, on its rung level', () => {
  const ab = F.forkList('pyro', false); assert.equal(ab.length, 11); assert.deepEqual(ab.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ab.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot));
  assert.deepEqual(ab.map(r => r.key), ['dash', 'skill:fireWall', 'chain', 'block', 'skill:wisp', 'heavy', 'spender', 'skill:firestorm', 'sig', 'skill:flashover', 'ult']);
  assert.equal(Object.keys(PYRO_RUNG_FORKS).length, 11); assert(ab[10].e.capstone === true && F.isCapstone(ab[10].e));
  for (const r of ab) if (r.key.startsWith('skill:')) { assert.equal(r.e.ability, r.key); const id = r.key.slice(6); assert(SKILLS.some(s => s.id === id && s.hero === 'pyro'), id + ' is a Pyromancer skill in the catalog'); } });
check('10 trait forks: one pair per trait of hers, keyed trait:<id>, open at L20 while worn', () => {
  const tr = F.forkList('pyro', true); assert.equal(tr.length, 10); assert.equal(Object.keys(PYRO_TRAIT_FORKS).length, 10);
  const want = ['emberSkin', 'heatShield', 'brand', 'emberHeart', 'wildfire', 'phoenix', 'longFlame', 'jetWalk', 'scatter', 'twin']; assert.deepEqual(tr.map(r => r.e.trait).sort(), want.slice().sort());
  withFlag(true, () => { const ids = T.traitIds('pyro'); assert.equal(ids.length, 10, 'with the forks on her traits are exactly the ten'); for (const id of want) assert(ids.includes(id), id); });
  for (const r of tr) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(F.levelOfFork(r.e), 20); } });
check('ids unique across every registered hero; names <= 14, what <= 96, teach <= 155; sides differ; input present', () => {
  const ids = new Set(); for (const [h, reg] of [['knight', KNIGHT_FORKS], ['pyro', PYRO_FORKS]]) for (const [k, e] of Object.entries(reg)) { assert(e.name && e.trade && e.name.length <= 20, h + k + ' name/trade');
    for (const s of ['A', 'B']) { const x = e[s]; assert(x.id && x.name && x.what && x.teach && x.input, h + k + s); assert(x.name.length <= F.NAME_MAX, h + k + s + ' name ' + x.name); assert(x.what.length <= 96, h + k + s + ' what ' + x.what.length); assert(x.teach.length <= 155 + 15, h + k + s + ' teach ' + x.teach.length); assert(!ids.has(x.id), 'dup id ' + x.id); ids.add(x.id); }
    assert.notEqual(e.A.what, e.B.what); }
  assert.equal(Object.values(PYRO_FORKS).length * 2, 42); });
check('the card text promises no heal and no boss pin; every side is fire (identity word: heat / pips / burn / bar)', () => {
  for (const e of Object.values(PYRO_FORKS)) for (const s of ['A', 'B']) assert(!/bHEAL(S|ING)?b|MEND|IMMUNE|INVULNERABLE|FREEZE|PIN\b|STUN/i.test(e[s].what + ' ' + e[s].teach), 'law: ' + e[s].id); });
check('every side id is read by main.js through pb(id) (the effect code exists)', () => {
  for (const [k, e] of Object.entries(PYRO_FORKS)) for (const s of ['A', 'B']) assert(main.includes("pb('" + e[s].id + "')"), k + ' ' + s + ' ' + e[s].id + ' has no effect site'); });
check('the fork hands and the gating exist in main.js', () => {
  for (const frag of ['function pb(id) { return isPyro() && FRK.forksShip() && FRK.forkOn(PROG, \'pyro\', id, heroLevel()', 'function pySmokeStart(', 'function pyParryFork(', 'function pyBallForks(', 'function pyStormCast(', 'function pyChainFlash(', 'function pyWispX(', 'function pyTechTick(', 'function showerLand(', 'function pyHeatRaw(',
    'const lbNeed =', 'const lbLife =', 'const wispK =', 'const jwK =', 'pyTechTick(dt);', "'METEOR SHOWER'", "'STAR FALL'"]) assert(main.includes(frag), 'missing: ' + frag); });
check('no ad-block-looking filename', () => { for (const f of ['forks-pyro.js', 'pyro-forks.mjs']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });
check('flag off = base: no read, no owed fork, no p.fork written, blaze / inferno still slottable folded traits', () => withFlag(false, () => {
  const p = { fork: { pyro: { dash: 'A', v: 1 } } }; assert.equal(F.forkOn(p, 'pyro', 'pyphoenix', 50, SLOT_WORN), false); assert.equal(F.forkSide(p, 'pyro', 'dash'), null); assert.deepEqual(F.forksOwed(p, 'pyro', 50), []); assert.deepEqual(F.roadStrip(p, 'pyro', 50), []);
  assert.equal(PR.hasKit('pyro'), false); assert.equal(PR.hasKit('knight'), true); assert.equal(F.setFork({}, 'pyro', 'dash', 'A', 50), 'Forks are not open yet');
  assert.equal(T.kindOf('pyro', 'blaze'), 'folded'); assert(T.slottable('pyro').includes('blaze') && T.slottable('pyro').includes('inferno')); assert.equal(T.traitIds('pyro').length, 12); }));
check('flag on: blaze / inferno retire (kept in the catalog, never slot); the ten traits and the sig fork replace them', () => withFlag(true, () => {
  assert.equal(T.kindOf('pyro', 'blaze'), 'retired'); assert.equal(T.kindOf('pyro', 'inferno'), 'retired'); assert(!T.slottable('pyro').includes('blaze') && !T.slottable('pyro').includes('inferno')); assert.equal(T.traitIds('pyro').length, 10);
  assert.equal(PYRO_RUNG_FORKS.sig.A.id, 'pywhite'); assert.equal(PYRO_RUNG_FORKS.sig.B.id, 'pybellowed'); }));
check('flag on: reads respect pick, level, the slotted skill and the worn trait; PvP EVEN L1 turns every side off', () => withFlag(true, () => {
  const p = { fork: { pyro: { dash: 'B', 'skill:wisp': 'B', chain: 'A', 'trait:twin': 'B', v: 1 } } };
  assert.equal(F.forkOn(p, 'pyro', 'pysmoke', 21), true); assert.equal(F.forkOn(p, 'pyro', 'pyphoenix', 21), false); assert.equal(F.forkOn(p, 'pyro', 'pysmoke', 20), false, 'rung 21 not reached');
  assert.equal(F.forkOn(p, 'pyro', 'pythreewisp', 29, { slotted: () => true }), true); assert.equal(F.forkOn(p, 'pyro', 'pythreewisp', 29, { slotted: () => false }), false, 'WISP must be slotted'); assert.equal(F.forkOn(p, 'pyro', 'pythreewisp', 28, { slotted: () => true }), false);
  assert.equal(F.forkOn(p, 'pyro', 'pytwinb', 20, { worn: () => true }), true); assert.equal(F.forkOn(p, 'pyro', 'pytwinb', 20, { worn: () => false }), false, 'TWIN EMBER must be worn'); assert.equal(F.forkOn(p, 'pyro', 'pytwinb', 19, { worn: () => true }), false);
  assert.equal(F.forkOn(p, 'knight', 'pysmoke', 50), false, 'another hero never reads her sides');
  F.setPvpEvenForks(true); try { assert.equal(F.forkOn(p, 'pyro', 'pysmoke', 50), false); assert.equal(F.forkSide(p, 'pyro', 'dash'), null); } finally { F.setPvpEvenForks(false); } }));
check('flag on: owed queue in ladder order, pick/swap free + level gated, bots take A, board + strip shapes, bad saves dropped', () => withFlag(true, () => {
  const p = {}; assert.deepEqual(F.forksOwed(p, 'pyro', 30).map(r => r.key), ['dash', 'skill:fireWall', 'chain', 'block', 'skill:wisp']); assert.equal(F.setFork(p, 'pyro', 'dash', 'A', 20), 'Locked until level 21'); assert.equal(F.setFork(p, 'pyro', 'dash', 'A', 21), null); assert.equal(F.setFork(p, 'pyro', 'dash', 'B', 21), null); assert.equal(F.forkSide(p, 'pyro', 'dash'), 'B');
  assert.equal(F.owedCount({}, 'pyro', 50, ['emberSkin', 'twin']), 13); assert.equal(F.boardRows({}, 'pyro', 50, 'ABILITIES', SLOT_WORN).length, 11); assert.equal(F.boardRows({}, 'pyro', 50, 'TRAITS', SLOT_WORN).length, 10); assert.equal(F.roadStrip({}, 'pyro', 50).length, 11);
  const b = F.botForks('pyro'); assert.equal(Object.keys(b).length, 21 + 1); assert(Object.entries(b).every(([k, v]) => k === 'v' || v === 'A'));
  const bad1 = { fork: { pyro: { dash: 'C', nope: 'A', 'skill:wisp': 'B', v: 1 } } }; F.validateForks(bad1); assert.deepEqual(bad1.fork.pyro, { 'skill:wisp': 'B', v: 1 });
  const m = { card: { pyro: { v: 4 } } }; const r = F.migrateForks(m); assert.equal(r.done, false, 'no Pyromancer migration: she had no technique or upgrade cards on master'); }));
check('numbers: boss law caps hold and the A/B pairs sit in parity (forkplan rule 2: within ~10%)', () => {
  assert(PF.star.capPct <= 0.05 && PF.star.capMini <= 0.12, 'STAR FALL keeps the old cap family (base 4% / 10%)'); assert(PF.shower.capPct * PF.shower.n <= 0.07, 'five showers can never take more than 7% from a boss'); assert(PF.shower.capPct * 2 < PF.star.capPct, 'a lone ~40 px boss catches about 2 of 5: less than the star');
  assert(PF.shower.R < PF.star.R && PF.shower.k <= 1.0);
  const base = 1 / 3, short = PF.fuse.shortMul / PF.fuse.shortNeed; assert(Math.abs(short - base) / base <= 0.1, 'SHORT FUSE damage per pip ' + short.toFixed(3) + ' vs base ' + base.toFixed(3));
  assert(PF.fuse.shortMul < 1 && PF.fuse.shortNeed === 2 && shortStagger(true) === 0 && shortStagger(false) > 0, 'SHORT FUSE staggers the small only');
  assert(PF.wisp.threeK * (1 + PF.wisp.extra) <= PF.wisp.greatK * 1.01, 'THREE WISPS total weight <= GREAT WISP ' + PF.wisp.threeK * 3 + ' vs ' + PF.wisp.greatK);
  assert(PF.chain.sparkMul * PF.chain.sparkPips >= 1.5 && PF.chain.sparkMul * PF.chain.sparkPips <= 1.8, 'SPARK STAFF: cuts a little lighter, bombs a lot sooner'); assert(PF.heat.fill === PF.heat.fall, 'BELLOWED: faster both ways');
  assert(PF.step.shortLen < 1 && PF.step.far > 1 && PF.flash.searingMul * 1 >= 1.4 && PF.flash.chainMul < 1 && PF.storm.walkK < PF.storm.anchorK); });
check('showerPlan: five spots across 60-300 px ahead, a foe within 40 px pulls its spot on to it', () => {
  const plan = showerPlan(1, 100, [163, 400]); assert.equal(plan.length, 5); assert.equal(plan[0].x, 163); assert.equal(plan[0].snapped, true); assert.equal(plan[4].x, 400); assert.equal(plan[1].snapped, false); assert(Math.abs(plan[4].at - 1.2) < 1e-9);
  const left = showerPlan(-1, 500, []); assert.equal(left[0].x, 440); assert.equal(left[4].x, 200); });
check('flag-off audit: the pb() sites are all guarded by pb itself; the dodge / wall / fuse / meteor lines keep the base constants when pb is false', () => {
  assert(main.includes("isPyro() ? 300 * (pb('pyphoenix') ? PF.step.far : 1) :")); assert(main.includes(": 2.5, delay: i * 0.08, own: true }"), 'the wall keeps its 2.5 s'); assert(main.includes("const lbNeed = () => pb('pyshortfuse') ? PF.fuse.shortNeed : PYRO_KIT.lb.need;"));
  assert(main.includes("const lbLife = () => pb('pyslowfuse') ? PF.fuse.slowLife : PYRO_KIT.lb.life;")); assert(main.includes("(pb('pybellowed') ? PF.heat.fall : 1) * dt")); });
if (bad.length) { console.log('PYRO FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Pyro forks: 11 rungs + 10 trait pairs (42 side ids), every side read by main.js, flag off = base, blaze / inferno retire with the flag, PvP EVEN off, no migration owed, parity + boss-law numbers hold.');
