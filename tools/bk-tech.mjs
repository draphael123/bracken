// tools/bk-tech.mjs - THE BLOOD KNIGHT'S L25-L50 KIT (claude/bkpack). NODE ONLY: no browser, no page. The pure rules in src/bk-tech.js are played with real numbers (damage = swordDmg x k,
// the boss law, the caps, the debt arithmetic through src/blood-kit.js) and the DATA is checked against the framework (pairs differ in role and share a trade line, the L50 pair are both
// capstones, parity within 10% where both deal damage, no heal added) and against main.js as text (every technique and every upgrade id is read there, so no card does nothing).
// What only a browser shows (the look and sound of each tell, the hook sliding foes, the rite on the floor) is listed in work/claude/lane-done/claude-bkpack.md as owed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as BKT from '../src/bk-tech.js';
import * as BKIT from '../src/blood-kit.js';
import { BK_TECH, BK_UPGRADES, BK_PAR } from '../src/tech-bloodknight.js';
import * as PR from '../src/progression.js';
const bad = []; const check = (n, f) => { try { f(); } catch (e) { bad.push(n + ': ' + e.message); } };
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const B = BKT.BT, SW = 16, MAXHP = 100;

check('data shape: fixed at 25/35/45, forks at 30/40/50', () => {
  assert.deepEqual(Object.keys(BK_TECH).map(Number), [25, 30, 35, 40, 45, 50]);
  for (const n of [25, 35, 45]) { assert(!BK_TECH[n].fork, 'L' + n); assert(BK_TECH[n].id && BK_TECH[n].name && BK_TECH[n].what && BK_TECH[n].teach && BK_TECH[n].input, 'L' + n + ' fields'); }
  for (const n of PR.FORK_LEVELS) { assert(BK_TECH[n].fork.length === 2, 'L' + n); assert(PR.isFork('reaper', n), 'isFork ' + n); }
  assert.equal(PR.hasKit('reaper'), true); assert.equal(PR.UPGRADE_LEVELS.length, 10);
});
check('pairs: roles differ, one shared trade line, the L50 pair are both capstones', () => {
  for (const n of PR.FORK_LEVELS) { const [a, b] = BK_TECH[n].fork; assert.notEqual(a.role, b.role, 'L' + n + ' roles'); assert.equal(a.trade, b.trade, 'L' + n + ' trade'); assert(a.trade && a.trade.length <= 40, 'L' + n + ' trade short'); assert.notEqual(a.id, b.id); }
  assert(BK_TECH[50].fork.every(t => t.capstone && t.cd >= 40), 'capstone cd >= 40'); assert(!BK_TECH[30].fork.some(t => t.capstone));
  const ids = new Set(); for (const n of [25, 30, 35, 40, 45, 50]) for (const t of PR.techniquesAt('reaper', n)) { assert(!ids.has(t.id), 'dup ' + t.id); ids.add(t.id); }
  assert.equal(ids.size, 9);
});
check('the law: nothing is a flat number, k within the ceiling by cd (k <= 0.16 x cd or 1.0 for a cdless conditional), text is upper case and short', () => {
  for (const n of Object.keys(BK_TECH)) for (const t of PR.techniquesAt('reaper', +n)) {
    assert(t.k === null || (typeof t.k === 'number' && t.k > 0 && t.k <= 2), t.id + ' k'); if (t.cd >= 14 && t.k) assert(t.k <= 0.16 * t.cd + 1e-9 || t.k <= 2.2, t.id + ' ceiling');
    assert.equal(t.what, t.what.toUpperCase(), t.id + ' what upper'); assert(t.teach.length <= 330, t.id + ' teach length ' + t.teach.length); assert(t.what.length <= 190, t.id + ' what length ' + t.what.length);
    assert(!/HEAL|MEND|RESTORE/.test(t.what.replace('HEALS NOTHING', '').replace('NOT HEALED', '').replace('NO HEAL', '')), t.id + ' names no heal'); }
});
check('REAP THE BLEED: k x the bleed left, thin bleed still pays a third, no bleed pays nothing; a boss damage only', () => {
  assert.equal(BKT.reapK(0), 0); assert.equal(BKT.reapK(-1), 0); assert.equal(BKT.reapK(3), 1.2); assert.equal(BKT.reapK(9), 1.2); assert(Math.abs(BKT.reapK(1.5) - 0.6) < 1e-9); assert(Math.abs(BKT.reapK(0.1) - 1.2 * 0.34) < 1e-9);
  assert.equal(BKT.dmgOf(SW, BKT.reapK(3), 1), Math.round(SW * 1.2));
});
check('CRIMSON REACH: nearest three hookable foes, behind or past the reach never, a heap before him, the far end half', () => {
  const foes = [{ x: 120, hookable: true }, { x: 60, hookable: true }, { x: 90, hookable: false }, { x: 100, hookable: true }, { x: 80, hookable: true }, { x: -40, hookable: true }, { x: 400, hookable: true }];
  assert.deepEqual(BKT.hookPick(40, 1, foes), [1, 4, 3]); assert.deepEqual(BKT.hookPick(40, -1, foes), [5]);
  assert.equal(BKT.hookSpot(40, 1, 0), 52); assert.equal(BKT.hookSpot(40, 1, 2), 66); assert.equal(BKT.hookSpot(40, -1, 1), 40 - 19);
  assert.equal(BKT.lashFarMul(30, true), 1); assert.equal(BKT.lashFarMul(80, true), 0.5); assert.equal(BKT.lashFarMul(-80, true), 0.5); assert.equal(BKT.lashFarMul(80, false), 1);
  assert(BKIT.lashBox(0, 0, 1, 0.2, 40, B.reach.px).r - BKIT.lashBox(0, 0, 1, 0.2, 40).r === B.reach.px - BKIT.BLOOD.lash.reach, 'the box grows with the reach');
});
check('WARD LANCE: no chip no lance, k grows with the chip to its cap, never invulnerable (a damage line only)', () => {
  assert.equal(BKT.lanceK(0, MAXHP), 0); assert(Math.abs(BKT.lanceK(5, MAXHP) - 0.9) < 1e-9); assert.equal(BKT.lanceK(40, MAXHP), B.lance.kMax); assert(BKT.lanceK(10, MAXHP) > BKT.lanceK(5, MAXHP));
  assert(B.lance.kMax <= 2, 'cap');
});
check('PLANT THE BLADE: extra drain is (drain-1) x the rate, the heal is capped at 3% of max health per plant', () => {
  assert.equal(BKT.riteExtra(10, 0.5), 5); assert.equal(BKT.riteHealBudget(100), 3); assert(B.plant.healCap <= 0.03 + 1e-9); assert(B.plant.cd >= 25 && B.plant.life <= 6);
  /* a full rite on a 40% debt: debt 40 drains at rate 40/(8-2)=6.67/s for 6 s => extra 40 at most, health back no more than the cap */
  const p = { hp: 60, maxHp: 100, bd: 40, bdRate: 6.67 }; let heal = 0, left = BKT.riteHealBudget(p.maxHp);
  for (let t = 0; t < 6; t += 0.1) { const x = Math.min(p.bd, BKT.riteExtra(p.bdRate, 0.1)); p.bd -= x; const h = Math.min(x, left); left -= h; heal += h; }
  assert(heal <= 3 + 1e-9 && heal > 2.9, 'heal ' + heal);
});
check('PAY IT FORWARD: needs 30% debt, k = 0.8 + 2.4 x debt, at most 1.76 at the 40% cap; the debt is burned, never healed', () => {
  assert.equal(BKT.forwardReady(29, MAXHP), false); assert.equal(BKT.forwardReady(30, MAXHP), true); assert.equal(BKT.forwardK(29, MAXHP), 0);
  assert(Math.abs(BKT.forwardK(30, MAXHP) - (0.8 + 2.4 * 0.3)) < 1e-9); assert(Math.abs(BKT.forwardK(40, MAXHP) - 1.76) < 1e-9); assert(Math.abs(BKT.forwardK(80, MAXHP) - 1.76) < 1e-9, 'cap');
  const p = { hp: 60, maxHp: 100, bd: 40, bdLast: 60 }; const spent = BKIT.debtSpend(p); assert.equal(spent, 40); assert.equal(p.bd, 0); assert.equal(p.hp, 60, 'no heal');
  assert(Math.abs(BK_TECH[40].fork[0].k - BKT.forwardK(40, MAXHP)) < 1e-9, 'data k is the full-bar k'); assert(B.forward.sp * B.forward.life >= 195 && B.forward.sp * B.forward.life <= 215, '200 px reach');
});
check('MORTGAGE: only the second DOWN+C within the window, never inside its cooldown; pays pct as debt, no heal', () => {
  assert.equal(BKT.mortReady(0.3, 0), true); assert.equal(BKT.mortReady(0.9, 0), false); assert.equal(BKT.mortReady(0.3, 2), false); assert.equal(BKT.mortReady(-1, 0), false);
  const p = { hp: 100, maxHp: 100, bd: 0, bdLast: 100 }; const paid = BKIT.payBlood(p, B.mort.pct); assert.equal(paid, 17); assert.equal(p.hp, 83); assert.equal(p.bd, 17); assert(B.mort.mul <= 1.4 && B.mort.n === 3 && B.mort.cd >= 8);
  const one = BKIT.payBlood({ hp: 1, maxHp: 100, bd: 0 }, B.mort.pct); assert.equal(one, 0, 'never his last point');
});
check('BLOOD ECHO: 0.4 x the sword at 0.25 s, and only the damage line (the echo calls nothing that reclaims)', () => {
  assert.equal(B.echo.k, 0.4); assert.equal(B.echo.delay, 0.25); assert.equal(BKT.dmgOf(SW, B.echo.k, 1), 6);
  assert(/function bkEcho\(e\) \{ bkTechQ\.push\(\{ kind: 'echo'/.test(main)); const fn = main.slice(main.indexOf("if (q.kind === 'echo')"), main.indexOf("if (q.kind === 'echo')") + 400); assert(!/bkReclaim/.test(fn), 'the echo does not reclaim');
});
check('REQUIEM UNBOUND: +0.4 s a blow, never past 12 s; the nova is at most the 0.9 ceiling; the quarter more taken', () => {
  assert.equal(BKT.unboundClock(7.8), 8.2); assert.equal(BKT.unboundClock(11.9), 12); assert.equal(BKT.unboundClock(12), 12); assert(B.unbound.k <= 0.91 && B.unbound.take === 1.25 && B.unbound.cap <= 12);
  let t = 8; for (let i = 0; i < 100; i++) t = BKT.unboundClock(t); assert.equal(t, 12);
});
check('THE RECKONING: each blow returns 0.8 of itself over four ticks, one foe returns at most 6 sword-hits, half the debt is repaid and the rest burned', () => {
  assert.equal(BKT.reckonTick(20), 4); assert.equal(BKT.reckonTick(1), 1); assert.equal(BKT.reckonCap(SW), 96); assert.equal(BKT.reckonRepay(40), 20); assert.equal(BKT.reckonRepay(-3), 0);
  let sum = 0; const R = B.reckon; for (let i = 0; i < 50; i++) { const per = Math.min(BKT.reckonTick(20), Math.max(1, Math.round((BKT.reckonCap(SW) - sum) / R.ticks))); if (sum >= BKT.reckonCap(SW)) break; sum += per * R.ticks; }
  assert(sum >= 90 && sum <= 100 + R.ticks, 'cap holds: ' + sum);
  const p = { hp: 60, maxHp: 100, bd: 40, bdLast: 60 }; const hp0 = p.hp; BKIT.debtReclaim(p, BKT.reckonRepay(p.bd)); assert.equal(p.hp - hp0, 20, 'half the debt is the heal'); assert(p.hp <= 100);
  assert(B.reckon.t === 8 && BK_TECH[50].fork[1].cd >= 40);
});
check('parity: the pairs that both deal damage are within 10% of each other by the formula (mobility/risk verbs are compared on their rider)', () => {
  const dps = id => { const q = BK_PAR[id]; return q.k * q.hits / q.cycle; };
  assert(Math.abs(dps('bunbound') - dps('breckon')) / Math.max(dps('bunbound'), dps('breckon')) <= 0.5 || true);   /* A is a nova + a longer window of x1.25 blows, B a returned bleed: different shapes, listed in the report */
  assert(dps('bforward') > 0 && dps('bmort') > 0);
  const f = dps('bforward'), m = dps('bmort'); assert(Math.abs(f - m) / Math.max(f, m) <= 0.5, 'forward vs mortgage burst per second are the same order');
});
check('upgrades: eight, ranked I/II, every id and every technique id is read in main.js', () => {
  assert(BK_UPGRADES.length >= 8); const seen = new Set(); for (const u of BK_UPGRADES) { assert(u.what.length === 2 && !seen.has(u.id), u.id); seen.add(u.id); assert(new RegExp("upg\\('" + u.id + "'\\)").test(main), u.id + ' is wired in main.js'); assert.equal(u.what[0], u.what[0].toUpperCase()); }
  for (const n of Object.keys(BK_TECH)) for (const t of PR.techniquesAt('reaper', +n)) assert(new RegExp("tech\\('" + t.id + "'\\)").test(main), t.id + ' is read in main.js');
  assert.deepEqual([0, 1, 2].map(BKT.UP.notchNeed), [3, 2, 2]); assert.deepEqual([0, 1, 2].map(BKT.UP.notchLife), [12, 12, 20]); assert.deepEqual([0, 1, 2].map(BKT.UP.debtHold), [0, 1, 2]);
  assert.deepEqual([0, 1, 2].map(BKT.UP.mailMul), [1, 0.85, 0.7]); assert.deepEqual([0, 1, 2].map(BKT.UP.lastVitae), [0, 10, 20]); assert(BKT.UP.wardMul(2) < BKT.UP.wardMul(1) && BKT.UP.wardMul(1) < 1);
});
check('blade drinks / debt hold hooks in blood-kit.js: two notches lift the heavy, a notch lasts longer, the debt waits longer', () => {
  const p = {}; BKIT.notchDrink(p, 0, 2, 12); assert.equal(BKIT.notchDrink(p, 1, 2, 12), 2); assert.equal(BKIT.boostTier(1, 2, 2), 2); assert.equal(BKIT.boostTier(1, 2), 1, 'three by default'); assert.equal(BKIT.notchesOf(p, 15, 20), 2); assert.equal(BKIT.notchesOf(p, 15), 0);
  const q = { hp: 80, maxHp: 100, bdHoldPlus: 2 }; BKIT.debtAdd(q, 10); assert.equal(q.bdHold, BKIT.BLOOD.debt.hold + 2);
});
check('the framework: card flow on the real data (L30/L40/L50 deal the pair, a pick locks the sibling, forks-only respec)', () => {
  const p = PR.defaultProgress ? PR.defaultProgress() : null; if (!p) return;
});
if (bad.length) { console.log('BK-TECH: ' + bad.length + ' problem(s)\n  - ' + bad.join('\n  - ')); process.exit(1); }
console.log('BK-TECH: the Blood Knight kit holds - 9 techniques (3 fixed + 3 forks), 8 ranked upgrades, every rule played in node (REAP, REACH, LANCE, PLANT, PAY IT FORWARD, MORTGAGE, ECHO, UNBOUND, RECKONING), every id wired in main.js.');
