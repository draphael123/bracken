// tools/lamplit3-art-shots.mjs - THE LAMPLIT STREET 3's art-pass pictures (claude/lamplit3art): each section, dark and lit, the fire verbs, the Wickling.
// Not in the suite: god mode, a picture not a playtest.   usage: node tools/lamplit3-art-shots.mjs [out-dir] [name-filter,...]   (PORT from the env)
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/claude/lamplit3art'; mkdirSync(out, { recursive: true });
const filt = process.argv[3] || '';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;BK.SET.hud='minimal';const res=[];const filt=${JSON.stringify(filt)};
  const idx=LEVELS.findIndex(l=>l.id==='lamplit');
  const hold=()=>{const k=BK.keys;k.left=k.right=k.up=k.down=k.jump=k.block=k.atk=false;};
  const start=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(5);BK.reset();};
  const frame=(n=1)=>{for(let i=0;i<n;i++){hold();BK.sim(1);}BK.step(1);};
  const snap=(name,k=3)=>{if(filt&&!filt.split(',').some(f=>name.includes(f)))return;const w=BK.view.VW,h=BK.view.VH;const c=document.createElement('canvas');c.width=w*k;c.height=h*k;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,w,h,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
  const lamps=()=>BK.props().filter(p=>p.t==='lantern'&&p.city);
  const SPOTS=${JSON.stringify([
    ['a-roof-start',46,21],['b-net1',70,21],['c-market-house',97,21],['d-canal',130,21],['e-awnings',150,21],['f-loft',181,36],
    ['g-sealgate',340,36],['h-works-west',359,21],['h2-works-floor',380,21],['i-works-window',421,15],['j-wall',477,20],['k-net3',545,21],['l-arena',600,36]])};
  start();
  const Ld=BK.L, d0=Ld.dark, z0=Ld.darkZones, fg0=Ld.fog;
  const scr=(x,y)=>{const v=BK.view,z=v.z||1;return [v.VW/2+(x-v.x-v.VW/2)*z,v.VH/2+(y-v.y-v.VH/2)*z];};
  const crop=(name,wx,wy,w,h,k)=>{if(filt&&!filt.split(',').some(f=>name.includes(f)))return;const [sx,sy]=scr(wx,wy);const c=document.createElement('canvas');c.width=w*k;c.height=h*k;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,Math.round(sx-w/2),Math.round(sy-h/2),w,h,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
  for(const [nm,tx,ty] of SPOTS){
    for(const mode of ['dark','lit','raw']){ const nn=nm+'-'+mode; if(filt&&!filt.split(',').some(f=>nn.includes(f)))continue;
      Ld.dark=d0;Ld.darkZones=z0; if(mode==='raw'){Ld.dark=0;Ld.darkZones=[];Ld.fog=[];}else Ld.fog=fg0;
      BK.tp(tx,ty);BK.sim(40);for(const p of lamps()){ if(mode!=='dark'){p.lit=true;p.gut=0;} else if(Math.abs(p.x-tx*16)<400)p.lit=false; }
      frame(20);snap(nn,2);}
  }
  Ld.dark=0;Ld.darkZones=[];Ld.fog=[];
  for(const [nm,tx,ty,wx,wy,w,h,k] of [['m1-house-crop',102,14,102.5*16,12*16,110,170,5],['m2-wall-crop',481,14,481*16,13*16,90,170,5],['m3-works-east-crop',425,16,425.5*16,16*16,100,130,6],['m4-works-west-crop',362,16,363*16,16*16,90,130,6],['m5-awning-crop',150,19,150.5*16,19*16,120,70,6],['m6-balcony-crop',523,20,523.5*16,19*16,100,70,7],['m7-steps-crop',472,22,472*16,23*16,100,70,7],['m8-gantry-crop',392,16,392*16,16*16,120,80,6]]){BK.look(tx,ty);BK.sim(260);frame(6);crop(nm,wx,wy,w,h,k);}
  Ld.dark=d0;Ld.darkZones=z0;Ld.fog=fg0;
  return res;})()`);
  for (const [n, d] of r) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('wrote', r.length, 'pictures to', out);
} finally { pg.close(); }
