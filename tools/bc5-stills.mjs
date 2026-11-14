// PAGE TOOL: launches headless Chrome
/* tools/bc5-stills.mjs <outdir> - BC5 WALK (claude/bc5-l): stills of the BC5 rooms in the real page, flag on (BRACKEN_BC5=1). [name, x, y, frames, keepFoes] each; 640x360 from the 320x180 buffer.
   node tools/bc5-stills.mjs ../scratch/lane-reports/bc5 */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const out = process.argv[2] || 'bc5-stills'; mkdirSync(out, { recursive: true });
const SPOTS = [['R1-door', 172, 28, 150], ['R1-gallery', 180, 28, 150], ['R2-lip', 600, 32, 150], ['R2-far', 610, 32, 150], ['R3-lift', 664, 32, 150], ['R3-wall', 671, 28, 150],
  ['R4-door', 839, 32, 150], ['R4-pier', 834, 31, 150], ['gb-hall-in', 391, 32, 100], ['kiln-top', 386, 8, 100], ['grasper-quarter', 486, 44, 200, 1], ['grasper-court', 636, 32, 200, 1], ['grasper-bulb', 283, 32, 200, 1], ['boss-hall', 850, 32, 100, 1], ['approach-700', 700, 32, 100], ['approach-760', 760, 32, 100], ['works-350', 350, 32, 100], ['sign-597', 597, 32, 100], ['works-foes-335', 335, 32, 100, 1], ['works-foes-366', 366, 32, 100, 1], ['roof-foes-700', 700, 32, 100, 1], ['roof-foes-735', 735, 32, 100, 1]];
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  const only = process.argv[3];
  for (const [name, x, y, fr, keep] of SPOTS) { if (only && !name.includes(only)) continue;
    const d = await pg.evalp(`(() => { const i = __LV.findIndex(l => l.id === 'buriedcity'); BK.manualSimulation = true; BK.reset({ fresh: true }); BK.load(i); BK.state = 'play'; BK.start(); BK.god = true; BK.sim(900);
      BK.tp(${x}, ${y}); if (!${!!keep}) for (const e of BK.enemies()) if (!e.boss && e !== BK.boss) e.alive = false;
      for (let k = 0; k < ${fr + 200}; k++) BK.step(1);
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      return { png: c.toDataURL('image/png'), at: Math.round(BK.P.x / 16) + ',' + Math.round(BK.P.y / 16) }; })()`);
    writeFileSync(out + '/walk-' + name + '.png', Buffer.from(d.png.split(',')[1], 'base64')); console.log(name, d.at);
  }
} finally { pg.close(); }
