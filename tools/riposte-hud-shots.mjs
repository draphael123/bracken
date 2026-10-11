// tools/riposte-hud-shots.mjs - THE RIPOSTE'S HUD ART, LIVE (claude/riposteart): the mix-up pips in both HUD modes and on the co-op P2 plate; the boss's poise bar (filling, near full, broken, in the
// ward) under the boss plate; and the boss's OPEN, DUELIST OPEN, BREAK and WARD reads in the world; an elite's plate with its poise bar. Drawn by the real page (BK.step renders).
//   PORT=8838 node tools/riposte-hud-shots.mjs [out.png]
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { openPage } from './cdp.mjs';
const OUT = process.argv[2] || 'work/claude/shots/riposteart/hud.png';
mkdirSync(dirname(OUT), { recursive: true });
const pg = await openPage({ audio: false, fonts: true });
try {
  await pg.evalp(`(async()=>{
    window.__tiles=[];
    window.__snap=(label,x,y,w,h,z=1)=>{const v=BK.view,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(v.buf,x,y,w,h,0,0,w,h);__tiles.push({c,label,z});};
    window.__solo=(hero)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.setHero(hero);BK.reset({fresh:true});BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);BK.P.hp=BK.P.maxHp*0.7;BK.P.inv=0;};
    return 1})()`);
  /* the pips: minimal HUD, plate HUD, 1 / 3 / 5 pips, the co-op plate */
  await pg.evalp(`(()=>{__solo('knight');const P=BK.P;
    for(const mode of ['minimal','full']){BK.SET.hud=mode;for(const n of [1,3,5]){P.mixN=n;P.mixAt=BK.time;P.mixLast='x';BK.step(2);__snap(mode+' '+n+' pips',0,0,150,50,1);}}
    BK.SET.hud='minimal';const heroes=BK.coopStart('berserker',false);BK.sim(2);const [a,b]=BK.players();for(const n of [0,3,5]){b.mixN=n;b.mixAt=BK.time;b.mixLast='x';BK.step(2);__snap('P2 plate '+n+' pips',BK.view.VW-110,36,110,50,1);}
    BK.coopEnd();return 1})()`);
  /* the boss: reads in the world and the poise bar under the plate */
  await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');
    const boot=(id,hero)=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.setHero(hero);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id===id));BK.state='play';BK.god=true;
      const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+(A.reverse?-1:1),Math.round(A.floor/16)-1);BK.sim(200);return BK.boss;};
    for(const [id,tag] of [['stockade','chief'],['towpath','duelist']]){const b=boot(id,'knight');BK.SET.hud='minimal';const P=BK.P;P.god=true;const m=BK.combat2().poiseMax(b);
      const at=(label,f)=>{f();b.hp=b.maxHp;BK.step(1);const v=BK.view,z=v.z||1,sx=v.VW/2+(b.x-v.x-v.VW/2)*z,sy=v.VH/2+(b.y-v.y-v.VH/2)*z;
        __snap(tag+' '+label+' (world)',Math.max(0,Math.round(sx-45)),Math.max(0,Math.round(sy-(b.h||24)-34)),90,Math.round((b.h||24)+50),1);__snap(tag+' '+label+' (plate)',Math.round(v.VW/2-90),v.VH-34,180,34,1);};
      b.rpWardT=0;b.rpOpenT=0;b.broken=0;b.poiseCd=0;
      at('poise 30%',()=>{b.poise=m*0.3;b.vx=0;});at('poise 90% READY',()=>{b.poise=m*0.9;});
      at('OPEN',()=>{b.poise=m*0.2;b.rpOpenT=b.rpOpenMax=(tag==="duelist"?0.9:0.5);b.rpOpenT*=0.7;});
      at('BREAK',()=>{b.rpOpenT=0;b.broken=1.4;b.rpBrokeMax=1.8;});
      at('WARD',()=>{b.broken=0;b.rpBrokeMax=0;b.rpWardT=2;b.rpWardMax=3;b.poise=m*0.4;});}
    return 1})()`).catch(e => { throw e; });
  const url = await pg.evalp(`(()=>{const T=__tiles,S=3,cols=6,gap=6;let W=0,H=0;const cell=T.map(t=>({w:t.c.width*S,h:t.c.height*S+14}));const cw=Math.max(...cell.map(c=>c.w)),ch=Math.max(...cell.map(c=>c.h));
    const rows=Math.ceil(T.length/cols);const c=document.createElement('canvas');c.width=cols*(cw+gap);c.height=rows*(ch+gap);const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#14121c';g.fillRect(0,0,c.width,c.height);g.font='11px monospace';
    T.forEach((t,i)=>{const x=(i%cols)*(cw+gap),y=Math.floor(i/cols)*(ch+gap);g.fillStyle='#e8dcc0';g.fillText(t.label,x+2,y+10);g.drawImage(t.c,x,y+14,t.c.width*S,t.c.height*S);});return c.toDataURL('image/png')})()`);
  writeFileSync(OUT, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote ' + OUT);
  if (pg.errors.length) console.log('page errors:', pg.errors.slice(0, 5));
} finally { pg.close(); }
