// tools/map-shots.mjs - pictures of the world map's sheets, every level cleared and fully ticked (the worst case for the name plates).
// Not in the suite. usage: PORT=<free port> node tools/map-shots.mjs <outdir> <tag>   (e.g. work/claude/mapspace before)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.argv[2] || 'work/claude/mapspace'), tag = process.argv[3] || 'shot'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.reset({ fresh: true });
    for (const l of LEVELS) BKT.PROG[l.id] = { cleared: true, medal: 3, silver: 7, quest: true, relic: true };
    const res = []; const shot = (id, name) => { if (!BK.mapLook(id)) return; BK.step(40); const c = document.createElement('canvas'); c.width = BK.view.VW * 3; c.height = BK.view.VH * 3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    BK.mapLook('waymeet'); BK.step(60); shot('fields', 'inland-low'); shot('witchlight', 'inland-high'); shot('keep', 'coast-mid'); shot('longwater', 'coast-low'); shot('moor', 'crag-mid'); shot('crown', 'crag-top');
    return res; })()`, 120000);
  for (const [name, d] of r) { writeFileSync(join(out, tag + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(tag + '-' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
