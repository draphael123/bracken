// tools/exitgates-sheet.mjs - ONE SHEET of the ten landmarks (claude/exitgates): row 1 shut + dark lantern, row 2 half open + lit, row 3 open. Not in the suite.
//   usage: PORT=8827 node tools/exitgates-sheet.mjs   -> work/claude/shots/exitgates/sheet.png (5x)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/shots/exitgates'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const d = await pg.evalp(`(async()=>{ const EG = await import('/src/exit-gates.js'); const K = 5, cw = 64, ch = 70, c = document.createElement('canvas'); c.width = EG.KINDS.length * cw * K; c.height = 3 * ch * K;
    const base = document.createElement('canvas'); base.width = EG.KINDS.length * cw; base.height = 3 * ch; const g = base.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#5a4a78'; g.fillRect(0, 0, base.width, base.height); g.fillStyle = '#4a7a3a'; g.fillRect(0, 0, 0, 0);
    EG.KINDS.forEach((k, i) => { for (let r = 0; r < 3; r++) { g.fillStyle = '#7a6890'; g.fillRect(i * cw, r * ch, cw, ch - 6); g.fillStyle = '#4a7a3a'; g.fillRect(i * cw, r * ch + ch - 6, cw, 6);
      const st = r === 0 ? {} : { t: 0, lit: 1, open: r === 1 ? 0.5 : 1, sl: 1, so: 1 }; const near = r === 0 ? 999 : r === 1 ? 80 : 10;
      EG.draw(g, k, i * cw + cw / 2, r * ch + ch - 6, 0, 0, 1 + r, near, false, st, null); } });
    const g2 = c.getContext('2d'); g2.imageSmoothingEnabled = false; g2.drawImage(base, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'sheet.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/exitgates/sheet.png');
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
