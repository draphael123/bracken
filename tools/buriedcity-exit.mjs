// tools/buriedcity-exit.mjs - THE BURIED CITY'S EXIT GATE LEADS ON (batch91 integ, scratch/brief-buriedcity4.md item 0).
// THE BUG: "the final exit gate does not advance to the next level". The gate stands at stage col W-2 (col 788) of the throne room; phase two's east
// sand BANK (HK_STAGE.banks [37, 39] = cols 787-789, T.SOFT, solid) is written over it, and nothing took the bank away when the King fell - the gate
// was walled in sand, the hero stopped at col 786 and the level could not end. Fixed in src/hourglass-king-hands.js H.end (the death takes the banks
// and the sandstone blocks away).
// THIS CHECK walks the whole way out, with real keys: the King is brought through his three phases (the banks and blocks really written), killed, the
// hero set at the throne room's door and HELD RIGHT: he must reach the gate by walking (state 'win', the level cleared, no sand left over the gate), the
// win card's confirm must put him on the map (the road goes on past the Buried City), and the next level on the road (THE SEALED PYRAMID, src/campaign-order.js)
// must be open to him - by the campaign (its `needs` met) and by level select (BK.levelJump loads it).
//   node tools/buriedcity-exit.mjs
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { chainOf } from '../src/campaign-order.js';
import { openPage } from './cdp.mjs';

const road = chainOf(LEVELS.filter(l => !l.hidden)).road, i = road.indexOf('buriedcity');
assert.ok(i >= 0 && road[i + 1], 'the Buried City is not on the road, or ends it');
const NEXT = road[i + 1];
assert.equal(NEXT, 'sealedpyramid', 'the road after the Buried City is ' + NEXT + ', not the Sealed Pyramid (src/campaign-order.js)');
assert.equal(LEVELS.find(l => l.id === NEXT).needs, 'buriedcity', 'the next level does not open on the Buried City');

const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const {LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    const li=LEVELS.findIndex(l=>l.id==='buriedcity');BK.setHero('knight');BK.reset({fresh:true});BK.load(li);BK.state='play';BK.god=true;
    const A=BK.L.arena,gt=BK.L.ents.find(e=>e.t==='gate'),W=BK.L.W;
    BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);
    const b=BK.boss;out.king=!!b&&b.t==='hourglassking';
    const sandAtGate=()=>{let n=0;for(let y=Math.round(A.floor/16)-3;y<Math.round(A.floor/16);y++)for(let x=gt.x-1;x<=gt.x+1;x++)if(BK.L.grid[y*W+x]===T.SOFT)n++;return n;};
    /* the three phases, as the fight does them: the sands rise (the banks are written) */
    for(const f of [0.6,0.3]){b.hp=Math.floor(b.maxHp*f);b.open=0;for(let k=0;k<240;k++){if(BK.state==='card')BK.cardClose();BK.sim(1);}}
    out.sandMidFight=sandAtGate();
    b.mode='walk';b.open=5;BKT.hurtEnemy(b,b.maxHp*2,b.x-10,false);
    for(let k=0;k<900&&!BK.L.gateOpen;k++){if(BK.state==='card')BK.cardClose();BK.sim(1);}
    out.gateOpen=!!BK.L.gateOpen;out.dead=!b.alive;for(let k=0;k<120;k++){if(BK.state==='card')BK.cardClose();BK.sim(1);}
    out.sandAfter=sandAtGate();
    /* and out: from the door of the throne room, right held */
    BK.tp(Math.round(A.x0/16)+30,Math.round(A.floor/16)-1);BK.sim(5);BK.keys.right=true;
    let f=0;for(;f<1500&&BK.state==='play';f++){if(BK.state==='card')BK.cardClose();BK.sim(1);}
    BK.keys.right=false;out.walkedFrames=f;out.state=BK.state;out.x=Math.round(BK.P.x);out.gateX=gt.x*16;
    out.cleared=!!(BK.PROG.buriedcity&&BK.PROG.buriedcity.cleared);
    BK.press('confirm');for(let k=0;k<60;k++)BK.sim(1);out.afterConfirm=BK.state;
    /* the next level, by level select */
    out.nextOpen=LEVELS.find(l=>l.id==='sealedpyramid').needs==='buriedcity'&&out.cleared;
    BK.keys.right=false;const ok=BK.levelJump('sealedpyramid','knight',false);for(let k=0;k<200;k++)BK.sim(1);out.jumped=ok&&!!BK.L.sealedpyramid;out.jumpState=BK.state;
    return out;})()`, 300000);
  console.log(JSON.stringify(r));
  assert.ok(r.king, 'the Hourglass King was not in the throne room');
  assert.ok(r.sandMidFight > 0, 'the check did not bring him through the sands rising (no bank over the gate in phase two): ' + JSON.stringify(r));
  assert.ok(r.dead && r.gateOpen, 'the gate did not open when he fell: ' + JSON.stringify(r));
  assert.equal(r.sandAfter, 0, 'sand is still standing over the exit gate after his death: the gate is walled in');
  assert.equal(r.state, 'win', 'walking right through the throne room did not reach the gate and end the level (state ' + r.state + ', x ' + r.x + ', gate ' + r.gateX + ')');
  assert.ok(r.cleared, 'the Buried City is not cleared after the gate');
  assert.equal(r.afterConfirm, 'map', 'the win card does not go on to the map (' + r.afterConfirm + ')');
  assert.ok(r.nextOpen && r.jumped, 'the next level (the Sealed Pyramid) is not open from the Buried City\'s exit: ' + JSON.stringify(r));
  assert.deepEqual(pg.errors, [], 'page errors');
  console.log('ok  buriedcity-exit  the King through his three phases and down, the sand banks gone from the gate, the hero walks out of it to the win card, the map, and the Sealed Pyramid opens (campaign + level select)');
} finally { pg.close(); }
