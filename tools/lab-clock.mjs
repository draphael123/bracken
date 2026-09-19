import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const pg = await openPage();
try {
  const r = await pg.evalp(`(async()=>{
    BK.load(0); BK.state='play'; BK.god=true; BK.manualSimulation=true;
    const t0=BK.time; await new Promise(r=>setTimeout(r,300)); const frozen=BK.time;
    BK.sim(60); const stepped=BK.time;
    BK.manualSimulation=false; await new Promise(r=>setTimeout(r,300)); const resumed=BK.time;
    let restored=false;
    try { await BK.bossLab({bosses:['stockade'],heroes:['knight'],maxSecs:1,onFrame(){throw Error('test cleanup');}}); }
    catch(e) { restored=e.message==='test cleanup'&&BK.manualSimulation===false; }
    return {t0,frozen,stepped,resumed,restored};
  })()`);
  assert.equal(r.frozen,r.t0,'animation and watchdog loops must not advance a manual simulation');
  assert(r.stepped>r.frozen,'explicit simulation must still advance');
  assert(r.resumed>r.stepped,'normal loop must resume');
  assert(r.restored,'lab must restore normal timing on errors');
  assert.deepEqual(pg.errors,[]);
  console.log('Manual combat simulation isolates yielding labs and restores the normal loop after errors.');
} finally { pg.close(); }
