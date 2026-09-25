/* tools/reef-hulk.mjs - THE SHIPWRECK REEF's HULK (docs/briefs/reef-longer.md), proved in the page: the grate across her stern is DOWN
   when the level loads (PORT tiles, laid by main.js from the capstan's ent - the built grid leaves them open so the reach model sees the
   way on), three blows on the capstan on her deck lift it, it stays up through a death, and a swimmer can go out through it. Also the
   bell-pool: standing on its floor the breath clock runs, and standing in its bell it fills. */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
  const {LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;
  BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='reef'));BK.state='play';BK.god=true;
  for(const e of BK.enemies())e.alive=false;
  const L=BK.L,W=L.W,cap=L.ents.find(e=>e.t==='capstan'&&e.gate!==undefined);if(!cap)return{error:'no capstan with a grate'};
  const tiles=()=>{const o=[];for(let y=cap.gy0;y<=cap.gy1;y++)o.push(L.grid[y*W+cap.gate]);return o;};
  const out={gate:cap.gate,atLoad:tiles(),PORT:T.PORT};
  /* three blows on the capstan */
  BK.tp(cap.x-1,cap.y);BK.sim(20);BK.P.face=1;
  for(let k=0;k<3;k++){BK.press('atk');BK.sim(40);}
  BK.sim(60);out.afterTurns=tiles();
  /* a death, and the level put back: the grate stays up */
  BK.god=false;BK.P.inv=0;const px0=BK.P.x;BK.damagePlayer(BK.P.x,99999,{unblockable:true});out.died=!!BK.P.dead;BK.sim(400);BK.god=true;out.afterDeath=tiles();out.respawned=Math.abs(BK.P.x-px0)>32;
  /* swim out through it: from inside her hold, by the grate, heading right */
  for(const e of BK.enemies())e.alive=false;
  BK.tp(cap.gate-3,cap.gy1);BK.sim(10);const x0=BK.P.x;const K=BK.keys;K.right=true;for(let i=0;i<180;i++)BK.sim(1);K.right=false;out.swamFrom=Math.round(x0/16);out.swamTo=Math.round(BK.P.x/16);
  /* THE BELL-POOL: on its floor the breath goes; in the bell it comes back */
  const bell=L.ents.find(e=>e.t==='deco'&&e.kind==='airBell'&&e.x>=213&&e.x<=232);out.bell=bell&&bell.x;
  BK.tp(bell.x-4,bell.y);BK.sim(5);BK.P.breath=6;for(let i=0;i<150;i++){BK.keys.down=true;BK.sim(1);}BK.keys.down=false;out.breathOnFloor=+(BK.P.breath).toFixed(2);out.onFloor=BK.P.swim;
  BK.tp(bell.x,bell.y);for(let i=0;i<120;i++){BK.P.x=bell.x*16+8;BK.sim(1);}out.breathInBell=+(BK.P.breath).toFixed(2);
  return out;})()`, 300000);
  console.log(JSON.stringify(r));
  assert.ok(!r.error, r.error);
  assert.ok(r.atLoad.every(t => t === r.PORT), 'the grate must be down when the level loads: ' + r.atLoad);
  assert.ok(r.afterTurns.every(t => t === 0), 'three turns of the capstan must lift the grate: ' + r.afterTurns);
  assert.ok(r.died && r.respawned, 'the death did not happen: ' + JSON.stringify([r.died, r.respawned]));
  assert.ok(r.afterDeath.every(t => t === 0), 'the grate must stay up through a death: ' + r.afterDeath);
  assert.ok(r.swamTo > r.gate + 1, 'a swimmer must get out through the lifted grate (from ' + r.swamFrom + ' to ' + r.swamTo + ', the grate at ' + r.gate + ')');
  assert.ok(r.breathOnFloor < 5.5, 'on the bell-pool floor the breath clock must run (' + r.breathOnFloor + ')');
  assert.ok(r.breathInBell > r.breathOnFloor, 'the bell in the bell-pool must give the breath back (' + r.breathOnFloor + ' -> ' + r.breathInBell + ')');
  assert.deepEqual(pg.errors, [], 'page errors');
  console.log('ok  reef-hulk  the grate is down at load, three turns lift it, it stays up through a death, the hold swims out through it; the bell-pool drains and refills');
} finally { pg.close(); }
