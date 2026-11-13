/* tools/gq5q1-reach3.mjs - final isolated check: standing at the EDGE of the "centre"/east hoist (h20-23) nearest her east spot, fresh
   fire each trial (the reach2 script's center+edge reuse of one fire window was confounded: whichever placement went first either scorched
   her - ending the fire before the second placement could be tested - or burned out the 3.0 s window). One hoist, one placement, 2 heroes.
   BRACKEN_GQ5Q1=1 node tools/gq5q1-reach3.mjs */
import { openPage } from './cdp.mjs';
process.env.BRACKEN_GQ5Q1 = '1';
const HEROES = ['knight', 'pyro'];
const pg = await openPage({ audio: false, fonts: false });
const PRE = `const {LEVELS}=await import('/src/level.js');
  const load=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);};
  const hold=()=>{if(BK.state==='card')BK.cardClose();BK.P.hp=BK.P.maxHp;};
  const wake=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let k=0;k<300;k++){hold();BK.sim(1);}return BK.boss;};
  const quiet=q=>{q.crownCd=99;q.portalCd=99;q.geodeCd=99;q.slamT=99;q.sweepT=99;q.courtT=99;q.hLeapT=99;q.decreeT=99;q.throwT2=99;q.ringT=99;};`;
try {
  const R = await pg.evalp(`(async()=>{${PRE}const HEROES=${JSON.stringify(HEROES)};const res={};
    for (const h of HEROES) {
      const r = res[h] = {};
      try {
        load(h); let q = wake(); quiet(q);
        const G5 = BK.gqHands().q5(); const geo = G5.geo(); const spots = G5.spots(); const P = BK.P;
        const hs = geo.hs[geo.hs.length - 1];   // h20-23, nearest her east spot
        for (const edgeIn of [2, 8, 16]) {   // how far IN from the deck's east edge the hero stands (closer to centre as edgeIn grows)
          q.mode = 'stand'; q.modeT = 99; q.hp = q.maxHp; q.crownOut = false;
          G5.onRing(q, null); for (let w = 0; w < 60 && G5.state().step < geo.hs.length; w++) { hold(); BK.sim(1); }
          const st0 = G5.state(); st0.side = -1;   // force east (fireStart flips st.side)
          G5.fireStart(q);
          let tellF = 0; for (; tellF < 200 && q.mode !== 'fireBurn'; tellF++) { hold(); BK.sim(1); }
          if (q.mode !== 'fireBurn') { r['in' + edgeIn] = { err: 'never reached fireBurn' }; continue; }
          P.x = hs.r - edgeIn; P.y = geo.floorY - 32; P.vx = 0; P.vy = 0; P.ground = true; P.face = 1; P.plunge = false; P.atk = -1;
          hold(); BK.sim(1);
          const onDeck = !!G5.hoistOf(P), dist = Math.round(Math.abs(P.x - q.x));
          const scorches0 = G5.state().scorches;
          let f = 0, connected = false;
          for (; f < 170 && q.mode === 'fireBurn'; f++) { hold(); if (f % 10 === 0) BK.press('atk'); BK.sim(1); if (G5.state().scorches > scorches0) { connected = true; break; } }
          r['in' + edgeIn] = { onDeck, dist, connected, elapsedS: +(f / 60).toFixed(2), stillBurning: q.mode === 'fireBurn' };
        }
      } catch (err) { r.err = String(err && err.message || err); }
    }
    return res; })()`, 900000);
  for (const h of HEROES) { const r = R[h]; if (!r || r.err) { console.log(h + ': ERR ' + (r && r.err)); continue; }
    for (const k of ['in2', 'in8', 'in16']) { const s = r[k]; if (!s) continue;
      console.log(h + ' ' + k + 'px-from-edge: dist-to-her-centre=' + s.dist + 'px connected=' + s.connected + ' (' + s.elapsedS + 's, stillBurning=' + s.stillBurning + ')');
    }
  }
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
