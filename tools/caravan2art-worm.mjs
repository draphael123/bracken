// tools/caravan2art-worm.mjs - THE DUNE WORM's art poses in the real page (claude/caravan2art): wakes him in the hollow, then FORCES the machine into each pose and takes a
// 640x360 picture. Not in the suite: pictures are for eyes. usage: node tools/caravan2art-worm.mjs [mode ...]  (SHOTS=work/claude/caravan2art/worm)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.SHOTS || 'work/claude/caravan2art/worm'); mkdirSync(out, { recursive: true });
const want = process.argv.slice(2), MODES = want.length ? want : ['surfaced', 'breathTell', 'breath', 'stunned', 'ward', 'lungeTell', 'swallow', 'ledges', 'grit'];
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js');
    const i = LEVELS.findIndex(l => l.id === 'caravan'); BK.load(i); BK.start(); BK.god = true; BK.sim(300);
    const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(30);
    for (let k = 0; k < 400 && (!BK.boss || BK.boss.mode === 'wake' || !BK.boss.st); k++) BK.sim(1);
    const shot = () => { const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); return c.toDataURL('image/png'); };
    const res = []; const b = BK.boss, W = b.st;
    for (const m of ${JSON.stringify(MODES)}) {
      W.ward = 0; BK.P.dwGrit = 0;
      const stand = (dx) => { BK.P.x = W.x - dx; BK.P.y = A.floor; BK.P.vx = 0; BK.P.vy = 0; };
      if (m === 'ledges') { W.mode = 'under'; W.t = 5; BK.sim(120); stand(60); BK.step(1); res.push([m, shot()]); continue; }
      if (m === 'grit') { W.mode = 'surfaced'; W.t = 3; BK.P.dwGrit = 1.2; stand(90); BK.step(1); res.push([m, shot()]); continue; }
      if (m === 'ward') { W.mode = 'surfaced'; W.t = 3; W.ward = 2.5; stand(70); BK.step(1); res.push([m, shot()]); continue; }
      W.mode = m; W.t = 1.0; W.breathFace = 1; W.breathK = 0.85; W.face = 1; if (m === 'stunned') W.t = 2.6; stand(110);
      b.mode = m; BK.step(1); W.mode = m; W.t = m === 'breathTell' ? 0.5 : 0.7; BK.step(1);
      res.push([m, shot()]);
    }
    return res; })()`);
  r.forEach(([name, d]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
