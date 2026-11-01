// tools/berserker-identity.mjs - THE BERSERKER'S IDENTITY PASS, PLAYED THROUGH HIS REAL INPUT (claude/berserkerid, Daniel 10-31 Q6/Q8/Q11, 11-01 jab combo; the L25-L50 kit)
//   wind-up   HOLD X is ONE heavy chop that grows with the wind: COMMITTED past the minimum (armoured, cannot turn, creeps on), bigger damage / reach / poise / recovery the longer,
//             rage winds quicker, it goes by itself at full + hold (the three-tier ladder is gone: the Blood Knight keeps the only one)
//   cleave    the run-ender (the fifth blow) is a WIDE SLOW CLEAVE: wide both ways, slower than a chop, a long recovery
//   dash      the dash strike is 1.3x and SHOVES the small (the berserker's rider)
//   cost      SPIN / CLEAVE / STORM cost 25 / 30 / 45 stamina; half a bar -20%, a full bar -40%
//   tech      the six L25-L50 techniques taken from the card and played: AXE CATCH, WARCRY CHARGE, RECKLESS BLOW, CHAINED RAGE, BERSERK LEAP, UNBOWED RAMPAGE
// A SECOND PAGE from tools/berserker.mjs on purpose: ~40 level resets in one page outgrow the 2 GB heap (the tool crashed when these lived there).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__bz=(ids=[],lv=12)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('berserker');BK.reset({fresh:true});BKT.PROG.xp.berserker=xpFloor(lv);
      BKT.PROG.skillOwned.berserker=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.berserker=ids.slice(0,3);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<50;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(30);for(const k in BK.keys)BK.keys[k]=false;const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;P.rage=0;P.bzFightT=-99;};
    window.__LV=await import('/src/level.js');
    window.__foe=(dx,t='sprig',hp=5000)=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=hp;e.cd=99;e.dmgPct=70;return e;};   /* (batch88 integ, as tools/knock-into.mjs) the knock-along of a pounce and the throw of a heavy are the foe's DAMAGE % now (claude/damagepct): these 5000-hp dummies never build one, so they stand at 70%, where it goes as far as the old fixed one; every assertion is unchanged */
    return 1})()`);
  const r = await pg.evalp(`(()=>{const out={},P=()=>BK.P,K=BK.keys,Z=()=>BK.bz(),C=()=>BK.crouchC();
    /* (claude/berserkerid, Daniel 10-31 Q6) THE WIND-UP COMMIT replaces the three-tier ladder: armoured from the minimum wind, cannot turn and cannot stop, ONE heavy chop that grows with the wind (damage, reach, poise), overcommits (recovery), rage winds quicker, and it goes by itself at full + hold */
    { const T={}, hold=n=>{P().st=P().maxSt;K.atk=true;BK.press('atk');for(let i=0;i<n;i++)BK.step(1);}, rel=()=>{K.atk=false;BK.step(2);};
      __bz(); const seen=[],keys=[]; K.atk=true; BK.press('atk'); for(let i=0;i<110;i++){BK.step(1);const t=Z().tier;if(t&&!seen.includes(t))seen.push(t);if(t>=1&&!keys.includes(P().lastKey))keys.push(P().lastKey);} T.at=Z().tierAt; T.seen=seen; T.keys=keys; rel(); T.fullF=Z().windF; BK.sim(60);
      __bz(); hold(20); rel(); T.shortF=Z().windF; T.shortTier=Z().heavyTier; BK.sim(60);
      __bz(); hold(60); rel(); T.midF=Z().windF; BK.sim(60);
      /* size: damage, reach, recovery of a short / mid / full wind on a dummy foe he cannot be hurt by */
      const size=n=>{__bz();const w=__foe(18,'sprig',5000);w.biteCd=99;BK.sim(1);const h0=w.hp;P().st=P().maxSt;K.atk=true;BK.press('atk');let reach=0;for(let i=0;i<n;i++){BK.step(1);w.x=P().x+18;}K.atk=false;const x0=P().x;let rc=0;for(let f=0;f<40;f++){BK.sim(1);w.x=P().x+18;const b=BK.attackBox();if(b)rc=Math.max(rc,Math.round(b.r-P().x));}
        let rec=0;for(let f=0;f<80&&!(P().atk<0&&(P().atkRec||0)<=0);f++){BK.sim(1);} return {dmg:h0-w.hp,reach:rc,rec:+(P().atkRecMax||0).toFixed(2),f:Z().windF};};
      T.s0=size(27); T.s1=size(50); T.s2=size(110);
      /* armoured while committed, cannot turn, creeps on */
      __bz(); K.atk=true; BK.press('atk'); for(let i=0;i<40;i++)BK.step(1); const xA=P().x,fA=P().face; K.left=true; for(let i=0;i<30;i++)BK.step(1); K.left=false; T.turned=P().face!==fA; T.crept=Math.round(P().x-xA); P().inv=0;P().hurt=0; const eA=__foe(14); BKT.damagePlayer(eA.x,6,{who:eA}); T.flinch=P().hurt>0; K.atk=false; BK.step(2); BK.sim(60);
      const pz=n=>{__bz();const b=__foe(20,'brute');b.maxHp=b.hp;b.mini=true;b.poise=0;b.biteCd=99;BK.sim(2);P().st=P().maxSt;K.atk=true;BK.press('atk');for(let i=0;i<n;i++){P().inv=0.5;BK.sim(1);b.x=P().x+20;}K.atk=false;let most=0;for(let i=0;i<40;i++){P().inv=0.5;BK.sim(1);b.x=P().x+20;most=Math.max(most,(b.broken>0||b.floored>BK.time)?999:(b.poise||0));}return most;};   /* (a bar the chop empties is BROKEN and reads 0 after: that is the biggest poise there is) */
      T.p1=pz(32); T.p3=pz(110);
      __bz(); P().rage=60; K.atk=true; BK.press('atk'); BK.step(2); T.atHot=Z().tierAt; K.atk=false; BK.sim(60);
      __bz(); K.atk=true; BK.press('atk'); let fired=-1,fw=0; for(let i=0;i<200;i++){BK.sim(1);if(P().heavy&&fired<0){fired=i;fw=P().bzWindF;}} K.atk=false; T.auto={fired,windF:fw}; BK.sim(60);
      out.tiers=T; }
    /* (claude/berserkerid) THE WIDE SLOW CLEAVE: the run-ender reaches wide both ways, is slower than a chop, and recovers longer */
    { const W={}; __bz(); const e5=__foe(16); BK.sim(2); const t0=[]; let back=0, front=0; for(let i=0;i<5;i++){P().st=P().maxSt;BK.press('atk');let n=0;for(let f=0;f<80;f++){BK.sim(1);e5.x=P().x+16;n++;if(i===4){const b=BK.attackBox();if(b){back=Math.max(back,Math.round(P().x-b.l));front=Math.max(front,Math.round(b.r-P().x));}}if(P().atk<0&&(P().atkRec||0)<=0&&f>2)break;}t0.push(n);} W.frames=t0; W.chopFrames=t0[0]; W.cleaveFrames=t0[4]; W.back=back; W.reach5=front; out.cleave=W; }
    /* (claude/berserkerid) dash strike: 1.3x, and the rider SHOVES the small */
    { const D={}; __bz(); const ds=__foe(40,'sprig',5000); ds.biteCd=99; BK.sim(2); D.cfg=BK.DASH_STRIKE?BK.DASH_STRIKE.berserker:null; P().st=P().maxSt; BK.press('dodge'); BK.sim(3); BK.press('atk'); const x0=ds.x; for(let f=0;f<30;f++){BK.sim(1);} D.shoved=Math.round(ds.x-x0); D.hurt=ds.hp0-ds.hp; out.dash=D; }
    /* (claude/berserkerid) THE AoE COSTS: 25 / 30 / 45 stamina, rage pays part back (half bar -20%, full -40%) */
    { const C2={}; for(const [id,key] of [['bzSpin','spin'],['bzCleave','cleave'],['bzStorm','storm']]) for(const rg of [0,60,100]){ __bz([id],24); __foe(24); BK.sim(2); P().rage=rg; P().bzFightT=BK.time||0; P().st=P().maxSt; const st=P().st; BK.press('throw'); BK.sim(2); (C2[key]=C2[key]||[]).push(Math.round(st-P().st)); } out.cost=C2; }
    /* (claude/berserkerid) THE L25-L50 TECHNIQUES, taken from the card, then played */
    { const Tn={}; const givenCard=(ms,up)=>{ BKT.PROG.card=BKT.PROG.card||{}; BKT.PROG.card.berserker={v:0,e:0,m:0,ms,up:up||{}}; };
      __bz([],40); givenCard({25:'bzcatch'}); BK.applyUpgrades(); { const ax=Z(); P().st=P().maxSt; K.up=true; K.block=true; BK.sim(2); K.block=false; BK.sim(8); /* thrown: recall (THE RETURN) then catch on the beat */ }
      /* catch: needs THE RETURN passive: grant it, throw, recall, catch */
      __bz([],40); givenCard({25:'bzcatch'}); P().st=P().maxSt; K.up=true; K.block=true; BK.sim(2); K.block=false; BK.sim(4); K.block=true; BK.sim(2); K.block=false; let caught=0; const r0=P().rage||0; for(let i=0;i<60;i++){ BK.sim(1); const a=Z().axe; if(a&&a.state==='back'&&Math.hypot(a.x-P().x,a.y-(P().y-14))<40){ K.block=true; BK.sim(1); K.block=false; break; } } BK.sim(3); K.up=false; Tn.catch={catches:Z().stats.catches,flies:!!(Z().axe&&Z().axe.state==='fly')};
      __bz([],40); givenCard({30:'bzwarcry'}); const wf=__foe(40,'brute'); wf.maxHp=wf.hp; wf.mini=true; wf.poise=0; wf.biteCd=99; BK.sim(2); P().rage=100; P().bzFightT=BK.time||0; P().st=P().maxSt; K.block=true; BK.sim(3); P().rage=100; P().bzFightT=BK.time||0; BK.press('atk'); BK.sim(3); K.block=false; Tn.warcry={n:Z().stats.warcries,rage:Math.round(P().rage),iron:Z().armoured,poise:Math.round(wf.poise||0)};
      __bz([],40); givenCard({35:'bzreckless'}); P().rage=100; P().frenzyT=6; P().frenzyMax=8; const hp0=P().hp; K.atk=true; BK.press('atk'); for(let i=0;i<40;i++)BK.step(1); K.atk=false; BK.step(2); Tn.reckless={cost:hp0-P().hp,pct:+((hp0-P().hp)/P().maxHp).toFixed(3)};
      __bz([],40); givenCard({40:'bzchained'}); P().frenzyT=5; P().frenzyMax=8; const kf=__foe(16,'sprig',1); kf.biteCd=99; BK.sim(2); const f0=P().frenzyT; for(let i=0;i<30&&kf.alive;i++){ P().st=P().maxSt; BK.press('atk'); BK.sim(8); kf.x=P().x+16; } Tn.chained={gain:+(P().frenzyT-f0+0.4).toFixed(2),n:Z().stats.chained,alive:kf.alive};
      __bz([],40); givenCard({45:'bzleap'}); const lf=__foe(30,'sprig',5000); lf.biteCd=99; BK.sim(2); P().st=P().maxSt; K.atk=true; BK.press('atk'); for(let i=0;i<50;i++)BK.step(1); K.up=true; K.atk=false; BK.step(1); K.up=false; let air=false; for(let i=0;i<90;i++){BK.sim(1); if(!P().ground)air=true; lf.x=P().x+30;} Tn.leap={n:Z().stats.leaps,air,hit:lf.hp0-lf.hp,landed:P().ground};
      __bz([],40); givenCard({50:'bzrampage'}); P().standT=3; P().rage=100; P().bzFightT=BK.time||0; P().st=P().maxSt; BK.press('block'); K.block=true; BK.sim(2); K.block=false; Tn.rampage={n:Z().stats.rampages,stand:+(P().standT||0).toFixed(1),rage:Math.round(P().rage),haste:+(P().hasteT||0).toFixed(1)}; BK.sim(60*4+20); Tn.rampageAfter={debt:+(P().bzDebtT||0).toFixed(1),take:Z().takeMul};
      out.tech=Tn; }
    return JSON.stringify(out);})()`, 900000);
  const x = JSON.parse(r); const F = { reach: [0, 0, 0, 0, x.cleave.reach5] };
  console.log(JSON.stringify(x));
  const rr = x; const r_ = rr;
  void r_;
    { const T = rr.tiers;   /* (claude/berserkerid) THE WIND-UP COMMIT */
    ok(T.seen.join() === '1' && T.at[0] >= 0.3 && T.at[2] - T.at[0] >= 0.5, 'wind-up: the hold COMMITS once (tier 1) and keeps growing to full: ' + JSON.stringify(T.at) + ' ' + T.seen);
    ok(T.keys.includes('bzWind2') && T.keys.includes('bzWind3'), 'wind-up: committed and full show their own wind poses: ' + JSON.stringify(T.keys));
    ok(T.shortF === 0 && T.midF > 0.2 && T.midF < 0.9 && T.fullF >= 0.99, 'wind-up: the size grows with the hold (0 .. 1): ' + JSON.stringify([T.shortF, T.midF, T.fullF]));
    ok(T.s2.dmg > T.s1.dmg && T.s1.dmg > T.s0.dmg, 'wind-up: a longer wind hits harder: ' + JSON.stringify([T.s0, T.s1, T.s2]));
    ok(T.s2.reach > T.s0.reach + 6, 'wind-up: a longer wind reaches further: ' + JSON.stringify([T.s0, T.s1, T.s2]));
    ok(T.s2.rec > T.s0.rec + 0.1 && T.s2.rec >= 0.45, 'wind-up: it OVERCOMMITS - a long recovery, longer for a bigger wind: ' + JSON.stringify([T.s0, T.s1, T.s2]));
    ok(!T.turned && T.crept > 5 && !T.flinch, 'wind-up: committed he cannot turn, creeps on, and a blow does not flinch him: ' + JSON.stringify({ turned: T.turned, crept: T.crept, flinch: T.flinch }));
    ok(T.p3 > T.p1, 'wind-up: a bigger wind leans harder on a mini\'s bar: ' + [T.p1, T.p3]);
    ok(T.atHot[2] < T.at[2] - 0.15, 'wind-up: RAGE winds quicker: ' + JSON.stringify([T.at, T.atHot]));
    ok(T.auto.fired > 0 && T.auto.windF >= 0.99, 'wind-up: held at full it comes down by itself: ' + JSON.stringify(T.auto)); }
  { const W = rr.cleave; ok(W.cleaveFrames > W.chopFrames * 1.4, 'wide cleave: the run-ender is slower than a chop: ' + JSON.stringify(W)); ok(W.back >= 10, 'wide cleave: it reaches BEHIND him too: ' + JSON.stringify(W)); ok(F.reach[4] >= 34, 'wide cleave: it reaches wide in front (34+): ' + F.reach); }
  { const D = rr.dash; ok(D.cfg && D.cfg.dmg === 1.3, 'dash strike: normalised to 1.3x: ' + JSON.stringify(D)); ok(D.shoved > 20, 'dash strike: the berserker\'s rider SHOVES the small: ' + JSON.stringify(D)); }
  { const C2 = rr.cost; ok(C2.spin.join() === '25,20,15' && C2.cleave.join() === '30,24,18' && C2.storm.join() === '45,36,27', 'AoE costs: 25/30/45, -20% at half rage, -40% at full: ' + JSON.stringify(C2)); }
  { const Tn = rr.tech; ok(Tn.catch.catches === 1 && Tn.catch.flies, 'AXE CATCH: caught on the beat, rage back, the hatchet flies again: ' + JSON.stringify(Tn.catch));
    ok(Tn.warcry.n === 1 && Tn.warcry.rage <= 55 && Tn.warcry.iron && Tn.warcry.poise > 20, 'WARCRY CHARGE: poise off the near, half the bar spent, armoured: ' + JSON.stringify(Tn.warcry));
    ok(Tn.reckless.cost >= 1 && Tn.reckless.pct >= 0.03 && Tn.reckless.pct <= 0.05, 'RECKLESS BLOW: costs 4% of his health: ' + JSON.stringify(Tn.reckless));
    ok(Tn.chained.n >= 1 && Tn.chained.gain >= 0.4, 'CHAINED RAGE: a kill in a frenzy extends it: ' + JSON.stringify(Tn.chained));
    ok(Tn.leap.n === 1 && Tn.leap.air && Tn.leap.hit > 0 && Tn.leap.landed, 'BERSERK LEAP: a committed wind let go upward leaps and lands in a split: ' + JSON.stringify(Tn.leap));
    ok(Tn.rampage.n === 1 && Tn.rampage.stand <= 3 && Tn.rampage.haste > 0 && Tn.rampageAfter.debt > 0 && Tn.rampageAfter.take >= 1.25, 'UNBOWED RAMPAGE: a rampage, then the debt: ' + JSON.stringify([Tn.rampage, Tn.rampageAfter])); }
} finally { try { await pg.close(); } catch {} }
if (fails.length) { console.log('FAIL'); for (const m of fails) console.log(m); process.exit(1); }
console.log('Berserker identity: the wind-up COMMIT (armoured, no turning, size grows), the WIDE SLOW CLEAVE, the dash-strike shove, the AoE stamina costs and the six L25-L50 techniques hold.');
