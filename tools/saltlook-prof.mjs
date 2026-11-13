/* tools/saltlook-prof.mjs <levelId> <x> <y> - CPU PROFILE of 150 draw frames at a tile (claude/saltlook). Not in the suite. Top self-time functions by file:line. */
import { openPage } from './cdp.mjs';
const [id, x, y] = process.argv.slice(2);
const pg = await openPage({ audio: false, fonts: false, seed: 5 });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.load(__LV.findIndex(l => l.id === ${JSON.stringify(id)})); BK.start(); BK.god = true; BK.sim(40); BK.tp(${+x}, ${+y}); BK.sim(60); return true; })()`);
  await pg.send('Profiler.enable'); await pg.send('Profiler.setSamplingInterval', { interval: 200 }); await pg.send('Profiler.start');
  await pg.evalp(`(() => { for (let k = 0; k < 150; k++) BK.draw1(); return true; })()`);
  const { result } = await pg.send('Profiler.stop'); const p = result.profile, dt = p.timeDeltas, byId = new Map(p.nodes.map(n => [n.id, n])), self = new Map();
  p.samples.forEach((s, i) => self.set(s, (self.get(s) || 0) + (dt[i] || 0)));
  const agg = new Map(); for (const [nid, t] of self) { const n = byId.get(nid), f = n.callFrame, k = (f.functionName || '(anon)') + ' ' + f.url.split('/').slice(-1)[0] + ':' + f.lineNumber; agg.set(k, (agg.get(k) || 0) + t); }
  /* callers of the hottest function */ const parent = new Map(); p.nodes.forEach(n => (n.children || []).forEach(c => parent.set(c, n.id))); const incl = new Map(); for (const [nid, t] of self) { let cur = nid, seen = new Set(); while (cur !== undefined) { const f = byId.get(cur).callFrame, k = (f.functionName || "(anon)") + " " + f.url.split("/").slice(-1)[0] + ":" + f.lineNumber; if (!seen.has(k)) { seen.add(k); incl.set(k, (incl.get(k) || 0) + t); } cur = parent.get(cur); } } console.log("INCLUSIVE"); [...incl].sort((a, b) => b[1] - a[1]).slice(0, 26).forEach(([k, t]) => console.log((t / 1000 / 150).toFixed(2).padStart(7), k));
  const tot = [...agg.values()].reduce((a, b) => a + b, 0);
  console.log('total ms', (tot / 1000 / 150).toFixed(2), 'per frame'); [...agg].sort((a, b) => b[1] - a[1]).slice(0, 18).forEach(([k, t]) => console.log((t / 1000 / 150).toFixed(2).padStart(7), 'ms/frame', k));
} finally { await pg.close(); }
