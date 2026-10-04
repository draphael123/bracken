// tools/welltown-pilot.mjs [salts=1] [heroes=knight,warden,pyro] [--mini] - THE CISTERN QUEEN (src/cistern-queen.js; or with --mini THE GANG LEADER,
// src/gang-leader.js) at NORMAL health, one pass per salt (bossLab pins its dice per row). One life per fight, no refills; the bot is the HUMAN one
// (cistern-queen.js / gang-leader.js PLAN: a quarter-second late, it misreads some tells and lets some openings go), the hero at the level's campaign
// depth with no skills (as tools/combat-pilots.mjs). Prints a row a fight (outcome, seconds, health lost, her health left, the phase reached, her
// openings by kind, what hurt) and a summary against the band (Daniel 10-02: new bosses 50-60%; minis ~60-70%). Not in the suite: it is too long.
//   node tools/welltown-pilot.mjs 1,2,3,4 knight,warden,pyro          (12 fights)
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
const args = process.argv.slice(2).filter(a => !a.startsWith('--')), MINI = process.argv.includes('--mini');
const salts = (args[0] || '1').split(',').map(Number), heroes = (args[1] || 'knight,warden,pyro').split(',');
const lvl = Math.max(1, depthsOf(LEVELS).welltown ?? 1);
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) for (const h of heroes) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const {xpFloor}=await import('/src/xp.js');const P0=BKT.PROG;BKT.setHeroLevel(${JSON.stringify(h)},${lvl});P0.skillOwned[${JSON.stringify(h)}]={};P0.loadouts[${JSON.stringify(h)}]=[];if(P0.talents)P0.talents[${JSON.stringify(h)}]={};
      let ph=1,last=null;const o=await BK.bossLab({bosses:['welltown'],heroes:[${JSON.stringify(h)}],healthMode:'normal',maxSecs:300,modes:true,salt:${salt}${MINI ? ',mini:true' : ''},onFrame:({boss})=>{ph=Math.max(ph,boss.phase||1);last=${MINI ? 'BK.gangLeader()' : '(BK.djinn()||BK.cisternQueen())'};}});
      const r=o.rows[0]||{};return {h:${JSON.stringify(h)},salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),bossLeft:r.hpLeftPct,phase:ph,n:last&&last.n,hurt:last&&last.hurt};})()`, 3600000);
    console.log(JSON.stringify(r)); rows.push(r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: MINI ? 'gangleader' : 'djinn', fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null,
    byHero: Object.fromEntries(heroes.map(h => [h, rows.filter(r => r.h === h && r.out === 'win').length + '/' + rows.filter(r => r.h === h).length])) }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
