// tools/waspart-shots.mjs - BEFORE / AFTER FRAME SEQUENCES of the wasp, the hornet and the Hornet Queen in the real game (claude/waspart).
// TAG=before|after OUT=<dir> node tools/waspart-shots.mjs  ->  <dir>/<TAG>-<subject>-NN.png (a cropped, zoomed frame every few ticks); ffmpeg makes the GIFs.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUT || join(ROOT, 'work/claude/lane-done/waspart'); mkdirSync(out, { recursive: true });
const TAG = process.env.TAG || 'after';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const shots = [];
    const load = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(120); };
    const at = (col, row) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; BK.sim(40); };
    const snap = (name, get, W = 120, H = 76, z = 5) => { BK.step(1); const s = get(), c = document.createElement('canvas'); c.width = W * z; c.height = H * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#222'; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(BK.buf, Math.round(s.x - BK.cam[0] - W / 2), Math.round(s.y - BK.cam[1] - H / 2 - 6), W, H, 0, 0, c.width, c.height); shots.push([name, c.toDataURL('image/png')]); };
    for (const [name, skin] of [['wasp', null], ['hornet', 'hornet']]) {
      load(); const H = BK.enemies().find(e => e.alive && e.t === 'wasp' && e.cnSkin === 'hornet'); if (!H) throw new Error('no nest hornet'); const hx = Math.round(H.x / 16), hy = Math.round(H.y / 16);
      BK.P.x = H.x - 70; BK.P.y = H.y + 20; BK.P.vx = BK.P.vy = 0; BK.sim(30); BK.enemies().forEach(e => { if (e !== H && e.alive && Math.abs(e.x - H.x) < 300 && e.t !== 'boss') e.alive = false; });
      if (skin) H.cnSkin = skin; else delete H.cnSkin; H.sting = true; const E = () => H;
      for (let i = 0; i < 44; i++) { BK.sim(3); BK.P.x = H.x - 70; if (i === 30) H.flash = 0.2; snap(name + '-' + String(i).padStart(2, '0'), () => E()); }
    }
    load(); BK.tp(301, 21); BK.sim(60); BK.P.hp = BK.P.maxHp || 100; const Q = () => BK.boss; let k = 0;
    for (const m of ['hover', 'aim', 'dive', 'stuck', 'dazed', 'sweepTell', 'buzzTell', 'volleyTell', 'cloakTell']) { for (let j = 0; j < 4; j++) { const e = Q(); if (!e) break; e.mode = m; e.modeT = 9; e.x = BK.P.x + 70; e.y = BK.P.y - 50; e.vx = 0; e.vy = 0; if (m === 'cloakTell') e.cloak = 5; BK.sim(4); snap('queen-' + String(k++).padStart(2, '0'), () => Q(), 140, 100, 4); } }
    return shots; })()`, 600000);
  for (const [n, d] of r) writeFileSync(join(out, TAG + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(r.length + ' frames', 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
