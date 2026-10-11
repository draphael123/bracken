// tools/flask-shots.mjs - FLASKS 2 ART in the real page: each hero mid-drink (uncork, gulp, gulp, lower) + the spill, cropped round him and the HUD row,
// blown up.  PORT=8811 node tools/flask-shots.mjs  ->  work/claude/flasks2art/drink-live.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
const HEROES = ['knight', 'pyro', 'pirate', 'reaper', 'warden', 'paladin', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false });
try {
  const url = await pg.evalp(`(async()=>{const wi=${LEVELS.findIndex(l=>l.id==='wood')};const rows=[];
    for(const h of ${JSON.stringify(HEROES)}){BK.manualSimulation=true;BK.setHero(h);BK.reset({fresh:true});Object.assign(BKT.PROG,{flaskUp:2,flaskItems:{tonic:true,rich:true}});BK.load(wi);BK.state='play';BK.start();BK.SET.hud='minimal';BK.enemies().forEach(e=>{e.alive=false;});BK.sim(240);
      const P=BK.P;P.flasks=2;P.hp=30;P.inv=0;BK.sim(5);const shots=[];const cv=document.querySelector('canvas');
      const snap=()=>{BK.step(1);const s=cv.width/ (BK.VW||320);shots.push(cv.toDataURL());};
      BK.drinkFlask();const T=Math.round(P.drinkT*60);
      for(const k of [2,Math.round(T*0.4),Math.round(T*0.2),Math.round(T*0.1)]){while(Math.round(P.drinkT*60)>T-k&&P.drinkT>0)BK.sim(1);snap();}
      rows.push({h,shots,px:P.x,py:P.y,cx:BK.cam[0],cy:BK.cam[1]});}
    return rows;})()`);
  mkdirSync(join(ROOT, 'work', 'claude', 'flasks2art'), { recursive: true });
  writeFileSync(join(ROOT, 'work', 'claude', 'flasks2art', 'drink-live.json'), JSON.stringify(url).slice(0, 200));
  console.log('rows', url.length);
  // compose in the page
  const png = await pg.evalp(`(async()=>{const rows=${JSON.stringify(url)};const SC=4;const imgs=[];for(const r of rows){const a=[];for(const d of r.shots){const im=new Image();im.src=d;await im.decode();a.push(im);}imgs.push(a);}
    const cv=document.querySelector('canvas'),k=cv.width/320;const CW=40,CH=40;const c=document.createElement('canvas');c.width=imgs[0].length*CW*SC;c.height=rows.length*CH*SC;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#222';g.fillRect(0,0,c.width,c.height);
    rows.forEach((r,i)=>{r.shots.forEach((d,j)=>{const K3=cv.width>=960?3:k,ox=(cv.width-960)/2,oy=(cv.height-540)/2,sx=ox+(r.px-r.cx-CW/2)*K3,sy=oy+(r.py-r.cy-CH+6)*K3;g.drawImage(imgs[i][j],sx,sy,CW*K3,CH*K3,j*CW*SC,i*CH*SC,CW*SC,CH*SC);});});
    return c.toDataURL('image/png');})()`);
  writeFileSync(join(ROOT, 'work', 'claude', 'flasks2art', 'drink-live.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log('wrote work/claude/flasks2art/drink-live.png');
} finally { pg.close(); }
