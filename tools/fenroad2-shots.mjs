// tools/fenroad2-shots.mjs - THE FEN ROAD 2 for eyes (claude/fenroad2; the art lane's reference): the greybox sheets of THE STILT-WALKER (SW_POSE, 15 frames) and
// THE BOG LEECH (LEECH_POSE, 6 frames) laid out x4, and stills in the level: the first peat hole with its bundle, a plank carried to the edge (the ghost plank),
// the plank laid, the yard's stilt-walker mid-step (the told foot shadow) and rearing for his stomp, a leech rearing and latched.
// -> work/claude/lane-done/fenroad2-*.png      PORT=<port> node tools/fenroad2-shots.mjs
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const SW = await import('/src/stilt-walker.js'); const BL = await import('/src/bog-leech.js'); BK.manualSimulation = true; const shots = [];
    const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }, flip = c => c, white = c => c;
    const sheet = (name, set, labels) => { const z = 4, n = set.R.length, w = set.R[0].width, h = set.R[0].height, c = document.createElement('canvas'); c.width = n * (w + 4) * z; c.height = (h + 10) * z; const g = c.getContext('2d');
      g.fillStyle = '#6a7a6a'; g.fillRect(0, 0, c.width, c.height); g.imageSmoothingEnabled = false; set.R.forEach((f, i) => { g.drawImage(f, i * (w + 4) * z, 0, w * z, h * z); g.fillStyle = '#fff'; g.font = (6 * z / 2) + 'px monospace'; g.fillText(i + ' ' + (labels[i] || ''), i * (w + 4) * z + 2, (h + 8) * z); }); shots.push([name, c.toDataURL('image/png')]); };
    sheet('stiltwalker-sheet', SW.bakeStiltWalker(canvas, flip, white), Object.entries(SW.SW_POSE).sort((a, b) => a[1] - b[1]).map(([k]) => k));
    sheet('leech-sheet', BL.bakeLeech(canvas, flip, white), Object.entries(BL.LEECH_POSE).sort((a, b) => a[1] - b[1]).map(([k]) => k));
    const load = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'fenroad')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(200); };
    const snap = (name, z = 2) => { BK.step(1); const c = document.createElement('canvas'), b = BK.buf; c.width = b.width * z; c.height = b.height * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    const at = (col, row = 17, face = 1) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; P.face = face; BK.sim(60); };
    load(); at(104); snap('hole-teach');
    at(107); BK.press('talk'); BK.sim(3); BK.P.x = 111 * 16 - 8; BK.P.face = 1; BK.sim(30); snap('plank-carry-ghost');
    BK.press('talk'); BK.sim(20); snap('plank-laid');
    at(150); const sw = () => BK.enemies().find(e => e.t === 'stiltwalker' && e.alive && Math.abs(e.x - 167 * 16) < 220);
    for (let k = 0; k < 240; k++) { BK.step(1); const e = sw(); if (e && e.st.ph === 'lift' && e.st.phT < 0.2) { snap('stilt-lift'); break; } }
    { const e = sw(); if (e) { BK.P.x = e.x + 4; BK.P.y = e.y; for (let k = 0; k < 120; k++) { BK.step(1); if (e.st.mode === 'stompTell' && e.st.t < 0.3) { snap('stilt-stompTell'); break; } } } }
    load(); at(89); const lc = () => BK.enemies().find(e => e.t === 'leech' && Math.abs(e.x - 91 * 16) < 60);
    let a = false, b = false; for (let k = 0; k < 240 && !(a && b); k++) { BK.step(1); const e = lc(); if (e && e.mode === 'rear' && !a) { snap('leech-rear'); a = true; } if (e && e.mode === 'latched' && !b) { BK.sim(5); snap('leech-latched'); b = true; } }
    return { res: shots }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'fenroad2-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots: ' + r.res.map(s => s[0]).join(' '), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
