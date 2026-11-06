// tools/lesson-shots.mjs - stills of THE ROADSIDE LESSON and the inn (claude/tutorial1). node tools/lesson-shots.mjs  -> scratch/lane-reports/tutorial1-*.png (one browser, simulated frames)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports'); mkdirSync(OUT, { recursive: true });
const HERO = process.env.HERO || 'knight';
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'tutorial1-' + n + '.png'), Buffer.from(r.result.data, 'base64')); console.log('shot', n); };
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__LV=LEVELS;
    window.__go=(id,h)=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();BK.load(LEVELS.findIndex(l=>l.id===id));BK.start();BK.sim(30);};
    window.__stand=(col,face)=>{const p=BK.players()[0];p.x=col*16+8;p.y=(window.__fl||20)*16-0.01;p.vx=0;p.vy=0;p.face=face||1;p.ground=true;};})()`);
  const want = (process.argv[2] || 'tavern,lesson').split(',');
  if (want.includes('tavern')) { await E(`__go('tavern','${HERO}')`); window_fl: await E(`window.__fl=20`); await E(`__stand(55,1);BK.sim(60)`); await shot('tavern-yard'); }
  if (want.includes('lesson')) {
    await E(`__go('lesson','${HERO}');window.__fl=20`);
    for (const [n, col] of [['move', 6], ['jump', 21], ['attack', 42], ['block', 58]]) { await E(`__stand(${col},1);BK.sim(90)`); await shot('lesson-' + n); }
  }
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
