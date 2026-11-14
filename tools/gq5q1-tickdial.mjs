/* tools/gq5q1-tickdial.mjs - OWED 3a, the burn-tick damage dial, fixed twice now:
     pass 1: used the default fresh knight (maxHp 100) - one tick saturated his whole bar, unreadable.
     pass 2: set the fake fire's F.tB (tick-origin time) to 0 instead of the CURRENT absolute clock (tn()) - since real play always
       sets F.tB = tn() in burnBegin(), a stale tB=0 made `t = tn() - 0` already far past every tick boundary, so ALL SIX ticks fired
       in the SAME frame (30 raw, scaled up by BOSS_HIT.gqueen etc. to ~102) - a test-harness bug reading as a false "one tick = 102".
   pass 3 (this one): F.tB = the real current tn(), so ticks land one at a time, 0.5 s apart, exactly as burnBegin() does it in real play.
   Run per hero (knight/warden/pyro) at a big health buffer so no tick's damage saturates / clips at 0.
   BRACKEN_GQ5Q1=1 node tools/gq5q1-tickdial.mjs */
import { openPage } from './cdp.mjs';
process.env.BRACKEN_GQ5Q1 = '1';
const HEROES = ['knight', 'warden', 'pyro'];
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const {LEVELS}=await import('/src/level.js');
    const HEROES=${JSON.stringify(HEROES)}; const res={};
    for (const h of HEROES) {
      BK.manualSimulation=true; BK.SET.speed=1; BK.setHero(h); BK.reset({fresh:true}); BK.load(LEVELS.findIndex(l=>l.id==='crown')); BK.state='play'; BK.god=false; BK.sim(5);
      const A=BK.L.arena; BK.tp(Math.round(A.trigger/16)+1, Math.round(A.floor/16)-1);
      for (let k=0;k<300;k++){BK.P.hp=BK.P.maxHp;BK.sim(1);}
      let q=BK.boss; q.crownCd=99;q.portalCd=99;q.geodeCd=99;q.slamT=99;q.sweepT=99;q.courtT=99;q.hLeapT=99;q.decreeT=99;q.throwT2=99;q.ringT=99;
      const P=BK.P; P.maxHp=5000; P.hp=5000; P.inv=0; P.dead=false;
      BK.tp((A.x0+18*16)/16, A.floor/16-1); P.hp=5000; P.inv=0; P.ground=true;
      const G5=BK.gqHands().q5();
      q.mode='fireBurn'; q.modeT=3;
      // tn() (the module's absolute clock, env.now()) is not exported - borrow a REAL read of it: onRing stamps st.ringAt = tn() on
      // a genuine call, so ring (harmlessly; the hoists rising does not affect this test) and read that back as "now"
      G5.onRing(q, null); const t0 = G5.state().ringAt;
      G5.state().fire = { phase:'burn', t0, side:1, spotX:q.x, hearthX:q.x, tickN:0, tB:t0, ringSaid:0 };
      const ticks=[]; let lastHp=P.hp;
      for (let f=0; f<240 && ticks.length<6; f++) { BK.sim(1); if (P.hp!==lastHp) { ticks.push(Math.round(lastHp-P.hp)); lastHp=P.hp; } if (!G5.state().fire) break; }
      res[h] = { maxHp: P.maxHp, ticks, total: ticks.reduce((a,b)=>a+b,0) };
    }
    return res;
  })()`, 90000);
  for (const h of HEROES) { const x = r[h];
    console.log(h + ': ticks=[' + x.ticks.join(',') + '] total=' + x.total + ' (raw design: 6 ticks of 5 = 30; x' + (x.total && x.ticks.length ? (x.ticks[0] / 5).toFixed(2) : '?') + ' the raw number on tick 1; BOSS_HIT.gqueen=2.15 -> expect ~11/tick, ~65 total if that is the only multiplier)');
  }
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
