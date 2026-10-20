import { LEVELS } from '../../src/level.js';
import { measure } from '../../tools/level-quality.mjs';
const id = process.argv[2]; const lv = LEVELS.find(l => l.id === id); const m = measure(lv); const r = m.routeBlock;
const route = (await import('../../tools/pacing.mjs')).pacing(lv).route; const cols = new Map(); for (const [x,y] of route) { if(!cols.has(x)) cols.set(x,[]); cols.get(x).push(y); }
console.log(id, r.blocking+'/'+r.n, 'route nodes', route.length);
for (const e of r.enc) { if (r.on.includes(e)) continue; console.log('OFF', e.k, '@'+Math.round(e.x));
  for (const f of e.members) { let best=null; for (let d=0; d<=12; d++) for (const s of [-1,1]) { const ys = cols.get(f.x+s*d); if (ys && !best) best = [f.x+s*d, ys.join('/')]; }
    console.log('   ', f.t, 'x'+f.x, 'y'+f.y, best ? 'route nearby col '+best[0]+' y '+best[1] : 'no route within 12'); } }
