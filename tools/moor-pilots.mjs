/* tools/moor-pilots.mjs [passes=2] - GALE MOOR's fight, THE WINDCALLER, through BK.bossLab (src/lab.js): all six heroes, dice
   pinned per row, one salt per pass so pass two is not pass one again (docs/INTEGRATOR.md). Refill health (the danger number) and
   a 150 s cap, as the ranking measured them. Prints a row per fight (outcome, seconds, damage taken, how often an opening fired,
   which modes did the damage) and a summary. Run before and after the rework (docs/briefs/gale-moor-rework.md). Not in the
   suite: it is too long. */
import { openPage } from './cdp.mjs';
const passes = +(process.argv[2] || 2), pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (let p = 0; p < passes; p++) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{const o=await BK.bossLab({bosses:['moor'],maxSecs:150,modes:true,salt:'moor-pass-${p}'});
      return o.rows.map(r=>({pass:${p},h:r.h,out:r.outcome||r.skipped,secs:r.secs,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin,opened:r.opened,left:r.hpLeftPct,modes:r.modes,hitBy:r.hitBy}));})()`, 1800000);
    rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
  }
  const w = rows.filter(r => r.out === 'win'), s = w.map(r => r.secs).sort((a, c) => a - c), t = rows.map(r => r.taken).filter(x => x !== null).sort((a, c) => a - c);
  console.log('windcaller: fights ' + rows.length + ', wins ' + w.length + ', median win ' + (s.length ? s[s.length >> 1] : '-') + ' s, median damage taken ' + (t.length ? t[t.length >> 1] : '-') + ', opened (sum) ' + rows.reduce((a, r) => a + (r.opened || 0), 0));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
