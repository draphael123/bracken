// tools/greenteeth-pilot.mjs [salts=1] [heroes=knight,warden,pyro] [level=greenlock] - JENNY GREENTEETH (src/jenny-greenteeth.js) at NORMAL health,
// one pass per salt (bossLab pins its dice per row; docs/INTEGRATOR.md section 6). One life per fight, no refills; the bot is the HUMAN one
// (src/jenny-greenteeth.js PLAN: a quarter-second late, and it misses some). Prints a row a fight (outcome, seconds, health lost, her health left,
// the phase reached, the cycles, her openings - stranded, thrown out, the big one - and what did the damage) and a summary against the house band
// (60-75% wins, median win 90-150 s). Not in the suite: it is too long. The level defaults to the standalone lock; once THE FOG CANAL holds her,
// pass its id.
import { openPage } from './cdp.mjs';
const salts = (process.argv[2] || '1').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const level = process.argv[4] || 'greenlock';
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const phases={},ns={};
      const o=await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:${JSON.stringify(heroes)},healthMode:'normal',maxSecs:360,modes:true,salt:${salt},onFrame:({boss,h})=>{phases[h]=Math.max(phases[h]||1,boss.phase||1);const g=BK.greenteeth();if(g)ns[h]={cyc:g.cycle,n:g.n,hurt:g.hurt};}});
      return o.rows.map(r=>{const q=ns[r.h]||{n:{}};return {h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),bossLeft:r.hpLeftPct,phase:phases[r.h],cycles:q.cyc,
        strand:q.n.strand,flush:q.n.flush,big:q.n.big,drains:q.n.drain,shut:q.n.shut,held:q.n.held,hurt:q.hurt};});})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: 'greenteeth', fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
