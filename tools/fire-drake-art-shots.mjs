// tools/fire-drake-art-shots.mjs - THE FIRE DRAKE in the caldera (claude/drakeart): one browser, simulated frames; forces each told move's pose and shoots it.
// node tools/fire-drake-art-shots.mjs  -> scratch/lane-reports/drakeart-*.png
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'drakeart-' + n + '.png'), Buffer.from(r.result.data, 'base64')); };
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__IDX=LEVELS.findIndex(l=>l.id==='drakelab');BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.god=true;BK.sim(30);})()`);
  await E(`(()=>{const p=BK.players()[0];p.x=19*16;p.y=17*16+15.99;p.vx=0;p.vy=0;p.ground=true;p.face=1;BK.sim(40);})()`); await shot('caldera-sleep');
  await E(`(()=>{const p=BK.players()[0];p.x=25*16;BK.sim(150);})()`); await shot('wake');
  for (const m of (process.env.MODES || 'walk clawTell claw tailTell tail breathTell breath lungeTell jerked tearTell hover slamTell').split(' ')) {
    const ok = await E(`(()=>{const b=BK.enemies().find(e=>e.t==='firedrake');if(!b)return 'noboss';b.mode='${m}';b.modeT=9;b.lockX=b.x+60;b.air=${/hover|dive/.test(m) ? 50 : 0};BK.draw1();return 'ok';})()`);
    if (ok !== 'ok') { console.log(m, ok); continue; } await shot(m);
  }
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
