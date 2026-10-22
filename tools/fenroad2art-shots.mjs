// tools/fenroad2art-shots.mjs - THE FEN ROAD 2 ART PASS for eyes (claude/fenroad2art): the level at fixed columns, the plank beats, the stilt-walker mid-step, the leech.
// TAG=before|after PORT=<port> node tools/fenroad2art-shots.mjs [col ...]  ->  work/claude/lane-done/fenroad2art-<TAG>-*.png   (ONLY=a,b limits the named shots)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const TAG = process.env.TAG || 'after', ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const cols = process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number);
const COLS = cols.length ? cols : [4, 45, 92, 113, 160, 232, 280, 330, 375, 402];
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = []; const ONLY = ${JSON.stringify(ONLY)};
    const want = n => !ONLY || ONLY.includes(n);
    const load = () => { BK.setHero(${JSON.stringify(process.env.HERO || 'knight')}); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'fenroad')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(200); };
    const snap = (name, z = 2) => { if (!want(name)) return; BK.step(1); const c = document.createElement('canvas'), b = BK.buf; c.width = b.width * z; c.height = b.height * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    const at = (col, row = 17, face = 1) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; P.face = face; BK.sim(60); };
    load(); for (const c of ${JSON.stringify(COLS)}) { at(c); snap('col' + c); }
    load(); at(104); snap('hole-teach');
    at(107); BK.press('talk'); BK.sim(3); BK.P.x = 111 * 16 - 8; BK.P.face = 1; BK.sim(30); snap('plank-carry-ghost'); snap('hero-carry', 4);
    BK.press('talk'); BK.sim(20); snap('plank-laid');
    load(); at(150); const sw = () => BK.enemies().find(e => e.t === 'stiltwalker' && e.alive && Math.abs(e.x - 167 * 16) < 220);
    for (let k = 0; k < 400; k++) { BK.step(1); const e = sw(); if (e && e.st.ph === 'lift' && e.st.phT < 0.2) { snap('stilt-lift'); break; } }
    load(); at(89); const lc = () => BK.enemies().find(e => e.t === 'leech' && Math.abs(e.x - 91 * 16) < 60);
    let a = false, b = false; for (let k = 0; k < 240 && !(a && b); k++) { BK.step(1); const e = lc(); if (e && e.mode === 'rear' && !a) { snap('leech-rear'); a = true; } if (e && e.mode === 'latched' && !b) { BK.sim(5); snap('leech-latched'); b = true; } }
    return { res: shots }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'fenroad2art-' + TAG + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots: ' + r.res.map(s => s[0]).join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
