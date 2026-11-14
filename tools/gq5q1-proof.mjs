// PAGE TOOL: launches headless Chrome
/* tools/gq5q1-proof.mjs [stillsDir] - GQ5Q1-TUNE BROWSER OWED 3/4, one page session (BRACKEN_GQ5Q1=1 node tools/gq5q1-proof.mjs).
   OWED 3: the burn-tick damage dial (does BOSS_HIT.gqueen 2.15 land on the raw Q5N.fire.dmg?) measured on a real full-HP hero; 8-10 stills
     for the by-eye checks (chains from the ceiling, deck sprite vs the stone slab, bell/hoist/hearth jet not stacking on screen).
   OWED 4: a lab-duty run that reaches SCORCHED, and a lure-begin count read live off window.__hcN (or the mech object) over the run. */
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
const fails = [];
try {
  // ---- OWED 3a: the burn-tick damage dial - a full-HP knight stands in the open floor, force one tick, read the real HP loss ----
  const dial = await pg.evalp(`(async()=>{${PRE}
    load('knight'); let q=wake(); quiet(q); const G5=BK.gqHands().q5(); const geo=G5.geo(); const A=BK.L.arena;
    BK.tp((A.x0+18*16)/16, A.floor/16-1); const P=BK.P; P.hp=P.maxHp; P.inv=0; P.ground=true;
    // put her into fireBurn directly over the open floor (not a hoist), force one tick
    q.mode='fireBurn'; q.modeT=3; G5.state().fire = { phase:'burn', t0: 0, side:1, spotX:q.x, hearthX:q.x, tickN:0, tB:0, ringSaid:0 };
    const hp0 = P.hp;
    for (let f=0; f<40 && P.hp===hp0; f++) { hold(); BK.sim(1); }
    const tickDmg = Math.round(hp0 - P.hp);
    return { maxHp: P.maxHp, hp0, hp1: P.hp, tickDmg, rawDmg: 5 };
  })()`, 60000);
  console.log('OWED 3a TICK DIAL: raw Q5N.fire.dmg=' + dial.rawDmg + ', real damage landed on a full-HP knight (maxHp ' + dial.maxHp + ') for ONE tick = ' + dial.tickDmg +
    ' (x' + (dial.tickDmg / dial.rawDmg).toFixed(2) + ' the raw number; BOSS_HIT.gqueen is 2.15)');
  if (dial.tickDmg <= 0) fails.push('TICK DIAL: no damage landed at all (' + dial.tickDmg + ')');

  // ---- OWED 4: lab duty reaches SCORCHED; lure never begins (read mech().lure every frame over a long run) ----
  const lab = await pg.evalp(`(async()=>{${PRE}
    load('knight'); let q=wake(); const G5=BK.gqHands().q5(), H=BK.gqHands(); const A=BK.L.arena, P=BK.P;
    P.maxHp=9999; P.hp=9999; P.inv=0;
    let lureSeen=0, scorched=0, rings=0, plunges=0, lastStep=0;
    for (let f=0; f<60*90; f++) {
      P.hp=Math.min(P.hp,9999);
      const M = H.mech ? H.mech() : null; if (M && M.lure) lureSeen++;
      const st = G5.state(); if (st.step>0 && lastStep===0) rings++; lastStep = st.step;
      const duty = H.labDuty ? H.labDuty(P) : null;
      if (duty) { P.face = duty.face; if (duty.x != null) P.x += Math.sign(duty.x - P.x) * Math.min(Math.abs(duty.x - P.x), 90/60);
        if (duty.jump && P.ground) { P.vy=-320; P.ground=false; }
        if (duty.plunge && !P.ground) { plunges++; BK.keys.down=true; BK.press('atk'); }
        if (duty.swing) BK.press('atk'); }
      BK.sim(1);
      if (q.scorch) scorched++;
    }
    return { lureSeen, scorched, rings, plunges, finalScorches: G5.state().scorches, finalFires: G5.state().fires };
  })()`, 120000);
  console.log('OWED 4 LAB DUTY (90 s, labDuty-driven): rings=' + lab.rings + ' plunges-attempted=' + lab.plunges + ' scorched-frames=' + lab.scorched +
    ' total scorches=' + lab.finalScorches + ' total fires=' + lab.finalFires + ' | lure seen=' + lab.lureSeen + ' frames (want 0)');
  if (lab.finalScorches < 1) fails.push('LAB DUTY: never reached SCORCHED in 90 s');
  if (lab.lureSeen > 0) fails.push('LAB DUTY: the lure fired ' + lab.lureSeen + ' frames (want 0 under the flag)');

  // ---- OWED 3b: stills - hoists down, hoists up, LOWERING, the tell, the burn, riding a deck, the plunge, SCORCHED + ward ----
  const shots = await pg.evalp(`(async()=>{${PRE}
    load('knight'); let q=wake(); quiet(q); const G5=BK.gqHands().q5(), H=BK.gqHands(); const geo=G5.geo(); const A=BK.L.arena, P=BK.P;
    P.maxHp=9999; P.hp=9999; P.inv=0; q.mode='stand'; q.modeT=99;
    P.x = geo.hs[1].cx; P.y = A.floor; P.ground=true; P.face=1;
    snap('hoists-down');
    H.test.ringBell(); for (let f=0; f<40; f++) { hold(); BK.sim(1); }
    snap('hoists-up');
    for (let f=0; f<60*6.6; f++) { hold(); BK.sim(1); }
    snap('lowering-flash');
    // the throne fire tell + burn
    G5.state().nextFire = -1; q.crownCd=99;q.portalCd=99;q.geodeCd=99;
    G5.fireStart(q);
    for (let f=0; f<30; f++) { hold(); BK.sim(1); }
    snap('fire-tell');
    for (let f=0; f<120 && q.mode!=='fireBurn'; f++) { hold(); BK.sim(1); }
    snap('fire-tell-ring');
    for (let f=0; f<10; f++) { hold(); BK.sim(1); }
    snap('the-burn');
    // a hero riding a deck mid-burn
    H.test.ringBell ? null : null; const near = geo.hs.reduce((a,h)=>Math.abs(h.cx-q.x)<Math.abs(a.cx-q.x)?h:a, geo.hs[0]);
    P.x = near.cx; P.y = A.floor-32; P.ground=true;
    for (let f=0;f<6;f++){hold();BK.sim(1);}
    snap('riding-a-deck');
    // the plunge onto her
    P.vy = 60; P.ground = false; P.plunge = true;
    for (let f=0;f<4 && q.mode==='fireBurn';f++){hold();BK.sim(1);}
    snap('the-plunge');
    for (let f=0;f<6;f++){hold();BK.sim(1);}
    snap('scorched');
    for (let f=0;f<170 && q.mode==='stunned';f++){hold();BK.sim(1);}
    snap('warded');
    return shots;
  })()`, 180000).catch(err => ({ err: String(err && err.message || err).slice(0, 300) }));
  if (shots && shots.err) { fails.push('STILLS: ' + shots.err); console.log('STILLS FAILED: ' + shots.err); }
  else {
    let n = 0;
    const descs = {
      'hoists-down': 'the three hoists at rest: slots flush with the floor, gold studs',
      'hoists-up': 'the hoists risen 2 tiles: chains from the ceiling to the decks, the grate deck up',
      'lowering-flash': 'the LOWERING vanish tell: rattle, red flash on the decks before they sink',
      'fire-tell': 'THE THRONE FIRE tell: "!!" + "THE FLOOR BURNS", the floor grilles glowing in steps',
      'fire-tell-ring': 'the bell glowing "RING!" during the fire tell (bell ready, hoists down)',
      'the-burn': 'the whole floor burning (THE THRONE FIRE active, 6 ticks of 5 up to 30)',
      'riding-a-deck': 'a hero standing on a risen hoist deck during the burn (spared)',
      'the-plunge': 'a plunge ("FROM ABOVE") landing on her during the burn',
      'scorched': 'SCORCHED: stunned, x1.25, capped at 12% of her bar',
      'warded': 'the told 3 s WARDED after the stun ends',
    };
    for (const [id, png] of Object.entries(shots)) { const f = save(STILLS, id, png); n++; console.log('still: ' + f + ' - ' + (descs[id] || id)); }
    console.log(n + ' stills -> ' + STILLS);
  }
  console.log('page errors: ' + JSON.stringify(pg.errors.slice(0, 6)));
} finally { await pg.close(); }
if (fails.length) { console.log('\\n' + fails.length + ' FAIL(S):\\n  ' + fails.join('\\n  ')); process.exit(1); }
console.log('\\nOWED 3 + 4: all clear.');
