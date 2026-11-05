// tools/freebooter-tech.mjs - THE FREEBOOTER'S L25-L50 KIT (claude/freebooterpack). NODE ONLY: no browser, no page. Reads the data (src/tech-freebooter.js), runs every pure rule in
// src/freebooter-tech.js with real numbers, and reads src/main.js + src/lab.js as text to prove each technique and upgrade id is wired and every new blow is swordDmg x k x amul.
// What only a browser shows (the look and sound of each tell, a real-key check) is listed in the lane report as owed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FREEBOOTER_TECH, FREEBOOTER_UPGRADES } from '../src/tech-freebooter.js';
import * as F from '../src/freebooter-tech.js';
import * as PR from '../src/progression.js';
import { CATCH, catchVerdict, seedVerdict } from '../src/hook-catch.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), LAB = readFileSync(new URL('../src/lab.js', import.meta.url), 'utf8');
const ALL = PR.TECH_LEVELS.flatMap(n => PR.techniquesAt('pirate', n));

check('data: fixed 25/35/45, forks 30/40/50 with differing roles and one trade line, capstone pair, 8 upgrades, unique ids', () => {
  assert.deepEqual(PR.FORK_LEVELS, [30, 40, 50]); assert.deepEqual(Object.keys(FREEBOOTER_TECH).map(Number), PR.TECH_LEVELS); assert(PR.hasKit('pirate'));
  for (const n of [25, 35, 45]) assert(!PR.isFork('pirate', n), 'L' + n + ' fixed');
  for (const n of PR.FORK_LEVELS) { const [a, b] = PR.techniquesAt('pirate', n); assert(PR.isFork('pirate', n) && a.role && b.role && a.role !== b.role && a.trade && a.trade === b.trade, 'L' + n); }
  assert.deepEqual(PR.techniquesAt('pirate', 50).map(t => t.id), ['fraid', 'fkeg']); assert(PR.techniquesAt('pirate', 50).every(t => t.capstone));
  assert.equal(FREEBOOTER_UPGRADES.length, 8); const ids = ALL.map(t => t.id).concat(FREEBOOTER_UPGRADES.map(u => u.id)); assert.equal(new Set(ids).size, ids.length);
  for (const t of ALL) { assert(t.name && t.what && t.teach && t.input, t.id); assert(t.k === null || (t.k > 0 && t.k <= 5.0), 'k ' + t.id); }
  for (const u of FREEBOOTER_UPGRADES) assert(u.what.length === 2 && u.what[0] && u.what[1], u.id);
  assert.equal(FREEBOOTER_TECH[25].k, F.FT.steel.mul); assert.equal(PR.techniquesAt('pirate', 30)[1].k, F.FT.haul.k); assert.equal(FREEBOOTER_TECH[35].k, F.FT.long.mul);
  assert.equal(FREEBOOTER_TECH[45].k, F.FT.splinter.k); assert.equal(PR.techniquesAt('pirate', 50)[0].k, F.FT.raid.mul); assert.equal(PR.techniquesAt('pirate', 50)[1].k, F.FT.keg.k);
});
check('every technique and upgrade id is read in main.js (tech() / upg())', () => {
  for (const t of ALL) assert(MAIN.includes("tech('" + t.id + "')"), 'tech id not read: ' + t.id);
  for (const u of FREEBOOTER_UPGRADES) assert(MAIN.includes("upg('" + u.id + "')"), 'upgrade id not read: ' + u.id);
});
check('L25 STEEL AFTER SMOKE: only the first cut into a ball-marked foe, only when owned', () => {
  assert.deepEqual(F.steelCut(true, true, true), { mul: 1.2, plunder: 6 }); assert.deepEqual(F.steelCut(true, true, false), { mul: 1, plunder: 0 }); assert.deepEqual(F.steelCut(true, false, true), { mul: 1, plunder: 0 }); assert.deepEqual(F.steelCut(false, true, true), { mul: 1, plunder: 0 });
});
check('L30 A SLIPKNOT: the catch is back sooner and the perfect beat longer; the verdicts honour the beat; not owned = the shipped numbers', () => {
  const b = F.catchNums(false, CATCH), a = F.catchNums(true, CATCH); assert.deepEqual(b, { cd: CATCH.cd, perfect: CATCH.perfect }); assert(a.cd < b.cd && a.perfect > b.perfect && a.perfect < CATCH.snap);
  assert.equal(catchVerdict({ age: 0.25, dmg: 10 }), 'block'); assert.equal(catchVerdict({ age: 0.25, dmg: 10, perfect: a.perfect }), 'perfect'); assert.equal(catchVerdict({ age: 0.3, dmg: 10, perfect: a.perfect }), 'block');
  assert.equal(seedVerdict({ age: 0.25 }), 'drop'); assert.equal(seedVerdict({ age: 0.25, perfect: a.perfect }), 'fling'); assert.equal(catchVerdict({ age: 0.1, red: true, perfect: a.perfect }), 'none');
  assert.equal(F.catchCost(10, 2), 7.5); assert.equal(F.catchCost(10, 0), 10);
});
check('L30 B HAUL AND BALL: a cut at x0.6, a mark, the next ball seated; nothing when not owned', () => {
  assert.deepEqual(F.haulNums(true), { k: 0.6, mark: 2.5, ball: true }); assert.deepEqual(F.haulNums(false), { k: 0, mark: 0, ball: false });
});
check('L35 LONG SHOT / HOT BALL: from 80 px x1.3 and +10 plunder, point-blank the old shot; HOT BALL stacks', () => {
  assert.deepEqual(F.shotFar(true, 90), { mul: 1.3, plunder: 10 }); assert.deepEqual(F.shotFar(true, 40), { mul: 1, plunder: 0 }); assert.deepEqual(F.shotFar(false, 200), { mul: 1, plunder: 0 });
  assert(Math.abs(F.ballMul(2, F.shotFar(true, 100)) - 1.16 * 1.3) < 1e-9); assert.equal(F.ballMul(0, F.shotFar(false, 100)), 1);
});
check('L40 A HIGH TIDE / B QUICK BOARD: reach x1.5, small foes down 2 s, up to 3 coins; board cd x0.5, +40 px', () => {
  assert.deepEqual(F.tideNums(false, 160), { reach: 160, stagger: 1.3, coins: 0 }); assert.deepEqual(F.tideNums(true, 160), { reach: 240, stagger: 2.0, coins: 3 });
  assert.equal(F.boardCd(6, true), 3); assert.equal(F.boardCd(6, false), 6); assert.equal(F.boardReach(100, true), 140); assert.equal(F.boardReach(100, false), 100);
});
check('L45 SPLINTER SHOT: up to 3 small foes within 36 px of the one hit, never the first, never a boss', () => {
  const hit = { x: 100, y: 0 }, foes = [hit, { x: 110, y: 0 }, { x: 120, y: 10 }, { x: 130, y: 0 }, { x: 134, y: 0 }, { x: 150, y: 0 }, { x: 105, y: 90 }, { x: 108, y: 0, big: true }];
  const t = F.splinterTargets(foes, hit, true); assert.equal(t.length, 3); assert(!t.includes(hit) && !t.includes(foes[5]) && !t.includes(foes[6]) && !t.includes(foes[7])); assert.deepEqual(F.splinterTargets(foes, hit, false), []); assert.deepEqual(F.splinterTargets([hit], hit, true), []);
});
check('upgrades: ranked multipliers move the right way and clamp', () => {
  assert.equal(F.purseGain(10, 2), 14); assert.equal(F.upMul('cut', 2), 1.12); assert.equal(F.upMul('broad', 9), 1.24); assert.equal(F.upMul('hook', -1), 1); assert.equal(F.hookReach(100, 2), 140);
  assert.equal(F.kegCd(9, 2), 9 * 0.7); assert(Math.abs(F.reloadOf(8, 2, false) - 5.6) < 1e-9); assert.equal(F.reloadOf(8, 2, true), 0.35); assert.equal(F.reloadOf(0.2, 0, true), 0.2, 'never slower than the base');
});
check('L50 A THE RAIDING HOUR: x1.25 only while it runs; the whole raid stays within a measured paper bound', () => {
  assert.equal(F.raidMul(false), 1); assert.equal(F.raidMul(true), 1.25); assert(F.FT.raid.t <= 7 && F.FT.raid.reload >= 0.3);
});
check('L50 B THE GREAT KEG: shot = bigger and wider; a boss takes damage only; the keg in the ball line is found, rolls and stops at a wall', () => {
  const t = F.kegBlast(false, false), s = F.kegBlast(true, false), b = F.kegBlast(true, true); assert(s.k > t.k && s.r > t.r); assert(t.knock > 0 && t.stagger > 0); assert.equal(b.knock, 0); assert.equal(b.stagger, 0); assert.equal(b.k, s.k);
  const k1 = { x: 140, y: 100, great: true }, k2 = { x: 120, y: 100, great: true, boom: true }, k3 = { x: 130, y: 100 };
  assert.equal(F.kegInLine([k1, k2, k3], 100, 88, 1, 150), k1); assert.equal(F.kegInLine([k1], 100, 88, -1, 150), null); assert.equal(F.kegInLine([k1], 100, 88, 1, 30), null); assert.equal(F.kegInLine([k1], 100, 20, 1, 150), null, 'a different height');
  assert(F.kegRolling(0.5, false) && !F.kegRolling(0.5, true) && !F.kegRolling(1.3, false));
  const sw = F.FT.keg.k, shotSw = F.FT.keg.shotK; assert(sw <= 4.0 && shotSw <= 5.5, 'one blow on a boss: ' + sw + ' / ' + shotSw + ' swords');
});
check('law: every new blow in main.js is swordDmg x k x amul (no flat hits), bosses get no new stagger or pin', () => {
  const body = name => { const i = MAIN.indexOf('function ' + name + '('); assert(i > 0, name); const j = MAIN.indexOf('\nfunction ', i + 10); return MAIN.slice(i, j > 0 ? j : i + 3000); };
  const b = body('greatKegBlast'); const calls = b.match(/hurtAs\([^;]*;/g) || []; assert(calls.length > 0); for (const c of calls) assert(/swordDmg\(\) \*/.test(c) && /amul\(/.test(c), 'keg: ' + c.slice(0, 90)); assert(!/pinFoe|floorFoe/.test(b)); assert(/b\.stagger > 0/.test(b), 'the stagger is the blast row (zero for a boss)');
  assert(/hurtAs\('shot', t, Math\.max\(1, Math\.round\(swordDmg\(\) \* FTK\.FT\.splinter\.k \* amul\(/.test(MAIN), 'splinter'); assert(/hurtAs\('light', foe, Math\.max\(1, Math\.round\(swordDmg\(\) \* hn\.k \* amul\(/.test(MAIN), 'haul');
  assert(/splinterTargets\(kitFoes\(\)\.filter\(q => !\(lcBig\(q\) \|\| q\.maxHp \|\| q\.mini\)\)/.test(MAIN), 'the splinter never picks a boss');
  assert(!/pirateRaid\(\)\s*\{[^}]*heal|pirateGreatKeg\(\)\s*\{[^}]*hp \+=/.test(MAIN), 'no heal');
});
check('wiring: the ultimate picks the capstone and a plain C stays the hook catch; hud + bot + the old Black Flag untouched without a pick', () => {
  assert(MAIN.includes("if (cDown && free && P.plunder >= 100 && !P.fbCap) { blackFlag();")); assert(MAIN.includes("cDown && keys.up && free && P.plunder >= 100 && P.fbCap && (P.ground || P.swim)"));
  assert(MAIN.includes("if (P.fbCap === 'keg') pirateGreatKeg(); else pirateRaid();")); assert(MAIN.includes("'GREAT KEG: UP+C'") && MAIN.includes("'RAIDING HOUR: UP+C'") && MAIN.includes("'BLACK FLAG: C'"));
  assert(/h === 'pirate'\) return \(P\.plunder \|\| 0\) >= 100 && !!P\.fbCap/.test(LAB) && /h === 'ranger' \|\| h === 'pirate'\) && !threat/.test(LAB) && /h === 'ranger' \|\| h === 'pirate'\) && !tell && !rushing/.test(LAB));
  assert(MAIN.includes('greatKegBlast(gk, true)') && MAIN.includes("P.fbCap = tech('fkeg') ? 'keg' : tech('fraid') ? 'raid' : ''"));
  assert(MAIN.includes('perfect: fbCatch().perfect'));
});
check('a save with the kit: respec + picks owed still balance for the freebooter, forks lock the other side', () => {
  const p = { card: { pirate: { v: 0, e: 0, m: 0, ms: {} } } }; for (const n of PR.TECH_LEVELS) { const o = PR.perkOffer(p, 'pirate', n); assert(o[0].tech && o[0].rec); assert.equal(PR.pickMilestone(p, 'pirate', n, o[0].id, 50), null); }
  assert.equal(PR.techOn(p, 'pirate', 'fraid'), true); assert(PR.forkLocked(p, 'pirate', 'fkeg'));
  PR.validateProgress(JSON.parse(JSON.stringify(p))); PR.respecCard(p, 'pirate'); assert.deepEqual(p.card.pirate.ms, {});
  const q = { card: { pirate: { v: 0, e: 0, m: 0, ms: {} } } }; for (const [n, id] of [[25, 'fsteel'], [30, 'fhaul'], [35, 'flong'], [40, 'fquick'], [45, 'fsplinter'], [50, 'fkeg']]) PR.pickMilestone(q, 'pirate', n, id, 50);
  for (const id of ['fsteel', 'fhaul', 'flong', 'fquick', 'fsplinter', 'fkeg']) assert(PR.techOn(q, 'pirate', id), id); for (const id of ['fslip', 'ftide', 'fraid']) assert(PR.forkLocked(q, 'pirate', id), id);
});
if (bad.length) { console.log('FREEBOOTER-TECH: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Freebooter tech: 3 fixed + 3 forks (pairs differ in role, one trade line, capstone pair), 8 upgrades, every rule with real numbers, every id wired in main.js, blows are swordDmg x k x amul, bosses never pinned or staggered by a new technique, the bot fires the ultimate');
