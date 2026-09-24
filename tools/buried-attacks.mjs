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
 /* THE SKULLS (2026-09-24), FORCED (A3): a skull flies at where the hero stood, hurts him if he does not guard, and the shield turns it */
 const skullAt=(guard,phase,dx)=>{const b=boot();b.phase=phase;BK.god=false;for(const e of BK.enemies())if(e!==b)e.alive=false;BK.P.x=b.x+dx;BK.P.hp=BK.P.maxHp;BK.P.inv=0;
  for(const k in BK.keys)BK.keys[k]=false;BK.P.face=-Math.sign(dx);if(guard)BK.keys.block=true;BK.sim(2);force(b,'skullTell');BK.sim(1);const n=(b.skulls||[]).length;let most=n;
  for(let i=0;i<90;i++){BK.sim(1);most=Math.max(most,(b.skulls||[]).length);if(guard)BK.keys.block=true;}BK.keys.block=false;return {skulls:most,lost:BK.P.maxHp-BK.P.hp};};
 out.skullOpen=skullAt(false,1,130);out.skullGuard=skullAt(true,1,130);out.skull2=skullAt(false,2,130);
 /* AND BY THE RULE: a hero who camps the high tier, or stands off at the far wall, gets skulls; one who fights him on the floor does not */
 const rule=where=>{const b=boot();BK.god=true;for(const e of BK.enemies())if(e!==b)e.alive=false;const A=BK.L.arena;const seen={};
  for(let f=0;f<60*20;f++){if(where==='ledge'){BK.P.x=1092.5*16;BK.P.y=26*16;BK.P.vy=0;BK.P.ground=true;}else if(where==='far'){BK.P.x=b.x>(A.x0+A.x1)/2?A.x0+24:A.x1-24;BK.P.y=A.floor;}else{BK.P.x=b.x+40;BK.P.y=A.floor;}
   for(const e of BK.enemies())if(e!==b&&e.alive)e.alive=false;BK.sim(1);seen[b.mode]=(seen[b.mode]||0)+1;}
  return {skull:!!seen.skullTell,claw:!!seen.clawTell};};
 out.camp={ledge:rule('ledge'),far:rule('far'),floor:rule('floor')};
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
  assert.ok(r.skullOpen.skulls === 1 && r.skullOpen.lost > 0, 'forced, the skull must fly and hurt a hero who does not guard: ' + JSON.stringify(r.skullOpen));
  assert.ok(r.skullGuard.lost < r.skullOpen.lost / 2, 'and the shield turns it (a YELLOW mark): ' + JSON.stringify(r.skullGuard));
  assert.equal(r.skull2.skulls, 2, 'two skulls once he is enraged: ' + JSON.stringify(r.skull2));
  assert.ok(r.camp.ledge.skull, 'camping the high tier for twenty seconds draws a skull: ' + JSON.stringify(r.camp));
  assert.ok(r.camp.far.skull, 'standing off at the far wall draws a skull: ' + JSON.stringify(r.camp));
  assert.ok(!r.camp.floor.skull, 'fighting him close on the floor never does: ' + JSON.stringify(r.camp));
  assert.deepEqual(pg.errors, []); console.log(JSON.stringify(r));
} finally { pg.close(); }
