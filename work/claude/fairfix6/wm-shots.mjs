// scratch: the three wicker men's encounters, with a fire in flight. PORT=8619 node work/claude/fairfix6/wm-shots.mjs TAG
import { openPage, ROOT } from '../../../tools/cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs'; import { join } from 'path';
const tag = process.argv[2] || 'enc', out = join(ROOT, 'work/claude/fairfix6', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const res=[];
    const fi=LEVELS.findIndex(l=>l.id==='fair');BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.start();BK.god=true;BK.sim(5);
    const wms=BK.enemies().filter(e=>e.t==='wickerman').sort((a,b)=>a.x-b.x);
    for(const [k,dx,f] of [[0,-150,1],[1,-150,1],[2,-110,1]]){const e=wms[k];BK.tp(Math.floor((e.x+dx)/16),Math.floor(e.y/16)-1);BK.P.face=f;
      for(let i=0;i<900;i++){BK.sim(1);BK.P.face=f;const b=BK.wickerMan().balls[0];if(b&&Math.abs(b.x-BK.P.x)<60)break;}BK.step(1);
      const c=document.createElement('canvas');c.width=BK.view.VW*3;c.height=BK.view.VH*3;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push(['wm'+k,c.toDataURL('image/png')]);
      e.st.mode='burn';e.st.t=3;for(let i=0;i<30;i++)BK.sim(1);BK.step(1);const c2=document.createElement('canvas');c2.width=BK.view.VW*3;c2.height=BK.view.VH*3;const g2=c2.getContext('2d');g2.imageSmoothingEnabled=false;g2.drawImage(BK.buf,0,0,c2.width,c2.height);res.push(['wm'+k+'-burn',c2.toDataURL('image/png')]);}
    return res;})()`, 300000);
  for (const [n, d] of r) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
