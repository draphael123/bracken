// tools/palart-perf.mjs - what does the Paladin's holy art cost a frame? (claude/palart; a spot check, not in the suite.)
// A phone-sized page with the CPU throttled (MP_CPU, default 4), the paladin on flat floor; the average ms of BK.step(1) with NOTHING up, with a circle
// planted, an EMPOWERED circle, and a circle + a hammer in flight + a SMITE column. Fails if the circle adds more than PERF_MAX_MS (default 1.5 ms at 4x) a frame.
//   usage: PORT=8900 node tools/palart-perf.mjs
import { openPage } from './cdp.mjs';
const CPU = +(process.env.MP_CPU || 4), MAX = +(process.env.PERF_MAX_MS || 1.5);
const pg = await openPage({ audio: false, fonts: false, seed: 3 });
let R;
try {
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 915, height: 412, deviceScaleFactor: 2.625, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await pg.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  R = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    BK.SET.speed = 1; BK.setHero('paladin'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.god = true; BK.sim(200);
    const K = BK.keys, none = () => { for (const k of ['left','right','up','down','jump','block','atk']) K[k] = false; };
    const tap = (up) => { none(); if (up) K.up = true; K.block = true; BK.sim(3); K.block = false; BK.sim(1); K.up = false; };
    const clear = () => { for (const e of BK.enemies()) e.alive = false; };
    const run = (n) => { const t0 = performance.now(); for (let i = 0; i < n; i++) BK.step(1); return (performance.now() - t0) / n; };
    const out = {}; BK.holyHands().clear(); clear(); BK.P.light = 100; run(30);
    out.none = run(240);
    tap(); BK.sim(20); out.circle = run(240);
    BK.P.light = 100; tap(); BK.sim(30); out.empowered = run(240);
    BK.P.light = 100; tap(true); K.atk = true; BK.sim(30); K.atk = false; out.fx = run(60);
    none(); BK.holyHands().clear(); return out; })()`, 300000);
} catch (e) { console.log('FAIL the page: ' + e.message); pg.close(); process.exit(1); }
pg.close();
const f = x => x.toFixed(2) + ' ms';
console.log('palart-perf @' + CPU + 'x: nothing ' + f(R.none) + ' | circle ' + f(R.circle) + ' | empowered ' + f(R.empowered) + ' | throw+smite fx ' + f(R.fx));
if (R.empowered - R.none > MAX) { console.log('FAIL: an empowered circle adds ' + f(R.empowered - R.none) + ' a frame (limit ' + MAX + ')'); process.exit(1); }
console.log('palart-perf: ok - the circle adds ' + f(R.circle - R.none) + ', empowered ' + f(R.empowered - R.none));
