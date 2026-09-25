// tools/oremine-shots.mjs — THE ORE ROAD AS A WORKING MINE (docs/briefs/ore-road-mine-life.md), in the real page: one picture a
// place along the route, rendered with BK.step (BK.sim does not draw) and saved at 2x into docs/oremine/<nn>-<place>-<tag>.png.
// The hero stands a little WEST of each place and the foes are left alone, so a crew that has not seen him yet is still at its
// work in the frame. Not in the suite: pictures are for eyes. usage: node tools/oremine-shots.mjs <tag> [place ...]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot', want = process.argv.slice(3);
const out = join(ROOT, 'docs/oremine'); mkdirSync(out, { recursive: true });
/* [name, the hero's column, the row he stands on] - in route order */
const SPOTS = [['yard', 6, 36], ['crusher', 26, 34], ['loading-house', 47, 36], ['first-span', 100, 36], ['sorting-yard', 137, 36],
  ['sorting-floor', 150, 28], ['tower-top', 186, 21], ['tipple-house', 229, 27], ['collapsed-span', 286, 32], ['wreck-head', 326, 30],
  ['brakemans-hut', 350, 20], ['winch-house', 412, 12], ['drum-yard', 446, 12], ['drum-house', 478, 12],
  /* AT WORK: stood just BEHIND a goblin at work (he hears you only within OR.WORK_HEAR behind him), so the picture has him working */
  ['at-work-sorting-table', 154, 36], ['at-work-lift-cage', 193, 36], ['at-work-brake-hoist', 347, 29], ['at-work-rail-yard', 447, 12]];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'oreroad'), want = ${JSON.stringify(want)}, res = [];
    for (const [name, x, y] of ${JSON.stringify(SPOTS)}) { if (want.length && !want.includes(name)) continue;
      BK.setHero('knight'); BK.load(i); BK.start(); BK.god = true; BK.sim(240);
      BK.tp(x, y); for (let k = 0; k < 90; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      res.push([name, c.toDataURL('image/png'), Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)]); }
    return res;
  })()`, 900000);
  r.forEach(([name, d, x, y]) => { const n = SPOTS.findIndex(s => s[0] === name); const f = String(n).padStart(2, '0') + '-' + name + '-' + tag + '.png';
    writeFileSync(join(out, f), Buffer.from(d.split(',')[1], 'base64')); console.log(f, 'hero at', x, y); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
