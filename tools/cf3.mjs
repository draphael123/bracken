// tools/cf3.mjs - CF3 FOES (claude/cf3, 11-11): node-only asserts on src/cf-foe.js + wiring greps on main.js / poise-break.js. No browser.
//   node tools/cf3.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as C from '../src/cf-foe.js';
const { CF3 } = C;
const near = (a, b, m, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, m + ': ' + a + ' vs ' + b);

/* the flag ships OFF; the setter flips it */
assert.equal(C.CF3_SHIPS, false, 'CF3_SHIPS ships false'); C.setCF3(true); assert.equal(C.CF3_SHIPS, true); C.setCF3(false); assert.equal(C.CF3_SHIPS, false);

/* 1. FLASH CURVE: white 0.05 s, then a 40% tint fading to 0 at the end of the flash; Flashes slider scales the white; Flashes 0 = tint only; small flashes never white */
{
  const e = { flash: 0.12 }; let p = C.flashPhase(e, 1); assert.equal(p.mode, 'white', 'start is white'); assert.equal(p.a, 1);
  e.flash = 0.069; p = C.flashPhase(e, 1); assert.equal(p.mode, 'tint', 'after 0.05 s the tint'); near(p.a, 0.4, 'tint starts at ~40%', 0.01);
  e.flash = 0.035; p = C.flashPhase(e, 1); near(p.a, 0.4 * 0.035 / 0.07, 'tint half');
  e.flash = 0.0001; p = C.flashPhase(e, 1); assert.ok(p.a < 0.001, 'tint -> 0 at the end');
  e.flash = 0; assert.equal(C.flashPhase(e, 1), null, 'no flash = nothing');
  const z = { flash: 0.14 }; p = C.flashPhase(z, 0); assert.equal(p.mode, 'tint', 'Flashes 0: tint only'); near(p.a, CF3.flash.tint, 'tint a at K0');
  const h = { flash: 0.14 }; p = C.flashPhase(h, 0.5); assert.equal(p.mode, 'tint'); near(p.a, 0.4 + 0.6 * 0.5, 'half Flashes: stronger tint, not white');
  const t = { flash: 0.06 }; p = C.flashPhase(t, 1); assert.equal(p.mode, 'tint', 'a DOT tick flash (0.06) is never the white silhouette');
  const r = { flash: 0.12 }; C.flashPhase(r, 1); r.flash = 0.05; C.flashPhase(r, 1); r.flash = 0.14; assert.equal(C.flashPhase(r, 1).mode, 'white', 'a new blow restarts the white');
  const s = { flash: 0.12 }; C.flashPhase(s, 1); assert.equal(C.flashPhase(s, 1).mode, 'white', 'frozen flash (hit-stop) stays white through the freeze');
}

/* 2. HURT POSE: the delta lands the plan's numbers on top of poseOf's STRUCK block; none for HAS_HURT foes; Reduce motion kills the lean + shove */
{
  const strike = e => { const k = Math.min(1, e.flash / 0.12), d = e.hitDir || -(e.face || 1); return { dx: d * 3.4 * k, dy: 0, sx: 1 + 0.13 * k, sy: 1 - 0.11 * k, rot: d * 0.16 * k }; };
  const e = { flash: 0.12, hitDir: 1 }; let o = strike(e); C.hurtPose(o, e, false, false);
  near(o.dx, 4.0, 'dx 4 px'); near(o.rot, 0.22, 'lean 0.22 rad'); near(o.sx, 1.12, 'sx 1.12'); near(o.sy, 0.90, 'sy 0.90');
  o = strike(e); const before = JSON.stringify(o); C.hurtPose(o, e, false, true); assert.equal(JSON.stringify(o), before, 'a foe WITH hurt frames keeps its frames (no change)');
  o = strike(e); C.hurtPose(o, e, true, false); near(o.dx, 0, 'reduce: no shove'); near(o.rot, 0, 'reduce: lean = 0'); assert.ok(o.sx > 1 && o.sx < 1.12, 'reduce: squash halved');
  const e2 = { flash: 0.06, hitDir: -1 }; o = strike(e2); C.hurtPose(o, e2, false, false); near(o.rot, -0.22 * 0.5, 'eases out with the flash'); near(o.dx, -2.0, 'dx eased');
  const e3 = { flash: 0, hitDir: 1 }; o = { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0 }; C.hurtPose(o, e3, false, false); assert.deepEqual(o, { dx: 0, dy: 0, sx: 1, sy: 1, rot: 0 }, 'no flash = no change');
}

/* 3. STAGGER: sway +-1 px at 6 Hz, off under Reduce motion / when not staggered / when broken; pips: 3, orbiting, static under Reduce motion */
{
  const e = { alive: true, stagger: 1 }; const xs = new Set(); for (let i = 0; i < 60; i++) xs.add(C.swayDx(e, i / 60 * 0.9, false));
  assert.ok([...xs].every(v => Math.abs(v) <= 1), '+-1 px'); assert.ok(xs.has(1) && xs.has(-1), 'it sways both ways');
  assert.equal(C.swayDx(e, 0.04, true), 0, 'Reduce motion: no sway'); assert.equal(C.swayDx({ alive: true, stagger: 0 }, 0.04, false), 0); assert.equal(C.swayDx({ alive: true, stagger: 1, broken: 1 }, 0.04, false), 0, 'broken: staggerPose owns it');
  near(Math.abs(C.swayDx(e, 1 / 24, false)), 1, 'peak at the quarter period of 6 Hz');
  assert.equal(C.pipPoints(0, 0, 0.3, false).length, 3, '3 pips'); assert.deepEqual(C.pipPoints(0, 0, 0.1, true), C.pipPoints(0, 0, 9.9, true), 'static under Reduce motion'); assert.notDeepEqual(C.pipPoints(0, 0, 0.1, false), C.pipPoints(0, 0, 0.3, false), 'orbit moves');
  assert.equal(C.openPulseAlpha(0, true), 1, 'reduce: no pulse'); const al = []; for (let i = 0; i < 100; i++) al.push(C.openPulseAlpha(i / 100, false));
  assert.ok(Math.min(...al) >= 0.65 - 1e-9 && Math.max(...al) <= 1 + 1e-9, 'pulse stays 0.65..1'); assert.ok(Math.max(...al) - Math.min(...al) > 0.3, 'and it does pulse (2 Hz)');
}

/* 4. TELL RISE / GLINT: commons only, once per windup, reduce = no rise */
{
  const e = {}, o = { dy: 0 }; C.tellRise(o, e, 10, false); assert.equal(e.cfInWind, true); assert.equal(o.dy, -2, '2 px rise at the start'); assert.equal(C.glintOn(e, 10.02), true, 'glint on the first frame'); assert.equal(C.glintOn(e, 10.2), false, 'glint is one frame');
  const o2 = { dy: 0 }; C.tellRise(o2, e, 10.2, false); assert.equal(o2.dy, 0, 'rise is over'); assert.equal(e.cfTellAt, 10, 'same windup keeps its start'); C.tellEnd(e); C.tellRise({ dy: 0 }, e, 11, false); assert.equal(e.cfTellAt, 11, 'a new windup restarts');
  const b = { maxHp: 100 }, ob = { dy: 0 }; C.tellRise(ob, b, 10, false); assert.equal(ob.dy, 0, 'a boss tell is never touched'); assert.equal(b.cfInWind, undefined); const m = { mini: true }; C.tellRise(ob, m, 10, false); assert.equal(ob.dy, 0);
  const r = {}, orr = { dy: 0 }; C.tellRise(orr, r, 5, true); assert.equal(orr.dy, 0, 'reduce: no rise');
}

/* 5. KILL POP + 6. BOSS DEATH */
{
  C.clearFx(); const set = {}, e = { x: 10, y: 20, face: 1, lastSet: set, lastFrame: 3, lastBigF: 1 };
  let k = C.onKill(e, 1, { boss: false, mini: false, flashK: 1, hitstop: true, reduce: false, final: true }); assert.equal(C.FX.length, 1); near(C.FX[0].s, 1.15, 'pop scale 1.15'); near(C.FX[0].t, 2 / 60, '2 frames'); assert.equal(k.chips, 0); assert.equal(k.slow, null, 'a common kill never slows time');
  k = C.onKill(e, 1, { boss: false, mini: true, flashK: 1, hitstop: true, reduce: false, final: true }); assert.equal(k.chips, 6, 'minis / big foes: +6 chips'); assert.equal(k.slow, null);
  C.clearFx(); k = C.onKill({ ...e, lastBigF: 1.3 }, 1, { boss: true, mini: false, flashK: 1, hitstop: true, reduce: false, final: true }); near(C.FX[0].t, 3 / 60, 'boss: 3 frames'); near(C.FX[0].s, 1.3 * 1.05, 'boss pop scale');
  assert.deepEqual(k.slow, { t: 0.6, k: 0.35 }, 'boss death slow-mo 0.35x 0.6 s'); near(k.duck, 0.63, 'music duck about -4 dB', 0.01); assert.equal(k.chips, 6);
  k = C.onKill(e, 1, { boss: true, flashK: 1, hitstop: false, reduce: false, final: true }); assert.equal(k.slow, null, 'Hit stop OFF: no slow-mo');
  k = C.onKill(e, 1, { boss: true, flashK: 1, hitstop: true, reduce: true, final: true }); assert.equal(k.slow, null, 'Reduce motion: no slow-mo');
  C.clearFx(); C.onKill(e, 1, { boss: false, flashK: 0, hitstop: true, reduce: false, final: true }); assert.equal(C.FX.length, 0, 'Flashes 0: no white pop');
  C.clearFx(); C.onKill({ x: 0, y: 0 }, 1, { boss: false, flashK: 1 }); assert.equal(C.FX.length, 0, 'no sprite remembered = no pop');
  C.clearFx(); C.onKill(e, 1, { flashK: 1 }); C.tick(0.02); assert.equal(C.FX.length, 1); C.tick(0.02); assert.equal(C.FX.length, 0, 'the pop is gone after its frames');
}

/* 6. BOSS HIT KIND: resisted (<= 60% outside an opening) -> grey-white; opening -> gold; a guard (clink) and non-bosses untouched; feedback only */
{
  const b = { maxHp: 100 };
  assert.equal(C.bossHitKind(b, 3, 10, 1), 'resist'); assert.equal(C.bossHitKind(b, 0, 10, 1), 'resist', 'a fully resisted blow still READS as landed (the star is feedback only)'); assert.equal(C.bossHitKind(b, 6, 10, 1), 'resist'); assert.equal(C.bossHitKind(b, 7, 10, 1), null, 'near-full blows need no star');
  assert.equal(C.bossHitKind({ maxHp: 100, open: 1 }, 10, 10, 1), 'open'); assert.equal(C.bossHitKind({ maxHp: 100, broken: 1 }, 2, 10, 1), 'open', 'a broken boss is an opening: gold');
  assert.equal(C.bossHitKind({ maxHp: 100, glancedAt: 5 }, 0, 10, 5), null, 'a glance is the clink\'s'); assert.equal(C.bossHitKind({ hp: 5 }, 0, 10, 1), null, 'a common foe: none'); assert.equal(C.bossHitKind(b, 0, 0, 1), null, 'a blow that did nothing');
  C.clearFx(); C.bossStar({ maxHp: 100, x: 0, y: 0, w: 20, h: 30 }, 'resist', 1); assert.equal(C.FX.length, 1); assert.equal(C.FX[0].col, '#d8dde4'); C.bossStar({ maxHp: 1, x: 0, y: 0 }, 'open', -1); assert.equal(C.FX[1].col, '#ffd36b'); C.bossStar({ x: 0, y: 0 }, null, 1); assert.equal(C.FX.length, 2, 'null kind = nothing'); C.clearFx();
}
/* the ring: once per break */
{
  C.clearFx(); const e = { x: 0, y: 0, h: 16, broken: 1.8 }; C.breakRing(e, 1); C.breakRing(e, 1); assert.equal(C.FX.length, 1, 'one ring per break'); assert.equal(C.FX[0].r, 9, '18 px ring');
  e.broken = 0; C.breakRing(e, 1); e.broken = 1; C.breakRing(e, 0); assert.equal(C.FX.length, 1, 'Flashes 0: no ring'); C.clearFx();
}
/* drawFx runs on a stub canvas */
{
  C.clearFx(); C.onKill({ x: 5, y: 5, face: 1, lastSet: {}, lastFrame: 0 }, 1, { flashK: 1 }); C.bossStar({ maxHp: 1, x: 0, y: 0 }, 'resist', 1); C.breakRing({ x: 0, y: 0, broken: 1 }, 1);
  const calls = []; const g = new Proxy({}, { get: (_, k) => (...a) => { calls.push(k); }, set: () => true }); let sets = 0; C.drawFx(g, 0, 0, () => { sets++; });
  assert.equal(sets, 1, 'the pop draws a silhouette'); assert.ok(calls.includes('fillRect') && calls.includes('arc')); C.clearFx();
}

/* WIRING: every main.js call is guarded by the flag; OFF paths are the old code */
const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), pb = fs.readFileSync(new URL('../src/poise-break.js', import.meta.url), 'utf8');
const has = (s, m) => assert.ok(s.includes(m), 'missing: ' + m);
has(main, "import * as CF3 from './cf-foe.js'"); has(main, "q.get('cf3')"); has(main, "CF3.setCF3(cq !== 'off')");
const uses = main.split('\n').filter(l => /CF3\.(flashPhase|hurtPose|swayDx|tellRise|tellEnd|glintOn|breakRing|drawGlint|drawPips|pipPoints|drawFx|tick|onKill|bossStar|bossHitKind|clearFx)\b/.test(l));
assert.ok(uses.length >= 9, 'hooks present: ' + uses.length);
for (const l of uses) assert.ok(/CF3\.CF3_SHIPS/.test(l), 'unguarded CF3 call: ' + l.slice(0, 140));
has(main, 'const wdtAll = (slowT > 0 ? dt * 0.3 : cfSlowT > 0 ? dt * cfSlowK : dt) * (SET.speed || 1);');   // OFF: cfSlowT stays 0 -> the old expression
has(main, 'let cfSlowT = 0, cfSlowK = 1;');
assert.equal(main.split('cfSlowT = Math.max(cfSlowT, k.slow.t)').length - 1, 1, 'cfSlowT is raised in one place');
assert.ok(/if \(CF3\.CF3_SHIPS\) \{ const isB[^\n]*cfSlowT = Math\.max\(cfSlowT, k\.slow\.t\)/.test(main), '... and only inside the CF3 guard');
has(pb, 'drawOpen(g, e, x, y, now, ready, pulse = false)'); has(main, 'finishReady(e, P, bl), CF3.CF3_SHIPS && !SET.reduceMotion)');
/* CF3 never edits hurtEnemy0's hit branch: no CF3 token inside the function */
{ const a = main.indexOf('function hurtEnemy0('), m = main.slice(a + 10).search(/\r?\nfunction /); assert.ok(a > 0 && m > 0); assert.ok(!main.slice(a, a + 10 + m).includes('CF3'), 'no CF3 token inside hurtEnemy0'); }
console.log('cf3.mjs OK');
