// PAGE TOOL: launches headless Chrome
// tools/storm-props-shots.mjs - a picture of every lamp, brazier, torch, bell and checkpoint on THE LONG BRIDGE and the road to it, as DRAWN (claude/lance6, Daniel 11-04: floating lamps/braziers).
// Not in the suite. usage: PORT=8652 node tools/storm-props-shots.mjs <prefix> [outdir] [x0-x1] -> <outdir>/<prefix>-<kind>-<x>.png
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const prefix = process.argv[2] || 'shot', out = process.argv[3] || 'work/claude/lance6', [a, b] = (process.argv[4] || '0-9999').split('-').map(Number); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'storm'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(5); for (const e of BK.enemies()) e.alive = false;
    const view = BK.view, L = BK.L, P = BK.P;
    const snap = name => { const c = document.createElement('canvas'); c.width = view.VW * 2; c.height = view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, view.VW, view.VH, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const zoom = name => { const c = document.createElement('canvas'); const z = [view.VW / 2, Math.round(view.VH * 0.68) - 52, 96, 64]; c.width = 576; c.height = 384; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, z[0], z[1], z[2], z[3], 0, 0, c.width, c.height); res.push([name + '-zoom', c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 3 === 0) BK.step(1); } BK.step(1); };
    const KINDS = ['brazier', 'lanternPost', 'torch', 'bell', 'gatebell', 'lancebell', 'check'];
    for (const e of L.ents) { const k = e.t === 'deco' ? e.kind : e.t; if (!KINDS.includes(k) || e.x < ${a} || e.x > ${b}) continue;
      BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(5); for (const q of BK.enemies()) q.alive = false; BK.tp(e.x - 3, e.y); BK.sim(10); for (let k = 0; k < 150; k++) { P.hp = P.maxHp; BK.step(1); } const nm = '${prefix}-' + k + '-' + e.x + 'x' + e.y; snap(nm); zoom(nm); }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
