// tools/church2-art-shots.mjs - LIT CHURCH 2's art-pass pictures (claude/church2art). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8945 node tools/church2-art-shots.mjs <tag> [name-filter,...]   -> work/claude/church-art/<tag>/*.png (the game's own canvas, 2x)
//   spots: the crossing + parclose, the nave trough (lit/dark), the chantry (stalls, fire, braziers, door), the south trough, the Deacon's fight (a shot at each new mode), the Paladin's bar.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', filt = process.argv[3] || '';
const out = join(ROOT, 'work/claude/church-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const filt = ${JSON.stringify(filt)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'church'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = (name, z, k0) => { const c = document.createElement('canvas'); const k = k0 || (z ? 6 : 2); c.width = (z ? z[2] : BK.view.VW) * k; c.height = (z ? z[3] : BK.view.VH) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (z) g.drawImage(BK.buf, z[0], z[1], z[2], z[3], 0, 0, c.width, c.height); else g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const lamps = on => { const K = BK.litChurch(); if (!K) return; for (const l of K.lamps) l.lit = on; };
    const at = (name, x, y, f, z, ly) => { if (filt && !filt.split(',').some(f => name.includes(f))) return; fresh(); BK.tp(x, y); run(20); if (f) f(); BK.look(x, ly == null ? y : ly); run(ly == null ? 2 : 6); snap(name, z); };
    const spots = [['n01-trough', 82, 36], ['x01-crossing', 168, 36], ['x02-parclose', 158, 36], ['h01-chantry1', 190, 36], ['h02-chantry2', 202, 36], ['h03-chantry-door', 210, 36], ['s01-south-trough', 252, 40], ['s02-reliquary', 222, 40]];
    for (const [n, x, y, ly] of spots) at(n, x, y, null, null, ly);
    for (const [n, x, y] of [['d01-nave-trough-dark', 82, 36], ['d02-chantry-dark', 196, 36], ['d03-crossing-dark', 168, 36]]) at(n, x, y, () => { lamps(false); run(100); });
    if (!filt || 'deacon'.includes(filt) || filt.split(',').includes('deacon')) { fresh(); BK.tp(163, 36); run(10); lamps(true); const seen = new Set(); let n = 0;
      for (let i = 0; i < 2400 && n < 18; i++) { BK.sim(1); if (i % 2 === 0) BK.step(1); const e = BK.enemies().find(q => q.t === 'deacon'); if (!e) continue;
        if (e.mode && !seen.has(e.mode) && e.mode !== 'recover') { seen.add(e.mode); BK.look(e.x / 16, e.y / 16 - 1); BK.step(1); snap('k-' + String(n++).padStart(2, '0') + '-' + e.mode); } }
      res.push(['dbg', 'a,' + btoa(Array.from(seen).join(','))]); }
    return res; })()`, 900000);
  for (const [name, d] of r) { if (name === 'dbg') { console.log('modes: ' + Buffer.from(d.split(',')[1], 'base64').toString()); continue; } writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/church-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
