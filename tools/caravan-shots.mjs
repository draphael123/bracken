// tools/caravan-shots.mjs — THE SUNKEN CARAVAN in the real page: pictures of its places, rendered with BK.step (BK.sim does not
// draw), saved at 2x as work/caravan/NN-name.png. Not in the suite: pictures are for eyes. usage: node tools/caravan-shots.mjs [name ...]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const out = join(ROOT, 'work/caravan'); mkdirSync(out, { recursive: true });
const want = process.argv.slice(2);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'caravan'); BK.load(i); BK.start(); BK.god = true; BK.sim(200);
    const L = BK.L, m = L.marks, s = L.sections;
    const foot = x => { for (let y = 1; y < L.H - 1; y++) { const t = L.grid[y * L.W + x]; if (t !== 0) return y - 1; } return 20; };
    const SPOTS = [['start', 8], ['awning', m.awning1 + 2], ['leadwagon', m.leadwagon + 2], ['ribcage', m.ribcage + 6], ['arch', m.arch + 2],
      ['slide', m.slide + 2], ['camp', m.winch + 10], ['caravanserai', m.caravanserai - 2], ['sinking', s.sinking + 8], ['rim', s.rim + 20], ['hollow', s.arena + 12]];
    const res = [];
    for (const [name, x] of SPOTS) { if (${JSON.stringify(want)}.length && !${JSON.stringify(want)}.includes(name)) continue;
      BK.tp(x, foot(x)); for (let k = 0; k < 70; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      res.push([name, c.toDataURL('image/png'), Math.round(BK.P.x / 16), Math.round(BK.P.y / 16), (BK.P.sun || {}).v]); }
    return res;
  })()`);
  r.forEach(([name, d, x, y, sun], j) => { writeFileSync(join(out, String(j).padStart(2, '0') + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, 'at', x, y, 'sun', sun); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
