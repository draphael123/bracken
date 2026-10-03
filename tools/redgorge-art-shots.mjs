// tools/redgorge-art-shots.mjs - THE RED GORGE's art-pass pictures (claude/redgorge-art). Not in the suite. god mode, a picture not a playtest.
//   usage: node tools/redgorge-art-shots.mjs <before|after>   -> work/claude/redgorge-art/<before|after>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/redgorge-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'redgorge'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const phase = (p) => { for (let i = 0; i < 2000 && BK.redgorge().phase !== p; i++) { BK.redgorge().t = Math.min(BK.redgorge().t, 0.02); BK.sim(1); } if (p === 'flood') BK.sim(20); };
    const at = (name, x, y, ph, n) => { fresh(); BK.tp(x, y); run(n || 20); if (ph) { phase(ph); BK.tp(x, y); run(6); } BK.look(x, y); snap(name); };
    at('01-mouth-start', 41, 165);
    at('02-mouth-horn', 38, 165, 'horn');
    at('03-mouth-flood', 30, 165, 'flood');
    at('04-falls-terrace', 36, 135);
    at('05-falls-rope-flood', 20, 128, 'flood');
    at('06-bridge-two', 30, 117);
    at('07-bridge-two-flood', 34, 117, 'flood');
    at('08-basket-ledges', 19, 117);
    at('09-cave-of-hands', 48, 81);
    at('10-the-jam', 30, 69);
    at('11-the-jam-gate-full', 30, 69, 'flood');
    at('12-the-narrows', 20, 64);
    at('13-narrows-rope', 22, 56);
    at('14-the-summit-nest', 20, 31);
    at('15-dam-door', 42, 21);
    fresh(); BK.tp(57, 21); run(80); BK.look(66, 21); snap('16-the-dam-crab');
    run(40); BK.look(66, 21); snap('17-the-dam-crab-b');
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/redgorge-art/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
