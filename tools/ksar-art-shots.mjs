// tools/ksar-art-shots.mjs - THE BANDIT KSAR's art-pass pictures (claude/ksar). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8678 node tools/ksar-art-shots.mjs <before|after> [name-filter]   -> work/claude/ksar-art/<tag>/*.png (frames from the game's own canvas, 2x)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after', filt = process.argv[3] || '';
const out = join(ROOT, 'work/claude/ksar-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const filt = ${JSON.stringify(filt)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'ksar'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = (name, z) => { const c = document.createElement('canvas'); const k = z ? 6 : 2; c.width = (z ? z[2] : BK.view.VW) * k; c.height = (z ? z[3] : BK.view.VH) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (z) g.drawImage(BK.buf, z[0], z[1], z[2], z[3], 0, 0, c.width, c.height); else g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const at = (name, x, y, f, z) => { if (filt && !filt.split(',').some(f => name.includes(f))) return; fresh(); BK.tp(x, y); run(20); if (f) f(); BK.look(x, y); run(2); snap(name, z); };
    const turn = (id, n) => { const H = BK.glassSeaHands(), S = H.state(); const m = S.mirrors.find(q => q.id === id); for (let i = 0; i < n; i++) { m.n = (m.n + 1) % m.notches.length; m.state = m.notches[m.n]; } };
    const spots = [['k01-start', 6, 36], ['k02-gong1', 36, 33], ['k03-hut', 46, 33], ['k04-kegs-arch', 62, 33], ['k05-stair', 68, 27], ['k06-breach1', 84, 27], ['k07-tower2', 98, 21],
      ['k08-wallhut', 114, 27], ['k09-breach2', 126, 27], ['k10-gong2', 140, 27], ['k11-sentry', 180, 27], ['k12-breach4', 215, 27], ['k13-greatgong', 236, 23], ['k14-yard', 247, 33], ['k15-gate', 258, 33],
      ['k16-gatehouse', 262, 27], ['k17-souq', 290, 33], ['k18-souqhall', 318, 33], ['k19-stair', 348, 31], ['k20-terrace', 372, 24], ['k21-minaret', 364, 20], ['k22-store', 400, 24], ['k23-chain', 430, 24],
      ['k24-arch', 442, 24], ['k25-cellar', 424, 30], ['k26-roof1', 462, 18], ['k27-gap1', 467, 18], ['k28-narrow', 486, 18], ['k29-roof2', 505, 20], ['k30-bridge-up', 524, 20], ['k31-roof3', 540, 20],
      ['k32-hut3', 548, 20], ['k33-tower', 566, 20], ['k34-tower-top', 566, 8], ['k35-shaft', 578, 33], ['k36-strongroom', 572, 33], ['k37-courtyard', 600, 33], ['k38-courtyard2', 614, 33]];
    for (const [n, x, y] of spots) at(n, x, y);
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/ksar-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
