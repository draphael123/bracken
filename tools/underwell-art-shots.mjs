// tools/underwell-art-shots.mjs - THE UNDERWELL's art-pass pictures (claude/underwellart). Not in the suite. god mode, a picture not a playtest.
//   usage: node tools/underwell-art-shots.mjs <before|after>   -> docs/underwell/<before|after>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'docs/underwell', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'underwell'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(90);
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const snapZ = (name, sx, sy, sw, sh, k) => { const c = document.createElement('canvas'); c.width = sw * k; c.height = sh * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, sx, sy, sw, sh, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const at = (name, x, y, n) => { BK.tp(x, y); run(n || 12); BK.look(x, y); snap(name); };
    at('01-shaft-top', 6, 6);
    at('02-shaft-nest', 17, 43);
    at('03-old-fire', 31, 43);
    at('04-hall', 70, 43);
    at('05-great-lamp', 84, 31);
    at('06-chamber', 124, 43);
    at('07-works', 165, 43);
    at('08-fountain', 166, 29);
    at('09-sump-sill', 255, 44);
    at('10-sump-worms', 292, 45);
    at('11-exam-floor', 360, 42);
    at('12-nest-room', 400, 42);
    at('13-gallery', 400, 31);
    at('14-queen-door', 438, 31);
    at('15-queen-hall', 470, 51);
    BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(90);
    /* THE OIL'S FOUR STATES, and the fire: set straight on the hands' cells (a picture, not a playtest) */
    const U = () => BK.underwell(), setCells = (x0, x1, st, rows) => { for (const c of U().list) if (c.x >= x0 && c.x <= x1 && (!rows || (c.y >= rows[0] && c.y <= rows[1]))) { c.st = st; c.t = st === 'fire' ? 1.5 : 0; } };
    BK.tp(156, 43); run(6); setCells(142, 149, 'oil'); setCells(150, 155, 'wet'); setCells(156, 161, 'spent'); setCells(162, 170, 'fire'); BK.look(156, 43); snap('16-oil-four-states'); snapZ('16z-oil-four-states-x4', 0, 80, 320, 70, 4);
    BK.tp(17, 43); run(6); setCells(17, 23, 'fire'); U().nests[0].burn = 0.5; BK.look(17, 43); snap('17-nest-burning');
    BK.tp(70, 43); run(6); setCells(46, 99, 'fire', [38, 44]); BK.look(70, 43); snap('18-hall-burning');
    BK.tp(290, 44); run(6); setCells(262, 335, 'fire'); BK.look(290, 41); snap('19-gutter-burning');
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('docs/underwell/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
