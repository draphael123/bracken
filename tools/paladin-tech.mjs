// tools/paladin-tech.mjs - THE PALADIN'S L25-L50 KIT (claude/paladinpack). NODE ONLY: no browser, no page. Reads the data (src/tech-paladin.js), runs every pure rule in
// src/paladin-tech.js with real numbers, and reads src/main.js and src/lab.js as text to prove each technique and upgrade id is wired and every new blow is swordDmg x k.
// What only a browser shows (the look and sound of each tell, a real-key check) is listed in the lane report as owed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PALADIN_TECH, PALADIN_UPGRADES } from '../src/tech-paladin.js';
import * as B from '../src/paladin-tech.js';
import { HG } from '../src/holy-ground.js';
import * as PR from '../src/progression.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const rd = p => readFileSync(new URL(p, import.meta.url), 'utf8');
const MAIN = rd('../src/main.js'), LAB = rd('../src/lab.js');
const ALL = PR.TECH_LEVELS.flatMap(n => PR.techniquesAt('paladin', n));
const TECH_ID_USED = id => MAIN.includes("tech('" + id + "')");
const section = (a, b) => { const i = MAIN.indexOf(a); assert(i >= 0, 'missing ' + a); const j = MAIN.indexOf(b, i); assert(j > i, 'missing ' + b); return MAIN.slice(i, j); };

check('data: fixed 25/35/45, forks 30/40/50 with differing roles and one trade line, capstone pair, 8 upgrades, unique ids', () => {
  assert.deepEqual(PR.FORK_LEVELS, [30, 40, 50]); assert.deepEqual(Object.keys(PALADIN_TECH).map(Number), PR.TECH_LEVELS); assert(PR.hasKit('paladin'));
  for (const n of [25, 35, 45]) assert(!PR.isFork('paladin', n), 'L' + n + ' fixed');
  for (const n of PR.FORK_LEVELS) { const [a, b] = PR.techniquesAt('paladin', n); assert(PR.isFork('paladin', n) && a.role && b.role && a.role !== b.role && a.trade && a.trade === b.trade, 'L' + n); }
  assert.deepEqual(PR.techniquesAt('paladin', 50).map(t => t.id), ['ppnoon', 'pplance']); assert(PR.techniquesAt('paladin', 50).every(t => t.capstone));
  assert.equal(PALADIN_UPGRADES.length, 8); const ids = ALL.map(t => t.id).concat(PALADIN_UPGRADES.map(u => u.id)); assert.equal(new Set(ids).size, ids.length);
  for (const t of ALL) { assert(t.name && t.what && t.teach && t.input, t.id); assert(t.k === null || (t.k > 0 && t.k <= 5.0), 'k ' + t.id); }
  for (const u of PALADIN_UPGRADES) assert(u.what.length === 2 && u.what[0] && u.what[1], u.id);
  assert.equal(PALADIN_TECH[25].k, B.PT.steel.mul); assert.equal(PR.techniquesAt('paladin', 30)[0].k, B.PT.nova.k); assert.equal(PR.techniquesAt('paladin', 30)[1].k, B.PT.brand.mul); assert.equal(PALADIN_TECH[35].k, B.PT.home.mul);
  assert.equal(PR.techniquesAt('paladin', 40)[1].k, B.PT.pillar.mul); assert.equal(PR.techniquesAt('paladin', 50)[0].k, B.PT.noon.blow); assert.equal(PR.techniquesAt('paladin', 50)[1].k, B.PT.lance.k);
});
check('every technique and upgrade id is read in main.js (tech() / upg())', () => {
  for (const t of ALL) assert(TECH_ID_USED(t.id), 'tech id not read: ' + t.id);
  for (const u of PALADIN_UPGRADES) assert(MAIN.includes("upg('" + u.id + "')"), 'upgrade id not read: ' + u.id);
});
check('L25 HALLOWED STEEL: x1.3 for 3 s after a perfect guard, once; nothing when not owned or never armed', () => {
  assert.equal(B.steelMul(true, 10, 12.9), 1.3); assert.equal(B.steelMul(true, 10, 13.1), 1); assert.equal(B.steelMul(true, 0, 1), 1); assert.equal(B.steelMul(false, 10, 11), 1);
});
check('L30 A WARD NOVA: every third turned blow; small foes within 56 px and 40 px up/down', () => {
  assert(!B.novaDue(true, 0) && !B.novaDue(true, 1) && !B.novaDue(true, 2) && B.novaDue(true, 3) && B.novaDue(true, 6) && !B.novaDue(false, 3));
  const foes = [{ x: 150, y: 100 }, { x: 175, y: 120 }, { x: 160, y: 100 }, { x: 130, y: 190 }]; assert.deepEqual(B.novaTargets(foes, 100, 100), [foes[0]]); assert.equal(B.PT.nova.k, 0.5);
});
check('L30 B BRANDING LIGHT: x1.25 inside 4 s, spent by the blow (main sets it to 0), only when owned', () => {
  assert.equal(B.brandUntil(false, 5), 0); assert.equal(B.brandUntil(true, 5), 9); assert.equal(B.brandMul(true, 9, 8.9), 1.25); assert.equal(B.brandMul(true, 9, 9.1), 1); assert.equal(B.brandMul(true, 0, 1), 1); assert.equal(B.brandMul(false, 9, 1), 1);
});
check('L35 HAMMER HOMECOMING: x1.3 only on the way back; the catch pays a pip only after a strike', () => {
  assert.equal(B.homeMul(true, true), 1.3); assert.equal(B.homeMul(true, false), 1); assert.equal(B.homeMul(false, true), 1); assert.equal(B.homePip(true, 1), 1); assert.equal(B.homePip(true, 0), 0); assert.equal(B.homePip(false, 3), 0);
});
check('L40 A SUNSTEP + STEP+: x1.25 faster, patch x1.75 and the rank multiplies', () => {
  assert.equal(B.stepSpeed(HG.step.speed, false), 240); assert.equal(B.stepSpeed(HG.step.speed, true), 300); assert.equal(B.patchLife(2, false, 0), 2); assert.equal(B.patchLife(2, true, 0), 3.5); assert(Math.abs(B.patchLife(2, true, 2) - 5.25) < 1e-9); assert.equal(B.patchLife(2, false, 2), 3);
});
check('L40 B PILLAR UNBOUND: r 30 -> 46, x0.6 -> x0.9, aura 2 -> 4 s; the base untouched without it', () => {
  assert.deepEqual(B.pillar(HG.dawn, false), HG.dawn); const p = B.pillar(HG.dawn, true); assert.equal(p.r, 46); assert.equal(p.mul, 0.9); assert.equal(p.aura, 4); assert.equal(p.stagger, HG.dawn.stagger); assert.equal(p.dy, HG.dawn.dy); assert.equal(HG.dawn.r, 30);
});
check('L45 JUDGE EYE: verdict 110 -> 160 px and 4 -> 6 sigils; one pip a cast on a big foe', () => {
  assert.deepEqual(B.verdictNums(HG.verdict, false), HG.verdict); const v = B.verdictNums(HG.verdict, true); assert.equal(v.reach, 160); assert.equal(v.max, 6); assert.equal(v.mul, HG.verdict.mul); assert.equal(HG.verdict.reach, 110);
  assert.equal(B.eyePip(true, true, false), 1); assert.equal(B.eyePip(true, true, true), 0); assert.equal(B.eyePip(true, false, false), 0); assert.equal(B.eyePip(false, true, false), 0);
});
check('L50 A THE LONG NOON: x1.25 blows and x0.8 taken only while it runs, and never invulnerable', () => {
  assert.equal(B.noonBlow(true, 3), 1.25); assert.equal(B.noonBlow(true, 0), 1); assert.equal(B.noonBlow(false, 3), 1); assert.equal(B.noonTake(true, 3), 0.8); assert.equal(B.noonTake(true, 0), 1); assert.equal(B.noonTake(false, 3), 1);
  assert(B.PT.noon.take >= 0.6, 'no more than the mitigation floor'); assert.equal(B.PT.noon.t, 8);
});
check('L50 B HEAVEN LANCES: five pips only; five lances spread nearest first, 3 at most on one foe, a lone boss takes 3, none behind him', () => {
  assert(B.lanceReady(true, 5) && !B.lanceReady(true, 4) && !B.lanceReady(false, 5));
  const boss = { x: 150 }, a = { x: 120 }, b = { x: 200 }, behind = { x: 40 }, far = { x: 500 };
  assert.deepEqual(B.lanceTargets([boss], 100, 1), [boss, boss, boss, null, null]);
  const t2 = B.lanceTargets([b, a, behind, far], 100, 1); assert.equal(t2.length, 5); assert.deepEqual(t2.slice(0, 2), [a, b]); assert(!t2.includes(behind) && !t2.includes(far)); for (const f of [a, b]) assert(t2.filter(x => x === f).length <= 3);
  assert.deepEqual(B.lanceTargets([], 100, 1), [null, null, null, null, null]); assert.deepEqual(B.lanceTargets([a, b], 100, -1), [null, null, null, null, null]);
  assert(B.PT.lance.k * B.PT.lance.cap <= 4.5, 'a boss in the room takes at most 4.5 swords: ' + B.PT.lance.k * B.PT.lance.cap);
});
check('upgrades: ranked multipliers move the right way and clamp', () => {
  assert.equal(B.upMul('faith', 2), 1.2); assert.equal(B.upMul('ward', 2), 0.7); assert.equal(B.upMul('hammer', 9), 1.4); assert.equal(B.upMul('smite', -1), 1); assert.equal(B.truePips(2), 1); assert.equal(B.truePips(0), 0); assert.equal(B.auraAdd(1), 1); assert.equal(B.coolCut(2), 1);
});
check('law: every new blow is swordDmg x k (no flat hits); a boss/mini/elite is never staggered by a new technique; no new heal; no untouchable', () => {
  const kit = section("/* ==== THE PALADIN'S L25-L50 KIT", '/* (PALADIN 4, Daniel 10-15 ~18:20) EVERY PIP COUNTS');
  assert(kit.includes('const dmg = Math.round(swordDmg() * N.k);') && kit.includes("hurtAs('light', e, dmg,"), 'nova: swordDmg x k'); assert(kit.includes("hurtAs('heavy', e, Math.round(swordDmg() * PALPK.PT.lance.k)"), 'lance: swordDmg x k'); assert.equal(kit.split('hurtAs(').length - 1, 2, 'two new blows only');
  assert.equal((kit.match(/e\.stagger = /g) || []).length, 2); for (const m of kit.match(/if \(e\.alive[^;]*e\.stagger = [^;]*;/g)) assert(/!e\.maxHp && !e\.mini && !e\.elite/.test(m), 'stagger guard: ' + m.slice(0, 80));
  assert(!/p?\.?hp \+=|P\.hp = Math\.min|P\.inv\b|P\.grace|divineT/.test(kit), 'no heal, no invulnerability in the kit block');
  assert(MAIN.includes("PALPK.noonTake(tech('ppnoon'), P.noonT)"), 'the noon trims the take'); assert(B.PT.noon.take > 0);
  const sm = section('function smiteStrike(second)', 'function smiteQ()'); assert(sm.includes('PALPK.brandUntil(tech(') && !/e\.hp = /.test(sm));
});
check('wiring: lances on UP+C at five pips (the hammer otherwise), noon on the SUNFALL tap, HUD, bot, COOL, FAITH, aura, step, pillar, verdict, parry', () => {
  assert(MAIN.includes("if (PALPK.lanceReady(tech('pplance'), pipsOf(P))) castLances(); else castHammer();"), 'UP+C'); assert(MAIN.includes("castJudgement(); hallowAura(5); if (tech('ppnoon')) startNoon();"), 'noon on SUNFALL');
  assert(MAIN.includes("'LANCES: UP+C  SUNFALL: C'") && MAIN.includes("'LONG NOON: C'") && MAIN.includes("'SUNFALL: C'"), 'HUD'); assert(MAIN.includes("P.palCap = tech('pplance') ? 'lances'"), 'bot reads the capstone');
  assert(/P\.palCap==='lances'&&lt>=100/.test(LAB), 'bot casts the lances'); assert(MAIN.includes("coolCut(upg('pucool'))") && MAIN.includes("upMul('faith', upg('pufaith'))") && MAIN.includes("auraAdd(upg('pulong'))"));
  assert(MAIN.includes("stepSpeed(S.speed, tech('ppsun'))") && MAIN.includes("patchLife(") && MAIN.includes("PALPK.pillar(HG.dawn, tech('ppdawn'))") && MAIN.includes("verdictNums(HG.verdict, tech('ppeye'))"));
  assert(MAIN.includes("truePips(upg('putrue'))") && MAIN.includes("if (tech('ppsteel')) P.palSteelAt = time;") && MAIN.includes("novaDue(tech('ppnova'), P.wardBlocks)") && MAIN.includes("upMul('ward', upg('puward'))") && MAIN.includes("upMul('hammer', upg('puhammer'))") && MAIN.includes("upMul('smite', upg('pusmite'))"));
  assert(MAIN.includes('if (isPaladin()) mul *= palBlowMul(e);')); assert(MAIN.includes("homeMul(m.home, m.t >= 0.7)") && MAIN.includes('homePip(m.home, m.struck)'));
  assert(!ALL.some(t => /FINISHER|THIRD HIT|3RD HIT|COMBO/i.test(t.name + ' ' + t.what + ' ' + t.input)), 'the combo finisher smite (claude/palsmite) is not duplicated here');
});
check('a save with the kit: respec + picks owed still balance for the paladin, forks lock the other side', () => {
  const p = { card: { paladin: { v: 0, e: 0, m: 0, ms: {} } } }; for (const n of PR.TECH_LEVELS) { const o = PR.perkOffer(p, 'paladin', n); assert(o[0].tech && o[0].rec); assert.equal(PR.pickMilestone(p, 'paladin', n, o[0].id, 50), null); }
  assert.equal(PR.techOn(p, 'paladin', 'ppnoon'), true); assert(PR.forkLocked(p, 'paladin', 'pplance'));
  PR.validateProgress(JSON.parse(JSON.stringify(p))); PR.respecCard(p, 'paladin'); assert.deepEqual(p.card.paladin.ms, {});
  const q = { card: { paladin: { v: 0, e: 0, m: 0, ms: {} } } }; for (const [n, id] of [[25, 'ppsteel'], [30, 'ppbrand'], [35, 'pphome'], [40, 'ppdawn'], [45, 'ppeye'], [50, 'pplance']]) PR.pickMilestone(q, 'paladin', n, id, 50);
  for (const id of ['ppsteel', 'ppbrand', 'pphome', 'ppdawn', 'ppeye', 'pplance']) assert(PR.techOn(q, 'paladin', id), id); for (const id of ['ppnova', 'ppsun', 'ppnoon']) assert(PR.forkLocked(q, 'paladin', id), id);
});
if (bad.length) { console.log('PALADIN-TECH: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('Paladin tech: 3 fixed + 3 forks (pairs differ in role, one trade line, capstone pair), 8 upgrades, every rule with real numbers, every id wired in main.js, new blows are swordDmg x k, bosses never staggered by a new technique, no new heal, the combo finisher smite not duplicated.');
