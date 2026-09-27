// tools/winchmaster-pilot.mjs [passes] — THE WINCHMASTER at NORMAL health, six heroes x passes, seeded. The band is 60-75% wins
// over 21+ runs with the median win at 90-150 s (the Mother Cap's and the Hedge Warden's band), so 4 passes is the least that means
// anything. The lab's hands play his fight as it is built (src/lab.js, reworked 2026-09-25: find the line that runs into the
// housing he is on, get to where it is boarded, ride a skip in answering him on the way, cut him on his ledge, and go for the
// housing he swings to next) - `opened` is how many times a drum was jammed, `housings` how many he was knocked off in a row.
// Its port is this checkout's own (tools/ports.mjs), so another worktree's pilot is never the page measured.
// usage: node tools/winchmaster-pilot.mjs 4
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';
const passes = +(process.argv[2] || 4);
const pg = await openPage({ port: portFor(6), audio: false, fonts: false });
const rows = [];
try {
  for (let p = 0; p < passes; p++) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;let seed=${3100 + p * 97};
      Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
      const o=await BK.bossLab({bosses:['oreroad'],healthMode:'normal',maxSecs:300,modes:true,salt:${p}});   /* bossLab pins its own dice per row (341cb78), which made the seed above dead: every pass replayed pass 1. The salt makes each pass its own fight */
      return o.rows.map(r=>({h:r.h,out:r.outcome||(r.won?'win':r.dead?'death':''),secs:r.secs,hp:r.health&&r.health.endHp,taken:r.health&&r.health.damageTaken,opened:r.opened,left:r.hpLeftPct,falls:r.falls,hitBy:r.hitBy,modes:r.modes,skipped:r.skipped}));})()`, 900000);
    rows.push(...r);
    console.log(JSON.stringify(r));
  }
  const wins = rows.filter(r => r.out === 'win').length;
  const secs = rows.filter(r => r.out === 'win').map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ runs: rows.length, wins, pct: Math.round(100 * wins / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null, band: '60-75%',
    openedAvg: +(rows.reduce((a, r) => a + (r.opened || 0), 0) / Math.max(1, rows.length)).toFixed(1), byHero:
    Object.fromEntries([...new Set(rows.map(r => r.h))].map(h => [h, rows.filter(r => r.h === h && r.out === 'win').length + '/' + rows.filter(r => r.h === h).length])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
