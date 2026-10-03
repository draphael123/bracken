// tools/mobile-profile.mjs - WHERE A PHONE'S FRAME GOES (claude/mobile2). The same emulated phone as tools/mobile-perf.mjs, a CPU profile
// (CDP Profiler) of a few seconds of one scene, the top functions by SELF time. A tool for a lane, not a check.
//   MP_SCENE=title|map|<level id> MP_CPU=4 node tools/mobile-profile.mjs
import { openPage } from './cdp.mjs';
const CPU = +(process.env.MP_CPU || 4), scene = process.env.MP_SCENE || 'title', SECS = +(process.env.MP_SECS || 4);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.send('Emulation.setDeviceMetricsOverride', { width: 915, height: 412, deviceScaleFactor: 2.625, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
  await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await pg.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  if (scene === 'title') await pg.evalp("BK.state = 'title'"); else if (scene === 'map') await pg.evalp("BK.state = 'map'");
  else await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.load(LEVELS.findIndex(l => l.id === ${JSON.stringify(scene)})); BK.state = 'play'; })()`);
  await sleep(2000);
  await pg.send('Profiler.enable'); await pg.send('Profiler.setSamplingInterval', { interval: 500 }); await pg.send('Profiler.start');
  await sleep(SECS * 1000);
  const { result } = await pg.send('Profiler.stop'), prof = result.profile, self = new Map(), byId = new Map(prof.nodes.map(n => [n.id, n]));
  const dts = prof.timeDeltas; let total = 0;
  prof.samples.forEach((id, i) => { const n = byId.get(id), cf = n.callFrame, k = (cf.functionName || '(anon)') + ' ' + (cf.url || '').split('/').pop() + ':' + cf.lineNumber; self.set(k, (self.get(k) || 0) + dts[i]); total += dts[i]; });
  console.log(scene + ' @' + CPU + 'x: ' + (total / 1000).toFixed(0) + ' ms sampled in ' + SECS + ' s');
  for (const [k, v] of [...self].sort((a, b) => b[1] - a[1]).slice(0, 22)) console.log(((v / total) * 100).toFixed(1).padStart(5) + '%  ' + (v / 1000).toFixed(0).padStart(6) + ' ms  ' + k);
} finally { await pg.close(); }
