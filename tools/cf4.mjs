// tools/cf4.mjs - CF4 HUD FEEL (claude/cf4, 11-11): node-only asserts on src/cf-hud.js + wiring / flag-guard greps on main.js and audio.js. No browser.
//   node tools/cf4.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as C from '../src/cf-hud.js';
const near = (a, b, m, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, m + ': ' + a + ' vs ' + b);

/* the flag ships OFF; the setter flips it */
assert.equal(C.CF4_SHIPS, true, 'CF4_SHIPS ships true'); C.setCF4(false); assert.equal(C.CF4_SHIPS, false); C.setCF4(true); assert.equal(C.CF4_SHIPS, true);

/* 1. NUMBER POP: 1.6 -> 1.0 over 0.08 s, merged re-pop at 1.3, heavy 1.25x, 0.25 steps, Reduce motion = no pop, kill = gold (not coin gold) */
near(C.popScale(0), 1.6, 'spawn 1.6'); near(C.popScale(0.04), 1.3, 'half way'); near(C.popScale(0.08), 1.0, 'settled'); near(C.popScale(1), 1.0, 'stays 1');
near(C.popScale(0, C.CF4.pop.merge), 1.3, 'merge re-pop 1.3');
{
  const n = C.popNum({ txt: 12, col: '#ff6b6b' }, 10); near(C.numScale(n, 10), 1.5, 'frame 0 quantised 1.6 -> 1.5'); near(C.numScale(n, 10.04), 1.25, 'mid -> 1.25'); near(C.numScale(n, 10.1), 1, 'done 1');
  const m = C.popNum({ txt: 12 }, 20, true); near(C.numScale(m, 20), 1.25, 'merged 1.3 -> 1.25 step'); assert.equal(m.fresh, false, 'a merge is not a fresh number');
  const h = C.popNum({ txt: 30 }, 5); near(C.numScale(h, 5.2), 1.25, 'heavy rests at 1.25x'); near(C.numScale(h, 5), 2, 'heavy spawn 1.6 x 1.25 = 2.0');
  near(C.numScale(h, 5, true), 1.25, 'Reduce motion: no pop, the heavy size stays'); near(C.numScale(n, 10, true), 1, 'Reduce motion light = 1');
  assert.equal(C.numScale({ txt: 'OPEN' }, 0), 1, 'a word never scales (age old)'); assert.equal(C.isHeavyNum('30'), false, 'strings are never heavy');
  assert.equal(C.numColor({ col: '#ff6b6b' }), '#ff6b6b'); assert.equal(C.numColor({ col: '#ff6b6b', kill: true }), '#ffd36b');
  assert.notEqual(C.CF4.kill.col, '#ffd34a', 'kill gold is not the coin gold num-display leaves undivided');
  const nums = [{ x: 100, y: 50, txt: 40, fresh: true }, { x: 300, y: 50, txt: 40, fresh: true }, { x: 100, y: 50, txt: 'OPEN', fresh: true }];
  C.markKills(nums, [{ x: 104, y: 74, h: 12 }]); assert.equal(nums[0].kill, true, 'a number over a body that died is gold'); assert.ok(!nums[1].kill && !nums[2].kill, 'others stay'); assert.ok(nums.every(x => !x.fresh), 'fresh is consumed');
}

/* 2. CHIP BAR: damage = red drops at once, white holds 0.4 s then drains at 0.6 bar/s; heal = green leads, red follows 0.15 s later */
{
  const st = {}; C.barStep(st, 100, 100, 1 / 60); assert.equal(st.chip, 1);
  C.barStep(st, 60, 100, 1 / 60); near(st.fill, 0.6, 'red drops at once'); near(st.chip, 1, 'white keeps the lost chunk'); near(C.ghostOf(st, st.fill), 1, 'ghost = the chunk');
  for (let i = 0; i < 20; i++) C.barStep(st, 60, 100, 0.02); near(st.chip, 1, 'still held at 0.4 s (20 x 0.02 less one step)', 0.02);
  C.barStep(st, 60, 100, 0.02); C.barStep(st, 60, 100, 0.02); assert.ok(st.chip < 1, 'drain started after the hold');
  const c0 = st.chip; C.barStep(st, 60, 100, 0.1); near(c0 - st.chip, 0.06, 'drains 60% of the bar per second (0.1 s = 0.06)');
  for (let i = 0; i < 100; i++) C.barStep(st, 60, 100, 0.05); near(st.chip, 0.6, 'ends level with the bar'); assert.equal(C.ghostOf(st, st.fill), 0.6);
  C.barStep(st, 60, 100, 0.01); C.barStep(st, 40, 100, 0.01); const afterFirst = st.hold; C.barStep(st, 20, 100, 0.01); assert.ok(st.hold >= afterFirst, 'a new hit renews the hold');
  const h = {}; C.barStep(h, 50, 100, 0.01); C.barStep(h, 80, 100, 0.01);
  near(h.green, 0.8, 'heal: green jumps to the new health'); near(h.fill, 0.5, 'heal: red waits'); C.barStep(h, 80, 100, 0.1); near(h.fill, 0.5, 'red still waiting at 0.1 s'); C.barStep(h, 80, 100, 0.1); near(h.fill, 0.8, 'red arrives after 0.15 s');
  assert.ok(h.chip <= h.fill + 1e-9 || h.chip >= 0.8 - 1e-9, 'no white above a heal');
  assert.equal(C.ghostOf(null, 0.5), null, 'no state -> the old ghost rule (null)'); assert.equal(C.ghostOf({}, 0.5), null);
  const z = {}; C.barStep(z, 10, 0, 0.01); assert.equal(z.fill, 0, 'max 0 never divides');
}

/* 3. LOW HP: on below 25%, off past 30% (hysteresis), a beat every 1.0 s, pulse 0.10 <-> 0.22 at 1.2 Hz, still 0.16, Vignette / Flashes scale it, exclusions stop it */
{
  const st = {}; let beats = 0;
  assert.equal(C.lowStep(st, 30, 100, 0.01, true), false); assert.ok(!st.low, '30% is not low'); C.lowStep(st, 25, 100, 0.01, true); assert.ok(!st.low, 'exactly 25% is not below it');
  assert.equal(C.lowStep(st, 24, 100, 0.01, true), true, 'goes low with a beat at once'); assert.ok(st.low);
  for (let i = 0; i < 300; i++) if (C.lowStep(st, 24, 100, 0.01, true)) beats++; assert.ok(beats >= 2 && beats <= 4, 'about one beat a second over 3 s: ' + beats);
  C.lowStep(st, 28, 100, 0.01, true); assert.ok(st.low, 'hysteresis: 28% stays low'); C.lowStep(st, 31, 100, 0.01, true); assert.ok(!st.low, 'healed past 30% stops it');
  C.lowStep(st, 20, 100, 0.01, true); assert.ok(st.low); C.lowStep(st, 20, 100, 0.01, false); assert.ok(!st.low, 'menu / intro card / Blood Knight / dead (ok false) stops it');
  let b2 = 0; const s2 = {}; for (let i = 0; i < 200; i++) if (C.lowStep(s2, 20, 100, 0.01, false)) b2++; assert.equal(b2, 0, 'no beats while excluded');
  C.lowStep(s2, 0, 100, 0.01, true); assert.ok(!s2.low, 'dead (hp 0) is not low');
  const o = { vignette: true, flashAmt: 1, reduce: false }; let lo = 9, hi = 0; const p = { low: true, ph: 0 };
  for (let i = 0; i < 100; i++) { p.ph = i * 0.01; const a = C.lowAlpha(p, o); lo = Math.min(lo, a); hi = Math.max(hi, a); }
  near(lo, 0.10, 'pulse floor 0.10', 0.002); near(hi, 0.22, 'pulse peak 0.22', 0.002);
  p.ph = 1 / 1.2 / 2; near(C.lowAlpha(p, o), 0.22, 'peak half a period (1.2 Hz) in'); p.ph = 1 / 1.2; near(C.lowAlpha(p, o), 0.10, 'a full period back at the floor');
  near(C.lowAlpha(p, { ...o, reduce: true }), 0.16, 'Reduce motion = a still 0.16'); assert.equal(C.lowAlpha(p, { ...o, vignette: false }), 0, 'Vignette OFF = no pulse');
  p.ph = 1 / 1.2 / 2; near(C.lowAlpha(p, { ...o, flashAmt: 0.5 }), 0.11, 'Flashes 50% halves it'); assert.equal(C.lowAlpha(p, { ...o, flashAmt: 0 }), 0, 'Flashes 0 = none');
  assert.equal(C.lowAlpha({ low: false, ph: 0 }, o), 0, 'not low = 0');
  near(C.heartGain(), 0.1259, '-18 dB', 0.001);
}

/* 4. HERO HIT: a red edge flash 0.12 s, 0.2 s at 20+ (internal), Flashes-scaled, none under Reduce motion, none when excluded */
{
  const st = {}; C.hitStep(st, 110, 0.01, true); C.hitStep(st, 110, 0.01, true); assert.ok(!(st.hitT > 0), 'no loss, no flash');
  C.hitStep(st, 100, 0.01, true); near(st.hitT, 0.12, 'a light hit 0.12 s'); C.hitStep(st, 100, 0.06, true); near(st.hitT, 0.06, 'decays'); C.hitStep(st, 100, 0.2, true); assert.equal(st.hitT, 0, 'ends');
  C.hitStep(st, 70, 0.01, true); near(st.hitT, 0.2, 'a 30-point hit 0.2 s'); near(C.hitAlpha(st, { flashAmt: 1 }), 0.3, 'peak 0.30'); near(C.hitAlpha(st, { flashAmt: 0.5 }), 0.15, 'Flashes 50%'); assert.equal(C.hitAlpha(st, { flashAmt: 1, reduce: true }), 0, 'Reduce motion: none');
  const x = {}; C.hitStep(x, 110, 0.01, false); C.hitStep(x, 80, 0.01, false); assert.ok(!(x.hitT > 0), 'excluded (Blood Knight / menu): no flash');
  const both = { low: true, ph: 1 / 1.2 / 2, hitT: 0.2, hitDur: 0.2 }; near(C.edgeAlpha(both, { vignette: true, flashAmt: 1 }), 0.3, 'the louder of the two wins, never added');
  let draws = 0; const g = { createRadialGradient: () => ({ addColorStop() {} }), fillRect: () => { draws++; } }; assert.equal(C.drawEdge(g, 320, 180, { low: false }, { vignette: true, flashAmt: 1 }), 0); assert.equal(draws, 0, 'nothing drawn at 0');
  assert.ok(C.drawEdge(g, 320, 180, both, { vignette: true, flashAmt: 1 }) > 0 && draws === 1, 'drawn once when on');
}

/* 5. HEAL: one white frame */
{ const st = {}; C.healFlash(st); assert.equal(C.takeFlash(st), true); assert.equal(C.takeFlash(st), false, 'one frame only'); }

/* 6. PICKUPS: the ladder climbs a semitone inside 0.4 s, cap +8, resets after a gap; arc 8 px over the first 0.36 of the flight; bump 1.2 for 0.1 s */
{
  const st = {}; assert.equal(C.ladderStep(st, 0), 0, 'first coin: no climb'); assert.equal(C.ladderStep(st, 0.3), 1); assert.equal(C.ladderStep(st, 0.6), 2, 'each inside 0.4 s of the last');
  let t = 0.6, n = 0; for (let i = 0; i < 20; i++) { t += 0.2; n = C.ladderStep(st, t); } assert.equal(n, 8, 'capped at +8'); assert.equal(C.ladderStep(st, t + 0.9), 0, 'a gap resets it');
  near(C.semitone(12), 2, 'octave'); near(C.semitone(1), 1.0594631, 'semitone', 1e-6);
  near(C.coinArc(0), 0, 'arc starts at 0'); near(C.coinArc(0.18), 8, 'arc tops at 8 px'); assert.equal(C.coinArc(0.5), 0, 'then the old flight alone'); assert.ok(C.coinArc(0.1) > 0 && C.coinArc(0.1) < 8);
  assert.equal(C.bumpScale(1.05, 1), 1.2); assert.equal(C.bumpScale(1.2, 1), 1); assert.equal(C.bumpScale(1, 5), 1, 'a stamp in the future (-9 default is past) never bumps');
  assert.equal(C.bumpScale(0, -9), 1);
}

/* the shown numbers still go through num-display (this module builds no health string) */
{ const src = fs.readFileSync(new URL('../src/cf-hud.js', import.meta.url), 'utf8'); assert.ok(!/shownHp|toFixed\(1\)/.test(src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')), 'cf-hud builds no health text'); }

/* WIRING GREPS: every main.js call is behind the flag; OFF = the old code path; audio keys exist; nothing registered in check.mjs */
{
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), aud = fs.readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
  assert.ok(main.includes("import * as CF4 from './cf-hud.js'"), 'main imports cf-hud');
  assert.ok(main.includes("CF4.setCF4(c4 !== 'off')"), 'the ?cf4= preview param');
  const calls = (main.match(/CF4\.[a-zA-Z]+/g) || []);
  for (const m of main.matchAll(/CF4\.(popNum|numScale|numColor|drawEdge|ghostOf|healFlash|ladderStep|coinArc|bumpScale|takeFlash)\b/g)) {
    const at = m.index, line = main.slice(main.lastIndexOf('\n', at) + 1, main.indexOf('\n', at));
    assert.ok(/CF4\.CF4_SHIPS|cf4\.bar\.init|bk4 > 1/.test(line) || /^\s*(bar\(|if \(g4|if \(CF4)/.test(line) || line.includes('CF4.CF4_SHIPS'), 'unguarded CF4 call on: ' + line.slice(0, 140));
  }
  assert.ok(calls.length >= 20, 'wired: ' + calls.length);
  assert.ok(main.includes('if (!CF4.CF4_SHIPS && P.hp > 0 && P.hp <= 30 && !P.dead)'), 'the old fixed heart only runs OFF');
  assert.ok(main.includes('if (!CF4.CF4_SHIPS && P.hp > 0 && P.hp <= 30 && state ===') , 'the old fixed vignette only runs OFF');
  assert.ok(main.includes('if (CF4.CF4_SHIPS) cf4Tick(dt);'), 'tick is behind the flag');
  assert.ok(/function cf4Tick[\s\S]*?isReaper\(\)/.test(main) && /function cf4Tick[\s\S]*?introCardUp\(\)/.test(main), 'low HP excludes the Blood Knight and the boss intro card, and menus (state === play)');
  assert.ok(/else bar\(15, 6, 45, 5, P\.hp \/ P\.maxHp, P\.hp > 30/.test(main), 'OFF: the hero bar is the old call');
  assert.ok(main.includes("CF4.CF4_SHIPS) SFX.coinLadder(") && main.includes('else SFX.coinUp(Math.min(coinCombo, 10))'), 'OFF keeps coinUp');
  assert.ok(main.includes('else text(numTxt(n), px, Math.min(VH - 9, py), n.col'), 'OFF: numbers draw as before');
  for (const k of ['lowHeart', 'healUp', 'coinLadder']) assert.ok(new RegExp('^SFX\\.' + k + ' = function', 'm').test(aud), 'audio key ' + k);
  assert.ok(aud.indexOf('SFX.lowHeart') > aud.indexOf('SFX.pLandBig') && aud.indexOf('SFX.lowHeart') < aud.indexOf('export const SFX_NAMES'), 'CF4 SFX block is appended at the end of the SFX definitions');
  const chk = fs.readFileSync(new URL('./check.mjs', import.meta.url), 'utf8'); assert.ok(!/cf4\.mjs/.test(chk), 'cf4.mjs is not registered in check.mjs (integ does that)');
}
console.log('cf4: ok');
