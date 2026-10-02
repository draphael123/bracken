// tools/canalfix3-shots.mjs - THE FOG CANAL, the street look and the water read (claude/canalfix3). Not in the suite: a picture, not a playtest (god mode).
//   usage: node tools/canalfix3-shots.mjs <before|after>   -> work/claude/canalfix3/<before|after>/*.png (2x frames from the game's own canvas)
//   One run before, one after (lane cost rule). The frames: the street and its towpaths (wood -> stone), the foes (goblins -> canal toughs),
//   the water at night in the fog (Jenny's green against the safe swims' clear blue), Jenny herself.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = process.env.SHOTS_OUT || join(ROOT, 'work/claude/canalfix3', tag);   /* SHOTS_OUT: a scratch look while building */ mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'canal'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const C = () => BK.canal();
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const clear = () => { for (const f of C().fogs) { f.fade = 0; f.clear = 9999; } };
    fresh(); BK.tp(8, 25); run(80); snap('1-the-dead-street');
    fresh(); BK.tp(24, 33); clear(); run(80); snap('2-the-warehouse');
    fresh(); C().barge.x = 44 * TS; BK.tp(50, 36); clear(); run(80); snap('3-the-towpath');
    fresh(); BK.tp(96, 29); clear(); run(80); snap('4-the-mill-wharf');
    fresh(); C().barge.x = 148 * TS; BK.tp(152, 29); clear(); run(80); snap('5-the-garrison-bridge');
    fresh(); C().barge.x = 150 * TS; BK.tp(178, 29); clear(); run(80); snap('6-the-pier');
    fresh(); C().barge.x = 326 * TS; BK.tp(333, 40); clear(); run(80); snap('7-the-basin-island');
    fresh(); C().barge.x = 160 * TS; BK.tp(170, 29); run(80); snap('8-the-water-at-night');
    fresh(); BK.tp(392, 41); run(30); snap('9-jenny');
    if (BK.canalSwims) for (const [i, s] of BK.canalSwims().entries()) { fresh(); BK.tp(s[0], s[1]); run(80); snap('10-swim-' + i); }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/canalfix3/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
