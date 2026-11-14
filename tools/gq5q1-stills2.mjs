// PAGE TOOL: launches headless Chrome
/* tools/gq5q1-stills2.mjs - fix-up: the first proof pass's "scorched"/"warded" stills never actually triggered a real SCORCHED (the
   synthetic plunge never physically overlapped her, so no real hurtEnemy0 call ever reached G5.onHurt) - both stills just show the
   burn still running. Here a REAL blow (not a plunge) lands on her while she is channelling and the hero is standing on a hoist -
   the same path E.onHurt's "onNow" branch takes, G5.onHurt(e, false) via the real combat call - then the two frames are recaptured.
   BRACKEN_GQ5Q1=1 node tools/gq5q1-stills2.mjs [stillsDir] */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
process.env.BRACKEN_GQ5Q1 = '1';
const STILLS = resolve(ROOT, process.argv[2] || join(ROOT, 'audits', 'gq5q1'));
mkdirSync(STILLS, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
const PRE = `const {LEVELS}=await import('/src/level.js');
  const load=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);};
  const hold=()=>{if(BK.state==='card')BK.cardClose();};
  const wake=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let k=0;k<300;k++){hold();BK.sim(1);}return BK.boss;};
  const quiet=q=>{q.crownCd=99;q.portalCd=99;q.geodeCd=99;q.slamT=99;q.sweepT=99;q.courtT=99;q.hLeapT=99;q.decreeT=99;q.throwT2=99;q.ringT=99;};
  const cv=document.createElement('canvas');cv.width=640;cv.height=360;const cg=cv.getContext('2d');cg.imageSmoothingEnabled=false;const shots={};
  const snap=id=>{BK.step(1);cg.drawImage(BK.buf,0,0,640,360);shots[id]=cv.toDataURL('image/png');};`;
const save = (dir, name, png) => { const f = name.replace(/[^a-z0-9.-]+/gi, '-') + '.png'; writeFileSync(join(dir, f), Buffer.from(png.split(',')[1], 'base64')); return f; };
try {
  const shots = await pg.evalp(`(async()=>{${PRE}
    load('knight'); let q=wake(); quiet(q); const G5=BK.gqHands().q5(), H=BK.gqHands(); const geo=G5.geo(); const A=BK.L.arena, P=BK.P;
    P.maxHp=9999; P.hp=9999; P.inv=0;
    // put her into a fireBurn centred near the first hoist, and the hero actually standing ON that hoist (G5.hoistOf will read true)
    H.test.ringBell(); for (let f=0; f<60 && G5.state().step<geo.hs.length; f++){hold();BK.sim(1);}
    q.mode='stand'; q.modeT=99; q.x = geo.hs[0].cx; q.y = A.floor;
    G5.state().nextFire = -1; G5.fireStart(q);
    for (let f=0; f<200 && q.mode!=='fireBurn'; f++) { hold(); BK.sim(1); }
    P.x = geo.hs[0].cx; P.y = A.floor-32; P.ground=true; P.vx=0; P.vy=0; P.face=1; P.atk=-1;
    hold(); BK.sim(1);
    const onDeck = !!G5.hoistOf(P);
    const scorches0 = G5.state().scorches;
    // a real swing: press atk repeatedly until G5.onHurt fires for real through hurtEnemy0
    let hit=false;
    for (let f=0; f<90 && !hit; f++) { hold(); if (f%8===0) BK.press('atk'); BK.sim(1); if (G5.state().scorches>scorches0) hit=true; }
    snap('scorched2');
    for (let f=0; f<40 && q.mode==='stunned'; f++) { hold(); BK.sim(1); }
    snap('warded2');
    return { onDeck, hit, shots };
  })()`, 120000).catch(err => ({ err: String(err && err.message || err).slice(0, 300) }));
  if (shots && shots.err) { console.log('FAILED: ' + shots.err); process.exitCode = 1; }
  else {
    console.log('onDeck=' + shots.onDeck + ' real-scorch-triggered=' + shots.hit);
    for (const [id, png] of Object.entries(shots.shots)) console.log('still: ' + save(STILLS, id, png));
  }
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
