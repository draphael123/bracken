// scratch: three pictures of THE LEADFOOT standing on the floors he denies, drawn by the real renderer (Node renders
// lie about light). node work/claude/leadfoot-shots.mjs
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude'); mkdirSync(out, { recursive: true });
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  const shots = await pg.evalp(`(() => {
    const i = __LV.findIndex(l => l.id === 'keep'); BK.load(i); BK.start(); BK.god = true; BK.sim(300);
    const L = BK.L, res = [], where = (L.ents || []).filter(e => e.t === 'leadfoot').map(e => [e.x, e.y]);
    for (const [x, y] of where) { BK.tp(x - 5, y); for (let k = 0; k < 90; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d');
      g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push(c.toDataURL('image/jpeg', 0.94)); }
    return { where, res };
  })()`);
  console.log('leadfeet at', JSON.stringify(shots.where));
  shots.res.forEach((d, j) => writeFileSync(join(out, 'lf-shot-' + j + '.jpg'), Buffer.from(d.split(',')[1], 'base64')));
} finally { pg.close(); }
