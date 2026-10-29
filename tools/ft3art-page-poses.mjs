// tools/ft3art-page-poses.mjs - FALLING TOWER 3 ART page captures: his poses (fall, crash, rise, sink, tear, landing), the pillars' states, the core. Not in the suite.
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
    const sup=id=>(BK.L.ftSupports||[]).find(s=>s.id===id);
    res.push(['info',JSON.stringify({sups:(BK.L.ftSupports||[]).map(s=>[s.id,s.kind,s.st,s.col,s.row]),leg:m().leg,mode:m().mode,xy:[m().x,m().y]}),'']);
    const R0=CH.roomOf(0);BK.tp(CH.CH.x0+8,R0.floor-1);run(300);
    const e=m();res.push(['info',JSON.stringify({leg:e.leg,mode:e.mode,xy:[e.x,e.y],hero:[BK.P.x,BK.P.y]}),'']);
    const floorY=R0.floor*16;
    e.x=(CH.CH.x0+14)*16;e.y=floorY-110;e.mode='fall';e.vy=0;e.modeT=9;run(8);snap('pose-fall','falling, tumbling');
    for(let i=0;i<60&&e.mode==='fall';i++)run(1);run(6);snap('pose-landing','landing: ring of grit, gold halo');
    run(30);snap('pose-crash','lying open (CRASH pose)');
    e.mode='rise';e.modeT=0.5;run(10);snap('pose-rise','rising');
    e.mode='sink';e.modeT=0.9;e.y=floorY;run(15);snap('pose-sink','sinking: smoke funnel');
    const p0=sup('chase-0');if(p0){p0.armed=true;BK.tp(p0.col-3,R0.floor-1);run(40);snap('pillar-armed','floor pillar armed');p0.st='tell';p0.t=SU.SUP.tell;run(30);snap('pillar-tell','tell: crack running red');run(40);snap('pillar-tell-late','tell late');}
    BK.tp(R0.ledges[0][0]+1,R0.floor-1);run(5);
    const R1=CH.roomOf(1);BK.tp(CH.CH.x0+8,R1.floor-1);run(30);const e1=m();
    e1.room=1;e1.x=(CH.CH.x0+14)*16;e1.y=R1.floor*16;e1.mode='tear';e1.modeT=1.3;e1.tear={k:1,t:0};run(20);snap('tear-early','floor tear early');run(40);snap('tear-late','floor tear late');
    return res;})()`, 600000);
  r.forEach(([name, d, note], j) => { if (name === 'info') { console.log(d); return; } writeFileSync(join(out, 'ft3art-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, '-', note); });
} finally { pg.close(); }
