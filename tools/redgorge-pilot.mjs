// tools/redgorge-pilot.mjs [salts=1] [heroes=knight,warden,pyro] [--l1] - THE GREAT RED CRAB (src/gorge-crab.js) at NORMAL health, one pass per salt (bossLab
// pins its dice per row; docs/INTEGRATOR.md section 6). One life per fight, no refills; the bot is the HUMAN one (src/gorge-crab.js PLAN: a quarter-second late,
// it misreads some tells and is late to some releases). The hero is the level the campaign expects at THE RED GORGE (its depth on the gate chain, no skills -
// as tools/combat-pilots.mjs). Prints a row a fight (outcome, seconds, health lost, his health left, the phase reached, his cycles, his openings, the releases
// and the wasted ones) and a summary against the house band (60-75% wins). Not in the suite: it is too long.
//   node tools/redgorge-pilot.mjs 1,2,3,4,5,6,7 knight,warden,pyro      (21 fights)
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const salts = (process.argv[2] || '1').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const lvl = Math.max(1, depthsOf(LEVELS).redgorge ?? 1);
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) for (const h of heroes) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG,h=${JSON.stringify(h)};P0.xp[h]=xpFloor(${lvl});P0.skillOwned[h]={};P0.loadouts[h]=[];if(P0.talents)P0.talents[h]={};
      const phases={},ns={};
      const o=await BK.bossLab({bosses:['redgorge'],heroes:[h],healthMode:'normal',maxSecs:300,modes:true,salt:${salt},onFrame:({boss,h})=>{phases[h]=Math.max(phases[h]||1,boss.phase||1);const k=BK.gorgeCrab();if(k)ns[h]={cyc:k.cycle,n:k.n};}});
      return o.rows.map(r=>{const q=ns[r.h]||{n:{}};return {h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),bossLeft:r.hpLeftPct,phase:phases[r.h],cycles:q.cyc,
        opens:q.n.opens,releases:q.n.releases,wasted:q.n.wasted,scuttles:q.n.scuttles,hitBy:r.hitBy};});})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: 'gorgecrab', heroLevel: lvl, fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    byHero: Object.fromEntries(heroes.map(h => [h, rows.filter(r => r.h === h && r.out === 'win').length + '/' + rows.filter(r => r.h === h).length])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
