/* tools/burning-shots.mjs [tag] [spots] - THE BURNING VILLAGE, PHOTOGRAPHED IN THE REAL PAGE, for the rework
   (docs/briefs/burning-village-rework.md). Node renders lie about light (docs/AGENT-HANDOFF.md), so every picture is the page's
   own 320x180 buffer after 300 BK.step frames, saved at 2x as docs/burning/<tag>-NN-<spot>.png. Run it before the rework (tag
   'before') and after (tag 'after'): the same spots and frames, so the pairs compare. Foes are put down for the place shots (the
   picture is the place, not the fight); the square keeps its boss, and 'boss-plate' is his fight a few seconds in, with the
   name, the health and the heat on the plate. 'after' adds the bucket carried, a beam's tell, the smoke and the barn shut. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot';
const out = join(ROOT, 'docs/burning'); mkdirSync(out, { recursive: true });
/* [name, tile x, tile y, keep the boss?] - the hero stands there, the camera frames him */
const SPOTS = [
  ['road-in', 20, 25], ['cottage', 56, 15], ['crofts', 100, 25], ['crofts-east', 150, 25], ['long-street', 212, 25], ['fallen-house', 226, 25],
  ['rooftops', 258, 9], ['rooftops-east', 288, 15], ['barn', 334, 25], ['barn-east', 378, 25], ['well-yard', 414, 25], ['square', 470, 23, 'boss']];
const pg = await openPage();
const snap = () => `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
let n = 0;
const save = (name, png) => { const f = tag + '-' + String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('docs/burning/' + f); };
const boot = `const i = __LV.findIndex(l => l.id === 'burning'); BK.load(i); BK.start(); BK.god = true; BK.sim(900);`;
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  /* a fresh save is below the level this wood expects, and its CATCHING UP toast sat over the top of every shot: give the hero the XP */
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })()`);
  const only = process.argv[3] ? process.argv[3].split(',') : null;   /* a comma list of spot names: just those (for the look loop) */
  for (const [name, x, y, keep] of SPOTS) { if (only && !only.includes(name)) continue;
    const d = await pg.evalp(`(() => { ${boot}
      BK.tp(${x}, ${y}); BK.sim(40);
      for (const e of BK.enemies()) if (${keep ? '!e.boss' : 'true'}) e.alive = false;
      for (let k = 0; k < 300; k++) BK.step(1);   /* the hint toast only runs down while it is drawn: 300 drawn frames, and it is gone */
      return { png: ${snap()} };
    })()`);
    save(name, d.png);
  }
  if (!only || only.includes('boss-plate')) {   /* HIS PLATE: the name, his health and his heat, four seconds into the fight, heat half way */
    const d = await pg.evalp(`(() => { ${boot}
      const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); for (let k = 0; k < 240; k++) BK.step(1);
      const b = BK.boss; if (b) b.heat = 55; for (let k = 0; k < 20; k++) BK.step(1);
      return { png: ${snap()} };
    })()`);
    save('boss-plate', d.png);
  }
  if (tag !== 'before' && !only) {   /* THE REWORK'S OWN MOMENTS, where the level has them */
    const d = await pg.evalp(`(() => { const o = {}; ${boot}
      const B = BK.village && BK.village().buckets ? BK.village().buckets() : [];
      const b0 = B[0]; if (b0) { BK.tp(Math.round(b0.x / 16), Math.round(b0.y / 16) - 1); BK.sim(20); for (const e of BK.enemies()) e.alive = false; BK.village().take(b0); BK.P.face = 1; BK.keys.right = true; for (let k = 0; k < 50; k++) BK.step(1); BK.keys.right = false; for (let k = 0; k < 30; k++) BK.step(1); o.bucket = ${snap()}; }
      const z = (BK.L.deckBreaks || []).find(q => q.beam); if (z) { BK.tp(z.x0 - 1, z.row - 1); BK.sim(10); for (const e of BK.enemies()) e.alive = false; z.t = 1.1; for (let k = 0; k < 20; k++) BK.step(1); o.beam = ${snap()}; }
      const s = (BK.L.smoke || [])[0]; if (s) { BK.tp(s.x, s.y1 - 1); BK.sim(10); for (const e of BK.enemies()) e.alive = false; for (let k = 0; k < 400 && !(BK.village().smokeUp && BK.village().smokeUp(s)); k++) BK.step(1); for (let k = 0; k < 30; k++) BK.step(1); o.smoke = ${snap()}; }
      const A = BK.ambushes && BK.ambushes()[0]; if (A) { BK.tp(A.wallL + 4, A.row); for (let k = 0; k < 90; k++) BK.step(1); o.ambush = ${snap()}; }
      return o; })()`);
    for (const k of ['bucket', 'beam', 'smoke', 'ambush']) if (d[k]) save(k, d[k]);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
