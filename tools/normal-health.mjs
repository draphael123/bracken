/* THE WINNABLE ROW MOVED OFF KING GORM (claude/sweep1 follow-up, Daniel approved Q7): King Gorm sits in the 50-60% boss band now (1000 hp, x1.5) and a level-1 legacy reaper rightly dies to him. The row is the Bullfrog (marsh): the first-act puzzle wall whose openings are made, left untouched by the sweep (no number changed, 58% for the standard bot), and the one early boss a level-1 hero is MEANT to be able to beat at normal health. Every assertion is unchanged - a win, never died, endHp>0, health reconciles - and the damageTaken>0 line now holds for it too (the King took none), so its exemption is gone. */
/* THE WINNABLE ROW is Kingswood's, not the Deep's: the Diving Bell was the easy fight this leaned on, and he is not easy now (docs/briefs/deep-rework-2.md) */
/* THE DEATH ROW MOVED OFF LONGWATER (claude/botfix, batch32): longwater/knight/normal used to stop on death here, but two real bot
   fixes in this lane changed that - the stuck-recovery no longer drops the guard mid-tell (it was forcing k.block=false and, on
   top of that, setting only ONE of k.left/k.right without clearing the other, so a frame that disagreed with the walker's own
   pick left both true and cancelled all movement - tools/boss-navigation.mjs's own longwater/reaper row chased this down first)
   and the small-adds/Herald damage-window fixes upstream of it. The same seed (1919) now WINS this fight at normal health
   (asserted false on the old code, confirmed with two runs of this file alone before the swap): the bot got better, not the
   fight easier, so this is not a weakened test - every assertion below is unchanged, only the row that exercises death moved to
   one still genuinely hard at normal health. The Diving Bell (src/lab.js's 'deep'/bellcrab) is that row: knight and reaper both
   die to him in the low 40s at normal health on this seed (checked twice each, deterministic), matching the top comment above -
   he was made not-easy in the deep rework and never got easier for this lane's fixes, because none of them touch him. */
import assert from 'node:assert/strict';import{openPage}from'./cdp.mjs';
const pg=await openPage({audio:false,fonts:false});const results=[];
try{
 for(const [lvl,h,mode,secs]of[['deep','knight','normal',180],['marsh','reaper','normal',180],['longwater','knight','refill',30]]){
  await pg.reload();const row=await pg.evalp(`(async()=>{BK.manualSimulation=true;let seed=1919;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};return(await BK.bossLab({bosses:[${JSON.stringify(lvl)}],heroes:[${JSON.stringify(h)}],healthMode:${JSON.stringify(mode)},maxSecs:${secs}})).rows[0]})()`);
  assert.equal(row.health.mode,mode);assert.ok(row.health.damageTaken>0,'actual enemy attacks must cost health');
  if(mode==='normal'){if(lvl==='deep'){assert.equal(row.outcome,'death');assert.equal(row.health.died,true);assert.ok(row.secs<secs,'stop on death instead of clearing it');assert.equal(row.health.endHp,0);}else{assert.equal(row.outcome,'win');assert.equal(row.health.died,false);assert.ok(row.health.endHp>0);}assert.ok(Math.abs(row.health.startHp+row.health.healthRecovered-row.health.damageTaken-row.health.endHp)<.001,'normal health must reconcile without invisible refills');}
  else {assert.ok(row.health.endHp>0);assert.ok(row.health.damageTaken>row.health.startHp-row.health.endHp,'refill mode remains explicitly distinct');}
  results.push(row);
 }
 assert.deepEqual(pg.errors,[]);console.log(JSON.stringify(results));
}finally{pg.close();}
