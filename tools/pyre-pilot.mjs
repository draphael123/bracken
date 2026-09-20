import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try {
  const result=await pg.evalp(`(async()=>{
    BK.manualSimulation=true;let seed=1919;
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    let wasFull=false,casts=0;
    const r=await BK.bossLab({bosses:['longwater'],heroes:['pyro'],maxSecs:180,onFrame:({P})=>{
      if(wasFull&&!P.full&&P.blastT>0&&P.heat===0)casts++;
      wasFull=!!P.full;
    }});
    return {row:r.rows[0],casts};
  })()`);
  assert.ok(result.casts>0,'the pilot must spend earned full heat, not let every bank expire');
  assert.equal(result.row.killed,true,'the existing Pyre move must let the baseline pilot finish the Herald');
  assert.deepEqual(pg.errors,[]);
  console.log(JSON.stringify(result));
} finally {pg.close();}
