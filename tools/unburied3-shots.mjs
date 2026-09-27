/* tools/unburied3-shots.mjs <set> - THE UNBURIED FIELD, lane claude/unburied3 (docs/briefs/unburied-deathknight.md), PHOTOGRAPHED IN
   THE REAL PAGE: the page's own 320x180 buffer after BK.step frames (BK.step renders; BK.sim does not), saved at 2x under
   work/unburied3/. Not in the suite: it is a camera.
     bridges  THE BROKEN BRIDGES: the bridgehead, a whistle's shadows on a deck, the arrows standing in the planks, the stream bed, the far bank
     arch     the chapel's fallen arch, and the crypt stair without its peg wall
     knight   THE DEATH KNIGHT: his sheet (every frame, both ways) and each move caught mid-tell in the chapel, and the blade stuck
   The hero is in god mode and foes other than the one photographed are put down, so the picture is the thing and not a death. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const [set = 'bridges'] = process.argv.slice(2);
const out = join(ROOT, 'work/unburied3'); mkdirSync(out, { recursive: true });
const pg = await openPage();
const save = (name, png) => { const f = join(out, name + '.png'); writeFileSync(f, Buffer.from(png.split(',')[1], 'base64')); console.log('work/unburied3/' + name + '.png'); };
const PRE = `const LV=(await import('/src/level.js')).LEVELS;const UB=await import('/src/unburied-foes.js');
  const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
  const steps=n=>{for(let k=0;k<n;k++)BK.step(1);};
  const load=h=>{BK.setHero(h||'knight');BK.reset({fresh:true});BK.load(LV.findIndex(l=>l.id==='unburied'));BK.start();BK.god=true;BK.sim(900);};
  const sheet=(set,bg,cols,k)=>{const W=Math.max(...set.R.map(c=>c.width)),H=set.R[0].height,n=set.R.length,rows=Math.ceil(n/cols)*2,c=document.createElement('canvas');c.width=cols*(W*k+8);c.height=rows*(H*k+8);
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);
    for(let i=0;i<n;i++)for(const [s,off] of [['R',0],['L',Math.ceil(n/cols)]]){const x=(i%cols)*(W*k+8),y=(Math.floor(i/cols)+off)*(H*k+8);g.drawImage(set[s][i],x,y,set[s][i].width*k,H*k);g.fillStyle='#1b1626';g.font='10px monospace';g.fillText(String(i),x+2,y+10);}
    return c.toDataURL('image/png');};`;
try {
  if (set === 'bridges') {
    const r = await pg.evalp(`(async()=>{${PRE}
      const shots={};load('knight');for(const e of BK.enemies())if(!e.maxHp&&e.enc!=='THE FAR BANK')e.alive=false;
      BK.tp(267,35);steps(90);shots['bridges-head']=snap();
      const F=BK.unbField(),bv=F.bv;BK.tp(282,35);steps(30);BK.P.x=283*16+12;bv.marks=[];bv.t=bv.period-bv.whistle-0.01;steps(40);shots['bridges-shadows']=snap();
      steps(Math.round(60*bv.whistle));shots['bridges-arrows']=snap();
      BK.tp(290,44);steps(60);shots['bridges-bed']=snap();
      BK.tp(312,35);steps(60);shots['bridges-far-bank']=snap();
      return shots;})()`, 300000);
    for (const [k, v] of Object.entries(r)) save(k, v);
  } else if (set === 'arch') {
    const r = await pg.evalp(`(async()=>{${PRE}
      const shots={};load('knight');for(const e of BK.enemies())if(!e.maxHp)e.alive=false;BK.tp(404,35);steps(90);shots['chapel-arch']=snap();BK.tp(420,35);steps(90);shots['crypt-stair']=snap();return shots;})()`, 300000);
    for (const [k, v] of Object.entries(r)) save(k, v);
  } else if (set === 'knight') {
    const r = await pg.evalp(`(async()=>{${PRE}
      const shots={};shots['knight-sheet']=sheet(BK.SPR.bloodknight,'#b8b0a0',6,2);
      load('knight');const A0=BK.L.arena;BK.tp(Math.round(A0.trigger/16)+2,Math.round(A0.floor/16)-1);steps(200);
      const b=BK.enemies().find(e=>e.t==='bloodknight');const kill=()=>{for(const e of BK.enemies())if(e!==b)e.alive=false;};kill();
      const A={x0:A0.x0,x1:A0.x1,floor:A0.floor},c={P:BK.P,A,say:()=>{},sound:()=>{}};
      const moves=[['cleave-tell','cleave',30,-50],['cleave-committed','cleave',56,-50],['blade-tell','blade',40,-90],['blade-bolts','blade',Math.round(60*0.95)+22,-90],['ward','ward',50,-60],['rush-tell','rush',30,-110],['raise','raise',40,-80]];
      for(const [name,what,n,dx,phase] of moves){kill();b.cd=99;b.mode='stalk';b.phase=phase||1;b.x=(A.x0+A.x1)/2;BK.P.x=b.x+dx;BK.P.y=A.floor;UB.bkForce(b,what,c);b.cd=99;steps(n);shots['knight-'+name]=snap();b.mode='stalk';b.modeT=0;b.bolts=[];}
      kill();b.mode='stalk';b.x=(A.x0+A.x1)/2;BK.P.x=b.x-40;UB.bkForce(b,'cleave',c);b.cd=99;for(let i=0;i<120&&b.mode!=='stuck';i++){if(b.committed)BK.P.x=b.x-130;steps(1);}steps(20);shots['knight-stuck']=snap();
      kill();b.mode='stalk';b.cd=99;b.phase=1;b.hp=Math.round(b.maxHp*0.45);BK.P.x=b.x-60;b.cd=0;steps(40);shots['knight-surge']=snap();
      return shots;})()`, 300000);
    for (const [k, v] of Object.entries(r)) save(k, v);
  }
  if (pg.errors.length) console.log('page errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
