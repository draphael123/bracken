// tools/fallingtower-shots.mjs — THE FALLING TOWER in the real page, one picture a place, bottom floor to the sky, rendered with BK.step
// (BK.sim does not draw) and saved at 2x into docs/fallingtower/<tag>/. The same spots every time, so a "before" and an "after" of the
// rework (docs/briefs/falling-tower-rework.md) can be laid side by side. God mode, the hero stood at each spot and given a second
// and a half to settle. Not in the suite: pictures are for eyes.
// usage: node tools/fallingtower-shots.mjs <tag> [name ...]      e.g.  node tools/fallingtower-shots.mjs after
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'after', want = process.argv.slice(3);
const out = join(ROOT, 'docs/fallingtower', tag); mkdirSync(out, { recursive: true });
/* [name, column, row the hero stands on (his feet on the row under it), what the picture is for] - bottom of the tower first */
const SPOTS = [
  ['library', 30, 299, 'THE LIBRARY STACKS: the way in'], ['library-stair', 27, 293, 'the stair up the stacks (after: the lesson ledge)'],
  ['reading', 24, 263, 'THE READING ROOM: its floor'], ['reading-gallery', 40, 239, 'the Reading Room gallery, over the flip'],
  ['orrery', 40, 227, 'THE ORRERY CAGE: its floor (after: the pit)'], ['orrery-high', 44, 214, 'the orrery, halfway up (after: the failing stair)'],
  ['pendulum', 44, 191, 'THE PENDULUM GALLERY'], ['pendulum-landing', 22, 185, 'the first ride\'s landing'],
  ['cistern', 14, 149, 'THE BURST CISTERN'], ['loft', 50, 119, 'THE BELL LOFT: its floor'], ['loft-high', 30, 98, 'the bell loft, high'],
  ['crown', 30, 83, 'THE OPEN CROWN'], ['parapet', 31, 50, 'the parapet, the door and the sky'],
];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const want = ${JSON.stringify(want)}, res = [];
    const snap = (name, note) => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); res.push([name, c.toDataURL('image/png'), note]); };
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'fallingtower')); BK.start(); BK.god = true; BK.sim(60);
    for (const [name, x, row, note] of ${JSON.stringify(SPOTS)}) { if (want.length && !want.includes(name)) continue;
      BK.tp(x, row - 1); BK.P.face = 1; for (let k = 0; k < 90; k++) BK.step(1); snap(name, note); }
    return res;
  })()`, 900000);
  r.forEach(([name, d, note], j) => { writeFileSync(join(out, String(j).padStart(2, '0') + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(tag + '/' + String(j).padStart(2, '0') + '-' + name, '-', note); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
