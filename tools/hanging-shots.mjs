/* tools/hanging-shots.mjs [tag] - THE HANGING VILLAGE, PHOTOGRAPHED IN THE REAL PAGE: one shot per floor, the Web Hollow, the
   Reeve's crown, for the rework (docs/briefs/hanging-village-rework.md). Node renders lie about light (docs/AGENT-HANDOFF.md), so
   every picture is the page's own 320x180 buffer after 300 BK.step frames, saved at 2x as docs/hanging/<tag>-NN-<spot>.png.
   Run it before the rework (tag 'before') and after (tag 'after'): the same spots and frames, so the pairs compare.
   Foes are put down for the floor shots (the picture is the place, not the fight); the two room shots keep their boss.
   'after' also takes the crown hoist loaded and ridden, and the rope the Reeve cuts (skipped where a level has no hoist). */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const tag = process.argv[2] || 'shot';
const out = join(ROOT, 'docs/hanging'); mkdirSync(out, { recursive: true });
/* [name, tile x, tile y, keep the boss?] - the hero stands there, the camera frames him */
const SPOTS = [
  ['roots', 40, 107], ['roots-east', 88, 107], ['ropewalk', 10, 93], ['ropewalk-mid', 44, 93], ['market', 30, 79], ['market-east', 70, 79],
  ['mill', 94, 65], ['mill-hall', 30, 65], ['rookery', 30, 51], ['rookery-nest', 64, 51], ['lantern-stair', 80, 37], ['lantern-west', 30, 37],
  ['crown-door', 12, 19], ['web-hollow', 34, 128, 'mini'], ['owl-arena', 40, 19, 'boss']];
const pg = await openPage();
const snap = () => `(() => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); })()`;
let n = 0;
const save = (name, png) => { const f = tag + '-' + String(++n).padStart(2, '0') + '-' + name + '.png'; writeFileSync(join(out, f), Buffer.from(png.split(',')[1], 'base64')); console.log('docs/hanging/' + f); };
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  /* a fresh save is below the level this wood expects, and its CATCHING UP toast sat over the top of every shot: give the hero the XP */
  await pg.evalp(`(() => { BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); return true; })()`);
  const only = process.argv[3] ? process.argv[3].split(',') : null;   /* a comma list of spot names: just those (for the look loop) */
  for (const [name, x, y, keep] of SPOTS) { if (only && !only.includes(name)) continue;
    const d = await pg.evalp(`(() => {
      const i = __LV.findIndex(l => l.id === 'hanging');
      BK.load(i); BK.start(); BK.god = true; BK.sim(900);   /* past the title card and the catching-up toast */
      BK.tp(${x}, ${y}); BK.sim(40);
      for (const e of BK.enemies()) if (${keep ? 'e.maxHp === undefined && !e.mini && !e.big' : 'true'}) e.alive = false;
      for (let k = 0; k < 300; k++) BK.step(1);   /* the hint toast only runs down while it is drawn: 300 drawn frames, and it is gone */
      return { png: ${snap()} };
    })()`);
    save(name, d.png);
  }
  if (!only) { /* THE CROWN HOIST: loaded and ridden, then the rope cut in phase two (after the rework only) */
  const h = await pg.evalp(`(() => {
    const i = __LV.findIndex(l => l.id === 'hanging'); BK.load(i); BK.start(); BK.god = true; BK.sim(900);
    const hz = (BK.hoists && BK.hoists()) || []; const H = hz.find(q => q.arena); if (!H) return { none: true };
    BK.tp(Math.floor(H.deckX / 16), 19); BK.sim(30); const owl = BK.enemies().find(e => e.t === 'owl'); for (const e of BK.enemies()) if (e !== owl) e.alive = false;
    BK.hoistLoad(H, H.need); BK.tp(Math.floor((H.deckX + 16) / 16), 19); BK.P.y = H.deck.y; for (let k = 0; k < 240; k++) BK.step(1);
    const up = ${snap()};
    owl.hp = Math.floor(owl.maxHp * 0.49); for (let k = 0; k < 150 && owl.mode !== 'ropeTell'; k++) BK.step(1);
    for (let k = 0; k < 30; k++) BK.step(1); const tell = ${snap()};
    for (let k = 0; k < 150; k++) BK.step(1); const cut = ${snap()};
    return { up, tell, cut, mode: owl.mode };
  })()`);
  if (!h.none) { save('crown-hoist-up', h.up); save('reeve-rope-tell', h.tell); save('reeve-rope-cut', h.cut); console.log('owl after cut:', h.mode); } }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
