// tools/ft3art-page-shots.mjs - FALLING TOWER 3 ART page captures: each chase room, the core, the pillars and his poses, rendered with BK.step at 2x.
// usage: node tools/ft3art-page-shots.mjs [outdir]   (default scratch/lane-reports ft3art-*.png written by the caller). Not in the suite.
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || join(ROOT, 'work/ft3art/page'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false });
console.log('PID', pg.pid || '(n/a)');
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const CH=await import('/src/archmage-chase.js');BK.manualSimulation=true;const res=[];
    const snap=(name,note)=>{const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png'),note]);};
    const run=(n)=>{for(let i=0;i<n;i++){BK.sim(1);if(i%4===0)BK.step(1);}BK.step(1);};
    BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
    const m=()=>BK.enemies().find(e=>e.t==='undeadmage');
    const L=BK.level||{};
    res.push(['info',JSON.stringify({hasMage:!!m(),mageKeys:m()?Object.keys(m()).slice(0,40):null}),'']);
    for(let k=0;k<CH.ROOMS.length;k++){const R=CH.roomOf(k);BK.tp(R.ledges[0][0]+1,R.floor-1);run(90);snap('room'+k,R.name);
      if(R.pillar){BK.tp(R.pillar-3,R.floor-1);run(60);snap('room'+k+'-pillar','pillar near');BK.tp(R.pillar-1,R.floor-1);run(40);snap('room'+k+'-pillar-close','pillar close');}}
    BK.tp(Math.round((CH.CH.x0+CH.CH.x1)/2),CH.CORE.bot-2);run(90);snap('core','the core');
    return res;})()`, 600000);
  r.forEach(([name, d, note], j) => { if (name === 'info') { console.log(d); return; } writeFileSync(join(out, 'ft3art-' + name + '.png'), Buffer.from(d.split(',')[1], 'base64')); console.log(name, '-', note); });
} finally { pg.close(); }
