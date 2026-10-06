// tools/skyroad-art-shots.mjs - THE SKY ROAD's art-pass pictures (claude/skyroadart). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=<yours> node tools/skyroad-art-shots.mjs <before|after>   -> docs/skyroad/<before|after>/art-*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'docs/skyroad', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'skyroad'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(60); for (const e of BK.enemies()) e.alive = false; };
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const at = (name, x, y, n) => { BK.tp(x, y); run(n || 14); BK.look(x, y); snap(name); };
    fresh();
    at('art-01-start', 4, 45); at('art-02-mesa-a', 45, 39); at('art-03-wind-cave', 80, 41); at('art-04-cloak-mast', 98, 33);
    fresh(); BK.skyroad().setStone('s1', true); at('art-05-stone-on', 119, 37, 30);
    fresh(); at('art-05b-stone-off', 119, 37, 30);
    fresh(); BK.skyroad().setStone('s2', true); at('art-06-reel-deck', 143, 25, 140);
    fresh(); at('art-07-upper-deck', 170, 13);
    at('art-08-roost-one', 206, 19); at('art-09-roost-two', 217, 17); at('art-10-kite-platform', 230, 9); at('art-11-far-cliff', 275, 17);
    fresh(); BK.tp(294, 17); BK.P.face = 1; BK.press('atk'); run(80); BK.look(298, 17); snap('art-12-disc-lit');
    fresh(); BK.skyroad().setStone('s3', true); BK.tp(310, 12); run(60); BK.look(310, 12); snap('art-13-disc-road');
    fresh(); at('art-14-tower', 340, 12); at('art-15-spans', 352, 19); at('art-16-loft', 362, 10); at('art-17-eyrie-door', 384, 14); at('art-18-eyrie-arena', 410, 17); at('art-19-eyrie-far', 436, 17); at('art-20-road-down', 454, 17);
    fresh(); BK.tp(67, 49); for (let k = 0; k < 4; k++) { run(100); BK.look(67, 49); snap('art-21-thermal-two-' + k); }
    fresh(); BK.tp(131, 45); run(20); BK.look(131, 45); snap('art-22-thermal-four-dead');
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('docs/skyroad/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
