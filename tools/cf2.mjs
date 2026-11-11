// tools/cf2.mjs - CF2 PLATFORM FEEL (claude/cf2): node-only asserts + the measurement table (no browser).
//   node tools/cf2.mjs            asserts, then prints the table
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MOVE, HERO_MOVE_IDS, heroRunMul } from '../src/hero-move.js';
import { flight, runUp } from '../src/reach-hero.js';
import * as C from '../src/cf-platform.js';
const { setCF2, arcStep, cutVy, apexG, cornerList, lipNudge, CF2 } = C;
const DT = MOVE.DT;
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-9, m + ': ' + a + ' vs ' + b);

/* ONE jump through the module's own arc step (+ air control as updatePlayer: ACC_AIR toward the hero's air cap, stick forward when run). release = the frame jump is let go. */
function jump(hero, run, release = Infinity) {
  const s = { vy: MOVE.JUMPV, cfHop: false }; let y = 0, x = 0, peak = 0, frames = 0, hang = 0;
  const cap = MOVE.RUN * heroRunMul(hero, false); let vx = run ? runUp(hero, 24 * 16).vx : 0;
  for (let i = 0; i < 2000; i++) {
    if (run) { if (vx > cap) vx = Math.max(cap, vx - MOVE.OVER_BLEED * DT); else { vx += MOVE.ACC_AIR * DT; if (vx > cap) vx = cap; } }
    arcStep(s, i < release);
    if (Math.abs(s.vy) < MOVE.APEX_VY) hang++;
    y -= s.vy * DT; x += vx * DT; frames++; peak = Math.max(peak, y);
    if (y <= 0 && s.vy > 0) break;
  }
  return { peak, frames, x, hang };
}
/* batch158's arc written out by hand (the 1-frame snap, the plain 0.62 apex) - the OFF reference */
function old(hero, run, release) {
  let vy = MOVE.JUMPV, y = 0, x = 0, peak = 0, frames = 0, vx = run ? runUp(hero, 384).vx : 0; const cap = MOVE.RUN * heroRunMul(hero, false);
  for (let i = 0; i < 2000; i++) {
    if (run) { if (vx > cap) vx = Math.max(cap, vx - MOVE.OVER_BLEED * DT); else { vx += MOVE.ACC_AIR * DT; if (vx > cap) vx = cap; } }
    if (!(i < release) && vy < MOVE.JUMP_CUT) vy = MOVE.JUMP_CUT;
    vy += MOVE.GRAV * DT * (Math.abs(vy) < MOVE.APEX_VY ? MOVE.APEX_G : vy < 0 ? 1 : MOVE.FALL_G); if (vy > MOVE.MAX_FALL) vy = MOVE.MAX_FALL;
    y -= vy * DT; x += vx * DT; frames++; peak = Math.max(peak, y); if (y <= 0 && vy > 0) break;
  }
  return { peak, frames, x };
}

/* 1. the frozen base numbers; flag ships OFF */
assert.equal(MOVE.JUMPV, -320); assert.equal(MOVE.GRAV, 1000); assert.equal(MOVE.RUN, 92); assert.equal(MOVE.FALL_G, 1.2); assert.equal(MOVE.MAX_FALL, 270); assert.equal(MOVE.APEX_G, 0.62); assert.equal(MOVE.JUMP_CUT, -110);
assert.equal(C.CF2_SHIPS, false, 'ships OFF');

/* 2. FLAG OFF == batch158 (9 heroes x stand/run x five release frames, incl. never) */
setCF2(false);
for (const h of HERO_MOVE_IDS) for (const run of [0, 1]) for (const rel of [Infinity, 0, 3, 8, 20]) {
  const a = jump(h, run, rel), b = old(h, run, rel);
  near(a.peak, b.peak, 'OFF peak ' + h + run + rel); assert.equal(a.frames, b.frames, 'OFF frames ' + h + run + rel); near(a.x, b.x, 'OFF x ' + h + run + rel);
}
assert.equal(cutVy(-300, {}), MOVE.JUMP_CUT); assert.equal(apexG(false, { cfHop: true }), MOVE.APEX_G); assert.deepEqual(cornerList(), [-3, 3, -5, 5]);
assert.equal(lipNudge(() => true, 40, 40, 1, -100), null);

/* 3. FLAG ON: the FULL HELD jump is identical (HARD RULE), 9 heroes x stand/run, and matches src/reach-hero.js's own flight */
const rows = [];
for (const h of HERO_MOVE_IDS) for (const run of [0, 1]) {
  setCF2(false); const off = jump(h, run); setCF2(true); const on = jump(h, run);
  near(on.peak, off.peak, 'HELD peak ' + h + run); assert.equal(on.frames, off.frames, 'HELD airtime ' + h + run); near(on.x, off.x, 'HELD reach ' + h + run); assert.equal(on.hang, off.hang, 'HELD hang ' + h + run);
  const fl = flight(h, run ? runUp(h, 24 * 16) : { vx: 0 }).rise;
  assert.ok(Math.abs(off.peak - fl) < 1.5, 'reach-hero rise ' + h + run + ': ' + off.peak + ' vs ' + fl);
  rows.push([h, run ? 'run  ' : 'stand', off.peak.toFixed(2), on.peak.toFixed(2), off.frames, on.frames, off.x.toFixed(1), on.x.toFixed(1)]);
}
/* a release after the apex band never cuts: identical */
for (const rel of [40, 60]) { setCF2(false); const a = jump('knight', 1, rel); setCF2(true); const b = jump('knight', 1, rel); near(a.peak, b.peak, 'late release peak'); assert.equal(a.frames, b.frames, 'late release frames'); near(a.x, b.x, 'late release x'); }

/* 4. the eased cut: not the 1-frame snap; reaches JUMP_CUT on frame 2; short hop peak up by at most 3 px, airtime never longer */
setCF2(true);
{ let v = -320; const seq = [], p = { cfHop: false }; for (let i = 0; i < 4; i++) { if (v < MOVE.JUMP_CUT) v = cutVy(v, p); seq.push(+v.toFixed(1)); v += 1000 * DT; }
  assert.ok(seq[0] < MOVE.JUMP_CUT, 'frame 1 is not the full snap: ' + seq); assert.equal(seq[1], MOVE.JUMP_CUT, 'frame 2 reaches the cut: ' + seq); assert.ok(p.cfHop); }
const hops = [];
for (const h of HERO_MOVE_IDS) for (const rel of [1, 3, 6, 10, 14]) {
  setCF2(false); const a = jump(h, 0, rel); setCF2(true); const b = jump(h, 0, rel); const d = b.peak - a.peak;
  assert.ok(Math.abs(d) <= 3, 'short hop peak within 3 px ' + h + rel + ': ' + d.toFixed(2)); assert.ok(b.frames <= a.frames, 'hop airtime not longer ' + h + rel);
  if (h === 'knight') hops.push([rel, a.peak.toFixed(2), b.peak.toFixed(2), a.frames, b.frames]);
}
/* held-only apex hang */
assert.equal(apexG(true, { cfHop: true }), MOVE.APEX_G); assert.equal(apexG(false, { cfHop: true }), CF2.hopApexG); assert.equal(apexG(false, { cfHop: false }), MOVE.APEX_G, 'a walk-off fall keeps 0.62');

/* 5. corner + lip */
assert.deepEqual(cornerList(), [-3, 3, -5, 5, -6, 6]);
{ const solid = (x, y) => y === 5 && x >= 3;   /* a ledge: row 5 solid from column 3, nothing above; TS 16 */
  assert.deepEqual(lipNudge(solid, 3 * 16 - 7, 5 * 16 + 2, 1, -100), { dy: -2, dx: 2 }, 'lip 2 px under the top: stepped onto');
  assert.equal(lipNudge(solid, 3 * 16 - 7, 5 * 16 + 5, 1, -100), null, '> 3 px: no');
  assert.equal(lipNudge(solid, 3 * 16 - 7, 5 * 16 + 2, 1, 50), null, 'falling: the mantle owns it');
  assert.equal(lipNudge(solid, 3 * 16 - 7, 5 * 16 + 2, 0, -100), null, 'no stick: no');
  assert.equal(lipNudge((x, y) => y >= 4 && x >= 3, 3 * 16 - 7, 5 * 16 + 2, 1, -100), null, 'a wall (block above): no'); }
setCF2(false); assert.equal(lipNudge(() => true, 0, 0, 1, -100), null);

/* 6. wiring greps + untouched files */
const rd = p => readFileSync(new URL(p, import.meta.url), 'utf8'), M = rd('../src/main.js');
for (const g of ["import * as CF2 from './cf-platform.js'", 'CF2.cutVy(P.vy, P)', 'CF2.apexG(!!keys.jump, P)', 'CF2.cornerList()', 'CF2.lipNudge(isSolid', "q.get('cf2')", 'P.cfHop = false']) assert.ok(M.includes(g), 'main.js has ' + g);
assert.ok(!M.includes('CF2.setCF2(true)'), 'main.js never switches it on by itself');
assert.ok(rd('../src/hero-move.js').includes('JUMPV: -320'), 'hero-move.js untouched');
assert.ok(!rd('./check.mjs').includes('cf2.mjs'), 'not registered in check.mjs');
console.log('cf2: OK (' + rows.length + ' held-jump rows identical ON/OFF)');

console.log('\nheld jump OFF vs ON: hero, start, peak px (off/on), airtime frames (off/on), reach px (off/on)');
for (const r of rows) console.log(r.join('\t'));
console.log('\nknight short hop, release frame / peak px off,on / airtime off,on'); for (const r of hops) console.log(r.join('\t'));
const cf = Math.round(MOVE.COYOTE / DT), bf = Math.round(0.12 / DT);
console.log('\nanalytic: coyote ' + cf + ' world frames (' + (cf / 0.6).toFixed(1) + ' real @60%, ' + cf + ' @100%); buffer ' + (bf - 1) + '-' + bf + ' (' + ((bf - 1) / 0.6).toFixed(1) + ' real @60%); accel-to-cap ' + (MOVE.RUN / MOVE.ACC_GROUND / DT).toFixed(1) + ' world; stop ' + (MOVE.RUN / MOVE.FRIC_GROUND / DT).toFixed(1) + ' world');
