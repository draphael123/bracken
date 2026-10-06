// scratch: dump the fair foes' sheets (all frames, 4x) and three start shots. usage: PORT=8619 node work/claude/fairfix6/sheet.mjs TAG
import { openPage, ROOT } from '../../../tools/cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'before', out = join(ROOT, 'work/claude/fairfix6', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const res=[];
    const names=${JSON.stringify((process.env.NAMES||'strongman,brute,shy,juggler,harvestMummer,hobbyhorse,barker,stringjack,scarecrowM,wickerman').split(','))};const SC=${+(process.env.SC||3)};
    const c=document.createElement('canvas');c.width=1400;c.height=names.length*62*SC;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#556';g.fillRect(0,0,c.width,c.height);
    names.forEach((n,i)=>{const s=BK.SPR[n];g.fillStyle='#fff';g.font='10px monospace';g.fillText(n,2,i*62*SC+10);if(!s)return;let x=70;for(const f of s.R){g.drawImage(f,x,i*62*SC+12,f.width*SC,f.height*SC);x+=f.width*SC+6;}});
    res.push(['sheets',c.toDataURL('image/png')]);
    if(${!!process.env.SHOTS}){const fi=LEVELS.findIndex(l=>l.id==='fair');BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(10);
    for(const [name,x,y,f] of ${process.env.SHOTS||'[]'}){BK.tp(x,y);BK.P.face=f;for(let i=0;i<40;i++){BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);
      const k=document.createElement('canvas');k.width=BK.view.VW*3;k.height=BK.view.VH*3;const q=k.getContext('2d');q.imageSmoothingEnabled=false;q.drawImage(BK.buf,0,0,k.width,k.height);res.push([name,k.toDataURL('image/png')]);}}
    return res;})()`, 300000);
  r.forEach(([name, d]) => { writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name); });
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
