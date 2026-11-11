// tools/geo-forks.mjs - NODE-ONLY checks for the Geomancer's fork road (claude/geofork). No browser, no cdp. Run: node tools/geo-forks.mjs
// 1. data: 11 rungs on the ladder, 9 trait pairs for her 9 traits, ids unique (and apart from the Knight's), text limits, sides differ
// 2. wiring: every side id is read by src/geomancer.js / src/main.js (fk('id') / gb('id')) - the effect code exists; no ad-block filename; no light / shield-advance words (kit rule)
// 3. flag off = the base: legacyTech null, no p.fork read; flag on: reads respect pick + level + slot (skill) / worn (trait); PvP EVEN L1 turns every side off
// 4. the fork bodies (src/geo-forks.js) on a fake world: flag-off inert, topple needs two stones, capstone damage budget = MOUNTAIN COLLAPSE's, boss law (no pin / freeze / invulnerability on a boss)
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
import { GEO_FORKS, GEO_RUNG_FORKS, GEO_TRAIT_FORKS } from '../src/forks-geomancer.js';
import { makeGeoForks, GF } from '../src/geo-forks.js';
import { GEO } from '../src/geomancer.js';
import { traitIds } from '../src/traits.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0]); } };
const rd = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const geoSrc = rd('src/geomancer.js'), main = rd('src/main.js'), bodies = rd('src/geo-forks.js');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };
const sides = (data = GEO_FORKS) => Object.entries(data).flatMap(([k, e]) => ['A', 'B'].map(s => ({ k, e, s, x: e[s] })));

check('11 rungs: every ladder slot holds one fork, ability forks sit on their rung level', () => {
  const ability = F.forkList('geomancer', false); assert.equal(ability.length, 11); assert.deepEqual(ability.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ability.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot));
  assert.deepEqual(ability.map(r => r.key), ['dash', 'skill:stoneWall', 'chain', 'block', 'skill:boulder', 'heavy', 'spender', 'skill:golem', 'sig', 'skill:faultLine', 'ult']);
  assert.equal(Object.keys(GEO_RUNG_FORKS).length, 11); for (const r of ability) if (r.key.startsWith('skill:')) assert.equal(r.e.ability, r.key, 'a skill fork is keyed by its skill id'); assert(ability[10].e.capstone === true); });
check('9 trait forks: one pair per Geomancer trait, keyed trait:<id>, open at L20 while worn', () => {
  const traits = F.forkList('geomancer', true), want = ['geoRumble', 'geoAftershock', 'geoShrapnel', 'geoBulwark', 'geoFourth', 'geoGravel', 'geoLode', 'geoScree', 'geoMoss'];
  assert.equal(traits.length, 9); assert.equal(Object.keys(GEO_TRAIT_FORKS).length, 9); assert.deepEqual(traits.map(r => r.e.trait).sort(), want.slice().sort());
  const split = traitIds('geomancer'); assert.equal(split.length, 9, 'her nine traits (geoWideQuake is merged into RUMBLE)'); for (const id of want) assert(split.includes(id), id + ' is one of her traits');
  for (const r of traits) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(r.level, 20); } });
check('ids unique across the whole road and apart from the Knight; names <= 14; what <= 96; teach <= 175; sides differ', () => {
  const ids = new Set(), knight = new Set(sides(KNIGHT_FORKS).map(o => o.x.id));
  for (const { k, s, x } of sides()) { assert(x.id && x.name && x.what && x.teach && x.input, k + s); assert(x.name.length <= F.NAME_MAX, k + s + ' name ' + x.name); assert(x.what.length <= 96, k + s + ' what ' + x.what.length); assert(x.teach.length <= 175, k + s + ' teach ' + x.teach.length);
    assert(!ids.has(x.id), 'dup ' + x.id); ids.add(x.id); assert(!knight.has(x.id), 'Knight id ' + x.id); assert(/^g[a-z]+$/.test(x.id), 'g-prefixed ' + x.id); assert(x.input.length <= 28, 'input ' + x.input); }
  for (const [k, e] of Object.entries(GEO_FORKS)) { assert(e.trade && e.trade.length <= 28, k + ' trade'); assert(e.name.length <= F.NAME_MAX, k + ' title ' + e.name); assert.notEqual(e.A.what, e.B.what); assert.notEqual(e.A.name, e.B.name); }
  assert.equal(ids.size, 40); });
check('every side id is read by the effect code (fk / gb), and nothing promises a beam, a ring of light, a shield advance or a hammer', () => {
  for (const { k, x } of sides()) assert(geoSrc.includes("fk('" + x.id + "')") || main.includes("gb('" + x.id + "')") || bodies.includes("fk('" + x.id + "')"), k + ': ' + x.id + ' is never read');
  for (const { x } of sides()) assert(!/BEAM|\bRAY\b|FLYING SLASH|WAVE OF LIGHT|LIGHT RING|HOLY|SUNFALL|SHIELD ADVANCE|HAMMER|RIPOSTE/i.test(x.what + ' ' + x.teach), 'her kit is stone: ' + x.id); });
check('no ad-block-looking filename', () => { for (const f of ['forks-geomancer.js', 'geo-forks.js', 'geo-forks.mjs']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });
check('flag off = the base: no side reads, no p.fork needed', () => withFlag(false, () => {
  const p = { fork: { geomancer: { dash: 'A', v: 1 } } }; assert.equal(F.forkOn(p, 'geomancer', 'grubble', 50), false); assert.equal(F.legacyTech(p, 'geomancer', 50, 'grubble'), null); assert.deepEqual(F.forksOwed(p, 'geomancer', 50), []); assert.equal(PR.hasKit('geomancer'), false, 'she never had technique cards'); }));
check('flag on: every side reads from the pick, the level and the slot / the wear', () => withFlag(true, () => {
  const p = { fork: { geomancer: { dash: 'B', 'skill:golem': 'B', chain: 'A', 'trait:geoMoss': 'B', v: 1 } } }, slotted = { slotted: id => id === 'golem' };
  assert.equal(F.legacyTech(p, 'geomancer', 21, 'gdeep'), true); assert.equal(F.legacyTech(p, 'geomancer', 21, 'grubble'), false); assert.equal(F.legacyTech(p, 'geomancer', 37, 'gtwingolem', slotted), false, 'level 38 not reached');
  assert.equal(F.legacyTech(p, 'geomancer', 38, 'gtwingolem', slotted), true); assert.equal(F.legacyTech(p, 'geomancer', 38, 'gtwingolem', { slotted: () => false }), false, 'the skill must be slotted'); assert.equal(F.legacyTech(p, 'geomancer', 24, 'gtopple'), true);
  assert.equal(F.legacyTech(p, 'geomancer', 19, 'gtlastmoss', { worn: () => true }), false); assert.equal(F.legacyTech(p, 'geomancer', 20, 'gtlastmoss', { worn: id => id === 'geoMoss' }), true); assert.equal(F.legacyTech(p, 'geomancer', 20, 'gtlastmoss', { worn: () => false }), false);
  assert.equal(F.legacyTech(p, 'paladin', 50, 'gdeep'), false, 'another hero never reads her sides'); assert.equal(F.legacyTech(p, 'knight', 50, 'gdeep'), false); }));
check('owed queue, free swap with the level lock, strip and board shape', () => withFlag(true, () => {
  const p = {}; assert.equal(F.forksOwed(p, 'geomancer', 21).length, 1); assert.equal(F.forksOwed(p, 'geomancer', 50).length, 11); assert.equal(F.setFork(p, 'geomancer', 'dash', 'A', 21), null); assert.equal(F.setFork(p, 'geomancer', 'dash', 'B', 21), null); assert.equal(p.fork.geomancer.dash, 'B');
  assert(/Locked until level 22/.test(F.setFork(p, 'geomancer', 'skill:stoneWall', 'A', 21))); assert.equal(F.roadStrip(p, 'geomancer', 30).length, 11); assert.equal(F.boardRows(p, 'geomancer', 30, 'ABILITIES').length, 11); assert.equal(F.boardRows(p, 'geomancer', 30, 'TRAITS').length, 9);
  const c = F.forkCard('geomancer', 'ult'); assert.equal(c.capstone, true); assert.equal(c.opts.length, 2); assert.deepEqual(F.botForks('geomancer', 'A'), Object.assign({ v: 1 }, Object.fromEntries(Object.keys(GEO_FORKS).map(k => [k, 'A'])))); }));
check('PvP EVEN L1: every fork reads off (YOUR LEVEL: on)', () => withFlag(true, () => {
  const p = { fork: { geomancer: { chain: 'B', v: 1 } } }; assert.equal(F.legacyTech(p, 'geomancer', 30, 'gshards'), true); F.setPvpEvenForks(true); try { assert.equal(F.legacyTech(p, 'geomancer', 30, 'gshards'), false); assert.equal(F.forkSide(p, 'geomancer', 'chain'), null); } finally { F.setPvpEvenForks(false); } }));
check('the effect sites exist (source scan)', () => {
  for (const frag of ['function wardRoot(', 'function gritBack(', 'function spikeStep(', 'const stepGolem =', 'golem2', 'function shrap(', "fk('gtall')", "fk('gbarricade')", "fk('ggreat')", "fk('gscatter')", "fk('ghighrift')", "fk('glongrift')", "fk('gwidefall')", 'GFK.toppleFist()', 'GFK.shardFist()', 'GFK.shatterAt(', 'GFK.shatterWanted()', 'GFK.geode(', 'GFK.greatFault(', 'GFK.stoneHost(', "fk('gttall')", "fk('gtrootwall')", "fk('gtrootward')", "fk('gtdeepgrav')", "fk('gtwidegrav')", "fk('gtlastmoss')", "fk('gtquickmoss')", "fk('gtlongscree')", "fk('gthardscree')", "fk('gtlongdrag')", "fk('gtsnatch')", "fk('gtheavyroll')", "fk('gtlongfall')", "fk('gtshaken')"]) assert(geoSrc.includes(frag), 'geomancer.js lacks ' + frag);
  for (const frag of ["gb('gdeep')", 'GEO.forkBodies.surface()', "gb('gonestave')", 'fork: id => gb(id)']) assert(main.includes(frag), 'main.js lacks ' + frag); });
check('flag off: every new geomancer.js read is behind fk() (no raw use of a side id outside fk / gb)', () => {
  for (const { x } of sides()) { const re = new RegExp("(?<!fk\\()(?<!gb\\()'" + x.id + "'", 'g'); const strays = (geoSrc.match(re) || []).length + (main.match(re) || []).length; assert.equal(strays, 0, x.id + ' used outside fk / gb'); } });

/* ---- 4. the bodies on a fake world: K.dmg returns the multiplier, so every blow is recorded as a number of swords ---- */
function world(picks) {
  const log = [], foes = [], w = { log, foes, pieces: [], shards: [], placed: [], time: 0 };
  const P = { x: 100, y: 160, face: 1, hp: 100, maxHp: 100 };
  const api = { TS: 16, P, VW: 320, LH: 40, time: 0, enemies: foes, boss: null, number() {}, sparks() {}, dust() {}, ringAt() {}, burst() {}, shakeCam() {}, hitstop() {}, kitPose() {}, SFX: {}, isSolid: (tx, ty) => ty >= 10, isOneWay: () => false, tileAt: () => 0, overlap: (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t,
    box: e => ({ l: e.x - 6, r: e.x + 6, t: e.y - 14, b: e.y }), floorFoe: () => true, hurtAs: (kind, e, d, x) => { log.push({ kind, e, d }); if (e.hp != null) e.hp -= d; } };
  Object.defineProperty(api, 'time', { get: () => w.time });
  const K = { pieces: () => w.pieces, shards: () => w.shards, crumble: p => { p.gone = true; w.pieces = w.pieces.filter(q => q !== p); }, floorRow: () => 10, place: (k, c, t, o) => { const p = { kind: k, cells: c, x0: c[0][0] * 16, x1: c[c.length - 1][0] * 16 + 16, y0: c[0][1] * 16, y1: c[0][1] * 16 + 16, o }; w.placed.push(p); return p; }, T: () => ({ ONEWAY: 2, SOLID: 1 }), dmg: k => k, isBig: e => !!e.big, liftable: e => !e.big };
  w.api = api; w.P = P; w.K = K; w.fk = id => !!picks && picks.has(id); w.gf = makeGeoForks(api, K, w.fk, GEO.avalanche); return w;
}
const foe = (x, o = {}) => Object.assign({ x, y: 160, alive: true, hp: 1e6, w: 12, h: 14 }, o);
const stone = (x, kind = 'pillar') => ({ capped: true, kind, x0: x, x1: x + 16, y0: 128, y1: 160 });
check('flag off: every body is inert (no pick = nothing happens)', () => {
  const w = world(null); w.foes.push(foe(120)); w.pieces.push(stone(104), stone(136)); assert.equal(w.gf.surface(), null); assert.equal(w.gf.toppleFist(), false); assert.equal(w.gf.shardFist(), false); assert.equal(w.gf.geode(w.foes[0]), false); assert.equal(w.gf.shatterWanted(), false);
  w.gf.crumbled(w.pieces[0], 'broken'); w.gf.update(0.5); assert.equal(w.gf.mines().length, 0); assert.equal(w.log.length, 0); assert.equal(w.pieces.length, 2); assert.equal(w.shards.length, 0); });
check('RUBBLE ROLL: one mine at a time; the first foe onto it takes half a blow once; a boss takes the blow only', () => {
  const w = world(new Set(['grubble'])); w.gf.surface(); w.gf.surface(); assert.equal(w.gf.mines().length, 1); const boss = foe(100, { big: true }); w.foes.push(boss); w.gf.update(0.05); assert.equal(w.log.length, 1); assert.equal(w.log[0].d, GF.mine.k); assert.equal(boss.stagger, undefined, 'no stagger on a boss'); assert.equal(w.gf.mines().length, 0); });
check('TOPPLE needs a second stone (never the last); SHARD FIST throws two flat half blows', () => {
  let w = world(new Set(['gtopple'])); w.pieces.push(stone(120)); assert.equal(w.gf.toppleFist(), false, 'the last stone is never toppled'); w.pieces.push(stone(150)); assert.equal(w.gf.toppleFist(), true); assert.equal(w.pieces.length, 1); w.foes.push(foe(140)); for (let i = 0; i < 40; i++) w.gf.update(0.02); assert.equal(w.log.length, 1); assert.equal(w.log[0].d, GF.topple.k);
  w = world(new Set(['gshards'])); assert.equal(w.gf.shardFist(), true); assert.equal(w.shards.length, 2); assert.deepEqual(w.shards.map(s => s.dmg), [0.45, 0.45]); assert(w.shards[0].y !== w.shards[1].y); });
check('GEODE: a small foe is sealed 1.5 s then bursts; a boss is OPENED, never frozen or staggered', () => {
  const w = world(new Set(['ggeode'])), small = foe(110), boss = foe(130, { big: true }); w.foes.push(small, boss); w.gf.geode(small); w.gf.geode(boss); assert.equal(small.frozen, GF.geode.fuse); assert.equal(boss.frozen, undefined); assert.equal(boss.stagger, undefined); assert(boss.disarmOpenT > 0);
  for (let i = 0; i < 80; i++) { w.time += 0.02; w.gf.update(0.02); } assert.equal(w.log.filter(l => l.e === small).length, 1); assert.equal(w.log.filter(l => l.e === boss).length, 1); assert.equal(small.frozen, 0); });
check('SHATTER RECALL: wanted only with a foe near her; each foe takes at most two bursts', () => {
  const w = world(new Set(['gshatter'])); assert.equal(w.gf.shatterWanted(), false); const f = foe(120); w.foes.push(f); assert.equal(w.gf.shatterWanted(), true); for (let i = 0; i < 4; i++) w.gf.shatterAt(120, 160); assert.equal(w.log.length, GF.shatter.perFoe); });
check('CAIRN: only a stone a foe BREAKS or RAMS leaves gravel; nine mines at most', () => {
  const w = world(new Set(['gcairn'])); const st = stone(120); w.gf.crumbled(st, 'time'); w.gf.crumbled(st, 'silent'); w.gf.crumbled(st, 'topple'); assert.equal(w.gf.mines().length, 0); for (let i = 0; i < 5; i++) w.gf.crumbled(st, i % 2 ? 'broken' : 'rammed'); assert.equal(w.gf.mines().length, GF.cairn.max); });
check('capstone budget: GREAT FAULT and STONE HOST keep MOUNTAIN COLLAPSE\'s damage on a boss (n x avalanche.boss) and a common (n x avalanche.roll)', () => {
  const AV = GEO.avalanche, n = 3, stones = [0, 1, 2].map(i => ({ x: 120 + i * 20, gy: 160, h: 2 }));
  let w = world(new Set(['ggreatfault'])); const boss = foe(150, { big: true }), small = foe(170); w.foes.push(boss, small); w.gf.greatFault(stones); for (let i = 0; i < 160; i++) { w.time += 0.02; w.gf.update(0.02); }
  const sum = f => w.log.filter(l => l.e === f).reduce((a, l) => a + l.d, 0); assert(Math.abs(sum(boss) - AV.boss * n) < 1e-6, 'boss total ' + sum(boss)); assert(Math.abs(sum(small) - AV.roll * n) < 1e-6, 'common total ' + sum(small)); assert(boss.disarmOpenT > 0 && boss.frozen === undefined && boss.stagger === undefined);
  assert(w.placed.length >= 1 && w.placed.every(p => p.kind === 'shelf' && p.o.free), 'the shelves stand outside her three');
  w = world(new Set(['ghost'])); const b2 = foe(130, { big: true }); w.foes.push(b2); w.gf.stoneHost(stones); for (let i = 0; i < 700; i++) { w.time += 0.02; w.gf.update(0.02); }
  const hostBoss = w.log.filter(l => l.e === b2).reduce((a, l) => a + l.d, 0); assert(hostBoss <= AV.boss * n + 1e-6 && hostBoss >= AV.boss * n * 0.7, 'host on a boss ' + hostBoss + ' vs the collapse ' + AV.boss * n); assert.equal(w.gf.hosts().length, 0, 'the host is gone after ten seconds'); });
check('boss law in the fork bodies: no pin, no freeze, no invulnerability, no resist; a boss is only OPENED', () => {
  assert(!/\.pinned\s*=|invuln|\.inv\s*=|resist|\.immune|undying/i.test(bodies), 'a pin / invulnerability / resist word in geo-forks.js');
  assert(/e\.frozen = Math\.max\(e\.frozen \|\| 0, GF\.geode\.fuse\)/.test(bodies) && /if \(big\) open\(e, GF\.geode\.open\); else \{ e\.frozen/.test(bodies), 'frozen only on the non-big branch');
  const add = geoSrc.split('\n').filter(l => /fk\('g[a-z]+'\)/.test(l)).join('\n'); assert(!/\.pinned\s*=|invuln|resist/i.test(add), 'the inline fork reads add no pin / resist'); });
check('rank scale: every trait side delta scales with the trait rank (mulK / tal()), a discrete side does not', () => {
  for (const frag of ["mulK(fk('gtlongfall') ? 2.0 : 1.5, tal('aftershock'))", "mulK(1.5, tal('rumble'))", 'dmg(0.3 * tal(\'aftershock\'))', '1 - gv.slow * tal(\'gravel\')', '0.6 * tal(\'bulwark\')', "tal('moss')", 'TS * 3 * tal(\'lode\')']) assert(geoSrc.includes(frag), 'rank scaling lacks ' + frag); });
if (bad.length) { console.log('GEO FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Geomancer forks: 11 rungs + 9 trait pairs (40 side ids), every side read by the effect code, flag off = base, PvP EVEN off, bodies inert flag off, capstones keep the collapse budget, boss law holds.');
