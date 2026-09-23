// work/claude/winch-shots.mjs <set> - THE ORE ROAD drawn by the REAL renderer (Node renders lie about light). Each shot is a
// place (tile x, y), a number of frames to step, and optional code run in the page first. Sets: checks | cavern | final.
// Writes work/claude/or-<set>-<n>.jpg at 2x.   usage: node work/claude/winch-shots.mjs checks
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { portFor } from '../../tools/ports.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
const set = process.argv[2] || 'checks';
const SETS = {
  checks: `BK.L.ents.filter(e=>e.t==='check').map(e=>({x:e.x+3,y:e.y,n:60,label:'check '+e.x}))`,
  cavern: `[{x:30,y:36,n:90},{x:230,y:27,n:90},{x:300,y:30,n:90},{x:430,y:12,n:90}]`,
};
const pg = await openPage({ port: portFor(7), audio: false, fonts: false });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  const shots = await pg.evalp(`(async () => {
    const i = __LV.findIndex(l => l.id === 'oreroad'); BK.setHero('knight'); BK.reset({fresh:true}); BK.load(i); BK.start(); BK.god = true; BK.sim(60);
    const list = ${SETS[set] || set}, res = [];
    for (const s of list) { if (s.pre) await (0, eval)(s.pre); BK.tp(s.x, s.y); for (let k = 0; k < (s.n || 60); k++) { if (s.each) (0, eval)(s.each); BK.step(1); }
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d');
      g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push({ label: s.label || (s.x + ',' + s.y), d: c.toDataURL('image/jpeg', 0.92) }); }
    return res;
  })()`, 600000);
  shots.forEach((s, j) => { const f = join(ROOT, 'work/claude', `or-${set.replace(/[^a-z0-9]/gi, '').slice(0, 12)}-${j}.jpg`); writeFileSync(f, Buffer.from(s.d.split(',')[1], 'base64')); console.log(f, s.label); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
