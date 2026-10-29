// tools/ft3art-page-more.mjs - FALLING TOWER 3 ART page captures part 3: each pillar before/after it falls, the rolling ladder, the core and his hall. Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || join(ROOT, 'work/ft3art/page'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const CH=await import('/src/archmage-chase.js');const SU=await import('/src/tower-supports.js');BK.manualSimulation=true;const res=[];
    const snap=(name,note)=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    const run=(n)=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);};
    BK.setHero('knight');BK.reset({fresh:true});const LV=LEVELS.find(l=>l.id==='fallingtower');BK.load(LEVELS.indexOf(LV));BK.state='play';BK.god=true;BK.sim(10);
    const m=()=>BK.enemies().find(e=>e.t==='undeadmage');
    {const s=BK.L.ftSupports.find(q=>q.id==='lab-bridge');const [x0,x1,row]=s.spans[0];res.push(['info',JSON.stringify({spans:s.spans,col:s.col,row:s.row})]);
      BK.tp(x0-2,row-1);run(60);snap('lab-before','before: the poison gap');s.st='tell';s.t=SU.SUP.tell;run(110);snap('lab-falling','falling');run(90);snap('lab-down','at rest across the poison');BK.tp(x1+3,row-1);run(30);snap('lab-far','far side');}
    const R3=CH.roomOf(3);BK.tp(CH.CH.x0+8,R3.floor-1);run(30);
    BK.tp(CH.CH.x0+8,CH.CORE.bot-3);run(500);const e=m();res.push(['info',JSON.stringify({mode:e.mode,room:e.room,leg:e.leg,state:BK.state}),'']);snap('core2','core after intro');
    BK.tp(Math.round((CH.CH.x0+CH.CH.x1)/2)-6,CH.CORE.bot-2);run(150);snap('core3','core floor by the rug');BK.tp(Math.round((CH.CH.x0+CH.CH.x1)/2)+1,CH.CORE.bot-2);run(60);snap('core4','on the rug');try{BK.board();run(240);snap('hall','hall after boarding');}catch(x){res.push(['info','board fail '+x])}
    return res;})()`, 600000);
  r.forEach(([name, d, note], j) => { if (name === 'info') { console.log(d); return; } writeFileSync(join(out, 'ft3art-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, '-', note); });
} finally { pg.close(); }
