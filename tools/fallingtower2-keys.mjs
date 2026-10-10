// tools/fallingtower2-keys.mjs - THE FALLING TOWER 2'S NEW WAYS, WITH REAL KEYS, EVERY HERO (claude/fallingtower2; design standard A7).
//   SCOPE  from the failing stair's second step: wait for the telescope's eyepiece to come down level, walk onto it, ride it up, walk off
//          onto the third step
//   FACE   out of the breach and up THE OUTER FACE's planks, ledge to ledge, in the storm (its wind and lightning on: god mode only keeps the
//          hero alive, nothing carries him), to its top plank
//   SNAP   from the top plank onto the crown's loose chunk; it snaps and carries him across; then up onto the parapet by his ring
// Only the game's keys (left, right, jump): no teleport once a part has started. usage: PORT=8790 node tools/fallingtower2-keys.mjs [--heroes=..]
import assert from 'node:assert/strict';
import { openRetry } from './boss-run.mjs';
const arg = process.argv.find(a => a.startsWith('--heroes='));
const heroes = arg ? arg.slice(9).split(',') : ['knight', 'warden', 'pyro', 'paladin', 'pirate', 'reaper', 'geomancer'];
const pg = await openRetry(); const rows = [];
try { for (const h of heroes) {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={h:${JSON.stringify(h)}};
    BK.setHero(out.h);BK.reset({fresh:true});const S=BK.ui.settings();const sp0=S.speed;S.speed=1;BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
    const L=BK.level,F=L.ft2,P=()=>BK.P,k=BK.keys,TS=16,clear=()=>{for(const q of ['left','right','jump','down','up','atk','block'])k[q]=false;};
    const quiet=()=>{for(const e of BK.enemies())if(e.t!=='undeadmage')e.alive=false;};
    const settle=n=>{for(let i=0;i<n;i++){quiet();BK.sim(1);}};
    const on=(row)=>P().ground&&Math.abs(P().y-row*TS)<3;
    /* walk to a column on the footing he is on */
    const walkTo=(x,max=240)=>{for(let i=0;i<max;i++){clear();const d=x-P().x;if(Math.abs(d)<3)break;k[d>0?'right':'left']=true;quiet();BK.sim(1);}clear();};
    /* a hop toward a ledge [x0,len,row]: from the near end of this one, jump and hold toward it until he stands on it (or gives up) */
    const hop=(T,max=120)=>{const [x0,len,row]=T,c=P().x,dir=(x0*TS+len*TS/2)>c?1:-1;clear();k[dir>0?'right':'left']=true;k.jump=true;BK.press('jump');
      for(let i=0;i<max;i++){quiet();BK.sim(1);if(i>4&&P().ground){if(Math.abs(P().y-row*TS)<3&&P().x>x0*TS-2&&P().x<(x0+len)*TS+2)break;}if(i>18)k.jump=false;
        const tx=Math.max(x0*TS+10,Math.min((x0+len)*TS-10,P().x+dir*20));k.right=tx>P().x+2;k.left=tx<P().x-2;}clear();settle(4);return on(row)&&P().x>x0*TS-2&&P().x<(x0+len)*TS+2;};
    // ---- SCOPE ----
    {const obs=L.towerFloors[2],roof=obs.bot-10,lo=roof-6,hi=roof-15;BK.tp(41,lo-1);settle(30);out.scopeStart=on(lo);
     const m=()=>BK.movers().find(q=>q.role==='scope');let n=0;
     walkTo(39*TS+5);for(;n<60*12;n++){quiet();BK.sim(1);if(Math.abs(m().y-lo*TS)<1.5&&m().x+m().w>=39*TS-2)break;}
     for(let i=0;i<40&&P().onMover!==m();i++){clear();k.left=true;quiet();BK.sim(1);}clear();out.boarded=P().onMover===m();
     for(n=0;n<60*12&&!(Math.abs(m().y-hi*TS)<2);n++){quiet();BK.sim(1);}
     for(let i=0;i<60&&!(P().ground&&!P().onMover&&on(hi));i++){clear();k.right=true;quiet();BK.sim(1);}clear();settle(10);out.scope=on(hi)&&P().x>45*TS;}
    // ---- FACE ----
    {const O=F.outer,crown=L.towerFloors[6],sill=crown.bot;BK.tp(14,sill-1);settle(30);walkTo(10*TS+8);out.faceStart=on(sill)&&P().x<12*TS;let got=0;
     /* a player reads the flags: he waits for the wind to drop before a jump, and if a gust or a strike costs him a plank he climbs on from where he is */
     let best=-1,tries=0;for(;tries<40&&best<O.ledges.length-1;tries++){const c=O.ledges.findIndex(q=>on(q[2])&&P().x>q[0]*TS-2&&P().x<(q[0]+q[1])*TS+2);best=Math.max(best,c);const T=O.ledges[c+1];if(!T)break;
       const near=(T[0]*TS+T[1]*TS/2)>P().x?1:-1,cur=c>=0?O.ledges[c]:null,lip=cur?(near>0?(cur[0]+cur[1])*TS-6:cur[0]*TS+6):(near>0?P().x:(O.x1+1)*TS+6);
       walkTo(lip);const cr=()=>(L.crumbles||[]).some(q=>q.st==='count'&&Math.abs(P().y-q.row*TS)<3&&P().x>q.x0*TS-4&&P().x<(q.x1+1)*TS+4);for(let w=0;w<240&&F.rt.gust.st!=='calm'&&!cr();w++){clear();if(F.rt.gust.st==='blow')k[F.rt.gust.dir>0?'left':'right']=true;quiet();BK.sim(1);if(Math.abs(P().x-lip)>10)walkTo(lip,30);}clear();hop(T);}   /* (it leans into a gust it waits out; on a cracked plank it does not wait) */
     got=O.ledges.findIndex(q=>on(q[2])&&P().x>q[0]*TS-2&&P().x<(q[0]+q[1])*TS+2)+1;out.tries=tries;
     out.face=got;out.faceN=O.ledges.length;}
    // ---- SNAP ----
    {const ch=()=>BK.movers().find(q=>q.role==='chunk'),top=F.outer.ledges[F.outer.ledges.length-1];
     const tw=ch().x>P().x?1:-1;walkTo(tw>0?(top[0]+top[1])*TS-6:top[0]*TS+6);clear();k[tw>0?'right':'left']=true;k.jump=true;BK.press('jump');for(let i=0;i<90&&P().onMover!==ch();i++){quiet();BK.sim(1);if(i>18)k.jump=false;}clear();out.chunk=P().onMover===ch();
     for(let i=0;i<60*8&&!(F.rt.snap.st==='done');i++){quiet();BK.sim(1);}out.snap=F.rt.snap.st;settle(10);
     const pd=28*TS>ch().x+ch().w/2?1:-1;walkTo(pd>0?ch().x+ch().w-8:ch().x+8);clear();k.jump=true;BK.press('jump');let minY=P().y;out.tr=[];for(let i=0;i<90;i++){quiet();k[pd>0?'right':'left']=i>=8;BK.sim(1);minY=Math.min(minY,P().y);if(i%3===0)out.tr.push([i,Math.round(P().x),Math.round(P().y),P().ground?1:0,P().onMover?1:0]);if(i>18)k.jump=false;if(i>6&&P().ground&&!P().onMover)break;}out.minY=Math.round(minY);clear();settle(6);   /* (up first, then over: the parapet is a slab with the crown's air under it) */
     out.parapet=on(L.skyRow+1)&&P().x>=28*TS-4&&P().x<44*TS;out.end=[Math.round(P().x),Math.round(P().y),L.skyRow,!!P().onMover];walkTo(37*TS);out.ringX=Math.round(P().x/TS);}
    S.speed=sp0;return out;})()`, 900000);
  rows.push(r); console.log(JSON.stringify(r)); } } finally { pg.close(); }
for (const r of rows) {
  assert.ok(r.scopeStart && r.boarded && r.scope, r.h + ': the telescope is not boarded from the second step and left onto the third: ' + JSON.stringify(r));
  assert.ok(r.faceStart && r.face === r.faceN, r.h + ': the outer face is not climbed plank to plank: ' + r.face + '/' + r.faceN);
  assert.ok(r.chunk && r.snap === 'done' && r.parapet, r.h + ': the chunk is not boarded, does not carry him, or the parapet is not a step from it: ' + JSON.stringify(r)); }
console.log('ok  fallingtower2-keys  ' + rows.length + ' heroes, real keys: the telescope (board it low, off it high), the outer face plank to plank in the storm, the snap to the parapet');
