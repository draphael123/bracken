// tools/blood-rework.mjs - THE BLOOD KNIGHT REWORK (claude/bkrework, 11-04; scratch/plan-bloodknight-1103.md; Daniel approved all six recs 11-03 12:05).
// NODE ONLY (no browser): the pure rules in src/blood-kit.js and the wiring in the source. This fails when:
//   - THE LONG RALLY: the debt is not held 2 s then faded to 8 s, share 0.7, cap 0.4, min 4; a first light cut thrown 1.2 s after a hit (his walk-back) does not win back a real part of the segment
//   - REWARD BY WEIGHT: light < third (DEBT DRAIN 0.9) < heavy (1.0) for the same blow; a HEMORRHAGE foe gives it all back; a bleeding foe still more
//   - THE DEBT HOLDS (debtStep freeze) - and main.js passes the BLOOD WARD held and HEMORRHAGE as freezes; a new debt re-arms THE ANSWER (p.bkAnswered)
//   - VITAE: per 0.35 of max hp; the plan's gain table (cut 4, third 6, heavy 6..14 by tier, parry/spike 20, ward 3); a chain of three cuts is worth the table's 14
//   - RED REQUIEM: BLOOD.requiem (windup 0.45, ring 110, stagger 1.2, bleed 4, hemT 8, hem x1.25, reclaim all), SKK.K.redRequiem, ULT_NAMES/ULT_NEEDS, ultRegister('reaper'), HOLD F inert, no CRIMSON FRENZY left
//   - THE ANSWER (32 px in 0.15 s, 3% of max hp), DEBT DRAIN (the third cut: name, weight, heavier, its own SFX), HEMORRHAGE x1.25 in swingDmg, UNFLINCHING with no resist, the foe brand timer
//   - sec 4 numbers: max hp 105, swing stamina 18, dodge 22, ward price 0.25; Q6 heal cuts (NOVA_HEAL 0, no nova heal, no BLOODLETTER heal for him, no frenzy steal)
//   node tools/blood-rework.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOOD, debtStep, debtAdd, debtReclaim, reclaimOf, reclaimWeight, vitaeOf, vitaeGain } from '../src/blood-kit.js';
import * as SKK from '../src/skill-k.js';
import { ULT_NAMES, ULT_NEEDS } from '../src/ultimate.js';
import * as CM from '../src/commit.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rd = f => readFileSync(join(ROOT, f), 'utf8');
const bad = []; const ok = (c, m) => { if (!c) bad.push(m); }; const near = (a, b, e = 0.05) => Math.abs(a - b) <= e;
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

/* ---------- THE LONG RALLY ---------- */
{ const D = BLOOD.debt, M = 105;
  ok(D.share === 0.7 && D.cap === 0.4 && D.hold === 2.0 && D.drainT === 8 && D.reclaimMin === 4, 'THE LONG RALLY numbers are off: ' + JSON.stringify(D));
  const p = { hp: M, maxHp: M }; debtStep(p, 0); p.hp -= 16; debtStep(p, 0.016);
  ok(near(p.bd, 16 * 0.7, 0.01), 'a 16 blow left ' + p.bd + ' (want 11.2)');
  const bd0 = p.bd; let t = 0; while (t < 1.9) { debtStep(p, 1 / 60); t += 1 / 60; } ok(near(p.bd, bd0, 0.01), 'the debt drained inside the 2 s hold: ' + bd0 + ' -> ' + p.bd);
  while (p.bd > 0 && t < 12) { debtStep(p, 1 / 60); t += 1 / 60; } ok(t > 7.7 && t < 8.3, 'the debt emptied at ' + t.toFixed(2) + ' s (want ~8)');
  /* his walk back: hurt + knockback + stepping in ~1.2 s, then a light cut for 16 */
  const q = { hp: M, maxHp: M }; debtStep(q, 0); q.hp -= 16; debtStep(q, 0.016); for (let i = 0; i < 72; i++) debtStep(q, 1 / 60);
  const got = debtReclaim(q, reclaimOf(16, { weight: 'light' })); ok(got >= 9, 'a first light cut 1.2 s after the hit won back only ' + got.toFixed(2) + ' (the 0.8 s hold used to lose the segment before his first cut)');
  /* a held blade freezes it (the ward) */
  const w = { hp: M, maxHp: M }; debtStep(w, 0); w.hp -= 30; debtStep(w, 0.016); const wb = w.bd; for (let i = 0; i < 600; i++) debtStep(w, 1 / 60, { freeze: true }); ok(near(wb, w.bd, 1e-6), 'freeze did not hold the debt for 10 s');
  const big = { hp: 10, maxHp: M }; debtStep(big, 0); big.hp = 0.5; debtStep(big, 0.016); ok(big.bd <= 0.4 * M + 1e-6, 'the cap 0.4 was passed: ' + big.bd);
  const an = { hp: M, maxHp: M, bkAnswered: true }; debtAdd(an, 5); ok(an.bkAnswered === false, 'a new debt did not re-arm THE ANSWER');
}
/* ---------- BY WEIGHT ---------- */
{ const W = BLOOD.reclaimW, d = 40;
  ok(W.light === 0.6 && W.third === 0.9 && W.heavy === 1.0, 'reclaimW is not 0.6 / 0.9 / 1.0: ' + JSON.stringify(W));
  ok(reclaimOf(d, { weight: 'light' }) < reclaimOf(d, { weight: 'third' }) && reclaimOf(d, { weight: 'third' }) < reclaimOf(d, { weight: 'heavy' }), 'light < third < heavy is not true');
  ok(near(reclaimOf(d, { weight: 'third' }), d * 0.9) && near(reclaimOf(d, { weight: 'heavy' }), d), 'the weights are not the share of the blow');
  ok(reclaimOf(1, { weight: 'light' }) === 4 && reclaimOf(0) === 4, 'the min per blow is not 4');
  ok(reclaimOf(d, { weight: 'light', bleeding: true }) > reclaimOf(d, { weight: 'light' }), 'a bleeding foe does not give more');
  ok(near(reclaimOf(d, { weight: 'light', hem: true }), d * BLOOD.requiem.hemReclaim) && BLOOD.requiem.hemReclaim === 1, 'a HEMORRHAGE foe does not give ALL of the blow back');
  ok(reclaimWeight({}) === BLOOD.debt.reclaim && BLOOD.empower.heal === 0.75, 'the default weight is not the old 0.5 or the empower heal is not 0.75');
}
/* ---------- VITAE ---------- */
{ const G = BLOOD.vitae.gain;
  ok(BLOOD.vitae.per === 0.35, 'vitae.per is not 0.35'); ok(near(vitaeOf(0.35 * 105, 105), 100, 0.01), '0.35 of max hp reclaimed does not fill VITAE');
  ok(G.cut === 4 && G.third === 6 && G.parry === 20 && G.ward === 3 && G.heavy.join() === '0,6,8,10,12,14', 'the VITAE gain table is not the plan\'s: ' + JSON.stringify(G));
  ok(vitaeGain('cut') === 4 && vitaeGain('third') === 6 && vitaeGain('heavy', 3) === 10 && vitaeGain('heavy', 5) === 14 && vitaeGain('parry') === 20 && vitaeGain('ward') === 3 && vitaeGain('nope') === 0, 'vitaeGain reads the table wrong');
  ok(2 * vitaeGain('cut') + vitaeGain('third') === 14, 'a chain of three cuts is not the table\'s 14 vitae');
}
/* ---------- RED REQUIEM + the numbers ---------- */
{ const R = BLOOD.requiem;
  ok(R.name === 'RED REQUIEM' && R.windup === 0.45 && R.ring === 110 && R.stagger === 1.2 && R.bleed === 4 && R.hemT === 8 && R.hemMul === 1.25 && R.hemReclaim === 1, 'BLOOD.requiem is not the plan\'s: ' + JSON.stringify(R));
  ok(SKK.K.redRequiem === 6 && SKK.K_BK.redRequiem === 6, 'skill-k.js has no redRequiem 6 row');
  ok(ULT_NAMES.reaper === 'RED REQUIEM' && ULT_NEEDS.reaper === 'FULL VITAE', 'ULT_NAMES / ULT_NEEDS have no reaper entry');
  ok(!('frenzy' in BLOOD), 'BLOOD.frenzy is still here (CRIMSON FRENZY is removed)');
  ok(BLOOD.answer.px === 32 && BLOOD.answer.t === 0.15 && BLOOD.answer.min === 0.03, 'BLOOD.answer is not 32 px / 0.15 s / 3%: ' + JSON.stringify(BLOOD.answer));
  ok(BLOOD.drain3.name === 'DEBT DRAIN' && BLOOD.drain3.mul > 1, 'BLOOD.drain3 (the third cut) is missing');
  ok(CM.SWING_COST.reaper === 18 && CM.ROLL_COST.reaper === 22, 'swing stamina is ' + CM.SWING_COST.reaper + ', dodge ' + CM.ROLL_COST.reaper + ' (want 18 / 22)');
  ok(CM.COMMIT && (CM.COMMIT.reaper ? CM.COMMIT.reaper.light === 0.102 : true), 'the reaper light recovery was changed (it must stay: slow is the identity)');
}
/* ---------- THE SOURCE ---------- */
{ const mainRaw = rd('src/main.js'), main = strip(mainRaw), prog = rd('src/progression.js');
  ok(/ultRegister\('reaper', \{ name: 'RED REQUIEM'/.test(main), "main.js does not ultRegister('reaper', RED REQUIEM)");
  ok(!/crimsonFrenzy|bkFrenzyT|frenzySteal|BLOOD\.frenzy/.test(main), 'CRIMSON FRENZY code is still in main.js');
  ok(!/['"`][^'"`\n]*CRIMSON FRENZY[^'"`\n]*['"`]/.test(main), 'a string in main.js still says CRIMSON FRENZY');
  ok(/const skillPress = k => \[P\.fRelease \|\| throwPress, skill2Press/.test(main) && !/P\.fHeld = 0\.001/.test(main) && !/crimsonFrenzy\(\)/.test(main), 'HOLD F is not inert (F is a plain skill tap again)');
  ok(/WARD_PRICE = 0\.25, NOVA_HEAL = 0/.test(main), 'WARD_PRICE 0.25 / NOVA_HEAL 0 not set');
  ok(!/NOVA_HEAL \* \(1 \+ 0\.1 \* prk/.test(main) && /bloodletter: !!perk\('leech'\) && !isReaper\(\)/.test(main), 'the nova still heals, or BLOODLETTER still heals the Blood Knight');
  ok(/\(P\.bkReqT \|\| 0\) > 0 \|\| \(P\.wardHeld > 0\) \|\| P\.warding/.test(main), 'debtStep is not frozen by the held ward / HEMORRHAGE');
  ok(/\(e\.hem \|\| 0\) > 0\) mul \*= bkReqMod\(\)\.mul/.test(main) && /if \(e\.hem > 0\) e\.hem -= dt/.test(main), 'HEMORRHAGE x1.25 / the foe brand timer are not wired');
  ok(/bkUnf = isReaper\(\) && \(P\.bkReqT \|\| 0\) > 0/.test(main) && /else if \(armoured0\) \{ dmg = Math\.max\(1, Math\.round\(dmg \* 0\.75\)\)/.test(main), 'UNFLINCHING is not wired, or it carries the x0.75 resist (it must not)');
  ok(/bkAnswerT \|\| 0\) > 0 && !P\.heavy && !stunned\) \{ P\.bkAnswerT -= dt; P\.vx = P\.face \* BKIT\.BLOOD\.answer\.px/.test(main) && /function bkSwingStart\(\)/.test(main) && /startSwing\(\) \{[^\n]*P\.bkAnswerT = 0/.test(main), 'THE ANSWER is not wired into the swing');
  ok(/'DEBT DRAIN'/.test(mainRaw) && /bkLashHit\(e\)/.test(main) && /SFX\.bkDebtDrain/.test(main) && /bkReclaim\(swordDmg\(\) \* \(P\.swingMul \|\| 1\), e, third \? 'third' : 'light'\)/.test(main), 'the DEBT DRAIN third cut is not wired (name / weight / sound)');
  ok(/bkReclaim\(swordDmg\(\) \* \(P\.swingMul \|\| 1\), e, 'heavy'\)/.test(main) && /bkVitae\(BKIT\.vitaeGain\('heavy', st\)\)/.test(main) && /bkVitae\(BKIT\.vitaeGain\('ward'\)\)/.test(main) && /bkVitae\(BKIT\.vitaeGain\('parry'\)\)/.test(main), 'VITAE gains for heavies / the ward / parries are not wired');
  ok(/prog.*|/.test(prog) && /reaper:105,warden:100/.test(prog), 'max hp for the reaper is not 105');
  ok(/function bkRequiemImpact/.test(main) && /hurtAs\('heavy', e, dmg, P\.x, false\)/.test(main) && /if \(!big\) \{ e\.stagger = Math\.max\(e\.stagger \|\| 0, R\.stagger\)/.test(main), 'RED REQUIEM impact: no hurtAs, or a boss/mini is staggered (it must not be)');
  const au = rd('src/audio.js'); ok(/bkToll\(\)/.test(au) && /bkRequiem\(\)/.test(au) && /bkDebtDrain\(\)/.test(au), 'audio.js lacks the toll / geyser / debt-drain sounds');
  const lab = rd('src/lab.js'); ok(/h === 'reaper'\) return \(P\.harvest \|\| 0\) >= 100/.test(lab) && !/the surge/.test(lab.replace(/\/\*[\s\S]*?\*\//g, '')), 'the bot does not fire RED REQUIEM with UP+C');
  const ctl = rd('src/controls.js'); ok(!/SURGE/.test(ctl), 'the controls card still names HOLD F: SURGE');
}
if (bad.length) { console.log('FAIL blood-rework\n - ' + bad.join('\n - ')); process.exit(1); }
console.log('blood-rework: green (node only)');
