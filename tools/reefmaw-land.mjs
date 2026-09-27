/* tools/reefmaw-land.mjs - THE REEFMAW'S THIRD PHASE, ON LAND (docs/briefs/reef-longer.md, Daniel 2026-09-25), proved in the page:
     1. THE TIDE GOES OUT, TOLD FIRST (C1): under a third he smashes the reef (THE REEF BREAKS) while the water is still up, the water
        then drains back down to his holes, and he hauls himself out onto the dry reef and crawls
     2. THE OPENING IS CAUSED (A11): a lunge that goes past the hero - jumped, or stood over on a ledge - beaches him belly-up, and he
        is open (bossOpen) and takes double; the same lunge at a hero out of its reach stops short and beaches NOTHING
     3. THE DEATH ROLL is escapable and not a lock: caught by the lunge, three swings tear free; left alone it lets go by itself
        inside two seconds, and he cannot take hold again straight away
     4. THE TAIL: stand behind him and it comes round, and it lands
     5. HE IS ON THE REEF, NOT IN IT: the land sheet is the one drawn, and the phases before stay in the water
   Every run is seeded; the hero is refilled each frame so a blow is measured, not survived. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;let seed=4242;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const out={};
  const boot=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='reef'));BK.state='play';BK.god=false;
    const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+2,Math.round(A.floor/16)-1);BK.sim(120);
    const b=BK.enemies().find(e=>e.t==='reefmaw');for(const e of BK.enemies())if(e!==b)e.alive=false;return b;};
  const P=BK.P,K=BK.keys,fill=()=>{P.hp=P.maxHp;P.dead=0;};
  const idle=()=>{K.left=K.right=K.jump=K.atk=K.block=K.down=K.up=false;};
  const step=(n,fn)=>{for(let i=0;i<n;i++){fill();if(fn&&fn(i)===false)return false;BK.sim(1);}return true;};
  const pool=()=>(BK.L.pools||[]).find(q=>q.arenaTide);
  /* 1. THE TIDE GOES OUT */
  {const b=boot(),A=BK.L.arena;out.floor=A.floor;out.phase2Water=null;
   out.waterBefore=Math.round(pool().y);
   b.hp=Math.round(b.maxHp*0.5);step(60);out.phase2Water=Math.round(pool().y);out.phase2Land=!!b.land;out.phase2Mode=b.mode;
   b.hp=Math.round(b.maxHp*0.3);const seen=[];let waterAtSmash=null,waterMin=1e9;
   step(600,()=>{if(seen[seen.length-1]!==b.mode)seen.push(b.mode);if(b.mode==='smash'&&waterAtSmash===null)waterAtSmash=Math.round(pool().y);if(b.mode==='crawl')return false;});
   step(30);
   out.tide={seen,waterAtSmash,waterAfter:Math.round(pool().y),land:!!b.land,mode:b.mode,phase:b.phase,sheet:BK.SPR&&BK.SPR.reefmaw&&!!BK.SPR.reefmaw.land,drawnLand:(BK.step(3),b.lastSet===(BK.SPR&&BK.SPR.reefmaw&&BK.SPR.reefmaw.land))};}
  /* the land boss, set up in front of the hero, wherever the hero is */
  const landBoss=()=>{const b=boot();b.hp=Math.round(b.maxHp*0.3);step(600,()=>b.mode==='crawl'?false:undefined);b.hp=Math.round(b.maxHp*0.25);return b;};
  const place=(b,x,px,face)=>{b.x=x;b.face=face;b.mode='crawl';b.cd=9;b.grabCd=0;P.x=px;P.vx=0;P.vy=0;idle();step(10);};
  const lunge=b=>{b.mode='lungeTell';b.modeT=0.6;};
  const run=(b,n,fn)=>{const modes=[];step(n,i=>{if(fn)fn(i);if(modes[modes.length-1]!==b.mode)modes.push(b.mode);});return modes;};
  /* 2a. a lunge JUMPED beaches him */
  {const b=landBoss(),A=BK.L.arena,mid=(A.x0+A.x1)/2;place(b,mid-80,mid+40,1);lunge(b);
   const modes=run(b,90,()=>{const hd=(P.x-(b.x+b.face*40))*b.face;if(b.mode==='lunge'&&P.ground&&hd>36&&hd<150){BK.press('jump');K.jump=true;}if(!P.ground)K.jump=true;else if(b.mode!=='lunge')K.jump=false;});
   const hp0=b.hp;const open=BK.bossOpen(b);BKT.hurtEnemy(b,10,b.x-20,false);out.jumped={modes,open,took:hp0-b.hp,beachN:b.beachN||0};idle();}
  /* 2b. a lunge that passes UNDER a hero on a ledge beaches him */
  {const b=landBoss(),A=BK.L.arena,G=BK.L.grid,W=BK.L.W;let lx=null;for(let x=Math.floor(A.x0/16)+4;x<Math.floor(A.x1/16)-4&&lx===null;x++)if(G[32*W+x]===2&&G[32*W+x+1]===2&&G[32*W+x+2]===2&&G[32*W+x-1]===2)lx=x;
   place(b,Math.max(A.x0+40,lx*16-100),lx*16+8,1);P.y=32*16;step(20);const onLedge=P.ground&&Math.abs(P.y-32*16)<2;lunge(b);
   const modes=run(b,90);out.ledge={lx,onLedge,modes,beached:modes.includes('beached')};}
  /* 2c. the same lunge at a hero OUT OF ITS REACH stops short: no beaching */
  {const b=landBoss(),A=BK.L.arena;place(b,A.x0+40,A.x0+40+260,1);lunge(b);const modes=run(b,90);out.short={modes,beached:modes.includes('beached'),gap:Math.round(P.x-b.x)};}
  /* 3. caught: the death roll, torn free with three swings; and left alone, it lets go by itself */
  {const b=landBoss(),A=BK.L.arena,mid=(A.x0+A.x1)/2;place(b,mid-60,mid+40,1);lunge(b);let rollF=null,freeF=null,n=0;
   const modes=run(b,200,i=>{if(b.mode==='roll'&&rollF===null)rollF=i;if(b.mode==='roll'&&i%6===0&&P.atk<0){BK.press('atk');n++;}if(rollF!==null&&freeF===null&&b.mode!=='roll')freeF=i;});
   out.rollFree={modes,held:freeF!==null&&rollF!==null?+((freeF-rollF)/60).toFixed(2):null,presses:n,freed:b.freed||0,grabCd:+(b.grabCd||0).toFixed(1)};}
  {const b=landBoss(),A=BK.L.arena,mid=(A.x0+A.x1)/2;place(b,mid-60,mid+40,1);lunge(b);let rollF=null,endF=null;const hp0=P.hp;
   const modes=run(b,240,i=>{idle();if(b.mode==='roll'&&rollF===null)rollF=i;if(rollF!==null&&endF===null&&b.mode!=='roll')endF=i;});
   out.rollAlone={modes,held:endF!==null&&rollF!==null?+((endF-rollF)/60).toFixed(2):null,grabCd:+(b.grabCd||0).toFixed(1)};}
  /* 4. the tail: behind him */
  {const b=landBoss(),A=BK.L.arena,mid=(A.x0+A.x1)/2;place(b,mid,mid-60,1);let hurt=0;
   const modes=run(b,150,()=>{idle();if(P.hurt>0||P.inv>0.5)hurt++;});out.tail={modes,hurt:hurt>0,faceAfter:b.face};}
  out.errors=[];return out;})()`, 600000);
  console.log(JSON.stringify(r));
  const t = r.tide;
  assert.equal(r.phase2Land, false, 'the second phase must stay in the water (he was on land at half health)');
  assert.ok(r.phase2Water < r.waterBefore - 8, 'the second phase must still flood the hole (water ' + r.waterBefore + ' -> ' + r.phase2Water + ')');
  assert.ok(t.seen.includes('smash') && t.seen.indexOf('smash') < t.seen.indexOf('drain') && t.seen.indexOf('drain') < t.seen.indexOf('haul') && t.seen.includes('crawl'), 'phase three must go smash -> drain -> haul -> crawl: ' + t.seen.join(' '));
  assert.ok(t.waterAtSmash <= r.phase2Water + 2, 'THE TIDE IS TOLD BEFORE IT GOES: the water must still be up when he smashes the reef (' + t.waterAtSmash + ')');
  assert.ok(t.waterAfter >= r.floor + 4, 'the tide must be OUT once he is on the reef (water ' + t.waterAfter + ', floor ' + r.floor + ')');
  assert.ok(t.land && t.phase === 3, 'he must be on land in phase three');
  assert.ok(t.sheet && t.drawnLand, 'on land he must be drawn from his land sheet');
  assert.ok(r.jumped.modes.includes('beached'), 'a lunge JUMPED must beach him: ' + r.jumped.modes.join(' '));
  assert.ok(r.jumped.open === true, 'beached, he must be open (BK.bossOpen)');
  assert.ok(r.jumped.took >= 18, 'beached, he must take double (10 dealt, ' + r.jumped.took + ' taken)');
  assert.ok(r.ledge.onLedge && r.ledge.beached, 'a lunge passing under a hero on a ledge must beach him: ' + JSON.stringify(r.ledge));
  assert.ok(!r.short.beached && r.short.modes.includes('lunge'), 'A11: a lunge that stops short of the hero must NOT beach him: ' + JSON.stringify(r.short));
  assert.ok(r.rollFree.modes.includes('roll') && r.rollFree.freed >= 1 && r.rollFree.held !== null && r.rollFree.held < 1.2, 'three swings must tear the hero free of the roll: ' + JSON.stringify(r.rollFree));
  assert.ok(r.rollAlone.modes.includes('roll') && r.rollAlone.held !== null && r.rollAlone.held <= 1.75, 'left alone, the roll must let go by itself inside 1.75 s: ' + JSON.stringify(r.rollAlone));
  assert.ok(r.rollAlone.grabCd > 2, 'after a roll he must not be able to take hold again straight away');
  assert.ok(r.tail.modes.includes('tailTell') && r.tail.modes.includes('tail') && r.tail.hurt, 'standing behind him must bring the tail round, and it must land: ' + JSON.stringify(r.tail));
  assert.deepEqual(pg.errors, [], 'page errors');
  console.log('ok  reefmaw-land  the tide goes out (told), he comes ashore; a dodged lunge beaches him (jumped or from a ledge), a short one does not; the roll lets go; the tail lands');
} finally { pg.close(); }
