// tools/berserker.mjs — THE BERSERKER'S KIT, PLAYED THROUGH HIS REAL INPUT IN THE REAL PAGE (claude/berserker; REWORKED claude/berserker2,
// scratch/brief-berserker2.md - the design changes are stated where the assertions changed).
//   flurry    the chops run 1..5 and the run goes on only while they land: the FIFTH is the CROSS-CHOP (heavySwing), a chop that whiffs
//             starts the run over; the flurry's box is short (no further than 20 px out) and in the air both axes spin (a box both sides)
//             (was: a run of THREE, the third the shove - berserker2: L-R-L-R ending in the cross-chop)
//   cross     HOLD X is the DOUBLE CHOP: a heavy, and it leans on a mini's poise far harder than a chop
//   roll      the shoulder roll knocks a small foe aside (shoved, staggered) and goes through it
//   take      HOLD C, TAKE IT: raised as the blow lands it is the PARRY (nothing lost, the riposte window, and the next cut is the CROSS-CHOP);
//             held past the beat a yellow blow is ABSORBED - a tenth of it, stamina spent, rage off the rest - and so is the next one (it is a
//             held guard now: was the brace, ONE blow, then down); let go, the next blow is the full hit; a RED one is TOO STRONG and lands;
//             out of stamina the guard breaks (half); and at 1 hp an absorbed blow leaves him on 1 - HE NEVER KILLS HIMSELF
//   rage      dealing and taking damage fill it; out of combat it drains (down to the whetstone's half bar, which then holds it)
//   frenzy    full rage + DOWN+C is the FRENZY (a plain C is TAKE IT): quicker chops, no flinch, x1.25 taken - and that quarter never kills him -,
//             HEAL ON HIT (~2.5% of what lands: was a heal per kill) and REND: four frenzied blows on one foe CRACK it, and that blow is a
//             HEAVY (the beast family's key); no frenzy, no rend (a mash never cracks); the war cry quickens a partner (hasteT)
//   throw     UP+C hurls the hatchet: one-handed until he walks over it (slower chops - the same moves: berserker2 lets him double-chop
//             one-handed, half the poise) and it hits a foe on the way
//   coil      DOWN held: coiled, rage ticks up to the cap and no further; a way held only turns him; let go with no way: no pounce
//   pounce    coiled, a way held, let go of down: the leap goes that way axes-first, hits a small foe (a 'dash') and knocks it along, lands
//             committed (pounceRec), costs stamina and no health; a bigger foe stops it; a pit ahead shortens it (he never leaps into it);
//             a hit while coiled stands him up and no pounce comes of it
//   whet      THE WHETSTONE (was WORKING UP on the crouch): stood calm, his rage creeps up to half a bar and no further
//   skills    every one of his nine actives fires when bought and slotted (cooldown set, stamina spent)
//   art       his set has every key the draw asks for (the new keys too, placeholders for now), a BARE set (one axe) and both sets wear a
//             weapon skin on the axe heads only
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
    /* the flurry: five landed chops, the fifth the cross-chop */
    __bz();let e=__foe(16);BK.sim(2);const combos=[],heavy=[],reach=[];for(let i=0;i<5;i++){P().st=P().maxSt;BK.press('atk');let rc=0;for(let f=0;f<26;f++){BK.sim(1);e.x=P().x+16;const b=BK.attackBox();if(b)rc=Math.max(rc,Math.round(b.r-P().x));}combos.push(P().combo);heavy.push(!!P().heavySwing);reach.push(rc);}
    e.alive=false;P().st=P().maxSt;BK.press('atk');BK.sim(40);combos.push(P().combo);P().st=P().maxSt;BK.press('atk');BK.sim(4);combos.push(P().combo);
    /* in the air: both axes spin */
    __bz();BK.press('jump');BK.sim(8);P().st=P().maxSt;BK.press('atk');let spinL=0,spinR=0;for(let f=0;f<16;f++){BK.sim(1);const b=BK.attackBox();if(b){spinL=Math.max(spinL,Math.round(P().x-b.l));spinR=Math.max(spinR,Math.round(b.r-P().x));}}
    out.flurry={combos,heavy,reach,spinL,spinR};
    /* the double chop on a mini's bar (70) */
    const poiseOf=h=>{__bz();
      const b=__foe(20,'brute');b.maxHp=b.hp;b.mini=true;BK.sim(2);P().st=P().maxSt;K.atk=true;for(let i=0;i<28;i++){BK.sim(1);b.x=P().x+20;}K.atk=false;let most=0,heavy=false;   /* (claude/chargetiers: the double chop is T1 now and no longer goes by itself at the full wind - let go where it used to go, 0.5 s) */for(let i=0;i<40;i++){BK.sim(1);b.x=P().x+20;heavy=heavy||P().heavy;most=Math.max(most,b.poise||0,b.broken>0?100:0);}return {most,heavy,hit:b.hp0-b.hp};};
    out.cross={bz:poiseOf('berserker')};
    /* (claude/chargetiers) THE RAGE WIND-UP: the climb and its poses, each blow, rage quickens it, the auto-loose */
    { const T={}, hold=n=>{P().st=P().maxSt;K.atk=true;BK.press('atk');for(let i=0;i<n;i++)BK.step(1);}, rel=()=>{K.atk=false;BK.step(2);};
      __bz(); const seen=[],keys=[]; K.atk=true; BK.press('atk'); for(let i=0;i<110;i++){BK.step(1);const t=Z().tier;if(t&&!seen.includes(t))seen.push(t);if(t>=2&&!keys.includes(P().lastKey))keys.push(P().lastKey);} T.at=Z().tierAt; T.seen=seen; T.keys=keys; rel(); T.t3=Z().heavyTier; BK.sim(60);
      __bz(); hold(40); rel(); T.t1=Z().heavyTier; BK.sim(60);
      __bz(); const bk=__foe(-15,'sprig',5000); bk.biteCd=99; BK.sim(1); const hb=bk.hp; hold(70); rel(); T.t2=Z().heavyTier; const k2=[]; for(let i=0;i<20;i++){BK.step(1);k2.push(P().lastKey);} T.t2key=k2.includes('bzTier2'); T.behind=hb-bk.hp; bk.alive=false; BK.sim(60);
      __bz(); const fw=__foe(44,'sprig',5000); fw.biteCd=99; BK.sim(1); hold(100); rel(); T.t3b=Z().heavyTier; const k3=[]; for(let i=0;i<24;i++){BK.step(1);k3.push(P().lastKey);fw.x=Math.max(fw.x,P().x+40);} T.t3key=k3.includes('bzTier3'); T.split={floored:(fw.floored||0)>BK.time,hit:fw.hp0-fw.hp}; fw.alive=false; BK.sim(60);
      const pz=n=>{__bz();const b=__foe(20,'brute');b.maxHp=b.hp;b.mini=true;b.poise=0;b.biteCd=99;BK.sim(2);P().st=P().maxSt;K.atk=true;BK.press('atk');for(let i=0;i<n;i++){P().inv=0.5;BK.sim(1);b.x=P().x+20;}K.atk=false;let most=0;   /* (the brute swings on its own clock: a blow mid-hold drops the wind-up - he is kept untouchable for the hold, as the other cases' foes are kept quiet) */for(let i=0;i<40;i++){BK.sim(1);b.x=P().x+20;most=Math.max(most,b.poise||0,b.broken>0?999:0);}b.alive=false;BK.sim(30);return most;};
      T.p1=pz(40); T.p3=pz(100);
      __bz(); P().rage=60; K.atk=true; BK.press('atk'); BK.step(2); T.atHot=Z().tierAt; K.atk=false; BK.sim(60);
      __bz(); K.atk=true; BK.press('atk'); let fired=-1,ft=0; for(let i=0;i<200;i++){BK.sim(1);if(P().heavy&&fired<0){fired=i;ft=P().bzTier;}} K.atk=false; T.auto={fired,tier:ft}; BK.sim(60);
      out.tiers=T; }
    /* roll */
    __bz();e=__foe(30);BK.sim(2);const x0=e.x;BK.press('dodge');for(let i=0;i<24;i++)BK.sim(1);out.roll={shoved:Math.round(e.x-x0),stag:e.stagger>0||e.shoved>0,passed:P().x>e.x-4,shoves:Z().stats.rollShoves};
    /* TAKE IT */
    { const T={};
      __bz();e=__foe(14);BK.sim(2);P().st=P().maxSt;K.block=true;BK.sim(2);let hp0=P().hp;T.beat=BKT.damagePlayer(e.x,10,{who:e});T.beatLost=hp0-P().hp;T.parries=Z().stats.parries;T.ripT=+(P().riposteT||0).toFixed(2);
      K.block=false;for(let i=0;i<30&&BK.stop>0;i++)BK.sim(1);/* (a press inside the parry's hitstop is not read) */T.guardStill=Z().takeUp;P().st=P().maxSt;BK.press('atk');for(let i=0;i<24&&!(P().atk>=0);i++)BK.sim(1);T.ripCross=!!P().heavySwing&&!!P().swingRiposte;BK.sim(40);
      __bz();e=__foe(14);BK.sim(2);P().st=P().maxSt;K.block=true;BK.sim(30);P().inv=0;const st1=P().st,rg1=P().rage;hp0=P().hp;T.held=BKT.damagePlayer(e.x,20,{who:e});T.heldLost=hp0-P().hp;T.st=Math.round(st1-P().st);T.rage=Math.round(P().rage-rg1);
      P().inv=0;hp0=P().hp;T.second=BKT.damagePlayer(e.x,20,{who:e});T.secondLost=hp0-P().hp;
      P().inv=0;hp0=P().hp;T.behind=BKT.damagePlayer(P().x-14,20,{});T.behindLost=hp0-P().hp;
      K.block=false;BK.sim(30);T.down=!Z().takeUp;P().inv=0;P().hurt=0;hp0=P().hp;T.after=BKT.damagePlayer(e.x,10,{who:e});T.afterLost=hp0-P().hp;
      __bz();e=__foe(14);BK.sim(2);const R=BK.riposte();R.resetStats();K.block=true;BK.sim(2);hp0=P().hp;T.red=BKT.damagePlayer(e.x,10,{who:e,unblockable:true});T.redLost=hp0-P().hp;T.too=R.stats.tooStrong;K.block=false;
      __bz();e=__foe(14);BK.sim(2);K.block=true;BK.sim(30);P().hp=1;P().inv=0;T.at1=BKT.damagePlayer(e.x,40,{who:e});T.hp1=P().hp;T.dead1=!!P().dead;T.floored=Z().stats.floored;K.block=false;
      __bz();e=__foe(14);BK.sim(2);K.block=true;BK.sim(30);P().st=0;P().inv=0;hp0=P().hp;T.broke=BKT.damagePlayer(e.x,20,{who:e});T.brokeLost=hp0-P().hp;T.brokeN=Z().stats.takeBroken;K.block=false;
      out.take=T; }
    /* rage fill + drain */
    __bz();e=__foe(16);BK.sim(2);for(let i=0;i<4;i++){P().st=P().maxSt;BK.press('atk');for(let f=0;f<20;f++){BK.sim(1);e.x=P().x+16;}}const dealt=P().rage;P().inv=0;BKT.damagePlayer(e.x,10,{who:e,unblockable:true});const took=P().rage-dealt;
    e.alive=false;P().rage=90;BK.sim(60*2);const r2s=P().rage;BK.sim(60*3);out.rage={dealt:Math.round(dealt),took:Math.round(took),after2s:Math.round(r2s),after5s:Math.round(P().rage)};
    /* frenzy */
    __bz();P().rage=100;P().bzFightT=BK.time||0;const sm0=Z().swingMul;K.down=true;K.block=true;BK.sim(2);K.block=false;K.down=false;BK.sim(2);const fr=P().frenzyT,guard=Z().takeUp,smF=Z().swingMul;BK.sim(30);
    e=__foe(14);P().inv=0;const fz=P().frenzyT;P().frenzyT=0;let hpb=P().hp;BKT.damagePlayer(e.x,20,{who:e,unblockable:true});const lostN=hpb-P().hp;P().frenzyT=fz;P().inv=0;P().hurt=0;const hp3=P().hp;BKT.damagePlayer(e.x,20,{who:e,unblockable:true});const lostF=hp3-P().hp,hurtF=P().hurt>0;
    /* ... and the frenzy's quarter never kills him: left with exactly what the blow would take without it */
    P().inv=0;P().hurt=0;P().hp=lostN+1;BKT.damagePlayer(e.x,20,{who:e,unblockable:true});const hpSur=P().hp,deadSur=!!P().dead;P().hp=P().maxHp-30;
    /* heal on hit */
    e.x=P().x+16;const healed0=Z().stats.healed,hpk=P().hp,ehp=e.hp;for(let i=0;i<5;i++){P().st=P().maxSt;BK.press('atk');for(let f=0;f<20;f++){BK.sim(1);e.x=P().x+16;}}
    out.frenzy={frenzyT:+fr.toFixed(2),guard,swing0:sm0,swing:smF,lost20:lostF,lostN,hurt:hurtF,healed:Z().stats.healed-healed0,dealtF:ehp-e.hp,hpGain:P().hp-hpk,take:Z().takeMul,hpSur,deadSur};
    /* REND: no frenzy, no rend; in a frenzy every fourth blow on one foe CRACKS it and is a HEAVY (the beast family's key) */
    { __bz();e=__foe(16,'brute');BK.sim(2);const keyT=new Set(),c0=Z().stats.cracks,r0=Z().stats.rends;
      /* (a broken brute is finished by the next cut - the finisher - so his bar is held empty here: this is about the rend, not the poise) */
      const chop=n=>{for(let i=0;i<n;i++){P().st=P().maxSt;BK.press('atk');for(let f=0;f<18;f++){BK.sim(1);e.x=P().x+16;e.stagger=0;e.poise=0;e.poiseCd=99;if(e.keyHit!==undefined)keyT.add(e.keyHit);}}};
      BK.log=[];chop(6);BK.sim(40);const cold={cracks:Z().stats.cracks-c0,heavy:BK.log.filter(x=>x.k==='dmgE'&&x.e===e&&x.heavy).length,hits:BK.log.filter(x=>x.k==='dmgE'&&x.e===e).length};
      P().rage=100;K.down=true;K.block=true;BK.sim(2);K.block=false;K.down=false;BK.sim(60);const fz=P().frenzyT;keyT.clear();BK.log=[];chop(9);
      const L=BK.log.filter(x=>x.k==='dmgE'&&x.e===e);BK.log=null;out.rend={cold,fz,hits:L.length,heavy:L.filter(x=>x.heavy).length,cracks:Z().stats.cracks-c0,rends:Z().stats.rends-r0,keyed:keyT.size}; }
    /* throw */
    __bz();e=__foe(70);BK.sim(2);const sw2=Z().swingMul;P().st=P().maxSt;K.up=true;K.block=true;BK.sim(2);K.block=false;K.up=false;let hitA=false;for(let i=0;i<50;i++){BK.sim(1);hitA=hitA||e.hp<e.hp0;}
    const one=Z().oneHanded,swOne=Z().swingMul,state=Z().axe&&Z().axe.state;K.atk=true;BK.sim(40);const heavyOne=P().heavy||P().charge>0;K.atk=false;BK.sim(30);
    const ax=Z().axe;if(ax){for(let i=0;i<200&&Z().oneHanded;i++){K.right=P().x<ax.x;K.left=P().x>ax.x;BK.sim(1);}}K.right=K.left=false;
    out.throw={one,state,hitA,sw2,swOne,heavyOne,picked:!Z().oneHanded,throws:Z().stats.throws,pickups:Z().stats.pickups};
    /* the coil */
    { const c={p00:C().stats.pounces};__bz([],8);BK.sim(2);P().rage=0;K.down=true;BK.sim(60*25);c.coiled=C().coiled;c.rage=Math.round(P().rage);c.ducking=!!P().ducking;
      K.left=true;BK.sim(6);c.turned=P().face===-1&&!!P().ducking&&Math.abs(P().vx)<1;K.left=false;BK.sim(2);
      const x0=P().x;K.down=false;BK.sim(20);c.noWay=C().stats.pounces-c.p00;c.stayed=Math.abs(P().x-x0)<2;
      /* a hit while coiled stands him up: no pounce comes of it */
      c.p0=C().stats.pounces;__bz([],8);BK.sim(2);K.down=true;BK.sim(40);P().inv=0;BKT.damagePlayer(P().x+10,5,{});K.right=true;BK.sim(2);K.down=false;BK.sim(20);K.right=false;c.hitPounce=C().stats.pounces-c.p0;c.broken=C().stats.broken;
      out.coil=c; }
    /* the pounce */
    { const p={},S0=C().stats;__bz();P().face=1;e=__foe(70);BK.sim(2);const ex0=e.x,x0=P().x,hp0=P().hp;K.down=true;BK.sim(40);K.right=true;BK.sim(2);P().st=P().maxSt;const st0=P().st;K.down=false;BK.sim(1);p.st=Math.round(st0-P().st);K.right=false;
      let rec=false,flew=0;for(let i=0;i<60;i++){BK.sim(1);if(P().pounceT>0)flew++;rec=rec||P().pounceRec>0;}
      p.flew=flew;p.moved=Math.round(P().x-x0);p.hit=C().stats.pounceHits-S0.pounceHits;p.knocked=Math.round(e.x-ex0);p.foeLost=e.hp0-e.hp;p.rec=rec;p.hpCost=hp0-P().hp;p.ground=!!P().ground;
      /* a bigger foe stops it dead */
      __bz();P().face=1;const b=__foe(60,'brute');BK.sim(2);const bx=P().x;K.down=true;BK.sim(40);K.right=true;BK.sim(2);K.down=false;for(let i=0;i<60;i++)BK.sim(1);K.right=false;
      p.stops=C().stats.pounceStops-S0.pounceStops;p.pastBrute=P().x>b.x;p.bruteLost=b.hp0-b.hp;
      /* a pit ahead: shortened, never into it */
      __bz();P().face=1;const L=BK.L,tx=Math.floor(P().x/16);for(let x=tx+3;x<tx+12;x++)for(let y=22;y<L.H;y++)L.grid[y*L.W+x]=0;const y0=P().y;
      const S1=C().stats;K.down=true;BK.sim(60);K.right=true;BK.sim(2);K.down=false;BK.sim(1);K.right=false;for(let i=0;i<90;i++)BK.sim(1);
      p.pit={pounces:C().stats.pounces-S1.pounces,shortened:C().stats.shortened-S1.shortened,refused:C().stats.refused-S1.refused,dx:Math.round(P().x-tx*16),y:Math.round(P().y-y0),dead:!!P().dead,ground:!!P().ground,edge:(tx+3)*16};
      out.pounce=p; }
    /* the whetstone */
    { const w={};__bz([],8);BK.sim(2);P().rage=0;P().bzFightT=-99;BK.sim(60*6);w.rage=Math.round(P().rage);w.whet=C().whetting;w.pose=P().lastKey;
      BK.sim(60*20);w.capped=Math.round(P().rage);out.whet=w; }
    /* skills */
    const IDS=['bzRoar','bzSpin','bzHarden','bzCleave','bzRampage','bzShrug','bzStand','bzUnchained','bzStorm'];out.skills={};
    for(const id of IDS){__bz([id],24);__foe(24);BK.sim(2);P().st=P().maxSt;const st=P().st;BK.press('throw');BK.sim(3);out.skills[id]={cd:+((P().cds||{})[id]||0).toFixed(1),spent:Math.round(st-P().st)};}
    /* art */
    const set=BKT.heroSet('bracken','steel',false,'berserker');const need=['idle','run','jump','fall','land','takeoff','apex','skid','climb','atk','atkB','atkC','air','plunge','hurt','crouch','slide','block','dashAtk','cast','fidget','dance','bzWind2','bzWind3','bzTier2','bzTier3','slump','swim','tread','roll','grind','rise','sweep','airUp','windup','heavy','blast','bzThrow','bzRoar','bzSpin','bzHarden','bzCleave','bzRamp','bzShrug','bzStand','bzUnch','bzStorm',
      'bzFlurryL','bzFlurryR','bzCross','bzAirSpin','bzPlunge','bzTake','bzCoil','bzPounce','bzPLand','bzWhet'];
    const gold=BKT.heroSet('bracken','ember',false,'berserker');const diff=(a,b)=>{const A=a.getContext('2d').getImageData(0,0,a.width,a.height).data,B=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let n=0;for(let i=0;i<A.length;i+=4){if(A[i]!==B[i]||A[i+1]!==B[i+1]||A[i+2]!==B[i+2])n++;}return n;};
    out.art={missing:need.filter(k=>!set.R[k]),bare:!!set.bare,bareMissing:need.filter(k=>!(set.bare&&set.bare.R[k])),skinDiff:diff(set.R.idle[0],gold.R.idle[0])};
    /* yard: his trial loads, and the take-it-on-the-beat, the axe and the frenzy stations can be finished through his real input */
    { const {LEVELS}=window.__LV;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('berserker');BK.reset({fresh:true});BK.applyUpgrades();const i=LEVELS.findIndex(l=>l.id==='trial_berserker');out.yard={found:i>=0};
      if(i>=0){BK.load(i);BK.state='play';BK.god=false;BK.sim(30);const T=BK.L.trial;out.yard.kinds=T.map(s=>s.kind);
        const go=st=>{BK.tp(st.x0+3,19);P().vx=0;P().face=1;BK.sim(30);P().st=P().maxSt;};
        const foes=st=>BK.enemies().filter(e=>e.alive&&e.x>st.x0*16&&e.x<st.gate*16).sort((a,b)=>a.x-b.x);
        let st=T.find(s=>s.kind==='axe');go(st);for(let t=0;t<4&&!st.done;t++){P().face=1;P().st=P().maxSt;K.up=true;K.block=true;BK.sim(2);K.up=K.block=false;BK.sim(60);
          for(let f=0;f<240&&Z().oneHanded;f++){const a=Z().axe;if(!a)break;K.right=P().x<a.x-2;K.left=P().x>a.x+2;BK.sim(1);}K.left=K.right=false;BK.tp(st.x0+3,19);BK.sim(20);}
        out.yard.axe=!!st.done;out.yard.axeDbg={hits:Z().stats.axeHits,throws:Z().stats.throws,got:st.got||0,px:Math.round(P().x)};
        st=T.find(s=>s.kind==='meter');go(st);BK.sim(10);const rg=P().rage;K.down=true;K.block=true;BK.sim(2);K.block=false;K.down=false;BK.sim(30);out.yard.meter=!!st.done;out.yard.meterRage=Math.round(rg);
        st=T.find(s=>s.kind==='flash');go(st);const e=foes(st)[0];let glintAt=-1,pressed=0;
        for(let f=0;f<60*60&&!st.done;f++){P().face=Math.sign(e.x-P().x)||1;P().st=P().maxSt;const gap=Math.abs(e.x-P().x);K.right=gap>30&&e.x>P().x;K.left=gap>30&&e.x<P().x;
          if(e.mode==='cutTell'&&e.glint){if(glintAt<0)glintAt=f;if(!pressed&&f-glintAt>=3){K.block=true;BK.sim(1);K.block=false;pressed=1;continue;}}else{glintAt=-1;pressed=0;}BK.sim(1);}
        K.left=K.right=false;out.yard.flash=!!st.done;}}
    return out;})()`, 600000);
  console.log(JSON.stringify(r));
  const F = r.flurry;
  ok(F.combos.slice(0, 5).join() === '1,2,3,4,5' && F.heavy.join() === 'false,false,false,false,true', 'flurry: five landed chops did not run 1..5 with the fifth the cross-chop: ' + JSON.stringify(F));
  ok(F.combos[6] === 1, 'flurry: a chop after a whiff did not start the run over: ' + F.combos);
  ok(Math.max(...F.reach.slice(0, 4)) <= 20 && Math.max(...F.reach.slice(0, 4)) >= 16, 'flurry: the chops should reach 16-20 px (short: the knight\'s sword is longer): ' + F.reach);
  ok(F.spinL >= 12 && F.spinR >= 12, 'air: both axes should spin round him (a box both sides): ' + JSON.stringify(F));
  ok(r.cross.bz.heavy && r.cross.bz.most >= 60, 'double chop: not a heavy, or one does not fill most of a mini\'s poise bar: ' + JSON.stringify(r.cross));
  { const T = r.tiers;   /* (claude/chargetiers) THE RAGE WIND-UP */
    ok(T.seen.join() === '1,2,3' && T.at[1] - T.at[0] >= 0.4 && T.at[2] - T.at[1] >= 0.4, 'tiers: the hold climbs T1, T2, T3 at least 0.4 s apart: ' + JSON.stringify(T));
    ok(T.keys.includes('bzWind2') && T.keys.includes('bzWind3'), 'tiers: T2 and T3 held show their own wind-up poses: ' + JSON.stringify(T.keys));
    ok(T.t1 === 1 && T.t2 === 2 && T.t3 === 3 && T.t3b === 3, 'tiers: let go on T1/T2/T3, that tier comes down: ' + [T.t1, T.t2, T.t3, T.t3b]);
    ok(T.t2key && T.behind > 0, 'tiers: THE WHEEL cuts the foe BEHIND him, in its own frames: ' + JSON.stringify({ key: T.t2key, behind: T.behind }));
    ok(T.t3key && T.split.floored && T.split.hit > 0, 'tiers: the GROUND-SPLITTER splits the floor: a foe out past the axes is hit and knocked down: ' + JSON.stringify(T.split) + ' ' + T.t3key);
    ok(T.p3 > T.p1, 'tiers: the GROUND-SPLITTER leans harder on a mini\'s bar than the overhead chop: ' + [T.p1, T.p3]);
    ok(T.atHot[2] < T.at[2] - 0.15, 'tiers: RAGE winds them quicker: ' + JSON.stringify([T.at, T.atHot]));
    ok(T.auto.fired > 0 && T.auto.tier === 3, 'tiers: held at T3 it comes down by itself: ' + JSON.stringify(T.auto)); }
  ok(r.roll.stag && r.roll.shoves > 0, 'roll: the shoulder roll did not knock the small foe aside: ' + JSON.stringify(r.roll));
  const T = r.take;
  ok(T.beat === 'blocked' && T.beatLost === 0 && T.parries === 1 && T.ripT > 0 && T.ripCross, 'take it: raised as the blow landed it should parry (nothing lost, the riposte window, the next cut the cross-chop): ' + JSON.stringify(T));
  ok(T.held === 'blocked' && T.heldLost >= 1 && T.heldLost <= 3 && T.st > 0 && T.rage >= 15, 'take it: held past the beat a 20 blow should be absorbed - a tenth lost, stamina spent, rage off the rest: ' + JSON.stringify(T));
  ok(T.second === 'blocked' && T.secondLost <= 3, 'take it: it is a held guard - a second blow is absorbed too: ' + JSON.stringify(T));
  ok(T.behind === 'hit' && T.behindLost > 3, 'take it: a blow from behind should find him whole: ' + JSON.stringify(T));
  ok(T.down && T.after === 'hit' && T.afterLost > 3, 'take it: let go, the next blow is the full hit: ' + JSON.stringify(T));
  ok(T.red === 'hit' && T.redLost > 3 && T.too > 0, 'take it: a RED blow on the beat should be TOO STRONG and land: ' + JSON.stringify(T));
  ok(T.at1 === 'blocked' && T.hp1 === 1 && !T.dead1 && T.floored > 0, 'take it: HE NEVER KILLS HIMSELF - at 1 hp an absorbed blow must leave him on 1: ' + JSON.stringify(T));
  ok(T.broke === 'hit' && T.brokeLost > 0 && T.brokeN === 1, 'take it: out of stamina the guard should break (half the blow): ' + JSON.stringify(T));
  ok(r.rage.dealt > 10 && r.rage.took > 5, 'rage: dealing and taking did not fill it: ' + JSON.stringify(r.rage));
  ok(r.rage.after5s < r.rage.after2s && r.rage.after5s >= 45, 'rage: it should drain out of combat down to the whetstone\'s half bar: ' + JSON.stringify(r.rage));
  const Z = r.frenzy;
  ok(Z.frenzyT > 5 && !Z.guard, 'frenzy: full rage + DOWN+C did not start a frenzy: ' + JSON.stringify(Z));
  ok(Z.swing > Z.swing0 && !Z.hurt && Z.lost20 > Z.lostN, 'frenzy: not quicker / flinched / not x1.25 taken: ' + JSON.stringify(Z));
  ok(Z.hpSur === 1 && !Z.deadSur, 'frenzy: HE NEVER KILLS HIMSELF - the frenzy\'s quarter killed him (or did not leave him on 1): ' + JSON.stringify(Z));
  ok(Z.healed >= 1 && Z.healed <= Math.ceil(Z.dealtF * 0.03) + 1, 'frenzy: heal on hit should be ~2.5% of what lands: ' + JSON.stringify(Z));
  const R = r.rend;
  ok(R.cold.hits >= 4 && R.cold.cracks === 0 && R.cold.heavy === 0, 'rend: without a frenzy nothing should rend or crack: ' + JSON.stringify(R));
  ok(R.hits >= 8 && R.cracks >= 2 && R.heavy >= 2 && R.heavy <= Math.ceil(R.hits / 4) && R.keyed >= 2, 'rend: every fourth frenzied blow on one foe should CRACK it as a HEAVY (the beast key): ' + JSON.stringify(R));
  ok(r.throw.one && r.throw.hitA && r.throw.swOne < r.throw.sw2 && r.throw.heavyOne && r.throw.picked, 'throw (one-handed: slower chops, the same moves): ' + JSON.stringify(r.throw));
  const Cc = r.coil;
  ok(Cc.coiled && Cc.ducking && Cc.rage > 50 && Cc.rage <= 75, 'coil: held down he should coil and his rage tick up to 75 and no further: ' + JSON.stringify(Cc));
  ok(Cc.turned, 'coil: a way held while coiled should only turn him: ' + JSON.stringify(Cc));
  ok(Cc.noWay === 0 && Cc.stayed, 'coil: let go with no way held - no pounce: ' + JSON.stringify(Cc));
  ok(Cc.hitPounce === 0 && Cc.broken > 0, 'coil: a hit while coiled should stand him up, and no pounce come of it: ' + JSON.stringify(Cc));
  const Pp = r.pounce;
  ok(Pp.flew > 5 && Pp.moved > 40 && Pp.hit >= 1 && Pp.foeLost > 0 && Pp.knocked > 20 && Pp.rec && Pp.st > 0 && Pp.hpCost === 0 && Pp.ground, 'pounce: the leap should carry him at the foe, hit it, knock it along, land committed, cost stamina and no health: ' + JSON.stringify(Pp));
  ok(Pp.stops >= 1 && !Pp.pastBrute && Pp.bruteLost > 0, 'pounce: a big foe should stop it dead: ' + JSON.stringify(Pp));
  ok(!Pp.pit.dead && Pp.pit.ground && Pp.pit.y === 0 && Pp.pit.dx < 48 && (Pp.pit.shortened + Pp.pit.refused) >= 1, 'pounce: a pit ahead - it should be shortened or refused, never into it: ' + JSON.stringify(Pp));
  ok(r.whet.rage > 5 && r.whet.whet && r.whet.capped <= 50 && r.whet.capped >= 45, 'whetstone: stood calm his rage should creep up to half a bar and no further: ' + JSON.stringify(r.whet));
  ok(r.yard.found && r.yard.axe && r.yard.meter && r.yard.flash, 'his yard: ' + JSON.stringify(r.yard));
  for (const [id, s] of Object.entries(r.skills)) ok(s.cd > 0 && s.spent > 0, 'skill ' + id + ' did not fire: ' + JSON.stringify(s));
  ok(!r.art.missing.length && r.art.bare && !r.art.bareMissing.length, 'art: missing keys ' + r.art.missing + ' / bare ' + r.art.bareMissing);
  ok(r.art.skinDiff > 0 && r.art.skinDiff < 40, 'art: a weapon skin changed ' + r.art.skinDiff + ' pixels of his idle (only the axe heads should change)');
  assert.deepEqual(pg.errors, []);
} finally { pg.close(); }
if (fails.length) { console.log('FAIL\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('berserker: ok');
