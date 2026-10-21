// tools/fenroad-shots.mjs - THE FEN ROAD in the real page, for eyes (claude/fenroad): the whole frame at a list of columns (the hero stood there, god mode),
// a bowed section mid-bow and sunk, a stilt-walker's jab windup, toppled, and his horn, and THE BOG TROLL in his poses at the crossing.
// -> work/claude/lane-done/fenroad-*.png      PORT=<port> node tools/fenroad-shots.mjs [col ...]
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const cols = process.argv.slice(2).filter(a => /^\d+$/.test(a)).map(Number);
const COLS = cols.length ? cols : [4, 20, 45, 60, 79, 92, 113, 136, 160, 192, 230, 248, 280, 330, 375, 402];
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = [];
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'fenroad')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(400);
    const snap = (name, z = 2) => { BK.step(1); const c = document.createElement('canvas'), b = BK.buf; c.width = b.width * z; c.height = b.height * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    const at = (col, row = 17) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; BK.sim(20); };
    for (const c of ${JSON.stringify(COLS)}) { at(c); snap('col' + c); }
    /* a bowed section: stand on sag 'a' mid-bow, then sunk */
    at(20); BK.sim(30); snap('sag-bow'); BK.sim(60); snap('sag-sunk');
    /* the stilt-walker at the yard: his jab windup and the topple */
    const sw = () => BK.enemies().find(e => e.t === 'stiltwalker' && e.alive && Math.abs(e.x - 167 * 16) < 200);
    at(162); for (let k = 0; k < 120; k++) { BK.step(1); const e = sw(); if (e && e.st.mode === 'jabTell') { snap('stilt-jabtell'); break; } }
    { const e = sw(); if (e) { BK.P.x = e.x - 20; BK.keys.down = true; BK.sim(4); BK.press && BK.press('atk'); BK.sim(8); BK.keys.down = false; BK.sim(6); snap('stilt-topple'); BK.sim(30); snap('stilt-down'); } }
    /* the horn lookout at 79 winding his horn */
    BK.load(LEVELS.findIndex(l => l.id === 'fenroad')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; at(70); for (let k = 0; k < 90; k++) { BK.step(1); } snap('stilt-horn');
    /* THE BOG TROLL: walk into the crossing, wake him, and hold each pose a frame (the art lane's reference: src/bog-troll-hands.js POSE) */
    BK.load(LEVELS.findIndex(l => l.id === 'fenroad')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(400);
    at(414); for (let k = 0; k < 600 && !BK.bossActive; k++) { BK.keys.right = true; BK.step(1); } BK.keys.right = false; BK.sim(150);
    const b = BK.boss; if (b && b.t === 'bogtroll') { BK.P.x = b.x - 70; BK.P.y = 18 * 16;
      for (const m of ['up', 'dragTell', 'drag', 'hurlTell', 'hurl', 'stuck', 'heave', 'ripTell', 'rip', 'sink']) { b.mode = m; b.modeT = 5; b.y = 18 * 16 + 26 + (m === 'sink' ? 20 : 0); if (m === 'stuck') { b.openT0 = 5; } snap('troll-' + m); }
      b.mode = 'burstTell'; b.modeT = 0.3; b.locked = true; b.lockX = BK.P.x; snap('troll-bulge'); }
    return { res: shots }; })()`, 600000);
  for (const [n, d] of r.res) writeFileSync(join(out, 'fenroad-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.res.length + ' shots', 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
