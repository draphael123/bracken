/* tools/gq5q1-reach2.mjs - GQ5Q1-TUNE addendum to OWED 2: does a hero simply STANDING on the deck nearest her spot (no plunge, a normal
   swing) reach her during THE THRONE FIRE, at both the west hoist (h7-10 -> her west spot) and the "centre"/east hoist (h20-23 -> her
   east spot h26.3, the queue's own question)? SCORCHED fires on "any blow / shot by a hero standing on a hoist" too (src/gq5q1.js
   E.onHurt), not only a plunge - this is the robust, timing-free answer to "does the east deck reach her for melee".
   BRACKEN_GQ5Q1=1 node tools/gq5q1-reach2.mjs */
import { openPage } from './cdp.mjs';
process.env.BRACKEN_GQ5Q1 = '1';
const HEROES = ['knight', 'warden', 'pyro'];
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
        for (const side of [-1, 1]) {
          const hi = side < 0 ? 0 : geo.hs.length - 1, hs = geo.hs[hi];
          const rr = r[side < 0 ? 'west' : 'east'] = {};
          q.mode = 'stand'; q.modeT = 99; q.hp = q.maxHp; q.crownOut = false;
          G5.onRing(q, null); for (let w = 0; w < 60 && G5.state().step < geo.hs.length; w++) { hold(); BK.sim(1); }
          const st0 = G5.state(); st0.side = side < 0 ? 1 : -1;
          G5.fireStart(q);
          let tellF = 0; for (; tellF < 200 && q.mode !== 'fireBurn'; tellF++) { hold(); BK.sim(1); }
          rr.burnReached = q.mode === 'fireBurn'; if (!rr.burnReached) { rr.err = 'never reached fireBurn'; continue; }
          rr.queenX = Math.round(q.x); rr.deckEdge = side < 0 ? hs.l : hs.r; rr.bodyGapPx = Math.round(Math.abs(q.x - (side < 0 ? hs.l : hs.r)) - (q.w || 68) / 2);
          // CENTRE of the deck first (worst case), then the EDGE nearest her (how a player would actually stand)
          for (const where of ['center', 'edge']) {
            P.x = where === 'center' ? hs.cx : (side < 0 ? hs.l + 2 : hs.r - 2); P.y = geo.floorY - 32; P.vx = 0; P.vy = 0; P.ground = true; P.face = side; P.plunge = false; P.atk = -1;
            hold(); BK.sim(1);
            const onDeckStart = !!G5.hoistOf(P), distToQueenCtr = Math.round(Math.abs(P.x - q.x));
            const scorches0 = G5.state().scorches;
            let f = 0, connected = false;
            for (; f < 90; f++) { hold(); if (f % 10 === 0) BK.press('atk'); BK.sim(1); if (G5.state().scorches > scorches0) { connected = true; break; } }
            rr[where === 'center' ? 'swing' : 'swingEdge'] = { onDeckStart, distToQueenCtr, connected, frames: f, elapsedS: +(f / 60).toFixed(2) };
          }
        }
      } catch (err) { r.err = String(err && err.message || err); }
    }
    return res; })()`, 900000);
  for (const h of HEROES) { const r = R[h]; if (!r || r.err) { console.log(h + ': ERR ' + (r && r.err)); continue; }
    for (const side of ['west', 'east']) { const s = r[side]; if (!s) continue;
      console.log(h + ' ' + side + ': bodyGapPx(her edge to deck)=' + s.bodyGapPx + ' | center dist=' + s.swing.distToQueenCtr + 'px connected=' + s.swing.connected + ' (' + s.swing.elapsedS + 's) | edge dist=' + s.swingEdge.distToQueenCtr + 'px connected=' + s.swingEdge.connected + ' (' + s.swingEdge.elapsedS + 's)');
    }
  }
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
