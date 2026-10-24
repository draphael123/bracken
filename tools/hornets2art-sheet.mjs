// tools/hornets2art-sheet.mjs - BEFORE / AFTER SHEETS for the art lane (claude/hornets2art): pairs of work/claude/lane-done/hornets2art-before-<n>.png | hornets2art-after-<n>.png side by side.
// PORT=<port> node tools/hornets2art-sheet.mjs  ->  work/claude/lane-done/hornets2art-sheet-<set>.png
import { openPage, ROOT } from './cdp.mjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, 'work/claude/lane-done');
const SETS = { hall: ['q2-honey', 'q2-pinLast', 'q2-tearTell', 'q2-tear'], world: ['foot', 'edge-water', 'edge-gate', 'edge-roots'], foes: ['honeyhornet-sheet', 'stinger', 'hh-drop', 'hh-dead'] };
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const [set, names] of Object.entries(SETS)) {
    const pairs = names.filter(n => existsSync(join(dir, 'hornets2art-before-' + n + '.png')) && existsSync(join(dir, 'hornets2art-after-' + n + '.png'))).map(n => [n, readFileSync(join(dir, 'hornets2art-before-' + n + '.png')).toString('base64'), readFileSync(join(dir, 'hornets2art-after-' + n + '.png')).toString('base64')]);
    if (!pairs.length) continue;
    const d = await pg.evalp(`(async () => { const load = b => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b; });
      const rows = []; for (const [n, b, a] of ${JSON.stringify(pairs)}) rows.push([n, await load(b), await load(a)]);
      const CW = 640, c = document.createElement('canvas'), g = c.getContext('2d'); const hs = rows.map(([, b, a]) => Math.round(Math.max(b.height * CW / b.width, a.height * CW / a.width))); c.width = CW * 2 + 12; c.height = hs.reduce((s, h) => s + h + 22, 0); g.fillStyle = '#18141c'; g.fillRect(0, 0, c.width, c.height); g.font = '14px monospace'; g.imageSmoothingEnabled = false;
      let y = 0; rows.forEach(([n, b, a], i) => { g.fillStyle = '#ffd36b'; g.fillText(n + '   BEFORE | AFTER', 6, y + 15); g.drawImage(b, 0, y + 22, CW, b.height * CW / b.width); g.drawImage(a, CW + 12, y + 22, CW, a.height * CW / a.width); y += hs[i] + 22; });
      return c.toDataURL('image/png'); })()`, 120000);
    writeFileSync(join(dir, 'hornets2art-sheet-' + set + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('sheet', set, pairs.length);
  }
} finally { pg.close(); }
