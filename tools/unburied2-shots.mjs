/* tools/unburied2-shots.mjs <set> [tag] - THE UNBURIED FIELD REWORK (docs/briefs/unburied-rework.md), PHOTOGRAPHED IN THE REAL PAGE.
   Node renders lie about light (docs/AGENT-HANDOFF.md), so every picture is the page's own 320x180 buffer after BK.step frames
   (BK.step renders; BK.sim does not), saved at 2x under docs/unburied2/. Not in the suite: it is a camera.
     rider   THE BARROW RIDER: his sheet (every frame, both ways) and each of his moves caught mid-tell in his own room
     knight  THE FIRST DEATH KNIGHT: his sheet and each of his moves caught mid-tell in the chapel
     field   the field's scenery spots (the look pass), for a before/after pair: run it with tag 'before', then 'after'
     crypt   THE SEALED CRYPT and the crypt stair in the nave
   Foes other than the one photographed are put down, and the hero is in god mode, so the picture is the fight and not a death. */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const [set = 'rider', tag = 'shot'] = process.argv.slice(2);
const out = join(ROOT, 'docs/unburied2'); mkdirSync(out, { recursive: true });
const pg = await openPage();
const save = (name, png) => { const f = join(out, name + '.png'); writeFileSync(f, Buffer.from(png.split(',')[1], 'base64')); console.log('docs/unburied2/' + name + '.png'); };
/* in the page: load the level, walk into a room, and a camera that takes the buffer at 2x */
const PRE = `const LV=(await import('/src/level.js')).LEVELS;const UB=await import('/src/unburied-foes.js');
  const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
  const steps=n=>{for(let k=0;k<n;k++)BK.step(1);};
  const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LV.findIndex(l=>l.id==='unburied'));BK.start();BK.god=true;BK.sim(900);};
  const sheet=(set,bg,cols)=>{const W=set.R[0].width,H=set.R[0].height,n=set.R.length,rows=Math.ceil(n/cols)*2,c=document.createElement('canvas');c.width=cols*(W+4)*2;c.height=rows*(H+4)*2;
    const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);
    for(let i=0;i<n;i++)for(const [s,off] of [['R',0],['L',Math.ceil(n/cols)]]){const x=(i%cols)*(W+4)*2,y=(Math.floor(i/cols)+off)*(H+4)*2;g.drawImage(set[s][i],x,y,W*2,H*2);g.fillStyle='#1b1626';g.font='10px monospace';g.fillText(String(i),x+2,y+10);}
    return c.toDataURL('image/png');};`;
try {
  if (set === 'rider') {
    const r = await pg.evalp(`(async()=>{${PRE}
      const shots={};shots.sheet=sheet(UB.bakeBarrowRider(),'#c9b89a',8);
      load();const M=BK.L.mini;BK.tp(Math.round(M.trigger/16)+2,Math.round(M.floor/16)-1);steps(150);
      const w=BK.enemies().find(e=>e.t==='barrowrider');for(const e of BK.enemies())if(e!==w&&!e.boss)e.alive=false;
      const A={x0:M.x0,x1:M.x1,floor:M.floor},c={P:BK.P,A,say:()=>{},sound:()=>{}};
      const pose=(name,what,n,prep)=>{w.cd=99;w.mode='stalk';if(prep)prep();BK.P.x=w.x-70;BK.P.y=A.floor;UB.brForce(w,what,c);w.cd=99;steps(n);shots[name]=snap();w.mode='stalk';w.modeT=0;w.cd=99;w.bolts=[];w.lances=[];};
      pose('ride-tell','ride',20,()=>{w.mounted=true;w.x=A.x1-50;});
      pose('ride-gallop','ride',Math.round(60*1.0)+18,()=>{w.mounted=true;w.x=A.x1-50;});
      pose('trample-tell','trample',30,()=>{w.mounted=true;w.x=(A.x0+A.x1)/2;});
      pose('grave-fire','fire',60,()=>{w.mounted=true;w.x=(A.x0+A.x1)/2+40;});
      pose('lance-tell','lance',30,()=>{w.mounted=true;w.x=A.x1-40;});
      pose('lance-line','lance',Math.round(60*1.05),()=>{w.mounted=true;w.x=A.x1-40;});
      w.hp=Math.round(w.maxHp*0.45);w.phase=1;w.mode='stalk';w.cd=0;steps(20);shots['horse-falls']=snap();steps(70);
      pose('foot-thrust','thrust',24,()=>{w.mounted=false;w.phase=2;w.x=(A.x0+A.x1)/2;});
      w.mounted=false;w.phase=2;w.footLeft=0;w.cd=0;w.mode='stalk';w.bonesX=A.x0+40;BK.P.x=w.x+80;steps(60);shots['remount-bones']=snap();
      return shots;})()`, 300000);
    for (const [k, v] of Object.entries(r)) save('rider-' + k, v);
  } else if (set === 'knight') {
    const r = await pg.evalp(`(async()=>{${PRE}
      const shots={};shots.sheet=sheet(UB.bakeDeathKnight(),'#b8b0a0',8);
      load();const A0=BK.L.arena;BK.tp(Math.round(A0.trigger/16)+2,Math.round(A0.floor/16)-1);steps(200);
      const b=BK.enemies().find(e=>e.t==='deathknight');for(const e of BK.enemies())if(e!==b)e.alive=false;
      const A={x0:A0.x0,x1:A0.x1,floor:A0.floor},c={P:BK.P,A,say:()=>{},sound:()=>{}};
      const moves=[['cleave','cleave',25],['grip','grip',30],['grip-chain','grip',56,-150],['boil','boil',30,-90],['passing','pass',30,-80],['ward','ward',60],['nova','ward',60*2.4+40],['summon','raise',30],['gravecall','call',40,-70,2],['surge','surge',40,-60,2]];
      for(const [name,what,n,dx,phase] of moves){b.cd=99;b.mode='stalk';b.phase=phase||1;b.x=(A.x0+A.x1)/2;BK.P.x=b.x+(dx||-70);BK.P.y=A.floor;UB.dkForce(b,what,c);b.cd=99;steps(n);shots[name]=snap();b.mode='stalk';b.modeT=0;}
      return shots;})()`, 300000);
    for (const [k, v] of Object.entries(r)) save('knight-' + k, v);
  } else {
    const SPOTS = set === 'crypt' ? [['crypt', 332, 36], ['crypt-stair', 363, 36]]
      : [['barrowline', 30, 36], ['trench-line', 80, 36], ['shieldcrossing', 104, 36], ['brokencharge', 138, 36], ['brokencharge-low', 196, 41],
         ['toppledtower', 242, 36], ['barrow', 280, 36], ['chapel-ram', 304, 36], ['crypt', 330, 36], ['nave', 360, 36]];
    const r = await pg.evalp(`(async()=>{${PRE}
      const shots={};for(const [name,x,y] of ${JSON.stringify(SPOTS)}){load();BK.tp(x,y);for(const e of BK.enemies())if(!e.boss&&e!==BK.boss)e.alive=false;steps(300);shots[name]=snap();}
      return shots;})()`, 600000);
    for (const [k, v] of Object.entries(r)) save(set + '-' + tag + '-' + k, v);
  }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { pg.close(); }
