// tools/redgorge-art-sheet.mjs - a contact sheet of THE RED GORGE's cast (claude/redgorge-art). Not in the suite.
//   usage: node tools/redgorge-art-sheet.mjs <before|after> -> work/claude/redgorge-art/<tag>/cast-*.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = join(ROOT, 'work/claude/redgorge-art', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const S = BK.SPR, res = [];
    const sheet = (name, sets, k, bg) => { const c = document.createElement('canvas'); let W = 0, Hh = 0; const rows = sets.map(s => { const fr = s.R; const w = fr.reduce((a, f) => a + f.width * k + 6, 6), h = Math.max(...fr.map(f => f.height)) * k + 8; W = Math.max(W, w); Hh += h; return { fr, h }; });
      c.width = W; c.height = Hh; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = bg || '#4a2a26'; g.fillRect(0, 0, W, Hh); let y = 0;
      for (const { fr, h } of rows) { let x = 6; for (const f of fr) { g.drawImage(f, x, y + 4, f.width * k, f.height * k); x += f.width * k + 6; } y += h; } res.push([name, c.toDataURL('image/png')]); };
    const A = await import('/src/redraw/redgorge_art.js'), G = A.gorgeSets(S); sheet('cast-bandits', [S.cutthroat, G.cutthroat, S.slinger, G.slinger, S.scorpion, G.scorpion, G.scorpionElite, S.raptor], 3);
    { const fr = S.gorgecrab.R, k = 2, per = 4, rows = Math.ceil(fr.length / per), c = document.createElement('canvas'); c.width = per * (128 * k + 4); c.height = rows * (76 * k + 4); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#5a3a30'; g.fillRect(0, 0, c.width, c.height); fr.forEach((f, i) => g.drawImage(f, (i % per) * (128 * k + 4), Math.floor(i / per) * (76 * k + 4), 128 * k, 76 * k)); res.push(['cast-crab', c.toDataURL('image/png')]); }
    return res; })()`, 120000);
  for (const [name, d] of r) { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
