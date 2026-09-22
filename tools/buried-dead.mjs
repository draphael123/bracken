import assert from 'node:assert/strict';
import {LEVELS,T} from '../src/level.js';
import {updateBuriedDead,updateZombie} from '../src/buried-dead.js';
const L=LEVELS.find(l=>l.id==='burial').build();assert.equal(L.W,1140);assert.equal(L.arena.boss,'burieddead');assert.equal(L.mini.boss,'gravewarden');assert.equal(L.ents.filter(e=>e.t==='silver').length,3);assert(L.ents.filter(e=>e.t==='zombie').length>35);assert(L.ents.filter(e=>e.t==='stal').length>=3);/* batch 4b: the Falling Gallery's roof stones went with its road */
const green=L.pools.filter(p=>p.poison);assert.equal(green.length,5);/* four green-water crossings + the one Falling Gallery pit left east of the wall */for(const p of green)assert(p.poison&&p.harm&&p.foulCol&&p.clear);
assert(L.pools.some(p=>!p.harm&&!p.poison&&p.swim),'the Drowned Ossuary black water is plain water');
const A={x0:0,x1:672,floor:500},P={x:320,y:500,h:22,dead:false};let hits=[],calls=[];
const c={P,A,hit:(...v)=>hits.push(v),summon:n=>calls.push(n),say:()=>{},sound:()=>{}};
const boss=mode=>({alive:true,hp:100,hp0:100,phase:1,mode,modeT:.5,x:300,y:500,anim:0,turn:0,markX:320});
for(const [m,hard]of [['slamTell',true],['cleaveTell',false],['eruptTell',true]]){const e=boss(m);hits=[];updateBuriedDead(e,.2,c);assert.equal(hits.length,0);updateBuriedDead(e,.4,c);assert.equal(hits.length,1);assert.equal(hits[0][2],hard);assert(e.open>=2);}
for(const[m,x,y]of [['slamTell',320,460],['cleaveTell',410,500],['eruptTell',375,500]]){P.x=x;P.y=y;hits=[];updateBuriedDead(boss(m),.6,c);assert.equal(hits.length,0,m+' safe response');}
P.x=450;P.y=500;const e=boss('sinkTell');updateBuriedDead(e,.6,c);assert.equal(e.mode,'burrow');updateBuriedDead(e,.5,c);assert(e.x>300&&e.x<450,'shadow tracks');updateBuriedDead(e,.5,c);assert.equal(e.mode,'eruptTell');const locked=e.x;P.x=100;updateBuriedDead(e,.4,c);assert.equal(e.x,locked,'eruption stops tracking');
const phase=boss('walk');phase.hp=50;updateBuriedDead(phase,.01,c);assert.equal(phase.phase,2);assert.equal(phase.mode,'rally');const seen=new Set();for(let i=0;i<4500;i++){updateBuriedDead(phase,1/60,c);seen.add(phase.mode);}for(const m of ['slamTell','callTell','sinkTell','cleaveTell','eruptTell'])assert(seen.has(m));assert(calls.includes(2));
const z={alive:true,x:100,y:500,anim:0,mode:'buried',modeT:0,face:1};P.x=110;P.y=500;let grabbed=0;const zc={P,move:()=>({ground:true}),solid:()=>true,hit:()=>{grabbed++;return 'hit';},snare:t=>assert(t<=.75),say:()=>{}};updateZombie(z,.01,zc);assert.equal(z.mode,'riseTell');updateZombie(z,.5,zc);assert.equal(grabbed,0);updateZombie(z,.7,zc);updateZombie(z,.1,zc);assert.equal(z.mode,'grabTell');updateZombie(z,.8,zc);assert.equal(grabbed,1);
console.log('Burial 3x length, poison crossings, zombies, falling stone, boss attacks/counters, bounded tracking, phase two and grab warnings pass.');
