/* tools/burial-route.mjs — THE BURIAL CAVERNS, WALKED WITH THE REAL JUMP (claude/burial2, 2026-09-26: the Grave Causeway's slabs and the
   Bone Stairs went with the cut). RULE S2: "measure them with the real jump, for every hero, not with the reach model" - the reach model's
   jump is six tiles and a player's is about 3.2. Every three-tile jump over green water on the road (tools/burial2.mjs finds them; seven),
   for all seven heroes, from a run-up, no god mode: they land on the far side, dry. Then: the falling stone warns and drops; a zombie
   far away stays home and one close by comes for you; the Buried Dead's summons stop at three and die with him. */
import assert from 'node:assert/strict'; import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }); try {
 const r = await pg.evalp(`(async()=>{const{LEVELS,T}=await import('/src/level.js');const{DESCENT}=await import('/src/burial-caverns.js');BK.manualSimulation=true;BK.SET.speed=1;const out=[];
 const idx=LEVELS.findIndex(l=>l.id==='burial'),L0=LEVELS[idx].build(),at=(x,y)=>L0.grid[y*L0.W+x],fl=t=>t===T.SOLID||t===T.ONEWAY||t===T.PLANK;
 /* the road's jumps: green water three wide with floor on both sides at the same row, not a span of boards */
 const pits=L0.pools.filter(p=>p.harm).map(p=>({a:p.x0/16,b:p.x1/16-1,row:p.y/16-2})).filter(q=>q.b-q.a===2&&fl(at(q.a-1,q.row+1))&&fl(at(q.b+1,q.row+1))&&!(L0.crumble||[]).some(z=>z.x0>q.a&&z.x1<q.b));
 for(const h of ['knight','warden','pyro','paladin','pirate','reaper','geomancer']){const row={h,made:0,of:pits.length,miss:[]};
  for(const q of pits){const dir=q.row===DESCENT.g[1]-1?-1:1;   /* gallery two is walked west */
   BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=false;for(const e of BK.enemies())e.alive=false;const p=BK.P,K=BK.keys;
   const edge=dir>0?q.a-1:q.b+1,start=edge-dir*5;BK.tp(start,q.row);BK.sim(10);let jumped=false,land=null;
   for(let f=0;f<240&&land===null;f++){K.right=dir>0;K.left=dir<0;const tx=p.x/16;if(!jumped&&p.ground&&(dir>0?tx>=edge+0.72:tx<=edge+0.28)){BK.press('jump');K.jump=true;jumped=true;}
    const was=p.ground;BK.sim(1);if(jumped&&!was&&p.ground&&f>2)land=p.x/16;}
   for(const k in K)K[k]=false;
   const ok=land!==null&&(dir>0?land>q.b+1:land<q.a)&&p.y<=(q.row+1)*16&&!(p.venomT>0)&&!p.dead;if(ok)row.made++;else row.miss.push(q.a+(land===null?':air':':'+land.toFixed(1)));}
  out.push(row);}
 /* AND THEY CAN FAIL (S2): the same run, the jump pressed a tile and a half short of the edge, lands in the green water */
 let early=null;{const q=pits[0];BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=false;for(const e of BK.enemies())e.alive=false;const p=BK.P,K=BK.keys;BK.tp(q.a-7,q.row);BK.sim(10);let jumped=false;
  for(let f=0;f<240;f++){K.right=true;if(!jumped&&p.ground&&p.x/16>=q.a-2.3){BK.press('jump');K.jump=true;jumped=true;}BK.sim(1);if(p.venomT>0||p.swim){early='wet';break;}}for(const k in K)K[k]=false;early=early||'dry';}
 BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=true;const stal=BK.props().find(p=>p.t==='stal');BK.tp(Math.floor(stal.x/16),21);const rockStates=new Set();for(let f=0;f<100;f++){BK.sim(1);rockStates.add(stal.state);}if(!rockStates.has('shake')||!rockStates.has('gone'))throw Error('falling stone did not warn and drop: '+[...rockStates]);
 BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=true;const distant=BK.enemies().filter(e=>e.t==='zombie'&&e.mode==='walk'&&e.x>150*16).sort((a,b)=>b.x-a.x)[0];if(!distant)throw Error('missing distant zombie');const homeX=distant.x;BK.sim(120);if(!distant.alive||distant.x!==homeX)throw Error('distant zombie left encounter');BK.tp((homeX-70)/16,(distant.y-1)/16);BK.sim(30);if(distant.x===homeX)throw Error('nearby zombie did not activate');
 BK.reset({fresh:true});BK.load(idx);BK.state='play';BK.god=true;const A=BK.L.arena;BK.tp(A.trigger/16+1,A.floor/16-1);BK.sim(200);const b=BK.boss;for(let n=0;n<5;n++){b.mode='callTell';b.modeT=0;BK.sim(1);}const adds=BK.enemies().filter(e=>e.alive&&e.graveAdd);if(adds.length!==3)throw Error('summon cap '+adds.length);b.mode='rest';BKT.hurtEnemy(b,99999,b.x-80,false);BK.sim(10);if(BK.enemies().some(e=>e.alive&&e.graveAdd))throw Error('adds survive death');
 return{out,early,pits:pits.map(q=>q.a+'@'+q.row),distantZombieSleeps:true,nearbyZombieActivates:true,summonCap:adds.length,rockStates:[...rockStates]};})()`, 900000);
 console.log(JSON.stringify(r));
 assert.equal(r.out.length, 7); assert.equal(r.early, 'wet', 'a jump taken a tile and a half early still clears the water: nothing on the road can fail (S2)'); assert(r.pits.length >= 6, 'the road has fewer than six jumps: ' + r.pits);
 for (const row of r.out) assert.equal(row.made, row.of, row.h + ' cannot make every jump on the road with a run-up (S2): missed ' + row.miss.join(' '));
 assert.deepEqual(pg.errors, []);
 console.log('burial-route  every hero makes all ' + r.pits.length + ' three-tile jumps over green water on the road, dry; the stone falls, the dead keep their ground, the summons stop at three');
} finally { pg.close(); }
