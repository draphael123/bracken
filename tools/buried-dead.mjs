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
/* THE HANDS, AND THE TIERS THEY ANSWER (2026-09-23). Daniel: "the fight also needs more platforms so you can avoid
   some of his attacks" and "he can use just one more attack pre-enrage". The platforms were the real find: every
   attack he has already carries a height condition - the nova reaches 80px up, the erupt 90, the body slam 44 - and
   the room had ONE tier at 48px, so there was nowhere in it the nova could not reach. */
{ const p1=boss('walk');const seen=new Set();for(let i=0;i<4500;i++){updateBuriedDead(p1,1/60,c);seen.add(p1.mode);}
  assert(seen.has('clawTell'),'THE HANDS are not in the PRE-ENRAGE rotation');
  assert.equal(p1.phase,1,'he enraged during the phase-one rotation, so this proved nothing'); }
/* they come up where you were standing, floor or ledge, and your feet are the answer - not your shield */
{P.x=320;P.y=440;hits=[];const e=boss('clawTell');e.markY=440;updateBuriedDead(e,.6,c);
  assert.equal(hits.length,1,'the hands did not reach the low ledge');assert.equal(hits[0][2],true,'the hands must be unblockable');}
{P.y=440;const e=boss('clawTell');e.markY=440;P.x=420;hits=[];updateBuriedDead(e,.6,c);
  assert.equal(hits.length,0,'moving your feet did not answer the hands');}
/* THE POINT OF THE UPPER TIER, both ways: 96px up is over the nova, and the hands still get there */
{P.x=320;P.y=404;hits=[];updateBuriedDead(boss('novaTell'),.6,c);assert.equal(hits.length,0,'the nova reaches 96px up: the high tier is pointless');}
{P.x=320;P.y=404;hits=[];const e=boss('clawTell');e.markY=404;updateBuriedDead(e,.6,c);assert.equal(hits.length,1,'the hands do not reach the high tier: it is a roof, not a choice');}
/* and the ossuary really has both of them */
for(const [row,want] of [[29,8],[26,8]]){let n=0;for(let x=1080;x<=1122;x++)if(L.grid[row*L.W+x]===T.ONEWAY)n++;
  assert(n>=want,'the ossuary is missing its row-'+row+' tier: '+n+' ledge tiles');}
assert(L.arena.floor-26*16>80,'the high tier no longer clears the nova (it is '+(L.arena.floor-26*16)+'px up, the nova reaches 80)');
assert(L.arena.floor-29*16<80,'the low tier now clears the nova too, so there is no reason to climb');

console.log('Burial 3x length, poison crossings, zombies, falling stone, boss attacks/counters, THE HANDS and the two tiers, bounded tracking, phase two and grab warnings pass.');

/* HIS ONE CAUSED OPENING IS IN PHASE ONE TOO (docs/briefs/buried-dead-rotation.md, option A, Daniel 2026-09-23). With sinkTell third,
   four turns stood between the erupt and the next slam - 21 s against broken ground that lives 14 - and the arm went into the ground
   ZERO times before enrage. A hero who stands where he erupted and never moves must see it in phase one. (Red against the old array.) */
{const Pp={x:320,y:500,h:22,dead:false},cc={P:Pp,A,hit:()=>{},summon:()=>{},say:()=>{},sound:()=>{},ring:()=>{}},e={alive:true,hp:100,hp0:100,phase:1,mode:'walk',modeT:.5,x:320,y:500,anim:0,turn:0,markX:320};let stuck=0;
 for(let f=0;f<60*120;f++){e.hp=100;const was=e.mode;updateBuriedDead(e,1/60,cc);if(e.mode==='stuck'&&was!=='stuck')stuck++;}
 assert.equal(e.phase,1);assert(stuck>=2,'the arm-in-the-ground punish comes round in phase one: '+stuck+' in 120 s');}
