/* tools/firsthour-pilot.mjs [maxSecs=300] [seeds=1] [levels=wood,marsh] [combat=classic|weighty] — THE FIRST HOUR'S TWO BOSSES (the Hornet Queen and the Bullfrog
   King), piloted by the boss-lab hands with the three heroes the lanes pilot with (knight, warden, pyro): refill health, a 300 s cap,
   one pinned roll per seed. Prints one row a fight - outcome, seconds, health left, damage taken a minute, the modes it spent time in
   (so a new opening shows up as time spent in it) and what hit the hero - and a summary. Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
const maxSecs = +(process.argv[2] || 300), seeds = +(process.argv[3] || 1), levels = (process.argv[4] || 'wood,marsh').split(','), combat = process.argv[5] || 'classic';   /* the combat switch (src/weighty.js) */
const HEROES = ['knight', 'warden', 'pyro'];
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const lv of levels) for (let s = 0; s < seeds; s++) {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setCombat(${JSON.stringify(combat)});
      const o=await BK.bossLab({bosses:[${JSON.stringify(lv)}],heroes:${JSON.stringify(HEROES)},maxSecs:${maxSecs},modes:true${s ? ",seed:'s" + s + "'" : ''}});
      return o.rows.map(r=>({lv:${JSON.stringify(lv)},h:r.h,out:r.outcome,secs:r.secs,left:r.hpLeftPct,perMin:r.takenPerMin,swings:r.swings,modes:r.modes,hitBy:r.hitBy}));})()`, 3600000);
    rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
  }
  for (const lv of levels) { const R = rows.filter(r => r.lv === lv), wins = R.filter(r => r.out === 'win' || r.out === 'trade'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
    console.log(lv + ': fights ' + R.length + ', wins ' + wins.length + ', median win ' + (secs.length ? secs[secs.length >> 1] : '-') + ' s'); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
