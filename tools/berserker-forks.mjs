// tools/berserker-forks.mjs - NODE-ONLY checks for the Berserker's complete fork road (claude/bersfork). No browser, no puppeteer, no cdp. Run: node tools/berserker-forks.mjs
// 1. data: 11 rungs on the ladder, 10 trait pairs for his 10 traits, ids unique across the registered heroes, text limits, sides differ, skill keys = catalog skills of his
// 2. wiring: every side id is read by src/berserker.js (F('id')) or src/main.js (bzFk('id')); the main.js one-line sites exist; flag off = base reads; bzHide / bzSplit retire only with the flag on
// 3. effects: the kit (makeBerserker) is driven through a FAKE api: each side's number lands, flag-off numbers equal the old ones (spin, roar, cleave, rollStep, heal, takeMul ...)
// 4. numbers: boss law (small-foe-only reels, no pins), A/B parity hand math for the rungs that are damage
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import * as T from '../src/traits.js';
import { BERSERKER_FORKS, BERSERKER_RUNG_FORKS, BERSERKER_TRAIT_FORKS, BF, spinCfg, roarCfg } from '../src/forks-berserker.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
import { SKILLS } from '../src/progression-catalog.js';
import { makeBerserker, BZ } from '../src/berserker.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0] + ' @' + (String(e.stack).split('\n').find(l => l.includes('berserker-forks.mjs:')) || '').trim().replace(/^.*berserker-forks\.mjs/, 'L')); } };
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const bzsrc = fs.readFileSync(new URL('../src/berserker.js', import.meta.url), 'utf8');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };
const SLOT_WORN = { slotted: () => true, worn: () => true };

/* ---------- 1. DATA ---------- */
check('shipped flag is false', () => assert.equal(F.FORKS_SHIP, false));
check('11 rungs: every ladder slot holds one fork, on its rung level', () => {
  const ab = F.forkList('berserker', false); assert.equal(ab.length, 11); assert.deepEqual(ab.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ab.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot));
  assert.deepEqual(ab.map(r => r.key), ['dash', 'skill:bzSpin', 'chain', 'block', 'skill:bzRoar', 'heavy', 'spender', 'skill:bzCleave', 'sig', 'skill:bzStand', 'ult']);
  assert.equal(Object.keys(BERSERKER_RUNG_FORKS).length, 11); assert(ab[10].e.capstone === true && F.isCapstone(ab[10].e));
  for (const r of ab) if (r.key.startsWith('skill:')) { assert.equal(r.e.ability, r.key); const id = r.key.slice(6); assert(SKILLS.some(s => s.id === id && s.hero === 'berserker' && s.active), id + ' is a Berserker active in the catalog'); } });
check('10 trait forks: one pair per trait of his, keyed trait:<id>, open at L20 while worn', () => {
  const tr = F.forkList('berserker', true); assert.equal(tr.length, 10); assert.equal(Object.keys(BERSERKER_TRAIT_FORKS).length, 10);
  const want = ['bzLong', 'bzBraceLong', 'bzBraceBack', 'bzHot', 'bzScar', 'bzWide', 'bzPrice', 'bzIronBrace', 'bzHaft', 'bzUnbowed']; assert.deepEqual(tr.map(r => r.e.trait).sort(), want.slice().sort());
  withFlag(true, () => { const ids = T.traitIds('berserker'); assert.equal(ids.length, 10, 'with the forks on his traits are exactly the ten'); for (const id of want) assert(ids.includes(id), id); });
  for (const r of tr) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(F.levelOfFork(r.e), 20); } });
check('ids unique across every registered hero; names <= 14, what <= 96, teach <= 160; sides differ; input present', () => {
  const ids = new Set(); for (const [h, reg] of [['knight', KNIGHT_FORKS], ['berserker', BERSERKER_FORKS]]) for (const [k, e] of Object.entries(reg)) { assert(e.name && e.trade && e.name.length <= 20, h + k + ' name/trade');
    for (const s of ['A', 'B']) { const x = e[s]; assert(x.id && x.name && x.what && x.teach && x.input, h + k + s); assert(x.name.length <= F.NAME_MAX, h + k + s + ' name ' + x.name); assert(x.what.length <= 96, h + k + s + ' what ' + x.what.length); assert(x.teach.length <= 160, h + k + s + ' teach ' + x.teach.length);
      assert(!ids.has(x.id), 'dup id ' + x.id); ids.add(x.id); assert(x.what === x.what.toUpperCase() && x.teach === x.teach.toUpperCase(), 'upper case ' + x.id); }
    assert.notEqual(e.A.what, e.B.what); }
  assert.equal(Object.values(BERSERKER_FORKS).length * 2, 42); });
check('card words say CHOP / AXE / BAR / RAGE: never the old ladder or cross-chop names (berserkerid needs no text change); no heal-over-3% or boss pin wording', () => {
  for (const e of Object.values(BERSERKER_FORKS)) for (const s of ['A', 'B']) { const t = e[s].what + ' ' + e[s].teach; assert(!/CROSS-CHOP|WHIRL|GROUND-SPLITTER|OVERHEAD CHOP|LADDER|TIER/i.test(t.replace('OVERHEAD', '')), 'old kit word: ' + e[s].id); assert(!/IMMUNE|INVULNERABLE|FREEZE|\bPINS?\b|STUN/i.test(t), 'law: ' + e[s].id); } });
check('no ad-block-looking filename', () => { for (const f of ['forks-berserker.js', 'berserker-forks.mjs']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });

/* ---------- 2. WIRING ---------- */
check('every side id is read by berserker.js F(id) or main.js bzFk(id) (the effect code exists)', () => {
  for (const [k, e] of Object.entries(BERSERKER_FORKS)) for (const s of ['A', 'B']) { const id = e[s].id; assert(bzsrc.includes("F('" + id + "')") || main.includes("bzFk('" + id + "')"), k + ' ' + s + ' ' + id + ' has no effect site'); } });
check('the main.js one-line sites and the gating exist', () => {
  for (const frag of ["const bzFk = id => isBz() && FRK.forksShip() && FRK.forkOn(PROG, 'berserker', id, heroLevel(), fkCtx('berserker', heroLevel()))", 'fk: bzFk,', 'BZK.windK()', 'BZK.heavyK()', 'BZK.dodgeK()', 'BZK.slipped()', 'BZK.reachK()', 'BZK.wideR()', 'BZK.wideB(', 'BZK.fuseAt()',
    "if (FRK.forksShip()) ultRegister('berserker'", 'BZK.ultReady()', 'BZK.ultFire()', "bzFk('bfoverhead')", "bzFk('bfhotb')"]) assert(main.includes(frag), 'missing: ' + frag); });
check('the capstone is registered only with the flag on; flag-off ultHas(berserker) stays false (lab bots read ultHas)', () => assert(/if \(FRK\.forksShip\(\)\) ultRegister\('berserker'/.test(main)));
check('flag off = base: no read, no owed fork, nothing written, bzHide / bzSplit still slottable folded traits', () => withFlag(false, () => {
  const p = { fork: { berserker: { dash: 'A', v: 1 } } }; assert.equal(F.forkOn(p, 'berserker', 'bfbull', 50, SLOT_WORN), false); assert.equal(F.forkSide(p, 'berserker', 'dash'), null); assert.deepEqual(F.forksOwed(p, 'berserker', 50), []); assert.deepEqual(F.roadStrip(p, 'berserker', 50), []);
  assert.equal(F.setFork({}, 'berserker', 'dash', 'A', 50), 'Forks are not open yet');
  assert.equal(T.kindOf('berserker', 'bzHide'), 'folded'); assert(T.slottable('berserker').includes('bzHide') && T.slottable('berserker').includes('bzSplit')); assert.equal(T.traitIds('berserker').length, 12); }));
check('flag on: bzHide / bzSplit retire (kept in the catalog, never slot); the ten traits and the two sides replace them', () => withFlag(true, () => {
  assert.equal(T.kindOf('berserker', 'bzHide'), 'retired'); assert.equal(T.kindOf('berserker', 'bzSplit'), 'retired'); assert(!T.slottable('berserker').includes('bzHide') && !T.slottable('berserker').includes('bzSplit')); assert.equal(T.traitIds('berserker').length, 10);
  assert.equal(BERSERKER_RUNG_FORKS.spender.B.id, 'bffuse'); assert.equal(BERSERKER_RUNG_FORKS['skill:bzCleave'].A.id, 'bfoverhead'); }));
check('flag on: reads respect pick, level, the slotted skill and the worn trait; PvP EVEN L1 turns every side off; another hero never reads them', () => withFlag(true, () => {
  const p = { fork: { berserker: { dash: 'B', 'skill:bzRoar': 'A', chain: 'A', 'trait:bzHot': 'B', ult: 'B', v: 1 } } };
  assert.equal(F.forkOn(p, 'berserker', 'bfslip', 21), true); assert.equal(F.forkOn(p, 'berserker', 'bfbull', 21), false); assert.equal(F.forkOn(p, 'berserker', 'bfslip', 20), false, 'rung 21 not reached');
  assert.equal(F.forkOn(p, 'berserker', 'bfwideroar', 29, { slotted: () => true }), true); assert.equal(F.forkOn(p, 'berserker', 'bfwideroar', 29, { slotted: () => false }), false, 'BATTLE ROAR must be slotted'); assert.equal(F.forkOn(p, 'berserker', 'bfwideroar', 28, SLOT_WORN), false);
  assert.equal(F.forkOn(p, 'berserker', 'bfhotb', 20, { worn: () => true }), true); assert.equal(F.forkOn(p, 'berserker', 'bfhotb', 20, { worn: () => false }), false, 'HOT BLOOD must be worn'); assert.equal(F.forkOn(p, 'berserker', 'bfhotb', 19, { worn: () => true }), false);
  assert.equal(F.forkOn(p, 'berserker', 'bfgreataxe', 50), true); assert.equal(F.forkOn(p, 'berserker', 'bfgreataxe', 49), false, 'the capstone needs L50');
  assert.equal(F.forkOn(p, 'knight', 'bfslip', 50), false, 'another hero never reads his sides');
  F.setPvpEvenForks(true); try { assert.equal(F.forkOn(p, 'berserker', 'bfslip', 50), false); assert.equal(F.forkSide(p, 'berserker', 'dash'), null); } finally { F.setPvpEvenForks(false); } }));
check('flag on: owed queue in ladder order, pick / swap free + level gated, bots take A, board + strip shapes, bad saves dropped', () => withFlag(true, () => {
  const p = {}; assert.deepEqual(F.forksOwed(p, 'berserker', 30).map(r => r.key), ['dash', 'skill:bzSpin', 'chain', 'block', 'skill:bzRoar']); assert.equal(F.setFork(p, 'berserker', 'dash', 'A', 20), 'Locked until level 21'); assert.equal(F.setFork(p, 'berserker', 'dash', 'A', 21), null);
  assert.equal(F.setFork(p, 'berserker', 'dash', 'B', 21), null, 'swap is free'); assert.equal(p.fork.berserker.dash, 'B');
  assert.equal(F.owedCount({}, 'berserker', 50, ['bzHot', 'bzLong']), 13); assert.equal(F.boardRows({}, 'berserker', 50, 'ABILITIES', SLOT_WORN).length, 11); assert.equal(F.boardRows({}, 'berserker', 50, 'TRAITS', SLOT_WORN).length, 10);
  assert.equal(F.roadStrip({}, 'berserker', 50).length, 11); const bots = F.botForks('berserker'); assert.equal(Object.keys(bots).filter(k => k !== 'v').length, 21); assert(Object.entries(bots).every(([k, v]) => k === 'v' || v === 'A'));
  const bad1 = { fork: { berserker: { dash: 'C', nonsense: 'A', v: 'x' }, ghost: { dash: 'A' } } }; F.validateForks(bad1); assert.equal(bad1.fork.berserker.dash, undefined); assert.equal(bad1.fork.berserker.nonsense, undefined); }));
check('a held save with no berserker fork data is untouched; the Berserker has no technique or upgrade cards, so NO migration is owed', () => withFlag(true, () => {
  assert.equal(PR.hasKit('berserker'), false); const p = { card: { berserker: { ms: { 25: 'bzperk' } } } }; const r = F.migrateForks(p); assert.equal(r.done, false); assert.equal(p.fork, undefined); }));

/* ---------- 3. EFFECTS (the kit through a fake api) ---------- */
const mk = (forks = [], tal = {}) => {
  const P = { x: 100, y: 100, face: 1, hp: 100, maxHp: 100, rage: 0, ground: true, dodge: 0, dead: false };
  const enemies = []; const hurt = []; const numbers = []; const state = { time: 10 };
  const SFX = new Proxy({}, { get: () => () => {} });
  const api = { get P() { return P; }, enemies, parts: [], get time() { return state.time; }, LH: 40, TS: 16, SFX, players: () => [P], isBz: () => true, tal: () => ({ rk: () => 1, fk: id => forks.includes(id), ...tal }),
    spend: () => true, tired: () => {}, isSolid: () => false, tileAt: () => 0, isOneWay: () => false, knockSkip: () => false, box: e => ({ l: e.x - 6, r: e.x + 6, t: e.y - 14, b: e.y }), overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    hurtAs: (kind, e, d, x) => { hurt.push({ kind, e, d }); e.hp -= d; if (e.hp <= 0) e.alive = false; }, swordDmg: () => 12, amul: () => 1, number: (x, y, t) => numbers.push(t), sparks: () => {}, dust: () => {}, ringAt: () => {}, shakeCam: () => {}, hitstop: () => {}, zoomKick: () => {}, squash: () => {}, streaks: () => {},
    kitPose: () => {}, meterReady: () => {}, trialEvent: () => {}, teach: () => {}, parried: () => {}, tap: () => 0.2, blockCost: () => 10, canPay: () => true, pay: () => {}, takeScale: () => 1, inTrial: () => false, poiseLean: (e, n) => { e.poiseLeaned = (e.poiseLeaned || 0) + n; }, guardBreak: () => {} };
  return { K: makeBerserker(api), P, enemies, hurt, numbers, state, api }; };
const foe = (x, o = {}) => ({ x, y: 100, w: 12, h: 14, alive: true, hp: 1000, ...o });
const base = () => mk([]);

check('flag off = base numbers: roar (r70, +25 rage, small 0.6 s, push 110), spin (0.5 s, 2 passes x1.15 r36), cleave (62 x1.8, lean 30), roll shove (0.6, 200), heal 2.5%, take 1.25', () => {
  assert.deepEqual(roarCfg(''), { r: 70, rage: 25, small: 0.6, push: 110 }); assert.deepEqual(spinCfg(''), { dur: 0.5, n: 2, r: 36, k: 1.15 });
  { const { K, P, enemies } = base(); const e = foe(130); enemies.push(e); K.kit.roar(); assert.equal(P.rage, 25); assert.equal(e.stagger, 0.6); assert.equal(e.vx, 110); }
  { const { K, P, enemies, hurt } = base(); const e = foe(120); enemies.push(e); K.kit.spin(); assert.equal(P.spinT, 0.5); assert.equal(P.spinHits.length, 2); for (let i = 0; i < 30; i++) K.kitStep(1 / 60); assert.equal(hurt.length, 2); assert.equal(hurt[0].d, Math.round(12 * 1.15)); }
  { const { K, P, enemies, hurt } = base(); const e = foe(150); enemies.push(e); K.kit.cleave(); assert.equal(P.cleaveT, 0.16); K.kitStep(0.01); assert.equal(hurt.length, 1); assert.equal(hurt[0].d, Math.round(12 * 1.8)); assert.equal(e.poiseLeaned, 30); }
  { const { K, P, enemies } = base(); P.dodge = 0.2; const e = foe(104); enemies.push(e); K.update(0.016, {}, { stunned: false, dodging: true, attacking: false }); assert.equal(e.shoved, 0.6); assert.equal(e.vx, 200); }
  { const { K, P } = base(); assert.equal(K.takeMul(), 1); P.frenzyT = 5; assert.equal(K.takeMul(), 1.25); }
  { const { K, P } = base(); assert.equal(K.fuseAt(), 100); assert.equal(K.windK(), 1); assert.equal(K.heavyK(), 1); assert.equal(K.dodgeK(), 1); assert.equal(K.reachK(), 1); assert.equal(K.ultReady(), false); P.rage = 100; assert.equal(K.ultReady(), false, 'flag off: no capstone'); assert.equal(K.wideR(), 0); assert.equal(K.wideB(1), -2); } });
check('L21 BULL BARGE shoves x1.5 (300), leaves foes down 1 s, +8 rage each; SLIP shoves nothing, rolls x0.7, a blow that finds air gives +5 rage (0.7 s apart)', () => {
  { const { K, P, enemies } = mk(['bfbull']); P.dodge = 0.2; const e = foe(104); enemies.push(e); K.update(0.016, {}, { stunned: false, dodging: true, attacking: false }); assert.equal(e.shoved, 1.0); assert.equal(e.vx, 300); assert.equal(e.stagger, 1.0); assert.equal(Math.round(P.rage), 8); }
  { const { K, P, enemies, state } = mk(['bfslip']); P.dodge = 0.2; const e = foe(104); enemies.push(e); K.update(0.016, {}, { stunned: false, dodging: true, attacking: false }); assert.equal(e.shoved, undefined, 'no shove'); assert.equal(K.dodgeK(), 0.7);
    K.slipped(); assert.equal(P.rage, 5); K.slipped(); assert.equal(P.rage, 5, 'cooldown'); state.time += 0.8; K.slipped(); assert.equal(P.rage, 10); } });
check('L22 WIDE SPIN (0.8 s, r50, 2 x1.2) and QUICK SPINS (0.5 s, 4 x0.6): same total per foe', () => {
  { const { K, P, enemies, hurt } = mk(['bfwidespin']); const e = foe(145); enemies.push(e); K.kit.spin(); assert.equal(P.spinT, 0.8); for (let i = 0; i < 60; i++) K.kitStep(1 / 60); assert.equal(hurt.length, 2, 'two passes'); assert.equal(hurt[0].d, Math.round(12 * 1.2)); }
  { const { K, P, enemies, hurt } = mk(['bfquickspin']); const e = foe(120); enemies.push(e); K.kit.spin(); assert.equal(P.spinHits.length, 4); for (let i = 0; i < 40; i++) K.kitStep(1 / 60); assert.equal(hurt.length, 4, 'four bites'); assert.equal(hurt[0].d, Math.round(12 * 0.6)); }
  assert.equal(BF.spin.wide.n * BF.spin.wide.k, BF.spin.quick.n * BF.spin.quick.k); });
check('L24 BLOOD SCENT: a kill, the next landed chop x1.2 once; OPEN VEINS: REND stacks from half a bar, the fourth cracks', () => {
  { const { K, P, enemies, state } = mk(['bfscent']); const e = foe(110, { hp: 1 }); K.dealt(e, 5, true); assert(P.bfScentT > state.time); assert.equal(K.chopLanded(foe(110)), 1.2); assert.equal(K.chopLanded(foe(110)), 1, 'spent'); K.dealt(e, 5, true); state.time += 5; assert.equal(K.chopLanded(foe(110)), 1, 'expired after 4 s'); }
  { const { K, P } = mk(['bfveins']); const e = foe(110); P.rage = 49; assert.equal(K.rend(e), false); assert.equal(P.bzRendN, undefined, 'under half a bar: no stack'); P.rage = 50; assert.equal(K.rend(e), false); assert.equal(P.bzRendN, 1); K.rend(e); K.rend(e); assert.equal(K.rend(e), true, 'the fourth cracks'); }
  { const { K, P } = base(); P.rage = 90; assert.equal(K.rend(foe(110)), false); assert.equal(P.bzRendN, undefined, 'flag off: REND needs a frenzy'); } });
check('L27 BRACED ROAR reels small foes (not bosses); SPITE banks half the blow (cap 0.8 chop) for the next chop within 6 s', () => {
  const parry = (K, P, dmg) => { K.update(0.016, { block: true }, { stunned: false, dodging: false, attacking: false, guardOk: true }); P.bzTakeAt = 10; return K.takeTakes(P.x + 8, dmg, false, null, false); };
  { const { K, P, enemies } = mk(['bfbraced']); const s = foe(130), b = foe(125, { maxHp: 500 }); enemies.push(s, b); const r = parry(K, P, 30); assert.equal(r, 'blocked'); assert.equal(s.stagger, 0.8); assert.equal(b.stagger, undefined, 'a boss is not reeled'); }
  { const { K, P } = mk(['bfspite']); const r = parry(K, P, 30); assert.equal(r, 'blocked'); assert(Math.abs(P.bfBank.v - 9.6) < 1e-9, 'capped at 0.8 of a chop'); const m = K.chopLanded(foe(110)); assert(Math.abs(m - (1 + 9.6 / 12)) < 1e-9); assert.equal(P.bfBank, null); }
  { const { K, P } = mk(['bfspite']); parry(K, P, 10); assert.equal(P.bfBank.v, 5); } });
check('L29 WIDE ROAR (r100, +15 rage, small 1.2 s, push 200) and GUT ROAR (r40, +45 rage, small 0.3 s); bosses only a short stagger; partners still quicken', () => {
  { const { K, P, enemies } = mk(['bfwideroar']); const s = foe(190), b = foe(150, { maxHp: 500 }); enemies.push(s, b); K.kit.roar(); assert.equal(P.rage, 15); assert.equal(s.stagger, 1.2); assert.equal(s.vx, 200); assert.equal(b.stagger, 0.2); }
  { const { K, P, enemies } = mk(['bfgutroar']); const s = foe(130), far = foe(170); enemies.push(s, far); K.kit.roar(); assert.equal(P.rage, 45); assert.equal(s.stagger, 0.3); assert.equal(far.stagger, undefined, 'out of the 40 px ring'); } });
check('L32 DEEP WIND (tiers 25% later, x1.15) and SHALLOW WIND (30% sooner, x0.9)', () => { { const { K } = mk(['bfdeep']); assert.equal(K.windK(), 1.25); assert.equal(K.heavyK(), 1.15); } { const { K } = mk(['bfshallow']); assert.equal(K.windK(), 0.7); assert.equal(K.heavyK(), 0.9); } });
check('L36 CHAINED RAGE (+0.5 s a kill in a frenzy, cap 6 s); SHORT FUSE (frenzy from 67, 5 s, takes x1.1, THICK HIDE baked)', () => {
  { const { K, P } = mk(['bfchained']); K.frenzy(); assert.equal(P.frenzyT, 8); for (let i = 0; i < 20; i++) K.dealt(foe(110, { hp: 0 }), 5, true); assert(Math.abs(P.frenzyT - 14) < 1e-9, 'capped at +6 s: ' + P.frenzyT); assert.equal(P.bfChainAdd, 6); K.frenzy(); assert.equal(P.bfChainAdd, 0, 'a new frenzy resets the cap'); }
  { const { K, P } = mk(['bffuse']); assert.equal(K.fuseAt(), 67); K.frenzy(); assert.equal(P.frenzyT, 5); assert.equal(K.takeMul(), 1.1);
    P.frenzyT = 0; P.blastT = 0; P.braceT = 0; P.rage = 70; K.update(0.016, { down: true, block: true }, { stunned: false, dodging: false, attacking: false }); assert(P.frenzyT > 0, 'DOWN+C at 70 rage lights the frenzy'); }
  { const { K, P } = mk([]); P.rage = 70; K.update(0.016, { down: true, block: true }, { stunned: false, dodging: false, attacking: false }); assert.equal(P.frenzyT || 0, 0, 'flag off: 70 is not a full bar'); } });
check('L38 OVERHEAD (r40, x2.2, lean 50, x2 on a broken foe) and SIDE SWEEP (r80 ahead / 36 behind, two passes x1.0)', () => {
  { const { K, P, enemies, hurt } = mk(['bfoverhead']); const near = foe(130), far = foe(150), broken = foe(125, { broken: 1 }); enemies.push(near, far); K.kit.cleave(); K.kitStep(0.01); assert.equal(hurt.length, 1, 'only what is within 40'); assert.equal(hurt[0].d, Math.round(12 * 2.2)); assert.equal(near.poiseLeaned, 50);
    const m = mk(['bfoverhead']); m.enemies.push(broken); m.K.kit.cleave(); m.K.kitStep(0.01); assert.equal(m.hurt[0].d, Math.round(12 * 2.2 * 2)); }
  { const { K, P, enemies, hurt } = mk(['bfsweep']); const a = foe(170), behind = foe(75), boss = foe(160, { maxHp: 900 }); enemies.push(a, behind, boss); K.kit.cleave(); for (let i = 0; i < 25; i++) K.kitStep(0.01); assert.equal(hurt.filter(h => h.e === a).length, 2, 'two passes'); assert.equal(hurt.filter(h => h.e === behind).length, 2, 'cuts behind'); assert.equal(hurt.find(h => h.e === a).d, 12); assert.equal(hurt.filter(h => h.e === boss).length, 2, 'a boss takes damage (law: damage only)'); assert.equal(boss.stagger, undefined, 'and is not staggered'); } });
check('L43 AXE ARM (x1.4, flies 25% further, +12 rage on pick-up); SPLINTERING (two chips at a quarter chop each fly on from the first hit)', () => {
  { const { K, P, enemies, hurt } = mk(['bfarm']); K.throwAxe(); assert(Math.abs(P.bzAxe.vx - BZ.axe.vx * Math.sqrt(1.25)) < 1e-6); const e = foe(130); enemies.push(e); for (let i = 0; i < 30; i++) K.kitStep(0.01) && 0, K.update(0.01, {}, { stunned: false, dodging: false, attacking: false }); const h = hurt.find(x => x.kind === 'shot'); assert(h, 'the axe hit'); assert.equal(h.d, Math.round(12 * BZ.axe.dmg * 1.4)); P.bzAxe.state = 'lie'; P.bzAxe.x = P.x; P.bzAxe.y = P.y - 4; K.update(0.01, {}, { stunned: false, dodging: false, attacking: false }); assert.equal(P.bzAxe, null); assert(P.rage >= 12, 'pick-up pays: ' + P.rage); }
  { const { K, P, enemies, hurt } = mk(['bfsplinter']); K.throwAxe(); const e = foe(130); enemies.push(e); for (let i = 0; i < 12; i++) K.update(0.01, {}, { stunned: false, dodging: false, attacking: false }); assert.equal(P.bfChips.length, 2, 'two chips'); for (let i = 0; i < 20; i++) K.kitStep(0.01); const chips = hurt.filter(x => x.d === Math.max(1, Math.round(12 * 0.25))); assert(chips.length >= 1 && chips.length <= 2, 'chips hit for a quarter chop: ' + chips.length); }
  { const { K, P } = base(); K.throwAxe(); assert.equal(P.bzAxe.vx, BZ.axe.vx, 'flag off: the old speed'); } });
check('L48 THE LONG STAND (5 s, no flinch, chops x0.85) and ROARING STAND (3 s, rage x2, +25 at the end)', () => {
  { const { K, P } = mk(['bfholdstand']); const k0 = K.swingMul(); K.kit.stand(); assert.equal(P.standT, 5); assert.equal(K.armoured(), true); assert(Math.abs(K.swingMul() - k0 * 0.85) < 1e-9); P.standT = 0; assert.equal(K.armoured(), false); }
  { const { K, P } = mk(['bfroarstand']); K.kit.stand(); assert.equal(P.standT, 3); const r0 = P.rage; K.dealt(foe(110), 10, false); const x2 = P.rage - r0; P.standT = 0; P.rage = 0; K.dealt(foe(110), 10, false); assert(Math.abs(x2 - 2 * P.rage) < 1e-9, 'x2 while it holds'); P.rage = 0; P.standT = 0.01; K.update(0.02, {}, { stunned: false, dodging: false, attacking: false }); assert.equal(Math.round(P.rage), 25, 'ends with +25'); }
  { const { K, P } = base(); K.kit.stand(); assert.equal(P.standT, 4); } });
check('L50 THE RED TIDE (UP+C at a full bar: ring x1.5 within 110, small foes reel, 10 s frenzy) and THE GREAT AXE (8 s, reach x1.6, hit x1.4, pace x0.85, bar spent)', () => {
  { const { K, P, enemies, hurt } = mk(['bftide']); const s = foe(150), boss = foe(160, { maxHp: 900 }), far = foe(260); enemies.push(s, boss, far); assert.equal(K.ultReady(), false, 'not at an empty bar'); P.rage = 100; assert.equal(K.ultReady(), true); assert.equal(K.ultFire(), true);
    assert.equal(P.frenzyT, 10); assert.equal(hurt.length, 2, 'the ring reaches the two within 110, not the far one'); assert.equal(hurt[0].d, 18); assert.equal(s.stagger, 0.8); assert.equal(boss.stagger, undefined, 'a boss is not reeled'); assert.equal(K.ultReady(), false, 'not again in a frenzy'); }
  { const { K, P } = mk(['bfgreataxe']); P.rage = 100; assert.equal(K.ultReady(), true); const k0 = K.swingMul(); assert.equal(K.ultFire(), true); assert.equal(P.greatT, 8); assert.equal(P.rage, 0, 'the bar is spent'); assert.equal(K.reachK(), 1.6); assert(Math.abs(K.swingMul() - BZ.swing.base * 0.85) < 1e-9, 'the bar is spent, so no rage pace: base x0.85'); assert(Math.abs(K.chopLanded(foe(110)) - 1.4) < 1e-9); K.update(9, {}, { stunned: false, dodging: false, attacking: false }); assert.equal(K.reachK(), 1, 'it ends'); }
  { const { K, P } = mk(['bftide']); P.rage = 100; P.bzAxe = { state: 'lie' }; assert.equal(K.ultReady(), false, 'with the axe out UP+C stays the recall'); } });
check('TRAIT PAIRS: each side lands its number (rank III, no rank scaling needed: every pair opens at L20)', () => {
  const W = tal => ({ ...tal });
  { const { K, P } = mk(['bflonga'], { long: true, mist: true }); K.frenzy(); assert.equal(P.frenzyT, 13); P.frenzyT = 0.001; K.update(0.01, {}, { stunned: false, dodging: false, attacking: false }); assert.equal(P.rage, 0, 'LONG BURN leaves nothing'); }
  { const { K, P } = mk(['bflongb'], { long: true, mist: true }); K.frenzy(); assert.equal(P.frenzyT, 10); P.frenzyT = 0.001; K.update(0.01, {}, { stunned: false, dodging: false, attacking: false }); assert.equal(P.rage, 70, 'AFTERGLOW leaves 70'); }
  { const { K, P } = mk([], { long: true, mist: true }); K.frenzy(); assert.equal(P.frenzyT, 11, 'base: +3 at rank III'); P.frenzyT = 0.001; K.update(0.01, {}, { stunned: false, dodging: false, attacking: false }); assert.equal(P.rage, 40, 'base mist 40'); }
  { const a = mk(['bfbracea'], { braceLong: true }), b = mk(['bfbraceb'], { braceLong: true }), c = mk([], { braceLong: true }); a.K.raise?.(); const beat = m => { m.P.braceT = 0.3; m.P.bzTakeAt = 10 - 0.2 * 1.5; return m.K.onBeat(); };
    assert.equal(beat(a), true); assert.equal(beat(c), false, 'base beat 0.2 x 4/3 = 0.267 s: 0.3 s ago is too late'); P_ok(); function P_ok() {} const costs = []; for (const m of [b, c]) { m.api.blockCost = () => 10; m.api.pay = x => costs.push(x); m.P.braceT = 0.3; m.P.bzTakeAt = 0; m.K.takeTakes(m.P.x + 8, 20, false, null, false); } assert.equal(costs[0], 6, 'CHEAP BRACE costs 60%'); assert.equal(costs[1], 10); }
  { const { K, P, enemies } = mk(['bfbacka'], { braceBack: true }); const e = foe(110); enemies.push(e); P.braceT = 0.3; P.bzTakeAt = 10; K.takeTakes(108, 20, false, e, false); assert.equal(e.vx, 300); assert.equal(e.knock, 1.6); }
  { const { K, P, enemies, hurt } = mk(['bfbackb'], { braceBack: true }); const e = foe(110), boss = foe(110, { maxHp: 500 }); enemies.push(e, boss); P.braceT = 0.3; P.bzTakeAt = 10; K.takeTakes(108, 20, false, e, false); assert.equal(e.vx, 120, 'no throw'); assert.equal(e.knock, undefined); assert.equal(hurt.length, 1); assert.equal(hurt[0].d, 6, 'a free half chop');
    P.braceT = 0.3; P.bzTakeAt = 10; K.takeTakes(108, 20, false, boss, false); assert.equal(hurt.length, 2, 'bosses take it too (damage only)'); assert.equal(boss.vx, undefined); }
  { const a = mk(['bfhota'], { hot: true }), b = mk(['bfhotb'], { hot: true }), c = mk([], { hot: true }); for (const m of [a, b, c]) m.K.dealt(foe(110), 8, false); assert(Math.abs(a.P.rage / c.P.rage - 1.6 / (4 / 3)) < 1e-9); assert(Math.abs(b.P.rage / c.P.rage - 1.15 / (4 / 3)) < 1e-9); }
    { const { K, P } = mk(['bfscara'], { scar: true }); P.hp = 60; assert.equal(K.takeMul(), 1, 'above half: nothing'); P.hp = 49; assert.equal(K.takeMul(), 0.9); }
  { const { K, P } = mk(['bfscarb'], { scar: true }); P.hp = 30; assert.equal(K.takeMul(), 1); P.hp = 20; assert.equal(K.takeMul(), 0.72); }
  { const { K, P } = mk([], { scar: true }); P.hp = 30; assert.equal(K.takeMul(), 0.8, 'base: below a third, x0.8'); P.hp = 40; assert.equal(K.takeMul(), 1); }
  { const a = mk(['bfwidea'], { wide: true }), b = mk(['bfwideb'], { wide: true }), c = mk([], { wide: true }); assert.equal(a.K.wideR(), 16); assert.equal(a.K.wideB(1), -2); assert.equal(b.K.wideR(), 4); assert.equal(b.K.wideB(1), 22); assert.equal(b.K.wideB(2), 20); assert.equal(c.K.wideR(), 8); assert.equal(c.K.wideB(1), 10); assert.equal(c.K.wideB(2), 8); }
  { const a = mk(['bfpricea'], {}), b = mk(['bfpriceb'], { price: true }), c = mk([], { price: true }); for (const m of [a, b, c]) { m.P.frenzyT = 5; m.P.hp = 50; } a.K.dealt(foe(110), 100, false); b.K.dealt(foe(110), 100, false); c.K.dealt(foe(110), 100, false); assert.equal(a.P.hp, 56); assert.equal(b.P.hp, 53); assert.equal(c.P.hp, 55, 'base price 5%');
    b.P.hp = 50; b.K.dealt(foe(110, { hp: 0 }), 10, true); assert(b.P.hp >= 51, 'a kill heals 1.5% of max: ' + b.P.hp); assert(b.P.hp - 50 <= 3, 'law: never above 3% of max hp from one trigger'); }
  { const a = mk(['bfirona'], { ironBrace: true }), b = mk(['bfironb'], { ironBrace: true }); for (const m of [a, b]) { m.P.braceT = 0.3; m.K.takeTakes(m.P.x + 8, 40, true, null, false); } assert.equal(a.P.bzHalfK, 1.2); assert.equal(Math.ceil(40 * (1 - 0.5 * 1.2)), 16, 'DEEP BRACE: 40% of the blow'); assert.equal(b.P.bzHalfK, 1); assert.equal(b.P.rage, 20); }
  { const a = mk(['bfhafta'], { haft: true, stagger: true }), b = mk(['bfhaftb'], { haft: true }), c = mk([], { haft: true, stagger: true }); for (const m of [a, b, c]) m.K.throwAxe(); assert(Math.abs(a.P.bzAxe.vx / BZ.axe.vx - Math.sqrt(1.7)) < 1e-9); assert(Math.abs(b.P.bzAxe.vx / BZ.axe.vx - Math.sqrt(1.15)) < 1e-9); assert(Math.abs(c.P.bzAxe.vx / BZ.axe.vx - Math.sqrt(1.33)) < 1e-9);
    const hit = (m, boss) => { const e = foe(m.P.x + 20, boss ? { maxHp: 900 } : {}); m.enemies.push(e); m.K.update(0.0001, {}, { stunned: false, dodging: false, attacking: false }); m.P.bzAxe.x = e.x; m.P.bzAxe.y = e.y - 6; m.K.update(0.0001, {}, { stunned: false, dodging: false, attacking: false }); return e; };
    const ea = hit(a, false); assert.equal(ea.stagger, undefined, 'LONG HAFT does not stagger'); const eb = hit(b, false); assert.equal(eb.stagger, 0.8, 'STAGGER HAFT staggers'); }
  { const a = mk(['bfunbowa'], { unbowed: true }), b = mk(['bfunbowb'], { unbowed: true }), c = mk([], { unbowed: true }); for (const m of [a, b, c]) { m.P.hp = 5; } assert.equal(a.K.lethal(50), 4); assert(a.P.frenzyT > 0, 'GOES RED: a frenzy at once'); assert.equal(b.K.lethal(50), 0 + 5 - 8 < 0 ? 0 : 0, 'STANDS: leaves 8% (here the 5 hp are all there is)'); b.P.hp = 40; b.P.bzUnbowedUsed = false; assert.equal(b.K.lethal(50), 32, 'left on 8 of 100'); assert.equal(b.P.rage, 60); assert.equal(c.K.lethal(50), 4); assert.equal(c.P.rage, 100); assert.equal(c.P.frenzyT || 0, 0); } });

/* ---------- 4. LAW + PARITY ---------- */
check('boss law (source): every reel / push / shove in the fork code is behind smallFoe or a maxHp / mini guard; no side sets invulnerable / frozen / pinned on a foe', () => {
  const forkSrc = bzsrc.split('\n').filter(l => /bersfork|bf[a-z]+'\)/.test(l)).join('\n');
  assert(!/\.(frozen|pinned|invuln|immune|stunned)\s*=/.test(forkSrc), 'no pin / freeze / immunity on a foe');
  assert(/for \(const e of near\(p, BF\.take\.roarR\)\) if \(smallFoe\(e, api\.knockSkip\)\)/.test(bzsrc), 'BRACED ROAR is small-foe only');
  assert(/if \(smallFoe\(e, api\.knockSkip\)\) \{ e\.stagger = Math\.max\(e\.stagger \|\| 0, U\.reel\)/.test(bzsrc), 'THE RED TIDE reels small foes only');
  assert(/if \(!smallFoe\(e, api\.knockSkip\) \|\| \(e\.shoved > 0\)/.test(bzsrc), 'the barge shoves small foes only'); });
check('A/B parity hand math (dps-equivalent on one foe; sidegrades inside ~15%)', () => {
  const rows = []; const par = (n, a, b, tol = 0.15) => { rows.push(n + ' A ' + a.toFixed(2) + ' B ' + b.toFixed(2)); assert(Math.abs(a - b) / Math.max(a, b) <= tol, n + ' parity ' + a.toFixed(2) + ' vs ' + b.toFixed(2)); };
  par('SPIN total per foe', BF.spin.wide.n * BF.spin.wide.k, BF.spin.quick.n * BF.spin.quick.k, 0.001);
  par('CLEAVE per foe', BF.cleave.overMul, 2 * BF.cleave.sweepMul);
  const heavy = (q, m, tier) => { const at = [0.36, 0.86, 1.41][tier - 1], mul = [1, 1.2, 1.35][tier - 1] * m; return mul / (0.14 + at * q + 0.45); };
  for (const t of [1, 2, 3]) par('HEAVY tier ' + t + ' per second', heavy(BF.wind.deepQ, BF.wind.deepMul, t), heavy(BF.wind.shallowQ, BF.wind.shallowMul, t));
  par('CAPSTONE per second (tide: frenzy pace 1.5/1.3 + the ring x1.5 spread over 10 s | great axe: x1.4 hit at x0.85 pace; the tide takes x1.25 in its frenzy)', 1.5 / 1.3 + 1.5 / 10, 1.4 * 0.85, 0.15);
  par('AXE on a lone foe (arm x1.4 | splinter 1 + 2 x 0.25 if both chips land)', BF.axe.armMul, 1 + 2 * BF.axe.splK, 0.1);
  console.log(rows.join('\n')); });

if (bad.length) { console.error('Berserker forks FAIL:\n - ' + bad.join('\n - ')); process.exit(1); }
console.log('Berserker forks: 11 rungs + 10 trait pairs (42 side ids), every side read, flag off = base numbers, the kit drives every side through a fake api, bzHide / bzSplit retire only with the flag on, PvP EVEN off, boss-law + parity math hold.');
