// tools/honeyhornet-sheet.mjs - THE FAT HONEY HORNET's SHEET (claude/hornetsnest2): every pose of HONEY_POSE (src/honey-hornet.js), baked, labelled, at 4x, and its card.
// PORT=<port> node tools/honeyhornet-sheet.mjs  ->  work/claude/lane-done/hornetsnest2-honeyhornet-sheet.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => { const HH = await import('/src/honey-hornet.js'); const S = BK.spr ? BK.spr.honeyhornet : null; const px = await import('/src/px.js');
    const set = S || HH.bakeHoneyHornet(px.canvas, px.flipX, px.whiten); const names = ['fly', 'fly2', 'dripTell', 'drop', 'ramTell', 'ram', 'reel', 'drowsy', 'hurt', 'dead', 'card:fly', 'card:ramTell'];
    const fr = [...set.R, ...set.card.R], z = 4, cw = 44 * z + 16, c = document.createElement('canvas'); c.width = cw * 6; c.height = (34 * z + 30) * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#6a5a3a'; g.fillRect(0, 0, c.width, c.height); g.font = '14px monospace';
    fr.forEach((f, i) => { const x = (i % 6) * cw + 8, y = Math.floor(i / 6) * (34 * z + 30) + 22; g.drawImage(f, x, y, f.width * z, f.height * z); g.fillStyle = '#fff'; g.fillText(i + ' ' + names[i], x, y - 6); });
    return c.toDataURL('image/png'); })()`, 60000);
  writeFileSync(join(out, 'hornetsnest2-honeyhornet-sheet.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('written', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
