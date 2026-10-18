// tools/hurricane2art-sheet.mjs - THE CAPTAIN's pose sheet (claude/hurricane2art; not in the suite): every frame of bakeCaptain() on a storm sky, labelled.
//   node tools/hurricane2art-sheet.mjs [outdir]       env F=13,15 (only those frames), S=4 (scale). PORT from the environment, one page.
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/hurricane2art'; mkdirSync(out, { recursive: true });
const page = async (F, S) => {
  const P = await import('/src/redraw/pirates.js'); const set = P.bakeCaptain(); const only = F.split(',').filter(Boolean).map(Number), idx = only.length ? only : set.R.map((_, i) => i), N = idx.length, cols = only.length ? Math.min(only.length, 3) : 5, rows = Math.ceil(N / cols);
  const names = ['idle', 'walk1', 'walk2', 'sabreTell', 'sabre1', 'sabre2', 'shootTell', 'shoot', 'hookTell', 'hook', 'call', 'ride', 'HELD on a line', 'BRACE: for a line', 'STRUCK', 'kegTell', 'keg', 'TURNED (shield)', 'FLAT'];
  const cw = 46 * S + 8, ch = 38 * S + 22, cv = document.createElement('canvas'); cv.width = cols * cw; cv.height = rows * ch; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const sky = g.createLinearGradient(0, 0, 0, cv.height); sky.addColorStop(0, '#2a3a4a'); sky.addColorStop(1, '#44586a'); g.fillStyle = sky; g.fillRect(0, 0, cv.width, cv.height);
  for (let n = 0; n < N; n++) { const i = idx[n], x = (n % cols) * cw, y = Math.floor(n / cols) * ch, c = set.R[i];
    g.fillStyle = '#5a4a38'; g.fillRect(x, y + ch - 30, cw, 8);
    g.drawImage(c, x + 4, y + ch - 22 - c.height * S + 2, c.width * S, c.height * S);
    g.fillStyle = '#fff'; g.font = '12px monospace'; g.fillText(i + ' ' + (names[i] || ''), x + 6, y + 14); }
  return cv.toDataURL('image/png');
};
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(${page.toString()})(${JSON.stringify(process.env.F || '')}, ${+(process.env.S || 4)})`, 120000);
  writeFileSync(join(out, process.env.NAME || 'captain.png'), Buffer.from(r.split(',')[1], 'base64')); console.log('wrote', 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
