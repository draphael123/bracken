// PAGE TOOL: launches headless Chrome
// tools/waspart-sheet.mjs - THE WASP AND THE HORNET, every frame at 8x (claude/waspart). TAG=before|after OUT=<png>  (BEFORE = the old bakers, from git, via OLD=1 which imports the old files)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
const out = process.env.OUT || (ROOT + 'work/claude/lane-done/waspart-sheet.png');
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => { const W = await import('/src/redraw/wasp_art.js'); const w = W.bakeWasp(), h = W.bakeHornet(12, 13, 10, 7); const Z = 8;
    const c = document.createElement('canvas'); c.width = 26 * Z * 4 + 60; c.height = (18 * Z + 20) * 4 + 20; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#6a5a3a'; g.fillRect(0, 0, c.width, c.height); g.font = '14px monospace';
    [['wasp R', w.R], ['wasp L', w.L], ['hornet R', h.R], ['hornet L', h.L]].forEach(([n, fr], r) => fr.forEach((f, i) => { const x = i * (26 * Z + 15) + 8, y = r * (18 * Z + 20) + 22; g.drawImage(f, x, y, f.width * Z, f.height * Z); g.fillStyle = '#fff'; g.fillText(n + ' ' + i, x, y - 6); }));
    return c.toDataURL('image/png'); })()`, 60000);
  writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log('written', out, JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
