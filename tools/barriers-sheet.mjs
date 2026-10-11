// tools/barriers-sheet.mjs - ONE SHEET of the barriers (claude/barriers): per region a gate (2 wide x 6 tall), the boss seal (2 x 6), the lock plate, and the boss touches. Not in the suite.
//   usage: PORT=8834 node tools/barriers-sheet.mjs   -> work/claude/shots/barriers/sheet.png (4x)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/shots/barriers'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const d = await pg.evalp(`(async()=>{ const B = await import('/src/barriers.js'); const E = await import('/src/exit-gates.js'); const ART = await import('/src/art.js');
    const K = 4, kinds = B.KINDS, per = 5, cw = 90, ch = 150, rows = 2; const base = document.createElement('canvas'); base.width = per * cw; base.height = rows * ch + 40; const g = base.getContext('2d'); g.imageSmoothingEnabled = false;
    const ids = { forest: 'wood', marsh: 'marsh', fungus: 'spore', crag: 'scree', mine: 'oreroad', storm: 'storm', coast: 'longwater', canal: 'canal', inland: 'burial', desert: 'caravan' };
    const bg = { forest: '#2c4a30', marsh: '#2a3a30', fungus: '#32243f', crag: '#4a443c', mine: '#2c2620', storm: '#2a3042', coast: '#2a4a5a', canal: '#2a3c44', inland: '#34303c', desert: '#7a5a38' };
    const orig = ART.bakePortcullis(600), vine = ART.bakeVineWall(1);
    kinds.forEach((k, n) => { const ox = (n % per) * cw, oy = Math.floor(n / per) * ch + 12; g.fillStyle = bg[k]; g.fillRect(ox, oy - 12, cw, ch); g.fillStyle = '#fff'; g.font = '8px monospace'; g.fillText(k, ox + 3, oy - 3);
      const id = ids[k];
      for (let y = 0; y < 6; y++) for (let x = 0; x < 2; x++) { g.drawImage(B.gate(id, x + y) || orig, ox + 4 + x * 16, oy + 4 + y * 16); g.drawImage(B.seal(id, y + x, null), ox + 44 + x * 16, oy + 4 + y * 16); }
      const pl = B.plate(id); if (pl) g.drawImage(pl, ox + 4, oy + 104); });
    // boss touches + the old ones for reference
    let bx = 4, by = 2 * ch + 14; g.fillStyle = '#222'; g.fillRect(0, 2 * ch, base.width, 40); g.fillStyle = '#fff'; g.font = '8px monospace'; g.fillText('old: portcullis, vine wall | touches: queen, puppeteer, wickerqueen, pyromancer, duneworm', 3, by - 4);
    g.drawImage(orig, bx, by); bx += 18; g.drawImage(vine, bx, by); bx += 22;
    for (const b of ['queen', 'puppeteer', 'wickerqueen', 'pyromancer', 'duneworm']) { for (let y = 0; y < 1; y++) for (let x = 0; x < 3; x++) g.drawImage(B.seal(b === 'duneworm' ? 'caravan' : b === 'queen' ? 'wood' : b === 'puppeteer' ? 'theatre' : b === 'wickerqueen' ? 'fair' : 'burning', x, b), bx + x * 16, by); bx += 54; }
    const c = document.createElement('canvas'); c.width = base.width * K; c.height = base.height * K; const g2 = c.getContext('2d'); g2.imageSmoothingEnabled = false; g2.drawImage(base, 0, 0, c.width, c.height); return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'sheet.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/barriers/sheet.png');
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
