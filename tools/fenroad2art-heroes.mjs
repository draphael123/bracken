// tools/fenroad2art-heroes.mjs - THE NINE HEROES' PLANK POSES laid out for eyes (claude/fenroad2art): per hero, the base frames (idle, run, crouch, heavy, atk) as the baked set has them, and
// the carry / lay / throw poses the plank module composes. PORT=<port> node tools/fenroad2art-heroes.mjs [base|poses]  -> work/claude/lane-done/fenroad2art-<TAG>-heroes-<mode>.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const MODE = process.argv[2] || 'poses', TAG = process.env.TAG || 'after', out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const HEROES = ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger'];
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async () => { const HP = ${MODE === 'poses'} ? await import('/src/redraw/hero_plank_poses.js') : null; const rows = [], Z = 4;
    for (const h of ${JSON.stringify(HEROES)}) { BK.setHero(h); const K = BK.heroSet, pick = (k, i) => { const f = K.R[k]; return f ? (Array.isArray(f) ? f[i % f.length] : f) : null; };
      let list; if (!HP) list = [['idle', 0], ['run', 0], ['run', 3], ['crouch', 0], ['heavy', 0], ['heavy', 1], ['atk', 1], ['atk', 3]].map(([k, i]) => [k + i, pick(k, i)]);
      else list = [['carry0', HP.poseFrame(K, h, 'carry', 0)], ['carry1', HP.poseFrame(K, h, 'carry', 1)], ['carry2', HP.poseFrame(K, h, 'carry', 2)], ['lay0', HP.poseFrame(K, h, 'lay', 0)], ['lay1', HP.poseFrame(K, h, 'lay', 1)], ['throw0', HP.poseFrame(K, h, 'throw', 0)], ['throw1', HP.poseFrame(K, h, 'throw', 1)]];
      rows.push([h, list.filter(([, c]) => c), K]); }
    const cw = Math.max(...rows.flatMap(([, l]) => l.map(([, c]) => c.width)), 40), ch = Math.max(...rows.flatMap(([, l]) => l.map(([, c]) => c.height)), 56), n = Math.max(...rows.map(([, l]) => l.length));
    const c = document.createElement('canvas'); c.width = 90 + n * (cw * Z + 6); c.height = rows.length * (ch * Z + 6) + 6; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#7a8a6a'; g.fillRect(0, 0, c.width, c.height); g.font = 'bold 13px monospace';
    rows.forEach(([h, l, K], i) => { const y = 6 + i * (ch * Z + 6); g.fillStyle = '#14121c'; g.fillText(h, 4, y + 14); l.forEach(([lab, f], j) => { const x = 90 + j * (cw * Z + 6); g.fillStyle = '#8c9c7c'; g.fillRect(x, y, cw * Z, ch * Z); g.drawImage(f, x + (cw - f.width) * Z / 2 * 0, y, f.width * Z, f.height * Z); g.fillStyle = '#14121c'; g.font = '10px monospace'; g.fillText(lab, x + 2, y + ch * Z - 3); g.font = 'bold 13px monospace'; }); });
    return c.toDataURL('image/png'); })()`, 120000);
  writeFileSync(join(out, 'fenroad2art-' + TAG + '-heroes-' + MODE + '.png'), Buffer.from(url.split(',')[1], 'base64'));
  console.log('ok', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
