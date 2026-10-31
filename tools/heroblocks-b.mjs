// tools/heroblocks-b.mjs - HERO BLOCKS B (claude/heroblocksb, Daniel 10-30 22:15): what the two new holds promise, in the running page.
//   warden   HOLD C is THE SPEAR-HAFT BRACE (src/warden-brace.js): a tap is still only the deflect (no brace); held past WB.hold the haft is planted;
//            a yellow blow from the FRONT is turned at MORE wind than a shield (WB.chip x the knight's cost) and nothing is taken; a red blow, a bolt, and a
//            blow from behind are not turned; a charge that runs onto it is IMPALED (broken); out of wind the haft breaks (half the blow); C let go lifts it
//   ranger   HOLD C is THE BOW GUARD (src/ranger.js): a tap is still the bash (no guard); held past RG.guard.hold the bow is up; a PROJECTILE from the front
//            is stopped DEAD for a few points of wind; a blade from the front costs HALF; a red blow, a bolt, and a blow from behind are not turned;
//            out of wind it breaks (the whole blow); the tap bash's arrow snatch is untouched
//   shots    (SHOTS=1) screens of the brace, an impaled charger and the guard stopping an arrow -> work/heroblocksb-shots/
// Run: node tools/heroblocks-b.mjs [warden,ranger,shots]
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
const WANT = (process.argv[2] || 'warden,ranger').split(',');
const pg = await openPage({ audio: false, fonts: false });
const fail = [], t = (ok, msg) => { if (!ok) fail.push(msg); };
const shot = async name => { mkdirSync('work/heroblocksb-shots', { recursive: true }); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync('work/heroblocksb-shots/' + name + '.png', Buffer.from(r.data, 'base64')); };
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

  if (WANT.includes('warden')) {
    const r = await pg.evalp(`(()=>{const o={},P=()=>BK.P;
      { __set('warden',[]);BK.keys.block=true;BK.sim(3);BK.keys.block=false;BK.sim(2);o.tap={brace:!!P().wBrace,held:P().wbHeld||0,deflect:+(P().deflectT||0).toFixed(2)}; }   /* a tap is the deflect, never the brace */
      { __set('warden',[]);__hold(8);o.early={brace:!!P().wBrace};__hold(10);o.hold={brace:!!P().wBrace}; BK.sim(30);const s=P().st;BK.sim(30);o.drain=+(s-P().st).toFixed(1);o.stillUp=!!P().wBrace; }
      { __set('warden',[]);__hold(40);o.front=__hit(14,12,{});o.stAfter=Math.round(P().st); }
      { __set('knight',[]);BK.keys.block=true;BK.sim(40);P().blockT=1;o.knightCost=__hit(14,12,{}); BK.keys.block=false; }
      { __set('warden',[]);__hold(40);o.behind=__hit(-14,12,{}); }
      { __set('warden',[]);__hold(40);o.red=__hit(14,12,{unblockable:true}); }
      { __set('warden',[]);__hold(40);o.bolt=__hit(14,12,{pierce:true}); }
      { __set('warden',[]);__hold(40);P().st=2;o.broke=__hit(14,20,{});o.brokeBrace=!!P().wBrace;o.tired=P().guardTired; }
      { __set('warden',[]);__hold(40);__let();o.released={brace:!!P().wBrace,hit:__hit(14,12,{})}; }
      { __set('warden',[]);__hold(40);BK.press('atk');BK.sim(2);o.swing={brace:!!P().wBrace,atk:P().atk};BK.sim(60);o.reraise={brace:!!P().wBrace}; BK.keys.block=false; }
      { /* a yellow charge runs onto the braced point: the goat's own AI charges the braced warden and is spitted (nothing is set by hand) */
        __set('warden',[]);__hold(40);BK.spawnEnt({t:'goat',x:(P().x+110)/16,y:21});const g=BK.enemies().at(-1);g.hp=g.hp0=5000;let f=0,seen=false,mx=0;while(f++<120&&g.alive){BK.sim(1);if(g.pointHit>0)seen=true;mx=Math.max(mx,g.broken||0);}
        o.charge={impaled:seen,broken:+mx.toFixed(2),f,hp:P().hp===P().maxHp,hurt:P().maxHp-P().hp}; }
      { /* the same charge landing as a blow on the haft (not stopped by the watch): the blow is turned AND the charger is impaled */
        const [g]=__set('warden',[['goat',20]]);__hold(40);g.mode='charge';g.vx=-260;g.face=-1;g.pointHit=0;const hp0=P().hp,res=BKT.damagePlayer(g.x,12,{who:g});o.chargeBlow={res,lost:hp0-P().hp,impaled:g.pointHit>0}; }
      { /* a red charge is not on the list and not turned */
        const [g]=__set('warden',[['goat',20]]);__hold(40);g.mode='charge';g.vx=-260;g.pointHit=0;const hp0=P().hp,res=BKT.damagePlayer(g.x,12,{who:g,unblockable:true});o.redCharge={res,lost:hp0-P().hp,impaled:g.pointHit>0}; }
      return o;})()`);
    t(!r.tap.brace && r.tap.deflect > 0, 'warden: a tap is the deflect and no brace: ' + JSON.stringify(r.tap));
    t(!r.early.brace && r.hold.brace && r.stillUp && r.drain > 0, 'warden: held, the haft is planted, stays up and costs wind: ' + JSON.stringify([r.hold, r.drain, r.stillUp]));
    t(r.front.res === 'blocked' && r.front.lost === 0, 'warden: a yellow blow from the front is turned, nothing taken: ' + JSON.stringify(r.front));
    t(r.front.paid >= r.knightCost.paid * 1.3, 'warden: the haft costs MORE wind than the knight\'s shield: ' + JSON.stringify([r.front, r.knightCost]));
    t(r.behind.lost > 0 && r.red.lost > 0 && r.bolt.lost > 0, 'warden: behind, red and a bolt are not turned: ' + JSON.stringify([r.behind, r.red, r.bolt]));
    t(r.broke.lost > 0 && r.broke.lost < 20 && !r.brokeBrace && r.tired > 0, 'warden: out of wind the haft breaks (half the blow, no brace, tired): ' + JSON.stringify([r.broke, r.brokeBrace, r.tired]));
    t(!r.released.brace && r.released.hit.lost > 0, 'warden: C let go lifts the haft: ' + JSON.stringify(r.released));
    t(!r.swing.brace && r.reraise.brace, 'warden: a swing drops the brace and the held C raises it again: ' + JSON.stringify([r.swing, r.reraise]));
    t(r.charge.impaled && r.charge.broken > 0, 'warden: a yellow charge that runs onto the braced point is impaled: ' + JSON.stringify(r.charge));
    t(r.chargeBlow.res === 'blocked' && r.chargeBlow.impaled, 'warden: a charge landing on the haft is turned AND impaled: ' + JSON.stringify(r.chargeBlow));
    t(r.redCharge.lost > 0 && !r.redCharge.impaled, 'warden: a red charge runs through: ' + JSON.stringify(r.redCharge));
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
    await pg.evalp(`(()=>{__set('warden',[]);__hold(40);BK.sim(4);return 1})()`); await shot('warden-brace');
    await pg.evalp(`(()=>{const [g]=__set('warden',[['goat',70]]);g.speed=0;__hold(40);g.mode='charge';g.modeT=2;g.vx=-260;g.face=-1;let f=0;while(f++<60&&!(g.pointHit>0)&&g.alive)BK.sim(1);BK.sim(3);return 1})()`); await shot('warden-impaled-goat');
    await pg.evalp(`(()=>{__set('ranger',[]);__hold(40);BK.sim(2);return 1})()`); await shot('ranger-bow-guard');
    await pg.evalp(`(()=>{__set('ranger',[]);__hold(40);BK.seeds().length=0;BK.seeds().push({x:BK.P.x+40,y:BK.P.y-9,vx:-260,vy:0,g:0,life:3,arrow:true,dmg:10});BK.sim(8);return 1})()`); await shot('ranger-arrow-stopped');
  }
  const errs = pg.errors ? pg.errors.slice(0, 5) : [];
  t(!errs.length, 'page errors: ' + JSON.stringify(errs));
} finally { pg.close(); }
console.log(fail.length ? 'FAIL\n' + fail.join('\n') : 'OK heroblocks-b');
process.exit(fail.length ? 1 : 0);
