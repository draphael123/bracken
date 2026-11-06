// tools/salt-card-shots.mjs - stills of THE FIRST-DEATH CARD (claude/onboard1): node tools/salt-card-shots.mjs -> scratch/lane-reports/onboard1-shots/salt-*.png
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports', 'onboard1-shots'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, n + '.png'), Buffer.from(r.result.data, 'base64')); console.log(n); };
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__LV=LEVELS;BK.manualSimulation=true;BK.saltForce=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.god=false;BK.sim(20);
    for(let i=0;i<4;i++){const q=BK.players()[0];BK.acorns().push({x:q.x,y:q.y-7,got:false,ph:0});BK.sim(1);}BK.gainXp(40);const q=BK.P;q.inv=0;q.hurt=0;BK.dc.hit(0,null);for(let i=0;i<200&&BK.P.dead>0;i++)BK.sim(1);BK.sim(60);})()`);
  await shot('salt-card-spot');
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
