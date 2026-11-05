// tools/nestpolish-shots.mjs - NESTPOLISH proof strips (claude/nestpolish): depth at 6 spots, pots glow + THROW AT HER hint, the Queen's fall (tumble, crash, still).
//   OUT=<dir> node tools/nestpolish-shots.mjs   -> <dir>/np-depth.png, np-pots.png, np-fall.png
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.env.OUT || join(ROOT, 'work/claude/lane-done'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const res = {}; const info = {};
    const load = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(LEVELS.findIndex(l => l.id === 'hornetsnest')); BK.start && BK.start(); BK.state = 'play'; BK.god = true; BK.sim(120); };
    const copy = (z, crop) => { const b = BK.buf, w = crop ? crop[2] : b.width, h = crop ? crop[3] : b.height; const c = document.createElement('canvas'); c.width = w * z; c.height = h * z; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(b, crop ? crop[0] : 0, crop ? crop[1] : 0, w, h, 0, 0, w * z, h * z); return c; };
    const strip = (cs, cols) => { const w = cs[0].width, h = cs[0].height, rows = Math.ceil(cs.length / cols); const c = document.createElement('canvas'); c.width = w * cols; c.height = h * rows; const g = c.getContext('2d'); cs.forEach((x, i) => g.drawImage(x, (i % cols) * w, Math.floor(i / cols) * h)); return c.toDataURL('image/png'); };
    const at = (col, row) => { const P = BK.P; P.x = col * 16 + 8; P.y = (row + 1) * 16; P.vx = P.vy = 0; P.face = 1; BK.sim(50); };
    { const cs = []; for (const [c, rw] of [[4, 65], [96, 33], [172, 31], [208, 29], [336, 44], [410, 21]]) { load(); at(c, rw); BK.step(1); cs.push(copy(1)); } res.depth = strip(cs, 3); }
    { load(); BKT.setHeroLevel(8); BK.sim(700); BK.tp(401, 21); BK.sim(20); const N = BK.nestHands(), S = BK.hornetQueenHands().show(), e = BK.boss; const st = N.stands(); info.stands = st.map(s => [Math.round(s.x), Math.round(s.y), s.st]); info.arena = BK.hornetQueenHands().show().G.h;
      const s0 = st.filter(q => q.x > 6000 && q.x > BK.hornetQueenHands().show().G.h.x0 + 8).sort((a, b) => a.x - b.x)[0]; const cs = []; BK.P.x = s0.x - 60; BK.P.y = S.G.h.floor; BK.P.vx = 0; BK.P.face = 1;
      if (e) { e.mode = 'dazed'; e.modeT = 99; e.fall = 0; e.x = S.G.h.mid + 150; e.y = S.G.h.floor - 12; } BK.P.x = s0.x - 24; BK.P.y = s0.y; for (let k = 0; k < 8; k++) { BK.sim(k ? 40 : 10); BK.step(1); cs.push(copy(1)); }
      res.pots = strip(cs, 2); info.stand0 = [s0.x, s0.y, BK.P.x, BK.P.y, BK.boss && BK.boss.mode]; }
    { load(); BK.tp(401, 21); BK.sim(120); const N = BK.nestHands(), QH = BK.hornetQueenHands(), S = QH.show(), e = BK.boss; S.ward = 0; e.ward = 0; S.cloak = 0; e.cloak = 0; e.smokeCd = 0; e.fogT = 0; e.mode = 'aim'; e.modeT = 4; e.fall = 0; e.x = S.G.h.mid + 20; e.y = S.G.h.floor - 150; e.vx = 0; e.vy = 0; BK.P.x = S.G.h.x0 + 40; BK.P.y = S.G.h.floor; BK.sim(2);
      N.lob(e.x, e.y - 8, 0, 0); const cs = [], log = []; const crop = () => { const sx = Math.round(e.x - (BK.cam ? BK.cam.x : 0)); return null; };
      for (let k = 0; k < 200 && cs.length < 12; k++) { BK.sim(k < 12 ? 7 : 12); BK.step(1); cs.push(copy(2, [240, 10, 200, 230])); log.push([e.mode, +(e.fallT || 0).toFixed(2), +(e.crashT || 0).toFixed(2), Math.round(e.y)]); }
      res.fall = strip(cs, 6); info.fall = log; }
    return { res, info }; })()`, 600000);
  for (const [n, d] of Object.entries(r.res)) writeFileSync(join(out, 'np-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(JSON.stringify(r.info).slice(0, 1500), 'errors', JSON.stringify(pg.errors.slice(0, 4)));
} finally { pg.close(); }
