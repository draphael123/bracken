import assert from 'node:assert/strict';
import {LEVELS,T} from '../src/level.js';
import {updateBuriedDead,updateZombie} from '../src/buried-dead.js';
import {floodReach} from '../src/reachcore.js';
const L=LEVELS.find(l=>l.id==='burial').build();assert(L.W+3*Math.max(0,L.H-30)<=720,'the caverns are cut to about 700 cols (claude/burial2)');assert.equal(L.arena.boss,'burieddead');assert.equal(L.mini.boss,'gravewarden');assert.equal(L.ents.filter(e=>e.t==='silver').length,3);{const dead=L.ents.filter(e=>['zombie','husk','corpse'].includes(e.t)).length;assert(dead>=20,'the dead under the hill: '+dead);}assert(L.ents.filter(e=>e.t==='stal').length>=2);/* claude/burial2: half the length, placed by hand */
const green=L.pools.filter(p=>p.poison);assert(green.length>=6,'green water: '+green.length);/* claude/burial2: the pits you jump (S2) and THE ROTTEN BRIDGES' two: every one of them still told below */for(const p of green)assert(p.poison&&p.harm&&p.foulCol&&p.clear);
assert(L.pools.some(p=>!p.harm&&!p.poison&&p.swim),'the Drowned Ossuary black water is plain water');
const A={x0:0,x1:672,floor:500},P={x:320,y:500,h:22,dead:false};let hits=[],calls=[];
const c={P,A,hit:(...v)=>hits.push(v),summon:n=>calls.push(n),say:()=>{},sound:()=>{}};
const boss=mode=>({alive:true,hp:100,hp0:100,phase:1,mode,modeT:.5,x:300,y:500,anim:0,turn:0,markX:320});
/* HIS REST OPENS NOTHING (claude/burial2, A11): every blow ends in his rest, and the rest is not a window any more. (Red against the old boss: open 2.2.) */
for(const [m,hard]of [['slamTell',true],['cleaveTell',false],['eruptTell',true]]){const e=boss(m);hits=[];updateBuriedDead(e,.2,c);assert.equal(hits.length,0);updateBuriedDead(e,.4,c);assert.equal(hits.length,1);assert.equal(hits[0][2],hard);assert.equal(e.mode,'rest');assert(!(e.open>0),m+' left him open on his own timer: '+e.open);}
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
/* and the lair really has both of them (read off the arena: its floor row F, its first column X) */
const F=L.arena.floor/16,X=L.arena.x0/16,X1=L.arena.x1/16;
for (const [row,want] of [[F-3,8],[F-6,8]]){let n=0;for(let x=X;x<=X1;x++)if(L.grid[row*L.W+x]===T.ONEWAY)n++;
  assert(n>=want,'the lair is missing its row-'+row+' tier: '+n+' ledge tiles');}
assert(L.arena.floor-(F-6)*16>80,'the high tier no longer clears the nova (it is '+(L.arena.floor-(F-6)*16)+'px up, the nova reaches 80)');
assert(L.arena.floor-(F-3)*16<80,'the low tier now clears the nova too, so there is no reason to climb');
/* A REAL PLATFORMING FIGHT (Daniel, 2026-09-24): a step at each wall and the crown bier hung over his grave, and the reach
   model can walk the whole line - wall step, low, high, crown, high, low, wall step - without the floor. (Red before it was built.) */
{let n=0;for(let x=X;x<=X1;x++)if(L.grid[(F-8)*L.W+x]===T.ONEWAY)n++;assert(n>=5,'the crown bier (row '+(F-8)+') is missing: '+n+' tiles');
 for(const [a,b] of [[X,X+5],[X+35,X+41]]){let k=0;for(let x=a;x<=b;x++)if(L.grid[(F-3)*L.W+x]===T.ONEWAY)k++;assert(k>=3,'the wall step at '+a+' is missing');}
 assert(L.structures.some(s=>s.kind==='chains'&&s.floor===F-8),'the bier hangs from nothing (B9)');
 const seen=floodReach(L,T,{rides:true}).seen;for(const [dx,dy] of [[2,-4],[8,-4],[12,-7],[20,-9],[27,-7],[32,-4],[38,-4]])assert(seen.has((X+dx)+','+(F+dy)),'the arena route cannot reach '+(X+dx)+','+(F+dy));}

console.log('Burial cut to about 700 cols, poison crossings, zombies, falling stone, boss attacks/counters, THE HANDS and the two tiers, bounded tracking, phase two and grab warnings pass.');

/* HIS ONE CAUSED OPENING IS IN PHASE ONE TOO (docs/briefs/buried-dead-rotation.md, option A, Daniel 2026-09-23). With sinkTell third,
   four turns stood between the erupt and the next slam - 21 s against broken ground that lives 14 - and the arm went into the ground
   ZERO times before enrage. A hero who stands where he erupted and never moves must see it in phase one. (Red against the old array.) */
{const Pp={x:320,y:500,h:22,dead:false},cc={P:Pp,A,hit:()=>{},summon:()=>{},say:()=>{},sound:()=>{},ring:()=>{}},e={alive:true,hp:100,hp0:100,phase:1,mode:'walk',modeT:.5,x:320,y:500,anim:0,turn:0,markX:320};let stuck=0;
 for(let f=0;f<60*120;f++){e.hp=100;const was=e.mode;updateBuriedDead(e,1/60,cc);if(e.mode==='stuck'&&was!=='stuck')stuck++;}
 assert.equal(e.phase,1);assert(stuck>=2,'the arm-in-the-ground punish comes round in phase one: '+stuck+' in 120 s');}

/* THE GAS OPENS HIM (claude/burial2, A11; docs/briefs/burial-rework-2.md §3). His rest opens nothing now; a vent burning under him
   does - SCORCHED, open 3.4 s - and only once a lighting: standing in the same flame does not keep him open. A cold vent does
   nothing, and a buried dead man in a burning vent's light stays in the ground. (Red against the old boss: no 'scorched'.) */
{const mk=lit=>[{x:18,y:31,litT:lit,burnt:false,phase:0,period:3.4}],Pp={x:100,y:500,h:22,dead:false};
 const run=(V,secs)=>{const cc={P:Pp,A,hit:()=>{},summon:()=>{},say:()=>{},sound:()=>{},ring:()=>{},shake:()=>{},vents:V},e=boss('walk');e.x=18*16+8;e.modeT=.5;let n=0,open=0;
  for(let f=0;f<secs*60;f++){e.hp=100;const was=e.mode;updateBuriedDead(e,1/60,cc);if(e.mode==='scorched'&&was!=='scorched')n++;open=Math.max(open,e.open||0);}return{n,open};};
 const hot=run(mk(20),10),cold=run(mk(0),10);
 assert.equal(hot.n,1,'a burning vent under him scorched him '+hot.n+' times in one lighting');assert(hot.open>=3,'scorched, he is open: '+hot.open);
 assert.equal(cold.n,0,'a cold vent scorched him');
 const z={alive:true,x:100,y:500,anim:0,mode:'buried',modeT:0,face:1},zc={P:{x:110,y:500,dead:false},move:()=>({ground:true}),solid:()=>true,hit:()=>'hit',snare:()=>{},say:()=>{},lit:()=>true};
 for(let f=0;f<120;f++)updateZombie(z,1/60,zc);assert.equal(z.mode,'buried','a buried dead man got up inside a burning vent\'s light');
 zc.lit=()=>false;updateZombie(z,1/60,zc);assert.equal(z.mode,'riseTell','and out of it he does');
 console.log('THE GAS: a burning vent scorches him once a lighting (open '+hot.open.toFixed(1)+' s); a cold vent never; the buried stay down in its light.');}
