// tools/lance6-room-shots.mjs - his room (the Long Bridge) and a zip-line moment (claude/lance6). Not in the suite.
// usage: PORT=8652 node tools/lance6-room-shots.mjs <prefix> [outdir]
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const prefix = process.argv[2] || 'room', out = process.argv[3] || 'work/claude/lance6'; mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 7 });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'storm'), view = BK.view;
    const boot = (kill = true) => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(5); if (kill) for (const q of BK.enemies()) q.alive = false; };
    const snap = name => { const c = document.createElement('canvas'); c.width = view.VW * 2; c.height = view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, view.VW, view.VH, 0, 0, c.width, c.height); res.push(['${prefix}-' + name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    boot(false); const A = BK.L.arena, P = BK.P;
    BK.tp(672, 29); for (let k = 0; k < 200; k++) BK.step(1); snap('room-gate'); BK.tp(690, 26); run(120); snap('room-fight-1'); run(160); snap('room-fight-2'); run(160); snap('room-fight-3');
    boot(true); const z = BK.L.zipLines[0], k = BK.keys;
    P.x = z.x0 - 30; P.y = z.y0 + 12; P.vx = P.vy = 0; run(18); snap('zip-deck');
    P.x = z.x0 - 3; run(4); k.up = true; run(3); k.up = false; run(14); snap('zip-ride-start'); run(30); snap('zip-ride-mid');
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
