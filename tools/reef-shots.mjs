/* tools/reef-shots.mjs [tag] [spot,spot] - THE SHIPWRECK REEF, PHOTOGRAPHED IN THE REAL PAGE, for docs/briefs/reef-longer.md. Node
   renders lie about light (docs/AGENT-HANDOFF.md), so every picture is the page's own 320x180 buffer after 300 BK.step frames, saved
   at 2x as work/reef2/<tag>-NN-<spot>.png. The spots are the level's own sections when the builder names them (L.sections:
   { id, shot: [x, y] }); the level before the rework had none, and its spots are written out once below. Foes are put down for the
   section shots (the picture is the place). The boss shots fight nothing: they force his modes, god mode on, and photograph them.
   Not in the suite. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot', only = process.argv[3] ? process.argv[3].split(',') : null;
const out = join(ROOT, 'work/reef2'); mkdirSync(out, { recursive: true });
const BEFORE = [['tideway', 60, 25], ['carrack', 150, 27], ['breach', 214, 31], ['swim', 240, 30], ['deep-shelf', 290, 30], ['keel', 360, 25], ['arena', 434, 33]];
const pg = await openPage();
const snap = () => `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
let n = 0;
const save = (name, png) => { const f = tag + '-' + String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('work/reef2/' + f); };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })()`);
  const spots = await pg.evalp(`(() => { const L = __LV.find(l => l.id === 'reef').build();
    return L.sections ? L.sections.filter(s => s.shot).map(s => [s.id, s.shot[0], s.shot[1]]) : ${JSON.stringify(BEFORE)}; })()`);
  const boot = `const i = __LV.findIndex(l => l.id === 'reef'); BK.load(i); BK.start(); BK.god = true; BK.sim(60);`;
  for (const [name, x, y] of spots) { if (only && !only.includes(name)) continue;
    const d = await pg.evalp(`(() => { ${boot}
      BK.tp(${x}, ${y}); BK.sim(40);
      for (const e of BK.enemies()) if (!e.maxHp && !e.elite) e.alive = false;
      for (let k = 0; k < 300; k++) BK.step(1);
      return { png: ${snap()} };
    })()`);
    save(name, d.png);
  }
  /* THE REEFMAW in each of his looks: forced into a mode, held there, photographed. 'land' shots only exist after the rework. */
  const bossShots = [['boss-bite', 1, 'bite', false], ['boss-stuck', 2, 'stuck', false], ['land-crawl', 3, 'crawl', true], ['land-lungetell', 3, 'lungeTell', true],
    ['land-lunge', 3, 'lunge', true], ['land-tail', 3, 'tailTell', true], ['land-roll', 3, 'roll', true], ['land-beached', 3, 'beached', true]];
  for (const [name, phase, mode, land] of bossShots) { if (only && !only.includes(name)) continue;
    const d = await pg.evalp(`(() => { ${boot}
      const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 2, Math.round(A.floor / 16) - 1); BK.sim(120);
      const b = BK.enemies().find(e => e.t === 'reefmaw'); if (!b) return { none: 'no boss' };
      if (${land} && !('land' in b) && !b.landReady) return { none: 'no land phase' };
      for (const e of BK.enemies()) if (e !== b && !e.elite) e.alive = false;
      b.phase = ${phase}; if (${land}) { b.hp = Math.round(b.maxHp * 0.3); b.land = true; b.rise = 0; const pl = (BK.L.pools || []).find(q => q.arenaTide); if (pl) { pl.tideY = A.floor + 40; } }
      BK.P.x = b.x + (${land} ? 70 : 60) * (${JSON.stringify(mode)} === 'tailTell' ? -1 : 1); if (${land} && b.x > A.x1 - 120) BK.P.x = b.x - 70;
      for (let k = 0; k < 60; k++) BK.step(1);
      for (let k = 0; k < 24; k++) { b.mode = ${JSON.stringify(mode)}; b.modeT = 1; b.rise = ${land ? 0 : 1}; BK.P.inv = 9; BK.step(1); }
      return { png: ${snap()}, mode: b.mode, land: !!b.land };
    })()`);
    if (d.none) { console.log(name + ': ' + d.none); continue; }
    save(name, d.png);
  }
} finally { pg.close(); }
