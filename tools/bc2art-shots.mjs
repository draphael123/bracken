// tools/bc2art-shots.mjs - THE BURIED CITY's art pass in the real page (claude/bc2art): `node tools/bc2art-shots.mjs [name:x:y[:sim] ...]` (x, y in tiles; y = the row to drop in from).
// No arguments = the whole level, a shot per section (SET=all), plus sheet.png (a contact sheet, 2 wide). Not in the suite: pictures are for eyes. PORT from the environment.
// env: CROP=x0,y0,w,h,k (a zoom of the 320x180 frame at k x), SHOTS=work/claude/shots/bc2art (default), SCALE=1 (the sheet's cell scale), ONLY=a,b (names), DEBUG=1 (keeps the HUD), SIM=70, SUN=1.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots/bc2art'); mkdirSync(out, { recursive: true });
const ALL = [['dunes', 20, 23], ['sinkhole', 36, 24], ['stair', 50, 35], ['firstroom', 58, 35], ['bazaar', 118, 35], ['granary', 148, 35], ['upper', 172, 27], ['dome', 188, 27], ['street', 205, 27], ['streetarch', 231, 37],
  ['cellar', 242, 37], ['bulbs', 280, 31], ['halls', 312, 32], ['sluice', 360, 41], ['sluicearch', 384, 33], ['wheel', 402, 35], ['quarter', 430, 43], ['foundry', 485, 43], ['shaft', 519, 43], ['trap', 541, 31],
  ['court', 575, 31], ['warden', 590, 31], ['vault', 604, 34], ['throne', 625, 31], ['kingroom', 650, 31]];
let want = process.argv.slice(2).map(a => a.split(':')); if (!want.length) want = ALL.map(a => a.map(String));
if (process.env.ONLY) { const o = process.env.ONLY.split(','); want = want.filter(w => o.includes(w[0])); }
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'buriedcity'); const res = []; const sim0 = ${+(process.env.SIM || 70)};
    for (const [name, xs, ys, sims] of ${JSON.stringify(want)}) {
      BK.load(i); BK.start(); BK.god = true; ${process.env.DEBUG ? '' : "try { BK.SET.hud = 'minimal'; } catch (e) {}"} BK.sim(420);
      BK.tp(+xs, +ys); for (let k = 0; k < (+sims || sim0); k++) BK.step(1); ${process.env.DEBUG ? '' : 'BK.sim(300);'} BK.step(1);
      const crop = ${JSON.stringify((process.env.CROP || '').split(',').map(Number))}; const c = document.createElement('canvas'); let g;
      if (crop.length === 5) { c.width = crop[2] * crop[4]; c.height = crop[3] * crop[4]; g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, crop[0], crop[1], crop[2], crop[3], 0, 0, c.width, c.height); }
      else { c.width = 640; c.height = 360; g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); }
      res.push([name, c.toDataURL('image/png'), Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)]); }
    return res; })()`);
  r.forEach(([name, d, x, y]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, 'at', x, y); });
  if (!process.argv.slice(2).length || process.env.SHEET) {
    const sc = +(process.env.SCALE || 1), cw = 640 * sc, ch = 360 * sc, cols = 2, rows = Math.ceil(r.length / cols);
    const d = await pg.evalp(`(async () => { const items = ${JSON.stringify(r.map(q => [q[0], q[1]]))}; const c = document.createElement('canvas'); c.width = ${cw * cols}; c.height = ${ch * rows}; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#000'; g.fillRect(0, 0, c.width, c.height);
      for (let k = 0; k < items.length; k++) { const im = new Image(); im.src = items[k][1]; await im.decode(); const x = (k % ${cols}) * ${cw}, y = Math.floor(k / ${cols}) * ${ch}; g.drawImage(im, x, y, ${cw}, ${ch}); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x, y + ${ch} - 14, 110, 14); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(items[k][0], x + 4, y + ${ch} - 4); }
      return c.toDataURL('image/png'); })()`);
    writeFileSync(join(out, 'sheet.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('sheet.png', rows * ch);
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
