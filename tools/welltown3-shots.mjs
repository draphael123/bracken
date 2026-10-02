// tools/welltown3-shots.mjs - THE WELL TOWN's art-pass pictures (claude/welltown3-art). Not in the suite. god mode, a picture not a playtest.
//   usage: node tools/welltown3-shots.mjs <before|after>   -> work/claude/welltown3/<before|after>/*.png (2x frames from the game's own canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/welltown3', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [];
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'welltown'); const fresh = () => { BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); };
    const snap = (name) => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const view = (name, x, y) => { fresh(); BK.tp(x, y); run(24); snap(name); };
    view('1-gate-and-first-well', 12, 29);
    view('2-market-and-bazaar', 78, 29);
    view('2b-bazaar-roof', 112, 22);
    view('3-well-square', 172, 25);
    view('4-cisterns-hall', 214, 39);
    view('4b-cistern-gallery', 226, 33);
    view('5-mud-quarter', 288, 29);
    view('5b-dovecote', 316, 29);
    view('6-roost-roofs', 358, 16);
    view('6b-burning-barricade', 372, 18);
    view('7-kasbah-street', 440, 27);
    view('7b-dry-cistern', 437, 32);
    view('8-courtyard', 492, 27);
    const zoom = (name, x, y, w, h, k) => { const c = document.createElement('canvas'); c.width = w * k; c.height = h * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, x, y, w, h, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    { const P = await import('/src/redraw/welltown_props.js'), A = await import('/src/redraw/welltown_art.js'), B = await import('/src/redraw/caravan_bandits.js');
      const sc = document.createElement('canvas'); sc.width = 640; sc.height = 300; const g = sc.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#e8d2a0'; g.fillRect(0, 0, 640, 300);
      g.fillStyle = '#c9a878'; g.fillRect(0, 130, 640, 3); g.fillRect(0, 280, 640, 3);
      const t = 1.3; let x = 20;
      P.drawWell(g, x + 14, 130, { glint: 0 }, t); x += 40; P.drawWell(g, x + 14, 130, { glint: 1 }, t); x += 40; P.drawWell(g, x + 14, 130, { deep: true, up: true, glint: 0 }, t); x += 40; P.drawWell(g, x + 14, 130, { jar: true, left: 1 }, t); x += 30; P.drawWell(g, x + 14, 130, { jar: true, left: 0 }, t); x += 40;
      P.drawMudWall(g, x, 82, 16, 48, { open: false, wet: 0 }, t); x += 30; P.drawMudWall(g, x, 82, 16, 48, { open: false, wet: 1 }, t); x += 30; P.drawMudWall(g, x, 82, 16, 48, { open: true }, t); x += 40;
      P.drawFire(g, x, 82, 48, { lit: true, wet: 0 }, t); x += 30; P.drawFire(g, x, 82, 48, { lit: true, wet: 1 }, t); x += 30; P.drawFire(g, x, 82, 48, { lit: false }, t); x += 40;
      P.drawWindlass(g, x + 8, 130, { top: true, struck: 0 }, t); x += 30; P.drawWindlass(g, x + 8, 130, { top: true, struck: 0.5 }, t); x += 40;
      P.drawBucket(g, x, 108, 32, 40); x += 46; P.drawCistern(g, x + 14, 130, { full: false, got: 2 }); x += 40; P.drawCistern(g, x + 14, 130, { full: true, got: 4 }); x += 40; P.drawVaultDoor(g, x, 90, 40);
      const so = document.createElement('canvas'); so.width = 1280; so.height = 600; const og = so.getContext('2d'); og.imageSmoothingEnabled = false; og.drawImage(sc, 0, 0, 1280, 600); res.push(['9-props-sheet', so.toDataURL('image/png')]);
      const ct = B.bakeCutthroat(), sets = [ct, A.bakeWaterThief(ct), A.bakeBanditBowman()], k = 4, fo = document.createElement('canvas'); fo.width = 1000; fo.height = 3 * 40 * k / 2 + 20; const fg = fo.getContext('2d'); fg.imageSmoothingEnabled = false;
      let row = 0; for (const set of sets) { fg.fillStyle = '#d8b878'; fg.fillRect(0, row, 500, 40 * k / 2); fg.fillStyle = '#4a4a56'; fg.fillRect(500, row, 500, 40 * k / 2); let xx = 6; for (const fr of set.R) { fg.drawImage(fr, xx, row + 4, fr.width * 2, fr.height * 2); fg.drawImage(fr, 500 + xx, row + 4, fr.width * 2, fr.height * 2); xx += fr.width * 2 + 4; } row += 40 * k / 2; }
      res.push(['10-foes-sheet', fo.toDataURL('image/png')]); }
    return res; })()`, 900000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/welltown3/' + tag + '/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
