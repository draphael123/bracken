// tools/abbot-pilot.mjs [passes] — THE FALSE ABBOT at NORMAL health, six heroes x passes, seeded (the winchmaster pilot's
// shape). The band is 60-75% wins over 21+ runs (docs/briefs/false-abbot.md), so 4 passes is the least that means anything.
// The lab's hands play his fight as it is built (src/lab.js, the `abbot` branch): guard the chain, hop the procession, cut
// the congregation that reaches you, and ring the great bell the moment he is under it. `opened` is how many times he was
// opened (DOWNED by the bell). HIS OLD 38% WAS MEASURED THROUGH THE BURN-WARD BUG (docs/AGENT-HANDOFF.md) AND IS NOT A BASELINE.
// Its port is this checkout's own (tools/ports.mjs), so another worktree's pilot is never the page measured.
// usage: node tools/abbot-pilot.mjs 4
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';
const passes = +(process.argv[2] || 4);
const pg = await openPage({ port: portFor(6), audio: false, fonts: false });
const rows = [];
try {
  for (let p = 0; p < passes; p++) {
    await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;let seed=${5200 + p * 97};
      Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
      const o=await BK.bossLab({bosses:['spire'],healthMode:'normal',maxSecs:300,modes:true});
      return o.rows.map(r=>({h:r.h,out:r.outcome||(r.won?'win':r.dead?'death':''),secs:r.secs,hp:r.health&&r.health.endHp,taken:r.health&&r.health.damageTaken,left:r.hpLeftPct,hitBy:r.hitBy,opened:r.opened,modes:r.modes&&r.modes.downed,skipped:r.skipped}));})()`, 1800000);
    rows.push(...r);
    console.log(JSON.stringify(r));
  }
  const wins = rows.filter(r => r.out === 'win').length;
  const secs = rows.filter(r => r.out === 'win').map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ runs: rows.length, wins, pct: Math.round(100 * wins / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null, band: '60-75%', byHero:
    Object.fromEntries([...new Set(rows.map(r => r.h))].map(h => [h, rows.filter(r => r.h === h && r.out === 'win').length + '/' + rows.filter(r => r.h === h).length])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
