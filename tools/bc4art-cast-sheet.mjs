// tools/bc4art-cast-sheet.mjs - THE BURIED CITY 4's new sprites on one sheet (claude/bc4art): `PORT=.. node tools/bc4art-cast-sheet.mjs [sandbound|king0|king1|king2 ...]`
//   env: K=scale (4), FROM/TO = the frame range (e.g. FROM=26 TO=32), BOTH=1 also draws the left-facing row.   -> work/claude/shots/bc4art/cast-<key>.png. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/shots/bc4art'); mkdirSync(out, { recursive: true });
const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['sandbound'];
const K = +(process.env.K || 4), FROM = +(process.env.FROM || 0), TO = +(process.env.TO || 999);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const CAST = await import('/src/redraw/buried_city_cast.js'); const mk = { sandbound: () => CAST.bakeSandBound(), king0: () => CAST.bakeHourglassKing(0), king1: () => CAST.bakeHourglassKing(1), king2: () => CAST.bakeHourglassKing(2) };
    const res = {}; for (const key of ${JSON.stringify(keys)}) { const s = mk[key](); const idx = s.R.map((_, i) => i).filter(i => i >= ${FROM} && i <= ${TO}); const cw = s.R[0].width, ch = s.R[0].height, cols = Math.min(${process.env.COLS || 5}, idx.length), rows = Math.ceil(idx.length / cols), k = ${K};
      const c = document.createElement('canvas'); c.width = cols * (cw + 4) * k; c.height = rows * (ch + 4) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, c.width, c.height);
      idx.forEach((fi, i) => { const x = (i % cols) * (cw + 4) * k, y = Math.floor(i / cols) * (ch + 4) * k; g.fillStyle = '#6a5a48'; g.fillRect(x + 2 * k, y + 2 * k, cw * k, ch * k); g.drawImage(s.R[fi], x + 2 * k, y + 2 * k, cw * k, ch * k); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(fi, x + 3, y + 11); });
      res[key] = c.toDataURL('image/png'); } return res; })()`);
  for (const [k, d] of Object.entries(r)) { writeFileSync(join(out, 'cast-' + k + (process.env.TAG || '') + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('cast-' + k + (process.env.TAG || '') + '.png'); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
