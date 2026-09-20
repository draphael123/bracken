import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try {
  const result=await pg.evalp(`(async()=>{
    BK.manualSimulation=true;let seed=1919;
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    let loaded=false,shots=0;
    const r=await BK.bossLab({bosses:['longwater'],heroes:['pirate'],maxSecs:180,onFrame:({P})=>{
      if(loaded&&!P.loaded)shots++;
      loaded=!!P.loaded;
    }});
    return {row:r.rows[0],shots};
  })()`);
  assert.ok(result.shots>0,'the pilot must spend a genuinely loaded pistol');
  assert.ok(result.row.returns>0,'the pilot must actually parry the Herald');
  assert.equal(result.row.killed,true,'the existing kit must finish the Herald without restoring stamina or ammo');
  assert.deepEqual(pg.errors,[]);
  console.log(JSON.stringify(result));
} finally {pg.close();}
