// tools/juice2.mjs - JUICE2 (claude/juice1, 11-10): node-only asserts on src/juice.js. Flag ON = the J2 table (plan juice-plan.md J1); flag OFF = today's values exactly.
//   node tools/juice2.mjs          (no browser)
import assert from 'node:assert/strict';
import * as J from '../src/juice.js';
const { JUICE, JUICE2, setJuice2, stopFor, stopFor2, weaponStopMul, jitterFor, capParts, hitBudget, makeDuty, coopStop, dutyCovered, landShakeShare, recoilEase, glanceStop, starSize, starAlpha, partCap } = J;
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-9, m + ': ' + a + ' vs ' + b);
const FROZEN = JSON.stringify(JUICE);

/* OFF: exactly today */
setJuice2(false);
assert.equal(J.JUICE2_SHIPS, false);
for (const c of ['light', 'heavy', 'finish']) for (const o of [{}, { boss: true }, { boss: true, opening: true }, { dmg: 0 }]) near(stopFor2(c, o), stopFor(c, o), 'off ' + c);
near(stopFor2('light'), 0.04, 'off light'); near(stopFor2('heavy'), 0.09, 'off heavy'); near(stopFor2('finish'), 0.09, 'off finish');
near(stopFor2('light', { boss: true }), 0.032, 'off boss light');
near(glanceStop(), 0.02, 'off glance'); near(landShakeShare(), 0.5, 'off landShake'); near(recoilEase(), 0.14, 'off ease');
assert.equal(weaponStopMul('paladin'), 1); assert.equal(weaponStopMul('pirate'), 1); assert.equal(starSize('heavy'), 0); assert.equal(partCap(), Infinity);
assert.deepEqual(jitterFor('heavy', { stopping: true, frame: 1 }), { dx: 0, dy: 0 });
assert.equal(hitBudget(30, 20), 30); assert.equal(coopStop(makeDuty(), 0, 'light', 0.04, 4), 0.04);
const big = Array.from({ length: 600 }, () => ({ life: 1 })); assert.equal(capParts(big, partCap()).length, 600);

/* ON: the table */
setJuice2(true); assert.equal(J.JUICE2_SHIPS, true);
near(stopFor2('light'), 0.065, 'light'); near(stopFor2('heavy'), 0.110, 'heavy'); near(stopFor2('finish'), 0.130, 'finish');
assert.ok(stopFor2('light') < JUICE.hurt.stop, 'light stays under the hero hurt freeze (80 ms)');
assert.ok(stopFor2('light') < stopFor2('heavy') && stopFor2('heavy') < stopFor2('finish'));
near(stopFor2('heavy', { dmg: 0 }), 0, 'glance none');
near(stopFor2('heavy', { boss: true }), 0.110 * 0.9, 'boss heavy');
near(stopFor2('light', { boss: true }), 0.065 * 0.9, 'boss light'); assert.ok(stopFor2('light', { boss: true }) >= 0.055);
near(stopFor2('heavy', { boss: true, opening: true }), 0.110 * 1.25, 'boss opening');
assert.ok(stopFor2('heavy', { boss: true, opening: true }) > stopFor2('heavy', { boss: true }));
JUICE2.bossMul = 0.5; assert.ok(stopFor2('light', { boss: true }) >= 0.055, 'boss floor holds'); JUICE2.bossMul = 0.9;
near(glanceStop(), 0.06, 'glance'); near(landShakeShare(), 0.65, 'land'); near(recoilEase(), 0.16, 'ease');
assert.deepEqual([JUICE2.light.recoil, JUICE2.heavy.recoil, JUICE2.finish.recoil], [3, 6, 8]);
assert.deepEqual([JUICE2.light.flash, JUICE2.heavy.flash, JUICE2.finish.flash], [0.08, 0.12, 0.14]);
assert.deepEqual([JUICE2.light.sparks, JUICE2.heavy.sparks, JUICE2.finish.sparks], [6, 10, 14]);
assert.deepEqual([starSize('light'), starSize('heavy'), starSize('finish')], [12, 18, 24]);
/* weapon weight: freeze only */
assert.equal(weaponStopMul('paladin'), 1.15); assert.equal(weaponStopMul('berserker'), 1.15); assert.equal(weaponStopMul('pirate'), 0.85); assert.equal(weaponStopMul('ranger'), 0.85);
assert.equal(weaponStopMul('knight'), 1); assert.equal(J.weaponOf('reaper').stop, 1.3, 'greatsword x1.3 kept'); assert.equal(weaponStopMul('reaper'), 1);
/* jitter */
const a = jitterFor('light', { stopping: true, frame: 0 }), b = jitterFor('light', { stopping: true, frame: 1 });
assert.equal(Math.abs(a.dx), 2); assert.equal(a.dx, -b.dx); assert.equal(a.dy, 0);
assert.equal(Math.abs(jitterFor('heavy', { stopping: true, frame: 0 }).dx), 3); assert.equal(Math.abs(jitterFor('finish', { stopping: true, frame: 1 }).dy), 1);
assert.equal(Math.abs(jitterFor('light', { stopping: true, boss: true, frame: 0 }).dx), 1, 'boss half, min 1'); assert.equal(Math.abs(jitterFor('heavy', { stopping: true, boss: true, frame: 0 }).dx), 2);
assert.equal(jitterFor('light', { stopping: true, frame: 0, axis: -1 }).dx, -a.dx, 'axis flips');
assert.deepEqual(jitterFor('heavy', { stopping: false, frame: 0 }), { dx: 0, dy: 0 }, 'no freeze, no jitter');
assert.deepEqual(jitterFor('heavy', { stopping: true, reduce: true, frame: 0 }), { dx: 0, dy: 0 }, 'reduce motion: none');
/* star */
assert.equal(starAlpha(0, true), 1); assert.equal(starAlpha(0.2, true), 1); assert.ok(starAlpha(0.0165, false) > 0 && starAlpha(0.0165, false) < 1); assert.equal(starAlpha(0.04, false), 0);
/* particle cap + per-hit budget */
const ps = [...Array.from({ length: 500 }, () => ({ life: 1 })), ...Array.from({ length: 20 }, () => ({ life: 1, fire: true }))];
const cp = capParts(ps, 450); assert.equal(cp.length, 450); assert.equal(cp.filter(p => p.fire).length, 20, 'fire kept'); assert.equal(capParts(ps.slice(0, 100), 450).length, 100);
assert.equal(hitBudget(14, 0), 14); assert.equal(hitBudget(14, 20), 4); assert.equal(hitBudget(14, 30), 0); assert.equal(JUICE2.partCap, 450);
/* co-op: one hero untouched; 2+ light x0.7; duty cap skips a light past 35%; heavy / finish always honoured */
let d = makeDuty(); near(coopStop(d, 0, 'light', 0.065, 1), 0.065, 'solo');
d = makeDuty(); near(coopStop(d, 0, 'light', 0.065, 2), 0.065 * 0.7, '2P light x0.7');
d = makeDuty(); let now = 0, skipped = 0, got = 0; for (let i = 0; i < 40; i++) { const t = coopStop(d, now, 'light', 0.065, 4); if (t === 0) skipped++; else got += t; now += 0.05; }
assert.ok(skipped > 0, '4P chain of lights gets skipped'); assert.ok(dutyCovered(d, now) <= 0.35 + 0.05, 'duty stays near the cap: ' + dutyCovered(d, now));
d = makeDuty(); for (let i = 0; i < 30; i++) coopStop(d, i * 0.03, 'heavy', 0.11, 4); assert.ok(coopStop(d, 0.9, 'heavy', 0.11, 4) === 0.11 && coopStop(d, 0.9, 'finish', 0.13, 4) === 0.13, 'heavy/finish always honoured');
assert.equal(coopStop(d, 0.9, 'light', 0.065, 4), 0, 'a light is skipped inside a saturated window');
/* the base table is never edited */
assert.equal(JSON.stringify(JUICE), FROZEN);
setJuice2(false);
console.log('juice2: OK (flag off = old values exactly; on = 65/110/130 ms, boss floor 55, weapon x1.15/x0.85, jitter, star, part cap 450, co-op cap)');
/* wiring: main.js reads the J2 helpers where the plan says */
import { readFileSync } from 'node:fs';
const m = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
for (const [re, why] of [[/stopFor2\(cls, \{ boss/, 'blowStop uses stopFor2'], [/weaponStopMul\(hero\(\)\)/, 'weapon freeze mul'], [/function starAt\(/, 'star'], [/function drawStar\(/, 'star draw'], [/juiceJit\(e\)\.dx/, 'jitter in enemy draw'], [/capParts\(parts\)/, 'part cap'], [/coopStop\(juiceDuty/, 'co-op cap'], [/glanceStop\(\)/, 'clink stop'], [/P\.clinkT/, 'hero bounce-back'], [/stopFor2\('finish'\)/, 'kill pop stop']]) assert.ok(re.test(m), 'main.js wiring missing: ' + why);
console.log('juice2: main.js wiring OK');
