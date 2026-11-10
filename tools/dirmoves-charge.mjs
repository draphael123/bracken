// tools/dirmoves-charge.mjs - THE CHARGED GRAMMAR, node only (claude/dmcharge; plan sections 5-6). Pure rules + source wiring. No browser.
//   node tools/dirmoves-charge.mjs
import { readFileSync } from 'node:fs'; import assert from 'node:assert';
import * as D from '../src/dirmoves.js';
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'); let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const { DM } = D; const HS = 0.14;
// off = inert
DM.on = false; ok(!D.chargeOn('knight') && !D.chargeOn('warden'), 'DM.on false: no directional charge');
DM.on = true; ok(D.chargeOn('knight') && D.chargeOn('pyro') && !D.chargeOn('ranger'), 'DM.on: all but the ranger (her kneel draw is DMHEROES-C)');
// direction
ok(D.chargeDir(true, false) === 'up' && D.chargeDir(false, true) === 'down' && D.chargeDir(false, false) === null && D.chargeDir(true, true) === null, 'direction: up / down / none / both = none');
// ONE step, per-hero scale
const at = h => +D.chargeReadyAt(h, HS).toFixed(3);
ok(at('knight') === 0.59 && at('warden') === 0.59 && at('pyro') === 0.59 && at('geomancer') === 0.59 && at('berserker') === 0.59, 'ready at HEAVY_START + 0.45 (knight / warden / pyro / geo / bz)');
ok(at('pirate') === +(HS + 0.45 * 0.85).toFixed(3) && at('paladin') === +(HS + 0.45 * 1.2).toFixed(3) && at('reaper') === +(HS + 0.45 * 1.2).toFixed(3), 'pirate 0.85, paladin / blood knight 1.2');
ok(!D.chargeReady(0.5, 'knight', HS) && D.chargeReady(0.6, 'knight', HS) && !D.chargeReady(0.6, 'paladin', HS) && D.chargeReady(0.69, 'paladin', HS), 'let go before the step = nothing, after = fires');
// tags + numbers
ok(JSON.stringify(D.chargedBlow('up')) === '["rise","heavy"]' && JSON.stringify(D.chargedBlow('down')) === '["sweep","heavy"]', "tags ['rise','heavy'] / ['sweep','heavy']");
ok(D.chargedMul('up') === 2.0 && D.chargedMul('down') === 1.6, 'launcher x2.0, slam x1.6');
// foe rules read the tags (DMFOES hooks): wing + rise/heavy = GROUNDED, high guard + sweep/heavy = BROKEN 1.4 s
ok(D.wingGrounded('wing', D.chargedBlow('up')) && !D.wingGrounded('wing', 'rise') && !D.wingGrounded('beast', D.chargedBlow('up')), 'a charged rise on a flier = GROUNDED; a plain rise is not');
{ const e = { t: 'shield', dmHighUntil: 100 }; ok(D.highGuardBreak(e, D.chargedBlow('down'), 1) === 1.4 && D.highGuardBreak(e, 'sweep', 1) === 0, 'a charged sweep breaks a raised high guard (1.4 s); a plain sweep goes under'); }
// boxes: launcher = rise box + 24 tall (40 -> 64); slam = +-40 both sides; warden = tip / one side
const rise = D.chargeBox('up', 'knight', 100, 100, 1, 0.1), slam = D.chargeBox('down', 'knight', 100, 100, 1, 0.1), wUp = D.chargeBox('up', 'warden', 100, 100, 1, 0.1), wDn = D.chargeBox('down', 'warden', 100, 100, -1, 0.1);
ok(rise.t === 36 && rise.b === 114 - 0 || rise.t === 100 - 64, 'launcher box: top 64 up (the rise box is 40, +24)');
ok(slam.l === 60 && slam.r === 140, 'slam: +-40 px (2.5 tiles) both sides'); ok(wUp.t === 32 && wUp.r - wUp.l === 26, 'warden POLE HOIST: tall narrow tip box'); ok(wDn.r === 106 && wDn.l === 42, 'warden HAMSTRING: one side (facing left), the shaft at full reach');
ok(D.chargeBox('up', 'knight', 0, 0, 1, 0) === null && D.chargeBox('up', 'knight', 0, 0, 1, 0.3) === null, 'the box is live only in its window');
// rows
ok(D.chargeName('knight', 'up') === 'HEAVEN CUT' && D.chargeName('knight', 'down') === 'SHIELD DRIVE' && D.chargeName('warden', 'up') === 'POLE HOIST' && D.chargeName('warden', 'down') === 'HAMSTRING' && D.chargeName('pyro', 'up') === 'CHARGED LAUNCH', 'knight / warden rows named, the rest generic');
ok(D.chargeMove('knight', 'up').vy < 0 && D.chargeMove('warden', 'up').vy === 0, 'the knight hops after his cut, the warden does not');
// launch weights: any common incl brute, elite 0.6, boss / mini never
ok(D.launchWeight({ t: 'brute' }) === 1 && D.launchWeight({ t: 'x', elite: true }) === 0.6 && D.launchWeight({ t: 'x', maxHp: 9 }) === 0 && D.launchWeight({ t: 'x', mini: true }) === 0, 'launch weight 1.0 / elite 0.6 / boss + mini 0');
ok(D.tripTime({}, true) === 0.7 && D.tripTime({}, false) === 1.1, 'a charged sweep trips a beast for 0.7 s, others as a sweep');
DM.on = false;
// source wiring
ok(/DMX\.chargeBox\(P\.dmCharged, hero\(\)/.test(main), 'attackBox0 reads the charged box'); ok(/DMX\.chargedBlow\(P\.dmCharged\)/.test(main), 'the blow carries [verb, heavy]');
ok(/\(!!P\.dmCharged && DMX\.dmOn\(\) && P\.atk >= 0\)/.test(main), 'a charged blow goes through a raised guard'); ok(/function fireCharged\(dir\)/.test(main) && /DMX\.chargeReady\(P\.atkHeld/.test(main), 'fireCharged + the ready step');
ok(/const dmAim = \(\) => DMX\.chargeOn\(hero\(\)\) &&/.test(main), 'the live aim is DM.on only'); ok(/spend\(heavyCost\(\)\)/.test(main.slice(main.indexOf('function fireCharged'), main.indexOf('function updateCharge'))), 'costs heavyCost()');
ok((main.match(/DMX\.upGrabIgnored\(dmS\(\)\)/g) || []).length >= 5, 'ladder + rookery lift + zipline + airship station UP-grabs are gated while winding');
ok(/drawDmAim\(cx, cy\)/.test(main), 'aim glyph drawn'); ok(/famName = null; e\.blowNow = blow/.test(main), 'famName declared outside the family block (was a ReferenceError under DM.on)');
console.log('dirmoves-charge: ' + n + ' checks OK');
