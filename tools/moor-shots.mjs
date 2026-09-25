/* tools/moor-shots.mjs [tag] [spot,spot] - GALE MOOR, PHOTOGRAPHED IN THE REAL PAGE, for the rework
   (docs/briefs/gale-moor-rework.md). Node renders lie about light (docs/AGENT-HANDOFF.md), so every picture is the page's own
   320x180 buffer after 300 BK.step frames, saved at 2x as docs/galemoor/<tag>-NN-<spot>.png.
   The spots come from the level itself: the rework's builder names its sections in L.sections ({ name, x0, x1, shot: [x, y] }),
   so a cut or a move can never leave this list pointing at the old columns. The level as it was before the rework had no such
   list, and its spots are written out below ONCE, for the 'before' set only (it is 996 columns wide; nothing else is).
   Foes are put down for the section shots (the picture is the place, not the fight); the summit keeps the Windcaller.
   Two shots are taken in motion: the Sky Road from the kite, and a told gust at the height of its build-up (after only). */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot', only = process.argv[3] ? process.argv[3].split(',') : null;
const out = join(ROOT, 'docs/galemoor'); mkdirSync(out, { recursive: true });
/* THE LEVEL BEFORE THE REWORK (996 wide), in its built columns: [name, tile x, stand row] */
const BEFORE = [['moor-gate', 20, 21], ['causeway', 70, 20], ['stone-circle', 128, 21], ['bothy', 160, 21], ['kite-field', 214, 21],
  ['wind-rivers', 262, 25], ['ridge-run', 318, 17], ['howling-gap', 352, 13], ['gallery', 474, 13], ['whistle-stones', 512, 5],
  ['downdraft-cliff', 575, 21], ['cairn-ridge', 610, 13], ['mills', 648, 11], ['tumble', 708, 13], ['kite-post', 743, 13]];
const pg = await openPage();
const snap = () => `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
let n = 0;
const save = (name, png) => { const f = tag + '-' + String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('docs/galemoor/' + f); };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  /* a fresh save is below the level this wood expects, and its CATCHING UP toast sat over the top of every shot: give the hero the XP */
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })()`);
  const spots = await pg.evalp(`(() => { const L = __LV.find(l => l.id === 'moor').build();
    return L.sections ? L.sections.filter(s => s.shot).map(s => [s.id, s.shot[0], s.shot[1]]) : ${JSON.stringify(BEFORE)}; })()`);
  const boot = `const i = __LV.findIndex(l => l.id === 'moor'); BK.load(i); BK.start(); BK.god = true; BK.sim(900);`;
  for (const [name, x, y] of spots) { if (only && !only.includes(name)) continue;
    const d = await pg.evalp(`(() => { ${boot}
      BK.tp(${x}, ${y}); BK.sim(40);
      for (const e of BK.enemies()) e.alive = false;
      for (let k = 0; k < 300; k++) BK.step(1);   /* the hint toast only runs down while it is drawn: 300 drawn frames, and it is gone */
      return { png: ${snap()} };
    })()`);
    save(name, d.png);
  }
  if (!only || only.includes('sky-road')) {   /* THE SKY ROAD, from the kite: take hold at the post and fly for fifteen seconds, into the teeth (the camera is let catch up at the post first: the ride starts from wherever the view is) */
    const d = await pg.evalp(`(() => { ${boot}
      const k = BK.L.ents.find(e => e.t === 'stormkite'); BK.tp(k.x - 4, k.y); for (let q = 0; q < 120; q++) BK.step(1); BK.tp(k.x, k.y); for (let q = 0; q < 900; q++) { BK.P.inv = 9; BK.step(1); }
      return { png: ${snap()}, fly: !!BK.P.fly };
    })()`);
    save('sky-road', d.png); console.log('  (on the kite: ' + d.fly + ')');
  }
  if (!only || only.includes('told-gust')) {   /* A TOLD GUST at the height of its build-up, and then blowing (after the rework only) */
    const d = await pg.evalp(`(() => { ${boot}
      const z = (BK.L.gusts || []).find(q => q.told && !q.arena); if (!z) return { none: true };
      const x = Math.round((z.x0 + z.x1) / 32), y = Math.round(z.y1 / 16) - 1; BK.tp(z.dir > 0 ? Math.round(z.x0 / 16) + 2 : Math.round(z.x1 / 16) - 2, y); BK.sim(20);
      for (const e of BK.enemies()) e.alive = false;
      const ph = () => (BK.time + (z.phase || 0)) % z.period;
      for (let q = 0; q < 900 && !(ph() > z.period - 0.4); q++) BK.step(1); const tell = ${snap()};
      for (let q = 0; q < 900 && !(ph() > 0.5 && ph() < z.on); q++) BK.step(1); const on = ${snap()};
      return { tell, on };
    })()`);
    if (!d.none) { save('gust-tell', d.tell); save('gust-on', d.on); }
  }
  if (!only || only.includes('summit')) {
    const d = await pg.evalp(`(() => { ${boot}
      const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(60);
      for (const e of BK.enemies()) if (e.t !== A.boss) e.alive = false;
      for (let k = 0; k < 300; k++) BK.step(1);
      return { png: ${snap()} };
    })()`);
    save('summit', d.png);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
