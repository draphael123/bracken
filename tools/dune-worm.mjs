/* tools/dune-worm.mjs — THE DUNE WORM IN THE PAGE (docs/briefs/dune-worm.md). tools/caravan.mjs proves his machine in Node; this proves the
   game that wraps it, because every rule below is a rule about the WORLD around the machine, and a machine can be right while its hands
   are wrong:
     A3   every one of his four attacks, FORCED, winds up (a Tell the game hears: windingUp, the mark the table gives it) and then lands on a
          hero who stands in it - the breach, the spit, the lunge and the swallow's bite - and every timer he carries is a number at spawn
     C1   what hurts is where it is drawn: the breach lands only on the locked spot, and a hero one step off it is not touched
     A10  THE STORM IS HIS AND IS PHASE TWO'S: none before half, then gusts that move a hero in his hollow, gone again the moment a death takes you out of it; the sun
          goes in under it; and it is gone when he dies
     the level's rule still bites in his hollow in phase one: the open sand builds sunstroke, the rolled-out shade does not
     THE GATE AFTER HIS DEATH: the gate across the hollow does not end the level while he lives, and does once he is dead
   Page, one Chrome, this checkout's own port. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
  const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='caravan'));BK.state='play';BK.god=true;BK.sim(10);
    for(const e of BK.enemies())if(e!==BK.boss&&!e.maxHp)e.alive=false;return BK.boss;};
  let b=boot();const A=BK.L.arena,P=BK.P;
  out.spawn={t:b.t,mode:b.mode,timers:['modeT','cd','pullAcc','hurtT','phase'].map(k=>[k,b[k]])};
  BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(30);out.active=BK.bossActive;
  for(let i=0;i<200&&(b.mode==='wake'||!b.st);i++)BK.sim(1);
  const W=b.st,w=BK.caravan().winches.find(q=>q.hollow);
  /* A3: each attack forced from the chain's own index, a hero (not god) standing where it lands */
  /* EACH TEST STARTS COOL: the sun keeps working in the hollow (its own test is below), and since it fills in 6 s and BUILDS at full
     (2026-09-25) the sunstroke taken over the forced attacks before a test was being counted as that test's blow - the breach's C1
     read 4 damage "one step off the spot" that was the sun's. P.sun is put back to cool where each test starts, so each measures its own blow */
  const force=(idx,what,stand)=>{BK.god=false;P.hp=P.maxHp;P.dead=0;P.inv=0;P.sun={v:0};w.out=w.k=0;W.mode='under';W.t=0;W.i=idx;W.order=['spit','lunge','swallow'];W.ripples=[];let tell=null,mark=null,heard=false,blow=null,hp0=P.hp,took=0;
    for(let f=0;f<60*5;f++){P.inv=0;const tx=stand();if(tx!==null){P.x=tx;P.y=A.floor;P.vx=0;}const before=P.hp;BK.sim(1);took+=Math.max(0,before-P.hp);P.hp=Math.max(P.hp,40);
      if(/Tell$/.test(b.mode)&&!tell){tell=b.mode;mark=BK.markOf(b);heard=BK.telling(b);}
      if(tell&&!/Tell$/.test(b.mode)&&!blow)blow=b.mode;
      if(tell&&blow&&took>0)break;}
    BK.god=true;return {what,tell,mark,heard,blow,took};};
  out.ripple=force(0,'ripple',()=>A.x0+200);
  out.spit=force(1,'spit',()=>W.mode==='spitTell'||W.mode==='spit'?W.x+W.face*70:null);
  out.lunge=force(3,'lunge',()=>W.mode==='lunge'||W.mode==='lungeTell'?W.lungeTo:A.x0+300);
  out.swallow=force(5,'swallow',()=>W.pit?W.pit.x:A.x0+250);
  /* C1: one step off the locked spot and the breach does not touch you */
  {BK.god=false;P.hp=P.maxHp;P.dead=0;P.sun={v:0};W.mode='under';W.t=0;W.i=0;W.ripples=[];let took=0,left=false;
   for(let f=0;f<60*3&&W.mode!=='surfaced';f++){P.inv=0;if(!left){P.x=A.x0+220;P.y=A.floor;}if(!left&&W.ripples.some(q=>q.real&&q.commit)){left=true;P.x=A.x0+220+40;}const h0=P.hp;BK.sim(1);took+=Math.max(0,h0-P.hp);}
   out.offSpot={took};BK.god=true;}
  /* THE SUN in phase one: open sand builds it; under the rolled-out shade it does not */
  const sunAt=(x,secs)=>{w.out=w.k=1;P.sun={v:0};for(let f=0;f<secs*60;f++){P.x=x;P.y=A.floor;P.vx=0;W.mode='sleepy';BK.sim(1);}return +P.sun.v.toFixed(2);};
  out.sun={open:sunAt(A.x1-60,4),shade:sunAt((w.canopy.x0+w.canopy.x1+1)*8,4),storm0:!!BK.caravan().storm};
  /* A10: the storm - none before half; at half he calls it; a gust moves a hero in the hollow and does not move one outside it */
  W.mode='under';W.t=0;b.hp=Math.floor(b.maxHp*0.45);BK.sim(2);const cv=BK.caravan();out.storm={called:!!cv.storm,phase:b.phase};
  const gust=(x)=>{cv.storm.phase='gust';cv.storm.t=1.6;cv.storm.dir=1;let moved=0;for(let f=0;f<50;f++){W.mode='sleepy';P.y=A.floor;const x0=P.x;BK.sim(1);moved+=P.x-x0;}return Math.round(moved);};
  P.x=A.x0+200;P.y=A.floor;out.storm.inHollow=gust();
  P.sun={v:0};for(let f=0;f<240;f++){P.x=A.x1-60;P.y=A.floor;W.mode='sleepy';BK.sim(1);}out.storm.sunInStorm=+P.sun.v.toFixed(2);
  /* AND IT NEVER LEAVES HIS HOLLOW: the walls hold you in while it blows, and a death - the only way out mid-fight - wakes you at the shrine
     outside with the fight put back, the storm with it */
  {const hp=b.hp;BKT.respawn();BK.sim(2);const b2=BK.boss;out.storm.retry={storm:!!BK.caravan().storm,active:BK.bossActive,outside:BK.P.x<A.x0,mode:b2&&b2.mode};
   b=b2;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(30);for(let i=0;i<200&&(b.mode==='wake'||!b.st);i++)BK.sim(1);}
  const W2=b.st;
  /* THE GATE: not while he lives; once he is dead, yes */
  const G=BK.L.ents.find(e=>e.t==='gate');const stand=()=>{P.x=G.x*16+8;P.y=(G.y+1)*16;P.vx=0;};
  W2.mode='sleepy';for(let f=0;f<60;f++){stand();W2.mode='sleepy';BK.sim(1);}out.gate={alive:BK.state};
  W2.mode='surfaced';W2.t=9;BKT.hurtEnemy(b,99999,b.x-10,false);   /* up out of the sand, where a blow lands */for(let f=0;f<60*4&&!BK.L.gateOpen;f++)BK.sim(1);out.gate.dead=b.alive;out.gate.open=!!BK.L.gateOpen;out.gate.stormAfter=!!BK.caravan().storm;
  for(let f=0;f<60*3&&BK.state==='play';f++){stand();BK.sim(1);}out.gate.after=BK.state;
  return out;})()`, 600000);
  console.log(JSON.stringify(r));
  assert.equal(r.spawn.t, 'duneworm'); assert.equal(r.spawn.mode, 'sleep', 'he sleeps under the sand until the hollow is crossed');
  for (const [k, v] of r.spawn.timers) assert.ok(typeof v === 'number' && Number.isFinite(v), 'A3: every timer a number at spawn: ' + k + '=' + v);
  assert.ok(r.active, 'crossing the trigger starts the fight');
  const want = { ripple: ['rippleTell', '!!', 'breach'], spit: ['spitTell', '!', 'spit'], lunge: ['lungeTell', '!!', 'lunge'], swallow: ['swallowTell', '!!', 'swallow'] };
  for (const [k, [tell, mark, blow]] of Object.entries(want)) { const x = r[k];
    assert.equal(x.tell, tell, 'A1/A3: ' + k + ' is told by ' + tell + ': ' + JSON.stringify(x));
    assert.equal(x.mark, mark, k + ': the mark over it is ' + mark + ' (src/marks.js): ' + JSON.stringify(x));
    assert.ok(x.heard, 'A2: ' + k + ' winds up in windingUp() (its sound): ' + JSON.stringify(x));
    assert.equal(x.blow, blow, k + ': the tell hands to its blow: ' + JSON.stringify(x));
    assert.ok(x.took > 0, 'A3: ' + k + ' FIRES: it lands on a hero standing in it: ' + JSON.stringify(x)); }
  assert.equal(r.offSpot.took, 0, 'C1: one step off the locked spot, the breach does not touch you: ' + JSON.stringify(r.offSpot));
  assert.ok(r.sun.open > 0.3 && r.sun.shade === 0 && !r.sun.storm0, 'phase one: the sun works in his hollow, and his rolled-out shade is shade: ' + JSON.stringify(r.sun));
  assert.ok(r.storm.called && r.storm.phase === 2, 'A10: at half he calls the storm: ' + JSON.stringify(r.storm));
  assert.ok(Math.abs(r.storm.inHollow) > 20, 'a gust moves a hero in his hollow: ' + JSON.stringify(r.storm));
  assert.ok(!r.storm.retry.storm && !r.storm.retry.active && r.storm.retry.outside && r.storm.retry.mode === 'sleep', 'a death wakes you outside his hollow with no storm and the fight put back: no storm in the level (Daniel): ' + JSON.stringify(r.storm));
  assert.equal(r.storm.sunInStorm, 0, 'the sun goes in under his storm: ' + JSON.stringify(r.storm));
  assert.equal(r.gate.alive, 'play', 'the gate across the hollow does not end the level while he lives: ' + JSON.stringify(r.gate));
  assert.ok(!r.gate.dead && r.gate.open && !r.gate.stormAfter, 'he dies, the gate opens and his storm goes with him: ' + JSON.stringify(r.gate));
  assert.notEqual(r.gate.after, 'play', 'and the gate ends the level: ' + JSON.stringify(r.gate));
  assert.deepEqual(pg.errors, []);
  console.log('dune-worm: four told attacks forced and landed, the breach true to its spot, the storm his and phase two\'s, the sun in his hollow, the gate after his death.');
} finally { pg.close(); }
