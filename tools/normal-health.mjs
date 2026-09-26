/* THE WINNABLE ROW is Kingswood's, not the Deep's: the Diving Bell was the easy fight this leaned on, and he is not easy now (docs/briefs/deep-rework-2.md) */
import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';
const pg=await openPage({audio:false,fonts:false});const results=[];
try{
 for(const [lvl,h,mode,secs]of[['longwater','knight','normal',180],['kings','reaper','normal',180],['longwater','knight','refill',30]]){
  await pg.reload();const row=await pg.evalp(`(async()=>{BK.manualSimulation=true;let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};return(await BK.bossLab({bosses:[${JSON.stringify(lvl)}],heroes:[${JSON.stringify(h)}],healthMode:${JSON.stringify(mode)},maxSecs:${secs}})).rows[0]})()`);
  assert.equal(row.health.mode,mode);if(lvl==='longwater')assert.ok(row.health.damageTaken>0,'actual enemy attacks must cost health');
  if(mode==='normal'){if(lvl==='longwater'){assert.equal(row.outcome,'death');assert.equal(row.health.died,true);assert.ok(row.secs<secs,'stop on death instead of clearing it');assert.equal(row.health.endHp,0);}else{assert.equal(row.outcome,'win');assert.equal(row.health.died,false);assert.ok(row.health.endHp>0);}assert.ok(Math.abs(row.health.startHp+row.health.healthRecovered-row.health.damageTaken-row.health.endHp)<.001,'normal health must reconcile without invisible refills');}
  else {assert.ok(row.health.endHp>0);assert.ok(row.health.damageTaken>row.health.startHp-row.health.endHp,'refill mode remains explicitly distinct');}
  results.push(row);
 }
 assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(results));
}finally{pg.close();}
