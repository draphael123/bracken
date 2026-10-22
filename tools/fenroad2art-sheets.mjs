// tools/fenroad2art-sheets.mjs - the baked sheets of the Fen Road 2 art pass, laid out for eyes: THE STILT-WALKER (every frame, and a WALK STRIP of one full stride + stomp), THE BOG LEECH.
// TAG=after PORT=<port> node tools/fenroad2art-sheets.mjs   ->  work/claude/lane-done/fenroad2art-<TAG>-{stiltwalker-sheet,stiltwalker-walk,leech-sheet}.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const TAG = process.env.TAG || 'after';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const SW = await import('/src/stilt-walker.js'); const BL = await import('/src/bog-leech.js'); const shots = [];
    const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }, flip = c => { const [d, g] = canvas(c.width, c.height); g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); return d; }, white = c => c;
    const sheet = (name, set, idx, labels, z = 4, bg = '#6a7a6a', floorY = null) => { const w = set.R[0].width, h = set.R[0].height, c = document.createElement('canvas'); c.width = idx.length * (w + 4) * z; c.height = (h + 10) * z; const g = c.getContext('2d');
      g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false; idx.forEach((i, n) => { g.drawImage(set.R[i], n * (w + 4) * z, 0, w * z, h * z); if (floorY !== null) { g.fillStyle = '#3a2c1c'; g.fillRect(n * (w + 4) * z, floorY * z, (w + 4) * z, 3 * z); } g.fillStyle = '#fff'; g.font = (6 * z / 2) + 'px monospace'; g.fillText(i + ' ' + (labels[i] || ''), n * (w + 4) * z + 2, (h + 8) * z); }); shots.push([name, c.toDataURL('image/png')]); };
    const sw = SW.bakeStiltWalker(canvas, flip, white), lab = Object.entries(SW.SW_POSE).sort((a, b) => a[1] - b[1]).map(([k]) => k), all = sw.R.map((_, i) => i);
    sheet('stiltwalker-sheet', sw, all.slice(0, 10), lab, 4); sheet('stiltwalker-sheet2', sw, all.slice(10), lab, 4);
    sheet('stiltwalker-walk', sw, [0, 15, 1, 17, 19, 16, 2, 18, 19, 0, 13, 14], lab, 4, '#7d8d80', sw.ay + 1);
    const lc = BL.bakeLeech(canvas, flip, white); sheet('leech-sheet', lc, lc.R.map((_, i) => i), Object.entries(BL.LEECH_POSE).sort((a, b) => a[1] - b[1]).map(([k]) => k), 6, '#4a5a52');
    return { res: shots }; })()`, 120000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'fenroad2art-' + TAG + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' sheets', 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
