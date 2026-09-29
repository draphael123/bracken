/* tools/duck-pilot.mjs [label] - THE UNIVERSAL DUCK's boss pilot (claude/duck): STORMHOLD's QUEEN'S LANCE, whose thrust is the
   high blow a ducking hero lets go over him, through BK.bossLab (src/lab.js): the knight, the warden and the pyromancer, one pinned
   seed each, the ranking's settings (refill health, a 150 s cap). Run it BEFORE and AFTER a change to the duck or the bot's answer
   to a high tell. Prints one row per fight. Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
const label = process.argv[2] || 'run', HEROES = ['knight', 'warden', 'pyro'];
const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.reload();
  const r = await pg.evalp(`(async()=>{BK.SET.speed=1;const o=await BK.bossLab({bosses:['storm'],heroes:${JSON.stringify(HEROES)},healthMode:'refill',maxSecs:150,modes:true,salt:'duck-1'});
    return o.rows.map(r=>({h:r.h,out:r.outcome||r.skipped,secs:r.secs,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin,hitBy:r.hitBy}));})()`, 1800000);
  for (const x of r) console.log(label, JSON.stringify(x));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
