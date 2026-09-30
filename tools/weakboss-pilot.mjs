/* tools/weakboss-pilot.mjs [maxSecs=240] [bosses=lamplit,fields,mage,unburied] [heroes=knight,warden,pyro] — THE WEAK BOSSES (claude/weakboss),
   piloted by the boss-lab hands: the Lampreeve (the Lamplit Street's mini), the Headless Ploughman (fields' mini), the Homunculus (mage's mini) and the
   Death Knight (unburied's boss), refill health, one pinned seed per hero. A row a fight: how it ended, how long, the health the hero lost
   and per minute, how many times the boss was opened, the modes it entered and which of them did the damage. Not in the suite: too long. */
import { openPage } from './cdp.mjs';
const maxSecs = +(process.argv[2] || 240);
const BOSSES = (process.argv[3] || 'lamplit,fields,mage').split(',');
const HEROES = (process.argv[4] || 'knight,warden,pyro').split(',');
const MINI = { lamplit: true, fields: true, mage: true };
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const lv of BOSSES) {
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;
      const o=await BK.bossLab({bosses:[${JSON.stringify(lv)}],mini:${!!MINI[lv]},heroes:${JSON.stringify(HEROES)},maxSecs:${maxSecs},modes:true});
      return o.rows.map(r=>({lv:${JSON.stringify(lv)},h:r.h,out:r.outcome||r.skipped,secs:r.secs,left:r.hpLeftPct,taken:Math.round(r.health?r.health.damageTaken:0),perMin:r.takenPerMin,opened:r.opened,swings:r.swings,modes:r.modes,hitBy:r.hitBy}));})()`, 3600000);
    rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
  }
  console.log('| boss | hero | outcome | secs | hp taken | per min | opened |');
  for (const r of rows) console.log(`| ${r.lv} | ${r.h} | ${r.out} | ${r.secs} | ${r.taken} | ${r.perMin} | ${r.opened} |`);
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
