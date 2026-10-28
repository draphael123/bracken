// tools/arena-polish-shots.mjs - THE ARENA POLISH PACK's pictures (claude/arenapolish). Not in the suite. One headless page: for each of the five arenas, wake the boss in the
// real game (god mode, a picture not a playtest), put the arena in each state its polish reads (moon lit / warning / dark; the hall dry / burning / flooded; phases one to three;
// a surge; the bell's glint; the brand) and save a 2x picture of the real 320 x 180 frame to work/claude/arenapolish/<out>/.
//   PORT=<free port> node tools/arena-polish-shots.mjs <outdir-name> [fields,underwell,rootway,harbor,waymeet]
// Run it in a checkout without the pack (the base worktree) and the same states draw the OLD arena (state setters that do not exist there are skipped): the before pictures.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const outName = process.argv[2] || 'after', want = (process.argv[3] || 'fields,underwell,rootway,harbor,waymeet').split(',');
const out = join(ROOT, 'work/claude/arenapolish', outName); mkdirSync(out, { recursive: true });
/* per arena: the level id, then the moments: [name, JS that sets the state (runs in the page, BK / BKT / boss b / arena A are in scope), frames to run after, where to stand (dx from arena x0 in tiles, or null)] */
const ARENAS = {
  fields: { id: 'fields', moments: [
    ['lit', 'const f = BKT.fieldsState && BKT.fieldsState(); if (f) { f.moon.ph = "lit"; f.moon.t = 9; f.moon.k = 0; }', 40, 12],
    ['warn', 'const f = BKT.fieldsState && BKT.fieldsState(); if (f) { f.moon.ph = "warn"; f.moon.t = 1.2; }', 70, 12],
    ['dark', 'const f = BKT.fieldsState && BKT.fieldsState(); if (f) { f.moon.ph = "dark"; f.moon.t = 5; }', 90, 12]] },
  underwell: { id: 'underwell', moments: [
    ['p1-dry', 'if (b) b.phase = 1;', 60, 8],
    ['p2-burning', 'if (b) { b.phase = 2; } const s = BKT.cqState && BKT.cqState(); if (s) s.scorch = 3;', 60, 8],
    ['p3-flood', 'if (b) b.phase = 3; const s = BKT.cqState && BKT.cqState(); if (s) { s.scorch = 0; s.flood = 4; }', 80, 8],
    ['lamp-wall-west', 'if (b) b.phase = 1; const s = BKT.cqState && BKT.cqState(); if (s) { s.scorch = 0; s.flood = 0; }', 60, 3]] },
  rootway: { id: 'rootway', moments: [
    ['p1-stand', 'if (b) b.phase = 1;', 40, 26],
    ['p2-perch', 'if (b) b.phase = 2;', 60, 8],
    ['p3-stand', 'if (b) b.phase = 3;', 80, 40]] },
  harbor: { id: 'harbor', moments: [
    ['p1-calm', 'if (b) { b.phase = 1; b.mode = "advance"; }', 40, 20],
    ['p1-high-tell', 'if (b) { b.phase = 1; b.mode = "highTell"; b.modeT = 3; }', 20, 20],
    ['p2-high-tide', 'if (b) { b.phase = 2; b.mode = "advance"; b.modeT = 3; }', 60, 20],
    ['gate-east', 'if (b) { b.phase = 2; b.mode = "advance"; }', 40, 38]] },
  waymeet: { id: 'waymeet', moments: [
    ['p1-bell-wall', 'if (b) { b.phase = 1; b.glint = 0; }', 30, 38],
    ['glint-ring', 'if (b) { b.glint = 1; b.glintT = 0.14; }', 12, 38],
    ['p3-brand-lamp', 'if (b) { b.phase = 3; b.mode = "brandTell"; b.modeT = 2; b.glint = 0; }', 90, 4]] },
};
const pg = await openPage();
try {
  await pg.evalp(`import('/src/level.js').then(M => { window.__LV = M.LEVELS; return true; })`);
  for (const key of want) { const A0 = ARENAS[key]; if (!A0) continue;
    const idx = await pg.evalp(`window.__LV.findIndex(l => l.id === ${JSON.stringify(A0.id)})`);
    const r = await pg.evalp(`(async () => {
      BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(${idx}); BK.start(); BK.god = true; BK.sim(10); BK.reset();
      const L = BK.L, A = L.arena, floorT = Math.round(A.floor / 16) - 1;
      BK.tp(Math.round(A.trigger / 16) + 1, floorT);
      for (let k = 0; k < 300 && !BK.bossActive; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
      if (!BK.bossActive) return { started: false };
      for (let k = 0; k < 260; k++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9; const foe = BK.boss, d = foe ? foe.x - BK.P.x : 0; BK.keys.right = d > 60; BK.keys.left = d < -60; BK.sim(1); }
      BK.keys.right = BK.keys.left = false;
      const shots = [];
      for (const [name, js, frames, dx] of ${JSON.stringify(A0.moments)}) {
        const b = BK.boss; BK.P.hp = BK.P.maxHp; BK.P.inv = 9999;
        BK.tp(Math.round(A.x0 / 16) + dx, floorT); BK.P.vx = 0;
        try { eval(js); } catch (e) { shots.push({ name, err: String(e) }); continue; }
        for (let k = 0; k < frames; k++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9999; if (BK.boss) { BK.boss.hp = BK.boss.maxHp; } ${key === 'fields' ? 'const f = BKT.fieldsState && BKT.fieldsState(); const keep = f && f.moon.ph;' : ''} BK.sim(1); }
        BK.step(1);
        const v = BK.view, c = document.createElement('canvas'); c.width = v.VW * 2; c.height = v.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(v.buf, 0, 0, v.VW, v.VH, 0, 0, v.VW * 2, v.VH * 2);
        shots.push({ name, png: c.toDataURL('image/png'), bossMode: BK.boss && BK.boss.mode, phase: BK.boss && BK.boss.phase });
      }
      return { started: true, shots, W: L.W };
    })()`);
    if (!r || !r.started) { console.log(key + ': the boss never woke'); continue; }
    for (const s of r.shots) { if (s.err) { console.log(key + '/' + s.name + ': ' + s.err); continue; } writeFileSync(join(out, key + '-' + s.name + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(key + '-' + s.name + '.png  boss ' + s.bossMode + ' phase ' + s.phase); }
  }
} finally { pg.close(); }
