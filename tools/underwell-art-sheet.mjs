// tools/underwell-art-sheet.mjs - a contact sheet of THE UNDERWELL's cast and props (claude/underwellart). Not in the suite.
//   usage: node tools/underwell-art-sheet.mjs <before|after> -> docs/underwell/<tag>/cast-*.png  (frames at 3x on a dark ground, and a 1x strip at the game's own 320x180 scale)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'docs/underwell', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const S = BK.SPR, res = [];
    const sheet = (name, sets, k, bg) => { const c = document.createElement('canvas'); let W = 0, Hh = 0; const rows = sets.filter(Boolean).map(s => { const fr = s.R; const w = fr.reduce((a, f) => a + f.width * k + 6, 6), h = Math.max(...fr.map(f => f.height)) * k + 8; W = Math.max(W, w); Hh += h; return { fr, h }; });
      c.width = W; c.height = Hh; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = bg || '#26201c'; g.fillRect(0, 0, W, Hh); let y = 0;
      for (const { fr, h } of rows) { let x = 6; for (const f of fr) { g.drawImage(f, x, y + 4, f.width * k, f.height * k); x += f.width * k + 6; } y += h; } res.push([name, c.toDataURL('image/png')]); };
    sheet('cast-scorpions', [S.scorpion, S.venomscorpion, S.firescorpion, S.oilscorpion, S.dustscorpion, S.thirstscorpion, S.spitscorpion, S.slinger], 3);
    sheet('cast-worms', [S.sandworm, S.fastworm], 3);
    sheet('cast-scorpions-1x', [S.venomscorpion, S.oilscorpion, S.dustscorpion, S.thirstscorpion, S.fireS || S.firescorpion, S.spitscorpion], 1);
    return res; })()`, 120000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
