// tools/wicker-queen-pilot.mjs [salts=1] [heroes=knight,warden,pyro] - THE WICKER QUEEN (the Harvest Fair's boss, src/wicker-queen.js) at NORMAL health, one
// pass per salt (bossLab pins its dice per row; docs/INTEGRATOR.md section 6). One life per fight, no refills. Prints a row a fight (outcome, seconds, health
// left, how often she BURNED - the bonfire opening the bot is taught in src/lab.js - how often she caught, lashed and crowned, and what did the damage) and
// a summary against the house band (60-75% wins, median win 90-150 s). Not in the suite: it is too long.   usage: node tools/wicker-queen-pilot.mjs
import { openLevelPage as openPage } from './boss-level.mjs';   /* the hero fights at the level's campaign level (tools/boss-level.mjs; --level=N overrides) */
const salts = (process.argv[2] || '1').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;
      const o=await BK.bossLab({bosses:['fair'],heroes:${JSON.stringify(heroes)},healthMode:'normal',maxSecs:300,modes:true,salt:${salt}});
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),left:r.hpLeftPct,bossLeft:r.bossHpLeftPct??r.bossLeft,burns:(r.modes||{}).burn||0,modes:r.modes,hitBy:r.hitBy}));})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: 'wickerqueen', fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
