// tools/bell-winch.mjs - node-only asserts for src/bell-winch.js (the shared bell lure + winch wave rules). No browser.
import * as BW from '../src/bell-winch.js';
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
// bell: ring, cooldown, queue, stale
const M = {};
ok(BW.ringBell(M, 0, 10, 1.5) === 'rung', 'first ring rings');
ok(BW.ringBell(M, 5, 10, 1.5) === 'swinging', 'inside cooldown = STILL SWINGING');
ok(M.rings === 1, 'a swinging ring is not counted');
ok(BW.ringFresh(M, 1.0) === true, 'queued ring fresh inside the window');
ok(BW.ringFresh(M, 2.0) === false && M.queued === 0, 'queued ring goes stale and clears');
ok(!BW.bellReady(M, 9.9) && BW.bellReady(M, 10), 'ready exactly at cooldown');
ok(BW.ringBell(M, 10, 10, 0) === 'rung' && M.queued === 0, 'queue 0 = no queue');
// grate glow / under
ok(BW.grateGlow(5, 0.9) === 0, 'no glow far away'); ok(BW.grateGlow(0, 0.9) === 1, 'full glow at the grate');
ok(Math.abs(BW.grateGlow(0.45, 0.9) - 0.5) < 1e-9, 'glow linear'); ok(BW.underGrate(100, 110, 20) && !BW.underGrate(100, 130, 20), 'underGrate');
// winch wave: kept
let W = BW.waveOpen(0, 5.5);
ok(BW.crankWinch(W, 0.5, 3, 2) === 1 && BW.crankWinch(W, 1.5, 3, 2) === 2 && BW.crankWinch(W, 2.5, 3, 2) === 'kept', 'three blows in time keep them out');
ok(BW.waveTick(W, 6, 2, 1.5) === null && BW.crankWinch(W, 7, 3, 2) === 0, 'kept wave never spawns, further blows ignored');
// slow hand restarts
W = BW.waveOpen(0, 5.5);
BW.crankWinch(W, 0.5, 3, 2); BW.crankWinch(W, 1.0, 3, 2);
ok(BW.crankWinch(W, 4.0, 3, 2) === 1, 'a blow after the window starts again at 1');
// fail: spawn at horn, close after
ok(BW.waveTick(W, 5.4, 2, 1.5) === null, 'horn not yet'); ok(BW.hornLeft(W, 2.75, 5.5) === 0.5, 'horn half left');
ok(BW.waveTick(W, 5.5, 2, 1.5) === 'spawn', 'spawn at the horn'); ok(BW.waveTick(W, 5.6, 2, 1.5) === null, 'spawn once');
ok(BW.hornLeft(W, 5.6, 5.5) === 0, 'horn 0 once through');
ok(BW.waveTick(W, 6.9, 2, 1.5) === null && BW.waveTick(W, 7.0, 2, 1.5) === 'close', 'gate drops behind them');
ok(BW.waveTick(W, 9, 2, 1.5) === null, 'closed stays closed');
// cold count resets while open
W = BW.waveOpen(0, 5.5); BW.crankWinch(W, 0.2, 3, 2); BW.waveTick(W, 3, 2, 1.5); ok(W.n === 0, 'cold crank count resets');
// co-op
ok(BW.waveKinds(['soldier'], 2).length === 1 && BW.waveKinds(['soldier', 'javelin'], 4).length === 3, '+1 soldier at 3-4 seats');
const k = ['a']; ok(BW.waveKinds(k, 1) !== k, 'waveKinds copies');
// struck: once per blow per key
const P = { hitSet: new Set() }; const ab = () => ({}), ov = () => true;
ok(BW.struck(ab, ov, P, {}, 'bell') && !BW.struck(ab, ov, P, {}, 'bell') && BW.struck(ab, ov, P, {}, 'winch'), 'struck once per key');
ok(!BW.struck(() => null, ov, { hitSet: new Set() }, {}, 'x') && !BW.struck(ab, () => false, { hitSet: new Set() }, {}, 'x'), 'no box / no overlap = no strike');
ok(BW.MURDER.dmg > 0 && BW.MURDER.reload >= 10, 'murder hole constants');
console.log(bad ? bad + ' FAILED' : 'bell-winch: all ok'); process.exit(bad ? 1 : 0);
