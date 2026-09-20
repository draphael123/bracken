import assert from 'node:assert/strict';
import {LEVELS,T} from '../src/level.js';
import {floodReach} from '../src/reachcore.js';
import {updateWarden} from '../src/harbor-boss.js';
const L=LEVELS.find(l=>l.id==='harbor').build();
assert.equal(L.W,1080);assert.equal(L.harborSections.length,11);assert.equal(L.arena.boss,'harbormaster');assert.equal(L.mini.boss,'bosun');
assert.deepEqual(L.ents.filter(e=>e.t==='silver').map(e=>e.x).sort((a,b)=>a-b),[150,624,974]);
const reach=floodReach(L,T,{rides:false});for(const e of L.ents.filter(e=>['check','silver','gate'].includes(e.t)))assert(reach.jumpNear(e.x,e.y),'fixed route reaches '+JSON.stringify(e));
for(const p of L.pools.filter(p=>p.x0>=360*16)){for(const x of [p.x0/16,p.x1/16-1])assert.equal(L.grid[38*L.W+x],T.NET,'water exit net');}
const A={x0:0,x1:672,floor:480},P={x:320,y:480,h:22,dead:false};let hits=[],shots=[];
const c={A,P,hit:(...v)=>{hits.push(v);},seed:s=>shots.push(s),say:()=>{},sound:()=>{}};
const boss=()=>({alive:true,hp:1000,hp0:1000,x:280,y:480,phase:1,turn:0,anim:0,mode:'advance',modeT:0,face:1,marks:[]});
for(const move of ['anchor','low','harpoon','pressure','twin','high']){
 const e=boss();e.mode=move+'Tell';e.modeT=.5;e.marks=[P.x];e.aimX=P.x;e.aimY=P.y-10;hits=[];shots=[];
 updateWarden(e,.25,c);assert.equal(hits.length+shots.length,0,'no early damage '+move);updateWarden(e,.3,c);assert.equal(e.mode,'vent');assert(e.open>=1.8);
 if(move==='harpoon'){assert.equal(shots.length,1);assert(!shots[0].unblockable);}
 else if(move==='high')assert.equal(hits.length,0,'ground is safe from high surge');else assert.equal(hits.length,1,move+' connects');
}
for(const [move,y,x] of [['low',430,320],['pressure',480,380],['high',480,320],['anchor',480,420]]){const e=boss();e.mode=move+'Tell';e.modeT=0;e.marks=[320];P.x=x;P.y=y;hits=[];updateWarden(e,.02,c);assert.equal(hits.length,0,'safe response '+move);}
P.x=320;P.y=430;let e=boss();e.mode='highTell';e.modeT=0;hits=[];updateWarden(e,.02,c);assert.equal(hits.length,1,'high surge reaches shelf');
e=boss();e.hp=500;updateWarden(e,.02,c);assert.equal(e.phase,2);assert.equal(e.mode,'rally');
const seen=[];for(let i=0;i<6000;i++){updateWarden(e,1/60,c);if(e.mode.endsWith('Tell'))seen.push(e.mode);}for(const m of ['highTell','twinTell','lowTell','anchorTell','harpoonTell','pressureTell'])assert(seen.includes(m),m);
console.log('Harbor is 3x length with fixed reachable rewards and water exits; Warden warnings, safe responses, phase-two rotation and recovery windows pass.');
