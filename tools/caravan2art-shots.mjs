// tools/caravan2art-shots.mjs - THE SUNKEN CARAVAN's art pass in the real page: `node tools/caravan2art-shots.mjs name:x:y[:sim] ...` (x, y in tiles; y 'g' = the ground under x).
// Not in the suite: pictures are for eyes. SHOTS=work/claude/caravan2art/after (default). 640x360, 2x.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/caravan2art/after'); mkdirSync(out, { recursive: true });
const want = process.argv.slice(2).map(a => a.split(':'));
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'caravan'); const res = [];
    for (const [name, xs, ys, sims] of ${JSON.stringify(want)}) {
      BK.load(i); BK.start(); BK.god = true; BK.sim(420);
      const L = BK.L, x = +xs, foot = xx => { let y = L.H - 1; while (y > 0 && L.grid[y * L.W + xx] !== 0) y--; return y; };
      BK.tp(x, ys === 'g' || ys === undefined ? foot(x) : +ys); for (let k = 0; k < (+sims || 70); k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      res.push([name, c.toDataURL('image/png'), Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)]); }
    return res; })()`);
  r.forEach(([name, d, x, y]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, 'at', x, y); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
