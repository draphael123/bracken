// tools/heroblocks-b.mjs - HERO BLOCKS B (claude/heroblocksb, Daniel 10-30 22:15): what the two new holds promise, in the running page.
//   warden   HOLD C is THE JAVELIN THROW (src/warden-throw.js; the hold-C brace was removed claude/herofeel): a tap is the deflect; held, three tiers (quick / heavy knock-back / pin); the spear comes back at once
//   ranger   HOLD C is THE BOW GUARD (src/ranger.js): a tap is still the bash (no guard); held past RG.guard.hold the bow is up; a PROJECTILE from the front
//            is stopped DEAD for a few points of wind; a blade from the front costs HALF; a red blow, a bolt, and a blow from behind are not turned;
//            out of wind it breaks (the whole blow); the tap bash's arrow snatch is untouched
//   shots    (SHOTS=1) screens of the javelin wind and the guard stopping an arrow -> work/heroblocksb-shots/
// Run: node tools/heroblocks-b.mjs [warden,ranger,shots]
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const WANT = (process.argv[2] || 'warden,ranger').split(',');
const pg = await openPage({ audio: false, fonts: false });
const fail = [], t = (ok, msg) => { if (!ok) fail.push(msg); };
const shot = async name => { mkdirSync('work/heroblocksb-shots', { recursive: true });
  const url = await pg.evalp(`(()=>{BK.step(1);const W=BK.view.VW,H=BK.view.VH,cw=Math.round(W*0.85),Z=2,o=document.createElement('canvas');o.width=cw*Z;o.height=H*Z;const g=o.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,cw,H,0,0,cw*Z,H*Z);return o.toDataURL('image/png');})()`);
  writeFileSync('work/heroblocksb-shots/' + name + '.png', Buffer.from(url.split(',')[1], 'base64')); };
try {
  await pg.evalp(`(async()=>{
    window.__set=(h,foes,o={})=>{for(const k in BK.keys)BK.keys[k]=false;BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(h);BK.reset({fresh:true});BKT.setHeroLevel(h,o.lv||1);
      BKT.PROG.skillOwned[h]={};BKT.PROG.loadouts[h]=[];BK.applyUpgrades();BK.load(0);BK.state='play';BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');
      const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);BK.sim(60);const P=BK.P;
      Object.assign(P,{hp:P.maxHp,inv:0,hurt:0,st:P.maxSt,face:1,vx:0,dodge:0,dodgeCd:0,dash:0,dashCd:0,riposteT:0,combo:0,resolve:0,vigil:0,guardTired:0});BK.sim(1);P.st=P.maxSt;
      return foes.map(([t,dx,fo])=>{BK.spawnEnt({t,x:(P.x+dx)/16,y:21,...(fo||{})});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;e.elT=99;e.face=-1;return e;});};
    window.__hold=(frames)=>{BK.keys.block=true;BK.sim(frames);};
    window.__let=()=>{BK.keys.block=false;BK.sim(2);};
    window.__hit=(dx,dmg,o)=>{const P=BK.P;P.inv=0;P.hurt=0;const hp0=P.hp,st0=P.st,res=BKT.damagePlayer(P.x+dx,dmg,o||{});return {res,lost:hp0-P.hp,paid:Math.round((st0-P.st)*10)/10};};
    return 1;})()`);

  if (WANT.includes('warden')) {   /* (claude/herofeel) HOLD C is the JAVELIN THROW now (src/warden-throw.js); the hold-C brace is gone */
    const r = await pg.evalp(`(()=>{const o={},P=()=>BK.P,W=()=>BK.wth();
      { __set('warden',[]);BK.keys.block=true;BK.sim(4);BK.keys.block=false;BK.sim(2);o.tap={hold:W().hold,spears:W().spears.length,deflect:+(P().deflectT||0).toFixed(2),rec:W().rec}; }
      { __set('warden',[]);__hold(8);o.early={hold:W().hold};__hold(16);o.t1={hold:W().hold};__hold(30);o.t2={hold:W().hold};__hold(40);o.t3={hold:W().hold}; BK.keys.block=false;BK.sim(2); }
      { __set('warden',[]);__hold(40);o.noBrace=__hit(14,12,{});o.noBraceFlag=!!P().wBrace; BK.keys.block=false;BK.sim(2); }
      { const [g]=__set('warden',[['sprig',60]]);g.face=-1;g.hp=g.hp0=5000;__hold(24);const hp0=g.hp;BK.keys.block=false;BK.sim(14);o.hit1={dmg:hp0-g.hp,knock:g.knock||0,pinned:g.pinned||0,spears:W().spears.length}; BK.sim(80);o.back={spears:W().spears.length}; }
      { const [g]=__set('warden',[['sprig',70]]);g.hp=g.hp0=5000;g.speed=0;const x0=g.x;__hold(52);o.t2wind={hold:W().hold};const hp0=g.hp;BK.keys.block=false;BK.sim(14);o.hit2={dmg:hp0-g.hp,moved:Math.round(g.x-x0),stag:+(g.stagger||0).toFixed(2),pinned:g.pinned||0,rec:W().rec}; }
      { const [g]=__set('warden',[['sprig',70]]);g.hp=g.hp0=5000;g.speed=0;__hold(100);o.t3wind={hold:W().hold};const hp0=g.hp;BK.keys.block=false;BK.sim(14);o.hit3={dmg:hp0-g.hp,pinned:+(g.pinned||0).toFixed(2)}; }
      { __set('warden',[]);P().st=1;__hold(24);BK.keys.block=false;BK.sim(3);o.tired={spears:W().spears.length}; }
      { __set('warden',[]);__hold(24);P().hurt=0.3;BK.sim(2);o.dropped={hold:W().hold};BK.keys.block=false;BK.sim(2); }
      return o;})()`);
    t(r.tap.spears === 0 && r.tap.hold === 0 && r.tap.deflect > 0, 'warden: a tap is the deflect and no throw: ' + JSON.stringify(r.tap));
    t(r.early.hold === 0 && r.t1.hold === 1 && r.t2.hold === 2 && r.t3.hold === 3, 'warden: the wind climbs three tiers on the hold: ' + JSON.stringify([r.early, r.t1, r.t2, r.t3]));
    t(r.noBrace.lost > 0 && !r.noBraceFlag, 'warden: nothing braces any more - a held C turns no blow: ' + JSON.stringify([r.noBrace, r.noBraceFlag]));
    t(r.hit1.dmg > 0 && r.hit1.pinned === 0, 'warden: tier 1 is a quick throw, one hit, no pin: ' + JSON.stringify(r.hit1));
    t(r.back.spears === 0, 'warden: the spear comes back at once: ' + JSON.stringify(r.back));
    t(r.t2wind.hold === 2 && r.hit2.dmg > r.hit1.dmg && r.hit2.moved > 6 && r.hit2.stag > 0 && r.hit2.pinned === 0, 'warden: tier 2 is a HEAVY throw - more damage, knocked back, staggered, not pinned: ' + JSON.stringify([r.t2wind, r.hit2]));
    t(r.t3wind.hold === 3 && r.hit3.pinned > 0.3, 'warden: tier 3 pins the first foe: ' + JSON.stringify([r.t3wind, r.hit3]));
    t(r.tired.spears === 0, 'warden: out of wind the throw is dropped: ' + JSON.stringify(r.tired));
    t(r.dropped.hold === 0, 'warden: a hit drops the wind: ' + JSON.stringify(r.dropped));
    console.log('warden', JSON.stringify(r));
  }

  if (WANT.includes('ranger')) {
    const r = await pg.evalp(`(()=>{const o={},P=()=>BK.P;
      { __set('ranger',[]);BK.keys.block=true;BK.sim(3);BK.keys.block=false;BK.sim(2);o.tap={guard:!!P().rgGuard,bashes:BK.ranger?BK.ranger().bashUp:null}; }
      { __set('ranger',[]);__hold(5);o.early={guard:!!P().rgGuard};__hold(20);o.hold={guard:!!P().rgGuard}; BK.sim(30);o.stillUp=!!P().rgGuard; }
      { __set('ranger',[]);o.base=__hit(14,12,{}); }
      { __set('ranger',[]);__hold(40);o.melee=__hit(14,12,{}); }
      { __set('ranger',[]);__hold(40);o.proj=__hit(14,10,{geo:true});o.projPay=o.proj.paid; }
      { __set('ranger',[]);__hold(40);o.behind=__hit(-14,12,{}); }
      { __set('ranger',[]);__hold(40);o.red=__hit(14,12,{unblockable:true}); }
      { __set('ranger',[]);__hold(40);o.bolt=__hit(14,12,{pierce:true,geo:true}); }
      { __set('ranger',[]);__hold(40);P().st=2;o.broke=__hit(14,12,{});o.brokeGuard=!!P().rgGuard;o.tired=P().guardTired; }
      { __set('ranger',[]);__hold(40);__let();o.released={guard:!!P().rgGuard,hit:__hit(14,12,{})}; }
      { __set('ranger',[]);BK.seeds().length=0;BK.seeds().push({x:P().x+90,y:P().y-9,vx:-260,vy:0,g:0,life:3,arrow:true,dmg:10});const hp0=P().hp;BK.sim(40);o.arrowBare={lost:hp0-P().hp}; }
      { __set('ranger',[]);__hold(40);BK.seeds().length=0;BK.seeds().push({x:P().x+90,y:P().y-9,vx:-260,vy:0,g:0,life:3,arrow:true,dmg:10});const hp0=P().hp,st0=P().st;BK.sim(40);o.arrowGuard={lost:hp0-P().hp,paid:Math.round(st0-P().st),guard:!!P().rgGuard}; }
      return o;})()`);
    t(!r.tap.guard, 'ranger: a tap is the bash and no guard: ' + JSON.stringify(r.tap));
    t(!r.early.guard && r.hold.guard && r.stillUp, 'ranger: held past the hold time the bow is up, and stays up: ' + JSON.stringify([r.early, r.hold, r.stillUp]));
    t(r.proj.res === 'blocked' && r.proj.lost === 0 && r.proj.paid > 0 && r.proj.paid <= 6, 'ranger: a projectile from the front is stopped dead for a few points: ' + JSON.stringify(r.proj));
    t(r.melee.lost > 0 && r.melee.lost <= Math.ceil(r.base.lost / 2) + 1 && r.melee.lost >= Math.floor(r.base.lost / 2) - 1, 'ranger: a blade costs HALF: ' + JSON.stringify([r.melee, r.base]));
    t(r.behind.lost > 0 && r.red.lost > 0 && r.bolt.lost > 0, 'ranger: behind, red and a bolt are not turned: ' + JSON.stringify([r.behind, r.red, r.bolt]));
    t(r.broke.lost >= r.base.lost && !r.brokeGuard && r.tired > 0, 'ranger: out of wind the bow gives (the whole blow, tired): ' + JSON.stringify([r.broke, r.base, r.brokeGuard, r.tired]));
    t(!r.released.guard && r.released.hit.lost >= r.base.lost, 'ranger: C let go lowers the bow: ' + JSON.stringify(r.released));
    t(r.arrowBare.lost > 0 && r.arrowGuard.lost === 0 && r.arrowGuard.paid > 0, 'ranger: a real arrow in flight hurts bare and is stopped on the guard: ' + JSON.stringify([r.arrowBare, r.arrowGuard]));
    console.log('ranger', JSON.stringify(r));
  }

  if (WANT.includes('shots')) {
    await pg.evalp(`(()=>{__set('warden',[]);__hold(60);BK.sim(4);return 1})()`); await shot('warden-javelin-wind');
    await pg.evalp(`(()=>{const [g]=__set('warden',[['goat',70]]);g.speed=0;__hold(100);BK.keys.block=false;BK.sim(8);return 1})()`); await shot('warden-javelin-pin');
    await pg.evalp(`(()=>{__set('ranger',[]);__hold(40);BK.sim(2);return 1})()`); await shot('ranger-bow-guard');
    await pg.evalp(`(()=>{__set('ranger',[]);__hold(40);BK.seeds().length=0;BK.seeds().push({x:BK.P.x+40,y:BK.P.y-9,vx:-260,vy:0,g:0,life:3,arrow:true,dmg:10});BK.sim(8);return 1})()`); await shot('ranger-arrow-stopped');
  }
  const errs = pg.errors ? pg.errors.slice(0, 5) : [];
  t(!errs.length, 'page errors: ' + JSON.stringify(errs));
} finally { pg.close(); }
console.log(fail.length ? 'FAIL\n' + fail.join('\n') : 'OK heroblocks-b');
process.exit(fail.length ? 1 : 0);
