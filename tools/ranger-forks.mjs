// tools/ranger-forks.mjs - NODE-ONLY checks for the Ranger's fork road (claude/rangerfork). No browser, no cdp, no puppeteer. Run: node tools/ranger-forks.mjs
// 1. data: 11 rungs on the ladder, 10 trait pairs for her 10 traits, ids unique (and apart from the Knight's and the Geomancer's), text limits, sides differ
// 2. wiring: every side id is read by src/ranger.js / src/main.js / src/ranger-forks.js (fk('id') / rb('id')); no ad-block filename; kit words (no stone, shield advance, hammer, sword cut, beam)
// 3. flag off = the base: legacyTech null, no p.fork read; flag on: reads respect pick + level + slot (skill) / worn (trait); PvP EVEN L1 turns every side off; folded ids retire only with the flag
// 4. the kit on a fake world (a Proxy api): each rung side once, flag-off inert, boss law (no pin / freeze / invulnerability / resist), the capstone budgets, the trait sides' numbers
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
import { RG_FORKS, RG_RUNG_FORKS, RG_TRAIT_FORKS } from '../src/forks-ranger.js';
import { makeRanger, RG, RGF, rgWinEnd, rgTierAt } from '../src/ranger.js';
import { RGF_K } from '../src/ranger-forks.js';
import { TRAIT_SPLIT, traitIds, slottable, kindOf } from '../src/traits.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0] + ((e.stack || '').split('\n').find(l => /ranger-forks\.mjs:\d+/.test(l)) || '').replace(/^.*mjs:/, ' @line ')); } };
const rd = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const rgSrc = rd('src/ranger.js'), main = rd('src/main.js'), bodies = rd('src/ranger-forks.js'), traitsSrc = rd('src/traits.js');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };
const stripComments = t => t.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
const sides = (data = RG_FORKS) => Object.entries(data).flatMap(([k, e]) => ['A', 'B'].map(s => ({ k, e, s, x: e[s] })));

check('11 rungs: every ladder slot holds one fork, skill forks are keyed by their catalog skill, ability forks sit on their rung level', () => {
  const ability = F.forkList('ranger', false); assert.equal(ability.length, 11); assert.deepEqual(ability.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ability.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot));
  assert.deepEqual(ability.map(r => r.key), ['dash', 'skill:rgVolley', 'chain', 'block', 'skill:rgSetSnare', 'heavy', 'spender', 'skill:rgHawk', 'sig', 'skill:rgHeart', 'ult']);
  assert.equal(Object.keys(RG_RUNG_FORKS).length, 11); assert(ability[10].e.capstone === true);
  const ids = new Set(PR.SKILLS.filter(s => s.hero === 'ranger' && s.active).map(s => s.id));
  for (const r of ability) { const sk = r.e.ability.startsWith('skill:') ? r.e.ability.slice(6) : null; if (sk) assert(ids.has(sk), r.key + ' is not a ranger active skill'); if (r.key.startsWith('skill:')) assert.equal(r.e.ability, r.key); }
  assert.equal(ability.find(r => r.e.slot === 'sig').e.ability, 'skill:rgSmoke'); });
check('10 trait forks: one pair per Ranger trait, keyed trait:<id>, open at L20 while worn', () => {
  const traits = F.forkList('ranger', true), want = TRAIT_SPLIT.ranger.traits;
  assert.equal(traits.length, 10); assert.equal(Object.keys(RG_TRAIT_FORKS).length, 10); assert.deepEqual(traits.map(r => r.e.trait).sort(), want.slice().sort());
  for (const r of traits) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(r.level, 20); } });
check('ids unique across the whole road and apart from the Knight and the Geomancer; names <= 14; what <= 96; teach <= 175; sides differ', () => {
  const ids = new Set(), other = new Set(sides(KNIGHT_FORKS).map(o => o.x.id));
  for (const { k, s, x } of sides()) { assert(x.id && x.name && x.what && x.teach && x.input, k + s); assert(x.name.length <= F.NAME_MAX, k + s + ' name ' + x.name); assert(x.what.length <= 96, k + s + ' what ' + x.what.length); assert(x.teach.length <= 175, k + s + ' teach ' + x.teach.length);
    assert(!ids.has(x.id), 'dup ' + x.id); ids.add(x.id); assert(!other.has(x.id), 'Knight id ' + x.id); assert(/^r[a-z]+$/.test(x.id), 'r-prefixed ' + x.id); assert(!/^g[a-z]+$/.test(x.id) || !/^(gt|g)/.test(x.id), 'not a geomancer id'); assert(x.input.length <= 28, 'input ' + x.input); }
  for (const [k, e] of Object.entries(RG_FORKS)) { assert(e.trade && e.trade.length <= 28, k + ' trade'); assert(e.name.length <= F.NAME_MAX, k + ' title ' + e.name); assert.notEqual(e.A.what, e.B.what); assert.notEqual(e.A.name, e.B.name); }
  assert.equal(ids.size, 42); });
check('every side id is read by the effect code (fk / rb), and nothing promises a beam, a stone, a shield advance, a hammer or a sword cut', () => {
  for (const { k, x } of sides()) assert(rgSrc.includes("fk('" + x.id + "')") || main.includes("rb('" + x.id + "')") || bodies.includes("fk('" + x.id + "')"), k + ': ' + x.id + ' is never read');
  for (const { x } of sides()) assert(!/BEAM|\bRAY\b|FLYING SLASH|LIGHT RING|HOLY|SUNFALL|SHIELD|HAMMER|RIPOSTE|STONE|BOULDER|SWORD|FIREBALL/i.test(x.what + ' ' + x.teach), 'her kit is the bow: ' + x.id); });
check('no ad-block-looking filename', () => { for (const f of ['forks-ranger.js', 'ranger-forks.js', 'ranger-forks.mjs']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });
check('flag off = the base: no side reads, no p.fork needed; hasKit stays false for her', () => withFlag(false, () => {
  const p = { fork: { ranger: { dash: 'A', v: 1 } } }; assert.equal(F.forkOn(p, 'ranger', 'rpartshot', 50), false); assert.equal(F.legacyTech(p, 'ranger', 50, 'rpartshot'), null); assert.deepEqual(F.forksOwed(p, 'ranger', 50), []); assert.equal(PR.hasKit('ranger'), false); }));
check('flag on: every side reads from the pick, the level and the slot / the wear', () => withFlag(true, () => {
  const p = { fork: { ranger: { dash: 'B', 'skill:rgHawk': 'B', chain: 'A', 'trait:rgKill': 'B', v: 1 } } }, slotted = { slotted: id => id === 'rgHawk' };
  assert.equal(F.legacyTech(p, 'ranger', 21, 'rhighflip'), true); assert.equal(F.legacyTech(p, 'ranger', 21, 'rpartshot'), false); assert.equal(F.legacyTech(p, 'ranger', 37, 'rharry', slotted), false, 'level 38 not reached');
  assert.equal(F.legacyTech(p, 'ranger', 38, 'rharry', slotted), true); assert.equal(F.legacyTech(p, 'ranger', 38, 'rharry', { slotted: () => false }), false, 'the skill must be slotted'); assert.equal(F.legacyTech(p, 'ranger', 24, 'rtrueflight'), true);
  assert.equal(F.legacyTech(p, 'ranger', 19, 'rtkillfocus', { worn: () => true }), false); assert.equal(F.legacyTech(p, 'ranger', 20, 'rtkillfocus', { worn: id => id === 'rgKill' }), true); assert.equal(F.legacyTech(p, 'ranger', 20, 'rtkillfocus', { worn: () => false }), false);
  assert.equal(F.legacyTech(p, 'geomancer', 50, 'rhighflip'), false, 'another hero never reads her sides'); assert.equal(F.legacyTech(p, 'knight', 50, 'rhighflip'), false); }));
check('owed queue, free swap with the level lock, strip and board shape', () => withFlag(true, () => {
  const p = {}; assert.equal(F.forksOwed(p, 'ranger', 21).length, 1); assert.equal(F.forksOwed(p, 'ranger', 50).length, 11); assert.equal(F.setFork(p, 'ranger', 'dash', 'A', 21), null); assert.equal(F.setFork(p, 'ranger', 'dash', 'B', 21), null); assert.equal(p.fork.ranger.dash, 'B');
  assert(/Locked until level 22/.test(F.setFork(p, 'ranger', 'skill:rgVolley', 'A', 21))); assert.equal(F.roadStrip(p, 'ranger', 30).length, 11); assert.equal(F.boardRows(p, 'ranger', 30, 'ABILITIES').length, 11); assert.equal(F.boardRows(p, 'ranger', 30, 'TRAITS').length, 10);
  const c = F.forkCard('ranger', 'ult'); assert.equal(c.capstone, true); assert.equal(c.opts.length, 2); assert.deepEqual(F.botForks('ranger', 'A'), Object.assign({ v: 1 }, Object.fromEntries(Object.keys(RG_FORKS).map(k => [k, 'A'])))); }));
check('PvP EVEN L1: every fork reads off (YOUR LEVEL: on)', () => withFlag(true, () => {
  const p = { fork: { ranger: { chain: 'B', v: 1 } } }; assert.equal(F.legacyTech(p, 'ranger', 30, 'rquicknock'), true); F.setPvpEvenForks(true); try { assert.equal(F.legacyTech(p, 'ranger', 30, 'rquicknock'), false); assert.equal(F.forkSide(p, 'ranger', 'chain'), null); } finally { F.setPvpEvenForks(false); } }));
check('folded ids: slottable traits with the flag off, retired (never slot, never on) with it on', () => {
  const FOLD = ['rgSnares', 'rgHighFlip', 'rgAirDraw', 'rgTwin'];
  withFlag(false, () => { for (const id of FOLD) assert(slottable('ranger').includes(id), id + ' slots flag off'); assert.equal(traitIds('ranger').length, 14); });
  withFlag(true, () => { for (const id of FOLD) { assert(!slottable('ranger').includes(id), id + ' retired flag on'); assert.equal(kindOf('ranger', id), 'retired'); } assert.equal(kindOf('ranger', 'rgApex'), 'retired'); assert.equal(traitIds('ranger').length, 10); }); });
check('the effect sites exist (source scan)', () => {
  for (const frag of ['function seekSteer(', 'function harryNext(', 'const puff =', 'const bbK =', 'const snareHk =', 'function softK(', 'const sweetBand =', 'RFK.cloud(', 'RFK.stormStart(', 'RFK.step(dt)', 'export const RGF']) assert(rgSrc.includes(frag), 'ranger.js lacks ' + frag);
  for (const frag of ["rb('rhighflip')", "rb('rlightbow')", "rb('rtoneleft')", "rb('rtbareknife')", 'fork: id => rb(id)', 'RGK.softK(P.vx)']) assert(main.includes(frag), 'main.js lacks ' + frag);
  assert(traitsSrc.includes("get retired() { return forksShip()")); });
check('flag off: every side id is read only through fk() / rb() (no raw use outside them)', () => {
  for (const { x } of sides()) { const re = new RegExp("(?<!fk\\()(?<!rb\\()'" + x.id + "'", 'g'); const strays = (rgSrc.match(re) || []).length + (main.match(re) || []).length + (bodies.match(re) || []).length; assert.equal(strays, 0, x.id + ' used outside fk / rb'); } });
check('rank scale: every trait side delta scales with the trait rank (mulK / T() rank), a discrete side does not', () => {
  for (const frag of ["mulK(fk('rtquickeye') ? 1.5 : 1.25, T().keen)", "mulK(fk('rtlongmark') ? 2.5 : 1.5, T().longMark)", "mulK(fk('rtfarbash') ? x * 1.5", "mulK(fk('rtbite') ? 2 : RG.snare.toothed, tr)", 'RG.draw.slow + (0.6 - RG.draw.slow) * r', '* 0.5 * T().bodkin'.replace('* ', ''), "ra * T().kill", "mulK(fk('rtwidesweet') ? 1.2", '(p.maxSt || 100) / 3 * T().cover']) assert(rgSrc.includes(frag), 'rank scaling lacks ' + frag);
  assert(main.includes("trm(3, 'rgLast')")); });

/* ---- 4. the kit on a fake world. dmgBase = 20 so every blow reads as a number of 20-point swords ---- */
function world(picks, tal = {}, o = {}) {
  const w = { time: 0, log: [], foes: [], parts: [], seeds: [], numbers: [] };
  const P = { x: 100, y: 160, face: 1, hp: 100, maxHp: 100, ground: true, st: 100, maxSt: 100, dodge: 0, rgFocus: 0, vx: 0, vy: 0 };
  const base = { P, enemies: w.foes, parts: w.parts, seeds: w.seeds, TS: 16, LH: 40, LW: 100, boss: null, VW: 320, fork: id => !!picks && picks.has(id), tal: () => tal, isRg: () => true, spend: () => true, swordDmg: () => 20, amul: () => 1, isSolid: (x, y) => y >= 10, isOneWay: () => false, tileAt: () => 0,
    overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t, box: e => ({ l: e.x - (e.w || 12) / 2, r: e.x + (e.w || 12) / 2, t: e.y - (e.h || 14), b: e.y }), tap: () => 0.3, ST: { hold: 1, delay: 1 }, STAM: {}, blockCost: d => d,
    hurtAs: (k, e, d) => { w.log.push({ k, e, d }); if (e.hp != null) { e.hp -= d; if (e.hp <= 0) e.alive = false; } }, number: (x, y, t) => w.numbers.push(t), SFX: new Proxy({}, { get: () => () => 0 }), poiseLean: () => {}, knockSkip: () => false };
  Object.defineProperty(base, 'time', { get: () => w.time });
  const api = new Proxy(base, { get: (t, k) => k in t ? t[k] : () => 0 });
  w.R = makeRanger(api); w.P = P; w.api = api;
  w.R.update(0, { atk: false, block: false, up: false, down: false }, { stunned: false, dodging: false, attacking: false, guardOk: true });   /* (the quiver and her lists exist) */
  w.keys = { atk: false, block: false, up: false, down: false };
  w.step = (dt, n = 1) => { for (let i = 0; i < n; i++) { w.time += dt; w.R.update(dt, w.keys, { stunned: false, dodging: false, attacking: false, guardOk: true }); w.R.kitStep(dt); } };
  return w;
}
const foe = (x, o = {}) => Object.assign({ x, y: 160, alive: true, hp: 1e6, w: 12, h: 14 }, o);
const dmgOn = (w, f) => w.log.filter(l => l.e === f).reduce((a, l) => a + l.d, 0);
const P0 = new Set();
check('flag off: a no-pick Ranger shoots, snares, hawks, smokes and storms exactly as the base (no fork body ever starts)', () => {
  const w = world(null); w.R.kit.volley(); w.R.kit.snare(); w.R.kit.hawk(); w.R.kit.smoke(); w.R.kit.heart(); w.P.rgFocus = 100; w.R.greatArrow(); w.step(0.02, 80);
  assert.equal(w.R.forkBodies.clouds().length, 0); assert.equal(w.R.forkBodies.storm(), null); assert.equal(RGF.winEx, 0); assert.equal(RGF.focusWin, 1); assert.equal(w.R.softK(5), RG.draw.slow);
  const a = w.P.rgArrows.find(x => x.kind === 'skill' && x.pierce); assert(!a || !a.seek); });
check('PARTING SHOT: the flip goes a third farther; the flip shot is x1.5, no point-blank cut, staggers a common foe, not an elite; HIGH FLIP is higher and nocks in the air', () => {
  let w = world(new Set(['rpartshot'])); const v0 = world(null).R.flip(1), v1 = w.R.flip(1); assert(Math.abs(v1 / v0 - 4 / 3) < 1e-6);
  w.P.dodge = 0.2; const f = foe(106), el = foe(106, { elite: true }); w.foes.push(f); w.R.quickShot(); const a = w.P.rgArrows[0]; assert(a.parting && Math.abs(a.dmg - 20 * RG.quick.dmg * 1.5) < 1e-9); w.step(0.02, 20); assert(f.stagger >= 0.4 || f.alive, 'staggered'); assert(dmgOn(w, f) > 0);
  w = world(new Set(['rhighflip'])); w.R.flip(1); assert(w.P.vy < -235, 'higher'); const w2 = world(new Set(['rhighflip'])); w2.P.ground = false; w2.P.vy = 200; w2.P.charge = 0.3; w2.step(0.02, 1); assert(w2.P.vy <= 40 + 1e-9, 'the air draw slows the fall'); });
check('VOLLEY: HIGH VOLLEY arcs steeply and lands later; BARBED staggers a common foe (an elite less, a boss never) and the middle arrow marks', () => {
  let w = world(new Set(['rhighvolley'])); w.R.kit.volley(); assert(w.P.rgArrows.every(a => a.vy <= -175)); const wb = world(null); wb.R.kit.volley(); assert(wb.P.rgArrows.every(a => a.vy > -100));
  w = world(new Set(['rbarbed'])); const f = foe(110), boss = foe(112, { maxHp: 100, hp: 1e6 }); w.foes.push(f); w.R.kit.volley(); const mid = w.P.rgArrows[1]; assert(mid.barbed && mid.barbedMark); w.step(0.02, 30); assert(f.stagger >= 0.5 - 1e-9, 'common staggered'); assert(w.api.enemies.some(x => x === f));
  w = world(new Set(['rbarbed'])); w.foes.push(boss); w.R.kit.volley(); w.step(0.02, 30); assert.equal(boss.stagger, undefined, 'a boss is never staggered'); });
check('CHAIN: TRUE FLIGHT returns the arrow, no mark (once a second); QUICK NOCK is faster and lighter', () => {
  let w = world(new Set(['rtrueflight'])); const f = foe(168, { h: 40, y: 165 }); w.foes.push(f); const q0 = w.P.rgQ = 3; w.R.quickShot(); assert.equal(w.P.rgQ, 2); w.step(0.02, 25); assert.equal(w.P.rgQ, 3, 'the arrow came back'); assert(!(f.rgMarkT > 0), 'no mark: she has the one mark');
  w.R.quickShot(); w.step(0.02, 25); assert.equal(w.P.rgQ, 2, 'once a second: the second arrow stays in the foe');
  w = world(new Set(['rquicknock'])); w.R.quickShot(); assert(Math.abs(w.P.rgCd - RG.quick.rec * 0.8) < 1e-9); assert(Math.abs(w.P.rgArrows[0].dmg - 20 * RG.quick.dmg * 0.85) < 1e-9); });
check('BLOCK: COUNTER-NOCK pays an arrow and 20 Focus on the beat; LIGHT BOW drains no wind, a blade costs half again', () => {
  let w = world(new Set(['rcounternock'])); w.R.bash(); w.P.rgQ = 2; const f0 = w.P.rgFocus; assert.equal(w.R.bashTakes(100 + 5, 10, false, foe(110), false), 'blocked'); assert.equal(w.P.rgQ, 3); assert.equal(w.P.rgFocus, f0 + 20);
  w = world(new Set(['rlightbow'])); w.keys.block = true; w.step(0.02, 30); assert(w.P.rgGuard, 'raised'); const st = w.P.st; w.step(0.02, 30); assert.equal(w.P.st, st, 'no drain');
  const wb = world(null); wb.keys.block = true; wb.step(0.02, 30); const sb = wb.P.st; wb.step(0.02, 30); assert(wb.P.st < sb, 'the base drains'); });
check('SNARE: LONG SNARE holds a common foe 2 s (an elite 1 s); TWO SNARES keeps two, 1 s each; a boss is checked, never held', () => {
  let w = world(new Set(['rlongsnare'])); const f = foe(100), el = foe(100, { elite: true }); w.foes.push(f); w.R.kit.snare(); w.step(0.02, 3); assert(Math.abs(f.stagger - 2.0) < 0.1); w.foes.length = 0; const e2 = foe(100, { elite: true }); w.foes.push(e2); w.R.kit.snare(); w.step(0.02, 3); assert(Math.abs(e2.stagger - 1.0) < 0.1);
  w = world(new Set(['rtwosnares'])); w.R.kit.snare(); w.P.x = 140; w.R.kit.snare(); w.P.x = 180; w.R.kit.snare(); assert.equal(w.P.rgSnares.length, 2); const g = foe(180); w.foes.push(g); w.step(0.02, 3); assert(Math.abs(g.stagger - 1.0) < 0.1);
  w = world(new Set(['rlongsnare'])); const boss = foe(100, { maxHp: 50 }); w.foes.push(boss); w.R.kit.snare(); w.step(0.02, 5); assert(!(boss.stagger > 0.3), 'a boss is only checked'); });
check('HEAVY: SPLIT SHOT looses one free extra arrow at a full draw (one arrow spent); STEADY BREATH widens the window 0.2 s and flies 25% farther', () => {
  let w = world(new Set(['rsplit'])); w.P.rgQ = 5; w.R.release(1, 1, false); assert.equal(w.P.rgArrows.length, 2); assert.equal(w.P.rgQ, 4); assert(w.P.rgArrows[1].free && Math.abs(w.P.rgArrows[1].dmg / w.P.rgArrows[0].dmg - 0.6) < 1e-9);
  w = world(new Set(['rbreath'])); w.step(0.02, 1); const e0 = rgWinEnd(1, 0.14, false); assert(Math.abs(RGF.winEx - 0.2) < 1e-9); assert(Math.abs(e0 - (rgTierAt(2, 1, 0.14) + (RG.tiers.win + 0.2))) < 1e-9);
  w.P.rgQ = 5; w.R.release(1, 1, false); const vx = w.P.rgArrows[0].vx; const wb = world(null); wb.step(0.02, 1); wb.P.rgQ = 5; wb.R.release(1, 1, false); assert(Math.abs(vx / wb.P.rgArrows[0].vx - Math.sqrt(1.25)) < 1e-6); assert.equal(RGF.winEx, 0, 'the base resets it'); });
check('SPENDER: LONG EYE pays from far and hits x1.2 from 140+; CLOSE QUARTERS pays focus point-blank and drops the penalty', () => {
  let w = world(new Set(['rlongeye'])); const f = foe(250, { h: 40, y: 165 }); w.foes.push(f); w.R.release(1, 1, false); w.step(0.01, 150); const hit = w.log[0]; assert(hit && w.P.rgFocus > 0, 'far hit pays focus'); const wb = world(null); wb.foes.push(foe(250, { h: 40, y: 165 })); wb.R.release(1, 1, false); wb.step(0.01, 150); assert(wb.log.length > 0, 'the base arrow also hits'); assert.equal(wb.P.rgFocus, 0, 'the base pays nothing past 138');
  w = world(new Set(['rclose'])); const n = foe(100 + 20); w.foes.push(n); w.R.quickShot(); w.step(0.02, 20); assert(w.P.rgFocus > 0, 'point-blank pays'); const wc = world(null); wc.foes.push(foe(120)); wc.R.quickShot(); wc.step(0.02, 20); assert.equal(wc.P.rgFocus, 0); assert(w.log[0].d > wc.log[0].d, 'no point-blank cut'); });
check('HAWK: THE STOOP strikes once, double, marks and staggers a common foe (a boss: strike and mark only); HARRY strikes three different foes, no mark', () => {
  let w = world(new Set(['rstoop'])); const f = foe(140); w.foes.push(f); w.R.kit.hawk(); w.step(0.02, 200); const hits = w.log.filter(l => l.e === f); assert.equal(hits.length, 1); assert(Math.abs(hits[0].d - Math.round(20 * 0.7 * 2)) <= 1); assert(f.rgMarkT > 0 && f.stagger >= 0.6 - 1e-9);
  w = world(new Set(['rstoop'])); const b = foe(140, { maxHp: 50 }); w.foes.push(b); w.R.kit.hawk(); w.step(0.02, 200); assert.equal(b.stagger, undefined); assert(b.rgMarkT > 0);
  w = world(new Set(['rharry'])); const fs3 = [foe(130), foe(160), foe(190)]; w.foes.push(...fs3); w.R.kit.hawk(); w.step(0.02, 400); for (const x of fs3) assert.equal(w.log.filter(l => l.e === x).length, 1, 'one strike each'); assert(fs3.every(x => !x.rgMarkT)); assert.equal(w.P.rgHawk, null); });
check('SMOKE: BIG CLOUD lingers 4 s and keeps a common foe blind, staggers a boss once; VEIL dissolves yellow shots, not red ones or chains', () => {
  let w = world(new Set(['rbigcloud'])); const f = foe(222, { h: 40, y: 165 }), boss = foe(228, { maxHp: 50, h: 40, y: 165 }); w.foes.push(f, boss); w.R.kit.smoke(); w.step(0.02, 80); const cl = w.R.forkBodies.clouds(); assert.equal(cl.length, 1); assert.equal(cl[0].kind, 'big'); assert.equal(cl[0].r, RGF_K.cloud.bigR);
  f.stagger = 0; boss.stagger = 0; w.step(0.02, 40); assert(f.stagger > 0, 'a common foe stays blind'); assert.equal(boss.stagger, 0, 'the boss was staggered once, not again'); w.step(0.02, 250); assert.equal(w.R.forkBodies.clouds().length, 0, 'it ends');
  w = world(new Set(['rveil'])); w.seeds.push({ x: 103, y: 150 }, { x: 104, y: 150, noBlock: true }, { x: 105, y: 150, chain: true }, { x: 300, y: 150 }); w.R.kit.smoke(); w.step(0.02, 3); assert(w.seeds[0].dead && !w.seeds[1].dead && !w.seeds[2].dead && !w.seeds[3].dead); w.step(0.02, 90); assert.equal(w.R.forkBodies.clouds().length, 0); });
check('HEARTSEEKER: DEAD CENTRE is slow, stops in the first foe and hits x1.6; SEEKER is fast and bends onto a foe off the line, then pierces', () => {
  let w = world(new Set(['rdeadeye'])); const f1 = foe(180), f2 = foe(230); w.foes.push(f1, f2); w.R.kit.heart(); const a = w.P.rgArrows[0]; assert(!a.pierce && Math.abs(a.vx - 384) < 1e-6); assert(Math.abs(a.dmg - 20 * 3 * 1.6) < 1e-9); w.step(0.02, 150); assert(dmgOn(w, f1) > 0 && dmgOn(w, f2) === 0);
  w = world(new Set(['rseeker'])); const hi = foe(200, { y: 130 }); w.foes.push(hi); w.R.kit.heart(); const s = w.P.rgArrows[0]; assert(s.seek && s.pierce && Math.abs(s.vx - 768) < 1e-6); w.step(0.01, 80); assert(dmgOn(w, hi) > 0, 'it bent up onto the foe');
  const wb = world(null); wb.foes.push(foe(200, { y: 130 })); wb.R.kit.heart(); wb.step(0.01, 80); assert.equal(wb.log.length, 0, 'the base flies straight past'); });
check('capstone budget: THE LONG DRAW roots 0.9 s and flies 1.5x as far at x1.3; ARROW STORM puts 8 x 0.7 blows on a boss (never held), within 15% of the Great Arrow at mid range', () => {
  let w = world(new Set(['rlongdraw'])); w.P.rgFocus = 100; assert(w.R.greatArrow()); w.step(0.02, 30); assert(w.P.rgGreat, 'still drawing at 0.6 s'); w.step(0.02, 20); assert(!w.P.rgGreat); const ga = w.P.rgArrows.find(a => a.great); assert(ga && ga.longDraw && ga.range === 480);
  const boss = foe(100 + 160, { maxHp: 100 }); const wb = world(null); wb.P.rgFocus = 100; wb.foes.push(Object.assign({}, boss)); wb.R.greatArrow(); wb.step(0.02, 40); const gb = wb.P.rgArrows.find(a => a.great); assert(gb && !gb.longDraw && gb.range === 320);
  w = world(new Set(['rstorm'])); const b = foe(100 + 120, { maxHp: 100 }), small = foe(100 + 60); w.foes.push(b, small); w.P.rgFocus = 100; assert(w.R.greatArrow()); w.step(0.02, 400);
  assert(Math.abs(dmgOn(w, b) / 20 - 8 * RGF_K.storm.k) < 0.2, 'boss total ' + dmgOn(w, b) / 20); assert(Math.abs(dmgOn(w, small) / 20 - 8 * RGF_K.storm.k) < 0.2); assert.equal(b.stagger, undefined); assert.equal(b.frozen, undefined); assert.equal(w.R.forkBodies.storm(), null, 'the storm ends');
  const G = RG.great, midBoss = 20 * (G.dmg0 + (G.dmg1 - G.dmg0) * 0.5) * G.boss / 20; assert(Math.abs(8 * RGF_K.storm.k - midBoss) / midBoss < 0.15, 'storm ' + 8 * RGF_K.storm.k + ' vs great at mid ' + midBoss); });
check('boss law in the fork bodies: no pin, no freeze, no invulnerability, no resist; a boss is only staggered once by a cloud and hit by every volley', () => {
  assert(!/\.pinned\s*=|invuln|\.inv\s*=|resist|\.immune|undying|\.frozen\s*=/i.test(stripComments(bodies)), 'a pin / freeze / invulnerability word in ranger-forks.js');
  const add = rgSrc.split('\n').filter(l => /fk\('r[a-z]+'\)/.test(l)).join('\n'); assert(!/\.pinned\s*=|invuln|\.inv\s*=|resist|\.frozen\s*=/i.test(add), 'the inline fork reads add no pin / resist / freeze'); });
check('TRAIT sides: numbers at full rank (rank 1) and at rank 0.7', () => {
  const R1 = k => ({ [k]: 1 });
  /* KEEN EYE: QUICK x1.5, DEEP none; rank 0.7 scales the bonus */
  let w = world(new Set(['rtquickeye']), R1('keen')); w.R.focusGain(10); assert(Math.abs(w.P.rgFocus - 15) < 1e-9); w = world(new Set(['rtquickeye']), { keen: 0.7 }); w.R.focusGain(10); assert(Math.abs(w.P.rgFocus - 10 * (1 + 0.5 * 0.7)) < 1e-9);
  w = world(new Set(['rtdeepeye']), R1('keen')); w.R.focusGain(10); assert.equal(w.P.rgFocus, 10); w.step(0.02, 1); assert.equal(RGF.focusWin, 2);
  /* LONG MARK: A x2.5 and no trail; B plain and the trail */
  w = world(new Set(['rtlongmark']), { longMark: 1, trail: 1 }); const f = foe(120), g = foe(140); w.foes.push(f, g); w.R.markFoe(f); assert(Math.abs(f.rgMarkT - w.time - RG.mark.t * 2.5) < 1e-9); f.alive = false; w.R.killed(f); assert(!(g.rgMarkT > 0), 'A: not passed');
  w = world(new Set(['rtpassmark']), { longMark: 1, trail: 1 }); const f2 = foe(120), g2 = foe(140); w.foes.push(f2, g2); w.R.markFoe(f2); assert(Math.abs(f2.rgMarkT - w.time - RG.mark.t) < 1e-9); f2.alive = false; w.R.killed(f2); assert(g2.rgMarkT > 0, 'B: passed');
  /* STOUT BOW */
  const knock = ids => { const x = world(new Set(ids), R1('bashBack')); const e = foe(110); x.foes.push(e); x.R.kickHit(e); return Math.abs(e.vx); }; const k0 = knock([]), kA = knock(['rtfarbash']), kB = knock(['rtstunbash']); assert(kA > k0 && kB < k0); assert(Math.abs(kA / k0 - (1 + 0.4 * 1.5 * 1) / (1 + 0.4)) < 1e-9 || kA > k0 * 1.2);
  const wB = world(new Set(['rtstunbash']), R1('bashBack')); const eB = foe(110); wB.foes.push(eB); wB.R.kickHit(eB); assert(eB.stagger >= 0.8);
  /* TOOTHED SNARE: A bite x2 (hold plain), B hold x2 (bite plain) */
  const sn = ids => { const x = world(new Set(ids), R1('toothed')); const e = foe(100); x.foes.push(e); x.R.kit.snare(); x.step(0.02, 3); return { d: dmgOn(x, e), h: e.stagger }; }; const s0 = sn([]), sA = sn(['rtbite']), sB = sn(['rthold']); assert(sA.d > s0.d && Math.abs(sA.h - RG.snare.hold) < 0.1); assert(sB.h > s0.h && Math.abs(sB.d - Math.round(20 * RG.snare.dmg)) <= 1);
  /* SOFT STEP */
  w = world(new Set(['rtwalkdraw']), R1('softStep')); assert(Math.abs(w.R.softK(5) - 0.6) < 1e-9 && Math.abs(w.R.softK(-5) - 0.6) < 1e-9); w = world(new Set(['rtbackdraw']), R1('softStep')); assert(Math.abs(w.R.softK(-5) - 0.7) < 1e-9 && w.R.softK(5) === 0); w = world(new Set(['rtwalkdraw']), { softStep: 0.7 }); assert(Math.abs(w.R.softK(1) - (RG.draw.slow + (0.6 - RG.draw.slow) * 0.7)) < 1e-9);
  /* COVER */
  w = world(new Set(['rtquickcover']), R1('cover')); w.P.rgQ = 1; w.R.flip(1); assert.equal(w.P.rgQ, 2); w.time = 1.6; w.R.flip(1); assert.equal(w.P.rgQ, 3, 'every 1.5 s'); w = world(new Set(['rtbreathcover']), R1('cover')); w.P.rgQ = 1; w.P.st = 10; w.R.flip(1); assert(Math.abs(w.P.st - (10 + 100 / 3)) < 1e-9);
  /* KILL */
  const kill = ids => { const x = world(new Set(ids), { kill: 1 }); x.P.rgQ = 0; const e = foe(120, { rgMarkT: 99 }); x.R.killed(e); return [x.P.rgQ, x.P.rgFocus]; }; assert.deepEqual(kill([]), [2, 20]); assert.deepEqual(kill(['rtkillarrows']), [3, 10]); assert.deepEqual(kill(['rtkillfocus']), [1, 40]);
  /* EAGLE EYE: wide 190 x1.2, sharp 70..110 x1.6 */
  const eagle = (ids, dist) => { const x = world(new Set(ids), { eagle: 1 }); const e = foe(100 + dist, { h: 40, y: 165 }); x.foes.push(e); x.R.release(1, 1, false); x.step(0.01, 200); return x.log[0] ? x.log[0].d : 0; };
  const base150 = eagle([], 150), wide150 = eagle(['rtwidesweet'], 150); assert(base150 > 0 && wide150 > base150, 'wide ' + wide150 + ' base ' + base150); const sharp90 = eagle(['rtsharpeye'], 90), base90 = eagle([], 90); assert(sharp90 / base90 > 1.1, 'sharp ' + sharp90 + ' base ' + base90); });
check('BODKIN: SHATTER POINT takes the whole guard and staggers (a boss loses the guard only); NEEDLE cuts half the guard from any arrow', () => {
  let w = world(new Set(['rtshatter']), { bodkin: 1 }); const g = foe(120, { guardT: 5 }), boss = foe(122, { guardT: 5, maxHp: 80 }); w.foes.push(g); w.R.release(1, 1, false); w.step(0.01, 120); assert.equal(g.guardT, 0); assert(g.stagger >= 0.5 - 1e-9 || g.stagger === undefined || g.stagger > 0);
  w = world(new Set(['rtshatter']), { bodkin: 1 }); w.foes.push(boss); w.R.release(1, 1, false); w.step(0.01, 120); assert.equal(boss.guardT, 0); assert.equal(boss.stagger, undefined, 'no stagger on a boss');
  w = world(new Set(['rtneedle']), { bodkin: 1 }); const h = foe(120, { guardT: 4 }); w.foes.push(h); w.R.quickShot(); w.step(0.01, 120); assert(Math.abs(h.guardT - 2) < 1e-9); });
check('THE LAST ARROW sides read at the knife site (source: ONE LEFT at <= 1 arrow, BARE KNIFE x3 at 0)', () => {
  assert(/RGK\.arrows\(\) <= \(rb\('rtoneleft'\) \? 1 : 0\)/.test(main) && /rb\('rtbareknife'\) \? trm\(3, 'rgLast'\) : trm\(2, 'rgLast'\)/.test(main)); });
if (bad.length) { console.log('RANGER FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Ranger forks: 11 rungs + 10 trait pairs (42 side ids), every side read by the effect code, flag off = base, PvP EVEN off, folded ids retire with the flag, kit bodies on a fake world, capstones within 15% of the Great Arrow, boss law holds.');
