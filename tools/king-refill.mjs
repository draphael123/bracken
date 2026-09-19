import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false});
try {
  const result=await pg.evalp(`(async()=>{
    BK.manualSimulation=true;
    const {LEVELS}=await import('./src/level.js');
    BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='kings'));BK.start();BK.god=true;
    const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(30);
    const b=BK.boss,rack=BK.props().filter(c=>c.t==='dropcage'&&c.boss);
    for(const c of rack){c.dropped=true;c.spent=true;c.landed=1;c.y=A.floor;}
    b.phase=2;b.mode='held';b.modeT=3;b.open=0;b.stagger=3;
    BK.sim(120);
    const heldIntact=rack.every(c=>c.dropped&&c.spent);
    b.mode='walk';b.modeT=100;b.open=0;b.stagger=0;b.grabT=b.shoutT=b.throneT=100;
    BK.P.x=A.x0+32;BK.P.y=A.floor;
    BK.sim(240);
    const available=rack.filter(c=>!c.dropped&&!c.spent).length;
    b.phase=3;b.mode='walk';b.modeT=100;b.open=0;b.stagger=0;
    b.grabT=b.shoutT=b.throneT=b.cageT=100;
    const landing=A.x0+300;
    b.thrown={x:landing,y:A.floor,vx:0,vy:0,hit:true};BK.sim(1);
    const obstacle=BK.throneBlock;
    b.x=obstacle.x-70;b.y=A.floor;b.vx=b.vy=0;
    BK.P.x=obstacle.x+190;BK.P.y=A.floor;
    BK.sim(600);
    return{count:rack.length,heldIntact,available,crossedThrone:b.x>obstacle.x+40,throneRemains:!!BK.throneBlock};
  })()`);
  assert(result.count>0);assert(result.heldIntact,'do not erase a live cage opening');
  assert(result.available>0,'a completely spent rack must refill without an unused cage');
  assert(result.crossedThrone,'the king must cross his own fallen throne to reach remaining cages');
  assert(result.throneRemains,'the fallen throne remains usable scenery and cover');
  assert.deepEqual(pg.errors,[]);
  console.log('Spent cages refill, active openings remain intact, and King Gorm crosses his fallen throne.');
} finally {pg.close();}
