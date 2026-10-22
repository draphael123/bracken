// tools/fenroad2art-strips.mjs - IN THE REAL PAGE, for Daniel (claude/fenroad2art): the stilt-walker's walk (every distinct frame of two strides + a stomp, cropped round him at x4), the nine heroes
// CARRYING the plank, one hero LAYING it and THROWING it (frame by frame), and the leech's lurk / rear / lunge / latched.   TAG=after PORT=<port> node tools/fenroad2art-strips.mjs
// -> work/claude/lane-done/fenroad2art-<TAG>-{stilt-walk-strip,heroes-carry,hero-lay-throw,leech-strip}.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const TAG = process.env.TAG || 'after';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = [];
    const load = h => { BK.setHero(h || 'knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'fenroad')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(200); };
    const at = (col, row = 17, face = 1) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; P.face = face; BK.sim(40); };
    const crop = (x, y, w, h, z) => { BK.step(1); const v = BK.view, c = document.createElement('canvas'); c.width = w * z; c.height = h * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, Math.round(x - v.x - w / 2), Math.round(y - v.y - h + 14), w, h, 0, 0, w * z, h * z); return c; };
    const strip = (name, list, z = 4, label = null) => { if (!list.length) return; const w = list[0].width, h = list[0].height, c = document.createElement('canvas'); c.width = list.length * (w + 4); c.height = h + 14; const g = c.getContext('2d'); g.fillStyle = '#2a3a30'; g.fillRect(0, 0, c.width, c.height); list.forEach((q, i) => { g.drawImage(q, i * (w + 4), 0); if (label) { g.fillStyle = '#fff'; g.font = '11px monospace'; g.fillText(label[i] || '', i * (w + 4) + 3, h + 11); } }); shots.push([name, c.toDataURL('image/png')]); };
    /* THE STILT-WALKER: stand off at the yard, watch him for 700 steps; keep a crop on every change of his frame */
    load('knight'); at(160); { const sw = () => BK.enemies().find(e => e.t === 'stiltwalker' && e.alive && Math.abs(e.x - 167 * 16) < 260); const list = [], lab = []; let last = -1;
      for (let k = 0; k < 900 && list.length < 14; k++) { BK.step(1); const e = sw(); if (!e) continue; if (e.st.mode === 'walk' && e.st.frame !== last && (e.st.ph === 'lift' || e.st.frame === 19 || e.st.frame === 0)) { last = e.st.frame; list.push(crop(e.x, e.y, 56, 70, 4)); lab.push('f' + e.st.frame); } }
      strip('stilt-walk-strip', list, 4, lab); }
    /* NINE HEROES CARRYING */
    { const list = [], lab = []; for (const h of ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer', 'berserker', 'ranger']) { load(h); at(107); BK.press('talk'); BK.sim(4); BK.P.vx = 0; BK.sim(2); BK.keys.right = true; BK.sim(30); list.push(crop(BK.P.x, BK.P.y, 48, 44, 4)); lab.push(h); BK.keys.right = false; } strip('heroes-carry', list, 4, lab); }
    /* ONE HERO LAYING AND THROWING (the knight) */
    { load('knight'); at(107); BK.press('talk'); BK.sim(3); BK.P.x = 111 * 16 - 8; BK.P.face = 1; BK.sim(20); const list = [], lab = []; list.push(crop(BK.P.x, BK.P.y, 48, 44, 4)); lab.push('carry'); BK.press('talk'); for (const n of [2, 6, 6, 8]) { BK.sim(n); list.push(crop(BK.P.x, BK.P.y, 48, 44, 4)); lab.push('lay'); }
      at(107); BK.press('talk'); BK.sim(3); BK.P.x = 112 * 16 + 4; BK.sim(10); BK.press('atk'); for (const n of [1, 4, 5, 6, 8]) { BK.sim(n); list.push(crop(BK.P.x, BK.P.y, 48, 44, 4)); lab.push('throw'); } strip('hero-lay-throw', list, 4, lab); }
    /* THE LEECH */
    { load('knight'); at(89); const list = [], lab = []; const lc = () => BK.enemies().find(e => e.t === 'leech' && Math.abs(e.x - 91 * 16) < 70); let seen = {};
      for (let k = 0; k < 500 && list.length < 6; k++) { BK.step(1); const e = lc(); if (!e) continue; const m = e.mode; if (!seen[m] && ['lurk', 'rear', 'lunge', 'latched', 'flop'].includes(m)) { seen[m] = 1; BK.sim(m === 'lurk' ? 40 : 1); list.push(crop(e.x + 10, e.y + 8, 64, 44, 4)); lab.push(m); } }
      strip('leech-strip', list, 4, lab); }
    return { res: shots }; })()`, 900000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'fenroad2art-' + TAG + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' strips: ' + r.res.map(s => s[0]).join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
