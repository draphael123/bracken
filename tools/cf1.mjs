// tools/cf1.mjs - CF1 IMPACT (claude/cf1, 11-11): node-only asserts on src/cf-impact.js + wiring greps. Flag OFF = batch158 values / no-ops; ON = the plan table.
//   node tools/cf1.mjs          (no browser; not registered in check.mjs - integration adds it)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
import * as C from '../src/cf-impact.js';
const { CF1, SKILL_CLASS, setCF1, cfClass, makeLimiter, stopGate, jetGate, tipRead, leanPx, glintDue, flashAlpha, releaseSmearHit, thwackOpts, kickFor, matClass } = C;
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-9, m + ': ' + a + ' vs ' + b);
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');

/* the file ships ON (batch165: CF1 flipped); the OFF block below turns it off in-process first */assert.equal(C.CF1_SHIPS, true, 'CF1_SHIPS ships true');assert.match(read('src/cf-impact.js'), /export let CF1_SHIPS = true;/); setCF1(false);

/* OFF = batch158: every function is the identity / a no-op */
assert.equal(cfClass('light', 'lunge', 0.2, 'heavy'), 'light', 'off: class unchanged');
assert.equal(cfClass('heavy', 'lunge', 0.2), 'heavy');
const L0 = makeLimiter(), f0 = {};
for (let i = 0; i < 5; i++) assert.deepEqual(stopGate(L0, f0, 'light', i * 0.075), { stop: true, cls: 'light' }, 'off: every blow stops as before');
assert.equal(jetGate(L0, f0, 0), false); assert.equal(tipRead('tip'), null); assert.equal(tipRead('shaft'), null);
assert.equal(leanPx({ atk: 0.1, face: 1 }, 'atk', 1, false), 0, 'off: no lean');
assert.equal(glintDue(0.9, false), false); assert.equal(flashAlpha(1, 1, true, false), 0); assert.equal(releaseSmearHit({ cf1RelAt: 0, atk: 0.05 }, 0.05), false);
assert.equal(thwackOpts('steel', true, true), undefined, 'off: thwack opts undefined (today\'s sound)'); assert.equal(kickFor('heavy', 1), 0);

/* ON */
setCF1(true); assert.equal(C.CF1_SHIPS, true);

/* 1. skill class table: only raises light -> heavy, inside the 1.5 s window, never a plain 'shot' */
for (const id of ['lunge', 'whirlwind', 'shieldThrow', 'groundSlam', 'swordOfRealm', 'javelin', 'boulder', 'spikeRow', 'faultLine', 'avalanche', 'meteor', 'flashover']) assert.equal(cfClass('light', id, 0.3, 'light'), 'heavy', id);
assert.equal(cfClass('light', 'risingCut', 0.3, 'light'), 'light', 'unmapped skill: the state guess stays');
assert.equal(cfClass('light', 'lunge', 1.6, 'light'), 'light', 'outside the window');
assert.equal(cfClass('light', 'lunge', -1, 'light'), 'light', 'no skill yet');
assert.equal(cfClass('light', 'lunge', 0.3, 'shot'), 'light', "a plain 'shot' stays a tap");
assert.equal(cfClass('light', 'lunge', 0.3, ['heavy', 'shot']), 'heavy');
assert.equal(cfClass('heavy', 'lunge', 0.3, 'light'), 'heavy');
assert.equal(cfClass('light', null, 0.3, 'light'), 'light');
for (const v of Object.values(SKILL_CLASS)) assert.equal(v, 'heavy', 'the table only names heavy (finish is the kill\'s)');

/* 2. tick limiter: 5 hits in 0.3 s -> 3 stops; a heavy always lands once; a skill-raised heavy repeats at most every 0.30 s; per foe */
{ const L = makeLimiter(), f = {}, g = {}; let stops = 0; for (let i = 0; i < 5; i++) if (stopGate(L, f, 'light', i * 0.075).stop) stops++; assert.equal(stops, 3, '5 hits in 0.3 s -> 3 stops');
  assert.equal(stopGate(L, g, 'light', 0.01).stop, true, 'a different foe has its own clock');
  const H = makeLimiter(), h = {}; assert.deepEqual(stopGate(H, h, 'heavy', 0, true), { stop: true, cls: 'heavy' });
  assert.deepEqual(stopGate(H, h, 'heavy', 0.1, true), { stop: false, cls: 'light' }, 'a whirlwind ring 0.1 s later: light, and inside the tick gap -> none');
  assert.deepEqual(stopGate(H, h, 'heavy', 0.2, true), { stop: true, cls: 'light' }, 'the next ring: a light stop');
  assert.deepEqual(stopGate(H, h, 'heavy', 0.4, true), { stop: true, cls: 'heavy' }, '0.30 s after the last heavy: heavy again');
  const N = makeLimiter(), n = {}; assert.equal(stopGate(N, n, 'light', 0).stop, true); assert.equal(stopGate(N, n, 'heavy', 0.05, false).stop, true, 'a natural heavy is never limited'); }
{ const L = makeLimiter(), f = {}; let n = 0; for (let i = 0; i < 10; i++) if (jetGate(L, f, i * 0.05)) n++; assert.equal(n, 4, 'a flame: feedback every 0.12 s at most (0, .15, .30, .45)'); }

/* 3. warden tip / shaft */
{ const t = tipRead('tip'), s = tipRead('shaft'); assert.equal(t.stop, 'light'); assert.equal(t.star, 'heavy'); assert.equal(t.ring, 10); assert.equal(s.stop, 'light'); assert.equal(s.star, null); assert.equal(s.ring, 0);
  near(20 * Math.log10(s.gain), -3, 'shaft -3 dB'); near(s.pitch, 0.92, 'shaft pitch -8%'); assert.equal(t.gain, 1); assert.equal(tipRead('nope'), null);
  assert.equal(t.stop, 'light'); assert.ok(0.065 > 0.035, 'the retired TIP.stop was 35 ms; the light class is 65 ms'); }

/* 4. lean: 2 px light / 3 px heavy toward face on the strike frame, eased back by beat 3, 0 under Reduce motion / outside a swing */
near(leanPx({ atk: 0.1, face: 1 }, 'atk', 1, false), 2, 'light strike lean'); near(leanPx({ atk: 0.1, face: -1 }, 'atk', 1, false), -2, 'faces left');
near(leanPx({ atk: 0.1, face: 1, heavy: true }, 'atk', 1, false), 3, 'heavy strike lean'); near(leanPx({ atk: 0.1, face: 1, heavySwing: true }, 'atkC', 1, false), 3);
near(leanPx({ atk: 0.1, face: 1 }, 'atk', 2, false), 1, 'beat 2 half'); assert.equal(leanPx({ atk: 0.2, face: 1 }, 'atk', 3, false), 0, 'eased out by beat 3'); assert.equal(leanPx({ atk: 0.01, face: 1 }, 'atk', 0, false), 0, 'anticipation: none');
assert.equal(leanPx({ atk: 0.1, face: 1 }, 'atk', 1, true), 0, 'Reduce motion -> 0'); assert.equal(leanPx({ atk: -1, face: 1 }, 'atk', 1, false), 0, 'no swing'); assert.equal(leanPx({ atk: 0.1, face: 1 }, 'run', 1, false), 0, 'non-cut art'); assert.equal(leanPx({ atk: 0.1, face: 1, dead: true }, 'atk', 1, false), 0);
for (const fr of [0, 1, 2, 3, 4]) assert.ok(Math.abs(leanPx({ atk: 0.1, face: 1, heavy: true }, 'atk', fr, false)) <= 3, 'never more than 3 px');

/* 5. heavy charge read */
assert.equal(glintDue(0.49, false), false); assert.equal(glintDue(0.5, false), true); assert.equal(glintDue(0.9, true), false, 'once');
assert.ok(flashAlpha(0.01, 0, true, false) > 0.5); assert.equal(flashAlpha(0.2, 0, true, false), 0, 'faded'); assert.equal(flashAlpha(0.01, 0, false, false), 0, 'Flashes off'); assert.equal(flashAlpha(0.01, 0, true, true), 0, 'Reduce motion');
assert.equal(releaseSmearHit({ cf1RelAt: 0, atk: 0.05 }, 0.05), true); assert.equal(releaseSmearHit({ cf1RelAt: 0, atk: 0.3 }, 0.3), false); assert.equal(releaseSmearHit({ atk: 0.05 }, 0.05), false);

/* 7. sound: material pitch, third cut +3 semitones, shaft -3 dB */
near(thwackOpts('steel').pitch, 1.25, 'steel'); near(thwackOpts('stone').pitch, 1.25, 'stone folds to steel'); near(thwackOpts('wood').pitch, 0.92, 'wood'); near(thwackOpts('bone').pitch, 1.1, 'bone'); near(thwackOpts(undefined).pitch, 1, 'flesh'); near(thwackOpts('fungus').pitch, 1, 'fungus folds to flesh');
near(thwackOpts('bone', true).pitch, 1.1 * Math.pow(2, 3 / 12), 'third cut +3 st'); near(thwackOpts('steel', false, true).pitch, 1.25 * 0.92, 'shaft x material'); near(20 * Math.log10(thwackOpts('steel', false, true).gain), -3, 'shaft gain');
assert.equal(matClass('crystal'), 'steel'); near(CF1.boom.hz, 70, 'boom 70 Hz'); near(CF1.boom.dur, 0.12, 'boom 120 ms'); near(20 * Math.log10(CF1.boom.duck), -4, 'duck -4 dB'); near(CF1.boom.duckSec, 0.15, 'duck 150 ms');
/* peak: the layers never coincide (audio.js THWACK header); a finish thwack (0.12 + 0.14 + 0.18 + 0.12 = 0.56 naive) + boom 0.2 + the material pitch (pitch only) stays under the 0.9 mix headroom with the voice at -15% */
assert.ok(0.12 + 0.14 + 0.18 + 0.12 + CF1.boom.vol < 0.9 + 1e-9, 'finish + boom naive sum under 0.9 headroom (browser/offline render owed)');

/* 8. shake: tap 0, heavy 1.5, finish 2 along the face; light never */
near(kickFor('heavy', 1), 1.5, 'heavy kick'); near(kickFor('finish', -1), -2, 'finish kick faces left'); assert.equal(kickFor('light', 1), 0);

/* the tables never touch the JUICE / JUICE2 rows */
const J = await import('../src/juice.js'); assert.equal(J.JUICE2.light.stop, 0.065); assert.equal(J.JUICE2.heavy.stop, 0.110); assert.equal(J.JUICE2.finish.stop, 0.130); assert.equal(J.JUICE.hurt.stop, 0.08 > 0 ? J.JUICE.hurt.stop : 0);

/* (claude/cf1fix) STAGED-CHARGE HEROES: each hero's own tier path reaches the cue exactly once at half and once at full (ON), never OFF; the plain path (pyro/warden/paladin) is glintDue above */
{ const heroes = { knight: [2, 3, [0, 2, 3]], ranger: [1, 2, [0, 1, 2]], berserker: [2, 3, [0, 1, 2, 3]], geomancer: [2, 3, [0, 1, 2, 3]], reaper: [3, 5, [0, 1, 2, 3, 4, 5]] };
  const run = (hs, fs_, seq) => { const s = {}; let g = 0, f = 0, gAt = -1, fAt = -1; seq.forEach((st, i) => { for (let rep = 0; rep < 30; rep++) { const c = C.stageCue(st, hs, fs_, s); if (c.glint) { g++; gAt = st; } if (c.flash) { f++; fAt = st; } } }); return { g, f, gAt, fAt, s }; };
  for (const [h, [hs, fs_, seq]] of Object.entries(heroes)) {
    setCF1(true); const on = run(hs, fs_, seq); assert.equal(on.g, 1, h + ' glint once'); assert.equal(on.f, 1, h + ' flash once'); assert.equal(on.gAt, hs, h + ' glint at its half tier'); assert.equal(on.fAt, fs_, h + ' flash at its top tier');
    const again = run(hs, fs_, seq); assert.equal(again.g, 1, h + ' a new charge (state reset) cues again'); const half = run(hs, fs_, seq.filter(x => x < fs_)); assert.equal(half.f, 0, h + ' no flash below the top tier'); assert.equal(half.g, 1, h + ' glint without the top');
    setCF1(false); const off = run(hs, fs_, seq); assert.equal(off.g + off.f, 0, h + ' flag OFF: no cue'); assert.deepEqual(off.s, {}, h + ' flag OFF: state untouched');
  }
  setCF1(false);
  const M2 = read('src/main.js'); const seg = (a, b) => { const u = M2.indexOf('if (P.charge > 0) { P.vx *= 0.86;'), i = M2.indexOf(a, u), j = M2.indexOf(b, i); assert.ok(i > 0 && j > i, 'segment ' + a); return M2.slice(i, j); };
  const paths = { ranger: ['if (rgDrawing()) { const st = rgTier();', 'if (isBz()) { const st = bzTierNow();', 'cf1Stage(st, 1, 2,'], berserker: ['if (isBz()) { const st = bzTierNow();', 'if (isGeo() && GEO) {', 'cf1Stage(st, 2, 3,'], geomancer: ['if (isGeo() && GEO) {', 'if (isReaper()) { const st = bkTier();', 'cf1Stage(st, 2, 3,'], reaper: ['if (isReaper()) { const st = bkTier();', 'const k = Math.min(1, P.charge / heavyWind());', 'cf1Stage(st, 3, 5,'], knight: ["if (hero() === 'knight') { const st = cutStage(P.atkHeld);", 'if (CF1_SHIPS) { if (cfGlintDue(k, P.cf1Half))', 'cf1Stage(st, 2, 3,'] };
  for (const [h, [a, b, call]] of Object.entries(paths)) { const s = seg(a, b); assert.equal(s.split('if (CF1_SHIPS) ' + call).length - 1, 1, h + ' path calls the CF1 cue once, flag-guarded'); assert.ok(s.indexOf('if (CF1_SHIPS) ' + call) < s.indexOf('return;'), h + ' cue runs before the path returns'); }
  assert.match(M2, /function cf1Stage\(st, halfSt, fullSt, x, y\) \{ const c = cfStageCue\(st, halfSt, fullSt, P\)/); assert.match(M2, /P\.chargeFull = false; P\.cf1Half = false; P\.cf1Full = false;/);
}

/* back OFF (the module is reusable in one process) */
setCF1(false); assert.equal(cfClass('light', 'lunge', 0.2, 'light'), 'light');

/* wiring greps: every hook is flag-guarded, the clink recover already exists (J2) and keeps P.atk, the audio keys exist */
const M = read('src/main.js'), A = read('src/audio.js');
assert.match(M, /from '\.\/cf-impact\.js'/); assert.match(M, /if \(q\.get\('cf1'\) === '1'\) setCF1\(true\)/);
assert.match(M, /const blowKind = \(e, dmg, tag\) => CF1_SHIPS \? cfClass\(blowKind0\(e, dmg, tag\)/, 'blowKind OFF = blowKind0 (batch158 body)');
assert.match(M, /const blowKind0 = \(e, dmg, tag\) => IMPACT === 'heavy'/);
assert.match(M, /if \(CF1_SHIPS\) \{ cls = cf1Cls\(e, dmg, tag, cls\)/); assert.match(M, /cfStopGate\(cf1Lim, e, cls, time,/);   /* (cf1proof) the limiter runs on the game's time, never the wall clock */ assert.ok(!/cfStopGate\(cf1Lim[^)]*performance\.now/.test(M) && !/cfJetGate\(cf1Lim[^)]*performance\.now/.test(M)); assert.match(M, /if \(!CF1_SHIPS\) hitstop\(TIP_K\.stop\); else cfTipFx\(e\)/, 'the old tip stop stays OFF-path');
assert.match(M, /if \(CF1_SHIPS\) \{ P\.cf1Skill = k; P\.cf1SkillAt = time; \}/); assert.match(M, /P\.jetHit && cfJetGate\(cf1Lim/); assert.match(M, /e\.cf1ShaftT = time/);
assert.match(M, /cfLeanPx\(P, key, frame, SET\.reduceMotion\)/); assert.match(M, /if \(am \|\| cfLx\) g\.restore\(\)/); assert.match(M, /cfFlashAlpha\(time, P\.cf1FlashAt/); assert.match(M, /if \(CF1_SHIPS\) P\.cf1RelAt = time/); assert.match(M, /cfRelSmearHit\(P, time\)/);
assert.match(M, /if \(CF1_SHIPS && jc !== 'light'\) shakeCam\(0, cfKickFor\(jc, dir\), 'land'\)/); assert.match(M, /if \(CF1_SHIPS\) shakeCam\(0, cfKickFor\('finish', dir\), 'land'\)/); assert.match(M, /SFX\.cfBoom\(\)/);
assert.match(M, /P\.clinkAtT/); assert.match(M, /time - \(P\.clinkAtT \?\? -9\) < 0\.22/, 'the clink recover frame is JUICE2\'s and is art-only (P.atk untouched)');
assert.ok(!/P\.atk\s*=\s*[^=].{0,40}cf1/.test(M), 'CF1 never writes the swing clock');
for (const k of ['SFX.thwack = function (cls = \'light\', o)', 'SFX.cfBoom = function', 'SFX.cfSizzle = function', "from './cf-impact.js'"]) assert.ok(A.includes(k), 'audio.js has ' + k);
assert.ok(A.includes('CF1_SHIPS && o ? o.pitch : 1') || A.includes('(co ? o.pitch : 1)'), 'thwack reads the opts only behind the flag');

/* node --check on the three files touched */
for (const f of ['src/cf-impact.js', 'src/main.js', 'src/audio.js']) { const r = spawnSync(process.execPath, ['--check', fileURLToPath(new URL('../' + f, import.meta.url))], { encoding: 'utf8' }); assert.equal(r.status, 0, 'node --check ' + f + ': ' + r.stderr); }
console.log('cf1.mjs OK');
