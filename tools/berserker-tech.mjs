// tools/berserker-tech.mjs - THE BERSERKER'S L25-L50 KIT (claude/berserkerpack). NODE ONLY: no browser, no page. Reads the data (src/tech-berserker.js), runs every pure rule in
// src/berserker-tech.js with real numbers, and reads src/main.js, src/berserker.js and src/lab.js as text to prove each technique and upgrade id is wired and every new blow is swordDmg x k.
// What only a browser shows (the look and sound of each tell, a real-key check) is listed in the lane report as owed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BERSERKER_TECH, BERSERKER_UPGRADES } from '../src/tech-berserker.js';
import * as B from '../src/berserker-tech.js';
import { BZ } from '../src/berserker.js';
import * as PR from '../src/progression.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const rd = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const MAIN = rd('../src/main.js'), LAB = rd('../src/lab.js'), BZS = rd('../src/berserker.js');
const ALL = PR.TECH_LEVELS.flatMap(n => PR.techniquesAt('berserker', n));
const TECH_ID_USED = id => MAIN.includes("tech('" + id + "')");

check('data: fixed 25/35/45, forks 30/40/50 with differing roles and one trade line, capstone pair, 8 upgrades, unique ids', () => {
  assert.deepEqual(PR.FORK_LEVELS, [30, 40, 50]); assert.deepEqual(Object.keys(BERSERKER_TECH).map(Number), PR.TECH_LEVELS); assert(PR.hasKit('berserker'));
  for (const n of [25, 35, 45]) assert(!PR.isFork('berserker', n), 'L' + n + ' fixed');
  for (const n of PR.FORK_LEVELS) { const [a, b] = PR.techniquesAt('berserker', n); assert(PR.isFork('berserker', n) && a.role && b.role && a.role !== b.role && a.trade && a.trade === b.trade, 'L' + n); }
  assert.deepEqual(PR.techniquesAt('berserker', 50).map(t => t.id), ['bptide', 'bpgreat']); assert(PR.techniquesAt('berserker', 50).every(t => t.capstone));
  assert.equal(BERSERKER_UPGRADES.length, 8); const ids = ALL.map(t => t.id).concat(BERSERKER_UPGRADES.map(u => u.id)); assert.equal(new Set(ids).size, ids.length);
  for (const t of ALL) { assert(t.name && t.what && t.teach && t.input, t.id); assert(t.k === null || (t.k > 0 && t.k <= 5.0), 'k ' + t.id); }
  for (const u of BERSERKER_UPGRADES) assert(u.what.length === 2 && u.what[0] && u.what[1], u.id);
  assert.equal(BERSERKER_TECH[25].k, B.BT.scent.mul); assert.equal(BERSERKER_TECH[35].k, B.BT.arm.mul); assert.equal(BERSERKER_TECH[45].k, B.BT.split.k);
  assert.equal(PR.techniquesAt('berserker', 50)[0].k, B.BT.tide.mul); assert.equal(PR.techniquesAt('berserker', 50)[1].k, B.BT.great.k);
});
check('every technique and upgrade id is read in main.js (tech() / upg()); COOL is cdOf', () => {
  for (const t of ALL) assert(TECH_ID_USED(t.id), 'tech id not read: ' + t.id);
  for (const u of BERSERKER_UPGRADES) assert(MAIN.includes("upg('" + u.id + "')"), 'upgrade id not read: ' + u.id);
});
check('L25 BLOOD SCENT: a kill out of a frenzy pays 15 rage and arms x1.2 for 3 s, once; nothing when not owned or in a frenzy', () => {
  assert.deepEqual(B.scentKill(true, false), { rage: 15, armed: true }); assert.deepEqual(B.scentKill(true, true), { rage: 0, armed: false }); assert.deepEqual(B.scentKill(false, false), { rage: 0, armed: false });
  assert.equal(B.scentMul(true, 10, 12.9), 1.2); assert.equal(B.scentMul(true, 10, 13.1), 1); assert.equal(B.scentMul(true, 0, 1), 1); assert.equal(B.scentMul(false, 10, 11), 1);
});
check('L30 A BRACED ROAR: small foes within 70 px only, never a boss/mini/elite', () => {
  const foes = [{ x: 150, dy: 0 }, { x: 175, dy: 10 }, { x: 171, dy: 0 }, { x: 120, dy: 0, big: true }, { x: 130, dy: 90 }];
  const t = B.roarTargets(foes, 100, true); assert.deepEqual(t, [foes[0]]); assert.deepEqual(B.roarTargets(foes, 100, false), []); assert.equal(B.BT.roar.iron, 1.5);
});
check('L30 B OPEN VEINS (+ RED TIDE): REND stacks from half a bar; the 4th cracks, the tide frenzy cracks on the 3rd; force and frenzy as shipped', () => {
  assert(!B.rendOn(false, false, 80, false) && B.rendOn(false, true, 0, false) && B.rendOn(false, false, 0, true));
  assert(B.rendOn(true, false, 50, false) && !B.rendOn(true, false, 49, false)); assert.equal(B.rendNeed(BZ.rend.n, false, true), 4); assert.equal(B.rendNeed(BZ.rend.n, true, true), 3); assert.equal(B.rendNeed(BZ.rend.n, true, false), 4);
});
check('L35 AXE ARM + HATCHET+: x1.3 stacks with the rank, the pick-up pays 15 rage (not in a frenzy)', () => {
  assert.equal(B.axeMul(false, 0), 1); assert(Math.abs(B.axeMul(true, 2) - 1.3 * 1.4) < 1e-9); assert.equal(B.axeMul(false, 2), 1.4); assert.equal(B.axePick(true, false), 15); assert.equal(B.axePick(true, true), 0); assert.equal(B.axePick(false, false), 0);
});
check('L40 A BULL BARGE: shove x1.5, 1.0 s down, 8 rage a foe; the shipped barge otherwise', () => {
  const base = { shove: BZ.roll.shove, stagger: BZ.roll.stagger }; assert.deepEqual(B.bargeNums(false, base), { shove: 200, stagger: 0.55, rage: 0 }); assert.deepEqual(B.bargeNums(true, base), { shove: 300, stagger: 1.0, rage: 8 });
});
check('L40 B CHAINED RAGE: +0.5 s a kill, 6 s at most per frenzy', () => {
  assert.equal(B.chainAdd(false, 0), 0); assert.equal(B.chainAdd(true, 0), 0.5); assert.equal(B.chainAdd(true, 5.8), 0.2 > 0 ? B.chainAdd(true, 5.8) : 0); assert(Math.abs(B.chainAdd(true, 5.8) - 0.2) < 1e-9); assert.equal(B.chainAdd(true, 6), 0); assert.equal(B.chainAdd(true, 9), 0);
});
check('L45 SPLINTERING HATCHET: up to 2 small foes within 40 px, nearest first, never the first or a boss', () => {
  const hit = { x: 100, y: 0 }, foes = [hit, { x: 120, y: 0 }, { x: 110, y: 5 }, { x: 138, y: 0 }, { x: 150, y: 0 }, { x: 105, y: 90 }, { x: 108, y: 0, big: true }];
  const t = B.splinterTargets(foes, hit, true); assert.equal(t.length, 2); assert.deepEqual(t, [foes[2], foes[1]]); assert(!t.includes(hit)); assert.deepEqual(B.splinterTargets(foes, hit, false), []); assert.deepEqual(B.splinterTargets(foes, { x: 100, y: 0, big: true }, true), []);
});
check('L50 A THE RED TIDE: 10 s frenzy (+LONG), chops x1.25 only in the frenzy, take x1.35 (THICK SKIN+ trims it), BLOOD PRICE+ heals more', () => {
  assert.equal(B.frenzyLen(8, 3, false), 11); assert.equal(B.frenzyLen(8, 0, true), 10); assert.equal(B.frenzyLen(8, 3, true), 13); assert.equal(B.tideMul(true, true), 1.25); assert.equal(B.tideMul(true, false), 1); assert.equal(B.tideMul(false, true), 1);
  assert.equal(B.frenzyTake(1.25, false, 0), 1.25); assert.equal(B.frenzyTake(1.25, true, 0), 1.35); assert(Math.abs(B.frenzyTake(1.25, true, 2) - 1.25) < 1e-9); assert(Math.abs(B.frenzyTake(1.25, false, 2) - 1.15) < 1e-9);
  assert(Math.abs(B.frenzyHeal(0.025, 2) - 0.0375) < 1e-9);
});
check('L50 B THE GREAT AXE: needs a full bar, no frenzy, no hatchet out; out 0.8 s at x3.0 then home at x1.5; one boss hit per leg paper bound', () => {
  assert(B.greatReady(true, 100, false, false) && !B.greatReady(true, 99, false, false) && !B.greatReady(true, 100, true, false) && !B.greatReady(true, 100, false, true) && !B.greatReady(false, 100, false, false));
  assert.equal(B.greatLeg(0.5), 'out'); assert.equal(B.greatLeg(0.8), 'back'); assert.equal(B.greatK('out'), 3.0); assert.equal(B.greatK('back'), 1.5);
  assert(B.BT.great.k + B.BT.great.back <= 4.5, 'a boss in the whole path takes at most 4.5 swords: ' + (B.BT.great.k + B.BT.great.back)); assert(B.BT.great.speed * B.BT.great.out < 300, 'reach stays inside a screen');
});
check('upgrades: ranked multipliers move the right way and clamp', () => {
  assert.equal(B.upMul('stoke', 2), 1.2); assert.equal(B.upMul('split', 9), 1.3); assert.equal(B.upMul('drain', 2), 0.6); assert.equal(B.upMul('price', -1), 1); assert.equal(B.takeBeat(2), 0.06); assert.equal(B.takeBeat(0), 0); assert.equal(B.thickCut(1), 0.05); assert.equal(B.coolCut(2), 1);
});
check('law: every new blow is swordDmg x k (no flat hits); a boss is never splintered, staggered or pinned; no new heal', () => {
  const calls = BZS.match(/api\.hurtAs\('shot', [qe], [^;]*BTK\.(BT\.split\.k|greatK)[^;]*;/g) || []; assert(calls.length >= 2, 'new blows found: ' + calls.length);
  for (const c of calls) assert(/api\.swordDmg\(\) \*/.test(c), 'blow: ' + c.slice(0, 90));
  assert(/psplit && !\(e\.maxHp \|\| e\.mini \|\| e\.elite \|\| e\.big\)/.test(BZS), 'the splinter skips a boss struck'); assert(/big: !!\(x\.maxHp \|\| x\.mini \|\| x\.elite \|\| x\.big\)/.test(BZS), 'and never picks one');
  assert(/big: !!\(e\.maxHp \|\| e\.mini \|\| e\.elite \|\| e\.big\)/.test(BZS), 'the roar reels no boss');
  const great = BZS.slice(BZS.indexOf('function stepGreat'), BZS.indexOf('THE SHOULDER ROLL')); assert(!/stagger|pinFoe|floorFoe|p\.hp \+=/.test(great), 'the great axe: damage only');
  assert(!/p\.hp = Math\.min\(p\.maxHp[^;]*;[^;]*BTK\.scent/.test(BZS)); assert(BZS.includes("p.hp = Math.min(p.maxHp, p.hp + whole)"), 'the one shipped heal is still there');
});
check('wiring: capstone picks, UP+C great axe, DOWN+C frenzy stays, HUD + bot, tide in the swing, COOL in cdOf, bzTal passes every pick', () => {
  assert(BZS.includes('greatAxe(p);') && BZS.includes('BTK.greatReady(!!t.pgreat'), 'great axe press'); assert(BZS.includes("keys.down && (p.ground || p.swim) && (p.rage || 0) >= 100 && !(p.frenzyT > 0)) frenzy(p, free)"), 'frenzy untouched');
  assert(BZS.includes("p.bzCap = t.pgreat ? 'great' : t.ptide ? 'tide' : ''")); assert(MAIN.includes('BZK.chopLanded(e) * BZK.tideMul()')); assert(MAIN.includes("coolCut(upg('bucool'))"));
  assert(MAIN.includes("'GREAT AXE: UP+C  FRENZY: DOWN+C'") && MAIN.includes("'RED TIDE: DOWN+C'") && MAIN.includes("'FRENZY: DOWN+C'"));
  assert(/Z\.cap === 'great' && !\(Z\.frenzyT > 0\) && Z\.rage >= 100/.test(LAB), 'bot casts the great axe'); assert(/p\.bzGreat = null; p\.bzScentAt = 0/.test(BZS), 'clear() resets');
});
check('a save with the kit: respec + picks owed still balance for the berserker, forks lock the other side', () => {
  const p = { card: { berserker: { v: 0, e: 0, m: 0, ms: {} } } }; for (const n of PR.TECH_LEVELS) { const o = PR.perkOffer(p, 'berserker', n); assert(o[0].tech && o[0].rec); assert.equal(PR.pickMilestone(p, 'berserker', n, o[0].id, 50), null); }
  assert.equal(PR.techOn(p, 'berserker', 'bptide'), true); assert(PR.forkLocked(p, 'berserker', 'bpgreat'));
  PR.validateProgress(JSON.parse(JSON.stringify(p))); PR.respecCard(p, 'berserker'); assert.deepEqual(p.card.berserker.ms, {});
  const q = { card: { berserker: { v: 0, e: 0, m: 0, ms: {} } } }; for (const [n, id] of [[25, 'bpscent'], [30, 'bprend'], [35, 'bparm'], [40, 'bpchain'], [45, 'bpsplit'], [50, 'bpgreat']]) PR.pickMilestone(q, 'berserker', n, id, 50);
  for (const id of ['bpscent', 'bprend', 'bparm', 'bpchain', 'bpsplit', 'bpgreat']) assert(PR.techOn(q, 'berserker', id), id); for (const id of ['bproar', 'bpbull', 'bptide']) assert(PR.forkLocked(q, 'berserker', id), id);
});
if (bad.length) { console.log('BERSERKER-TECH: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Berserker tech: 3 fixed + 3 forks (pairs differ in role, one trade line, capstone pair), 8 upgrades, every rule with real numbers, every id wired in main.js, new blows are swordDmg x k, bosses never splintered/pinned by a new technique, the shipped frenzy and heal untouched.');
