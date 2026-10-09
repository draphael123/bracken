import { openPage, ROOT } from '../../../tools/cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs'; import { join } from 'path';
const out = join(ROOT, 'work/claude/bcreview/shots'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'buriedcity'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); for (const e of BK.enemies()) if (!e.boss) e.alive = true; };
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const at = (name, x, y, f) => { fresh(); BK.tp(x, y); run(20); if (f) f(); BK.look(x, y); run(2); snap(name); };
    const H = () => BK.buriedCityHands(), K = () => BK.buriedCity();
    const spots = [['b01-dunes', 6, 21], ['b02-sinkhole', 30, 25], ['b03-firstroom', 52, 33], ['b04-drift', 80, 33], ['b05-market', 100, 33], ['b06-granary', 124, 33], ['b07-upper', 150, 25],
      ['b08-dome', 164, 25], ['b09-cellar', 218, 33], ['b10-upperbulb', 250, 29], ['b11-lowerbulb', 266, 29], ['b12-quarter-full', 330, 33], ['b13-greatwheel', 312, 33], ['b14-foundry', 394, 41],
      ['b15-shaft', 427, 40], ['b16-traphall', 452, 29], ['b17-throneguard', 488, 29], ['b18-vault', 498, 29], ['b19-throneroom', 530, 29]];
    for (const [n, x, y] of spots) at(n, x, y);
    at('b20-traphall-filled', 455, 29, () => { const r = K().rooms.find(q => q.id === 'trap'); r.gate = 'shut'; r.level = r.full; });
    at('b21-quarter-drained', 340, 41, () => { const r = K().rooms.find(q => q.id === 'great'); K().wheel.done = true; r.gate = 'open'; r.level = 0; });
    fresh(); BK.tp(540, 29); run(200); BK.look(540, 29); run(2); snap('b22-king-fight');
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
