/* tools/gq5q1-reach.mjs [outDir] - GQ5Q1-TUNE BROWSER OWED 2: the 7(+2)-hero hoist reach walk, real page physics, flag ON.
     For each playable hero and each of the three hoists (h7-10 west, h13-16 mid, h20-23 "centre"/east):
       A  a standing jump from the floor in the hoist's own footprint lands on the raised deck (real tile collision, not scripted)
       B  after a ring, a hero already standing in the slot is CARRIED up (never below the floor) and SET DOWN at the sink (~8.5 s)
       C  a plunge off the nearest deck reaches her channel spot: west hoist (h7-10) -> her west spot (h4.5); the "east"/centre hoist
          (h20-23) -> her east spot (h26.3) - the queue's own question, answered with real numbers (gap vs. distance covered)
   ONE headless page (>= 1500 MB free; no BROWSER-HOLD.flag). BRACKEN_GQ5Q1=1 node tools/gq5q1-reach.mjs <outDir> */
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
process.env.BRACKEN_GQ5Q1 = '1';
const dir = resolve(ROOT, process.argv[2] || 'work/claude/shots/gq5q1-reach'); mkdirSync(dir, { recursive: true });
const HEROES = ['knight', 'warden', 'geomancer', 'ranger', 'berserker', 'pyro', 'paladin', 'pirate', 'reaper'];   // src/hero-roster.js HERO_IDS (9; the brief said 7, see report)
const pg = await openPage({ audio: false, fonts: false });
const PRE = `const {LEVELS}=await import('/src/level.js');
  const load=h=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='crown'));BK.state='play';BK.god=false;BK.sim(5);};
  const hold=()=>{if(BK.state==='card')BK.cardClose();BK.P.hp=BK.P.maxHp;};
  const wake=()=>{const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);for(let k=0;k<300;k++){hold();BK.sim(1);}return BK.boss;};
  const quiet=q=>{q.crownCd=99;q.portalCd=99;q.geodeCd=99;q.slamT=99;q.sweepT=99;q.courtT=99;q.hLeapT=99;q.decreeT=99;q.throwT2=99;q.ringT=99;};`;
try {
  const A = await pg.evalp(`(async()=>{${PRE}const HEROES=${JSON.stringify(HEROES)};const res={};
    for (const h of HEROES) {
      const r = res[h] = {};
      try {
        load(h); let q = wake(); quiet(q); q.mode = 'stand'; q.modeT = 99; q.vx = 0;
        const G5 = BK.gqHands().q5(); const geo = G5.geo();
        r.geo = { floorY: geo.floorY, hs: geo.hs.map(x => ({ l: x.l, r: x.r, cx: x.cx })) };
        const P = BK.P;

        // ---- B: CARRY (hoist 0, the one nearest her west spot) - stand in the slot, THEN ring, track every frame ----
        BK.tp(geo.hs[0].cx / 16, Math.round(geo.floorY / 16) - 1); P.x = geo.hs[0].cx; P.y = geo.floorY; P.vx = 0; P.vy = 0; P.ground = true; P.face = 1;
        let belowFloor = false, setDownAt = null, maxRise = 0, firstTop = null;
        if (h === HEROES[0]) BK.gqHands().test.ringBell(); else G5.onRing(q, null);   /* the first hero proves the REAL ring path (BW.struck -> ringIt -> G5.onRing); the rest use onRing directly to skip the 16 s cooldown wait */
        for (let f = 0; f < 650; f++) {
          hold(); BK.sim(1); const age = f / 60;
          if (P.y > geo.floorY + 0.5) belowFloor = true;
          if (geo.floorY - P.y > maxRise) maxRise = geo.floorY - P.y;
          if (firstTop === null && G5.state().step === geo.hs.length ? false : false) {}
          if (setDownAt === null && age > 1 && G5.state().step === 0) setDownAt = +age.toFixed(2);
        }
        r.carry = { neverBelowFloor: !belowFloor, maxRisePx: Math.round(maxRise), setDownAt };

        // ---- A: JUMP ONTO THE DECK (real standing jump, real tile collision) - one fresh ring covers all three hoists at once ----
        for (let w = 0; w < 300 && G5.state().phase !== 'down'; w++) { hold(); BK.sim(1); }
        G5.onRing(q, null);
        for (let w = 0; w < 60 && G5.state().step < geo.hs.length; w++) { hold(); BK.sim(1); }   // rows is really 2, but read geo.hs.length defensively
        r.jump = {};
        for (let hi = 0; hi < geo.hs.length; hi++) {
          const hs = geo.hs[hi];
          P.x = hs.cx; P.y = geo.floorY; P.vx = 0; P.vy = 0; P.ground = true; P.face = 1; P.jbuf = 0; P.coyote = 0;
          hold(); BK.sim(1);
          P.vy = -320; P.ground = false;   // the game's own standing-jump velocity (src/hero-move.js MOVE.JUMPV)
          let landed = false, apex = P.y;
          for (let f = 0; f < 90; f++) { hold(); BK.sim(1); if (P.y < apex) apex = P.y; if (P.ground) { landed = !!G5.hoistOf(P); break; } }
          r.jump['hoist' + hi] = { landed, risePx: Math.round(geo.floorY - apex) };
        }
      } catch (err) { r.err = String(err && err.message || err); }
    }
    return res; })()`, 900000);
  console.log('A/B (per hero, hoist geometry + jump-on + carry):');
  for (const h of HEROES) { const r = A[h]; if (!r || r.err) { console.log('  ' + h + ': ERR ' + (r && r.err)); continue; }
    console.log('  ' + h + ': carry neverBelowFloor=' + r.carry.neverBelowFloor + ' maxRise=' + r.carry.maxRisePx + 'px setDownAt=' + r.carry.setDownAt + 's | jump ' +
      Object.entries(r.jump).map(([k, v]) => k + '=' + (v.landed ? 'LANDED(' + v.risePx + 'px)' : 'MISS(' + v.risePx + 'px)')).join(' '));
  }

  // ---- C: PLUNGE REACH - west hoist (h7-10) -> her west spot; "east"/centre hoist (h20-23) -> her east spot (h26.3) ----
  const C = await pg.evalp(`(async()=>{${PRE}const HEROES=${JSON.stringify(HEROES)};const res={};
    for (const h of HEROES) {
      const r = res[h] = {};
      try {
        load(h); let q = wake(); quiet(q);
        const G5 = BK.gqHands().q5(); const geo = G5.geo(); const spots = G5.spots(); const P = BK.P;
        r.spots = spots; r.hoistCx = geo.hs.map(x => x.cx);
        for (const side of [-1, 1]) {   // -1 west (hoist 0), +1 east/centre (the last hoist, h20-23)
          const hi = side < 0 ? 0 : geo.hs.length - 1, hs = geo.hs[hi], spotX = spots[side < 0 ? 0 : 1];
          const rr = r[side < 0 ? 'west' : 'east'] = {};
          rr.gapPx = Math.round(Math.abs(spotX - (side < 0 ? hs.l : hs.r)));
          // force the fire to the wanted side, hoists up, boss planted at her spot
          q.mode = 'stand'; q.modeT = 99; q.hp = q.maxHp; q.crownOut = false;
          G5.onRing(q, null); for (let w = 0; w < 60 && G5.state().step < geo.hs.length; w++) { hold(); BK.sim(1); }
          const st0 = G5.state(); st0.side = side < 0 ? 1 : -1;   // fireStart flips st.side, so pre-set the opposite of what we want
          G5.fireStart(q);
          let tellF = 0; for (; tellF < 200 && q.mode !== 'fireBurn'; tellF++) { hold(); BK.sim(1); }
          rr.tellFrames = tellF; rr.burnReached = q.mode === 'fireBurn';
          if (!rr.burnReached) { rr.err = 'never reached fireBurn (mode=' + q.mode + ')'; continue; }
          rr.queenX = Math.round(q.x);
          // stand 4px IN from the deck edge nearest her spot (confirmed on the deck via G5.hoistOf), then a real standing jump (JUMPV=-320,
          // the same number every reach-hero.js jump uses) OUT toward her - not just walking off the 2-tile ledge, which falls too fast to drift anywhere
          const leaveX = side < 0 ? hs.l + 4 : hs.r - 4;
          P.x = leaveX; P.y = geo.floorY - 32; P.vx = 0; P.vy = 0; P.ground = true; P.face = side; P.plunge = false; P.atk = -1;
          hold(); BK.sim(1);
          const onDeckStart = !!G5.hoistOf(P);
          P.vy = -320; P.ground = false; const runSpeed = 92 * side; P.vx = runSpeed;
          let plungeCalled = false;
          const scorches0 = G5.state().scorches;
          let f = 0, connected = false, farthestX = P.x, apexY = P.y, failReason = null;
          for (; f < 150; f++) {
            hold();
            if (!P.ground && !plungeCalled && f >= 3) { BK.keys.down = true; BK.press('atk'); plungeCalled = true; }
            BK.sim(1);
            if (P.y < apexY) apexY = P.y;
            if (Math.abs(P.x - leaveX) > Math.abs(farthestX - leaveX)) farthestX = P.x;
            if (G5.state().scorches > scorches0) { connected = true; break; }
            if (P.ground && f > 8) { failReason = 'landed without connecting'; break; }
          }
          rr.plunge = { onDeckStart, triggered: plungeCalled, wasPlunging: !!P.plunge, connected, frames: f, elapsedS: +(f / 60).toFixed(2), traveledPx: Math.round(Math.abs(farthestX - leaveX)), riseAboveDeck: Math.round((geo.floorY - 32) - apexY), failReason };
        }
      } catch (err) { r.err = String(err && err.message || err); }
    }
    return res; })()`, 900000);
  console.log('\\nC (plunge reach, west hoist->west spot / east(\"centre\") hoist->east spot h26.3):');
  for (const h of HEROES) { const r = C[h]; if (!r || r.err) { console.log('  ' + h + ': ERR ' + (r && r.err)); continue; }
    for (const side of ['west', 'east']) { const s = r[side]; if (!s) continue;
      console.log('  ' + h + ' ' + side + ': gap=' + s.gapPx + 'px onDeckStart=' + (s.plunge ? s.plunge.onDeckStart : '?') + ' rise=' + (s.plunge ? s.plunge.riseAboveDeck : '?') + 'px traveled=' + (s.plunge ? s.plunge.traveledPx : '?') + 'px connected=' + (s.plunge ? s.plunge.connected : '?') + (s.plunge && s.plunge.failReason ? (' (' + s.plunge.failReason + ')') : '') + ' in ' + (s.plunge ? s.plunge.elapsedS : '?') + 's');
    }
  }
  writeFileSync(join(dir, 'reach-raw.json'), JSON.stringify({ A, C }, null, 1));
  console.log('\\nraw -> ' + join(dir, 'reach-raw.json'));
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
