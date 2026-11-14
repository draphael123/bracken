/* GQ6HITCH: CPU profile of the first 100 frames of the Highcrown hall fight (slow frames' top self-time functions). --off = flags off. A measuring tool. */
import { openPage } from './cdp.mjs';
const off = process.argv.includes('--off'); if (off) { delete process.env.BRACKEN_GQ6S2; delete process.env.BRACKEN_GQ6S3; } else { process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1'; }
const pg = await openPage({ audio: false, fonts: true, seed: 7 });
try {
  await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.SET.speed = 1; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.state = 'play'; BK.god = false; BK.step(5); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); return 1; })()`, 300000);
  await pg.send('Profiler.enable'); await pg.send('Profiler.setSamplingInterval', { interval: 250 });
  const t0 = await pg.evalp('performance.now()'); await pg.send('Profiler.start');
  const fr = await pg.evalp(`(()=>{ const fr = []; for (let k = 0; k < 110; k++) { BK.P.hp = BK.P.maxHp; const a = performance.now(); BK.step(1); fr.push([k, a, performance.now()]); } return fr; })()`, 300000);
  const r0 = await pg.send('Profiler.stop', {}, 60000); const profile = r0.profile || (r0.result && r0.result.profile) || r0; if (!profile.nodes) console.log('keys', Object.keys(r0)); const off0 = profile.startTime / 1000 - t0; const nodes = new Map(profile.nodes.map(n => [n.id, n]));
  let tt = profile.startTime / 1000 - off0; const samp = []; profile.samples.forEach((id, i) => { tt += (profile.timeDeltas[i] || 0) / 1000; samp.push([tt, id]); });
  console.log(off ? 'OFF' : 'ON', 'slowest', fr.map(f => [f[0], +(f[2] - f[1]).toFixed(0)]).filter(x => x[1] > 45).join(' | '));
  fr.forEach(f => { const d = f[2] - f[1]; if (d < 45 || f[0] === 0) return; const agg = new Map(); for (const [t, id] of samp) if (t >= f[1] && t <= f[2]) { const cf = nodes.get(id).callFrame; const k = cf.functionName + ' ' + cf.url.split('/').slice(-1)[0] + ':' + cf.lineNumber; agg.set(k, (agg.get(k) || 0) + 0.25); }
    console.log('frame ' + f[0] + ' ' + d.toFixed(0) + ' ms: ' + [...agg.entries()].sort((p, q) => q[1] - p[1]).slice(0, 8).map(([k, v]) => v.toFixed(0) + ' ' + k).join(' | ')); });
} finally { pg.close(); }
