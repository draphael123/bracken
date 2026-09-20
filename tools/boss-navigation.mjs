import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try {
  for (const [lvl,h] of [['reef','warden'],['longwater','reaper']]) {
    await pg.reload();
    const row=await pg.evalp(`(async()=>{
      BK.manualSimulation=true;let seed=1919;
      Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      return (await BK.bossLab({bosses:[${JSON.stringify(lvl)}],heroes:[${JSON.stringify(h)}],maxSecs:180,modes:true})).rows[0];
    })()`);
    assert.equal(row.killed,true,`${h} must reach and finish ${lvl} through ordinary inputs`);
    assert.ok(row.damage.other>row.damage.plunge,'ordinary attacks must remain the majority of credited damage');
    if(lvl==='reef') assert.ok(row.modes.stuck>0,'evading the bite must create a genuine stuck-jaw opening');
    assert.deepEqual(pg.errors,[]);
    console.log(JSON.stringify(row));
  }
} finally {pg.close();}
