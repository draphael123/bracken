/* tools/hanging-pilots.mjs [passes=2] - THE HANGING VILLAGE's two fights through BK.bossLab (src/lab.js): THE OWL REEVE (the
   crown) and THE WEAVER (the Web Hollow, the mini), all six heroes, dice pinned per row, one salt per pass so pass two is not
   pass one again (docs/INTEGRATOR.md). Refill health (the danger number) and a 150 s cap, as the ranking measured them.
   Prints a row per fight (outcome, seconds, damage taken, how often the caused opening fired, which modes did the damage)
   and a summary per boss. Not in the suite: it is too long. */
import { openPage } from './cdp.mjs';
const passes = +(process.argv[2] || 2), pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (let p = 0; p < passes; p++) {
    for (const [boss, mini] of [['owl', false], ['spider', true]]) {
      await pg.reload();
      const r = await pg.evalp(`(async()=>{const o=await BK.bossLab({bosses:['hanging'],mini:${mini},maxSecs:150,modes:true,salt:'hanging-pass-${p}'});
        return o.rows.map(r=>({boss:'${boss}',pass:${p},h:r.h,out:r.outcome||r.skipped,secs:r.secs,taken:r.health?Math.round(r.health.damageTaken):null,tpm:r.takenPerMin,opened:r.opened,left:r.hpLeftPct,modes:r.modes,hitBy:r.hitBy}));})()`, 1800000);
      rows.push(...r); for (const x of r) console.log(JSON.stringify(x));
    }
  }
  for (const boss of ['owl', 'spider']) { const b = rows.filter(r => r.boss === boss), w = b.filter(r => r.out === 'win'), s = w.map(r => r.secs).sort((a, c) => a - c);
    const t = b.map(r => r.taken).filter(x => x !== null).sort((a, c) => a - c);
    console.log(boss + ': fights ' + b.length + ', wins ' + w.length + ', median win ' + (s.length ? s[s.length >> 1] : '-') + ' s, median damage taken ' + (t.length ? t[t.length >> 1] : '-') + ', opened (sum) ' + b.reduce((a, r) => a + (r.opened || 0), 0)); }
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
