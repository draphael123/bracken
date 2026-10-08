// tools/lit-church-art-shots.mjs - THE LIT CHURCH's art-pass pictures (claude/churchart). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8742 node tools/lit-church-art-shots.mjs <before|after> [name-filter,...]   -> work/claude/church-art/<tag>/*.png (frames from the game's own canvas, 2x)
//   `lit`: the lamps of the room are lit (all of them) / `dark`: every lamp snuffed first - the A3 pair is the same spot both ways.
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
    const snap = (name, z) => { const c = document.createElement('canvas'); const k = z ? 6 : 2; c.width = (z ? z[2] : BK.view.VW) * k; c.height = (z ? z[3] : BK.view.VH) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (z) g.drawImage(BK.buf, z[0], z[1], z[2], z[3], 0, 0, c.width, c.height); else g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const lamps = on => { const K = BK.litChurch(); if (!K) return; for (const l of K.lamps) if (l.kind !== "arena") l.lit = on; };
    const at = (name, x, y, f, z, ly) => { if (filt && !filt.split(',').some(f => name.includes(f))) return; fresh(); BK.tp(x, y); run(20); if (f) f(); BK.look(x, ly == null ? y : ly); run(ly == null ? 2 : 6); snap(name, z); };
    const spots = [['c01-start', 6, 36], ['c02-graves', 20, 36], ['c03-porch', 38, 36], ['c04-narthex', 50, 40], ['c05-nave1', 70, 36], ['c06-pews', 94, 36], ['c07-pulpit', 102, 36], ['c08-nave2', 124, 36],
      ['c09-crossing', 156, 36], ['c10-transept', 168, 28], ['c11-organ', 152, 18], ['c12-pipes', 134, 14], ['c13-loft', 101, 18], ['c14-console', 64, 18], ['c15-tower', 51, 22], ['c16-hatch', 50, 49],
      ['c17-ossuary', 76, 53], ['c18-pit', 90, 53], ['c19-vault', 125, 53], ['c20-altar', 170, 53], ['c21-well', 163, 46], ['c22-rood', 177, 40], ['c23-south', 200, 40], ['c24-charnel', 204, 40],
      ['c25-archdeacon', 224, 38], ['c26-reliquary', 187, 40], ['c27-sanctuary', 258, 40], ['c28-sanctuary2', 270, 40], ['w01-window', 78, 36, 28], ['w02-gallery', 100, 18, 12], ['w03-rose', 168, 28, 24], ['w04-sanct-high', 261, 40, 30], ['w05-organ-high', 156, 18, 12], ['w06-tower', 50, 22, 12]];
    for (const [n, x, y, ly] of spots) at(n, x, y, null, null, ly);
    for (const [n, x, y] of [['d05-nave1-dark', 70, 36], ['d10-transept-dark', 168, 28], ['d11-organ-dark', 152, 18], ['d23-south-dark', 200, 40]]) at(n, x, y, () => { lamps(false); run(100); });
    res.push(['dbg', 'a,' + btoa(String(window.__lcdb) + ' ' + window.__lcerr + ' ' + (BK.L && BK.L.dark))]); return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/church-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
