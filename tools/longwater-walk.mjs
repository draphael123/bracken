/* tools/longwater-walk.mjs [heroes] [--shots tag] - F9 for THE LONG WATER (docs/briefs/long-water-river.md): the in-page play bot
   (src/playtest.js), NO god mode, start to gate, once per hero (default knight,warden), then the sweep for art and geometry findings.
   Prints how far it got, where it died and every finding. With --shots <tag> it instead stands (god mode) at a row of river columns,
   renders 60 frames with BK.step and saves the 320x180 buffer at 2x as work/longwater2/<tag>-<col>.png, for a before-and-after.
   Not in the suite: it is long, and the bot cannot fight or read a tell (RULES M), so it proves nothing crashes, floats or strands -
   not that the level is completable. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const args = process.argv.slice(2), si = args.indexOf('--shots'), tag = si >= 0 ? args[si + 1] : null;
const heroes = ((si === 0 ? args[2] : args[0]) || 'knight,warden').split(',');
const cols = (args.find(a => a.startsWith('--cols=')) || '--cols=4,20,60,100,124,134,150,166,200,232,262,290,320,350').slice(7).split(',').map(Number);
const pg = await openPage({ audio: false, fonts: false });
try {
  if (tag) {
    const out = join(ROOT, 'work/longwater2'); mkdirSync(out, { recursive: true });
    await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
    const shots = await pg.evalp(`(() => {
      const i = __LV.findIndex(l => l.id === 'longwater'); BK.load(i); BK.start(); BK.god = true; BK.sim(300);
      const L = BK.L, W = L.W, res = [];
      for (const x of ${JSON.stringify(cols)}) { if (x >= W) continue; let y0 = 0;
        for (let y = 2; y < L.H - 1; y++) if (L.grid[y * W + x] === 0 && L.grid[y * W + x - W] === 0 && L.grid[(y + 1) * W + x] !== 0) { y0 = y; break; }
        BK.tp(x, y0); for (let k = 0; k < 60; k++) BK.step(1);
        const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
        res.push([x, c.toDataURL('image/png')]); }
      return res;
    })()`, 600000);
    for (const [x, d] of shots) writeFileSync(join(out, tag + '-' + String(x).padStart(3, '0') + '.png'), Buffer.from(d.split(',')[1], 'base64'));
    console.log(tag, shots.length, 'shots in work/longwater2');
  } else {
    const r = await pg.evalp(`(async()=>{const rep=await BK.playtest({levels:['longwater'],heroes:${JSON.stringify(heroes)},mode:'both',quiet:true,log:false});return rep.text;})()`, 1800000);
    console.log(r);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
