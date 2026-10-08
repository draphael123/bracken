// tools/minecartmap3-shots.mjs - THE DEEP RAILS' cave-in rubble and cart speedometer, zoomed (claude/minecartmap). Not in the suite.
//   usage: PORT=8738 node tools/minecartmap3-shots.mjs <tag>  -> work/claude/minecart-art/<tag>/{crumble,speedo-*}.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'mm3', out = join(ROOT, 'work/claude/minecart-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'minecart'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(60);
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const rowAt = x => { let best = null; for (const [a, b, row] of BK.L.mcTrack) if (x >= a && x <= b && (best === null || row > best)) best = row; return best; };
    const zoom = (name, sx, sy, sw, sh, k) => { const c = document.createElement('canvas'); c.width = sw * k; c.height = sh * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, sx, sy, sw, sh, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const rw = rowAt(535); BK.tp(528, rw - 1); BK.minecart().cart(BK.P).v = 0; run(10); BK.look(540, rw - 1); BK.step(3); zoom('crumble', 0, 60, 320, 120, 4);
    for (const [n, v] of [['stopped', 0], ['cruise', 140], ['boost', 260]]) { BK.minecart().cart(BK.P).v = v; BK.step(2); zoom('speedo-' + n, 0, 130, 100, 50, 8); }
    return res; })()`, 300000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/minecart-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
