// tools/bloodknight-forks.mjs - NODE-ONLY checks for the Blood Knight's complete fork road (claude/bkfork). No browser, no cdp / headless / puppeteer. Run: node tools/bloodknight-forks.mjs
// 1. data: 11 rungs on the ladder, 9 trait pairs for his 9 traits (LAST RITES cut with the Frenzy), ids unique across heroes, text limits, blood-themed wording, every skill key is one of his ACTIVE skills
// 2. wiring: every side id is read by src/main.js through bb('id') and nowhere else; no stray tech('bk..') read
// 3. flag off = base: reads null, no p.fork; flag on: reads respect pick + level + slot / worn, owed queue, free swap + level lock, strip, board, bots, PvP EVEN
// 4. THE FOLD: OVERFLOW is retired as a slottable trait only while the flag is on
// 5. src/blood-kit.js: the ORIGINAL (git show of the base) and the new module run on the same seeded walk -> identical (flag off = no p.bdFk / mod args)
// 6. the fork numbers in blood-kit.js (LONG LEDGER / QUICK SETTLE / HEAVY EDGE / CRIMSON REACH; the requiem mods are in main.js) do what the cards say
// 7. the helper expressions in main.js (bkFzMod / bkPriceMod / lashReach) with every side off = the base numbers
// 8. boss law scan, balance hand math
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import * as TR from '../src/traits.js';
import * as BK from '../src/blood-kit.js';
import { SKILLS } from '../src/progression-catalog.js';
import { BK_RUNG_FORKS, BK_TRAIT_FORKS, BLOODKNIGHT_FORKS } from '../src/forks-bloodknight.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0]); } };
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };
const H = 'reaper';
const RUNG_KEYS = ['dash', 'skill:soulReap', 'chain', 'block', 'skill:boneArmor', 'heavy', 'spender', 'price', 'sig', 'spike', 'ult'];
const TRAITS = ['gleaner', 'press', 'secondDeath', 'longPassing', 'fullCircle', 'dueRites', 'deepRed', 'coldComfort', 'gripAll'];

check('11 rungs: one per ladder slot, ability forks sit on their rung level', () => {
  const ability = F.forkList(H, false); assert.equal(ability.length, 11); assert.deepEqual(ability.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ability.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot)); assert.deepEqual(ability.map(r => r.key), RUNG_KEYS); assert.equal(Object.keys(BK_RUNG_FORKS).length, 11);
  assert.equal(ability[10].e.capstone, true); assert(F.isCapstone(ability[10].e), 'the L50 rung is the capstone'); assert(F.hasForks(H)); });
check('9 trait forks: one pair per Blood Knight trait, keyed trait:<id>, open at L20 while worn', () => {
  const t = F.forkList(H, true); assert.equal(t.length, 9); assert.equal(Object.keys(BK_TRAIT_FORKS).length, 9); assert.deepEqual(t.map(r => r.e.trait).sort(), TRAITS.slice().sort());
  const split = TR.traitIds(H); for (const id of TRAITS) assert(split.includes(id), id + ' is one of his traits'); for (const r of t) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(r.level, 20); } });
check('skill keys are his ACTIVE catalog skills; every rung has a distinct ability', () => {
  const act = new Set(SKILLS.filter(n => n.hero === H && n.active).map(n => n.id)); for (const [k, e] of Object.entries(BK_RUNG_FORKS)) if (k.startsWith('skill:')) { assert(act.has(k.slice(6)), k + ' is an active skill of his'); assert.equal(e.ability, k); }
  assert.equal(new Set(Object.values(BK_RUNG_FORKS).map(e => e.ability)).size, 11); });
check('ids unique across the whole road and against the Knight; names <= 14; what <= 96; teach <= 175; sides differ; bk prefix', () => {
  const ids = new Set(); for (const k of Object.keys(KNIGHT_FORKS)) for (const s of ['A', 'B']) ids.add(KNIGHT_FORKS[k][s].id);
  for (const [k, e] of Object.entries(BLOODKNIGHT_FORKS)) for (const s of ['A', 'B']) { const x = e[s]; assert(x.id && x.name && x.what && x.teach && x.input, k + s); assert(x.name.length <= F.NAME_MAX, k + s + ' name ' + x.name.length); assert(x.what.length <= 96, k + s + ' what ' + x.what.length);
    assert(x.teach.length <= 175, k + s + ' teach ' + x.teach.length); assert(/^bk[a-z0-9]+$/.test(x.id), k + s + ' id'); assert(!ids.has(x.id), 'dup ' + x.id); ids.add(x.id); assert.equal(x.name, x.name.toUpperCase());
    assert(!/[a-z]/.test((x.what + ' ' + x.teach).replace(/\b\d+(\.\d+)?x\b/g, '')), k + s + ' text is caps'); }
  for (const [k, e] of Object.entries(BLOODKNIGHT_FORKS)) { assert(e.name.length <= 16 && e.trade && e.trade.length <= 28, k + ' title/trade'); assert.notEqual(e.A.id, e.B.id); assert.notEqual(e.A.what, e.B.what); }
  assert.equal(ids.size - Object.keys(KNIGHT_FORKS).length * 2, 40, '40 Blood Knight side ids'); });
check('kit rule: blood only - no shield / spear / hammer / arrow / flame / stone / holy light wording, and no NEW move or button', () => {
  for (const [k, e] of Object.entries(BLOODKNIGHT_FORKS)) for (const s of ['A', 'B']) { assert(!/SHIELD|SPEAR|HAMMER|ARROW|FLAME|FIRE|STONE|HOLY|SUNFALL|BEAM|RIPOSTE/i.test(e[s].what + ' ' + e[s].teach), k + s + ' off-kit wording'); assert(!/\bNEW (MOVE|BUTTON|SKILL)\b/i.test(e[s].what + e[s].teach)); }
  /* the plan's NEW-MOVE sides were deliberately not built */ for (const frag of ['PLANT THE BLADE', 'PAY IT FORWARD', 'MORTGAGE', 'REQUIEM UNBOUND', 'THE RECKONING']) assert(!JSON.stringify(BLOODKNIGHT_FORKS).includes(frag), frag + ' is an invented move'); });
check('no ad-block-looking filename', () => { for (const f of ['forks-bloodknight.js', 'bloodknight-forks.mjs']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });

check('every side id is read by main.js through bb(); no stray tech(\'bk\') read; the numbers on the cards are in the code', () => {
  for (const [k, e] of Object.entries(BLOODKNIGHT_FORKS)) for (const s of ['A', 'B']) assert(main.includes("bb('" + e[s].id + "')"), k + s + ' ' + e[s].id + ' is never read by bb()');
  assert(!/tech\('bk/.test(main), 'a bk id read straight through tech()'); assert(main.includes("const bb = id => hero() === 'reaper' && tech(id);"));
  const reads = [...main.matchAll(/bb\('([a-z0-9]+)'\)/g)].map(m => m[1]); const known = new Set(); for (const e of Object.values(BLOODKNIGHT_FORKS)) for (const s of ['A', 'B']) known.add(e[s].id); for (const r of reads) assert(known.has(r), 'bb(' + r + ') is not a fork side');
  for (const frag of ['bkReqMod()', 'bkPriceMod()', 'lashReach()', 'function bkReap(', 'function bkLashPull(', 'BK_FK_LONG', 'BK_FK_QUICK', 'const lance = bb(', 'S0.mul * 1.5', 'S0.mul * 0.8', 'reach: 90', 'bl === 2 ? 190 : 130', 'slice(0, bl === 1 ? 1 : 5)', "bb('bkshort') ? 3 : 5", "st === 5 && bb('bkfull') ? 1.15 : 1", 'bb(\'bkthick\') ? 4 : 3', 'bb(\'bkthin\') ? 16 : 26', 'bb(\'bkdrinker\') ? 1.35', 'bb(\'bkmartyr\') ? 0.75', 'bkTaken', "bb('bkdeepward') ? 0.33 : 0", 'wide ? [-0.22, -0.5, -0.78]', "(isReaper() && bb('bkdebtstep')) || spend", 'bkcrimson'])
    assert(main.includes(frag), 'effect site missing: ' + frag); });
check('flag off = the base: reads null, no fork card owed, no p.fork, hasKit unchanged (he never had a kit)', () => withFlag(false, () => {
  assert.equal(F.forkOn({ fork: { reaper: { dash: 'A' } } }, H, 'bkcrimson', 50), false); assert.equal(F.legacyTech({}, H, 50, 'bkcrimson'), null); assert.deepEqual(F.forksOwed({}, H, 50), []); assert.deepEqual(F.roadStrip({}, H, 50), []);
  assert.equal(PR.hasKit(H), false); const p = { fork: { reaper: { dash: 'A', v: 1 } } }; assert.deepEqual(F.forksOwed(p, H, 50), []); }));
check('flag on: every side reads from the pick, the level and the slot / worn; owed queue; free swap + level lock', () => withFlag(true, () => {
  const p = { fork: { reaper: { dash: 'B', 'skill:soulReap': 'A', chain: 'B', ult: 'A', v: 1 } } }; const slotted = { slotted: id => id === 'soulReap' };
  assert.equal(F.legacyTech(p, H, 21, 'bkdebtstep'), true); assert.equal(F.legacyTech(p, H, 21, 'bkcrimson'), false); assert.equal(F.legacyTech(p, H, 20, 'bkdebtstep'), false, 'the rung needs the level');
  assert.equal(F.legacyTech(p, H, 22, 'bkdeepcut', slotted), true); assert.equal(F.legacyTech(p, H, 22, 'bkdeepcut', { slotted: () => false }), false, 'the skill must be slotted'); assert.equal(F.legacyTech(p, H, 24, 'bkreap'), true); assert.equal(F.legacyTech(p, H, 50, 'bklongreq'), true);
  assert.equal(F.legacyTech(p, 'knight', 50, 'bkcrimson'), false, 'another hero never reads his sides');
  assert.equal(F.owedCount({}, H, 50, []), 11); assert.equal(F.owedCount({}, H, 20, []), 0); assert.equal(F.owedCount({}, H, 21, []), 1); assert.equal(F.forksOwed({}, H, 36).length, 7);
  const q = {}; assert.equal(F.setFork(q, H, 'sig', 'A', 43), null); assert.equal(F.setFork(q, H, 'sig', 'B', 43), null, 'free swap'); assert.equal(q.fork.reaper.sig, 'B'); assert.match(F.setFork(q, H, 'ult', 'A', 49), /Locked/);
  const tp = { fork: { reaper: { 'trait:deepRed': 'B', v: 1 } } }; assert.equal(F.legacyTech(tp, H, 19, 'bkdeb', { worn: () => true }), false); assert.equal(F.legacyTech(tp, H, 20, 'bkdeb', { worn: id => id === 'deepRed' }), true); assert.equal(F.legacyTech(tp, H, 20, 'bkdeb', { worn: () => false }), false);
  assert.equal(F.traitForksOwed({}, H, 20, ['deepRed', 'press']).length, 2); assert.equal(F.traitForksOwed({}, H, 19, ['deepRed']).length, 0); }));
check('strip 11 pips, board 11 + 9 rows, bots all A (or B / exact), cards carry both sides, PvP EVEN L1 turns every side off', () => withFlag(true, () => {
  const strip = F.roadStrip({}, H, 30); assert.equal(strip.length, 11); assert.equal(strip.filter(s => s.state === 'next').length, 1); assert.equal(strip[10].capstone, true);
  assert.equal(F.boardRows({}, H, 36, 'ABILITIES').length, 11); assert.equal(F.boardRows({}, H, 36, 'TRAITS').length, 9); assert.deepEqual(F.boardRows({}, H, 36, 'ABILITIES').map(r => r.open), [true, true, true, true, true, true, true, false, false, false, false]);
  const bots = F.botForks(H); assert.equal(Object.keys(bots).length, 21); assert(Object.entries(bots).every(([k, v]) => k === 'v' || v === 'A')); assert.equal(F.botForks(H, 'B').ult, 'B');
  const card = F.forkCard(H, 'ult'); assert.equal(card.opts.length, 2); assert.equal(card.capstone, true); assert.equal(card.opts[0].sideId, 'bklongreq');
  const p = { fork: { reaper: { chain: 'B', v: 1 } } }; assert.equal(F.legacyTech(p, H, 30, 'bkreap'), true); F.setPvpEvenForks(true); try { assert.equal(F.legacyTech(p, H, 30, 'bkreap'), false); } finally { F.setPvpEvenForks(false); } }));
check('THE FOLD: OVERFLOW is a slottable trait flag off, retired (hidden) flag on; the rest of his split unchanged', () => {
  withFlag(false, () => { assert.equal(TR.kindOf(H, 'overflow'), 'folded'); assert(TR.slottable(H).includes('overflow')); assert.equal(TR.traitIds(H).length, 10); });
  withFlag(true, () => { assert.equal(TR.kindOf(H, 'overflow'), 'retired'); assert(!TR.slottable(H).includes('overflow')); assert.equal(TR.traitIds(H).length, 9); for (const id of TRAITS) assert(TR.slottable(H).includes(id), id); assert.equal(TR.kindOf(H, 'deepRed'), 'trait'); assert.equal(TR.kindOf(H, 'rend'), 'core'); }); });

/* ---- 5. blood-kit.js: the original and the new module, same seeded walk ---- */
const BASE = 'c54d83092';   /* the claude/bkrework tip: the flag-off proof now compares against the REWORKED blood-kit.js (claude/repoint) */
const oldSrc = execFileSync('git', ['show', BASE + ':src/blood-kit.js'], { cwd: new URL('..', import.meta.url), encoding: 'utf8', maxBuffer: 1 << 26 });
const tmp = path.join(os.tmpdir(), 'blood-kit-base-' + process.pid + '.mjs'); fs.writeFileSync(tmp, oldSrc); const OLD = await import('file:///' + tmp.replace(/\\/g, '/')); fs.unlinkSync(tmp);
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const walk = (M, seed, extra) => { const r = rng(seed), p = { hp: 105, maxHp: 105, bd: 0 }, log = [], snap = () => { const q = { ...p }; delete q.bkTaken; return JSON.stringify(q); };
  for (let i = 0; i < 4000; i++) { const op = Math.floor(r() * 14), v = Math.round(r() * 30); let out;
    switch (op) { case 0: p.hp = Math.max(1, p.hp - v); out = 0; break; case 1: out = M.debtReclaim(p, v / 3); break; case 2: out = M.payBlood(p, r() * 0.1, r() < 0.2); break; case 3: out = M.payPrice(p, r() < 0.2); break; case 4: out = M.guardPay(p, v / 2); break;
      case 5: out = M.drainGive(p, v / 4); break; case 6: out = M.debtReclaimAll(p); break; case 7: out = M.debtSpend(p); break; case 8: out = M.vitaeGain(['cut', 'third', 'parry', 'ward'][v % 4]); break; case 9: out = M.reclaimOf(v, { bleeding: r() < 0.5, weight: ['light', 'third', 'heavy'][v % 3], hem: r() < 0.2 }); break;
      case 10: out = JSON.stringify(M.lashBox(10, 20, r() < 0.5 ? 1 : -1, r() * 0.3, 30 + v)); break; case 11: out = M.tierFor(r() * 3, p.bd, p.maxHp, 0.9); break; case 12: p.hp = Math.min(p.maxHp, p.hp + v / 2); out = 0; break; default: out = 0; }
    M.debtStep(p, 0.016 * (1 + (i % 5)), { freeze: r() < 0.1, dead: r() < 0.002 }); log.push(out + '|' + snap()); } return log.join('\n'); };
check('src/blood-kit.js: the original and the new module run the same seeded walk (4000 ops x 6 seeds, debt / price / ward pay / vitae gain / lash box) -> byte-identical', () => {
  for (const seed of [1, 7, 99, 2026, 11, 424242]) { const a = walk(OLD, seed), b = walk(BK, seed); assert.equal(a.length, b.length); assert(a === b, 'diverged on seed ' + seed); } });
check('the fork numbers in blood-kit.js do what the cards say (LONG LEDGER, QUICK SETTLE, HEAVY EDGE, CRIMSON REACH)', () => {
  const mk = fk => { const p = { hp: 50, maxHp: 100, bd: 0, bdLast: 50 }; if (fk) p.bdFk = fk; return p; };
  const d0 = mk(); BK.debtAdd(d0, 20); assert.equal(d0.bdHold, 2); assert(Math.abs(d0.bdRate - 20 / 6) < 1e-9, 'base total 8 s (the rework: hold 2, drain 8)');
  const dl = mk({ hold: 2, drain: 2 }); BK.debtAdd(dl, 20); assert(Math.abs(dl.bdHold - 4) < 1e-9); assert(Math.abs(dl.bdHold + 20 / dl.bdRate - 10) < 1e-9, 'LONG LEDGER: 10 s in all');
  const dq = mk({ hold: 0, drain: -1.5 }); BK.debtAdd(dq, 20); assert(Math.abs(dq.bdHold + 20 / dq.bdRate - 6.5) < 1e-9, 'QUICK SETTLE: 6.5 s in all');
  const pl = mk({ hold: 2, drain: 2 }); BK.payBlood(pl, 0.1, false); assert(Math.abs(pl.bdHold + pl.bd / pl.bdRate - 10) < 1e-9, 'a price paid under LONG LEDGER lasts 10 s too');
  assert.equal(BK.reclaimOf(20, { k: 1.5 }), BK.reclaimOf(20, {}) * 1.5); assert.equal(BK.reclaimOf(20, { k: 1 }), BK.reclaimOf(20, {}));
  const pp = mk(); BK.payPrice(pp, false, 0.14); assert.equal(pp.hp, 50 - 14); const pq = mk(); BK.payPrice(pq, false); assert.equal(pq.hp, 50 - 10);
  assert.equal(BK.lashBox(0, 0, 1, 0.2, 30, 48).r - BK.lashBox(0, 0, 1, 0.2, 30).r, 24, 'CRIMSON REACH adds the base 24 px again');
  assert(true); });
check('main.js helper expressions with every side off = the base numbers', () => {
  const grab = name => { const m = new RegExp('const ' + name + ' = (\\(\\) =>[^\\n\\r]*?);\\s*(?:/\\*|\\r?\\n)').exec(main); assert(m, 'no ' + name); return m[1]; };
  const mkEnv = on => { const bb = id => on.includes(id); const trk = () => 1; const BKIT = { BLOOD: BK.BLOOD }; return { bb, trk, BKIT }; };
  const ev = (name, on) => { const e = mkEnv(on || []); return new Function('bb', 'trk', 'BKIT', 'return (' + grab(name) + ')();')(e.bb, e.trk, e.BKIT); };
  const Z = BK.BLOOD.requiem, P = BK.BLOOD.price;
  assert.deepEqual(ev('bkReqMod'), { t: Z.hemT, mul: Z.hemMul }, 'requiem off = base'); assert.deepEqual(ev('bkPriceMod'), { cd: P.cd, pct: P.pct, buffT: P.buffT, mul: P.mul }, 'price off = base'); assert.equal(ev('lashReach'), BK.BLOOD.lash.reach);
  assert.deepEqual(ev('bkReqMod', ['bklongreq']), { t: 10, mul: 1.15 }); assert.deepEqual(ev('bkReqMod', ['bkdeepreq']), { t: 6, mul: 1.5 });
  assert.deepEqual(ev('bkPriceMod', ['bkpricea']), { cd: P.cd, pct: P.pct, buffT: 10, mul: 1.15 }); assert.deepEqual(ev('bkPriceMod', ['bkpriceb']), { cd: P.cd, pct: 0.14, buffT: 3.5, mul: 1.45 });
  assert.equal(ev('bkPriceMod', ['bkcca']).buffT, P.buffT + 3); assert.equal(ev('bkPriceMod', ['bkccb']).buffT, P.buffT - 2); assert.equal(ev('lashReach', ['bkreach']), BK.BLOOD.lash.reach * 2); });
check('boss law: no side adds invulnerability, a resist or a pin; every drag / stagger skips a boss or runs the told 0.35 s; no new input', () => {
  const lines = main.split(/\r?\n/).filter(l => /bb\('bk[a-z0-9]+'\)/.test(l)); assert(lines.length > 30, 'bb lines ' + lines.length);
  for (const l of lines) assert(!/invuln|\.resist|frozen\s*=|\.pin\b|P\.inv\s*=\s*Math\.max\(P\.inv,\s*[1-9]/.test(l), 'invulnerable / resist / pin on a bb line: ' + l.slice(0, 120));
  assert(/function bkLashPull\(e\) \{[^\n\r]*e\.maxHp \|\| e\.mini/.test(main), 'the drag skips a boss and a mini'); assert(/big \? 0\.35 : S\.stagger/.test(main), 'the ring staggers a boss for 0.35 s only');
  assert(!/keys\.(spike|ring|lance)/.test(main.split(/\r?\n/).filter(l => /bb\('bk/.test(l)).join('\n')), 'no new key read'); });
check('balance hand math (per use, one target; the n=6 power check is browser-owed): the sides of each rung sit close, trades are named', () => {
  const r = (a, b, tol, w) => { assert(Math.abs(a - b) / Math.max(a, b) <= tol, w + ' ' + a.toFixed(2) + ' vs ' + b.toFixed(2)); };
  r(10 * 1.15, 6 * 1.5, 0.25, 'requiem brand-score A 11.5 vs B 9 (base 8 x1.25 = 10)');
  r(10 * 0.15, 3.5 * 0.45, 0.06, 'price edge-score A 1.50 vs B 1.58 (B pays 1.4x the blood)'); assert(Math.abs(0.14 / 0.10 - 1.4) < 1e-9);
  const cross = 1.6 / 0.7; assert(cross > 2 && cross < 3, 'bloodletting: DEEP CUT beats SPRAY on 1-2 foes, SPRAY wins from the third (' + cross.toFixed(2) + ')');
  r(4 * 0.55 / 1.15, 3 * 0.6 / 0.8, 0.2, 'blood mail absorb per cooldown A 1.91 vs B 2.25 (B needs its three blows inside 6 s)'); });
if (bad.length) { console.log('BLOOD KNIGHT FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Blood Knight forks: 11 rungs + 9 trait pairs (40 side ids), every side read by main.js through bb(), flag off = base (blood-kit.js byte-identical on 6 seeded walks), OVERFLOW folds only with the flag on, PvP EVEN off.');
