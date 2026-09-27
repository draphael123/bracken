// work/sandledge/shots.mjs — scratch: three named spots in THE SUNKEN CARAVAN, for a before/after of the desert ledge art
// lane (docs/AGENT-HANDOFF.md style, tools/caravan-shots.mjs's own approach). Not a check, not added to tools/.
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot';   // 'before' or 'after'
const out = join(ROOT, 'work/sandledge'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'caravan');
    const SPOTS = [['sandstone-lip', 202, 22], ['tower-lintel', 147, 21], ['wagon-top', 96, 26]];
    const res = [];
    for (const [name, tx, ty] of SPOTS) {
      BK.load(i); BK.start(); BK.god = true; BK.sim(420);
      BK.tp(tx, ty); for (let k = 0; k < 70; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      res.push([name, c.toDataURL('image/png'), Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)]);
    }
    return res;
  })()`, 60000);
  r.forEach(([name, d, px, py]) => { writeFileSync(join(out, tag + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(tag, name, 'saved, hero at', px, py); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
