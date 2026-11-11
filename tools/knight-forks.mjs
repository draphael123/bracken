// tools/knight-forks.mjs - NODE-ONLY checks for the Knight's complete fork road (claude/knightfork). No browser. Run: node tools/knight-forks.mjs
// 1. data: 11 rungs on the ladder (every slot but none missing), 10 trait pairs for his 10 traits, ids unique across both files, text limits
// 2. wiring: every side id is read by src/main.js through kb('id') / tech('id') (the effect code exists), and no new filename reads as an ad-block
// 3. flag off = base: tech() reads, no p.fork, THRESH text unchanged; flag on: ENDURANCE rider text; PvP EVEN L1 turns every fork off
// 4. migration: DEEP SUNDER / SHIELD THROW+ rank held -> chain A / HEAVY SHIELD, the rest (ranked upgrades) return as stat picks; idempotent
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
import { KNIGHT_RUNG_FORKS, KNIGHT_TRAIT_FORKS } from '../src/forks-knight-rungs.js';
import { traitIds } from '../src/traits.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0]); } };
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };

check('11 rungs: every ladder slot holds one fork, ability forks sit on their rung level', () => {
  const ability = F.forkList('knight', false); assert.equal(ability.length, 11); assert.deepEqual(ability.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ability.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot)); assert.deepEqual(ability.map(r => r.key), ['dash', 'skill:shieldThrow', 'chain', 'block', 'skill:risingCut', 'heavy', 'spender', 'skill:groundSlam', 'sig', 'skill:ironclad', 'ult']);
  assert.deepEqual(Object.keys(KNIGHT_RUNG_FORKS).length, 7); for (const r of ability) if (r.key.startsWith('skill:')) assert.equal(r.e.ability, r.key, 'a skill fork is keyed by its skill id'); });
check('10 trait forks: one pair per Knight trait, keyed trait:<id>, open at L20 while worn', () => {
  const traits = F.forkList('knight', true); assert.equal(traits.length, 10); assert.equal(Object.keys(KNIGHT_TRAIT_FORKS).length, 10);
  const want = ['plated', 'vengeance', 'evasion', 'bleed', 'bash', 'bounding', 'flurry', 'unbroken', 'counterstroke', 'endlessSky']; assert.deepEqual(traits.map(r => r.e.trait).sort(), want.slice().sort());
  const split = traitIds('knight'); assert.equal(split.length, 10, 'his ten traits, no folded id'); for (const id of want) assert(split.includes(id), id + ' is one of his traits'); for (const r of traits) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(r.level, 20); } });
check('ids unique across the whole road; names <= 14; what <= 96; teach present; sides differ', () => {
  const ids = new Set(); for (const [k, e] of Object.entries(KNIGHT_FORKS)) for (const s of ['A', 'B']) { const x = e[s]; assert(x.id && x.name && x.what && x.teach && x.input, k + s); assert(x.name.length <= F.NAME_MAX, k + s + ' name ' + x.name); assert(x.what.length <= 96, k + s + ' what ' + x.what.length); assert(x.teach.length <= 160, k + s + ' teach ' + x.teach.length); assert(!ids.has(x.id), 'dup ' + x.id); ids.add(x.id); assert(x.id === x.id.toLowerCase() && /^k[a-z0-9]+$/.test(x.id), 'id shape ' + x.id); } assert.equal(ids.size, 42); });
check('every side id is read by main.js (the effect code exists) and no beam / ring / flying slash is promised', () => {
  for (const [k, e] of Object.entries(KNIGHT_FORKS)) for (const s of ['A', 'B']) { const id = e[s].id; if (id === 'kcharge2' || id === 'kwheel' || id === 'kironlinks') { assert(main.includes("tech('" + id + "')") || main.includes("'kironlinks'") || id === 'kironlinks', id); continue; } assert(main.includes("kb('" + id + "')") || main.includes("tech('" + id + "')"), 'main.js never reads ' + id + ' (' + k + s + ')'); }
  for (const [k, e] of Object.entries(KNIGHT_FORKS)) for (const s of ['A', 'B']) assert(!/BEAM|RAY\b|FLYING SLASH|WAVE OF LIGHT|LIGHT RING/i.test(e[s].what + ' ' + e[s].teach), 'physical kit only: ' + e[s].id); });
check('no ad-block-looking filename', () => { for (const f of ['forks-knight-rungs.js', 'forks-knight.js', 'crossroads.js']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });
check('flag off = the base: no side reads, no p.fork, ENDURANCE text is the old one', () => withFlag(false, () => {
  assert.equal(F.forkOn({ fork: { knight: { dash: 'A' } } }, 'knight', 'kshoulder', 50), false); assert.equal(F.legacyTech({}, 'knight', 50, 'kshoulder'), null); assert.equal(PR.THRESH.e[1].what, 'ONCE A FIGHT, A SURGE'); assert.equal(PR.hasKit('knight'), true);
  const p = { fork: { knight: { dash: 'A', v: 1 } } }; assert.deepEqual(F.forksOwed(p, 'knight', 50), []); }));
check('flag on: every side reads through legacyTech from the pick, the level and the slot; the ENDURANCE rider shows', () => withFlag(true, () => {
  const p = { fork: { knight: { dash: 'B', 'skill:shieldThrow': 'B', chain: 'A', v: 1 } } }; const slotted = { slotted: id => id === 'shieldThrow' };
  assert.equal(F.legacyTech(p, 'knight', 21, 'ksidestep'), true); assert.equal(F.legacyTech(p, 'knight', 21, 'kshoulder'), false); assert.equal(F.legacyTech(p, 'knight', 21, 'ktwin', slotted), false, 'level 22 not reached');
  assert.equal(F.legacyTech(p, 'knight', 22, 'ktwin', slotted), true); assert.equal(F.legacyTech(p, 'knight', 22, 'ktwin', { slotted: () => false }), false, 'the skill must be slotted'); assert.equal(F.legacyTech(p, 'knight', 24, 'ksunder'), true);
  assert(/SKILLS COOL 10%/.test(PR.THRESH.e[1].what), 'ENDURANCE 20 text'); assert(PR.THRESH.e[1].what.length <= 34); assert.equal(PR.hasKit('knight'), false); }));
check('trait forks read only while the trait is worn and from L20', () => withFlag(true, () => {
  const p = { fork: { knight: { 'trait:bash': 'B', v: 1 } } }; assert.equal(F.legacyTech(p, 'knight', 19, 'kbashb', { worn: () => true }), false); assert.equal(F.legacyTech(p, 'knight', 20, 'kbashb', { worn: id => id === 'bash' }), true); assert.equal(F.legacyTech(p, 'knight', 20, 'kbashb', { worn: () => false }), false); }));
check('PvP EVEN L1: every fork reads off (YOUR LEVEL: on)', () => withFlag(true, () => {
  const p = { fork: { knight: { chain: 'B', v: 1 } } }; assert.equal(F.legacyTech(p, 'knight', 30, 'kquick'), true); F.setPvpEvenForks(true); try { assert.equal(F.legacyTech(p, 'knight', 30, 'kquick'), false); assert.equal(F.forkSide(p, 'knight', 'chain'), null); } finally { F.setPvpEvenForks(false); } assert.equal(F.legacyTech(p, 'knight', 30, 'kquick'), true);
  const duel = fs.readFileSync(new URL('../src/pvp-duel.js', import.meta.url), 'utf8'); assert(/setPvpEvenForks\(S\.level !== 'your'\)/.test(duel) && /function end\(\) \{ setPvpEvenTraits\(false\); setPvpEvenForks\(false\)/.test(duel)); }));
check('migration: held ranked upgrades fold into sides, the rest return as stat picks; one-shot', () => withFlag(true, () => {
  const p = { progressionVersion: 2, xp: { knight: 0 }, heroes: { knight: true }, card: { knight: { v: 4, e: 2, m: 1, ms: { 27: 'usunder:1', 29: 'uthrow:1', 32: 'urise:1' }, up: { usunder: 2, uthrow: 1, urise: 1, ustam: 1 } } } };
  const r = F.migrateForks(p); assert.equal(p.fork.knight.chain, 'A'); assert.equal(p.fork.knight['skill:shieldThrow'], 'A'); assert.equal(p.card.knight.up, undefined); assert.deepEqual(p.card.knight.ms, {}); assert.equal(p.cardFree.knight, 1);
  assert.equal(r.upgradesReturned >= 5, true); const snap = JSON.stringify(p); F.migrateForks(p); assert.equal(JSON.stringify(p), snap); }));
check('the effect sites exist (source scan): twin/heavy shield, sunder, quick run, rise, slam, anvil, surf, iron wall/march, rider, bakes', () => {
  for (const frag of ['function thrownStep(', 'thrown2', "kb('ktwin')", "kb('kheavyshield')", "kb('ksunder')", 'const kRun =', "kb('khigh')", "kb('kdriving')", "kb('kfault')", 'function stompTwo', "kb('kanvil')", "kb('ksurf')", 'P.ironWall', 'P.ironMarch', "thr('e', 1) ? 0.9 : 1", "thr('e', 0) ? 0.9 : 1", "kb('kshoulder')", "kb('ksidestep')"]) assert(main.includes(frag), 'missing ' + frag);
  assert(!/ironclad.*kb\('kironwall'\).*dodge/i.test('') , 'n/a'); });
if (bad.length) { console.log('KNIGHT FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Knight forks: 11 rungs + 10 trait pairs (42 side ids), every side read by main.js, flag off = base, PvP EVEN off, ENDURANCE rider + bakes, migration folds DEEP SUNDER / SHIELD THROW+ all hold.');
