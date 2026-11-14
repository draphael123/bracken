// PAGE TOOL: launches headless Chrome
// tools/kingsreskin-shots.mjs - KINGSWOOD's court guard in the real page, before (the camp goblin) and after (the livery), for eyes (claude/kingsreskin). Not in the suite. PORT from the environment, one page.
//   node tools/kingsreskin-shots.mjs   env: OUT (default work/claude/shots/kingsreskin)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.OUT || 'work/claude/shots/kingsreskin'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'kings'); const res = [];
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.state = 'play'; BK.god = true; try { BK.SET.hud = 'minimal'; } catch (e) {}
    BK.sim(60);
    const info = { skins: JSON.stringify(BK.L.reskin), foes: {} };
    for (const t of ['shield', 'pike', 'brute']) { const ents = BK.L.ents.filter(q => q.t === t); info.foes[t] = ents.map(q => [q.x, q.y]); const en = ents.find(q => q.x > 20 && q.x < 380) || ents[0]; if (!en) continue; const x0 = en.x, y0 = en.y;
      for (const mode of ['before', 'after']) { BK.reset({ fresh: true }); BK.load(i); BK.state = 'play'; BK.god = true; BK.tp(Math.round(x0) - 7, Math.round(y0)); BK.sim(40);
        const f = BK.enemies().filter(q => q.t === t && q.alive).find(q => Math.abs(q.x / 16 - x0) < 3 && Math.abs(q.y / 16 - y0) < 3); if (!f) continue;
        for (const q of BK.enemies()) if (q !== f && !q.boss) q.alive = false;
        if (mode === 'before') f.cnSkin = undefined;
        BK.tp(Math.round(x0) - 7, Math.round(y0)); for (let k = 0; k < 20; k++) BK.step(1);
        const c = document.createElement('canvas'); c.width = 870; c.height = 270; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 175, 85, 145, 45, 0, 0, 870, 270);   /* the foe, 6x, under the level banner */
        res.push([t + '-' + mode, c.toDataURL('image/png'), Math.round(f.x / 16), Math.round(f.y / 16), f.cnSkin || null]); } }
    return { res, info }; })()`, 600000);
  r.res.forEach(([name, d, x, y, sk]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, 'foe at', x, y, 'skin', sk); });
  console.log(JSON.stringify(r.info)); console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
process.exit(0);
