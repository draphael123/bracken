/* work/lance/shots.mjs <tag> - THE QUEEN'S LANCE's bridge, photographed in the real page (320x180 buffer at 2x, after 300 drawn
   frames), into work/lance/<tag>-NN-<spot>.png. Spots: the west bridgehead, the middle of the bridge with him awake, the east end
   by the gatehouse. With 'after' it also takes his bowman being called (the tell) and standing on the lookout (docs/briefs/lance-support.md). */
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'shot';
const pg = await openPage();
const snap = `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
let n = 0;
const save = (name, png) => { const f = tag + '-' + String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(ROOT, 'work/lance', f), Buffer.from(png.split(',')[1], 'base64')); console.log('work/lance/' + f); };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })`);
  const boot = `const i = __LV.findIndex(l => l.id === 'storm'); BK.load(i); BK.start(); BK.god = true; BK.sim(60);`;
  const spots = [['west-end', 304, 29, false], ['mid-bridge', 330, 29, true], ['east-end', 408, 29, true]];
  for (const [name, x, y, fight] of spots) {
    const d = await pg.evalp(`(() => { ${boot}
      BK.tp(${x}, ${y}); BK.sim(40);
      for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;
      ${fight ? '' : 'if (BK.boss) BK.boss.alive = true;'}
      for (let k = 0; k < 300; k++) { BK.P.inv = 9; if (BK.boss && BK.boss.alive) { BK.boss.chargeT = 9; BK.boss.vaultT = 9; BK.boss.galeT = 9; BK.boss.javT = 9; BK.boss.thrustT = 9; } BK.step(1); }
      return { png: ${snap}, active: BK.bossActive };
    })()`);
    save(name, d.png);
  }
  if (tag === 'after') {
    for (const [name, frames] of [['bowman-called', 30], ['bowman-up', 200]]) {
      const d = await pg.evalp(`(() => { ${boot}
        BK.tp(312, 29); BK.sim(40);
        for (const e of BK.enemies()) if (!e.maxHp) e.alive = false;
        for (let k = 0; k < 200; k++) { BK.P.inv = 9; BK.step(1); }
        const b = BK.boss; b.supportT = 0.01;
        for (let k = 0; k < ${frames}; k++) { BK.P.inv = 9; b.chargeT = 9; b.vaultT = 9; b.galeT = 9; b.javT = 9; b.thrustT = 9; BK.step(1); }
        return { png: ${snap}, bows: BK.enemies().filter(e => e.alive && e.lanceBow).length };
      })()`);
      save(name, d.png); console.log('  bows up: ' + d.bows);
    }
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
