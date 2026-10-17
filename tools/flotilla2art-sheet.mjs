// tools/flotilla2art-sheet.mjs - THE ADMIRAL'S CHAMPION's pose sheet (claude/flotilla2art; not in the suite): every pose key of src/redraw/champion_art.js at p = 0, .5, 1, on a dusk sky and a deck, 3x.
//   node tools/flotilla2art-sheet.mjs <outdir> [p1|p2|fx|dead|all]
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/flotilla2art', which = process.argv[3] || 'all';
mkdirSync(out, { recursive: true });
const page = async which => {
  const A = await import('/src/redraw/champion_art.js');
  const P1 = ['walk', 'recover', 'sleep', 'wake', 'comboTell', 'combo', 'comboRec', 'slamTell', 'slam', 'stuck', 'slamRec', 'thrustTell', 'thrust', 'thrustRec', 'leapTell', 'leap', 'landRec', 'flat'];
  const P2 = ['walk', 'recover', 'tearTell', 'sweepTell', 'sweep', 'sweepRec', 'hookTell', 'hook', 'hookRec', 'tiltTell', 'tilt', 'stuckA', 'tiltRec', 'flat'];
  const S = 3, CW = 170, CH = 120, out = [];
  const sheet = (rows, anchor, extra = {}) => { const cv = document.createElement('canvas'); cv.width = 90 + 3 * CW * S / 1; cv.height = rows.length * CH * S / 1 + 4; cv.width = 90 + 3 * CW * S; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    rows.forEach((m, i) => { for (let j = 0; j < 3; j++) { const c = document.createElement('canvas'); c.width = CW; c.height = CH; const q = c.getContext('2d'); const sky = q.createLinearGradient(0, 0, 0, CH); sky.addColorStop(0, '#6a5a8a'); sky.addColorStop(1, '#e8b98a'); q.fillStyle = sky; q.fillRect(0, 0, CW, CH); q.fillStyle = '#bfb190'; q.fillRect(0, CH - 14, CW, 14); q.fillStyle = '#fdf6e2'; q.fillRect(0, CH - 14, CW, 2);
        A.drawChampion(q, 70, CH - 14, 1, { mode: m, p: j / 2, anchor, ward: extra.ward ? 2 : 0, flash: !!extra.flash }, 1.3 + j * 0.07); g.drawImage(c, 90 + j * CW * S, 2 + i * CH * S, CW * S, CH * S); }
      g.fillStyle = '#000'; g.font = '14px monospace'; g.fillText(m, 4, 20 + i * CH * S); }); return cv.toDataURL('image/png'); };
  const res = {};
  if (which === 'p1' || which === 'all') { res.p1a = sheet(P1.slice(0, 9), false); res.p1b = sheet(P1.slice(9), false); }
  if (which === 'p2' || which === 'all') { res.p2a = sheet(P2.slice(0, 7), true); res.p2b = sheet(P2.slice(7), true); res.ward = sheet(['recover', 'walk'], false, { ward: 1 }); res.flash = sheet(['recover'], false, { flash: 1 }); }
  if (which === 'dead' || which === 'all') { const cv = document.createElement('canvas'); cv.width = 6 * 200 * 2; cv.height = 2 * 130 * 2; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    [false, true].forEach((an, r) => [0.05, 0.25, 0.4, 0.55, 0.8, 1].forEach((k, j) => { const c = document.createElement('canvas'); c.width = 200; c.height = 130; const q = c.getContext('2d'); q.fillStyle = '#8a7a9a'; q.fillRect(0, 0, 200, 130); q.fillStyle = '#bfb190'; q.fillRect(0, 116, 200, 14);
      A.drawDeadChampion(q, 90, 116, 1, k, 1, an); g.drawImage(c, j * 400, r * 260, 400, 260); })); res.dead = cv.toDataURL('image/png'); }
  if (which === 'fx' || which === 'all') { const cv = document.createElement('canvas'); cv.width = 1000; cv.height = 900; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false; const cell = (j, i, fn) => { const c = document.createElement('canvas'); c.width = 250; c.height = 150; const q = c.getContext('2d'); q.fillStyle = '#7a6a9a'; q.fillRect(0, 0, 250, 150); q.fillStyle = '#2a4a6a'; q.fillRect(80, 118, 90, 32); q.fillStyle = '#bfb190'; q.fillRect(0, 116, 80, 34); q.fillRect(170, 116, 80, 34); fn(q); g.drawImage(c, j * 250 * 2 - j * 0, i * 150 * 2, 500, 300); };
    cell(0, 0, q => A.drawLashing(q, 80, 170, 116, 1, false)); cell(1, 0, q => A.drawLashing(q, 66, 184, 116, 1, true));
    cell(0, 1, q => { A.drawSlamMark(q, 125, 116, 52, 0.3, 1); A.drawLeapMark(q, 60, 116, 34, 0.5, 1); }); cell(1, 1, q => { A.drawTilt(q, 0, 80, 116, 1, 0.5, 1); A.drawSweepArc(q, 170, 116, 80, false, 0.5, 1); });
    cell(0, 2, q => { A.drawSweepArc(q, 125, 116, 80, true, 1, 1); A.drawAnchor(q, 60, 100, Math.PI / 2, 1.1); A.drawChain(q, 125, 80, 60, 70, 1, false); }); cell(1, 2, q => A.drawHaulSplash(q, 120, 116, 50, 0.4)); res.fx = cv.toDataURL('image/png'); }
  return res;
};
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(${page.toString()})(${JSON.stringify(which)})`, 120000);
  for (const [k, v] of Object.entries(r)) writeFileSync(join(out, k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
  console.log('wrote', Object.keys(r).join(' ')); if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 4).join(' | '));
} finally { pg.close(); }
