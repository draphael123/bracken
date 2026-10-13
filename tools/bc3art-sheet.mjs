// tools/bc3art-sheet.mjs - the BC3 art lane's CONTACT SHEET (claude/bc3art): composes work/claude/shots/bc3art/*.png (names below) into contact-sheet.png. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
const dir = join(ROOT, 'work/claude/shots/bc3art');
const names = ['stair', 'fall-up', 'breach', 'sea', 'exam', 'court', 'king-surge-tell', 'king-grasp-tell', 'king-rain-tell', 'king-slip-tell', 'king-tide-on', 'king-p3-great-turn'];
const items = names.map(n => [n, 'data:image/png;base64,' + readFileSync(join(dir, n + '.png')).toString('base64')]);
const pg = await openPage({ audio: false });
try {
  const d = await pg.evalp(`(async () => { const items = ${JSON.stringify(items)}; const cols = 3, cw = 640, ch = 360, rows = Math.ceil(items.length / cols); const c = document.createElement('canvas'); c.width = cw * cols; c.height = ch * rows; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    for (let k = 0; k < items.length; k++) { const im = new Image(); im.src = items[k][1]; await im.decode(); const x = (k % cols) * cw, y = Math.floor(k / cols) * ch; g.drawImage(im, x, y); g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(x, y + ch - 14, 150, 14); g.fillStyle = '#fff'; g.font = '10px monospace'; g.fillText(items[k][0], x + 4, y + ch - 4); } return c.toDataURL('image/png'); })()`);
  writeFileSync(join(dir, 'contact-sheet.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('contact-sheet.png');
} finally { pg.close(); }
