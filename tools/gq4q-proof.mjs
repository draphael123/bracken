// PAGE TOOL: launches headless Chrome
/* tools/gq4q-proof.mjs [outDir] - THE GQ4Q PROOF IN THE REAL PAGE (claude/gq4q-d): BRACKEN_GQ4Q=1 (+ BRACKEN_GQ4L=1 for the tower/room geometry the Queen sits in).
     A  every hero (all nine) knocks a P1 portal shard OUT (src/hero-strikes.js: a blow, an arrow, an ember, a pistol ball, ...) and sends a P2 shard HOME (her bar drops)
     B  six shards home inside 10 s = DAZED then a ward (shards glance); the ENRAGE fires once at 25%
     C  stills: the hearth jet, the sceptre reach, the bombardment, THE MOUNTAIN FALLS  -> outDir (default work/claude/shots/gq4q)
   ONE headless page (>= 1500 MB free; no BROWSER-HOLD.flag). Not in the suite.
     BRACKEN_GQ4Q=1 BRACKEN_GQ4L=1 node tools/gq4q-proof.mjs <outDir> [heroes,comma] */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
process.env.BRACKEN_GQ4Q = '1'; if (process.env.BRACKEN_GQ4L === undefined) process.env.BRACKEN_GQ4L = '1';
const dir = resolve(ROOT, process.argv[2] || 'work/claude/shots/gq4q'); mkdirSync(dir, { recursive: true });
const HEROES = (process.argv[3] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer,berserker,ranger').split(',');
const pg = await openPage({ audio: false, fonts: false });
const PRE = `const {LEVELS}=await import('/src/level.js');
  const load=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);};
  const hold=()=>{if(BK.state==='card')BK.cardClose();BK.P.hp=BK.P.maxHp;BK.P.inv=Math.max(BK.P.inv||0,0.0);BK.P.st=BK.P.maxSt||BK.P.st;};
  const wake=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let k=0;k<300;k++){hold();BK.sim(1);}return BK.boss;};
  const run=n=>{for(let i=0;i<n;i++){hold();BK.sim(1);}};
  const quiet=q=>{q.crownCd=99;q.portalCd=99;q.geodeCd=99;q.slamT=99;q.sweepT=99;q.courtT=99;q.hLeapT=99;q.decreeT=99;q.throwT2=99;q.ringT=99;};
  const toRoof=()=>{const q=BK.boss;q.hp=2;const hu=BK.hurt||(BK.env&&BK.env().hurt);if(hu)hu(q,50,BK.P.x);run(140);const H=BK.gqHands();H.skipRoof();run(90);return BK.boss;};
  const cv=document.createElement('canvas');cv.width=640;cv.height=360;const cg=cv.getContext('2d');cg.imageSmoothingEnabled=false;const shots={};
  const snap=id=>{BK.step(1);cg.drawImage(BK.buf,0,0,640,360);shots[id]=cv.toDataURL('image/png');};
  const tap=(i,n)=>{if(i%(n||8)===0)BK.press('atk');BK.keys.atk=(i%(n||8))<3;};`;
try {
  const A = await pg.evalp(`(async()=>{${PRE}const HEROES=${JSON.stringify(HEROES)};const res={};
    for(const h of HEROES){ const r=res[h]={};
      try{
      // P1: a portal shard walks at him; he strikes it
      load(h);let q=wake();quiet(q);{const A=BK.L.arena;q.x=A.x1-90;q.y=A.floor;q.vx=0;q.mode='stand';q.modeT=99;BK.P.x=A.x0+240;BK.P.y=A.floor;BK.P.face=1;}
      const H=BK.gqHands();const k0=H.test.knocked();let hurt0=0;
      H.test.spawnShard({x:BK.P.x+70,y:BK.P.y-10,vx:-70,vy:0});
      for(let i=0;i<150;i++){hold();BK.P.face=1;tap(i);BK.sim(1);}BK.keys.atk=false;
      r.p1Knocked=H.test.knocked()-k0;r.p1Left=BK.gqShots().filter(s=>s.kind==='rock').length;
      // P2: a stone shard struck home -> her bar drops 3%
      load(h);q=wake();q=toRoof();r.stage=BK.gqStage();
      const R=BK.gqHands().test.q4();r.hasQ4=!!R;
      {const A=BK.L.arena;quiet(q);q.mode='roofStand';q.modeT=99;q.x=A.x0+380;q.y=A.floor;q.vx=0;BK.P.x=A.x0+240;BK.P.y=A.floor;BK.P.face=1;}
      const hp0=q.hp,t0=BK.gqHands().test.homeTotal();
      BK.gqHands().test.spawnShard({p2:true,x:BK.P.x+70,y:BK.P.y-10,vx:-70,vy:0,dmg:4});
      for(let i=0;i<200;i++){hold();BK.P.face=1;tap(i);BK.sim(1);}BK.keys.atk=false;
      r.p2Home=BK.gqHands().test.homeTotal()-t0;r.p2HpDropPct=Math.round(1000*(hp0-q.hp)/q.maxHp)/10;
      }catch(err){r.err=String(err&&err.message||err);}
    }
    return res;})()`, 900000);
  console.log('A', JSON.stringify(A));
  const B = await pg.evalp(`(async()=>{${PRE}const res={};
    load('knight');let q=wake();q=toRoof();const H=BK.gqHands(),A=BK.L.arena;quiet(q);q.mode='roofStand';q.modeT=99;q.x=A.x0+380;q.y=A.floor;BK.P.x=A.x0+240;BK.P.y=A.floor;BK.P.face=1;
    const d0=H.test.dazes();for(let k=0;k<6;k++){H.test.spawnShard({p2:true,home:true,x:q.x-20,y:q.y-30,vx:0,vy:0});run(8);}
    run(12);res.daze={dazes:H.test.dazes()-d0,mode:q.mode,open:BK.bossOpen(q)};run(160);res.ward={ward:!!(H.test.q4()&&H.test.q4().ward>0)};
    {const hp1=q.hp;H.test.spawnShard({p2:true,home:true,x:q.x-20,y:q.y-30});run(20);res.wardGlance=hp1===q.hp;}
    // enrage: once
    load('knight');q=wake();q=toRoof();quiet(q);q.mode='roofStand';q.modeT=0;q.hp=Math.round(q.maxHp*0.24);const r0=BK.gqHands().test.rages();run(240);const r1=BK.gqHands().test.rages();
    q.hp=Math.round(q.maxHp*0.2);run(300);res.rage={first:r1-r0,total:BK.gqHands().test.rages()-r0,tempo:BK.gqHands().rageOn()};
    return res;})()`, 900000);
  console.log('B', JSON.stringify(B));
  const C = await pg.evalp(`(async()=>{${PRE}const res={};
    // the hall: hearth jet, reach
    load('knight');let q=wake();quiet(q);const H=BK.gqHands(),A=BK.L.arena;BK.P.x=A.x0+300;BK.P.y=A.floor;BK.P.face=1;q.x=A.x1-100;q.y=A.floor;q.vx=0;q.mode='stand';q.modeT=99;
    H.test.startQ4('hearth');run(40);snap('hearth-jet-tell');const hp0=BK.P.hp;let jetHit=0;for(let i=0;i<50;i++){BK.P.hp=BK.P.maxHp;BK.sim(1);if(i===8)snap('hearth-jet-fire');}
    quiet(q);q.mode='stand';q.modeT=99;BK.P.x=A.x0+300;BK.P.y=A.floor;H.test.startQ4('reach');run(34);snap('sceptre-reach-tell');run(32);snap('sceptre-reach-jab');
    // the tower top: bombardment, the mountain
    load('knight');q=wake();q=toRoof();quiet(q);const H2=BK.gqHands(),A2=BK.L.arena;BK.P.x=A2.x0+240;BK.P.y=A2.floor;BK.P.face=1;q.mode='roofStand';q.modeT=99;q.x=A2.x0+380;
    H2.test.startQ4('bombard');run(70);snap('bombardment-cupola');run(60);snap('bombardment-volley');run(200);
    BK.P.x=A2.x0+240;BK.P.y=A2.floor;q.mode='roofStand';q.modeT=99;H2.test.startQ4('mountain');run(80);snap('mountain-falls-tell');run(60);snap('mountain-falls-rocks');run(40);snap('mountain-falls-geode');run(90);snap('mountain-falls-shards');
    return {shots,res};})()`, 900000);
  for (const [id, png] of Object.entries(C.shots)) writeFileSync(join(dir, id + '.png'), Buffer.from(png.split(',')[1], 'base64'));
  console.log('C', Object.keys(C.shots).length, 'stills ->', dir, JSON.stringify(C.res));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
