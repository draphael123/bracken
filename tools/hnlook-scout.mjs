// PAGE TOOL: launches headless Chrome
// tools/hnlook-scout.mjs - stills of THE HORNET'S NEST at a list of columns (claude/hnlook).  node tools/hnlook-scout.mjs <outdir> <col:row,col:row,...> [hero=geomancer]
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2], spots = (process.argv[3] || '').split(',').map(s => s.split(':').map(Number)), hero = process.argv[4] || 'geomancer'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = [];
    BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(60);
    for (const [c, rw] of ${JSON.stringify(spots)}) { for (let k = 0; k < 40; k++) { BK.P.x = c * 16 + 8; BK.P.y = (rw + 1) * 16; BK.P.vx = BK.P.vy = 0; BK.sim(1); } BK.step(1); const b = BK.buf, cv = document.createElement('canvas'); cv.width = b.width * 3; cv.height = b.height * 3; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, cv.width, cv.height); shots.push([c + '_' + rw, cv.toDataURL('image/png')]); }
    return { shots, w: BK.buf.width, h: BK.buf.height }; })()`, 600000);
  for (const [n, d] of r.shots) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.shots.length, r.w, r.h, JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
