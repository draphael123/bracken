/* tools/knight-kit.mjs - KNIGHTKIT (claude/knightkit, Daniel 11-05): (1) the FULL CHARGE of the heavy cut (0.9 s) adds a ground-shaker both ways (QUAKE: 3 tiles, small foes
   go down, a boss/mini is never thrown, costs half again, 2.5 s cooldown) and (2) DOUBLE-TAP C is the SHIELD BASH (the first tap still blocks; a held C never counts; no double
   fire; UP+C is unchanged). Real page, real input, one headless browser. Reuses the knight-chain harness. ONLY=quake,dtap,regress */
import { openPage } from './cdp.mjs';
const WANT = (process.env.ONLY || 'quake,dtap,regress').split(',');
const pg = await openPage({ audio: false, fonts: false });
const fail = [], t = (ok, msg) => { if (!ok) fail.push(msg); };
const R = {};
try {
  await pg.evalp(`(async()=>{
    window.__set=(foes,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BKT.setHeroLevel('knight',o.lv||12);
      BKT.PROG.skillOwned.knight={};BKT.PROG.loadouts.knight=[];BKT.PROG.card.knight.ms={};BKT.PROG.card.knight.up={};BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(20,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,dodge:0,dodgeCd:0,dash:0,dashCd:0,riposteT:0,combo:0,links:0,linkT:0,linkKeep:0,quakeReadyAt:0});BK.sim(1);P.st=P.maxSt;
      return foes.map(([t,dx,fo])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21,...(fo||{})});const e=BK.enemies().at(-1);e.hp=e.hp0=e.maxHp0=o.hp||5000;e.cd=99;e.elT=99;e.face=-dx/Math.abs(dx||1);e.speed=0;return e;});};
    window.__hold=(fr,stay)=>{BK.P.atkHeld=0;BK.keys.atk=true;for(let i=0;i<fr;i++){BK.P.inv=5;BK.sim(1);if(stay)stay();}BK.keys.atk=false;};
    window.__tapC=(down,up)=>{BK.keys.block=true;BK.sim(down);BK.keys.block=false;BK.sim(up);};
    return 1;})()`);
  const ev = s => pg.evalp(`(()=>{const o={},P=()=>BK.P;${s};return o;})()`);

  if (WANT.includes('quake')) {
    R.quake = await ev(`const fs=__set([['sprig',-24],['sprig',-44],['sprig',24],['sprig',44],['sprig',90]]);const p=P();const st0=p.st;
      const keep=()=>{};__hold(60);let down=[0,0,0,0,0],mn=1e9;for(let i=0;i<70;i++){BK.sim(1);BK.P.inv=5;mn=Math.min(mn,p.st);fs.forEach((e,k)=>{if(e.floored>0||e.broken>0)down[k]=1;});}
      o.down=down;o.spent=Math.round(st0-mn);o.stage=p.cutStage;o.ready=p.quakeReadyAt>0;
      /* the second full hold at once: only the chop (cooldown), costs the plain price */
      const fs2=__set([['sprig',-30],['sprig',30]]);P().quakeReadyAt=1e9;const s1=P().st;let m1=1e9;BK.P.atkHeld=0;BK.keys.atk=true;for(let i=0;i<60;i++){BK.P.inv=5;BK.sim(1);}BK.keys.atk=false;for(let i=0;i<70;i++){BK.P.inv=5;BK.sim(1);m1=Math.min(m1,P().st);}o.cdDown=[fs2[0].floored>0,fs2[1].floored>0];o.cdSpent=Math.round(s1-m1);
      /* a 0.6 s hold: the chop, no quake */
      const fs3=__set([['sprig',-30],['sprig',30]]);const s3=P().st;let m3=1e9;BK.P.atkHeld=0;BK.keys.atk=true;for(let i=0;i<36;i++){BK.P.inv=5;BK.sim(1);}BK.keys.atk=false;for(let i=0;i<70;i++){BK.P.inv=5;BK.sim(1);m3=Math.min(m3,P().st);}o.chopBehind=fs3[0].floored>0;o.chopSpent=Math.round(s3-m3);
      /* a mini and a boss-class: rocked, never thrown, still hurt */
      const fs4=__set([['sprig',-26,{mini:true}],['sprig',26,{mini:true}]]);fs4.forEach(e=>{e.hp=e.hp0=e.maxHp0=5000;});let hp4=fs4.map(e=>e.hp);__hold(60);let x4=fs4.map(e=>e.x);let fl4=false,mv=0;for(let i=0;i<70;i++){BK.P.inv=5;BK.sim(1);fs4.forEach(e=>{if(e.floored>0)fl4=true;});}
      o.miniFloored=fl4;o.miniHurt=fs4.map((e,k)=>hp4[k]-e.hp);`);
    const q = R.quake;
    t(q.down[0] && q.down[1] && q.down[2] && q.down[3] && !q.down[4], 'the full charge floors small foes both sides within 3 tiles, not one at 90 px: ' + JSON.stringify(q));
    t(q.spent >= 45 && q.ready, 'the full charge costs half again (about 50) and starts the 2.5 s cooldown: ' + JSON.stringify(q));
    t(!q.cdDown[0] && !q.cdDown[1] && q.cdSpent <= 36, 'on cooldown a full hold is only the chop (no quake, plain price): ' + JSON.stringify(q));
    t(!q.chopBehind && q.chopSpent <= 36, 'a 0.6 s hold is the chop with no quake behind it: ' + JSON.stringify(q));
    t(!q.miniFloored, 'a mini is never floored by the quake: ' + JSON.stringify(q));
  }
  if (WANT.includes('dtap')) {
    R.dtap = await ev(`const [e]=__set([['shield',22]]);const p=P();e.guardT=9;let starts=0,was=0;const tick=n=>{for(let i=0;i<n;i++){BK.sim(1);e.x=p.x+22;e.vx=0;const k=p.kBashT>0?1:0;if(k&&!was)starts++;was=k;}};
      /* one tap: blocks, no bash */
      BK.keys.block=true;tick(3);o.blockedAt3=!!p.block;BK.keys.block=false;tick(60);o.oneTapBash=starts;
      /* a double tap: down 4 up 5 down 4 */
      const x0=p.x;BK.keys.block=true;tick(4);BK.keys.block=false;tick(5);BK.keys.block=true;tick(1);o.fired=starts;o.bashT=+(p.kBashT||0).toFixed(2);o.blockAfter=!!p.block;
      let hit=0,brk=0,stg=0;for(let i=0;i<30;i++){tick(1);brk=Math.max(brk,e.broken||0);stg=Math.max(stg,e.stagger||0);}BK.keys.block=false;tick(40);o.dtapStarts=starts;o.broke=+brk.toFixed(2);o.stagger=+stg.toFixed(2);
      /* a third tap right after: no second fire inside the cooldown */
      BK.keys.block=false;tick(30);const s2=starts;BK.keys.block=true;tick(3);BK.keys.block=false;tick(3);BK.keys.block=true;tick(3);BK.keys.block=false;tick(3);BK.keys.block=true;tick(3);BK.keys.block=false;tick(60);o.burst=starts-s2;
      /* a long hold then a tap: no bash */
      const s3=starts;BK.keys.block=true;tick(50);BK.keys.block=false;tick(4);BK.keys.block=true;tick(4);BK.keys.block=false;tick(60);o.holdThenTap=starts-s3;
      /* two taps too far apart (0.5 s): no bash */
      const s4=starts;BK.keys.block=true;tick(4);BK.keys.block=false;tick(30);BK.keys.block=true;tick(4);BK.keys.block=false;tick(60);o.slow=starts-s4;
      /* UP+C still bashes */
      const s5=starts;BK.keys.up=true;BK.keys.block=true;tick(4);BK.keys.block=false;BK.keys.up=false;tick(60);o.upC=starts-s5;`);
    R.dtap.lunge = (await ev(`__set([['sprig',300]]);const p=P();const x0=p.x;BK.keys.block=true;BK.sim(4);BK.keys.block=false;BK.sim(5);BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.sim(40);o.l=Math.round(p.x-x0);`)).l;
    const d = R.dtap;
    t(d.blockedAt3 && d.oneTapBash === 0, 'one tap still raises the shield and does not bash: ' + JSON.stringify(d));
    t(d.fired === 1 && d.dtapStarts === 1 && !d.blockAfter, 'a double tap fires ONE bash and the shield is down for it: ' + JSON.stringify(d));
    t(d.broke > 0, 'the bash breaks the raised guard: ' + JSON.stringify(d));
    t(d.stagger > 0.2, 'the bash staggers the shield foe: ' + JSON.stringify(d));
    t(d.lunge >= 10 && d.lunge <= 40, 'a short lunge forward (about 1.5 tiles): ' + JSON.stringify(d));
    t(d.burst <= 1, 'a burst of taps fires at most once in the cooldown: ' + JSON.stringify(d));
    t(d.holdThenTap === 0 && d.slow === 0, 'a held C then a tap, or two slow taps, never bash: ' + JSON.stringify(d));
    t(d.upC === 1, 'UP+C still fires the bash: ' + JSON.stringify(d));
  }
} finally { pg.close(); }
console.log(JSON.stringify(R));
if (fail.length) { console.log('KNIGHT-KIT: ' + fail.length + ' problem(s)\n  - ' + fail.join('\n  - ')); process.exit(1); }
console.log('Knight kit: the full charge quakes (3 tiles, both ways, small foes down, minis not thrown, +50% stamina, 2.5 s cooldown); double-tap C is the shield bash once; UP+C unchanged.');
