// tools/pyramidart-kingfight.mjs - THE COFFIN KING in his real fight (claude/pyramidart): god-mode hero, the boss's hp set per phase, a frame shot the first time each mode appears
// -> work/claude/shots/pyramidart/kingfight/<n>-<mode>.png + sheet.png. Not in the suite. PORT from env. env: SHOTS, PH=1,2,3 (default all), SIMS=frames per phase (default 5400)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/shots/pyramidart/kingfight'); mkdirSync(out, { recursive: true });
const phases = (process.env.PH || '1,2,3').split(',').map(Number), SIMS = +(process.env.SIMS || 5400);
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const res = [], seen = new Set();
    BK.load(LEVELS.findIndex(l => l.id === 'sealedpyramid')); BK.start(); BK.god = true; try { BK.SET.hud = 'minimal'; } catch (e) {} BK.sim(420);
    BK.tp(1012, 24); for (let k = 0; k < 60; k++) BK.step(1); const P = BK.P;
    for (let k = 0; k < 900; k++) { P.x = 1018 * 16; P.y = 24 * 16; P.vy = 0; BK.step(1); const b = BK.enemies().find(e => e.t === 'tombking'); if (b && b.mode !== 'sleep') break; }
    for (const ph of ${JSON.stringify(phases)}) { const b0 = BK.enemies().find(e => e.t === 'tombking'); if (!b0) { res.push(['nobossph' + ph, '']); continue; }
      b0.hp = Math.floor(b0.maxHp * (ph === 1 ? 0.95 : ph === 2 ? 0.55 : 0.25)); 
      for (let f = 0; f < ${SIMS}; f++) { BK.step(1); P.hp = P.maxHp; const b = BK.enemies().find(e => e.t === 'tombking'); if (!b) break; const key = ph + '-' + b.mode;
        if (b.hp < b.maxHp * (ph === 1 ? 0.6 : ph === 2 ? 0.31 : 0.0)) b.hp = Math.floor(b.maxHp * (ph === 1 ? 0.95 : ph === 2 ? 0.55 : 0.25));
        if (!seen.has(key) && b.mode !== 'sleep') { seen.add(key); const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); g.fillStyle = '#fff'; g.font = '12px monospace'; g.fillText(key, 6, 350); res.push([key, c.toDataURL('image/png')]); } } }
    const b1 = BK.enemies().find(e => e.t === 'tombking'); if (b1) for (const m of ['flipped', 'clamp', 'lidless', 'rollEnd', 'catch']) { b1.mode = m; b1.modeT = 2; if (m === 'flipped') b1.open = 3; BK.step(1); const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); g.fillStyle = '#fff'; g.font = '12px monospace'; g.fillText('forced-' + m, 6, 350); res.push(['forced-' + m, c.toDataURL('image/png')]); }
    return res; })()`, 900000);
  for (const [n, d] of r) if (d) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.map(x => x[0]).join(' '));
  const items = r.filter(x => x[1]);
  const d = await pg.evalp(`(async () => { const items = ${JSON.stringify(items)}; const cols = 3, rows = Math.ceil(items.length / cols), c = document.createElement('canvas'); c.width = cols * 640; c.height = rows * 360; const g = c.getContext('2d');
    for (let k = 0; k < items.length; k++) { const im = new Image(); im.src = items[k][1]; await im.decode(); g.drawImage(im, (k % cols) * 640, Math.floor(k / cols) * 360); } return c.toDataURL('image/png'); })()`);
  writeFileSync(join(out, 'sheet.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('sheet.png', items.length, 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
