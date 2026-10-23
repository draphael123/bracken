// tools/hornetqueen-sheet.mjs - THE HORNET QUEEN 2's POSE SHEET (claude/hornetsnestart): every pose of POSE (src/hornet-queen-hands.js), baked, labelled, at 3x.
// TAG=before|after PORT=<port> node tools/hornetqueen-sheet.mjs  ->  work/claude/lane-done/hornetqueen-<TAG>-sheet.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const TAG = process.env.TAG || 'after';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { POSE, drawQueenBody } = await import('/src/hornet-queen-hands.js'); let HQA = null; try { HQA = await import('/src/redraw/hornet_queen_art.js'); } catch (e) {}
    const Z = ${+(process.env.Z || 1)}, KEYS = ${JSON.stringify(process.env.KEYS ? process.env.KEYS.split(',') : null)}; const keys = KEYS || Object.keys(POSE), cols = KEYS ? Math.min(3, KEYS.length) : 6, cw = 150 * Z, ch = 110 * Z, z = 1, c = document.createElement('canvas'); c.width = cols * cw; c.height = Math.ceil(keys.length / cols) * ch; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#7f9560'; g.fillRect(0, 0, c.width, c.height);
    keys.forEach((k, i) => { const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + ch / 2 + 6 * Z; g.save(); g.translate(x, y); g.scale(Z, Z);
      if (HQA && TAGNEW) HQA.drawQueen(g, 0, 0, 1, POSE[k], 0.01 + (i % 3) * 0.03, false); else { g.scale(2, 2); drawQueenBody(g, POSE[k], 0.1, false, 1); } g.restore();
      g.fillStyle = '#10080a'; g.font = '10px monospace'; g.fillText(k, (i % cols) * cw + 4, Math.floor(i / cols) * ch + 12); });
    return c.toDataURL('image/png'); })()`.replace('TAGNEW', process.env.OLD ? 'false' : 'true'), 120000);
  writeFileSync(join(out, 'hornetqueen-' + TAG + '-sheet.png'), Buffer.from(r.split(',')[1], 'base64')); console.log('sheet written', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
