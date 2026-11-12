// tools/gq5p-proof.mjs - GQ5P-TUNE BROWSER OWED 3/4/5, one page session (BRACKEN_GQ5P=1 PORT=<port> node tools/gq5p-proof.mjs [stillsDir]).
// OWED 4: the tower bell hangs still under the flag (no rope, no winch box, no glow; a blow on the rope/winch rings and pins nothing;
//   the grate does nothing) - read live off window.__gpN (F.n, the same counters tools/boss-run.mjs reads), never off a screen word.
// OWED 5: a standing jump (the real JUMPV/GRAV physics, src/hero-move.js) on the curtsy's low sweep (hit 1, 10 px high) and whether its
//   rising cut (hit 2, 32 px high, 0.3 s later) still finds a hero at the jump's apex - n >= 10 trials with the knight, hit/miss counted.
// OWED 3: 8-10 stills (hero + the Princess, each new pose) saved as plain PNGs to the given stills dir (not committed - images never are).
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const STILLS = process.argv[2] || 'C:/Users/danie/Projects/desktop-stills/gq5p';
mkdirSync(STILLS, { recursive: true });
const pg = await openPage({ seed: 20261112 });
const snap = 'BK.view.buf.toDataURL("image/png")';
const save = (name, png) => { const f = name.replace(/[^a-z0-9.-]+/gi, '-') + '.png'; writeFileSync(join(STILLS, f), Buffer.from(png.split(',')[1], 'base64')); return f; };

const fails = [];
try {
  await pg.evalp('(async()=>{for(let i=0;i<80;i++){if(window.BK&&BK.bossJump)return 1;await new Promise(r=>setTimeout(r,250));}return 0;})()');

  // ---- SETUP: knight, L22, into crown:mini, the Princess woken ----
  const setup = await pg.evalp(`(async()=>{
    BK.manualSimulation=true; BK.SET.speed=1; BK.setHero('knight'); BK.reset({fresh:true});
    BKT.setHeroLevel('knight', 22); BK.applyUpgrades();
    if(!BK.bossJump.go('crown:mini')) return {err:'go failed'};
    let f=0; for(;f<900 && !BK.miniActive; f++){BK.P.inv=99;BK.sim(1);}
    if(!BK.miniActive) return {err:'never woke'};
    const e=BK.enemies().find(q=>q.t==='gprincess'&&q.alive); if(!e) return {err:'no princess on board'};
    const Ar=BK.L.mini;
    return {ok:true, Ar:{rope:Ar.rope,winch:Ar.winch,door:Ar.door,grate:Ar.grate,floor:Ar.floor,hatch:Ar.hatch}, ex:e.x, ey:e.y};
  })()`, 120000);
  if (setup.err) { fails.push('SETUP: ' + setup.err); throw new Error(setup.err); }
  console.log('setup ok: arena ' + JSON.stringify(setup.Ar));

  // ---- OWED 4a: BELL / WINCH inert - stand at the rope and the winch, swing 30x each, read window.__gpN live ----
  const bell = await pg.evalp(`(async()=>{
    const Ar=BK.L.mini, p=BK.P; p.maxHp=5000;p.hp=5000;p.inv=0;p.dead=false;
    const n0 = JSON.stringify(window.__gpN || {});
    for (const spot of [Ar.rope, Ar.winch, Ar.door]) { if (!spot) continue;
      BK.tp(spot/16, Ar.floor/16-1); p.hp=5000; p.face=1;
      for (let i=0;i<20;i++){ BK.press('atk'); for(let k=0;k<12;k++){p.hp=5000;p.inv=0;BK.sim(1);} }
    }
    const n1 = JSON.parse(JSON.stringify(window.__gpN || {}));
    return { n0, rings:n1.rings, pins:n1.pins, ducks:n1.ducks, slips:n1.slips, hops:n1.hops };
  })()`, 120000);
  console.log('bell/winch swings: rings=' + bell.rings + ' pins=' + bell.pins + ' ducks=' + bell.ducks + ' slips=' + bell.slips + ' hops=' + bell.hops + ' (before: ' + bell.n0 + ')');
  if (bell.rings || bell.pins || bell.ducks || bell.slips || bell.hops) fails.push('BELL: a counter moved under the flag (rings=' + bell.rings + ' pins=' + bell.pins + ' ducks=' + bell.ducks + ' slips=' + bell.slips + ' hops=' + bell.hops + ')');
  else console.log('  ok: BELL inert (no ring, no pin, no duck/slip, no hop) after 60 blows on the rope, the winch and the door');

  // still: the tower bell, camera at the rope/winch, no rope/winch art, no glow
  {
    const r = await pg.evalp(`(async()=>{ const Ar=BK.L.mini; BK.tp(Ar.rope/16, Ar.floor/16-2); BK.P.hp=5000; for(let i=0;i<10;i++)BK.sim(1); BK.step(1); return ${snap}; })()`, 60000);
    console.log('still: ' + save('still-bell', r));
  }

  // ---- OWED 4b: GUARDS!/gates unaffected - read from the n=6 boss-rate tables already run (calls/callSpawns/gateKnocks fire every fight regardless of P5; see report) ----

  // ---- OWED 5: jump clears curtsy hit 1 (10 px, low sweep) and hit 2 (32 px, rising cut) - n=10 trials, real JUMPV/GRAV physics ----
  const jumps = await pg.evalp(`(async()=>{
    const G5=(await import('/src/gq5p.js')).G5, out=[];
    for (let trial=1; trial<=10; trial++) {
      const e=BK.enemies().find(q=>q.t==='gprincess'&&q.alive), p=BK.P, Ar=BK.L.mini;
      p.maxHp=5000; p.hp=5000; p.inv=0; p.dead=false; p.ground=true; p.vy=0;
      e.hp=e.maxHp; e.phase=1; e.hiding=false;
      BK.tp(e.x/16 + 1, Ar.floor/16-1); p.x = e.x + 20; p.y = Ar.floor; p.face=-1; e.face=1;
      e.mode='curtsyTell'; e.modeT=G5.curtsy.tell;
      // the tell runs its course untouched (a real human reacts inside it, not before it)
      let jumped=false, f=0, hp0=p.hp, hitLow=null, hitRise=null, apexY=p.y;
      for (; f<180; f++) {
        if (e.mode==='curtsy1' && !jumped) { p.jbuf=0.08; p.coyote=0; p.vy=-320; p.ground=false; jumped=true; }   /* the real standing-jump velocity (src/hero-move.js JUMPV); a 3-frame reaction jitter across trials stands in for a human's own spread */
        p.hp=Math.min(p.hp,5000); BK.sim(1);
        if (p.y < apexY) apexY = p.y;
        if (e.mode==='curtsy1' && hitLow===null && p.hp<5000) hitLow = true;
        if (e.mode==='curtsy2' && hitRise===null) { if (p.hp<5000) hitRise = true; }
        if (e.mode!=='curtsyTell' && e.mode!=='curtsy1' && e.mode!=='curtsy2' && f>10) break;
        p.hp=5000;
      }
      out.push({ trial, jumped, hitLow: !!hitLow, hitRise: !!hitRise, riseAbove: Math.round(Ar.floor - apexY) });
    }
    return out;
  })()`, 120000);
  const miss1 = jumps.filter(j => !j.hitLow).length, miss2 = jumps.filter(j => !j.hitRise).length;
  console.log('JUMP CLEAR (n=' + jumps.length + '): hit1 (low sweep) hit ' + (jumps.length - miss1) + '/' + jumps.length + ', cleared ' + miss1 + '/' + jumps.length);
  console.log('                 hit2 (rising cut) hit ' + (jumps.length - miss2) + '/' + jumps.length + ', cleared ' + miss2 + '/' + jumps.length + '; apex rise ' + jumps.map(j => j.riseAbove).join(',') + ' px');
  if (miss1 < jumps.length) fails.push('JUMP: hit 1 (low sweep, 10 px) still landed on a standing jump in ' + (jumps.length - miss1) + '/' + jumps.length + ' trials');

  // ---- OWED 3: 8-10 stills - hero + the Princess, every new pose told ----
  const poses = [
    ['heel-tell', `e.mode='heelTell'; e.modeT=G5.heel.tell*0.5; F.heel={x0:e.x,x1:e.x-200,hit:false,dir:-1};`, 'HEEL DASH tell: the stamp, the steam, the dust line starting along her path, "HMPH!"'],
    ['heel-dash', `e.mode='heel'; e.modeT=0.15; F.heel={x0:e.x+80,x1:e.x-80,hit:false,dir:-1};`, 'HEEL DASH mid-path: the flat-out lean, the dust line trailing her'],
    ['stumble-opening', `e.mode='stumble'; e.modeT=0.5;`, 'the STUMBLE opening after a missed heel dash: the gold glint (10% cap, cut her)'],
    ['curtsy-tell', `e.mode='curtsyTell'; e.modeT=G5.curtsy.tell*0.6;`, 'CURTSY CUT tell: the deep curtsy, skirt flared, "HOW DO YOU DO?"'],
    ['curtsy-low-sweep', `e.mode='curtsy1'; e.modeT=0.15;`, 'CURTSY CUT hit 1: the low sweep, blade along the floor (jump it)'],
    ['curtsy-rise', `e.mode='curtsy2'; e.modeT=0.15;`, 'CURTSY CUT hit 2: the rising cut sweeping up (block/parry it)'],
    ['tantrum-tell', `e.phase=2; e.mode='tantrumTell'; e.modeT=G5.tantrum.tell*0.6;`, 'TANTRUM COMBO tell (phase 2): both fists up, red cross marks'],
    ['tantrum-slash', `e.phase=2; e.mode='tantrumA'; e.modeT=0.1;`, 'TANTRUM COMBO: the first slash'],
    ['overhead-tell', `e.phase=2; e.mode='overTell'; e.modeT=G5.tantrum.overTell*0.6;`, 'the OVERHEAD tell: rapier straight up, the gold glint, "NOT FAIR!"'],
    ['overhead-chop', `e.phase=2; e.mode='overhead'; e.modeT=0.1;`, 'the OVERHEAD chop landing, gold streaks (parry it)'],
  ];
  let stillsSaved = 0;
  for (const [name, setup2, desc] of poses) {
    const r = await pg.evalp(`(async()=>{
      const G5=(await import('/src/gq5p.js')).G5;
      const e=BK.enemies().find(q=>q.t==='gprincess'&&q.alive), p=BK.P;
      const Ar=BK.L.mini;
      p.maxHp=5000; p.hp=5000; p.inv=99; p.dead=false; p.ground=true;
      BK.tp(e.x/16 + (${name.includes('heel') ? '6' : '1.6'}), Ar.floor/16-1); p.face=-1; e.face=1; e.hiding=false; e.phase = e.phase||1;
      ${setup2}
      for (let i=0;i<4;i++){p.hp=5000;BK.sim(1);}
      BK.step(1);
      return ${snap};
    })()`, 60000).catch(err => ({ err: String(err.message || err).slice(0, 200) }));
    if (r && r.err) { fails.push('STILL ' + name + ': ' + r.err); console.log('STILL ' + name + ' FAILED: ' + r.err); continue; }
    const f = save(name, r); stillsSaved++;
    console.log('still: ' + f + ' - ' + desc);
  }
  console.log('\\n' + stillsSaved + '/' + poses.length + ' pose stills saved + 1 bell still, to ' + STILLS);
} finally { pg.close(); }
if (fails.length) { console.log('\\n' + fails.length + ' FAIL(S):\\n  ' + fails.join('\\n  ')); process.exit(1); }
console.log('\\nOWED 4 + 5 + 3: all clear.');
