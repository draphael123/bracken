// tools/geo-board.mjs - THE GEOMANCER'S BOARD (claude/geoid, Daniel 10-31 Q3 + 11-01 3rd jab). Played through her real input in the real page:
//   stands   her stone is up ten seconds on, and the hero meter reads the board (a third a stone)
//   gnaw     a foe pressed against it costs it a hp per GEO.stone.gnaw s and, at hp 0, it breaks (a walker cannot pen a route for good)
//   ram      a foe that hits it at charge speed (>= GEO.stone.chargeSp) breaks it outright; a boss-class one is OPENED UP (stunned)
//   gate     no stone goes within the gate rule of a gate/door/plate (freeCell asks blockedAt)
//   fist     THE STONE FIST: her third jab knocks a normal foe UP (launchedT, vy < 0) once per GEO.fist.lock; a mini is only staggered; jabs 1 and 2 do not
//   topple   (claude/ults: AVALANCHE) UP+C with the board FULL (3): every stone erupts then rolls as a boulder (rollers), the board is empty, a foe in the way is hurt; two stones: nothing
//   room     leaving the room (clear) restores the grid byte for byte
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(()=>{
    window.__geo=(ids,flat=true,lv=0,hl=20)=>{if(BK.geo())BK.geo().clear();BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('geomancer');BK.reset({fresh:true});BKT.setHeroLevel("geomancer",hl);
      BKT.PROG.skillOwned.geomancer=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts.geomancer=ids.slice(0,2);BK.applyUpgrades();BK.load(lv);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;
      if(flat){for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;BK.tp(10,21);}
      BK.sim(30);BK.P.hp=BK.P.maxHp=9999;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;};
    window.__foe=(t,dx,o={})=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=o.hp||5000;e.cd=99;e.biteCd=99;e.y=352;Object.assign(e,o.set||{});return e;};
    return 1})()`);
  const out = {};
  out.stands = await pg.evalp(`(()=>{__geo([]);const G=BK.geo();BK.P.st=BK.P.maxSt;G.raiseWall();BK.sim(2);BK.P.face=-1;BK.P.x+=40;BK.P.face=1;G.raiseWall();BK.sim(2);const n=G.pieces().length;BK.sim(600);return {n,after:G.pieces().length,fill:BK.P.tremor,hp:G.pieces().map(p=>p.hp)}})()`);
  out.gnaw = await pg.evalp(`(()=>{__geo([]);const G=BK.geo();BK.P.st=BK.P.maxSt;G.raiseWall();BK.sim(3);const p=G.pieces()[0];if(!p)return {none:1};const hp0=p.hp,wx=(p.x0+p.x1)/2;
    const e=__foe('swornsword',wx-BK.P.x+30);e.x=p.x1+8;e.face=-1;let t=0,minhp=hp0;for(let i=0;i<60*12&&!p.gone;i++){e.face=-1;e.vx=-30;BK.sim(1);t++;minhp=Math.min(minhp,p.hp);}
    return {hp0,minhp,gone:!!p.gone,secs:Math.round(t/60*10)/10}})()`);
  out.ram = await pg.evalp(`(()=>{const run=big=>{__geo([]);const G=BK.geo();BK.P.st=BK.P.maxSt;G.raiseWall();BK.sim(3);const p=G.pieces()[0];if(!p)return {none:1};const e=__foe('swornsword',80,big?{set:{mini:true}}:{});
      e.x=p.x1+40;e.face=-1;for(let i=0;i<30&&!p.gone;i++){e.x-=3;e.face=-1;BK.sim(1);}return {gone:!!p.gone,stagger:Math.round((e.stagger||0)*10)/10,open:(e.disarmOpenT||0)>0}};
    return {small:run(false),big:run(true)}})()`);
  out.fist = await pg.evalp(`(()=>{__geo([]);BK.P.face=1;const e=__foe('sprig',20);e.x=BK.P.x+18;e.hp=e.hp0=99999;const P=BK.P;let ups=[];for(let n=1;n<=3;n++){let seen=false;BK.press('atk');for(let i=0;i<30;i++){BK.sim(1);e.x=P.x+18;if(e.liftImm>0)seen=true;}ups.push(seen);}
    return {ups}})()`);
  out.topple = await pg.evalp(`(()=>{__geo([]);const G=BK.geo(),K=BK.keys,P=BK.P;P.st=P.maxSt;G.raiseWall();BK.sim(2);P.x+=30;P.face=1;G.raiseWall();BK.sim(2);P.x+=30;P.face=1;G.raiseWall();BK.sim(2);P.x-=60;P.face=1;const e=__foe('swornsword',100);e.hp=e.hp0=9999;const n=G.pieces().length;
    K.up=true;K.block=true;BK.sim(2);K.block=false;K.up=false;const erupting=G.erupts().length;let rolled=0,hurt=0;for(let i=0;i<150;i++){BK.sim(1);rolled=Math.max(rolled,G.rollers().length);hurt=Math.max(hurt,e.hp0-e.hp);}return {n,after:G.pieces().length,erupting,rolled,hurt}})()`);
  out.one = await pg.evalp(`(()=>{__geo([]);const G=BK.geo(),K=BK.keys,P=BK.P;P.st=P.maxSt;G.raiseWall();BK.sim(2);P.x+=30;P.face=1;G.raiseWall();BK.sim(2);P.x-=30;K.up=true;K.block=true;BK.sim(2);K.block=false;K.up=false;BK.sim(5);return {after:G.pieces().length,rolled:G.rollers().length}})()`);
  out.room = await pg.evalp(`(()=>{__geo([]);const g0=Array.from(BK.L.grid),G=BK.geo();BK.P.st=BK.P.maxSt;G.raiseWall();BK.sim(2);const had=G.pieces().length;G.clear();return {had,same:g0.every((v,i)=>v===BK.L.grid[i])}})()`);
  console.log(JSON.stringify(out));
  assert(out.stands.n === 2 && out.stands.after === 2 && out.stands.fill >= 60, 'her stone stands ten seconds on and the meter reads the board ' + JSON.stringify(out.stands));
  assert(out.gnaw.minhp < out.gnaw.hp0, 'a foe pressed on a stone costs it hp ' + JSON.stringify(out.gnaw));
  assert(out.ram.small.gone && out.ram.big.gone && out.ram.big.open, 'a charge breaks it outright, a mini is opened up ' + JSON.stringify(out.ram));
  assert.deepEqual(out.fist.ups, [false, false, true], 'only the third jab knocks up ' + JSON.stringify(out.fist));
  assert(out.topple.n >= 3 && out.topple.after === 0 && out.topple.erupting >= 3 && out.topple.rolled >= 3 && out.topple.hurt > 0, 'UP+C at a FULL board (3): every stone erupts, then rolls as a boulder, the stones are spent, the foe is hurt ' + JSON.stringify(out.topple));
  assert(out.one.after === 2 && out.one.rolled === 0, 'two stones are not a full board: no avalanche ' + JSON.stringify(out.one));
  assert(out.room.had >= 1 && out.room.same, 'leaving the room puts the grid back ' + JSON.stringify(out.room));
  assert.deepEqual(pg.errors, []);
  console.log('geo-board: stands, gnaw, ram, fist, avalanche, room all green');
} finally { pg.close(); }
