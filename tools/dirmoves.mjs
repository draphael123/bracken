// tools/dirmoves.mjs - DIRMOVES CORE, node unit check (no browser). Lane DMCORE (plan scratch/lane-reports/dirmoves-plan.md sections 3-5, 7).
//   node tools/dirmoves.mjs
// 1. DM.on false (the shipped default): every hook is a no-op, commit.js behaves exactly as before.
// 2. DM.on true: the three flow links, the PvP caps, the UP=jump / DOWN=duck input guards - read for SEAT 1 and SEAT 2 (each seat's own P, own
//    held-X state, own 'this jump came from an UP key').
// 3. Source wiring: every main.js hook is behind DM.on / DMX.dmOn(), the pressRead/pressWrite carry jumpUp per seat, commit.js winOf is inert unset.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as DMX from '../src/dirmoves.js';
import * as CM from '../src/commit.js';
const { DM } = DMX;
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

/* ---- 1. OFF ---- */
ok(DM.on === false, 'flag defaults false');
{ const P = { swingKind: 'rise', atk: 0.1, atkRec: 0, dmLaunchAt: 1 }, e = { launchedT: 5 };
  DMX.onLaunch(P, e, 1); ok(P.dmLaunchAt === 1 && e.dmHang === undefined, 'off: onLaunch stamps nothing');
  ok(!DMX.jumpCancelOpen(P, 1.1), 'off: no jump cancel');
  ok(DMX.airBlow(e, 2) === null, 'off: no hang');
  ok(!DMX.refreshAirDash({ dashedAir: true, airDashN: 1 }), 'off: no refresh');
  const Q = {}; DMX.onTrip(Q, 1); ok(Q.dmWin === undefined, 'off: trip window untouched');
  ok(!DMX.upJumpSuppressed({ upKeyJump: true, ground: true, atkHeld: 1 }), 'off: UP jump never suppressed');
  ok(!DMX.duckTwistSuspended({ charge: 1 }) && !DMX.upGrabIgnored({ charge: 1 }), 'off: duck + ladder untouched');
  ok(DMX.launchVy(-300, true) === -300, 'off: PvP launch not capped'); }
ok(CM.committed({ atk: -1, atkRec: 0.1 }) && !CM.committed({ atk: -1, atkRec: 0.05 }), 'commit.js unchanged without dmWin');
ok(CM.inRecovery({ atk: -1, atkRec: 0.1 }) && CM.committedNext({ atk: -1, atkRec: 0.1 }, 0.02), 'commit.js ahead-question unchanged');

/* ---- 2. ON ---- */
DM.on = true;
try {
  /* FLOW 1: launcher -> air hits */
  { const P = { swingKind: 'rise', atk: 0.1, atkRec: 0 }, e = { launchedT: 2.2 };   /* launched at t = 1: it hangs until 2.2 */
    DMX.onLaunch(P, e, 1);
    ok(e.dmHang === 0 && P.dmLaunchAt === 1, 'launch stamps the hit time and zeroes the hang count');
    ok(DMX.jumpCancelOpen(P, 1.0) && DMX.jumpCancelOpen(P, 1.2), 'jump cancel open 0..0.20 s from the hit');
    ok(!DMX.jumpCancelOpen(P, 1.21), 'jump cancel closed after 0.20 s');
    ok(!DMX.jumpCancelOpen(P, 1.1, true), 'an UP-key jump never cancels (JUMP key only)');
    ok(!DMX.jumpCancelOpen({ ...P, swingKind: 'sweep' }, 1.1), 'only a rise');
    let r = DMX.airBlow(e, 1.3); ok(Math.abs(r.launchedT - 2.45) < 1e-9 && !r.down && e.dmHang === 1, 'air blow 1: +0.25 s hang');
    e.launchedT = r.launchedT; r = DMX.airBlow(e, 1.5); ok(Math.abs(r.launchedT - 2.7) < 1e-9 && !r.down && e.dmHang === 2, 'air blow 2: +0.25 s hang');
    e.launchedT = r.launchedT; r = DMX.airBlow(e, 1.7); ok(r.down && r.launchedT === 1.7, 'air blow 3: knocked down (hang ends)');
    ok(DMX.airBlow({ launchedT: 0.5 }, 1) === null, 'a foe no longer in the air is not hung');
    ok(DM.flow.airMul === 1.3, 'OFF THE GROUND x1.3 kept'); }
  /* FLOW 2: plunge bounce -> air dash */
  { const P = { dashedAir: true, airDashN: 2, airJump: 0, airRolled: true };
    ok(!DMX.refreshAirDash(P, false) && P.dashedAir === true, 'no refresh without a hit (bare floor never)');
    ok(DMX.refreshAirDash(P, true) && P.dashedAir === false && P.airDashN === 0 && P.airRolled === false, 'a hit refreshes the air dash');
    ok(P.airJump === 0, 'the air JUMP is not refreshed'); }
  /* FLOW 3: trip -> ground hit */
  { const P = { atk: -1, atkRec: 0.1, swingKind: 'sweep' }; DMX.onTrip(P, 5);
    ok(P.dmWin === 0.15, 'trip opens a 0.15 s window');
    ok(CM.committed({ ...P, atkRec: 0.2 }) && !CM.committed({ ...P, atkRec: 0.14 }) && !CM.committed({ ...P, atkRec: 0.1 }), 'committed() now frees at 0.15 s left (was 0.06)');
    ok(CM.committed({ atk: 0.1, atkRec: 0, dmWin: 0.15 }), 'the swing art itself is still committed');
    ok(CM.inRecovery({ atk: -1, atkRec: 0.2, dmWin: 0.15 }) && !CM.inRecovery({ atk: -1, atkRec: 0.1, dmWin: 0.15 }), 'inRecovery follows the window');
    DMX.tickWindow(P, 5.5); ok(P.dmWin === 0.15, 'window lives within a second');
    P.atk = 0.02; P.swingKind = 'light'; DMX.tickWindow(P, 5.5); ok(P.dmWin === 0, 'the next (non-sweep) swing closes it');
    const Q = { atk: -1, atkRec: 0, swingKind: 'sweep' }; DMX.onTrip(Q, 5); DMX.tickWindow(Q, 6.5); ok(Q.dmWin === 0, 'a stale window closes'); }
  /* PvP caps */
  { ok(DMX.launchVy(-300, true) === -150, 'PvP: launch on a hero is half height');
    ok(DMX.launchVy(-300, false) === -300, 'foes keep full launch');
    ok(DMX.isHeroTarget({ t: 'duelist', pvpSeat: {} }) && DMX.isHeroTarget({ pvpSeat: {} }) && !DMX.isHeroTarget({ t: 'wasp' }), 'a duel proxy is a hero target');
    ok(DMX.airBlow({ launchedT: 9 }, 1, { pvp: true }) === null, 'PvP: no hang, no juggle'); }
  /* CLASHES, seat 1 and seat 2 - each seat is its own state (own P, own X hold, own UP-key-jump flag) */
  const seat1 = { atkHeld: 0.3, charge: 0.16, upKeyJump: true, ground: true, jump: false, down: false };   /* player one: ArrowUp jump while X is wound */
  const seat2 = { atkHeld: 0, charge: 0, upKeyJump: false, ground: true, jump: true, down: false };         /* player two: a pad / partner jump, X not held */
  ok(DMX.upJumpSuppressed(seat1), 'seat 1: UP-key jump suppressed while X is wound (charged launcher, not a jump)');
  ok(!DMX.upJumpSuppressed(seat2), 'seat 2: a jump with X not held jumps');
  ok(!DMX.upJumpSuppressed({ ...seat1, upKeyJump: false }), 'the Z / Space jump still jumps (and cancels the charge)');
  ok(DMX.upJumpSuppressed({ ...seat2, atkHeld: 0.2, upKeyJump: true }), 'seat 2: its own held X + UP-key jump suppressed too');
  ok(!DMX.upJumpSuppressed({ ...seat1, atkHeld: 0.05, charge: 0 }), 'a tap (X under HEAVY_START) is the up-slash grace path as today');
  ok(!DMX.upJumpSuppressed({ ...seat1, ground: false }), 'air: UP jump untouched (air stays tap)');
  ok(DMX.duckTwistSuspended(seat1) && !DMX.duckTwistSuspended(seat2), 'duck twists suspended only for the seat that is winding');
  ok(DMX.upGrabIgnored(seat1) && !DMX.upGrabIgnored(seat2), 'ladder / door UP-grab ignored only for the seat that is winding');
  ok(DMX.dropThroughAllowed({ jump: true, down: true }) && !DMX.dropThroughAllowed({ jump: false, down: true }), 'drop-through stays DOWN+JUMP');
} finally { DM.on = false; }

/* ---- 3. SOURCE WIRING ---- */
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const hooks = ['DMX.onLaunch', 'DMX.onTrip', 'DMX.airBlow', 'DMX.jumpCancelOpen', 'DMX.upJumpSuppressed', 'DMX.duckTwistSuspended', 'DMX.upGrabIgnored', 'DMX.refreshAirDash', 'DMX.tickWindow'];
for (const h of hooks) ok(src.includes(h), 'main.js calls ' + h);
ok(/pressRead = \(\) => \(\{[^}]*jumpUp: jumpUpKey/.test(src), 'pressRead carries each seat\'s jumpUp');
ok(/if \(DMX\.dmOn\(\)\) jumpUpKey = !!o\.jumpUp/.test(src), 'pressWrite restores it per seat, DM.on only');
ok(/DMX\.dmOn\(\) && !P\.ground && !P\.swim\) \{ const ab = DMX\.airBlow/.test(src), 'air hang is behind dmOn');
ok(/api\.after\) api\.after\(kind, head\)/.test(readFileSync(new URL('../src/pogo-chain.js', import.meta.url), 'utf8')), 'pogo-chain calls its after hook');
ok(readFileSync(new URL('../index.html', import.meta.url), 'utf8').includes('./src/dirmoves.js'), 'index.html preloads dirmoves.js');
console.log('dirmoves: ' + n + ' checks OK (DM.on = ' + DM.on + ')');
