// tools/forestsupports-shots.mjs - pictures of the forest/crag levels' drawn island supports (claude/forestsupports). Not in the suite.
//   usage: PORT=8770 node tools/forestsupports-shots.mjs <level> [x,y ...]  -> work/claude/forestsupports/<level>-N.png
//   with no points: six islands spread along the level (from the supported-island list).
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { LEVELS, T } from '../src/level.js';
import { islandsOf } from '../src/island-posts.js';
const id = process.argv[2]; let pts = process.argv.slice(3).map(s => s.split(',').map(Number));
const out = join(ROOT, 'work/claude/forestsupports'); mkdirSync(out, { recursive: true });
if (!pts.length) { const L = LEVELS.find(l => l.id === id).build(); const is = islandsOf(L, T).sort((a, b) => a.x0 - b.x0); const n = 6;
  for (let i = 0; i < n; i++) { const s = is[Math.floor((i + 0.5) * is.length / n)]; pts.push([(s.x0 + s.x1) >> 1, s.y0 - 2]); } }
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === ${JSON.stringify(id)}); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(60); for (const e of BK.enemies()) e.alive = false;
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const P = ${JSON.stringify(pts)}; P.forEach(([x, y], i) => { BK.tp(x, y); run(14); BK.look(x, y); snap(${JSON.stringify(id)} + '-' + (i + 1) + '-' + x + '_' + y); });
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/forestsupports/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
