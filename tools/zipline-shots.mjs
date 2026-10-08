// tools/zipline-shots.mjs - pictures of the zip lines (claude/zipline). Not in the suite. usage: PORT=8748 node tools/zipline-shots.mjs [hero] -> work/claude/zipline/*.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const hero = process.argv[2] || 'knight', out = join(ROOT, 'work/claude/zipline'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'storm'); BK.load(fi); BK.start(); BK.god = true; BK.sim(400); for (const e of BK.enemies()) e.alive = false;
    const snap = (name, z) => { const c = document.createElement('canvas'); const k = 3; c.width = z[2] * k; c.height = z[3] * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, z[0], z[1], z[2], z[3], 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const L = BK.L, P = BK.P, k = BK.keys, view = BK.view;
    for (const i of [0, 1, 2]) { const z = L.zipLines[i];
      P.x = z.x0 - 30; P.y = z.y0 + 12; P.vx = P.vy = 0; run(10); run(8); snap('r' + (i + 1) + '-deck', [0, 0, view.VW, view.VH]);
      P.x = z.x0 - 3; run(4); k.up = true; run(3); k.up = false; run(14); snap('r' + (i + 1) + '-ride', [0, 0, view.VW, view.VH]);
      run(30); snap('r' + (i + 1) + '-ride2', [0, 0, view.VW, view.VH]); k.up = false; }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/zipline/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
