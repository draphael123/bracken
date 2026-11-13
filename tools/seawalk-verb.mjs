/* tools/seawalk-verb.mjs <levelId> <x> <y> <face> <tag> [strikeSecs=0,1,6] - a PLAYER'S HAND AT A VERB IN THE REAL PAGE (claude/seawalk2). Not in the suite.
   Loads the level, puts the hero at tile (x,y), faces <face>, strikes (atk) once, and saves 640x360 stills at the listed seconds after the strike to scratch/lane-reports/seawalk2/<tag>-<sec>s.png;
   prints what the strike hit (kit log) and where the hero stands. BRACKEN_LW3=1 LW3=1 for Saltreach. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const [id, x, y, face, tag, secsArg] = process.argv.slice(2), secs = (secsArg || '0,1,6').split(',').map(Number);
const out = join(ROOT, '..', 'scratch', 'lane-reports', 'seawalk2'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const shot = async s => { const d = await pg.evalp(`(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, tag + '-' + s + 's.png'), Buffer.from(d.split(',')[1], 'base64')); };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.load(__LV.findIndex(l => l.id === ${JSON.stringify(id)})); BK.start(); BK.god = true; BK.sim(60); BK.tp(${+x}, ${+y}); BK.sim(40); BK.P.face = ${+face}; return true; })()`);
  await shot('pre');
  let t = 0;
  await pg.evalp(`(() => { BK.press('atk'); BK.step(1); return true; })()`);
  for (const s of secs) { await pg.evalp(`(() => { for (let k = 0; k < ${Math.round((s - t) * 60) || 1}; k++) BK.step(1); return true; })()`); t = s; await shot(s);
    console.log('t+' + s, await pg.evalp(`JSON.stringify({ hero: [Math.round(BK.P.x / 16 * 10) / 10, Math.round(BK.P.y / 16 * 10) / 10], hp: Math.round(BK.P.hp) })`)); }
  console.log('errors', JSON.stringify((pg.errors || []).slice(0, 5)));
} finally { await pg.close(); }
