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

/* ===== J2 + J3 (claude/juice2): per-hero beats, the smear, the thwack, the clink, jump / land weight ===== */
import { beatsFor, attackPose, LIGHT2, THIRD_ANT } from '../src/attack-animation.js';
import { smearOf, SMEAR, SMEAR_ALPHA, followFrame, swingHit } from '../src/swing-smear.js';
import { JUMP_FEEL } from '../src/jump-feel.js';
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger'];
const cut = (c, atk, extra = {}) => ({ atk, combo: c, ground: true, ...extra });
/* OFF = today exactly: the knight's beats for ranger / berserker, no third-cut wind-up, no smear, the old follow split */
setJuice2(false);
assert.deepEqual(beatsFor('ranger', cut(1, 0)), [.04, .10, .16, .24], 'off: ranger borrows the knight');
assert.deepEqual(beatsFor('berserker', cut(1, 0)), [.04, .10, .16, .24], 'off: berserker borrows the knight');
for (const h of HEROES) for (const c of [1, 2, 3]) assert.deepEqual(beatsFor(h, cut(c, 0)), beatsFor(h, cut(1, 0)), 'off: the third cut has no extra wind-up (' + h + ')');
for (const h of HEROES) for (let a = 0; a < 0.3; a += 0.01) assert.equal(smearOf(h, cut(1, a)), null, 'off: no smear');
assert.equal(followFrame(0.6, true), 0); assert.equal(followFrame(0.4, true), 1, 'off: a hit does not hold the follow frame'); assert.equal(followFrame(0.4, false), 1);
assert.equal(attackPose('ranger', cut(1, 0.05), { atk: 1 }).frame, 1, 'off: ranger frame at .05 = the knight table (.04 < .05 < .10)');
/* ON */
setJuice2(true);
assert.deepEqual(LIGHT2.ranger, [.03, .08, .15, .22]); assert.deepEqual(LIGHT2.berserker, [.05, .10, .17, .24]);
assert.deepEqual(beatsFor('ranger', cut(1, 0)), [.03, .08, .15, .22], 'on: ranger'); assert.deepEqual(beatsFor('berserker', cut(2, 0)), [.05, .10, .17, .24], 'on: berserker');
near(THIRD_ANT, 0.02, 'third cut +.02');
for (const h of HEROES) { const b1 = beatsFor(h, cut(1, 0)), b3 = beatsFor(h, cut(3, 0));
  near(b3[0], b1[0] + 0.02, 'third cut wind-up ' + h); assert.deepEqual(b3.slice(1), b1.slice(1), 'later beats unmoved ' + h);
  assert.deepEqual(beatsFor(h, cut(3, 0, { heavy: true })), b1, 'a heavy keeps its own'); assert.deepEqual(beatsFor(h, cut(3, 0, { heavySwing: true })), b1);
  assert.ok(b3[0] < b3[1] && b3[1] < b3[2] && b3[2] < b3[3], 'beats ascend ' + h); }
assert.equal(attackPose('ranger', cut(1, 0.035), { atk: 1 }).frame, 1, 'ranger strikes at .03 now'); assert.equal(attackPose('knight', cut(1, 0.035), { atk: 1 }).frame, 0);
/* the smear: every hero, frames 1-2 only, light cuts only */
for (const h of HEROES) { assert.ok(SMEAR[h], 'a smear row for ' + h); const b = beatsFor(h, cut(1, 0));
  assert.equal(smearOf(h, cut(1, b[0] - 0.005)), null, 'no smear in the wind-up ' + h); const s = smearOf(h, cut(1, b[0] + 0.001));
  assert.ok(s && s.k < 0.1 && s.w >= 1 && s.w <= 3 && s.alpha <= SMEAR_ALPHA && s.alpha > 0.45, 'smear starts ' + h);
  assert.equal(smearOf(h, cut(1, b[2] + 0.001)), null, 'no smear after the extended beat ' + h);
  const mid = smearOf(h, cut(1, (b[0] + b[2]) / 2)); assert.ok(mid.alpha < s.alpha, 'fades ' + h);
  assert.equal(smearOf(h, cut(1, (b[0] + b[2]) / 2), true).alpha, 1, 'a landed blow snaps to full alpha ' + h);
  for (const bad of [{ heavy: true }, { heavySwing: true }, { swingKind: 'rise' }, { swingKind: 'sweep' }, { swingKind: 'airUp' }, { swingRiposte: true }, { plunge: true }, { dashCut: true }, { dead: true }]) assert.equal(smearOf(h, cut(1, b[0] + 0.01, bad)), null, 'no smear: ' + Object.keys(bad)[0]);
  assert.equal(smearOf(h, cut(2, b[0] + 0.01)).geom, SMEAR[h].line ? 'line' : 'arcUp'); { const b3 = beatsFor(h, cut(3, 0)); assert.equal(smearOf(h, cut(3, b3[0] + 0.01)).geom, 'line', 'the third cut is a thrust streak'); } }
assert.equal(smearOf('warden', cut(1, 0.06)).geom, 'line', 'the spear smears a line'); assert.equal(smearOf('knight', cut(1, 0.06)).geom, 'arc');
assert.ok(SMEAR.berserker.col[1] !== SMEAR.ranger.col[1], 'weapon colours differ');
assert.equal(followFrame(0.4, true), 0, 'on: a hit holds follow[0] a frame longer'); assert.equal(followFrame(0.4, false), 1); assert.equal(followFrame(0.2, true), 1);
assert.equal(swingHit({ smearHitT: 1, smearHitAtk: 0.05, atk: 0.07 }, 1.1), true); assert.equal(swingHit({ smearHitT: 1, smearHitAtk: 0.05, atk: 0.02 }, 1.1), false, 'a new swing is not the old hit'); assert.equal(swingHit({ smearHitT: 1, smearHitAtk: 0.05, atk: 0.07 }, 2), false); assert.equal(swingHit({}, 1), false);
setJuice2(false);
/* J3 wiring: the audio layer is read by greps (audio.js needs a browser to run) */
const au = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
for (const [re, why] of [[/import \{ JUICE2_SHIPS \} from '\.\/juice\.js'/, 'audio reads the flag'], [/SFX\.thwack = function/, 'thwack'], [/THWACK = \{ light: \{ click: 0\.11/, 'thwack table'], [/jitter: 0\.06/, 'pitch +/- 6%'], [/duck: 0\.85/, 'ducks the voice / material 15%'],
  [/const duckUnder/, 'duck helper'], [/g\.gain\.value = v \* SFX_TRIM\[cat\] \* duckUnder\(cat\)/, 'file() ducked'], [/SFX_TRIM\.voice \* duckUnder\('voice'\)/, 'voice() ducked'], [/SFX\.clink = function/, 'clink'], [/blk_clash', 0\.3, 1\.15/, 'clink uses the clash file'],
  [/if \(!JUICE2_SHIPS\) return SFX\.glance\(\)/, 'clink off = glance'], [/SFX\.pJump = function[\s\S]{0,200}JUICE2_SHIPS/, 'jump weight flagged'], [/SFX\.pLand = function \(surf, tier = 0\) \{ const r = base\.call[\s\S]{0,120}JUICE2_SHIPS/, 'land weight flagged'], [/if \(!JUICE2_SHIPS \|\| !ac\) return; const R = THWACK/, 'thwack off = nothing']]) assert.ok(re.test(au), 'audio.js: ' + why);
const TH = new Function('return ' + au.match(/THWACK = (\{[^;]*\});/)[1])();
assert.ok(TH.light.sub === 0 && TH.heavy.sub > 0 && TH.finish.crunch > 0 && TH.light.crunch === 0 && TH.heavy.crunch === 0, 'light = click + body; heavy = + sub; finish = + crunch');
for (const c of ['light', 'heavy', 'finish']) { const r = TH[c], peak = r.click + r.body + r.sub + r.crunch * 1.5; assert.ok(peak < 0.62 + 1e-9, 'peak of the layers under the mix headroom: ' + c + ' ' + peak); }
const LD = (w, tier) => ({ f0: 150 / Math.max(0.5, w), v: Math.min(0.3, 0.05 + 0.09 * w + 0.04 * tier), dur: 0.06 + 0.05 * w + 0.03 * tier });
assert.ok(au.includes('f0: 150 / Math.max(0.5, w)') && au.includes('Math.min(0.3, 0.05 + 0.09 * w + 0.04 * tier)'), 'the land formula under test is the one in audio.js');
assert.ok(LD(JUMP_FEEL.paladin.w, 0).v > LD(JUMP_FEEL.pyro.w, 0).v && LD(JUMP_FEEL.paladin.w, 0).f0 < LD(JUMP_FEEL.pyro.w, 0).f0, 'a heavy hero lands deeper and louder than a light one');
assert.ok(LD(1, 2).v > LD(1, 0).v && LD(1, 2).dur > LD(1, 0).dur, 'a bigger drop lands bigger');
assert.ok(1 / JUMP_FEEL.paladin.w < 1 / JUMP_FEEL.pyro.w, 'jump pitch = 1/w: paladin lower than pyro');
for (const h of HEROES) assert.ok(JUMP_FEEL[h] && JUMP_FEEL[h].w > 0, 'weight row ' + h);
/* main.js wiring for J2 + J3 */
for (const [re, why] of [[/import \{ smearOf, followFrame, swingHit \} from '\.\/swing-smear\.js'/, 'smear import'], [/function drawLightSmear\(/, 'smear drawer'], [/if \(JUICE2_SHIPS\) drawLightSmear\(cx, cy\);/, 'smear call, flagged'], [/SFX\.thwack\(blowKind\(e, dmg, tag\)\)/, 'thwack on a landed blow'], [/SFX\.thwack\('finish'\)/, 'thwack on a kill'],
  [/\(JUICE2_SHIPS && SFX\.clink \? SFX\.clink : SFX\.glance\)\(\)/, 'clink on a guard'], [/JUICE2_SHIPS \? followFrame\(/, 'follow hold flagged'], [/LAND FEEL BY WEIGHT/, 'land feel by weight'], [/P\.smearHitT = time/, 'hit stamp']]) assert.ok(re.test(m), 'main.js: ' + why);
console.log('juice2 J2+J3: OK (ranger/berserker beats, third-cut +.02, smear on 9 heroes snaps on a hit, thwack/clink/jump/land weight; flag off = old exactly)');
