// tools/paladin3-art-sheet.mjs - THE PALADIN 3 art sheet (claude/paladin3art; not in the suite): every pose key of the baked paladin set, frame by frame, at 3x on a pale
// and a dark floor, plus the thrown hammer's eight turns. usage: PORT=8942 node tools/paladin3-art-sheet.mjs <outdir> [key,key,...]
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/paladin3art', keys = (process.argv[3] || '').split(',').filter(Boolean);
mkdirSync(out, { recursive: true });
const page = async keys => {
  const C = await import('/src/chars.js'), FX = await import('/src/holy-fx.js'); const set = C.bakePaladin({}, false); const R = set.R, want = keys.length ? keys : Object.keys(R);
  const S = 3, rows = []; for (const k of want) { const v = R[k]; if (!v) continue; rows.push([k, Array.isArray(v) ? v : [v]]); }
  let maxW = 0, maxH = 0; for (const [, fr] of rows) for (const c of fr) { maxW = Math.max(maxW, c.width); maxH = Math.max(maxH, c.height); }
  const perRow = Math.max(...rows.map(r => r[1].length)), W = 90 + perRow * (maxW * S + 6), H = rows.length * (maxH * S + 6) + 8;
  const cv = document.createElement('canvas'); cv.width = Math.min(W, 6000); cv.height = H; const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  rows.forEach(([k, fr], i) => { const y = 4 + i * (maxH * S + 6); g.fillStyle = i % 2 ? '#3a4a3a' : '#c8c0a0'; g.fillRect(0, y - 2, cv.width, maxH * S + 6); g.fillStyle = i % 2 ? '#fff' : '#000'; g.font = '11px monospace'; g.fillText(k, 4, y + 14);
    fr.forEach((c, j) => g.drawImage(c, 90 + j * (maxW * S + 6), y, c.width * S, c.height * S)); });
  const hammers = FX.bakeHammer(), hc = document.createElement('canvas'); hc.width = 8 * 68; hc.height = 72; const hg = hc.getContext('2d'); hg.imageSmoothingEnabled = false; hg.fillStyle = '#444'; hg.fillRect(0, 0, hc.width, hc.height); hammers.forEach((c, j) => hg.drawImage(c, j * 68, 2, 68, 68));
  return [rows.map(r => r[0] + ':' + r[1].length + ' ' + r[1][0].width + 'x' + r[1][0].height).join('\n'), cv.toDataURL('image/png'), hc.toDataURL('image/png')];
};
const pg = await openPage({ audio: false, fonts: true });
try {
  const r = await pg.evalp(`(${page.toString()})(${JSON.stringify(keys)})`, 120000);
  console.log(r[0]); writeFileSync(join(out, 'sheet.png'), Buffer.from(r[1].split(',')[1], 'base64')); writeFileSync(join(out, 'hammer.png'), Buffer.from(r[2].split(',')[1], 'base64'));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
