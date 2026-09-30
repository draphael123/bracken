/* tools/crouch-a-pilot.mjs [label] - THE CROUCH TWISTS, PART A's pilot (claude/croucha): the KNIGHT, the WARDEN and the FREEBOOTER, one
   pinned seed each, run BEFORE and AFTER a change to their crouch or the bot's use of it:
     1. STORMHOLD's QUEEN'S LANCE through BK.bossLab (src/lab.js), the duck pilot's settings (refill health, a 150 s cap, salt duck-1)
     2. THE STOCKADE's ambush room, THE KENNEL YARD (an archer captain, a sprig, a hound's pounce, a shield) through BK.ambushLab, the
        dice pinned (seed 2024): the room played straight, health put back, what it took counted
   Prints one row per fight, and the crouch's own counters (BK.crouchA, when there is one). Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
const label = process.argv[2] || 'run', HEROES = ['knight', 'warden', 'pirate'];
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const h of HEROES) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.SET.speed=1;const o=await BK.bossLab({bosses:['storm'],heroes:['${h}'],healthMode:'refill',maxSecs:150,modes:true,salt:'duck-1'});
      return o.rows.map(r=>({h:r.h,out:r.outcome||r.skipped,secs:r.secs,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin}));})()`, 1800000);
    for (const x of r) console.log(label, 'lance', JSON.stringify(x));
    console.log(label, 'lance crouch', h, JSON.stringify(await pg.evalp('window.BK.crouchA ? BK.crouchA().stats : null')));
    await pg.reload();
    const a = await pg.evalp(`(async()=>{BK.SET.speed=1;let seed=2024;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
      const o=await BK.ambushLab({levels:['stockade'],heroes:['${h}'],reps:1});return o.rows;})()`, 1800000);
    for (const x of a) console.log(label, 'ambush', JSON.stringify(x));
    console.log(label, 'ambush crouch', h, JSON.stringify(await pg.evalp('window.BK.crouchA ? BK.crouchA().stats : null')));
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
