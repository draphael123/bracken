// tools/hurricane3art-shots.mjs - THE HURRICANE 3 after-shots, each set up in its state (lane helper). PORT from the env; OUT dir (default work/claude/shots/hurricane3art/after)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = join(ROOT, process.env.OUT || 'work/claude/shots/hurricane3art/after'); mkdirSync(out, { recursive: true });
const SC = {
  forecastle: `BK.tp(30,33);run(60);`,
  forehatch: `BK.tp(52,35);for(let i=0;i<60*20&&!(BK.h3().heel().on&&BK.h3().heel().k>0.8);i++)BK.sim(1);run(10);`,
  lashing: `BK.tp(68,35);run(30);`,
  waistLow: `BK.tp(128,43);for(let i=0;i<60*25&&BK.h3read().floods[0].ph!=='low';i++)BK.sim(1);run(20);`,
  waistHigh: `BK.tp(140,35);for(let i=0;i<60*25&&BK.h3read().floods[0].ph!=='high';i++)BK.sim(1);run(20);`,
  galleyRoof: `BK.tp(158,32);run(40);`,
  foremast: `BK.tp(170,35);for(let i=0;i<60*6&&BK.L.felled[0].state!=='down';i++)BK.sim(1);BK.tp(186,34);run(30);`,
  rod1: `BK.tp(292,35);run(20);BK.P.face=1;BK.press('atk');run(5);BK.tp(284,35);for(let i=0;i<60*12&&BK.h3read().rods[0].charge<0.85;i++)BK.sim(1);run(5);`,
  gundeck: `BK.tp(300,41);run(60);`,
  eye: `BK.tp(360,35);run(60);`,
  skylight: `BK.tp(416,35);run(60);`,
  mizzenTop: `BK.tp(462,29);run(60);`,
  stays: `BK.L.felled[1].state='down';BK.tp(436,23);run(90);`,
  topmastRun: `BK.tp(380,22);run(20);`,
  mainYard: `BK.tp(322,28);run(40);`,
  arena: `BK.tp(298,18);run(240);`,
};
const want = (process.argv[2] || Object.keys(SC).join(',')).split(',');
const pg = await openPage({ audio: false, fonts: false, seed: 11 });
try {
  const r = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const LI = LEVELS.findIndex(l => l.id === 'hurricane'); const res = [];
    const run = n => { for (let k = 0; k < n; k++) { if (BK.state === 'card') BK.cardClose(); BK.step(1); } };
    for (const name of ${JSON.stringify(want)}) { const code = ${JSON.stringify(SC)}[name]; if (!code) continue;
      BK.manualSimulation = true; BK.setHero('knight'); BK.load(LI); BK.state = 'play'; BK.start(); BK.god = true; BK.reset(); BK.sim(30); try { BK.SET.hud = 'minimal'; } catch (e) {}
      try { (0, eval)('(function(run){' + code + '})')(run); run(${+(process.env.WAIT || 0)}); } catch (err) { res.push([name, null, String(err)]); continue; }
      const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360);
      res.push([name, c.toDataURL('image/png'), Math.round(BK.P.x / 16) + ',' + Math.round(BK.P.y / 16)]); }
    return res; })()`, 900000);
  for (const [name, d, info] of r) { if (d) writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, info); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
