/* tools/lookfeel-map.mjs [level,...] - THE WALK BETWEEN LEVELS, for the look-and-feel review (docs/look-and-feel/wood-to-highcrown.md).
   Not a check. For each level: win it (BK.xpWin, the page's own winLevel), picture the win card, press on, and picture the
   world map the page lands on, then a second later (the token's walk). Saves work/lookfeel/map-<level>-NN.png at 2x. */
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { LEVELS } from '../src/level.js';

const want = (process.argv[2] || 'wood,kings,scree,storm,crown').split(',');
const out = join(ROOT, 'work/lookfeel');
const SNAP = `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
const pg = await openPage();
try {
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 16000 }); return true; })()`);
  for (const id of want) {
    const idx = LEVELS.findIndex(l => l.id === id); let n = 0;
    const save = async what => { const png = await pg.evalp(SNAP); const f = 'map-' + id + '-' + String(n++).padStart(2, '0') + '-' + what + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log(f, await pg.evalp('BK.state')); };
    await pg.evalp(`(() => { BK.load(${idx}); BK.start(); BK.god = true; BK.sim(200); BK.xpWin(); for (let k = 0; k < 120; k++) BK.step(1); return true; })()`);
    await save('win');
    for (let t = 0; t < 4; t++) { await pg.evalp(`(() => { BK.press('confirm'); BK.step(1); for (let k = 0; k < 30; k++) BK.step(1); return BK.state; })()`); if (await pg.evalp('BK.state') !== 'win') break; }
    await pg.evalp(`(() => { for (let k = 0; k < 30; k++) BK.step(1); return true; })()`); await save('map');
    await pg.evalp(`(() => { for (let k = 0; k < 120; k++) BK.step(1); return true; })()`); await save('map-later');
  }
  console.log('errors', JSON.stringify([...new Set(pg.errors)].slice(0, 8)));
} finally { await pg.close(); }
