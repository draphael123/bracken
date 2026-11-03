// tools/arena-art-shots.mjs - THE ARENA SET's screenshot sheet (claude/arenayardart): each station, the crowd mid-cheer, a tile close-up, the gate props.
// node tools/arena-art-shots.mjs   -> scratch/lane-reports/arenayard/art-*.png   (one browser, simulated frames)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports', 'arenayard'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
const shot = async (n, clip) => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', Object.assign({ format: 'png' }, clip ? { clip } : {})); writeFileSync(join(OUT, 'art-' + n + '.png'), Buffer.from(r.result.data, 'base64')); console.log('shot', n); };
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__IDX=LEVELS.findIndex(l=>l.id==='arena_yard');
    window.__go=h=>{BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h);BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.god=false;BK.sim(30);};
    window.__stand=(p,col,face)=>{p.x=col*16+8;p.y=22*16-0.01;p.vx=0;p.vy=0;p.face=face||1;p.ground=true;};})()`);
  await E(`__go('knight')`);
  await E('BK.sim(200)'); const st = [['gate', 7], ['straw', 20], ['steps', 36], ['gap', 46], ['climb', 63], ['guard', 79], ['slow', 98], ['flash', 116], ['archer', 142]];
  for (const [id, col] of st) { await E(`(()=>{const p=BK.players()[0];__stand(p,${col},1);BK.sim(80);})()`); if (id === 'slow' || id === 'flash' || id === 'archer') await E(`BK.sim(100)`); await shot('station-' + id); }
  await E(`(()=>{const p=BK.players()[0];__stand(p,8,1);BK.sim(60);})()`); await shot('board-near');
  await E(`(()=>{const p=BK.players()[0];__stand(p,4,1);BK.sim(40);})()`); await shot('door-near');
  await E(`(()=>{const p=BK.players()[0];__stand(p,20,1);BK.sim(60);})()`);
  await E(`(()=>{BK.yard().Y.st.cheer=1;BK.sim(8);})()`); await shot('cheer-1');
  await E(`(()=>{BK.yard().Y.st.cheer=0.7;BK.sim(22);})()`); await shot('cheer-2');
  await E(`(()=>{BK.sim(120);})()`); await shot('calm-after');
  const vp = await pg.send('Page.getLayoutMetrics'); const w = vp.result.cssVisualViewport ? vp.result.cssVisualViewport.clientWidth : 960, h = vp.result.cssVisualViewport ? vp.result.cssVisualViewport.clientHeight : 540;
  await E(`(()=>{const p=BK.players()[0];__stand(p,30,1);BK.sim(60);})()`);
  await shot('tile-closeup', { x: 149 + 120, y: 300, width: 330, height: 230, scale: 3 });
  console.log('viewport', w, h, 'errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
