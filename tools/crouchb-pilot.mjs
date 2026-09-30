/* tools/crouchb-pilot.mjs [label] - THE CROUCH TWISTS, PART B's pilot (claude/crouchb): the PALADIN, the GEOMANCER and the DEATH KNIGHT,
   one pinned seed each, run BEFORE and AFTER a change to their crouch (src/crouch-b.js) or to the bot's use of it (src/lab.js crouchBPlan):
     1. STORMHOLD's QUEEN'S LANCE through BK.bossLab, the duck pilot's settings (refill health, a 150 s cap, salt duck-1)
     2. a common-foe level with buried foes, THE BURIAL CAVERNS' ambush room (BK.ambushLab: the room played straight, health put back
        each frame, what it took counted), Math.random pinned per hero
   Prints one row per fight and what the crouch did in it (BK.crouchB().stats; null on a base that has no crouch twists). Not in the
   suite: it is too long. */
import { openPage } from './cdp.mjs';
const label = process.argv[2] || 'run', HEROES = ['paladin', 'geomancer', 'reaper'];
const pg = await openPage({ audio: false, fonts: false });
const stats = () => pg.evalp('window.BK.crouchB ? BK.crouchB().stats : null');
try {
  for (const h of HEROES) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.SET.speed=1;BK.crouchBReset&&BK.crouchBReset();const o=await BK.bossLab({bosses:['storm'],heroes:['${h}'],healthMode:'refill',maxSecs:150,modes:true,salt:'duck-1'});
      return o.rows.map(r=>({h:r.h,out:r.outcome||r.skipped,secs:r.secs,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin}));})()`, 1800000);
    for (const x of r) console.log(label, 'lance', JSON.stringify(x), 'crouch', JSON.stringify(await stats()));
    await pg.reload();
    const a = await pg.evalp(`(async()=>{BK.SET.speed=1;BK.crouchBReset&&BK.crouchBReset();let seed=2024;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
      const o=await BK.ambushLab({levels:['burial'],heroes:['${h}'],reps:1});return o.rows;})()`, 1800000);
    for (const x of a) console.log(label, 'ambush', JSON.stringify(x), 'crouch', JSON.stringify(await stats()));
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
