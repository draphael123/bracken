/* tools/undead-foes.mjs — THE TWO NEW DEAD, AT RUNTIME.
   The Burial Caverns had one creature doing 70% of the work (forty-four identical zombies) and the Falling Tower had no
   undead at all in a dead wizard's tower: docs/audit-new-levels-0920.md. The GRAVE HUSK is the caverns' second dead man
   - slower, twice the health, and it bursts when it dies - and the DEAD APPRENTICE is the tower's own, who still throws
   the one spell he knew. Both walk the same dead man's walk (updateZombie), so what is proved here is what is new:
   the husk's gas poisons whoever killed it close, and the apprentice's ember is a real shot at a real distance.       */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};

  /* THE GRAVE HUSK: killed at arm's length, the belly goes and the poison is on you */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='burial'));BK.state='play';BK.god=false;BK.sim(10);
   const husks=BK.enemies().filter(e=>e.alive&&e.t==='husk');
   const h=husks[0];out.huskCount=husks.length;
   if(!h)return{error:'no husk in the caverns'};
   out.husk={hp:h.hp,w:h.w,sprite:!!(BK.SPR&&BK.SPR.husk)};
   // it walks at the hero like the rest of the dead
   BK.tp(Math.round(h.x/16)-4,Math.round(h.y/16)-1);BK.P.hp=BK.P.maxHp;BK.P.venomT=0;const x0=h.x;BK.sim(60);
   out.husk.walked=Math.abs(h.x-x0)>2;
   // and killed from beside it, the cloud is the caverns' own poison
   BK.P.x=h.x+18;BK.P.hp=BK.P.maxHp;BK.P.venomT=0;const hp0=BK.P.hp;
   BKT.hurtEnemy(h,9999,h.x-10,false);BK.sim(2);const venom0=+(BK.P.venomT||0).toFixed(1);
   BK.P.inv=0;BK.sim(90);   // the gas is a wound you carry: let its first tick land
   out.husk.burst={alive:h.alive,hpLost:hp0-BK.P.hp,venom:venom0};
   // and killed from across the room it costs nothing
   const far=husks[1];
   if(far){BK.P.x=far.x+240;BK.P.hp=BK.P.maxHp;BK.P.venomT=0;BK.P.inv=0;const f0=BK.P.hp;BKT.hurtEnemy(far,9999,far.x-10,false);BK.sim(90);
    out.husk.fromAfar={hpLost:f0-BK.P.hp,venom:+(BK.P.venomT||0).toFixed(1)};}}

  /* THE DEAD APPRENTICE: an ember thrown from a distance no other dead man can reach */
  {BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
   const a=BK.enemies().filter(e=>e.alive&&e.t==='apprentice')[0];
   if(!a)return{error:'no apprentice in the tower'};
   out.apprentice={hp:a.hp,sprite:!!(BK.SPR&&BK.SPR.apprentice)};
   a.castCd=0;a.mode='walk';a.modeT=0;
   BK.tp(Math.round(a.x/16)+7,Math.round(a.y/16)-1);   // inside his throwing range, outside his reach
   let cast=null,shot=0;
   for(let i=0;i<240;i++){BK.sim(1);if(a.mode==='castTell')cast=true;const s=BK.seeds().filter(q=>!q.dead&&q.owner===a);if(s.length)shot=Math.max(shot,s.length);}
   out.apprentice.cast=!!cast;out.apprentice.embers=shot;}
  return out;})()`, 300000);

  assert.ok(!r.error, r.error);
  assert.ok(r.huskCount >= 4, 'the caverns must actually raise husks: ' + r.huskCount);
  assert.ok(r.husk.sprite && r.apprentice.sprite, 'both need their own baked frames');
  assert.ok(r.husk.hp > 60, 'the husk is twice the man a zombie is: ' + r.husk.hp);
  assert.ok(r.husk.walked, 'the husk must walk at the hero');
  assert.equal(r.husk.burst.alive, false);
  assert.ok(r.husk.burst.hpLost > 0, 'killing it close must cost health: ' + JSON.stringify(r.husk.burst));
  assert.ok(r.husk.burst.venom > 2, 'and must leave the poison on you: ' + JSON.stringify(r.husk.burst));
  if (r.husk.fromAfar) { assert.equal(r.husk.fromAfar.hpLost, 0, 'killed from across the room it costs nothing');
    assert.equal(r.husk.fromAfar.venom, 0, 'and leaves no poison'); }
  assert.ok(r.apprentice.cast, 'the apprentice must wind up his ember');
  assert.ok(r.apprentice.embers > 0, 'and it must actually leave his hand');

  assert.deepEqual(pg.errors, []);
  console.log(JSON.stringify(r));
} finally { pg.close(); }
