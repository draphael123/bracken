// tools/crusader-sheet.mjs - THE CRUSADER's frames on one sheet (claude/crusader; not in the suite): every frame of bakePaladinBoss at 3x, numbered.
//   usage: PORT=8793 node tools/crusader-sheet.mjs [out.png]
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || join(ROOT, 'work/claude/crusader-sheet.png');
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async()=>{ const W = await import('/src/redraw/waymeet.js'); const S = W.bakePaladinBoss(), F = S.R, n = F.length, cols = 8, z = 3, cw = 100 * z, ch = 100 * z;
    const c = document.createElement('canvas'); c.width = cols * cw; c.height = Math.ceil(n / cols) * ch; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#3a4a3a'; g.fillRect(0, 0, c.width, c.height);
    F.forEach((f, i) => { const x = (i % cols) * cw, y = Math.floor(i / cols) * ch; g.fillStyle = (i % 2) ? '#45574a' : '#3a4a3a'; g.fillRect(x, y, cw, ch); g.drawImage(f, x, y, cw, ch);
      g.fillStyle = '#222'; g.fillRect(x, y + 92 * z, cw, 2); g.fillStyle = '#fff'; g.font = '20px monospace'; g.fillText(String(i), x + 6, y + 22); });
    return c.toDataURL('image/png'); })()`);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + out);
} finally { pg.close(); }
