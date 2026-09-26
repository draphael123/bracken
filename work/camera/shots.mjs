/* work/camera/shots.mjs <tag> — BEFORE/AFTER CAPTURES for the camera + ground-fill lane (docs/camera lane, 2026-09-26).
   Six representative screens, photographed in the real page the way tools/*-shots.mjs do (Node renders lie about light,
   AGENT-HANDOFF.md): the page's own 320x180 buffer after settling, saved at 2x as work/camera/<tag>-NN-<name>.png.
   Not a check; not in tools/check.mjs. Run once on the old code (tag 'before') and once on the new (tag 'after'). */
import { openPage, ROOT } from '../../tools/cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot';
const out = join(ROOT, 'work/camera'); mkdirSync(out, { recursive: true });
const pg = await openPage();
const snap = `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
let n = 0;
const save = (name, png) => { const f = tag + '-' + String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('work/camera/' + f); };
// [name, level id, tile x, tile y, settle frames]
const SPOTS = [
  ['wood-flat', 'wood', 30, 21, 60],           // Bracken Wood: flat ground near the start
  ['stockade', 'stockade', 40, 20, 90],        // The Stockade: an ordinary walking screen
  ['hanging-tier', 'hanging', 40, 107, 90],     // The Hanging Village: the roots floor (tools/hanging-shots.mjs's own spot)
  ['monastery-climb', 'spire', 8, 130, 120],    // The Monastery: partway up the climb from its START (4,217)
  ['keep-swim', 'keep', 30, 56, 150],          // The Underwater Keep: submerged end to end (K.START 4,58)
  ['queen-arena', 'wood', 0, 0, 0, 'queen'],   // The Hornet Queen's hive: the fight itself
];
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })()`);
  for (const [name, lvl, x, y, settle, boss] of SPOTS) {
    const d = await pg.evalp(`(() => {
      const i = __LV.findIndex(l => l.id === '${lvl}');
      BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.god = true; BK.sim(300); BK.reset();
      ${boss ? `
      const A = BK.L.arena;
      BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1);
      for (let k = 0; k < 240 && !BK.bossActive; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
      for (let k = 0; k < 150; k++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9; BK.sim(1); }
      ` : `
      BK.tp(${x}, ${y}); BK.sim(${settle});
      `}
      for (let k = 0; k < 60; k++) BK.step(1);
      return { png: ${snap}, bossActive: BK.bossActive, py: BK.P.y, camy: BK.view.y };
    })()`);
    save(name, d.png);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
