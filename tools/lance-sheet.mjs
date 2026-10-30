// tools/lance-sheet.mjs - THE QUEEN'S CHAMPION as a contact sheet (claude/stormhold3art; claude/lance4: ON FOOT - the charger and the seated set are
// gone): every pose at the game's own scale (x2 here), the shielded set and then the shieldless (P3) set.
// `node tools/lance-sheet.mjs` -> work/claude/shots-lance4/lance-sheet.png (SHOTS=<dir> to change it)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots-lance4'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const d = await pg.evalp(`(async () => { const A = await import('/src/lance-art.js'); const ch = A.bakeChampion(); const K = 2, CW = 220, CH = 190, cols = 6;
    const names = Object.keys(A.F).filter(k => k !== 'hurt2'), rows = [...names.map(n => [n, A.F[n]]), ...names.map(n => [n + ' (bare)', A.F[n] + A.BARE_AT])];
    const c = document.createElement('canvas'); c.width = CW * cols; c.height = CH * Math.ceil(rows.length / cols); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#2a2838'; g.fillRect(0, 0, c.width, c.height);
    const put = (f, x, y, s) => { const im = ch.R[f]; g.drawImage(im, Math.round(x - ch.ax * s), Math.round(y - ch.ay * s), im.width * s, im.height * s); };
    rows.forEach(([nm, f], i) => { const x0 = (i % cols) * CW, y0 = Math.floor(i / cols) * CH, fx = x0 + 80, fy = y0 + CH - 24; g.fillStyle = '#4a4458'; g.fillRect(x0, fy, CW, 3);
      put(f, fx, fy, A.SCALE * K); g.fillStyle = '#fff'; g.font = '11px monospace'; g.fillText(f + ' ' + nm, x0 + 4, y0 + 12); });
    return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'lance-sheet.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)), '->', join(out, 'lance-sheet.png'));
} finally { pg.close(); }
