import { openPage } from '../../tools/cdp.mjs';
import { writeFileSync } from 'node:fs';
const tag=process.argv[2]; const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.reset({ fresh: true });
    for (const l of LEVELS) BKT.PROG[l.id] = { cleared: false };
    BKT.PROG.kings = { cleared: false }; const ok = BK.mapLook('kings'); BK.step(60);
    const c = document.createElement('canvas'); c.width = 320*3; c.height = 180*3; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.view.buf, 0, 0, BK.view.VW, BK.view.VH, 0, 0, c.width, c.height); return { ok, png: c.toDataURL('image/png') }; })()`, 120000);
  console.log(r.ok); writeFileSync('work/claude/shots-gormfinish/map-kings-'+tag+'.png', Buffer.from(r.png.split(',')[1],'base64')); console.log('errors', pg.errors.slice(0,3));
} finally { pg.close(); }
