// tools/queengloss-sheet.mjs - THE HORNET QUEEN's poses, before (left) / after (right) (claude/queengloss). OUT=<png> Z=3 N=<poses>; needs src/redraw/prior_queen_set.js (untracked copy of the pre-pass art).
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
const out = process.env.OUT || (ROOT + 'scratch-queengloss-sheet.png');
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => {
    const N = await import('/src/redraw/hornet_queen_art.js'), O = await import('/src/redraw/prior_queen_set.js'), P = (await import('/src/hornet-queen-hands.js')).POSE;
    const Z = ${Number(process.env.Z || 3)}, names = Object.keys(P).slice(0, ${Number(process.env.N || 22)}), cols = 3, cw = 112 * Z, ch = 84 * Z;
    const rows = Math.ceil(names.length / cols), c = document.createElement('canvas'); c.width = cols * cw * 2 + 20; c.height = rows * (ch + 16) + 6; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#6a5a3a'; g.fillRect(0, 0, c.width, c.height); g.font = '12px monospace';
    names.forEach((n, i) => { const x = (i % cols) * cw * 2 + 4, y = Math.floor(i / cols) * (ch + 16) + 14; g.fillStyle = '#fff'; g.fillText(n + ' (before | after)', x, y - 2); g.drawImage(O.queenFrame(P[n], 1, false).c, x, y, cw, ch); g.drawImage(N.queenFrame(P[n], 1, false).c, x + cw, y, cw, ch); });
    return c.toDataURL('image/png'); })()`, 90000);
  writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log('written', out, JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
