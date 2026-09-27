/* tools/unburied-shots.mjs [tag] - THE UNBURIED FIELD, PHOTOGRAPHED IN THE REAL PAGE, one shot per section, for the look pass
   (Daniel 2026-09-24: "it uses the forest theme/tiles ... it needs a graveyard theme"). Node renders lie about light
   (docs/AGENT-HANDOFF.md), so every picture is the page's own 320x180 buffer after 300 BK.step frames, saved at 2x as
   docs/unburied/<tag>-NN-<section>.png. Run it before a look change (tag 'before') and after it (tag 'after'): same spots,
   same frames, so the pairs compare. It also takes THE HEXED FIELDS' graveyard, the family the field is meant to belong to.
   Foes are cleared from the shot (god mode, every creature put down) so the picture is the place, not the fight. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot';
const out = join(ROOT, 'docs/unburied'); mkdirSync(out, { recursive: true });
/* [name, level, tile x, tile y]: the hero stands there, the camera frames him */
const SPOTS = [
  ['barrowline', 'unburied', 18, 36], ['shieldcrossing', 'unburied', 92, 36], ['brokencharge-high', 'unburied', 176, 30],
  ['brokencharge-low', 'unburied', 196, 41], ['toppledtower', 'unburied', 246, 24], ['standard', 'unburied', 268, 36],
  ['chapel', 'unburied', 358, 36], ['arena', 'unburied', 376, 36], ['hexedfields-graves', 'fields', 648, 33]];
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  let n = 0;
  for (const [name, id, x, y] of SPOTS) {
    const d = await pg.evalp(`(() => {
      const i = __LV.findIndex(l => l.id === ${JSON.stringify(id)}); if (i < 0) return { err: 'no level ' + ${JSON.stringify(id)} };
      BK.load(i); BK.start(); BK.god = true; BK.sim(900);   /* past the title card and the catching-up toast */
      BK.tp(${x}, ${y}); for (const e of BK.enemies()) if (!e.boss && e !== BK.boss) e.alive = false;
      for (let k = 0; k < 300; k++) BK.step(1);   /* the hint toast only runs down while it is drawn: 300 drawn frames, and it is gone */
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      return { png: c.toDataURL('image/png') };
    })()`);
    if (d.err) { console.log(name, d.err); continue; }
    const f = tag + '-' + String(++n).padStart(2, '0') + '-' + name + '.png';
    writeFileSync(join(out, f), Buffer.from(d.png.split(',')[1], 'base64'));
    console.log('docs/unburied/' + f);
  }
} finally { pg.close(); }
