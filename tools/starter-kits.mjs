// tools/starter-kits.mjs — THE STARTER KITS DO WHAT THEIR CARDS SAY (the Knight's and the Warden's bought abilities).
// Each case is played through the real input on a flat floor, and asks the one thing the ability PROMISES, not a number:
//   rise    the bought RISING CUT carries the first foe up with him, holds it in the air, and is drawn as an upward cut
//   wheel, javelin, poleSpring, fullStretch, spearDance, rain   THE WARDEN'S SIX: each does the one thing its card says
//   disarm, ironclad, realm   THE KNIGHT'S THREE: a shield stripped stops turning his cut; hit in iron he keeps swinging;
//           the realm's light hurts, and a boss is never hit by a wave for more than its cap
//   heavy   THE HEAVY CUT (hold X): no shield while the sword is up; let go early and it is a chop, held long it knocks the foe down
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__kit=(hero,ids,foes)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(hero);BK.reset({fresh:true});BKT.PROG.xp[hero]=xpFloor(20);
      BKT.PROG.skillOwned[hero]=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts[hero]=ids.slice(0,4);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;
      return foes.map(([t,dx])=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;return e;});};return 1})()`);
  const ALL = ['rise', 'heavy', 'wheel', 'javelin', 'poleSpring', 'fullStretch', 'spearDance', 'rain', 'disarm', 'ironclad', 'realm'], WANT = process.argv[2] ? process.argv[2].split(',') : ALL;
  const out = {};
  if (WANT.includes('rise')) out.rise = await pg.evalp(`(()=>{const [e]=__kit('knight',['risingCut'],[['sprig',6]]);const y0=e.y;BK.press('throw');let keys=new Set(),top=0,held=0;
    for(let i=0;i<80;i++){BK.step(1);keys.add(BK.P.lastKey);top=Math.max(top,y0-e.y);if(y0-e.y>30&&BK.P.riseT<=0)held++;}
    return {top:Math.round(top),held,keys:[...keys]}})()`);
  if (WANT.includes('heavy')) out.heavy = await pg.evalp(`(()=>{const run=(frames,block)=>{const [e]=__kit('knight',[],[['swornsword',20]]);BK.keys.atk=true;let st=0,guard=false;
      for(let i=0;i<frames;i++){if(block&&i===frames-10)BK.keys.block=true;BK.sim(1);guard=guard||BK.P.block;}BK.keys.atk=false;BK.keys.block=false;const x0=BK.P.x;
      for(let i=0;i<40;i++){BK.sim(1);st=Math.max(st,BK.P.cutStage||0);}return {st,guard,floored:e.floored>0,moved:Math.round(BK.P.x-x0),hp:5000-e.hp};};
    return {chop:run(21,false),held:run(72,true)}})()`);
  const W = async (name, js) => { if (WANT.includes(name)) out[name] = await pg.evalp('(()=>{' + js + '})()'); };
  await W('wheel', `const f=__kit('warden',['wheel'],[['sprig',-30],['sprig',24]]);BK.press('throw');BK.sim(30);return {down:f.map(e=>e.floored>0)}`);
  await W('javelin', `const [e]=__kit('warden',['javelin'],[['sprig',50]]);BK.press('throw');let pinned=false,bare=false;for(let i=0;i<40;i++){BK.sim(1);pinned=pinned||e.pinned>0;bare=bare||!!BK.wardJav();}
    BK.press('throw');let back=false;for(let i=0;i<90;i++){BK.sim(1);back=back||(BK.wardJav()&&BK.wardJav().st==='back');if(!BK.wardJav())break;}const home=!BK.wardJav();
    __kit('warden',['javelin'],[]);const L=BK.L,tx=Math.floor(BK.P.x/16)+6,ty=Math.floor((BK.P.y-8)/16);for(let y=10;y<22;y++)L.grid[y*L.W+tx]=1;BK.P.cds={};BK.press('throw');BK.sim(30);
    return {pinned,bare,back,home,step:L.grid[ty*L.W+tx-1]!==0}`);
  await W('poleSpring', `const [e]=__kit('warden',['poleSpring'],[['sprig',16]]);const y0=BK.P.y;BK.press('throw');let top=0,pinned=false;for(let i=0;i<120;i++){BK.sim(1);top=Math.max(top,y0-BK.P.y);pinned=pinned||e.pinned>0;}return {top:Math.round(top),pinned}`);
  await W('fullStretch', `const reach=(stretch)=>{const [e]=__kit('warden',['fullStretch'],[['shield',58]]);if(stretch){BK.press('throw');BK.sim(2);}BK.press('atk');BK.sim(30);return 5000-e.hp;};return {plain:reach(false),stretched:reach(true)}`);
  await W('spearDance', `const [e]=__kit('warden',['spearDance'],[['sprig',30]]);BK.press('throw');let hits=0;for(let i=0;i<180;i++){const h=e.hp;BK.sim(1);if(e.hp<h)hits++;}return {hits}`);
  await W('rain', `const [e]=__kit('warden',['rainOfSpears'],[['sprig',60]]);BK.press('throw');let pinned=false;for(let i=0;i<150;i++){BK.sim(1);pinned=pinned||e.pinned>0;}return {pinned,marked:BK.spearRain().length>=0}`);
  await W('disarm', `const run=(dis)=>{const [e]=__kit('knight',['disarm'],[['shield',20]]);if(dis){BK.press('throw');BK.sim(30);}
      for(let k=0;k<3;k++){e.x=BK.P.x+16;e.face=-1;e.vx=0;e.stagger=0;e.broken=0;e.guardT=0;BK.sim(1);}const h0=e.hp;BK.P.face=1;BK.press('atk');BK.sim(20);return {dis:!!e.disarmed,swing:h0-e.hp};};return {plain:run(false),stripped:run(true)}`);
  await W('ironclad', `const run=(iron)=>{__kit('knight',['ironclad'],[]);if(iron){BK.press('throw');BK.sim(2);}BK.press('atk');BK.sim(2);const hp=BK.P.hp;BK.P.inv=0;BK.damagePlayer(BK.P.x+10,10,{});return {hurt:BK.P.hurt>0,swinging:BK.P.atk>=0,took:hp-BK.P.hp};};return {plain:run(false),iron:run(true)}`);
  await W('realm', `const f=__kit('knight',['swordOfRealm'],[['sprig',50],['sprig',-60]]);const boss=f[1];boss.mini=true;boss.maxHp=boss.hp=500;const h0=f.map(e=>e.hp);
      BK.press('throw');let most=0;for(let i=0;i<60;i++){const b=boss.hp;BK.sim(1);most=Math.max(most,b-boss.hp);}const cast=f.map((e,i)=>h0[i]-e.hp);
      const n0=BK.realmWaves().length;BK.press('atk');BK.sim(3);return {cast,capped:most,onSwing:BK.realmWaves().length>n0}`);
  const o = out;
  if (o.disarm) assert(o.disarm.plain.swing === 0 && o.disarm.stripped.dis && o.disarm.stripped.swing > 0, 'DISARM: the shield that turned his cut is gone, and the same cut lands (' + JSON.stringify(o.disarm) + ')');
  if (o.ironclad) { assert(o.ironclad.plain.hurt, '(without it a blow staggers him)'); assert(!o.ironclad.iron.hurt && o.ironclad.iron.swinging, 'IRONCLAD: the blow neither staggers him nor stops the swing'); assert(o.ironclad.iron.took > 0 && o.ironclad.iron.took === o.ironclad.plain.took, 'and it still hurts, as much as it would have (' + o.ironclad.iron.took + ' vs ' + o.ironclad.plain.took + ')'); }
  if (o.realm) { assert(o.realm.cast[0] > 0, 'SWORD OF THE REALM: the cast sends a great wave that lands'); assert(o.realm.onSwing, 'and a swing sends another'); assert(o.realm.capped > 0 && o.realm.capped <= 15, 'a boss is never hit by a wave for more than 3% of its bar (' + o.realm.capped + ' of 500)'); }
  if (o.wheel) assert(o.wheel.down.every(Boolean), 'THE WHEEL puts everything in reach, both sides, on its back (' + o.wheel.down + ')');
  if (o.javelin) { const j = o.javelin; assert(j.pinned, 'JAVELIN pins the first foe'); assert(j.bare, 'and she is without it until it is back'); assert(j.back && j.home, 'F again brings it home'); assert(j.step, 'and a miss into a wall leaves a step standing out of it'); }
  if (o.poleSpring) { assert(o.poleSpring.top >= 60, 'POLE SPRING goes straight UP, high (' + o.poleSpring.top + ' px)'); assert(o.poleSpring.pinned, 'and what she lands on is pinned'); }
  if (o.fullStretch) assert(o.fullStretch.plain === 0 && o.fullStretch.stretched > 0, 'FULL STRETCH reaches what the plain thrust cannot (' + JSON.stringify(o.fullStretch) + ')');
  if (o.spearDance) assert(o.spearDance.hits >= 5, 'SPEAR DANCE lands its thrusts on a foe stood at the point (' + o.spearDance.hits + ' of 6)');
  if (o.rain) assert(o.rain.pinned, 'RAIN OF SPEARS pins what it comes down on');
  if (out.heavy) { const { chop, held } = out.heavy;
    assert.equal(chop.st, 1, 'held a third of a second, the heavy cut comes down as the CHOP (stage ' + chop.st + ')');
    assert(chop.hp > 0 && chop.moved < 16, 'and it is a cut where he stands, not a charge across the floor (moved ' + chop.moved + ' px)');
    assert.equal(held.st, 3, 'held past a second it comes down as the KNOCKDOWN (stage ' + held.st + ')');
    assert(held.floored, 'and what it lands on goes down on its back');
    assert(!held.guard, 'and the shield never came up while the sword was raised, though C was held'); }
  if (out.rise) { const r = out.rise;
    assert(r.top >= 40, 'the bought rising cut must carry the foe up with him (it rose ' + r.top + 'px)');
    assert(r.held >= 40, 'and HOLD it up there after the climb for an air combo (held ' + r.held + ' frames)');
    assert(r.keys.includes('rise'), 'and he must be drawn in the upward cut, not the forward swing (drew ' + r.keys.join(',') + ')'); }
  assert.deepEqual(pg.errors, []);
  console.log('starter kits: ' + JSON.stringify(out));
} finally { pg.close(); }
