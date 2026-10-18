// tools/lamplit3-fire-shots.mjs - THE LAMPLIT STREET 3's fire verbs and the Wickling, as pictures (claude/lamplit3art): oil in all four states, the gutter and valve, floating oil, the cask
// (full, told, burst), a tar net catching and burnt, thrown fire (the told arc, in flight, lying), the Wickling's six poses. Not in the suite: god mode, a picture not a playtest.
//   usage: PORT=n node tools/lamplit3-fire-shots.mjs [out-dir] [name-filter,...]   (the dark is lifted for these: `dark` ones keep it)
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
  const lamps=()=>BK.props().filter(p=>p.t==='lantern'&&p.city);
  const want=n=>!filt||filt.split(',').some(f=>n.includes(f));
  const snap=(name,k=3)=>{if(!want(name))return;const w=BK.view.VW,h=BK.view.VH;const c=document.createElement('canvas');c.width=w*k;c.height=h*k;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,w,h,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
  const scr=(x,y)=>{const v=BK.view,z=v.z||1;return [v.VW/2+(x-v.x-v.VW/2)*z,v.VH/2+(y-v.y-v.VH/2)*z];};
  const crop=(name,wx,wy,w,h,k)=>{if(!want(name))return;const [sx,sy]=scr(wx,wy);const c=document.createElement('canvas');c.width=w*k;c.height=h*k;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,Math.round(sx-w/2),Math.round(sy-h/2),w,h,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
  start();const Ld=BK.L, d0=Ld.dark, z0=Ld.darkZones; const raw=()=>{Ld.dark=0;Ld.darkZones=[];}; const dark=()=>{Ld.dark=d0;Ld.darkZones=z0;};
  const F=()=>BK.lamplitFire(); for(const p of lamps()){p.lit=true;p.gut=0;}
  const at=(tx,ty)=>{BK.look(tx,ty);BK.sim(20);};
  const cells=(x0,x1,y)=>F().cellsRaw().filter(c=>c.x>=x0&&c.x<=x1&&c.y===y);
  const setSt=(cs,st,t)=>{for(const c of cs){c.st=st;c.t=t;}};
  raw(); BK.sim(240);
  /* THE TAR NET */
  at(72,16); frame(3); snap('f13-net-whole');
  { const H=F(); H.fireAt(75*16,18*16,40,0,0,'shot'); for(let i=0;i<4;i++){frame(12); if(i===1)snap('f14-net-catch-a'); if(i===3)snap('f15-net-catch-b');} for(let i=0;i<40;i++)frame(2); snap('f16-net-gone-ash'); frame(150); snap('f17-net-gone-bare'); }
  /* THE OIL: a puddle, catching, burning, spent (the net-1 foot), then the gutter and the wheel */
  at(70,21);
  for(const [st,t,nm] of [['oil',0,'f01-oil-puddle'],['catch',0.12,'f02-oil-catch'],['burn',5,'f03-oil-burn'],['burn',0.5,'f04-oil-burn-dying'],['spent',16,'f05-oil-spent'],['spent',1,'f06-oil-seeping']]){ setSt(cells(70,73,21),st,t); frame(3); snap(nm); }
  at(344,21);
  for(const [st,t,nm] of [['oil',0,'f07-gutter-valve'],['burn',3,'f08-gutter-fuse-burn'],['spent',10,'f09-gutter-spent']]){ setSt(cells(341,348,21),st,t); frame(3); snap(nm); }
  at(305,21); setSt(F().cellsRaw().filter(c=>c.float),'oil',0); frame(3); snap('f10-floating-slick'); setSt(F().cellsRaw().filter(c=>c.float&&c.x>=301&&c.x<=309),'burn',4); frame(3); snap('f11-floating-burn');
  /* THE CASK */
  setSt(F().cellsRaw(),'oil',0);
  at(150,21); const cs=F().cellsRaw()[0]; frame(3); snap('f12-cask-full');
  { const H=F(); const raw0=H.read(); void raw0; }
  /* THROWN FIRE */
  at(66,21); { BK.P.wick=12; BK.P.face=1; frame(3); snap('f18-told-arc'); BK.keys.up=true; frame(1); snap('f19-told-arc-high'); hold(); }
  { BK.P.wick=12; BK.P.face=1; const H=F(); H.interact(BK.P); for(let i=0;i<6;i++){frame(3);} snap('f20-thrown-flight'); for(let i=0;i<30;i++)frame(2); snap('f21-thrown-lying'); }
  /* THE WICKLING: its six poses (the enemy at 146 in the market) */
  dark(); raw();
  const w=BK.enemies().find(e=>e.t==='wickling'&&e.alive); if(w){ for(const e of BK.enemies())if(e!==w&&e.alive)e.alive=false;
    w.x-=40; BK.look(Math.round(w.x/16),Math.round(w.y/16)-2); BK.sim(3);
    const pose=(nm,mode,over)=>{const s=w.wk; if(!s)return; Object.assign(s,{mode,modeT:0.5},over||{}); w.mode=mode; for(let i=0;i<2;i++)BK.step(1); crop(nm,w.x,w.y-10,72,56,10);};
    BK.sim(20); w.wk.fed=1; BK.P.x=w.x-90;
    const keep=()=>{w.wk.cd=99;};
    pose('w01-drift','drift',{modeT:5}); pose('w02-snuff-early','snuffTell',{modeT:0.8,target:{x:w.x,y:w.y+30,lit:true}}); pose('w03-snuff-late','snuffTell',{modeT:0.15,target:{x:w.x,y:w.y+30,lit:true}});
    pose('w04-steal-windup','stealTell',{modeT:0.4,prey:{x:w.x+60,y:w.y+10}}); pose('w05-dart','dart',{modeT:0.3,vx:175,vy:0}); pose('w06-recoil','recoil',{modeT:0.6});
    pose('w07-burst-early','burstTell',{modeT:0.35}); pose('w08-burst-late','burstTell',{modeT:0.05}); pose('w09-fed3','drift',{modeT:5,fed:3});
    /* and in the dark: only its flame */
    w.wk.fed=1; w.wk.mode='drift'; w.wk.modeT=5; dark(); for(const p of lamps())p.lit=false; for(let i=0;i<3;i++)BK.step(1); crop('w10-dark-only-flame',w.x,w.y-10,160,100,6); }
  return res;})()`);
  for (const [n, d] of r) writeFileSync(join(out, n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log('wrote', r.length, 'pictures to', out);
} finally { pg.close(); }
