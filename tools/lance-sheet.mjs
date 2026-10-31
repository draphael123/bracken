// tools/lance-sheet.mjs - THE QUEEN'S CHAMPION as a contact sheet (claude/stormhold3art; claude/lance4: ON FOOT; claude/lance4art: the 1:1 sheet, x1 in the
// game, so the sheet shows him at the game's own scale times K): the shielded set, then the shieldless (P3) set, then the bestiary card.
// `node tools/lance-sheet.mjs` -> work/claude/shots-lance4/lance-sheet.png (SHOTS=<dir> to change it; K=<n> for the zoom, default 2)
// Also prints the frame count (the cap is 120).
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots-lance4'); mkdirSync(out, { recursive: true });
const K = +(process.env.K || 2);
const pg = await openPage({ audio: false });
try {
  const d = await pg.evalp(`(async () => { const A = await import('/src/lance-art.js'); const ch = A.bakeChampion(), K = ${K}, CW = 100 * K, CH = 78 * K, cols = Math.floor(1900 / CW);
    const sh = Object.keys(A.F).filter(k => !/hurt2|hurtB2/.test(k)).map(k => [k, A.F[k]]), bare = Object.keys(A.FB).map(k => [k + ' (bare)', A.FB[k]]);
    const rows = [...sh, ...bare];
    const c = document.createElement('canvas'); c.width = CW * cols; c.height = CH * Math.ceil(rows.length / cols) + 120 * K; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#2a2838'; g.fillRect(0, 0, c.width, c.height);
    const put = (f, x, y, s) => { const im = ch.R[f]; g.drawImage(im, Math.round(x - ch.ax * s), Math.round(y - ch.ay * s), im.width * s, im.height * s); };
    rows.forEach(([nm, f], i) => { const x0 = (i % cols) * CW, y0 = Math.floor(i / cols) * CH, fx = x0 + 34 * K, fy = y0 + CH - 8 * K; g.fillStyle = '#4a4458'; g.fillRect(x0, fy, CW, 2);
      put(f, fx, fy, A.SCALE * K); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(f + ' ' + nm, x0 + 3, y0 + 11); });
    const card = A.bakeCard(), cy0 = CH * Math.ceil(rows.length / cols) + 4; card.R.forEach((im, i) => g.drawImage(im, 10 + i * (im.width * K + 10), cy0, im.width * K, im.height * K));
    g.fillStyle = '#fff'; g.fillText('bestiary card x2 | frames ' + A.FRAMES + ' (cap 120)', 10, c.height - 4);
    return { url: c.toDataURL('image/png'), frames: A.FRAMES }; })()`);
  writeFileSync(join(out, 'lance-sheet.png'), Buffer.from(d.url.split(',')[1], 'base64'));
  console.log('frames', d.frames, 'errors', JSON.stringify(pg.errors.slice(0, 5)), '->', join(out, 'lance-sheet.png'));
} finally { pg.close(); }
