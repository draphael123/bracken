/* tools/gq6hitch-prof.mjs - GQ6HITCH: CPU profile of the first burn step (wait -> tell -> 40 frames), top self-time functions inside each frame slower than --min ms (default 60). A measuring tool, not a check. */
import { openPage } from './cdp.mjs';
import { readFileSync } from 'fs';
process.env.BRACKEN_GQ6S2 = '1'; process.env.BRACKEN_GQ6S3 = '1';
const a = process.argv.slice(2), opt = (k, d) => { const x = a.find(y => y.startsWith('--' + k + '=')); return x ? x.slice(k.length + 3) : d; };
const MIN = +opt('min', 60), STEP = +opt('step', 0);
const src = readFileSync(new URL('./gq6hitch.mjs', import.meta.url), 'utf8');
const FN = src.slice(src.indexOf('const FN = `') + 12, src.indexOf('`;\nconst res')).replace("for (const [i, thr] of [[0, 0.85], [1, 0.70], [2, 0.50]]) {", "if (window.__stop) { window.__h = { hold, st, q, g, P, timed, out, keyOff }; return 1; }\n  for (const [i, thr] of [[0, 0.85], [1, 0.70], [2, 0.50]]) {");
const pg = await openPage({ audio: false, fonts: true, seed: 7 });
try {
  await pg.evalp('window.__stop = 1; (' + FN + ')("knight")', 900000);
  const THR = [0.846, 0.696, 0.496];
  if (STEP > 0) for (let s = 0; s < STEP; s++) await pg.evalp(`(()=>{ const h = window.__h, q = h.q, st = h.st; q.hp = Math.min(q.hp, q.maxHp * ${THR[s]}); BK.god = true; let w = 0; while (st.phase !== 'tell' && w++ < 2400) { h.hold(); BK.step(1); } BK.god = false; const tier0 = st.tier; let f = 0; while (f++ < 4200) { const rr = h.g.botGoal(h.P), k = BK.keys; k.left = k.right = k.up = k.down = false; if (rr) { const dx = rr.goal - h.P.x; k.left = dx < -3; k.right = dx > 3; k.up = !!rr.up; } h.hold(); BK.step(1); if (st.phase === 'on' && st.tier === tier0 + 1) break; } h.keyOff(); })()`, 600000);
  await pg.send('Profiler.enable'); await pg.send('Profiler.setSamplingInterval', { interval: 250 });
  const t0 = await pg.evalp('performance.now()'); await pg.send('Profiler.start');
  const fr = await pg.evalp(`(()=>{ const h = window.__h, q = h.q, st = h.st; q.hp = Math.min(q.hp, q.maxHp * ${THR[STEP]}); BK.god = true; let w = 0; const fr = [];
    const one = lab => { const a = performance.now(); BK.step(1); fr.push([lab, a, performance.now()]); };
    while (st.phase !== 'tell' && w++ < 2400) { h.hold(); one('wait'); } for (let k = 0; k < 40; k++) { h.hold(); one('tell'); } return fr; })()`, 300000);
  const r0 = await pg.send('Profiler.stop', {}, 60000); const profile = r0.profile || (r0.result && r0.result.profile) || r0;
  const off = profile.startTime / 1000 - t0; const nodes = new Map(profile.nodes.map(n => [n.id, n]));
  let tt = profile.startTime / 1000 - off; const samp = []; profile.samples.forEach((id, i) => { tt += (profile.timeDeltas[i] || 0) / 1000; samp.push([tt, id]); });
  console.log('frames', fr.length, 'slowest', fr.map(f => f[2] - f[1]).sort((p, q) => q - p).slice(0, 5).map(x => x.toFixed(0)).join(' '));
  fr.forEach((f, i) => { const d = f[2] - f[1]; if (d < MIN) return; const agg = new Map(); for (const [t, id] of samp) if (t >= f[1] && t <= f[2]) { const cf = nodes.get(id).callFrame; const k = cf.functionName + ' ' + cf.url.split('/').slice(-1)[0] + ':' + cf.lineNumber; agg.set(k, (agg.get(k) || 0) + 0.25); }
    console.log('frame ' + i + ' ' + f[0] + ' ' + d.toFixed(0) + ' ms: ' + [...agg.entries()].sort((p, q) => q[1] - p[1]).slice(0, 9).map(([k, v]) => v.toFixed(0) + ' ' + k).join(' | ')); });
} finally { pg.close(); }
