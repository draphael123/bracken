// PAGE TOOL: launches headless Chrome
// tools/pick-shots.mjs - stills of THE HERO PICK (claude/onboard1): node tools/pick-shots.mjs [knight,pyro,...] -> scratch/lane-reports/onboard1-shots/pick-<hero>.png
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports', 'onboard1-shots'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
try {
  await E(`(()=>{BK.manualSimulation=true;BK.reset({fresh:true});})()`);
  const heroes = (process.argv[2] || 'knight,warden,pyro').split(','), order = ['knight', 'warden', 'geomancer', 'ranger', 'berserker', 'pyro', 'paladin', 'pirate', 'reaper'];
  for (const h of heroes) { await E(`BK.state='heropick';BK.ui.heroPickI=${order.indexOf(h)};BK.ui.heroPickStage='pick';for(let i=0;i<20;i++)BK.step(1)`);
    const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'pick-' + h + '.png'), Buffer.from(r.result.data, 'base64')); console.log(h); }
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
