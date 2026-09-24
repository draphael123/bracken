/* work/stormhold/shots.mjs - pictures of Stormhold from the real page (BK.step renders), 640x360 PNGs.
   node work/stormhold/shots.mjs <prefix> name:x,y name:x,y ...   -> docs/stormhold/<prefix>-<name>.png */
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const LV = process.env.LV || 'storm'; const [prefix, ...spots] = process.argv.slice(2);
const out = join(ROOT, 'docs/stormhold'); mkdirSync(out, { recursive: true });
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  for (const s of spots) {
    const [name, xy] = s.split(':'); const [x, y] = xy.split(',').map(Number);
    const url = await pg.evalp(`(() => { const i = __LV.findIndex(l => l.id === '${LV}'); BK.load(i); BK.start(); BK.god = true; BK.sim(200); for (const A of (BK.ambushes() || [])) A.st = 'done';   /* the pictures are of the place, not of the lock-in */
      BK.tp(${x}, ${y}); for (let k = 0; k < 70; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      return c.toDataURL('image/png'); })()`);
    writeFileSync(join(out, prefix + '-' + name + '.png'), Buffer.from(String(url).split(',')[1], 'base64'));
    console.log('wrote', prefix + '-' + name);
  }
} finally { pg.close(); }
process.exit(0);
