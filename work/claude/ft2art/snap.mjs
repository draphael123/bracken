// usage: PORT=8808 node work/claude/ft2art/snap.mjs <prefix> [name,name..]   -> work/claude/ft2art/<prefix>-<name>.png (hero beside each feature)
import { openPage } from '../../../tools/cdp.mjs';
import { writeFileSync } from 'fs';
const pre = process.argv[2] || 'before', only = process.argv[3] ? process.argv[3].split(',') : null;
const SPOTS = { library: [42, 287, 'flare'], shelf: [26, 295], lab: [39, 140, 'syrup'], fizz: [19, 149], dome: [47, 193], scope: [33, 211, 'scope'], treasury: [30, 101, 'tilt'], outer: [4, 71, 'gust'], outertop: [6, 56], chunk: [9, 53, 'chunk'], arrival: [20, 298], ceiling: [28, 163] };
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const [name, [tx, ty, what]] of Object.entries(SPOTS)) { if (only && !only.includes(name)) continue;
    await pg.reload();
    const d = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.sim(10);
      BK.god=true;const P=BK.P;BK.tp(${tx},${ty});for(let i=0;i<240;i++){P.hp=P.maxHp;BK.sim(1);}
      const F=BK.L.ft2,R=F.rt;const w=${JSON.stringify(what || '')};
      if(w==='flare')for(let i=0;i<400&&!(F.flares[0].st==='burn'||F.flares[1].st==='burn');i++){P.hp=P.maxHp;BK.sim(1);}
      if(w==='gust'){for(let i=0;i<600&&R.gust.st!=='blow';i++){P.hp=P.maxHp;BK.sim(1);}}
      if(w==='tilt'){for(let i=0;i<600&&R.tilt.st!=='lean';i++){P.hp=P.maxHp;BK.sim(1);}}
      for(let i=0;i<8;i++){P.hp=P.maxHp;BK.step(1);}
      const c=document.createElement('canvas');c.width=BK.buf.width*2;c.height=BK.buf.height*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');})()`, 300000);
    writeFileSync(`work/claude/ft2art/${pre}-${name}.png`, Buffer.from(d.split(',')[1], 'base64')); console.log(name, 'ok'); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
