/* tools/moor2art-shots.mjs [tag] [spot,spot] - GALE MOOR's WIND ROCKS and GOBLIN SCAFFOLDS art pass (claude/moor2art): the page's own buffer at named spots
   (tile x, stand row), saved at 2x as docs/galemoor/<tag>-<spot>.png. Foes are put down; the hero is a god so a fall into a tarn does not hand him back mid-shot. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'art', only = process.argv[3] ? process.argv[3].split(',') : null;
const SPOTS = [['crevice', 538, 13], ['ridge', 556, 7], ['hightor', 570, 7], ['boulders', 580, 2], ['yard', 589, 20], ['deck', 612, 16], ['topdeck', 628, 12], ['frame', 632, 12], ['tarn', 596, 20], ['landing', 650, 12]];
const out = join(ROOT, 'docs/galemoor'); mkdirSync(out, { recursive: true });
const pg = await openPage();
const snap = () => `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })()`);
  for (const [name, x, y] of SPOTS) { if (only && !only.includes(name)) continue;
    const d = await pg.evalp(`(() => { const i = __LV.findIndex(l => l.id === 'moor'); BK.load(i); BK.start(); BK.god = true; BK.sim(300); BK.tp(${x}, ${y}); BK.sim(40);
      for (const e of BK.enemies()) if (!e.elite) e.alive = false;
      for (let k = 0; k < 300; k++) { BK.P.inv = 9; BK.step(1); }
      return { png: ${snap()} }; })()`);
    const f = tag + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(d.png.split(',')[1], 'base64')); console.log('docs/galemoor/' + f);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
