// tools/hurricane2art-shots.mjs - THE HURRICANE DECK 2's art pass in the real page (claude/hurricane2art), for eyes. Not in the suite. PORT from the environment, one page.
//   node tools/hurricane2art-shots.mjs name:x:row[:sim[:flags]] ...   flags (comma list): k = foes put down, h = HUD kept, cut=<slab>/<end> = cut that post (-1 west / 1 east) then wait=<frames> (default 70) for it to land, hp=<n> = every post of <slab>... see cut=
//   env: OUT (default work/claude/shots/hurricane2art/cur), CROP=x0,y0,w,h,k (zoom of the 320x180 frame), PRE=<js run after load>
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.OUT || 'work/claude/shots/hurricane2art/cur'); mkdirSync(out, { recursive: true });
const want = process.argv.slice(2).map(a => a.split(':'));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'hurricane'); const res = [];
    for (const [name, xs, ys, sims, flags = ''] of ${JSON.stringify(want)}) {
      BK.manualSimulation = true; BKT.setHeroLevel('knight', 40); BK.setHero('knight'); BK.reset({ fresh: false }); BK.applyUpgrades && BK.applyUpgrades();
      BK.load(i); BK.state = 'play'; BK.god = true; ${process.env.PRE || ''}
      if (!flags.split(',').includes('h')) { try { BK.SET.hud = 'minimal'; } catch (e) {} }
      BK.sim(300); BK.tp(+xs, +ys); BK.sim(40); { const sq = ${process.env.SEQ || "{}"}[name]; if (sq) (0, eval)(sq); }
      const fl = flags.split(','); if (fl.includes('k')) for (const e of BK.enemies()) if (!e.boss) e.alive = false;
      for (const f of fl) if (f.startsWith('cut=')) { const [id, end] = f.slice(4).split('/'); const pr = BK.props().find(p => p.t === 'timber' && p.slab && p.slab.id === id && p.end === +end); if (pr) BK.cutPost(pr); else console.log('no post', id, end); BK.sim(+((fl.find(q => q.startsWith('wait=')) || 'wait=70').slice(5))); }
      for (const f of fl) if (f.startsWith('dmg=')) { const [id, end, n] = f.slice(4).split('/'); const pr = BK.props().find(p => p.t === 'timber' && p.slab && p.slab.id === id && p.end === +end); if (pr) { pr.hp = pr.hp0 - (+n); pr.shake = 0.3; } }
      for (let k = 0; k < (sims === "0" ? 0 : (+sims || 60) + 60); k++) { if (BK.state === 'card') BK.cardClose(); BK.step(1); }
      { const fin = ${process.env.FIN || "{}"}[name]; if (fin) { (0, eval)(fin); BK.draw1(); } }
      const crop = ${JSON.stringify((process.env.CROP || '').split(',').map(Number))}; const c = document.createElement('canvas'); let g;
      if (crop.length === 5) { c.width = crop[2] * crop[4]; c.height = crop[3] * crop[4]; g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, crop[0], crop[1], crop[2], crop[3], 0, 0, c.width, c.height); }
      else { c.width = 640; c.height = 360; g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); }
      res.push([name, c.toDataURL('image/png'), Math.round(BK.P.x / 16), Math.round(BK.P.y / 16)]); }
    return res; })()`, 600000);
  r.forEach(([name, d, x, y]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, 'at', x, y); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
