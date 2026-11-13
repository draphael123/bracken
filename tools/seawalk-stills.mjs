/* tools/seawalk-stills.mjs <levelId> [every=5] [tag] - STILLS ALONG A LEVEL'S ROUTE IN THE REAL PAGE (claude/seawalk1). Not in the suite.
   Takes the pacing route (tools/pacing.mjs), puts the hero on every Nth waypoint (god mode, foes left alone), lets the page run 120 frames and saves the 640x360 buffer
   to scratch/lane-reports/seawalk1/<tag>-NN-x<col>.png. Also prints the page's console errors. Causeway 2: BRACKEN_CW3=1 (or CW3=1 for the node half). */
import { openPage, ROOT } from './cdp.mjs';
import { pacing } from './pacing.mjs';
import { LEVELS } from '../src/level.js';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const id = process.argv[2], every = +(process.argv[3] || 5), tag = process.argv[4] || id;
const lv = LEVELS.find(l => l.id === id), route = pacing(lv).route;
const out = join(ROOT, '..', 'scratch', 'lane-reports', 'seawalk1'); mkdirSync(out, { recursive: true });
const pts = route.filter((_, i) => i % every === 0 || i === route.length - 1);
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.load(__LV.findIndex(l => l.id === ${JSON.stringify(id)})); BK.start(); BK.god = true; BK.sim(60); return true; })()`);
  let n = 0;
  for (const [x, y] of pts) {
    const d = await pg.evalp(`(() => { BK.tp(${x}, ${y}); BK.sim(30); for (let k = 0; k < 90; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      return { png: c.toDataURL('image/png'), px: Math.round(BK.P.x / 16), py: Math.round(BK.P.y / 16), hp: Math.round(BK.P.hp) }; })()`);
    const f = tag + '-' + String(++n).padStart(2, '0') + '-x' + x + '.png'; writeFileSync(join(out, f), Buffer.from(d.png.split(',')[1], 'base64')); console.log(f, 'wp', x, y, 'hero at', d.px, d.py);
  }
  console.log('console errors:', JSON.stringify((pg.errors || []).slice(0, 10)));
} finally { await pg.close(); }
