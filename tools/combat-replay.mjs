import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false}), rows=[];
try {
  for(let i=0;i<2;i++){
    await pg.reload();
    rows.push(await pg.evalp(`(async()=>{
      BK.manualSimulation=true;
      let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      return (await BK.bossLab({bosses:['marsh'],heroes:['knight'],maxSecs:180})).rows[0];
    })()`));
  }
  assert(rows[0].killed,'reference encounter must finish');
  assert.deepEqual(rows[0],rows[1],'fresh seeded runs must have identical outcomes');
  assert.deepEqual(pg.errors,[]);
  console.log('Fresh combat replays agree on time, damage, attacks, defenses and outcome.');
} finally {pg.close();}
