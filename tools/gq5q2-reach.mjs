// PAGE TOOL: launches headless Chrome
/* tools/gq5q2-reach.mjs - GQ5Q2-TUNE BROWSER OWED 2: the 9-hero rope reach, real page physics, flag ON.
   Each hero stands on the deck west of the rope (x = rope.x-16, y=floor), forced into the real perched/WARDED window
   (G52.perchStart -> perchGo, real engine state), faces the rope, then strikes it with:
     blow  - a standing basic attack ('atk')
     shot  - whatever that hero's basic attack actually produces when it is a ranged weapon (ranger's arrow, pirate's
             pistol tracer, pyro's ember, warden's hammer, geomancer's stone, reaper's scythe) - the SAME heroStrikes
             array (src/hero-strikes.js: eachSeat/attackBox/embers/tracers/hammers/scythe/stones) the rope itself reads,
             so this is a real collision test, not a re-implementation.
   Reads G52.perchPhase() === 'swing' as "rings: yes" (the real ringRope() transition).
   BRACKEN_GQ5Q2=1 node tools/gq5q2-reach.mjs */
import { openPage } from './cdp.mjs';
process.env.BRACKEN_GQ5Q2 = '1';
const HEROES = ['knight', 'warden', 'geomancer', 'ranger', 'berserker', 'pyro', 'paladin', 'pirate', 'reaper'];
const pg = await openPage({ audio: false, fonts: false });
const PRE = `const {LEVELS}=await import('/src/level.js');
  const hold=()=>{if(BK.state==='card')BK.cardClose();BK.P.hp=BK.P.maxHp;};
  const load=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);
    const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let k=0;k<300;k++){hold();BK.sim(1);} /* (GQ5Q2-TUNE reach fix: the hall trigger must actually fire so G52 (BK.gqHands().q52()) exists before toRoof()) */};
  const run=n=>{for(let i=0;i<n;i++){hold();BK.sim(1);}};
  const quiet=q=>{q.crownCd=99;q.portalCd=99;q.geodeCd=99;q.slamT=99;q.sweepT=99;q.courtT=99;q.hLeapT=99;q.decreeT=99;q.throwT2=99;q.ringT=99;};
  const toRoof=()=>{const q=BK.boss;q.hp=2;const hu=BK.hurt||(BK.env&&BK.env().hurt);if(hu)hu(q,50,BK.P.x);run(140);const H=BK.gqHands();H.skipRoof();run(90);return BK.boss;};
  const tap=n=>{for(let i=0;i<(n||10);i++){BK.keys.atk=(i%6)<2;if(i%6===0)BK.press('atk');hold();BK.sim(1);}BK.keys.atk=false;};`;
try {
  const A = await pg.evalp(`(async()=>{${PRE}const HEROES=${JSON.stringify(HEROES)};const res={};
    for (const h of HEROES) {
      const r = res[h] = {};
      try {
        load(h); let q=toRoof(); quiet(q); const H=BK.gqHands(); const G52=H.q52();
        const A=BK.L.arena;
        for (const kind of ['blow', 'shot']) {
          // fresh perch each attempt (idle -> tell -> perched)
          G52.state().perch.phase='idle'; G52.state().perch.nextAt=0;
          q.mode='roofStand'; q.modeT=99; q.vx=0;
          G52.perchStart(q);
          for (let i=0;i<60 && q.mode!=='perch'; i++){hold();BK.sim(1);}
          const rp = G52.rope ? G52.rope() : null;
          if (!rp) { r[kind]={err:'no rope geometry'}; continue; }
          BK.P.x = rp.x - 16; BK.P.y = A.floor; BK.P.vx = 0; BK.P.vy = 0; BK.P.ground = true; BK.P.face = 1;
          hold(); BK.sim(1);
          const before = G52.perchPhase();
          if (kind === 'blow') tap(14); else { BK.keys.down=false; tap(14); /* the hero's own basic attack is its ranged weapon for ranged heroes: ranger bow, pirate pistol, pyro ember, warden hammer-throw, geomancer stone, reaper scythe */ }
          let rang = false; for (let i=0;i<30 && !rang;i++){ hold(); BK.sim(1); if (G52.perchPhase()==='swing') rang = true; }
          r[kind] = { before, after: G52.perchPhase(), rang, px: Math.round(BK.P.x), ropeX: Math.round(rp.x) };
        }
      } catch (err) { r.err = String(err && err.message || err); }
    }
    return res; })()`, 300000);
  console.log('GQ5Q2 OWED 2 - 9-hero rope reach (standing at rope.x-16, forced perched/WARDED window):');
  console.log('  hero          blow-rings   shot-rings');
  for (const h of HEROES) { const r = A[h]; if (!r || r.err) { console.log('  ' + h.padEnd(12) + 'ERR ' + (r && r.err)); continue; }
    console.log('  ' + h.padEnd(12) + (r.blow && r.blow.rang ? 'yes' : 'NO ').padEnd(12) + (r.shot && r.shot.rang ? 'yes' : 'NO'));
  }
  console.log('\\nraw: ' + JSON.stringify(A));
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
