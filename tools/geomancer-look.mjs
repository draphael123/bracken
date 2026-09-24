// tools/geomancer-look.mjs — DOES SHE READ AS A GEOMANCER? One picture, from the real page: her standing frame at 5x beside the
// Pyromancer's and the Knight's (a recoloured mage would look like the middle one), then the drawn game screen cropped round her in
// the first level - standing, running, winding UPHEAVAL, and C held. `node tools/geomancer-look.mjs before|after` writes
// docs/geomancer/look-<name>.png (the rework's sprite item, docs/briefs/geomancer.md THE REWORK 2: run it before and after).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
const NAME = (process.argv[2] || 'after').replace(/[^a-z0-9-]/gi, '');
const CW = 110, CH = 64, SC = 3;
const pg = await openPage({ audio: false, fonts: false });
try {
  const S = [];
  S.push(await pg.evalp(`(()=>{const c=document.createElement('canvas'),SC=5,hs=['pyro','geomancer','knight'],fr=hs.map(h=>{BK.setHero(h);return BK.heroSet.R.idle[0];});c.width=hs.length*44*SC;c.height=Math.max(...fr.map(f=>f.height))*SC+14;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
    g.fillStyle='#3a4a3a';g.fillRect(0,0,c.width,c.height);g.font='12px monospace';
    hs.forEach((h,i)=>{const f=fr[i];g.drawImage(f,0,0,f.width,f.height,i*44*SC,c.height-f.height*SC,f.width*SC,f.height*SC);g.fillStyle='#e8e2cc';g.fillText(h.toUpperCase(),i*44*SC+6,11);});   /* (feet on one line: the frames are not all the same height) */
    return c.toDataURL();})()`));
  await pg.evalp(`(()=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BK.load(0);BK.state='play';
    BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');BK.sim(60);const P=BK.P;P.face=1;P.hp=P.maxHp;P.st=P.maxSt;
    window.__crop=(label)=>{BK.step(0);const v=BK.view,z=v.z||1,sx=v.VW/2+(P.x-v.x-v.VW/2)*z,sy=v.VH/2+(P.y-v.y-v.VH/2)*z;const c=document.createElement('canvas');c.width=${CW * SC};c.height=${CH * SC};
      const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(v.buf,Math.round(sx-${CW / 2}),Math.round(sy-${CH - 14}),${CW},${CH},0,0,${CW * SC},${CH * SC});
      g.fillStyle='rgba(0,0,0,0.6)';g.fillRect(0,0,${CW * SC},16);g.fillStyle='#fff0c0';g.font='12px monospace';g.fillText(label+' ['+P.lastKey+':'+P.lastFrame+']',4,12);return c.toDataURL();};
    window.__run=n=>{for(let i=0;i<n;i++)BK.step(1);};return 1})()`);
  S.push(await pg.evalp(`(()=>{__run(40);return __crop('STANDING')})()`));
  S.push(await pg.evalp(`(()=>{BK.keys.right=true;__run(9);const r=__crop('RUNNING');BK.keys.right=false;__run(30);return r})()`));
  S.push(await pg.evalp(`(()=>{BK.P.face=1;BK.keys.atk=true;__run(24);const r=__crop('HOLD X: WINDING');BK.keys.atk=false;__run(60);return r})()`));
  S.push(await pg.evalp(`(()=>{BK.P.st=BK.P.maxSt;BK.keys.block=true;__run(12);const r=__crop('C HELD');BK.keys.block=false;__run(10);return r})()`));
  const png = await pg.evalp(`(async()=>{const S=${JSON.stringify(S)};const ims=[];for(const s of S){const im=new Image();im.src=s;await im.decode();ims.push(im);}
    const W=Math.max(ims[0].width,2*(${CW * SC}+4)),H=ims[0].height+4+2*(${CH * SC}+4);const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#222';g.fillRect(0,0,W,H);
    g.drawImage(ims[0],0,0);ims.slice(1).forEach((im,i)=>g.drawImage(im,(i%2)*(${CW * SC}+4),ims[0].height+4+Math.floor(i/2)*(${CH * SC}+4)));return c.toDataURL();})()`);
  const out = join(ROOT, 'docs/geomancer/look-' + NAME + '.png'); writeFileSync(out, Buffer.from(png.split(',')[1], 'base64'));
  console.log('wrote ' + out + '; errors ' + JSON.stringify(pg.errors));
} finally { pg.close(); }
