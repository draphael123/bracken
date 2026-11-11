// tools/charms3-sheet.mjs - THE 14-CHARM ICON SHEET FROM THE REAL BAKER, IN A BROWSER (claude/charms3-d).
//   node tools/charms3-sheet.mjs [out.png]     (default ../bracken-scratch/desktop-out/charms3/icon-sheet.png)
// Each charm: its icon at 1x and 4x on the store's own panel colours, name, price, unlock line, one-line effect. Icons come from src/art.js bakeCharms (the one the shop draws).
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
const out = process.argv[2] || '../bracken-scratch/desktop-out/charms3/icon-sheet.png';
const pg = await openPage({ audio: false, fonts: false, lite: false });
try {
  const url = await pg.evalp(`(async () => {
    const ART = await import('/src/art.js'), C2 = await import('/src/charms2.js'), C3 = await import('/src/charms3.js');
    const icons = ART.bakeCharms();
    const BASE = [['lucky','LUCKY CHARM',70,'none (from the start)','gold drifts to you'],['iron','IRON CHARM',90,'none (from the start)','a fifth less damage taken'],['feather','FEATHER CHARM',80,'none (from the start)','jump a little higher'],['heart','HEART CHARM',100,'none (from the start)','every kill heals 3'],['swift','SWIFT CHARM',80,'none (from the start)','run a little faster'],['ribbon',"RUNNER'S RIBBON",90,'win 45 medals','the medal clock runs a tenth slower']];
    const cards = BASE.concat(C2.CHARMS2.map(c => [c.id, c.name, c.price, c.needs ? 'clear ' + c.needsName : c.featName, c.desc]), C3.CHARMS3.map(c => [c.id, c.riddle ? c.name + ' (a riddle in the shop)' : c.name, c.price, 'T' + c.tier + ': ' + c.featName({}), c.desc]));
    const S = 4, CW = 640, CH = 92, COLS = 2, rows = Math.ceil(cards.length / COLS), W = COLS * CW + 24, H = rows * CH + 64;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    g.fillStyle = '#0a0810'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(20,16,30,0.6)'; g.fillRect(6, 6, W - 12, H - 12); g.strokeStyle = 'rgba(255,255,255,0.12)'; g.strokeRect(6.5, 6.5, W - 13, H - 13);
    g.fillStyle = '#ffd36b'; g.font = 'bold 18px monospace'; g.fillText('CHARMS: art.js bakeCharms, 1x and 4x. 6 in the shop, 8 CHARMS2, 12 CHARMS3 (feats)', 16, 32);
    const miss = [];
    cards.forEach((c, i) => { const col = i % COLS, row = (i / COLS) | 0, x = 12 + col * CW, y = 48 + row * CH, ic = icons[c[0]];
      g.fillStyle = i < 6 ? 'rgba(60,90,60,0.30)' : i < 14 ? 'rgba(90,70,40,0.30)' : 'rgba(70,60,110,0.34)'; g.fillRect(x, y, CW - 8, CH - 6);
      if (!ic) { miss.push(c[0]); g.fillStyle = '#ff6b6b'; g.font = 'bold 14px monospace'; g.fillText('NO ICON (the shop draws the bolt)', x + 8, y + 30); }
      else { g.drawImage(ic, 0, 0, 10, 12, x + 10, y + 40, 10, 12); g.drawImage(ic, 0, 0, 10, 12, x + 40, y + 12, 10 * S, 12 * S); }
      g.fillStyle = '#f4e8c8'; g.font = 'bold 15px monospace'; g.fillText(c[1] + '   ' + c[2] + ' gold', x + 100, y + 18);
      g.fillStyle = '#ff9a5c'; g.font = '13px monospace'; g.fillText('unlock: ' + c[3], x + 100, y + 40, CW - 120);
      g.fillStyle = '#d8d0e0'; g.fillText(c[4], x + 100, y + 62, CW - 120); });
    return { png: cv.toDataURL(), miss, n: cards.length };
  })()`);
  mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, Buffer.from(url.png.split(',')[1], 'base64'));
  console.log('charms3-sheet: ' + url.n + ' charms -> ' + out + (url.miss.length ? '  NO ICON: ' + url.miss.join(',') : ''));
  if (pg.errors.length) console.log('page errors', pg.errors);
} finally { pg.close(); }
