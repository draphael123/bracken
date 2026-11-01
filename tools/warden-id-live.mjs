// tools/warden-id-live.mjs - THE WARDEN'S IDENTITY PASS in the running page (claude/wardenid): the long thrust (third jab), the reach band, the phalanx skill, the pole-vault.
//   node tools/warden-id-live.mjs [long,band,phalanx,vault]
// One browser; start it only with >= 1500 MB free (lane rule). tools/warden-id.mjs is the static twin.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const WANT = (process.argv[2] || 'long,band,phalanx,vault,reach').split(',');
const pg = await openPage({ audio: false, fonts: false });
const out = {}, fails = [], t = (ok, msg) => { if (!ok) fails.push(msg); };
try {
  await pg.evalp(`(async()=>{
    window.__kit=(hero,ids,foes)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(hero);BK.reset({fresh:true});BKT.setHeroLevel(hero,20);
      BKT.PROG.skillOwned[hero]=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts[hero]=ids.slice(0,4);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(120);const P=BK.P;P.hp=P.maxHp;P.inv=0;P.st=P.maxSt;P.face=1;P.vigil=0;
      return foes.map(([t,gap])=>{BK.spawnEnt({t,x:(P.x+gap)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;e.elT=99;e.speed=0;e.x=P.x+gap+(e.w||12)/2;e.face=-1;return e;});};
    return 1})()`);
  if (WANT.includes('long')) {
    /* a foe whose near edge is 54 px out: the first two thrusts (reach 44) fall short, the third (60) lands - and drives it back to rest at the point, not across the room */
    out.long = await pg.evalp(`(()=>{const [e]=__kit('warden',[],[['sprig',54]]);const P=BK.P,r=[];let x0=P.x;
      for(let j=0;j<3;j++){const hp0=e.hp;BK.press('atk');let sawLong=false,vx3=null;for(let i=0;i<24;i++){BK.sim(1);if(P.wLong){sawLong=true;if(vx3===null)vx3=Math.round(P.vx);}}r.push({jab:j+1,dmg:hp0-e.hp,long:sawLong,vx:vx3,recov:+(P.atkRec||0).toFixed(2)});}
      BK.sim(40);return {r,gapAfter:Math.round(Math.abs(e.x-(e.w||12)/2-P.x)),stepped:Math.round(P.x-x0)}})()`);
    t(out.long.r[0].dmg === 0 && out.long.r[1].dmg === 0, 'the first two jabs fall short of a foe 54 px out (' + out.long.r.map(x => x.dmg) + ')');
    t(out.long.r[2].dmg > 0 && out.long.r[2].long, 'the third jab is the long thrust and lands at 54 px (' + out.long.r[2].dmg + ')');
    /* the haft: a foe inside 14 px pays the haft, whatever swing it is */
    out.haft = await pg.evalp(`(()=>{const [e]=__kit('warden',[],[['sprig',8]]);const P=BK.P;let a=0;for(let j=0;j<3;j++){const hp0=e.hp;BK.press('atk');BK.sim(24);a=hp0-e.hp;e.x=P.x+8+(e.w||12)/2;}return {third:a}})()`);
    out.tip = await pg.evalp(`(()=>{const [e]=__kit('warden',[],[['sprig',36]]);const P=BK.P;const hp0=e.hp;BK.press('atk');BK.sim(24);return {first:hp0-e.hp}})()`);
    t(out.haft.third < out.tip.first * 0.6, 'inside the spear the third jab is only the haft (' + out.haft.third + ' vs a tip ' + out.tip.first + ')');
  }
  if (WANT.includes('band')) {
    out.band = await pg.evalp(`(()=>{const [e]=__kit('warden',[],[['sprig',8]]);const P=BK.P;P.vigil=60;e.hp=e.hp0=99999;BK.sim(60);const a=P.vigil;BK.sim(120);const b=P.vigil;
      e.x=P.x+200;BK.sim(10);const c=P.vigil;BK.sim(120);return {a:Math.round(a),b:Math.round(b),c:Math.round(c),d:Math.round(P.vigil)}})()`);
    t(out.band.b < out.band.a, 'the reach band drains with a foe on the haft (' + out.band.a + ' -> ' + out.band.b + ')');
    t(out.band.d === out.band.c, 'and holds still with nothing on the haft (' + out.band.c + ' -> ' + out.band.d + ')');
  }
  if (WANT.includes('phalanx')) {
    out.phalanx = await pg.evalp(`(()=>{const f=__kit('warden',['setSpears'],[['sprig',80],['sprig',150]]);const P=BK.P;P.vigil=0;BK.press('throw');let pinned=false,down=0;for(let i=0;i<60;i++){BK.sim(1);for(const e of f){pinned=pinned||e.pinned>0;}}
      down=f.filter(e=>e.hp<5000).length;const cd1=BK.P.cds&&BK.P.cds.setSpears;BK.sim(1);return {hit:down,pinned,floored:f.map(e=>(e.floorAt||0)>0),cd:cd1||null,vigil:P.vigil}})()`);
    t(out.phalanx.hit === 2 && !out.phalanx.pinned, 'the phalanx skill hits both foes and pins neither (' + JSON.stringify(out.phalanx) + ')');
    t(out.phalanx.vigil === 0, 'and costs no bar (the band stays at 0)');
  }
  if (WANT.includes('reach')) {
    /* WARDEN'S REACH: UP+C at a full band. Tap C at full is still only the deflect. */
    out.reach = await pg.evalp(`(()=>{const [a,b,c]=__kit('warden',[],[['sprig',50],['sprig',66],['sprig',82]]);const P=BK.P;P.vigil=100;
      BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.sim(2);const tapOnly=P.wReachT>0;BK.sim(30);P.vigil=100;
      BK.keys.up=true;BK.keys.block=true;BK.sim(1);BK.keys.block=false;BK.keys.up=false;BK.sim(1);const cast=P.wReachT>0;
      BK.press('atk');BK.sim(22);const hit=[a,b,c].map(e=>5000-e.hp);const push=[a,b,c].map(e=>Math.round(e.x-P.x));
      BK.sim(60*7);return {tapOnly,cast,hit,push,left:+(P.wReachT||0).toFixed(2),band:Math.round(P.vigil),end:[a,b,c].map(e=>5000-e.hp)}})()`);
    t(!out.reach.tapOnly && out.reach.cast, 'UP+C casts WARDEN\'S REACH; a plain tap C at a full band does not (' + JSON.stringify(out.reach) + ')');
    t(out.reach.hit.every(x => x > 0), 'the huge spear skewers a line (3 foes in the line hit by one thrust)');
    t(out.reach.left === 0 && out.reach.band === 0, 'it ends and the band is empty');
    t(out.reach.end.some((x, i) => x > out.reach.hit[i]), 'the final thrust lands');
  }
  if (WANT.includes('vault')) {
    out.vault = await pg.evalp(`(()=>{const [e]=__kit('warden',['harrier'],[['sprig',40]]);const P=BK.P,x0=P.x;BK.press('throw');let inv=0;for(let i=0;i<90;i++){BK.sim(1);inv=Math.max(inv,P.inv||0);}return {over:P.x>e.x,moved:Math.round(P.x-x0),inv:+inv.toFixed(2),hurt:5000-e.hp,pinned:e.pinned>0}})()`);
    t(out.vault.over && out.vault.hurt > 0 && !out.vault.pinned, 'the pole-vault carries her over the foe and stabs down behind it, no pin (' + JSON.stringify(out.vault) + ')');
    t(out.vault.inv < 0.35, 'with no grace in the air (' + out.vault.inv + ' s)');
  }
  if (pg.errors.length) fails.push('page errors ' + JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
console.log(JSON.stringify(out));
assert.deepEqual(fails, []);
console.log('warden-id-live: green');
