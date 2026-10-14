// tools/pyramidart-states.mjs - THE SEALED PYRAMID's second-half machines MID-FIRE in the real page (claude/pyramidart): the hero treads the plate (or walks up to the tomb) and a frame is shot at
// each stage -> work/claude/shots/pyramidart/states/<name>.png + states-sheet.png. Not in the suite. PORT from env. env: SHOTS, ONLY=a,b
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots/pyramidart/states'); mkdirSync(out, { recursive: true });
// [name, hero col, hero row, frames to sim after placing, also: look at col offset]
const S = [['tomb-near', 497, 57, 1], ['tomb-crack', 503, 57, 8], ['tomb-open', 503, 57, 80], ['gas-armed', 637, 51, 12], ['gas-cloud', 637, 51, 50], ['oil-armed', 745, 48, 6], ['oil-run', 745, 48, 50], ['oil-run2', 745, 48, 90],
  ['flood-bore', 864, 48, 22], ['flood-rise', 864, 48, 110], ['flood-high', 864, 48, 240], ['oilfall', 822, 48, 40]];
const want = process.env.ONLY ? S.filter(s => process.env.ONLY.split(',').includes(s[0])) : S;
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const TS = 16, res = [];
    for (const [name, col, row, fr] of ${JSON.stringify(want)}) {
      BK.load(LEVELS.findIndex(l => l.id === 'sealedpyramid')); BK.start(); BK.god = true; try { BK.SET.hud = 'minimal'; } catch (e) {} BK.sim(420);
      const P = BK.P; const put = (c, r) => { P.x = c * TS + 8; P.y = r * TS; P.vx = P.vy = 0; BK.sim(2); }; if (name.startsWith('tomb')) { BK.tp(col, row); for (let k = 0; k < 40; k++) BK.step(1); } else { put(col - 8, row); BK.sim(30); put(col, row); }
      for (let k = 0; k < fr; k++) { BK.step(1); P.hp = P.maxHp; }
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); g.fillStyle = '#fff'; g.font = '12px monospace'; g.fillText(name, 6, 350); res.push([name, c.toDataURL('image/png')]); }
    return res; })()`, 300000);
  for (const [n, d] of r) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  const d = await pg.evalp(`(async () => { const items = ${JSON.stringify(r)}; const cols = 2, rows = Math.ceil(items.length / cols), c = document.createElement('canvas'); c.width = cols * 640; c.height = rows * 360; const g = c.getContext('2d');
    for (let k = 0; k < items.length; k++) { const im = new Image(); im.src = items[k][1]; await im.decode(); g.drawImage(im, (k % cols) * 640, Math.floor(k / cols) * 360); } return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'states-sheet.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('states-sheet.png', r.length, 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
