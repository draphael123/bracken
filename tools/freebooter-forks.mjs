// tools/freebooter-forks.mjs - NODE-ONLY checks for the Freebooter's fork road (claude/freefork). Pure node, no page, no browser. Run: node tools/freebooter-forks.mjs
// 1. data: 11 rungs on the ladder, 10 trait pairs for his 10 traits, ids unique (and apart from the Knight's), text limits, sides differ
// 2. wiring: every side id is read by src/main.js (fb('id')) or the bodies; no ad-block filename; kit words (no bow, stone, shield, hammer, beam)
// 3. flag off = the base: legacyTech null, no p.fork read; flag on: reads respect pick + level + slot (skill) / worn (trait); PvP EVEN L1 turns every side off; folded ids retire only with the flag
// 4. the bodies on a fake world (src/freebooter-forks.js): each new body once, boss law, budgets; the hook-catch verdicts with and without SLIPKNOT's beat
// 5. src/main.js with every fork read = false is node-for-node the base (tools/freebooter-flagoff-ast.mjs, run here as a child)
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import * as F from '../src/forks.js';
import * as PR from '../src/progression.js';
import { KNIGHT_FORKS } from '../src/forks-knight.js';
import { FB_FORKS, FB_RUNG_FORKS, FB_TRAIT_FORKS } from '../src/forks-freebooter.js';
import { makeFreebooterForks, FBF_K } from '../src/freebooter-forks.js';
import { catchVerdict, seedVerdict, CATCH } from '../src/hook-catch.js';
import { TRAIT_SPLIT, traitIds, slottable, kindOf } from '../src/traits.js';
const bad = []; const check = (n, fn) => { try { fn(); } catch (e) { bad.push(n + ': ' + String(e.message).split('\n')[0] + ((e.stack || '').split('\n').find(l => /freebooter-forks\.mjs:\d+/.test(l)) || '').replace(/^.*mjs:/, ' @line ')); } };
const rd = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const main = rd('src/main.js'), bodies = rd('src/freebooter-forks.js');
const withFlag = (v, fn) => { const was = F.forksShip(); F.setForksShip(v); try { return fn(); } finally { F.setForksShip(was); } };
const stripComments = t => t.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
const sides = (data = FB_FORKS) => Object.entries(data).flatMap(([k, e]) => ['A', 'B'].map(s => ({ k, e, s, x: e[s] })));

check('11 rungs: every ladder slot holds one fork, skill forks are keyed by their catalog skill, ability forks sit on their rung level', () => {
  const ability = F.forkList('pirate', false); assert.equal(ability.length, 11); assert.deepEqual(ability.map(r => r.level), [21, 22, 24, 27, 29, 32, 36, 38, 43, 48, 50]);
  assert.deepEqual(ability.map(r => r.e.slot), F.FORK_LADDER.map(r => r.slot));
  assert.deepEqual(ability.map(r => r.key), ['dash', 'skill:heavySeas', 'chain', 'block', 'skill:boarding', 'heavy', 'spender', 'skill:powderKeg', 'sig', 'skill:keelhaul', 'ult']);
  assert.equal(Object.keys(FB_RUNG_FORKS).length, 11); assert(ability[10].e.capstone === true);
  const ids = new Set(PR.SKILLS.filter(s => s.hero === 'pirate' && s.active).map(s => s.id));
  for (const r of ability) { const sk = r.e.ability.startsWith('skill:') ? r.e.ability.slice(6) : null; if (sk) assert(ids.has(sk), r.key + ' is not a pirate active skill'); if (r.key.startsWith('skill:')) assert.equal(r.e.ability, r.key); } });
check('10 trait forks: one pair per Freebooter trait, keyed trait:<id>, open at L20 while worn', () => {
  const traits = F.forkList('pirate', true), want = TRAIT_SPLIT.pirate.traits;
  assert.equal(traits.length, 10); assert.equal(Object.keys(FB_TRAIT_FORKS).length, 10); assert.deepEqual(traits.map(r => r.e.trait).sort(), want.slice().sort());
  for (const r of traits) { assert.equal(r.key, 'trait:' + r.e.trait); assert.equal(r.level, 20); } });
check('ids unique across the whole road and apart from the Knight; names <= 14; what <= 96; teach <= 175; sides differ', () => {
  const ids = new Set(), other = new Set(sides(KNIGHT_FORKS).map(o => o.x.id));
  for (const { k, s, x } of sides()) { assert(x.id && x.name && x.what && x.teach && x.input, k + s); assert(x.name.length <= F.NAME_MAX, k + s + ' name ' + x.name); assert(x.what.length <= 96, k + s + ' what ' + x.what.length); assert(x.teach.length <= 175, k + s + ' teach ' + x.teach.length);
    assert(!ids.has(x.id), 'dup ' + x.id); ids.add(x.id); assert(!other.has(x.id), 'Knight id ' + x.id); assert(/^f[a-z]+$/.test(x.id), 'f-prefixed ' + x.id); assert(x.input.length <= 28, 'input ' + x.input); }
  for (const [k, e] of Object.entries(FB_FORKS)) { assert(e.trade && e.trade.length <= 28, k + ' trade'); assert(e.name.length <= F.NAME_MAX, k + ' title ' + e.name); assert.notEqual(e.A.what, e.B.what); assert.notEqual(e.A.name, e.B.name); }
  assert.equal(ids.size, 42); });
check('every side id is read by the effect code (fb), and nothing promises a bow, a stone, a shield, a hammer, a beam or a ray', () => {
  for (const { k, x } of sides()) assert(main.includes("fb('" + x.id + "')"), k + ': ' + x.id + ' is never read');
  for (const { x } of sides()) assert(!/BEAM|\bRAY\b|FLYING SLASH|LIGHT RING|HOLY|SUNFALL|SHIELD|HAMMER|STONE|BOULDER|\bBOW\b|ARROW|FIREBALL|SPEAR/i.test(x.what + ' ' + x.teach), 'his kit is the cutlass, the pistol, the hook, the keg and the purse: ' + x.id); });
check('Daniel 11-09: nothing built is a NEW move (no kick, no swing, no crew shots, no Raiding Hour, no Great Keg ultimate)', () => {
  const all = sides().map(s => s.x.name + ' ' + s.x.what + ' ' + s.x.teach).join(' ');
  assert(!/KICK|CREW SHOTS|RAIDING HOUR|GREAT KEG|HOOK A WALL|SWING ON|SWINGS FROM/i.test(all), 'a forkplan new move came back'); });
check('no ad-block-looking filename', () => { for (const f of ['forks-freebooter.js', 'freebooter-forks.js', 'freebooter-forks.mjs', 'freebooter-flagoff-ast.mjs']) assert(!/(^|[-_.])(ad|ads|admiral|banner|track|tracker|sponsor|promo)([-_.]|$)/i.test(f), f); });
check('flag off = the base: no side reads, no p.fork needed; hasKit stays false for him', () => withFlag(false, () => {
  const p = { fork: { pirate: { dash: 'A', v: 1 } } }; assert.equal(F.forkOn(p, 'pirate', 'fbarrel', 50), false); assert.equal(F.legacyTech(p, 'pirate', 50, 'fbarrel'), null); assert.deepEqual(F.forksOwed(p, 'pirate', 50), []); assert.equal(PR.hasKit('pirate'), false); }));
check('flag on: every side reads from the pick, the level and the slot / the wear', () => withFlag(true, () => {
  const p = { fork: { pirate: { dash: 'B', 'skill:powderKeg': 'B', chain: 'A', 'trait:hotBarrel': 'B', v: 1 } } }, slotted = { slotted: id => id === 'powderKeg' };
  assert.equal(F.legacyTech(p, 'pirate', 21, 'fsidestep'), true); assert.equal(F.legacyTech(p, 'pirate', 21, 'fbarrel'), false); assert.equal(F.legacyTech(p, 'pirate', 37, 'fthreekegs', slotted), false, 'level 38 not reached');
  assert.equal(F.legacyTech(p, 'pirate', 38, 'fthreekegs', slotted), true); assert.equal(F.legacyTech(p, 'pirate', 38, 'fthreekegs', { slotted: () => false }), false, 'the skill must be slotted'); assert.equal(F.legacyTech(p, 'pirate', 24, 'fsteel'), true);
  assert.equal(F.legacyTech(p, 'pirate', 19, 'fthotball', { worn: () => true }), false); assert.equal(F.legacyTech(p, 'pirate', 20, 'fthotball', { worn: id => id === 'hotBarrel' }), true); assert.equal(F.legacyTech(p, 'pirate', 20, 'fthotball', { worn: () => false }), false);
  assert.equal(F.legacyTech(p, 'ranger', 50, 'fsidestep'), false, 'another hero never reads his sides'); assert.equal(F.legacyTech(p, 'knight', 50, 'fsidestep'), false); }));
check('owed queue, free swap with the level lock, strip and board shape', () => withFlag(true, () => {
  const p = {}; assert.equal(F.forksOwed(p, 'pirate', 21).length, 1); assert.equal(F.forksOwed(p, 'pirate', 50).length, 11); assert.equal(F.setFork(p, 'pirate', 'dash', 'A', 21), null); assert.equal(F.setFork(p, 'pirate', 'dash', 'B', 21), null); assert.equal(p.fork.pirate.dash, 'B');
  assert(/Locked until level 22/.test(F.setFork(p, 'pirate', 'skill:heavySeas', 'A', 21))); assert.equal(F.roadStrip(p, 'pirate', 30).length, 11); assert.equal(F.boardRows(p, 'pirate', 30, 'ABILITIES').length, 11); assert.equal(F.boardRows(p, 'pirate', 30, 'TRAITS').length, 10);
  const c = F.forkCard('pirate', 'ult'); assert.equal(c.capstone, true); assert.equal(c.opts.length, 2); assert.deepEqual(F.botForks('pirate', 'A'), Object.assign({ v: 1 }, Object.fromEntries(Object.keys(FB_FORKS).map(k => [k, 'A'])))); }));
check('PvP EVEN L1: every fork reads off (YOUR LEVEL: on)', () => withFlag(true, () => {
  const p = { fork: { pirate: { chain: 'B', v: 1 } } }; assert.equal(F.legacyTech(p, 'pirate', 30, 'fswift'), true); F.setPvpEvenForks(true); try { assert.equal(F.legacyTech(p, 'pirate', 30, 'fswift'), false); assert.equal(F.forkSide(p, 'pirate', 'chain'), null); } finally { F.setPvpEvenForks(false); } }));
check('folded ids: slottable traits with the flag off, retired (never slot, never on) with it on; the cut ids stay cut', () => {
  const FOLD = ['longLine', 'turncoat', 'parryCut', 'noQuarter'];
  withFlag(false, () => { for (const id of FOLD) assert(slottable('pirate').includes(id), id + ' slots flag off'); assert.equal(traitIds('pirate').length, 14); });
  withFlag(true, () => { for (const id of FOLD) { assert(!slottable('pirate').includes(id), id + ' retired flag on'); assert.equal(kindOf('pirate', id), 'retired'); } assert.equal(traitIds('pirate').length, 10); }); });
check('the effect sites exist (source scan)', () => {
  for (const frag of ["const fb = id => hero() === 'pirate' && tech(id);", 'FBX.update(dt);', 'FBX.draw(g, cx, cy);', "FBX.keg('A')", "FBX.keg('B')", 'FBX.splinter(best, dmg)', 'FBX.tide(', 'FBX.undertow(', 'FBX.haul(foe)', 'FBX.payday(e)', 'perfect: FBF_K.slip.perfect', "k === 'boarding' && fb('fquickboard')"]) assert(main.includes(frag), 'main.js lacks ' + frag);
  for (const frag of ['function keg(', 'function update(', 'function draw(', 'function splinter(', 'function tide(', 'function undertow(', 'function haul(', 'function payday(']) assert(bodies.includes(frag), 'freebooter-forks.js lacks ' + frag); });
check('flag off: every side id is read only through fb() (no raw use outside it)', () => {
  for (const { x } of sides()) { const re = new RegExp("(?<!fb\\()'" + x.id + "'", 'g'); const strays = (main.match(re) || []).length + (bodies.match(re) || []).length; assert.equal(strays, 0, x.id + ' used outside fb'); } });
check('rank scale: every trait side delta scales with the trait rank (trk / trm), a discrete side does not', () => {
  const lines = main.split('\n');
  const hasRank = (id, trait) => lines.some(l => l.includes("fb('" + id + "')") && (l.includes("trk('" + trait + "')") || l.includes("trm(") && l.includes("'" + trait + "'")));
  for (const [id, trait] of [['ftlongglass', 'longBarrel'], ['ftsawn', 'longBarrel'], ['ftslowmatch', 'powderBurn'], ['ftsparks', 'powderBurn'], ['ftfatcoin', 'looter'], ['ftwindcoin', 'looter'], ['ftbigshare', 'shareOut'], ['ftlastshare', 'shareOut'], ['ftcleanshot', 'deadEye'], ['ftkeepdown', 'deadEye'], ['ftfullransom', 'ransom'], ['fthotflag', 'ransom'], ['ftsmallchange', 'pieces'], ['ftbigpiece', 'pieces'], ['ftbreakguard', 'runThrough'], ['ftquickload', 'secondBarrel'], ['fthotlong', 'hotBarrel'], ['fthotball', 'hotBarrel']]) assert(hasRank(id, trait), id + ' does not scale with ' + trait);
  /* the discrete sides: a barrel, a coin interval, a window: no rank by design */ assert(main.includes("fb('ftthreebarrel') ? 1 : 0") && main.includes("fb('ftearly') && P.combo % 5 === 4")); });

/* ---- 4. the bodies on a fake world. swordDmg = 20 so a blow reads as a number of 20-point swords ---- */
function world(picks = null) {
  const w = { time: 0, log: [], foes: [], numbers: [], coins: 0, sparks: 0 };
  const P = { x: 100, y: 160, face: 1, catchShotT: 0 };
  const base = { P, get enemies() { return w.foes; }, get time() { return w.time; }, SFX: new Proxy({}, { get: () => () => 0 }), swordDmg: () => 20, kegBlow: () => 20 * 0.65,
    hurtAs: (k, e, d) => { w.log.push({ k, e, d }); e.hp -= d; if (e.hp <= 0) e.alive = false; }, ringAt: () => 0, burst: () => 0, shakeCam: () => 0, sparks: () => { w.sparks++; }, number: (x, y, t) => w.numbers.push(t), dropCoin: () => { w.coins++; } };
  w.api = base; w.X = makeFreebooterForks(base); w.P = P;
  w.step = (dt, n = 1) => { for (let i = 0; i < n; i++) { w.time += dt; w.X.update(dt); } };
  return w;
}
const foe = (x, o = {}) => Object.assign({ x, y: 160, alive: true, hp: 1e6, w: 12, h: 14 }, o);
const dmgOn = (w, f) => w.log.filter(l => l.e === f).reduce((a, l) => a + l.d, 0);
const g2 = { fillStyle: '', fillRect: () => 0 };
check('flag off: with nothing cast every body is a no-op (empty list, no state, no draw, no damage)', () => {
  const w = world(); const f = foe(120); w.foes.push(f); w.step(0.02, 200); w.X.draw(g2, 0, 0); assert.equal(w.log.length, 0); assert.equal(w.X.kegs().length, 0); assert.deepEqual(Object.keys(f).sort(), ['alive', 'h', 'hp', 'w', 'x', 'y']); assert.deepEqual(w.P, { x: 100, y: 160, face: 1, catchShotT: 0 }); });
check('POWDER KEG: BIG KEG blows after 1.5 s in an 80 px ring for x1.5 of the old blow; THREE KEGS blow 0.8 / 1.0 / 1.2 s on at 44 / 84 / 124 px, 38 px rings, 45% each; a common foe is thrown, a boss takes the blow only', () => {
  let w = world(); const near = foe(144), boss = foe(160, { maxHp: 100 }), far = foe(144 + 90); w.foes.push(near, boss, far); w.X.keg('A'); assert.equal(w.X.kegs().length, 1); w.step(0.02, 70); assert.equal(dmgOn(w, near), 0, 'not yet (1.4 s)'); w.step(0.02, 12); assert(dmgOn(w, near) > 0, 'blown at 1.5 s');
  const old = Math.round(20 * 0.65); assert.equal(dmgOn(w, near), Math.round(old * 1.5)); assert.equal(dmgOn(w, boss), Math.round(old * 1.5), 'the boss is in the ring (16 px) and takes the blow'); assert.equal(dmgOn(w, far), 0, '90 px off is out of 80'); assert(near.stagger > 0 && near.vy < 0, 'a common foe is thrown'); assert.equal(boss.stagger, undefined, 'a boss is never staggered'); assert.equal(boss.vx, undefined);
  w = world(); const a = foe(144), b = foe(184), c = foe(224); w.foes.push(a, b, c); w.X.keg('B'); assert.equal(w.X.kegs().length, 3); w.step(0.02, 38); assert.equal(dmgOn(w, a), 0); w.step(0.02, 4); assert(dmgOn(w, a) > 0 && dmgOn(w, b) === 0, 'the first at 0.8 s'); w.step(0.02, 20); assert(dmgOn(w, b) > 0); w.step(0.02, 20); assert(dmgOn(w, c) > 0);
  assert.equal(dmgOn(w, a), Math.round(old * 0.45)); const mid = foe(164); const w3 = world(); w3.foes.push(mid); w3.X.keg('B'); w3.step(0.02, 80); assert.equal(dmgOn(w3, mid), 2 * Math.round(old * 0.45), 'a foe 20 px from two kegs (144 and 184) stands in two rings and takes both; the third (224) is 60 px off'); });
check('POWDER KEG budget: a foe standing in the middle of the three small rings takes at most 3 x 45% = 1.35 of the old keg; the big keg is 1.5; the sides sit within 12% of each other at the best spot', () => {
  const big = FBF_K.bigKeg.mul, three = 3 * FBF_K.threeKegs.mul; assert(three / big > 0.88 && three / big < 1.0, 'three ' + three + ' vs big ' + big); });
check('THE PISTOL B: SPLINTER takes half the ball to up to three SMALL foes within 36 px of the one hit, staggers them 0.5 s, never a boss, a mini or the foe itself', () => {
  const w = world(); const best = foe(150), s1 = foe(160), s2 = foe(170), s3 = foe(175), s4 = foe(180), boss = foe(152, { maxHp: 50 }), mini = foe(153, { mini: true }), far = foe(200); w.foes.push(best, s1, s2, s3, s4, boss, mini, far);
  const n = w.X.splinter(best, 100); assert.equal(n, 3); const hit = [s1, s2, s3, s4].filter(x => dmgOn(w, x) > 0); assert.equal(hit.length, 3); for (const x of hit) { assert.equal(dmgOn(w, x), 50); assert(x.stagger >= 0.5); } assert.equal(dmgOn(w, best), 0); assert.equal(dmgOn(w, boss), 0); assert.equal(dmgOn(w, mini), 0); assert.equal(dmgOn(w, far), 0); });
check('HEAVY SEAS: HIGH TIDE keeps commons down 2 s and shakes up to three coins loose (a boss only rocked: no stagger); UNDERTOW drags commons back toward him, down 1.6 s', () => {
  let w = world(); const f = [foe(120), foe(130), foe(140), foe(150), foe(160)], boss = foe(170, { maxHp: 50 }); w.foes.push(...f, boss); assert.equal(w.X.tide([...f, boss]), 3); assert.equal(w.coins, 3); for (const x of f) assert.equal(x.stagger, 2.0); assert.equal(boss.stagger, undefined);
  w = world(); const g = foe(120), b2 = foe(130, { maxHp: 50 }); w.X.undertow([g, b2]); assert.equal(g.vx, -FBF_K.undertow.pull); assert.equal(g.stagger, 1.6); assert.equal(b2.vx, undefined); assert.equal(b2.stagger, undefined); });
check('THE HOOK A: HAUL AND BALL cuts a hauled small foe 0.6, powder-marks it 2.5 s and seats an instant point-blank ball for 3 s; a boss or mini is never hauled', () => {
  const w = world(); const f = foe(110), boss = foe(110, { maxHp: 50 }); w.X.haul(f); assert.equal(dmgOn(w, f), 12); assert(Math.abs(f.powderUntil - 2.5) < 1e-9); assert(Math.abs(w.P.catchShotT - 3) < 1e-9); w.X.haul(boss); assert.equal(dmgOn(w, boss), 0); });
check('BLACK FLAG: PAYDAY is three swords to a common foe and a boss alike (the boss budget rule: damage yes, pin no); LONG PARLEY and PAYDAY sit within 25% on a boss', () => {
  const w = world(); const f = foe(110), boss = foe(110, { maxHp: 50 }); w.X.payday(f); w.X.payday(boss); assert.equal(dmgOn(w, f), 60); assert.equal(dmgOn(w, boss), 60); assert.equal(f.stagger, undefined, 'the flag code staggers, not the body');
  /* a boss under LONG PARLEY: 0.8 s rocked as before and the cutlass x1.5 for 4 s. The cutlass lands about 1.7 swords a second on a stood boss (one run of five in ~3 s: 4 x 1 + 2 = 6 swords / 3.5 s): the extra half a blow is 0.5 x 1.7 x 4 s = 3.4 swords against PAYDAY's 3.0 */
  const parley = 0.5 * 1.7 * FBF_K.parley.mark, payday = FBF_K.payday.k; assert(Math.abs(parley - payday) / payday < 0.25, 'parley ' + parley + ' payday ' + payday); });
check('boss law in the fork bodies: no pin, no freeze, no invulnerability, no resist; commons only for stagger / pull / splinter', () => {
  assert(!/\.pinned\s*=|invuln|\.inv\s*=|resist|\.immune|undying|\.frozen\s*=/i.test(stripComments(bodies)), 'a pin / freeze / invulnerability word in freebooter-forks.js');
  const add = main.split('\n').filter(l => /fb\('f[a-z]+'\)/.test(l)).join('\n'); assert(!/\.pinned\s*=|invuln|resist|\.frozen\s*=|\.immune/i.test(add), 'the inline fork reads add no pin / resist / freeze');
  assert(!/GRAPPLE.*\.inv\b/.test(add), 'GRAPPLE adds no untouchable beat'); });
check('HOOK CATCH verdicts: the base is unchanged with no perfect argument; SLIPKNOT widens the perfect beat to 0.28 s (a blow met at 0.25 s is perfect with it, a plain block without)', () => {
  for (let a = 0; a <= 0.5; a += 0.01) for (const dmg of [5, 30]) for (const red of [false, true]) for (const pierce of [false, true]) {
    const x = { age: a, dmg, front: true, red, pierce }; assert.equal(catchVerdict(x), catchVerdict({ ...x, perfect: CATCH.perfect }), 'same at ' + a); assert.equal(seedVerdict(x), seedVerdict({ ...x, perfect: CATCH.perfect })); }
  assert.equal(catchVerdict({ age: 0.25, dmg: 5 }), 'block'); assert.equal(catchVerdict({ age: 0.25, dmg: 5, perfect: FBF_K.slip.perfect }), 'perfect'); assert.equal(seedVerdict({ age: 0.25 }), 'drop'); assert.equal(seedVerdict({ age: 0.25, perfect: FBF_K.slip.perfect }), 'fling');
  assert.equal(FBF_K.slip.cd < CATCH.cd, true); assert.equal(catchVerdict({ age: 0.3, dmg: 5, perfect: FBF_K.slip.perfect }), 'block'); });
check('numbers on the card are the numbers in the code (the teach text names them)', () => {
  const t = k => FB_FORKS[k]; const A = (k, s) => t(k)[s].teach;
  assert(A('skill:powderKeg', 'A').includes('1.5 S') && A('skill:powderKeg', 'A').includes('80 PX') && FBF_K.bigKeg.fuse === 1.5 && FBF_K.bigKeg.r === 80 && FBF_K.bigKeg.mul === 1.5);
  assert(A('skill:powderKeg', 'B').includes('45%') && FBF_K.threeKegs.mul === 0.45 && FBF_K.threeKegs.r === 38 && FBF_K.threeKegs.at.join() === '44,84,124' && FBF_K.threeKegs.fuse.join() === '0.8,1,1.2');
  assert(A('skill:heavySeas', 'A').includes('240') && FBF_K.tide.reach === 240 && FBF_K.tide.down === 2.0 && A('skill:heavySeas', 'B').includes('110') && FBF_K.undertow.reach === 110 && FBF_K.undertow.down === 1.6);
  assert(A('block', 'A').includes('0.55') && A('block', 'A').includes('0.28') && FBF_K.slip.cd === 0.55 && FBF_K.slip.perfect === 0.28);
  assert(A('ult', 'A').includes('150') && FBF_K.parley.r === 150 && FBF_K.parley.stoop === 3.3 && FBF_K.parley.mark === 4 && A('ult', 'B').includes('THREE BLOWS') && FBF_K.payday.k === 3 && FBF_K.payday.stoop === 1.2);
  assert(A('heavy', 'B').includes('36 PX') && FBF_K.splinter.r === 36 && FBF_K.splinter.mul === 0.5 && A('sig', 'A').includes('60%') && FBF_K.haul.cut === 0.6 && A('skill:keelhaul', 'A').includes('210')); });
check('main.js numbers on the cards: the roll, the cutlass, the boarding line, the pistol, the keelhaul', () => {
  for (const frag of ['P.dodge * 1.3', 'P.dodge * 0.75', "fb('fswift') ? 1.2 : 1", 'dmg * 0.9', 'dmg * 1.2); gainPlunder(6)', "fb('fquickboard') ? 560 : 420", "fb('fquickboard') ? 40 : 0", "fb('fgrapple') ? 2 : 1", "fb('flongshot') && bd >= 80 ? 1.3 : 1", 'gainPlunder(10)', "fb('fkeellong') ? 210 : 130", "fb('flongline') ? 176 : 96", "fb('fcoinpurse') ? 6 : 4", 'gainPlunder(10);   /* (claude/freefork) FULL PURSE', "fb('fsidestep') && !P.swim", 'P.fSideAt']) assert(main.includes(frag), 'main.js lacks ' + frag);
  assert(FB_FORKS.dash.A.teach.includes('30%') && FB_FORKS.dash.B.teach.includes('QUARTER') && FB_FORKS.chain.B.teach.includes('20%') && FB_FORKS.chain.A.teach.includes('20%') && FB_FORKS['skill:boarding'].A.teach.includes('40 PX') && FB_FORKS.heavy.A.teach.includes('80 PX')); });
check('FLAG OFF AST PROOF: src/main.js with every fb() read false is node-for-node the base (child process)', () => {
  const r = spawnSync(process.execPath, ['--expose-internals', new URL('./freebooter-flagoff-ast.mjs', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1').replace(/%20/g, ' ')], { encoding: 'utf8' });
  assert.equal(r.status, 0, (r.stdout || '') + (r.stderr || '')); assert(/PASSED/.test(r.stdout)); });
if (bad.length) { console.log('FREEBOOTER FORKS: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Freebooter forks: 11 rungs + 10 trait pairs (42 side ids), every side read by the effect code, flag off = base (main.js flag-off AST proof), PvP EVEN off, folded ids retire with the flag, bodies on a fake world, boss law holds, hook-catch verdicts unchanged without SLIPKNOT.');
