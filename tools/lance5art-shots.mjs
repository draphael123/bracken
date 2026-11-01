// tools/lance5art-shots.mjs - THE QUEEN'S LANCE 5 ART's pictures (claude/lance5art). Not in the suite. A picture, not a playtest: the storm, the teeth and the updraft,
// the gust, the skewer's column, the pivot, the torn pennant, tossed / buffeted. usage: node tools/lance5art-shots.mjs <before|after>  -> scratch/lane-reports/lance5art-<tag>-*.png (2x of the game's canvas)
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'after';
const out = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports'); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const res=[];
    for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.SET.hud='minimal';BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='storm'));BK.state='play';BK.god=false;BK.sim(5);
    const A=BK.L.arena,P=BK.P,fl=A.floor,row=fl/16;BK.tp(Math.round(A.trigger/16)+1,row-1);for(let i=0;i<200;i++){P.hp=P.maxHp;P.inv=9;BK.sim(1);}
    const b=BK.enemies().find(e=>e.t==='lance'&&e.alive);for(const e of BK.enemies())if(e!==b&&!e.maxHp)e.alive=false;
    const hold=()=>{for(const k of ['chargeT','volleyT','thrustT','sweepT','vaultT','wallT','skewerT'])b[k]=99;b.penT=99;};
    const safe=()=>{P.hp=P.maxHp;P.inv=9;};const run=(n,each)=>{for(let i=0;i<n;i++){if(each)each(i);BK.sim(1);if(i%2===0)BK.step(1);}};
    const snap=(name)=>{BK.step(1);const c=document.createElement('canvas');c.width=BK.view.VW*2;c.height=BK.view.VH*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,c.width,c.height);res.push([name,c.toDataURL('image/png')]);};
    const bells=BK.props().filter(p=>p.t==='lancebell'),tb=k=>bells.find(p=>p.tower===k);
    const reset=()=>{hold();b.mode='guard';b.modeT=0.3;b.guardHold=0;b.answer=null;b.lastHeavy=false;b.vx=0;b.y=fl;for(const p of bells){p.rewind=0;p.ringT=-1;}run(2,safe);};
    const hole=(i)=>{const s=A.spans[i],mid=(s[0]+s[1]+1)>>1;b.lz.cracks.push({i,x0:mid-1,x1:mid+1,t:0.01});run(4,safe);};
    const setHold=(f)=>{hold();run(1,safe);};
    /* P1: the calm bridge for the contrast */
    reset();b.x=A.x0+300;b.face=-1;P.x=b.x-70;P.y=fl;P.face=1;run(10,()=>{safe();hold();P.x=b.x-70;P.vx=0;});snap('p1-bridge');
    /* PIVOT (P1: with the pennant) */
    reset();b.x=A.x0+300;b.face=1;P.x=b.x-70;P.y=fl;P.face=1;let sn=0;run(40,i=>{safe();P.x=b.x-70;P.vx=0;hold();if(b.mode==='pivot'&&sn===0&&b.modeAge>0.05){sn=1;snap('pivot-a');} });
    /* P2 storm arrives: a hit at 68% */
    reset();b.x=A.x0+300;b.face=-1;P.x=b.x-60;P.y=fl;b.hp=Math.round(b.maxHp*0.68);BKT.hurtAs('cut',b,Math.round(b.maxHp*0.02),b.x+10,false);run(12,safe);snap('p2-arrives-a');run(25,()=>{safe();P.x=b.x-60;});snap('p2-arrives-b');
    run(90,()=>{safe();hold();P.x=b.x-60;P.vx=0;});snap('p2-bridge');
    /* the sky from further along the bridge (castle behind) */
    reset();b.x=A.spans[4][0]*16-90;b.face=1;P.x=b.x-60;P.y=fl;run(40,()=>{safe();hold();P.x=b.x-60;P.vx=0;});snap('p2-bridge-gap');
    /* GAP: teeth and updraft (the hero looks in) */
    { reset();const s=A.spans[4],hx=(s[0]+s[1]+1)*8;hole(4);b.x=hx-110;b.face=1;P.x=hx-60;P.y=fl;run(30,()=>{safe();hold();P.x=hx-60;P.vx=0;});snap('gap-teeth-updraft'); }
    /* GUST told: ring a bell */
    { reset();const pr=tb(3),si=A.spans.findIndex(([a,c])=>(a+c+1)*8>pr.gx+40),s=A.spans[si];const hx=(s[0]+s[1]+1)*8;hole(si);b.x=hx-70;b.face=1;P.x=pr.x-10;P.y=pr.y;P.vx=P.vy=0;P.face=1;P.atk=-1;BK.press('atk');let got={};
      run(260,i=>{safe();P.x=pr.x-10;P.y=pr.y;if(i===30)snap('gust-told');if(i>=36&&b.mode==='buffeted'&&!got.buf){got.buf=1;snap('buffeted');} if(b.mode==='updraft'&&!got.up&&b.y>fl+20){got.up=1;snap('updraft-him');} if(b.mode==='tossed'&&!got.tos&&b.modeAge>0.3){got.tos=1;snap('tossed');} if(got.tos&&b.mode!=='tossed')hold();}); res.push(['gust-info',JSON.stringify(got)]); }
    /* HERO lifted */
    { reset();const s=A.spans[4],hx=(s[0]+s[1]+1)*8;hole(4);b.x=A.x0+60;P.x=hx;P.y=fl-2;P.vx=P.vy=0;P.hp=P.maxHp;P.inv=0;let g1=0;run(240,i=>{hold();b.x=A.x0+60;if(P.stormLift&&P.y>fl+120&&!g1){g1=1;snap('hero-lift');}}); }
    /* SKEWER */
    { reset();b.skewerT=0;b.x=A.x0+300;b.face=1;let t1=0,t2=0;run(80,i=>{if(!t2){P.x=b.x;P.y=fl-60;P.vy=0;P.ground=false;P.inv=9;}if(b.mode==='skewerTell'&&!t1&&b.modeAge>0.3){t1=1;snap('skewer-tell');}if(b.mode==='skewer'&&!t2){t2=1;snap('skewer-strike');}});run(6,()=>{P.y=fl;safe();});snap('skewer-rec'); }
    return res;})()`, 300000);
  for (const [n, d] of r) { if (d.startsWith('data:')) writeFileSync(join(out, 'lance5art-' + tag + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); else console.log(n, d); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
