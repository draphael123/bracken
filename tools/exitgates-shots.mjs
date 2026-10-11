// tools/exitgates-shots.mjs - THE EXIT GATES' pictures (claude/exitgates). Not in the suite. god mode, a picture not a playtest.
//   usage: PORT=8827 node tools/exitgates-shots.mjs [level-id,level-id,...]   -> work/claude/shots/exitgates/<level>-<state>.png  (state: closed = 8 tiles out, dark lantern; lit = 5 tiles; open = standing in it)
//   default levels: one per region. A 'zoom' crop (6x) of the gate itself goes in <level>-zoom-<state>.png.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const ids = (process.argv[2] || 'wood,burning,rootway,hanging,minecart,storm,longwater,canal,burial,caravan').split(',');
const out = join(ROOT, 'work/claude/shots/exitgates'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = []; const ids = ${JSON.stringify(ids)};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const snap = (name, z) => { const c = document.createElement('canvas'); const k = z ? 6 : 2; c.width = (z ? z[2] : BK.view.VW) * k; c.height = (z ? z[3] : BK.view.VH) * k; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; if (z) g.drawImage(BK.buf, z[0], z[1], z[2], z[3], 0, 0, c.width, c.height); else g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    const run = n => { for (let i = 0; i < n; i++) { BK.sim(1); if (i % 4 === 0) BK.step(1); } BK.step(1); };
    for (const id of ids) { const fi = LEVELS.findIndex(l => l.id === id); if (fi < 0) { res.push([id + '-missing', 'a,']); continue; }
      BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4); BK.L.gateOpen = true; if (BK.L.arena) BK.L.arena.trigger = 1e9; BK.SET.hints = false;
      const ge = BK.L.ents.find(e => e.t === 'gate'); if (!ge) { res.push([id + '-nogate', 'a,']); continue; }
      for (const [st, d] of [['closed', 8], ['lit', 5], ['open', 2]]) {
        BK.tp(ge.x - d, ge.y); run(st === 'closed' ? 30 : 60); BK.look(ge.x - (d ? d / 2 : 0), ge.y); run(8);
        BK.textLab.hint('', 0); BK.step(1); snap(id + '-' + st);
        BK.textLab.hint('', 0); BK.step(1); if (st !== 'closed') { const gx = Math.round((ge.x * 16 + 8) - BK.cam[0]), gy = Math.round(((ge.y + 1) * 16) - BK.cam[1]); { const zx = Math.max(0, Math.min(BK.view.VW - 64, gx - 32)), zy = Math.max(0, Math.min(BK.view.VH - 70, gy - 64)); snap(id + '-zoom-' + st, [zx, zy, 64, 70]); }; }
      } }
    return res; })()`, 900000);
  for (const [name, d] of r) { if (d === 'a,') { console.log(name); continue; } writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log('work/claude/shots/exitgates/' + name + '.png'); }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
