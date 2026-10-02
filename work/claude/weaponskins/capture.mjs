/* one capture grid: 7 heroes (rows) x [steel, ember, frost, moon] (columns), the swing frame, 4x. Run from a checkout root: node work/claude/weaponskins/capture.mjs out.png */
import { writeFileSync } from 'node:fs';
import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(() => { const H = ['knight','pyro','paladin','pirate','reaper','warden','geomancer'], W = ['steel','ember','frost','moon'], Z = 4, cw = 60 * Z, ch = 80 * Z;
    const c = document.createElement('canvas'); c.width = cw * W.length; c.height = ch * H.length; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#2a3a2a'; g.fillRect(0, 0, c.width, c.height);
    H.forEach((h, r) => W.forEach((w, i) => { const s = BKT.heroSet('bracken', w, true, h), f = s.R.atk[1] || s.R.atk[2]; g.drawImage(f, i * cw + 8, r * ch + 8, f.width * Z, f.height * Z); g.fillStyle = '#fff'; g.font = '14px monospace'; g.fillText(h + ' / ' + w, i * cw + 8, r * ch + 18); }));
    return c.toDataURL('image/png'); })()`);
  writeFileSync(process.argv[2], Buffer.from(d.split(',')[1], 'base64'));
} finally { pg.close(); }
