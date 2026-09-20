import assert from 'node:assert/strict';
import {LEVELS,T} from '../src/level.js';
import {openPage} from './cdp.mjs';
import {writeFileSync} from 'node:fs';
const L=LEVELS.find(l=>l.id==='marsh').build(),A=L.ambushes[0];
assert.equal(A.name,'THE REED ISLAND');
assert(!L.pools.some(p=>p.x1>A.wallL*16&&p.x0<(A.wallR+1)*16));
for(let x=A.wallL;x<=A.wallR;x++)assert.equal(L.grid[(A.row+1)*L.W+x],T.SOLID);
assert.deepEqual(A.waves[0].map(f=>f[0]),['thorn','hopper','turtle','archer']);
assert.equal(A.waves[0][0][1],384);
assert.equal(A.waves[0][0][1]-(A.trigger??A.wallL+3),10);
const pg=await openPage({audio:false,fonts:false});try{
 await pg.evalp(`BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BK.load(1);BK.start();BK.god=false;BK.sim(300);BK.tp(373,17);BK.sim(2);BK.keys.right=true;BK.sim(20);BK.keys.right=false;BK.step(0)`);
 const entry=await pg.evalp(`(()=>{const a=BK.ambushes()[0];return {state:a.st,leader:a.leader&&{t:a.leader.t,x:a.leader.x},player:{x:BK.P.x,y:BK.P.y,hp:BK.P.hp,dead:BK.P.dead},foes:(a.foes||[]).map(e=>({t:e.t,y:e.y}))}})()`);
 assert.equal(entry.state,'fight');assert.equal(entry.leader.t,'thorn');assert(!entry.player.dead);assert.equal(entry.player.y,288);assert(entry.leader.x-entry.player.x>100);
 if(process.env.REED_SCREEN){await pg.evalp(`BK.step(120)`);const d=await pg.evalp(`document.querySelector('canvas').toDataURL('image/png')`);writeFileSync(process.env.REED_SCREEN,Buffer.from(d.split(',')[1],'base64'));}
 const lab=await pg.evalp(`BK.ambushLab({levels:['marsh'],reps:1})`);
 assert.equal(lab.rows.length,6);assert(lab.rows.every(r=>r.opened));assert.deepEqual(pg.errors,[]);
 console.log(JSON.stringify({entry,healthMode:'refilled timing lab; not a normal-health survival test',rows:lab.rows}));
}finally{pg.close();}
