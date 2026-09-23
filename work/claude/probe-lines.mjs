// localise the ore-ride crash: what line ids does the PAGE actually have, and what does each name in the tool resolve to?
import { openPage } from '../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const lvm = await import('./src/level.js'), idx = lvm.LEVELS.findIndex(l => l.id === 'oreroad');
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(idx); BK.start(); BK.sim(5);
    const L = BK.L;
    const have = L.cableway ? L.cableway.lines.map((l, i) => ({ i, id: l.id, drum: !!l.drum, riders: !!l.riders, pts: l.pts.length, end: l.pts[l.pts.length-1].map(v=>Math.round(v)) })) : 'NO L.cableway';
    const asked = ['first','crossing','down','steep'].map(id => { const li = L.cableway.lines.findIndex(l => l.id === id); return { id, li, resolves: li >= 0 ? 'line ' + li : 'UNDEFINED -> lines[-1]' }; });
    return { have, asked };
  })()`, 300000);
  console.log(JSON.stringify(r, null, 1));
  console.log('page errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
