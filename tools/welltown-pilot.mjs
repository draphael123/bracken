// tools/welltown-pilot.mjs [salts=1] [heroes=knight,warden,pyro] - THE BANDIT KING (src/bandit-king.js) at NORMAL health, one pass per salt (bossLab pins
// its dice per row; docs/INTEGRATOR.md section 6). One life per fight, no refills; the bot is the HUMAN one (src/bandit-king.js PLAN: a quarter-second
// late, it misreads some tells and lets some burns go). Prints a row a fight (outcome, seconds, health lost, his health left, the phase reached, his
// cycles, his openings, the pours and the wasted ones) and a summary against the house band (60-75% wins). Not in the suite: it is too long.
//   node tools/welltown-pilot.mjs 1,2,3,4,5,6,7 knight,warden,pyro      (21 fights)
import { openPage } from './cdp.mjs';
const salts = (process.argv[2] || '1').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const phases={},ns={};
      const o=await BK.bossLab({bosses:['welltown'],heroes:${JSON.stringify(heroes)},healthMode:'normal',maxSecs:300,modes:true,salt:${salt},onFrame:({boss,h})=>{phases[h]=Math.max(phases[h]||1,boss.phase||1);const k=BK.banditKing();if(k)ns[h]={cyc:k.cycle,n:k.n};}});
      return o.rows.map(r=>{const q=ns[r.h]||{n:{}};return {h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),bossLeft:r.hpLeftPct,phase:phases[r.h],cycles:q.cyc,
        opens:q.n.opens,pours:q.n.pours,wasted:q.n.wasted,jars:q.n.jars,burns:q.n.burns,hitBy:r.hitBy};});})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: 'banditking', fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    byHero: Object.fromEntries(heroes.map(h => [h, rows.filter(r => r.h === h && r.out === 'win').length + '/' + rows.filter(r => r.h === h).length])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
