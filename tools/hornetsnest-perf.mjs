// tools/hornetsnest-perf.mjs - THE NEW SECTIONS ON A MID PHONE (claude/hornetsnest2; plan: "mobile-perf >= 40 on S2 (drips)").
// A 915x412 landscape phone at DPR 2.625, touch on, the CPU throttled (MP_CPU, default 4x), the page on its own requestAnimationFrame loop. The hero is put in
// THE SAGGING GALLERY (drips over the crumbling combs) and THE SAP WELL (five drips over the pendant rungs, a swarm, an amber hornet, hornets) and the frame rate is read.
//   node tools/hornetsnest-perf.mjs            MP_CPU=6 node tools/hornetsnest-perf.mjs
import { openPage } from './cdp.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CPU = +(process.env.MP_CPU || 4), FPS_MIN = +(process.env.MP_FPS_MIN || 40), SECS = +(process.env.MP_SECS || 6);
const rows = []; const ok = (name, pass, why = '') => { rows.push({ name, pass: !!pass, why }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const pg = await openPage({ audio: false, fonts: false, speed: 0.6 });
try {
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 915, height: 412, deviceScaleFactor: 2.625, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await pg.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(30); return 1; })()`, 300000);
  for (const [name, col, row] of [['gallery', 185, 28], ['well rungs', 336, 44], ['well overhang', 336, 26]]) {
    await pg.evalp(`(() => { BK.manualSimulation = false; BK.god = true; BK.tp(${col}, ${row}); return 1; })()`);
    await sleep(2500);
    await pg.evalp(`(() => { const a = window.__fr = { n: 0, dts: [], last: performance.now(), on: true }; const f = t => { if (!a.on) return; a.n++; a.dts.push(t - a.last); a.last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); window.__t0 = performance.now(); window.__hp = BK.P.hp; return 1; })()`);
    await sleep(SECS * 1000);
    const r = await pg.evalp(`(() => { const a = window.__fr; a.on = false; BK.P.hp = BK.P.maxHp; const d = a.dts.slice().sort((x, y) => x - y); const N = BK.nestHands().drips(); return { n: a.n, wall: (performance.now() - window.__t0) / 1000, p95: d[Math.floor(d.length * 0.95)] || 0, worst: d[d.length - 1] || 0, swell: N.filter(x => x.st === 'swell').length, fall: N.filter(x => x.st === 'fall').length, enemies: BK.enemies().filter(e => e.alive).length }; })()`);
    const fps = r.n / r.wall; console.log(name + ': ' + JSON.stringify({ fps: +fps.toFixed(1), p95: +r.p95.toFixed(1), worst: +r.worst.toFixed(1), cpu: CPU + 'x', drips: r.swell + '/' + r.fall }));
    ok('PERF ' + name + ': >= ' + FPS_MIN + ' fps at ' + CPU + 'x CPU on a phone viewport', fps >= FPS_MIN, fps.toFixed(1) + ' fps');
  }
  ok('PERF: no page errors', pg.errors.length === 0, JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
const bad = rows.filter(x => !x.pass); console.log(bad.length ? bad.length + ' red of ' + rows.length : 'all ' + rows.length + ' green'); process.exit(bad.length ? 1 : 0);
