import assert from 'node:assert/strict';
import {openPage} from './cdp.mjs';
const pg=await openPage({audio:false,fonts:false});
try {
  for (const [lvl,h] of [['reef','warden'],['longwater','reaper'],['flotilla','knight']]) {
    await pg.reload();
    const result=await pg.evalp(`(async()=>{
      BK.manualSimulation=true;let seed=1919;
      Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const grounded=new Set();
      const r=await BK.bossLab({bosses:[${JSON.stringify(lvl)}],heroes:[${JSON.stringify(h)}],maxSecs:180,modes:true,onFrame:({P,boss})=>{if(P.ground&&Math.abs(P.y-boss.y)<3)grounded.add(boss.phase);}});
      return {row:r.rows[0],groundedPhases:[...grounded]};
    })()`);
    const row=result.row;
    if(lvl==='flotilla') assert.deepEqual(result.groundedPhases,[1,2,3],'the pilot must stand on each fighting deck, not just jump within sword range');
    assert.equal(row.killed,true,`${h} must reach and finish ${lvl} through ordinary inputs`);
    assert.ok(row.damage.other>row.damage.plunge,'ordinary attacks must remain the majority of credited damage');
    if(lvl==='reef') assert.ok(row.modes.stuck>0,'evading the bite must create a genuine stuck-jaw opening');
    assert.deepEqual(pg.errors,[]);
    console.log(JSON.stringify(row));
  }
} finally {pg.close();}
