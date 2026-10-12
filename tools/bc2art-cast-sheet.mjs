// tools/bc2art-cast-sheet.mjs - THE BURIED CITY's cast, every frame, on one sheet (claude/bc2art): `PORT=8847 node tools/bc2art-cast-sheet.mjs [key ...]` -> work/claude/shots/bc2art/cast-<key>.png (and cast.png, all of them). Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/shots/bc2art'); mkdirSync(out, { recursive: true });
const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['sanddrowned', 'sandslinger', 'brassscorpion', 'construct', 'king0', 'king1', 'king2', 'cog'];
const K = +(process.env.K || 5);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const CAST = await import('/src/redraw/buried_city_cast.js'); const sets = { sanddrowned: CAST.bakeSandDrowned(), sandslinger: CAST.bakeSandSlinger(), brassscorpion: CAST.bakeBrassScorpion(), construct: CAST.bakeConstruct(),
      king0: CAST.bakeHourglassKing(0), king1: CAST.bakeHourglassKing(1), king2: CAST.bakeHourglassKing(2) }; const cog = CAST.bakeCog(); sets.cog = { R: cog, w: 14, h: 14, ax: 7, ay: 14 };
    const res = {}; for (const key of ${JSON.stringify(keys)}) { const s = sets[key], fr = s.R; const cw = fr[0].width, ch = fr[0].height, cols = Math.min(8, fr.length), rows = Math.ceil(fr.length / cols), k = ${K};
      const c = document.createElement('canvas'); c.width = cols * (cw + 4) * k; c.height = rows * (ch + 4) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, c.width, c.height);
      fr.forEach((f, i) => { const x = (i % cols) * (cw + 4) * k, y = Math.floor(i / cols) * (ch + 4) * k; g.fillStyle = '#6a5a48'; g.fillRect(x + 2 * k, y + 2 * k, cw * k, ch * k); g.drawImage(f, x + 2 * k, y + 2 * k, cw * k, ch * k); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(i, x + 3, y + 11); });
      res[key] = c.toDataURL('image/png'); } return res; })()`);
  for (const [k, d] of Object.entries(r)) { writeFileSync(join(out, 'cast-' + k + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('cast-' + k + '.png'); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
