// tools/barriers-shots.mjs - THE BARRIERS' pictures (claude/barriers). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8834 node tools/barriers-shots.mjs [level-id,...]   -> work/claude/shots/barriers/<level>-gate-closed|open.png, <level>-seal-closed|open.png (4x crops + a whole-screen shot of the seal)
//   gate: the level's mini-boss gate (closed, then the mini is cut down and it lifts); else the first static portcullis column (closed only). seal: the arena's left wall rising as the boss wakes, then the boss falls.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const ids = (process.argv[2] || 'wood,marsh,kings,hanging,oreroad,storm,harbor,waymeet,burial,welltown').split(',');
const out = join(ROOT, 'work/claude/shots/barriers'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS, T } = await import('/src/level.js'); const res = []; const ids = ${JSON.stringify(ids)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const snap = (name, z, k) => { const c = document.createElement('canvas'); c.width = (z ? z[2] : BK.view.VW) * k; c.height = (z ? z[3] : BK.view.VH) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (z) g.drawImage(BK.buf, z[0], z[1], z[2], z[3], 0, 0, c.width, c.height); else g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    const crop = (col, rowTop, rows, name) => { const gx = Math.round(col * 16 + 8 - BK.cam[0]), gy = Math.round((rowTop + rows / 2) * 16 - BK.cam[1]); const W = 112, H = 144; const x = Math.max(0, Math.min(BK.view.VW - W, gx - W / 2)), y = Math.max(40, Math.min(BK.view.VH - H, gy - H / 2)); snap(name, [x, y, W, H], 4); snap(name + '-screen', null, 2); };
    const kill = (e) => { for (let n = 0; n < 1000 && e.alive; n++) { BK.P.inv = 99; BK.P.hp = BK.P.maxHp; e.hp = Math.min(e.hp, 1); e.inv = 0; BKT.hurtEnemy(e, 1, e.x - 10, false); BK.sim(1); } run(30); };
    for (const id of ids) { const fi = LEVELS.findIndex(l => l.id === id); if (fi < 0) { res.push([id + '-missing', 'a,']); continue; }
      BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.god = true; BK.sim(300); BK.SET.hints = false; const L = BK.L;
      // ---- the gate ----
      let col = L.mini && L.mini.gate !== undefined ? L.mini.gate : -1, mini = col >= 0;
      if (col < 0) for (let x = 0; x < L.W && col < 0; x++) for (let y = 0; y < L.H; y++) if (L.grid[y * L.W + x] === T.PORT) { col = x; break; }
      if (col >= 0) { let top = -1, bot = -1; for (let y = 0; y < L.H; y++) if (L.grid[y * L.W + col] === T.PORT) { if (top < 0) top = y; bot = y; }
        if (top >= 0) { const sw = BK.SET.hints; BK.tp(col - 5, bot); run(20); BK.look(col, (top + bot) / 2); run(12); crop(col, top, Math.min(8, bot - top + 1), id + '-gate-closed');
          if (mini) { const A = L.mini, e = BK.enemies().find(q => q.t === A.boss && q.alive); if (e) { BK.tp(Math.round(A.trigger / 16) + (A.reverse ? -1 : 1), Math.round(A.floor / 16) - 1); BK.sim(200); kill(e); BK.look(col, (top + bot) / 2); run(60); crop(col, top, Math.min(8, bot - top + 1), id + '-gate-open'); } } } }
      // ---- the boss seal ----
      BK.reset({ fresh: true }); BK.load(fi); BK.start(); BK.god = true; BK.sim(300); const A = BK.L.arena;
      if (A) { const e = BK.enemies().find(q => q.t === A.boss && q.alive && !q.mini); if (e) { for (const q of BK.enemies()) if (q !== e && !q.maxHp) q.alive = false;
        if (A.carpet) { res.push([id + '-seal-skipped-carpet', 'a,']); continue; }
        BK.tp(Math.round(A.trigger / 16) + (A.reverse ? -1 : 1), Math.round(A.floor / 16) - 1); BK.sim(200); BK.P.inv = 99; run(30);
        const wl = A.wallL, top = A.floor / 16 - 6; BK.look(wl + 4, A.floor / 16 - 4); run(8); BK.P.inv = 99; snap(id + '-seal-screen', null, 2); crop(wl, top, 6, id + '-seal-closed');
        kill(e); BK.sim(120); BK.look(wl + 4, A.floor / 16 - 4); run(20); crop(wl, top, 6, id + '-seal-open'); } } }
    return res; })()`, 1800000);
  for (const [name, d] of r) { if (d === 'a,') { console.log(name); continue; } writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/barriers/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
