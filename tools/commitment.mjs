/* tools/commitment.mjs - WEIGHT (Daniel 2026-10-02): COMMITMENT + STAMINA, the one Salt & Sanctuary pillar, held in the running game.
   Played through the real input on a flat floor (no foes), every hero at level 20 with one bought skill on F:
   1. COMMIT. Each verb (light, third cut, up-slash, low sweep, held heavy, a plunge that lands on nothing) is pressed, then ROLL, JUMP,
      ATTACK, the F SKILL and C are each pressed EVERY FRAME (C: held where it is held, tapped where it is tapped). None acts before the
      CANCEL WINDOW (commit end - 0.06 s) and each acts by the window's first frame, +-1 f. The recovery after the art is asserted
      against the brief's table +-1 f, and the light swing's whole commit against its press-to-free total.
   2. A roll pressed ONCE at swing frame 2 comes out on the window's first frame (it used to be dropped: the buffer is 0.12 s).
   3. The air plunge does not cut an air swing before its active frames are out.
   4. NO REGEN while committed or rolling: the bar is flat from the spend until the commit's end + 0.5 s; over a 4 s mash no hero ends
      above a full bar less one swing (the death knight's mash was stamina-POSITIVE).
   5. The roll's grace is its first 0.20 s: a blow then misses, a blow in its tail lands. The per-hero roll costs.
   6. EXHAUSTED: at 0 no regen for 1.0 s, no roll and no guard until 30% - the knight's shield will not rise at 1 stamina while winded.
      A blocked blow he cannot pay for is a GUARD BREAK: staggered 0.9 s, the shield down 1.2 s, the bar exhausted.
   7. The shield's price scales with the blow (a 6 poke costs less than a 30 slam, capped at 35); the perfect guard is still free.
   8. MASH BUDGET: attack pressed every frame for 6 s gives at most MASH_MAX[hero] swings (knight 13 in 4 s before).
   The numbers below are the BRIEF's (scratch/brief-weight.md section 1), written out here on purpose - not read from src/commit.js -
   so the check measures the game against the decision, not against itself. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';

const F = 1 / 60, TOL = 1;   /* frames */
const HEROES = ['knight', 'warden', 'pyro', 'geomancer', 'paladin', 'pirate', 'reaper'];
/* recovery added after the art (s): light, third, up/sweep, heavy (the freebooter's heavy is his pistol: the whole shot is 0.45 s) */
const REC = { pirate: [0.10, 0.14, 0.10, null], knight: [0.14, 0.20, 0.14, 0.25], warden: [0.14, 0.20, 0.14, 0.22], pyro: [0.14, 0.20, 0.14, 0.25],
  geomancer: [0.16, 0.22, 0.16, 0.28], paladin: [0.17, 0.22, 0.17, 0.30], reaper: [0.17, 0.22, 0.17, 0.30] };
const LIGHT_TOTAL = { pirate: 0.33, knight: 0.46, warden: 0.46, pyro: 0.46, geomancer: 0.48, paladin: 0.72, reaper: 1.05 };
const PISTOL = 0.45, WINDOW = 0.06, PLUNGE_ADD = 0.10, WHIFF = { knight: 0.26, warden: 0.3, pyro: 0.22, paladin: 0.18, pirate: 0.22, reaper: 0.3, geomancer: 0.3 };
const ROLL_COST = { knight: 24, warden: 24, pyro: 24, geomancer: 24, pirate: 22, paladin: 28, reaper: 28 }, STEP_BACK = 15;
const SKILL = { knight: 'whirlwind', warden: 'skewer', pyro: 'flameRing', geomancer: 'boulder', paladin: 'lightLance', pirate: 'grapeshot', reaper: 'harvestMoon' };
const MASH_MAX = { knight: 14, warden: 14, pyro: 14, geomancer: 13, paladin: 10, pirate: 20, reaper: 7 };   /* 6 s of attack pressed every frame */
const ONLY = process.argv.find(a => a.startsWith('--only=')); const only = ONLY ? ONLY.slice(7).split(',') : null;

const pg = await openPage({ audio: false, fonts: false });
const fails = [], rows = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__prep=(hero,lv)=>{BK.manualSimulation=true;BK.SET.speed=1;for(const k in BK.keys)BK.keys[k]=false;BK.setHero(hero);BK.reset({fresh:true});const sk=${JSON.stringify(SKILL)}[hero];
      BKT.PROG.xp[hero]=xpFloor(lv);BKT.PROG.skillOwned[hero]={[sk]:true};BKT.PROG.loadouts[hero]=[sk];if(BKT.PROG.talents)BKT.PROG.talents[hero]={};BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(20,21);BK.sim(60);Object.assign(BK.P,{hp:BK.P.maxHp,inv:0,st:BK.P.maxSt,face:1,dodgeCd:0,dashCd:0,stDelay:0,winded:false,exhaustT:0,cds:{},combo:0,swingEndT:-9,lastSwingT:-9});BK.sim(2);BK.P.st=BK.P.maxSt;};
    window.__full=()=>{Object.assign(BK.P,{st:BK.P.maxSt,winded:false,exhaustT:0,inv:0,hp:BK.P.maxHp});};
    return 1})()`);

  /* ---- 1. THE COMMIT: verb x interrupt ---- */
  const VERBS = ['light', 'third', 'up', 'sweep', 'heavy', 'plunge'], INTS = ['roll', 'jump', 'attack', 'skill', 'c'];
  for (const h of HEROES) {
    if (only && !only.includes(h)) continue;
    for (const verb of VERBS) for (const it of INTS) {
      if (verb === 'heavy' && h === 'pirate' && it === 'c') continue;   /* his C while the pistol smokes is the blast's own (blastT), unchanged */
      const r = await pg.evalp(`(()=>{const h=${JSON.stringify(h)},verb=${JSON.stringify(verb)},it=${JSON.stringify(it)},sk=${JSON.stringify(SKILL[h])};
        __prep(h,20);const P=BK.P,K=BK.keys;
        /* start the verb; t0 = the frame its swing (or landing) begins, artEnd = the frame its art ends */
        let f=0,t0=-1,artEnd=-1;
        if(verb==='third'){for(let i=0;i<200&&t0<0;i++){const a0=P.atk;if(P.atk<0)BK.press('atk');BK.sim(1);if(P.atk>=0&&(a0<0||P.atk<a0)&&P.heavySwing&&!P.heavy)t0=0;__full();}}
        else if(verb==='light'){BK.press('atk');BK.sim(1);t0=0;}
        else if(verb==='up'||verb==='sweep'){K[verb==='up'?'up':'down']=true;BK.press('atk');BK.sim(1);K.up=K.down=false;t0=0;}
        else if(verb==='heavy'){K.atk=true;for(let i=0;i<200&&t0<0;i++){BK.sim(1);if(h==='knight'&&(P.atkHeld||0)>0.32)K.atk=false;if((P.heavy&&P.atk>=0)||(h==='pirate'&&P.blastT>0.3))t0=0;}K.atk=false;}
        else if(verb==='plunge'){BK.press('jump');K.jump=true;BK.sim(14);K.jump=false;K.down=true;BK.press('atk');BK.sim(1);K.down=false;for(let i=0;i<120&&t0<0;i++){BK.sim(1);if(P.ground&&!P.plunge)t0=0;}}
        if(t0<0)return {err:'verb never started'};
        const kind=P.swingKind,heavy=!!P.heavy,third=!!P.heavySwing;__full();
        let acted=-1,prevAtk=P.atk,swings=0,tapOn=false,y0=P.y,cdKey=sk;
        let w=0;   /* WORLD frames: a hitstop (the pistol's, a heavy's) holds the whole world, the commit with it, so it is not counted */
        for(f=1;f<=200&&acted<0;f++){
          if(artEnd<0&&P.atk<0)artEnd=w;
          if(it==='roll')BK.press('dodge');else if(it==='jump')BK.press('jump');else if(it==='attack')BK.press('atk');else if(it==='skill')BK.press('throw');
          else{const hold=h==='knight'||h==='paladin'||h==='reaper'||h==='geomancer';if(hold)K.block=true;else{tapOn=!tapOn;K.block=tapOn;}}
          const st0=P.st,frozen=BK.stop>0;BK.sim(1);if(frozen)continue;const f0=f;f=++w;
          if(it==='roll'&&P.dodge>0)acted=f;
          else if(it==='jump'&&!P.ground&&P.vy<0)acted=f;
          else if(it==='attack'&&P.atk>=0&&(prevAtk<0||P.atk<prevAtk))acted=f;
          else if(it==='skill'&&P.cds&&P.cds[cdKey]>0)acted=f;
          else if(it==='c'&&(P.block||P.aegis||P.warding||P.geoGuard||P.parryW>0||P.deflectT>0||(h==='pyro'&&st0-P.st>=30)))acted=f;
          prevAtk=P.atk;__full();f=f0;
        }
        K.block=false;
        return {acted,artEnd:artEnd<0?(verb==='plunge'?0:null):artEnd,kind,heavy,third};})()`);
      if (r.err) { check(false, `${h} ${verb}: ${r.err}`); continue; }
      const ri = verb === 'light' ? 0 : verb === 'third' ? 1 : verb === 'up' || verb === 'sweep' ? 2 : 3;
      const rec = verb === 'plunge' ? WHIFF[h] + PLUNGE_ADD : verb === 'heavy' && h === 'pirate' ? PISTOL : REC[h][ri];
      const art = verb === 'heavy' && h === 'pirate' ? 0 : r.artEnd;
      const winF = Math.ceil((art * F + rec - WINDOW) / F - 1e-6);   /* the window's first frame, counted from the verb's start */
      rows.push({ h, verb, it, acted: r.acted, art, winF });
      check(r.acted >= 0, `${h} ${verb} -> ${it}: never acted`);
      check(r.acted >= winF - TOL, `${h} ${verb} -> ${it}: acted at f${r.acted}, before the window (f${winF})`);
      check(r.acted <= winF + TOL + (it === 'c' ? 1 : 0), `${h} ${verb} -> ${it}: acted at f${r.acted}, late for the window (f${winF})`);
      if (verb === 'light' && it === 'roll') check(Math.abs((r.acted * F + WINDOW) - LIGHT_TOTAL[h]) <= (TOL + 1) * F, `${h} light total ${(r.acted * F + WINDOW).toFixed(3)} s, the brief says ${LIGHT_TOTAL[h]}`);
    }
  }

  /* ---- 2. ONE roll press at swing frame 2 comes out on the window's first frame ---- */
  for (const h of HEROES) { if (only && !only.includes(h)) continue;
    const r = await pg.evalp(`(()=>{__prep(${JSON.stringify(h)},0);const P=BK.P;BK.press('atk');BK.sim(2);BK.press('dodge');let art=-1,f;for(f=3;f<160;f++){BK.sim(1);if(art<0&&P.atk<0)art=f-1;if(P.dodge>0)break;}return {f,art}})()`);
    const winF = Math.ceil((r.art * F + REC[h][0] - WINDOW) / F - 1e-6);
    check(Math.abs(r.f - winF) <= TOL, `${h}: a roll pressed once at swing f2 came out at f${r.f}, not on the window's first frame f${winF}`);
  }

  /* ---- 3. the air plunge waits for an air swing's active frames ---- */
  for (const h of HEROES) { if (only && !only.includes(h)) continue;
    const r = await pg.evalp(`(()=>{__prep(${JSON.stringify(h)},0);const P=BK.P,K=BK.keys;BK.press('jump');K.jump=true;BK.sim(10);BK.press('atk');BK.sim(1);K.jump=false;let cut=null;
      for(let i=0;i<40;i++){K.down=true;BK.press('atk');const a=P.atk;BK.sim(1);if(P.plunge){cut=a;break;}}K.down=false;return {cut}})()`);
    check(r.cut === null || r.cut < 0 || r.cut > 0.17, `${h}: the plunge cut an air swing at atk ${r.cut} (inside its active frames)`);
  }

  /* ---- 4. no regen while committed or rolling; the 4 s mash is stamina-negative ---- */
  for (const h of HEROES) { if (only && !only.includes(h)) continue;
    const r = await pg.evalp(`(()=>{__prep(${JSON.stringify(h)},0);const P=BK.P;P.st=60;BK.press('atk');BK.sim(1);const s0=P.st;let rose=-1,f,free=-1;
      for(f=1;f<200;f++){BK.sim(1);if(free<0&&P.atk<0&&!(P.atkRec>0.0001))free=f;if(P.st>s0+1e-6){rose=f;break;}}
      __prep(${JSON.stringify(h)},0);P.st=60;BK.press('dodge');BK.sim(1);const r0=P.st;let rr=-1;for(let i=1;i<120;i++){BK.sim(1);if(P.st>r0+1e-6){rr=i;break;}}const rollLen=BK.P.dodgeMax;
      __prep(${JSON.stringify(h)},0);const cost=BK.stepCost();for(let i=0;i<240;i++){if(P.atk<0)BK.press('atk');BK.sim(1);}
      return {free,rose,rr,rollLen,end:P.st,max:P.maxSt,cost}})()`);
    check(r.rose >= r.free + 29 && r.rose <= r.free + 32, `${h}: the bar rose ${r.rose - r.free} f after the commit ended (want 0.5 s = 30 f)`);
    check(r.rr >= Math.round(r.rollLen / F) + 29, `${h}: the bar rose ${r.rr} f into a ${r.rollLen} s roll (no regen while rolling, then 0.5 s)`);
    check(r.end <= r.max - r.cost + 1e-6, `${h}: a 4 s mash ended at ${r.end.toFixed(1)} of ${r.max} (more than a full bar less one swing of ${r.cost})`);
  }

  /* ---- 5. the roll's grace and its price ---- */
  for (const h of HEROES) { if (only && !only.includes(h)) continue;
    const r = await pg.evalp(`(()=>{const h=${JSON.stringify(h)};__prep(h,0);const P=BK.P;P.face=1;const s0=P.st;BK.press('dodge');BK.sim(1);const cost=Math.round(s0-P.st);
      BK.sim(5);P.inv=0;P.grace=0;const early=BKT.damagePlayer(P.x+10,5,{unblockable:true});
      __prep(h,0);P.face=1;BK.press('dodge');BK.sim(1);for(let i=0;i<14;i++)BK.sim(1);P.inv=0;P.grace=0;const inRoll=P.dodge>0;const late=h==='warden'?null:BKT.damagePlayer(P.x+10,5,{unblockable:true});
      let back=null;if(h==='warden'){__prep(h,0);P.face=1;const b0=P.st;BK.keys.left=false;BK.press('dodge');BK.sim(1);back=Math.round(b0-P.st);}
      return {cost,early,late,inRoll,back}})()`);
    check(r.early === false, `${h}: a blow 0.1 s into the roll was '${r.early}', not a miss`);
    if (h !== 'warden') { check(r.inRoll && r.late === 'hit', `${h}: a blow in the roll's tail (0.25 s, in roll: ${r.inRoll}) was '${r.late}', not a hit`); }
    const want = h === 'warden' ? STEP_BACK : ROLL_COST[h];
    check(r.cost === want, `${h}: the roll cost ${r.cost}, the brief says ${want}`);
  }

  /* ---- 6. EXHAUSTED; the guard break ---- */
  { const r = await pg.evalp(`(()=>{__prep('knight',0);const P=BK.P,K=BK.keys;P.st=10;BK.press('atk');BK.sim(1);const lastWind=P.atk>=0,zero=P.st;
      for(let i=0;i<40;i++)BK.sim(1);const flat=P.st;for(let i=0;i<25;i++)BK.sim(1);const after=P.st;
      Object.assign(P,{st:1});P.winded=true;P.exhaustT=0;K.block=true;BK.sim(2);const shield1=!!P.block;K.block=false;BK.sim(1);
      P.winded=true;P.st=25;P.dodgeCd=0;BK.press('dodge');BK.sim(1);const rollWinded=P.dodge>0;
      __prep('knight',0);P.st=12;P.face=1;K.block=true;BK.sim(20);const up=!!P.block;P.inv=0;const res=BKT.damagePlayer(P.x+14,40,{});BK.sim(1);
      const brk={res,hurt:+P.hurt.toFixed(2),tired:+P.guardTired.toFixed(2),winded:!!P.winded,st:P.st};BK.sim(45);const upSoon=!!P.block;K.block=false;
      return {lastWind,zero,flat,after,shield1,rollWinded,up,brk,upSoon}})()`);
    check(r.lastWind && r.zero === 0, `LAST WIND: a swing at 10 of 15 went ${r.lastWind}, the bar ${r.zero}`);
    check(r.flat === 0, `EXHAUSTED: the bar came back to ${r.flat} inside its 1.0 s`);
    check(r.after > 0, `EXHAUSTED: the bar never came back after 1.0 s (${r.after})`);
    check(!r.shield1, `the knight's shield rose at 1 stamina while winded`);
    check(!r.rollWinded, `a roll came out while winded`);
    check(r.up && r.brk.hurt >= 0.85 && r.brk.tired >= 1.15 && r.brk.winded, `GUARD BREAK: ${JSON.stringify(r.brk)} (want stagger 0.9, guard down 1.2, exhausted)`);
    check(!r.upSoon, `the shield was back up 0.75 s after a guard break`);
  }

  /* ---- 7. the shield's price ---- */
  { const r = await pg.evalp(`(()=>{const cost=(dmg,perfect)=>{__prep('knight',0);const P=BK.P,K=BK.keys;P.face=1;K.block=true;BK.sim(perfect?1:20);P.inv=0;const s0=P.st;BKT.damagePlayer(P.x+14,dmg,{});const c=s0-P.st;K.block=false;return Math.round(c);};
      return {poke:cost(6),slam:cost(30),huge:cost(90),perfect:cost(30,true)}})()`);
    check(r.poke < r.slam && r.huge <= 35 && r.huge > r.slam, `the shield's price: poke ${r.poke}, slam ${r.slam}, huge ${r.huge} (cap 35)`);
    check(r.perfect <= 0, `the perfect guard cost ${r.perfect}`);
    rows.push({ shield: r });
  }

  /* ---- 8. the mash budget ---- */
  for (const h of HEROES) { if (only && !only.includes(h)) continue;
    const n = await pg.evalp(`(()=>{__prep(${JSON.stringify(h)},0);const P=BK.P;let n=0,a0=-1;for(let i=0;i<360;i++){BK.press('atk');BK.sim(1);if(P.atk>=0&&(a0<0||P.atk<a0))n++;a0=P.atk;}return n})()`);
    rows.push({ h, mash6s: n });
    check(n <= MASH_MAX[h], `${h}: ${n} swings in 6 s of mashing (at most ${MASH_MAX[h]})`);
  }
  assert.deepEqual(pg.errors, []);
} finally { pg.close(); }
if (process.argv.includes('--rows')) console.log(JSON.stringify(rows));
if (fails.length) { console.log(fails.length + ' FAILED:\n' + fails.join('\n')); process.exit(1); }
console.log('commitment: ok (' + rows.length + ' rows)');
