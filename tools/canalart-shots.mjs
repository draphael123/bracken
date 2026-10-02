// tools/canalart-shots.mjs - THE FOG CANAL's art-pass pictures (claude/canalart). Not in the suite. god mode, a picture not a playtest.
//   usage: node tools/canalart-shots.mjs <before|after>   -> work/claude/canalart/<before|after>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/canalart', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const TS = 16, res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'canal'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const C = () => BK.canal();
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    fresh(); BK.tp(40, 38); run(20); snap('1-the-pound-and-tiller');
    fresh(); C().barge.x = 72 * TS; BK.tp(78, 38); run(10); snap('2-the-first-lock');
    fresh(); C().barge.x = 100 * TS; BK.tp(104, 33); run(30); snap('3-the-mill-pound');
    fresh(); C().barge.x = 159 * TS; BK.tp(163, 29); run(40); snap('4-the-fog-wall');
    fresh(); C().barge.x = 326 * TS; BK.tp(333, 40); run(40); snap('5-the-basin');
    fresh(); BK.tp(380, 34); run(30); snap('6-jennys-lock');
    fresh(); BK.tp(392, 41); run(30); snap('7-the-chamber');
    fresh(); BK.look(396, 39); for (const f of C().fogs) { f.fade = 0; f.clear = 9999; } BK.step(1); snap('7b-the-lair');
    fresh(); { const c = C(); c.barge.x = 42 * TS; } BK.tp(46, 38); run(20); BK.step(1); snap('8-barge-stern');
    const zoom = (name, x, y, w, h, k) => { const c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, x, y, w, h, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    fresh(); C().barge.x = 42 * TS; BK.tp(46, 38); run(20); BK.step(1); zoom('9-barge-close', 70, 60, 180, 90, 4);
    { const c = C(); c.barge.helm = 'cut'; run(2); BK.step(1); zoom('9b-barge-helm-cut', 70, 60, 180, 90, 4); }
    fresh(); { const c = C(); c.barge.x = 52 * TS; } BK.tp(56, 38); run(10); BK.step(1); zoom('9c-barge-offside', 70, 60, 180, 90, 4);
    { const A = await import('/src/redraw/canal_foes_art.js'), sets = [A.bakeGrindylow(12, 10), A.bakeWisp(8, 12), A.bakeLamplighter()], k = 6, c = document.createElement('canvas'); c.width = 560; c.height = 3 * 26 * k / 2 + 40; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
      const bgs = ['#0c1822', '#1c2c32']; let row = 0; for (const set of sets) { g.fillStyle = bgs[0]; g.fillRect(0, row, 280, 26 * k / 2); g.fillStyle = bgs[1]; g.fillRect(280, row, 280, 26 * k / 2); let x = 6; for (const fr of set.R) { g.drawImage(fr, x, row + 6, fr.width * 4, fr.height * 4); x += fr.width * 4 + 6; if (x > 540) break; } row += 26 * k / 2; }
      res.push(['10-foes-sheet', c.toDataURL('image/png')]); }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/canalart/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
