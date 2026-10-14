// tools/pyramidart-king-sheet.mjs - THE COFFIN KING, every pose on one sheet (claude/pyramidart): `PORT=8902 node tools/pyramidart-king-sheet.mjs` -> work/claude/shots/pyramidart/king-<ph>.png (phase 1 and 3). Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots/pyramidart'); mkdirSync(out, { recursive: true });
const K = +(process.env.K || 3);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const H = await import('/src/tomb-king-hands.js'), KA = await import('/src/redraw/sealed_pyramid_king.js'), TKM = await import('/src/tomb-king.js'); const TK = TKM.TK;
    const names = Object.keys(H.POSE), res = {};
    for (const ph of [1, 3]) { const cols = 8, cw = 84, ch = 92, rows = Math.ceil(names.length / cols); const c = document.createElement('canvas'); c.width = cols * cw * ${K}; c.height = rows * ch * ${K}; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#4a3c2a'; g.fillRect(0, 0, c.width, c.height);
      names.forEach((n, i) => { const t = document.createElement('canvas'); t.width = cw; t.height = ch; const q = t.getContext('2d'); q.fillStyle = '#5a4a36'; q.fillRect(0, 0, cw, ch); q.fillStyle = '#2a2016'; q.fillRect(0, ch - 8, cw, 8); q.translate(cw / 2, ch - 8); const p = H.POSE[n]; if (p.lying) KA.drawLying(q, p, false, 0.3, TK); else KA.drawStanding(q, p, false, 0.3, ph, TK);
        g.drawImage(t, (i % cols) * cw * ${K}, Math.floor(i / cols) * ch * ${K}, cw * ${K}, ch * ${K}); g.fillStyle = '#fff'; g.font = '11px monospace'; g.fillText(n, (i % cols) * cw * ${K} + 4, Math.floor(i / cols) * ch * ${K} + 12); });
      res[ph] = c.toDataURL('image/png'); } return res; })()`);
  for (const [k, d] of Object.entries(r)) { writeFileSync(join(out, 'king-' + k + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('king-' + k + '.png'); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
