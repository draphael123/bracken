// tools/hlswitch-sheet.mjs - THE CONTACT SHEET (claude/hlswitchproof): node tools/hlswitch-sheet.mjs <stillsdir> <out.png>  (composed in the page's canvas; one headless browser)
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2], out = process.argv[3];
const LAB = { '01-j1-idle': 'J1 lever idle (yard, L2)', '02-j1-struck': 'J1 struck: callout + plate swings', '03-j1-board-lit-main-w3': 'W3 board, J1 = 0: silver shut, main way', '04-j1-board-lit-silver-w3': 'W3 board, J1 = 1: lamp lit, silver way',
  '05-j1-on-s2-silver-line': 'branch: S2, the silver line', '06-j3-idle-from-the-ride': 'J3 lever from the H2 ride', '07-j3-struck': 'J3 struck from the ride', '08-j3-on-s4': 'branch: S4 off the saw',
  '09-j4-idle': 'J4 lever idle (exam, L16)', '10-j4-struck': 'J4 struck', '11-j4-on-el-lee-branch': 'branch: EL, the lee line', '13-j4-eg-gliding-in-the-gale': 'EG, the held glide, in the gale' };
const names = Object.keys(LAB).filter(n => readdirSync(dir).includes(n + '.png'));
const imgs = names.map(n => ['data:image/png;base64,' + readFileSync(join(dir, n + '.png')).toString('base64'), LAB[n]]);
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async (imgs) => { const W = 480, H = 270, C = 3, pad = 6, lab = 18, rows = Math.ceil(imgs.length / C); const c = document.createElement('canvas'); c.width = C * (W + pad) + pad; c.height = rows * (H + lab + pad) + pad; const g = c.getContext('2d'); g.fillStyle = '#14101c'; g.fillRect(0, 0, c.width, c.height); g.font = '13px monospace';
    for (let i = 0; i < imgs.length; i++) { const im = new Image(); await new Promise(r => { im.onload = r; im.src = imgs[i][0]; }); const x = pad + (i % C) * (W + pad), y = pad + Math.floor(i / C) * (H + lab + pad); g.imageSmoothingEnabled = false; g.drawImage(im, x, y + lab, W, H); g.fillStyle = '#ffd96a'; g.fillText(imgs[i][1], x + 2, y + 13); }
    return c.toDataURL('image/png'); })(${JSON.stringify(imgs)})`, 120000);
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); console.log('sheet', names.length, 'tiles ->', out);
} finally { await pg.close(); }
