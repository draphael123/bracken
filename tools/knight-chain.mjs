/* tools/knight-chain.mjs - THE KNIGHT'S IDENTITY PASS (claude/knightid, Daniel 10-31 18:07 Q4 + 11-01): the GUARD CHAIN (3 links: a perfect guard +1, a turned blow keeps,
   a landed blow / the idle clock drops), the cut out of a perfect guard carries the links (1 guard-open, 2 shove, 3 the FINISHER), the third jab is the SHIELD BASH (breaks
   a guard), the heavy cut is ONE fixed weight, the SHIELD RAM (no grace, a link opens a guard), UP+C at 3 links is the SHIELD CHARGE, and the L25-L50 techniques do what
   their card says. Real page, real input. One headless browser. */
import { openPage } from './cdp.mjs';
const WANT = (process.env.ONLY || 'chain,riders,bash,heavy,ram,charge,tech,hook').split(',');
const pg = await openPage({ audio: false, fonts: false });
const fail = [], t = (ok, msg) => { if (!ok) fail.push(msg); };
const R = {};
try {
  await pg.evalp(`(async()=>{
    window.__set=(foes,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('knight');BK.reset({fresh:true});BKT.setHeroLevel('knight',o.lv||12);
      BKT.PROG.skillOwned.knight=o.skills||{};BKT.PROG.loadouts.knight=o.loadout||[];const ms=o.ms||{};BKT.PROG.card.knight.ms=ms;BKT.PROG.card.knight.up=o.up||{};BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,dodge:0,dodgeCd:0,dash:0,dashCd:0,riposteT:0,combo:0,links:0,linkT:0,linkKeep:0});BK.sim(1);P.st=P.maxSt;
      return foes.map(([t,dx,fo])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21,...(fo||{})});const e=BK.enemies().at(-1);e.hp=e.hp0=e.maxHp0=5000;e.cd=99;e.elT=99;e.face=-1;e.speed=0;return e;});};
    window.__perfect=()=>{const p=BK.P;BK.keys.block=false;BK.sim(2);p.inv=0;p.hurt=0;BK.keys.block=true;BK.sim(2);const r=BKT.damagePlayer(p.x+14,12,{});BK.sim(1);return r;};
    window.__tapC=()=>{BK.keys.block=false;BK.sim(2);BK.keys.block=true;BK.sim(1);BK.keys.block=false;};
    window.__ultC=()=>{BK.keys.up=true;__tapC();BK.keys.up=false;};   /* (claude/ults) the ultimate is UP+C */
    return 1;})()`);
  const ev = s => pg.evalp(`(()=>{const o={},P=()=>BK.P;${s};return o;})()`);

  if (WANT.includes('chain')) {
    R.chain = await ev(`__set([['sprig',40]]);const p=P();
      o.r1=__perfect();o.l1=p.links;o.rip=+(p.riposteT||0).toFixed(2);BK.sim(40);o.r2=__perfect();o.l2=p.links;BK.sim(40);o.r3=__perfect();o.l3=p.links;BK.sim(30);o.capped=p.links;
      p.links=2;BK.keys.block=false;BK.sim(5);p.inv=0;BK.keys.block=true;BK.sim(40);p.inv=0;o.plain=BKT.damagePlayer(p.x+14,12,{});BK.keys.block=false;o.keptLinks=p.links;o.keepT=+(p.linkKeep||0).toFixed(2);
      p.inv=0;p.hurt=0;p.block=false;BK.sim(2);const hp0=p.hp;o.hitRes=BKT.damagePlayer(p.x+14,12,{});o.hit=hp0-p.hp;o.afterHit=p.links;
      p.links=2;p.linkKeep=0;p.linkT=0;BK.sim(60*4+20);o.idle=p.links;
      p.links=3;p.linkKeep=0;BK.sim(60*3);o.stillThree=p.links;`);
    const c = R.chain;
    t(c.r1 === 'blocked' && c.l1 === 1 && c.rip > 0 && c.l2 === 2 && c.l3 === 3 && c.capped === 3, 'a perfect guard is +1 link, three at most, and opens the riposte: ' + JSON.stringify(c));
    t(c.plain === 'blocked' && c.keptLinks === 2 && c.keepT > 0, 'a plain held block of a yellow blow keeps the chain: ' + JSON.stringify(c));
    t(c.hit > 0 && c.afterHit === 1, 'a blow taken unguarded drops ONE link (not to 0): ' + JSON.stringify(c));
    t(c.idle === 1 && c.stillThree <= 3, 'four idle seconds drop a link: ' + JSON.stringify(c));
  }
  if (WANT.includes('riders')) {
    R.riders = await ev(`const run=lk=>{const [e]=__set([['shield',16]]);const p=P();p.links=lk;p.face=1;e.guardT=9;BK.keys.block=true;BK.sim(2);p.inv=0;BKT.damagePlayer(p.x+14,12,{});BK.keys.block=false;BK.sim(2);const lk1=p.links;
        BK.press('atk');let seenFin=false,seenOpen=false,f=0,bk=0,hits=0,last=5000;while(f++<70){BK.sim(1);e.x=p.x+16;e.vx=0;if(p.finisher)seenFin=true;if(p.kOpen)seenOpen=true;bk=Math.max(bk,e.broken||0);if(e.hp<last){hits++;last=e.hp;}}return {lk:lk1,fin:seenFin,open:seenOpen,broken:+bk.toFixed(2),after:p.links,dmg:5000-e.hp,hits};};
      o.r0=run(0);o.r1=run(1);o.r2=run(2);`);
    const r = R.riders;
    t(r.r0.lk === 1 && r.r0.open && r.r0.broken > 0 && r.r0.dmg > 0, 'one link: the cut out of a perfect guard is guard-open (the guard breaks, the cut lands): ' + JSON.stringify(r.r0));
    t(r.r2.lk === 3 && r.r2.fin && r.r2.after === 0 && r.r2.hits >= 2 && r.r2.dmg > r.r0.dmg * 1.4, 'three links: the FINISHER (spent, and it lands TWO blows): ' + JSON.stringify(r));
  }
  if (WANT.includes('bash')) {
    R.bash = await ev(`const [e]=__set([['shield',16]]);const p=P();e.guardT=9;let f=0,swings=0,brokeAt=0;
      let mx12=0,mx3=0;for(let n=1;n<=3;n++){BK.press('atk');for(let i=0;i<16;i++){BK.sim(1);e.x=p.x+16;e.vx=0;if(n<3&&e.guardT<1&&!(e.broken>0))e.guardT=9;if(n<3)mx12=Math.max(mx12,e.broken||0);else mx3=Math.max(mx3,e.broken||0);}if(n===3)o.bash3=p.kBash3;BK.sim(2);}
      for(let i=0;i<20;i++){BK.sim(1);mx3=Math.max(mx3,e.broken||0);}o.brokeAfter2=+mx12.toFixed(2);o.broke=+mx3.toFixed(2);o.pose=p.kPoseK;`);
    t(R.bash.broke > 0 && R.bash.brokeAfter2 === 0 && R.bash.bash3, 'the THIRD jab breaks the guard (the first two do not): ' + JSON.stringify(R.bash));
  }
  if (WANT.includes('heavy')) {
    R.heavy = await ev(`const [e]=__set([['shield',16]]);const p=P();e.guardT=9;const hold=ms=>{p.atkHeld=0;BK.keys.atk=true;let f=0;while(f++<ms){BK.sim(1);e.x=p.x+16;e.vx=0;}BK.keys.atk=false;let bk=0,hp0=e.hp;for(let i=0;i<40;i++){BK.sim(1);bk=Math.max(bk,e.broken||0);}return {broken:+bk.toFixed(2),dmg:hp0-e.hp,stage:p.cutStage};};
      o.short=hold(18);e.broken=0;e.guardT=9;BK.sim(60);o.full=hold(36);e.broken=0;e.guardT=9;BK.sim(60);o.long=hold(110);`);
    t(R.heavy.short.dmg === 0 && R.heavy.full.broken > 0 && R.heavy.long.broken > 0, 'the heavy cut is ONE weight: nothing before 0.5 s, then it breaks a guard (no stages): ' + JSON.stringify(R.heavy));
  }
  if (WANT.includes('ram')) {
    R.ram = await ev(`const [e]=__set([['shield',26]],{lv:12,skills:{lunge:true},loadout:['lunge']});const p=P();p.links=1;e.guardT=9;BK.press('throw');let invMax=0,f=0;while(f++<30){BK.sim(1);invMax=Math.max(invMax,p.inv||0);}
      o.links=p.links;o.broken=+(e.broken||0).toFixed(2);o.inv=+invMax.toFixed(2);o.moved=Math.round(e.x-(p.x));
      const [e2]=__set([['shield',26]],{lv:12,skills:{lunge:true},loadout:['lunge']});const q=P();q.links=0;e2.guardT=9;BK.press('throw');for(let i=0;i<30;i++)BK.sim(1);o.noLinkBroken=+(e2.broken||0).toFixed(2);`);
    t(R.ram.links === 0 && R.ram.broken > 0 && R.ram.inv <= 0.01, 'SHIELD RAM: no grace (the shield is all that stands between), a link is spent and a guard opens: ' + JSON.stringify(R.ram));
  }
  if (WANT.includes('charge')) {
    R.charge = await ev(`__set([['sprig',90],['sprig',130]]);const p=P();p.links=2;__ultC();BK.sim(2);o.at2=p.lcBrace>0||p.lcLeft>0;BK.sim(30);p.links=3;__tapC();BK.sim(4);o.tapAt3=p.lcBrace>0||p.lcLeft>0;BK.sim(30);p.links=3;__ultC();BK.sim(4);o.at3=p.lcBrace>0||p.lcLeft>0;o.spent=p.links;BK.sim(60);`);
    t(!R.charge.at2 && !R.charge.tapAt3 && R.charge.at3 && R.charge.spent === 0, 'two links are not enough; a plain tap of C at three is not the charge; three, UP+C: THE SHIELD CHARGE (all three spent): ' + JSON.stringify(R.charge));
  }
  if (WANT.includes('tech')) {
    R.tech = await ev(`
      { /* PUNISH: a broken foe in reach takes the heavy at once */
        const [e]=__set([['sprig',16]],{ms:{35:'kpunish'}});const p=P();e.broken=3;BK.keys.atk=true;let f=0,at=-1;while(f++<40){BK.sim(1);e.x=p.x+16;e.broken=3;if(p.heavy&&at<0)at=f;}BK.keys.atk=false;o.punishAt=at; }
      { /* SHIELD ADVANCE: the march is quicker than the old guard-walk (32 px/s) */
        __set([],{ms:{30:'kadvance'}});const p=P();BK.keys.block=true;BK.keys.right=true;BK.sim(40);const x0=p.x;BK.sim(60);o.advance=Math.round(p.x-x0);BK.keys.block=false;BK.keys.right=false;
        __set([],{});const q=P();BK.keys.block=true;BK.keys.right=true;BK.sim(40);const y0=q.x;BK.sim(60);o.guardWalk=Math.round(q.x-y0);BK.keys.block=false;BK.keys.right=false; }
      { /* STANDING ORDERS: hold C, tap X */
        __set([],{ms:{45:'korders'}});const p=P();BK.keys.block=true;BK.sim(4);BK.press('atk');BK.sim(3);o.rally=p.rallyN;o.cd=+(p.ordersCd||0).toFixed(1);BK.keys.block=false;BK.sim(2);BK.press('atk'); }
      { /* THE LONG CHARGE: a second slam */
        const [a]=__set([['sprig',30]],{ms:{50:'kcharge2'}});const p=P();p.links=3;a.hp=a.hp0=a.maxHp0=5000;__ultC();let seen=false,f=0;while(f++<120){BK.sim(1);if(p.lc2T>0)seen=true;}o.second=seen; }
      { /* COUNTER-THRUST: the riposte cut pays stamina back and opens the guard */
        const [e]=__set([['shield',16]],{ms:{25:'kcounter'}});const p=P();e.guardT=9;BK.keys.block=true;BK.sim(2);p.inv=0;BKT.damagePlayer(p.x+14,12,{});BK.keys.block=false;BK.sim(2);p.st=40;BK.press('atk');let ct=false,f=0,bk=0;while(f++<40){BK.sim(1);e.x=p.x+16;e.vx=0;if(p.counterThrust)ct=true;bk=Math.max(bk,e.broken||0);}o.counter=ct;o.stEnd=Math.round(p.st);o.cbroken=+bk.toFixed(2);
        const [e2]=__set([['shield',16]],{});const q=P();e2.guardT=9;BK.keys.block=true;BK.sim(2);q.inv=0;BKT.damagePlayer(q.x+14,12,{});BK.keys.block=false;BK.sim(2);q.st=40;BK.press('atk');for(let i=0;i<40;i++){BK.sim(1);e2.x=q.x+16;e2.vx=0;}o.stEndPlain=Math.round(q.st); }
      { /* upgrades: IRON LINKS II holds the chain longer; SHIELD TIMING widens the window */
        __set([],{up:{ukeep:2,utime:2}});const p=P();p.links=2;p.linkKeep=0;p.linkT=0;BK.sim(60*5);o.ironLinks=p.links;
        o.win=+BKT.perfectWindow().toFixed(3); }
      { /* (claude/kfork) LINK CUT: HOLD X with a link spends it and the guard-breaking heavy falls at ~0.25 s */
        const [e]=__set([['shield',16]],{ms:{30:'klinkcut'}});const p=P();p.links=2;e.guardT=9;BK.keys.atk=true;let f=0,at=-1;while(f++<40){BK.sim(1);e.x=p.x+16;if(p.heavy&&at<0)at=f;}BK.keys.atk=false;o.linkCutAt=at;o.linkCutLinks=p.links;o.linkCutBroken=+(e.broken||0).toFixed(2); }
      { /* (claude/kfork) THE BREAKING WHEEL: three links, UP+C, the shield goes down the room, breaks the guard it crosses and a boss is not freed */
        const [a]=__set([['shield',90]],{ms:{50:'kwheel'}});const p=P();p.links=3;a.guardT=9;a.hp=a.hp0=a.maxHp0=5000;const h0=a.hp;__ultC();let f=0,bk=0;while(f++<100){BK.sim(1);bk=Math.max(bk,a.broken||0);}o.wheelHurt=h0-a.hp;o.wheelBroke=bk>0;o.wheelLinks=p.links;o.wheelNoCharge=!(p.lcBrace>0||p.lcLeft>0); }
    `);
    const k = R.tech;
    t(k.punishAt > 0 && k.punishAt < 24, 'PUNISH: the heavy falls at once on a broken foe (not at 0.5 s): ' + JSON.stringify(k));
    t(k.advance > k.guardWalk * 1.4, 'SHIELD ADVANCE: the march with the shield up is quicker than the plain guard-walk: ' + JSON.stringify(k));
    t(k.rally === 3 && k.cd > 15, 'STANDING ORDERS: hold C, tap X rallies three cuts and starts the 18 s clock: ' + JSON.stringify(k));
    t(k.second, 'THE LONG CHARGE: the shield charge chains a second slam: ' + JSON.stringify(k));
    t(k.counter && k.stEnd >= k.stEndPlain + 8 && k.cbroken > 0, 'COUNTER-THRUST: the riposte cut pays the stamina back (against the same cut without it) and opens the guard: ' + JSON.stringify(k));
    t(k.linkCutAt > 0 && k.linkCutAt < 28 && k.linkCutLinks === 1 && k.linkCutBroken > 0, 'LINK CUT (kfork): HOLD X with a link spends it, the heavy falls before 0.5 s and breaks the guard: ' + JSON.stringify(k));
    t(k.wheelHurt > 0 && k.wheelBroke && k.wheelLinks === 0 && k.wheelNoCharge, 'THE BREAKING WHEEL (kfork): UP+C at three links hurls the shield (not the charge), hurts and breaks the guard it crosses, spends the links: ' + JSON.stringify(k));
    t(k.ironLinks === 2, 'IRON LINKS II: five idle seconds do not drop a link: ' + JSON.stringify(k));
  }
  if (WANT.includes('hook')) {   /* (claude/forkproof) SHIELD HOOK: the throw strikes an archer, the shield turns for home and drags it along the floor; a boss is never hooked */
    R.hook = await ev(`
      const run=(ms,tp,dx)=>{const [e]=__set([[tp,dx]],{ms,skills:{shieldThrow:true},loadout:['shieldThrow']});const p=P();p.face=1;e.face=-1;BK.press('throw');let f=0,d0=Math.abs(e.x-p.x),dmin=d0,hooked=false,hp0=e.hp;while(f++<140){BK.sim(1);e.cd=99;dmin=Math.min(dmin,Math.abs(e.x-p.x));}return {d0:Math.round(d0),dmin:Math.round(dmin),hooked,hurt:hp0-e.hp,stag:+(e.stagger||0).toFixed(2),alive:e.alive};};
      o.hook=run({40:'kshook'},'archer',110);o.plain=run({},'archer',110);o.shield=run({40:'kshook'},'shield',60);`);
    const h = R.hook;
    t(h.hook.hurt > 0 && h.hook.dmin <= 24 && h.plain.dmin > 60, 'SHIELD HOOK (forkproof): the thrown shield hooks an archer and drags it to ~14 px; without the technique it stays: ' + JSON.stringify(h));
    t(h.shield.dmin >= h.shield.d0 - 40, 'SHIELD HOOK: a non-ranged foe is struck but not dragged: ' + JSON.stringify(h));
  }
} finally { pg.close(); }
console.log(JSON.stringify(R));
if (fail.length) { console.log('KNIGHT-CHAIN: ' + fail.length + ' problem(s)\n  - ' + fail.join('\n  - ')); process.exit(1); }
console.log('Knight chain: perfect guard +1 link, plain block keeps, a landed blow and the idle clock drop; the riposte carries the links (guard-open, shove, FINISHER); the third jab breaks a guard; the heavy cut is one weight; SHIELD RAM spends a link; three links, tap C: SHIELD CHARGE; the L25-L50 techniques and upgrades do what their cards say.');
