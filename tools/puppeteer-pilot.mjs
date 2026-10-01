// tools/puppeteer-pilot.mjs [salts=1] [heroes=knight,warden,pyro] [level=theatre] - THE PUPPETEER (src/puppeteer.js) at NORMAL health, one pass per salt
// (bossLab pins its dice per row; docs/INTEGRATOR.md section 6). One life per fight, no refills. Prints a row a fight (outcome, seconds, health left, his
// health left, the phase reached, how many strings were cut, how often he came down / re-strung in the loft / fell with his masterpiece, how often the
// batten was ridden, what did the damage) and a summary against the house band (60-75% wins, median win 90-150 s). Not in the suite: it is too long.
// The level defaults to the theatre (his main stage is its end).
import { openPage } from './cdp.mjs';
const salts = (process.argv[2] || '1').split(',').map(Number);
const heroes = (process.argv[3] || 'knight,warden,pyro').split(',');
const level = process.argv[4] || 'theatre';
const pg = await openPage({ audio: false, fonts: false }), rows = [];
try {
  for (const salt of salts) { await pg.reload();
    const r = await pg.evalp(`(async()=>{BK.manualSimulation=true;const phases={},ns={},at={};
      const o=await BK.bossLab({bosses:[${JSON.stringify(level)}],heroes:${JSON.stringify(heroes)},healthMode:'normal',maxSecs:360,modes:true,salt:${salt},onFrame:({boss,h,f})=>{if((boss.phase||1)>(phases[h]||1)){at[h]=(at[h]||[]).concat(Math.round(f/6)/10);}phases[h]=Math.max(phases[h]||1,boss.phase||1);const sh=BK.puppeteerHands().show();if(sh)ns[h]={bossHp:Math.round(boss.hp)+'/'+boss.maxHp,cyc:sh.cycle,n:{...sh.n},hurt:{...(sh.hurt||{})}};}});
      return o.rows.map(r=>({h:r.h,salt:${salt},out:r.outcome||r.skipped,secs:r.secs,taken:r.health&&Math.round(r.health.damageTaken),left:r.hpLeftPct,bossLeft:r.bossHpLeftPct??r.bossLeft,phase:phases[r.h],phaseAt:at[r.h],n:ns[r.h],hitBy:r.hitBy}));})()`, 3600000);
    for (const x of r) console.log(JSON.stringify(x)); rows.push(...r); }
  const wins = rows.filter(r => r.out === 'win'), secs = wins.map(r => r.secs).sort((a, b) => a - b);
  console.log(JSON.stringify({ boss: 'puppeteer', fights: rows.length, wins: wins.length, pct: Math.round(100 * wins.length / Math.max(1, rows.length)), medianWin: secs.length ? secs[secs.length >> 1] : null }));
  console.log('errors', JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
