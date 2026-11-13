/* tools/seawalk-seq.mjs <levelId> '<json steps>' <tag> - A PLAYER'S SEQUENCE OF VERBS IN THE REAL PAGE (claude/seawalk2). Not in the suite.
   steps: [{ tp: [x, y], face: 1, atk: true, wait: secs, shot: 'name', say: 'js expr to print' }, ...] run in order, god mode; shots go to scratch/lane-reports/seawalk2/<tag>-<name>.png.
   BRACKEN_LW3=1 LW3=1 for Saltreach. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const [id, stepsJson, tag] = process.argv.slice(2), steps = JSON.parse(stepsJson);
const out = join(ROOT, '..', 'scratch', 'lane-reports', 'seawalk2'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.load(__LV.findIndex(l => l.id === ${JSON.stringify(id)})); BK.start(); BK.god = true; BK.sim(90); return true; })()`);
  for (const s of steps) {
    if (s.tp) await pg.evalp(`(() => { BK.tp(${s.tp[0]}, ${s.tp[1]}); BK.sim(${s.quick || 70}); if (${s.face || 0}) BK.P.face = ${s.face || 0}; return true; })()`);
    if (s.atk) await pg.evalp(`(() => { BK.press('atk'); BK.step(1); return true; })()`);
    if (s.wait) await pg.evalp(`(() => { for (let k = 0; k < ${Math.round(s.wait * 60)}; k++) BK.step(1); return true; })()`);
    if (s.shot) { const d = await pg.evalp(`(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`);
      writeFileSync(join(out, tag + '-' + s.shot + '.png'), Buffer.from(d.split(',')[1], 'base64')); }
    console.log(JSON.stringify(s), '->', await pg.evalp(`JSON.stringify({ hero: [Math.round(BK.P.x / 16 * 10) / 10, Math.round(BK.P.y / 16 * 10) / 10]${s.say ? ', say: ' + s.say : ''} })`));
  }
  console.log('errors', JSON.stringify((pg.errors || []).slice(0, 5)));
} finally { await pg.close(); }
