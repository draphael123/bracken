// tools/foes-sheets.mjs - the two captioned contact sheets of the six new foes (claude/foes; not in the suite), from the stills tools/foes-shots.mjs wrote.
//   One headless Chrome (tools/cdp.mjs) only draws and captions; no game is run.   usage: PORT=<free port> node tools/foes-sheets.mjs [dir]
import { openPage } from './cdp.mjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), DIR = process.argv[2] || join(ROOT, '..', 'scratch', 'foes-stills');
/* [foe id, name, attack A [mode, name, mark], attack B] */
const SETS = { 'beasts-sheet': [['snowrunner', 'SNOWRUNNER', ['snap', 'SNAP', '!'], ['leap', 'THROAT LEAP', '!!']], ['greymane', 'GREYMANE', ['bite', 'CRUSHING BITE', '!'], ['pounce', 'POUNCE', '!!']], ['bruin', 'BRUIN', ['maul', 'MAUL', '!'], ['charge', 'CHARGE', '!!']]],
  'bones-sheet': [['skelsoldier', 'SKELETON SOLDIER', ['thrust', 'THRUST', '!'], ['rush', 'SHIELD RUSH', '!!']], ['skelarcher', 'SKELETON ARCHER', ['aim', 'AIMED SHOT', '!'], ['volley', 'ARC VOLLEY', '!!']], ['skelmage', 'SKELETON MAGE', ['wisp', 'BONE WISP', '!'], ['grave', 'GRAVE ROW', '!!']]] };
const b64 = f => existsSync(join(DIR, f)) ? 'data:image/png;base64,' + readFileSync(join(DIR, f)).toString('base64') : null;
const spec = {}; for (const [sheet, rows] of Object.entries(SETS)) spec[sheet] = rows.map(([id, name, A, B]) => [[name + ' - idle', b64(id + '-idle.png')],
  [name + ' - ' + A[1] + ' TELL ' + A[2], b64(id + '-' + A[0] + 'Tell-late.png')], [name + ' - ' + A[1] + ' RELEASE', b64(id + '-' + A[0] + '-release.png')],
  [name + ' - ' + B[1] + ' TELL ' + B[2], b64(id + '-' + B[0] + 'Tell-late.png')], [name + ' - ' + B[1] + ' RELEASE', b64(id + '-' + B[0] + '-release.png')]]);
const pg = await openPage({ audio: false, fonts: false });
try {
  const res = await pg.evalp(`(async()=>{ const spec = ${JSON.stringify(spec)}, out = {}, W = 480, H = 270, CAP = 24;
    const load = s => new Promise(r => { if (!s) return r(null); const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = s; });
    for (const [name, rows] of Object.entries(spec)) { const c = document.createElement('canvas'); c.width = W * 5; c.height = (H + CAP) * rows.length; const g = c.getContext('2d'); g.fillStyle = '#101018'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false;
      for (let r = 0; r < rows.length; r++) for (let k = 0; k < 5; k++) { const [cap, src] = rows[r][k], img = await load(src), x = k * W, y = r * (H + CAP);
        if (img) g.drawImage(img, x, y + CAP, W, H); else { g.fillStyle = '#400'; g.fillRect(x, y + CAP, W, H); g.fillStyle = '#fff'; g.font = '16px monospace'; g.fillText('MISSING', x + 190, y + CAP + 140); }
        g.fillStyle = '#e8e0c8'; g.font = 'bold 14px monospace'; g.fillText(cap, x + 6, y + 16); g.strokeStyle = '#101018'; g.lineWidth = 2; g.strokeRect(x, y, W, H + CAP); }
      out[name] = c.toDataURL('image/png'); }
    return out; })()`, 120000);
  for (const [n, d] of Object.entries(res)) { writeFileSync(join(DIR, n + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('wrote ' + join(DIR, n + '.png')); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
