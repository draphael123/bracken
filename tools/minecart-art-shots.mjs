// tools/minecart-art-shots.mjs - THE DEEP RAILS' art-pass pictures (claude/minecartart). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8724 node tools/minecart-art-shots.mjs <tag> [name,name]  -> work/claude/minecart-art/<tag>/*.png (2x frames from the game's canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', only = (process.argv[3] || '').split(',').filter(Boolean);
const out = join(ROOT, 'work/claude/minecart-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const only = ${JSON.stringify(only)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'minecart'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(60);
    const snap = (name) => { if (only.length && !only.includes(name)) return; const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const rowAt = x => { let best = null; for (const [a, b, row] of BK.L.mcTrack) if (x >= a && x <= b && (best === null || row > best)) best = row; return best; };
    const at = (name, x, row) => { const rw = row || rowAt(x); BK.tp(x, rw - 1); BK.minecart().cart(BK.P).v = 0; run(10); BK.look(x, rw - 1); snap(name); };
    for (const [n, x] of [['01-yard', 24], ['02-boostgap', 100], ['03-points', 150], ['04-switchback', 215], ['05-goblinline', 350], ['06-caveinfork', 500], ['07-crumble', 540], ['08-works', 650], ['09-high', 720], ['10-exam', 790], ['11-deepgap', 662], ['12-smelter', 925], ['13-bore', 950]]) at(n, x);
    /* THE GREAT DRILL: the fight, then its jammed open state */
    const A = BK.L.arena; BK.tp(A.start[0], A.start[1]); BK.minecart().cart(BK.P).v = 0; run(10);
    for (let i = 0; i < 160; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); }
    BK.look(A.start[0], A.start[1] - 3); snap('14-drill'); for (let i = 0; i < 90; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); snap('15-drill-later');
    { const b = BK.enemies().find(e => e.t === 'greatdrill'); if (b) { b.mode = 'jammed'; b.open = 3; b.openT0 = 4.6; } for (let i = 0; i < 6; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); snap('16-drill-jammed'); }
    { const H = BK.drillHands(), S = H.show(), b = BK.enemies().find(e => e.t === 'greatdrill'); if (S && b) { b.mode = 'idle'; b.open = 0; S.ph = 3; S.highDown = true; BK.sim(1); for (let i = 0; i < 40; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); } BK.step(1); snap('17-drill-p3-roof-down'); } }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/minecart-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
