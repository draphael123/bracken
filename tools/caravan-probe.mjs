// tools/caravan-probe.mjs — THE SUNKEN CARAVAN in the real page, quickly: who is in it (by kind), whether anything throws, and what
// the bandits and the sun do on the screen. Not in the suite (pictures are for eyes). usage: node tools/caravan-probe.mjs [outdir]
//   It loads the level (god mode, so nothing ends the run), counts the creatures by kind, then walks the hero into THE TRADERS' YARD
//   so its bandits (and the slinger on the cargo) come in, steps the page with drawing for a while and saves a picture of it, and
//   then stands the hero in the open sun until the meter is full and the build has climbed, and saves that too.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.argv[2] || 'work/caravan2/probe'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'caravan'); BK.load(i); BK.start(); BK.god = true; BK.sim(300);
    const L = BK.L, kinds = {}; for (const e of L.ents) if (!['deco', 'coin', 'sign', 'check'].includes(e.t)) kinds[e.t] = (kinds[e.t] || 0) + 1;
    const snap = () => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); };
    const foot = x => { for (let y = 1; y < L.H - 1; y++) { const t = L.grid[y * L.W + x]; if (t !== 0 && !(t >= 20 && t <= 25) && t !== 2 && t !== 8) return y - 1; if (t >= 20 && t <= 25) return y; } return 20; };
    const shots = [], A = L.ambushes[0];
    BK.tp(A.wallL + 12, foot(A.wallL + 12)); for (let k = 0; k < 150; k++) BK.step(1); shots.push(['yard', snap()]);
    const yard = BK.enemies ? BK.enemies().filter(e => e.alive).map(e => e.t + (e.st ? ':' + e.st.mode : '')) : [];
    BK.load(i); BK.start(); BK.god = true; BK.sim(300); BK.tp(100, foot(100));
    let peak = 0, stages = new Set(); for (let k = 0; k < 60 * 9; k++) { BK.step(1); const cv = BK.caravan && BK.caravan(); if (cv) { stages.add(cv.stage || 0); peak = Math.max(peak, cv.stage || 0); } if (peak >= 3 && k % 60 === 0) break; }
    shots.push(['sun', snap()]);
    return { kinds, yard, stages: [...stages], shots };
  })()`, 600000);
  console.log('kinds', JSON.stringify(r.kinds)); console.log('in the yard', JSON.stringify(r.yard)); console.log('sun stages seen', JSON.stringify(r.stages));
  for (const [n, d] of r.shots) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
