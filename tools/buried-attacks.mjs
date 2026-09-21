/* tools/buried-attacks.mjs — THE BURIED DEAD'S THREE NEW ATTACKS (Daniel, 2026-09-20).
   POISON NOVA costs health and leaves the caverns' poison up close, and nothing from across the room; THE THROW
   lands a body where the hero stood and a zombie gets up there, under the same cap of three as his summon; the
   BODY SLAM leaves the ground and lands on the mark, and is his only once enraged. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
async function page(){const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
 const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=false;
  const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(150);return BK.boss;};
 const force=(b,m)=>{for(let i=0;i<10&&b.mode===m||i===0;i++){b.mode=m;b.modeT=0;BK.sim(1);if(b.mode!==m)break;}};
 // POISON NOVA: close = damage + venom; far = nothing
 {const b=boot();BK.P.x=b.x+50;BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.venomT=0;force(b,'novaTell');out.novaClose={lost:BK.P.maxHp-BK.P.hp,venom:+(BK.P.venomT||0).toFixed(1)};
  const b2=boot();BK.P.x=b2.x+200;BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.venomT=0;force(b2,'novaTell');out.novaFar={lost:BK.P.maxHp-BK.P.hp,venom:+(BK.P.venomT||0).toFixed(1)};}
 // THE THROW: a body flies, lands, and a zombie gets up there
 {const b=boot();BK.god=true;BK.P.x=b.x+120;const before=BK.enemies().filter(e=>e.alive&&e.graveAdd).length;force(b,'throwTell');const flew=!!b.flying;
  for(let i=0;i<90&&b.flying;i++)BK.sim(1);BK.sim(5);
  const adds=BK.enemies().filter(e=>e.alive&&e.graveAdd);out.throw={flew,landed:!b.flying,addsBefore:before,addsAfter:adds.length,landX:adds.length?Math.round(adds[adds.length-1].x-BK.P.x):null};}
 // BODY SLAM: only in phase 2; he leaves the ground and lands where you stood
 {const b=boot();BK.god=true;b.phase=2;const x0=b.x;BK.P.x=b.x+140;force(b,'bodyTell');let maxUp=0;
  for(let i=0;i<60&&b.mode==='bodyFly';i++){BK.sim(1);maxUp=Math.max(maxUp,BK.L.arena.floor-b.y);}
  out.body={mode:b.mode,moved:Math.round(b.x-x0),rose:Math.round(maxUp),open:+b.open.toFixed(1)};}
 // and the rotation includes the new ones: nova+throw in phase 1, body slam only in phase 2
 {const b=boot();BK.god=true;const seen1=new Set(),seen2=new Set();b.phase=1;b.turn=0;
  for(let i=0;i<12;i++){b.mode='walk';b.modeT=0;BK.P.x=b.x+30;BK.sim(1);seen1.add(b.mode);}
  b.phase=2;b.turn=0;for(let i=0;i<14;i++){b.mode='walk';b.modeT=0;BK.P.x=b.x+30;BK.sim(1);seen2.add(b.mode);}
  out.rotation={phase1:[...seen1].filter(m=>m.endsWith('Tell')).sort(),phase2:[...seen2].filter(m=>m.endsWith('Tell')).sort()};}
 return out;}
try { const r = await pg.evalp(`(${page})()`, 300000);
  assert.ok(r.novaClose.lost > 0 && r.novaClose.venom > 2, 'the nova must hurt and poison up close: ' + JSON.stringify(r.novaClose));
  assert.equal(r.novaFar.lost, 0, 'and cost nothing from across the room'); assert.equal(r.novaFar.venom, 0);
  assert.ok(r.throw.flew && r.throw.landed, 'the thrown body must fly and land');
  assert.equal(r.throw.addsAfter, r.throw.addsBefore + 1, 'a zombie gets up where it lands');
  assert.ok(Math.abs(r.throw.landX) < 30, 'and it lands where the hero stood: ' + r.throw.landX);
  assert.ok(r.body.rose > 30 && Math.abs(r.body.moved) > 60, 'the body slam must leave the ground and cross to the mark: ' + JSON.stringify(r.body));
  assert.ok(r.body.open > 2, 'and its landing is a window');
  assert.ok(r.rotation.phase1.includes('novaTell') && r.rotation.phase1.includes('throwTell'), 'nova and the throw from the start');
  assert.ok(!r.rotation.phase1.includes('bodyTell'), 'no body slam before he enrages');
  assert.ok(r.rotation.phase2.includes('bodyTell'), 'and the body slam once he does');
  assert.deepEqual(pg.errors, []); console.log(JSON.stringify(r));
} finally { pg.close(); }
