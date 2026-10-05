/* tools/fat-pilot.mjs [bosses=crown,kings] [heroes=knight,warden,pyro] [maxSecs=300] [seed=s1] - the goblin queen's and King Gorm's
   fights, piloted by the boss-lab hands: one row a fight (hero, outcome, seconds, hp left, damage taken a minute). Not in the suite
   (too long). Used for the BEFORE and AFTER of the fat-queen pass. */
import { openLevelPage as openPage } from './boss-level.mjs';   /* the hero fights at the level's campaign level (tools/boss-level.mjs; --level=N overrides) */
const bosses = (process.argv[2] || 'crown,kings').split(','), heroes = (process.argv[3] || 'knight,warden,pyro').split(','), maxSecs = +(process.argv[4] || 300), seed = process.argv[5] || 's1';
const pg = await openPage({ audio: false, fonts: false });
try {
  for (const b of bosses) {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;
      const o=await BK.bossLab({bosses:['${b}'],heroes:${JSON.stringify(heroes)},maxSecs:${maxSecs},modes:true,seed:'${seed}'});
      return o.rows.map(r=>({b:'${b}',h:r.h,out:r.outcome,secs:r.secs,left:r.hpLeftPct,perMin:r.takenPerMin,hitBy:r.hitBy}));})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x));
  }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
