// PAGE TOOL: launches headless Chrome
/* tools/gq5q2-tickdial.mjs - GQ5Q2 TUNE: per-hero damage dial check (the gq5q1-d bug class, c308664ee: a brand-new move inheriting
   DUEL_HERO.gqueen.pyro=2.2 that the brief never meant). Measures ONE real hit of THE SWEEP and ONE real hit of THE HATCH ERUPTS
   on knight / warden / pyro at a big health buffer (no clipping), using the engine's own exposed API (G52.state(), G52.sweepStart)
   so the damage goes through the REAL chain: gqHit/gqRed -> ctx.damage -> damagePlayer0 -> BOSS_HIT.gqueen * DUEL_HERO.gqueen[hero].
   BRACKEN_GQ5Q2=1 node tools/gq5q2-tickdial.mjs */
import { openPage } from './cdp.mjs';
process.env.BRACKEN_GQ5Q2 = '1';
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
      // to the roof
      q.hp=2; const hu=BK.hurt||(BK.env&&BK.env().hurt); if(hu) hu(q,50,BK.P.x);
      for(let i=0;i<140;i++){P.hp=5000;BK.sim(1);}
      const H=BK.gqHands(); H.skipRoof();
      for(let i=0;i<90;i++){P.hp=5000;BK.sim(1);}
      const G52=H.q52(); const row=res[h]={};
      // ---- THE SWEEP: force her into range, cd=0, call the real sweepStart, run to the real cut ----
      {
        q.mode='roofStand'; q.modeT=99; q.x=P.x+30; q.y=A.floor; q.vx=0; q.face=-1; P.face=1; P.y=A.floor; P.ground=true; P.x=q.x-30; P.hp=5000;
        const st=G52.state(); st.sweep.cd=0;
        G52.sweepStart(q);
        // DO NOT re-pin P.hp inside this loop - the hit itself must be allowed to show (gq5q1-tickdial's own lesson: a hp reset
        // in the same loop as the damage erases it before it can be read back)
        let lastHp=P.hp, drop=0; for(let i=0;i<120 && q.mode!=='rec';i++){P.ground=true;BK.sim(1); if (P.hp<lastHp && !drop) drop=lastHp-P.hp; lastHp=P.hp;}
        row.sweep={ hit: Math.round(drop), mode:q.mode };
      }
      // ---- THE HATCH ERUPTS: cut her to just under 50% so the real armed+first-timer fires it naturally, stand the hero in the real column ----
      {
        const Tw = (BK.L.arena && BK.L.arena.tower) || (BK.L.arenaRoof && BK.L.arenaRoof.tower);
        const c0=Tw.HATCH.cols[0], x0=c0*16, w=2*16;
        P.hp=5000; q.hp = Math.round(q.maxHp*0.5)-1;
        let lastHp=P.hp, drop=0, fired=false;
        for (let i=0;i<60*20 && !fired; i++){ P.x=x0+w/2; P.y=A.floor; P.ground=true; BK.sim(1); if (P.hp<lastHp && !drop) drop=lastHp-P.hp; lastHp=P.hp; const hs=G52.state().hatch; if (hs.phase==='fire' && hs.hits && hs.hits.size>0) fired=true; }
        row.hatch={ hit: Math.round(drop), fired };
      }
      res[h]=row;
    }
    return res;
  })()`, 180000);
  console.log('GQ5Q2 per-hero damage dial (sweep release, hatch eruption - one real hit each, real damagePlayer0 chain):');
  for (const h of HEROES) console.log('  ' + h + ': sweep=' + JSON.stringify(r[h].sweep) + '  hatch=' + JSON.stringify(r[h].hatch));
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
