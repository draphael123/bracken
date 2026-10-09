// tools/mapscale-shots.mjs - pictures of the world map for the one-scale pass (claude/mapscale). Not in the suite.
// usage: PORT=<free port> node tools/mapscale-shots.mjs <outdir> <tag> [id,id,...] [crop=x,y,w,h@scale]
// Every level cleared and fully ticked (worst case for plates), standing on each listed node (default: one per sheet + a few busy ones).
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.argv[2] || 'work/claude/mapscale'), tag = process.argv[3] || 'shot'; mkdirSync(out, { recursive: true });
const ids = process.argv[4] && process.argv[4] !== '-' ? process.argv[4].split(',') : null;
const crop = (process.argv[5] || '').split(/[,@]/).map(Number);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.reset({ fresh: true });
    for (const l of LEVELS) BKT.PROG[l.id] = { cleared: true, medal: 3, silver: 7, quest: true };
    const all = BK.mapNodes().ids, pick = ${JSON.stringify(ids)} || all; const res = [], crop = ${JSON.stringify(crop)};
    for (const id of pick) { if (!BK.mapLook(id)) continue; BK.step(60); const c = document.createElement('canvas'); const hasC = crop.length === 5 && crop.every(Number.isFinite); const k = hasC ? crop[4] : 4;
      c.width = (hasC ? crop[2] : BK.view.VW) * k; c.height = (hasC ? crop[3] : BK.view.VH) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      if (hasC) g.drawImage(BK.buf, crop[0], crop[1], crop[2], crop[3], 0, 0, c.width, c.height); else g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([id, c.toDataURL('image/png')]); }
    return { res, all }; })()`, 600000);
  if (!ids) console.log('nodes: ' + r.all.join(' '));
  for (const [name, d] of r.res) { writeFileSync(join(out, tag + '-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); }
  console.log(r.res.length + ' shots');
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
